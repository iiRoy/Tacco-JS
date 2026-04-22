'use strict'; // This directive enforces strict parsing and error handling in the script.

/**
 * Initializes the Grunt plugin module.
 * This function is designed to be called by Grunt, providing it with the Grunt API.
 * @param {object} grunt - The Grunt API object.
 */
exports.init = function (grunt) {

    // Load external dependencies required for this module's functionality.
    // `shelljs` provides portable Unix shell commands for Node.js.
    var shell = require('shelljs');

    // `line-reader` is typically used for reading files line by line.
    // Note: In the provided code, `lineReader` is declared but not explicitly used.
    var lineReader = require("line-reader");

    // Initialize a local `exports` object.
    // This object will accumulate all the public methods and properties
    // that this Grunt plugin will expose.
    var exports = {};

    // =====================================================================
    //                         Database Operations
    // =====================================================================

    /**
     * Executes a database dump operation, writing the output to a file.
     * This method orchestrates the creation of a database backup.
     *
     * @param {object} config         - Configuration object for database connection details.
     * @param {object} output_paths   - Object containing the `dir` (directory) and `file` (full path) for the dump.
     */
    exports.db_dump = function(config, output_paths) {

        // Ensure that the target output directory exists.
        // Grunt's file utility will create it if it doesn't.
        grunt.file.mkdir(output_paths.dir);

        // Generate the specific `mysqldump` command based on the provided configuration.
        var cmd = exports.mysqldump_cmd(config);

        // Execute the generated command using `shelljs`.
        // The `{silent: true}` option prevents command output from polluting the console.
        // The `.output` property captures stdout/stderr from the command.
        var output = shell.exec(cmd, { silent: true }).output;

        // Write the captured database dump content to the specified file path.
        grunt.file.write(output_paths.file, output);

        // Log a success message to the Grunt console, indicating where the dump was saved.
        grunt.log.oklns("Database DUMP succesfully exported to: " + output_paths.file);
    };


    /**
     * Handles the import of a database dump from a source file into the database.
     * This function is responsible for restoring a database from a backup.
     *
     * @param {object} config   - Database connection configuration.
     * @param {string} src      - The file path to the SQL dump file to be imported.
     */
    exports.db_import = function(config, src) {
        // Generate and execute the `mysql` command to import the SQL dump.
        // The `mysql_cmd` function handles the construction of the command,
        // including SSH tunneling if configured.
        shell.exec(exports.mysql_cmd(config, src));

        // Display a confirmation message upon successful completion of the import.
        grunt.log.oklns("Database imported succesfully");
    };


    // =====================================================================
    //                           Rsync Operations
    // =====================================================================

    /**
     * Performs a "push" rsync operation: copying data from a local source to a remote destination.
     * This is typically used for deploying local files to a server.
     *
     * @param {object} config - Configuration object containing rsync parameters (from, to, ssh_host, etc.).
     */
    exports.rsync_push = function(config) {

        // Announce the start of the rsync operation, specifying source and destination.
        grunt.log.oklns("Syncing data from '" + config.from + "' to '" + config.to + "' with rsync.");

        // Construct the full rsync command string using the push-specific template.
        var cmd = exports.rsync_push_cmd(config);

        // Output the exact rsync command that will be executed for transparency/debugging.
        grunt.log.writeln(cmd);

        // Execute the rsync command using the shell.
        shell.exec(cmd);

        // Confirm that the rsync operation has finished successfully.
        grunt.log.oklns("Sync completed successfully.");
    };


    /**
     * Executes a "pull" rsync operation: copying data from a remote source to a local destination.
     * Useful for downloading files from a server to a local development environment.
     *
     * @param {object} config - Configuration object with rsync parameters.
     */
    exports.rsync_pull = function(config) {

        // Log the details of the incoming sync operation.
        grunt.log.oklns("Syncing data from '" + config.from + "' to '" + config.to + "' with rsync.");

        // Generate the complete rsync command tailored for pulling data.
        var cmd = exports.rsync_pull_cmd(config);

        // Execute the rsync command through the system shell.
        shell.exec(cmd);

        // Provide a success notification once the pull is complete.
        grunt.log.oklns("Sync completed successfully.");
    };


    // =====================================================================
    //                            Utility Functions
    // =====================================================================

    /**
     * Generates a structured object containing paths for database backups.
     * The paths are dynamically created based on the target environment and current date/time.
     *
     * @param {string} target       - The deployment target or environment name (e.g., 'production', 'staging').
     * @param {object} task_options - Options passed to the Grunt task, potentially including a custom backup directory.
     * @returns {object} An object with `dir` (the backup directory path) and `file` (the full SQL file path).
     */
    exports.generate_backup_paths = function(target, task_options) {

        // Determine the base directory for backups. Defaults to "backups" if not specified in options.
        var backups_dir = task_options['backups_dir'] || "backups";

        // Process the `backup_path` template using Grunt's templating engine.
        // This creates a unique directory path for each backup based on environment, date, and time.
        var directory = grunt.template.process(tpls.backup_path, {
            data: {
                backups_dir: backups_dir,                         // The determined base backup directory.
                env: target,                                      // The environment identifier.
                date: grunt.template.today('yyyymmdd'),           // Current date in YYYYMMDD format.
                time: grunt.template.today('HH-MM-ss'),           // Current time in HH-MM-ss format.
            }
        });

        // Construct the full file path for the SQL backup file within the generated directory.
        var filepath = directory + '/db_backup.sql';

        // Return an object containing both the directory and the full file path.
        return {
            dir: directory,
            file: filepath
        };
    };

    /**
     * Takes an array of rsync options and concatenates them into a single, space-separated string.
     * This is useful for building the argument string for the `rsync` command.
     *
     * @param {Array<string>} options - An array where each element is an rsync command-line option.
     * @returns {string} A single string of rsync arguments.
     */
    exports.compose_rsync_options = function(options) {
        // Use the `join` method to concatenate array elements with a space in between.
        var args = options.join(' ');

        return args; // Return the resulting argument string.
    };

    /**
     * Constructs a string of `--exclude` arguments for rsync from an array of exclusion patterns.
     * Each pattern is wrapped in single quotes to handle spaces or special characters correctly.
     *
     * @param {Array<string>} options - An array of file/directory patterns to be excluded from rsync.
     * @returns {string} A string containing multiple `--exclude 'pattern'` arguments.
     */
    exports.compose_rsync_exclusions = function(options) {
        var exclusions = ''; // Initialize an empty string to build the exclusions.
        var i = 0;           // Initialize a loop counter.

        // Loop through each exclusion option provided.
        for (i = 0; i < options.length; i++) {
            // Append the `--exclude` flag followed by the quoted option to the string.
            exclusions += "--exclude '" + options[i] + "' ";
        }

        // Remove any trailing whitespace from the final exclusions string.
        exclusions = exclusions.trim();

        return exclusions; // Return the complete string of exclusion arguments.
    };


    /**
     * Adapts a database dump file by replacing occurrences of an old URL with a new one.
     * This is particularly useful for migrating WordPress or similar sites between environments.
     * The function reads the file, performs replacements, and then writes the modified content back.
     *
     * @param {string} old_url - The URL string to search for within the database dump.
     * @param {string} new_url - The URL string to replace `old_url` with.
     * @param {string} file    - The path to the database dump file.
     */
    exports.db_adapt = function(old_url, new_url, file) {

        // Log the action being performed for user feedback.
        grunt.log.oklns("Adapt the database: set the correct urls for the destination in the database.");

        // Read the entire content of the specified database dump file into a string.
        var content = grunt.file.read(file);

        // Call the `replace_urls` utility to perform the actual URL substitution.
        var output = exports.replace_urls(old_url, new_url, content);

        // Write the modified content back to the original database dump file.
        grunt.file.write(file, output);
    };

    /**
     * A wrapper function that orchestrates URL replacement in a given content string.
     * It intelligently handles both serialized (e.g., PHP `serialize` output) and plain string replacements.
     *
     * @param {string} search   - The URL string to locate.
     * @param {string} replace  - The URL string to substitute `search` with.
     * @param {string} content  - The full string content (e.g., a database dump) to process.
     * @returns {string} The content string with all specified URL replacements applied.
     */
    exports.replace_urls = function(search, replace, content) {
        // First, attempt to replace URLs within serialized data structures.
        // This is crucial for maintaining data integrity in formats like WordPress options.
        content = exports.replace_urls_in_serialized(search, replace, content);

        // After handling serialized data, replace any remaining plain URL occurrences.
        content = exports.replace_urls_in_string(search, replace, content);

        return content; // Return the content after all replacements have been made.
    };

    /**
     * Specifically designed to replace URLs found within PHP serialized strings.
     * This function is aware of the `s:length:"string";` format and adjusts the `length`
     * parameter when the string content changes, preventing data corruption.
     *
     * @param {string} search   - The URL to find inside serialized string values.
     * @param {string} replace  - The URL to replace `search` with.
     * @param {string} string   - The input string potentially containing PHP serialized data.
     * @returns {string} The modified string with serialized URLs updated and lengths adjusted.
     */
    exports.replace_urls_in_serialized = function(search, replace, string) {

        // Calculate the difference in length between the search and replace strings.
        // This delta is used to adjust the length indicator in PHP serialized data.
        var length_delta = search.length - replace.length;

        // Create a global regular expression for the search string.
        // The 'g' flag ensures all occurrences are matched.
        var search_regexp = new RegExp(search, 'g');

        // Declare variables that will be used within the loop to store match details.
        var matches, length, delimiter, old_serialized_data, target_string, new_url, occurences;

        // Regular expression to find PHP serialized string patterns: `s:length:delimiter"string"delimiter;`.
        // - `s:` matches the literal "s:" indicating a string type.
        // - `(\d+)` captures the length of the string (group 1).
        // - `([\\]*['"])` captures the delimiter (single or double quote, possibly escaped) (group 2).
        // - `(.*?)` captures the actual string content non-greedily (group 3).
        // - `\2;` matches the closing delimiter (same as group 2) and the semicolon.
        var regexp = /s:(\d+):([\\]*['"])(.*?)\2;/g;

        // Loop through all matches of the serialized string pattern in the input `string`.
        while (matches = regexp.exec(string)) {
            old_serialized_data = matches[0]; // The entire matched serialized string (e.g., s:10:"old_url";).
            target_string = matches[3];       // The raw string content within the delimiters (e.g., "old_url").

            // Check if the actual string content contains the URL we are trying to replace.
            if (target_string.indexOf(search) !== -1) {
                // Count the number of times the `search` string appears within the `target_string`.
                occurences = target_string.match(search_regexp).length;

                length = matches[1];     // Extract the declared length of the string.
                delimiter = matches[2];  // Extract the delimiter (e.g., ' or ").

                // Perform the URL replacement within the `target_string`.
                new_url = target_string.replace(search_regexp, replace);

                // Adjust the declared length based on the `length_delta` and the number of occurrences.
                // This is critical for PHP's `unserialize` function to work correctly.
                length -= length_delta * occurences;

                // Compose the new serialized data string with the adjusted length and the new URL.
                var new_serialized_data = 's:' + length + ':' + delimiter + new_url + delimiter + ';';

                // Replace the original serialized data block with the newly composed one in the main string.
                string = string.replace(old_serialized_data, new_serialized_data);
            }
        }

        return string; // Return the string after all serialized URL replacements.
    };

    /**
     * Replaces plain (non-serialized) occurrences of a URL string within a larger string.
     * This function uses a regular expression to avoid accidental replacement of the `replace`
     * string itself if it happens to be a substring of the `search` string.
     *
     * @param {string} search   - The URL or string to find.
     * @param {string} replace  - The URL or string to substitute `search` with.
     * @param {string} string   - The content string to perform replacements on.
     * @returns {string} The modified string with plain URL occurrences replaced.
     */
    exports.replace_urls_in_string = function(search, replace, string) {
        // Create a regular expression that matches `search` globally,
        // but *only* if it's not immediately preceded by `replace` (negative lookahead `?!`).
        // This prevents infinite loops or incorrect replacements if `replace` contains `search`.
        var regexp = new RegExp('(?!' + replace + ')(' + search + ')', 'g');

        // Execute the global replacement and return the result.
        return string.replace(regexp, replace);
    };

    /*
     * =====================================================================
     *                       Command Generator Functions
     * These functions are responsible for constructing the actual shell
     * commands (e.g., mysqldump, mysql, rsync) based on configuration.
     * =====================================================================
     */

    /**
     * Generates the complete `mysqldump` command string.
     * It handles both local database dumps and remote dumps via an SSH tunnel.
     *
     * @param {object} config - Configuration object containing database and optional SSH details.
     * @returns {string} The final `mysqldump` command string ready for execution.
     */
    exports.mysqldump_cmd = function(config) {

        // Process the base `mysqldump` template with database connection parameters.
        var cmd = grunt.template.process(tpls.mysqldump, {
            data: {
                user: config.user,       // Database username.
                pass: config.pass,       // Database password.
                database: config.database, // Name of the database to dump.
                host: config.host        // Database host (e.g., 'localhost').
            }
        });

        // Check if an SSH host is defined in the configuration.
        // If `ssh_host` is present, it indicates a remote operation.
        if (typeof config.ssh_host === "undefined") {
            // Log a message indicating a local database dump.
            grunt.log.oklns("Creating DUMP of local database");
        } else {
            // Log a message for a remote database dump.
            grunt.log.oklns("Creating DUMP of remote database");

            // Process the `ssh` template to get the SSH command prefix.
            var tpl_ssh = grunt.template.process(tpls.ssh, {
                data: {
                    host: config.ssh_host // The SSH host address.
                }
            });

            // Prepend the SSH command to execute `mysqldump` on the remote server.
            // The `mysqldump` command itself is wrapped in single quotes to ensure
            // it's treated as a single command by the remote shell.
            cmd = tpl_ssh + " '" + cmd + "'";
        }

        return cmd; // Return the fully constructed command string.
    };

    /**
     * Generates the `mysql` command string for importing an SQL dump.
     * This function supports importing into both local and remote databases via SSH.
     *
     * @param {object} config - Configuration for database connection and optional SSH.
     * @param {string} src    - The path to the source SQL dump file.
     * @returns {string} The complete `mysql` import command string.
     */
    exports.mysql_cmd = function(config, src) {

        // Process the base `mysql` template with database credentials.
        var cmd = grunt.template.process(tpls.mysql, {
            data: {
                host: config.host,       // Database host.
                user: config.user,       // Database user.
                pass: config.pass,       // Database password.
                database: config.database, // Database name to import into.
                path: src                // Path to the SQL dump file (used in local case).
            }
        });

        // Determine if the import operation is local or remote based on `ssh_host`.
        if (typeof config.ssh_host === "undefined") {
            // Log for a local database import.
            grunt.log.oklns("Importing DUMP into local database");

            // For local import, redirect the source file as standard input to the mysql command.
            cmd = cmd + " < " + src;
        } else {
            // If it's a remote import, construct the SSH command prefix.
            var tpl_ssh = grunt.template.process(tpls.ssh, {
                data: {
                    host: config.ssh_host // SSH host for the remote connection.
                }
            });

            // Log for a remote database import.
            grunt.log.oklns("Importing DUMP into remote database");

            // Construct the remote command: SSH into host, execute mysql command (quoted),
            // and then redirect the local source file's content to the remote mysql process.
            cmd = tpl_ssh + " '" + cmd + "' < " + src;
        }

        return cmd; // Return the final command string.
    };

    /**
     * Generates the `rsync` command string specifically for pushing data.
     * This command typically includes options for SSH, exclusions, and deletion.
     *
     * @param {object} config - Rsync configuration object.
     * @returns {string} The `rsync` command for pushing data.
     */
    exports.rsync_push_cmd = function(config) {

        // Process the `rsync_push` template, filling in all dynamic parameters.
        var cmd = grunt.template.process(tpls.rsync_push, {
            data: {
                rsync_args: config.rsync_args,   // General rsync arguments (e.g., -avz).
                ssh_host: config.ssh_host,       // SSH host for remote connection.
                from: config.from,               // Local source path.
                to: config.to,                   // Remote destination path.
                exclusions: config.exclusions    // String of `--exclude` arguments.
            }
        });

        return cmd; // Return the generated rsync command.
    };

    /**
     * Generates the `rsync` command string specifically for pulling data.
     * This command will copy files from a remote location to a local one.
     *
     * @param {object} config - Rsync configuration object.
     * @returns {string} The `rsync` command for pulling data.
     */
    exports.rsync_pull_cmd = function(config) {

        // Process the `rsync_pull` template with the provided configuration data.
        var cmd = grunt.template.process(tpls.rsync_pull, {
            data: {
                rsync_args: config.rsync_args,   // General rsync arguments.
                ssh_host: config.ssh_host,       // SSH host for remote connection.
                from: config.from,               // Remote source path.
                to: config.to,                   // Local destination path.
                exclusions: config.exclusions    // String of `--exclude` arguments.
            }
        });

        return cmd; // Return the complete rsync pull command.
    };


    // =====================================================================
    //                            Command Templates
    // =====================================================================

    /**
     * `tpls` is an object containing string templates for various shell commands.
     * These templates use Grunt's `<%= var_name %>` syntax for variable substitution.
     */
    var tpls = {
        // Template for constructing the dynamic backup directory path.
        backup_path: "<%= backups_dir %>/<%= env %>/<%= date %>/<%= time %>",

        // Template for the `mysqldump` command.
        mysqldump: "mysqldump -h <%= host %> -u<%= user %> -p<%= pass %> <%= database %>",

        // Template for the `mysql` command (used for imports).
        mysql: "mysql -h <%= host %> -u <%= user %> -p<%= pass %> <%= database %>",

        // Template for the `rsync` command when pushing data (local to remote).
        // Includes `--delete` and SSH tunneling.
        rsync_push: "rsync <%= rsync_args %> --delete -e 'ssh <%= ssh_host %>' <%= exclusions %> <%= from %> :<%= to %>",

        // Template for the `rsync` command when pulling data (remote to local).
        // Includes SSH tunneling.
        rsync_pull: "rsync <%= rsync_args %> -e 'ssh <%= ssh_host %>' <%= exclusions %> :<%= from %> <%= to %>",

        // Template for the base `ssh` command, used to prefix remote commands.
        ssh: "ssh <%= host %>",
    };

    // Finally, return the `exports` object, making all its methods available
    // as part of the Grunt plugin.
    return exports;
};