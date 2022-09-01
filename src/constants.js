const CONTRACT_ADDRESS = "0xe5fE73e9E91c63110ef7F8729846eb2F08679034";

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        maneuver: characterData.maneuver.toNumber(),
        tubeRiding: characterData.tubeRiding.toNumber(),
        aerial: characterData.aerial.toNumber(),
        owner: characterData.owner.toString(),
        score: characterData.score.toNumber(),
    };
};

const transformBossData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        waves: characterData.waves.toNumber(),
        maxWaves: characterData.maxWaves.toNumber(),
        attackDamage: characterData.attackDamage.toNumber(),
    };
};

export { CONTRACT_ADDRESS, transformCharacterData, transformBossData };