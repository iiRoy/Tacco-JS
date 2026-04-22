// A sophisticated utility module designed for interpreting and processing command-line arguments.
// This parser transforms raw command-line input into a structured object of identified settings
// and a separate array containing any remaining positional arguments.
//
// This iteration represents a Type III clone, incorporating extensive modifications
// in identifier naming, code structure, error handling, and overall implementation approach.
//
// Original implementation concept by Valeriu Paloş (valeriu@palos.ro) in 2011, released as Public Domain.
//
// Expected Input Configuration Schema (`configDefs`):
// The schema is an array where each element is an array defining an option:
// [ 'shortAlias', 'longAlias', 'optionFlags', 'briefDescription', 'actionCallback' ]
//
// Explanation of 'optionFlags' (string):
//   '!' : Denotes a required option. If omitted, parsing will fail.
//   ':' : Indicates that this option expects a value immediately following it.
//   '+' : Specifies that the option can be provided multiple times, accumulating values into an array.
//
// Behavioral Notes:
// - All option names and values are processed in a case-sensitive manner.
// - An automatic `--help` or `-h` option is always available to display usage information.
// - Successfully parsed options and their corresponding values are stored within the `settingsObject`.
// - Any arguments that do not correspond to defined options are collected into the `unrecognizedArguments` array.
// - Options requiring parameters must have their values provided as distinct, subsequent arguments (e.g., `--file my_path`).
// - Each option definition must include at least one of either a `shortAlias` or a `longAlias`.
// - The `actionCallback` function, if provided, will be invoked with the option's parsed value.
// - Multiple short options can be combined (e.g., `-abc` is treated as `-a -b -c`).
// - Any detected parsing error or a request for help will halt execution and display usage details.
// - Options marked as repeatable (`+`) will always store their values in an array, even if specified only once.
// - This parser does not include logic to detect or warn about duplicate option definitions within the `configDefs`.

// --- Internal Constants for Schema Array Indexing ---
const SHORT_ALIAS_INDEX = 0;
const LONG_ALIAS_INDEX = 1;
const FLAGS_INDEX = 2;
const DESCRIPTION_INDEX = 3;
const CALLBACK_INDEX = 4;

// --- Custom Error Classes for Structured Error Handling ---
class HelpRequestedError extends Error {
    constructor(message = "Usage information requested or implied.") {
        super(message);
        this.name = "HelpRequestedError";
    }
}
class ArgumentProcessingError extends Error {
    constructor(message) {
        super(message);
        this.name = "ArgumentProcessingError";
    }
}

// --- Console Output Helpers (Replacing undefined 'write' function) ---
const displayInfo = (message) => console.log(message);
const displayError = (message) => console.error(`[ARG PARSER] Error: ${message}`);

function processCommandLineArgs(configDefs, inputArgs) {
    // This function orchestrates the parsing of command-line arguments.
    // It transforms an array of raw strings into a structured object of settings
    // and a list of arguments that weren't recognized as options.

    // --- Input Validation: Ensure `inputArgs` is a valid array ---
    if (!Array.isArray(inputArgs) || inputArgs.length === 0) {
        throw new HelpRequestedError("No command-line arguments provided. Displaying usage instructions.");
    }

    // --- Core Data Structures for Parsing State ---
    const settingsObject = {}; // Final destination for all recognized options and their values.
    const unrecognizedArguments = []; // Stores any arguments that aren't options or option values.
    const tokenizedArgumentQueue = []; // A temporary queue holding individual argument tokens for sequential processing.

    // --- Pre-computation: Create a fast lookup map for option definitions (Type III enhancement) ---
    // This avoids repeated linear scans of the `configDefs` array for each option encountered.
    const optionLookupMap = new Map();
    for (const optionDefinition of configDefs) {
        // Basic validation for the structure of each option definition.
        if (!Array.isArray(optionDefinition) || optionDefinition.length < 3) {
            throw new ArgumentProcessingError("Malformed option definition in schema. Expected an array with at least 3 elements.");
        }
        const shortName = optionDefinition[SHORT_ALIAS_INDEX];
        const longName = optionDefinition[LONG_ALIAS_INDEX];

        if (!shortName && !longName) {
            throw new ArgumentProcessingError("Every option definition must specify at least a short or a long name.");
        }

        // Populate the lookup map. Later definitions for the same name will overwrite earlier ones.
        if (shortName) {
            if (optionLookupMap.has(shortName)) {
                displayError(`Warning: Duplicate short option alias '${shortName}' found in schema. The last definition will be used.`);
            }
            optionLookupMap.set(shortName, optionDefinition);
        }
        if (longName) {
            if (optionLookupMap.has(longName)) {
                displayError(`Warning: Duplicate long option alias '${longName}' found in schema. The last definition will be used.`);
            }
            optionLookupMap.set(longName, optionDefinition);
        }
    }

    try {
        // --- Phase 1: Tokenization of Raw Command-Line Input ---
        // This stage transforms raw `inputArgs` strings into a flattened sequence of distinct tokens.
        for (const currentRawArg of inputArgs) {
            if (currentRawArg.startsWith('--')) {
                // Handles long options (e.g., '--verbose') and potential '--' end-of-options marker.
                tokenizedArgumentQueue.push('--');
                tokenizedArgumentQueue.push(currentRawArg.substring(2)); // Extract the actual option name.
            } else if (currentRawArg.startsWith('-')) {
                // Handles short options, including bundled ones (e.g., '-tv').
                const shortOptionChars = currentRawArg.substring(1);
                for (const charToken of shortOptionChars) {
                    tokenizedArgumentQueue.push('-');
                    tokenizedArgumentQueue.push(charToken);
                }
            } else {
                // If it's not an option prefix, it's a positional argument.
                tokenizedArgumentQueue.push(currentRawArg);
            }
        }

        // --- Phase 2: Sequential Processing of Tokenized Arguments ---
        // Iterates through `tokenizedArgumentQueue` to identify options, their values, and non-option arguments.
        while (tokenizedArgumentQueue.length > 0) {
            const currentTokenKind = tokenizedArgumentQueue.shift(); // E.g., '-', '--', or a regular argument.

            if (currentTokenKind === '-' || currentTokenKind === '--') {
                const optionName = tokenizedArgumentQueue.shift(); // The actual name of the option (e.g., 'v', 'version').

                // --- Special Handling for Implicit Help Option ---
                if (optionName === 'help' || optionName === 'h') {
                    throw new HelpRequestedError(); // Triggers usage display.
                }

                const correspondingDefinition = optionLookupMap.get(optionName);

                if (!correspondingDefinition) {
                    throw new ArgumentProcessingError(`Unrecognized command-line option: ${currentTokenKind}${optionName}.`);
                }

                let designatedValue = true; // Default value for options that don't expect parameters.
                const currentOptionFlags = correspondingDefinition[FLAGS_INDEX] || '';

                // --- Parameter Expectation Check ---
                if (currentOptionFlags.includes(':')) {
                    designatedValue = tokenizedArgumentQueue.shift(); // Retrieve the next token as the parameter.
                    // Validate that a parameter was actually provided and it's not another option.
                    if (typeof designatedValue === 'undefined' || (designatedValue && designatedValue.startsWith('-'))) {
                        throw new ArgumentProcessingError(`Option ${currentTokenKind}${optionName} expects a parameter, but none was found or the next token was another option.`);
                    }
                }

                const effectiveKey = correspondingDefinition[LONG_ALIAS_INDEX] || correspondingDefinition[SHORT_ALIAS_INDEX];

                // --- Handling of Repeatable Options (Type III: More explicit logic) ---
                if (currentOptionFlags.includes('+')) {
                    if (!settingsObject[effectiveKey]) {
                        settingsObject[effectiveKey] = []; // Initialize as an array if not present.
                    } else if (!Array.isArray(settingsObject[effectiveKey])) {
                        // If it previously held a single value, convert it to an array.
                        settingsObject[effectiveKey] = [settingsObject[effectiveKey]];
                    }
                    settingsObject[effectiveKey].push(designatedValue);
                } else {
                    // For non-repeatable options, simply assign the value.
                    settingsObject[effectiveKey] = designatedValue;
                }

                // --- Execute Option-Specific Callback (if defined) ---
                if (typeof correspondingDefinition[CALLBACK_INDEX] === 'function') {
                    correspondingDefinition[CALLBACK_INDEX](designatedValue);
                }

                // --- Mark Mandatory Flag as 'Processed' ---
                // The original code mutates the schema entry by removing '!', indicating it has been seen.
                correspondingDefinition[FLAGS_INDEX] = currentOptionFlags.replace('!', '');

            } else {
                // This token is not an option or option prefix; it's a positional argument.
                unrecognizedArguments.push(currentTokenKind);
            }
        }

        // --- Phase 3: Final Validation for Unfulfilled Mandatory Options ---
        // After all tokens are processed, check if any mandatory options were missed.
        for (const definitionEntry of configDefs) {
            const finalFlags = definitionEntry[FLAGS_INDEX] || '';
            if (finalFlags.includes('!')) {
                const requiredOptionIdentifier = definitionEntry[LONG_ALIAS_INDEX] ? `--${definitionEntry[LONG_ALIAS_INDEX]}` : `-${definitionEntry[SHORT_ALIAS_INDEX]}`;
                throw new ArgumentProcessingError(`A mandatory option was not provided: ${requiredOptionIdentifier}.`);
            }
        }

    } catch (parsingIssue) {
        // --- Centralized Error Handling and Usage Display ---
        if (!(parsingIssue instanceof HelpRequestedError)) {
            displayError(parsingIssue.message || String(parsingIssue));
        }

        displayInfo("\nAPPLICATION USAGE:");
        displayInfo("  [your_script_name] [options] [positional_arguments...]"); // Generic placeholder for script name.

        displayInfo("\nAVAILABLE OPTIONS:");

        // Include the implicit help option for display purposes.
        const helpOptionDisplay = ['h', 'help', '', 'Displays this usage information.', null];
        const allOptionDefinitionsForDisplay = [helpOptionDisplay, ...configDefs];

        // --- Dynamic Padding Calculation for Aligned Output (Type III: Improved Formatting) ---
        let maximumSyntaxLength = 0;
        for (const definitionItem of allOptionDefinitionsForDisplay) {
            const shortPart = definitionItem[SHORT_ALIAS_INDEX] ? `-${definitionItem[SHORT_ALIAS_INDEX]}` : '';
            const longPart = definitionItem[LONG_ALIAS_INDEX] ? `--${definitionItem[LONG_ALIAS_INDEX]}` : '';
            const connection = (shortPart && longPart) ? ', ' : '';
            const parameterPart = definitionItem[FLAGS_INDEX] && definitionItem[FLAGS_INDEX].includes(':') ? ' <value>' : '';
            const currentOptionSyntax = `${shortPart}${connection}${longPart}${parameterPart}`.trim();
            if (currentOptionSyntax.length > maximumSyntaxLength) {
                maximumSyntaxLength = currentOptionSyntax.length;
            }
        }
        // Ensure a minimum visual padding for readability.
        maximumSyntaxLength = Math.max(maximumSyntaxLength, 20);

        // --- Generate and Display Formatted Option List ---
        for (const definitionItem of allOptionDefinitionsForDisplay) {
            const shortAlias = definitionItem[SHORT_ALIAS_INDEX];
            const longAlias = definitionItem[LONG_ALIAS_INDEX];
            const flags = definitionItem[FLAGS_INDEX] || '';
            const descriptionText = definitionItem[DESCRIPTION_INDEX] || 'No detailed description.';

            const isRequired = flags.includes('!');
            const canRepeat = flags.includes('+');
            const needsParameter = flags.includes(':');

            const requiredIndicator = isRequired ? '*' : ' ';
            const repeatableIndicator = canRepeat ? '+' : ' ';

            const aliasesString = (shortAlias ? `-${shortAlias}` : '   ') +
                                  (longAlias ? (shortAlias ? ', ' : '  ') + `--${longAlias}` : '');

            let displaySyntaxString = aliasesString.trim();
            if (needsParameter) {
                displaySyntaxString += ' <param>';
            }

            // Apply calculated padding for consistent alignment.
            const paddingSpaces = ' '.repeat(Math.max(0, maximumSyntaxLength - displaySyntaxString.length));

            displayInfo(`  ${requiredIndicator}${repeatableIndicator} ${displaySyntaxString}${paddingSpaces}  ${descriptionText}`);
        }
        displayInfo("\n  (*) - Denotes a mandatory option.");
        displayInfo("  (+) - Denotes a repeatable option (can be used multiple times).");

        return null; // Indicate that parsing failed or help was displayed.
    }

    // --- Return Result on Successful Parsing ---
    return {
        settingsObject: settingsObject,
        unrecognizedArguments: unrecognizedArguments
    };
}