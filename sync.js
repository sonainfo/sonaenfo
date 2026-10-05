/* =========================================================
   SONAINFO EXECUTIVE PORTAL
   FIREBASE-FREE SYNCHRONIZATION
   Render API + PostgreSQL + WebSocket
========================================================= */

const API_BASE =
  "https://sonainfo-backend-2.onrender.com";


const ACCESS_KEY =
  "sonainfo_access_token";

const REFRESH_KEY =
  "sonainfo_refresh_token";


let accessToken =
  localStorage.getItem(
    ACCESS_KEY
  ) || "";


let refreshToken =
  localStorage.getItem(
    REFRESH_KEY
  ) || "";


let whoCallback = null;

let socket = null;

let socketRetryTimer = null;

let socketRetryMs = 1000;

let socketConnecting = false;


const watchers =
  new Map();


const versions =
  new Map();


/* =========================================================
   TOKEN MANAGEMENT
========================================================= */

function saveTokens(
  access,
  refresh
){

  accessToken =
    access || "";


  /*
   * IMPORTANT:
   * Refresh endpoint returns only
   * accessToken.
   *
   * Therefore old refresh token
   * must be preserved.
   */

  if(
    refresh !== undefined
  ){

    refreshToken =
      refresh || "";

  }


  if(accessToken){

    localStorage.setItem(
      ACCESS_KEY,
      accessToken
    );

  }else{

    localStorage.removeItem(
      ACCESS_KEY
    );

  }


  if(refreshToken){

    localStorage.setItem(
      REFRESH_KEY,
      refreshToken
    );

  }else{

    localStorage.removeItem(
      REFRESH_KEY
    );

  }

}


function clearTokens(){

  accessToken = "";

  refreshToken = "";

  localStorage.removeItem(
    ACCESS_KEY
  );

  localStorage.removeItem(
    REFRESH_KEY
  );

}


/* =========================================================
   HTTP REQUEST
========================================================= */

async function rawFetch(
  path,
  options = {}
){

  const headers =
    new Headers(
      options.headers || {}
    );


  headers.set(
    "Accept",
    "application/json"
  );


  if(
    options.body &&
    !(options.body instanceof FormData) &&
    !headers.has(
      "Content-Type"
    )
  ){

    headers.set(
      "Content-Type",
      "application/json"
    );

  }


  if(accessToken){

    headers.set(
      "Authorization",
      "Bearer " +
      accessToken
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


  try{

    body =
      await response.json();

  }catch(_){

    body = null;

  }


  if(!response.ok){

    const error =
      new Error(
        body?.error ||
        `Request failed (${response.status})`
      );


    error.status =
      response.status;


    error.body =
      body;


    throw error;

  }


  return body;

}


/* =========================================================
   REFRESH TOKEN
========================================================= */

async function refreshAccessToken(){

  if(!refreshToken)
    return false;


  try{

    const response =
      await fetch(
        API_BASE +
        "/api/auth/refresh",
        {
          method:"POST",

          headers:{
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


    let body = null;


    try{

      body =
        await response.json();

    }catch(_){}


    if(!response.ok){

      /*
       * Only destroy the session when
       * server explicitly says token invalid.
       */

      if(
        response.status === 401 ||
        response.status === 403
      ){

        clearTokens();

      }

      return false;

    }


    if(
      !body ||
      !body.accessToken
    ){

      return false;

    }


    saveTokens(
      body.accessToken,
      refreshToken
    );


    return true;


  }catch(error){

    /*
     * Network error is NOT logout.
     */

    console.warn(
      "Temporary refresh error:",
      error
    );


    return false;

  }

}


/* =========================================================
   API WRAPPER
========================================================= */

async function api(
  path,
  options = {},
  retry = true
){

  try{

    return await rawFetch(
      path,
      options
    );

  }catch(error){

    if(
      retry &&
      error.status === 401 &&
      refreshToken
    ){

      const refreshed =
        await refreshAccessToken();


      if(refreshed){

        return api(
          path,
          options,
          false
        );

      }

    }


    throw error;

  }

}


/* =========================================================
   WEBSOCKET
========================================================= */

function closeSocket(){

  if(socketRetryTimer){

    clearTimeout(
      socketRetryTimer
    );

    socketRetryTimer =
      null;

  }


  if(socket){

    try{

      socket.close();

    }catch(_){}

  }


  socket =
    null;

  socketConnecting =
    false;

}


function scheduleSocketReconnect(){

  if(
    socketRetryTimer ||
    !accessToken
  ){

    return;

  }


  socketRetryTimer =
    setTimeout(
      function(){

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


function connectSocket(){

  if(
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
  ){

    return;

  }


  socketConnecting =
    true;


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


  try{

    const ws =
      new WebSocket(
        wsBase + "/ws"
      );


    socket =
      ws;


    ws.onopen =
      function(){

        socketConnecting =
          false;


        socketRetryMs =
          1000;


        /*
         * IMPORTANT:
         *
         * Authentication first.
         * Subscription only AFTER
         * authenticated event.
         */

        try{

          ws.send(
            JSON.stringify({
              type:"auth",
              token:
                accessToken
            })
          );

        }catch(_){}

      };


    ws.onmessage =
      function(event){

        try{

          const message =
            JSON.parse(
              event.data
            );


          /*
           * Authentication completed.
           */

          if(
            message.event ===
              "authenticated"
          ){

            try{

              ws.send(
                JSON.stringify({
                  type:
                    "subscribe",

                  channels:[
                    "all"
                  ]
                })
              );

            }catch(_){}


            window.dispatchEvent(
              new CustomEvent(
                "sonainfo-authenticated",
                {
                  detail:
                    message.data?.user
                }
              )
            );

          }


          /*
           * Portal changed.
           */

          if(
            message.event ===
              "portal.updated" &&
            message.data
          ){

            const row =
              message.data;


            const key =
              row.doc_key;


            if(!key)
              return;


            versions.set(
              key,
              Number(
                row.version || 0
              )
            );


            const watcher =
              watchers.get(key);


            if(watcher){

              const incoming =
                row.data &&
                typeof row.data ===
                  "object"
                  ? row.data
                  : null;


              watcher.success(
                incoming
              );

            }

          }


          /*
           * Other realtime events.
           */

          window.dispatchEvent(
            new CustomEvent(
              "sonainfo-sync-event",
              {
                detail:
                  message
              }
            )
          );


        }catch(error){

          console.error(
            "WebSocket message error:",
            error
          );

        }

      };


    ws.onerror =
      function(){

        /*
         * onclose handles reconnect
         */

      };


    ws.onclose =
      function(){

        if(socket === ws){

          socket =
            null;

        }


        socketConnecting =
          false;


        if(accessToken){

          scheduleSocketReconnect();

        }

      };


  }catch(error){

    socketConnecting =
      false;

    scheduleSocketReconnect();

  }

}


/* =========================================================
   SESSION RESTORE
========================================================= */

async function notifyWho(){

  if(!whoCallback)
    return;


  /*
   * No saved session.
   */

  if(
    !accessToken &&
    !refreshToken
  ){

    whoCallback(null);

    return;

  }


  try{

    const result =
      await api(
        "/api/auth/me"
      );


    const email =
      result?.user?.email ||
      null;


    if(!email){

      whoCallback(null);

      return;

    }


    localStorage.setItem(
      "sonainfo_last_email",
      email
    );


    whoCallback(
      email
    );


    connectSocket();


  }catch(error){

    console.warn(
      "Session check:",
      error
    );


    /*
     * Only logout on actual
     * authentication failure.
     */

    if(
      error.status === 401 ||
      error.status === 403
    ){

      const refreshed =
        await refreshAccessToken();


      if(refreshed){

        try{

          const result =
            await api(
              "/api/auth/me"
            );


          const email =
            result?.user?.email ||
            null;


          if(email){

            localStorage.setItem(
              "sonainfo_last_email",
              email
            );


            whoCallback(
              email
            );


            connectSocket();


            return;

          }

        }catch(_){}

      }


      clearTokens();

      closeSocket();

      whoCallback(null);

      return;

    }


    /*
     * Network/server problem:
     * DO NOT logout.
     */

    const savedEmail =
      localStorage.getItem(
        "sonainfo_last_email"
      );


    if(savedEmail){

      whoCallback(
        savedEmail
      );

      connectSocket();

    }else{

      whoCallback(null);

    }

  }

}


/* =========================================================
   LOGIN
========================================================= */

async function login(
  email,
  password
){

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();


  if(
    !normalizedEmail ||
    !password
  ){

    const error =
      new Error(
        "Email and password are required."
      );

    error.status =
      400;

    throw error;

  }


  const result =
    await api(
      "/api/auth/login",
      {
        method:"POST",

        body:
          JSON.stringify({
            email:
              normalizedEmail,

            password
          })
      },
      false
    );


  if(
    !result ||
    !result.accessToken ||
    !result.refreshToken
  ){

    throw new Error(
      "Invalid login response from server."
    );

  }


  saveTokens(
    result.accessToken,
    result.refreshToken
  );


  localStorage.setItem(
    "sonainfo_last_email",
    normalizedEmail
  );


  connectSocket();


  /*
   * app.js will continue its
   * existing watchAll() flow.
   */

  if(whoCallback){

    whoCallback(
      normalizedEmail
    );

  }


  window.dispatchEvent(
    new CustomEvent(
      "sonainfo-login",
      {
        detail:
          result.user
      }
    )
  );


  return result;

}


/* =========================================================
   LOGOUT
========================================================= */

async function logout(){

  const oldRefresh =
    refreshToken;


  clearTokens();

  closeSocket();


  localStorage.removeItem(
    "sonainfo_last_email"
  );


  try{

    if(oldRefresh){

      await fetch(
        API_BASE +
        "/api/auth/logout",
        {
          method:"POST",

          headers:{
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

  }catch(_){}


  if(whoCallback){

    whoCallback(null);

  }

}


/* =========================================================
   WHO
========================================================= */

function who(callback){

  whoCallback =
    typeof callback ===
      "function"
      ? callback
      : null;


  notifyWho();

}


/* =========================================================
   CREATE USER
========================================================= */

async function create(
  email,
  password
){

  const normalizedEmail =
    String(email || "")
      .trim()
      .toLowerCase();


  return api(
    "/api/auth/register",
    {
      method:"POST",

      body:
        JSON.stringify({

          email:
            normalizedEmail,

          password,

          name:
            normalizedEmail
              .split("@")[0],

          role:
            "member",

          office:
            null,

          permissions:
            []

        })
    },
    false
  );

}


/* =========================================================
   PASSWORD RESET
========================================================= */

async function reset(){

  const error =
    new Error(
      "Password reset email is not configured on the backend."
    );


  error.code =
    "PASSWORD_RESET_NOT_CONFIGURED";


  throw error;

}


/* =========================================================
   PORTAL WATCH
========================================================= */

async function loadDocument(
  key
){

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


  if(
    !row ||
    !row.data ||
    typeof row.data !==
      "object"
  ){

    return null;

  }


  return row.data;

}


function watch(
  key,
  success,
  error
){

  const watcher = {

    success:
      typeof success ===
        "function"
        ? success
        : function(){},

    error:
      typeof error ===
        "function"
        ? error
        : function(){}

  };


  watchers.set(
    key,
    watcher
  );


  loadDocument(key)

    .then(
      function(data){

        if(
          watchers.get(key) ===
          watcher
        ){

          watcher.success(
            data
          );

        }

      }
    )

    .catch(
      function(err){

        if(
          watchers.get(key) ===
          watcher
        ){

          watcher.error(
            err
          );

        }

      }
    );


  connectSocket();


  return function(){

    if(
      watchers.get(key) ===
      watcher
    ){

      watchers.delete(key);

    }

  };

}


/* =========================================================
   PORTAL SAVE
========================================================= */

async function set(
  key,
  data
){

  const result =
    await api(
      "/api/portal/" +
      encodeURIComponent(key),
      {
        method:"PUT",

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


  if(
    watcher &&
    (
      !socket ||
      socket.readyState !==
        WebSocket.OPEN
    )
  ){

    watcher.success(
      result?.data ||
      data
    );

  }


  connectSocket();


  return result;

}


/* =========================================================
   PUBLIC SYNC OBJECT
========================================================= */

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


/*
 * app.js waits for this event.
 */

window.dispatchEvent(
  new Event(
    "sync-ready"
  )
);


/* =========================================================
   NETWORK EVENTS
========================================================= */

window.addEventListener(
  "online",
  function(){

    window.dispatchEvent(
      new Event(
        "sync-online"
      )
    );


    if(accessToken){

      connectSocket();

    }

  }
);


window.addEventListener(
  "offline",
  function(){

    window.dispatchEvent(
      new Event(
        "sync-offline"
      )
    );

  }
);
