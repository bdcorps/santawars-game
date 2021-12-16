import React, { useEffect, useState } from "react";
import Sound from 'react-sound';
import "./App.css";
import '@themesberg/flowbite';
import twitterLogo from "./assets/twitter-logo.svg";
import { CONTRACT_ADDRESS, transformCharacterData, transformAllPlayers } from "./constants";
import SantaWars from "./utils/SantaWars.json";
import { ethers } from "ethers";
import SelectCharacter from "./components/SelectCharacter";
import SignupForm from "./components/SignupForm";
import Modal from 'react-modal';
import { toast } from 'react-toastify';


const customStyles = {
  content: {
    top: '50%',
    left: '50%',
    right: 'auto',
    bottom: 'auto',
    marginRight: '-50%',
    transform: 'translate(-50%, -50%)',
  },
};

const aTeam = ["Santa", "Gingerbread Man", "Snowman"]
const bTeam = ["Grinch", "Devil", "Rudolph"]

const App = () => {
  const [santaTeam, showSantaTeam] = useState(true);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [allAddresses, setAllAddresses] = useState(null);
  const [allPlayers, setAllPlayers] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [attackTarget, setAttackTarget] = useState(null);
  const [healingState, setHealingState] = useState('');
  const [healingTarget, setHealingTarget] = useState(null);
  const [modalIsOpen, setIsOpen] = useState(false);
  const [soundURL, setSoundURL] = useState(null);

  const checkIfWalletIsConnected = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        console.log('Make sure you have MetaMask!');
        return;
      } else {
        console.log('We have the ethereum object', ethereum);


        const provider = new ethers.providers.Web3Provider(ethereum);
        const signer = provider.getSigner();
        const gameContract = new ethers.Contract(
          CONTRACT_ADDRESS,
          SantaWars.abi,
          signer
        );

        setGameContract(gameContract);


        const accounts = await ethereum.request({ method: 'eth_accounts' });

        if (accounts.length !== 0) {
          const account = accounts[0];
          console.log('Found an authorized account:', account);
          setCurrentAccount(account);
        } else {
          console.log('No authorized account found');
        }
      }
    } catch (error) {
      console.log(error);
    }
  };

  const connectWalletAction = async () => {
    try {
      const { ethereum } = window;

      if (!ethereum) {
        alert("Download the Metamask extension from the Chrome App Store");
        return;
      }

      /*
       * Fancy method to request access to account.
       */
      const accounts = await ethereum.request({
        method: 'eth_requestAccounts',
      });

      /*
       * Boom! This should print out public address once we authorize Metamask.
       */
      console.log('Connected', accounts[0]);

      setCurrentAccount(accounts[0]);
    } catch (error) {
      console.log(error);
    }
  };

  const runAttackAction = async (targetAddress) => {
    if (characterNFT.hp === 0) {
      toast.error("Can't attack. You have 0 HP.");
      setSoundURL("/fail.wav")
      return;
    }

    try {
      if (gameContract) {
        setAttackState('attacking');
        toast.info("Transaction started: Attacking. It will be completed in ~1 min. Sit tight.");
        setSoundURL("/attack.wav")

        setAttackTarget(targetAddress);

        const attackTxn = await gameContract.attack(targetAddress);
        await attackTxn.wait();
        toast.success("Transaction completed: Attacked!");
        setAttackTarget(null);
        setAttackState('hit');
        setSoundURL("/hit.wav")
      }
    } catch (error) {
      console.error('Error attacking target:', error);
      setAttackState('');
    }
  };


  const runHealingAction = async () => {
    if (characterNFT.hp === 0) {
      toast.error("Can't heal. You have 0 HP.");
      setSoundURL("/fail.wav")
      return;
    }

    try {
      if (gameContract) {
        setHealingState('healing');

        toast.info("Transaction started: Healing. It will be completed in ~1 min. Sit tight.");
        setSoundURL("/heal.wav")
        const healingTxn = await gameContract.heal(currentAccount);
        await healingTxn.wait();

        toast.success("Transaction completed: Healed!");
        setHealingTarget(null);
        setHealingState('');
      }
    } catch (error) {
      console.error('Error healing target:', error);
      setHealingState('');
    }
  };

  const openModal = () => {
    console.log("openning")
    setIsOpen(true);
  }

  const closeModal = () => {
    setIsOpen(false);
  }

  useEffect(() => {
    checkIfWalletIsConnected();
  }, []);


  useEffect(() => {
    const fetchNFTMetadata = async () => {
      console.log('Checking for Character NFT on address:', currentAccount);

      const provider = new ethers.providers.Web3Provider(window.ethereum);
      const signer = provider.getSigner();
      const gameContract = new ethers.Contract(
        CONTRACT_ADDRESS,
        SantaWars.abi,
        signer
      );

      let txn = await gameContract.getNFTOnUser(currentAccount);

      if (txn.name) {
        console.log('User has character NFT');
        if (txn.name) {
          console.log('User has character NFT');
          setCharacterNFT(transformCharacterData(txn));
        } else {
          console.log('No character NFT found');
        }
      } else {
        console.log('No players found');
      }

      await getAll();
    };

    if (currentAccount) {
      console.log('CurrentAccount:', currentAccount);
      fetchNFTMetadata();
    }
  }, [currentAccount]);


  const getAll = async () => {
    const allAddresses = await gameContract.getAllPlayers();
    setAllAddresses(allAddresses);

    const allPlayers = await Promise.all(allAddresses.map(async e => {
      const details = await gameContract.getNFTOnUser(e);
      return { ...details, wallet: e };
    }
    ))



    setAllPlayers(transformAllPlayers(allPlayers));

  }

  useEffect(() => {
    /*
     * Setup logic when this event is fired off
     */
    const onAttackComplete = async (newTargetHp, newPlayerHp) => {
      const targetHp = newTargetHp.toNumber();
      const playerHp = newPlayerHp.toNumber();

      setAttackTarget(null);

      console.log(`AttackComplete: targetHp: ${targetHp} Player Hp: ${playerHp}`);

      setCharacterNFT((prevState) => {
        return { ...prevState, hp: playerHp };
      });


      await getAll();
    };

    if (gameContract) {
      gameContract.on("AttackComplete", onAttackComplete);
    }

    /*
     * Make sure to clean up this event when this component is removed
     */
    return () => {
      if (gameContract) {
        gameContract.off("AttackComplete", onAttackComplete);
      }
    };
  }, [gameContract]);


  console.log({ characterNFT })

  // const grinch = [
  //   { id: 2, hp: 20, maxHP: 100, attackDamage: 40, healingPower: 10 }
  // ]

  const santas = allPlayers && allPlayers.filter(e => aTeam.includes(e.name));
  const grinches = allPlayers && allPlayers.filter(e => bTeam.includes(e.name));

  const santaScore = allPlayers && santas.filter(e => e.hp > 0).length;
  const grinchScore = allPlayers && grinches.filter(e => e.hp > 0).length;

  const curTeam = santaTeam ? santas : grinches

  console.log({ curTeam })

  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <h1 class="text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-purple-400 to-red-600 text-center mt-48 mb-10">
          Santa Wars
        </h1>
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect your ETH wallet
        </button>

        <p className="mt-2">Deploy on Rinkeby testnet so you will not be using any real money</p>

        <div className="w-full mt-10">
          <iframe
            width="100%"
            height="480"
            src="https://www.youtube.com/embed/Tdld3p4ueI0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
          />
        </div>
      </div>
    );
  }

  if (!characterNFT) {
    return (
      <div><SelectCharacter setCharacterNFT={setCharacterNFT} /></div>
    );
  }

  return <div>
    <Modal
      isOpen={modalIsOpen}
      onRequestClose={closeModal}
      style={customStyles}
      contentLabel="Example Modal"
    >
      <h2 className="text-2xl">Instructions</h2>
      <div>
        <h1 className="text-lg mb-4">Santawars is an NFT game where you pick a side - Santa Team or Grinch pack</h1>

        <ul class="list-disc ml-8 mb-8">
          <li>You can attack the other team by pressing the attack button</li>
          <li>You can heal yourself</li>
          <li>The team with most standing people on Dec 25th will be the winner</li>

        </ul>
        <div className="video-responsive">
          <iframe
            width="853"
            height="480"
            src="https://www.youtube.com/embed/Tdld3p4ueI0"
            frameBorder="0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="Embedded youtube"
          />
        </div>

      </div>
    </Modal>



    <Sound
      url={soundURL}
      playStatus={Sound.status.PLAYING}

    />



    <div className="text-center">

      <div className="flex">
        <div className="w-1/5 bg-white h-screen p-4">
          <div className="text-center w-full flex justify-center items-center h-full">

            <div className>
              <div className="flex flex-col items-center pb-10">
                <img className="h-24 w-24 mb-3" src={characterNFT.imageURI} alt="grinch" />
                <h3 className="text-xl text-gray-900 font-medium mb-1 dark:text-white">#{characterNFT.name}</h3>
                <span className="text-gray-500 dark:text-gray-400">HP = {characterNFT.hp}/{characterNFT.maxHp}</span> <span className="text-gray-500 dark:text-gray-400">Attack Damage = {characterNFT.attackDamage}</span> <span className="text-gray-500 dark:text-gray-400">Healing Power = {characterNFT.healingPower}</span>
                <div className="flex space-x-3 mt-4 lg:mt-6">
                  <button onClick={() => { runHealingAction() }} className="text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Heal <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button >

                </div>

                <button className="mt-4" onClick={openModal}>Show instructions</button>
              </div>
            </div>

          </div>

        </div>
        <div className="w-4/5 p-4 bg-gray-100">

          <h1 className="text-3xl">Santa Wars</h1>
          <h2 className="text-2xl">{`${santaScore}-${grinchScore} (Santa is winning)`}</h2>

          <div className="inline-flex shadow-sm rounded-md mt-4">
            <button onClick={() => { showSantaTeam(true) }} className="rounded-l-lg border border-gray-200 bg-white text-sm font-medium px-4 py-2  hover:bg-gray-100 text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
              Santa Team
            </button>
            <button onClick={() => { showSantaTeam(false) }} className="rounded-r-md border border-gray-200 bg-white text-sm font-medium px-4 py-2 text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
              Grinch Pack
            </button>
          </div>


          <div className="h-3/5">
            <div className="flex flex-col">
              <div className="">
                <div className="py-2 inline-block">
                  <div className="overflow-hidden sm:rounded-lg shadow-md">
                    <table className="min-w-full">
                      <thead className="bg-gray-100 dark:bg-gray-700">
                        <tr>
                          <th scope="col" className="text-xs font-medium text-gray-700 px-6 py-3 text-left uppercase tracking-wider dark:text-gray-400">
                            ID
                          </th>
                          <th scope="col" className="text-xs font-medium text-gray-700 px-6 py-3 text-left uppercase tracking-wider dark:text-gray-400">
                            Health
                          </th>
                          <th scope="col" className="text-xs font-medium text-gray-700 px-6 py-3 text-left uppercase tracking-wider dark:text-gray-400">
                            Attack Damage
                          </th>
                          <th scope="col" className="text-xs font-medium text-gray-700 px-6 py-3 text-left uppercase tracking-wider dark:text-gray-400">
                            Healing Power
                          </th>

                          <th scope="col" className="relative px-6 py-3">
                            <span className="sr-only">Attack</span>
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {allPlayers && curTeam.map((e, i) => {
                          return <tr className={`bg-white border-b dark:bg-gray-800 dark:border-gray-600 ${attackTarget === i && "animate-wiggle"}`}>
                            <td className="px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {e.id}
                            </td>
                            <td className="px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                              {e.hp + " / " + e.maxHp}
                            </td>
                            <td className="text-sm text-left text-gray-500 px-6 py-4 whitespace-nowrap dark:text-gray-400">
                              {e.attackDamage}
                            </td>
                            <td className="text-sm text-left text-gray-500 px-6 py-4 whitespace-nowrap dark:text-gray-400">
                              {e.healingPower}
                            </td>

                            <td className="px-6 py-4 text-left whitespace-nowrap text-sm font-medium">
                              {!(((aTeam.includes(e.name) && aTeam.includes(characterNFT.name)) || (bTeam.includes(e.name) && bTeam.includes(characterNFT.name)))) && <button onClick={() => { runAttackAction(e.wallet) }} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                                Attack
                                <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                              </button>}
                            </td>
                          </tr>

                        })}



                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="h-full bg-red-400">

          </div>

        </div>


      </div>
      <SignupForm />
    </div>
  </div>
};

export default App;
