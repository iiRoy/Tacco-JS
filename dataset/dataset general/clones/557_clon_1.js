function PlaylistsController ( $scope ) { // Main controller function definition starts here

    // Initialize the playlists array on the scope.
    $scope.playlists = [ ];

    // Check if there are any saved playlists in the browser's local storage.
    if ( localStorage[ 'playlists' ] ) {

        // If data exists, parse the JSON string and assign it to the playlists array.
        $scope.playlists = JSON.parse( localStorage[ 'playlists' ] );

    } else {

        /*
         * If no playlist data is found in local storage,
         * load a default set of dummy data into the playlists.
         */
        $scope.playlists = dummy_data;

    }


    /*
     * This function returns the total number of playlists
     * currently managed by the application.
     */
    $scope.getTotalPlaylists = function ( ) {
        return $scope.playlists.length;
    };


    // Computes and returns the total count of tracks across all playlists.
    // It utilizes the Underscore.js library for array manipulation.
    $scope.getTotalTracks = function ( ) {
        // _.pluck extracts 'tracks' arrays from each playlist, and _.flatten merges them into a single array.
        return _.flatten( _.pluck( $scope.playlists , 'tracks' ) );
    };


    // Retrieves the single playlist that is currently marked as selected.
    $scope.getCurrentPlaylist = function ( ) {
        // Filters the playlist array to find the item where 'selected' property is true.
        return _.filter( $scope.playlists , function ( playlist ) {
            return playlist.selected;
        } )[ 0 ]; // Returns the first (and should be only) selected playlist.
    };


    // Handles the action of selecting a specific playlist.
    $scope.selectPlaylist = function ( playlist ) {

        // Ensure the main section containing the tracks list is visible to the user.
        $( 'section#main' ).css( { 'visibility' : 'visible' } );

        // Identify any playlist that might currently be selected.
        selected = _.filter( $scope.playlists , function ( playlist ) { return playlist.selected; } );

        // If a playlist was previously selected, unmark it.
        if ( selected.length ) {
            selected[ 0 ].selected = false;
        }

        // Mark the newly passed playlist as selected.
        playlist.selected = true;
    };


    // Toggles the playback state (Play/Stop) of a given track.
    $scope.toggleTrack = function ( track ) {

        // Check if the track's current action is 'Play'.
        if ( track.action == 'Play' ) {

            // Load the specified track into the SoundCloud widget.
            widget.load( track.url , {
                show_artwork  : false ,
                auto_play     : true ,
                show_comments : false ,
                buying        : false ,
                liking        : false ,
                sharing       : false ,
                show_playcount: false ,
                show_user     : false ,
            } );

            // Look for any other track that is currently in a 'Stop' state (i.e., playing).
            anything_playing = _.filter( $scope.getTotalTracks( ) , function ( track ) { return track.action == 'Stop'; } );

            // If another track is found to be playing, reset its status to 'Play'.
            if ( anything_playing.length ) {
                anything_playing[ 0 ].action = 'Play';
                anything_playing[ 0 ].status = '';
            }

            // Update the current track's state to 'Stop' (meaning it's now playing) and set its status.
            track.action = 'Stop';
            track.status = 'playing';

            // Display the player interface element.
            $( '#scplayer' ).fadeIn( );


        } else if ( track.action == 'Stop' ) { // If the track's current action is 'Stop' (meaning it's playing).

            // Pause the SoundCloud widget.
            widget.pause( );

            // Reset the track's action to 'Play' and clear its status.
            track.action = 'Play';
            track.status = '';

            // Hide the player interface element.
            $( '#scplayer' ).fadeOut( );
        }
    };

    // Initiates playback of all tracks within the currently selected playlist.
    $scope.playAllTracks = function ( ) {

        // Retrieve the playlist that is currently active.
        playlist = $scope.getCurrentPlaylist( );

        // Begin playing the first track in the playlist. The 'currentTrack' index is typically 0 initially.
        $scope.toggleTrack( playlist.tracks[ playlist.currentTrack ] );

        // Bind an event listener to the SoundCloud widget to handle track completion.
        widget.bind( SC.Widget.Events.FINISH , function ( ) {
            // Use $scope.$apply to ensure that Angular's digest cycle processes changes after the external event.
            $scope.$apply( $scope.skipTrack( playlist ) );
        } );


    };

    // Advances to the next track in the specified playlist.
    $scope.skipTrack = function ( playlist ) {

        // Increment the current track index to move to the subsequent track.
        playlist.currentTrack = playlist.currentTrack + 1;

        // Play the track at the new current index.
        $scope.toggleTrack( playlist.tracks[ playlist.currentTrack ] );

        // If the end of the playlist is reached (last track played), reset the currentTrack index.
        if ( playlist.currentTrack == playlist.tracks.length - 1 ) {
            $scope.getCurrentPlaylist( ).currentTrack = -1; // Resetting to -1 might signify a state for re-looping or end.
        }
    };

    // Function to add a new track to the currently active playlist.
    $scope.addTrack = function ( ) {
        // Get the playlist that is currently selected.
        playlist = $scope.getCurrentPlaylist( );


        url = ''; // Initialize the URL variable for the new track.
        // The track URL will be resolved via the SoundCloud API.

        // Show a loading indicator on the new track form to provide user feedback.
        $( '#new-track-form .loader' ).fadeIn( );


        // Perform an asynchronous AJAX request to SoundCloud's resolve endpoint.
        $.ajax( {
            url      : 'http://api.soundcloud.com/resolve.json' ,
            type     : 'GET' ,
            dataType : 'jsonp' ,
            data     : { 'url' : $scope.formTrackURL , 'client_id' : CLIENT_ID } ,
            success  : function ( data ) {
                if ( data[ 'kind' ] == 'track' ) {

                    url = newWidgetUrl + data[ 'id' ]; // Construct the widget URL using the resolved track ID.


                    // Manually trigger Angular's digest cycle to update the view after API call.
                    $scope.$apply( function ( ) {
                        // Add the new track object to the playlist's tracks array.
                        playlist.tracks.push( { 'action' : 'Play' , 'title' : $scope.formTrackTitle , 'url' : url } );
                        // Clear the input fields on the form.
                        $scope.formTrackTitle = '';
                        $scope.formTrackURL = '';
                    } );

                    // Hide the loading indicator and fade out the new track form.
                    $( '#new-track-form .loader' ).hide( );
                    $( '#new-track-form' ).fadeOut( );
                }
            } ,
            error    : function ( xhr , textStatus , errorThrown ) {
                alert( errorThrown ); // Display an alert with the error message.
                // Hide the loading indicator and form even if an error occurs.
                $( '#new-track-form .loader' ).hide( );
                $( '#new-track-form' ).fadeOut( );
            }
        } );

    };

    // Allows the user to edit the title of a given track.
    $scope.editTrack = function ( track ) {
        newTitle = prompt( 'Edit Track Title: ' , track.title );
        if ( newTitle ) {
            track.title = newTitle; // Update the track's title if a new one is provided.
        }
    };

    // Deletes a specified track from the currently selected playlist.
    $scope.deleteTrack = function ( track ) {
        // Ask for user confirmation before proceeding with the deletion.
        if ( confirm( 'Are you sure you want to delete "' + track.title + '"?' ) ) {
            // Remove the track from the playlist's tracks array using Underscore.js's _.without method.
            $scope.getCurrentPlaylist( ).tracks = _.without( $scope.getCurrentPlaylist( ).tracks , track );
        }
    };

    // Function to create and add a new playlist.
    $scope.addPlaylist = function ( ) {

        // Ensure the main content section (tracks list) is visible.
        $( 'section#main' ).css( { 'visibility' : 'visible' } );

        // Find any currently selected playlist to unselect it before creating a new one.
        selected = _.filter( $scope.playlists , function ( playlist ) { return playlist.selected; } );
        if ( selected.length ) {
            selected[ 0 ].selected = false;
        }

        // Add a new playlist object to the $scope.playlists array and mark it as selected.
        playlist = $scope.playlists.push( { 'tracks' : [ ] , 'name' : $scope.formPlaylistName , 'description' : $scope.formPlaylistDesc , 'selected' : true } );
        // Clear the input fields for the new playlist form.
        $scope.formPlaylistName = '';
        $scope.formPlaylistDesc = '';

        // Hide the new playlist creation form.
        $( '#new-playlist-form' ).fadeOut( );

    };

    // Allows editing the title of the currently selected playlist.
    $scope.editPlaylistTitle = function ( ) {
        playlist = $scope.getCurrentPlaylist( );
        newTitle = prompt( 'Edit Playlist Title: ' , playlist.name );
        if ( newTitle ) {
            playlist.name = newTitle; // Update the playlist's name if a new title is provided.
        }
    };


    // Allows editing the description of the currently selected playlist.
    $scope.editPlaylistDesc = function ( ) {
        playlist = $scope.getCurrentPlaylist( );
        newDesc = prompt( 'Edit Playlist Description: ' , playlist.description );
        if ( newDesc ) {
            playlist.description = newDesc; // Update the playlist's description if a new one is provided.
        }
    };

    // Deletes the currently selected playlist from the application.
    $scope.deletePlaylist = function ( ) {
        playlist = $scope.getCurrentPlaylist( );
        playlist.selected = false; // Unselect the playlist before attempting deletion.
        if ( confirm( 'Are you sure you want to delete "' + playlist.name + '"?' ) ) {
            // Remove the playlist from the main playlists array using Underscore.js.
            $scope.playlists = _.without( $scope.playlists , playlist );

            // Hide the tracks list section since no playlist is now selected.
            $( 'section#main' ).css( { 'visibility' : 'hidden' } );
        }
    };


    // Saves the current state of all playlists to the browser's local storage.
    $scope.saveLocalStorage = function ( ) {
        localStorage[ 'playlists' ] = JSON.stringify( $scope.playlists );
        alert( 'Saved!' ); // Provide a confirmation message to the user.
    };

    // Resets the playlist data to the initial dummy data set and updates local storage.
    $scope.resetSampleData = function ( ) {
        $scope.playlists = dummy_data;
        // Persist the reset dummy data to local storage.
        localStorage[ 'playlists' ] = JSON.stringify( $scope.playlists );
    };

} // End of PlaylistsController function definition.