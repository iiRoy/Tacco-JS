(function(_windowObject, _documentObject, _consoleObject, _webSocketConstructor, _jsonParser) {
    "use strict";

    // Verify essential browser capabilities
    const essentialCapabilities = new Map([
        ['queryselectorall', () => _documentObject.querySelectorAll],
        ['classlist', () => (_documentObject.body || _documentObject.documentElement).classList],
        ['addeventlistener', () => _windowObject.addEventListener],
        ['forEach', () => Array.prototype.forEach],
        ['indexOf', () => Array.prototype.indexOf],
        ['map', () => Array.prototype.map],
        ['reduce', () => Array.prototype.reduce],
        ['json', () => _jsonParser && _jsonParser.parse && _jsonParser.stringify]
    ]);

    let allCapacitiesMet = true;
    const deficiencyMarkers = [];

    for (const [capabilityName, checkFunction] of essentialCapabilities.entries()) {
        if (typeof checkFunction() === 'undefined') {
            deficiencyMarkers.push(capabilityName + '-unsupported');
            allCapacitiesMet = false;
        }
    }

    if (!allCapacitiesMet) {
        (_documentObject.body || _documentObject.documentElement).className += ' ' + deficiencyMarkers.join(' ') + ' unsupported-system';
        return; // Halt script execution if dependencies are not met
    }

    // Utility functions for string, array, and DOM manipulation
    function extractPureFragment(rawInput) {
        const processedFragment = rawInput || _windowObject.location.hash;
        return processedFragment.startsWith('#') ? processedFragment.substring(1) : processedFragment;
    }

    function gatherElementsAsArray(contextElement, queryExpression) {
        try {
            return Array.from(contextElement.querySelectorAll(queryExpression));
        } catch (err) {
            return [];
        }
    }

    function padLeading(inputStr, fillChar, desiredLength) {
        return String(inputStr).padStart(desiredLength, fillChar);
    }

    function purgeDuplicates(inputArray) {
        return Array.from(new Set(inputArray));
    }

    function generateNumericalSequence(startPoint, endPoint) {
        return Array.from({ length: endPoint - startPoint + 1 }, (_, index) => startPoint + index);
    }

    function accumulateValues(valueCollection) {
        let totalSum = 0;
        for (const val of valueCollection) {
            totalSum += val;
        }
        return totalSum;
    }

    function retrieveFrameOrdinal(elementNode) {
        return parseFloat(elementNode.getAttribute('data-step')) * 1;
    }

    let _presentationInstance;
    let _remoteControlFlag = false;

    // The core presentation management class
    class PresentationEngine {
        _htmlDocElement;
        _pageBodyElement;
        _progressIndicator;
        _timeDisplay;
        _frameSelector;
        _viewerCounter;
        _startTimeMark;
        _syncSocket;
        _socketConnectionReady;
        _socketCommandQueue;
        _mainContainer;
        _allFrames;
        _uniqueId;
        _activeFrame;
        _activePosition;
        _touchGestureDurationLimit;
        _touchGestureDistanceThreshold;
        _fullScreenActive;
        _diagnosticMode;
        _isControllingOtherDisplays;
        _allowRemoteControlPrompt;
        _timerIntervalId;
        _clockTimeoutId;
        _keyActionMap;
        _fullscreenChangeHandlers;

        constructor() {
            this._htmlDocElement = _documentObject.getElementsByTagName('html')[0];
            this._pageBodyElement = _documentObject.body || _documentObject.documentElement;
            this._progressIndicator = _documentObject.createElement('progress');
            this._timeDisplay = _documentObject.createElement('time');
            this._frameSelector = _documentObject.createElement('select');
            this._viewerCounter = _documentObject.createElement('div');
            this._startTimeMark = null;
            this._syncSocket = null;
            this._socketConnectionReady = false;
            this._socketCommandQueue = [];
            this._mainContainer = _documentObject.getElementById('deck');
            this._allFrames = gatherElementsAsArray(this._mainContainer, 'section');
            this._uniqueId = this._mainContainer.getAttribute('data-id');
            this._activeFrame = this._allFrames[0];
            this._activePosition = 0;
            this._touchGestureDurationLimit = Math.max(this._mainContainer.getAttribute('data-touch-duration') ? parseFloat(this._mainContainer.getAttribute('data-touch-duration')) : 0, 500);
            this._touchGestureDistanceThreshold = Math.max(this._mainContainer.getAttribute('data-touch-distance') ? parseFloat(this._mainContainer.getAttribute('data-touch-distance')) : 0, 150);
            this._fullScreenActive = false;
            this._diagnosticMode = this._mainContainer.getAttribute('data-debug') ? !!_jsonParser.parse(this._mainContainer.getAttribute('data-debug')) : false;
            this._isControllingOtherDisplays = false;
            this._allowRemoteControlPrompt = null;
            this._timerIntervalId = null;
            this._clockTimeoutId = null;

            this._keyActionMap = new Map([
                [33, this.retreatContent.bind(this, 'keyboard')], // Page Up
                [37, this.retreatContent.bind(this, 'keyboard')], // Left Arrow
                [74, this.retreatContent.bind(this, 'keyboard')], // J
                [34, this.advanceContent.bind(this, 'keyboard')], // Page Down
                [39, this.advanceContent.bind(this, 'keyboard')], // Right Arrow
                [75, this.advanceContent.bind(this, 'keyboard')], // K
                [35, this.jumpToEnd.bind(this, 'keyboard')], // End
                [36, this.jumpToStart.bind(this, 'keyboard')] // Home
            ]);

            this._fullscreenChangeHandlers = [
                () => _documentObject.addEventListener('webkitfullscreenchange', this._handleFullscreenChange.bind(this), false),
                () => _documentObject.addEventListener('mozfullscreenchange', this._handleFullscreenChange.bind(this), false),
                () => _documentObject.addEventListener('msfullscreenchange', this._handleFullscreenChange.bind(this), false),
                () => _documentObject.addEventListener('fullscreenchange', this._handleFullscreenChange.bind(this), false)
            ];
        }

        logDiagnostic(...messages) {
            if (this._diagnosticMode && _consoleObject.debug) {
                _consoleObject.debug.apply(_consoleObject, messages);
            }
        }

        bootUp() {
            this._progressIndicator.setAttribute('max', this._allFrames.length);
            this._adjustProgressIndicator(1);
            this._pageBodyElement.appendChild(this._progressIndicator);

            this._timeDisplay.setAttribute('id', 'timer');
            this._timeDisplay.innerHTML = '0:00';
            this._pageBodyElement.appendChild(this._timeDisplay);

            if (this._mainContainer.getAttribute('data-counter') === 'time') {
                this._updateClockDisplay();
            }

            this._viewerCounter.setAttribute('id', 'viewers');
            this._pageBodyElement.appendChild(this._viewerCounter);

            this._allFrames.forEach((frameNode, frameIndex) => {
                if (!frameNode.getAttribute('id')) {
                    frameNode.setAttribute('id', `frame-${frameIndex + 1}`);
                }

                const rawSubstepElements = gatherElementsAsArray(frameNode, '[data-step]:not([data-step="0"])');
                const rawSubstepNumbers = purgeDuplicates(rawSubstepElements.map(retrieveFrameOrdinal));
                rawSubstepNumbers.sort((a, b) => a - b);

                const expectedSubstepNumbers = generateNumericalSequence(1, rawSubstepNumbers.length);
                const maxSubstep = rawSubstepNumbers.length > 0 ? rawSubstepNumbers.length : 0;

                const isSequentialAndComplete = rawSubstepNumbers.length === expectedSubstepNumbers.length &&
                                                accumulateValues(rawSubstepNumbers) === accumulateValues(expectedSubstepNumbers);

                if (!isSequentialAndComplete) {
                    rawSubstepElements.forEach(substepElement => {
                        const originalStepValue = parseFloat(substepElement.getAttribute('data-step'));
                        const correctedStepIndex = rawSubstepNumbers.indexOf(originalStepValue);
                        if (correctedStepIndex !== -1) {
                            substepElement.setAttribute('data-step', expectedSubstepNumbers[correctedStepIndex]);
                        }
                    });
                }

                frameNode.frameSubsteps = maxSubstep;
                frameNode.setAttribute('data-current-substep', 0);
                frameNode.setAttribute('data-total-substeps', maxSubstep);
                frameNode.currentSubstep = 0;
                frameNode.setAttribute('data-frame-index', frameIndex + 1);
                frameNode.setAttribute('data-total-frames', this._allFrames.length);
            });

            this._frameSelector.setAttribute('id', 'selector');
            const blankOption = _documentObject.createElement('option');
            let i = this._allFrames.length;
            while (i--) {
                const currentOption = blankOption.cloneNode();
                currentOption.setAttribute('value', i);
                currentOption.innerHTML = `Frame ${padLeading(i + 1, '0', String(this._allFrames.length).length)}: ${this._allFrames[i].getAttribute('id')}`;
                this._frameSelector.insertBefore(currentOption, this._frameSelector.firstChild);
            }
            this._pageBodyElement.appendChild(this._frameSelector);
            this._frameSelector.addEventListener('change', this._handleFrameSelection.bind(this), false);

            _windowObject.addEventListener('load', this._handleWindowLoad.bind(this), false);

            this._initializeSyncConnection();

            if (!_windowObject.location.hash) {
                _windowObject.location.hash = this._allFrames.length ? this._allFrames[0].getAttribute('id') : '';
                this.transitionToFrame(this._allFrames[0], 0, 'init');
            } else {
                let matched = false;
                for (const frame of this._allFrames) {
                    if (frame.getAttribute('id') === extractPureFragment()) {
                        matched = true;
                        this.transitionToFrame(frame, 0, 'init');
                        break;
                    }
                }
                if (!matched) {
                    this.jumpToStart();
                }
            }
            this._pageBodyElement.setAttribute('data-active-frame-id', extractPureFragment());

            _windowObject.addEventListener('load', () => {
                this._htmlDocElement.classList.add('ready');
            });

            this._fullscreenChangeHandlers.forEach(handler => handler());

            _documentObject.addEventListener('keydown', this._handleKeyPress.bind(this), false);

            if ('ontouchstart' in this._pageBodyElement) {
                let startPoint = { 'x': 0, 'y': 0, 'time': 0 };
                this._pageBodyElement.addEventListener('touchstart', (evt) => {
                    const touch = evt.changedTouches[0];
                    startPoint.x = touch.pageX;
                    startPoint.y = touch.pageY;
                    startPoint.time = new Date().getTime();
                    evt.preventDefault();
                }, false);
                this._pageBodyElement.addEventListener('touchmove', (evt) => {
                    evt.preventDefault();
                }, false);
                this._pageBodyElement.addEventListener('touchend', (evt) => {
                    const touch = evt.changedTouches[0];
                    const now = new Date().getTime();
                    const displacement = {
                        'x': startPoint.x - touch.pageX,
                        'y': startPoint.y - touch.pageY,
                        'time': now - startPoint.time
                    };
                    if (displacement.time <= this._touchGestureDurationLimit) {
                        if (Math.abs(displacement.x) >= Math.abs(displacement.y)) {
                            if (displacement.x >= this._touchGestureDistanceThreshold) {
                                this.advanceContent('touch');
                                if (!this._startTimeMark) { this._updateTimeTracker(); }
                            } else if (displacement.x <= (0 - this._touchGestureDistanceThreshold)) {
                                this.retreatContent('touch');
                                if (!this._startTimeMark) { this._updateTimeTracker(); }
                            }
                        }
                    }
                }, false);
            }

            this._dispatchInternalEvent('presentationInitialized');
        }

        activateFullScreen() {
            const fullscreenMethods = [
                () => this._htmlDocElement.requestFullscreen(),
                () => this._htmlDocElement.webkitRequestFullscreen(),
                () => this._htmlDocElement.mozRequestFullscreen(),
                () => this._htmlDocElement.msRequestFullscreen()
            ];
            for (const method of fullscreenMethods) {
                try {
                    method();
                    return;
                } catch (e) {
                    // Try next method
                }
            }
        }

        _sendSyncCommand(commandData) {
            if (commandData) {
                commandData.id = this._uniqueId;
                commandData.commandType = commandData.commandType ? commandData.commandType : 'sync';
                this._socketCommandQueue.push(commandData);
            }
            if (this._socketConnectionReady) {
                let messageToSend = this._socketCommandQueue.shift();
                while (messageToSend) {
                    this._syncSocket.send(_jsonParser.stringify(messageToSend));
                    this.logDiagnostic('Sending socket message', _jsonParser.stringify(messageToSend));
                    messageToSend = this._socketCommandQueue.shift();
                }
            } else {
                _windowObject.setTimeout(() => this._sendSyncCommand(), 100);
            }
        }

        _initializeSyncConnection() {
            if (!_webSocketConstructor || !this._mainContainer.getAttribute('data-sync-server')) {
                this._syncSocket = { send: () => {}, connectionState: 'UNAVAILABLE' };
                return;
            }

            const establishSocket = () => {
                this._syncSocket = new _webSocketConstructor([
                    (!!_jsonParser.parse(this._mainContainer.getAttribute('data-sync-insecure')) ? 'ws' : 'wss'),
                    '://',
                    this._mainContainer.getAttribute('data-sync-server'),
                    '/socket/'
                ].join(''));

                this._syncSocket.onopen = () => {
                    this._socketConnectionReady = true;
                    this._sendSyncCommand({ commandType: 'probe' });
                    this._pageBodyElement.setAttribute('data-sync-status', 'active');
                };

                this._syncSocket.onerror = (err) => {
                    try { _consoleObject.error('Socket communication error', err); } catch (e) {}
                    this._pageBodyElement.setAttribute('data-sync-status', 'inactive');
                };

                this._syncSocket.onmessage = (msg) => {
                    this.logDiagnostic('Received socket message', msg);
                    const parsedData = _jsonParser.parse(msg.data);
                    if (parsedData.commandType === 'sync') {
                        if (this._allowRemoteControlPrompt === null) {
                            this._allowRemoteControlPrompt = _windowObject.confirm('Grant presenter control over your screen?');
                        }
                        if (this._allowRemoteControlPrompt) {
                            this.transitionToFrame(extractPureFragment(parsedData.frameHash), parsedData.substep, 'remote');
                        }
                    } else if (parsedData.commandType === 'probeResponse') {
                        _remoteControlFlag = parsedData.authorization;
                        this._isControllingOtherDisplays = !!_remoteControlFlag;
                        this._pageBodyElement.setAttribute('data-control-mode', !!_remoteControlFlag ? 'master' : 'slave');
                        if (this._allowRemoteControlPrompt === null) {
                            this._allowRemoteControlPrompt = true;
                        }
                    } else if (parsedData.commandType === 'audienceCount') {
                        this._viewerCounter.innerHTML = parsedData.audienceCount;
                    }
                };

                this._syncSocket.onclose = () => {
                    this._socketConnectionReady = false;
                    _windowObject.setTimeout(establishSocket, 1000);
                };
            };
            establishSocket();
        }

        _updateTimeTracker() {
            if (this._mainContainer.getAttribute('data-counter') === 'time') {
                return;
            }
            if (!this._startTimeMark) {
                this._startTimeMark = new Date();
            }
            const currentTime = new Date();
            const elapsedMillis = currentTime - this._startTimeMark;
            const minutes = Math.floor(elapsedMillis / 60000);
            const seconds = Math.floor((elapsedMillis / 1000) % 60);
            this._timeDisplay.innerHTML = `${minutes}:${padLeading(seconds, '0', 2)}`;

            if (!this._timerIntervalId) {
                this._timerIntervalId = _windowObject.setInterval(() => this._updateTimeTracker(), 1000);
            }
        }

        _updateClockDisplay() {
            const convertHourTo12 = (hr) => (hr >= 12 ? hr - 12 : hr) || 12;
            const now = new Date();
            this._timeDisplay.innerHTML = `${convertHourTo12(now.getHours())}:${padLeading(now.getMinutes(), '0', 2)}`;

            const millisTillNextMinute = (60 - now.getSeconds()) * 1000 - now.getMilliseconds();
            if (this._clockTimeoutId) {
                _windowObject.clearTimeout(this._clockTimeoutId);
            }
            this._clockTimeoutId = _windowObject.setTimeout(() => this._updateClockDisplay(), millisTillNextMinute > 0 ? millisTillNextMinute : 1000);
        }

        _adjustProgressIndicator(value) {
            this._progressIndicator.setAttribute('value', value);
            this._frameSelector.value = value - 1;
        }

        _dispatchInternalEvent(eventType, eventPayload) {
            const detailData = eventPayload || {};
            detailData.presentation = this;
            const customEvent = new CustomEvent(eventType, { 'detail': detailData, 'bubbles': true });
            this.logDiagnostic(`Dispatching ${eventType} event`, customEvent);
            this._mainContainer.dispatchEvent(customEvent);
        }

        transitionToFrame(targetFrameIdentifier, targetSubstep = 0, sourceTrigger = '') {
            if (!this._startTimeMark && (sourceTrigger === 'keyboard' || sourceTrigger === 'touch')) {
                this._updateTimeTracker();
            }

            let nextFrame = null;
            let nextIndex = -1;

            if (typeof targetFrameIdentifier === 'string') {
                nextFrame = this._allFrames.find(f => f.getAttribute('id') === targetFrameIdentifier);
                nextIndex = this._allFrames.indexOf(nextFrame);
            } else {
                if (typeof targetFrameIdentifier === 'number') {
                    nextIndex = targetFrameIdentifier;
                    nextFrame = this._allFrames[nextIndex];
                } else {
                    nextFrame = targetFrameIdentifier;
                    nextIndex = this._allFrames.indexOf(nextFrame);
                }
            }

            if (!nextFrame || nextIndex === -1) {
                this.logDiagnostic('Attempted to transition to invalid frame:', targetFrameIdentifier);
                return;
            }

            if (this._activeFrame) {
                this._activeFrame.classList.remove('active');
                gatherElementsAsArray(this._activeFrame, '[data-step]').forEach(el => el.classList.remove('visible-step'));
            }

            this._activeFrame = nextFrame;
            this._activePosition = nextIndex;

            _windowObject.location.hash = `#${nextFrame.getAttribute('id')}`;

            this._activeFrame.classList.add('active');
            this._pageBodyElement.setAttribute('data-active-frame-id', nextFrame.getAttribute('id'));
            this._pageBodyElement.setAttribute('data-active-frame-idx', nextIndex + 1);

            this._adjustProgressIndicator(nextIndex + 1);

            let actualSubstep = Math.max(0, Math.min(targetSubstep, this._activeFrame.frameSubsteps));
            if (this._activeFrame.currentSubstep !== actualSubstep) {
                this._activeFrame.currentSubstep = actualSubstep;
                this._activeFrame.setAttribute('data-current-substep', actualSubstep);
            }
            
            gatherElementsAsArray(this._activeFrame, '[data-step]').forEach(el => {
                const stepNum = parseFloat(el.getAttribute('data-step'));
                if (stepNum > 0 && stepNum <= actualSubstep) {
                    el.classList.add('visible-step');
                } else {
                    el.classList.remove('visible-step');
                }
            });

            this._dispatchInternalEvent('displayChange', {
                frame: this._activeFrame,
                substep: actualSubstep,
                originator: sourceTrigger
            });
        }

        advanceContent(triggerSource = '') {
            const currentSubstep = this._activeFrame.currentSubstep;
            if (currentSubstep < this._activeFrame.frameSubsteps) {
                this.transitionToFrame(this._activeFrame, currentSubstep + 1, triggerSource);
            } else if (this._activePosition < this._allFrames.length - 1) {
                this.transitionToFrame(this._allFrames[this._activePosition + 1], 0, triggerSource);
            }
        }

        retreatContent(triggerSource = '') {
            const currentSubstep = this._activeFrame.currentSubstep;
            if (currentSubstep > 0) {
                this.transitionToFrame(this._activeFrame, currentSubstep - 1, triggerSource);
            } else if (this._activePosition > 0) {
                const prevFrame = this._allFrames[this._activePosition - 1];
                this.transitionToFrame(prevFrame, prevFrame.frameSubsteps, triggerSource);
            }
        }

        jumpToStart(triggerSource = '') {
            this.transitionToFrame(this._allFrames[0], 0, triggerSource);
        }

        jumpToEnd(triggerSource = '') {
            const lastFrame = this._allFrames[this._allFrames.length - 1];
            this.transitionToFrame(lastFrame, lastFrame.frameSubsteps, triggerSource);
        }

        // Event handlers for various UI interactions
        _handleFullscreenChange(evt) {
            this._fullScreenActive = !!(_documentObject.webkitFullscreenElement || _documentObject.mozFullScreenElement || _documentObject.msFullscreenElement || _documentObject.fullscreenElement);
        }

        _handleKeyPress(evt) {
            if (this._keyActionMap.has(evt.keyCode)) {
                this._keyActionMap.get(evt.keyCode)();
            } else if (evt.keyCode === 27 || evt.keyCode === 80) { // Escape or P
                if (evt.ctrlKey || evt.keyCode === 80) {
                    this._htmlDocElement.classList.toggle('presenter');
                }
            } else if (evt.keyCode === 70) { // F for Fullscreen
                 this.activateFullScreen();
            }
        }

        _handleFrameSelection(evt) {
            this.transitionToFrame(parseFloat(this._frameSelector.value));
        }

        _handleWindowLoad() {
            gatherElementsAsArray(this._mainContainer, 'figure').forEach(figureElement => {
                figureElement.maxHeight = 0;
                gatherElementsAsArray(figureElement, 'img').forEach(imgElement => {
                    imgElement.displayHeight = imgElement.getAttribute('height') ? parseFloat(imgElement.getAttribute('height')) : imgElement.height;
                    figureElement.maxHeight = imgElement.displayHeight > figureElement.maxHeight ? imgElement.displayHeight : figureElement.maxHeight;
                });
                figureElement.style.maxHeight = figureElement.maxHeight + 'px';
            });
        }
    }

    _documentObject.addEventListener('displayChange', function(evt) {
        if (_remoteControlFlag && evt.detail && evt.detail.presentation && evt.detail.frame && evt.detail.originator && evt.detail.originator !== 'remote') {
            const currentPresentation = evt.detail.presentation;
            currentPresentation._sendSyncCommand({
                frameHash: evt.detail.frame.getAttribute('id'),
                substep: evt.detail.substep
            });
        }
    }, false);

    _documentObject.addEventListener('DOMContentLoaded', () => {
        _presentationInstance = new PresentationEngine();
        _presentationInstance.bootUp();
    });

})(_windowObject, _documentObject, _consoleObject, _webSocketConstructor, _jsonParser);