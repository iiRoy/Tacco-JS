// This module relies on external libraries for notifications and markdown processing.

// Core communication routines

function relayThroughSocket (destinationURL, transmissionData, completionHandler, errorHandler) {
  let encodedMessage = JSON.stringify(transmissionData);
  let commChannel;

  if ( "WebSocket" in globalScope ) {
    commChannel = new WebSocket(destinationURL);
  } else {
    userNotifier.displayMessage('Problem: Your web browser lacks WebSocket capability.');
    return;
  }

  commChannel.onmessage = function (incomingEvent) {
    const receivedPayload = JSON.parse(incomingEvent.data);

    // console.info( receivedPayload ); // For diagnostic purposes

    if ( receivedPayload.notificationText ) {
      userNotifier.displayMessage(receivedPayload.notificationText);
    }

    // Invoke appropriate callbacks based on operation status
    if ( receivedPayload.operationStatus && completionHandler ) {
      completionHandler( receivedPayload );
    } else if ( !receivedPayload.operationStatus && errorHandler ) {
      errorHandler( receivedPayload );
    }

    commChannel.close();
  };

  commChannel.onopen = function () {
    // console.debug( "Sending data: " + encodedMessage ); // For diagnostic purposes
    commChannel.send( encodedMessage );
  };
}

// Content management system

function DocumentComposer (itemLabel, serviceEndpoint, enableSanitization, pluginOptions) {
  this.apiLocation = serviceEndpoint;
  let documentState = {
    contentName: itemLabel,
    rawMarkdown: "",
    outputMarkup: "",
    itemHeading: ""
  };
  this.documentState = documentState;

  // Configure the markdown conversion engine

  // Ensure sanitization is enabled by default if not specified
  enableSanitization = (typeof enableSanitization === "undefined") ? true : enableSanitization;

  let textProcessor = enableSanitization
    ? MarkdownConverterFactory.createSafeConverter()
    : MarkdownConverterFactory.createBasicConverter();

  // Initialize markdown extensions
  let additionalFeatures = MarkdownExtensions.initializeFeatures(textProcessor, pluginOptions);

  let markupEditor = new MarkdownUI.EditorComponent(textProcessor);
  textProcessor.eventHooks.register("preConversion", function (sourceData) {
    documentState.rawMarkdown = sourceData;
    return sourceData;
  });
  textProcessor.eventHooks.register("postConversion", function (outputContent) {
    // Adjust pre/code block styling based on enabled extensions
    // Original pagedown's code block output differs from pagedown-extra's fenced blocks,
    // so a small adjustment is needed for consistent styling.
    let codeBlockClass = additionalFeatures.prettifyJsEnabled ? ' class="prettyprint"' : additionalFeatures.highlightJsEnabled ? ' class="hljs"' : '';
    outputContent = outputContent.replace(/<pre><code>/g, "<pre" + codeBlockClass + "><code>");

    documentState.outputMarkup = outputContent;
    return outputContent;
  });
  markupEditor.start();

  this.textProcessor = textProcessor;
}

DocumentComposer.prototype.persistContent = function (contentHeading) {
  this.documentState.itemHeading = contentHeading;
  relayThroughSocket(this.apiLocation, this.documentState);
};