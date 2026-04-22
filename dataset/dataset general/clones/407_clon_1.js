( function () { /*
 * This is the main application module for monitoring dashboard.
 * It encapsulates all the logic related to fetching, processing, and displaying
 * monitoring data from a Zabbix-like API.
 */
    var zx =    // The core application object, containing settings and methods.
        {
            groups: // Configuration for different host groups, including display names and colors.
                {
                    // These are example groups that are currently commented out.
                    // "produktion":       { displayname: "prod", color: "#3dbc34" }, // Production environment
                    // "abnahme":          { displayname: "qa",   color: "#f370ff" }, // Quality Assurance environment
                    // "testing":          { displayname: "test", color: "#479bdb" }, // Testing environment

                    "others": { displayname: "allHosts", color: "#e7a000" } // A default group for all hosts.
                }

            , hiddenGroups: JSON.parse(localStorage.getItem('hiddenGroups')) || {} // Stores user-defined hidden groups, retrieved from local storage.
            , hideHostsInMaint: false // Flag to control visibility of hosts currently in maintenance.

            , log: function () { /*
             * Logs messages to a dedicated area in the UI (an element with id 'log').
             * Each argument passed to this function is converted to a JSON string and appended.
             */
                $('#log').append("--> "); // Adds a prefix to each log entry.
                for ( var i = 0, len = arguments.length; i < len; ++i ) {
                    $('#log').append(JSON.stringify(arguments[i]) + "<br>"); // Appends stringified argument and a line break.
                }
            } // End of log function.

            , s_to_d: function ( seconds ) { /*
             * Converts a total number of seconds into a human-readable duration string.
             * For example, 90000 seconds might become "1d 1h 0m 0s".
             */
                var days    = Math.floor(seconds / 86400); // Calculate number of full days.
                var hours   = Math.floor( (seconds - (days * 86400) ) / 3600 ); // Calculate remaining hours.
                var minutes = Math.floor( (seconds - (days * 86400) - (hours * 3600) ) / 60 ); // Calculate remaining minutes.
                var seconds = Math.floor( (seconds - (days * 86400) - (hours * 3600) - (minutes * 60) ) ); // Calculate remaining seconds.

                var date = []; // Array to store parts of the duration string.

                // Only add non-zero duration parts to the array.
                days    == 0 || date.push( days + 'd' );
                hours   == 0 || date.push( hours + 'h' );
                minutes == 0 || date.push( minutes + 'm' );
                seconds == 0 || date.push( seconds + 's' );

                return date.join(' '); // Join the parts with a space.
            } // End of s_to_d function.

            , chain: function chain () { /*
             * Executes a series of asynchronous functions (steps) sequentially.
             * Each step function must accept a callback argument, which it should call upon completion
             * to trigger the next step in the chain.
             */
                var steps = Array.prototype.slice.call(arguments) // Convert arguments object to a true array.
                    , i   = 0; // Index for the current step.

                function cb () {
                    if ( i === steps.length ) return; // All steps have been executed.
                    steps[++i](cb); // Execute the next step, passing 'cb' as its completion callback.
                }
                steps[i](cb); // Start the first step in the chain.
            } // End of chain function.

            , sse: function ( sse ) { /*
             * Converts a Unix timestamp (seconds since epoch) into a JavaScript Date object.
             */
                return new Date(sse * 1000); // Multiply by 1000 to convert seconds to milliseconds.
            } // End of sse function.

            , sse2dur: function ( sse ) { /*
             * Calculates the duration from a given Unix timestamp (seconds since epoch) up to the current time.
             * Returns the duration in a human-readable format using the s_to_d function.
             */
                var now = ( +new Date / 1000 ).toFixed(); // Get current time in seconds, fixed to integer.
                return zx.s_to_d(now - sse); // Calculate difference and format.
            } // End of sse2dur function.

            , authenticate: function () { /*
             * Handles user authentication against the API.
             * It prevents multiple authentication attempts and reloads the page if credentials are missing.
             */
                if ( zx.authenticating ) return false; // If already authenticating, exit.
                zx.authenticating = true; // Set flag to prevent re-entry.

                if ( zx.user && zx.pass ) { // Check if username and password are set.
                    var data = {
                        auth:      "", // Authentication token will be returned here.
                        method:    "user.authenticate", // API method to call.
                        params:    {
                            user:     zx.user,
                            password: zx.pass
                        },
                        jsonrpc: "2.0", // JSON-RPC protocol version.
                        id:      0 // Request ID.
                    };
                    send(data, function ( msg ) { // Send the authentication request.
                        zx.authtoken = msg.result; // Store the received auth token.
                        zx.run(); // Proceed to run the main application logic.
                    });
                } else {
                    alert("username and password required"); // Notify user.
                    location.reload(); // Reload the page, likely to prompt for login again.
                }
            } // End of authenticate function.

            , login: function () { /*
             * Displays the login form and handles the submission of user credentials.
             */
                $('#login').show(); // Make the login form visible.
                $('#password').focus(); // Set focus to the password input field.
                $('#button').click(function () { // Attach click handler to the login button.
                    zx.user = $('#username').val(); // Get username from the input field.
                    zx.pass = $('#password').val(); // Get password from the input field.
                    zx.authenticate(); // Attempt to authenticate with the entered credentials.
                    $('#login').hide(); // Hide the login form after submission.
                    delete zx.user; // Remove username from zx object after use for security.
                    delete zx.pass; // Remove password from zx object after use for security.
                });
            } // End of login function.

            , ustats: {} // Object to store host statistics (e.g., group memberships).

            , run: function () { /*
             * This is the main entry point for the application after authentication.
             * It initializes data fetching, sets up polling intervals, and prepares the UI.
             */
                zx.chain(
                    maintenances_bzzzt, // First, fetch maintenance data.
                    ustats_bzzzt,       // Then, fetch host statistics.
                    problems_bzzzt,     // After that, fetch current problems.
                    function () {       // Finally, set up recurring intervals for updates.
                        setInterval(maintenances_bzzzt, 21500); // Refresh maintenances every 21.5 seconds.
                        setInterval(problems_bzzzt, 10000);     // Refresh problems every 10 seconds.
                        setInterval(ustats_bzzzt, 300000);       // Refresh host statistics every 5 minutes.
                    }
                );

                var style = '<style>'; // Start building a dynamic style block.
                for ( var group in zx.groups ) { // Iterate through configured groups.
                    var _group = zx.groups[group];
                    style += '.' + _group.displayname + ' { background-color: ' + _group.color + '; }'; // Create CSS rules for each group's color.
                }
                style += '</style>'; // Close the style block.
                $('html > head').append($(style)); // Append the generated style to the document's head.

                function problems_bzzzt ( cb ) { /*
                 * Fetches active problem triggers from the monitoring API.
                 * This function is part of the recurring data fetch cycle.
                 */
                    var problems_query =
                        {
                            method:      "trigger.get", // API method to get triggers.
                            params:      {
                                select_hosts:  true, // Include host information.
                                select_groups: true, // Include group information.
                                only_true:     true, // Only retrieve active (true) triggers.
                                monitored:     true, // Only monitored items.
                                extendoutput:  true // Get full details.
                            },
                            auth:        zx.authtoken, // Use the stored authentication token.
                            id:          0, // Request ID.
                            jsonrpc:     2.0 // JSON-RPC protocol version.
                        };
                    send(problems_query, show_problems, cb); // Send the request and specify callbacks for success and chain progression.
                } // End of problems_bzzzt function.

                function maintenances_bzzzt ( cb ) { /*
                 * Fetches current maintenance periods from the monitoring API.
                 * This function is part of the recurring data fetch cycle.
                 */
                    var maintenances_query =
                        {
                            method:       "maintenance.get", // API method to get maintenances.
                            params:       { extendoutput: true }, // Request full details.
                            auth:         zx.authtoken, // Use the stored authentication token.
                            id:           0, // Request ID.
                            jsonrpc:      2.0 // JSON-RPC protocol version.
                        };
                    send(maintenances_query, show_maintenances, cb); // Send the request and specify callbacks.
                } // End of maintenances_bzzzt function.

                function ustats_bzzzt ( cb ) { /*
                 * Fetches host statistics, specifically group memberships, from the monitoring API.
                 * This function is part of the recurring data fetch cycle.
                 */
                    var ustats_query =
                        {
                            method:      "host.get", // API method to get hosts.
                            params:      {
                                select_groups: true, // Include group information for each host.
                                extendoutput:  true, // Get full details.
                                only_true:     true, // Only retrieve hosts with active problems.
                                monitored:     true // Only monitored hosts.
                            },
                            auth:        zx.authtoken, // Use the stored authentication token.
                            id:          0, // Request ID.
                            jsonrpc:     2.0 // JSON-RPC protocol version.
                        };
                    send(ustats_query, show_ustats, cb); // Send the request and specify callbacks.
                } // End of ustats_bzzzt function.

                function show_problems ( json ) { /*
                 * Processes the JSON response containing problem triggers and updates the UI.
                 * It organizes problems by host, applies filtering, and renders them.
                 */
                    var resultset = { result: [], hosts: {} } // Object to structure processed problems.
                        , now     = +new Date / 1000; // Current Unix timestamp in seconds.

                    zx.maintenancedProblems = 0; // Initialize counter for problems on hosts in maintenance.
                    zx.realProblems         = 0; // Initialize counter for actual, non-maintenance-related problems.

                    json.result.forEach(function ( trigger, i ) {
                        // Ensure host data is present; provide defaults if missing (e.g., for global triggers).
                        trigger.hosts[0] = trigger.hosts[0] || { host: "undefined", hostid: "0" };
                        trigger.hosts[0].hostid = trigger.hosts[0].hostid || "0";

                        // Skip displaying problems for a specific internal Zabbix host ID.
                        if ( trigger.hosts[0].hostid === "10007" ) return; // FIXME(zabbix): This ID is often for internal Zabbix processes.

                        // Optional: Filter out triggers based on priority.
                        // if ( parseInt(trigger.priority) < 4 ) return;

                        var hostname      = trigger.hosts[0].host; // Extract hostname.
                        var shortHostName = hostname.replace(/\..*$/, ''); // Remove domain part from hostname.
                        var inMaintenance = trigger.hosts[0].maintenance_status === "1" ? true : false; // Check if host is in maintenance.

                        var groups = zx.ustats[trigger.hosts[0].hostid].groups || []; // Get groups for this host from pre-fetched ustats.

                        // Replace the {HOSTNAME} placeholder in the trigger description.
                        trigger.description = trigger.hosts[0].ip === "127.0.0.1"
                            ? trigger.description.replace(/\{HOSTNAME\}/, shortHostName)
                            : trigger.description.replace(/\{HOSTNAME\}/, trigger.hosts[0].ip);

                        trigger.description = trigger.description.replace(/^\d+ /, ''); // Remove leading numbers/spaces from description.
                        trigger.description = trigger.description + ": " + trigger.comments; // Append trigger comments to description.

                        // Increment appropriate problem counter.
                        inMaintenance ? zx.maintenancedProblems++ : zx.realProblems++;

                        // Initialize the host entry in the resultset if it doesn't exist.
                        resultset.hosts[hostname] =
                            resultset.hosts[hostname] ||
                            {
                                hostname: hostname,
                                groups:   groups,
                                display: ( function () { /* Determines if the host should be displayed based on its groups and trigger status. */
                                    var display = false;
                                    groups.forEach(function ( group ) {
                                        for ( var g in zx.groups ) // Check if any of the host's groups are configured for display.
                                            if ( group === g ) display = true;
                                    });
                                    if ( trigger.value === "0" ) display = false; // If problem is resolved (value 0), do not display.
                                    return display;
                                } )(),
                                umgebung: ( function () { /* Determines the CSS class for the host based on its groups and maintenance status. */
                                    var css = '';
                                    groups.forEach(function ( group ) {
                                        for ( var g in zx.groups )
                                            if ( g === group ) css = zx.groups[g].displayname; // Use the group's display name as a CSS class.
                                    });
                                    if ( inMaintenance ) css += " inMaintenance"; // Add 'inMaintenance' class if applicable.
                                    return css;
                                } )(),
                                problems: [] // Array to hold individual problems for this host.
                            };
                        // Push the current problem details into the host's problems array.
                        resultset.hosts[hostname].problems.push(
                            {
                                description: trigger.description,
                                freshness:   trigger.lastchange > (now - 60 * 30) ? true : false, // True if problem changed within last 30 minutes.
                                duration:    zx.sse2dur(trigger.lastchange), // Formatted duration since last change.
                                triggerid:   trigger.triggerid,
                                sse:         trigger.lastchange // Unix timestamp of last change.
                            }
                        );
                    }); // End of problem trigger iteration.

                    for ( var hn in resultset.hosts ) { // Iterate through each host in the processed resultset.
                        var host = resultset.hosts[hn];

                        // Sort problems within each host by their last change time, newest first.
                        host.problems.sort(function ( p1, p2 ) {
                            return p2.sse - p1.sse;
                        });

                        var np = host.problems.length; // Number of problems for the current host.
                        // If a host has multiple problems and the newest problem is very old (older than 25 hours),
                        // condense the display by adding a summary message.
                        if ( np > 1 && host.problems[0].sse < (now - 25 * 60 * 60) ) {
                            host.shorten = true; // Flag to indicate shortening.
                            host.problems.unshift( // Add a summary problem at the beginning of the list.
                                {
                                    description: "This host has " + np + " problems",
                                    display:     true,
                                    freshness:   false,
                                    duration:    host.problems[0].duration,
                                    sse:         host.problems[0].sse
                                }
                            );
                        }
                        resultset.result.push(host); // Add the processed host to the final result array.
                    }
                    // Sort all hosts in the final result by the SSE of their most recent problem.
                    resultset.result.sort(function ( a, b ) {
                        return b.problems[0].sse - a.problems[0].sse;
                    });
                    delete resultset.hosts; // Remove the intermediate 'hosts' object to clean up.

                    var template  = document.getElementById('problems_template').innerHTML // Get the Handlebars template for problems.
                        , handlebar = Handlebars.compile(template); // Compile the template.

                    $("#problems").html(handlebar(resultset)); // Render problems into the UI.

                    for ( var group in zx.hiddenGroups ) { // Apply hiding for groups marked as hidden by the user.
                        // $('.problem.'+group).css("background-color", "#555"); // Example of commented-out styling.
                        $('.problem.u' + group).hide(); // Hide problems belonging to hidden groups.
                    }

                    $('.shorten').toggle(function () { // Implement toggle functionality for shortened problem lists.
                        $(this).siblings('.trigger:hidden').show(); // On first click, show all hidden triggers.
                    }, function () {
                        $(this).siblings('.trigger').hide(); // On second click, hide them again.
                    });

                    if ( zx.hideHostsInMaint ) $('.inMaintenance').hide(); // Hide hosts in maintenance if the global flag is set.

                    // Add hover effects for problem descriptions and maintenance headers.
                    $(".description, .maintenance > .name").hover(function () {
                        $(this).css("background", "-moz-linear-gradient(top, #c1c1c1, #a8a8a8)") // Apply gradient background.
                               .css("background", "-webkit-gradient(linear, left bottom, left top, from(#c1c1c1), to(#a8a8a8))") // Webkit specific gradient.
                               .css({ "-webkit-border-radius": "3px", // Rounded corners.
                                      "-moz-border-radius":    "3px",
                                      "color":                 "#333" // Darker text color.
                                    });
                    }, function () {
                        $(this).css({ "background": "", "color": "#ddd" }); // Reset styles on mouse out.
                    });

                    delete template; // Clean up template variable.
                    delete resultset; // Clean up resultset variable.
                    delete json; // Clean up raw JSON data.
                } // End of show_problems function.

                function show_maintenances ( json ) { /*
                 * Processes the JSON response containing maintenance periods and updates the UI.
                 * It also handles the toggle functionality for hiding/showing hosts in maintenance.
                 */
                    var html = 'Maintenances <span id="headerHide">(hidden)</span>' // HTML for the header when maintenances are hidden.
                        , now  = +new Date / 1000; // Current Unix timestamp in seconds.

                    json.result.forEach(function ( maint ) {
                        // Determine the status of each maintenance period (expired, waiting, or active).
                        maint.expired = ( function () {
                            if ( maint.active_till < now ) return "expired"; // Maintenance period has ended.
                            if ( maint.active_since > now ) return "waiting"; // Maintenance period has not started yet.
                        } )();

                        // Determine if this maintenance period should be displayed.
                        maint.display = ( function () {
                            var display = true;
                            // Hide if description contains "zx.filtered" or if it expired more than 2 hours ago.
                            if ( maint.description.search(/zx.filtered/) != -1 || maint.active_till < (now - 7200) ) // 7200 seconds = 2 hours.
                                display = false;

                            return display;
                        } )();
                    }); // End of maintenance iteration.

                    var template  = document.getElementById('maintenances_template').innerHTML // Get the Handlebars template for maintenances.
                        , handlebar = Handlebars.compile(template); // Compile the template.

                    $("#maintenances").html(handlebar(json)); // Render maintenances into the UI.

                    if ( zx.hideHostsInMaint ) $('#header').html(html); // Update header text if hosts in maintenance are hidden.
                    $('#header').click(function () { // Attach click handler to the maintenance header.
                        if ( zx.hideHostsInMaint ) { // If hosts are currently hidden.
                            $(this).html('Maintenances'); // Change header text to indicate they are visible.
                            $('.inMaintenance').show(); // Show all hosts marked as in maintenance.
                            zx.hideHostsInMaint = false; // Update the flag.
                        } else { // If hosts are currently visible.
                            $(this).html(html); // Change header text to indicate they are hidden.
                            $('.inMaintenance').hide(); // Hide all hosts marked as in maintenance.
                            zx.hideHostsInMaint = true; // Update the flag.
                        }
                    });

                    delete json; // Clean up raw JSON data.
                    delete template; // Clean up template variable.
                } // End of show_maintenances function.

                function show_ustats ( hosts ) {
                    // This function processes host statistics (specifically group memberships)
                    // and renders the "umgebungen" (environments/groups) section of the UI.
                    // The original code did not contain comments within this function body.

                    delete zx.ustats; // Clear existing host statistics.
                    var g      = {} // Object to track unique group names.
                        , result = {}; // Object to store data for Handlebars rendering.

                    zx.ustats    = {}; // Re-initialize zx.ustats.
                    zx.ustats[0] = { groups: [] }; // XXX FIXME XXX - Placeholder for host ID 0, potentially for global items.

                    hosts.result.forEach(function ( host ) {
                        zx.ustats[host.hostid] = zx.ustats[host.hostid]
                            ? zx.ustats[host.hostid]
                            : {};
                        zx.ustats[host.hostid].groups = zx.ustats[host.hostid].groups
                            ? zx.ustats[host.hostid].groups
                            : [];
                        host.groups.forEach(function ( group ) {
                            zx.ustats[host.hostid].groups.push(group.name);
                            zx.ustats[host.hostid].groups.unshift("others"); // Add "others" as a default group for every host.
                            g[group.name] = null; // Add group name to 'g' to track uniqueness.
                        });
                    });
                    g["others"] = null; // Ensure "others" group is always present in the unique list.

                    var glist = []; // Array to store formatted group list for rendering.
                    for ( var i in g ) {
                        glist.push(
                            {
                                name: zx.groups[i] && zx.groups[i].displayname, // Get display name from zx.groups.
                                css:  zx.groups[i] && zx.groups[i].displayname // Use display name for CSS class.
                            }
                        );
                    }
                    result.glist             = glist; // Assign formatted group list to result.
                    result.maintenancedProblems = zx.maintenancedProblems; // Pass count of problems in maintenance.
                    result.realProblems      = zx.realProblems; // Pass count of actual problems.

                    var template  = document.getElementById('ustats_template').innerHTML // Get the Handlebars template for ustats.
                        , handlebar = Handlebars.compile(template); // Compile the template.

                    $("#umgebungen").html(handlebar(result)); // Render ustats into the UI.

                    $('#uplus, #uminus') // Attach mouseover/mouseout events to plus/minus buttons.
                        .mouseover(function () {
                            $(this).css('background', '#333');
                        })
                        .mouseout(function () {
                            $(this).css('background', '');
                        });
                    $('#uminus').click(function () {
                        $('.glist-').fadeOut(300);
                    }); // Hide group list with fade effect.
                    $('#uplus').click(function () {
                        $('.glist-').fadeIn(300);
                    }); // Show group list with fade effect.

                    var getColorFor = function ( displayname ) { // Helper function to retrieve color for a group's display name.
                        for ( var i in zx.groups ) {
                            if ( zx.groups[i].displayname === displayname ) {
                                return zx.groups[i].color;
                            }
                        }
                    };

                    for ( var i = 0; i < glist.length; i++ ) { // Apply background colors to group elements based on their configuration.
                        $('.umgebung > .' + glist[i].name)
                            .parent()
                            .show()
                            .css('background-color', getColorFor(glist[i].name));
                    }

                    $('.umgebung').click(function () { // Attach click handler to each group element.
                        var group  = $(this).children().attr('class') // Get the group's CSS class (e.g., "p2").
                            , hidden = false;

                        for ( var hg in zx.hiddenGroups ) // Check if this group is currently marked as hidden.
                            if ( hg === group ) hidden = true;

                        if ( hidden ) { // If the group is hidden, make it visible.
                            $(this).css("background-color", getColorFor(group));
                            $(this).children().css("background-color", getColorFor(group));
                            $('.u' + group + '.problem').show(); // Show problems belonging to this group.
                            delete zx.hiddenGroups[group]; // Remove from hidden groups list.
                            localStorage.setItem('hiddenGroups', JSON.stringify(zx.hiddenGroups)); // Update local storage.
                        } else { // If the group is visible, hide it.
                            $(this).css("background-color", "#555");
                            $(this).children().css("background-color", "#555");
                            $('.u' + group + '.problem').hide(); // Hide problems belonging to this group.
                            zx.hiddenGroups[group] = true; // Add to hidden groups list.
                            localStorage.setItem('hiddenGroups', JSON.stringify(zx.hiddenGroups)); // Update local storage.
                        }
                    });

                    for ( var group in zx.hiddenGroups ) { // Apply initial "hidden" styling to groups that are already hidden.
                        $('.umgebung > .' + group).parent().css("background-color", "#555");
                        $('.umgebung > .' + group).css("background-color", "#555");
                    }

                    delete template; // Clean up template variable.
                    delete result; // Clean up result variable.
                    delete glist; // Clean up glist variable.
                    delete g; // Clean up g variable.
                } // End of show_ustats function.

            } // End of run function.

        }; // End of zx object.

    var send = function ( req, fn1, fn2 ) { /*
     * Generic function to send AJAX requests to the API endpoint.
     * It handles success and error responses, displaying messages if necessary.
     */
        $.ajax({
            type:        'POST', // HTTP method.
            dataType:    "json", // Expected data type of the response.
            contentType: "application/json", // Content type of the request body.
            url:         "/api_jsonrpc.php", // API endpoint URL.
            data:        JSON.stringify(req), // Request payload, stringified JSON.
            timeout:     20000, // Request timeout in milliseconds (20 seconds).
            success:     function ( msg ) { // Callback for successful API response.
                if ( msg === null || msg.error ) { // Check for null response or API-level error.
                    // zx.log(msg); // Optionally log the error message.
                    $('#error').html(
                        "error" + // Display generic error text.
                        "<div id='error_details'>(" +
                        // JSON.stringify(msg === null ? "connection timed out" : msg) + // Original commented line for detailed error.
                        JSON.stringify(msg) + // Display the full error message from the server.
                        ")</div>"
                    );
                    $('#error').fadeIn(500); // Show the error message with a fade-in effect.
                } else {
                    $('#error').fadeOut(500); // Hide any previous error message on success.
                    fn1(msg); // Execute the primary success callback with the response message.
                    fn2 && fn2(); // Execute the secondary success callback if it was provided.
                }
            },
            error:       function ( res, textStatus, errorThrown ) { // Callback for AJAX request errors (e.g., network issues).
                $('#error').html(
                    "<div id='error_details'>(" +
                    textStatus + " " + res.responseText + // Display AJAX status and response text.
                    ")</div>"
                );
                $('#error').fadeIn(500); // Show the error message.
            }
        });
    }; // End of send function.

    // This block executes once the entire DOM is ready.
    $(document).ready(function () {
        zx.login(); // Initiate the login process when the page loads.
        // zx.run(); // This line is commented out; uncomment to bypass login for development/testing.
    });

})(); // End of the Immediately Invoked Function Expression (IIFE).