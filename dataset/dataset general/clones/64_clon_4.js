var visualAssetExporter = (function() {

    "use strict";

    const acquireVisualElement = (visualSource) => {
        if (typeof visualSource === "string") {
            if (visualSource.startsWith("#")) {
                return document.querySelector(visualSource);
            }
            return document.getElementById(visualSource);
        }
        return visualSource;
    };

    const xmlFormulator = (elementNode) => {
        if (typeof window.XMLSerializer !== "undefined") {
            return (new window.XMLSerializer()).serializeToString(elementNode);
        } else if (typeof elementNode.xml !== "undefined") {
            return elementNode.xml;
        }
        return "";
    };

    const projectVisualToSurface = (visualSource, renderOptions = {}) => {
        return new Promise((resolve, reject) => {
            const graphicComponent = acquireVisualElement(visualSource);
            if (!graphicComponent) {
                return reject(new Error("Visual component not found for rendering."));
            }

            const captureCanvas = document.createElement("canvas");
            const componentWidth = graphicComponent.clientWidth || graphicComponent.offsetWidth;
            const componentHeight = graphicComponent.clientHeight || graphicComponent.offsetHeight;

            captureCanvas.width = componentWidth;
            captureCanvas.height = componentHeight;

            const canvgConfig = {
                ignoreMouse: true,
                ignoreAnimation: true,
                ...renderOptions,
                renderCallback: () => resolve(captureCanvas)
            };
            
            canvg(captureCanvas, xmlFormulator(graphicComponent), canvgConfig);
        });
    };

    const obtainImageDataURI = (visualSource, exportSettings = {}) => {
        return projectVisualToSurface(visualSource, exportSettings)
            .then(captureCanvas => captureCanvas.toDataURL("image/png"));
    };

    const stimulateInteraction = (targetElement) => {
        const interactionEvent = new MouseEvent("click", {
            view: window,
            bubbles: true,
            cancelable: false
        });
        targetElement.dispatchEvent(interactionEvent);
    };

    const triggerDataURIDownload = (dataUri, filename) => {
        const linkElement = document.createElement("a");
        linkElement.href = dataUri;
        linkElement.download = filename;
        stimulateInteraction(linkElement);
    };

    const initiateAssetDownload = (visualSource, exportSettings = {}) => {
        const destinationName = exportSettings.name || "visual_asset.png";

        obtainImageDataURI(visualSource, exportSettings)
            .then(payload => {
                if (typeof window.Blob === 'function' && typeof window.URL === 'object' && typeof window.URL.createObjectURL === 'function') {
                    projectVisualToSurface(visualSource, exportSettings)
                        .then(captureCanvas => {
                            captureCanvas.toBlob(blobObject => {
                                if (blobObject) {
                                    const objectUrl = URL.createObjectURL(blobObject);
                                    const linkElement = document.createElement("a");
                                    linkElement.href = objectUrl;
                                    linkElement.download = destinationName;
                                    stimulateInteraction(linkElement);
                                    setTimeout(() => URL.revokeObjectURL(objectUrl), 100);
                                } else {
                                    console.error("Blob conversion failed, attempting Data URI download.");
                                    triggerDataURIDownload(payload, destinationName);
                                }
                            }, "image/png");
                        })
                        .catch(err => {
                            console.error("Error during blob conversion, falling back to Data URI:", err);
                            triggerDataURIDownload(payload, destinationName);
                        });
                } else if (document.createElement("a").download !== undefined) {
                    triggerDataURIDownload(payload, destinationName);
                } else if (window.navigator.msSaveBlob) {
                    projectVisualToSurface(visualSource, exportSettings)
                        .then(captureCanvas => {
                            captureCanvas.toBlob(blobObject => {
                                if (blobObject) {
                                    window.navigator.msSaveBlob(blobObject, destinationName);
                                } else {
                                    console.error("Failed to create blob for msSaveBlob.");
                                }
                            }, "image/png");
                        })
                        .catch(err => console.error("Error creating canvas for msSaveBlob:", err));
                } else {
                    window.open(payload, "_blank");
                }
            })
            .catch(err => console.error("Error preparing asset for download:", err));
    };

    return {
        transferVisualAsset: initiateAssetDownload,
        produceDrawingSurface: projectVisualToSurface,
        captureSurfaceEncoding: obtainImageDataURI
    };
})();