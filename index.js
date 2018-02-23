'use strict';

const Transom = require('@transomjs/transom-core');
const transomSmtp = require('@transomjs/transom-smtp');

const transom = new Transom();

// ****************************************************************************
// This sample app doesn't use any metadata from the API definition.
// ****************************************************************************
const myApi = require('./myApi');
console.log("Running " + myApi.name);

let smtp;

// We're passing the 'smtp' option directly into nodemailer's
// createTransport() check out the TL;DR below:
// https://nodemailer.com/about/#tl-dr
smtp = {
    host: process.env.SMTP_SERVER || 'smtp://localhost',
    port: 587,
    secure: true, // true for 465, false for other ports
    auth: {
        user: process.env.SMTP_USERNAME || 'email@address.com',
        pass: process.env.SMTP_PASSWORD || 'my-secret-password'
    },
    tls: {
        rejectUnauthorized: false
    }        
};
// Alternatively, something like this should work. (Requires editing!)
// smtp = 'smtps://<email%40domain.com>:<password>@<mail.domain.com>';

// Or simply pull a connection string from an environment variable.
if (process.env.SMTP_CONNECT) {
    smtp = process.env.SMTP_CONNECT;
}

// Register my TransomJS SMTP module.
transom.configure(transomSmtp, {
    smtp,
    helpers: {
        majordomo: `"Major Domo" ${process.env.SMTP_USERNAME}`
    }
});

// Initialize my TransomJS API metadata.
transom.initialize(myApi).then(function (server) {

    // ****************************************************************************
    // Define a simple '/' route to send myself an email.
    // ****************************************************************************
    server.get('/', function (req, res, next) {

        // Create the outbound email data (this is passed directly to Nodemailer)
        let mailOptions = {
            to: 'foobar@hogmail.com', // list of recipients
            subject: 'Hello ✔', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>' // html body
        };

        // Fetch the configured SMTP module from the Registry.
        console.log("Registry keys:", server.registry.keys);
        const smtp = server.registry.get('transomSmtp');

        // Send email using the 'majordomo' helper method.
        smtp.sendFromMajordomo(mailOptions, function (err, result) {
            if (err) {
                return res.send(500, {
                    "Error": err.message
                });
            }
            res.send(result);
        });
    });

    // ****************************************************************************
    // Handle 404 errors when a route is undefined.
    // ****************************************************************************
    server.get('.*', function (req, res, next) {
        var err = new Error(req.url + " does not exist");
        err.status = 404;
        next(err);
    });

    // ****************************************************************************
    // Handle Errors within the app as our last middleware.
    // ****************************************************************************
    server.use(function (error, req, res, next) {
        console.error("Error handler", error);
        var data = {};
        data.error = error;
        res.statusCode = error.status || 501;
        res.send(data);
    });

    // ****************************************************************************
    // Start the Transom server...
    // ****************************************************************************
    server.listen(7070, function () {
        console.log('%s listening at %s', server.name, server.url);
    });
});


// ****************************************************************************
// Handle uncaught exceptions within your code.
// ****************************************************************************
process.on('uncaughtException', function (err) {
    console.error('Really bad Error!', err);
});

// ****************************************************************************
// Handle uncaught rejections within your code.
// ****************************************************************************
process.on('unhandledRejection', function (err) {
    console.error('unhandledRejection', err);
});