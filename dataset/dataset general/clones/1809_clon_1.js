var          path = require( 'path' ),
    fs = require( 'fs' ),
    q = require( 'q' ),
    child_process = require( 'child_process' ),
    temp = require( 'temp' ),
    colors = require( 'colors' ),
    _ = require( 'underscore' ),
    html = require( "html" ),
    Ralio = require( './ralio' );

// This is the main CLI constructor function.
// It initializes the command-line interface with a specified hostname.
function CLI( hostname ) {
    // Store the hostname, or default to Rally's main instance.
    this.hostname = hostname || 'https://rally1.rallydev.com/';

    // Immediately call the configuration method to set up required settings.
    this.configure();

    /*
     * Initialize the Ralio API client.
     * The client needs the hostname and credentials from the configuration.
     * This is a critical step for all subsequent API calls.
     */
    this.ralio = new Ralio( this.hostname, this.config.username, this.config.password, this.config.project, this.config.team );
}

/*
 * The configure method loads the user's Rally configuration from a hidden file.
 * It also attempts to load recent quick IDs if they exist.
 */
CLI.prototype.configure = function () {
    // Define the path to the main configuration file, usually in the user's home directory.
    var        config_path = path.join( process.env.HOME, '.raliorc' );

    // Try to read and parse the configuration file.
    try {
        // Parse the JSON content of the configuration file.
        this.config = JSON.parse( fs.readFileSync( config_path ) );
    }
    catch ( e ) {
        // If the file doesn't exist or is unreadable, print an error and exit.
        console.log( '~/.raliorc doesn\'t exist!'.red );

        // Terminate the process as configuration is essential.
        process.kill();
    }

    // Define the path for storing recently used quick IDs.
    var quickIDs_path = path.join( process.env.HOME, '.ralio_recent' );

    // Check if the quick IDs file exists before attempting to read it.
    if ( fs.existsSync( quickIDs_path ) ) {
        // If it exists, read and parse the quick IDs.
        this.quickIDs = JSON.parse( fs.readFileSync( quickIDs_path ) );
    }
};


/*
 * Retrieves and displays the backlog items for a given project/team.
 * Options can include 'all' to fetch more items or a specific 'tag'.
 */
CLI.prototype.backlog = function ( options ) {
    // Keep a reference to 'this' for use in callbacks.
    var self = this,
        team = this.config.team,
        project = options.project || this.config.project,
        projectName = project || team,
        opts = {
            projectName: project || team,
            pagesize: options.all ? 100 : 20, // Default to 20, unless 'all' is specified.
            tag: options.tag
        };

    // Call the Ralio API to fetch backlog items.
    this.ralio.backlog( opts, function ( error, stories ) {
        // Handle any errors that occurred during the API call.
        self.errors( error );

        // If 'all' option was not used, limit the stories to the first 20.
        if ( !options.all ) {
            stories = stories.slice( 0, 20 );
        }

        // Iterate through each story and print its details.
        stories.forEach( function ( story ) {
            self.printStoryLine( story, { state: false, tags: true } );
        } );

        // Save the quick IDs for future reference.
        self.saveQuickIDs();
    } );
};

/*
 * Fetches and displays items for the current sprint.
 * Can filter by group, project, and include accepted stories.
 */
CLI.prototype.sprint = function ( options ) {
    // Store 'this' context.
    var self = this,
        team = options.group || this.config.team,
        project = options.project || this.config.project,
        projectName = project || team;

    // Make an API call to get sprint details.
    this.ralio.sprint( projectName, options, function ( error, stories ) {
        // Check for and handle errors.
        self.errors( error );

        // Process each story returned from the sprint.
        stories.forEach( function ( story ) {
            // Only display stories that are not 'Accepted' unless 'accepted' option is true.
            if ( story.ScheduleState != 'Accepted' || options.accepted ) {
                // Combine tasks and defects for display.
                var tasks = _.extend( story.Tasks, story.Defects );

                // If there are tasks or defects, print the story line.
                if ( tasks.length > 0 ) {
                    self.printStoryLine( story, { owners: !options.tasks } );

                    // If 'tasks' option is enabled, print individual task lines.
                    if ( options.tasks ) {
                        tasks.forEach( function ( task ) {
                            self.printTaskLine( task );
                        } );
                    }
                }
                else {
                    // If no tasks/defects, print the story as a task line with points.
                    self.printTaskLine( story, { tab: false, points: true } );
                }
            }
        } );

        // Persist quick IDs after displaying sprint info.
        self.saveQuickIDs();
    } );
};

/*
 * Displays the currently active sprint for the configured team.
 */
CLI.prototype.current = function () {
    var self = this; // Capture context.

    // Fetch current sprint stories from Ralio.
    this.ralio.current( this.config.team, function ( error, stories ) {
        self.errors( error ); // Error handling.

        // For each story, print its line and then its associated tasks.
        stories.forEach( function ( story ) {
            self.printStoryLine( story );
            story.Tasks.forEach( function ( task ) {
                self.printTaskLine( task );
            } );
        } );
        self.saveQuickIDs(); // Save quick IDs.
    } );
};

/*
 * Pre-formats HTML content using an external HTML pretty-printer.
 */
CLI.prototype.preFormatHtml = function ( html_in ) {
    // Use the 'html' module to pretty print the input HTML.
    var formatted = html.prettyPrint( html_in, { indent_size: 2 } );
    return formatted;
};

/*
 * Defines supported attribute types for editing, including their file suffixes and pre-formatting functions.
 */
CLI.prototype.ATTRIBUTE_OPTIONS = {
    supported: [
        { type: "STRING", suffix: '.txt' },
        { type: "BOOLEAN", suffix: '.txt' },
        { type: "INTEGER", suffix: '.txt' },
        { type: "TEXT", suffix: '.html', preformat: CLI.prototype.preFormatHtml } // HTML text can be pre-formatted.
    ],

    // Helper function to find attribute options by type.
    forType: function ( type ) {
        return _.find( this.supported, function ( ok_type ) { return ok_type.type == type } );
    }
};

/*
 * Allows editing of a specific field of an artifact using a temporary editor.
 * If changes are made, the artifact is updated.
 */
CLI.prototype.edit = function ( formattedID, field ) {
    var self = this; // Context for callbacks.

    // Fetch the artifact with its type definition and the specified field.
    this.ralio.artifact( formattedID, { fetch: field }, { typeDefinition: true }, function ( err, artifact ) {
        self.errors( err ); // Check for API errors.

        // If the field doesn't exist on the artifact, report an error.
        if ( typeof artifact[field] === 'undefined' ) {
            return self.errors( 'Field ' + field + ' not found.' );
        }

        // Determine the type of the field from the artifact's type definition.
        var fieldType = _.find( artifact._typeDefinition.Attributes, function ( attr ) {
            return attr.ElementName == field
        } ).AttributeType;

        // Get the options for this field type from our predefined ATTRIBUTE_OPTIONS.
        var fieldOpts = self.ATTRIBUTE_OPTIONS.forType( fieldType );
        if ( typeof fieldOpts === 'undefined' ) {
            return self.errors( 'Field ' + field + ' is not a type suported by this tool. [' + fieldType + ']' );
        }

        // Determine the file suffix for the temporary editor file.
        var suffix = fieldOpts.suffix || '.txt',
            old_value = artifact[field];

        // Apply pre-formatting if a function is defined for this field type.
        if ( typeof fieldOpts.preformat === 'function' ) {
            old_value = fieldOpts.preformat( old_value );
        }

        // Open an external editor with the current field value.
        self.ralio.editor( old_value, { suffix: suffix }, function ( result ) {
            // If the editor returned an error, report it.
            if ( false === result.success ) {
                return self.errors( 'EDITOR returned error.  Exit code: ' + result.editor.exit_code + ', Exit signal: ' + result.editor.exit_signal );
            }

            // If the value was changed in the editor, update the artifact.
            if ( old_value !== result.value ) {
                var updates = {};
                updates[field] = result.value; // Prepare the update object.

                // Send the update request to Ralio.
                self.ralio.updateArtifact( artifact, updates, function ( err ) {
                    if ( err !== null ) {
                        return self.errors( 'Error updating ' + formattedID + '.  Err: ' + err );
                    } else {
                        // Log successful update.
                        console.log( formattedID.yellow + ' ' + old_value.grey + ' ▶ ' + result.value.green );
                    }
                } );
            }
        } );
    } );
};

/*
 * Displays detailed information about a given story or artifact.
 * Includes description, tasks, and handles external tool integration for rich text.
 */
CLI.prototype.show = function ( story ) {
    var self = this; // Preserve 'this' context.

    // Fetch the story details using its ID.
    this.ralio.story( this.fetchID( story ), function ( error, story ) {
        self.errors( error ); // Handle potential errors.

        // If no story is found, report it and exit.
        if ( story === null ) {
            return self.errors( 'No story found :(' );
        } else {
            // Create a temporary HTML file for the story description.
            var descTempPath = temp.path( { suffix: '.html' } );
            fs.writeFileSync( descTempPath, story.Description );

            // Use 'elinks' to convert HTML description to plain text for display.
            child_process.exec( 'elinks -dump ' + descTempPath, function ( err, stdout, stderr ) {

                var description; // Declare description variable.

                // Check for errors during elinks execution.
                if ( err ) {
                    description =
                        '  There was an error formatting the description text :(\n'.red +
                        '  Is elinks installed?  (hint: brew install elinks or sudo apt-get install elinks).'.red;
                } else {
                    // Clean up whitespace from elinks output.
                    description = stdout.replace( /^\n+/, '' ).replace( /\n+$/g, '' );
                }

                fs.unlinkSync( descTempPath ); // Delete the temporary HTML file.

                // Print story or task line based on task presence.
                ( story.Tasks.length > 0 ) ?
                    self.printStoryLine( story ) : self.printTaskLine( story, { tab: false, points: true } );

                // If description is not empty, print it.
                if ( description != '' ) {
                    console.log( '\n' + description + '\n' );
                }

                // Print each associated task.
                story.Tasks.forEach( function ( task ) {
                    self.printTaskLine( task );
                } );

                self.saveQuickIDs(); // Save quick IDs for easy access.
            } );
        }
    } );
};

/*
 * Opens the Rally web interface for a given story or artifact in the default browser.
 */
CLI.prototype.open = function ( story ) {
    var self = this, // Context capture.
        openCommand = process.platform === "linux" ? "xdg-open" : "open"; // Determine OS-specific open command.

    this.ralio.story( this.fetchID( story ), function ( error, story ) {
        self.errors( error ? error.red : error ); // Handle errors, coloring them red.

        if ( story === null ) {
            return self.errors( 'No story found :(' );
        } else {
            var story_type = null; // Initialize story type.
            // Map Rally internal types to URL-friendly types.
            switch ( story._type ) {
                case 'Defect':
                    story_type = 'defect';
                    break;
                case 'HierarchicalRequirement':
                    story_type = 'userstory';
                    break;
                case 'Task':
                    story_type = 'task';
                    break;
            }

            // Construct and execute the command to open the Rally URL.
            child_process.exec(
                openCommand + ' ' +
                self.hostname + '#/' +
                story.Project.ObjectID +
                'd/detail/' + story_type +
                '/' + story.ObjectID );
        }
    } );
};

/*
 * Sets a task's state to 'In-Progress' and optionally assigns it to the current user.
 */
CLI.prototype.start = function ( task, options ) {
    var self = this,
        update_options = { state: 'In-Progress', own: true, blocked: false, pair: options.pair }; // Options for updating task.

    // Update the task state via Ralio.
    this.ralio.setTaskState( this.fetchID( task ), update_options, function ( error, task ) {
        self.errors( error ); // Error checking.
        self.printTaskLine( task, { quickid: false } ); // Print the updated task line without quick ID.
    } );
};

/*
 * Marks a task as 'Completed' and allows specifying root cause and resolution.
 */
CLI.prototype.finish = function ( task, options ) {
    var self = this,
        update_options = { state: 'Completed', own: true, blocked: false, pair: options.pair }; // Base update options.

    // Add rootcause if provided.
    if ( options.rootcause )
        update_options = _.extend( update_options, { rootcause: options.rootcause } );
    // Add resolution if provided.
    if ( options.resolution )
        update_options = _.extend( update_options, { resolution: options.resolution } );

    // Send the task state update to Ralio.
    this.ralio.setTaskState( this.fetchID( task ), update_options, function ( error, task ) {
        self.errors( error ); // Handle errors.
        self.printTaskLine( task, { quickid: false } ); // Display updated task.
    } );
};

/*
 * Manages discussions (comments) on an artifact, allowing to add or show comments.
 */
CLI.prototype.discuss = function ( option, item, message, options ) {
    var self = this,
        deferred = q.defer(); // Use Q promises for asynchronous flow.

    if ( option == 'add' ) {
        // If adding a comment, call Ralio's addComment method.
        this.ralio.addComment( this.fetchID( item ), message, function ( error, data ) {
            self.errors( error ); // Check for errors during comment addition.
            if ( typeof data.PostNumber === "undefined" ) {
                deferred.reject(); // If no post number, something went wrong.
            } else {
                deferred.resolve(); // Resolve promise on success.
            }
        } );
    } else if ( option == 'show' ) {
        deferred.resolve(); // If just showing, resolve immediately to proceed to fetching comments.
    } else {
        return self.errors( 'Option to discuss command must be one of: show, add.' ); // Invalid option.
    }

    // After adding or if just showing, fetch and display comments.
    deferred.promise.then( function () {
        self.ralio.comments( self.fetchID( item ), function ( error, comments ) {
            self.errors( error ); // Error handling for fetching comments.
            self.printTaskLine( comments.artifact, { quickid: false, tab: false } ); // Print artifact info.

            // Iterate and print each comment.
            for ( var i in comments.comments ) {
                self.printDiscussionLine( comments.comments[i] );
            }

            // If no comments, inform the user.
            if ( comments.comments.length === 0 ) {
                return self.errors( 'There is no discussion going on here :-)' );
            }
        } );
    } );
}

/*
 * Changes a task's state to 'Defined' and unassigns it.
 */
CLI.prototype.abandon = function ( task ) {
    var self = this; // Context.
    // Set task state to 'Defined', unassign, unblock, and clear pair.
    this.ralio.setTaskState( this.fetchID( task ), { state: 'Defined', own: false, blocked: false, pair: "" }, function ( error, task ) {
        self.errors( error ); // Error handling.
        self.printTaskLine( task, { quickid: false } ); // Display updated task.
    } );
};

/*
 * Marks a task as 'Blocked'.
 */
CLI.prototype.block = function ( task ) {
    var self = this; // Context.
    // Set 'blocked' status to true.
    this.ralio.setTaskState( this.fetchID( task ), { blocked: true }, function ( error, task ) {
        self.errors( error ); // Error handling.
        self.printTaskLine( task, { quickid: false } ); // Display updated task.
    } );
};

/*
 * Unmarks a task as 'Blocked'.
 */
CLI.prototype.unblock = function ( task ) {
    var self = this; // Context.
    // Set 'blocked' status to false.
    this.ralio.setTaskState( this.fetchID( task ), { blocked: false }, function ( error, task ) {
        self.errors( error ); // Error handling.
        self.printTaskLine( task, { quickid: false } ); // Display updated task.
    } );
};

/*
 * Assigns story points to a given story.
 */
CLI.prototype.point = function ( story, points ) {
    var self = this; // Context.
    // Call Ralio to update story points.
    this.ralio.point( this.fetchID( story ), points, function ( error, story ) {
        self.errors( error ); // Error handling.
        self.printStoryLine( story, { quickid: false } ); // Display updated story.
    } );
};

/*
 * Records time spent on a task.
 */
CLI.prototype.time = function ( task, hours ) {
    var self = this; // Context.
    // Call Ralio to log time.
    this.ralio.time( this.fetchID( task ), hours, function ( error, data ) {
        self.errors( error ); // Error handling.
        if ( data.Hours ) {
            // If hours are returned, display success message.
            console.log( "Task " + task.yellow + " timesheet entry is now " + data.Hours.toString().yellow + " hours." );
        } else {
            // Otherwise, display raw data (e.g., error message from API).
            console.log( data );
        }
    } );
};

/*
 * Manages tasks: adding, updating, or deleting them for a story.
 */
CLI.prototype.task = function ( option, story, opts ) {
    var self = this,
        team = self.config.team,
        project = opts.project || self.config.project,
        projectName = project || team,
        tags = opts.tags ? opts.tags.split( ',' ) : []; // Parse tags from options.

    // Call Ralio's task management function.
    this.ralio.task( option, projectName, this.fetchID( story ), opts.name, tags, function ( error, option, story, taskname ) {
        self.errors( error ); // Error checking.
        self.printStoryLine( story, { quickid: false } ); // Display the updated story.
    } );
};

/*
 * Centralized error handling function.
 * Logs the error and exits the process.
 */
CLI.prototype.errors = function ( error ) {
    if ( error !== null ) {
        // Format error message, if it's an object, use its 'message' property.
        error = typeof error === "object" ? error.message : error;
        console.log( error.red ); // Print error in red.
        process.exit( 1 ); // Exit with a non-zero status code.
    }
};

/*
 * Helper to determine if an artifact is currently in progress.
 */
CLI.prototype.isInProgress = function ( artifact ) {
    return ( artifact.State == "In-Progress" || artifact.ScheduleState === "In-Progress" );
};

/*
 * Prints a formatted line for a story artifact.
 * Includes options for state, owners, tags, and quick ID.
 */
CLI.prototype.printStoryLine = function ( story, options ) {
    var defaults = { state: true, owners: false, tags: true, quickid: true };
    options = _.extend( {}, defaults, options || {} ); // Merge default options.

    var fields = []; // Array to hold formatted fields.

    // Add quick ID if enabled.
    if ( options.quickid ) {
        fields.push( this.quickID( story ) );
    }

    fields.push( story.FormattedID.yellow ); // Story ID in yellow.
    fields.push( ( story.PlanEstimate || '-' ).toString().blue ); // Plan estimate in blue.

    // Add state if enabled.
    if ( options.state ) {
        var state = STATES[story.ScheduleState];
        if ( typeof state === "string" ) {
            fields.push( story.Blocked ? state.red : state.green ); // Blocked state in red, otherwise green.
        }
    }

    fields.push( story.Name ); // Story name.

    // Add owners if enabled.
    if ( options.owners ) {
        var owners = [], cli = this;
        story.Tasks.forEach( function ( task ) {
            if ( cli.isInProgress( task ) && task.Owner !== null ) {
                owners.push( task.Owner._refObjectName );
            }
        } );
        fields.push( _.compact( owners ).join( ', ' ).blue ); // Compact and join owner names.
    }

    // Add tags if enabled.
    if ( options.tags ) {
        var tags = _.map( _.compact( story.Tags ), function ( t ) { return t.Name } ).join( ', ' );
        fields.push( this.isInProgress( story ) ? tags.magenta : tags.grey ); // Tags in magenta if in progress, else grey.
    }

    console.log( fields.join( ' ' ) ); // Print the joined fields.
};

/*
 * Prints a formatted line for a task artifact.
 * Includes options for quick ID, tab, tags, and points.
 */
CLI.prototype.printTaskLine = function ( task, options ) {
    var defaults = { quickid: true, tab: true, tags: true, points: false };
    options = _.extend( {}, defaults, options || {} ); // Merge default options.

    var taskState = TASKSTATES[task.ScheduleState || task.State] || '.', // Determine task state symbol.
        owner = task.Owner !== null ? "❙ " + task.Owner._refObjectName : '', // Owner name if exists.
        fields = [],
        pair = ( task.Pair && task.Pair !== "" && task.Pair !== "true" && task.Pair !== null ) ? "& " + task.Pair : null; // Pair programming info.

    // Add quick ID if enabled.
    if ( options.quickid )
        fields.push( this.quickID( task ) );

    // Add a tab space if enabled.
    if ( options.tab )
        fields.push( ' ' );

    fields.push( task.FormattedID.yellow ); // Task ID in yellow.
    if ( options.points )
        fields.push( ( task.PlanEstimate || '-' ).toString().blue ); // Plan estimate if points are enabled.

    fields.push( task.Blocked ? taskState.red : taskState.green ); // State symbol, red if blocked, green otherwise.
    fields.push( task.Name ); // Task name.

    fields.push( this.isInProgress( task ) ? owner.blue : owner ); // Owner name, blue if in progress.

    if ( pair ) {
        fields.push( this.isInProgress( task ) ? pair.blue : pair ); // Pair info, blue if in progress.
    }

    // Add tags if enabled.
    if ( options.tags ) {
        var tags = _.map( _.compact( task.Tags ), function ( t ) { return t.Name } ).join( ', ' );
        fields.push( this.isInProgress( task ) ? tags.magenta : tags.grey ); // Tags in magenta if in progress, else grey.
    }

    console.log( fields.join( ' ' ) ); // Print the joined fields.
};

/*
 * Prints a formatted line for a discussion comment.
 * Includes options for comment number and indentation.
 */
CLI.prototype.printDiscussionLine = function ( comment, options ) {
    var defaults = { number: true, tab: true };
    options = _.extend( {}, defaults, options || {} ); // Merge default options.

    var owner = comment.User !== null ? comment.User._refObjectName + " ❙" : '', // Comment owner.
        post = '' + ( comment.PostNumber + 1 ), // Comment number (1-based).
        fields = []; // Array for fields.

    // Add a tab if enabled.
    if ( options.tab )
        fields.push( ' ' );

    // Add comment number if enabled.
    if ( options.number )
        fields.push( post.yellow );

    fields.push( owner.blue ); // Owner name in blue.
    fields.push( comment.Text ); // Comment text.

    console.log( fields.join( ' ' ) ); // Print the joined fields.
};

/*
 * Generates a short, numeric quick ID for a task or story.
 * Stores it in an internal list.
 */
CLI.prototype.quickID = function ( task_or_story ) {
    if ( this.task_ids === undefined ) {
        this.task_ids = []; // Initialize task_ids if not present.
    }
    this.task_ids.push( task_or_story.FormattedID ); // Add the formatted ID to the list.
    return this.rpad( this.task_ids.length, 3 ); // Return right-padded index.
};

/*
 * Right-pads a number with spaces to a specified column width.
 */
CLI.prototype.rpad = function ( num, cols ) {
    var ret = num.toString(); // Convert number to string.
    while ( ret.length < cols ) {
        ret = ' ' + ret; // Prepend spaces until desired length.
    }
    return ret;
};

/*
 * Saves the list of generated quick IDs to a file in the user's home directory.
 */
CLI.prototype.saveQuickIDs = function () {
    if ( this.task_ids !== undefined ) {
        fs.writeFileSync(
            path.join( process.env.HOME, '.ralio_recent' ), // Path to quick IDs file.
            JSON.stringify( this.task_ids ) // Serialize task_ids array to JSON string.
        );
    }
};

/*
 * Fetches the actual Rally ID from a given input.
 * Input can be a quick ID (number) or a direct Rally FormattedID.
 */
CLI.prototype.fetchID = function ( id ) {
    if ( id.match( /^\d+$/ ) ) {
        var quick_idx = parseInt( id, 10 ); // Parse quick ID as integer.
        // Check if quick ID exists and is within bounds.
        if ( this.quickIDs !== undefined && quick_idx <= this.quickIDs.length ) {
            return this.quickIDs[quick_idx - 1]; // Return the actual Rally ID.
        }
        else {
            console.error( ( 'No quick ID ' + id + ' found' ).red ); // Error if quick ID not found.
            process.exit( 1 ); // Exit with error.
        }
    }
    return id; // If not a quick ID, assume it's a direct Rally ID.
}

// Mappings for ScheduleState to display symbols.
var STATES = {
    "Suggestion": "?",
    "Defined": "·",
    "Submitted": "·",
    "In-Progress": "▸",
    "Completed": "✔",
    "Fixed": "✔",
    "Closed": "✔",
    "Accepted": "✩",
    "Released": "✮",
    "Grooming": "⌚"
};

// Mappings for Task ScheduleState/State, extending from general STATES.
var TASKSTATES = _.extend( STATES, {
    "Submitted": "·",
    "Defined": "·",
    "Open": "·",
    "In-Progress": "▸",
    "Completed": "✔",
    "Fixed": "✔",
} );