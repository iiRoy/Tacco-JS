$( function ( ) {

  // SC api key definitions. These are used for authenticating with SoundCloud.
  var client_id = [ '5371eb9743a8c619876d4e967d558f82', '0dc8789a4e3488e1ba3d798f48b6a5e7' ] ;


  // Initialize the SoundCloud API with one of the provided client IDs.
  SC.initialize ( {
    client_id : client_id [ 0 ]
  } ) ;


  // Set initial dimensions for the document and the grid container.
  // The grid will take up the remaining height after the header.
  $ ( document ).height ( $ ( window ).height ( ) ) ;
  $ ( "#grid" ).height ( $ ( document ).height ( ) - $ ( "#header" ).height ( ) ) ;


  // Configuration variables for the grid layout.
  var numCols = 3 ; // Specifies the number of columns in our audio grid.
  var numRows = 2 ; // Specifies the number of rows in our audio grid.
  var numPlayers ; // This will hold the total count of active audio players in the grid.


  // Variables to track the currently active (hovered) audio player's position.
  var curRow = -1 ; // Default to -1, indicating no row is active.
  var curCol = -1 ; // Default to -1, indicating no column is active.


  // Calculate the dimensions for each individual audio card based on grid size.
  var audioWidth = $ ( "#grid" ).width ( ) / numCols ;
  var audioHeight = $ ( "#grid" ).height ( ) / numRows ;


  // Data structures to hold various elements and states.
  var allTracks = [ ] ; // Array to store all fetched track objects from SoundCloud.
  var audioTags = [ ] ; // Array to store references to all HTML <audio> elements.
  var h2s = [ ] ; // Array to store references to all HTML <h2> elements (for track titles).
  var imgs = [ ] ; // Array to store references to all HTML <img> elements (for track artwork).


  var locked = false ; // A flag to control mouseover events; if true, hover effects are disabled.


  // Event listener for when the introduction modal is hidden.
  // This is typically triggered after the user acknowledges the intro.
  $ ( '#intro-modal' ).on ( 'hide.bs.modal', function ( e ) {
    localStorage.setItem ( 'intromodal', true ) ; // Persist the modal's shown state in local storage.
    addTracks ( "armin van buuren" ) ; // Start loading tracks after modal dismissal.
  } ) ;


  // Check if the introduction modal has been shown previously.
  if ( localStorage.getItem ( "intromodal" ) ) {
    // If it has been shown before, proceed directly to loading tracks.
    addTracks ( "armin van buuren" ) ;
  } else {
    // If it's the first visit, display the introduction modal.
    $ ( "#intro-modal" ).modal ( 'show' ) ;
  }


  // Event handlers for window and document resizing.
  // These ensure the grid layout adjusts dynamically.
  $ ( window ).resize ( function ( ) {
    handleResizing ( ) ;
  } ) ;

  $ ( document ).resize ( function ( ) {
    handleResizing ( ) ;
  } ) ;


  /**
   * Adjusts the grid and audio card dimensions when the browser window is resized.
   * This ensures responsive layout of the audio players.
   */
  function handleResizing ( ) {
    $ ( document ).height ( $ ( window ).height ( ) ) ; // Update document height.
    $ ( "#grid" ).height ( $ ( document ).height ( ) - $ ( "#header" ).height ( ) ) ; // Adjust grid height.
    audioWidth = $ ( "#grid" ).width ( ) / numCols ; // Recalculate individual card width.
    audioHeight = $ ( "#grid" ).height ( ) / numRows ; // Recalculate individual card height.
    setCardSize ( ) ; // Apply new dimensions to all cards.
  }


  // The following lines are commented out as they are examples or for debugging.
  // addTracks("armin van buuren");
  // addTracks("dada life");


  /**
   * Dynamically constructs the grid of audio players, images, and title placeholders.
   * Initially, these elements are empty and will be populated with track data later.
   */
  function builGrid ( ) {
    console.log ( "building grid" ) ; // Log activity for debugging.
    locked = false ; // Ensure the mouseover lock is reset when rebuilding the grid.

    var i = 0,
      j = 0 ; // Loop counters for rows and columns.

    var grid = $ ( "#grid" ) ; // Reference to the main grid container.

    // Loop through each row to create grid elements.
    for ( i = 0 ; i < numRows ; i ++ ) {
      // Loop through each column within the current row.
      for ( j = 0 ; j < numCols ; j ++ ) {
        // Create a new audio element with a unique ID.
        var audio = $ ( '<audio/>' ).attr ( 'id', 'widget' + i + j ) ;
        // Create a new image element with a unique ID.
        var image = $ ( '<img/>' ).attr ( "id", "img" + i + j ) ;
        // Create a new h2 element for the track title.
        var h2 = $ ( '<h2/>' ) ;

        // Set attributes for the audio player for basic functionality.
        audio.attr ( "loop", "true" ) ; // Audio will loop indefinitely.
        audio.attr ( "controls", "true" ) ; // Display native audio controls.
        audio.attr ( "autoplay", "true" ) ; // Audio will start playing automatically.

        // Set the initial dimensions for the image placeholder.
        image.width ( audioWidth ) ;
        image.height ( audioHeight ) ;

        // Append the created elements to the grid container.
        grid.append ( image ) ;
        grid.append ( h2 ) ;
        grid.append ( audio ) ;

        // Store the audio element reference in our global array.
        audioTags.push ( audio ) ;
      }
    }

    setCardSize ( ) ; // After building, ensure all card sizes are correctly applied.
  }


  /**
   * Cleans up the DOM by removing existing audio, image, and h2 elements.
   * Also resets global arrays and current row/column trackers.
   */
  function cleanUp ( ) {
    $ ( "audio" ).remove ( ) ; // Remove all audio elements from the DOM.
    $ ( "img" ).remove ( ) ; // Remove all image elements.
    $ ( "h2" ).remove ( ) ; // Remove all h2 elements.

    // Clear the arrays holding references to these elements.
    audioTags = [ ] ;
    h2s = [ ] ;
    imgs = [ ] ;

    // Reset current row and column trackers.
    var curRow = 0 ;
    var curCol = 0 ;
  }


  // Event handler for the search input field.
  // Triggers a search when the 'Enter' key is pressed.
  $ ( '#searchterm' ).keypress ( function ( event ) {
    if ( event.which == 13 ) {
      ga ( 'send', 'event', 'input', 'search' ) ; // Google Analytics tracking for search.
      event.preventDefault ( ) ; // Prevent default form submission.
      var q = $ ( "#searchterm" ).val ( ) ; // Get the search query from the input field.
      addTracks ( q ) ; // Initiate track search and display.
    }

  } ) ;


  /**
   * Toggles the 'locked' state based on a specific key combination (Shift + L).
   * When locked, mouseover events for audio control are temporarily disabled.
   * @param {Event} event - The keyboard event object.
   */
  function handleLocking ( event ) {
    if ( event.shiftKey && event.which == 76 ) {
      // If Shift key is pressed along with 'L' (key code 76), toggle lock state.
      locked = ! locked ; // Invert the boolean value of 'locked'.
    }
  }


  // Global keypress listener to detect the locking command.
  $ ( window ).keypress ( function ( event ) {
    ga ( 'send', 'event', 'input', 'locking' ) ; // GA tracking for locking action.
    handleLocking ( event ) ; // Process the keypress for locking functionality.
  } ) ;


  /**
   * Resets the grid, rebuilds it, and then fetches new tracks based on a query.
   * @param {string} q - The search query for SoundCloud tracks.
   */
  function addTracks ( q ) {
    cleanUp ( ) ; // First, remove all existing track elements.
    builGrid ( ) ; // Then, reconstruct an empty grid structure.

    // Fetch tracks from SoundCloud using the provided query.
    SC.get ( '/tracks', {
      q : q,
      limit : 5 * numCols * numRows
    }, function ( tracks ) {
      // Randomize the order of fetched tracks for variety.
      tracks.sort ( function ( ) {
        return 0.5 - Math.random ( ) ;
      } ) ;
      allTracks = tracks ; // Store the randomized tracks globally.
      loadTracks ( ) ; // Proceed to load these tracks into the grid.
    } ) ;
  }


  /**
   * Populates the created audioTags with actual track data from the `allTracks` array.
   * Handles streamability checks and sets up track URLs, volumes, and artwork.
   */
  function loadTracks ( ) {
    // Determine how many players will be active, limited by available tracks or grid size.
    numPlayers = Math.min ( audioTags.length, allTracks.length ) ;
    var tracksAdded = 0 ; // Counter for successfully added tracks.
    var i = 0 ; // General loop counter.

    // Loop until enough tracks are added or all available tracks/players are exhausted.
    while ( tracksAdded < numPlayers ) {
      var thisTrack = allTracks.pop ( ) ; // Get the last track from the randomized list.
      if ( thisTrack && thisTrack.streamable === true ) { // Check if the track exists and is streamable.
        console.log ( thisTrack ) ; // Log the track details for debugging.
        var audio = audioTags [ tracksAdded ] ; // Get the audio element placeholder.
        // Set the stream URL, appending client ID for authentication.
        audio.attr ( "src", thisTrack.stream_url + "?client_id=" + client_id [ tracksAdded % 2 ] ) ;
        audio [ 0 ].volume = 0 ; // Initialize volume to 0 (muted).
        audio [ 0 ].play ( ) ; // Start playing the audio (it will be muted initially).

        // Populate the h2 tag with a linked track title.
        $ ( h2s [ tracksAdded ] ).append ( "<a href='" + thisTrack.permalink_url + "' target='_blank'>" + thisTrack.title + "</a>" ) ;

        // Set the track artwork, using a default image if none is provided.
        if ( thisTrack.artwork_url ) {
          // Replace 'large' with 't500x500' for a higher resolution image.
          imgs [ tracksAdded ].src = thisTrack.artwork_url.replace ( "large", "t500x500" ) ;
        } else {
          imgs [ tracksAdded ].src = "images/default.png" ; // Default image path.
        }
        tracksAdded ++ ; // Increment the count of successfully added tracks.
      }
      i ++ ; // Increment general counter, even if track wasn't streamable.
      // Emergency break to prevent infinite loop if no streamable tracks are found
      if (i > allTracks.length + numPlayers) break;
    }
  }


  // Mouseover event handler for the main grid container.
  // This controls which audio player is active (unmuted) based on cursor position.
  $ ( "#grid" ).mouseover ( function ( data ) {
    if ( ! locked ) { // Only proceed if the locking mechanism is not active.
      ga ( 'send', 'event', 'input', 'playtrack' ) ; // GA tracking for track playback via hover.
      // song is not locked, we change the current mute status
      // based on hover
      var x = data.clientX ; // Get the horizontal coordinate of the mouse.
      var y = data.clientY - $ ( "#search" ).height ( ) ; // Get vertical coordinate, adjusted for search bar height.

      // Calculate the row and column based on mouse position and card dimensions.
      var row = Math.max ( Math.min ( Math.floor ( y / audioHeight ), numRows - 1 ), 0 ) ;
      var col = Math.min ( Math.floor ( x / audioWidth ), numCols - 1 ) ;

      console.log ( row, col ) ; // Log the current row and column for debugging.

      // Unmute the audio player at the calculated position.
      $ ( "#widget" + row + col ) [ 0 ].volume = 1 ;
      // Add 'active' class to the corresponding image and h2 for visual feedback.
      imgs.eq ( row * numCols + col ).addClass ( "active" ) ;
      h2s.eq ( row * numCols + col ).addClass ( "active" ) ;

      muteEverythingElse ( row, col ) ; // Mute all other audio players.

      curRow = row ; // Update the current active row.
      curCol = col ; // Update the current active column.
    }
  } ) ;


  /**
   * Mutes all audio players except the one specified by the given row and column.
   * Also removes the 'active' class from other elements.
   * @param {number} row - The row index of the player to keep unmuted.
   * @param {number} col - The column index of the player to keep unmuted.
   */
  function muteEverythingElse ( row, col ) {
    var i ; // Loop counter.

    // If invalid coordinates are passed, simply remove 'active' classes from all.
    if ( row < 0 || col < 0 ) {
      for ( i = 0 ; i < audioTags.length ; i ++ ) {
        if ( imgs [ i ].hasClass ( "active" ) ) {
          imgs [ i ].removeClass ( "active" ) ;
          h2s.eq ( i ).removeClass ( "active" ) ;
        }
      }
      return ; // Exit the function.
    }

    // Iterate through all audio players.
    for ( i = 0 ; i < audioTags.length ; i ++ ) {
      // If the current player is not the one to keep unmuted.
      if ( i != row * numCols + col ) {
        audioTags [ i ] [ 0 ].volume = 0 ; // Mute this player.
        // If it has an 'active' class, remove it.
        if ( imgs.eq ( i ).hasClass ( "active" ) ) {
          imgs.eq ( i ).removeClass ( "active" ) ;
          h2s.eq ( i ).removeClass ( "active" ) ;
        }
      }
    }
  }


  /**
   * Sets the correct dimensions and positioning for all track cards (images, titles, and players).
   * This function is called on initial load and after resizing events.
   */
  function setCardSize ( ) {
    h2s = $ ( "h2" ) ; // Re-select all h2 elements.
    imgs = $ ( "img" ) ; // Re-select all img elements.

    i = 0 ; // Initialize row counter.
    j = 0 ; // Initialize column counter.

    // Iterate over each image element to apply styling.
    $ ( "img" ).each ( function ( ) {
      $ ( this ).width ( audioWidth ) ; // Set width of the image.
      $ ( this ).height ( audioHeight ) ; // Set height of the image.

      var imgHeight = $ ( this ).height ( ) ; // Get the actual height of the image.
      var position = $ ( this ).position ( ) ; // Get the current position of the image.
      var positionTop = ( position.top ) ; // Extract the top position.
      // Calculate the top position for the audio player, placing it below the image.
      var playerTop = position.top + imgHeight - $ ( audioTags [ i ] ).height ( ) ;

      // Apply absolute positioning and dimensions to the h2 element.
      $ ( h2s [ i ] ).css ( {
        "position" : "absolute",
        "top" : positionTop + "px",
        "left" : j * audioWidth + "px",
        "width" : audioWidth + "px"
      } ) ;
      // Apply absolute positioning and dimensions to the audio player element.
      $ ( audioTags [ i ] ).css ( {
        "position" : "absolute",
        "top" : playerTop + "px",
        "left" : j * audioWidth + "px",
        "width" : audioWidth + "px"
      } ) ;
      i ++ ; // Increment overall card counter.
      j ++ ; // Increment column counter.
      if ( j >= numCols ) {
        j = 0 ; // Reset column counter if it exceeds the number of columns.
      }
    } ) ;
  }

} ) ;