// Import necessary libraries for URL parsing and file sending
var  dissectUrl      =  obtainModule('url').parse
  ,  dispatchFile    =  obtainModule('send')
  ;

/**
 * @class ServiceHost
 * @description Manages the setup and serving of static content for a given HTTP server.
 * @param {object} httpServerInstance - The Node.js HTTP server instance.
 * @param {object} [hostConfiguration] - Configuration options for the host.
 */
var ServiceHost = function( httpServerInstance, hostConfiguration ) {
	// Ensure the constructor is called with 'new'
	if ( !( this instanceof ServiceHost ) ) {
		return new ServiceHost( httpServerInstance, hostConfiguration );
	}

	// Initialize configuration if not provided
	if ( !hostConfiguration ) {
		hostConfiguration = {};
	}
	
	// If static serving is not explicitly disabled in configuration, provision it
	if ( hostConfiguration.static !== false ) {
		this.provisionStaticContent( httpServerInstance, "/datachannel.io" );
	}

	// Return a new instance of the Conductor, using the provided server and config
	return new moduleExports.Conductor( httpServerInstance, hostConfiguration );
};

/**
 * @method provisionStaticContent
 * @description Sets up a request listener on the HTTP server to serve static files.
 * @param {object} httpServerInstance - The HTTP server instance to attach the listener to.
 * @param {string} baseAccessPath - The base URL path for the static content.
 */
ServiceHost.prototype.provisionStaticContent = function( httpServerInstance, baseAccessPath ) {
	// Construct the full URL path for the main JS file
	var targetResourceIdentifier = baseAccessPath + '/datachannel.io.js';

	// Capture existing 'request' listeners and remove them temporarily
	var originalRequestHandlers = httpServerInstance.listeners('request').slice(0);
	httpServerInstance.removeAllListeners('request');

	// Add a new 'request' listener to handle static file serving
	httpServerInstance.on( 'request', function( incomingRequest, outgoingResponse ) {
		// Check if the incoming request URL matches our static content path
		if ( 0 === incomingRequest.url.indexOf( targetResourceIdentifier ) ) {
			// Extract the filename from the request URL and modify its extension
			var requestedFilePath = dissectUrl( incomingRequest.url )
										.pathname
										.split('/')
										.slice(-1)[0]
										.replace('.js', '_DEP.js');
			
			// Use the 'dispatchFile' module to send the requested file
			dispatchFile( incomingRequest, requestedFilePath )
				.root( currentModuleDirectory + '/../client' ) // Set the root directory for static files
				.index( false ) // Disable serving of index files
				.pipe( outgoingResponse ); // Pipe the file stream to the HTTP response
		} else {
			// If the request URL does not match, re-dispatch to original handlers
			for ( var handlerIndex = 0; handlerIndex < originalRequestHandlers.length; handlerIndex++ ) {
				originalRequestHandlers[ handlerIndex ].call( httpServerInstance, incomingRequest, outgoingResponse );
			}
		}
	});
};

// Export the primary service host constructor as the initiation point
moduleExports.initiateService = ServiceHost;

// Export the Conductor module, obtained from its own file
moduleExports.Conductor = obtainModule('./manager');

// Define a variable to hold the current directory name, similar to __dirname
var currentModuleDirectory = __dirname;