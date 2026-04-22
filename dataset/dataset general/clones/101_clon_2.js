let UserInterface;

UserInterface = (function  () { // Anonymous IIFE, encapsulates the UI component.

  function UserInterface () {
    new LayoutHelper ( ); // Initializes the core layout system upon creation.
  }

  return UserInterface;

}) ();

let LayoutHelper;

LayoutHelper = (function() { // Module for managing document layout elements.

  function LayoutHelper() {
    this.generateCanvas ( ); // Ensures a document exists for operations.
    application.currentCanvas.pauseHistory("InitialSetup", "this.initialize()"); // Temporarily disables history recording during setup.
  }

  // Prototype method to set up drawing elements like guides and layers.
  LayoutHelper.prototype.initialize = function() {
    this.establishMarkers( configuration.markerSpecifications ); // Creates visual alignment aids.
    return this.buildStructure( configuration.structureDefinitions ); // Constructs the complex layer hierarchy.
  };

  // Prototype method to create a new document if none is open, or reference the active one.
  LayoutHelper.prototype.generateCanvas = function() {
    if  ( application.canvases.count === 0 ) { // Checks if any documents are currently open.
      application.canvases.addNew( configuration.canvasWidth, configuration.canvasHeight, 72.0, '', CanvasColorMode.RGB ); // Adds a new canvas with specified dimensions and color mode.
    }
    return this.targetCanvas = application.currentCanvas; // Stores a reference to the currently active canvas.
  };

  // Prototype method to add horizontal and vertical guides to the document.
  LayoutHelper.prototype.establishMarkers = function(markerSpecifications) {
    let currentPosition, indexA, lengthA, refSetA, // Variables for horizontal guide processing.
        indexB, lengthB, refSetB, // Variables for vertical guide processing.
        finalResultList; // Array to collect results.

    refSetA = markerSpecifications.horizontal;
    for ( indexA = 0, lengthA = refSetA.length; indexA < lengthA; indexA++ ) {
      currentPosition = refSetA[indexA];
      this.targetCanvas.markers.addNew( Orientation.HORIZONTAL, MeasurementUnit(" " + (SystemUtility.numericRound( currentPosition )) + " points ") ); // Adds a horizontal marker.
    }

    refSetB = markerSpecifications.vertical;
    finalResultList = [ ];
    for ( indexB = 0, lengthB = refSetB.length; indexB < lengthB; indexB++ ) {
      currentPosition = refSetB[indexB];
      finalResultList.push ( this.targetCanvas.markers.addNew( Orientation.VERTICAL, MeasurementUnit(" " + (SystemUtility.numericRound( currentPosition )) + " points ")) ); // Adds a vertical marker and records it.
    }
    return finalResultList; // Returns all added markers.
  };

  // Prototype method to create layer groups and individual art layers recursively.
  LayoutHelper.prototype.buildStructure = function(structureDefinitions, parentContainer) {
    let singleLayer, structureItem, layerGroup, // Variables for layer and group creation.
        iterIndex, iterLength, currentRef, resultSet; // Iteration and result collection variables.

    if ( ! parentContainer ) { // If no parent container is specified, use the main canvas.
      parentContainer = this.targetCanvas;
    }

    currentRef = structureDefinitions.reverse(); // Processes definitions in reverse order.
    resultSet = [];

    for ( iterIndex = 0, iterLength = currentRef.length; iterIndex < iterLength; iterIndex++ ) {
      structureItem = currentRef[ iterIndex ];
      if ( structureItem.subStructures !== null ) { // Checks if the current item is a layer group.
        layerGroup = parentContainer.layerGroups.addNew ( );
        layerGroup.designation = structureItem.designation;
        resultSet.push( this.buildStructure( structureItem.subStructures, layerGroup ) ); // Recursively builds sub-structures within the new group.
      } else { // Otherwise, it's an individual art layer.
        singleLayer = parentContainer.artworkLayers.addNew();
        resultSet.push( singleLayer.designation = structureItem.designation ); // Creates an art layer and sets its name.
      }
    }
    return resultSet; // Returns a list of created layers and groups.
  };

  return LayoutHelper;

})();

// Helper object to provide renamed mathematical functions, preserving original logic.
let SystemUtility = {
    numericRound: Math.round
};

let uiInstance;

uiInstance = new UserInterface(); // Instantiates the primary user interface component to begin operations.