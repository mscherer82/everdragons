const config = require('everdragons-shared/config');
const accountUtils = require('everdragons-shared/accounts');
const envs = require('everdragons-shared/env');
const serverUtils = require('everdragons-shared/utils/serverUtils');
const contractUtils = require('everdragons-shared/utils/contracts');
const SyncState = require('everdragons-shared/utils/syncState');
const web3Utils = require("web3-utils");
const getChainConfig = require('everdragons-shared/config/chainConfig');
const database = require('everdragons-shared/utils/database');

let sourceChain, sourceChainPrefix, sourceChainConfig;
let destChain, destChainPrefix, destChainConfig;
let sourceWebWrapper, destWebWrapper;
let everdragons, player, bridge;
let accounts;
let currentBlock;
let syncState;
let latestBlock, processedBlock;

const handleTransferEvent = async function(event) {
    const args = event.returnValues;
    const transactionHash = event.transactionHash;

    try {
        if (
            args.to.toLowerCase() ===
            accounts[destChainPrefix + "BridgeTokenOwner"].address.toLowerCase()
        ) {
            let processed = await bridge.call("hasEventProcessed", transactionHash);
            if (!processed) {
                const addr = await player.call("getLinkedAccountForUser", args.from, web3Utils.stringToHex(destChain));
                console.log('transfer dragon: ', args.tokenId, args.from, addr);

                const dragon = await everdragons.call('getDragon', args.tokenId);
                const result = await bridge.send("transferToken",
                    transactionHash,
                    args._tokenId,
                    addr,
                    dragon[0],
                    dragon[1],
                    dragon[2],
                    dragon[5] || '',
                );
                console.log('tokenId:', args.tokenId, 'tx:', result);
            } else {
                console.log(
                    'processed: ',
                    args && args._tokenId,
                    transactionHash,
                );
            }
        }
    } catch (e) {
        console.error(e);
        await notify.sendErrorMail(e.toString());
        process.exit(1);
    }
};

const processEvents = async function() {
    try {
        latestBlock = await sourceWebWrapper.getLatestBlock();

        let startBlock = processedBlock;
        let processTo = latestBlock - config.dragonDB.BLOCK_DELAY;
        while (startBlock < processTo) {
            let endBlock = startBlock + config.dragonDB.ITERATION_BLOCK_COUNT;
            if (endBlock > processTo) {
                endBlock = processTo;
            }
            console.log('processing events from ' + startBlock + ' to ' + endBlock);
            const pastEvents = await everdragons.web3Contract.getPastEvents('Transfer', {
                fromBlock: startBlock,
                toBlock: endBlock,
            });

            for (let i = 0; i < pastEvents.length; i++) {
                await handleTransferEvent(pastEvents[i]);
            }

            startBlock = endBlock;
            await syncState.store(processTo);
        }
        processedBlock = processTo;
    } catch (e) {
        await serverUtils.exit(e);
    }
};

const main = async () => {

    try {
        envs.printEnv();
        sourceChain = envs.getChain();
        sourceChainPrefix = sourceChain.toLowerCase();
        sourceChainConfig = getChainConfig(sourceChain);

        destChain = process.env.USE_DEST_CHAIN || "TRON";
        destChainPrefix = destChain.toLowerCase();
        destChainConfig = getChainConfig(destChain);

        await serverUtils.initAccounts();
        accounts = accountUtils.accounts;

        await database.initDatabase();

        sourceWebWrapper = await contractUtils.createWebWrapper( sourceChain, 'public');
        destWebWrapper = await contractUtils.createWebWrapper( destChain, 'bridgeAPI');
        everdragons = await sourceWebWrapper.getContractByName('everdragons');
        player = await sourceWebWrapper.getContractByName('player');
        bridge = await destWebWrapper.getContractByName('bridge');

        const creationBlock = await everdragons.getCreationBlock();
        syncState = await SyncState.getSyncState(sourceChain + "-" + destChain, 'Bridge');
        processedBlock = 7509104;//syncState.syncedBlock || creationBlock;

        await processEvents();
        setInterval(async _ => {
            await processEvents();
        }, 10000);
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

setTimeout(_=> {
    serverUtils.exit();
}, config.FORCED_RESTART * 1000);
