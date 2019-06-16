import express = require('express');
import * as morganBody from 'morgan-body';

const config = require('everdragons-shared/config');
const initDatabase = require('everdragons-shared/utils/database').initDatabase;
const serverUtils = require('everdragons-shared/utils/serverUtils');
const cors = require('cors');
const bodyParser = require('body-parser');

const routes = require('./routes');
const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));
app.use(cors());
morganBody(app);

const main = async () => {
    try {
        await serverUtils.initAccounts();
        let collections = await initDatabase();
        routes(app, collections.dragonsCollection).listen(config.dragonApi.PORT, () =>
            console.log('Listening on port ' + config.dragonApi.PORT),
        );
    } catch (e) {
        serverUtils.exit(e);
    }
};

main();

process.on('uncaughtException', function(error) {
    serverUtils.exit(error);
});

process.on('unhandledRejection', function(reason) {
    serverUtils.exit(reason);
});
