import { Profiler } from 'react'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import LegacySimpleForm from './LegacySimpleForm.jsx'

// Characterisation test (evidence for T21): measures how many React commits the
// slide-13 useEffect waterfall produces for ONE keystroke. The waterfall only fully
// cascades when the error actually changes, so we type a still-invalid prefix,
// reset the counter, then type the single character that flips invalid → valid.
describe('LegacySimpleForm (slide-13 waterfall)', () => {
  it('cascades one keystroke into several commits', async () => {
    const user = userEvent.setup()
    let commits = 0
    const onRender = () => {
      commits += 1
    }

    render(
      <Profiler id="legacy" onRender={onRender}>
        <LegacySimpleForm />
      </Profiler>,
    )

    const input = screen.getByLabelText('Name')
    await user.type(input, 'ab')
    expect(screen.getByText('Name must be at least 3 characters.')).toBeInTheDocument()

    commits = 0
    await user.type(input, 'c')

    expect(screen.queryByText('Name must be at least 3 characters.')).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Submit' })).toBeEnabled()

    console.info(`[legacy waterfall] commits for one keystroke (invalid → valid): ${commits}`)
    expect(commits).toBeGreaterThanOrEqual(3)
  })
})
