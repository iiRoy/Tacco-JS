/*
 * This file contains utility functions for setting up and tearing down
 * the database for testing purposes. It integrates with Mongoose and
 * a custom RBAC (Role-Based Access Control) module.
 */

// Core module imports.
var mongoose = require('mongoose')
  , rbac = require('../') // Relative path to the RBAC module.
  , Permission = rbac.Permission // Destructuring Permission model from rbac.
  , Role = rbac.Role           // Destructuring Role model from rbac.
  , UserSchema                 // Declaration for the Mongoose User Schema.
  , User;                      // Declaration for the Mongoose User Model.


// Set the Node.js environment to 'test' for specific configurations.
process.env.NODE_ENV = 'test' ;


/**
 * Initializes the database connection and performs a reset.
 *
 * @param {string} uri - The MongoDB connection URI.
 * @param {function} callback - Callback function to be executed after setup.
 */
function setup( uri , callback )
{
  // Establish connection to MongoDB.
  mongoose.connect(uri);

  // Handle connection errors.
  mongoose.connection.on( 'err' , function ( ) {
    callback( new Error( "connection error" ) );
  } ) ;

  // Execute reset once the connection is successfully opened.
  mongoose.connection.once( 'open' , function ( ) {
    reset( callback ) ;
  } ) ;
}


/**
 * Empties all collections (User, Role, Permission) in the database.
 * This is a soft clear, it removes documents but doesn't drop collections.
 *
 * @param {function} callback - Callback function to be executed after emptying.
 */
function empty( callback ) {
  User.remove( { } ) ;         // Remove all User documents.
  Role.remove( { } ) ;         // Remove all Role documents.
  Permission.remove( { } ) ;   // Remove all Permission documents.
  callback( ) ;                // Invoke the callback.
}


/**
 * Resets the database by dropping all collections.
 *
 * @param {function} callback - Callback function to be executed after reset.
 */
function reset( callback ) {
  // Iterate over all collections and drop them one by one.
  for ( var name in mongoose.connection.collections ) {
    mongoose.connection.collections[ name ].drop( ) ;
  }
  callback( ) ; // Signal completion.
}


/**
 * Loads predefined fixture data into the database.
 * This includes permissions and initial roles/users.
 *
 * @param {function} callback - Callback function for completion or error.
 */
function loadFixtures( callback ) {
  empty( function ( err ) {
    // If emptying the database resulted in an error, propagate it.
    if ( err ) { return callback( err ) ; }

    // Define a set of permissions for various subjects and actions.
    var permissions = [
        { subject : 'Post' , action : 'create' } ,
        { subject : 'Post' , action : 'read'   } ,
        { subject : 'Post' , action : 'update' } ,
        { subject : 'Post' , action : 'delete' } ,
        { subject : 'Comment' , action : 'create' } ,
        { subject : 'Comment' , action : 'read'   } ,
        { subject : 'Comment' , action : 'update' } ,
        { subject : 'Comment' , action : 'delete' }
      ] ;

    // Create a new user instance.
    var user = new User( { username : 'henry' } ) ;
    user.save( ) ; // Save the user to the database.

    // Create the defined permissions in the database.
    Permission.create( permissions , function ( err ) {
      if ( err ) { return callback( err ) ; } // Handle permission creation error.

      var perms , admin , readonly ; // Declare variables for permissions and roles.

      // Extract created permissions from arguments (after the error object).
      perms = Array.prototype.slice.call( arguments , 1 ) ;
      admin = new Role( { name : 'admin' } ) ; // Create 'admin' role.
      admin.permissions = perms ;              // Assign all permissions to admin.
      admin.save( function ( err ) {            // Save the admin role.
        if ( err ) { return callback( err ) ; } // Handle admin role save error.

        readonly = new Role( { name : 'readonly' } ) ; // Create 'readonly' role.
        // Assign specific permissions (read Post, read Comment) to readonly role.
        readonly.permissions = [ perms[ 1 ] , perms[ 5 ] ] ;
        readonly.save( function ( err ) { // Save the readonly role.
          callback( err ) ;              // Final callback after saving readonly role.
        } ) ;
      } ) ;
    } ) ;
  } ) ;
}


// Define the Mongoose schema for the User model.
UserSchema = mongoose.Schema( { username : String } ) ;
// Apply the RBAC plugin to the User schema.
UserSchema.plugin( rbac.plugin ) ;
// Create the Mongoose User model.
User = mongoose.model( 'User' , UserSchema ) ;


// Export key components for external use.
module.exports.User = User ;
module.exports.setup = setup ;
module.exports.empty = empty ;
module.exports.reset = reset ;
module.exports.loadFixtures = loadFixtures ;