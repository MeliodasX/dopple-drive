import { Webhook } from 'svix'
import { headers } from 'next/headers'
import { WebhookEvent } from '@clerk/nextjs/server'

const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET!

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

  try {
    switch (eventType) {
      case 'user.created':
        console.log('user.created', evt.data)
        break

      case 'user.updated':
        console.log('user.updated', evt.data)
        break

      case 'user.deleted':
        const { id: deletedClerkUserId } = evt.data
        console.log('user.deleted', evt.data)
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