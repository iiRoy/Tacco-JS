class VisionProcessor {
    #targetElement;
    #detectionSuccessHandler;
    #detectionErrorHandler;
    #streamErrorHandler;

    #videoDisplay;
    #canvasElement;
    #canvasContext;
    #activeMediaFlow;
    #processingIntervalIdentifier;

    constructor(containerElement, successCallback, errorCallback, mediaErrorCallback) {
        if (!(containerElement instanceof HTMLElement)) {
            throw new Error("Target container must be a valid DOM element.");
        }

        this.#targetElement = containerElement;
        this.#detectionSuccessHandler = successCallback;
        this.#detectionErrorHandler = errorCallback;
        this.#streamErrorHandler = mediaErrorCallback;

        this.#prepareVisuals();
        this.#commenceMediaAcquisition();
        this.#configureCodeDetection();
    }

    #prepareVisuals() {
        const preferredHeight = this.#targetElement.offsetHeight || 250;
        const preferredWidth = this.#targetElement.offsetWidth || 300;

        this.#videoDisplay = document.createElement('video');
        this.#videoDisplay.setAttribute('width', `${preferredWidth}px`);
        this.#videoDisplay.setAttribute('height', `${preferredHeight}px`);
        this.#videoDisplay.autoplay = true;
        this.#videoDisplay.playsInline = true;

        this.#canvasElement = document.createElement('canvas');
        this.#canvasElement.id = 'visual-scan-surface';
        this.#canvasElement.setAttribute('width', `${preferredWidth - 2}px`);
        this.#canvasElement.setAttribute('height', `${preferredHeight - 2}px`);
        this.#canvasElement.style.display = 'none';

        this.#targetElement.appendChild(this.#videoDisplay);
        this.#targetElement.appendChild(this.#canvasElement);

        this.#canvasContext = this.#canvasElement.getContext('2d');
    }

    #commenceMediaAcquisition() {
        const mediaConstraints = { video: true };

        const streamActivated = (mediaStream) => {
            this.#activeMediaFlow = mediaStream;
            if (this.#videoDisplay.srcObject !== undefined) {
                this.#videoDisplay.srcObject = mediaStream;
            } else if (window.URL && window.URL.createObjectURL) {
                this.#videoDisplay.src = window.URL.createObjectURL(mediaStream);
            } else {
                this.#streamErrorHandler(new Error("Unable to assign media stream to video element."));
                return;
            }

            this.#videoDisplay.onloadedmetadata = () => {
                this.#videoDisplay.play();
                this.#processingIntervalIdentifier = setTimeout(() => this.#performFrameProcessing(), 1000);
            };
        };

        const streamAcquisitionFailed = (problem) => {
            console.error("Failed to obtain video stream:", problem);
            this.#streamErrorHandler(problem);
        };

        if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
            navigator.mediaDevices.getUserMedia(mediaConstraints)
                .then(streamActivated)
                .catch(streamAcquisitionFailed);
        } else if (navigator.getUserMedia) {
            navigator.getUserMedia(mediaConstraints, streamActivated, streamAcquisitionFailed);
        } else {
            streamAcquisitionFailed(new Error('Webcam access not supported by this browser.'));
        }
    }

    #performFrameProcessing() {
        if (this.#activeMediaFlow) {
            this.#canvasContext.drawImage(this.#videoDisplay, 0, 0, 307, 250);

            try {
                // Assuming 'qrcode' is a globally available library, as in the original.
                qrcode.decode();
            } catch (err) {
                this.#detectionErrorHandler(err);
            }
        }
        this.#processingIntervalIdentifier = setTimeout(() => this.#performFrameProcessing(), 500);
    }

    #configureCodeDetection() {
        // Assuming 'qrcode' is a globally available library, as in the original.
        qrcode.callback = this.#detectionSuccessHandler;
    }

    terminateScanning() {
        if (this.#processingIntervalIdentifier) {
            clearTimeout(this.#processingIntervalIdentifier);
            this.#processingIntervalIdentifier = null;
        }
        if (this.#activeMediaFlow) {
            this.#activeMediaFlow.getTracks().forEach(track => track.stop());
            this.#activeMediaFlow = null;
        }
        if (this.#videoDisplay) {
            this.#videoDisplay.pause();
            this.#videoDisplay.srcObject = null;
            this.#videoDisplay.remove();
        }
        if (this.#canvasElement) {
            this.#canvasElement.remove();
        }
    }
}