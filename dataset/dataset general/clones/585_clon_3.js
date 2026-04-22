// This file provides core utilities for a visual programming block system.
// It includes string manipulation helpers and a preliminary block definition registry.

// Utility functions for string operations.
// These replace older String.prototype extensions with modern approaches or custom helpers.

/**
 * Checks if a string begins with a specified prefix.
 * @param {string} mainString The string to check.
 * @param {string} targetPrefix The prefix to search for.
 * @returns {boolean} True if the string starts with the prefix, false otherwise.
 */
function checkStringStart(mainString, targetPrefix) {
    if (typeof mainString !== 'string' || typeof targetPrefix !== 'string') {
        return false;
    }
    return mainString.startsWith(targetPrefix);
}

/**
 * Checks if a string ends with a specified suffix.
 * @param {string} mainString The string to check.
 * @param {string} targetSuffix The suffix to search for.
 * @returns {boolean} True if the string ends with the suffix, false otherwise.
 */
function checkStringEnd(mainString, targetSuffix) {
    if (typeof mainString !== 'string' || typeof targetSuffix !== 'string') {
        return false;
    }
    return mainString.endsWith(targetSuffix);
}

/**
 * Determines if a string contains a specific substring.
 * @param {string} mainString The string to examine.
 * @param {string} searchFragment The substring to find.
 * @returns {boolean} True if the substring is found, false otherwise.
 */
function stringIncludesFragment(mainString, searchFragment) {
    if (typeof mainString !== 'string' || typeof searchFragment !== 'string') {
        return false;
    }
    return mainString.includes(searchFragment);
}

/**
 * Removes leading whitespace from a string.
 * @param {string} inputString The string to trim.
 * @returns {string} The string with leading whitespace removed.
 */
function trimLeadingWhitespace(inputString) {
    if (typeof inputString !== 'string') return '';
    return inputString.trimStart();
}

/**
 * Removes trailing whitespace from a string.
 * @param {string} inputString The string to trim.
 * @returns {string} The string with trailing whitespace removed.
 */
function trimTrailingWhitespace(inputString) {
    if (typeof inputString !== 'string') return '';
    return inputString.trimEnd();
}


// Main module definition for the visual block system.
const visualCodeBlocks = (jQueryInstance) => {
    "use strict";

    // Core module object to be exported.
    const blockSystemCore = {};

    // Configuration for block styling and parsing.
    // These arrays define categories, flags, and shapes that can be customized.
    const customBlockCategories = Object.freeze([
        "movement", "appearance", "auditory", "drawing",
        "data", "collection", "triggers", "flow", "perception",
        "mathOps", "customProcedures", "customArg", "external", "placeholder",
        "deprecated"
    ]);
    const structuralDirectives = Object.freeze(["loopStart", "conditionalElse", "loopEnd", "wrapper"]);
    const blockVisualShapes = Object.freeze([
        "eventTrigger", "terminator", "sequence", "nested",
        "predicate", "valueReporter"
    ]);

    // --- Block Definition Registry ---

    // Stores various string-based data for block parsing and display.
    const textualComponents = blockSystemCore.textualComponents = {
        aliasMappings: new Map(), // Maps alternative block phrases to canonical ones.
        procedureKeywords: [],    // Keywords indicating procedure definitions.
        ignoreLtTokens: [],       // Phrases where '<' should not be interpreted as a comparison.
        mathFunctions: [],        // Valid math functions for dropdowns.
        terminationPhrases: [],   // Phrases indicating script termination (e.g., "stop all").
    };

    // Stores language-specific configurations.
    const localeConfigurations = blockSystemCore.localeConfigurations = new Map();
    // Registry of block metadata, indexed by a canonical block identifier.
    const blockMetadataRegistry = blockSystemCore.blockMetadataRegistry = new Map();
    // Index for quick lookup of block metadata by its minified text representation.
    const minifiedBlockTextIndex = new Map();
    // List of all registered block identifiers.
    const allBlockIdentifiers = [];

    // Helper function to register a block's metadata.
    function registerBlockDefinition(blockId, metadata) {
        if (!blockId || typeof blockId !== 'string') {
            console.error("Invalid block ID provided for registration:", blockId);
            return;
        }
        if (blockMetadataRegistry.has(blockId)) {
            console.warn(`Duplicate block ID encountered: ${blockId}. Overwriting.`);
        }
        blockMetadataRegistry.set(blockId, metadata);
        allBlockIdentifiers.push(blockId); // Keep track of all unique IDs.
    }

    // Helper function to process and store block text for quick lookup.
    function indexBlockByText(blockText, blockId) {
        if (!blockText || typeof blockText !== 'string' || !blockId) {
            console.warn("Skipping indexing due to invalid input:", blockText, blockId);
            return;
        }
        const normalizedText = blockText.replace(/[\s@_]+/g, '').toLowerCase();
        minifiedBlockTextIndex.set(normalizedText, blockId);
    }

    // --- Default Language Configuration (English) ---

    // Configuration for the default English locale.
    const defaultLocaleConfig = {
        languageCode: "en",

        // Aliases for block text, mapping variations to a standard form.
        phraseAliases: new Map([
            ["turn left _ degrees", "turn @ccw_arrow _ degrees"],
            ["turn ccw _ degrees", "turn @ccw_arrow _ degrees"],
            ["turn ↺ _ degrees", "turn @ccw_arrow _ degrees"],
            ["turn right _ degrees", "turn @cw_arrow _ degrees"],
            ["turn cw _ degrees", "turn @cw_arrow _ degrees"],
            ["turn ↻ _ degrees", "turn @cw_arrow _ degrees"],
            ["when gf clicked", "when @green_flag clicked"],
            ["when flag clicked", "when @green_flag clicked"],
            ["when green flag clicked", "when @green_flag clicked"],
            ["when ⚑ clicked", "when @green_flag clicked"],
        ]),

        // Keywords that signal a procedure definition block.
        procedureDefinitionKeywords: Object.freeze(["define"]),

        // Phrases where '<' should be treated as literal text, not an operator.
        literalLessThanContexts: Object.freeze(["when distance"]),

        // Mathematical functions recognized in dropdowns.
        validMathOperations: new Set([
            "abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin",
            "acos", "atan", "ln", "log", "e ^", "10 ^"
        ]),

        // Phrases identifying blocks that terminate a script or thread.
        scriptTerminationIndicators: new Set([
            "other scripts in sprite", "other scripts in stage"
        ]),

        // Raw block definitions for this language.
        // This array will be processed into the main block registries.
        blockData: [],

        // Block palette names (currently not actively used for rendering logic).
        categorizedPalettes: Object.freeze({
            "Control": "Flow",
            "Data": "Variables",
            "Events": "Triggers",
            "Looks": "Appearance",
            "More Blocks": "CustomProcedures",
            "Motion": "Movement",
            "Operators": "MathOps",
            "Pen": "Drawing",
            "Sensing": "Perception",
            "Sound": "Auditory",
            "List": "Collection",
            "Variables": "Data",
        }),
    };

    // Glyphs or text representations for special icons/images in block text.
    const iconGlyphs = new Map([
        ["cw_arrow", "↻"],
        ["ccw_arrow", "↺"],
        ["green_flag", "⚑"],
    ]);

    // Raw definitions for standard English blocks.
    // Each entry is either a category header or a block definition.
    // Block definitions are [spec, flags_array].
    const standardBlockDefinitions = [
        ["movement"],
        ["move _ steps", []],
        ["turn @ccw_arrow _ degrees", []],
        ["turn @cw_arrow _ degrees", []],
        ["point in direction _", []],
        ["point towards _", []],
        ["go to x:_ y:_", []],
        ["go to _", []],
        ["glide _ secs to x:_ y:_", []],
        ["change x by _", []],
        ["set x to _", []],
        ["change y by _", []],
        ["set y to _", []],
        ["if on edge, bounce", []],
        ["set rotation style _", []],
        ["x position", []],
        ["y position", []],
        ["direction", []],

        ["appearance"],
        ["say _ for _ secs", []],
        ["say _", []],
        ["think _ for _ secs", []],
        ["think _", []],
        ["show", []],
        ["hide", []],
        ["switch costume to _", []],
        ["next costume", []],
        ["switch backdrop to _", []],
        ["change _ effect by _", []],
        ["set _ effect to _", []],
        ["clear graphic effects", []],
        ["change size by _", []],
        ["set size to _%", []],
        ["go to front", []],
        ["go back _ layers", []],
        ["costume #", []],
        ["backdrop name", []],
        ["size", []],
        ["switch backdrop to _ and wait", []],
        ["next backdrop", []],
        ["backdrop #", []],
        ["switch to costume _", []],
        ["switch to background _", []],
        ["next background", []],
        ["background #", []],

        ["auditory"],
        ["play sound _", []],
        ["play sound _ until done", []],
        ["stop all sounds", []],
        ["play drum _ for _ beats", []],
        ["rest for _ beats", []],
        ["play note _ for _ beats", []],
        ["set instrument to _", []],
        ["change volume by _", []],
        ["set volume to _%", []],
        ["volume", []],
        ["change tempo by _", []],
        ["set tempo to _ bpm", []],
        ["tempo", []],

        ["drawing"],
        ["clear", []],
        ["stamp", []],
        ["pen down", []],
        ["pen up", []],
        ["set pen color to _", []],
        ["change pen color by _", []],
        ["change pen shade by _", []],
        ["set pen shade to _", []],
        ["change pen size by _", []],
        ["set pen size to _", []],

        ["data"], // Variables
        ["set _ to _", []],
        ["change _ by _", []],
        ["show variable _", []],
        ["hide variable _", []],

        ["collection"], // Lists
        ["add _ to _", []],
        ["delete _ of _", []],
        ["insert _ at _ of _", []],
        ["replace item _ of _ with _", []],
        ["item _ of _", []],
        ["length of _", []],
        ["_ contains _", []],
        ["show list _", []],
        ["hide list _", []],

        ["triggers"], // Events
        ["when @green_flag clicked", ["eventTrigger"]],
        ["when _ key pressed", ["eventTrigger"]],
        ["when this sprite clicked", ["eventTrigger"]],
        ["when Stage clicked", ["eventTrigger"]],
        ["when backdrop switches to _", ["eventTrigger"]],
        ["when _ > _", ["eventTrigger"]],
        ["when I receive _", ["eventTrigger"]],
        ["broadcast _", []],
        ["broadcast _ and wait", []],

        ["flow"], // Control
        ["wait _ secs", []],
        ["repeat _", ["loopStart"]],
        ["forever", ["loopStart", "terminator"]],
        ["if _ then", ["loopStart"]],
        ["else", ["conditionalElse"]],
        ["wait until _", []],
        ["repeat until _", ["loopStart"]],
        ["stop _", ["terminator"]],
        ["when I start as a clone", ["eventTrigger"]],
        ["create clone of _", []],
        ["delete this clone", ["terminator"]],
        ["if _", ["loopStart"]],
        ["forever if _", ["loopStart", "terminator"]],
        ["stop script", ["terminator"]],
        ["stop all", ["terminator"]],

        ["perception"], // Sensing
        ["touching _?", []],
        ["touching color _?", []],
        ["color _ is touching _?", []],
        ["distance to _", []],
        ["ask _ and wait", []],
        ["answer", []],
        ["key _ pressed?", []],
        ["mouse down?", []],
        ["mouse x", []],
        ["mouse y", []],
        ["loudness", []],
        ["video _ on _", []],
        ["turn video _", []],
        ["set video transparency to _%", []],
        ["timer", []],
        ["reset timer", []],
        ["_ of _", []],
        ["current _", []],
        ["days since 2000", []],
        ["username", []],
        ["loud?", []],

        ["mathOps"], // Operators
        ["_ + _", []],
        ["_ - _", []],
        ["_ * _", []],
        ["_ / _", []],
        ["pick random _ to _", []],
        ["_ < _", []],
        ["_ = _", []],
        ["_ > _", []],
        ["_ and _", []],
        ["_ or _", []],
        ["not _", []],
        ["join _ _", []],
        ["letter _ of _", []],
        ["length of _", []],
        ["_ mod _", []],
        ["round _", []],
        ["_ of _", []],

        ["external"], // Extension blocks
        // PicoBoard
        ["when _", ["eventTrigger"]],
        ["when _ _ _", ["eventTrigger"]],
        ["sensor _?", []],
        ["_ sensor value", []],
        // LEGO WeDo
        ["turn _ on for _ secs", []],
        ["turn _ on", []],
        ["turn _ off", []],
        ["set _ power _", []],
        ["set _ direction _", []],
        ["when distance _ _", ["eventTrigger"]],
        ["when tilt _ _", ["eventTrigger"]],
        ["distance", []],
        ["tilt", []],
        // LEGO WeDo (old)
        ["turn motor on for _ secs", []],
    ];

    // Populate the default locale configuration with the block data.
    defaultLocaleConfig.blockData = standardBlockDefinitions;

    // --- Block Registry Initialization ---

    /**
     * Processes raw block definitions for a given locale and populates the global registries.
     * @param {object} localeConfig The configuration object for a specific locale.
     */
    function initializeBlockRegistries(localeConfig) {
        if (!localeConfig || typeof localeConfig.languageCode !== 'string' || !Array.isArray(localeConfig.blockData)) {
            console.error("Invalid locale configuration provided for initialization.");
            return;
        }

        let currentCategory = "general"; // Default category if not specified.

        // Update global textual components from the locale config.
        for (const [key, value] of localeConfig.phraseAliases) {
            textualComponents.aliasMappings.set(key, value);
        }
        textualComponents.procedureKeywords = [...new Set([...textualComponents.procedureKeywords, ...localeConfig.procedureDefinitionKeywords])];
        textualComponents.ignoreLtTokens = [...new Set([...textualComponents.ignoreLtTokens, ...localeConfig.literalLessThanContexts])];
        textualComponents.mathFunctions = [...new Set([...textualComponents.mathFunctions, ...Array.from(localeConfig.validMathOperations)])];
        textualComponents.terminationPhrases = [...new Set([...textualComponents.terminationPhrases, ...Array.from(localeConfig.scriptTerminationIndicators)])];

        // Add this locale config to the global languages map.
        localeConfigurations.set(localeConfig.languageCode, localeConfig);

        // Process block definitions.
        localeConfig.blockData.forEach(entry => {
            if (!Array.isArray(entry) || entry.length === 0) {
                console.warn("Invalid block definition entry encountered, skipping:", entry);
                return;
            }

            const firstElement = entry[0];
            if (entry.length === 1 && typeof firstElement === 'string' && !firstElement.includes('_')) {
                // This entry defines a new category.
                currentCategory = firstElement;
            } else if (entry.length >= 1 && typeof firstElement === 'string') {
                // This is a block definition.
                const blockSpecTemplate = firstElement;
                const blockFlags = Array.isArray(entry[1]) ? entry[1] : []; // Ensure flags are an array.

                // Replace icon placeholders within the block spec with actual glyphs.
                let processedSpec = blockSpecTemplate;
                for (const [placeholder, glyph] of iconGlyphs) {
                    const placeholderPattern = new RegExp(`@${placeholder}`, 'g');
                    processedSpec = processedSpec.replace(placeholderPattern, glyph);
                }

                // Construct a unique block ID. For simplicity, we use the processed spec.
                const canonicalBlockId = processedSpec;

                // Determine the primary visual shape of the block based on its flags.
                let primaryShape = "sequence"; // Default to a standard stack block.
                if (blockFlags.includes("eventTrigger")) {
                    primaryShape = "eventTrigger";
                } else if (blockFlags.includes("terminator")) {
                    primaryShape = "terminator";
                } else if (blockFlags.includes("predicate")) { // Represents a boolean block.
                    primaryShape = "predicate";
                } else if (blockFlags.includes("valueReporter")) { // Represents a reporter block.
                    primaryShape = "valueReporter";
                }

                // Register the block's full metadata.
                registerBlockDefinition(canonicalBlockId, {
                    spec: processedSpec,
                    category: currentCategory,
                    flags: Object.freeze(blockFlags), // Freeze flags for immutability.
                    shape: primaryShape,
                    locale: localeConfig.languageCode,
                });

                // Index the block by its minified text for parsing.
                indexBlockByText(processedSpec, canonicalBlockId);

                // Also index any defined aliases for this block.
                for (const [aliasSpec, canonicalAlias] of localeConfig.phraseAliases) {
                    if (canonicalAlias === blockSpecTemplate) { // Check if the alias maps to the original spec template
                        let processedAliasSpec = aliasSpec;
                        for (const [placeholder, glyph] of iconGlyphs) {
                            const placeholderPattern = new RegExp(`@${placeholder}`, 'g');
                            processedAliasSpec = processedAliasSpec.replace(placeholderPattern, glyph);
                        }
                        indexBlockByText(processedAliasSpec, canonicalBlockId);
                    }
                }
            } else {
                console.warn("Skipping malformed block entry:", entry);
            }
        });
    }

    // Initialize the registries with the default English configuration.
    initializeBlockRegistries(defaultLocaleConfig);

    // Expose the core module object.
    return blockSystemCore;
};

// Global export for browser or Node.js environments.
// This mimics the original's structure of accepting a jQuery instance,
// but allows for a null or undefined argument if jQuery is not present or needed.
if (typeof window !== 'undefined') {
    // For browser environments
    window.visualCodeBlocks = visualCodeBlocks(window.jQuery);
} else if (typeof module !== 'undefined' && module.exports) {
    // For Node.js environments
    module.exports = visualCodeBlocks(null);
}