var mediaTrackSequencer = new Class(
 {
    // This class handles the management and display of a sequence of audio tracks.
    Implements   : [Preferences, Emitters],

    // Default configuration options for the sequencer.
    preferences      : {
        "style_id"         : "seq_container", // CSS class for the main container element
        unique_id          : null,            // Optional unique ID for the container
        container_node     : null,            // Parent DOM element where the sequencer will be inserted
        media_format       : null,            // Preferred audio format (e.g., "mp3", "ogg")
        entry_list         : [],              // Initial list of track data objects
        supported_codecs   : ["mp3", "opus"], // Codecs this sequencer can handle
        audio_player       : null,            // Reference to the external audio player instance
        
        // Callback function for when an operation fails
        onProcessIssue       : function(err_obj) {
                                dev_log.error("mediaTrackSequencer::onProcessIssue(%o)",err_obj);
                              },
        
        // Callback function for when a track starts playing
        onItemPlay          : function(item_ref) {
                                dev_log.info("mediaTrackSequencer::onItemPlay(%o)",item_ref);
                                // Deactivate all other items and highlight the currently playing one.
                                this.forEachEntry(function(current_entry) {
                                    $(current_entry) && $(current_entry).removeStyleClass("highlighted");
                                });
                                $(item_ref) && $(item_ref).addStyleClass("highlighted")
                              }
    },

    // Internal storage for all managed sound entries, using a Hash map.
    sound_entries        : $H({}),
    
    // Array to hold the generated DOM elements for each track.
    entry_dom_elements   : [],

    // Public method to retrieve the main display element.
    getContainerElement    : function() {
        return this.display_element;
    },

    // Constructor method for initializing the sequencer.
    initialize   : function(init_options) {
        // Log the initialization process for debugging purposes.
        dev_log.debug("mediaTrackSequencer::setup(%o)", init_options);
        
        // Apply user-defined options, overriding defaults.
        this.setPreferences(init_options);
        
        // If no parent container is specified, default to the document body.
        if (this.preferences.container_node === null) {
            this.preferences.container_node = document.body;
        }

        // Initialize an audio capability checker.
        this.audio_capability_checker = new MediaSupportVerifier();
        
        // Verify browser's HTML5 audio support.
        if (!this.audio_capability_checker.verify()) {
            throw("Browser lacks media API support");
        }

        // Determine the optimal audio format if not explicitly set.
        this.current_media_format = this.preferences.media_format ? this.preferences.media_format : this.detectPreferredCodec();
        
        // If no supported format is found, throw an error.
        if (!this.current_media_format) {
            throw("No compatible codec found");
        }

        // Assign the external audio player instance.
        this.audio_player_instance = this.preferences.audio_player;

        // Create the main ordered list element for the sequence.
        this.display_element  = new Element('ol', { 
            unique_id : this.preferences.unique_id ? this.preferences.unique_id : "seq_list-"+ Math.floor(Math.random()*1000000000).toString(16), 
            "class_name" : this.preferences["style_id"] 
        });

        // Populate the sequence with initial tracks.
        this.constructEntryList(this.preferences.entry_list);
        
        // Set up all necessary event listeners.
        this.setupEventHandlers();
                      
    },

    // Iterates over each track in the internal sound_entries hash.
    forEachEntry: function(callback_function) {
        this.sound_entries.each(callback_function);
    },

    // Configures event handlers for player interactions.
    setupEventHandlers: function() {
        dev_log.debug("mediaTrackSequencer::setupEventHandlers()");
        
        // If an audio player is available, attach a listener for playback start.
        if (this.audio_player_instance) {
            this.audio_player_instance.addEventHandler("playback_start", function(current_item) {
                this.triggerEvent("item_play_event", current_item);
            }.bind(this));
        }
        
        return this;
    },

    // Assigns a new audio player instance and re-initializes events.
    assignPlayer: function(player_obj) {
        this.audio_player_instance = player_obj;
        return this.setupEventHandlers();
    },

    // Inserts the sequencer's DOM elements into the specified parent container.
    insertIntoDOM: function() {
        this.preferences.container_node.append(this.display_element);
        this.display_element.adoptAll(this.entry_dom_elements);

        return this;
    },

    // Processes an array of track data to create the playlist.
    constructEntryList: function(entry_array) {
        dev_log.debug("mediaTrackSequencer::constructEntryList(%o)", entry_array);
        
        // Iterate through each item in the provided array.
        entry_array.each(function(single_item) {
            this.addItemToSequence(single_item);
        }.bind(this));
    },

    // Adds a single track to the sequence.
    addItemToSequence : function(item_data) {
        try {
            // Create a new MediaEntry object based on the detected format and track data.
            var entry_obj = new MediaEntry(this.current_media_format, item_data);    
            
            // Store the entry object in the internal hash map.
            this.sound_entries.store(entry_obj.title, entry_obj);
            
            // Generate the corresponding DOM element for this entry.
            this.createEntryElement(entry_obj);
            
            // Add the DOM element to the list of elements for later insertion.
            this.entry_dom_elements.push(entry_obj.dom_node);
        } catch(issue) {
            // Log an error if adding the track fails.
            dev_log.error("Failed to add media item %o: %s", entry_obj, issue);
        }

        return this;       
    },

    // Creates the list item (LI) DOM element for a given media entry.
    createEntryElement : function(media_entry) {
        media_entry.dom_node = new Element('li', {   
            "class_name" : "sequence_item",  
            content    :  media_entry.performer ? media_entry.track_name + " ("+media_entry.performer+")" : media_entry.track_name 
        });
        
        // Store a reference to the MediaEntry object within its DOM node.
        media_entry.dom_node.setMetadata("sequence_item_ref", media_entry);
        
        // Attach click events to the newly created element.
        this.attachEntryEvents(media_entry);
        
        return this;
    },

    // Attaches event listeners to a media entry's DOM element.
    attachEntryEvents: function(entry_item) {
        var self_ref = this; // Capture 'this' for use in event handler.
        
        entry_item.dom_node.addEventHandlers({
            "click" : function() {
                dev_log.info("click detected on %o", this.getMetadata("sequence_item_ref"));
                try {
                    // Pause current playback and start playing the clicked track.
                    self_ref.audio_player_instance.halt().beginPlayback(this.getMetadata("sequence_item_ref"));
                } catch(error_obj) {
                    // Fire a custom event if playback fails.
                    self_ref.triggerEvent("playback_error", { message : error_obj, error_code : "001" , item_ref : this.getMetadata("sequence_item_ref") });
                }
            }           
        });
        return this;
    },

    // Determines the best supported audio format for the browser.
    detectPreferredCodec : function() {
        dev_log.debug("mediaTrackSequencer::detectPreferredCodec()");
        
        // Ensure the capability checker is initialized.
        this.audio_capability_checker = this.audio_capability_checker ? this.audio_capability_checker : new MediaSupportVerifier();
        
        // Iterate through the list of supported codecs to find the first one the browser can play.
        for (var idx = 0; idx < this.preferences.supported_codecs.length; idx++) {
            dev_log.debug("checking codec: " + this.preferences.supported_codecs[idx]);
            
            if (this.audio_capability_checker.verify(this.preferences.supported_codecs[idx])) {
                return this.preferences.supported_codecs[idx];
            }
        }
        // If no supported format is found, implicitly returns undefined.
    },

    // Cleans up a file path/name for display by removing extension, replacing underscores, and decoding URI.
    cleanFileName : function(file_path) {
        // Remove file extension and replace underscores with spaces.
        file_path =  file_path.slice(0,file_path.lastIndexOf(".")).replace(/_/g," ");

        // If the path contains a slash, extract only the filename part.
        if (file_path.includes("/")) {
            file_path = file_path.slice(file_path.lastIndexOf("/") + 1); 
        }

        // Decode any URI-encoded characters.
        return decodeURI(file_path);
    }
 });