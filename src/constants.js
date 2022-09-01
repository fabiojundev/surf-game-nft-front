const CONTRACT_ADDRESS = "0xd97d4Cf8d57708434cC5F0EE6549d212623182f8";

const transformCharacterData = (characterData) => {
    return {
        name: characterData.name,
        imageURI: characterData.imageURI,
        hp: characterData.hp.toNumber(),
        maxHp: characterData.maxHp.toNumber(),
        maneuver: characterData.maneuver.toNumber(),
        tubeRiding: characterData.tubeRiding.toNumber(),
        aerial: characterData.aerial.toNumber(),
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