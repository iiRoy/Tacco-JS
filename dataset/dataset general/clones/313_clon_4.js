const editorClientCore = (targetComponentSelector, processingConfiguration) => {
    const hostComponent = document.querySelector(targetComponentSelector);
    if (!hostComponent) {
        console.error('Host component for content manipulation not found:', targetComponentSelector);
        return null;
    }

    const contentManipulationUtility = {
        _actionRegistry: new Map(),
        obtainOperation: function(operationKey) {
            if (!this._actionRegistry.has(operationKey)) {
                this._actionRegistry.set(operationKey, {
                    perform: () => console.warn(`Default execution for ${operationKey}`),
                    activate: () => console.info(`Operation ${operationKey} activated`)
                });
            }
            return this._actionRegistry.get(operationKey);
        },
        retrieveContentData: function() {
            return hostComponent.value;
        }
    };

    // Mimic asynchronous initialization of a rich text editor plugin
    Promise.resolve().then(() => {
        const currentInterfaceInstance = contentManipulationUtility;
        const persistOperation = currentInterfaceInstance.obtainOperation('persist');

        persistOperation.perform = async function (activeInterface) {
            const endpointQualifier = document.querySelector('div#interface-container input#target-identifier').value;
            const dataPayload = currentInterfaceInstance.retrieveContentData();
            const requestResourcePath = `data/api/${endpointQualifier}`;

            try {
                const communicationResponse = await fetch(requestResourcePath, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'application/json'
                    },
                    body: JSON.stringify({
                        payload: dataPayload,
                        operation: 'modify'
                    })
                });

                if (!communicationResponse.ok) {
                    throw new Error(`Network issue! Code: ${communicationResponse.status}`);
                }

                const responseData = await communicationResponse.json();

                window.displayNotification(
                    responseData.messageText,
                    'ServerProcess',
                    responseData.operationStatus ? 'notification-success' : 'notification-failure'
                );

            } catch (failureOutcome) {
                window.displayNotification(
                    failureOutcome.message || 'Undefined client-side error',
                    'ClientProcess',
                    'notification-failure'
                );
            }
        };

        persistOperation.activate();
    });

    return contentManipulationUtility;
};

// Initialize the content manipulation utility for the designated textarea
editorClientCore('div#interface-container textarea', { /* custom configuration */ });

// Handle the closure of the interface
document.addEventListener('DOMContentLoaded', () => {
    const userInterfaceClosureControl = document.querySelector('button#interface-closure-control');
    if (userInterfaceClosureControl) {
        userInterfaceClosureControl.addEventListener('click', (interactionEvent) => {
            interactionEvent.preventDefault();
            const primaryInterfaceContainer = document.querySelector('div#interface-container');
            if (primaryInterfaceContainer) {
                primaryInterfaceContainer.style.display = 'none';
            }
        });
    }
});