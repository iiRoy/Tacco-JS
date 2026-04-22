const HortusUtils = {
    settings: {
        segmentQuantity: {
            min: 8,
            max: 15
        },
        segmentElongation: {
            min: 0.1,
            max: 3
        },
        expansionFactor: {
            min: 0.1,
            max: 1
        },
        blossomRadius: {
            min: 8,
            max: 10
        },
        populationDensity: 10,
        growthPace: 1000 / 60,
        hue: {
            redMin: 128,
            redMax: 255,
            greenMin: 0,
            greenMax: 128,
            blueMin: 0,
            blueMax: 128,
            alphaValue: 0.1
        },
        tangentArc: 60
    },
    fetchRandom: (lowerBound, upperBound) => Math.random() * (upperBound - lowerBound) + lowerBound,
    fetchRandomInteger: (lowerBound, upperBound) => Math.floor(Math.random() * (upperBound - lowerBound + 1)) + lowerBound,
    fullCircleRadians: 2 * Math.PI,
    degreesToRadians: (angleDegrees) => HortusUtils.fullCircleRadians / 360 * angleDegrees,
    radiansToDegrees: (angleRadians) => angleRadians / HortusUtils.fullCircleRadians * 360,
    composeRgba: (rValue, gValue, bValue, alpha) => `rgba(${rValue},${gValue},${bValue},${alpha})`,
    composeRandomRgba: (redMin, redMax, greenMin, greenMax, blueMin, blueMax, alphaValue) => {
        const redVal = Math.round(HortusUtils.fetchRandom(redMin, redMax));
        const greenVal = Math.round(HortusUtils.fetchRandom(greenMin, greenMax));
        const blueVal = Math.round(HortusUtils.fetchRandom(blueMin, blueMax));
        const similarityLimit = 5;
        if (Math.abs(redVal - greenVal) <= similarityLimit && Math.abs(greenVal - blueVal) <= similarityLimit && Math.abs(blueVal - redVal) <= similarityLimit) {
            return HortusUtils.composeRgba(redMin, redMax, greenMin, greenMax, blueMin, blueMax, alphaValue);
        } else {
            return HortusUtils.composeRgba(redVal, greenVal, blueVal, alphaValue);
        }
    }
};

class Point {
    constructor(coordA, coordB) {
        this.coordA = coordA;
        this.coordB = coordB;
    }

    spin(angleInRadians) {
        const currentA = this.coordA;
        const currentB = this.coordB;
        return new Point(
            Math.cos(angleInRadians) * currentA - Math.sin(angleInRadians) * currentB,
            Math.sin(angleInRadians) * currentA + Math.cos(angleInRadians) * currentB
        );
    }

    scale(factor) {
        return new Point(this.coordA * factor, this.coordB * factor);
    }

    duplicate() {
        return new Point(this.coordA, this.coordB);
    }

    magnitude() {
        return Math.sqrt(this.coordA * this.coordA + this.coordB * this.coordB);
    }

    offsetBy(otherPoint) {
        return new Point(this.coordA - otherPoint.coordA, this.coordB - otherPoint.coordB);
    }

    assign(newCoordA, newCoordB) {
        // Original Vector.set modified in-place and returned `this`.
        // For immutability, we return a new Point.
        return new Point(newCoordA, newCoordB);
    }
}

class Segment {
    constructor(extentOne, extentTwo, initialBearing, sweepArc, expansionRate, parentBlossom) {
        this.extentOne = extentOne;
        this.extentTwo = extentTwo;
        this.initialBearing = initialBearing;
        this.sweepArc = sweepArc;
        this.parentBlossom = parentBlossom;
        this.expansionRate = expansionRate;
        this.currentSize = 1;
        this.isComplete = false;
    }

    depict() {
        const drawingContext = this.parentBlossom.containerHortus.drawingContext;
        let p1, p2, p3, p4;

        p1 = new Point(0, this.currentSize).spin(HortusUtils.degreesToRadians(this.initialBearing));
        p2 = p1.duplicate().spin(HortusUtils.degreesToRadians(this.sweepArc));
        p3 = p1.duplicate().scale(this.extentOne);
        p4 = p2.duplicate().scale(this.extentTwo);

        drawingContext.strokeStyle = this.parentBlossom.shade;
        drawingContext.beginPath();
        drawingContext.moveTo(p1.coordA, p1.coordB);
        drawingContext.bezierCurveTo(p3.coordA, p3.coordB, p4.coordA, p4.coordB, p2.coordA, p2.coordB);
        drawingContext.stroke();
    }

    advance() {
        if (this.currentSize <= this.parentBlossom.finalSize) {
            this.currentSize += this.expansionRate;
            this.depict();
        } else {
            this.isComplete = true;
        }
    }
}

class Blossom {
    constructor(centerPoint, finalSize, shade, segmentCount, containerHortus) {
        this.centerPoint = centerPoint;
        this.finalSize = finalSize;
        this.shade = shade;
        this.segmentCount = segmentCount;
        this.segments = [];
        this.containerHortus = containerHortus;
        this.initialize();
        this.containerHortus.addBlossom(this);
    }

    depict() {
        this.containerHortus.drawingContext.save();
        this.containerHortus.drawingContext.translate(this.centerPoint.coordA, this.centerPoint.coordB);

        const allSegmentsComplete = this.segments.every(segment => {
            segment.advance();
            return segment.isComplete;
        });

        this.containerHortus.drawingContext.restore();

        if (allSegmentsComplete) {
            this.containerHortus.removeBlossom(this);
        }
    }

    initialize() {
        const segmentArc = 360 / this.segmentCount;
        const initialAngleOffset = HortusUtils.fetchRandomInteger(0, 90);

        this.segments = Array.from({
            length: this.segmentCount
        }, (_, i) => {
            return new Segment(
                HortusUtils.fetchRandom(HortusUtils.settings.segmentElongation.min, HortusUtils.settings.segmentElongation.max),
                HortusUtils.fetchRandom(HortusUtils.settings.segmentElongation.min, HortusUtils.settings.segmentElongation.max),
                initialAngleOffset + i * segmentArc,
                segmentArc,
                HortusUtils.fetchRandom(HortusUtils.settings.expansionFactor.min, HortusUtils.settings.expansionFactor.max),
                this
            );
        });
    }
}

class Hortus {
    constructor(drawingContext, canvasElement) {
        this.blossoms = [];
        this.canvasElement = canvasElement;
        this.drawingContext = drawingContext;
    }

    advanceAll() {
        this.blossoms.forEach(blossom => blossom.depict());
    }

    addBlossom(newBlossom) {
        this.blossoms.push(newBlossom);
    }

    removeBlossom(blossomToRemove) {
        this.blossoms = this.blossoms.filter(blossom => blossom !== blossomToRemove);
    }

    spawnRandomBlossom(xCoord, yCoord) {
        this.spawnBlossom(
            xCoord,
            yCoord,
            HortusUtils.fetchRandomInteger(HortusUtils.settings.blossomRadius.min, HortusUtils.settings.blossomRadius.max),
            HortusUtils.composeRandomRgba(
                HortusUtils.settings.hue.redMin, HortusUtils.settings.hue.redMax,
                HortusUtils.settings.hue.greenMin, HortusUtils.settings.hue.greenMax,
                HortusUtils.settings.hue.blueMin, HortusUtils.settings.hue.blueMax,
                HortusUtils.settings.hue.alphaValue
            ),
            HortusUtils.fetchRandomInteger(HortusUtils.settings.segmentQuantity.min, HortusUtils.settings.segmentQuantity.max)
        );
    }

    spawnBlossom(xCoord, yCoord, radius, colorString, count) {
        new Blossom(new Point(xCoord, yCoord), radius, colorString, count, this);
    }

    resetAll() {
        this.blossoms = [];
        this.drawingContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
    }
}