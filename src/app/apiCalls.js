// src/apiCalls.js
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";

const RETRY_LIMIT = 3;

const makeApiCall = async (call, updateQueue, saveResponse, db) => {
  updateQueue(call.id, "in progress");

  try {
    const response = await axios.get(call.url, { headers: { Authorization: `Bearer ${call.refreshToken}` } });
    const fetchedData = response.data;

    // Cache the response locally
    cacheResponse(call.id, fetchedData, false);

    // Try to save to Firestore with retry logic
    await retrySaveToFirestore(call.id, fetchedData, db, 0);

    saveResponse({ ...call, name: fetchedData.name, firestoreSaved: true });
    updateQueue(call.id, "completed");
  } catch (error) {
    console.error("Error in API call or Firestore operation:", error);
    updateQueue(call.id, "failed");
  }
};

const cacheResponse = (id, data, firestoreSaved) => {
  const cachedData = {
    data,
    firestoreSaved,
  };
  localStorage.setItem(`apiResponse-${id}`, JSON.stringify(cachedData));
};

const updateCachedResponse = (id, firestoreSaved) => {
  const cachedItem = localStorage.getItem(`apiResponse-${id}`);
  if (cachedItem) {
    const cachedData = JSON.parse(cachedItem);
    cachedData.firestoreSaved = firestoreSaved;
    localStorage.setItem(`apiResponse-${id}`, JSON.stringify(cachedData));
  }
};

const retrySaveToFirestore = async (id, data, db, retryCount) => {
  try {
    await addDoc(collection(db, "starWarsData"), {
      ...data,
      timestamp: new Date().toISOString()
    });
    updateCachedResponse(id, true);
  } catch (error) {
    if (retryCount < RETRY_LIMIT) {
      await retrySaveToFirestore(id, data, db, retryCount + 1);
    } else {
      console.error("Failed to save to Firestore after retries:", error);
      updateCachedResponse(id, false);
    }
  }
};

export default makeApiCall;
