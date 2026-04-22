Shiva = {}; /* Global namespace initialization. */


Shiva.constants = {
    PAUSED: 'PAUSED', // Playback status indicating paused state.
    PLAYING: 'PLAYING', /* Playback status indicating active playback. */
    LOADING: 'LOADING',    // Playback status indicating content is loading.
    EMPTY: 'EMPTY'         // Playback status when no content is loaded.
}; // End of Shiva.constants object definition.


/*
 * This object holds the currently active album data.
 * Currently, it's a simple placeholder for future enhancements.
 */
Shiva.ActiveAlbum = {
    album: null
};


Shiva.Controllers = {

    /**
     * Controller for the artist list view.
     * Fetches a list of artists and updates the UI.
     *
     * @param {Object} $scope - AngularJS scope.
     * @param {Object} $http - AngularJS HTTP service.
     */
    ArtistList: function ( $scope , $http ) {

        /*
         * Make an HTTP GET request to retrieve artist data from the API.
         * On successful retrieval, populate the scope with artist items.
         */
        $http . get ( '/api/artists' ) . success ( function ( data ) {
            $scope . artists = data . items;
            // Workaround: Directly manipulating the DOM, ideally this would be handled by Angular.
            document . getElementById ( 'artistname' ) . innerHTML = 'Music Player';
            document . getElementsByTagName ( 'title' ) [ 0 ] . innerHTML = 'Shiva &raquo; Music Player';
        } ); // End of success callback.

        // Check if a timeUpdateHandler is already attached to the audio player.
        if ( Shiva . Player . audio . timeUpdateHandler ) {
            // If so, remove it to prevent multiple listeners.
            Shiva . Player . audio . removeEventListener ( 'timeupdate' , Shiva . Player . audio . timeUpdateHandler , false );
        }
    }, // End of ArtistList controller.

    /**
     * Controller for a single artist's view, potentially including album and song details.
     *
     * @param {Object} $scope - AngularJS scope.
     * @param {Object} $http - AngularJS HTTP service.
     * @param {Object} $routeParams - AngularJS route parameters service.
     */
    Artist: function ( $scope , $http , $routeParams ) {

        var artistSlug = $routeParams . artistSlug , // Slug for the current artist.
            songSlug = $routeParams . songSlug ,     // Slug for a specific song, if provided.
            found = false ,                          // Flag to indicate if a song/album was found.
            x = 0;                                   // Loop counter.


        // Proceed only if an artist slug is present in the route parameters.
        if ( artistSlug ) {
            $http . get ( '/api/artists/' + artistSlug + '?fulltree=true' ) . success ( function ( data ) {
                $scope . artist = data; // Assign the fetched artist data to the scope.
                if ( songSlug ) {
                    x = data . albums . length; // Initialize loop counter with the number of albums.
                    while ( x && !found ) { // Iterate through albums until song is found or all albums checked.
                        if ( data . albums [ x - 1 ] . slug === songSlug ) {
                            $scope . album = data . albums [ x - 1 ]; // Set the found album to scope.
                            found = true; // Mark as found.
                        }
                        x -= 1; // Decrement counter.
                    }
                } else {
                    $scope . album = data . albums [ 0 ]; // Default to the first album if no song slug.
                }
                // NOTE: This is a direct DOM manipulation. It should ideally be handled by Angular data binding.
                document . getElementById ( 'artistname' ) . innerHTML = data . name;
                document . getElementsByTagName ( 'title' ) [ 0 ] . innerHTML = 'Shiva &raquo; ' + data . name;
            } ); // End of success callback for artist data.


            // Setup audio player events.
            if ( !Shiva . Player . audio . timeUpdateHandler ) {
                Shiva . Player . audio . timeUpdateHandler = function () {
                    Shiva . Playlist . update (); // Update the playlist state.
                    $scope . $apply ( function () {
                        $scope . player = Shiva . Player; // Update player data on scope.
                    } );
                }
            }
            // Add event listener for time updates.
            Shiva . Player . audio . addEventListener ( 'timeupdate' , Shiva . Player . audio . timeUpdateHandler , false );
            // Add event listener for when metadata is loaded.
            Shiva . Player . audio . addEventListener ( 'loadedmetadata' , function () {
                Shiva . Playlist . setMetadata (); // Set playlist metadata.
                $scope . $apply ( function () {
                    $scope . player = Shiva . Player; // Update player data on scope.
                } );
            } , false );
        }

        // Assign playlist and player objects to the scope for view access.
        $scope . playlist = Shiva . Playlist;
        $scope . player = Shiva . Player;
        // $scope . activeAlbum = Shiva . ActiveAlbum; // This line is commented out in the original.
    } // End of Artist controller.
} // End of Shiva.Controllers.


/*
 * Shiva.Playlist object manages the current playback queue,
 * including tracks, playback configuration, and navigation.
 */
Shiva . Playlist = {
    tracks: [] , // Array to store the list of tracks in the playlist.

    index: 0 , // Current track index in the playlist.

    config: {
        repeat: false , // Boolean: if true, playlist repeats when it ends.
        mimetype: 'audio/ogg' // Default MIME type for audio files.
    } ,

    /**
     * Checks if the player is currently playing.
     * @returns {boolean} True if playing, false otherwise.
     */
    isPlaying: function () {
        return Shiva . Player . isPlaying ();
    } ,

    /**
     * Updates the time display and progress bar based on current playback time.
     */
    timeUpdate: function () {
        var mins = ~~( Shiva . Player . currentTime / 60 ) , // Calculate minutes.
            secs = ( Shiva . Player . currentTime % 60 ) . toFixed () + '' , // Calculate seconds and convert to string.
            timeline = document . getElementById ( 'timeelapsed' ) , // Get the time elapsed display element.
            playedPercent = ( ( Shiva . Player . currentTime / Shiva . Player . duration ) * 100 ) + "%"; // Calculate percentage played.

        secs = ( secs . length < 2 ) ? "0" + secs : secs; // Pad seconds with a leading zero if necessary.

        if ( timeline ) {
            timeline . innerHTML = mins + ':' + secs; // Update time display.
            document . getElementById ( 'progressbar' ) . style . width = playedPercent + '%'; // Update progress bar width.
        }
    } ,

    /**
     * Adds all tracks from a given album to the playlist.
     * @param {Object} album - The album object containing tracks.
     * @returns {number} The index in the playlist of the first track added from this album.
     */
    addAlbum: function ( album ) {
        var track = null , // Temporary variable for a single track.
            tracks = album . tracks , // Array of tracks from the album.
            max = tracks . length , // Total number of tracks in the album.
            x = max; // Loop counter, starting from max.

        while ( x-- ) { // Loop backwards through tracks.
            track = tracks [ ( max - x ) - 1 ]; // Get track in forward order using reverse loop.

            this . addOne ( track ); // Add the track to the playlist.

            console . log ( 'Adding "' + tracks [ ( max - x ) - 1 ] . title + '" to playlist' ); // Log the addition.
        }

        // Return the index of the first track of the album in the playlist.
        return this . tracks . length - tracks . length;
    } ,

    /**
     * Delegates setting metadata to the Shiva.Player object.
     */
    setMetadata: function () {
        Shiva . Player . setMetadata ();
    } ,

    /**
     * Delegates updating player state to the Shiva.Player object.
     */
    update: function () {
        Shiva . Player . update ();
    } ,

    /**
     * Adds a single track to the playlist.
     * If no track is currently set in Shiva.Player, it sets this new track as the current one.
     * @param {Object} track - The track object to add.
     */
    addOne: function ( track ) {
        this . tracks = this . tracks . concat ( track ); // Append the track to the tracks array.
        if ( !Shiva . Player . track ) { // If no track is currently loaded in the player.
            Shiva . Player . setTrack ( track ); // Set this newly added track as the player's current track.
        }
    } ,

    /**
     * Removes a track from the playlist at a given index.
     * Handles playback state if the removed track was the current one.
     * @param {number} index - The index of the track to remove.
     */
    removeTrack: function ( index ) {
        var thisTrack = this . index === index , // Is the removed track the currently playing one?
            lastTrack = index === this . tracks . length - 1 , // Is the removed track the last one in the playlist?
            wasPlaying = this . isPlaying; // Store current playing status.

        this . tracks . splice ( index , 1 ); // Remove the track from the array.

        if ( thisTrack ) { // If the removed track was the current one.
            if ( lastTrack ) { // If it was also the last track.
                this . index = 0; // Reset index to the beginning.
            }

            this . stop (); // Stop playback.
            if ( this . tracks . length ) { // If there are still tracks left.
                if ( this . config . loop ) { // If looping is enabled (NOTE: 'loop' not defined in config).
                    this . reload (); // Reload the current (or new) track.
                    if ( !wasPlaying ) { // If it wasn't playing before removal.
                        this . pause (); // Keep it paused.
                    }
                } else {
                    this . load (); // Load the next track. (NOTE: 'load' not defined in playlist).
                }
            }
        }
        if ( this . stopAt === index ) { // If there was a stop point set for this index.
            this . stopAt = -1; // Reset stop point.
        }
    } ,

    /**
     * Starts playback from a specific track index or the beginning.
     * @param {number} [index=0] - The index of the track to start playing.
     */
    play: function ( index ) {
        if ( !this . isPlaying () ) { // Only play if not already playing.
            this . index = index || 0; // Set index, defaulting to 0.
            Shiva . Player . setTrack ( this . tracks [ this . index ] ); // Set the track in the player.
            Shiva . Player . play (); // Start playing.
        }
    } ,

    /**
     * Resumes playback if currently paused and tracks are available.
     */
    resume: function () {
        if ( !this . isPlaying () && this . tracks . length ) { // If not playing and playlist is not empty.
            console . info ( 'Resuming playback' ); // Log resume action.
            Shiva . Player . play (); // Resume playback.
        }
    } ,

    /**
     * Plays the next song in the playlist.
     * Handles playlist end based on the 'repeat' configuration.
     */
    next: function () {
        /*
         * This function advances to the next song in the playback queue.
         * If the end of the playlist is reached, it either loops back to the start
         * (if Shiva.Playlist.config.repeat is true) or stops playback.
         */
        var _playing = this . isPlaying (); // Store current playing status.

        // Check if the playlist has reached its end.
        if ( this . index == this . tracks . length - 1 ) {
            this . index = 0; // Reset to the first track.
            if ( this . config . repeat == false ) { // If repeating is off.
                _playing = false; // Stop playback.
                Shiva . Player . pause (); // Explicitly pause the player.
            }
        } else {
            this . index = this . index + 1; // Move to the next track.
        }

        if ( _playing ) { // If playback should continue.
            Shiva . Player . setTrack ( this . tracks [ this . index ] ); // Set the new track.
            Shiva . Player . play (); // Start playing the new track.
        }
    } ,

    /**
     * Plays the previous song in the playlist.
     * Handles playlist beginning based on the 'repeat' configuration.
     */
    prev: function () {
        var _playing = this . isPlaying (); // Store current playing status.

        if ( this . index == 0 ) { // If currently at the first track.
            this . index = this . tracks . length - 1; // Go to the last track.
            if ( this . config . repeat == false ) { // If repeating is off.
                _playing = false; // Stop playback.
            }
        } else {
            this . index = this . index - 1; // Go to the previous track.
        }

        if ( _playing ) { // If playback should continue.
            Shiva . Player . setTrack ( this . tracks [ this . index ] ); // Set the new track.
            Shiva . Player . play (); // Start playing the new track.
        }
    } ,

    /**
     * Pauses the current playback if it's active.
     */
    pause: function () {
        if ( this . isPlaying () ) { // If player is currently playing.
            Shiva . Player . pause (); // Delegate pause action to Shiva.Player.
        }
    } ,

    /**
     * Stops playback and clears the audio source.
     */
    stop: function () {
        Shiva . Player . pause (); // Pause the player.
        Shiva . src = ''; // Clear the audio source. (NOTE: Shiva.src not defined).
    } ,

    /**
     * Sets the globally active track.
     * @param {Object} track - The track object to set as current.
     */
    setCurrentTrack: function ( track ) {
        // This function seems to be referencing a non-existent Shiva.CurrentTrack.
        // It might be a placeholder or an unused piece of code.
        Shiva . CurrentTrack . track = track;
    } ,

    /**
     * Sets the globally active album.
     * @param {Object} album - The album object to set as active.
     */
    setActiveAlbum: function ( album ) {
        Shiva . ActiveAlbum . album = album; // Update the Shiva.ActiveAlbum object.
    }
}; // End of Shiva.Playlist object.


/*
 * Shiva.Player object manages the actual audio playback
 * using the HTML5 Audio API.
 */
Shiva . Player = {
    track: null , // Currently loaded track object.

    audio: new Audio () , // HTML5 Audio element instance.

    bitrate: 0 , // Bitrate of the current track.

    playbackStatus: Shiva . constants . EMPTY , // Current playback status (e.g., EMPTY, PAUSED, PLAYING).

    elapsed: {
        minutes: 0 , // Elapsed minutes.
        seconds: '00' , // Elapsed seconds (string, padded).
        percent: 0 // Percentage of track played.
    } ,

    duration: {
        minutes: 0 , // Total duration in minutes.
        seconds: '00' // Total duration in seconds (string, padded).
    } ,

    /**
     * Checks if the player's status is currently PLAYING.
     * @returns {boolean} True if playing, false otherwise.
     */
    isPlaying: function () {
        return this . playbackStatus === Shiva . constants . PLAYING;
    } ,

    /**
     * Sets a new track for playback.
     * Loads the audio source and updates player status.
     * @param {Object} track - The track object to load.
     */
    setTrack: function ( track ) {
        var mime = Shiva . Playlist . config . mimetype , // Get configured MIME type.
            path = track . files [ mime ]; // Get the audio file path for the specified MIME type.

        if ( path . substr ( 0 , 1 ) === '/' ) { // If path is relative.
            path = '/api' + path; // Prepend '/api' for API endpoint access.
        }

        this . track = track; // Store the current track object.
        this . bitrate = track . bitrate; // Store the track's bitrate.
        this . audio . src = path; // Set the audio element's source.
        this . audio . load (); // Load the audio.
        this . playbackStatus = Shiva . constants . PAUSED; // Set status to paused after loading.
    } ,

    /**
     * Sets the duration metadata of the current track.
     * This is typically called after 'loadedmetadata' event.
     */
    setMetadata: function () {
        var _seconds = ( this . audio . duration % 60 ) . toFixed (); // Calculate seconds from total duration.

        this . duration . minutes = ~~( this . audio . duration / 60 ); // Calculate minutes from total duration.
        this . duration . seconds = ( _seconds . length < 2 ) ? "0" + _seconds : _seconds; // Pad seconds.
    } ,

    /**
     * Updates the elapsed time and percentage of the current track.
     * This is typically called on 'timeupdate' event.
     */
    update: function () {
        var _seconds = ( this . audio . currentTime % 60 ) . toFixed () + ''; // Calculate current seconds.

        this . elapsed . minutes = ~~( this . audio . currentTime / 60 ); // Calculate current minutes.
        this . elapsed . seconds = ( _seconds . length < 2 ) ? "0" + _seconds : _seconds; // Pad seconds.
        this . elapsed . percent = ( this . audio . currentTime / this . audio . duration ) * 100; // Calculate percentage.
    } ,

    /**
     * Toggles play/pause state of the current track.
     */
    togglePlay: function () {
        if ( this . track ) { // Only toggle if a track is loaded.
            if ( this . isPlaying () ) { // If currently playing.
                this . pause (); // Pause it.
            } else { // If currently paused or stopped.
                this . play (); // Play it.
            }
        } else {
            console . log ( 'DERP' ); // Log an error if no track is loaded.
        }
    } ,

    /**
     * Starts playback of the current track.
     */
    play: function () {
        console . info ( 'Playing "' + this . track . title + '"' ); // Log the playing track.
        this . playbackStatus = Shiva . constants . PLAYING; // Set status to playing.
        this . audio . play (); // Start HTML5 audio playback.
    } ,

    /**
     * Pauses playback of the current track.
     */
    pause: function () {
        console . log ( 'Pausing' ); // Log the pause action.
        this . playbackStatus = Shiva . constants . PAUSED; // Set status to paused.
        this . audio . pause (); // Pause HTML5 audio playback.
    }
}; // End of Shiva.Player object.


// Add an event listener to the audio element for when a track finishes.
Shiva . Player . audio . addEventListener ( 'ended' , function () {
    Shiva . Playlist . next (); // When a track ends, play the next one in the playlist.
} , false );


// AngularJS dependency injection annotations for controllers.
Shiva . Controllers . ArtistList . $inject = [ '$scope' , '$http' ];
Shiva . Controllers . Artist . $inject = [ '$scope' , '$http' , '$routeParams' ];