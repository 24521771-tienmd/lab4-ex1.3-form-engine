import { Suspense } from 'react'
import { NavLink, Outlet } from 'react-router'
import PageSkeleton from '../components/skeleton/PageSkeleton.jsx'

const navLinkClassName = ({ isActive }) => (isActive ? 'active-link' : 'link')

export default function AppLayout() {
  return (
    <>
      <header className="site-header">
        <a className="brand" href="#main-content">
          KRAFTON <span aria-hidden="true">×</span> PUBG Vietnam
        </a>
        <nav aria-label="Primary">
          <ul>
            <li>
              <NavLink to="/" end className={navLinkClassName}>
                Arena
              </NavLink>
            </li>
            <li>
              <NavLink to="/people" className={navLinkClassName}>
                People
              </NavLink>
            </li>
            <li>
              <NavLink to="/register" className={navLinkClassName}>
                Register
              </NavLink>
            </li>
          </ul>
        </nav>
      </header>

      <main className="arena-main" id="main-content">
        {/* Only the routed content suspends; header, nav and footer stay mounted (D2). */}
        <Suspense fallback={<PageSkeleton />}>
          <Outlet />
        </Suspense>
      </main>

      <footer className="site-footer">
        <p>KRAFTON x PUBG Vietnam Championship &amp; Airdrop Arena</p>
      </footer>
    </>
  )
}
