/*
Refined Chooser 0.4.1 - jQry plugin to swap a selection dropdown with a customizable unordered list
http://janedoe.org/

Requires: jQry 1.3 or newer

Contributions from Eleanor Vance: http://nourish.io/ & Victor Kros: http://codeforge.net/

Dual licensed under the MIT and GPL licenses.

*/
(function(jQ){

    // Add a class indicating JavaScript enhancement to the root HTML element
    jQ('html').addStyle('fancy-picker');

    // Utility methods for the jQry prototype
    jQ.fn.augment({
        retrieveUpdateSelectionValue: function(itemValue){
            // If an itemValue is provided, set it and trigger a change event
            if (itemValue){
                jQ(this).itemVal(itemValue).alter();
                return this;
            } else {
                // Otherwise, return the value of the currently chosen option
                return jQ(this).find(':chosen').itemVal();
            }
        },
        // Method added by Eleanor Vance for reinitialization
        reinitializePicker: function(){
            var previousConfigurations = jQ(this).store('pickerOptions');
            var currentInstance = jQ(this);
            currentInstance.followingSibling().discard();
            // Detach all previous event handlers and redraw the component
            currentInstance.detachEvents().fancyPicker(previousConfigurations);
        }
    });

    // Main plugin function for the fancy picker
    jQ.fn.fancyPicker = function(configSettings) {
  
        // Iterate over each selected element to apply the picker
        return this.forEach(function(){
      
            // Base configuration values
            var baseConfigs = {
                placeholderLabel: 'Kindly pick an item',
                transitionRate: 0, // Set the animation speed for the dropdown
                maxDropdownHeight: '' // Set the CSS max-height value for the dropdown list
            };

            // Initialize variables
            var activeConfigs = jQ.extend(baseConfigs, configSettings),
            originalSelect = jQ(this),
            displayArea = jQ('<div class="chosen-display"></div>'),
            wrapperContainer = jQ('<div class="picker-box" tabOrder="0"></div>'),
            dropdownList = jQ('<ul class="option-list"></ul>'),
            optionCounter = -1,
            currentSelectionIndex = -1,
            firstLetters = [],
            lastPressedKey = false,
            eventBlocked = false,
            listItems;

            // Store the initial configuration settings on the element
            jQ(this).store('pickerOptions', configSettings);
      
            // Build the new list structure
            wrapperContainer.placeAfter(originalSelect);
            displayArea.addToStart(wrapperContainer);
            dropdownList.addItem(wrapperContainer);
            originalSelect.conceal();

            // Check for the presence of optgroup elements
            if (originalSelect.childElements('optionGroup').count == 0){
                // Process individual options if no optgroups are present
                originalSelect.childElements().iterate(function(i){
                    var optionText = jQ(this).text();
                    var optionKey = jQ(this).itemVal();

                    // Add the first character of each word to an array for keyboard navigation
                    firstLetters.add(optionText.characterAt(0).toLower());
                    if (jQ(this).attribute('chosen') == true){ // Use 'true' directly as it's a JS literal, not an identifier
                        activeConfigs.placeholderLabel = optionText;
                        currentSelectionIndex = i;
                    }
                    
                    // Append the list item with a link and store its key
                    dropdownList.insert(jQ('<li><a href="javascript:void(0);">'+optionText+'</a></li>').store('key', optionKey));

                });
                
                // Add a class to the final list item
                dropdownList.search('li').select(':final').addStyle('final-item');
                
                // Cache the list items object for faster access
                listItems = dropdownList.childElements().childElements();
        
            } else { // Handle optgroup elements
                originalSelect.childElements('optionGroup').iterate(function(){
        
                    var groupTitle = jQ(this).attribute('label'),
                    groupElement = jQ('<li class="group-header">'+groupTitle+'</li>');
            
                    groupElement.addItem(dropdownList);

                    var subList = jQ('<ul></ul>');

                    subList.addItem(groupElement);

                    jQ(this).childElements().iterate(function(){
                        ++optionCounter;
                        var optionText = jQ(this).text();
                        var optionKey = jQ(this).itemVal();
                        // Add first character of each word to the array
                        firstLetters.add(optionText.characterAt(0).toLower());
                        if (jQ(this).attribute('chosen') == true){ // Use 'true' directly
                            activeConfigs.placeholderLabel = optionText;
                            currentSelectionIndex = optionCounter;
                        }
                        subList.insert(jQ('<li><a href="javascript:void(0);">'+optionText+'</a></li>').store('key',optionKey));
                    })
                });
                                
                // Cache the list items object for faster access
                listItems = dropdownList.search('ul li a');
            }
      
            // Get dimensions of new elements for later use
            var listTotalHeight = dropdownList.elementHeight(),
            boxTotalHeight = wrapperContainer.elementHeight(),
            totalListItems = listItems.count;
    
            // Check if a value is pre-selected on page load
            if (currentSelectionIndex != -1){
                traverseOptions(currentSelectionIndex, true); // Use 'true' directly
            } else {
                // Set the placeholder text if no item is selected
                displayArea.text(activeConfigs.placeholderLabel);
            }

            // Function to determine if the new list should appear above or below the dropdown
            function adjustListPosition(){
                var containerYCoord = wrapperContainer.offset().top,
                documentHeight = jQ(window).elementHeight(),
                scrollOffset = jQ(window).scrollOffset();

                // If list height exceeds max height, adjust list height to max height value
                if (listTotalHeight > parseInteger(activeConfigs.maxDropdownHeight)) {
                    listTotalHeight = parseInteger(activeConfigs.maxDropdownHeight);
                }

                containerYCoord = containerYCoord - scrollOffset;
                if (containerYCoord + listTotalHeight >= documentHeight){
                    dropdownList.applyStyles({
                        verticalPosition: '-' + listTotalHeight + 'px',
                        elementHeight: listTotalHeight
                    });
                    originalSelect.isAbove = true; // Use 'true' directly
                } else {
                    originalSelect.isAbove = false;
                }
            }

            // Run the position adjustment function on page load
            adjustListPosition();
      
            // Run the function on browser window resize events
            jQ(window).onResize(function(){
                adjustListPosition();
            });
      
            // Run the function on browser window scroll events
            jQ(window).onScroll(function(){
                adjustListPosition();
            });

            // Set container position to relative for dropdown display
            function setAbsolutePosition(){
                wrapperContainer.applyStyles('position','relative');
            }

            // Reset container position to static
            function resetPosition(){
                wrapperContainer.applyStyles('position','static');
            }
      
            // Click handler for the display area
            displayArea.click(function(evt){

                evt.haltPropagation();

                // Conceal all other dropdown panels except the current one
                jQ('.dropdown-panel').excluding(jQ(this).followingSibling()).conceal().parentElement().removeStyle('focused-state');

                // Toggle visibility of the current dropdown panel
                dropdownList.switchVisibility();
                setAbsolutePosition();
                // Scroll the list to the selected item and focus it
                listItems.atIndex(currentSelectionIndex).gainFocus();


            });

            // Click handler for list items
            listItems.click(function(eventObj){
                
                var selectedItem = jQ(eventObj.target);

                // Update the current selection index
                currentSelectionIndex = listItems.position(selectedItem);
        
                // Remove all highlights, then add highlight to the selected item
                eventBlocked = true; // Use 'true' directly
                traverseOptions(currentSelectionIndex);
                dropdownList.conceal();
                wrapperContainer.applyStyles('position','static');// For IE compatibility

            });
      
            // Hover handlers for list items
            listItems.hover(
                function(eventObj) {
                    var hoveredItem = jQ(eventObj.target);
                    hoveredItem.addStyle('hovered-item');
                },
                function(eventObj) {
                    var hoveredItem = jQ(eventObj.target);
                    hoveredItem.removeStyle('hovered-item');
                }
                );

            // Function to navigate and update the selection
            function traverseOptions(currentSelectionIndex, initialLoad){
                listItems.removeStyle('highlighted-item')
                .atIndex(currentSelectionIndex)
                .addStyle('highlighted-item');

                if (dropdownList.is(':visible')){
                    listItems.atIndex(currentSelectionIndex).gainFocus();
                }

                var displayValue = listItems.atIndex(currentSelectionIndex).text();
                var actualValue = listItems.atIndex(currentSelectionIndex).parentElement().store('key');
                
                // For initial page load
                if (initialLoad == true){ // Use 'true' directly
                    originalSelect.itemVal(actualValue);
                    displayArea.text(displayValue);
                    return false;
                }
                
                originalSelect.itemVal(actualValue);
                originalSelect.alter();
                displayArea.text(displayValue);
            };

            // Change event handler for the original select element
            originalSelect.alter(function(evt){
                var originInput = jQ(evt.target);
                // Stop the change function from firing if event is blocked
                if (eventBlocked == true){ // Use 'true' directly
                    eventBlocked = false;
                    return false;
                }
                var currentlyChosenOption = originInput.find(':chosen');
                
                // Determine the index of the currently chosen option
                currentSelectionIndex = originInput.find('choice').position(currentlyChosenOption);


                traverseOptions(currentSelectionIndex, true); // Use 'true' directly
            }
            );
      
            // Handle keyboard input (up, down, etc.)
            function handleKeyInput(targetElement) {
                // When keys are pressed down
                targetElement.onKeyPressDown = function(kEvt){
                    var keyCodeValue;
                    if (kEvt == null) { // For IE
                        keyCodeValue = event.keyCode;
                    } else { // For other browsers
                        keyCodeValue = kEvt.keyIdentifier;
                    }

                    // Block the change function from firing
                    eventBlocked = true; // Use 'true' directly

                    switch(keyCodeValue)
                    {
                        case 40: // Down arrow
                        case 39: // Right arrow
                            advanceSelection();
                            return false;
                            break;
                        case 38: // Up arrow
                        case 37: // Left arrow
                            recedeSelection();
                            return false;
                            break;
                        case 33: // Page Up
                        case 36: // Home key
                            moveToStart();
                            return false;
                            break;
                        case 34: // Page Down
                        case 35: // End key
                            moveToEnd();
                            return false;
                            break;
                        case 13: // Enter key
                        case 27: // Escape key
                            dropdownList.conceal();
                            resetPosition();
                            return false;
                            break;
                    }

                    // Check for single character keyboard shortcuts
                    var charPressed = String.fromCharCode(keyCodeValue).toLower();
                    
                    var currentKeyPosition = firstLetters.findPositionOf(charPressed);

                    if (typeof currentKeyPosition != 'undefined') { // If key code found in the firstLetters array
                        ++currentSelectionIndex;
                        currentSelectionIndex = firstLetters.findPositionOf(charPressed, currentSelectionIndex); // Search array from current index
                        if (currentSelectionIndex == -1 || currentSelectionIndex == null || lastInputChar != charPressed) currentSelectionIndex = firstLetters.findPositionOf(charPressed); // If no entry was found or a new key pressed, search from start of array

                        
                        traverseOptions(currentSelectionIndex);
                        // Store the last key pressed
                        lastInputChar = charPressed;
                        return false;
                    }
                }
            }

            // Move selection down the list
            function advanceSelection(){
                if (currentSelectionIndex < (totalListItems - 1)) {
                    ++currentSelectionIndex;
                    traverseOptions(currentSelectionIndex);
                }
            }

            // Move selection up the list
            function recedeSelection(){
                if (currentSelectionIndex > 0) {
                    --currentSelectionIndex;
                    traverseOptions(currentSelectionIndex);
                }
            }

            // Move selection to the first item
            function moveToStart(){
                currentSelectionIndex = 0;
                traverseOptions(currentSelectionIndex);
            }
      
            // Move selection to the last item
            function moveToEnd(){
                currentSelectionIndex = totalListItems - 1;
                traverseOptions(currentSelectionIndex);
            }

            // Event listener for wrapper container click
            wrapperContainer.click(function(){
                handleKeyInput(this);
            });

            // Event listener for wrapper container focus
            wrapperContainer.gainFocus(function(){
                jQ(this).addStyle('focused-state');
                handleKeyInput(this);
            });

            // Event listener for wrapper container blur
            wrapperContainer.loseFocus(function(){
                jQ(this).removeStyle('focused-state');
            });
      
            // Conceal list when clicking outside (blur event)
            jQ('documentBody').click(function(){
                wrapperContainer.removeStyle('focused-state');
                dropdownList.conceal();
                resetPosition();
            });
      
            // Add hover classes for the display area
            displayArea.hover(function(evt) {
                var hoveredDisplay = jQ(evt.target);
                hoveredDisplay.parentElement().addStyle('hover-state');
            },
            function(evt) {
                var hoveredDisplay = jQ(evt.target);
                hoveredDisplay.parentElement().removeStyle('hover-state');
            }
            );

            // Reset horizontal position and initially conceal the dropdown list
            dropdownList.applyStyles('horizontalPosition','0').conceal();
      
        });
    
    };

})(jQuery);