import { 
  collection, 
  getDocs, 
  doc, 
  updateDoc, 
  addDoc, 
  deleteDoc, 
  query, 
  orderBy, 
  serverTimestamp,
  arrayUnion,
  arrayRemove
} from "firebase/firestore";
import { db } from "./client";

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL: string;
  bio: string;
  role: string;
  createdAt?: any;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  members: string[]; // uids
  createdAt?: any;
  createdBy?: string;
}

const USERS_COLLECTION = "users";
const GROUPS_COLLECTION = "groups";

/**
 * Fetch all users
 */
export async function getAllUsers(): Promise<UserProfile[]> {
  const usersRef = collection(db, USERS_COLLECTION);
  const q = query(usersRef, orderBy("displayName", "asc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      uid: doc.id,
      email: data.email || "",
      displayName: data.displayName || "",
      photoURL: data.photoURL || "",
      bio: data.bio || "",
      role: data.role || "member",
      createdAt: data.createdAt
    } as UserProfile;
  });
}

/**
 * Update user role
 */
export async function updateUserRole(uid: string, role: string) {
  const userRef = doc(db, USERS_COLLECTION, uid);
  await updateDoc(userRef, { role });
}

/**
 * Fetch all groups
 */
export async function getAllGroups(): Promise<Group[]> {
  const groupsRef = collection(db, GROUPS_COLLECTION);
  const q = query(groupsRef, orderBy("name", "asc"));
  const snapshot = await getDocs(q);
  
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name || "",
      description: data.description || "",
      members: data.members || [],
      createdAt: data.createdAt,
      createdBy: data.createdBy
    } as Group;
  });
}

/**
 * Create a new group
 */
export async function createGroup(name: string, description: string, creatorUid: string): Promise<string> {
  const groupsRef = collection(db, GROUPS_COLLECTION);
  const docRef = await addDoc(groupsRef, {
    name,
    description,
    members: [],
    createdBy: creatorUid,
    createdAt: serverTimestamp()
  });
  return docRef.id;
}

/**
 * Update group details
 */
export async function updateGroupDetails(groupId: string, name: string, description: string) {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(groupRef, { name, description });
}

/**
 * Delete a group
 */
export async function deleteGroup(groupId: string) {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  await deleteDoc(groupRef);
}

/**
 * Add a member to a group
 */
export async function addMemberToGroup(groupId: string, uid: string) {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(groupRef, {
    members: arrayUnion(uid)
  });
}

/**
 * Remove a member from a group
 */
export async function removeMemberFromGroup(groupId: string, uid: string) {
  const groupRef = doc(db, GROUPS_COLLECTION, groupId);
  await updateDoc(groupRef, {
    members: arrayRemove(uid)
  });
}
