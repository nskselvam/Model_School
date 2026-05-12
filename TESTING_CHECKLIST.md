# Auto-Logout Feature - Testing Checklist

## Pre-Testing Setup
- [ ] Application is running (`npm run dev`)
- [ ] Backend is running and accessible
- [ ] You have valid login credentials
- [ ] Browser console is open (F12) for debugging

---

## Test 1: Basic Functionality ✓

### Steps:
1. [ ] Open application in browser
2. [ ] Login with valid credentials
3. [ ] Stop all activity (don't move mouse, don't type)
4. [ ] Wait for 90 seconds
5. [ ] Verify warning modal appears
6. [ ] Observe countdown starting from 30 seconds
7. [ ] Verify progress bar changes color (green → yellow → red)

### Expected Results:
- [ ] Modal appears after 90 seconds
- [ ] Countdown displays correctly (30, 29, 28...)
- [ ] Progress bar animates smoothly
- [ ] Modal cannot be closed by clicking outside

---

## Test 2: "Stay Logged In" Button ✓

### Steps:
1. [ ] Follow Test 1 until modal appears
2. [ ] Click "Stay Logged In" button
3. [ ] Observe modal closes
4. [ ] Resume normal activity
5. [ ] Stop activity again for 90 seconds

### Expected Results:
- [ ] Modal closes immediately
- [ ] Timer resets completely
- [ ] Warning appears again after another 90 seconds
- [ ] No error messages in console

---

## Test 3: Auto-Logout ✓

### Steps:
1. [ ] Follow Test 1 until modal appears
2. [ ] Do NOT click "Stay Logged In"
3. [ ] Let countdown reach 0
4. [ ] Observe what happens

### Expected Results:
- [ ] Countdown reaches 0
- [ ] User is automatically logged out
- [ ] Redirected to login page (`/login`)
- [ ] localStorage is cleared (check in DevTools)
- [ ] Redux state is reset (check Redux DevTools)

---

## Test 4: Activity Detection - Mouse ✓

### Steps:
1. [ ] Login to application
2. [ ] Wait 80 seconds without activity
3. [ ] Move mouse before warning appears
4. [ ] Wait another 80 seconds
5. [ ] Verify timer reset

### Expected Results:
- [ ] Timer resets when mouse moves
- [ ] Warning doesn't appear at original 90s mark
- [ ] Warning appears 90s after last mouse move
- [ ] No modal flashing or glitches

---

## Test 5: Activity Detection - Keyboard ✓

### Steps:
1. [ ] Login to application
2. [ ] Wait 80 seconds
3. [ ] Type something (anywhere with input)
4. [ ] Verify timer resets

### Expected Results:
- [ ] Timer resets on keyboard input
- [ ] Warning delayed by keyboard activity
- [ ] Countdown starts fresh from 90s

---

## Test 6: Activity Detection - Scroll ✓

### Steps:
1. [ ] Login to application
2. [ ] Navigate to a scrollable page
3. [ ] Wait 80 seconds
4. [ ] Scroll the page
5. [ ] Verify timer resets

### Expected Results:
- [ ] Timer resets on scroll
- [ ] Works with mouse wheel scroll
- [ ] Works with trackpad scroll
- [ ] Works with scroll bar drag

---

## Test 7: Multi-Tab Behavior ✓

### Steps:
1. [ ] Login in Tab 1
2. [ ] Open same app in Tab 2 (duplicate tab)
3. [ ] Go idle in both tabs
4. [ ] Observe behavior in each tab

### Expected Results:
- [ ] Each tab has independent timer
- [ ] Warning appears in both tabs (at different times if activity differs)
- [ ] Logout in one tab doesn't affect other
- [ ] Each tab redirects independently

Note: This is intentional security behavior.

---

## Test 8: Login Page Behavior ✓

### Steps:
1. [ ] Navigate to login page (not logged in)
2. [ ] Wait 2+ minutes on login page
3. [ ] Observe that nothing happens

### Expected Results:
- [ ] No warning modal appears
- [ ] No auto-logout (already logged out)
- [ ] Timer only starts after successful login

---

## Test 9: Rapid Activity ✓

### Steps:
1. [ ] Login to application
2. [ ] Continuously move mouse for 3+ minutes
3. [ ] Observe that warning never appears

### Expected Results:
- [ ] Warning modal never appears
- [ ] Timer constantly resets
- [ ] No performance issues
- [ ] No console errors

---

## Test 10: Warning During Active Use ✓

### Steps:
1. [ ] Login to application
2. [ ] Wait for warning modal to appear
3. [ ] While modal is visible, try to:
   - Click outside modal
   - Press Escape key
   - Move mouse around

### Expected Results:
- [ ] Modal stays visible (backdrop="static")
- [ ] Cannot dismiss modal by clicking outside
- [ ] Can only close by clicking "Stay Logged In"
- [ ] Modal is keyboard-accessible

---

## Test 11: Mobile Responsiveness ✓

### Steps:
1. [ ] Open DevTools and toggle device toolbar (Ctrl+Shift+M)
2. [ ] Select mobile device (iPhone, Android)
3. [ ] Login to application
4. [ ] Wait for warning modal
5. [ ] Test touch events

### Expected Results:
- [ ] Modal displays correctly on mobile
- [ ] Text is readable (no overflow)
- [ ] Button is touch-friendly (large enough)
- [ ] Touch events reset timer
- [ ] Countdown is visible and clear

---

## Test 12: Page Navigation ✓

### Steps:
1. [ ] Login to application
2. [ ] Navigate between different pages
3. [ ] On each page, test idle timeout
4. [ ] Verify consistent behavior

### Expected Results:
- [ ] Timer persists across page navigation
- [ ] Warning appears regardless of current page
- [ ] Logout works from any page
- [ ] Redirects to `/login` correctly

---

## Test 13: Logout Before Warning ✓

### Steps:
1. [ ] Login to application
2. [ ] Wait for warning modal to appear
3. [ ] Before countdown ends, manually logout
4. [ ] Observe behavior

### Expected Results:
- [ ] Manual logout works immediately
- [ ] Modal disappears
- [ ] Timers are cleared
- [ ] No errors in console

---

## Test 14: Browser Tab Focus ✓

### Steps:
1. [ ] Login in Tab 1
2. [ ] Switch to different tab/application
3. [ ] Return after 90+ seconds
4. [ ] Observe warning modal

### Expected Results:
- [ ] Timer continues running in background
- [ ] Warning appears even if tab wasn't focused
- [ ] Logout occurs even if tab is inactive

---

## Test 15: Performance Check ✓

### Steps:
1. [ ] Open browser performance tools
2. [ ] Login to application
3. [ ] Let idle timeout cycle complete
4. [ ] Monitor CPU and memory usage

### Expected Results:
- [ ] No memory leaks
- [ ] CPU usage minimal (<1%)
- [ ] No continuous console logging
- [ ] Event listeners properly cleaned up

---

## Test 16: Edge Cases ✓

### Test 16a: Rapid Login/Logout
1. [ ] Login and immediately logout (repeat 5x)
2. [ ] Verify no timer issues

### Test 16b: Network Interruption
1. [ ] Login, disconnect network, wait for warning
2. [ ] Verify modal still appears

### Test 16c: Browser Refresh
1. [ ] Login, wait 45 seconds
2. [ ] Refresh browser (F5)
3. [ ] Verify timer resets after refresh

### Expected Results:
- [ ] No crashes or errors
- [ ] Graceful handling of edge cases
- [ ] Timer behaves predictably

---

## Regression Tests ✓

### Test existing features still work:
1. [ ] Normal login/logout functions correctly
2. [ ] Session management unchanged
3. [ ] Redux state management intact
4. [ ] Navigation works normally
5. [ ] All existing modals work
6. [ ] No styling conflicts

---

## Console Checks

During all tests, verify:
- [ ] No JavaScript errors
- [ ] No React warnings
- [ ] No Redux errors
- [ ] No network errors (except expected logout API call)

---

## Final Verification

- [ ] All 16 tests passed
- [ ] No console errors observed
- [ ] Feature works consistently
- [ ] Performance is acceptable
- [ ] Mobile experience is good
- [ ] No breaking changes to existing features

---

## Known Issues / Notes

Document any issues found:
```
Issue #1: [Description]
Severity: [Low/Medium/High]
Steps to reproduce: [...]
Expected: [...]
Actual: [...]

Issue #2: ...
```

---

## Test Environment

- Browser: __________________
- Version: __________________
- OS: _______________________
- Date Tested: ______________
- Tester: ___________________

---

## Sign-Off

- [ ] All critical tests passed
- [ ] Feature ready for production
- [ ] Documentation is complete
- [ ] Team has been notified

Approved by: ________________  
Date: _______________________
