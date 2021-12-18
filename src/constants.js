const CONTRACT_ADDRESS = "0x5f1C2f4d271Ce91c310CD4ab5F99d97ff2D0faAd";

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
