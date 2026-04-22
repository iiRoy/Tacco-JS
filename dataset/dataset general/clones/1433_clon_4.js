const dimensionControlUnit = {
    displayTimer: null,
    inspectorRestrictionActive: false,
    resizeEventBound: false,
    outputElementReference: null
};

const domUtil = {
    createAndStyleDiv: (attributeMap, styleMap) => {
        const outputDiv = document.createElement('div');
        for (const key in attributeMap) {
            if (attributeMap.hasOwnProperty(key)) {
                outputDiv.setAttribute(key, attributeMap[key]);
            }
        }
        Object.assign(outputDiv.style, styleMap);
        return outputDiv;
    },
    retrieveOrCreateDisplayElement: () => {
        if (!dimensionControlUnit.outputElementReference) {
            const elementAttributes = {
                'data-viewport-output': 'dimensions'
            };
            const elementStyles = {
                position: 'fixed',
                bottom: '0px',
                right: '0px',
                zIndex: '2000000000',
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'hsl(0, 0%, 100%)',
                fontFamily: 'Consolas, monospace',
                fontSize: '12px',
                lineHeight: '22px',
                padding: '2px 5px',
                minWidth: '90px',
                textAlign: 'right',
                visibility: 'hidden',
                boxSizing: 'border-box'
            };
            dimensionControlUnit.outputElementReference = domUtil.createAndStyleDiv(elementAttributes, elementStyles);
            document.body.appendChild(dimensionControlUnit.outputElementReference);
        }
        return dimensionControlUnit.outputElementReference;
    },
    updateElementText: (element, textContent) => {
        if (element) {
            element.textContent = textContent;
        }
    }
};

const displayRoutines = {
    presentCurrentDimensions: () => {
        const targetVisual = domUtil.retrieveOrCreateDisplayElement();
        domUtil.updateElementText(targetVisual, `${window.innerWidth} x ${window.innerHeight}`);
        targetVisual.style.visibility = 'visible';

        if (dimensionControlUnit.displayTimer) {
            clearTimeout(dimensionControlUnit.displayTimer);
        }
        dimensionControlUnit.displayTimer = setTimeout(() => {
            targetVisual.style.visibility = 'hidden';
            dimensionControlUnit.displayTimer = null;
        }, 2000);
    }
};

const environmentEvaluator = {
    checkInspectorStatus: () => {
        const horizontalDeltaThreshold = 750;
        const verticalDeltaThreshold = 312;
        const currentHorizontalDelta = window.outerWidth - window.innerWidth;
        const currentVerticalDelta = window.outerHeight - window.innerHeight;

        return (currentHorizontalDelta >= horizontalDeltaThreshold || currentVerticalDelta >= verticalDeltaThreshold);
    }
};

const coreExecutionFlow = {
    initiateDisplayProcess: () => {
        let executionPermitted = true;

        if (dimensionControlUnit.inspectorRestrictionActive) {
            executionPermitted = environmentEvaluator.checkInspectorStatus();
        }

        if (executionPermitted) {
            displayRoutines.presentCurrentDimensions();
        }
    }
};

const safariInterface = {
    setupMessageHandlers: () => {
        if (!dimensionControlUnit.resizeEventBound) {
            window.addEventListener('resize', coreExecutionFlow.initiateDisplayProcess);
            dimensionControlUnit.resizeEventBound = true;
        }
    },
    removeMessageHandlers: () => {
        if (dimensionControlUnit.resizeEventBound) {
            window.removeEventListener('resize', coreExecutionFlow.initiateDisplayProcess);
            dimensionControlUnit.resizeEventBound = false;
        }
    },
    establishSafariCommunication: () => {
        safari.self.addEventListener('message', (incomingMessage) => {
            if (incomingMessage.name === 'settings') {
                dimensionControlUnit.inspectorRestrictionActive = incomingMessage.message.webinspectorOnly;
                safariInterface.removeMessageHandlers();
                safariInterface.setupMessageHandlers();
            }
        }, false);
        safari.self.tab.dispatchMessage('requestConfigurationData');
        safari.self.tab.dispatchMessage('subscribeToConfigurationUpdates');
    }
};

safariInterface.establishSafariCommunication();
coreExecutionFlow.initiateDisplayProcess();