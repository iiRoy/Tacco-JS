( function( $ ) {
// Enforce strict mode for cleaner code and fewer silent errors.
	'use strict' ;

	/*
	 * This is the main jQuery plugin entry point.
	 * It targets all audio elements that have the 'controls' attribute.
	 * For each such element, it executes a function to create a custom player.
	 */
	$ ( 'audio[controls]' ) . before ( function ( ) {

		// Store the current audio element instance.
		var song = this ;
		// Disable the native browser controls for the audio element.
		song . controls = false ;

		// Create the main container for the custom player.
		var player_box = document . createElement ( 'div' ) ;
		// Add classes to the player box for styling, inheriting from the original audio element.
		$ ( player_box ) . addClass ( $ ( song ) . attr ( 'class' ) + ' well container-fluid playa' ) ;


		// Create a section to hold additional data (e.g., album art, track info).
		var data_sec = document . createElement ( 'section' ) ;
		// Initialize the data section as collapsed.
		$ ( data_sec ) . addClass ( 'collapse' ) ;

		// Create a holder for the data toggle button.
		var toggle_holder = document . createElement ( 'div' ) ;
		// Add styling classes to the toggle holder.
		$ ( toggle_holder ) . addClass ( 'btn-group row-fluid' ) ;

		// Create the button to toggle the data section.
		var data_toggle = document . createElement ( 'a' ) ;
		// Set the HTML content for the toggle button (an icon).
		$ ( data_toggle ) . html ( '<i class="icon-reorder"></i>' ) ;
		// Add styling classes to the toggle button.
		$ ( data_toggle ) . addClass ( 'btn btn-block' ) ;
		// Set an initial opacity for visual effect.
		$ ( data_toggle ) . attr ( 'style' , 'opacity:0.3' ) ;
		// Attach a click handler to toggle the data section's visibility.
		$ ( data_toggle ) . click ( function ( ) { $ ( data_sec ) . collapse ( 'toggle' ) ; } ) ;
		// Set the title attribute for the tooltip.
		$ ( data_toggle ) . attr ( 'title' , 'Details' ) ;
		// Initialize Bootstrap tooltip for the button.
		$ ( data_toggle ) . tooltip ( { 'container' : 'body' , 'placement' : 'top' , 'html' : true } ) ;
		// Append the toggle button to its holder.
		$ ( toggle_holder ) . append ( data_toggle ) ;


		// Create a table to display track metadata.
		var data_table = document . createElement ( 'table' ) ;
		// Add styling classes to the data table.
		$ ( data_table ) . addClass ( 'table table-condensed' ) ;

		// Create a section for the main player controls.
		var player = document . createElement ( 'section' ) ;
		// Add styling classes to the player section.
		$ ( player ) . addClass ( 'btn-group row-fluid' ) ;


		/*
		 * Function to handle and display loading errors.
		 */
		var load_error = function ( ) {
			console . log ( 'error' ) ; // Log the error to console.
			$ ( player_box ) . find ( '.btn' ) . addClass ( 'disabled' ) ; // Disable all buttons.
			$ ( player_box ) . find ( 'input[type="range"]' ) . hide ( ) ; // Hide range inputs (seek, volume).
			$ ( player_box ) . find ( '.icon-spin' ) . text ( 'Error' ) ; // Change spinner text to 'Error'.
			$ ( player_box ) . find ( '.icon-spin' ) . parent ( ) . attr ( 'title' , 'There was an error loading the audio.' ) ; // Set tooltip title.
			$ ( player_box ) . find ( '.icon-spin' ) . parent ( ) . tooltip ( 'fixTitle' ) ; // Update tooltip display.
			$ ( player_box ) . find ( '.icon-spin' ) . removeClass ( 'icon-spinner icon-spin' ) ; // Remove spinner animation.
		} ;


		/*
		 * Function to add the play/pause button to the player.
		 */
		var addPlay = function ( ) {
			var play = document . createElement ( 'button' ) ; // Create the button element.
			$ ( play ) . addClass ( 'btn disabled span1' ) ; // Add styling classes and disable initially.

			// Define a method on the play button to set its state (play/pause).
			play . setPlayState = function ( toggle ) {
				$ ( play ) . removeClass ( 'disabled' ) ; // Enable the button.
				if ( toggle === 'play' ) {
					$ ( play ) . html ( '<i class="icon-play"></i>' ) ; // Set play icon.
					$ ( play ) . off ( 'click' ) . click ( function ( ) { // Remove previous click handlers and add new one.
						song . play ( ) ; // Play the audio.
					} ) ;
				}
				if ( toggle === 'pause' ) {
					$ ( play ) . html ( '<i class="icon-pause"></i>' ) ; // Set pause icon.
					$ ( play ) . off ( 'click' ) . click ( function ( ) { // Remove previous click handlers and add new one.
						song . pause ( ) ; // Pause the audio.
					} ) ;
				}
			} ;

			// Attach event listeners to the song object to update the play button state.
			$ ( song ) . on ( 'play' , function ( ) { play . setPlayState ( 'pause' ) ; } ) ;
			$ ( song ) . on ( 'canplay' , function ( ) { play . setPlayState ( 'play' ) ; } ) ;
			$ ( song ) . on ( 'pause' , function ( ) { play . setPlayState ( 'play' ) ; } ) ;

			var timeout = 0 ; // Initialize a timeout counter for loading check.
			var loadCheck = setInterval ( function ( ) { // Start an interval to check song loading status.
				if ( isNaN ( song . duration ) === false ) { // If duration is a number, song is loaded.
					play . setPlayState ( 'play' ) ; // Set button to play state.
					clearInterval ( loadCheck ) ; // Stop the interval.
					return true ; // Indicate success.
				}
				// If network state is 3 (NETWORK_NO_SOURCE) or timeout reached.
				if ( song . networkState === 3 || timeout === 75 ) {
					load_error ( ) ; // Call error handler.
					clearInterval ( loadCheck ) ; // Stop the interval.
					return false ; // Indicate failure.
				}
				timeout++ ; // Increment timeout counter.
			} , 50 ) ; // Check every 50 milliseconds.

			$ ( player ) . append ( play ) ; // Append the play button to the player section.
		} ;


		/*
		 * Function to add the seek (progress) bar to the player.
		 */
		var addSeek = function ( ) {
			var seek = document . createElement ( 'input' ) ; // Create an input element for the seek bar.
			$ ( seek ) . attr ( { // Set attributes for the seek bar.
				'type' : 'range' ,
				'min' : 0 ,
				'value' : 0 ,
				'class' : 'seek'
			} ) ;

			// Method to update the background of the seek bar to show progress and buffered ranges.
			seek . progress = function ( ) {
				var bg = 'rgba(223, 240, 216, 1) 0%' ; // Initial background for played portion.
				bg += ', rgba(223, 240, 216, 1) ' + ( ( song . currentTime / song . duration ) * 100 ) + '%' ;
				bg += ', rgba(223, 240, 216, 0) ' + ( ( song . currentTime / song . duration ) * 100 ) + '%' ;

				// Iterate through buffered ranges to draw them.
				for ( var i = 0 ; i < song . buffered . length ; i++ ) {
					if ( song . buffered . end ( i ) > song . currentTime && isNaN ( song . buffered . end ( i ) ) === false && isNaN ( song . buffered . start ( i ) ) === false ) {
						var bufferedstart ;
						var bufferedend ;
						if ( song . buffered . end ( i ) < song . duration ) {
							bufferedend = ( ( song . buffered . end ( i ) / song . duration ) * 100 ) ;
						}
						else {
							bufferedend = 100 ;
						}
						if ( song . buffered . start ( i ) > song . currentTime ) {
							bufferedstart = ( ( song . buffered . start ( i ) / song . duration ) * 100 ) ;
						}
						else {
							bufferedstart = ( ( song . currentTime / song . duration ) * 100 ) ;
						}
						bg += ', rgba(217, 237, 247, 0) ' + bufferedstart + '%' ;
						bg += ', rgba(217, 237, 247, 1) ' + bufferedstart + '%' ;
						bg += ', rgba(217, 237, 247, 1) ' + bufferedend + '%' ;
						bg += ', rgba(217, 237, 247, 0) ' + bufferedend + '%' ;
					}
				}
				$ ( seek ) . css ( 'background' , '-webkit-linear-gradient(left, ' + bg + ')' ) ; // Apply Webkit gradient.
				// These may be re-enabled when/if other browsers support the background like webkit
				// $ ( seek ) . css ( 'background' , '-o-linear-gradient(left,  ' + bg + ')' ) ;
				// $ ( seek ) . css ( 'background' , '-moz-linear-gradient(left,  ' + bg + ')' ) ;
				// $ ( seek ) . css ( 'background' , '-ms-linear-gradient(left,  ' + bg + ')' ) ;
				// $ ( seek ) . css ( 'background' , 'linear-gradient(to right,  ' + bg + ')' ) ;
				$ ( seek ) . css ( 'background-color' , '#ddd' ) ; // Fallback background color.
			} ;

			// Method to set the seek bar's value to the current song time.
			seek . set = function ( ) {
				$ ( seek ) . val ( song . currentTime ) ;
				seek . progress ( ) ;
			} ;

			// Method to update the song's current time based on the seek bar's value.
			seek . slide = function ( ) {
				song . currentTime = $ ( seek ) . val ( ) ;
				seek . progress ( ) ;
			} ;

			// Method to initialize the seek bar's max value and step based on song duration.
			seek . init = function ( ) {
				$ ( seek ) . attr ( {
					'max' : song . duration ,
					'step' : song . duration / 100
				} ) ;
				seek . set ( ) ;
			} ;

			// Method to reset the seek bar and song position (e.g., when song ends).
			seek . reset = function ( ) {
				$ ( seek ) . val ( 0 ) ;
				song . currentTime = $ ( seek ) . val ( ) ;
				if ( ! song . loop ) { song . pause ( ) ; } // Pause if not looping.
				else { song . play ( ) ; } // Play if looping.
			} ;

			var seek_wrapper = document . createElement ( 'div' ) ; // Create a wrapper for the seek bar.
			$ ( seek_wrapper ) . addClass ( 'btn disabled span4' ) ; // Add styling classes and disable.

			$ ( seek_wrapper ) . append ( seek ) ; // Append the seek bar to its wrapper.
			$ ( seek ) . on ( 'change' , seek . slide ) ; // Attach change event to update song time.

			// Attach event listeners to the song object to update the seek bar.
			$ ( song ) . on ( 'timeupdate' , seek . init ) ;
			$ ( song ) . on ( 'loadedmetadata' , seek . init ) ;
			$ ( song ) . on ( 'loadeddata' , seek . init ) ;
			$ ( song ) . on ( 'progress' , seek . init ) ;
			$ ( song ) . on ( 'canplay' , seek . init ) ;
			$ ( song ) . on ( 'canplaythrough' , seek . init ) ;
			$ ( song ) . on ( 'ended' , seek . reset ) ;

			if ( song . readyState > 0 ) { // If song is already loaded, initialize seek bar.
				seek . init ( ) ;
			}
			$ ( player ) . append ( seek_wrapper ) ; // Append the seek bar wrapper to the player section.
		} ;


		/*
		 * Function to add the time display (current time / duration) to the player.
		 */
		var addTime = function ( ) {
			var time = document . createElement ( 'a' ) ; // Create an anchor element for time display.
			$ ( time ) . addClass ( 'btn span3' ) ; // Add styling classes.
			$ ( time ) . tooltip ( { 'container' : 'body' , 'placement' : 'right' , 'html' : true } ) ; // Initialize tooltip.

			// Helper function to format a number as two digits (e.g., 5 -> "05").
			time . twodigit = function ( myNum ) {
				return ( "0" + myNum ) . slice ( -2 ) ;
			} ;

			// Helper function to convert seconds into a formatted time string (MM:SS or HH:MM:SS).
			time . timesplit = function ( a ) {
				if ( isNaN ( a ) ) { return '<i class="icon-spinner icon-spin"></i>' ; } // Show spinner if time is not a number.
				var hours = Math . floor ( a / 3600 ) ;
				var minutes = Math . floor ( a / 60 ) - ( hours * 60 ) ;
				var seconds = Math . floor ( a ) - ( hours * 3600 ) - ( minutes * 60 ) ;
				var timeStr = time . twodigit ( minutes ) + ':' + time . twodigit ( seconds ) ;
				if ( hours > 0 ) {
					timeStr = hours + ':' + timeStr ;
				}
				return timeStr ;
			} ;

			// Method to update the displayed time and tooltip.
			time . showtime = function ( ) {
				$ ( time ) . html ( time . timesplit ( song . duration ) ) ; // Display total duration by default.
				$ ( time ) . attr ( { 'title' : 'Click to Reset<hr style="padding:0; margin:0;" />Position: ' + ( time . timesplit ( song . currentTime ) ) } ) ;
				if ( ! song . paused ) { // If song is playing, display current time.
					$ ( time ) . html ( time . timesplit ( song . currentTime ) ) ;
					$ ( time ) . attr ( { 'title' : 'Click to Reset<hr style="padding:0; margin:0;" />Length: ' + ( time . timesplit ( song . duration ) ) } ) ;
				}
				$ ( time ) . tooltip ( 'fixTitle' ) ; // Update tooltip content.
			} ;

			$ ( time ) . click ( function ( ) { // Attach click handler to reset song position.
				song . pause ( ) ;
				song . currentTime = 0 ;
				time . showtime ( ) ;
				$ ( time ) . tooltip ( 'fixTitle' ) ;
				$ ( time ) . tooltip ( 'show' ) ;
			} ) ;

			$ ( time ) . tooltip ( 'show' ) ; // Show tooltip initially.

			// Attach event listeners to the song object to update time display.
			$ ( song ) . on ( 'loadedmetadata' , time . showtime ) ;
			$ ( song ) . on ( 'loadeddata' , time . showtime ) ;
			$ ( song ) . on ( 'progress' , time . showtime ) ;
			$ ( song ) . on ( 'canplay' , time . showtime ) ;
			$ ( song ) . on ( 'canplaythrough' , time . showtime ) ;
			$ ( song ) . on ( 'timeupdate' , time . showtime ) ;

			if ( song . readyState > 0 ) { // If song is already loaded, show time.
				time . showtime ( ) ;
			}
			else {
				$ ( time ) . html ( '<i class="icon-spinner icon-spin"></i>' ) ; // Show spinner if not loaded.
			}
			$ ( player ) . append ( time ) ; // Append the time display to the player section.
		} ;


		/*
		 * Function to add the mute button to the player.
		 */
		var addMute = function ( ) {
			var mute = document . createElement ( 'button' ) ; // Create the mute button.
			$ ( mute ) . addClass ( 'btn span1' ) ; // Add styling classes.

			// Method to check and update the mute button's icon based on volume/mute state.
			mute . checkVolume = function ( ) {
				if ( song . volume > 0.5 && ! song . muted ) {
					$ ( mute ) . html ( '<i class="icon-volume-up"></i>' ) ; // High volume icon.
				} else if ( song . volume < 0.5 && song . volume > 0 && ! song . muted ) {
					$ ( mute ) . html ( '<i class="icon-volume-down"></i>' ) ; // Low volume icon.
				} else {
					$ ( mute ) . html ( '<i class="icon-volume-off"></i>' ) ; // Muted icon.
				}
			} ;

			$ ( mute ) . click ( function ( ) { // Attach click handler to toggle mute state.
				if ( song . muted ) {
					song . muted = false ;
					song . volume = song . oldvolume ; // Restore previous volume.
				} else {
					song . muted = true ;
					song . oldvolume = song . volume ; // Save current volume before muting.
					song . volume = 0 ;
				}
				mute . checkVolume ( ) ; // Update button icon.
			} ) ;

			mute . checkVolume ( ) ; // Set initial icon.
			$ ( song ) . on ( 'volumechange' , mute . checkVolume ) ; // Update icon on volume change.
			$ ( player ) . append ( mute ) ; // Append the mute button to the player section.
		} ;


		/*
		 * Function to add the volume control slider to the player.
		 */
		var addVolume = function ( ) {
			var volume = document . createElement ( 'input' ) ; // Create an input element for volume slider.
			$ ( volume ) . attr ( { // Set attributes for the volume slider.
				'type' : 'range' ,
				'min' : 0 ,
				'max' : 1 ,
				'step' : 1 / 100 ,
				'value' : 1
			} ) ;

			// Method to update song volume based on slider value.
			volume . slide = function ( ) {
				song . muted = false ; // Unmute when volume is adjusted.
				song . volume = $ ( volume ) . val ( ) ;
			} ;

			// Method to set slider value based on current song volume.
			volume . set = function ( ) {
				$ ( volume ) . val ( song . volume ) ;
			} ;

			var vol_wrapper = document . createElement ( 'div' ) ; // Create a wrapper for the volume slider.
			$ ( vol_wrapper ) . addClass ( 'btn disabled span3' ) ; // Add styling classes and disable.

			$ ( vol_wrapper ) . append ( volume ) ; // Append the volume slider to its wrapper.
			$ ( volume ) . on ( "change" , volume . slide ) ; // Attach change event to update song volume.
			$ ( song ) . on ( 'volumechange' , volume . set ) ; // Update slider on song volume change.
			$ ( player ) . append ( vol_wrapper ) ; // Append the volume slider wrapper to the player section.
		} ;


		/*
		 * Function to add album art to the data section.
		 */
		var addAlbumArt = function ( ) {
			var albumArt = document . createElement ( 'img' ) ; // Create an image element.
			$ ( albumArt ) . addClass ( 'thumbnail' ) ; // Add styling class.
			$ ( albumArt ) . attr ( 'src' , $ ( song ) . data ( 'infoAlbumArt' ) ) ; // Set image source from data attribute.
			$ ( data_sec ) . append ( albumArt ) ; // Append album art to data section.
		} ;


		/*
		 * Function to add a row of information (title and data) to the data table.
		 * @param {string} title - The title for the table header.
		 * @param {string} dataId - The data attribute key to retrieve the information.
		 */
		var addInfo = function ( title , dataId ) {
			var row = document . createElement ( 'tr' ) ; // Create a table row.
			var head = document . createElement ( 'th' ) ; // Create a table header cell.
			var data = document . createElement ( 'td' ) ; // Create a table data cell.
			$ ( head ) . html ( title ) ; // Set header text.
			$ ( data ) . html ( $ ( song ) . data ( dataId ) ) ; // Set data cell content from data attribute.
			$ ( row ) . append ( head ) ; // Append header to row.
			$ ( row ) . append ( data ) ; // Append data cell to row.
			$ ( data_table ) . append ( row ) ; // Append row to data table.
		} ;


		/*
		 * Function to populate the data section with album art and track information.
		 */
		var addData = function ( ) {
			// Check for and add album art if available.
			if ( typeof ( $ ( song ) . data ( 'infoAlbumArt' ) ) !== 'undefined' ) { addAlbumArt ( ) ; }
			// Check for and add artist info if available.
			if ( typeof ( $ ( song ) . data ( 'infoArtist' ) ) !== 'undefined' ) { addInfo ( 'Artist' , 'infoArtist' ) ; }
			// Check for and add title info if available.
			if ( typeof ( $ ( song ) . data ( 'infoTitle' ) ) !== 'undefined' ) { addInfo ( 'Title' , 'infoTitle' ) ; }
			// Check for and add album title info if available.
			if ( typeof ( $ ( song ) . data ( 'infoAlbumTitle' ) ) !== 'undefined' ) { addInfo ( 'Album' , 'infoAlbumTitle' ) ; }
			// Check for and add label info if available.
			if ( typeof ( $ ( song ) . data ( 'infoLabel' ) ) !== 'undefined' ) { addInfo ( 'Label' , 'infoLabel' ) ; }
			// Check for and add year info if available.
			if ( typeof ( $ ( song ) . data ( 'infoYear' ) ) !== 'undefined' ) { addInfo ( 'Year' , 'infoYear' ) ; }

			// If data table has content, append it and the toggle/data sections to the player box.
			if ( $ ( data_table ) . html ( ) !== "" ) {
				$ ( data_sec ) . append ( data_table ) ;
				$ ( player_box ) . append ( toggle_holder ) ;
				$ ( player_box ) . append ( data_sec ) ;
			}
		} ;


		/*
		 * Function to add various player controls based on data attributes.
		 */
		var addPlayer = function ( ) {
			if ( $ ( song ) . data ( 'play' ) !== 'off' ) { addPlay ( ) ; } // Add play/pause button.
			if ( $ ( song ) . data ( 'seek' ) !== 'off' ) { addSeek ( ) ; } // Add seek bar.
			if ( $ ( song ) . data ( 'time' ) !== 'off' ) { addTime ( ) ; } // Add time display.
			if ( $ ( song ) . data ( 'mute' ) !== 'off' ) { addMute ( ) ; } // Add mute button.
			if ( $ ( song ) . data ( 'volume' ) !== 'off' ) { addVolume ( ) ; } // Add volume slider.
			$ ( player_box ) . append ( player ) ; // Append the assembled player controls to the player box.
		} ;


		/*
		 * Function to add attribution information.
		 */
		var addAttribution = function ( ) {
			var attribution = document . createElement ( 'small' ) ; // Create a small element for attribution.
			$ ( attribution ) . addClass ( 'pull-right muted' ) ; // Add styling classes.

			// If an attribution link is provided, create an anchor tag.
			if ( typeof ( $ ( song ) . data ( 'infoAttLink' ) ) !== 'undefined' ) {
				var attribution_link = document . createElement ( 'a' ) ;
				$ ( attribution_link ) . addClass ( 'muted' ) ;
				$ ( attribution_link ) . attr ( 'href' , $ ( song ) . data ( 'infoAttLink' ) ) ;
				$ ( attribution_link ) . html ( $ ( song ) . data ( 'infoAtt' ) ) ;
				$ ( attribution ) . append ( attribution_link ) ;
			}
			else {
				$ ( attribution ) . html ( $ ( song ) . data ( 'infoAtt' ) ) ; // Otherwise, just set the text.
			}
			$ ( player_box ) . append ( attribution ) ; // Append attribution to the player box.
		} ;


		/*
		 * Master function to fill the player box with all components.
		 */
		var fillPlayerBox = function ( ) {
			addData ( ) ; // Add data section.
			addPlayer ( ) ; // Add player controls.
			// Add attribution if available.
			if ( typeof ( $ ( song ) . data ( 'infoAtt' ) ) !== 'undefined' ) { addAttribution ( ) ; }
		} ;

		// Execute the master function to construct the player.
		fillPlayerBox ( ) ;

		// Attach a global error listener to the song object.
		$ ( song ) . on ( 'error' , function ( ) {
			load_error ( ) ; // Call the error handler.
		} ) ;

		// Return the constructed player box element to be inserted into the DOM.
		return player_box ;
	} ) ;
} ) ( jQuery ) ; // Pass jQuery as the '$' argument.