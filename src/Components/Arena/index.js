import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformCharacterData, transformBossData } from "../../constants";
import mySurfGame from "../../utils/MySurfGame.json";
import "./Arena.css";

const Arena = ({ characterNFT }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);

    const runAttackAction = async () => { };

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
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log("Pico:", bossTxn);
            setBoss(transformBossData(bossTxn));
        };

        if (gameContract) {
            fetchBoss();
        }
    }, [gameContract]);

    return (
        <div className="arena-container">
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content`}>
                        <h2>🔥 {boss.name} 🔥</h2>
                        <div className="image-content">
                            <img src={boss.imageURI} alt={`Boss ${boss.name}`} />
                            <div className="health-bar">
                                <progress value={boss.waves} max={boss.maxWaves} />
                                <p>{`${boss.waves} / ${boss.maxWaves} HP`}</p>
                            </div>
                        </div>
                    </div>
                    <div className="attack-container">
                        <button className="cta-button" onClick={runAttackAction}>
                            {`🌊 Surfar ${boss.name} 🌊`}
                        </button>
                    </div>
                </div>
            )}
            {characterNFT && (
                <div className="players-container">
                    <div className="player-container">
                        <h2>Seu Surfista</h2>
                        <div className="player">
                            <div className="image-content">
                                <h2>{characterNFT.name}</h2>
                                <img
                                    src={characterNFT.imageURI}
                                    alt={`Character ${characterNFT.name}`}
                                />
                                <div className="health-bar">
                                    <progress value={characterNFT.hp} max={characterNFT.maxHp} />
                                    <p>{`${characterNFT.hp} / ${characterNFT.maxHp} HP`}</p>
                                </div>
                            </div>
                            <div className="stats">
                                <h4>{`🌊  Manobras: ${characterNFT.maneuver}, Tubos: ${characterNFT.tubeRiding}, Aérios: ${characterNFT.aerial}`}</h4>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Arena;