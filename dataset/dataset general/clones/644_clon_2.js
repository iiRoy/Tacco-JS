; ( function ( jq , globalObj , htmlDoc , undefValue ) {

  /*
   *  Configuration constants for managing navigation history and targets.
   *  These define the keys used in local storage and the maximum history size.
   */
  const JOURNAL_ID = 'Pathfinder.trail';
  const DESTINATION_ID = 'Pathfinder.goal';
  const JOURNAL_CAPACITY = 7; // Slightly different length

  /*
   *  Constructor function for the Pathfinder utility.
   *  Initializes internal state variables.
   */
  function Pathfinder ( ) {
    this._omit = undefValue ; // Elements to bypass click handling
    this._verbose = false ; // Verbose logging enabled/disabled
  }

  Pathfinder . prototype = {

    /*
     *  Resumes navigation based on stored state or current URL.
     *  This is the primary entry point for handling page loads.
     */
    continueJourney : function ( completionCallback ) {
      let currentJournal = this.travelLog ( ) ;
      const designatedStop = this.finalStop ( ) ;
      const mostRecentEntry = this.mostRecent ( ) ;
      const currentUrlPath = this.currentPath ( ) ;

      // Check if the user was directed to a specific link target.
      if ( designatedStop ) {

        // Clear the target to prevent recursive redirects.
        this.finalStop ( undefValue ) ;

        // If the intended target doesn't match the current URL, perform a reroute.
        if ( designatedStop !== currentUrlPath ) {
          if ( this._verbose ) console . log ( 'Pathfinder.continueJourney(): Mismatched destination -- designatedStop (' + designatedStop + ') does not align with currentUrlPath (' + currentUrlPath + '), initiating reroute...' ) ;
          this.reroute ( ) ;
          return this ;
        }

        if ( this._verbose ) console . log ( 'Pathfinder.continueJourney(): Correct destination reached -- arrived at designatedStop(' + designatedStop + '), adding to travel log...' ) ;
        this.markLocation ( ) ;
      }

      // If the current path is not the most recent one in history and no target was set, it's an unexpected path.
      else if ( mostRecentEntry && currentUrlPath !== mostRecentEntry ) {
        if ( this._verbose ) console . log ( 'Pathfinder.continueJourney(): Unexpected path -- currentUrlPath(' + currentUrlPath + ') does not match mostRecentEntry (' + mostRecentEntry + '), initiating reroute...' ) ;
        this.reroute ( ) ;
        if ( compareRootPaths ( mostRecentEntry , currentUrlPath ) && completionCallback ) completionCallback ( ) ;
        return this ;
      }

      // Execute the callback if we are staying on the current page or a successful navigation occurred.
      if ( this._verbose ) console . log ( 'Pathfinder.continueJourney(): Journey continues -- arrived at currentUrlPath(' + currentUrlPath + '), executing callback...' ) ;
      if ( completionCallback ) completionCallback ( ) ;
      return this ;
    } ,

    // --- State Manipulation Functions ---

    /*
     *  Enables or disables verbose logging.
     *  Returns current debug status if no argument is provided.
     */
    verbose : function ( verbosityStatus ) {
      if ( arguments . length === 0 ) return this._verbose ;
      this._verbose = verbosityStatus ;
      return this ;
    } ,

    /*
     *  Completely clears all stored navigation data from local storage.
     */
    eraseData : function ( ) {
      localStorage . removeItem ( JOURNAL_ID ) ;
      localStorage . removeItem ( DESTINATION_ID ) ;
      return this ;
    } ,

    /*
     *  Adds the current page's URL to the navigation history.
     */
    markLocation : function ( ) {
      const currentUrlPath = this.currentPath ( ) ;
      if ( this._verbose ) console . log ( 'Pathfinder.markLocation(): Recording current path:' , currentUrlPath ) ;
      this.addEntry ( currentUrlPath ) ;
      return this ;
    } ,

    /*
     *  Adds a given URL to the navigation history, managing its size.
     */
    addEntry : function ( urlToRecord ) {
      let currentJournal = this.travelLog ( ) ;
      currentJournal . push ( urlToRecord ) ;
      if ( currentJournal . length > JOURNAL_CAPACITY ) currentJournal . shift ( ) ;
      this.travelLog ( currentJournal ) ;
      return this ;
    } ,

    /*
     *  Manages the navigation history (travel log) in local storage.
     *  Retrieves it if no value is provided, sets it otherwise.
     */
    travelLog : function ( inputLogArray ) {
      if ( arguments . length === 0 ) {
        const storedEntry = localStorage . getItem ( JOURNAL_ID ) ;
        return JSON . parse ( storedEntry ) || [ ] ;
      }
      if ( inputLogArray ) {
        localStorage . setItem ( JOURNAL_ID , JSON . stringify ( inputLogArray ) ) ;
        return this ;
      }
      localStorage . removeItem ( JOURNAL_ID ) ;
      return this ;
    } ,

    /*
     *  Manages the designated navigation target in local storage.
     *  Retrieves it if no value is provided, sets it otherwise.
     */
    finalStop : function ( inputTargetUrl ) {
      if ( arguments . length === 0 ) {
        const storedEntry = localStorage . getItem ( DESTINATION_ID ) ;
        return JSON . parse ( storedEntry ) ;
      }
      if ( inputTargetUrl ) {
        localStorage . setItem ( DESTINATION_ID , JSON . stringify ( inputTargetUrl ) ) ;
        return this ;
      }
      localStorage . removeItem ( DESTINATION_ID ) ;
      return this ;
    } ,

    /*
     *  Sets or retrieves the CSS selector for elements to be ignored during click interception.
     */
    excludeElements : function ( exclusionFilter ) {
      if ( arguments . length === 0 ) return this._omit ;
      this._omit = exclusionFilter ;
      return this ;
    } ,

    // --- URL Modification Functions ---

    /*
     *  Changes the current browser URL.
     *  If no argument, returns the current URL.
     */
    currentPath : function ( newPathUrl ) {
      if ( arguments . length === 0 ) return globalObj . location . href ;
      if ( this.mostRecent ( ) !== newPathUrl ) {
        if ( compareRootPaths ( newPathUrl , this.currentPath ( ) ) ) this.addEntry ( newPathUrl ) ;
        else this.finalStop ( newPathUrl ) ;
      }
      globalObj . location = newPathUrl ;
      return this ;
    } ,

    /*
     *  Redirects the user to the most recent entry in the history.
     */
    reroute : function ( ) {
      const mostRecentEntry = this.mostRecent ( ) ;
      if ( mostRecentEntry ) this.currentPath ( mostRecentEntry ) ;
      return this ;
    } ,

    /*
     *  Removes the latest history entry and redirects to the previous one.
     */
    goBack : function ( ) {
      let currentJournal = this.travelLog ( ) ;
      if ( currentJournal . length > 1 ) {
        currentJournal . pop ( ) ;
        this.travelLog ( currentJournal ) ;
        this.reroute ( ) ;
      }
      return this ;
    } ,

    /*
     *  Stores a URL as a navigation target and then navigates to it.
     */
    traverseTo : function ( destinationUrl ) {
      const standardizedUrl = normalizeWebAddress ( destinationUrl ) ;
      if ( this._verbose ) console . log ( 'Pathfinder.traverseTo(): Navigating towards:' , standardizedUrl ) ;
      this.currentPath ( standardizedUrl ) ;
      return this ;
    } ,

    /*
     *  Opens a given URL in a new browser tab/window.
     */
    launchExternal : function ( externalWebAddress ) {
      if ( this._verbose ) console . log ( 'Pathfinder.launchExternal(): Opening new tab for:' , externalWebAddress ) ;
      const anchorElement = htmlDoc . createElement ( 'a' ) ;
      anchorElement . setAttribute ( 'href' , externalWebAddress ) ;
      anchorElement . setAttribute ( 'target' , '_blank' ) ;

      const clickEvent = htmlDoc . createEvent ( 'HTMLEvents' ) ;
      clickEvent . initEvent ( 'click' , true , true ) ;
      anchorElement . dispatchEvent ( clickEvent ) ;
    } ,

    // --- Data Retrieval Functions ---

    /*
     *  Retrieves the most recent URL from the navigation history.
     */
    mostRecent : function ( ) {
      const currentJournal = this.travelLog ( ) ;
      if ( currentJournal . length ) return currentJournal [ currentJournal . length - 1 ] ;
      return undefValue ;
    } ,

    // --- Event Handling Functions ---

    /*
     *  Sets up an event listener to intercept clicks on specified elements.
     */
    captureClicks : function ( elementFilter ) {
      const instanceRef = this ;
      jq ( htmlDoc ) . on ( 'click' , elementFilter , function ( clickEventDetails ) {
        return instanceRef . _handleUserClick ( this ) ;
      } ) ;
      return this ;
    } ,

    /*
     *  Internal handler for intercepted click events.
     *  Determines if navigation should occur or be ignored.
     */
    _handleUserClick : function ( clickedElement ) {
      if ( jq ( clickedElement ) . is ( this._omit ) ) {
        if ( this._verbose ) console . log ( 'Pathfinder.captureClicks(): Ignoring click on excluded element.' ) ;
        return true ;
      }

      const linkReference = jq ( clickedElement ) . attr ( 'href' ) ;
      if ( this._verbose ) console . log ( 'Pathfinder.captureClicks(): Intercepting click for href:' , linkReference ) ;
      jq ( '#swipy-refresh i' ) . addClass ( 'icon-spin animate-spin' ) ; // Keeping this string as it's a literal for a DOM element.

      this.traverseTo ( linkReference ) ;

      return false ;
    }
  } ;

  /*
   *  Helper function to standardize a URL into an absolute path.
   */
  function normalizeWebAddress ( relativeOrAbsoluteUrl ) {
    const tempAnchor = htmlDoc . createElement ( 'a' ) ;
    tempAnchor . href = relativeOrAbsoluteUrl ;
    return tempAnchor . href ;
  }

  /*
   *  Helper function to compare the base paths of two URLs (ignoring hash fragments).
   */
  function compareRootPaths ( firstUrl , secondUrl ) {
    const rootA = firstUrl . split ( '#' ) [ 0 ] ;
    const rootB = secondUrl . split ( '#' ) [ 0 ] ;
    return rootA === rootB ;
  }

  // Expose the Pathfinder instance globally.
  globalObj . Pathfinder = new Pathfinder ( ) ;

} ) ( window . jQuery || window . Zepto , window , document , undefined ) ;