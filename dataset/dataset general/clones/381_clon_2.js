var _inheritFrom = this._inheritFrom || function (derivedClass, baseClass) {
    // Temporary constructor to establish prototype chain
    function _tempProto() { this.constructor = derivedClass; }
    _tempProto.prototype = baseClass.prototype;
    derivedClass.prototype = new _tempProto();
};

// Define module using AMD pattern
define(["requestModule", "exportModule"], function(requestModule, exportModule) {
    // Application version
    exportModule.appVersion = '0.2.0';

    // Namespace for random number generator sources
    (function (randomSources) {
        // Default internal random source
        var standardRandom = new SourceRandom();
        
        // Base class for all random value providers
        var SourceProvider = (function () {
            // Constructor accepts an optional seed for initialization
            function SourceProvider(seedValue) {
                this._generator = seedValue !== undefined ? new SourceRandom(seedValue) : standardRandom;
            }
            // Method to retrieve the next random value; must be overridden by subclasses
            SourceProvider.prototype.retrieveNext = function () {
                throw new Error('Method Not Implemented');
            };
            return SourceProvider;
        })();
        randomSources.SourceProvider = SourceProvider;        
        
        // A random source that pulls values from a predefined list
        var FixedSequence = (function (_super_class) {
            _inheritFrom(FixedSequence, _super_class);
            // Constructor takes an array of values to use
            function FixedSequence(valueSet) {
                // Call the parent constructor, providing no specific seed
                _super_class.call(this, undefined);
                this._currentIdx = 0;
                this._valuePool = valueSet;
            }
            // Returns the next value from the internal pool, cycling back to start if end is reached
            FixedSequence.prototype.retrieveNext = function () {
                var retrievedValue = this._valuePool[this._currentIdx % this._valuePool.length];
                this._currentIdx++;
                return retrievedValue;
            };
            return FixedSequence;
        })(SourceProvider);
        randomSources.FixedSequence = FixedSequence;        
        
        // A random source for uniform distribution
        var UniformSource = (function (_super_class) {
            _inheritFrom(UniformSource, _super_class);
            // Constructor takes an optional seed parameter
            function UniformSource(seedParam) {
                if (typeof seedParam === "undefined") { seedParam = undefined; }
                // Pass the seed to the parent constructor
                _super_class.call(this, seedParam);
            }
            // Generates a uniformly distributed random number
            UniformSource.prototype.retrieveNext = function () {
                return this._generator.produceRandom();
            };
            return UniformSource;
        })(SourceProvider);
        randomSources.UniformSource = UniformSource;        
        
        // A random source for normal (Gaussian) distribution
        var GaussianSource = (function (_super_class) {
            _inheritFrom(GaussianSource, _super_class);
            // Constructor takes the mean (meanVal) and standard deviation (stdDevVal)
            function GaussianSource(meanVal, stdDevVal) {
                // Call the parent constructor without a seed
                _super_class.call(this, undefined);
                this._mean = meanVal;
                this._stdDev = stdDevVal;
            }
            // Generates a normally distributed random number
            GaussianSource.prototype.retrieveNext = function () {
                return this._generator.generateNormal(this._mean, this._stdDev);
            };
            return GaussianSource;
        })(SourceProvider);
        randomSources.GaussianSource = GaussianSource;        
        
        // A random source for Pareto distribution
        var PowerLawSource = (function (_super_class) {
            _inheritFrom(PowerLawSource, _super_class);
            // Constructor takes the alpha parameter for the Pareto distribution
            function PowerLawSource(alphaParam) {
                // Call the parent constructor without a seed
                _super_class.call(this, undefined);
                this._alphaParam = alphaParam;
            }
            // Generates a Pareto distributed random number
            PowerLawSource.prototype.retrieveNext = function () {
                return this._generator.yieldPareto(this._alphaParam);
            };
            return PowerLawSource;
        })(SourceProvider);
        randomSources.PowerLawSource = PowerLawSource;        
    })(exportModule.randomSources || (exportModule.randomSources = {}));
    var randomSources = exportModule.randomSources;

    // Namespace for sequence generators
    (function (valueGenerators) {
        // Default random number generator for sequence operations
        var defaultRNGSource = new randomSources.UniformSource();
        
        // Base class for all value sequences
        var ValueStream = (function () {
            // Constructor initializes the default identity transformation function
            function ValueStream() {
                this._transformFunc = function (inputNum) {
                    return inputNum;
                };
            }
            // Abstract method to obtain the raw next value; subclasses must implement
            ValueStream.prototype._getNextRaw = function () {
                throw new Error('Method Not Implemented');
            };
            // Fetches the next value, applying the current transformation function
            ValueStream.prototype.fetchNext = function () {
                return this._transformFunc(this._getNextRaw());
            };
            // Generates an array of values from the sequence and applies a normalizer
            ValueStream.prototype.createArray = function (lengthCount, normalizer) {
                if (typeof normalizer === "undefined") { normalizer = new dataProcessors.NoChangeScaler(); }
                var valueData = new Array(lengthCount);
                for(var counter = 0; counter < lengthCount; counter++) {
                    valueData[counter] = this.fetchNext();
                }
                return normalizer.scaleData(valueData);
            };
            // Sets a new mapping function for the sequence
            ValueStream.prototype.assignMapFunction = function (mapFunc) {
                this._transformFunc = mapFunc;
                return this;
            };
            // Retrieves the currently set mapping function
            ValueStream.prototype.retrieveMapFunction = function () {
                return this._transformFunc;
            };
            return ValueStream;
        })();
        valueGenerators.ValueStream = ValueStream;        
        
        // A sequence that consistently returns a fixed, constant value
        var FixedValue = (function (_super_class) {
            _inheritFrom(FixedValue, _super_class);
            // Constructor takes an optional initial constant value
            function FixedValue(constVal) {
                if (typeof constVal === "undefined") { constVal = 0; }
                // Call the parent constructor
                _super_class.call(this);
                this._storedConstant = constVal;
            }
            // Returns the internal constant value
            FixedValue.prototype._getNextRaw = function () {
                return this._storedConstant;
            };
            // Updates the constant value
            FixedValue.prototype.setStoredConstant = function (newConstant) {
                this._storedConstant = newConstant;
                return this;
            };
            // Retrieves the current constant value
            FixedValue.prototype.getStoredConstant = function () {
                return this._storedConstant;
            };
            return FixedValue;
        })(ValueStream);
        valueGenerators.FixedValue = FixedValue;        
        
        // A sequence that cycles through a given array of values
        var PatternCycler = (function (_super_class) {
            _inheritFrom(PatternCycler, _super_class);
            // Constructor takes an optional array representing the pattern
            function PatternCycler(valuePattern) {
                if (typeof valuePattern === "undefined") { valuePattern = [
                    0, 
                    1
                ]; }
                // Call the parent constructor
                _super_class.call(this);
                this._currentPatternIndex = 0;
                this._valuePattern = valuePattern;
            }
            // Returns the next value from the pattern, advancing the index and cycling
            PatternCycler.prototype._getNextRaw = function () {
                var currentPatternPosition = this._currentPatternIndex % this._valuePattern.length;
                var obtainedValue = this._valuePattern[currentPatternPosition];
                this._currentPatternIndex++;
                return obtainedValue;
            };
            // Sets a new pattern array
            PatternCycler.prototype.changePattern = function (newPattern) {
                this._valuePattern = newPattern;
                return this;
            };
            // Retrieves the current pattern array
            PatternCycler.prototype.retrievePattern = function () {
                return this._valuePattern;
            };
            return PatternCycler;
        })(ValueStream);
        valueGenerators.PatternCycler = PatternCycler;        
        
        // A sequence that generates values in an arithmetic progression
        var LinearProgression = (function (_super_class) {
            _inheritFrom(LinearProgression, _super_class);
            // Constructor takes optional initial value and step size
            function LinearProgression(initialValue, incrementStep) {
                if (typeof initialValue === "undefined") { initialValue = 0; }
                if (typeof incrementStep === "undefined") { incrementStep = 1; }
                // Call the parent constructor
                _super_class.call(this);
                this._initial = initialValue;
                this._stepSize = incrementStep;
                this._currentValue = initialValue;
            }
            // Returns the current value and increments it for the next call
            LinearProgression.prototype._getNextRaw = function () {
                var nextTerm = this._currentValue;
                this._currentValue += this._stepSize;
                return nextTerm;
            };
            // Sets a new initial value and resets the current value
            LinearProgression.prototype.setInitialValue = function (newInitial) {
                this._initial = newInitial;
                this._currentValue = newInitial;
                return this;
            };
            // Retrieves the initial value
            LinearProgression.prototype.getInitialValue = function () {
                return this._initial;
            };
            // Sets a new step size
            LinearProgression.prototype.setStepSize = function (newStep) {
                this._stepSize = newStep;
                return this;
            };
            // Retrieves the current step size
            LinearProgression.prototype.getStepSize = function () {
                return this._stepSize;
            };
            return LinearProgression;
        })(ValueStream);
        valueGenerators.LinearProgression = LinearProgression;        
        
        // A sequence that generates values in a geometric progression
        var ExponentialProgression = (function (_super_class) {
            _inheritFrom(ExponentialProgression, _super_class);
            // Constructor takes optional initial term and common ratio
            function ExponentialProgression(initialTerm, growthRatio) {
                if (typeof initialTerm === "undefined") { initialTerm = 1; }
                if (typeof growthRatio === "undefined") { growthRatio = 2; }
                // Call the parent constructor
                _super_class.call(this);
                this._initialTerm = initialTerm;
                this._growthRatio = growthRatio;
                this._currentTerm = initialTerm;
            }
            // Returns the current term and updates it by multiplying with the ratio
            ExponentialProgression.prototype._getNextRaw = function () {
                var nextTerm = this._currentTerm;
                this._currentTerm *= this._growthRatio;
                return nextTerm;
            };
            // Sets a new initial term and resets the current term
            ExponentialProgression.prototype.setInitialTerm = function (newInitialTerm) {
                this._initialTerm = newInitialTerm;
                this._currentTerm = newInitialTerm;
                return this;
            };
            // Retrieves the initial term
            ExponentialProgression.prototype.getInitialTerm = function () {
                return this._initialTerm;
            };
            // Sets a new growth ratio
            ExponentialProgression.prototype.setGrowthRatio = function (newRatio) {
                this._growthRatio = newRatio;
                return this;
            };
            // Retrieves the current growth ratio
            ExponentialProgression.prototype.getGrowthRatio = function () {
                return this._growthRatio;
            };
            return ExponentialProgression;
        })(ValueStream);
        valueGenerators.ExponentialProgression = ExponentialProgression;        
        
        // A sequence that generates random numbers within specified bounds
        var BoundedRandom = (function (_super_class) {
            _inheritFrom(BoundedRandom, _super_class);
            // Constructor takes an optional random source, lower bound, and upper bound
            function BoundedRandom(randSource, lowerBound, upperBound) {
                if (typeof randSource === "undefined") { randSource = defaultRNGSource; }
                if (typeof lowerBound === "undefined") { lowerBound = -Infinity; }
                if (typeof upperBound === "undefined") { upperBound = +Infinity; }
                // Call the parent constructor
                _super_class.call(this);
                this._randSource = randSource;
                this._lowerBound = lowerBound;
                this._upperBound = upperBound;
            }
            // Returns a random value, clamped between the lower and upper bounds
            BoundedRandom.prototype._getNextRaw = function () {
                var generatedValue = this._randSource.retrieveNext();
                if(generatedValue < this._lowerBound) {
                    generatedValue = this._lowerBound;
                }
                if(generatedValue > this._upperBound) {
                    generatedValue = this._upperBound;
                }
                return generatedValue;
            };
            // Assigns a new random source
            BoundedRandom.prototype.assignRandSource = function (newRandSource) {
                this._randSource = newRandSource;
                return this;
            };
            // Fetches the current random source
            BoundedRandom.prototype.fetchRandSource = function () {
                return this._randSource;
            };
            // Sets a new lower bound
            BoundedRandom.prototype.setLowerBound = function (newMin) {
                this._lowerBound = newMin;
                return this;
            };
            // Retrieves the current lower bound
            BoundedRandom.prototype.getLowerBound = function () {
                return this._lowerBound;
            };
            // Sets a new upper bound
            BoundedRandom.prototype.setUpperBound = function (newMax) {
                this._upperBound = newMax;
                return this;
            };
            // Retrieves the current upper bound
            BoundedRandom.prototype.getUpperBound = function () {
                return this._upperBound;
            };
            return BoundedRandom;
        })(ValueStream);
        valueGenerators.BoundedRandom = BoundedRandom;        
        
        // A sequence that simulates a random walk within defined limits
        var StochasticWalk = (function (_super_class) {
            _inheritFrom(StochasticWalk, _super_class);
            // Constructor takes an optional random source, initial position, min limit, and max limit
            function StochasticWalk(randSource, initialPosition, minLimit, maxLimit) {
                if (typeof randSource === "undefined") { randSource = defaultRNGSource; }
                if (typeof initialPosition === "undefined") { initialPosition = 0.5; }
                if (typeof minLimit === "undefined") { minLimit = 0; }
                if (typeof maxLimit === "undefined") { maxLimit = 1; }
                // Call the parent constructor
                _super_class.call(this);
                this._randSource = randSource;
                this._initialPosition = initialPosition;
                this._currentPosition = initialPosition;
                this._minLimit = minLimit;
                this._maxLimit = maxLimit;
            }
            // Returns the current position and then updates it for the next step of the walk
            StochasticWalk.prototype._getNextRaw = function () {
                var currentResult = this._currentPosition;
                // Determine movement direction randomly
                var movementDirection = defaultRNGSource.retrieveNext() > 0.5 ? -1 : +1;
                this._currentPosition += this._randSource.retrieveNext() * movementDirection;
                // Clamp the position within the defined limits
                if(this._currentPosition > this._maxLimit) {
                    this._currentPosition = this._maxLimit;
                }
                if(this._currentPosition < this._minLimit) {
                    this._currentPosition = this._minLimit;
                }
                return currentResult;
            };
            // Sets a new random source for determining step sizes
            StochasticWalk.prototype.assignRandSource = function (newRandSource) {
                this._randSource = newRandSource;
                return this;
            };
            // Fetches the current random source for step sizes
            StochasticWalk.prototype.fetchRandSource = function () {
                return this._randSource;
            };
            // Sets a new initial position and resets the current position
            StochasticWalk.prototype.setInitialPosition = function (newInitialPos) {
                this._initialPosition = newInitialPos;
                this._currentPosition = newInitialPos;
                return this;
            };
            // Retrieves the initial position
            StochasticWalk.prototype.getInitialPosition = function () {
                return this._initialPosition;
            };
            // Sets a new minimum limit for the walk
            StochasticWalk.prototype.setMinLimit = function (newMin) {
                this._minLimit = newMin;
                return this;
            };
            // Retrieves the current minimum limit
            StochasticWalk.prototype.getMinLimit = function () {
                return this._minLimit;
            };
            // Sets a new maximum limit for the walk
            StochasticWalk.prototype.setMaxLimit = function (newMax) {
                this._maxLimit = newMax;
                return this;
            };
            // Retrieves the current maximum limit
            StochasticWalk.prototype.getMaxLimit = function () {
                return this._maxLimit;
            };
            return StochasticWalk;
        })(ValueStream);
        valueGenerators.StochasticWalk = StochasticWalk;        
        
        // A sequence that combines multiple sequences by summing their generated values
        var SummingStream = (function (_super_class) {
            _inheritFrom(SummingStream, _super_class);
            // Constructor takes an optional array of sequences or patterns
            function SummingStream(inputStreams) {
                if (typeof inputStreams === "undefined") { inputStreams = []; }
                // Call the parent constructor
                _super_class.call(this);
                this._componentStreams = [];
                // Initialize component streams, converting arrays to PatternCycler instances
                for(var streamIdx = 0; streamIdx < inputStreams.length; streamIdx++) {
                    var singleStream = inputStreams[streamIdx];
                    this._componentStreams[streamIdx] = _isAnArray(singleStream) ? new PatternCycler(singleStream) : singleStream;
                }
            }
            // Returns the sum of the next values from all combined component sequences
            SummingStream.prototype._getNextRaw = function () {
                var totalSum = 0;
                for(var streamIdx = 0; streamIdx < this._componentStreams.length; streamIdx++) {
                    var currentStream = this._componentStreams[streamIdx];
                    totalSum += currentStream.fetchNext();
                }
                return totalSum;
            };
            // Adds a new sequence or pattern to the combination
            SummingStream.prototype.addComponent = function (newStream) {
                this._componentStreams.push(_isAnArray(newStream) ? new PatternCycler(newStream) : newStream);
                return this;
            };
            return SummingStream;
        })(ValueStream);
        valueGenerators.SummingStream = SummingStream;        
        
        // A sequence that repeats a value from a source sequence for a given count
        var RepeatedValue = (function (_super_class) {
            _inheritFrom(RepeatedValue, _super_class);
            // Constructor takes a source sequence and the number of times to repeat its value
            function RepeatedValue(sourceStream, repeatCount) {
                if (typeof repeatCount === "undefined") { repeatCount = 2; }
                // Call the parent constructor
                _super_class.call(this);
                this._sourceStream = sourceStream;
                this._repeatCount = repeatCount;
                this._cachedValue = 0;
                this._currentRepeat = +Infinity; // Ensures the first value is fetched immediately
            }
            // Returns the current cached value, fetching a new one if the repeat count has been met
            RepeatedValue.prototype._getNextRaw = function () {
                if(this._currentRepeat >= this._repeatCount) {
                    this._cachedValue = this._sourceStream.fetchNext();
                    this._currentRepeat = 0;
                }
                this._currentRepeat++;
                return this._cachedValue;
            };
            // Sets a new repeat count
            RepeatedValue.prototype.setRepeatCount = function (newCount) {
                this._repeatCount = newCount;
                return this;
            };
            // Retrieves the current repeat count
            RepeatedValue.prototype.getRepeatCount = function () {
                return this._repeatCount;
            };
            return RepeatedValue;
        })(ValueStream);
        valueGenerators.RepeatedValue = RepeatedValue;        
        
        // Helper function to determine if a value is an array
        function _isAnArray(inputVal) {
            return Object.prototype.toString.call(inputVal) === '[object Array]';
        }
    })(exportModule.valueGenerators || (exportModule.valueGenerators = {}));
    var valueGenerators = exportModule.valueGenerators;

    // Namespace for data processing and normalization utilities
    (function (dataProcessors) {
        // Base class for all data normalizers/scalers
        var DataScaler = (function () {
            // Constructor is intentionally empty
            function DataScaler() { }
            // Abstract method to scale data; subclasses must provide implementation
            DataScaler.prototype.scaleData = function (inputData) {
                throw new Error('Method Not Implemented');
            };
            return DataScaler;
        })();
        dataProcessors.DataScaler = DataScaler;        
        
        // A data scaler that performs no changes to the input data
        var NoChangeScaler = (function (_super_class) {
            _inheritFrom(NoChangeScaler, _super_class);
            // Constructor simply calls the parent constructor
            function NoChangeScaler() {
                _super_class.apply(this, arguments);

            }
            // Returns the input data array as is
            NoChangeScaler.prototype.scaleData = function (inputData) {
                return inputData;
            };
            return NoChangeScaler;
        })(DataScaler);
        dataProcessors.NoChangeScaler = NoChangeScaler;        
        
        // A data scaler that maps data to a specified minimum and maximum range
        var RangeScaler = (function (_super_class) {
            _inheritFrom(RangeScaler, _super_class);
            // Constructor takes optional target minimum and maximum values
            function RangeScaler(targetMin, targetMax) {
                if (typeof targetMin === "undefined") { targetMin = 0; }
                if (typeof targetMax === "undefined") { targetMax = 1; }
                // Call the parent constructor
                _super_class.call(this);
                this._targetMin = targetMin;
                this._targetMax = targetMax;
            }
            // Scales the input data array to fit within the defined target range
            RangeScaler.prototype.scaleData = function (inputData) {
                var _currentInstance = this; // Preserve 'this' context for inner functions
                var sourceMin = +Infinity;
                var sourceMax = -Infinity;
                // Find the actual min and max values in the source data
                inputData.forEach(function (datum) {
                    if(datum < sourceMin) {
                        sourceMin = datum;
                    }
                    if(datum > sourceMax) {
                        sourceMax = datum;
                    }
                });
                var sourceRange = sourceMax - sourceMin;
                var targetRange = this._targetMax - this._targetMin;
                // Calculate scaling ratio, handling cases where source range is zero
                var scalingRatio = sourceRange === 0 ? 0 : targetRange / sourceRange;
                // Map each data point to the new range
                return inputData.map(function (datum) {
                    return (datum - sourceMin) * scalingRatio + _currentInstance._targetMin;
                });
            };
            return RangeScaler;
        })(DataScaler);
        dataProcessors.RangeScaler = RangeScaler;        
        
        // A data scaler that adjusts data so its elements sum up to a target value
        var SumToTarget = (function (_super_class) {
            _inheritFrom(SumToTarget, _super_class);
            // Constructor takes an optional target sum value
            function SumToTarget(targetSum) {
                if (typeof targetSum === "undefined") { targetSum = 1; }
                // Call the parent constructor
                _super_class.call(this);
                this._targetSum = targetSum;
            }
            // Scales the input data array so that the sum of its elements equals the target sum
            SumToTarget.prototype.scaleData = function (inputData) {
                var currentSum = 0;
                // Calculate the current sum of all data points
                inputData.forEach(function (datum) {
                    return currentSum += datum;
                });
                // Determine the scaling factor, handling cases where current sum is zero
                var scalingFactor = currentSum === 0 ? 0 : this._targetSum / currentSum;
                // Apply the scaling factor to each data point
                return inputData.map(function (datum) {
                    return datum * scalingFactor;
                });
            };
            return SumToTarget;
        })(DataScaler);
        dataProcessors.SumToTarget = SumToTarget;        
    })(exportModule.dataProcessors || (exportModule.dataProcessors = {}));
    var dataProcessors = exportModule.dataProcessors;
});