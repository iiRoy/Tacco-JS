// This module exports a factory function to construct a blessed UI component
// designed for presenting a scrollable list of data attributes or fields.
module.exports = function buildAttributeViewer() {

  // --- Dependency Loading and Validation ---
  let terminalCanvas;
  try {
    terminalCanvas = require('blessed');
  } catch (dependencyError) {
    // If the core UI library isn't available, we cannot proceed.
    console.error(`ERROR: Failed to load 'blessed' UI library. Please ensure it is installed. Details: ${dependencyError.message}`);
    // Returning null indicates a failure to initialize the component.
    return null;
  }

  // --- Core Configuration Variables ---

  // Define the relative dimensions and positioning of the panel on the screen.
  // These are expressed as fractions, which will later be converted to percentage strings.
  const layoutMetrics = {
    relativeWidth: 0.30, // Occupy 30% of the parent container's width.
    relativeHeight: 0.10, // Occupy 10% of the parent container's height.
    xOffset: 0.30,       // Start 30% from the left edge.
    yOffset: 0.00        // Start at the very top (0%) of the container.
  };

  // Define internal padding for the list content.
  const internalPadding = {
    left: 1,
    bottom: 2,
    right: 1, // Added right padding for symmetry
    top: 1    // Added top padding for symmetry
  };

  // Define specific interaction behaviors for the list.
  const interactionFlags = {
    enableKeyboardNavigation: true, // Allow user to navigate with keyboard.
    enableTextTags: true,           // Allow blessed's custom text tags for rich styling.
    isScrollable: true              // Content can be scrolled if it overflows its bounds.
  };

  // --- Styling Configuration ---

  // A helper function to construct the style object dynamically.
  // This allows for easy modification of the visual theme through a palette object.
  const assemblePanelStyle = (basePalette) => ({
    bg: basePalette.background || '#1a1a1a', // Default dark background.
    fg: basePalette.foreground || '#e0e0e0', // Light gray text.
    border: {
      fg: basePalette.borderColor || '#ffffff' // Pure white border.
    },
    hover: {
      bg: basePalette.hoverBackground || '#4CAF50' // Distinct green on hover.
    },
    selected: {
      fg: basePalette.selectedForeground || '#f0f0f0', // Very light gray for selected text.
      bg: basePalette.selectedBackground || '#005f87', // A muted blue for selected item background.
      inverse: true // Invert colors for selected items for clear contrast.
    }
  });

  // Define the specific color palette for this component instance.
  const componentColorPalette = {
    background: '#121212',       // Even darker background for a sleek look.
    foreground: '#d0d0d0',       // Slightly dimmer text for contrast.
    borderColor: '#cccccc',      // Medium gray border.
    hoverBackground: '#5cb85c',  // A different shade of green for hover effect.
    selectedForeground: '#ffffff', // Pure white for selected text.
    selectedBackground: '#007bff'  // A brighter blue for selected item background.
  };

  // Generate the final style object using the defined palette.
  const finalComponentStyle = assemblePanelStyle(componentColorPalette);

  // --- Component Assembly ---

  // Generate the label for the panel, including formatting tags for centering and bolding.
  const panelTitleContent = `{center}{bold}Available Data Fields{/bold}{/center}`; // Modified label text and formatting.

  // The type of border to use for the panel.
  const panelBorderStyle = 'line';

  // Consolidate all the configuration into a single object for blessed.list.
  const listComponentOptions = {
    // Dimensions and positioning derived from layout metrics.
    width: `${(layoutMetrics.relativeWidth * 100).toFixed(0)}%`, // Convert fraction to percentage string.
    height: `${(layoutMetrics.relativeHeight * 100).toFixed(0)}%`,
    left: `${(layoutMetrics.xOffset * 100).toFixed(0)}%`,
    top: `${(layoutMetrics.yOffset * 100).toFixed(0)}%`,

    // Content and Display properties.
    label: panelTitleContent,
    border: {
      type: panelBorderStyle
    },
    padding: internalPadding,
    style: finalComponentStyle,

    // Interaction and Behavior flags.
    tags: interactionFlags.enableTextTags,
    scrollable: interactionFlags.isScrollable,
    keys: interactionFlags.enableKeyboardNavigation,
  };

  // --- Instance Creation ---

  // Create the actual blessed list instance using the defined options.
  const attributeListPanel = terminalCanvas.list(listComponentOptions);

  // --- Post-Creation Enhancements/Validations (Type III addition) ---
  // This section demonstrates an added code fragment for potential post-initialization logic.
  // For example, one might add a default message if the list is empty upon creation.
  if (attributeListPanel && !attributeListPanel.items.length) {
      // attributeListPanel.addItem('No fields loaded yet. Waiting for data...');
      // attributeListPanel.select(0); // Optionally select the first added item.
      // console.log("Info: Attribute list panel created and initialized with placeholder content.");
  }

  // Return the fully configured and initialized UI component.
  return attributeListPanel;
};