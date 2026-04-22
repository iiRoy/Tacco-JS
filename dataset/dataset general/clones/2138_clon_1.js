/*
 * This file defines the mtAudioPlaylist class,
 * which manages an HTML5 audio playlist.
 *
 * It utilizes MooTools' Class, Options, and Events systems.
 */
var mtAudioPlaylist = new Class({
    // MooTools mixins for options and event handling.
    Implements: [
        Options,
        Events
    ],

    // Default configuration options for the playlist.
    options: {
        "class": "mtAPlaylist",     // CSS class for the playlist container.
        id: false,                  // Optional ID for the playlist container.
        parent: null,               // Parent element to inject the playlist into (defaults to document.body).
        format: false,              // Preferred audio format, or automatically determined.
        tracks: [],                 // Initial array of track data.
        formats: ["ogg", "mp3"],    // Supported audio formats in order of preference.
        player: null,               // Reference to the audio player instance.

        // Callback function for when an operation fails.
        onFailure: function(e) {
            dbug.error("mtAudioPlaylsit::onFailure(%o)", e);
        },

        // Callback function for when a track starts playing.
        onPlay: function(track) {
            dbug.log("mtAudioPlaylist::onPlay(%o)", track);

            // Deactivate all other tracks in the UI.
            this.each(function(t) {
                $(t) && $(t).removeClass("active");
            });

            // Activate the currently playing track in the UI.
            $(track) && $(track).addClass("active");
        }
    },

    // A hash (MooTools $H) to store track objects by name.
    tracks: $H({}),

    // An array to hold references to the DOM elements for each track.
    trackElems: [],

    /**
     * Returns the main DOM element of the playlist.
     * @returns {Element} The playlist's main element.
     */
    toElement: function() {
        return this.element;
    },

    /**
     * Constructor for the mtAudioPlaylist class.
     * Initializes the playlist, checks for audio support, and sets up tracks.
     * @param {Object} ops - Configuration options.
     */
    initialize: function(ops) {
        // Log initialization.
        dbug.log("mtAudioPlaylist::initialize(%o)", ops);

        // Apply provided options, merging with defaults.
        this.setOptions(ops);

        // Set parent to document.body if not specified.
        if (this.options.parent == null) {
            this.options.parent = document.body;
        }

        // Initialize audio capability checker.
        this.soundCheck = new AudioCheck();

        // Throw an error if HTML5 audio is not supported.
        if (!this.soundCheck.check()) {
            throw ("HTML5 audio is not supported");
        }

        // Determine the audio format to use.
        this.format = this.options.format ? this.options.format : this.determineFormat();

        // Throw an error if no supported format is found.
        if (!this.format) {
            throw ("No supported format found");
        }

        // Assign the player instance.
        this.player = this.options.player;

        // Create the main ordered list element for the playlist.
        // Generates a random ID if not provided.
        this.element = new Element('ol', {
            id: this.options.id ? this.options.id : "mtaudio-playlist-" + Math.floor(Math.random() * 1000000000).toString(16),
            "class": this.options["class"]
        });

        // Populate the playlist with initial tracks.
        this.makePlayList(this.options.tracks);

        // Set up event listeners.
        this.initEvents();
    },

    /**
     * Iterates over each track in the playlist.
     * @param {Function} fnc - The callback function to execute for each track.
     */
    each: function(fnc) {
        this.tracks.each(fnc);
    },

    /**
     * Initializes event listeners, particularly for the player's 'play' event.
     * @returns {mtAudioPlaylist} This instance for chaining.
     */
    initEvents: function() {
        dbug.log("mtAudioPlaylist::initEvents()");

        // If a player exists, add an event listener for 'play'.
        this.player && this.player.addEvent("play", function(t) {
            // Fire the playlist's own 'play' event when the player plays a track.
            this.fireEvent("play", t);
        }.bind(this)); // Bind 'this' to the playlist instance.

        return this; // Enable method chaining.
    },

    /**
     * Sets the audio player instance for the playlist.
     * @param {Object} p - The audio player object.
     * @returns {mtAudioPlaylist} This instance for chaining.
     */
    setPlayer: function(p) {
        this.player = p;
        // Re-initialize events to bind to the new player.
        return this.initEvents();
    },

    /**
     * Injects the playlist's DOM element into its parent.
     * @returns {mtAudioPlaylist} This instance for chaining.
     */
    inject: function() {
        // Grab the playlist element and put it into the parent.
        this.options.parent.grab(this.element);
        // Adopt all track elements into the playlist's main element.
        this.element.adopt(this.trackElems);

        return this; // Enable method chaining.
    },

    /**
     * Creates the playlist from an array of track data.
     * @param {Array} arr - An array of track data objects.
     */
    makePlayList: function(arr) {
        dbug.log("mtAudioPlaylist::makePlaylist(%o)", arr);
        var track; // Declared but not used explicitly here, likely a remnant.

        // Iterate over the input array and add each track.
        arr.each(function(t) {
            this.addTrack(t);
        }.bind(this)); // Bind 'this' to the playlist instance.
    },

    /**
     * Adds a single track to the playlist.
     * @param {Object} track - The track data object.
     * @returns {mtAudioPlaylist} This instance for chaining.
     */
    addTrack: function(track) {
        try {
            // Create a new mtTrack instance.
            var t = new mtTrack(this.format, track);
            // Store the track in the tracks hash by its name.
            this.tracks.set(t.name, t);
            // Create the DOM element for the track.
            this.makeTrackElem(t);
            // Add the track's element to the list of track elements.
            this.trackElems.push(t.elem);
        } catch (e) {
            // Log any errors encountered during track addition.
            dbug.error("Unable to add track %o: %s", t, e);
        }

        return this; // Enable method chaining.
    },

    /**
     * Creates the DOM element for a given track.
     * @param {Object} track - The track object.
     * @returns {mtAudioPlaylist} This instance for chaining.
     */
    makeTrackElem: function(track) {
        // Create an 'li' element for the track.
        track.elem = new Element('li', {
            "class": "track",
            html: track.artist ? track.name + " (" + track.artist + ")" : track.name
        });
        // Store the track object directly on its DOM element.
        track.elem.store("track", track);
        // Add click events to the track element.
        this.addTrackEvents(track);
        return this; // Enable method chaining.
    },

    /**
     * Adds event listeners (e.g., click) to a track's DOM element.
     * @param {Object} track - The track object.
     * @returns {mtAudioPlaylist} This instance for chaining.
     */
    addTrackEvents: function(track) {
        var my = this; // Capture 'this' for use inside the event handler.

        // Add a click event to the track's element.
        track.elem.addEvents({
            "click": function() {
                // Log the click event.
                dbug.log("caught click on %o", this.retrieve("track"));
                try {
                    // Pause current playback and play the clicked track.
                    my.player.pause().play(this.retrieve("track"));
                } catch (e) {
                    // Fire a failure event if playback fails.
                    my.fireEvent("failure", {
                        msg: e,
                        code: "1",
                        track: this.retrieve("track")
                    });
                }
            }
        });
        return this; // Enable method chaining.
    },

    /**
     * Determines the best audio format supported by the browser.
     * Iterates through preferred formats and checks with AudioCheck.
     * @returns {string|null} The supported format string (e.g., "ogg", "mp3") or null if none found.
     */
    determineFormat: function() {
        dbug.log("mtAudioPlaylist::determineFormat()");
        // Ensure soundCheck is initialized.
        this.soundCheck = this.soundCheck ? this.soundCheck : new AudioCheck();

        // Loop through configured formats to find the first supported one.
        for (var i = 0; i < this.options.formats.length; i++) {
            dbug.log("checking " + this.options.formats[i]);
            if (this.soundCheck.check(this.options.formats[i])) {
                return this.options.formats[i]; // Return the first supported format.
            }
        }
        return null; // No supported format found.
    },

    /**
     * Formats a raw file name into a display-friendly track name.
     * Removes file extension, replaces underscores with spaces, and handles paths.
     * @param {string} f - The raw file path/name.
     * @returns {string} The formatted track name.
     */
    formatName: function(f) {
        // Remove file extension and replace underscores with spaces.
        f = f.substring(0, f.lastIndexOf(".")).replace(/_/g, " ");

        // If a path is present, extract only the file name.
        if (f.indexOf("/")) {
            f = f.substring(f.lastIndexOf("/") + 1);
        }

        // Decode URI components to handle encoded characters.
        return decodeURI(f);
    }
});