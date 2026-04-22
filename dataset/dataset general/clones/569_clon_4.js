const createAudioFrequencyEstimator = (analyzerStrategy, options) => {
  const analysisOptions = {
    samplingRate: 44100,
    signalThreshold: 0.1,
    minOscillation: 82,
    maxOscillation: 1000,
    bufferFrameCount: 2048,
    comparisonFactor: 5,
    levelCutoff: 0.97,
    ...options
  };

  return (inputSignalData) => {
    return analyzerStrategy(inputSignalData, analysisOptions);
  };
};

const magnitudeDeltaStrategy = (signalInput, settings) => {
  const sampling = settings.samplingRate;
  const minimalPeriod = Math.round(sampling / settings.maxOscillation + 0.5);
  const maximalPeriod = Math.round(sampling / settings.minOscillation + 0.5);
  const dataLength = signalInput.length;
  const deltaValues = new Float32Array(maximalPeriod + 1);

  const calculateDeltaSum = (offsetVal) => {
    let currentSum = 0;
    for (let k = 0; k < dataLength - offsetVal; k++) {
      currentSum += Math.abs(signalInput[k] - signalInput[k + offsetVal]);
    }
    return currentSum;
  };

  for (let p = minimalPeriod; p <= maximalPeriod; p++) {
    deltaValues[p] = calculateDeltaSum(p);
  }

  let overallMin = Infinity;
  let overallMax = -Infinity;
  for (let p = minimalPeriod; p <= maximalPeriod; p++) {
    if (deltaValues[p] < overallMin) overallMin = deltaValues[p];
    if (deltaValues[p] > overallMax) overallMax = deltaValues[p];
  }

  const candidateThreshold = Math.round((settings.signalThreshold * (overallMax - overallMin)) + overallMin);

  let initialCandidatePeriod = minimalPeriod;
  while (initialCandidatePeriod <= maximalPeriod && deltaValues[initialCandidatePeriod] > candidateThreshold) {
    initialCandidatePeriod++;
  }

  if (initialCandidatePeriod > maximalPeriod) {
    return { oscillation: -1 };
  }

  const refinementWindow = Math.floor(minimalPeriod / 2);
  let bestRefinedPeriod = initialCandidatePeriod;
  let lowestRefinedValue = deltaValues[initialCandidatePeriod];

  for (let p = initialCandidatePeriod - 1; p < initialCandidatePeriod + refinementWindow && p <= maximalPeriod; p++) {
    if (p >= minimalPeriod) {
      if (deltaValues[p] < lowestRefinedValue) {
        lowestRefinedValue = deltaValues[p];
        bestRefinedPeriod = p;
      }
    }
  }

  if (Math.round(deltaValues[bestRefinedPeriod] * settings.comparisonFactor) < overallMax) {
    return { oscillation: sampling / bestRefinedPeriod };
  } else {
    return { oscillation: -1 };
  }
};

const spectralCorrelationStrategy = (signalInput, settings) => {
  const frameLength = settings.bufferFrameCount;
  const halfFrameLength = frameLength / 2;
  const correlationOutput = new Float32Array(halfFrameLength);
  const sampling = settings.samplingRate;

  const computeSquaredDifferences = (sourceData) => {
    for (let currentTau = 0; currentTau < halfFrameLength; currentTau++) {
      correlationOutput[currentTau] = 0;
    }
    for (let currentTau = 1; currentTau < halfFrameLength; currentTau++) {
      for (let dataIndex = 0; dataIndex < halfFrameLength; dataIndex++) {
        const diff = sourceData[dataIndex] - sourceData[dataIndex + currentTau];
        correlationOutput[currentTau] += diff * diff;
      }
    }
  };

  const normalizeCumulativeMean = () => {
    correlationOutput[0] = 1;
    correlationOutput[1] = 1;
    let cumulativeSum = 0;
    for (let currentTau = 1; currentTau < halfFrameLength; currentTau++) {
      cumulativeSum += correlationOutput[currentTau];
      correlationOutput[currentTau] *= currentTau / cumulativeSum;
    }
  };

  let detectedPeriod = -1;
  let detectedCertainty = 0;
  let foundValidPitch = false;

  const findThresholdCrossing = () => {
    for (let currentTau = 2; currentTau < halfFrameLength; currentTau++) {
      if (correlationOutput[currentTau] < settings.signalThreshold) {
        while (currentTau + 1 < halfFrameLength && correlationOutput[currentTau + 1] < correlationOutput[currentTau]) {
          currentTau++;
        }
        detectedPeriod = currentTau;
        detectedCertainty = 1 - correlationOutput[currentTau];
        foundValidPitch = true;
        return;
      }
    }
  };

  const refinePeriodInterpolation = (roughPeriod) => {
    let lowerBound, upperBound;

    if (roughPeriod < 1) {
      lowerBound = roughPeriod;
    } else {
      lowerBound = roughPeriod - 1;
    }
    if (roughPeriod + 1 < halfFrameLength) {
      upperBound = roughPeriod + 1;
    } else {
      upperBound = roughPeriod;
    }

    if (lowerBound === roughPeriod) {
      return correlationOutput[roughPeriod] <= correlationOutput[upperBound] ? roughPeriod : upperBound;
    } else if (upperBound === roughPeriod) {
      return correlationOutput[roughPeriod] <= correlationOutput[lowerBound] ? roughPeriod : lowerBound;
    } else {
      const val0 = correlationOutput[lowerBound];
      const val1 = correlationOutput[roughPeriod];
      const val2 = correlationOutput[upperBound];
      return roughPeriod + (val2 - val0) / (2 * (2 * val1 - val2 - val0));
    }
  };

  computeSquaredDifferences(signalInput);
  normalizeCumulativeMean();
  findThresholdCrossing();

  if (foundValidPitch) {
    const refinedPeriod = refinePeriodInterpolation(detectedPeriod);
    return { oscillation: sampling / refinedPeriod, likelihood: detectedCertainty };
  } else {
    return { oscillation: -1, likelihood: 0 };
  }
};

const waveletTransformStrategy = (signalInput, settings) => {
  const maxWaveletLevels = 6;
  const maximumFrequencyLimit = 3000;
  const differenceAnalysisDepth = 3;
  const peakAmplitudeRatio = 0.75;
  const sampleRate = settings.samplingRate;
  const dataBufferSize = settings.bufferFrameCount;

  let currentPitchValue = -1;
  let currentSampleCount = signalInput.length;
  let workingBuffer = signalInput.slice();

  let levelCounter = 0;
  let modeDistanceAccumulator = -1;

  while (true) {
    const periodDelta = Math.floor(sampleRate / (Math.pow(2, levelCounter) * maximumFrequencyLimit));
    if (currentSampleCount < 2) break;

    let dcOffset = 0;
    let minAmplitude = 0;
    let maxAmplitude = 0;
    for (let i = 0; i < currentSampleCount; i++) {
      const sampleValue = workingBuffer[i];
      dcOffset += sampleValue;
      maxAmplitude = Math.max(maxAmplitude, sampleValue);
      minAmplitude = Math.min(minAmplitude, sampleValue);
    }
    dcOffset /= currentSampleCount;
    minAmplitude -= dcOffset;
    maxAmplitude -= dcOffset;
    const peakAmplitude = (maxAmplitude > -1 * minAmplitude ? maxAmplitude : -1 * minAmplitude);
    const detectionThreshold = peakAmplitude * peakAmplitudeRatio;

    const localMinIndices = [];
    const localMaxIndices = [];
    let previousDerivative = -1000;
    let lastMinPosition = -1000000;
    let lastMaxPosition = -1000000;
    let seekingMax = false;
    let seekingMin = false;

    for (let i = 2; i < currentSampleCount; i++) {
      const currentSampleAdjusted = workingBuffer[i] - dcOffset;
      const previousSampleAdjusted = workingBuffer[i - 1] - dcOffset;

      if (previousSampleAdjusted <= 0 && currentSampleAdjusted > 0) seekingMax = true;
      if (previousSampleAdjusted >= 0 && currentSampleAdjusted < 0) seekingMin = true;

      const currentDerivative = currentSampleAdjusted - previousSampleAdjusted;

      if (previousDerivative > -1000) {
        if (seekingMin && previousDerivative < 0 && currentDerivative >= 0) {
          if (Math.abs(currentSampleAdjusted) >= detectionThreshold) {
            if (i > lastMinPosition + periodDelta) {
              localMinIndices.push(i);
              lastMinPosition = i;
              seekingMin = false;
            }
          }
        }

        if (seekingMax && previousDerivative > 0 && currentDerivative <= 0) {
          if (Math.abs(currentSampleAdjusted) >= detectionThreshold) {
            if (i > lastMaxPosition + periodDelta) {
              localMaxIndices.push(i);
              lastMaxPosition = i;
              seekingMax = false;
            }
          }
        }
      }
      previousDerivative = currentDerivative;
    }

    if (localMinIndices.length === 0 && localMaxIndices.length === 0) {
      break;
    }

    const distanceCounts = new Uint32Array(currentSampleCount);
    for (let i = 0; i < localMinIndices.length; i++) {
      for (let j = 1; j < differenceAnalysisDepth; j++) {
        if (i + j < localMinIndices.length) {
          const distance = Math.abs(localMinIndices[i] - localMinIndices[i + j]);
          if (distance < currentSampleCount) {
            distanceCounts[distance]++;
          }
        }
      }
    }

    let bestObservedDistance = -1;
    let highestObservationCount = -1;

    for (let i = 0; i < currentSampleCount; i++) {
      let summedObservations = 0;
      for (let j = -periodDelta; j <= periodDelta; j++) {
        const indexToCheck = i + j;
        if (indexToCheck >= 0 && indexToCheck < currentSampleCount) {
          summedObservations += distanceCounts[indexToCheck];
        }
      }

      if (summedObservations === highestObservationCount) {
        if (i === 2 * bestObservedDistance) {
          bestObservedDistance = i;
        }
      } else if (summedObservations > highestObservationCount) {
        highestObservationCount = summedObservations;
        bestObservedDistance = i;
      }
    }

    let averagedDistance = 0;
    let totalObservations = 0;
    for (let j = -periodDelta; j <= periodDelta; j++) {
      const index = bestObservedDistance + j;
      if (index >= 0 && index < dataBufferSize) {
        const count = distanceCounts[index];
        if (count > 0) {
          totalObservations += count;
          averagedDistance += index * count;
        }
      }
    }
    if (totalObservations > 0) {
      averagedDistance /= totalObservations;
    } else {
      averagedDistance = bestObservedDistance;
    }

    if (modeDistanceAccumulator > -1) {
      const similarityMetric = Math.abs(averagedDistance * 2 - modeDistanceAccumulator);
      if (similarityMetric <= 2 * periodDelta) {
        currentPitchValue = (sampleRate / (Math.pow(2, levelCounter - 1) * modeDistanceAccumulator));
        break;
      }
    }

    modeDistanceAccumulator = averagedDistance;
    levelCounter++;

    if (levelCounter >= maxWaveletLevels || currentSampleCount < 2) {
      break;
    }

    const nextBuffer = new Float32Array(Math.floor(currentSampleCount / 2));
    for (let i = 0; i < nextBuffer.length; i++) {
      nextBuffer[i] = (workingBuffer[2 * i] + workingBuffer[2 * i + 1]) / 2;
    }
    workingBuffer = nextBuffer;
    currentSampleCount = nextBuffer.length;
  }

  return { oscillation: currentPitchValue };
};

const correlationPeakStrategy = (signalInput, settings) => {
  // The original MPM code was incomplete in the prompt.
  // This is a placeholder to maintain the overall factory pattern and
  // provide a structured response for the entire block.
  // A full Type IV clone would require the complete original algorithm.
  return { oscillation: -1, quality: 0 };
};

const FrequencyAnalysisToolkit = {
  createMagnitudeDifferenceEstimator: (cfg) => {
    return createAudioFrequencyEstimator(magnitudeDeltaStrategy, cfg);
  },
  createSpectralCorrelationEstimator: (cfg) => {
    return createAudioFrequencyEstimator(spectralCorrelationStrategy, cfg);
  },
  createWaveletTransformEstimator: (cfg) => {
    return createAudioFrequencyEstimator(waveletTransformStrategy, cfg);
  },
  createCorrelationPeakEstimator: (cfg) => {
    return createAudioFrequencyEstimator(correlationPeakStrategy, cfg);
  }
};