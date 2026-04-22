(function(hostWindowRef, hostDocumentRef) {

    // --- Core Utility Helpers ---
    const domOperations = {
        isNumeric: function(val) {
            return typeof val === 'number' && !isNaN(val);
        },

        applyElementStyles: function(elem, styles) {
            if (!elem || !styles) return;
            for (const prop in styles) {
                if (Object.prototype.hasOwnProperty.call(styles, prop)) {
                    elem.style[prop] = styles[prop];
                }
            }
        },

        retrieveElementStyle: function(elem, prop) {
            if (!elem) return '';
            return hostWindowRef.getComputedStyle(elem)[prop];
        },

        animateElementTransition: function(elem, targetProps, durationMs, easingFn, onComplete) {
            if (!elem || !targetProps || durationMs <= 0) {
                onComplete && onComplete();
                return;
            }

            const startStyles = {};
            for (const prop in targetProps) {
                if (Object.prototype.hasOwnProperty.call(targetProps, prop)) {
                    startStyles[prop] = parseFloat(domOperations.retrieveElementStyle(elem, prop)) || 0;
                    if (prop === 'transform') {
                        startStyles[prop] = elem.style.transform || 'none';
                    } else if (prop === 'clip') {
                        startStyles[prop] = elem.style.clip || `rect(0px, ${elem.offsetWidth}px, ${elem.offsetHeight}px, 0px)`;
                    }
                }
            }

            const startTime = performance.now();

            function step(currentTime) {
                const elapsed = currentTime - startTime;
                let progress = Math.min(elapsed / durationMs, 1);

                if (typeof easingFn === 'string') {
                    if (easingFn === 'ease-out') {
                        progress = 1 - Math.pow(1 - progress, 3);
                    } else if (easingFn === 'ease-in') {
                        progress = Math.pow(progress, 3);
                    }
                } else if (typeof easingFn === 'function') {
                    progress = easingFn(progress);
                }

                for (const prop in targetProps) {
                    if (Object.prototype.hasOwnProperty.call(targetProps, prop)) {
                        if (prop === 'transform') {
                            const currentTransform = startStyles.transform;
                            const targetTransform = targetProps.transform;

                            // Simple interpolation for translateX/Y
                            const getTranslateValue = (transformStr, axis) => {
                                const match = transformStr.match(new RegExp(`translate${axis}\\(([^)]+)\\)`));
                                return match ? parseFloat(match[1]) || 0 : 0;
                            };

                            const startX = getTranslateValue(currentTransform, 'X');
                            const startY = getTranslateValue(currentTransform, 'Y');
                            const targetX = getTranslateValue(targetTransform, 'X');
                            const targetY = getTranslateValue(targetTransform, 'Y');

                            const currentX = startX + (targetX - startX) * progress;
                            const currentY = startY + (targetY - startY) * progress;

                            elem.style.transform = `translateX(${currentX}px) translateY(${currentY}px)`;

                        } else if (prop === 'clip') {
                            const parseClipRect = (clipStr) => {
                                const match = clipStr.match(/rect\(([^,]+),([^,]+),([^,]+),([^)]+)\)/);
                                if (match) {
                                    return match.slice(1).map(v => parseFloat(v) || 0);
                                }
                                return [0,0,0,0];
                            };

                            const startClip = parseClipRect(startStyles.clip);
                            const targetClip = parseClipRect(targetProps.clip);

                            const interpolatedClip = startClip.map((startVal, i) =>
                                startVal + (targetClip[i] - startVal) * progress
                            );
                            elem.style.clip = `rect(${interpolatedClip[0]}px, ${interpolatedClip[1]}px, ${interpolatedClip[2]}px, ${interpolatedClip[3]}px)`;

                        } else if (prop === 'opacity') {
                            elem.style.opacity = parseFloat(startStyles.opacity || 0) + (targetProps.opacity - parseFloat(startStyles.opacity || 0)) * progress;
                        } else {
                            elem.style[prop] = (parseFloat(startStyles[prop]) + (parseFloat(targetProps[prop]) - parseFloat(startStyles[prop])) * progress) + 'px';
                        }
                    }
                }

                if (progress < 1) {
                    hostWindowRef.requestAnimationFrame(step);
                } else {
                    onComplete && onComplete();
                }
            }

            hostWindowRef.requestAnimationFrame(step);
        },

        getElementOuterWidth: function(elem) {
            if (!elem) return 0;
            const computed = hostWindowRef.getComputedStyle(elem);
            return elem.offsetWidth + parseFloat(computed.marginLeft) + parseFloat(computed.marginRight);
        },

        getElementOuterHeight: function(elem) {
            if (!elem) return 0;
            const computed = hostWindowRef.getComputedStyle(elem);
            return elem.offsetHeight + parseFloat(computed.marginTop) + parseFloat(computed.marginBottom);
        },

        queryElementsByClass: function(context, className) {
            if (!context || !className) return [];
            return Array.from(context.getElementsByClassName(className));
        },

        attachEventHandler: function(target, eventName, selector, handler) {
            if (!target || !eventName || !handler) return;
            if (typeof selector === 'function') {
                target.addEventListener(eventName, selector);
                return () => target.removeEventListener(eventName, selector);
            }

            const delegatedHandler = function(event) {
                let currentTarget = event.target;
                while (currentTarget && currentTarget !== target) {
                    if (currentTarget.matches(selector)) {
                        handler.call(currentTarget, event);
                        break;
                    }
                    currentTarget = currentTarget.parentNode;
                }
            };
            target.addEventListener(eventName, delegatedHandler);
            return () => target.removeEventListener(eventName, delegatedHandler);
        },

        parseHtmlString: function(htmlString) {
            if (!htmlString) return [];
            const tempDiv = hostDocumentRef.createElement('div');
            tempDiv.innerHTML = htmlString.trim();
            return Array.from(tempDiv.children);
        },

        getElementOffset: function(elem) {
            if (!elem) return { top: 0, left: 0 };
            const rect = elem.getBoundingClientRect();
            return {
                top: rect.top + hostWindowRef.pageYOffset,
                left: rect.left + hostWindowRef.pageXOffset
            };
        },

        transitionElementVisibility: function(elem, makeVisible, durationMs, onComplete) {
            if (!elem) { onComplete && onComplete(); return; }
            elem.style.transition = `opacity ${durationMs / 1000}s ease-in-out`;
            elem.style.opacity = makeVisible ? '0' : '1';
            elem.offsetWidth;

            elem.style.opacity = makeVisible ? '1' : '0';

            const transitionEndHandler = () => {
                elem.removeEventListener('transitionend', transitionEndHandler);
                elem.style.transition = '';
                if (!makeVisible) {
                    elem.style.display = 'none';
                }
                onComplete && onComplete();
            };
            elem.addEventListener('transitionend', transitionEndHandler);
            if (durationMs === 0) transitionEndHandler();
            if (!makeVisible) {
                elem.style.display = 'block';
            } else {
                elem.style.display = 'block';
            }
        },

        removeNodeSafely: function(node) {
            if (node && node.parentNode) {
                node.parentNode.removeChild(node);
            }
        },

        checkCssFeatureSupport: function(property) {
            return hostWindowRef.CSS && hostWindowRef.CSS.supports && hostWindowRef.CSS.supports(property);
        },

        iterateNodes: function(nodes, callback) {
            if (!nodes) return;
            for (let i = 0; i < nodes.length; i++) {
                callback(i, nodes[i]);
            }
        },

        classifyNode: function(node, className) {
            node && node.classList && node.classList.add(className);
        },

        declassifyNode: function(node, className) {
            node && node.classList && node.classList.remove(className);
        },

        checkNodeClass: function(node, className) {
            return node && node.classList && node.classList.contains(className);
        },

        composeHtml: function(templateString, data) {
            let result = templateString;
            for (const key in data) {
                if (Object.prototype.hasOwnProperty.call(data, key)) {
                    const placeholder = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
                    result = result.replace(placeholder, data[key]);
                }
            }
            return result;
        }
    };

    // --- Template Markups ---
    const mainContainerMarkup = `
        <div class="main-ui-root">
            <div class="ui-overlay-mask"></div>
        </div>
    `;
    const popupWindowMarkup = `
        <div class="ui-popup-window" style="position: absolute;">
            <div class="ui-popup-content">{{content}}</div>
            <span class="ui-popup-close-btn">×</span>
        </div>
    `;
    const confirmationWindowMarkup = `
        <div class="ui-confirm-content">{{message}}</div>
    `;
    const actionButtonPanelMarkup = `
        <div class="ui-action-buttons">
            <button class="ui-action-confirm">{{confirmText}}</button>
            <button class="ui-action-cancel">{{cancelText}}</button>
        </div>
    `;
    const promptWindowMarkup = `
        <div class="ui-prompt-content">{{promptMessage}}<input type="text" class="ui-prompt-input" value="{{defaultValue}}"></div>
    `;

    // --- Injected Styles ---
    const interfaceCoreStyles = `
        .main-ui-root {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            min-height: 100%;
            pointer-events: none;
        }
        .main-ui-root.animation-active {
            pointer-events: all;
        }
        .main-ui-root.legacy-ie .ui-overlay-mask {
            position: absolute !important;
        }
        .ui-overlay-mask {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-color: rgba(0,0,0,0.5);
            display: none;
            opacity: 0;
            transition: opacity 0.2s ease-in-out;
            pointer-events: auto;
        }
        .ui-popup-window {
            background: #fff;
            border: 1px solid #ccc;
            box-shadow: 0 2px 10px rgba(0,0,0,0.2);
            padding: 15px;
            box-sizing: border-box;
            z-index: 500;
            pointer-events: auto;
        }
        .ui-popup-close-btn {
            position: absolute;
            top: 5px;
            right: 10px;
            font-size: 20px;
            cursor: pointer;
            color: #aaa;
        }
        .ui-popup-close-btn:hover {
            color: #666;
        }
        .auto-closable-root {
            position: relative;
        }
        .ui-action-buttons {
            text-align: right;
            margin-top: 15px;
        }
        .ui-action-buttons button {
            margin-left: 10px;
            padding: 8px 15px;
            cursor: pointer;
            border: 1px solid #ccc;
            background: #eee;
            border-radius: 3px;
        }
        .ui-action-buttons button.ui-action-confirm {
            background: #007bff;
            color: #fff;
            border-color: #007bff;
        }
        .ui-action-buttons button:hover {
            opacity: 0.9;
        }
        .body-muffled {
            filter: blur(5px);
            transition: filter 0.4s ease-out;
        }
    `;

    // --- Feature Detection and Environment Setup ---
    let isLegacyIE = false;
    let isOlderIE = false;
    if (hostWindowRef.navigator.appName === "Microsoft Internet Explorer") {
        const versionMatch = hostWindowRef.navigator.appVersion.split(";")[1];
        if (versionMatch) {
            const version = versionMatch.replace(/[ ]/g, "");
            if (version === "MSIE6.0" || version === "MSIE7.0") {
                isLegacyIE = true;
                isOlderIE = true;
            } else if (version === "MSIE8.0") {
                isOlderIE = true;
            }
        }
    }

    // --- Private Global State ---
    const interfaceRootContainer = domOperations.parseHtmlString(mainContainerMarkup)[0];
    const interfaceBackdrop = domOperations.queryElementsByClass(interfaceRootContainer, 'ui-overlay-mask')[0];
    const documentBody = hostDocumentRef.body;

    let currentDocumentWidth, currentViewportHeight, currentDocumentScrollHeight, currentScrollOffset;
    let scrollableRoot = hostDocumentRef.compatMode === "BackCompat" ? documentBody : hostDocumentRef.documentElement;

    const systemConfiguration = {
        padding: { top: 0, left: 0, bottom: 0, right: 0 },
        baseZIndex: 499
    };

    const activeInterfaceComponents = new Map();

    // --- Core Logic Functions ---

    function updateViewportMetrics() {
        currentScrollOffset = scrollableRoot.scrollTop === 0 ? documentBody.scrollTop : scrollableRoot.scrollTop;
        currentViewportHeight = hostWindowRef.innerHeight || hostDocumentRef.documentElement.clientHeight;
        currentDocumentWidth = hostDocumentRef.documentElement.clientWidth;
        currentDocumentScrollHeight = scrollableRoot.scrollHeight;
    }

    function deregisterComponent(componentId) {
        if (activeInterfaceComponents.has(componentId)) {
            const component = activeInterfaceComponents.get(componentId);
            if (component && component.dom) {
                domOperations.declassifyNode(component.dom, 'auto-closable-root');
            }
            activeInterfaceComponents.delete(componentId);
        }
    }

    function dismissLastAutoClosable() {
        const componentsArray = Array.from(activeInterfaceComponents.values());
        for (let i = componentsArray.length - 1; i >= 0; i--) {
            const component = componentsArray[i];
            if (component && component.isAutoDismissible) {
                component.closeComponent();
                break;
            }
        }
    }

    function getHighestMaskedComponentZIndex() {
        let maxZIndex = 0;
        const componentsArray = Array.from(activeInterfaceComponents.values());
        for (let i = componentsArray.length - 1; i >= 0; i--) {
            const component = componentsArray[i];
            if (component && component.hasBackdrop) {
                const zIndex = parseFloat(domOperations.retrieveElementStyle(component.dom, 'zIndex'));
                if (!isNaN(zIndex) && zIndex > maxZIndex) {
                    maxZIndex = zIndex;
                }
            }
        }
        return maxZIndex;
    }

    let resizeAdaptationTimer;
    function triggerComponentAdaptation() {
        clearTimeout(resizeAdaptationTimer);
        resizeAdaptationTimer = hostWindowRef.setTimeout(() => {
            activeInterfaceComponents.forEach(component => {
                component.repositionComponent();
            });
        }, 150);
    }

    // Global event handlers
    domOperations.attachEventHandler(documentBody, 'mouseup', function handleGlobalMouseUp(event) {
        let clickedElement = event.srcElement || event.target;
        hostWindowRef.setTimeout(() => {
            while (clickedElement && clickedElement !== documentBody) {
                if (domOperations.checkNodeClass(clickedElement, 'auto-closable-root')) {
                    return;
                }
                clickedElement = clickedElement.parentNode;
            }
            dismissLastAutoClosable();
        });
    });

    domOperations.attachEventHandler(documentBody, 'keyup', function handleGlobalKeyUp(event) {
        if (event.keyCode === 27) {
            dismissLastAutoClosable();
        }
    });

    function enableAutoDismiss(componentInstance, shouldEnable) {
        if (shouldEnable) {
            domOperations.classifyNode(componentInstance.dom, 'auto-closable-root');
            componentInstance.isAutoDismissible = true;
        } else {
            domOperations.declassifyNode(componentInstance.dom, 'auto-closable-root');
            componentInstance.isAutoDismissible = false;
        }
    }

    // --- Blur Effect ---
    let applyVisualMuffle, removeVisualMuffle;
    if (domOperations.checkCssFeatureSupport('filter', 'blur(1px)')) {
        const traverseBodyChildren = (callback) => {
            domOperations.iterateNodes(documentBody.children, (idx, child) => {
                if (child !== interfaceRootContainer && child.nodeType === 1 &&
                    child.tagName !== 'SCRIPT' && child.tagName !== 'LINK' && child.tagName !== 'STYLE') {
                    callback(child);
                }
            });
        };
        applyVisualMuffle = () => {
            traverseBodyChildren(child => domOperations.classifyNode(child, 'body-muffled'));
        };
        removeVisualMuffle = () => {
            traverseBodyChildren(child => domOperations.declassifyNode(child, 'body-muffled'));
        };
    }

    // --- Backdrop Management ---
    function displayInterfaceBackdrop(component) {
        const highestZ = getHighestMaskedComponentZIndex();
        domOperations.applyElementStyles(component.dom, {
            zIndex: highestZ + 2
        });
        if (!component.hasBackdrop) {
            return;
        }

        domOperations.applyElementStyles(interfaceBackdrop, {
            zIndex: highestZ + 1
        });

        if (highestZ === 0) {
            applyVisualMuffle && applyVisualMuffle();
            domOperations.transitionElementVisibility(interfaceBackdrop, true, 400);
        }
    }

    function hideInterfaceBackdrop(component) {
        if (!component.hasBackdrop) {
            return;
        }
        const highestZ = getHighestMaskedComponentZIndex();
        domOperations.applyElementStyles(interfaceBackdrop, {
            zIndex: highestZ - 1
        });

        if (highestZ === 0) {
            removeVisualMuffle && removeVisualMuffle();
            domOperations.transitionElementVisibility(interfaceBackdrop, false, 200);
        }
    }

    // --- Position Calculation and Adjustment ---
    function constrainElementPosition(currentTop, currentLeft, elementWidth, elementHeight) {
        const padding = systemConfiguration.padding;
        let finalTop = currentTop, finalLeft = currentLeft;

        if (currentTop < currentScrollOffset + padding.top) {
            finalTop = currentScrollOffset + padding.top;
        } else if (currentTop + elementHeight - currentScrollOffset > currentViewportHeight - padding.bottom) {
            if (elementHeight > currentViewportHeight - padding.top - padding.bottom) {
                finalTop = currentScrollOffset + padding.top;
            } else {
                finalTop = currentScrollOffset + currentViewportHeight - elementHeight - padding.bottom;
            }
        }

        if (currentLeft < padding.left) {
            finalLeft = padding.left;
        } else if (currentLeft + elementWidth > currentDocumentWidth - padding.right) {
            finalLeft = currentDocumentWidth - elementWidth - padding.right;
        }

        return { top: Math.ceil(finalTop), left: Math.ceil(finalLeft) };
    }

    function centerAndConstrainElement(element, positionOptions, animationDuration) {
        const width = domOperations.getElementOuterWidth(element);
        const height = domOperations.getElementOuterHeight(element);
        const centralTop = (currentViewportHeight - height) / 2 + currentScrollOffset;
        const centralLeft = (currentDocumentWidth - width) / 2;
        const newCalculatedPosition = constrainElementPosition(centralTop, centralLeft, width, height);

        const targetStyles = {
            top: domOperations.isNumeric(positionOptions.top) ? positionOptions.top : Math.ceil(newCalculatedPosition.top),
            left: domOperations.isNumeric(positionOptions.left) ? positionOptions.left : Math.ceil(newCalculatedPosition.left)
        };

        if (domOperations.isNumeric(animationDuration)) {
            domOperations.animateElementTransition(element, targetStyles, animationDuration);
        } else {
            domOperations.applyElementStyles(element, targetStyles);
        }
    }

    // --- Animation Helpers ---
    function calculateTransformVector(direction, magnitude) {
        let axis, startValue;
        switch (direction) {
            case 'left':
                axis = 'X';
                startValue = -magnitude;
                break;
            case 'right':
                axis = 'X';
                startValue = magnitude;
                break;
            case 'bottom':
                axis = 'Y';
                startValue = magnitude;
                break;
            default: // 'top'
                axis = 'Y';
                startValue = -magnitude;
        }
        return [axis, startValue];
    }

    // --- Component Class ---
    let componentCounter = 0;
    class InterfaceComponent {
        constructor(elementNode, config) {
            this.id = `comp-${componentCounter++}`;
            this.dom = elementNode;
            this.options = config || {};
            this.closeCallback = null;
            this.isAutoDismissible = false;
            this.hasBackdrop = this.options.showBackdrop !== false;
            this.entryEffect = this.options.entryEffect || 'none';
            this.isDead = false;
            this._boundClose = this.closeComponent.bind(this);
            activeInterfaceComponents.set(this.id, this);
            documentBody.appendChild(this.dom);
        }

        repositionComponent() {
            centerAndConstrainElement(this.dom, {}, 80);
        }

        initiateEntry(onComplete) {
            displayInterfaceBackdrop(this);

            if (isOlderIE || !this.entryEffect || this.entryEffect === 'none') {
                onComplete && onComplete();
                return;
            }

            const element = this.dom;
            const animationDuration = 100;
            const startStyles = { opacity: 0 };
            const targetStyles = { opacity: 1 };

            domOperations.classifyNode(interfaceRootContainer, 'animation-active');

            if (this.entryEffect.tagName && this.entryEffect.parentNode) {
                const sourceOffset = domOperations.getElementOffset(this.entryEffect);
                const currentOffset = domOperations.getElementOffset(element);
                const sourceWidth = domOperations.getElementOuterWidth(this.entryEffect);
                const sourceHeight = domOperations.getElementOuterHeight(this.entryEffect);
                const targetWidth = domOperations.getElementOuterWidth(element);
                const targetHeight = domOperations.getElementOuterHeight(element);

                Object.assign(startStyles, {
                    top: sourceOffset.top,
                    left: sourceOffset.left,
                    clip: `rect(0px, ${sourceWidth}px, ${sourceHeight}px, 0px)`,
                    overflow: 'hidden'
                });
                Object.assign(targetStyles, {
                    top: currentOffset.top,
                    left: currentOffset.left,
                    clip: `rect(0px, ${targetWidth}px, ${targetHeight}px, 0px)`
                });
                domOperations.applyElementStyles(element, { overflow: 'hidden' });
            } else if (typeof this.entryEffect === 'string') {
                const [axis, startValue] = calculateTransformVector(this.entryEffect, 40);
                startStyles.transform = `translate${axis}(${startValue}px)`;
                targetStyles.transform = 'translateX(0) translateY(0)';
            } else {
                onComplete && onComplete();
                return;
            }

            domOperations.applyElementStyles(element, startStyles);

            domOperations.animateElementTransition(element, targetStyles, animationDuration, 'ease-out', () => {
                domOperations.declassifyNode(interfaceRootContainer, 'animation-active');
                domOperations.applyElementStyles(element, { clip: 'auto', overflow: 'visible', transform: 'none' });
                onComplete && onComplete();
            });
        }

        triggerExit(animationDurationOverride, onComplete) {
            if (this.isDead) return;
            this.isDead = true;

            deregisterComponent(this.id);
            this.closeCallback && this.closeCallback();
            hideInterfaceBackdrop(this);

            onComplete && onComplete.call(this);

            const element = this.dom;
            const animationDuration = domOperations.isNumeric(animationDurationOverride) ? animationDurationOverride : 100;

            const removeElement = () => {
                domOperations.declassifyNode(interfaceRootContainer, 'animation-active');
                domOperations.removeNodeSafely(element);
            };

            if (isOlderIE || !this.entryEffect || this.entryEffect === 'none') {
                removeElement();
                return;
            }

            const currentOffset = domOperations.getElementOffset(element);
            const currentWidth = domOperations.getElementOuterWidth(element);
            const currentHeight = domOperations.getElementOuterHeight(element);

            const startStyles = {
                opacity: 1,
                top: currentOffset.top,
                left: currentOffset.left,
                clip: `rect(0px, ${currentWidth}px, ${currentHeight}px, 0px)`
            };
            const targetStyles = { opacity: 0 };

            domOperations.classifyNode(interfaceRootContainer, 'animation-active');

            if (this.entryEffect.tagName && this.entryEffect.parentNode) {
                const sourceOffset = domOperations.getElementOffset(this.entryEffect);
                const sourceWidth = domOperations.getElementOuterWidth(this.entryEffect);
                const sourceHeight = domOperations.getElementOuterHeight(this.entryEffect);
                Object.assign(targetStyles, {
                    top: sourceOffset.top,
                    left: sourceOffset.left,
                    clip: `rect(0px, ${sourceWidth}px, ${sourceHeight}px, 0px)`
                });
                domOperations.applyElementStyles(element, { overflow: 'hidden' });
            } else if (typeof this.entryEffect === 'string') {
                const [axis, startValue] = calculateTransformVector(this.entryEffect, 40);
                Object.assign(targetStyles, {
                    transform: `translate${axis}(${startValue}px)`
                });
            } else {
                removeElement();
                return;
            }

            domOperations.animateElementTransition(element, targetStyles, animationDuration, 'ease-in', removeElement);
        }

        closeComponent() {
            this.triggerExit(null, null);
        }
    }

    // --- Action Button Panel ---
    function attachActionButtons(targetDomElement, options, closeHandler) {
        let confirmAction = null;
        let cancelAction = null;
        let buttonLabels = ['Confirm', 'Cancel'];

        if (typeof options === 'function') {
            confirmAction = options;
        } else if (typeof options === 'object') {
            const btnOpts = options.buttonLabels || [];
            buttonLabels[0] = btnOpts[0] || buttonLabels[0];
            buttonLabels[1] = btnOpts[1] || buttonLabels[1];
            if (typeof options.onConfirm === 'function') {
                confirmAction = options.onConfirm;
            }
            if (typeof options.onCancel === 'function') {
                cancelAction = options.onCancel;
            }
        }

        const buttonPanelHtml = domOperations.composeHtml(actionButtonPanelMarkup, {
            confirmText: buttonLabels[0],
            cancelText: buttonLabels[1]
        });
        const buttonPanel = domOperations.parseHtmlString(buttonPanelHtml)[0];
        targetDomElement.appendChild(buttonPanel);

        domOperations.attachEventHandler(buttonPanel, 'click', '.ui-action-confirm', function() {
            if (confirmAction) {
                (confirmAction() !== false) && closeHandler();
            } else {
                closeHandler();
            }
        });
        domOperations.attachEventHandler(buttonPanel, 'click', '.ui-action-cancel', function() {
            if (cancelAction) {
                (cancelAction() !== false) && closeHandler();
            } else {
                closeHandler();
            }
        });
    }

    // --- Main UI Initialization ---
    function initializeBaseStructure() {
        const injectedStylesheet = hostDocumentRef.createElement('style');
        injectedStylesheet.setAttribute('data-module', 'unified-interface');
        injectedStylesheet.textContent = interfaceCoreStyles;
        hostDocumentRef.head.appendChild(injectedStylesheet);

        documentBody.appendChild(interfaceRootContainer);

        updateViewportMetrics();
        hostWindowRef.setTimeout(updateViewportMetrics, 500);

        if (isOlderIE) {
            domOperations.classifyNode(interfaceRootContainer, 'legacy-ie');
        }

        let responsiveLayoutAdjuster;
        if (isLegacyIE) {
            responsiveLayoutAdjuster = () => {
                updateViewportMetrics();
                triggerComponentAdaptation();
                domOperations.applyElementStyles(interfaceBackdrop, {
                    marginTop: currentScrollOffset + 'px'
                });
            };
        } else {
            domOperations.applyElementStyles(interfaceBackdrop, {
                position: 'fixed',
                top: 0
            });
            responsiveLayoutAdjuster = () => {
                updateViewportMetrics();
                triggerComponentAdaptation();
            };
        }

        domOperations.attachEventHandler(hostWindowRef, 'resize', responsiveLayoutAdjuster);
        domOperations.attachEventHandler(hostWindowRef, 'scroll', responsiveLayoutAdjuster);
    }

    if (hostDocumentRef.readyState === 'loading') {
        hostDocumentRef.addEventListener('DOMContentLoaded', initializeBaseStructure);
    } else {
        initializeBaseStructure();
    }

    // --- Public Interface ---
    const mainUserInterface = {
        showDialog: function(content, options = {}) {
            const dialogHtml = domOperations.composeHtml(popupWindowMarkup, { content: content });
            const dialogElement = domOperations.parseHtmlString(dialogHtml)[0];

            const dialogComponent = new InterfaceComponent(dialogElement, options);
            dialogComponent.closeCallback = options.onClose;

            dialogComponent.initiateEntry(() => {
                dialogComponent.repositionComponent();
            });

            domOperations.attachEventHandler(dialogElement, 'click', '.ui-popup-close-btn', dialogComponent._boundClose);

            if (options.autoDismiss) {
                enableAutoDismiss(dialogComponent, true);
            }

            return dialogComponent;
        },

        displayConfirmation: function(message, options = {}) {
            const confirmHtml = domOperations.composeHtml(confirmationWindowMarkup, { message: message });
            const confirmElement = domOperations.parseHtmlString(confirmHtml)[0];

            const confirmComponent = new InterfaceComponent(confirmElement, options);
            confirmComponent.closeCallback = options.onClose;

            attachActionButtons(confirmElement, {
                buttonLabels: options.buttonLabels,
                onConfirm: options.onConfirm,
                onCancel: options.onCancel
            }, confirmComponent._boundClose);

            confirmComponent.initiateEntry(() => {
                confirmComponent.repositionComponent();
            });

            if (options.autoDismiss) {
                enableAutoDismiss(confirmComponent, true);
            }

            return confirmComponent;
        },
        
        displayPrompt: function(message, defaultValue = '', options = {}) {
            const promptHtml = domOperations.composeHtml(promptWindowMarkup, {
                promptMessage: message,
                defaultValue: defaultValue
            });
            const promptElement = domOperations.parseHtmlString(promptHtml)[0];

            const promptComponent = new InterfaceComponent(promptElement, options);
            promptComponent.closeCallback = options.onClose;

            const inputField = domOperations.queryElementsByClass(promptElement, 'ui-prompt-input')[0];

            attachActionButtons(promptElement, {
                buttonLabels: options.buttonLabels,
                onConfirm: () => {
                    if (options.onConfirm) {
                        return options.onConfirm(inputField.value);
                    }
                },
                onCancel: options.onCancel
            }, promptComponent._boundClose);

            promptComponent.initiateEntry(() => {
                promptComponent.repositionComponent();
                inputField && inputField.focus();
            });

            if (options.autoDismiss) {
                enableAutoDismiss(promptComponent, true);
            }

            return promptComponent;
        }
    };

    hostWindowRef.UnifiedInterface = hostWindowRef.UnifiedInterface || mainUserInterface;

    hostWindowRef.define && hostWindowRef.define(function() {
        return mainUserInterface;
    });

})(window, document);