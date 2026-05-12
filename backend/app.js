const express = require('express');
const asyncHandler = require('express-async-handler');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const AppError = require('./utils/appError');
const globalErrorHandler = require("./middleware/errorController");
const authRouter = require('./router/authRouter');
const commonRouter = require('./router/commonRouter');
const navbarRouter = require('./router/NavbarRouter');
const dashboardRouter = require('./router/dashboardRouter');
const updataMasterDataRouter = require('./router/upDataMasterDataRouter');
const GeneralGetSqlOperationRouter = require('./router/GeneralGetSqlOperationRouter');
const adminOperationRouter = require('./router/adminOperationRouter');
const dataBackupRouter = require('./router/dataBackupRouter');
const adminSqlRouter = require('./router/adminSqlRouter');

const redisRouter = require('./router/redisRouter');
require("dotenv").config({ path: `${process.cwd()}/.env`});
const sequelize = require('./config/database');




//require("dotenv").config();
//const dotenv = require('dotenv');
const app = express();
const port = process.env.APP_PORT || 5000;

// Trust proxy - Important for getting real client IP when behind proxy/nginx
app.set('trust proxy', true);

app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));
app.use(cookieParser());

app.use(session({
    secret: process.env.SESSION_SECRET || 'your-secret-key-here',
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production', // true behind nginx HTTPS
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 60 * 24 // 24 hours
    }
}));

const ALLOWED_ORIGINS = [
    'http://localhost:5173',
    'http://localhost:3000',
   // 'https://dems.srmist.edu.in',
    //process.env.CLIENT_URL,               // https://osms.svnimging.com
].filter(Boolean);

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || ALLOWED_ORIGINS.includes(origin)) return callback(null, true);
        callback(new Error(`CORS blocked: ${origin}`));
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'x-current-route'],
    credentials: true,
    maxAge: 86400,                         // cache preflight for 24 h
}));

// Serve static files from sample-files folder
app.use('/sample-files', express.static(path.join(__dirname, 'sample-files')));

//router.route('/login', authRouter);
app.use('/api/auth', authRouter);
app.use('/api/navbar', navbarRouter)
app.use('/api/common', commonRouter);
app.use('/api/dashboard', dashboardRouter);
app.use('/api/updata_master_data', updataMasterDataRouter);
app.use('/api/general', GeneralGetSqlOperationRouter);
app.use('/api/redis', redisRouter);
app.use('/api/admin', adminOperationRouter);
app.use('/api/data-backup', dataBackupRouter);
app.use('/api/admin-sql', adminSqlRouter);


app.use(asyncHandler(async (req, res, next) => {
    throw new AppError(`Page Not Found ${req.originalUrl}`, 404);
}));

app.use(globalErrorHandler);
// app.get('/', (req, res) => {
//   res.send('Hello World New World');
// });

const server = app.listen(port, () => {
});

// Allow long-running requests (large Excel uploads / batch DB checks)
server.timeout          = 300000; // 5 minutes
server.keepAliveTimeout = 310000; // slightly above timeout