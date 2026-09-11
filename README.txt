SMART BUWABA FIRESTORE WEBSITE — UPGRADED

Included:
- Firestore videos collection
- YouTube links supported in videoUrl
- MP4/direct video links supported
- Thumbnail, title, description and category
- Likes
- Comments
- Follow buttons
- In-app notifications
- Anonymous Firebase Authentication
- Starter Firestore rules in firestore.rules

IMPORTANT:
1. In Firebase Console, enable Authentication -> Sign-in method -> Anonymous.
2. Replace your Firestore Rules with the contents of firestore.rules.
3. Upload index.html and logo.png to your GitHub Pages repository.
4. Keep the Firebase project settings already inside index.html.

Firestore video fields:
title          string
description    string
thumbnailUrl   string (optional)
videoUrl       string
category       string
date           string (recommended)
ownerId        string (added automatically when publishing from the site)
likeCount      number
commentCount   number
