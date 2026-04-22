/* jslint node: true */
/* This file adheres to strict mode for better code quality. */
'use strict' ;

/*
 * Barrels.js - A utility for managing test fixtures within Sails.js applications.
 * Provides functionality to load and populate database tables with predefined data.
 */

/*
 * Required external modules.
 * These are essential for file system operations, path manipulation,
 * asynchronous control flow, and utility functions.
 */
var fs = require ( 'fs' ) ;
var path = require ( 'path' ) ;
var async = require ( 'async' ) ;
var _ = require ( 'lodash' ) ;

// Export the Barrels constructor function as the module's main export.
module.exports = Barrels ;

/*
 * Barrels Constructor Function.
 * Initializes a new Barrels instance, loading fixture data from JSON files.
 *
 * @param {string} sourceFolder - The directory containing fixture JSON files.
 *                                Defaults to '<project root>/test/fixtures' if not provided.
 */
function Barrels ( sourceFolder ) {

  // Ensure that Barrels is called with the 'new' keyword.
  if ( ! ( this instanceof Barrels ) ) {
    return new Barrels ( sourceFolder ) ;
  }

  // An object to store all fixture data loaded from JSON files, keyed by model name.
  this.data = {} ;

  // A map to store the real database IDs corresponding to the original
  // positions of fixture items within their JSON files.
  this.idMap = {} ;

  // An object to hold association definitions for each model,
  // parsed from Sails.js model definitions.
  this.associations = {} ;

  // Determine the source folder for fixtures.
  // If not provided, use the default path relative to the current working directory.
  sourceFolder = sourceFolder || ( process.cwd ( ) + '/test/fixtures' ) ;

  // Read all files in the specified fixture source folder.
  var files = fs.readdirSync ( sourceFolder ) ;

  // Iterate through each file found in the fixture directory.
  for ( var i = 0 ; i < files.length ; i ++ ) {

    // Process only files with a '.json' extension (case-insensitive).
    if ( path.extname ( files [ i ] ) .toLowerCase ( ) === '.json' ) {

      // Extract the model name from the filename (e.g., 'users.json' -> 'users').
      var modelName = path.basename ( files [ i ] ) .split ( '.' ) [ 0 ] .toLowerCase ( ) ;

      // Load the JSON file and store its content under the corresponding model name.
      this.data [ modelName ] = require ( path.join ( sourceFolder , files [ i ] ) ) ;

    } // End of JSON file check.

  } // End of files loop.

  // Store an array of all model names for which fixture data has been loaded.
  this.modelNames = Object.keys ( this.data ) ;

} // End of Barrels constructor.


/*
 * Barrels.prototype.associate
 * Establishes associations between records after they have been populated.
 * This method updates the database records with their related foreign keys or join table entries.
 *
 * @param {array|function} collections - An optional array of model names to associate.
 *                                       If omitted, all loaded models will be processed.
 *                                       If a function, it is treated as the 'done' callback.
 * @param {function} done - The callback function to be invoked once all associations are complete,
 *                          or if an error occurs.
 */
Barrels.prototype.associate = function ( collections , done ) {

  // Handle optional 'collections' argument.
  // If 'collections' is not an array, it means it's the 'done' callback.
  if ( ! _.isArray ( collections ) ) {
    done = collections ;
    collections = this.modelNames ; // Default to all loaded models.
  }

  var that = this ; // Capture 'this' for use in nested callbacks.

  // Iterate over each collection (model) to establish its associations.
  async.each ( collections , function ( modelName , nextModel ) {

    // Retrieve the Sails.js model definition.
    var Model = sails.models [ modelName ] ;

    // Proceed only if the model actually exists.
    if ( Model ) {

      // Create a deep clone of the fixture objects to avoid modifying the original data.
      var fixtureObjects = _.cloneDeep ( that.data [ modelName ] ) ;

      // Process each fixture item within the current model.
      async.each ( fixtureObjects , function ( item , nextItem ) {

        // Determine the original index of the item in the fixture array.
        var itemIndex = fixtureObjects.indexOf ( item ) ;

        // Find the actual database record corresponding to the fixture item using its mapped ID.
        Model.findOne ( that.idMap [ modelName ] [ itemIndex ] ) .exec ( function ( err , model ) {

          // If an error occurs during lookup, propagate it.
          if ( err ) {
            return nextItem ( err ) ;
          }

          // Filter the current fixture item to include only its association attributes.
          item = _.pick ( item , Object.keys ( that.associations [ modelName ] ) ) ;

          // Iterate over each association attribute of the item.
          async.each ( Object.keys ( item ) , function ( attr , nextAttr ) {

            // Get the association definition for the current attribute.
            var association = that.associations [ modelName ] [ attr ] ;

            // Determine the name of the joined model for this association.
            var joined = association [ association.type ] ;

            // Handle different types of associations (one-to-one/many-to-one vs. many-to-many).
            if ( ! _.isArray ( item [ attr ] ) ) {
              // For single-value associations, directly assign the mapped ID.
              model [ attr ] = that.idMap [ joined ] [ item [ attr ] - 1 ] ;
            }
            else {
              // For array-based (many-to-many) associations, add each related ID.
              for ( var j = 0 ; j < item [ attr ] .length ; j ++ ) {
                model [ attr ] .add ( that.idMap [ joined ] [ item [ attr ] [ j ] - 1 ] ) ;
              }
            }

            // Save the updated model with its new association data.
            model.save ( function ( err ) {
              if ( err ) {
                return nextAttr ( err ) ;
              }

              nextAttr ( ) ; // Move to the next attribute.
            } ) ;

          } , nextItem ) ; // End of async.each for attributes.

        } ) ; // End of Model.findOne().exec().

      } , nextModel ) ; // End of async.each for fixtureObjects.

    } else {
      nextModel ( ) ; // If model doesn't exist, just move to the next.
    }

  } , done ) ; // End of async.each for collections.

} ; // End of Barrels.prototype.associate.


/*
 * Barrels.prototype.populate
 * Inserts fixture data into the database for specified collections.
 * This method can optionally handle automatic association creation based on fixture data order.
 *
 * @param {array|function} collections - An optional list of model names (strings) to populate.
 *                                       If omitted, all loaded models will be populated.
 *                                       If a function, it is treated as the 'done' callback.
 * @param {function} done - The callback function invoked after population (and optional association) is complete.
 * @param {boolean} autoAssociations - Flag to enable or disable automatic association creation.
 *                                     Defaults to true. If set to `false`, associations are skipped.
 */
Barrels.prototype.populate = function ( collections , done , autoAssociations ) {

  // Adjust arguments if 'collections' is omitted.
  if ( ! _.isArray ( collections ) ) {
    autoAssociations = done ;
    done = collections ;
    collections = this.modelNames ; // Populate all models by default.
  }
  else {
    // Ensure all collection names are lowercase for consistency.
    _.each ( collections , function ( collection ) {
      collection = collection.toLowerCase ( ) ;
    } ) ;
  }

  // Ensure autoAssociations is treated as true by default, unless explicitly false.
  autoAssociations = ! ( autoAssociations === false ) ;

  var that = this ; // Capture 'this' for use in nested scopes.

  // Iterate over each collection (model) to populate its data.
  async.each ( collections , function ( modelName , nextModel ) {

    // Get the Sails.js model definition.
    var Model = sails.models [ modelName ] ;

    // Proceed only if the model is valid.
    if ( Model ) {

      // First, destroy all existing records in the current model's table/collection.
      // This ensures a clean slate for fixture insertion.
      Model.destroy ( ) .exec ( function ( err ) {
        if ( err ) {
          return nextModel ( err ) ;
        }

        // Initialize the associations object for the current model.
        that.associations [ modelName ] = {} ;

        // Store association metadata from the Sails model definition.
        for ( var i = 0 ; i < Model.associations.length ; i ++ ) {
          that.associations [ modelName ] [ Model.associations [ i ] .alias ] = Model.associations [ i ] ;
        }

        // Prepare an array to map fixture item indices to their newly generated DB IDs.
        that.idMap [ modelName ] = [ ] ;

        // Deep clone fixture objects to prevent modification of original data during processing.
        var fixtureObjects = _.cloneDeep ( that.data [ modelName ] ) ;

        // Insert each fixture item into the database.
        async.each ( fixtureObjects , function ( item , nextItem ) {

          // Get the original index of the item within the fixture array.
          var itemIndex = fixtureObjects.indexOf ( item ) ;

          // If auto-associations are enabled, remove association-related fields from the item
          // before insertion, as they will be handled separately.
          if ( autoAssociations ) {
            item = _.omit ( item , Object.keys ( that.associations [ modelName ] ) ) ;
          }

          // Create the new record in the database.
          Model.create ( item ) .exec ( function ( err , model ) {
            if ( err ) {
              return nextItem ( err ) ;
            }

            // Map the fixture item's original index to its new primary key in the database.
            that.idMap [ modelName ] [ itemIndex ] = model [ Model.primaryKey ] ;

            nextItem ( ) ; // Move to the next fixture item.
          } ) ; // End of Model.create().exec().

        } , nextModel ) ; // End of async.each for fixtureObjects.

      } ) ; // End of Model.destroy().exec().

    } else {
      nextModel ( ) ; // If the model doesn't exist, skip it and move on.
    }

  } , function ( err ) { // Callback for async.each (collections).
    if ( err ) {
      return done ( err ) ; // If any error occurred during population, propagate it.
    }

    // If auto-associations are enabled, call the associate method to create them.
    if ( autoAssociations ) {
      return that.associate ( collections , done ) ;
    }

    done ( ) ; // Otherwise, simply call the final 'done' callback.
  } ) ; // End of async.each (collections).

} ; // End of Barrels.prototype.populate.