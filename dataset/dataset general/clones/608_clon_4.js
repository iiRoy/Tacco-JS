const processingUnit = require('../.');
const displayUtility = require('printarray');

const processSettings = {
  evolutionParameters: {
    timeDelta: 0.1,
    dampingCoefficient: 0.02,
    equationType: "wave"
  },
  gridGeometry: {
    width: 12,
    height: 12
  },
  energyInjectionPoint: {
    column: 3,
    row: 5,
    magnitude: 1
  },
  totalCycles: 5
};

const establishEnvironment = (coreModule, configuration) => {
  const simulationInstance = coreModule({
    dt: configuration.evolutionParameters.timeDelta,
    gamma: configuration.evolutionParameters.dampingCoefficient,
    eqn: configuration.evolutionParameters.equationType
  });

  simulationInstance.setResolution(
    configuration.gridGeometry.width,
    configuration.gridGeometry.height
  );

  simulationInstance.addSource(
    configuration.energyInjectionPoint.column,
    configuration.energyInjectionPoint.row,
    configuration.energyInjectionPoint.magnitude
  );

  return simulationInstance;
};

const conductSimulationEpoch = (
  currentSimInstance,
  visualizer,
  gridDimensions,
  remainingEpochs
) => {
  if (remainingEpochs <= 0) {
    return;
  }

  const computedCoefficients = currentSimInstance.update();
  visualizer(computedCoefficients, 5, gridDimensions);
  console.log();

  setTimeout(() => {
    conductSimulationEpoch(
      currentSimInstance,
      visualizer,
      gridDimensions,
      remainingEpochs - 1
    );
  }, 1000);
};

const activeSimulation = establishEnvironment(processingUnit, processSettings);

conductSimulationEpoch(
  activeSimulation,
  displayUtility,
  [processSettings.gridGeometry.width, processSettings.gridGeometry.height],
  processSettings.totalCycles
);