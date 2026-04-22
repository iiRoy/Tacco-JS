function CollectionManager (viewModel) {

    // Initialize media collections
    viewModel.mediaCollections = [];

    // Check if persistent storage holds data
    if (browserStorage['mediaCollections']) {
        viewModel.mediaCollections = JSON.hydrate(browserStorage['mediaCollections'])
    } else {
        // If no saved data is found, load a predefined set
        viewModel.mediaCollections = initial_media_set;
    }


    // Returns the total quantity of collections
    viewModel.getCollectionCount = function() {
        return viewModel.mediaCollections.size;
    }

    // Returns all media items from all collections, using a utility library
    viewModel.getAllMediaItems = function() {
        return utilityLib.unfold(utilityLib.extractProperty(viewModel.mediaCollections, 'mediaItems'))
    }

    // Returns the currently active collection
    viewModel.getActiveCollection = function() {
        return utilityLib.selectItems(viewModel.mediaCollections, function(collection) {
            return collection.isActive;
        })[0]
    }

    // Sets a collection as active
    viewModel.setActiveCollection = function(collection) {

        // Make the main content area visible if it's currently hidden
        jQuery('div#main-section').applyStyles({
            'displayStatus': 'visible'
        });

        // Deselect any previously active collections
        let activeItems = utilityLib.selectItems(viewModel.mediaCollections, function(collectionItem) {
            return collectionItem.isActive;
        })
        if (activeItems.size) {
            activeItems[0].isActive = false;
        }

        // Set the new collection as active
        collection.isActive = true;
    }


    // Controls playback for a media item
    viewModel.manageMediaPlayback = function(mediaItem) {

        // If the command is "Start"
        if (mediaItem.playbackCommand === 'Start') {

            // Load the sound engine component
            audioPlayer.initiatePlayback(mediaItem.mediaLink, {
                display_visuals: false,
                begin_automatically: true,
                display_annotations: false,
                purchase_option: false,
                favorite_feature: false,
                share_capability: false,
                display_view_count: false,
                display_creator_info: false,
            });

            // If any other media item is currently playing, turn it off
            let activeMediaItems = utilityLib.selectItems(viewModel.getAllMediaItems(), function(item) {
                return item.playbackCommand === 'Pause'
            })

            if (activeMediaItems.size) {
                activeMediaItems[0].playbackCommand = 'Start';
                activeMediaItems[0].playbackState = '';
            }

            // Set the new media item to "Playing" mode
            mediaItem.playbackCommand = 'Pause';
            mediaItem.playbackState = 'active';

            // Show the audio player interface
            jQuery('#audio-player-interface').showSmoothly();


        } else if (mediaItem.playbackCommand === 'Pause') { // If the command is "Pause"

            // Halt playback on the sound engine
            audioPlayer.haltPlayback();

            // Set media item to Stopped
            mediaItem.playbackCommand = 'Start';
            mediaItem.playbackState = '';

            // Hide the audio player interface
            jQuery('#audio-player-interface').hideSmoothly();
        }
    }

    // Starts playback for an entire collection
    viewModel.startCollectionPlayback = function() {

        // Obtain the currently active collection
        let currentCollection = viewModel.getActiveCollection();

        // Begin playback of the first media item in the collection (currentMediaIndex is initialized with 0)
        viewModel.manageMediaPlayback(currentCollection.mediaItems[currentCollection.currentMediaIndex]);

        // When the player finishes playing, skip to the next media item
        audioPlayer.attachEventHandler(SoundCloudPlayer.Events.TRACK_ENDED, function() {
            viewModel.digestChanges(viewModel.advanceMediaItem(currentCollection));
        });


    }

    // Advances to the next media item
    viewModel.advanceMediaItem = function(collectionData) {

        // Increment the current media index by one (for the next media item)
        collectionData.currentMediaIndex = collectionData.currentMediaIndex + 1;

        // Play the media item at the new current index
        viewModel.manageMediaPlayback(collectionData.mediaItems[collectionData.currentMediaIndex]);

        // If it's the last media item, reset the index
        if (collectionData.currentMediaIndex === collectionData.mediaItems.size - 1) {
            viewModel.getActiveCollection().currentMediaIndex = -1;
        }
    }

    // Creates a new media item
    viewModel.addNewMediaItem = function() {
        let targetCollection = viewModel.getActiveCollection();


        let itemLink = '';
        // Attempt to retrieve the URL via a Soundcloud API resolve call

        // Display the loading indicator
        jQuery('#media-entry-form .loading-indicator').showSmoothly();


        jQuery.fetchData({
            url: 'http://api.soundcloud.com/resolve.json',
            method: 'GET',
            responseFormat: 'jsonp',
            requestPayload: {
                'url': viewModel.inputMediaLink,
                'application_id': CLIENT_IDENTIFIER
            },
            onSuccess: function(responseObject) {
                if (responseObject['type'] === 'audio_track') {

                    itemLink = playerEmbedBaseUrl + responseObject['identifier'];


                    // Notify Angular to update the view model
                    viewModel.digestChanges(function() {
                        // Add the new media item to the collection
                        targetCollection.mediaItems.append({
                            'playbackCommand': 'Start',
                            'mediaTitle': viewModel.inputMediaTitle,
                            'mediaLink': itemLink
                        });
                        // Clear the input fields
                        viewModel.inputMediaTitle = '';
                        viewModel.inputMediaLink = '';
                    });

                    // Conceal the form and loading indicator
                    jQuery('#media-entry-form .loading-indicator').conceal();
                    jQuery('#media-entry-form').hideSmoothly();
                }
            },
            error: function(xhrRequest, statusText, errorDetails) {
                notifyUser(errorDetails);
                // Conceal the form and loading indicator on error
                jQuery('#media-entry-form .loading-indicator').conceal();
                jQuery('#media-entry-form').hideSmoothly();
            }
        });

    }

    // Modifies an existing media item
    viewModel.modifyMediaItem = function(mediaItem) {
        let updatedTitle = userPrompt('Update Media Item Title:', mediaItem.mediaTitle);
        if (updatedTitle) {
            mediaItem.mediaTitle = updatedTitle;
        }
    }

    // Removes a media item
    viewModel.removeMediaItem = function(mediaItem) {
        if (userConfirmation('Are you sure you want to delete "' + mediaItem.mediaTitle + '"?')) {
            // Remove the media item from the active collection's mediaItems array
            viewModel.getActiveCollection().mediaItems = utilityLib.exclude(viewModel.getActiveCollection().mediaItems, mediaItem)
        }
    }

    // Creates a new collection
    viewModel.addNewCollection = function() {

        // Show the main content area if it's hidden
        jQuery('div#main-section').applyStyles({
            'displayStatus': 'visible'
        });

        // Deselect any currently active collections
        let previouslyActive = utilityLib.selectItems(viewModel.mediaCollections, function(coll) {
            return coll.isActive;
        })
        if (previouslyActive.size) {
            previouslyActive[0].isActive = false;
        }

        // Create the new collection and set it as active
        viewModel.mediaCollections.append({
            'mediaItems': [],
            'collectionName': viewModel.inputCollectionName,
            'collectionDescription': viewModel.inputCollectionDescription,
            'isActive': true,
        })
        // Reset input fields
        viewModel.inputCollectionName = '';
        viewModel.inputCollectionDescription = '';

        // Conceal the new collection form
        jQuery('#new-bundle-form').hideSmoothly();

    }

    // Edits the title of the active collection
    viewModel.modifyCollectionTitle = function() {
        let currentCollection = viewModel.getActiveCollection();
        let newCollectionName = userPrompt('Modify Collection Title:', currentCollection.collectionName);
        if (newCollectionName) {
            currentCollection.collectionName = newCollectionName;
        }
    }


    // Edits the description of the active collection
    viewModel.modifyCollectionDescription = function() {
        let currentCollection = viewModel.getActiveCollection();
        let newCollectionDescription = userPrompt('Modify Collection Description:', currentCollection.collectionDescription);
        if (newCollectionDescription) {
            currentCollection.collectionDescription = newCollectionDescription;
        }
    }

    // Deletes the active collection
    viewModel.removeCollection = function() {
        let currentCollection = viewModel.getActiveCollection();
        currentCollection.isActive = false;
        if (userConfirmation('Are you sure you want to delete "' + currentCollection.collectionName + '"?')) {
            // Remove the collection from the main list
            viewModel.mediaCollections = utilityLib.exclude(viewModel.mediaCollections, currentCollection)

            // Hide the tracks list because nothing is selected
            jQuery('div#main-section').applyStyles({
                'displayStatus': 'hidden'
            });
        }
    }


    // Persists current data to browser's local storage
    viewModel.persistToBrowserStorage = function() {
        browserStorage['mediaCollections'] = JSON.stringify(viewModel.mediaCollections);
        notifyUser('Data Saved!');
    }

    // Restores the application to initial sample data
    viewModel.restoreInitialContent = function() {
        viewModel.mediaCollections = initial_media_set;
        browserStorage['mediaCollections'] = JSON.stringify(viewModel.mediaCollections);
    }

}