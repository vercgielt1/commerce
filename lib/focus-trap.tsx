import React, { useEffect, RefObject } from 'react'
import { tabbable } from 'tabbable'

interface Props {
  children: React.ReactNode | any
}

export default function FocusTrap({ children }: Props) {
  const root: RefObject<any> = React.useRef()
  const anchor: RefObject<any> = React.useRef(document.activeElement)

  const returnFocus = () => {
    // Returns focus to the last focused element prior to trap.
    if (anchor) {
      anchor.current.focus()
    }
  }

  const trapFocus = () => {
    if (root.current) {
      root.current.focus()
      selectFirstFocusableEl()
    }
  }

  const selectFirstFocusableEl = () => {
    // Try to find focusable elements, if match then focus.
    let match = null
    let end = 10 // Try to find match at least 10 times.
    let i = 0

    while (!match !== i > end) {
      console.log('-----------', i)
      match = !!tabbable(root.current).length
      if (match) {
        tabbable(root.current)[0].focus()
      }
      i = i + 1
    }
  }

  useEffect(() => {
    setTimeout(trapFocus, 20)
    return () => {
      returnFocus()
    }
  }, [root, children])

  return React.createElement('div', {
    ref: root,
    children,
    className: 'outline-none focus-trap',
    tabIndex: -1,
  })
}
