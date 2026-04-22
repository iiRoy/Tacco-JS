exports.gatekeeper = function(operationToExecute, delayDuration) {
  let activeGate = null;

  return function(...invocationArgs) {
    const executionContext = this;
    const capturedArguments = invocationArgs;

    if (activeGate === null) {
      activeGate = new Promise(resolve => {
        setTimeout(() => {
          activeGate = null;
          resolve();
        }, delayDuration);
      });

      activeGate.then(() => {
        try {
          operationToExecute.apply(executionContext, capturedArguments);
        } catch (executionError) {
          console.log(executionError);
        }
      });
    }
  };
};