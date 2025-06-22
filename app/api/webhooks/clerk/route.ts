import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { DeletedObjectJSON, UserJSON, WebhookEvent } from '@clerk/nextjs/server'
import { db } from '@/db'
import { users } from '@/db/schema'
import { eq } from 'drizzle-orm'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

const handleUserCreation = async (data: UserJSON) => {
  const { id: clerkUserId, email_addresses, username } = data
  const email = email_addresses[0]?.email_address

  // NOTE@(MeliodasX): There should be an alarm of some kind to notify if a non-conforming event is received (username and email are enforced in Clerk settings)
  if (!email || !username) {
    console.error(`User created event for ${clerkUserId} has no primary email address or username.`)
    return new Response('Warning: User created without primary email or username', { status: 200 })
  }

  await db.insert(users).values({
    clerkId: clerkUserId,
    email,
    username
  })
}

const handleUserUpdate = async (data: UserJSON) => {
  const { id: clerkUserId, email_addresses: updatedEmails, username } = data
  const updatedEmail = updatedEmails[0]?.email_address

  // NOTE@(MeliodasX): There should be an alarm of some kind to notify if a non-conforming event is received (username and email are enforced in Clerk settings)
  if (!updatedEmail || !username) {
    console.error(`User updated event for ${clerkUserId} has no primary email address or username.`)
    return new Response('Warning: User updated without primary email or username', { status: 200 })
  }

  await db.update(users)
    .set({
      email: updatedEmail,
      username,
      updatedAt: new Date()
    })
    .where(eq(users.clerkId, clerkUserId))
}

const handleUserDelete = async (data: DeletedObjectJSON) => {
  const { id: clerkUserId } = data

  // NOTE@(MeliodasX): There should be an alarm of some kind to notify if a non-conforming event is received
  if (!clerkUserId) {
    console.error(`User deleted event received with no clerkId for user.`)
    return new Response('Warning: User deleted without sending clerkId for user', { status: 200 })
  }

  await db.update(users)
    .set({
      deletedAt: new Date()
    })
    .where(eq(users.clerkId, clerkUserId))
}

export async function POST(req: Request) {
  if (!WEBHOOK_SECRET) {
    throw new Error('Please add CLERK_WEBHOOK_SECRET from Clerk Dashboard')
  }

  const headerPayload = await headers()
  const svix_id = headerPayload.get('svix-id')
  const svix_timestamp = headerPayload.get('svix-timestamp')
  const svix_signature = headerPayload.get('svix-signature')

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Error: No Svix headers', { status: 400 })
  }

  const payload = await req.json()
  const body = JSON.stringify(payload)
  const wh = new Webhook(WEBHOOK_SECRET)

  let evt: WebhookEvent

  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature
    }) as WebhookEvent
  } catch (err) {
    console.error('Webhook verification failed:', err)
    return new Response('Error: Invalid signature', { status: 400 })
  }

  const eventType = evt.type

  console.log(evt.data)

  try {
    switch (eventType) {
      case 'user.created':
        await handleUserCreation(evt.data)
        break

      case 'user.updated':
        await handleUserUpdate(evt.data)
        break

      case 'user.deleted':
        await handleUserDelete(evt.data)
        break

      default:
        console.log(`Unhandled event type: ${eventType}`)
        return new Response('Unhandled event type', { status: 200 })
    }
  } catch (error) {
    console.error('Database operation failed for webhook event:', error)
    return new Response('Internal Server Error processing webhook', { status: 500 })
  }

  return new Response('Webhook received', { status: 200 })
}