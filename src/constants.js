const CONTRACT_ADDRESS = "0xA35fCCD0dc7a7315e6eD2EC8E1227d00224ceFc5";

const transformCharacterData = (characterData) => {
  return {
    id: characterData.characterIndex.toNumber(),
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    healingPower: characterData.healingPower.toNumber(),
    wallet: characterData.wallet,
  };
};

const transformAllPlayers = (players) => {
  return players.map((e) => transformCharacterData(e));
};

export { CONTRACT_ADDRESS, transformCharacterData, transformAllPlayers };
