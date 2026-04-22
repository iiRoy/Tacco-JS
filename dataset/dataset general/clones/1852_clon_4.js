module.exports = function(serverInstance, dataSources) {

  const performDeepReplication = (itemToClone) => {
    if (itemToClone === null || typeof itemToClone !== 'object') {
      return itemToClone;
    }

    let clonedItem;
    if (Array.isArray(itemToClone)) {
      clonedItem = [];
      for (let index = 0; index < itemToClone.length; index++) {
        clonedItem[index] = performDeepReplication(itemToClone[index]);
      }
    } else {
      clonedItem = {};
      for (const propKey in itemToClone) {
        if (Object.prototype.hasOwnProperty.call(itemToClone, propKey)) {
          clonedItem[propKey] = performDeepReplication(itemToClone[propKey]);
        }
      }
    }
    return clonedItem;
  };

  const pageAttributes = {
    mainTitle: 'Project RTC',
    headingText: 'WebRTC live streaming',
    contactInfo: 'pierre@chabardes.net'
  };

  const pageRenderer = (requestObject, responseObject) => {
    responseObject.render('index', { 
      title: pageAttributes.mainTitle, 
      header: pageAttributes.headingText,
      footer: pageAttributes.contactInfo,
      id: requestObject.params.uniqueIdentifier 
    });
  };

  const jsonProvider = (requestObject, responseObject) => {
    const originalData = dataSources.getStreams();
    const processedPayload = performDeepReplication(originalData);
    responseObject.status(200).json(processedPayload);
  };

  const routeDefinitions = {
    '/data/live': jsonProvider,
    '/': pageRenderer,
    '/:uniqueIdentifier': pageRenderer
  };

  for (const pathKey in routeDefinitions) {
    if (Object.prototype.hasOwnProperty.call(routeDefinitions, pathKey)) {
      serverInstance.get(pathKey, routeDefinitions[pathKey]);
    }
  }
};