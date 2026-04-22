const systemUtilities = require('os');
const processOrchestrator = require('cluster');

// Define the primary application entry point for worker processes.
const WORKER_APPLICATION_ENTRY = './app.js';

// A simple counter to keep track of currently active worker instances.
let liveWorkerInstances = 0;

/**
 * Handles the event when a worker process unexpectedly terminates.
 * It logs the event and attempts to replace the failed worker after a brief delay.
 * @param {object} departingUnit - The worker object that has exited.
 */
const manageWorkerTermination = (departingUnit) => {
  console.error(`[Orchestrator] Worker unit ID ${departingUnit.id} (PID: ${departingUnit.process.pid}) has stopped functioning.`);
  liveWorkerInstances--; // Decrement count for the terminated worker.

  // Introduce a short pause before spawning a new worker to prevent rapid re-spawning
  // in case of immediate failure.
  setTimeout(() => {
    console.info('[Orchestrator] Initiating a replacement worker process...');
    processOrchestrator.fork();
    liveWorkerInstances++; // Increment count for the new worker.
    console.log(`[Orchestrator] Total active workers: ${liveWorkerInstances}`);
  }, 250); // 250 milliseconds delay for replacement.
};

// Check if the current process is the master orchestrator instance.
if (processOrchestrator.isMaster) {
  // Configure the master process to launch worker processes using a specific script.
  processOrchestrator.setupMaster({
    exec: WORKER_APPLICATION_ENTRY
  });

  // Register an event listener to react to worker process exits.
  processOrchestrator.on('exit', manageWorkerTermination);

  // Determine the number of available CPU cores to optimize resource utilization.
  const numberOfSystemCores = systemUtilities.cpus().length;
  console.log(`[Orchestrator] System detected ${numberOfSystemCores} logical CPU cores.`);

  // Spawn a dedicated worker process for each detected CPU core.
  for (let coreAllocationIndex = 0; coreAllocationIndex < numberOfSystemCores; coreAllocationIndex++) {
    processOrchestrator.fork();
    liveWorkerInstances++; // Increment the counter for each newly spawned worker.
  }

  console.log(`[Orchestrator] Master process has initialized and launched ${liveWorkerInstances} worker instances.`);
} else {
  // This block is executed by worker processes, not the master.
  // In a real application, this is where the 'app.js' logic would reside.
  console.log(`[Worker Process] This is a distributed worker (PID: ${process.pid}). Ready for tasks.`);
  // No further action needed here for the cloning exercise, as the original
  // code only dealt with master process setup.
}