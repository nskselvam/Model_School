# Attendance System Documentation

## Overview
The Attendance System tracks user login activities from the `User_Logs` database table and displays them in an interactive, filterable attendance sheet.

## Features

### 1. **Two View Modes**
- **Daily View**: Shows detailed daily attendance records with login times and activity counts
- **Summary View**: Shows attendance overview across multiple days with present/absent indicators

### 2. **Filtering Options**
- **Date Range**: Select start and end dates to view attendance
- **User Search**: Search for specific users (Daily View only)
- **User Filter**: Filter by specific user in dropdown
- **Real-time Filtering**: Updates immediately when selections change

### 3. **Data Display**

#### Daily View Table Columns:
- User Name
- Date
- Status (Present/Absent)
- Login Time
- Last Activity Time
- Total Activities Count

#### Summary View Table Columns:
- User Name
- Total Present Days
- Individual dates with Present (✓) / Absent (✗) indicators

### 4. **Export Functionality**
- Export to CSV format
- Exports filtered data based on current view
- Filename includes date range

### 5. **Statistics Dashboard**
- Total records count
- Present/Absent counts (Daily View)
- Total days and users count (Summary View)
- Date range display

## Technical Implementation

### Backend API Endpoints

#### 1. Get User Attendance Logs
```
GET /api/common/user-attendance-logs
Query Parameters:
  - startDate (optional): Start date in YYYY-MM-DD format
  - endDate (optional): End date in YYYY-MM-DD format
  - userName (optional): Filter by username
```

**Response:**
```json
{
  "success": true,
  "count": 10,
  "data": [
    {
      "userName": "examiner1",
      "date": "2026-04-06",
      "status": "Present",
      "loginTime": "2026-04-06T09:30:00Z",
      "lastActivity": "2026-04-06T17:45:00Z",
      "activities": [
        {
          "activity": "Login",
          "time": "2026-04-06T09:30:00Z",
          "ip": "192.168.1.1"
        }
      ]
    }
  ],
  "rawLogs": []
}
```

#### 2. Get User Attendance Summary
```
GET /api/common/user-attendance-summary
Query Parameters:
  - startDate (required): Start date in YYYY-MM-DD format
  - endDate (required): End date in YYYY-MM-DD format
```

**Response:**
```json
{
  "success": true,
  "dateRange": ["2026-04-01", "2026-04-06"],
  "data": [
    {
      "userName": "examiner1",
      "totalDays": 5,
      "dates": {
        "2026-04-01": {
          "status": "Present",
          "loginTime": "2026-04-01T09:00:00Z",
          "activityCount": 15
        },
        "2026-04-02": {
          "status": "Absent",
          "loginTime": null,
          "activityCount": 0
        }
      }
    }
  ]
}
```

### Database Schema

**User_Logs Table:**
```
id              INT (Primary Key, Auto Increment)
User_Name       STRING (Username)
User_Acticity   STRING (Activity description)
User_Ip         STRING (IP address)
createdAt       DATE (Timestamp)
updatedAt       DATE (Timestamp)
```

### Frontend Components

**Files Modified/Created:**
1. `/backend/controller/commonController.js` - Added attendance controller methods
2. `/backend/router/commonRouter.js` - Added attendance routes
3. `/frontend/src/redux-slice/generalApiSlice.js` - Added RTK Query endpoints
4. `/frontend/src/pages/Dashboard/Common/AttendanceSheet.jsx` - Main component
5. `/frontend/src/style/AttendanceSheet.css` - Styling
6. `/frontend/src/router/index.jsx` - Route configuration

## Usage Guide

### Accessing the Attendance Sheet
Navigate to: `/admin/examiner-attendance`

### Viewing Daily Attendance
1. Select start and end dates
2. Choose "Daily View" mode
3. Optionally enter username to search
4. Click "Search" button
5. View detailed daily records

### Viewing Attendance Summary
1. Select start and end dates (required)
2. Choose "Summary View" mode
3. Click "Search" button
4. View attendance grid with present/absent indicators

### Filtering by User
1. After initial search, use "Filter by User" dropdown
2. Select specific user or "All Users"
3. Table updates automatically

### Exporting Data
1. Perform a search to load data
2. Apply any filters as needed
3. Click "Export CSV" button
4. CSV file downloads with filename: `attendance_[startDate]_[endDate].csv`

## Attendance Logic

### Determining Present/Absent:
- **Present**: User has at least one entry in User_Logs for that date
- **Absent**: No entries in User_Logs for that date (Summary View only)

### Activity Tracking:
- Each User_Logs entry represents an activity
- Login time is the earliest activity timestamp for the day
- Last activity is the latest activity timestamp for the day
- Activity count shows total number of logged activities

## Features for Future Enhancement

1. **Attendance Percentage**: Calculate attendance percentage per user
2. **Late Login Tracking**: Flag users who login after a certain time
3. **Activity Details Modal**: Click to see detailed activity breakdown
4. **Date Range Presets**: Quick select for "Last 7 days", "This Month", etc.
5. **Excel Export**: Add support for .xlsx format
6. **Print View**: Optimized print layout
7. **Notifications**: Email alerts for attendance patterns
8. **Bulk Operations**: Mark attendance manually for absent days

## Security & Performance

### Authentication:
- All API endpoints protected with `protect` middleware
- Requires valid JWT token

### Performance Optimizations:
- RTK Query caching (60 seconds for attendance data)
- Lazy loading of component
- Memoized filtered data
- Responsive table with horizontal scroll

### Error Handling:
- Displays user-friendly error messages
- Loading states during API calls
- Empty state for no data

## Support & Maintenance

### Common Issues:

**Issue**: No data displayed
- **Solution**: Check date range, ensure User_Logs has data for selected dates

**Issue**: Export not working
- **Solution**: Ensure data is loaded before clicking export

**Issue**: Slow loading
- **Solution**: Reduce date range, especially for Summary View with many users

### Logs:
- Backend logs available in console
- Frontend API errors displayed in alert boxes

## Contact
For issues or feature requests, please contact the development team.
