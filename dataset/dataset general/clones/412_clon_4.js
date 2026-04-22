const obtainRandomValue = (lowBound, highBound) => Math.floor(Math.random() * (highBound - lowBound + 1)) + lowBound;

const canPerformCSSFlows = () => {
    const testElement = document.createElement('div');
    const styleProperty = 'transition';
    const vendorPrefixes = ['Moz', 'Webkit', 'O', 'ms'];
    if (typeof testElement.style[styleProperty] === 'string') return true;

    const capitalizedProperty = styleProperty.charAt(0).toUpperCase() + styleProperty.slice(1);
    for (let i = 0; i < vendorPrefixes.length; i++) {
        if (typeof testElement.style[vendorPrefixes[i] + capitalizedProperty] === 'string') return true;
    }
    return false;
};

class DynamicTextShifter {
    constructor(hostElement, userSettings) {
        this.baseElement = hostElement;
        this.currentSettings = Object.assign({}, DynamicTextShifter.defaultSettings, userSettings);

        this.processedSymbols = [];
        this.lastShiftPath = null;
        this.animationTimerId = null;
        this.transitionEnabled = canPerformCSSFlows();

        this.initiateEffect();
    }

    static defaultSettings = {
        movementDuration: 700,
        frameColor: 'black',
        highlightColor: 'white',
        baseColor: 'black',
        letterDimension: '7em',
        shiftAxis: 'both'
    };

    initiateEffect() {
        this.baseElement.classList.add('dynamic-text-shifter');
        this.injectGlobalStyles();
        this.constructSymbolElements();
        this.setupCharacterDimensions();
        this.activatePeriodicShifts();
        this.attachInteractionListeners();
    }

    injectGlobalStyles() {
        const styleBlock = document.createElement('style');
        styleBlock.textContent = `
            .dynamic-text-shifter { display: flex; flex-wrap: wrap; }
            .dynamic-text-shifter .symbol-container { display: inline-block; overflow: hidden; position: relative; }
            .dynamic-text-shifter .symbol-wrapper { position: relative; display: inline-flex; }
            .dynamic-text-shifter .symbol-wrapper > span { display: inline-block; font-size: ${this.currentSettings.letterDimension}; line-height: 1; user-select: none; white-space: pre; }
            .dynamic-text-shifter .symbol-wrapper .plain-view { color: ${this.currentSettings.baseColor}; }
            .dynamic-text-shifter .symbol-wrapper .effect-view {
                color: ${this.currentSettings.highlightColor};
                text-shadow: -1px 0 ${this.currentSettings.frameColor}, 0 1px ${this.currentSettings.frameColor}, 1px 0 ${this.currentSettings.frameColor}, 0 -1px ${this.currentSettings.frameColor};
                position: absolute;
            }
            .dynamic-text-shifter .symbol-wrapper.transition-enabled {
                transition: transform ${this.currentSettings.movementDuration / 1000}s ease-in-out;
            }

            .dynamic-text-shifter .symbol-wrapper.active-shifted.shift-left { transform: translateX(var(--char-width)); }
            .dynamic-text-shifter .symbol-wrapper.active-shifted.shift-right { transform: translateX(calc(-1 * var(--char-width))); }
            .dynamic-text-shifter .symbol-wrapper.active-shifted.shift-up { transform: translateY(var(--char-height)); }
            .dynamic-text-shifter .symbol-wrapper.active-shifted.shift-down { transform: translateY(calc(-1 * var(--char-height))); }
        `;
        document.head.appendChild(styleBlock);
    }

    constructSymbolElements() {
        const originalContent = this.baseElement.textContent.trim();
        this.baseElement.innerHTML = '';

        const characterArray = originalContent.split('');
        const verticalPositions = ['top', 'bottom'];
        const horizontalPositions = ['left', 'right'];

        characterArray.forEach((char) => {
            const currentSymbol = (char === ' ') ? '&nbsp;' : char;

            let plainY = verticalPositions[obtainRandomValue(0, 1)];
            let plainX = horizontalPositions[obtainRandomValue(0, 1)];

            let activeShiftClass;
            do {
                activeShiftClass = this.determineShiftPath(plainX, plainY);
            } while (activeShiftClass === this.lastShiftPath && this.currentSettings.shiftAxis === 'both');
            this.lastShiftPath = activeShiftClass;

            const symbolContainer = document.createElement('div');
            symbolContainer.classList.add('symbol-container');

            const symbolWrapper = document.createElement('div');
            symbolWrapper.classList.add('symbol-wrapper', `plain-${plainY}`, `plain-${plainX}`);
            if (this.transitionEnabled) {
                symbolWrapper.classList.add('transition-enabled');
            }

            const plainSpan = document.createElement('span');
            plainSpan.classList.add('plain-view');
            plainSpan.innerHTML = currentSymbol;

            const effectSpan = document.createElement('span');
            effectSpan.classList.add('effect-view', activeShiftClass);
            effectSpan.innerHTML = currentSymbol;

            symbolWrapper.appendChild(plainSpan);
            symbolWrapper.appendChild(effectSpan);
            symbolContainer.appendChild(symbolWrapper);

            this.baseElement.appendChild(symbolContainer);
            this.processedSymbols.push(symbolWrapper);
        });
    }

    setupCharacterDimensions() {
        this.processedSymbols.forEach(wrapper => {
            const plainView = wrapper.querySelector('.plain-view');
            const characterWidth = plainView.offsetWidth;
            const characterHeight = plainView.offsetHeight;

            const container = wrapper.closest('.symbol-container');
            container.style.width = `${characterWidth}px`;
            container.style.height = `${characterHeight}px`;

            wrapper.style.setProperty('--char-width', `${characterWidth}px`);
            wrapper.style.setProperty('--char-height', `${characterHeight}px`);

            if (wrapper.classList.contains('plain-bottom')) {
                wrapper.style.top = `-${characterHeight}px`;
            } else {
                wrapper.style.top = `0px`;
            }
            if (wrapper.classList.contains('plain-right')) {
                wrapper.style.left = `-${characterWidth}px`;
            } else {
                wrapper.style.left = `0px`;
            }

            const effectView = wrapper.querySelector('.effect-view');
            const shiftClass = Array.from(effectView.classList).find(cls => cls.startsWith('shift-'));

            effectView.style.position = 'absolute';
            effectView.style.top = '0';
            effectView.style.left = '0';

            if (shiftClass === 'shift-left') {
                effectView.style.left = `-${characterWidth}px`;
            } else if (shiftClass === 'shift-right') {
                effectView.style.left = `${characterWidth}px`;
            } else if (shiftClass === 'shift-up') {
                effectView.style.top = `-${characterHeight}px`;
            } else if (shiftClass === 'shift-down') {
                effectView.style.top = `${characterHeight}px`;
            }
        });
    }

    determineShiftPath(currentX, currentY) {
        let resultPath;
        const horizontalShiftPreference = obtainRandomValue(0, 1) % 2 === 0;

        if ((horizontalShiftPreference && this.currentSettings.shiftAxis === 'both') || this.currentSettings.shiftAxis === 'horizontal') {
            if (currentX === "right") {
                resultPath = "shift-left";
            } else {
                resultPath = "shift-right";
            }
        } else {
            if (currentY === "top") {
                resultPath = "shift-down";
            } else {
                resultPath = "shift-up";
            }
        }
        return resultPath;
    }

    activatePeriodicShifts() {
        this.animationTimerId = setInterval(() => {
            const randomSymbolIndex = obtainRandomValue(0, this.processedSymbols.length - 1);
            const targetSymbolWrapper = this.processedSymbols[randomSymbolIndex];
            this.triggerSymbolShift(targetSymbolWrapper, obtainRandomValue(2, 6) * this.currentSettings.movementDuration);
        }, 1 * this.currentSettings.movementDuration);
    }

    attachInteractionListeners() {
        this.processedSymbols.forEach(wrapper => {
            wrapper.addEventListener('mouseover', () => {
                if (!wrapper.classList.contains('active-shifted')) {
                    this.triggerSymbolShift(wrapper, 0);
                }
            });
        });
    }

    triggerSymbolShift(symbolWrapper, delayTime) {
        setTimeout(() => {
            this.executeSymbolShift(symbolWrapper);
        }, delayTime);
    }

    executeSymbolShift(symbolWrapper) {
        const plainView = symbolWrapper.querySelector('.plain-view');
        const characterWidth = plainView.offsetWidth;
        const characterHeight = plainView.offsetHeight;

        const isCurrentlyShifted = symbolWrapper.classList.contains('active-shifted');
        symbolWrapper.classList.toggle('active-shifted');

        if (this.transitionEnabled) {
            // CSS transitions handle the transform via the 'active-shifted' class
        } else {
            // Fallback animation for 'left' or 'top' property
            const plainOffsetLeft = symbolWrapper.classList.contains('plain-right') ? -characterWidth : 0;
            const plainOffsetTop = symbolWrapper.classList.contains('plain-bottom') ? -characterHeight : 0;

            let effectOffsetLeft = plainOffsetLeft;
            let effectOffsetTop = plainOffsetTop;
            let targetProperty;

            const effectView = symbolWrapper.querySelector('.effect-view');
            const shiftClass = Array.from(effectView.classList).find(cls => cls.startsWith('shift-'));

            if (shiftClass === 'shift-left') {
                effectOffsetLeft = plainOffsetLeft + characterWidth;
                targetProperty = 'left';
            } else if (shiftClass === 'shift-right') {
                effectOffsetLeft = plainOffsetLeft - characterWidth;
                targetProperty = 'left';
            } else if (shiftClass === 'shift-up') {
                effectOffsetTop = plainOffsetTop + characterHeight;
                targetProperty = 'top';
            } else if (shiftClass === 'shift-down') {
                effectOffsetTop = plainOffsetTop - characterHeight;
                targetProperty = 'top';
            }

            let startVal, endVal;
            if (targetProperty === 'left') {
                startVal = parseFloat(symbolWrapper.style.left || plainOffsetLeft);
                endVal = isCurrentlyShifted ? plainOffsetLeft : effectOffsetLeft;
            } else if (targetProperty === 'top') {
                startVal = parseFloat(symbolWrapper.style.top || plainOffsetTop);
                endVal = isCurrentlyShifted ? plainOffsetTop : effectOffsetTop;
            }

            if (targetProperty && startVal !== undefined && endVal !== undefined) {
                this.animateProperty(symbolWrapper, targetProperty, startVal, endVal, this.currentSettings.movementDuration);
            }
        }
    }

    animateProperty(element, property, startValue, endValue, duration) {
        const startTime = performance.now();

        const animateFrame = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const currentValue = startValue + (endValue - startValue) * progress;
            element.style[property] = `${currentValue}px`;

            if (progress < 1) {
                requestAnimationFrame(animateFrame);
            }
        };
        requestAnimationFrame(animateFrame);
    }
}

function initiateTextEffects(targetElement, configuration = {}) {
    if (typeof jQuery !== 'undefined' && targetElement instanceof jQuery) {
        targetElement.each(function() {
            new DynamicTextShifter(this, configuration);
        });
    } else if (targetElement instanceof HTMLElement) {
        new DynamicTextShifter(targetElement, configuration);
    } else if (typeof targetElement === 'string') {
        document.querySelectorAll(targetElement).forEach(element => {
            new DynamicTextShifter(element, configuration);
        });
    } else {
        console.error("Invalid target element provided for DynamicTextShifter.");
    }
}

// Ensure the function is available globally or as intended by the original plugin context
// This might be attached to a global object or used directly depending on the consumer's environment.
// For example, if the original jQuery plugin was called as `$('#myElement').funnyText()`,
// the equivalent vanilla JS would be `initiateTextEffects('#myElement')`.
if (typeof window !== 'undefined') {
    // If running in a browser environment, expose it
    window.initiateTextEffects = initiateTextEffects;
}