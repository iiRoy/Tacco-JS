const PopUpController = (function(globalWindow, globalDocument) {
    "use strict";

    const documentRef = globalDocument;
    const navigatorRef = globalWindow.navigator;

    const isTextual = (potentialText) => typeof potentialText === "string";
    const isProportional = (potentialText) => isTextual(potentialText) && potentialText.indexOf('%') > 0;

    const retrieveViewportDimensions = () => ({
        width: globalWindow.innerWidth,
        height: globalWindow.innerHeight
    });

    const measureDimension = (input, dimensionKey) => {
        let numericValue = parseInt(input, 10) || 0;
        if (dimensionKey && isProportional(input)) {
            numericValue = retrieveViewportDimensions()[dimensionKey] / 100 * numericValue;
        }
        return Math.ceil(numericValue);
    };

    const formatDimension = (input, dimensionKey) => measureDimension(input, dimensionKey) + 'px';

    const canScroll = (elem) => {
        return (elem && !(elem.style.overflow && elem.style.overflow === 'hidden') && ((elem.clientWidth && elem.scrollWidth > elem.clientWidth) || (elem.clientHeight && elem.scrollHeight > elem.clientHeight)));
    };

    const isPlainObject = (item) => (item && typeof item === 'object' && !Array.isArray(item) && item.constructor === Object);

    const deepMerge = (target, ...sources) => {
        if (!sources.length) return target;
        const source = sources.shift();

        if (isPlainObject(target) && isPlainObject(source)) {
            for (const key in source) {
                if (isPlainObject(source[key])) {
                    if (!target[key]) Object.assign(target, { [key]: {} });
                    deepMerge(target[key], source[key]);
                } else {
                    Object.assign(target, { [key]: source[key] });
                }
            }
        }
        return deepMerge(target, ...sources);
    };

    class EventDispatcher {
        constructor() {
            this.callbacks = {};
        }

        on(eventName, callback) {
            if (!this.callbacks[eventName]) {
                this.callbacks[eventName] = [];
            }
            this.callbacks[eventName].push(callback);
        }

        off(eventName, callback) {
            if (this.callbacks[eventName]) {
                this.callbacks[eventName] = this.callbacks[eventName].filter(cb => cb !== callback);
            }
        }

        dispatch(eventName, ...args) {
            if (this.callbacks[eventName]) {
                this.callbacks[eventName].forEach(callback => callback(...args));
            }
        }
    }
    const eventBus = new EventDispatcher();

    const configPresets = {}; // Populated below
    const currentStatus = {
        itemCollection: [],
        activeSettings: {},
        priorElement: null,
        pendingElement: null,
        activeElement: null,
        isActivated: false,
        isCurrentlyDisplayed: false,
        hasBeenDisplayed: false,
        isClosing: false, // Added to mirror F.isClosing

        wrapperNode: null,
        skinNode: null,
        outerNode: null,
        innerNode: null,

        sequencer: {
            timerHandle: null,
            isRunning: false
        },

        dataLoader: null,
        imageLoader: null,

        transformations: {},
        auxiliaries: {},
    };

    const ascertainImageType = (resourceLink) => {
        return /\.(jpe?g|gif|png|webp)$/i.test(resourceLink);
    };
    const ascertainSwfType = (resourceLink) => {
        return /\.swf$/i.test(resourceLink);
    };

    currentStatus.transformations = {
        fadeEffect: () => {
            // console.log("Applying fade effect for transition.");
            // Actual DOM manipulation for fade would go here
        },
        zoomInEffect: () => {
            // console.log("Applying zoom-in effect for opening.");
            // Actual DOM manipulation for zoom-in would go here
        },
        zoomOutEffect: () => {
            // console.log("Applying zoom-out effect for closing.");
            // Actual DOM manipulation for zoom-out would go here
            const wrap = documentRef.querySelector('.popup-view-container');
            if (wrap) wrap.remove();
            concludeZoomOut();
        },
        changeInEffect: () => { /* console.log("Applying change-in effect."); */ },
        changeOutEffect: () => { /* console.log("Applying change-out effect."); */ }
    };

    const initiateDisplay = (index) => {
        // console.log(`Initiating display for item at index ${index}`);
        currentStatus.isActivated = true;
        currentStatus.activeElement = currentStatus.itemCollection[index];
        currentStatus.activeElement.index = index; // Ensure index is set for prev/next logic
        
        mainController.trigger('beforeLoad');

        // Simulate loading (e.g., AJAX or image)
        // For a full clone, this would involve actual fetch/Image loading based on contentType
        // For Type IV, we simulate the state changes and callbacks
        setTimeout(() => {
            mainController.trigger('afterLoad');
            currentStatus.isCurrentlyDisplayed = true;
            currentStatus.hasBeenDisplayed = true;
            mainController.trigger('beforeShow');

            // Simulate DOM creation (simplified)
            const mockWrap = documentRef.createElement('div');
            mockWrap.className = 'popup-view-container popup-view-opened';
            mockWrap.setAttribute('tabIndex', '-1');
            // Add other mock structure if needed for specific tests
            documentRef.body.appendChild(mockWrap);
            currentStatus.wrapperNode = mockWrap;

            const openTransitionMethod = currentStatus.activeElement.openMethod || currentStatus.activeSettings.openMethod;
            if (currentStatus.transformations[openTransitionMethod]) {
                currentStatus.transformations[openTransitionMethod]();
            } else {
                currentStatus.transformations.zoomInEffect(); // Fallback
            }
            mainController.trigger('afterShow');
        }, 100);
        return true;
    };

    const concludeZoomOut = (itemBeingClosed) => {
        // console.log("Concluding zoom out animation.");
        currentStatus.isActivated = false;
        currentStatus.isCurrentlyDisplayed = false;
        currentStatus.hasBeenDisplayed = false;
        currentStatus.isClosing = false;
        currentStatus.pendingElement = null;
        currentStatus.activeElement = null;
        currentStatus.priorElement = null;
        currentStatus.wrapperNode = null; // Clear references to removed DOM
        mainController.trigger('afterClose');
    };

    const concealLoader = () => {
        // console.log("Hiding loading indicator.");
        // Actual DOM manipulation to hide loader would go here
    };

    const deregisterEvents = () => {
        // console.log("Deregistering all pop-up related events.");
        // This is where actual event listeners attached to global DOM elements would be removed.
        // For custom event bus, we manage subscriptions per feature (e.g., player)
    };

    const mainController = {
        versionValue: '2.1.5', // Renamed version

        commenceView: function(groupItems, options) {
            if (!groupItems) {
                return;
            }

            if (!isPlainObject(options)) {
                options = {};
            }

            if (false === mainController.terminateView(true)) {
                return;
            }

            let processedGroup = [];
            if (!Array.isArray(groupItems)) {
                if (groupItems && groupItems.nodeType) { // Is a single DOM element
                    processedGroup = [groupItems];
                } else {
                    processedGroup = [groupItems];
                }
            } else {
                processedGroup = groupItems;
            }

            currentStatus.itemCollection = processedGroup.map((item, index) => {
                let itemObject = {};
                let resourceLink, displayTitle, contentPayload, contentType, matchResult, selectorPart;

                if (isPlainObject(item)) {
                    if (item.nodeType) { // Is a DOM element
                        const element = item;
                        itemObject = {
                            resourceLink: element.dataset.popuphref || element.getAttribute('href'),
                            displayTitle: element.dataset.popuptitle || element.getAttribute('title'),
                            isDom: true,
                            sourceElement: element
                        };
                    } else {
                        itemObject = item;
                    }
                }

                resourceLink = options.resourceLink || itemObject.resourceLink || (isTextual(item) ? item : null);
                displayTitle = options.displayTitle !== undefined ? options.displayTitle : itemObject.displayTitle || '';
                contentPayload = options.contentPayload || itemObject.contentPayload;
                contentType = contentPayload ? 'html' : (options.contentType || itemObject.contentType);

                if (!contentType && itemObject.isDom) {
                    contentType = itemObject.sourceElement.dataset.popuptype;
                    if (!contentType) {
                        matchResult = itemObject.sourceElement.className.match(/popup\.(\w+)/);
                        contentType = matchResult ? matchResult[1] : null;
                    }
                }

                if (isTextual(resourceLink)) {
                    if (!contentType) {
                        if (acertainImageType(resourceLink)) {
                            contentType = 'image';
                        } else if (acertainSwfType(resourceLink)) {
                            contentType = 'swf';
                        } else if (resourceLink.charAt(0) === '#') {
                            contentType = 'inline';
                        } else if (isTextual(item)) {
                            contentType = 'html';
                            contentPayload = item;
                        }
                    }

                    if (contentType === 'ajax') {
                        const linkParts = resourceLink.split(/\s+/, 2);
                        resourceLink = linkParts.shift();
                        selectorPart = linkParts.shift();
                    }
                }

                if (!contentPayload) {
                    if (contentType === 'inline') {
                        if (resourceLink) {
                            contentPayload = documentRef.querySelector(isTextual(resourceLink) ? resourceLink.replace(/.*(?=#[\S]+$)/, '') : resourceLink);
                        } else if (itemObject.isDom) {
                            contentPayload = itemObject.sourceElement;
                        }
                    } else if (contentType === 'html') {
                        contentPayload = resourceLink;
                    } else if (!contentType && !resourceLink && itemObject.isDom) {
                        contentType = 'inline';
                        contentPayload = itemObject.sourceElement;
                    }
                }

                return Object.assign({}, itemObject, {
                    resourceLink: resourceLink,
                    contentType: contentType,
                    contentPayload: contentPayload,
                    displayTitle: displayTitle,
                    selectorPart: selectorPart
                });
            });

            currentStatus.activeSettings = deepMerge({}, configPresets, options);

            if (options.keys !== undefined) {
                currentStatus.activeSettings.keys = options.keys ? Object.assign({}, configPresets.keys, options.keys) : false;
            }

            return initiateDisplay(currentStatus.activeSettings.index);
        },

        haltOperation: function() {
            const currentPending = currentStatus.pendingElement;

            if (currentPending && false === mainController.trigger('onCancel')) {
                return;
            }

            concealLoader();

            if (!currentPending) {
                return;
            }

            if (currentStatus.dataLoader) {
                currentStatus.dataLoader.abort();
            }
            currentStatus.dataLoader = null;

            if (currentStatus.imageLoader) {
                currentStatus.imageLoader.onload = currentStatus.imageLoader.onerror = null;
            }

            if (currentPending.wrapperNode) {
                currentPending.wrapperNode.remove();
            }

            currentStatus.pendingElement = null;

            if (!currentStatus.activeElement) {
                concludeZoomOut(currentPending);
            }
        },

        terminateView: function(immediate) {
            mainController.haltOperation();

            if (false === mainController.trigger('beforeClose')) {
                return;
            }

            deregisterEvents();

            if (!currentStatus.isActivated) {
                return;
            }

            if (!currentStatus.isCurrentlyDisplayed || immediate === true) {
                const existingWraps = documentRef.querySelectorAll('.popup-view-container');
                existingWraps.forEach(wrap => wrap.remove());
                concludeZoomOut();

            } else {
                currentStatus.isCurrentlyDisplayed = currentStatus.hasBeenDisplayed = false;
                currentStatus.isClosing = true;

                const elementsToRemove = documentRef.querySelectorAll('.popup-element, .popup-navigation');
                elementsToRemove.forEach(el => el.remove());

                if (currentStatus.wrapperNode) {
                    currentStatus.wrapperNode.classList.remove('popup-view-opened');
                }

                const closeTransitionMethod = currentStatus.activeElement.closeMethod || currentStatus.activeSettings.closeMethod;
                if (currentStatus.transformations[closeTransitionMethod]) {
                    currentStatus.transformations[closeTransitionMethod]();
                } else {
                    currentStatus.transformations.zoomOutEffect();
                }
            }
            return true; // Mimic jQuery's close returning true if successful
        },

        sequenceControl: function(action) {
            const clearTimer = () => {
                clearTimeout(currentStatus.sequencer.timerHandle);
            };

            const setTimer = () => {
                clearTimer();
                if (currentStatus.activeElement && currentStatus.sequencer.isRunning) {
                    currentStatus.sequencer.timerHandle = setTimeout(mainController.advanceItem, currentStatus.activeElement.playSpeed || currentStatus.activeSettings.playSpeed);
                }
            };

            const stopSequencer = () => {
                clearTimer();
                eventBus.off('onCancel', stopSequencer);
                eventBus.off('beforeClose', stopSequencer);
                eventBus.off('onUpdate', setTimer);
                eventBus.off('beforeLoad', clearTimer);

                currentStatus.sequencer.isRunning = false;
                mainController.trigger('onPlayEnd');
            };

            const startSequencer = () => {
                if (currentStatus.activeElement && (currentStatus.activeElement.loop || currentStatus.activeElement.index < currentStatus.itemCollection.length - 1)) {
                    currentStatus.sequencer.isRunning = true;

                    eventBus.on('onCancel', stopSequencer);
                    eventBus.on('beforeClose', stopSequencer);
                    eventBus.on('onUpdate', setTimer);
                    eventBus.on('beforeLoad', clearTimer);

                    setTimer();
                    mainController.trigger('onPlayStart');
                }
            };

            if (action === true || (!currentStatus.sequencer.isRunning && action !== false)) {
                startSequencer();
            } else {
                stopSequencer();
            }
        },

        advanceItem: function(directionOverride) {
            const currentDisplay = currentStatus.activeElement;
            if (currentDisplay) {
                if (!isTextual(directionOverride)) {
                    directionOverride = currentDisplay.direction.next || currentStatus.activeSettings.direction.next;
                }
                mainController.jumpToItem(currentDisplay.index + 1, directionOverride, 'next');
            }
        },

        recedeItem: function(directionOverride) {
            const currentDisplay = currentStatus.activeElement;
            if (currentDisplay) {
                if (!isTextual(directionOverride)) {
                    directionOverride = currentDisplay.direction.prev || currentStatus.activeSettings.direction.prev;
                }
                mainController.jumpToItem(currentDisplay.index - 1, directionOverride, 'prev');
            }
        },

        jumpToItem: function(targetIndex, direction, type) {
            // console.log(`Jumping to item at index ${targetIndex}, direction: ${direction}, type: ${type}`);
            if (targetIndex >= 0 && targetIndex < currentStatus.itemCollection.length) {
                currentStatus.priorElement = currentStatus.activeElement;
                currentStatus.pendingElement = currentStatus.itemCollection[targetIndex];
                mainController.trigger('beforeChange');
                mainController.terminateView(true); // Close current immediately
                initiateDisplay(targetIndex); // Open new item
            } else {
                // console.log("Cannot jump to invalid index.");
            }
        },

        trigger: (eventName, ...args) => {
            const defaultCallback = currentStatus.activeSettings[eventName];
            if (typeof defaultCallback === 'function') {
                const result = defaultCallback.apply(mainController, args);
                if (result === false) {
                    return false;
                }
            }
            eventBus.dispatch(eventName, ...args);
            return true;
        },

        initiate: function() {
            mainController.commenceView.apply(this, arguments);
        }
    };

    Object.assign(configPresets, {
        padding : 15,
        margin  : 20,
        width     : 800,
        height    : 600,
        minWidth  : 100,
        minHeight : 100,
        maxWidth  : 9999,
        maxHeight : 9999,
        pixelRatio: 1,
        autoSize   : true,
        autoHeight : false,
        autoWidth  : false,
        autoResize  : true,
        autoCenter  : !(documentRef.createTouch !== undefined),
        fitToView   : true,
        aspectRatio : false,
        topRatio    : 0.5,
        leftRatio   : 0.5,
        scrolling : 'auto',
        wrapCSS   : '',
        arrows     : true,
        closeBtn   : true,
        closeClick : false,
        nextClick  : false,
        mouseWheel : true,
        autoPlay   : false,
        playSpeed  : 3000,
        preload    : 3,
        modal      : false,
        loop       : true,
        ajax  : {
            dataType : 'html',
            headers  : { 'X-PopUpView': true }
        },
        iframe : {
            scrolling : 'auto',
            preload   : true
        },
        swf : {
            wmode: 'transparent',
            allowfullscreen   : 'true',
            allowscriptaccess : 'always'
        },
        keys  : {
            next : {
                13 : 'left',
                34 : 'up',
                39 : 'left',
                40 : 'up'
            },
            prev : {
                8  : 'right',
                33 : 'down',
                37 : 'right',
                38 : 'down'
            },
            close  : [27],
            play   : [32],
            toggle : [70]
        },
        direction : {
            next : 'left',
            prev : 'right'
        },
        scrollOutside  : true,
        index   : 0,
        type    : null,
        href    : null,
        content : null,
        title   : null,
        tpl: {
            wrap     : '<div class="popup-view-container" tabIndex="-1"><div class="popup-view-skin"><div class="popup-view-outer"><div class="popup-view-inner"></div></div></div></div>',
            image    : '<img class="popup-view-image" src="{href}" alt="" />',
            iframe   : '<iframe id="popup-frame{rnd}" name="popup-frame{rnd}" class="popup-view-iframe" frameborder="0" vspace="0" hspace="0" webkitAllowFullScreen mozallowfullscreen allowFullScreen' + (navigatorRef.userAgent.match(/msie/i) ? ' allowtransparency="true"' : '') + '></iframe>',
            error    : '<p class="popup-view-error">Content load failed.<br/>Try again later.</p>',
            closeBtn : '<a title="Close" class="popup-element popup-close-button" href="javascript:;"></a>',
            next     : '<a title="Next" class="popup-navigation popup-next-button" href="javascript:;"><span></span></a>',
            prev     : '<a title="Previous" class="popup-navigation popup-prev-button" href="javascript:;"><span></span></a>'
        },
        openEffect  : 'fadeEffect',
        openSpeed   : 250,
        openEasing  : 'swing',
        openOpacity : true,
        openMethod  : 'zoomInEffect',
        closeEffect  : 'fadeEffect',
        closeSpeed   : 250,
        closeEasing  : 'swing',
        closeOpacity : true,
        closeMethod  : 'zoomOutEffect',
        nextEffect : 'fadeEffect',
        nextSpeed  : 250,
        nextEasing : 'swing',
        nextMethod : 'changeInEffect',
        prevEffect : 'fadeEffect',
        prevSpeed  : 250,
        prevEasing : 'swing',
        prevMethod : 'changeOutEffect',
        auxiliaries : {
            overlay : true,
            title   : true
        },
        onCancel     : () => {},
        beforeLoad   : () => {},
        afterLoad    : () => {},
        beforeShow   : () => {},
        afterShow    : () => {},
        beforeChange : () => {},
        beforeClose  : () => {},
        afterClose   : () => {}
    });

    return mainController;

})(window, document);