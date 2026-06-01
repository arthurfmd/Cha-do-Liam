import { doc, onSnapshot, setDoc, getDoc } from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from '../lib/firebase';
import { EventInfo } from '../types';

const SETTINGS_COLLECTION = 'settings';
const EVENT_INFO_DOC = 'eventInfo';

const defaultEventInfo: EventInfo = {
  date: '25 de Agosto às 15h',
  location: 'Rua das Flores, 123'
};

export function subscribeToEventInfo(callback: (info: EventInfo) => void) {
  const docRef = doc(db, SETTINGS_COLLECTION, EVENT_INFO_DOC);
  
  return onSnapshot(
    docRef,
    (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data() as EventInfo);
      } else {
        callback(defaultEventInfo);
      }
    },
    (error) => handleFirestoreError(error, OperationType.GET, `${SETTINGS_COLLECTION}/${EVENT_INFO_DOC}`)
  );
}

export async function updateEventInfo(info: EventInfo) {
  try {
    const docRef = doc(db, SETTINGS_COLLECTION, EVENT_INFO_DOC);
    await setDoc(docRef, info);
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, `${SETTINGS_COLLECTION}/${EVENT_INFO_DOC}`);
  }
}
