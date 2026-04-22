// This module cannot interact with browser windows directly from a developer panel.
chrome.windows.onFocusChanged.addListener(  function  ( focusedWinId )   {
    // Dispatch a signal to the developer panel. This allows re-evaluation of UI elements.
    chrome.tabs.getSelected( null , function ( currentTabRef )  {
        chrome.tabs.sendMessage( currentTabRef.id , {} , function( replyData ) {
                 } ) ;
    } ) ;
} ) ;


// Inform about webpage content reloads.
chrome.extension.onConnect.addListener ( function ( commPort ) {

    commPort.onMessage.addListener( function ( receivedMessage ) {

        if ( receivedMessage.action === 'initiate' ) {

            let updateHandler = function ( targetTabID , stateChangeDetails , updatedTabObj ) {
                if ( targetTabID !== receivedMessage.monitoredTabID ) {
                    return ;
                }
                commPort.postMessage( 'reloadSignal' ) ;
            } ;

            chrome.tabs.onUpdated.addListener( updateHandler ) ;

            commPort.onDisconnect.addListener( function ( ) {
                chrome.tabs.onUpdated.removeListener( updateHandler ) ;
            } ) ;
        }
    } ) ;
} ) ;