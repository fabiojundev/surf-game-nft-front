import React, { useEffect, useState } from "react"
import twitterLogo from "./assets/twitter-logo.svg"
import "./App.css"
import SelectCharacter from "./Components/SelectCharacter";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import { ethers } from "ethers";
import mySurfGame from "./utils/MySurfGame.json";

// Constants
const TWITTER_HANDLE = "web3dev_"
const TWITTER_LINK = `https://twitter.com/${TWITTER_HANDLE}`

const App = () => {
  const [currentAccount, setCurrentAccount] = useState(null);
  const [characterNFT, setCharacterNFT] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log("Eu acho que você não tem a metamask!");
        return;
      } else {
        console.log("Nós temos o objeto ethereum", ethereum);
      }
      /*
       * Checa se estamos autorizados a acessar a carteira do usuário.
       */
      const accounts = await ethereum.request({ method: "eth_accounts" });

      /*
       * Usuário pode ter múltiplas contas autorizadas, pegamos a primeira se estiver ali!
       */
      if (accounts.length !== 0) {
        const account = accounts[0];
        console.log("Carteira conectada::", account);
        setCurrentAccount(account);
      } else {
        console.log("Não encontramos uma carteira conectada");
      }
    } catch (error) {
      console.log(error);
    }
  };

  const renderContent = () => {
    // User does not have a connected account
    if (!currentAccount) {
      return (
        <div className="connect-wallet-container">
          <video autoPlay loop muted controls width="550" height="550">
            <source src="https://thumbs.gfycat.com/LankyPotableAiredale-mobile.mp4" type="video/mp4"></source>
          </video>
          <button
            className="cta-button connect-wallet-button"
            onClick={connectWalletAction}
          >
            Conecte sua carteira para começar
          </button>
        </div>
      );
      /*
       * cenário #2
       */
    } else if (currentAccount && !characterNFT) {
      return <SelectCharacter setCharacterNFT={setCharacterNFT} />;
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Instale a MetaMask!");
        return;
      }

      /*
       * Método chique para pedir acesso para a conta.
       */
      const accounts = await ethereum.request({
        method: "eth_requestAccounts",
      });

      /*
       * Boom! Isso deve escrever o endereço público uma vez que autorizarmos Metamask.
       */
      console.log("Contectado", accounts[0]);
      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    const checkNetwork = async () => {
      try {
        if (window.ethereum.networkVersion !== "80001") {
          alert("Please connect to Mumbai Polygon!");
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkIfWalletIsConnected();
    checkNetwork();
  }, []);

  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log("Verificando pelo personagem NFT no endereço:", currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        mySurfGame.abi,
        signer
      );

      const txn = await gameContract.checkIfUserHasNFT();
      console.log("txn",txn);
      if (txn.name) {
        console.log("Usuário tem um personagem NFT");
        setCharacterNFT(transformCharacterData(txn));
      } else {
        console.log("Nenhum personagem NFT foi encontrado");
      }
    };

    /*
     * Nós so queremos rodar isso se tivermos uma wallet conectada
     */
    if (currentAccount) {
      console.log("Conta Atual:", currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);
  return (
    <div className="App">
      <div className="container">
        <div className="header-container">
          <p className="header gradient-text">🌊 Surfe no Metaverso 🌊</p>
          <p className="sub-text">Junte-se a mim para surfar as ondas do Metaverso!</p>
          {renderContent()}
        </div>
        <div className="footer-container">
          <img alt="Twitter Logo" className="twitter-logo" src={twitterLogo} />
          <a
            className="footer-text"
            href={TWITTER_LINK}
            target="_blank"
            rel="noreferrer"
          >{`construído por @${TWITTER_HANDLE}`}</a>
        </div>
      </div>
    </div>
  )
}

export default App
