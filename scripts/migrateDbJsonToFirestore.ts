import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import { initializeApp, cert } from "firebase-admin/app";
import { getFirestore } from "firebase-admin/firestore";

dotenv.config();

async function runMigration() {
  console.log("=================================================");
  console.log("INICIANDO MIGRACIÓN DESDE DB.JSON A FIRESTORE");
  console.log("=================================================");

  const projectId = process.env.FIREBASE_PROJECT_ID;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  let privateKey = process.env.FIREBASE_PRIVATE_KEY;

  if (!projectId || !clientEmail || !privateKey) {
    console.error("ERROR: Faltan credenciales de Firebase en las variables de entorno.");
    console.error("Asegúrese de definir FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL y FIREBASE_PRIVATE_KEY en su archivo .env");
    process.exit(1);
  }

  privateKey = privateKey.replace(/\\n/g, "\n");

  try {
    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
    console.log("Firebase Admin inicializado correctamente.");
  } catch (err: any) {
    console.error("Error al inicializar Firebase Admin:", err.message);
    process.exit(1);
  }

  const db = getFirestore();
  const dbJsonPath = path.join(process.cwd(), "db.json");

  if (!fs.existsSync(dbJsonPath)) {
    console.error(`ERROR: No se encontró el archivo ${dbJsonPath}`);
    process.exit(1);
  }

  let localDb: any;
  try {
    const rawData = fs.readFileSync(dbJsonPath, "utf8");
    localDb = JSON.parse(rawData);
  } catch (err: any) {
    console.error("Error al leer/analizar db.json:", err.message);
    process.exit(1);
  }

  // Collections to migrate
  const collections = [
    "users",
    "projects",
    "tasks",
    "deliverables",
    "files",
    "comments",
    "logs",
    "disciplines",
    "alerts"
  ];

  const summary: Record<string, number> = {};

  for (const coll of collections) {
    console.log(`\nMigrando colección: "${coll}"...`);
    const list = localDb[coll];
    if (!list || !Array.isArray(list)) {
      console.log(`- Sin datos o formato no válido para "${coll}". Saltando...`);
      summary[coll] = 0;
      continue;
    }

    let count = 0;
    for (const item of list) {
      if (!item || typeof item !== "object") continue;
      
      // Ensure we have a valid unique ID
      let id = item.id;
      if (id === undefined || id === null) {
        id = `gen-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
      }
      id = String(id);

      // Clean the item to avoid nested references or undefined values
      const docData = { ...item };
      delete docData.id; // Store ID as document ID rather than field inside doc

      // Write to firestore doc
      await db.collection(coll).doc(id).set(docData);
      count++;
    }
    console.log(`- ¡Colección "${coll}" migrada con éxito! (${count} documentos)`);
    summary[coll] = count;
  }

  console.log("\n=================================================");
  console.log("RESUMEN DE MIGRACIÓN EXITOSA:");
  console.log("=================================================");
  for (const [coll, count] of Object.entries(summary)) {
    console.log(`- ${coll.padEnd(15)}: ${count} documentos migrados`);
  }
  console.log("=================================================");
  console.log("Proceso completado.");
  process.exit(0);
}

runMigration().catch((err) => {
  console.error("Ocurrió un error fatal durante la migración:", err);
  process.exit(1);
});
