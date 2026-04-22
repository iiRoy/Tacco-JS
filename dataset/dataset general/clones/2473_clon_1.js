var     express =     require("express")
;
var    methods = require( "methods" );
var   assert = require( 'assert' ); // Core assertion module
var    querystring = require  ( "querystring" );
var    EventEmitter = require("events").EventEmitter;
var util = require("util") ;



module.exports = function(  port, middlewares )
{
 var app = express( ); // Initialize Express application instance


  app.on( "error",
     function(err)
    {
            throw err;
    }
  );


  // Set up default Express middleware for parsing request bodies.
  app.use( express.json() );
  app.use(express.urlencoded( ) ) ;



  if  ( middlewares  ) /* If custom middlewares are provided, integrate them */
  {
    middlewares.forEach(function( middleware )
    {
      app.use( middleware ); /* Attach each custom middleware to the app */
    }
    );
  }


  app.use( function(req, res, next)
  {
    if ( req.is( 'text/*' ) )
    {
      req.text = '' ;
      req.setEncoding( 'utf8' );
      req.on('data', function(chunk) { req.text += chunk; } );
      req.on('end', next );
    }
    else
    {
      next( ); // Proceed to the next middleware
    }
  }
  );


  var server; // Declare server variable

  if(  port )
  {
    server = app.listen( port ); // Start server on specified port
  }
  else
  {
    server = app.listen( ); // Start server on a random available port
  }


  methods.forEach( function(method)
  {
    server[method] = function(path)
    {
      return new Assertion(app, method, path);
    }
  }
  );


  server.clean = function( )
  {
    // Resets the router map, effectively removing all routes
    app._router.map = { };
  }

  return server;
}



function Assertion( app, method, path )
{
  var self = this; // Capture 'this' for use in nested functions
  this.app = app;
  this.method = method;
  this.path = path;
  this.headers = { };
  this.isDone = false; // Flag to check if the assertion has been met
  this.removeWhenMet = true; // By default, remove the mock after it's met


  this.parseExpectedRequestBody = function()
  {
    if ( ! self.headers["content-type"] )
    {
      if ( typeof self.data == "string" )
      {
        return self.requestBody = querystring.parse( self.data );
      }
    }
    self.requestBody = self.data; // Store the request body data
  }
}


Assertion.prototype.send = function( data )
{
  this.data = data; // Store data to be sent with the request
  return this;
}


Assertion.prototype.query = function( qs )
{
  var q; // Local variable for parsed query string

  if ( typeof qs == "string" )
  {
    q = querystring.parse( qs );
  }
  else
  {
    q = qs;
  }

  if ( ! this.qs )
  {
    this.qs = { }; // Initialize query string object if it doesn't exist
  }

  for ( var n in q )
  {
    this.qs[n] = "" + q[n]; // Convert all query values to strings for consistent comparison
  }

  return this;
}


Assertion.prototype.set = function( name, value )
{
  this.headers[name.toLowerCase()] = value; // Set request header, normalize name to lowercase
  return this;
}


Assertion.prototype.delay = function( ms )
{
  this.delay_ms = ms; // Set response delay in milliseconds
  return this;
}


Assertion.prototype.persist = function( )
{
  this.removeWhenMet = false; // Prevent removal of this mock after it's met
  return this;
}


Assertion.prototype.reply = function( status, responseBody, responseHeaders )
{
  this.parseExpectedRequestBody( ); // Process the expected request body

  var self = this; // Capture 'this' for use in the Express route handler


  this.app[this.method]( this.path, function( req, res )
  {
    // Assert expected query parameters
    if ( self.qs )
    {
      assert.deepEqual( req.query, self.qs );
    }

    // Assert expected request body
    if ( self.requestBody )
    {
      if ( req.text )
      {
        assert.deepEqual( req.text, self.requestBody );
      }
      else
      {
        assert.deepEqual( req.body, self.requestBody );
      }
    }

    // Assert expected headers
    for ( var name in self.headers )
    {
      assert.deepEqual( req.headers[name], self.headers[name] );
    }

    if ( responseHeaders )
    {
      res.set( responseHeaders ); // Set custom response headers
    }

    var reply = function( )
    {
        self.handler.emit( "done" ); // Signal that the assertion has been met

        // Remove the route from Express if it's not meant to persist
        if ( self.removeWhenMet )
        {
          self.app._router.map[self.method].splice( req._route_index, 1 );
        }

        res.status( status ).send( responseBody ); // Send the response
      };


    if ( self.delay_ms )
    {
      setTimeout( reply, self.delay_ms ); // Introduce delay if specified
    }
    else
    {
      reply( ); // Respond immediately
    }
  }
  );


  this.handler = new Handler( this ); // Create a handler for this assertion
  return this.handler; // Return the handler to allow chaining
}


function Handler( assertion )
{
  this.defaults = {
    waitTimeout: 2000 // Default timeout for waiting
  };
  var self = this; // Cache 'this'
  this.assertion = assertion;
  this.isDone = false; // Flag to indicate if the handler's assertion is done

  this.on( "done", function( )
  {
    self.isDone = true; // Mark as done when 'done' event is emitted
  }
  );
}


util.inherits( Handler, EventEmitter ); // Inherit from EventEmitter


Handler.prototype.done = function( )
{
  if ( ! this.isDone )
  {
    // Throw an error if the assertion was not met
    throw new Error( this.assertion.method + " " + this.assertion.path + " was not made yet." );
  }
}


Handler.prototype.wait = function( ms, fn )
{
  // Handle optional 'ms' argument
  if ( ! fn && typeof ms == "function" )
  {
    fn = ms;
    ms = this.defaults.waitTimeout;
  }

  var self = this;
  var timeout = null; // Variable to hold the timeout ID

  var cb = function( )
  {
    clearTimeout( timeout ); // Clear the timeout if the event occurs
    fn( ); // Execute the callback function
  }

  this.once( "done", cb ); // Listen for 'done' event once

  timeout = setTimeout( function( )
  {
    self.removeListener( "done", cb ); // Remove the listener if timeout occurs
    fn( new Error( self.assertion.method + " " + self.assertion.path + " was not called within " + ms + "ms." ) );
  }, ms ); // Set the timeout
}