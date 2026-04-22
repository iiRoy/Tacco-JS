function     onBodyLoad   ( )
{
    /* This function is invoked when the HTML body content has finished loading.
     * Its primary role is to set up an event listener for the 'deviceready' event,
     * which is crucial for Cordova/PhoneGap applications to ensure the device APIs
     * are fully loaded and accessible before proceeding with further operations.
     */
    document . addEventListener ( "deviceready" , go , false ) ;
}


var localFileName ; /* This variable will hold the name of the local
                       MBTiles file, which is expected to be stored
                       on the device's file system. */

var remoteFile    ; // The URL from which the MBTiles file will be downloaded.
                    // This is a remote resource location.

var msg           ; // A reference to the HTML element (likely a <span> or <div>)
                    // used to display messages and status updates to the user.


localFileName = 'test.mbtiles' ; // Assigning the default local file name.

remoteFile    = 'http://dl.dropbox.com/u/14814828/OSMBrightSLValley.mbtiles' ; // The URL for the remote MBTiles file.


/**
 * The main entry point for the application logic once the device is ready.
 * This function orchestrates file system access, file download (if necessary),
 * and subsequent map initialization.
 */
function go ( )
{
    var fs ; // Declares a variable to store the FileSystem object.
    var ft ; // Declares a variable to store the FileTransfer object.


    // Obtain a reference to the message display element.
    msg = document . getElementById ( 'message' ) ;


    console . log ( 'requesting file system...' ) ; // Log a message indicating file system request.

    // Request access to the persistent local file system.
    window . requestFileSystem ( LocalFileSystem . PERSISTENT ,
                                 0 ,
                                 function ( fileSystem ) // Success callback for file system request.
                                 {
                                     console . log ( 'file system retrieved.' ) ; // Confirm file system access.
                                     fs = fileSystem ; // Store the FileSystem object.

                                     // Now, we need to check if the desired MBTiles file already exists on the device.
                                     var file = fs . root . getFile ( localFileName ,
                                                                      { create : false } , // Do not create if it doesn't exist.
                                                                      function ( ) // Success callback: file exists.
                                                                      {
                                                                          // The file was successfully retrieved, meaning it already exists.
                                                                          console . log ( 'exists' ) ;

                                                                          msg . innerHTML = 'File already exists on device. Building map...' ;

                                                                          // Proceed to build the map using the existing file.
                                                                          buildMap ( ) ;
                                                                      } ,
                                                                      function ( ) // Error callback: file does not exist.
                                                                      {
                                                                          // The file could not be retrieved, indicating it's not present.
                                                                          console . log ( 'does not exist' ) ;

                                                                          msg . innerHTML = 'Downloading file (~14mbs)...' ;

                                                                          console . log ( 'downloading sqlite file...' ) ;
                                                                          ft = new FileTransfer ( ) ; // Initialize a new FileTransfer object.

                                                                          // Commence the download of the remote MBTiles file.
                                                                          ft . download ( remoteFile ,
                                                                                        fs . root . fullPath + '/' + localFileName ,
                                                                                        function ( entry ) // Success callback for download.
                                                                                        {
                                                                                            console . log ( 'download complete: ' + entry . fullPath ) ;

                                                                                            // Once downloaded, build the map.
                                                                                            buildMap ( ) ;

                                                                                        } ,
                                                                                        function ( error ) // Error callback for download.
                                                                                        {
                                                                                            console . log ( 'error with download' , error ) ;
                                                                                            // Additional error handling could go here.
                                                                                        } ) ;
                                                                      } ) ;
                                 } ) ;
}


/*
 * This function is responsible for initializing and displaying the map.
 * It uses the downloaded (or existing) MBTiles file as the data source.
 */
function buildMap ( )
{
    // Initialize the SQLite plugin with the local MBTiles file.
    var db = new SQLitePlugin ( localFileName ) ;

    // Remove the message display element from the body as messages are no longer needed.
    document . body . removeChild ( msg ) ;

    // Create a new Leaflet map instance.
    var map = new L . Map ( 'map' ,
                            {
                                center : new L . LatLng ( 40.6681 , -111.9364 ) , // Set the initial center coordinates.
                                zoom   : 11                                        // Set the initial zoom level.
                            } ) ;

    // Create a new Leaflet MBTiles layer.
    var lyr = new L . TileLayer . MBTiles ( '' ,
                                            { maxZoom : 14 , scheme : 'tms' } , // Layer options: max zoom and TMS scheme.
                                            db ) ;                              // Pass the SQLite database object.

    // Add the MBTiles layer to the map.
    map . addLayer ( lyr ) ;
}