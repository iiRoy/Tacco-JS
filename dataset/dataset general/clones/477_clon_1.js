/*
* This file defines the TimeLiner object and its associated utility functions.
* It's a JavaScript library for creating interactive timelines.
* Developed by Julien Kirch in 2011, licensed under MIT.
* Portions of the code related to scrolling behavior are adapted from
* resources found at http://jqueryfordesigners.com/fun-with-overflows/.
*/
// The main TimeLiner function definition follows.
/*
 * Initializes a new TimeLiner instance.
 * @param {Object} initialParams - Configuration object for the timeline.
 *
 * Required properties within `initialParams`:
 *  - `events`: An array of event objects. Each event must have a `date` property.
 *              If using the default main drawer, events also need a `content` property
 *              returning the HTML string for display.
 *  - `mainTimeLinerSelector`: A jQuery selector string identifying the DOM element
 *                             that will serve as the main timeline container.
 *
 * Optional properties within `initialParams` (with default values or descriptions):
 *  - `overviewTimeLinerSelector`: jQuery selector for the overview timeline container.
 *  - `mainDrawer`: Function to generate HTML for a main timeline event.
 *                  Signature: `function(event) { return "<div>Event HTML</div>"; }`.
 *                  Defaults to `TimeLiner.simpleMainDrawer`.
 *  - `overviewDrawer`: Function to generate HTML for an overview timeline event.
 *                      Signature: `function(event) { return "<div>Overview HTML</div>"; }`.
 *                      Defaults to `TimeLiner.simpleOverviewDrawer`.
 *  - `leftArrowSelector`: jQuery selector for the left scroll arrow.
 *  - `rightArrowSelector`: jQuery selector for the right scroll arrow.
 *  - `numberOfPixelsPerArrowClick`: Pixels to scroll per arrow click (default: 800).
 *  - `widthPerYear`: Pixels representing one year on the main timeline (default: 200).
 *  - `onClickEvent`: Callback function for event clicks. Signature: `function(event) { ... }`.
 *  - `pixelsBeforeFirstDateOverview`: Offset in pixels before the first year in the overview (default: 3).
 *
 * Advanced/Customization properties:
 *  - `numberOfPixelsForYear`: Function to calculate pixels for a specific year.
 *                             Signature: `function(params, year) { return pixels; }`.
 *                             Overrides `widthPerYear` for per-year customization.
 *  - `pixelsBeforeEvent`: Horizontal offset for event divs relative to their date (default: 2).
 *  - `timeBlocksAndDatesOverlay`: Boolean, true if time blocks and dates should overlay (default: true).
 *  - `numberOfPixelsToDate`: Function to convert pixels from left to a date.
 *                            Signature: `function(params, minYear, pixels) { return date; }`.
 *  - `dateToNumberOfPixels`: Function to convert a date to pixels from left.
 *                            Signature: `function(params, minYear, date) { return pixels; }`.
 */
function TimeLiner( initialParams )
{
    // Ensure that the required 'events' parameter is provided for timeline population.
    if (! initialParams.events )
    {
        alert( "No events in the params !" );
        return;
    }

    var events = initialParams.events ; // Local reference to the events array.

    // The main timeline selector is also a mandatory configuration item.
    if (! initialParams.mainTimeLinerSelector )
    {
        alert( "No mainTimeLinerSelector in the params !" );
        return;
    }

    // Attempt to retrieve the main timeline DOM element using jQuery.
    var mainTimeline = $( initialParams.mainTimeLinerSelector );
    if ( mainTimeline.length == 0 )
    {
        alert( "Main timeline selector \"" + initialParams.mainTimeLinerSelector + "\" returns no element" );
        return; // Exit if the main timeline element is not found.
    }

    // Initialize overview timeline variable, it might not be used.
    var overviewTimeLine = null;
    if ( initialParams.overviewTimeLinerSelector )
    {
        // If an overview selector is provided, try to find the element.
        overviewTimeLine = $( initialParams.overviewTimeLinerSelector );
        if ( overviewTimeLine.length == 0 )
        {
            alert( "Overview timeline selector \"" + params.overviewTimeLiner + "\" returns no element" );
            return; // Essential for the overview to function.
        }
    }

    // Define the set of default configuration parameters for the TimeLiner.
    var defaultParams = {
        "mainDrawer"                     : TimeLiner.simpleMainDrawer,
        "pixelsBeforeEvent"              : 2,
        "widthPerYear"                   : 200,
        "numberOfPixelsToDate"           : TimeLiner.simpleNumberOfPixelsToDate,
        "dateToNumberOfPixels"           : TimeLiner.simpleDateToNumberOfPixels,
        "numberOfPixelsForYear"          : TimeLiner.simpleNumberOfPixelsForYear,
        "overviewDrawer"                 : TimeLiner.simpleOverviewDrawer,
        "pixelsBeforeFirstDateOverview"  : 3,
        "timeBlocksAndDatesOverlay"      : true,
        "numberOfPixelsPerArrowClick"    : 800
    };

    // Merge default parameters with the user-provided initial parameters.
    // User-provided parameters will override defaults where they exist.
    var params = $.extend( {}, defaultParams, initialParams );

    // Iterate through all provided events to ensure each has a valid date property.
    // This is crucial for proper timeline rendering.
    $.each( events, function( index, event )
    {
        if ( ! event.date )
        {
            alert( "Event \"" + event + "\" have no date" ); // Inform the user if an event is missing a date.
        }
    } );

    // Construct the primary timeline display area.
    var timeLinerMain = $( "<div class='tlMain' style='height:" + mainTimeline.height() + "px;'></div>" )
        .appendTo( mainTimeline );

    // Determine the earliest and latest years present in the event data.
    var minYear = events[0].date.getFullYear();
    var maxYear = events[events.length - 1].date.getFullYear();

    // Loop to dynamically generate and append DIV elements for each year in the timeline.
    var currentX = 0; // Tracks the horizontal position for placing year blocks.
    for ( var i = 0; i <= ( maxYear - minYear ) + 1; i++ )
    {
        // Calculate the width for the current year's block using the configured method.
        var currentYearWith = params.numberOfPixelsForYear( params, i + minYear );

        // Create the DIV for the year number and append it to the main timeline container.
        var year = $( "<div class='tlMainDate' style='width:" + currentYearWith + "px;left:" + currentX + "px;'>" + ( minYear + i ) + "</div>" )
            .appendTo( timeLinerMain );

        // Determine the height for the background time block, considering overlay settings.
        var heightStyle = mainTimeline.height() - ( params.timeBlocksAndDatesOverlay ? 0 : year.outerHeight( true ) );

        // Append the background block for the current year.
        timeLinerMain.append( "<div class='tlMainTimeBlock' style='width:" + currentYearWith + "px;left:" + currentX + "px;height:" + heightStyle + "px;'></div>" );

        currentX += currentYearWith; // Advance the horizontal position for the next year.
    }

    // Proceed to create and position individual event elements on the main timeline.
    var existingEvents = []; // Array to keep track of positioned events for overlay detection.
    for ( i = 0; i < events.length; i++ )
    {
        var event = events[i]; // Get the current event object.
        // Calculate the horizontal position for the event based on its date.
        var left = params.dateToNumberOfPixels( params, minYear, event.date ) - params.pixelsBeforeEvent;

        // Obtain the HTML content for the event using the main drawer function.
        var eventContent = params.mainDrawer( event );
        // Create the new event DIV and append it to the main timeline.
        var newEvent = $( "<div class='tlMainEvent'>" + eventContent + "</div>" )
            .appendTo( timeLinerMain );

        var width = ( newEvent.outerWidth( true ) + 10 ); // Calculate the total width, adding padding.
        newEvent.css( 'min-width', width + "px" ); // Set the minimum width for the event element.
        newEvent.css( 'left', left + "px" ); // Set the calculated left position.

        // If an onClickEvent handler is provided, attach it to the new event.
        if ( params.onClickEvent )
        {
            newEvent.click( { "event": event, "f": params.onClickEvent },
                function( params )
                {
                    params.data.f( params.data.event ); // Execute the user-defined click handler.
                }
            ).addClass( 'tlClickable' ); // Add a class to indicate clickability.
        }

        // Prepare to calculate the vertical position to avoid overlapping events.
        var height = newEvent.outerHeight( true );
        // Represent the event's bounding box for collision detection.
        var e = { "top": 0, "left": left, "right": left + width, "bottom": height };

        // Adjust the event's vertical position if it overlaps with previously placed events.
        TimeLiner.noOverlay( e, height, existingEvents );
        if ( e.top != 0 )
        {
            newEvent.css( 'top', e.top + "px" ); // Apply the new top position if adjusted.
        }
        existingEvents.push( e ); // Add the positioned event to the list.
        // Sort existing events by their top position to optimize future overlay checks.
        existingEvents.sort( function( a, b )
        {
            return a.top - b.top;
        } );
    }

    // If a left arrow selector is provided, set up its click handler for scrolling left.
    if ( params.leftArrowSelector )
    {
        $( params.leftArrowSelector ).click(
            function()
            {
                timeLinerMain.scrollTo( { top: 0, left: '-=' + params.numberOfPixelsPerArrowClick + 'px' }, 800 );
            }
        ).addClass( 'tlClickable' );
    }
    // If a right arrow selector is provided, configure its click handler for scrolling right.
    if ( params.rightArrowSelector )
    {
        $( params.rightArrowSelector ).click(
            function()
            {
                timeLinerMain.scrollTo( { top: 0, left: '+=' + params.numberOfPixelsPerArrowClick + 'px' }, 800 );
            }
        ).addClass( 'tlClickable' );
    }

    // Render the overview timeline if its selector was provided and the element found.
    if ( overviewTimeLine )
    {
        // Create the overview timeline container element.
        var timeLinerOverview = $( "<div class='tlOverview tlClickable' style='height:" + overviewTimeLine.height() + "px;'></div>" )
            .appendTo( overviewTimeLine );

        // Calculate the number of years to be displayed in the overview.
        var numberOfYears = ( 1 + maxYear - minYear );
        // Determine an approximate width for each year block in the overview.
        var widthForEachYear = Math.ceil( ( overviewTimeLine.outerWidth( true ) - ( 15 + params.pixelsBeforeFirstDateOverview ) ) / numberOfYears );

        // Adjust the number of years if the calculated width doesn't fill the overview container.
        if ( ( widthForEachYear * numberOfYears ) < overviewTimeLine.outerWidth( true ) )
        {
            numberOfYears++; // Increment to ensure coverage.
        }

        // Helper function to convert a date into a pixel position within the overview.
        var dateToPixelForOverview = function( date )
        {
            return Math.ceil( ( date.getFullYear() - minYear + ( date.getDOY() / 365 ) ) * widthForEachYear );
        };

        // Create the "displayed zone" indicator for the overview timeline.
        var displayedZone = $( "<div class='tlDisplayedZone'></div>" )
            .appendTo( timeLinerOverview );

        // Attach a scroll event listener to the main timeline to update the overview indicator.
        timeLinerMain.scroll( function()
        {
            // Calculate the start and end dates visible in the main timeline.
            var date1 = params.numberOfPixelsToDate( params, minYear, timeLinerMain.scrollLeft() );
            var x1 = dateToPixelForOverview( date1 );
            var date2 = params.numberOfPixelsToDate( params, minYear, timeLinerMain.scrollLeft() + mainTimeline.width() );
            var x2 = dateToPixelForOverview( date2 );

            // Update the position and width of the displayed zone in the overview.
            displayedZone.css( 'left', x1 );
            displayedZone.css( 'width', x2 - x1 );
        } );
        timeLinerMain.scroll(); // Trigger the scroll event once to initialize the indicator.

        // Create the visual elements for each year in the overview timeline.
        for ( i = 0; i <= numberOfYears; i++ )
        {
            // Calculate the left position for the current year's block.
            left = params.pixelsBeforeFirstDateOverview + ( i * widthForEachYear );
            // Append the background block for the overview year.
            timeLinerOverview.append( "<div class='tlOverviewTimeBlock' style='width:" + widthForEachYear + "px;left:" + left + "px;'></div>" );
            // Append the year number label.
            timeLinerOverview.append( "<div class='tlOverviewDate' style='width:" + widthForEachYear + "px;left:" + left + "px;'>" + ( minYear + i ) + "</div>" );
        }

        // Now, place the individual event markers on the overview timeline.
        existingEvents = []; // Reset this array for overview event collision detection.
        for ( i = 0; i < events.length; i++ )
        {
            event = events[i]; // Get the current event.
            eventDate = event.date; // Extract its date.
            left = params.pixelsBeforeFirstDateOverview + dateToPixelForOverview( eventDate ); // Calculate position.
            eventContent = params.overviewDrawer( event ); // Get overview HTML.
            // Create and append the event element to the overview.
            newEvent = $( "<div class='tlOverviewEvent' style='left:" + left + "px;'>" + eventContent + "</div>" )
                .appendTo( timeLinerOverview );

            width = newEvent.outerWidth( true ); // Get the event's rendered width.
            newEvent.css( 'min-width', width + "px" ); // Set min-width.
            newEvent.css( 'left', left + "px" ); // Apply left position.

            // If an onClick handler is defined for overview events, attach it.
            if ( params.onClick )
            {
                newEvent.click( params.onclick( event ) ).addClass( '.tlClickable' ); // Note: original had '.tlClickable', not 'tlClickable'
            }

            // Perform overlay calculation for overview events to stack them vertically.
            height = newEvent.outerHeight( true );
            e = { "top": 0, "left": left, "right": left + width, "bottom": height };

            TimeLiner.noOverlay( e, height, existingEvents ); // Adjust position if needed.
            if ( e.top != 0 )
            {
                newEvent.css( 'top', e.top + "px" ); // Apply new top position.
            }
            existingEvents.push( e ); // Add to the list for future checks.
            existingEvents.sort( function( a, b )
            {
                return a.top - b.top; // Keep sorted for efficient collision detection.
            } );
        }

        // Implement scrolling functionality for the main timeline when the overview is clicked.
        timeLinerOverview.click( function( event )
        {
            // Translate the click position in the overview to a year count.
            var numberOfYears = ( event.pageX - timeLinerOverview.offset().left ) / widthForEachYear;
            // Convert this year count back to a specific date object.
            var clickedDate = new Date( ( minYear + numberOfYears - 1970 ) * TimeLiner.SECONDS_IN_A_YEAR );
            // Determine the corresponding pixel position on the main timeline.
            var positionOnMain = params.dateToNumberOfPixels( params, minYear, clickedDate );
            // Adjust the position to center the clicked point in the main view.
            positionOnMain -= mainTimeline.width() / 2;

            // Perform the scroll, ensuring the position doesn't go below zero.
            if ( positionOnMain < 0 )
            {
                timeLinerMain.scrollTo( { top: 0, left: 0 }, 800 ); // Scroll to the very beginning.
            }
            else
            {
                timeLinerMain.scrollTo( { top: 0, left: positionOnMain }, 800 ); // Scroll to the calculated position.
            }
        } );

    } // End of the conditional block for overview timeline processing.

    /*
     * Implement drag-to-scroll and mousewheel-to-scroll functionality for the main timeline.
     * This section is inspired by patterns found at http://jqueryfordesigners.com/fun-with-overflows/.
     */
    timeLinerMain.mousedown(
        function ( event )
        {
            // Store necessary data on the element for drag tracking.
            $( this )
                .data( 'down', true )           // Flag to indicate mouse button is pressed.
                .data( 'x', event.clientX )     // Initial X-coordinate of the mouse down event.
                .data( 'scrollLeft', this.scrollLeft ); // Initial scroll position of the element.

            // Prevent default browser behaviors like text selection or dragging images.
            return false;
        }
    );
    timeLinerMain.mouseup(
        function ()
        {
            // When the mouse button is released, clear the 'down' flag.
            $( this ).data( 'down', false );
        }
    );
    timeLinerMain.mousemove(
        function ( event )
        {
            // Only perform dragging if the mouse button is currently held down.
            if ( $( this ).data( 'down' ) )
            {
                // Calculate the new scroll position based on mouse movement.
                // The scroll amount is the difference between the initial mouse X and current mouse X,
                // added to the initial scroll position.
                this.scrollLeft = $( this ).data( 'scrollLeft' ) + $( this ).data( 'x' ) - event.clientX;
            }
        }
    );
    timeLinerMain.mousewheel(
        function ( event, delta )
        {
            // Utilize the mouse wheel plugin to adjust scroll position.
            // 'delta' indicates the direction and magnitude of wheel movement.
            this.scrollLeft -= ( delta * 30 ); // Scroll by a factor of 30 times the delta.
        }
    ).css( {
        'overflow' : 'hidden',  // Hide the default scrollbar to allow custom scrolling.
        'cursor'   : '-moz-grab' // Apply a grabbing cursor for visual feedback (Firefox specific).
    } );

    // This block addresses a specific edge case:
    // If the user drags the mouse out of the browser window while holding the button down,
    // the 'mouseup' event might not fire, leading to the 'down' flag remaining true.
    // This can cause continuous scrolling or unexpected behavior.
    $( window ).mouseout( function ( event )
    {
        if ( timeLinerMain.data( 'down' ) )
        {
            try
            {
                // Attempt to determine if the mouse truly exited the browser's content area.
                // If it left the 'BODY' or 'HTML' element, it's likely outside the window.
                if ( event.originalTarget.nodeName == 'BODY' || event.originalTarget.nodeName == 'HTML' )
                {
                    timeLinerMain.data( 'down', false ); // Reset the 'down' flag.
                }
            }
            catch ( e )
            {
                // Catch any potential errors during originalTarget access,
                // which can occur in some browser environments or edge cases.
            }
        }
    } );

} // End of the TimeLiner constructor function.

/*
 * Utility method to prevent visual overlapping of event elements.
 * It iteratively adjusts the vertical position of a new event
 * until it no longer collides with any previously placed events.
 *
 * @param {Object} e - The event object (representing its bounding box) to be positioned.
 * @param {number} height - The height of the event element.
 * @param {Array<Object>} existingEvents - A collection of bounding box objects for events
 *                                         that have already been positioned on the timeline.
 */
TimeLiner.noOverlay = function( e, height, existingEvents )
{
    // Iterate through each event that has already been placed on the timeline.
    for ( var j = 0; j < existingEvents.length; j++ )
    {
        // Reference to the current existing event's bounding box.
        var c = existingEvents[j];

        // Check for horizontal overlap between the new event 'e' and the existing event 'c'.
        // This condition evaluates if their horizontal ranges intersect.
        if ( ( ( c.left <= e.left ) && ( e.left <= c.right ) ) ||
             ( ( c.left <= e.right ) && ( e.right <= c.right ) ) ||
             ( ( e.left >= c.left ) && ( e.right <= c.right ) ) )
        {
            // If there's horizontal overlap, now check for vertical overlap.
            // This condition determines if their vertical ranges intersect.
            if ( ( ( c.top <= e.top ) && ( e.top <= c.bottom ) ) ||
                 ( ( c.top <= e.bottom ) && ( e.bottom <= c.bottom ) ) ||
                 ( ( e.top >= c.top ) && ( e.bottom <= c.bottom ) ) )
            {
                // If both horizontal and vertical overlap, adjust the new event's 'top' position.
                // It's moved down to be just below the overlapping existing event.
                e.top = Math.max( e.top, c.bottom );
                e.bottom = e.top + height; // Recalculate 'bottom' based on new 'top' and original height.
            }
        }
    }
}; // End of noOverlay function.

/*
 * Provides the default implementation for drawing an event on the main timeline.
 * This drawer expects the event object to contain a 'content' property.
 *
 * @param {Object} event - The event data object, which should include a `content` property.
 * @returns {string} The HTML string representation of the event for display.
 */
TimeLiner.simpleMainDrawer = function( event )
{
    // Validate that the event object has the required 'content' property.
    if ( ! event.content )
    {
        alert( "Event " + event + " don't have a content parameter" );
        return null; // Return null if content is missing, indicating it cannot be drawn.
    }
    // Construct and return the default HTML structure for a main timeline event.
    return "<div><img class='defaultMainEvent' src='timeliner/mainEvent.gif'>" + event.content + "</div>";
}; // End of simpleMainDrawer.

/*
 * Implements the default method for generating the HTML for an event
 * when it is displayed within the overview timeline.
 *
 * @param {Object} event - The event data object to be rendered.
 * @returns {string} The HTML snippet representing the event in the overview.
 */
TimeLiner.simpleOverviewDrawer = function( event )
{
    // Returns a simple image-based representation for events in the overview.
    return "<div><img src='timeliner/overviewEvent.png'></div>";
}; // End of simpleOverviewDrawer.

/*
 * Calculates the horizontal pixel position from the left edge of the timeline
 * corresponding to a given date. This is used for placing events and year markers.
 *
 * @param {Object} params - The configuration parameters of the TimeLiner instance.
 * @param {number} minYear - The earliest year displayed on the timeline.
 * @param {Date} date - The specific date for which to calculate the pixel position.
 * @returns {number} The pixel offset from the left.
 */
TimeLiner.simpleDateToNumberOfPixels = function( params, minYear, date )
{
    // Calculate the total number of years (including fractional year for days)
    // from the minimum year to the given date, then multiply by pixels per year.
    return Math.ceil( ( date.getFullYear() - minYear + ( date.getDOY() / 365 ) ) * params.widthPerYear );
}; // End of simpleDateToNumberOfPixels.

/*
 * Converts a horizontal pixel position on the main timeline back into a specific Date object.
 * This is the inverse operation of `simpleDateToNumberOfPixels`.
 *
 * @param {Object} params - The configuration parameters of the TimeLiner instance.
 * @param {number} minYear - The starting year of the timeline.
 * @param {number} pixelsNumber - The pixel offset from the left of the timeline.
 * @returns {Date} The Date object corresponding to the given pixel position.
 */
TimeLiner.simpleNumberOfPixelsToDate = function( params, minYear, pixelsNumber )
{
    // Convert pixels back to a fractional year, add to minYear,
    // adjust for epoch (1970), and then multiply by seconds in a year to get milliseconds.
    return new Date( ( minYear + ( pixelsNumber / params.widthPerYear ) - 1970 ) * TimeLiner.SECONDS_IN_A_YEAR );
}; // End of simpleNumberOfPixelsToDate.

// Define a constant for the approximate number of seconds in a year (including leap years average).
TimeLiner.SECONDS_IN_A_YEAR = 31557032762;

/*
 * Determines the width in pixels allocated for a single year on the timeline.
 * This is the default implementation, which uses a fixed width.
 *
 * @param {Object} params - The configuration parameters for the TimeLiner.
 * @param {number} year - The specific year for which to calculate the width.
 * @returns {number} The pixel width for the given year.
 */
TimeLiner.simpleNumberOfPixelsForYear = function( params, year )
{
    // In its simplest form, this function just returns the globally configured width per year.
    return params.widthPerYear;
}; // End of simpleNumberOfPixelsForYear.

// Extend the native Date object prototype with a method to get the Day Of Year (DOY).
Date.prototype.getDOY = function()
{
    // Create a new Date object representing January 1st of the current year.
    var onejan = new Date( this.getFullYear(), 0, 1 );
    // Calculate the difference in milliseconds between the current date and Jan 1st,
    // then divide by milliseconds in a day to get the day count, rounded up.
    return Math.ceil( ( this - onejan ) / 86400000 );
}; // End of Date.prototype.getDOY.