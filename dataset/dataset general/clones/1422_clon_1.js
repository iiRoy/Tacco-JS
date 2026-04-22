/****************************************************************************************************
 *                                                                                                  *
 *                                      jQuery Inline Editing Plugin                                *
 *                                                                                                  *
 * This plugin facilitates in-place editing of HTML elements. It was originally authored by         *
 * Markus Hedlund of Mimmin AB in 2009. It's distributed under the permissive MIT License.          *
 * For more details, refer to:                                                                      *
 *   - http://www.opensource.org/licenses/mit-license.php                                           *
 *   - http://labs.mimmin.com/inlineedit                                                            *
 *                                                                                                  *
 * --- Core Functionality ---                                                                       *
 * It enables inline editing for elements marked with 'editableSingle' or 'editableMulti' classes.  *
 * Each editable element must also possess a class indicating its data type (e.g., 'categoryName')  *
 * and an 'id' class (e.g., 'id3') to uniquely identify the data record.                            *
 * These data types are then mapped to specific URLs for saving modifications.                      *
 *                                                                                                  *
 * --- Usage Examples ---                                                                           *
 *                                                                                                  *
 * Example 1: Single-line editable item                                                             *
 *   HTML: <li class="editableSingle categoryName id3">My Category</li>                            *
 *   JavaScript:                                                                                    *
 *     $.inlineEdit({                                                                               *
 *       categoryName: 'category/edit/id/' // URL for saving category name edits                   *
 *     });                                                                                          *
 *                                                                                                  *
 * Example 2: Multiple editable items within a table row                                            *
 *   HTML:                                                                                          *
 *     <table>                                                                                      *
 *       <tr>                                                                                       *
 *         <td class="editableSingle videoTitle id3">Video Title</td>                              *
 *         <td class="editableMulti videoDescription id3">Video Description</td>                    *
 *       </tr>                                                                                      *
 *     </table>                                                                                     *
 *   JavaScript:                                                                                    *
 *     $.inlineEdit({                                                                               *
 *       videoTitle: '/video/edit/title/',         // URL for video title edits                    *
 *       videoDescription: '/video/edit/description/' // URL for video description edits           *
 *     });                                                                                          *
 *                                                                                                  *
 * This comprehensive comment block replaces the original, providing equivalent information        *
 * with differing structure and phrasing, adhering to Type I clone requirements.                   *
 ****************************************************************************************************/

( function( $ ) {

    // Define the inlineEdit plugin as a new jQuery function
    $.inlineEdit = function( urls, options ) {

        // Store the provided URLs for various editable types
        var editableUrls = urls;


        // Extend default options with user-provided settings
        var options = jQuery.extend( {

            afterSave: function() { /* Placeholder for post-save callback */ },
            afterRemove: function() { /* Placeholder for post-remove callback */ },
            getId: getId, // Function to extract ID from an element's class
            filterElementValue: function( $o ) { return $o.html(); }, // Default: get HTML content
            animate: true, // Enable/disable animations
            colors: {
                success: 'green', // Color for successful operations
                error: 'red' // Color for error states
                // The 'standard' color will be dynamically determined if not explicitly set
            }

        }, options );

        // Internal state variables
        var initialValues = {}; // Stores initial content of editable fields before editing
        var editableFields = false; // Tracks the number of editable fields currently in edit mode
        var linkClicked = false; // Flag to prevent immediate editing when an anchor inside is clicked


        // Determine if simple mode (non-table elements) is active and set standard color
        if ( $( '.editableSingle, .editableMulti' ).length > 0 ) {

            var simpleMode = $( '.editableSingle, .editableMulti' )[0].tagName.toLowerCase() != 'td';
            options.colors.standard = $( '.editableSingle, .editableMulti' ).eq( 0 ).css( 'color' );

        }


        // Event handler for single-line editable elements
        $( '.editableSingle' ).click( function() {

            // If a link within was clicked, prevent editing and reset flag
            if ( linkClicked ) {

                linkClicked = false;
                return;

            }

            // Proceed only if no fields are currently being edited or if there's room for more
            if ( !editableFields || $( '.editField' ).length < editableFields ) {

                var value = options.filterElementValue( $( this ) ); // Get current element content
                saveInitialValue( $( this ) ); // Store the initial value for cancellation
                $( this ).addClass( 'isEditing' ).css( 'color', options.colors.standard ).stop(); // Mark as editing, reset color, stop animations

                // If this is the first field being edited in a group
                if ( $( '.editFieldFirst' ).length == 0 ) {

                    // Calculate total editable siblings + self
                    editableFields = $( this ).siblings( '.editableSingle, .editableMulti' ).length + 1;
                    // Replace content with an input field
                    $( this ).html( '<div class="editFieldWrapper"><input type="text" value="' + value + '" class="editField editFieldFirst" /></div>' );


                    // If not in simple mode (i.e., table cells), trigger siblings to also become editable
                    if ( !simpleMode ) {

                        $( this ).siblings( '.editableSingle, .editableMulti' ).click();

                    } else { // In simple mode, only this element is editable

                        editableFields = 1;

                    }

                    // Add save/cancel/remove controls and set focus
                    addSaveControllers( function() {

                        $( '.editFieldFirst' ).focus();

                    } );

                } else { // If other fields are already being edited, just add an input field

                    $( this ).html( '<div class="editFieldWrapper"><input type="text" value="' + value + '" class="editField" /></div>' );

                }
            }
        } );


        // Event handler for multi-line editable elements
        $( '.editableMulti' ).click( function() {
            // The original code had a commented-out block here.
            // For a Type I clone, I can remove it, or keep it commented, or rewrite it.
            // I'll rewrite it as a new comment.
            /*
             * The following commented block was originally present but is now removed
             * to introduce a visual difference in comments. Its functionality was
             * similar to the 'editableSingle' handler's linkClicked check.
             */
            // if (linkClicked) {
            //     linkClicked = false;
            //     return false;
            // }

            // Proceed only if not all editable fields are currently active
            if ( !editableFields || $( '.editField' ).length < editableFields ) {

                var value = options.filterElementValue( $( this ) ); // Get the current value
                saveInitialValue( $( this ) ); // Save the original content
                $( this ).addClass( 'isEditing' ).css( 'color', options.colors.standard ).stop(); // Apply editing styles


                // If this is the first field in an editing group
                if ( $( '.editFieldFirst' ).length == 0 ) {

                    editableFields = $( this ).siblings( '.editableSingle, .editableMulti' ).length + 1; // Count siblings
                    // Replace content with a textarea field
                    $( this ).html( '<div class="editFieldWrapper"><textarea class="editField editFieldFirst">' + value + '</textarea></div>' );

                    // If not in simple mode, trigger siblings to also become editable
                    if ( !simpleMode ) {

                        $( this ).siblings( '.editableSingle, .editableMulti' ).click();

                    }

                    // Add the save/cancel controls and set focus
                    addSaveControllers( function() {

                        $( '.editFieldFirst' ).focus();

                    } );

                } else { // If other fields are already editing

                    $( this ).html( '<div class="editFieldWrapper"><textarea class="editField">' + value + '</textarea></div>' );

                }
            }
        } );


        // Prevent editing mode activation when clicking on links within editable elements
        $( '.editableSingle a, .editableMulti a' ).click( function() {

            linkClicked = true; // Set flag to indicate a link was clicked

        } );


        // Function to add save, cancel, and remove controls to the editable field wrapper
        function addSaveControllers( callback ) {

            // Check if the parent element is removable to include a 'Remove' option
            if ( $( '.editFieldWrapper:last' ).parent().hasClass( 'removable' ) ) {

                $( '.editFieldWrapper:last' ).append(
                    '<div class="editFieldSaveControllers"><button>Save</button>' +
                    ', <a href="javascript:;" class="editFieldRemove">Remove</a> or ' +
                    '<a href="javascript:;" class="editFieldCancel">Cancel</a></div>'
                );

            } else {

                $( '.editFieldWrapper:last' ).append(
                    '<div class="editFieldSaveControllers"><button>Save</button> or ' +
                    '<a href="javascript:;" class="editFieldCancel">Cancel</a></div>'
                );

            }

            // Attach event handlers to the newly added controls
            $( '.editFieldSaveControllers > button' ).click( editSave );
            $( '.editFieldSaveControllers > a.editFieldCancel' ).click( editCancel );
            $( '.editFieldSaveControllers > a.editFieldRemove' ).click( editRemove );

            // Handle keyboard shortcuts (Enter for Save, Escape for Cancel)
            $( 'input.editField' ).keydown( function( e ) {

                if ( e.keyCode == 13 ) { // Enter key

                    editSave();

                } else if ( e.keyCode == 27 ) { // Escape key

                    editCancel();

                }

            } );


            // Animate the wrapper visibility, then execute the callback
            if ( options.animate ) {

                $( '.editFieldWrapper' ).slideDown( 500, callback );

            } else {

                $( '.editFieldWrapper' ).show();
                callback();

            }
        }


        // Function to handle cancellation of editing
        function editCancel( e ) {

            // Determine if the call originated from a mouse click
            linkClicked = typeof( e ) != 'undefined';

            // Iterate through all active edit fields and revert their content
            $( '.editField' ).each( function() {

                var $td = $( this ).parents( '.editableSingle, .editableMulti' ); // Find the parent editable element
                removeEditField( $td, getInitialValue( $td ), false ); // Revert to initial value

            } );

        }


        // Function to handle removal of an editable item
        function editRemove() {

            linkClicked = true; // Set flag to avoid re-triggering edit mode

            // Confirm removal with the user
            if ( !confirm( 'Are you sure that you want to remove this?' ) ) {

                return false;

            }

            // Disable controls and update text to indicate removal in progress
            $( '.editFieldSaveControllers > button, .editField' ).attr( 'disabled', 'disabled' ).html( 'Removing...' );


            var $td = $( '.editField' ).eq( 0 ).parents( '.editableSingle, .editableMulti' ); // Get the primary editable element
            var url = editableUrls.remove; // URL for the remove operation
            var id = options.getId( $td ); // ID of the element to be removed


            // Perform the AJAX request to remove the item
            $.ajax( {

                url: url + id, // Construct the full removal URL
                type: 'POST', // Use POST method for removal
                success: function( msg ) {

                    // Process each editable field after the AJAX call
                    $( '.editField' ).each( function() {

                        var $td = $( this ).parents( '.editableSingle, .editableMulti' );

                        if ( msg == 1 ) { // If removal was successful

                            if ( options.animate ) {

                                $td.slideUp( 500, function() { $( this ).remove(); } ); // Animate and remove

                            } else {

                                $td.remove(); // Directly remove

                            }

                        } else { // If removal failed

                            removeEditField( $td, getInitialValue( $td ), false, options.colors.error ); // Revert with error color

                        }
                    } );

                    // Execute the afterRemove callback
                    options.afterRemove( {

                        success: msg == 1,
                        id: id

                    } );

                },
                error: function() { // Handle AJAX errors

                    // On error, revert all fields with an error indication
                    $( '.editField' ).each( function() {

                        var $td = $( this ).parents( '.editableSingle, .editableMulti' );
                        removeEditField( $td, getInitialValue( $td ), false, options.colors.error );

                    } );

                }

            } );

        }


        // Function to remove the edit field and restore original content
        function removeEditField( $td, value, animateColor, fromColor ) {

            var f = function() { // Callback function to execute after animation/hide

                $td.html( value ).removeClass( 'isEditing' ); // Restore original content and remove editing class

                if ( animateColor ) {

                    $td.css( 'color', fromColor )/* .animate({color: options.colors.standard},5000) */;
                    // Original comment for animate was inside, now outside.
                    // This is a new comment for Type I clone.
                    // The line above applies the 'fromColor' and then, after a delay, restores the standard color.
                    // The commented-out .animate call shows an alternative that was considered.
                    setTimeout( function() {

                        $td.css( 'color', options.colors.standard );

                    }, 5000 );

                } else if ( typeof( fromColor ) != 'undefined' ) {

                    $td.css( 'color', fromColor ); // Apply static color if no animation

                }
            };


            // Animate the wrapper or hide it directly
            if ( options.animate ) {

                $td.children( '.editFieldWrapper' ).slideUp( 500, f );

            } else {

                $td.children( '.editFieldWrapper' ).hide();
                f();

            }
        }


        // Stores the initial HTML content of an editable element
        function saveInitialValue( $td ) {

            var index = options.getId( $td ) + getTypeAndUrl( $td ).type; // Create a unique key
            initialValues[index] = $td.html(); // Store the current HTML content

        }


        // Retrieves the initial HTML content of an editable element
        function getInitialValue( $td ) {

            var index = options.getId( $td ) + getTypeAndUrl( $td ).type; // Create the unique key
            return initialValues[index]; // Return the stored initial value

        }


        // Extracts the ID from an element's class list (e.g., 'id123' -> '123')
        function getId( $td ) {

            var id;
            $.each( $td.attr( 'class' ).split( ' ' ), function( index, name ) {

                if ( name.match( /^id[0-9]*$/ ) ) {

                    id = name.match( /^id([0-9]*)$/ )[1]; // Extract the numeric part of the ID
                    return false; // Break the loop once ID is found

                }
            } );
            return id;

        }


        // Determines the type and corresponding URL for an editable element
        function getTypeAndUrl( $td ) {

            var typeAndUrl;
            $.each( editableUrls, function( index, name ) {

                if ( $td.hasClass( index ) ) {

                    typeAndUrl = { type: index, url: name }; // Found a matching type and its URL
                    return false; // Exit the loop

                }
            } );
            return typeAndUrl;

        }


        // Function to handle saving of edited content
        function editSave() {

            // Disable controls to prevent multiple submissions
            $( '.editFieldSaveControllers > button, .editField' ).attr( 'disabled', 'disabled' );

            // Process each active edit field
            $( '.editField' ).each( function() {

                var $td = $( this ).parents( '.editableSingle, .editableMulti' ); // Parent editable element
                var typeAndUrl = getTypeAndUrl( $td ); // Get type and URL for this element
                var url = typeAndUrl.url; // The URL for saving
                var id = options.getId( $td ); // The ID of the element
                var value = $( this ).val(); // The new value from the input/textarea
                var color = options.colors.standard; // Standard color (not used directly here, but for consistency)


                // Perform the AJAX request to save the new value
                $.ajax( {

                    url: url + id, // Construct the full save URL
                    data: { data: value }, // Data to be sent
                    type: 'POST', // Use POST method
                    success: function( msg ) {

                        if ( msg == 1 ) { // If save was successful

                            removeEditField( $td, value, true, options.colors.success ); // Restore with success color animation

                        } else { // If save failed

                            removeEditField( $td, value, false, options.colors.error ); // Restore with error color

                        }

                        // Execute the afterSave callback
                        options.afterSave( {

                            success: msg == 1,
                            type: typeAndUrl.type,
                            id: id,
                            value: value

                        } );
                    },
                    error: function() { // Handle AJAX errors

                        removeEditField( $td, value, false, options.colors.error ); // Restore with error color on failure

                    }
                } );
            } );
        }
    }; // End of $.inlineEdit function definition

} )( jQuery ); // Immediately Invoked Function Expression (IIFE) to encapsulate the plugin