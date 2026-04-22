class VisualCollaborator {
    #previousPoints = {};
    #drawingContext;
    #isDrawingActive = false;
    #networkChannel;
    #currentHue;
    #brushThickness;
    #canvasWidth;
    #canvasHeight;

    #drawingSurface;
    #thicknessSelector;
    #hueSelector;
    #resetButton;
    #containerElement;
    #userCounter;
    #pageBody;

    constructor() {
        this.#gatherDOMElements();
        this.#configureDrawingCanvas();
        this.#fetchInitialParameters();
        this.#establishRemoteConnection();
        this.#setupInteractionEvents();
        this.#optimizeMobileView();
    }

    #gatherDOMElements() {
        this.#pageBody = document.body;
        this.#drawingSurface = document.querySelector('#canvas');
        this.#thicknessSelector = document.querySelector('#size');
        this.#hueSelector = document.querySelector('#color');
        this.#resetButton = document.querySelector('#clear');
        this.#containerElement = document.querySelector('#game');
        this.#userCounter = document.querySelector('#count');
    }

    #configureDrawingCanvas() {
        this.#drawingContext = this.#drawingSurface.getContext('2d');
        this.#canvasWidth = this.#drawingSurface.getAttribute('width');
        this.#canvasHeight = this.#drawingSurface.getAttribute('height');
    }

    #fetchInitialParameters() {
        this.#brushThickness = this.#thicknessSelector.options[this.#thicknessSelector.selectedIndex].value;
        this.#currentHue = this.#hueSelector.options[this.#hueSelector.selectedIndex].value.toLowerCase();
    }

    #establishRemoteConnection() {
        this.#networkChannel = new io.connect();
        this.#networkChannel.on('paint', this.#ingestDrawingSegment.bind(this));
        this.#networkChannel.on('message', this.#processIncomingBroadcast.bind(this));
        this.#networkChannel.on('reset', this.#removeSessionTrace.bind(this));
        this.#networkChannel.on('clear', this.#cleanDrawingArea.bind(this));
    }

    #setupInteractionEvents() {
        this.#drawingSurface.addEventListener('mousemove', this.#managePointerMovement.bind(this));
        window.addEventListener('mouseup', this.#releaseDrawingEngagement.bind(this));
        window.addEventListener('mousedown', this.#initiateDrawingEngagement.bind(this));

        this.#thicknessSelector.addEventListener('change', () => {
            this.#brushThickness = this.#thicknessSelector.options[this.#thicknessSelector.selectedIndex].value;
            this.#isDrawingActive = false;
        });
        this.#hueSelector.addEventListener('change', () => {
            this.#currentHue = this.#hueSelector.options[this.#hueSelector.selectedIndex].value.toLowerCase();
            this.#isDrawingActive = false;
        });

        this.#resetButton.addEventListener('click', () => {
            this.#cleanDrawingArea();
            this.#networkChannel.emit('clear');
            this.#isDrawingActive = false;
            this.#resetLocalDrawingPath();
        });

        this.#pageBody.addEventListener('touchmove', (inputEvent) => inputEvent.preventDefault(), { passive: false });
        this.#drawingSurface.addEventListener('touchstart', this.#releaseDrawingEngagement.bind(this));
        this.#drawingSurface.addEventListener('touchmove', this.#managePointerMovement.bind(this));
    }

    #optimizeMobileView() {
        setTimeout(() => window.scrollTo(0, 1), 100);
    }

    #ingestDrawingSegment(transmission) {
        this.#renderStrokeComponent(transmission.circle, transmission.sessionId);
    }

    #processIncomingBroadcast(transmission) {
        if (transmission.buffer) {
            transmission.buffer.forEach(segment => this.#ingestDrawingSegment(segment));
        }
        if (transmission.count) {
            this.#userCounter.innerHTML = `Active Participants: ${transmission.count}`;
        }
    }

    #removeSessionTrace(transmission) {
        delete this.#previousPoints[transmission.sessionId];
    }

    #cleanDrawingArea() {
        this.#drawingContext.clearRect(0, 0, this.#canvasWidth, this.#canvasHeight);
    }

    #resetLocalDrawingPath() {
        delete this.#previousPoints['self'];
        this.#networkChannel.emit('reset');
    }

    #initiateDrawingEngagement() {
        this.#isDrawingActive = true;
    }

    #releaseDrawingEngagement() {
        this.#isDrawingActive = false;
        this.#resetLocalDrawingPath();
    }

    #managePointerMovement(inputEvent) {
        let coordX, coordY;
        const isTouchInteraction = inputEvent.targetTouches && inputEvent.targetTouches.length > 0;

        if (!this.#isDrawingActive && !isTouchInteraction) return;

        if (this.#isDrawingActive) {
            coordX = inputEvent.clientX + window.scrollX;
            coordY = inputEvent.clientY + window.scrollY;
        } else if (isTouchInteraction) {
            coordX = inputEvent.targetTouches[0].clientX;
            coordY = inputEvent.targetTouches[0].clientY;
        } else {
            return;
        }

        coordX -= this.#containerElement.offsetLeft;
        coordY -= this.#containerElement.offsetTop;

        const strokeDetails = {
            x: coordX,
            y: coordY,
            color: this.#currentHue,
            size: this.#brushThickness
        };

        this.#renderStrokeComponent(strokeDetails);
        this.#networkChannel.emit('paint', strokeDetails);
    }

    #renderStrokeComponent(componentData, participantId = 'self') {
        this.#drawingContext.strokeStyle = componentData.color;
        this.#drawingContext.fillStyle = componentData.color;
        this.#drawingContext.lineWidth = componentData.size;
        this.#drawingContext.lineCap = 'round';

        this.#drawingContext.beginPath();
        if (this.#previousPoints[participantId]) {
            this.#drawingContext.moveTo(this.#previousPoints[participantId].x, this.#previousPoints[participantId].y);
            this.#drawingContext.lineTo(componentData.x, componentData.y);
            this.#drawingContext.stroke();
        } else {
            this.#drawingContext.moveTo(componentData.x, componentData.y);
            this.#drawingContext.arc(componentData.x, componentData.y, componentData.size / 2, 0, Math.PI * 2, true);
            this.#drawingContext.fill();
        }
        this.#drawingContext.closePath();

        this.#previousPoints[participantId] = componentData;
    }
}

(function () {
    new VisualCollaborator();
})();