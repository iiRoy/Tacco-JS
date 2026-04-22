class Artist {
    #orientationDegrees = -90;
    #currentXPosition = 0;
    #currentYPosition = 0;
    #referenceX = 0;
    #referenceY = 0;
    #isTracing = true;
    #drawingSurface;
    #pathOutlineColor = "#000";
    #pathThickness = 1;
    #pathFillColor = "";
    #savedPositions = [];

    static #degreesToRads = Math.PI / 180.0;

    constructor(canvasIdentifier) {
        const designatedElement = typeof canvasIdentifier === 'string'
            ? document.getElementById(canvasIdentifier)
            : canvasIdentifier;

        if (!designatedElement || !designatedElement.getContext) {
            throw new Error("Invalid canvas element provided.");
        }

        this.#drawingSurface = designatedElement.getContext("2d");
        this.#drawingSurface.strokeStyle = this.#pathOutlineColor;
        this.#drawingSurface.lineWidth = this.#pathThickness;
        this.#drawingSurface.fillStyle = this.#pathFillColor;

        this.#drawingSurface.beginPath();
    }

    #getRadians(degrees) {
        return degrees * Artist.#degreesToRads;
    }

    adjustHeading(angleDelta) {
        this.#orientationDegrees += angleDelta;
        this.#orientationDegrees %= 360;
        return this;
    }

    setInkColor(colorSpec) {
        this.#pathFillColor = this.#drawingSurface.fillStyle = colorSpec;
        return this;
    }

    savePosition() {
        this.#savedPositions.push({
            xCoord: this.#currentXPosition,
            yCoord: this.#currentYPosition,
            angleValue: this.#orientationDegrees
        });
        return this;
    }

    pointDirection(absoluteAngle) {
        this.#orientationDegrees = absoluteAngle - 90;
        return this;
    }

    returnToMark() {
        const priorState = this.#savedPositions.pop();
        if (priorState) {
            this.#orientationDegrees = priorState.angleValue;
            this.teleportTo(priorState.xCoord, priorState.yCoord);
        }
        return this;
    }

    moveForward(distanceMagnitude) {
        const angleRad = this.#getRadians(this.#orientationDegrees);

        this.#currentXPosition += distanceMagnitude * Math.cos(angleRad);
        this.#currentYPosition += distanceMagnitude * Math.sin(angleRad);

        if (this.#isTracing) {
            this.#drawingSurface.lineTo(this.#currentXPosition, this.#currentYPosition);
        } else {
            this.#drawingSurface.moveTo(this.#currentXPosition, this.#currentYPosition);
        }
        return this;
    }

    moveBackward(distanceMagnitude) {
        this.adjustHeading(-180);
        this.moveForward(distanceMagnitude);
        this.adjustHeading(180);
        return this;
    }

    drawOutline() {
        this.#drawingSurface.stroke();
        return this;
    }

    applyColor() {
        this.#drawingSurface.fill();
        return this;
    }

    initiateDrawing() {
        this.#drawingSurface.beginPath();
        return this;
    }

    sealShape() {
        this.#drawingSurface.closePath();
        return this;
    }

    finalizeDrawing() {
        if (this.#pathFillColor) {
            this.applyColor();
        }
        if (this.#pathThickness > 0) {
            this.drawOutline();
        }
        return this.initiateDrawing();
    }

    deactivateTracing() {
        this.#isTracing = false;
        return this;
    }

    activateTracing() {
        this.#isTracing = true;
        return this;
    }

    teleportTo(destinationX, destinationY) {
        this.#currentXPosition = destinationX;
        this.#currentYPosition = destinationY;

        if (!this.#isTracing) {
            this.#drawingSurface.moveTo(destinationX, destinationY);
        } else {
            this.#drawingSurface.lineTo(destinationX, destinationY);
        }
        return this;
    }

    relocateWithoutLine(destinationX, destinationY) {
        this.#drawingSurface.beginPath();
        const originalTracingState = this.#isTracing;
        this.#isTracing = true;
        this.teleportTo(destinationX, destinationY);
        this.#isTracing = originalTracingState;
        return this;
    }

    shiftUp(magnitude) {
        return this.teleportTo(this.#currentXPosition, this.#currentYPosition - magnitude);
    }

    shiftDown(magnitude) {
        return this.teleportTo(this.#currentXPosition, this.#currentYPosition + magnitude);
    }

    shiftLeft(magnitude) {
        return this.teleportTo(this.#currentXPosition - magnitude, this.#currentYPosition);
    }

    shiftRight(magnitude) {
        return this.teleportTo(this.#currentXPosition + magnitude, this.#currentYPosition);
    }

    navigatePolar(radialDistance, angularOffset) {
        const absoluteAngleRad = this.#getRadians(angularOffset + this.#orientationDegrees);

        this.#currentXPosition = this.#referenceX + radialDistance * Math.cos(absoluteAngleRad);
        this.#currentYPosition = this.#referenceY + radialDistance * Math.sin(absoluteAngleRad);

        if (this.#isTracing) {
            this.#drawingSurface.lineTo(this.#currentXPosition, this.#currentYPosition);
        } else {
            this.#drawingSurface.moveTo(this.#currentXPosition, this.#currentYPosition);
        }
        return this;
    }

    establishReference() {
        this.#referenceX = this.#currentXPosition;
        this.#referenceY = this.#currentYPosition;
        return this;
    }

    adjustBrushWidth(sizeValue) {
        this.#pathThickness = this.#drawingSurface.lineWidth = sizeValue;
        return this;
    }

    configureStroke(styleString) {
        this.#drawingSurface.strokeStyle = this.#pathOutlineColor = styleString;
        return this;
    }

    displayString(textContent) {
        this.#drawingSurface.fillText(textContent, this.#currentXPosition, this.#currentYPosition);
        return this;
    }

    setTextStyle(fontSpec) {
        this.#drawingSurface.font = fontSpec;
        return this;
    }
}