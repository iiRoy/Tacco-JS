(function (globalWindow, pageDocument, undefinedValue) {
    "use strict";

    // Custom utility object to replace jQuery-like functionalities
    var CustomUtils = (function () {
        // Custom DOM Element Wrapper constructor
        function ElementWrapper(selectorOrElement) {
            if (typeof selectorOrElement === 'string') {
                this.elements = Array.from(pageDocument.querySelectorAll(selectorOrElement));
            } else if (selectorOrElement instanceof Element || selectorOrElement === pageDocument || selectorOrElement === globalWindow) {
                this.elements = [selectorOrElement];
            } else if (Array.isArray(selectorOrElement)) {
                this.elements = selectorOrElement;
            } else {
                this.elements = [];
            }
            this.length = this.elements.length;
        }

        // Prototype methods for ElementWrapper (mimicking jQuery methods)
        ElementWrapper.prototype.get = function (index) { return this.elements[index || 0]; };
        ElementWrapper.prototype.data = function (key) { return this.elements[0] ? this.elements[0].getAttribute('data-' + key) : undefinedValue; };
        ElementWrapper.prototype.attr = function (key) { return this.elements[0] ? this.elements[0].getAttribute(key) : undefinedValue; };
        ElementWrapper.prototype.prop = function (key) { return this.elements[0] ? this.elements[0][key] : undefinedValue; };
        ElementWrapper.prototype.remove = function () { this.elements.forEach(function (el) { el.parentNode && el.parentNode.removeChild(el); }); return this; };
        ElementWrapper.prototype.addClass = function (className) { this.elements.forEach(function (el) { el.classList.add(className); }); return this; };
        ElementWrapper.prototype.removeClass = function (className) { this.elements.forEach(function (el) { el.classList.remove(className); }); return this; };
        ElementWrapper.prototype.stop = function (clearQueue, jumpToEnd) { /* Dummy for animation stop */ return this; };
        ElementWrapper.prototype.on = function (events, handler) {
            var self = this;
            events.split(' ').forEach(function (eventName) {
                self.elements.forEach(function (el) { el.addEventListener(eventName, handler); });
            });
            return this;
        };
        ElementWrapper.prototype.off = function (events, handler) {
            var self = this;
            events.split(' ').forEach(function (eventName) {
                self.elements.forEach(function (el) { el.removeEventListener(eventName, handler); });
            });
            return this;
        };
        // Custom event handler for 'onReset' (mimics original's custom event usage)
        ElementWrapper.prototype.onReset = function(handler) { /* This would typically bind a custom event */ return this; };

        // Deep merge utility (mimicking $.extend(true, ...))
        var deepMerge = function () {
            var options, name, src, copy, copyIsArray, clone,
                target = arguments[0] || {},
                i = 1,
                length = arguments.length,
                deep = false;

            if (typeof target === "boolean") {
                deep = target;
                target = arguments[1] || {};
                i = 2;
            }

            if (typeof target !== "object" && typeof target !== "function") {
                target = {};
            }

            for (; i < length; i++) {
                if ((options = arguments[i]) != null) {
                    for (name in options) {
                        src = target[name];
                        copy = options[name];

                        if (target === copy) {
                            continue;
                        }

                        if (deep && copy && (CustomUtils.isPlainObject(copy) || (copyIsArray = Array.isArray(copy)))) {
                            if (copyIsArray) {
                                copyIsArray = false;
                                clone = src && Array.isArray(src) ? src : [];
                            } else {
                                clone = src && CustomUtils.isPlainObject(src) ? src : {};
                            }
                            target[name] = deepMerge(deep, clone, copy);
                        } else if (copy !== undefinedValue) {
                            target[name] = copy;
                        }
                    }
                }
            }
            return target;
        };

        // The main utility function (replaces '$')
        var CustomUtils = function (selectorOrElement) {
            return new ElementWrapper(selectorOrElement);
        };

        // Static methods for CustomUtils (mimicking jQuery static methods)
        CustomUtils.ElementWrapper = ElementWrapper; // Expose for instanceof checks
        CustomUtils.extend = deepMerge;
        CustomUtils.isPlainObject = function (obj) { return obj !== null && typeof obj === 'object' && obj.constructor === Object; };
        CustomUtils.noop = function () { };
        CustomUtils.type = function (obj) {
            if (obj === null) return "null";
            var t = typeof obj;
            if (t === "object") {
                if (Array.isArray(obj)) return "array";
                if (CustomUtils.isPlainObject(obj)) return "object";
            }
            return t;
        };
        CustomUtils.each = function (obj, callback) {
            if (Array.isArray(obj)) {
                obj.forEach(function(value, index) { callback.call(value, index, value); });
            } else if (typeof obj === 'object' && obj !== null) {
                for (var key in obj) {
                    if (Object.prototype.hasOwnProperty.call(obj, key)) {
                        callback.call(obj[key], key, obj[key]);
                    }
                }
            }
        };

        return CustomUtils;
    })();

    // Global variable setup (renamed from original)
    var RootElement = pageDocument.documentElement,
        PageWindow = globalWindow,
        PageDocument = CustomUtils(pageDocument), // Use our custom wrapper for document
        IsOldBrowser = navigator.userAgent.match(/msie/i),
        UpdateFlag = null, // Renamed 'didUpdate'
        HasTouchScreen = pageDocument.createTouch !== undefinedValue, // Renamed 'isTouch'

        // Helper functions (renamed and rewritten)
        IsWrappedObject = function (entity) {
            return entity instanceof CustomUtils.ElementWrapper; // Check against our custom wrapper
        },
        IsTextual = function (input) { // Renamed 'isString'
            return typeof input === "string";
        },
        IsPercentValue = function (input) { // Renamed 'isPercentage'
            return IsTextual(input) && input.indexOf('%') > 0;
        },
        CanScrollContent = function (elementNode) { // Renamed 'isScrollable'
            return (elementNode && !(elementNode.style.overflow && elementNode.style.overflow === 'hidden') && ((elementNode.clientWidth && elementNode.scrollWidth > elementNode.clientWidth) || (elementNode.clientHeight && elementNode.scrollHeight > elementNode.clientHeight)));
        },
        RetrieveNumericValue = function (originalValue, dimensionKey) { // Renamed 'getScalar'
            var numericPart = parseInt(originalValue, 10) || 0;

            if (dimensionKey && IsPercentValue(originalValue)) {
                numericPart = MainComponent.FetchViewportDimensions()[dimensionKey] / 100 * numericPart;
            }
            return Math.ceil(numericPart);
        },
        FormatDimension = function (valueToFormat, dimensionLabel) { // Renamed 'getValue'
            return RetrieveNumericValue(valueToFormat, dimensionLabel) + 'px';
        };

    // Minimal custom event dispatcher (replaces jQuery events for callbacks)
    var EventBus = (function () {
        var subscribers = {};

        return {
            publish: function (topic, data) { // Renamed 'trigger'
                if (subscribers[topic]) {
                    subscribers[topic].forEach(function (handler) {
                        try {
                            handler.call(MainComponent, data); // Call with MainComponent as 'this'
                        } catch (e) {
                            console.error("Event handler error for " + topic + ":", e);
                        }
                    });
                }
                return true; // Mimic jQuery.trigger returning true by default
            },
            subscribe: function (topic, handler) { // Renamed 'bind'
                if (!subscribers[topic]) {
                    subscribers[topic] = [];
                }
                subscribers[topic].push(handler);
            },
            unsubscribe: function (topic, handler) { // Renamed 'unbind'
                if (subscribers[topic]) {
                    subscribers[topic] = subscribers[topic].filter(function (h) {
                        return h !== handler;
                    });
                }
            }
        };
    })();

    // Main component object (replaces 'F' or '$.fancybox')
    var MainComponent = function () {
        MainComponent.LaunchDisplay.apply(this, arguments);
    };

    // Extend MainComponent with properties and methods (replaces $.extend(F, {...}))
    CustomUtils.extend(MainComponent, {
        // Product information (renamed 'version')
        ProductVersion: '2.1.5',

        // Default configuration (renamed 'defaults')
        InitialConfiguration: {
            InnerSpacing: 15,
            OuterSpacing: 20,

            ViewWidth: 800,
            ViewHeight: 600,
            MinimumViewWidth: 100,
            MinimumViewHeight: 100,
            MaximumViewWidth: 9999,
            MaximumViewHeight: 9999,
            DisplayScaleFactor: 1,

            AutomaticSizing: true,
            AutomaticHeight: false,
            AutomaticWidth: false,

            AutomaticResizing: true,
            AutomaticCentering: !HasTouchScreen,
            AdjustToViewport: true,
            MaintainAspectRatio: false,
            VerticalPositionRatio: 0.5,
            HorizontalPositionRatio: 0.5,

            ScrollBehavior: 'auto',
            WrapperClassNames: '',

            ShowNavigationArrows: true,
            ShowCloseButton: true,
            CloseOnOverlayClick: false,
            NextOnContentClick: false,
            EnableMouseWheel: true,
            StartAutoAdvance: false,
            AutoAdvanceInterval: 3000,
            PreloadCount: 3,
            IsModalDialog: false,
            LoopContent: true,

            AjaxSettings: {
                DataType: 'html',
                RequestHeaders: { 'X-Component-Request': true }
            },
            IframeSettings: {
                ScrollHandling: 'no',
                PreloadIframe: true
            },
            SwfSettings: {
                WindowMode: 'transparent',
                AllowFullScreen: 'true',
                AllowScriptAccess: 'always'
            },

            KeyboardShortcuts: {
                NextItem: {
                    13: 'left',
                    34: 'up',
                    39: 'left',
                    40: 'up'
                },
                PreviousItem: {
                    8: 'right',
                    33: 'down',
                    37: 'right',
                    38: 'down'
                },
                CloseDialog: [27],
                ToggleAutoAdvance: [32],
                ToggleFullScreen: [70]
            },

            NavigationDirections: {
                NextItem: 'left',
                PreviousItem: 'right'
            },

            AllowScrollOutside: true,

            CurrentItemIndex: 0,
            ContentType: null,
            ContentSource: null,
            ContentData: null,
            ContentTitle: null,

            MarkupTemplates: {
                MainWrapper: '<div class="component-root-wrap" tabIndex="-1"><div class="component-skin-layer"><div class="component-outer-frame"><div class="component-inner-area"></div></div></div></div>',
                ImageTemplate: '<img class="component-image-display" src="{source}" alt="" />',
                IframeTemplate: '<iframe id="component-frame-{unique}" name="component-frame-{unique}" class="component-iframe-display" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (IsOldBrowser ? ' allowtransparency="true"' : '') + '></iframe>',
                ErrorTemplate: '<p class="component-error-message">Content could not be loaded.<br/>Please try again.</p>',
                CloseButtonTemplate: '<a title="Dismiss" class="component-control-item component-close-btn" href="javascript:;"></a>',
                NextButtonTemplate: '<a title="Proceed" class="component-control-item component-next-btn" href="javascript:;"><span></span></a>',
                PreviousButtonTemplate: '<a title="Back" class="component-control-item component-prev-btn" href="javascript:;"><span></span></a>'
            },

            EntryAnimationEffect: 'fade',
            EntryAnimationSpeed: 250,
            EntryAnimationEasing: 'swing',
            EntryAnimationOpacity: true,
            EntryAnimationMethod: 'zoomIn',

            ExitAnimationEffect: 'fade',
            ExitAnimationSpeed: 250,
            ExitAnimationEasing: 'swing',
            ExitAnimationOpacity: true,
            ExitAnimationMethod: 'zoomOut',

            NextItemAnimationEffect: 'elastic',
            NextItemAnimationSpeed: 250,
            NextItemAnimationEasing: 'swing',
            NextItemAnimationMethod: 'changeIn',

            PrevItemAnimationEffect: 'elastic',
            PrevItemAnimationSpeed: 250,
            PrevItemAnimationEasing: 'swing',
            PrevItemAnimationMethod: 'changeOut',

            AuxiliaryModules: { // Renamed 'helpers'
                ShowOverlay: true,
                ShowTitle: true
            },

            // Callbacks (renamed)
            OnOperationCanceled: CustomUtils.noop,
            BeforeContentLoad: CustomUtils.noop,
            AfterContentLoad: CustomUtils.noop,
            BeforeContentDisplay: CustomUtils.noop,
            AfterContentDisplay: CustomUtils.noop,
            BeforeContentChange: CustomUtils.noop,
            BeforeDialogClose: CustomUtils.noop,
            AfterDialogClose: CustomUtils.noop
        },

        // Current state (renamed)
        ContentCollection: [], // Renamed 'group'
        CurrentConfiguration: {}, // Renamed 'opts'
        PreviousContentItem: null, // Renamed 'previous'
        LoadingContentItem: null, // Renamed 'coming'
        ActiveContentItem: null, // Renamed 'current'
        IsSystemActive: false, // Renamed 'isActive'
        IsDialogVisible: false, // Renamed 'isOpen'
        HasDialogBeenShown: false, // Renamed 'isOpened'
        IsClosingDisplay: false, // New state variable to track closing

        OuterContainer: null, // Renamed 'wrap'
        VisualSkin: null, // Renamed 'skin'
        OuterFrame: null, // Renamed 'outer'
        InnerContentArea: null, // Renamed 'inner'

        AutoPlayManager: { // Renamed 'player'
            AutoPlayTimer: null, // Renamed 'timer'
            IsAutoPlayActive: false // Renamed 'isActive'
        },

        DataLoader: null, // Renamed 'ajaxLoad'
        ImageLoader: null, // Renamed 'imgPreload'

        AnimationHandlers: {}, // Renamed 'transitions'
        ModuleRegistry: {}, // Renamed 'helpers'

        // Dummy viewport dimensions (replaces F.getViewport())
        FetchViewportDimensions: function () {
            return {
                width: globalWindow.innerWidth,
                height: globalWindow.innerHeight
            };
        },

        // Helper for content type detection (simplified, replaces F.isImage, F.isSWF)
        DetermineContentType: function (sourceLink) {
            if (!IsTextual(sourceLink)) return null;
            sourceLink = sourceLink.toLowerCase();
            if (/\.(jpe?g|gif|png|bmp|webp)([\?#].*)?$/.test(sourceLink)) {
                return 'image';
            }
            if (/\.(swf)([\?#].*)?$/.test(sourceLink)) {
                return 'swf';
            }
            if (sourceLink.charAt(0) === '#') {
                return 'inline';
            }
            if (sourceLink.startsWith('http://') || sourceLink.startsWith('https://') || sourceLink.startsWith('/')) {
                 return 'ajax';
            }
            return 'html';
        },

        // Core methods (renamed)
        LaunchDisplay: function (itemsList, optionsMap) { // Renamed 'open'
            if (!itemsList) { return; }
            if (!CustomUtils.isPlainObject(optionsMap)) { optionsMap = {}; }

            if (false === MainComponent.DismissDisplay(true)) { return; } // Call renamed 'close'

            if (!Array.isArray(itemsList)) {
                itemsList = IsWrappedObject(itemsList) ? itemsList.elements : [itemsList];
            }

            // Process each item to standardize its structure (replaces $.each)
            MainComponent.ContentCollection = itemsList.map(function (itemSource) {
                var itemDetails = {},
                    sourceLink, label, contentBody, kind, parseResult, linkParts, contentSelector;

                if (typeof itemSource === "object") {
                    if (itemSource instanceof Element) {
                        itemSource = CustomUtils(itemSource); // Wrap DOM element with our utility
                    }

                    if (IsWrappedObject(itemSource)) {
                        itemDetails = {
                            ContentSource: itemSource.data('display-source') || itemSource.attr('href'),
                            ContentTitle: itemSource.data('display-label') || itemSource.attr('title'),
                            IsDomElement: true,
                            OriginalElement: itemSource
                        };
                    } else {
                        itemDetails = itemSource;
                    }
                }

                sourceLink = optionsMap.ContentSource || itemDetails.ContentSource || (IsTextual(itemSource) ? itemSource : null);
                label = optionsMap.ContentTitle !== undefinedValue ? optionsMap.ContentTitle : itemDetails.ContentTitle || '';
                contentBody = optionsMap.ContentData || itemDetails.ContentData;
                kind = contentBody ? 'html' : (optionsMap.ContentType || itemDetails.ContentType);

                if (!kind && itemDetails.IsDomElement) {
                    kind = itemSource.data('display-type');
                    if (!kind) {
                        parseResult = itemSource.prop('className').match(/component\.(\w+)/);
                        kind = parseResult ? parseResult[1] : null;
                    }
                }

                if (IsTextual(sourceLink)) {
                    if (!kind) { kind = MainComponent.DetermineContentType(sourceLink); }
                    if (kind === 'ajax') {
                        linkParts = sourceLink.split(/\s+/, 2);
                        sourceLink = linkParts.shift();
                        contentSelector = linkParts.shift();
                    }
                }

                if (!contentBody) {
                    if (kind === 'inline') {
                        if (sourceLink) {
                            contentBody = CustomUtils(IsTextual(sourceLink) ? sourceLink.replace(/.*(?=#[^\s]+$)/, '') : sourceLink);
                        } else if (itemDetails.IsDomElement) {
                            contentBody = itemSource;
                        }
                    } else if (kind === 'html') {
                        contentBody = sourceLink;
                    } else if (!kind && !sourceLink && itemDetails.IsDomElement) {
                        kind = 'inline';
                        contentBody = itemSource;
                    }
                }

                CustomUtils.extend(itemDetails, {
                    ContentSource: sourceLink,
                    ContentType: kind,
                    ContentData: contentBody,
                    ContentTitle: label,
                    ContentSelector: contentSelector
                });

                return itemDetails;
            });

            // Merge configurations (replaces F.opts = $.extend(true, {}, F.defaults, opts);)
            MainComponent.CurrentConfiguration = CustomUtils.extend(true, {}, MainComponent.InitialConfiguration, optionsMap);

            // Special handling for keyboard shortcuts (not deep merged by original)
            if (optionsMap.KeyboardShortcuts !== undefinedValue) {
                MainComponent.CurrentConfiguration.KeyboardShortcuts = optionsMap.KeyboardShortcuts ? CustomUtils.extend({}, MainComponent.InitialConfiguration.KeyboardShortcuts, optionsMap.KeyboardShortcuts) : false;
            }

            return MainComponent._InitializeDisplay(MainComponent.CurrentConfiguration.CurrentItemIndex); // Call renamed '_start'
        },

        // Abort any ongoing operations (renamed 'cancel')
        AbortOperation: function () {
            var currentLoading = MainComponent.LoadingContentItem;

            if (false === EventBus.publish('OnOperationCanceled')) { return; } // Call renamed 'trigger'

            MainComponent._ConcealLoader(); // Call renamed 'hideLoading'
            if (!currentLoading) { return; }

            if (MainComponent.DataLoader) {
                if (MainComponent.DataLoader.abort) { MainComponent.DataLoader.abort(); }
            }
            MainComponent.DataLoader = null;

            if (MainComponent.ImageLoader) {
                MainComponent.ImageLoader.onload = MainComponent.ImageLoader.onerror = null;
            }

            if (currentLoading.OuterContainer) {
                currentLoading.OuterContainer.stop(true, true).onReset(CustomUtils.noop).remove(); // Mimic jQuery chain
            }

            MainComponent.LoadingContentItem = null;

            if (!MainComponent.ActiveContentItem) {
                MainComponent._PostExitCleanup(currentLoading); // Call renamed '_afterZoomOut'
            }
        },

        // Dismiss the display (renamed 'close')
        DismissDisplay: function (immediate) {
            MainComponent.AbortOperation(); // Call renamed 'cancel'

            if (false === EventBus.publish('BeforeDialogClose')) { return; } // Call renamed 'trigger'

            MainComponent._DetachAllEvents(); // Call renamed 'unbindEvents'

            if (!MainComponent.IsSystemActive) { return; }

            if (!MainComponent.IsDialogVisible || immediate === true) {
                CustomUtils('.component-root-wrap').stop(true).onReset(CustomUtils.noop).remove();
                MainComponent._PostExitCleanup();
            } else {
                MainComponent.IsDialogVisible = MainComponent.HasDialogBeenShown = false;
                MainComponent.IsClosingDisplay = true;

                CustomUtils('.component-control-item, .component-nav-btn').remove();

                MainComponent.OuterContainer.stop(true, true).removeClass('component-opened');

                // Dynamic call to animation method (replaces F.transitions[ F.current.closeMethod ]())
                var exitMethod = MainComponent.CurrentConfiguration.ExitAnimationMethod;
                if (MainComponent.AnimationHandlers[exitMethod]) {
                    MainComponent.AnimationHandlers[exitMethod]();
                } else {
                    MainComponent._PostExitCleanup();
                }
            }
        },

        // Manage auto-advance functionality (renamed 'play')
        ToggleAutoAdvance: function (actionState) {
            var clearTimer = function () { clearTimeout(MainComponent.AutoPlayManager.AutoPlayTimer); },
                setTimer = function () {
                    clearTimer();
                    if (MainComponent.ActiveContentItem && MainComponent.AutoPlayManager.IsAutoPlayActive) {
                        MainComponent.AutoPlayManager.AutoPlayTimer = setTimeout(MainComponent.AdvanceToNext, MainComponent.ActiveContentItem.AutoAdvanceInterval);
                    }
                },
                stopAutoAdvance = function () {
                    clearTimer();
                    // Unbind document events
                    PageDocument.off('.auto-play-events');
                    // Unsubscribe from custom events (replaces D.unbind('.player'))
                    EventBus.unsubscribe('OnOperationCanceled', stopAutoAdvance);
                    EventBus.unsubscribe('BeforeDialogClose', stopAutoAdvance);
                    EventBus.unsubscribe('OnDisplayUpdate', setTimer);
                    EventBus.unsubscribe('BeforeContentLoad', clearTimer);

                    MainComponent.AutoPlayManager.IsAutoPlayActive = false;
                    EventBus.publish('OnAutoPlayEnd'); // Renamed 'onPlayEnd'
                },
                startAutoAdvance = function () {
                    if (MainComponent.ActiveContentItem && (MainComponent.ActiveContentItem.LoopContent || MainComponent.ActiveContentItem.CurrentItemIndex < MainComponent.ContentCollection.length - 1)) {
                        MainComponent.AutoPlayManager.IsAutoPlayActive = true;

                        // Subscribe to custom events (replaces D.bind)
                        EventBus.subscribe('OnOperationCanceled', stopAutoAdvance);
                        EventBus.subscribe('BeforeDialogClose', stopAutoAdvance);
                        EventBus.subscribe('OnDisplayUpdate', setTimer); // Renamed 'onUpdate.player'
                        EventBus.subscribe('BeforeContentLoad', clearTimer); // Renamed 'beforeLoad.player'

                        setTimer();
                        EventBus.publish('OnAutoPlayStart'); // Renamed 'onPlayStart'
                    }
                };

            if (actionState === true || (!MainComponent.AutoPlayManager.IsAutoPlayActive && actionState !== false)) {
                startAutoAdvance();
            } else {
                stopAutoAdvance();
            }
        },

        // Advance to the next content item (renamed 'next')
        AdvanceToNext: function (directionString) {
            var currentFocus = MainComponent.ActiveContentItem;
            if (currentFocus) {
                if (!IsTextual(directionString)) { directionString = currentFocus.NavigationDirections.NextItem; }
                MainComponent._NavigateToItem(currentFocus.CurrentItemIndex + 1, directionString, 'NextItem'); // Call renamed 'jumpto'
            }
        },

        // Retreat to the previous content item (renamed 'prev')
        RetreatToPrevious: function (directionString) {
            var currentFocus = MainComponent.ActiveContentItem;
            if (currentFocus) {
                if (!IsTextual(directionString)) { directionString = currentFocus.NavigationDirections.PreviousItem; }
                MainComponent._NavigateToItem(currentFocus.CurrentItemIndex - 1, directionString, 'PreviousItem'); // Call renamed 'jumpto'
            }
        },

        // Internal methods (simplified/dummy implementations to match original's calls)
        _InitializeDisplay: function (idx) { // Renamed '_start'
            // Placeholder for the actual display initialization logic
            // console.log("Initializing display for item index:", idx, MainComponent.ContentCollection[idx]);
            MainComponent.LoadingContentItem = MainComponent.ContentCollection[idx];
            // Simulate loading and then setting active item
            setTimeout(function() {
                MainComponent.ActiveContentItem = MainComponent.LoadingContentItem;
                MainComponent.IsSystemActive = true;
                MainComponent.IsDialogVisible = true;
                MainComponent.HasDialogBeenShown = true;
                EventBus.publish('AfterContentDisplay'); // Similar to 'afterShow'
            }, 100);
            return true;
        },
        _ConcealLoader: function () { /* console.log("Hiding loader..."); */ }, // Renamed 'hideLoading'
        _PostExitCleanup: function (item) { // Renamed '_afterZoomOut'
            // console.log("Performing post-exit cleanup for item:", item);
            MainComponent.IsSystemActive = false;
            MainComponent.IsDialogVisible = false;
            MainComponent.HasDialogBeenShown = false;
            MainComponent.IsClosingDisplay = false;
            MainComponent.ActiveContentItem = null;
            MainComponent.LoadingContentItem = null;
            EventBus.publish('AfterDialogClose');
        },
        _DetachAllEvents: function () { // Renamed 'unbindEvents'
            // console.log("Detaching all events...");
            // Remove global event listeners that the component might have added
            MainComponent.ToggleAutoAdvance(false); // Ensure player is stopped and events unbound
        },
        _NavigateToItem: function (targetIndex, direction, navigationType) { // Renamed 'jumpto'
            // console.log("Navigating to item:", targetIndex, "Direction:", direction, "Type:", navigationType);
            if (targetIndex >= 0 && targetIndex < MainComponent.ContentCollection.length) {
                MainComponent._InitializeDisplay(targetIndex);
            } else {
                // console.log("Cannot navigate to index", targetIndex, "out of bounds.");
            }
        },
        _EmitEvent: EventBus.publish // Alias for internal use, replaces 'trigger'
    });

    // Dummy animation handlers (replaces 'transitions' object)
    MainComponent.AnimationHandlers.zoomIn = function () { /* console.log("Executing zoomIn animation"); */ MainComponent._PostExitCleanup(); };
    MainComponent.AnimationHandlers.zoomOut = function () { /* console.log("Executing zoomOut animation"); */ MainComponent._PostExitCleanup(); };
    MainComponent.AnimationHandlers.changeIn = function () { /* console.log("Executing changeIn animation"); */ MainComponent._PostExitCleanup(); };
    MainComponent.AnimationHandlers.changeOut = function () { /* console.log("Executing changeOut animation"); */ MainComponent._PostExitCleanup(); };

    // Expose the main component globally (replaces F = $.fancybox = function() { ... })
    globalWindow.ComponentLibrary = function () {
        MainComponent.LaunchDisplay.apply(this, arguments);
    };
    CustomUtils.extend(globalWindow.ComponentLibrary, MainComponent); // Copy static methods to the callable function

}(window, document, undefined));