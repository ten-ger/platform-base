import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  getDocs,
  Firestore,
  DocumentData,
  PartialWithFieldValue,
  CollectionReference,
  query,
  where,
  orderBy,
  QueryConstraint,
  WhereFilterOp,
  OrderByDirection
} from 'firebase/firestore';
import { FirebaseAppService } from './firebase-app';
import { Log } from './log';

export abstract class FirestoreBaseService {
  protected static _db: Firestore | null = null;

  protected collectionName: string;
  protected collectionRef: CollectionReference<DocumentData>;

  public static async initialize(): Promise<void> {
    if (FirestoreBaseService._db) {
      Log.info('Firestore client already initialized (static).');
      return;
    }

    try {
      if (!FirebaseAppService.app) {
        Log.error('Firebase app not initialized. Call FirebaseAppService.initialize() first.');
        throw new Error('Firebase app not initialized.');
      }

      FirestoreBaseService._db = getFirestore(FirebaseAppService.app);
      Log.debug('Firestore client initialized successfully (static).');
    } catch (error) {
      Log.error(`Error initializing Firestore client (static): ${error.message}`);
      FirestoreBaseService._db = null;
      throw error;
    }
  }

  protected constructor(collectionName: string) {
    this.collectionName = collectionName;
    if (!FirestoreBaseService._db) { 
      throw new Error('Firestore client not initialized before creating service instance. Call FirestoreBaseService.initialize() first.');
    }
    this.collectionRef = collection(FirestoreBaseService._db, this.collectionName);
  }

  protected getDb(): Firestore {
    if (!FirestoreBaseService._db) {
      throw new Error('Firestore client not initialized. Call FirestoreBaseService.initialize() first.');
    }
    return FirestoreBaseService._db;
  }

  protected getCollectionRef(): CollectionReference<DocumentData> {
    return this.collectionRef;
  }

  protected async getDocument<T extends DocumentData>(docId: string): Promise<T | undefined> {
    try {
      const docRef = doc(this.collectionRef, docId); 
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as T;
      } else {
        Log.debug(`Document '${docId}' not found in collection '${this.collectionName}'.`);
        return undefined;
      }
    } catch (error) {
      Log.error(`Error getting document '${docId}' from collection '${this.collectionName}': ${error.message}`);
      throw error;
    }
  }

  protected async getAllDocuments<T extends DocumentData>(): Promise<T[]> {
    try {
      const querySnapshot = await getDocs(this.collectionRef); 
      const documents: T[] = [];
      querySnapshot.forEach((docSnap) => {
        documents.push(docSnap.data() as T);
      });
      return documents;
    } catch (error) {
      Log.error(`Error getting all documents from collection '${this.collectionName}': ${error.message}`);
      throw error;
    }
  }

  protected async queryCollection<T extends DocumentData>(
    filters: { field: string; operator: WhereFilterOp; value: any }[] = [],
    sortBy: { field: string; direction: OrderByDirection }[] = []
  ): Promise<T[]> {
    try {
      let q = this.collectionRef;
      let queryConstraints: QueryConstraint[] = [];

      // Apply filters
      filters.forEach(filter => {
        queryConstraints.push(where(filter.field, filter.operator, filter.value));
      });

      // Apply sorting
      sortBy.forEach(sort => {
        queryConstraints.push(orderBy(sort.field, sort.direction));
      });

      const finalQuery = query(q, ...queryConstraints);
      const querySnapshot = await getDocs(finalQuery);

      const documents: T[] = [];
      querySnapshot.forEach((docSnap) => {
        documents.push(docSnap.data() as T);
      });
      return documents;
    } catch (error) {
      Log.error(`Error querying collection '${this.collectionName}': ${error.message}`);
      throw error;
    }
  }

  protected async setDocument<T extends DocumentData>(docId: string, data: T): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, docId); 
      await setDoc(docRef, data);
    } catch (error) {
      Log.error(`Error setting document '${docId}' in collection '${this.collectionName}': ${error.message}`);
      throw error;
    }
  }

  protected async updateDocument(docId: string, data: PartialWithFieldValue<DocumentData>): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, docId); 
      await updateDoc(docRef, data);
    } catch (error) {
      Log.error(`Error updating document '${docId}' in collection '${this.collectionName}': ${error.message}`);
      throw error;
    }
  }

  protected async deleteDocument(docId: string): Promise<void> {
    try {
      const docRef = doc(this.collectionRef, docId); 
      await deleteDoc(docRef);
    } catch (error) {
      Log.error(`Error deleting document '${docId}' from collection '${this.collectionName}': ${error.message}`);
      throw error;
    }
  }
}