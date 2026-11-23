import { Outlet, useLocation } from 'react-router'
import { useFx } from '../fx/useFx.ts'
import { Header } from './Header.tsx'
import { LocalBar } from './LocalBar.tsx'
import { PromoBar } from './PromoBar.tsx'
import { SiteFooter } from './ContactSection.tsx'
import { RouteFocus } from './RouteFocus.tsx'
import { SkipLink } from './SkipLink.tsx'

export function Layout() {
  const { pathname } = useLocation()
  useFx()
  return (
    <>
      <SkipLink />
      <Header />
      {pathname === '/' && <LocalBar />}
      <PromoBar />
      <main id="contenu" tabIndex={-1}>
        <Outlet />
      </main>
      {/* Sur /contact, la page porte déjà les coordonnées : le pied de page se limite à la navigation. */}
      <SiteFooter compact={pathname === '/contact'} />
      <RouteFocus />
    </>
  )
}
