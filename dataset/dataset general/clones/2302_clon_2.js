/*
 * Bootstrap 3.0 Glyph Selector - jQuery extension for visual icon selection
 *
 * Proprietorship (c) 20013 A. K. M. Rezaul Karim<titosust@gmail.com>
 *
 * Licensed under the MIT license agreement:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home base:
 *   https://github.com/titosust/Bootstrap-icon-picker
 *
 * Edition:  1.0.0
 *
 */

( function ( jq ) {

    jq.fn.glyphSelector = function ( configSettings ) {
        
        // Track if the pop-up display is currently under the mouse cursor
        var isHovering = false;
        // Reference to the main interactive display panel
        var $displayPanel = null;
        // Comprehensive list of available Bootstrap glyph names
        var glyphNames = new Array( "adjust", "align-center", "align-justify", "align-left", "align-right", "arrow-down", "arrow-left", "arrow-right", "arrow-up", "asterisk", "backward", "ban-circle", "barcode", "bell", "bold", "book", "bookmark", "briefcase", "bullhorn", "calendar", "camera", "certificate", "check", "chevron-down", "chevron-left", "chevron-right", "chevron-up", "circle-arrow-down", "circle-arrow-left", "circle-arrow-right", "circle-arrow-up", "cloud", "cloud-download", "cloud-upload", "cog", "collapse-down", "collapse-up", "comment", "compressed", "copyright-mark", "credit-card", "cutlery", "dashboard", "download", "download-alt", "earphone", "edit", "eject", "envelope", "euro", "exclamation-sign", "expand", "export", "eye-close", "eye-open", "facetime-video", "fast-backward", "fast-forward", "file", "film", "filter", "fire", "flag", "flash", "floppy-disk", "floppy-open", "floppy-remove", "floppy-save", "floppy-saved", "folder-close", "folder-open", "font", "forward", "fullscreen", "gbp", "gift", "glass", "globe", "hand-down", "hand-left", "hand-right", "hand-up", "hd-video", "hdd", "header", "headphones", "heart", "heart-empty", "home", "import", "inbox", "indent-left", "indent-right", "info-sign", "italic", "leaf", "link", "list", "list-alt", "lock", "log-in", "log-out", "magnet", "map-marker", "minus", "minus-sign", "move", "music", "new-window", "off", "ok", "ok-circle", "ok-sign", "open", "paperclip", "pause", "pencil", "phone", "phone-alt", "picture", "plane", "play", "play-circle", "plus", "plus-sign", "print", "pushpin", "qrcode", "question-sign", "random", "record", "refresh", "registration-mark", "remove", "remove-circle", "remove-sign", "repeat", "resize-full", "resize-horizontal", "resize-small", "resize-vertical", "retweet", "road", "save", "saved", "screenshot", "sd-video", "search", "send", "share", "share-alt", "shopping-cart", "signal", "sort", "sort-by-alphabet", "sort-by-alphabet-alt", "sort-by-attributes", "sort-by-attributes-alt", "sort-by-order", "sort-by-order-alt", "sound-5-1", "sound-6-1", "sound-7-1", "sound-dolby", "sound-stereo", "star", "star-empty", "stats", "step-backward", "step-forward", "stop", "subtitles", "tag", "tags", "tasks", "text-height", "text-width", "th", "th-large", "th-list", "thumbs-down", "thumbs-up", "time", "tint", "tower", "transfer", "trash", "tree-conifer", "tree-deciduous", "unchecked", "upload", "usd", "user", "volume-down", "volume-off", "volume-up", "warning-sign", "wrench", "zoom-in", "zoom-out" );
        // Merge default settings with user-provided options
        var pluginOptions = jq.extend({
        	
        }, configSettings );
        
        // Iterate over each selected DOM element
        return this.each( function () {
        	var currentElement = this;
            // Check if the plugin should attach a button and if it's not already initialized
            if ( !pluginOptions.onlyButtonMode && jq( this ).data( "glyphSelectorData" ) === undefined ) {
            	var $targetField = jq( this ).addClass( "form-control" );
            	var $inputGroupContainer = jq( "<div/>", { class: "input-group" } );
            	$targetField.wrap( $inputGroupContainer );

            	var $triggerButton = jq( "<span class=\"input-group-addon pointer\"><i class=\"glyphicon  glyphicon-picture\"></i></span>" );
            	$targetField.after( $triggerButton );
            	
                // Self-executing function to capture the input field reference
            	( function ( targetFieldRef ) {
	            	$triggerButton.click( function () {
			       		buildUserInterface( targetFieldRef );
			       		renderGlyphList( targetFieldRef, glyphNames );
	            	} );
	            } )( $targetField );

            	// Mark the element as having the plugin attached
                jq( this ).data( "glyphSelectorData", { attached: true } );
            }
        
	        // Function to create and display the icon selection UI
	        function buildUserInterface ( $associatedInput ) {
	        	$displayPanel = jq( '<div/>', {
	        		styleProps: {
		        		'top': $associatedInput.offset().top + $associatedInput.outerHeight() + 6,
		        		'left': $associatedInput.offset().left
		        	},
		        	class: 'glyph-selection-panel'
	        	} );

	        	// Populate the panel with control elements and a placeholder for the icon list
	        	$displayPanel.html( '<div class="panel-controls"> \
						          <ul> \
						            <li><a href="javascript:;" class="btn" data-dir="-1"><span class="glyphicon  glyphicon-fast-backward"></span></a></li> \
						            <li><input type="text" class="panel-search-box glyphicon  glyphicon-search" placeholder="Search" /></li> \
						            <li><a href="javascript:;"  class="btn" data-dir="1"><span class="glyphicon  glyphicon-fast-forward"></span></a></li> \
						          </ul> \
						      </div> \
						     <div class="glyph-display-area"> </div> \
					         ' ).appendTo( "body" );
	        	
	        	// Add Bootstrap dropdown styling and show the panel
	        	$displayPanel.addClass( 'dropdown-menu' ).show();
				// Set up mouse events to track hover state on the panel
                $displayPanel.mouseenter( function () { isHovering = true; } ).mouseleave( function () { isHovering = false; } );

	        	// Variables for managing search and pagination within the panel
	        	var previousSearchTerm = "", startIndex = 0, itemsPerPage = 30;
                var endIndex = startIndex + itemsPerPage; // This variable isn't used after initialization, but kept for structural parity.

	        	// Click handler for pagination buttons (fast backward/forward)
	        	jq( ".panel-controls .btn", $displayPanel ).click( function ( eventObject ) {
	                eventObject.stopPropagation(); // Prevent event bubbling
	                var directionValue = jq( this ).attr( "data-dir" );
	                startIndex = startIndex + itemsPerPage * directionValue;
	                startIndex = startIndex < 0 ? 0 : startIndex; // Ensure index is not negative

                    // Limit the maximum scrollable index for demonstration purposes (210 being total icons)
	                if ( startIndex + itemsPerPage <= 210 ) {
	                  jq.each( jq( ".glyph-display-area>ul li" ), function ( listItemIndex ) {
	                      if ( listItemIndex >= startIndex && listItemIndex < startIndex + itemsPerPage ) {
	                         jq( this ).show(); // Display the item
	                      } else {
	                        jq( this ).hide(); // Hide the item
	                      }
	                  } );
	                } else {
	                  startIndex = 180; // If exceeding bounds, reset to a known last page
	                }
	            } );
	        	
	        	// Keyup handler for the search input field
	        	jq( '.panel-controls .panel-search-box', $displayPanel ).on( "keyup", function ( keyEvent ) {
	                var currentSearchTerm = jq( this ).val();
                    if ( previousSearchTerm !== currentSearchTerm ) {
	                    previousSearchTerm = currentSearchTerm;
	                    if ( previousSearchTerm === "" ) {
	                    	renderGlyphList( $associatedInput, glyphNames ); // Show all glyphs if search is empty
	                    } else {
	                    	// Filter glyphs based on the search term (case-insensitive)
	                    	renderGlyphList( $associatedInput, jq( glyphNames )
							        .map( function ( arrayIndex, glyphName ) { 
								            if ( glyphName.toLowerCase().indexOf( previousSearchTerm.toLowerCase() ) !== -1 ) { return glyphName; } 
								        } ).get() );
						}
	                    
	                }
	            } );
	        	
                // Global mouseup listener to close the panel if clicked outside
	        	jq( document ).mouseup( function ( mouseEvent ) {
				    if ( !$displayPanel.is( mouseEvent.target ) && $displayPanel.has( mouseEvent.target ).length === 0 ) {
				        destroyPanel(); // Remove the panel
				    }
				} );

	        }
	        
            // Function to remove the active selection panel from the DOM
	        function destroyPanel () {
	        	jq( ".glyph-selection-panel" ).remove();
	        }
	        
            // Function to populate the panel with a given array of glyphs
	        function renderGlyphList ( $associatedInput, glyphCollection ) {
	        	var $unorderedList = jq( "<ul>" );
	        	
	        	// Create list items for each glyph in the collection
	        	for ( var idx in glyphCollection ) {
	        		$unorderedList.append( "<li><a href=\"#\" title=" + glyphCollection[ idx ] + "><span class=\"glyphicon  glyphicon-" + glyphCollection[ idx ] + "\"></span></a></li>" );
	        	}

	        	// Insert the generated list into the glyph display area
	        	jq( ".glyph-display-area", $displayPanel ).html( $unorderedList );
	        	
                // Attach click handlers to each glyph icon
	        	jq( ".glyph-display-area li a", $displayPanel ).click( function ( eventObject ) {
	        		eventObject.preventDefault(); // Prevent default link navigation
	        		var selectedGlyphTitle = jq( this ).attr( "title" );
	        		$associatedInput.val( "glyphicon glyphicon-" + selectedGlyphTitle ); // Set the input field's value
	        		destroyPanel(); // Close the selection panel
	        	} );
	        }

        } );
    };

} )( jQuery );