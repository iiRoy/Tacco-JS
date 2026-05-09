/*
 * This file defines the command-line options for the application.
 * It's structured as an array of option groups.
 * Each group contains an array of individual option definitions.
 */

module.exports  =
  [ // Main configuration array starts here.

    { // First option group: Server-related settings.

      groups: "Server", // Identifier for this group of options.

      options: [ // Array of options within the "Server" group.

        { // Option 1: Port number.
          name          : "port"
          , alias       : "p" // Short alias for the port option.
          , type        : Number // Expects a numerical value.
          , defaultOption: true /* This is the default option, if no other
                                   option is specified, this one is assumed. */
          , description : "Web server port" // Help text for the port option.
        }, // End of 'port' option definition.


        { // Option 2: Log format.
          name        : "log-format"
          , alias     : "f" // Short alias.
          , type      : String // Expects a string value.
          , description : "If a format is supplied an access log is written to stdout. If not, a statistics view is displayed. Use a preset ('none', 'dev','combined', 'short', 'tiny' or 'logstalgia') or supply a custom format (e.g. ':method -> :url')."
        }, /* End of 'log-format' option.
            * This description is quite verbose.
            */


        { // Option 3: Root directory.
          name        : "directory"
          , alias     : "d"
          , type      : String
          , description : "Root directory, defaults to the current directory"
        }, // End of 'directory' option.

        { // Option 4: Compression.
          name        : "compress"
          , alias     : "c"
          , type      : Boolean // Expects a boolean (true/false) value.
          , description : "Enables compression"
        }, // End of 'compress' option.

        { // Option 5: Refresh rate for statistics view.
          name        : "refresh-rate"
          , alias     : "r"
          , type      : Number
          , description : "Statistics view refresh rate in ms. Defaults to 500."
        } // End of 'refresh-rate' option.

      ] // End of options for the "Server" group.
    }, // End of the first option group definition.

    // A blank line for visual separation between groups.

    { // Second option group: Miscellaneous settings.

      groups: "Misc", // Identifier for this group.

      options: [ // Array of options within the "Misc" group.

        { // Option 1: Help message.
          name        : "help"
          , alias     : "h"
          , type      : Boolean
          , description : "Print these usage instructions" // Self-explanatory.
        }, // End of 'help' option.

        { // Option 2: Print configuration.
          name        : "config"
          , type      : Boolean // No alias for this one.
          , description : "Print the stored config"
        } // End of 'config' option.

      ] // End of options for the "Misc" group.
    } // End of the second option group definition.

  ]
; /* End of the main configuration array.
   * This array is exported by the module.
   */