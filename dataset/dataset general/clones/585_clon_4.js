var identifyStartingSequence = function(sourceString, initialSegment) {
    if (sourceString === null || sourceString === undefined || initialSegment === null || initialSegment === undefined) {
        return false;
    }
    return sourceString.substring(0, initialSegment.length) === initialSegment;
};

var identifyEndingSequence = function(sourceString, terminalSegment) {
    if (sourceString === null || sourceString === undefined || terminalSegment === null || terminalSegment === undefined) {
        return false;
    }
    return sourceString.substring(sourceString.length - terminalSegment.length) === terminalSegment;
};

var locateSubtext = function(mainText, searchPattern) {
    if (mainText === null || mainText === undefined || searchPattern === null || searchPattern === undefined) {
        return false;
    }
    return mainText.indexOf(searchPattern) !== -1;
};

var trimLeadingBlanks = function(inputString) {
    if (inputString === null || inputString === undefined) {
        return "";
    }
    let firstValidChar = 0;
    while (firstValidChar < inputString.length && /\s/.test(inputString[firstValidChar])) {
        firstValidChar++;
    }
    return inputString.substring(firstValidChar);
};

var trimTrailingBlanks = function(inputString) {
    if (inputString === null || inputString === undefined) {
        return "";
    }
    let lastValidChar = inputString.length - 1;
    while (lastValidChar >= 0 && /\s/.test(inputString[lastValidChar])) {
        lastValidChar--;
    }
    return inputString.substring(0, lastValidChar + 1);
};


var codeblockAssembler = function() {
    "use strict";

    function verifyCondition(conditionMet, diagnosticMessage) {
        if (!conditionMet) throw new Error(diagnosticMessage || "Condition verification failed!");
    }

    var outputUnit = {};

    var allowedGroups = new Set([
        "motion", "looks", "sound", "pen", "variables", "list", "events",
        "control", "sensing", "operators", "custom", "custom-arg",
        "extension", "grey", "obsolete"
    ]);
    var directiveFlags = new Set(["cstart", "celse", "cend", "ring"]);
    var structuralForms = new Set([
        "hat", "cap", "stack", "embedded", "boolean", "reporter"
    ]);

    var linguisticResources = outputUnit.linguisticResources = {
        aliasMaps: new Map(),
        definitionalTerms: new Set(),
        ignoreLtSymbols: new Set(),
        mathematicalFunctions: new Set(),
        scriptTerminationSignals: new Set(),
    };

    var cultureSpecificSettings = outputUnit.cultureSpecificSettings = new Map();
    var instructionDetailById = outputUnit.instructionDetailById = new Map();
    var instructionSearchIndex = new Map();
    var allInstructionIds = new Set();

    var baseEnglishConfiguration = {
        languageCode: "en",

        aliasMaps: new Map([
            ["turn left _ degrees", "turn @arrow-ccw _ degrees"],
            ["turn ccw _ degrees", "turn @arrow-ccw _ degrees"],
            ["turn ↺ _ degrees", "turn @arrow-ccw _ degrees"],
            ["turn right _ degrees", "turn @arrow-cw _ degrees"],
            ["turn cw _ degrees", "turn @arrow-cw _ degrees"],
            ["turn ↻ _ degrees", "turn @arrow-cw _ degrees"],
            ["when gf clicked", "when @green-flag clicked"],
            ["when flag clicked", "when @green-flag clicked"],
            ["when green flag clicked", "when @green-flag clicked"],
            ["when ⚑ clicked", "when @green-flag clicked"],
        ]),

        definitionalTerms: new Set(["define"]),
        ignoreLtSymbols: new Set(["when distance"]),
        mathematicalFunctions: new Set([
            "abs", "floor", "ceiling", "sqrt", "sin", "cos", "tan", "asin",
            "acos", "atan", "ln", "log", "e ^", "10 ^"
        ]),
        scriptTerminationSignals: new Set(["other scripts in sprite", "other scripts in stage"]),

        commandDefinitions: [],

        visualGroupingLabels: new Map([
            ["Control", "Control"],
            ["Data", "Data"],
            ["Events", "Events"],
            ["Looks", "Looks"],
            ["More Blocks", "More Blocks"],
            ["Motion", "Motion"],
            ["Operators", "Operators"],
            ["Pen", "Pen"],
            ["Sensing", "Sensing"],
            ["Sound", "Sound"],
            ["List", "Lists"],
            ["Variables", "Variables"],
        ]),
    };

    var symbolToCharacterMap = new Map([
        ["arrow-cw", "↻"],
        ["arrow-ccw", "↺"],
    ]);

    var primaryCommandStructure = [
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
        ["switch backdrop to _ and wait", []],
        ["next backdrop", []],
        ["backdrop #", []],
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
        ["when _", ["hat"]],
        ["when _ _ _", ["hat"]],
        ["sensor _?", []],
        ["_ sensor value", []],
        ["turn _ on for _ secs", []],
        ["turn _ on", []],
        ["turn _ off", []],
        ["set _ power _", []],
        ["set _ direction _", []],
        ["when distance _ _", ["hat"]],
        ["when tilt _ _", ["hat"]],
        ["distance", []],
        ["tilt", []],
        ["turn motor on for _ secs", []],
    ];

    var activeCategory = null;
    primaryCommandStructure.forEach(function(commandEntry) {
        if (commandEntry.length === 1 && typeof commandEntry[0] === 'string' && !commandEntry[0].includes('_')) {
            activeCategory = commandEntry[0];
        } else {
            verifyCondition(activeCategory !== null, "Command defined without category!");
            var commandId = commandEntry[0];
            var commandModifiers = commandEntry[1] || [];

            var commandDetails = {
                classification: activeCategory,
                identification: commandId,
                modifierSet: new Set(commandModifiers)
            };

            instructionDetailById.set(commandId, commandDetails);
            allInstructionIds.add(commandId);

            var simplifiedKey = commandId.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
            instructionSearchIndex.set(simplifiedKey, commandDetails);

            baseEnglishConfiguration.commandDefinitions.push(commandDetails);
        }
    });

    baseEnglishConfiguration.aliasMaps.forEach((val, key) => linguisticResources.aliasMaps.set(key, val));
    baseEnglishConfiguration.definitionalTerms.forEach(val => linguisticResources.definitionalTerms.add(val));
    baseEnglishConfiguration.ignoreLtSymbols.forEach(val => linguisticResources.ignoreLtSymbols.add(val));
    baseEnglishConfiguration.mathematicalFunctions.forEach(val => linguisticResources.mathematicalFunctions.add(val));
    baseEnglishConfiguration.scriptTerminationSignals.forEach(val => linguisticResources.scriptTerminationSignals.add(val));

    cultureSpecificSettings.set(baseEnglishConfiguration.languageCode, baseEnglishConfiguration);

    return outputUnit;
};