/**
 * Chronograph : a utility for rendering straightforward yet visually adaptable chronological displays.
 * Julian K., 2011, under MIT license.
 * Portions adapted from http://jqueryfordesigners.com/fun-with-overflows/
 */

/**
 * Constructs a Chronograph instance based on the provided configuration object.
 *
 * Essential configuration properties:
 * happenings: An array of objects representing events. Each event object must possess a 'moment' property (a Date object)
 *             and, if utilizing the default renderer, a 'displayContent' property returning HTML for presentation.
 * masterViewSel: The jQuery selector to locate the primary timeline container.
 *
 * Optional configuration properties:
 * summaryViewSel: The jQuery selector for the overview timeline container.
 * primaryRenderer: The function responsible for generating HTML for an event on the main timeline.
 *                  It receives the event object and should return the HTML string. Refer to Chronograph.basicPrimaryRenderer.
 * summaryRenderer: The function for creating HTML for an event on the overview timeline.
 *                  It receives the event object. Refer to Chronograph.basicSummaryRenderer.
 * moveLeftArrowSel: The jQuery selector for the left navigation arrow used to scroll the primary timeline.
 * moveRightArrowSel: The selector for the right navigation arrow, facilitating scrolling of the primary timeline.
 * pixelsPerScrollClick : The number of pixels the timeline shifts upon an arrow click, defaults to 800.
 * pixelSpanPerAnnus: The pixel width allocated for a single year on the main timeline, defaults to 200.
 * onOccurrenceClick: The callback function invoked when a user clicks an event. It receives the event object.
 *                    Example: function(occurrence) { alert("You interacted with " + occurrence.title); }
 * preFirstAnnusPadding: Pixel spacing before the first year in the overview, ensuring the year's boundary is visible, defaults to 3.
 *
 * Advanced configuration properties:
 * annualPixelCalculator: A custom function to determine the pixel width for a year, overriding pixelSpanPerAnnus.
 *                        It receives the configuration object and the year.
 * itemLeadingOffset: The pixel distance from the left edge of an event's display element to its precise chronological point.
 *                    This might be half the width of an icon used to mark the exact moment.
 * timeIntervalsAndLabelsOverlap : A boolean indicating whether time block backgrounds and date labels should overlay,
 *                                  useful for specific design effects, defaults to true.
 * momentToPixelConverter: A function to compute the horizontal pixel position for a given date.
 *                         It replaces pixelSpanPerAnnus functionality. Receives config, first year, and date.
 * pixelToMomentConverter: A function to derive the date corresponding to a horizontal pixel position on the main timeline.
 *                         It replaces pixelSpanPerAnnus functionality. Receives config, first year, and pixel count.
 */
function Chronograph( configObj ) {
    if ( ! configObj.happenings ) {
        alert( "No 'happenings' array in the configuration!" );
        return;
    }

    var happenings = configObj.happenings;

    if ( ! configObj.masterViewSel ) {
        alert( "No 'masterViewSel' specified in the configuration!" );
        return;
    }

    // Acquire the primary timeline container element
    var masterDisplay = $( configObj.masterViewSel );
    if ( masterDisplay.length === 0 ) {
        alert( "Primary timeline selector \"" + configObj.masterViewSel + "\" found no elements." );
        return;
    }

    var summaryDisplay = null;
    if ( configObj.summaryViewSel ) {
        // Retrieve the overview timeline container
        summaryDisplay = $( configObj.summaryViewSel );
        if ( summaryDisplay.length === 0 ) {
            alert( "Overview timeline selector \"" + configObj.summaryViewSel + "\" yielded no elements." );
            return;
        }
    }

    var baseConfigs = {
        "primaryRenderer": Chronograph.basicPrimaryRenderer,
        "itemLeadingOffset": 2,
        "pixelSpanPerAnnus": 200,
        "momentToPixelConverter": Chronograph.basicDateToPixels,
        "pixelToMomentConverter": Chronograph.basicPixelsToDate,
        "annualPixelCalculator": Chronograph.basicAnnualPixelCount,
        "summaryRenderer": Chronograph.basicSummaryRenderer,
        "preFirstAnnusPadding": 3,
        "timeIntervalsAndLabelsOverlap": true,
        "pixelsPerScrollClick": 800
    };

    // Combine default and user-provided configuration
    var activeConfigs = $.extend( {}, baseConfigs, configObj );

    // Validate that all happenings possess a valid date
    $.each( happenings, function( entryIdx, occurrence ) {
        if ( ! occurrence.moment ) {
            alert( "Occurrence \"" + occurrence + "\" lacks a 'moment' property." );
        }
    });

    var displayArea = $( "<div class='chronoMain' style='height:" + masterDisplay.height() + "px;'></div>" ).appendTo( masterDisplay );
    var startAnnus = happenings[0].moment.getFullYear();
    var endAnnus = happenings[happenings.length - 1].moment.getFullYear();

    // Construct the graphical divisions for each year
    var xPosition = 0;
    for ( var yearIdx = 0; yearIdx <= ( endAnnus - startAnnus ) + 1; yearIdx++ ) {
        // Calculate the width for the current year
        var annualWidth = activeConfigs.annualPixelCalculator( activeConfigs, yearIdx + startAnnus );

        var annusElement = $( "<div class='chronoMainDate' style='width:" + annualWidth + "px;left:" + xPosition + "px;'>" + ( startAnnus + yearIdx ) + "</div>" ).appendTo( displayArea );
        var blockDimension = masterDisplay.height() - ( activeConfigs.timeIntervalsAndLabelsOverlap ? 0 : annusElement.outerHeight( true ) );
        // Background time interval block
        displayArea.append( "<div class='chronoMainTimeBlock' style='width:" + annualWidth + "px;left:" + xPosition + "px;height:" + blockDimension + "px;'></div>" );

        xPosition += annualWidth;
    }

    // Render the individual happenings
    var placedItems = [];
    for ( yearIdx = 0; yearIdx < happenings.length; yearIdx++ ) {
        var occurrence = happenings[yearIdx];
        var hPos = activeConfigs.momentToPixelConverter( activeConfigs, startAnnus, occurrence.moment ) - activeConfigs.itemLeadingOffset;

        var occurrenceHtml = activeConfigs.primaryRenderer( occurrence );
        var newOccasionElement = $( "<div class='chronoMainEvent'>" + occurrenceHtml + "</div>" ).appendTo( displayArea );
        var itemDimension = ( newOccasionElement.outerWidth( true ) + 10 );
        newOccasionElement.css( 'min-width', itemDimension + "px" );
        newOccasionElement.css( 'left', hPos + "px" );
        if ( activeConfigs.onOccurrenceClick ) {
            newOccasionElement.click( { "item": occurrence, "handler": activeConfigs.onOccurrenceClick },
                                      function( clickData ) {
                                          clickData.data.handler( clickData.data.item );
                                      }
            ).addClass( 'chronoClickable' );
        }

        // Determine vertical placement to avoid overlaps
        var boxHeight = newOccasionElement.outerHeight( true );
        var occasionBox = { "top": 0, "left": hPos, "right": hPos + itemDimension, "bottom": boxHeight };

        Chronograph.resolveOverlap( occasionBox, boxHeight, placedItems );
        if ( occasionBox.top !== 0 ) {
            newOccasionElement.css( 'top', occasionBox.top + "px" );
        }
        placedItems.push( occasionBox );
        placedItems.sort( function( a, b ) {
            return a.top - b.top;
        });
    }

    if ( activeConfigs.moveLeftArrowSel ) {
        $( activeConfigs.moveLeftArrowSel ).click(
            function() {
                displayArea.scrollTo( { top: 0, left: '-=' + activeConfigs.pixelsPerScrollClick + 'px' }, 800 );
            }).addClass( 'chronoClickable' );
    }
    if ( activeConfigs.moveRightArrowSel ) {
        $( activeConfigs.moveRightArrowSel ).click(
            function() {
                displayArea.scrollTo( { top: 0, left: '+=' + activeConfigs.pixelsPerScrollClick + 'px' }, 800 );
            }).addClass( 'chronoClickable' );
    }

    // Render the summary overview
    if ( summaryDisplay ) {

        var summaryCanvas = $( "<div class='chronoOverview chronoClickable' style='height:" + summaryDisplay.height() + "px;'></div>" ).appendTo( summaryDisplay );

        // Calculate the width for each year in the overview
        var yearSpan = ( 1 + endAnnus - startAnnus );
        var perYearPix = Math.ceil( ( summaryDisplay.outerWidth( true ) - ( 15 + activeConfigs.preFirstAnnusPadding ) ) / yearSpan );
        // Extend year count if needed to fill the display
        if ( ( perYearPix * yearSpan ) < summaryDisplay.outerWidth( true ) ) {
            yearSpan++;
        }

        var getSummaryPos = function( currentMoment ) {
            return Math.ceil( ( currentMoment.getFullYear() - startAnnus + ( currentMoment.retrieveDayInYear() / 365 ) ) * perYearPix );
        };

        var viewportMarker = $( "<div class='chronoDisplayedZone'></div>" ).appendTo( summaryCanvas );
        displayArea.scroll( function() {
            var momentA = activeConfigs.pixelToMomentConverter( activeConfigs, startAnnus, displayArea.scrollLeft() );
            var hPosA = getSummaryPos( momentA );
            var momentB = activeConfigs.pixelToMomentConverter( activeConfigs, startAnnus, displayArea.scrollLeft() + masterDisplay.width() );
            var hPosB = getSummaryPos( momentB );
            viewportMarker.css( 'left', hPosA );
            viewportMarker.css( 'width', hPosB - hPosA );
        });
        displayArea.scroll();

        // Create divisions for each year in the overview
        for ( yearIdx = 0; yearIdx <= yearSpan; yearIdx++ ) {
            // Background time block
            hPos = activeConfigs.preFirstAnnusPadding + ( yearIdx * perYearPix );
            summaryCanvas.append( "<div class='chronoOverviewTimeBlock' style='width:" + perYearPix + "px;left:" + hPos + "px;'></div>" );
            // The year numerical label
            summaryCanvas.append( "<div class='chronoOverviewDate' style='width:" + perYearPix + "px;left:" + hPos + "px;'>" + ( startAnnus + yearIdx ) + "</div>" );
        }

        // Render events in the summary view
        placedItems = [];
        for ( yearIdx = 0; yearIdx < happenings.length; yearIdx++ ) {
            occurrence = happenings[yearIdx];
            var itemDate = occurrence.moment;
            hPos = activeConfigs.preFirstAnnusPadding + getSummaryPos( itemDate );
            occurrenceHtml = activeConfigs.summaryRenderer( occurrence );
            newOccasionElement = $( "<div class='chronoOverviewEvent' style='left:" + hPos + "px;'>" + occurrenceHtml + "</div>" ).appendTo( summaryCanvas );

            itemDimension = newOccasionElement.outerWidth( true );
            newOccasionElement.css( 'min-width', itemDimension + "px" );
            newOccasionElement.css( 'left', hPos + "px" );
            if ( activeConfigs.onOccurrenceClick ) {
                newOccasionElement.click( activeConfigs.onOccurrenceClick( occurrence ) ).addClass( '.chronoClickable' );
            }

            // Calculate vertical position for summary events, avoiding overlaps
            boxHeight = newOccasionElement.outerHeight( true );
            occasionBox = { "top": 0, "left": hPos, "right": hPos + itemDimension, "bottom": boxHeight };

            Chronograph.resolveOverlap( occasionBox, boxHeight, placedItems );
            if ( occasionBox.top !== 0 ) {
                newOccasionElement.css( 'top', occasionBox.top + "px" );
            }
            placedItems.push( occasionBox );
            placedItems.sort( function( a, b ) {
                return a.top - b.top;
            });
        }

        // Implement scrolling behavior when clicking on the overview
        summaryCanvas.click( function( clickEvt ) {
            // Determine the position in the main timeline's coordinate system
            var annualRatio = ( clickEvt.pageX - summaryCanvas.offset().left ) / perYearPix;
            var clickedMoment = new Date( ( startAnnus + annualRatio - 1970 ) * Chronograph.ANNUAL_SECONDS_VALUE );
            var targetHPos = activeConfigs.momentToPixelConverter( activeConfigs, startAnnus, clickedMoment );
            // Center the clicked point on the display
            targetHPos -= masterDisplay.width() / 2;

            if ( targetHPos < 0 ) {
                displayArea.scrollTo( { top: 0, left: 0 }, 800 );
            } else {
                displayArea.scrollTo( { top: 0, left: targetHPos }, 800 );
            }
        });

    }

    // Implement draggable scrolling behavior, adapted from http://jqueryfordesigners.com/fun-with-overflows/
    displayArea.mousedown(
        function ( mouseEvt ) {
            // Store essential data on the displayArea element
            $( this )
                .data( 'isPressed', true ) // Flag indicating mouse button is down
                .data( 'startX', mouseEvt.clientX ) // X-coordinate at mouse down
                .data( 'initialScrollLeft', this.scrollLeft ); // Initial scroll position

            // Prevent text selection and link dragging during scroll
            return false;
        });
    displayArea.mouseup(
        function () {
            // On mouse up, clear the 'isPressed' flag
            $( this ).data( 'isPressed', false );
        });
    displayArea.mousemove(
        function ( mouseEvt ) {
            // If mouse button is held down, initiate drag scrolling
            if ( $( this ).data( 'isPressed' ) ) {
                // The new scroll position is calculated based on initial scroll,
                // and the difference between initial and current mouse X.
                this.scrollLeft = $( this ).data( 'initialScrollLeft' ) + $( this ).data( 'startX' ) - mouseEvt.clientX;
            }
        });
    displayArea.mousewheel(
        function ( mouseEvt, scrollDelta ) {
            // Utilize the mouse wheel plugin to scroll by the 'scrollDelta'
            // (wheel movement), multiplied by an arbitrary factor for speed.
            this.scrollLeft -= ( scrollDelta * 30 );
        }).css( {
        'overflow' : 'hidden', // Hide default scrollbars for JS-controlled scrolling
        'cursor' : '-moz-grab' // Apply a grabbing cursor style
    });

// Crucially, manage scenarios where the mouse leaves the browser window
// without triggering a mouseup, which could disrupt tracking.
    $( window ).mouseout( function ( mouseEvt ) {
        if ( displayArea.data( 'isPressed' ) ) {
            try {
                // Attempt to identify the element the mouse exited from.
                // If it's the BODY or HTML, assume window exit and reset the pressed flag.
                if ( mouseEvt.originalTarget.nodeName === 'BODY' || mouseEvt.originalTarget.nodeName === 'HTML' ) {
                    displayArea.data( 'isPressed', false );
                }
            } catch ( err ) {
                // Ignore potential errors during event target inspection
            }
        }
    });

}

/**
 * Adjusts an event's vertical position downwards until it no longer overlaps with existing events.
 * @param occasionBox The bounding box of the event to position.
 * @param boxHeight The height of the event's bounding box.
 * @param placedItems An array of bounding boxes for events already positioned.
 */
Chronograph.resolveOverlap = function( occasionBox, boxHeight, placedItems ) {
    for ( var itemIdx = 0; itemIdx < placedItems.length; itemIdx++ ) {
        // Current placed event's bounding box
        var currentItemBox = placedItems[itemIdx];
        if ( ( ( currentItemBox.left <= occasionBox.left ) && ( occasionBox.left <= currentItemBox.right ) ) ||
             ( ( currentItemBox.left <= occasionBox.right ) && ( occasionBox.right <= currentItemBox.right ) ) ||
             ( ( occasionBox.left >= currentItemBox.left ) && ( occasionBox.right <= currentItemBox.right ) ) ) { // Horizontal overlap
            if ( ( ( currentItemBox.top <= occasionBox.top ) && ( occasionBox.top <= currentItemBox.bottom ) ) ||
                 ( ( currentItemBox.top <= occasionBox.bottom ) && ( occasionBox.bottom <= currentItemBox.bottom ) ) ||
                 ( ( occasionBox.top >= currentItemBox.top ) && ( occasionBox.bottom <= currentItemBox.bottom ) ) ) { // Vertical overlap
                occasionBox.top = Math.max( occasionBox.top, currentItemBox.bottom );
                occasionBox.bottom = occasionBox.top + boxHeight;
            }
        }
    }
};

/**
 * The default renderer for the primary timeline. Requires events to have a 'displayContent' property.
 * @param occurrence The event object to render.
 * @return The HTML string representing the event.
 */
Chronograph.basicPrimaryRenderer = function( occurrence ) {
    if ( ! occurrence.displayContent ) {
        alert( "Event " + occurrence + " lacks a 'displayContent' parameter." );
        return null;
    }
    return "<div><img class='defaultMainEvent' src='timeliner/mainEvent.gif'>" + occurrence.displayContent + "</div>";
};

/**
 * The default renderer for the overview timeline.
 * @param occurrence The event object to render.
 * @return The HTML string representing the event.
 */
Chronograph.basicSummaryRenderer = function( occurrence ) {
    return "<div><img src='timeliner/overviewEvent.png'></div>";
};

/**
 * Calculates the horizontal pixel position from the left for a given date.
 * @param activeConfigs The configuration object for the timeline.
 * @param startAnnus The first year displayed.
 * @param currentMoment The date object.
 */
Chronograph.basicDateToPixels = function( activeConfigs, startAnnus, currentMoment ) {
    return Math.ceil( ( currentMoment.getFullYear() - startAnnus + ( currentMoment.retrieveDayInYear() / 365 ) ) * activeConfigs.pixelSpanPerAnnus );
};

/**
 * Determines the date corresponding to a given number of pixels from the left.
 * @param activeConfigs The configuration object for the timeline.
 * @param startAnnus The first year displayed.
 * @param pixelAmount The number of pixels from the left.
 */
Chronograph.basicPixelsToDate = function( activeConfigs, startAnnus, pixelAmount ) {
    return new Date( ( startAnnus + ( pixelAmount / activeConfigs.pixelSpanPerAnnus ) - 1970 ) * Chronograph.ANNUAL_SECONDS_VALUE );
};

Chronograph.ANNUAL_SECONDS_VALUE = 31557032762;

/**
 * Calculates the number of pixels allocated for a specific year.
 * @param activeConfigs The configuration object for the timeline.
 * @param currentAnnus The year.
 * @return The pixel width for that year.
 */
Chronograph.basicAnnualPixelCount = function( activeConfigs, currentAnnus ) {
    return activeConfigs.pixelSpanPerAnnus;
};

/**
 * Extends the Date prototype to get the day of the year (1-366).
 * @return The day number within the year.
 */
Date.prototype.retrieveDayInYear = function() {
    var firstJan = new Date( this.getFullYear(), 0, 1 );
    return Math.ceil( ( this - firstJan ) / 86400000 );
};