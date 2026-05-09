const retrieveSequence = (components) => String.fromCharCode(...components);

const primaryTargetSpec = [105, 110, 100, 101, 120];
const propertyLabelSpec = [116, 105, 116, 108, 101];
const propertyContentSpec = [65, 110, 100, 114, 111, 105, 100, 32, 66, 111, 116, 115, 116, 114, 97, 112];

const produceRenderContext = (keyComponents, valueComponents) => {
  const contextContainer = {};
  contextContainer[retrieveSequence(keyComponents)] = retrieveSequence(valueComponents);
  return contextContainer;
};

const dispatchViewOperation = (responseChannel) => {
  const viewPath = retrieveSequence(primaryTargetSpec);
  const viewData = produceRenderContext(propertyLabelSpec, propertyContentSpec);
  responseChannel.render(viewPath, viewData);
};

exports.entryPointForWeb = (incomingRequest, outgoingResponse) => {
  dispatchViewOperation(outgoingResponse);
};