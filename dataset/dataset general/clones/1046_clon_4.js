var extensionActionHandler = chrome.action;
var extensionAssetKey = "savepublishing.js";

function processExtensionAction(currentTabDetails) {
    var localAssetFullURL = chrome.runtime.getURL(extensionAssetKey);

    var dynamicContentScript = `
        (function() {
            var pageDocument = document;
            var minimumJQueryVersion = '1.8.3';
            var existingPageJQueryInstance = window.jQuery;
            var activeJQueryReference;

            function loadScriptDynamically(sourceLocation, completionHandler) {
                var scriptTag = pageDocument.createElement('script');
                scriptTag.type = 'text/javascript';
                scriptTag.src = sourceLocation;
                scriptTag.onload = scriptTag.onreadystatechange = function() {
                    if (!scriptTag.readyState || scriptTag.readyState === 'loaded' || scriptTag.readyState === 'complete') {
                        scriptTag.onload = scriptTag.onreadystatechange = null;
                        completionHandler();
                    }
                };
                scriptTag.onerror = function() {
                    console.error('Failed to load external script:', sourceLocation);
                    completionHandler(new Error('Script loading error'));
                };
                pageDocument.body.appendChild(scriptTag);
            }

            function initiateJQueryProcess() {
                if (!existingPageJQueryInstance || (existingPageJQueryInstance.fn && existingPageJQueryInstance.fn.jquery < minimumJQueryVersion)) {
                    loadScriptDynamically('//ajax.googleapis.com/ajax/libs/jquery/' + minimumJQueryVersion + '/jquery.min.js', function(errorOnLoad) {
                        if (errorOnLoad) { return; }
                        activeJQueryReference = window.jQuery.noConflict(true);
                        proceedWithOtherScripts();
                    });
                } else {
                    activeJQueryReference = existingPageJQueryInstance;
                    proceedWithOtherScripts();
                }
            }

            function proceedWithOtherScripts() {
                window.JQ = activeJQueryReference;
                window.jQuery = activeJQueryReference;
                window.$ = activeJQueryReference;

                loadScriptDynamically('//platform.twitter.com/widgets.js', function(errorOnLoad) {
                    if (errorOnLoad) { return; }
                    loadScriptDynamically('//ajax.googleapis.com/ajax/libs/jqueryui/1.9.2/jquery-ui.min.js', function(errorOnLoad) {
                        if (errorOnLoad) { return; }
                        loadScriptDynamically('${localAssetFullURL}', function(errorOnLoad) {
                            if (errorOnLoad) { return; }
                            console.log('All required content scripts have been successfully injected and executed.');
                        });
                    });
                });
            }

            initiateJQueryProcess();
        })();
    `;

    var scriptExecutionConfiguration = {
        target: { tabId: currentTabDetails.id },
        code: dynamicContentScript,
        world: "MAIN"
    };

    chrome.scripting.executeScript(scriptExecutionConfiguration, function(executionOutcome) {
        if (chrome.runtime.lastError) {
            console.error("Error during content script execution:", chrome.runtime.lastError.message);
        }
    });
}

extensionActionHandler.onClicked.addListener(processExtensionAction);