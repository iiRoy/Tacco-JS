/*
 * scratchblocks2
 * http://github.com/blob8108/scratchblocks2
 *
 * Copyright 2013, Tim Radvan
 * @license MIT
 * http://opensource.org/licenses/MIT
 *
 * This file contains the core logic for generating Scratch-style block code.
 * It's structured as a self-executing anonymous function.
 */
// Define utility methods for String.prototype
String.prototype.startsWith = function(prefix)
{
    return this.indexOf(prefix) === 0;
};


String.prototype.endsWith = function (suffix) {
    return this.indexOf(suffix, this.length - suffix.length) !== -1;
};

String.prototype.contains = function (substring)
{
    return this.indexOf(substring) !== -1;
};

String.prototype.trimLeft = function () {
    return this.replace(/^\s+/, "");
};

String.prototype.trimRight = function ()
{
    return this.replace(/\s+$/, "");
};


var scratchblocks2 = function ($) { // Start of the main module definition
    "use strict"; // Enforce strict mode for cleaner code

    // Simple assertion function for debugging purposes
    function assert(bool) {
        if (!bool) throw "Assertion failed!";
    }

    var sb2 = {}; // This object will hold all the public exports of the module.

    // Arrays listing CSS classes that can be dynamically overridden or styled.

    var override_categories = [
        "motion", "looks", "sound", "pen",
        "variables", "list", "events", "control", "sensing",
        "operators", "custom", "custom-arg", "extension", "grey",
        "obsolete"
    ];
    var override_flags = ["cstart", "celse", "cend", "ring"];
    var override_shapes = ["hat", "cap", "stack", "embedded",
        "boolean", "reporter"];


    /**
     * Database Structure Overview
     *
     * The `sb2` module maintains a database of Scratch blocks.
     * This database stores crucial information such as:
     *  - Category (e.g., "motion", "looks")
     *  - Shape (e.g., "hat", "stack", "reporter")
     *
     * Blocks can be looked up in two primary ways:
     *
     * 1. By a "minified" text string:
     *    - The input text from the parser (e.g., "say [Hi!] for (3) secs")
     *      is simplified by removing insert parts (becomes "sayforsecs").
     *    - This simplified string is then used as a key to query `block_by_text`.
     *
     * 2. By a language code and a `blockid`:
     *    - `blockid` refers to the canonical English specification of the block
     *      (e.g., "say _ for _ secs").
     *    - This method is primarily used for internationalization (i18n)
     *      and translation utilities, not for internal parsing.
     *
     * Key Terminology:
     *
     *  - `spec`: The translated specification of a block, using underscores
     *            to denote input fields. Example: "sage _ für _ Sek." (German)
     *
     *  - `blockid`: The canonical English specification of a block.
     *               Example: "say _ for _ secs". This serves as a unique identifier.
     */

    var strings = sb2.strings = {
        aliases: {}, // Aliases for block names (e.g., "turn left" -> "turn @arrow-ccw")

        define: [], // Blocks that define something (e.g., "define")
        ignorelt: [], // Blocks where '<' should be ignored in parsing (e.g., "when distance < _")
        math: [], // Math operators for the 'of' dropdown (e.g., "abs", "sqrt")
        osis: [], // "Other Scripts In" blocks (for special cap/stack handling)
    };

    var languages = sb2.languages = {}; // Stores language-specific block data
    var block_info_by_id = sb2.block_info_by_id = {}; // Maps blockid to its info
    var block_by_text = {}; // Maps minified text to block info (for parsing)
    var blockids = []; // List of all known block IDs, used during language loading


    // Initialize the English language block definitions.

    var english = {
        code: "en", // Language code

        aliases: { // Common aliases for blocks
            "turn left _ degrees": "turn @arrow-ccw _ degrees",
            "turn ccw _ degrees": "turn @arrow-ccw _ degrees",
            "turn ↺ _ degrees": "turn @arrow-ccw _ degrees",
            "turn right _ degrees": "turn @arrow-cw _ degrees",
            "turn cw _ degrees": "turn @arrow-cw _ degrees",
            "turn ↻ _ degrees": "turn @arrow-cw _ degrees",
            "when gf clicked": "when @green-flag clicked",
            "when flag clicked": "when @green-flag clicked",
            "when green flag clicked": "when @green-flag clicked",
            "when ⚑ clicked": "when @green-flag clicked",
        },

        define: ["define"], // Keywords for block definitions

        // Special handling for the "when distance < _" block to avoid parsing issues
        ignorelt: ["when distance"],

        // Mathematical functions that can be used with the "of" block
        math: [
            "abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin",
            "acos", "atan", "ln", "log", "e ^", "10 ^"
        ],

        // Blocks that function as "other scripts in sprite/stage" caps
        osis: ["other scripts in sprite", "other scripts in stage"],

        blocks: [], // This array will be populated just below with actual block data.

        palette: { // Defines categories for the Scratch palette (currently not used by scratchblocks2 output)
            "Control": "Control",
            "Data": "Data",
            "Events": "Events",
            "Looks": "Looks",
            "More Blocks": "More Blocks",
            "Motion": "Motion",
            "Operators": "Operators",
            "Pen": "Pen",
            "Sensing": "Sensing",
            "Sound": "Sound",
            "List": "Lists",
            "Variables": "Variables",
        },
    };

    // Mapping for image placeholders to their corresponding text/unicode representations.
    var image_text = {
        "arrow-cw": "↻",
        "arrow-ccw": "↺",
    };

    // The comprehensive list of all English blocks, categorized and with their default shapes.
    var english_blocks = [
        // Motion Category Blocks
        ["motion"],

        ["move _ steps", []],
        ["turn @arrow-ccw _ degrees", []],
        ["turn @arrow-cw _ degrees", []],

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


        // Looks Category Blocks
        ["looks"],

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

        // Stage-specific Looks blocks
        ["switch backdrop to _ and wait", []],
        ["next backdrop", []],

        ["backdrop #", []],

        // Scratch 1.4 Looks blocks (older versions)
        ["switch to costume _", []],

        ["switch to background _", []],
        ["next background", []],
        ["background #", []],


        // Sound Category Blocks
        ["sound"],

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


        // Pen Category Blocks
        ["pen"],

        ["clear", []],

        ["stamp", []],

        ["pen down", []],
        ["pen up", []],

        ["set pen color to _", []], // Note: two blocks with same spec, different functionality in Scratch
        ["change pen color by _", []],
        ["set pen color to _", []], // This is the other "set pen color to" block

        ["change pen shade by _", []],
        ["set pen shade to _", []],

        ["change pen size by _", []],
        ["set pen size to _", []],


        // Variables Category Blocks
        ["variables"],

        ["set _ to _", []],
        ["change _ by _", []],
        ["show variable _", []],
        ["hide variable _", []],


        // List Category Blocks
        ["list"],

        ["add _ to _", []],

        ["delete _ of _", []],
        ["insert _ at _ of _", []],
        ["replace item _ of _ with _", []],

        ["item _ of _", []],
        ["length of _", []],
        ["_ contains _", []],

        ["show list _", []],
        ["hide list _", []],


        // Events Category Blocks
        ["events"],

        ["when @green-flag clicked", ["hat"]], // Hat block
        ["when _ key pressed", ["hat"]],
        ["when this sprite clicked", ["hat"]],
        ["when Stage clicked", ["hat"]],
        ["when backdrop switches to _", ["hat"]],

        ["when _ > _", ["hat"]],

        ["when I receive _", ["hat"]],
        ["broadcast _", []],
        ["broadcast _ and wait", []],


        // Control Category Blocks
        ["control"],

        ["wait _ secs", []],

        ["repeat _", ["cstart"]], // C-block start
        ["forever", ["cstart", "cap"]], // C-block start and cap
        ["if _ then", ["cstart"]],
        ["else", ["celse"]], // C-block else part
        ["end", ["cend"]], // C-block end
        ["wait until _", []],
        ["repeat until _", ["cstart"]],

        ["stop _", ["cap"]], // Cap block

        ["when I start as a clone", ["hat"]],
        ["create clone of _", []],
        ["delete this clone", ["cap"]],

        // Scratch 1.4 Control blocks
        ["if _", ["cstart"]],
        ["forever if _", ["cstart", "cap"]],
        ["stop script", ["cap"]],
        ["stop all", ["cap"]],


        // Sensing Category Blocks
        ["sensing"],

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

        // Scratch 1.4 Sensing blocks
        ["loud?", []],


        // Operators Category Blocks
        ["operators"],

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


        // Extension Category Blocks (PicoBoard, LEGO WeDo, etc.)
        ["extension"],

        // PicoBoard blocks
        ["when _", ["hat"]],
        ["when _ _ _", ["hat"]],
        ["sensor _?", []],
        ["_ sensor value", []],

        // LEGO WeDo blocks
        ["turn _ on for _ secs", []],
        ["turn _ on", []],
        ["turn _ off", []],
        ["set _ power _", []],
        ["set _ direction _", []],
        ["when distance _ _", ["hat"]],
        ["when tilt _ _", ["hat"]],
        ["distance", []],
        ["tilt", []],

        // Older LEGO WeDo blocks
        ["turn motor on for _ secs", []],
    ];