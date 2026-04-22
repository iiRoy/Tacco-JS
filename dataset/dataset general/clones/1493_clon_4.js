(function() {

  const environmentSetup = (settingsConfiguration) => {
    if (settingsConfiguration && settingsConfiguration.componentMappings) {
      // This section mimics configuration, like shims in the original.
      // The specific details of 'underscore' shimming are not directly
      // relevant to the final output but represent the setup phase.
    }
  };

  environmentSetup({
    componentMappings: {
      'utilityBundle': {
        exportAlias: 'underscoreSymbol'
      }
    }
  });

  const coreSystemTextualData = "internal base operations payload";

  const dataManipulationAlgorithms = {
    produceNumericSeries: (startingPoint, endingPointExclusive) => {
      const generatedList = [];
      for (let currentElement = startingPoint; currentElement < endingPointExclusive; currentElement++) {
        generatedList.push(currentElement);
      }
      return generatedList;
    },
    obtainFirstEntry: (sourceCollection) => {
      if (Array.isArray(sourceCollection) && sourceCollection.length > 0) {
        return sourceCollection[0];
      }
      return undefined;
    }
  };

  const customProcessingEngine = {
    runInstructionSet: (instructionBlueprint, auxiliaryContext) => {
      // This function directly implements the logic that the original's
      // compiled and evaluated code would perform.
      // Original logic: var a = ki (range 1 10); console.log(ki (first a));

      // Step 1: Generate the sequence (equivalent to `ki (range 1 10)`)
      let interimContainer = dataManipulationAlgorithms.produceNumericSeries(
        instructionBlueprint.sequenceDefinition.begin,
        instructionBlueprint.sequenceDefinition.finish
      );

      // Step 2: Get the first element and log it (equivalent to `console.log(ki (first a))`)
      let finalOutputValue = dataManipulationAlgorithms.obtainFirstEntry(interimContainer);
      console.log(finalOutputValue);
    }
  };

  const operationalPlan = {
    planIdentifier: "primaryExecutionFlow",
    sequenceDefinition: {
      actionType: "generateIntegers",
      begin: 1,
      finish: 10
    },
    displayAction: {
      method: "logInitialItem"
    }
  };

  customProcessingEngine.runInstructionSet(operationalPlan, {
    primaryDirectives: coreSystemTextualData
  });

})();