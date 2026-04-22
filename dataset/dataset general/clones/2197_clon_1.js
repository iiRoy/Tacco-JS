// This file defines the jQuery UI Combify widget.
// It transforms a standard HTML select element into a richer combobox.
//
// Copyright (c) October 2012 Tom Mooney
// Licensed under the MIT license: http://www.opensource.org/licenses/mit-license.php

// Immediately Invoked Function Expression (IIFE) to encapsulate the plugin.
( function ( $ ) {

    // Define the jQuery UI widget.
    $.widget( "ui.combify" , {


        // Widget options.
        // These can be overridden by the user during initialization.
        options : {
    		capitalizeInput : false , // Should the input text be capitalized?
		    maxLength : 0 // Maximum length for the input field. 0 means no limit.
        } ,


        // The _create method is called once when the widget is initialized.
        _create : function ( ) {

            // Cache 'this' for use in inner functions.
            var self = this ,

            // Reference to the original select element.
            select = self . element ,

            // Access the widget's options.
            options = self . options ,

            // Get the ID of the original select.
            id = select . prop ( 'id' ) ,

            // Selector for the hidden input that will replace the select's ID.
            hiddenInputSelector = "#" + id ,

            // Generate an ID for the new text input.
            textInputId = "CombifyInput-" + id ,

            // Selector for the new text input.
            textInputSelector = "#" + textInputId ,

            // Get the name attribute of the original select.
            name = select . prop ( 'name' ) ,

            // Get the value of the currently selected option.
            selectedValue = select . find ( ':selected' ) . val ( ) ,

            // Get the text of the currently selected option.
            selectedText = select . find ( ':selected' ) . text ( ) ,

            // Get all option elements from the original select.
            selectOptions = select . find ( 'option' ) ,

            // Initialize an array to hold option texts for autocomplete.
            optionArray = new Array ( ) ;


            // Hide the original select element from the user interface.
            select . hide ( ) ;


            // Insert new HTML elements to form the combobox structure.
            // This includes a hidden input, a text input, and a dropdown button.
            select . before ( '<div>'
                + '<span class="ui-combobox">'
                + '<input type="hidden" class="insertedInput" id="' + id + '" name="' + name + '" value="' + selectedValue + '">'
                + '<input type="text" id="' + textInputId + '" class="ui-combobox-input" value="' + selectedText + '">'
                + '<a class="ui-combobox-toggle"></a>'
                + '</span></div>' ) ;


            // Remove the ID and name attributes from the original select.
            // These attributes are moved to the new hidden input for form submission.
            select . removeAttr ( 'id' , null )
            . removeAttr ( 'name' , null )
            // Stop propagation of change events on the original select.
            . on ( 'change' , function ( event ) {
              event . stopPropagation ( ) ;
          } ) ;

            // Populate the optionArray with the text content of each option.
            // This array will serve as the data source for the autocomplete feature.
            selectOptions . each ( function ( i ) {
                optionArray . push ( $ ( this ) . text ( ) ) ;
            } ) ;


            // Initialize the autocomplete functionality on the new text input.
            $ ( textInputSelector ) . autocomplete ( {
                source : optionArray , // Use the populated array as the source.
                select : function ( event , ui ) {
                    // When an item is selected from the autocomplete dropdown:
                    // Update the text input's value.
                    this . value = ui . item . value ;
                    // Find the corresponding option in the original select element.
                    var option = $ ( select ) . find ( 'option' ) . filter ( function ( ) { return $ ( this ) . html ( ) == ui . item . value ; } ) . first ( )
                    // Get the value of the found option.
                    var selectValue = option . val ( ) ;
                    
                    // Set the value of the hidden input to match the selected option's value.
                    $ ( hiddenInputSelector ) . val ( selectValue ) ;  
                    // Trigger a change event on the text input.
                    $ ( this ) . trigger ( 'change' ) ;
                }
            } )
            // Attach a change event handler to the text input.
            . on ( 'change' , function ( ) {
                var value = $ ( this ) . val ( ) ;
                // Find an option in the original select that matches the entered text.
                var option = $ ( select ) . find ( 'option' ) . filter ( function ( ) { return $ ( this ) . html ( ) == value ; } ) . first ( )

								// If no matching option is found in the select list,
								// set the hidden input's value directly to the entered text.
								if ( ! option . length ) {
                                  $ ( hiddenInputSelector ) . val ( value ) ;
                              }
                              // Otherwise, if a match is found, set the hidden input's value
                              // to the value of the matching option.
                              else {
                                 $ ( hiddenInputSelector ) . val ( option . val ( ) ) ;
                             }
                         } )
            // Attach a blur event handler to the text input.
            // When the input loses focus, trigger its change event.
            . on ( 'blur' , function ( ) {
                $ ( this ) . trigger ( 'change' ) ;
            } ) ;


            // Conditional logic for capitalizing input.
            // If the capitalizeInput option is true, enforce uppercase.
            if ( options . capitalizeInput ) {
                var input = $ ( textInputSelector ) ;
                // Apply CSS for uppercase display and attach a keyup event.
                input . css ( "text-transform" , "uppercase" ) . data ( 'val' , input . val ( ) ) . on ( 'keyup' , function ( ) {
                    // Check if the input value has changed since the last keyup.
                    var theInput = $ ( this ) ;
                    if ( theInput . data ( 'val' ) != this . value ) {
                        theInput . val ( this . value . toUpperCase ( ) ) ;
                    }
                    // Store the current value for comparison on the next keyup.
                    theInput . data ( 'val' , this . value ) ;

                    theInput = null ; // Clean up reference.
                } ) ;

                input = null ; // Clean up reference.
            }
            
            // Conditional logic for enforcing maximum length.
            // If maxLength option is greater than 0, apply the limit.
            if ( options . maxLength > 0 ) {
				$ ( textInputSelector ) . keyup ( function ( ) {
					// If the current value exceeds the maxLength:
					if ( $ ( this ) . val ( ) . length > options . maxLength ) {
						var TempVal = $ ( this ) . val ( ) ;
						// Truncate the value and update the data attribute and the input field.
						$ ( this ) . data ( 'val' , TempVal . substring ( 0 , options . maxLength ) ) ;
						$ ( this ) . val ( TempVal . substring ( 0 , options . maxLength ) ) ;
					}
				} ) ;
            }


            // Attach a change event to the original select list.
            // This updates the combobox's text input and hidden input when the select changes.
            select . on ( 'change' , function ( ) {
                var hiddenInput = $ ( this ) . prev ( ) . find ( "#" + id ) . first ( ) ; // Reference to the hidden input.
                var selectedValue = $ ( this ) . val ( ) ; // Value of the selected option in the original select.
                var text = $ ( this ) . find ( "option:selected" ) . text ( ) ; // Text of the selected option.
                
                // Find the option element that matches the selected text.
                var option = $ ( select ) . find ( 'option' ) . filter ( function ( ) { return $ ( this ) . html ( ) == text } ) . first ( )
                hiddenInput . val ( selectedValue ) ; // Update the hidden input's value.
                $ ( textInputSelector ) . val ( option . text ( ) ) ;  // Set the visible textbox to the option's text.
                hiddenInput . trigger ( 'change' ) ; // Trigger change on the hidden input.
            } ) ;


            // Initialize the dropdown button.
            var button = select . prev ( ) . first ( ) . find ( ".ui-combobox-toggle" ) ;
            button . button ( {
                icons : {
                    primary : "ui-icon-triangle-1-s" // Use a triangle-down icon.
                } ,
                text : false // Hide the button text, only show icon.
            } ) ;


            // Attach a click event handler to the dropdown button.
            // This will expand the select list.
            button . click ( function ( event ) {
                event . stopPropagation ( ) ; // Prevent event bubbling.
                var minWidth = $ ( this ) . prev ( ) . first ( ) . width ( ) ; // Get width for list sizing.
                ExpandSelectList ( $ ( this ) , event , minWidth ) ; // Call the private function to expand.
            } ) ;


            // Attach a keydown event handler to the text input for Alt + Down Arrow.
            // This allows keyboard control to expand/collapse the list.
            $ ( textInputSelector ) . keydown ( function ( event ) {
                var list = $ ( this ) . parent ( ) . parent ( ) . next ( ) ; // Reference to the actual select list.

                // If Alt + Down Arrow is pressed:
                if ( event . which === 40 && event . altKey ) {
                    event . preventDefault ( ) ; // Prevent default browser behavior.
                    event . stopPropagation ( ) ; // Stop event propagation.
                    // If the list is already visible, hide it.
                    if ( list . is ( ":visible" ) ) {
                        list . hide ( ) ;
                    }
                    else {
                        // If capitalization is enabled, convert input to uppercase.
                        if ( options . capitalizeInput ) {
                            this . value = this . value . toUpperCase ( ) ;
                        }
                        // Close any open autocomplete list.
                        $ ( textInputSelector ) . autocomplete ( "close" ) ;
                        // Expand the select list.
                        ExpandSelectList ( $ ( this ) , event , $ ( this ) . width ( ) ) ;
                    }
                }
            } ) ;


            // Attach an event to close the list after a selection is made.
            var list = select . prev ( ) . first ( ) . find ( ".ui-combobox-list" ) ;
            list . change ( function ( ) {
                $ ( this ) . hide ( ) ; // Hide the list on change.
            } ) ;


            // Private methods (nested function definitions).
            // This function handles the expansion and display of the select list.
            function ExpandSelectList ( element , event , minWidth ) {
                var list = element . parent ( ) . parent ( ) . next ( ) ; // Get the list element.

                // If the list is already open or the autocomplete list is open, close it.
                if ( list . is ( ":visible" ) || $ ( textInputSelector ) . autocomplete ( "widget" ) . is ( ":visible" ) ) {
                    list . hide ( ) ;
                }
                else {
                    // Determine the display size of the select list.
                    // It will show up to 30 items, or fewer if fewer are available.
                    var size ;
                    if ( optionArray . length <= 30 ) {
                       size = optionArray . length ;
                   }
                   else {
                    size = 30 ;
                }
                
                // Adjust sizeAttr for single-item lists to prevent rendering issues.
                var sizeAttr = size === 1 ? 2 : size ;
                list . css ( { "width" : "auto" ,
                    "position" : "absolute" ,
                    "z-index" : "1"
                    } ) // Apply CSS to position the list and ensure it's on top.
                    	    . prop ( "size" , sizeAttr ) // Change to a listbox by setting 'size' attribute.
                    	    . show ( ) ; // Make the list visible.
                    	    
                            // Ensure the list width is at least the width of the input field.
                            if ( minWidth > list . width ( ) ) {
                                list . css ( "width" , minWidth ) ;
                            }
                            
                            // Calculate and set the height of the list based on font size.
                            var listLineHeight = parseInt ( list . find ( 'option' ) . first ( ) . css ( 'font-size' ) , 10 ) ;
                            list . css ( "height" , listLineHeight * ( size + 1 ) ) ;

                    // Attach a one-time event to the document.
                    // This will close the list if the user clicks anywhere else on the page.
                    $ ( document ) . one ( "click" , function ( ) {
                        list . hide ( ) ;
                    } ) ;

                    // Nested function to handle item navigation with arrow keys.
                    function nextItem ( event ) {
                        var down = "down" ,
                        up = "up"

                        // If the user presses the Up arrow and the list is visible:
                        if ( event . which === 38 && list . is ( ":visible" ) ) {
                            move ( up ) ; // Move selection up.
                            return ;
                        }

                        // If the user presses the Down arrow and the list is visible:
                        if ( event . which === 40 && list . is ( ":visible" ) ) {
                            move ( down ) ; // Move selection down.
                            return ;
                        }

                        // If the user presses Enter and the list is visible:
                        if ( event . which === 13 && list . is ( ":visible" ) ) {
                            list . trigger ( "change" ) ; // Trigger change event on the list.
                            list . hide ( ) ; // Hide the list.
                            return ;
                        }

                        // If any other key is pressed and the list is visible, hide it.
                        if ( list . is ( ":visible" ) ) {
                            list . hide ( ) ;
                        }

                        // Function to move the selection within the list.
                        function move ( direction ) {
                            event . preventDefault ( ) ; // Prevent default scroll behavior.
                            var selected = list . find ( ":selected" ) ; // Get the currently selected item.
                            var nextItem ;
                            if ( direction === down ) {
                                nextItem = selected . next ( ) ; // Get the next item.
                            }
                            if ( direction === up ) {
                                nextItem = selected . prev ( ) ; // Get the previous item.
                            }
                            selected . prop ( 'selected' , false ) ; // Deselect the current item.
                            nextItem . prop ( 'selected' , "selected" ) ; // Select the new item.
                        }
                    }

                    // Attach a keydown event handler to the document for list navigation.
                    // This uses a namespaced event to prevent conflicts and allow easy unbinding.
                    $ ( document ) . off ( "keydown.combifySelect" )
                    . on ( "keydown.combifySelect" , nextItem ) ;
                }
            }
        } , // End of _create method.


        // The _destroy method is called when the widget is removed.
        // It cleans up any changes made by the widget.
        _destroy : function ( ) {
            var select = this . element , // Reference to the original select.
            inputObj = select . prev ( ) . find ( '.insertedInput' ) , // The hidden input created by the widget.
            id = "" , // Variable to store original ID.
            name = "" ; // Variable to store original name.
            id = inputObj . prop ( 'id' ) ; // Retrieve original ID.
            name = inputObj . prop ( 'name' ) ; // Retrieve original name.

            // Restore the ID and name attributes to the original select element.
            select . attr ( {
                id : id ,
                name : name ,
            } ) ;
            select . off ( 'change' ) ; // Remove the change event handler.
            select . prev ( ) . remove ( ) ; // Remove the wrapper div and its contents.
            select . show ( ) ; // Make the original select visible again.
        }
    } ) ;
} ) ( jQuery ) ; // Pass jQuery into the IIFE.