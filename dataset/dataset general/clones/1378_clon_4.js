function acquireScriptResource(resourcePath) {
  return new Promise((completionHandler, failureHandler) => {
    const scriptElement = document.createElement('script');
    scriptElement.src = resourcePath;
    scriptElement.onload = completionHandler;
    scriptElement.onerror = failureHandler;
    document.head.appendChild(scriptElement);
  });
}

async function orchestrateModuleLoading() {
  try {
    await acquireScriptResource('slide_config.js');
    await acquireScriptResource('modernizr.custom.45394.js');
    await acquireScriptResource('prettify/prettify.js');
    await acquireScriptResource('hammer.js');
    await acquireScriptResource('slide-controller.js');
    await acquireScriptResource('slide-deck.js');
  } catch (issue) {
    console.error('Failed to obtain a required resource:', issue);
  }
}

orchestrateModuleLoading();