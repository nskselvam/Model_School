# PDF Worker Deployment Fix

## Problem
The error "Failed to load PDF: Setting up fake worker failed: error loading dynamically imported module: https://osms.svnimaging.com/pdf.worker.min.mjs" occurs because the PDF worker file is not accessible on your production server.

## Solution Steps

### 1. **Ensure pdf.worker.min.mjs is in the public folder** ✅
- Location: `frontend/public/pdf.worker.min.mjs`
- This file should already exist

### 2. **Build the application**
```bash
cd frontend
npm run build
```

### 3. **Deploy the dist folder**
After building, your `dist` folder should contain:
- `index.html`
- `assets/` folder with JS/CSS
- **`pdf.worker.min.mjs`** (MUST be in the root of dist, not in assets)

### 4. **Server Configuration**

#### **For Apache (.htaccess)**
Add to your `.htaccess` file:
```apache
# Allow .mjs files
<FilesMatch "\.mjs$">
  Header set Content-Type "application/javascript"
  Header set Access-Control-Allow-Origin "*"
</FilesMatch>

# Enable CORS for worker files
<FilesMatch "pdf\.worker\.min\.mjs$">
  Header set Access-Control-Allow-Origin "*"
  Header set Access-Control-Allow-Methods "GET, OPTIONS"
</FilesMatch>
```

#### **For Nginx**
Add to your nginx configuration:
```nginx
location ~* \.mjs$ {
    add_header Content-Type application/javascript;
    add_header Access-Control-Allow-Origin *;
    add_header Cache-Control "public, max-age=31536000";
}

location = /pdf.worker.min.mjs {
    add_header Content-Type application/javascript;
    add_header Access-Control-Allow-Origin *;
}
```

### 5. **Verify Deployment**
After deployment, test by visiting:
- `https://osms.svnimaging.com/pdf.worker.min.mjs`

You should see the JavaScript worker code (not a 404 error).

### 6. **Check MIME Type**
The file MUST be served with the correct MIME type:
- Content-Type: `application/javascript` or `text/javascript`

### 7. **Fallback to CDN**
The code now includes automatic CDN fallback. If the local worker fails, it will try:
- `https://cdn.jsdelivr.net/npm/pdfjs-dist@5.4.296/build/pdf.worker.min.mjs`

## Verification Checklist

- [ ] Run `npm run build` in frontend folder
- [ ] Check that `dist/pdf.worker.min.mjs` exists (NOT in assets folder)
- [ ] Upload entire `dist` folder to server
- [ ] Verify `https://osms.svnimaging.com/pdf.worker.min.mjs` is accessible
- [ ] Check browser console for worker loading messages
- [ ] Test PDF loading functionality

## Common Issues

### Issue: Worker file in wrong location
**Problem:** Worker is in `dist/assets/pdf.worker.min.mjs` instead of `dist/pdf.worker.min.mjs`
**Solution:** The updated vite.config.js should fix this

### Issue: 404 Not Found
**Problem:** Server can't find the worker file
**Solution:** 
- Ensure file is uploaded to server root
- Check file permissions (should be readable)

### Issue: MIME Type Error
**Problem:** File served with wrong content type
**Solution:** Configure server as shown above

### Issue: CORS Error
**Problem:** Cross-origin restrictions
**Solution:** Add CORS headers as shown in server configuration

## Testing
1. Open browser DevTools (F12)
2. Go to Console tab
3. Look for: "PDF Worker configured: https://osms.svnimaging.com/pdf.worker.min.mjs"
4. Try loading a PDF
5. Check for any worker-related errors

## Files Changed
- ✅ `frontend/vite.config.js` - Updated build configuration
- ✅ `frontend/src/utils/pdfWorkerSetup.js` - New worker setup utility
- ✅ `frontend/src/components/QuestionPaperShow/QuestionPaperShow.jsx` - Enhanced error handling

## Next Steps
1. Rebuild the frontend: `npm run build`
2. Deploy the new build to your server
3. Verify the worker file is accessible
4. Test PDF loading
