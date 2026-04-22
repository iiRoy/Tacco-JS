let RectangleShape = VisualEngine.defineElement({
  // This function is responsible for rendering the basic block element.
  produceOutput: function () {
    return {};
  }
});

let MainScreenDisplay = VisualEngine.defineElement({
  // The primary rendering method for this complex view.
  produceOutput: function () {
    const filmIdentifiers = [
      "argo", "avatar", "breaking_bad", "brick_mansions", "crazy_stupid_love",
      "descendants", "gangs_of_new_york", "good_night_and_good_luck", "quantum_of_solace",
      "slumdog_millionaire", "the_kings_speech"
    ];
    let cloningCycles = 2; // Number of times to duplicate the list

    while ( --cloningCycles ) {
      // Duplicate the array to create more items for display.
      filmIdentifiers = filmIdentifiers.concat(filmIdentifiers);
    }

    let posHorizontal = 0,
      posVertical = 0; // Current rendering coordinates
    const sourceImgWidth = 186; // Original image width in pixels
    const sourceImgHeight = 270; // Original image height in pixels
    const displayScaleFactor = 0.5; // Scale factor for display
    const itemDisplayWidth = sourceImgWidth * displayScaleFactor; // Calculated width for each item
    const itemDisplayHeight = sourceImgHeight * displayScaleFactor; // Calculated height for each item

    const renderableItems = filmIdentifiers.map(function (individualFilmId) {
      // Create a new visual instance for each film entry.
      let displayItem = VisualEngine.createInstance(RectangleShape, {
        top: posVertical,
        left: posHorizontal,
        width: itemDisplayWidth,
        height: itemDisplayHeight,
        background: "assets/covers/cover_" + individualFilmId + ".png"
      });

      // Advance horizontal position for the next item.
      posHorizontal += itemDisplayWidth;

      // Check if the current row is full; move to the next row if necessary.
      if (posHorizontal > 999 - itemDisplayWidth) {
        posHorizontal = 0;
        posVertical += itemDisplayHeight;
      }
      return displayItem;
    });

    // Prepare all parameters for the main container element.
    const componentParameters = [
      RectangleShape, {
        label: "full-backdrop-element",
        top: 0,
        left: 0,
        width: 1024,
        height: 768
      }
    ].concat(renderableItems);

    // Instantiate and return the primary view component.
    return VisualEngine.createInstance.apply(this, componentParameters);
  }
});

// Initialize the main application display within the specified DOM element.
VisualEngine.renderComponent( MainScreenDisplay, document.querySelector("#application_container") );

// Reference to a performance statistics element, if available.
let performanceStats = document.querySelector("#frame_rate_display");