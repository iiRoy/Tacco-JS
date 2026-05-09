// This file orchestrates the display of interactive UI elements.
// It leverages a custom module to provide dynamic visual feedback on user interaction.

// Begin by importing our specialized interaction processing utility.
// This utility handles visual effects like ripples upon user engagement.
const UiEffectProcessor = require("/lib/Ti.RippleEffect"); // Renamed module variable.

// Define a foundational configuration for our UI elements.
const baseComponentSettings = {
    // A standard border style for visual distinction.
    defaultBorder: {
        width: 1,
        color: "#CCCCCC", // A light grey border
        radius: 8 // Slightly rounded corners
    },
    // Common interactivity flag.
    activatesOnTouch: true
};

// Initialize the primary application window.
// This serves as the main container for all interactive components.
const mainDisplayWindow = Ti.UI.createWindow({
    backgroundColor: "#1A1A1A", // A dark grey background, changed from pure black.
    title: "Dynamic Interaction Showcase", // Added a window title.
    exitOnClose: true // Ensuring the app closes when this window is dismissed.
});

// Define the specifications for various interactive regions within the window.
// Each specification includes visual properties and layout information.
const interactiveRegionSpecs = [
    {
        // Specification for the top-most, wide interactive area.
        identifier: "UpperInteractionZone",
        colorCode: "#DC143C", // Crimson red, changed from 'red'
        dimensions: { primary: 320, secondary: 150 },
        placement: { vertical: 0, horizontal: 0 } // Top:0, Left:0
    },
    {
        // Specification for the bottom-left interactive segment.
        identifier: "LowerLeftSegment",
        colorCode: "#4169E1", // Royal blue, changed from 'blue'
        dimensions: { primary: 160, secondary: 150 },
        placement: { vertical: 150, horizontal: 0 } // Top:150, Left:0
    },
    {
        // Specification for the bottom-right interactive section.
        identifier: "LowerRightSection",
        colorCode: "#3CB371", // Medium sea green, changed from 'green'
        dimensions: { primary: 160, secondary: 150 },
        placement: { vertical: 150, horizontal: null, alignRight: 0 } // Top:150, Right:0
    },
    {
        // Specification for the final, wide interactive panel.
        identifier: "BottomFullPanel",
        colorCode: "#9370DB", // Medium purple, changed from 'purple'
        dimensions: { primary: 320, secondary: 150 },
        placement: { vertical: 300, horizontal: 0 } // Top:300, Left:0
    }
];

// A collection to hold references to the created UI components.
const uiComponents = [];

// Iterate through the specifications to construct and add each component.
interactiveRegionSpecs.forEach(spec => {
    // Create a new generic view element based on the current specification.
    const currentComponent = Ti.UI.createView({
        width: spec.dimensions.primary,
        height: spec.dimensions.secondary,
        backgroundColor: spec.colorCode,
        top: spec.placement.vertical,
        left: spec.placement.horizontal !== null ? spec.placement.horizontal : undefined, // Conditionally assign left
        right: spec.placement.alignRight !== undefined ? spec.placement.alignRight : undefined, // Conditionally assign right
        // Apply common interactive properties from base settings.
        isTouchResponsive: baseComponentSettings.activatesOnTouch,
        borderColor: baseComponentSettings.defaultBorder.color,
        borderWidth: baseComponentSettings.defaultBorder.width,
        borderRadius: baseComponentSettings.defaultBorder.radius,
        // Add a unique identifier for debugging and clarity.
        id: spec.identifier
    });

    // Add the newly created component to our main window.
    mainDisplayWindow.add(currentComponent);
    // Store it in our collection for potential future reference or manipulation.
    uiComponents.push(currentComponent);
});

// Attach a global event listener to the main window to capture click events.
// This listener will delegate the processing of interactive elements.
mainDisplayWindow.addEventListener("click", function(eventData) {
    // Pre-check: Ensure the event object and its source are valid.
    // This is a guard clause to prevent errors from undefined sources.
    if (!eventData || !eventData.source) {
        console.warn("An interaction occurred without a traceable source. Skipping effect.");
        return; // Early exit if event data is incomplete.
    }

    const interactedElement = eventData.source;

    // Validate if the clicked element is intended to trigger an effect.
    // We check for the 'isTouchResponsive' flag we set during creation.
    if (interactedElement.isTouchResponsive) {
        // Delegate the visual effect generation to our imported module.
        // The module's 'create' method expects the full event object to determine effect parameters.
        UiEffectProcessor.create(eventData);
        // Log the interaction for debugging and confirmation.
        console.info(`Triggered effect on: ${interactedElement.id || 'an unknown interactive element'}`);
    } else {
        // If the element is not marked as touch-responsive, no effect is applied.
        console.debug(`Interaction on non-responsive element: ${interactedElement.id || 'unknown'}. No effect.`);
        // Optional: Could add a subtle non-ripple feedback here, e.g., a slight opacity change.
    }
});

// Final step: Display the main application window to the user.
// This makes all the configured UI elements visible and interactive.
mainDisplayWindow.open();

// A small delay to log a message after the window has had a moment to open.
setTimeout(() => {
    console.log("Application window is now active and ready for interactions.");
    // Further Type III additions could include:
    // - Dynamically adding another view after a delay.
    // - Updating properties of an existing view based on a timer.
    // - Displaying a temporary toast message to the user.
}, 1500);