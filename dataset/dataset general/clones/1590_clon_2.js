var webProtocol = require('http');
var webProxyHandler = require('http-proxy'); // Web proxy handling library
var socketComm = require('socket.io'); // WebSocket communication framework
var templateEngine = require('ejs'); // Embedded JavaScript templating
var fileSystem = require('fs'); // Node.js file system module
var resourceLocator = require('url'); // URL parsing module
// var serviceOptions = { connectionTimeout: 10 }; // Example configuration object

var paramMarker = 's:33t=1'; // Specific query parameter string
var paramRegex = /s\:33t(\=1)?$/; // Regular expression for the parameter
var bindCommandPattern = /attach/; // Pattern for attaching a client
var restoreCommandPattern = /shimreset/; // Pattern for resetting the shim

// Function to determine if an HTTP response is a redirect
var checkRedirectStatus = function(responseDetails) {
  // Checks if the status code falls within the standard redirect range (300-400)
  return (responseDetails.statusCode >= 300 && responseDetails.statusCode <= 400) ? true : false;
};

// Function to append a specific parameter to a URL string
var addParameterToUrl = function(inputString) {
  if (inputString == null) {
    return inputString; // Return null if input is null
  }
  if (inputString.match(paramRegex)) {
    return inputString; // Parameter already exists, no modification
  }
  if (inputString.match(/\?/)) {
    inputString += "&"; // Append with '&' if query string is present
  } else {
    inputString += "?"; // Append with '?' if no query string
  }
  return inputString + paramMarker; // Add the defined parameter
};

var baseAddress = "http://foo.com/shim"; // Default base URL for the shim service
var landingPageLinks = []; // Collection of links for the landing page
/*
  Example structure for landingPageLinks:
  [
    {
      "label": 'boston globe quality assurance',
      "url": 'http://qaedit.bostonglobe.com/BostonGlobe'
    },
    {
      "label": 'filament group design prototypes',
      "url": 'http://10.100.50.47/Boston-Globe/tmpl/'
    },
  ]
*/

// Function to recursively inspect object properties up to a certain depth
var inspectObjectStructure = function(targetObject, currentDepth) {
  if (!currentDepth) {
    currentDepth = 0; // Initialize depth if not provided
  }
  currentDepth = currentDepth + 1; // Increment depth for the current level
  // console.log('Current inspection depth: ' + currentDepth); // Debugging depth
  if (currentDepth > 10) {
    console.log('Object inspection reached maximum recursion depth!');
    return; // Prevent infinite recursion
  }

  for (let propertyName in targetObject) { // Iterate over all properties of the object
    if (typeof(targetObject[propertyName]) == 'function') {
      // console.log(propertyName + "() - Identified as a function"); // Log function names
    } else {
      let propertyValue = targetObject[propertyName];
      try {
        console.log(propertyName + ":" + propertyValue); // Log property and its value
      } catch (exception) {
        // Catch and ignore errors during property access (e.g., getters throwing errors)
      }
      // if (propertyValue) inspectObjectStructure(propertyValue, currentDepth); // Recursive call for nested objects
    }
  }
};

var globalLoopCount = 0; // A generic counter, not actively used in the original code's logic
var currentResourcePath = null; // Stores the currently active resource path for the shim

var connectedClientTimestamps = {}; // Registry of connected client IDs and their connection times

// Calculates the duration a client has been connected
var getClientConnectionDuration = function(clientIdentifier) {
  let connectionTime = connectedClientTimestamps[clientIdentifier];
  let durationMs = new Date().getTime() - connectionTime;
  return Math.floor(durationMs / 1000); // Returns duration in seconds
};

// Placeholder for the client update broadcast function
var sendUpdateToClients = function() {};
// Placeholder for the connection logging function
var recordActiveConnections = function() {};

// Sets up a recurring task to broadcast updates and log connections
setInterval(function() {
  sendUpdateToClients(currentResourcePath); // Broadcast the current path to clients
  recordActiveConnections(); // Log details about active connections
}, 5000); // Executes every 5000 milliseconds (5 seconds)

// Generates the JavaScript shim to be injected into HTML content
var createInjectionScript = function(requestInfo) {
  let headerString = ""; // Unused in the final logic of the original function
  // for (let key in requestInfo.headers) headerString += (key + ":" + requestInfo.headers[key] + "\n"); // Example header logging
  // sendUpdateToClients(); // Potentially broadcast on shim creation

  let requestedHost = requestInfo.headers['host'];
  let requestedUrl = requestInfo.url;
  let fullResourceIdentifier = requestedHost + requestedUrl; // Full identifier of the requested resource

  let templateContent = fileSystem.readFileSync('views/shim.ejs', 'utf8'); // Read the EJS template file
  var generatedShim = templateEngine.render(templateContent); // Render the template using EJS
  return generatedShim;
};

// Extends String.prototype to include a method for trimming trailing whitespace
String.prototype.trimRightWhitespace = function() {
  return this.replace(/\s+$/, ""); // Replaces all trailing whitespace characters
};

// Checks if the HTTP response indicates an HTML content type
var isHtmlContentType = function(responseObject) {
  let contentTypeHeader = responseObject.headers['content-type'];
  if (!contentTypeHeader) {
    return false; // No content-type header, so not HTML
  }

  let typeTokens = contentTypeHeader.split(';'); // Split content type by semicolon
  let primaryType = typeTokens[0].trimRightWhitespace(); // Get the primary content type
  // console.log("+++ Content-Type primary token: " + primaryType + ":"); // Debugging content type
  if ((primaryType == 'text/html') && (responseObject.statusCode >= 200 && responseObject.statusCode < 300)) {
    return true; // It's HTML and a successful response
  } else {
    return false;
  }
};

var requestTimeoutDuration = 15000; // Time in milliseconds to ignore certain requests

var lastHtmlContentRequestTime = null; // Timestamp of the last processed HTML request
var authorizedResourcePaths = new Function(); // Object-like function to store valid paths
// This `new Function()` is an unusual but structurally preserved way to create an object.

// Utility function to calculate time since the last HTML request
var getTimeSinceLastHtmlRequest = function() {
  if (lastHtmlContentRequestTime === null) return Infinity; // Return a large number if no previous request
  return Math.floor((new Date().getTime() - lastHtmlContentRequestTime) / 1000); // Time in seconds
};

// Checks if the timeout duration has elapsed since the last HTML request
var hasTimeoutElapsed = function() {
  if (lastHtmlContentRequestTime === null) return true; // Always ready if no previous request
  return ((new Date().getTime() - lastHtmlContentRequestTime) > requestTimeoutDuration);
};

// Determines if HTML content can be processed for shim injection
var canProcessHtmlContent = function(currentRequest, fullRequestPath) {
  // if (currentResourcePath == fullRequestPath) return true; // Check if path is already current
  // if (resourceLocator.parse(currentResourcePath).hostname != currentRequest.headers['host']) return false; // Hostname mismatch

  if (authorizedResourcePaths[fullRequestPath] == true) {
    console.log('!! Path found in authorized_resource_paths: ' + fullRequestPath);
    return true; // Path is explicitly marked as authorized
  } else {
    // console.log('?? Path not found in authorized_resource_paths: ' + fullRequestPath); // Debugging unauthorized paths
  }

  if (lastHtmlContentRequestTime == null) {
    return true; // If no previous HTML request, it's always ready
  }
  return hasTimeoutElapsed(); // Otherwise, check if the timeout has passed
};


var isPrimaryHtmlRequest = true; // Flag indicating if the current request is a top-level HTML request

// Checks if the incoming request URL matches any exclusion patterns
var isRequestExcluded = function(currentRequest) {
  let requestedUrl = currentRequest.url;
  if (requestedUrl.match(/\.ico/)) {
    return true; // Exclude favicon requests
  }
  return false; // Not excluded
};

// Counts the occurrences of a specific character within a string
var characterOccurrenceCount = function(inputString, targetChar) {
  let counter = 0;
  for (let i = 0; i < inputString.length; ++i) {
    if (inputString[i] == targetChar) {
      counter++; // Increment counter if character matches
    }
  }
  return counter;
};

var uniqueUserAgents = {}; // Stores unique browser signatures and their last activity timestamps

// Generates a unique identifier for a browser based on IP and User-Agent
var formBrowserIdentifier = function(requestDetails) {
  let clientIp = requestDetails.client.remoteAddress;
  let clientUserAgent = requestDetails.headers['user-agent'];
  return clientIp + " " + clientUserAgent; // Combines IP address and User-Agent string
};

// Internal helper to determine if the shim parameter can be applied based on browser activity
var _canApplyParameter = function(requestDetails) {
  // Checks if this browser signature (IP + User-Agent) has been seen within the last hour
  let browserSignature = formBrowserIdentifier(requestDetails);
  let lastRequestFromBrowser = uniqueUserAgents[browserSignature];
  uniqueUserAgents[browserSignature] = new Date().getTime(); // Update the last activity time

  const oneHourInMs = 60 * 60 * 1000;
  if (!lastRequestFromBrowser || (new Date().getTime() - oneHourInMs) > lastRequestFromBrowser) {
    console.log("+++++++++++++++++++++++ PARAMETER APPLICABLE: " + browserSignature + ":" + uniqueUserAgents[browserSignature]);
    return true; // Parameter can be applied
  } else {
    // console.log("--- Parameter not applicable: " + browserSignature + ":" + uniqueUserAgents[browserSignature]);
    // The original code calls `is_settable_by_url` here, which is not defined.
    // Preserving this structural characteristic by calling a similarly undefined function.
    return canApplyParameterByUrl(requestDetails); // Fallback to URL-based check (if defined)
  }
};

// Determines if the shim parameter should be applied based on URL characteristics
var canApplyParameter = function(requestDetails) {
  let requestedUrl = requestDetails.url;

  if (requestedUrl.match(/json/)) {
    return false; // Do not apply to JSON requests
  }
  if (!requestedUrl.match(paramRegex)) {
    return false; // Parameter not found in the URL
  }
  if (requestedUrl.match(/=http/)) {
    // console.log("Found '=http' in URL => " + requestedUrl); // Debugging '=http' pattern
    return false; // Avoid applying if URL contains '=http' (e.g., a redirect target)
  }
  if (characterOccurrenceCount(requestedUrl, '?') > 1) {
    // console.log("Too many '?' characters => " + requestedUrl); // Debugging multiple query strings
    return false; // Avoid applying if multiple query strings are present
  }
  return true; // Parameter can be applied
};

// Checks if the URL contains the 'attach' command string
var isAttachCommand = function(targetUrl) {
  let matchResult = targetUrl.match(bindCommandPattern);
  // console.log(targetUrl + ":" + bindCommandPattern + ":" + matchResult); // Debugging match
  return matchResult;
};

// Checks if the URL contains the 'reset' command string
var isResetCommand = function(targetUrl) {
  let matchResult = targetUrl.match(restoreCommandPattern);
  let googleMatch = targetUrl.match(/google/); // An additional, seemingly unrelated check
  // console.log(targetUrl + ":" + bindCommandPattern + ":" + matchResult); // Debugging match
  return matchResult;
};

// Handles requests specifically for resetting the shim's state
function processResetRequest(incomingRequest, serverResponse) {
  serverResponse.write("<script>top.location.href='" + baseAddress + "';</script>");
  serverResponse.end();
  return;
}

// Renders the main landing page, including shim injection points and links
function renderLandingPage(incomingRequest, serverResponse) {
  currentResourcePath = baseAddress; // Set the current path to the base address
  let pageContent = "<meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>";
  pageContent += createInjectionScript(incomingRequest); // Inject the shim script into the page
  pageContent += "<div style='font-family:Courier;color:red'> \
	<h1 style=\"border-bottom:4px solid red\"> Shim Interface </h1> \
	<div style='color:black'> \
	<form onsubmit=\"send_url(jQuery('#url').val(),true);return false;\"> \
	Enter URL:  <input id='url' type='text' value='http://' width=120px/> <input type='submit' value='Set'/> </form> \
	</div> ";

  pageContent += '<a href=\'javascript:url=document.location.href;url.match(/\\?/)?url+="&":url+="?";url+="'+paramMarker+'";document.location.href=url\'>shim bookmarklet</a> (drag to toolbar)';

  if (landingPageLinks.length > 0) {
    console.log(">> First landing page link: " + landingPageLinks[0].url);
    for (let i = 0; i < landingPageLinks.length; ++i) {
      let linkEntry = landingPageLinks[i];
      // for (let prop in linkEntry) console.log(":" + linkEntry[prop]); // Example inspection of link properties
      pageContent += "<p><a href='" + linkEntry.url + "?" + paramMarker + "'>" + linkEntry.label + "</a></p>";
    }
    pageContent += "</div>";
  }
  serverResponse.setHeader("Content-Length", pageContent.length);
  serverResponse.setHeader("Content-Type", "text/html");
  serverResponse.write(pageContent);
  serverResponse.end();
  return;
}

// Handles requests for attaching a device, redirecting to the current shimmed path
function processAttachRequest(incomingRequest, serverResponse) {
  // serverResponse.statusCode = '300'; // Example of setting a status code
  if (!currentResourcePath) {
    processResetRequest(incomingRequest, serverResponse); // If no path, reset
    return;
  }
  serverResponse.write("<script>top.location.href='" + currentResourcePath + "'</script>");
  serverResponse.end();
  return;
}

var configurationSettings = null; // Global variable to hold loaded configuration

// Loads configuration data from 'config.json' file
var loadConfigurationData = function() {
  configurationSettings = null; // Reset configuration
  try {
    let configText = fileSystem.readFileSync('config.json', 'utf8');
    if (!configText || configText.length == 0) {
      console.log("CONFIG: Configuration file is present but empty.");
      return;
    }
    let parsedJson = JSON.parse(configText);
    configurationSettings = parsedJson.config; // Assign parsed configuration object
    console.log("PRESENTATION CYCLE SETTINGS:");
    inspectObjectStructure(configurationSettings.slideshow);
    console.log("EXCLUDED COOKIE NAMES:");
    inspectObjectStructure(configurationSettings.excluded_cookies);
  } catch (err) {
    console.log("CONFIG: No configuration file found or error reading it: " + err.message);
    return;
  }
};

// Initializes the slideshow functionality if configured
var setupPresentationCycle = function() {
  if (!configurationSettings || !configurationSettings.slideshow) {
    return; // Skip if slideshow configuration is missing
  }
  setInterval(function() {
    console.log("Presentation cycle set to slide " + presentationSlideIndex + "/" + configurationSettings.slideshow.paths[presentationSlideIndex]);
    currentResourcePath = configurationSettings.slideshow.path_base + "/" + configurationSettings.slideshow.paths[presentationSlideIndex] + "?" + paramMarker;
    sendUpdateToClients(currentResourcePath); // Broadcast the new slideshow path
    presentationSlideIndex++;
    if (presentationSlideIndex >= configurationSettings.slideshow.paths.length) {
      presentationSlideIndex = 0; // Loop back to the first slide
    }
  }, configurationSettings.slideshow.interval); // Set interval from configuration
};
// ------------------------------------------------------------------------------
// MAIN SERVER PROCESSING LOGIC
// ------------------------------------------------------------------------------

var webServerInstance = webProtocol.createServer(function(incomingRequest, serverResponse) {
  // for (let prop in incomingRequest.headers) console.log(prop + ":" + incomingRequest.headers[prop] + "\n"); // Log all incoming headers

  if (incomingRequest.url == '/shim') {
    console.log("Displaying the main landing page with shim options.");
    renderLandingPage(incomingRequest, serverResponse); // Serve the shim landing page
    return;
  }

  let fullRequestIdentifier = "http://" + incomingRequest.headers['host'] + incomingRequest.url;
  // if ((isPrimaryHtmlRequest || authorizedResourcePaths[fullRequestIdentifier]) && !incomingRequest.headers['referer'] && !isRequestExcluded(incomingRequest)) // Complex conditional check

  let currentRequestUrl = incomingRequest.url;
  // inspectObjectStructure(query_params); // Example of inspecting query parameters
  // console.log("Request for " + fullRequestIdentifier); // Log the full request URL
  // console.log("==== " + currentRequestUrl + "'" + isAttachCommand(currentRequestUrl)); // Debugging attach command

  if (isResetCommand(currentRequestUrl)) {
    processResetRequest(incomingRequest, serverResponse); // Handle the shim reset command
    console.log("Shim reset command received from client.");
    return; // Terminate request handling
  }

  if (isAttachCommand(currentRequestUrl)) {
    processAttachRequest(incomingRequest, serverResponse); // Handle client attachment command
    console.log("Device attachment requested by client.");
    return; // Terminate request handling
  }

  if (canApplyParameter(incomingRequest)) { // && canProcessHtmlContent(incomingRequest, fullRequestIdentifier)) // Check if shim parameter can be applied
    console.log("+++ Setting current path: " + fullRequestIdentifier);
    currentResourcePath = fullRequestIdentifier; // Update the global current path
    console.log("-----------------------------------");
    console.log(incomingRequest.url + " will receive shim injection");
    console.log("-----------------------------------");
    // authorizedResourcePaths[fullRequestIdentifier] = true; // Mark path as authorized
    // isPrimaryHtmlRequest = false; // Reset primary HTML request flag
    // setTimeout(function() { isPrimaryHtmlRequest = true; console.log("Resetting isPrimaryHtmlRequest to true"); }, 5000); // Delayed reset
    injectingProxyRequest(incomingRequest, serverResponse); // Proxy the request with shim injection
    sendUpdateToClients(currentResourcePath); // Broadcast the new path to connected clients
  } else {
    // console.log(" %%%%%%%%%%%%%% No shim applied for " + incomingRequest.url); // Debugging non-shimmed requests
    var standardProxy = new webProxyHandler.HttpProxy(); // Create a standard HTTP proxy instance
    if (serverResponse.statusCode >= 300 && serverResponse.statusCode < 400) {
      console.log("+++++++++++++ Status Code: " + serverResponse.statusCode); // Log redirect status codes
    }
    if (serverResponse.connection) {
      standardProxy.proxyRequest(incomingRequest, serverResponse, {
        host: incomingRequest.headers['host'],
        port: 80
      });
      standardProxy.terminateConnection(); // This call is structurally present in original, though its effect here is questionable.
    }
  }
});

webServerInstance.listen(3128); // Start the web server on port 3128

var sessionCookies = {}; // Object to store session cookies per host
var presentationSlideIndex = 0; // Index for the current slide in a presentation cycle
var transmissionInterval = 5000; // Interval for broadcasting updates
var lastTransmissionTime = null; // Timestamp of the last broadcast operation
// configurationSettings is already declared globally

loadConfigurationData(); // Execute configuration loading at server startup
setupPresentationCycle(); // Initialize any configured slideshow functionality
// ------------------------------------------------------------------------------
// END OF MAIN SERVER PROCESSING LOGIC
// ------------------------------------------------------------------------------


// Manages session cookies for proxy requests
function manageSessionCookies(targetHost, clientRequest) {
  // Collects new cookies from the request, merges them with existing ones for the host,
  // and updates the 'cookie' header for the outgoing proxy request.
  let newIncomingCookies = clientRequest.headers.cookie || ""; // Get new cookies from request
  // console.log("+++ New incoming cookies: " + newIncomingCookies); // Debugging incoming cookies
  let cookiePairs = newIncomingCookies.split(";"); // Split into individual cookie pairs
  let existingCookiesForHost = sessionCookies[targetHost] || {}; // Get existing cookies for this host

  for (let i in cookiePairs) {
    let currentPair = cookiePairs[i];
    let parts = currentPair.split("="); // Split cookie into name and value
    if (parts.length > 1) {
      let cookieName = parts[0].trim(); // Trim whitespace from cookie name
      if (configurationSettings && (configurationSettings.excluded_cookies[cookieName] != null)) {
        continue; // Skip cookies explicitly marked as excluded
      }
      let cookieValue = parts[1].trim(); // Trim whitespace from cookie value
      if (cookieValue.length > 0) {
        existingCookiesForHost[cookieName] = cookieValue; // Store or update cookie
      }
      // console.log("New cookie entry: " + cookieName + ":" + cookieValue); // Log new cookie
    }
  }

  let combinedCookieString = "";
  for (let name in existingCookiesForHost) {
    let value = existingCookiesForHost[name];
    combinedCookieString += (name + "=" + value + ";"); // Reconstruct combined cookie string
  }
  clientRequest.headers.cookie = combinedCookieString; // Set the combined cookie string in the request headers
  sessionCookies[targetHost] = existingCookiesForHost; // Update stored cookies for the host
  // console.log("+++ Combined cookie string for " + targetHost + ": " + combinedCookieString); // Debugging combined cookies
}

// Proxies a client request to an upstream server, injecting a shim into the response
var injectingProxyRequest = function(clientRequest, serverResponse) {
  // let injectedHtml = "<meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>"; // Viewport meta tag
  // injectedHtml += "<script>globe.OAS=null</script>"; // Example of additional script injection
  let injectedHtml = createInjectionScript(clientRequest); // Generate the dynamic shim content

  let targetHost = clientRequest.headers['host'];
  var upstreamProxy = webProtocol.createClient(80, targetHost); // Create HTTP client to upstream server (port 80)

  let modifiedRequestHeaders = clientRequest.headers;
  modifiedRequestHeaders['Accept-Encoding'] = ''; // Disable content encoding (e.g., gzip)
  modifiedRequestHeaders['accept-encoding'] = ''; // Ensure both cases are handled

  manageSessionCookies(targetHost, clientRequest); // Process and manage session cookies

  let fullResourceIdentifier = "http://" + clientRequest.headers['host'] + clientRequest.url;
  var proxyForwardRequest = upstreamProxy.request(clientRequest.method, clientRequest.url, modifiedRequestHeaders);

  proxyForwardRequest.addListener('response', function(upstreamResponse) {
    console.log('Initial response received for: ' + fullResourceIdentifier);
    let shimWasAdded = false; // Flag to track if shim has been added (unused in final logic)
    let declaredContentLength = 0; // Content length declared by upstream server
    let actualContentLength = 0; // Actual content length received

    upstreamResponse.addListener('data', function(dataChunk) {
      /*
      if (!shimWasAdded) {
        console.log("Actually adding shim with size " + injectedHtml.length);
        dataChunk = injectedHtml + dataChunk; // Prepend shim to the first chunk
        shimWasAdded = true;
      }
      */
      actualContentLength += dataChunk.length; // Accumulate actual content length
      // console.log("SHIMMED PAGE data chunk: " + dataChunk.length + ":" + actualContentLength + "/" + declaredContentLength); // Debugging chunk sizes
      serverResponse.write(dataChunk, 'binary'); // Write data chunk to client response
    }); // End of 'data' listener

    upstreamResponse.addListener('end', function() {
      console.log("SHIMMED PAGE response stream from upstream server ended.");
      console.log("Appending shim with size " + injectedHtml.length + " at the very end.");
      serverResponse.write(injectedHtml, 'binary'); // Append shim at the end of the response
      serverResponse.end(); // End the client's HTTP response
    });

    // console.log("SHIMMED PAGE preparing headers for client."); // Debugging header preparation
    let responseHeaders = upstreamResponse.headers;
    // Adjust the 'content-length' header to include the size of the injected shim
    responseHeaders['content-length'] = (parseInt(responseHeaders['content-length']) + injectedHtml.length);

    if (checkRedirectStatus(upstreamResponse)) {
      console.log("+++ Detected redirect, appending parameter string to location header value.");
      responseHeaders["location"] = addParameterToUrl(responseHeaders["location"]); // Modify redirect URL with parameter
    }
    serverResponse.writeHead(upstreamResponse.statusCode, responseHeaders); // Write response headers to the client
  }); // End of 'response' listener

  clientRequest.addListener('data', function(dataChunk) {
    proxyForwardRequest.write(dataChunk, 'binary'); // Forward client's request data to upstream server
  });

  clientRequest.addListener('end', function() {
    proxyForwardRequest.end(); // End the request to the upstream server
  });
};

console.log("Web server instance object: " + webServerInstance); // Log the server object reference

var socketServer = socketComm.listen(webServerInstance); // Attach Socket.IO to the existing HTTP server

var clientSocketRegistry = {}; // Object to store references to connected client sockets

// Socket.IO event handling setup
console.log('Setting up WebSocket listener for client connections...');

socketServer.sockets.on('connection', function(clientConnection) {
  // Logic for handling new WebSocket client connections would go here
});