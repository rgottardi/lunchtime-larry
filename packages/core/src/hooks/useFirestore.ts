import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  limit,
  QueryConstraint,
  DocumentData,
  FirestoreError,
  WithFieldValue,
  DocumentReference,
  setDoc,
  updateDoc,
  deleteDoc,
  serverTimestamp,
  DocumentSnapshot,
  QuerySnapshot,
} from 'firebase/firestore';
import { useCallback, useEffect, useState } from 'react';
import { db } from '../lib/firebase';

export function useDocument<T = DocumentData>(path: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const docRef = doc(db, path);
        const docSnap = await getDoc(docRef);
        setData((docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null) as T);
        setError(null);
      } catch (err) {
        setError(err as FirestoreError);
        setData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path]);

  const update = useCallback(
    async (data: Partial<WithFieldValue<T>>) => {
      try {
        const docRef = doc(db, path);
        await updateDoc(docRef, {
          ...data,
          updatedAt: serverTimestamp(),
        });
        return { error: null };
      } catch (err) {
        return { error: err as FirestoreError };
      }
    },
    [path]
  );

  const set = useCallback(
    async (data: WithFieldValue<T>) => {
      try {
        const docRef = doc(db, path);
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { error: null };
      } catch (err) {
        return { error: err as FirestoreError };
      }
    },
    [path]
  );

  const remove = useCallback(
    async () => {
      try {
        const docRef = doc(db, path);
        await deleteDoc(docRef);
        return { error: null };
      } catch (err) {
        return { error: err as FirestoreError };
      }
    },
    [path]
  );

  return {
    data,
    loading,
    error,
    update,
    set,
    remove,
  };
}

export function useCollection<T = DocumentData>(
  path: string,
  constraints: QueryConstraint[] = []
) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<FirestoreError | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const collectionRef = collection(db, path);
        const q = query(collectionRef, ...constraints);
        const querySnapshot = await getDocs(q);
        setData(
          querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as T[]
        );
        setError(null);
      } catch (err) {
        setError(err as FirestoreError);
        setData([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [path, constraints]);

  const add = useCallback(
    async (data: WithFieldValue<T>) => {
      try {
        const docRef = doc(collection(db, path));
        await setDoc(docRef, {
          ...data,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });
        return { id: docRef.id, error: null };
      } catch (err) {
        return { id: null, error: err as FirestoreError };
      }
    },
    [path]
  );

  return {
    data,
    loading,
    error,
    add,
  };
}

export function useQuery<T = DocumentData>(
  path: string,
  constraints: QueryConstraint[]
) {
  return useCollection<T>(path, constraints);
}

// Helper function to create constraints
export const createConstraints = {
  where: (...args: Parameters<typeof where>) => where(...args),
  orderBy: (...args: Parameters<typeof orderBy>) => orderBy(...args),
  limit: (...args: Parameters<typeof limit>) => limit(...args),
};