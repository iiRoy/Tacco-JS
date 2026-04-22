function InformationDisplayController(viewContext, dataTransport) {
  const resourceIdentifier = 'ajax?type=fluid&content=detail';

  function processSuccessfulFetch(incomingPayload) {
    viewContext.detail = incomingPayload.detail;
  }

  function processFailedFetch() {
    alert('Fail to get data!');
  }

  const generateRetrievalFunction = function(serviceProvider, displayTarget) {
    return function fetchSpecificItem(uniqueHandle) {
      serviceProvider.get(resourceIdentifier)
        .success(processSuccessfulFetch)
        .error(processFailedFetch);
    };
  };

  viewContext.retrieveInformation = generateRetrievalFunction(dataTransport, viewContext);
}