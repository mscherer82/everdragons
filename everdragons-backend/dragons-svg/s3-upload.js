const AWS = require('aws-sdk');
const S3Stream = require('s3-upload-stream');
const accounts = require('everdragons-shared/accounts').accounts;

let s3Stream;

module.exports.initS3 = function () {
     s3Stream = S3Stream(new AWS.S3({
        accessKeyId: accounts.awsS3.accessKeyId,
        secretAccessKey: accounts.awsS3.secretAccessKey
    }));
};

module.exports.uploadS3 = async function(readStream, key, mime) {
    return new Promise((resolve, reject) => {
        try {
            var upload = s3Stream.upload({
                Bucket: accounts.awsS3.Bucket,
                Key: key,
                ContentType: mime
            });
            // Handle errors.
            upload.on('error', function (err) {
                reject(err);
            });
            // Handle upload completion.
            upload.on('uploaded', function (details) {
                console.log("uploaded: " + key);
                resolve(details);
            });
            readStream.pipe(upload);
        } catch (e) {
            reject(e);
        }
    });
};
