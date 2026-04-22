/* Type IV clone of Redactor v9.1.9 */

"use strict";

// --- Global Registry and Utility Functions ---

// WeakMap to store instances, allowing garbage collection of elements if they are removed from the DOM
const composerInstanceRegistry = new WeakMap();

let uniqueProcessorIdCounter = 0;

// Custom deep merge function, replacing jQuery.extend(true, ...)
const deepMergeConfigurations = (baseConfiguration, ...additionalSources) => {
    const mergedResult = { ...baseConfiguration
    };
    for (const sourceObject of additionalSources) {
        if (!sourceObject) continue;
        for (const key in sourceObject) {
            if (Object.prototype.hasOwnProperty.call(sourceObject, key)) {
                if (typeof mergedResult[key] === 'object' && mergedResult[key] !== null &&
                    typeof sourceObject[key] === 'object' && sourceObject[key] !== null &&
                    !Array.isArray(mergedResult[key]) && !Array.isArray(sourceObject[key])) {
                    mergedResult[key] = deepMergeConfigurations(mergedResult[key], sourceObject[key]);
                } else {
                    mergedResult[key] = sourceObject[key];
                }
            }
        }
    }
    return mergedResult;
};

// Utility to filter an array, replacing custom loop logic
const filterArrayExcludingValue = (inputArray, valueToExclude) => {
    return inputArray.filter(item => item !== valueToExclude);
};

// Browser detection utility, replacing internal 'browser' method
const environmentCheck = (() => {
    const userAgentString = navigator.userAgent.toLowerCase();
    return {
        isIE: /msie|trident/.test(userAgentString),
        isOpera: /opera/.test(userAgentString)
    };
})();

// --- Text Selection Boundary Information Class ---
// Replaces the original 'Range' function
class TextSelectionBoundary {
    constructor(nativeRangeObject) {
        this.startPoint = nativeRangeObject.startOffset;
        this.endPoint = nativeRangeObject.endOffset;
        this.nativeRangeObject = nativeRangeObject; // Store the original native Range
    }

    // Renamed from 'equals'
    checkEquality() {
        return this.startPoint === this.endPoint;
    }
}

// --- Main Content Composer Class ---
// Replaces the Redactor.prototype.init constructor and Redactor.fn object
class ContentComposer {
    // Static property for version, replacing $.Redactor.VERSION
    static RELEASE_TAG = '9.1.9-CLONE';

    // Static object for default configurations, replacing $.Redactor.opts
    static globalEditorSetup = {
        // General Settings (renamed from 'settings')
        rangeSupport: false,
        useIframe: false,
        fullDocumentMode: false,
        customStylesheet: false,
        languageCode: 'en',
        textDirection: 'ltr',
        placeholderText: false,
        wysiwygMode: false,
        mobileFriendly: true,
        enableCleanup: true,
        formatHtmlOutput: true,
        pasteAsPlainText: false,
        removeEmptyStructuralTags: true,
        templateVariables: false,
        xhtmlCompliance: false,
        initialVisualMode: true,
        autoFocus: false,
        tabIndexValue: false,
        autoResizeContent: true,
        minimumHeight: false,
        maximumHeight: false,
        keyboardShortcuts: true,

        // Autosave (renamed from 'autosave')
        autoSaveEndpoint: false,
        autoSaveIntervalSeconds: 60,

        // Plugin Management (renamed from 'plugins')
        activePlugins: false,

        // Link Handling (renamed from 'linkAnchor', 'linkEmail', etc.)
        allowLinkAnchor: true,
        allowLinkEmail: true,
        defaultLinkProtocol: 'http://',
        linkNoFollow: false,
        maxLinkLength: 50,

        // Image Handling (renamed from 'imageFloatMargin', 'imageGetJson')
        imageFloatMarginStyle: '10px',
        imageGallerySource: false,

        // Uploads (renamed from 'imageUpload', 'fileUpload', etc.)
        imageUploadEndpoint: false,
        imageUploadFieldName: 'file',
        fileUploadEndpoint: false,
        fileUploadFieldName: 'file',
        clipboardUploadEnabled: true,
        clipboardUploadUrlEndpoint: false,
        dragAndDropUpload: true,

        // Drag & Drop Specific (renamed from 'dnbImageTypes')
        allowedDnDImageTypes: ['image/png', 'image/jpeg', 'image/gif'],

        // Cloud Storage (renamed from 's3', 'uploadFields')
        s3Integration: false,
        additionalUploadFields: false,

        // Observers (renamed from 'observeImages', 'observeLinks')
        observeImageChanges: true,
        observeLinkChanges: true,

        // UI Components (renamed from 'modalOverlay')
        modalOverlayActive: true,

        // Input Behavior (renamed from 'tabSpaces', 'tabFocus')
        tabSpacesCount: false,
        tabFocusEnabled: true,

        // Air Toolbar (renamed from 'air', 'airButtons')
        airToolbarEnabled: false,
        airToolbarButtons: ['formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent'],

        // Main Toolbar (renamed from 'toolbar', 'toolbarFixed', etc.)
        mainToolbarEnabled: true,
        mainToolbarFixed: false,
        mainToolbarFixedTarget: document,
        mainToolbarFixedTopOffset: 0,
        mainToolbarFixedToBox: false,
        mainToolbarExternalSelector: false,
        showSourceButton: true,
        buttonDividerHtml: '<li class="editor_button_separator"></li>',

        // Custom Buttons (renamed from 'buttonsCustom', 'buttonsAdd', 'buttons')
        customButtonDefinitions: {},
        additionalButtons: [],
        toolbarButtonOrder: ['html', '|', 'formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent', '|', 'image', 'video', 'file', 'table', 'link', '|', 'alignment', '|', 'horizontalrule'],

        // Active States (renamed from 'activeButtons', 'activeButtonsStates', 'activeButtonsAdd')
        activeButtonClasses: ['deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist', 'alignleft', 'aligncenter', 'alignright', 'justify', 'table'],
        activeButtonTagMappings: {
            b: 'bold',
            strong: 'bold',
            i: 'italic',
            em: 'italic',
            del: 'deleted',
            strike: 'deleted',
            ul: 'unorderedlist',
            ol: 'orderedlist',
            u: 'underline',
            tr: 'table',
            td: 'table',
            table: 'table'
        },
        additionalActiveButtonMappings: false,

        // Formatting (renamed from 'formattingTags')
        blockFormattingTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

        // Content Processing (renamed from 'linebreaks', 'paragraphy', etc.)
        useLineBreaks: false,
        useParagraphs: true,
        convertDivElements: true,
        convertLinksToAnchors: true,
        convertImageLinksToImages: false,
        convertVideoLinksToVideos: false,
        formatPreAsCode: false,
        allowPhpTags: false,

        // Tag Filtering (renamed from 'allowedTags', 'deniedTags')
        permittedTags: false,
        forbiddenTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'],

        // Semantic Tags (renamed from 'boldTag', 'italicTag')
        boldSemanticTag: 'strong',
        italicSemanticTag: 'em',

        // Private/Internal Configuration (renamed from 'private' section)
        indentationPixelValue: 20,
        undoBuffer: [],
        redoBuffer: [],
        textareaModeActive: false,
        emptyContentHtml: '<p>&#x200b;</p>',
        nonBreakingSpaceChar: '&#x200b;',
        blockElementTestPattern: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i,
        alignmentTargetTags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
            'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
            'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'
        ],
        selfClosingTags: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'],
        containedLineTags: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'],
        newLevelBlockTags: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'],
        allBlockLevelElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
            'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
            'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'
        ],

        // Language Packs (renamed from 'langs')
        languagePacks: {
            en: {
                htmlText: 'HTML',
                insertVideo: 'Insert Video',
                insertImage: 'Insert Image',
                tableControl: 'Table',
                insertLink: 'Link',
                linkEntry: 'Insert link',
                linkAdjust: 'Edit link',
                removeLink: 'Unlink',
                formatOptions: 'Formatting',
                normalParagraph: 'Normal text',
                blockQuote: 'Quote',
                codeBlock: 'Code',
                headerOne: 'Header 1',
                headerTwo: 'Header 2',
                headerThree: 'Header 3',
                headerFour: 'Header 4',
                headerFive: 'Header 5',
                boldText: 'Bold',
                italicText: 'Italic',
                fontColor: 'Font Color',
                backColor: 'Back Color',
                unorderedList: 'Unordered List',
                orderedList: 'Ordered List',
                decreaseIndent: 'Outdent',
                increaseIndent: 'Indent',
                cancelAction: 'Cancel',
                insertAction: 'Insert',
                saveAction: 'Save',
                deleteAction: 'Delete',
                insertTable: 'Insert Table',
                addRowAbove: 'Add Row Above',
                addRowBelow: 'Add Row Below',
                addColumnLeft: 'Add Column Left',
                addColumnRight: 'Add Column Right',
                deleteColumn: 'Delete Column',
                deleteRow: 'Delete Row',
                deleteTable: 'Delete Table',
                tableRows: 'Rows',
                tableColumns: 'Columns',
                addTableHeader: 'Add Head',
                deleteTableHeader: 'Delete Head',
                itemTitle: 'Title',
                imageAlignment: 'Position',
                alignNone: 'None',
                alignLeft: 'Left',
                alignRight: 'Right',
                imageWebLink: 'Image Web Link',
                textLabel: 'Text',
                emailLink: 'Email',
                webLink: 'URL',
                videoEmbedCode: 'Video Embed Code',
                insertFile: 'Insert File',
                uploadFile: 'Upload',
                downloadFile: 'Download',
                chooseFile: 'Choose',
                orChoose: 'Or choose',
                dropFileHere: 'Drop file here',
                alignTextLeft: 'Align text to the left',
                alignTextCenter: 'Center text',
                alignTextRight: 'Align text to the right',
                alignTextJustify: 'Justify text',
                horizontalRule: 'Insert Horizontal Rule',
                deletedText: 'Deleted',
                anchorLink: 'Anchor',
                openLinkInNewTab: 'Open link in new tab',
                underlineText: 'Underline',
                textAlignment: 'Alignment',
                fileNameOptional: 'Name (optional)',
                editContent: 'Edit'
            }
        }
    };

    // Keyboard Key Identifiers (replaces Redactor.fn.keyCode)
    static keyIdentifierMap = {
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ARROW_DOWN: 40,
        ENTER_KEY: 13,
        ESCAPE_KEY: 27,
        TAB_KEY: 9,
        CONTROL_KEY: 17,
        COMMAND_KEY: 91, // Meta key
        ARROW_LEFT: 37,
        LEFT_WINDOWS_KEY: 91
    };

    constructor(elementNode, initialConfiguration) {
        this.rtePasteActive = false; // Renamed from rtePaste
        this.targetElement = elementNode; // Renamed from $element
        this.originalSourceElement = elementNode; // Renamed from $source
        this.processorIdentifier = uniqueProcessorIdCounter++; // Renamed from uuid

        // Deep merge configurations, including data attributes from the element
        this.currentConfiguration = deepMergeConfigurations(
            ContentComposer.globalEditorSetup,
            this.originalSourceElement.dataset, // Assuming data attributes are camelCased for options
            initialConfiguration
        );

        this.isStartingUp = true; // Renamed from start
        this.activeDropdowns = []; // Renamed from dropdowns

        // Get initial sizes (using modern window.getComputedStyle)
        this.initialHeight = window.getComputedStyle(this.originalSourceElement).height; // Renamed from sourceHeight
        this.initialWidth = window.getComputedStyle(this.originalSourceElement).width; // Renamed from sourceWidth

        // Adjust configuration dependencies (renamed from original if-else chains)
        if (this.currentConfiguration.fullDocumentMode) this.currentConfiguration.useIframe = true;
        if (this.currentConfiguration.useLineBreaks) this.currentConfiguration.useParagraphs = false;
        if (this.currentConfiguration.useParagraphs) this.currentConfiguration.useLineBreaks = false;
        if (this.currentConfiguration.mainToolbarFixedToBox) this.currentConfiguration.mainToolbarFixed = true;

        // References to global document and window objects (renamed from this.document, this.window)
        this.docRef = document;
        this.winRef = window;

        // Selection state storage (renamed from savedSel)
        this.preservedSelection = false;

        // Setup regex patterns (renamed from cleanlineBefore, cleanlineAfter, cleannewLevel, rTestBlock)
        const selfClosingTagsPattern = this.currentConfiguration.selfClosingTags.join('|');
        const containedLineTagsPattern = this.currentConfiguration.containedLineTags.join('|');
        const newLevelBlockTagsPattern = this.currentConfiguration.newLevelBlockTags.join('|');
        const allBlockLevelElementsPattern = this.currentConfiguration.allBlockLevelElements.join('|');

        this.lineBreakPrecedingPattern = new RegExp(`^<(/?${selfClosingTagsPattern}|${containedLineTagsPattern})[ >]`);
        this.lineBreakFollowingPattern = new RegExp(`^<(br|/?${selfClosingTagsPattern}|/${containedLineTagsPattern})[ >]`);
        this.newBlockLevelPattern = new RegExp(`^</?(${newLevelBlockTagsPattern})[ >]`);
        this.blockElementTestPattern = new RegExp(`^(${allBlockLevelElementsPattern})$`, 'i');

        // Setup formatting permissions based on line breaks and allowed/denied tags
        if (this.currentConfiguration.useLineBreaks === false) {
            if (this.currentConfiguration.permittedTags !== false) {
                const searchTags = ['strong', 'em', 'del'];
                const addTags = ['b', 'i', 'strike'];

                if (!this.currentConfiguration.permittedTags.includes('p')) {
                    this.currentConfiguration.permittedTags.push('p');
                }

                for (let i = 0; i < searchTags.length; i++) {
                    if (this.currentConfiguration.permittedTags.includes(searchTags[i])) {
                        this.currentConfiguration.permittedTags.push(addTags[i]);
                    }
                }
            }

            if (this.currentConfiguration.forbiddenTags !== false) {
                const pIndex = this.currentConfiguration.forbiddenTags.indexOf('p');
                if (pIndex !== -1) {
                    this.currentConfiguration.forbiddenTags.splice(pIndex, 1);
                }
            }
        }

        // Browser specific toolbar adjustments
        if (environmentCheck.isIE || environmentCheck.isOpera) {
            this.currentConfiguration.toolbarButtonOrder = filterArrayExcludingValue(
                this.currentConfiguration.toolbarButtonOrder, 'horizontalrule'
            );
        }

        // Load the active language pack
        this.activeLanguagePack = this.currentConfiguration.languagePacks[this.currentConfiguration.languageCode];

        // Initiate the editor construction process
        this.initiateBuildingProcess();
    }

    // Placeholder for the actual editor construction logic (replaces buildStart)
    initiateBuildingProcess() {
        // This method would contain the complex logic for rendering the editor UI,
        // attaching event listeners, setting up iframes (if used), etc.
        // Its presence here fulfills the structural requirement of the clone.
    }

    // --- Placeholder methods for toolbar commands ---
    // These methods correspond to the 'action' or 'exec' properties in commandPanelDefinitions.
    // Their actual implementation is not part of the provided original code snippet,
    // so they remain as placeholders in the clone.
    toggleHtmlView() { /* ... implementation for HTML view toggle ... */ } // Renamed from 'toggle'
    showFormattingDropdown() { /* ... implementation for showing dropdown ... */ } // Renamed from 'show'
    applyBlockFormat(tagType) { /* ... implementation for formatting blocks ... */ } // Renamed from 'formatBlocks'
    applyQuoteFormat() { /* ... implementation for quote format ... */ } // Renamed from 'formatQuote'
    applyBold() { /* ... implementation for bold command ... */ } // Corresponds to exec 'bold'
    applyItalic() { /* ... implementation for italic command ... */ } // Corresponds to exec 'italic'
    applyStrikethrough() { /* ... implementation for strikethrough command ... */ } // Corresponds to exec 'strikethrough'
    applyUnderline() { /* ... implementation for underline command ... */ } // Corresponds to exec 'underline'
    insertUnorderedList() { /* ... implementation for unordered list ... */ } // Corresponds to exec 'insertunorderedlist'
    insertOrderedList() { /* ... implementation for ordered list ... */ } // Corresponds to exec 'insertorderedlist'
    decreaseContentIndent() { /* ... implementation for outdent ... */ } // Renamed from 'indentingOutdent'
    increaseContentIndent() { /* ... implementation for indent ... */ } // Renamed from 'indentingIndent'
    displayImageManager() { /* ... implementation for image manager ... */ } // Renamed from 'imageShow'
    displayVideoEmbedder() { /* ... implementation for video embedder ... */ } // Renamed from 'videoShow'
    displayFileManager() { /* ... implementation for file manager ... */ } // Renamed from 'fileShow'

    // --- Static Toolbar Command Definitions ---
    // Replaces the 'toolbarInit' method, now a static method returning the command structure.
    static commandPanelDefinitions() {
        const lang = ContentComposer.globalEditorSetup.languagePacks[ContentComposer.globalEditorSetup.languageCode];
        return {
            htmlCommand: {
                title: lang.htmlText,
                action: 'toggleHtmlView'
            },
            formattingCommand: {
                title: lang.formatOptions,
                action: 'showFormattingDropdown',
                subCommands: {
                    paragraph: {
                        title: lang.normalParagraph,
                        action: 'applyBlockFormat',
                        parameter: 'p'
                    },
                    blockquote: {
                        title: lang.blockQuote,
                        action: 'applyQuoteFormat',
                        cssClass: 'editor_format_blockquote'
                    },
                    preformatted: {
                        title: lang.codeBlock,
                        action: 'applyBlockFormat',
                        parameter: 'pre',
                        cssClass: 'editor_format_pre'
                    },
                    header1: {
                        title: lang.headerOne,
                        action: 'applyBlockFormat',
                        parameter: 'h1',
                        cssClass: 'editor_format_h1'
                    },
                    header2: {
                        title: lang.headerTwo,
                        action: 'applyBlockFormat',
                        parameter: 'h2',
                        cssClass: 'editor_format_h2'
                    },
                    header3: {
                        title: lang.headerThree,
                        action: 'applyBlockFormat',
                        parameter: 'h3',
                        cssClass: 'editor_format_h3'
                    },
                    header4: {
                        title: lang.headerFour,
                        action: 'applyBlockFormat',
                        parameter: 'h4',
                        cssClass: 'editor_format_h4'
                    },
                    header5: {
                        title: lang.headerFive,
                        action: 'applyBlockFormat',
                        parameter: 'h5',
                        cssClass: 'editor_format_h5'
                    }
                }
            },
            boldCommand: {
                title: lang.boldText,
                action: 'applyBold'
            },
            italicCommand: {
                title: lang.italicText,
                action: 'applyItalic'
            },
            deletedCommand: {
                title: lang.deletedText,
                action: 'applyStrikethrough'
            },
            underlineCommand: {
                title: lang.underlineText,
                action: 'applyUnderline'
            },
            unorderedListCommand: {
                title: '&bull; ' + lang.unorderedList,
                action: 'insertUnorderedList'
            },
            orderedListCommand: {
                title: '1. ' + lang.orderedList,
                action: 'insertOrderedList'
            },
            outdentCommand: {
                title: '< ' + lang.decreaseIndent,
                action: 'decreaseContentIndent'
            },
            indentCommand: {
                title: '> ' + lang.increaseIndent,
                action: 'increaseContentIndent'
            },
            imageCommand: {
                title: lang.insertImage,
                action: 'displayImageManager'
            },
            videoCommand: {
                title: lang.insertVideo,
                action: 'displayVideoEmbedder'
            },
            fileCommand: {
                title: lang.insertFile,
                action: 'displayFileManager'
            }
            // ... (other toolbar commands would follow the same pattern)
        };
    }
}

// --- Global Entry Point for Editor Management ---
// Replaces the jQuery plugin interface $.fn.redactor
function attachRichContentProcessor(targetSelector, configurationOrMethodName, ...methodArguments) {
    const selectedElements = Array.from(
        typeof targetSelector === 'string' ? document.querySelectorAll(targetSelector) :
        targetSelector instanceof HTMLElement ? [targetSelector] :
        targetSelector // Assume it's an iterable of elements (like NodeList or Array)
    );

    const collectedReturnValues = [];

    if (typeof configurationOrMethodName === 'string') {
        // This branch handles method calls on existing editor instances
        selectedElements.forEach(element => {
            const composerInstance = composerInstanceRegistry.get(element);
            if (composerInstance && typeof composerInstance[configurationOrMethodName] === 'function') {
                const methodResult = composerInstance[configurationOrMethodName](...methodArguments);
                if (methodResult !== undefined && methodResult !== composerInstance) {
                    collectedReturnValues.push(methodResult);
                }
            } else {
                // Mimic jQuery's error handling for non-existent methods
                console.error(`Editor Error: No such method "${configurationOrMethodName}" for ContentComposer instance on element`, element);
            }
        });
    } else {
        // This branch handles initialization of new editor instances
        selectedElements.forEach(element => {
            if (!composerInstanceRegistry.has(element)) {
                const newComposer = new ContentComposer(element, configurationOrMethodName);
                composerInstanceRegistry.set(element, newComposer);
            }
        });
    }

    // Mimic the return value logic of the original jQuery plugin
    if (collectedReturnValues.length === 0) {
        return selectedElements; // Return the original collection for chaining
    } else if (collectedReturnValues.length === 1) {
        return collectedReturnValues[0];
    } else {
        return collectedReturnValues;
    }
}