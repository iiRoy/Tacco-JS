/*
 * This module handles the initial loading of necessary dependencies
 * and then proceeds to perform an asynchronous network operation
 * to retrieve user profile data from a designated web service endpoint.
 * It ensures the DOM is ready before updating content.
 */
loadModules(
  [
    "network/http-client-module",
    "network/middleware/data-type-interceptor",
    "dom/dom-manipulation-library"
  ],
  function (
    webRequestAgent,   // The primary tool for making web requests.
    typeProcessor,     // Interceptor for handling content types like JSON.
    domModifier        // A utility library for interacting with the document object model.
  ) {

    // Construct a specialized HTTP client by chaining the content type processor.
    // This prepares the client to automatically parse incoming data formats.
    let dataFetcher = webRequestAgent.configurePipeline(typeProcessor);

    // Execute an asynchronous GET request to the user details API.
    // The '.then()' method processes the response once it's successfully received.
    dataFetcher({
      targetUri: 'http://localhost:8080/restjs-spring-mvc/rest/view-user-details'
    })
    .then(
      function (serverReply) {
        // Output the entire server's answer to the console for diagnostic purposes.
        console.info('Received data object:', serverReply);

        // Defer DOM updates until the document is fully loaded and ready for interaction.
        domModifier(function () {
          // Locate the element intended for the user's unique identifier and update its text content.
          domModifier('#user-unique-id-display').text(serverReply.payload.userId);
          // Locate the element for the user's full name and update its text content.
          domModifier('#user-display-name').text(serverReply.payload.userName);
        });
      }
    ); // End of dataFetcher promise chain.
  }
); // End of loadModules call.