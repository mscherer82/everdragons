module.exports = {
	envs: ["production", "development", "local"],
    defaultEnv: "development",
	getEnv() {
		return process.env && this.envs.includes(process.env.NODE_ENV) ? process.env.NODE_ENV : this.defaultEnv;
	},
    chains: ["POA", "ETH", "TRON"],
    defaultChain: "ETH",
    getChain() {
        return process.env && this.chains.includes(process.env.USE_CHAIN) ? process.env.USE_CHAIN : this.defaultChain;
    },
    printEnv() {
	    console.log("ENV:" , this.getEnv());
        console.log("CHAIN:" , this.getChain());
    }
};
