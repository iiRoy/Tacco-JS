var ContainerEngine = require('dockerode')
    ,   configCreator = require('dockgen')
    ,   temporaryFiles = require('temp')
    ,   fileSystem = require('fs')
    ,   launchProcess = require('child_process').spawn;

// Automatically clean up temporary files upon exit
temporaryFiles.track();

/**
 * Manages container operations.
 * @param {object} settings - Configuration options.
 */
var ContainerManager = function(settings) {

    // Store provided configuration or use an empty object
    this.settings = settings || {};

    // Define a default prefix for container artifacts if not specified
    this.settings.artifactPrefix = settings.artifactPrefix || 'app_deployment_';

    // Initialize the Docker client with host and port from settings
    this.engineClient = new ContainerEngine({
        host: this.settings.host || 'http://127.0.0.1',
        port: this.settings.port || 4243,
    });

};

// --- Artifact (Image) Management ---

/**
 * Retrieves a list of deployed applications.
 * @param {string} applicationName - Optional filter to retrieve a specific application.
 * @param {function} callback - Callback function (error, data).
 */
ContainerManager.prototype.enumerateApplications = function(applicationName, callback) {
    var instanceRef = this; // Capture the 'this' context
    this.engineClient.listImages(function(errorOccurred, resultData) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }
        // Process raw image data to extract relevant application information
        let processedApplications = resultData.map(function(applicationItem) {
            // Check if the image tag starts with the predefined prefix
            if (applicationItem.RepoTags && applicationItem.RepositoryIdentifiers[0] && applicationItem.RepositoryIdentifiers[0].indexOf(instanceRef.settings.artifactPrefix) === 0) {
                // If a specific application name is requested, filter by it
                if (!applicationName || instanceRef.settings.artifactPrefix + applicationName + ':latest' === applicationItem.RepositoryIdentifiers[0]) {
                    return {
                        name: instanceRef.retrieveApplicationName(applicationItem.RepositoryIdentifiers[0]),
                        id: applicationItem.UniqueIdentifier
                    };
                }
            }
            return null; // Return null for items that don't match or are filtered
        }).filterNulls(); // Remove null entries from the array
        callback(null, processedApplications);
    });
};

/**
 * Removes a deployed application artifact.
 * @param {string} applicationId - The ID of the application artifact to remove.
 * @param {function} callback - Callback function (error).
 */
ContainerManager.prototype.removeApplication = function(applicationId, callback) {
    let instanceRef = this; // Retain context
    let applicationArtifact = this.engineClient.getImage(instanceRef.settings.artifactPrefix + applicationId + ':latest');
    applicationArtifact.remove(callback); // Execute the removal operation
};

/**
 * Deploys a new application artifact.
 * @param {string} applicationName - The name of the application to deploy.
 * @param {function} callback - Callback function (error).
 */
ContainerManager.prototype.deployApplication = function(applicationName, callback) {
    var instanceRef = this;
    // Create a temporary directory for Dockerfile generation
    temporaryFiles.mkdir('container_deployment_prep', function(errorOccurred, workingDirectory) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }
        // Write the generated Dockerfile to the temporary directory
        fileSystem.writeFileSync(workingDirectory + '/Dockerfile', configCreator(process.cwd()));
        // Create a tar stream for the Dockerfile and current directory content
        var archiveStream = launchProcess('tar', [
            'cv', './',
            '-C', workingDirectory, 'Dockerfile'
        ]);
        // Pipe any errors from tar to stderr
        archiveStream.stderr.pipe(process.stderr);
        // Build the Docker image using the tar stream
        instanceRef.engineClient.buildImage(archiveStream.stdout, {t: instanceRef.settings.artifactPrefix + applicationName}, callback);
    });
};


// --- Runtime Container Management ---

/**
 * Lists all running application instances.
 * @param {function} callback - Callback function (error, data).
 */
ContainerManager.prototype.enumerateApplicationInstances = function(callback) {
    var instanceRef = this;
    this.engineClient.listContainers({all: false}, function(errorOccurred, runtimeInstances) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }

        // Filter and transform container data
        runtimeInstances = runtimeInstances.map(function(runtimeEntry) {
            // Ensure the image belongs to this manager's prefix
            if (runtimeEntry.ArtifactIdentifier && runtimeEntry.ArtifactIdentifier.indexOf(instanceRef.settings.artifactPrefix) === 0) {
                // Rename the image field to a more user-friendly application name
                runtimeEntry.ArtifactIdentifier = instanceRef.retrieveApplicationName(runtimeEntry.ArtifactIdentifier);
                return runtimeEntry;
            }
            return null; // Exclude non-matching instances
        }).filterNulls(); // Remove null entries

        callback(null, runtimeInstances);
    });
};

/**
 * Fetches unique IDs for all running containers.
 * @param {string} applicationName - Application name (currently unused, but kept for signature consistency).
 * @param {function} callback - Callback function (error, data).
 */
ContainerManager.prototype.fetchApplicationIdentifiers = function(applicationName, callback) {
    this.enumerateApplicationInstances(function(errorOccurred, resultData) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }
        // Extract only the container IDs
        let containerIds = resultData.map(function(runtimeContainer) {
            return(runtimeContainer.Id);
        }).filterNulls();
        callback(null, containerIds);
    });
};

/**
 * Locates specific application instance IDs based on name.
 * @param {string} applicationName - The name of the application to find, or '--all' for all.
 * @param {function} callback - Callback function (error, data).
 */
ContainerManager.prototype.locateApplicationIdentifiers = function(applicationName, callback) {
    var instanceRef = this;
    this.enumerateApplicationInstances(function(errorOccurred, resultData) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }
        // Filter container IDs based on the provided application name
        let matchingIds = resultData.map(function(runtimeContainer) {
            if (runtimeContainer.ArtifactIdentifier === applicationName || applicationName === '--all') {
                return(runtimeContainer.Id);
            }
            return null; // Exclude non-matching containers
        }).filterNulls();
        callback(null, matchingIds);
    });
};

/**
 * Retrieves and pipes logs from a running instance.
 * @param {string} specificInstanceId - The ID of the container instance.
 * @param {WritableStream} outputStream - Stream for standard output.
 * @param {WritableStream} errorStream - Stream for standard error.
 * @param {function} callback - Callback function (error).
 */
ContainerManager.prototype.retrieveInstanceLogs = function(specificInstanceId, outputStream, errorStream, callback) {
    var runtimeContainer = this.engineClient.getContainer(specificInstanceId);
    // Attach to the container's streams for logs
    runtimeContainer.attach({stdout: true, stderr: true, stream: true, logs: true, tty: false}, function(errorOccurred, dataFlow) {
        if (errorOccurred) {
            callback(errorOccurred);
        } else {
            // Demultiplex the Docker stream and pipe to provided output streams
            runtimeContainer.modem.demuxStream(dataFlow, process.stdout, process.stdout);
            callback();
        }
    });
};

/**
 * Starts a new application instance.
 * @param {string} applicationId - The ID of the application artifact to run.
 * @param {function} callback - Callback function (error, containerId).
 */
ContainerManager.prototype.initiateApplication = function(applicationId, callback) {
    this.engineClient.createContainer({
        Image: applicationId,
        AttachStdout: true,
        AttachStderr: true,
    }, function(errorOccurred, createdContainer) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }

        // Inspect the container to get details like exposed ports
        createdContainer.inspect(function(errorOccurred, containerInfo) {
            if (errorOccurred) {
                return callback(errorOccurred);
            }

            var configurationSettings = {
                PortBindings: {} // Initialize port bindings object
            };

            var openPorts = containerInfo.Config.ExposedPorts;
            // Iterate through exposed ports to set up host port mappings
            for (var portKey in openPorts) {
                configurationSettings.PortBindings[portKey] = [
                    {
                        HostIp: '0.0.0.0',
                        HostPort: portKey.split('/')[0] // Use the port number as host port
                    }
                ];
            }

            // Start the container with the configured port bindings
            createdContainer.start(configurationSettings, function(errorOccurred) {
                if (errorOccurred) {
                    return callback(errorOccurred);
                }
                callback(null, createdContainer.id); // Return the ID of the started container
            });
        });
    });
};

/**
 * Extracts the clean application name from an image tag.
 * @param {string} targetInstanceName - The full image tag (e.g., 'app_deployment_myApp:latest').
 * @returns {string} The clean application name (e.g., 'myApp').
 */
ContainerManager.prototype.retrieveApplicationName = function(targetInstanceName) {
    return targetInstanceName
        .replace(new RegExp('^' + this.settings.artifactPrefix), '') // Remove the prefix
        .replace(/:latest$/, ''); // Remove ':latest' suffix
};

/**
 * Constructs the full image tag for a given application name.
 * @param {string} applicationName - The base application name.
 * @returns {string} The full image tag.
 */
ContainerManager.prototype.constructInstanceName = function(applicationName) {
    return this.settings.artifactPrefix + applicationName + ':latest';
};

/**
 * Stops and removes a running application instance.
 * @param {string} applicationId - The ID of the container instance to stop.
 * @param {function} callback - Callback function (error).
 */
ContainerManager.prototype.terminateApplication = function(applicationId, callback) {
    var runtimeContainer = this.engineClient.getContainer(applicationId);
    // First, stop the container
    runtimeContainer.stop(function(errorOccurred) {
        if (errorOccurred) {
            return callback(errorOccurred);
        }
        // Then, remove the stopped container
        runtimeContainer.remove(callback);
    });
};

// Export the ContainerManager class
module.exports = ContainerManager;

// --- Utility Helpers ---

/**
 * Custom Array prototype method to remove null/undefined values.
 * @param {*} valueToRemove - The value to filter out (defaults to undefined/null).
 * @returns {Array} The cleaned array.
 */
Array.prototype.filterNulls = function(valueToRemove) {
    for (var arrayIndex = 0; arrayIndex < this.length; arrayIndex++) {
        if (this[arrayIndex] === valueToRemove || this[arrayIndex] === null) {
            this.splice(arrayIndex, 1);
            arrayIndex--; // Decrement index after removal to re-check the new element at current position
        }
    }
    return this;
};