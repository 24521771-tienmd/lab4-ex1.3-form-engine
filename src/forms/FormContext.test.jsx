import { render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { FormContext, useFormContext } from './FormContext.js'

function Probe({ onValue }) {
  const value = useFormContext()
  onValue(value)
  return <p>probe rendered</p>
}

describe('useFormContext', () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('throws the exact message when used outside <SimpleForm>', () => {
    // React logs the thrown render error; silence it so the test output stays readable.
    vi.spyOn(console, 'error').mockImplementation(() => {})

    expect(() => render(<Probe onValue={() => {}} />)).toThrow(
      new Error('useFormContext must be used inside <SimpleForm>'),
    )
  })

  it('returns the value supplied by FormContext.Provider', () => {
    const contextValue = {
      values: { fullName: 'An' },
      errors: {},
      touched: {},
      submitAttempted: false,
      isValid: true,
      setFieldValue: vi.fn(),
      markTouched: vi.fn(),
    }
    const onValue = vi.fn()

    render(
      <FormContext.Provider value={contextValue}>
        <Probe onValue={onValue} />
      </FormContext.Provider>,
    )

    expect(screen.getByText('probe rendered')).toBeInTheDocument()
    expect(onValue).toHaveBeenLastCalledWith(contextValue)
    expect(onValue.mock.lastCall[0]).toBe(contextValue)
  })
})
