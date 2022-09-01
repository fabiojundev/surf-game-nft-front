import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { CONTRACT_ADDRESS, transformBossData } from "../../constants";
import mySurfGame from "../../utils/MySurfGame.json";
import "./Arena.css";
import LoadingIndicator from "../LoadingIndicator";

const Arena = ({ characterNFT, setCharacterNFT, allSurfersNFTs, setAllSurfersNFTs }) => {
    const [gameContract, setGameContract] = useState(null);
    const [boss, setBoss] = useState(null);
    const [attackState, setAttackState] = useState("");
    const [showToast, setShowToast] = useState(false);
    const [attackDamage, setAttackDamage] = useState(0);

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

        const onAttackComplete = (newBossHp, newPlayerHp, newScore) => {
            const bossHp = newBossHp.toNumber();
            const playerHp = newPlayerHp.toNumber();
            const scored = newScore.toNumber();

            console.log(`AttackComplete: Boss Hp: ${bossHp} Player Hp: ${playerHp}, score: ${scored}`);

            /*
            * Atualiza o hp do boss e do player
            */
            setBoss((prevState) => {
                setAttackDamage(prevState?.waves - bossHp);
                return { ...prevState, waves: bossHp };
            });


            setCharacterNFT((prevState) => {
                return { ...prevState, hp: playerHp, score: scored };
            });

            setAllSurfersNFTs(prevState => prevState.map(surfer =>
                surfer.owner === characterNFT.owner ? { ...characterNFT, score: scored } : surfer)
            );

            setShowToast(true);
            setTimeout(() => {
                setShowToast(false);
            }, 5000);
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

    //Order surfers, putting the current surfer as the first one.
    const allSurfers = [
        characterNFT,
        ...allSurfersNFTs.filter( surfer => characterNFT.owner !== surfer.owner)
    ];

    return (
        <div className="arena-container">
            {boss && characterNFT && (
                <div id="toast" className={showToast ? "show" : ""}>
                    <div id="desc">{`💥 ${boss.name} tomou ${attackDamage} de dano!`}</div>
                </div>
            )}

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
                            <p>Surfando 🌊 </p>
                        </div>
                    )}
                </div>
            )}
            <div className="players-container">
                {allSurfers?.map((surfer) => (
                        <div className="player-container" key={surfer.owner}>
                            <h2>{characterNFT.owner === surfer.owner ? 'Seu Surfista' : 'Equipe'}</h2>
                            <div className="player">
                                <div className="image-content">
                                    <h2>{surfer.name}</h2>
                                    <img
                                        src={`https://cloudflare-ipfs.com/ipfs/${surfer.imageURI}`}
                                        alt={`Character ${surfer.name}`}
                                    />
                                    <div className="health-bar">
                                        <progress value={surfer.hp} max={surfer.maxHp} />
                                        <p>{`${surfer.hp} / ${surfer.maxHp} HP`}</p>
                                    </div>
                                </div>
                                <div className="stats">
                                    <h4>{`🌊  Manobras: ${surfer.maneuver}, Tubos: ${surfer.tubeRiding}, Aéreos: ${surfer.aerial}`}</h4>
                                    <h4>{`Score: ${surfer.score}`}</h4>
                                    <h4>Carteira:</h4>
                                    <p class="wallet-address">{surfer.owner}</p>
                                </div>
                            </div>
                        </div>

                    ))
                }
            </div>
        </div>
    );
};

export default Arena;