import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getFirestore, Firestore } from "firebase-admin/firestore";
import * as dotenv from "dotenv";

dotenv.config();

let dbInstance: Firestore | null = null;
let isInitialized = false;

// FALLBACK TEMPORAL: Permite el uso local resiliente si no hay credenciales configuradas todavía
const ENABLE_LOCAL_FALLBACK = true;

export function getDb(): Firestore {
  if (dbInstance) return dbInstance;

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    if (ENABLE_LOCAL_FALLBACK) {
      console.warn("ALERTA: Faltan credenciales de Firebase. Fallback temporal activo.");
      // Se lanzará un error si no se desea usar fallback.
    }
    throw new Error(
      "ERROR DE CONFIGURACIÓN: Faltan las credenciales de Cloud Firestore. " +
      "Por favor defina FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en su archivo .env o configuración del sistema."
    );
  }

  if (privateKey) {
    privateKey = privateKey.replace(/\\n/g, "\n");
  }

  if (!isInitialized) {
    try {
      if (getApps().length === 0) {
        initializeApp({
          credential: cert({
            projectId,
            clientEmail,
            privateKey,
          }),
        });
      }
      isInitialized = true;
      console.log("Firebase Admin inicializado de manera exitosa.");
    } catch (err: any) {
      console.error("Error inicializando Firebase Admin SDK:", err);
      throw err;
    }
  }

  dbInstance = getFirestore();
  return dbInstance;
}

export function isFirebaseConfigured(): boolean {
  return !!(process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY);
}
