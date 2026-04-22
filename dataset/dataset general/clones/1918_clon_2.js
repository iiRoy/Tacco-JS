var ChartDisplay = function()
{
    this.hostElement = null;
    this.drawingAreaWidth = "";
    this.drawingAreaHeight = "";
    this.renderCanvas = null;
    this.drawingContext = null;
    // Note: Text rotation might not function as expected in all environments.
    this.shouldRotateText = false;
    this.textRotationAngle = 0;
    // Default color settings for various visual elements.
    this.primaryFillColor = "#EBCDEB";
    this.secondaryFillColor = "#C956A5";
    this.labelFontColor = "#888";
    this.axisLineColor = "#111";
    this.frameOutlineColor = "#222";
    this.backgroundFillColor = "#EEE";
    this.displayFont = "";
    this.plotStartCoordX = 50;
    this.horizAxisOffset = 15;
    this.vertAxisStartPos = 45;
    this.horizLineThickness = 2;
    this.vertLineThickness = 2;
    // Initial Y-coordinate for plot elements, calculated later.
    this.plotStartCoordY = 0;

    // This defines the height of each individual bar in a bar chart.
    this.barSegmentHeight = 12;
    // The default visualization type is a horizontal bar chart.
    this.visualizationType = "horizontalBar";
};

ChartDisplay.prototype.applyRenderOptions = function( optionsObject ) {
    if ( optionsObject.hasOwnProperty( "backgroundFillColor" ) )
    {
        this.backgroundFillColor = optionsObject.backgroundFillColor;
    }
    if ( optionsObject.hasOwnProperty( "frameOutlineColor" ) ) {
        this.frameOutlineColor = optionsObject.frameOutlineColor;
    }
    if ( optionsObject.hasOwnProperty( "shouldRotateText" ) ) {
        this.shouldRotateText = optionsObject.shouldRotateText;
    }
    if ( optionsObject.hasOwnProperty( "textRotationAngle" ) ) {
        this.textRotationAngle = optionsObject.textRotationAngle;
    }
    if ( optionsObject.hasOwnProperty( "labelFontColor" ) ) {
        this.labelFontColor = optionsObject.labelFontColor;
    }
    if ( optionsObject.hasOwnProperty( "axisLineColor" ) ) {
        this.axisLineColor = optionsObject.axisLineColor;
    }
    if ( optionsObject.hasOwnProperty( "plotStartCoordX" ) ) {
        this.plotStartCoordX = optionsObject.plotStartCoordX;
    }
    if ( optionsObject.hasOwnProperty( "horizAxisOffset" ) ) {
        this.horizAxisOffset = optionsObject.horizAxisOffset;
    }
    if ( optionsObject.hasOwnProperty( "vertAxisStartPos" ) ) {
        this.vertAxisStartPos = optionsObject.vertAxisStartPos;
    }
    if ( optionsObject.hasOwnProperty( "plotStartCoordY" ) ) {
        this.plotStartCoordY = optionsObject.plotStartCoordY;
    }
    if ( optionsObject.hasOwnProperty( "visualizationType" ) ) {
        this.visualizationType = optionsObject.visualizationType;
    }
    if ( optionsObject.hasOwnProperty( "primaryFillColor" ) ) {
        this.primaryFillColor = optionsObject.primaryFillColor;
    }
    if ( optionsObject.hasOwnProperty( "secondaryFillColor" ) ) {
        this.secondaryFillColor = optionsObject.secondaryFillColor;
    }
    if ( optionsObject.hasOwnProperty( "displayFont" ) ) {
        this.displayFont = optionsObject.displayFont;
    }
    // Set to true to render data point values adjacent to their respective bars.
    if ( optionsObject.hasOwnProperty( "displayDataValues" ) ) {
        this.displayDataValues = optionsObject.displayDataValues;
    }
};

ChartDisplay.prototype.checkCanvasAvailability = function() {
    return !!document.createElement( 'canvas' ).getContext;
};

ChartDisplay.prototype.setupDrawingSurface = function( hostElement, surfaceWidth, surfaceHeight ) {
    this.drawingAreaWidth = surfaceWidth;
    this.drawingAreaHeight = surfaceHeight;
    if ( null != hostElement ) {
    // Adjust the parent container's dimensions to match the canvas size.
        hostElement.style.width = this.drawingAreaWidth + "px";
        hostElement.style.height = this.drawingAreaHeight + "px";
    }
    // Store reference to the containing element.
    this.hostElement = hostElement;
    var currentCanvasElement = null;
    if ( typeof document !== 'undefined' ) {
        currentCanvasElement = document.createElement( 'canvas' );
    }
    // For Node.js applications, ensure 'canvas' module is imported (e.g., var NodeCanvas = require('canvas');).
    else if ( typeof NodeCanvasInstance !== 'undefined' ) {
        currentCanvasElement = new NodeCanvasInstance( this.drawingAreaWidth, this.drawingAreaHeight );
    }

    if ( currentCanvasElement == null ) {
        console.log( "Failed to generate a canvas element! What environment is this running in?" );
        return false;
    }
    this.renderCanvas = currentCanvasElement;
    currentCanvasElement.id = "visualSurface";
    // Define the actual pixel dimensions for drawing operations.
    currentCanvasElement.width = this.drawingAreaWidth;
    currentCanvasElement.height = this.drawingAreaHeight;
    // Set the visible dimensions of the canvas element.
    currentCanvasElement.style.width = this.drawingAreaWidth + "px";
    currentCanvasElement.style.height = this.drawingAreaHeight + "px";
    if ( this.plotStartCoordY === 0 ) {
        this.plotStartCoordY = this.drawingAreaHeight - 75;
    }
    this.drawingContext = currentCanvasElement.getContext( '2d' );
    var activeDrawingContext = this.drawingContext;
    // Scale the canvas for high-DPI displays (e.g., Retina).
    if ( window.devicePixelRatio === 2 ) {
        // Adjust the internal drawing buffer size.
        currentCanvasElement.width = this.drawingAreaWidth * 2;
        currentCanvasElement.height = this.drawingAreaHeight * 2;
        activeDrawingContext.scale( 2, 2 );
    }
    this.outlineRectangle( 0, 0, this.drawingAreaWidth, this.drawingAreaHeight, this.frameOutlineColor );
    this.fillRectangle( 0, 0, this.drawingAreaWidth, this.drawingAreaHeight, this.backgroundFillColor );
    // Initialize text rendering properties.
    activeDrawingContext.font = "14px Arial, sans-serif";
    activeDrawingContext.textBaseline = 'middle';
    return true;
};

ChartDisplay.prototype.outlineRectangle = function( x1Coord, y1Coord, x2Coord, y2Coord, outlineStyle ) {
    var activeDrawingContext = this.drawingContext;
    activeDrawingContext.strokeStyle = outlineStyle;
    activeDrawingContext.strokeRect( x1Coord, y1Coord, x2Coord, y2Coord );
};

ChartDisplay.prototype.fillRectangle = function( x1Coord, y1Coord, x2Coord, y2Coord, fillColor ) {
    var activeDrawingContext = this.drawingContext;
    activeDrawingContext.fillStyle = fillColor;
    activeDrawingContext.fillRect( x1Coord, y1Coord, x2Coord, y2Coord );
};

/*
 * Renders a complete chart, including axes, labels, and data visualizations.
 */
ChartDisplay.prototype.renderPlot = function( horizAxisInfo, horizStepSize, vertAxisInfo, vertStepSize, chartDataPoints ) {
    var activeDrawingContext = this.drawingContext;
    if ( activeDrawingContext !== null ) {
        // First, draw the horizontal axis and its corresponding labels.
        this.drawPlotLine( this.horizAxisOffset, this.drawingAreaHeight - 40, this.drawingAreaWidth - 15, this.drawingAreaHeight - 40, { "lineWidth": this.horizLineThickness } );
        if ( horizStepSize != null && horizAxisInfo != null ) {
            this.drawHorizontalLabels( horizAxisInfo, horizStepSize, this.drawingAreaHeight - 35, this.shouldRotateText, this.textRotationAngle );
        }
        // Draw the vertical axis and its labels.
        this.drawPlotLine( this.vertAxisStartPos, 15, this.vertAxisStartPos, this.drawingAreaHeight - 15, { "lineWidth": this.vertLineThickness } );
        if ( vertAxisInfo != null && vertStepSize != null ) {
            this.drawVerticalLabels( vertAxisInfo, vertStepSize, 15 );
        }

        this.horizontalScalingFactor = ( this.drawingAreaWidth - this.plotStartCoordX ) / horizAxisInfo[ horizAxisInfo.length - 1 ];
        if ( this.visualizationType === "horizontalBar" ) {
            // Proceed to render the chart's data bars.
            this.drawHorizontalBars( chartDataPoints, vertStepSize );
        }
        else if ( this.visualizationType === "linearPlot" ) {
            if ( typeof this.drawLinearPlot === 'function' ) {
                this.drawLinearPlot( chartDataPoints, horizStepSize );
            }
            else {
                console.log( "The linear plot drawing function is missing. Did you include the 'cc.line.js' extension?" );
            }
        }
        else if ( this.visualizationType === "verticalBar" ) {
            if ( typeof this.drawVerticalBars === 'function' ) {
                this.drawVerticalBars( chartDataPoints, horizStepSize );
            }
            else {
                console.log( "The vertical bar rendering function is unavailable. Is the 'cc.vbar.js' file loaded?" );
            }
        }
    }
    else {
        console.log( "Graphics context is not initialized. Cannot draw any elements!" );
    }
};

ChartDisplay.prototype.drawHorizontalLabels = function( labelContent, stepIncrement, yCoord, performRotation, rotationDegree ) {
    if ( !labelContent ) {
        return;
    }
    var countOfLabels = labelContent.length;
    var currentXPos = this.plotStartCoordX;
    var activeDrawingContext = this.drawingContext;
    if ( performRotation ) {
        this.rotateGraphicsContext( activeDrawingContext, rotationDegree );
    }
    for ( var i = 0; i < countOfLabels; i++ ) {
        if ( i === 0 ) {
            this.renderTextLabel( labelContent[i], currentXPos, yCoord );
        }
        else {
            currentXPos += stepIncrement;
            this.renderTextLabel( labelContent[i], currentXPos, yCoord );
        }
    }
    if ( performRotation ) {
        // Revert the canvas transformation to its original state.
        activeDrawingContext.restore();
    }
};

ChartDisplay.prototype.drawVerticalLabels = function( labelStrings, stepValueAmount, xCoord ) {
    if ( !labelStrings ) {
        return;
    }
    var labelCount = labelStrings.length;
    var currentYPos = this.plotStartCoordY;
    for ( var i = 0; i < labelCount; i += 1 ) {
        if ( i === 0 ) {
            this.renderTextLabel( labelStrings[i], xCoord, currentYPos );
        }
        else {
            currentYPos -= ( stepValueAmount + 12 );
            this.renderTextLabel( labelStrings[i], xCoord, currentYPos );
        }
    }
};

ChartDisplay.prototype.renderTextLabel = function( textToDisplay, xPosition, yPosition ) {
    var activeDrawingContext = this.drawingContext;
    if ( this.displayFont !== "" ) {
        activeDrawingContext.font = this.displayFont;
    }
    activeDrawingContext.fillStyle = this.labelFontColor;
    activeDrawingContext.fillText( textToDisplay, xPosition, yPosition );
};

ChartDisplay.prototype.rotateGraphicsContext = function( graphicsContext, rotationAngleValue ) {
     graphicsContext.save();
     // graphicsContext.translate(newXValue, newYValue); // Placeholder for potential translation
     graphicsContext.rotate( rotationAngleValue );
};

ChartDisplay.prototype.drawPlotLine = function( beginX, beginY, finalX, finalY, lineConfiguration ) {
    var activeDrawingContext = this.drawingContext;
    if ( lineConfiguration ) {
        activeDrawingContext.strokeStyle = ( lineConfiguration.hasOwnProperty( "strokeStyle" ) ) ? lineConfiguration.strokeStyle : this.axisLineColor;
        activeDrawingContext.lineWidth = ( lineConfiguration.hasOwnProperty( "lineWidth" ) ) ? lineConfiguration.lineWidth : 1;
        activeDrawingContext.lineCap = ( lineConfiguration.hasOwnProperty( "lineCap" ) ) ? lineConfiguration.lineCap : "round";
    }
    else {
        activeDrawingContext.strokeStyle = this.axisLineColor;
        activeDrawingContext.lineWidth = 10;
        activeDrawingContext.lineCap = "round";
    }
    activeDrawingContext.beginPath();
    activeDrawingContext.moveTo( beginX, beginY );
    activeDrawingContext.lineTo( finalX, finalY );
    activeDrawingContext.stroke();
    activeDrawingContext.closePath();
};

ChartDisplay.prototype.renderCircleShape = function( centerX, centerY, circleRadiusValue, shapeConfig ) {
    var circleOutline = "#333333";
    var circleFill = "#666666";
    if ( shapeConfig ) {
        circleOutline = ( shapeConfig.hasOwnProperty( "strokeStyle" ) ) ? shapeConfig.strokeStyle : "#333333";
        circleFill = ( shapeConfig.hasOwnProperty( "fillStyle" ) ) ? shapeConfig.fillStyle : "#666666";
    }
    var activeDrawingContext = this.drawingContext;
    // Render the circular shape.
    activeDrawingContext.strokeStyle = circleOutline;
    activeDrawingContext.fillStyle = circleFill;
    activeDrawingContext.beginPath();
    activeDrawingContext.arc( centerX, centerY, circleRadiusValue, 0, Math.PI * 2, true );
    activeDrawingContext.closePath();
    activeDrawingContext.stroke();
    activeDrawingContext.fill();
};

ChartDisplay.prototype.generateChartGradient = function() {
    var activeDrawingContext = this.drawingContext;
    var barAreaGradient = activeDrawingContext.createLinearGradient( 0, 0, 320, 0 );
    barAreaGradient.addColorStop( 0, this.primaryFillColor );
    barAreaGradient.addColorStop( 1, this.secondaryFillColor );
    this.plotBarGradient = barAreaGradient;
};

ChartDisplay.prototype.drawHorizontalBars = function( dataArray, verticalSpacing ) {
    if ( !dataArray ) {
        console.log( "Input data is undefined! An array containing numerical values is required." );
        return;
    }
    // Prepare the gradient for filling the bars.
    this.generateChartGradient();
    var activeDrawingContext = this.drawingContext;
    var currentY = this.plotStartCoordY + 10;
    var barStartX = this.plotStartCoordX + 2;
    var dataItemsCount = dataArray.length;
    var lineStyleOptions = { "lineWidth": this.barSegmentHeight, "strokeStyle": this.plotBarGradient };
    for ( var i = 0; i < dataItemsCount; i++ ) {
        var barEndX = barStartX + ( this.horizontalScalingFactor * dataArray[i] );
        this.drawPlotLine( barStartX, currentY, barEndX, currentY, lineStyleOptions );
        if ( this.displayDataValues ) {
            this.renderTextLabel( dataArray[i], barEndX + 10, currentY - 12 );
        }
        // Advance the Y-coordinate for the next bar.
        currentY -= ( verticalSpacing + 12 );
    }
};

/**
 * Inserts the generated canvas element into its designated container
 * or returns its data URL if no container is specified.
 */
ChartDisplay.prototype.presentVisualization = function() {
    /*
    var chartImageElement = document.createElement("IMG");
    chartImageElement.id = "outputChartImage";
    chartImageElement.width = this.drawingAreaWidth;
    chartImageElement.height = this.drawingAreaHeight;
    */

    // If a host container exists, embed the canvas within it.
    if ( this.hostElement !== null && this.renderCanvas !== null ) {
        this.hostElement.innerHTML = "";
        // Uncomment the section above and this line if you prefer an IMG tag display.
        this.hostElement.appendChild( this.renderCanvas );
        /*
        chartImageElement.src = this.renderCanvas.toDataURL();
        this.hostElement.appendChild(chartImageElement);
        */
    }
    // Otherwise, provide the canvas content as a data URL.
    else {
        return this.renderCanvas.toDataURL();
    }
};

ChartDisplay.prototype.clearDrawingResources = function() {
    this.drawingContext = null;
    this.renderCanvas = null;
    // Clear all child elements from the host container.
    this.hostElement.innerHTML = "";
    this.hostElement = null;
    console.log( "Graphics resources have been successfully released." );
};

if ( typeof module !== "undefined" ) {
    module.exports = new ChartDisplay();
}