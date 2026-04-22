'use strict';

// This module provides a Grunt task designed to interface with the Jekyll static site generator.
// It handles various aspects of Jekyll execution, including version checks, dynamic configuration,
// and command-line argument construction, ensuring a smooth integration into build workflows.

module.exports = function (buildTool) {
	// Import necessary Node.js modules for file system operations,
	// temporary file creation, and executing external processes.
	const fileSystemOps = require('fs');
	const tempFileHandler = require('tmp');
	const commandExecutor = require('child_process').exec;

	// Define the 'staticSiteGen' multi-task for Grunt.
	// This task encapsulates the logic for invoking Jekyll.
	buildTool.registerMultiTask('staticSiteGen', 'Orchestrates the `jekyll` static site generator command.', function () {

		// Mark this Grunt task as asynchronous and obtain the completion callback.
		const completionCallback = this.async();
		// Retrieve the user-defined options for this specific task instance.
		const taskSettings = this.options();

		// Initialize the base command for Jekyll.
		let cliExecutionString = 'jekyll';
		// A mapping object that translates Grunt task options into Jekyll CLI flags.
		// Includes entries for deprecated flags to handle them gracefully.
		const cliFlagMap = {
			'sourceDirectory': '--source',
			'destinationPath': '--destination',
			'safeModeActive': '--safe',
			'pluginDirectories': '--plugins',
			'layoutDirectories': '--layouts',
			'watchForChanges': '--watch',
			'autoRegenerate': '--watch', // An alias for watchForChanges
			'configurationFiles': '--config',
			'includeDraftContent': '--drafts',
			'displayFuturePosts': '--future',
			'lsiEnabled': '--lsi',
			'postGenerationLimit': '--limit_posts',
			'serverListenPort': '--port',
			'httpPortAlias': '--port', // An alias for serverListenPort
			'bindAddress': '--host',
			'siteBaseURL': '--baseurl',
			'enableTraceback': '--trace',

			// Deprecated flags that should trigger warnings but not fail the build.
			'legacyPaginate': false,
			'legacyPermalink': false,
			'legacyMarkdown': false,
			'legacyURL': false
		};

		let detectedJekyllMajorVersion = 0; // Stores the primary version number of Jekyll.
		let pathToTempConfig;             // Holds the file path if a temporary config is generated.

		// Helper function to dynamically append CLI arguments, handling boolean flags vs. value-based flags.
		const composeCliArgument = (currentCommand, flagOption, argumentValue) => {
			let formattedArg = ` ${flagOption}`;
			// If the value is not a simple boolean true/false, append it.
			if (argumentValue !== true && argumentValue !== false && argumentValue !== null && argumentValue !== undefined) {
				formattedArg += ` ${argumentValue}`;
			}
			return currentCommand + formattedArg;
		};

		// Stage 1: Validate Jekyll's presence and determine its version.
		// This initial check prevents failures later and allows for version-specific command adjustments.
		const performJekyllAvailabilityCheck = (proceedToNextStage) => {
			const versionQueryCommand = taskSettings.bundleExec ? 'bundle exec jekyll -v' : 'jekyll -v';
			buildTool.log.info(`Attempting to verify Jekyll installation: '${versionQueryCommand}'`);

			commandExecutor(versionQueryCommand, (procError, procOutput) => {
				if (procError) {
					buildTool.log.error(`Jekyll version check encountered an error: ${procError.message}`);
					buildTool.fail.warn('Jekyll executable not found. Ensure Jekyll is installed and its path is correctly configured.');
					return completionCallback(false); // Terminate task due to missing dependency.
				}

				if (procOutput) {
					// Parse the major version number from output like "jekyll X.Y.Z".
					const versionPatternMatch = procOutput.match(/\d+/);
					if (versionPatternMatch && versionPatternMatch[0]) {
						detectedJekyllMajorVersion = parseInt(versionPatternMatch[0], 10);
						buildTool.log.verbose(`Jekyll major version identified: ${detectedJekyllMajorVersion}`);
					} else {
						buildTool.log.warn('Unable to reliably parse Jekyll major version. Proceeding with caution.');
					}
					proceedToNextStage(); // Move to the next setup stage.
				} else {
					buildTool.log.warn('Jekyll version command produced no output. Assuming Jekyll is present.');
					proceedToNextStage(); // Continue, but indicate a potential issue.
				}
			});
		};

		// Stage 2: Process any raw configuration content provided by the user.
		// If present, this content is written to a temporary YAML file.
		const handleRawConfigurationFile = (proceedToNextStage) => {
			if (taskSettings.rawContent) {
				if (typeof taskSettings.rawContent !== 'string') {
					buildTool.fail.warn('The `rawContent` option must be a string containing valid YAML configuration.');
					return completionCallback(false);
				}

				// Create a unique temporary file for the YAML content.
				// The `discardDescriptor: true` option avoids needing `fs.closeSync`.
				tempFileHandler.file({ prefix: 'cfg_', postfix: '.yml', discardDescriptor: true }, (tempFileCreationError, tempPath) => {
					if (tempFileCreationError) {
						buildTool.log.error(`Error creating temporary config file: ${tempFileCreationError.message}`);
						buildTool.fail.warn('Could not generate a temporary file for raw Jekyll configuration.');
						return completionCallback(false);
					}

					pathToTempConfig = tempPath;
					buildTool.log.debug(`Temporary configuration file created at: ${pathToTempConfig}`);

					try {
						// Write the raw content to the newly created temporary file.
						fileSystemOps.writeFileSync(pathToTempConfig, Buffer.from(taskSettings.rawContent, 'utf8'));
						buildTool.log.verbose('Raw configuration successfully written to temporary file.');
						proceedToNextStage(); // Configuration written, advance to the next stage.
					} catch (writeOperationError) {
						buildTool.log.error(`Failed to write raw content to temporary file: ${writeOperationError.message}`);
						buildTool.fail.warn('An error occurred while writing raw Jekyll configuration.');
						completionCallback(false); // Indicate failure.
					}
				});
			} else {
				buildTool.log.verbose('No `rawContent` option specified. Skipping temporary config file generation.');
				proceedToNextStage(); // No raw content, simply move on.
			}
		};

		// Stage 3: Assemble the final Jekyll command and execute it.
		// This involves combining base command, subcommands, and all relevant flags.
		const executeJekyllProcess = (proceedToNextStage) => {
			// Prepend 'bundle exec' if the user has opted for it.
			if (taskSettings.bundleExec) {
				cliExecutionString = `bundle exec ${cliExecutionString}`;
			}

			// Determine the Jekyll subcommand based on task settings.
			if (taskSettings.serve) {
				// Jekyll's "serve" subcommand name changed in older versions.
				cliExecutionString += (detectedJekyllMajorVersion >= 1) ? ' serve' : ' server';
			} else if (taskSettings.doctor) {
				cliExecutionString += ' doctor';
			} else {
				cliExecutionString += ' build'; // Default action if no specific subcommand.
			}

			// Incorporate the temporary configuration file path into the --config flag.
			if (typeof pathToTempConfig !== 'undefined') {
				taskSettings.configurationFiles = taskSettings.configurationFiles
					? `${taskSettings.configurationFiles},${pathToTempConfig}`
					: pathToTempConfig;
				buildTool.log.debug(`Updated 'configurationFiles' with temporary path: ${taskSettings.configurationFiles}`);
			}

			// Iterate through defined CLI flags and append them to the command string.
			// This step is skipped if the 'doctor' subcommand is active.
			if (!taskSettings.doctor) {
				for (const [gruntOptionName, jekyllCliFlag] of Object.entries(cliFlagMap)) {
					// Check if the option is explicitly set in the Grunt task settings.
					if (Object.prototype.hasOwnProperty.call(taskSettings, gruntOptionName) && taskSettings[gruntOptionName] !== undefined) {
						const optionValue = taskSettings[gruntOptionName];

						if (jekyllCliFlag === false) { // Handle deprecated options.
							buildTool.log.warn(`The Grunt option '${gruntOptionName}' is deprecated. Consider using the 'rawContent' option or directly editing Jekyll config files.`);
							continue; // Skip processing this deprecated flag.
						}

						// Append the flag and its value if appropriate.
						// If value is boolean true, just add the flag. If it's a value, add flag and value.
						if (optionValue === true) {
							cliExecutionString = composeCliArgument(cliExecutionString, jekyllCliFlag);
						} else if (optionValue !== false) { // Don't append if option is explicitly false.
							cliExecutionString = composeCliArgument(cliExecutionString, jekyllCliFlag, optionValue);
						}
					}
				}
			}

			// Log the fully constructed command prior to execution.
			buildTool.log.info(`Executing Jekyll command: '${cliExecutionString}'`);

			if (taskSettings.serve) {
				const activeServerPort = taskSettings.serverListenPort || 4000;
				buildTool.log.info(`Jekyll development server active on http://localhost:${activeServerPort}. Awaiting manual termination...`);
				// Note: 'jekyll serve' typically runs indefinitely. The Grunt task will not complete
				// until the Jekyll process is externally terminated.
			}

			// Execute the Jekyll command in a child process.
			// Increased maxBuffer to handle potentially large Jekyll outputs.
			commandExecutor(cliExecutionString, { maxBuffer: 5 * 1024 * 1024 }, (procExecutionError, procStandardOutput, procStandardError) => {
				buildTool.log.debug(`\n--- Jekyll Standard Output ---\n${procStandardOutput}\n--- End Jekyll Output ---\n`);
				if (procStandardError) {
					buildTool.log.error(`Jekyll process reported errors to stderr: ${procStandardError}`);
				}

				if (procExecutionError) {
					buildTool.log.error(`Jekyll command execution failed: ${procExecutionError.message}`);
					buildTool.fail.warn('The Jekyll process exited with an error status.');
					return completionCallback(false); // Signal task failure.
				} else {
					buildTool.log.ok('Jekyll command completed successfully.');
					proceedToNextStage(); // Signal successful completion of this stage.
				}
			});
		};

		// Define the sequential flow of execution using nested callbacks.
		// Each function calls the next upon its successful completion.
		performJekyllAvailabilityCheck(() => {
			handleRawConfigurationFile(() => {
				executeJekyllProcess(() => {
					completionCallback(true); // All stages completed successfully.
				});
			});
		});
	});
};