// This is the primary event listener for messages dispatched to the extension's background script.
// It serves as a central hub for handling various types of requests from other parts of the extension,
// such as content scripts or popups.
chrome.extension.onMessage.addListener( function ( request, sender, sendResponse ) {

  // The 'request' object contains the data sent with the message.
  // We check its 'type' property to determine the specific action to perform.

  if ( request.type === "enable" )
  {
    // If the request type is "enable", it typically signifies that a content script
    // in a specific tab is ready and the page action icon should be made visible for that tab.
    chrome.pageAction.show( sender.tab.id );
  }
  else if ( request.type === "up" )
  {
    // If the request type is "up", this indicates a command to initiate a capture operation.
    // The 'capture' function is called with the ID of the sending tab and the dimensions
    // required for the capture, which are included in the request.
    capture( sender.tab.id, request.dimensions );
  }

  // It is good practice to always call sendResponse() for a message, even if no data
  // needs to be sent back. This prevents the sending script from potentially hanging,
  // as it expects a response. An empty object is sent in this case.
  sendResponse( { } );


  // A nested helper function named 'send' is defined within the scope of this listener.
  // This function facilitates sending messages back to the specific tab that initiated the original message.
  function send ( request )
  {
    // Utilizes the chrome.tabs.sendMessage API to dispatch a message.
    // The target is identified by sender.tab.id. An empty callback function is provided
    // as no further action is required upon receiving a response from the tab.
    chrome.tabs.sendMessage( sender.tab.id, request, function ( response ) { } );
  }

} ); // End of chrome.extension.onMessage.addListener callback function.


// This event listener is activated when the user clicks on the extension's page action icon
// (the icon that appears in the browser's address bar for specific tabs).
chrome.pageAction.onClicked.addListener( function onClicked ( tab ) {

  // When the page action is clicked, a message of type "start" is sent to the content script
  // running within the currently active tab. This usually triggers the main functionality
  // or user interface of the extension on that particular webpage.
  chrome.tabs.sendMessage( tab.id, { type : "start" }, function ( response ) { } );

} ); // End of chrome.pageAction.onClicked.addListener callback function.


// A global variable to store a reference to the HTML canvas element.
// It's initialized to null and will be created dynamically when first needed for image manipulation.
var canvas = null;

// The 'capture' function handles the process of taking a screenshot of a visible tab area,
// cropping it, and then opening the cropped image in a new tab.
function capture ( tabId, dimensions ) {

  // First step: retrieve detailed information about the target tab using its ID.
  chrome.tabs.get( tabId, function ( tab ) {

    // Once the tab object is successfully retrieved, proceed to capture the visible portion of it.
    // The 'format' option specifies that the captured image should be in PNG format.
    chrome.tabs.captureVisibleTab( tab.windowId, { format : "png" }, function ( dataUrl ) {

      // Check if the 'canvas' element has not been initialized yet.
      if ( ! canvas ) {
        // If 'canvas' is null, create a new HTML5 canvas element.
        canvas = document.createElement( "canvas" );
        // Append the newly created canvas element to the document's body.
        // This makes it part of the DOM, even if it's not visually displayed.
        document.body.appendChild( canvas );
      }

      // Create a new JavaScript Image object. This object will be used to load
      // the data URL of the captured screenshot.
      var image = new Image( );

      // Define the 'onload' event handler for the image. This function will execute
      // only after the image data from 'dataUrl' has been fully loaded into the 'image' object.
      image.onload = function ( ) {

        // Set the width and height of the canvas to match the desired cropping dimensions.
        canvas.width = dimensions.width;
        canvas.height = dimensions.height;

        // Obtain the 2D rendering context of the canvas. This context provides
        // methods for drawing and manipulating graphics on the canvas.
        var context = canvas.getContext( "2d" );

        // Draw the captured image onto the canvas. This is where the cropping occurs.
        // The parameters specify:
        // 1. The source image ('image').
        // 2. The source X, Y, width, height (from 'dimensions') defining the area to crop from the image.
        // 3. The destination X, Y, width, height (0, 0, canvas.width, canvas.height) defining
        //    where and at what size the cropped image will be drawn on the canvas.
        context.drawImage( image,
                           dimensions.left, dimensions.top,
                           dimensions.width, dimensions.height,
                           0, 0,
                           dimensions.width, dimensions.height
                         );

        // Convert the content of the canvas (the cropped image) back into a data URL.
        // This data URL represents the cropped image in PNG format.
        var croppedDataUrl = canvas.toDataURL( "image/png" );

        // Finally, create a new browser tab.
        // The 'url' of this new tab is set to the 'croppedDataUrl', which will display
        // the cropped screenshot directly in the browser.
        // The 'windowId' ensures the new tab opens in the same window as the original tab.
        chrome.tabs.create( {
          url      : croppedDataUrl,
          windowId : tab.windowId
        } );

      } // End of image.onload event handler.

      // Set the 'src' property of the Image object to the captured 'dataUrl'.
      // This action initiates the loading of the image and will trigger the 'onload' event handler
      // once the image data is ready.
      image.src = dataUrl;

    } ); // End of chrome.tabs.captureVisibleTab callback.

  } ); // End of chrome.tabs.get callback.

} // End of capture function definition.