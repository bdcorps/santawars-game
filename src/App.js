import React, { useEffect, useState } from "react";
import "./App.css";
import '@themesberg/flowbite';
import twitterLogo from "./assets/twitter-logo.svg";
import { CONTRACT_ADDRESS, transformCharacterData } from "./constants";
import myEpicGame from "./utils/MyEpicNFT.json";
import { ethers } from "ethers";

const App = () => {
  const [santaTeam, showSantaTeam] = useState(true);

  const santa = [
    { id: 1, hp: 50, maxHP: 100, attackDamage: 40, healingPower: 10 }
  ]

  const grinch = [
    { id: 2, hp: 20, maxHP: 100, attackDamage: 40, healingPower: 10 }
  ]

  useEffect(() => {

  });

  const team = santaTeam ? santa : grinch;

  return <div className="text-center">
    <div className="flex flex-wrap">


    </div>

    <div className="flex">
      <div className="w-1/5 bg-white h-screen p-4">
        <div className="text-center w-full flex justify-center items-center h-full">

          <div className="">
            <div className="flex flex-col items-center pb-10">
              <img className="h-24 w-24 mb-3" src="https://imgur.com/xNgesuL.png" alt="grinch" />
              <h3 className="text-xl text-gray-900 font-medium mb-1 dark:text-white">#{santa[0].id}</h3>
              <span className="text-sm text-gray-500 dark:text-gray-400">HP = {santa[0].hp}/{santa[0].maxHP}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Attack Damage = {santa[0].attackDamage}</span> <span className="text-sm text-gray-500 dark:text-gray-400">Healing Power = {santa[0].healingPower}</span>
              <div className="flex space-x-3 mt-4 lg:mt-6">
                <button className="text-white bg-green-500 hover:bg-green-800 focus:ring-4 focus:ring-green-300 font-medium rounded-lg text-sm px-4 py-2 text-center inline-flex items-center dark:bg-green-600 dark:hover:bg-green-700 dark:focus:ring-green-800">Heal</button >

              </div>
            </div>
          </div>

        </div>

      </div>
      <div className="w-4/5 h-screen p-4 bg-gray-100">

        <h1 className="text-3xl">Santa Wars</h1>
        <h2 className="text-2xl">52-41 (Santa is winning)</h2>

        <div class="inline-flex shadow-sm rounded-md mt-4">
          <button onClick={() => { showSantaTeam(true) }} class="rounded-l-lg border border-gray-200 bg-white text-sm font-medium px-4 py-2  hover:bg-gray-100 text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
            Santa Team
          </button>
          <button onClick={() => { showSantaTeam(false) }} class="rounded-r-md border border-gray-200 bg-white text-sm font-medium px-4 py-2 text-gray-900 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-2 focus:ring-blue-700 focus:text-blue-700 dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:hover:text-white dark:hover:bg-gray-600 dark:focus:ring-blue-500 dark:focus:text-white">
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



                    {team.map(e => {
                      return <tr className="bg-white border-b dark:bg-gray-800 dark:border-gray-600">
                        <td className="px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {e.id}
                        </td>
                        <td className="px-6 py-4 text-left whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {e.hp + " / " + e.maxHP}
                        </td>
                        <td className="text-sm text-left text-gray-500 px-6 py-4 whitespace-nowrap dark:text-gray-400">
                          {e.attackDamage}
                        </td>
                        <td className="text-sm text-left text-gray-500 px-6 py-4 whitespace-nowrap dark:text-gray-400">
                          {e.healingPower}
                        </td>

                        <td className="px-6 py-4 text-left whitespace-nowrap text-sm font-medium">
                          <button className="text-white bg-red-700 hover:bg-red-800 focus:ring-4 focus:ring-red-300 font-medium rounded-lg text-sm px-3 py-2 text-center inline-flex items-center dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-800">
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
  </div>
};

export default App;
