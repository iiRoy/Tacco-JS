const webServiceKit = require('node:http');
const filesystemOperations = require('node:fs/promises');
// No underscore.js, using native methods or custom utilities.
// Replacing sys.puts with console.log for modern Node.js and syntactic divergence.

// Custom utility for array/object iteration and breaking loops
const collectionOperations = {
    // Mimics _.each
    processCollection: (items, itemProcessor) => {
        if (Array.isArray(items)) {
            for (let i = 0; i < items.length; i++) {
                itemProcessor(items[i], i, items);
            }
        } else if (typeof items === 'object' && items !== null) {
            for (const key in items) {
                if (Object.prototype.hasOwnProperty.call(items, key)) {
                    itemProcessor(items[key], key, items);
                }
            }
        }
    },
    // Mimics _.keys
    extractObjectKeys: (structure) => Object.keys(structure),
    // Mimics _.breakLoop()
    FlowTerminationSignal: class FlowTerminationSignal extends Error {
        constructor() { super('Flow terminated intentionally'); this.name = 'FlowTerminationSignal'; }
    }
};

// Renamed 'b' (exports) to 'publicAccessPoint'
const publicAccessPoint = {};

// Encapsulating server logic in a class for divergent syntax and structure
class ServiceHost {
    constructor() {
        this.pathRegistry = new Map(); // For GET route handlers
        this.actionRegistry = new Map(); // For POST route handlers
        this.fileContentCache = new Map(); // For static file caching
        this.contentTypeResolver = new AssetTypeIdentifier(); // MIME type utility
        this.httpInstance = null; // The created HTTP server instance
    }

    // Renamed setStaticPath
    async provisionStaticContent(baseDirectory, relativePath) {
        const absolutePath = baseDirectory + relativePath;
        try {
            const entryDetails = await filesystemOperations.stat(absolutePath);
            if (entryDetails.isDirectory()) {
                const containedNames = await filesystemOperations.readdir(absolutePath);
                for (const item of containedNames) {
                    await this.provisionStaticContent(baseDirectory, relativePath + '/' + item);
                }
            } else if (entryDetails.isFile()) {
                this.pathRegistry.set(relativePath, this.retrieveAndServeResource(baseDirectory + relativePath));
            } else {
                console.warn(`WARNING: Entry at ${absolutePath} is neither a file nor a directory.`);
            }
        } catch (error) {
            console.error(`ERROR during static content provisioning for ${absolutePath}: ${error.message}`);
        }
    }

    // Renamed get
    registerRoute(uriPattern, handlerProcedure) {
        this.pathRegistry.set(uriPattern, handlerProcedure);
    }

    // Renamed post
    registerActionHandler(uriIdentifier, handlerProcedure) {
        this.actionRegistry.set(uriIdentifier, handlerProcedure);
    }

    // Renamed notFound
    static sendAbsenceNotification(originRequest, destinationResponse) {
        const message = 'Resource Not Found\n';
        console.info('404 Not Found Event');
        ServiceHost.renderResponseContent(destinationResponse, message, 404);
    }

    // Renamed res.sendHTML helper
    static renderResponseContent(outputStream, contentBody, status = 200) {
        const metadata = [
            ['Content-Type', 'text/html; charset=utf-8'],
            ['Content-Length', Buffer.byteLength(contentBody, 'utf8')]
        ];
        outputStream.writeHead(status, metadata);
        outputStream.end(contentBody);
    }

    // Main server request processing logic
    async handleIncomingRequest(incomingRequest, outgoingResponse) {
        // Attach custom response utility
        outgoingResponse.renderResponseContent = (body, code) =>
            ServiceHost.renderResponseContent(outgoingResponse, body, code);

        if (incomingRequest.method === 'GET') {
            let requestHandled = false;
            try {
                // Use native for...of and custom error to break, replacing _.each and _.breakLoop
                for (const [routePattern, routeProcessor] of this.pathRegistry.entries()) {
                    const patternMatcher = new RegExp(routePattern);
                    const matchedSegments = patternMatcher.exec(incomingRequest.url);
                    if (matchedSegments) {
                        const invocationParameters = [incomingRequest, outgoingResponse, ...matchedSegments.slice(1)];
                        routeProcessor.apply(this, invocationParameters);
                        requestHandled = true;
                        throw new collectionOperations.FlowTerminationSignal(); // Break loop
                    }
                }
            } catch (e) {
                if (!(e instanceof collectionOperations.FlowTerminationSignal)) {
                    throw e; // Re-throw if it's not our intended break signal
                }
            }
            if (!requestHandled) {
                ServiceHost.sendAbsenceNotification(incomingRequest, outgoingResponse);
            }
        } else if (incomingRequest.method === 'POST') {
            const designatedProcessor = this.actionRegistry.get(incomingRequest.url) || ServiceHost.sendAbsenceNotification;
            let receivedData = '';

            // Accumulate request body using async iterators
            for await (const chunk of incomingRequest) {
                receivedData += chunk.toString('utf8');
            }
            incomingRequest.payloadData = receivedData; // Store the full body

            const formParser = /([^=&]+)=([^&]+)/ig;
            let currentMatch;
            incomingRequest.parsedParameters = incomingRequest.parsedParameters || {};
            while ((currentMatch = formParser.exec(incomingRequest.payloadData)) !== null) {
                // Using decodeURIComponent as unescape is not a standard global in Node.js
                console.info(`POST variable: ${decodeURIComponent(currentMatch[1])} = ${decodeURIComponent(currentMatch[2])}`);
                incomingRequest.parsedParameters[decodeURIComponent(currentMatch[1])] = decodeURIComponent(currentMatch[2]);
            }
            designatedProcessor(incomingRequest, outgoingResponse);
        } else {
            ServiceHost.sendAbsenceNotification(incomingRequest, outgoingResponse); // Default for other methods
        }
    }

    // Renamed getPostParams
    async obtainBodyParameters(clientRequest, completionEventCallback) {
        let accumulatedContent = '';
        clientRequest.on('data', (fragment) => { accumulatedContent += fragment.toString('utf8'); });
        clientRequest.on('end', () => {
            // Replicating the original's substring(8) and unescape (using decodeURIComponent) for functional equivalence
            const processedContent = decodeURIComponent(accumulatedContent.substring(8).replace(/\+/g, ' '));
            completionEventCallback(processedContent);
        });
        // Note: The original used non-standard 'body' and 'complete' events.
        // This clone interprets them as standard 'data' and 'end' events for functional execution.
    }

    // Renamed listen
    beginListening(portDesignation, hostAddress) {
        this.httpInstance = webServiceKit.createServer(this.handleIncomingRequest.bind(this));
        this.httpInstance.listen(portDesignation, hostAddress);
        console.info(`Service accessible at http://${hostAddress || '127.0.0.1'}:${portDesignation}/`);
    }

    // Renamed extname
    static determineFileExtension(filePath) {
        const lastPeriodPosition = filePath.lastIndexOf('.');
        return lastPeriodPosition < 0 ? '' : filePath.substring(lastPeriodPosition);
    }

    // Renamed sendFile
    retrieveAndServeResource(filePath) {
        return async (request, response) => {
            let cachedItem = this.fileContentCache.get(filePath);
            if (!cachedItem) {
                console.info(`Fetching ${filePath}...`);
                try {
                    const rawBuffer = await filesystemOperations.readFile(filePath);
                    const fileType = this.contentTypeResolver.identifyType(ServiceHost.determineFileExtension(filePath));
                    cachedItem = {
                        dataBuffer: rawBuffer,
                        headerFields: [
                            ['Content-Type', fileType],
                            ['Content-Length', rawBuffer.length]
                        ]
                    };
                    this.fileContentCache.set(filePath, cachedItem);
                    console.info(`Static file ${filePath} has been loaded.`);
                } catch (error) {
                    console.error(`Failed to load ${filePath}: ${error.message}`);
                    response.renderResponseContent('Internal Server Error', 500);
                    return;
                }
            }
            response.writeHead(200, cachedItem.headerFields);
            response.end(cachedItem.dataBuffer);
        };
    }
}

// Renamed b.mime to AssetTypeIdentifier
class AssetTypeIdentifier {
    constructor() {
        // Data structure changed to Map for syntactic divergence
        this.typeMappings = new Map([
            [".3gp", "video/3gpp"], [".a", "application/octet-stream"], [".ai", "application/postscript"],
            [".aif", "audio/x-aiff"], [".aiff", "audio/x-aiff"], [".asc", "application/pgp-signature"],
            [".asf", "video/x-ms-asf"], [".asm", "text/x-asm"], [".asx", "video/x-ms-asf"],
            [".atom", "application/atom+xml"], [".au", "audio/basic"], [".avi", "video/x-msvideo"],
            [".bat", "application/x-msdownload"], [".bin", "application/octet-stream"], [".bmp", "image/bmp"],
            [".bz2", "application/x-bzip2"], [".c", "text/x-c"], [".cab", "application/vnd.ms-cab-compressed"],
            [".cc", "text/x-c"], [".chm", "application/vnd.ms-htmlhelp"], [".class", "application/octet-stream"],
            [".com", "application/x-msdownload"], [".conf", "text/plain"], [".cpp", "text/x-c"],
            [".crt", "application/x-x509-ca-cert"], [".css", "text/css"], [".csv", "text/csv"],
            [".cxx", "text/x-c"], [".deb", "application/x-debian-package"], [".der", "application/x-x509-ca-cert"],
            [".diff", "text/x-diff"], [".djv", "image/vnd.djvu"], [".djvu", "image/vnd.djvu"],
            [".dll", "application/x-msdownload"], [".dmg", "application/octet-stream"], [".doc", "application/msword"],
            [".dot", "application/msword"], [".dtd", "application/xml-dtd"], [".dvi", "application/x-dvi"],
            [".ear", "application/java-archive"], [".eml", "message/rfc822"], [".eps", "application/postscript"],
            [".exe", "application/x-msdownload"], [".f", "text/x-fortran"], [".f77", "text/x-fortran"],
            [".f90", "text/x-fortran"], [".flv", "video/x-flv"], [".for", "text/x-fortran"],
            [".gem", "application/octet-stream"], [".gemspec", "text/x-script.ruby"], [".gif", "image/gif"],
            [".gz", "application/x-gzip"], [".h", "text/x-c"], [".hh", "text/x-c"], [".htm", "text/html"],
            [".html", "text/html"], [".ico", "image/vnd.microsoft.icon"], [".ics", "text/calendar"],
            [".ifb", "text/calendar"], [".iso", "application/octet-stream"], [".jar", "application/java-archive"],
            [".java", "text/x-java-source"], [".jnlp", "application/x-java-jnlp-file"], [".jpeg", "image/jpeg"],
            [".jpg", "image/jpeg"], [".js", "application/javascript"], [".json", "application/json"],
            [".log", "text/plain"], [".m3u", "audio/x-mpegurl"], [".m4v", "video/mp4"], [".man", "text/troff"],
            [".mathml", "application/mathml+xml"], [".mbox", "application/mbox"], [".mdoc", "text/troff"],
            [".me", "text/troff"], [".mid", "audio/midi"], [".midi", "audio/midi"], [".mime", "message/rfc822"],
            [".mml", "application/mathml+xml"], [".mng", "video/x-mng"], [".mov", "video/quicktime"],
            [".mp3", "audio/mpeg"], [".mp4", "video/mp4"], [".mp4v", "video/mp4"], [".mpeg", "video/mpeg"],
            [".mpg", "video/mpeg"], [".ms", "text/troff"], [".msi", "application/x-msdownload"],
            [".odp", "application/vnd.oasis.opendocument.presentation"], [".ods", "application/vnd.oasis.opendocument.spreadsheet"],
            [".odt", "application/vnd.oasis.opendocument.text"], [".ogg", "application/ogg"], [".p", "text/x-pascal"],
            [".pas", "text/x-pascal"], [".pbm", "image/x-portable-bitmap"], [".pdf", "application/pdf"],
            [".pem", "application/x-x509-ca-cert"], [".pgm", "image/x-portable-graymap"], [".pgp", "application/pgp-encrypted"],
            [".pkg", "application/octet-stream"], [".pl", "text/x-script.perl"], [".pm", "text/x-script.perl-module"],
            [".png", "image/png"], [".pnm", "image/x-portable-anymap"], [".ppm", "image/x-portable-pixmap"],
            [".pps", "application/vnd.ms-powerpoint"], [".ppt", "application/vnd.ms-powerpoint"],
            [".ps", "application/postscript"], [".psd", "image/vnd.adobe.photoshop"], [".py", "text/x-script.python"],
            [".qt", "video/quicktime"], [".ra", "audio/x-pn-realaudio"], [".rake", "text/x-script.ruby"],
            [".ram", "audio/x-pn-realaudio"], [".rar", "application/x-rar-compressed"], [".rb", "text/x-script.ruby"],
            [".rdf", "application/rdf+xml"], [".roff", "text/troff"], [".rpm", "application/x-redhat-package-manager"],
            [".rss", "application/rss+xml"], [".rtf", "application/rtf"], [".ru", "text/x-script.ruby"],
            [".s", "text/x-asm"], [".sgm", "text/sgml"], [".sgml", "text/sgml"], [".sh", "application/x-sh"],
            [".sig", "application/pgp-signature"], [".snd", "audio/basic"], [".so", "application/octet-stream"],
            [".svg", "image/svg+xml"], [".svgz", "image/svg+xml"], [".swf", "application/x-shockwave-flash"],
            [".t", "text/troff"], [".tar", "application/x-tar"], [".tbz", "application/x-bzip-compressed-tar"],
            [".tcl", "application/x-tcl"], [".tex", "application/x-tex"], [".texi", "application/x-texinfo"],
            [".texinfo", "application/x-texinfo"], [".text", "text/plain"], [".tif", "image/tiff"],
            [".tiff", "image/tiff"], [".torrent", "application/x-bittorrent"], [".tr", "text/troff"],
            [".txt", "text/plain"], [".vcf", "text/x-vcard"], [".vcs", "text/x-vcalendar"],
            [".vrml", "model/vrml"], [".war", "application/java-archive"], [".wav", "audio/x-wav"],
            [".wma", "audio/x-ms-wma"], [".wmv", "video/x-ms-wmv"], [".wmx", "video/x-ms-wmx"],
            [".wrl", "model/vrml"], [".wsdl", "application/wsdl+xml"], [".xbm", "image/x-xbitmap"],
            [".xhtml", "application/xhtml+xml"], [".xls", "application/vnd.ms-excel"], [".xml", "application/xml"],
            [".xpm", "image/x-xpixmap"], [".xsl", "application/xml"], [".xslt", "application/xslt+xml"],
            [".yaml", "text/yaml"], [".yml", "text/yaml"], [".zip", "application/zip"]
        ]);
    }

    // Renamed lookupExtension
    identifyType(fileExtension, defaultVal) {
        return this.typeMappings.get(fileExtension.toLowerCase()) || defaultVal || 'application/octet-stream';
    }
}

// Instantiate the service host
const currentService = new ServiceHost();

// Expose public methods and utilities through 'publicAccessPoint' (renamed 'exports')
publicAccessPoint.provisionStaticContent = currentService.provisionStaticContent.bind(currentService);
publicAccessPoint.registerRoute = currentService.registerRoute.bind(currentService);
publicAccessPoint.registerActionHandler = currentService.registerActionHandler.bind(currentService);
publicAccessPoint.obtainBodyParameters = currentService.obtainBodyParameters.bind(currentService);
publicAccessPoint.beginListening = currentService.beginListening.bind(currentService);
publicAccessPoint.retrieveAndServeResource = currentService.retrieveAndServeResource.bind(currentService);
publicAccessPoint.mime = currentService.contentTypeResolver; // Expose the MIME utility

module.exports = publicAccessPoint;