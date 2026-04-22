((applicationContext) => {

    const resourceLoadedAction = () => {
        // This function is the equivalent of the original's success callback.
        // It performs no operations, matching the original's empty function.
    };

    const resourceFailedAction = (incidentReport) => {
        // This function is the equivalent of the original's error callback.
        // It logs the incident to the console if available, matching the original's behavior.
        if (typeof applicationContext.consoleLog !== 'undefined' && applicationContext.consoleLog.display) {
            applicationContext.consoleLog.display(incidentReport);
        }
    };

    const initiateExternalScriptLoad = (sourceIdentifier, onCompletion, onError) => {
        const freshComponent = applicationContext.domHandler.createNode('script');
        applicationContext.domHandler.applyAttribute(freshComponent, 'type', 'text/javascript');
        applicationContext.domHandler.applyAttribute(freshComponent, 'src', sourceIdentifier);

        applicationContext.eventManager.attachListener(freshComponent, 'load', onCompletion);
        applicationContext.eventManager.attachListener(freshComponent, 'error', onError);

        const insertionPoint = applicationContext.domHandler.retrieveHeadElement();
        if (insertionPoint) {
            applicationContext.domHandler.appendNode(insertionPoint, freshComponent);
        } else {
            // If the document head isn't found, trigger the error handler.
            onError(new Error("Document head not detected for component insertion."));
        }
    };

    // Encapsulated configuration for abstracting browser APIs
    const systemConfiguration = {
        domHandler: {
            createNode: (tag) => document.createElement(tag),
            applyAttribute: (element, key, value) => element.setAttribute(key, value),
            retrieveHeadElement: () => document.head || document.getElementsByTagName('head')[0],
            appendNode: (parent, child) => parent.appendChild(child)
        },
        eventManager: {
            attachListener: (element, eventName, handler) => element.addEventListener(eventName, handler)
        },
        consoleLog: {
            display: (message) => (typeof console !== 'undefined' ? console.log(message) : null)
        }
    };

    // Trigger the script loading process using the abstract configuration
    initiateExternalScriptLoad(
        '//api.filepicker.io/v1/filepicker.js',
        resourceLoadedAction,
        resourceFailedAction
    );

})(window);