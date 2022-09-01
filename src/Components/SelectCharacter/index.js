import React, { useEffect, useState } from "react";
import "./SelectCharacter.css";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData } from "../../constants";
import mySurfGame from "../../utils/MySurfGame.json";
import LoadingIndicator from "../LoadingIndicator";

const SelectCharacter = ({ setCharacterNFT }) => {
    const [characters, setCharacters] = useState([]);
    const [gameContract, setGameContract] = useState(null);

    const [mintingCharacter, setMintingCharacter] = useState(false);

    const mintCharacterNFTAction = (characterId) => async () => {
        try {
            if (gameContract) {
                setMintingCharacter(true);
                console.log("Mintando personagem...");
                const mintTxn = await gameContract.mintCharacterNFT(characterId);
                await mintTxn.wait();
                console.log("mintTxn:", mintTxn);
                setMintingCharacter(false);
            }
        } catch (error) {
            console.warn("MintCharacterAction Error:", error);
            setMintingCharacter(false);
        }
    };

    useEffect(() => {
        const { ethereum } = window;

        if (ethereum) {
            const provider = new ethers.providers.Web3Provider(ethereum);
            const signer = provider.getSigner();
            const gameContract = new ethers.Contract(
                CONTRACT_ADDRESS,
                mySurfGame.abi,
                signer
            );

            setGameContract(gameContract);
        } else {
            console.log("Objeto Ethereum não encontrado");
        }
    }, []);

    useEffect(() => {
        const getCharacters = async () => {
            try {
                console.log("Buscando contrato de personagens para mintar");

                /*
                 * Get all available surfers
                 */
                const charactersTxn = await gameContract.getAllDefaultCharacters();
                console.log("charactersTxn:", charactersTxn);

                const characters = charactersTxn.map((characterData) =>
                    transformCharacterData(characterData)
                );

                setCharacters(characters);
            } catch (error) {
                console.error("Algo deu errado ao buscar personagens:", error);
            }
        };

        const onCharacterMint = async (sender, tokenId, characterIndex) => {
            console.log(
                `CharacterNFTMinted - sender: ${sender} tokenId: ${tokenId.toNumber()} characterIndex: ${characterIndex.toNumber()}`
            );
            if (gameContract) {
                const characterNFT = await gameContract.checkIfUserHasNFT();
                console.log("CharacterNFT: ", characterNFT);
                setCharacterNFT(transformCharacterData(characterNFT));

                alert(
                    `Seu NFT está pronto -- veja aqui: https://testnets.opensea.io/assets/mumbai/${CONTRACT_ADDRESS}/${tokenId.toNumber()}`
                );
            }
        };

        if (gameContract) {
            getCharacters();

            //Configure NFT minted listener
            gameContract.on("CharacterNFTMinted", onCharacterMint);
        }

        return () => {
            // Cleanup listener on dismount
            if (gameContract) {
                gameContract.off("CharacterNFTMinted", onCharacterMint);
            }
        };
    }, [gameContract]);

    const renderCharacters = () =>
        characters.map((character, index) => (
            <div className="character-item" key={character.name}>
                <div className="name-container">
                    <p>{character.name}</p>
                </div>
                <img src={`https://cloudflare-ipfs.com/ipfs/${character.imageURI}`} alt={character.name} />
                <button
                    type="button"
                    className="character-mint-button"
                    onClick={mintCharacterNFTAction(index)}
                >{`Mintar ${character.name}`}</button>
            </div>
        ));

    return (
        <div className="select-character-container">
            <h2>Minte seu Surfista 🌊 🏄🏻 🏄‍♀️</h2>
            {characters.length > 0 && (
                <div className="character-grid">{renderCharacters()}</div>
            )}
            {mintingCharacter && (
                <div className="loading">
                    <div className="indicator">
                        <LoadingIndicator />
                        <p>Mintando personagem...</p>
                    </div>
                    <video autoPlay controls loop>
                        <source
                            src="https://thumbs.gfycat.com/PettySameFanworms-mobile.mp4"
                            alt="Indicador de Mintagem"
                        />
                    </video>
                </div>
            )}
        </div>
    );
};

export default SelectCharacter;