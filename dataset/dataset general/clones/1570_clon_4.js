(function() {
    "use strict";

    var ScreenShield = {};

    const shieldedItemRegistry = new Map();
    const activeNotices = new Set(); 

    ScreenShield.preferences = {
        dialogContent:  '<h1>Please standby...</h1>',
        label: null,
        moveable: true,
        designScheme: false,
        
        contentBoxStyles: {
            padding: '0', margin: '0', width: '30%', top: '40%', left: '35%',
            textAlign: 'center', color: '#000', border: '3px solid #aaa',
            backgroundColor: '#fff', cursor: 'wait', position: 'fixed'
        },

        themedContentBoxStyles: {
            width: '30%', top: '40%', left: '35%', position: 'fixed'
        },

        backgroundLayerStyles: {
            backgroundColor: '#000', opacity: 0.6, cursor: 'wait',
            position: 'fixed', top: '0', left: '0', right: '0', bottom: '0'
        },

        pointerRestore: 'default',

        notificationBoxStyles: {
            width: '350px', top: '10px', right: '10px', border: 'none',
            padding: '5px', opacity: 0.6, cursor: 'default', color: '#fff',
            backgroundColor: '#000', borderRadius: '10px',
            position: 'fixed', zIndex: 999999
        },

        frameSource: /^https/i.test(window.location.href || '') ? 'javascript:false' : 'about:blank',
        enforceFrame: false,

        baseZIndex: 1000,

        centerH: true,
        centerV: true,

        allowPageExpansion: true,

        disableUserInteraction: true,
        restrictTabTraversal: true,

        showDuration: 200,
        hideDuration: 400,
        autoDismissDelay: 0,

        displayBackground: true,
        autoFocusInput: true,
        capturableElements: 'input, select, textarea, button, a',

        onDisplay: null,
        onDismiss: null,
        onBackgroundClick: null,

        blockIdentifier: 'shield-active',
        ignoreIfAlreadyShielded: false
    };

    function combineObjects(...sources) {
        return Object.assign({}, ...sources);
    }

    function performFade(element, duration, toOpacity, callback) {
        if (!element) {
            if (callback) callback();
            return;
        }
        element.style.transition = `opacity ${duration}ms ease-in-out`;
        element.style.opacity = toOpacity;

        const onTransitionEnd = () => {
            element.removeEventListener('transitionend', onTransitionEnd);
            if (callback) callback();
        };
        element.addEventListener('transitionend', onTransitionEnd);
    }

    function getCurrentStyle(element, property) {
        return window.getComputedStyle(element).getPropertyValue(property);
    }

    function reCenterMessage(messageElement, horizontal, vertical, isPageBlock) {
        if (!messageElement) return;

        if (isPageBlock) {
            Object.assign(messageElement.style, {
                position: 'fixed',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                margin: '0'
            });
        } else {
            Object.assign(messageElement.style, {
                position: 'absolute',
                left: '50%',
                top: '50%',
                transform: 'translate(-50%, -50%)',
                margin: '0'
            });
        }
    }

    function manageEvents(action, target, configData) {
        const eventHandlers = shieldedItemRegistry.get(target)?.eventHandlers || {};
        const method = action === 'add' ? 'addEventListener' : 'removeEventListener';

        if (configData.disableUserInteraction) {
            const tabHandler = eventHandlers.tabKey || function(e) {
                if (e.keyCode && e.keyCode === 9) {
                    const activeElements = Array.from(target.querySelectorAll(ScreenShield.preferences.capturableElements)).filter(el => el.offsetParent !== null);
                    if (activeElements.length === 0) {
                        e.preventDefault();
                        return;
                    }
                    const focused = document.activeElement;
                    const first = activeElements[0];
                    const last = activeElements[activeElements.length - 1];
                    if (focused === last && !e.shiftKey) {
                        first.focus();
                        e.preventDefault();
                    } else if (focused === first && e.shiftKey) {
                        last.focus();
                        e.preventDefault();
                    }
                }
            };
            target[method]('keydown', tabHandler, true);
            eventHandlers.tabKey = tabHandler;
        }

        if (configData.onBackgroundClick) {
            const bgElement = shieldedItemRegistry.get(target)?.backgroundLayer;
            if (bgElement) {
                const clickHandler = eventHandlers.bgClick || function(e) {
                    if (e.target === bgElement) {
                        configData.onBackgroundClick.call(target, e);
                    }
                };
                bgElement[method]('click', clickHandler);
                eventHandlers.bgClick = clickHandler;
            }
        }
        
        if (action === 'add') {
            if (!shieldedItemRegistry.has(target)) {
                shieldedItemRegistry.set(target, {});
            }
            shieldedItemRegistry.get(target).eventHandlers = eventHandlers;
        } else {
            const data = shieldedItemRegistry.get(target);
            if (data) data.eventHandlers = {};
        }
    }

    function applyShield(targetElement, options) {
        const isPageTarget = (targetElement === window || targetElement === document.body || targetElement === document.documentElement);
        const effectiveTarget = isPageTarget ? document.body : targetElement;

        let currentConfig = combineObjects(ScreenShield.preferences, options);

        if (currentConfig.ignoreIfAlreadyShielded && shieldedItemRegistry.has(effectiveTarget) && shieldedItemRegistry.get(effectiveTarget).isShielded) {
            return;
        }

        dismissShield(targetElement, { hideDuration: 0 });

        const originalState = {};
        if (!isPageTarget && getCurrentStyle(effectiveTarget, 'position') === 'static') {
            originalState.position = 'static';
            effectiveTarget.style.position = 'relative';
            shieldedItemRegistry.set(effectiveTarget, { originalPositionStatic: true });
        }

        let currentZ = currentConfig.baseZIndex;

        let frameLayer = null;
        if (currentConfig.enforceFrame) {
            frameLayer = document.createElement('iframe');
            Object.assign(frameLayer.style, {
                zIndex: currentZ++, display: 'none', border: 'none', margin: '0', padding: '0',
                position: 'absolute', width: '100%', height: '100%', top: '0', left: '0',
                opacity: '0',
                background: 'transparent',
                src: currentConfig.frameSource
            });
            frameLayer.classList.add('shield-frame');
        }

        const backgroundLayer = document.createElement('div');
        Object.assign(backgroundLayer.style, combineObjects(
            ScreenShield.preferences.backgroundLayerStyles,
            currentConfig.backgroundLayerStyles,
            currentConfig.onBackgroundClick ? { cursor: 'pointer' } : {}
        ));
        backgroundLayer.style.zIndex = currentZ++;
        backgroundLayer.style.display = 'none';
        backgroundLayer.classList.add('shield-overlay');

        const contentBox = document.createElement('div');
        let contentStyles = currentConfig.designScheme ? ScreenShield.preferences.themedContentBoxStyles : ScreenShield.preferences.contentBoxStyles;
        contentStyles = combineObjects(contentStyles, currentConfig.contentBoxStyles);

        Object.assign(contentBox.style, contentStyles);
        contentBox.style.zIndex = currentZ + 10;
        contentBox.style.display = 'none';
        contentBox.classList.add(currentConfig.blockIdentifier);

        if (currentConfig.designScheme) {
            contentBox.classList.add('ui-dialog', 'ui-widget', 'ui-corner-all');
            if (currentConfig.label) {
                const titleBar = document.createElement('div');
                titleBar.classList.add('ui-widget-header', 'ui-dialog-titlebar', 'ui-corner-all', 'shield-title');
                titleBar.innerHTML = currentConfig.label || '&nbsp;';
                contentBox.appendChild(titleBar);
            }
            const contentContainer = document.createElement('div');
            contentContainer.classList.add('ui-widget-content', 'ui-dialog-content');
            contentBox.appendChild(contentContainer);
            if (currentConfig.dialogContent) {
                if (typeof currentConfig.dialogContent === 'string') {
                    contentContainer.innerHTML += currentConfig.dialogContent;
                } else {
                    contentContainer.appendChild(currentConfig.dialogContent);
                }
            }
        } else {
            if (currentConfig.dialogContent) {
                if (typeof currentConfig.dialogContent === 'string') {
                    contentBox.innerHTML += currentConfig.dialogContent;
                } else {
                    contentBox.appendChild(currentConfig.dialogContent);
                }
            }
        }

        const layers = [frameLayer, backgroundLayer, contentBox].filter(Boolean);
        layers.forEach(layer => effectiveTarget.appendChild(layer));

        if (currentConfig.designScheme && currentConfig.moveable && typeof window.Draggable !== 'undefined') {
            new window.Draggable(contentBox, { handle: '.shield-title' });
        }

        shieldedItemRegistry.set(effectiveTarget, {
            isShielded: true,
            frameLayer: frameLayer,
            backgroundLayer: backgroundLayer,
            contentBox: contentBox,
            originalDisplay: effectiveTarget.style.display,
            originalPosition: effectiveTarget.style.position,
            config: currentConfig,
            timeoutId: null,
            eventHandlers: {}
        });

        if (currentConfig.showDuration > 0) {
            if (currentConfig.displayBackground) {
                performFade(backgroundLayer, currentConfig.showDuration, currentConfig.backgroundLayerStyles.opacity, currentConfig.dialogContent ? null : currentConfig.onDisplay);
            }
            if (currentConfig.dialogContent) {
                performFade(contentBox, currentConfig.showDuration, 1, currentConfig.onDisplay);
            }
        } else {
            if (currentConfig.displayBackground) {
                backgroundLayer.style.display = 'block';
                backgroundLayer.style.opacity = currentConfig.backgroundLayerStyles.opacity;
            }
            if (currentConfig.dialogContent) {
                contentBox.style.display = 'block';
                contentBox.style.opacity = 1;
            }
            if (currentConfig.onDisplay) {
                currentConfig.onDisplay.call(contentBox);
            }
        }
        if (frameLayer) {
            frameLayer.style.display = 'block';
        }

        if (currentConfig.centerH || currentConfig.centerV) {
            reCenterMessage(contentBox, currentConfig.centerH, currentConfig.centerV, isPageTarget);
        }

        manageEvents('add', effectiveTarget, currentConfig);

        if (isPageTarget && currentConfig.autoFocusInput) {
            setTimeout(() => {
                const focusable = contentBox.querySelector(ScreenShield.preferences.capturableElements);
                if (focusable) focusable.focus();
            }, 20);
        }

        if (currentConfig.autoDismissDelay > 0) {
            const timeoutId = setTimeout(() => {
                dismissShield(targetElement, options);
            }, currentConfig.autoDismissDelay);
            shieldedItemRegistry.get(effectiveTarget).timeoutId = timeoutId;
        }
    }

    function dismissShield(targetElement, options) {
        const isPageTarget = (targetElement === window || targetElement === document.body || targetElement === document.documentElement);
        const effectiveTarget = isPageTarget ? document.body : targetElement;

        const storedData = shieldedItemRegistry.get(effectiveTarget);
        if (!storedData || !storedData.isShielded) {
            return;
        }

        const currentConfig = combineObjects(storedData.config, options);

        if (storedData.timeoutId) {
            clearTimeout(storedData.timeoutId);
            storedData.timeoutId = null;
        }

        manageEvents('remove', effectiveTarget, currentConfig);

        const layers = [storedData.frameLayer, storedData.backgroundLayer, storedData.contentBox].filter(Boolean);

        layers.forEach(layer => {
            if (layer && layer.style && currentConfig.pointerRestore) {
                layer.style.cursor = currentConfig.pointerRestore;
            }
        });

        const onComplete = () => {
            layers.forEach(layer => {
                if (layer && layer.parentNode) {
                    layer.parentNode.removeChild(layer);
                }
            });

            if (storedData.originalPositionStatic) {
                effectiveTarget.style.position = storedData.originalPosition;
            }

            if (currentConfig.onDismiss) {
                currentConfig.onDismiss.call(effectiveTarget, effectiveTarget, currentConfig);
            }
            shieldedItemRegistry.delete(effectiveTarget);
        };

        if (currentConfig.hideDuration > 0) {
            let layersToFade = layers.length;
            if (layersToFade === 0) {
                onComplete();
                return;
            }
            layers.forEach(layer => {
                if (layer) {
                    performFade(layer, currentConfig.hideDuration, 0, () => {
                        layersToFade--;
                        if (layersToFade === 0) {
                            onComplete();
                        }
                    });
                } else {
                    layersToFade--;
                }
            });
        } else {
            onComplete();
        }
    }

    ScreenShield.protectPage = function(opts) {
        applyShield(window, opts);
    };

    ScreenShield.releasePage = function(opts) {
        dismissShield(window, opts);
    };

    ScreenShield.displayNotice = function(caption, contentText, durationMs, onNoticeDismiss) {
        const noticeContainer = document.createElement('div');
        noticeContainer.classList.add('transient-notice');
        Object.assign(noticeContainer.style, ScreenShield.preferences.notificationBoxStyles);

        if (caption) {
            const titleEl = document.createElement('h1');
            titleEl.textContent = caption;
            noticeContainer.appendChild(titleEl);
        }
        if (contentText) {
            const contentEl = document.createElement('h2');
            contentEl.textContent = contentText;
            noticeContainer.appendChild(contentEl);
        }

        let currentDuration = durationMs === undefined ? 3000 : durationMs;
        const initialOpacity = ScreenShield.preferences.notificationBoxStyles.opacity;
        
        let noticeTimeoutId;

        const showNotice = (overrideOptions) => {
            const config = combineObjects(ScreenShield.preferences, {
                dialogContent: noticeContainer,
                showDuration: typeof overrideOptions?.showDuration !== 'undefined' ? overrideOptions.showDuration : 700,
                hideDuration: typeof overrideOptions?.hideDuration !== 'undefined' ? overrideOptions.hideDuration : 1000,
                autoDismissDelay: typeof overrideOptions?.autoDismissDelay !== 'undefined' ? overrideOptions.autoDismissDelay : currentDuration,
                centerV: false,
                displayBackground: false,
                onDismiss: onNoticeDismiss,
                contentBoxStyles: ScreenShield.preferences.notificationBoxStyles
            });

            applyShield(document.body, config);

            const createdContentBox = shieldedItemRegistry.get(document.body)?.contentBox;
            if (createdContentBox) {
                createdContentBox.style.position = 'fixed';
                Object.assign(createdContentBox.style, ScreenShield.preferences.notificationBoxStyles);
                createdContentBox.style.opacity = initialOpacity;
            }

            activeNotices.add(noticeContainer);
            if (noticeTimeoutId) clearTimeout(noticeTimeoutId);
            if (config.autoDismissDelay > 0) {
                noticeTimeoutId = setTimeout(() => {
                    dismissShield(document.body, config);
                    activeNotices.delete(noticeContainer);
                }, config.autoDismissDelay);
            }
            
            if (createdContentBox) {
                shieldedItemRegistry.get(document.body).noticeTimeoutId = noticeTimeoutId;
            }
        };

        showNotice();

        noticeContainer.addEventListener('mouseover', function() {
            if (noticeTimeoutId) clearTimeout(noticeTimeoutId);
            const createdContentBox = shieldedItemRegistry.get(document.body)?.contentBox;
            if (createdContentBox) {
                performFade(createdContentBox, 300, 1);
                const currentShieldData = shieldedItemRegistry.get(document.body);
                if (currentShieldData && currentShieldData.noticeTimeoutId) {
                    clearTimeout(currentShieldData.noticeTimeoutId);
                    currentShieldData.noticeTimeoutId = setTimeout(() => {
                        dismissShield(document.body, { hideDuration: 1000, onDismiss: onNoticeDismiss });
                        activeNotices.delete(noticeContainer);
                    }, 30000);
                }
            }
        });

        noticeContainer.addEventListener('mouseout', function() {
            const createdContentBox = shieldedItemRegistry.get(document.body)?.contentBox;
            if (createdContentBox) {
                performFade(createdContentBox, 1000, 0, () => {
                    dismissShield(document.body, { hideDuration: 0, onDismiss: onNoticeDismiss });
                    activeNotices.delete(noticeContainer);
                });
            }
        });
    };

    ScreenShield.protectElements = function(selectorOrElements, opts) {
        let elements = [];
        if (typeof selectorOrElements === 'string') {
            elements = Array.from(document.querySelectorAll(selectorOrElements));
        } else if (selectorOrElements instanceof HTMLElement) {
            elements = [selectorOrElements];
        } else if (Array.isArray(selectorOrElements) || selectorOrElements instanceof NodeList) {
            elements = Array.from(selectorOrElements);
        } else if (selectorOrElements && typeof selectorOrElements.jquery !== 'undefined') {
             elements = Array.from(selectorOrElements);
        }

        elements.forEach(element => {
            if (element === window) {
                ScreenShield.protectPage(opts);
            } else {
                applyShield(element, opts);
            }
        });
    };

    ScreenShield.releaseElements = function(selectorOrElements, opts) {
        let elements = [];
        if (typeof selectorOrElements === 'string') {
            elements = Array.from(document.querySelectorAll(selectorOrElements));
        } else if (selectorOrElements instanceof HTMLElement) {
            elements = [selectorOrElements];
        } else if (Array.isArray(selectorOrElements) || selectorOrElements instanceof NodeList) {
            elements = Array.from(selectorOrElements);
        } else if (selectorOrElements && typeof selectorOrElements.jquery !== 'undefined') {
            elements = Array.from(selectorOrElements);
        }

        elements.forEach(element => {
            if (element === window) {
                ScreenShield.releasePage(opts);
            } else {
                dismissShield(element, opts);
            }
        });
    };

    window.UIProtector = ScreenShield;

})();