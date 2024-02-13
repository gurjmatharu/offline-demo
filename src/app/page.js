'use client';

import React, { useState, useEffect } from "react";
import makeApiCall from "./apiCalls";
import { timeSince } from "./utils";
import useNetworkStatus from "./useNetworkStatus";
import db from './firebaseConfig';
import { deleteAllDocuments } from "./firestoreOperations";

export default function Home() {
  const [isOnline, setIsOnline] = useNetworkStatus();
  const [apiQueue, setApiQueue] = useState([]);
  const [apiResponses, setApiResponses] = useState([]);
  const [refreshToken, setRefreshToken] = useState("initial-token");
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);
  const [packetLossRate, setPacketLossRate] = useState("");

  useEffect(() => {
    const savedResponses = JSON.parse(localStorage.getItem("apiResponses") || "[]");
    setApiResponses(savedResponses);
  }, []);

  useEffect(() => {
    if (isOnline) {
      // Attempt to retry queued or retrying calls when coming back online
      apiQueue.forEach(call => {
        if (call.status === "queued" || call.status === "retrying") {
          makeApiCall(call, updateQueue, saveResponse, db, parseFloat(packetLossRate) / 100 || 0);
        }
      });
    }
  }, [isOnline, apiQueue]);

  const saveResponse = (response) => {
    const updatedResponses = [...apiResponses, response];
    setApiResponses(updatedResponses);
    localStorage.setItem("apiResponses", JSON.stringify(updatedResponses));
  };

  const updateQueue = (id, newStatus) => {
    const updatedQueue = apiQueue.map(call => call.id === id ? { ...call, status: newStatus, lastRetry: new Date() } : call);
    setApiQueue(updatedQueue);
  };

  const addToQueue = () => {
    let randomId = Math.floor(Math.random() * 50) + 1;
    while (randomId === 17) {
      randomId = Math.floor(Math.random() * 50) + 1;
    }
    const url = `https://swapi.dev/api/people/${randomId}/`;
    const newCall = {
      id: Date.now(),
      url,
      status: isOnline ? "in progress" : "queued",
      timestamp: new Date(),
      refreshToken,
    };
    setApiQueue(prevQueue => [...prevQueue, newCall]);
    if (isOnline) {
      makeApiCall(newCall, updateQueue, saveResponse, db, parseFloat(packetLossRate) / 100 || 0);
    }
  };

  const clearAllData = async () => {
    localStorage.removeItem("apiResponses");
    setApiResponses([]);
    setApiQueue([]);
    await deleteAllDocuments(db);
  };

  const handleToggle = () => setIsOnline(!isOnline);
  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <p className="text-lg">Current Mode: {isOnline ? "Online" : "Offline"}</p>
        <p className="text-lg">Token Status: {isRefreshingToken ? "Refreshing..." : "Active"}</p>
      </div>

      <div className="mb-4">
        <label htmlFor="packetLossRate" className="block text-sm font-medium text-gray-700">Packet Loss Rate (%)</label>
        <input
          type="number"
          id="packetLossRate"
          value={packetLossRate}
          onChange={(e) => setPacketLossRate(e.target.value)}
          className="text-black mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          placeholder="0-100"
        />
      </div>

      <div className="mb-4">
        <button onClick={handleToggle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">Switch to {isOnline ? "Offline" : "Online"}</button>
        <button onClick={clearAllData} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">Clear All Data (Local & Cloud)</button>
      </div>

      <div className="mb-4">
        <h2 className="text-2xl mb-2">API Queue:</h2>
        <table className="table-auto w-full mb-4">
          <thead>
            <tr>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2">Status</th>
              <th className="px-4 py-2">Time Ago</th>
            </tr>
          </thead>
          <tbody>
            {apiQueue.map((call) => (
              <tr key={call.id}>
                <td className="border px-4 py-2">{call.url}</td>
                <td className="border px-4 py-2">{call.status}</td>
                <td className="border px-4 py-2">{timeSince(call.timestamp)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div>
        <h2 className="text-2xl mb-2">API Responses:</h2>
        <table className="table-auto w-full">
          <thead>
            <tr>
              <th className="px-4 py-2">URL</th>
              <th className="px-4 py-2">Name</th>
              <th className="px-4 py-2">Saved in Firestore (POST)</th>
            </tr>
          </thead>
          <tbody>
            {apiResponses.map((response) => (
              <tr key={response.id}>
                <td className="border px-4 py-2">{response.url}</td>
                <td className="border px-4 py-2">{response.name}</td>
                <td className="border px-4 py-2">{response.firestoreSaved ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addToQueue} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">Make API Call to Star Wars API</button>
    </main>
  );
}
