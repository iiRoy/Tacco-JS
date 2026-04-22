let tuiLib = require('blessed');
let hostEnv = tuiLib.program();

module.exports = function(sessionConfig) {
  // A collection of external interaction callbacks provided by the consumer.
  const interactionHandlers = {
    onUserMessageSent: function(payload) {
      // Default handler: does nothing.
      // This will be overridden by the consumer.
    }
  };

  // The primary display area for the application.
  // This is where all UI elements will be rendered.
  const rootContainer = tuiLib.screen({
    // Enable mouse events for interaction.
    mouse: true,
    // Enable key events for interaction.
    keys: true,
    // Automatically exit the program on `C-c`.
    // We'll override this with our custom handler for cleanup.
    exitOnBlur: false,
    // Set the default color palette.
    // This ensures consistent styling.
    autoPadding: true,
    // Allow for a smoother rendering experience.
    smartCSR: true
  });

  // Configuration for the conversation log display area.
  // This box will show all incoming and outgoing messages.
  const conversationLogConfig = {
    // Position the log at the top, spanning full width.
    top: 0,
    left: '0%',
    right: '0%',
    // Reserve space at the bottom for the input field.
    bottom: 3,
    // Initial placeholder text.
    content: `Welcome, ${sessionConfig ? sessionConfig.userName || 'Guest' : 'Guest'}! Start typing to chat.`,
    // Enable blessed's tag system for rich text formatting.
    tags: true,
    // Make the content scrollable when it overflows.
    scrollable: true,
    // Always keep the scrollbar visible.
    alwaysScroll: true,
    // Customize the scrollbar appearance.
    scrollbar: {
      ch: ' ', // Character for the scrollbar track.
      inverse: true, // Invert colors for visibility.
      track: {
        bg: 'grey' // Background color of the scrollbar track.
      },
      style: {
        bg: 'blue' // Background color of the scrollbar thumb.
      }
    },
    // Define the default text color for the log.
    style: {
      fg: 'lightwhite',
      bg: 'black'
    },
    // Add a border to visually separate it.
    border: {
      type: 'line',
      fg: 'gray'
    },
    // Internal padding for better readability.
    padding: {
      top: 0,
      right: 1,
      bottom: 0,
      left: 1
    }
  };
  const dialogLog = tuiLib.box(conversationLogConfig);

  // Configuration for the user input text area.
  // This is where the user types their messages.
  const userEntryFieldConfig = {
    // Position the input field at the very bottom.
    bottom: 0,
    left: '0%',
    right: '0%',
    // Fixed height for the input box.
    height: 3,
    // Enable input capabilities.
    input: true,
    // Automatically focus the input when the application starts.
    inputOnFocus: true,
    // Allow mouse interaction with the field.
    mouse: true,
    // Make the element clickable.
    clickable: true,
    // Give it initial focus.
    focused: true,
    // No initial text content.
    value: '', // Using 'value' for textarea content.
    // Add a border to the input field.
    border: {
      type: 'line',
      fg: 'cyan'
    },
    // Define the default text color for the input.
    style: {
      fg: 'white',
      bg: 'black',
      focus: {
        border: {
          fg: 'green'
        }
      }
    }
  };
  const inputPrompt = tuiLib.textarea(userEntryFieldConfig);

  // Helper function to manage scrolling the dialog log.
  const scrollLogView = (direction) => {
    // Ensure the dialog log exists and is scrollable.
    if (!dialogLog || !dialogLog.scrollable) {
      return; // Exit if not properly initialized or not scrollable.
    }
    dialogLog.scroll(direction);
    rootContainer.render(); // Re-render the display to show scroll changes.
  };

  // Attach mouse wheel event handlers for scrolling the dialog log.
  dialogLog.on('wheelup', () => scrollLogView(-1));
  dialogLog.on('wheeldown', () => scrollLogView(1));

  // Add the UI elements to the main screen container.
  rootContainer.append(dialogLog);
  rootContainer.append(inputPrompt);

  // Set initial focus to the input prompt, allowing immediate typing.
  rootContainer.focusPush(inputPrompt);

  // Global keybinding for exiting the application (Ctrl+C).
  // This ensures a clean shutdown.
  hostEnv.key('C-c', (char, key) => {
    // Clear and hide all UI components before exiting.
    dialogLog.setContent('');
    dialogLog.hide();
    inputPrompt.hide();
    rootContainer.render(); // Ensure changes are flushed.

    // Restore terminal to its original state.
    hostEnv.clear();
    hostEnv.disableMouse();
    hostEnv.showCursor();
    hostEnv.normalBuffer();

    // Terminate the Node.js process.
    global.process.exit(0);
  });

  // Initialize the terminal environment for the blessed application.
  hostEnv.alternateBuffer(); // Use an alternate screen buffer.
  hostEnv.enableMouse(); // Enable mouse input.
  hostEnv.clear(); // Clear the terminal screen.
  rootContainer.render(); // Perform initial rendering of the UI.


  /**
   * Appends a new message entry to the conversation log display.
   *
   * @param {string} entryContent - The main text of the message.
   * @param {string} entryAuthor - The name of the sender.
   * @param {string} highlightColor - The color to use for the sender's name.
   */
  const appendLogEntry = (entryContent, entryAuthor, highlightColor) => {
    if (!dialogLog || typeof entryContent !== 'string' || entryContent.trim().length === 0) {
      console.error('Invalid message content provided for logging.');
      return;
    }

    // Ensure the author name is present.
    const displayAuthor = entryAuthor || 'System';
    // Format the message using blessed's tag system.
    const formattedMessage = `{bold}{#${highlightColor || 'white'}-fg}${displayAuthor}:{/} ${entryContent}`;

    // Add the message to the bottom of the log.
    dialogLog.insertBottom(formattedMessage);
    // Automatically scroll to the very end to show the newest message.
    dialogLog.setScrollPerc(100);

    // Refresh the display to show the newly added message.
    rootContainer.render();
  };

  // Event handler for when the user presses 'Enter' in the input field.
  inputPrompt.key('enter', () => {
    // Retrieve and sanitize the user's input.
    const submittedContent = inputPrompt.value.trim();

    // Only process non-empty messages.
    if (submittedContent.length > 0) {
      // Invoke the external callback with the submitted message.
      interactionHandlers.onUserMessageSent(submittedContent);
    }
    // Clear the input field after submission, regardless of content.
    inputPrompt.setValue('');
    // Re-render to show the cleared input.
    rootContainer.render();
  });

  // Expose the necessary functions and properties to the module consumer.
  return {
    // Function to add messages to the display.
    displayNewMessage: appendLogEntry,
    // Object containing callback hooks for external interactions.
    interactionHooks: interactionHandlers,
    // Optionally, expose UI elements for advanced control.
    getDisplayElement: () => dialogLog,
    getInputElement: () => inputPrompt,
    getScreenElement: () => rootContainer
  };
};