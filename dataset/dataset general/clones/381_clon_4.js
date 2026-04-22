(function (globalScope) {
    // This library assumes the existence of a global 'SourceRandom' constructor,
    // which functions similarly to a random number generator library.
    // It is expected to have methods like:
    // - new SourceRandom(optionalSeed)
    // - instance.random(): returns a uniform random number
    // - instance.normal(mean, stdDev): returns a normally distributed random number
    // - instance.pareto(alpha): returns a Pareto distributed random number

    const libraryIdentifier = {};

    libraryIdentifier.currentVersion = '0.2.0';

    // --- Value Generators (formerly rngs) ---
    // These objects produce individual random or sequential values.
    (function (destContainer) {
        const standardSourceInstance = new SourceRandom();

        const createFixedSequenceGenerator = (initialValues) => {
            let currentPattern = initialValues;
            let currentPosition = 0;

            const obtainNext = () => {
                const acquired = currentPattern[currentPosition % currentPattern.length];
                currentPosition++;
                return acquired;
            };

            return {
                obtainNext
            };
        };

        const createUniformValueGenerator = (seedInput) => {
            const underlyingSource = seedInput !== undefined ? new SourceRandom(seedInput) : standardSourceInstance;

            const obtainNext = () => {
                return underlyingSource.random();
            };

            return {
                obtainNext
            };
        };

        const createNormalDistributionGenerator = (meanParam, stdDevParam) => {
            const underlyingSource = standardSourceInstance;
            let currentMean = meanParam;
            let currentStdDev = stdDevParam;

            const obtainNext = () => {
                return underlyingSource.normal(currentMean, currentStdDev);
            };

            return {
                obtainNext
            };
        };

        const createParetoDistributionGenerator = (alphaParam) => {
            const underlyingSource = standardSourceInstance;
            let currentAlpha = alphaParam;

            const obtainNext = () => {
                return underlyingSource.pareto(currentAlpha);
            };

            return {
                obtainNext
            };
        };

        destContainer.fixedSequence = createFixedSequenceGenerator;
        destContainer.uniformValue = createUniformValueGenerator;
        destContainer.normalDistribution = createNormalDistributionGenerator;
        destContainer.paretoDistribution = createParetoDistributionGenerator;

    })(libraryIdentifier.valueGenerators = libraryIdentifier.valueGenerators || {});

    // --- Value Streams (formerly seqs) ---
    // These objects produce sequences of values, often with transformations.
    (function (destContainer) {
        const defaultUniformSource = libraryIdentifier.valueGenerators.uniformValue();

        const isArrayType = (value) => Object.prototype.toString.call(value) === '[object Array]';

        // A factory for the common stream interface, managing mapping and collection generation.
        const constructStreamBase = (nextRawValueProducer) => {
            let valueMapper = (n) => n;

            const pullTransformedValue = () => {
                return valueMapper(nextRawValueProducer());
            };

            const generateCollection = (count, dataProcessor = libraryIdentifier.dataModifiers.identityProcessor()) => {
                const gatheredData = Array.from({
                    length: count
                }, pullTransformedValue);
                return dataProcessor.processCollection(gatheredData);
            };

            const assignMapper = (newMapFunc) => {
                valueMapper = newMapFunc;
                return streamInstance;
            };

            const retrieveMapper = () => {
                return valueMapper;
            };

            const streamInstance = {
                pullTransformedValue,
                generateCollection,
                assignMapper,
                retrieveMapper
            };
            return streamInstance;
        };

        const createConstantValueStream = (value = 0) => {
            let storedConstant = value;

            const nextRawValue = () => storedConstant;

            const stream = constructStreamBase(nextRawValue);

            stream.setConstant = (newValue) => {
                storedConstant = newValue;
                return stream;
            };
            stream.getConstant = () => storedConstant;

            return stream;
        };

        const createCyclingPatternStream = (pattern = [0, 1]) => {
            let currentPattern = pattern;
            let currentIndex = 0;

            const nextRawValue = () => {
                const result = currentPattern[currentIndex % currentPattern.length];
                currentIndex++;
                return result;
            };

            const stream = constructStreamBase(nextRawValue);

            stream.setPattern = (newPattern) => {
                currentPattern = newPattern;
                return stream;
            };
            stream.getPattern = () => currentPattern;

            return stream;
        };

        const createArithmeticProgressionStream = (initialTerm = 0, commonDifference = 1) => {
            let startingTerm = initialTerm;
            let diff = commonDifference;
            let currentTerm = initialTerm;

            const nextRawValue = () => {
                const result = currentTerm;
                currentTerm += diff;
                return result;
            };

            const stream = constructStreamBase(nextRawValue);

            stream.setStartingTerm = (newStart) => {
                startingTerm = newStart;
                currentTerm = newStart;
                return stream;
            };
            stream.getStartingTerm = () => startingTerm;

            stream.setCommonDifference = (newDiff) => {
                diff = newDiff;
                return stream;
            };
            stream.getCommonDifference = () => diff;

            return stream;
        };

        const createGeometricProgressionStream = (initialTerm = 1, commonRatio = 2) => {
            let startingTerm = initialTerm;
            let ratio = commonRatio;
            let currentTerm = initialTerm;

            const nextRawValue = () => {
                const result = currentTerm;
                currentTerm *= ratio;
                return result;
            };

            const stream = constructStreamBase(nextRawValue);

            stream.setStartingTerm = (newStart) => {
                startingTerm = newStart;
                currentTerm = newStart;
                return stream;
            };
            stream.getStartingTerm = () => startingTerm;

            stream.setCommonRatio = (newRatio) => {
                ratio = newRatio;
                return stream;
            };
            stream.getCommonRatio = () => ratio;

            return stream;
        };

        const createBoundedRandomStream = (sourceGenerator = defaultUniformSource, minLimit = -Infinity, maxLimit = +Infinity) => {
            let underlyingGenerator = sourceGenerator;
            let minimumBoundary = minLimit;
            let maximumBoundary = maxLimit;

            const nextRawValue = () => {
                let result = underlyingGenerator.obtainNext();
                if (result < minimumBoundary) {
                    result = minimumBoundary;
                }
                if (result > maximumBoundary) {
                    result = maximumBoundary;
                }
                return result;
            };

            const stream = constructStreamBase(nextRawValue);

            stream.setSource = (newGen) => {
                underlyingGenerator = newGen;
                return stream;
            };
            stream.getSource = () => underlyingGenerator;

            stream.setMinBoundary = (newMin) => {
                minimumBoundary = newMin;
                return stream;
            };
            stream.getMinBoundary = () => minimumBoundary;

            stream.setMaxBoundary = (newMax) => {
                maximumBoundary = newMax;
                return stream;
            };
            stream.getMaxBoundary = () => maximumBoundary;

            return stream;
        };

        const createStochasticPathStream = (sourceGenerator = defaultUniformSource, initialPosition = 0.5, lowerBound = 0, upperBound = 1) => {
            let underlyingGenerator = sourceGenerator;
            let startPoint = initialPosition;
            let currentPoint = initialPosition;
            let minBoundary = lowerBound;
            let maxBoundary = upperBound;
            const directionDecider = libraryIdentifier.valueGenerators.uniformValue();

            const nextRawValue = () => {
                const result = currentPoint;
                const stepDirection = directionDecider.obtainNext() > 0.5 ? -1 : +1;
                currentPoint += underlyingGenerator.obtainNext() * stepDirection;

                if (currentPoint > maxBoundary) {
                    currentPoint = maxBoundary;
                }
                if (currentPoint < minBoundary) {
                    currentPoint = minBoundary;
                }
                return result;
            };

            const stream = constructStreamBase(nextRawValue);

            stream.setSource = (newGen) => {
                underlyingGenerator = newGen;
                return stream;
            };
            stream.getSource = () => underlyingGenerator;

            stream.setStartPoint = (newStart) => {
                startPoint = newStart;
                currentPoint = newStart;
                return stream;
            };
            stream.getStartPoint = () => startPoint;

            stream.setMinBoundary = (newMin) => {
                minBoundary = newMin;
                return stream;
            };
            stream.getMinBoundary = () => minBoundary;

            stream.setMaxBoundary = (newMax) => {
                maxBoundary = newMax;
                return stream;
            };
            stream.getMaxBoundary = () => maxBoundary;

            return stream;
        };

        const createCombinedStreamsAggregator = (inputSequences = []) => {
            const activeSequences = inputSequences.map(s => isArrayType(s) ? createCyclingPatternStream(s) : s);

            const nextRawValue = () => {
                return activeSequences.reduce((total, seq) => total + seq.pullTransformedValue(), 0);
            };

            const stream = constructStreamBase(nextRawValue);

            stream.addSequence = (seqToAdd) => {
                activeSequences.push(isArrayType(seqToAdd) ? createCyclingPatternStream(seqToAdd) : seqToAdd);
                return stream;
            };

            return stream;
        };

        const createRepeatedValueEmitter = (innerSource, repeatCount = 2) => {
            let internalSource = innerSource;
            let repetitionLimit = repeatCount;
            let storedValue;
            let currentRepetition = Infinity;

            const nextRawValue = () => {
                if (currentRepetition >= repetitionLimit) {
                    storedValue = internalSource.pullTransformedValue();
                    currentRepetition = 0;
                }
                currentRepetition++;
                return storedValue;
            };

            const stream = constructStreamBase(nextRawValue);

            stream.setRepeatCount = (newCount) => {
                repetitionLimit = newCount;
                return stream;
            };
            stream.getRepeatCount = () => repetitionLimit;

            return stream;
        };


        destContainer.constantValue = createConstantValueStream;
        destContainer.cyclingPattern = createCyclingPatternStream;
        destContainer.arithmeticProgression = createArithmeticProgressionStream;
        destContainer.geometricProgression = createGeometricProgressionStream;
        destContainer.boundedRandom = createBoundedRandomStream;
        destContainer.stochasticPath = createStochasticPathStream;
        destContainer.combinedStreams = createCombinedStreamsAggregator;
        destContainer.repeatedValue = createRepeatedValueEmitter;

    })(libraryIdentifier.valueStreams = libraryIdentifier.valueStreams || {});

    // --- Data Modifiers (formerly norms) ---
    // These objects process arrays of numbers, e.g., for normalization.
    (function (destContainer) {

        const createIdentityProcessor = () => {
            const processCollection = (inputData) => {
                return inputData;
            };
            return {
                processCollection
            };
        };

        const createRangeScaler = (targetMin = 0, targetMax = 1) => {
            let outputMin = targetMin;
            let outputMax = targetMax;

            const processCollection = (inputData) => {
                if (!inputData || inputData.length === 0) return [];

                const {
                    min: sourceMin,
                    max: sourceMax
                } = inputData.reduce((acc, d) => ({
                    min: Math.min(acc.min, d),
                    max: Math.max(acc.max, d)
                }), {
                    min: Infinity,
                    max: -Infinity
                });

                const sourceRange = sourceMax - sourceMin;
                const outputRange = outputMax - outputMin;

                if (sourceRange === 0) {
                    const midOutput = (outputMin + outputMax) / 2;
                    return inputData.map(() => midOutput);
                }

                const scalingFactor = outputRange / sourceRange;

                return inputData.map(d => (d - sourceMin) * scalingFactor + outputMin);
            };

            return {
                processCollection
            };
        };

        const createSumAdjuster = (targetSum = 1) => {
            let desiredTotal = targetSum;

            const processCollection = (inputData) => {
                if (!inputData || inputData.length === 0) return [];

                const currentTotal = inputData.reduce((sum, d) => sum + d, 0);

                if (currentTotal === 0) {
                    return inputData.map(() => 0);
                }

                const adjustmentRatio = desiredTotal / currentTotal;
                return inputData.map(d => d * adjustmentRatio);
            };

            return {
                processCollection
            };
        };

        destContainer.identityProcessor = createIdentityProcessor;
        destContainer.rangeScaler = createRangeScaler;
        destContainer.sumAdjuster = createSumAdjuster;

    })(libraryIdentifier.dataModifiers = libraryIdentifier.dataModifiers || {});

    globalScope.DataFlowLibrary = libraryIdentifier;

})(typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : this);