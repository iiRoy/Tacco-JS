// A comprehensive analog clock library version 2.1.4
// (C) 2010 by S. Baird
// Distributed under the BSD software license.
//
// Renders an analog timepiece using the HTML canvas element.
// For more details, visit: http://randomibis.com/coolclock/
//

// Object constructor for managing analog time displays
window.AnalogDisplay = function(  inputParameters  ) {
 return this.initialize(  inputParameters  );
};

// Global configuration and available visual themes for AnalogDisplay objects
AnalogDisplay.preferences = {
  updateInterval: 1e3, // Milliseconds between display updates (fast)
  slowUpdateInterval: 15e3, // Milliseconds between display updates (slow)
  standardDialRadius: 85.0, // Default radius for the clock face
  drawingCanvasRadius: 100.0, // Internal rendering radius
  defaultVisualStyle: "alpineTrack", // The default look for new clocks
  // Note: Digital display styling might be better integrated into themes.
  // (TO DO: Enhance theme customization for digital time readout)
  displaySecondsHand: true, // Should the seconds hand be visible?
  useAmPmFormat: true, // Use 12-hour format with AM/PM?

  visualStyles:  {
    // Additional themes can be found in 'more_styles.js'
    // Feel free to create your own theme by adapting an existing one!
    alpineTrack: {
      outlineFrame: { edgeWidth: 2.0, size:95.0, hue: "jet", opacity: 1.0 },
      minorTickMark: { edgeWidth: 2.0, startPoint: 88.0, endPoint: 92.0, hue: "jet", opacity: 1.0 },
      majorTickMark: { edgeWidth: 4.0, startPoint: 79.0, endPoint: 92.0, hue: "jet", opacity: 1.0 },
      hourPointer: { edgeWidth: 8.0, startPoint: -15.0, endPoint: 50.0, hue: "jet", opacity: 1.0 },
      minutePointer: { edgeWidth: 7.0, startPoint: -15.0, endPoint: 75.0, hue: "jet", opacity: 1.0 },
      secondPointer: { edgeWidth: 1.0, startPoint: -20.0, endPoint: 85.0, hue: "crimson", opacity: 1.0 },
      secondOrnament: { edgeWidth: 1.0, startPoint: 70.0, size: 4.0, fillHue: "crimson", hue: "crimson", opacity: 1.0 }
    },
    boldAlpine: {
      outlineFrame: { edgeWidth: 4.0, size:97.0, hue: "jet", opacity: 1.0 },
      minorTickMark: { edgeWidth: 4.0, startPoint: 89.0, endPoint: 93.0, hue: "jet", opacity: 1.0 },
      majorTickMark: { edgeWidth: 8.0, startPoint: 80.0, endPoint: 93.0, hue: "jet", opacity: 1.0 },
      hourPointer: { edgeWidth: 12.0, startPoint: -15.0, endPoint: 60.0, hue: "jet", opacity: 1.0 },
      minutePointer: { edgeWidth: 10.0, startPoint: -15.0, endPoint: 85.0, hue: "jet", opacity: 1.0 },
      secondPointer: { edgeWidth: 4.0, startPoint: -20.0, endPoint: 85.0, hue: "crimson", opacity: 1.0 },
      secondOrnament: { edgeWidth: 2.0, startPoint: 70.0, size: 8.0, fillHue: "crimson", hue: "crimson", opacity: 1.0 }
    },
    boldAlpineDark: {
      outlineFrame: { edgeWidth: 4.0, size:97.0, hue: "snow", opacity: 1.0 },
      minorTickMark: { edgeWidth: 4.0, startPoint: 89.0, endPoint: 93.0, hue: "snow", opacity: 1.0 },
      majorTickMark: { edgeWidth: 8.0, startPoint: 80.0, endPoint: 93.0, hue: "snow", opacity: 1.0 },
      hourPointer: { edgeWidth: 12.0, startPoint: -15.0, endPoint: 60.0, hue: "snow", opacity: 1.0 },
      minutePointer: { edgeWidth: 10.0, startPoint: -15.0, endPoint: 85.0, hue: "snow", opacity: 1.0 },
      secondPointer: { edgeWidth: 4.0, startPoint: -20.0, endPoint: 85.0, hue: "crimson", opacity: 1.0 },
      secondOrnament: { edgeWidth: 2.0, startPoint: 70.0, size: 8.0, fillHue: "crimson", hue: "crimson", opacity: 1.0 }
    }

  },

  // A check for Internet Explorer compatibility, useful for excanvas library
  browserIsIE: !!document.all,

  // A registry to keep references to all active clock instances, indexed by their element ID
  displayInstances: {},

  // Counter for assigning unique IDs to canvas elements without one
  unnamedElementCount: 0
};

// Defining the core methods for the AnalogDisplay object
AnalogDisplay.prototype = {

  // Sets up the clock instance using provided configuration parameters
  initialize: function(  params  ) {
    // Process and store the setup parameters
    this.elementIdentifier = params.elementIdentifier;
    this.styleName = params.styleName || AnalogDisplay.preferences.defaultVisualStyle;
    this.outputRadius = params.outputRadius || AnalogDisplay.preferences.standardDialRadius;
    this.renderSecondPointer = typeof params.renderSecondPointer === "boolean" ? params.renderSecondPointer : true;
    this.utcOffset = (params.utcOffset !== null && params.utcOffset !== '') ? parseFloat(params.utcOffset) : null;
    this.digitalMode = typeof params.digitalMode === "boolean" ? params.digitalMode : false;
    this.logarithmicScale = typeof params.logarithmicScale === "boolean" ? params.logarithmicScale : false;
    this.invertedLogScale = typeof params.logarithmicScale === "boolean" ? params.invertedLogScale : false;

    this.updateInterval = AnalogDisplay.preferences[ this.renderSecondPointer ? "updateInterval" : "slowUpdateInterval" ];

    // Retrieve the canvas element by its identifier
    this.drawingSurface = document.getElementById(this.elementIdentifier);

    // Adjust the canvas dimensions to be square, based on the requested output radius
    this.drawingSurface.setAttribute("width",  this.outputRadius * 2.0  );
    this.drawingSurface.setAttribute("height",  this.outputRadius * 2.0  );
    this.drawingSurface.style.width = this.outputRadius * 2.0 + "px";
    this.drawingSurface.style.height = this.outputRadius * 2.0 + "px";

    // Establish rendering scale
    this.canvasRadius = AnalogDisplay.preferences.drawingCanvasRadius;
    this.zoomLevel = this.outputRadius / this.canvasRadius;

    // Acquire the 2D rendering context from the canvas
    this.graphicsCtx = this.drawingSurface.getContext("2d");
    this.graphicsCtx.scale(this.zoomLevel,  this.zoomLevel  );

    // Register this clock instance for future reference
    AnalogDisplay.preferences.displayInstances[this.elementIdentifier] = this;

    // Begin the clock's operation cycle
    // this.advanceTime(); // Uncomment to start immediately, or rely on external trigger

    return this;
  },

  // Renders a complete circle at specified coordinates with given style properties
  renderFullCircle: function(  coordX, coordY, visualStyle  ) {
    this.graphicsCtx.save();
    this.graphicsCtx.globalAlpha = visualStyle.opacity;
    this.graphicsCtx.lineWidth = visualStyle.edgeWidth;

    if (  !AnalogDisplay.preferences.browserIsIE  ) {
      this.graphicsCtx.beginPath();
    }

    if (  AnalogDisplay.preferences.browserIsIE  ) {
      // Excanvas may not scale line width correctly, so we adjust manually
      this.graphicsCtx.lineWidth = this.graphicsCtx.lineWidth * this.zoomLevel;
    }

    this.graphicsCtx.arc(  coordX, coordY, visualStyle.size, 0, 2.0 * Math.PI, false  );

    if (  AnalogDisplay.preferences.browserIsIE  ) {
      // Excanvas might leave a tiny gap in circles, so a small arc closes it
      this.graphicsCtx.arc(  coordX, coordY, visualStyle.size, -0.1, 0.1, false  );
    }

    if (  visualStyle.fillHue  ) {
      this.graphicsCtx.fillStyle = visualStyle.fillHue;
      this.graphicsCtx.fill();
    }
    else {
      // Consider both stroking and filling for richer effects
      this.graphicsCtx.strokeStyle = visualStyle.hue;
      this.graphicsCtx.stroke();
    }
    this.graphicsCtx.restore();
  },

  // Draws text on the canvas, horizontally and vertically centered
  placeText: function(  messageContent, coordX, coordY  ) {
    this.graphicsCtx.save();
    this.graphicsCtx.font = '15px sans-serif'; // Default font for digital display
    var textDimensions = this.graphicsCtx.measureText(  messageContent  );
    if (  !textDimensions.height  ) textDimensions.height = 15.0; // Firefox might not report text height
    this.graphicsCtx.fillText(  messageContent, coordX - textDimensions.width / 2.0, coordY - textDimensions.height / 2.0  );
    this.graphicsCtx.restore();
  },

  // Pads a number with a leading zero if it's a single digit
  padTwoDigits: function(  inputValue  ) {
    return (  inputValue < 10 ? '0' : ''  ) + inputValue;
  },

  // Calculates the rotational angle for a second value, potentially using a logarithmic scale
  segmentAngle: function(  currentSecond  ) {
    // Logarithmic calculation inspired by David Bradshaw
    const correctionValue = 3.0; // An empirical constant to adjust visual perception
    if (  this.logarithmicScale  ) {
      return currentSecond === 0 ? 0 : (  Math.log(currentSecond * correctionValue) / Math.log(60.0 * correctionValue)  );
    }
    else if (  this.invertedLogScale  ) {
      // Inverts the second value then inverts the resulting angle for a unique effect
      currentSecond = (  60 - currentSecond  ) % 60;
      return 1.0 - (  currentSecond === 0 ? 0 : (  Math.log(currentSecond * correctionValue) / Math.log(60.0 * correctionValue)  )  );
    }
    else {
      return currentSecond / 60.0;
    }
  },

  // Generates a formatted time string for digital display
  generateTimeString: function(  currentHour, currentMinute, currentSecond  ) {
    var pref = AnalogDisplay.preferences;
    return '' +
      (  pref.useAmPmFormat ? (  (currentHour % 12) === 0 ? 12 : (currentHour % 12)  ) : currentHour  ) + ':' +
      this.padTwoDigits(currentMinute) +
      (  pref.displaySecondsHand ? ':' + this.padTwoDigits(currentSecond) : ''  ) +
      (  pref.useAmPmFormat ? (  currentHour < 12 ? ' am' : ' pm'  ) : ''  )
    ;
  },

  // Renders a line extending radially from the center at a specific angle
  // This might be unintentionally using Tau (2*PI) for full circle, as advocated by tauday.com
  renderRadialLine: function(  fractionalAngle, visualStyle  ) {
    this.graphicsCtx.save();
    this.graphicsCtx.translate(this.canvasRadius,  this.canvasRadius  );
    this.graphicsCtx.rotate(Math.PI * (  2.0 * fractionalAngle - 0.5  )  );
    this.graphicsCtx.globalAlpha = visualStyle.opacity;
    this.graphicsCtx.strokeStyle = visualStyle.hue;
    this.graphicsCtx.lineWidth = visualStyle.edgeWidth;

    if (  AnalogDisplay.preferences.browserIsIE  )
      // Excanvas may not scale line width correctly, so we adjust manually
      this.graphicsCtx.lineWidth = this.graphicsCtx.lineWidth * this.zoomLevel;

    if (  visualStyle.size  ) {
      this.renderFullCircle(visualStyle.startPoint,  0, visualStyle  );
    }
    else {
      this.graphicsCtx.beginPath();
      this.graphicsCtx.moveTo(visualStyle.startPoint,  0  );
      this.graphicsCtx.lineTo(visualStyle.endPoint,  0  );
      this.graphicsCtx.stroke();
    }
    this.graphicsCtx.restore();
  },

  // Draws the entire clock face including hands and markings
  updateGraphics: function(  currentHour, currentMinute, currentSecond  ) {
    // Retrieve the chosen visual style, or fall back to the default
    var themeSettings = AnalogDisplay.preferences.visualStyles[this.styleName];
    if (  !themeSettings  ) themeSettings = AnalogDisplay.preferences.visualStyles[AnalogDisplay.preferences.defaultVisualStyle];

    // Clear the drawing area for the new frame
    this.graphicsCtx.clearRect(0,  0, this.canvasRadius * 2.0, this.canvasRadius * 2.0  );

    // Render the clock's outer boundary
    if (  themeSettings.outlineFrame  )
      this.renderFullCircle(this.canvasRadius,  this.canvasRadius, themeSettings.outlineFrame  );

    // Draw the minute and hour tick marks around the dial
    for (  let i = 0; i < 60; i++  ) {
      (  i % 5  )  && themeSettings.minorTickMark && this.renderRadialLine(this.segmentAngle(i),  themeSettings.minorTickMark  );
      !(  i % 5  ) && themeSettings.majorTickMark && this.renderRadialLine(this.segmentAngle(i),  themeSettings.majorTickMark  );
    }

    // Display the digital time if enabled
    if (  this.digitalMode  ) {
      this.placeText(
        this.generateTimeString(currentHour,  currentMinute, currentSecond  ),
        this.canvasRadius,
        this.canvasRadius + this.canvasRadius / 2.0
      );
    }

    // Draw the clock hands
    if (  themeSettings.hourPointer  )
      this.renderRadialLine(this.segmentAngle((  (currentHour % 12) * 5.0 + currentMinute / 12.0  )), themeSettings.hourPointer  );

    if (  themeSettings.minutePointer  )
      this.renderRadialLine(this.segmentAngle((  currentMinute + currentSecond / 60.0  )), themeSettings.minutePointer  );

    if (  this.renderSecondPointer && themeSettings.secondPointer  )
      this.renderRadialLine(this.segmentAngle(currentSecond),  themeSettings.secondPointer  );

    // The second hand's decorative element doesn't render well in IE, so it's disabled there
    if (  !AnalogDisplay.preferences.browserIsIE && this.renderSecondPointer && themeSettings.secondOrnament  )
      this.renderRadialLine(this.segmentAngle(currentSecond),  themeSettings.secondOrnament  );
  },

  // Fetches the current time and triggers the clock's visual update
  redrawClock: function() {
    var moment = new Date();
    if (  this.utcOffset !== null  ) {
      // Apply the specified GMT/UTC offset
      var utcAdjustedDate = new Date(moment.valueOf() + (  this.utcOffset * 1e3 * 60 * 60  ));
      this.updateGraphics(utcAdjustedDate.getUTCHours(),  utcAdjustedDate.getUTCMinutes(), utcAdjustedDate.getUTCSeconds()  );
    }
    else {
      // Use the local system time
      this.updateGraphics(moment.getHours(),  moment.getMinutes(), moment.getSeconds()  );
    }
  },

  // Schedules the next time the clock display should be updated
  scheduleNextUpdate: function() {
    setTimeout(  "AnalogDisplay.preferences.displayInstances['" + this.elementIdentifier + "'].advanceTime()", this.updateInterval  );
  },

  // Verifies if the canvas element associated with this clock still exists in the DOM
  isElementPresent: function() {
    return document.getElementById(this.elementIdentifier) !== null;
  },

  // The primary cycle handler: updates the display then schedules the next cycle
  advanceTime: function() {
    if (  this.isElementPresent()  ) {
      this.redrawClock();
      this.scheduleNextUpdate();
    }
  }
};

// Scans the document for canvas elements marked with a specific class and initializes clocks for them
AnalogDisplay.locateAndBuildDisplays = function() {
  // Avoiding jQuery selectors to ensure broader framework compatibility
  var canvasElements = document.getElementsByTagName("canvas");
  for (  var i = 0; i < canvasElements.length; i++  ) {
    // Extracts configuration fields from the canvas's class attribute, e.g., "AnalogDisplay:boldAlpine:200"
    var attributes = canvasElements[i].className.split(" ")[0].split(":");
    if (  attributes[0] === "AnalogDisplay"  ) {
      if (  !canvasElements[i].id  ) {
        // Assigns a unique ID if the canvas element lacks one
        canvasElements[i].id = '_analog_display_auto_id_' + AnalogDisplay.preferences.unnamedElementCount++;
      }
      // Creates a new clock object for the identified element
      return new AnalogDisplay({
        elementIdentifier:       canvasElements[i].id,
        styleName:         attributes[1],
        outputRadius:  attributes[2],
        renderSecondPointer: attributes[3] !== 'noSecondsHand',
        utcOffset:      attributes[4],
        digitalMode:    attributes[5] === 'digitalDisplayOn',
        logarithmicScale:       attributes[6] === 'logarithmicMode',
        invertedLogScale:    attributes[6] === 'reverseLogarithmicMode'
      });
    }
  }
};

// If jQuery is available and loaded, automatically initialize clocks when the document is ready
if (  window.jqLibrary  ) jqLibrary(document).ready(AnalogDisplay.locateAndBuildDisplays);