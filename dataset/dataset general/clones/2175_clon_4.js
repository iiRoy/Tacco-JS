(function() {
    "use strict";

    const _isFunction = (val) => typeof val === 'function';
    const _noop = () => {};

    const _transitionEffect = (domElement, durationMillis, finalOpacity, onFinish) => {
        if (!domElement) {
            onFinish && onFinish();
            return;
        }

        domElement.style.transition = `opacity ${durationMillis}ms ease-in-out`;
        domElement.style.opacity = finalOpacity;

        const transitionEndListener = () => {
            domElement.removeEventListener('transitionend', transitionEndListener);
            if (finalOpacity === 0) {
                domElement.style.display = 'none';
            }
            onFinish && onFinish();
        };

        domElement.addEventListener('transitionend', transitionEndListener);

        // Fallback in case transitionend doesn't fire (e.g., element was display:none or very fast transition)
        setTimeout(() => {
            if (parseFloat(domElement.style.opacity) !== finalOpacity) {
                domElement.style.opacity = finalOpacity;
            }
            if (finalOpacity === 0 && domElement.style.display !== 'none') {
                domElement.style.display = 'none';
            }
            onFinish && onFinish();
        }, durationMillis + 50);
    };

    const _elementDataStore = new WeakMap();

    const _defaultConfiguration = {
        mainContent:  '<h1>Loading...</h1>',
        caption: null,
        allowMove: false,
        useSkin: false,
        contentStyling: {
            padding:	'0px',
            margin:		'0px',
            width:		'30%',
            top:		'40%',
            left:		'35%',
            textAlign:	'center',
            color:		'#000',
            border:		'3px solid #aaa',
            backgroundColor:'#fff',
            cursor:		'wait'
        },
        skinContentStyling: {
            width:	'30%',
            top:	'40%',
            left:	'35%'
        },
        curtainStyling:  {
            backgroundColor:	'#000',
            opacity:			0.6,
            cursor:				'wait'
        },
        restoreCursor: 'default',
        notificationStyling: {
            width:		'350px',
            top:		'10px',
            left:		'',
            right:		'10px',
            border:		'none',
            padding:	'5px',
            opacity:	0.6,
            cursor:		'default',
            color:		'#fff',
            backgroundColor: '#000',
            borderRadius:'10px'
        },
        framePath: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
        forceFrameLayer: false,
        baseZDepth: 1000,
        centerHorizontal: true,
        centerVertical: true,
        expandBody: true,
        interceptEvents: true,
        constrainFocus: true,
        entryAnimationDuration:  200,
        exitAnimationDuration:  400,
        autoDismissDelay: 0,
        showCurtain: true,
        setFocusToInput: true,
        focusableControlSelectors: 'input:enabled:visible,textarea:enabled:visible,select:enabled:visible',
        onEntryComplete: null,
        onExitComplete: null,
        onCurtainClick: null,
        ieLegacyOffset: 4,
        contentWrapperClass: 'overlayMessage',
        preventIfAlreadyActive: false
    };

    const _deepMerge = (target, source) => {
        const output = { ...target };
        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key])) {
                    output[key] = _deepMerge(target[key] || {}, source[key]);
                } else {
                    output[key] = source[key];
                }
            }
        }
        return output;
    };

    const _applyInlineStyles = (element, styles) => {
        for (const prop in styles) {
            if (Object.prototype.hasOwnProperty.call(styles, prop)) {
                const cssProp = prop.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
                element.style.setProperty(cssProp, styles[prop]);
            }
        }
    };

    const _isLegacyIE = () => {
        const userAgent = navigator.userAgent;
        const ieIndex = userAgent.indexOf('MSIE ');
        if (ieIndex > -0 || !!userAgent.match(/Trident.*rv\:11\./)) {
            const version = parseInt(userAgent.substring(ieIndex + 5, userAgent.indexOf('.', ieIndex)), 10);
            return version <= 9;
        }
        return false;
    };

    const _positionAndDisplayLayers = (targetElement, suppliedOptions) => {
        const isGlobal = (targetElement === window || targetElement === document.body || targetElement === document.documentElement);
        const activeOptions = _deepMerge(_defaultConfiguration, suppliedOptions || {});

        if (_elementDataStore.has(targetElement) && activeOptions.preventIfAlreadyActive) {
            return;
        }

        if (isGlobal && _elementDataStore.has(window)) {
            _removeLayers(window, { exitAnimationDuration: 0 });
        }

        let originalContentState = null;
        if (activeOptions.mainContent && typeof activeOptions.mainContent !== 'string' && (activeOptions.mainContent.parentNode || activeOptions.mainContent instanceof Element)) {
            const contentNode = activeOptions.mainContent instanceof Element ? activeOptions.mainContent : activeOptions.mainContent[0];
            if (contentNode && contentNode.parentNode) {
                originalContentState = {
                    node: contentNode,
                    parent: contentNode.parentNode,
                    display: contentNode.style.display,
                    position: contentNode.style.position
                };
                contentNode.parentNode.removeChild(contentNode);
            }
        }

        const currentElementState = {
            contentRestoreInfo: originalContentState,
            exitCallback: activeOptions.onExitComplete,
            dismissTimerId: null,
            activeLayers: [],
            initialPosition: null
        };
        _elementDataStore.set(targetElement, currentElementState);

        if (!isGlobal) {
            if (window.getComputedStyle(targetElement).position === 'static') {
                currentElementState.initialPosition = 'static';
                targetElement.style.position = 'relative';
            }
            targetElement.style.zoom = 1;
        }

        let currentZIndex = activeOptions.baseZDepth;

        const iframeLayer = document.createElement((_isLegacyIE() || activeOptions.forceFrameLayer) ? 'iframe' : 'div');
        iframeLayer.className = 'uiShield frameLayer';
        _applyInlineStyles(iframeLayer, {
            zIndex: currentZIndex++,
            display: 'none',
            border: 'none',
            margin: '0',
            padding: '0',
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: '0',
            left: '0'
        });
        if (_isLegacyIE() || activeOptions.forceFrameLayer) {
            iframeLayer.src = activeOptions.framePath;
            _applyInlineStyles(iframeLayer, { opacity: 0 });
        }
        currentElementState.activeLayers.push(iframeLayer);

        const overlayLayer = document.createElement('div');
        overlayLayer.className = `uiShield backgroundLayer ${activeOptions.useSkin ? 'ui-widget-overlay' : ''}`;
        _applyInlineStyles(overlayLayer, {
            zIndex: currentZIndex++,
            display: 'none',
            border: 'none',
            margin: '0',
            padding: '0',
            width: '100%',
            height: '100%',
            top: '0',
            left: '0'
        });
        _applyInlineStyles(overlayLayer, activeOptions.curtainStyling);
        _applyInlineStyles(overlayLayer, { position: isGlobal ? 'fixed' : 'absolute' });
        if (activeOptions.onCurtainClick) {
            overlayLayer.style.cursor = 'pointer';
            overlayLayer.addEventListener('click', activeOptions.onCurtainClick);
        }
        currentElementState.activeLayers.push(overlayLayer);

        const messageWrapper = document.createElement('div');
        messageWrapper.className = `uiShield ${activeOptions.contentWrapperClass} ${isGlobal ? 'globalShield' : 'elementShield'} ${activeOptions.useSkin ? 'ui-dialog ui-widget ui-corner-all' : ''}`;
        _applyInlineStyles(messageWrapper, {
            zIndex: currentZIndex + 10,
            display: 'none',
            position: isGlobal ? 'fixed' : 'absolute'
        });

        let messageContentTarget = messageWrapper;
        if (activeOptions.useSkin) {
            if (activeOptions.caption) {
                const captionBar = document.createElement('div');
                captionBar.className = 'ui-widget-header ui-dialog-titlebar ui-corner-all shieldCaption';
                captionBar.innerHTML = activeOptions.caption;
                messageWrapper.appendChild(captionBar);
            }
            const contentContainer = document.createElement('div');
            contentContainer.className = 'ui-widget-content ui-dialog-content';
            messageWrapper.appendChild(contentContainer);
            messageContentTarget = contentContainer;
            _applyInlineStyles(messageWrapper, activeOptions.skinContentStyling);
            messageWrapper.classList.add('ui-widget-content');
        } else {
            _applyInlineStyles(messageWrapper, activeOptions.contentStyling);
        }
        currentElementState.activeLayers.push(messageWrapper);

        const targetParentNode = isGlobal ? document.body : targetElement;
        currentElementState.activeLayers.forEach(layer => targetParentNode.appendChild(layer));

        if (activeOptions.mainContent) {
            if (typeof activeOptions.mainContent === 'string') {
                messageContentTarget.innerHTML = activeOptions.mainContent;
            } else if (activeOptions.mainContent instanceof Element) {
                messageContentTarget.appendChild(activeOptions.mainContent);
                activeOptions.mainContent.style.display = '';
            }
        }

        // Centering logic using modern CSS transforms
        const _alignElement = (el, hCenter, vCenter) => {
            if (!el) return;
            el.style.left = '50%';
            el.style.top = '50%';
            el.style.transform = `translate(-50%, -50%)`;
            el.style.margin = '0';
        };
        _alignElement(messageWrapper, activeOptions.centerHorizontal, activeOptions.centerVertical);

        // Display layers with fade
        const layersToFade = currentElementState.activeLayers.filter(layer => layer !== iframeLayer || activeOptions.showCurtain);
        let completedFadeCount = 0;

        const onLayerFadeComplete = () => {
            completedFadeCount++;
            if (completedFadeCount === layersToFade.length) {
                if (_isFunction(activeOptions.onEntryComplete)) {
                    activeOptions.onEntryComplete();
                }
            }
        };

        layersToFade.forEach(layer => {
            layer.style.opacity = 0;
            layer.style.display = '';

            if (activeOptions.entryAnimationDuration > 0) {
                _transitionEffect(layer, activeOptions.entryAnimationDuration, parseFloat(layer.style.opacity) || 1, onLayerFadeComplete);
            } else {
                layer.style.opacity = parseFloat(layer.style.opacity) || 1;
                layer.style.display = '';
                onLayerFadeComplete();
            }
        });

        _manageInteractions(1, targetElement, activeOptions);

        if (isGlobal && activeOptions.setFocusToInput) {
            setTimeout(() => {
                const focusable = messageWrapper.querySelector(activeOptions.focusableControlSelectors);
                if (focusable) focusable.focus();
            }, 20);
        }

        if (activeOptions.autoDismissDelay > 0) {
            currentElementState.dismissTimerId = setTimeout(() => {
                _removeLayers(targetElement, activeOptions);
            }, activeOptions.autoDismissDelay);
        }
    };

    const _removeLayers = (targetElement, suppliedOptions) => {
        const isGlobal = (targetElement === window || targetElement === document.body || targetElement === document.documentElement);
        const activeOptions = _deepMerge(_defaultConfiguration, suppliedOptions || {});
        const currentElementState = _elementDataStore.get(targetElement);

        if (!currentElementState) return;

        if (currentElementState.dismissTimerId) {
            clearTimeout(currentElementState.dismissTimerId);
            currentElementState.dismissTimerId = null;
        }

        _manageInteractions(0, targetElement, activeOptions);

        const layersToUnmount = currentElementState.activeLayers;
        let completedFadeOutCount = 0;

        const onLayerFadeOutComplete = () => {
            completedFadeOutCount++;
            if (completedFadeOutCount === layersToUnmount.length) {
                layersToUnmount.forEach(layer => {
                    if (layer.parentNode) {
                        layer.parentNode.removeChild(layer);
                    }
                });

                if (currentElementState.contentRestoreInfo && currentElementState.contentRestoreInfo.parent) {
                    const { node, parent, display, position } = currentElementState.contentRestoreInfo;
                    parent.appendChild(node);
                    node.style.display = display;
                    node.style.position = position;
                }

                if (!isGlobal && currentElementState.initialPosition === 'static') {
                    targetElement.style.position = 'static';
                }

                if (_isFunction(currentElementState.exitCallback)) {
                    currentElementState.exitCallback(targetElement, activeOptions);
                }
                _elementDataStore.delete(targetElement);
            }
        };

        if (activeOptions.exitAnimationDuration === 0) {
            layersToUnmount.forEach(layer => {
                if (layer.parentNode) {
                    layer.parentNode.removeChild(layer);
                }
            });
            completedFadeOutCount = layersToUnmount.length - 1; // Adjust for immediate completion
            onLayerFadeOutComplete();
        } else {
            layersToUnmount.forEach(layer => {
                if (activeOptions.restoreCursor) {
                    layer.style.cursor = activeOptions.restoreCursor;
                }
                _transitionEffect(layer, activeOptions.exitAnimationDuration, 0, onLayerFadeOutComplete);
            });
        }
    };

    const _eventRegistry = new WeakMap();

    const _manageInteractions = (action, targetElement, options) => {
        if (!options.interceptEvents) return;

        if (action === 1) { // Bind
            const handlers = {};
            const keyPressHandler = (e) => {
                if (options.constrainFocus && e.keyCode === 9) {
                    const currentActiveElement = document.activeElement;
                    const messageBox = targetElement === window ? document.querySelector(`.uiShield.${options.contentWrapperClass}.globalShield`) : targetElement.querySelector(`.uiShield.${options.contentWrapperClass}.elementShield`);
                    if (messageBox) {
                        const focusableControls = Array.from(messageBox.querySelectorAll(options.focusableControlSelectors));
                        if (focusableControls.length > 0) {
                            const firstControl = focusableControls[0];
                            const lastControl = focusableControls[focusableControls.length - 1];
                            if (currentActiveElement === lastControl && !e.shiftKey) {
                                firstControl.focus();
                                e.preventDefault();
                            } else if (currentActiveElement === firstControl && e.shiftKey) {
                                lastControl.focus();
                                e.preventDefault();
                            } else if (!messageBox.contains(currentActiveElement)) {
                                firstControl.focus();
                                e.preventDefault();
                            }
                        }
                    }
                }
            };
            document.addEventListener('keydown', keyPressHandler);
            handlers.keydown = keyPressHandler;
            _eventRegistry.set(targetElement, handlers);
        } else { // Unbind
            const handlers = _eventRegistry.get(targetElement);
            if (handlers && handlers.keydown) {
                document.removeEventListener('keydown', handlers.keydown);
                _eventRegistry.delete(targetElement);
            }
        }
    };

    const _displayMomentaryNotification = (headline, bodyText, displayTimeout, onNotificationClose) => {
        const notificationContainer = document.createElement('div');
        notificationContainer.className = 'momentaryNotifier';
        if (headline) {
            const headingContent = document.createElement('h1');
            headingContent.textContent = headline;
            notificationContainer.appendChild(headingContent);
        }
        if (bodyText) {
            const bodyContent = document.createElement('h2');
            bodyContent.textContent = bodyText;
            notificationContainer.appendChild(bodyContent);
        }

        const initialTimeout = displayTimeout === undefined ? 3000 : displayTimeout;
        let notificationOptions = _deepMerge(_defaultConfiguration, {
            mainContent: notificationContainer,
            entryAnimationDuration: 700,
            exitAnimationDuration: 1000,
            autoDismissDelay: initialTimeout,
            centerVertical: false,
            showCurtain: false,
            onExitComplete: onNotificationClose,
            contentStyling: _defaultConfiguration.notificationStyling
        });

        const originalOpacity = notificationOptions.contentStyling.opacity;

        const activateNotificationDisplay = (opts) => {
            notificationOptions = _deepMerge(notificationOptions, opts || {});
            _positionAndDisplayLayers(window, notificationOptions);
        };

        activateNotificationDisplay();

        notificationContainer.addEventListener('mouseover', () => {
            activateNotificationDisplay({
                entryAnimationDuration: 0,
                autoDismissDelay: 30000
            });

            const currentMessageBox = document.querySelector(`.uiShield.${notificationOptions.contentWrapperClass}.globalShield`);
            if (currentMessageBox) {
                currentMessageBox.style.transition = 'none';
                currentMessageBox.style.opacity = 1;
            }
        });

        notificationContainer.addEventListener('mouseout', () => {
            const currentMessageBox = document.querySelector(`.uiShield.${notificationOptions.contentWrapperClass}.globalShield`);
            if (currentMessageBox) {
                 _transitionEffect(currentMessageBox, 1000, originalOpacity, _noop);
            }
        });
    };

    const UIManifest = {
        revision: 2.60,
        pageShield: (opts) => {
            _positionAndDisplayLayers(window, opts);
        },
        pageUnshield: (opts) => {
            _removeLayers(window, opts);
        },
        showToast: (title, message, duration, onCompletion) => {
            _displayMomentaryNotification(title, message, duration, onCompletion);
        },
        config: _defaultConfiguration
    };

    Object.defineProperty(Element.prototype, 'contentShield', {
        value: function(opts) {
            const elementOptions = _deepMerge(_defaultConfiguration, opts || {});
            if (elementOptions.preventIfAlreadyActive && _elementDataStore.has(this)) {
                return this;
            }
            _removeLayers(this, { exitAnimationDuration: 0 });
            _positionAndDisplayLayers(this, opts);
            return this;
        },
        writable: true,
        configurable: true
    });

    Object.defineProperty(Element.prototype, 'contentUnshield', {
        value: function(opts) {
            _removeLayers(this, opts);
            return this;
        },
        writable: true,
        configurable: true
    });

    window.UIManifest = UIManifest;

})();