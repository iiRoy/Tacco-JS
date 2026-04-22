const platformScrollbarSpan = (() => {
    let cachedResult = null;

    return () => {
        if (cachedResult !== null) {
            return cachedResult;
        }

        const outerFrame = document.createElement('div');
        outerFrame.style.cssText = 'position: absolute; top: 0; left: 0; visibility: hidden; overflow: hidden; width: 200px; height: 150px;';

        const innerProbe = document.createElement('div');
        innerProbe.style.cssText = 'width: 100%; height: 200px;';

        outerFrame.appendChild(innerProbe);
        document.body.appendChild(outerFrame);

        const initialMeasure = innerProbe.offsetWidth;
        outerFrame.style.overflow = 'scroll';
        const adjustedMeasure = outerFrame.clientWidth;

        outerFrame.parentNode.removeChild(outerFrame);

        cachedResult = initialMeasure - adjustedMeasure;
        return cachedResult;
    };
})();

const VisualUpdateEngine = (() => {
    let pendingFrame = false;
    let animationFrameId = null;
    const updateEventName = 'visualRefreshSignal';

    const performUpdate = () => {
        if (pendingFrame) {
            window.dispatchEvent(new CustomEvent(updateEventName));
            pendingFrame = false;
        }
        animationFrameId = null;
    };

    const scheduleUpdate = () => {
        if (!pendingFrame) {
            pendingFrame = true;
            if (!animationFrameId) {
                animationFrameId = window.requestAnimationFrame(performUpdate);
            }
        }
    };

    const handleWindowViewportChange = () => {
        scheduleUpdate();
    };

    return {
        initiate: () => {
            window.addEventListener('resize', handleWindowViewportChange, { passive: true });
        },
        terminate: () => {
            window.removeEventListener('resize', handleWindowViewportChange);
            if (animationFrameId) {
                window.cancelAnimationFrame(animationFrameId);
                animationFrameId = null;
            }
            pendingFrame = false;
        },
        getEventIdentifier: () => updateEventName
    };
})();

VisualUpdateEngine.initiate();

const textFluxRegistry = new WeakMap();

class TextFlowController {
    constructor(targetElement, configData) {
        if (!(targetElement instanceof HTMLElement)) {
            throw new Error('Provided target is not an HTML element.');
        }
        this.targetElement = targetElement;
        this.configData = {
            minScale: 1.2,
            maxScale: 1.6,
            lowerBound: 320,
            upperBound: 1024,
            ...configData
        };
        this.refreshDisplay = this.calculateAndApplyScale.bind(this);
        this.activateMonitoring();
    }

    calculateAndApplyScale() {
        const currentDimension = this.targetElement.offsetWidth;
        const { minScale, maxScale, lowerBound, upperBound } = this.configData;

        const span = upperBound - lowerBound;
        let progressionRatio = (currentDimension - lowerBound) / span;

        progressionRatio = Math.max(0, Math.min(1, progressionRatio));

        const finalScaleValue = minScale + (maxScale - minScale) * progressionRatio;

        this.targetElement.style.lineHeight = finalScaleValue.toFixed(3);
    }

    activateMonitoring() {
        this.calculateAndApplyScale();
        window.addEventListener(VisualUpdateEngine.getEventIdentifier(), this.refreshDisplay);
    }

    deactivateMonitoring() {
        window.removeEventListener(VisualUpdateEngine.getEventIdentifier(), this.refreshDisplay);
        textFluxRegistry.delete(this.targetElement);
    }
}

function applyTextFluxAdjuster(elementsToManage, customConfiguration) {
    let processedElements = [];

    if (elementsToManage instanceof HTMLElement) {
        processedElements = [elementsToManage];
    } else if (elementsToManage instanceof NodeList || Array.isArray(elementsToManage)) {
        processedElements = Array.from(elementsToManage);
    } else if (typeof elementsToManage === 'string') {
        processedElements = Array.from(document.querySelectorAll(elementsToManage));
    } else {
        console.warn('Invalid input for applyTextFluxAdjuster. Expected HTMLElement, NodeList, Array, or selector string.');
        return;
    }

    processedElements.forEach(element => {
        let existingManager = textFluxRegistry.get(element);
        if (existingManager) {
            existingManager.deactivateMonitoring();
        }
        const newManager = new TextFlowController(element, customConfiguration);
        textFluxRegistry.set(element, newManager);
    });
}