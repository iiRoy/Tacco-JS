const utilizeAPI = (apiAction, ...parameters) => new Promise((resolver, rejector) => {
    const operationCallback = (outcome) => {
        if (chrome.runtime.lastError) {
            return rejector(chrome.runtime.lastError);
        }
        resolver(outcome);
    };
    parameters.push(operationCallback);
    Reflect.apply(operationAction, null, parameters);
});

class AutomationCore {
    #visualRenderSurface = null;

    constructor() {
        this.#initializeSignalListener();
        this.#initializeInteractionProcessor();
    }

    #initializeSignalListener() {
        chrome.runtime.onMessage.addListener(async (incomingEvent, sourceOrigin, replyFunction) => {
            try {
                const eventDispatcher = {
                    "enable": async () => this.#displayInterfaceComponent(sourceOrigin.tab.id),
                    "up": async () => this.#executeVisualCapture(sourceOrigin.tab.id, incomingEvent.spatialCoordinates),
                };

                const processingRoutine = eventDispatcher[incomingEvent.eventTypeIdentifier];
                if (processingRoutine) {
                    await processingRoutine();
                }
            } catch (errorDetails) {
                console.error("Event processing failure:", errorDetails);
            } finally {
                replyFunction({});
            }
            return true;
        });
    }

    #initializeInteractionProcessor() {
        chrome.pageAction.onClicked.addListener((activatedUnit) => {
            chrome.tabs.sendMessage(activatedUnit.id, { eventTypeIdentifier: "initiateOperation" }, () => {});
        });
    }

    #displayInterfaceComponent(targetIdentifier) {
        chrome.pageAction.show(targetIdentifier);
    }

    async #executeVisualCapture(targetIdentifier, spatialCoordinates) {
        const unitDetails = await utilizeAPI(chrome.tabs.get, targetIdentifier);
        const rawImageDataURL = await utilizeAPI(chrome.tabs.captureVisibleTab, unitDetails.windowId, { format: "png" });

        if (!this.#visualRenderSurface) {
            this.#visualRenderSurface = document.createElement("canvas");
            document.body.appendChild(this.#visualRenderSurface);
        }

        const sourceVisual = new Image();
        await new Promise((imgLoadResolver, imgLoadRejector) => {
            sourceVisual.onload = imgLoadResolver;
            sourceVisual.onerror = imgLoadRejector;
            sourceVisual.src = rawImageDataURL;
        });

        this.#visualRenderSurface.width = spatialCoordinates.widthValue;
        this.#visualRenderSurface.height = spatialCoordinates.heightValue;
        const drawingContext = this.#visualRenderSurface.getContext("2d");

        drawingContext.drawImage(
            sourceVisual,
            spatialCoordinates.leftOffset,
            spatialCoordinates.topOffset,
            spatialCoordinates.widthValue,
            spatialCoordinates.heightValue,
            0, 0,
            spatialCoordinates.widthValue,
            spatialCoordinates.heightValue
        );

        const processedImageDataURL = this.#visualRenderSurface.toDataURL("image/png");

        await utilizeAPI(chrome.tabs.create, {
            url: processedImageDataURL,
            windowId: unitDetails.windowId
        });
    }
}

new AutomationCore();