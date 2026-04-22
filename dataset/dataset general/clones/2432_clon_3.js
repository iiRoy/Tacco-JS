'use strict';

/**
 * Initializes the database and file synchronization utility functions for a build tool.
 * This module provides functionalities for database dumps, imports, URL adaptation,
 * and rsync-based file synchronization.
 *
 * @param {object} buildTool - The Grunt.js object, providing file system access, logging, and templating.
 * @returns {object} An object containing various utility functions.
 */
module.exports.init = function (buildTool) {
  // External module for executing shell commands, renamed from 'shelljs' to 'systemCommander'.
  const systemCommander = require('shelljs');

  // This object will hold all the functions exposed by this module,
  // renamed from 'exports' to 'utilityBelt' to avoid confusion with Node.js global exports.
  const utilityBelt = {};

  // Helper function for consistent logging of successful operations.
  const logSuccess = (message) => buildTool.log.oklns(message);

  // Helper function for processing Grunt templates, encapsulating the common pattern.
  const processTemplate = (templateString, dataObject) => buildTool.template.process(templateString, { data: dataObject });

  /**
   * Executes a database dump operation, writing the output to a specified file.
   * Includes validation for input parameters and error handling for command execution.
   *
   * @param {object} opSettings - Configuration settings for the database connection (user, pass, host, database).
   * @param {object} destPaths - Object containing 'dir' (directory) and 'file' (full path) for the output.
   */
  utilityBelt.exportDatabaseDump = function(opSettings, destPaths) {
    // Validate essential configuration and output paths.
    if (!opSettings || !destPaths || !destPaths.dir || !destPaths.file) {
      buildTool.log.error('Error: Invalid configuration or destination paths provided for database export.');
      return; // Exit early if validation fails.
    }

    // Ensure the target output directory exists before attempting to write the dump.
    buildTool.file.mkdir(destPaths.dir);

    // Construct the full mysqldump command string based on provided settings.
    const dumpCommand = utilityBelt.constructDumpCommand(opSettings);
    if (!dumpCommand) { // Check if command generation itself failed.
        buildTool.log.error('Failed to construct database dump command.');
        return;
    }

    // Execute the dump command silently to prevent verbose output flooding the console.
    // Capture both stdout and stderr for success/failure analysis.
    const commandResult = systemCommander.exec(dumpCommand, { silent: true });

    // Check the exit code of the executed command. A non-zero code usually indicates an error.
    if (commandResult.code !== 0) {
        buildTool.log.error(`Database dump operation failed! Error: ${commandResult.stderr}`);
        return;
    }
    const dumpOutput = commandResult.stdout; // Renamed from 'output' to 'dumpOutput' for clarity.

    // Write the captured database dump content to the specified output file.
    buildTool.file.write(destPaths.file, dumpOutput);
    logSuccess(`Database DUMP successfully exported to: ${destPaths.file}`);
  };

  /**
   * Imports a database from a given SQL dump file.
   * Validates inputs and handles command execution results.
   *
   * @param {object} opSettings - Configuration settings for the database connection (user, pass, host, database).
   * @param {string} inputFilePath - The full path to the SQL dump file to be imported.
   */
  utilityBelt.importDatabase = function(opSettings, inputFilePath) {
    // Basic validation for required parameters.
    if (!opSettings || !inputFilePath) {
      buildTool.log.error('Error: Missing configuration or source file path for database import.');
      return;
    }

    // Generate the mysql command for importing the database.
    const importCmd = utilityBelt.constructImportCommand(opSettings, inputFilePath);
    if (!importCmd) { // Check if command generation itself failed.
        buildTool.log.error('Failed to construct database import command.');
        return;
    }

    // Execute the import command. By default, 'shelljs' logs stdout/stderr unless silent: true.
    const importResult = systemCommander.exec(importCmd);

    // Verify the command's exit status.
    if (importResult.code !== 0) {
        buildTool.log.error(`Database import operation failed! Error: ${importResult.stderr}`);
        return;
    }
    logSuccess("Database import completed successfully.");
  };

  /**
   * Synchronizes data from a local source to a remote destination using rsync.
   * This is typically referred to as a "push" operation.
   *
   * @param {object} opSettings - Configuration for the rsync operation (from, to, ssh_host, rsync_args, exclusions).
   */
  utilityBelt.syncRemotePush = function(opSettings) {
    // Validate critical rsync parameters.
    if (!opSettings || !opSettings.from || !opSettings.to || !opSettings.ssh_host) {
      buildTool.log.error('Error: Invalid configuration for rsync push. Missing "from", "to", or "ssh_host".');
      return;
    }
    buildTool.log.writeln(`Initiating data synchronization (PUSH) from '${opSettings.from}' to '${opSettings.to}' via rsync...`);

    // Construct the rsync push command.
    const pushCommand = utilityBelt.constructRsyncPushCommand(opSettings);
    if (!pushCommand) {
        buildTool.log.error('Failed to construct rsync push command.');
        return;
    }
    buildTool.log.writeln(`Executing rsync command: ${pushCommand}`); // Log the full command for transparency.

    // Execute the rsync command and check for errors.
    const pushResult = systemCommander.exec(pushCommand);
    if (pushResult.code !== 0) {
        buildTool.log.error(`Rsync push operation failed! Error: ${pushResult.stderr}`);
        return;
    }
    logSuccess("Rsync push operation finished successfully.");
  };

  /**
   * Synchronizes data from a remote source to a local destination using rsync.
   * This is typically referred to as a "pull" operation.
   *
   * @param {object} opSettings - Configuration for the rsync operation (from, to, ssh_host, rsync_args, exclusions).
   */
  utilityBelt.syncRemotePull = function(opSettings) {
    // Validate critical rsync parameters.
    if (!opSettings || !opSettings.from || !opSettings.to || !opSettings.ssh_host) {
      buildTool.log.error('Error: Invalid configuration for rsync pull. Missing "from", "to", or "ssh_host".');
      return;
    }
    buildTool.log.writeln(`Initiating data synchronization (PULL) from '${opSettings.from}' to '${opSettings.to}' via rsync...`);

    // Construct the rsync pull command.
    const pullCommand = utilityBelt.constructRsyncPullCommand(opSettings);
    if (!pullCommand) {
        buildTool.log.error('Failed to construct rsync pull command.');
        return;
    }
    buildTool.log.writeln(`Executing rsync command: ${pullCommand}`); // Log the full command for transparency.

    // Execute the rsync command and check for errors.
    const pullResult = systemCommander.exec(pullCommand);
    if (pullResult.code !== 0) {
        buildTool.log.error(`Rsync pull operation failed! Error: ${pullResult.stderr}`);
        return;
    }
    logSuccess("Rsync pull operation finished successfully.");
  };

  /**
   * Generates a unique directory and file path for database backups.
   * The path incorporates a base directory, environment name, and current date/time.
   *
   * @param {string} environmentTarget - The specific environment (e.g., 'staging', 'production') for the backup.
   * @param {object} taskSettings - Task-specific options, including 'backupBaseDir'.
   * @returns {object} An object containing `backupDir` and `backupFile` paths.
   */
  utilityBelt.createBackupLocation = function(environmentTarget, taskSettings) {
    // Determine the base directory for backups, defaulting to 'archive' if not specified.
    const backupBaseDir = (taskSettings && taskSettings.backupBaseDir) || "archive"; // Renamed from 'backups_dir'.

    // Process the template to create the full backup directory path.
    const backupDirectory = processTemplate(commandTemplates.backup_path_template, {
      backupRoot: backupBaseDir, // Renamed 'backups_dir' to 'backupRoot'.
      envName: environmentTarget, // Renamed 'env' to 'envName'.
      currentDate: buildTool.template.today('YYYYMMDD'), // Changed date format specifier.
      currentTime: buildTool.template.today('HH-mm-ss'), // Changed time format specifier and separator.
    });

    // Construct the full backup file path.
    const backupFilePath = `${backupDirectory}/database_snapshot.sql`; // Renamed 'db_backup.sql'.

    return {
      backupDir: backupDirectory, // Renamed 'dir' to 'backupDir'.
      backupFile: backupFilePath  // Renamed 'file' to 'backupFile'.
    };
  };

  /**
   * Consolidates an array of rsync options into a single space-separated string.
   *
   * @param {string[]} optionList - An array of individual rsync command-line options.
   * @returns {string} A single string suitable for use in an rsync command. Returns empty string if input is not an array.
   */
  utilityBelt.assembleRsyncOptions = function(optionList) {
    // Guard clause: Ensure the input is an array.
    if (!Array.isArray(optionList)) {
        buildTool.log.warn('Warning: Rsync options must be provided as an array. Returning an empty string for options.');
        return '';
    }
    return optionList.join(' ');
  };

  /**
   * Transforms an array of exclusion patterns into a string of `--exclude` arguments for rsync.
   *
   * @param {string[]} exclusionPatterns - An array of file/directory patterns to exclude from synchronization.
   * @returns {string} A string where each pattern is prefixed with `--exclude 'pattern'`. Returns empty string if no patterns.
   */
  utilityBelt.assembleRsyncExclusions = function(exclusionPatterns) {
    // Guard clause: If no patterns or invalid input, return an empty string.
    if (!Array.isArray(exclusionPatterns) || exclusionPatterns.length === 0) {
      return '';
    }

    // Using map and join for a more declarative and functional approach compared to a traditional for loop.
    const exclusionString = exclusionPatterns
      .map(pattern => `--exclude='${pattern}'`)
      .join(' ');

    return exclusionString.trim();
  };

  /**
   * Adapts a database dump file by replacing occurrences of an old URL with a new URL.
   * This is crucial for migrating databases between environments with different domain names.
   *
   * @param {string} originalUrl - The URL string to search for within the file content.
   * @param {string} replacementUrl - The URL string to replace `originalUrl` with.
   * @param {string} targetFile - The path to the database dump file (e.g., a .sql file).
   */
  utilityBelt.adjustDatabaseUrls = function(originalUrl, replacementUrl, targetFile) {
    // Validate all required input parameters.
    if (!originalUrl || !replacementUrl || !targetFile) {
      buildTool.log.error('Error: Missing parameters for database URL adaptation. (originalUrl, replacementUrl, targetFile)');
      return;
    }
    logSuccess(`Beginning database URL adaptation in '${targetFile}': replacing '${originalUrl}' with '${replacementUrl}'.`);

    // Read the entire content of the target database dump file.
    let fileContent = buildTool.file.read(targetFile); // Renamed 'content' to 'fileContent'.

    // Delegate the actual URL replacement logic to a specialized function.
    const updatedContent = utilityBelt.performUrlReplacements(originalUrl, replacementUrl, fileContent);

    // Write the modified content back to the original file, overwriting it.
    buildTool.file.write(targetFile, updatedContent);
    logSuccess(`Database URL adaptation completed successfully for file: ${targetFile}`);
  };

  /**
   * Orchestrates the URL replacement process, handling both PHP-serialized data
   * and plain string occurrences within the input content.
   *
   * @param {string} findStr - The URL string to find.
   * @param {string} replaceStr - The URL string to replace with.
   * @param {string} inputString - The content string (e.g., database dump) to process.
   * @returns {string} The processed content string with all URLs updated.
   */
  utilityBelt.performUrlReplacements = function(findStr, replaceStr, inputString) {
    // Step 1: Handle URLs embedded within PHP-serialized data. This is critical for WordPress, etc.
    let modifiedString = utilityBelt.replaceSerializedUrls(findStr, replaceStr, inputString);
    // Step 2: Handle all other plain occurrences of the URL.
    modifiedString = utilityBelt.replacePlainUrls(findStr, replaceStr, modifiedString);

    return modifiedString;
  };

  /**
   * Specifically targets and replaces URLs within PHP-serialized string values.
   * This function correctly adjusts the length declarations (`s:LENGTH:`) in serialized data,
   * which is essential to prevent data corruption.
   *
   * @param {string} findStr - The URL string to locate within serialized values.
   * @param {string} replaceStr - The URL string to substitute.
   * @param {string} inputString - The full content string (e.g., a SQL dump).
   * @returns {string} The input string with serialized URLs and their lengths correctly updated.
   */
  utilityBelt.replaceSerializedUrls = function(findStr, replaceStr, inputString) {
    const lengthDifference = findStr.length - replaceStr.length; // Calculate the change in length.
    const searchRegex = new RegExp(findStr, 'g'); // Global regex for finding the URL.

    // Regex to match PHP serialized strings: `s:LENGTH:DELIMITER_CHAR_STRING_VALUE_DELIMITER_CHAR;`
    // The `(.*?)` uses a non-greedy quantifier for robust matching.
    const serializedStringPattern = /s:(\d+):([\\]*['"])(.*?)\2;/g;

    // Use `String.prototype.replace` with a callback function. This is a robust way
    // to handle global regex replacements, especially when the length of the matched
    // content changes, as it avoids issues with `RegExp.prototype.exec`'s `lastIndex`.
    return inputString.replace(serializedStringPattern, (fullMatch, declaredLengthStr, stringDelimiter, valueContent) => {
        const currentDeclaredLength = parseInt(declaredLengthStr, 10);

        // Check if the actual string content contains the URL we are looking for.
        if (valueContent.includes(findStr)) {
            // Count how many times the URL appears within this specific serialized string.
            const urlOccurrences = (valueContent.match(searchRegex) || []).length;

            // If no occurrences, return the original match without modification.
            // (This check is somewhat redundant with `valueContent.includes(findStr)` but adds safety).
            if (urlOccurrences === 0) {
                return fullMatch;
            }

            // Perform the actual URL replacement within the string value.
            const updatedValueContent = valueContent.replace(searchRegex, replaceStr);
            // Calculate the new declared length by adjusting for the change in URL string length and occurrences.
            const newDeclaredLength = currentDeclaredLength - (lengthDifference * urlOccurrences);

            // Reconstruct the serialized string with the new length and updated value.
            return `s:${newDeclaredLength}:${stringDelimiter}${updatedValueContent}${stringDelimiter};`;
        }
        // If the URL is not found in this serialized string, return the original match unchanged.
        return fullMatch;
    });
  };

  /**
   * Replaces all non-serialized occurrences of a URL string with a new one.
   * It includes a negative lookahead assertion to prevent replacing the `replaceStr` itself
   * if `findStr` is a substring of `replaceStr` (e.g., replacing "old.com" with "new-old.com").
   *
   * @param {string} findStr - The URL string to search for (old URL).
   * @param {string} replaceStr - The URL string to replace with (new URL).
   * @param {string} inputString - The content string to process.
   * @returns {string} The input string with plain URLs updated.
   */
  utilityBelt.replacePlainUrls = function (findStr, replaceStr, inputString) {
    // Escape special characters in `findStr` and `replaceStr` for safe use in RegExp constructor.
    const escapedFindStr = findStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const escapedReplaceStr = replaceStr.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Construct a global regular expression with a negative lookahead.
    // (?!${escapedReplaceStr}) ensures that the match is NOT immediately followed by the replacement string.
    // This prevents infinite loops or incorrect replacements if the replacement string itself contains the search string.
    const urlReplacementPattern = new RegExp(`(?!${escapedReplaceStr})(${escapedFindStr})`, 'g');
    return inputString.replace(urlReplacementPattern, replaceStr);
  };

  /**
   * Internal helper to generate an SSH command prefix if a remote host is configured.
   *
   * @param {object} hostConfig - Configuration object that might contain `ssh_host`.
   * @returns {string} An SSH command prefix (e.g., "ssh user@host") or an empty string if no SSH host.
   */
  const getSshPrefix = (hostConfig) => {
    if (hostConfig && hostConfig.ssh_host) {
      buildTool.log.writeln(`Note: Remote SSH host '${hostConfig.ssh_host}' detected.`);
      return processTemplate(commandTemplates.ssh_tunnel_template, { remoteHost: hostConfig.ssh_host });
    }
    return '';
  };

  /* Command Generation Routines: Functions responsible for building shell commands */

  /**
   * Constructs the complete `mysqldump` command string, handling both local and remote scenarios.
   *
   * @param {object} cfg - Database connection configuration (user, pass, database, host, ssh_host).
   * @returns {string} The generated mysqldump command string, or an empty string if configuration is invalid.
   */
  utilityBelt.constructDumpCommand = function(cfg) {
    // Validate essential database configuration parameters.
    if (!cfg || !cfg.user || !cfg.database) {
        buildTool.log.error('Error: Missing essential database configuration (user, database) for dump command.');
        return '';
    }

    // Generate the base mysqldump command using a template.
    const baseDumpCmd = processTemplate(commandTemplates.mysqldump_template, {
      dbUser: cfg.user,
      dbPass: cfg.pass || '', // Use an empty string if password is not explicitly provided.
      dbName: cfg.database,
      dbHost: cfg.host || 'localhost' // Default to 'localhost' if host is not specified.
    });

    const sshPrefix = getSshPrefix(cfg);
    if (sshPrefix) {
      buildTool.log.oklns("Constructing DUMP command for remote database via SSH.");
      // For remote execution, the base command needs to be properly quoted within the SSH command.
      return `${sshPrefix} '${baseDumpCmd}'`;
    } else {
      buildTool.log.oklns("Constructing DUMP command for local database.");
      return baseDumpCmd;
    }
  };

  /**
   * Constructs the complete `mysql` import command string, supporting local and remote database targets.
   *
   * @param {object} cfg - Database connection configuration (user, pass, database, host, ssh_host).
   * @param {string} sourceFile - The path to the SQL dump file to import.
   * @returns {string} The generated mysql import command string, or an empty string if configuration is invalid.
   */
  utilityBelt.constructImportCommand = function(cfg, sourceFile) {
    // Validate essential configuration and the source file path.
    if (!cfg || !cfg.user || !cfg.database || !sourceFile) {
        buildTool.log.error('Error: Missing essential database configuration or source file for import command.');
        return '';
    }

    // Generate the base mysql command for importing.
    const baseImportCmd = processTemplate(commandTemplates.mysql_template, {
      dbHost: cfg.host || 'localhost',
      dbUser: cfg.user,
      dbPass: cfg.pass || '',
      dbName: cfg.database,
      inputPath: sourceFile // Renamed 'path' to 'inputPath'.
    });

    const sshPrefix = getSshPrefix(cfg);
    if (sshPrefix) {
      buildTool.log.oklns("Constructing IMPORT command for remote database via SSH.");
      // For remote import, the local source file is piped as standard input to the remote mysql command.
      return `${sshPrefix} '${baseImportCmd}' < ${sourceFile}`;
    } else {
      buildTool.log.oklns("Constructing IMPORT command for local database.");
      return `${baseImportCmd} < ${sourceFile}`;
    }
  };

  /**
   * Constructs the `rsync` command string for a "push" operation (local to remote).
   * Includes default options and exclusion handling.
   *
   * @param {object} cfg - Rsync configuration (rsync_args, ssh_host, from, to, exclusions).
   * @returns {string} The generated rsync push command string, or an empty string if configuration is invalid.
   */
  utilityBelt.constructRsyncPushCommand = function(cfg) {
    // Validate critical parameters for rsync push.
    if (!cfg || !cfg.from || !cfg.to || !cfg.ssh_host) {
        buildTool.log.error('Error: Missing essential configuration (from, to, ssh_host) for rsync push command.');
        return '';
    }
    const pushCmd = processTemplate(commandTemplates.rsync_push_template, {
      rsyncOptions: cfg.rsync_args || '-az --stats', // Added default rsync options with stats.
      remoteSshHost: cfg.ssh_host,
      sourcePath: cfg.from,
      destPath: cfg.to,
      excludeRules: cfg.exclusions || '' // Ensure exclusions is an empty string if not provided.
    });

    return pushCmd;
  };

  /**
   * Constructs the `rsync` command string for a "pull" operation (remote to local).
   * Includes default options and exclusion handling.
   *
   * @param {object} cfg - Rsync configuration (rsync_args, ssh_host, from, to, exclusions).
   * @returns {string} The generated rsync pull command string, or an empty string if configuration is invalid.
   */
  utilityBelt.constructRsyncPullCommand = function(cfg) {
    // Validate critical parameters for rsync pull.
    if (!cfg || !cfg.from || !cfg.to || !cfg.ssh_host) {
        buildTool.log.error('Error: Missing essential configuration (from, to, ssh_host) for rsync pull command.');
        return '';
    }
    const pullCmd = processTemplate(commandTemplates.rsync_pull_template, {
      rsyncOptions: cfg.rsync_args || '-az --stats', // Added default rsync options with stats.
      remoteSshHost: cfg.ssh_host,
      sourcePath: cfg.from,
      destPath: cfg.to,
      excludeRules: cfg.exclusions || '' // Ensure exclusions is an empty string if not provided.
    });

    return pullCmd;
  };

  // Collection of command templates, renamed from 'tpls' to 'commandTemplates'.
  // Template variable names have been updated for consistency and clarity.
  const commandTemplates = {
    // Template for constructing a backup path with date and time components.
    backup_path_template: "<%= backupRoot %>/<%= envName %>/<%= currentDate %>/<%= currentTime %>",
    // Template for the mysqldump command, with conditional password inclusion.
    mysqldump_template: "mysqldump -h <%= dbHost %> -u<%= dbUser %> <% if (dbPass) { %>-p<%= dbPass %><% } %> <%= dbName %>",
    // Template for the mysql import command, with conditional password inclusion.
    mysql_template: "mysql -h <%= dbHost %> -u <%= dbUser %> <% if (dbPass) { %>-p<%= dbPass %><% } %> <%= dbName %>",
    // Template for rsync push (local to remote) operation. Includes --delete for syncing.
    rsync_push_template: "rsync <%= rsyncOptions %> --delete -e 'ssh <%= remoteSshHost %>' <%= excludeRules %> <%= sourcePath %> :<%= destPath %>",
    // Template for rsync pull (remote to local) operation.
    rsync_pull_template: "rsync <%= rsyncOptions %> -e 'ssh <%= remoteSshHost %>' <%= excludeRules %> :<%= sourcePath %> <%= destPath %>",
    // Template for an SSH tunnel command, used as a prefix for remote database operations.
    ssh_tunnel_template: "ssh <%= remoteHost %>",
  };

  // Return the collection of utility functions for the build tool to use.
  return utilityBelt;
};