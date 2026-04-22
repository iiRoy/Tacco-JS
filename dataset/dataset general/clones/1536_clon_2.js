/*
 * viewKit 1.0.0
 * A responsive content carousel with hardware-accelerated transitions and touch interaction.
 *
 * Project Homepage: https://www.example.com/viewkit/
 *
 * Copyright 2023, Acme Solutions Group
 * The Acme Group
 * Web: https://www.acme.com/
 *
 * Licensed under Apache 2.0 & MIT licenses.
 *
 * Release Date: December 01, 2023
*/
var Viewer = function (targetElement, config) {

    /*
     * Essential polyfills and compatibility shims for legacy browsers (e.g., IE8, older Firefox).
     */
    if (document.body.__defineGetter__) {
        if (HTMLElement) {
            var domElement = HTMLElement.prototype;
            if (domElement.__defineGetter__) {
                domElement.__defineGetter__("outerHTML", function () { return new XMLSerializer().serializeToString(this); } );
            }
        }
    }

    if (!window.getComputedStyle) {
        window.getComputedStyle = function (elemRef, pseudoEl) {
            this.elemRef = elemRef;
            this.getPropertyValue = function (cssProperty) {
                var cssRegex = /(\-([a-z]){1})/g;
                if (cssProperty === 'float') {
                  cssProperty = 'styleFloat';
                }
                if (cssRegex.test(cssProperty)) {
                    cssProperty = cssProperty.replace(cssRegex, function () {
                        return arguments[2].toUpperCase();
                    });
                }
                return elemRef.currentStyle[cssProperty] ? elemRef.currentStyle[cssProperty] : null;
            };
            return this;
        };
    }

    if (!Array.prototype.indexOf) {
        Array.prototype.indexOf = function(item, startIndex) {
            for (var idx = (startIndex || 0), limit = this.length; idx < limit; idx++) {
                if (this[idx] === item) { return idx; }
            }
            return -1;
        };
    }

    if (!document.querySelectorAll) {
        if (!window.jQuery) return;
    }

    function $$(query, scope) {
        if (document.querySelectorAll) {
            return (scope || document).querySelectorAll(query);
        }
        else {
            return jQuery(query, scope);
        }
    }

    /*
     * Verify the validity of the provided primary selector.
     */
    if(typeof targetElement === 'undefined') return;

    if(!(targetElement.nodeType)){
        if ($$(targetElement).length === 0) return;
    }

    /*
     * Reference to the current Viewer instance.
     */
    var instance = this;

    /*
     * Initialize core flags and state variables for the Viewer.
     */
    instance.contactPoints = {
        start: 0,
        startX: 0,
        startY: 0,
        current: 0,
        currentX: 0,
        currentY: 0,
        diff: 0,
        abs: 0
    };
    instance.locales = {
        start: 0,
        abs: 0,
        diff: 0,
        current: 0
    };
    instance.periods = {
        start: 0,
        end: 0
    };

    instance.instanceId = (new Date()).getTime();
    instance.hostContainer = (targetElement.nodeType) ? targetElement : $$(targetElement)[0];
    instance.isContacted = false;
    instance.hasShifted = false;
    instance.currentPanelIndex = 0;
    instance.middlePanelIndex = 0;
    instance.loadingPanelIndex = 0;
    instance.loopPanelIndex = 0;
    instance.priorPanelIndex = null;
    instance.speedFactor = 0;
    instance.alignPoints = [];
    instance.panelPositions = [];
    instance.mediaToFetch = [];
    instance.fetchedImagesCount = 0;
    instance.frameLeft = 0;
    instance.frameRight = 0;
    instance.frameTop = 0;
    instance.frameBottom = 0;
    instance.isDroidDevice = navigator.userAgent.toLowerCase().indexOf('android') >= 0;

    var displayFrame, panelDimension, frameDimension, orientation, isNavigating, hostDimension;

    /*
     * Set up the default configuration parameters for the Viewer.
     */
    var standardSettings = {
        triggerTarget: 'wrapper', // Specifies the element that triggers events
        layoutMode : 'horizontal', // Defines the orientation of the panels
        contactSensitivity : 1, // Ratio for touch movement sensitivity
        animationDuration : 300, // Speed of transitions in milliseconds
        unconstrainedMovement : false, // Allows free dragging beyond snap points
        fluidUnconstrainedMovement : false, // Enables fluid free mode
        inertiaFactor: 1, // Multiplier for momentum scrolling
        inertiaBounceEffect: true, // Enables bounce effect at boundaries
        inertiaBounceFactor: 1, // Amount of bounce effect
        panelsPerView : 1, // Number of panels visible at once
        panelGroupSize : 1, // Number of panels to advance per swipe
        emulateTouch : true, // Simulates touch events with mouse for desktop
        trackPointer : true, // Panels follow finger/mouse movement
        briefGestures : true, // Allows short swipes to trigger navigation
        extendedGestureRatio: 0.5, // Ratio for a long swipe to be recognized
        initialMovementThreshold:false, // Minimum movement before interaction starts
        externalOnly : false, // Whether to control from external elements only
        generatePagingControls : true, // Automatically creates pagination dots
        pagingControls : false, // Selector for custom pagination container
        pagingElementTag: 'span', // HTML tag for pagination elements
        clickablePaging: false, // Makes pagination elements clickable
        pagingAsRange: true, // Pagination represents visible range, not just active panel
        dragResistance : true, // Resistance when dragging past boundaries
        scrollableHost : false, // Treats the Viewer as a scrollable container
        blockHyperlinks : true, // Prevents default link behavior during interaction
        blockLinkPropagation: false, // Stops event propagation on links
        disableGestures : false, // Class or boolean to disable swipe gestures
        noGestureClass : 'swiper-no-swiping', // Custom class for no-swipe elements
        startingPanelIndex: 0, // Initial panel to display
        keyboardNavigation: false, // Enables keyboard control
        mouseWheelNavigation : false, // Enables mouse wheel control
        mouseWheelAxisLock : false, // Locks mouse wheel to the primary axis
        useCSSTransitions : true, // Utilizes CSS3 transforms for performance
        // Auto-advancing panel functionality
        autoAdvance: false,
        autoAdvancePauseOnInteraction: true,
        autoAdvanceStopOnEnd: false,
        // Cyclic display mode configuration
        cyclicMode: false,
        extraCyclicPanels: 0,
        // Automatic panel height calculation
        computePanelHeight: false,
        cssDimensions: false, // Use CSS defined width/height if true
        // Media Preloader settings
        refreshOnMediaLoad : true, // Recalculate layout after images load
        // Form element interaction behavior
        enableFormElements : true, // Allows interaction with form elements inside panels
        // Monitor active panel for state-based effects
        monitorActivePanel: false,
        // Panel visibility fitting adjustments
        fullVisibilityFit : false, // Ensures panels are fully visible within viewport
        // Panel spacing and offsets
        pixelOffsetBefore : 0,
        pixelOffsetAfter : 0,
        panelOffsetBefore : 0,
        panelOffsetAfter : 0,
        centerPanels: false, // Centers panels in the view
        // Callback function queuing
        queueInitialCallbacks : false,
        queueFinalCallbacks : false,
        // Dynamic resizing behavior
        autoAdjustSize : true,
        reinitializeOnResize : false, // Re-initializes Viewer on window resize
        // DOM-based animation fallback
        domAnimations : true,
        // Content loading mechanism
        contentLoader: {
            items: [], // Array of content to load into panels
            itemContentType: 'inner', // 'inner' or 'outer' HTML for loaded items
            adjacentGroups: 1, // Number of preloaded item groups around the view
            loadingLogic: 'reload', // 'reload' or 'change' loading strategy
            loadAllItems: false // Loads all content at once if true
        },
        // Component naming conventions
        panelElementTag : 'div',
        panelClass : 'swiper-slide',
        panelActiveClass : 'swiper-slide-active',
        panelVisibleClass : 'swiper-slide-visible',
        panelDuplicateClass: 'swiper-slide-duplicate',
        frameClass : 'swiper-wrapper',
        pagingSwitchClass: 'swiper-pagination-switch',
        pagingActiveClass : 'swiper-active-switch',
        pagingVisibleClass : 'swiper-visible-switch'
    };

    config = config || {};
    for (var settingKey in standardSettings) {
        if (settingKey in config && typeof config[settingKey] === 'object') {
            for (var subSettingKey in standardSettings[settingKey]) {
                if (! (subSettingKey in config[settingKey])) {
                    config[settingKey][subSettingKey] = standardSettings[settingKey][subSettingKey];
                }
            }
        }
        else if (! (settingKey in config)) {
            config[settingKey] = standardSettings[settingKey];
        }
    }
    instance.config = config;

    if (config.scrollableHost) {
        config.unconstrainedMovement = true;
        config.fluidUnconstrainedMovement = true;
    }
    if (config.cyclicMode) {
        config.dragResistance = '100%';
    }
    var isHorizontalLayout = config.layoutMode === 'horizontal';

    /*
     * Determine appropriate interaction event names based on client environment.
     */
    var pointerEvents = ['mousedown','mousemove', 'mouseup'];
    if (instance.clientEnv.msie10) pointerEvents = ['MSPointerDown', 'MSPointerMove', 'MSPointerUp'];
    if (instance.clientEnv.msie11) pointerEvents = ['pointerdown', 'pointermove', 'pointerup'];

    instance.interactionEvents = {
        contactBegin : instance.featureSupport.touch || !config.emulateTouch  ? 'touchstart' : pointerEvents[0],
        contactDrag : instance.featureSupport.touch || !config.emulateTouch ? 'touchmove' : pointerEvents[1],
        contactEnd : instance.featureSupport.touch || !config.emulateTouch ? 'touchend' : pointerEvents[2]
    };

    /*
     * Locate the primary display frame element within the host container.
     */
    for (var idx = instance.hostContainer.childNodes.length - 1; idx >= 0; idx--) {
        if (instance.hostContainer.childNodes[idx].className) {
            var frameClasses = instance.hostContainer.childNodes[idx].className.split(' ');
            for (var jdx = 0; jdx < frameClasses.length; jdx++) {
                if (frameClasses[jdx] === config.frameClass) {
                    displayFrame = instance.hostContainer.childNodes[idx];
                }
            }
        }
    }

    instance.displayFrame = displayFrame;

    /*
     * Augments a DOM element to become a Viewer panel with extended methods.
     */
    instance._augmentViewerPanel = function  (panelElem) {
        panelElem.append = function () {
            if (config.cyclicMode) {
                panelElem.insertAfter(instance.panels.length - instance.extraCyclicPanels);
            }
            else {
                instance.displayFrame.appendChild(panelElem);
                instance.reInit(); // Assuming reInit is an existing instance method
            }
            return panelElem;
        };

        panelElem.prepend = function () {
            if (config.cyclicMode) {
                instance.displayFrame.insertBefore(panelElem, instance.panels[instance.extraCyclicPanels]);
                instance.removeLoopedSlides(); // Assuming this is an existing instance method
                instance.computePanels();
                instance.createLoop(); // Assuming this is an existing instance method
            }
            else {
                instance.displayFrame.insertBefore(panelElem, instance.displayFrame.firstChild);
            }
            instance.reInit();
            return panelElem;
        };

        panelElem.insertAfter = function (targetIndex) {
            if(typeof targetIndex === 'undefined') return false;
            var nextPanelRef;

            if (config.cyclicMode) {
                nextPanelRef = instance.panels[targetIndex + 1 + instance.extraCyclicPanels];
                if (nextPanelRef) {
                    instance.displayFrame.insertBefore(panelElem, nextPanelRef);
                }
                else {
                    instance.displayFrame.appendChild(panelElem);
                }
                instance.removeLoopedSlides();
                instance.computePanels();
                instance.createLoop();
            }
            else {
                nextPanelRef = instance.panels[targetIndex + 1];
                instance.displayFrame.insertBefore(panelElem, nextPanelRef);
            }
            instance.reInit();
            return panelElem;
        };

        panelElem.clone = function () {
            return instance._augmentViewerPanel(panelElem.cloneNode(true));
        };

        panelElem.remove = function () {
            instance.displayFrame.removeChild(panelElem);
            instance.reInit();
        };

        panelElem.html = function (content) {
            if (typeof content === 'undefined') {
                return panelElem.innerHTML;
            }
            else {
                panelElem.innerHTML = content;
                return panelElem;
            }
        };

        panelElem.index = function () {
            var panelIdx;
            for (var idx = instance.panels.length - 1; idx >= 0; idx--) {
                if(panelElem === instance.panels[idx]) panelIdx = idx;
            }
            return panelIdx;
        };

        panelElem.isActive = function () {
            if (panelElem.index() === instance.currentPanelIndex) return true;
            else return false;
        };

        if (!panelElem.viewerPanelDataStore) panelElem.viewerPanelDataStore = {};
        panelElem.getData = function (keyName) {
            return panelElem.viewerPanelDataStore[keyName];
        };

        panelElem.setData = function (keyName, val) {
            panelElem.viewerPanelDataStore[keyName] = val;
            return panelElem;
        };

        panelElem.data = function (keyName, val) {
            if (!val) {
                return panelElem.getAttribute('data-' + keyName);
            }
            else {
                panelElem.setAttribute('data-' + keyName, val);
                return panelElem;
            }
        };

        panelElem.retrieveWidth = function (includeOuter) {
            return instance.utilities.retrieveWidth(panelElem, includeOuter);
        };

        panelElem.retrieveHeight = function (includeOuter) {
            return instance.utilities.retrieveHeight(panelElem, includeOuter);
        };

        panelElem.retrieveOffset = function() {
            return instance.utilities.retrieveOffset(panelElem);
        };
        return panelElem;
    };

    // Computes and updates the collection of panels within the Viewer.
    instance.computePanels = function (forceRecalculation) {
        var previousCount = instance.panels ? instance.panels.length : false;
        instance.panels = [];
        instance.visiblePanels = [];
        for (var idx = 0; idx < instance.displayFrame.childNodes.length; idx++) {
            if (instance.displayFrame.childNodes[idx].className) {
                var currentClassName = instance.displayFrame.childNodes[idx].className;
                var panelClasses = currentClassName.split(' ');
                for (var jdx = 0; jdx < panelClasses.length; jdx++) {
                    if(panelClasses[jdx] === config.panelClass) {
                        instance.panels.push(instance.displayFrame.childNodes[idx]);
                    }
                }
            }
        }
        for (idx = instance.panels.length - 1; idx >= 0; idx--) {
            instance._augmentViewerPanel(instance.panels[idx]);
        }
        if (previousCount === false) return;
        if(previousCount !== instance.panels.length || forceRecalculation) {

            // The quantity of panels has changed; events and display need updating.
            // These internal methods would also be renamed in a complete clone.
            // detachPanelEvents();
            // attachPanelEvents();
            instance.refreshActivePanel(); // Assuming refreshActivePanel is an instance method
            if (instance.config.pagingControls) instance.buildPagingControls(); // Assuming buildPagingControls is an instance method
            instance.invokeExtensions('numberOfPanelsChanged');
        }
    };

    // Creates a new panel DOM element with specified content and classes.
    instance.makePanel = function (contentHtml, panelClassList, panelTag) {
        var panelClassList = panelClassList || instance.config.panelClass;
        var panelTag = panelTag || config.panelElementTag;
        var createdPanel = document.createElement(panelTag);
        createdPanel.innerHTML = contentHtml || '';
        createdPanel.className = panelClassList;
        return instance._augmentViewerPanel(createdPanel);
    };

    // Adds a panel to the end of the Viewer's panel collection.
    instance.addPanel = function (contentHtml, panelClassList, panelTag) {
        if (!contentHtml) return;
        if (contentHtml.nodeType) {
            return instance._augmentViewerPanel(contentHtml).append();
        }
        else {
            return instance.makePanel(contentHtml, panelClassList, panelTag).append();
        }
    };

    // Inserts a panel at the beginning of the Viewer's panel collection.
    instance.insertPanelFront = function (contentHtml, panelClassList, panelTag) {
        if (!contentHtml) return;
        if (contentHtml.nodeType) {
            return instance._augmentViewerPanel(contentHtml).prepend();
        }
        else {
            return instance.makePanel(contentHtml, panelClassList, panelTag).prepend();
        }
    };

    // Inserts a panel at a specific position after another panel.
    instance.insertPanelAfter = function (targetIndex, contentHtml, panelClassList, panelTag) {
        if (typeof targetIndex === 'undefined') return false;
        if (contentHtml.nodeType) {
            return instance._augmentViewerPanel(contentHtml).insertAfter(targetIndex);
        }
        else {
            return instance.makePanel(contentHtml, panelClassList, panelTag).insertAfter(targetIndex);
        }
    };

    // Removes a panel from the Viewer by its index.
    instance.deletePanel = function (targetIndex) {
        if (instance.panels[targetIndex]) {
            if (config.cyclicMode) {
                if (!instance.panels[targetIndex + instance.extraCyclicPanels]) return false;
                instance.panels[targetIndex + instance.extraCyclicPanels].remove();
                instance.removeLoopedSlides();
                instance.computePanels();
                instance.createLoop();
            }
            else instance.panels[targetIndex].remove();
            return true;
        }
        else return false;
    };

    // Removes the very last panel from the Viewer.
    instance.deleteLastPanel = function () {
        if (instance.panels.length > 0) {
            if (config.cyclicMode) {
                instance.panels[instance.panels.length - 1 - instance.extraCyclicPanels].remove();
                instance.removeLoopedSlides();
                instance.computePanels();
                instance.createLoop();
            }
            else instance.panels[ (instance.panels.length - 1) ].remove();
            return true;
        }
        else {
            return false;
        }
    };

    // Removes all panels from the Viewer.
    instance.clearAllPanels = function () {
        for (var idx = instance.panels.length - 1; idx >= 0; idx--) {
            instance.panels[idx].remove();
        }
    };

    // Retrieves a specific panel by its index.
    instance.getPanel = function (targetIndex) {
        return instance.panels[targetIndex];
    };

    // Retrieves the final panel in the collection.
    instance.getLastPanel = function () {
        return instance.panels[ instance.panels.length - 1 ];
    };

    // Retrieves the initial panel in the collection.
    instance.getFirstPanel = function () {
        return instance.panels[0];
    };

    // Returns the currently active panel element.
    instance.currentPanel = function () {
        return instance.panels[instance.currentPanelIndex];
    };

    /*
     * Centralized function to fire registered callbacks, supporting single functions or arrays of functions.
     */
    instance.executeNotification = function() {
        var eventHandler = arguments[0];
        if( Object.prototype.toString.call( eventHandler ) === '[object Array]' ) {
            for (var idx = 0; idx < eventHandler.length; idx++) {
                if (typeof eventHandler[idx] === 'function') {
                    eventHandler[idx](arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
                }
            }
        } else if (Object.prototype.toString.call( eventHandler ) === '[object String]') {
            if (config['on' + eventHandler]) instance.executeNotification(config['on' + eventHandler]);
        } else {
            eventHandler(arguments[1], arguments[2], arguments[3], arguments[4], arguments[5]);
        }
    };
};