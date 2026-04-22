function initiateDocumentProcessing(inputCollection) {
  inputCollection.forEach(function(item) {
    processIndividualDocument(item);
  });
}

function processIndividualDocument(sourceObject) {
  const fileAcquirer = new FileReader();
  fileAcquirer.readAsText(sourceObject, 'UTF-8');
  fileAcquirer.onload = function() {
    const fileContent = JSON.parse(fileAcquirer.result);
    addLayer(sourceObject, fileContent, numLayers);
    numLayers++;
  };
}