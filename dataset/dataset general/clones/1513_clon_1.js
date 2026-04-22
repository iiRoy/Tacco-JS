/*
 * CoolClock 2.1.4 - A JavaScript analog clock library.
 * Original Copyright (c) 2010, Simon Baird.
 * Released under the BSD License.
 *
 * This script enables the display of an analog clock
 * using the HTML5 canvas element.
 * Project homepage: http://randomibis.com/coolclock/
 *
 */


// Constructor for creating new CoolClock objects.
// When called, it immediately initializes the object.
window.CoolClock = function (options)
{
    return this.init(options);
}; /* End of CoolClock constructor function */


// Global configuration object for CoolClock.
// Contains default settings and clock skin definitions.
CoolClock.config =
{
    // Delay (in milliseconds) between updates when the second hand is visible.
    tickDelay: 1000,

    // Longer delay (in milliseconds) for updates when seconds are hidden.
    longTickDelay: 15000,

    // Default visual radius for the clock display.
    defaultRadius: 85,

    // Internal rendering radius, used for scaling calculations.
    renderRadius: 100,

    // The default skin to apply to clocks if none is specified.
    defaultSkin: "swissRail",

    // Configuration flags related to display:
    // Controls the visibility of the second hand.
    showSecs: true,

    // Controls AM/PM formatting for digital display.
    showAmPm: true, /* This setting would ideally be part of a skin,
                        but is currently global. */
    // TODO: Enhance skinning to include digital display options.


    // Object containing definitions for various clock skins.
    skins:
    {
        // More skins might be available in external files (e.g., moreskins.js).
        // Users are encouraged to create custom skins by modifying these examples.
        swissRail:
        {
            outerBorder:      { lineWidth: 2, radius: 95, color: "black", alpha: 1 },
            smallIndicator:   { lineWidth: 2, startAt: 88, endAt: 92, color: "black", alpha: 1 },
            largeIndicator:   { lineWidth: 4, startAt: 79, endAt: 92, color: "black", alpha: 1 },
            hourHand:         { lineWidth: 8, startAt: -15, endAt: 50, color: "black", alpha: 1 },
            minuteHand:       { lineWidth: 7, startAt: -15, endAt: 75, color: "black", alpha: 1 },
            secondHand:       { lineWidth: 1, startAt: -20, endAt: 85, color: "red", alpha: 1 },
            secondDecoration: { lineWidth: 1, startAt: 70, radius: 4, fillColor: "red", color: "red", alpha: 1 }
        }, /* End of swissRail skin definition */

        chunkySwiss:
        {
            outerBorder:      { lineWidth: 4, radius: 97, color: "black", alpha: 1 },
            smallIndicator:   { lineWidth: 4, startAt: 89, endAt: 93, color: "black", alpha: 1 },
            largeIndicator:   { lineWidth: 8, startAt: 80, endAt: 93, color: "black", alpha: 1 },
            hourHand:         { lineWidth: 12, startAt: -15, endAt: 60, color: "black", alpha: 1 },
            minuteHand:       { lineWidth: 10, startAt: -15, endAt: 85, color: "black", alpha: 1 },
            secondHand:       { lineWidth: 4, startAt: -20, endAt: 85, color: "red", alpha: 1 },
            secondDecoration: { lineWidth: 2, startAt: 70, radius: 8, fillColor: "red", color: "red", alpha: 1 }
        }, /* End of chunkySwiss skin definition */

        chunkySwissOnBlack:
        {
            outerBorder:      { lineWidth: 4, radius: 97, color: "white", alpha: 1 },
            smallIndicator:   { lineWidth: 4, startAt: 89, endAt: 93, color: "white", alpha: 1 },
            largeIndicator:   { lineWidth: 8, startAt: 80, endAt: 93, color: "white", alpha: 1 },
            hourHand:         { lineWidth: 12, startAt: -15, endAt: 60, color: "white", alpha: 1 },
            minuteHand:       { lineWidth: 10, startAt: -15, endAt: 85, color: "white", alpha: 1 },
            secondHand:       { lineWidth: 4, startAt: -20, endAt: 85, color: "red", alpha: 1 },
            secondDecoration: { lineWidth: 2, startAt: 70, radius: 8, fillColor: "red", color: "red", alpha: 1 }
        } /* End of chunkySwissOnBlack skin definition */

    }, /* End of skins object */

    // A simple check to detect if the browser is Internet Explorer,
    // primarily for compatibility with excanvas.
    isIE: !!document.all,

    // An object used to track all active CoolClock instances,
    // indexed by the ID of their respective canvas elements.
    clockTracker: {},

    // Counter to generate unique IDs for canvas elements that do not have one.
    noIdCount: 0
}; /* End of CoolClock.config object */


// Define prototype methods that will be available to all CoolClock instances.
CoolClock.prototype =
{

    /**
     * Initializes a CoolClock instance with the provided options.
     * @param {Object} options - An object containing configuration parameters.
     * @returns {CoolClock} The initialized CoolClock instance.
     */
    init: function (options)
    {
        // Store various configuration parameters on the instance.
        this.canvasId       = options.canvasId;
        this.skinId         = options.skinId || CoolClock.config.defaultSkin;
        this.displayRadius  = options.displayRadius || CoolClock.config.defaultRadius;
        this.showSecondHand = typeof options.showSecondHand == "boolean" ? options.showSecondHand : true;
        this.gmtOffset      = (options.gmtOffset != null && options.gmtOffset != '') ? parseFloat(options.gmtOffset) : null;
        this.showDigital    = typeof options.showDigital == "boolean" ? options.showDigital : false;
        this.logClock       = typeof options.logClock == "boolean" ? options.logClock : false;
        this.logClockRev    = typeof options.logClock == "boolean" ? options.logClockRev : false;

        // Set the tick delay based on whether the second hand is being displayed.
        this.tickDelay      = CoolClock.config[ this.showSecondHand ? "tickDelay" : "longTickDelay" ];

        // Get a reference to the canvas HTML element.
        this.canvas = document.getElementById(this.canvasId);

        // Configure the canvas element's dimensions to be a square.
        this.canvas.setAttribute("width", this.displayRadius * 2);
        this.canvas.setAttribute("height", this.displayRadius * 2);
        this.canvas.style.width  = this.displayRadius * 2 + "px";
        this.canvas.style.height = this.displayRadius * 2 + "px";

        // Establish the rendering scale.
        // The renderRadius is a fixed internal drawing size, scaled to displayRadius.
        this.renderRadius = CoolClock.config.renderRadius;
        this.scale = this.displayRadius / this.renderRadius;

        // Obtain the 2D rendering context from the canvas.
        this.ctx = this.canvas.getContext("2d");
        // Apply the calculated scaling transformation to the context.
        this.ctx.scale(this.scale, this.scale);

        // Add this clock instance to the global tracker.
        CoolClock.config.clockTracker[this.canvasId] = this;

        // The initial call to `tick()` is typically handled externally,
        // so this line remains commented out as in the original.
        // this.tick();

        return this; // Allow for method chaining.
    }, /* End of init method */


    /**
     * Draws a complete circle on the canvas at the specified coordinates.
     * Drawing properties are sourced from the provided skin object.
     * @param {number} x - The x-coordinate of the circle's center.
     * @param {number} y - The y-coordinate of the circle's center.
     * @param {Object} skin - An object defining the circle's appearance (e.g., radius, color, line width).
     */
    fullCircleAt: function (x, y, skin)
    {
        this.ctx.save();                 // Save the current drawing state.
        this.ctx.globalAlpha = skin.alpha; // Set the global transparency level.
        this.ctx.lineWidth   = skin.lineWidth; // Set the stroke line width.

        // For non-IE browsers, begin a new path explicitly.
        if (!CoolClock.config.isIE)
        {
            this.ctx.beginPath();
        }

        // Adjust line width for Internet Explorer (using excanvas),
        // as excanvas does not automatically scale line widths.
        if (CoolClock.config.isIE)
        {
            this.ctx.lineWidth = this.ctx.lineWidth * this.scale;
        }

        // Draw the main arc for the circle.
        this.ctx.arc(x, y, skin.radius, 0, 2 * Math.PI, false);

        // For IE (excanvas), draw a tiny additional arc to close potential gaps.
        if (CoolClock.config.isIE)
        {
            this.ctx.arc(x, y, skin.radius, -0.1, 0.1, false);
        }

        // Fill the circle if a fillColor is specified in the skin.
        if (skin.fillColor)
        {
            this.ctx.fillStyle = skin.fillColor;
            this.ctx.fill();
        }
        else
        {
            // If no fillColor, stroke the outline of the circle.
            // (Note: The original design doesn't support both stroke and fill simultaneously here.)
            this.ctx.strokeStyle = skin.color;
            this.ctx.stroke();
        }
        this.ctx.restore(); // Restore the drawing state.
    }, /* End of fullCircleAt method */


    /**
     * Draws a given text string, centered both horizontally and vertically, at specific coordinates.
     * @param {string} theText - The text content to be drawn.
     * @param {number} x - The x-coordinate of the text's center point.
     * @param {number} y - The y-coordinate of the text's center point.
     */
    drawTextAt: function (theText, x, y)
    {
        this.ctx.save();                 // Save the current context state.
        this.ctx.font = '15px sans-serif'; // Set the font style for the text.
        var tSize = this.ctx.measureText(theText); // Measure the dimensions of the text.

        // Provide a fallback height for Firefox, as `measureText` may not return `height`.
        if (!tSize.height)
        {
            tSize.height = 15;
        }

        // Draw the text, adjusting its position for centering.
        this.ctx.fillText(theText, x - tSize.width / 2, y - tSize.height / 2);
        this.ctx.restore();              // Restore the context to its previous state.
    }, /* End of drawTextAt method */


    /**
     * Utility function to left-pad a number with a leading zero if it's a single digit.
     * @param {number} num - The number to be padded.
     * @returns {string} The padded number as a string (e.g., 5 -> "05", 12 -> "12").
     */
    lpad2: function (num)
    {
        return (num < 10 ? '0' : '') + num;
    }, /* End of lpad2 method */


    /**
     * Calculates the angular position (as a fraction of a full circle) for a given second.
     * Supports linear and logarithmic scaling.
     * @param {number} second - The current second value (0-59).
     * @returns {number} A float between 0.0 and 1.0 representing the angle fraction.
     */
    tickAngle: function (second)
    {
        // This logarithmic algorithm was contributed by David Bradshaw.
        var tweak = 3; // An adjustment constant to fine-tune the logarithmic curve's appearance.

        if (this.logClock)
        {
            // Apply a forward logarithmic scaling to the seconds.
            // If second is 0, angle is 0 to avoid log(0).
            return second == 0 ? 0 : (Math.log(second * tweak) / Math.log(60 * tweak));
        }
        else if (this.logClockRev)
        {
            // Apply a reversed logarithmic scaling.
            // First, reverse the second value, then apply log scaling, then reverse the result.
            second = (60 - second) % 60;
            return 1.0 - (second == 0 ? 0 : (Math.log(second * tweak) / Math.log(60 * tweak)));
        }
        else
        {
            // Default to linear scaling (each second is an equal fraction of the circle).
            return second / 60.0;
        }
    }, /* End of tickAngle method */


    /**
     * Generates a formatted time string for digital display based on hour, minute, and second.
     * Respects `showAmPm` and `showSecs` configuration flags.
     * @param {number} hour - The hour component (0-23).
     * @param {number} min - The minute component (0-59).
     * @param {number} sec - The second component (0-59).
     * @returns {string} The formatted time string (e.g., "10:30 pm", "08:15:45").
     */
    timeText: function (hour, min, sec)
    {
        var c = CoolClock.config; // Alias for easier access to configuration.
        return '' +
            // Format hour (12-hour or 24-hour).
            (c.showAmPm ? ((hour % 12) == 0 ? 12 : (hour % 12)) : hour) + ':' +
            // Pad minutes with a leading zero if necessary.
            this.lpad2(min) +
            // Optionally add seconds, padded with a leading zero.
            (c.showSecs ? ':' + this.lpad2(sec) : '') +
            // Optionally add AM/PM indicator.
            (c.showAmPm ? (hour < 12 ? ' am' : ' pm') : '');
    }, /* End of timeText method */


    /**
     * Draws a radial line segment, useful for clock hands or tick marks, at a given angle.
     * The line is drawn by rotating the canvas context and then drawing a horizontal line.
     * @param {number} angleFraction - The rotational angle as a fraction of a full circle (0.0 to 1.0).
     * @param {Object} skin - An object containing drawing properties for the line.
     */
    radialLineAtAngle: function (angleFraction, skin)
    {
        this.ctx.save();                               // Save the current drawing context.
        this.ctx.translate(this.renderRadius, this.renderRadius); // Move the canvas origin to the center of the clock.
        // Rotate the context. The 2.0 * angleFraction converts fraction to full circle,
        // and -0.5 adjusts for the canvas's default 0 angle (right) to clock's 0 angle (up).
        this.ctx.rotate(Math.PI * (2.0 * angleFraction - 0.5));
        this.ctx.globalAlpha = skin.alpha;             // Set the transparency level.
        this.ctx.strokeStyle = skin.color;             // Set the line color.
        this.ctx.lineWidth   = skin.lineWidth;         // Set the line thickness.

        // Adjust line width for Internet Explorer (excanvas).
        if (CoolClock.config.isIE)
        {
            this.ctx.lineWidth = this.ctx.lineWidth * this.scale;
        }

        // If the skin defines a 'radius', it implies a circular decoration at the end of the line.
        if (skin.radius)
        {
            this.fullCircleAt(skin.startAt, 0, skin);
        }
        else
        {
            // Otherwise, draw a straight line segment.
            this.ctx.beginPath();
            this.ctx.moveTo(skin.startAt, 0); // Start point of the line.
            this.ctx.lineTo(skin.endAt, 0);   // End point of the line.
            this.ctx.stroke();                // Render the line.
        }
        this.ctx.restore(); // Restore the context to its state before this method was called.
    }, /* End of radialLineAtAngle method */


    /**
     * Renders the entire clock face, including border, indicators, hands, and digital display.
     * @param {number} hour - The hour to display.
     * @param {number} min - The minute to display.
     * @param {number} sec - The second to display.
     */
    render: function (hour, min, sec)
    {
        // Retrieve the current skin configuration, falling back to the default if not found.
        var skin = CoolClock.config.skins[this.skinId];
        if (!skin)
        {
            skin = CoolClock.config.skins[CoolClock.config.defaultSkin];
        }

        // Clear the entire canvas to prepare for redrawing.
        this.ctx.clearRect(0, 0, this.renderRadius * 2, this.renderRadius * 2);

        // Draw the outer border of the clock if the skin defines it.
        if (skin.outerBorder)
        {
            this.fullCircleAt(this.renderRadius, this.renderRadius, skin.outerBorder);
        }

        // Draw the minute and hour tick marks around the clock face.
        // Every 5th mark is rendered as a 'largeIndicator', others as 'smallIndicator'.
        for (var i = 0; i < 60; i++)
        {
            (i % 5)  && skin.smallIndicator && this.radialLineAtAngle(this.tickAngle(i), skin.smallIndicator);
            !(i % 5) && skin.largeIndicator && this.radialLineAtAngle(this.tickAngle(i), skin.largeIndicator);
        }

        // If digital display is enabled, draw the current time as text.
        if (this.showDigital)
        {
            this.drawTextAt(
                this.timeText(hour, min, sec),
                this.renderRadius,
                this.renderRadius + this.renderRadius / 2
            );
        }

        // Draw the hour hand if defined in the skin.
        if (skin.hourHand)
        {
            this.radialLineAtAngle(this.tickAngle(((hour % 12) * 5 + min / 12.0)), skin.hourHand);
        }

        // Draw the minute hand if defined in the skin.
        if (skin.minuteHand)
        {
            this.radialLineAtAngle(this.tickAngle((min + sec / 60.0)), skin.minuteHand);
        }

        // Draw the second hand if enabled and defined in the skin.
        if (this.showSecondHand && skin.secondHand)
        {
            this.radialLineAtAngle(this.tickAngle(sec), skin.secondHand);
        }

        // Draw the second hand decoration, but skip it for IE due to rendering inconsistencies.
        if (!CoolClock.config.isIE && this.showSecondHand && skin.secondDecoration)
        {
            this.radialLineAtAngle(this.tickAngle(sec), skin.secondDecoration);
        }
    }, /* End of render method */


    /**
     * Updates the clock display with the current time.
     * It considers a GMT offset if one is configured for the clock.
     */
    refreshDisplay: function ()
    {
        var now = new Date(); // Get the current date and time.

        if (this.gmtOffset != null)
        {
            // If a GMT offset is specified, calculate the time for that timezone.
            var offsetNow = new Date(now.valueOf() + (this.gmtOffset * 1000 * 60 * 60));
            this.render(offsetNow.getUTCHours(), offsetNow.getUTCMinutes(), offsetNow.getUTCSeconds());
        }
        else
        {
            // Otherwise, use the client's local time.
            this.render(now.getHours(), now.getMinutes(), now.getSeconds());
        }
    }, /* End of refreshDisplay method */


    /**
     * Schedules the next execution of the clock's `tick` method.
     * Uses `setTimeout` for asynchronous, delayed execution.
     */
    nextTick: function ()
    {
        // Set a timeout to call the `tick` method of this specific clock instance
        // after the configured `tickDelay`.
        setTimeout("CoolClock.config.clockTracker['" + this.canvasId + "'].tick()", this.tickDelay);
    }, /* End of nextTick method */


    /**
     * Checks if the canvas element associated with this CoolClock instance is still present in the DOM.
     * This prevents errors if a canvas is removed while its clock is still ticking.
     * @returns {boolean} True if the canvas element is found, false otherwise.
     */
    stillHere: function ()
    {
        return document.getElementById(this.canvasId) != null;
    }, /* End of stillHere method */


    /**
     * The primary handler for a clock "tick".
     * It refreshes the clock's visual display and then schedules the next tick.
     */
    tick: function ()
    {
        // Proceed only if the canvas element is still part of the document.
        if (this.stillHere())
        {
            this.refreshDisplay(); // Update the clock's hands and digital time.
            this.nextTick();       // Schedule the next update cycle.
        }
    } /* End of tick method */

}; /* End of CoolClock.prototype object */


/**
 * Static method: Scans the document for <canvas> elements with the "CoolClock" class
 * and initializes them into functional clocks.
 */
CoolClock.findAndCreateClocks = function ()
{
    // Retrieve all canvas elements in the HTML document.
    // (This avoids reliance on jQuery selectors for broader compatibility).
    var canvases = document.getElementsByTagName("canvas");

    // Iterate through each canvas element found.
    for (var i = 0; i < canvases.length; i++)
    {
        // Attempt to parse clock configuration parameters from the canvas's class attribute.
        // The expected format for the class is "CoolClock:skinId:displayRadius:showSecondHandFlag:gmtOffset:showDigitalFlag:logClockFlag".
        var fields = canvases[i].className.split(" ")[0].split(":");

        // Check if the first field indicates this canvas is meant to be a CoolClock.
        if (fields[0] == "CoolClock")
        {
            // If the canvas element lacks an ID, assign a unique one.
            if (!canvases[i].id)
            {
                canvases[i].id = '_coolclock_auto_id_' + CoolClock.config.noIdCount++;
            }

            // Create a new CoolClock instance using the parsed options.
            // NOTE: The original code's 'return' here causes it to exit after the *first* clock found.
            // This behavior is preserved for Type I clone accuracy, despite potentially being a bug.
            return new CoolClock({
                canvasId:       canvases[i].id,
                skinId:         fields[1],
                displayRadius:  fields[2],
                showSecondHand: fields[3] != 'noSeconds',
                gmtOffset:      fields[4],
                showDigital:    fields[5] == 'showDigital',
                logClock:       fields[6] == 'logClock',
                logClockRev:    fields[6] == 'logClockRev'
            });
        }
    }
}; /* End of findAndCreateClocks method */


// Auto-initialization script:
// If jQuery is available and loaded, schedule `findAndCreateClocks` to run when the DOM is ready.
// Otherwise, users must manually call `CoolClock.findAndCreateClocks()`
// (e.g., via `<body onload="CoolClock.findAndCreateClocks()">`).
if (window.jQuery)
{
    jQuery(document).ready(CoolClock.findAndCreateClocks);
}
// End of CoolClock.js source code.