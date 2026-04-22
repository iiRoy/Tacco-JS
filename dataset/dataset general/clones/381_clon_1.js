var __extends = this.__extends || function ( d, b ) {
    // This is a helper function for TypeScript inheritance.
    // It sets up the prototype chain correctly.
    function __() {
        this.constructor = d;
    }

    __.prototype = b.prototype; // Inherit prototype methods
    d.prototype = new __();    // Set derived constructor's prototype
};


define(
    ["require", "exports"], // Dependencies for the module
    function( require, exports ) {
        // Module entry point function
        // Define the version of the module
        exports.version = '0.2.0';

        /*
         *  Namespace: rngs
         *  Contains various random number generator implementations.
         */
        ( function ( rngs ) {

            // Default random number generator instance
            var defaultRandom = new Random();

            /**
             *  RNG (Random Number Generator) Base Class
             *  Provides an interface for random number generation.
             */
            var RNG = ( function () {
                // Constructor for the RNG class
                function RNG( seed ) {
                    // Initialize the internal random generator.
                    // If a seed is provided, create a new Random instance; otherwise, use the default.
                    this._rnd = seed !== undefined ? new Random( seed ) : defaultRandom;
                }

                // Prototype method: next()
                // Should be overridden by derived classes.
                RNG.prototype.next = function () {
                    // This method must be implemented by subclasses.
                    throw new Error( 'Not Implemented' );
                };

                return RNG; // Return the RNG class constructor
            } )();

            rngs.RNG = RNG; // Export RNG class within the rngs namespace


            /**
             *  Preset RNG Class
             *  Generates numbers from a predefined array in a cyclic manner.
             *  Extends the base RNG class.
             */
            var Preset = ( function ( _super ) {

                __extends( Preset, _super ); // Establish inheritance

                // Constructor for the Preset class
                function Preset( values ) {
                    // Call the super constructor (RNG) without a seed.
                    _super.call( this, undefined );

                    // Initialize internal state
                    this._index = 0;       // Current index in the values array
                    this._values = values; // Array of preset values
                }

                // Prototype method: next()
                // Returns the next value from the preset array.
                Preset.prototype.next = function () {
                    // Get the value at the current index, using modulo for cycling.
                    var next = this._values[ this._index % this._values.length ];
                    this._index++; // Increment the index for the next call.
                    return next;   // Return the obtained value.
                };

                return Preset; // Return the Preset class constructor
            } )( RNG ); // Inherit from RNG

            rngs.Preset = Preset; // Export Preset class


            /**
             *  Uniform RNG Class
             *  Generates uniformly distributed random numbers.
             *  Extends the base RNG class.
             */
            var Uniform = ( function ( _super ) {

                __extends( Uniform, _super ); // Establish inheritance

                // Constructor for the Uniform class
                function Uniform( seed ) {
                    // Handle optional seed parameter
                    if ( typeof seed === "undefined" ) {
                        seed = undefined;
                    }
                    // Call the super constructor (RNG) with the provided seed.
                    _super.call( this, seed );
                }

                // Prototype method: next()
                // Returns a uniform random number.
                Uniform.prototype.next = function () {
                    // Delegates to the internal random number generator's random() method.
                    return this._rnd.random();
                };

                return Uniform; // Return the Uniform class constructor
            } )( RNG ); // Inherit from RNG

            rngs.Uniform = Uniform; // Export Uniform class


            /**
             *  Normal RNG Class
             *  Generates normally distributed random numbers (Gaussian).
             *  Extends the base RNG class.
             */
            var Normal = ( function ( _super ) {

                __extends( Normal, _super ); // Establish inheritance

                // Constructor for the Normal class
                function Normal( mu, sigma ) {
                    // Call the super constructor (RNG) without a seed.
                    _super.call( this, undefined );

                    // Initialize mean (mu) and standard deviation (sigma)
                    this._mu    = mu;
                    this._sigma = sigma;
                }

                // Prototype method: next()
                // Returns a normally distributed random number.
                Normal.prototype.next = function () {
                    // Delegates to the internal random number generator's normal() method.
                    return this._rnd.normal( this._mu, this._sigma );
                };

                return Normal; // Return the Normal class constructor
            } )( RNG ); // Inherit from RNG

            rngs.Normal = Normal; // Export Normal class


            /**
             *  Pareto RNG Class
             *  Generates Pareto distributed random numbers.
             *  Extends the base RNG class.
             */
            var Pareto = ( function ( _super ) {

                __extends( Pareto, _super ); // Establish inheritance

                // Constructor for the Pareto class
                function Pareto( alpha ) {
                    // Call the super constructor (RNG) without a seed.
                    _super.call( this, undefined );

                    // Initialize the alpha parameter for Pareto distribution.
                    this._alpha = alpha;
                }

                // Prototype method: next()
                // Returns a Pareto distributed random number.
                Pareto.prototype.next = function () {
                    // Delegates to the internal random number generator's pareto() method.
                    return this._rnd.pareto( this._alpha );
                };

                return Pareto; // Return the Pareto class constructor
            } )( RNG ); // Inherit from RNG

            rngs.Pareto = Pareto; // Export Pareto class

        } )( exports.rngs || ( exports.rngs = {} ) ); // IIFE for rngs namespace

        // Create a local reference to the rngs namespace
        var rngs = exports.rngs;


        /*
         *  Namespace: seqs
         *  Contains various sequence generator implementations.
         */
        ( function ( seqs ) {

            // Default uniform RNG for sequences that need one.
            var defaultRNG = new rngs.Uniform();

            /**
             *  Sequence Base Class
             *  Provides an interface for generating sequences of numbers.
             */
            var Sequence = ( function () {

                // Constructor for the Sequence class
                function Sequence() {
                    // Initialize the internal mapping function.
                    // By default, it's an identity function.
                    this._map = function ( n ) {
                        return n;
                    };
                }

                // Internal prototype method: _next()
                // Must be implemented by derived classes to provide the raw next value.
                Sequence.prototype._next = function () {
                    throw new Error( 'Not Implemented' );
                };

                // Public prototype method: next()
                // Returns the next value in the sequence, applying the mapping function.
                Sequence.prototype.next = function () {
                    return this._map( this._next() );
                };

                // Public prototype method: array()
                // Generates an array of 'len' values from the sequence,
                // and optionally normalizes them.
                Sequence.prototype.array = function ( len, norm ) {
                    // Handle optional normalizer parameter.
                    if ( typeof norm === "undefined" ) {
                        norm = new norms.Identity();
                    }

                    var data = new Array( len ); // Create an array to hold the data.

                    // Populate the array with values from the sequence.
                    for ( var i = 0; i < len; i++ ) {
                        data[ i ] = this.next();
                    }

                    // Normalize and return the data.
                    return norm.normalize( data );
                };

                // Public prototype method: setMap()
                // Sets the mapping function for the sequence.
                Sequence.prototype.setMap = function ( mapFunction ) {
                    this._map = mapFunction;
                    return this; // Allow chaining
                };

                // Public prototype method: getMap()
                // Returns the current mapping function.
                Sequence.prototype.getMap = function () {
                    return this._map;
                };

                return Sequence; // Return the Sequence class constructor
            } )();

            seqs.Sequence = Sequence; // Export Sequence class


            /**
             *  Constant Sequence Class
             *  Generates a sequence where every value is the same constant.
             *  Extends the base Sequence class.
             */
            var Constant = ( function ( _super ) {

                __extends( Constant, _super ); // Establish inheritance

                // Constructor for the Constant class
                function Constant( value ) {
                    // Handle optional value parameter.
                    if ( typeof value === "undefined" ) {
                        value = 0;
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Store the constant value.
                    this._constant = value;
                }

                // Internal prototype method: _next()
                // Returns the constant value.
                Constant.prototype._next = function () {
                    return this._constant;
                };

                // Public prototype method: setConstant()
                // Sets a new constant value.
                Constant.prototype.setConstant = function ( constant ) {
                    this._constant = constant;
                    return this; // Allow chaining
                };

                // Public prototype method: getConstant()
                // Returns the current constant value.
                Constant.prototype.getConstant = function () {
                    return this._constant;
                };

                return Constant; // Return the Constant class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Constant = Constant; // Export Constant class


            /**
             *  Cycle Sequence Class
             *  Generates a sequence by cycling through a given pattern of values.
             *  Extends the base Sequence class.
             */
            var Cycle = ( function ( _super ) {

                __extends( Cycle, _super ); // Establish inheritance

                // Constructor for the Cycle class
                function Cycle( pattern ) {
                    // Handle optional pattern parameter.
                    if ( typeof pattern === "undefined" ) {
                        pattern = [
                            0,
                            1
                        ];
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Initialize internal state.
                    this._index   = 0;       // Current index in the pattern.
                    this._pattern = pattern; // The array of values to cycle through.
                }

                // Internal prototype method: _next()
                // Returns the next value from the pattern, cycling if necessary.
                Cycle.prototype._next = function () {
                    var index  = this._index % this._pattern.length; // Calculate current index, wrapping around.
                    var result = this._pattern[ index ];              // Get the value.
                    this._index++;                                    // Increment index for next call.
                    return result;                                    // Return the result.
                };

                // Public prototype method: setPattern()
                // Sets a new pattern for the cycle.
                Cycle.prototype.setPattern = function ( pattern ) {
                    this._pattern = pattern;
                    return this; // Allow chaining
                };

                // Public prototype method: getPattern()
                // Returns the current pattern.
                Cycle.prototype.getPattern = function () {
                    return this._pattern;
                };

                return Cycle; // Return the Cycle class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Cycle = Cycle; // Export Cycle class


            /**
             *  Arithmetic Sequence Class
             *  Generates an arithmetic progression (start, start+step, start+2*step, ...).
             *  Extends the base Sequence class.
             */
            var Arithmetic = ( function ( _super ) {

                __extends( Arithmetic, _super ); // Establish inheritance

                // Constructor for the Arithmetic class
                function Arithmetic( start, step ) {
                    // Handle optional parameters.
                    if ( typeof start === "undefined" ) {
                        start = 0;
                    }
                    if ( typeof step === "undefined" ) {
                        step = 1;
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Initialize internal state.
                    this._start = start; // Starting value.
                    this._step  = step;  // Increment step.
                    this._cur   = start; // Current value in the sequence.
                }

                // Internal prototype method: _next()
                // Returns the current value and increments it by the step.
                Arithmetic.prototype._next = function () {
                    var result = this._cur; // Store current value.
                    this._cur += this._step; // Increment for the next call.
                    return result;           // Return the stored value.
                };

                // Public prototype method: setStart()
                // Sets a new starting value and resets the current value.
                Arithmetic.prototype.setStart = function ( start ) {
                    this._start = start;
                    this._cur   = start; // Reset current value to new start.
                    return this;         // Allow chaining
                };

                // Public prototype method: getStart()
                // Returns the starting value.
                Arithmetic.prototype.getStart = function () {
                    return this._start;
                };

                // Public prototype method: setStep()
                // Sets a new step value.
                Arithmetic.prototype.setStep = function ( step ) {
                    this._step = step;
                    return this; // Allow chaining
                };

                // Public prototype method: getStep()
                // Returns the step value.
                Arithmetic.prototype.getStep = function () {
                    return this._step;
                };

                return Arithmetic; // Return the Arithmetic class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Arithmetic = Arithmetic; // Export Arithmetic class


            /**
             *  Geometric Sequence Class
             *  Generates a geometric progression (start, start*ratio, start*ratio^2, ...).
             *  Extends the base Sequence class.
             */
            var Geometric = ( function ( _super ) {

                __extends( Geometric, _super ); // Establish inheritance

                // Constructor for the Geometric class
                function Geometric( start, ratio ) {
                    // Handle optional parameters.
                    if ( typeof start === "undefined" ) {
                        start = 1;
                    }
                    if ( typeof ratio === "undefined" ) {
                        ratio = 2;
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Initialize internal state.
                    this._start = start; // Starting value.
                    this._ratio = ratio; // Multiplication ratio.
                    this._cur   = start; // Current value in the sequence.
                }

                // Internal prototype method: _next()
                // Returns the current value and multiplies it by the ratio.
                Geometric.prototype._next = function () {
                    var result = this._cur; // Store current value.
                    this._cur *= this._ratio; // Multiply for the next call.
                    return result;            // Return the stored value.
                };

                // Public prototype method: setStart()
                // Sets a new starting value and resets the current value.
                Geometric.prototype.setStart = function ( start ) {
                    this._start = start;
                    this._cur   = start; // Reset current value to new start.
                    return this;         // Allow chaining
                };

                // Public prototype method: getStart()
                // Returns the starting value.
                Geometric.prototype.getStart = function () {
                    return this._start;
                };

                // Public prototype method: setRatio()
                // Sets a new ratio value.
                Geometric.prototype.setRatio = function ( ratio ) {
                    this._ratio = ratio;
                    return this; // Allow chaining
                };

                // Public prototype method: getRatio()
                // Returns the ratio value.
                Geometric.prototype.getRatio = function () {
                    return this._ratio;
                };

                return Geometric; // Return the Geometric class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Geometric = Geometric; // Export Geometric class


            /**
             *  Random Sequence Class
             *  Generates random numbers within a specified range using an RNG.
             *  Extends the base Sequence class.
             */
            var Random = ( function ( _super ) {

                __extends( Random, _super ); // Establish inheritance

                // Constructor for the Random class
                function Random( rng, min, max ) {
                    // Handle optional parameters.
                    if ( typeof rng === "undefined" ) {
                        rng = defaultRNG;
                    }
                    if ( typeof min === "undefined" ) {
                        min = -Infinity;
                    }
                    if ( typeof max === "undefined" ) {
                        max = +Infinity;
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Initialize internal state.
                    this._rng = rng;   // The random number generator to use.
                    this._min = min;   // Minimum value for the output.
                    this._max = max;   // Maximum value for the output.
                }

                // Internal prototype method: _next()
                // Generates a random number and clamps it within the min/max range.
                Random.prototype._next = function () {
                    var result = this._rng.next(); // Get raw random number.

                    // Clamp the result within the specified bounds.
                    if ( result < this._min ) {
                        result = this._min;
                    }
                    if ( result > this._max ) {
                        result = this._max;
                    }

                    return result; // Return the clamped random number.
                };

                // Public prototype method: setRng()
                // Sets a new random number generator.
                Random.prototype.setRng = function ( rng ) {
                    this._rng = rng;
                    return this; // Allow chaining
                };

                // Public prototype method: getRng()
                // Returns the current random number generator.
                Random.prototype.getRng = function () {
                    return this._rng;
                };

                // Public prototype method: setMin()
                // Sets a new minimum value.
                Random.prototype.setMin = function ( min ) {
                    this._min = min;
                    return this; // Allow chaining
                };

                // Public prototype method: getMin()
                // Returns the current minimum value.
                Random.prototype.getMin = function () {
                    return this._min;
                };

                // Public prototype method: setMax()
                // Sets a new maximum value.
                Random.prototype.setMax = function ( max ) {
                    this._max = max;
                    return this; // Allow chaining
                };

                // Public prototype method: getMax()
                // Returns the current maximum value.
                Random.prototype.getMax = function () {
                    return this._max;
                };

                return Random; // Return the Random class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Random = Random; // Export Random class


            /**
             *  RandomWalk Sequence Class
             *  Generates a sequence representing a random walk.
             *  Extends the base Sequence class.
             */
            var RandomWalk = ( function ( _super ) {

                __extends( RandomWalk, _super ); // Establish inheritance

                // Constructor for the RandomWalk class
                function RandomWalk( rng, start, min, max ) {
                    // Handle optional parameters.
                    if ( typeof rng === "undefined" ) {
                        rng = defaultRNG;
                    }
                    if ( typeof start === "undefined" ) {
                        start = 0.5;
                    }
                    if ( typeof min === "undefined" ) {
                        min = 0;
                    }
                    if ( typeof max === "undefined" ) {
                        max = 1;
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Initialize internal state.
                    this._rng   = rng;     // RNG for step size.
                    this._start = start;   // Initial value of the walk.
                    this._cur   = start;   // Current value of the walk.
                    this._min   = min;     // Minimum bound for the walk.
                    this._max   = max;     // Maximum bound for the walk.
                }

                // Internal prototype method: _next()
                // Performs one step of the random walk.
                RandomWalk.prototype._next = function () {
                    var result = this._cur; // Store current value before updating.

                    // Determine direction randomly (+1 or -1).
                    var direction = defaultRNG.next() > 0.5 ? -1 : +1;

                    // Update current value based on RNG step size and direction.
                    this._cur += this._rng.next() * direction;

                    // Clamp the current value within the min/max bounds.
                    if ( this._cur > this._max ) {
                        this._cur = this._max;
                    }
                    if ( this._cur < this._min ) {
                        this._cur = this._min;
                    }

                    return result; // Return the value *before* the current step.
                };

                // Public prototype method: setRng()
                // Sets a new random number generator for step sizes.
                RandomWalk.prototype.setRng = function ( rng ) {
                    this._rng = rng;
                    return this; // Allow chaining
                };

                // Public prototype method: getRng()
                // Returns the current random number generator.
                RandomWalk.prototype.getRng = function () {
                    return this._rng;
                };

                // Public prototype method: setStart()
                // Sets a new starting value and resets the current value.
                RandomWalk.prototype.setStart = function ( start ) {
                    this._start = start;
                    this._cur   = start; // Reset current value.
                    return this;         // Allow chaining
                };

                // Public prototype method: getStart()
                // Returns the starting value.
                RandomWalk.prototype.getStart = function () {
                    return this._start;
                };

                // Public prototype method: setMin()
                // Sets a new minimum bound.
                RandomWalk.prototype.setMin = function ( min ) {
                    this._min = min;
                    return this; // Allow chaining
                };

                // Public prototype method: getMin()
                // Returns the current minimum bound.
                RandomWalk.prototype.getMin = function () {
                    return this._min;
                };

                // Public prototype method: setMax()
                // Sets a new maximum bound.
                RandomWalk.prototype.setMax = function ( max ) {
                    this._max = max;
                    return this; // Allow chaining
                };

                // Public prototype method: getMax()
                // Returns the current maximum bound.
                RandomWalk.prototype.getMax = function () {
                    return this._max;
                };

                return RandomWalk; // Return the RandomWalk class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.RandomWalk = RandomWalk; // Export RandomWalk class


            /**
             *  Combine Sequence Class
             *  Combines multiple sequences by summing their next values.
             *  Extends the base Sequence class.
             */
            var Combine = ( function ( _super ) {

                __extends( Combine, _super ); // Establish inheritance

                // Constructor for the Combine class
                function Combine( seqs ) {
                    // Handle optional sequences parameter.
                    if ( typeof seqs === "undefined" ) {
                        seqs = [];
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    this._seqs = []; // Initialize an array to hold the child sequences.

                    // Process each sequence provided in the constructor.
                    for ( var i = 0; i < seqs.length; i++ ) {
                        var seq = seqs[ i ];
                        // If a sequence is an array, convert it to a Cycle sequence.
                        // Otherwise, use it directly.
                        this._seqs[ i ] = _isArray( seq ) ? new Cycle( seq ) : seq;
                    }
                }

                // Internal prototype method: _next()
                // Returns the sum of the next values from all combined sequences.
                Combine.prototype._next = function () {
                    var result = 0; // Initialize sum.

                    // Iterate through all child sequences and sum their next values.
                    for ( var i = 0; i < this._seqs.length; i++ ) {
                        var seq = this._seqs[ i ];
                        result += seq.next();
                    }

                    return result; // Return the total sum.
                };

                // Public prototype method: add()
                // Adds a new sequence to the combination.
                Combine.prototype.add = function ( seq ) {
                    // Convert array to Cycle sequence if needed.
                    this._seqs.push( _isArray( seq ) ? new Cycle( seq ) : seq );
                    return this; // Allow chaining
                };

                return Combine; // Return the Combine class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Combine = Combine; // Export Combine class


            /**
             *  Repeat Sequence Class
             *  Repeats each value from an underlying sequence a specified number of times.
             *  Extends the base Sequence class.
             */
            var Repeat = ( function ( _super ) {

                __extends( Repeat, _super ); // Establish inheritance

                // Constructor for the Repeat class
                function Repeat( seq, count ) {
                    // Handle optional count parameter.
                    if ( typeof count === "undefined" ) {
                        count = 2;
                    }
                    // Call the super constructor (Sequence).
                    _super.call( this );

                    // Initialize internal state.
                    this._seq       = seq;          // The underlying sequence.
                    this._count     = count;        // Number of times to repeat each value.
                    this._curValue  = 0;            // The current value being repeated.
                    this._curCount  = +Infinity;    // Counter for current repetitions.
                                                    // Set to Infinity initially to force fetching
                                                    // the first value on the first call to _next.
                }

                // Internal prototype method: _next()
                // Returns the current value, repeating it 'count' times before fetching a new one.
                Repeat.prototype._next = function () {
                    // If current repetition count is exhausted, fetch a new value.
                    if ( this._curCount >= this._count ) {
                        this._curValue = this._seq.next(); // Get next value from underlying sequence.
                        this._curCount = 0;                 // Reset repetition counter.
                    }

                    this._curCount++; // Increment repetition counter.
                    return this._curValue; // Return the current (repeated) value.
                };

                // Public prototype method: setCount()
                // Sets a new repetition count.
                Repeat.prototype.setCount = function ( count ) {
                    this._count = count;
                    return this; // Allow chaining
                };

                // Public prototype method: getCount()
                // Returns the current repetition count.
                Repeat.prototype.getCount = function () {
                    return this._count;
                };

                return Repeat; // Return the Repeat class constructor
            } )( Sequence ); // Inherit from Sequence

            seqs.Repeat = Repeat; // Export Repeat class


            /**
             *  Helper function: _isArray
             *  Checks if a given value is an array.
             *  Uses Object.prototype.toString for robust type checking.
             */
            function _isArray( value ) {
                return Object.prototype.toString.call( value ) === '[object Array]';
            }

        } )( exports.seqs || ( exports.seqs = {} ) ); // IIFE for seqs namespace

        // Create a local reference to the seqs namespace
        var seqs = exports.seqs;


        /*
         *  Namespace: norms
         *  Contains various normalization strategies.
         */
        ( function ( norms ) {

            /**
             *  Normalizer Base Class
             *  Provides an interface for data normalization.
             */
            var Normalizer = ( function () {
                // Constructor for the Normalizer class (empty)
                function Normalizer() {
                }

                // Prototype method: normalize()
                // Must be overridden by derived classes.
                Normalizer.prototype.normalize = function ( data ) {
                    throw new Error( 'Not Implemented' );
                };

                return Normalizer; // Return the Normalizer class constructor
            } )();

            norms.Normalizer = Normalizer; // Export Normalizer class


            /**
             *  Identity Normalizer Class
             *  Returns data unchanged (no normalization).
             *  Extends the base Normalizer class.
             */
            var Identity = ( function ( _super ) {

                __extends( Identity, _super ); // Establish inheritance

                // Constructor for the Identity class.
                // Calls the super constructor with arguments.
                function Identity() {
                    _super.apply( this, arguments );
                }

                // Prototype method: normalize()
                // Returns the input data array as is.
                Identity.prototype.normalize = function ( data ) {
                    return data;
                };

                return Identity; // Return the Identity class constructor
            } )( Normalizer ); // Inherit from Normalizer

            norms.Identity = Identity; // Export Identity class


            /**
             *  Minmax Normalizer Class
             *  Scales data to a specified minimum and maximum range.
             *  Extends the base Normalizer class.
             */
            var Minmax = ( function ( _super ) {

                __extends( Minmax, _super ); // Establish inheritance

                // Constructor for the Minmax class
                function Minmax( min, max ) {
                    // Handle optional parameters.
                    if ( typeof min === "undefined" ) {
                        min = 0;
                    }
                    if ( typeof max === "undefined" ) {
                        max = 1;
                    }
                    // Call the super constructor (Normalizer).
                    _super.call( this );

                    // Store the target min and max values.
                    this._min = min;
                    this._max = max;
                }

                // Prototype method: normalize()
                // Scales the input data array to the target min/max range.
                Minmax.prototype.normalize = function ( data ) {
                    var _this = this; // Capture 'this' for use in inner functions.

                    var smin = +Infinity; // Source data minimum.
                    var smax = -Infinity; // Source data maximum.

                    // Find the actual min and max of the input data.
                    data.forEach( function ( d ) {
                        if ( d < smin ) {
                            smin = d;
                        }
                        if ( d > smax ) {
                            smax = d;
                        }
                    } );

                    var srange = smax - smin; // Range of source data.
                    var trange = this._max - this._min; // Target range.
                    var ratio  = srange === 0 ? 0 : trange / srange; // Scaling ratio (handle srange=0 to avoid division by zero).

                    // Map each data point to the new range.
                    return data.map( function ( d ) {
                        return ( d - smin ) * ratio + _this._min;
                    } );
                };

                return Minmax; // Return the Minmax class constructor
            } )( Normalizer ); // Inherit from Normalizer

            norms.Minmax = Minmax; // Export Minmax class


            /**
             *  Sum Normalizer Class
             *  Scales data so that the sum of its elements equals a specified target sum.
             *  Extends the base Normalizer class.
             */
            var Sum = ( function ( _super ) {

                __extends( Sum, _super ); // Establish inheritance

                // Constructor for the Sum class
                function Sum( sum ) {
                    // Handle optional sum parameter.
                    if ( typeof sum === "undefined" ) {
                        sum = 1;
                    }
                    // Call the super constructor (Normalizer).
                    _super.call( this );

                    // Store the target sum.
                    this._sum = sum;
                }

                // Prototype method: normalize()
                // Scales the input data array so its elements sum to `_sum`.
                Sum.prototype.normalize = function ( data ) {
                    var ssum = 0; // Current sum of source data.

                    // Calculate the sum of the input data.
                    data.forEach( function ( d ) {
                        return ssum += d;
                    } );

                    // Calculate the scaling ratio (handle ssum=0 to avoid division by zero).
                    var ratio = ssum === 0 ? 0 : this._sum / ssum;

                    // Map each data point by multiplying with the ratio.
                    return data.map( function ( d ) {
                        return d * ratio;
                    } );
                };

                return Sum; // Return the Sum class constructor
            } )( Normalizer ); // Inherit from Normalizer

            norms.Sum = Sum; // Export Sum class

        } )( exports.norms || ( exports.norms = {} ) ); // IIFE for norms namespace

        // Create a local reference to the norms namespace
        var norms = exports.norms;

    }
)
// This is a source mapping URL comment, often generated by TypeScript.
//@ sourceMappingURL=file:////Users/alankang/Devs/prjs/dgen/src/dgen.js.map