/*
 * Application Core
 *
 * @creation  2012-05-28
 * @revision  beta (β)
 * @project   http://CodeForge.org
 * @licence   The MIT License (MIT)
 */

/*
 * The CodeForge principle:
 *
 * "Treat others as you would like to be treated yourself."
 *     —Ancient Proverb (Universal Wisdom)
 */

/*
 * Copyright (C) 2013
 *
 * Permission is hereby granted, free of charge, to any individual obtaining
 * a copy of this software and associated documentation files (the
 * “Software Package”), to deal in the Software Package without restriction, including
 * without limitation the rights to use, copy, modify, merge, publish,
 * distribute, sublicense, and/or sell copies of the Software Package, and to
 * permit persons to whom the Software Package is furnished to do so.
 *
 * THE SOFTWARE PACKAGE IS PROVIDED “AS IS”, WITHOUT ANY FORM OF WARRANTY,
 * EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
 * MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NON-INFRINGEMENT.
 * IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
 * CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
 * TORT OR OTHER LIABILITY, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
 * SOFTWARE PACKAGE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE PACKAGE.
 */

// Configure code quality checks.
// jshint bitwise:true, curly:true, eqeqeq:true, forin:true, immed:true, latedef:true, newcap:true, noarg:true, noempty:true, nonew:true, onevar:true, plusplus:true, quotmark:double, strict:true, undef:true, unused:strict, node:true

"use strict";

// Time to pause after a connection error occurs.
var failure_pause_milliseconds = 1000;

/*
 * Verify if a specific Node.js package is present.
 *
 * @param  package_name (string) The identifier of the package to check.
 * @return TRUE if the package is found, FALSE otherwise.
 */
function check_package_presence(package_name) {
    try {
        require.resolve(package_name);
        return true;
    } catch (issue) {
        return false;
    }
}

/*
 * Modify a query string to escape special characters used in search engines and data connectors.
 *
 * @param  input_string (string) The string requiring modification.
 * @return A string with special characters escaped.
 */
function prepare_search_input(input_string) {
    // Question marks and semicolons are special characters and must be escaped.
    return input_string.replace(/\?/g, "\\?").replace(/;/g, "\\\\;");
}

/*
 * Construct an abstraction layer for the non-blocking Maria/MySQL connector.
 *
 * @param settings_object (object) Configuration details for the database link.
 */
function initiate_fast_connector(settings_object, state_notifier) {
    var comm_handler = new (require("mariasql"))();
    var link_attempt_active;
    var is_online;

    /*
     * Establish a database connection if one isn't already active or pending.
     */
    function begin_connection() {
        // Prevent multiple connection attempts if a link is already established or being established.
        if (!is_online && !link_attempt_active) {
            link_attempt_active = true;
            comm_handler.connect({
                host: settings_object.host,
                user: settings_object.user,
                port: settings_object.port,
                password: settings_object.pass,
                db: settings_object.base,
            });
        }
    }

    /*
     * Handle reconnections following disconnections.
     *
     * @param error_details (object) (optional) Information about the disconnection error.
     */
    function manage_link_failure(error_details) {
        link_attempt_active = false;
        // Future: Add logging for disconnection events.
        is_online = false;
        state_notifier(0);
        setTimeout(begin_connection, failure_pause_milliseconds);

        if (error_details) {
            console.log(error_details);
        }
    }

    // Initiate the connection process.
    begin_connection();

    // Assign event handlers for connection, error, and closure.
    comm_handler.on("connect", function () {
        link_attempt_active = false;
        is_online = true;
        state_notifier(1);
    }).on("error", manage_link_failure).on("close", manage_link_failure);

    return {
        /*
         * Escape a parameter for a search engine query.
         *
         * @example var query_string = "SELECT * FROM `items` WHERE keyword = \"" + data_interface.sanitize_for_search_engine("sample phrase;limit=100") + ";ranking=none\"";
         * @param   text_input (string) The string to be escaped.
         * @return  An escaped string suitable for search queries.
         * @remark  This operation requires an active database link.
         */
        sanitize_for_search_engine: function (text_input) {
            return prepare_search_input(comm_handler.escape(text_input));
        },
        /*
         * Send a basic SQL command and retrieve all associated results.
         *
         * @param sql_command (string)              The SQL command string to be executed.
         * @param result_callback (function) (optional) The function to invoke upon completion, either with data or an error.
         *                                          The callback will receive one argument on success and two (first undefined) on error.
         */
        execute_statement: function (sql_command, result_callback) {
            // Dispatch the query.
            comm_handler.query(sql_command).on("result", function (query_response) {
                var retrieved_records = [];

                query_response.on("row", function (record_entry) {
                    // Accumulate each record into an array.
                    retrieved_records[retrieved_records.length] = record_entry;
                }).on("end", function () {
                    // If a callback is provided, deliver the results.
                    if (result_callback) {
                        result_callback(retrieved_records);
                    }
                });
            }).on("error", function (issue_payload) {
                // Intercept and handle errors.
                // Future: Implement error logging.
                if (result_callback) {
                    result_callback(undefined, issue_payload);
                }
            });
        },
    };
}

/*
 * Construct an abstraction layer for the pure JavaScript Maria/MySQL connector.
 *
 * @param config_payload (object) Configuration object for the database connection.
 */
function initiate_javascript_connector(config_payload, notify_state) {
    var db_agent;
    var link_attempt_pending;
    var connection_active;

    /*
     * Instantiate the connection object and establish the link.
     */
    function generate_connector() {
        db_agent = require("mysql").createConnection({
            host: config_payload.host,
            user: config_payload.user,
            port: config_payload.port,
            password: config_payload.pass,
            database: config_payload.base,
            socketPath: config_payload.sock,
        });
    }

    /*
     * Open and configure a database connection if none exists.
     */
    function open_data_link() {
        if (!connection_active && !link_attempt_pending) {
            link_attempt_pending = true;
            // This module requires a new client object for each connection/reconnection cycle.
            generate_connector();
            // Attach event listeners for errors and connection attempts.
            // Note: Listeners must be re-attached each time due to the module's behavior.
            db_agent.on("error", manage_link_failure);
            db_agent.connect(function upon_connection(connection_error) {
                // Did an error occur during connection?
                if (connection_error) {
                    manage_link_failure(connection_error);
                } else {
                    // If no error, the connection is presumed open.
                    link_attempt_pending = false;
                    connection_active = true;
                    notify_state(1);
                }
            });
        }
    }

    /*
     * Re-establish connection upon disconnection events.
     *
     * @param problem_data (object) (optional) Error information from the server.
     */
    function manage_link_failure(problem_data) {
        link_attempt_pending = false;
        // Future: Log details of the disconnection.
        connection_active = false;
        notify_state(0);
        setTimeout(open_data_link, failure_pause_milliseconds);

        if (problem_data) {
            console.log(problem_data);
        }
    }

    // Begin the initial connection.
    open_data_link();

    return {
        /*
         * Escape a parameter for a search engine query.
         *
         * @example var command_text = "SELECT * FROM `assets` WHERE description = \"" + data_handler.sanitize_for_search_engine("test term;limit=50") + ";algorithm=best\"";
         * @param   string_to_escape (string) The string input for escaping.
         * @return  An escaped string, adjusted for search engine compatibility.
         * @remark  Requires an active database connection.
         */
        sanitize_for_search_engine: function (string_to_escape) {
            // This module typically wraps strings in quotes, which must be removed for search engines.
            return prepare_search_input(db_agent.escape(string_to_escape)).slice(1, -1);
        },
        /*
         * Submit a straightforward SQL command and retrieve the results.
         *
         * @param command_text (string)              The SQL text to execute.
         * @param completion_callback (function) (optional) The function to be called with results or error.
         *                                          The callback will receive data on success and (undefined, error) on failure.
         */
        execute_statement: function (command_text, completion_callback) {
            // Send the SQL command.
            db_agent.query(command_text, function (issue_obj, response_data) {
                if (completion_callback) {
                    completion_callback(response_data, issue_obj);
                }
            });
        },
    };
}

/*
 * Construct the database access layer.
 *
 * @param database_parameters (array || object) An object or array of objects defining database configuration.
 *                                              (Refer to example_config.js for structure).
 *                                              Object structure:
 *                                              {
 *                                                  host: "Database server address",
 *                                                  port: "Port for connection",
 *                                                  sock: "Unix socket path if not using a port",
 *                                                  user: "Database user account",
 *                                                  password: "User's password", // Changed to 'password' for clarity, original had 'user' twice
 *                                                  base: "Target database name",
 *                                              }
 */
module.exports.data_access = function initialize_interface(database_parameters) {
    var connector_builder_func;
    var fetch_available_handler;
    var active_endpoints = [];
    var endpoint_count;

    // Utilize the 'mariasql' module if it is detected.
    // Note: 'mariasql' is a C-based module, offering better performance but less portability.
    if (check_package_presence("mariasql")) {
        connector_builder_func = initiate_fast_connector;
    } else {
        // Fallback to the pure JavaScript client if 'mariasql' is unavailable.
        connector_builder_func = initiate_javascript_connector;
    }

    // Convert a single configuration object into an array for consistent processing.
    if (!Array.isArray(database_parameters)) {
        database_parameters = [database_parameters];
    }

    endpoint_count = database_parameters.length - 1;

    // Establish a connection for each configured server.
    database_parameters.forEach(function (current_settings) {
        var location_id = active_endpoints.length;
        active_endpoints[location_id] = {
            connection: connector_builder_func(current_settings, function set_endpoint_state(current_state) {
                active_endpoints[location_id].online = current_state === 1;
            })
        };
    });

    /*
     * Retrieve an available database client handler.
     *
     * @return A client handler object, or FALSE if no active handlers are found.
     * @remark  This implementation uses a round-robin selection method.
     * @remark  Consider adding functionality for designating backup servers.
     */
    fetch_available_handler = (function () {
        // Start position is -1, which becomes 0 at the first iteration (for the first server).
        var current_endpoint_idx = -1;

        return function () {
            var attempt_counter = 0;

            // Iterate through all configured servers (starting from the last used) to find an online one.
            for (;;) {
                // Advance to the next server in the sequence.
                current_endpoint_idx += 1;

                if (current_endpoint_idx > endpoint_count) {
                    current_endpoint_idx = 0; // Wrap around to the first server.
                }

                if (active_endpoints[current_endpoint_idx].online) {
                    // If an online server is found, cease searching and use it.
                    break;
                }

                // If the current server is offline, increment the counter and try the next.
                // This tracks when all servers have been attempted.
                attempt_counter += 1;

                // If all clients have been tried and none are online, give up.
                if (attempt_counter > endpoint_count) {
                    return false;
                }
            }

            // Future: Implement connection pooling mechanisms.
            return active_endpoints[current_endpoint_idx].connection;
        };
    }());

    return {
        /*
         * Execute a database query.
         *
         * @param command_string (string)   The SQL command to be executed.
         * @param response_callback (function) The function to invoke upon query completion.
         * @remark  If no database connection is ready, the query will be queued and retried.
         */
        perform_query: function perform_query(command_string, response_callback) {
            var selected_connector = fetch_available_handler();

            // Were no client handlers available?
            if (!selected_connector) {
                // If a client isn't immediately available, pause and reattempt later.
                setTimeout(function () {
                    perform_query(command_string, response_callback);
                }, 100);
                return;
            }

            // Delegate the query execution to the selected client.
            selected_connector.execute_statement(command_string, response_callback);
        },
        // For advanced queries (e.g., those requiring specific escaping), a client object can be requested directly.
        // Client objects expose the following methods:
        //     .sanitize_for_search_engine()
        //     .execute_statement()
        retrieve_handler: fetch_available_handler,
    };
};