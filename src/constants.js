const CONTRACT_ADDRESS = "0x9560aA7138e7f39F0bbF5e33e67F67d7a117048f";

const transformCharacterData = (characterData) => {
  return {
    id: characterData.characterIndex.toNumber(),
    name: characterData.name,
    imageURI: characterData.imageURI,
    hp: characterData.hp.toNumber(),
    maxHp: characterData.maxHp.toNumber(),
    attackDamage: characterData.attackDamage.toNumber(),
    healingPower: characterData.healingPower.toNumber(),
  };
};

const transformAllPlayers = (players) => {
  return players.map(e => transformCharacterData(e))
};

export { CONTRACT_ADDRESS, transformCharacterData, transformAllPlayers };
