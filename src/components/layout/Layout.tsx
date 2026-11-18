import { Outlet, useLocation } from 'react-router'
import { Header } from './Header.tsx'
import { ContactSection } from './ContactSection.tsx'
import { RouteFocus } from './RouteFocus.tsx'
import { SkipLink } from './SkipLink.tsx'

export function Layout() {
  const { pathname } = useLocation()
  return (
    <>
      <SkipLink />
      <Header />
      <main id="contenu" tabIndex={-1}>
        <div className="axis" aria-hidden="true" />
        <Outlet />
      </main>
      {pathname !== '/contact' ? <ContactSection /> : null}
      <RouteFocus />
    </>
  )
}
