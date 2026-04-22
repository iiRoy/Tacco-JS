/*
 * Copyright (C) <2023> <Jane Doe>
 * This software is provided under an MIT-like license.
 * You are free to use, modify, and distribute this code,
 * provided that this notice is included in all copies or substantial portions.
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE
 * AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM,
 * DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

( function() {

  // Expose the PathManager to the global window object.
  self.PathManager = ( function() {

    // Regular expression for identifying named parameters like :id
    PathManager.tokenIdentifier = /:\w+/g;

    // Regular expression for identifying wildcard parameters like *path
    PathManager.wildcardIdentifier = /\*\w+/g;

    // Default setting for whether to process route matches
    PathManager.prototype.enableDispatch = true;

    /**
     * Initializes a new instance of the PathManager.
     * @param {object} pathDefinitions - An object containing initial path definitions.
     */
    function PathManager( pathDefinitions ) {
      const selfReference = this; // Capture 'this' for use in callbacks.
      // Store the provided path definitions, or an empty object if none are given.
      this.definitions = pathDefinitions !== null ? pathDefinitions : {};

      // Attach an event listener for URL changes using the NavigationAPI.
      NavigationAPI.Handler.attach( self, 'urlChange', function() {
        // When the URL changes, verify the current state against registered paths.
        return selfReference.verifyPaths( NavigationAPI.retrieveCurrentState() );
      } );
    }

    /**
     * Registers a new path pattern and its corresponding action handler.
     * Converts named and wildcard parameters in the pattern to regular expression groups.
     * @param {string} pathPattern - The URL pattern to match.
     * @param {Function} actionHandler - The function to execute when the path matches.
     * @returns {Function} The registered action handler.
     */
    PathManager.prototype.registerPath = function( pathPattern, actionHandler ) {
      // Replace named parameters (e.g., :param) with a regex capturing group for non-slash characters.
      pathPattern = pathPattern.replace( PathManager.tokenIdentifier, '([^\\/]+)' );
      // Replace wildcard parameters (e.g., *wildcard) with a regex capturing group for any characters.
      pathPattern = pathPattern.replace( PathManager.wildcardIdentifier, '(.*?)' );

      // Store the compiled regex pattern as a key with the action handler as its value.
      return this.definitions["^" + pathPattern + "$"] = actionHandler;
    };

    /**
     * Checks the current URL against all registered path definitions.
     * If a match is found and dispatching is enabled, the corresponding action handler is executed.
     * @param {object} currentStateInfo - An object containing information about the current browser state.
     * @returns {boolean} Always returns true after checking, resetting the dispatch flag.
     */
    PathManager.prototype.verifyPaths = function( currentStateInfo ) {
      // Proceed only if path dispatching is currently enabled.
      if ( this.enableDispatch ) {
        let currentAction;      // The function to call for a matched path.
        let pathRegex;          // The compiled regular expression for a path.
        let patternKey;         // The string key representing a path pattern.
        let currentURL;         // The current URL or hash from the state object.
        const definitionMap = this.definitions; // Reference to all path definitions.

        // Iterate over each registered path definition.
        for ( patternKey in definitionMap ) {
          currentAction = definitionMap[patternKey]; // Get the action handler.
          pathRegex = new RegExp( patternKey );      // Create a RegExp object from the pattern.
          // Determine the current URL from state data or hash.
          currentURL = currentStateInfo.data.urlAddress || currentStateInfo.fragment;

          // If the regex matches the current URL, execute the action handler.
          if ( pathRegex.test( currentURL ) ) {
            // Apply the handler with 'self' as context and captured groups as arguments.
            currentAction.apply( self, pathRegex.exec( currentURL ).slice( 1 ) );
          }
        }
      }
      // Reset the dispatch flag for subsequent navigations.
      return this.enableDispatch = true;
    };

    /**
     * Navigates to a new URL, optionally triggering path verification or replacing the history entry.
     * @param {string} targetURL - The URL to navigate to.
     * @param {boolean} [shouldDispatch=true] - Whether to trigger path verification after navigation.
     * @param {boolean} [replaceEntry=false] - Whether to replace the current history entry instead of pushing a new one.
     * @param {string|null} [entryName=null] - An optional name for the history entry.
     * @returns {void}
     */
    PathManager.prototype.directTo = function( targetURL, shouldDispatch, replaceEntry, entryName ) {
      // Set default values for optional parameters if they are not provided.
      if ( shouldDispatch === null ) shouldDispatch = true;
      if ( replaceEntry === null ) replaceEntry = false;
      if ( entryName === null ) entryName = null;

      // Update the dispatch flag based on the 'shouldDispatch' parameter.
      this.enableDispatch = shouldDispatch;

      // Choose between replacing the current history state or adding a new one.
      if ( replaceEntry ) {
        // Replace the current state in the browser's history.
        return NavigationAPI.changeState( { 'urlAddress': targetURL }, null, targetURL );
      } else {
        // Push a new state onto the browser's history stack.
        return NavigationAPI.recordState( { 'urlAddress': targetURL }, null, targetURL );
      }
    };

    /**
     * Initiates the path manager by checking the current URL or a specified initial URL.
     * @param {string} [initialURL] - An optional URL to start checking from. If not provided, the current browser state is used.
     * @returns {boolean} The result of the path verification.
     */
    PathManager.prototype.beginMonitoring = function( initialURL ) {
      let currentStatus = {}; // Object to hold the state information.
      // If an initial URL is provided, create a state object for it.
      if ( initialURL !== null ) {
        currentStatus = { data: { urlAddress: initialURL } };
      } else {
        // Otherwise, retrieve the current state from the navigation API.
        currentStatus = NavigationAPI.retrieveCurrentState();
      }
      // Verify paths based on the determined state.
      return this.verifyPaths( currentStatus );
    };

    /**
     * Moves forward or backward through the browser's history by a specified number of steps.
     * @param {number} stepCount - The number of steps to move (positive for forward, negative for backward).
     * @returns {void}
     */
    PathManager.prototype.moveHistory = function( stepCount ) {
      return NavigationAPI.goBackOrForward( stepCount );
    };

    /**
     * Navigates to the previous entry in the browser's history.
     * @returns {void}
     */
    PathManager.prototype.goPrevious = function() {
      return NavigationAPI.returnToPrevious();
    };

    return PathManager; // Return the constructor for external use.

  } )(); // Immediately invoked function expression for PathManager.

} ).call( this ); // Immediately invoked function expression to encapsulate scope.