'use strict';

module.exports.initialize = function (taskRunner) {
  // Pull in necessary external modules for system operations.
  const systemExec = require('shelljs');
  // The 'fileScanner' module is loaded but not actively used in this implementation.
  const fileScanner = require("line-reader");

  // Define the core utility object that will hold all exportable functions.
  let toolbelt = {};

  /**
   *   Executes a database dump process based on the provided configuration.
   *   @param   {Object}   dbSettings          Database connection parameters.
   *   @param   {Object}   destinationPaths    Object specifying the target directory and file.
   */
  toolbelt.databaseExport = function (dbSettings, destinationPaths) {
    // Ensure the output directory for the dump exists.
    taskRunner.file.mkdir(destinationPaths.directory);

    // Construct the command string for the MySQL dump operation.
    const commandString = toolbelt.createMysqlDumpCommand(dbSettings);

    // Run the generated command, suppressing console output, and capture the result.
    const operationResult = systemExec.exec(commandString, {
      silent: true
    }).output;

    // Write the captured database dump content to the specified file.
    taskRunner.file.write(destinationPaths.filePath, operationResult);
    // Log a confirmation message indicating successful export.
    taskRunner.log.oklns(`Database backup successfully written to: ${destinationPaths.filePath}`);
  };

  /**
   *   Manages the import of a database backup file into a specified database.
   *   @param   {Object}   dbSettings    Database connection details.
   *   @param   {String}   sourceFile    Path to the SQL backup file for import.
   */
  toolbelt.databaseImport = function (dbSettings, sourceFile) {
    // Execute the MySQL command to import the database.
    systemExec.exec(toolbelt.createMysqlImportCommand(dbSettings, sourceFile));
    // Provide a success message upon completion of the import.
    taskRunner.log.oklns("Database restoration completed.");
  };

  /**
   *   Performs a data synchronization operation from local to remote using rsync.
   *   @param   {Object}   syncSettings    Configuration for the rsync push operation.
   */
  toolbelt.syncDataOut = function (syncSettings) {
    // Announce the initiation of the push synchronization.
    taskRunner.log.oklns(`Transferring files from '${syncSettings.sourcePath}' to '${syncSettings.destinationPath}' via rsync.`);

    // Generate the specific rsync command for pushing data.
    const operationCmd = toolbelt.createRsyncPushCommand(syncSettings);
    // Output the full command string for transparency.
    taskRunner.log.writeln(operationCmd);

    // Execute the rsync command in the system shell.
    systemExec.exec(operationCmd);

    // Confirm that the synchronization process has finished.
    taskRunner.log.oklns("File synchronization finished.");
  };

  /**
   *   Handles data retrieval from a remote location to local using rsync.
   *   @param   {Object}   syncSettings    Configuration for the rsync pull operation.
   */
  toolbelt.syncDataIn = function (syncSettings) {
    // Notify the user about the start of the data pull.
    taskRunner.log.oklns(`Retrieving data from '${syncSettings.sourcePath}' to '${syncSettings.destinationPath}' via rsync.`);

    // Build the rsync command for pulling data.
    const operationCmd = toolbelt.createRsyncPullCommand(syncSettings);
    // Execute the constructed rsync command.
    systemExec.exec(operationCmd);

    // Log the successful completion of the data retrieval.
    taskRunner.log.oklns("Data retrieval concluded successfully.");
  };

  /**
   *   Constructs and returns directory and file paths for database backups.
   *   @param   {String}   environmentTag    A label identifying the deployment environment.
   *   @param   {Object}   utilityOptions    An object containing optional settings like the backup base directory.
   *   @returns {Object}                     An object with 'directory' and 'filePath' properties.
   */
  toolbelt.createBackupLocations = function (environmentTag, utilityOptions) {
    // Determine the base directory for backups; defaults to "backups" if not specified.
    const archiveDirectory = utilityOptions['archiveBaseDir'] || "backups";

    // Process a template to generate the full target directory path, incorporating environment, date, and time.
    const targetDirectory = taskRunner.template.process(templateDefinitions.archivePath, {
      data: {
        archiveDirectory: archiveDirectory,
        environmentIdentifier: environmentTag,
        currentDate: taskRunner.template.today('yyyymmdd'),
        currentTime: taskRunner.template.today('HH-MM-ss'),
      }
    });

    // Formulate the complete file path for the SQL backup.
    const targetFilePath = targetDirectory + '/database_snapshot.sql';

    // Return the generated paths.
    return {
      directory: targetDirectory,
      filePath: targetFilePath
    };
  };

  /**
   *   Combines an array of rsync arguments into a single command-line compatible string.
   *   @param   {Array<string>}   argList    An array of individual rsync options.
   *   @returns {string}                     A space-separated string of rsync arguments.
   */
  toolbelt.buildRsyncOptions = function (argList) {
    // Join all elements of the array with a space.
    const argumentString = argList.join(' ');

    return argumentString;
  };

  /**
   *   Generates a formatted string of '--exclude' options for rsync from a list.
   *   @param   {Array<string>}   exclusionList    An array of patterns or paths to exclude.
   *   @returns {string}                           A string containing multiple '--exclude' clauses.
   */
  toolbelt.buildRsyncExclusions = function (exclusionList) {
    let exclusionString = '';
    let idx = 0;

    // Loop through each item in the list and append it as an rsync exclude option.
    for (idx = 0; idx < exclusionList.length; idx++) {
      exclusionString += `--exclude '${exclusionList[idx]}' `;
    }

    // Trim any excess whitespace from the end of the generated string.
    exclusionString = exclusionString.trim();

    return exclusionString;
  };

  /**
   *   Modifies a database dump file to update URLs, ensuring consistency for the target environment.
   *   @param   {string}   originalUrl     The URL string to be found and replaced.
   *   @param   {string}   replacementUrl  The new URL string to substitute.
   *   @param   {string}   dataFile        The path to the database dump file.
   */
  toolbelt.databaseAdjust = function (originalUrl, replacementUrl, dataFile) {
    taskRunner.log.oklns("Adjusting database: updating URLs for the target environment.");
    // Read the entire content of the specified database file.
    let fileContent = taskRunner.file.read(dataFile);

    // Apply URL replacement logic to the file's content.
    const modifiedContent = toolbelt.substituteUrls(originalUrl, replacementUrl, fileContent);

    // Write the updated content back to the original database file.
    taskRunner.file.write(dataFile, modifiedContent);
  };

  /**
   *   Coordinates the replacement of URLs within a given string,
   *   handling both serialized and plain text occurrences.
   *   @param   {string}   searchTerm     The URL pattern to search for.
   *   @param   {string}   replaceTerm    The URL pattern to insert.
   *   @param   {string}   inputData      The string content where replacements should occur.
   *   @returns {string}                  The processed string with all URLs updated.
   */
  toolbelt.substituteUrls = function (searchTerm, replaceTerm, inputData) {
    // First, process any URLs embedded within serialized data structures (e.g., PHP serialized arrays).
    inputData = toolbelt.substituteSerializedUrls(searchTerm, replaceTerm, inputData);
    // Next, perform a general replacement for all plain text occurrences of the URL.
    inputData = toolbelt.substitutePlainUrls(searchTerm, replaceTerm, inputData);

    return inputData;
  };

  /**
   *   Intelligently replaces URLs within PHP-serialized strings,
   *   also updating the length metadata associated with the string values.
   *   This function is vital for maintaining data integrity in contexts like WordPress migrations.
   *   @param   {string}   searchTerm     The specific URL string to locate.
   *   @param   {string}   replaceTerm    The new URL string to substitute.
   *   @param   {string}   targetContent  The string containing the serialized data.
   *   @returns {string}                  The modified string with updated serialized URLs and lengths.
   */
  toolbelt.substituteSerializedUrls = function (searchTerm, replaceTerm, targetContent) {
    // Calculate the difference in character count between the old and new URLs.
    const sizeDifference = searchTerm.length - replaceTerm.length;
    // Create a global regular expression for finding all instances of the search term.
    const searchPattern = new RegExp(searchTerm, 'g');

    // Regular expression to match PHP serialized string format (e.g., s:LENGTH:"VALUE";).
    const serializationPattern = /s:(\d+):([\\]*['"])(.*?)\2;/g;
    let foundMatches,
      valueLength,
      stringDelimiter,
      previousSerializedData,
      subjectString,
      updatedUrlValue,
      matchCount;

    // Iterate through all occurrences of serialized strings in the content.
    while ((foundMatches = serializationPattern.exec(targetContent)) !== null) {
      previousSerializedData = foundMatches[0]; // Captures the full serialized string.
      subjectString = foundMatches[3]; // Isolates the actual string value within the serialization.

      // Check if the extracted string value contains the URL we intend to replace.
      if (subjectString.indexOf(searchTerm) !== -1) {
        matchCount = subjectString.match(searchPattern).length; // Count how many times the URL appears.
        valueLength = parseInt(foundMatches[1], 10); // Parse the original declared string length.
        stringDelimiter = foundMatches[2]; // Identify the quote type used as a delimiter.

        // Perform the actual URL replacement within the subject string.
        updatedUrlValue = subjectString.replace(searchPattern, replaceTerm);
        // Adjust the declared length by factoring in the size difference for each replacement.
        valueLength -= sizeDifference * matchCount;

        // Construct the new, correctly formatted serialized data string with the updated length.
        const freshSerializedData = `s:${valueLength}:${stringDelimiter}${updatedUrlValue}${stringDelimiter};`;

        // Replace the old serialized string with the newly composed one in the overall content.
        targetContent = targetContent.replace(previousSerializedData, freshSerializedData);
      }
    }

    return targetContent;
  };

  /**
   *   Executes a straightforward global string replacement for URLs in non-serialized text.
   *   Includes a negative lookahead assertion to prevent unintended self-replacement loops.
   *   @param   {string}   searchTerm     The string to be located.
   *   @param   {string}   replaceTerm    The string to use for substitution.
   *   @param   {string}   targetContent  The content string to be processed.
   *   @returns {string}                  The modified content string with simple URL replacements.
   */
  toolbelt.substitutePlainUrls = function (searchTerm, replaceTerm, targetContent) {
    // Create a global regular expression. The negative lookahead ensures that the
    // replacement term itself is not matched if it contains the search term.
    const matchPattern = new RegExp(`(?!${replaceTerm})(${searchTerm})`, 'g');
    return targetContent.replace(matchPattern, replaceTerm);
  };

  /* ----- Command Generation Functions ----- */

  /**
   *   Composes the full command string for executing a MySQL database dump.
   *   @param   {Object}   dbSettings    Configuration object for database connection.
   *   @returns {string}                 The complete command for mysqldump.
   */
  toolbelt.createMysqlDumpCommand = function (dbSettings) {
    let commandString = taskRunner.template.process(templateDefinitions.mysqlBackup, {
      data: {
        dbUser: dbSettings.user,
        dbPass: dbSettings.pass,
        dbName: dbSettings.database,
        dbHost: dbSettings.host
      }
    });

    // Check if the database dump is targeting a local or remote server.
    if (typeof dbSettings.ssh_host === "undefined") {
      taskRunner.log.oklns("Generating backup for local database.");
    } else {
      taskRunner.log.oklns("Initiating remote database dump.");
      // For remote dumps, prefix the command with an SSH connection instruction.
      const sshCommandTemplate = taskRunner.template.process(templateDefinitions.sshConnect, {
        data: {
          remoteHost: dbSettings.ssh_host
        }
      });
      commandString = `${sshCommandTemplate} '${commandString}'`;
    }

    return commandString;
  };

  /**
   *   Constructs the full command string required to import a MySQL database backup.
   *   @param   {Object}   dbSettings    Database connection configuration.
   *   @param   {string}   sourceFile    The absolute path to the SQL dump file.
   *   @returns {string}                 The complete command for MySQL import.
   */
  toolbelt.createMysqlImportCommand = function (dbSettings, sourceFile) {
    let commandString = taskRunner.template.process(templateDefinitions.mysqlRestore, {
      data: {
        dbHost: dbSettings.host,
        dbUser: dbSettings.user,
        dbPass: dbSettings.pass,
        dbName: dbSettings.database,
        inputPath: sourceFile
      }
    });

    // Determine if the import operation is local or involves a remote host.
    if (typeof dbSettings.ssh_host === "undefined") {
      taskRunner.log.oklns("Restoring backup to local database.");
      commandString = `${commandString} < ${sourceFile}`;
    } else {
      // If remote, create the SSH wrapper command.
      const sshCommandTemplate = taskRunner.template.process(templateDefinitions.sshConnect, {
        data: {
          remoteHost: dbSettings.ssh_host
        }
      });

      taskRunner.log.oklns("Restoring backup to remote database.");
      commandString = `${sshCommandTemplate} '${commandString}' < ${sourceFile}`;
    }

    return commandString;
  };

  /**
   *   Forms the rsync command string specifically for pushing (uploading) data.
   *   @param   {Object}   syncSettings    Rsync configuration parameters.
   *   @returns {string}                   The complete rsync push command.
   */
  toolbelt.createRsyncPushCommand = function (syncSettings) {
    const commandString = taskRunner.template.process(templateDefinitions.rsyncUpload, {
      data: {
        syncArguments: syncSettings.rsync_args,
        remoteHost: syncSettings.ssh_host,
        sourcePath: syncSettings.from,
        destinationPath: syncSettings.to,
        exclusionList: syncSettings.exclusions
      }
    });

    return commandString;
  };

  /**
   *   Constructs the rsync command string specifically for pulling (downloading) data.
   *   @param   {Object}   syncSettings    Rsync configuration parameters.
   *   @returns {string}                   The complete rsync pull command.
   */
  toolbelt.createRsyncPullCommand = function (syncSettings) {
    const commandString = taskRunner.template.process(templateDefinitions.rsyncDownload, {
      data: {
        syncArguments: syncSettings.rsync_args,
        remoteHost: syncSettings.ssh_host,
        sourcePath: syncSettings.from,
        destinationPath: syncSettings.to,
        exclusionList: syncSettings.exclusions
      }
    });

    return commandString;
  };

  // Centralized collection of template strings used for command generation.
  const templateDefinitions = {
    archivePath: "<%= archiveDirectory %>/<%= environmentIdentifier %>/<%= currentDate %>/<%= currentTime %>",
    mysqlBackup: "mysqldump -h <%= dbHost %> -u<%= dbUser %> -p<%= dbPass %> <%= dbName %>",
    mysqlRestore: "mysql -h <%= dbHost %> -u <%= dbUser %> -p<%= dbPass %> <%= dbName %>",
    rsyncUpload: "rsync <%= syncArguments %> --delete -e 'ssh <%= remoteHost %>' <%= exclusionList %> <%= sourcePath %> :<%= destinationPath %>",
    rsyncDownload: "rsync <%= syncArguments %> -e 'ssh <%= remoteHost %>' <%= exclusionList %> :<%= sourcePath %> <%= destinationPath %>",
    sshConnect: "ssh <%= remoteHost %>",
  };

  return toolbelt;
};