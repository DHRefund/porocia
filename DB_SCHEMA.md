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

### `channels` (Root Collection)
Stores chat channels.

- **Document ID:** Auto-generated ID or predefined `channelId`.
- **Fields:**
  - `name` *(string)*: Channel name.
  - `description` *(string)*: Description of the channel.
  - `createdBy` *(string)*: `uid` of the user who created the channel.
  - `isArchived` *(boolean)*: Whether the channel is archived (default: `false`).
  - `createdAt` *(Firestore Timestamp)*: Time of creation.

### `messages` (Sub-collection under `channels/{channelId}`)
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

## 2. Security & Indexing Notes
- *To be expanded as Firestore Security Rules are implemented.*
- Requires composite indexes for queries sorting by `createdAt` in `messages` sub-collections.
