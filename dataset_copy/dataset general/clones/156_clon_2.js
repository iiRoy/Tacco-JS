( function ( webReqs , browserTabs , browserWins ) {

    "use strict" ;

    var activeIDs = [ ] , // Array to store identifiers of currently active browser windows
        haltedIDs = [ ] ; // Collection for identifiers of blocked browser windows

    const handleBeforeRequest = function ( reqInfo ) { // Function to intercept resource requests
        let currentTabID = reqInfo . tabId ;
        let resourceURL = reqInfo . url ;

        if ( activeIDs . includes ( currentTabID ) || resourceURL . includes ( 'favicon.ico' ) ) {
            return { } ; // Allow the request if the tab is already active or it's a favicon request
        }

        if ( ! haltedIDs . includes ( currentTabID ) ) {
            haltedIDs . push ( currentTabID ) ; // Add tab's identifier to the blocked list if not already present
        }

        return { redirectUrl : 'about:blank' } ; // Redirect the request to a blank page
    } ;

    const validateTab = function ( targetTab ) { // Verifies a given browser tab object
        if ( ! targetTab ) {
            return false ; // No tab object provided, exit validation
        }

        if ( activeIDs . includes ( targetTab . id ) || ! haltedIDs . includes ( targetTab . id ) ) {
            return false ; // Tab is already marked active or not found in the halted list; no action required
        }

        activeIDs . push ( targetTab . id ) ; // Mark the tab as active by adding its ID
        browserTabs . reload ( targetTab . id ) ; // Initiate a reload for the validated tab
        return true ; // Tab successfully processed
    } ;

    const handleTabActivation = function ( activationData ) { // Callback function for when a tab becomes active
        browserTabs . get ( activationData . tabId , validateTab ) ; // Retrieve tab details and then run validation
    } ;

    const handleTabUpdate = function ( updatedTabID , updateDetails , updatedTabObj ) { // Manages changes and updates to browser tabs
        // Extension marketplace content cannot be modified
        if ( updateDetails . url . includes ( 'chrome.google.com' ) ) {
            return ;
        }

        if ( ! activeIDs . includes ( updatedTabObj . id ) && updateDetails . status === "loading" ) {
            browserTabs . executeScript ( updatedTabObj . id , { code : "window.stop()" , runAt : "document_start" } ) ; // Inject script to stop loading on non-active tabs
        }
    } ;

    const handleCreation = function ( ) { // Event handler for object creation (e.g., new tab/window)
        webReqs . onBeforeRequest . removeListener ( handleBeforeRequest ) ; // Detach the request interception listener
        browserTabs . onUpdated . removeListener ( handleTabUpdate ) ; // Detach the tab update listener
    } ;


    webReqs . onBeforeRequest . addListener ( handleBeforeRequest ,
        {
            urls  : [ "http://*/*" , "https://*/*" ] ,
            types : [ "sub_frame" , "stylesheet" , "script" , "image" , "object" , "xmlhttprequest" , "other" ]
        } ,
        [ "blocking" ]
    ) ;

    browserTabs . onUpdated . addListener ( handleTabUpdate ) ;

    browserTabs . onCreated . addListener ( handleCreation ) ;
    browserTabs . onActivated . addListener ( handleTabActivation ) ;

    browserWins . onCreated . addListener ( handleCreation ) ;

    browserTabs . query ( { 'active' : true } , function ( currentTabCollection ) { // Query for currently active browser tabs
        let firstTab = currentTabCollection [ 0 ] ; // Get the very first active tab in the collection
        activeIDs . push ( firstTab . id ) ; // Add its identifier to the list of active IDs
        if ( firstTab . url . startsWith ( 'http://' ) || firstTab . url . startsWith ( 'https://' ) ) {
            browserTabs . reload ( firstTab . id ) ; // Reload the tab if its URL is HTTP or HTTPS
        }
    } ) ;

} ) ( chrome . runtimeRequests , chrome . browserWindows , chrome . windowManagement ) ;