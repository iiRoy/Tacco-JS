( function () {

    // Enable strict mode for better error handling and cleaner code.
    "use strict";

    var Framework; // Declare the main Framework object.

    // Check if RequireJS (or a similar AMD loader) is present.
    if ( window.define !== undefined ) {

        // If 'define' exists, initialize Framework and register it.
        Framework = {};

        // Double-check for 'define' before calling it.
        if ( window.define !== undefined ) {
            window.define( "Microsoft/XNA/Framework", Framework );
        }
    }
    else {
        // If no AMD loader, ensure the Microsoft.Xna.Framework namespace exists.

        if ( window.Microsoft === undefined ) {
            window.Microsoft = {}; // Create Microsoft namespace if it doesn't exist.
        }

        if ( window.Microsoft.Xna === undefined ) {
            window.Microsoft.Xna = {}; // Create Xna namespace if it doesn't exist.
        }

        if ( window.Microsoft.Xna.Framework === undefined ) {
            window.Microsoft.Xna.Framework = {}; // Create Framework namespace if it doesn't exist.
        }

        // Assign the Framework object to the established namespace.
        Framework = window.Microsoft.Xna.Framework;
    }


    // Initialize Framework sub-namespaces if they don't exist.
    if ( Framework.Graphics === undefined ) {
        Framework.Graphics = {};
    }
    var Graphics = Framework.Graphics; // Alias for convenience.

    if ( Framework.Input === undefined ) {
        Framework.Input = {};
    }
    var Input = Framework.Input; // Alias for convenience.

    if ( Framework.Media === undefined ) {
        Framework.Media = {};
    }
    var Media = Framework.Media; // Alias for convenience.


    // Define a minimum date constant, often used for date calculations.
    var MIN_DATE = new Date( -8640000000000000 );


    // Region: MathHelper - Provides static methods for common mathematical functions.
    // -----------------------------------------------------------------------------

    Framework.MathHelper = {}; // Initialize the MathHelper object.
    var MathHelper = Framework.MathHelper; // Alias for convenience.


    // Define common mathematical constants.
    MathHelper.E          = Math.E;
    MathHelper.Log10E     = 0.4342945;
    MathHelper.Log2E      = 1.442695;
    MathHelper.Pi         = Math.PI;
    MathHelper.PiOver2    = Math.PI / 2;
    MathHelper.PiOver4    = Math.PI / 4;
    MathHelper.TwoPi      = Math.PI * 2;


    /**
     * Calculates the barycentric coordinate of a point.
     * @param {number} value1 - The first value.
     * @param {number} value2 - The second value.
     * @param {number} value3 - The third value.
     * @param {number} amount1 - The first barycentric weight.
     * @param {number} amount2 - The second barycentric weight.
     * @returns {number} The barycentric value.
     */
    MathHelper.barycentric = function ( value1, value2, value3, amount1, amount2 ) {
        return value1 + ( value2 - value1 ) * amount1 + ( value3 - value1 ) * amount2;
    };


    /**
     * Performs a Catmull-Rom interpolation.
     * @param {number} value1 - The first control point.
     * @param {number} value2 - The second control point.
     * @param {number} value3 - The third control point.
     * @param {number} value4 - The fourth control point.
     * @param {number} amount - The weight.
     * @returns {number} The interpolated value.
     */
    MathHelper.catmullRom = function ( value1, value2, value3, value4, amount ) {
        var amountSquared = amount * amount;
        var amountCubed   = amountSquared * amount;
        return ( 0.5 * ( 2.0 * value2 + ( value3 - value1 ) * amount + ( 2.0 * value1 - 5.0 * value2 + 4.0 * value3 - value4 ) * amountSquared + ( 3.0 * value2 - value1 - 3.0 * value3 + value4 ) * amountCubed ) );
    };


    /**
     * Clamps a value between a minimum and maximum value.
     * @param {number} value - The value to clamp.
     * @param {number} min - The minimum value.
     * @param {number} max - The maximum value.
     * @returns {number} The clamped value.
     */
    MathHelper.clamp = function ( value, min, max ) {
        return Math.max( min, Math.min( max, value ) );
    };


    /**
     * Calculates the distance between two values.
     * @param {number} value1 - The first value.
     * @param {number} value2 - The second value.
     * @returns {number} The distance.
     */
    MathHelper.distance = function ( value1, value2 ) {
        return Math.abs( value1 - value2 );
    };


    /**
     * Performs a Hermite spline interpolation.
     * @param {number} value1 - The first position.
     * @param {number} tangent1 - The tangent at the first position.
     * @param {number} value2 - The second position.
     * @param {number} tangent2 - The tangent at the second position.
     * @param {number} amount - The weight.
     * @returns {number} The interpolated value.
     */
    MathHelper.hermite = function ( value1, tangent1, value2, tangent2, amount ) {
        switch ( amount ) {
            case 0:
                return value1;
            case 1:
                return value2;
        }

        var v1       = value1,
            v2       = value2,
            t1       = tangent1,
            t2       = tangent2,
            s        = amount;
        var sCubed   = s * s * s;
        var sSquared = s * s;
        return ( 2 * v1 - 2 * v2 + t2 + t1 ) * sCubed + ( 3 * v2 - 3 * v1 - 2 * t1 - t2 ) * sSquared + t1 * s + v1;
    };


    /**
     * Performs a linear interpolation (Lerp) between two values.
     * @param {number} value1 - The first value.
     * @param {number} value2 - The second value.
     * @param {number} amount - The weight.
     * @returns {number} The interpolated value.
     */
    MathHelper.lerp = function ( value1, value2, amount ) {
        return value1 + ( value2 - value1 ) * amount;
    };


    /**
     * Returns the larger of two numbers.
     * @type {function(number, number): number}
     */
    MathHelper.max = Math.max;


    /**
     * Returns the smaller of two numbers.
     * @type {function(number, number): number}
     */
    MathHelper.min = Math.min;


    /**
     * Performs a smooth step interpolation.
     * @param {number} value1 - The first value.
     * @param {number} value2 - The second value.
     * @param {number} amount - The weight.
     * @returns {number} The interpolated value.
     */
    MathHelper.smoothStep = function ( value1, value2, amount ) {
        return MathHelper.hermite( value1, 0, value2, 0, MathHelper.clamp( amount, 0, 1 ) );
    };


    /**
     * Converts radians to degrees.
     * @param {number} radians - The angle in radians.
     * @returns {number} The angle in degrees.
     */
    MathHelper.toDegrees = function ( radians ) {
        return radians * 57.295779513082320876798154814105;
    };


    /**
     * Converts degrees to radians.
     * @param {number} degrees - The angle in degrees.
     * @returns {number} The angle in radians.
     */
    MathHelper.toRadians = function ( degrees ) {
        return degrees * 0.017453292519943295769236907684886;
    };


    /**
     * Calculates the remainder of a division, similar to the IEEE 754 standard.
     * @param {number} x - The dividend.
     * @param {number} y - The divisor.
     * @returns {number} The remainder.
     */
    MathHelper.iEEERemainder = function ( x, y ) {
        return x - ( y * Math.round( x / y ) );
    };


    /**
     * Wraps an angle to be within the range of -Pi to Pi.
     * @param {number} angle - The angle to wrap.
     * @returns {number} The wrapped angle.
     */
    MathHelper.wrapAngle = function ( angle ) {
        angle = MathHelper.iEEERemainder( angle, 6.2831854820251465 ); // TwoPi
        if ( angle <= -3.14159274 ) { // -Pi
            angle += 6.28318548; // TwoPi
        }
        else {
            if ( angle > 3.14159274 ) { // Pi
                angle -= 6.28318548; // TwoPi
            }
        }
        return angle;
    };


    /**
     * Checks if a value is a power of two.
     * @param {number} value - The value to check.
     * @returns {boolean} True if the value is a power of two, false otherwise.
     */
    MathHelper.isPowerOfTwo = function ( value ) {
        return ( value > 0 ) && ( ( value & ( value - 1 ) ) === 0 );
    };

    // End Region: MathHelper
    // -----------------------------------------------------------------------------


    // Region: Point - Represents a 2D integer point.
    // -----------------------------------------------------------------------------

    /**
     * Constructor for a Point object.
     * @param {number} x - The X coordinate.
     * @param {number} y - The Y coordinate.
     */
    Framework.Point = function ( x, y ) {
        this.x = x;
        this.y = y;
    };
    var Point = Framework.Point; // Alias for convenience.


    // Static property for a zero point.
    Point.zero = new Point( 0, 0 );


    /**
     * Adds another Point to this Point.
     * @param {Point} other - The other Point to add.
     * @returns {Point} A new Point representing the sum.
     */
    Point.prototype.add = function ( other ) {
        return new Point( this.x + other.x, this.y + other.y );
    };


    /**
     * Subtracts another Point from this Point.
     * @param {Point} other - The other Point to subtract.
     * @returns {Point} A new Point representing the difference.
     */
    Point.prototype.subtract = function ( other ) {
        return new Point( this.x - other.x, this.y - other.y );
    };


    /**
     * Multiplies this Point by another Point (component-wise).
     * @param {Point} other - The other Point to multiply by.
     * @returns {Point} A new Point representing the product.
     */
    Point.prototype.mutliply = function ( other ) {
        return new Point( this.x * other.x, this.y * other.y );
    };


    /**
     * Divides this Point by another Point (component-wise).
     * @param {Point} other - The other Point to divide by.
     * @returns {Point} A new Point representing the quotient.
     */
    Point.prototype.divide = function ( other ) {
        return new Point( this.x / other.x, this.y / other.y );
    };


    /**
     * Checks if this Point is equal to another object.
     * @param {object} obj - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    Point.prototype.equals = function ( obj ) {
        return ( obj instanceof Point ) && ( this.x === obj.x ) && ( this.y === obj.y );
    };


    /**
     * Returns a string representation of this Point.
     * @returns {string} The string representation.
     */
    Point.prototype.toString = function () {
        return "{x:" + this.x.toString() + " y:" + this.y.toString() + "}";
    };

    // End Region: Point
    // -----------------------------------------------------------------------------


    // Region: Rectangle - Represents a 2D rectangle.
    // -----------------------------------------------------------------------------

    /**
     * Constructor for a Rectangle object.
     * @param {number} x - The X coordinate of the top-left corner.
     * @param {number} y - The Y coordinate of the top-left corner.
     * @param {number} width - The width of the rectangle.
     * @param {number} height - The height of the rectangle.
     */
    Framework.Rectangle = function ( x, y, width, height ) {
        this.x      = x;
        this.y      = y;
        this.width  = width;
        this.height = height;
    };
    var Rectangle = Framework.Rectangle; // Alias for convenience.


    // Static property for an empty rectangle.
    Rectangle.empty = new Rectangle( 0, 0, 0, 0 );


    /**
     * Checks if this Rectangle is equal to another object.
     * @param {object} obj - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    Rectangle.prototype.equals = function ( obj ) {
        return ( obj instanceof Rectangle ) && ( this.x === obj.x ) && ( this.y === obj.y ) && ( this.width === obj.width ) && ( this.height === obj.height );
    };


    /**
     * Checks if the Rectangle contains a specified point or another rectangle.
     * @param {Point|Rectangle|number} arg1 - A Point, Rectangle, or X coordinate.
     * @param {number} [arg2] - The Y coordinate if arg1 is X.
     * @returns {boolean} True if the rectangle contains the specified entity, false otherwise.
     */
    Rectangle.prototype.contains = function () {
        if ( arguments.length === 1 ) {
            var value = arguments[ 0 ];
            if ( value instanceof Point ) {
                return ( this.x <= value.x ) && ( value.x < this.x + this.width ) && ( this.y <= value.y ) && ( value.y < this.y + this.height );
            }
            else if ( value instanceof Rectangle ) {
                return ( this.x <= value.x ) && ( value.x + value.width <= this.x + this.width ) && ( this.y <= value.y ) && ( value.y + value.height <= this.y + this.height );
            }
            return false;
        }
        var x = arguments[ 0 ];
        var y = arguments[ 1 ];
        return ( this.x <= x ) && ( x < this.x + this.width ) && ( this.y <= y ) && ( y < this.y + this.height );
    };


    /**
     * Adjusts the location of this Rectangle by the specified amounts.
     * @param {Point|number} arg1 - A Point representing the new offset, or the X offset.
     * @param {number} [arg2] - The Y offset if arg1 is X.
     */
    Rectangle.prototype.offset = function () {
        if ( arguments.length === 1 ) {
            var offset = arguments[ 0 ];
            this.x     = offset.x;
            this.y     = offset.y;
        }
        else {
            var offsetx = arguments[ 0 ];
            var offsety = arguments[ 1 ];
            this.x      = offsetx;
            this.y      = offsety;
        }
    };


    /**
     * Gets the center point of the Rectangle.
     * @returns {Point} A new Point representing the center.
     */
    Rectangle.prototype.center = function () {
        return new Point( this.x + ( this.width / 2 ), this.y + ( this.height / 2 ) );
    };


    /**
     * Inflates the Rectangle by the specified horizontal and vertical values.
     * @param {number} horizontalValue - The amount to inflate horizontally.
     * @param {number} verticalValue - The amount to inflate vertically.
     */
    Rectangle.prototype.inflate = function ( horizontalValue, verticalValue ) {
        this.x      -= horizontalValue;
        this.y      -= verticalValue;
        this.width  += horizontalValue * 2;
        this.height += verticalValue * 2;
    };


    /**
     * Checks if the Rectangle is empty (width and height are zero, and top-left is at 0,0).
     * @returns {boolean} True if the rectangle is empty, false otherwise.
     */
    Rectangle.prototype.isEmpty = function () {
        return ( this.width === 0 ) && ( this.height === 0 ) && ( this.x === 0 ) && ( this.y === 0 );
    };


    /**
     * Returns a string representation of this Rectangle.
     * @returns {string} The string representation.
     */
    Rectangle.prototype.toString = function () {
        return "{x:" + this.x + " y:" + this.y + " width:" + this.width + " height:" + this.height + "}";
    };


    /**
     * Checks if this Rectangle intersects with another Rectangle.
     * @param {Rectangle} value - The other Rectangle to check for intersection.
     * @returns {boolean} True if the rectangles intersect, false otherwise.
     */
    Rectangle.prototype.intersects = function ( value ) {
        return value.left() < this.right() && this.left() < value.right() && value.top() < this.bottom() && this.top() < value.bottom();
    };


    /**
     * Creates a new Rectangle that represents the union of two rectangles.
     * @param {Rectangle} value1 - The first Rectangle.
     * @param {Rectangle} value2 - The second Rectangle.
     * @returns {Rectangle} The union of the two rectangles.
     */
    Rectangle.union = function ( value1, value2 ) {
        var x = Math.min( value1.x, value2.x );
        var y = Math.min( value1.y, value2.y );
        return new Rectangle( x, y, Math.max( value1.right(), value2.right() ) - x, Math.max( value1.bottom(), value2.bottom() ) - y );
    };


    /**
     * Gets the X coordinate of the left edge of the Rectangle.
     * @returns {number} The left edge X coordinate.
     */
    Rectangle.prototype.left = function () {
        return this.x;
    };


    /**
     * Gets the X coordinate of the right edge of the Rectangle.
     * @returns {number} The right edge X coordinate.
     */
    Rectangle.prototype.right = function () {
        return this.x + this.width;
    };


    /**
     * Gets the Y coordinate of the top edge of the Rectangle.
     * @returns {number} The top edge Y coordinate.
     */
    Rectangle.prototype.top = function () {
        return this.y;
    };


    /**
     * Gets the Y coordinate of the bottom edge of the Rectangle.
     * @returns {number} The bottom edge Y coordinate.
     */
    Rectangle.prototype.bottom = function () {
        return this.y + this.height;
    };

    // End Region: Rectangle
    // -----------------------------------------------------------------------------


    // Region: Vector2 - Represents a 2D vector.
    // -----------------------------------------------------------------------------

    /**
     * Constructor for a Vector2 object.
     * @param {number} x - The X component.
     * @param {number} [y] - The Y component (defaults to X if not provided).
     */
    Framework.Vector2 = function ( x, y ) {
        if ( y === undefined ) {
            y = x;
        }

        this.x = x;
        this.y = y;
    };
    var Vector2 = Framework.Vector2; // Alias for convenience.


    // Static properties for common vectors.
    Vector2.zero       = new Vector2( 0 );
    Vector2.unitVector = new Vector2( 1 );
    Vector2.unitXVector = new Vector2( 1, 0 );
    Vector2.unitYVector = new Vector2( 0, 1 );


    /**
     * Returns a new Vector2 with negated components.
     * @returns {Vector2} A new Vector2 representing the negation.
     */
    Vector2.prototype.negate = function () {
        return new Vector2( this.x, this.y );
    };


    /**
     * Checks if this Vector2 is equal to another object.
     * @param {object} obj - The object to compare with.
     * @returns {boolean} True if the objects are equal, false otherwise.
     */
    Vector2.prototype.equals = function ( obj ) {
        return ( obj instanceof Vector2 ) && ( obj.x === this.x ) && ( obj.y === this.y );
    };


    /**
     * Adds another Vector2 to this Vector2.
     * @param {Vector2} other - The other Vector2 to add.
     * @returns {Vector2} A new Vector2 representing the sum.
     */
    Vector2.prototype.add = function ( other ) {
        return new Vector2( this.x + other.x, this.y + other.y );
    };


    /**
     * Multiplies this Vector2 by another Vector2 (component-wise) or by a scalar.
     * @param {Vector2|number} other - The other Vector2 or scalar to multiply by.
     * @returns {Vector2} A new Vector2 representing the product.
     */
    Vector2.prototype.multiply = function ( other ) {
        if ( typeof other === "number" ) {
            return new Vector2( this.x * other, this.y * other );
        }
        return new Vector2( this.x * other.x, this.y * other.y );
    };


    /**
     * Divides this Vector2 by another Vector2 (component-wise) or by a scalar.
     * @param {Vector2|number} other - The other Vector2 or scalar to divide by.
     * @returns {Vector2} A new Vector2 representing the quotient.
     */
    Vector2.prototype.divide = function ( other ) {
        if ( typeof other === "number" ) {
            return new Vector2( this.x / other, this.y / other );
        }
        return new Vector2( this.x / other.x, this.y / other.y );
    };


    /**
     * Calculates the distance between two Vector2 objects.
     * @param {Vector2} value1 - The first Vector2.
     * @param {Vector2} value2 - The second Vector2.
     * @returns {number} The distance.
     */
    Vector2.distance = function ( value1, value2 ) {
        var v1 = value1.x - value2.x,
            v2 = value1.y - value2.y;
        return Math.sqrt( ( v1 * v1 ) + ( v2 * v2 ) );
    };


    /**
     * Calculates the squared distance between two Vector2 objects.
     * This avoids a square root operation, which can be faster.
     * @param {Vector2} value1 - The first Vector2.
     * @param {Vector2} value2 - The second Vector2.
     * @returns {number} The squared distance.
     */
    Vector2.distanceSquared = function ( value1, value2 ) {
        var v1 = value1.x - value2.x,
            v2 = value1.y - value2.y;
        return ( v1 * v1 ) + ( v2 * v2 );
    };


    /**
     * Calculates the reflection of a vector off a surface with a given normal.
     * @param {Vector2} vector - The incident vector.
     * @param {Vector2} normal - The normal of the surface.
     * @returns {Vector2} The reflected vector.
     */
    Vector2.reflect = function ( vector, normal ) {
        var result = new Vector2( 0, 0 );
        var val    = 2.0 * ( ( vector.x * normal.x ) + ( vector.y * normal.y ) );
        result.x   = vector.x - ( normal.x * val );
        result.y   = vector.y - ( normal.y * val );
        return result;
    };


    /**
     * Calculates the length (magnitude) of this Vector2.
     * @returns {number} The length of the vector.
     */
    Vector2.prototype.length = function () {
        return Math.sqrt( ( this.x * this.x ) + ( this.y * this.y ) );
    };


    /**
     * Calculates the squared length of this Vector2.
     * @returns {number} The squared length of the vector.
     */
    Vector2.prototype.lengthSquared = function () {
        return ( this.x * this.x ) + ( this.y * this.y );
    };


    /**
     * Returns a vector that contains the maximum value of each component from two vectors.
     * @param {Vector2} value1 - The first vector.
     * @param {Vector2} value2 - The second vector.
     * @returns {Vector2} A new Vector2 with the maximum components.
     */
    Vector2.max = function ( value1, value2 ) {
        return new Vector2( value1.x > value2.x ? value1.x : value2.x, value1.y > value2.y ? value1.y : value2.y );
    };


    /**
     * Returns a vector that contains the minimum value of each component from two vectors.
     * @param {Vector2} value1 - The first vector.
     * @param {Vector2} value2 - The second vector.
     * @returns {Vector2} A new Vector2 with the minimum components.
     */
    Vector2.min = function ( value1, value2 ) {
        return new Vector2( value1.x < value2.x ? value1.x : value2.x, value1.y < value2.y ? value1.y : value2.y );
    };


    /**
     * Normalizes this Vector2 to a unit vector (length of 1).
     */
    Vector2.prototype.normalize = function () {
        var val = 1.0 / Math.sqrt( ( this.x * this.x ) + ( this.y * this.y ) );
        this.x *= val;
        this.y *= val;
    };


    /**
     * Performs a barycentric interpolation on Vector2 components.
     * @param {Vector2} value1 - The first vector.
     * @param {Vector2} value2 - The second vector.
     * @param {Vector2} value3 - The third vector.
     * @param {number} amount1 - The first barycentric weight.
     * @param {number} amount2 - The second barycentric weight.
     * @returns {Vector2} The interpolated vector.
     */
    Vector2.barycentric = function ( value1, value2, value3, amount1, amount2 ) {
        return new Vector2( MathHelper.barycentric( value1.x, value2.x, value3.x, amount1, amount2 ), MathHelper.barycentric( value1.y, value2.y, value3.y, amount1, amount2 ) );
    };


    /**
     * Performs a Catmull-Rom interpolation on Vector2 components.
     * @param {Vector2} value1 - The first control point vector.
     * @param {Vector2} value2 - The second control point vector.
     * @param {Vector2} value3 - The third control point vector.
     * @param {Vector2} value4 - The fourth control point vector.
     * @param {number} amount - The weight.
     * @returns {Vector2} The interpolated vector.
     */
    Vector2.catmullRom = function ( value1, value2, value3, value4, amount ) {
        return new Vector2( MathHelper.catmullRom( value1.x, value2.x, value3.x, value4.x, amount ), MathHelper.catmullRom( value1.y, value2.y, value3.y, value4.y, amount ) );
    };


    /**
     * Clamps a Vector2 within a specified range defined by minimum and maximum vectors.
     * @param {Vector2} value1 - The vector to clamp.
     * @param {Vector2} min - The minimum vector.
     * @param {Vector2} max - The maximum vector.
     * @returns {Vector2} The clamped vector.
     */
    Vector2.clamp = function ( value1, min, max ) {
        return new Vector2( MathHelper.clamp( value1.x, min.x, max.x ), MathHelper.clamp( value1.y, min.y, max.y ) );
    };


    /**
     * Performs a linear interpolation (Lerp) between two Vector2 objects.
     * @param {Vector2} value1 - The first vector.
     * @param {Vector2} value2 - The second vector.
     * @param {number} amount - The weight.
     * @returns {Vector2} The interpolated vector.
     */
    Vector2.lerp = function ( value1, value2, amount ) {
        return new Vector2( MathHelper.lerp( value1.x, value2.x, amount ), MathHelper.lerp( value1.y, value2.y, amount ) );
    };


    /**
     * Performs a smooth step interpolation on Vector2 components.
     * @param {Vector2} value1 - The first vector.
     * @param {Vector2} value2 - The second vector.
     * @param {number} amount - The weight.
     * @returns {Vector2} The interpolated vector.
     */
    Vector2.smoothStep = function ( value1, value2, amount ) {
        return new Vector2( MathHelper.smoothStep( value1.x, value2.x, amount ), MathHelper.smoothStep( value1.y, value2.y, amount ) );
    };


    /**
     * Transforms a Vector2 by a Matrix.
     * Overloaded to handle single vector or arrays of vectors.
     * @returns {Vector2} The transformed vector.
     */
    Vector2.transform = function () {
        switch ( arguments.length ) {
            case 2:
                // transform(vector, matrix)
                return new Vector2( ( arguments[ 0 ].x * arguments[ 1 ].m11 ) + ( arguments[ 0 ].y * arguments[ 1 ].m21 ) + arguments[ 1 ].m41, ( arguments[ 0 ].x * arguments[ 1 ].m12 ) + ( arguments[ 0 ].y * arguments[ 1 ].m22 ) + arguments[ 1 ].m42 );
            case 3:
                // transform(sourceArray, matrix, destinationArray)
                return Vector2_transform6( arguments[ 0 ], 0, arguments[ 1 ], arguments[ 2 ], 0, arguments[ 0 ].length );
            case 6:
                // transform(sourceArray, sourceIndex, matrix, destinationArray, destinationIndex, length)
                return Vector2_transform6( arguments[ 0 ], arguments[ 1 ], arguments[ 2 ], arguments[ 3 ], arguments[ 4 ], arguments[ 5 ] );
        }
    };


    /**
     * Internal helper function for transforming arrays of Vector2 objects.
     * @param {Array<Vector2>} sourceArray - The array of source vectors.
     * @param {number} sourceIndex - The starting index in the source array.
     * @param {Matrix} matrix - The transformation matrix.
     * @param {Array<Vector2>} destinationArray - The array to store transformed vectors.
     * @param {number} destinationIndex - The starting index in the destination array.
     * @param {number} length - The number of vectors to transform.
     */
    function Vector2_transform6 ( sourceArray, sourceIndex, matrix, destinationArray, destinationIndex, length ) {
        for ( var x = 0; x < length; x++ ) {
            var position  = sourceArray[ sourceIndex + x ];
            var destination = destinationArray[ destinationIndex + x ];
            destination.x = ( position.x * matrix.m11 ) + ( position.y * matrix.m21 ) + matrix.m41;
            destination.y = ( position.x * matrix.m12 ) + ( position.y * matrix.m22 ) + matrix.m42;
            destinationArray[ destinationIndex + x ] = destination;
        }
    }


    /**
     * Transforms a Vector2 representing a normal by a Matrix.
     * @param {Vector2} normal - The normal vector to transform.
     * @param {Matrix} matrix - The transformation matrix.
     * @returns {Vector2} The transformed normal vector.
     */
    Vector2.transformNormal = function ( normal, matrix ) {
        return new Vector2( ( normal.x * matrix.m11 ) + ( normal.y * matrix.m21 ), ( normal.x * matrix.m12 ) + ( normal.y * matrix.m22 ) );
    };

    // End Region: Vector2
    // -----------------------------------------------------------------------------


    // Region: Matrix - Represents a 4x4 matrix.
    // -----------------------------------------------------------------------------

    /**
     * Constructor for a Matrix object, representing a 4x4 transformation matrix.
     * @param {number} m11 - Component (1,1).
     * @param {number} m12 - Component (1,2).
     * @param {number} m13 - Component (1,3).
     * @param {number} m14 - Component (1,4).
     * @param {number} m21 - Component (2,1).
     * @param {number} m22 - Component (2,2).
     * @param {number} m23 - Component (2,3).
     * @param {number} m24 - Component (2,4).
     * @param {number} m31 - Component (3,1).
     * @param {number} m32 - Component (3,2).
     * @param {number} m33 - Component (3,3).
     * @param {number} m34 - Component (3,4).
     * @param {number} m41 - Component (4,1).
     * @param {number} m42 - Component (4,2).
     * @param {number} m43 - Component (4,3).
     * @param {number} m44 - Component (4,4).
     */
    Framework.Matrix = function ( m11, m12, m13, m14, m21, m22, m23, m24, m31, m32, m33, m34, m41, m42, m43, m44 ) {
        this.m11 = m11;
        this.m12 = m12;
        this.m13 = m13;
        this.m14 = m14;

        this.m21 = m21;
        this.m22 = m22;
        this.m23 = m23;
        this.m24 = m24;

        this.m31 = m31;
        this.m32 = m32;
        this.m33 = m33;
        this.m34 = m34;

        this.m41 = m41;
        this.m42 = m42;
        this.m43 = m43;
        this.m44 = m44;
    };
    var Matrix = Framework.Matrix; // Alias for convenience.


    // Static property for the identity matrix.
    Matrix.identity = new Matrix( 1, 0, 0, 0,
                                  0, 1, 0, 0,
                                  0, 0, 1, 0,
                                  0, 0, 0, 1 );


    /**
     * Adds two matrices.
     * @param {Matrix} matrix1 - The first matrix.
     * @param {Matrix} matrix2 - The second matrix.
     * @returns {Matrix} A new matrix representing the sum.
     */
    Matrix.add = function ( matrix1, matrix2 ) {
        var newMatrix = new Matrix(
            matrix1.m11 + matrix2.m11,
            matrix1.m12 + matrix2.m12
        );
    };

})();