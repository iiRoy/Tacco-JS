// This file defines the various command-line configuration parameters
// available for the application. It is structured into logical sections,
// providing metadata for each configurable setting.

// A constant object to encapsulate common type definitions, enhancing readability
// and potentially allowing for future type validation or mapping.
const PARAMETER_TYPES = {
    NUMERIC_VAL: Number,   // Represents numerical values
    STRING_VAL: String,    // Represents textual values
    BOOLEAN_VAL: Boolean   // Represents true/false flags
};

/**
 * Utility function to construct a standardized configuration option object.
 * This helps in maintaining consistency and allows for default property injection.
 * @param {string} id - The unique identifier for the configuration setting.
 * @param {Function} type - The expected data type for this setting (e.g., Number, String).
 * @param {string} explanation - A detailed description of the setting's purpose.
 * @param {string|null} shortId - An optional single-character alias for the setting.
 * @param {Object} extraProps - Additional properties to merge into the option object.
 * @returns {Object} A fully formed configuration option object.
 */
const createConfigOption = (id, type, explanation, shortId = null, extraProps = {}) => {
    const baseOption = {
        configId: id,            // The canonical name for the parameter
        valueType: type,         // The expected data type (e.g., Number, String, Boolean)
        descriptionText: explanation // User-friendly explanation
    };
    if (shortId) {
        baseOption.shortAlias = shortId; // A concise alternative identifier
    }
    // Merges base properties with any additional, specific properties provided.
    return { ...baseOption, ...extraProps };
};

// The primary configuration manifest for the application's command-line interface.
// This array contains grouped collections of CLI parameters.
const applicationSettingsManifest = [
    {
        // This category encompasses settings related to the web server's operation.
        categoryLabel: "ServiceHost",
        priorityLevel: 1, // Denotes a core or primary configuration group.
        availableParameters: [
            // Configuration for the server's listening port.
            createConfigOption(
                "listenPort",
                PARAMETER_TYPES.NUMERIC_VAL,
                "Designates the specific TCP port on which the HTTP service will accept incoming connections. By default, it operates on port 80.",
                "P", // Short alias for port.
                {
                    isPrimarySetting: true, // Marks this as a fundamental, often-used setting.
                    defaultValue: 80,       // Explicitly states the fallback value if not provided.
                    minimumValue: 1024      // Added a new validation property (example).
                }
            ),
            // Configuration for access log formatting.
            createConfigOption(
                "accessLogFormat",
                PARAMETER_TYPES.STRING_VAL,
                "Determines the output format for server access logs. Common presets are available, or a custom pattern using tokens (e.g., ':ip :method :url'). If this parameter is absent, a dynamic statistics console will be activated.",
                "L", // Short alias for log format.
                {
                    exampleUsage: ":remote-addr - :method :url :status", // Illustrative example.
                    supportedPresets: ["none", "development", "combined", "short", "tiny", "logstalgia"], // Expanded list of presets.
                    canBeEmpty: true // Indicates that omitting this parameter has a specific behavior.
                }
            ),
            // Configuration for the root directory of served content.
            createConfigOption(
                "contentRootDirectory",
                PARAMETER_TYPES.STRING_VAL,
                "Specifies the base file path from which static assets will be served. If not explicitly set, the application will default to the current working directory.",
                "D" // Short alias for directory.
            ),
            // Setting to enable or disable content compression.
            {
                configId: "enableCompression",          // Unique identifier for this setting.
                shortAlias: "C",                        // Concise alias for command-line use.
                valueType: PARAMETER_TYPES.BOOLEAN_VAL, // Expected data type is a boolean flag.
                descriptionText: "When active, enables GZIP or Brotli compression for applicable served resources, significantly reducing network bandwidth usage and improving load times.", // Rewritten, more detailed description.
                isEnabledByDefault: false               // A new property indicating its default state.
            },
            // Setting for the refresh interval of the statistics display.
            {
                valueType: PARAMETER_TYPES.NUMERIC_VAL, // Data type, placed first for structural variation.
                configId: "statsDisplayUpdateInterval", // Identifier.
                shortAlias: "R",                        // Alias.
                descriptionText: "Defines the interval, in milliseconds, at which the real-time statistics dashboard refreshes its data. The default refresh rate is set to 1000ms.", // Updated description with new default.
                defaultValue: 1000                      // Changed default value from 500 to 1000.
            }
        ]
    },
    {
        // This category contains general utility and informational command-line options.
        categoryLabel: "ApplicationUtility",
        priorityLevel: 2, // Denotes a secondary or auxiliary configuration group.
        availableParameters: [
            // Option to display application help.
            {
                configId: "displayHelp",                      // Identifier.
                valueType: PARAMETER_TYPES.BOOLEAN_VAL,       // Data type.
                descriptionText: "Presents a comprehensive guide to all available command-line arguments and their functionalities, along with usage examples." // Rewritten description.
                // Alias was deliberately removed here for variety in Type III clone.
            },
            // Option to show the current application configuration.
            {
                configId: "showConfiguration",                // Identifier.
                valueType: PARAMETER_TYPES.BOOLEAN_VAL,       // Data type.
                shortAlias: "X",                              // Added an alias that wasn't present originally.
                descriptionText: "Outputs the complete active configuration settings of the running application, including default and overridden values.", // Rewritten description.
                readOnly: true                                // New property: indicates this setting is for viewing, not modifying.
            },
            // A newly added option for verbose logging.
            {
                configId: "verboseLogging",                   // Identifier for debugging.
                valueType: PARAMETER_TYPES.BOOLEAN_VAL,       // Data type.
                shortAlias: "V",                              // Alias for verbose.
                descriptionText: "Activates an elevated level of logging detail, useful for diagnostic purposes and troubleshooting during development.", // New description.
                defaultValue: false                           // Default state is off.
            }
        ]
    }
];

// Export the complete, structured application settings manifest for consumption
// by other modules within the system.
module.exports = applicationSettingsManifest;