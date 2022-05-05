const DemonEyes = artifacts.require("DemonEyes");

module.exports = function (deployer) {
  deployer.deploy(DemonEyes,"Demon Eyes", "DEY", "ipfs://QmbNYJ5eiPrBv4srHNNi68giVJzYGabqUkxwzzQf6eVFH7/");
};
