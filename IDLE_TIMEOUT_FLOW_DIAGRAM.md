# Auto-Logout Feature - Visual Flow Diagram

## System Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                          App.jsx                                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           IdleTimeoutManager Component                     │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │         useIdleTimeout Hook                          │ │ │
│  │  │                                                      │ │ │
│  │  │  • Tracks user activity                             │ │ │
│  │  │  • Manages timers                                   │ │ │
│  │  │  • Returns state & functions                        │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  │                          ↓                                 │ │
│  │  ┌──────────────────────────────────────────────────────┐ │ │
│  │  │      IdleTimeoutWarning Modal                        │ │ │
│  │  │                                                      │ │ │
│  │  │  • Shows countdown                                  │ │ │
│  │  │  • "Stay Logged In" button                          │ │ │
│  │  │  • Progress bar                                     │ │ │
│  │  └──────────────────────────────────────────────────────┘ │ │
│  └────────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## State Flow

```
┌──────────────┐
│ User Logs In │
└──────┬───────┘
       │
       ↓
┌──────────────────────┐
│ Check Redux Auth     │
│ userInfo exists?     │
└──────┬───────────────┘
       │
       ↓ YES
┌──────────────────────┐
│ Enable Idle Timeout  │
│ Start Timer (2 min)  │
└──────┬───────────────┘
       │
       ↓
┌──────────────────────┐
│  Monitor Activity    │
│  • Mouse moves       │
│  • Clicks            │
│  • Keyboard          │
│  • Scroll            │
└──────┬───────────────┘
       │
       ↓
    ┌──┴──┐
    │     │
    ↓     ↓
ACTIVITY  NO ACTIVITY
    │     │
    │     ↓
    │  ┌───────────────────┐
    │  │ 90 seconds passed │
    │  └─────────┬─────────┘
    │            │
    │            ↓
    │  ┌─────────────────────┐
    │  │ Show Warning Modal  │
    │  │ Start 30s Countdown │
    │  └─────────┬───────────┘
    │            │
    │            ↓
    │     ┌──────┴──────┐
    │     │             │
    │     ↓             ↓
    │  USER CLICKS   COUNTDOWN
    │  STAY LOGGED   REACHES 0
    │     IN            │
    │     │             ↓
    │     │      ┌──────────────┐
    │     │      │ Auto Logout  │
    │     │      │ Clear State  │
    │     │      │ Redirect     │
    │     │      └──────────────┘
    │     │
    ↓     ↓
┌─────────────────┐
│  Reset Timer    │
│  Close Modal    │
│  Continue Work  │
└─────────────────┘
```

## Event Handling Flow

```
User Activity Event (mouse, keyboard, etc.)
    ↓
┌────────────────────────────┐
│ handleActivity() triggered │
└────────────┬───────────────┘
             │
             ↓
┌────────────────────────────┐
│     resetTimer()           │
│  • Clear existing timers   │
│  • Update lastActivity     │
│  • Set new warning timer   │
│  • Set new logout timer    │
└────────────┬───────────────┘
             │
             ↓
┌────────────────────────────┐
│   Timer continues...       │
└────────────────────────────┘
```

## Component Communication

```
┌──────────────────────────────────────────────────────────────┐
│                         Redux Store                           │
│                    (auth.userInfo)                           │
└────────────────────────┬─────────────────────────────────────┘
                         │
                         ↓ (read)
┌──────────────────────────────────────────────────────────────┐
│              IdleTimeoutManager Component                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  const { userInfo } = useSelector(state => state.auth) │  │
│  │  const isLoggedIn = !!userInfo                         │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                     │
│                         ↓ (pass to hook)                      │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  useIdleTimeout({ enabled: isLoggedIn })              │  │
│  │      ↓                                                 │  │
│  │  Returns: { showWarning, remainingTime, resetTimer }  │  │
│  └────────────────────────────────────────────────────────┘  │
│                         │                                     │
│                         ↓ (pass to modal)                     │
│  ┌────────────────────────────────────────────────────────┐  │
│  │  <IdleTimeoutWarning                                   │  │
│  │    show={showWarning}                                  │  │
│  │    remainingTime={remainingTime}                       │  │
│  │    onStayLoggedIn={resetTimer}                         │  │
│  │  />                                                    │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

## Timeline Diagram

```
Time:     0s        30s       60s       90s       105s      120s
          │─────────│─────────│─────────│─────────│─────────│
          │                              │                   │
          │    User Working              │    Warning        │
          │    Timer Running             │    Modal Shows    │
          │                              │                   │
Activity: ▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓                   │
          │                              │                   │
State:    │     ACTIVE                   │    WARNING        │ LOGOUT
          │                              │                   │
Timer:    │←──── 120s Total ────────────→                   │
          │                              │←── 30s Warning ──→│
          │                              │                   │
Modal:    │         Hidden               │    Visible        │ Hidden
          │                              │  ⏰ Countdown     │ (Redirect)
          │                              │                   │
Action:   │    Any user activity         │  Click "Stay"     │ Auto
          │    resets timer              │  OR let expire    │ Logout
          │                              │                   │
```

## Warning Modal States

```
┌─────────────────────────────────────────────────┐
│          remainingTime: 30s                     │
│                                                 │
│  ╔═══════════════════════════════════════╗     │
│  ║   ⚠️  Session Timeout Warning         ║     │
│  ╠═══════════════════════════════════════╣     │
│  ║                                       ║     │
│  ║        🕐  30 seconds                 ║     │
│  ║            remaining                  ║     │
│  ║                                       ║     │
│  ║  ████████████████░░░░  100%          ║     │
│  ║  (Green progress bar)                ║     │
│  ║                                       ║     │
│  ║  [  Stay Logged In  ]                ║     │
│  ╚═══════════════════════════════════════╝     │
└─────────────────────────────────────────────────┘

↓ Time passes... (20s → 10s)

┌─────────────────────────────────────────────────┐
│          remainingTime: 10s                     │
│                                                 │
│  ╔═══════════════════════════════════════╗     │
│  ║   ⚠️  Session Timeout Warning         ║     │
│  ╠═══════════════════════════════════════╣     │
│  ║                                       ║     │
│  ║        🕐  10 seconds                 ║     │
│  ║            remaining                  ║     │
│  ║                                       ║     │
│  ║  ██████░░░░░░░░░░░░░░  33%           ║     │
│  ║  (Red progress bar - pulsing!)       ║     │
│  ║                                       ║     │
│  ║  [  Stay Logged In  ]                ║     │
│  ╚═══════════════════════════════════════╝     │
└─────────────────────────────────────────────────┘

↓ User clicks button OR timeout reaches 0

┌─────────────────────────────────────────────────┐
│  Modal closes + Timer resets                    │
│           OR                                    │
│  Auto logout + Redirect to /login              │
└─────────────────────────────────────────────────┘
```

## Hook Internal State

```
┌─────────────────────────────────────────────────┐
│         useIdleTimeout Hook State               │
├─────────────────────────────────────────────────┤
│                                                 │
│  State Variables:                               │
│  • showWarning: boolean                        │
│  • remainingTime: number (seconds)             │
│                                                 │
│  Refs:                                         │
│  • timeoutRef: timer for auto-logout          │
│  • warningTimeoutRef: timer for warning       │
│  • countdownIntervalRef: 1s interval          │
│  • lastActivityRef: timestamp                 │
│                                                 │
│  Callbacks:                                    │
│  • clearTimers()                               │
│  • handleLogout()                              │
│  • startCountdown()                            │
│  • resetTimer()                                │
│  • handleActivity()                            │
│                                                 │
│  Event Listeners:                              │
│  • mousedown, mousemove                        │
│  • keypress                                    │
│  • scroll                                      │
│  • touchstart, click                           │
│                                                 │
└─────────────────────────────────────────────────┘
```

## File Dependencies

```
App.jsx
  ↓ imports
IdleTimeoutManager.jsx
  ↓ imports
  ├─→ useIdleTimeout.js
  │     ↓ imports
  │     ├─→ useLogout.js
  │     └─→ react-router-dom
  │
  └─→ IdleTimeoutWarning.jsx
        ↓ imports
        ├─→ IdleTimeoutWarning.css
        └─→ react-bootstrap

Redux Store (auth slice)
  ↑ reads
IdleTimeoutManager.jsx
```

## User Experience Flow

```
┌─────────────────────────────────────────────────┐
│  USER SCENARIO 1: Active User                   │
├─────────────────────────────────────────────────┤
│  1. User logs in                                │
│  2. User actively works (typing, clicking)      │
│  3. Timer constantly resets                     │
│  4. User never sees warning                     │
│  5. User continues working normally             │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  USER SCENARIO 2: User Returns in Time          │
├─────────────────────────────────────────────────┤
│  1. User logs in and starts working            │
│  2. User steps away (gets coffee)               │
│  3. After 90s, warning modal appears            │
│  4. User returns, sees countdown at 15s         │
│  5. User clicks "Stay Logged In"                │
│  6. Modal closes, timer resets                  │
│  7. User continues working                      │
└─────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────┐
│  USER SCENARIO 3: User Away Too Long            │
├─────────────────────────────────────────────────┤
│  1. User logs in                                │
│  2. User steps away for extended time           │
│  3. Warning modal appears (not seen)            │
│  4. Countdown reaches 0                         │
│  5. Auto logout triggered                       │
│  6. User data cleared                           │
│  7. Redirect to login page                      │
│  8. User returns, must login again              │
└─────────────────────────────────────────────────┘
```

## Legend

```
▓  = Active/Working
░  = Idle/Inactive
→  = Flow direction
↓  = Continues to
├  = Branch/Option
└  = End of branch
│  = Connection
⚠️  = Warning
🕐  = Time/Clock
✅  = Success/Complete
❌  = Failure/Error
```
