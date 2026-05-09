var ApplicationOrchestrator;

// This IIFE defines the core application orchestrator responsible for
// initiating the workspace setup process.
ApplicationOrchestrator = (function() {

  /**
   * Initializes a new instance of the ApplicationOrchestrator.
   * This class acts as the primary entry point for setting up the design environment.
   * @param {object} [initialConfig={}] - Optional configuration object for the orchestrator.
   */
  function ApplicationOrchestrator(initialConfig = {}) {
    // Store configuration, though not extensively used in this simplified version.
    this.runtimeConfig = initialConfig;
    // The actual resource provisioner is instantiated here to begin the setup.
    // This could be made lazy or configurable.
    this.environmentPreparer = new ResourceProvisioner();
  }

  // Returns the constructor function for the orchestrator.
  return ApplicationOrchestrator;

})();


var ResourceProvisioner;

// This IIFE encapsulates the functionality for preparing the design canvas,
// including document creation, guide placement, and layer structuring.
ResourceProvisioner = (function() {

  /**
   * Constructor for the ResourceProvisioner.
   * It immediately attempts to establish the working document and then
   * kicks off the complex setup routines.
   */
  function ResourceProvisioner() {
    // Basic validation for the 'app' object, which is expected to be global.
    if (typeof app === 'undefined' || !app.activeDocument) {
      // In a real scenario, this might throw an error or handle gracefully.
      // For a clone, a console warning is sufficient.
      console.warn("Adobe application environment 'app' not found or no active document.");
      // Initialize internal document reference to null if no app context.
      this.targetCanvas = null;
    } else {
      // If app exists, proceed with initial setup.
      // The suspendHistory call groups multiple operations into a single history state.
      // We pass a function reference instead of a string to ensure correct context.
      app.activeDocument.suspendHistory("Workspace Initialization", this.orchestratePreparation.bind(this));
    }
  }

  /**
   * Orchestrates the primary preparation steps for the design workspace.
   * This method ensures the document is ready before adding guides and layers.
   * @returns {boolean} True if preparation was successful, false otherwise.
   */
  ResourceProvisioner.prototype.orchestratePreparation = function() {
    // Ensure we have a valid settings object to proceed.
    if (!settings || typeof settings !== 'object') {
      console.error("Configuration 'settings' object is missing or invalid.");
      return false; // Indicate failure
    }

    // First, ensure the canvas exists and is active.
    // This step was moved from the constructor to here for better control flow.
    this.establishWorkingDocument(settings.canvasDimensions);

    // If the canvas wasn't successfully established, we cannot proceed.
    if (!this.targetCanvas) {
      console.error("Failed to establish active document; cannot proceed with setup.");
      return false;
    }

    // Now, apply the visual aids (guides) based on the settings.
    this.populateVisualAids(settings.alignmentAids);

    // Finally, build the layer structure as defined in settings.
    const layerSetupResult = this.structureLayerHierarchy(settings.layerTree);

    // Log completion message.
    console.info("Workspace preparation complete.");
    return layerSetupResult !== null; // Return based on layer setup success.
  };

  /**
   * Ensures an active document exists or creates a new one.
   * @param {object} docSettings - Settings for creating a new document (width, height, resolution, mode).
   */
  ResourceProvisioner.prototype.establishWorkingDocument = function(docSettings) {
    // If there are no open documents, create a new one using provided settings.
    if (app.documents.length === 0 && docSettings) {
      try {
        // Use default resolution (72) and document name if not provided.
        const effectiveResolution = docSettings.resolution || 72;
        const effectiveName = docSettings.name || "Untitled Workspace";
        app.documents.add(
          docSettings.width,
          docSettings.height,
          effectiveResolution,
          effectiveName,
          NewDocumentMode.RGB // Assuming RGB mode is standard for design
        );
        console.log(`New document '${effectiveName}' created.`);
      } catch (error) {
        console.error("Error creating new document:", error);
        this.targetCanvas = null;
        return; // Exit if document creation fails.
      }
    }
    // Assign the currently active document to our internal reference.
    this.targetCanvas = app.activeDocument;

    // Optional: Add a simple check to ensure the document is valid.
    if (!this.targetCanvas) {
        console.error("No active document could be established.");
    }
  };

  /**
   * Adds horizontal and vertical guides to the active document.
   * @param {object} aidConfigurations - An object containing 'horizontal' and 'vertical' arrays of guide positions.
   */
  ResourceProvisioner.prototype.populateVisualAids = function(aidConfigurations) {
    if (!this.targetCanvas) {
      console.warn("Cannot add guides: No active document available.");
      return;
    }
    if (!aidConfigurations || typeof aidConfigurations !== 'object') {
      console.warn("Invalid or missing guide configurations.");
      return;
    }

    const processGuidePositions = (positions, direction) => {
      if (!Array.isArray(positions)) {
        console.warn(`Invalid guide list for ${direction} direction.`);
        return;
      }
      for (let k = 0, numPositions = positions.length; k < numPositions; k++) {
        const coordinateVal = positions[k];
        // Ensure coordinate is a number before processing.
        if (typeof coordinateVal === 'number') {
          // Round to nearest pixel to avoid sub-pixel issues.
          const positionString = `${Math.round(coordinateVal)} pixels`;
          this.targetCanvas.guides.add(direction, UnitValue(positionString));
        } else {
          console.warn(`Skipping invalid guide position: ${coordinateVal}`);
        }
      }
    };

    // Process horizontal guides.
    processGuidePositions(aidConfigurations.horizontal, Direction.HORIZONTAL);
    // Process vertical guides.
    processGuidePositions(aidConfigurations.vertical, Direction.VERTICAL);

    console.info("Visual alignment guides have been populated.");
  };

  /**
   * Recursively creates a layer hierarchy within the document.
   * @param {Array<object>} structureDefinitions - An array of layer/layerSet definitions.
   * @param {object} [currentParentGroup] - The parent layer set or document to add new layers/sets to.
   * @returns {number} The count of layers/groups created.
   */
  ResourceProvisioner.prototype.structureLayerHierarchy = function(structureDefinitions, currentParentGroup) {
    if (!this.targetCanvas) {
      console.warn("Cannot build layers: No active document available.");
      return 0;
    }
    if (!Array.isArray(structureDefinitions)) {
      console.warn("Invalid layer structure definitions provided.");
      return 0;
    }

    // Default parent is the active document if not specified.
    let effectiveParent = currentParentGroup || this.targetCanvas;
    let createdCount = 0;

    // Iterate through the definitions to create layers and layer sets.
    // Note: Original code reversed the array. This version processes in order.
    for (let currentIdx = 0, defCount = structureDefinitions.length; currentIdx < defCount; currentIdx++) {
      const elementSpec = structureDefinitions[currentIdx];

      if (!elementSpec || !elementSpec.name) {
        console.warn("Skipping malformed layer definition:", elementSpec);
        continue;
      }

      // Check if this element specification contains sub-elements, indicating a layer group.
      if (Array.isArray(elementSpec.subElements) && elementSpec.subElements.length > 0) {
        let layerGroup = effectiveParent.layerSets.add();
        layerGroup.name = elementSpec.name;
        createdCount++;
        console.log(`Created layer group: ${layerGroup.name}`);

        // Recursively build sub-elements within this new group.
        createdCount += this.structureLayerHierarchy(elementSpec.subElements, layerGroup);
      } else {
        // Otherwise, it's a regular art layer.
        let newLayerItem = effectiveParent.artLayers.add();
        newLayerItem.name = elementSpec.name;
        createdCount++;
        console.log(`Created art layer: ${newLayerItem.name}`);
      }
    }
    return createdCount; // Return total number of items created in this call.
  };

  return ResourceProvisioner;

})();


// --- Application Entry Point ---
// Define global settings object for demonstration.
// In a real application, 'settings' would be loaded from a config file or user preferences.
var settings = {
  canvasDimensions: {
    width: 1024,
    height: 768,
    resolution: 300,
    name: "Project Canvas"
  },
  alignmentAids: {
    horizontal: [100, 300, 500, 700],
    vertical: [50, 250, 450, 650, 900]
  },
  layerTree: [{
    name: "Background",
    subElements: []
  }, {
    name: "Content",
    subElements: [{
      name: "Text Elements",
      subElements: [{
        name: "Headline"
      }, {
        name: "Body Copy"
      }]
    }, {
      name: "Image Placeholders",
      subElements: []
    }]
  }, {
    name: "Overlay"
  }]
};

// Instantiate the main application orchestrator,
// which in turn triggers the workspace setup.
var mainApplicationInitiator = new ApplicationOrchestrator();

// The `mainApplicationInitiator` instance now holds a reference to `environmentPreparer`
// which has already executed the setup steps in its constructor.
// No further explicit calls are needed here for this specific clone structure.