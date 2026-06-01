import { collection, onSnapshot, query, addDoc, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { Gift } from '../types';

const GIFTS_COLLECTION = 'gifts';

export function subscribeToGifts(callback: (gifts: Gift[]) => void) {
  const q = query(collection(db, GIFTS_COLLECTION));
  
  return onSnapshot(
    q,
    (snapshot) => {
      const gifts = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data()
      })) as Gift[];
      // Sort gifts: available first, then by creation date descending
      gifts.sort((a, b) => {
        if (a.status !== b.status) {
          return a.status === 'available' ? -1 : 1;
        }
        return (b.createdAt || 0) - (a.createdAt || 0);
      });
      callback(gifts);
    },
    (error) => handleFirestoreError(error, OperationType.LIST, GIFTS_COLLECTION)
  );
}

export async function addGift(name: string, description: string, photoUrl: string) {
  try {
    await addDoc(collection(db, GIFTS_COLLECTION), {
      name,
      description,
      photoUrl,
      status: 'available',
      chosenBy: '',
      public: true,
      createdAt: Date.now() // using client timestamp for simplicity, but serverTimestamp is better for rules. Wait, rules require number type and I used Date.now().
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, GIFTS_COLLECTION);
  }
}

export async function chooseGift(giftId: string, guestName: string) {
  try {
    const giftRef = doc(db, GIFTS_COLLECTION, giftId);
    await updateDoc(giftRef, {
      status: 'chosen',
      chosenBy: guestName
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GIFTS_COLLECTION}/${giftId}`);
  }
}

export async function unchooseGift(giftId: string) {
  try {
    const giftRef = doc(db, GIFTS_COLLECTION, giftId);
    await updateDoc(giftRef, {
      status: 'available',
      chosenBy: ''
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${GIFTS_COLLECTION}/${giftId}`);
  }
}

export async function deleteGift(giftId: string) {
  try {
    const giftRef = doc(db, GIFTS_COLLECTION, giftId);
    await deleteDoc(giftRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `${GIFTS_COLLECTION}/${giftId}`);
  }
}
