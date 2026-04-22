/*
 * This is a Type I clone of the original jQuery DualListBox plugin,
 * maintaining its core functionality and structure.
 *
 * It features Bootstrap styling and was originally developed by Geodan B.V.
 * The original creator was Alex van den Hoogen.
 *
 * For more details, refer to: http://www.geodan.nl
 * Copyright (c) 2014 Geodan B.V. All rights reserved.
 *
 * How to use it:
 * Simply create a <select> element in your HTML.
 * Then, initialize the plugin on that select element using jQuery:
 *   $('your_select_selector').DualListBox();
 * The DualListBox will then be dynamically generated.
 *
 * Configuration:
 * Options can be configured using HTML5 `data-*` attributes on the select element,
 * or by passing a JavaScript object during initialization.
 * You can also provide pre-selected items.
 * The plugin supports loading data from a JSON URI.
 *
 * Please see the `defaults` object within the plugin's code for a comprehensive
 * list of all available configuration parameters and their default values.
 *
 * This version includes extensive changes to whitespace and comments
 * to demonstrate a Type I clone, while preserving all code logic and identifiers.
 */

( function ( $ ) {

    // Initializes the DualListBox functionality as a jQuery plugin method.
    $.fn.DualListBox = function ( paramOptions, selected ) {

        return this.each( function () {

            // Default configuration settings for the DualListBox.
            var defaults = {
                element:    $( this ).context,    // The original select element that triggers this plugin.
                uri:        'local.json',       // Path to the JSON data file, if applicable.
                value:      'id',               // Key for the option's value attribute in JSON data.
                text:       'name',             // Key for the option's display text in JSON data.
                title:      'Example',          // General title for the dual list box interface.
                json:       true,               // Flag: true if data should be fetched via JSON, false otherwise.
                timeout:    500,                // Delay in milliseconds for filter input processing.
                horizontal: false,              // Layout orientation: true for horizontal, false for vertical.
                textLength: 45,                 // Maximum length of text displayed in select options before truncation.
                moveAllBtn: true,               // Flag: true to show 'move all' buttons, false to hide them.
                maxAllBtn:  500,                // Threshold for 'move all' button warning.
                warning:    'Are you sure you want to move this many items? Doing so can cause your browser to become unresponsive.' // Warning message for large moves.
            };


            // Options retrieved directly from HTML5 data attributes of the select element.
            var htmlOptions = {
                element:    $( this ).context,
                uri:        $( this ).data( 'source' ),
                value:      $( this ).data( 'value' ),
                text:       $( this ).data( 'text' ),
                title:      $( this ).data( 'title' ),
                json:       $( this ).data( 'json' ),
                timeout:    $( this ).data( 'timeout' ),
                horizontal: $( this ).data( 'horizontal' ),
                textLength: $( this ).data( 'textLength' ),
                moveAllBtn: $( this ).data( 'moveAllBtn' ),
                maxAllBtn:  $( this ).data( 'maxAllBtn' )
            };


            // Merges default, HTML, and parameter options. Parameter options take highest precedence.
            var options = $.extend( {}, defaults, htmlOptions, paramOptions );


            // Validate that all essential options have been defined.
            $.each( options, function ( i, item ) {
                if ( item === undefined || item === null ) {
                    throw 'DualListBox: ' + i + ' is undefined.';
                }
            } );


            // Generate unique IDs for the parent container.
            options[ 'parent' ] = 'dual-list-box-' + options.title.replace( /\s/g, '-' ); // Ensures valid ID.
            options[ 'parentElement' ] = '#' + options.parent;


            // Initialize selected items array, ensuring it's always an array.
            selected = $.extend( [ {} ], selected );


            // Determine whether to load elements via JSON or from existing HTML.
            if ( options.json ) {
                addElementsViaJSON( options, selected ); // Load from JSON source.
            } else {
                construct( options ); // Construct using existing HTML options.
            }

        } );
    };


    /**
     * Fetches option elements from a specified JSON endpoint and populates the list box.
     * @param {object} options - Configuration options for the DualListBox.
     * @param {Array} selected - An array of items that should be pre-selected.
     */
    function addElementsViaJSON( options, selected ) {

        var multipleTextFields = false; // Flag to check if multiple fields are combined for text.

        // Check if the text option specifies multiple fields to concatenate.
        if ( options.text.indexOf( ':' ) > -1 ) {
            var textToUse = options.text.split( ':' );

            if ( textToUse.length > 1 ) {
                multipleTextFields = true;
            }
        }


        // Make the JSON request to retrieve data.
        $.getJSON( options.uri, function ( json ) {

            // Iterate through each item in the received JSON data.
            $.each( json, function ( key, item ) {
                var text = ''; // Variable to hold the option's display text.

                // Construct the display text based on configuration.
                if ( multipleTextFields ) {
                    textToUse.forEach( function ( entry ) {
                        text += item[ entry ] + ' '; // Concatenate multiple fields.
                    } );
                } else {
                    text = item[ options.text ]; // Use a single field for text.
                }

                // Create a new option element and append it to the original select.
                $( '<option>', {
                    value: item[ options.value ],
                    text: text,
                    // Check if the current item should be selected.
                    selected: ( selected.some( function ( e ) {
                        return e[ options.value ] === item[ options.value ]
                    } ) === true )
                } ).appendTo( options.element );
            } );

            // Once all options are added, proceed with constructing the DualListBox UI.
            construct( options );
        } );
    }


    /**
     * Attaches event listeners to the buttons and filter input fields of the DualListBox.
     * @param {object} options - Configuration options for the DualListBox.
     */
    function addListeners( options ) {

        // Cache jQuery objects for the unselected and selected lists.
        var unselected = $( options.parentElement + ' .unselected' );
        var selected = $( options.parentElement + ' .selected' );


        // Attach click event handler to all buttons within the DualListBox container.
        $( options.parentElement ).find( 'button' ).bind( 'click', function () {

            // Perform actions based on the button's data-type attribute.
            switch ( $( this ).data( 'type' ) ) {
                case 'str': /* Selected to the right. Move selected items from unselected to selected list. */
                    unselected.find( 'option:selected' ).appendTo( selected );
                    $( this ).prop( 'disabled', true ); // Disable button after action.
                    break;

                case 'atr': /* All to the right. Move all visible items from unselected to selected list. */
                    // Check for warning threshold before moving many items.
                    if ( unselected.find( 'option' ).length >= options.maxAllBtn && confirm( options.warning ) ||
                        unselected.find( 'option' ).length < options.maxAllBtn ) {
                        unselected.find( 'option' ).each( function () {
                            if ( $( this ).isVisible() ) { // Only move visible items.
                                $( this ).remove().appendTo( selected );
                            }
                        } );
                    }
                    break;

                case 'stl': /* Selected to the left. Move selected items from selected to unselected list. */
                    selected.find( 'option:selected' ).remove().appendTo( unselected );
                    $( this ).prop( 'disabled', true ); // Disable button after action.
                    break;

                case 'atl': /* All to the left. Move all visible items from selected to unselected list. */
                    // Check for warning threshold before moving many items.
                    if ( selected.find( 'option' ).length >= options.maxAllBtn && confirm( options.warning ) ||
                        selected.find( 'option' ).length < options.maxAllBtn ) {
                        selected.find( 'option' ).each( function () {
                            if ( $( this ).isVisible() ) { // Only move visible items.
                                $( this ).remove().appendTo( unselected );
                            }
                        } );
                    }
                    break;

                default:
                    break;
            }

            // After any movement, re-filter and re-sort both lists, then scroll to top.
            unselected.filterByText( $( options.parentElement + ' .filter-unselected' ), options.timeout, options.parentElement ).scrollTop( 0 ).sortOptions();
            selected.filterByText( $( options.parentElement + ' .filter-selected' ), options.timeout, options.parentElement ).scrollTop( 0 ).sortOptions();

            // Handle post-movement UI updates.
            handleMovement( options );
        } );


        // When the form containing the DualListBox is submitted, ensure all selected options are marked as such.
        $( options.parentElement ).closest( 'form' ).submit( function () {
            selected.find( 'option' ).prop( 'selected', true );
        } );


        // Prevent form submission when pressing Enter in filter input fields.
        $( options.parentElement ).find( 'input[type="text"]' ).keypress( function ( e ) {
            if ( e.which === 13 ) { // Key code for Enter.
                event.preventDefault();
            }
        } );


        // Initial filtering and sorting for both lists.
        selected.filterByText( $( options.parentElement + ' .filter-selected' ), options.timeout, options.parentElement ).scrollTop( 0 ).sortOptions();
        unselected.filterByText( $( options.parentElement + ' .filter-unselected' ), options.timeout, options.parentElement ).scrollTop( 0 ).sortOptions();
    }


    /**
     * Constructs the DualListBox UI after all necessary elements have been retrieved or parsed.
     * This is the final step in the initialization process.
     * @param {object} options - Configuration options for the DualListBox.
     */
    function construct( options ) {
        createDualListBox( options ); // Create the visual structure of the dual list box.
        parseStubListBox( options ); // Populate the newly created lists from the original select element.
        addListeners( options );     // Attach all event handlers.
    }


    /**
     * Counts the number of visible elements in each list box and updates their respective counts.
     * Also triggers the toggling of button states based on list content.
     * @param {string} parentElement - Selector for the parent container of the DualListBox.
     */
    function countElements( parentElement ) {

        var countUnselected = 0, countSelected = 0; // Initialize counters for both lists.

        // Count visible options in the unselected list.
        $( parentElement + ' .unselected' ).find( 'option' ).each( function () {
            if ( $( this ).isVisible() ) {
                countUnselected++;
            }
        } );

        // Count visible options in the selected list.
        $( parentElement + ' .selected' ).find( 'option' ).each( function () {
            if ( $( this ).isVisible() ) {
                countSelected++;
            }
        } );


        // Update the display for the unselected count.
        $( parentElement + ' .unselected-count' ).text( countUnselected );
        // Update the display for the selected count.
        $( parentElement + ' .selected-count' ).text( countSelected );


        // Adjust the disabled state of buttons based on the current counts.
        toggleButtons( parentElement );
    }


    /**
     * Creates the main HTML structure for the dual list box, including columns, titles, filters, and selects.
     * @param {object} options - Configuration options for the DualListBox.
     */
    function createDualListBox( options ) {

        // Assign a unique ID to the parent of the original select element.
        $( options.element ).parent().attr( 'id', options.parent );

        // Append the main DualListBox structure to the parent container.
        $( options.parentElement ).addClass( 'row' ).append(
                // Left column for unselected items.
                ( options.horizontal == false ? '   <div class="col-md-5">' : '   <div class="col-md-6">' ) +
                '       <h4><span class="unselected-title"></span> <small>- showing <span class="unselected-count"></span></small></h4>' +
                '       <input class="filter form-control filter-unselected" type="text" placeholder="Filter" style="margin-bottom: 5px;">' +
                // Horizontal buttons if layout is horizontal and it's the first column.
                ( options.horizontal == false ? '' : createHorizontalButtons( 1, options.moveAllBtn ) ) +
                '       <select class="unselected" style="height: 200px; width: 100%;" multiple></select>' +
                '   </div>' +

                // Vertical buttons if layout is vertical.
                ( options.horizontal == false ? createVerticalButtons( options.moveAllBtn ) : '' ) +

                // Right column for selected items.
                ( options.horizontal == false ? '   <div class="col-md-5">' : '   <div class="col-md-6">' ) +
                '       <h4><span class="selected-title"></span> <small>- showing <span class="selected-count"></span></small></h4>' +
                '       <input class="filter form-control filter-selected" type="text" placeholder="Filter" style="margin-bottom: 5px;">' +
                // Horizontal buttons if layout is horizontal and it's the second column.
                ( options.horizontal == false ? '' : createHorizontalButtons( 2, options.moveAllBtn ) ) +
                '       <select class="selected" style="height: 200px; width: 100%;" multiple></select>' +
                '   </div>'
        );

        // Set the name attribute for the selected list to match the original select.
        $( options.parentElement + ' .selected' ).prop( 'name', $( options.element ).prop( 'name' ) );
        // Set titles for the unselected and selected lists.
        $( options.parentElement + ' .unselected-title' ).text( 'Available ' + options.title );
        $( options.parentElement + ' .selected-title' ).text( 'Selected ' + options.title );
    }


    /**
     * Generates the HTML for movement buttons when the dual list box is configured for horizontal layout.
     * @param {number} number - Indicates which column the buttons are for (1 for unselected, 2 for selected).
     * @param {boolean} copyAllBtn - Whether the 'move all' buttons should be included.
     * @returns {string} HTML string for the horizontal buttons.
     */
    function createHorizontalButtons( number, copyAllBtn ) {
        if ( number == 1 ) {
            // Buttons for moving items from left (unselected) to right (selected).
            return ( copyAllBtn ? '       <button type="button" class="btn btn-default atr" data-type="atr" style="margin-bottom: 5px;"><span class="glyphicon glyphicon-list"></span> <span class="glyphicon glyphicon-chevron-right"></span></button>' : '' ) +
                '       <button type="button" class="btn btn-default ' + ( copyAllBtn ? 'pull-right col-md-6' : 'col-md-12' ) + ' str" data-type="str" style="margin-bottom: 5px;" disabled><span class="glyphicon glyphicon-chevron-right"></span></button>';
        } else {
            // Buttons for moving items from right (selected) to left (unselected).
            return '       <button type="button" class="btn btn-default ' + ( copyAllBtn ? 'col-md-6' : 'col-md-12' ) + ' stl" data-type="stl" style="margin-bottom: 5px;" disabled><span class="glyphicon glyphicon-chevron-left"></span></button>' +
                ( copyAllBtn ? '       <button type="button" class="btn btn-default col-md-6 pull-right atl" data-type="atl" style="margin-bottom: 5px;"><span class="glyphicon glyphicon-chevron-left"></span> <span class="glyphicon glyphicon-list"></span></button>' : '' );
        }
    }


    /**
     * Generates the HTML for movement buttons when the dual list box is configured for vertical layout.
     * These buttons are typically placed in a central column between the two select boxes.
     * @param {boolean} copyAllBtn - Whether the 'move all' buttons should be included.
     * @returns {string} HTML string for the vertical buttons.
     */
    function createVerticalButtons( copyAllBtn ) {
        return '   <div class="col-md-2 center-block" style="margin-top: ' + ( copyAllBtn ? '80px' : '130px' ) + '">' +
            // Button to move all items to the right.
            ( copyAllBtn ? '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 atr" data-type="atr" style="margin-bottom: 10px;"><span class="glyphicon glyphicon-list"></span> <span class="glyphicon glyphicon-chevron-right"></span></button>' : '' ) +
            // Button to move selected items to the right.
            '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 str" data-type="str" style="margin-bottom: 20px;" disabled><span class="glyphicon glyphicon-chevron-right"></span></button>' +
            // Button to move selected items to the left.
            '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 stl" data-type="stl" style="margin-bottom: 10px;" disabled><span class="glyphicon glyphicon-chevron-left"></span></button>' +
            // Button to move all items to the left.
            ( copyAllBtn ? '       <button type="button" class="btn btn-default col-md-8 col-md-offset-2 atl" data-type="atl" style="margin-bottom: 10px;"><span class="glyphicon glyphicon-chevron-left"></span> <span class="glyphicon glyphicon-list"></span></button>' : '' ) +
            '   </div>';
    }


    /**
     * Manages the state of the DualListBox after items have been moved between the lists.
     * This includes clearing selections, resetting filters, making all options visible, and updating counts.
     * @param {object} options - Configuration options for the DualListBox.
     */
    function handleMovement( options ) {

        // Deselect any currently selected options in both lists to prevent unintended behavior.
        $( options.parentElement + ' .unselected' ).find( 'option:selected' ).prop( 'selected', false );
        $( options.parentElement + ' .selected' ).find( 'option:selected' ).prop( 'selected', false );


        // Clear any text in the filter input fields.
        $( options.parentElement + ' .filter' ).val( '' );
        // Make all options visible again, as filters might have hidden some.
        $( options.parentElement + ' select' ).find( 'option' ).each( function () {
            $( this ).show();
        } );


        // Recalculate and display the number of elements in each list.
        countElements( options.parentElement );
    }


    /**
     * Parses the options from the initial <select> element (the "stub" list box)
     * and distributes them into the newly created unselected and selected DualListBox components.
     * @param {object} options - Configuration options for the DualListBox.
     */
    function parseStubListBox( options ) {

        var textIsTooLong = false; // Flag to track if any option text was truncated.

        // Iterate through each option in the original select element.
        $( options.element ).find( 'option' ).text( function ( i, text ) {
            // Store the original full text in a data attribute for potential use (e.g., tooltips).
            $( this ).data( 'title', text );

            // Truncate text if it exceeds the configured maximum length.
            if ( text.length > options.textLength ) {
                textIsTooLong = true; // Mark that truncation occurred.
                return text.substr( 0, options.textLength ) + '...'; // Return truncated text.
            }
        } ).each( function () {
            // If any text was truncated, set the title attribute for a tooltip.
            if ( textIsTooLong ) {
                $( this ).prop( 'title', $( this ).data( 'title' ) );
            }

            // Distribute options: if originally selected, move to the 'selected' list, otherwise to 'unselected'.
            if ( $( this ).is( ':selected' ) ) {
                $( this ).appendTo( options.parentElement + ' .selected' );
            } else {
                $( this ).appendTo( options.parentElement + ' .unselected' );
            }
        } );


        // Remove the original stub select element as it's no longer needed.
        $( options.element ).remove();
        // Trigger post-movement handling to update counts and button states.
        handleMovement( options );
    }


    /**
     * Controls the disabled state of the movement buttons based on the content
     * and selection status of the unselected and selected list boxes.
     * @param {string} parentElement - Selector for the parent container of the DualListBox.
     */
    function toggleButtons( parentElement ) {

        // Enable the 'move selected to right' button when an item is selected in the unselected list.
        $( parentElement + ' .unselected' ).change( function () {
            $( parentElement + ' .str' ).prop( 'disabled', false );
        } );


        // Enable the 'move selected to left' button when an item is selected in the selected list.
        $( parentElement + ' .selected' ).change( function () {
            $( parentElement + ' .stl' ).prop( 'disabled', false );
        } );


        // Logic for 'move all' and 'move selected' buttons from unselected list.
        if ( $( parentElement + ' .unselected' ).has( 'option' ).length == 0 ) {
            // If unselected list is empty, disable 'move all right' and 'move selected right'.
            $( parentElement + ' .atr' ).prop( 'disabled', true );
            $( parentElement + ' .str' ).prop( 'disabled', true );
        } else {
            // If unselected list has items, enable 'move all right'.
            $( parentElement + ' .atr' ).prop( 'disabled', false );
        }


        // Logic for 'move all' and 'move selected' buttons from selected list.
        if ( $( parentElement + ' .selected' ).has( 'option' ).length == 0 ) {
            // If selected list is empty, disable 'move all left' and 'move selected left'.
            $( parentElement + ' .atl' ).prop( 'disabled', true );
            $( parentElement + ' .stl' ).prop( 'disabled', true );
        } else {
            // If selected list has items, enable 'move all left'.
            $( parentElement + ' .atl' ).prop( 'disabled', false );
        }
    }


    /**
     * jQuery plugin method to filter options within a select box based on text input.
     * Options that do not match the filter text are hidden.
     *
     * Original source: http://www.lessanvaezi.com/filter-select-list-options/ - adapted for this plugin.
     *
     * @param {jQuery} textBox - The jQuery object for the input field used for filtering.
     * @param {number} timeout - The delay (in ms) before the filter is applied after user input.
     * @param {string} parentElement - The selector for the DualListBox's parent container, used for updating counts.
     * @returns {jQuery} The jQuery object of the select box, for chaining.
     */
    $.fn.filterByText = function ( textBox, timeout, parentElement ) {

        return this.each( function () {
            var select = this;
            var options = []; // Array to store all original options with their text and values.

            // Populate the options array from the select element.
            $( select ).find( 'option' ).each( function () {
                options.push( { value: $( this ).val(), text: $( this ).text() } );
            } );

            // Store the original options data on the select element itself.
            $( select ).data( 'options', options );

            // Bind change and keyup events to the filter text box.
            $( textBox ).bind( 'change keyup', function () {
                // Apply a delay to avoid excessive filtering on rapid typing.
                delay( function () {
                    var options = $( select ).data( 'options' ); // Retrieve original options.
                    var search = $.trim( $( textBox ).val() );   // Get and trim the search query.
                    var regex = new RegExp( search, 'gi' );      // Create a case-insensitive regex for search.

                    // Iterate through all original options to apply the filter.
                    $.each( options, function ( i ) {
                        if ( options[ i ].text.match( regex ) === null ) {
                            // If text does not match, hide the option.
                            $( select ).find( $( 'option[value="' + options[ i ].value + '"]' ) ).hide();
                        } else {
                            // If text matches, show the option.
                            $( select ).find( $( 'option[value="' + options[ i ].value + '"]' ) ).show();
                        }
                    } );

                    // Update the element counts after filtering.
                    countElements( parentElement );
                }, timeout );
            } );
        } );
    };


    /**
     * Custom jQuery plugin method to check if an element is truly visible.
     * The default jQuery `:visible` selector can sometimes be unreliable for elements
     * hidden by `visibility: hidden` or `display: none`. This checks both.
     * @returns {boolean} True if the element is visible, false otherwise.
     */
    $.fn.isVisible = function () {
        return !( $( this ).css( 'visibility' ) == 'hidden' || $( this ).css( 'display' ) == 'none' );
    };


    /**
     * Custom jQuery plugin method to sort the options within a <select> element alphabetically by their text content.
     * @returns {jQuery} The jQuery object of the select box, for chaining.
     */
    $.fn.sortOptions = function () {

        return this.each( function () {
            // Remove all existing options, sort them, and then re-append them.
            $( this ).append( $( this ).find( 'option' ).remove().sort( function ( a, b ) {
                var at = $( a ).text(), bt = $( b ).text(); // Get text content for comparison.
                return ( at > bt ) ? 1 : ( ( at < bt ) ? -1 : 0 ); // Standard string comparison.
            } ) );
        } );
    };


    /**
     * A simple utility function to introduce a delay before executing a callback.
     * Useful for debouncing events like keyup, to prevent excessive function calls.
     * @param {Function} callback - The function to execute after the delay.
     * @param {number} ms - The delay in milliseconds.
     */
    var delay = ( function () {
        var timer = 0; // Stores the timer ID for clearTimeout.
        return function ( callback, ms ) {
            clearTimeout( timer ); // Clear any previous timer to reset the delay.
            timer = setTimeout( callback, ms ); // Set a new timer.
        };
    } )();

} )( jQuery ); // Pass jQuery into the immediately invoked function expression.