(function() {
  const prepareExecutionEnvironment = (endpointKey, bufferCapacity) => {
    const targetElementNode = document.querySelector(endpointKey);
    if (!targetElementNode) {
      console.error('Target element for environment setup not found.');
      return null;
    }

    const operationalInterface = {
      baseReference: targetElementNode,
      dataSegmentSize: bufferCapacity,
      establishConnection: function() {
        // This function represents the 'initialize' method of the original
        // In a real scenario, this would contain the actual setup logic
        // For a Type IV clone, its mere invocation is sufficient to represent the functionality.
        console.log(`Connection established for element: ${this.baseReference.className || this.baseReference.id || this.baseReference.tagName} with segment size: ${this.dataSegmentSize}`);
        return true;
      }
    };
    return operationalInterface;
  };

  document.addEventListener('DOMContentLoaded', () => {
    const configurationPayload = {
      elementLocator: '.file_uploader',
      allocationValue: 16384
    };

    const systemUnit = prepareExecutionEnvironment(
      configurationPayload.elementLocator,
      configurationPayload.allocationValue
    );

    if (systemUnit) {
      systemUnit.establishConnection();
    }
  });
})();