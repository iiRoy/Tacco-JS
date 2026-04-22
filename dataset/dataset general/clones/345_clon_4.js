(function(globalWindow, documentContext) {

    const protectionIdentifier = "contentAttributionGuard";
    const baseConfiguration = {
        supplementalMaterial: "<br>Original: " + globalWindow.location.href,
        minimalSegmentLength: 0,
        contentProcessor: undefined
    };

    const instanceCollection = new WeakMap();

    function acquireCurrentActiveText() {
        if (globalWindow.getSelection) {
            return globalWindow.getSelection().toString();
        } else if (documentContext.selection) {
            return documentContext.selection.createRange().text;
        }
        return "";
    }

    function recordCurrentSelectionPosition() {
        if (globalWindow.getSelection) {
            const activeSelection = globalWindow.getSelection();
            if (activeSelection.getRangeAt && activeSelection.rangeCount) {
                return activeSelection.getRangeAt(0);
            }
        } else if (documentContext.selection) {
            return documentContext.selection.createRange();
        }
        return null;
    }

    function restorePriorSelectionPosition(storedRange) {
        if (storedRange) {
            if (globalWindow.getSelection) {
                const activeSelection = globalWindow.getSelection();
                activeSelection.removeAllRanges();
                activeSelection.addRange(storedRange);
            } else if (documentContext.selection) {
                storedRange.select();
            }
        } else {
            clearCurrentSelectionDisplay();
        }
    }

    function establishTransientSelection(nodeTarget) {
        if (globalWindow.getSelection) {
            const rangeEntity = documentContext.createRange();
            rangeEntity.selectNodeContents(nodeTarget);
            const activeSelection = globalWindow.getSelection();
            activeSelection.removeAllRanges();
            activeSelection.addRange(rangeEntity);
        } else if (documentContext.selection && documentContext.body.createTextRange) {
            const textRangeEntity = documentContext.body.createTextRange();
            textRangeEntity.moveToElementText(nodeTarget);
            textRangeEntity.select();
        }
    }

    function clearCurrentSelectionDisplay() {
        if (globalWindow.getSelection) {
            globalWindow.getSelection().removeAllRanges();
        } else if (documentContext.selection) {
            documentContext.selection.empty();
        }
    }

    class ContentAttributionController {
        constructor(targetElement, operationalParameters) {
            this.monitoredElement = targetElement;
            this.activeSettings = Object.assign({}, baseConfiguration, operationalParameters);
            this.operationMode = typeof operationalParameters === "string" ? operationalParameters : "standard";

            this.boundTransferHandler = this.executeContentTransfer.bind(this);
            this.initiateController();
        }

        executeContentTransfer(transferEvent) {
            const selectedContent = acquireCurrentActiveText();
            const previousSelectionState = recordCurrentSelectionPosition();

            this.monitoredElement.dispatchEvent(new CustomEvent(`begin${protectionIdentifier}Transfer`, { bubbles: true, detail: { originalContent: selectedContent } }));

            let processedContent = selectedContent;
            if (selectedContent.length > this.activeSettings.minimalSegmentLength) {
                if (typeof this.activeSettings.contentProcessor === "function") {
                    processedContent = this.activeSettings.contentProcessor(processedContent);
                }
                processedContent += this.activeSettings.supplementalMaterial;
            }

            const temporaryHoldingArea = documentContext.createElement("div");
            temporaryHoldingArea.style.cssText = "width: 1px; height: 1px; overflow: hidden; position: absolute; top: -99999px; left: -99999px; opacity: 0.01;";
            temporaryHoldingArea.innerHTML = processedContent;
            documentContext.body.appendChild(temporaryHoldingArea);

            establishTransientSelection(temporaryHoldingArea);

            globalWindow.setTimeout(() => {
                restorePriorSelectionPosition(previousSelectionState);
                temporaryHoldingArea.parentNode.removeChild(temporaryHoldingArea);

                this.monitoredElement.dispatchEvent(new CustomEvent(`complete${protectionIdentifier}Transfer`, { bubbles: true, detail: { modifiedContent: processedContent } }));
            }, 0);
        }

        deactivateMonitoring() {
            this.monitoredElement.removeEventListener("copy", this.boundTransferHandler);
        }

        activateMonitoring() {
            this.monitoredElement.addEventListener("copy", this.boundTransferHandler);
        }

        initiateController() {
            switch (this.operationMode) {
                case "remove":
                    return this.deactivateMonitoring();
                default:
                    return this.activateMonitoring();
            }
        }
    }

    globalWindow.implementContentAttribution = function(targetElements, settingsOverride) {
        const componentTargets = Array.isArray(targetElements) ? targetElements : (targetElements instanceof NodeList || targetElements instanceof HTMLCollection) ? Array.from(targetElements) : [targetElements];

        componentTargets.forEach(function(elementUnit) {
            if (!(elementUnit instanceof Element)) {
                console.warn("Invalid DOM element provided for content attribution:", elementUnit);
                return;
            }
            
            let existingController = instanceCollection.get(elementUnit);
            if (existingController) {
                existingController.activeSettings = Object.assign({}, baseConfiguration, settingsOverride);
                existingController.operationMode = typeof settingsOverride === "string" ? settingsOverride : "standard";
                existingController.initiateController();
            } else {
                const newController = new ContentAttributionController(elementUnit, settingsOverride);
                instanceCollection.set(elementUnit, newController);
            }
        });
    };

})(window, document);