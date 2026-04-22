(function(docGlobal) {
    const elementStateMap = new WeakMap();

    let cssTransProp, cssOriginProp;
    const styleTestDiv = docGlobal.createElement('div');
    const transformTestNames = ['transform', 'webkitTransform', 'MozTransform', 'msTransform', 'OTransform'];
    for (let i = 0; i < transformTestNames.length; i++) {
        if (styleTestDiv.style[transformTestNames[i]] !== undefined) {
            cssTransProp = transformTestNames[i];
            break;
        }
    }
    if (cssTransProp) {
        cssOriginProp = cssTransProp.replace(/[tT]ransform/, 'TransformOrigin');
        if (cssOriginProp[0] === 'T') {
            cssOriginProp = 't' + cssOriginProp.substring(1);
        }
    }

    let isOldInternetExplorer = false;
    try {
        isOldInternetExplorer = new Function('/*@cc_on return true; @*/ return false;')();
    } catch (e) { /* not IE */ }

    function easeOutQuart(elapsed, startValue, changeValue, totalDuration) {
        elapsed /= totalDuration;
        elapsed--;
        return -changeValue * (elapsed * elapsed * elapsed * elapsed - 1) + startValue;
    }

    class ImageSpinner {
        constructor(domElement, initialOptions) {
            if (!domElement || !(domElement instanceof Element)) {
                throw new Error("Invalid DOM element provided to ImageSpinner.");
            }

            this._targetElement = domElement;
            this._rotationSettings = {};
            this._currentAngleDegrees = 0;

            elementStateMap.set(domElement, this);

            this._visualComponent = null;
            this._pendingRotationRequests = [];

            if (this._targetElement.hasAttribute('data-spinner-initialized')) {
                this._configureRotation(initialOptions);
                return;
            }

            this._targetElement.setAttribute('data-spinner-initialized', 'true');

            if (cssTransProp) {
                this._visualComponent = new CssRotationHandler(this._targetElement, this);
            } else if (isOldInternetExplorer) {
                this._visualComponent = new VmlRotationHandler(this._targetElement, this);
            } else {
                this._visualComponent = new CanvasRotationHandler(this._targetElement, this);
            }

            if (this._visualComponent.isReady) {
                this._configureRotation(initialOptions);
            } else {
                this._pendingRotationRequests.push(initialOptions);
            }
        }

        _configureRotation(options) {
            this._rotationSettings = this._rotationSettings || {};
            if (typeof this._currentAngleDegrees !== "number") {
                this._currentAngleDegrees = 0;
            }
            if (typeof options.angle === "number") {
                this._currentAngleDegrees = options.angle;
            }
            this._rotationSettings.targetAngle = (typeof options.animateTo === "number") ? (options.animateTo) : (this._currentAngleDegrees);
            this._rotationSettings.frameUpdate = options.step || this._rotationSettings.frameUpdate || null;
            this._rotationSettings.timingFunc = options.easing || this._rotationSettings.timingFunc || easeOutQuart;
            this._rotationSettings.animDuration = options.duration || this._rotationSettings.animDuration || 1000;
            this._rotationSettings.completionHandler = options.callback || this._rotationSettings.completionHandler || (() => {});
            this._rotationSettings.pivot = options.center || this._rotationSettings.pivot || ["50%", "50%"];

            this._visualComponent.updatePivot(this._rotationSettings.pivot);

            if (options.bind && options.bind !== this._rotationSettings.eventBindings) {
                this._attachEventObservers(options.bind);
            }

            if (this._currentAngleDegrees === this._rotationSettings.targetAngle) {
                this._visualComponent.applyRotation(this._currentAngleDegrees);
            } else {
                this._initiateMotion();
            }
        }

        _attachEventObservers(eventMap) {
            if (eventMap && this._visualComponent.getInteractiveElement()) {
                if (this._rotationSettings.eventBindings) {
                    const oldBindings = this._rotationSettings.eventBindings;
                    for (let evtType in oldBindings) {
                        if (oldBindings.hasOwnProperty(evtType)) {
                            this._visualComponent.getInteractiveElement().removeEventListener(evtType, oldBindings[evtType]);
                        }
                    }
                }

                this._rotationSettings.eventBindings = eventMap;
                for (let evtType in eventMap) {
                    if (eventMap.hasOwnProperty(evtType)) {
                        this._visualComponent.getInteractiveElement().addEventListener(evtType, eventMap[evtType]);
                    }
                }
            }
        }

        _initiateMotion() {
            if (this._motionFrameHandle) {
                cancelAnimationFrame(this._motionFrameHandle);
            }
            this._motionStartTime = performance.now();
            this._initialMotionAngle = this._currentAngleDegrees;
            this._executeMotionFrame();
        }

        _executeMotionFrame() {
            const currentTime = performance.now();
            const motionFinished = (currentTime - this._motionStartTime) > this._rotationSettings.animDuration;

            if (motionFinished) {
                cancelAnimationFrame(this._motionFrameHandle);
                this._currentAngleDegrees = this._rotationSettings.targetAngle;
                this._visualComponent.applyRotation(this._currentAngleDegrees);
                if (this._rotationSettings.completionHandler) {
                    this._rotationSettings.completionHandler.call(this._visualComponent.getContainerElement());
                }
            } else {
                const calculatedAngle = this._rotationSettings.timingFunc(
                    currentTime - this._motionStartTime,
                    this._initialMotionAngle,
                    this._rotationSettings.targetAngle - this._initialMotionAngle,
                    this._rotationSettings.animDuration
                );
                this._visualComponent.applyRotation(calculatedAngle);
                this._currentAngleDegrees = calculatedAngle;

                if (this._rotationSettings.frameUpdate) {
                    this._rotationSettings.frameUpdate(this._currentAngleDegrees);
                }

                this._motionFrameHandle = requestAnimationFrame(() => {
                    this._executeMotionFrame();
                });
            }
        }

        setRotation(options) {
            if (typeof options === "number") {
                options = {
                    angle: options
                };
            }
            if (!this._visualComponent.isReady) {
                this._pendingRotationRequests.push(options);
            } else {
                this._configureRotation(options);
            }
        }

        getRotationAngle() {
            return this._currentAngleDegrees;
        }

        stopAnimation() {
            if (this._motionFrameHandle) {
                cancelAnimationFrame(this._motionFrameHandle);
            }
            this._motionFrameHandle = null;
        }

        _processPendingRequests(isLoadComplete) {
            if (!isLoadComplete && !this._targetElement.complete) {
                return;
            }
            this._visualComponent.markReady();

            let request;
            while ((request = this._pendingRotationRequests.shift())) {
                this._configureRotation(request);
            }
        }
    }

    class CssRotationHandler {
        constructor(element, parentSpinner) {
            this._managedElement = element;
            this._parentSpinner = parentSpinner;
            this.isReady = true;
        }

        getInteractiveElement() { return this._managedElement; }
        getContainerElement() { return this._managedElement; }

        updatePivot(pivotArr) {
            this._managedElement.style[cssOriginProp] = pivotArr.join(" ");
        }

        applyRotation(degrees) {
            this._managedElement.style[cssTransProp] = `rotate(${degrees % 360}deg)`;
        }

        markReady() { this.isReady = true; }
    }

    class VmlRotationHandler {
        constructor(element, parentSpinner) {
            this._managedElement = element;
            this._parentSpinner = parentSpinner;
            this.isReady = false;

            this._originalWidth = 0;
            this._originalHeight = 0;
            this._pivotXCoord = 0;
            this._pivotYCoord = 0;
            this._displayRatioX = 1;
            this._displayRatioY = 1;

            this._vmlWrapper = docGlobal.createElement('span');
            this._vmlWrapper.style.display = "inline-block";
            this._managedElement.parentNode.insertBefore(this._vmlWrapper, this._managedElement);

            if (this._managedElement.complete) {
                this._initVisuals();
            } else {
                this._managedElement.addEventListener("load", () => this._initVisuals());
            }
        }

        _createVmlNode(tagName) {
            docGlobal.createStyleSheet().addRule(".vml-style", "behavior:url(#default#VML)");
            try {
                if (!docGlobal.namespaces.rvml) {
                    docGlobal.namespaces.add("rvml", "urn:schemas-microsoft-com:vml");
                }
                return docGlobal.createElement('<rvml:' + tagName + ' class="vml-style">');
            } catch (e) {
                return docGlobal.createElement('<' + tagName + ' xmlns="urn:schemas-microsoft-com:vml" class="vml-style">');
            }
        }

        _initVisuals() {
            this._originalWidth = this._managedElement.width;
            this._originalHeight = this._managedElement.height;
            this._managedElement.parentNode.removeChild(this._managedElement);

            this._vmlImageNode = this._createVmlNode('image');
            this._vmlImageNode.src = this._managedElement.src;
            this._vmlImageNode.style.height = this._originalHeight + "px";
            this._vmlImageNode.style.width = this._originalWidth + "px";
            this._vmlImageNode.style.position = "absolute";
            this._vmlImageNode.style.top = "0px";
            this._vmlImageNode.style.left = "0px";

            this._vmlGroupNode = this._createVmlNode('group');
            this._vmlGroupNode.style.width = this._originalWidth;
            this._vmlGroupNode.style.height = this._originalHeight;
            this._vmlGroupNode.style.position = "absolute";
            this._vmlGroupNode.style.top = "0px";
            this._vmlGroupNode.style.left = "0px";
            this._vmlGroupNode.setAttribute('coordsize', (this._originalWidth - 1) + ',' + (this._originalHeight - 1));
            this._vmlGroupNode.appendChild(this._vmlImageNode);

            this._vmlWrapper.appendChild(this._vmlGroupNode);
            this._vmlWrapper.style.position = "relative";
            this._vmlWrapper.style.width = this._originalWidth + "px";
            this._vmlWrapper.style.height = this._originalHeight + "px";
            this._vmlWrapper.setAttribute('id', this._managedElement.getAttribute('id'));
            this._vmlWrapper.className = this._managedElement.className;

            this.markReady();
            this._parentSpinner._processPendingRequests(true);
        }

        getInteractiveElement() { return this._vmlWrapper; }
        getContainerElement() { return this._vmlWrapper; }

        updatePivot(pivotArr) {
            if (typeof pivotArr[0] === "string") {
                this._pivotXCoord = (parseInt(pivotArr[0], 10) / 100) * this._originalWidth * this._displayRatioX;
            } else {
                this._pivotXCoord = pivotArr[0];
            }
            if (typeof pivotArr[1] === "string") {
                this._pivotYCoord = (parseInt(pivotArr[1], 10) / 100) * this._originalHeight * this._displayRatioY;
            } else {
                this._pivotYCoord = pivotArr[1];
            }
        }

        applyRotation(degrees) {
            this._vmlGroupNode.style.rotation = (degrees % 360) + "deg";
            this._vmlImageNode.style.top = -(this._pivotYCoord - this._originalHeight / 2) + "px";
            this._vmlImageNode.style.left = -(this._pivotXCoord - this._originalWidth / 2) + "px";
            this._vmlGroupNode.style.top = this._pivotYCoord - this._originalHeight / 2 + "px";
            this._vmlGroupNode.style.left = this._pivotXCoord - this._originalWidth / 2 + "px";
        }

        markReady() { this.isReady = true; }
    }

    class CanvasRotationHandler {
        constructor(element, parentSpinner) {
            this._managedElement = element;
            this._parentSpinner = parentSpinner;
            this.isReady = false;

            this._originalWidth = 0;
            this._originalHeight = 0;
            this._pivotXCoord = 0;
            this._pivotYCoord = 0;
            this._displayRatioX = 1;
            this._displayRatioY = 1;

            this._canvasContainer = docGlobal.createElement('span');
            this._managedElement.parentNode.insertBefore(this._canvasContainer, this._managedElement);

            if (this._managedElement.complete) {
                this._initVisuals();
            } else {
                this._managedElement.addEventListener("load", () => this._initVisuals());
            }
        }

        _initVisuals() {
            this._canvasContainer.setAttribute('id', this._managedElement.getAttribute('id'));
            this._canvasContainer.className = this._managedElement.className;

            this._originalWidth = this._managedElement.naturalWidth;
            this._originalHeight = this._managedElement.naturalHeight;

            const maxDimension = Math.sqrt(this._originalHeight * this._originalHeight + this._originalWidth * this._originalWidth);
            const canvasRenderDimension = maxDimension * 3;

            this._displayRatioX = this._managedElement.offsetWidth / this._managedElement.naturalWidth;
            this._displayRatioY = this._managedElement.offsetHeight / this._managedElement.naturalHeight;

            this._managedElement.parentNode.removeChild(this._managedElement);

            this._drawingCanvas = docGlobal.createElement('canvas');
            this._drawingCanvas.setAttribute('width', canvasRenderDimension);
            this._drawingCanvas.setAttribute('height', canvasRenderDimension);
            this._drawingCanvas.style.position = "relative";
            this._drawingCanvas.style.left = (-canvasRenderDimension / 2 + (this._originalWidth * this._displayRatioX) / 2) + "px";
            this._drawingCanvas.style.top = (-canvasRenderDimension / 2 + (this._originalHeight * this._displayRatioY) / 2) + "px";

            this._canvasContainer.appendChild(this._drawingCanvas);
            this._canvasContainer.style.width = (this._managedElement.width * this._displayRatioX) + "px";
            this._canvasContainer.style.height = (this._managedElement.height * this._displayRatioY) + "px";

            this._canvasContext = this._drawingCanvas.getContext('2d');

            this.markReady();
            this._parentSpinner._processPendingRequests(true);
        }

        getInteractiveElement() { return this._drawingCanvas; }
        getContainerElement() { return this._canvasContainer; }

        updatePivot(pivotArr) {
            if (typeof pivotArr[0] === "string") {
                this._pivotXCoord = (parseInt(pivotArr[0], 10) / 100) * this._originalWidth * this._displayRatioX;
            } else {
                this._pivotXCoord = pivotArr[0];
            }
            if (typeof pivotArr[1] === "string") {
                this._pivotYCoord = (parseInt(pivotArr[1], 10) / 100) * this._originalHeight * this._displayRatioY;
            } else {
                this._pivotYCoord = pivotArr[1];
            }
        }

        applyRotation(degrees) {
            const radians = degrees * Math.PI / 180;
            const canvasWidth = this._drawingCanvas.width;
            const canvasHeight = this._drawingCanvas.height;

            this._canvasContext.clearRect(0, 0, canvasWidth, canvasHeight);
            this._canvasContext.save();

            this._canvasContext.translate(canvasWidth / 2, canvasHeight / 2);
            this._canvasContext.translate(this._pivotXCoord - (this._originalWidth * this._displayRatioX) / 2, this._pivotYCoord - (this._originalHeight * this._displayRatioY) / 2);
            this._canvasContext.rotate(radians);
            this._canvasContext.translate(-(this._pivotXCoord - (this._originalWidth * this._displayRatioX) / 2), -(this._pivotYCoord - (this._originalHeight * this._displayRatioY) / 2));

            this._canvasContext.scale(this._displayRatioX, this._displayRatioY);
            this._canvasContext.drawImage(this._managedElement, 0, 0);
            this._canvasContext.restore();
        }

        markReady() { this.isReady = true; }
    }

    const ImageRotatorAPI = {
        initiate: function(elements, options) {
            const collection = (elements instanceof NodeList || elements instanceof HTMLCollection) ? Array.from(elements) : [elements];
            const results = [];

            collection.forEach(element => {
                if (!element) return;
                let spinnerInstance = elementStateMap.get(element);
                if (!spinnerInstance) {
                    spinnerInstance = new ImageSpinner(element, options);
                } else {
                    spinnerInstance.setRotation(options);
                }
                results.push(spinnerInstance);
            });
            return results;
        },

        queryAngle: function(elements) {
            const collection = (elements instanceof NodeList || elements instanceof HTMLCollection) ? Array.from(elements) : [elements];
            return collection.map(element => {
                const spinnerInstance = elementStateMap.get(element);
                return spinnerInstance ? spinnerInstance.getRotationAngle() : undefined;
            });
        },

        haltRotation: function(elements) {
            const collection = (elements instanceof NodeList || elements instanceof HTMLCollection) ? Array.from(elements) : [elements];
            collection.forEach(element => {
                const spinnerInstance = elementStateMap.get(element);
                if (spinnerInstance) {
                    spinnerInstance.stopAnimation();
                }
            });
        }
    };

    docGlobal.ImageUtilityBelt = docGlobal.ImageUtilityBelt || {};
    docGlobal.ImageUtilityBelt.ImageRotation = ImageRotatorAPI;

})(window);

(function($) {
    if (typeof $ === 'undefined' || !$.fn) {
        return;
    }

    $.fn.extend({
        spinElement: function(params) {
            if (this.length === 0 || typeof params === "undefined") return this;

            const processedInstances = window.ImageUtilityBelt.ImageRotation.initiate(this.get(), params);
            return $(processedInstances.map(instance => instance._visualComponent.getContainerElement()));
        },
        retrieveSpinAngle: function() {
            if (this.length === 0) return [];
            return window.ImageUtilityBelt.ImageRotation.queryAngle(this.get());
        },
        ceaseSpin: function() {
            if (this.length === 0) return this;
            window.ImageUtilityBelt.ImageRotation.haltRotation(this.get());
            return this;
        }
    });

})(jQuery);