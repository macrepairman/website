"use strict";

const express = require("express"),
    ejs = require("ejs"),
    app = express(),
    bodyParser = require('body-parser'),
    config = require("./config.json"),
    moment = require("moment"),
    chalk = require('chalk'),
    nodemailer = require('nodemailer'),
    compression = require("compression"),
    cookieParser = require('cookie-parser'),
    morgan = require('morgan'),
    log = console.log;

log();
log();
log(chalk.green(" --- PROCESS INITIALIZATION ---"));
log("Time:", Date.now());

global.__base = __dirname + "/";
log("__base:", __base);


app.use(compression());
app.set("view engine", "ejs");
app.use(require("prerender-node"));
app.set("views", __dirname + "/views");
app.use(express.static("static"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("env", "development");
app.use(cookieParser());
app.use(morgan('combined'));

app.use(logRequests);
// Router 

// Home page
app.get("/", function (req, res) {
    res.render("pages/index");
});

app.use((req, res) => {
    res.redirect('/');
});

// Contact middleware
app.post('/contact', (req, res) => {
    const transporter = nodemailer.createTransport({
        host: config.contact.host,
        port: config.contact.port || 465,
        secure: config.contact.secure || true,
        auth: {
            user: config.contact.user,
            pass: config.contact.pass
        }
    });

    const mailOptions = {
        from: 'info@macrepairman.ca',
        to: 'applerepairmacman@gmail.com',
        subject: 'New message from your website!',
        text: 'You have received a new message from your website contact form.\n\nName: ' + req.body.name + '\nEmail: ' + req.body.email + '\nMessage: ' + req.body.message
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            console.log(error);
            res.send('An error occurred while sending the email.');
        } else {
            console.log('Email sent: ' + info.response);
            res.send('Thank you for your message!');
        }
    });
});

// Server Functions
function getTimeFormatted() {
    return moment().format("MMMM Do YYYY, h:mm:ss a") + " (" + Date.now() + ")";
}

function logRequests(req, res, next) {
    const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    log();
    log(chalk.green("--- NEW REQUEST ---"));
    log(chalk.yellow(
        "Time:",
        moment().format("MMMM Do YYYY, h:mm:ss a"),
        "(" + Date.now() + ")"
    ));
    log(chalk.blue("IP: ", ip));
    log(chalk.blue("Request:", req.originalUrl));
    next();
}

app.on('listening', function () {
    console.log('Server started!');

    app.use(function (req, res, next) {
        for (var cookie in req.cookies) {
            res.clearCookie(cookie);
        }
        next();
    });
});

const port = config.server.port || 5000;
const server = app
    .listen(port, () => {
        log();
        log(chalk.green("--- WEBSERVER ON ---"));
        log(chalk.yellow("Listening at http://" + config.server.domain + ":" + port));
        log();
    })
    .on("error", (err) => {
        log(chalk.red("Connection error:", err));
    });