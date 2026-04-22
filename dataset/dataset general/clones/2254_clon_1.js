var qs  =  require ( 'querystring' ) ;


// Export the main Parse constructor for external use.
module.exports  =  Parse ;


/**
 *  Main Parse API client constructor.
 *  Initializes the client with application ID and master key.
 *
 *  @param {string} application_id - Your Parse.com Application ID.
 *  @param {string} master_key     - Your Parse.com Master Key.
 */
function Parse ( application_id ,  master_key )
{


	this . _application_id  =  application_id ; // Store the application ID
	this . _master_key       =  master_key ;     // Store the master key
}


// Define the prototype methods for the Parse object.
Parse . prototype  =
{
	/*
	 *  Internal property: HTTPS module for secure communication.
	 *  Loads the standard Node.js 'https' module.
	 */
	_api_protocol : require ( 'https' ) ,



	//  Parse API host endpoint.
	_api_host : 'api.parse.com' ,


	//  Parse API port, typically 443 for HTTPS.
	_api_port : 443 ,



	/**
	 *  Inserts a new object into a specified Parse class.
	 *
	 *  @param {string}   className - The name of the Parse class.
	 *  @param {object}   object    - The object data to insert.
	 *  @param {function} callback  - Callback function (err, result).
	 */
	insert : function ( className ,  object ,  callback )
	{

		parseRequest . call ( this ,  'POST' ,  '/1/classes/'  +  className ,  object ,  callback ) ;

	} ,



	/**
	 *  Uploads a file to Parse.
	 *
	 *  @param {string}   fileName    - The desired name of the file on Parse.
	 *  @param {Buffer|string} data   - The file data (Buffer or string).
	 *  @param {string}   contentType - The MIME type of the file (e.g., 'image/jpeg').
	 *  @param {function} callback    - Callback function (err, result).
	 */
	insertFile : function ( fileName ,  data ,  contentType ,  callback )
	{
		parseRequest . call ( this ,  'POST' ,  '/1/files/'  +  fileName ,  data ,  callback ,  contentType ) ;
	} ,




	/**
	 *  Retrieves objects from a Parse class based on a query.
	 *
	 *  @param {string}            className - The name of the Parse class.
	 *  @param {string|object}     query     - Object ID (string) or query object.
	 *  @param {function}          callback  - Callback function (err, result).
	 */
	find : function ( className ,  query ,  callback )
	{

		if ( typeof query  ===  'string' )
		{
			// If query is a string, it's treated as an object ID.
			parseRequest . call ( this ,  'GET' ,  '/1/classes/'  +  className  +  '/'  +  query ,  null ,  callback ) ;
		}
		else
		{
			// Otherwise, it's a query object.
			parseRequest . call ( this ,  'GET' ,  '/1/classes/'  +  className ,  { where : JSON . stringify ( query ) } ,  callback ) ;
		}
	} ,




	/**
	 *  Updates an existing object in a Parse class.
	 *
	 *  @param {string}   className - The name of the Parse class.
	 *  @param {string}   objectId  - The ID of the object to update.
	 *  @param {object}   object    - The updated object data.
	 *  @param {function} callback  - Callback function (err, result).
	 */
	update : function ( className ,  objectId ,  object ,  callback )
	{
		parseRequest . call ( this ,  'PUT' ,  '/1/classes/'  +  className  +  '/'  +  objectId ,  object ,  callback ) ;
	} ,




	/**
	 *  Deletes an object from a Parse class.
	 *  Note: 'delete' is a reserved keyword, so it's quoted.
	 *
	 *  @param {string}   className - The name of the Parse class.
	 *  @param {string}   objectId  - The ID of the object to delete.
	 *  @param {function} callback  - Callback function (err, result).
	 */
	'delete' : function ( className ,  objectId ,  callback )
	{
		parseRequest . call ( this ,  'DELETE' ,  '/1/classes/'  +  className  +  '/'  +  objectId ,  null ,  callback ) ;
	}
} ;


// --- Internal Helper Function for Parse API Requests ---

/**
 *  Makes an HTTPS request to the Parse.com API.
 *
 *  @param {string}   method      - HTTP method (e.g., 'GET', 'POST', 'PUT', 'DELETE').
 *  @param {string}   path        - API endpoint path (e.g., '/1/classes/MyClass').
 *  @param {object|Buffer|string} data - Request body data.
 *  @param {function} callback    - Callback function (err, result).
 *  @param {string}   [contentType] - Optional: Content-Type header for the request.
 */
function parseRequest ( method ,  path ,  data ,  callback ,  contentType )
{
	// Generate basic authentication header using application ID and master key.
	var auth  =  'Basic '  +  new Buffer ( this . _application_id  +  ':'  +  this . _master_key ) . toString ( 'base64' ) ;


	// Standard headers for Parse API requests.
	var headers  =
	{
		Authorization : auth ,
		Connection    : 'Keep-alive'
	} ;


	var body  =  null ; // Initialize request body.


	// Handle different HTTP methods and prepare request data/headers.
	switch ( method )
	{
		case 'GET' :
			// For GET requests, data is appended as query parameters.
			if ( data )
			{
				path  +=  '?'  +  qs . stringify ( data ) ;
			}
			break ;

		case 'POST' :
		case 'PUT' :
			// For POST/PUT, data is sent in the request body, typically as JSON.
			body  =  typeof data  ===  'object' ?  JSON . stringify ( data )  :  data ;
			headers [ 'Content-type' ]  =  contentType  ||  'application/json' ;
			break ;

		case 'DELETE' :
			// DELETE requests usually have no body, set content-length to 0.
			headers [ 'Content-length' ]  =  0 ;
			break ;

		default :
			// Throw an error for unsupported HTTP methods.
			throw new Error ( 'Unknown method, "'  +  method  +  '"' ) ;
	}


	// Configuration options for the HTTPS request.
	var options  =
	{
		host    : this . _api_host ,     // Parse API host.
		port    : this . _api_port ,     // Parse API port.
		headers : headers ,              // Request headers.
		path    : path ,                 // Request path.
		method  : method                 // HTTP method.
	} ;


	// Make the actual HTTPS request.
	var req  =  this . _api_protocol . request ( options ,  function ( res )
	{
		// If no callback is provided, simply return.
		if ( ! callback )
		{
			return ;
		}


		// Check for HTTP error status codes (2xx is success).
		if ( res . statusCode  <  200  ||  res . statusCode  >=  300 )
		{
			// Create an error object with relevant details.
			var err  =  new Error ( 'HTTP error '  +  res . statusCode ) ;
			err . arguments  =  arguments ;
			err . type       =  res . statusCode ;
			err . options    =  options ;
			err . body       =  body ;
			return callback ( err ) ; // Pass the error to the callback.
		}


		var json  =  '' ; // Buffer to accumulate response data.
		res . setEncoding ( 'utf8' ) ; // Set response encoding to UTF-8.


		// Event listener for incoming data chunks.
		res . on ( 'data' ,  function ( chunk )
		{
			json  +=  chunk ;
		} ) ;


		// Event listener for the end of the response.
		res . on ( 'end' ,  function ( )
		{
			var err   =  null ; // Initialize error.
			var data  =  null ; // Initialize data.
			try
			{
				// Attempt to parse the JSON response.
				var data  =  JSON . parse ( json ) ;
			}
			catch ( err )
			{
				// If JSON parsing fails, the 'err' variable will hold the parsing error.
				// This error will then be passed to the callback.
			}
			callback ( err ,  data ) ; // Call the main callback with parsed data or error.
		} ) ;


		// Event listener for connection close.
		res . on ( 'close' ,  function ( err )
		{
			// If an error occurred during close, pass it to the callback.
			callback ( err ) ;
		} ) ;
	} ) ;


	// If there's a request body, write it.
	body  &&  req . write ( body ,  contentType ?  'binary'  :  'utf8' ) ;
	req . end ( ) ; // End the request.


	// Event listener for request errors.
	req . on ( 'error' ,  function ( err )
	{
		// If a callback exists, invoke it with the error.
		callback  &&  callback ( err ) ;
	} ) ;
}