(function () {
  // StyleSync - Client module
  // Copyright (c) 2011 Andrew Davey (andrew@equin.co.uk)
  var clientScriptData,
      objPropCheck = Object.prototype.hasOwnProperty,
      pageHead = document.getElementsByTagName("head")[0];

  function cssUpdater() {
    var currentCssFiles,
        liveConnection = io.connect(clientScriptData.baseUrl);

    /**
     * Subscribe to updates for all presently managed stylesheets.
     */
    function subscribeToAllStyles() {
      var resourcePath;
      for (resourcePath in currentCssFiles) {
        if (objPropCheck.call(currentCssFiles, resourcePath)) {
          liveConnection.emit("watch", {
            resourcePath: resourcePath
          });
        }
      }
    }

    /**
     * Reapply a given stylesheet.
     *
     * @param {String} resourcePath The URI of the style asset to be reloaded.
     */
    function updateStyleResource(resourcePath) {
      var freshLinkUrl = currentCssFiles[resourcePath].href +
            (resourcePath.indexOf("?") >= 0 ? "&" : "?") +
            "_style_refresh_id=" + (new Date()).getTime(),
          cssNode;
      // Determine if the corresponding DOM element exists.
      if (!currentCssFiles[resourcePath].setAttribute) {
        // Construct the new link element.
        cssNode = document.createElement("link");
        cssNode.setAttribute("rel", "stylesheet");
        cssNode.setAttribute("href", freshLinkUrl);
        pageHead.appendChild(cssNode);

        // Update the internal reference to this newly created element.
        currentCssFiles[resourcePath] = cssNode;
      } else {
        // Modify the href attribute to the new URL.
        currentCssFiles[resourcePath].href = freshLinkUrl;
      }
    }


    /**
     * Process incoming messages from the WebSocket, triggering stylesheet updates.
     *
     * @param incomingData WebSocket message object.
     * @param incomingData.resourcePath The URL of the stylesheet to be updated.
     */
    function receiveCssChange(incomingData) {
      updateStyleResource(incomingData.resourcePath);
    }

    /**
     * Gathers all local stylesheet references from the document.
     *
     * @returns {Object} A collection of local stylesheets keyed by their base URL.
     */
    function discoverPageStyles() {

      /**
       * Ascertains if a stylesheet reference is local to the application.
       *
       * @param {Object} domLink The link element to evaluate.
       * @returns {Boolean} True if local, false otherwise.
       */
      function isInternalStyle(domLink) {
        var cssLinkUri, idx, isRemote = true;
        if (domLink.getAttribute("rel") !== "stylesheet") {
          return false;
        }
        cssLinkUri = domLink.href;

        for (idx = 0; idx < clientScriptData.rootDomains.length; idx += 1) {
          if (cssLinkUri.indexOf(clientScriptData.rootDomains[idx]) > -1) {
            isRemote = false;
            break;
          }
        }

        return !(isRemote && cssLinkUri.match(/^https?:/));
      }

      /**
       * Verifies if a stylesheet targets only print media.
       *
       * @param (Object) domLink The stylesheet element to examine.
       * @returns (Boolean) True if print-specific, false otherwise.
       */
      function targetsPrintOnly(domLink) {
        return domLink.getAttribute("media") === "print";
      }

      /**
       * Obtains the relative base URL for a given full URL.
       *
       * @param {String} cssLinkUri The full URL to process.
       * @returns {String|Boolean} The relative URL path, or false if no matching base is found.
       */
      function determineRootUrl(cssLinkUri) {
        var baseSegment, jdx;
        for (jdx = 0; jdx < clientScriptData.rootDomains.length; jdx += 1) {
          baseSegment = clientScriptData.rootDomains[jdx];
          if (cssLinkUri.indexOf(baseSegment) > -1) {
            return cssLinkUri.substr(baseSegment.length);
          }
        }
        return false;
      }

      function getCustomAttribute(attributeName) {
        return this[attributeName];
      }

      var managedStyleCollection = {},
          cssImportRegex = /@import\s+url\(["']?([^"'\)]+)["']?\)/g,
          linkElements = document.getElementsByTagName("link"),
          domLinkRef, cssLinkUri, regexResults, tagContent, i, m;

      // Iterate through all <link> elements in the document, searching for stylesheets.
      for (i = 0, m = linkElements.length; i < m; i += 1) {
        domLinkRef = linkElements[i];
        if (targetsPrintOnly(domLinkRef)) {
          continue;
        }
        if (!isInternalStyle(domLinkRef)) {
          continue;
        }
        // The link is internal, extract its base URL.
        cssLinkUri = determineRootUrl(domLinkRef.href);
        if (cssLinkUri !== false) {
          managedStyleCollection[cssLinkUri] = domLinkRef;
        }
      }

      // Iterate through all <style> tags, looking for @import declarations.
      linkElements = document.getElementsByTagName("style");
      for (i = 0, m = linkElements.length; i < m; i += 1) {
        if (targetsPrintOnly(linkElements[i])) {
          continue;
        }
        tagContent = linkElements[i].text || linkElements[i].textContent;
        while ((regexResults = cssImportRegex.exec(tagContent))) {
          domLinkRef = {
            rel: "stylesheet",
            href: regexResults[1],
            getAttribute: getCustomAttribute
          };
          if (isInternalStyle(domLinkRef)) {
            // This imported link is also local, get its base URL.
            cssLinkUri = determineRootUrl(domLinkRef.href);
            if (cssLinkUri !== false) {
              managedStyleCollection[cssLinkUri] = domLinkRef;
            }
          }
        }
      }
      return managedStyleCollection;
    }

    currentCssFiles = discoverPageStyles();
    liveConnection.on("connect", subscribeToAllStyles);
    liveConnection.on("update", receiveCssChange);
  }

  /**
   * Dynamically loads a JavaScript file into the page, executing a callback upon completion.
   *
   * @param {String} jsFileUrl The URL of the script to be appended.
   * @param {Function} completionHandler The function to invoke once the script has finished loading.
   */
  function appendJsFile(jsFileUrl, completionHandler) {
    var jsElement = document.createElement("script");
    jsElement.setAttribute("type", "text/javascript");
    jsElement.setAttribute("src", jsFileUrl);

    // Trigger the callback when the script is fully loaded.
    jsElement.onload = completionHandler;
    jsElement.onreadystatechange = function () {
      if (this.readyState === "complete" || this.readyState === "loaded") {
        completionHandler();
      }
    };

    pageHead.appendChild(jsElement);
  }

  /**
   * Loads an array of scripts into the page, calling a single callback after all are loaded.
   *
   * @param {Array} jsResources The collection of script URLs to load.
   * @param {Function} allLoadedCallback The function to execute once all specified scripts have finished loading.
   */
  function addMultipleJsFiles(jsResources, allLoadedCallback) {
    var filesToLoad = [], propId, itemsLeft, i, currentFile,
        completionTracker = function () {
          itemsLeft -= 1;
          if (!itemsLeft) {
            allLoadedCallback();
          }
        };

    for (propId in jsResources) {
      if (!(propId in window)) {
        filesToLoad.push(jsResources[propId]);
      }
    }

    itemsLeft = filesToLoad.length;
    if (!itemsLeft) {
      allLoadedCallback();
    }

    for (i = 0; i < filesToLoad.length; i += 1) {
      currentFile = filesToLoad[i];
      appendJsFile(currentFile, completionTracker);
    }
  }

  /**
   * Retrieves configuration details for the style synchronization client.
   */
  function getClientMetadata() {
    var rootDomains = [document.location.protocol + "//" + document.location.host],
        jsElements, jsFileUrl, entryPoint, pathInfo;
    if (typeof window.__style_sync__ === "undefined") {
      jsElements = document.getElementsByTagName("script");
      for (var i = 0; i < jsElements.length; i++) {
        jsFileUrl = jsElements[i].getAttribute("src");
        if (jsFileUrl && jsFileUrl.slice(-15) === 'vogue-client.js') break;
      }
      entryPoint = jsFileUrl.match(/^https?\:\/\/(.*?)\//)[0];
      // An optional base argument might be provided in the script URL.
      pathInfo = jsFileUrl.match(/\bbase=(.*)(&|$)/);

      if (pathInfo) {
        rootDomains = rootDomains.concat(pathInfo[1].split(","));
      }
      return {
        baseUrl: entryPoint,
        rootDomains: rootDomains
      };
    } else {
      window.__style_sync__.rootDomains = rootDomains;
      return window.__style_sync__;
    }
  }

  /**
   * Extracts the port number from a given URL string.
   *
   * @param {String} targetUrl URL from which to extract the port.
   * @returns {Number} The detected port number, or 80 if none is found or it's invalid.
   */
  function parseUrlPort(targetUrl) {
    // The URL might contain a port number after the second colon.
    // E.g., http://domain:1234/
    var colonPos = targetUrl.indexOf(":", 6); // Skip first 6 chars to ignore protocol colon
    return colonPos < 0 ? 80 : parseInt(targetUrl.substr(colonPos + 1), 10);
  }

  clientScriptData = getClientMetadata();
  addMultipleJsFiles({
    io: clientScriptData.baseUrl + "socket.io/socket.io.js"
  }, cssUpdater);
}());