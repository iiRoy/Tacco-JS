// --- SpatialPoint Class (formerly Vector) ---
class SpatialPoint {
    // Represents a 2D coordinate in space.
    constructor(h, v) {
        if (typeof h !== 'number' || typeof v !== 'number') {
            console.warn('SpatialPoint constructor received non-numeric coordinates. Defaulting to (0,0).');
            this.h = 0;
            this.v = 0;
        } else {
            this.h = h;
            this.v = v;
        }
    }

    // Rotates the point by a given angle in radians around the origin.
    orient(angleRadians) {
        const currentH = this.h;
        const currentV = this.v;
        const cosAngle = Math.cos(angleRadians);
        const sinAngle = Math.sin(angleRadians);

        this.h = (cosAngle * currentH) - (sinAngle * currentV);
        this.v = (sinAngle * currentH) + (cosAngle * currentV);
        return this; // Allows method chaining
    }

    // Scales the point's coordinates by a given factor.
    scaleBy(scaleFactor) {
        this.h *= scaleFactor;
        this.v *= scaleFactor;
        return this; // Allows method chaining
    }

    // Creates a new SpatialPoint instance with the same coordinates.
    duplicate() {
        return new SpatialPoint(this.h, this.v);
    }

    // Calculates the Euclidean distance from the origin (0,0) to this point.
    getMagnitude() {
        return Math.hypot(this.h, this.v); // More robust than sqrt(x*x + y*y) for large numbers
    }

    // Returns a new SpatialPoint that is the result of subtracting another point.
    offsetBy(deltaPoint) {
        return new SpatialPoint(this.h - deltaPoint.h, this.v - deltaPoint.v);
    }

    // Mutates this SpatialPoint by subtracting another point's coordinates.
    mutateOffsetBy(deltaPoint) {
        this.h -= deltaPoint.h;
        this.v -= deltaPoint.v;
        return this; // Allows method chaining
    }

    // Updates the coordinates of this SpatialPoint.
    updateCoords(newH, newV) {
        if (typeof newH !== 'number' || typeof newV !== 'number') {
            console.warn('updateCoords received non-numeric coordinates. Coordinates not updated.');
            return this;
        }
        this.h = newH;
        this.v = newV;
        return this; // Allows method chaining
    }
}

// --- FlowerLeaflet Class (formerly Petal) ---
class FlowerLeaflet {
    constructor(initialStretch, finalStretch, baseAngleDeg, arcAngleDeg, expansionRate, parentBlossom) {
        this.initialStretch = initialStretch;
        this.finalStretch = finalStretch;
        this.baseAngleDeg = baseAngleDeg;
        this.arcAngleDeg = arcAngleDeg;
        this.expansionRate = expansionRate;
        this.parentBlossom = parentBlossom; // Reference to the owning Blossom instance

        this.currentRadius = 1; // Starts small
        this.isComplete = false; // Flag to indicate if growth is finished
    }

    // Renders the bezier curve shape of the leaflet on the canvas.
    renderShape() {
        const drawingContext = this.parentBlossom.hostGarden.renderContext;
        const degreesToRad = BotanicalCanvas.degreesToRadians;

        // Calculate points for the bezier curve
        const startPoint = new SpatialPoint(0, this.currentRadius).orient(degreesToRad(this.baseAngleDeg));
        const endPoint = startPoint.duplicate().orient(degreesToRad(this.arcAngleDeg));

        // Control points for the bezier curve, using stretch factors
        const ctrlPointA = startPoint.duplicate().scaleBy(this.initialStretch);
        const ctrlPointB = endPoint.duplicate().scaleBy(this.finalStretch);

        drawingContext.strokeStyle = this.parentBlossom.petalColor; // Use blossom's color
        drawingContext.beginPath();
        drawingContext.moveTo(startPoint.h, startPoint.v);
        drawingContext.bezierCurveTo(
            ctrlPointA.h, ctrlPointA.v,
            ctrlPointB.h, ctrlPointB.v,
            endPoint.h, endPoint.v
        );
        drawingContext.stroke();
    }

    // Updates the leaflet's size and calls renderShape if still growing.
    updateAndDraw() {
        if (this.isComplete) {
            return; // Already finished, no need to update or draw
        }

        const maxBlossomRadius = this.parentBlossom.maxRadius;
        if (this.currentRadius <= maxBlossomRadius) {
            // Gradually increase radius, clamping at maxBlossomRadius
            this.currentRadius = Math.min(this.currentRadius + this.expansionRate, maxBlossomRadius);
            this.renderShape();
        } else {
            this.isComplete = true; // Mark as complete once max radius is reached
        }
    }
}

// --- Blossom Class (formerly Bloom) ---
class Blossom {
    constructor(centerPoint, maxRadius, petalColor, leafletCount, hostGarden) {
        // Basic validation for initial parameters
        if (!(centerPoint instanceof SpatialPoint) || maxRadius <= 0 || !petalColor || leafletCount <= 0 || !(hostGarden instanceof BotanicalCanvas)) {
            console.error('Invalid parameters for Blossom constructor.');
            throw new Error('Blossom creation failed due to invalid parameters.');
        }

        this.centerPoint = centerPoint;
        this.maxRadius = maxRadius;
        this.petalColor = petalColor;
        this.leafletCount = leafletCount; // Number of petals
        this.hostGarden = hostGarden;
        this.leaflets = []; // Array to hold FlowerLeaflet instances

        this.initializeShape(); // Set up petals immediately
        this.hostGarden.addBlossom(this); // Add self to the garden's collection
    }

    // Renders all leaflets of the blossom.
    renderBlossom() {
        if (this.leaflets.length === 0) {
            // No leaflets to draw, consider this blossom finished or invalid.
            this.hostGarden.removeBlossom(this);
            return;
        }

        const drawingContext = this.hostGarden.renderContext;
        drawingContext.save(); // Save canvas state
        drawingContext.translate(this.centerPoint.h, this.centerPoint.v); // Move origin to blossom center

        // Check if all leaflets have finished growing
        const allLeafletsComplete = this.leaflets.every(currentLeaflet => {
            currentLeaflet.updateAndDraw(); // Update and draw each leaflet
            return currentLeaflet.isComplete;
        });

        drawingContext.restore(); // Restore canvas state

        // If all leaflets have finished growing, remove the blossom from the garden.
        if (allLeafletsComplete) {
            this.hostGarden.removeBlossom(this);
        }
    }

    // Initializes the individual leaflets for the blossom.
    initializeShape() {
        const anglePerLeaflet = 360 / this.leafletCount;
        const initialRandomAngleOffset = BotanicalCanvas.getRandomInteger(0, 90); // Random starting orientation

        // Helper for getting random stretch and grow factors from settings
        const getStretch = () => BotanicalCanvas.getRandomFloat(BotanicalCanvas.settings.leafletStretchRange.min, BotanicalCanvas.settings.leafletStretchRange.max);
        const getGrowthRate = () => BotanicalCanvas.getRandomFloat(BotanicalCanvas.settings.expansionRateRange.min, BotanicalCanvas.settings.expansionRateRange.max);

        // Populate the leaflets array using Array.from for a functional approach
        this.leaflets = Array.from({
            length: this.leafletCount
        }, (_, i) => {
            const currentBaseAngle = initialRandomAngleOffset + (i * anglePerLeaflet);
            return new FlowerLeaflet(
                getStretch(), // initialStretch
                getStretch(), // finalStretch
                currentBaseAngle, // baseAngleDeg
                anglePerLeaflet, // arcAngleDeg
                getGrowthRate(), // expansionRate
                this // parentBlossom
            );
        });
    }
}

// --- BotanicalCanvas Class (formerly Garden) ---
class BotanicalCanvas {
    constructor(renderContext, canvasElement) {
        if (!renderContext || !canvasElement) {
            console.error('BotanicalCanvas requires a valid rendering context and canvas element.');
            throw new Error('Failed to initialize BotanicalCanvas.');
        }
        this.blossoms = []; // Collection of active blossoms
        this.canvasElement = canvasElement;
        this.renderContext = renderContext;
    }

    // Renders all active blossoms on the canvas.
    drawAllBlossoms() {
        // Use forEach for cleaner iteration, filtering out invalid blossoms if any.
        this.blossoms.forEach(blossom => {
            if (blossom instanceof Blossom) {
                blossom.renderBlossom();
            } else {
                console.warn('Attempted to render a non-Blossom object in the collection. Skipping.');
            }
        });
    }

    // Adds a blossom to the garden's collection.
    addBlossom(blossomToAdd) {
        if (blossomToAdd instanceof Blossom) {
            this.blossoms.push(blossomToAdd);
        } else {
            console.warn('Attempted to add a non-Blossom object to the garden. Not added.');
        }
        return this;
    }

    // Removes a blossom from the garden's collection.
    removeBlossom(blossomToRemove) {
        if (!blossomToRemove) {
            console.warn('Attempted to remove a null/undefined blossom. No action taken.');
            return this;
        }
        const index = this.blossoms.findIndex(b => b === blossomToRemove);
        if (index !== -1) {
            this.blossoms.splice(index, 1);
            // console.log(`Blossom removed. Remaining: ${this.blossoms.length}`); // For debugging
        } else {
            // Optional: Log if the blossom wasn't found, indicates potential logic error
            // console.log('Blossom to remove was not found in the collection.');
        }
        return this;
    }

    // Creates a new blossom with random properties at the specified coordinates.
    generateRandomBlossom(hCoord, vCoord) {
        // Extract ranges from settings for clarity
        const {
            min: radiusMin,
            max: radiusMax
        } = BotanicalCanvas.settings.blossomRadiusRange;
        const {
            min: leafletCountMin,
            max: leafletCountMax
        } = BotanicalCanvas.settings.leafletCountRange;
        const colorOptions = BotanicalCanvas.settings.petalColorOptions;

        // Generate random values
        const randomRadius = BotanicalCanvas.getRandomInteger(radiusMin, radiusMax);
        const randomLeafletCount = BotanicalCanvas.getRandomInteger(leafletCountMin, leafletCountMax);
        const randomColor = BotanicalCanvas.generateRandomRGBA(
            colorOptions.rmin, colorOptions.rmax,
            colorOptions.gmin, colorOptions.gmax,
            colorOptions.bmin, colorOptions.bmax,
            colorOptions.opacity
        );

        this.instantiateBlossom(hCoord, vCoord, randomRadius, randomColor, randomLeafletCount);
    }

    // Instantiates a new blossom with specific properties.
    instantiateBlossom(hCoord, vCoord, radius, color, leafletCount) {
        // Ensure parameters are valid before creating a new Blossom
        if (typeof hCoord !== 'number' || typeof vCoord !== 'number' || radius <= 0 || !color || leafletCount <= 0) {
            console.error('Invalid parameters provided for instantiateBlossom. Blossom not created.');
            return;
        }
        new Blossom(new SpatialPoint(hCoord, vCoord), radius, color, leafletCount, this);
    }

    // Clears all blossoms and the canvas drawing area.
    resetCanvas() {
        this.blossoms = []; // Clear the collection of blossoms
        this.renderContext.clearRect(0, 0, this.canvasElement.width, this.canvasElement.height);
        console.log('Canvas and all blossoms reset.');
    }
}

// --- Static Properties and Helper Functions for BotanicalCanvas ---
BotanicalCanvas.settings = {
    leafletCountRange: {
        min: 8,
        max: 15
    },
    leafletStretchRange: {
        min: 0.1,
        max: 3
    },
    expansionRateRange: {
        min: 0.1,
        max: 1
    },
    blossomRadiusRange: {
        min: 8,
        max: 10
    },
    spawnDensity: 10,
    animationInterval: 1000 / 60, // Target 60 FPS
    petalColorOptions: {
        rmin: 128,
        rmax: 255,
        gmin: 0,
        gmax: 128,
        bmin: 0,
        bmax: 128,
        opacity: 0.1
    },
    tangentAngleDeg: 60, // Original setting, not directly used in this cloned version's Petal logic, but kept for completeness.
    minColorDifference: 20 // Added for generateRandomRGBA to ensure distinct colors
};

// Generates a random floating-point number within a specified range (inclusive of min, exclusive of max for Math.random).
BotanicalCanvas.getRandomFloat = function(min, max) {
    return Math.random() * (max - min) + min;
};

// Generates a random integer within a specified range (inclusive of min and max).
BotanicalCanvas.getRandomInteger = function(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
};

BotanicalCanvas.TAU = 2 * Math.PI; // Full circle in radians

// Converts an angle from degrees to radians.
BotanicalCanvas.degreesToRadians = function(angleInDegrees) {
    return BotanicalCanvas.TAU / 360 * angleInDegrees;
};

// Converts an angle from radians to degrees.
BotanicalCanvas.radiansToDegrees = function(angleInRadians) {
    return angleInRadians / BotanicalCanvas.TAU * 360;
};

// Formats RGBA color components into a CSS string.
BotanicalCanvas.formatRGBA = function(r, g, b, a) {
    return `rgba(${Math.round(r)},${Math.round(g)},${Math.round(b)},${a})`;
};

// Generates a random RGBA color string, ensuring some color variation.
// Re-rolls color components if they are too similar to ensure visual distinction.
BotanicalCanvas.generateRandomRGBA = function(rmin, rmax, gmin, gmax, bmin, bmax, a) {
    const getComponent = (min, max) => Math.round(BotanicalCanvas.getRandomFloat(min, max));
    let r, g, b;
    let attempts = 0;
    const maxAttempts = 10; // Limit re-roll attempts to prevent infinite loop

    do {
        r = getComponent(rmin, rmax);
        g = getComponent(gmin, gmax);
        b = getComponent(bmin, bmax);
        attempts++;
    } while (attempts < maxAttempts &&
        Math.abs(r - g) < BotanicalCanvas.settings.minColorDifference &&
        Math.abs(g - b) < BotanicalCanvas.settings.minColorDifference &&
        Math.abs(b - r) < BotanicalCanvas.settings.minColorDifference
    );

    return BotanicalCanvas.formatRGBA(r, g, b, a);
};

// Utility function to clamp a value within a min/max range.
BotanicalCanvas.clamp = function(value, min, max) {
    return Math.max(min, Math.min(value, max));
};