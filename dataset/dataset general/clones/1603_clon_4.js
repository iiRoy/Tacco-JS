(function(globalWindowReference) {
    // Ensure a global state object exists and persists across reloads of this module.
    // This allows the error handler to retain its knowledge of the code segment
    // even if the module itself is re-executed due to an error.
    if (!globalWindowReference.adaptationModuleState) {
        globalWindowReference.adaptationModuleState = {
            cachedCodeSegment: null,
            // Stores the reference to any pre-existing global entity to support noConflict-like behavior.
            priorGlobalEntity: globalWindowReference.AdaptationEngine
        };
    }
    // Alias for brevity within this closure, pointing to the persistent global state.
    let modulePersistentStorage = globalWindowReference.adaptationModuleState;

    // A placeholder for the path to this module's script file.
    // This string must be updated by the user to match the actual filename/path
    // of the generated clone script (e.g., "resilience-core.js").
    const moduleResourceLocator = "resilience-core.js";

    // Asynchronous utility to fetch script content.
    // Replaces jQuery's $.ajax for text data.
    const retrieveCodeResource = function(resourcePath) {
        const networkOptions = {
            method: 'GET',
            // Equivalent to jQuery's `cache: true` for AJAX requests.
            // `fetch` uses the browser's default HTTP cache for GET requests unless specified otherwise.
            cache: 'default'
        };

        return new Promise((resolve, reject) => {
            fetch(resourcePath, networkOptions)
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Resource access failed: HTTP ${response.status} ${response.statusText}`);
                    }
                    return response.text();
                })
                .then(codeContent => resolve(codeContent))
                .catch(problem => reject(new Error(`Failed to obtain resource at "${resourcePath}": ${problem.message}`)));
        });
    };

    // The primary interface for loading and executing code segments.
    // Replaces the original `FuckIt` function.
    const AdaptationEngine = function(segmentIdentifier) {
        retrieveCodeResource(segmentIdentifier)
            .then(receivedContent => {
                modulePersistentStorage.cachedCodeSegment = receivedContent;
                // Execute the fetched code. Errors within this evaluation will trigger `globalWindowReference.onerror`.
                eval(modulePersistentStorage.cachedCodeSegment);
            })
            .catch(issue => {
                throw new Error("Unable to process the specified code segment: " + segmentIdentifier);
            });
    };

    // Global error handler that implements the "fix and retry" logic.
    // Replaces the original `window.onerror` handler.
    globalWindowReference.onerror = function(errorMessage, scriptSourceUrl, lineNumber) {
        // If no code segment has been loaded by `AdaptationEngine`, this error is not our concern.
        if (!modulePersistentStorage.cachedCodeSegment) {
            return;
        }

        // Split the cached code into lines and remove the line that caused the error.
        // This is a divergent implementation of string manipulation.
        const codeLines = modulePersistentStorage.cachedCodeSegment.split('\n');
        if (lineNumber > 0 && lineNumber <= codeLines.length) {
            codeLines.splice(lineNumber - 1, 1);
        }
        modulePersistentStorage.cachedCodeSegment = codeLines.join('\n');

        // Re-load and re-execute this module itself, then re-evaluate the now-modified user code.
        // This emulates the original's `$.getScript("fuckit.js", function(){eval(window.fuckedScript);});`.
        // Dynamic script tag injection is used to simulate a full script re-load and execution in the global scope,
        // ensuring any global side effects or re-definitions of the module itself occur.
        const reloaderScriptElement = globalWindowReference.document.createElement('script');
        reloaderScriptElement.src = moduleResourceLocator;
        reloaderScriptElement.onload = () => {
            // After this module has been re-executed (via the script tag),
            // the `eval` of the modified user code segment is performed by the *original* `onerror` handler's closure.
            // If this `eval` causes another error, the *newly loaded* `onerror` handler will be triggered,
            // continuing the recursive "fix it" loop.
            try {
                eval(modulePersistentStorage.cachedCodeSegment);
            } catch (evalError) {
                // Log and allow the new onerror handler to catch this if it's a fresh error.
                console.error("Error encountered after code modification and retry attempt:", evalError);
            }
            // Clean up the temporary script element from the DOM.
            reloaderScriptElement.remove();
        };
        reloaderScriptElement.onerror = (loadError) => {
            console.error("Critical: Failed to reload module itself for retry mechanism:", loadError);
            // If the module cannot even reload itself, the self-healing process is broken.
            throw new Error("Fatal: Module re-initialization failure.");
        };
        globalWindowReference.document.head.appendChild(reloaderScriptElement);

        // Return `true` to suppress the browser's default error reporting.
        return true;
    };

    // Provides a no-conflict mechanism to restore the original global variable, if any.
    // Replaces the original `FuckIt.noConflict` method.
    AdaptationEngine.reclaimNamespace = function() {
        globalWindowReference.AdaptationEngine = modulePersistentStorage.priorGlobalEntity;
        return AdaptationEngine;
    };

    // Expose the primary interface to the global scope.
    // Replaces `window.FuckIt = FuckIt;`.
    globalWindowReference.AdaptationEngine = AdaptationEngine;

})(window);