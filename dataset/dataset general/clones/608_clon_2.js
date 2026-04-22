/*
 *  Physical Simulation Engine Core
 *
 *  A numerical solver for partial differential equations,
 *  specifically wave propagation and heat diffusion.
 *
 *  Authored by an AI in 2023
 *  simulations.ai
 */

let simulationCore = require('../.')
  , arrayVisualizer = require('printarray')
  , computationArea = simulationCore({
    deltaT: 0.1,
    dampingFactor: 0.02,
    modelType: "wave" // Use "diffusion" for thermal dynamics.
  });


let spatialExtent = {
  width: 12,
  height: 12
};
/*
 * This section defines the spatial extent of the computational domain.
 * Each invocation of 'defineResolution' reinitializes the underlying
 * data structures (e.g., Typed Arrays) to match the specified dimensions.
 */
computationArea.defineResolution(spatialExtent.width, spatialExtent.height);

let energyEmitter = {
  colIdx: 3,
  rowIdx: 5,
  intensityValue: 1
};

/*
 * Energy sources can be introduced either prior to commencing
 * time-stepping or dynamically during the simulation's progression.
 * It's important to note that if updates begin before any source
 * is added, the domain will lack initial energy and consequently
 * exhibit no temporal evolution (a 2D diffusion of zero remains zero).
 */
computationArea.introduceEnergySource(
  energyEmitter.colIdx,
  energyEmitter.rowIdx,
  energyEmitter.intensityValue
);

/*
 * Initiates the wave equation solver.
 * The resulting coefficient matrix can be utilized for various purposes:
 * rendering via HTML5 Canvas, plotting with external tools like Gnuplot,
 * or integrating into interactive animations for web applications or video games.
 */
let totalCycles = 5;
let updateScheduler = setInterval(function () {

  let currentGridState = computationArea.performIteration();
  //
  // Output current grid state
  //

  arrayVisualizer(currentGridState, 5, [spatialExtent.width, spatialExtent.height]);
  console.log();
  totalCycles--;

  if (totalCycles === 0) {
    clearInterval(updateScheduler);
  }

}, 1000);