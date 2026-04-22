require.config({
	// This configuration block is for the module loader (RequireJS).
	// The `resourceVersionString` parameter is appended to the URL of each script
	// loaded via RequireJS. This effectively bypasses browser caching, ensuring
	// that the freshest version of the script is always loaded, especially useful
	// during development or after a deployment.
	resourceVersionString: "cacheTimestampIdentifier=" + Date.now() // Using Date.now() for a more concise timestamp.
});

// The core application logic is encapsulated within this RequireJS callback.
// It waits for its primary dependencies to load before execution.
require(["jquery", "CmdInputProcessor", "CodeTextEditor", "RemoteDataLink"], function(
	domUtils, // The jQuery instance is now referred to as 'domUtils' for clarity.
	CmdInputProcessor, // The Command module is now 'CmdInputProcessor'.
	CodeTextEditor, // The Editor module is now 'CodeTextEditor'.
	RemoteDataLink // The Connection module is now 'RemoteDataLink'.
) {
	// --- Application Global State & Configuration ---
	const isDevelopmentMode = true; // A flag indicating if the environment is for development.
	const applicationKernel = {}; // The central object holding application components and state.

	// Define key application settings and constants in a structured object.
	const systemSettings = {
		editorKeyBindingScheme: "vim", // Default keymap for the code editor.
		editorVisualTheme: "solarized light", // Default visual theme for the code editor.
		domSelectors: {
			statusArea: "#status", // Selector for the status display element.
			mainEditorElement: "#editor", // Selector for the primary code editor's DOM element.
			primaryApplicationContainer: "#mainLayoutContainer", // Renamed from "#container".
			commandInputComponentClass: "inputBarElement" // Renamed from ".bar".
		},
		keyboardEventCodes: {
			spaceKey: 32, // Key code for the spacebar.
			controlKey: 17 // Key code for the Ctrl key (for reference, though not directly used for checking).
		}
	};

	// --- User Interface Component References ---
	applicationKernel.uiComponents = {}; // An object to store references to critical DOM elements.

	// Attempt to retrieve the status display area.
	const statusDisplayElement = domUtils(systemSettings.domSelectors.statusArea);
	if (statusDisplayElement.length === 0) {
		console.warn(`UI Initialization Warning: Status display element not found at '${systemSettings.domSelectors.statusArea}'.`);
		// A placeholder could be created here if the element is optional.
		applicationKernel.uiComponents.statusMessageDisplay = domUtils('<div>').attr('id', 'fallback-status').appendTo('body');
	} else {
		applicationKernel.uiComponents.statusMessageDisplay = statusDisplayElement;
	}

	// Attempt to retrieve the raw DOM element for the main code editor.
	// Using native `document.querySelector` for diverse DOM access methods.
	const rawCodeEditorElement = document.querySelector(systemSettings.domSelectors.mainEditorElement);
	if (!rawCodeEditorElement) {
		console.error(`UI Initialization Error: Main code editor DOM element not found at '${systemSettings.domSelectors.mainEditorElement}'. Core functionality may be impaired.`);
		// This is a critical error; further initialization might be halted or a fallback UI shown.
		return;
	}
	applicationKernel.uiComponents.codeEditorRootElement = rawCodeEditorElement;

	// --- Core Application Module Initialization ---

	// Initialize the code editor instance using its root DOM element and the status display.
	applicationKernel.codeEditorInstance = CodeTextEditor(
		applicationKernel.uiComponents.codeEditorRootElement,
		applicationKernel.uiComponents.statusMessageDisplay
	);

	// Apply the configured keymap and visual theme to the code editor.
	applicationKernel.codeEditorInstance.applyKeyBindingScheme(systemSettings.editorKeyBindingScheme);
	applicationKernel.codeEditorInstance.activateVisualTheme(systemSettings.editorVisualTheme);

	// Initialize the command input processing module.
	applicationKernel.commandInputHandler = new CmdInputProcessor({
		targetEditor: applicationKernel.codeEditorInstance // Renamed 'editor' to 'targetEditor'.
	});

	// Render the command input handler's UI and inject it into the main application container.
	const mainAppContainer = domUtils(systemSettings.domSelectors.primaryApplicationContainer);
	if (mainAppContainer.length > 0) {
		const renderedCommandUI = applicationKernel.commandInputHandler.generateViewOutput(); // Renamed 'render' to 'generateViewOutput'.
		mainAppContainer.prepend(renderedCommandUI.domElement); // Renamed 'el' to 'domElement'.
		applicationKernel.commandInputHandler.setFocusToInput(); // Set initial focus to the command input.
	} else {
		console.error(`UI Initialization Error: Primary application container '${systemSettings.domSelectors.primaryApplicationContainer}' not found.`);
		// Attempt to append to body as a last resort.
		domUtils('body').prepend(applicationKernel.commandInputHandler.generateViewOutput().domElement);
	}


	// Attach a custom event listener to the command input handler for when a command is submitted.
	applicationKernel.commandInputHandler.registerForEvent("commandSubmitted", function(submittedText) { // Renamed 'send' to 'commandSubmitted', 'cmd' to 'submittedText'.
		// Perform a basic validation on the submitted command.
		if (typeof submittedText === 'string' && submittedText.trim().length > 0) {
			applicationKernel.networkLink.dispatchPayload(submittedText); // Renamed 'send' to 'dispatchPayload'.
		} else {
			console.warn("Command Submission Warning: An empty or invalid command was intercepted.");
			// Optionally, provide user feedback through the status display.
			applicationKernel.uiComponents.statusMessageDisplay.text("Warning: Command cannot be empty.");
		}
	});

	// Initialize the remote data link (connection) module.
	applicationKernel.networkLink = RemoteDataLink({
		commandProcessorReference: applicationKernel.commandInputHandler // Renamed 'command' to 'commandProcessorReference'.
	});

	// --- Development Mode Features ---
	// If in development mode, expose the entire application kernel to the global window object.
	if (isDevelopmentMode) {
		// Ensure we are in a browser environment before attempting to access `window`.
		if (typeof window !== 'undefined') {
			window.applicationRuntime = applicationKernel; // Renamed 'window.app' to 'window.applicationRuntime'.
			console.info("Development Mode: Application kernel exposed as 'window.applicationRuntime'.");
		} else {
			console.warn("Development Mode: `window` object not available; cannot expose application kernel.");
		}
	}

	// --- Dynamic UI Component Loading (jQWidgets) ---
	// Load additional UI libraries (like jQWidgets) after the main application setup.
	// This helps in faster initial page load and ensures dependencies are met.
	require(["uiBaseLibrary", "uiButtonWidgets", "uiLayoutSplitter"], function() { // Renamed jqx* modules.
		// Define default options for the splitter component.
		const splitterOptions = {
			width: '100%',
			height: '100%',
			panels: [{
				size: '70%',
				min: 100
			}, {
				size: '30%',
				min: 50
			}], // Added more detailed panel configuration.
			orientation: 'vertical' // Changed default orientation.
		};

		// Check if the jqxSplitter plugin is actually available on the jQuery object.
		if (domUtils.fn && typeof domUtils.fn.jqxSplitter === 'function') {
			domUtils(systemSettings.domSelectors.primaryApplicationContainer).jqxSplitter(splitterOptions);
			console.log("UI Component: jQWidgets Splitter initialized successfully.");
		} else {
			console.error("UI Component Error: jQWidgets Splitter plugin not found. Layout component setup failed.");
		}
	});

	// --- Global Keyboard Interaction Handler ---
	// Attach a global event listener to the document for handling keyboard shortcuts.
	document.addEventListener("keydown", function(keyboardInputEvent) { // Renamed 'event' to 'keyboardInputEvent'.
		const spacebarKeyCode = systemSettings.keyboardEventCodes.spaceKey;
		const isControlModifierActive = keyboardInputEvent.ctrlKey; // Renamed 'ctrlKey'.
		const currentActiveDomElement = document.activeElement; // Renamed 'activeElement'.

		// Early exit if Ctrl key is not pressed or if it's not the spacebar.
		if (!isControlModifierActive || keyboardInputEvent.keyCode !== spacebarKeyCode) { // Renamed 'event.which'.
			return;
		}

		// Prevent the browser's default action for Ctrl+Space (e.g., scrolling).
		keyboardInputEvent.preventDefault();

		// Determine if the command input bar has focus.
		const commandBarElement = applicationKernel.commandInputHandler.domElement.querySelector(`.${systemSettings.domSelectors.commandInputComponentClass}`);
		const isCommandBarCurrentlyFocused = (currentActiveDomElement === commandBarElement);

		// Toggle focus between the command input bar and the code editor.
		if (isCommandBarCurrentlyFocused) {
			applicationKernel.codeEditorInstance.activateInputFocus(); // Renamed 'focus'.
		} else {
			applicationKernel.commandInputHandler.setFocusToInput();
		}
	}, true); // Using `true` for capture phase, allowing the event to be caught before bubbling.
});