"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var dragons_1 = require("./validations/dragons");
var dragon_1 = require("./validations/dragon");
var items_1 = require("./validations/items");
var auction_1 = require("./validations/auction");
var auctions_1 = require("./validations/auctions");
var orders = {
    TRON: ['TRON', 'ETH', 'POA'],
    ETH: ['ETH', 'TRON', 'POA'],
    POA: ['POA', 'ETH', 'TRON'],
};
module.exports = function (app, dragonsCollection) {
    app.post('/dragons', function (req, res) {
        try {
            dragons_1.dragonsContext.validate(req.body);
            if (!dragons_1.dragonsContext.isValid()) {
                return res.status(400).json(dragons_1.dragonsContext.validationErrors());
            }
            var query = { $or: [], hasImage: true };
            var chain = req.body.query.chain;
            var chainOrder = orders[chain];
            var sort = { weight: 1 };
            var offset = req.body.offset || 0;
            var limit = req.body.limit || 10;
            if (req.body.query.ethOwner) {
                query.$or.push({ ethOwner: req.body.query.ethOwner });
            }
            if (req.body.query.poaOwner) {
                query.$or.push({ poaOwner: req.body.query.poaOwner });
            }
            if (req.body.query.tronOwner) {
                query.$or.push({ tronOwner: req.body.query.tronOwner });
            }
            if (req.body.query.type) {
                query.type = req.body.query.type;
            }
            Object.assign(sort, req.body.sort);
            console.log(query, sort, offset, limit);
            dragonsCollection
                .aggregate([
                { $match: query },
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
                                { $eq: ['$chain', chainOrder[0]] },
                                1,
                                {
                                    $cond: [{ $eq: ['$chain', chainOrder[1]] }, 2, 3],
                                },
                            ],
                        },
                    },
                },
                { $sort: sort },
                {
                    $facet: {
                        docs: [{ $skip: offset }, { $limit: limit }],
                        totalCount: [
                            {
                                $count: 'count',
                            },
                        ],
                    },
                },
            ])
                .toArray()
                .then(function (result) {
                var count = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
                res.json({ count: count, docs: result[0].docs });
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });
    app.post('/dragon', function (req, res) {
        try {
            dragon_1.dragonContext.validate(req.body);
            if (!dragon_1.dragonContext.isValid()) {
                return res.status(400).json(dragon_1.dragonContext.validationErrors());
            }
            dragonsCollection
                .findOne({
                dna: req.body.dna,
            })
                .then(function (result) {
                res.json({ dragon: result });
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });
    app.post('/auctions', function (req, res) {
        var _a, _b;
        try {
            auctions_1.auctionsContext.validate(req.body);
            if (!auctions_1.auctionsContext.isValid()) {
                return res.status(400).json(auctions_1.auctionsContext.validationErrors());
            }
            var chain = req.body.query.chain;
            var type = req.body.query.type;
            var auctionKey = chain.toLowerCase() + 'Auction';
            var query = (_a = { chain: chain, type: type }, _a[auctionKey] = { $exists: true }, _a.hasImage = true, _a);
            var sort = req.body.sort || { currentPrice: 1 };
            var offset = req.body.offset || 0;
            var limit = req.body.limit || 10;
            var timestamp = new Date().getTime() / 1000;
            var chainOrder = orders[chain];
            dragonsCollection
                .aggregate([
                { $match: query },
                {
                    $project: (_b = {},
                        _b[chainOrder[1].toLowerCase() + 'Auction'] = false,
                        _b[chainOrder[2].toLowerCase() + 'Auction'] = false,
                        _b),
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
                                    secondsPassed: { $subtract: [timestamp, '$' + auctionKey + '.startedAt'] },
                                },
                                in: {
                                    $max: [
                                        {
                                            $add: [
                                                {
                                                    $divide: [
                                                        { $multiply: ['$$priceChange', '$$secondsPassed'] },
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
                { $sort: sort },
                {
                    $facet: {
                        docs: [{ $skip: offset }, { $limit: limit }],
                        totalCount: [
                            {
                                $count: 'count',
                            },
                        ],
                    },
                },
            ])
                .toArray()
                .then(function (result) {
                var count = result[0].totalCount[0] ? result[0].totalCount[0].count : 0;
                res.json({ count: count, docs: result[0].docs });
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });
    app.post('/auction', function (req, res) {
        var _a;
        try {
            auction_1.auctionContext.validate(req.body);
            if (!auction_1.auctionContext.isValid()) {
                return res.status(400).json(auction_1.auctionContext.validationErrors());
            }
            var auctionKey_1 = req.body.chain.toLowerCase() + 'Auction';
            dragonsCollection
                .findOne((_a = {
                    dna: req.body.dna
                },
                _a[auctionKey_1] = { $exists: true },
                _a))
                .then(function (result) {
                if (result) {
                    result = result[auctionKey_1];
                    var timestamp = new Date().getTime() / 1000;
                    var duration = result.duration;
                    var startedAt = result.startedAt;
                    var secondsPassed = timestamp - startedAt;
                    var currentPrice = void 0;
                    if (secondsPassed >= duration) {
                        currentPrice = result.endingPrice;
                    }
                    else {
                        var priceChange = result.endingPrice - result.startingPrice;
                        var currentPriceChange = (priceChange * secondsPassed) / duration;
                        currentPrice = result.startingPrice + currentPriceChange;
                    }
                    result.currentPrice = currentPrice;
                }
                res.json({ auction: result ? result : null });
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });
    app.post('/hasItems', function (req, res) {
        var _a, _b;
        try {
            items_1.itemsContext.validate(req.body);
            if (!items_1.itemsContext.isValid()) {
                return res.status(400).json(items_1.itemsContext.validationErrors());
            }
            var ownerKey = req.body.chain.toLowerCase() + 'Owner';
            var findDragon = dragonsCollection.findOne((_a = {},
                _a[ownerKey] = req.body.owner,
                _a.chain = req.body.chain,
                _a.type = 1,
                _a));
            var findCub = dragonsCollection.findOne((_b = {},
                _b[ownerKey] = req.body.owner,
                _b.chain = req.body.chain,
                _b.type = 2,
                _b));
            Promise.all([findDragon, findCub]).then(function (result) {
                res.json({ hasDragon: !!result[0], hasCub: !!result[1] });
            });
        }
        catch (e) {
            console.error(e);
            res.status(500).json(e);
        }
    });
    return app;
};
//# sourceMappingURL=index.js.map