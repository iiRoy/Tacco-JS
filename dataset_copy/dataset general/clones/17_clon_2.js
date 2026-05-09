let configurationItems = [
    // This section defines settings for the web hosting component.
    {
        sectionIdentifiers: "WebHost",
        configurableParameters: [
            {
                parameterName: "servicePort", // The network port for incoming connections.
                abbreviation: "sp",
                dataType: Number,
                primarySetting: true, // This is the main port setting.
                explanationText: "Sets the TCP port number for the HTTP server."
            },
            {
                parameterName: "auditTrailPattern", // Defines the format for access logging.
                abbreviation: "atp",
                dataType: String,
                explanationText: "Determines the structure of access log entries written to standard output. Can be a predefined value ('none', 'dev','combined', 'short', 'tiny', 'logstalgia') or a custom template (e.g., ':method -> :url'). If omitted, a real-time statistics panel is displayed instead."
            },
            {
                parameterName: "contentBase", // The base directory for serving static files.
                abbreviation: "cb",
                dataType: String,
                explanationText: "Specifies the root directory from which web content is served. By default, it uses the current execution directory."
            },
            {
                parameterName: "gzipContent", // Flag to enable HTTP compression.
                abbreviation: "gc",
                dataType: Boolean,
                explanationText: "Activates GZIP compression for responses, improving transfer efficiency."
            },
            {
                parameterName: "displayRefresh", // Interval for updating the statistics view.
                abbreviation: "dr",
                dataType: Number,
                explanationText: "The refresh rate in milliseconds for the statistics interface. Defaults to 500 milliseconds."
            }
        ]
    },
    // This section contains miscellaneous utility settings.
    {
        sectionIdentifiers: "Utility",
        configurableParameters: [
            {
                parameterName: "showHelp", // Option to display usage information.
                abbreviation: "sh",
                dataType: Boolean,
                explanationText: "Prints the command-line usage instructions and available options."
            },
            {
                parameterName: "viewSettings", // Option to output the current configuration.
                dataType: Boolean,
                explanationText: "Outputs the active configuration settings to the console."
            }
        ]
    }
];

// Export the array of configuration definitions.
module.exports = configurationItems;