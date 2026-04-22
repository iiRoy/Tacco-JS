(function (root, domInterface) {
    "use strict";

    root.myVisualEnhancer = function(targetSelector, preferences) {
        let collectionOfTargets;
        if (typeof targetSelector === 'string') {
            collectionOfTargets = Array.from(domInterface.querySelectorAll(targetSelector));
        } else if (targetSelector instanceof NodeList || Array.isArray(targetSelector)) {
            collectionOfTargets = Array.from(targetSelector);
        } else if (targetSelector instanceof HTMLElement) {
            collectionOfTargets = [targetSelector];
        } else {
            console.error("Invalid selector expression for myVisualEnhancer.");
            return [];
        }

        const configuration = Object.assign({
            sourceAttribute: "imadaem",
            imageServiceUrl: "/timthumb/timthumb.php",
            lineAlignment: null,
            globalTriggers: "resize orientationchange"
        }, preferences);

        const physicalPixelDimension = (cssDimension) => {
            const displayDensity = root.devicePixelRatio || 1;
            return Math.round(cssDimension * displayDensity);
        };

        const textLineHeight = (domElement) => {
            const computedStyle = root.getComputedStyle(domElement);
            const lhValue = parseFloat(computedStyle.lineHeight);
            return isNaN(lhValue) ? 0 : lhValue;
        };

        const alignToGrid = (domElement, currentHeight) => {
            if (configuration.lineAlignment === "line-height") {
                const elementLineHeight = textLineHeight(domElement);
                if (elementLineHeight) {
                    const lineCount = Math.max(1, Math.round(currentHeight / elementLineHeight));
                    currentHeight = elementLineHeight * lineCount;
                }
            }
            return currentHeight;
        };

        const extractImageMetadata = (domElement) => {
            let elementDataContent = domElement.getAttribute(`data-${configuration.sourceAttribute}`);
            let processedObject;

            if (elementDataContent === null) {
                processedObject = {};
            } else if (elementDataContent.trim().startsWith('{') && elementDataContent.trim().endsWith('}')) {
                try {
                    processedObject = JSON.parse(elementDataContent);
                } catch (e) {
                    processedObject = { urlLink: elementDataContent };
                }
            } else {
                processedObject = { urlLink: elementDataContent };
            }

            const defaultMetadata = {
                urlLink: "",
                gravityPoint: "",
                aspectRatio: 0,
                maxAspectRatio: 0,
                sizeReference: ""
            };

            let finalMetadata = Object.assign({}, defaultMetadata, processedObject);

            finalMetadata.aspectRatio = parseFloat(finalMetadata.aspectRatio) || 0;
            finalMetadata.maxAspectRatio = finalMetadata.aspectRatio ? 0 : parseFloat(finalMetadata.maxAspectRatio) || 0;

            if (finalMetadata.gravityPoint) {
                finalMetadata.gravityPoint = String(finalMetadata.gravityPoint).replace(/[^lrtb]/g, "").substring(0, 2);
            } else {
                finalMetadata.gravityPoint = "";
            }

            return finalMetadata;
        };

        const assignImageSource = (domElement, newSource) => {
            const priorSource = domElement.getAttribute("src");
            let errorFlag = false;

            const reboundHandler = function() {
                if (!errorFlag) {
                    errorFlag = true;
                    this.setAttribute("src", priorSource);
                }
                this.removeEventListener("error", reboundHandler);
            };

            domElement.addEventListener("error", reboundHandler);
            domElement.setAttribute("src", newSource);
        };

        const processVisuals = () => {
            collectionOfTargets.forEach(currentVisualElement => {
                const visualDetails = extractImageMetadata(currentVisualElement);
                if (!visualDetails.urlLink) {
                    return;
                }

                const currentWidth = currentVisualElement.clientWidth;
                let currentCalculatedHeight = currentVisualElement.clientHeight;

                if (visualDetails.aspectRatio) {
                    currentCalculatedHeight = Math.round(currentWidth / visualDetails.aspectRatio);
                } else if (visualDetails.sizeReference) {
                    const referenceElement = domInterface.querySelector(visualDetails.sizeReference);
                    if (referenceElement) {
                        currentCalculatedHeight = referenceElement.clientHeight;
                    }
                }

                if (visualDetails.maxAspectRatio) {
                    const floorHeight = Math.round(currentWidth / visualDetails.maxAspectRatio);
                    currentCalculatedHeight = Math.max(floorHeight, currentCalculatedHeight);
                }

                currentCalculatedHeight = alignToGrid(currentVisualElement, currentCalculatedHeight);

                currentVisualElement.style.height = `${currentCalculatedHeight}px`;

                const queryParameters = new URLSearchParams();
                queryParameters.append("src", visualDetails.urlLink || "");
                queryParameters.append("a", visualDetails.gravityPoint || "");
                queryParameters.append("w", physicalPixelDimension(currentWidth));
                queryParameters.append("h", physicalPixelDimension(currentCalculatedHeight));

                const finalRenderSource = `${configuration.imageServiceUrl}?${queryParameters.toString()}`;
                assignImageSource(currentVisualElement, finalRenderSource);
            });
        };

        root.addEventListener("load", processVisuals, { once: true });
        configuration.globalTriggers.split(" ").forEach(eventSignal => {
            root.addEventListener(eventSignal, processVisuals);
        });

        return collectionOfTargets;
    };

})(window, document);