// This module is responsible for the creation and management of map tiles.

var fs = require('fs')
  , pg = require('pg')
  , qc = require('./queryCreator')
  , rp = require('./resultParser')
  , bc = require('./bboxCreator')
  , ut = require('../utils/utils')
  , conString = 'tcp://gisuser:gisuser@energia.deusto.es:5432/gis'
;

// Function: connect - Establishes a database connection.
exports.connect = function connect ( callback ) {
  
  // Note: For high-traffic applications, consider using a connection pool.
  // Example: https://github.com/brianc/node-postgres#client-pooling
  
  var client = new pg.Client(conString);

  client.connect ( function ( error ) {
    if ( error ) {
      // Pass the connection error to the callback.
      callback(error);
    } else {
      // On successful connection, pass null error and the client object.
      callback(0, client);
    }
  } );
}


// Function: disconnect - Terminates an active database connection.
exports.disconnect = function disconnect ( client , callback ) {
  // End the client connection gracefully.
  client.end();
  // Invoke the callback once the connection is closed.
  callback();
}


// Internal helper function to generate a single map tile.
function generateTile ( client , z , x , y , callback ) {
  // console.log(('[TILECREATOR.JS] Request for ' + z + '/' + x + '/' + y + ' tile').yellow);

  // Retrieve the geographical bounding box for the given tile coordinates.
  bc.getLTRBbox ( z , x , y , function ( l , t , r , b ) {

    // console.log(('[TILECREATOR.JS] Bounding Box for ' + z + '/' + x + '/' + y + ' tile : [' + l + ',' +  t + ',' + r + ',' + b + ']').yellow);

    if ( l || t || r || b ) { // Proceed only if a valid bounding box was returned.

      // Construct the SQL query using the bounding box and zoom level.
      var query = qc.getQuery ( z , l , t , r , b ) ;

      // Execute the query against the database.
      client.query ( query , function ( error , result ) {

        var fileName = 'public/tiles/' + z + '/' + x + '/' + y + '.json'; // Define the output file path for the tile.

        if ( ! error ) { // If the database query was successful.

          // Parse the query result into a structured format.
          rp.parseResult ( result , function ( parsedResult ) {
            if ( parsedResult ) {
              // Check if the tile file already exists.
              ut.fileExists ( fileName , parsedResult , function ( exists , stream , file ) {
                if ( exists ) {
                  // If it exists, delete the old file before writing new data.
                  fs.unlinkSync ( file ) ;
                }
                // Write the parsed data stream to the tile file.
                fs.writeFile ( file , stream , function ( error ) {
                  if ( error ) {
                    // Log and callback with error if file writing fails.
                    console.log ( ( '[TILECREATOR.JS] Error generating ' + file + ' - ' + error ) . red ) ;
                    callback ( error ) ;
                  } else {
                    // Log success and invoke callback if tile is successfully written.
                    console.log ( ( '[TILECREATOR.JS] Succesfully generated ' + file ) . green ) ;
                    callback ( ) ;
                  }
                } ) ;
              } ) ;
            }
          } ) ;
        } else {
          // Log an error if the database query failed.
          console.log ( ( '[TILECREATOR.JS] Error generating ' + fileName + ' - ' + error ) . red ) ;
        }
      } ) ;
    } else {
      // Log an error if bounding box calculation failed.
      console.log ( ( '[TILECREATOR.JS] Error calculating bbox for ' + z + '/' + x + '/' + y + ' tile ' ) . red ) ;
    }
  } ) ;
}
exports.generateTile = generateTile ; // Export the single tile generation function.


// Function: generateZoomTilesFromTo - Generates a grid of tiles for a specified zoom level.
function generateZoomTilesFromTo ( client , z , minX , minY , maxX , maxY , callback ) {
  console.log ( ( '[TILECREATOR.JS] Asked for ' + z + ' zoom level tiles' ) . yellow ) ;

  // Ensure the base directory for the current zoom level exists.
  ut.dirExists ( 'public/tiles/' + z , z , function ( result , temp , dir ) {

    var totalTiles = ( maxX - minX + 1 ) * ( maxY - minY + 1 ) ; // Calculate the total number of tiles to be generated.

    if ( ! result ) {
      // If the directory does not exist, create it.
      fs.mkdirSync ( dir ) ;
    }

    // Loop through the X tile coordinates.
    for ( var x = minX ; x <= maxX ; x++ ) {
      // Ensure the subdirectory for each X coordinate exists.
      ut.dirExists ( 'public/tiles/' + z + '/' + x , x , function ( result , temp , dir ) {
        if ( ! result ) {
          // If the X directory does not exist, create it.
          fs.mkdirSync ( dir ) ;
        }
        // Loop through the Y tile coordinates for the current X.
        for ( var y = minY ; y <= maxY ; y++ ) {
          // Generate each individual tile within the specified range.
          generateTile ( client , z , temp , y , function ( error ) {

            totalTiles -- ; // Decrement the counter for remaining tiles.

            if ( totalTiles <= 0 ) {
              // Once all tiles in the range are generated, log success and invoke the callback.
              console.log ( ( '[TILECREATOR.JS] Succesfully generated ' + z + ' zoom level tiles' ) . green ) ;
              callback ( ) ;
            }

          } ) ;
        }
      } ) ;
    }
  } ) ;
}
exports.generateZoomTilesFromTo = generateZoomTilesFromTo ; // Export this function for batch tile generation.


// Function: generateZoomTilesForBox - Generates tiles within a geographical bounding box for a given zoom level.
function generateZoomTilesForBox ( client , z , left , top , right , bottom , callback ) {

  // Convert the geographical bounding box to tile grid coordinates (minX, minY, maxX, maxY).
  bc.getXYbox ( z , left , top , right , bottom , function ( z , minX , minY , maxX , maxY ) {
    
    // Check if valid tile grid coordinates were successfully obtained.
    if ( minX || minY || maxX || maxY ) {
      // If valid, delegate to `generateZoomTilesFromTo` to create the tiles within this grid.
      generateZoomTilesFromTo ( client , z , minX , minY , maxX , maxY , function ( ) {
        // Invoke the main callback once all tiles in the box are generated.
        callback ( ) ;
      } ) ;
    } else {
      // If no valid tile box could be determined, simply invoke the callback (nothing to generate).
      callback ( ) ;
    }
  } ) ;
}
exports.generateZoomTilesForBox = generateZoomTilesForBox ; // Export the function.


// Function: generateZoomsFromTo - Generates all tiles for a range of specified zoom levels.
function generateZoomsFromTo ( client , from , to , callback ) {
  console.log ( ( '[TILECREATOR.JS] Asked for tiles between ' + from + ' and ' + to ) . yellow ) ;

  // Ensure the root 'public/tiles' directory exists to store all generated tiles.
  ut.dirExists ( 'public/tiles' , null , function ( result , temp , dir ) {

    var numZooms = to - from + 1 ; // Calculate the total number of zoom levels to process.
    
    if ( ! result ) {
      // If the main tile directory does not exist, create it.
      fs.mkdirSync ( dir ) ;
    }

    // Iterate through each zoom level from the starting 'from' level to the 'to' level.
    for ( var z = from ; z <= to ; z++ ) {

      var numTiles = Math.pow ( 2 , z ) ; // Determine the maximum tile index (e.g., 2^z) for the current zoom level.
      // Generate all tiles for the current zoom level, covering the entire world (from 0,0 to numTiles-1, numTiles-1).
      generateZoomTilesFromTo ( client , z , 0 , 0 , numTiles , numTiles , function ( error ) {

        numZooms -- ; // Decrement the counter for remaining zoom levels to process.
        if ( numZooms <= 0 ) {
          // Once all zoom levels have been processed, invoke the final callback.
          callback ( ) ;
        }
      } ) ;
    }
  } ) ;
}
exports.generateZoomsFromTo = generateZoomsFromTo ; // Export this function for generating multiple zoom levels.