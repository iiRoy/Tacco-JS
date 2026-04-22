/*
 * CouchPress Installer Script - Type I Clone
 *
 * This file is a Type I clone of the original CouchPress installer.
 * All functional code, identifiers, and expressions are identical.
 * Only whitespace (indentation, spacing, newlines) and comments have been altered.
 * This is intended to be visually distinct but logically equivalent.
 *
 */

// Core Node.js modules and external libraries are loaded here.
var read   =   require ( 'read' )
  , fs     =   require ( 'fs' )
  , cradle =   require ( 'cradle' )
  , path   =   require ( 'path' )
  , crypto =   require ( 'crypto' )
  , packageJSON = require ( '../package.json' ) // Package metadata
  , data   =   { }  // Configuration data store
  , admin  =   { }  // Admin credentials store
  ; // End of initial variable declarations

// Attempt to load existing configuration, or initialize defaults.
try
{
  var old = require('../config.js')
  data = old.config;
  admin = old.admin;
}
catch ( excp )
{
  // Default configuration if no existing config is found
  data =
  {
    site :
    {
      title       :   "CouchPress Site",
      description :   "Just another CouchPress Site",
      copyright   :   "Joe Bloggs",
      twitter     :   "joebloggs",
      port        :   "3000",
      secret      :   "somethingsecret",
      version     :   packageJSON.version
    },
    theme:
    {
      admin: "admin",
      front:"soothe"
    },
    db:
    {
      host:"http://localhost",
      port:"5984"
    }
  }
  admin =
  {
    user :"admin",
    pass :"admin"
  }
}

// Extract specific configuration sections for easier access.
var site  = data.site
  , theme = data.theme
  , db    = data.db
  ; // End of configuration extraction

/**
 * Main initialization function for the CouchPress installer.
 * Guides the user through various setup steps.
 * @param {Function} cb Callback function to be executed upon completion or error.
 */
function init ( cb )
{
  console.log('\n\t Welcome to the CouchPress installation process ');
  console.log('I\'m going to ask you some question, respond only the true ;)\n');

  // Begin a chain of asynchronous operations using promiseChain.
  promiseChain ( cb )
  (
    // Step 1: Check if Node.js dependencies are installed.
    function ( cb )
    {
      var mo = Object.keys ( packageJSON.dependencies ) ;
      if ( path.existsSync ( __dirname + '/../node_modules' ) )
      {
        var modules   = fs.readdirSync ( __dirname + '/../node_modules' ) ;
        var validKeys = mo.filter ( function ( v )
        {
          return modules.indexOf ( v ) > -1 ;
        } ) ;
        if ( mo.length === validKeys.length )
        {
            return cb ( ) ;
        }
        return cb ( new Error ( 'You need to run `npm install` before this script' ) ) ;
      }
    }
  )
  (
    // Step 2: Prompt for Site Title.
    read
    , [ { prompt: "Site Title: " , default: site.title } ]
    , function ( n ) { site.title = n }
  )
  (
    // Step 3: Prompt for Site Description.
    read
    , [ { prompt:"Site Description: " , default: site.description } ]
    , function ( n ) { site.description = n }
  )
  (
    // Step 4: Prompt for Copyright information.
    read
    , [ { prompt:"Copyright: " , default: site.copyright } ]
    , function ( n ) { site.copyright = n }
  )
  (
    // Step 5: Prompt for Twitter Handler.
    read
    , [ { prompt:"Twitter Handler: " , default: site.twitter } ]
    , function ( n ) { site.twitter = n }
  )
  (
    // Step 6: Prompt for Port to listen on.
    read
    , [ { prompt:"Port to listen: " , default: site.port } ]
    , function ( n ) { site.port = n }
  )
  (
    // Step 7: Prompt for Secret word.
    read
    , [ { prompt:"Secret word: " , default: site.secret } ]
    , function ( n ) { site.secret = n }
  )
  (
    // Step 8: Inform user about theme setup.
    function ( cb )
    {
      console.log('\n\t:: Now we are going to setup the theme ::\n');
      return cb ( ) ;
    }
  )
  (
    // Step 9: Prompt for Admin theme.
    read
    , [ { prompt:"Admin theme: " , default: theme.admin } ]
    , function ( n ) { theme.admin = n }
  )
  (
    // Step 10: Prompt for Front theme.
    read
    , [ { prompt:"Front theme: " , default: theme.front } ]
    , function ( n ) { theme.front = n }
  )
  (
    // Step 11: Inform user about database setup.
    function ( cb )
    {
      console.log('\n\t:: Database Setup ::\n');
      return cb ( ) ;
    }
  )
  (
    // Step 12: Prompt for Database host.
    read
    , [ { prompt:"Database host: " , default: db.host } ]
    , function ( n ) { db.host = n }
  )
  (
    // Step 13: Prompt for Database port.
    read
    , [ { prompt:"Database port: " , default: db.port } ]
    , function ( n ) { db.port = n }
  )
  (
    // Step 14: Prompt for Database username.
    read
    , [ { prompt:"Database username: " , default: admin.user } ]
    , function ( n ) { admin.user = n }
  )
  (
    // Step 15: Prompt for Username password.
    read
    , [ { prompt:"Username pass: " , default: admin.pass } ]
    , function ( n ) { admin.pass = n }
  )
  (
    // Step 16: Review and confirm settings before writing to file.
    function ( cb )
    {
      console.log('\n\t:: About to write ::\n');
      console.log('config = ', data , '\nadmin = ', admin);
      read ( { prompt: "\nIs this ok? " , default: "yes" } , function ( er , ok )
      {
        if ( er ) return cb ( er ) ;
        if ( ok.toLowerCase ( ).charAt ( 0 ) !== "y" )
        {
          return cb ( new Error ( "cancelled" ) ) ;
        }
        return cb ( ) ;
      } ) ;
    }
  )
  (
    // Step 17: Write the configuration to config.js.
    function ( cb )
    {
      var template = 'exports.config = ' + JSON.stringify ( data , null , 2 ) +
                    ';\nexports.admin = ' + JSON.stringify ( admin , null , 2 ) ;
      fs.writeFile ( './config.js' , template , 'utf8' , function ( err , resp )
      {
        if ( err ) return cb ( err ) ;
        console.log('config.js wrote sucessfully');
        return cb ( ) ;
      } ) ;
    }
  )
  (
    // Step 18: Ask to install default views to the database.
    function ( cb )
    {
      read ( { prompt: "\nInstall default views to database? " , default: "yes" } , function ( er , ok )
      {
        if ( er ) return cb ( er ) ;
        if ( ok.toLowerCase ( ).charAt ( 0 ) !== "y" )
        {
          return cb ( new Error ( "cancelled" ) ) ;
        }
        installViews ( data , cb ) ;
      } ) ;
    }
  )
  (
    // Step 19: Ask to add an extra user.
    function ( cb )
    {
      read ( { prompt: "\nDo you want to add an extra user? " , default: "yes" } , function ( er , ok )
      {
        if ( er ) return cb ( er ) ;
        if ( ok.toLowerCase ( ).charAt ( 0 ) !== "y" )
        {
          return cb ( ) ;
        }
        else
        {
          var user = { } ;
          promiseChain ( cb )
          (
            // Prompt for new username.
            read
            , [ { prompt:"Username:" , default:"dave" } ]
            , function ( n ) { user.user = n }
          )
          (
            // Prompt for new password.
            read
            , [ { prompt:"Password:" , default:"dave" } ]
            , function ( n ) { user.password = n }
          )
          (
            // Prompt for new email.
            read
            , [ { prompt:"email:" , default:"dave@example.com" } ]
            , function ( n ) { user.email = n }
          )
          (
            // Save the new user to CouchDB.
            function ( cb )
            {
              var url =  data.db.host ;
              if ( ! ~ url.indexOf ( '://' ) ) url = 'http://' + url ;
              var c = new ( cradle.Connection ) ( url , data.db.port , {
                 auth: { username: admin.user , password: admin.pass }
              } ) ;
              var salt = crypto.createHash ( 'md5' ).update ( new Date ( ).toString ( ) ).update ( Math.random ( ).toString ( ) ).digest ( 'hex' ) ;
              var toSave =
              {
                _id      : 'org.couchdb.user:' + user.user,
                name     : user.user,
                salt     : salt,
                password : crypto.createHash ( 'sha1' ).update ( user.password.trim ( ) + salt ).digest ( 'hex' ),
                email    : user.email,
                roles    : [ ],
                type     : 'user'
              } ;
              var db = c.database ( '_users' ) ;
              db.save ( toSave , function ( err , resp )
              {
                if ( err && err.error !== 'conflict' ) return cb ( err ) ;
                else if ( err ) console.log ( '\nI can\'t update your username already exists' ) ; return cb ( ) ;
                console.log ( 'User saved...' ) ;
                return cb ( ) ;
              } ) ;
            }
          )
          (
            function ( cb )
            {
              return cb ( ) ;
            }
          ) ( )
        }
      } ) ;
    }
  )
  (
    // Final step: Instructions to run the server.
    function ( cb )
    {
      console.log('\nNow run `node server`\n\n:: Done :: ');
    }
  ) ( ) ; // Execute the promise chain.
}

/**
 * Installs default CouchPress design documents and views into the database.
 * @param {Object} data Configuration data including database details.
 * @param {Function} cb Callback function.
 */
function installViews ( data , cb )
{
  var url =  data.db.host ;
  if ( ! ~ url.indexOf ( '://' ) )
  {
    url = 'http://' + url ;
  }

  // Establish connection to CouchDB.
  var c = new ( cradle.Connection ) ( url , data.db.host , {
     auth: { username: admin.user , password: admin.pass }
  } ) ;
  var db = c.database ( 'couchpress' ) ;

  // Helper function to seed the database with design documents.
  function seed ( )
  {
    db.save ( '_design/couchpress' , {
      views: {
        all: {
          map: 'function(doc) {\n  if (doc.type !== \'upload\')\n    emit(doc.created_at, doc);\n}\n'
        },
        tag: {
          map: function ( doc ) {
            for ( tag in doc.tags ) {
              emit ( doc.tags[tag] , doc ) ;
            }
          }
        },
        uploads_all: {
          map: function ( doc ) {
            if ( doc.type === 'upload' ) {
              emit ( doc.created_at , doc ) ;
            }
          }
        }
      }
    } , function ( error , res )
    {
      if ( error ) return cb ( error ) ;
      console.log ( '\n Database and views saved...' ) ;
      return cb ( ) ;
    } ) ;
  }

  // Check if the database exists, create if not, then seed views.
  db.exists ( function ( err , exists )
  {
    if ( err )
    {
      return cb ( new Error ( err ) ) ;
    }
    else if ( exists )
    {
      seed ( ) ;
    }
    else
    {
      db.create ( ) ;
      setTimeout ( seed , 500 ) ; // Give a moment for DB creation.
    }
  } ) ;
}

/**
 * A utility function to chain asynchronous operations.
 * Allows for sequential execution of functions with error handling.
 * @param {Function} cb The main callback for the entire chain.
 * @returns {Function} A function to add steps to the chain.
 */
function promiseChain ( cb )
{
  var steps = [ ]
    , vals  = [ ] // Unused in original, keeping for structural fidelity
    , context = this
    ;

  // Internal function to execute the next step in the chain.
  function go ( )
  {
    var step = steps.shift ( ) ;
    if ( ! step ) return cb ( ) ;
    try { step [ 0 ].apply ( context , step [ 1 ] ) ; }
    catch ( ex ) { cb ( ex ) ; }
  }

  // The function returned to build the chain.
  return function pc ( fn , args , success )
  {
    if ( arguments.length === 0 ) return go ( ) ;
    // Add the current step to the internal steps array.
    steps.push
      ( [ fn
        , ( args || [ ] ).concat ( [ function ( er )
            {
              if ( er ) return cb ( er ) ;
              var a = Array.prototype.slice.call ( arguments , 1 ) ;
              try { success && success.apply ( context , a ) ; }
              catch ( ex ) { return cb ( ex ) ; }
              go ( ) ; // Move to the next step.
            } ] )
        ]
      ) ;
    return pc ; // Allow chaining further steps.
  }
}

// Display an ASCII art logo for CouchPress.
console.log ( "\n\
       _____             _                       \n\
      |     |___ _ _ ___| |_ ___ ___ ___ ___ ___ \n\
      |   --| . | | |  _|   | . |  _| -_|_ -|_ -|\n\
      |_____|___|___|___|_|_|  _|_| |___|___|___|\n\
                            |_|                  \n\
" ) ;

// Initiate the installation process.
init ( function ( err )
{
  // Log any errors that occurred during installation.
  console.log ( err ) ;
} ) ;