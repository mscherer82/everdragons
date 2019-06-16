const web3Utils = require('web3-utils');
const config = require('everdragons-shared/config');
const accountUtils = require('everdragons-shared/accounts');
const contractUtils = require('everdragons-shared/utils/contracts');
const envs = require('everdragons-shared/env');
const database = require('everdragons-shared/utils/database');
const check = require('everdragons-shared/utils/notify')('dragons-db').check;
const serverUtils = require('everdragons-shared/utils/serverUtils');
const SyncState = require('everdragons-shared/utils/syncState');
const getChainConfig = require('everdragons-shared/config/chainConfig');

let webWrapper, latestBlock, processedBlock;
let dragonsCollection;
let everdragons, auctions;
let accounts;
let syncState;
let creationBlock;
let chain;
let chainConfig;
let chainPrefix;

const isOnBridge = owner => {
    return owner === accounts.poaBridgeTokenOwner || owner === accounts.tronBridgeTokenOwner;
};

const updateDragon = async (dna, index) => {

    const dragon =
        dna !== undefined
            ? await everdragons.call('getDragon', dna)
            : await everdragons.call('getDragonByIndex', index);

    const dnaHex = web3Utils.padLeft(web3Utils.toHex(dna || dragon.dna), 16);
    const attributesHex = web3Utils.padLeft(web3Utils.toHex(dragon.attributes), 6);

    const type = parseInt(dnaHex.substr(dnaHex.length - 2), 16);
    const owner = await everdragons.call('ownerOf', dna || dragon.dna);

    const dragonEntry = {
        dna: dnaHex,
        [chainPrefix + 'Owner']: owner,
    };

    if (!isOnBridge(owner)) {
        dragonEntry.chain = chain;
        dragonEntry.type = type;
        dragonEntry.prestige = parseInt(dragon.prestige);
        dragonEntry.experience = parseInt(dragon.experience);
        dragonEntry.state = dragon.state;
        dragonEntry.attributes = attributesHex;
        dragonEntry.name = dragon.name;
        if (owner === auctions.getAddress()) {
            dragonEntry[chainPrefix + 'OnMarketPlace'] = true;
            const auction = await auctions.call('getAuctionByTokenId', dragonEntry.dna);
            dragonEntry[chainPrefix + 'Owner'] = auction.seller;
        } else {
            dragonEntry[chainPrefix + 'OnMarketPlace'] = false;
        }
    }

    console.log(dragonEntry.dna, dragonEntry);

    await dragonsCollection.updateOne(
        {dna: dragonEntry.dna},
        {
            $set: dragonEntry,
            $setOnInsert: {hasImage: false},
        },
        {upsert: true},
    );
};

const createAuction = async (auctionId, tokenId) => {

    const auction =
        auctionId !== undefined
            ? await auctions.call('getAuction', auctionId)
            : await auctions.call('getAuctionByTokenId', tokenId);
    const dnaHex = web3Utils.padLeft(web3Utils.toHex(auction.tokenId), 16);

    console.log('create auction for token', dnaHex, auction);

    const auctionEntry = {
        [chainPrefix + 'Auction']: {
            seller: auction.seller,
            startingPrice: parseInt(auction.startingPrice) / chainConfig.currencyValue,
            endingPrice: parseInt(auction.endingPrice) / chainConfig.currencyValue,
            duration: parseInt(auction.duration),
            startedAt: parseInt(auction.startedAt),
        },
    };

    await dragonsCollection.updateOne({dna: dnaHex}, {$set: auctionEntry});
    return dnaHex;
};

const deleteAuction = async tokenId => {
    console.log('remove auction for token', tokenId);
    await dragonsCollection.updateOne({dna: tokenId}, {$unset: {[chainPrefix + 'Auction']: ''}, $set: {[chainPrefix + 'OnMarketPlace']: false }});
};

const processPastEvents = async (startBlock, endBlock) => {
    try {
        console.log('processing events from ' + startBlock + ' to ' + endBlock);

        const pastDragonEvents = await everdragons.web3Contract.getPastEvents('allEvents', {
            fromBlock: startBlock,
            toBlock: endBlock,
        });

        for (let i = 0; i < pastDragonEvents.length; i++) {
            const event = pastDragonEvents[i];
            console.log('dragon event:', event.event);

            if (event && event.returnValues && ['Create', 'Transfer', 'PropertiesChanged'].includes(event.event)) {
                console.log(event.returnValues);
                const dna = event.returnValues.dna || event.returnValues.tokenId;
                await check(updateDragon(dna));
            }
        }

        const pastAuctionsEvents = await auctions.web3Contract.getPastEvents('allEvents', {
            fromBlock: startBlock,
            toBlock: endBlock,
        });

        for (let i = 0; i < pastAuctionsEvents.length; i++) {
            const event = pastAuctionsEvents[i];
            console.log('auction event:', event.event);

            if (event && event.returnValues) {
                const tokenId = event.returnValues.tokenId;
                if (event.event === 'AuctionCreated') {
                    await createAuction(undefined, tokenId);
                } else if (event.event === 'AuctionSuccessful' || event.event === 'AuctionCancelled') {
                    await deleteAuction(undefined, tokenId);
                }
            }
        }
        return true;
    } catch (e) {
        await serverUtils.exit(e);
    }
};

const iterateThroughBlocks = async function() {
    try {
        latestBlock = await webWrapper.getLatestBlock();

        let startBlock = processedBlock;
        let processTo = latestBlock - config.dragonDB.BLOCK_DELAY;
        while (startBlock < processTo) {
            let endBlock = startBlock + config.dragonDB.ITERATION_BLOCK_COUNT;
            if (endBlock > processTo) {
                endBlock = processTo;
            }
            let result = await processPastEvents(startBlock, endBlock);
            if (result) {
                startBlock = endBlock;
                await syncState.store(processTo);
            }
        }
        processedBlock = processTo;
    } catch (e) {
        await serverUtils.exit(e);
    }
};

const processAllDragons = async () => {
    const dragonCount = await everdragons.call('totalSupply');
    for (let i = 0; i < dragonCount; i++) {
        await updateDragon(undefined, i.toString());
    }
};

const processAllAuctions = async () => {
    const auctionCount = await auctions.call('getAuctionCount');
    const tokenIds = [];
console.log({auctionCount});
    for (let i = 0; i < auctionCount; i++) {
        let tokenId = await createAuction(i.toString());
        tokenIds.push(tokenId);
    }

    await dragonsCollection.updateMany(
        {[chainPrefix + 'Auction']: {$exists: true}, dna: {$nin: tokenIds}},
        {$unset: {[chainPrefix + 'Auction']: ''}, $set: {[chainPrefix + 'OnMarketPlace']: false }}
    );
};

const main = async () => {
    envs.printEnv();
    chain = envs.getChain();
    chainPrefix = chain.toLowerCase();
    chainConfig = getChainConfig(chain);

    await serverUtils.initAccounts();
    accounts = accountUtils.accounts;

    webWrapper = await contractUtils.createWebWrapper(chain, 'public');
    everdragons = await webWrapper.getContractByName('everdragons');
    auctions = await webWrapper.getContractByName('auction');
    creationBlock = await everdragons.getCreationBlock();

    const collections = await database.initDatabase();
    dragonsCollection = collections.dragonsCollection;

    if (chain === 'TRON') {
        await processAllDragons();
        await processAllAuctions();

        const interv = async () => {
            await processAllDragons();
            await processAllAuctions();
            setTimeout(interv, config.dragonDB.INTERVAL);
        };
        setTimeout(interv, config.dragonDB.INTERVAL);
    } else {
        syncState = await SyncState.getSyncState(chain, 'DB');
        console.log('synced block:', syncState.syncedBlock, creationBlock);
        processedBlock = syncState.syncedBlock || creationBlock;
        if (processedBlock > 20) {
            processedBlock -= 20;
        }

        await iterateThroughBlocks();
        await processAllAuctions();
        const interv = async () => {
            await iterateThroughBlocks();
            setTimeout(interv, config.dragonDB.INTERVAL);
        };
        setTimeout(interv, config.dragonDB.INTERVAL);
    }
};

main();

process.on('uncaughtException', function(error) {
    serverUtils.exit(error);
});

process.on('unhandledRejection', function(reason) {
    serverUtils.exit(reason);
});

setTimeout(_ => {
    serverUtils.exit();
}, config.FORCED_RESTART * 1000);
