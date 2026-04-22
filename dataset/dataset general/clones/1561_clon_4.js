const getBracketsModule = brackets.getModule;
const appStart = getBracketsModule("utils/AppInit");
const hintSystem = getBracketsModule("editor/CodeHintManager");
const extensionUtilities = getBracketsModule("utils/ExtensionUtils");
const textContextAnalyzer = getBracketsModule("utils/TokenUtils");
const preferenceRegistry = getBracketsModule("preferences/PreferencesManager");
const extensionSettings = preferenceRegistry.getExtensionPrefs("php-sig.php-smarthints");

const stringResources = require('strings');
const phpBaseData = require("phpdata/php-predefined");
const functionCategoryData = require("text!phpdata/php-function-groups.json");
const userInterfaceForProjects = require("project-ui");

let baseFunctionSet = [];
let controlElement = document.createElement('a');
controlElement.setAttribute('title', stringResources.EXTENSION_NAME);
controlElement.setAttribute('id', 'php-sugg-ctrl-icon');
let categoryDisplayFilters = [];

const retrieveTokenSegment = (contextDetails) => {
    const { token: { start: tokenStartPos, string: tokenContent }, pos: { ch: cursorCharPos } } = contextDetails;
    return tokenContent.substring(0, (cursorCharPos - tokenStartPos));
};

const HintProviderService = (() => {
    let currentTextEditor = null;
    let currentInputPrefix = "";
    let previousEditorToken = null;
    let cachedSourceVariables = new Set();
    let phpConstantSuggestions = new Set();
    let phpKeywordSuggestions = new Set();
    let phpFunctionSuggestions = new Set();
    let phpGlobalVariables = new Set();

    const variableIdentifierRegex = /\$[_a-zA-Z][_a-zA-Z0-9]*/g;

    const createDisplayHint = (value, cssClass) => ({
        text: () => value,
        className: cssClass
    });

    const evaluateHintPossibility = (editorInstance, charTrigger) => {
        currentTextEditor = editorInstance;
        const currentCursorLoc = editorInstance.getCursorPos();
        const initialTokenContext = textContextAnalyzer.getInitialContext(editorInstance._codeMirror, currentCursorLoc);
        currentInputPrefix = retrieveTokenSegment(initialTokenContext);

        if (charTrigger === "$" || initialTokenContext.token.string.startsWith("$")) {
            return true;
        }

        if (initialTokenContext.token.string.length > 1 || charTrigger === null) {
            const searchPattern = currentInputPrefix.toLowerCase();
            return Array.from(phpKeywordSuggestions).some(item => item.toLowerCase().startsWith(searchPattern)) ||
                   Array.from(phpConstantSuggestions).some(item => item.toLowerCase().startsWith(searchPattern)) ||
                   Array.from(phpFunctionSuggestions).some(item => item.toLowerCase().startsWith(searchPattern));
        }
        return false;
    };

    const fetchAllSuggestions = (charTrigger) => {
        const currentCursorLoc = currentTextEditor.getCursorPos();
        const initialTokenContext = textContextAnalyzer.getInitialContext(currentTextEditor._codeMirror, currentCursorLoc);
        currentInputPrefix = retrieveTokenSegment(initialTokenContext);

        let collectedOutputHints = [];
        const lowerCasePrefix = currentInputPrefix.toLowerCase();

        if (charTrigger === "$" || initialTokenContext.token.string.startsWith("$")) {
            if (!previousEditorToken ||
                initialTokenContext.token.start !== previousEditorToken.token.start ||
                initialTokenContext.pos.line !== previousEditorToken.pos.line) {
                cachedSourceVariables.clear();
                const entireDocumentContent = currentTextEditor.document.getText();
                const discoveredVariables = entireDocumentContent.match(variableIdentifierRegex);
                if (discoveredVariables) {
                    discoveredVariables.forEach(v => cachedSourceVariables.add(v));
                }
            }
            previousEditorToken = initialTokenContext;

            Array.from(cachedSourceVariables)
                .filter(v => v.toLowerCase().startsWith(lowerCasePrefix))
                .sort()
                .forEach(v => collectedOutputHints.push(createDisplayHint(v, "PHPSmartHints-completion PHPSmartHints-completion-localvar")));

            Array.from(phpGlobalVariables)
                .filter(v => v.toLowerCase().startsWith(lowerCasePrefix))
                .forEach(v => collectedOutputHints.push(createDisplayHint(v, "PHPSmartHints-completion PHPSmartHints-completion-phpvar")));

        } else {
            const filterAndFormat = (sourceSet, classNameSuffix) =>
                Array.from(sourceSet)
                    .filter(entry => entry.toLowerCase().startsWith(lowerCasePrefix))
                    .map(entry => createDisplayHint(entry, `PHPSmartHints-completion ${classNameSuffix}`));

            const keywordHintList = filterAndFormat(phpKeywordSuggestions, "PHPSmartHints-completion-phpkeyword");
            const constantHintList = filterAndFormat(phpConstantSuggestions, "PHPSmartHints-completion-phpconstant");
            const functionHintList = filterAndFormat(phpFunctionSuggestions, "PHPSmartHints-completion-phpfunction");

            collectedOutputHints = [...keywordHintList, ...constantHintList, ...functionHintList].sort((a, b) => a.text().localeCompare(b.text()));
        }

        return {
            hints: collectedOutputHints,
            match: false,
            selectInitial: true,
            handleWideResults: false
        };
    };

    const commitSelectedSuggestion = (chosenHint) => {
        const currentCursorLoc = currentTextEditor.getCursorPos();
        const currentTokenAtCursor = currentTextEditor._codeMirror.getTokenAt(currentCursorLoc);
        const startOfReplacement = { line: currentCursorLoc.line, ch: currentTokenAtCursor.start };
        const endOfReplacement = { line: currentCursorLoc.line, ch: currentCursorLoc.ch };

        currentTextEditor.document.replaceRange(chosenHint.text(), startOfReplacement, endOfReplacement);
        return false;
    };

    const deduplicateAndSort = (inputArray) => Array.from(new Set(inputArray)).sort();

    const constructFunctionGroupedList = (preferredSelections) => {
        const categoriesParsed = JSON.parse(functionCategoryData);
        let activeFunctionCollection = new Set();
        categoryDisplayFilters.length = 0;

        Object.entries(categoriesParsed).forEach(([groupName, groupDetails]) => {
            const isGroupIncluded = preferredSelections.length === 0 || preferredSelections.includes(groupName);
            if (isGroupIncluded) {
                groupDetails.fnNames.forEach(funcName => activeFunctionCollection.add(funcName));
            }
            categoryDisplayFilters.push({
                "filter": groupName,
                "filterName": groupDetails.name,
                "checked": isGroupIncluded ? "checked" : ""
            });
        });
        return Array.from(activeFunctionCollection).concat(baseFunctionSet);
    };

    const adjustFunctionPreferences = (selectedFunctionGroups) => {
        const rawFunctionList = constructFunctionGroupedList(selectedFunctionGroups);
        phpFunctionSuggestions = new Set(deduplicateAndSort(rawFunctionList));
    };

    const updateProjectToolbarStatus = (isProjectCurrentlyPhp) => {
        if (isProjectCurrentlyPhp) {
            controlElement.classList.add('active');
        } else {
            controlElement.classList.remove('active');
        }
    };

    const initializeService = (moduleReference) => {
        baseFunctionSet = phpBaseData.predefinedFunctions;

        extensionSettings.definePreference("filteredFunctionList", "array", [])
            .on("change", () => {
                adjustFunctionPreferences(extensionSettings.get("filteredFunctionList", { location: { scope: "project" } }));
            });
        extensionSettings.definePreference("isPhpProject", "boolean", false)
            .on("change", () => {
                updateProjectToolbarStatus(extensionSettings.get("isPhpProject", { location: { scope: "project" } }));
            });

        adjustFunctionPreferences(extensionSettings.get("filteredFunctionList", { location: { scope: "project" } }));
        updateProjectToolbarStatus(extensionSettings.get("isPhpProject", { location: { scope: "project" } }));

        hintSystem.registerHintProvider({
            hasHints: evaluateHintPossibility,
            getHints: fetchAllSuggestions,
            insertHint: commitSelectedSuggestion
        }, ["php"], 10);

        phpKeywordSuggestions = new Set(deduplicateAndSort(phpBaseData.keywords));
        phpConstantSuggestions = new Set(deduplicateAndSort(phpBaseData.predefinedConstants));
        phpGlobalVariables = new Set(deduplicateAndSort(phpBaseData.predefinedVariables));

        extensionUtilities.loadStyleSheet(moduleReference, "css/main.css");
        document.getElementById('main-toolbar').querySelector('.buttons').appendChild(controlElement);
        controlElement.addEventListener("click", () => {
            userInterfaceForProjects.showProjectDialog(categoryDisplayFilters);
        });
    };

    return {
        start: initializeService
    };
})();

appStart.appReady(() => {
    HintProviderService.start(null);
});