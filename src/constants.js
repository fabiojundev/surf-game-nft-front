const CONTRACT_ADDRESS = "0x75a2070f498ce9D845103baf3c92695C1ebb1085";

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

export { CONTRACT_ADDRESS, transformCharacterData };