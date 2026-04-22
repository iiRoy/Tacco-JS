var ContentNavigator = new function() {

    // Accessible properties for external components
    this.displayElement = null;
    this.horizontalShift;
    this.verticalShift;

    // Internal state variables for interaction and rendering
    var _isPointerDown = false,
        _lastPointerX = 0,
        _lastPointerY = 0,
        _anchorCoordX,
        _anchorCoordY,
        _previousDispX,
        _previousDispY,
        _currentRenderX = 0,
        _currentRenderY = 0,
        _dragSensitivity = 10,
        _targetCoordX = 0,
        _targetCoordY = 0,
        _displayCoordX = 0,
        _displayCoordY = 0,
        _currentVelocityX = 0,
        _currentVelocityY = 0,
        _currentInertiaX = 0,
        _currentInertiaY = 0,
        _previousMomentTime = 0,
        _moveDirectionX = 0,
        _moveDirectionY,
        _isProcessingInertia = false,
        _maxScrollExtent = 0,
        _minScrollExtent = 0,
        _lastInteractionTime,
        _hasBeenDragged = false,
        _selfReference = this,
        _orientationAxis,
        _interactionKind,
        _clickableTagName = 'img',
        _activeClickTarget,
        _hasTransformSupport = window.Modernizr.csstransforms3d;

    this.initializeModule = function(elementToControl, axisOfScroll, useTouchInput) {

        this.displayElement = elementToControl;
        _orientationAxis = axisOfScroll;
        _interactionKind = useTouchInput ? "touch" : "mouse";

        if (_orientationAxis === 'y') {

            // Note: Fixed dimension values for demonstration; ideally these would be calculated.
            this.displayElement.style.width = '640px';
            this.displayElement.className = 'hCenter';
            this.displayElement.style.marginLeft = '-320px';
            _maxScrollExtent = this.displayElement.clientHeight;
        }

        else if (_orientationAxis === 'x') {

            // Note: Fixed dimension values for demonstration; ideally these would be calculated.
            this.displayElement.style.width = '12900px';
            this.displayElement.style.height = '410px';
            this.displayElement.className = 'vCenter';
            this.displayElement.style.marginTop = '-205px';
            _maxScrollExtent = this.displayElement.clientWidth;
        }

        this.registerInteractionListeners(_interactionKind);

        window.jQuery(this.displayElement).bind(this._startGestureEvent, this._startGestureCallback);
        this.apply3dTranslation(this.displayElement, 1 + "px", 0 + "px"); // Apply an initial transform to minimize rendering artifacts on iOS devices.

        this.startAnimationLoop();
    };

    this.adjustLayoutDirection = function(isPortraitMode) {

        if (isPortraitMode) {
            _orientationAxis = 'y';
            this.displayElement.style.width = '640px';
            this.displayElement.style.height = '8200px';
            this.displayElement.className = this.displayElement.className.replace(new RegExp('(^|\\s+)' + 'vCenter' + '(\\s+|$)'), 'hCenter');
            this.displayElement.style.marginLeft = '-320px';
            _maxScrollExtent = this.displayElement.clientHeight;
        }
        else {
            _orientationAxis = 'x';
            this.displayElement.style.width = '12900px';
            this.displayElement.style.height = '410px';
            this.displayElement.className = this.displayElement.className.replace(new RegExp('(^|\\s+)' + 'hCenter' + '(\\s+|$)'), 'vCenter');
            this.displayElement.style.marginTop = '-205px';
            _maxScrollExtent = this.displayElement.clientWidth;
        }
    };


    /////////////////////////////////// INTERACTION HANDLING ROUTINES ///////////////////////////////////////////
    this.blockTextSelection = function(pointerEvent) {
        pointerEvent.preventDefault();
    };

    this.handlePointerLost = function(pointerEvent) {
        this.handlePointerUp(pointerEvent);
    };

    this.handlePointerDown = function(eventObj, coordX, coordY) {
        if (eventObj.target.nodeName === _clickableTagName) {
            _activeClickTarget = eventObj.target;
        }

        _lastPointerX = coordX;
        _lastPointerY = coordY;
        _currentInertiaX = 0;
        _currentInertiaY = 0;
        _currentVelocityX = 0;
        _currentVelocityY = 0;
        _lastInteractionTime = new Date().getTime();
        _anchorCoordX = _targetCoordX;
        _anchorCoordY = _targetCoordY;
        _isPointerDown = true;
        _hasBeenDragged = false;

        this.activatePointerTracking();
        eventObj.preventDefault();
    };

    this.handlePointerMove = function(eventObj, coordX, coordY) {

        if (_isPointerDown) {
            var currentTime = new Date().getTime();
            var newCoordX = coordX;
            var newCoordY = coordY;
            var deltaX = newCoordX - _lastPointerX;
            var deltaY = newCoordY - _lastPointerY;

            if (_orientationAxis === 'x' && Math.abs(deltaX) < _dragSensitivity) return false;
            if (_orientationAxis === 'y' && Math.abs(deltaY) < _dragSensitivity) return false;

            _lastPointerX = newCoordX;
            _lastPointerY = newCoordY;
            _lastInteractionTime = currentTime;

            if (_orientationAxis === 'y') {

                var currentWindowHeight = window.innerHeight || document.documentElement.clientHeight;
                if ((_targetCoordY) > 0 && (_targetCoordY < _maxScrollExtent - currentWindowHeight)) {
                    _targetCoordY -= deltaY;
                }
                else {
                    _targetCoordY -= deltaY / 3;
                }

                var displacementY = _targetCoordY - _anchorCoordY;
                _anchorCoordY = _targetCoordY;

                var speedY = Math.abs(displacementY);
                _currentVelocityY += (speedY - _currentVelocityY) * 0.3;
                _moveDirectionY = displacementY < 0 ? -1 : 1;

            }
            else {

                var currentWindowWidth = window.innerWidth || document.documentElement.clientWidth;
                if ((_targetCoordX) > 0 && (_targetCoordX < _maxScrollExtent - currentWindowWidth)) {
                    _targetCoordX -= deltaX;
                }
                else {
                    _targetCoordX -= deltaX / 3;
                }

                var displacementX = _targetCoordX - _anchorCoordX;
                _anchorCoordX = _targetCoordX;

                var speedX = Math.abs(displacementX);
                _currentVelocityX += (speedX - _currentVelocityX) * 0.3;
                _moveDirectionX = displacementX < 0 ? -1 : 1;

            }
            _hasBeenDragged = true;
        }
    };

    this.handlePointerUp = function(eventObj) {

        if (_isPointerDown) {

            _isPointerDown = false;
            _currentInertiaX = Math.abs(_currentVelocityX);
            _currentInertiaY = Math.abs(_currentVelocityY);
            _isProcessingInertia = true;
            var currentTime = new Date().getTime();
            var timeElapsed = currentTime - _lastInteractionTime;
            timeElapsed = Math.max(10, timeElapsed);
            _lastInteractionTime = 0;
            _currentVelocityX *= 1 - Math.min(1, Math.max(0, timeElapsed / 100));
            _currentVelocityY *= 1 - Math.min(1, Math.max(0, timeElapsed / 100));
        }

        _lastPointerX = 0;
        _lastPointerY = 0;

        this.deactivatePointerTracking();

        if (!_hasBeenDragged && _activeClickTarget !== null) {
            _selfReference.elementInteractionTriggered(_activeClickTarget);
        }


        return _hasBeenDragged ? false : undefined;
    };

    this.elementInteractionTriggered = function() {

    };


    this.renderFrame = function() {

        this.updateState();
    };


    this.updateState = function() {

        if (_orientationAxis === 'x') {

            if (_isProcessingInertia) {

                _targetCoordX += _currentVelocityX * _moveDirectionX;
                _currentVelocityX *= 0.9;

                var currentWindowWidth = window.innerWidth || document.documentElement.clientWidth;
                if (_targetCoordX < _minScrollExtent) {
                    _currentVelocityX = 0;
                    _targetCoordX = _minScrollExtent;
                    _isProcessingInertia = false;
                } else if (_targetCoordX > _maxScrollExtent - currentWindowWidth) {
                    _currentVelocityX = 0;
                    _targetCoordX = _maxScrollExtent - currentWindowWidth;
                    _isProcessingInertia = false;
                }

                if (_currentVelocityX < 0.01) {
                    _isProcessingInertia = false;
                    _currentVelocityX = 0;
                }
            }

            var smoothingFactor = 0.12;
            var deltaSpeed = (_targetCoordX - _displayCoordX) * smoothingFactor;
            _displayCoordX += deltaSpeed;
            _currentRenderX = Math.round(-_displayCoordX);

            // Apply the calculated position to the display elements
            if (_hasTransformSupport) {
                this.apply3dTranslation(this.displayElement, _currentRenderX + "px", 0 + "px");
                this.apply3dTranslation(document.getElementById('parallaxBackground'), _currentRenderX / 8 + "px", 0 + "px");
            }

            else {
                this.apply2dTranslation(this.displayElement, _currentRenderX + "px", 0 + "px");
                this.apply2dTranslation(document.getElementById('parallaxBackground'), _currentRenderX / 8 + "px", 0 + "px");
            }
        }

        else if (_orientationAxis === 'y') {
            if (_isProcessingInertia) {
                _targetCoordY += _currentVelocityY * _moveDirectionY;
                _currentVelocityY *= 0.9;

                var currentWindowHeight = window.innerHeight || document.documentElement.clientHeight;
                if (_targetCoordY < _minScrollExtent) {
                    _currentVelocityY = 0;
                    _targetCoordY = _minScrollExtent;
                    _isProcessingInertia = false;
                } else if (_targetCoordY > _maxScrollExtent - currentWindowHeight) {
                    _currentVelocityY = 0;
                    _targetCoordY = _maxScrollExtent - currentWindowHeight;
                    _isProcessingInertia = false;
                }
                if (_currentVelocityY < 0.01) {
                    _isProcessingInertia = false;
                    _currentVelocityY = 0;
                }
            }
            var smoothingFactor = 0.12;
            var deltaSpeedY = (_targetCoordY - _displayCoordY) * smoothingFactor;
            _displayCoordY += deltaSpeedY;
            _currentRenderY = Math.round(-_displayCoordY);

            // Apply the calculated vertical position to the display element
            if (_hasTransformSupport) {
                this.apply3dTranslation(this.displayElement, 0 + "px", _currentRenderY + "px");
            }
            else {
                this.apply2dTranslation(this.displayElement, 0 + "px", _currentRenderY + "px");
            }
        }

        this.horizontalShift = _currentRenderX;
        this.verticalShift = _currentRenderY;
    };


    this.apply2dTranslation = function(elementRef, xPos, yPos) {

        var transformValue = "translate(" + xPos + "," + yPos + ")";
        elementRef.style.transform = transformValue;
        elementRef.style.WebkitTransform = transformValue;
        elementRef.style.msTransform = transformValue;
        elementRef.style.MozTransform = transformValue;
    };

    this.apply3dTranslation = function(elementRef, xPos, yPos) {

        var transformValue = "translate3d(" + xPos + "," + yPos + ", 0px)";
        elementRef.style.transform = transformValue;
        elementRef.style.WebkitTransform = transformValue;
    };

    this.startAnimationLoop = function() {

        ContentNavigator.renderFrame();
        window.requestAnimationFrame(ContentNavigator.startAnimationLoop);
    };

    this.activatePointerTracking = function() {

        window.jQuery(this.displayElement).bind(this._moveGestureEvent, this._moveGestureCallback);
        window.jQuery(this.displayElement).bind(this._endGestureEvent, this._endGestureCallback);
    };

    this.deactivatePointerTracking = function() {

        window.jQuery(this.displayElement).unbind(this._moveGestureEvent, this._moveGestureCallback);
        window.jQuery(this.displayElement).unbind(this._endGestureEvent, this._endGestureCallback);
    };

    this.registerInteractionListeners = function(interactionMode) {

        if (interactionMode === 'mouse') {

            this._startGestureEvent = "mousedown";
            this._startGestureCallback = function(evt) {
                return _selfReference.handlePointerDown(evt, evt.clientX, evt.clientY);
            };

            this._moveGestureEvent = "mousemove";
            this._moveGestureCallback = function(evt) {
                return _selfReference.handlePointerMove(evt, evt.clientX, evt.clientY);
            };

            this._endGestureEvent = "mouseup";
            this._endGestureCallback = function(evt) {
                return _selfReference.handlePointerUp(evt);
            };

            this._leaveGestureEvent = 'mouseout';
            this._leaveGestureCallback = function(evt) {
                return _selfReference.handlePointerUp(evt);
            };

            window.jQuery(window).bind(this._leaveGestureEvent, this._leaveGestureCallback, true);
            window.jQuery(document).bind('mousedown', this.blockTextSelection);


        } else {

            this._startGestureEvent = "touchstart";
            this._startGestureCallback = function(evt) {
                var touchObj = evt.touches[0];
                return _selfReference.handlePointerDown(evt, touchObj.pageX, touchObj.pageY);
            };

            this._moveGestureEvent = "touchmove";
            this._moveGestureCallback = function(evt) {
                var touchObj = evt.touches[0];
                return _selfReference.handlePointerMove(evt, touchObj.pageX, touchObj.pageY);
            };

            this._endGestureEvent = "touchend";
            this._endGestureCallback = function(evt) {
                return _selfReference.handlePointerUp(evt);
            };
        }
    };

    this.adjustViewportDimensions = function() {


    };
};