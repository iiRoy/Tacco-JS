// Import the 'mongojs' library for MongoDB interaction.
var mongoJs = require('mongojs');
// Import the 'q' library for promise-based asynchronous operations.
var Q = require('q');


/*
 * This module defines a class responsible for managing country data
 * within the database. It encapsulates operations like retrieving,
 * searching, and saving country information.
 */
function tinataCountries( ) {

  /*
   * Retrieves all country records from the database.
   * The results are ordered alphabetically by the country's name.
   *
   * @returns {Promise<Array<Object>>} A promise that resolves with an array of country objects.
   */
  this.getAllCountries = function( ) {
    // Create a new deferred object to manage the asynchronous operation's promise.
    var deferred = Q.defer( ) ;

    // Execute a find operation on the 'countries' collection.
    // The query fetches all documents, ordered by the 'name' field in ascending order (1).
    db.countries.find( { '$query': { } , '$orderby': { name: 1 } } , function( err , countries ) {
      // Resolve the deferred promise with the retrieved countries array.
      deferred.resolve( countries ) ;
    } ) ;

    // Return the promise associated with this deferred object.
    return deferred.promise ;
  } ;


  /*
   * Locates a specific country based on various criteria.
   * This function can search either an in-memory array of countries or the database.
   *
   * @param {string|number} country    The identifier for the country. This can be an ISO Numeric ID,
   *                                   a 2-letter or 3-letter ISO code, the country's full name, or an alias.
   * @param {Array<Object>} [countries] An optional array of country objects to search. If provided,
   *                                   the function will search this array first instead of the database.
   * @returns {Promise<Object|boolean>} A promise that resolves with the found country object,
   *                                   or `false` if no match is found.
   */
  this.getCountry = function( country , countries ) {
    var deferred = Q.defer( ) ; // Initialize a new deferred object.

    if ( countries ) {
      // --- Search within the provided in-memory array ---
      // This path is optimized for scenarios like bulk imports, avoiding repeated DB calls.

      if ( !isNaN( country ) ) { // Check if the input 'country' can be parsed as a number.
        // If it's a number, attempt to look up by ISO Numeric ID.
        for ( i in countries ) {
          if ( countries[i].isoNumeric == country ) {
            deferred.resolve( countries[i] ) ;
            return deferred.promise ; // Found a match, resolve and exit.
          }
        }
      } else if ( country.length == 2 ) {
        // If it's a 2-character string, look up by ISO 2-letter code.
        for ( i in countries ) {
          if ( countries[i].iso2 == country ) {
            deferred.resolve( countries[i] ) ;
            return deferred.promise ; // Found a match, resolve and exit.
          }
        }
      } else if ( country.length == 3 ) {
        // If it's a 3-character string, look up by ISO 3-letter code.
        for ( i in countries ) {
          if ( countries[i].iso3 == country ) {
            deferred.resolve( countries[i] ) ;
            return deferred.promise ; // Found a match, resolve and exit.
          }
        }
      } else {
        // If not a number and not 2 or 3 chars, assume it's a name or alias.
        // First, try matching by the primary 'name' field.
        for ( i in countries ) {
          if ( countries[i].name == country ) {
            deferred.resolve( countries[i] ) ;
            return deferred.promise ; // Found by name, resolve and exit.
          }
        }

        // If not found by primary 'name', attempt to match by 'officalName'.
        for ( i in countries ) {
          if ( countries[i].officalName ) { // Ensure the 'officalName' property exists.
            if ( countries[i].officalName == country ) {
              deferred.resolve( countries[i] ) ;
              return deferred.promise ; // Found by official name, resolve and exit.
            }
          }
        }

        // If still no match, iterate through aliases.
        for ( i in countries ) {
          if ( !countries[i].aliases ) {
            continue ; // Skip if no aliases are defined for this country.
          }
          // Loop through each alias for the current country.
          for ( j in countries[i].aliases ) {
            if ( countries[i].aliases[j] == country ) {
              deferred.resolve( countries[i] ) ;
              return deferred.promise ; // Found by alias, resolve and exit.
            }
          }
        }
      }

      // If the code reaches here, no match was found in the in-memory array.
      deferred.resolve( false ) ;
      return deferred.promise ;
    } else {
      // --- Search within the database ---
      // This path is used when no in-memory array is supplied.

      var query = { } ; // Initialize an empty query object.

      // Determine the appropriate query field based on the 'country' input type/length.
      if ( !isNaN( country ) ) {
        query = { isoNumeric: country } ; // Search by ISO Numeric ID.
      } else if ( country.length == 2 ) {
        query = { iso2: country } ; // Search by ISO 2-letter code.
      } else if ( country.length == 3 ) {
        query = { iso3: country } ; // Search by ISO 3-letter code.
      } else {
        query = { name: country } ; // Default to searching by primary 'name'.
      }

      // Execute the initial database query using the constructed 'query' object.
      db.countries.find( { '$query': query } , function( err , countries ) {
        if ( countries && countries[0] ) {
          // If the primary query yields a result, resolve with the first match.
          deferred.resolve( countries[0] ) ;
        } else {
          // If no match found by primary criteria, attempt to search by 'officalName'.
          db.countries.find( { '$query': { officalName: country } } , function( err , countries ) {
            if ( countries && countries[0] ) {
              // If found by official name, resolve.
              deferred.resolve( countries[0] ) ;
            } else {
              // If still no match, search through the 'aliases' array field.
              db.countries.find( { '$query': { aliases: country } } , function( err , countries ) {
                if ( countries && countries[0] ) {
                  // If found by alias, resolve.
                  deferred.resolve( countries[0] ) ;
                } else {
                  // Absolutely no match found after all attempts.
                  deferred.resolve( false ) ;
                }
              } ) ;
            }
          } ) ;
        }
      } ) ;

      return deferred.promise ; // Return the promise for the DB lookup operation.
    }
  } ;


  /*
   * Persists a country object to the database.
   * This method ensures data consistency and cleans up blank fields before saving.
   *
   * @param {Object} country The country object to be saved or updated.
   * @returns {Promise<Object>} A promise that resolves with the saved country object.
   */
  this.saveCountry = function( country ) {
    var deferred = Q.defer( ) ; // Start a new deferred operation.

    // Assign the ISO 2-letter code as the document's primary key (_id).
    // This practice helps prevent duplicate entries and provides a consistent identifier.
    country._id = country.iso2 ;

    // Iterate through the 'warnings' array and remove any empty warning categories.
    // An empty category is represented by an empty object '{}'.
    for ( i in country.warnings ) {
      if ( JSON.stringify( country.warnings[i] ) == '{}' ) {
        delete country.warnings[i] ;
      }
    }

    // Before saving, clean up the country object by removing any fields
    // that have blank string values, empty arrays, or empty objects.
    for ( i in country ) {
      if ( country[i] == "" || country[i].length == 0 || JSON.stringify( country[i] ) == '{}' ) {
        delete country[i] ;
      }
    }

    // Perform the save operation to the 'countries' collection.
    // If an _id exists, it updates; otherwise, it inserts a new document.
    db.countries.save( country , function( err , saved ) {
      if ( err || !saved ) {
        console.log( "Error: Could not save country to DB: " + err ) ;
      }
      // Resolve the promise with the (potentially updated/saved) country object.
      deferred.resolve( country ) ;
    } ) ;

    return deferred.promise ; // Return the promise for the save operation.
  } ;
}


// Export an instance of tinataCountries as the primary module export.
exports = module.exports = new tinataCountries( ) ;
// Also export the constructor function itself under the 'countries' property.
exports.countries = tinataCountries ;