// This module leverages 'humane' for user notifications and 'pagedown' for sophisticated markdown rendering capabilities.

// Core network communication utility
function transmitOverSocket(connectionTarget, messageContent, onCompletionCallback, onErrorHandler) {
  // Pre-flight checks for vital parameters
  if (typeof connectionTarget !== 'string' || !connectionTarget.trim()) {
    humane.log('Transmission Aborted: A valid connection endpoint string is mandatory.');
    return;
  }
  if (messageContent === null || typeof messageContent === 'undefined') {
    humane.log('Transmission Aborted: Message content cannot be empty.');
    return;
  }

  let encodedPayloadRepresentation;
  try {
    encodedPayloadRepresentation = JSON.stringify(messageContent);
  } catch (serializationError) {
    humane.log('Payload Serialization Failure: Content could not be converted to JSON. Error: ' + serializationError.message);
    return;
  }

  let socketClientInstance;
  const isWebSocketsAvailable = (typeof window !== 'undefined' && 'WebSocket' in window);

  if (!isWebSocketsAvailable) {
    humane.log('Browser Incompatibility: Your environment does not provide WebSocket support. Operation cancelled.');
    return;
  } else {
    try {
      socketClientInstance = new WebSocket(connectionTarget);
    } catch (socketInitError) {
      humane.log('WebSocket Initialization Error: Could not establish connection. Details: ' + socketInitError.message);
      return;
    }
  }

  // Establish a robust error handling mechanism
  const effectiveErrorHandler = typeof onErrorHandler === 'function'
    ? onErrorHandler
    : (errData) => {
        console.error('Uncaught WebSocket Transmission Error:', errData);
        humane.log('An unexpected network communication error occurred.');
      };

  // Define behavior upon receiving a message from the server
  socketClientInstance.onmessage = function(incomingEvent) {
    let serverResponseObject;
    try {
      serverResponseObject = JSON.parse(incomingEvent.data);
    } catch (parsingError) {
      humane.log('Server Response Corruption: Data received is not valid JSON. Error: ' + parsingError.message);
      effectiveErrorHandler({ status: 'PARSE_ERROR', details: parsingError.message, rawData: incomingEvent.data });
      this.close(); // Terminate connection on invalid data
      return;
    }

    // Display any informational messages from the server
    if (serverResponseObject.message) {
      humane.log(serverResponseObject.message);
    }

    // Route the response to the appropriate callback
    if (serverResponseObject.success === true && typeof onCompletionCallback === 'function') {
      onCompletionCallback(serverResponseObject);
    } else if (serverResponseObject.success === false && typeof effectiveErrorHandler === 'function') {
      effectiveErrorHandler(serverResponseObject);
    } else {
      // Handle ambiguous success states or missing 'success' flag
      console.warn('WebSocket message lacked explicit success/failure indicator:', serverResponseObject);
      if (typeof onCompletionCallback === 'function') {
        onCompletionCallback(serverResponseObject); // Default to success if no explicit failure
      }
    }

    // Close the connection as this pattern is for single request/response
    this.close();
  };

  // Define behavior when the connection is successfully opened
  socketClientInstance.onopen = function() {
    // console.debug("WebSocket connection established. Sending payload.");
    this.send(encodedPayloadRepresentation);
  };

  // Define behavior for any connection errors
  socketClientInstance.onerror = function(errorEvent) {
    humane.log('Critical WebSocket Connection Failure.');
    effectiveErrorHandler({ status: 'CONNECTION_ERROR', details: 'Socket encountered an error.', event: errorEvent });
    this.close(); // Ensure connection is closed on error
  };
}


// Rich ContentComposer Class Definition
function RichContentComposer(documentIdentifier, serverEndpointUrl, enableHtmlSanitization, markdownExtraConfig) {
  // Enforce required constructor parameters with strict validation
  if (typeof documentIdentifier !== 'string' || documentIdentifier.length === 0) {
    throw new Error('RichContentComposer: A non-empty string for "documentIdentifier" is absolutely required.');
  }
  if (typeof serverEndpointUrl !== 'string' || serverEndpointUrl.length === 0) {
    throw new Error('RichContentComposer: A valid "serverEndpointUrl" string must be provided.');
  }

  this.endpointTarget = serverEndpointUrl;
  // Consolidate configuration options
  this.componentOptions = {
    htmlSanitizationEnabled: typeof enableHtmlSanitization === "boolean" ? enableHtmlSanitization : true, // Default to sanitization
    pagedownExtraConfiguration: markdownExtraConfig || {}
  };

  // Internal data store for the document's current state
  const currentDocumentState = {
    uniqueId: documentIdentifier,
    rawMarkdownContent: "",
    renderedHtmlOutput: "",
    documentTitle: ""
  };
  this.activeDocumentData = currentDocumentState;

  // Initialize the Markdown processing engine
  let markdownConversionEngine;
  if (this.componentOptions.htmlSanitizationEnabled) {
    markdownConversionEngine = Markdown.getSanitizingConverter();
  } else {
    markdownConversionEngine = new Markdown.Converter();
  }

  // Integrate Pagedown-Extra plugins for extended markdown features
  const markdownPluginExtension = Markdown.Extra.init(markdownConversionEngine, this.componentOptions.pagedownExtraConfiguration);

  // Instantiate the Pagedown editor UI component
  const pagedownEditorInstance = new Markdown.Editor(markdownConversionEngine);

  // Attach hooks to intercept and store markdown content before conversion
  markdownConversionEngine.hooks.chain("preConversion", function(inputMarkdownText) {
    currentDocumentState.rawMarkdownContent = inputMarkdownText;
    return inputMarkdownText;
  });

  // Attach hooks to intercept and store HTML output after conversion, with styling adjustments
  markdownConversionEngine.hooks.chain("postConversion", function(outputHtmlFragment) {
    // Dynamically apply appropriate CSS classes for code blocks (e.g., for syntax highlighting)
    const codeBlockCssClassAttribute = markdownPluginExtension.googleCodePrettify
      ? ' class="prettyprint"'
      : markdownPluginExtension.highlightJs
        ? ' class="hljs"'
        : '';
    let adjustedHtml = outputHtmlFragment.replace(/<pre><code>/g, "<pre" + codeBlockCssClassAttribute + "><code>");

    currentDocumentState.renderedHtmlOutput = adjustedHtml;
    return adjustedHtml;
  });

  // Start the Pagedown editor's functionality
  pagedownEditorInstance.run();

  // Make the conversion engine accessible for potential external interaction
  this.currentConversionEngine = markdownConversionEngine;
  this.isComponentReady = true; // Flag indicating successful initialization
}

// Prototype method to persist the document's content to the server
RichContentComposer.prototype.persistDocumentContent = function(documentCurrentTitle) {
  // Ensure the component is fully operational before attempting to save
  if (!this.isComponentReady) {
    console.error('RichContentComposer is not yet ready. Cannot perform save operation.');
    humane.log('Editor component not initialized for saving.');
    return;
  }
  // Validate the title provided for the document
  if (typeof documentCurrentTitle !== 'string' || documentCurrentTitle.trim().length === 0) {
    humane.log('Save Operation Failed: A non-empty document title is required.');
    console.warn('Attempted to save content without a proper title.');
    return;
  }

  this.activeDocumentData.documentTitle = documentCurrentTitle;

  // Define specific callback functions for the save transmission
  const successCallback = (responsePayload) => {
    humane.log('Document content successfully stored.');
    console.info('Server confirmation for save:', responsePayload);
    // Potentially update UI or clear dirty flag here
  };
  const failureCallback = (errorDetails) => {
    humane.log('An error occurred while attempting to save the document.');
    console.error('Document save error details:', errorDetails);
    // Potentially display more specific error to user
  };

  // Initiate the save operation via the WebSocket utility
  transmitOverSocket(this.endpointTarget, this.activeDocumentData, successCallback, failureCallback);
};