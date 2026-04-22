/*
* JQ UI Combo Box Component
* A JQuery UI plugin to transform any standard HTML select element into a sophisticated combobox, allowing users to input values not present in the initial dropdown list.
*
* Licensed under the MIT software license, see: http://www.opensource.org/licenses/mit-license.php
*/

( function ( jQ ) {

    jQ.widget( "userInterface.comboControl", {

        componentOptions: {
            // Option to force all input text to be uppercase
            upperCaseText: false,
            // Option to limit the maximum number of characters allowed in the input field
            maxInputLength: 0
        },


        _initializeComponent: function () {

            var instanceReference = this;
            var targetElement = instanceReference.element;
            var currentOptions = instanceReference.componentOptions;

            // Retrieve properties from the original select element
            var originalId = targetElement.prop( 'id' );
            var hiddenFieldSelector = "#" + originalId;
            var visibleInputIdentifier = "ComboControlInput-" + originalId;
            var visibleInputSelector = "#" + visibleInputIdentifier;
            var originalName = targetElement.prop( 'name' );

            // Get initial values from the selected option
            var initialValue = targetElement.find( ':selected' ).val();
            var initialText = targetElement.find( ':selected' ).text();

            // Extract all options from the original select for autocomplete
            var dropdownOptions = targetElement.find( 'option' );
            var availableOptionsList = []; // Using array literal for data type change

            // Conceal the original select element from view
            targetElement.hide();

            // Inject the new HTML structure: a hidden input, a text input, and a toggle button
            targetElement.before(
                '<div>' +
                '  <span class="ui-combobox">' +
                '    <input type="hidden" class="insertedInput" id="' + originalId + '" name="' + originalName + '" value="' + initialValue + '">' +
                '    <input type="text" id="' + visibleInputIdentifier + '" class="ui-combobox-input" value="' + initialText + '">' +
                '    <a class="ui-combobox-toggle"></a>' +
                '  </span>' +
                '</div>'
            );

            // Strip the ID and name from the original select element to prevent conflicts
            // The hidden input now carries these attributes for form submission
            targetElement
                .removeAttr( 'id', null )
                .removeAttr( 'name', null )
                .on( 'change', function ( evtObject ) {
                    // Prevent change event propagation from the original select
                    evtObject.stopPropagation();
                } );

            // Populate the array with text content of each option
            dropdownOptions.each( function ( indexValue ) {
                availableOptionsList.push( jQ( this ).text() );
            } );

            // Configure the autocomplete feature for the new text input
            jQ( visibleInputSelector ).autocomplete( {
                source: availableOptionsList,
                select: function ( selectEvent, uiData ) {
                    // Manually trigger change event as autocomplete selection doesn't always do it
                    this.value = uiData.item.value;
                    var chosenOption = jQ( targetElement ).find( 'option' ).filter( function () {
                        return jQ( this ).html() == uiData.item.value;
                    } ).first();
                    var optionValue = chosenOption.val();

                    // Set the hidden input's value to the selected option's value
                    jQ( hiddenFieldSelector ).val( optionValue );
                    jQ( this ).trigger( 'change' );
                }
            } )
                .on( 'change', function () {
                    var currentValue = jQ( this ).val();
                    var matchedOption = jQ( targetElement ).find( 'option' ).filter( function () {
                        return jQ( this ).html() == currentValue;
                    } ).first();

                    // If no matching option is found, set hidden input to entered text
                    if ( !matchedOption.length ) {
                        jQ( hiddenFieldSelector ).val( currentValue );
                    }
                    // Otherwise, set hidden input to the matched option's value
                    else {
                        jQ( hiddenFieldSelector ).val( matchedOption.val() );
                    }
                } )
                .on( 'blur', function () {
                    // Trigger change on blur to ensure value updates
                    jQ( this ).trigger( 'change' );
                } );

            // Apply uppercase transformation if the option is enabled
            if ( currentOptions.upperCaseText ) {

                var textEntryField = jQ( visibleInputSelector );
                textEntryField
                    .css( "text-transform", "uppercase" )
                    .data( 'cachedValue', textEntryField.val() )
                    .on( 'keyup', function () {

                        var currentField = jQ( this );
                        // Convert to uppercase only if the value has changed
                        if ( currentField.data( 'cachedValue' ) != this.value ) {
                            currentField.val( this.value.toUpperCase() );
                        }
                        // Cache the current value for subsequent comparisons
                        currentField.data( 'cachedValue', this.value );

                        currentField = null;
                    } );

                textEntryField = null;
            }

            // Enforce maximum input length if specified
            if ( currentOptions.maxInputLength > 0 ) {
                jQ( visibleInputSelector ).keyup( function () {
                    if ( jQ( this ).val().length > currentOptions.maxInputLength ) {
                        var tempValHolder = jQ( this ).val();
                        var truncatedValue = tempValHolder.substring( 0, currentOptions.maxInputLength );
                        jQ( this ).data( 'storedVal', truncatedValue );
                        jQ( this ).val( truncatedValue );
                    }
                } );
            }

            // Bind change event to the original select to update the new text input
            targetElement.on( 'change', function () {

                var linkedHiddenInput = jQ( this ).prev().find( "#" + originalId ).first(); // The hidden input element
                var currentSelectionValue = jQ( this ).val();
                var currentSelectionText = jQ( this ).find( "option:selected" ).text();

                // Find the option matching the selected text
                var matchedEntry = jQ( targetElement ).find( 'option' ).filter( function () {
                    return jQ( this ).html() == currentSelectionText;
                } ).first();

                linkedHiddenInput.val( currentSelectionValue ); // Update hidden input with the selected value
                jQ( visibleInputSelector ).val( matchedEntry.text() ); // Update visible textbox with option's text
                linkedHiddenInput.trigger( 'change' );
            } );

            // Initialize the toggle button
            var toggleButton = targetElement.prev().first().find( ".ui-combobox-toggle" );
            toggleButton.button( {
                icons: {
                    primary: "ui-icon-triangle-1-s"
                },
                text: false
            } );

            // Attach click handler to the button to display the dropdown
            toggleButton.click( function ( clickEvent ) {
                clickEvent.stopPropagation();
                var minimumWidth = jQ( this ).prev().first().width();
                presentDropdown( jQ( this ), clickEvent, minimumWidth );
            } );

            // Bind keyboard event for Alt + Down Arrow to open/close the list
            jQ( visibleInputSelector ).keydown( function ( keyboardEvent ) {
                var relatedList = jQ( this ).parent().parent().next();

                if ( keyboardEvent.which === 40 && keyboardEvent.altKey ) {
                    // If the list is already open, close it
                    keyboardEvent.preventDefault();
                    keyboardEvent.stopPropagation();
                    if ( relatedList.is( ":visible" ) ) {
                        relatedList.hide();
                    }
                    // Otherwise, close autocomplete and show the select list
                    else {
                        if ( currentOptions.upperCaseText ) {
                            this.value = this.value.toUpperCase();
                        }
                        jQ( visibleInputSelector ).autocomplete( "close" );
                        presentDropdown( jQ( this ), keyboardEvent, jQ( this ).width() );
                    }
                }
            } );

            // Attach event to close the list once an item is selected
            var dropdownPanel = targetElement.prev().first().find( ".ui-combobox-list" );
            dropdownPanel.change( function () {
                jQ( this ).hide();
            } );

            // Private helper methods for component functionality
            function presentDropdown( triggeringElement, triggerEvent, minimumDisplayWidth ) {

                var activeList = triggeringElement.parent().parent().next();

                // Close the list if it's already open or if autocomplete is active
                if ( activeList.is( ":visible" ) || jQ( visibleInputSelector ).autocomplete( "widget" ).is( ":visible" ) ) {
                    activeList.hide();
                }
                else {
                    // Determine the display size of the select list, capped at 30 items
                    var displaySize;
                    if ( availableOptionsList.length <= 30 ) {
                        displaySize = availableOptionsList.length;
                    }
                    else {
                        displaySize = 30;
                    }

                    // Adjust size attribute for single-item lists to ensure visibility
                    var adjustedSizeAttribute = displaySize === 1 ? 2 : displaySize;
                    activeList
                        .css( {
                            "width": "auto",
                            "position": "absolute",
                            "z-index": "1" // Ensure the list appears above other elements
                        } )
                        .prop( "size", adjustedSizeAttribute ) // Convert select to a listbox for expansion
                        .show();

                    // Adjust width if the list is narrower than the input
                    if ( minimumDisplayWidth > activeList.width() ) {
                        activeList.css( "width", minimumDisplayWidth );
                    }

                    // Calculate and set the height of the list based on font size and item count
                    var itemLineHeight = parseInt( activeList.find( 'option' ).first().css( 'font-size' ), 10 );
                    activeList.css( "height", itemLineHeight * ( displaySize + 1 ) );

                    // Register a one-time click event on the document to dismiss the list
                    jQ( document ).one( "click", function () {
                        activeList.hide();
                    } );

                    function navigateListItems( keyboardNavEvent ) {
                        var directionDown = "down";
                        var directionUp = "up";

                        // Handle Up Arrow key press for navigating upwards
                        if ( keyboardNavEvent.which === 38 && activeList.is( ":visible" ) ) {
                            scrollOptions( directionUp );
                            return;
                        }

                        // Handle Down Arrow key press for navigating downwards
                        if ( keyboardNavEvent.which === 40 && activeList.is( ":visible" ) ) {
                            scrollOptions( directionDown );
                            return;
                        }

                        // On Enter key press, trigger change and hide the list
                        if ( keyboardNavEvent.which === 13 && activeList.is( ":visible" ) ) {
                            activeList.trigger( "change" );
                            activeList.hide();
                            return;
                        }

                        // If any other key is pressed while list is visible, hide it
                        if ( activeList.is( ":visible" ) ) {
                            activeList.hide();
                        }

                        function scrollOptions( scrollDirection ) {
                            keyboardNavEvent.preventDefault();
                            var currentlySelected = activeList.find( ":selected" );
                            var targetOption;

                            if ( scrollDirection === directionDown ) {
                                targetOption = currentlySelected.next();
                            } else { // Must be 'up'
                                targetOption = currentlySelected.prev();
                            }

                            currentlySelected.prop( 'selected', false );
                            targetOption.prop( 'selected', "selected" );
                        }
                    }

                    // Bind keydown event to document for list navigation, with a unique namespace
                    jQ( document )
                        .off( "keydown.comboControl" )
                        .on( "keydown.comboControl", navigateListItems );
                }
            }
        },

        // Method to clean up and revert changes when the widget is destroyed
        _tearDownComponent: function () {
            var targetElement = this.element;
            var hiddenInputRef = targetElement.prev().find( '.insertedInput' );

            var componentId = "";
            var componentName = "";

            // Restore original ID and name attributes to the select element
            componentId = hiddenInputRef.prop( 'id' );
            componentName = hiddenInputRef.prop( 'name' );

            targetElement.attr( {
                id: componentId,
                name: componentName,
            } );

            // Unbind all change events and remove the injected HTML structure
            targetElement.off( 'change' );
            targetElement.prev().remove();
            targetElement.show(); // Make the original select element visible again
        }

    } );

} )( jQuery );