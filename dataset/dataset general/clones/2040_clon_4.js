(function (context) {
    class AnimationProcessor {
        constructor() {
            this.activeTasks = new Map(); // Maps element -> { id: rafId, properties: Map<prop, {start, end, unit}>, initialTime, duration, completionHandler }
        }

        static interpolateLinear(progress) {
            return progress;
        }

        commence(targetDomElement, targetCssProperties, durationMilliseconds = 400) {
            return new Promise(resolve => {
                this.halt(targetDomElement, false); // Stop any ongoing animation on this element

                const startingProperties = new Map();
                for (const propertyKey in targetCssProperties) {
                    let currentComputedValue;
                    let unitSuffix = '';

                    if (propertyKey === 'zIndex') {
                        currentComputedValue = parseInt(getComputedStyle(targetDomElement)[propertyKey] || '0', 10);
                        // zIndex is unitless and integer
                    } else if (propertyKey === 'opacity') {
                        currentComputedValue = parseFloat(getComputedStyle(targetDomElement)[propertyKey] || '1');
                        // Opacity is unitless float
                    } else {
                        currentComputedValue = parseFloat(getComputedStyle(targetDomElement)[propertyKey] || '0');
                        // Infer unit from target value if it's a string, otherwise assume 'px' for numbers
                        unitSuffix = (typeof targetCssProperties[propertyKey] === 'string' && targetCssProperties[propertyKey].includes('px')) ? 'px' : '';
                    }

                    startingProperties.set(propertyKey, {
                        initial: currentComputedValue,
                        final: parseFloat(targetCssProperties[propertyKey]),
                        unit: unitSuffix
                    });
                }

                const taskState = {
                    id: null,
                    properties: startingProperties,
                    initialTime: performance.now(),
                    duration: durationMilliseconds,
                    completionHandler: resolve
                };
                this.activeTasks.set(targetDomElement, taskState);

                taskState.id = requestAnimationFrame((time) => this._updateFrame(targetDomElement, time));
            });
        }

        _updateFrame(targetDomElement, currentTime) {
            const taskState = this.activeTasks.get(targetDomElement);
            if (!taskState) return;

            const { properties, initialTime, duration, completionHandler } = taskState;
            const elapsedMilliseconds = currentTime - initialTime;
            const progressRatio = Math.min(elapsedMilliseconds / duration, 1);
            const easedProgress = AnimationProcessor.interpolateLinear(progressRatio);

            properties.forEach((data, propertyKey) => {
                const interpolatedValue = data.initial + (data.final - data.initial) * easedProgress;
                if (propertyKey === 'zIndex') {
                    targetDomElement.style[propertyKey] = Math.round(interpolatedValue); // z-index must be integer
                } else {
                    targetDomElement.style[propertyKey] = `${interpolatedValue}${data.unit}`;
                }
            });

            if (progressRatio < 1) {
                taskState.id = requestAnimationFrame((time) => this._updateFrame(targetDomElement, time));
            } else {
                this.activeTasks.delete(targetDomElement);
                completionHandler();
            }
        }

        halt(targetDomElement, jumpToEnd = false) {
            const taskState = this.activeTasks.get(targetDomElement);
            if (taskState) {
                cancelAnimationFrame(taskState.id);
                if (jumpToEnd) {
                    taskState.properties.forEach((data, propertyKey) => {
                        if (propertyKey === 'zIndex') {
                             targetDomElement.style[propertyKey] = Math.round(data.final);
                        } else {
                            targetDomElement.style[propertyKey] = `${data.final}${data.unit}`;
                        }
                    });
                }
                this.activeTasks.delete(targetDomElement);
                taskState.completionHandler();
            }
        }
    }

    const globalAnimationService = new AnimationProcessor();

    class VisualArranger {
        constructor(hostElement, initialSettings = {}) {
            this.containerElement = hostElement;
            this.settings = {
                itemQuery: "> *",
                initialSelection: 1,
                scalingDepth: 10,
                spacingMultiplier: 3,
                ...initialSettings
            };

            this.currentSelection = this.settings.initialSelection;
            this.isReversed = false;
            this.elementDimensions = { width: 0, height: 0 };

            this.boundHandlers = {};

            this.initializeComponent();
        }

        initializeComponent() {
            const itemElements = Array.from(this.containerElement.querySelectorAll(this.settings.itemQuery));
            if (itemElements.length === 0) {
                console.warn("No items found for VisualArranger.");
                return;
            }

            const referenceItem = itemElements[this.currentSelection - 1]; // 0-indexed
            if (referenceItem) {
                this.elementDimensions.width = referenceItem.offsetWidth;
                this.elementDimensions.height = referenceItem.offsetHeight;
            } else {
                this.currentSelection = 1; // Fallback to first item
                this.elementDimensions.width = itemElements[0].offsetWidth;
                this.elementDimensions.height = itemElements[0].offsetHeight;
            }

            this.attachEventHandlers();
            this.designateItem(this.currentSelection);
        }

        attachEventHandlers() {
            this.boundHandlers.itemClickHandler = (event) => {
                const clickedItem = event.target.closest(this.settings.itemQuery);
                if (clickedItem && !clickedItem.classList.contains('current-active-item')) {
                    const allItems = Array.from(this.containerElement.querySelectorAll(this.settings.itemQuery));
                    const itemIndex = allItems.indexOf(clickedItem) + 1; // 1-indexed
                    if (itemIndex > 0) {
                        this.designateItem(itemIndex);
                        event.preventDefault();
                    }
                }
            };
            this.containerElement.addEventListener('click', this.boundHandlers.itemClickHandler);

            this.boundHandlers.orientationChangeHandler = (event) => { this.toggleOrientation(event.detail); };
            this.containerElement.addEventListener('flow-orientation-change', this.boundHandlers.orientationChangeHandler);

            this.boundHandlers.designateItemHandler = (event) => { this.designateItem(event.detail); };
            this.containerElement.addEventListener('flow-designate-item', this.boundHandlers.designateItemHandler);

            this.boundHandlers.moveBackwardHandler = () => { this.moveBackward(); };
            this.containerElement.addEventListener('flow-move-back', this.boundHandlers.moveBackwardHandler);

            this.boundHandlers.moveForwardHandler = () => { this.moveForward(); };
            this.containerElement.addEventListener('flow-move-forward', this.boundHandlers.moveForwardHandler);

            this.boundHandlers.wheelHandler = (event) => {
                if (event.deltaX === 0) return;

                if (event.deltaX > 0) {
                    this.moveForward();
                } else {
                    this.moveBackward();
                }
                event.preventDefault(); // Prevent page scroll
            };
            this.containerElement.addEventListener('wheel', this.boundHandlers.wheelHandler, { passive: false });

            this.boundHandlers.keyboardHandler = (event) => {
                switch (event.which) { // Using event.which for compatibility with original code's intent
                    case 37: // Left arrow
                        this.moveBackward();
                        break;
                    case 39: // Right arrow
                        this.moveForward();
                        break;
                    default:
                        return;
                }
                event.preventDefault(); // Prevent default arrow key behavior (e.g., scrolling)
            };
            window.addEventListener('keydown', this.boundHandlers.keyboardHandler);
        }

        toggleOrientation(state) {
            const selectedItem = this.containerElement.querySelector(this.settings.itemQuery + '.current-active-item');
            if (selectedItem) {
                const childToFlip = selectedItem.firstElementChild; // Targets direct child as per original
                if (childToFlip) {
                    childToFlip.classList.toggle('orientation-reversed', state);
                }
            }
            this.isReversed = state;
        }

        designateItem(index) {
            this.toggleOrientation(false); // Reset flip state

            const allItems = Array.from(this.containerElement.querySelectorAll(this.settings.itemQuery));
            allItems.forEach((item) => {
                if (item.classList.contains('current-active-item')) {
                    item.classList.remove('current-active-item');
                }
            });
            
            const newItem = allItems[index - 1];
            if (newItem) {
                newItem.classList.add('current-active-item');
            }

            this.currentSelection = index;
            this.updateVisuals();

            this.containerElement.dispatchEvent(new CustomEvent('flow-item-selected', { detail: index }));
        }

        updateVisuals() {
            const allItems = Array.from(this.containerElement.querySelectorAll(this.settings.itemQuery));
            allItems.forEach((item, index) => {
                this.adjustItemDisplay(item, index + 1); // 1-indexed
            });
        }

        adjustItemDisplay(itemElement, itemIndex) {
            const positionDelta = Math.abs(this.currentSelection - itemIndex);
            const deltaScaleFactor = positionDelta / this.settings.scalingDepth;

            const computedScale = (1 - deltaScaleFactor);
            const scaledSize = this.elementDimensions.width * computedScale;
            const calculatedMargin = this.elementDimensions.width * (positionDelta / (this.settings.scalingDepth * 2));

            const magicFormula = 0.5 * positionDelta * (2 * computedScale + (positionDelta - 1) / this.settings.scalingDepth);
            const positionOffset = this.elementDimensions.width * magicFormula;
            const centerAnchor = ((this.containerElement.offsetWidth - this.elementDimensions.width) * 0.5);

            let finalLeft;
            let adjustedMargin;

            if (itemIndex < this.currentSelection) {
                finalLeft = centerAnchor - positionOffset;
                adjustedMargin = calculatedMargin;
            } else {
                finalLeft = centerAnchor + positionOffset;
                adjustedMargin = -calculatedMargin;
            }

            globalAnimationService.commence(itemElement, {
                "zIndex": 100 - positionDelta,
                "left": finalLeft + 'px',
                "width": scaledSize + 'px',
                "height": scaledSize + 'px',
                "marginTop": calculatedMargin + 'px',
                "marginLeft": adjustedMargin * this.settings.spacingMultiplier + 'px',
                "opacity": computedScale
            });
        }

        moveForward() {
            const totalItems = this.containerElement.querySelectorAll(this.settings.itemQuery).length;
            if (totalItems > this.currentSelection) {
                this.designateItem(this.currentSelection + 1);
            }
        }

        moveBackward() {
            if (this.currentSelection > 1) {
                this.designateItem(this.currentSelection - 1);
            }
        }

        destroy() {
            this.containerElement.removeEventListener('click', this.boundHandlers.itemClickHandler);
            this.containerElement.removeEventListener('flow-orientation-change', this.boundHandlers.orientationChangeHandler);
            this.containerElement.removeEventListener('flow-designate-item', this.boundHandlers.designateItemHandler);
            this.containerElement.removeEventListener('flow-move-back', this.boundHandlers.moveBackwardHandler);
            this.containerElement.removeEventListener('flow-move-forward', this.boundHandlers.moveForwardHandler);
            this.containerElement.removeEventListener('wheel', this.boundHandlers.wheelHandler);
            window.removeEventListener('keydown', this.boundHandlers.keyboardHandler);

            Array.from(this.containerElement.querySelectorAll(this.settings.itemQuery)).forEach(item => {
                globalAnimationService.halt(item, true);
            });
        }
    }

    const componentRegistry = new WeakMap();

    context.flowManager = function(elementIdentifier, action, ...args) {
        let targetElement;
        if (typeof elementIdentifier === 'string') {
            targetElement = document.querySelector(elementIdentifier);
        } else if (elementIdentifier instanceof HTMLElement) {
            targetElement = elementIdentifier;
        } else {
            console.error("Invalid element identifier provided to flowManager.");
            return;
        }

        if (!targetElement) {
            console.error("Target element not found:", elementIdentifier);
            return;
        }

        let instance = componentRegistry.get(targetElement);

        if (action === 'initialize' || action === 'init' || !instance) {
            if (!instance) {
                instance = new VisualArranger(targetElement, args[0] || {});
                componentRegistry.set(targetElement, instance);
            } else if (action === 'initialize' || action === 'init') {
                // If instance exists, destroy it first to clean up, then re-initialize
                if (instance.destroy) {
                    instance.destroy();
                }
                instance = new VisualArranger(targetElement, args[0] || {});
                componentRegistry.set(targetElement, instance);
            }
            return instance;
        } else if (instance && typeof instance[action] === 'function') {
            return instance[action](...args);
        } else {
            console.warn(`Action "${action}" not found or not a function for VisualArranger instance.`);
        }
    };

})(window);