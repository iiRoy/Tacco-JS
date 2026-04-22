jQuery(function($) {

    // Global configuration for the external audio streaming service
    const streamServiceApiKeys = ['5371eb9743a8c619876d4e967d558f82', '0dc8789a4e3488e1ba3d798f48b6a5e7'];
    let currentKeyCycleIndex = 0; // Tracks which API key to use next for requests

    // Initialize the streaming client with the first available API key
    SC.initialize({
        client_id: streamServiceApiKeys[currentKeyCycleIndex]
    });

    // Cache jQuery selectors for frequently accessed DOM elements
    const primaryContentGrid = $('#grid');
    const pageHeader = $('#header');
    const searchInputBox = $('#query-input');
    const initialWelcomeDialog = $('#welcome-dialog');

    // Grid layout parameters
    let gridItemColumns = 3; // Number of vertical divisions in the grid
    let gridItemRows = 2;    // Number of horizontal divisions in the grid
    let singleItemWidth = 0; // Calculated display width for each grid item
    let singleItemHeight = 0; // Calculated display height for each grid item
    let totalGridSlots = 0; // Total number of interactive slots within the grid

    // State variables for currently highlighted or active player within the grid
    let highlightedRow = -1; // Row index of the player currently focused by the user
    let highlightedColumn = -1; // Column index of the player currently focused by the user

    // Data storage for fetched tracks and their corresponding DOM elements
    let allRetrievedSoundscapes = []; // Stores all track objects returned by the service
    let gridDisplayElements = []; // Array of objects, each containing references to { audio: $, image: $, title: $ } for a grid cell
    
    // Flag to temporarily disable user interaction with the grid (e.g., during setup or specific modes)
    let interactionTemporarilySuspended = false;

    // Default image to use when a track lacks specific artwork
    const FALLBACK_ARTWORK_URL = "images/default.png";
    // Key used for local storage to remember if the welcome modal has been shown
    const WELCOME_DIALOG_STATUS_KEY = 'modalPreviouslyDisplayed';

    /**
     * Cycles through the available API keys and returns the next one.
     * @returns {string} The API key to be used for the next request.
     */
    const getNextStreamServiceKey = () => {
        const key = streamServiceApiKeys[currentKeyCycleIndex];
        currentKeyCycleIndex = (currentKeyCycleIndex + 1) % streamServiceApiKeys.length;
        return key;
    };

    /**
     * Recalculates and sets the primary layout dimensions based on the current window size.
     */
    const updateLayoutMetrics = () => {
        const currentWindowHeight = $(window).height();
        const headerHeightValue = pageHeader.outerHeight() || 0; // Accurately get header height including padding/border
        
        $('body').height(currentWindowHeight); // Ensure body height matches window for consistent scrolling/layout
        primaryContentGrid.height(currentWindowHeight - headerHeightValue);
        
        singleItemWidth = primaryContentGrid.width() / gridItemColumns;
        singleItemHeight = primaryContentGrid.height() / gridItemRows;
    };

    /**
     * Handler function executed when the window's dimensions change.
     * Updates layout metrics and redistributes grid elements.
     */
    const handleWindowResize = () => {
        updateLayoutMetrics(); // Recalculate main container and item sizes
        positionGridComponents(); // Re-position and size individual grid elements
    };

    // Attach the resize handler to the window's resize event
    $(window).on('resize', handleWindowResize);

    // Perform initial layout setup immediately after script load
    updateLayoutMetrics();

    // Logic governing the display and behavior of the initial welcome modal
    initialWelcomeDialog.on('hide.bs.modal', function () {
        localStorage.setItem(WELCOME_DIALOG_STATUS_KEY, 'true'); // Persist that the user has seen this modal
        // Trigger the initial content load once the modal is dismissed
        retrieveAndRenderTracks("armin van buuren");
        // Log the modal interaction if Google Analytics is available
        if (typeof ga === 'function') ga('send', 'event', 'UserInterface', 'ModalAction', 'WelcomeDialogClosed');
    });

    // Check local storage: if the modal hasn't been displayed before, show it.
    // Otherwise, bypass the modal and load content directly.
    if (localStorage.getItem(WELCOME_DIALOG_STATUS_KEY)) {
        retrieveAndRenderTracks("armin van buuren");
    } else {
        initialWelcomeDialog.modal('show');
    }

    /**
     * Dynamically builds the grid structure with empty player card elements.
     * Each card comprises an image placeholder, a title area, and an audio element.
     */
    const buildEmptyPlayerGrid = () => {
        interactionTemporarilySuspended = false; // Reset interaction lock when rebuilding
        primaryContentGrid.empty(); // Clear any existing content from the grid container
        gridDisplayElements = []; // Reset the array holding references to grid elements

        for (let r = 0; r < gridItemRows; r++) {
            for (let c = 0; c < gridItemColumns; c++) {
                const elementBaseId = `player-unit-${r}-${c}`;
                
                // Create jQuery objects for each part of the player unit
                const playerAudioElement = $('<audio/>').attr({
                    'id': `audio-${elementBaseId}`,
                    'loop': true,      // Audio will loop indefinitely
                    'controls': true,  // Display native audio controls
                    'autoplay': true,  // Automatically start playback
                    'preload': 'auto'  // Suggest browser preloads audio data
                });
                const playerArtworkImage = $('<img/>').attr('id', `artwork-${elementBaseId}`);
                const playerTitleHeader = $('<h2/>').attr('id', `title-${elementBaseId}`);

                // Append these elements to the main grid container
                primaryContentGrid.append(playerArtworkImage, playerTitleHeader, playerAudioElement);

                // Store references for later manipulation
                gridDisplayElements.push({
                    audio: playerAudioElement,
                    image: playerArtworkImage,
                    title: playerTitleHeader
                });
            }
        }
        positionGridComponents(); // Apply correct sizing and positioning to the newly created elements
    };

    /**
     * Removes all player-related elements from the DOM and resets internal data structures.
     */
    const clearAllGridContent = () => {
        primaryContentGrid.empty(); // Remove all children from the grid container
        gridDisplayElements = []; // Clear the array of element references
        allRetrievedSoundscapes = []; // Clear any cached track data
        highlightedRow = -1; // Reset active player indicators
        highlightedColumn = -1;
    };

    /**
     * Handles keyboard input for the search box. Triggers track search upon 'Enter' key.
     */
    searchInputBox.on('keydown', function(event) {
        if (event.key === 'Enter') {
            event.preventDefault(); // Prevent default form submission behavior
            // Log search initiation if Google Analytics is available
            if (typeof ga === 'function') ga('send', 'event', 'SearchFunction', 'QuerySubmitted', 'UserInitiated');
            const userQuery = searchInputBox.val().trim();
            if (userQuery) { // Only proceed if the search query is not empty
                retrieveAndRenderTracks(userQuery);
            }
        }
    });

    /**
     * Toggles the `interactionTemporarilySuspended` flag based on specific key combinations.
     * @param {KeyboardEvent} event The keyboard event object.
     */
    const toggleGridInteractionLock = (event) => {
        // Toggle interaction lock with Shift + 'L' key combination (keycode 76 for 'L')
        if (event.shiftKey && event.which === 76) {
            interactionTemporarilySuspended = !interactionTemporarilySuspended;
            // Log state change if Google Analytics is available
            if (typeof ga === 'function') ga('send', 'event', 'InteractionControl', 'LockToggled', interactionTemporarilySuspended ? 'Enabled' : 'Disabled');
        }
    };

    // Attach the interaction lock toggle to global keypress events
    $(window).on('keypress', toggleGridInteractionLock);
    
    /**
     * Fetches tracks from the streaming service based on a given query and then updates the grid display.
     * @param {string} query The search string to find tracks.
     */
    const retrieveAndRenderTracks = (query) => {
        clearAllGridContent(); // Clear existing content and data
        buildEmptyPlayerGrid(); // Construct a new, empty grid structure

        // Fetch a sufficient number of tracks (e.g., 5x the grid capacity) to ensure enough streamable options
        const maxTracksForFetch = gridItemColumns * gridItemRows * 5; 
        SC.get('/tracks', { q: query, limit: maxTracksForFetch }, function(serviceResponse) {
            if (!serviceResponse || serviceResponse.length === 0) {
                // Inform the user if no tracks were found
                primaryContentGrid.html('<p class="feedback-message">No soundscapes found for your query. Please try a different search term!</p>');
                return;
            }
            // Randomize the order of fetched tracks before populating the grid
            allRetrievedSoundscapes = serviceResponse.sort(() => Math.random() - 0.5);
            populatePlayerUnits(); // Proceed to load the tracks into the grid's player units
        });
    };

    /**
     * Populates the grid's player units with data from the fetched tracks.
     * Ensures only streamable tracks are used and handles cases where fewer tracks are available than grid slots.
     */
    const populatePlayerUnits = () => {
        totalGridSlots = Math.min(gridDisplayElements.length, allRetrievedSoundscapes.length);
        let tracksSuccessfullyAssigned = 0;
        let currentTrackSourceIndex = 0;

        // Loop through available grid slots and assign tracks
        while (tracksSuccessfullyAssigned < totalGridSlots && currentTrackSourceIndex < allRetrievedSoundscapes.length) {
            const currentTrackData = allRetrievedSoundscapes[currentTrackSourceIndex];
            
            // Only assign tracks that are streamable
            if (currentTrackData && currentTrackData.streamable) {
                const targetCell = gridDisplayElements[tracksSuccessfullyAssigned];
                
                // Configure the audio player with source and initial state
                targetCell.audio.attr("src", currentTrackData.stream_url + "?client_id=" + getNextStreamServiceKey());
                targetCell.audio[0].volume = 0; // Start with volume muted
                targetCell.audio[0].play(); // Initiate playback

                // Set the title, making it a clickable link to the track's page
                targetCell.title.html(`<a href="${currentTrackData.permalink_url}" target="_blank">${currentTrackData.title}</a>`);

                // Set the artwork image, preferring a larger size if available
                if (currentTrackData.artwork_url) {                
                    targetCell.image.attr("src", currentTrackData.artwork_url.replace("large", "t500x500"));
                } else {
                    targetCell.image.attr("src", FALLBACK_ARTWORK_URL);
                }
                tracksSuccessfullyAssigned++;
            }
            currentTrackSourceIndex++;
        }

        // If there are more grid slots than assigned tracks, clear the remaining slots
        if (tracksSuccessfullyAssigned < gridDisplayElements.length) {
            for (let i = tracksSuccessfullyAssigned; i < gridDisplayElements.length; i++) {
                gridDisplayElements[i].audio[0].pause(); // Stop any audio that might have loaded
                gridDisplayElements[i].audio.removeAttr('src'); // Remove audio source
                gridDisplayElements[i].title.html('<h2>No Track</h2>'); // Display default title
                gridDisplayElements[i].image.attr('src', FALLBACK_ARTWORK_URL); // Display default artwork
            }
        }
    };

    /**
     * Handles mouseover events within the main grid container.
     * Controls audio volume and visual highlighting based on the hovered grid cell.
     */
    primaryContentGrid.on('mouseover', function(event) {
        if (interactionTemporarilySuspended) {
            return; // Do nothing if interaction is currently locked
        }
        
        // Log hover interaction if Google Analytics is available
        if (typeof ga === 'function') ga('send', 'event', 'PlayerInteraction', 'HoverActivated', 'TrackHighlight');

        // Calculate mouse position relative to the grid container
        const gridContainerOffset = primaryContentGrid.offset();
        const mouseRelativeX = event.clientX - gridContainerOffset.left;
        const mouseRelativeY = event.clientY - gridContainerOffset.top;

        // Determine the grid cell coordinates based on mouse position
        const hoveredGridRow = Math.max(0, Math.min(Math.floor(mouseRelativeY / singleItemHeight), gridItemRows - 1));
        const hoveredGridColumn = Math.max(0, Math.min(Math.floor(mouseRelativeX / singleItemWidth), gridItemColumns - 1));

        // Only update if the mouse has moved to a different cell
        if (hoveredGridRow !== highlightedRow || hoveredGridColumn !== highlightedColumn) {
            const currentHoveredCellIndex = hoveredGridRow * gridItemColumns + hoveredGridColumn;
            const targetCell = gridDisplayElements[currentHoveredCellIndex];

            // Activate the hovered player if it has a valid audio source
            if (targetCell && targetCell.audio[0].src) { 
                targetCell.audio[0].volume = 1; // Set volume to full
                targetCell.image.addClass("active-artwork"); // Add visual highlight to artwork
                targetCell.title.addClass("active-title"); // Add visual highlight to title
            }
            
            deactivateOtherPlayers(hoveredGridRow, hoveredGridColumn); // Mute and de-highlight all other players

            highlightedRow = hoveredGridRow; // Update the state of the currently highlighted cell
            highlightedColumn = hoveredGridColumn;
        }
    });

    /**
     * Mutes all audio players and removes active visual classes from their elements,
     * except for the player located at the specified row and column.
     * @param {number} rowToExclude The row index of the player to keep active.
     * @param {number} colToExclude The column index of the player to keep active.
     */
    const deactivateOtherPlayers = (rowToExclude, colToExclude) => {
        const excludedPlayerIndex = rowToExclude * gridItemColumns + colToExclude;

        gridDisplayElements.forEach((cell, index) => {
            if (index !== excludedPlayerIndex) {
                cell.audio[0].volume = 0; // Mute the audio player
                cell.image.removeClass("active-artwork"); // Remove artwork highlight
                cell.title.removeClass("active-title"); // Remove title highlight
            }
        });
    };

    /**
     * Iterates through all grid components (images, titles, audio players)
     * and sets their dimensions and absolute positions based on calculated grid item sizes.
     */
    const positionGridComponents = () => {
        gridDisplayElements.forEach((cell, index) => {
            const rowIndex = Math.floor(index / gridItemColumns);
            const colIndex = index % gridItemColumns;

            const xPosition = colIndex * singleItemWidth;
            const yPosition = rowIndex * singleItemHeight;

            // Set dimensions and position for the artwork image
            cell.image.css({
                width: singleItemWidth,
                height: singleItemHeight,
                position: 'absolute',
                top: yPosition + 'px',
                left: xPosition + 'px'
            });

            // Calculate positions for title and audio player relative to the image/cell
            const imageRenderedHeight = cell.image.height();
            const audioPlayerRenderedHeight = cell.audio.height(); // Get actual height of the audio player element

            // Position the title at the top of the cell
            cell.title.css({
                position: 'absolute',
                top: yPosition + 'px',
                left: xPosition + 'px',
                width: singleItemWidth + 'px',
                padding: '5px', // Add internal padding for better appearance
                'box-sizing': 'border-box' // Ensure padding is included in the width
            });

            // Position the audio player at the bottom of the cell
            cell.audio.css({
                position: 'absolute',
                top: (yPosition + imageRenderedHeight - audioPlayerRenderedHeight) + 'px',
                left: xPosition + 'px',
                width: singleItemWidth + 'px'
            });
        });
    };
});