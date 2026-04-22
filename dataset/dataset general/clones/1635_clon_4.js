const PointerMonitor = (() => {
    let absolutePointerX = 0;
    let absolutePointerY = 0;

    const updateCoordinates = (evt) => {
        absolutePointerX = evt.clientX;
        absolutePointerY = evt.clientY;
    };

    document.addEventListener('mousemove', updateCoordinates);

    return {
        retrieveX: () => absolutePointerX,
        retrieveY: () => absolutePointerY
    };
})();

class ElementEffectManager {
    constructor(collectionNodes, effectCleanups = []) {
        this._managedNodes = Array.from(collectionNodes);
        this._activeEffectCleanups = effectCleanups;
    }

    _applyEffectAndCaptureCleanup(effectLogicFn) {
        const generatedCleanups = [];
        this._managedNodes.forEach(targetNode => {
            const cleanupTask = effectLogicFn(targetNode);
            if (typeof cleanupTask === 'function') {
                generatedCleanups.push(cleanupTask);
            }
        });
        return new ElementEffectManager(this._managedNodes, generatedCleanups);
    }

    followPointer() {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            const handlePointerMove = () => {
                const currentAbsoluteX = PointerMonitor.retrieveX();
                const currentAbsoluteY = PointerMonitor.retrieveY();
                const currentScrollX = window.scrollX || window.pageXOffset;
                const currentScrollY = window.scrollY || window.pageYOffset;

                const nodeWidth = targetNode.offsetWidth;
                const nodeHeight = targetNode.offsetHeight;

                const calculatedScrollX = (currentAbsoluteX - currentScrollX) * (nodeWidth / 700);
                const calculatedScrollY = (currentAbsoluteY - currentScrollY) * (nodeHeight / 700);

                window.scroll(calculatedScrollX, calculatedScrollY);
            };
            targetNode.addEventListener('mousemove', handlePointerMove);
            return () => {
                targetNode.removeEventListener('mousemove', handlePointerMove);
            };
        });
    }

    flashCursor(pulseDuration = 300, displayCursor = 'default') {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            let visibilityToggle = false;
            const initialCursorStyle = targetNode.style.cursor;

            const toggleDisplay = () => {
                if (visibilityToggle) {
                    targetNode.style.cursor = displayCursor;
                    visibilityToggle = false;
                } else {
                    targetNode.style.cursor = 'none';
                    visibilityToggle = true;
                }
            };
            const timerId = setInterval(toggleDisplay, pulseDuration);
            return () => {
                clearInterval(timerId);
                targetNode.style.cursor = initialCursorStyle;
            };
        });
    }

    temporaryCursor(newCursor = 'pointer', delayMilliseconds = 300, restoreOption = null) {
        this._managedNodes.forEach(targetNode => {
            const originalStyle = targetNode.style.cursor;
            setTimeout(() => {
                targetNode.style.cursor = newCursor;
                if (restoreOption !== null) {
                    setTimeout(() => {
                        targetNode.style.cursor = (typeof restoreOption === 'string') ? restoreOption : originalStyle;
                    }, delayMilliseconds);
                }
            }, delayMilliseconds);
        });
        return new ElementEffectManager(this._managedNodes, []);
    }

    alternatingCursor(firstStyle, secondStyle, pulseDuration = 300) {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            let currentToggleState = false;
            const originalCursor = targetNode.style.cursor;

            const cycleCursor = () => {
                if (currentToggleState) {
                    targetNode.style.cursor = secondStyle;
                    currentToggleState = false;
                } else {
                    targetNode.style.cursor = firstStyle;
                    currentToggleState = true;
                }
            };
            const timerId = setInterval(cycleCursor, pulseDuration);
            return () => {
                clearInterval(timerId);
                targetNode.style.cursor = originalCursor;
            };
        });
    }

    _renderCursorShape(drawingContext, fillColor = 'black') {
        drawingContext.fillStyle = fillColor;
        drawingContext.beginPath();
        drawingContext.moveTo(0, 0);
        drawingContext.lineTo(13.5, 14);
        drawingContext.lineTo(8, 14.5);
        drawingContext.lineTo(10, 20);
        drawingContext.lineTo(8, 20.5);
        drawingContext.lineTo(5, 15.5);
        drawingContext.lineTo(0, 18.5);
        drawingContext.lineTo(0, 0);
        drawingContext.fill();
    }

    pointerShadow(xOffset = 0, yOffset = 0, hue = 'black', renderDelay = 0, customEffect = null, cssIdentifier = null) {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            const shadowCanvasElement = document.createElement('canvas');
            shadowCanvasElement.setAttribute('width', '14');
            shadowCanvasElement.setAttribute('height', '21');
            shadowCanvasElement.style.position = 'absolute';
            shadowCanvasElement.style.display = 'none';
            shadowCanvasElement.style.pointerEvents = 'none';
            if (cssIdentifier) shadowCanvasElement.className = cssIdentifier;

            const ctx = shadowCanvasElement.getContext('2d');
            this._renderCursorShape(ctx, hue);

            targetNode.appendChild(shadowCanvasElement);

            const showOnEnter = () => { shadowCanvasElement.style.display = 'block'; };
            const trackPosition = () => {
                setTimeout(() => {
                    shadowCanvasElement.style.top = (PointerMonitor.retrieveY() + yOffset + 1) + 'px';
                    shadowCanvasElement.style.left = (PointerMonitor.retrieveX() + xOffset + 1) + 'px';
                }, renderDelay);
            };
            const hideOnLeave = () => { shadowCanvasElement.style.display = 'none'; };

            targetNode.addEventListener('mouseover', showOnEnter);
            targetNode.addEventListener('mousemove', trackPosition);
            targetNode.addEventListener('mouseleave', hideOnLeave);

            const effectSpecificCleanups = [];
            if (customEffect) {
                const effectHandler = CursorFX.customEffects.shadow[customEffect.name];
                if (effectHandler) {
                    const effectCleanup = effectHandler(shadowCanvasElement, customEffect);
                    if (effectCleanup && typeof effectCleanup === 'function') {
                        effectSpecificCleanups.push(effectCleanup);
                    }
                }
            }

            return () => {
                targetNode.removeEventListener('mouseover', showOnEnter);
                targetNode.removeEventListener('mousemove', trackPosition);
                targetNode.removeEventListener('mouseleave', hideOnLeave);
                if (shadowCanvasElement.parentNode === targetNode) {
                    targetNode.removeChild(shadowCanvasElement);
                }
                effectSpecificCleanups.forEach(fn => fn());
            };
        });
    }

    floatingText(content, visualStyles = {}, xOffset = 0, yOffset = 0, customEffect = null, cssIdentifier = null) {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            const textDisplayElement = document.createElement('span');
            textDisplayElement.innerHTML = content;
            textDisplayElement.style.position = 'absolute';
            textDisplayElement.style.display = 'none';
            textDisplayElement.style.pointerEvents = 'none';
            textDisplayElement.className = 'cursorfx-text';
            if (cssIdentifier) textDisplayElement.className = cssIdentifier;

            Object.keys(visualStyles).forEach(prop => {
                textDisplayElement.style[prop] = visualStyles[prop];
            });

            targetNode.appendChild(textDisplayElement);

            const showOnEnter = () => { textDisplayElement.style.display = 'block'; };
            const trackPosition = () => {
                textDisplayElement.style.top = (PointerMonitor.retrieveY() + 21 + yOffset) + 'px';
                textDisplayElement.style.left = (PointerMonitor.retrieveX() + 14 + xOffset) + 'px';
            };
            const hideOnLeave = () => { textDisplayElement.style.display = 'none'; };

            targetNode.addEventListener('mouseover', showOnEnter);
            targetNode.addEventListener('mousemove', trackPosition);
            targetNode.addEventListener('mouseleave', hideOnLeave);

            const effectSpecificCleanups = [];
            if (customEffect) {
                const effectHandler = CursorFX.customEffects.text[customEffect.name];
                if (effectHandler) {
                    const effectCleanup = effectHandler(textDisplayElement, customEffect);
                    if (effectCleanup && typeof effectCleanup === 'function') {
                        effectSpecificCleanups.push(effectCleanup);
                    }
                }
            }

            return () => {
                targetNode.removeEventListener('mouseover', showOnEnter);
                targetNode.removeEventListener('mousemove', trackPosition);
                targetNode.removeEventListener('mouseleave', hideOnLeave);
                if (textDisplayElement.parentNode === targetNode) {
                    targetNode.removeChild(textDisplayElement);
                }
                effectSpecificCleanups.forEach(fn => fn());
            };
        });
    }

    floatingImage(sourceUrl, visualStyles = {}, xOffset = 0, yOffset = 0, customEffect = null, cssIdentifier = null) {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            const imageDisplayElement = document.createElement('img');
            imageDisplayElement.setAttribute('src', sourceUrl);
            imageDisplayElement.style.position = 'absolute';
            imageDisplayElement.style.display = 'none';
            imageDisplayElement.style.pointerEvents = 'none';
            imageDisplayElement.className = 'cursorfx-image';
            if (cssIdentifier) imageDisplayElement.className = cssIdentifier;

            Object.keys(visualStyles).forEach(prop => {
                imageDisplayElement.style[prop] = visualStyles[prop];
            });

            targetNode.appendChild(imageDisplayElement);

            const showOnEnter = () => { imageDisplayElement.style.display = 'block'; };
            const trackPosition = () => {
                imageDisplayElement.style.top = (PointerMonitor.retrieveY() + 21 + yOffset) + 'px';
                imageDisplayElement.style.left = (PointerMonitor.retrieveX() + 14 + xOffset) + 'px';
            };
            const hideOnLeave = () => { imageDisplayElement.style.display = 'none'; };

            targetNode.addEventListener('mouseover', showOnEnter);
            targetNode.addEventListener('mousemove', trackPosition);
            targetNode.addEventListener('mouseleave', hideOnLeave);

            const effectSpecificCleanups = [];
            if (customEffect) {
                const effectHandler = CursorFX.customEffects.image[customEffect.name];
                if (effectHandler) {
                    const effectCleanup = effectHandler(imageDisplayElement, customEffect);
                    if (effectCleanup && typeof effectCleanup === 'function') {
                        effectSpecificCleanups.push(effectCleanup);
                    }
                }
            }

            return () => {
                targetNode.removeEventListener('mouseover', showOnEnter);
                targetNode.removeEventListener('mousemove', trackPosition);
                targetNode.removeEventListener('mouseleave', hideOnLeave);
                if (imageDisplayElement.parentNode === targetNode) {
                    targetNode.removeChild(imageDisplayElement);
                }
                effectSpecificCleanups.forEach(fn => fn());
            };
        });
    }

    onHover(eventCallback) {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            targetNode.addEventListener('mouseover', eventCallback);
            return () => {
                targetNode.removeEventListener('mouseover', eventCallback);
            };
        });
    }

    onClick(eventCallback) {
        return this._applyEffectAndCaptureCleanup(targetNode => {
            targetNode.addEventListener('click', eventCallback);
            return () => {
                targetNode.removeEventListener('click', eventCallback);
            };
        });
    }

    getAbsolutePointer() {
        return {
            x: PointerMonitor.retrieveX(),
            y: PointerMonitor.retrieveY()
        };
    }

    getRelativePointer() {
        if (this._managedNodes.length === 0) {
            return { x: 0, y: 0 };
        }
        const firstNode = this._managedNodes[0];
        const rect = firstNode.getBoundingClientRect();
        return {
            x: PointerMonitor.retrieveX() - rect.left,
            y: PointerMonitor.retrieveY() - rect.top
        };
    }

    deactivateEffects() {
        this._activeEffectCleanups.forEach(cleanupAction => cleanupAction());
        this._activeEffectCleanups = [];
        return this;
    }
}

const CursorFX = (selectionInput) => {
    let nodesToManage;
    if (typeof selectionInput === 'string') {
        nodesToManage = document.querySelectorAll(selectionInput);
    } else if (selectionInput instanceof HTMLElement) {
        nodesToManage = [selectionInput];
    } else {
        nodesToManage = [document.body];
    }
    return new ElementEffectManager(nodesToManage);
};

CursorFX.customEffects = {
    shadow: {},
    text: {},
    image: {}
};

CursorFX.customEffects.text.pulsateFont = (targetElement, options = {}) => {
    let currentFontSize = parseInt(targetElement.style.fontSize) || 14;
    let isGrowing = true;

    const minFont = 11 + (options.min || 0);
    const maxFont = 25 + (options.max || 0);
    const cycleSpeed = 30 + (options.speed || 0);

    const performPulsation = () => {
        if (isGrowing) {
            if (currentFontSize < maxFont) {
                currentFontSize++;
                targetElement.style.fontSize = currentFontSize + 'px';
            } else {
                isGrowing = false;
            }
        } else {
            if (currentFontSize > minFont) {
                currentFontSize--;
                targetElement.style.fontSize = currentFontSize + 'px';
            } else {
                isGrowing = true;
            }
        }
    };

    const intervalHandle = setInterval(performPulsation, cycleSpeed);

    return () => {
        clearInterval(intervalHandle);
    };
};