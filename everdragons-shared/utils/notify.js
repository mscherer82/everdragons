const nodemailer = require('nodemailer');
const accounts = require('./../accounts').accounts;
const config = require('./../config');
const transporter = nodemailer.createTransport(accounts.sendmail);

let appName;

const stringifyError = function(err) {
    var plainObject = {};
    Object.getOwnPropertyNames(err).forEach(function(key) {
        plainObject[key] = err[key];
    });
    return JSON.stringify(plainObject, null , "\t");
};

const sendErrorMail = (message) => {

    let mailOptions = {
        from: 'ed.error.mail@gmail.com',
        to: config.ERROR_MAIL_RECEIVER,
        subject: 'Error in ' + appName,
        text: 'Msg: ' + stringifyError(message) + " (Raw: " + message + ")"
    };

    return new Promise((resolve, reject) => {
        if(!config.ERROR_MAIL_RECEIVER) {
            resolve();
            return;
        }

        try {
            transporter.sendMail(mailOptions, (error, info) => {
                if (error) {
                    console.log(error);
                    reject(error);
                } else {
                    resolve();
                }
            });
        } catch (e) {
            reject(e);
        }
    });
};

const setAppName = (newAppName) => {
    appName = newAppName;
};

const check = async (fnc, fatal = true) => {
    let lastError = {};
    let i = 0;
    for(i = 0; i < 3; i++) {
        try {
            await fnc;
            break;
        } catch (e) {
            console.error(e);
            lastError = e;
        }
    }
    if(i === 3) {
        try {
            await sendErrorMail(lastError);
        } catch (e) {
            console.error(e);
        }

        if(fatal) {
            process.exit(1);
        }
    }
};

module.exports = function (_appName) {

    appName = _appName;

    return {
        sendErrorMail,
        setAppName,
        check
    }
};
