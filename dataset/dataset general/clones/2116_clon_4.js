const processingRoutines = {
  executePass: (visualSchema, onward) => onward(null, visualSchema)
};

const establishPipeline = (sourceManifest) => {
  const currentContext = {
    sourceID: sourceManifest,
    initializedAt: Date.now(),
  };

  const invokeTransformer = (displayConfiguration, proceedWith) => {
    return processingRoutines.executePass(displayConfiguration, proceedWith);
  };

  return invokeTransformer;
};