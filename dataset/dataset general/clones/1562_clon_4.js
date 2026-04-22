class VisionEngine {
    #engineReady = false;
    #isTransmitting = false;
    #cameraAvailable = false;
    #outputWidth = 320;
    #outputHeight = 240;
    #captureIntervalMs = 100;
    #targetCanvasElement = null;
    #canvasDrawingContext = null;
    #sourceVideoElement = null;
    #frameProcessingTimer = null;
    #frameObservers = [];
    #pixelManipulators = [];
    #permissionPromptText = "Your browser requires camera access.";
    #permissionPromptConfig = null;

    constructor() {
        // Constructor is kept light. All setup is in an async method.
    }

    async initializeVisuals(displayTarget, configuration = {}) {
        if (this.#engineReady) {
            console.warn("VisionEngine already initialized. Call terminate() first if re-initialization is needed.");
            return;
        }

        this.#outputWidth = configuration.viewWidth || this.#outputWidth;
        this.#outputHeight = configuration.viewHeight || this.#outputHeight;
        this.#captureIntervalMs = configuration.captureRateMs || this.#captureIntervalMs;
        this.#permissionPromptText = configuration.accessMessage || this.#permissionPromptText;
        this.#permissionPromptConfig = configuration.dialogSettings || this.#permissionPromptConfig;

        this.#targetCanvasElement = displayTarget;
        this.#prepareDisplaySurface();

        this.#sourceVideoElement = document.createElement('video');
        this.#sourceVideoElement.autoplay = true;
        this.#sourceVideoElement.muted = true;
        this.#sourceVideoElement.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;';
        document.body.appendChild(this.#sourceVideoElement);

        try {
            await this.#activateCameraDevice();
            this.#engineReady = true;
        } catch (error) {
            console.error("VisionEngine initialization failed:", error);
            this.#displayAccessError(error);
            this.#engineReady = false;
            if (this.#sourceVideoElement && this.#sourceVideoElement.parentNode) {
                this.#sourceVideoElement.parentNode.removeChild(this.#sourceVideoElement);
            }
        }
    }

    startTransmission(dataHandler = null) {
        if (!this.#engineReady || !this.#cameraAvailable) {
            console.warn("Cannot start transmission: Engine not ready or camera access denied.");
            return;
        }

        if (dataHandler) {
            this.registerDataConsumer(dataHandler, this.#captureIntervalMs);
        }

        if (!this.#isTransmitting) {
            this.#isTransmitting = true;
            this.#initiateFrameLoop();
        }
    }

    stopTransmission() {
        this.#isTransmitting = false;
        window.clearTimeout(this.#frameProcessingTimer);
    }

    registerDataConsumer(consumerFunction, frequencyMs = 0) {
        this.#frameObservers.push({
            worker: consumerFunction,
            interval: frequencyMs,
            lastRunTime: 0
        });
    }

    registerPixelModifier(modifierFunction) {
        this.#pixelManipulators.push({
            transform: modifierFunction
        });
    }

    async #activateCameraDevice() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error("Camera API (getUserMedia) not available in this browser.");
        }

        const mediaConstraints = {
            video: {
                width: { ideal: this.#outputWidth },
                height: { ideal: this.#outputHeight }
            }
        };

        try {
            const stream = await navigator.mediaDevices.getUserMedia(mediaConstraints);
            this.#sourceVideoElement.srcObject = stream;
            await new Promise((resolve) => {
                this.#sourceVideoElement.onloadedmetadata = () => {
                    resolve();
                };
            });
            this.#cameraAvailable = true;
        } catch (error) {
            this.#cameraAvailable = false;
            let errorMessage = "Failed to access camera. ";
            if (error.name === "NotAllowedError") {
                errorMessage += "Permission denied by user.";
            } else if (error.name === "NotFoundError") {
                errorMessage += "No camera found.";
            } else {
                errorMessage += error.message;
            }
            throw new Error(errorMessage);
        }
    }

    #prepareDisplaySurface() {
        if (!this.#targetCanvasElement || !(this.#targetCanvasElement instanceof HTMLCanvasElement)) {
            const autoCanvas = document.createElement("canvas");
            autoCanvas.width = this.#outputWidth;
            autoCanvas.height = this.#outputHeight;
            autoCanvas.style.cssText = 'position: absolute; top: -9999px; left: -9999px; width: 1px; height: 1px; opacity: 0; pointer-events: none;';
            document.body.appendChild(autoCanvas);
            this.#targetCanvasElement = autoCanvas;
        }

        this.#targetCanvasElement.width = this.#outputWidth;
        this.#targetCanvasElement.height = this.#outputHeight;
        this.#canvasDrawingContext = this.#targetCanvasElement.getContext("2d");

        if (!this.#canvasDrawingContext) {
            throw new Error("Could not obtain 2D rendering context from the canvas element.");
        }

        this.#canvasDrawingContext.clearRect(0, 0, this.#outputWidth, this.#outputHeight);
    }

    #initiateFrameLoop = () => {
        if (!this.#isTransmitting) {
            return;
        }

        this.#frameProcessingTimer = window.setTimeout(async () => {
            await this.#processSingleFrame();
            if (this.#isTransmitting) {
                this.#initiateFrameLoop();
            }
        }, this.#captureIntervalMs);
    }

    async #processSingleFrame() {
        if (!this.#isTransmitting || !this.#cameraAvailable || !this.#sourceVideoElement.srcObject) {
            return;
        }

        this.#canvasDrawingContext.drawImage(
            this.#sourceVideoElement,
            0, 0,
            this.#outputWidth, this.#outputHeight
        );

        let currentFrameData = this.#canvasDrawingContext.getImageData(
            0, 0,
            this.#outputWidth, this.#outputHeight
        );

        if (this.#pixelManipulators.length > 0) {
            const pixelDataArray = currentFrameData.data;
            const arrayLength = pixelDataArray.length;

            for (let i = 0; i < arrayLength; i += 4) {
                let pixelObject = {
                    red: pixelDataArray[i + 0],
                    green: pixelDataArray[i + 1],
                    blue: pixelDataArray[i + 2],
                    alpha: pixelDataArray[i + 3]
                };

                for (const modifierEntry of this.#pixelManipulators) {
                    modifierEntry.transform(pixelObject);
                }

                pixelDataArray[i + 0] = pixelObject.red;
                pixelDataArray[i + 1] = pixelObject.green;
                pixelDataArray[i + 2] = pixelObject.blue;
                pixelDataArray[i + 3] = pixelObject.alpha;
            }
            this.#canvasDrawingContext.putImageData(currentFrameData, 0, 0);
        }

        this.#distributeFrameData(currentFrameData);
    }

    #distributeFrameData(processedFrameData) {
        const now = (new Date()).getTime();
        for (const observerEntry of this.#frameObservers) {
            if (observerEntry.lastRunTime < now - observerEntry.interval) {
                observerEntry.lastRunTime = now;
                observerEntry.worker(processedFrameData);
            }
        }
    }

    #displayAccessError(error) {
        const errorDisplay = document.createElement('div');
        errorDisplay.style.cssText = `
            position: fixed; top: 0; left: 0; width: 100%; height: 100%;
            background: rgba(0,0,0,0.9); color: #FFD700; display: flex;
            flex-direction: column; justify-content: center; align-items: center;
            z-index: 10000; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            font-size: 1.5em; text-align: center; padding: 20px; box-sizing: border-box;
        `;
        errorDisplay.innerHTML = `
            <h1>Camera Access Required</h1>
            <p>${this.#permissionPromptText}</p>
            <p style="color: #FF6347; font-size: 0.9em;">Error details: ${error.message || "An unknown camera access issue occurred."}</p>
            <button onclick="this.parentNode.remove()" style="margin-top: 20px; padding: 10px 20px; background-color: #4CAF50; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Dismiss
            </button>
        `;
        document.body.appendChild(errorDisplay);
    }

    terminate() {
        this.stopTransmission();
        if (this.#sourceVideoElement && this.#sourceVideoElement.srcObject) {
            const stream = this.#sourceVideoElement.srcObject;
            const tracks = stream.getTracks();
            tracks.forEach(track => track.stop());
            this.#sourceVideoElement.srcObject = null;
        }
        if (this.#sourceVideoElement && this.#sourceVideoElement.parentNode) {
            this.#sourceVideoElement.parentNode.removeChild(this.#sourceVideoElement);
        }
        if (this.#targetCanvasElement && !this.#targetCanvasElement.id && this.#targetCanvasElement.parentNode) {
            this.#targetCanvasElement.parentNode.removeChild(this.#targetCanvasElement);
        }
        this.#engineReady = false;
        this.#cameraAvailable = false;
        this.#frameObservers = [];
        this.#pixelManipulators = [];
    }
}