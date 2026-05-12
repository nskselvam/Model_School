import React from 'react'
import { Outlet } from 'react-router-dom'

const IPCheckWrapper = () => {
  // Simplified wrapper - no IP restriction check
  return <Outlet />
}

export default IPCheckWrapper
