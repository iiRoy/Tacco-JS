function fetchContent(resourcePath, completionHandler) {
 let httpRequest = new XMLHttpRequest();
 httpRequest.addEventListener('load', function(responseEvent) {
  completionHandler(responseEvent.target.response);
 }, false);
 httpRequest.open("GET", resourcePath, true);
 httpRequest.send();
}

function acquireResources(resourceList, dataStore) {
 for (let keyIdentifier in resourceList) {
  if (resourceList.hasOwnProperty(keyIdentifier)) {
   fetchContent(resourceList[keyIdentifier], (function(innerKey) {
    return function(retrievedContent) {
     dataStore[innerKey] = retrievedContent;
    }
   })(keyIdentifier));
  }
 }
}

function allResourcesReady(nameCollection, contentRegistry) {
 acquireResources(nameCollection, contentRegistry);
 return function() {
  return (Object.keys(nameCollection).length === Object.keys(contentRegistry).length);
 };
}