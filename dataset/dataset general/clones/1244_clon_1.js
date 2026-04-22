// This script demonstrates basic usage of the PlayMusic library.
// It's released into the Public Domain under CC0.
// For more details, visit: http://creativecommons.org/publicdomain/zero/1.0/


  var fs  =  require ( 'fs' ) ;
  var PlayMusic = require ( '../' ) ; // Library import

  var pm = new PlayMusic ( ) ; // Instance of PlayMusic
  var config = JSON . parse ( fs . readFileSync ( "config.json" ) ) ; // Load configuration

  pm . init ( config , function ( ) { // Initialize the client


    // Retrieve the user's music library
    pm . getLibrary ( function ( library ) {
      var song = library . data . items . pop ( ) ; // Get a random song
      console . log ( song ) ;
      pm . getStreamUrl ( song . id , function ( streamUrl ) {
        console . log ( streamUrl ) ; // Log stream URL
      } ) ;
    } ) ;


    // Perform a music search
    pm . search ( "bastille lost fire" , 5 , function ( data ) {
        var song = data . entries . sort ( function ( a , b ) {
            return a . score < b . score ; // Sort by score
        } ) . shift ( ) ; // Get the top result
        console . log ( song ) ;
        pm . getStreamUrl ( song . track . nid , function ( streamUrl ) {
            console . log ( streamUrl ) ;
        } ) ;
    } , function ( err ) { // Error callback
        console . log ( err ) ;
    } ) ;


    // Fetch user playlists
    pm . getPlayLists ( function ( data ) {
        console . log ( data . data . items ) ;
    } ) ;


    // Fetch entries for a playlist (example)
    pm . getPlayListEntries ( function ( data ) {
        console . log ( data . data . items ) ;
    } ) ;

    pm . getStreamUrl ( "Thvfmp2be3c7kbp6ny4arxckz54" , console . log ) ; // Get stream for a specific ID

} ) ; // End of pm.init callback