// src/apiCalls.js
import axios from "axios";
import { addDoc, collection } from "firebase/firestore";

const RETRY_LIMIT = 3;

const makeApiCall = async (call, updateQueue, saveResponse, db, simulatePacketLossRate) => {
  let retryCount = 0;
  let success = false;

  while (!success && retryCount < RETRY_LIMIT) {
    // Simulate packet loss
    if (simulatePacketLossRate > 0 && Math.random() < simulatePacketLossRate) {
      console.log(`Simulated packet loss for ${call.url}, retrying... Attempt ${retryCount + 1}`);
      retryCount++;
      // Delay before retrying to simulate network delay, could be adjusted as needed
      await new Promise(resolve => setTimeout(resolve, 1000));
      continue; // Skip the current iteration to retry
    }

    try {
      const response = await axios.get(call.url, { headers: { Authorization: `Bearer ${call.refreshToken}` } });
      const fetchedData = response.data;

      // Cache the response locally
      cacheResponse(call.id, fetchedData, false);

      // Save to Firestore and attempt retries if necessary
      const firestoreResult = await retrySaveToFirestore(call.id, fetchedData, db, 0);
      saveResponse({ ...call, name: fetchedData.name, firestoreSaved: firestoreResult });

      updateQueue(call.id, "completed");
      success = true; // Successfully completed the API call, exit the loop
    } catch (error) {
      console.error(`Error in API call to ${call.url}:`, error);
      retryCount++;
      if (retryCount >= RETRY_LIMIT) {
        // Final failure after retries, update queue status
        updateQueue(call.id, "failed");
        cacheResponse(call.id, {}, false); // Optionally cache an empty response or error status
      } else {
        // Delay before retrying to simulate network delay, could be adjusted as needed
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }
};

const cacheResponse = (id, data, firestoreSaved) => {
  const cachedData = { id, data, firestoreSaved };
  localStorage.setItem(`apiResponse-${id}`, JSON.stringify(cachedData));
};

const retrySaveToFirestore = async (id, data, db, retryCount) => {
  try {
    await addDoc(collection(db, "starWarsData"), {
      ...data,
      timestamp: new Date().toISOString()
    });
    return true; // Successfully saved to Firestore
  } catch (error) {
    if (retryCount < RETRY_LIMIT) {
      return await retrySaveToFirestore(id, data, db, retryCount + 1); // Recursively retry
    } else {
      console.error("Failed to save to Firestore after retries:", error);
      return false; // Indicate failure to save after retries
    }
  }
};

export default makeApiCall;
