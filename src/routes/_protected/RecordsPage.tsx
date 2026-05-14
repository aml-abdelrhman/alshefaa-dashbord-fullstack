import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_protected/RecordsPage')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_protected/RecordsPage"!</div>
}
