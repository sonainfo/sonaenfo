import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";

import {
  getFirestore,
  doc,
  onSnapshot,
  setDoc
} from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
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


  /*
   * IMPORTANT:
   * Keep Firebase login alive after browser/page refresh.
   */
  const persistenceReady = setPersistence(
    auth,
    browserLocalPersistence
  ).catch(err => {

    console.error(
      "Firebase persistence error:",
      err
    );

    throw err;

  });


  window.SYNC = {

    /*
     * FIRESTORE WATCH
     */
    watch: (
      key,
      success,
      error
    ) => {

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


    /*
     * FIRESTORE SAVE
     */
    set: async (
      key,
      data
    ) => {

      await persistenceReady;

      await setDoc(
        doc(db, "app", key),
        data
      );

    },


    /*
     * FIREBASE LOGIN
     */
    login: async (
      email,
      password
    ) => {

      await persistenceReady;

      return signInWithEmailAndPassword(
        auth,
        email,
        password
      );

    },


    /*
     * FIREBASE LOGOUT
     */
    logout: async () => {

      await signOut(auth);

    },


    /*
     * CURRENT USER
     */
    who: callback => {

      persistenceReady
        .then(() => {

          onAuthStateChanged(
            auth,
            user => {

              callback(
                user
                  ? user.email
                  : null
              );

            }
          );

        })
        .catch(err => {

          console.error(
            "Firebase auth initialization error:",
            err
          );

          callback(null);

        });

    },


    /*
     * PASSWORD RESET
     */
    reset: async email => {

      await persistenceReady;

      return sendPasswordResetEmail(
        auth,
        email
      );

    },


    /*
     * CREATE NEW FIREBASE USER
     */
    create: async (
      email,
      password
    ) => {

      const newApp =
        initializeApp(
          cfg,
          "create-" + Date.now()
        );

      const newAuth =
        getAuth(newApp);

      await setPersistence(
        newAuth,
        browserLocalPersistence
      );

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


window.__syncReady = true;

window.dispatchEvent(
  new Event("sync-ready")
);
