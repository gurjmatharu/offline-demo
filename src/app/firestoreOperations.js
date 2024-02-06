import { deleteDoc, collection, getDocs } from "firebase/firestore";

export const deleteAllDocuments = async (db) => {
  const querySnapshot = await getDocs(collection(db, "starWarsData"));
  querySnapshot.forEach((doc) => {
    deleteDoc(doc.ref);
  });
};
