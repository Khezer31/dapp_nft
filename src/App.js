import logo from "./logo.svg";
import "./App.css";
import getWeb3 from "./getWeb3";
import { useEffect, useState } from "react";
import DemonEyes from "./abis/DemonEyes.json";
import Web3 from "web3";

function App() {
  const [accounts, setAccounts] = useState([]);
  const [instance, setInstance] = useState(null);
  const [price, setPrice] = useState(0);
  const [mintAmount, setMintAmount] = useState(1);
  const [mintActive, setMintActive] = useState(false);

  const [totalSupply, setTotalSupply] = useState(0);
  const [maxSupply, setMaxSupply] = useState(0);

  const [tokensArray, setTokensArrays] = useState([]);

  useEffect(() => {
    _init();
  }, []);

  useEffect(() => {
    if (instance) {
      setTokensArrays(_getTokensOfAddress());
    }
  }, [accounts, instance]);

  const _init = async () => {
    const web3 = await getWeb3();
    const accounts = await web3.eth.getAccounts();
    console.log(accounts[0]);
    setAccounts(accounts);

    const networkId = await web3.eth.net.getId();
    const deployedNetwork = DemonEyes.networks[networkId];
    const instance = new web3.eth.Contract(
      DemonEyes.abi,
      deployedNetwork && deployedNetwork.address
    );
    setInstance(instance);

    const res = await instance.methods.cost().call({ from: accounts[0] });
    setPrice(res);
    const res2 = await instance.methods
      .totalSupply()
      .call({ from: accounts[0] });
    setTotalSupply(res2);
    const maxSupp = await _getMaxSupply(instance);
    setMaxSupply(maxSupp);
    const mintState = await instance.methods.isActive().call();
    setMintActive(mintState);
    const tokenArray = await instance.methods.walletOfOwner(accounts[0]).call();
    if (tokenArray.length > 0) {
      tokenArray.forEach(async (element) => {
        const tokenURI = await instance.methods.tokenURI(element).call();
        console.log(tokenURI);
      });
    }
  };

  const _mint = async () => {
    try {
      const response = await instance.methods
        .mint(mintAmount)
        .send({ from: accounts[0], value: mintAmount * price });
      window.location.reload();
    } catch (err) {
      console.log("Failed", err);
    }
  };

  const _activateMinting = async () => {
    try {
      const response = await instance.methods
        .setIsActive(!mintActive)
        .send({ from: accounts[0] });
      console.log(response);
    } catch (err) {
      console.log("Failed", err);
    }
  };

  const _reveal = async () => {
    try {
      const response = await instance.methods
        .setBaseURI(process.env.REACT_APP_IPFS_URI)
        .send({ from: accounts[0] });
      console.log(response);
    } catch (e) {
      console.log("Error", e);
    }
  };

  const _getMaxSupply = async (contractInstance) => {
    try {
      const response = await contractInstance.methods.MAX_SUPPLY().call();
      return response;
    } catch (e) {
      console.log(e);
    }
  };

  const _withdraw = async () => {
    try {
      const response = await instance.methods
        .withdraw()
        .send({ from: accounts[0] });
      console.log(response);
    } catch (e) {
      console.log(e);
    }
  };

  const _getBalanceOf = async (contractInstance, address) => {
    const response = await contractInstance.methods.balanceOf(address).call();
    if (response) {
      return response;
    }
  };

  const _getTokenIdByIndex = async (contractInstance, address, index) => {
    const response = await contractInstance.methods
      .tokenOfOwnerByIndex(address, index)
      .call();
    if (response) {
      return response;
    }
  };

  const _getTokenURI = async (tokenID) => {
    const response = await instance.methods.tokenURI(tokenID).call();
    if (response) {
      return response;
    }
  };

  const _getTokensOfAddress = () => {
    let tokenArray = [];
    _getBalanceOf(instance, accounts[0]).then((balance) => {
      for (let index = 0; index < balance; index++) {
        let tokeObject = {};
        _getTokenIdByIndex(instance, accounts[0], index).then((tokenFound) => {
          tokeObject.tokenID = tokenFound;
          _getTokenURI(tokenFound).then((image) => {
            tokeObject.image = image;
            tokenArray.push(tokeObject);
          });
        });
      }
    });
    return tokenArray;
  };

  return (
    <div className="App">
      <div>{accounts[0]}</div>
      <div>Mint price : {price / 10 ** 18} ETH</div>
      <div>
        {totalSupply}/{maxSupply} minted
      </div>
      <input
        type="number"
        placeholder="Number"
        value={mintAmount}
        onChange={(t) => setMintAmount(t.target.value)}
      />
      <button onClick={_mint} disabled={!mintActive}>
        Mint
      </button>
      {accounts[0] === "0x140d60630458Ab27E603fD96823a98bA96dF08ff" ||
      accounts[0] === "0xE835C30a34d6F8ab0F6E57FFB3690A8345D33170" ? (
        <>
          <button onClick={_activateMinting}>Activate minting</button>
          <button onClick={_reveal}>Reveal Tokens</button>
          <button onClick={_withdraw}>Withdraw</button>
        </>
      ) : (
        ""
      )}
      {instance
        ? tokensArray.map((token, index) => {
            return (
              <div key={index}>
                <img
                  src={"https://ipfs.io/ipfs/" + token.image.slice(7) + ".png"}
                  alt="tokenImage"
                />
                <div key={index}>{token.tokenID}</div>
              </div>
            );
          })
        : null}
    </div>
  );
}

export default App;
