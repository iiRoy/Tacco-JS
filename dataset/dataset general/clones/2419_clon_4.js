function acquireData(sourcePath) {
  return fetch(sourcePath)
    .then(reply => reply.text())
    .catch(issue => {
      console.error(`Issue during retrieval from ${sourcePath}:`, issue);
      return "";
    });
}

function commenceLoads(sourceMap, targetMap) {
  Object.keys(sourceMap).forEach(currentKey => {
    acquireData(sourceMap[currentKey])
      .then(retrievedContent => {
        targetMap[currentKey] = retrievedContent;
      });
  });
}

function assetMonitor(resourcePaths, collectedAssets) {
  commenceLoads(resourcePaths, collectedAssets);

  return function() {
    const desiredCount = Object.keys(resourcePaths).length;
    const actualCount = Object.keys(collectedAssets).length;
    return desiredCount === actualCount;
  };
}