var fileSystem = require("fs"),
webAddress = require("url"),
fileLocation = require("path");

/*
 * Note: Refactor routeInfo parameter to handlers,
 *       and refine the interface for view engines.
 * Note: Consider moving view_config/compiler logic
 *       into a separate 'presets' directory or env setup.
 */

function Sled(applicationConfig) {
  require('http').Server.call(this); // Call the parent constructor

  if (typeof applicationConfig === "undefined") {
    applicationConfig = {};
  }

  this.listenPort = ("port" in applicationConfig) ? applicationConfig.port : 8085; // A numerical value for listening port

  if ("environment" in applicationConfig) this.runtimeEnv = applicationConfig.environment;
  if ("userId" in applicationConfig) this.userID = applicationConfig.userId;
  if ("groupId" in applicationConfig) this.groupID = applicationConfig.groupId;

  this.viewProcessor = ("viewProcessor" in applicationConfig) ? applicationConfig.viewProcessor : function () { throw new Error("No view processing engine has been set up."); };

  // TODO: Expand support for other view engines beyond doT.js?
  this.viewSettings = {
    evalPattern:    /<%([\s\S]+?)%>/g, // Regular expression for script evaluation
    interpPattern: /<%=([\s\S]+?)%>/g, // Regular expression for data interpolation
    dataKeys: ["ViewContext", "ApplicationServer"], // Variables available in views
    trimWhitespace: false, // Should extra whitespace be removed?
    addContent: true // Should content be appended?
  };

  this.views = {}; // Storage for compiled view templates

  // Function to process all loaded views, useful for checking syntax on startup
  this.buildAllViews = function() {
    for (var viewName in this.views) {
      this.views[viewName].build();
    }
  };

  this.requestHandlers = {
    viewHandler: function(routeInfo, clientRequest, serverResponse) {
      var viewIdentifier = routeInfo.baseName || "index";
      if (viewIdentifier in this.views) {
        this.renderViewContent(viewIdentifier, routeInfo, serverResponse);
      } else {
        this.trigger("resourceMissing", routeInfo, clientRequest, serverResponse);
      }
    }.bind(this),
    assetHandler: function(routeInfo, clientRequest, serverResponse) {
      var filePath = "." + routeInfo.dirName + "/" + routeInfo.baseName + routeInfo.extension;
      if (!fileSystem.statSync(filePath).isFile()) { // Check if the file exists and is a regular file
        this.trigger("resourceMissing", routeInfo, clientRequest, serverResponse);
      } else {
        serverResponse.writeHead(200, {"content-type": "text/css"}); // NOTE: This is a temporary content type, needs dynamic detection
        fileSystem.readFile(filePath, function (readErr, fileData) {
          serverResponse.end(fileData);
        });
      }
    }.bind(this),
    iconHandler: function(routeInfo, clientRequest, serverResponse) {
      serverResponse.writeHead(200, {"content-type": "image/x-icon"}); // Consider adding cache headers like 'Expires'
      fileSystem.readFile("app_icon.ico", function (readErr, fileData) {
        serverResponse.end(fileData);
      });
    },
    resourceMissingHandler: function (routeInfo, clientRequest, serverResponse) {
      if ("error_404" in this.views) {
        this.renderViewContent("error_404", { httpStatus: 404, routeInfo: routeInfo, clientRequest: clientRequest }, serverResponse);
      } else {
        serverResponse.writeHead(404, {"content-type": "text/plain"});
        serverResponse.end(clientRequest.url + " was not found");
      }
    }.bind(this)
  };

  // TODO: Implement configuration for default routing rules
  this.appPaths = {
    GET: {
      "/": {
        "app_icon.ico": this.requestHandlers.iconHandler,
        "*.html": this.requestHandlers.viewHandler
      },
    },
    POST: { }
  };

  // Configure static asset routes
  if (true) { // TODO: Add an 'staticAssets' option to appConfig (maybe with a path)?
    var assetDirectories = {"style": "/css", "images": "/img", "scripts": "/js"}; // TODO: Pass these in appConfig?
    for (var currentDir in assetDirectories) {
      if (fileSystem.existsSync(currentDir) && fileSystem.statSync(currentDir).isDirectory()) {
        this.appPaths.GET[assetDirectories[currentDir]] = { "*": this.requestHandlers.assetHandler };
      }
    }
  }

  if (applicationConfig.environment) {
    // TODO: Make the path a configurable option
    this.appPaths.GET["/"]["sysinfo"] = function(routeInfo, clientRequest, serverResponse) {
      serverResponse.writeHead(200, {"content-type": "application/json"}); // TODO: Change content type based on file extension
      var systemData = { envVars: process.env, userIdentifier: process.getuid(), osDetails: {} };
      var osModule = require("os");
      ["hostname", "type", "platform", "arch", "release", "networkInterfaces", "cpus"].forEach(function (propName) {
        systemData.osDetails[propName] = osModule[propName]();
      });
      if (process.env.HOME) systemData.homeDirContents = fileSystem.readDirectorySync(process.env.HOME);
      // systemData.passwd_entry = require("getpw").getpwuid(systemData.userIdentifier); (TODO: Pass to constructor to remove direct dependency)
      serverResponse.end(JSON.stringify(systemData, null, "  "));
    }
  }

  this.sendRedirect = function(targetURL, serverResponse) {
      serverResponse.writeHead(302, { 'Location': targetURL });
      serverResponse.end();
  };

  this.on("resourceMissing", this.requestHandlers.resourceMissingHandler);

  this.processIncomingRequest = function(clientRequest, serverResponse, postBody) {
    var parsedURL = webAddress.parse(clientRequest.url, true);
    var reqMethod = clientRequest.method,
        basePath = fileLocation.dirname(parsedURL.pathname).replace(/\/*$/, ''), // Remove any trailing slash
        fileExtension = fileLocation.extname(parsedURL.pathname), // TODO: Should there be a default extension?
        baseFileName = fileLocation.basename(parsedURL.pathname, fileExtension) || "index"; // TODO: Configurable default base filename?

    console.info("Request: %s %s/%s%s", reqMethod, basePath, baseFileName, fileExtension); // TODO: Add a toggle for this request logging

    if (basePath === "") basePath = "/"; // Handle root paths specifically, where leading and trailing slashes are identical

    // TODO: Add a configuration option for case (in)sensitivity in paths
    // basePath = basePath.toLowerCase();
    // baseFileName = baseFileName.toLowerCase();

    var chosenHandler = this.requestHandlers.resourceMissingHandler;
    if (this.appPaths[reqMethod] && this.appPaths[reqMethod][basePath]) {
       // Locate the most precise match available
       var potentialMatch, possibleMatches = [baseFileName + fileExtension, baseFileName, "*" + fileExtension, "*"];
       while (potentialMatch = possibleMatches.shift()) {
         if (potentialMatch in this.appPaths[reqMethod][basePath]) {
             chosenHandler = this.appPaths[reqMethod][basePath][potentialMatch];
             break; // Exit the loop once a match is found
         }
       }
    }
    return chosenHandler({ dirName: basePath, baseName: baseFileName, extension: fileExtension, queryParams: parsedURL.query }, clientRequest, serverResponse, postBody);
  };
}

// TODO: Utilize Node's 'util.inherits' for cleaner inheritance
Sled.prototype = Object.create(require('http').Server.prototype);
Sled.prototype.constructor = Sled;

Sled.prototype.getSystemUser = function () {
  var userName = "";
  try {
    userName = require("getpw").getpwuid(process.getuid()).pw_name;
  } catch (err) {
    userName = "user ID " + process.getuid();
  }
  return userName;
}
     
// Provide access to built-in Node modules that might be needed by view templates
Sled.prototype.utilities = require("util");
Sled.prototype.queryStrings = require("querystring");

// A simple HTML escaping function available to views as ApplicationServer.escapeHtml() or ApplicationServer.h()
Sled.prototype.markupEscape = Sled.prototype.escapeHtml = function (inputString) {
  return inputString.replace(/&/g, '\&amp;').replace(/</g, '\&lt;').replace(/>/g, '\&gt;');
}
// For consistent naming, here is URI encoding accessible as ApplicationServer.uriEncode or ApplicationServer.u()
Sled.prototype.uriEncode = Sled.prototype.encodeUri = function (inputString) { return encodeURIComponent(inputString); }

Sled.prototype.addView = function(viewOptions) {
  if (typeof viewOptions === "string") viewOptions = { sourceFile: viewOptions, processor: this.viewProcessor };
  if (!("settings" in viewOptions)) viewOptions.settings = this.viewSettings;
  var fileExtension = fileLocation.extname(viewOptions.sourceFile),
      baseFileName = fileLocation.basename(viewOptions.sourceFile, fileExtension);
  // TODO: Keep stripping extensions and processing them until we reach one that matches a template engine?

  // TODO: Implement support for file paths (or slashes in view names?)
  this.views[baseFileName] = new PageLayout(viewOptions);
};

// Render a specific named view's content as a string
Sled.prototype.renderPartial = function (layoutName, contextData) {
  return this.views[layoutName].display(contextData, this);
};

Sled.prototype.renderViewContent = function(layoutName, contextData, serverResponse) {
  var outputContent = this.renderPartial(layoutName, contextData);
  var httpStatus = contextData && contextData.httpStatus || 200;
  serverResponse.writeHead(httpStatus, {"content-type": "text/html; charset=utf-8"}); // TODO: Implement "content-length" header
  serverResponse.end(outputContent);
};

Sled.prototype.jsonResponse = function(payloadData, serverResponse) {
  var jsonOutput = JSON.stringify(payloadData, null, 2);
  serverResponse.writeHead(200, {"content-type": "application/json; charset=utf-8"}); // TODO: Implement "content-length" header
  serverResponse.end(jsonOutput);
};

Sled.prototype.initiate = function() {
  this.on("request", function(clientRequest, serverResponse) {
    var requestBody = "";
    if (clientRequest.method === "POST") clientRequest.on("data", function (dataChunk) { requestBody += dataChunk; });
    clientRequest.on("end", function () { this.processIncomingRequest(clientRequest, serverResponse, clientRequest.method === "POST" && requestBody); }.bind(this));
  });
  this.once("ready", function () {
      if (this.userID) process.setuid(this.userID);
      if (this.groupID) process.setgid(this.groupID);
      console.info("Sled is now operating as " +  this.getSystemUser() + " and listening on port " + this.listenPort);
  });
  this.listen(this.listenPort);
};

function PageLayout(layoutOptions) {
  this.processor = layoutOptions.processor; // Takes two arguments: view content as string and a settings object
  this.settings = layoutOptions.settings; // Will be passed as the second argument to the processor

  if (!layoutOptions.sourceFile) {
    throw new Error("Source file path is mandatory.");
  }

  if (!fileSystem.existsSync(layoutOptions.sourceFile) || !fileSystem.statSync(layoutOptions.sourceFile).isFile()) {
    throw new Error("View source file was not found: " + layoutOptions.sourceFile);
  }

  this.sourceFile = layoutOptions.sourceFile;

  // Upon the initial processing, add a file watcher for changes. TODO: Option to disable this or only enable in development.
  this.once("processed", function (layoutItem) {
    fileSystem.watchFile(layoutItem.sourceFile, function (currentStats, previousStats) {
        if (currentStats.mtime.getTime() !== previousStats.mtime.getTime()) this.trigger("altered");
    }.bind(layoutItem));
  });

  // Re-process if the source file is modified
  this.on("altered", function() { this.build(); });
}

PageLayout.prototype = Object.create(require('events').EventEmitter.prototype);
PageLayout.prototype.constructor = PageLayout;

PageLayout.prototype.build = function() {
  this.display = this.processor(fileSystem.readFileSync(this.sourceFile, "utf8"), this.settings);
  this.trigger("processed", this);
}

PageLayout.prototype.display = function(contextData, renderContext) {
  this.build();
  return this.display(contextData, renderContext);
};

if (exports) {
  exports.Sled = Sled;
  exports.PageLayout = PageLayout;
  exports.predefinedConfig = require("./presets");
}