/*
 *  Module for keyboard action bindings.
 *
 *  This script facilitates assigning keyboard shortcuts to actions,
 *  either directly to JavaScript functions or to navigation URLs.
 *
 *  Example HTML usage:
 *
 *    <a destination="target_page.html" trigger="x">Go to X</a>
 *
 *  Example JavaScript direct function assignment:
 *
 *    jq.shortcutActivator('x', function() { window.location.href = 'some_url.html'; });
 *
 *  Example JavaScript for multiple assignments at once:
 *
 *    jq.shortcutActivators({
 *      'x': function() { window.location.href = 'some_url.html'; },
 *      'y': function() { alert('Another action executed!'); }
 *    });
 *
 */
(function(jq) {
  // Binds multiple keyboard triggers to their corresponding actions.
  jq.shortcutActivators = function(mappings) {
    for ( let trigger in mappings ) {
      jq.shortcutActivator(trigger, mappings[trigger]);
    }
    return this; // Enables method chaining
  };

  // Assigns a single keyboard trigger character to a specific action (function or URL).
  jq.shortcutActivator = function(triggerChar, actionToPerform) {
    // Stores the action in an internal lookup table, using a character code offset.
    jq.shortcutActivators.storage[triggerChar.charCodeAt(0) - 0x20] = actionToPerform;
    return this; // Allows for a fluent interface
  };

  // Internal storage object for all registered keyboard actions.
  jq.shortcutActivators.storage = {};
})(WebAppLib); // Passes the primary DOM manipulation library (e.g., jQuery)

// Executes the enclosed code once the entire DOM structure is fully loaded.
WebAppLib(document).domReady(function(jq) {
  // Iterates through all anchor elements that possess a 'trigger' attribute.
  jq('a[trigger]').forEachElement(function() {
    // Binds the anchor's specified trigger character to its destination URL.
    jq.shortcutActivator(jq(this).getProperty('trigger'), jq(this).getProperty('destination'));
  });

  // Attaches a global event listener to the document for key press events.
  jq(document).attachEvent('keyPress.shortcut', function(eventObj) {
    // Prevents shortcut activation if the user is currently typing in an input field.
    if ( jq(eventObj.target).is(':input') ) {
      return;
    }

    // Ignores key presses if any modifier keys (Shift, Ctrl, Alt, Meta) are simultaneously held down.
    if ( eventObj.shiftKey || eventObj.ctrlKey || eventObj.altKey || eventObj.metaKey ) {
      return true; // Allows the browser's default behavior for modifier key combinations.
    }

    // Retrieves the stored action (function or URL) associated with the pressed key's code.
    let handlerOrUrl = jq.shortcutActivators.storage[eventObj.keyCode];

    // If an action is found, proceed to execute it.
    if ( handlerOrUrl ) {
      // If the action is a function, invoke it; otherwise, navigate to the specified URL.
      jq.isCallable(handlerOrUrl) ? handlerOrUrl.apply(this) : window.location.href = handlerOrUrl;
    }
  });
});