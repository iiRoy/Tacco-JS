class ValueSampler {
    #measurementHistory;
    #currentSum;
    #bufferCapacity;

    constructor(limit) {
        this.#bufferCapacity = limit;
        this.#measurementHistory = [];
        this.#currentSum = 0;
    }

    addObservation(item) {
        this.#measurementHistory.push(item);
        this.#currentSum += item;

        if (this.#measurementHistory.length > this.#bufferCapacity) {
            this.#currentSum -= this.#measurementHistory.shift();
        }
    }

    retrieveMean() {
        if (this.#measurementHistory.length === 0) {
            // Original MovingAverager would return the initial value if no new values were added.
            // If setValue was called, it would use that. Here, if initial value not added, it's 0.
            // To be strictly equivalent, if addObservation was called only once with initial value,
            // and no other values, it should return that. Our constructor handles this.
            return 0;
        }
        return this.#currentSum / this.#measurementHistory.length;
    }
}

class PerceptiveGazeTracker {
    #targetObject;
    #xDimension;
    #yDimension;
    #displayX;
    #displayY;

    #rotationBoostX;
    #rotationBoostY;
    #angularShiftX;
    #angularShiftY;

    #upperDetectionRatio;
    #luminanceThreshold;

    #meanPositionX;
    #meanPositionY;

    #sourceCanvas;
    #sourceContext;
    #outputCanvas;
    #outputContext;
    #mediaStreamVideo;
    #animationHandle;

    #selfReference; // To capture 'this' for callbacks

    constructor(targetEntity) {
        this.#targetObject = targetEntity;

        this.#xDimension = 50;
        this.#yDimension = 50;
        this.#displayX = 245;
        this.#displayY = 200;

        this.#rotationBoostX = 3.0;
        this.#rotationBoostY = 3.0;
        this.#angularShiftX = 15.0; // In degrees
        this.#angularShiftY = 0.0;

        this.#upperDetectionRatio = 0.66;
        this.#luminanceThreshold = 137;

        this.#meanPositionX = new ValueSampler(500);
        this.#meanPositionY = new ValueSampler(500);
        this.#meanPositionX.addObservation(this.#displayX / 2);
        this.#meanPositionY.addObservation(this.#displayY / 2);

        this.#sourceCanvas = document.createElement('canvas');
        this.#sourceCanvas.width = this.#xDimension;
        this.#sourceCanvas.height = this.#yDimension;
        this.#sourceContext = this.#sourceCanvas.getContext('2d');

        this.#outputCanvas = document.createElement('canvas');
        this.#outputCanvas.width = this.#displayX;
        this.#outputCanvas.height = this.#displayY;
        this.#outputCanvas.style.position = 'absolute';
        this.#outputCanvas.style.left = '0px';
        this.#outputCanvas.style.top = '0px';
        this.#outputContext = this.#outputCanvas.getContext('2d');

        document.body.appendChild(this.#outputCanvas);

        this.#selfReference = this;
    }

    async startObservation() {
        this.#mediaStreamVideo = document.createElement('video');
        this.#mediaStreamVideo.autoplay = true; // Automatically play the video stream

        const obtainMediaStream = async (constraints) => {
            if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
                return await navigator.mediaDevices.getUserMedia(constraints);
            } else if (navigator.getUserMedia) { // Deprecated API fallback
                return new Promise((resolve, reject) => {
                    navigator.getUserMedia(constraints, resolve, reject);
                });
            }
            throw new Error('Webcam access not supported by browser.');
        };

        try {
            const mediaStream = await obtainMediaStream({ audio: false, video: true });
            this.#mediaStreamVideo.srcObject = mediaStream;
            
            // Wait for video to load metadata before starting processing
            this.#mediaStreamVideo.addEventListener('loadedmetadata', () => {
                this.#selfReference.initiateProcessingCycle();
            }, { once: true });

            // If video is already ready (e.g., from cache), initiate immediately
            if (this.#mediaStreamVideo.readyState >= 2) {
                this.#selfReference.initiateProcessingCycle();
            }

        } catch (e) {
            alert('Unable to access webcam.\n\nError: ' + (e.message || e.name || e.code));
        }

        this.#animationHandle = (function() {
            return window.requestAnimationFrame || window.webkitRequestAnimationFrame ||
                window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame ||
                function(callback) {
                    window.setTimeout(callback, 1000 / 60);
                };
        })();
    }

    initiateProcessingCycle() {
        // The original `run` method initialized `fx.canvas` and `texture`.
        // For Type IV, we diverge by omitting this external library and its WebGL effects.
        // The core motion detection logic (brightness thresholding) and camera update
        // functionality are independent of `fx.canvas`'s visual effects on the display canvas.
        this.#performContinuousAnalysis();
    }

    #performContinuousAnalysis = () => {
        this.#animationHandle(this.#selfReference.#performContinuousAnalysis);

        // Capture current video frame onto the small processing canvas
        this.#sourceContext.drawImage(this.#mediaStreamVideo, 0, 0, this.#xDimension, this.#yDimension);

        // The original `analyseVideo` then had `fx.canvas` operations, followed by
        // `simpleMotionDetector.analyisMotionPicture()` and `.updateCameraPosition()`.
        // We directly call the analysis and camera update after capturing the frame.
        this.#selfReference.evaluatePixelPattern();
        this.#selfReference.adjustViewpoint();
    }

    evaluatePixelPattern() {
        // Retrieve pixel data from the processing canvas which holds the current video frame.
        const framePixelData = this.#sourceContext.getImageData(0, 0, this.#xDimension, this.#yDimension).data;

        // Clear and prepare the display canvas for drawing.
        this.#outputContext.fillStyle = '#FFFFFF';
        this.#outputContext.fillRect(0, 0, this.#displayX, this.#displayY);
        this.#outputContext.globalAlpha = 0.2;

        const drawingCellWidth = Math.floor(this.#displayX / this.#xDimension) - 1;
        const drawingCellHeight = Math.floor(this.#displayY / this.#yDimension) - 1;

        let detectedPeakY = Number.MAX_VALUE; // Equivalent to yTopPosition
        let latestDetectedX = -1;
        let latestDetectedY = -1;

        // Iterate through pixels using a single loop for divergence.
        const totalPixels = this.#xDimension * this.#yDimension;
        for (let idx = 0; idx < totalPixels; idx++) {
            const xCoord = idx % this.#xDimension;
            const yCoord = Math.floor(idx / this.#xDimension);

            // Access red channel data. Original used `data[x * 4 + y * PIXELS_HORIZONTAL * 4]`.
            const redComponentValue = framePixelData[(xCoord + yCoord * this.#xDimension) * 4];

            if (redComponentValue > this.#luminanceThreshold) {
                const mappedDisplayX = xCoord * this.#displayX / this.#xDimension;
                const mappedDisplayY = yCoord * this.#displayY / this.#yDimension;

                if (yCoord < this.#yDimension * this.#upperDetectionRatio) {
                    if (mappedDisplayY <= detectedPeakY) {
                        detectedPeakY = mappedDisplayY;
                        latestDetectedX = mappedDisplayX;
                        latestDetectedY = mappedDisplayY;
                        this.#outputContext.fillStyle = '#000000';
                        this.#outputContext.fillRect(mappedDisplayX, mappedDisplayY, drawingCellWidth, drawingCellHeight);
                    }
                    this.#outputContext.fillStyle = '#0000FF';
                    this.#outputContext.fillRect(mappedDisplayX, mappedDisplayY, drawingCellWidth, drawingCellHeight);
                } else {
                    this.#outputContext.fillStyle = '#00FF00';
                    this.#outputContext.fillRect(mappedDisplayX, mappedDisplayY, drawingCellWidth, drawingCellHeight);
                }
            }
        }

        // Update the moving averagers with the coordinates of the "highest" detected point in the current frame.
        if (latestDetectedX !== -1) {
            this.#meanPositionX.addObservation(latestDetectedX);
            this.#meanPositionY.addObservation(latestDetectedY);
        }

        // Draw the red cross indicating the averaged motion center.
        this.#outputContext.fillStyle = '#FF0000';
        const avgX = this.#meanPositionX.retrieveMean();
        const avgY = this.#meanPositionY.retrieveMean();
        this.#outputContext.fillRect(avgX - drawingCellWidth * 0.5, avgY, drawingCellWidth * 1.5, drawingCellHeight * 0.5);
        this.#outputContext.fillRect(avgX, avgY - drawingCellHeight * 0.5, drawingCellWidth * 0.5, drawingCellHeight * 1.5);
    }

    adjustViewpoint() {
        const xDisplacementFromCenter = this.#meanPositionX.retrieveMean() * this.#xDimension / this.#displayX - this.#xDimension / 2;
        const horizontalAngle = this.#rotationBoostX * Math.asin(xDisplacementFromCenter / this.#xDimension) + (Math.PI / 180) * this.#angularShiftX;

        const yDisplacementFromCenter = (this.#yDimension / 2 - this.#meanPositionY.retrieveMean() / this.#displayY * this.#yDimension);
        const verticalAngle = this.#rotationBoostY * Math.asin(yDisplacementFromCenter / this.#yDimension) + (Math.PI / 180) * this.#angularShiftY;

        // Assuming this.#targetObject is a camera-like object (e.g., THREE.Camera)
        // with 'position' and 'lookAt' methods, and possibly a 'parent' for its scene.
        const currentX = this.#targetObject.position.x;
        const currentZ = this.#targetObject.position.z;
        const currentY = this.#targetObject.position.y;
        const currentRadius = Math.sqrt(currentX * currentX + currentY * currentY + currentZ * currentZ);

        this.#targetObject.position.x = currentRadius * Math.sin(horizontalAngle) * Math.cos(verticalAngle);
        this.#targetObject.position.z = currentRadius * Math.cos(horizontalAngle) * Math.cos(verticalAngle);
        this.#targetObject.position.y = currentRadius * Math.sin(verticalAngle);

        // The original used `camera.lookAt(scene.position)`.
        // We assume the target object's parent's position is the look-at target,
        // or a default (0,0,0) if no parent is available.
        this.#targetObject.lookAt(this.#targetObject.parent ? this.#targetObject.parent.position : { x: 0, y: 0, z: 0 });
    }

    get outputDisplayElement() {
        return this.#outputCanvas;
    }
}

// Ensure modern `getUserMedia` is available, falling back to older APIs if necessary.
(function() {
    if (navigator.mediaDevices && !navigator.mediaDevices.getUserMedia) {
        navigator.mediaDevices.getUserMedia = function(constraints) {
            return new Promise((resolve, reject) => {
                const legacyGetUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
                if (!legacyGetUserMedia) {
                    return reject(new Error('getUserMedia is not supported by this browser.'));
                }
                legacyGetUserMedia.call(navigator, constraints, resolve, reject);
            });
        };
    }
})();