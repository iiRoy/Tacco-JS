"use strict";

// Utility function for inheriting prototypes in ES5-style classes.
// Renamed from __extends to _inheritPrototype, with internal identifier changes.
var _inheritPrototype = this._inheritPrototype || function (childCtor, parentCtor) {
    /** @private */
    function TempConstructor() { this.constructor = childCtor; }
    TempConstructor.prototype = parentCtor.prototype;
    childCtor.prototype = new TempConstructor();
};

// AMD module definition for the entire library.
// Renamed 'require' to 'dependencyLoader' and 'exports' to 'moduleExports'.
define(["dependencyLoader", "moduleExports"], function(dependencyLoader, moduleExports) {

    // Library version identifier.
    moduleExports.libVersion = '1.0.0-alpha'; // Updated version string.

    /**
     * @namespace coreGenerators
     * Provides a collection of core random number generators and base classes.
     */
    (function (coreGenerators) {
        // A globally accessible, default random source for convenience.
        const globalEntropySource = new Random(); // Assumes 'Random' is an external global or imported class.

        /**
         * @class AbstractEntropySource
         * Base class for all random number generators.
         * Enforces a 'next' method that must be implemented by subclasses.
         */
        let AbstractEntropySource = (function () {
            function AbstractEntropySource(initialSeed) {
                // Initialize internal random number generator.
                // If no specific seed is provided, use the global default.
                this._internalGen = (initialSeed !== null && initialSeed !== undefined) ? new Random(initialSeed) : globalEntropySource;
            }
            /**
             * Generates the next random number.
             * This method must be overridden by concrete generator implementations.
             * @returns {number} The next generated value.
             * @throws {Error} If not implemented by a subclass.
             */
            AbstractEntropySource.prototype.getNextValue = function () {
                // Developers should override this method in derived classes.
                throw new Error('Method "getNextValue" is not implemented by this generator.');
            };
            return AbstractEntropySource;
        })();
        coreGenerators.AbstractEntropySource = AbstractEntropySource;        
        
        /**
         * @class FixedValueGenerator
         * Generates values from a predefined array in a cyclic manner.
         * Extends AbstractEntropySource.
         */
        let FixedValueGenerator = (function (_baseGen) {
            _inheritPrototype(FixedValueGenerator, _baseGen);
            function FixedValueGenerator(dataValues) {
                // Call the base class constructor without a specific seed.
                _baseGen.call(this, null); 
                this._currentPosition = 0; // Tracks the current index in the pattern.
                this._valuePattern = dataValues; // The array of values to cycle through.

                // Ensure the pattern is an array and not empty.
                if (!Array.isArray(this._valuePattern) || this._valuePattern.length === 0) {
                    this._valuePattern = [0]; // Default to a single zero if invalid input.
                }
            }
            /**
             * Returns the next value from the internal pattern, cycling if the end is reached.
             * @returns {number} The next value in the sequence.
             */
            FixedValueGenerator.prototype.getNextValue = function () {
                const fetchedValue = this._valuePattern[this._currentPosition % this._valuePattern.length];
                this._currentPosition++; // Advance the position for the next call.
                return fetchedValue;
            };
            return FixedValueGenerator;
        })(AbstractEntropySource);
        coreGenerators.FixedValueGenerator = FixedValueGenerator;        
        
        /**
         * @class BasicRandomizer
         * Generates uniformly distributed random numbers using the internal Random instance.
         * Extends AbstractEntropySource.
         */
        let BasicRandomizer = (function (_baseGen) {
            _inheritPrototype(BasicRandomizer, _baseGen);
            function BasicRandomizer(seedInput) {
                // Pass the seed directly to the base constructor.
                _baseGen.call(this, seedInput);
            }
            /**
             * Returns a uniform random number.
             * @returns {number} A uniformly distributed random number.
             */
            BasicRandomizer.prototype.getNextValue = function () {
                return this._internalGen.random();
            };
            return BasicRandomizer;
        })(AbstractEntropySource);
        coreGenerators.BasicRandomizer = BasicRandomizer;        
        
        /**
         * @class GaussianDistribution
         * Generates normally distributed random numbers.
         * Extends AbstractEntropySource.
         */
        let GaussianDistribution = (function (_baseGen) {
            _inheritPrototype(GaussianDistribution, _baseGen);
            function GaussianDistribution(meanValue, standardDeviation) {
                _baseGen.call(this, null); // No specific seed for this constructor variant.
                this._meanVal = meanValue; // Mean (mu) of the distribution.
                this._stdDev = standardDeviation; // Standard deviation (sigma) of the distribution.
            }
            /**
             * Returns a normally distributed random number.
             * @returns {number} A Gaussian-distributed random number.
             */
            GaussianDistribution.prototype.getNextValue = function () {
                return this._internalGen.normal(this._meanVal, this._stdDev);
            };
            return GaussianDistribution;
        })(AbstractEntropySource);
        coreGenerators.GaussianDistribution = GaussianDistribution;        
        
        /**
         * @class PowerLawDistribution
         * Generates Pareto-distributed random numbers.
         * Extends AbstractEntropySource.
         */
        let PowerLawDistribution = (function (_baseGen) {
            _inheritPrototype(PowerLawDistribution, _baseGen);
            function PowerLawDistribution(shapeParameter) {
                _baseGen.call(this, null); // No specific seed.
                this._shapeParam = shapeParameter; // Alpha parameter for Pareto distribution.
            }
            /**
             * Returns a Pareto-distributed random number.
             * @returns {number} A Pareto-distributed random number.
             */
            PowerLawDistribution.prototype.getNextValue = function () {
                return this._internalGen.pareto(this._shapeParam);
            };
            return PowerLawDistribution;
        })(AbstractEntropySource);
        coreGenerators.PowerLawDistribution = PowerLawDistribution;        
        
    })(moduleExports.coreGenerators || (moduleExports.coreGenerators = {}));
    const coreGenerators = moduleExports.coreGenerators;

    // A small internal helper for checking if a value is an array.
    const _isValArray = (val) => Object.prototype.toString.call(val) === '[object Array]';

    /**
     * @namespace dataStreams
     * Provides a collection of classes for generating sequences of data.
     */
    (function (dataStreams) {
        // Default random source for various sequence generators.
        const defaultRandomSource = new coreGenerators.BasicRandomizer();

        /**
         * @class ValueEmitter
         * Base class for all data sequence emitters.
         * Supports mapping/transforming generated values.
         */
        let ValueEmitter = (function () {
            function ValueEmitter() {
                // Default identity mapping function.
                this._transformFunc = (val) => val;
            }
            /**
             * Abstract method to generate the raw next value.
             * Must be implemented by subclasses.
             * @returns {number} The raw next value.
             * @throws {Error} If not implemented.
             */
            ValueEmitter.prototype._fetchNextRaw = function () {
                throw new Error('Internal method "_fetchNextRaw" is not implemented by this emitter.');
            };
            /**
             * Generates and returns the next value, applying any set transformation.
             * @returns {number} The transformed next value.
             */
            ValueEmitter.prototype.produceNext = function () {
                return this._transformFunc(this._fetchNextRaw());
            };
            /**
             * Generates an array of values from the sequence.
             * @param {number} count - The number of values to generate.
             * @param {object} [scaler] - An optional normalizer/scaler to apply to the generated array.
             * @returns {Array<number>} An array of generated and potentially normalized values.
             */
            ValueEmitter.prototype.generateArray = function (count, scaler) {
                if (count <= 0) {
                    console.warn("Attempted to generate an array with non-positive count. Returning empty array.");
                    return [];
                }
                // Use a default identity scaler if none is provided.
                const activeScaler = scaler || new moduleExports.valueTransformers.PassThroughScaler();
                const outputData = new Array(count);
                let i = 0;
                while (i < count) { // Using while loop instead of for loop.
                    outputData[i] = this.produceNext();
                    i++;
                }
                return activeScaler.processValues(outputData);
            };
            /**
             * Sets a new transformation function for the emitter.
             * @param {function(number): number} newMapFunction - The function to apply to each generated value.
             * @returns {ValueEmitter} The current emitter instance for chaining.
             */
            ValueEmitter.prototype.setTransformer = function (newMapFunction) {
                if (typeof newMapFunction !== 'function') {
                    console.error("Attempted to set a non-function as transformer. Ignoring.");
                    return this;
                }
                this._transformFunc = newMapFunction;
                return this;
            };
            /**
             * Retrieves the current transformation function.
             * @returns {function(number): number} The current mapping function.
             */
            ValueEmitter.prototype.getTransformer = function () {
                return this._transformFunc;
            };
            return ValueEmitter;
        })();
        dataStreams.ValueEmitter = ValueEmitter;        
        
        /**
         * @class FixedValueStream
         * Emits a constant, unchanging value.
         * Extends ValueEmitter.
         */
        let FixedValueStream = (function (_baseEmitter) {
            _inheritPrototype(FixedValueStream, _baseEmitter);
            function FixedValueStream(initialValue = 0) { // Using ES6 default parameter syntax.
                _baseEmitter.call(this);
                this._fixedVal = initialValue;
            }
            /**
             * Returns the stored constant value.
             * @returns {number} The constant value.
             */
            FixedValueStream.prototype._fetchNextRaw = function () {
                return this._fixedVal;
            };
            /**
             * Updates the constant value emitted by this stream.
             * @param {number} newValue - The new constant value.
             * @returns {FixedValueStream} The current instance for chaining.
             */
            FixedValueStream.prototype.updateFixedValue = function (newValue) {
                this._fixedVal = newValue;
                return this;
            };
            /**
             * Retrieves the current constant value.
             * @returns {number} The current constant value.
             */
            FixedValueStream.prototype.retrieveFixedValue = function () {
                return this._fixedVal;
            };
            return FixedValueStream;
        })(ValueEmitter);
        dataStreams.FixedValueStream = FixedValueStream;        
        
        /**
         * @class RepeatingPatternStream
         * Emits values from a given array in a cyclical manner.
         * Extends ValueEmitter.
         */
        let RepeatingPatternStream = (function (_baseEmitter) {
            _inheritPrototype(RepeatingPatternStream, _baseEmitter);
            function RepeatingPatternStream(valueArray = [0, 1]) { // ES6 default parameter for array.
                _baseEmitter.call(this);
                this._patternIdx = 0; // Current index in the pattern.
                this._valuePattern = valueArray;

                if (!_isValArray(this._valuePattern) || this._valuePattern.length === 0) {
                    console.warn("Invalid pattern provided for RepeatingPatternStream. Defaulting to [0, 1].");
                    this._valuePattern = [0, 1];
                }
            }
            /**
             * Returns the next value from the pattern, cycling through.
             * @returns {number} The next value.
             */
            RepeatingPatternStream.prototype._fetchNextRaw = function () {
                const currentPatternItem = this._valuePattern[this._patternIdx % this._valuePattern.length];
                this._patternIdx++;
                return currentPatternItem;
            };
            /**
             * Assigns a new pattern to the stream.
             * @param {Array<number>} newPattern - The new array pattern.
             * @returns {RepeatingPatternStream} The current instance for chaining.
             */
            RepeatingPatternStream.prototype.assignPattern = function (newPattern) {
                if (!_isValArray(newPattern) || newPattern.length === 0) {
                    console.error("Cannot assign an empty or non-array pattern.");
                    return this;
                }
                this._valuePattern = newPattern;
                this._patternIdx = 0; // Reset index when pattern changes.
                return this;
            };
            /**
             * Retrieves the currently assigned pattern.
             * @returns {Array<number>} The current pattern.
             */
            RepeatingPatternStream.prototype.getAssignedPattern = function () {
                return this._valuePattern;
            };
            return RepeatingPatternStream;
        })(ValueEmitter);
        dataStreams.RepeatingPatternStream = RepeatingPatternStream;        
        
        /**
         * @class ArithmeticProgression
         * Emits values in an arithmetic sequence.
         * Extends ValueEmitter.
         */
        let ArithmeticProgression = (function (_baseEmitter) {
            _inheritPrototype(ArithmeticProgression, _baseEmitter);
            function ArithmeticProgression(initialVal = 0, incrementVal = 1) {
                _baseEmitter.call(this);
                this._initialVal = initialVal;
                this._incrementVal = incrementVal;
                this._currentVal = initialVal; // Initialize current value.
            }
            /**
             * Returns the current value and then increments it by the step.
             * @returns {number} The current value in the arithmetic sequence.
             */
            ArithmeticProgression.prototype._fetchNextRaw = function () {
                const result = this._currentVal;
                this._currentVal += this._incrementVal;
                return result;
            };
            /**
             * Resets the sequence to a new starting value.
             * @param {number} newStart - The new starting value.
             * @returns {ArithmeticProgression} The current instance for chaining.
             */
            ArithmeticProgression.prototype.resetToStart = function (newStart) {
                this._initialVal = newStart;
                this._currentVal = newStart;
                return this;
            };
            /**
             * Retrieves the initial value of the sequence.
             * @returns {number} The initial value.
             */
            ArithmeticProgression.prototype.getStartValue = function () {
                return this._initialVal;
            };
            /**
             * Adjusts the increment step of the sequence.
             * @param {number} newStep - The new step value.
             * @returns {ArithmeticProgression} The current instance for chaining.
             */
            ArithmeticProgression.prototype.adjustStep = function (newStep) {
                this._incrementVal = newStep;
                return this;
            };
            /**
             * Retrieves the current step value.
             * @returns {number} The step value.
             */
            ArithmeticProgression.prototype.getStepValue = function () {
                return this._incrementVal;
            };
            return ArithmeticProgression;
        })(ValueEmitter);
        dataStreams.ArithmeticProgression = ArithmeticProgression;        
        
        /**
         * @class GeometricProgression
         * Emits values in a geometric sequence.
         * Extends ValueEmitter.
         */
        let GeometricProgression = (function (_baseEmitter) {
            _inheritPrototype(GeometricProgression, _baseEmitter);
            function GeometricProgression(baseVal = 1, multiplier = 2) {
                _baseEmitter.call(this);
                this._baseVal = baseVal;
                this._multiplier = multiplier;
                this._currentGenVal = baseVal; // Initialize current value.
            }
            /**
             * Returns the current value and then multiplies it by the ratio.
             * @returns {number} The current value in the geometric sequence.
             */
            GeometricProgression.prototype._fetchNextRaw = function () {
                const emittedValue = this._currentGenVal;
                this._currentGenVal *= this._multiplier;
                return emittedValue;
            };
            /**
             * Resets the sequence to a new base value.
             * @param {number} newBase - The new base value.
             * @returns {GeometricProgression} The current instance for chaining.
             */
            GeometricProgression.prototype.resetBaseValue = function (newBase) {
                this._baseVal = newBase;
                this._currentGenVal = newBase;
                return this;
            };
            /**
             * Retrieves the base value of the sequence.
             * @returns {number} The base value.
             */
            GeometricProgression.prototype.getBaseValue = function () {
                return this._baseVal;
            };
            /**
             * Updates the multiplier ratio of the sequence.
             * @param {number} newRatio - The new ratio.
             * @returns {GeometricProgression} The current instance for chaining.
             */
            GeometricProgression.prototype.updateMultiplier = function (newRatio) {
                this._multiplier = newRatio;
                return this;
            };
            /**
             * Retrieves the current multiplier ratio.
             * @returns {number} The multiplier ratio.
             */
            GeometricProgression.prototype.getMultiplier = function () {
                return this._multiplier;
            };
            return GeometricProgression;
        })(ValueEmitter);
        dataStreams.GeometricProgression = GeometricProgression;        
        
        /**
         * @class BoundedRandomStream
         * Emits random numbers within a specified min/max range.
         * Extends ValueEmitter.
         */
        let BoundedRandomStream = (function (_baseEmitter) {
            _inheritPrototype(BoundedRandomStream, _baseEmitter);
            function BoundedRandomStream(sourceGen = defaultRandomSource, lowerLimit = -Infinity, upperLimit = +Infinity) {
                _baseEmitter.call(this);
                this._sourceGen = sourceGen;
                this._lowerBound = lowerLimit;
                this._upperBound = upperLimit;

                if (this._lowerBound > this._upperBound) { // Guard clause: ensure bounds are valid.
                    console.warn(`BoundedRandomStream: lower bound (${this._lowerBound}) cannot be greater than upper bound (${this._upperBound}). Swapping them.`);
                    [this._lowerBound, this._upperBound] = [this._upperBound, this._lowerBound]; // ES6 destructuring swap.
                }
            }
            /**
             * Returns the next random number, clamped within the specified bounds.
             * @returns {number} A random number within [min, max].
             */
            BoundedRandomStream.prototype._fetchNextRaw = function () {
                let generatedValue = this._sourceGen.getNextValue();
                // Clamp the value to the defined range using Math.min/max for conciseness.
                return Math.max(this._lowerBound, Math.min(generatedValue, this._upperBound));
            };
            /**
             * Sets a new underlying random number generator.
             * @param {coreGenerators.AbstractEntropySource} newGen - The new generator.
             * @returns {BoundedRandomStream} The current instance for chaining.
             */
            BoundedRandomStream.prototype.setSourceGenerator = function (newGen) {
                this._sourceGen = newGen;
                return this;
            };
            /**
             * Retrieves the current source generator.
             * @returns {coreGenerators.AbstractEntropySource} The current generator.
             */
            BoundedRandomStream.prototype.getSourceGenerator = function () {
                return this._sourceGen;
            };
            /**
             * Sets the lower limit for generated values.
             * @param {number} newMin - The new minimum value.
             * @returns {BoundedRandomStream} The current instance for chaining.
             */
            BoundedRandomStream.prototype.setLowerLimit = function (newMin) {
                this._lowerBound = newMin;
                return this;
            };
            /**
             * Retrieves the current lower limit.
             * @returns {number} The current minimum value.
             */
            BoundedRandomStream.prototype.getLowerLimit = function () {
                return this._lowerBound;
            };
            /**
             * Sets the upper limit for generated values.
             * @param {number} newMax - The new maximum value.
             * @returns {BoundedRandomStream} The current instance for chaining.
             */
            BoundedRandomStream.prototype.setUpperLimit = function (newMax) {
                this._upperBound = newMax;
                return this;
            };
            /**
             * Retrieves the current upper limit.
             * @returns {number} The current maximum value.
             */
            BoundedRandomStream.prototype.getUpperLimit = function () {
                return this._upperBound;
            };
            return BoundedRandomStream;
        })(ValueEmitter);
        dataStreams.BoundedRandomStream = BoundedRandomStream;        
        
        /**
         * @class StochasticWalkStream
         * Emits values that perform a random walk within defined boundaries.
         * Extends ValueEmitter.
         */
        let StochasticWalkStream = (function (_baseEmitter) {
            _inheritPrototype(StochasticWalkStream, _baseEmitter);
            function StochasticWalkStream(stepGenerator = defaultRandomSource, initialPosition = 0.5, minBoundary = 0, maxBoundary = 1) {
                _baseEmitter.call(this);
                this._stepGenerator = stepGenerator;
                this._initialPos = initialPosition;
                this._currentPos = initialPosition;
                this._minBoundary = minBoundary;
                this._maxBoundary = maxBoundary;

                // Ensure boundaries are ordered correctly.
                if (this._minBoundary > this._maxBoundary) {
                    [this._minBoundary, this._maxBoundary] = [this._maxBoundary, this._minBoundary];
                }
                // Clamp initial position.
                this._currentPos = Math.max(this._minBoundary, Math.min(this._initialPos, this._maxBoundary));
            }
            /**
             * Returns the current position, then updates it by a random step,
             * clamping the new position within boundaries.
             * @returns {number} The value at the current step of the walk.
             */
            StochasticWalkStream.prototype._fetchNextRaw = function () {
                const previousPosition = this._currentPos;
                
                // Determine direction randomly using Math.random() directly.
                const stepDirection = (Math.random() > 0.5) ? -1 : 1;
                
                // Update current position based on step generator and direction.
                this._currentPos += this._stepGenerator.getNextValue() * stepDirection;
                
                // Clamp the new position within the boundaries.
                this._currentPos = Math.max(this._minBoundary, Math.min(this._currentPos, this._maxBoundary));
                
                return previousPosition;
            };
            /**
             * Sets a new generator for the step size.
             * @param {coreGenerators.AbstractEntropySource} newStepGen - The new step generator.
             * @returns {StochasticWalkStream} The current instance for chaining.
             */
            StochasticWalkStream.prototype.setStepGen = function (newStepGen) {
                this._stepGenerator = newStepGen;
                return this;
            };
            /**
             * Retrieves the current step generator.
             * @returns {coreGenerators.AbstractEntropySource} The current generator.
             */
            StochasticWalkStream.prototype.getStepGen = function () {
                return this._stepGenerator;
            };
            /**
             * Reinitializes the walk to a new starting position.
             * @param {number} newStart - The new starting position.
             * @returns {StochasticWalkStream} The current instance for chaining.
             */
            StochasticWalkStream.prototype.reinitializePosition = function (newStart) {
                this._initialPos = newStart;
                this._currentPos = Math.max(this._minBoundary, Math.min(newStart, this._maxBoundary)); // Clamp new start.
                return this;
            };
            /**
             * Retrieves the initial position.
             * @returns {number} The initial position.
             */
            StochasticWalkStream.prototype.getInitialPosition = function () {
                return this._initialPos;
            };
            /**
             * Sets the lower boundary for the walk.
             * @param {number} newMin - The new minimum boundary.
             * @returns {StochasticWalkStream} The current instance for chaining.
             */
            StochasticWalkStream.prototype.setLowerBoundary = function (newMin) {
                this._minBoundary = newMin;
                // Re-clamp current position if boundary changes.
                this._currentPos = Math.max(this._minBoundary, Math.min(this._currentPos, this._maxBoundary));
                return this;
            };
            /**
             * Retrieves the current lower boundary.
             * @returns {number} The current minimum boundary.
             */
            StochasticWalkStream.prototype.getLowerBoundary = function () {
                return this._minBoundary;
            };
            /**
             * Sets the upper boundary for the walk.
             * @param {number} newMax - The new maximum boundary.
             * @returns {StochasticWalkStream} The current instance for chaining.
             */
            StochasticWalkStream.prototype.setUpperBoundary = function (newMax) {
                this._maxBoundary = newMax;
                // Re-clamp current position if boundary changes.
                this._currentPos = Math.max(this._minBoundary, Math.min(this._currentPos, this._maxBoundary));
                return this;
            };
            /**
             * Retrieves the current upper boundary.
             * @returns {number} The current maximum boundary.
             */
            StochasticWalkStream.prototype.getUpperBoundary = function () {
                return this._maxBoundary;
            };
            return StochasticWalkStream;
        })(ValueEmitter);
        dataStreams.StochasticWalkStream = StochasticWalkStream;        
        
        /**
         * @class CombinedStream
         * Emits the sum of values from multiple child streams.
         * Extends ValueEmitter.
         */
        let CombinedStream = (function (_baseEmitter) {
            _inheritPrototype(CombinedStream, _baseEmitter);
            function CombinedStream(inputStreams = []) {
                _baseEmitter.call(this);
                this._childStreams = []; // Array to hold the constituent streams.

                // Process initial streams; convert arrays to RepeatingPatternStream instances.
                for (let k = 0; k < inputStreams.length; k++) { // Changed loop variable from i to k.
                    const currentInput = inputStreams[k];
                    this._childStreams[k] = _isValArray(currentInput) ? new RepeatingPatternStream(currentInput) : currentInput;
                }
                // Add a guard for empty input streams: provide a default.
                if (this._childStreams.length === 0) {
                    console.warn("CombinedStream initialized with no child streams. Adding a default FixedValueStream(0).");
                    this._childStreams.push(new FixedValueStream(0));
                }
            }
            /**
             * Calculates and returns the sum of the next values from all child streams.
             * @returns {number} The summed value.
             */
            CombinedStream.prototype._fetchNextRaw = function () {
                // Using reduce for a more functional approach to summing.
                return this._childStreams.reduce((total, stream) => total + stream.produceNext(), 0);
            };
            /**
             * Adds a new stream to the combination.
             * Arrays are automatically wrapped in a RepeatingPatternStream.
             * @param {ValueEmitter|Array<number>} newStream - The stream or array to add.
             * @returns {CombinedStream} The current instance for chaining.
             */
            CombinedStream.prototype.addStream = function (newStream) {
                this._childStreams.push(_isValArray(newStream) ? new RepeatingPatternStream(newStream) : newStream);
                return this;
            };
            /**
             * Retrieves the array of child streams.
             * @returns {Array<ValueEmitter>} The child streams.
             */
            CombinedStream.prototype.getComponentStreams = function () {
                // Return a shallow copy to prevent external modification of the internal array.
                return [...this._childStreams];
            };
            return CombinedStream;
        })(ValueEmitter);
        dataStreams.CombinedStream = CombinedStream;        
        
        /**
         * @class RepeatingValueStream
         * Emits a value from a source stream multiple times before fetching a new one.
         * Extends ValueEmitter.
         */
        let RepeatingValueStream = (function (_baseEmitter) {
            _inheritPrototype(RepeatingValueStream, _baseEmitter);
            function RepeatingValueStream(sourceStream, repeatLimit = 2) {
                _baseEmitter.call(this);
                this._sourceStream = sourceStream;
                this._repeatLimit = Math.max(1, repeatLimit); // Ensure repeat limit is at least 1.
                this._cachedValue = 0; // Stores the last fetched value.
                this._currentRepeatCount = Infinity; // Initialize to trigger new value on first call.

                // Guard: if sourceStream is null/undefined, default to FixedValueStream.
                if (!this._sourceStream) {
                    console.warn("RepeatingValueStream initialized without a valid source stream. Using FixedValueStream(0) as default.");
                    this._sourceStream = new FixedValueStream(0);
                }
            }
            /**
             * Emits the current cached value, fetching a new one from the source stream
             * only after the repeat limit is reached.
             * @returns {number} The repeated or newly fetched value.
             */
            RepeatingValueStream.prototype._fetchNextRaw = function () {
                // Check if we need to fetch a new value from the source.
                if (this._currentRepeatCount >= this._repeatLimit) {
                    this._cachedValue = this._sourceStream.produceNext();
                    this._currentRepeatCount = 0; // Reset repeat counter.
                }
                this._currentRepeatCount++; // Increment for the current emission.
                return this._cachedValue;
            };
            /**
             * Sets a new repeat limit for the stream.
             * @param {number} newCount - The number of times to repeat a value. Must be >= 1.
             * @returns {RepeatingValueStream} The current instance for chaining.
             */
            RepeatingValueStream.prototype.setRepeatLimit = function (newCount) {
                this._repeatLimit = Math.max(1, newCount);
                // If repeat limit changes, it might be good to reset the count to force a new value on next call.
                this._currentRepeatCount = Infinity; 
                return this;
            };
            /**
             * Retrieves the current repeat limit.
             * @returns {number} The current repeat limit.
             */
            RepeatingValueStream.prototype.getRepeatLimit = function () {
                return this._repeatLimit;
            };
            return RepeatingValueStream;
        })(ValueEmitter);
        dataStreams.RepeatingValueStream = RepeatingValueStream;        
        
    })(moduleExports.dataStreams || (moduleExports.dataStreams = {}));
    const dataStreams = moduleExports.dataStreams;

    /**
     * @namespace valueTransformers
     * Provides a collection of classes for normalizing arrays of data.
     */
    (function (valueTransformers) {
        /**
         * @class AbstractScaler
         * Base class for all data array normalizers.
         * Enforces a 'processValues' method that must be implemented.
         */
        let AbstractScaler = (function () {
            function AbstractScaler() { /* Constructor for base scaler. */ }
            /**
             * Processes and normalizes an array of data.
             * This method must be overridden by concrete scaler implementations.
             * @param {Array<number>} dataArray - The array of numbers to normalize.
             * @returns {Array<number>} The normalized array.
             * @throws {Error} If not implemented.
             */
            AbstractScaler.prototype.processValues = function (dataArray) {
                throw new Error('Method "processValues" is not implemented by this scaler.');
            };
            return AbstractScaler;
        })();
        valueTransformers.AbstractScaler = AbstractScaler;        
        
        /**
         * @class PassThroughScaler
         * A normalizer that returns the input array unchanged.
         * Extends AbstractScaler.
         */
        let PassThroughScaler = (function (_baseScaler) {
            _inheritPrototype(PassThroughScaler, _baseScaler);
            function PassThroughScaler() {
                _baseScaler.apply(this, arguments); // Call parent constructor with original arguments.
            }
            /**
             * Returns the input array as is.
             * @param {Array<number>} dataArray - The array to "normalize".
             * @returns {Array<number>} The original array.
             */
            PassThroughScaler.prototype.processValues = function (dataArray) {
                return dataArray;
            };
            return PassThroughScaler;
        })(AbstractScaler);
        valueTransformers.PassThroughScaler = PassThroughScaler;        
        
        /**
         * @class RangeScaler
         * Normalizes an array of numbers to a specified target min/max range.
         * Extends AbstractScaler.
         */
        let RangeScaler = (function (_baseScaler) {
            _inheritPrototype(RangeScaler, _baseScaler);
            function RangeScaler(targetMin = 0, targetMax = 1) {
                _baseScaler.call(this);
                this._targetMin = targetMin;
                this._targetMax = targetMax;

                // Ensure target range is valid.
                if (this._targetMin > this._targetMax) {
                    console.warn("RangeScaler: targetMin was greater than targetMax. Swapping them.");
                    [this._targetMin, this._targetMax] = [this._targetMax, this._targetMin];
                }
            }
            /**
             * Normalizes the input data array to the target [min, max] range.
             * Uses the actual min/max of the input data for scaling.
             * @param {Array<number>} dataArray - The array of numbers to normalize.
             * @returns {Array<number>} The range-normalized array.
             */
            RangeScaler.prototype.processValues = function (dataArray) {
                if (!Array.isArray(dataArray) || dataArray.length === 0) {
                    return []; // Return empty for invalid input.
                }

                // Find source min and max using reduce for efficiency.
                const { sourceMin, sourceMax } = dataArray.reduce((acc, current) => ({
                    sourceMin: Math.min(acc.sourceMin, current),
                    sourceMax: Math.max(acc.sourceMax, current)
                }), { sourceMin: Infinity, sourceMax: -Infinity });

                const sourceRange = sourceMax - sourceMin;
                const targetRange = this._targetMax - this._targetMin;

                // Handle cases where sourceRange is zero (all values are the same).
                if (sourceRange === 0) {
                    // All values are mapped to the midpoint of the target range.
                    const midpoint = (this._targetMin + this._targetMax) / 2;
                    return dataArray.map(() => midpoint);
                }

                const scaleFactor = targetRange / sourceRange;
                return dataArray.map(val => (val - sourceMin) * scaleFactor + this._targetMin);
            };
            return RangeScaler;
        })(AbstractScaler);
        valueTransformers.RangeScaler = RangeScaler;        
        
        /**
         * @class SumProportionScaler
         * Normalizes an array of numbers so that their sum equals a specified target sum.
         * Extends AbstractScaler.
         */
        let SumProportionScaler = (function (_baseScaler) {
            _inheritPrototype(SumProportionScaler, _baseScaler);
            function SumProportionScaler(targetSum = 1) {
                _baseScaler.call(this);
                this._targetSum = targetSum;
            }
            /**
             * Normalizes the input data array such that its elements sum up to the target sum.
             * @param {Array<number>} dataArray - The array of numbers to normalize.
             * @returns {Array<number>} The sum-normalized array.
             */
            SumProportionScaler.prototype.processValues = function (dataArray) {
                if (!Array.isArray(dataArray) || dataArray.length === 0) {
                    return []; // Return empty for invalid input.
                }

                // Calculate the current sum using reduce.
                const currentSum = dataArray.reduce((total, val) => total + val, 0);

                // Handle cases where the current sum is zero to prevent division by zero.
                if (currentSum === 0) {
                    // If targetSum is also 0, return as is. Otherwise, distribute targetSum evenly.
                    if (this._targetSum === 0) {
                        return dataArray.map(() => 0); // All zeros.
                    } else {
                        const valPerItem = this._targetSum / dataArray.length;
                        return dataArray.map(() => valPerItem);
                    }
                }

                const ratio = this._targetSum / currentSum;
                return dataArray.map(val => val * ratio);
            };
            return SumProportionScaler;
        })(AbstractScaler);
        valueTransformers.SumProportionScaler = SumProportionScaler;        
        
    })(moduleExports.valueTransformers || (moduleExports.valueTransformers = {}));
    const valueTransformers = moduleExports.valueTransformers;

    // Optional: Export namespaces for direct access if desired, though AMD handles it.
    // moduleExports.coreGenerators = coreGenerators;
    // moduleExports.dataStreams = dataStreams;
    // moduleExports.valueTransformers = valueTransformers;
});
// No source map URL comment as it's not relevant for a generated clone.