(function(window) {
    'use strict';

    // --- Utility for deep merging objects ---
    function combineSettings(target, source) {
        target = target || {};
        source = source || {};
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    target[key] = combineSettings(target[key], source[key]);
                } else {
                    target[key] = source[key];
                }
            }
        }
        return target;
    }

    // --- Utility for debouncing window resize events (replacement for smartresize) ---
    const globalEventDispatcher = (function() {
        let resizeTimerHandle = null;
        let registeredResizeCallbacks = new Set();
        let windowResizeListenerAdded = false;

        const resizeEventHandler = (event) => {
            clearTimeout(resizeTimerHandle);
            resizeTimerHandle = setTimeout(() => {
                resizeTimerHandle = null;
                registeredResizeCallbacks.forEach(callback => {
                    try {
                        callback(event);
                    } catch (e) {
                        console.error("Error in debounced resize callback:", e);
                    }
                });
            }, 100); // Default debounce delay
        };

        return {
            addDimensionChangeListener: (callback) => {
                registeredResizeCallbacks.add(callback);
                if (!windowResizeListenerAdded) {
                    window.addEventListener('resize', resizeEventHandler);
                    windowResizeListenerAdded = true;
                }
            },
            removeDimensionChangeListener: (callback) => {
                registeredResizeCallbacks.delete(callback);
                if (registeredResizeCallbacks.size === 0 && windowResizeListenerAdded) {
                    window.removeEventListener('resize', resizeEventHandler);
                    windowResizeListenerAdded = false;
                }
            },
            triggerDimensionChange: (immediate = false) => {
                clearTimeout(resizeTimerHandle);
                if (immediate) {
                    registeredResizeCallbacks.forEach(callback => {
                        try {
                            callback(null); // Pass null for event object if immediate
                        } catch (e) {
                            console.error("Error in immediate resize callback:", e);
                        }
                    });
                } else {
                    resizeTimerHandle = setTimeout(() => {
                        resizeTimerHandle = null;
                        registeredResizeCallbacks.forEach(callback => {
                            try {
                                callback(null);
                            } catch (e) {
                                console.error("Error in debounced resize callback:", e);
                            }
                        });
                    }, 100);
                }
            }
        };
    })();

    // --- Utility for image loading (replacement for imagesLoaded) ---
    function detectImageLoadCompletion(targetElement, onAllLoaded) {
        const allImages = Array.from(targetElement.querySelectorAll('img')).concat(targetElement.tagName === 'IMG' ? [targetElement] : []);
        let pendingCount = allImages.length;
        const blankGif = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///ywAAAAAAQABAAACAUwAOw==';
        const processedImages = new Set();

        if (pendingCount === 0) {
            setTimeout(() => onAllLoaded(targetElement, allImages));
            return;
        }

        const imageCompletionCheck = (imgEl) => {
            if (processedImages.has(imgEl)) {
                return;
            }
            processedImages.add(imgEl);
            pendingCount--;
            if (pendingCount <= 0) {
                setTimeout(() => onAllLoaded(targetElement, allImages));
            }
        };

        allImages.forEach(imgEl => {
            if (imgEl.complete && imgEl.naturalWidth !== 0) {
                imageCompletionCheck(imgEl);
            } else {
                imgEl.addEventListener('load', () => imageCompletionCheck(imgEl));
                imgEl.addEventListener('error', () => imageCompletionCheck(imgEl));

                const originalSrc = imgEl.src;
                imgEl.src = blankGif; // WebKit hack
                imgEl.src = originalSrc;
            }
        });
    }

    // --- Main Layout Management System (replacement for $.Mason) ---
    const layoutSystemInstances = new WeakMap(); // To store instances per DOM element

    const defaultArrangementOptions = {
        resizable: true,
        animatedTransitions: false,
        transitionParameters: {
            queue: false,
            duration: 500
        },
        gapSize: 0,
        rightToLeft: false,
        fitToWidth: false,
        containerStyles: {
            position: 'relative'
        },
        itemSelector: null
    };

    function GridArranger(elementNode, userConfig) {
        if (!(this instanceof GridArranger)) {
            return new GridArranger(elementNode, userConfig);
        }

        const mainContainer = elementNode;
        let currentConfig = combineSettings(combineSettings({}, defaultArrangementOptions), userConfig);
        let originalContainerStyle = {};
        let styleUpdateQueue = [];
        let contentUnitElements = [];
        let gridColumnHeights = [];
        let columnWidthValue = 0;
        let gridColumnCount = 0;
        let isInitialLayout = true;
        let contentFlowDirection = currentConfig.rightToLeft ? 'right' : 'left';
        let containerOffset = { x: 0, y: 0 };
        let fluidColumnSizing = typeof currentConfig.columnWidth === 'function';

        // --- Private Helper Functions ---

        function getElementDimension(element, type, includeMargin = false) {
            const computedStyle = getComputedStyle(element);
            let value = (type === 'width') ? element.offsetWidth : element.offsetHeight;
            if (includeMargin) {
                value += parseFloat(computedStyle[`margin-${type === 'width' ? 'left' : 'top'}`]) || 0;
                value += parseFloat(computedStyle[`margin-${type === 'width' ? 'right' : 'bottom'}`]) || 0;
            }
            return value;
        }

        function findAndPrepareContentUnits(elements) {
            let selectedUnits = [];
            if (currentConfig.itemSelector) {
                Array.from(elements).forEach(el => {
                    if (el.matches(currentConfig.itemSelector)) {
                        selectedUnits.push(el);
                    }
                    Array.from(el.querySelectorAll(currentConfig.itemSelector)).forEach(child => selectedUnits.push(child));
                });
            } else {
                selectedUnits = Array.from(elements);
            }

            selectedUnits.forEach(unit => {
                unit.style.position = 'absolute';
                unit.classList.add('masonry-brick');
            });
            return selectedUnits;
        }

        function calculateGridStructure() {
            const parentContainer = currentConfig.fitToWidth ? mainContainer.parentNode : mainContainer;
            const containerInnerWidth = parentContainer.getBoundingClientRect().width;

            columnWidthValue = fluidColumnSizing ?
                currentConfig.columnWidth(containerInnerWidth) :
                currentConfig.columnWidth ||
                (contentUnitElements.length > 0 ? getElementDimension(contentUnitElements[0], 'width', true) : containerInnerWidth);

            columnWidthValue += currentConfig.gapSize;

            gridColumnCount = Math.floor((containerInnerWidth + currentConfig.gapSize) / columnWidthValue);
            gridColumnCount = Math.max(gridColumnCount, 1);
        }

        function positionContentUnit(unitElement) {
            const unitOuterWidth = getElementDimension(unitElement, 'width', true);
            const spanColumns = Math.min(Math.ceil(unitOuterWidth / columnWidthValue), gridColumnCount);

            let potentialYs;
            if (spanColumns === 1) {
                potentialYs = gridColumnHeights;
            } else {
                potentialYs = [];
                const groupCount = gridColumnCount + 1 - spanColumns;
                for (let i = 0; i < groupCount; i++) {
                    const groupColYs = gridColumnHeights.slice(i, i + spanColumns);
                    potentialYs[i] = Math.max(...groupColYs);
                }
            }

            const minGridY = Math.min(...potentialYs);
            let shortestColumnIndex = 0;
            for (let i = 0; i < potentialYs.length; i++) {
                if (potentialYs[i] === minGridY) {
                    shortestColumnIndex = i;
                    break;
                }
            }

            const newPosition = {
                top: `${minGridY + containerOffset.y}px`
            };
            newPosition[contentFlowDirection] = `${columnWidthValue * shortestColumnIndex + containerOffset.x}px`;
            styleUpdateQueue.push({ element: unitElement, styles: newPosition });

            const unitOuterHeight = getElementDimension(unitElement, 'height', true);
            const newColumnHeight = minGridY + unitOuterHeight;
            for (let i = 0; i < spanColumns; i++) {
                gridColumnHeights[shortestColumnIndex + i] = newColumnHeight;
            }
        }

        function performArrangement(unitsToArrange, completionCallback) {
            unitsToArrange.forEach(unit => positionContentUnit(unit));

            const maxContainerHeight = Math.max(...gridColumnHeights);
            const containerDimensions = { height: `${maxContainerHeight}px` };

            if (currentConfig.fitToWidth) {
                let unusedCols = 0;
                let i = gridColumnCount;
                while (--i) {
                    if (gridColumnHeights[i] !== 0) {
                        break;
                    }
                    unusedCols++;
                }
                containerDimensions.width = `${(gridColumnCount - unusedCols) * columnWidthValue - currentConfig.gapSize}px`;
            }
            styleUpdateQueue.push({ element: mainContainer, styles: containerDimensions });

            const applyStyleMethod = !isInitialLayout && currentConfig.animatedTransitions ? 'animate' : 'set';

            styleUpdateQueue.forEach(entry => {
                // For a Type IV clone, we simplify jQuery's animate to direct style application,
                // as a full animation engine is outside the scope of this exercise.
                // The primary functionality (layout positions) is maintained.
                Object.assign(entry.element.style, entry.styles);
            });

            styleUpdateQueue = [];
            if (completionCallback) {
                completionCallback.call(unitsToArrange);
            }
            isInitialLayout = false;
        }

        function resetAndLayout(callback) {
            gridColumnHeights = Array(gridColumnCount).fill(0);
            performArrangement(contentUnitElements, callback);
        }

        function handleContainerResize() {
            const previousColumnCount = gridColumnCount;
            calculateGridStructure();
            if (fluidColumnSizing || gridColumnCount !== previousColumnCount) {
                resetAndLayout();
            }
        }

        // --- Public Methods (exposed via closure) ---
        const publicInterface = {
            initializeArrangement: function() {
                const currentComputedStyle = getComputedStyle(mainContainer);
                originalContainerStyle.height = mainContainer.style.height || '';
                for (const prop in currentConfig.containerStyles) {
                    originalContainerStyle[prop] = mainContainer.style[prop] || '';
                }
                Object.assign(mainContainer.style, currentConfig.containerStyles);

                containerOffset.x = parseInt(currentComputedStyle[`padding-${contentFlowDirection}`], 10) || 0;
                containerOffset.y = parseInt(currentComputedStyle['padding-top'], 10) || 0;

                setTimeout(() => {
                    mainContainer.classList.add('masonry');
                }, 0);

                if (currentConfig.resizable) {
                    globalEventDispatcher.addDimensionChangeListener(handleContainerResize);
                }
                this.refreshContentUnits();
            },

            beginArrangement: function(callback) {
                calculateGridStructure();
                resetAndLayout(callback);
            },

            modifyConfiguration: function(newOptions) {
                if (typeof newOptions === 'object' && newOptions !== null) {
                    currentConfig = combineSettings(currentConfig, newOptions);
                }
            },

            triggerResizeRedo: function() {
                handleContainerResize();
            },

            refreshContentUnits: function() {
                contentUnitElements = findAndPrepareContentUnits(Array.from(mainContainer.children));
            },

            fullReload: function(callback) {
                this.refreshContentUnits();
                this.beginArrangement(callback);
            },

            addContentUnits: function(newElements, animateFromBottom, callback) {
                const preparedNewUnits = findAndPrepareContentUnits(Array.from(newElements));
                if (animateFromBottom) {
                    const currentContainerHeight = mainContainer.offsetHeight;
                    preparedNewUnits.forEach(unit => {
                        unit.style.top = `${currentContainerHeight}px`;
                    });
                    setTimeout(() => {
                        contentUnitElements = contentUnitElements.concat(preparedNewUnits);
                        performArrangement(preparedNewUnits, callback);
                    }, 1);
                } else {
                    contentUnitElements = contentUnitElements.concat(preparedNewUnits);
                    performArrangement(preparedNewUnits, callback);
                }
            },

            removeContentUnits: function(elementsToRemove) {
                const elementsToRemoveArray = Array.from(elementsToRemove);
                contentUnitElements = contentUnitElements.filter(unit => !elementsToRemoveArray.includes(unit));
                elementsToRemoveArray.forEach(unit => {
                    if (unit.parentNode) {
                        unit.parentNode.removeChild(unit);
                    }
                });
            },

            dismantleArrangement: function() {
                contentUnitElements.forEach(unit => {
                    unit.classList.remove('masonry-brick');
                    unit.style.position = '';
                    unit.style.top = '';
                    unit.style.left = '';
                    unit.style.right = '';
                });

                for (const prop in originalContainerStyle) {
                    mainContainer.style[prop] = originalContainerStyle[prop];
                }

                mainContainer.classList.remove('masonry');
                
                globalEventDispatcher.removeDimensionChangeListener(handleContainerResize);
                layoutSystemInstances.delete(mainContainer);
            }
        };

        // Initialize the instance
        publicInterface.initializeArrangement();
        publicInterface.beginArrangement();

        return publicInterface;
    }

    // --- Plugin Bridge (replacement for $.fn.masonry) ---
    function logArrangementError(message) {
        if (window.console) {
            window.console.error(message);
        }
    }

    function manageGridArrangement(targetElements, optionsOrMethod, ...additionalArgs) {
        let elements = [];
        if (typeof targetElements === 'string') {
            elements = Array.from(document.querySelectorAll(targetElements));
        } else if (targetElements instanceof HTMLElement) {
            elements = [targetElements];
        } else if (Array.isArray(targetElements) || targetElements instanceof NodeList) {
            elements = Array.from(targetElements);
        } else {
            logArrangementError("Invalid target for grid arrangement.");
            return [];
        }

        elements.forEach(element => {
            let instance = layoutSystemInstances.get(element);

            if (typeof optionsOrMethod === 'string') {
                const methodName = optionsOrMethod;
                const methodMap = {
                    'option': 'modifyConfiguration',
                    'resize': 'triggerResizeRedo',
                    'reloadItems': 'refreshContentUnits',
                    'reload': 'fullReload',
                    'appended': 'addContentUnits',
                    'remove': 'removeContentUnits',
                    'destroy': 'dismantleArrangement'
                    // _init and layout are considered internal, not directly exposed for method calls
                };
                const internalMethodName = methodMap[methodName] || methodName;

                if (!instance) {
                    logArrangementError(`Cannot call method '${methodName}' on grid arrangement prior to initialization.`);
                    return;
                }
                if (typeof instance[internalMethodName] !== 'function' || internalMethodName.startsWith('_')) {
                    logArrangementError(`No such method '${methodName}' for grid arrangement instance.`);
                    return;
                }
                instance[internalMethodName](...additionalArgs);

            } else {
                if (instance) {
                    instance.modifyConfiguration(optionsOrMethod || {});
                    instance.beginArrangement();
                } else {
                    instance = GridArranger(element, optionsOrMethod);
                    layoutSystemInstances.set(element, instance);
                }
            }
        });

        return elements; // Return the elements for chaining
    }

    // Expose the functionalities under a global namespace
    window.CustomLayout = window.CustomLayout || {};
    window.CustomLayout.initGrid = manageGridArrangement;
    window.CustomLayout.preloadImages = detectImageLoadCompletion;
    window.CustomLayout.triggerGridResize = globalEventDispatcher.triggerDimensionChange;

})(window);