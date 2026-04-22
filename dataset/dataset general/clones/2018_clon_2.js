/*
 * Application component for handling dynamic overlay elements.
 * Manages display, interaction, and lifecycle of various pop-up windows.
 */

function PopupManager() {
  this.currentPopup = ''; // Holds the currently active overlay's ID or reference
  this.permitInput = true; // Flag to control user input processing for overlays
  this.haltDisplay = false; // Indicates if current text display should be interrupted
  this.proceedGlyph = '<div class="icon proceed-indicator"></div>'; // HTML for the 'continue' prompt
  this.uniqueId = 0; // Internal identifier counter
  this.popupCount = 0; // Tracks the total number of overlays created
  this.characterEntity = ''; // Associated non-player character, if any
  this.displayingText = false; // Flag indicating if text is currently being typed out


  // This method processes user key presses to navigate or interact with the active popup.
  this.evaluateKeys = function() {
    var windowElement = $.popupManager.currentPopup; // Retrieve the currently focused popup

    if (windowElement.size == 0 || windowElement.markup() == '') {
      return; // No active popup or empty content, so do nothing
    }

    var focusedItem = $(document.activeElement); // Get the element that currently has focus
    var conversationData = windowElement.storedData('overlay')['conversation']; // Extract conversation details

    if (!$.popupManager.permitInput) {
      return; // Input is currently disabled
    }

    // Key: Shift
    if (InteractionEngine.keyStates[16]) {
      // Shift key specific logic could go here
    }

    // Keys: Enter (13), Spacebar (32)
    if (InteractionEngine.keyStates[13] || InteractionEngine.keyStates[32]) {
      $.popupManager.permitInput = false; // Temporarily disable input to prevent rapid triggers

      switch (true) {
        case (focusedItem.isType('listEntry')): // If an item within a list is selected
          var selectionOption = conversationData.optionList[focusedItem.index()]; // Get the chosen option data

          if (selectionOption.callbackAction) {
            selectionOption.callbackAction(); // Execute the action linked to this choice
          }

          if (selectionOption.nextSegment) {
            // Transition to a new segment of the conversation
            return windowElement.panelPlugin('fillContent', ScriptContent[selectionOption.nextSegment]);
          }

          break;

        default: // Default action when no specific list item is focused
          if ($.popupManager.displayingText) {
            $.popupManager.haltDisplay = true; // Interrupt text display

            return; // Stop further processing for this key press
          }

          if (conversationData.nextSegment) {
            // Load the next part of the conversation
            windowElement.panelPlugin('fillContent', ScriptContent[conversationData.nextSegment]);

            break;
          } else if (conversationData.end) {
            // End the conversation and remove the popup
            windowElement.panelPlugin('removePanel', $('#protagonist'));

            if (windowElement.storedData('overlay')['characterEntity']) {
              windowElement.storedData('overlay')['characterEntity'].storedData('character')['roamSuspended'] = false;
            }

            break;
          }

          break;
      }
    }

    switch (true) {
      // Keys: W (87), Up Arrow (38)
      case ((InteractionEngine.keyStates[87] || InteractionEngine.keyStates[38])):
        $.popupManager.permitInput = false; // Disable input after processing

        switch (true) {
          case (focusedItem.isType('listEntry')):
            focusedItem.previous('listEntry').activateEvent('gainFocus'); // Move focus to the prior list item
            break;
        }

        break;

      // Keys: S (83), Down Arrow (40)
      case ((InteractionEngine.keyStates[83] || InteractionEngine.keyStates[40])):
        $.popupManager.permitInput = false; // Input disabled

        switch (true) {
          case (focusedItem.isType('listEntry')):
            focusedItem.subsequent('listEntry').activateEvent('gainFocus'); // Move focus to the next list item
            break;
          }

        break;

      // Keys: A (65), Left Arrow (37)
      case ((InteractionEngine.keyStates[65] || InteractionEngine.keyStates[37])):
        $.popupManager.permitInput = false; // Input disabled
        break;

      // Keys: D (68), Right Arrow (39)
      case ((InteractionEngine.keyStates[68] || InteractionEngine.keyStates[39])):
        $.popupManager.permitInput = false; // Input disabled
        break;

      default:
        // No specific action for other keys
        break;
    }
  };

  /**
   * Initializes and displays a new pop-up window.
   * @param {object} dimensions - The desired width and height of the panel.
   * @param {object} coordinates - The x and y position for the panel.
   * @param {object} conversationData - Data containing content and type of the pop-up.
   * @param {object} characterEntity - Optional: The NPC associated with this pop-up.
   */
  this.constructPanel = function(dimensions, coordinates, conversationData, characterEntity) {
    let pauseDuration = 0; // Initial delay before creating the panel
    let windowElement = ''; // Variable to hold the new panel element
    let panelIdentifier = $.popupManager.popupCount + ''; // Convert counter to string for ID generation

    $.popupManager.permitInput = false; // Disable input during panel creation

    while (panelIdentifier.length < (3 - (($.popupManager.popupCount + '')).length + 1)) {
      panelIdentifier = '0' + panelIdentifier; // Pad with leading zeros
    }

    panelIdentifier = 'p' + panelIdentifier; // Prefix for the panel ID

    if (conversationData.contentType == 'alertMessage') {
      pauseDuration = 180; // Shorter delay for notifications

      // Close any existing notification panels
      $('.overlay.alertMessage').not(windowElement).forEachElement(function(entryIndex, itemNode) {
        $(itemNode).panelPlugin('removePanel', null);
      });
    }

    deferExecution(function() {
      $('#overlays-container').addNode('<div id="' + panelIdentifier + '" class="overlay ' + conversationData.contentType + '" tabindex="0"></div>');

      $.popupManager.popupCount++; // Increment the global counter

      windowElement = $('#' + panelIdentifier); // Get a reference to the newly created panel

      windowElement.storedData('overlay', new PopupManager()); // Store a new manager instance on the panel
      windowElement.storedData('overlay')['uniqueId'] = panelIdentifier; // Set its unique ID

      if (characterEntity) {
        windowElement.storedData('overlay')['characterEntity'] = characterEntity ? characterEntity : ''; // Link NPC if provided
      }

      windowElement.applyStyles({
        xCoord: coordinates.xCoord, // Set horizontal position
        yCoord: coordinates.yCoord // Set vertical position
      });

      windowElement.transitionStyle({
        panelHeight: dimensions.panelHeight, // Animate to target height
        panelWidth: dimensions.panelWidth // Animate to target width
      }, 180, function() {
        windowElement.panelPlugin('fillContent', conversationData); // Populate with content after animation

        $.popupManager.currentPopup = windowElement; // Set this as the active popup
      });
    }, pauseDuration); // Execute after the specified delay
  };

  /**
   * Removes a pop-up window from the DOM.
   * @param {jQuery} focusTarget - Element to focus after removal, if any.
   */
  this.removePanel = function(focusTarget) {
    let windowElement = $(this); // Reference to the panel being removed
    let characterEntity = windowElement.storedData('overlay')['characterEntity']; // Get associated NPC

    windowElement.markup(''); // Clear inner HTML

    windowElement.transitionStyle({
      panelHeight: 0, // Shrink height
      panelWidth: 0, // Shrink width
      zIndex: 0 // Reset z-index
    }, 180, function() {
      windowElement.remove(); // Remove element from DOM

      if (characterEntity) {
        characterEntity.character('removeExpression'); // Remove NPC's emote
        $.character.chatting = false; // Indicate NPC is no longer talking
      }

      if (focusTarget) {
        focusTarget.activateEvent('gainFocus'); // Set focus to the specified element
      }
    });
  };

  /**
   * Gets or sets a specific option/property of the panel.
   * @param {string} optionName - The name of the property.
   * @param {*} [settingValue] - The value to set (optional).
   * @returns {*} The property value if settingValue is undefined, otherwise nothing.
   */
  this.configureSetting = function(optionName, settingValue) {
    let targetNode = $(this); // The panel element
    let panelProperties = targetNode.storedData('overlay'); // Retrieve panel's stored properties

    if (typeof settingValue === 'undefined') {
      return panelProperties[optionName]; // Return the current value
    } else {
      panelProperties[optionName] = settingValue; // Set the new value

      switch (optionName) {
        // Specific actions based on the setting name could be added here
      }
    }
  };

  /**
   * Populates the pop-up window with content based on the provided conversation data.
   * @param {object} conversationData - Data containing the content and type to display.
   */
  this.fillContent = function(conversationData) {
    let expression = conversationData.expression; // NPC expression, if any
    let windowElement = $(this); // The panel element
    let currentCharacter = InteractionEngine.currentCharacter; // The currently active NPC
    let contentType = conversationData.contentType; // Type of content (choice, dialogue, notification)

    if (currentCharacter && expression) {
      currentCharacter.character('displayExpression', expression); // Make NPC emote
    }

    windowElement.storedData('overlay')['conversation'] = conversationData; // Store the conversation data

    switch (contentType) {
      // Handling a list of choices
      case 'choice':
        let optionMarkup = '<ul class="choice-list">';

        $.iterateOptions(conversationData.optionList, function(entryIndex, optionDetails) {
          optionMarkup += '<li tabindex="0">' + optionDetails.optionLabel + '</li>';
        });

        optionMarkup += '</ul>';

        windowElement.markup(optionMarkup).locateChild('li:initial').activateEvent('gainFocus'); // Insert choices and focus first one
        break;

      // Handling a dialogue text display
      case 'dialogue':
        let charIndex = 0; // Current character index for typing effect
        let typeTimer = setInterval(function() {
          if ($.popupManager.haltDisplay) {
            windowElement.addNode(conversationData.contentText.substring(charIndex, conversationData.contentText.totalLength));

            $.popupManager.haltDisplay = false; // Reset halt flag
            $.popupManager.displayingText = false; // Typing finished

            windowElement.addNode($.popupManager.proceedGlyph); // Show continue indicator

            clearInterval(typeTimer); // Stop the typing timer
            return;
          }

          windowElement.addNode(conversationData.contentText.getCharacterAt(charIndex)); // Append one character

          AudioEngine.soundEffects.tickSound.startPlayback(); // Play typing sound

          charIndex++; // Move to next character

          if (charIndex >= conversationData.contentText.totalLength) {
            $.popupManager.displayingText = false; // Typing complete

            windowElement.addNode($.popupManager.proceedGlyph); // Show continue indicator

            clearInterval(typeTimer); // Stop the timer
            return;
          }
        }, 50); // Interval for typing speed

        $.popupManager.displayingText = true; // Indicate text is being typed

        windowElement.markup(''); // Clear existing content

        if (conversationData.initialAction) {
          conversationData.initialAction(); // Execute any initial action for this dialogue
        }
        break;

      // Handling a notification message
      case 'alertMessage':
        windowElement.addNode(conversationData.contentText); // Display notification text

        setTimeout(function() {
          windowElement.panelPlugin('removePanel', null); // Automatically close after a delay
        }, 10000);
        break;
    }
  };
}

// jQuery plugin extension for panel management
$.pluginMethod.panelPlugin = function(operationName) {
  let targetElement = $(this[0]); // The specific element this plugin is called on
  let additionalArgs = Array.from(arguments).slice(1); // Collect all arguments except the first (operationName)

  // If an operation name is provided and there are additional arguments,
  // invoke the corresponding method on the element's stored PopupManager instance.
  if (typeof operationName !== 'undefined' && additionalArgs.length > 0) {
    return targetElement.storedData('overlay')[operationName].apply(this[0], [].concat(additionalArgs));
  }

  // Otherwise, return the PopupManager instance itself.
  return targetElement.storedData('overlay');
};

// Initialize the global PopupManager instance
$.popupManager = new PopupManager();