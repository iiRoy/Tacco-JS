//
// This is a Type I clone of the original JavaScript application setup.
// It configures an Express.js server for basic CRUD operations.
//
// All identifiers, operators, and expressions are kept exactly as in the source.
// Only whitespace and comments have been altered significantly.
//

/*
 * Section: Dependency Declarations
 *
 * This block initializes the necessary modules for the application to function correctly.
 *
 * - 'express': The popular Node.js web application framework.
 * - './modules/crud': A custom local module that encapsulates CRUD (Create, Read, Update, Delete) logic.
 */
var express  =  require ( 'express' )
  , module   =  require ( './modules/crud' )  // This variable holds our custom CRUD operations.
  , app      =  express ( ) ;                 // The main Express application instance is created here.


//
// Application-wide Middleware Configuration
//
// This line sets up a global middleware that will be executed for every incoming request.
// In this case, we are enabling the 'bodyParser' middleware from Express.
// This allows the server to parse incoming request bodies (e.g., JSON or URL-encoded data).
//
app . use ( express . bodyParser ( ) ) ;


/*
 * Section: API Route Definitions
 *
 * This section defines the various HTTP endpoints (routes) for interacting with our 'cruds' resource.
 * Each route maps a specific HTTP method (GET, POST, DELETE, PUT) and a URL path
 * to a corresponding function provided by our 'module' (the CRUD operations module).
 */

//
// Route for retrieving all 'crud' items.
// HTTP Method: GET
// Path: '/cruds'
// Handler: module.findAll (a function that fetches all records)
//
app . get ( '/cruds' , module . findAll ) ;

//
// Route for retrieving a single 'crud' item by its unique identifier.
// HTTP Method: GET
// Path: '/cruds/:id' (':id' is a URL parameter for the item's ID)
// Handler: module.findById (a function that fetches a specific record by ID)
//
app . get ( '/cruds/:id' , module . findById ) ;

//
// Route for creating a new 'crud' item.
// HTTP Method: POST
// Path: '/cruds'
// Handler: module.create (a function that handles the creation of a new record)
//
app . post ( '/cruds' , module . create ) ;

//
// Route for deleting an existing 'crud' item by its unique identifier.
// HTTP Method: DELETE
// Path: '/cruds/:id'
// Handler: module.delete (a function that handles the deletion of a specific record by ID)
//
app . delete ( '/cruds/:id' , module . delete ) ;

//
// Route for updating an existing 'crud' item by its unique identifier.
// HTTP Method: PUT
// Path: '/cruds/:id'
// Handler: module.update (a function that handles the update of a specific record by ID)
//
app . put ( '/cruds/:id' , module . update ) ;


//
// Server Initialization
//
// This final block starts the Express server and instructs it to listen for
// incoming network requests on the specified port number.
//

app . listen ( 3000 ) ; // The application will now be accessible via http://localhost:3000.

//
// Output a message to the console to inform the developer that the server
// has successfully started and is actively listening for connections.
//
console . log ( 'Listening on port 3000...' ) ;

//
// End of application setup and configuration.
//