// This module orchestrates the injection of necessary client-side scripts into the active browser tab
// upon a user's interaction with the extension's browser action button.
chrome.browserAction.onClicked.addListener(async (activeBrowserTab) => {
  // Defensive programming: Ensure the tab object is valid before proceeding.
  if (!activeBrowserTab || typeof activeBrowserTab.id !== 'number' || activeBrowserTab.id <= 0) {
    console.warn('Execution halted: Received an invalid or unidentifiable tab for script injection.');
    return; // Exit early if the tab is not valid.
  }

  // Obtain the fully qualified URL for our primary content script, 'savepublishing.js',
  // which resides within the extension's local directory.
  let primaryContentScriptUrl = chrome.extension.getURL("savepublishing.js");

  // Validate that the resource URL was successfully retrieved.
  if (!primaryContentScriptUrl || primaryContentScriptUrl.length === 0) {
    console.error('Critical Error: Unable to resolve the URL for "savepublishing.js". Script injection aborted.');
    // In a production scenario, a user-facing notification might be appropriate here.
    return;
  }

  // Configuration object for external dependencies, allowing for easier updates and management.
  const externalLibraryConfigurations = {
    jqCore: {
      cdnBase: '//ajax.googleapis.com/ajax/libs/jquery/',
      targetVersion: '3.6.0', // Updated to a more recent stable jQuery version.
      minFileName: 'jquery.min.js'
    },
    jqUi: {
      cdnBase: '//ajax.googleapis.com/ajax/libs/jqueryui/',
      targetVersion: '1.13.2', // Updated to a more recent stable jQuery UI version.
      minFileName: 'jquery-ui.min.js'
    }
    // Note: The Twitter widgets script has been intentionally omitted here as a Type III deletion.
  };

  // Construct a JavaScript URI (bookmarklet-style payload) that will be executed in the target tab.
  // This payload is responsible for dynamically loading external libraries and our custom script.
  let pageInjectionPayloadUri = `javascript:(function(targetWindow, targetDocument, requiredJqVer, mainInjectorCallback, currentJqInstance, scriptElement, isScriptingComplete, readinessState) {
    // This initial block ensures jQuery is loaded and meets version requirements.
    // If not, it dynamically injects jQuery from a CDN.
    if (!(currentJqInstance = targetWindow.jQuery) || requiredJqVer > currentJqInstance.fn.jquery || mainInjectorCallback(currentJqInstance)) {
      scriptElement = targetDocument.createElement('script');
      scriptElement.type = 'text/javascript';
      scriptElement.src = '${externalLibraryConfigurations.jqCore.cdnBase}' + requiredJqVer + '/${externalLibraryConfigurations.jqCore.minFileName}';

      // Use a combined onload/onreadystatechange handler for robust cross-browser loading detection.
      scriptElement.onload = scriptElement.onreadystatechange = function() {
        if (!isScriptingComplete && (!(readinessState = this.readyState) || readinessState === 'loaded' || readinessState === 'complete')) {
          // jQuery has finished loading; execute the main injection logic.
          mainInjectorCallback((currentJqInstance = targetWindow.jQuery).noConflict(true), isScriptingComplete = true);
          // Clean up the dynamically added jQuery loader script from the DOM.
          targetDocument.body.removeChild(this);
        }
      };
      targetDocument.body.appendChild(scriptElement); // Append the jQuery loader script to the document body.
    }
  })(window, document, '${externalLibraryConfigurations.jqCore.targetVersion}', function($, injectionStatusFlag) {
    // This function executes once jQuery is confirmed to be present and ready.
    // It is responsible for injecting additional required scripts.

    // Define a utility function to streamline the creation and appending of script elements.
    const createAndAppendScript = (scriptSourceUrl) => {
      let dynamicScriptNode = document.createElement('script');
      dynamicScriptNode.type = 'text/javascript';
      dynamicScriptNode.src = scriptSourceUrl;
      targetDocument.body.appendChild(dynamicScriptNode);
      return dynamicScriptNode; // Return the created element for potential future reference.
    };

    // Inject jQuery UI from its CDN.
    let jQueryUiScriptNode = createAndAppendScript('${externalLibraryConfigurations.jqUi.cdnBase}' + '${externalLibraryConfigurations.jqUi.targetVersion}' + '/${externalLibraryConfigurations.jqUi.minFileName}');
    console.log('Initiated injection of jQuery UI script.'); // Added console log for progress tracking.

    // Inject our primary application content script.
    let mainAppScriptNode = createAndAppendScript('${primaryContentScriptUrl}');

    // Establish global aliases for jQuery to ensure compatibility with various plugins or legacy code.
    targetWindow.PrimaryJQueryAlias = $; // Renamed 'JQ' to 'PrimaryJQueryAlias'.
    targetWindow.GlobalJQueryInstance = $; // Renamed 'jQuery' to 'GlobalJQueryInstance'.

    // Introduce a slight delay before logging the final status, allowing injected scripts to begin parsing.
    setTimeout(() => {
        console.log('All designated scripts have been placed into the DOM for execution.');
    }, 75); // A small, non-critical delay.

  });`; // End of the JavaScript URI string.

  // Log the action being taken for debugging purposes, truncating the long URI for readability.
  console.log('Attempting to inject a dynamic script payload into tab ID:', activeBrowserTab.id,
              'Payload start:', pageInjectionPayloadUri.substring(0, 150) + '...');

  // Use a try-catch block to gracefully handle potential errors during the tab update operation.
  try {
    // Update the tab's URL to the JavaScript URI, which causes the browser to execute the embedded code.
    await chrome.tabs.update(activeBrowserTab.id, { url: pageInjectionPayloadUri });
    console.info('Successfully dispatched script injection command to tab:', activeBrowserTab.id);
  } catch (operationError) {
    console.error('Failed to update tab URL for script injection. Error details:', operationError);
    // Further error recovery or user notification logic could be implemented here.
  }
});