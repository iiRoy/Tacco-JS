var Docker = require('dockerode'), // Dockerode library for Docker API interaction
    dockgen = require('dockgen'),   // dockgen for Dockerfile generation
    temp = require('temp'),         // temp for temporary file/directory creation
    fs = require('fs'),             // Node.js file system module
    spawn = require('child_process').spawn; // child_process for spawning external processes


// Track temporary files/directories created by 'temp' module to ensure cleanup.
temp.track(); // Ensures all temporary resources are cleaned up on process exit.


var Dockship = function ( opts ) {

  // Initialize options for the Dockship instance.
  this.opts = opts || {};

  // Set a default image prefix if not provided in options.
  this.opts.image_prefix = opts.image_prefix || 'dockship_';

  // Initialize the Docker client with host and port from options or defaults.
  this.docker = new Docker({
    host: this.opts.host || 'http://127.0.0.1', // Default Docker host
    port: this.opts.port || 4243,               // Default Docker port
  });

}


// --- Image Management Functions ---

/**
 * Lists Docker images associated with Dockship applications.
 *
 * @param {string} appName - Optional: Filter by a specific application name.
 * @param {function} cb - Callback function (err, data).
 */
Dockship.prototype.listApps = function ( appName, cb ) {
  var self = this; // Capture 'this' for use in nested callbacks.

  // Retrieve a list of all Docker images.
  this.docker.listImages(function ( err, data ) {
    if ( err ) {
      return cb( err ); // Propagate any error encountered.
    }

    // Process the image data to extract relevant application information.
    var filteredApps = data.map( function ( app ) {
      // Check if the image tag starts with the predefined prefix.
      if ( app.RepoTags && app.RepoTags[0] && app.RepoTags[0].indexOf( self.opts.image_prefix ) === 0 ) {
        // If appName is specified, only return images matching that name.
        if ( ! appName || self.opts.image_prefix + appName + ':latest' === app.RepoTags[0] ) {
          return {
            name: self.getAppName( app.RepoTags[0] ), // Extract the clean app name.
            id: app.Id                               // Docker image ID.
          };
        }
      }
      return undefined; // Return undefined for non-matching apps.
    }).clean(); // Use the custom .clean() helper to remove undefined entries.

    cb( null, filteredApps ); // Return the list of Dockship applications.
  });
};


/**
 * Deletes a specific application image by its ID.
 *
 * @param {string} appId - The ID of the application image to delete.
 * @param {function} cb - Callback function (err).
 */
Dockship.prototype.deleteApp = function ( appId, cb ) {
  var self = this; // Maintain context.

  // Get a reference to the Docker image object.
  var app = this.docker.getImage( self.opts.image_prefix + appId + ':latest' );

  // Remove the Docker image.
  app.remove( cb );
};


/**
 * Deploys a new application by building a Docker image.
 *
 * @param {string} appName - The name of the application to deploy.
 * @param {function} cb - Callback function (err).
 */
Dockship.prototype.deployApp = function ( appName, cb ) {
  var self = this; // Retain context for nested functions.

  // Create a temporary directory for Dockerfile and build context.
  temp.mkdir( 'dockship', function ( err, dir ) {
    if ( err ) {
      return cb( err ); // Handle error during directory creation.
    }

    // Generate a Dockerfile based on the current working directory and write it to the temp dir.
    fs.writeFileSync( dir + '/Dockerfile', dockgen( process.cwd() ) );

    // Create a tar stream containing the Dockerfile for the build context.
    var tar_stream = spawn( 'tar', [
      'cv',   // Create archive, verbose output.
      './',   // Archive current directory contents.
      '-C', dir, 'Dockerfile' // Change to temp dir, and include only Dockerfile.
    ]);

    // Pipe tar's stderr to process stderr for debugging.
    tar_stream.stderr.pipe( process.stderr );

    // Build the Docker image using the tar stream as context.
    self.docker.buildImage( tar_stream.stdout, {
      t: self.opts.image_prefix + appName // Tag the new image with our prefix and app name.
    }, cb );
  });
};


// --- Container/Instance Management Functions ---


/**
 * Lists running application instances managed by Dockship.
 *
 * @param {function} cb - Callback function (err, instances).
 */
Dockship.prototype.listAppInstances = function ( cb ) {
  var self = this; // Preserve 'this' context.

  // List all containers, excluding stopped ones (all: false).
  this.docker.listContainers({ all: false }, function ( err, instances ) {
    if ( err ) {
      return cb( err ); // Error handling for Docker API call.
    }

    // Filter and transform the container list.
    instances = instances.map( function ( instance ) {
      // Check if the container's image name starts with the Dockship prefix.
      if ( instance.Image && instance.Image.indexOf( self.opts.image_prefix ) === 0 ) {
        // Clean up the image name to just the app name.
        instance.Image = self.getAppName( instance.Image );
        return instance; // Return the modified instance object.
      }
      return undefined; // Exclude non-Dockship containers.
    }).clean(); // Remove undefined entries.

    cb( null, instances ); // Return the filtered list of app instances.
  });
};


/**
 * Retrieves the IDs of all running application containers.
 *
 * @param {string} appName - (Not used in this implementation, but kept for consistency).
 * @param {function} cb - Callback function (err, ids).
 */
Dockship.prototype.getAppIds = function ( appName, cb ) {
  // Use listAppInstances to get all running apps, then map to their IDs.
  this.listAppInstances( function ( err, data ) {
    if ( err ) {
      return cb( err ); // Pass along any errors.
    }
    // Map the instance data to just their IDs.
    cb( null, data.map( function ( container ) {
      return ( container.Id );
    }).clean() ); // Clean up any potential null/undefined IDs (though unlikely here).
  });
};


/**
 * Finds container IDs for a specific application name, or all if '--all' is specified.
 *
 * @param {string} appName - The name of the application to find, or '--all'.
 * @param {function} cb - Callback function (err, ids).
 */
Dockship.prototype.findAppIds = function ( appName, cb ) {
  var self = this; // Store context.

  // Get a list of all running Dockship application instances.
  this.listAppInstances( function ( err, data ) {
    if ( err ) {
      return cb( err ); // Propagate errors.
    }

    // Filter instances by appName or return all if '--all' is used.
    var foundIds = data.map( function ( container ) {
      if ( container.Image === appName || appName === '--all' ) {
        return ( container.Id ); // Return the container ID.
      }
      return undefined; // Exclude non-matching containers.
    }).clean(); // Remove undefined entries.

    cb( null, foundIds ); // Return the list of matching container IDs.
  });
};


/**
 * Attaches to and streams logs from a specific container instance.
 *
 * @param {string} instanceId - The ID of the container instance.
 * @param {WritableStream} stdout_stream - Stream to pipe stdout to.
 * @param {WritableStream} stderr_stream - Stream to pipe stderr to.
 * @param {function} cb - Callback function (err).
 */
Dockship.prototype.getInstanceLogs = function ( instanceId, stdout_stream, stderr_stream, cb ) {
  var container = this.docker.getContainer( instanceId ); // Get container object by ID.

  // Attach to the container's stdout and stderr streams.
  container.attach({
    stdout: true,
    stderr: true,
    stream: true,
    logs: true,
    tty: false
  }, function ( err, stream ) {
    if ( err ) {
      cb( err ); // Handle attachment errors.
    } else {
      // Demultiplex the Docker stream (which combines stdout/stderr) and pipe it.
      // Note: The original code pipes to process.stdout twice, which might be a bug or intentional for simplicity.
      // For Type I, we must replicate the exact logic.
      container.modem.demuxStream( stream, process.stdout, process.stdout );
      cb(); // Indicate success.
    }
  });
}


/**
 * Starts a new application container from a given image ID.
 *
 * @param {string} appId - The image ID (or name) to create and start a container from.
 * @param {function} cb - Callback function (err, containerId).
 */
Dockship.prototype.startApp = function ( appId, cb ) {
  // Create a new container instance.
  this.docker.createContainer({
    Image: appId,           // Use the provided image ID.
    AttachStdout: true,     // Attach stdout for logging.
    AttachStderr: true,     // Attach stderr for logging.
  }, function ( err, container ) {
    if ( err ) {
      return cb( err ); // Handle container creation error.
    }

    // Inspect the created container to get configuration details, especially exposed ports.
    container.inspect( function ( err, containerDetails ) {
      if ( err ) {
        return cb( err ); // Handle inspection error.
      }

      var cfg = {
        PortBindings: {} // Configuration object for port bindings.
      }

      var exposedPorts = containerDetails.Config.ExposedPorts; // Get ports exposed by the image.
      // Iterate over exposed ports and create host port bindings.
      for ( var i in exposedPorts ) {
        cfg.PortBindings[i] = [ // Key is container port (e.g., "80/tcp").
          {
            HostIp: '0.0.0.0',          // Bind to all network interfaces.
            HostPort: i.split('/')[0]   // Use the same port number on the host.
          }
        ]
      }

      // Start the container with the configured port bindings.
      container.start( cfg, function ( err ) {
        if ( err ) {
          return cb( err ); // Handle container start error.
        }
        cb( null, container.id ); // Return the ID of the started container.
      });

    });

  });
};


/**
 * Extracts the clean application name from a Docker image tag.
 * Removes the Dockship prefix and ':latest' suffix.
 *
 * @param {string} instanceName - The full Docker image tag (e.g., 'dockship_my-app:latest').
 * @returns {string} The clean application name (e.g., 'my-app').
 */
Dockship.prototype.getAppName = function ( instanceName ) {
  // Remove the image prefix.
  return instanceName
    .replace( new RegExp( '^' + this.opts.image_prefix ), '' )
    // Remove the ':latest' tag.
    .replace( /:latest$/, '' );
};


/**
 * Generates the full Docker image tag for a given application name.
 *
 * @param {string} appName - The clean application name.
 * @returns {string} The full Docker image tag (e.g., 'dockship_my-app:latest').
 */
Dockship.prototype.getInstanceName = function ( appName ) {
  return this.opts.image_prefix + appName + ':latest';
}


/**
 * Stops and removes a running application container.
 *
 * @param {string} appId - The ID of the container to stop and remove.
 * @param {function} cb - Callback function (err).
 */
Dockship.prototype.stopApp = function ( appId, cb ) {
  var container = this.docker.getContainer( appId ); // Get container object by ID.

  // Stop the container.
  container.stop( function ( err ) {
    if ( err ) {
      return cb( err ); // Handle stop error.
    }
    container.remove( cb ); // Remove the container after stopping.
  });
};


// Export the Dockship constructor for external use.
module.exports = Dockship;


// --- Helper Functions (Added to Array.prototype) ---


/**
 * Custom Array prototype method to remove all occurrences of a specified value.
 * If no value is specified, it removes 'undefined'.
 *
 * @param {*} deleteValue - The value to remove from the array. Defaults to undefined.
 * @returns {Array} The modified array.
 */
Array.prototype.clean = function ( deleteValue ) {
  deleteValue = deleteValue === undefined ? undefined : deleteValue; // Ensure default is strictly undefined.
  for ( var i = 0; i < this.length; i++ ) {
    if ( this[i] === deleteValue ) {
      this.splice( i, 1 ); // Remove the element.
      i--; // Decrement index to re-check the new element at the current position.
    }
  }
  return this; // Return the cleaned array.
};