const ContainerEngine = require('dockerode');
const DockerfileGenerator = require('dockgen');
const TemporaryFileSystem = require('temp');
const FileSystem = require('fs');
const ProcessUtilities = require('child_process');

// Ensure temporary directories and files are cleaned up on process exit.
TemporaryFileSystem.track();

/**
 * Manages containerized application deployments and operational tasks
 * using the Docker engine.
 * @param {object} initOptions - Configuration options for the Container Manager.
 * @constructor
 */
const ContainerManager = function (initOptions) {
  // Initialize configuration settings, providing a default empty object if none passed.
  this.configSettings = initOptions || {};

  // Set a default prefix for all managed container images if not explicitly defined.
  // This helps in identifying images belonging to this system.
  this.configSettings.artifactIdentifierPrefix = this.configSettings.image_prefix || 'managed_app_';

  // Instantiate the Docker client with configurable host and port, or sensible defaults.
  this.engineClient = new ContainerEngine({
    host: this.configSettings.host || 'http://127.0.0.1', // Default Docker daemon host
    port: this.configSettings.port || 2375, // Standard Docker API port (non-TLS)
  });
};

// --- Image Repository Functions ---

/**
 * Fetches a filtered list of application images that are managed by this system.
 * Optionally filters by a specific application name.
 * @param {string} [requestedAppName] - Optional: The name of a specific application to search for.
 * @param {Function} completionCallback - Callback function: `(error, imageDetailsArray)`.
 */
ContainerManager.prototype.retrieveApplicationImages = function (requestedAppName, completionCallback) {
  // List all images from the Docker daemon.
  this.engineClient.listImages((error, imageData) => {
    if (error) {
      // Propagate any errors encountered during image listing.
      return completionCallback(error);
    }

    // Process and filter the raw image data.
    const filteredAndMappedImages = imageData
      .filter(currentImage => {
        // Ensure the image has repository tags and the first tag matches our prefix.
        if (currentImage.RepoTags && currentImage.RepoTags.length > 0) {
          const primaryTag = currentImage.RepoTags[0];
          const prefix = this.configSettings.artifactIdentifierPrefix;

          if (primaryTag.startsWith(prefix)) {
            // If a specific application name is provided, ensure the full tag matches.
            // The full tag format is 'prefix + appName + :latest'.
            if (!requestedAppName || this.formulateFullImageTag(requestedAppName) === primaryTag) {
              return true; // Include this image in the results.
            }
          }
        }
        return false; // Exclude images that don't match criteria.
      })
      .map(matchingImage => {
        // Transform the Docker image object into a more consumable format.
        return {
          applicationName: this.extractBaseAppName(matchingImage.RepoTags[0]),
          uniqueIdentifier: matchingImage.Id,
          fullImageName: matchingImage.RepoTags[0],
          sizeBytes: matchingImage.Size,
          createdTimestamp: new Date(matchingImage.Created * 1000) // Convert Unix timestamp to Date.
        };
      });

    // Return the list of filtered application images.
    completionCallback(null, filteredAndMappedImages);
  });
};

/**
 * Removes a specific application image from the Docker daemon.
 * @param {string} imageIdentifier - The base name of the application image to remove (e.g., 'my-app').
 * @param {Function} completionCallback - Callback function: `(error, removalResult)`.
 */
ContainerManager.prototype.removeApplicationImage = function (imageIdentifier, completionCallback) {
  // Basic input validation.
  if (!imageIdentifier || typeof imageIdentifier !== 'string' || imageIdentifier.trim() === '') {
    return completionCallback(new Error('A valid image identifier (application name) is required for removal.'));
  }

  // Construct the full image name including the prefix and ':latest' tag.
  const fullImageNameToDelete = this.formulateFullImageTag(imageIdentifier);

  // Obtain a Docker image object to perform operations.
  const targetImage = this.engineClient.getImage(fullImageNameToDelete);

  // Attempt to remove the image.
  targetImage.remove((removalError, removalInfo) => {
    if (removalError) {
      console.error(`Failed to remove image '${fullImageNameToDelete}':`, removalError.message);
      return completionCallback(removalError);
    }
    // Report successful removal, including any information returned by Docker.
    completionCallback(null, removalInfo);
  });
};

/**
 * Deploys a new application by generating a Dockerfile and building a Docker image.
 * The Dockerfile is generated based on the current working directory.
 * @param {string} appNameForDeployment - The desired name for the new application image.
 * @param {Function} completionCallback - Callback function: `(error, buildOutputString)`.
 */
ContainerManager.prototype.deployNewApplication = function (appNameForDeployment, completionCallback) {
  // Validate the application name provided.
  if (!appNameForDeployment || typeof appNameForDeployment !== 'string' || appNameForDeployment.trim() === '') {
    return completionCallback(new Error('A non-empty application name is essential for deployment.'));
  }

  // Create a unique temporary directory for Dockerfile generation.
  TemporaryFileSystem.mkdir('app-deployment-context', (dirError, temporaryDirPath) => {
    if (dirError) {
      return completionCallback(dirError);
    }

    // Generate Dockerfile content, typically based on the project structure in CWD.
    const dockerfileContent = DockerfileGenerator(process.cwd());
    const dockerfilePath = `${temporaryDirPath}/Dockerfile`;

    try {
      // Write the generated Dockerfile synchronously to the temporary directory.
      FileSystem.writeFileSync(dockerfilePath, dockerfileContent, { encoding: 'utf8' });
    } catch (writeError) {
      // Clean up the temporary directory on write failure.
      TemporaryFileSystem.cleanup(() => {}); // Fire and forget cleanup.
      return completionCallback(new Error(`Could not write Dockerfile to temp path: ${writeError.message}`));
    }

    // Prepare a tar archive stream to serve as the Docker build context.
    // This command creates an archive containing the current working directory's contents
    // and explicitly adds the Dockerfile from the temporary directory into the archive's root.
    const tarArchiveProcess = ProcessUtilities.spawn('tar', [
      'c', // Create an archive.
      '-h', // Dereference symbolic links.
      '-f', '-', // Write the archive to standard output.
      '-C', process.cwd(), // Change directory to the application's root before adding files.
      '.', // Add all files/directories from the current working directory.
      '-C', temporaryDirPath, // Change directory to the temporary Dockerfile location.
      'Dockerfile' // Add the generated Dockerfile.
    ]);

    // Pipe the tar process's standard error to the main process's stderr for debugging.
    tarArchiveProcess.stderr.pipe(process.stderr);

    // Handle errors that prevent the tar process from starting.
    tarArchiveProcess.on('error', (spawnErr) => {
      TemporaryFileSystem.cleanup(() => {});
      return completionCallback(new Error(`Failed to initiate tar archiving process: ${spawnErr.message}`));
    });

    // Build the Docker image using the tar stream as the build context.
    const imageTagForBuild = this.formulateFullImageTag(appNameForDeployment);
    this.engineClient.buildImage(tarArchiveProcess.stdout, { t: imageTagForBuild }, (buildErr, buildStream) => {
      if (buildErr) {
        TemporaryFileSystem.cleanup(() => {});
        return completionCallback(buildErr);
      }

      // Collect the build output from the stream.
      let accumulatedBuildOutput = '';
      buildStream.on('data', chunk => {
        accumulatedBuildOutput += chunk.toString();
        // Optional: uncomment to stream build logs directly to console.
        // process.stdout.write(chunk);
      });
      buildStream.on('end', () => {
        // Ensure temporary resources are cleaned up after the build process completes.
        TemporaryFileSystem.cleanup(() => {});
        completionCallback(null, accumulatedBuildOutput);
      });
      buildStream.on('error', streamErr => {
        TemporaryFileSystem.cleanup(() => {});
        completionCallback(new Error(`Docker build stream error: ${streamErr.message}`));
      });
    });
  });
};

// --- Container Instance Management Functions ---

/**
 * Retrieves a list of currently running application container instances.
 * @param {Function} completionCallback - Callback function: `(error, containerInstanceList)`.
 */
ContainerManager.prototype.listActiveAppContainers = function (completionCallback) {
  // Request only running containers (`all: false`).
  this.engineClient.listContainers({ all: false }, (error, rawContainerData) => {
    if (error) {
      return completionCallback(error);
    }

    // Filter and transform the raw container data.
    const processedInstances = rawContainerData
      .filter(containerItem => {
        // Only include containers whose image names start with our defined prefix.
        return containerItem.Image && containerItem.Image.startsWith(this.configSettings.artifactIdentifierPrefix);
      })
      .map(filteredContainer => {
        // Map to a more structured and readable format.
        return {
          instanceIdentifier: filteredContainer.Id,
          applicationName: this.extractBaseAppName(filteredContainer.Image),
          sourceImageName: filteredContainer.Image,
          containerStatus: filteredContainer.Status,
          exposedPorts: filteredContainer.Ports,
          creationTime: new Date(filteredContainer.Created * 1000) // Convert Unix timestamp.
        };
      });

    completionCallback(null, processedInstances);
  });
};

/**
 * Obtains the identifiers of running container instances, optionally filtered by application name.
 * This function acts as a wrapper for `findMatchingContainerIds`.
 * @param {string} [targetAppName] - Optional: The application name to filter instances by.
 * @param {Function} completionCallback - Callback function: `(error, containerIdArray)`.
 */
ContainerManager.prototype.getApplicationInstanceIds = function (targetAppName, completionCallback) {
  // Delegate the actual logic to the more general `findMatchingContainerIds` function.
  // If `targetAppName` is not provided, `findMatchingContainerIds` will return all.
  this.findMatchingContainerIds(targetAppName, completionCallback);
};

/**
 * Locates and returns the IDs of container instances that match a given application name criterion.
 * If `appNameCriterion` is '--all', all active container IDs are returned.
 * @param {string} appNameCriterion - The application name to match, or '--all' for all instances.
 * @param {Function} completionCallback - Callback function: `(error, matchingIdsArray)`.
 */
ContainerManager.prototype.findMatchingContainerIds = function (appNameCriterion, completionCallback) {
  this.listActiveAppContainers((error, activeContainers) => {
    if (error) {
      return completionCallback(error);
    }

    const matchingInstanceIds = activeContainers
      .filter(containerEntry => {
        // Match if the criterion is '--all' or if the application names are identical.
        return appNameCriterion === '--all' || containerEntry.applicationName === appNameCriterion;
      })
      .map(matchedContainer => {
        return matchedContainer.instanceIdentifier;
      });

    completionCallback(null, matchingInstanceIds);
  });
};

/**
 * Attaches to a running container instance and streams its standard output and error logs.
 * @param {string} containerInstanceId - The unique identifier of the container instance.
 * @param {WritableStream} outputStdoutStream - A writable stream to pipe container's stdout to.
 * @param {WritableStream} outputStderrStream - A writable stream to pipe container's stderr to.
 * @param {Function} completionCallback - Callback function: `(error)`. Called once attachment is successful.
 */
ContainerManager.prototype.streamInstanceLogs = function (containerInstanceId, outputStdoutStream, outputStderrStream, completionCallback) {
  // Validate input parameters.
  if (!containerInstanceId || typeof containerInstanceId !== 'string' || containerInstanceId.trim() === '') {
    return completionCallback(new Error('A valid container instance ID is mandatory for log streaming.'));
  }
  if (!outputStdoutStream || !outputStderrStream) {
    return completionCallback(new Error('Both stdout and stderr output streams must be provided.'));
  }

  // Get a Docker container object for the specified ID.
  const targetContainer = this.engineClient.getContainer(containerInstanceId);

  // Configuration for attaching to the container's streams.
  const attachConfig = {
    stdout: true,
    stderr: true,
    stream: true, // Request a continuous stream.
    logs: true, // Include historical logs if available.
    tty: false, // Essential for demultiplexing stdout/stderr correctly.
    follow: true, // Keep the stream open and follow new logs.
  };

  targetContainer.attach(attachConfig, (attachError, logStream) => {
    if (attachError) {
      return completionCallback(attachError);
    }

    // Use Dockerode's modem to demultiplex the single Docker stream into separate stdout/stderr.
    this.engineClient.modem.demuxStream(logStream, outputStdoutStream, outputStderrStream);

    // The callback indicates successful attachment; the streams will continue to flow.
    completionCallback(null);

    // Add event listeners for stream lifecycle for robustness and logging.
    logStream.on('end', () => console.log(`[Log Stream] Container ${containerInstanceId} stream ended.`));
    logStream.on('close', () => console.log(`[Log Stream] Container ${containerInstanceId} stream closed.`));
    logStream.on('error', (streamErr) => console.error(`[Log Stream Error] Container ${containerInstanceId}:`, streamErr.message));
  });
};

/**
 * Launches a new container instance from a specified Docker image.
 * This involves creating the container and then starting it.
 * @param {string} imageToRunId - The ID or full tag of the Docker image to instantiate.
 * @param {Function} completionCallback - Callback function: `(error, newContainerId)`.
 */
ContainerManager.prototype.launchApplicationInstance = function (imageToRunId, completionCallback) {
  // Input validation.
  if (!imageToRunId || typeof imageToRunId !== 'string' || imageToRunId.trim() === '') {
    return completionCallback(new Error('A valid image ID or tag is required to launch a new instance.'));
  }

  // Configuration for creating the new container.
  const containerCreationConfig = {
    Image: imageToRunId,
    AttachStdout: true,
    AttachStderr: true,
    Tty: false, // Non-interactive, crucial for stream demultiplexing.
    OpenStdin: false, // No standard input.
  };

  this.engineClient.createContainer(containerCreationConfig, (creationError, newContainer) => {
    if (creationError) {
      return completionCallback(creationError);
    }

    // Inspect the newly created container to get details, especially exposed ports for mapping.
    newContainer.inspect((inspectError, containerDetails) => {
      if (inspectError) {
        return completionCallback(inspectError);
      }

      const hostRuntimeConfiguration = {
        PortBindings: {} // Object to hold host-to-container port mappings.
      };

      const exposedPortsDefinition = containerDetails.Config.ExposedPorts;

      if (exposedPortsDefinition) {
        // Iterate over each exposed port defined in the image configuration.
        Object.keys(exposedPortsDefinition).forEach(containerPortSpec => {
          // Extract the port number (e.g., '80' from '80/tcp').
          const portNumber = containerPortSpec.split('/')[0];
          hostRuntimeConfiguration.PortBindings[containerPortSpec] = [
            {
              HostIp: '0.0.0.0', // Bind to all available network interfaces on the host.
              HostPort: portNumber // Map to the same port number on the host.
            }
          ];
        });
      } else {
        console.log(`[Launch Info] No exposed ports found for image '${imageToRunId}'. Container will run without explicit port mappings.`);
      }

      // Start the container with the determined host configuration.
      newContainer.start(hostRuntimeConfiguration, (startError) => {
        if (startError) {
          return completionCallback(startError);
        }
        // Return the ID of the successfully launched container instance.
        completionCallback(null, newContainer.id);
      });
    });
  });
};

/**
 * Stops and subsequently removes a running container instance.
 * @param {string} containerToStopId - The ID of the container instance to terminate.
 * @param {Function} completionCallback - Callback function: `(error, removalResult)`.
 */
ContainerManager.prototype.terminateApplicationInstance = function (containerToStopId, completionCallback) {
  // Input validation.
  if (!containerToStopId || typeof containerToStopId !== 'string' || containerToStopId.trim() === '') {
    return completionCallback(new Error('A valid container ID is required to terminate an instance.'));
  }

  const targetContainer = this.engineClient.getContainer(containerToStopId);

  // Attempt to stop the container.
  targetContainer.stop((stopError) => {
    if (stopError) {
      // Docker often returns an error (e.g., 304 Not Modified) if the container is already stopped.
      // We'll treat this as a non-fatal condition and proceed to removal.
      if (stopError.statusCode === 304 || stopError.message.includes('container already stopped')) {
        console.warn(`[Terminate Warn] Container '${containerToStopId}' was already in a stopped state. Proceeding with removal.`);
      } else {
        // For other errors, report and halt.
        return completionCallback(stopError);
      }
    }

    // After stopping (or if already stopped), proceed to remove the container.
    // Using `force: true` ensures removal even if the container is still running (though we just tried to stop it).
    targetContainer.remove({ force: true }, (removeError, removeResult) => {
      if (removeError) {
        console.error(`[Terminate Error] Failed to remove container '${containerToStopId}':`, removeError.message);
        return completionCallback(removeError);
      }
      completionCallback(null, removeResult);
    });
  });
};

// --- Helper Functions ---

/**
 * Extracts the base application name from a full Docker image reference (e.g., tag).
 * Example: 'managed_app_my-service:latest' -> 'my-service'
 * @param {string} fullImageReference - The complete Docker image tag or name.
 * @returns {string} The simplified application name.
 */
ContainerManager.prototype.extractBaseAppName = function (fullImageReference) {
  let baseName = fullImageReference;

  // Remove the configured image prefix if present.
  if (baseName.startsWith(this.configSettings.artifactIdentifierPrefix)) {
    baseName = baseName.substring(this.configSettings.artifactIdentifierPrefix.length);
  }

  // Remove any image tag (e.g., ':latest', ':v1.0') if present.
  const lastColonIndex = baseName.lastIndexOf(':');
  if (lastColonIndex !== -1) {
    baseName = baseName.substring(0, lastColonIndex);
  }

  return baseName;
};

/**
 * Constructs a full Docker image tag using the configured prefix and ':latest' tag.
 * Example: 'my-app' -> 'managed_app_my-app:latest'
 * @param {string} simpleAppName - The base application name.
 * @returns {string} The fully qualified Docker image tag.
 */
ContainerManager.prototype.formulateFullImageTag = function (simpleAppName) {
  return `${this.configSettings.artifactIdentifierPrefix}${simpleAppName}:latest`;
};

// Export the ContainerManager class for use in other modules.
module.exports = ContainerManager;

// --- Global Utility Enhancements ---

/**
 * Adds a `removeFalsy` method to `Array.prototype`.
 * This method creates a new array containing only truthy elements from the original array.
 * This is a functional replacement for the original `clean` method, ensuring immutability.
 * It's defensively added to prevent overwriting existing methods.
 */
if (!Array.prototype.removeFalsy) {
  Object.defineProperty(Array.prototype, 'removeFalsy', {
    value: function () {
      // The `filter` method iterates over array elements and returns a new array
      // containing only elements for which the callback returns a truthy value.
      return this.filter(element => element);
    },
    writable: true,     // Allow the property to be reassigned.
    configurable: true  // Allow the property's attributes to be changed and the property to be deleted.
  });
}