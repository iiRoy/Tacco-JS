const networkCore = require('http');
const proxyEngine = require('http-proxy');
const socketGateway = require('socket.io');
const templateRenderer = require('ejs');
const fileSystem = require('fs');
const urlParser = require('url');

// Configuration constants and patterns
const shimInjectionParam = '_shim_param_=1'; // Changed from 's:33t=1'
const shimParamPattern = /_shim_param_(=1)?$/; // Regex for the shim parameter
const attachCmdPattern = /attach_device/; // Changed from /attach/
const resetCmdPattern = /reset_state/; // Changed from /shimreset/
const defaultListenPort = 3128; // Explicit port constant

let currentShimmablePath = null; // Renamed from Path
let lastHtmlContentRequestTime = null; // Renamed from last_text_html_request_time
const htmlRequestGracePeriodMs = 15000; // Renamed from timeout
let applicationConfig = null; // Renamed from CONFIG

// Utility for checking HTTP redirection status codes
const isRedirectionStatusCode = (responseObject) => {
    return (responseObject && responseObject.statusCode >= 300 && responseObject.statusCode <= 400);
};

// Modifies a URL to include the shim injection parameter
const addShimParameterToUrl = (targetUrl) => {
    if (!targetUrl || typeof targetUrl !== 'string') {
        console.debug('Attempted to add shim param to invalid URL:', targetUrl);
        return targetUrl;
    }
    if (targetUrl.match(shimParamPattern)) {
        return targetUrl; // Already has the shim parameter
    }
    const separator = targetUrl.includes('?') ? '&' : '?';
    return `${targetUrl}${separator}${shimInjectionParam}`;
};

// Sample homepage links (originally commented out)
const homepageNavigationLinks = [
    {
        "label":'Example Site One',
        "url":'http://example.com/section/page'
    },
    {
        "label":'Another Test Path',
        "url":'http://anothersite.org/test/'
    },
];

// Simplified debugging object inspector
const inspectObjectLite = (targetObj, currentDepth = 0) => {
    if (currentDepth > 3) { // Reduced depth for brevity
        console.debug('Object inspection depth limit reached.');
        return;
    }
    for (const key in targetObj) {
        if (Object.prototype.hasOwnProperty.call(targetObj, key)) {
            const value = targetObj[key];
            if (typeof value === 'function') {
                // console.debug(`  ${' '.repeat(currentDepth * 2)}${key}(): [Function]`);
            } else if (typeof value === 'object' && value !== null) {
                console.debug(`  ${' '.repeat(currentDepth * 2)}${key}: {Object}`);
                // inspectObjectLite(value, currentDepth + 1); // Only recurse if really needed
            } else {
                console.debug(`  ${' '.repeat(currentDepth * 2)}${key}: ${value}`);
            }
        }
    }
};

// Checks if the response content type indicates HTML
const isHtmlContentType = (responseDetails) => {
    if (!responseDetails || !responseDetails.headers || !responseDetails.headers['content-type']) {
        return false;
    }
    const contentTypeHeader = responseDetails.headers['content-type'];
    const typeTokens = contentTypeHeader.split(';');
    const mainType = typeTokens[0].trim();
    return mainType.startsWith('text/html') && (responseDetails.statusCode >= 200 && responseDetails.statusCode < 300);
};

// Helper to determine if the grace period for HTML requests has passed
const hasTimeoutElapsed = () => {
    if (lastHtmlContentRequestTime === null) return true;
    return (Date.now() - lastHtmlContentRequestTime) > htmlRequestGracePeriodMs;
};

// Determines if a given request is eligible for HTML processing (shim injection)
const canProcessHtmlRequest = (requestDetails, requestIdentifier) => {
    // A simple map to keep track of paths we've already deemed shimmable
    if (validatedShimmablePaths.has(requestIdentifier)) {
        console.info(`!! Recognized shimmable path: ${requestIdentifier}`);
        return true;
    }
    if (lastHtmlContentRequestTime === null) return true; // First request
    return hasTimeoutElapsed();
};

// Checks if a request URL should be excluded from processing
const isExcludedResource = (requestUri) => {
    if (!requestUri || typeof requestUri !== 'string') return true; // Invalid URI
    const lowerUri = requestUri.toLowerCase();
    // More comprehensive exclusion list
    return lowerUri.includes('.ico') || lowerUri.includes('favicon.ico') ||
           lowerUri.includes('.css') || lowerUri.includes('.js') ||
           lowerUri.includes('.png') || lowerUri.includes('.jpg') ||
           lowerUri.includes('.gif') || lowerUri.includes('.svg') ||
           lowerUri.includes('.woff') || lowerUri.includes('.ttf') ||
           lowerUri.includes('.json') || lowerUri.includes('.xml');
};

// Counts occurrences of a character in a string
const countCharOccurrences = (inputString, charToCount) => {
    if (!inputString || !charToCount) return 0;
    let count = 0;
    for (let i = 0; i < inputString.length; ++i) {
        if (inputString[i] === charToCount) {
            count++;
        }
    }
    return count;
};

// Unique client tracking for the shim injection logic
const uniqueClientTracking = {}; // Renamed from unique_browsers
const validatedShimmablePaths = new Set(); // Renamed from valid_paths, changed type

// Generates a unique signature for a client based on IP and User-Agent
const deriveClientSignature = (clientRequest) => {
    const clientIp = clientRequest.socket.remoteAddress || clientRequest.connection.remoteAddress;
    const userAgent = clientRequest.headers['user-agent'] || 'unknown-ua';
    const acceptLanguage = clientRequest.headers['accept-language'] || 'unknown-lang'; // Added more detail
    return `${clientIp}::${userAgent}::${acceptLanguage}`;
};

// Determines if a client's request is eligible for initial shim 'setting' based on time/signature
const isFirstTimeOrExpiredClient = (clientRequest) => {
    const clientSig = deriveClientSignature(clientRequest);
    const lastRequestTime = uniqueClientTracking[clientSig];
    uniqueClientTracking[clientSig] = Date.now(); // Update last request time

    const oneHourMs = 60 * 60 * 1000;
    if (!lastRequestTime || (Date.now() - lastRequestTime) > oneHourMs) {
        console.info(`[SHIM] Client eligible for setting: ${clientSig}`);
        return true;
    } else {
        // console.debug(`[SHIM] Client not eligible (recent request): ${clientSig}`);
        return isShimApplicableForUrl(clientRequest); // Fallback to URL-based check
    }
};

// Complex logic to determine if a URL should trigger shim injection
const isShimApplicableForUrl = (requestDetails) => {
    const requestUrl = requestDetails.url;
    if (!requestUrl || typeof requestUrl !== 'string') return false;

    // Exclude JSON or other data types explicitly
    if (requestUrl.includes('.json') || requestUrl.includes('.xml') || requestUrl.includes('.txt')) {
        return false;
    }

    // Must contain the shim parameter
    if (!requestUrl.match(shimParamPattern)) {
        return false;
    }

    // Prevent redirection loops or unintended behavior with 'http' in query
    if (requestUrl.includes('=http')) {
        console.warn(`[SHIM] URL contains '=http', potentially problematic: ${requestUrl}`);
        return false;
    }

    // Limit query parameters to avoid malformed URLs
    if (countCharOccurrences(requestUrl, '?') > 1 && !requestUrl.includes('&')) { // Added condition to allow multiple params with &
        console.warn(`[SHIM] Too many '?' characters in URL: ${requestUrl}`);
        return false;
    }
    return true;
};

// Detects the 'attach device' command in the URL
const detectAttachCommand = (uri) => {
    return uri.match(attachCmdPattern);
};

// Detects the 'reset state' command in the URL
const detectResetCommand = (uri) => {
    return uri.match(resetCmdPattern);
};

// Handles requests to reset the shim state
function processResetRequest(incomingRequest, serverResponse) {
    console.info('Reset command received. Redirecting to home.');
    serverResponse.writeHead(302, { 'Location': 'http://localhost:' + defaultListenPort + '/shim' }); // Explicit host/port
    serverResponse.end();
}

// Generates the base shim script/meta tag to be injected
const generateShimPayload = (clientRequest) => {
    // This could be a complex EJS template or a simple string.
    // For Type III, let's make it a slightly more feature-rich string.
    const shimTemplate = fileSystem.readFileSync('views/shim.ejs', 'utf8'); // Ensure this file exists
    const shimContent = templateRenderer.render(shimTemplate, {
        // Example dynamic data for template
        currentTimestamp: new Date().toISOString(),
        clientUserAgent: clientRequest.headers['user-agent'] || 'N/A'
    });
    return `<!-- Shim Injected by Proxy v2.0 -->\n<meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>\n<script type="text/javascript">
        // Basic shim client-side logic
        if (typeof window.shimInitialized === 'undefined') {
            window.shimInitialized = true;
            console.log('Shim client-side logic loaded.');
            // Add any essential client-side JS here
            function send_url(url_val, force_shim) {
                let final_url = url_val;
                if (force_shim && !url_val.includes('${shimInjectionParam}')) {
                    final_url += (url_val.includes('?') ? '&' : '?') + '${shimInjectionParam}';
                }
                top.location.href = final_url;
            }
            // Example: listen for messages from the server via WebSocket
            // const socket = io(); // Assuming socket.io-client is loaded
            // socket.on('pathUpdate', (newPath) => {
            //     console.log('Server broadcasted new path:', newPath);
            //     // You might redirect or update content here
            // });
        }
    </script>\n${shimContent}`;
};

// Renders the main landing page for the shim proxy
function renderLandingPage(incomingRequest, serverResponse) {
    currentShimmablePath = 'http://localhost:' + defaultListenPort + '/shim'; // Set home URL as current path
    let htmlOutput = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <title>Shim Proxy Control Panel</title>
        <meta name='viewport' content='user-scalable=no, width=device-width,initial-scale=1, minimum-scale=1, maximum-scale=1'/>
        <style>
            body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; margin: 20px; background-color: #f4f4f4; }
            h1 { border-bottom: 2px solid #007bff; padding-bottom: 10px; color: #007bff; }
            .container { max-width: 800px; margin: 0 auto; background-color: #fff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); }
            form { margin-top: 20px; display: flex; gap: 10px; }
            input[type="text"] { flex-grow: 1; padding: 10px; border: 1px solid #ccc; border-radius: 4px; }
            input[type="submit"] { padding: 10px 15px; background-color: #28a745; color: white; border: none; border-radius: 4px; cursor: pointer; }
            input[type="submit"]:hover { background-color: #218838; }
            .bookmarklet-link { display: block; margin-top: 20px; padding: 10px; background-color: #ffc107; border-radius: 4px; text-decoration: none; color: #333; font-weight: bold; }
            .bookmarklet-link:hover { background-color: #e0a800; }
            .navigation-links { margin-top: 20px; }
            .navigation-links p { margin: 5px 0; }
            .navigation-links a { color: #007bff; text-decoration: none; }
            .navigation-links a:hover { text-decoration: underline; }
            .status-message { margin-top: 20px; padding: 10px; border-left: 5px solid #007bff; background-color: #e7f3ff; color: #004085; }
        </style>
        <script src="/socket.io/socket.io.js"></script>
        <script>
            function send_url(url_val, force_shim) {
                let final_url = url_val;
                if (force_shim && !url_val.includes('${shimInjectionParam}')) {
                    final_url += (url_val.includes('?') ? '&' : '?') + '${shimInjectionParam}';
                }
                top.location.href = final_url;
            }

            // Client-side socket.io for real-time updates (optional, for future features)
            document.addEventListener('DOMContentLoaded', () => {
                const socket = io();
                socket.on('pathUpdate', (newPath) => {
                    console.log('Received path update from server:', newPath);
                    // Update UI or trigger redirection if needed
                });
            });
        </script>
    </head>
    <body>
        <div class="container">
            <h1>Shim Proxy Interface</h1>
            <p class="status-message">Current shim target: <strong>${currentShimmablePath || 'None set'}</strong></p>
            <form onsubmit="send_url(document.getElementById('targetUrlInput').value, true); return false;">
                <label for="targetUrlInput" style="display:none;">Enter Target URL:</label>
                <input id="targetUrlInput" type="text" value="http://" placeholder="Enter URL to shim..." />
                <input type="submit" value="Apply Shim" />
            </form>
            <a class="bookmarklet-link" href="javascript:(() => { let url = document.location.href; url += (url.includes('?') ? '&' : '?') + '${shimInjectionParam}'; document.location.href = url; })();">
                Shim Bookmarklet (Drag to Toolbar)
            </a>
            <div class="navigation-links">
                <h2>Quick Links:</h2>
    `;

    if (homepageNavigationLinks.length > 0) {
        console.debug(`Displaying ${homepageNavigationLinks.length} configured navigation links.`);
        for (const item of homepageNavigationLinks) {
            // Basic validation for URL and label
            if (item.url && item.label) {
                htmlOutput += `<p><a href="${item.url}?${shimInjectionParam}">${item.label}</a></p>\n`;
            } else {
                console.warn('Skipping malformed homepage link:', item);
            }
        }
    } else {
        htmlOutput += `<p>No pre-configured links available.</p>`;
    }
    htmlOutput += `
            </div>
        </div>
    </body>
    </html>`;

    serverResponse.setHeader('Content-Type', 'text/html');
    serverResponse.setHeader('Content-Length', Buffer.byteLength(htmlOutput, 'utf8')); // Use Buffer.byteLength for accuracy
    serverResponse.end(htmlOutput);
}

// Handles requests to attach a client to the current shimmable path
function processAttachRequest(incomingRequest, serverResponse) {
    if (!currentShimmablePath) {
        console.warn('Attach command received but no path is currently set. Redirecting to reset handler.');
        processResetRequest(incomingRequest, serverResponse);
        return;
    }
    console.info(`Device attaching to: ${currentShimmablePath}`);
    serverResponse.writeHead(302, { 'Location': currentShimmablePath }); // Redirect to the current shimmable path
    serverResponse.end();
}

// Loads configuration data from config.json
const loadConfigurationData = () => {
    try {
        const configText = fileSystem.readFileSync('config.json', 'utf8');
        if (!configText || configText.length === 0) {
            console.warn('CONFIG: config.json is empty or not found. Using default settings.');
            applicationConfig = {}; // Default empty config
            return;
        }
        applicationConfig = JSON.parse(configText);
        console.info('Application configuration loaded successfully.');
        // Debugging output for config sections
        if (applicationConfig.slideshow) {
            console.debug('Slideshow settings:');
            inspectObjectLite(applicationConfig.slideshow);
        }
        if (applicationConfig.excluded_cookies) {
            console.debug('Excluded cookies:');
            inspectObjectLite(applicationConfig.excluded_cookies);
        }
    } catch (error) {
        console.error('CONFIG: Error loading or parsing config.json:', error.message);
        applicationConfig = {}; // Ensure CONFIG is initialized even on error
    }
};

let currentSlideIndex = 0; // Renamed from slideshow_index
let slideshowTimer = null; // To hold the setInterval ID

// Sets up a periodic slideshow rotation based on configuration
const setupSlideshowRotation = () => {
    if (!applicationConfig || !applicationConfig.slideshow || !Array.isArray(applicationConfig.slideshow.paths) || applicationConfig.slideshow.paths.length === 0) {
        console.info('Slideshow configuration not found or invalid. Skipping slideshow setup.');
        return;
    }

    if (slideshowTimer) clearInterval(slideshowTimer); // Clear any existing timer

    const slideshowInterval = applicationConfig.slideshow.interval || 10000; // Default to 10 seconds
    const basePath = applicationConfig.slideshow.path_base || '';

    console.info(`Setting up slideshow rotation with interval: ${slideshowInterval}ms`);

    slideshowTimer = setInterval(() => {
        const targetPathSegment = applicationConfig.slideshow.paths[currentSlideIndex];
        currentShimmablePath = `${basePath}/${targetPathSegment}?${shimInjectionParam}`;
        console.info(`[Slideshow] Updating shim target to: ${currentShimmablePath}`);
        broadcastPathUpdate(currentShimmablePath); // Broadcast the new path to connected clients
        currentSlideIndex = (currentSlideIndex + 1) % applicationConfig.slideshow.paths.length;
    }, slideshowInterval);
};

// Placeholder for broadcast and connection logging (originally undefined but called)
const connectedClientsMap = new Map(); // Renamed from sockets_hash

const broadcastPathUpdate = (pathValue) => {
    if (socketServer) {
        console.debug(`Broadcasting path update to ${connectedClientsMap.size} clients: ${pathValue}`);
        socketServer.emit('pathUpdate', pathValue); // Emit an event to all connected sockets
    }
};

const logActiveConnections = () => {
    console.info(`[Status] Active socket connections: ${connectedClientsMap.size}`);
    // You could iterate connectedClientsMap to log details about each client
};

// Initial load of config and setup
loadConfigurationData();
setupSlideshowRotation();

// Periodic tasks (e.g., broadcasting updates, logging connections)
setInterval(() => {
    broadcastPathUpdate(currentShimmablePath); // Always broadcast the current path
    logActiveConnections();
}, 5000); // Every 5 seconds

// Object to store domain-specific cookies
const domainSpecificCookies = {}; // Renamed from cookies

// Manages cookies for proxied requests
const manageProxyCookies = (hostDomain, clientRequest) => {
    const incomingCookieHeader = clientRequest.headers.cookie;
    if (!incomingCookieHeader) {
        return; // No incoming cookies
    }

    const newCookiePairs = incomingCookieHeader.split(';');
    const existingCookiesForDomain = domainSpecificCookies[hostDomain] || {};

    for (const pair of newCookiePairs) {
        const parts = pair.split('=');
        if (parts.length < 2) continue; // Skip malformed pairs

        const cookieName = parts[0].trim();
        const cookieValue = parts.slice(1).join('=').trim(); // Handle values with '='

        // Check against excluded cookies from config
        if (applicationConfig && applicationConfig.excluded_cookies && applicationConfig.excluded_cookies[cookieName] !== undefined) {
            // console.debug(`Excluding cookie: ${cookieName}`);
            continue;
        }

        if (cookieValue.length > 0) {
            existingCookiesForDomain[cookieName] = cookieValue;
        }
    }

    let combinedCookieString = '';
    for (const name in existingCookiesForDomain) {
        if (Object.prototype.hasOwnProperty.call(existingCookiesForDomain, name)) {
            combinedCookieString += `${name}=${existingCookiesForDomain[name]}; `;
        }
    }

    clientRequest.headers.cookie = combinedCookieString.trim(); // Update request header
    domainSpecificCookies[hostDomain] = existingCookiesForDomain; // Store updated cookies
    // console.debug(`[Cookies] Combined cookies for ${hostDomain}: ${clientRequest.headers.cookie}`);
};

// Core function to inject shim and proxy content
const injectAndProxyContent = (clientRequest, clientResponse) => {
    const shimMarkup = generateShimPayload(clientRequest);
    const targetHost = clientRequest.headers['host'];

    if (!targetHost) {
        console.error('Proxy target host is missing from request headers.');
        clientResponse.writeHead(500, { 'Content-Type': 'text/plain' });
        clientResponse.end('Proxy Error: Target host not specified.');
        return;
    }

    // Create a new proxy instance for this request
    const currentProxy = networkCore.request({
        host: targetHost,
        port: 80, // Assuming default HTTP port for target
        method: clientRequest.method,
        path: clientRequest.url,
        headers: { ...clientRequest.headers, 'Accept-Encoding': '' } // Clone headers and remove encoding
    });

    manageProxyCookies(targetHost, clientRequest);

    // Remove Accept-Encoding to prevent compressed responses, so we can inject text
    delete clientRequest.headers['accept-encoding'];
    delete clientRequest.headers['Accept-Encoding'];

    // Send the client's request body to the proxy target
    clientRequest.on('data', (chunk) => {
        currentProxy.write(chunk, 'binary');
    });

    clientRequest.on('end', () => {
        currentProxy.end();
    });

    // Handle response from the target server
    currentProxy.on('response', (proxyResponse) => {
        console.info(`[Proxy] Response from ${targetHost}${clientRequest.url} - Status: ${proxyResponse.statusCode}`);

        let responseBodyChunks = [];
        let totalContentLength = 0;
        const proxyResponseHeaders = { ...proxyResponse.headers }; // Clone headers for modification

        proxyResponse.on('data', (chunk) => {
            responseBodyChunks.push(chunk);
            totalContentLength += chunk.length;
        });

        proxyResponse.on('end', () => {
            const fullResponseBody = Buffer.concat(responseBodyChunks);
            let finalResponseBody = fullResponseBody;

            if (isRedirectionStatusCode(proxyResponse)) {
                if (proxyResponseHeaders['location']) {
                    proxyResponseHeaders['location'] = addShimParameterToUrl(proxyResponseHeaders['location']);
                    console.debug(`[Proxy] Redirect detected. Modified Location header: ${proxyResponseHeaders['location']}`);
                }
            }

            // Only inject shim if it's HTML content
            if (isHtmlContentType(proxyResponse)) {
                const shimBuffer = Buffer.from(shimMarkup, 'utf8');
                // Attempt to inject before </body> if present, otherwise append
                const bodyEndIndex = fullResponseBody.toString('utf8').lastIndexOf('</body>');
                if (bodyEndIndex !== -1) {
                    finalResponseBody = Buffer.concat([
                        fullResponseBody.subarray(0, bodyEndIndex),
                        shimBuffer,
                        fullResponseBody.subarray(bodyEndIndex)
                    ]);
                } else {
                    finalResponseBody = Buffer.concat([fullResponseBody, shimBuffer]);
                }
                proxyResponseHeaders['content-length'] = finalResponseBody.length; // Update content length
                console.info(`[Proxy] Injected shim into HTML response. New size: ${finalResponseBody.length}`);
            } else {
                proxyResponseHeaders['content-length'] = totalContentLength; // Original length for non-HTML
            }

            clientResponse.writeHead(proxyResponse.statusCode, proxyResponseHeaders);
            clientResponse.end(finalResponseBody, 'binary');
        });
    });

    currentProxy.on('error', (err) => {
        console.error(`[Proxy] Proxy request error for ${clientRequest.url}:`, err.message);
        clientResponse.writeHead(502, { 'Content-Type': 'text/plain' });
        clientResponse.end(`Bad Gateway: Could not connect to target server (${err.message})`);
    });
};

// ------------------------------------------------------------------------------
// MAIN HTTP SERVER LOGIC
// ------------------------------------------------------------------------------

const mainHttpRequestHandler = networkCore.createServer((request, response) => {
    const requestUrl = request.url;
    const fullRequestPath = `http://${request.headers.host}${requestUrl}`;
    console.info(`Incoming request: ${request.method} ${fullRequestPath}`);

    // Guard against requests without a host header
    if (!request.headers.host) {
        console.warn('Request received without Host header. Responding with 400.');
        response.writeHead(400, { 'Content-Type': 'text/plain' });
        response.end('Bad Request: Host header is required.');
        return;
    }

    // Handle specific shim control paths
    if (requestUrl === '/shim') {
        console.info('Serving shim control panel.');
        renderLandingPage(request, response);
        return;
    }

    if (detectResetCommand(requestUrl)) {
        console.info('Reset command detected in URL.');
        processResetRequest(request, response);
        return;
    }

    if (detectAttachCommand(requestUrl)) {
        console.info('Attach command detected in URL.');
        processAttachRequest(request, response);
        return;
    }

    // Determine if shim injection is needed for this request
    const shouldInjectShim = isShimApplicableForUrl(request) && canProcessHtmlRequest(request, fullRequestPath);

    if (shouldInjectShim) {
        console.log(`[SHIM] Applying shim for URL: ${fullRequestPath}`);
        currentShimmablePath = fullRequestPath; // Update the current path being shimmed
        validatedShimmablePaths.add(fullRequestPath); // Mark path as validated
        lastHtmlContentRequestTime = Date.now(); // Record time of HTML request
        injectAndProxyContent(request, response);
        broadcastPathUpdate(currentShimmablePath); // Inform connected clients
    } else {
        // For all other requests, just proxy them normally
        console.debug(`[PROXY] Standard proxying for: ${fullRequestPath}`);
        // Using http-proxy library for non-shimmed requests
        const proxy = new proxyEngine.HttpProxy();
        const targetHost = request.headers.host;
        const targetPort = 80; // Default to HTTP port 80

        // Optionally, check if target is a known HTTP or HTTPS port
        // const parsedHost = targetHost.split(':');
        // if (parsedHost.length > 1) targetPort = parseInt(parsedHost[1], 10);

        manageProxyCookies(targetHost, request); // Ensure cookies are managed for all proxied requests

        proxy.proxyRequest(request, response, {
            host: targetHost,
            port: targetPort,
            target: {
                // If using an older http-proxy, this might be `changeOrigin: true` directly
                // If the target is HTTPS, you'd need `ssl: { key: '...', cert: '...' }` options
            },
            // For older http-proxy, you might need to handle 'error' event here
            // proxy.on('proxyError', (err, req, res) => { ... });
        });
    }
});

mainHttpRequestHandler.listen(defaultListenPort, () => {
    console.log(`Shim Proxy Server running on http://localhost:${defaultListenPort}`);
    console.log('Access control panel at http://localhost:' + defaultListenPort + '/shim');
});

// ------------------------------------------------------------------------------
// SOCKET.IO SERVER SETUP
// ------------------------------------------------------------------------------

const socketServer = socketGateway(mainHttpRequestHandler);

console.log('Initializing Socket.IO listener...');

socketServer.on('connection', (clientSocket) => {
    const clientId = clientSocket.id;
    connectedClientsMap.set(clientId, clientSocket); // Store client socket
    console.info(`Socket.IO client connected: ${clientId}. Total clients: ${connectedClientsMap.size}`);

    // Send current path to newly connected client
    if (currentShimmablePath) {
        clientSocket.emit('pathUpdate', currentShimmablePath);
    }

    clientSocket.on('disconnect', () => {
        connectedClientsMap.delete(clientId);
        console.info(`Socket.IO client disconnected: ${clientId}. Remaining clients: ${connectedClientsMap.size}`);
    });

    // Example custom event listener
    clientSocket.on('clientMessage', (data) => {
        console.log(`Received message from client ${clientId}:`, data);
        // Process client messages here
    });
});