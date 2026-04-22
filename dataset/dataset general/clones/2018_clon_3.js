/*
 *  POPUP WINDOWS MANAGEMENT MODULE
 *  ------------------------------------------------------------------------------------------------------
 *  This module orchestrates the creation, management, and destruction of various
 *  in-game pop-up interfaces, such as dialogue boxes, choice menus, and notifications.
 *  It handles user input interactions, content rendering, and animation effects.
 */

function PopupManager() {
    // Core state variables for the global popup system
    this.currentActivePopup = null; // Reference to the currently focused popup DOM element
    this.inputPermitted     = true; // Flag to control user input processing (e.g., prevent rapid presses)
    this.haltTextAnimation  = false; // Flag to stop ongoing text typing animations
    this.proceedIndicatorHtml = '<div class="action-prompt continue-arrow"></div>'; // HTML for the 'continue' prompt
    this.popupSequenceNumber = 0; // Counter for assigning unique IDs to new popups
    this.isAnimatingText    = false; // Flag indicating if text is currently being animated letter-by-letter

    // Helper method to generate a unique identifier for new popup elements
    // This ensures each popup has a distinct ID in the DOM.
    const generateUniquePopupId = (counterValue) => {
        const base = 'pp'; // Prefix for popup IDs
        const minLength = 3; // Minimum length for the numeric part of the ID
        const currentCountStr = String(counterValue);
        // Pad the number with leading zeros if necessary
        return base + currentCountStr.padStart(minLength, '0');
    };

    /**
     * Processes keyboard input for the active popup window.
     * This method is responsible for navigating choices, advancing dialogue,
     * and dismissing popups based on user key presses.
     */
    this.handleKeyboardInput = function () {
        const activeModalElement = this.currentActivePopup;

        // Early exit if no popup is currently active or if input is temporarily blocked
        if (!activeModalElement || !activeModalElement.length || !activeModalElement.html() || !this.inputPermitted) {
            return;
        }

        const focusedElement = $(document.activeElement);
        const modalMetadata = activeModalElement.data('popupDetails');

        // Ensure modal metadata and content data exist before proceeding
        if (!modalMetadata || !modalMetadata.contentData) {
            console.warn("PopupManager: Missing metadata or content data for active popup.");
            return;
        }

        const activeContent = modalMetadata.contentData;
        let keyPressed = false; // Flag to indicate if a relevant key was pressed

        // Check for 'Enter' (13) or 'Spacebar' (32) press
        if (Game.pressedKeys[13] || Game.pressedKeys[32]) {
            this.inputPermitted = false; // Block further input until action is complete
            keyPressed = true;

            // Handle actions based on the currently focused element within the popup
            if (focusedElement.is('li')) {
                // User has selected a choice from a list
                const selectedChoice = activeContent.choices[focusedElement.index()];

                if (selectedChoice) {
                    if (typeof selectedChoice.action === 'function') {
                        selectedChoice.action(); // Execute associated action
                    }
                    if (selectedChoice.goTo) {
                        // Navigate to a new dialogue path
                        // Using .call to ensure 'this' context is the popup element
                        return $.popupSystem.fillPopupContent.call(activeModalElement[0], Dialogue[selectedChoice.goTo]);
                    }
                }
            } else {
                // No list item is focused, likely a standard dialogue or notification
                if (this.isAnimatingText) {
                    // If text is still typing, cancel the animation and show full text
                    this.haltTextAnimation = true;
                    return; // Input handled, exit
                }

                // If dialogue has a 'goTo' property, populate with new content
                if (activeContent.goTo) {
                    // Using .call to ensure 'this' context is the popup element
                    $.popupSystem.fillPopupContent.call(activeModalElement[0], Dialogue[activeContent.goTo]);
                } else if (activeContent.end) {
                    // If dialogue signals end, destroy the popup
                    // Using .call to ensure 'this' context is the popup element
                    $.popupSystem.dismissPopup.call(activeModalElement[0], $('#player'));

                    // If an NPC was associated, unpause their wandering behavior
                    const associatedCharacter = modalMetadata.characterRef;
                    if (associatedCharacter && associatedCharacter.data('characterData')) {
                        associatedCharacter.data('characterData').movementPaused = false;
                    }
                }
            }
        }

        // Handle navigation keys: Up (38) / W (87), Down (40) / S (83)
        // These keys primarily navigate list items (choices)
        if (Game.pressedKeys[87] || Game.pressedKeys[38]) { // Up / W
            this.inputPermitted = false;
            keyPressed = true;
            if (focusedElement.is('li')) {
                focusedElement.prev('li').trigger('focus');
            }
        } else if (Game.pressedKeys[83] || Game.pressedKeys[40]) { // Down / S
            this.inputPermitted = false;
            keyPressed = true;
            if (focusedElement.is('li')) {
                focusedElement.next('li').trigger('focus');
            }
        }

        // Left (37) / A (65) and Right (39) / D (68) are currently handled but perform no action
        if (Game.pressedKeys[65] || Game.pressedKeys[37] || Game.pressedKeys[68] || Game.pressedKeys[39]) {
            this.inputPermitted = false;
            keyPressed = true;
            // No specific action for these keys in the current context
        }

        // Optional: Prevent default browser actions for handled keys if needed
        // if (keyPressed) {
        //     // e.preventDefault(); // Would need event object
        // }
    };

    /**
     * Initiates the creation of a new popup window on the screen.
     *
     * @param {object} dimensions - Object containing 'width' and 'height' for the popup.
     * @param {object} coordinates - Object containing 'left' and 'top' for the popup's position.
     * @param {object} contentData - Data structure defining the popup's content (e.g., text, choices, type).
     * @param {jQuery} characterRef - Optional jQuery object reference to an associated NPC.
     */
    this.spawnPopup = function (dimensions, coordinates, contentData, characterRef) {
        let executionDelay = 0; // Initial delay before popup creation
        const currentPopupId = generateUniquePopupId(this.popupSequenceNumber);

        // Input validation for essential parameters
        if (!dimensions || typeof dimensions.width === 'undefined' || typeof dimensions.height === 'undefined' ||
            !coordinates || typeof coordinates.left === 'undefined' || typeof coordinates.top === 'undefined' ||
            !contentData || !contentData.type) {
            console.error("PopupManager: Invalid parameters for spawning a popup.", { dimensions, coordinates, contentData });
            return;
        }

        // For 'notification' type popups, clear existing notifications and apply a short delay
        if (contentData.type === 'notification') {
            executionDelay = 180; // Small delay for notification popups
            // Immediately destroy all other active notification popups to prevent stacking
            $('.popup-window.notification-type').not('#' + currentPopupId).each(function () {
                // Using .call to ensure 'this' context is the popup element
                $.popupSystem.dismissPopup.call(this, null);
            });
        }

        // Block user input briefly during popup creation
        this.inputPermitted = false;

        // Schedule the popup creation after a potential delay
        setTimeout(() => {
            const popupHtml = `<div id="${currentPopupId}" class="popup-window ${contentData.type}-type" tabindex="0"></div>`;
            $('#popupContainer').append(popupHtml); // Append to a dedicated container element

            this.popupSequenceNumber++; // Increment the global counter

            const newPopupElement = $('#' + currentPopupId);

            // Store popup-specific metadata on the DOM element itself
            newPopupElement.data('popupDetails', {
                uniqueId: currentPopupId,
                contentData: null, // Will be populated later
                characterRef: characterRef || null
            });

            // Set initial position
            newPopupElement.css({
                left: coordinates.left,
                top: coordinates.top
            });

            // Animate the popup into its final size
            newPopupElement.animate({
                height: dimensions.height,
                width: dimensions.width
            }, 180, () => {
                // Once animation is complete, populate content and set as active
                // Using .call to ensure 'this' context is the popup element
                $.popupSystem.fillPopupContent.call(newPopupElement[0], contentData);
                this.currentActivePopup = newPopupElement; // Set this new popup as the globally active one
                newPopupElement.trigger('focus'); // Give focus to the new popup
            });
        }, executionDelay);
    };

    /**
     * Removes a popup window from the DOM.
     *
     * @param {jQuery} elementToFocus - Optional jQuery object of an element to focus after destruction.
     */
    this.dismissPopup = function (elementToFocus) {
        const targetPopupElement = $(this); // 'this' refers to the DOM element of the popup being destroyed

        // Guard clause: ensure the element exists and has popup data
        if (!targetPopupElement || !targetPopupElement.length || !targetPopupElement.data('popupDetails')) {
            console.warn("PopupManager: Attempted to dismiss an invalid or non-existent popup element.");
            return;
        }

        const popupMetadata = targetPopupElement.data('popupDetails');
        const associatedCharacter = popupMetadata.characterRef;

        // Clear its HTML content before animation (optional, but good for cleanup)
        targetPopupElement.html('');

        // Animate the popup out of view
        targetPopupElement.animate({
            height: 0,
            width: 0,
            opacity: 0 // Also fade it out
        }, 180, () => {
            targetPopupElement.remove(); // Remove element from DOM after animation

            // If this was the active popup, clear the global reference
            if (this.currentActivePopup && this.currentActivePopup[0] === targetPopupElement[0]) {
                this.currentActivePopup = null;
            }

            // If an NPC was associated, destroy their emote and reset talking status
            if (associatedCharacter) {
                if (associatedCharacter.npc && typeof associatedCharacter.npc === 'function') {
                    associatedCharacter.npc('destroyEmote');
                }
                if ($.npc) { // Check if $.npc global exists
                    $.npc.talking = false;
                }
            }

            // If an element was specified to receive focus, trigger it
            if (elementToFocus && elementToFocus.length) {
                elementToFocus.trigger('focus');
            }
        });
    };

    /**
     * Manages specific properties of a popup window.
     * Can be used as a getter or setter.
     *
     * @param {string} propertyKey - The name of the property to get or set.
     * @param {*} [newValue] - The value to set for the property (if acting as a setter).
     * @returns {*} The property value if acting as a getter, or the popup element if acting as a setter.
     */
    this.accessPopupProperty = function (propertyKey, newValue) {
        const popupElement = $(this); // 'this' refers to the DOM element of the popup
        const popupData = popupElement.data('popupDetails');

        if (!popupData || typeof propertyKey !== 'string') {
            console.error("PopupManager: Invalid popup data or property key for accessPopupProperty.", { popupData, propertyKey });
            return undefined;
        }

        if (typeof newValue === 'undefined') {
            // Getter: return the value of the specified property
            return popupData[propertyKey];
        } else {
            // Setter: set the value of the specified property
            popupData[propertyKey] = newValue;
            // No specific actions needed based on propertyKey in this clone,
            // as the original switch was empty.
            return popupElement; // Return the element for chaining
        }
    };

    /**
     * Fills a popup window with content based on the provided dialogue data.
     * This handles different popup types like 'choice', 'dialogue', and 'notification'.
     *
     * @param {object} contentData - The data structure containing content details.
     */
    this.fillPopupContent = function (contentData) {
        const targetPopupElement = $(this); // 'this' refers to the DOM element of the popup
        const popupMetadata = targetPopupElement.data('popupDetails');

        // Guard clause for invalid content data
        if (!contentData || typeof contentData.type === 'undefined') {
            console.error("PopupManager: Invalid content data provided for fillPopupContent.", contentData);
            return;
        }

        // Store the content data directly on the popup's metadata
        popupMetadata.contentData = contentData;

        const currentCharacter = Game.activeNPC; // Assuming Game.activeNPC is a global reference
        const emoteType = contentData.emote;

        // If an NPC is active and an emote is specified, trigger it
        if (currentCharacter && emoteType && currentCharacter.npc && typeof currentCharacter.npc === 'function') {
            currentCharacter.npc('emote', emoteType);
        }

        // Clear previous content before populating new
        targetPopupElement.html('');

        // Handle content based on the popup's type
        switch (contentData.type) {
            case 'choice':
                // Generate an unordered list of choices
                let choiceListHtml = '<ul class="choice-options">';
                contentData.choices.forEach((choiceItem, index) => {
                    choiceListHtml += `<li tabindex="0" data-choice-index="${index}">${choiceItem.label}</li>`;
                });
                choiceListHtml += '</ul>';

                targetPopupElement.html(choiceListHtml);
                targetPopupElement.find('li:first').trigger('focus'); // Focus the first choice
                break;

            case 'dialogue':
                // Implement a text typing animation effect
                let characterIndex = 0;
                this.isAnimatingText = true;
                this.haltTextAnimation = false; // Reset halt flag

                // Use an interval to type out characters sequentially
                const typingInterval = setInterval(() => {
                    if (this.haltTextAnimation) {
                        // If animation is halted, immediately append remaining text
                        targetPopupElement.append(contentData.text.substring(characterIndex));
                        this.haltTextAnimation = false;
                        this.isAnimatingText = false;
                        targetPopupElement.append(this.proceedIndicatorHtml); // Show continue indicator
                        clearInterval(typingInterval);
                        return;
                    }

                    if (characterIndex < contentData.text.length) {
                        // Append one character at a time
                        targetPopupElement.append(contentData.text.charAt(characterIndex));

                        // Play a sound effect for each character if available
                        if (Sounds && Sounds.fx && Sounds.fx.bip) {
                            Sounds.fx.bip.play();
                        }
                        characterIndex++;
                    } else {
                        // All text has been typed
                        this.isAnimatingText = false;
                        targetPopupElement.append(this.proceedIndicatorHtml); // Show continue indicator
                        clearInterval(typingInterval);
                    }
                }, 50); // Typing speed: 50ms per character

                // Execute any associated action for the dialogue immediately
                if (typeof contentData.action === 'function') {
                    contentData.action();
                }
                break;

            case 'notification':
                // Simply append the text for a notification
                targetPopupElement.append(contentData.text);

                // Automatically destroy notification after a delay
                setTimeout(() => {
                    // Using .call to ensure 'this' context is the popup element
                    $.popupSystem.dismissPopup.call(targetPopupElement[0], null);
                }, 10000); // Notification remains for 10 seconds
                break;

            default:
                console.warn(`PopupManager: Unknown content type encountered: ${contentData.type}`);
                break;
        }
    };
}

// Define a jQuery plugin to interact with the global PopupManager instance.
// This allows calling PopupManager methods directly on jQuery objects representing popups.
$.fn.popupWindow = function (operation) {
    const targetElement = $(this[0]); // The DOM element on which the method is called
    const additionalArgs = Array.prototype.slice.call(arguments, 1); // Remaining arguments

    // Ensure there's a valid element and a global popup system
    if (!targetElement.length || !$.popupSystem) {
        console.error("PopupManager: Invalid target element or global popup system not initialized.");
        return this; // Return original jQuery object for chaining
    }

    // If an operation (method name) is provided, attempt to call it on the global system
    if (typeof operation === 'string' && $.popupSystem[operation]) {
        // Call the method on the global $.popupSystem instance,
        // but bind 'this' to the target DOM element for context.
        return $.popupSystem[operation].apply(targetElement[0], additionalArgs);
    }

    // If no operation or an invalid one, or if it's a getter for popup details
    const popupDetails = targetElement.data('popupDetails');
    if (popupDetails) {
        return popupDetails; // Return the stored popup-specific data
    }

    return this; // Default return for chaining
};

// Instantiate the global popup manager
// This single instance will handle all global popup state and methods.
$.popupSystem = new PopupManager();