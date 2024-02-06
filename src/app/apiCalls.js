// src/apiCalls.js
import axios from "axios";

const makeApiCall = async (call, updateQueue, saveResponse, refreshToken) => {
  updateQueue(call.id, "in progress");

  try {
    const response = await axios.get(call.url, { headers: { Authorization: `Bearer ${refreshToken}` } });
    saveResponse({ url: call.url, name: response.data.name, id: Date.now() });
    updateQueue(call.id, "completed");
  } catch (error) {
    if (error.response && error.response.status === 401) {
      // Handle the 401 Unauthorized error
      // We may need to refresh token
      updateQueue(call.id, "failed");
    } else {
      updateQueue(call.id, "failed");
    }
  }
};

export default makeApiCall;
