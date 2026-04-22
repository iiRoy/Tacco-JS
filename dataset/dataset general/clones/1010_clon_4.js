const fileSystemOps = require("fs");
const webAddressParser = require("url");
const directoryPathUtil = require("path");
const networkCore = require('http');
const eventEmitterCore = require('events');
const systemData = require("os");

// --- Configuration and Utility Management ---

// A central store for application settings, with defaults
const applicationSettings = {
    listeningPort: 8085,
    serverEnv: null, // "development" or similar, if set
    userIdentifier: null,
    groupIdentifier: null,
    viewEngineFunction: null, // Placeholder for the template compilation logic
    viewProcessingConfig: {
        evalDelim:    /<@([\s\S]+?)@>/g, // New delimiters
        interpDelim: /<@=([\s\S]+?)@>/g,
        contextVars: ["PageData", "AppHost"],
        trimWhitespace: false,
        appendMode: true
    },
    assetFolderMap: {
        "styles": "/css",
        "images": "/img",
        "scripts": "/js"
    },
    defaultViewName: "index",
    errorPageViewKey: "404",
    enableRequestLogging: true
};

// Helper for encoding HTML
const escapeHtmlContent = (textInput) => {
    return String(textInput).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
};

// Helper for encoding URLs
const encodeUriComponent = (textInput) => {
    return encodeURIComponent(String(textInput));
};

// Provides system information (partially replaces process_user and /env route logic)
const retrieveSystemSnapshot = () => {
    const details = {
        environmentVariables: process.env,
        currentUserId: process.getuid(),
        operatingSystemDetails: {}
    };
    ["hostname", "type", "platform", "arch", "release", "networkInterfaces", "cpus"].forEach((prop) => {
        details.operatingSystemDetails[prop] = systemData[prop]();
    });
    if (process.env.HOME) {
        try {
            details.homeDirectoryContents = fileSystemOps.readdirSync(process.env.HOME);
        } catch (e) {
            details.homeDirectoryContents = "Access denied or directory not found";
        }
    }
    return details;
};

// --- Template System ---

// A class to manage individual view files and their compilation
class ViewAsset extends eventEmitterCore.EventEmitter {
    constructor(assetOptions) {
        super();
        if (!assetOptions.sourcePath) {
            throw new Error("View asset source path required.");
        }
        if (!fileSystemOps.existsSync(assetOptions.sourcePath) || !fileSystemOps.statSync(assetOptions.sourcePath).isFile()) {
            throw new Error("View asset file not found: " + assetOptions.sourcePath);
        }

        this.sourcePath = assetOptions.sourcePath;
        this.compileProcessor = assetOptions.compileProcessor;
        this.processorConfig = assetOptions.processorConfig;
        this.compiledRenderFunction = null; // Stores the actual compiled function

        // Initial compilation and setup watcher
        this.once("assetCompiled", (asset) => {
            fileSystemOps.watchFile(asset.sourcePath, (currentStats, previousStats) => {
                if (currentStats.mtimeMs !== previousStats.mtimeMs) {
                    this.emit("assetModified");
                }
            });
        });

        this.on("assetModified", () => {
            this.executeCompilation();
        });
    }

    executeCompilation() {
        try {
            const rawContent = fileSystemOps.readFileSync(this.sourcePath, "utf8");
            this.compiledRenderFunction = this.compileProcessor(rawContent, this.processorConfig);
            this.emit("assetCompiled", this);
        } catch (e) {
            console.error(`Error compiling view asset ${this.sourcePath}:`, e.message);
            // Optionally, keep the old compiled function or set a fallback error function
        }
    }

    renderOutput(pageData, applicationHostContext) {
        if (!this.compiledRenderFunction) {
            // If not yet compiled or compilation failed, try to compile
            this.executeCompilation();
            if (!this.compiledRenderFunction) {
                 throw new Error(`View asset ${this.sourcePath} failed to compile.`);
            }
        }
        return this.compiledRenderFunction(pageData, applicationHostContext);
    }
}

// Manages all view assets
class ViewManager {
    constructor(compiler, config) {
        this.mainCompiler = compiler;
        this.globalConfig = config;
        this.managedViews = new Map(); // Map<string, ViewAsset>
    }

    registerViewAsset(viewKey, filePath) {
        const asset = new ViewAsset({
            sourcePath: filePath,
            compileProcessor: this.mainCompiler,
            processorConfig: this.globalConfig
        });
        asset.executeCompilation(); // Initial compilation
        this.managedViews.set(viewKey, asset);
    }

    getRenderedContent(viewKey, pageData, applicationHostContext) {
        const asset = this.managedViews.get(viewKey);
        if (!asset) {
            throw new Error(`View asset '${viewKey}' not registered.`);
        }
        return asset.renderOutput(pageData, applicationHostContext);
    }

    hasViewAsset(viewKey) {
        return this.managedViews.has(viewKey);
    }
}

// --- Request Handling and Routing ---

class PathDispatcher {
    constructor() {
        // Stores routes as Map<HTTP_VERB, Map<DIRECTORY_PATH, Map<FILE_PATTERN, HANDLER>>>
        this.endpointMappings = new Map();
    }

    registerEndpoint(verb, directoryPath, filePattern, handler) {
        let verbMap = this.endpointMappings.get(verb.toUpperCase());
        if (!verbMap) {
            verbMap = new Map();
            this.endpointMappings.set(verb.toUpperCase(), verbMap);
        }

        let dirMap = verbMap.get(directoryPath);
        if (!dirMap) {
            dirMap = new Map();
            verbMap.set(directoryPath, dirMap);
        }
        dirMap.set(filePattern, handler);
    }

    locateEndpoint(verb, directoryPath, baseName, extension) {
        const verbMap = this.endpointMappings.get(verb.toUpperCase());
        if (!verbMap) return null;

        const dirMap = verbMap.get(directoryPath);
        if (!dirMap) return null;

        // Prioritized candidates for matching, same order as original
        const candidates = [
            baseName + extension, // e.g., "index.html"
            baseName,             // e.g., "index"
            "*" + extension,      // e.g., "*.html"
            "*"                   // e.g., "*"
        ];

        for (const pattern of candidates) {
            if (dirMap.has(pattern)) {
                return dirMap.get(pattern);
            }
        }
        return null; // No matching endpoint found
    }
}

// --- Main Server Factory ---

function forgeServerApp(initialConfiguration = {}) {
    // Merge provided config with defaults
    Object.assign(applicationSettings, initialConfiguration);

    const pathDispatcher = new PathDispatcher();
    let viewManagerInstance = null; // Will be initialized later

    // --- Core Responder Functions ---

    const sendViewContent = (viewKey, dataForView, responseChannel) => {
        const markup = viewManagerInstance.getRenderedContent(viewKey, dataForView, appHostInstance);
        const status = dataForView && dataForView.responseStatus || 200;
        responseChannel.writeHead(status, { "Content-Type": "text/html; charset=utf-8" });
        responseChannel.end(markup);
    };

    const sendJsonContent = (dataObject, responseChannel) => {
        const jsonOutput = JSON.stringify(dataObject, null, 2);
        responseChannel.writeHead(200, { "Content-Type": "application/json; charset=utf-8" });
        responseChannel.end(jsonOutput);
    };

    const initiateRedirection = (destinationUrl, responseChannel) => {
        responseChannel.writeHead(302, { 'Location': destinationUrl });
        responseChannel.end();
    };

    const handleError404 = (requestInfo, responseChannel) => {
        if (viewManagerInstance && viewManagerInstance.hasViewAsset(applicationSettings.errorPageViewKey)) {
            sendViewContent(applicationSettings.errorPageViewKey, { responseStatus: 404, requestDetails: requestInfo }, responseChannel);
        } else {
            responseChannel.writeHead(404, { "Content-Type": "text/plain" });
            responseChannel.end(`${requestInfo.originalUrl} not found`);
        }
    };

    // --- Built-in Handlers (equivalent to controllers) ---

    // Handler for template pages
    const pageViewHandler = (requestContext, responseChannel) => {
        const viewName = requestContext.pathDetails.baseName || applicationSettings.defaultViewName;
        if (viewManagerInstance.hasViewAsset(viewName)) {
            sendViewContent(viewName, requestContext, responseChannel);
        } else {
            handleError404(requestContext, responseChannel);
        }
    };

    // Handler for static assets
    const assetFileHandler = (requestContext, responseChannel) => {
        const filePath = directoryPathUtil.join(
            ".", // Assuming static files are relative to current dir
            requestContext.pathDetails.dirName,
            requestContext.pathDetails.baseName + requestContext.pathDetails.extension
        );
        
        try {
            const fileStats = fileSystemOps.statSync(filePath);
            if (!fileStats.isFile()) {
                handleError404(requestContext, responseChannel);
                return;
            }
            // Basic Mimetype detection (HACK TODO: improve this)
            const contentType = {
                ".css": "text/css",
                ".js": "application/javascript",
                ".ico": "image/x-icon",
                ".png": "image/png",
                ".jpg": "image/jpeg",
                ".gif": "image/gif",
                ".svg": "image/svg+xml",
                ".txt": "text/plain",
                ".html": "text/html"
            }[requestContext.pathDetails.extension] || "application/octet-stream";

            responseChannel.writeHead(200, { "Content-Type": contentType });
            fileSystemOps.readFile(filePath, (error, data) => {
                if (error) {
                    console.error("Error reading static file:", error);
                    handleError404(requestContext, responseChannel); // Or 500
                } else {
                    responseChannel.end(data);
                }
            });
        } catch (e) {
            if (e.code === 'ENOENT') { // File not found
                handleError404(requestContext, responseChannel);
            } else {
                console.error("Error serving static file:", e);
                responseChannel.writeHead(500, { "Content-Type": "text/plain" });
                responseChannel.end("Internal Server Error");
            }
        }
    };

    // Handler for favicon
    const iconFileHandler = (requestContext, responseChannel) => {
        responseChannel.writeHead(200, { "Content-Type": "image/x-icon" }); // TODO: set expires
        fileSystemOps.readFile("favicon.ico", (error, data) => {
            if (error) {
                console.error("Error reading favicon:", error);
                responseChannel.writeHead(404);
                responseChannel.end();
            } else {
                responseChannel.end(data);
            }
        });
    };

    // Handler for environment details
    const environmentReportHandler = (requestContext, responseChannel) => {
        sendJsonContent(retrieveSystemSnapshot(), responseChannel);
    };

    // --- Request Dispatcher ---
    const processIncomingRequest = (incomingRequest, outgoingResponse) => {
        const parsedAddress = webAddressParser.parse(incomingRequest.url, true);
        const requestMethod = incomingRequest.method;
        const requestPathname = parsedAddress.pathname;

        const pathDetails = {
            dirName: directoryPathUtil.dirname(requestPathname).replace(/\/*$/, '') || '/',
            extension: directoryPathUtil.extname(requestPathname),
            baseName: directoryPathUtil.basename(requestPathname, directoryPathUtil.extname(requestPathname)) || applicationSettings.defaultViewName,
            queryParameters: parsedAddress.query
        };

        if (applicationSettings.enableRequestLogging) {
            console.log(`[${requestMethod}] ${pathDetails.dirName}/${pathDetails.baseName}${pathDetails.extension}`);
        }

        let incomingBody = "";
        if (requestMethod === "POST" || requestMethod === "PUT" || requestMethod === "PATCH") {
            incomingRequest.on("data", (dataChunk) => {
                incomingBody += dataChunk;
            });
        }

        incomingRequest.on("end", () => {
            const requestContext = {
                originalRequest: incomingRequest,
                originalUrl: incomingRequest.url,
                method: requestMethod,
                pathDetails: pathDetails,
                bodyData: incomingBody || null,
                appHost: appHostInstance // Reference to the main application object
            };

            const matchedHandler = pathDispatcher.locateEndpoint(
                requestMethod,
                pathDetails.dirName,
                pathDetails.baseName,
                pathDetails.extension
            );

            if (matchedHandler) {
                matchedHandler(requestContext, outgoingResponse);
            } else {
                handleError404(requestContext, outgoingResponse);
            }
        });
    };

    const serverInstance = networkCore.createServer(processIncomingRequest);

    // --- Main Application Object (returned by factory) ---
    const appHostInstance = {
        // Configuration access
        configuration: applicationSettings,

        // Server control
        beginListening: () => {
            serverInstance.once("listening", () => {
                if (applicationSettings.userIdentifier) process.setuid(applicationSettings.userIdentifier);
                if (applicationSettings.groupIdentifier) process.setgid(applicationSettings.groupIdentifier);
                console.log(`Web engine now running as UID ${process.getuid()} and listening on port ${applicationSettings.listeningPort}`);
            });
            serverInstance.listen(applicationSettings.listeningPort);
        },
        
        // Template/View management
        setupViewEngine: (compilerFunc) => {
            applicationSettings.viewEngineFunction = compilerFunc;
            viewManagerInstance = new ViewManager(applicationSettings.viewEngineFunction, applicationSettings.viewProcessingConfig);
            // Register default error view if it exists
            const errorViewPath = directoryPathUtil.join("./", applicationSettings.errorPageViewKey + ".html"); // Assuming .html extension for views
            if (fileSystemOps.existsSync(errorViewPath)) {
                appHostInstance.registerViewAsset(applicationSettings.errorPageViewKey, errorViewPath);
            }
        },
        
        registerViewAsset: (viewKey, filePath) => {
            if (!viewManagerInstance) throw new Error("View engine not configured. Call setupViewEngine first.");
            viewManagerInstance.registerViewAsset(viewKey, filePath);
        },

        // Route registration
        addPathHandler: (method, directoryPath, filePattern, handlerFunc) => {
            pathDispatcher.registerEndpoint(method, directoryPath, filePattern, handlerFunc);
        },

        // Direct responders accessible to handlers
        sendViewResponse: sendViewContent,
        sendJsonResponse: sendJsonContent,
        sendRedirectResponse: initiateRedirection,
        sendError404Response: handleError404,

        // Utility access (similar to prototype properties in original)
        htmlSafe: escapeHtmlContent,
        uriEncode: encodeUriComponent,
        queryHelpers: require("querystring"),
        systemHelpers: require("util")
    };

    // --- Default Route Setup ---
    appHostInstance.addPathHandler("GET", "/", "favicon.ico", iconFileHandler);
    appHostInstance.addPathHandler("GET", "/", "*.html", pageViewHandler); // Matches any .html file in root
    appHostInstance.addPathHandler("GET", "/", applicationSettings.defaultViewName, pageViewHandler); // Explicit default view

    // Setup static routes based on config
    for (const assetKey in applicationSettings.assetFolderMap) {
        const folderPath = assetKey; // e.g., "styles"
        const uriPrefix = applicationSettings.assetFolderMap[assetKey]; // e.g., "/css"
        if (fileSystemOps.existsSync(folderPath) && fileSystemOps.statSync(folderPath).isDirectory()) {
            appHostInstance.addPathHandler("GET", uriPrefix, "*", assetFileHandler);
        }
    }

    // Add /env route if configured
    if (applicationSettings.serverEnv) {
        appHostInstance.addPathHandler("GET", "/", "env", environmentReportHandler);
    }

    return appHostInstance;
}

// Export the factory function
if (typeof exports !== 'undefined') {
    exports.WebEngine = forgeServerApp;
}