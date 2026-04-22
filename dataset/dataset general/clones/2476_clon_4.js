(function() {
    function retrieveDimensionComponent(styleDeclaration, propertyName) {
        const parsedValue = parseInt(styleDeclaration.getPropertyValue(propertyName), 10);
        return isNaN(parsedValue) ? 0 : parsedValue;
    }

    function computeElementBounds(targetElement) {
        if (targetElement.style.display === 'none') {
            return { extentX: 0, extentY: 0 };
        }
        const computedStyles = window.getComputedStyle(targetElement);
        const actualWidth = targetElement.offsetWidth;
        const actualHeight = targetElement.offsetHeight;

        const totalWidth = actualWidth +
            retrieveDimensionComponent(computedStyles, 'margin-left') +
            retrieveDimensionComponent(computedStyles, 'margin-right');
        const totalHeight = actualHeight +
            retrieveDimensionComponent(computedStyles, 'margin-top') +
            retrieveDimensionComponent(computedStyles, 'margin-bottom');

        return { extentX: totalWidth, extentY: totalHeight };
    }

    function calculateElementPlacements(containerNode, itemNodes, containerOverallWidth) {
        const placementRegister = new Map();
        let maximumOverallHeight = 0;

        let availableSpaceRects = [{ x: 0, y: 0, w: containerOverallWidth, h: Number.MAX_SAFE_INTEGER }];

        function addAndNormalizeRectangles(newRects) {
            let currentRects = availableSpaceRects.concat(newRects);
            const filteredRects = [];

            for (let i = 0; i < currentRects.length; i++) {
                let isContained = false;
                for (let j = 0; j < currentRects.length; j++) {
                    if (i === j) continue;
                    const r1 = currentRects[i];
                    const r2 = currentRects[j];
                    if (r1.x >= r2.x && r1.y >= r2.y &&
                        r1.x + r1.w <= r2.x + r2.w && r1.y + r1.h <= r2.y + r2.h) {
                        isContained = true;
                        break;
                    }
                }
                if (!isContained) {
                    filteredRects.push(currentRects[i]);
                }
            }
            availableSpaceRects = filteredRects;
        }

        for (const currentElement of itemNodes) {
            const elementSizes = computeElementBounds(currentElement);
            if (elementSizes.extentX === 0 || elementSizes.extentY === 0) {
                continue;
            }

            let bestPlacement = null;
            let bestRectangleIndex = -1;

            availableSpaceRects.sort((rA, rB) => rA.y - rB.y || rA.x - rB.x);

            for (let i = 0; i < availableSpaceRects.length; i++) {
                const currentFreeRect = availableSpaceRects[i];
                if (currentFreeRect.w >= elementSizes.extentX && currentFreeRect.h >= elementSizes.extentY) {
                    if (!bestPlacement || currentFreeRect.y < bestPlacement.y || (currentFreeRect.y === bestPlacement.y && currentFreeRect.x < bestPlacement.x)) {
                        bestPlacement = { x: currentFreeRect.x, y: currentFreeRect.y };
                        bestRectangleIndex = i;
                        // For a pure masonry, the first available spot at the lowest Y is often chosen
                        break;
                    }
                }
            }

            if (!bestPlacement) {
                const currentTallestPoint = placementRegister.size > 0
                    ? Array.from(placementRegister.values()).reduce((max, p) => Math.max(max, p.y + elementSizes.extentY), 0)
                    : 0;
                bestPlacement = { x: 0, y: currentTallestPoint };
                addAndNormalizeRectangles([{ x: 0, y: currentTallestPoint, w: containerOverallWidth, h: Number.MAX_SAFE_INTEGER }]);
                bestRectangleIndex = availableSpaceRects.findIndex(r => r.x === 0 && r.y === currentTallestPoint);
                if (bestRectangleIndex === -1) { // Fallback if the newly added rect isn't found (e.g., merged)
                    bestRectangleIndex = availableSpaceRects.findIndex(r => r.x <= 0 && r.x + r.w >= containerOverallWidth && r.y <= currentTallestPoint);
                }
            }
            
            placementRegister.set(currentElement, bestPlacement);
            maximumOverallHeight = Math.max(maximumOverallHeight, bestPlacement.y + elementSizes.extentY);

            const usedRect = { x: bestPlacement.x, y: bestPlacement.y, w: elementSizes.extentX, h: elementSizes.extentY };
            const originalFreeRect = availableSpaceRects[bestRectangleIndex];

            availableSpaceRects.splice(bestRectangleIndex, 1);

            const newFreeRectsFromSplit = [];

            // Left part of originalFreeRect
            if (usedRect.x > originalFreeRect.x) {
                newFreeRectsFromSplit.push({
                    x: originalFreeRect.x,
                    y: originalFreeRect.y,
                    w: usedRect.x - originalFreeRect.x,
                    h: originalFreeRect.h
                });
            }
            // Right part of originalFreeRect
            if (usedRect.x + usedRect.w < originalFreeRect.x + originalFreeRect.w) {
                newFreeRectsFromSplit.push({
                    x: usedRect.x + usedRect.w,
                    y: originalFreeRect.y,
                    w: (originalFreeRect.x + originalFreeRect.w) - (usedRect.x + usedRect.w),
                    h: originalFreeRect.h
                });
            }
            // Bottom part of originalFreeRect (below the placed item)
            if (usedRect.y > originalFreeRect.y) {
                newFreeRectsFromSplit.push({
                    x: usedRect.x,
                    y: originalFreeRect.y,
                    w: usedRect.w,
                    h: usedRect.y - originalFreeRect.y
                });
            }
            // Top part of originalFreeRect (above the placed item)
            if (usedRect.y + usedRect.h < originalFreeRect.y + originalFreeRect.h) {
                newFreeRectsFromSplit.push({
                    x: usedRect.x,
                    y: usedRect.y + usedRect.h,
                    w: usedRect.w,
                    h: (originalFreeRect.y + originalFreeRect.h) - (usedRect.y + usedRect.h)
                });
            }

            addAndNormalizeRectangles(newFreeRectsFromSplit);
        }

        return { elementPlacements: placementRegister, totalArrangementHeight: maximumOverallHeight };
    }

    function applyElementMotion(elementNode, finalX, finalY, timeMs, motionStyle, delayMs, afterMotionAction) {
        elementNode.style.transition = 'none';
        elementNode.style.transform = `translate(${elementNode.offsetLeft}px, ${elementNode.offsetTop}px)`;
        elementNode.offsetWidth;
        elementNode.style.transition = `transform ${timeMs}ms ${motionStyle} ${delayMs}ms`;
        elementNode.style.transform = `translate(${finalX}px, ${finalY}px)`;

        let finishTimer;
        const handleMotionEnd = (event) => {
            if (event.propertyName === 'transform') {
                elementNode.removeEventListener('transitionend', handleMotionEnd);
                elementNode.style.transition = '';
                if (afterMotionAction) afterMotionAction();
                clearTimeout(finishTimer);
            }
        };
        elementNode.addEventListener('transitionend', handleMotionEnd);

        finishTimer = setTimeout(() => {
            elementNode.removeEventListener('transitionend', handleMotionEnd);
            elementNode.style.transition = '';
            if (afterMotionAction) afterMotionAction();
        }, timeMs + delayMs + 50);
    }

    function extractNumerical(valueInput, defaultVal) {
        const parsed = parseFloat(valueInput);
        return typeof parsed === 'number' && !isNaN(parsed) ? parsed : defaultVal;
    }

    const imageTrackers = new WeakMap();

    function setupImageTracking(targetNode, updateCallback) {
        if (!targetNode.__imageTrackerActive) {
            targetNode.__imageTrackerActive = true;
            const mutationObserver = new MutationObserver(mutations => {
                mutations.forEach(mutation => {
                    if (mutation.type === 'childList') {
                        Array.from(mutation.addedNodes).forEach(addedNode => {
                            if (addedNode.nodeType === 1) {
                                const images = addedNode.tagName === 'IMG' ? [addedNode] : Array.from(addedNode.querySelectorAll('img'));
                                images.forEach(img => {
                                    if (!imageTrackers.has(img)) {
                                        imageTrackers.set(img, true);
                                        if (!img.complete) {
                                            img.addEventListener('load', updateCallback);
                                            img.addEventListener('error', updateCallback);
                                        }
                                    }
                                });
                            }
                        });
                    }
                });
            });
            mutationObserver.observe(targetNode, { childList: true, subtree: true });
        }

        Array.from(targetNode.querySelectorAll('img')).forEach(img => {
            if (!imageTrackers.has(img)) {
                imageTrackers.set(img, true);
                if (!img.complete) {
                    img.addEventListener('load', updateCallback);
                    img.addEventListener('error', updateCallback);
                }
            }
        });
    }

    const textMetricObservers = new WeakMap();

    function activateTextMetricMonitor(targetNode, updateCallback) {
        if (!textMetricObservers.has(targetNode)) {
            const measurerSpan = document.createElement('span');
            measurerSpan.style.position = 'absolute';
            measurerSpan.style.visibility = 'hidden';
            measurerSpan.textContent = 'X';
            targetNode.appendChild(measurerSpan);

            let lastSize = window.getComputedStyle(measurerSpan).fontSize;

            const intervalIdentifier = setInterval(() => {
                const currentSize = window.getComputedStyle(measurerSpan).fontSize;
                if (currentSize !== lastSize) {
                    lastSize = currentSize;
                    updateCallback();
                }
            }, 1000);

            textMetricObservers.set(targetNode, { measurerSpan, intervalIdentifier });
        }
    }

    function deactivateTextMetricMonitor(targetNode) {
        if (textMetricObservers.has(targetNode)) {
            const { measurerSpan, intervalIdentifier } = textMetricObservers.get(targetNode);
            clearInterval(intervalIdentifier);
            if (measurerSpan.parentNode) {
                measurerSpan.parentNode.removeChild(measurerSpan);
            }
            textMetricObservers.delete(targetNode);
        }
    }

    function throttleExecution(fn, delay) {
        let timer;
        return function(...args) {
            const context = this;
            clearTimeout(timer);
            timer = setTimeout(() => fn.apply(context, args), delay);
        };
    }

    const gridInstanceData = new WeakMap();

    function initializeDynamicGrid(containerSelector, configuration) {
        const targetNodes = document.querySelectorAll(containerSelector);
        targetNodes.forEach(node => {
            if (!gridInstanceData.has(node)) {
                const operationalConfig = {
                    transitionDuration: 500,
                    itemStaggerDelay: 0,
                    transitionStyle: 'ease-out',
                    initialVisibilityEffect: false,
                    visibilityEffectDuration: 250,
                    visibilityEffectStagger: 0,
                    enableImageScan: false,
                    enableFontSizeCheck: false,
                    layoutRecalculationDelay: 500,
                    onLayoutStartHook: null,
                    onLayoutCompleteHook: null,
                    ...configuration
                };

                if (operationalConfig.easeing) {
                    operationalConfig.transitionStyle = operationalConfig.easeing;
                }

                gridInstanceData.set(node, {
                    config: operationalConfig,
                    childNodes: Array.from(node.children).filter(child => child.nodeType === 1),
                    currentPlacements: new Map(),
                    containerCurrentHeight: 0,
                    layoutTriggerTimer: null,
                    heightAdjustmentTimer: null
                });

                function applyLayout(containerEl, shouldAnimate = true, completionCallback = null) {
                    const instanceState = gridInstanceData.get(containerEl);
                    if (!instanceState) return;

                    const currentChildNodes = Array.from(containerEl.children).filter(child => child.nodeType === 1);
                    instanceState.childNodes = currentChildNodes;
                    instanceState.currentPlacements.clear();

                    containerEl.style.position = 'relative';
                    containerEl.style.width = 'auto';

                    currentChildNodes.forEach(child => {
                        child.style.position = 'absolute';
                    });

                    const containerDisplayWidth = containerEl.offsetWidth;

                    const { elementPlacements, totalArrangementHeight } = calculateElementPlacements(containerEl, currentChildNodes, containerDisplayWidth);

                    instanceState.currentPlacements = elementPlacements;
                    instanceState.containerCurrentHeight = totalArrangementHeight;

                    if (shouldAnimate) {
                        if (typeof instanceState.config.onLayoutStartHook === 'function') {
                            instanceState.config.onLayoutStartHook(containerEl);
                        }
                        let animationsFinished = 0;
                        const totalAnimatedItems = currentChildNodes.length;
                        const checkAnimationCompletion = () => {
                            animationsFinished++;
                            if (animationsFinished === totalAnimatedItems) {
                                if (typeof instanceState.config.onLayoutCompleteHook === 'function') {
                                    instanceState.config.onLayoutCompleteHook(containerEl);
                                }
                                if (completionCallback) {
                                    completionCallback(containerEl);
                                }
                            }
                        };

                        currentChildNodes.forEach((child, index) => {
                            const finalPos = instanceState.currentPlacements.get(child);
                            if (finalPos) {
                                applyElementMotion(
                                    child,
                                    finalPos.x,
                                    finalPos.y,
                                    instanceState.config.transitionDuration,
                                    instanceState.config.transitionStyle,
                                    index * instanceState.config.itemStaggerDelay,
                                    checkAnimationCompletion
                                );
                            } else {
                                checkAnimationCompletion();
                            }
                        });
                    } else {
                        currentChildNodes.forEach(child => {
                            const finalPos = instanceState.currentPlacements.get(child);
                            if (finalPos) {
                                child.style.left = `${finalPos.x}px`;
                                child.style.top = `${finalPos.y}px`;
                            }
                        });
                        if (typeof instanceState.config.onLayoutCompleteHook === 'function') {
                            instanceState.config.onLayoutCompleteHook(containerEl);
                        }
                        if (completionCallback) {
                            completionCallback(containerEl);
                        }
                    }

                    adjustContainerVisualHeight(containerEl, instanceState.containerCurrentHeight, instanceState.config.transitionDuration);
                }

                function adjustContainerVisualHeight(containerEl, targetHeight, duration) {
                    const instanceState = gridInstanceData.get(containerEl);
                    if (!instanceState) return;

                    clearTimeout(instanceState.heightAdjustmentTimer);

                    if (containerEl.offsetHeight === targetHeight) {
                        return;
                    }

                    containerEl.style.transition = `height ${duration}ms ${instanceState.config.transitionStyle}`;
                    containerEl.style.height = `${targetHeight}px`;

                    instanceState.heightAdjustmentTimer = setTimeout(() => {
                        containerEl.style.transition = '';
                    }, duration + 50);
                }

                applyLayout(node, false);

                if (operationalConfig.initialVisibilityEffect) {
                    const effectProps = typeof operationalConfig.initialVisibilityEffect === 'object'
                        ? operationalConfig.initialVisibilityEffect
                        : { duration: operationalConfig.visibilityEffectDuration, delay: operationalConfig.visibilityEffectStagger };

                    const instanceState = gridInstanceData.get(node);
                    instanceState.childNodes.forEach((child, idx) => {
                        if (child.style.display === 'none') return;
                        child.style.opacity = '0';
                        setTimeout(() => {
                            child.style.transition = `opacity ${effectProps.duration}ms ease-in`;
                            child.style.opacity = '1';
                        }, idx * effectProps.delay);
                    });
                }

                const throttledRelayout = throttleExecution(() => {
                    const instanceState = gridInstanceData.get(node);
                    clearTimeout(instanceState.layoutTriggerTimer);
                    instanceState.layoutTriggerTimer = setTimeout(() => {
                        applyLayout(node, true);
                    }, instanceState.config.layoutRecalculationDelay);
                }, 100);

                window.addEventListener('resize', throttledRelayout);

                if (operationalConfig.enableImageScan) {
                    setupImageTracking(node, throttledRelayout);
                }
                if (operationalConfig.enableFontSizeCheck) {
                    activateTextMetricMonitor(node, throttledRelayout);
                }
            }
        });

        return {
            getGridController: (index = 0) => {
                const targetNode = targetNodes[index];
                if (!targetNode) return null;

                const instanceState = gridInstanceData.get(targetNode);
                if (!instanceState) return null;

                return {
                    recalculateLayout: (motionStyle, motionTime, itemDelay, onCompletion) => {
                        instanceState.config.transitionStyle = motionStyle || instanceState.config.transitionStyle;
                        instanceState.config.transitionDuration = extractNumerical(motionTime, instanceState.config.transitionDuration);
                        instanceState.config.itemStaggerDelay = extractNumerical(itemDelay, instanceState.config.itemStaggerDelay);
                        clearTimeout(instanceState.layoutTriggerTimer);
                        instanceState.layoutTriggerTimer = setTimeout(() => {
                            applyLayout(targetNode, true, onCompletion);
                        }, instanceState.config.layoutRecalculationDelay);
                    },
                    reorderElements: (comparisonFunction, motionStyle, motionTime, itemDelay) => {
                        if (typeof comparisonFunction === 'function') {
                            const currentChildren = Array.from(targetNode.children).filter(child => child.nodeType === 1);
                            currentChildren.sort(comparisonFunction);
                            currentChildren.forEach(child => targetNode.appendChild(child));

                            instanceState.config.transitionStyle = motionStyle || instanceState.config.transitionStyle;
                            instanceState.config.transitionDuration = extractNumerical(motionTime, instanceState.config.transitionDuration);
                            instanceState.config.itemStaggerDelay = extractNumerical(itemDelay, instanceState.config.itemStaggerDelay);
                            clearTimeout(instanceState.layoutTriggerTimer);
                            instanceState.layoutTriggerTimer = setTimeout(() => {
                                applyLayout(targetNode, true);
                            }, instanceState.config.layoutRecalculationDelay);
                        }
                    }
                };
            },
            getAllGridControllers: () => Array.from(targetNodes).map((node, i) => initializeDynamicGrid(containerSelector, configuration).getGridController(i))
        };
    }

    window.DynamicGrid = initializeDynamicGrid;

})();