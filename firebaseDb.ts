import { getDb } from "./firebaseAdmin";

// Helper to convert Firebase Timestamp/dates to strings if needed
function sanitizeDoc(doc: any): any {
  if (!doc) return doc;
  const sanitized = { ...doc };
  // Firestore auto-adds id if we pass doc with id, but let's make sure id is clean
  return sanitized;
}

// GENERAL COLLECTION HELPERS
export async function getCollection(collectionName: string): Promise<any[]> {
  const db = getDb();
  const snapshot = await db.collection(collectionName).get();
  const items: any[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
}

export async function getDocById(collectionName: string, id: string): Promise<any | null> {
  const db = getDb();
  const doc = await db.collection(collectionName).doc(id).get();
  if (!doc.exists) return null;
  return { id: doc.id, ...doc.data() };
}

export async function createDoc(collectionName: string, id: string, data: any): Promise<any> {
  const db = getDb();
  const cleanData = { ...data };
  delete cleanData.id; // Store without redundant id field inside document data if desired, or keep it
  await db.collection(collectionName).doc(id).set(cleanData);
  return { id, ...cleanData };
}

export async function updateDoc(collectionName: string, id: string, data: any): Promise<any> {
  const db = getDb();
  const cleanData = { ...data };
  delete cleanData.id;
  await db.collection(collectionName).doc(id).update(cleanData);
  const updatedDoc = await db.collection(collectionName).doc(id).get();
  return { id: updatedDoc.id, ...updatedDoc.data() };
}

export async function deleteDoc(collectionName: string, id: string): Promise<void> {
  const db = getDb();
  await db.collection(collectionName).doc(id).delete();
}

// USERS OPERATIONS
export async function getUsers(): Promise<any[]> {
  return getCollection("users");
}

export async function getUser(id: string): Promise<any | null> {
  return getDocById("users", id);
}

export async function createUser(id: string, user: any): Promise<any> {
  return createDoc("users", id, user);
}

export async function updateUser(id: string, fields: any): Promise<any> {
  return updateDoc("users", id, fields);
}

export async function deleteUser(id: string): Promise<void> {
  return deleteDoc("users", id);
}

// PROJECTS OPERATIONS
export async function getProjects(): Promise<any[]> {
  return getCollection("projects");
}

export async function getProject(id: string): Promise<any | null> {
  return getDocById("projects", id);
}

export async function createProject(id: string, project: any): Promise<any> {
  return createDoc("projects", id, project);
}

export async function updateProject(id: string, fields: any): Promise<any> {
  return updateDoc("projects", id, fields);
}

export async function deleteProject(id: string): Promise<void> {
  return deleteDoc("projects", id);
}

// TASAS OPERATIONS (TASKS)
export async function getTasks(): Promise<any[]> {
  return getCollection("tasks");
}

export async function getTasksForProject(projectId: string): Promise<any[]> {
  const db = getDb();
  const snapshot = await db.collection("tasks").where("projectId", "==", projectId).get();
  const items: any[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
}

export async function createTask(id: string, task: any): Promise<any> {
  return createDoc("tasks", id, task);
}

export async function updateTask(id: string, fields: any): Promise<any> {
  return updateDoc("tasks", id, fields);
}

export async function deleteTask(id: string): Promise<void> {
  return deleteDoc("tasks", id);
}

// DELIVERABLES OPERATIONS
export async function getDeliverables(): Promise<any[]> {
  return getCollection("deliverables");
}

export async function getDeliverablesForProject(projectId: string): Promise<any[]> {
  const db = getDb();
  const snapshot = await db.collection("deliverables").where("projectId", "==", projectId).get();
  const items: any[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
}

export async function createDeliverable(id: string, deliverable: any): Promise<any> {
  return createDoc("deliverables", id, deliverable);
}

export async function updateDeliverable(id: string, fields: any): Promise<any> {
  return updateDoc("deliverables", id, fields);
}

export async function deleteDeliverable(id: string): Promise<void> {
  return deleteDoc("deliverables", id);
}

// FILES OPERATIONS
export async function getFiles(): Promise<any[]> {
  return getCollection("files");
}

export async function getFilesForProject(projectId: string): Promise<any[]> {
  const db = getDb();
  const snapshot = await db.collection("files").where("projectId", "==", projectId).get();
  const items: any[] = [];
  snapshot.forEach((doc) => {
    items.push({ id: doc.id, ...doc.data() });
  });
  return items;
}

export async function createFile(id: string, file: any): Promise<any> {
  return createDoc("files", id, file);
}

export async function deleteFile(id: string): Promise<void> {
  return deleteDoc("files", id);
}

// COMMENTS OPERATIONS
export async function getComments(targetId?: string): Promise<any[]> {
  if (targetId) {
    const db = getDb();
    const snapshot = await db.collection("comments").where("targetId", "==", targetId).get();
    const items: any[] = [];
    snapshot.forEach((doc) => {
      items.push({ id: doc.id, ...doc.data() });
    });
    return items;
  }
  return getCollection("comments");
}

export async function createComment(id: string, comment: any): Promise<any> {
  return createDoc("comments", id, comment);
}

export async function updateComment(id: string, fields: any): Promise<any> {
  return updateDoc("comments", id, fields);
}

export async function deleteComment(id: string): Promise<void> {
  return deleteDoc("comments", id);
}

// LOGS OPERATIONS
export async function getLogs(): Promise<any[]> {
  const db = getDb();
  // Sort logs by time if possible, or we can sort them in memory.
  // In server.ts they are unshifted, so we should return all and we can sort by id or created desc.
  const logs = await getCollection("logs");
  return logs.sort((a, b) => b.id.localeCompare(a.id));
}

export async function createLog(id: string, log: any): Promise<any> {
  return createDoc("logs", id, log);
}

// DISCIPLINES OPERATIONS
export async function getDisciplines(): Promise<any[]> {
  return getCollection("disciplines");
}

export async function createDiscipline(id: string, discipline: any): Promise<any> {
  return createDoc("disciplines", id, discipline);
}

// ALERTS OPERATIONS
export async function getAlerts(): Promise<any[]> {
  return getCollection("alerts");
}

export async function createAlert(id: string, alert: any): Promise<any> {
  return createDoc("alerts", id, alert);
}
