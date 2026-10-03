import {initializeApp} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  sendPasswordResetEmail
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";

const cfg = window.FIREBASE_CONFIG;

if (
  cfg &&
  cfg.apiKey &&
  cfg.authDomain &&
  cfg.projectId &&
  cfg.appId
) {

  const app = initializeApp(cfg);
  const db = getFirestore(app);
  const auth = getAuth(app);

  window.SYNC = {

    watch: (k, ok, err) =>
      onSnapshot(
        doc(db, "app", k),
        s => ok(s.exists() ? s.data() : null),
        err
      ),

    set: (k, d) =>
      setDoc(doc(db, "app", k), d),

    login: (e, p) =>
      signInWithEmailAndPassword(auth, e, p),

    logout: () =>
      signOut(auth),

    who: cb =>
      onAuthStateChanged(auth, u => cb(u ? u.email : null)),

    reset: e =>
      sendPasswordResetEmail(auth, e),

    create: async (e, p) => {
      const a2 = getAuth(
        initializeApp(cfg, "create-" + Date.now())
      );

      await createUserWithEmailAndPassword(a2, e, p);
    }
  };
}

window.__syncReady = true;
window.dispatchEvent(new Event("sync-ready"));
