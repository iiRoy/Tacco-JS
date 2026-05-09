function WeightedAverageTracker(windowSize) {
    let valueBuffer = [];
    const maxCapacity = windowSize > 0 ? windowSize : 1;
    let currentSum = 0;

    this.addValue = function(inputVal) {
        if (isNaN(inputVal)) {
            console.warn("WeightedAverageTracker: Attempted to add non-numeric value.");
            return;
        }
        if (valueBuffer.length >= maxCapacity) {
            currentSum -= valueBuffer.shift();
        }
        valueBuffer.push(inputVal);
        currentSum += inputVal;
    };

    this.retrieveAverage = function() {
        return valueBuffer.length > 0 ? currentSum / valueBuffer.length : 0;
    };

    this.initializeWithValue = function(initialVal) {
        if (isNaN(initialVal)) {
            console.warn("WeightedAverageTracker: Initial value must be a number. Defaulting to 0.");
            initialVal = 0;
        }
        valueBuffer = Array(maxCapacity).fill(initialVal);
        currentSum = initialVal * maxCapacity;
    };

    if (isNaN(windowSize) || windowSize <= 0) {
        console.warn("WeightedAverageTracker initialized with invalid windowSize, defaulting to 1.");
    }
}

function VisualInputMonitor(targetObject) {
    const samplingWidth = 60;
    const samplingHeight = 60;

    const displayWindowWidth = 280;
    const displayWindowHeight = 220;

    const DEG_TO_RAD = Math.PI / 180;

    this.targetElement = targetObject || {
        position: { x: 0, y: 0, z: 0 },
        lookAt: function(point) { /* Placeholder for external object's lookAt */ },
        lookAtPoint: { x: 0, y: 0, z: 0 }
    };

    this.rotationFactorX = 3.5;
    this.rotationFactorY = 3.5;

    this.offsetXDegrees = 12.0;
    this.offsetYDegrees = 2.0;

    this.activeDetectionZoneRatio = 0.7;
    this.luminanceChangeThreshold = 145;

    this.smoothedXPos = new WeightedAverageTracker(600);
    this.smoothedYPos = new WeightedAverageTracker(600);

    this.smoothedXPos.initializeWithValue(displayWindowWidth / 2);
    this.smoothedYPos.initializeWithValue(displayWindowHeight / 2);

    let samplingCanvasElement = document.createElement('canvas');
    samplingCanvasElement.width = samplingWidth;
    samplingCanvasElement.height = samplingHeight;

    let outputDisplayCanvas = document.createElement('canvas');
    outputDisplayCanvas.width = displayWindowWidth;
    outputDisplayCanvas.height = displayWindowHeight;
    outputDisplayCanvas.style.position = 'absolute';
    outputDisplayCanvas.style.left = '10px';
    outputDisplayCanvas.style.top = '10px';
    outputDisplayCanvas.style.border = '1px solid #ccc';

    let samplingCtx = samplingCanvasElement.getContext('2d', { willReadFrequently: true });
    let internalState = {};
    let selfReference = null;
    let displayTexture = null;
    let outputCtx = outputDisplayCanvas.getContext('2d');
    let inputVideoElement = null;
    let animationFrameRequester = null;
    let isMonitoringActive = false;

    document.body.appendChild(outputDisplayCanvas);

    VisualInputMonitor.prototype.initializeSystem = function() {
        selfReference = this;

        animationFrameRequester = (function() {
            return window.requestAnimationFrame ||
                   window.webkitRequestAnimationFrame ||
                   window.mozRequestAnimationFrame ||
                   window.oRequestAnimationFrame ||
                   window.msRequestAnimationFrame ||
                   function(callback) {
                       window.setTimeout(callback, Math.floor(1000 / 60));
                   };
        })();

        inputVideoElement = document.createElement('video');
        inputVideoElement.autoplay = true;
        inputVideoElement.style.display = 'none';

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia({ audio: false, video: true })
                .then(function(mediaStream) {
                    inputVideoElement.srcObject = mediaStream;
                    inputVideoElement.onloadedmetadata = () => {
                        console.log("VisualInputMonitor: Video stream loaded successfully (modern API).");
                        internalState.processedFrameWidth = samplingWidth;
                        internalState.processedFrameHeight = samplingHeight;
                        internalState.intermediateCanvas = document.createElement('canvas');
                        internalState.intermediateCanvas.width = internalState.processedFrameWidth;
                        internalState.intermediateCanvas.height = internalState.processedFrameHeight * 2;
                        internalState.intermediateCtx = internalState.intermediateCanvas.getContext('2d');

                        selfReference.startMonitoring();
                    };
                })
                .catch(function(errorEvent) {
                    console.error('VisualInputMonitor: Failed to access camera:', errorEvent.name, errorEvent.message);
                    alert('Camera access denied or failed: ' + errorEvent.name + '. Please ensure camera permissions are granted.');
                });
        } else if (navigator.getUserMedia) {
             navigator.getUserMedia( {audio: false, video: true},
                function( mediaStream ) {
                    inputVideoElement.src = window.URL.createObjectURL( mediaStream );
                    inputVideoElement.onloadedmetadata = () => {
                        console.log("VisualInputMonitor: Video stream loaded (deprecated API fallback).");
                        internalState.processedFrameWidth = samplingWidth;
                        internalState.processedFrameHeight = samplingHeight;
                        internalState.intermediateCanvas = document.createElement( 'canvas' );
                        internalState.intermediateCanvas.width = internalState.processedFrameWidth;
                        internalState.intermediateCanvas.height = internalState.processedFrameHeight * 2;
                        internalState.intermediateCtx = internalState.intermediateCanvas.getContext( '2d' );
                        selfReference.startMonitoring();
                    };
                },
                function( errorEvent ) {
                    console.error('VisualInputMonitor: Failed to access camera (deprecated API):', errorEvent.code);
                    alert( 'Camera access did not succeed.\n\nError code: ' + errorEvent.code );
                }
            );
        } else {
            console.error('VisualInputMonitor: Your browser does not support any getUserMedia API for camera access.');
            alert('Your browser does not seem to support camera access. Please update or use a different browser.');
            return;
        }
    };

    VisualInputMonitor.prototype.processFrameForMotion = function() {
        outputCtx.fillStyle = '#F0F0F0';
        outputCtx.fillRect(0, 0, displayWindowWidth, displayWindowHeight);
        outputCtx.globalAlpha = 0.25;

        const gridCellWidth = Math.floor(displayWindowWidth / samplingWidth);
        const gridCellHeight = Math.floor(displayWindowHeight / samplingHeight);

        const pixelDataArray = samplingCtx.getImageData(0, 0, samplingWidth, samplingHeight).data;

        let minYDetectedDisplayPos = displayWindowHeight;
        let highestMotionX = -1;
        let highestMotionY = -1;

        for (let rowIndex = 0; rowIndex < samplingHeight; rowIndex++) {
            for (let colIndex = 0; colIndex < samplingWidth; colIndex++) {
                const pixelIndex = (rowIndex * samplingWidth + colIndex) * 4;
                const redValue = pixelDataArray[pixelIndex];

                if (redValue > this.luminanceChangeThreshold) {
                    const currentXDisplay = colIndex * gridCellWidth;
                    const currentYDisplay = rowIndex * gridCellHeight;

                    if (rowIndex < samplingHeight * this.activeDetectionZoneRatio) {
                        if (currentYDisplay < minYDetectedDisplayPos) {
                            minYDetectedDisplayPos = currentYDisplay;
                            highestMotionX = currentXDisplay;
                            highestMotionY = currentYDisplay;
                        }
                        outputCtx.fillStyle = '#0000FF';
                        outputCtx.fillRect(currentXDisplay, currentYDisplay, gridCellWidth, gridCellHeight);
                    } else {
                        outputCtx.fillStyle = '#00FF00';
                        outputCtx.fillRect(currentXDisplay, currentYDisplay, gridCellWidth, gridCellHeight);
                    }
                }
            }
        }

        if (highestMotionX !== -1) {
            this.smoothedXPos.addValue(highestMotionX);
            this.smoothedYPos.addValue(highestMotionY);
        } else {
            const currentAvgX = this.smoothedXPos.retrieveAverage();
            const currentAvgY = this.smoothedYPos.retrieveAverage();
            const centerX = displayWindowWidth / 2;
            const centerY = displayWindowHeight / 2;
            this.smoothedXPos.addValue(currentAvgX * 0.9 + centerX * 0.1);
            this.smoothedYPos.addValue(currentAvgY * 0.9 + centerY * 0.1);
        }

        outputCtx.fillStyle = '#FF0000';
        const finalAvgX = this.smoothedXPos.retrieveAverage();
        const finalAvgY = this.smoothedYPos.retrieveAverage();
        const crossArmLength = gridCellWidth * 1.5;
        const crossArmThickness = gridCellHeight * 0.5;

        outputCtx.fillRect(finalAvgX - crossArmLength * 0.5, finalAvgY - crossArmThickness * 0.5, crossArmLength, crossArmThickness);
        outputCtx.fillRect(finalAvgX - crossArmThickness * 0.5, finalAvgY - crossArmLength * 0.5, crossArmThickness, crossArmLength);
    };

    VisualInputMonitor.prototype.adjustTargetOrientation = function() {
        const currentAvgX = this.smoothedXPos.retrieveAverage();
        const currentAvgY = this.smoothedYPos.retrieveAverage();

        const normalizedHorizontalOffset = (currentAvgX - displayWindowWidth / 2) / (displayWindowWidth / 2);
        const normalizedVerticalOffset = (displayWindowHeight / 2 - currentAvgY) / (displayWindowHeight / 2);

        const azimuthAngle = this.rotationFactorX * Math.asin(normalizedHorizontalOffset) + (this.offsetXDegrees * DEG_TO_RAD);
        const elevationAngle = this.rotationFactorY * Math.asin(normalizedVerticalOffset) + (this.offsetYDegrees * DEG_TO_RAD);

        const currentTargetPos = this.targetElement.position;
        const radius = Math.sqrt(
            currentTargetPos.x * currentTargetPos.x +
            currentTargetPos.y * currentTargetPos.y +
            currentTargetPos.z * currentTargetPos.z
        );

        currentTargetPos.x = radius * Math.sin(azimuthAngle) * Math.cos(elevationAngle);
        currentTargetPos.z = radius * Math.cos(azimuthAngle) * Math.cos(elevationAngle);
        currentTargetPos.y = radius * Math.sin(elevationAngle);

        const lookAtPoint = this.targetElement.lookAtPoint || { x: 0, y: 0, z: 0 };
        this.targetElement.lookAt(lookAtPoint);
    };

    VisualInputMonitor.prototype.animateFrameProcessing = function() {
        if (!isMonitoringActive) {
            console.log("VisualInputMonitor: Monitoring loop halted.");
            return;
        }

        animationFrameRequester(selfReference.animateFrameProcessing);

        samplingCtx.drawImage(inputVideoElement, 0, 0, samplingWidth, samplingHeight);

        internalState.intermediateCtx.drawImage(samplingCanvasElement, 0, 0);
        internalState.intermediateCtx.drawImage(samplingCanvasElement, 0, internalState.processedFrameHeight);

        if (outputDisplayCanvas.draw && outputDisplayCanvas.mirror && outputDisplayCanvas.update) {
            if (!displayTexture) {
                displayTexture = outputDisplayCanvas.texture(internalState.intermediateCanvas);
            } else {
                displayTexture.loadContentsOf(internalState.intermediateCanvas);
            }
            outputDisplayCanvas.draw(displayTexture);
            outputDisplayCanvas.mirror();
            outputDisplayCanvas.move();
            outputDisplayCanvas.update();
        } else {
             outputCtx.drawImage(samplingCanvasElement, 0, 0, displayWindowWidth, displayWindowHeight);
        }

        selfReference.processFrameForMotion();
        selfReference.adjustTargetOrientation();
    };

    VisualInputMonitor.prototype.startMonitoring = function() {
        if (isMonitoringActive) {
            console.warn("VisualInputMonitor: Monitoring is already active. Ignoring start request.");
            return;
        }
        console.log("VisualInputMonitor: Starting visual input monitoring...");

        if (typeof fx !== 'undefined' && fx.canvas) {
            const oldCanvasElement = outputDisplayCanvas;
            outputDisplayCanvas = fx.canvas();
            outputDisplayCanvas.width = displayWindowWidth;
            outputDisplayCanvas.height = displayWindowHeight;
            outputDisplayCanvas.style.position = oldCanvasElement.style.position;
            outputDisplayCanvas.style.left = oldCanvasElement.style.left;
            outputDisplayCanvas.style.top = oldCanvasElement.style.top;
            outputDisplayCanvas.style.border = oldCanvasElement.style.border;

            if (oldCanvasElement.parentNode) {
                oldCanvasElement.parentNode.replaceChild(outputDisplayCanvas, oldCanvasElement);
            } else {
                 document.body.appendChild(outputDisplayCanvas);
            }
            outputCtx = outputDisplayCanvas.getContext('2d');
        } else {
            console.warn("VisualInputMonitor: 'fx.canvas' library not found. Display effects will be limited to basic canvas drawing.");
        }

        if (inputVideoElement && inputVideoElement.readyState >= 2) {
            inputVideoElement.play().catch(e => console.error("VisualInputMonitor: Failed to play video element:", e));
        } else if (inputVideoElement) {
             console.log("VisualInputMonitor: Video element not ready yet, waiting for metadata.");
        } else {
             console.error("VisualInputMonitor: Video element not initialized. Cannot start monitoring.");
             return;
        }

        isMonitoringActive = true;
        this.animateFrameProcessing();
    };

    VisualInputMonitor.prototype.stopMonitoring = function() {
        if (!isMonitoringActive) {
            console.warn("VisualInputMonitor: Monitoring is already inactive. Ignoring stop request.");
            return;
        }
        console.log("VisualInputMonitor: Halting visual input monitoring...");
        isMonitoringActive = false;

        if (inputVideoElement) {
            inputVideoElement.pause();
            if (inputVideoElement.srcObject) {
                inputVideoElement.srcObject.getTracks().forEach(track => track.stop());
            }
            inputVideoElement.srcObject = null;
        }
    };

    VisualInputMonitor.prototype.getDisplayElement = function() {
        return outputDisplayCanvas;
    };
}