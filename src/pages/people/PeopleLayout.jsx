import { NavLink, Outlet } from 'react-router'
import { loadPersonDetail } from '../../routes/lazyRoutes.js'
import './people.css'

const navLinkClassName = ({ isActive }) => (isActive ? 'active-link' : 'link')

/**
 * Intent-based preload (Ex1.1 · T15): start downloading the PersonDetail chunk
 * on hover/focus so the lazy route usually resolves without a skeleton.
 * The browser caches the module, so repeat calls cost nothing. A failed
 * preload is ignored on purpose (no unhandled rejection): navigation retries
 * the import and surfaces any error there (contract Decision D1).
 */
async function preloadPersonDetail() {
  try {
    await loadPersonDetail()
  } catch {
    // Preloading is an optimisation only.
  }
}

/**
 * Master list of player dossiers with a nested detail outlet.
 * Uses <section> (not <main>): AppLayout owns the single <main> (Decision D1).
 *
 * @param {{ people: ReadonlyArray<import('../../data/people.js').Person> }} props
 */
export default function PeopleLayout({ people }) {
  return (
    <section className="people-frame">
      <nav aria-label="Player dossiers">
        <ul>
          {people.map((person) => (
            <li key={person.id}>
              <NavLink
                to={`/people/${person.id}`}
                className={navLinkClassName}
                onPointerEnter={preloadPersonDetail}
                onFocus={preloadPersonDetail}
              >
                {person.name}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>

      <section className="content-area">
        <Outlet />
      </section>
    </section>
  )
}
