"use strict";

(function () {
  function obtainNumericSequence(sourceValue) {
    return sourceValue.match(/\d+/g).map(Number);
  }

  function processSystemInput(rawText) {
    const allTextLines = rawText.split('\n');

    const initialParameters = obtainNumericSequence(allTextLines[0]);
    const totalDevices = initialParameters[0];
    const totalCircuits = initialParameters[1];

    const circuitSpecifications = [];
    for (let circuitIndex = 0; circuitIndex < totalCircuits; circuitIndex++) {
      const currentCircuitData = obtainNumericSequence(allTextLines[circuitIndex + 1]);
      const connectedComponentReferences = currentCircuitData.slice(1);
      circuitSpecifications.push({
        componentReferences: connectedComponentReferences,
        circuitIdentifier: circuitIndex
      });
    }

    const requiredOutputParities = obtainNumericSequence(allTextLines[totalCircuits + 1]);

    let successfulConfigurationsFound = 0;

    function exploreDeviceStates(currentDeviceIndex, currentDeviceStates) {
      if (currentDeviceIndex === totalDevices) {
        const arrangementIsValid = circuitSpecifications.every(circuit => {
          const activatedComponentCount = circuit.componentReferences.filter(componentRef =>
            currentDeviceStates[componentRef - 1] === 1
          ).length;
          return (activatedComponentCount % 2) === requiredOutputParities[circuit.circuitIdentifier];
        });

        if (arrangementIsValid) {
          successfulConfigurationsFound++;
        }
        return;
      }

      exploreDeviceStates(currentDeviceIndex + 1, currentDeviceStates.concat(0));

      exploreDeviceStates(currentDeviceIndex + 1, currentDeviceStates.concat(1));
    }

    exploreDeviceStates(0, []);

    console.log(successfulConfigurationsFound);
  }

  processSystemInput(require("fs").readFileSync("/dev/stdin", "utf8"));
})();