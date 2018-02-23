## Transom SMTP - Simple
### Sending email with Transom SMTP

In this example we create a TransomJS server and use the [transom-smtp](https://github.com/transomjs/transom-smtp/) plugin to send emails from an endpoint to show how simple it is. 
This example demonstrates how to configure the plugin and then use it from within your own code on the server. The plugin provides a simple wrapper around nodemailer so that your email configuration is centralized and outbount messaging is implemented consistently throughout your application.

### Run the example
Clone the `transom-smtp-example` repository and install the dependencies with npm. 
```bash
$ git clone git@github.com:4umfreak/transom-smtp-example.git
$ cd transom-functions-secured-example
$ npm install
```

You'll need to have access to an SMTP server for this example. If you don't have one running locally, at `smtp://localhost`, you can create an environment variable with the URL to an external server. On Linux, use the `export` command as follows, being sure to use your own server info, of course.
```bash
$  export SMTP_SERVER='smtps://<username>:<password>@mail.domain.com'
```

Use `npm start` to run the API server. 
```bash
$ npm start
```

The server will start on localhost, port 7070 and you can navigate to http://localhost:7070/
 
If everything is working it should fire an email to the address configured
in the `/` route and display a JSON response that looks something like the following:
```javascript
{
    "accepted": [
            "foobar@hogmail.com"
        ],
    "rejected": [],
    "envelopeTime": 79,
    "messageTime": 40,
    "messageSize": 585,
    "response": "250 OK id=000000-00065p-Pe",
    "envelope": {
        "from": "email@domain.com",
        "to": [
                "foobar@hogmail.com"
            ]
    },
    "messageId": "<67d13484-6412-58df-ccae-ed713e153303@domain.com>"
}
```
### The Route
Looking at this example, it's obviously never going to production anywhere, but it does demonstrate a couple important things.

1. It uses `server.registry.get('transomSmtp');` to get a reference to the configured plugin. 
2. You can use `server.registry.keys` to get a list of all the top-level objects stored within your registry.  
3. The configured plugin has a `sendFromMajordomo()` method created from the configuration data passed to it in the configure step.
4. BONUS: While not demonstrated in the example, there's also a generic `sendMail()` function on the plugin that can be used for sending on behalf of dynamic email addresses within your app.

### How & Why
Everywhere you write code within your Transom application, you will have access to the server instance; which means that you'll always be able to get the initialized SMTP plugin and send an email without having to worry about how to establish a connection, or where to find the server configuration details. 
If at some point in the future, you choose to use a different mail provider, there's very little change to be made in your app, you simply replace the plugin with one that has similar methods, and the remainder of your application can remain unchanged.

### Limitations
The Transom SMTP plugin creates a new Transport for each individual email that is sent. If your application requires sending high volumes of email, there are better ways to do it and reusing the transport would be a good place to start, but for transactional emails where the volumnes are low, this works great.