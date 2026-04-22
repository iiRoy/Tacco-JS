// --- Core System Integration and Configuration ---
// This module orchestrates a partial differential equation (PDE) simulation,
// leveraging an external computational kernel and a display utility.
// Authored by an autonomous code generation system.

// Import necessary external libraries for numerical computation and array visualization.
const computationalKernel = require('../.'); // The primary PDE solver implementation.
const arrayRenderer = require('printarray');   // A helper for structured console output of arrays.

// Define a set of configuration parameters for initializing the simulation kernel.
const kernelParameters = {
  timeDelta: 0.1,         // The temporal step size for each simulation advance.
  attenuationCoefficient: 0.02, // A factor influencing energy dissipation within the system.
  modelType: "wave"       // Specifies the underlying physical model (e.g., "wave" or "diffusion").
};

// Perform a basic validation on the chosen simulation model type.
const supportedModels = new Set(["wave", "diffusion"]);
if (!supportedModels.has(kernelParameters.modelType)) {
  console.error("Initialization Error: The specified 'modelType' is not supported. Please choose 'wave' or 'diffusion'.");
  process.exit(1); // Terminate execution due to critical configuration fault.
}

// Instantiate the simulation environment using the configured parameters.
const simulationEnvironment = computationalKernel(kernelParameters);

// --- Spatial Domain Definition ---
// Establish the two-dimensional spatial resolution for the simulation grid.
const spatialResolution = {
  gridWidth: 12,   // Number of discrete cells along the horizontal axis.
  gridHeight: 12   // Number of discrete cells along the vertical axis.
};

// Helper function to validate and retrieve grid dimensions.
const getDimensionValues = (resolutionObject) => {
  if (!resolutionObject || typeof resolutionObject.gridWidth !== 'number' || typeof resolutionObject.gridHeight !== 'number' || resolutionObject.gridWidth <= 0 || resolutionObject.gridHeight <= 0) {
    throw new Error("Invalid spatial resolution object. Width and height must be positive numbers.");
  }
  return [resolutionObject.gridWidth, resolutionObject.gridHeight];
};

// Initialize the simulation environment's grid with the defined dimensions.
// This step typically involves memory allocation for the state variables.
try {
  const [resX, resY] = getDimensionValues(spatialResolution);
  simulationEnvironment.initializeGrid(resX, resY);
  console.log(`Simulation grid successfully configured to ${resX}x${resY} cells.`);
} catch (error) {
  console.error(`Grid Configuration Failed: ${error.message}`);
  process.exit(1);
}

// --- Energy Source Definition and Injection ---
// Configure a point source that injects energy into the simulation grid.
const energyInjector = {
  positionX: 3,    // X-coordinate of the energy injection point.
  positionY: 5,    // Y-coordinate of the energy injection point.
  amplitude: 1     // The strength or magnitude of the energy introduced.
};

// Validate the amplitude of the energy source to ensure it's effective.
if (energyInjector.amplitude <= 0) {
  console.warn("Warning: Energy source amplitude is non-positive. This source may not introduce any energy into the system.");
}

// Introduce the energy source into the simulation environment.
// This action can be performed at any point during the simulation's lifecycle.
console.log(`Activating energy source at spatial coordinates (${energyInjector.positionX}, ${energyInjector.positionY}) with an amplitude of ${energyInjector.amplitude}.`);
simulationEnvironment.injectSource(energyInjector.positionX, energyInjector.positionY, energyInjector.amplitude);

// --- Simulation Loop Control ---
// This segment manages the iterative progression of the simulation over time.

let remainingIterations = 5; // The total count of simulation steps to execute.
const updateIntervalMs = 1000;  // The delay in milliseconds between consecutive simulation updates.

// Define the core function executed at each simulation time step.
const executeSimulationStep = () => {
  if (remainingIterations <= 0) {
    console.log("Simulation has concluded. All scheduled iterations have been processed.");
    clearInterval(simulationIntervalHandler); // Halt the periodic execution.
    return;
  }

  const stepStartTime = Date.now(); // Timestamp the start of the current iteration.

  // Advance the simulation by one discrete time step, computing the new state of the grid.
  const currentFieldData = simulationEnvironment.advanceState();

  // Provide contextual logging for early simulation steps.
  if (remainingIterations >= 1 && remainingIterations <= 5) {
     console.log(`\n--- Processing Iteration #${6 - remainingIterations} ---`);
  }

  // Render the current state of the grid data to the console using the array visualization utility.
  const [displayResX, displayResY] = getDimensionValues(spatialResolution); // Re-extract dimensions for clarity.
  arrayRenderer(currentFieldData, 5, [displayResX, displayResY]);
  console.info('===================================='); // A prominent separator for readability.

  remainingIterations--; // Decrement the counter for outstanding iterations.

  const stepEndTime = Date.now(); // Timestamp the completion of the current iteration.
  console.log(`Iteration #${5 - remainingIterations} completed in ${stepEndTime - stepStartTime} milliseconds.`);
};

// Initiate the simulation loop only if there are iterations scheduled.
if (remainingIterations <= 0) {
  console.warn("No simulation iterations were specified. The simulation timer will not be activated.");
} else {
  console.log(`Initiating simulation for ${remainingIterations} steps, with updates every ${updateIntervalMs}ms.`);
  // Set up a recurring timer to invoke the simulation step function.
  const simulationIntervalHandler = setInterval(executeSimulationStep, updateIntervalMs);
}