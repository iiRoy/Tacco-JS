const fileSys = require("fs");
const uriParser = require("url");
const pathUtil = require("path");
const httpModule = require("http");
const eventStream = require("events");

// --- Core Web Server Engine Definition ---

/**
 * Default configuration options for the web engine.
 * These can be overridden by user-provided parameters.
 */
const _defaultEngineConfiguration = {
  listenPort: 9000, // A different default port
  runtimeEnv: "development",
  processUserId: undefined,
  processGroupId: undefined,
  enableStaticAssets: true, // New flag for static asset serving
  staticAssetFolders: {
    "styles": "/css", // Renamed 'css' to 'styles'
    "images": "/img", // Renamed 'img' to 'images'
    "scripts": "/js" // Renamed 'js' to 'scripts'
  },
  viewEngine: null, // Placeholder for the actual rendering function
  viewConfig: { // Configuration for the view engine
    evaluationPattern: /\[\[([\s\S]+?)\]\]/g, // New delimiters
    interpolationPattern: /\[\[=([\s\S]+?)\]\]/g,
    dataVariableNames: ["ViewData", "ServerContext"], // Renamed variable names
    stripWhitespace: true, // Changed default from false
    appendOutput: true
  },
  enableRequestLogging: true // New option to control logging
};

/**
 * A simple internal logger to replace direct console.log calls.
 */
const _internalLogger = {
  info: (...args) => console.log(`[INFO] ${new Date().toISOString()} -`, ...args),
  warn: (...args) => console.warn(`[WARN] ${new Date().toISOString()} -`, ...args),
  error: (...args) => console.error(`[ERROR] ${new Date().toISOString()} -`, ...args),
  debug: (...args) => process.env.NODE_ENV === 'development' && console.debug(`[DEBUG] ${new Date().toISOString()} -`, ...args)
};

/**
 * Helper to determine content type for static files.
 */
const _mimeTypeRegistry = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".ico": "image/x-icon",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".txt": "text/plain",
  ".xml": "application/xml",
  // Add more as needed
  "default": "application/octet-stream"
};

/**
 * Main application engine constructor.
 * @param {object} initConfig Initial configuration for the engine.
 */
function WebEngine(initConfig) {
  // Inherit from Node.js HTTP Server
  Reflect.apply(httpModule.Server, this, []);

  // Merge provided configuration with defaults
  const currentConfig = { ..._defaultEngineConfiguration, ...initConfig };

  this._serverConfig = currentConfig;
  this._logger = _internalLogger; // Use the internal logger

  this.serverPort = this._serverConfig.listenPort;
  this.environmentConfig = this._serverConfig.runtimeEnv;
  this.processUserId = this._serverConfig.processUserId;
  this.processGroupId = this._serverConfig.processGroupId;

  // Initialize the view rendering mechanism
  this.viewCompiler = this._serverConfig.viewEngine || (() => {
    this._logger.error("No view compiler configured. View rendering will fail.");
    return () => { throw new Error("No view rendering engine available."); };
  });

  this.viewEngineConfig = this._serverConfig.viewConfig;
  this.registeredViews = {}; // Stores compiled view components

  // Cache for incoming POST request bodies
  this._requestBodyCache = new Map();

  // --- Engine Initialization Methods ---

  /**
   * Pre-compiles all registered view components upon startup.
   * Useful for validating view syntax early.
   */
  this.primeAllViews = function() {
    this._logger.info("Pre-compiling all registered view components...");
    for (const viewComponentName in this.registeredViews) {
      try {
        this.registeredViews[viewComponentName].prepareRenderFunction();
        this._logger.debug(`View component '${viewComponentName}' compiled successfully.`);
      } catch (err) {
        this._logger.error(`Error compiling view component '${viewComponentName}':`, err.message);
      }
    }
    this._logger.info("Finished view component pre-compilation.");
  };

  /**
   * Defines and manages the various request handlers (controllers).
   * Each handler processes a specific type of request.
   */
  this.requestHandlers = {
    /** Handler for serving dynamic HTML views. */
    viewHandler: function(requestPathDetails, httpRequest, httpResponse) {
      const viewName = requestPathDetails.baseName || "index";
      if (!viewName) {
        this._sendErrorResponse(httpResponse, 400, "Bad Request: View name missing.");
        return;
      }

      if (viewName in this.registeredViews) {
        this.serveHtmlView(viewName, requestPathDetails, httpResponse);
      } else {
        this._logger.warn(`View '${viewName}' not found.`);
        this.emit("routeMissing", requestPathDetails, httpRequest, httpResponse);
      }
    }.bind(this),

    /** Handler for serving static assets (CSS, JS, images). */
    staticAssetHandler: async function(requestPathDetails, httpRequest, httpResponse) {
      const requestedFilePath = pathUtil.join(
        ".", // Current directory base
        requestPathDetails.directoryPath,
        requestPathDetails.baseName + requestPathDetails.fileExtension
      );

      try {
        const fileStats = await fileSys.promises.stat(requestedFilePath);
        if (!fileStats.isFile()) {
          this._logger.warn(`Static asset '${requestedFilePath}' is not a file.`);
          this.emit("routeMissing", requestPathDetails, httpRequest, httpResponse);
          return;
        }

        const contentType = _mimeTypeRegistry[requestPathDetails.fileExtension.toLowerCase()] || _mimeTypeRegistry.default;
        httpResponse.writeHead(200, { "Content-Type": contentType, "Content-Length": fileStats.size });

        const fileStream = fileSys.createReadStream(requestedFilePath);
        fileStream.pipe(httpResponse);
        fileStream.on('error', (err) => {
          this._logger.error(`Error streaming static file '${requestedFilePath}':`, err);
          if (!httpResponse.headersSent) {
            this._sendErrorResponse(httpResponse, 500, "Internal Server Error during file stream.");
          } else {
            httpResponse.end(); // Close connection if headers already sent
          }
        });
      } catch (error) {
        this._logger.warn(`Static asset '${requestedFilePath}' not found or inaccessible:`, error.message);
        this.emit("routeMissing", requestPathDetails, httpRequest, httpResponse);
      }
    }.bind(this),

    /** Handler for the favicon. */
    faviconHandler: function(requestPathDetails, httpRequest, httpResponse) {
      const faviconPath = pathUtil.join(".", "favicon.ico");
      fileSys.promises.readFile(faviconPath)
        .then(data => {
          httpResponse.writeHead(200, {
            "Content-Type": "image/x-icon",
            "Content-Length": data.length,
            "Cache-Control": "public, max-age=86400" // Cache for 24 hours
          });
          httpResponse.end(data);
        })
        .catch(err => {
          this._logger.warn("Favicon file not found or inaccessible:", err.message);
          this.emit("routeMissing", requestPathDetails, httpRequest, httpResponse);
        });
    },

    /** Default handler for requests that don't match any defined routes. */
    missingRouteHandler: function(requestPathDetails, httpRequest, httpResponse) {
      const errorStatusCode = requestPathDetails.statusCode || 404;
      if ("error_404" in this.registeredViews) { // Renamed 404 to error_404
        this.serveHtmlView("error_404", {
          statusCode: errorStatusCode,
          requestDetails: requestPathDetails,
          originalRequest: httpRequest
        }, httpResponse);
      } else {
        if (httpResponse.headersSent) return httpResponse.end(); // Avoid header errors
        httpResponse.writeHead(errorStatusCode, { "Content-Type": "text/plain; charset=utf-8" });
        httpResponse.end(`Resource '${httpRequest.url}' not found on this server.`);
      }
    }.bind(this)
  };

  /**
   * Central repository for application routes.
   * Organized by HTTP method and then by path segment.
   */
  this.applicationRoutes = {
    GET: {
      "/": {
        "favicon.ico": this.requestHandlers.faviconHandler,
        "*.html": this.requestHandlers.viewHandler,
        "index": this.requestHandlers.viewHandler // Explicit index route
      },
      "/api/status": function(requestPathDetails, httpRequest, httpResponse) {
        // A new route for server status
        const statusData = {
          engineStatus: "operational",
          serverTime: new Date().toISOString(),
          environment: this.environmentConfig,
          processId: process.pid
        };
        this.serveJsonData(statusData, httpResponse);
      }.bind(this)
    },
    POST: {
      "/submit": function(requestPathDetails, httpRequest, httpResponse) {
        const postData = this._requestBodyCache.get(httpRequest);
        this._requestBodyCache.delete(httpRequest); // Consume the body
        if (postData) {
          this.serveJsonData({ message: "Data received!", received: JSON.parse(postData) }, httpResponse);
        } else {
          this._sendErrorResponse(httpResponse, 400, "No data submitted.");
        }
      }.bind(this)
    },
    PUT: {},
    DELETE: {}
  };

  // Dynamically set up static asset routes based on configuration
  if (this._serverConfig.enableStaticAssets) {
    const assetDirectories = this._serverConfig.staticAssetFolders;
    for (const folderKey in assetDirectories) {
      const virtualPath = assetDirectories[folderKey];
      const physicalPath = pathUtil.join(".", folderKey); // Assuming physical folder name matches key
      if (fileSys.existsSync(physicalPath) && fileSys.statSync(physicalPath).isDirectory()) {
        this._logger.info(`Mapping static assets from '${physicalPath}' to virtual path '${virtualPath}'.`);
        // Ensure the virtual path exists in GET routes
        if (!this.applicationRoutes.GET[virtualPath]) {
          this.applicationRoutes.GET[virtualPath] = {};
        }
        this.applicationRoutes.GET[virtualPath]["*"] = this.requestHandlers.staticAssetHandler;
      } else {
        this._logger.warn(`Static asset directory '${physicalPath}' not found or is not a directory. Skipping.`);
      }
    }
  }

  // Add an environment info route if configured
  if (this.environmentConfig === "development" || this.environmentConfig === "debug") {
    // Ensure the root path object exists
    if (!this.applicationRoutes.GET["/"]) {
      this.applicationRoutes.GET["/"] = {};
    }
    this.applicationRoutes.GET["/"]["server_info"] = function(requestPathDetails, httpRequest, httpResponse) {
      httpResponse.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
      const systemInfo = {
        processEnv: process.env,
        processUid: process.getuid(),
        osDetails: {
          hostname: require("os").hostname(),
          platform: require("os").platform(),
          arch: require("os").arch(),
          cpus: require("os").cpus().map(cpu => ({ model: cpu.model, speed: cpu.speed }))
        }
      };
      httpResponse.end(JSON.stringify(systemInfo, null, 4)); // Different indentation
    };
  }

  // Bind the missing route handler to the custom "routeMissing" event
  this.on("routeMissing", this.requestHandlers.missingRouteHandler);

  /**
   * Helper to send an error response with a specified status code and message.
   * @param {http.ServerResponse} res The HTTP response object.
   * @param {number} statusCode The HTTP status code.
   * @param {string} message The error message.
   * @param {string} contentType The content type for the response.
   */
  this._sendErrorResponse = function(res, statusCode, message, contentType = "text/plain; charset=utf-8") {
    if (res.headersSent) {
      this._logger.warn(`Attempted to send error '${message}' but headers already sent.`);
      return res.end();
    }
    res.writeHead(statusCode, { "Content-Type": contentType });
    res.end(message);
  };
}

// --- Prototype Inheritance and Utility Methods ---

// Inherit prototype methods from http.Server
WebEngine.prototype = Object.create(httpModule.Server.prototype);
WebEngine.prototype.constructor = WebEngine;

/**
 * Sends an HTTP redirect response to the client.
 * @param {string} targetUrl The URL to redirect to.
 * @param {http.ServerResponse} httpResponse The HTTP response object.
 */
WebEngine.prototype.sendRedirect = function(targetUrl, httpResponse) {
  if (httpResponse.headersSent) {
    this._logger.warn(`Cannot redirect to '${targetUrl}', headers already sent.`);
    return httpResponse.end();
  }
  httpResponse.writeHead(302, { 'Location': targetUrl });
  httpResponse.end();
};

/**
 * Retrieves the current system user ID.
 * (Simplified from original, removing 'getpw' dependency for Type III change)
 * @returns {string} The current process user identifier.
 */
WebEngine.prototype.getCurrentSystemUser = function() {
  try {
    return `User ID: ${process.getuid()}`;
  } catch (e) {
    this._logger.error("Failed to get process UID:", e.message);
    return "Unknown User";
  }
};

// Expose common Node.js utilities for view components
WebEngine.prototype.utilityModule = require("util");
WebEngine.prototype.querySerializer = require("querystring");

/**
 * Escapes HTML special characters in a string.
 * Accessible as ServerContext.escapeHtmlContent() or ServerContext.hEsc().
 * @param {string} inputString The string to escape.
 * @returns {string} The HTML-escaped string.
 */
WebEngine.prototype.escapeHtmlContent = WebEngine.prototype.hEsc = function(inputString) {
  if (typeof inputString !== 'string') return inputString; // Handle non-string inputs
  return inputString
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;') // Added double quote escaping
    .replace(/'/g, '&#039;'); // Added single quote escaping
};

/**
 * Encodes a string for use in a URL component.
 * Accessible as ServerContext.encodeUriComponent() or ServerContext.uEnc().
 * @param {string} inputString The string to encode.
 * @returns {string} The URI-encoded string.
 */
WebEngine.prototype.encodeUriComponent = WebEngine.prototype.uEnc = function(inputString) {
  if (typeof inputString !== 'string') return inputString;
  return encodeURIComponent(inputString);
};

/**
 * Registers a new view component with the engine.
 * @param {object|string} options Configuration for the view, or just its filename.
 */
WebEngine.prototype.registerViewComponent = function(options) {
  let viewOptions = {};
  if (typeof options === "string") {
    viewOptions.sourceFile = options;
  } else if (typeof options === "object" && options !== null) {
    viewOptions = { ...options };
  } else {
    throw new Error("Invalid options provided for view component registration.");
  }

  if (!viewOptions.sourceFile) {
    throw new Error("A 'sourceFile' is required to register a view component.");
  }

  // Ensure default compiler and config are set if not provided
  viewOptions.renderingEngine = viewOptions.renderingEngine || this.viewCompiler;
  viewOptions.engineSettings = viewOptions.engineSettings || this.viewEngineConfig;

  const fileExtension = pathUtil.extname(viewOptions.sourceFile);
  const baseComponentName = pathUtil.basename(viewOptions.sourceFile, fileExtension);

  // Allow for nested paths in view names, if desired, by using the full relative path
  // For simplicity, sticking to basename for now, consistent with original.
  this.registeredViews[baseComponentName] = new ViewComponent(viewOptions);
  this._logger.info(`View component '${baseComponentName}' from '${viewOptions.sourceFile}' registered.`);
};

/**
 * Renders a specific view component (partial) and returns its output as a string.
 * @param {string} componentName The name of the view component to render.
 * @param {object} viewData Data to pass to the view.
 * @returns {string} The rendered HTML string.
 */
WebEngine.prototype.renderViewPartial = function(componentName, viewData) {
  const component = this.registeredViews[componentName];
  if (!component) {
    this._logger.error(`Attempted to render non-existent view component: '${componentName}'`);
    throw new Error(`View component '${componentName}' not found.`);
  }
  try {
    return component.executeRender(viewData, this); // Pass 'this' as ServerContext
  } catch (err) {
    this._logger.error(`Error rendering view component '${componentName}':`, err.message);
    throw new Error(`Failed to render view '${componentName}': ${err.message}`);
  }
};

/**
 * Responds to an HTTP request by rendering an HTML view.
 * @param {string} componentName The name of the view component to render.
 * @param {object} dataToView Data to pass to the view.
 * @param {http.ServerResponse} httpResponse The HTTP response object.
 */
WebEngine.prototype.serveHtmlView = function(componentName, dataToView, httpResponse) {
  if (httpResponse.headersSent) {
    this._logger.warn(`Headers already sent for HTML view '${componentName}'. Aborting.`);
    return httpResponse.end();
  }
  try {
    const renderedBody = this.renderViewPartial(componentName, dataToView);
    const responseStatus = dataToView && dataToView.statusCode || 200;

    httpResponse.writeHead(responseStatus, {
      "Content-Type": "text/html; charset=utf-8",
      "Content-Length": Buffer.byteLength(renderedBody, 'utf8') // Explicit content-length
    });
    httpResponse.end(renderedBody);
  } catch (error) {
    this._logger.error(`Error serving HTML view '${componentName}':`, error.message);
    this._sendErrorResponse(httpResponse, 500, `Internal Server Error: Failed to render view '${componentName}'.`);
  }
};

/**
 * Responds to an HTTP request by sending JSON data.
 * @param {object} dataToSend The data object to serialize to JSON.
 * @param {http.ServerResponse} httpResponse The HTTP response object.
 */
WebEngine.prototype.serveJsonData = function(dataToSend, httpResponse) {
  if (httpResponse.headersSent) {
    this._logger.warn("Headers already sent for JSON response. Aborting.");
    return httpResponse.end();
  }
  const jsonPayload = JSON.stringify(dataToSend, null, 2); // Pretty print JSON
  httpResponse.writeHead(200, {
    "Content-Type": "application/json; charset=utf-8",
    "Content-Length": Buffer.byteLength(jsonPayload, 'utf8')
  });
  httpResponse.end(jsonPayload);
};

/**
 * Normalizes a URL path by ensuring a leading slash and no trailing slash (unless it's root).
 * @param {string} inputPath The path to normalize.
 * @returns {string} The normalized path.
 */
function _normalizePathSegment(inputPath) {
  let normalized = inputPath.replace(/^\/*/, '/'); // Ensure leading slash
  if (normalized !== '/') {
    normalized = normalized.replace(/\/*$/, ''); // Remove trailing slash unless it's root
  }
  return normalized;
}

/**
 * Extracts path components from a parsed URL.
 * @param {url.UrlWithParsedQuery} parsedUrl The parsed URL object.
 * @returns {object} An object containing directoryPath, baseName, fileExtension, and query.
 */
function _extractPathSegments(parsedUrl) {
  const fullPath = parsedUrl.pathname || '/';
  const fileExtension = pathUtil.extname(fullPath);
  const baseName = pathUtil.basename(fullPath, fileExtension) || "index"; // Default to 'index'
  let directoryPath = pathUtil.dirname(fullPath);

  directoryPath = _normalizePathSegment(directoryPath);

  return {
    directoryPath: directoryPath,
    baseName: baseName,
    fileExtension: fileExtension,
    query: parsedUrl.query,
    rawPath: fullPath
  };
}

/**
 * Processes an incoming HTTP request, dispatches it to the appropriate handler.
 * @param {http.IncomingMessage} httpRequest The incoming HTTP request.
 * @param {http.ServerResponse} httpResponse The HTTP response object.
 * @param {string|Buffer|null} requestBody The parsed request body (if any).
 * @returns {any} The result of the dispatched handler.
 */
WebEngine.prototype.processIncomingRequest = function(httpRequest, httpResponse, requestBody) {
  const parsedUri = uriParser.parse(httpRequest.url, true);
  const requestMethod = httpRequest.method.toUpperCase();
  const pathComponents = _extractPathSegments(parsedUri);

  if (this._serverConfig.enableRequestLogging) {
    this._logger.info(`${requestMethod} ${pathComponents.rawPath}`);
  }

  let matchedHandler = this.requestHandlers.missingRouteHandler; // Default handler

  // Check if routes exist for the HTTP method
  if (this.applicationRoutes[requestMethod]) {
    const methodRoutes = this.applicationRoutes[requestMethod];

    // Check for specific directory routes first
    const targetDirectoryRoutes = methodRoutes[pathComponents.directoryPath];
    if (targetDirectoryRoutes) {
      // Prioritize more specific matches
      const potentialKeys = [
        pathComponents.baseName + pathComponents.fileExtension, // e.g., "about.html"
        pathComponents.baseName, // e.g., "about"
        "*" + pathComponents.fileExtension, // e.g., "*.html"
        "*" // Wildcard
      ];

      for (const key of potentialKeys) {
        if (Object.prototype.hasOwnProperty.call(targetDirectoryRoutes, key)) {
          matchedHandler = targetDirectoryRoutes[key];
          break; // Found the most specific handler
        }
      }
    }
  }
  // Execute the matched handler
  return matchedHandler(pathComponents, httpRequest, httpResponse, requestBody);
};


/**
 * Initiates the web server to start listening for incoming requests.
 */
WebEngine.prototype.commenceListening = function() {
  // Event listener for incoming requests
  this.on("request", (incomingRequest, serverResponse) => {
    // For POST/PUT requests, collect the body data
    if (incomingRequest.method === "POST" || incomingRequest.method === "PUT") {
      let bodyChunks = [];
      incomingRequest.on("data", (chunk) => {
        bodyChunks.push(chunk);
      });
      incomingRequest.on("end", () => {
        const body = Buffer.concat(bodyChunks).toString();
        this._requestBodyCache.set(incomingRequest, body); // Store body for handler to retrieve
        this.processIncomingRequest(incomingRequest, serverResponse, body);
      });
      incomingRequest.on("error", (err) => {
        this._logger.error("Request data error:", err);
        this._sendErrorResponse(serverResponse, 500, "Error processing request data.");
      });
    } else {
      // For GET/DELETE and other methods, body is null
      this.processIncomingRequest(incomingRequest, serverResponse, null);
    }
  });

  // Event listener for when the server starts listening
  this.once("listening", () => {
    // Attempt to set process UID/GID if configured
    if (this.processUserId) {
      try {
        process.setuid(this.processUserId);
        this._logger.info(`Process UID set to ${this.processUserId}.`);
      } catch (e) {
        this._logger.error(`Failed to set process UID to ${this.processUserId}: ${e.message}`);
      }
    }
    if (this.processGroupId) {
      try {
        process.setgid(this.processGroupId);
        this._logger.info(`Process GID set to ${this.processGroupId}.`);
      } catch (e) {
        this._logger.error(`Failed to set process GID to ${this.processGroupId}: ${e.message}`);
      }
    }
    this._logger.info(`WebEngine now running as ${this.getCurrentSystemUser()} and listening on port ${this.serverPort}.`);
    this._logger.info(`Environment: ${this.environmentConfig}`);
  });

  // Event listener for server errors
  this.on("error", (err) => {
    this._logger.error("Server encountered an error:", err.message);
    if (err.code === 'EADDRINUSE') {
      this._logger.error(`Port ${this.serverPort} is already in use.`);
      process.exit(1); // Exit if port is unavailable
    }
  });

  // Start the HTTP server
  this.listen(this.serverPort);
};


// --- View Component Definition ---

/**
 * Represents a single reusable view component (template).
 * @param {object} viewOptions Configuration for the view component.
 */
function ViewComponent(viewOptions) {
  // Validate essential options
  if (!viewOptions || !viewOptions.sourceFile) {
    throw new Error("A 'sourceFile' is required to instantiate a ViewComponent.");
  }
  if (typeof viewOptions.renderingEngine !== 'function') {
    throw new Error("A 'renderingEngine' function must be provided for ViewComponent.");
  }

  this.renderingEngine = viewOptions.renderingEngine; // The function that compiles the view source
  this.engineSettings = viewOptions.engineSettings; // Configuration passed to the rendering engine
  this.sourceFile = viewOptions.sourceFile; // Path to the view file

  // Ensure the view file exists and is accessible
  try {
    const fileStats = fileSys.statSync(this.sourceFile);
    if (!fileStats.isFile()) {
      throw new Error(`View source file '${this.sourceFile}' is not a valid file.`);
    }
    this._lastModifiedTime = fileStats.mtime.getTime(); // Store initial modification time
  } catch (e) {
    _internalLogger.error(`Failed to access view source file '${this.sourceFile}': ${e.message}`);
    throw new Error(`View source file '${this.sourceFile}' not found or inaccessible.`);
  }

  this._compiledRenderFunction = null; // Cache for the compiled function

  // On first successful compilation, set up a file watcher
  this.once("compiled", (component) => {
    _internalLogger.debug(`Setting up watcher for view component: '${component.sourceFile}'`);
    fileSys.watchFile(component.sourceFile, { interval: 5000 }, (currentStats, previousStats) => { // Poll every 5s
      if (currentStats.mtime.getTime() !== previousStats.mtime.getTime()) {
        _internalLogger.info(`View component '${component.sourceFile}' modified. Triggering re-compilation.`);
        component.emit("modified");
      }
    });
  });

  // Recompile if the view file is modified
  this.on("modified", () => {
    // Clear cached function to force re-compilation
    this._compiledRenderFunction = null;
    this.prepareRenderFunction();
  });
}

// Inherit from Node.js EventEmitter for custom events (e.g., 'compiled', 'modified')
ViewComponent.prototype = Object.create(eventStream.EventEmitter.prototype);
ViewComponent.prototype.constructor = ViewComponent;

/**
 * Reads the view source file and compiles it into a render function.
 * Caches the compiled function.
 */
ViewComponent.prototype.prepareRenderFunction = function() {
  if (this._compiledRenderFunction) {
    _internalLogger.debug(`View component '${this.sourceFile}' already compiled.`);
    this.emit("compiled", this); // Emit again if already compiled, for consistency
    return;
  }

  try {
    _internalLogger.debug(`Compiling view component: '${this.sourceFile}'...`);
    const viewSourceContent = fileSys.readFileSync(this.sourceFile, "utf8");
    this._compiledRenderFunction = this.renderingEngine(viewSourceContent, this.engineSettings);
    this.emit("compiled", this);
    _internalLogger.info(`View component '${this.sourceFile}' compiled successfully.`);
  } catch (error) {
    _internalLogger.error(`Failed to compile view component '${this.sourceFile}':`, error.message);
    // Clear the compiled function on error to force re-attempt
    this._compiledRenderFunction = null;
    throw new Error(`View compilation error: ${error.message}`);
  }
};

/**
 * Executes the compiled render function to produce the final output.
 * If not yet compiled, it will compile first.
 * @param {object} viewData Data to be injected into the view.
 * @param {object} serverContext Context object (e.g., the WebEngine instance) for helper methods.
 * @returns {string} The rendered output.
 */
ViewComponent.prototype.executeRender = function(viewData = {}, serverContext = {}) {
  if (!this._compiledRenderFunction) {
    this.prepareRenderFunction(); // Compile if not already compiled
  }
  if (!this._compiledRenderFunction) {
    throw new Error(`View component '${this.sourceFile}' is not compiled and cannot be rendered.`);
  }
  return this._compiledRenderFunction(viewData, serverContext);
};

// --- Module Exports ---
// Using module.exports for a more modern Node.js module pattern
module.exports = {
  WebEngine: WebEngine,
  ViewComponent: ViewComponent,
  // recipes: require("./recipes") // If 'recipes' was an external module, uncomment and ensure path
};