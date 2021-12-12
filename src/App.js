import React, { useEffect, useState } from "react";
import "./App.css";
import '@themesberg/flowbite';
import twitterLogo from "./assets/twitter-logo.svg";
import { CONTRACT_ADDRESS, transformCharacterData, transformAllPlayers } from "./constants";
import SantaWars from "./utils/SantaWars.json";
import { ethers } from "ethers";
import SelectCharacter from "./components/SelectCharacter";
import SignupForm from "./components/SignupForm";
import Modal from 'react-modal';

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

const App = () => {
  const [santaTeam, showSantaTeam] = useState(true);
  const [characterNFT, setCharacterNFT] = useState(null);
  const [currentAccount, setCurrentAccount] = useState(null);
  const [allAddresses, setAllAddresses] = useState(null);
  const [allPlayers, setAllPlayers] = useState(null);
  const [gameContract, setGameContract] = useState(null);
  const [attackState, setAttackState] = useState('');
  const [attackTarget, setAttackTarget] = useState(null);
  const [modalIsOpen, setIsOpen] = React.useState(false);

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
    try {
      if (gameContract) {
        setAttackState('attacking');
        console.log('Attacking target...', allAddresses[targetAddress]);
        setAttackTarget(targetAddress);
        const attackTxn = await gameContract.attack(allAddresses[targetAddress]);
        await attackTxn.wait();
        console.log('attackTxn:', attackTxn);
        setAttackTarget(null);
        setAttackState('hit');
      }
    } catch (error) {
      console.error('Error attacking boss:', error);
      setAttackState('');
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

    const allPlayers = await Promise.all(allAddresses.map(async e => await gameContract.getNFTOnUser(e)
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

  const santas = allPlayers && allPlayers.filter(e => e.name === "Santa");
  const grinches = allPlayers && allPlayers.filter(e => e.name === "Grinch");

  const santaScore = allPlayers && santas.filter(e => e.hp > 0).length;
  const grinchScore = allPlayers && grinches.filter(e => e.hp > 0).length;

  const curTeam = santaTeam ? santas : grinches

  if (!currentAccount) {
    return (
      <div className="connect-wallet-container">
        <img
          src="https://64.media.tumblr.com/tumblr_mbia5vdmRd1r1mkubo1_500.gifv"
          alt="Monty Python Gif"
        />
        <button
          className="cta-button connect-wallet-button"
          onClick={connectWalletAction}
        >
          Connect Wallet To Get Started
        </button>
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
      <div>Santawars is an NFT game where you pick a side - Santa Team or Grinch pack.
        <ul class="list-disc ml-8">
          <li>You need the <a className="text-blue-500" href="https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en">Chrome Metamask Extension</a> to play</li>
          <li>Connect to the Rinkeby Testnet like detailed <a className="text-blue-500" href="https://gist.github.com/tschubotz/8047d13a2d2ac8b2a9faa3a74970c7ef">here</a></li>
          <li>Get some fake ether by entering your wallet address <a className="text-blue-500" href="https://faucets.chain.link/rinkeby">here</a></li>
          <li>Once completed, reload the page and you should see a Connect to Metamask pop up</li>
        </ul>

      </div>
    </Modal>


    <div className="text-center">

      <div className="flex">
        <div className="w-1/5 bg-white h-screen p-4">
          <div className="text-center w-full flex justify-center items-center h-full">

            <div className="">
              <div className="flex flex-col items-center pb-10">

                <img className="h-24 w-24 mb-3" src={characterNFT.imageURI} alt="grinch" />
                <h3 className="text-xl text-gray-900 font-medium mb-1 dark:text-white">#{characterNFT.id}</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">HP = {characterNFT.hp}/{characterNFT.maxHp}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Attack Damage = {characterNFT.attackDamage}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Healing Power = {characterNFT.healingPower}</span>
                <div className="flex space-x-3 mt-4 lg:mt-6">
                  <button className="text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Heal <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg></button >

                </div>



                <button className="mt-4" onClick={openModal}>Show instructions</button>
              </div>
            </div>

          </div>

        </div>
        <div className="w-4/5 h-screen p-4 bg-gray-100">

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
                          <span className="sr-only">Edit</span>
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
                            <button onClick={() => { runAttackAction(i) }} className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
                              Attack
                              <svg className="-mr-1 ml-2 h-4 w-4" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clip-rule="evenodd"></path></svg>
                            </button>
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


      </div>
      <SignupForm />
    </div>
  </div>
};

export default App;
