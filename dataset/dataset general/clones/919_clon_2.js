/* This file manages presentation logic and interactions. */
(function(globalObj, pageDOM, debugLog, webSock, jsnParser) {
    "use strict";

    // Create aliases for common array prototype methods to fulfill renaming requirement
    const arrayEach = Array.prototype.forEach;
    const arrayFindIndex = Array.prototype.indexOf;
    const arrayTransform = Array.prototype.map;
    const arrayFold = Array.prototype.reduce;

    // Verify essential browser APIs are available
    var
    requiredModules    =   {
        'queryselectorall':     pageDOM.querySelectorAll,
        'classlist':            (pageDOM.body || pageDOM.documentElement).classList,
        'addeventlistener':     globalObj.addEventListener,
        'forEach':              arrayEach,
        'indexOf':              arrayFindIndex,
        'map':                  arrayTransform,
        'reduce':               arrayFold,
        'json':                 jsnParser && jsnParser.parse && jsnParser.stringify
    },
    allReqsSatisfied =   true; // Assume success initially


    for (var reqKey in requiredModules) {
        if(typeof requiredModules[reqKey] === 'undefined') {
            (pageDOM.body || pageDOM.documentElement).className   +=  [' ', reqKey, '-not-present'].join('');
            allReqsSatisfied =   false;
        }
    }
    if(!allReqsSatisfied) {
        (pageDOM.body || pageDOM.documentElement).className   +=  ' system-unsupported';
        return; // Exit script if critical features are missing
    }


    // Removes leading '#' from a URL fragment for consistent parsing
    function normalizeFragment(urlFragment) {
        if(!urlFragment) {
            urlFragment    =   globalObj.location.hash;
        }
        return urlFragment.replace(/^#/, '');
    }

    // Retrieves a list of DOM elements matching a CSS selector within a parent, as an Array
    function selectDOMElements(parentEl, cssSelector) {
        try {
            return Array.prototype.slice.call(parentEl.querySelectorAll(cssSelector), 0);
        } catch(err) {
            return []; // Return empty array on error
        }
    }

    // Prepends a character to a string until it reaches a desired length
    function prefixString(inputStr, fillChar, targetLen) {
        inputStr     =   String(inputStr);
        while(inputStr.length < targetLen) {
            inputStr     =   [fillChar, inputStr].join('');
        }
        return inputStr;
    }

    // Filters out duplicate entries from a given array
    function removeDuplicates(originalArray) {
        return originalArray.arrayFold(function(uniqueItemsList, currentItem) {
            if(uniqueItemsList.arrayFindIndex(currentItem) < 0) {
                uniqueItemsList.push(currentItem);
            }
            return uniqueItemsList;
        }, []);
    }

    // Generates an array of integers within a specified inclusive range
    function generateSequence(startVal, endVal) {
        var
        resultArr     =   [];
        while(startVal <= endVal) {
            resultArr.push(startVal++);
        }
        return resultArr;
    }

    // Computes the sum of all numerical values in an array
    function calculateTotal(numberArray) {
        return numberArray.arrayFold(function(accumulator, currentNum) {
            return accumulator + currentNum;
        }, 0);
    }

    // Extracts and converts the 'data-step' attribute to a number from a DOM element
    function extractStepValue(domElement) {
        return parseFloat(domElement.getAttribute('data-step')) * 1;
    }

    var
    masterControl  =   false, // Indicates if this client is the presentation master
    _presentation; // The main presentation instance

    // Constructor for the primary Presentation object
    // Methods and properties starting with '_' are considered internal and may change.
    function Presentation() {
        this._htmlEl             =   pageDOM.getElementsByTagName('html')[0];
        this._bodyEl             =   pageDOM.body || pageDOM.documentElement;
        this._progressBar        =   pageDOM.createElement('progress');
        this._timeDisplay        =   pageDOM.createElement('time');
        this._slideSelector      =   pageDOM.createElement('select');
        this._audienceCounter    =   pageDOM.createElement('div');
        this._startTime          =   null; // Timestamp when the presentation timer started
        this._commSocket         =   null; // WebSocket instance
        this._socketConnected    =   false; // Status of the WebSocket connection
        this._socketMessageQueue =   []; // Queue for messages when socket is offline
        this.stage               =   pageDOM.getElementById('deck'); // The main presentation container
        this.sections            =   selectDOMElements(this.stage, 'section'); // All individual slides/sections
        this.uniqueId            =   this.stage.getAttribute('data-id'); // Unique identifier for this presentation
        this.activeSection       =   this.sections[0]; // The currently displayed section
        this.currentIdx          =   0; // Index of the current section
        this.tapDuration         =   Math.max(this.stage.getAttribute('data-touch-duration') ? parseFloat(this.stage.getAttribute('data-touch-duration')) : 0, 500); // Max touch duration for a swipe
        this.tapDistance         =   Math.max(this.stage.getAttribute('data-touch-distance') ? parseFloat(this.stage.getAttribute('data-touch-distance')) : 0, 150); // Min touch distance for a swipe
        this.fullScreenMode      =   false; // Fullscreen state
        this.debugEnabled        =   this.stage.getAttribute('data-debug') ? !!jsnParser.parse(this.stage.getAttribute('data-debug')) : false; // Debugging active?
        this.isControlled        =   false; // Is this instance being remotely controlled?
        this.canBeControlled     =   null; // User permission for remote control
    }

    // Logs debug messages if debugging is enabled and console.debug exists
    Presentation.prototype._logDebug      =   function() {
        if(this.debugEnabled && debugLog.debug) {
            debugLog.debug.apply(debugLog, arguments);
        }
    };

    // Initializes the presentation, setting up UI elements and event listeners
    Presentation.prototype.initialize =   function() {
        // Configure the progress indicator
        _presentation._progressBar.setAttribute('max', _presentation.sections.length);
        _presentation._updateProgress(1); // Set initial progress to first slide
        _presentation._bodyEl.appendChild(_presentation._progressBar);

        // Set up the presentation timer display
        _presentation._timeDisplay.setAttribute('id', 'timer-display');
        _presentation._timeDisplay.innerHTML =   '0:00';
        _presentation._bodyEl.appendChild(_presentation._timeDisplay);

        // If configured as a clock, start updating it immediately
        if(_presentation.stage.getAttribute('data-counter') === 'time') {
            _presentation._refreshClock();
        }

        // Prepare the audience counter display
        _presentation._audienceCounter.setAttribute('id', 'audience-count');
        _presentation._bodyEl.appendChild(_presentation._audienceCounter);

        // Iterate through each section for initial setup and step calculation
        _presentation.sections.arrayEach(function(section, idx) {
            // Assign an ID if one isn't already present
            if(!section.getAttribute('id')) {
                section.setAttribute('id', ['slide-section', idx + 1].join('-'));
            }
            // Determine and normalize steps within each section
            var
            sectionSteps           =   selectDOMElements(section, '[data-step]:not([data-step="0"])'), // Exclude data-step="0" as they appear initially
            originalStepNums   =   removeDuplicates(sectionSteps.arrayTransform(extractStepValue)), // Get unique step numbers
            correctedStepNums       =   generateSequence(1, originalStepNums.length), // Re-sequence steps from 1 to fix gaps
            maxStepNum        =   Math.max.apply(null, correctedStepNums); // Find the highest step number

            if(!(originalStepNums.length === correctedStepNums.length && calculateTotal(originalStepNums) === calculateTotal(correctedStepNums))) {
                // If steps are missing or out of sequence, correct the data-step attributes
                sectionSteps.arrayEach(function(stepElement) {
                    stepElement.setAttribute('data-step', correctedStepNums[originalStepNums.arrayFindIndex(jsnParser.parse(stepElement.getAttribute('data-step')))]);
                });
            }

            section.totalSteps         =   isFinite(maxStepNum) ? maxStepNum : 0; // Store max step count
            section.setAttribute('data-current-step', 0); // Initialize current step for presenter mode
            section.setAttribute('data-steps', section.totalSteps); // Store total steps for presenter mode
            section.activeStep   =   0; // Initialize current step property
            section.setAttribute('data-slide', idx + 1); // Store slide number for presenter mode
            section.setAttribute('data-total', _presentation.sections.length); // Total sections count (redundant but included for presenter mode)
        });

        // Initialize the slide navigation selector
        _presentation._slideSelector.setAttribute('id', 'section-selector');
        var
        optNode  =   pageDOM.createElement('option'),
        counter       =   _presentation.sections.length;
        while(counter--) {
            var
            currentOpt             =   optNode.cloneNode();
            currentOpt.setAttribute('value', counter);
            currentOpt.innerHTML   =   'Section ' + prefixString(counter + 1, '0', String(_presentation.sections.length).length) + ': ' + _presentation.sections[counter].getAttribute('id');
            _presentation._slideSelector.insertBefore(currentOpt, _presentation._slideSelector.firstChild);
        }
        _presentation._bodyEl.appendChild(_presentation._slideSelector);
        _presentation._slideSelector.addEventListener('change', function(evt) {
            _presentation.transitionToSection(parseFloat(_presentation._slideSelector.value));
        }, false);

        // Adjust max-height of figure elements based on contained images for responsive layouts
        globalObj.addEventListener('load', function() {
            selectDOMElements(_presentation.stage, 'figure').arrayEach(function(figElement) {
                figElement.maxHeight    =   0;
                selectDOMElements(figElement, 'img').arrayEach(function(imageEl) {
                    imageEl.computedHeight   =   imageEl.getAttribute('height') ? parseFloat(imageEl.getAttribute('height')) : imageEl.height; // Use attribute height if set, otherwise natural height for retina scaling
                    figElement.maxHeight    =   imageEl.computedHeight > figElement.maxHeight ? imageEl.computedHeight : figElement.maxHeight;
                });
                figElement.style.maxHeight  =   figElement.maxHeight + 'px';
            });
        }, false);

        _presentation._configureSocket(); // Set up WebSocket communication if enabled

        // Handle initial hash in URL: navigate if present, otherwise default to first slide
        if(!globalObj.location.hash) {
            globalObj.location.hash    =   _presentation.sections.length ? _presentation.sections[0].getAttribute('id') : '';
            _presentation.transitionToSection(_presentation.sections[0], 0, 'initial_load');
        } else {
            // Check if any section matches the URL hash
            var
            foundMatch     =   false;
            _presentation.sections.arrayEach(function(section) {
                if(section.getAttribute('id') === normalizeFragment()) {
                    foundMatch =   true;
                    _presentation.transitionToSection(section, 0, 'initial_load');
                    return; // Stop iterating
                }
            });
            if(!foundMatch) {
                // If no match, go to the very first section
                _presentation.goToStart();
            }
        }
        _presentation._bodyEl.setAttribute('data-active-section', normalizeFragment());

        // Add a 'ready' class to the html tag once all assets have loaded
        globalObj.addEventListener('load', function() {
            _presentation._htmlEl.classList.add('presentation-ready');
        });

        // Monitor fullscreen state changes across different browser implementations
        pageDOM.addEventListener('webkitfullscreenchange', function(evt) {
            _presentation.fullScreenMode    =   !!pageDOM.webkitFullscreenElement;
        }, false);
        pageDOM.addEventListener('mozfullscreenchange', function(evt) {
            _presentation.fullScreenMode    =   !!pageDOM.mozFullScreenElement;
        }, false);
        pageDOM.addEventListener('msfullscreenchange', function(evt) {
            _presentation.fullScreenMode    =   !!pageDOM.msFullscreenElement;
        }, false);
        pageDOM.addEventListener('fullscreenchange', function(evt) {
            _presentation.fullScreenMode    =   !!pageDOM.fullscreenElement;
        }, false);

        // Configure keyboard shortcuts for navigation and controls
        pageDOM.addEventListener('keydown', function(evt) {
            switch(evt.keyCode) {
                case 33: // Page Up
                case 37: // Left Arrow
                case 74: // J key
                    _presentation.prevSection('keyboard_input');
                    break;
                case 34: // Page Down
                case 39: // Right Arrow
                case 75: // K key
                    _presentation.nextSection('keyboard_input');
                    break;
                case 27: // Escape
                case 80: // P key
                    if(evt.ctrlKey || evt.keyCode === 80) {
                        _presentation._htmlEl.classList.toggle('presenter-mode');
                    }
                    break;
                case 35: // End key
                    _presentation.goToEnd('keyboard_input');
                    break;
                case 36: // Home key
                    _presentation.goToStart('keyboard_input');
                    break;
                case 70: // F key
                    _presentation.enterFullScreen();
                    break;
                default:
                    // No specific action for other keys
                    break;
            }
        }, false);

        // If touch events are supported, enable swipe gestures
        if('ontouchstart' in _presentation._bodyEl) {
            var
            tapStart       =   {'x': 0, 'y': 0, 'timeStamp': 0};
            _presentation._bodyEl.addEventListener('touchstart', function (evt) {
                var
                firstTouch       =   evt.changedTouches[0];
                tapStart.x     =   firstTouch.pageX;
                tapStart.y     =   firstTouch.pageY;
                tapStart.timeStamp  =   new Date().getTime();
                evt.preventDefault(); // Prevent default browser touch behavior
            }, false);
            _presentation._bodyEl.addEventListener('touchmove', function(evt) {
                evt.preventDefault(); // Prevent scrolling during touch move
            }, false);
            _presentation._bodyEl.addEventListener('touchend', function(evt) {
                var
                lastTouch       =   evt.changedTouches[0],
                currentTime         =   new Date().getTime(),
                tapDiff      =   {
                    'x':    tapStart.x - lastTouch.pageX,
                    'y':    tapStart.y - lastTouch.pageY,
                    'timeStamp': currentTime - tapStart.timeStamp
                };
                if(tapDiff.timeStamp <= _presentation.tapDuration) {
                    // Check if the gesture was quick enough
                    if(Math.abs(tapDiff.x) >= Math.abs(tapDiff.y)) {
                        // Horizontal swipe detected
                        if(tapDiff.x >= _presentation.tapDistance) {
                            // Swipe left (next section)
                            _presentation.nextSection('touch_gesture');
                            if(!_presentation._startTime) {
                                _presentation._refreshTimer();
                            }
                        } else if(tapDiff.x <= (0 - _presentation.tapDistance)) {
                            // Swipe right (previous section)
                            _presentation.prevSection('touch_gesture');
                            if(!_presentation._startTime) {
                                _presentation._refreshTimer();
                            }
                        }
                    } else {
                        // Vertical swipe (currently not implemented for navigation)
                    }
                }
            }, false);
        }

        // Dispatch a custom event indicating presentation initialization is complete
        _presentation._dispatchCustomEvent('presentationInitialized');
    };

    // Provides a cross-browser method to request fullscreen mode for the presentation
    Presentation.prototype.enterFullScreen =   function() {
        // This function is dynamically re-assigned on first call based on browser support
        if(this._htmlEl.webkitRequestFullscreen) {
            this.enterFullScreen     =   function() {
                this._htmlEl.webkitRequestFullscreen();
            };
        } else if (this._htmlEl.msRequestFullscreen) {
            this.enterFullScreen     =   function() {
                this._htmlEl.msRequestFullscreen();
            };
        } else if (this._htmlEl.mozRequestFullscreen) {
            this.enterFullScreen     =   function() {
                this._htmlEl.mozRequestFullscreen();
            };
        } else if(this._htmlEl.requestFullscreen) {
            this.enterFullScreen     =   function() {
                this.stage.requestFullscreen();
            };
        }
        this.enterFullScreen(); // Call the now-overridden function
    };

    // Handles sending messages via the WebSocket connection
    Presentation.prototype._transmitSocketMsg   =   function(dataPacket) {
        if(dataPacket) {
            // Include presentation ID for server-side routing
            dataPacket.identifier      =   this.uniqueId;
            // Default message type to 'sync' if not specified
            dataPacket.msgType    =   dataPacket.msgType ? dataPacket.msgType : 'sync';
            // Add message to a queue in case the socket is not yet ready
            this._socketMessageQueue.push(dataPacket);
        }
        if(this._socketConnected) {
            // If connected, send all queued messages
            dataPacket =   this._socketMessageQueue.shift();
            while(dataPacket) {
                this._commSocket.send(jsnParser.stringify(dataPacket));
                this._logDebug('transmitting data', jsnParser.stringify(dataPacket));
                dataPacket =   this._socketMessageQueue.shift();
            }
        } else {
            // If offline, attempt to resend after a short delay
            var
            currentPresentation   =   this;
            globalObj.setTimeout(function() {
                currentPresentation._transmitSocketMsg();
            }, 100);
        }
    };

    // Establishes and manages the WebSocket connection for remote control/sync
    Presentation.prototype._configureSocket      =   function() {
        if(webSock && this.stage.getAttribute('data-sync-server')) {
            this._configureSocket =   function() {
                // Initialize WebSocket for remote interactions
                _presentation._commSocket         =   new webSock([(!!jsnParser.parse(_presentation.stage.getAttribute('data-sync-insecure')) ? 'ws' : 'wss'), '://', _presentation.stage.getAttribute('data-sync-server'), '/socket/'].join(''));
                _presentation._commSocket.onopen      =   function() {
                    _presentation._socketConnected    =   true;
                    _presentation._transmitSocketMsg({'msgType': 'ping'}); // Send initial ping
                    _presentation._bodyEl.setAttribute('data-sync-status', true); // Indicate syncing
                };
                _presentation._commSocket.onerror     =   function(errorEvent) {
                    try {
                        debugLog.error('socket communication error', errorEvent);
                    } catch(e) {}
                    _presentation._bodyEl.setAttribute('data-sync-status', false); // Indicate sync failure
                };
                _presentation._commSocket.onmessage   =   function(messageEvent) {
                    _presentation._logDebug('data received', messageEvent);
                    var incomingData     =   jsnParser.parse(messageEvent.data);
                    if(incomingData.msgType === 'sync') {
                        if(_presentation.canBeControlled === null) {
                            _presentation.canBeControlled  =   globalObj.confirm('Allow remote presenter to control your screen?');
                        }
                        if(_presentation.canBeControlled) {
                            _presentation.transitionToSection(normalizeFragment(incomingData.fragment), incomingData.stepNum, 'remote_socket');
                        }
                    } else if(incomingData.msgType === 'pong') {
                        masterControl      =   incomingData.authStatus; // Update master control status
                        _presentation.isControlled =   !!masterControl;
                        _presentation._bodyEl.setAttribute('data-is-controlled', !!masterControl);
                        if(_presentation.canBeControlled === null) {
                            _presentation.canBeControlled  =   true; // Assume control is allowed if pong received
                        }
                    } else if(incomingData.msgType === 'viewers') {
                        _presentation._audienceCounter.innerHTML   =   incomingData.viewerCount; // Update viewer count display
                    }
                };
                _presentation._commSocket.onclose     =   function() {
                    _presentation._socketConnected    =   false;
                    globalObj.setTimeout(_presentation._configureSocket, 1000); // Attempt to reconnect after 1 second
                };
            };
        } else {
            // Fallback for browsers without WebSocket support or if sync server is not configured
            this._configureSocket    =   function() {
                this._commSocket  =   {
                    'send':     function() {}, // Dummy send function
                    'status':   'UNSUPPORTED_SOCKETS'
                };
            };
        }
        this._configureSocket(); // Execute the (potentially overridden) setup function
    };

    // Updates the elapsed time timer display
    Presentation.prototype._refreshTimer  =   function() {
        var
        currentTime     =   new Date(),
        timeElapsed;
        if(!_presentation._startTime) {
            _presentation._startTime    =   currentTime; // Start timer if not already running
        }
        if(_presentation.stage.getAttribute('data-counter') === 'time') {
            return; // If configured as a clock, this function does nothing
        }
        timeElapsed =   currentTime - _presentation._startTime;
        _presentation._timeDisplay.innerHTML =   [Math.floor(timeElapsed / 60000), prefixString(Math.floor(timeElapsed / 1000) % 60, '0', 2)].join(':');
        globalObj.setTimeout(function() {
            _presentation._refreshTimer();
        }, 1000); // Update every second
    };

    // Updates the clock display with current time
    Presentation.prototype._refreshClock    =   function() {
        function convertTo12Hour(hrVal) {
            if(hrVal >= 12) {
                hrVal    =    hrVal - 12;
            }
            if(hrVal === 0) {
                hrVal    =   12;
            }
            return hrVal;
        }
        var
        currentTime     =   new Date();
        _presentation._timeDisplay.innerHTML =   [convertTo12Hour(currentTime.getHours()), currentTime.getMinutes()].join(':');
        globalObj.setTimeout(function() {
            _presentation._refreshClock();
        }, (60 - currentTime.getSeconds()) * 1000); // Schedule next update for the start of the next minute
    };

    // Sets the progress bar value and updates the slide selector
    Presentation.prototype._updateProgress    =   function(progressValue) {
        this._progressBar.setAttribute('value', progressValue);
        this._slideSelector.value       =   progressValue - 1;
    };

    // Dispatches a custom event from the presentation stage
    Presentation.prototype._dispatchCustomEvent      =   function(eventType, eventDetails) {
        if(!eventDetails) {
            eventDetails  =   {};
        }
        eventDetails.presentation   =   this; // Attach the presentation instance to the event details
        var
        customEvt   =   new CustomEvent(eventType, {'detail': eventDetails, 'bubbles': true});
        this._logDebug('dispatching event: ' + eventType, customEvt);
        this.stage.dispatchEvent(customEvt);
    };

    // Global listener for presentation change events, primarily for remote sync
    pageDOM.addEventListener('presentationChanged', function(evt) {
        if(masterControl && evt.details && evt.details.presentation && evt.details.section && evt.details.source && evt.details.source !== 'remote_socket') {
            var
            currentPresentation   =   evt.details.presentation;
            currentPresentation._transmitSocketMsg({'fragment': evt.details.section.getAttribute('id'), 'stepNum': evt.details.stepNum});
        }
    }, false);

    // Changes the currently active slide/section in the presentation
    Presentation.prototype.transitionToSection    =   function(targetSection, targetStep, eventSource) {
        if(!_presentation._startTime && (eventSource === 'keyboard_input' || eventSource === 'touch_gesture')) {
            _presentation._refreshTimer(); // Start the timer if navigation begins via user input
        }
        if(typeof targetSection === 'string') {