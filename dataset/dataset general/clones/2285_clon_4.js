const defaultComponentSettings = {
    canvasSelector: 'canvas',
    outputSelector: 'input.output',
    clearButtonSelector: '.clearButton',
    typeButtonSelector: '.typeButton',
    drawButtonSelector: '.drawButton',
    typedContainerSelector: '.typedInputContainer',
    drawDescriptionSelector: '.drawDescription',
    typeDescriptionSelector: '.typeDescription',
    displayOnly: false,
    penWidth: 2,
    penColour: '#1a1a1a',
    penCap: 'round',
    bgColour: '#fff',
    lineWidth: 2,
    lineColour: '#ccc',
    lineMargin: 5,
    lineTop: 100,
    activeClass: 'active',
    onStrokeStarted: null,
    onStrokeEnded: null,
    mouseExitDelay: 500
};

class SketchCanvas {
    #componentOptions;
    #mainElement;
    #surfaceElement;
    #rawSurface;
    #drawingContext;
    #previousCoordinates;
    #drawnSegments;
    #idleTimerId;
    #isInputActive;
    #supportsTouch;
    #eventHandlersBound;
    #typedTextBaseSize;
    #typedTextCurrentSize;
    #typedCharCount;
    #jsonOutputField;
    #clearActionElement;
    #drawModeElement;
    #typeModeElement;
    #typedTextDisplayElement;
    #drawModeDescriptionElement;
    #typeModeDescriptionElement;

    constructor(containerIdentifier, userProvidedOptions) {
        this.#mainElement = document.querySelector(containerIdentifier);
        if (!this.#mainElement) {
            console.error('Container element not found for SketchCanvas:', containerIdentifier);
            return;
        }

        this.#componentOptions = { ...defaultComponentSettings, ...userProvidedOptions };

        this.#surfaceElement = this.#mainElement.querySelector(this.#componentOptions.canvasSelector);
        this.#rawSurface = this.#surfaceElement ? this.#surfaceElement : null;
        this.#drawingContext = this.#rawSurface ? this.#rawSurface.getContext('2d') : null;

        if (!this.#rawSurface || !this.#drawingContext) {
            console.error('Canvas element or 2D context not found for SketchCanvas:', this.#componentOptions.canvasSelector);
            return;
        }

        this.#jsonOutputField = this.#mainElement.querySelector(this.#componentOptions.outputSelector);
        this.#clearActionElement = this.#mainElement.querySelector(this.#componentOptions.clearButtonSelector);
        this.#drawModeElement = this.#mainElement.querySelector(this.#componentOptions.drawButtonSelector);
        this.#typeModeElement = this.#mainElement.querySelector(this.#componentOptions.typeButtonSelector);
        this.#typedTextDisplayElement = this.#mainElement.querySelector(this.#componentOptions.typedContainerSelector);
        this.#drawModeDescriptionElement = this.#mainElement.querySelector(this.#componentOptions.drawDescriptionSelector);
        this.#typeModeDescriptionElement = this.#mainElement.querySelector(this.#componentOptions.typeDescriptionSelector);

        this.#previousCoordinates = { xCoord: null, yCoord: null };
        this.#drawnSegments = [];
        this.#idleTimerId = null;
        this.#isInputActive = false;
        this.#supportsTouch = false;
        this.#eventHandlersBound = false;
        this.#typedTextBaseSize = 30;
        this.#typedTextCurrentSize = this.#typedTextBaseSize;
        this.#typedCharCount = 0;

        this.#drawingContext.lineWidth = this.#componentOptions.penWidth;
        this.#drawingContext.strokeStyle = this.#componentOptions.penColour;
        this.#drawingContext.lineCap = this.#componentOptions.penCap;

        if (this.#componentOptions.displayOnly) {
            this.#disableInteraction();
        } else {
            this.#activateDrawingMode();
        }
    }

    #resetIdleTimer() {
        clearTimeout(this.#idleTimerId);
        this.#idleTimerId = null;
        this.#isInputActive = false;
    }

    #plotSegment(eventData, verticalCorrection = 0) {
        eventData.preventDefault();

        this.#resetIdleTimer();

        const bounds = this.#rawSurface.getBoundingClientRect();
        let currentX, currentY;

        if (eventData.touches && eventData.touches.length > 0) {
            currentX = Math.floor(eventData.touches[0].clientX - bounds.left);
            currentY = Math.floor(eventData.touches[0].clientY - bounds.top);
            this.#supportsTouch = true;
        } else {
            currentX = Math.floor(eventData.clientX - bounds.left);
            currentY = Math.floor(eventData.clientY - bounds.top);
        }

        if (this.#previousCoordinates.xCoord === currentX && this.#previousCoordinates.yCoord === currentY) {
            return;
        }

        if (this.#previousCoordinates.xCoord === null) {
            this.#previousCoordinates.xCoord = currentX;
        }
        if (this.#previousCoordinates.yCoord === null) {
            this.#previousCoordinates.yCoord = currentY;
        }

        if (verticalCorrection) {
            currentY += verticalCorrection;
        }

        this.#drawingContext.beginPath();
        this.#drawingContext.moveTo(this.#previousCoordinates.xCoord, this.#previousCoordinates.yCoord);
        this.#drawingContext.lineTo(currentX, currentY);
        this.#drawingContext.stroke();
        this.#drawingContext.closePath();

        this.#drawnSegments.push({
            startX: this.#previousCoordinates.xCoord,
            startY: this.#previousCoordinates.yCoord,
            endX: currentX,
            endY: currentY
        });

        this.#previousCoordinates.xCoord = currentX;
        this.#previousCoordinates.yCoord = currentY;

        if (this.#componentOptions.onStrokeStarted && typeof this.#componentOptions.onStrokeStarted === 'function') {
            this.#componentOptions.onStrokeStarted.apply(this);
        }
    }

    #proxyHaltDrawing() {
        this.#haltDrawing();
    }

    #haltDrawing(eventData = null) {
        if (eventData) {
            this.#plotSegment(eventData, 1);
        } else {
            if (this.#supportsTouch) {
                this.#rawSurface.removeEventListener('touchmove', this.#handleMovement);
            } else {
                this.#surfaceElement.removeEventListener('mousemove', this.#handleMovement);
            }

            if (this.#drawnSegments.length > 0 && this.#componentOptions.onStrokeEnded && typeof this.#componentOptions.onStrokeEnded === 'function') {
                this.#componentOptions.onStrokeEnded.apply(this);
            }
        }

        this.#previousCoordinates.xCoord = null;
        this.#previousCoordinates.yCoord = null;

        if (this.#jsonOutputField && this.#drawnSegments.length > 0) {
            this.#jsonOutputField.value = JSON.stringify(this.#drawnSegments.map(seg => ({
                lx: seg.endX, ly: seg.endY, mx: seg.startX, my: seg.startY
            })));
        } else if (this.#jsonOutputField) {
            this.#jsonOutputField.value = '';
        }
    }

    #renderSignatureGuideline() {
        if (!this.#componentOptions.lineWidth) {
            return;
        }
        this.#drawingContext.beginPath();
        this.#drawingContext.lineWidth = this.#componentOptions.lineWidth;
        this.#drawingContext.strokeStyle = this.#componentOptions.lineColour;
        this.#drawingContext.moveTo(this.#componentOptions.lineMargin, this.#componentOptions.lineTop);
        this.#drawingContext.lineTo(this.#rawSurface.width - this.#componentOptions.lineMargin, this.#componentOptions.lineTop);
        this.#drawingContext.stroke();
        this.#drawingContext.closePath();
    }

    #eraseAll() {
        this.#drawingContext.clearRect(0, 0, this.#rawSurface.width, this.#rawSurface.height);
        this.#drawingContext.fillStyle = this.#componentOptions.bgColour;
        this.#drawingContext.fillRect(0, 0, this.#rawSurface.width, this.#rawSurface.height);

        if (!this.#componentOptions.displayOnly) {
            this.#renderSignatureGuideline();
        }

        this.#drawingContext.lineWidth = this.#componentOptions.penWidth;
        this.#drawingContext.strokeStyle = this.#componentOptions.penColour;
        this.#drawingContext.lineCap = this.#componentOptions.penCap;

        if (this.#jsonOutputField) {
            this.#jsonOutputField.value = '';
        }
        this.#drawnSegments = [];

        this.#haltDrawing();
    }

    #handleMovement = (eventData) => {
        if (this.#previousCoordinates.xCoord === null) {
            this.#plotSegment(eventData, 1);
        } else {
            this.#plotSegment(eventData);
        }
    };

    #startMovement(eventData, targetElement) {
        if (this.#supportsTouch) {
            targetElement.addEventListener('touchmove', this.#handleMovement, { passive: false });
        } else {
            this.#surfaceElement.addEventListener('mousemove', this.#handleMovement);
        }
        this.#plotSegment(eventData, 1);
    }

    #disableInteraction() {
        this.#eventHandlersBound = false;

        this.#rawSurface.removeEventListener('touchend', this.#proxyHaltDrawing);
        this.#rawSurface.removeEventListener('touchcancel', this.#proxyHaltDrawing);
        this.#rawSurface.removeEventListener('touchmove', this.#handleMovement);
        this.#rawSurface.ontouchstart = null;

        document.removeEventListener('mouseup', this.#handleDocumentMouseUp);
        this.#surfaceElement.removeEventListener('mousedown', this.#handleMouseDown);
        this.#surfaceElement.removeEventListener('mousemove', this.#handleMovement);
        this.#surfaceElement.removeEventListener('mouseleave', this.#handleMouseLeave);

        if (this.#clearActionElement) {
            this.#clearActionElement.removeEventListener('click', this.#handleClearClick);
        }
        if (this.#typeModeElement) {
            this.#typeModeElement.removeEventListener('click', this.#handleTypeModeClick);
        }
        if (this.#drawModeElement) {
            this.#drawModeElement.removeEventListener('click', this.#handleDrawModeClick);
        }
    }

    #setupDrawingListeners(eventData) {
        if (this.#eventHandlersBound) {
            return;
        }
        this.#eventHandlersBound = true;

        document.querySelectorAll('input').forEach(input => input.blur());

        if (eventData.touches && eventData.touches.length > 0) {
            this.#supportsTouch = true;
        }

        if (this.#supportsTouch) {
            this.#rawSurface.addEventListener('touchend', this.#proxyHaltDrawing, { passive: false });
            this.#rawSurface.addEventListener('touchcancel', this.#proxyHaltDrawing, { passive: false });
            this.#surfaceElement.removeEventListener('mousedown', this.#handleMouseDown);
        } else {
            document.addEventListener('mouseup', this.#handleDocumentMouseUp);
            this.#surfaceElement.addEventListener('mouseleave', this.#handleMouseLeave);
            this.#rawSurface.ontouchstart = null;
        }
    }

    #handleMouseDown = (eventData) => {
        eventData.preventDefault();
        if (eventData.which > 1) return;
        this.#isInputActive = true;
        this.#setupDrawingListeners(eventData);
        this.#startMovement(eventData, this.#rawSurface);
    };

    #handleTouchStart = (eventData) => {
        eventData.preventDefault();
        this.#isInputActive = true;
        this.#setupDrawingListeners(eventData);
        this.#startMovement(eventData, this.#rawSurface);
    };

    #handleDocumentMouseUp = () => {
        if (this.#isInputActive) {
            this.#haltDrawing();
            this.#resetIdleTimer();
        }
    };

    #handleMouseLeave = (eventData) => {
        if (this.#isInputActive) {
            this.#haltDrawing(eventData);
        }

        if (this.#isInputActive && !this.#idleTimerId) {
            this.#idleTimerId = setTimeout(() => {
                this.#haltDrawing();
                this.#resetIdleTimer();
            }, this.#componentOptions.mouseExitDelay);
        }
    };

    #handleClearClick = (eventData) => {
        eventData.preventDefault();
        this.#eraseAll();
    };

    #handleTypeModeClick = (eventData) => {
        eventData.preventDefault();
        this.#activateTypingMode();
    };

    #handleDrawModeClick = (eventData) => {
        eventData.preventDefault();
        this.#activateDrawingMode();
    };

    activateDrawingMode() {
        if (this.#typedTextDisplayElement) this.#typedTextDisplayElement.style.display = 'none';
        this.#eraseAll();

        this.#rawSurface.ontouchstart = this.#handleTouchStart;
        this.#surfaceElement.addEventListener('mousedown', this.#handleMouseDown);

        if (this.#clearActionElement) {
            this.#clearActionElement.addEventListener('click', this.#handleClearClick);
        }
        if (this.#typeModeElement) {
            this.#typeModeElement.removeEventListener('click', this.#handleTypeModeClick); // Remove previous handler
            this.#typeModeElement.addEventListener('click', this.#handleTypeModeClick);
        }
        if (this.#drawModeElement) {
            this.#drawModeElement.removeEventListener('click', this.#handleDrawModeClick); // Make it do nothing if already in draw mode
            this.#drawModeElement.addEventListener('click', (e) => e.preventDefault());
        }

        if (this.#typeModeElement) this.#typeModeElement.classList.remove(this.#componentOptions.activeClass);
        if (this.#drawModeElement) this.#drawModeElement.classList.add(this.#componentOptions.activeClass);
        if (this.#mainElement) this.#mainElement.classList.add(this.#componentOptions.activeClass);

        if (this.#typeModeDescriptionElement) this.#typeModeDescriptionElement.style.display = 'none';
        if (this.#drawModeDescriptionElement) this.#drawModeDescriptionElement.style.display = 'block';
        if (this.#clearActionElement) this.#clearActionElement.style.display = 'block';
    }

    activateTypingMode() {
        this.#eraseAll();
        this.#disableInteraction();
        if (this.#typedTextDisplayElement) this.#typedTextDisplayElement.style.display = 'block';

        if (this.#drawModeElement) {
            this.#drawModeElement.removeEventListener('click', this.#handleDrawModeClick); // Remove previous handler
            this.#drawModeElement.addEventListener('click', this.#handleDrawModeClick);
        }
        if (this.#typeModeElement) {
            this.#typeModeElement.removeEventListener('click', this.#handleTypeModeClick); // Make it do nothing if already in type mode
            this.#typeModeElement.addEventListener('click', (e) => e.preventDefault());
        }

        if (this.#jsonOutputField) {
            this.#jsonOutputField.value = '';
        }

        if (this.#drawModeElement) this.#drawModeElement.classList.remove(this.#componentOptions.activeClass);
        if (this.#typeModeElement) this.#typeModeElement.classList.add(this.#componentOptions.activeClass);
        if (this.#mainElement) this.#mainElement.classList.remove(this.#componentOptions.activeClass);

        if (this.#drawModeDescriptionElement) this.#drawModeDescriptionElement.style.display = 'none';
        if (this.#typeModeDescriptionElement) this.#typeModeDescriptionElement.style.display = 'block';
        if (this.#clearActionElement) this.#clearActionElement.style.display = 'none';
    }

    displaySignature(signatureData) {
        this.#eraseAll();
        this.#disableInteraction();

        let parsedData;
        try {
            parsedData = typeof signatureData === 'string' ? JSON.parse(signatureData) : signatureData;
        } catch (e) {
            console.error("Invalid signature data format:", e);
            return;
        }

        if (!Array.isArray(parsedData)) {
            console.error("Signature data must be an array.");
            return;
        }

        this.#drawingContext.lineWidth = this.#componentOptions.penWidth;
        this.#drawingContext.strokeStyle = this.#componentOptions.penColour;
        this.#drawingContext.lineCap = this.#componentOptions.penCap;

        this.#drawnSegments = parsedData.map(seg => ({
            startX: seg.mx, startY: seg.my, endX: seg.lx, endY: seg.ly
        }));

        this.#drawnSegments.forEach(segment => {
            this.#drawingContext.beginPath();
            this.#drawingContext.moveTo(segment.startX, segment.startY);
            this.#drawingContext.lineTo(segment.endX, segment.endY);
            this.#drawingContext.stroke();
            this.#drawingContext.closePath();
        });

        if (this.#jsonOutputField) {
            this.#jsonOutputField.value = JSON.stringify(parsedData);
        }
    }
}