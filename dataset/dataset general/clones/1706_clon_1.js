/*
 * showdown-gui.js
 *
 * This file contains a sample application, demonstrating the use
 * of Showdown, a JavaScript implementation of Markdown.
 *
 * (c) 2007 John Fraser. All rights reserved.
 *
 * Licensed under a BSD-style open source license.
 * Refer to license.txt for complete license details.
 *
 * For the full source distribution, please visit:
 *
 *           . . . . . . . . . . . . . .
 *           .   A T T A C K L A B   .
 *           . . . . . . . . . . . . . .
 *
 *   You can find us at <http://www.attacklab.net/>
 *
 */

/*
 *
 * The core Showdown converter logic resides in 'showdown.js'.
 * This file must be loaded prior to 'showdown-gui.js' in the HTML document.
 *
 * 'showdown-gui.js' relies on specific HTML element IDs and class definitions
 * as found in 'showdown.html'. While not dependent on CSS for layout,
 * it directly manipulates the visibility, display, and dimensions of
 * various panes, effectively overriding any stylesheet rules.
 *
 * This demonstration application interacts with 'showdown.js' at only
 * two critical points:
 *
 *  1. Within the `startGui()` function:
 *
 *      The converter instance is created: `converter = new Showdown.converter();`
 *
 *  2. Inside the `convertText()` function:
 *
 *      Text conversion is performed: `text = converter.makeHtml(text);`
 *
 * All other code in this file is dedicated to user interface management.
 *
 */

//  Register the initialization function to run when the page loads.
window . onload = startGui ;

//  Global variables used throughout the application.
var converter ;
var convertTextTimer ;
var processingTime ;
var lastText ;
var lastOutput ;
var lastRoomLeft ;
var convertTextSetting ;
var convertTextButton ;
var inputPane ;
var previewPane ;
var maxDelay = 3000 ; //  Maximum allowed update pause in milliseconds.

//  ----------------------------------------------------------------------
//  Initialization Routines
//  ----------------------------------------------------------------------

function startGui ( ) {

    //  Locate and reference essential DOM elements.
    convertTextSetting = document . getElementById ( "convertTextSetting" ) ;
    convertTextButton  = document . getElementById ( "convertTextButton"  ) ;

    inputPane          = document . getElementById ( "body"         ) ;
    previewPane        = document . getElementById ( "previewPane"    ) ;

    //  Set up event handlers for user interactions.
    convertTextSetting . onchange = onConvertTextSettingChanged ;
    convertTextButton  . onclick  = onConvertTextButtonClicked  ;
    window             . onresize = setPaneHeights              ;

    //  Attempt to register for keyup events first.
    //  Calling onInput() repeatedly is generally harmless.
    window . onkeyup = inputPane . onkeyup = onInput ;

    //  As a fallback, in case paste events aren't captured directly,
    //  poll for changes in the input pane's value every second.
    var pollingFallback = window . setInterval ( function ( ) {
        if ( inputPane . value != lastText )
            onInput ( ) ;
    } , 1000 ) ;

    //  Try to register for paste events.
    inputPane . onpaste = function ( ) {
        //  If a paste event fires, it means our handler worked.
        //  We can now cancel the polling fallback.
        if ( pollingFallback != undefined ) {
            window . clearInterval ( pollingFallback ) ;
            pollingFallback = undefined ;
        }
        onInput ( ) ;
    }

    //  Attempt to register for input events (this is the preferred solution).
    if ( inputPane . addEventListener ) {
        //  Assume that 'input' events also fire on paste actions.
        //  No need to cancel existing keyup handlers; their overhead is minimal.
        inputPane . addEventListener ( "input" , inputPane . onpaste , false ) ;
    }

    //  Periodically check for font size changes to adjust pane heights.
    //  This operation is inexpensive and can be done frequently.
    window . setInterval ( setPaneHeights , 250 ) ;

    //  Check if the URL indicates a blank page should be loaded.
    if ( top . document . location . href . match ( / \? blank = 1 $ / ) )
        inputPane . value = "" ;

    //  Instantiate the Showdown converter.
    converter = new Showdown . converter ( ) ;

    //  Perform an initial conversion to prevent any visual delay on load.
    convertText ( ) ;

    //  Give focus to the input pane, ready for user typing.
    inputPane . focus ( ) ;

    //  Ensure other panes are scrolled to the top initially.
    //  (Our smart scrolling might have moved them to the bottom previously).
    previewPane . scrollTop = 0 ;
}

//  ----------------------------------------------------------------------
//  Text Conversion Logic
//  ----------------------------------------------------------------------

function convertText ( ) {

    //  Retrieve the current text from the input pane.
    var text = inputPane . value ;

    //  If the input text hasn't changed, there's no need to reconvert.
    if ( text && text == lastText ) {
        return ;
    } else {
        //  Update lastText to the current content for future comparisons.
        lastText = text ;
    }

    //  Record the start time to measure conversion duration.
    var startTime = new Date ( ) . getTime ( ) ;

    //  Execute the actual Markdown to HTML conversion.
    text = converter . makeHtml ( text ) ;

    //  Calculate and display the processing time.
    var endTime = new Date ( ) . getTime ( ) ;
    processingTime = endTime - startTime ;
    document . getElementById ( "processingTime" ) . innerHTML = processingTime + " ms" ;

    //  Save the current proportional scroll positions before updating content.
    saveScrollPositions ( ) ;

    //  Update the content of the preview pane with the converted HTML.
    previewPane . innerHTML = text ;
    lastOutput = text ;

    //  Restore the proportional scroll positions to maintain user context.
    restoreScrollPositions ( ) ;
}

//  ----------------------------------------------------------------------
//  Event Handler Functions
//  ----------------------------------------------------------------------

function onConvertTextSettingChanged ( ) {
    //  If the user has just enabled automatic updates (e.g., "delayed" or "every keystroke"),
    //  trigger an immediate conversion to reflect the new setting.
    onInput ( ) ;
}

function onConvertTextButtonClicked ( ) {
    //  Hack: force the converter to run by clearing the lastText value,
    //  ensuring the `if (text && text == lastText)` check in `convertText` fails.
    lastText = "" ;

    convertText ( ) ;   // Perform the conversion.
    inputPane . focus ( ) ; // Return focus to the input area.
}

function onInput ( ) {
    //  In "delayed" update mode, conversions occur during pauses in typing.
    //  The length of the pause is dynamically adjusted based on the previous
    //  conversion time, allowing slower updates for complex documents.
    //
    //  A timer is used to schedule updates. Each new keystroke resets this timer.

    //  If a conversion is already scheduled, cancel it.
    if ( convertTextTimer ) {
        window . clearTimeout ( convertTextTimer ) ;
        convertTextTimer = undefined ;
    }

    //  Proceed only if automatic conversion is enabled (not "manual").
    if ( convertTextSetting . value != "manual" ) {
        var timeUntilConvertText = 0 ;
        if ( convertTextSetting . value == "delayed" ) {
            //  Make the timer adaptive; longer processing means longer delay.
            timeUntilConvertText = processingTime ;
        }

        //  Cap the maximum delay to prevent excessively long waits.
        if ( timeUntilConvertText > maxDelay )
            timeUntilConvertText = maxDelay ;

        //  Schedule the `convertText()` function.
        //  Even for "every keystroke" mode, a 0ms timer yields to the browser's event loop,
        //  allowing it to process other events and maintain responsiveness.
        convertTextTimer = window . setTimeout ( convertText , timeUntilConvertText ) ;
    }
}

//  ----------------------------------------------------------------------
//  Smart Scrollbar Adjustment Logic
//  ----------------------------------------------------------------------
//
//  This section ensures that users don't accidentally scroll past the
//  end of the preview or output panes when content changes. It achieves this
//  by storing the proportional scroll position (e.g., 50% down the page)
//  before an update and restoring it afterwards.
//

var previewScrollPos ;
var outputScrollPos ; // This variable is declared but not used in the provided code.

function getScrollPos ( element ) {
    //  Prioritize showing the bottom of the content if it's small enough
    //  to fit entirely within the window (i.e., no scrolling needed).
    if ( element . scrollHeight <= element . clientHeight )
        return 1.0 ; //  Represents the bottom.
    //  Otherwise, calculate the proportional scroll position.
    return element . scrollTop / ( element . scrollHeight - element . clientHeight ) ;
}

function setScrollPos ( element , pos ) {
    //  Set the scroll position based on a given proportion.
    element . scrollTop = ( element . scrollHeight - element . clientHeight ) * pos ;
}

function saveScrollPositions ( ) {
    //  Capture the current scroll position of the preview pane.
    previewScrollPos = getScrollPos ( previewPane ) ;
}

function restoreScrollPositions ( ) {
    //  Workaround for Internet Explorer:
    //  Setting `scrollTop` explicitly forces the browser to re-evaluate
    //  `scrollHeight` after the content has changed.
    previewPane . scrollTop = previewPane . scrollTop ;

    //  Apply the previously saved proportional scroll position to the preview pane.
    setScrollPos ( previewPane , previewScrollPos ) ;
}

//  ----------------------------------------------------------------------
//  Textarea Resizing Utilities
//  ----------------------------------------------------------------------
//
//  Some browsers (notably older versions of IE) fail to correctly
//  apply percentage heights to textareas when in standards mode.
//  (However, other units and percentage widths work fine).
//
//  Therefore, we resort to JavaScript for dynamic resizing.
//  If browser behavior changes in the future, it would be more
//  efficient and smoother to handle textarea heights via CSS.
//

function getTop ( element ) {
    var sum = element . offsetTop ;
    while ( element = element . offsetParent )
        sum += element . offsetTop ;
    return sum ;
}

function getElementHeight ( element ) {
    var height = element . clientHeight ;
    if ( ! height ) height = element . scrollHeight ; // Fallback if clientHeight is 0.
    return height ;
}

function getWindowHeight ( element ) {
    if ( window . innerHeight )
        return window . innerHeight ;
    else if ( document . documentElement && document . documentElement . clientHeight )
        return document . documentElement . clientHeight ;
    else if ( document . body )
        return document . body . clientHeight ;
}

function setPaneHeights ( ) {
    var textarea = inputPane ; // The input pane is conceptually a textarea for resizing purposes.
    var footer = document . getElementById ( "footer" ) ;

    var windowHeight = getWindowHeight ( ) ;
    var footerHeight = getElementHeight ( footer ) ;
    var textareaTop = getTop ( textarea ) ;

    //  Calculate the available vertical space for the panes.
    var roomLeft = windowHeight - footerHeight - textareaTop ;

    //  Ensure the room calculation doesn't result in a negative value.
    if ( roomLeft < 0 ) roomLeft = 0 ;

    //  If the available room hasn't changed since the last check, exit early.
    if ( roomLeft == lastRoomLeft ) {
        return ;
    }
    lastRoomLeft = roomLeft ; // Update the stored room value.

    //  Resize all relevant panes. (The original code commented these out,
    //  so we'll keep them commented to preserve exact functional equivalence).
    // inputPane . style . height = roomLeft + "px" ;
    // previewPane . style . height = roomLeft + "px" ;
}