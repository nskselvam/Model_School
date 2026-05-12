# Idle Timeout Auto-Logout Feature

## Overview
This feature automatically logs out users after 2 minutes of inactivity with a 30-second warning countdown.

## Components

### 1. useIdleTimeout Hook
**Location:** `/frontend/src/hooks/useIdleTimeout.js`

Custom React hook that monitors user activity and triggers logout after idle time.

**Features:**
- ✅ Tracks mouse, keyboard, touch, and scroll events
- ✅ 2-minute idle timeout (configurable)
- ✅ 30-second warning countdown
- ✅ Automatic cleanup on unmount
- ✅ Can be enabled/disabled

**Usage:**
```javascript
import useIdleTimeout from '../hooks/useIdleTimeout';

const { showWarning, remainingTime, resetTimer } = useIdleTimeout({
  idleTimeout: 120000,  // 2 minutes in ms
  warningTime: 30000,   // 30 seconds in ms
  enabled: true         // Enable/disable
});
```

**Returns:**
- `showWarning` (boolean) - Whether to display warning modal
- `remainingTime` (number) - Seconds remaining before logout
- `resetTimer` (function) - Manually reset the idle timer

### 2. IdleTimeoutWarning Component
**Location:** `/frontend/src/components/IdleTimeoutWarning/IdleTimeoutWarning.jsx`

Beautiful modal that displays the timeout warning with countdown.

**Features:**
- ✅ Animated countdown display
- ✅ Color-coded progress bar (green → yellow → red)
- ✅ Visual pulse animation
- ✅ "Stay Logged In" button to reset timer
- ✅ Responsive design

**Props:**
- `show` (boolean) - Show/hide modal
- `remainingTime` (number) - Seconds remaining
- `onStayLoggedIn` (function) - Callback when user clicks button

### 3. IdleTimeoutManager Component
**Location:** `/frontend/src/components/IdleTimeoutManager/IdleTimeoutManager.jsx`

Wrapper component that integrates idle timeout with Redux auth state.

**Features:**
- ✅ Only active when user is logged in
- ✅ Automatically enables/disables based on auth state
- ✅ Integrates with existing logout system

## How It Works

### Activity Tracking
The hook monitors these user events:
- Mouse movements (`mousemove`)
- Mouse clicks (`mousedown`, `click`)
- Keyboard input (`keypress`)
- Scrolling (`scroll`)
- Touch events (`touchstart`)

### Timeline
```
User Activity
     ↓
   Timer Starts
     ↓
   ... idle for 1 min 30 sec ...
     ↓
   Warning Modal Appears (30 seconds remaining)
     ↓
   Countdown: 30, 29, 28, 27...
     ↓
   User can click "Stay Logged In" to reset
     ↓
   OR
     ↓
   Countdown reaches 0
     ↓
   Auto Logout + Redirect to Login
```

## Configuration

### Changing Timeout Duration

Edit `/frontend/src/components/IdleTimeoutManager/IdleTimeoutManager.jsx`:

```javascript
const { showWarning, remainingTime, resetTimer } = useIdleTimeout({
  idleTimeout: 120000, // Change this (in milliseconds)
  warningTime: 30000,  // Change warning time (in milliseconds)
  enabled: isLoggedIn
});
```

**Examples:**
- 5 minutes: `idleTimeout: 300000`
- 10 minutes: `idleTimeout: 600000`
- 1 minute warning: `warningTime: 60000`

### Disabling for Specific Users/Roles

Modify the `enabled` prop in IdleTimeoutManager:

```javascript
const isLoggedIn = !!userInfo;
const isAdminOrExempt = userInfo?.role === 'admin' || userInfo?.exempt;

const { showWarning, remainingTime, resetTimer } = useIdleTimeout({
  idleTimeout: 120000,
  warningTime: 30000,
  enabled: isLoggedIn && !isAdminOrExempt // Disable for admins
});
```

## Installation

All components are already integrated into the main App component:

**In `/frontend/src/App.jsx`:**
```javascript
import IdleTimeoutManager from './components/IdleTimeoutManager/IdleTimeoutManager.jsx';

const App = () => {
  return (
    <>
      <NetworkStatus />
      <IdleTimeoutManager /> {/* ← Auto-logout feature */}
      <AppRouter />
      <ToastContainer />
    </>
  )
}
```

## Testing

### Manual Testing Steps:

1. **Login to Application**
   - Open application and login with valid credentials

2. **Test Idle Timeout**
   - Stop interacting with the page (don't move mouse or type)
   - After 1 minute 30 seconds, warning modal should appear
   - Countdown should start from 30 seconds

3. **Test "Stay Logged In"**
   - Click "Stay Logged In" button
   - Modal should close
   - Timer should reset

4. **Test Auto Logout**
   - Let warning countdown reach 0
   - Should automatically logout
   - Should redirect to login page
   - Should clear all session data

5. **Test Activity Detection**
   - Move mouse → timer resets
   - Type on keyboard → timer resets
   - Scroll page → timer resets
   - Click anywhere → timer resets

### Debugging

Enable console logging in `useIdleTimeout.js`:

```javascript
// Add to resetTimer function
const resetTimer = useCallback(() => {
  if (!enabled) return;
  
  console.log('Timer reset at:', new Date().toLocaleTimeString());
  // ... rest of code
}, [enabled, ...]);
```

## Styling

### Customizing Warning Modal

Edit `/frontend/src/components/IdleTimeoutWarning/IdleTimeoutWarning.css`

**Change Colors:**
```css
.idle-timeout-header {
  /* Change header gradient */
  background: linear-gradient(135deg, #your-color 0%, #your-color 100%);
}

.stay-logged-in-btn {
  /* Change button color */
  background: linear-gradient(135deg, #your-color 0%, #your-color 100%);
}
```

**Change Modal Size:**
```css
.idle-timeout-modal .modal-dialog {
  max-width: 500px; /* Adjust width */
}
```

## Security Considerations

1. **Session Management**: Works in conjunction with server-side session timeout
2. **Token Expiration**: Complements JWT token expiration
3. **Multi-Tab Support**: Each tab has independent timer (intentional for security)
4. **No Bypass**: Modal cannot be closed without resetting timer or logging out

## Browser Compatibility

- ✅ Chrome/Edge (latest)
- ✅ Firefox (latest)
- ✅ Safari (latest)
- ✅ Mobile browsers (iOS Safari, Chrome Mobile)

## Performance

- **CPU Impact**: Minimal - uses passive event listeners
- **Memory Impact**: < 1MB
- **Event Throttling**: Built-in via React's event handling

## Troubleshooting

### Modal doesn't appear after idle time
**Solution:**
1. Check if user is logged in (`userInfo` exists in Redux)
2. Check browser console for errors
3. Verify `enabled` prop is `true`

### Timer resets too frequently
**Solution:**
- This is expected behavior for security
- Any activity resets the timer
- Adjust sensitivity by removing specific events from the events array

### Modal appears immediately on login
**Solution:**
- Clear the timers on component unmount
- Check that `lastActivityRef` is properly initialized

### Progress bar color not changing
**Solution:**
- Check that `getProgressVariant()` function is working
- Verify Bootstrap is properly imported

## Future Enhancements

Potential improvements:
- [ ] Add "Remember Me" option to extend timeout
- [ ] Server-side activity tracking
- [ ] Multi-tab synchronization
- [ ] Customizable timeout per user role
- [ ] Activity history logging
- [ ] Warning sound/notification

## Related Files

```
frontend/src/
├── hooks/
│   ├── useIdleTimeout.js          # Main idle timeout hook
│   └── useLogout.js                # Logout functionality
├── components/
│   ├── IdleTimeoutWarning/
│   │   ├── IdleTimeoutWarning.jsx  # Warning modal component
│   │   └── IdleTimeoutWarning.css  # Modal styles
│   └── IdleTimeoutManager/
│       └── IdleTimeoutManager.jsx  # Integration wrapper
└── App.jsx                          # App integration
```

## Support

For issues or questions:
1. Check this documentation
2. Review console logs
3. Test with different timeout values
4. Verify Redux auth state is correct
