const chainConfigs = {
    tron: {
        chain: "TRON",
        currency: "TRX",
        goldPrice: 1e6,
        currencyValue: 1e6,
        defaultDigits: 0,
        auctionValues: {
            startPriceMin: 1,
            startPriceMax: 1000000,
            endPriceMin: 1,
            endPriceMax: 1000000,
            durationMin: 60,
            durationMax: 60 * 60 * 24 * 7,
            startPriceNSE: 1200,
            endPriceNSE: 1200,
            durationNSE: 60 * 60 * 24 *2
        }
    },
    eth: {
        chain: "ETH",
        currency: "ETH",
        goldPrice: 1e15,
        currencyValue: 1e18,
        defaultDigits: 3,
        auctionValues: {
            startPriceMin: 0.01,
            startPriceMax: 1000,
            endPriceMin: 0.01,
            endPriceMax: 1000,
            durationMin: 60,
            durationMax: 60 * 60 * 24 * 7,
            auctionValues: 10,
            startPriceNSE: 0.2,
            endPriceNSE: 0.2,
            durationNSE: 60 * 60 * 24 *2
        }
    },
    poa: {
        chain: "POA",
        currency: "POA",
        goldPrice: 1e18,
        currencyValue: 1e18,
        defaultDigits: 0,
        auctionValues: {
            startPriceMin: 1,
            startPriceMax: 1000000,
            endPriceMin: 1,
            endPriceMax: 1000000,
            durationMin: 60,
            durationMax: 60 * 60 * 24 * 7,
            startPriceNSE: 1000,
            endPriceNSE: 1000,
            durationNSE: 60 * 60 * 24 *2
        }
    }
};

module.exports = (netowrk) => {
    switch (netowrk.toLowerCase()) {
        case "shasta":
        case "tron":
            return chainConfigs["tron"];
        case "sokol":
        case "sokol-fork":
        case "poa":
            return chainConfigs["poa"];
        case "eth":
        case "test":
        case "rinkeby-fork":
        case "ganache":
        case "rinkeby":
        case "mainnet":
            return chainConfigs["eth"];
    }
};
