# Sonainfo Executive Portal

Files: index.html (page), style.css (design), app.js (all features), sync.js (live sync), firebase-config.js (your keys), firestore.rules (database rules).

## 1. Set up Firebase (free, 10 minutes)
1. Go to https://console.firebase.google.com and click Add project.
2. Build > Firestore Database > Create database. Pick a region near you (asia-south1 Mumbai). Start in production mode.
3. Firestore > Rules tab. Paste the content of firestore.rules and click Publish.
4. Build > Authentication > Get started > Sign-in method > turn on Email/Password.
5. Authentication > Users > Add user. Create these 5 logins (password must be 6 or more characters):
   chairman@sonainfo.com, sec@sonainfo.com, hod@sonainfo.com, dc@sonainfo.com, financial@sonainfo.com
6. Authentication > Settings > Authorized domains > Add domain: YOURNAME.github.io
7. Project settings (gear icon) > Your apps > Web (</>) > register app. Copy the config values into firebase-config.js.

## 2. Put it on GitHub
1. Create an account at github.com, then New repository (name: sonainfo-portal, Public or Private).
2. Click "uploading an existing file", drag in ALL files from this folder, click Commit changes.
3. Settings > Pages > Source: Deploy from a branch > Branch: main, folder: / (root) > Save.
4. After about a minute your site is at https://YOURNAME.github.io/sonainfo-portal/

Opening index.html by double-click will not give live sync (browsers block it). Use the GitHub link.

## 3. First use
Sign in as sec@sonainfo.com. The first sign-in creates the sample data in the database. SEC can then edit everything and use Access control to tick what each person can see and do. New users added there get a real login automatically.

## Know the limits
- Access rules are checked inside the app. The database rule only requires a signed-in account, so a technical person with a valid login could bypass them. For strict rules, ask a developer to extend firestore.rules.
- Removing a user in Access control blocks them in the portal. To delete their login too, remove them in Firebase > Authentication.
- Employee names are sample data. SEC can edit them one by one.
