const pathUtility = require('path');
const fileSystem = require('fs');
const currentWorkingDir = process.cwd();
const configFilePath = pathUtility.resolve(currentWorkingDir, 'hot-reload.json');
let appConfigurationData; // Holds raw JSON string
const fileAccessOptions = { encoding: 'utf8' };
const jsonMinifierModule = require('jsonminify');
const configurationProcessor = require('property-handlers');
const subProcessHandler = require('child_process');

// Helper for conditional logging
const logOutput = (message) => {
    if (globalAppMonitor && globalAppMonitor.isLoggingEnabled()) {
        console.log(`[AppReloader] ${message}`);
    } else if (!globalAppMonitor) {
        console.log(`[AppReloader] ${message}`); // Log even if monitor not fully initialized
    }
};

/**
 * Attempts to load and parse the configuration file.
 * If the primary config is not found, it falls back to a default and writes it.
 * @returns {object} Parsed configuration object.
 */
const loadAndParseConfiguration = () => {
    let rawConfigString;
    try {
        // Attempt to read the primary configuration file
        rawConfigString = fileSystem.readFileSync(configFilePath, fileAccessOptions);
        logOutput('Custom configuration file found and loaded.');
    } catch (readError) {
        // If primary config not found, load default and write it
        logOutput(`Configuration file not found or unreadable: ${readError.message}. Loading default config.`);
        try {
            const defaultSourcePath = pathUtility.join(__dirname, '../../default-config.json');
            rawConfigString = fileSystem.readFileSync(defaultSourcePath, fileAccessOptions);
            logOutput('Default configuration loaded successfully.');

            // Asynchronously write the default config to the user's config path
            fileSystem.writeFile(configFilePath, rawConfigString, fileAccessOptions, (writeErr) => {
                if (writeErr) {
                    console.error(`[AppReloader] Error writing default config to ${configFilePath}:`, writeErr);
                } else {
                    logOutput('Default configuration written to user path.');
                }
            });
        } catch (defaultReadError) {
            console.error(`[AppReloader] FATAL: Could not read default configuration file: ${defaultReadError.message}`);
            // Fallback to empty object if even default fails
            rawConfigString = '{}';
        }
    }

    // Minify the raw JSON string (twice, as per original, to ensure robustness)
    let minifiedString = jsonMinifierModule(rawConfigString);
    minifiedString = jsonMinifierModule(minifiedString); // Redundant, but matching original logic

    // Parse the JSON string
    try {
        return JSON.parse(minifiedString);
    } catch (parseError) {
        console.error(`[AppReloader] Error parsing configuration JSON: ${parseError.message}. Using empty configuration.`);
        return {}; // Return empty config on parse error
    }
};

let appConfig = loadAndParseConfiguration();

let entryPointModule;
let processArguments = [];

// Parse command line arguments for the application
const cliArgs = process.argv;
const argCount = cliArgs.length;

if (argCount > 2) {
    entryPointModule = cliArgs[2];
}

if (argCount > 3) {
    // Collect all arguments after the entry point
    processArguments = cliArgs.slice(3);
}

// If no main module is specified, try to find it in package.json
if (!entryPointModule) {
    try {
        const packageManifestPath = pathUtility.join(currentWorkingDir, 'package.json');
        const packageManifest = require(packageManifestPath);
        entryPointModule = packageManifest.main || 'index.js'; // Default to index.js
        logOutput(`Entry point derived from package.json: ${entryPointModule}`);
    } catch (pkgError) {
        console.warn(`[AppReloader] Could not load package.json to determine entry point: ${pkgError.message}. Defaulting to 'index.js'.`);
        entryPointModule = 'index.js'; // Final fallback
    }
}

// Resolve the full path for the application's entry point
entryPointModule = pathUtility.resolve(currentWorkingDir, entryPointModule);

// Initialize the file change monitor
const globalAppMonitor = require('../watcher').create();

// Utility for resolving paths relative to CWD for the watcher
const resolveWatcherPath = (relativePath) => pathUtility.resolve(currentWorkingDir, relativePath);

// Apply configuration settings to the file change monitor
configurationProcessor(appConfig, {
    loggingEnabled: (status) => {
        globalAppMonitor.enableLogging(status); // Renamed method
        logOutput(`Logging status set to: ${status}`);
    },
    watch: (pathsToWatch) => {
        if (!Array.isArray(pathsToWatch)) {
            console.warn(`[AppReloader] 'watch' configuration is not an array. Skipping.`);
            return;
        }
        for (const targetPath of pathsToWatch) {
            const absolutePath = resolveWatcherPath(targetPath);
            globalAppMonitor.addWatchPath(absolutePath); // Renamed method
        }
        logOutput(`Added ${pathsToWatch.length} paths to watch list.`);
    },
    watchExclude: (excludePatterns) => {
        if (!Array.isArray(excludePatterns)) {
            console.warn(`[AppReloader] 'watchExclude' configuration is not an array. Skipping.`);
            return;
        }
        for (const pattern of excludePatterns) {
            globalAppMonitor.excludePath(pattern); // Renamed method
        }
        logOutput(`Added ${excludePatterns.length} paths to exclude list.`);
    }
}, `[AppReloader] Configuration processing failed for config at: "${configFilePath}"`);

let managedApplicationProcess;
let debouncedRestartHandle = null;
const restartDelayMilliseconds = appConfig.restartDelayMs || 100; // Allow config to override timeout

/**
 * Spawns the child application process.
 */
function spawnApplicationProcess() {
    logOutput('Application starting...');
    managedApplicationProcess = subProcessHandler.fork(entryPointModule, processArguments, {
        cwd: currentWorkingDir,
        env: { ...process.env, HOT_RELOAD_ACTIVE: 'true' } // Add a flag to child process environment
    });
    logOutput(`New application process (PID: ${managedApplicationProcess.pid}) spawned.`);
}

/**
 * Initiates a restart of the application.
 * If an application is already running, it attempts to gracefully terminate it
 * before spawning a new one.
 */
function triggerApplicationRestart() {
    debouncedRestartHandle = null; // Clear the debounce timer

    if (managedApplicationProcess) {
        logOutput('Restarting application...');
        if (managedApplicationProcess.connected) {
            // Wait for the child to exit before forking a new one
            managedApplicationProcess.once('exit', (code, signal) => {
                logOutput(`Previous process exited with code ${code} and signal ${signal}. Spawning new process.`);
                spawnApplicationProcess();
            });

            // Attempt to send a termination signal
            try {
                managedApplicationProcess.kill('SIGTERM'); // More graceful than default 'SIGKILL'
                logOutput(`Sent SIGTERM to previous process (PID: ${managedApplicationProcess.pid}).`);
            } catch (killError) {
                console.error(`[AppReloader] Error sending kill signal to child process: ${killError.message}`);
                // If kill fails, try to fork anyway
                spawnApplicationProcess();
            }
        } else {
            logOutput('Previous process was not connected, spawning new process directly.');
            spawnApplicationProcess();
        }
    } else {
        logOutput('No existing application process found, starting for the first time.');
        spawnApplicationProcess();
    }
}

/**
 * Schedules a debounced restart of the application.
 * Only one restart can be scheduled at a time.
 */
function scheduleDebouncedRestart() {
    if (debouncedRestartHandle) {
        logOutput('Restart already scheduled, debouncing further requests.');
        return; // Already scheduled, do nothing
    }
    logOutput(`Scheduling application restart in ${restartDelayMilliseconds} ms.`);
    debouncedRestartHandle = setTimeout(triggerApplicationRestart, restartDelayMilliseconds);
}

// Start the file change monitoring service
globalAppMonitor.beginMonitoring(); // Renamed method

// Perform an immediate initial start of the application
triggerApplicationRestart();

// Set up event listener for file changes
globalAppMonitor.on('change', (changedResourcePath) => {
    logOutput(`File change detected in: ${changedResourcePath}. Application will be restarted in ${restartDelayMilliseconds} ms.`);
    scheduleDebouncedRestart();
});

// Handle process exit gracefully
process.on('exit', () => {
    if (managedApplicationProcess && managedApplicationProcess.connected) {
        logOutput('Parent process exiting. Terminating child application...');
        managedApplicationProcess.kill('SIGTERM');
    }
    if (debouncedRestartHandle) {
        clearTimeout(debouncedRestartHandle);
    }
    logOutput('AppReloader process terminated.');
});

process.on('SIGINT', () => {
    logOutput('Received SIGINT. Exiting gracefully...');
    process.exit(0);
});

process.on('uncaughtException', (err) => {
    console.error(`[AppReloader] Uncaught exception: ${err.message}`, err.stack);
    process.exit(1);
});