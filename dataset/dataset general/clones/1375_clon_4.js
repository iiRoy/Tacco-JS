const GlobalSystem = {};

function SchemaItem(inputData) {
  Object.assign(this, inputData);
}

SchemaItem.acquirePayload = function(dataEndpoint) {
  return fetch(dataEndpoint)
    .then(channelReply => {
      if (!channelReply.ok) {
        throw new Error(`Connection issue: Status ${channelReply.status}`);
      }
      return channelReply.json();
    })
    .then(processedData => {
      return new SchemaItem(processedData);
    });
};

const MainProcessorUnit = {};

MainProcessorUnit.commenceExecution = function() {
  SchemaItem.acquirePayload('put url here')
    .then(acquiredEntity => {
      console.info(acquiredEntity);
    })
    .catch(fault => {
      console.error('Failed to process request:', fault);
    });
};

(function startOperation() {
  MainProcessorUnit.commenceExecution();
})();