const CONTRACT_ADDRESS = "0x8Ef393c39c548f06f130d0caacDf0d2D344A789F";

const transformCharacterData = (characterData) => {
  return {
    id: characterData.characterIndex.toNumber(),
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    healingPower: characterData.healingPower.toNumber(),
    wallet: characterData.wallet
  };
};

const transformAllPlayers = (players) => {
  return players.map(e => transformCharacterData(e))
};

export { CONTRACT_ADDRESS, transformCharacterData, transformAllPlayers };
