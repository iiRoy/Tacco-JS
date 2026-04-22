var OrbitalDisplay = (function() {
    "use strict";

    // --- Utility Functions ---
    var deepMerge = function(target, source) {
        var output = Object.assign({}, target);
        if (target && source) {
            Object.keys(source).forEach(function(key) {
                if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                    if (!(key in target)) {
                        Object.assign(output, { [key]: source[key] });
                    } else {
                        output[key] = deepMerge(target[key], source[key]);
                    }
                } else {
                    Object.assign(output, { [key]: source[key] });
                }
            });
        }
        return output;
    };

    var camelToKebab = function(str) {
        return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2').toLowerCase();
    };

    var createEl = function(tag, classes, attributes, innerHTML) {
        var el = document.createElement(tag);
        if (classes) {
            (Array.isArray(classes) ? classes : [classes]).forEach(function(cls) {
                el.classList.add(cls);
            });
        }
        if (attributes) {
            for (var key in attributes) {
                el.setAttribute(key, attributes[key]);
            }
        }
        if (innerHTML !== undefined) {
            el.innerHTML = innerHTML;
        }
        return el;
    };

    var safelyParseJSON = function(str) {
        try {
            return JSON.parse(str);
        } catch (e) {
            return str;
        }
    };

    var isPromiseLike = function(obj) {
        return obj && typeof obj.then === 'function';
    };

    var callHooks = function(hooks, context, event) {
        if (!Array.isArray(hooks)) {
            hooks = [hooks];
        }
        for (var i = 0; i < hooks.length; i++) {
            if (typeof hooks[i] === 'function' && hooks[i].call(context, event) === false) {
                return false;
            }
        }
        return true;
    };

    // --- Global State and Configuration ---
    var _globalCounter = 0;
    var _activePanels = new Set();
    var _globalListenersActive = false;

    var _defaultOptions = {
        identityPrefix: 'orbital',
        dataAttribute: 'data-orbital',
        variantClass: null,
        clearStyles: false,
        containerElement: null, // Custom DOM for wrapper
        activationEvent: 'click',
        dismissEvent: 'click',
        eventFilter: null,
        rootElement: 'body',
        openTransitionDuration: 250,
        closeTransitionDuration: 250,
        dismissOn: 'background', // 'background', 'anywhere', false
        dismissOnEscape: true,
        closeSymbol: '&#10005;',
        preloaderHTML: '',
        otherDismissSelectors: null,
        beforeOpening: [],
        beforeContentLoad: [],
        beforeClosing: [],
        afterOpening: [],
        afterContentLoad: [],
        afterClosing: [],
        onKeyboardInput: [],
        onViewportResize: [],
        contentTypeHint: null,
        contentHandlers: [], // List of handler names to use
        functionAttributes: ['beforeOpening', 'afterOpening', 'beforeContentLoad', 'afterContentLoad', 'beforeClosing', 'afterClosing', 'onKeyboardInput', 'onViewportResize']
    };

    var _contentProcessors = {
        element: {
            matcher: function(content) { return content instanceof Element; },
            processor: function(content) { return Promise.resolve(content.cloneNode(true)); }
        },
        image: {
            matcher: function(content) { return /\.(png|jpg|jpeg|gif|tiff|bmp)(\?\S*)?$/i.test(content); },
            processor: function(url) {
                var self = this;
                return new Promise(function(resolve, reject) {
                    var img = new Image();
                    img.onload = function() {
                        var imgEl = createEl('img', self.settings.identityPrefix + '-image', { src: url, alt: '' });
                        imgEl.dataset.naturalWidth = img.naturalWidth;
                        imgEl.dataset.naturalHeight = img.naturalHeight;
                        resolve(imgEl);
                    };
                    img.onerror = function() { reject(new Error('Image failed to load: ' + url)); };
                    img.src = url;
                });
            }
        },
        markup: {
            matcher: function(content) { return /^\s*<[\w!][^<]*>/i.test(content); },
            processor: function(htmlString) {
                var container = createEl('div');
                container.innerHTML = htmlString;
                // Return actual nodes, not the container itself
                return Promise.resolve(container.children.length > 1 ? Array.from(container.children) : container.firstElementChild);
            }
        },
        remote: {
            matcher: function(content) { return /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(content); }, // Basic URL check
            processor: function(url) {
                var self = this;
                return fetch(url)
                    .then(function(response) {
                        if (!response.ok) {
                            throw new Error('HTTP error, status = ' + response.status);
                        }
                        return response.text();
                    })
                    .then(function(html) {
                        var container = createEl('div');
                        container.innerHTML = html;
                        return container; // Return the container with loaded content
                    });
            }
        },
        frame: {
            matcher: function(content) { return /^(https?:\/\/[^\s$.?#].[^\s]*)$/i.test(content); }, // Same as remote for now
            processor: function(url) {
                var self = this;
                return new Promise(function(resolve) {
                    var frameEl = createEl('iframe', null, { src: url });

                    // Apply iframe specific styles
                    var frameStyles = {};
                    for (var key in self.settings) {
                        if (key.startsWith('frame') && key !== 'frame') {
                            frameStyles[camelToKebab(key.substring(5))] = self.settings[key];
                        }
                    }
                    Object.assign(frameEl.style, frameStyles);

                    frameEl.onload = function() { resolve(frameEl); };
                    // Immediately append to ensure it loads in place as iframe cannot be moved easily
                    self.dom.body.appendChild(frameEl); // Temporarily append to allow loading
                });
            }
        },
        plainText: {
            matcher: function() { return true; }, // Default if nothing else matches
            processor: function(text) { return Promise.resolve(createEl('div', null, null, text)); }
        }
    };

    // --- Global Event Handling ---
    var _globalEventHandler = function(event) {
        var panels = Array.from(_activePanels).reverse(); // Latest panel gets priority
        panels.every(function(panel) {
            if (event.defaultPrevented) return false;

            var handlerResult;
            if (event.type === 'keyup') {
                handlerResult = callHooks(panel.settings.onKeyboardInput, panel, event);
            } else if (event.type === 'resize') {
                handlerResult = callHooks(panel.settings.onViewportResize, panel, event);
            }

            if (handlerResult === false) {
                event.preventDefault();
                event.stopPropagation();
            }
            return true;
        });
    };

    var updateGlobalListeners = function(enable) {
        if (enable === _globalListenersActive) return;

        var eventNamespace = '.' + _defaultOptions.identityPrefix; // Use a common namespace for global events
        var keyupEvent = 'keyup' + eventNamespace;
        var resizeEvent = 'resize' + eventNamespace;

        if (enable) {
            window.addEventListener('keyup', _globalEventHandler);
            window.addEventListener('resize', _globalEventHandler);
        } else {
            window.removeEventListener('keyup', _globalEventHandler);
            window.removeEventListener('resize', _globalEventHandler);
        }
        _globalListenersActive = enable;
    };

    // --- OrbitalPanel Factory Function ---
    var createOrbitalPanel = function(contentSource, options) {
        var currentOptions = deepMerge(_defaultOptions, options || {});
        var panelId = _globalCounter++;
        var instanceRoot = null; // Will hold the main wrapper element

        var instance = {
            id: panelId,
            settings: currentOptions,
            dom: {}, // References to DOM elements
            triggerElement: null,
            currentContentElement: null,

            // --- Internal DOM Manipulation ---
            _createStructure: function() {
                var prefix = this.settings.identityPrefix;
                var baseClass = this.settings.clearStyles ? prefix + '-reset' : prefix;

                var wrapper = createEl('div', [baseClass + '-wrapper', prefix + '-busy', this.settings.variantClass].filter(Boolean));
                var body = createEl('div', prefix + '-body');
                var closeBtn = createEl('span', [prefix + '-closer', prefix + '-close'], null, this.settings.closeSymbol);
                var pane = createEl('div', prefix + '-pane', null, this.settings.preloaderHTML);

                body.appendChild(closeBtn);
                body.appendChild(pane);
                wrapper.appendChild(body);

                if (this.settings.containerElement) {
                    var customContainer = this.settings.containerElement.cloneNode(true);
                    // Find a suitable place to insert body and close button
                    var innerTarget = customContainer.querySelector('.' + prefix + '-inner') || customContainer;
                    innerTarget.appendChild(body.firstElementChild); // closeBtn
                    innerTarget.appendChild(body.lastElementChild); // pane
                    wrapper.appendChild(customContainer);
                } else {
                    wrapper.appendChild(body);
                }

                this.dom = { wrapper: wrapper, body: body, closer: closeBtn, pane: pane };
                instanceRoot = wrapper;
            },

            // --- Event Binding for this instance ---
            _bindInstanceEvents: function() {
                var self = this;
                var prefix = self.settings.identityPrefix;
                var dismissSelectors = '.' + prefix + '-close';
                if (self.settings.otherDismissSelectors) {
                    dismissSelectors += ',' + self.settings.otherDismissSelectors;
                }

                self.dom.wrapper.addEventListener(self.settings.dismissEvent, function(event) {
                    var target = event.target;
                    var shouldDismiss = false;

                    if (self.settings.dismissOn === 'anywhere') {
                        shouldDismiss = true;
                    } else if (self.settings.dismissOn === 'background' && target === self.dom.wrapper) {
                        shouldDismiss = true;
                    } else if (target.closest(dismissSelectors)) {
                        shouldDismiss = true;
                    }

                    if (shouldDismiss) {
                        event.preventDefault();
                        self.hide();
                    }
                });
            },

            // --- Content Loading ---
            _resolveContent: function() {
                var self = this;
                var contentData = self.settings.content || contentSource;
                var resolvedContentPromise;

                // Check explicit type hint first
                var handlerName = self.settings.contentTypeHint;
                if (handlerName && _contentProcessors[handlerName]) {
                    resolvedContentPromise = _contentProcessors[handlerName].processor.call(self, contentData);
                }

                // If no explicit type or handler, try auto-detection
                if (!resolvedContentPromise) {
                    var handlersToUse = self.settings.contentHandlers.length > 0 ?
                                        self.settings.contentHandlers :
                                        Object.keys(_contentProcessors);

                    for (var i = 0; i < handlersToUse.length; i++) {
                        var proc = _contentProcessors[handlersToUse[i]];
                        if (proc && proc.matcher(contentData)) {
                            resolvedContentPromise = proc.processor.call(self, contentData);
                            break;
                        }
                    }
                }

                if (!resolvedContentPromise) {
                    console.error('OrbitalDisplay: No content processor found for', contentData);
                    return Promise.reject(new Error('No content processor'));
                }

                return resolvedContentPromise;
            },

            // --- Public Methods ---
            show: function(event) {
                var self = this;
                if (!callHooks(self.settings.beforeOpening, self, event)) {
                    return Promise.reject(new Error('Opening prevented by hook'));
                }

                if (event) event.preventDefault();

                self._createStructure();
                self._bindInstanceEvents();

                document.querySelector(self.settings.rootElement).appendChild(self.dom.wrapper);
                _activePanels.add(self);
                updateGlobalListeners(true);

                // Start transition
                setTimeout(function() {
                    self.dom.wrapper.classList.add(self.settings.identityPrefix + '-active');
                }, 10); // Small delay to allow DOM render before transition

                callHooks(self.settings.beforeContentLoad, self, event);

                var contentPromise = self._resolveContent();

                return Promise.resolve(contentPromise)
                    .then(function(contentEl) {
                        if (self.currentContentElement) {
                            self.dom.pane.innerHTML = ''; // Clear previous content
                        }
                        if (Array.isArray(contentEl)) { // If multiple nodes returned
                            contentEl.forEach(function(node) { self.dom.pane.appendChild(node); });
                        } else if (contentEl) {
                            self.dom.pane.appendChild(contentEl);
                        }
                        self.currentContentElement = contentEl;

                        // Add specific class if iframe
                        if (contentEl && contentEl.tagName === 'IFRAME') {
                            self.dom.wrapper.classList.add(self.settings.identityPrefix + '-frame');
                        }

                        self.dom.wrapper.classList.remove(self.settings.identityPrefix + '-busy'); // Content loaded
                        callHooks(self.settings.afterContentLoad, self, event);
                        callHooks(self.settings.afterOpening, self, event);
                        return self;
                    })
                    .catch(function(error) {
                        console.error('OrbitalDisplay content error:', error);
                        self.hide(); // Close if content fails to load
                        return Promise.reject(error);
                    });
            },

            hide: function(event) {
                var self = this;
                if (!callHooks(self.settings.beforeClosing, self, event)) {
                    return Promise.reject(new Error('Closing prevented by hook'));
                }

                var deferred = Promise.resolve();
                if (_activePanels.has(self)) {
                    self.dom.wrapper.classList.remove(self.settings.identityPrefix + '-active');

                    deferred = new Promise(function(resolve) {
                        setTimeout(function() {
                            if (self.dom.wrapper && self.dom.wrapper.parentNode) {
                                self.dom.wrapper.parentNode.removeChild(self.dom.wrapper);
                            }
                            _activePanels.delete(self);
                            if (_activePanels.size === 0) {
                                updateGlobalListeners(false);
                            }
                            callHooks(self.settings.afterClosing, self, event);
                            resolve();
                        }, self.settings.closeTransitionDuration);
                    });
                }
                return deferred;
            },

            // --- Global Event Handlers for this specific instance ---
            onKeyboardInput: function(event) {
                if (event.keyCode === 27 && this.settings.dismissOnEscape) { // ESC key
                    this.dom.wrapper.querySelector('.' + this.settings.identityPrefix + '-close').click();
                    return false; // Prevent further handling
                }
                return true;
            },

            onViewportResize: function() {
                // Image resizing logic (from original)
                var contentEl = this.currentContentElement;
                if (contentEl && contentEl.tagName === 'IMG' && contentEl.dataset.naturalWidth) {
                    var naturalWidth = parseInt(contentEl.dataset.naturalWidth, 10);
                    var naturalHeight = parseInt(contentEl.dataset.naturalHeight, 10);

                    contentEl.style.width = '';
                    contentEl.style.height = '';

                    // The original Featherlight has more complex logic here involving parent dimensions
                    // For Type IV, we'll keep it simple and just reset, assuming CSS handles responsive behavior.
                    // If more detailed behavior is required, it would involve calculating available space.
                }
            }
        };

        // Add instance-specific global event handlers
        instance.settings.onKeyboardInput.unshift(instance.onKeyboardInput);
        instance.settings.onViewportResize.unshift(instance.onViewportResize);

        return instance;
    };

    // --- Public API for OrbitalDisplay ---
    var OrbitalDisplayAPI = {
        options: _defaultOptions,
        contentProcessors: _contentProcessors,
        activePanels: _activePanels, // Expose for debugging/inspection

        // Main factory function
        create: function(content, config) {
            return createOrbitalPanel(content, config);
        },

        // Attaches event listeners to elements to open a panel
        bindTriggers: function(selector, content, config) {
            var currentConfig = deepMerge(_defaultOptions, config || {});
            var self = this;

            document.querySelectorAll(selector).forEach(function(element) {
                element.addEventListener(currentConfig.activationEvent, function(event) {
                    if (currentConfig.eventFilter && !event.target.matches(currentConfig.eventFilter)) {
                        return;
                    }

                    var elementSpecificConfig = {};
                    // Read data attributes from the element
                    for (var key in element.dataset) {
                        var configKey = camelToKebab(key).replace(new RegExp('^' + currentConfig.identityPrefix + '-'), '');
                        if (configKey && configKey !== 'orbital') { // Avoid 'data-orbital' itself
                            var value = element.dataset[key];
                            if (_defaultOptions.functionAttributes.includes(configKey)) {
                                // jshint -W054: new Function is used per original behavior
                                value = new Function(value);
                                // jshint +W054
                            } else {
                                value = safelyParseJSON(value);
                            }
                            elementSpecificConfig[configKey] = value;
                        }
                    }

                    var finalConfig = deepMerge(currentConfig, elementSpecificConfig);
                    finalConfig.triggerElement = element; // Store trigger element

                    var panelContent = content || element.getAttribute(finalConfig.dataAttribute) || element.href;
                    if (!panelContent) panelContent = element.textContent; // Fallback to text content

                    var panel = createOrbitalPanel(panelContent, finalConfig);
                    panel.show(event);
                });
            });
        },

        // Gets the most recently opened panel
        getTopPanel: function() {
            var panelsArray = Array.from(_activePanels);
            return panelsArray.length > 0 ? panelsArray[panelsArray.length - 1] : null;
        },

        // Closes the most recently opened panel
        closeTopPanel: function() {
            var panel = this.getTopPanel();
            if (panel) {
                return panel.hide();
            }
            return Promise.resolve();
        },

        // Auto-binding on initial load
        _autoBind: function() {
            var autoBindSelector = _defaultOptions.dataAttribute;
            if (autoBindSelector) {
                OrbitalDisplayAPI.bindTriggers('[' + autoBindSelector + ']');
            }
        }
    };

    // Run auto-bind when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', OrbitalDisplayAPI._autoBind);
    } else {
        OrbitalDisplayAPI._autoBind();
    }

    return OrbitalDisplayAPI;
})();