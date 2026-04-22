/*
 * @author A. N. Expert <expert@example.com>
 * @project Dynamic Single-Page Content Manager
 * @license BSD-3-Clause
 * @description Manages routing and content loading for web applications with a single page interface.
 */

( function ( jq, globalScope ) { // Self-executing anonymous function to encapsulate logic

  var viewControllers = {}; // Stores functions responsible for managing specific views.
  
  var activeModuleName = void 0; // Identifier of the currently displayed module.
  var _activeModule = void 0;      // jQuery object representing the currently active module.
  
  function displayModule ( moduleIdentifier, inputData ) { // Core routine to bring a module into focus.
    var _moduleElement = jq( "section#" + moduleIdentifier ); // Locate the target section by its unique ID.
    if ( _moduleElement.length === 0 ) { // If the section isn't found in the DOM.
      console.warn( "Section with id='%s' could not be located in the document!", moduleIdentifier );
      return;
    }
    var moduleController = viewControllers[ moduleIdentifier ]; // Retrieve the associated controller function.
    if ( moduleController ) { // If a controller is defined for this module.
      var contextObject = ( _moduleElement.length > 0 ) ? _moduleElement[ 0 ] : void 0; // Establish context for the controller.
      var resultFunction = moduleController.call( contextObject, inputData ); // Execute the controller with provided data.
      if ( typeof resultFunction === "function" ) { // If the controller returns another function (e.g., for rendering).
        viewControllers[ moduleIdentifier ] = resultFunction; // Cache this rendering function for future use.
        resultFunction.call( contextObject, inputData ); // Invoke the rendering function immediately.
      }
    }
    if ( activeModuleName ) { // If there was a module active previously.
      jq( document.body ).removeClass( activeModuleName ); // Remove the CSS class of the old active module from the body.
      if ( _activeModule ) {
        _activeModule.trigger( "section.hidden", activeModuleName ); // Dispatch a 'hidden' event for the outgoing module.
      }
    }
    jq( document.body ).addClass( activeModuleName = moduleIdentifier ); // Assign the new module's class to the body and update the active ID.
    if ( ( _activeModule = _moduleElement ) ) { // Update the reference to the active module element.
      _activeModule.trigger( "section.shown", activeModuleName ); // Dispatch a 'shown' event for the newly displayed module.
    }
  }  

  function contentSwitcher ( moduleIdentifier, inputData ) { // Primary function for routing and content management.
  
    var _moduleElement = jq( document.body ).find( "section#" + moduleIdentifier );  // Find the relevant section within the document body.
    
    var externalSource = _moduleElement.attr( "src" ); // Check if the module specifies an external content source.
    if ( externalSource && _moduleElement.find( ">:first-child" ).length === 0 ) { // If a source is present and the section is currently empty.
      jq.get( externalSource, "html" ) // Fetch the content asynchronously.
          .done( function ( incomingMarkup ) { _moduleElement.html( incomingMarkup ); displayModule( moduleIdentifier, inputData ); } ) // On successful retrieval, populate the section and then display it.
          .fail( function () { globalScope.alert( "Failed to retrieve content from: " + externalSource ); } ); // Alert on content fetching failure.
    } else {
      displayModule( moduleIdentifier, inputData ); // Otherwise, simply proceed to display the module without fetching external content.
    }
  }
  
  contentSwitcher.registerRoute = function ( moduleIdentifier, actionHandler ) { // Method to associate a handler function with a module.
    viewControllers[ moduleIdentifier ] = actionHandler; // Store the provided handler for later execution.
  };
  
  function locationHashMonitor () // Function to handle changes in the URL hash.
  {
    var urlFragment = globalScope.location.hash || "#" + jq( "section[data-default]" ).attr( 'id' ); // Get the current hash or the ID of the default section.

    var fragmentMatcher = /#([-0-9A-Za-z]+)(?::(.+))?/; // Regular expression to parse the URL fragment.
    var parsedResult = fragmentMatcher.exec( urlFragment ); // Execute the regex on the fragment.
    var currentModuleId = parsedResult[ 1 ]; // Extract the module identifier.
    var routeArgument = parsedResult[ 2 ]; // Extract any associated parameter.
    contentSwitcher( currentModuleId, routeArgument ); // Initiate the content switching process.
  }
  
  jq( globalScope ).on( "hashchange", locationHashMonitor ); // Attach an event listener for URL hash changes.
  
  globalScope.contentSwitcher = contentSwitcher; // Expose the main content switching utility globally.
  
  jq( locationHashMonitor ); // Execute the hash monitor once on page load to handle initial routing.

} ) ( jQuery, this );