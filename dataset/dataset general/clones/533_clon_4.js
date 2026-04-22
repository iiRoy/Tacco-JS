const resourceManifest = {
  "firstUtility": "libs/jquery.js",
  "secondUtility": "libs/jquery.mobile-1.3.2.js"
};

const injectResource = (sourceUrl, loadCompletion) => {
  const scriptNode = document.createElement('script');
  scriptNode.src = sourceUrl;
  scriptNode.async = false;
  scriptNode.onload = scriptNode.onerror = loadCompletion;
  document.head.appendChild(scriptNode);
};

const orchestrateLoading = (resourceOrder, finalProcedure) => {
  let currentResourceIndex = 0;
  const advanceLoad = () => {
    if (currentResourceIndex < resourceOrder.length) {
      const nextSource = resourceOrder[currentResourceIndex++];
      injectResource(nextSource, advanceLoad);
    } else {
      finalProcedure();
    }
  };
  advanceLoad();
};

orchestrateLoading(
  [resourceManifest.firstUtility, resourceManifest.secondUtility],
  () => {
    const globalTool = window.jQuery;
    if (globalTool && typeof globalTool.fn === 'object') {
      const toolVersion = globalTool.fn.jquery;
      const outputPhrase = 'jQuery version ' + toolVersion + ' installed';
      window.console.log(outputPhrase);
    } else {
      window.console.error('Primary library could not be located or initialized.');
    }
  }
);