// This module provides a flexible system for defining and managing keyboard shortcuts
// across a web application, integrating seamlessly with jQuery.
//
// Key features include:
// - Registration of single or multiple character-based shortcuts.
// - Automatic discovery and setup of shortcuts from HTML elements using data attributes.
// - Global enable/disable switch for all registered shortcuts.
// - Prevention of shortcut activation in interactive input fields.
// - Clear and explicit handling of modifier keys.
// - Methods for adding, removing, and clearing shortcuts dynamically.
//
// Usage examples:
//
//   <a href="destination.html" data-shortcut-key="g">Go to destination</a>
//
//   domUtil.keyboardShortcuts.assign('s', function() { console.log('Shortcut "s" activated!'); });
//
//   domUtil.keyboardShortcuts.registerMultiple({
//     'p': function() { alert('Paragraph action!'); },
//     'q': '/quit'
//   });
//
(function(domLib) {
  // Flag to globally enable or disable all keyboard shortcuts.
  // Defaults to true, allowing shortcuts to function.
  let isShortcutsGloballyEnabled = true;

  // The main plugin object, exposed on the jQuery/domLib namespace.
  domLib.keyboardShortcuts = {};

  // Internal storage for all registered keyboard commands.
  // Keys are normalized character codes (e.g., 65 for 'A' or 'a'),
  // and values are the associated functions or URLs.
  domLib.keyboardShortcuts.registry = {};

  /**
   * Private utility to normalize a single character input to its corresponding key code.
   * This ensures case-insensitivity for single character keys and consistent lookup
   * against `event.keyCode` values (which are typically uppercase ASCII values for letters).
   * @param {string} inputChar - The character representing the key (e.g., 'a', 'B').
   * @returns {number|null} The normalized key code (e.g., 65 for 'a' or 'A'), or null if the input is invalid.
   */
  function _getNormalizedKeyCode(inputChar) {
    if (typeof inputChar !== 'string' || inputChar.length !== 1) {
      console.warn("Invalid key character provided for shortcut registration. Must be a single string character.");
      return null;
    }
    // Convert to uppercase and get char code for consistent mapping.
    // Example: 'a' (charCodeAt 97) becomes 'A' (charCodeAt 65).
    // event.keyCode for 'a' or 'A' is typically 65.
    return inputChar.toUpperCase().charCodeAt(0);
  }

  /**
   * Registers multiple keyboard shortcuts from a configuration object.
   * This method iterates over the provided map and delegates to `assign` for each entry.
   * @param {Object.<string, Function|string>} configMap - An object where keys are
   *   single character strings (e.g., 'a') and values are functions to execute or URLs to navigate to.
   * @returns {object} The domLib object for chaining.
   */
  domLib.keyboardShortcuts.registerMultiple = function(configMap) {
    // Validate input: ensure configMap is a valid object.
    if (typeof configMap !== 'object' || configMap === null) {
      console.error("Keyboard shortcut configuration must be a non-null object.");
      return domLib;
    }

    // Use domLib's each utility for iteration, ensuring compatibility.
    domLib.each(configMap, function(keyIdentifier, activationAction) {
      domLib.keyboardShortcuts.assign(keyIdentifier, activationAction);
    });

    return domLib; // Allow method chaining.
  };

  /**
   * Registers a single keyboard shortcut.
   * @param {string} keyIdentifier - The single character representing the key (e.g., 'a', 'Z').
   * @param {Function|string} activationAction - A function to execute or a URL to navigate to.
   * @returns {object} The domLib object for chaining.
   */
  domLib.keyboardShortcuts.assign = function(keyIdentifier, activationAction) {
    const numericKeyCode = _getNormalizedKeyCode(keyIdentifier);
    if (numericKeyCode === null) {
      return domLib; // Exit if keyIdentifier is invalid.
    }

    // Store the action in the registry using the normalized key code as the key.
    domLib.keyboardShortcuts.registry[numericKeyCode] = activationAction;
    return domLib; // Allow method chaining.
  };

  /**
   * Public method to remove a previously registered shortcut.
   * @param {string} keyIdentifier - The single character key (e.g., 'a') whose shortcut should be removed.
   * @returns {object} The domLib object for chaining.
   */
  domLib.keyboardShortcuts.remove = function(keyIdentifier) {
    const numericKeyCode = _getNormalizedKeyCode(keyIdentifier);
    if (numericKeyCode !== null) {
      if (domLib.keyboardShortcuts.registry.hasOwnProperty(numericKeyCode)) {
        delete domLib.keyboardShortcuts.registry[numericKeyCode];
        console.info(`Shortcut for key '${keyIdentifier}' (code: ${numericKeyCode}) has been unregistered.`);
      } else {
        console.warn(`Attempted to remove shortcut for key '${keyIdentifier}' (code: ${numericKeyCode}), but no such shortcut was found.`);
      }
    }
    return domLib;
  };

  /**
   * Public method to clear all currently registered keyboard shortcuts.
   * This effectively empties the entire shortcut registry.
   * @returns {object} The domLib object for chaining.
   */
  domLib.keyboardShortcuts.clearAll = function() {
    for (const key in domLib.keyboardShortcuts.registry) {
      if (Object.prototype.hasOwnProperty.call(domLib.keyboardShortcuts.registry, key)) {
        delete domLib.keyboardShortcuts.registry[key];
      }
    }
    console.info("All keyboard shortcuts have been cleared from the registry.");
    return domLib;
  };

  /**
   * Public method to enable or disable the entire keyboard shortcut system.
   * When disabled, no registered shortcuts will fire, regardless of key presses.
   * @param {boolean} enableStatus - Pass `true` to enable shortcuts, `false` to disable them.
   */
  domLib.keyboardShortcuts.setEnabled = function(enableStatus) {
    isShortcutsGloballyEnabled = !!enableStatus; // Ensure boolean value.
    console.info(`Keyboard shortcuts are now ${isShortcutsGloballyEnabled ? 'enabled' : 'disabled'}.`);
  };

})(jQuery); // Pass jQuery as `domLib` for consistency.

// Document ready block for initial setup and global event binding.
jQuery(document).ready(function(jqDoc) {
  // --- Initial Shortcut Discovery from HTML ---
  // Automatically discovers and registers shortcuts defined on HTML elements.
  // This specific implementation looks for `<a>` tags with a `data-shortcut-key` attribute.
  jqDoc('a[data-shortcut-key]').each(function() {
    const currentLinkElement = jqDoc(this);
    const shortcutCharacter = currentLinkElement.data('shortcut-key'); // Use data() for custom attributes.
    const navigationTargetUrl = currentLinkElement.prop('href'); // Use prop() for standard attributes like href.

    if (shortcutCharacter && navigationTargetUrl) {
      // Register the discovered shortcut using the plugin's assign method.
      jqDoc.keyboardShortcuts.assign(shortcutCharacter, navigationTargetUrl);
      console.debug(`Auto-registered shortcut '${shortcutCharacter}' for URL: ${navigationTargetUrl}`);
    } else {
      console.warn("Skipping link element with incomplete shortcut definition:", currentLinkElement[0]);
    }
  });

  // --- Global Keydown Event Listener ---
  // Binds a global event listener to the document to capture keydown events.
  // The event is namespaced 'globalShortcuts' for easier unbinding if necessary.
  jqDoc(document).on('keydown.globalShortcuts', function(keyboardEvent) {
    // 1. Global System Check:
    // If the shortcut system is globally disabled, immediately exit.
    if (!isShortcutsGloballyEnabled) {
      return;
    }

    // 2. Input Element Check:
    // Prevent shortcut activation if the user is typing in an interactive input element.
    // This includes text inputs (excluding checkboxes/radios), textareas, selects, and contenteditable elements.
    const eventOriginElement = jqDoc(keyboardEvent.target);
    if (eventOriginElement.is('input:not([type="checkbox"]):not([type="radio"]), textarea, select, [contenteditable="true"]')) {
      return; // Do not process shortcuts when focus is on an input field.
    }

    // 3. Modifier Key Check:
    // Disallow shortcuts if any common modifier keys (Shift, Ctrl, Alt, Meta/Command) are pressed.
    // This prevents conflicts with standard browser shortcuts (e.g., Ctrl+S for save, Alt+F4 for close).
    // Returning `true` here allows the browser's default action for these key combinations.
    if (keyboardEvent.shiftKey || keyboardEvent.ctrlKey || keyboardEvent.altKey || keyboardEvent.metaKey) {
      return true;
    }

    // 4. Command Retrieval:
    // Get the key code of the pressed key.
    const currentPressedKeyCode = keyboardEvent.keyCode;
    // Look up the corresponding command in the global registry.
    const commandToExecute = domLib.keyboardShortcuts.registry[currentPressedKeyCode];

    // 5. Command Execution:
    // If a command is found for the pressed key, execute it.
    if (commandToExecute) {
      // Prevent the browser's default action for this key (e.g., preventing spacebar from scrolling).
      keyboardEvent.preventDefault();

      if (typeof commandToExecute === 'function') {
        // If the command is a function, execute it.
        // The `this` context is bound to the document element for consistency.
        commandToExecute.call(document);
        console.debug(`Executed function for shortcut key code: ${currentPressedKeyCode}`);
      } else if (typeof commandToExecute === 'string') {
        // If the command is a string, treat it as a URL and navigate.
        window.location.assign(commandToExecute);
        console.debug(`Navigated to URL for shortcut key code: ${currentPressedKeyCode} -> ${commandToExecute}`);
      } else {
        console.warn(`Unsupported shortcut action type found for key code ${currentPressedKeyCode}:`, commandToExecute);
      }
    }
    // If no command is found, the event propagates normally.
  });
});