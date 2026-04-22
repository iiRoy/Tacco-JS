/*
 * This file contains JavaScript classes and utilities
 * for simulating a growing garden of blooms.
 * It includes definitions for Vector, Petal, Bloom, and Garden objects.
 */

// Define the Vector class for 2D geometric operations.
function Vector(x, y)
{
    // Initialize the x-coordinate of the vector.
    this.x = x;
    // Initialize the y-coordinate of the vector.
    this.y = y;
}; /* End of Vector constructor */

// Define prototype methods for the Vector class.
Vector.prototype =
{
    /**
     * Rotates the vector by a given angle (theta) in radians.
     * The rotation is performed in-place, modifying the vector's x and y components.
     *
     * @param {number} theta - The angle in radians to rotate the vector.
     * @returns {Vector} - The current vector instance, allowing for method chaining.
     */
    rotate: function(theta)
    {
        // Store the current x and y values before modification.
        var x = this.x;
        var y = this.y;

        // Apply the 2D rotation matrix transformation.
        this.x = Math.cos(theta) * x - Math.sin(theta) * y;
        this.y = Math.sin(theta) * x + Math.cos(theta) * y;

        return this; // Return the modified vector for chaining.
    }, /* End of rotate method */


    /*
     * Multiplies both the x and y components of the vector by a scalar factor 'f'.
     * This operation scales the vector.
     *
     * @param {number} f - The scalar factor to multiply by.
     * @returns {Vector} - The current vector instance.
     */
    mult: function(f)
    {
        this.x *= f; // Scale the x-component.
        this.y *= f; // Scale the y-component.
        return this; // Return for chaining.
    }, /* End of mult method */


    // Creates and returns a new Vector instance that is a copy of the current vector.
    clone: function()
    {
        return new Vector(this.x, this.y); // Create a new Vector with identical coordinates.
    }, /* End of clone method */


    /**
     * Calculates the magnitude (length) of the vector using the Pythagorean theorem.
     *
     * @returns {number} - The Euclidean length of the vector.
     */
    length: function()
    {
        return Math.sqrt(this.x * this.x + this.y * this.y); // √(x² + y²)
    }, /* End of length method */


    /*
     * Subtracts the components of another vector 'v' from this vector.
     * The subtraction is performed in-place.
     *
     * @param {Vector} v - The vector to subtract from the current vector.
     * @returns {Vector} - The current vector instance.
     */
    subtract: function(v)
    {
        this.x -= v.x; // Subtract x-component.
        this.y -= v.y; // Subtract y-component.
        return this;   // Return for chaining.
    }, /* End of subtract method */


    /**
     * Sets the x and y components of the vector to new specified values.
     *
     * @param {number} x - The new x-coordinate.
     * @param {number} y - The new y-coordinate.
     * @returns {Vector} - The current vector instance.
     */
    set: function(x, y)
    {
        this.x = x; // Assign new x-value.
        this.y = y; // Assign new y-value.
        return this; // Return for chaining.
    }  /* End of set method */
}; /* End of Vector.prototype definition */


/**
 * Petal constructor function.
 * Initializes properties for a single petal, which forms part of a bloom.
 *
 * @param {number} stretchA - Stretch factor for the first control point of the Bezier curve.
 * @param {number} stretchB - Stretch factor for the second control point of the Bezier curve.
 * @param {number} startAngle - The initial angle of the petal relative to the bloom's center.
 * @param {number} angle - The angular width of the petal.
 * @param {number} growFactor - The rate at which the petal grows (increases its radius).
 * @param {Bloom} bloom - A reference to the parent Bloom object this petal belongs to.
 */
function Petal(stretchA, stretchB, startAngle, angle, growFactor, bloom)
{
    this.stretchA = stretchA;       // Controls the outward stretch of the first Bezier handle.
    this.stretchB = stretchB;       // Controls the outward stretch of the second Bezier handle.
    this.startAngle = startAngle;   // The starting angle of this petal.
    this.angle = angle;             // The angular span of this petal.
    this.bloom = bloom;             // Reference to the Bloom instance it belongs to.
    this.growFactor = growFactor;   // How much the petal's radius increases per render cycle.
    this.r = 1;                     // Current radius of the petal, starts small.
    this.isfinished = false;        // Flag indicating if the petal has reached its full size.

    /*
     * The following lines were commented out in the original source,
     * likely for features not fully implemented or removed.
     * They are preserved as comments to maintain Type I clone definition.
     * //this.tanAngleA = Garden.random(-Garden.degrad(Garden.options.tanAngle), Garden.degrad(Garden.options.tanAngle));
     * //this.tanAngleB = Garden.random(-Garden.degrad(Garden.options.tanAngle), Garden.degrad(Garden.options.tanAngle));
     */
} // End of Petal constructor


// Define prototype methods for the Petal class.
Petal.prototype =
{
    /**
     * Draws the current state of the petal on the canvas using Bezier curves.
     * The petal's shape is defined by four vector points derived from its properties.
     */
    draw: function()
    {
        // Obtain the 2D rendering context from the associated garden object.
        var ctx = this.bloom.garden.ctx;

        // Declare variables for the four control points of the Bezier curve.
        var v1, v2, v3, v4;

        // Calculate the primary points (v1, v2) and control points (v3, v4) for the petal's curve.
        // v1: Start point of the petal, rotated by its start angle.
        v1 = new Vector(0, this.r).rotate(Garden.degrad(this.startAngle));
        // v2: End point of the petal, rotated by its start angle plus its angular width.
        v2 = v1.clone().rotate(Garden.degrad(this.angle));
        // v3: First Bezier control point, stretched by stretchA. (Original had .rotate(this.tanAngleA) commented out)
        v3 = v1.clone().mult(this.stretchA);
        // v4: Second Bezier control point, stretched by stretchB. (Original had .rotate(this.tanAngleB) commented out)
        v4 = v2.clone().mult(this.stretchB);

        // Set the stroke color for the petal to the bloom's color.
        ctx.strokeStyle = this.bloom.c;

        // Begin a new path for drawing.
        ctx.beginPath();
        // Move to the start point of the petal.
        ctx.moveTo(v1.x, v1.y);
        // Draw a Bezier curve from v1 to v2, using v3 and v4 as control points.
        ctx.bezierCurveTo(v3.x, v3.y, v4.x, v4.y, v2.x, v2.y);
        // Render the defined path.
        ctx.stroke();
    }, // End of draw method


    /*
     * Renders the petal, which involves growing it if it hasn't reached its maximum size,
     * and then drawing it. If the petal has reached its full size, it marks itself as finished.
     */
    render: function()
    {
        // Check if the petal's current radius is less than or equal to the bloom's maximum radius.
        if (this.r <= this.bloom.r)
        {
            this.r += this.growFactor; // Increase the petal's radius by its grow factor. (Original had "// / 10;" comment)
            this.draw();               // Redraw the petal at its new size.
        }
        else
        {
            this.isfinished = true;    // Mark the petal as finished once it reaches full size.
        }
    }
}; // End of Petal.prototype


/**
 * Bloom constructor function.
 * Represents a single flower bloom composed of multiple petals.
 *
 * @param {Vector} p - The position vector (x, y) of the bloom's center.
 * @param {number} r - The maximum radius the bloom will grow to.
 * @param {string} c - The CSS color string for the bloom's petals.
 * @param {number} pc - The number of petals this bloom will have.
 * @param {Garden} garden - A reference to the parent Garden object.
 */
function Bloom(p, r, c, pc, garden)
{
    this.p = p;         // Position of the bloom (Vector object).
    this.r = r;         // Max radius of the bloom.
    this.c = c;         // Color of the bloom.
    this.pc = pc;       // Petal count for this bloom.
    this.petals = [];   // Array to store individual Petal objects.
    this.garden = garden; // Reference to the Garden instance.

    this.init(); // Initialize the petals for this bloom.
    this.garden.addBloom(this); // Add this newly created bloom to the garden.
} // End of Bloom constructor


// Define prototype methods for the Bloom class.
Bloom.prototype =
{
    /**
     * Draws all petals belonging to this bloom.
     * It handles canvas context transformations (translating to the bloom's position)
     * and checks if all petals have finished growing to potentially remove the bloom.
     */
    draw: function()
    {
        var p, isfinished = true; // 'p' for current petal, 'isfinished' flag for bloom completion.

        this.garden.ctx.save();                 // Save the current canvas state.
        this.garden.ctx.translate(this.p.x, this.p.y); // Translate origin to the bloom's center.

        // Iterate through each petal in this bloom.
        for (var i = 0; i < this.petals.length; i++)
        {
            p = this.petals[i]; // Get the current petal.
            p.render();         // Render the petal (grow and draw).
            isfinished *= p.isfinished; // Update the bloom's finished status (true if all petals are finished).
        }

        this.garden.ctx.restore(); // Restore the canvas state to what it was before translation.

        // If all petals have finished growing, remove this bloom from the garden.
        if (isfinished == true)
        {
            this.garden.removeBloom(this);
        }
    }, // End of draw method


    /*
     * Initializes the petals for this bloom.
     * It calculates angular spacing and creates new Petal objects with randomized properties
     * based on the Garden's global options.
     */
    init: function()
    {
        var angle = 360 / this.pc;             // Calculate the angular spacing between petals.
        var startAngle = Garden.randomInt(0, 90); // Generate a random initial rotation for the first petal.

        // Create 'pc' (petal count) number of petals for this bloom.
        for (var i = 0; i < this.pc; i++)
        {
            this.petals.push(
                new Petal(
                    Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max), // Random stretchA
                    Garden.random(Garden.options.petalStretch.min, Garden.options.petalStretch.max), // Random stretchB
                    startAngle + i * angle, // Calculated start angle for this petal
                    angle,                  // Angular width for this petal
                    Garden.random(Garden.options.growFactor.min, Garden.options.growFactor.max),     // Random grow factor
                    this                    // Reference to this bloom instance
                )
            );
        }
    }
}; // End of Bloom.prototype


/**
 * Garden constructor function.
 * This object manages all the blooms, the canvas element, and the rendering context.
 * It provides methods for adding, removing, and creating blooms, as well as clearing the canvas.
 *
 * @param {CanvasRenderingContext2D} ctx - The 2D rendering context of the HTML canvas.
 * @param {HTMLCanvasElement} element - The HTML canvas DOM element itself.
 */
function Garden(ctx, element)
{
    this.blooms = [];   // An array to hold all active Bloom objects in the garden.
    this.element = element; // Reference to the canvas DOM element.
    this.ctx = ctx;     // The 2D rendering context for drawing operations.
} // End of Garden constructor


// Define prototype methods for the Garden class.
Garden.prototype =
{
    /*
     * Renders all active blooms currently in the garden.
     * This method is typically called in an animation loop.
     */
    render: function()
    {
        // Iterate through the 'blooms' array and call the 'draw' method for each bloom.
        for (var i = 0; i < this.blooms.length; i++)
        {
            this.blooms[i].draw();
        }
    }, // End of render method


    // Adds a new Bloom object to the garden's collection of blooms.
    addBloom: function(b)
    {
        this.blooms.push(b); // Appends the new bloom 'b' to the 'blooms' array.
    }, // End of addBloom method


    /**
     * Removes a specific Bloom object from the garden's collection.
     * It searches for the bloom by reference and uses splice to remove it.
     *
     * @param {Bloom} b - The Bloom object to be removed.
     * @returns {Garden} - The current Garden instance, allowing for method chaining.
     */
    removeBloom: function(b)
    {
        var bloom; // Temporary variable to hold the current bloom during iteration.
        // Loop through the blooms array to find the target bloom.
        for (var i = 0; i < this.blooms.length; i++)
        {
            bloom = this.blooms[i];
            if (bloom === b) // Check for strict equality (same object reference).
            {
                this.blooms.splice(i, 1); // Remove 1 element at index 'i'.
                return this;              // Exit the function after removal.
            }
        }
    }, // End of removeBloom method


    /*
     * Creates a new bloom at the specified (x, y) coordinates with randomized properties.
     * The random properties (radius, color, petal count) are determined by Garden.options.
     *
     * @param {number} x - The x-coordinate for the center of the new bloom.
     * @param {number} y - The y-coordinate for the center of the new bloom.
     */
    createRandomBloom: function(x, y)
    {
        // Call the general createBloom method with randomly generated parameters.
        this.createBloom(
            x, // X position
            y, // Y position
            Garden.randomInt(Garden.options.bloomRadius.min, Garden.options.bloomRadius.max), // Random bloom radius
            Garden.randomrgba( // Random RGBA color
                Garden.options.color.rmin,
                Garden.options.color.rmax,
                Garden.options.color.gmin,
                Garden.options.color.gmax,
                Garden.options.color.bmin,
                Garden.options.color.bmax,
                Garden.options.color.opacity
            ),
            Garden.randomInt(Garden.options.petalCount.min, Garden.options.petalCount.max) // Random petal count
        );
    }, // End of createRandomBloom method


    /**
     * Creates a new bloom with specific properties at given coordinates.
     * This method instantiates a new Bloom object.
     *
     * @param {number} x - The x-coordinate of the bloom's center.
     * @param {number} y - The y-coordinate of the bloom's center.
     * @param {number} r - The maximum radius of the bloom.
     * @param {string} c - The CSS color string for the bloom.
     * @param {number} pc - The number of petals for the bloom.
     */
    createBloom: function(x, y, r, c, pc)
    {
        // Create a new Bloom instance, passing in a new Vector for its position.
        new Bloom(new Vector(x, y), r, c, pc, this);
    }, // End of createBloom method


    /*
     * Clears all blooms from the garden and completely clears the canvas.
     * This effectively resets the garden.
     */
    clear: function()
    {
        this.blooms = []; // Empty the array of blooms.
        // Clear the entire canvas area using its width and height.
        this.ctx.clearRect(0, 0, this.element.width, this.element.height);
    }
}; // End of Garden.prototype


/*
 * Global configuration options for the Garden and its components.
 * These options control various aspects of bloom generation, growth, and appearance.
 */
Garden.options =
{
    // Configuration for the number of petals that each bloom can have.
    petalCount:
    {
        min: 8,  // Minimum number of petals.
        max: 15  // Maximum number of petals.
    },

    // Configuration for how much petals stretch outwards from the center.
    petalStretch:
    {
        min: 0.1, // Minimum stretch factor.
        max: 3    // Maximum stretch factor.
    },

    // Configuration for the growth rate of individual petals.
    growFactor:
    {
        min: 0.1, // Minimum increment for petal radius during growth.
        max: 1    // Maximum increment for petal radius during growth.
    },

    // Configuration for the overall maximum radius of a bloom.
    bloomRadius:
    {
        min: 8,   // Minimum final radius for a bloom.
        max: 10   // Maximum final radius for a bloom.
    },

    density: 10,       // A density factor (its specific usage might be external to this code snippet).
    growSpeed: 1000 / 60, // Defines the speed of animation/growth (e.g., updates per second).

    // Color range options for generating random bloom colors (RGBA components).
    color:
    {
        rmin: 128,  // Minimum red component value (0-255).
        rmax: 255,  // Maximum red component value (0-255).
        gmin: 0,    // Minimum green component value (0-255).
        gmax: 128,  // Maximum green component value (0-255).
        bmin: 0,    // Minimum blue component value (0-255).
        bmax: 128,  // Maximum blue component value (0-255).
        opacity: 0.1 // Alpha (transparency) value for bloom colors.
    },

    tanAngle: 60 // An angle value, possibly for tangent calculations (used in commented petal code).
}; /* End of Garden.options */


// Static helper function: Generates a random floating-point number within a specified range.
Garden.random = function(min, max)
{
    return Math.random() * (max - min) + min;
}; /* End of Garden.random */


// Static helper function: Generates a random integer within a specified range (inclusive).
Garden.randomInt = function(min, max)
{
    return Math.floor(Math.random() * (max - min + 1)) + min;
}; /* End of Garden.randomInt */


// Defines the constant for a full circle in radians (2 * PI).
Garden.circle = 2 * Math.PI;


/*
 * Static helper function: Converts an angle from degrees to radians.
 *
 * @param {number} angle - The angle in degrees.
 * @returns {number} - The angle in radians.
 */
Garden.degrad = function(angle)
{
    return Garden.circle / 360 * angle;
}; /* End of Garden.degrad */


/*
 * Static helper function: Converts an angle from radians to degrees.
 *
 * @param {number} angle - The angle in radians.
 * @returns {number} - The angle in degrees.
 */
Garden.raddeg = function(angle)
{
    return angle / Garden.circle * 360;
}; /* End of Garden.raddeg */


// Static helper function: Constructs an RGBA color string.
Garden.rgba = function(r, g, b, a)
{
    return 'rgba(' + r + ',' + g + ',' + b + ',' + a + ')';
}; /* End of Garden.rgba */


/**
 * Static helper function: Generates a random RGBA color string within specified ranges for each component.
 * It includes a check to prevent colors from being too close to grayscale. If the random color
 * is nearly grayscale, it returns a color based on the min/max range boundaries instead.
 *
 * @param {number} rmin - Minimum red component value.
 * @param {number} rmax - Maximum red component value.
 * @param {number} gmin - Minimum green component value.
 * @param {number} gmax - Maximum green component value.
 * @param {number} bmin - Minimum blue component value.
 * @param {number} bmax - Maximum blue component value.
 * @param {number} a - Alpha (opacity) value for the color.
 * @returns {string} - The generated RGBA color string.
 */
Garden.randomrgba = function(rmin, rmax, gmin, gmax, bmin, bmax, a)
{
    var r = Math.round(Garden.random(rmin, rmax)); // Random red component.
    var g = Math.round(Garden.random(gmin, gmax)); // Random green component.
    var b = Math.round(Garden.random(bmin, bmax)); // Random blue component.
    var limit = 5; // Tolerance limit for color component differences.

    // Check if the randomly generated color is too close to grayscale.
    // If the absolute difference between any two color components is within 'limit',
    // it's considered too gray.
    if (Math.abs(r - g) <= limit && Math.abs(g - b) <= limit && Math.abs(b - r) <= limit)
    {
        // If it's too gray, return a fixed color using the min/max range values directly
        // (this behavior seems to be a specific design choice in the original code,
        // rather than generating a new random color).
        return Garden.rgba(rmin, rmax, gmin, gmax, bmin, bmax, a);
    }
    else
    {
        // Otherwise, return the randomly generated color.
        return Garden.rgba(r, g, b, a);
    }
}; /* End of Garden.randomrgba */