'use client';

import React, { useState, useEffect } from "react";
import makeApiCall from "./apiCalls";
import { timeSince } from "./utils";
import useNetworkStatus from "./useNetworkStatus";
import db from './firebaseConfig';  // Import the Firestore instance
import { deleteAllDocuments } from "./firestoreOperations"; // Import the Firestore 

export default function Home() {
  const [isOnline, setIsOnline] = useNetworkStatus();
  const [apiQueue, setApiQueue] = useState([]);
  const [apiResponses, setApiResponses] = useState([]);
  const [refreshToken, setRefreshToken] = useState("initial-token");
  const [isRefreshingToken, setIsRefreshingToken] = useState(false);

  const mockRefreshToken = () => {
    setIsRefreshingToken(true);
    // Simulate a token refresh process with a timeout
    setTimeout(() => {
      // Mock new token - in real scenario, this would come from an auth service
      setRefreshToken(`refreshed-token-${Date.now()}`);
      setIsRefreshingToken(false);
    }, 2000); // 2 seconds delay to simulate token refresh
  };
  useEffect(() => {
    const savedResponses = JSON.parse(localStorage.getItem("apiResponses") || "[]");
    setApiResponses(savedResponses);
  }, []);

  const saveResponse = (response) => {
    setApiResponses((prevResponses) => {
      const updatedResponses = [...prevResponses, response];
      localStorage.setItem("apiResponses", JSON.stringify(updatedResponses));
      return updatedResponses;
    });
  };

  const updateQueue = (id, newStatus) => {
    setApiQueue((prevQueue) => prevQueue.map((call) => call.id === id ? { ...call, status: newStatus } : call));
  };

  const handleToggle = () => {
    setIsOnline(!isOnline);
  };

  const addToQueue = () => {
    const randomId = Math.floor(Math.random() * 50) + 1;
    const url = `https://swapi.dev/api/people/${randomId}/`;
    const newCall = { id: Date.now(), url, status: isOnline ? "in progress" : "queued", timestamp: new Date(), refreshToken };
    setApiQueue((prevQueue) => [...prevQueue, newCall]);
    if (isOnline) {
      makeApiCall(newCall, updateQueue, saveResponse, db);  // Pass db to makeApiCall
    }
  };

  useEffect(() => {
    if (isOnline) {
      apiQueue.forEach((call) => {
        if (call.status === "queued") {
          makeApiCall(call, updateQueue, saveResponse, db);  // Pass db to makeApiCall
        }
      });
    }
  }, [isOnline, apiQueue]);

  const clearAllData = async () => {
    // Clear local storage
    localStorage.removeItem("apiResponses");
    setApiResponses([]);
    setApiQueue([]);

    // Clear Firestore database
    await deleteAllDocuments(db);
  };

  const sortedApiQueue = [...apiQueue].sort((a, b) => b.timestamp - a.timestamp);
  const sortedApiResponses = [...apiResponses].sort((a, b) => b.timestamp - a.timestamp);

  return (
    <main className="container mx-auto p-4">
      <div className="mb-4">
        <p className="text-lg">{`Current Mode: ${isOnline ? "Online" : "Offline"}`}</p>
        <p className="text-lg">{`Token Status: ${isRefreshingToken ? "Refreshing..." : "Active"}`}</p>
      </div>

      <div className="mb-4">
        <button onClick={handleToggle} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded mr-2">
          {isOnline ? "Switch to Offline" : "Switch to Online"}
        </button>
        <button onClick={clearAllData} className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded">
          Clear All Data (Local & Cloud)
        </button>
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
            {sortedApiQueue.map((call) => (
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
              <th className="px-4 py-2">Saved in Firestore</th>
            </tr>
          </thead>
          <tbody>
            {sortedApiResponses.map((response) => (
              <tr key={response.id}>
                <td className="border px-4 py-2">{response.url}</td>
                <td className="border px-4 py-2">{response.name}</td>
                <td className="border px-4 py-2">{response.firestoreSaved ? "Yes" : "No"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <button onClick={addToQueue} className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded mt-4">
        Make API Call to Star Wars API
      </button>
    </main>
  );
}
