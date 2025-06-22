import { Sidebar, SidebarContent } from '@/components/ui/sidebar'
import { DoppleLogo } from '@/components/dopple-logo'
import AddButton from '@/components/add-button'

export function AppSidebar() {
  return (
    <Sidebar>
      <SidebarContent className="mx-2 mt-2">
        <DoppleLogo size={'medium'} />
        <AddButton />
      </SidebarContent>
    </Sidebar>
  )
}
