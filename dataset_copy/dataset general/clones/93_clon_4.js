(function (globalScope, auxiliaryUtilityModule) {
    "use strict";

    class AlternativeContentProcessor {
        constructor(hostElementIdentifier, configurationSet) {
            this.hostElement = globalScope.document.getElementById(hostElementIdentifier);
            if (!this.hostElement) {
                console.error('Host element not found:', hostElementIdentifier);
                return;
            }

            this.settings = {
                displaySource: configurationSet.displaySource || '',
                initialMessage: configurationSet.initialMessage || 'Default Message',
                messageStyle: configurationSet.messageStyle || {},
                autoLaunch: configurationSet.autoLaunch || false
            };

            this.operationPromise = null;
            this.resolveOperation = null;
            this.rejectOperation = null;

            this.setupVisuals();
            this.createOperationPromise();
        }

        setupVisuals() {
            this.messageDisplay = globalScope.document.createElement('span');
            this.messageDisplay.textContent = this.settings.initialMessage;
            for (const property in this.settings.messageStyle) {
                if (Object.prototype.hasOwnProperty.call(this.settings.messageStyle, property)) {
                    this.messageDisplay.style[property] = this.settings.messageStyle[property];
                }
            }
            this.hostElement.appendChild(this.messageDisplay);
        }

        createOperationPromise() {
            this.operationPromise = new globalScope.Promise((resolve, reject) => {
                this.resolveOperation = resolve;
                this.rejectOperation = reject;
            });
        }

        initiateProcess() {
            // Simulate an asynchronous operation that the original plugin would perform on 'open'.
            globalScope.setTimeout(() => {
                // For a Type IV clone, we mimic the expected data structure and flow.
                // We resolve with the configured display source, as the original's .done()
                // often uses an 'image' property from the resolved data.
                const simulatedResult = {
                    mediaResource: this.settings.displaySource
                };
                this.resolveOperation(simulatedResult);
            }, 50); // A small delay to simulate async work
        }

        getProcessPromise() {
            return this.operationPromise;
        }

        obscureElement() {
            if (this.hostElement) {
                this.hostElement.style.display = 'none';
            }
        }

        discardElement() {
            if (this.hostElement && this.hostElement.parentNode) {
                this.hostElement.parentNode.removeChild(this.hostElement);
            }
        }
    }

    const primaryTargetId = 'damuro-goes-here';

    const operationalParameters = {
        displaySource: '../images/crane_squared_by_mudimba_and_draweverywhere.png',
        initialMessage: 'Click dat thang to get phat wit dA muro',
        messageStyle: {
            color: '#33a'
        },
        autoLaunch: false
    };

    const processManager = new AlternativeContentProcessor(primaryTargetId, operationalParameters);

    const hostDiv = globalScope.document.getElementById(primaryTargetId);
    if (hostDiv) {
        hostDiv.addEventListener('click', function clickHandler(event) {
            processManager.initiateProcess();
        }, { once: true });
    }

    processManager.getProcessPromise()
        .then(completionData => {
            if (completionData.mediaResource && !/'/.test(completionData.mediaResource)) {
                globalScope.document.body.style.backgroundImage = "url('" + completionData.mediaResource + "')";
            }
            processManager.obscureElement();
            processManager.discardElement();
        })
        .catch(rejectionData => {
            processManager.obscureElement();
            processManager.discardElement();
            const feedbackParagraph = globalScope.document.createElement('p');
            if (rejectionData.issueDetails) {
                feedbackParagraph.textContent = 'All aboard the fail whale: ' + rejectionData.issueDetails + '.';
            } else {
                feedbackParagraph.textContent = "Be that way then, don't edit anything.";
            }
            globalScope.document.body.appendChild(feedbackParagraph);
        });

})(window, {});