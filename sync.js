/* =========================================================
   SONAlNFO - RENDER BACKEND SYNC
   Firebase-free realtime sync
   Backend:
   https://sonainfo-backend-2.onrender.com
   ========================================================= */

(() => {
  "use strict";

  /* =========================================================
     CONFIG
     ========================================================= */

  const API_BASE =
    "https://sonainfo-backend-2.onrender.com";

  const WS_URL =
    "wss://sonainfo-backend-2.onrender.com/ws";

  const ACCESS_KEY =
    "sonainfo_access_token";

  const REFRESH_KEY =
    "sonainfo_refresh_token";

  const USER_KEY =
    "sonainfo_current_user";

  const DOC_KEY =
    "main";

  const REQUEST_TIMEOUT =
    15000;

  const WS_RECONNECT_MIN =
    1000;

  const WS_RECONNECT_MAX =
    15000;


  /* =========================================================
     INTERNAL STATE
     ========================================================= */

  let accessToken =
    localStorage.getItem(ACCESS_KEY) || "";

  let refreshToken =
    localStorage.getItem(REFRESH_KEY) || "";

  let currentUser = null;

  try {
    const savedUser =
      localStorage.getItem(USER_KEY);

    if (savedUser) {
      currentUser =
        JSON.parse(savedUser);
    }
  } catch (e) {
    currentUser = null;
  }

  let socket = null;

  let socketTimer = null;

  let socketDelay =
    WS_RECONNECT_MIN;

  let socketManuallyClosed =
    false;

  let whoCallback = null;

  let ready = false;

  let refreshing = null;

  let watchers = new Map();

  let lastServerVersion = 0;

  let isSaving = false;

  let pendingSave = null;


  /* =========================================================
     STORAGE
     ========================================================= */

  function saveTokens(access, refresh) {

    accessToken =
      access || "";

    refreshToken =
      refresh || "";

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


  function saveUser(user) {

    currentUser =
      user || null;

    if (currentUser) {

      localStorage.setItem(
        USER_KEY,
        JSON.stringify(currentUser)
      );

    } else {

      localStorage.removeItem(
        USER_KEY
      );

    }
  }


  function clearTokens() {

    accessToken = "";
    refreshToken = "";
    currentUser = null;

    localStorage.removeItem(
      ACCESS_KEY
    );

    localStorage.removeItem(
      REFRESH_KEY
    );

    localStorage.removeItem(
      USER_KEY
    );
  }


  /* =========================================================
     HELPERS
     ========================================================= */

  function sleep(ms) {
    return new Promise(resolve =>
      setTimeout(resolve, ms)
    );
  }


  function isNetworkError(error) {

    if (!error) {
      return false;
    }

    const msg =
      String(error.message || "")
        .toLowerCase();

    return (
      msg.includes("network") ||
      msg.includes("failed to fetch") ||
      msg.includes("timeout") ||
      msg.includes("load failed") ||
      msg.includes("fetch")
    );
  }


  function dispatch(name, detail) {

    try {

      window.dispatchEvent(
        new CustomEvent(
          name,
          { detail }
        )
      );

    } catch (e) {

      try {

        const event =
          document.createEvent(
            "CustomEvent"
          );

        event.initCustomEvent(
          name,
          false,
          false,
          detail
        );

        window.dispatchEvent(event);

      } catch (_) {}
    }
  }


  /* =========================================================
     FETCH WITH TIMEOUT
     ========================================================= */

  async function fetchWithTimeout(
    url,
    options = {},
    timeout = REQUEST_TIMEOUT
  ) {

    const controller =
      new AbortController();

    const timer =
      setTimeout(
        () => controller.abort(),
        timeout
      );

    try {

      const response =
        await fetch(
          url,
          {
            ...options,
            signal:
              controller.signal
          }
        );

      return response;

    } finally {

      clearTimeout(timer);

    }
  }


  /* =========================================================
     REFRESH ACCESS TOKEN
     ========================================================= */

  async function refreshAccessToken() {

    if (!refreshToken) {
      return false;
    }

    if (refreshing) {
      return refreshing;
    }

    refreshing =
      (async () => {

        try {

          const response =
            await fetchWithTimeout(
              `${API_BASE}/api/auth/refresh`,
              {
                method: "POST",

                headers: {
                  "Content-Type":
                    "application/json"
                },

                body: JSON.stringify({
                  refreshToken
                })
              }
            );

          if (!response.ok) {

            /*
             * Only 401/403 means the
             * refresh session is actually
             * invalid.
             *
             * Network/server errors should
             * NOT log the user out.
             */

            if (
              response.status === 401 ||
              response.status === 403
            ) {

              clearTokens();

              return false;

            }

            return false;
          }

          const data =
            await response.json();

          if (!data.accessToken) {
            return false;
          }

          saveTokens(
            data.accessToken,
            refreshToken
          );

          if (data.user) {
            saveUser(data.user);
          }

          dispatch(
            "sync-token-refreshed",
            data
          );

          return true;

        } catch (error) {

          console.warn(
            "Token refresh failed temporarily:",
            error
          );

          /*
           * IMPORTANT:
           * Do NOT delete tokens here.
           */

          return false;

        } finally {

          refreshing = null;

        }

      })();

    return refreshing;
  }


  /* =========================================================
     API REQUEST
     ========================================================= */

  async function api(
    path,
    options = {},
    retry = true
  ) {

    const headers = {
      ...(options.headers || {})
    };

    if (
      options.body &&
      !(options.body instanceof FormData)
    ) {

      headers["Content-Type"] =
        headers["Content-Type"] ||
        "application/json";

    }

    if (accessToken) {

      headers.Authorization =
        `Bearer ${accessToken}`;

    }

    let response;

    try {

      response =
        await fetchWithTimeout(
          `${API_BASE}${path}`,
          {
            ...options,
            headers
          }
        );

    } catch (error) {

      /*
       * Network failure.
       * NEVER logout here.
       */

      throw error;
    }


    /* -------------------------------------------------------
       ACCESS TOKEN EXPIRED
       ------------------------------------------------------- */

    if (
      response.status === 401 &&
      retry &&
      refreshToken
    ) {

      const refreshed =
        await refreshAccessToken();

      if (refreshed) {

        return api(
          path,
          options,
          false
        );

      }
    }


    /* -------------------------------------------------------
       RESPONSE
       ------------------------------------------------------- */

    let data = null;

    const contentType =
      response.headers.get(
        "content-type"
      ) || "";

    try {

      if (
        contentType.includes(
          "application/json"
        )
      ) {

        data =
          await response.json();

      } else {

        data =
          await response.text();

      }

    } catch (_) {

      data = null;

    }


    if (!response.ok) {

      const message =
        data?.error ||
        data?.message ||
        `Request failed (${response.status})`;

      const error =
        new Error(message);

      error.status =
        response.status;

      error.data =
        data;

      throw error;
    }

    return data;
  }


  /* =========================================================
     CURRENT USER
     ========================================================= */

  async function getMe() {

    if (!accessToken && !refreshToken) {
      return null;
    }

    try {

      const data =
        await api(
          "/api/auth/me"
        );

      if (data?.user) {

        saveUser(
          data.user
        );

        return data.user;

      }

      return null;

    } catch (error) {

      /*
       * Access token expired:
       * api() already tried refresh.
       */

      if (
        error.status === 401 &&
        refreshToken
      ) {

        const refreshed =
          await refreshAccessToken();

        if (refreshed) {

          try {

            const data =
              await api(
                "/api/auth/me",
                {},
                false
              );

            if (data?.user) {

              saveUser(
                data.user
              );

              return data.user;

            }

          } catch (_) {}

        }

      }

      /*
       * IMPORTANT:
       *
       * Do NOT logout the user for
       * temporary network/server errors.
       */

      if (
        isNetworkError(error) ||
        !error.status ||
        error.status >= 500
      ) {

        console.warn(
          "Backend temporarily unavailable. Keeping login session.",
          error
        );

        return currentUser;
      }

      /*
       * Only genuine authentication
       * failure clears the session.
       */

      if (
        error.status === 401 ||
        error.status === 403
      ) {

        clearTokens();
        closeSocket();

        return null;
      }

      return currentUser;
    }
  }


  /* =========================================================
     WHO
     ========================================================= */

  async function notifyWho() {

    if (!whoCallback) {
      return;
    }

    /*
     * No saved session.
     */

    if (
      !accessToken &&
      !refreshToken
    ) {

      whoCallback(null);

      return;
    }


    /*
     * We have a token.
     */

    const user =
      await getMe();

    if (user) {

      whoCallback(
        user.email || null
      );

      connectSocket();

      return;
    }


    /*
     * If backend is temporarily
     * unavailable but local user exists,
     * keep the UI logged in.
     */

    if (currentUser) {

      whoCallback(
        currentUser.email || null
      );

      connectSocket();

      return;
    }

    whoCallback(null);
  }


  /* =========================================================
     LOGIN
     ========================================================= */

  async function login(
    email,
    password
  ) {

    if (!email || !password) {

      throw new Error(
        "Email and password are required."
      );

    }

    const data =
      await api(
        "/api/auth/login",
        {
          method: "POST",

          body: JSON.stringify({
            email:
              String(email)
                .trim()
                .toLowerCase(),

            password:
              String(password)
          })
        },
        false
      );


    if (
      !data?.accessToken ||
      !data?.refreshToken
    ) {

      throw new Error(
        "Login response is invalid."
      );

    }


    saveTokens(
      data.accessToken,
      data.refreshToken
    );

    if (data.user) {

      saveUser(
        data.user
      );

    }


    dispatch(
      "sync-login",
      data.user || null
    );


    connectSocket();

    /*
     * app.js expects SYNC.login()
     * to finish the authentication flow.
     */

    if (whoCallback) {

      whoCallback(
        data.user?.email || email
      );

    }

    return data;
  }


  /* =========================================================
     LOGOUT
     ========================================================= */

  async function logout() {

    const token =
      refreshToken;

    /*
     * Clear local session immediately
     * so UI logs out even if backend
     * is temporarily unavailable.
     */

    clearTokens();

    closeSocket();

    dispatch(
      "sync-logout"
    );

    if (!token) {
      return;
    }

    try {

      await fetchWithTimeout(
        `${API_BASE}/api/auth/logout`,
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json"
          },

          body: JSON.stringify({
            refreshToken: token
          })
        }
      );

    } catch (error) {

      /*
       * Backend logout failure does not
       * matter because local session is
       * already removed.
       */

      console.warn(
        "Backend logout request failed:",
        error
      );

    }
  }


  /* =========================================================
     PASSWORD RESET
     ========================================================= */

  async function reset(email) {

    /*
     * Current backend does not expose
     * a password-reset/email endpoint.
     */

    throw new Error(
      "Password reset is not configured on the backend yet. Please contact the SEC Committee."
    );
  }


  /* =========================================================
     CREATE USER
     ========================================================= */

  async function create(
    email,
    password,
    extra = {}
  ) {

    if (!email || !password) {

      throw new Error(
        "Email and password are required."
      );

    }

    const data =
      await api(
        "/api/auth/register",
        {
          method: "POST",

          body: JSON.stringify({
            email:
              String(email)
                .trim()
                .toLowerCase(),

            password:
              String(password),

            name:
              extra.name ||
              String(email)
                .split("@")[0],

            role:
              extra.role ||
              "member",

            office:
              extra.office ||
              null,

            permissions:
              Array.isArray(
                extra.permissions
              )
                ? extra.permissions
                : []
          })
        }
      );

    return data;
  }


  /* =========================================================
     PORTAL DOCUMENT
     ========================================================= */

  async function loadPortal(
    key = DOC_KEY
  ) {

    const data =
      await api(
        `/api/portal/${encodeURIComponent(key)}`
      );

    if (
      data &&
      typeof data.version !== "undefined"
    ) {

      lastServerVersion =
        Number(data.version) || 0;

    }

    return data?.data ?? {};
  }


  /* =========================================================
     WATCH
     ========================================================= */

  function watch(
    key,
    success,
    error
  ) {

    const docKey =
      key || DOC_KEY;

    watchers.set(
      docKey,
      {
        success,
        error
      }
    );


    /*
     * First load from PostgreSQL.
     */

    (async () => {

      try {

        const data =
          await api(
            `/api/portal/${encodeURIComponent(docKey)}`
          );

        if (
          data &&
          typeof data.version !== "undefined"
        ) {

          lastServerVersion =
            Number(data.version) || 0;

        }

        if (typeof success === "function") {

          success(
            data?.data ?? {}
          );

        }

      } catch (e) {

        console.error(
          "Portal load failed:",
          e
        );

        /*
         * Do not immediately destroy
         * the application session.
         */

        if (typeof error === "function") {
          error(e);
        }

      }

    })();


    /*
     * Return unsubscribe function.
     */

    return () => {

      watchers.delete(
        docKey
      );

    };
  }


  /* =========================================================
     SET / SAVE PORTAL
     ========================================================= */

  async function set(
    key,
    data
  ) {

    const docKey =
      key || DOC_KEY;

    /*
     * If another save is already running,
     * remember the newest state.
     */

    if (isSaving) {

      pendingSave = {
        key: docKey,
        data
      };

      return;
    }

    isSaving = true;

    try {

      const payload = {
        data
      };

      /*
       * Use optimistic version only when
       * we know the server version.
       */

      if (lastServerVersion > 0) {

        payload.expectedVersion =
          lastServerVersion;

      }

      let result;

      try {

        result =
          await api(
            `/api/portal/${encodeURIComponent(docKey)}`,
            {
              method: "PUT",
              body:
                JSON.stringify(payload)
            }
          );

      } catch (error) {

        /*
         * Version conflict:
         * fetch latest state and report it.
         */

        if (error.status === 409) {

          console.warn(
            "Portal version conflict. Reloading latest server state."
          );

          try {

            const latest =
              await api(
                `/api/portal/${encodeURIComponent(docKey)}`
              );

            lastServerVersion =
              Number(
                latest.version || 0
              );

            const watcher =
              watchers.get(docKey);

            if (
              watcher &&
              typeof watcher.success ===
                "function"
            ) {

              watcher.success(
                latest.data || {}
              );

            }

          } catch (reloadError) {

            console.error(
              "Failed to reload latest portal data:",
              reloadError
            );

          }

        }

        throw error;
      }


      if (
        result &&
        typeof result.version !==
          "undefined"
      ) {

        lastServerVersion =
          Number(
            result.version
          ) || lastServerVersion;

      }


      /*
       * Server broadcasts the WebSocket
       * event to all connected devices.
       */

      return result;

    } finally {

      isSaving = false;

      /*
       * If a newer save happened while
       * the previous request was running,
       * send the newest state now.
       */

      if (pendingSave) {

        const next =
          pendingSave;

        pendingSave = null;

        setTimeout(
          () => {

            set(
              next.key,
              next.data
            ).catch(error =>
              console.error(
                "Pending save failed:",
                error
              )
            );

          },
          0
        );
      }
    }
  }


  /* =========================================================
     WEBSOCKET
     ========================================================= */

  function connectSocket() {

    if (
      socketManuallyClosed
    ) {

      return;
    }

    if (
      !accessToken
    ) {

      return;
    }

    if (
      socket &&
      (
        socket.readyState ===
          WebSocket.OPEN ||

        socket.readyState ===
          WebSocket.CONNECTING
      )
    ) {

      return;
    }


    clearTimeout(
      socketTimer
    );


    try {

      socket =
        new WebSocket(
          WS_URL
        );

    } catch (error) {

      scheduleSocketReconnect();

      return;
    }


    socket.onopen =
      () => {

        socketDelay =
          WS_RECONNECT_MIN;


        /*
         * Authenticate WebSocket.
         */

        if (accessToken) {

          socket.send(
            JSON.stringify({
              type: "auth",
              token:
                accessToken
            })
          );

        }

      };


    socket.onmessage =
      async event => {

        let message;

        try {

          message =
            JSON.parse(
              event.data
            );

        } catch (_) {

          return;
        }


        const eventName =
          message.event;

        const data =
          message.data;


        /*
         * Authentication successful
         */

        if (
          eventName ===
          "authenticated"
        ) {

          socket.send(
            JSON.stringify({
              type:
                "subscribe",

              channels:
                ["all"]
            })
          );

          dispatch(
            "sync-connected",
            data
          );

          return;
        }


        /*
         * WebSocket error
         */

        if (
          eventName ===
          "error"
        ) {

          console.warn(
            "WebSocket error:",
            data
          );

          return;
        }


        /*
         * PORTAL UPDATED
         *
         * This is the most important
         * event for your current portal.
         */

        if (
          eventName ===
          "portal.updated"
        ) {

          const doc =
            data;

          if (!doc) {
            return;
          }


          const docKey =
            doc.doc_key ||
            doc.docKey ||
            DOC_KEY;


          if (
            typeof doc.version !==
              "undefined"
          ) {

            lastServerVersion =
              Math.max(
                lastServerVersion,
                Number(
                  doc.version
                ) || 0
              );

          }


          const watcher =
            watchers.get(
              docKey
            );


          if (
            watcher &&
            typeof watcher.success ===
              "function"
          ) {

            watcher.success(
              doc.data || {}
            );

          }


          /*
           * Also dispatch a general
           * event so app.js can react
           * if needed.
           */

          dispatch(
            "portal-updated",
            doc
          );

          return;
        }


        /*
         * Other realtime events
         */

        dispatch(
          "sync-event",
          {
            event:
              eventName,

            data
          }
        );

      };


    socket.onclose =
      event => {

        socket = null;

        dispatch(
          "sync-disconnected",
          event
        );


        /*
         * If we still have login tokens,
         * reconnect automatically.
         */

        if (
          !socketManuallyClosed &&
          accessToken
        ) {

          scheduleSocketReconnect();

        }

      };


    socket.onerror =
      error => {

        console.warn(
          "WebSocket connection error:",
          error
        );

      };
  }


  function scheduleSocketReconnect() {

    if (
      socketManuallyClosed ||
      !accessToken
    ) {

      return;
    }

    clearTimeout(
      socketTimer
    );


    socketTimer =
      setTimeout(
        () => {

          connectSocket();

        },
        socketDelay
      );


    socketDelay =
      Math.min(
        socketDelay * 2,
        WS_RECONNECT_MAX
      );
  }


  function closeSocket() {

    socketManuallyClosed =
      true;

    clearTimeout(
      socketTimer
    );

    socketTimer = null;

    if (socket) {

      try {
        socket.close();
      } catch (_) {}

    }

    socket = null;
  }


  /* =========================================================
     PUBLIC API
     ========================================================= */

  const SYNC = {

    /*
     * Existing app.js API
     */

    watch,

    set,

    login,

    logout,

    who(callback) {

      whoCallback =
        typeof callback ===
          "function"
            ? callback
            : null;

      /*
       * Do not wait for WebSocket.
       * Authentication is handled through
       * normal REST API.
       */

      notifyWho();

    },

    reset,

    create,


    /*
     * Extra helpers
     */

    api,

    getMe,

    loadPortal,

    refresh: refreshAccessToken,

    getUser() {
      return currentUser;
    },

    isLoggedIn() {
      return Boolean(
        accessToken ||
        refreshToken
      );
    },

    getVersion() {
      return lastServerVersion;
    },

    reconnect() {

      socketManuallyClosed =
        false;

      connectSocket();

    }

  };


  /* =========================================================
     EXPOSE GLOBAL
     ========================================================= */

  window.SYNC =
    SYNC;


  /*
   * Make the global available BEFORE
   * app.js starts using it.
   */

  ready = true;


  dispatch(
    "sync-ready"
  );


  /* =========================================================
     INITIAL SESSION RESTORE
     ========================================================= */

  if (
    accessToken ||
    refreshToken
  ) {

    /*
     * Restore the existing login
     * after page refresh.
     */

    notifyWho()
      .catch(error => {

        console.warn(
          "Initial session restore failed:",
          error
        );

      });

  }


  /* =========================================================
     BROWSER ONLINE / OFFLINE
     ========================================================= */

  window.addEventListener(
    "online",
    () => {

      dispatch(
        "sync-online"
      );

      if (
        accessToken
      ) {

        /*
         * Try to restore backend
         * connection.
         */

        notifyWho()
          .catch(() => {});

        connectSocket();

      }

    }
  );


  window.addEventListener(
    "offline",
    () => {

      dispatch(
        "sync-offline"
      );

    }
  );


  /* =========================================================
     PERIODIC WEBSOCKET HEALTH CHECK
     ========================================================= */

  setInterval(
    () => {

      if (
        socket &&
        socket.readyState ===
          WebSocket.OPEN
      ) {

        try {

          socket.send(
            JSON.stringify({
              type: "ping"
            })
          );

        } catch (_) {}

      } else if (
        accessToken &&
        !socketManuallyClosed
      ) {

        connectSocket();

      }

    },
    25000
  );


})();
