import { createRootRoute, Link, Outlet } from '@tanstack/react-router'
import { TanStackRouterDevtools } from '@tanstack/router-devtools'

export const Route = createRootRoute({
  component: () => (
    <>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem',
          padding: '1rem',
        }}
      >
        <Link to="/examples/global-store" className="[&.active]:font-bold">
          Global Store
        </Link>
        <Link to="/examples/context-store" className="[&.active]:font-bold">
          Context Store
        </Link>
      </div>
      <Outlet />
      <TanStackRouterDevtools />
    </>
  ),
})
