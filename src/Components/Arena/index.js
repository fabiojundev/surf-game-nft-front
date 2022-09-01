import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformBossData } from "../../constants";
import mySurfGame from "../../utils/MySurfGame.json";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";

const Arena = ({ characterNFT, setCharacterNFT }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);

    const [attackState, setAttackState] = useState("");

    const runAttackAction = async () => {
        try {
            if (gameContract) {
                setAttackState("surfing");
                console.log("Pegando a onda...");
                const attackTxn = await gameContract.attackBoss();
                await attackTxn.wait();
                console.log("surfTxn:", attackTxn);
                setAttackState("scored");
            }
        } catch (error) {
            console.error("Erro ao dropar a onda:", error);
            setAttackState("");
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
        const fetchBoss = async () => {
            const bossTxn = await gameContract.getBigBoss();
            console.log("Pico:", bossTxn);
            setBoss(transformBossData(bossTxn));
        };

        const onAttackComplete = (newBossHp, newPlayerHp) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}`);

            /*
            * Atualiza o hp do boss e do player
            */
            setBoss((prevState) => {
                return { ...prevState, waves: bossHp };
            });

            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp };
            });
        };

        if (gameContract) {
            fetchBoss();
            gameContract.on('AttackComplete', onAttackComplete);
        }

        return () => {
            if (gameContract) {
                gameContract.off('AttackComplete', onAttackComplete);
            }
        }
    }, [gameContract]);

    return (
        <div className="arena-container">
            {boss && (
                <div className="boss-container">
                    <div className={`boss-content ${attackState}`}>
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
                    {attackState === "surfing" && (
                        <div className="loading-indicator">
                            <LoadingIndicator />
                            <p>Atacando ⚔️</p>
                        </div>
                    )}
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