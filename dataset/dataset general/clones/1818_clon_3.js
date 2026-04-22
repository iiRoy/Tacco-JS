(function($){

    // Core functionality for managing simulated dropdowns
    $.fn.extend({
        // Retrieves or sets the current selection value of the custom dropdown.
        // If a value is provided, it updates the hidden select and triggers a change.
        obtainSetSelection: function(chosenValue){
            // If a new value is supplied, update the underlying select and propagate the change.
            if (chosenValue){
                $(this).val(chosenValue).trigger('change');
                return this; // Allow chaining
            } else {
                // Otherwise, return the currently selected value from the native select.
                return $(this).find(':selected').val();
            }
        },
        // Reinitializes the custom dropdown, useful after dynamic updates to the original select.
        reinitialize: function(){
            var cachedSettings = $(this).data('configOptions'); // Retrieve previous configuration
            var $currentSelect = $(this);
            // Remove the existing custom dropdown structure.
            $currentSelect.next('.menuWrapper').remove();
            // Unbind all previous event handlers from the original select and re-apply the plugin.
            $currentSelect.off().fancyDrop(cachedSettings);
        }
    });

    // The main plugin function to convert a <select> element into a styled dropdown.
    $.fn.fancyDrop = function(userSettings) {
  
        return this.each(function(){
            // Ensure the target element is a select.
            if (!$(this).is('select')) {
                console.warn('FancyDropdown: Skipped non-select element.', this);
                return;
            }

            // Default configuration for the dropdown behavior.
            var defaultConfiguration = {
                placeholderPrompt: 'Select an option', // Text to display when nothing is selected
                transitionDuration: 0, // Speed of dropdown animation (0 for instant)
                menuMaxHeight: '200px' // Maximum height for the dropdown menu
            };

            // Merge default settings with user-provided settings.
            var effectiveSettings = $.extend({}, defaultConfiguration, userSettings);

            // Caching the original select element and creating new DOM elements for the custom dropdown.
            var $originalSelect = $(this);
            var $displayArea = $('<div class="selectedDisplay" aria-haspopup="listbox" aria-expanded="false" tabindex="0"></div>');
            var $wrapperElement = $('<div class="menuWrapper" role="combobox" aria-owns="fancy-dropdown-list"></div>');
            var $optionList = $('<ul class="optionList" role="listbox" id="fancy-dropdown-list"></ul>');
            
            // State variables for navigation and interaction.
            var optionCounter = -1; // General counter for options during build
            var activeItemIndex = -1; // Index of the currently selected/highlighted item
            var firstCharKeys = []; // Stores first characters of options for quick navigation
            var lastPressedKey = false; // Tracks the last key pressed for sequential char matching
            var skipChangeEvent = false; // Flag to prevent change event loops
            var $listItems; // Reference to all generated <li> or <a> elements in the custom list

            // Store the effective settings on the original select for reinitialization.
            $originalSelect.data('configOptions', userSettings);
      
            // Build the new list structure and hide the original select.
            $wrapperElement.insertAfter($originalSelect);
            $displayArea.appendTo($wrapperElement);
            $optionList.appendTo($wrapperElement);
            $originalSelect.hide();
            
            // Set an initial minimum width for the wrapper based on the original select's width.
            // This can be overridden by CSS.
            $wrapperElement.css('min-width', $originalSelect.outerWidth() + 'px');

            // Determine if there are optgroups or just direct options.
            if ($originalSelect.children('optgroup').length === 0){
                // Process simple select options.
                $originalSelect.children('option').each(function(idx){
                    var optionText = $(this).text();
                    var optionValue = $(this).val();

                    // Add the first character of each option to the lookup array.
                    firstCharKeys.push(optionText.charAt(0).toLowerCase());

                    // Check if this option is initially selected.
                    if (this.selected){
                        effectiveSettings.placeholderPrompt = optionText;
                        activeItemIndex = idx;
                    }
                    
                    // Append a new list item with a link to the custom unordered list.
                    $optionList.append($('<li><a href="#" role="option">'+optionText+'</a></li>').data('optionValue', optionValue));
                });
                
                // Add a class to the last item for styling purposes.
                $optionList.find('li').filter(':last').addClass('last-item');
                
                // Cache the newly created list item links.
                $listItems = $optionList.children().children();
        
            } else { // Handle select elements with optgroups.
                $originalSelect.children('optgroup').each(function(){
        
                    var groupLabel = $(this).attr('label');
                    var $groupHeader = $('<li class="groupHeading">'+groupLabel+'</li>');
            
                    $groupHeader.appendTo($optionList);

                    var $groupSublist = $('<ul></ul>');
                    $groupSublist.appendTo($groupHeader);

                    $(this).children('option').each(function(){
                        ++optionCounter; // Increment general option counter across all groups
                        var optionText = $(this).text();
                        var optionValue = $(this).val();
                        // Add first character for keyboard navigation.
                        firstCharKeys.push(optionText.charAt(0).toLowerCase());
                        
                        // Check for initial selection.
                        if (this.selected){
                            effectiveSettings.placeholderPrompt = optionText;
                            activeItemIndex = optionCounter;
                        }
                        $groupSublist.append($('<li><a href="#" role="option">'+optionText+'</a></li>').data('optionValue', optionValue));
                    });
                });
                                
                // Cache the list item links within optgroups.
                $listItems = $optionList.find('ul li a');
            }
      
            // Get dimensions of new elements for positioning calculations.
            var currentListHeight = $optionList.outerHeight();
            var totalListItems = $listItems.length;
    
            // If an option was initially selected, update the display.
            if (activeItemIndex !== -1){
                updateSelectionDisplay(activeItemIndex, true); // true for initial load
            } else {
                // Set the placeholder text if no option is selected.
                $displayArea.text(effectiveSettings.placeholderPrompt);
            }

            // Determines if the dropdown menu should open above or below the display area.
            function adjustListPosition(){
                var wrapperTopPos = $wrapperElement.offset().top;
                var viewportHeight = $(window).height();
                var scrollOffset = $(window).scrollTop();
                var calculatedMenuHeight = currentListHeight;

                // Apply max-height if specified and list is taller.
                if (effectiveSettings.menuMaxHeight && currentListHeight > parseInt(effectiveSettings.menuMaxHeight)) {
                    calculatedMenuHeight = parseInt(effectiveSettings.menuMaxHeight);
                    $optionList.css('height', calculatedMenuHeight + 'px'); // Set explicit height for scrolling
                } else {
                    $optionList.css('height', ''); // Reset if not exceeding max
                }

                wrapperTopPos = wrapperTopPos - scrollOffset; // Position relative to viewport top
                
                // Check if the menu would go off-screen if opened downwards.
                if (wrapperTopPos + $wrapperElement.outerHeight() + calculatedMenuHeight >= viewportHeight){
                    // Position above the display area.
                    $optionList.css({
                        top: '-' + (calculatedMenuHeight + 2) + 'px', // +2 for border/padding adjustment
                        height: calculatedMenuHeight // Ensure height is set for scrolling
                    });
                    $originalSelect.data('isAbove', true); // Store direction
                } else {
                    // Position below the display area.
                    $optionList.css({
                        top: '', // Reset top
                        height: calculatedMenuHeight // Ensure height is set for scrolling
                    });
                    $originalSelect.data('isAbove', false);
                }
            }

            // Run position adjustment on page load.
            adjustListPosition();
      
            // Debounce window resize and scroll events for performance.
            var resizeTimer;
            $(window).on('resize.fancyDrop scroll.fancyDrop', function(){
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(adjustListPosition, 50); // Adjust position after a short delay
            });

            // Applies `position: relative` to the wrapper for proper menu positioning.
            function applyPositioning(){
                $wrapperElement.css('position','relative');
            }

            // Resets `position` to `static` when the menu is closed.
            function resetPositioning(){
                $wrapperElement.css('position','static');
            }
      
            // Handle click on the display area to toggle the dropdown menu.
            $displayArea.on('click.fancyDrop', function(event){
                event.stopPropagation(); // Prevent event bubbling up to body click handler

                // Hide all other open custom dropdown menus.
                $('.optionList').not($(this).next()).hide().parent().removeClass('focused');

                // Toggle the visibility of this menu.
                $optionList.toggle();
                
                // Update ARIA attribute.
                $(this).attr('aria-expanded', $optionList.is(':visible'));

                applyPositioning(); // Set wrapper position for menu
                
                // If the menu is now visible, scroll to and focus the active item.
                if ($optionList.is(':visible')) {
                    var $activeLink = $listItems.eq(activeItemIndex);
                    $activeLink.focus();
                    // Scroll the list to make the active item visible if needed.
                    if ($activeLink.length) {
                        var listScrollTop = $optionList.scrollTop();
                        var itemOffset = $activeLink.position().top + listScrollTop;
                        var itemHeight = $activeLink.outerHeight();

                        if (itemOffset + itemHeight > listScrollTop + $optionList.height()) {
                            $optionList.scrollTop(itemOffset - $optionList.height() + itemHeight);
                        } else if (itemOffset < listScrollTop) {
                            $optionList.scrollTop(itemOffset);
                        }
                    }
                } else {
                    resetPositioning(); // Reset wrapper position
                }
            });

            // Handle click on a list item to select it.
            $listItems.on('click.fancyDrop', function(e){
                var $targetItem = $(e.target);

                // Update the active index based on the clicked item.
                activeItemIndex = $listItems.index($targetItem);
        
                // Prevent the original select's change event from firing immediately.
                skipChangeEvent = true;
                updateSelectionDisplay(activeItemIndex); // Update display and hidden select
                
                $optionList.hide(); // Close the menu
                $displayArea.attr('aria-expanded', false); // Update ARIA attribute
                resetPositioning(); // Reset wrapper position
            });
      
            // Add/remove hover class for visual feedback on list items.
            $listItems.hover(
                function() {
                    $(this).addClass('hovered');
                },
                function() {
                    $(this).removeClass('hovered');
                }
            );

            // Updates the displayed text, the hidden select's value, and highlights the active item.
            function updateSelectionDisplay(idx, isInitialLoad){
                // Guard clause for invalid index.
                if (idx < 0 || idx >= totalListItems) return;

                $listItems.removeClass('activeSelection')
                    .eq(idx)
                    .addClass('activeSelection')
                    .attr('aria-selected', 'true') // ARIA for selected item
                    .siblings().removeAttr('aria-selected');

                // If the menu is open, focus the newly active item.
                if ($optionList.is(':visible')){
                    $listItems.eq(idx).focus();
                }

                var selectedText = $listItems.eq(idx).text();
                var selectedValue = $listItems.eq(idx).parent().data('optionValue');
                
                // For initial page load, just set the value and text without triggering change.
                if (isInitialLoad === true){
                    $originalSelect.val(selectedValue);
                    $displayArea.text(selectedText);
                    return; // Exit early
                }
                
                // For user interaction, update hidden select, trigger change, and update display.
                $originalSelect.val(selectedValue).trigger('change');
                $displayArea.text(selectedText);
                $displayArea.attr('aria-activedescendant', $listItems.eq(idx).attr('id')); // ARIA for active item
            }

            // Handle changes to the original select element (e.g., programmatic changes).
            $originalSelect.on('change.fancyDrop', function(event){
                var $triggeredSelect = $(event.target);
                
                // If change was triggered by our custom UI, skip this to prevent loops.
                if (skipChangeEvent === true){
                    skipChangeEvent = false; // Reset flag
                    return;
                }
                
                var $currentOption = $triggeredSelect.find(':selected');
                // Find the index of the currently selected option in the original select.
                activeItemIndex = $triggeredSelect.find('option').index($currentOption);

                // Update the custom UI to reflect the change.
                updateSelectionDisplay(activeItemIndex, true); // Treat as initial load for display purposes
            });
      
            // Handles keyboard navigation within the custom dropdown.
            function handleKeyboardInput(element){
                $(element).on('keydown.fancyDrop', function(e){
                    var keyCodeValue = e.which; // Standardized key code by jQuery
                    
                    // Prevent the original select's change function from firing.
                    skipChangeEvent = true;

                    switch(keyCodeValue)
                    {
                        case 40: // Down arrow
                        case 39: // Right arrow
                            moveSelectionDown();
                            e.preventDefault(); // Prevent default browser scroll
                            break;
                        case 38: // Up arrow
                        case 37: // Left arrow
                            moveSelectionUp();
                            e.preventDefault(); // Prevent default browser scroll
                            break;
                        case 33: // Page Up
                        case 36: // Home key
                            selectFirstItem();
                            e.preventDefault();
                            break;
                        case 34: // Page Down
                        case 35: // End key
                            selectLastItem();
                            e.preventDefault();
                            break;
                        case 13: // Enter key
                            // Select the highlighted item and close the menu.
                            if ($optionList.is(':visible')) {
                                $listItems.eq(activeItemIndex).trigger('click');
                            } else {
                                // If menu is closed, open it on enter.
                                $displayArea.trigger('click');
                            }
                            e.preventDefault();
                            break;
                        case 27: // Escape key
                            $optionList.hide(); // Close menu
                            $displayArea.attr('aria-expanded', false);
                            resetPositioning();
                            e.preventDefault();
                            break;
                        case 32: // Spacebar
                            // Prevent default scroll behavior, but allow character search if menu is open
                            if (!$optionList.is(':visible')) {
                                $displayArea.trigger('click'); // Open menu on spacebar if closed
                                e.preventDefault();
                            }
                            // If menu is open, space acts like a character, handled below.
                            break;
                    }

                    // Handle character-based search (type-ahead).
                    // Check if the key pressed corresponds to a printable character.
                    var charPressed = String.fromCharCode(keyCodeValue).toLowerCase();
                    if (charPressed && charPressed.match(/[a-z0-9]/i)) {
                        var foundKeyIndex = -1;

                        // If the same key is pressed consecutively, search from the next item.
                        if (lastPressedKey === charPressed && activeItemIndex !== -1) {
                            foundKeyIndex = firstCharKeys.indexOf(charPressed, activeItemIndex + 1);
                        }
                        
                        // If no match found or a new key is pressed, search from the beginning.
                        if (foundKeyIndex === -1 || lastPressedKey !== charPressed) {
                            foundKeyIndex = firstCharKeys.indexOf(charPressed);
                        }

                        // If a matching option is found, navigate to it.
                        if (foundKeyIndex !== -1) {
                            activeItemIndex = foundKeyIndex;
                            updateSelectionDisplay(activeItemIndex);
                            // If menu is not open, open it.
                            if (!$optionList.is(':visible')) {
                                $displayArea.trigger('click');
                            }
                        }
                        // Store the last pressed key for sequential character matching.
                        lastPressedKey = charPressed;
                        e.preventDefault(); // Prevent default browser behavior for character keys
                    } else {
                        lastPressedKey = false; // Reset if non-character key is pressed
                    }
                });
            }

            // Moves the selection highlight down the list.
            function moveSelectionDown(){
                if (activeItemIndex < (totalListItems - 1)) {
                    ++activeItemIndex;
                    updateSelectionDisplay(activeItemIndex);
                }
            }

            // Moves the selection highlight up the list.
            function moveSelectionUp(){
                if (activeItemIndex > 0) {
                    --activeItemIndex;
                    updateSelectionDisplay(activeItemIndex);
                }
            }

            // Selects and highlights the first item in the list.
            function selectFirstItem(){
                activeItemIndex = 0;
                updateSelectionDisplay(activeItemIndex);
            }
      
            // Selects and highlights the last item in the list.
            function selectLastItem(){
                activeItemIndex = totalListItems - 1;
                updateSelectionDisplay(activeItemIndex);
            }

            // Bind keyboard input handler to the wrapper element's focus events.
            $wrapperElement.on('focusin.fancyDrop', function(){
                $(this).addClass('focused'); // Add a focus class
                handleKeyboardInput(this); // Enable keyboard control
            });

            $wrapperElement.on('focusout.fancyDrop', function(){
                $(this).removeClass('focused'); // Remove focus class
                $(this).off('keydown.fancyDrop'); // Disable keyboard control when not focused
            });
      
            // Hide the list and reset positioning when clicking outside the component.
            $('body').on('click.fancyDrop', function(e){
                // Check if the click target is outside the wrapper element.
                if (!$(e.target).closest($wrapperElement).length) {
                    $wrapperElement.removeClass('focused');
                    $optionList.hide();
                    $displayArea.attr('aria-expanded', false);
                    resetPositioning();
                }
            });
      
            // Add/remove hover classes for the display area.
            $displayArea.hover(function() {
                $(this).parent().addClass('displayHover');
            },
            function() {
                $(this).parent().removeClass('displayHover');
            });

            // Initialize the list as hidden and positioned correctly.
            $optionList.css('left','0').hide();
        });
    };

})(jQuery);