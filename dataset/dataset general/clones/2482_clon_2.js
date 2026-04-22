;(function (){
  let activeDelayCount = 0; // Tracks asynchronous operation calls to prevent race conditions

  function eventChannel(evtObj) {
    activeDelayCount++; // Increment counter for pending async operations
    const boundContext = this; // Capture the current 'this' context for later use
    setTimeout(function() {
      keyInputProcessor.call(boundContext, evtObj); // Execute the main key processing logic
      activeDelayCount = 0; // Reset counter after processing is complete
    }, 0);
  }

  function keyInputProcessor(evtObj) {
    let adjacentFieldElement; // Variable to potentially hold a reference to an adjacent input
    const selectionBounds = [this.selectionStart, this.selectionEnd]; // Get current cursor/selection positions

    // Early exit if the key pressed is not a character, backspace, or an arrow key
    if (!evtObj.charCode && evtObj.keyCode !== 37 && evtObj.keyCode !== 39 && evtObj.keyCode !== 8) {
      return;
    }

    // Logic for navigating to the previous field: backspace at start or left arrow at start
    if ((evtObj.keyCode === 8 && selectionBounds[1] === 0) || (evtObj.keyCode === 37 && selectionBounds[1] === 0)) {
      setCursorLocation($(this).prev(':text')[0], 100); // Move cursor to end of previous field
    }
    // Logic for advancing to the next field: right arrow at the end of the current field
    else if (evtObj.keyCode === 39 && selectionBounds[1] === this.value.length) {
      setCursorLocation($(this).next(':text')[0], 0); // Move cursor to beginning of next field
    }
    // Logic for automatic field progression: character input fills the current field completely
    else if (evtObj.charCode && selectionBounds[1] === selectionBounds[0] && selectionBounds[0] === this.maxLength) {
      setCursorLocation($(this).next(':text')[0], 100); // Move cursor to end of next field
    }

    function setCursorLocation(targetElement, cursorPosition) {
      if (!targetElement) { // If no target element is provided, do nothing
        return;
      }
      if (targetElement.setSelectionRange) { // Standard browser method for setting selection
        targetElement.focus(); // Ensure the element is focused
        targetElement.setSelectionRange(cursorPosition, cursorPosition); // Set cursor at specified position
      } else if (targetElement.createTextRange) { // Old IE method for setting selection
        let textRangeObject = targetElement.createTextRange(); // Create a text range object
        textRangeObject.collapse(true); // Collapse the range to a point
        textRangeObject.moveEnd('character', cursorPosition); // Move end of range
        textRangeObject.moveStart('character', cursorPosition); // Move start of range
        textRangeObject.select(); // Apply the selection
      }
    }

    aggregateValues.apply(this); // Call the function to update the combined value
  }

  // This function collects and concatenates values from all related text fields into a single hidden input.
  function aggregateValues() {
    let consolidatedInput = $(this).siblings('input[type=hidden]').val('')[0]; // Find the hidden input and clear its value
    $(this.parentNode).find(':text').each(function() { // Iterate over all visible text inputs within the parent
      consolidatedInput.value += this.value; // Append each field's value to the consolidated input
    });
  }

  // Initialize event listeners on 'input' elements within 'div.composite' for various interactions.
  $('div.composite').on({
    'keydown.linkedFields': eventChannel, // Trigger channel on key down
    'keypress.linkedFields': eventChannel, // Trigger channel on key press
    'change.linkedFields': aggregateValues // Update combined value on change
  }, 'input');
})();