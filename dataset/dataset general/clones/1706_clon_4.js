(function() {
    let instanceCounter = 0;

    class ContentTransformationManager {
        constructor(configuration) {
            this.identifier = `transformer-${instanceCounter++}`;
            this.settings = {
                sourceElementId: "body",
                renderTargetId: "previewPane",
                policySelectorId: "convertTextSetting",
                activationTriggerId: "convertTextButton",
                timingDisplayId: "processingTime",
                footerContainerId: "footer",
                ...configuration
            };

            this.sourceInput = null;
            this.outputDisplay = null;
            this.updatePolicySelector = null;
            this.conversionButton = null;
            this.durationIndicator = null;
            this.pageFooter = null;

            this.markdownProcessor = null;
            this.priorContentValue = "";
            this.lastTransformationDuration = 0;
            this.deferredUpdateHandle = null;
            this.maximumDelayMilliseconds = 3000;
            this.preservedScrollProportion = 1.0;
            this.cachedAvailableHeight = 0;

            this.contentPollingInterval = null;

            this.initiateSystem = this.initiateSystem.bind(this);
            this.locateInterfaceElements = this.locateInterfaceElements.bind(this);
            this.attachInteractionHandlers = this.attachInteractionHandlers.bind(this);
            this.performContentConversion = this.performContentConversion.bind(this);
            this.handleInputActivity = this.handleInputActivity.bind(this);
            this.handlePolicyUpdate = this.handlePolicyUpdate.bind(this);
            this.handleActivationClick = this.handleActivationClick.bind(this);
            this.adjustVisualLayout = this.adjustVisualLayout.bind(this);
            this.recordScrollState = this.recordScrollState.bind(this);
            this.restoreScrollState = this.restoreScrollState.bind(this);
            this.calculateScrollFraction = this.calculateScrollFraction.bind(this);
            this.applyScrollFraction = this.applyScrollFraction.bind(this);
            this.determineUsableSpace = this.determineUsableSpace.bind(this);
            this.monitorForExternalChanges = this.monitorForExternalChanges.bind(this);
            this.handlePasteAction = this.handlePasteAction.bind(this);
        }

        initiateSystem() {
            this.locateInterfaceElements();
            this.attachInteractionHandlers();
            this.markdownProcessor = new Showdown.converter();
            this.performContentConversion();
            this.sourceInput.focus();
            this.outputDisplay.scrollTop = 0;
        }

        locateInterfaceElements() {
            this.sourceInput = document.getElementById(this.settings.sourceElementId);
            this.outputDisplay = document.getElementById(this.settings.renderTargetId);
            this.updatePolicySelector = document.getElementById(this.settings.policySelectorId);
            this.conversionButton = document.getElementById(this.settings.activationTriggerId);
            this.durationIndicator = document.getElementById(this.settings.timingDisplayId);
            this.pageFooter = document.getElementById(this.settings.footerContainerId);

            if (top.document.location.href.includes("?blank=1")) {
                this.sourceInput.value = "";
            }
        }

        attachInteractionHandlers() {
            this.updatePolicySelector.addEventListener("change", this.handlePolicyUpdate);
            this.conversionButton.addEventListener("click", this.handleActivationClick);
            window.addEventListener("resize", this.adjustVisualLayout);

            this.sourceInput.addEventListener("input", this.handleInputActivity);
            this.sourceInput.addEventListener("keyup", this.handleInputActivity);
            this.sourceInput.addEventListener("paste", this.handlePasteAction);

            this.contentPollingInterval = window.setInterval(this.monitorForExternalChanges, 1000);
            window.setInterval(this.adjustVisualLayout, 250);
        }

        performContentConversion() {
            const currentSourceContent = this.sourceInput.value;

            if (currentSourceContent && currentSourceContent === this.priorContentValue) {
                return;
            }

            this.priorContentValue = currentSourceContent;
            const conversionStartEpoch = performance.now();

            const convertedHtml = this.markdownProcessor.makeHtml(currentSourceContent);

            const conversionEndEpoch = performance.now();
            this.lastTransformationDuration = conversionEndEpoch - conversionStartEpoch;
            if (this.durationIndicator) {
                this.durationIndicator.textContent = `${this.lastTransformationDuration.toFixed(2)} ms`;
            }

            this.recordScrollState();
            this.outputDisplay.innerHTML = convertedHtml;
            this.restoreScrollState();
        }

        handleInputActivity() {
            if (this.deferredUpdateHandle) {
                window.clearTimeout(this.deferredUpdateHandle);
                this.deferredUpdateHandle = null;
            }

            const currentPolicy = this.updatePolicySelector.value;
            if (currentPolicy !== "manual") {
                let scheduledDelay = 0;
                if (currentPolicy === "delayed") {
                    scheduledDelay = this.lastTransformationDuration;
                }

                if (scheduledDelay > this.maximumDelayMilliseconds) {
                    scheduledDelay = this.maximumDelayMilliseconds;
                }

                this.deferredUpdateHandle = window.setTimeout(this.performContentConversion, scheduledDelay);
            }
        }

        handlePolicyUpdate() {
            this.handleInputActivity();
        }

        handleActivationClick() {
            this.priorContentValue = "";
            this.performContentConversion();
            this.sourceInput.focus();
        }

        calculateScrollFraction(element) {
            if (element.scrollHeight <= element.clientHeight) {
                return 1.0;
            }
            return element.scrollTop / (element.scrollHeight - element.clientHeight);
        }

        applyScrollFraction(element, fraction) {
            element.scrollTop = (element.scrollHeight - element.clientHeight) * fraction;
        }

        recordScrollState() {
            this.preservedScrollProportion = this.calculateScrollFraction(this.outputDisplay);
        }

        restoreScrollState() {
            this.applyScrollFraction(this.outputDisplay, this.preservedScrollProportion);
        }

        determineUsableSpace() {
            const editorElement = this.sourceInput;
            const footerElement = this.pageFooter;

            const viewportHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
            const footerHeight = footerElement ? (footerElement.clientHeight || footerElement.scrollHeight) : 0;

            let editorOffsetTop = editorElement.offsetTop;
            let currentParent = editorElement.offsetParent;
            while (currentParent) {
                editorOffsetTop += currentParent.offsetTop;
                currentParent = currentParent.offsetParent;
            }

            let computedSpace = viewportHeight - footerHeight - editorOffsetTop;
            if (computedSpace < 0) computedSpace = 0;

            if (computedSpace === this.cachedAvailableHeight) {
                return;
            }
            this.cachedAvailableHeight = computedSpace;

            // Original code explicitly commented out applying styles, so we match this behavior.
            // this.sourceInput.style.height = computedSpace + "px";
            // this.outputDisplay.style.height = computedSpace + "px";
        }

        adjustVisualLayout() {
             this.determineUsableSpace();
        }

        monitorForExternalChanges() {
            if (this.sourceInput.value !== this.priorContentValue) {
                this.handleInputActivity();
            }
        }

        handlePasteAction() {
            if (this.contentPollingInterval !== null) {
                window.clearInterval(this.contentPollingInterval);
                this.contentPollingInterval = null;
            }
            this.handleInputActivity();
        }
    }

    document.addEventListener("DOMContentLoaded", () => {
        new ContentTransformationManager().initiateSystem();
    });
})();