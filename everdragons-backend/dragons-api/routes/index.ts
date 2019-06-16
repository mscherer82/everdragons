import {dragonsContext} from './validations/dragons';
import {dragonContext} from './validations/dragon';
import {itemsContext} from './validations/items';
import {auctionContext} from './validations/auction';
import {auctionsContext} from './validations/auctions';

const orders = {
    TRON: ['TRON', 'ETH', 'POA'],
    ETH: ['ETH', 'TRON', 'POA'],
    POA: ['POA', 'ETH', 'TRON'],
};

module.exports = function(app, dragonsCollection) {
    app.post('/dragons', (req, res) => {
        try {
            dragonsContext.validate(req.body);
            if (!dragonsContext.isValid()) {
                return res.status(400).json(dragonsContext.validationErrors());
            }

            const query: any = {$or: [], hasImage: true};
            const chain = req.body.query.chain;
            const chainOrder = orders[chain];
            const sort = {weight: 1};
            const offset = req.body.offset || 0;
            const limit = req.body.limit || 10;

            if (req.body.query.ethOwner) {
                query.$or.push({ethOwner: req.body.query.ethOwner});
            }
            if (req.body.query.poaOwner) {
                query.$or.push({poaOwner: req.body.query.poaOwner});
            }
            if (req.body.query.tronOwner) {
                query.$or.push({tronOwner: req.body.query.tronOwner});
            }
            if (req.body.query.type) {
                query.type = req.body.query.type;
            }

            Object.assign(sort, req.body.sort);

            console.log(query, sort, offset, limit);
            dragonsCollection
                .aggregate([
                    {$match: query},
                    {
                        $project: {
                            poaAuction: false,
                            ethAuction: false,
                            tronAuction: false,
                            type: false,
                            _id: false,
                        },
                    },
                    {
                        $addFields: {
                            weight: {
                                $cond: [
                                    {$eq: ['$chain', chainOrder[0]]},
                                    1,
                                    {
                                        $cond: [{$eq: ['$chain', chainOrder[1]]}, 2, 3],
                                    },
                                ],
                            },
                        },
                    },
                    {$sort: sort},
                    {
                        $facet: {
                            docs: [{$skip: offset}, {$limit: limit}],
                            totalCount: [
                                {
                                    $count: 'count',
                                },
                            ],
                        },
                    },
                ])
                .toArray()
                .then(result => {
                    const count = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
                    res.json({count, docs: result[0].docs});
                });
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });

    app.post('/dragon', (req, res) => {
        try {
            dragonContext.validate(req.body);
            if (!dragonContext.isValid()) {
                return res.status(400).json(dragonContext.validationErrors());
            }

            dragonsCollection
                .findOne({
                    dna: req.body.dna,
                })
                .then(result => {
                    res.json({dragon: result});
                });
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });

    app.post('/auctions', (req, res) => {
        try {
            auctionsContext.validate(req.body);
            if (!auctionsContext.isValid()) {
                return res.status(400).json(auctionsContext.validationErrors());
            }

            const chain = req.body.query.chain;
            const type = req.body.query.type;
            const auctionKey = chain.toLowerCase() + 'Auction';
            const query: any = {chain, type, [auctionKey]: {$exists: true}, hasImage: true};
            const sort = req.body.sort || {currentPrice: 1};
            const offset = req.body.offset || 0;
            const limit = req.body.limit || 10;
            const timestamp = new Date().getTime() / 1000;
            const chainOrder = orders[chain];

            dragonsCollection
                .aggregate([
                    {$match: query},
                    {
                        $project: {
                            [chainOrder[1].toLowerCase() + 'Auction']: false,
                            [chainOrder[2].toLowerCase() + 'Auction']: false,
                        },
                    },
                    {
                        $addFields: {
                            currentPrice: {
                                $let: {
                                    vars: {
                                        priceChange: {
                                            $subtract: [
                                                '$' + auctionKey + '.endingPrice',
                                                '$' + auctionKey + '.startingPrice',
                                            ],
                                        },
                                        secondsPassed: {$subtract: [timestamp, '$' + auctionKey + '.startedAt']},
                                    },
                                    in: {
                                        $max: [
                                            {
                                                $add: [
                                                    {
                                                        $divide: [
                                                            {$multiply: ['$$priceChange', '$$secondsPassed']},
                                                            '$' + auctionKey + '.duration',
                                                        ],
                                                    },
                                                    '$' + auctionKey + '.startingPrice',
                                                ],
                                            },
                                            '$' + auctionKey + '.endingPrice',
                                        ],
                                    },
                                },
                            },
                        },
                    },
                    {$sort: sort},
                    {
                        $facet: {
                            docs: [{$skip: offset}, {$limit: limit}],
                            totalCount: [
                                {
                                    $count: 'count',
                                },
                            ],
                        },
                    },
                ])
                .toArray()
                .then(result => {
                    const count = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
                    res.json({count, docs: result[0].docs});
                });
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });

    app.post('/auction', (req, res) => {
        try {
            auctionContext.validate(req.body);
            if (!auctionContext.isValid()) {
                return res.status(400).json(auctionContext.validationErrors());
            }

            const auctionKey = req.body.chain.toLowerCase() + 'Auction';

            dragonsCollection
                .findOne({
                    dna: req.body.dna,
                    [auctionKey]: {$exists: true},
                })
                .then(result => {
                    if (result) {
                        result = result[auctionKey];
                        const timestamp = new Date().getTime() / 1000;
                        const duration = result.duration;
                        const startedAt = result.startedAt;
                        const secondsPassed = timestamp - startedAt;
                        let currentPrice;

                        if (secondsPassed >= duration) {
                            currentPrice = result.endingPrice;
                        } else {
                            const priceChange = result.endingPrice - result.startingPrice;
                            const currentPriceChange = (priceChange * secondsPassed) / duration;
                            currentPrice = result.startingPrice + currentPriceChange;
                        }
                        result.currentPrice = currentPrice;
                    }
                    res.json({auction: result ? result : null});
                });
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });

    app.post('/hasItems', (req, res) => {
        try {
            itemsContext.validate(req.body);
            if (!itemsContext.isValid()) {
                return res.status(400).json(itemsContext.validationErrors());
            }

            const ownerKey = req.body.chain.toLowerCase() + 'Owner';
            const findDragon = dragonsCollection.findOne({
                [ownerKey]: req.body.owner,
                chain: req.body.chain,
                type: 1,
            });

            const findCub = dragonsCollection.findOne({
                [ownerKey]: req.body.owner,
                chain: req.body.chain,
                type: 2,
            });

            Promise.all([findDragon, findCub]).then(result => {
                res.json({hasDragon: !!result[0], hasCub: !!result[1]});
            });
        } catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });

    return app;
};
