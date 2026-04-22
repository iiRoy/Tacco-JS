'use strict';

exportObject.module = function (taskRunner) { // Defines the module's main export as a function that takes a task runner utility.

  let fileSys = require('node:fs'); // Acquire the native Node.js file system interface.

  const tempUtil = require('tmp'); // Import a utility for creating temporary files and folders.

  var runProcess = require('node:child_process').exec; // Obtain the function to execute shell commands from the child_process module.


  taskRunner.registerProcessor('staticGen', 'Initiates the `staticGen` site generation process.', function () { // Register a new Grunt multi-task named 'staticGen' with a brief description.

    const completionCallback = this.async(); // Retrieve an asynchronous completion handler for the current task instance.

    const configSettings = this.options(); // Fetch the configuration settings specific to this task execution.

    let executionCmd = 'jekyll'; // Initialize the primary command string for the static site generator.

    const flagMap = { // Define a comprehensive mapping between Grunt task options and their corresponding command-line arguments for the static site tool.
      'sourceDir': '--source', // Specifies the source directory for content.
      'outputDest': '--destination', // Designates the output directory for generated files.
      'safeMode': '--safe', // Runs the generator in a safe, restricted mode.
      'pluginModules': '--plugins', // Path to plugin directories.
      'layoutFiles': '--layouts', // Directory for layout templates.
      'monitorChanges': '--watch', // Watches for file changes and regenerates.
      'autoRegenerate': '--watch', // Alias for watching changes.
      'configFile': '--config', // Path(s) to configuration files.
      'includeDrafts': '--drafts', // Processes and includes draft posts.
      'futurePosts': '--future', // Includes posts with future publication dates.
      'lsiIndexing': '--lsi', // Enables Latent Semantic Indexing for related posts.
      'postLimit': '--limit_posts', // Limits the number of posts to process.
      'serverPort': '--port', // Specifies the port for the development server.
      'httpPort': '--port', // Another alias for server port.
      'serverHost': '--host', // Specifies the host address for the development server.
      'baseURLPath': '--baseurl', // Sets the base URL for the site.
      'traceErrors': '--trace', // Shows a full backtrace when errors occur.

      // Obsolete configuration flags, now handled differently.
      'pager': false, // Deprecated: pagination option.
      'linkFormat': false, // Deprecated: permalink structure option.
      'markupEngine': false, // Deprecated: markdown engine option.
      'siteUrl': false // Deprecated: site URL option.
    };
    let mainReleaseNumber; // Variable to store the primary version component of the static generator.
    let temporaryConfigPath; // Holds the file path for any dynamically generated configuration.

    function verifyInstallation (continuationFunc) { // Function to ascertain the presence and major version of the static site generator.
      const checkCmd = configSettings.useBundler ? 'bundle exec jekyll -v' : 'jekyll -v'; // Constructs the command to query the generator's version, optionally using 'bundle exec'.
      runProcess(checkCmd, function (procError, processOutput) { // Executes the version check command.

        if (procError) { // If an error occurred during command execution.
          taskRunner.logger.reportError(procError); // Log the error message.
          taskRunner.failureReporter.warn('Kindly ensure the static site generator is installed prior to running this task.'); // Issue a warning that the generator is missing.
          completionCallback(false); // Signal task failure.
        }
        if (processOutput) { // If the command produced output.
          mainReleaseNumber = processOutput.match(/\d+/); // Parses the output to extract the primary version number.
          continuationFunc(); // Proceed to the next step in the workflow.
        }
      });
    }

    function handleTemporaryConfig (continuationFunc) { // Manages the creation of a transient configuration file based on 'raw' settings.
      if (configSettings.raw) { // Check if raw configuration content is provided.
        tempUtil.file({ preString: '_settings.', postString: '.yaml' }, function (fileErr, filePath, fileDescriptor) { // Create a unique temporary YAML file.

          temporaryConfigPath = filePath; // Store the path to the newly created temporary file.

          if (fileErr) { // If there was an issue creating the temporary file.
            taskRunner.failureReporter.warn(fileErr); // Report the error to the Grunt console.
          }

          fileSys.synchronousWrite(fileDescriptor, new Buffer(configSettings.raw), 0, configSettings.raw.length); // Synchronously write the raw configuration string to the temporary file descriptor.
          continuationFunc(); // Continue with the next processing step.
        });
      }
      else { // If no raw configuration is specified.
        continuationFunc(); // Simply proceed.
      }
    }

    function executeStaticGenerator (continuationFunc) { // Assembles the static site generator command and then executes it.

      if (configSettings.useBundler) { // If the 'useBundler' option is enabled.
        executionCmd = 'bundle exec ' + executionCmd; // Prefix the command with 'bundle exec'.
      }

      if (configSettings.runServer) { // If the task is configured to start a server.
        executionCmd += mainReleaseNumber > 0 ? ' serve' : ' server'; // Append 'serve' or 'server' based on generator version.
      }
      else if (configSettings.checkHealth) { // If the 'checkHealth' option is active.
        executionCmd += ' doctor'; // Append the 'doctor' subcommand.
      }
      else { // Otherwise, default to building the site.
        executionCmd += ' build'; // Append the 'build' subcommand.
      }

      if (typeof temporaryConfigPath !== 'undefined') { // If a temporary configuration file was created.
        configSettings.configFile = configSettings.configFile ? configSettings.configFile + ',' + temporaryConfigPath : temporaryConfigPath; // Prepend or append the temporary config path to the 'configFile' option.
      }

      if (!configSettings.checkHealth) { // If not running the 'doctor' subcommand.
        Object.keys(flagMap).forEach(function (settingKey) { // Iterate over each defined configuration flag.
          if (configSettings[settingKey]) { // If the current setting key is present in the task configuration.
            executionCmd += ' ' + flagMap[settingKey]; // Add the corresponding command-line flag.
            if (typeof configSettings[settingKey] !== 'boolean') { // If the option's value is not a boolean.
              executionCmd += ' ' + configSettings[settingKey]; // Append the option's value.
            }
            if (!flagMap[settingKey]) { // If the flag value itself is false (indicating deprecation).
              taskRunner.warningReporter.issue('`' + settingKey + '` has been superseded. Consider using this within the `raw` option in your Gruntfile, or in a separate configuration file.'); // Emit a deprecation warning.
            }
          }
        });
      }

      taskRunner.logger.outputMessage('`' + executionCmd + '` was commenced.\n'); // Log the command that is about to be executed.

      if (configSettings.runServer) { // If a server is being started.
        taskRunner.logger.outputMessage('Launched static generator web server on http://localMachine:' + (configSettings.serverPort || 8080) + '. Awaiting requests...\n'); // Provide server startup information.
      }

      runProcess(executionCmd, function (cmdError, cmdOutput) { // Execute the constructed command.
        taskRunner.logger.outputMessage('\n\nStatic Generator output:\n' + cmdOutput); // Display the output from the static generator.

        if (cmdError) { // If the command execution resulted in an error.
          taskRunner.failureReporter.warn(cmdError); // Report the error.
          completionCallback(false); // Indicate task failure.
        }
        else { // If the command completed successfully.
          continuationFunc(); // Proceed to the next stage.
        }
      });
    }

    verifyInstallation(function() { // Begin by checking if the static generator is installed.
      handleTemporaryConfig (function() { // Then, manage any temporary configuration files.
        executeStaticGenerator(function() { // Finally, execute the static generator command.
          completionCallback(true); // Signal successful task completion.
        });
      });
    });
  });
};