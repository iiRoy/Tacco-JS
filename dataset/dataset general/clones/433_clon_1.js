/*******************************************************************************
 * flexselect: a jQuery plugin, version: 0.2 (released 2009-03-16)             *
 *                                                                             *
 * @requires jQuery v1.3 or later (tested with jQuery 1.3.2)                   *
 *                                                                             *
 * FlexSelect is a powerful jQuery plugin designed to transform a standard     *
 * HTML select box into an enhanced, autocompleting, "Quicksilver-style"       *
 * selection tool. It provides flexible matching capabilities for improved    *
 * user experience.                                                            *
 *                                                                             *
 * For comprehensive usage instructions, detailed examples, and further        *
 * documentation, please visit the official project repository:                *
 * http://rmm5t.github.com/jquery-flexselect/                                  *
 *                                                                             *
 * This software is licensed under the MIT License. You are free to use,       *
 * modify, and distribute this code. A copy of the license is available at:    *
 * http://www.opensource.org/licenses/mit-license.php                          *
 *                                                                             *
 * Copyright (c) 2009, Ryan McGeary (ryanonjavascript -[at]- mcgeary [*dot*] org) *
 *******************************************************************************/
( function ( $ ) {

    /**
     * Initializes a new FlexSelect instance.
     * @param {HTMLElement} select - The original HTML <select> element.
     * @param {Object} options - Configuration options for the FlexSelect instance.
     */
    $.flexselect = function ( select, options ) {

        this.init( select, options );

    };


    // Extend the prototype of $.flexselect to add methods and properties
    $.extend( $.flexselect.prototype, {

        /**
         * Default settings for the FlexSelect plugin.
         * These can be overridden during initialization.
         */
        settings: {
            allowMismatch:       false, // If true, allows the input to contain text not in the dropdown.
            selectedClass:       "flexselect_selected", // CSS class for the selected item in the dropdown.
            dropdownClass:       "flexselect_dropdown", // CSS class for the dropdown container.
            inputIdTransform:    function ( id ) { return id + "_flexselect"; }, // Function to generate the ID for the new input field.
            inputNameTransform:  function ( name ) { return; }, // Function to generate the name for the new input field.
            dropdownIdTransform: function ( id ) { return id + "_flexselect_dropdown"; } // Function to generate the ID for the dropdown container.
        },

        select:                 null, // Reference to the original <select> element (jQuery object).
        input:                  null, // Reference to the new <input type="text"> element (jQuery object).
        hidden:                 null, // Reference to the new <input type="hidden"> element (jQuery object).
        dropdown:               null, // Reference to the dropdown <div> container (jQuery object).
        dropdownList:           null, // Reference to the <ul> element inside the dropdown (jQuery object).
        cache:                  [], // Stores preloaded options from the original select element.
        results:                [], // Stores filtered results based on user input.
        lastAbbreviation:       null, // Stores the last abbreviation used for filtering to prevent redundant filtering.
        abbreviationBeforeFocus:null, // Stores the input value before the field gained focus, for reset purposes.
        selectedIndex:          0, // The index of the currently selected item in the dropdown.
        picked:                 false, // Flag indicating if a value has been explicitly picked from the dropdown.
        dropdownMouseover:      false, // Workaround for inconsistent IE behavior with blur/mouseover events.

        /**
         * Initializes the FlexSelect instance.
         * @param {HTMLElement} selectElement - The raw DOM <select> element.
         * @param {Object} optionsObject - User-provided options.
         */
        init: function ( selectElement, optionsObject ) {

            // Merge default settings with user-provided options.
            $.extend( this.settings, optionsObject );

            // Store a jQuery reference to the original select element.
            this.select = $( selectElement );

            // Preload all options from the select element into the cache.
            this.preloadCache();

            // Render the new input, hidden, and dropdown controls.
            this.renderControls();

            // Wire up all event handlers for the new controls.
            this.wire();

        },

        /**
         * Populates the internal cache with data from the original <select> options.
         * Each option is stored as an object: { name: "text", value: "val", score: 0.0 }.
         */
        preloadCache: function () {

            // Map each child option of the select element to a cache entry.
            this.cache = this.select.children( "option" ).map( function () {

                return {
                    name:  $.trim( $( this ).text() ), // Trim whitespace from option text.
                    value: $( this ).val(),            // Get the option's value.
                    score: 0.0                         // Initialize score for LiquidMetal matching.
                };

            } );

        },

        /**
         * Creates and inserts the new input, hidden, and dropdown elements into the DOM.
         * It also removes the original <select> element.
         */
        renderControls: function () {

            // Get the currently selected option from the original select box.
            var selectedOption = this.select.children( "option:selected" );

            // Create the hidden input field.
            // This field will hold the actual value that gets submitted with the form.
            this.hidden = $( "<input type='hidden'/>" ).attr( {
                id:   this.select.attr( "id" ),   // Inherit ID from original select.
                name: this.select.attr( "name" ) // Inherit name from original select.
            } ).val( selectedOption.val() ); // Set initial value from the selected option.

            // Create the visible text input field for autocompletion.
            this.input = $( "<input type='text' autocomplete='off' />" ).attr( {
                id:        this.settings.inputIdTransform( this.select.attr( "id" ) ), // Generate ID using transform function.
                name:      this.settings.inputNameTransform( this.select.attr( "name" ) ), // Generate name using transform function.
                accesskey: this.select.attr( "accesskey" ), // Inherit accesskey.
                tabindex:  this.select.attr( "tabindex" ),  // Inherit tabindex.
                style:     this.select.attr( "style" )     // Inherit inline styles.
            } ).addClass( this.select.attr( "class" ) ) // Inherit classes from original select.
               .val( $.trim( selectedOption.text() ) );   // Set initial text from selected option.

            // Create the dropdown container <div>.
            this.dropdown = $( "<div></div>" ).attr( {
                id: this.settings.dropdownIdTransform( this.select.attr( "id" ) ) // Generate ID using transform function.
            } ).addClass( this.settings.dropdownClass ); // Apply dropdown CSS class.

            // Create the unordered list <ul> inside the dropdown.
            this.dropdownList = $( "<ul></ul>" );

            // Append the list to the dropdown container.
            this.dropdown.append( this.dropdownList );

            // Insert the new input and hidden fields after the original select, then remove the original select.
            this.select.after( this.input ).after( this.hidden ).remove();

            // Append the dropdown container to the body to ensure correct positioning.
            $( "body" ).append( this.dropdown );

        },

        /**
         * Wires up all necessary event handlers for the input and dropdown elements.
         */
        wire: function () {

            var self = this; // Store a reference to 'this' for use within event handlers.

            // --- Input Field Event Handlers ---

            // On click, reset last abbreviation and focus the input.
            this.input.click( function () {
                self.lastAbbreviation = null;
                self.focus();
            } );

            // Mouseup event to prevent Safari selection issues.
            this.input.mouseup( function ( event ) {
                event.preventDefault(); // This is so Safari selection actually occurs.
            } );

            // On focus, store current value, select text, and filter results if not already picked.
            this.input.focus( function () {
                self.abbreviationBeforeFocus = self.input.val(); // Store current value for potential reset.
                self.input.select();                             // Select all text in the input.
                if ( !self.picked ) {                            // If no item was explicitly picked, filter results.
                    self.filterResults();
                }
            } );

            // On blur, hide dropdown and reset if no item was picked and mouse is not over dropdown.
            this.input.blur( function () {
                if ( !self.dropdownMouseover ) { // Check if mouse is over dropdown (IE workaround).
                    self.hide();                 // Hide the dropdown.
                    if ( !self.picked ) {        // If nothing was picked, reset the input to its state before focus.
                        self.reset();
                    }
                }
            } );

            // --- Dropdown List Event Handlers ---

            // Mouseover on dropdown list items to highlight them.
            this.dropdownList.mouseover( function ( event ) {
                if ( event.target.tagName === "LI" ) { // Ensure the target is an LI element.
                    var rows = self.dropdown.find( "li" );
                    self.markSelected( rows.index( $( event.target ) ) ); // Mark the hovered item as selected.
                }
            } );

            // Mouseleave from dropdown list to unmark selection.
            this.dropdownList.mouseleave( function () {
                self.markSelected( -1 ); // Unmark any selected item.
            } );

            // Mouseup on dropdown list item to pick it.
            this.dropdownList.mouseup( function ( event ) {
                self.pickSelected();    // Select the highlighted item.
                self.focusAndHide();    // Focus the input and hide the dropdown.
            } );

            // --- Dropdown Container Event Handlers ---

            // Mouseover on dropdown container to set flag (IE workaround).
            this.dropdown.mouseover( function ( event ) {
                self.dropdownMouseover = true;
            } );

            // Mouseleave from dropdown container to clear flag (IE workaround).
            this.dropdown.mouseleave( function ( event ) {
                self.dropdownMouseover = false;
            } );

            // Mousedown on dropdown container to prevent input blur.
            this.dropdown.mousedown( function ( event ) {
                event.preventDefault(); // Prevents the input from blurring when clicking the dropdown.
            } );

            // --- Input Field Keyboard Event Handlers ---

            // Keyup event for filtering results and handling specific keys.
            this.input.keyup( function ( event ) {
                switch ( event.keyCode ) {
                    case 13: // Enter key
                        event.preventDefault();     // Prevent default form submission.
                        self.pickSelected();        // Pick the selected item.
                        self.focusAndHide();        // Focus input and hide dropdown.
                        break;
                    case 27: // Escape key
                        event.preventDefault();     // Prevent default browser action.
                        self.reset();               // Reset input to original value.
                        self.focusAndHide();        // Focus input and hide dropdown.
                        break;
                    default: // Any other key, filter results.
                        self.filterResults();
                        break;
                }
            } );

            // Keydown event for navigation and preventing default actions.
            this.input.keydown( function ( event ) {
                switch ( event.keyCode ) {
                    case 9: // Tab key
                        self.pickSelected(); // Pick the selected item.
                        self.hide();         // Hide the dropdown.
                        break;
                    case 33: // Page Up key
                        event.preventDefault(); // Prevent page scroll.
                        self.markFirst();       // Select the first item.
                        break;
                    case 34: // Page Down key
                        event.preventDefault(); // Prevent page scroll.
                        self.markLast();        // Select the last item.
                        break;
                    case 38: // Up arrow key
                        event.preventDefault(); // Prevent cursor movement in input.
                        self.moveSelected( -1 ); // Move selection up.
                        break;
                    case 40: // Down arrow key
                        event.preventDefault(); // Prevent cursor movement in input.
                        self.moveSelected( 1 );  // Move selection down.
                        break;
                    case 13: // Enter key
                    case 27: // Escape key
                        event.preventDefault();     // Prevent default form submission/browser action.
                        event.stopPropagation();    // Stop event propagation.
                        break;
                }
            } );

        },

        /**
         * Filters the cached results based on the current input abbreviation.
         * Uses LiquidMetal for scoring.
         */
        filterResults: function () {

            var abbreviation = this.input.val(); // Get the current value from the input field.

            // If the abbreviation hasn't changed since the last filter, do nothing.
            if ( abbreviation === this.lastAbbreviation ) {
                return;
            }

            var resultsArray = []; // Array to store filtered results.

            // Iterate over each item in the cache.
            $.each( this.cache, function () {
                // Calculate the LiquidMetal score for the item's name against the abbreviation.
                this.score = LiquidMetal.score( this.name, abbreviation );
                if ( this.score > 0.0 ) { // Only include items with a positive score.
                    resultsArray.push( this );
                }
            } );

            this.results = resultsArray; // Update the results array.

            this.sortResults();      // Sort the results by score.
            this.renderDropdown();   // Render the dropdown with the new results.
            this.markFirst();        // Mark the first item in the dropdown as selected.
            this.lastAbbreviation = abbreviation; // Update the last abbreviation.
            this.picked = false;     // Reset the picked flag.

        },

        /**
         * Sorts the current results array by their LiquidMetal score in descending order.
         */
        sortResults: function () {

            this.results.sort( function ( a, b ) {
                return b.score - a.score; // Sort from highest score to lowest.
            } );

        },

        /**
         * Renders the dropdown list with the current filtered results.
         * Also positions and sizes the dropdown relative to the input field.
         */
        renderDropdown: function () {

            // Calculate border width to adjust dropdown width correctly.
            var dropdownBorderWidth = this.dropdown.outerWidth() - this.dropdown.innerWidth();

            // Get the position of the input field.
            var inputOffset = this.input.offset();

            // Set the CSS properties for the dropdown to position it correctly below the input.
            this.dropdown.css( {
                width: ( this.input.outerWidth() - dropdownBorderWidth ) + "px", // Match input width.
                top:   ( inputOffset.top + this.input.outerHeight() ) + "px",   // Position below input.
                left:  inputOffset.left + "px"                                  // Align with input's left edge.
            } );

            var list = this.dropdownList.html( "" ); // Clear existing list items.

            // Append each result as a new list item.
            $.each( this.results, function () {
                // Original code included score for debugging, but was commented out.
                // list.append($("<li/>").html(this.name + " <small>[" + Math.round(this.score*100)/100 + "]</small>"));
                list.append( $( "<li/>" ).html( this.name ) ); // Create and append <li> with the item's name.
            } );

            this.dropdown.show(); // Make the dropdown visible.

        },

        /**
         * Marks a specific item in the dropdown as selected by adding a CSS class.
         * @param {number} n - The index of the item to mark as selected.
         */
        markSelected: function ( n ) {

            // If the index is out of bounds, do nothing.
            if ( n > this.results.length ) {
                return;
            }

            var rows = this.dropdown.find( "li" ); // Get all list items.

            rows.removeClass( this.settings.selectedClass ); // Remove selected class from all items.

            this.selectedIndex = n; // Update the internal selected index.

            // If a valid index is provided, add the selected class to that item.
            if ( n >= 0 ) {
                $( rows[ n ] ).addClass( this.settings.selectedClass );
            }

        },

        /**
         * Picks the currently selected item from the dropdown, updates input and hidden fields.
         * Handles cases where no item is selected or mismatch is allowed.
         */
        pickSelected: function () {

            var selectedItem = this.results[ this.selectedIndex ]; // Get the currently selected result object.

            if ( selectedItem ) {
                this.input.val( selectedItem.name );     // Update the text input with the selected item's name.
                this.hidden.val( selectedItem.value );   // Update the hidden input with the selected item's value.
                this.picked = true;                      // Set the picked flag to true.
            } else if ( this.settings.allowMismatch ) {
                this.hidden.val( "" );                   // If mismatch allowed, clear hidden value.
            } else {
                this.reset();                            // If no item is selected and mismatch not allowed, reset.
            }

        },

        /**
         * Hides the dropdown menu and resets the last abbreviation.
         */
        hide: function () {

            this.dropdown.hide();            // Hide the dropdown element.
            this.lastAbbreviation = null;    // Clear the last abbreviation to force re-filtering on next input.

        },

        /**
         * Moves the selection in the dropdown by a given offset.
         * @param {number} n - The number of positions to move (e.g., 1 for down, -1 for up).
         */
        moveSelected: function ( n ) {

            this.markSelected( this.selectedIndex + n ); // Call markSelected with the new index.

        },

        /**
         * Marks the first item in the dropdown as selected.
         */
        markFirst: function () {

            this.markSelected( 0 ); // Select the item at index 0.

        },

        /**
         * Marks the last item in the dropdown as selected.
         */
        markLast: function () {

            this.markSelected( this.results.length - 1 ); // Select the item at the last index.

        },

        /**
         * Resets the input field's value to its state before focus.
         */
        reset: function () {

            this.input.val( this.abbreviationBeforeFocus ); // Restore the value from before focus.

        },

        /**
         * Gives focus to the input field.
         */
        focus: function () {

            this.input.focus(); // Programmatically set focus on the input.

        },

        /**
         * Focuses the input field and then hides the dropdown.
         */
        focusAndHide: function () {

            this.focus(); // Call the focus method.
            this.hide();  // Call the hide method.

        }

    } ); // End of $.extend( $.flexselect.prototype, { ... } )


    /**
     * jQuery plugin entry point.
     * Allows calling FlexSelect on a jQuery selection.
     *
     * @param {Object} options - Configuration options for FlexSelect.
     * @returns {jQuery} The jQuery object for chaining.
     */
    $.fn.flexselect = function ( options ) {

        // Iterate over each selected element.
        this.each( function () {

            // Only initialize FlexSelect if the element is a <select> tag.
            if ( this.tagName === "SELECT" ) {
                new $.flexselect( this, options ); // Create a new FlexSelect instance.
            }

        } );

        return this; // Return the jQuery object for method chaining.

    };

} )( jQuery ); // End of Immediately Invoked Function Expression (IIFE)