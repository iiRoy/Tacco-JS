function buildComponentFunctions(componentState) {

  const dispatchControlSignal = (signalType, additionalPayload = {}) => {
    if (connectionHub) {
      connectionHub.emit('relayAction', {
        "unit": componentState.hostIdentifier,
        "deviceTag": componentState.componentLabel,
        "operation": signalType,
        ...additionalPayload
      });
    }
  };

  const normalizeAndClamp = (inputVal, minInput, maxInput, invertFlag) => {
    let proportion = (inputVal - minInput) / (maxInput - minInput);
    proportion = Math.max(0, Math.min(1, proportion));
    return invertFlag ? (1 - proportion) : proportion;
  };

  const scaleOutput = (normalizedVal, minOutput, maxOutput) => {
    return normalizedVal * (maxOutput - minOutput) + minOutput;
  };

  const processActuatorAdjustment = (incomingMeasurement) => {
    let currentInputSource;

    if (incomingMeasurement === null || typeof incomingMeasurement === 'undefined') {
      currentInputSource = Number(document.getElementById(componentState.componentLabel).value);
    } else {
      currentInputSource = incomingMeasurement;
    }

    const normalizedInput = normalizeAndClamp(
      currentInputSource,
      componentState.rangeMinInput,
      componentState.rangeMaxInput,
      componentState.invertedRange
    );

    let preEasedOutput = scaleOutput(
      normalizedInput,
      componentState.outputMinimumValue,
      componentState.outputMaximumValue
    );

    const renderValue = preEasedOutput;

    if (componentState.easingFunctionKey && motionTransforms && typeof motionTransforms[componentState.easingFunctionKey] === 'function') {
      preEasedOutput = motionTransforms[componentState.easingFunctionKey](preEasedOutput);
    }

    const numericThreshold = Number(componentState.deltaThreshold);
    const absoluteDifference = Math.abs(preEasedOutput - componentState.lastKnownValue);

    if (
      connectionHub &&
      unitRegistry[componentState.hostIdentifier] &&
      unitRegistry[componentState.hostIdentifier].isReady &&
      numericThreshold <= absoluteDifference
    ) {
      componentState.lastKnownValue = preEasedOutput;
      dispatchControlSignal('setActuatorValue', { payload: preEasedOutput });
    }

    componentState.updateVisualState(renderValue);
  };

  return {
    enableComponent: () => {
      dispatchControlSignal('enableComponent');
      componentState.updateVisualState(true);
    },
    disableComponent: () => {
      dispatchControlSignal('disableComponent');
      componentState.updateVisualState(false);
    },
    setActuatorValue: processActuatorAdjustment
  };
}