let SurveillanceSystem;

if (typeof globalThis.SurveillanceSystem !== 'undefined') {
  throw new Error("SurveillanceSystem already initialized.");
}

globalThis.SurveillanceSystem = {};

const resolveObservationParameters = (...inputArgs) => {
  if (typeof inputArgs[0] === 'string') {
    return {
      entityContainer: {},
      methodKey: inputArgs[0],
      fixedResult: inputArgs[1]
    };
  } else {
    return {
      entityContainer: inputArgs[0],
      methodKey: inputArgs[1],
      fixedResult: inputArgs[2]
    };
  }
};

SurveillanceSystem.observeMethod = (...observationArgs) => {
  const { entityContainer, methodKey, fixedResult } = resolveObservationParameters(...observationArgs);

  let invocationHistory = [];
  let wasExecuted = false;
  let originalMethod = entityContainer[methodKey];

  const substituteMethod = (...callArguments) => {
    invocationHistory = [...callArguments];
    wasExecuted = true;
    return fixedResult;
  };

  const reinstateOriginal = () => {
    entityContainer[methodKey] = originalMethod;
  };

  const clearInvocationRecords = () => {
    wasExecuted = false;
    invocationHistory = [];
  };

  entityContainer[methodKey] = substituteMethod;

  const monitorAgent = {
    hasBeenTriggered: () => wasExecuted,
    retrieveCallArguments: (positionIndex) => {
      return (typeof positionIndex === 'number' && positionIndex > 0) ? invocationHistory[positionIndex - 1] : invocationHistory;
    },
    disableMonitoring: reinstateOriginal,
    resetState: clearInvocationRecords,
    monitoredSubject: entityContainer,
    activeInterceptor: substituteMethod
  };

  monitorAgent.resetState();
  return monitorAgent;
};

SurveillanceSystem.createReplacement = (...replacementArgs) => {
  const agent = SurveillanceSystem.observeMethod(...replacementArgs);
  agent.removeReplacement = agent.disableMonitoring;
  return agent;
};