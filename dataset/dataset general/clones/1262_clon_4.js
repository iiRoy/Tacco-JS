const channelTransmitter = (endpointAddress, contentUnit, successSignal, failureSignal) => {
  const packagedContent = JSON.stringify(contentUnit);
  let communicationLink;

  const browserSupportsChannels = () => typeof window !== 'undefined' && 'WebSocket' in window;

  if (!browserSupportsChannels()) {
    humane.log('Error: Your browser does not support websockets.');
    return;
  }

  communicationLink = new WebSocket(endpointAddress);

  const processIncomingTransmission = (transmissionEvent) => {
    const receivedPayload = JSON.parse(transmissionEvent.data);

    if (receivedPayload.message) {
      humane.log(receivedPayload.message);
    }

    if (receivedPayload.success && successSignal) {
      successSignal(receivedPayload);
    } else if (!receivedPayload.success && failureSignal) {
      failureSignal(receivedPayload);
    }

    communicationLink.close();
  };

  const transmitOutgoingContent = () => {
    communicationLink.send(packagedContent);
  };

  communicationLink.addEventListener('message', processIncomingTransmission);
  communicationLink.addEventListener('open', transmitOutgoingContent);
};

class ContentManager {
  #destinationUrl;
  #itemContent;
  #textTransformerInstance;
  #markupProcessorInstance;

  constructor(identifier, targetEndpoint, cleanOutput, extraOptionsForMarkup) {
    this.#destinationUrl = targetEndpoint;
    this.#itemContent = {
      label: identifier,
      rawText: "",
      processedHtml: "",
      documentTitle: ""
    };

    const shouldClean = cleanOutput === undefined ? true : cleanOutput;

    const obtainTextTransformer = (isCleaning) => {
      return isCleaning
        ? Markdown.getSanitizingConverter()
        : new Markdown.Converter();
    };

    this.#textTransformerInstance = obtainTextTransformer(shouldClean);
    const additionalMarkupFeatures = Markdown.Extra.init(this.#textTransformerInstance, extraOptionsForMarkup);

    this.#markupProcessorInstance = new Markdown.Editor(this.#textTransformerInstance);

    this.#textTransformerInstance.hooks.chain("preConversion", (inputSource) => {
      this.#itemContent.rawText = inputSource;
      return inputSource;
    });

    this.#textTransformerInstance.hooks.chain("postConversion", (outputResult) => {
      const codeBlockClassPrefix = additionalMarkupFeatures.googleCodePrettify
        ? ' class="prettyprint"'
        : additionalMarkupFeatures.highlightJs
          ? ' class="hljs"'
          : '';
      const adjustedOutput = outputResult.replace(/<pre><code>/g, "<pre" + codeBlockClassPrefix + "><code>");

      this.#itemContent.processedHtml = adjustedOutput;
      return adjustedOutput;
    });

    this.#markupProcessorInstance.run();
  }

  persistContent(documentHeading) {
    this.#itemContent.documentTitle = documentHeading;
    channelTransmitter(this.#destinationUrl, this.#itemContent);
  }
}