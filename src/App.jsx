import { lazy, Suspense } from 'react'
import { Route, Routes } from 'react-router'
import PersonDetailSkeleton from './components/skeleton/PersonDetailSkeleton.jsx'
import { people } from './data/people.js'
import AppLayout from './layouts/AppLayout.jsx'
import PeopleIndex from './pages/people/PeopleIndex.jsx'
import {
  loadArenaPage,
  loadNotFoundPage,
  loadPeopleLayout,
  loadPersonDetail,
  loadRegisterPage,
} from './routes/lazyRoutes.js'
import './App.css'

// Module top level: stable lazy components, never re-created per render.
// Route-level chunks suspend into AppLayout's <Suspense> around <Outlet />.
const ArenaPage = lazy(loadArenaPage)
const PeopleLayout = lazy(loadPeopleLayout)
const NotFoundPage = lazy(loadNotFoundPage)
const PersonDetail = lazy(loadPersonDetail)
const RegisterPage = lazy(loadRegisterPage)

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<ArenaPage />} />
        <Route path="people" element={<PeopleLayout people={people} />}>
          <Route index element={<PeopleIndex />} />
          <Route
            path=":id"
            element={
              <Suspense fallback={<PersonDetailSkeleton />}>
                <PersonDetail people={people} />
              </Suspense>
            }
          />
        </Route>
        <Route path="register" element={<RegisterPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  )
}
