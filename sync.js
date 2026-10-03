import {
  initializeApp
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

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


/* ================================
   FIREBASE INITIALIZATION
   ================================ */

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


  /* ================================
     SHARED FIRESTORE + AUTH API
     ================================ */

  window.SYNC = {

    /* Listen to a Firestore document */
    watch: (key, success, error) => {

      return onSnapshot(
        doc(db, "app", key),

        snapshot => {

          success(
            snapshot.exists()
              ? snapshot.data()
              : null
          );

        },

        error

      );

    },


    /* Save data to Firestore */
    set: (key, data) => {

      return setDoc(
        doc(db, "app", key),
        data
      );

    },


    /* Firebase login */
    login: (email, password) => {

      return signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    },


    /* Firebase logout */
    logout: () => {

      return signOut(auth);

    },


    /* Current Firebase user */
    who: callback => {

      return onAuthStateChanged(
        auth,

        user => {

          callback(
            user
              ? user.email
              : null
          );

        }

      );

    },


    /* Password reset */
    reset: email => {

      return sendPasswordResetEmail(
        auth,
        email
      );

    },


    /* Create Firebase user */
    create: async (email, password) => {

      const newApp = initializeApp(
        cfg,
        "create-" + Date.now()
      );

      const newAuth = getAuth(newApp);

      await createUserWithEmailAndPassword(
        newAuth,
        email,
        password
      );

    }

  };

} else {

  console.error(
    "Firebase configuration is missing or invalid."
  );

}


/* Tell app.js that sync.js has loaded */

window.__syncReady = true;

window.dispatchEvent(
  new Event("sync-ready")
);
