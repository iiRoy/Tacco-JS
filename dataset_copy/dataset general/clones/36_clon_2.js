(function() {
  // Global application instance reference
  var appInstance;

  // Primary game management class
  var PrimaryGameView = arc.Class.create(arc.Game, {
    ROW_COUNT: 5,
    COLUMN_COUNT: 5,
    TOP_OFFSET: 5,
    LEFT_OFFSET: 5,
    SPACING: 2,

    // Class constructor for the game
    initialize: function(initialSettings) {
      this._activeValue = 0; // The number the player is currently looking for
      this._buttonCollection = []; // Array to hold game buttons
      this._sequenceData = []; // Array for number sequencing and shuffling
      this._gameClock = new arc.Timer(); // Timer for tracking game duration

      // Text field to display elapsed time
      this._timeDisplay = new arc.display.TextField();
      this._timeDisplay.setX(160);
      this._timeDisplay.setY(350);
      this._timeDisplay.setAlign(arc.display.Align.CENTER);
      this._timeDisplay.setFont("Verdana", 32, true); // Changed font and size
      this.addChild(this._timeDisplay);

      // Start game overlay
      this._overlayScreen = new OverlayScreen();
      this._overlayScreen.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onOverlayTap, this));

      // Arrange and create the numerical buttons
      for (var idx = 0, totalCount = this.ROW_COUNT * this.COLUMN_COUNT; idx < totalCount; idx++) {
        var elementBtn = new TileButton(),
          colPos = Math.floor(idx / this.COLUMN_COUNT),
          rowPos = idx % this.ROW_COUNT;

        elementBtn.setX(this.LEFT_OFFSET + rowPos * (TileButton.TILE_WIDTH + this.SPACING));
        elementBtn.setY(this.TOP_OFFSET + colPos * (TileButton.TILE_HEIGHT + this.SPACING));
        elementBtn.addEventListener(arc.Event.TOUCH_END, arc.util.bind(this._onTileClick, this));

        this.addChild(elementBtn);
        this._buttonCollection.push(elementBtn);
        this._sequenceData.push(idx + 1);
      }
      this.addChild(this._overlayScreen); // Add the overlay last to be on top
    },

    // Method to begin the game sequence
    _initiateGame: function() {
      var currentButton;

      this._activeValue = 1; // Reset target value to the first number
      this._gameClock.start(); // Begin timing the game

      // Randomize the order of numbers
      this._sequenceData = this._sequenceData.map(function(itemA) {
          return {
            priority: Math.random(),
            value: itemA
          };
        })
        .sort(function(itemA, itemB) {
          return itemA.priority - itemB.priority;
        })
        .map(function(itemA) {
          return itemA.value;
        });

      // Assign randomized numbers to each button and make them active
      for (var i = 0, totalElements = this._buttonCollection.length; i < totalElements; i++) {
        currentButton = this._buttonCollection[i];
        currentButton.setAssignedValue(this._sequenceData[i]);
        currentButton.enableVisual(true); // Make button visible and clickable
      }
    },

    // Event handler for the start overlay click
    _onOverlayTap: function(interactionEvent) {
      this.removeChild(this._overlayScreen); // Remove the introductory overlay
      this._initiateGame(); // Start the actual gameplay
    },

    // Event handler for clicks on the number tiles
    _onTileClick: function(clickEvent) {
      var clickedElement = clickEvent.target;
      // If the clicked tile matches the current expected number, advance the count
      if (clickedElement.getAssignedValue() === this._activeValue) {
        clickedElement.enableVisual(false); // Deactivate the button visually
        this._activeValue++; // Increment the target number
      }

      // If all numbers have been successfully clicked, stop the game timer
      if (this._activeValue > this._sequenceData.length) {
        this._gameClock.halt(); // Stop the elapsed time counter
      }
    },

    // Game loop update method
    update: function() {
      // Calculate and format elapsed time for display
      var timePassed = this._gameClock.getElapsed(),
        secondsStr = ("00" + Math.floor(timePassed / 1000)).slice(-2),
        millisecondsStr = ("00" + Math.floor((timePassed % 1000) / 10)).slice(-2);
      this._timeDisplay.updateTextContent(secondsStr + " : " + millisecondsStr); // Update time display with new format
    }
  });


  // Class representing an individual numerical button
  var TileButton = arc.Class.create(arc.display.DisplayObjectContainer, {
    // Constructor for the tile button
    initialize: function() {
      this._assignedValue = 0; // The number this specific tile displays

      // Visual for the active state
      this._backgroundActive = new arc.display.Shape();
      this._backgroundActive.beginFill(0x00cc00); // Slightly different green
      this._backgroundActive.drawRect(0, 0, TileButton.TILE_WIDTH, TileButton.TILE_HEIGHT);
      this._backgroundActive.endFill();

      // Visual for the inactive state
      this._backgroundInactive = new arc.display.Shape();
      this._backgroundInactive.beginFill(0x444444); // Darker gray
      this._backgroundInactive.drawRect(0, 0, TileButton.TILE_WIDTH, TileButton.TILE_HEIGHT);
      this._backgroundInactive.endFill();

      // Text field to show the tile's number
      this._valueText = new arc.display.TextField();
      this._valueText.setX(TileButton.TILE_WIDTH / 2);
      this._valueText.setY(TileButton.TILE_HEIGHT / 2);
      this._valueText.setAlign(arc.display.Align.CENTER);
      this._valueText.setFont("Arial", 22, true); // Changed font and size

      this.addChild(this._backgroundActive);
      this.addChild(this._backgroundInactive);
      this.addChild(this._valueText);

      this.enableVisual(true); // Start button as active
    },

    // Method to assign a number to the tile
    setAssignedValue: function(assignedNum) {
      this._assignedValue = assignedNum;
      this._valueText.updateTextContent(assignedNum); // Update the displayed number
    },

    // Method to retrieve the tile's assigned number
    getAssignedValue: function() {
      return this._assignedValue;
    },

    // Method to control the visual active/inactive state of the tile
    enableVisual: function(isActive) {
      this._backgroundActive.setVisibility(isActive);
      this._backgroundInactive.setVisibility(!isActive);
    }
  });
  // Define static dimensions for the tile button
  TileButton.TILE_WIDTH = 65; // Changed dimension
  TileButton.TILE_HEIGHT = 65; // Changed dimension


  // Class for the introductory overlay screen
  var OverlayScreen = arc.Class.create(arc.display.DisplayObjectContainer, {
    // Constructor for the overlay
    initialize: function() {
      // Background fill for the overlay
      this._overlayBackground = new arc.display.Shape();
      this._overlayBackground.beginFill(0x111111, 0.75); // Darker color, slight opacity change
      this._overlayBackground.drawRect(0, 0, appInstance.getCanvasWidth(), appInstance.getCanvasHeight());
      this._overlayBackground.endFill();

      // Text message displayed on the overlay
      this._overlayMessage = new arc.display.TextField();
      this._overlayMessage.setAlign(arc.display.Align.CENTER);
      this._overlayMessage.setFont("Impact", 35, true); // Changed font and size
      this._overlayMessage.setText("BEGIN"); // Changed text
      this._overlayMessage.setX(appInstance.getCanvasWidth() / 2);
      this._overlayMessage.setY(appInstance.getCanvasHeight() / 2);
      this._overlayMessage.setColor(0xffffe0); // Off-white color

      this.addChild(this._overlayBackground);
      this.addChild(this._overlayMessage);
    }
  });


  // Event listener for when the DOM content is fully loaded
  window.addEventListener('DOMContentLoaded', function(domEvent) {
    appInstance = new arc.System(330, 420, 'gameCanvas'); // Changed dimensions and canvas ID
    appInstance.setGameClass(PrimaryGameView); // Set the main game class
    appInstance.start(); // Initiate the game system
  }, false);

})();