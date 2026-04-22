var CanvasCharts = function () {
  this.container = null; // Container DOM element reference
  this.containerWidth = ''; // Width of the chart container
  this.containerHeight = ''; // Height of the chart container
  this.canvasEl = null; // The canvas HTML element
  this.context = null; // The 2D rendering context of the canvas

  // Note: Text rotation functionality is currently not implemented or working as expected.
  this.rotate = false; // Flag to indicate if text rotation should be applied
  this.angle = 0; // Rotation angle in radians

  // Default color settings for chart elements
  this.gradientColor1 = "#cdeb8e"; // Start color for gradients
  this.gradientColor2 = "#a5c956"; // End color for gradients
  this.textFillStyle = "#666"; // Color for drawing text
  this.lineStrokeStyle = "#000"; // Color for drawing lines
  this.borderStrokeStyle = "#000"; // Color for drawing borders
  this.bgFillStyle = "#fff"; // Background fill color for the canvas
  this.font = ""; // Custom font string for text rendering

  // Chart layout parameters
  this.startX = 45; // Initial X-coordinate for drawing elements
  this.xAxisStart = 10; // Starting X-coordinate for the X-axis line
  this.yAxisLeft = 40; // X-coordinate for the Y-axis line (left offset)
  this.xAxisLineWidth = 1; // Line width for the X-axis
  this.yAxisLineWidth = 1; // Line width for the Y-axis

  // The 'startY' value will be computed dynamically once the container height is known,
  // typically to position the base of the chart correctly.
  this.startY = 0;

  // This height defines the dimension for each bar drawn in the chart.
  this.barHeight = 10;
  // Default chart type is a horizontal bar chart.
  this.chartType = "hbar";
};

CanvasCharts.prototype.configure = function ( obj ) {

  // Check and apply custom background fill style.
  if ( obj.hasOwnProperty( "bgFillStyle" ) ) {
    this.bgFillStyle = obj.bgFillStyle;
  }

  // Check and apply custom border stroke style.
  if ( obj.hasOwnProperty( "borderStrokeStyle" ) ) {
    this.borderStrokeStyle = obj.borderStrokeStyle;
  }

  // Check and set text rotation flag.
  if ( obj.hasOwnProperty( "rotate" ) ) {
    this.rotate = obj.rotate;
  }

  // Check and set rotation angle.
  if ( obj.hasOwnProperty( "angle" ) ) {
    this.angle = obj.angle;
  }

  // Check and apply custom text fill style.
  if ( obj.hasOwnProperty( "textFillStyle" ) ) {
    this.textFillStyle = obj.textFillStyle;
  }

  // Check and apply custom line stroke style.
  if ( obj.hasOwnProperty( "lineStrokeStyle" ) ) {
    this.lineStrokeStyle = obj.lineStrokeStyle;
  }

  // Check and set starting X-coordinate.
  if ( obj.hasOwnProperty( "startX" ) ) {
    this.startX = obj.startX;
  }

  // Check and set X-axis starting position.
  if ( obj.hasOwnProperty( "xAxisStart" ) ) {
    this.xAxisStart = obj.xAxisStart;
  }

  // Check and set Y-axis left offset.
  if ( obj.hasOwnProperty( "yAxisLeft" ) ) {
    this.yAxisLeft = obj.yAxisLeft;
  }

  // Check and set starting Y-coordinate.
  if ( obj.hasOwnProperty( "startY" ) ) {
    this.startY = obj.startY;
  }

  // Check and set the chart type.
  if ( obj.hasOwnProperty( "chartType" ) ) {
    this.chartType = obj.chartType;
  }

  // Check and apply first gradient color.
  if ( obj.hasOwnProperty( "gradientColor1" ) ) {
    this.gradientColor1 = obj.gradientColor1;
  }

  // Check and apply second gradient color.
  if ( obj.hasOwnProperty( "gradientColor2" ) ) {
    this.gradientColor2 = obj.gradientColor2;
  }

  // Check and apply custom font.
  if ( obj.hasOwnProperty( "font" ) ) {
    this.font = obj.font;
  }

  // Set to true to display the actual data point value as text next to each bar or point.
  if ( obj.hasOwnProperty( "drawDataText" ) ) {
    this.drawDataText = obj.drawDataText;
  }
};

CanvasCharts.prototype.isCanvasSupported = function () {
  // Returns true if the browser supports canvas, false otherwise.
  // This is a simple check by attempting to create a canvas element and get its 2D context.
  return !!document.createElement( 'canvas' ) . getContext;
};

CanvasCharts.prototype.createCanvas = function ( container, width, height ) {
  this.containerWidth = width; // Store the desired width for the canvas.
  this.containerHeight = height; // Store the desired height for the canvas.

  if ( container != null ) {
    // If a container element is provided, resize it to match the canvas dimensions.
    // This ensures the container properly encompasses the canvas.
    container.style.width = this.containerWidth + "px";
    container.style.height = this.containerHeight + "px";
  }

  // Assign the container reference to the instance.
  this.container = container;
  var canvasEl = null; // Initialize canvas element variable.

  // Check if running in a browser environment (where 'document' is defined).
  if ( typeof document !== 'undefined' ) {
    canvasEl = document.createElement( 'canvas' ); // Create a new HTML canvas element.
  }
  // If not in a browser, check for a Node.js canvas implementation (e.g., 'canvas' npm package).
  // For Node.js, you would typically need to 'require('canvas')' first.
  else if ( typeof canvas !== 'undefined' ) {
    canvasEl = new canvas( this.containerWidth, this.containerHeight ); // Instantiate Node.js canvas.
  }

  // If canvas element could not be created, log an error and return false.
  if ( canvasEl == null ) {
    console.log( "Could not create a canvas element! What environment are you using?" );
    return false;
  }

  this.canvasEl = canvasEl; // Store the created canvas element.
  canvasEl.id = "canvas1"; // Assign a default ID to the canvas element.

  // Set the actual drawing size of the canvas (internal resolution).
  canvasEl.width = this.containerWidth;
  canvasEl.height = this.containerHeight;

  // Set the display size of the canvas (CSS pixels).
  canvasEl.style.width = this.containerWidth + "px";
  canvasEl.style.height = this.containerHeight + "px";

  // If startY is still at its default of 0, calculate a sensible default based on container height.
  if ( this.startY == 0 ) {
    this.startY = this.containerHeight - 70;
  }

  this.context = canvasEl.getContext( '2d' ); // Get the 2D rendering context.
  var context = this.context; // Create a local reference for convenience.

  // Scale the canvas for high-DPI (Retina) displays.
  if ( window.devicePixelRatio == 2 ) {
    // Double the internal drawing size for sharper rendering.
    canvasEl.width = this.containerWidth * 2;
    canvasEl.height = this.containerHeight * 2;
    // Apply a scaling transformation to the context so that drawing commands
    // still use the original logical pixel values.
    context.scale( 2, 2 );
  }

  // Draw the main border around the entire canvas.
  this.drawRectBorder( 0, 0, this.containerWidth, this.containerHeight, this.borderStrokeStyle );
  // Fill the entire canvas background.
  this.drawRect( 0, 0, this.containerWidth, this.containerHeight, this.bgFillStyle );

  // Set default text properties for the canvas context.
  context.font = "normal 12px sans-serif";
  context.textBaseline = 'top'; // Align text baseline to the top of the text bounding box.

  return true; // Canvas creation and initialization successful.
};

CanvasCharts.prototype.drawRectBorder = function ( startX, startY, endX, endY, strokeStyle ) {
  var context = this.context; // Get the 2D rendering context.
  context.strokeStyle = strokeStyle; // Set the stroke color.
  context.strokeRect( startX, startY, endX, endY ); // Draw the rectangle border.
};

CanvasCharts.prototype.drawRect = function ( startX, startY, endX, endY, bgFillStyle ) {
  var context = this.context; // Get the 2D rendering context.
  context.fillStyle = bgFillStyle; // Set the fill color.
  context.fillRect( startX, startY, endX, endY ); // Draw the filled rectangle.
};

/*
 * Draws a horizontal bar graph along with all necessary labels for axes.
 */
CanvasCharts.prototype.drawChart = function ( xAxis, xAxisStep, yAxis, yAxisStep, data ) {
  var context = this.context; // Obtain the drawing context.

  if ( context != null ) {
    // First, draw the X-axis line and its corresponding labels.
    this.drawLine( this.xAxisStart, this.containerHeight - 40, this.containerWidth - 10, this.containerHeight - 40, {
      "lineWidth": this.xAxisLineWidth
    } );
    if ( xAxisStep != null && xAxis != null ) {
      this.drawXAxisLabels( xAxis, xAxisStep, this.containerHeight - 30, this.rotate, this.angle );
    }

    // Then, draw the Y-axis line and its corresponding labels.
    this.drawLine( this.yAxisLeft, 10, this.yAxisLeft, this.containerHeight - 10, {
      "lineWidth": this.yAxisLineWidth
    } );
    if ( yAxis != null && yAxisStep != null ) {
      this.drawYAxisLabels( yAxis, yAxisStep, 10 );
    }

    // Calculate the scaling factor for the X-axis based on the available width and maximum X-value.
    this.xScale = ( this.containerWidth - this.startX ) / xAxis[ xAxis.length - 1 ];

    // Determine which type of chart to draw based on the 'chartType' property.
    if ( this.chartType == "hbar" ) {
      // Draw horizontal bars for the chart data.
      this.drawHBars( data, yAxisStep );
    } else if ( this.chartType == "line" ) {
      // If 'line' chart type, check if the line drawing function is available.
      if ( typeof this.drawLineSeries === 'function' ) {
        this.drawLineSeries( data, xAxisStep );
      } else {
        // Log an error if the line chart function is missing.
        console.log( "Could not find the line drawing function. Did you forget to add the 'cc.line.js' file?" );
      }
    } else if ( this.chartType == "vbar" ) {
      // If 'vbar' chart type, check if the vertical bar drawing function is available.
      if ( typeof this.drawVBars === 'function' ) {
        this.drawVBars( data, xAxisStep );
      } else {
        // Log an error if the vertical bar chart function is missing.
        console.log( "Could not find the vbars drawing function. Did you forget to add the 'cc.vbar.js' file?" );
      }
    }
  } else {
    // If the context is null, drawing cannot proceed.
    console.log( "Context is null. Cannot draw!" );
  }
};

CanvasCharts.prototype.drawXAxisLabels = function ( labels, stepValue, y, rotate, angle ) {
  // If no labels are provided, exit the function.
  if ( !labels ) {
    return;
  }

  var length = labels.length; // Get the total number of labels.
  var startX = this.startX; // Get the initial X-coordinate for label placement.
  var context = this.context; // Get the 2D rendering context.

  // If rotation is enabled, save the current canvas state and apply rotation.
  if ( rotate ) {
    this.rotateCanvas( context, angle );
  }

  // Iterate through each label and draw it on the X-axis.
  for ( var i = 0; i < length; i += 1 ) {
    if ( i == 0 ) {
      this.drawText( labels[ i ], startX, y ); // Draw the first label at the initial startX.
      //console.log("startX: " + startX); // Debugging line, commented out.
    } else {
      startX += stepValue; // Increment startX by the step value for subsequent labels.
      this.drawText( labels[ i ], startX, y ); // Draw the label.
    }
  }

  // If rotation was applied, restore the canvas to its original orientation.
  if ( rotate ) {
    context.restore();
  }
};

CanvasCharts.prototype.drawYAxisLabels = function ( labels, stepValue, x ) {
  // If no labels array is provided, terminate the function.
  if ( !labels ) {
    return;
  }

  var length = labels.length; // Determine the count of labels to be drawn.
  var startY = this.startY; // Initialize the starting Y-coordinate for the labels.

  // Loop through each label in the provided array.
  for ( var i = 0; i < length; i += 1 ) {
    if ( i == 0 ) {
      this.drawText( labels[ i ], x, startY ); // Draw the very first label at the initial Y position.
    } else {
      startY -= stepValue + 10; // Decrement the Y-coordinate for subsequent labels to move upwards.
      this.drawText( labels[ i ], x, startY ); // Render the current label.
    }
  }
};

CanvasCharts.prototype.drawText = function ( text, x, y ) {
  var context = this.context; // Get the 2D rendering context.

  // If a custom font is specified, apply it to the context.
  if ( this.font != "" ) {
    context.font = this.font;
  }

  context.fillStyle = this.textFillStyle; // Set the fill color for the text.
  context.fillText( text, x, y ); // Draw the text at the specified coordinates.
};

CanvasCharts.prototype.rotateCanvas = function ( context, angle ) {
  context.save(); // Save the current state of the canvas context.
  // context.translate(newx, newy); // This line is commented out but would be used for setting the rotation origin.
  context.rotate( angle ); // Apply the rotation transformation to the canvas.
};

CanvasCharts.prototype.drawLine = function ( startX, startY, endX, endY, config ) {
  var context = this.context; // Reference to the 2D drawing context.

  if ( config ) {
    // Apply strokeStyle from config if available, otherwise use default.
    context.strokeStyle = ( config.hasOwnProperty( "strokeStyle" ) ) ? config.strokeStyle : this.lineStrokeStyle;
    // Apply lineWidth from config if available, otherwise use default of 1.
    context.lineWidth = ( config.hasOwnProperty( "lineWidth" ) ) ? config.lineWidth : 1;
    // Apply lineCap from config if available, otherwise use default "square".
    context.lineCap = ( config.hasOwnProperty( "lineCap" ) ) ? config.lineCap : "square";
  } else {
    // If no config is provided, use instance defaults.
    context.strokeStyle = this.lineStrokeStyle;
    context.lineWidth = 10; // A somewhat arbitrary default, perhaps intended for specific lines.
    context.lineCap = "square";
  }

  context.beginPath(); // Start a new path.
  context.moveTo( startX, startY ); // Move the pen to the starting point.
  context.lineTo( endX, endY ); // Draw a line to the ending point.
  context.stroke(); // Render the defined path.
  context.closePath(); // Close the current path.
};

CanvasCharts.prototype.drawCircle = function ( x, y, radius, config ) {
  var strokeStyle = "#000000"; // Default stroke color for the circle.
  var fillStyle = "#000000"; // Default fill color for the circle.

  if ( config ) {
    // Override default strokeStyle if provided in config.
    strokeStyle = ( config.hasOwnProperty( "strokeStyle" ) ) ? config.strokeStyle : "#000000";
    // Override default fillStyle if provided in config.
    fillStyle = ( config.hasOwnProperty( "fillStyle" ) ) ? config.fillStyle : "#000000";
  }

  var context = this.context; // Get the 2D rendering context.

  // Set the stroke and fill styles based on configuration or defaults.
  context.strokeStyle = strokeStyle;
  context.fillStyle = fillStyle;

  context.beginPath(); // Start a new path for the circle.
  // Draw an arc to form a full circle.
  context.arc( x, y, radius, 0, Math.PI * 2, true );
  context.closePath(); // Close the path, connecting the start and end points of the arc.
  context.stroke(); // Draw the outline of the circle.
  context.fill(); // Fill the inside of the circle.
};

CanvasCharts.prototype.createGradient = function () {
  var context = this.context; // Obtain the 2D rendering context.

  // Create a linear gradient object.
  // The gradient will stretch horizontally from x=0 to x=300.
  var barGradient = context.createLinearGradient( 0, 0, 300, 0 );

  // Add the first color stop for the gradient.
  barGradient.addColorStop( 0, this.gradientColor1 ); // Starts at 0% of the gradient length.

  // Add the second color stop for the gradient.
  barGradient.addColorStop( 1, this.gradientColor2 ); // Ends at 100% of the gradient length.

  this.barGradient = barGradient; // Store the created gradient object for later use.
};

CanvasCharts.prototype.drawHBars = function ( data, yStepSize ) {
  // Validate input: ensure 'data' is provided.
  if ( !data ) {
    console.log( "data is undefined! Please pass an array containing at least one number." );
    return;
  }

  // Generate the gradient to be used for filling the bars.
  this.createGradient();

  var context = this.context; // Get the 2D rendering context.
  var y = this.startY + 10; // Initialize the starting Y-coordinate for the first bar.
  var startX = this.startX + 1; // Initialize the starting X-coordinate for the bars.
  var length = data.length; // Get the number of data points (bars) to draw.

  // Configuration object for drawing lines (bars).
  var obj = {
    "lineWidth": this.barHeight,
    "strokeStyle": this.barGradient
  };

  // Loop through each data point to draw a horizontal bar.
  for ( var i = 0; i < length; i += 1 ) {
    // Calculate the end X-coordinate for the current bar based on its data value and X-scale.
    var endX = startX + ( this.xScale * data[ i ] );
    // Draw the horizontal bar using the configured line properties.
    this.drawLine( startX, y, endX, y, obj );

    // If 'drawDataText' is enabled, display the data value next to the bar.
    if ( this.drawDataText ) {
      this.drawText( data[ i ], endX + 8, y - 10 );
    }

    // Update the Y-coordinate for the next bar, moving upwards.
    y -= yStepSize + 10;
  }
};

/**
 * Draws the canvas element inside the container element (recommended for
 * future gesture events and DOM manipulation).
 * Alternatively, returns a data URL if no container is specified.
 */
CanvasCharts.prototype.showChart = function () {
  /*
  var img = document.createElement("IMG");
  img.id = "imageChart";
  img.width = this.containerWidth;
  img.height = this.containerHeight;
  */

  // If both a container and a canvas element exist, append the canvas to the container.
  if ( this.container != null && this.canvasEl != null ) {
    this.container.innerHTML = ""; // Clear any existing content within the container.
    // Uncomment the following line to display the actual canvas element directly.
    this.container.appendChild( this.canvasEl );
    /*
    // Uncomment these lines and comment the above if you prefer to render as an IMG element.
    img.src = this.canvasEl.toDataURL(); // Convert canvas content to a data URL.
    this.container.appendChild(img); // Append the IMG element to the container.
    */
  }
  // If no container is available, return the canvas content as a data URL.
  else {
    return this.canvasEl.toDataURL();
  }
};

CanvasCharts.prototype.destroyCanvas = function () {
  this.context = null; // Clear the reference to the 2D rendering context.
  this.canvasEl = null; // Clear the reference to the canvas HTML element.

  // If a container exists, clear its HTML content.
  if ( this.container ) {
    this.container.innerHTML = "";
  }
  this.container = null; // Clear the reference to the container element.

  console.log( "Canvas instance and its associated elements have been destroyed." );
};

// Check if module.exports is defined (Node.js environment) and export an instance.
if ( typeof module !== "undefined" ) {
  module.exports = new CanvasCharts();
}