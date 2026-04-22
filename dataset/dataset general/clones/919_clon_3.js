/*jshint loopfunc: true */
(function(globalScope, domRoot, logger, SecureSocket, JSONUtil) {
    "use strict";

    // Validate core browser capabilities
    var
    requiredAPIs    =   {
        'elementSelector':      domRoot.querySelectorAll,
        'styleManipulator':     (domRoot.body || domRoot.documentElement).classList,
        'eventListener':        globalScope.addEventListener,
        'arrayIterator':        Array.prototype.forEach,
        'arraySearch':          Array.prototype.indexOf,
        'arrayMapper':          Array.prototype.map,
        'arrayReducer':         Array.prototype.reduce,
        'jsonParser':           JSONUtil && JSONUtil.parse && JSONUtil.stringify
    },
    allAPIsPresent  =   true; // Assume success initially

    // Check each dependency and mark body if missing
    Object.keys(requiredAPIs).forEach(function(apiName) {
        if(typeof requiredAPIs[apiName] === 'undefined') {
            (domRoot.body || domRoot.documentElement).classList.add(apiName + '-not-supported');
            allAPIsPresent =   false;
        }
    });

    // Exit early if critical APIs are not available
    if(!allAPIsPresent) {
        (domRoot.body || domRoot.documentElement).classList.add('presentation-unsupported');
        logger.error('Missing critical browser APIs. Exiting presentation script.');
        return; // Prevents further script execution
    }

    /**
     * Standardizes a URL hash by removing the leading '#' character.
     * @param {string} [fragmentIdentifier] - The hash string, defaults to window.location.hash.
     * @returns {string} The normalized hash string without '#'.
     */
    function normalizeFragment(fragmentIdentifier) {
        // If no hash is provided, use the current URL hash
        const currentHash = fragmentIdentifier || globalScope.location.hash;
        return currentHash.startsWith('#') ? currentHash.substring(1) : currentHash;
    }

    /**
     * Retrieves a collection of DOM elements matching a selector within a parent,
     * returning them as a standard Array.
     * @param {Element} parentElement - The element to search within.
     * @param {string} searchSelector - The CSS selector string.
     * @returns {Array<Element>} An array of matching elements.
     */
    function selectElementsAsArray(parentElement, searchSelector) {
        try {
            const nodeList = parentElement.querySelectorAll(searchSelector);
            return Array.from(nodeList); // Modern way to convert NodeList to Array
        } catch(err) {
            logger.warn('Error querying elements:', err.message);
            return [];
        }
    }

    /**
     * Pads a string on the left with a specified character until it reaches a target length.
     * @param {string|number} inputStr - The string or number to pad.
     * @param {string} padChar - The character to use for padding.
     * @param {number} targetLength - The desired final length of the string.
     * @returns {string} The left-padded string.
     */
    function padStringLeft(inputStr, padChar, targetLength) {
        let result = String(inputStr);
        while(result.length < targetLength) {
            result = padChar + result;
        }
        return result;
    }

    /**
     * Removes duplicate values from an array, preserving order.
     * @param {Array<any>} sourceArray - The array to deduplicate.
     * @returns {Array<any>} A new array with unique elements.
     */
    function removeDuplicates(sourceArray) {
        return Array.from(new Set(sourceArray)); // Efficient deduplication using Set
    }

    /**
     * Generates an array of integers within a specified inclusive range.
     * @param {number} startValue - The starting integer.
     * @param {number} endValue - The ending integer.
     * @returns {Array<number>} An array of integers from startValue to endValue.
     */
    function generateNumericRange(startValue, endValue) {
        if (startValue > endValue) return [];
        return Array.from({ length: endValue - startValue + 1 }, (_, index) => startValue + index);
    }

    /**
     * Calculates the sum of all numeric values in an array.
     * @param {Array<number>} numericArray - The array of numbers to sum.
     * @returns {number} The total sum.
     */
    function calculateArraySum(numericArray) {
        return numericArray.reduce((total, currentVal) => total + currentVal, 0);
    }

    /**
     * Extracts and converts the 'data-step' attribute value to a floating-point number.
     * @param {Element} targetElement - The DOM element to query.
     * @returns {number} The numeric value of the 'data-step' attribute.
     */
    function extractStepIndex(targetElement) {
        const stepAttr = targetElement.getAttribute('data-step');
        return Number(stepAttr); // More direct conversion than parseFloat * 1
    }

    var
    presenterModeActive =   false,
    presentationInstance; // Global reference for the presentation object

    /**
     * Represents the main presentation controller.
     * Manages slides, navigation, timers, and WebSocket communication.
     */
    function PresentationManager() {
        this._htmlElement             =   domRoot.getElementsByTagName('html')[0];
        this._bodyElement             =   domRoot.body || domRoot.documentElement;
        this._progressBar             =   domRoot.createElement('progress');
        this._timeDisplay             =   domRoot.createElement('time');
        this._slideDropdown           =   domRoot.createElement('select');
        this._viewerCountDisplay      =   domRoot.createElement('div');
        this._timerStartTime          =   null;
        this._webSocketClient         =   null;
        this._socketConnectionEstablished =   false;
        this._outgoingMessageQueue    =   [];

        this.mainPresentationContainer =   domRoot.getElementById('deck');
        this.allSlides                 =   selectElementsAsArray(this.mainPresentationContainer, 'section');
        this.presentationId            =   this.mainPresentationContainer.getAttribute('data-id');
        this.activeSlideElement        =   this.allSlides[0];
        this.currentSlideIndex         =   0;
        this.swipeTimeThreshold        =   parseFloat(this.mainPresentationContainer.dataset.touchDuration || '0') || 500; // Use dataset for easier access
        this.swipeDistanceThreshold    =   parseFloat(this.mainPresentationContainer.dataset.touchDistance || '0') || 150;
        this.isFullscreenActive        =   false;
        this.isDebugMode               =   !!JSONUtil.parse(this.mainPresentationContainer.dataset.debug || 'false');
        this.isPresenterControlling    =   false;
        this.canRemoteControl          =   null; // Tri-state: null (unset), true, false
    }

    /**
     * Logs debug messages to the console if debug mode is active.
     * @param {...any} messages - Messages to log.
     */
    PresentationManager.prototype._logDebugMessage      =   function() {
        if(this.isDebugMode && logger.debug) {
            logger.debug.apply(logger, arguments);
        }
    };

    /**
     * Initializes the presentation, setting up UI elements, slides, events, and WebSocket.
     */
    PresentationManager.prototype.initializePresentation =   function() {
        const _self = this; // Cache 'this' for internal callbacks

        // Setup the slide progress bar
        _self._progressBar.setAttribute('max', _self.allSlides.length);
        _self._updateProgressIndicator(1);
        _self._bodyElement.appendChild(_self._progressBar);

        // Setup the presentation timer/clock display
        _self._timeDisplay.id =   'presentation-timer';
        _self._timeDisplay.textContent =   '0:00';
        _self._bodyElement.appendChild(_self._timeDisplay);

        // If configured as a clock, start it immediately
        if(_self.mainPresentationContainer.dataset.counter === 'time') {
            _self._updateClockDisplay();
        }

        // Setup the viewer count display
        _self._viewerCountDisplay.id = 'active-viewers';
        _self._bodyElement.appendChild(_self._viewerCountDisplay);

        // Process each slide for initial setup
        _self.allSlides.forEach((slideElement, idx) => {
            // Ensure each slide has a unique ID
            if(!slideElement.id) {
                slideElement.id = `slide-${idx + 1}`;
            }

            // Identify and normalize step attributes within each slide
            const stepElements          =   selectElementsAsArray(slideElement, '[data-step]:not([data-step="0"])');
            const originalStepNumbers   =   removeDuplicates(stepElements.map(extractStepIndex)); // Get unique step numbers
            const normalizedStepNumbers =   generateNumericRange(1, originalStepNumbers.length); // Create a clean sequence 1..N

            // If step numbers are irregular, re-assign them
            if(originalStepNumbers.length !== normalizedStepNumbers.length || calculateArraySum(originalStepNumbers) !== calculateArraySum(normalizedStepNumbers)) {
                stepElements.forEach(stepEl => {
                    const originalVal = JSONUtil.parse(stepEl.getAttribute('data-step'));
                    const newStepVal = normalizedStepNumbers[originalStepNumbers.indexOf(originalVal)];
                    if (newStepVal !== undefined) { // Ensure a mapping exists
                        stepEl.setAttribute('data-step', newStepVal);
                    }
                });
            }

            // Store step information on the slide element itself
            slideElement.totalSteps          =   isFinite(normalizedStepNumbers.length) ? normalizedStepNumbers.length : 0;
            slideElement.setAttribute('data-current-step', 0);
            slideElement.setAttribute('data-total-steps', slideElement.totalSteps);
            slideElement.currentStepState    =   0; // Initialize current step for navigation
            slideElement.setAttribute('data-slide-position', idx + 1);
            slideElement.setAttribute('data-total-slides', _self.allSlides.length);
        });

        // Setup the slide navigation dropdown
        _self._slideDropdown.id = 'slide-navigator';
        const emptyOption = domRoot.createElement('option');
        for(let j = _self.allSlides.length - 1; j >= 0; j--) { // Iterate backwards for insertBefore
            const slideOption             =   emptyOption.cloneNode();
            slideOption.value             =   j;
            const slideIdentifier         =   _self.allSlides[j].id || `Unnamed Slide ${j+1}`;
            slideOption.textContent       =   `Slide ${padStringLeft(j + 1, '0', String(_self.allSlides.length).length)}: ${slideIdentifier}`;
            _self._slideDropdown.insertBefore(slideOption, _self._slideDropdown.firstChild);
        }
        _self._bodyElement.appendChild(_self._slideDropdown);
        _self._slideDropdown.addEventListener('change', function() {
            _self.transitionToSlide(parseFloat(_self._slideDropdown.value));
        }, false);

        // Adjust max-height of figures containing images on load for responsive layouts
        globalScope.addEventListener('load', () => {
            selectElementsAsArray(_self.mainPresentationContainer, 'figure').forEach(figureElement => {
                let currentMaxHeight    =   0;
                selectElementsAsArray(figureElement, 'img').forEach(imgElement => {
                    // Prioritize attribute height, then natural height
                    const imageHeight   =   imgElement.hasAttribute('height') ? parseFloat(imgElement.getAttribute('height')) : imgElement.naturalHeight;
                    currentMaxHeight    =   Math.max(currentMaxHeight, imageHeight);
                });
                figureElement.style.maxHeight  =   currentMaxHeight + 'px';
            });
        }, false);

        _self._setupWebSocketConnection(); // Initialize WebSocket communication

        // Handle initial URL hash for deep linking
        const currentFragment = normalizeFragment();
        if(!currentFragment && _self.allSlides.length > 0) {
            // No hash, navigate to the first slide
            globalScope.location.hash = _self.allSlides[0].id;
            _self.transitionToSlide(_self.allSlides[0], 0, 'initial_load');
        } else if (currentFragment) {
            // Hash exists, try to match it to a slide
            let matchedSlide = null;
            for (const slide of _self.allSlides) {
                if (slide.id === currentFragment) {
                    matchedSlide = slide;
                    break;
                }
            }
            if (matchedSlide) {
                _self.transitionToSlide(matchedSlide, 0, 'initial_load');
            } else {
                // Hash didn't match a slide, go to the first slide
                _self.goToFirstSlide();
            }
        } else {
            // No slides, no hash, perhaps an empty deck?
            _self._logDebugMessage('No slides found in the presentation deck.');
        }
        _self._bodyElement.setAttribute('data-current-url-fragment', normalizeFragment());

        // Add 'ready' class to HTML after initial setup
        globalScope.addEventListener('load', () => {
            _self._htmlElement.classList.add('presentation-ready');
        }, { once: true }); // Only run once

        // Listen for fullscreen state changes
        const fullscreenChangeHandler = (e) => {
            _self.isFullscreenActive = !!(domRoot.fullscreenElement || domRoot.webkitFullscreenElement || domRoot.mozFullScreenElement || domRoot.msFullscreenElement);
            _self._logDebugMessage('Fullscreen state changed:', _self.isFullscreenActive);
        };
        domRoot.addEventListener('fullscreenchange', fullscreenChangeHandler, false);
        domRoot.addEventListener('webkitfullscreenchange', fullscreenChangeHandler, false);
        domRoot.addEventListener('mozfullscreenchange', fullscreenChangeHandler, false);
        domRoot.addEventListener('MSFullscreenChange', fullscreenChangeHandler, false);


        // Setup keyboard navigation shortcuts
        domRoot.addEventListener('keydown', (e) => {
            switch(e.keyCode) {
                case 33: // Page Up
                case 37: // Left Arrow
                case 74: // J key
                    _self.previousSlide('keyboard_input');
                    break;
                case 34: // Page Down
                case 39: // Right Arrow
                case 75: // K key
                    _self.nextSlide('keyboard_input');
                    break;
                case 27: // Escape
                case 80: // P key
                    if(e.ctrlKey || e.keyCode === 80) { // Ctrl+P or P alone for presenter mode
                        _self._htmlElement.classList.toggle('presenter-view');
                        _self._logDebugMessage('Presenter view toggled.');
                    }
                    break;
                case 35: // End key
                    _self.goToLastSlide('keyboard_input');
                    break;
                case 36: // Home key
                    _self.goToFirstSlide('keyboard_input');
                    break;
                case 70: // F key
                    _self.activateFullscreen();
                    break;
                default:
                    // Unhandled key press
                    break;
            }
        }, false);

        // Setup touch swipe events for navigation
        if('ontouchstart' in _self._bodyElement) {
            let touchStartCoords = {'x': 0, 'y': 0, 'timestamp': 0};

            _self._bodyElement.addEventListener('touchstart', (e) => {
                const primaryTouch = e.changedTouches[0];
                touchStartCoords.x = primaryTouch.pageX;
                touchStartCoords.y = primaryTouch.pageY;
                touchStartCoords.timestamp = new Date().getTime();
                // e.preventDefault(); // Prevent default scrolling/zooming immediately
            }, { passive: true }); // Use passive listener for better scroll performance

            _self._bodyElement.addEventListener('touchmove', (e) => {
                // e.preventDefault(); // Prevent default touch behavior during move
            }, { passive: true });

            _self._bodyElement.addEventListener('touchend', (e) => {
                const primaryTouch = e.changedTouches[0];
                const endTime = new Date().getTime();
                const delta = {
                    x:    touchStartCoords.x - primaryTouch.pageX,
                    y:    touchStartCoords.y - primaryTouch.pageY,
                    time: endTime - touchStartCoords.timestamp
                };

                if(delta.time <= _self.swipeTimeThreshold) {
                    // Check if it's primarily a horizontal swipe
                    if(Math.abs(delta.x) >= Math.abs(delta.y)) {
                        if(delta.x >= _self.swipeDistanceThreshold) {
                            // Swipe left (move to next slide)
                            _self.nextSlide('touch_swipe');
                            if(!_self._timerStartTime) { _self._startOrRefreshTimer(); }
                        } else if(delta.x <= (0 - _self.swipeDistanceThreshold)) {
                            // Swipe right (move to previous slide)
                            _self.previousSlide('touch_swipe');
                            if(!_self._timerStartTime) { _self._startOrRefreshTimer(); }
                        }
                    } else {
                        // Vertical swipe - currently not implemented for navigation
                        _self._logDebugMessage('Vertical swipe detected, no action.');
                    }
                }
            }, { passive: true });
        }

        // Emit a custom event indicating the presentation is initialized
        _self._dispatchCustomEvent('presentationInitialized');
    };

    /**
     * Attempts to activate fullscreen mode for the presentation.
     * Uses feature detection to find the correct method.
     */
    PresentationManager.prototype.activateFullscreen =   function() {
        const docEl = this._htmlElement; // Target the HTML element for fullscreen

        if(docEl.requestFullscreen) {
            this.activateFullscreen = function() { docEl.requestFullscreen(); };
        } else if (docEl.webkitRequestFullscreen) {
            this.activateFullscreen = function() { docEl.webkitRequestFullscreen(); };
        } else if (docEl.mozRequestFullScreen) { // Note: mozRequestFullScreen (capital S)
            this.activateFullscreen = function() { docEl.mozRequestFullScreen(); };
        } else if (docEl.msRequestFullscreen) {
            this.activateFullscreen = function() { docEl.msRequestFullscreen(); };
        } else {
            this._logDebugMessage('Fullscreen API not supported by this browser.');
            return; // No fullscreen support
        }
        this.activateFullscreen(); // Execute the now-assigned method
    };

    /**
     * Sends a message via WebSocket, queuing it if the connection isn't ready.
     * @param {object} msgPayload - The message object to send.
     */
    PresentationManager.prototype._sendWebSocketMessage   =   function(msgPayload) {
        if(!msgPayload) {
            this._logDebugMessage('Attempted to send empty WebSocket message.');
            return;
        }

        // Add presentation ID and default type if not present
        msgPayload.presentationId =   this.presentationId;
        msgPayload.type           =   msgPayload.type || 'sync_update';

        // Always push to queue first to handle transient disconnects
        this._outgoingMessageQueue.push(msgPayload);
        this._logDebugMessage('Message queued:', msgPayload);

        // If socket is ready, process the queue
        if(this._socketConnectionEstablished) {
            while(this._outgoingMessageQueue.length > 0) {
                const messageToSend = this._outgoingMessageQueue.shift();
                try {
                    this._webSocketClient.send(JSONUtil.stringify(messageToSend));
                    this._logDebugMessage('Sent WebSocket message:', messageToSend);
                } catch (e) {
                    logger.error('Failed to send WebSocket message:', e, messageToSend);
                    // Re-queue if sending failed, or handle error differently
                    this._outgoingMessageQueue.unshift(messageToSend); // Put it back
                    break; // Stop processing queue for now
                }
            }
        } else {
            // If socket is offline, try again after a short delay
            setTimeout(() => this._sendWebSocketMessage(), 150); // Slightly longer delay
        }
    };

    /**
     * Sets up or re-establishes the WebSocket connection for remote control/sync.
     */
    PresentationManager.prototype._setupWebSocketConnection      =   function() {
        const _self = this; // Cache 'this'

        if(!SecureSocket || !this.mainPresentationContainer.dataset.syncServer) {
            // If WebSockets not supported or no sync server specified, use a dummy client
            _self._webSocketClient  =   {
                send:     function() { _self._logDebugMessage('Dummy socket send called.'); },
                status:   'UNSUPPORTED_OR_DISABLED'
            };
            _self._logDebugMessage('WebSocket sync disabled or not supported.');
            return;
        }

        // If a socket already exists and is open, close it before reconnecting
        if (_self._webSocketClient && _self._webSocketClient.readyState === SecureSocket.OPEN) {
            _self._webSocketClient.close(1000, 'Reconnecting');
        }

        // Construct WebSocket URL
        const isSecure = !(JSONUtil.parse(_self.mainPresentationContainer.dataset.syncInsecure || 'false'));
        const protocol = isSecure ? 'wss' : 'ws';
        const serverAddress = _self.mainPresentationContainer.dataset.syncServer;
        const socketUrl = `${protocol}://${serverAddress}/socket/`;

        _self._webSocketClient         =   new SecureSocket(socketUrl);
        _self._webSocketClient.onopen      =   () => {
            _self._socketConnectionEstablished    =   true;
            _self._sendWebSocketMessage({'type': 'heartbeat_ping'});
            _self._bodyElement.setAttribute('data-syncing-active', 'true');
            _self._logDebugMessage('WebSocket connection established.');
            // Send any queued messages immediately after connection
            _self._sendWebSocketMessage();
        };
        _self._webSocketClient.onerror     =   (error) => {
            logger.error('WebSocket error occurred:', error);
            _self._bodyElement.setAttribute('data-syncing-active', 'false');
        };
        _self._webSocketClient.onmessage   =   (messageEvent) => {
            _self._logDebugMessage('Received WebSocket message:', messageEvent.data);
            try {
                const incomingMessage = JSONUtil.parse(messageEvent.data);

                if(incomingMessage.type === 'sync_update') {
                    if(_self.canRemoteControl === null) {
                        _self.canRemoteControl  =   globalScope.confirm('Allow remote controller to manage this presentation?');
                    }
                    if(_self.canRemoteControl) {
                        _self.transitionToSlide(normalizeFragment(incomingMessage.hash), incomingMessage.step, 'remote_socket');
                    }
                } else if(incomingMessage.type === 'heartbeat_pong') {
                    presenterModeActive =   incomingMessage.authStatus;
                    _self.isPresenterControlling =   !!presenterModeActive;
                    _self._bodyElement.setAttribute('data-is-presenter-controlling', _self.isPresenterControlling.toString());
                    if(_self.canRemoteControl === null) {
                        _self.canRemoteControl  =   true; // Default to allowing control if pong received
                    }
                } else if(incomingMessage.type === 'viewer_count') {
                    _self._viewerCountDisplay.textContent   =   `Viewers: ${incomingMessage.count}`;
                } else {
                    _self._logDebugMessage('Unknown WebSocket message type received:', incomingMessage.type);
                }
            } catch (e) {
                logger.error('Failed to parse or process WebSocket message:', e, messageEvent.data);
            }
        };
        _self._webSocketClient.onclose     =   () => {
            _self._socketConnectionEstablished    =   false;
            _self._bodyElement.setAttribute('data-syncing-active', 'false');
            _self._logDebugMessage('WebSocket connection closed. Attempting reconnect in 1 second...');
            setTimeout(() => _self._setupWebSocketConnection(), 1000); // Attempt reconnection
        };
    };

    /**
     * Starts or refreshes the elapsed time timer display.
     */
    PresentationManager.prototype._startOrRefreshTimer  =   function() {
        const currentTime = new Date();
        if(!this._timerStartTime) {
            this._timerStartTime    =   currentTime;
        }

        // If it's a clock, this function does nothing
        if(this.mainPresentationContainer.dataset.counter === 'time') {
            return;
        }

        const elapsedTimeMs = currentTime.getTime() - this._timerStartTime.getTime();
        const minutes = Math.floor(elapsedTimeMs / 60000);
        const seconds = Math.floor((elapsedTimeMs % 60000) / 1000);
        this._timeDisplay.textContent =   `${minutes}:${padStringLeft(seconds, '0', 2)}`;

        // Schedule next update
        globalScope.requestAnimationFrame(() => this._startOrRefreshTimer()); // Use requestAnimationFrame for smoother updates
    };

    /**
     * Updates the clock display with the current time.
     */
    PresentationManager.prototype._updateClockDisplay    =   function() {
        /**
         * Converts a 24-hour format hour to 12-hour format.
         * @param {number} hour24 - Hour in 24-hour format (0-23).
         * @returns {number} Hour in 12-hour format (1-12).
         */
        function convertTo12Hour(hour24) {
            let hour12 = hour24 % 12;
            return hour12 === 0 ? 12 : hour12;
        }

        const now = new Date();
        const currentHour = convertTo12Hour(now.getHours());
        const currentMinute = now.getMinutes();
        this._timeDisplay.textContent =   `${currentHour}:${padStringLeft(currentMinute, '0', 2)}`;

        // Schedule next update for the start of the next minute
        const secondsUntilNextMinute = 60 - now.getSeconds();
        setTimeout(() => this._updateClockDisplay(), secondsUntilNextMinute * 1000);
    };

    /**
     * Updates the progress bar and slide selector dropdown.
     * @param {number} currentSlideNumber - The 1-based index of the current slide.
     */
    PresentationManager.prototype._updateProgressIndicator    =   function(currentSlideNumber) {
        this._progressBar.value = currentSlideNumber;
        this._slideDropdown.value = currentSlideNumber - 1; // Dropdown is 0-indexed
    };

    /**
     * Dispatches a custom event from the main presentation container.
     * @param {string} eventType - The name of the custom event.
     * @param {object} [eventDetails] - Optional details object for the event.
     */
    PresentationManager.prototype._dispatchCustomEvent      =   function(eventType, eventDetails) {
        const details = eventDetails || {};
        details.presentationObject = this; // Attach the presentation instance to event details

        const customEvent   =   new CustomEvent(eventType, {
            detail: details,
            bubbles: true,
            cancelable: true // Allow event to be cancelled
        });
        this._logDebugMessage(`Dispatching '${eventType}' event:`, details);
        this.mainPresentationContainer.dispatchEvent(customEvent);
    };

    // Global listener for presentation change events, primarily for presenter mode
    domRoot.addEventListener('presentationChange', (e) => {
        // Ensure event is from a controlled presentation and sent by a local source
        if(presenterModeActive && e.detail && e.detail.presentationObject && e.detail.slideElement && e.detail.source && e.detail.source !== 'remote_socket') {
            const currentPresentation = e.detail.presentationObject;
            currentPresentation._sendWebSocketMessage({
                hash: e.detail.slideElement.id,
                step: e.detail.stepIndex,
                type: 'sync_update'
            });
        }
    }, false);

    /**
     * Navigates to a specified slide and step.
     * @param {Element|string|number} targetSlide - The target slide element, its ID, or its 0-based index.
     * @param {number} [targetStep=0] - The step index within the slide to navigate to.
     * @param {string} [eventSource='programmatic'] - Identifier for the event's origin (e.g., 'keyboard_input', 'remote_socket').
     */
    PresentationManager.prototype.transitionToSlide    =   function(targetSlide, targetStep = 0, eventSource = 'programmatic') {
        // Start timer if first interaction and not already running
        if(!this._timerStartTime && (eventSource === 'keyboard_input' || eventSource === 'touch_swipe')) {
            this._startOrRefreshTimer();
        }

        let slideElementToActivate;
        let slideIndexToActivate;

        if(typeof targetSlide === 'string') {
            // If string, assume it's a slide ID
            slideElementToActivate = this.allSlides.find(s => s.id === normalizeFragment(targetSlide));
            slideIndexToActivate = slideElementToActivate ? this.allSlides.indexOf(slideElementToActivate) : -1;
        } else if (typeof targetSlide === 'number') {
            // If number, assume it's a 0-based index
            slideIndexToActivate = targetSlide;
            slideElementToActivate = this.allSlides[slideIndexToActivate];
        } else if (targetSlide instanceof Element) {
            // If Element, use it directly
            slideElementToActivate = targetSlide;
            slideIndexToActivate = this.allSlides.indexOf(targetSlide);
        } else {
            this._logDebugMessage('Invalid target slide provided:', targetSlide);
            return;
        }

        if (!slideElementToActivate || slideIndexToActivate === -1) {
            this._logDebugMessage('Target slide not found:', targetSlide);
            return;
        }

        // Ensure step is within valid bounds for the slide
        const totalStepsForSlide = slideElementToActivate.totalSteps || 0;
        const normalizedStep = Math.max(0, Math.min(targetStep, totalStepsForSlide));

        // Only proceed if there's an actual change in slide or step
        const isSameSlide = (this.activeSlideElement === slideElementToActivate);
        const isSameStep = (this.activeSlideElement && this.activeSlideElement.currentStepState === normalizedStep);

        if (isSameSlide && isSameStep && this.currentSlideIndex === slideIndexToActivate) {
            this._logDebugMessage('Already at target slide and step, no transition needed.');
            return;
        }

        // Deactivate current slide/step
        if (this.activeSlideElement) {
            this.activeSlideElement.classList.remove('active-slide');
            this.activeSlideElement.classList.remove('active-step-' + this.activeSlideElement.currentStepState);
        }

        // Activate new slide/step
        slideElementToActivate.classList.add('active-slide');
        slideElementToActivate.classList.add('active-step-' + normalizedStep);
        slideElementToActivate.currentStepState = normalizedStep; // Update internal state
        globalScope.location.hash = slideElementToActivate.id; // Update URL hash

        this.activeSlideElement = slideElementToActivate;
        this.currentSlideIndex = slideIndexToActivate;

        // Update UI elements
        this._updateProgressIndicator(slideIndexToActivate + 1);
        this._bodyElement.setAttribute('data-current-url-fragment', normalizeFragment(slideElementToActivate.id));
        this._bodyElement.setAttribute('data-active-slide-index', slideIndexToActivate);
        this._bodyElement.setAttribute('data-active-slide-step', normalizedStep);

        // Emit change event
        this._dispatchCustomEvent('presentationChange', {
            slideElement: slideElementToActivate,
            slideIndex: slideIndexToActivate,
            stepIndex: normalizedStep,
            source: eventSource
        });
        this._logDebugMessage(`Navigated to slide ${slideIndexToActivate + 1}, step ${normalizedStep} from ${eventSource}.`);
    };

    /**
     * Navigates to the previous slide or step.
     * @param {string} [eventSource='programmatic'] - Identifier for the event's origin.
     */
    PresentationManager.prototype.previousSlide =   function(eventSource = 'programmatic') {
        const currentSlide = this.activeSlideElement;
        if (!currentSlide) {
            this._logDebugMessage('No active slide to go back from.');
            return;
        }

        if (currentSlide.currentStepState > 0) {
            // Go to previous step on the current slide
            this.transitionToSlide(currentSlide, currentSlide.currentStepState - 1, eventSource);
        } else if (this.currentSlideIndex > 0) {
            // Go to previous slide, last step
            const prevSlide = this.allSlides[this.currentSlideIndex - 1];
            this.transitionToSlide(prevSlide, prevSlide.totalSteps || 0, eventSource);
        } else {
            this._logDebugMessage('Already at the first slide and first step.');
        }
    };

    /**
     * Navigates to the next slide or step.
     * @param {string} [eventSource='programmatic'] - Identifier for the event's origin.
     */
    PresentationManager.prototype.nextSlide =   function(eventSource = 'programmatic') {
        const currentSlide = this.activeSlideElement;
        if (!currentSlide) {
            this._logDebugMessage('No active slide to go forward from.');
            return;
        }

        if (currentSlide.currentStepState < (currentSlide.totalSteps || 0)) {
            // Go to next step on the current slide
            this.transitionToSlide(currentSlide, currentSlide.currentStepState + 1, eventSource);
        } else if (this.currentSlideIndex < this.allSlides.length - 1) {
            // Go to next slide, first step
            const nextSlide = this.allSlides[this.currentSlideIndex + 1];
            this.transitionToSlide(nextSlide, 0, eventSource);
        } else {
            this._logDebugMessage('Already at the last slide and last step.');
        }
    };

    /**
     * Navigates to the very first slide of the presentation.
     * @param {string} [eventSource='programmatic'] - Identifier for the event's origin.
     */
    PresentationManager.prototype.goToFirstSlide =   function(eventSource = 'programmatic') {
        if (this.allSlides.length > 0) {
            this.transitionToSlide(this.allSlides[0], 0, eventSource);
        } else {
            this._logDebugMessage('No slides available to go to first.');
        }
    };

    /**
     * Navigates to the very last slide of the presentation.
     * @param {string} [eventSource='programmatic'] - Identifier for the event's origin.
     */
    PresentationManager.prototype.goToLastSlide =   function(eventSource = 'programmatic') {
        if (this.allSlides.length > 0) {
            const lastSlideIndex = this.allSlides.length - 1;
            const lastSlide = this.allSlides[lastSlideIndex];
            this.transitionToSlide(lastSlide, lastSlide.totalSteps || 0, eventSource); // Go to the last step of the last slide
        } else {
            this._logDebugMessage('No slides available to go to last.');
        }
    };

    // Initialize the presentation when the DOM is ready
    domRoot.addEventListener('DOMContentLoaded', function() {
        presentationInstance = new PresentationManager();
        presentationInstance.initializePresentation();
    });

}(window, document, console, WebSocket, JSON));