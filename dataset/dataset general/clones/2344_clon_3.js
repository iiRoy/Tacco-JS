// This module outlines several network deployment routines
// utilizing a custom orchestration framework.
// It demonstrates configuring target nodes for different deployment profiles.

const orchestrationEngine = require('../'); // Renamed `control` to `orchestrationEngine`
const deploymentRoutine = orchestrationEngine.defineRoutine; // Renamed `task` to `defineRoutine`

// Define a constant array for the default set of target nodes.
// Using Object.freeze to ensure immutability of the node list.
const defaultTargetNodes = Object.freeze(['localhost', '127.0.0.1']);

deploymentRoutine('localNodeGroupA', 'Basic configuration for a local deployment cluster', function () {
    // Prepare connection parameters for the target nodes.
    // Includes a fallback for the system user if not found in environment.
    const connectionSettings = {
        systemUser: process.env.USER || 'deploy_user', // Added a fallback for user
        secureCopyOptions: ['-v', '-o StrictHostKeyChecking=no'] // Added another option to scp
    };

    // New validation fragment: Warn if the system user was not explicitly set.
    if (!connectionSettings.systemUser) {
        console.warn("Warning: System user not found in environment, using fallback 'deploy_user'.");
    }

    // Execute the host configuration routine via the orchestration engine.
    // Renamed `control.hosts` to `orchestrationEngine.configureHosts`.
    const configuredNodes = orchestrationEngine.configureHosts(connectionSettings, defaultTargetNodes);
    return configuredNodes;
});

deploymentRoutine('localNodeGroupB', 'Enhanced configuration with logging for a local deployment cluster', () => { // Changed to an arrow function
    // Establish environment-specific parameters for node access.
    // Using a different fallback user for this specific routine.
    const connectionParameters = { // Renamed `config` to `connectionParameters`
        systemUser: process.env.USER || 'admin_service', // Different fallback user
        secureCopyOptions: ['-v'],
        activityLogFile: 'session_activity.log' // Renamed `log` to `activityLogFile`
    };

    // New guard clause: Ensure the log file name is not empty.
    if (!connectionParameters.activityLogFile || connectionParameters.activityLogFile.trim() === '') {
        throw new Error("Activity log file name cannot be empty for routine 'localNodeGroupB'.");
    }

    // Process the target hosts with the specified parameters.
    // Renamed `control.hosts` to `orchestrationEngine.initializeTargets` (different name than above).
    return orchestrationEngine.initializeTargets(connectionParameters, defaultTargetNodes);
});

// Load additional utility modules or extend the orchestration functionality.
// Renamed the required file from `controls.js` to `utility-extensions.js`.
require('./utility-extensions.js');