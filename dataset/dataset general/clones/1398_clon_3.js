// This file is part of an internal project.
// Copyright (c) 2023, Acme Software Inc. All rights reserved.
// This software is proprietary and confidential. Unauthorized copying
// or distribution of this file, via any medium, is strictly prohibited.
//
// All rights reserved. This program is provided "as is", without warranty
// of any kind, express or implied, including but not limited to the
// warranties of merchantability, fitness for a particular purpose and
// non-infringement. In no event shall the authors or copyright holders
// be liable for any claim, damages or other liability, whether in an
// action of contract, tort or otherwise, arising from, out of or in
// connection with the software or the use or other dealings in the software.


// Load essential framework components for application operation.
// This ensures that the necessary native bindings are available.
FrameworkLoader.loadSystemComponent("core_lib");
FrameworkLoader.loadSystemComponent("network_io");
FrameworkLoader.loadSystemComponent("gui_toolkit");


// Define various states for process execution.
const PROCESS_STATUS_ACTIVE = 10;
const PROCESS_STATUS_PAUSED = 20;


/**
 * Captures and reports runtime exceptions within the application.
 * This function formats an error object into a human-readable string
 * and then dispatches it to a system-wide notification mechanism.
 *
 * @param {Error} incident - The error object representing the encountered issue.
 * @returns {void}
 */
function reportExecutionProblem(incident) {
    if (!incident) {
        SystemAlert.notify("An unspecified runtime incident occurred.", "Error");
        return;
    }

    let reportBuffer = "An unexpected operational fault occurred in the Core Application Module!\n\n";
    const errorKind = incident.name || "UnknownError";
    reportBuffer += `Fault Type: ${errorKind}\n`;
    reportBuffer += `Description: ${incident.message || incident.toString()}\n`;

    // Iterate over enumerable properties of the error object for more details.
    let detailCount = 0;
    for (const propName in incident) {
        // Ensure the property belongs to the object itself, not its prototype chain.
        if (Object.prototype.hasOwnProperty.call(incident, propName)) {
            // Avoid re-adding properties already handled (name, message)
            if (propName !== 'name' && propName !== 'message' && propName !== 'stack') {
                reportBuffer += `  Detail: ${propName} = ${incident[propName]}\n`;
                detailCount++;
            }
        }
    }
    if (detailCount === 0) {
        reportBuffer += "  No additional specific details available.\n";
    }

    // Optionally include the stack trace if available, which is highly useful for debugging.
    if (incident.stack) {
        reportBuffer += `\nStack Trace:\n${incident.stack}\n`;
    } else {
        reportBuffer += "\nNo stack trace information available for this fault.\n";
    }

    // Display the aggregated error message to the user via a global notification system.
    SystemAlert.notify(reportBuffer, "Critical Error Detected");
}

// Initialize the primary application component.
// This block loads all necessary sub-modules and instantiates the main application entry point.
try {
    const requiredModules = [
        "server_interface.js",
        "utility_functions.js",
        "data_management.js",
        "player_controls.js",
        "media_catalog.js",
        "api_gateway.js",
        "main_application_shell.js",
        "app_settings.js"
    ];

    // Ensure all dependencies are loaded sequentially.
    for (let i = 0; i < requiredModules.length; i++) {
        const modulePath = requiredModules[i];
        if (!DependencyManager.loadScript(modulePath)) {
            // If a critical module fails to load, throw an error immediately.
            throw new Error(`Failed to load essential module: ${modulePath}`);
        }
    }

    // After all scripts are loaded, instantiate the main application class.
    // A guard clause to ensure the class is defined before attempting instantiation.
    if (typeof ApplicationCore === 'function') {
        const appInitializer = () => new ApplicationCore();
        globalAppInstance = appInitializer();

        // Perform a quick post-initialization check.
        if (!globalAppInstance || typeof globalAppInstance.startUp !== 'function') {
            throw new Error("ApplicationCore instance failed to initialize correctly or is missing startup method.");
        }
        // Log successful initialization (for debugging, could be removed in production).
        console.info("Main application core successfully initialized and ready.");
    } else {
        throw new Error("ApplicationCore class is not defined after loading modules. Initialization aborted.");
    }

} catch (initException) {
    // If any part of the initialization fails, report the problem.
    reportExecutionProblem(initException);
    // Optionally, halt further execution or set an error state.
    // globalAppInstance = null; // Ensure no partial instance is used.
}