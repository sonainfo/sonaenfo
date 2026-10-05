/*
 * Sonainfo Executive Portal
 * Firebase-free sync layer
 *
 * Backend:
 * https://sonainfo-backend-2.onrender.com
 */

const API_BASE =
  "https://sonainfo-backend-2.onrender.com";

const ACCESS_KEY = "sonainfo_access_token";
const REFRESH_KEY = "sonainfo_refresh_token";

let accessToken =
  localStorage.getItem(ACCESS_KEY) || "";

let refreshToken =
  localStorage.getItem(REFRESH_KEY) || "";

let whoCallback = null;

let socket = null;
let socketRetryTimer = null;
let socketRetryMs = 1000;
let socketConnecting = false;

const watchers = new Map();
const versions = new Map();


/* =========================
   TOKEN MANAGEMENT
========================= */

function saveTokens(access, refresh) {

  accessToken = access || "";
  refreshToken = refresh || "";

  if (accessToken) {
    localStorage.setItem(
      ACCESS_KEY,
      accessToken
    );
  } else {
    localStorage.removeItem(
      ACCESS_KEY
    );
  }

  if (refreshToken) {
    localStorage.setItem(
      REFRESH_KEY,
      refreshToken
    );
  } else {
    localStorage.removeItem(
      REFRESH_KEY
    );
  }
}


function clearTokens() {

  saveTokens("", "");

}


/* =========================
   BASIC API REQUEST
========================= */

async function rawFetch(
  path,
  options = {}
) {

  const headers =
    new Headers(
      options.headers || {}
    );

  headers.set(
    "Accept",
    "application/json"
  );

  if (
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has("Content-Type")
  ) {

    headers.set(
      "Content-Type",
      "application/json"
    );

  }

  if (accessToken) {

    headers.set(
      "Authorization",
      "Bearer " + accessToken
    );

  }

  const response =
    await fetch(
      API_BASE + path,
      {
        ...options,
        headers
      }
    );


  let body = null;

  try {

    body =
      await response.json();

  } catch (_) {

    body = null;

  }


  if (!response.ok) {

    const err =
      new Error(
        body?.error ||
        `Request failed (${response.status})`
      );

    err.status =
      response.status;

    err.body =
      body;

    throw err;

  }


  return body;

}


/* =========================
   REFRESH TOKEN
========================= */

async function refreshAccessToken() {

  if (!refreshToken)
    return false;

  try {

    const response =
      await fetch(
        API_BASE +
        "/api/auth/refresh",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify({
              refreshToken
            })
        }
      );


    const body =
      await response.json();


    if (
      !response.ok ||
      !body.accessToken
    ) {

      throw new Error(
        body?.error ||
        "Session expired."
      );

    }


    saveTokens(
      body.accessToken,
      refreshToken
    );

    return true;

  } catch (e) {

    clearTokens();

    return false;

  }

}


/* =========================
   API WITH AUTO REFRESH
========================= */

async function api(
  path,
  options = {},
  retry = true
) {

  try {

    return await rawFetch(
      path,
      options
    );

  } catch (e) {

    if (
      retry &&
      e.status === 401 &&
      refreshToken
    ) {

      const ok =
        await refreshAccessToken();


      if (ok) {

        return api(
          path,
          options,
          false
        );

      }

    }

    throw e;

  }

}


/* =========================
   WEBSOCKET
========================= */

function closeSocket() {

  if (socketRetryTimer) {

    clearTimeout(
      socketRetryTimer
    );

    socketRetryTimer = null;

  }


  if (socket) {

    try {

      socket.close();

    } catch (_) {}

  }


  socket = null;

  socketConnecting = false;

}


function scheduleSocketReconnect() {

  if (
    socketRetryTimer ||
    !accessToken
  ) {

    return;

  }


  socketRetryTimer =
    setTimeout(
      () => {

        socketRetryTimer =
          null;

        connectSocket();

      },
      socketRetryMs
    );


  socketRetryMs =
    Math.min(
      socketRetryMs * 2,
      15000
    );

}


function connectSocket() {

  if (
    socketConnecting ||
    !accessToken ||
    (
      socket &&
      (
        socket.readyState ===
          WebSocket.OPEN ||

        socket.readyState ===
          WebSocket.CONNECTING
      )
    )
  ) {

    return;

  }


  socketConnecting = true;


  const wsBase =
    API_BASE
      .replace(
        /^https:/,
        "wss:"
      )
      .replace(
        /^http:/,
        "ws:"
      );


  try {

    const ws =
      new WebSocket(
        wsBase + "/ws"
      );


    socket = ws;


    ws.onopen = () => {

      socketConnecting =
        false;

      socketRetryMs =
        1000;


      try {

        ws.send(
          JSON.stringify({
            type: "auth",
            token: accessToken
          })
        );


        ws.send(
          JSON.stringify({
            type: "subscribe",
            channels: ["all"]
          })
        );

      } catch (_) {}

    };


    ws.onmessage =
      event => {

        try {

          const message =
            JSON.parse(
              event.data
            );


          if (
            message.event ===
              "portal.updated" &&
            message.data
          ) {

            const row =
              message.data;


            const key =
              row.doc_key;


            if (!key)
              return;


            versions.set(
              key,
              Number(
                row.version || 0
              )
            );


            const watcher =
              watchers.get(key);


            if (watcher) {

              const incoming =
                row.data &&
                typeof row.data ===
                  "object" &&
                Object.keys(
                  row.data
                ).length
                  ? row.data
                  : null;


              watcher.success(
                incoming
              );

            }

          }


        } catch (e) {

          console.error(
            "Realtime message error:",
            e
          );

        }

      };


    ws.onerror = () => {
      /* reconnect handled by close */
    };


    ws.onclose = () => {

      if (socket === ws)
        socket = null;


      socketConnecting =
        false;


      if (accessToken)
        scheduleSocketReconnect();

    };


  } catch (e) {

    socketConnecting =
      false;

    scheduleSocketReconnect();

  }

}


/* =========================
   AUTH
========================= */

async function notifyWho() {

  if (!whoCallback)
    return;


  if (
    !accessToken &&
    !refreshToken
  ) {

    whoCallback(null);

    return;

  }


  try {

    const result =
      await api(
        "/api/auth/me"
      );


    whoCallback(
      result?.user?.email ||
      null
    );


    connectSocket();


  } catch (e) {

    clearTokens();

    closeSocket();

    whoCallback(null);

  }

}


async function registerForMigration(
  email,
  password
) {

  return api(
    "/api/auth/register",
    {
      method: "POST",

      body:
        JSON.stringify({

          email,

          password,

          name:
            email.split("@")[0],

          role: "member",

          office: null,

          permissions: []

        })
    },
    false
  );

}


async function login(
  email,
  password
) {

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();


  try {

    const result =
      await api(
        "/api/auth/login",
        {
          method: "POST",

          body:
            JSON.stringify({
              email:
                normalizedEmail,

              password
            })
        },
        false
      );


    saveTokens(
      result.accessToken,
      result.refreshToken
    );


    connectSocket();


    if (whoCallback)
      whoCallback(
        normalizedEmail
      );


    return result;


  } catch (loginError) {

    if (
      loginError.status !== 401 &&
      loginError.status !== 404
    ) {

      throw loginError;

    }


    try {

      await registerForMigration(
        normalizedEmail,
        password
      );


      const result =
        await api(
          "/api/auth/login",
          {
            method: "POST",

            body:
              JSON.stringify({
                email:
                  normalizedEmail,

                password
              })
          },
          false
        );


      saveTokens(
        result.accessToken,
        result.refreshToken
      );


      connectSocket();


      if (whoCallback)
        whoCallback(
          normalizedEmail
        );


      return result;


    } catch (registerError) {

      if (
        registerError.status ===
        409
      ) {

        throw loginError;

      }


      throw registerError;

    }

  }

}


/* =========================
   LOGOUT
========================= */

async function logout() {

  const oldRefresh =
    refreshToken;


  clearTokens();

  closeSocket();


  try {

    if (oldRefresh) {

      await fetch(
        API_BASE +
        "/api/auth/logout",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",

            "Accept":
              "application/json"
          },

          body:
            JSON.stringify({
              refreshToken:
                oldRefresh
            })
        }
      );

    }

  } catch (_) {}


  if (whoCallback)
    whoCallback(null);

}


/* =========================
   CURRENT USER
========================= */

function who(callback) {

  whoCallback =
    callback;


  notifyWho();

}


/* =========================
   CREATE USER
========================= */

async function create(
  email,
  password
) {

  return registerForMigration(
    String(email || "")
      .trim()
      .toLowerCase(),

    password
  );

}


/* =========================
   PASSWORD RESET
========================= */

async function reset(email) {

  const err =
    new Error(
      "Password reset email is not configured on the Render backend yet."
    );


  err.code =
    "PASSWORD_RESET_NOT_CONFIGURED";


  throw err;

}


/* =========================
   LOAD PORTAL DATA
========================= */

async function loadDocument(
  key
) {

  const row =
    await api(
      "/api/portal/" +
      encodeURIComponent(key)
    );


  versions.set(
    key,
    Number(
      row?.version || 0
    )
  );


  if (
    !row ||
    !row.version ||
    !row.data ||
    typeof row.data !==
      "object" ||
    !Object.keys(
      row.data
    ).length
  ) {

    return null;

  }


  return row.data;

}


/* =========================
   WATCH
========================= */

function watch(
  key,
  success,
  error
) {

  const watcher = {

    success:
      typeof success ===
      "function"
        ? success
        : () => {},

    error:
      typeof error ===
      "function"
        ? error
        : () => {}

  };


  watchers.set(
    key,
    watcher
  );


  loadDocument(key)

    .then(data => {

      const current =
        watchers.get(key);


      if (
        current === watcher
      ) {

        watcher.success(
          data
        );

      }

    })

    .catch(err => {

      const current =
        watchers.get(key);


      if (
        current === watcher
      ) {

        watcher.error(
          err
        );

      }

    });


  connectSocket();


  return () => {

    if (
      watchers.get(key) ===
      watcher
    ) {

      watchers.delete(key);

    }

  };

}


/* =========================
   SAVE PORTAL DATA
========================= */

async function set(
  key,
  data
) {

  const result =
    await api(
      "/api/portal/" +
      encodeURIComponent(key),
      {
        method: "PUT",

        body:
          JSON.stringify({
            data
          })
      }
    );


  versions.set(
    key,
    Number(
      result?.version || 0
    )
  );


  const watcher =
    watchers.get(key);


  if (
    watcher &&
    socket &&
    socket.readyState !==
      WebSocket.OPEN
  ) {

    watcher.success(
      result?.data ||
      data
    );

  }


  connectSocket();


  return result;

}


/* =========================
   PUBLIC SYNC API
========================= */

window.SYNC = {

  watch,

  set,

  login,

  logout,

  who,

  reset,

  create

};


window.__syncReady =
  true;


window.dispatchEvent(
  new Event(
    "sync-ready"
  )
);
