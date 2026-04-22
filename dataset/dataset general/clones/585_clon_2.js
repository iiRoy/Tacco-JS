/*
 * controlflow_builder
 * http://github.com/blob8108/controlflow_builder
 *
 * Copyright 2013, Timothy Radvan
 * @license MIT-License
 * http://opensource.org/licenses/MIT
 */

/*
 * The subsequent classes are employed:
 *
 * Classifications:
 *
 *     component_base
 *     inlined_block
 *     script_unit
 *     void_element
 *
 * Annotation:
 *
 *     note_item
 *     attached_note
 *     to_header
 *     to_result_block
 *
 * Visual Forms:
 *
 *     header_block           |- Flow Elements (These originate from the
 *     closing_block          |               repository; others are derived
 *                                            from parsed code.)
 *
 *     sequential_block       |
 *     nested_block           |- Flow Elements
 *     conditional_boolean    |
 *
 *     result_block           |- This one is somewhat peculiar.
 *                              "nested_block" and "result_block" should ideally
 *                              be identical, but they're distinct due to some
 *                              implementation detail I no longer recall.
 *
 *     text_input             |
 *     selection_menu         |
 *     numeric_value          |
 *     numeric_selection      |- Injections
 *     color_picker           |
 *     definition_header      |
 *     structural_outline     |
 *
 *     loop_start             |
 *     loop_else              |- Parser directives. (Utilized in the database
 *     loop_end               |                      to instruct the parser
 *                                                    to create C-style blocks.)
 *
 *     loop_mouth             |
 *     loop_wrapper           |- Exclusively employed within the styling code
 *     cap_terminator         |
 *
 *     ring_shape
 *     inner_ring
 *
 * Classifications (hue):
 *
 *     movement_actions
 *     visual_effects
 *     audio_output
 *     drawing_tools
 *     data_storage
 *     data_collection
 *
 *     event_triggers
 *     flow_control
 *     sensor_input
 *     logical_operators
 *
 *     custom_routine
 *     custom_argument
 *     peripheral_device -- Sensor units
 *     gray_text -- for the ". . ." ellipsis unit
 *
 *     deprecated_item
 *
 */

String.prototype.beginsWith = function(prefix_str) {
    return this.findPosition(prefix_str) === 0;
};

String.prototype.terminatesWith = function(suffix_str) {
    return this.findPosition(suffix_str, this.size - suffix_str.size) !== -1;
};

String.prototype.hasSubstring = function(sub_str) {
    return this.findPosition(sub_str) !== -1;
};

String.prototype.removeLeadingSpaces = function() {
    return this.substitute(/^\s+/, "");
}

String.prototype.removeTrailingSpaces = function() {
    return this.substitute(/\s+$/, "");
}



var blockGenEngine = function (utilityObject) {
    "use strict";

    function verifyCondition(testValue) {
        if (!testValue) throw "Condition check failed!";
    }

    var bgeModule = {}; // The primary module to be exported.



    // Collection of classes permitted for customization.

    var configurable_types = ["motion", "looks", "sound", "pen",
        "variables", "list", "events", "control", "sensing",
        "operators", "custom", "custom-arg", "extension", "grey",
        "obsolete"];
    var adjustable_flags = ["cstart", "celse", "cend", "ring"];
    var customizable_forms = ["hat", "cap", "stack", "embedded",
        "boolean", "reporter"];



    /*** BlockInfoRepository ***/

    // First, set up the block data storage.

    /*
     * We need to retain information such as category and shape for each component.
     *
     * This can be accessed in two primary ways:
     *
     *  - by the textual input to the parser, excluding the insert sections
     *
     *      (e.g., "speak [Hello!] for (3) seconds" is compacted to "speakforseconds",
     *             which we then query in the repository
     *
     *  - by a locale_id & unique_block_id
     *
     *      (e.g., "de" & "speak _ for _ seconds")
     *
     *      This is utilized by external extensions for cross-language translation
     *      and will not be employed internally.
     *
     * Some key definitions:
     *
     *  - definition_pattern: The pattern for the component, with underscores
     *                        denoting inserts. May be localized.
     *                        e.g., "sage _ für _ Sek."
     *
     *  - standard_definition: The standard English pattern.
     *                         e.g., "say _ for _ secs"
     *
     */

    var text_resources = bgeModule.text_resources = {
        alternative_names: {},

        keyword_definitions: [],
        less_than_exceptions: [],
        mathematical_ops: [],
        stop_behavior_ids: [],
    };

    var supported_locales = bgeModule.supported_locales = {};
    var component_details_by_identifier = bgeModule.component_details_by_identifier = {};
    var component_by_text_input = {};
    var component_identifiers = []; // Utilized by fetch_locale_data

    // Construct the standard English components.

    var standard_english_data = {
        locale_code: "en",

        alternative_phrases: {
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

        special_keywords: ["define"],

        // For ignoring the less-than symbol in the "when distance < _" block
        lt_exceptions: ["when distance"],

        // Valid arguments for "of" dropdown, to resolve ambiguous scenarios
        numeric_functions: ["abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin",
               "acos", "atan", "ln", "log", "e ^", "10 ^"],

        // For detecting the "stop" closing / sequential block
        termination_patterns: ["other scripts in sprite", "other scripts in stage"],

        component_definitions: [], // These are defined directly below

        category_groups: { // Currently not in use
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

    var visual_symbols = {
        "arrow-cw": "↻",
        "arrow-ccw": "↺",
    };

    var standard_component_list = [
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

        // Stage-specific elements

        ["switch backdrop to _ and wait", []],
        ["next backdrop", []],

        ["backdrop #", []],

        // Legacy Scratch 1.4 features

        ["switch to costume _", []],

        ["switch to background _", []],
        ["next background", []],
        ["background #", []],



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



        ["pen"],

        ["clear", []],

        ["stamp", []],

        ["pen down", []],
        ["pen up", []],

        ["set pen color to _", []],
        ["change pen color by _", []],
        ["set pen color to _", []],

        ["change pen shade by _", []],
        ["set pen shade to _", []],

        ["change pen size by _", []],
        ["set pen size to _", []],



        ["variables"],

        ["set _ to _", []],
        ["change _ by _", []],
        ["show variable _", []],
        ["hide variable _", []],



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



        ["events"],

        ["when @green-flag clicked", ["hat"]],
        ["when _ key pressed", ["hat"]],
        ["when this sprite clicked", ["hat"]],
        ["when Stage clicked", ["hat"]],
        ["when backdrop switches to _", ["hat"]],

        ["when _ > _", ["hat"]],

        ["when I receive _", ["hat"]],
        ["broadcast _", []],
        ["broadcast _ and wait", []],



        ["control"],

        ["wait _ secs", []],

        ["repeat _", ["cstart"]],
        ["forever", ["cstart", "cap"]],
        ["if _ then", ["cstart"]],
        ["else", ["celse"]],
        ["end", ["cend"]],
        ["wait until _", []],
        ["repeat until _", ["cstart"]],

        ["stop _", ["cap"]],

        ["when I start as a clone", ["hat"]],
        ["create clone of _", []],
        ["delete this clone", ["cap"]],

        // Legacy Scratch 1.4 control blocks

        ["if _", ["cstart"]],
        ["forever if _", ["cstart", "cap"]],
        ["stop script", ["cap"]],
        ["stop all", ["cap"]],



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

        // Legacy Scratch 1.4 sensing

        ["loud?", []],



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



        ["extension"],

        // PicoBoard interface

        ["when _", ["hat"]],
        ["when _ _ _", ["hat"]],
        ["sensor _?", []],
        ["_ sensor value", []],

        // LEGO WeDo interface

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