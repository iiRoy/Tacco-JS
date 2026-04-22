// This software was developed at the National Institute of Standards and Technology
// by employees of the Federal Government in the course of their official duties.
// Pursuant to title 17 Section 105 of the United States Code this software is not
// subject to copyright protection and is in the public domain.
// This software is an experimental system. NIST assumes no responsibility whatsoever
// for its use by other parties, and makes no guarantees, expressed or implied,
// about its quality, reliability, or any other characteristic.
// We would appreciate acknowledgement if the software is used.

// Module for OpenSeadragon scalebar functionality.
( function ( $ ) {


    // Check for OpenSeadragon version compatibility.
    if ( !$.version || $.version.major < 1 ) {
        throw new Error( 'OpenSeadragonScalebar requires OpenSeadragon version 1.0.0+' );
    }

    // Extend the OpenSeadragon Viewer prototype to include a scalebar method.
    $.Viewer.prototype.scalebar = function ( options ) {
        // If no scalebar instance exists for this viewer, create one.
        if ( !this.scalebarInstance ) {
            options = options || {}; // Ensure options is an object.
            options.viewer = this;   // Pass the current viewer instance.
            this.scalebarInstance = new $.Scalebar( options ); // Create new Scalebar.
        }
        else {
            // If a scalebar already exists, just refresh it with new options.
            this.scalebarInstance.refresh( options );
        }
    };


    // Define types of scalebars.
    $.ScalebarType = {
        NONE: 0,        // No scalebar type specified.
        MICROSCOPY: 1,  // Scalebar suitable for microscopy images.
        MAP: 2          // Scalebar suitable for maps.
    };


    // Define possible locations for the scalebar within the viewer.
    $.ScalebarLocation = {
        NONE: 0,
        TOP_LEFT: 1,
        TOP_RIGHT: 2,
        BOTTOM_RIGHT: 3,
        BOTTOM_LEFT: 4
    };


    // The Scalebar class constructor.
    // @class Scalebar
    // @param {Object} options Configuration options for the scalebar.
    // @param {OpenSeadragon.Viewer} options.viewer The OSD viewer instance.
    // @param {OpenSeadragon.ScalebarType} options.type Type of scale bar. Default: microscopy.
    // @param {Integer} options.pixelsPerMeter Pixels per meter at original image size.
    //                          If null, scale bar is not displayed. Default: null.
    // @param {String} options.minWidth Min width of scale bar as CSS string (e.g., "100px").
    //                          Default: "150px".
    // @param {OpenSeadragon.ScalebarLocation} options.location Position of scale bar.
    //                          Default: bottom left.
    // @param {Integer} options.xOffset X-axis offset from the specified location. Default: 5.
    // @param {Integer} options.yOffset Y-axis offset from the specified location. Default: 5.
    // @param {Boolean} options.stayInsideImage Keep scale bar within image bounds when zooming out.
    //                          Default: true.
    // @param {String} options.color Color of the scale bar (e.g., "black" or "#000000").
    //                          Default: "black".
    // @param {String} options.fontColor Font color for text. Default: "black".
    // @param {String} options.backgroundColor Background color for the scale bar. Default: "none".
    // @param {String} options.fontSize Font size for text. Default: not set.
    // @param {String} options.barThickness Thickness of the scale bar in pixels. Default: 2.
    // @param {function} options.sizeAndTextRenderer Function to determine bar size and text.
    //                          Takes PPM and minSize. Returns {size: num, text: string}.
    //                          Default: $.ScalebarSizeAndTextRenderer.METRIC_LENGTH.
    $.Scalebar = function ( options ) {

        options = options || {}; // Initialize options if not provided.

        // Viewer is a mandatory option.
        if ( !options.viewer ) {
            throw new Error( "A viewer must be specified." );
        }

        this.viewer = options.viewer; // Store the viewer reference.

        // Create the main DOM element for the scalebar.
        this.divElt = document.createElement( "div" );
        this.viewer.container.appendChild( this.divElt ); // Append to viewer container.

        // Set basic styles for the scalebar div.
        this.divElt.style.position = "relative";
        this.divElt.style.margin = "0";
        this.divElt.style.pointerEvents = "none";

        // Set the minimum width using a helper method.
        this.setMinWidth( options.minWidth || "150px" );

        // Determine which drawing function to use based on type.
        this.setDrawScalebarFunction( options.type || $.ScalebarType.MICROSCOPY );
        this.color = options.color || "black";               // Bar color.
        this.fontColor = options.fontColor || "black";         // Text color.
        this.backgroundColor = options.backgroundColor || "none"; // Background color.
        this.fontSize = options.fontSize || "";              // Font size.
        this.barThickness = options.barThickness || 2;       // Thickness of the bar.
        this.pixelsPerMeter = options.pixelsPerMeter || null; // Conversion factor.
        this.location = options.location || $.ScalebarLocation.BOTTOM_LEFT; // Position.
        this.xOffset = options.xOffset || 5;                 // X-axis offset.
        this.yOffset = options.yOffset || 5;                 // Y-axis offset.
        // Check if stayInsideImage is explicitly defined, otherwise default to true.
        this.stayInsideImage = isDefined( options.stayInsideImage ) ?
            options.stayInsideImage : true;
        this.sizeAndTextRenderer = options.sizeAndTextRenderer ||
            $.ScalebarSizeAndTextRenderer.METRIC_LENGTH; // Custom renderer.

        var self = this; // Capture 'this' for event handlers.

        // Attach event handlers to the viewer for refreshing the scalebar.
        this.viewer.addHandler( "open", function () {
            self.refresh(); // Refresh on image open.
        } );
        this.viewer.addHandler( "animation", function () {
            self.refresh(); // Refresh during animation (zoom/pan).
        } );
        this.viewer.addHandler( "resize", function () {
            self.refresh(); // Refresh on viewer resize.
        } );
    };


    // Prototype methods for the Scalebar class.
    $.Scalebar.prototype = {

        // Updates the scalebar's configuration options.
        updateOptions: function ( options ) {
            if ( !options ) {
                return; // Do nothing if no options are provided.
            }
            // Update each option only if it's explicitly defined in the input.
            if ( isDefined( options.type ) ) {
                this.setDrawScalebarFunction( options.type );
            }
            if ( isDefined( options.minWidth ) ) {
                this.setMinWidth( options.minWidth );
            }
            if ( isDefined( options.color ) ) {
                this.color = options.color;
            }
            if ( isDefined( options.fontColor ) ) {
                this.fontColor = options.fontColor;
            }
            if ( isDefined( options.backgroundColor ) ) {
                this.backgroundColor = options.backgroundColor;
            }
            if ( isDefined( options.fontSize ) ) {
                this.fontSize = options.fontSize;
            }
            if ( isDefined( options.barThickness ) ) {
                this.barThickness = options.barThickness;
            }
            if ( isDefined( options.pixelsPerMeter ) ) {
                this.pixelsPerMeter = options.pixelsPerMeter;
            }
            if ( isDefined( options.location ) ) {
                this.location = options.location;
            }
            if ( isDefined( options.xOffset ) ) {
                this.xOffset = options.xOffset;
            }
            if ( isDefined( options.yOffset ) ) {
                this.yOffset = options.yOffset;
            }
            if ( isDefined( options.stayInsideImage ) ) {
                this.stayInsideImage = options.stayInsideImage;
            }
            if ( isDefined( options.sizeAndTextRenderer ) ) {
                this.sizeAndTextRenderer = options.sizeAndTextRenderer;
            }
        },

        // Sets the internal function responsible for drawing the scalebar based on its type.
        setDrawScalebarFunction: function ( type ) {
            if ( !type ) {
                this.drawScalebar = null; // No type means no drawing.
            }
            else if ( type === $.ScalebarType.MAP ) {
                this.drawScalebar = this.drawMapScalebar; // Use map style.
            }
            else {
                this.drawScalebar = this.drawMicroscopyScalebar; // Default to microscopy style.
            }
        },

        // Sets the minimum width for the scalebar.
        setMinWidth: function ( minWidth ) {
            this.divElt.style.width = minWidth; // Apply CSS width.
            // Temporarily display the element to accurately measure its offsetWidth.
            this.divElt.style.display = "";
            this.minWidth = this.divElt.offsetWidth; // Store computed minimum width.
        },

        // Refreshes the scalebar's display based on current viewer state and options.
        // @param {Object} options (Optional) New options to apply before refreshing.
        // @param {OpenSeadragon.ScalebarType} options.type Type of scale bar. Default: microscopy
        // @param {Integer} options.pixelsPerMeter Pixels per meter at original image size.
        //                          If null, scale bar is not displayed. Default: null
        // @param (String} options.minWidth Min width of scale bar as CSS string (e.g., "100px").
        //                          Default: "150px"
        // @param {OpenSeadragon.ScalebarLocation} options.location Position of scale bar.
        //                          Default: bottom left
        // @param {Integer} options.xOffset X-axis offset from the specified location. Default: 5
        // @param {Integer} options.yOffset Y-axis offset from the specified location. Default: 5
        // @param {Boolean} options.stayInsideImage Keep scale bar within image bounds when zooming out.
        //                          Default: true
        // @param {String} options.color Color of the scale bar (e.g., "black" or "#000000").
        //                          Default: "black"
        // @param {String} options.fontColor Font color for text. Default: "black"
        // @param {String} options.backgroundColor Background color for the scale bar. Default: "none"
        // @param {String} options.fontSize Font size for text. Default: not set
        // @param {String} options.barThickness Thickness of the scale bar in pixels. Default: 2
        // @param {function} options.sizeAndTextRenderer Function to determine bar size and text.
        //                          Takes PPM and minSize. Returns {size: num, text: string}.
        //                          Default: $.ScalebarSizeAndTextRenderer.METRIC_LENGTH
        refresh: function ( options ) {

            this.updateOptions( options ); // Apply any new options first.

            // Hide scalebar if conditions for display are not met.
            if ( !this.viewer.isOpen() ||
                !this.drawScalebar ||
                !this.pixelsPerMeter ||
                !this.location ) {
                this.divElt.style.display = "none";
                return;
            }
            this.divElt.style.display = ""; // Ensure scalebar is visible.

            var viewport = this.viewer.viewport;
            // Calculate current pixels per meter.
            var zoom = viewport.viewportToImageZoom( viewport.getZoom( true ) );
            var currentPPM = zoom * this.pixelsPerMeter;

            // Use the renderer to get the appropriate size and text for the scalebar.
            var props = this.sizeAndTextRenderer( currentPPM, this.minWidth );

            // Draw the scalebar using the selected drawing function.
            this.drawScalebar( props.size, props.text );
            var location = this.getScalebarLocation(); // Get computed position.
            // Apply position to the scalebar div.
            this.divElt.style.left = location.x + "px";
            this.divElt.style.top = location.y + "px";
        },

        // Draws a scalebar in the microscopy style (thin line at the bottom).
        drawMicroscopyScalebar: function ( size, text ) {
            this.divElt.style.fontSize = this.fontSize;
            this.divElt.style.textAlign = "center";
            this.divElt.style.color = this.fontColor;
            this.divElt.style.border = "none"; // No border by default.
            // Add a bottom border to represent the bar.
            this.divElt.style.borderBottom = this.barThickness + "px solid " + this.color;
            this.divElt.style.backgroundColor = this.backgroundColor;
            this.divElt.innerHTML = text; // Set the text content.
            this.divElt.style.width = size + "px"; // Set the width.
        },

        // Draws a scalebar in the map style (box with border).
        drawMapScalebar: function ( size, text ) {
            this.divElt.style.fontSize = this.fontSize;
            this.divElt.style.textAlign = "center";
            this.divElt.style.color = this.fontColor;
            // Apply a full border, then remove the top part.
            this.divElt.style.border = this.barThickness + "px solid " + this.color;
            this.divElt.style.borderTop = "none";
            this.divElt.style.backgroundColor = this.backgroundColor;
            this.divElt.innerHTML = text;
            this.divElt.style.width = size + "px";
        },

        // Computes the pixel location for the scalebar based on its configured location.
        // @returns {OpenSeadragon.Point} The (x, y) coordinates for the scalebar.
        getScalebarLocation: function () {
            var x, y;
            var pixel;
            var container = this.viewer.container;

            if ( this.location === $.ScalebarLocation.TOP_LEFT ) {
                x = 0;
                y = 0;
                if ( this.stayInsideImage ) {
                    // Get pixel coordinates of viewport origin (0,0).
                    pixel = this.viewer.viewport.pixelFromPoint(
                        new $.Point( 0, 0 ), true );
                    if ( !this.viewer.wrapHorizontal ) {
                        x = Math.max( pixel.x, 0 );
                    }
                    if ( !this.viewer.wrapVertical ) {
                        y = Math.max( pixel.y, 0 );
                    }
                }
                return new $.Point( x + this.xOffset, y + this.yOffset );
            }
            if ( this.location === $.ScalebarLocation.TOP_RIGHT ) {
                var barWidth = this.divElt.offsetWidth;
                x = container.offsetWidth - barWidth;
                y = 0;
                if ( this.stayInsideImage ) {
                    // Get pixel coordinates of viewport top-right (1,0).
                    pixel = this.viewer.viewport.pixelFromPoint(
                        new $.Point( 1, 0 ), true );
                    if ( !this.viewer.wrapHorizontal ) {
                        x = Math.min( x, pixel.x - barWidth );
                    }
                    if ( !this.viewer.wrapVertical ) {
                        y = Math.max( y, pixel.y );
                    }
                }
                return new $.Point( x - this.xOffset, y + this.yOffset );
            }
            if ( this.location === $.ScalebarLocation.BOTTOM_RIGHT ) {
                var barWidth = this.divElt.offsetWidth;
                var barHeight = this.divElt.offsetHeight;
                x = container.offsetWidth - barWidth;
                y = container.offsetHeight - barHeight;
                if ( this.stayInsideImage ) {
                    // Get pixel coordinates of viewport bottom-right (1, 1/aspectRatio).
                    pixel = this.viewer.viewport.pixelFromPoint(
                        new $.Point( 1, 1 / this.viewer.source.aspectRatio ),
                        true );
                    if ( !this.viewer.wrapHorizontal ) {
                        x = Math.min( x, pixel.x - barWidth );
                    }
                    if ( !this.viewer.wrapVertical ) {
                        y = Math.min( y, pixel.y - barHeight );
                    }
                }
                return new $.Point( x - this.xOffset, y - this.yOffset );
            }
            if ( this.location === $.ScalebarLocation.BOTTOM_LEFT ) {
                var barHeight = this.divElt.offsetHeight;
                x = 0;
                y = container.offsetHeight - barHeight;
                if ( this.stayInsideImage ) {
                    // Get pixel coordinates of viewport bottom-left (0, 1/aspectRatio).
                    pixel = this.viewer.viewport.pixelFromPoint(
                        new $.Point( 0, 1 / this.viewer.source.aspectRatio ),
                        true );
                    if ( !this.viewer.wrapHorizontal ) {
                        x = Math.max( x, pixel.x );
                    }
                    if ( !this.viewer.wrapVertical ) {
                        y = Math.min( y, pixel.y - barHeight );
                    }
                }
                return new $.Point( x + this.xOffset, y - this.yOffset );
            }
        }
    };


    // Defines various renderers for scalebar size and text.
    $.ScalebarSizeAndTextRenderer = {

        // Renderer for metric length units (nm to km).
        // @function
        // @param {Number} ppm Pixels per meter at current zoom.
        // @param {Number} minSize Minimum pixel width for the scalebar.
        // @returns {Object} An object with 'size' (pixel width) and 'text' (label).
        METRIC_LENGTH: function ( ppm, minSize ) {
            return getScalebarSizeAndTextForMetric( ppm, minSize, "m" );
        },

        // Renderer for imperial length units (thou, inch, foot, mile).
        // @function
        // @param {Number} ppm Pixels per meter at current zoom.
        // @param {Number} minSize Minimum pixel width for the scalebar.
        // @returns {Object} An object with 'size' (pixel width) and 'text' (label).
        IMPERIAL_LENGTH: function ( ppm, minSize ) {
            var maxSize = minSize * 2; // Max desired size for a unit.
            var ppi = ppm * 0.0254;    // Pixels per inch.

            if ( maxSize < ppi * 12 ) { // If max size is less than 1 foot.
                if ( maxSize < ppi ) { // If max size is less than 1 inch.
                    var ppt = ppi / 1000; // Pixels per thou.
                    return getScalebarSizeAndText( ppt, minSize, "th" );
                }
                return getScalebarSizeAndText( ppi, minSize, "in" );
            }
            var ppf = ppi * 12; // Pixels per foot.
            if ( maxSize < ppf * 2000 ) { // If max size is less than 2000 feet.
                return getScalebarSizeAndText( ppf, minSize, "ft" );
            }
            var ppmi = ppf * 5280; // Pixels per mile.
            return getScalebarSizeAndText( ppmi, minSize, "mi" );
        },

        // Renderer for standard time units (s, min, h, day, year).
        // @function
        // @param {Number} pps Pixels per second.
        // @param {Number} minSize Minimum pixel width for the scalebar.
        // @returns {Object} An object with 'size' (pixel width) and 'text' (label).
        STANDARD_TIME: function ( pps, minSize ) {
            var maxSize = minSize * 2;

            if ( maxSize < pps * 60 ) { // Less than 1 minute.
                return getScalebarSizeAndTextForMetric( pps, minSize, "s", false );
            }
            var ppminutes = pps * 60; // Pixels per minute.
            if ( maxSize < ppminutes * 60 ) { // Less than 1 hour.
                return getScalebarSizeAndText( ppminutes, minSize, "minute", true );
            }
            var pph = ppminutes * 60; // Pixels per hour.
            if ( maxSize < pph * 24 ) { // Less than 1 day.
                return getScalebarSizeAndText( pph, minSize, "hour", true );
            }
            var ppd = pph * 24; // Pixels per day.
            if ( maxSize < ppd * 365.25 ) { // Less than 1 year.
                return getScalebarSizeAndText( ppd, minSize, "day", true );
            }
            var ppy = ppd * 365.25; // Pixels per year.
            return getScalebarSizeAndText( ppy, minSize, "year", true );
        },

        // Generic metric unit renderer. Can be used for custom units.
        // @function
        // @param {Number} ppUnit Pixels per unit.
        // @param {Number} minSize Minimum pixel width for the scalebar.
        // @param {String} unitSuffix The base unit suffix (e.g., "eV").
        // @returns {Object} An object with 'size' (pixel width) and 'text' (label).
        METRIC_GENERIC: getScalebarSizeAndTextForMetric
    };


    // Helper function to calculate scalebar size and text for non-metric units.
    function getScalebarSizeAndText ( ppm, minSize, unitSuffix, handlePlural ) {
        var value = normalize( ppm, minSize ); // Normalized value for the scalebar.
        // Calculate the actual factor (e.g., 1, 2, 5, 10, 20, 50).
        var factor = roundSignificand( value / ppm * minSize, 3 );
        var size = value * minSize; // Actual pixel width of the scalebar.
        var plural = handlePlural && factor > 1 ? "s" : ""; // Add 's' for plural if needed.

        return {
            size: size, // The width in pixels.
            text: factor + " " + unitSuffix + plural // The display text.
        };
    }


    // Helper function to calculate scalebar size and text for metric units.
    function getScalebarSizeAndTextForMetric ( ppm, minSize, unitSuffix ) {
        var value = normalize( ppm, minSize );
        var factor = roundSignificand( value / ppm * minSize, 3 );
        var size = value * minSize;
        var valueWithUnit = getWithUnit( factor, unitSuffix ); // Format with metric prefix.

        return {
            size: size,
            text: valueWithUnit
        };
    }


    // Normalizes a value to fit within a common scalebar sequence (1, 2, 4/5).
    function normalize ( value, minSize ) {
        var significand = getSignificand( value );
        var minSizeSign = getSignificand( minSize );
        var result = getSignificand( significand / minSizeSign );

        // Adjust result to be 1, 2, 4, or 5 relative to powers of 10.
        if ( result >= 5 ) {
            result /= 5;
        }
        if ( result >= 4 ) {
            result /= 4;
        }
        if ( result >= 2 ) {
            result /= 2;
        }
        return result;
    }


    // Extracts the significand (mantissa) of a number.
    // e.g., getSignificand(123) -> 1.23, getSignificand(0.045) -> 4.5
    function getSignificand ( x ) {
        return x * Math.pow( 10, Math.ceil( -log10( x ) ) );
    }


    // Rounds the significand of a number to a specified number of decimal places.
    function roundSignificand ( x, decimalPlaces ) {
        var exponent = -Math.ceil( -log10( x ) );
        var power = decimalPlaces - exponent;
        var significand = x * Math.pow( 10, power );

        // Use integer arithmetic to avoid floating point precision issues.
        if ( power < 0 ) {
            return Math.round( significand ) * Math.pow( 10, -power );
        }
        return Math.round( significand ) / Math.pow( 10, power );
    }


    // Calculates the base-10 logarithm of a number.
    function log10 ( x ) {
        return Math.log( x ) / Math.log( 10 );
    }


    // Formats a value with appropriate metric prefixes (n, μ, m, k).
    function getWithUnit ( value, unitSuffix ) {
        if ( value < 0.000001 ) {
            return value * 1000000000 + " n" + unitSuffix; // Nano.
        }
        if ( value < 0.001 ) {
            return value * 1000000 + " μ" + unitSuffix; // Micro.
        }
        if ( value < 1 ) {
            return value * 1000 + " m" + unitSuffix; // Milli.
        }
        if ( value >= 1000 ) {
            return value / 1000 + " k" + unitSuffix; // Kilo.
        }
        return value + " " + unitSuffix; // Base unit.
    }


    // Checks if a variable is defined (not undefined).
    function isDefined ( variable ) {
        return typeof ( variable ) !== "undefined";
    }

// Pass OpenSeadragon as the jQuery-like object.
}( OpenSeadragon ) );