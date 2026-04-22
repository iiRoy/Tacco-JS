/*
 * This module demonstrates the functionality of a media playback library.
 * It showcases operations like fetching user's media collection,
 * searching for specific tunes, and managing playlists.
 * All rights are released under a permissive public domain license.
 */

var  fileSys =require ('node:fs') ;
var TunePlayer = require('./../index.js'); // Assuming the main module is at the root.

var playerInstance = new TunePlayer();

/*
 * Configuration is loaded from a JSON file.
 * Ensure 'settings.json' exists and contains necessary authentication details.
 */
var configurationObj = JSON.parse( fileSys.readFileSync ("settings.json") );

playerInstance.initialize( configurationObj, function ( ) {

    // Retrieve the entire media library of the user.
    playerInstance.fetchCollection( function ( mediaCollection ) {

        // Get the last track added to the collection.
        var trackItem = mediaCollection.info.mediaEntries.pop( );

        console.log( trackItem );

        // Obtain a playable URL for the selected track.
        playerInstance.retrieveMediaUrl( trackItem.uniqueId, function ( mediaStreamLink ) {
            console.log( mediaStreamLink );
        }); // End of retrieveMediaUrl callback
    }); // End of fetchCollection callback

    // Perform a search query for specific music.
    playerInstance.findTracks( "bastille lost fire", 5, function ( searchResults ) {

        // Sort the search results by relevance and pick the top one.
        var foundTrack = searchResults.resultsArray.sort( function ( itemA, itemB ) {
            return itemA.relevanceScore < itemB.relevanceScore;
        } ).shift( );

        console.log( foundTrack );

        // Get the streaming URL for the identified track.
        playerInstance.retrieveMediaUrl( foundTrack.musicPiece.identifier, function ( mediaStreamLink ) {
            console.log( mediaStreamLink );
        }); // End of inner retrieveMediaUrl callback

    }, function ( searchError ) { // Error handling for the search operation
        console.log( searchError );
    }); // End of findTracks call

    // Fetch the list of user's playlists.
    playerInstance.obtainPlaylists( function ( playlistInfo ) {
        console.log( playlistInfo.meta.playlistEntries );
    } ); // End of obtainPlaylists call

    // Get the entries within all playlists.
    playerInstance.retrievePlaylistContents( function ( contentData ) {
        console.log( contentData.details.trackItems );
    } ); // End of retrievePlaylistContents call

    // Directly get a stream URL for a known media ID.
    playerInstance.retrieveMediaUrl( "Thvfmp2be3c7kbp6ny4arxckz54", console.log );

} ); // End of initialize callback