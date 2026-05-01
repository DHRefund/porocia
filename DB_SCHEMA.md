# Firestore Database Schema

This document outlines the Firestore collections and document structures used in the Porocia project.

## 1. Collections

### `users` (Root Collection)
Stores user profiles and is automatically synchronized with Firebase Auth upon login or registration.

- **Document ID:** Firebase Auth `uid`
- **Fields:**
  - `uid` *(string)*: Unique identifier (matches Auth UID).
  - `email` *(string | null)*: User's email address.
  - `displayName` *(string)*: Display name (defaults to email prefix if not set).
  - `photoURL` *(string)*: Avatar URL.
  - `bio` *(string)*: User's biography or status.
  - `role` *(string)*: User's role (default: `"member"`).
  - `createdAt` *(Firestore Timestamp)*: Time of account creation.
  - `lastLoginAt` *(Firestore Timestamp)*: Time of last login (updated automatically).

#### Sub-collection: `readState/{channelId}`
Tracks each user's last read position per channel.

- **Document ID:** `channelId`
- **Fields:**
  - `lastReadAt` *(Firestore Timestamp)*: Last time user opened this channel.
  - `lastReadMessageId` *(string)*: Document ID of the last message the user read.

---

### `channels` (Root Collection)
Stores chat channels.

- **Document ID:** Auto-generated ID or predefined `channelId`.
- **Fields:**
  - `name` *(string)*: Channel name.
  - `description` *(string)*: Description of the channel.
  - `createdBy` *(string)*: `uid` of the user who created the channel.
  - `isArchived` *(boolean)*: Whether the channel is archived (default: `false`).
  - `createdAt` *(Firestore Timestamp)*: Time of creation.
  - `members` *(string[])*: Array of `uid`s who have participated in this channel. Updated via `arrayUnion` each time a user sends a message.
  - `unreadCount` *(Record\<string, number\>)*: Map of `uid → unread message count`. Incremented for all members except sender on each new message. Reset to `0` when a member opens the channel (`markChannelAsRead`).

#### Sub-collection: `messages/{messageId}`
Stores individual chat messages within a specific channel.

- **Document ID:** Auto-generated ID.
- **Fields:**
  - `text` *(string)*: The content of the message.
  - `senderId` *(string)*: `uid` of the sender.
  - `senderEmail` *(string)*: Email of the sender (cached for display).
  - `senderName` *(string)*: Display name of the sender at the time of sending.
  - `type` *(string)*: Message type (currently `"text"`).
  - `createdAt` *(Firestore Timestamp)*: Time the message was sent.
  - `updatedAt` *(Firestore Timestamp | null)*: Time the message was last edited.
  - `readBy` *(string[])*: Array of `uid`s who have read this message. Sender is pre-populated on creation.
  - `readAt` *(Record\<string, Timestamp\>)*: Map of `uid → timestamp` recording when each user read the message.

---

## 2. Read Receipt Logic Summary

| Event | Firestore Writes |
|-------|-----------------|
| User **sends** a message | New `messages` doc with `readBy: [senderUid]`; `channels/{id}.unreadCount[uid] += 1` for all other current members; `channels/{id}.members` updated via `arrayUnion` |
| User **opens** a channel | `messages/{latest}.readBy` += `uid`; `messages/{latest}.readAt[uid]` = now; `users/{uid}/readState/{channelId}` written; `channels/{id}.unreadCount[uid]` = 0 |

---

## 3. Security & Indexing Notes
- Requires composite index on `messages` sub-collection: `createdAt DESC`.
- `unreadCount` uses Firestore `increment()` server-side to avoid race conditions.
- All read receipt writes are batched via `writeBatch` for atomicity.
- *Security Rules: to be expanded.*
