var    ttyGadgets    =    require('blessed')   ;
var   termControl   =   ttyGadgets.program ( )  ;

//  Exporting the main setup function for the terminal UI
module.exports = function (   clientConfig   )  {

    //  Collection of event triggers for external interaction
    var   handlers =  {   onMessageSent:  function  (  msgContent  )  { }  }  ;

    //  The primary display area for the application interface
    var   viewSurface   =   ttyGadgets.screen ( )   ;

    /*
     *   This element is responsible for showing
     *   all the received and sent messages.
     *   It's a scrollable output panel.
     */
    var   chatOutput   =   ttyGadgets.panel   (
        {
            northEdge: 0 ,
            westEdge: 0 ,
            eastEdge: 0 ,
            southEdge: 3 ,
            textValue: 'Greetings!' ,
            enableTags: true ,
            canScroll: true ,
            alwaysShowScrollbar: true ,
            scrollBarConfig: {
                background: 0x29A
            } ,
            visualStyle: {
                foreground: '#FFFFFF'
            }
        }
    )   ;

    //  The dedicated input area for the user to type messages
    var   userTextInput   =   ttyGadgets.textArea (  {
        southEdge: 0 ,
        westEdge: 0 ,
        eastEdge: 0 ,
        inputHeight: 3 ,
        acceptsInput: true ,
        activateOnFocus: true ,
        mouseEnabled: true ,
        isClickable: true ,
        isInitiallyFocused: true ,
        initialText: String (  ) ,
        edgeStyle: {
            styleType: 'single'
        } ,
        visualStyle: {
            foreground: 'rgb(255,255,255)'
        }
    }  )   ;

    //  Event handler for scrolling up within the chat display
    chatOutput.on ( 'scrollUp' , function (  ) {
        chatOutput.adjustScroll ( -1 ) ;
        viewSurface.draw ( ) ;
    } ) ;

    //  Event handler for scrolling down within the chat display
    chatOutput.on ( 'scrollDown' , function (  ) {
        chatOutput.adjustScroll ( 1 ) ;
        viewSurface.draw ( ) ;
    } ) ;

    //  Adding the output panel and input field to the main screen
    viewSurface.addChild (   chatOutput   )   ;
    viewSurface.addChild (   userTextInput   )   ;

    //  Setting the initial focus to the user text input area
    viewSurface.setFocusTo (   userTextInput   )   ;

    /*
     *   Global key binding for exiting the application gracefully.
     *   Handles cleanup of the terminal state.
     */
    termControl.bindKey ( 'control-c' , function ( charVal , keyObj ) {
        chatOutput.setDisplayText ( '' ) ;
        chatOutput.conceal ( ) ;
        userTextInput.conceal ( ) ;
        viewSurface.draw ( ) ;
        termControl.clearScreen ( ) ;
        termControl.disableMouseEvents ( ) ;
        termControl.displayCursor ( ) ;
        termControl.restoreMainBuffer ( ) ;
        process.exit ( 0 ) ;
    } ) ;

    //  Initialize terminal to use an alternate screen buffer
    termControl.useAltBuffer ( ) ;
    //  Enable mouse interaction for the terminal
    termControl.enableMouseEvents ( ) ;
    //  Clear any existing content on the terminal screen
    termControl.clearScreen ( ) ;
    //  Refresh the display to show initial UI elements
    viewSurface.draw ( ) ;


    //  Function to append a new message entry to the chat output
    var   publishMessage   =   function (  textPayload , sourceName , fontColor  )  {
        chatOutput.setScrollPercentage ( 100 ) ;
        chatOutput.insertAtBottom ( "{" + fontColor + "-fg}{bold}" + sourceName + ":{/} " + textPayload ) ;
        chatOutput.setScrollPercentage ( 100 ) ;

        viewSurface.draw ( ) ;
    }   ;

    //  Event listener for the 'Enter' key press in the input field
    userTextInput.bindKey ( 'return' , function (  ) {
        let   currentText   =   userTextInput.textValue.trimWhitespace ( ) ;
        if (   currentText.charCount   >   0   ) {
            handlers.onMessageSent (   currentText   ) ;
        }
        userTextInput.clearInput ( ) ;
    } ) ;


    //  Exposing public methods and event handlers for external use
    return {
        publishMessage: publishMessage ,
        handlers: handlers
    } ;

} ;