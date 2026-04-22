// LiveReload Client Module
// Copyright (c) 2023, Refactored by AI Assistant (based on Andrew Davey's original work)
(function () {
  // Internal configuration object for the client.
  let clientConfiguration,
    // Cached reference to Object.prototype.hasOwnProperty for performance.
    checkOwn = Object.prototype.hasOwnProperty,
    // Reference to the document's head element for DOM manipulation.
    pageHead = document.head || document.getElementsByTagName("head")[0];

  /**
   * Initializes the live reload functionality after essential scripts are loaded.
   * This function sets up the WebSocket connection and starts monitoring stylesheets.
   */
  function activateLiveReload() {
    let activeCssAssetMap, // Stores references to managed stylesheet DOM nodes or virtual objects.
      serverConnector; // The WebSocket client instance.

    // Ensure Socket.IO is available before attempting to connect.
    if (typeof io === 'undefined') {
      console.error("LiveReload: Socket.IO library not found. Cannot establish connection.");
      return;
    }

    // Establish connection to the server.
    serverConnector = io(clientConfiguration.serverEndpoint, {
      transports: ['websocket', 'polling'], // Prioritize WebSocket, fallback to polling.
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000
    });

    /**
     * Registers all currently active stylesheets with the server for monitoring.
     * This function is typically called upon successful connection.
     */
    function subscribeToStyleChanges() {
      if (Object.keys(activeCssAssetMap).length === 0) {
        console.info("LiveReload: No local stylesheets found to monitor.");
        return;
      }
      console.log(`LiveReload: Registering ${Object.keys(activeCssAssetMap).length} stylesheets for updates.`);
      for (const styleIdentifier in activeCssAssetMap) {
        if (checkOwn.call(activeCssAssetMap, styleIdentifier)) {
          serverConnector.emit("watch", {
            assetPath: styleIdentifier // Using 'assetPath' instead of 'href'
          });
          console.debug(`LiveReload: Watching: ${styleIdentifier}`);
        }
      }
    }

    /**
     * Refreshes a specific stylesheet by updating its URL with a cache-busting parameter.
     * If the stylesheet is a virtual one (e.g., from an @import rule), a new link element is created.
     *
     * @param {string} styleUri The URL/identifier of the stylesheet to be reloaded.
     */
    function reapplyStyleSheet(styleUri) {
      const targetStyle = activeCssAssetMap[styleUri];
      if (!targetStyle) {
        console.warn(`LiveReload: Attempted to reload unknown stylesheet: ${styleUri}`);
        return;
      }

      // Generate a unique URL to bypass browser cache.
      const newCacheBusterUrl = targetStyle.href +
        (targetStyle.href.includes("?") ? "&" : "?") +
        "__lr_cache=" + Date.now();

      // Check if it's a DOM <link> element or a virtual representation.
      if (targetStyle.nodeType === Node.ELEMENT_NODE && targetStyle.tagName === 'LINK') { // More robust check for DOM element
        // Update the href attribute directly.
        targetStyle.href = newCacheBusterUrl;
        console.log(`LiveReload: Updated existing link for: ${styleUri}`);
      } else {
        // This is likely a virtual link (e.g., from @import), so create a new DOM link element.
        const newLinkDomNode = document.createElement("link");
        newLinkDomNode.setAttribute("rel", "stylesheet");
        newLinkDomNode.setAttribute("href", newCacheBusterUrl);
        // If the original virtual link had media attribute, apply it.
        if (targetStyle.media) {
          newLinkDomNode.setAttribute("media", targetStyle.media);
        }

        // For virtual links, we don't have a direct DOM node to replace.
        // A simpler approach for virtual links is to just append.
        // We'll update the reference in our map to the new DOM node.
        pageHead.appendChild(newLinkDomNode);
        activeCssAssetMap[styleUri] = newLinkDomNode; // Update map to point to the new DOM node
        console.log(`LiveReload: Created new link for virtual stylesheet: ${styleUri}`);
      }
      console.info(`LiveReload: Stylesheet refreshed: ${styleUri}`);
    }

    /**
     * Processes incoming messages from the server, typically triggering a stylesheet reload.
     *
     * @param {object} serverUpdateData Data object from the server.
     * @param {string} serverUpdateData.assetPath The identifier/URL of the stylesheet to reload.
     */
    function onStyleUpdateReceived(serverUpdateData) {
      if (serverUpdateData && typeof serverUpdateData.assetPath === 'string') {
        console.log(`LiveReload: Received update for: ${serverUpdateData.assetPath}`);
        reapplyStyleSheet(serverUpdateData.assetPath);
      } else {
        console.warn("LiveReload: Received malformed update message from server.", serverUpdateData);
      }
    }

    /**
     * Scans the document for all local stylesheets (both <link> and @import rules).
     *
     * @returns {object} A map of local stylesheet identifiers (paths) to their DOM node or virtual representation.
     */
    function gatherStyleReferences() {

      /**
       * Determines if a given stylesheet element is considered "local" based on configured base paths.
       *
       * @param {HTMLLinkElement|object} cssNode The link DOM element or a virtual object.
       * @returns {boolean} True if the stylesheet is local and relevant, false otherwise.
       */
      function checkAssetOrigin(cssNode) {
        // Skip if not a stylesheet or if it's a print-only stylesheet.
        if (cssNode.getAttribute("rel") !== "stylesheet" || isPrintMediaOnly(cssNode)) {
          return false;
        }

        const assetHref = cssNode.href;
        if (!assetHref) return false; // Ensure href exists.

        // Check if the asset's URL matches any of the configured base paths.
        const isInternalCandidate = clientConfiguration.basePaths.some(base =>
          assetHref.startsWith(base) || assetHref.includes(base) // Use startsWith for better precision
        );

        // If it's not an internal candidate, check if it's an absolute URL (http/https).
        // If it's absolute and not internal, it's external.
        const isExternalAbsolute = assetHref.match(/^https?:\/\//) && !isInternalCandidate;

        return !isExternalAbsolute;
      }

      /**
       * Checks if the stylesheet's media attribute is explicitly 'print'.
       *
       * @param {HTMLLinkElement|object} cssNode The stylesheet element to check.
       * @returns {boolean} True if it's a print stylesheet, false otherwise.
       */
      function isPrintMediaOnly(cssNode) {
        return cssNode.getAttribute("media") === "print";
      }

      /**
       * Extracts the base-relative path for a given URL, if it falls under a configured base path.
       *
       * @param {string} fullUrl The full URL of the stylesheet.
       * @returns {string|null} The base-relative path, or null if no matching base path is found.
       */
      function determineResourceRoot(fullUrl) {
        for (const basePath of clientConfiguration.basePaths) {
          if (fullUrl.startsWith(basePath)) { // Use startsWith for cleaner match
            return fullUrl.substring(basePath.length);
          }
        }
        return null; // Return null for no match instead of false
      }

      /**
       * Helper function to retrieve an attribute from a simple object, mimicking DOM element behavior.
       * Used for virtual link objects parsed from @import rules.
       *
       * @param {string} attrName The name of the attribute to retrieve.
       * @returns {string|null} The attribute value or null if not found.
       */
      function readElementProp(attrName) {
        return this[attrName] || null;
      }

      // Map to store discovered stylesheets.
      const discoveredStyles = {};
      // Regex to find @import rules in CSS content.
      const importRulePattern = /@import\s+url\(["']?([^"'\)]+)["']?\)/g;

      // 1. Process <link> elements
      Array.from(document.querySelectorAll('link[rel="stylesheet"]'))
        .forEach(cssLinkNode => {
          if (checkAssetOrigin(cssLinkNode)) {
            const relativePath = determineResourceRoot(cssLinkNode.href);
            if (relativePath !== null) {
              discoveredStyles[relativePath] = cssLinkNode;
              console.debug(`LiveReload: Found <link> stylesheet: ${relativePath}`);
            }
          }
        });

      // 2. Process <style> blocks for @import rules
      Array.from(document.getElementsByTagName("style"))
        .forEach(styleBlockNode => {
          if (isPrintMediaOnly(styleBlockNode)) return; // Skip print-only style blocks.

          const styleContent = styleBlockNode.textContent || styleBlockNode.innerText;
          if (!styleContent) return; // Skip empty style blocks.

          let matchResult;
          while ((matchResult = importRulePattern.exec(styleContent))) {
            // Create a virtual link object for @import rules.
            const virtualLink = {
              rel: "stylesheet",
              href: matchResult[1],
              getAttribute: readElementProp // Mimic DOM element's getAttribute.
            };

            if (checkAssetOrigin(virtualLink)) {
              const relativePath = determineResourceRoot(virtualLink.href);
              if (relativePath !== null) {
                discoveredStyles[relativePath] = virtualLink;
                console.debug(`LiveReload: Found @import stylesheet: ${relativePath}`);
              }
            }
          }
        });
      return discoveredStyles;
    }

    // Initialize stylesheet map and set up event listeners.
    activeCssAssetMap = gatherStyleReferences();
    serverConnector.on("connect", subscribeToStyleChanges);
    serverConnector.on("update", onStyleUpdateReceived);
    serverConnector.on("disconnect", () => console.warn("LiveReload: Server connection lost."));
    serverConnector.on("reconnect", () => console.info("LiveReload: Reconnected to server."));
    serverConnector.on("reconnect_error", (error) => console.error("LiveReload: Reconnection error:", error));
  }

  /**
   * Dynamically injects an external JavaScript file into the document head.
   *
   * @param {string} jsResourcePath The URL of the script to load.
   * @param {Function} completionHandler The callback function to execute when the script has loaded.
   */
  function injectScriptTag(jsResourcePath, completionHandler) {
    const newScriptElement = document.createElement("script");
    newScriptElement.type = "text/javascript"; // Modern browsers default to 'text/javascript', but explicit is fine.
    newScriptElement.src = jsResourcePath;
    newScriptElement.async = true; // Load script asynchronously.

    const scriptLoadCallback = () => {
      // Ensure the callback is only called once.
      if (newScriptElement.dataset.loaded) return;
      newScriptElement.dataset.loaded = 'true';
      completionHandler();
      console.debug(`LiveReload: Script loaded: ${jsResourcePath}`);
    };

    // Use modern event listeners.
    newScriptElement.addEventListener("load", scriptLoadCallback);
    newScriptElement.addEventListener("error", (e) => {
      console.error(`LiveReload: Failed to load script: ${jsResourcePath}`, e);
      // Still call completion handler to avoid blocking, but indicate error.
      scriptLoadCallback();
    });

    pageHead.appendChild(newScriptElement);
  }

  /**
   * Loads a collection of JavaScript files sequentially or in parallel, invoking a callback upon completion of all.
   *
   * @param {object} resourceMap An object where keys are module names and values are script URLs.
   * @param {Function} allScriptsLoadedCallback The function to call once all specified scripts are loaded.
   */
  function batchScriptInjector(resourceMap, allScriptsLoadedCallback) {
    const scriptsToFetch = [];
    // Filter out scripts that are already globally available.
    for (const moduleKey in resourceMap) {
      if (checkOwn.call(resourceMap, moduleKey) && typeof window[moduleKey] === "undefined") {
        scriptsToFetch.push(resourceMap[moduleKey]);
      }
    }

    let remainingTasks = scriptsToFetch.length;

    if (remainingTasks === 0) {
      console.info("LiveReload: No external scripts to load, proceeding directly.");
      allScriptsLoadedCallback();
      return;
    }

    console.log(`LiveReload: Loading ${remainingTasks} external scripts...`);

    // Callback for each script that finishes loading.
    const taskCompletionHandler = () => {
      remainingTasks--;
      if (remainingTasks <= 0) { // Use <= 0 to handle potential negative if callback fired multiple times (though guarded).
        console.log("LiveReload: All external scripts loaded.");
        allScriptsLoadedCallback();
      }
    };

    // Initiate loading for each script.
    scriptsToFetch.forEach(path => {
      injectScriptTag(path, taskCompletionHandler);
    });
  }

  /**
   * Extracts client configuration details from the currently executing script tag.
   * This includes the server endpoint and base paths for local assets.
   *
   * @returns {object} An object containing `serverEndpoint` and `basePaths`.
   */
  function extractConfiguration() {
    let currentScriptElement = null;
    let serverBaseUrl = document.location.protocol + "//" + document.location.host + "/"; // Default to current host
    const localAssetBasePaths = [serverBaseUrl]; // Initial base path

    // Check if configuration is already globally defined (e.g., by server-side rendering).
    if (typeof window.__liveReloadConfig__ !== "undefined") {
      const existingConfig = window.__liveReloadConfig__;
      existingConfig.basePaths = existingConfig.basePaths || [];
      // Ensure current host is always a base path.
      if (!existingConfig.basePaths.includes(serverBaseUrl)) {
        existingConfig.basePaths.unshift(serverBaseUrl);
      }
      return existingConfig;
    }

    // Find the script tag that loaded this client.
    const allPageScripts = document.getElementsByTagName("script");
    for (const scrNode of allPageScripts) {
      const scriptSrc = scrNode.getAttribute("src");
      if (scriptSrc && (scriptSrc.endsWith('live-reload-client.js') || scriptSrc.includes('vogue-client.js'))) { // Updated filename check
        currentScriptElement = scrNode;
        break;
      }
    }

    if (currentScriptElement) {
      const fullSrcUrl = currentScriptElement.src;
      // Extract root URL (e.g., "http://localhost:3000/")
      try {
        const urlObj = new URL(fullSrcUrl);
        serverBaseUrl = urlObj.origin + "/";
      } catch (e) {
        console.warn("LiveReload: Could not parse script URL, falling back to document origin.", e);
        // Fallback if URL parsing fails.
        const match = fullSrcUrl.match(/^https?:\/\/[^/]+\//);
        if (match) serverBaseUrl = match[0];
      }

      // Check for an optional 'base' query parameter in the script URL.
      const urlParams = new URLSearchParams(fullSrcUrl.split('?')[1]);
      const customBasesParam = urlParams.get('base');

      if (customBasesParam) {
        const additionalBases = customBasesParam.split(",").filter(b => b.trim() !== '');
        localAssetBasePaths.push(...additionalBases);
      }
    } else {
      console.warn("LiveReload: Could not locate the client script tag. Configuration might be incomplete.");
    }

    // Ensure uniqueness and clean up base paths.
    const uniqueBasePaths = [...new Set(localAssetBasePaths.map(p => p.endsWith('/') ? p : p + '/'))];

    return {
      serverEndpoint: serverBaseUrl,
      basePaths: uniqueBasePaths
    };
  }

  // --- Main execution flow ---
  clientConfiguration = extractConfiguration();
  console.log("LiveReload: Client configuration loaded:", clientConfiguration);

  // Load Socket.IO library, then initialize live reload.
  batchScriptInjector({
    io: clientConfiguration.serverEndpoint + "socket.io/socket.io.js"
  }, activateLiveReload);

}());