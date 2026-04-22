let objectIdentifier = 0;

class IntervalMarker {
    constructor(segmentBoundary) {
        this.beginningPosition = segmentBoundary.startOffset;
        this.endingPosition = segmentBoundary.endOffset;
        this.sourceSegment = segmentBoundary;
    }

    isCollapsed() {
        return this.beginningPosition === this.endingPosition;
    }
}

class ContentEditor {
    static defaultConfiguration = {
        enableRangeUtility: false,
        renderInIframe: false,
        manageFullPage: false,
        externalStylesheet: false,

        localeCode: 'en',
        textDirection: 'ltr',

        elementPlaceholder: false,

        wysiwygEnabled: false,
        responsiveDesign: true,
        automaticCleanup: true,
        prettyHtmlOutput: true,
        forcePlainTextPaste: false,
        removeEmptyStructuralTags: true,
        dynamicTemplateVariables: false,
        outputXhtml: false,

        initialVisualMode: true,
        focusOnLoad: false,
        tabIndexAttribute: false,
        autoAdjustHeight: true,
        minimumContentHeight: false,
        keyboardShortcuts: true,

        autoSaveFunctionality: false,
        autoSaveFrequency: 60,

        activePlugins: false,

        allowInternalAnchors: true,
        allowEmailAddresses: true,
        defaultLinkPrefix: 'http://',
        setNoFollow: false,
        linkTextCharacterLimit: 50,

        imageSpacingStyle: '10px',
        imageGalleryEndpoint: false,

        imageUploadDestination: false,
        imageUploadKey: 'file',
        fileUploadDestination: false,
        fileUploadKey: 'file',
        enableClipboardUpload: true,
        clipboardUploadTarget: false,
        enableDragDropUpload: true,

        acceptableImageFormats: ['image/png', 'image/jpeg', 'image/gif'],

        s3CloudIntegration: false,
        extraUploadFields: false,

        monitorImages: true,
        monitorLinks: true,

        showModalOverlay: true,

        tabToSpaceConversion: false,
        tabKeyNavigation: true,

        floatingToolbarMode: false,
        floatingToolbarButtons: ['formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent'],

        displayToolbar: true,
        fixedToolbarPosition: false,
        fixedToolbarAnchor: document,
        fixedToolbarOffset: 0,
        fixedToolbarContainerElement: false,
        alternateToolbarContainer: false,
        showHtmlSourceButton: true,

        toolbarButtonSeparator: '<li class="content_separator"></li>',

        customToolbarButtons: {},
        additionalToolbarButtons: [],
        mainToolbarButtons: ['html', '|', 'formatting', '|', 'bold', 'italic', 'deleted', '|', 'unorderedlist', 'orderedlist', 'outdent', 'indent', '|', 'image', 'video', 'file', 'table', 'link', '|', 'alignment', '|', 'horizontalrule'],

        activeStyleIndicators: ['deleted', 'italic', 'bold', 'underline', 'unorderedlist', 'orderedlist', 'alignleft', 'aligncenter', 'alignright', 'justify', 'table'],
        activeStyleTagMap: {
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
        extraActiveStyleMappings: false,

        blockFormattingTags: ['p', 'blockquote', 'pre', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],

        useLineBreakElements: false,
        useParagraphElements: true,
        convertDivsToParagraphs: true,
        autoConvertLinks: true,
        autoConvertImageLinks: false,
        autoConvertVideoLinks: false,
        formatPreBlocks: false,
        allowPhpCode: false,

        allowedHtmlTags: false,
        forbiddenHtmlTags: ['html', 'head', 'link', 'body', 'meta', 'script', 'style', 'applet'],

        boldHtmlTag: 'strong',
        italicHtmlTag: 'em',

        indentSizePixels: 20,
        undoHistory: [],
        redoHistory: [],
        isSourceCodeMode: false,
        defaultEmptyContent: '<p>&#x200b;</p>',
        zeroWidthSpace: '&#x200b;',
        blockTagTest: /^(P|H[1-6]|LI|ADDRESS|SECTION|HEADER|FOOTER|ASIDE|ARTICLE)$/i,
        alignableBlockTags: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'TD',
            'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'ADDRESS', 'SECTION',
            'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE'
        ],
        selfClosingHtmlTags: ['area', 'body', 'head', 'hr', 'i?frame', 'link', 'meta', 'noscript', 'style', 'script', 'table', 'tbody', 'thead', 'tfoot'],
        nestedSelfClosingHtmlTags: ['li', 'dt', 'dt', 'h[1-6]', 'option', 'script'],
        newBlockLevelHtmlTags: ['blockquote', 'div', 'dl', 'fieldset', 'form', 'frameset', 'map', 'ol', 'p', 'pre', 'select', 'td', 'th', 'tr', 'ul'],
        allRecognizedBlockElements: ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DD', 'DL', 'DT', 'DIV', 'LI',
            'BLOCKQUOTE', 'OUTPUT', 'FIGCAPTION', 'PRE', 'ADDRESS', 'SECTION',
            'HEADER', 'FOOTER', 'ASIDE', 'ARTICLE', 'TD'
        ],

        languageContent: {
            en: {
                markup: 'HTML',
                insertVideo: 'Embed Video',
                insertImage: 'Add Image',
                contentTable: 'Table',
                hyperlink: 'Link',
                insertLink: 'Insert Link',
                modifyLink: 'Edit Link',
                removeLink: 'Remove Link',
                styling: 'Formatting',
                normalText: 'Normal Paragraph',
                quotation: 'Block Quote',
                codeBlock: 'Code Block',
                heading1: 'Heading Level 1',
                heading2: 'Heading Level 2',
                heading3: 'Heading Level 3',
                heading4: 'Heading Level 4',
                heading5: 'Heading Level 5',
                boldText: 'Bold',
                italicText: 'Italic',
                fontColor: 'Text Color',
                backgroundColor: 'Background Color',
                bulletList: 'Unordered List',
                numberList: 'Ordered List',
                decreaseIndent: 'Outdent',
                increaseIndent: 'Indent',
                cancelAction: 'Cancel',
                insertAction: 'Insert',
                saveAction: 'Save',
                deleteAction: 'Delete',
                addTable: 'Add New Table',
                addRowAbove: 'Insert Row Above',
                addRowBelow: 'Insert Row Below',
                addColumnLeft: 'Insert Column Left',
                addColumnRight: 'Insert Column Right',
                deleteColumn: 'Delete Column',
                deleteRow: 'Delete Row',
                deleteTable: 'Delete Table',
                tableRows: 'Rows',
                tableColumns: 'Columns',
                addTableHeader: 'Add Header',
                deleteTableHeader: 'Delete Header',
                itemTitle: 'Title',
                imageAlignment: 'Position',
                alignNone: 'None',
                alignLeft: 'Left',
                alignRight: 'Right',
                imageWebLink: 'Image URL',
                textValue: 'Text',
                emailAddress: 'Email',
                webAddress: 'Web Address',
                videoEmbedCode: 'Video Embed Code',
                attachFile: 'Insert File',
                uploadFile: 'Upload',
                downloadFile: 'Download',
                selectFile: 'Select',
                orSelect: 'Or select',
                dragFileHere: 'Drag file here',
                alignTextLeft: 'Align text left',
                alignTextCenter: 'Center text',
                alignTextRight: 'Align text right',
                alignTextJustify: 'Justify text',
                insertHorizontalRule: 'Insert Horizontal Rule',
                strikeThrough: 'Strikethrough',
                bookmarkAnchor: 'Bookmark',
                openLinkInNewTab: 'Open link in new tab',
                underlineText: 'Underline',
                textAlignment: 'Alignment',
                fileNameOptional: 'File Name (optional)',
                editContent: 'Edit'
            }
        }
    };

    keyMappings = {
        BACKSPACE_KEY: 8,
        DELETE_KEY: 46,
        ARROW_DOWN_KEY: 40,
        ENTER_KEY: 13,
        ESCAPE_KEY: 27,
        TAB_KEY: 9,
        CONTROL_KEY: 17,
        META_KEY: 91,
        ARROW_LEFT_KEY: 37,
        LEFT_WINDOW_KEY: 91
    };

    constructor(targetDomElement, customOptions) {
        this.richTextEditorPaste = false;
        this.boundElement = targetDomElement;
        this.sourceMarkupElement = targetDomElement;
        this.instanceIdentifier = objectIdentifier++;

        this.currentSettings = this._performDeepMerge(
            ContentEditor.defaultConfiguration, {
                ...this.sourceMarkupElement.dataset
            },
            customOptions
        );

        this.isInitialized = false;
        this.openDropdownMenus = [];

        this.initialHeight = this.sourceMarkupElement.style.height;
        this.initialWidth = this.sourceMarkupElement.style.width;

        if (this.currentSettings.manageFullPage) this.currentSettings.renderInIframe = true;
        if (this.currentSettings.useLineBreakElements) this.currentSettings.useParagraphElements = false;
        if (this.currentSettings.useParagraphElements) this.currentSettings.useLineBreakElements = false;
        if (this.currentSettings.fixedToolbarContainerElement) this.currentSettings.fixedToolbarPosition = true;

        this.workingDocument = document;
        this.workingWindow = window;

        this.persistedSelection = false;

        this.lineStartRegex = new RegExp('^<(/?' + this.currentSettings.selfClosingHtmlTags.join('|/?') + '|' + this.currentSettings.nestedSelfClosingHtmlTags.join('|') + ')[ >]');
        this.lineEndRegex = new RegExp('^<(br|/?' + this.currentSettings.selfClosingHtmlTags.join('|/?') + '|/' + this.currentSettings.nestedSelfClosingHtmlTags.join('|/') + ')[ >]');
        this.newBlockRegex = new RegExp('^</?(' + this.currentSettings.newBlockLevelHtmlTags.join('|') + ')[ >]');

        this.isBlockElementRegex = new RegExp('^(' + this.currentSettings.allRecognizedBlockElements.join('|') + ')$', 'i');

        if (!this.currentSettings.useLineBreakElements) {
            if (this.currentSettings.allowedHtmlTags !== false && !this.currentSettings.allowedHtmlTags.includes('p')) {
                this.currentSettings.allowedHtmlTags.push('p');
            }

            if (this.currentSettings.forbiddenHtmlTags !== false) {
                const paragraphTagIndex = this.currentSettings.forbiddenHtmlTags.indexOf('p');
                if (paragraphTagIndex !== -1) {
                    this.currentSettings.forbiddenHtmlTags.splice(paragraphTagIndex, 1);
                }
            }
        }

        this.currentLanguageStrings = this.currentSettings.languageContent[this.currentSettings.localeCode];

        this.kickoffConstruction();
    }

    _performDeepMerge(...sources) {
        const isPlainObject = obj => obj && typeof obj === 'object' && !Array.isArray(obj) && obj.constructor === Object;
        return sources.reduce((accumulator, current) => {
            Object.keys(current).forEach(key => {
                if (isPlainObject(accumulator[key]) && isPlainObject(current[key])) {
                    accumulator[key] = this._performDeepMerge(accumulator[key], current[key]);
                } else if (Array.isArray(accumulator[key]) && Array.isArray(current[key])) {
                    accumulator[key] = [...current[key]];
                } else {
                    accumulator[key] = current[key];
                }
            });
            return accumulator;
        }, {});
    }

    kickoffConstruction() {
        // Placeholder for the actual editor construction logic
    }

    getToolbarLayout(localizedStrings) {
        return {
            sourceCodeToggle: {
                displayLabel: localizedStrings.markup,
                executionMethod: 'toggleSourceEditor'
            },
            formattingOptions: {
                displayLabel: localizedStrings.styling,
                executionMethod: 'showSubMenu',
                subMenuItems: {
                    paragraphBlock: {
                        displayLabel: localizedStrings.normalText,
                        executionMethod: 'applyParagraphStyle'
                    },
                    blockquoteElement: {
                        displayLabel: localizedStrings.quotation,
                        executionMethod: 'applyQuoteFormatting',
                        cssClassIdentifier: 'content_editor_quote_style'
                    },
                    preformattedCode: {
                        displayLabel: localizedStrings.codeBlock,
                        executionMethod: 'applyPreformattedStyle',
                        cssClassIdentifier: 'content_editor_code_style'
                    },
                    headingLevel1: {
                        displayLabel: localizedStrings.heading1,
                        executionMethod: 'applyHeadingStyle',
                        cssClassIdentifier: 'content_editor_h1_style'
                    },
                    headingLevel2: {
                        displayLabel: localizedStrings.heading2,
                        executionMethod: 'applyHeadingStyle',
                        cssClassIdentifier: 'content_editor_h2_style'
                    },
                    headingLevel3: {
                        displayLabel: localizedStrings.heading3,
                        executionMethod: 'applyHeadingStyle',
                        cssClassIdentifier: 'content_editor_h3_style'
                    },
                    headingLevel4: {
                        displayLabel: localizedStrings.heading4,
                        executionMethod: 'applyHeadingStyle',
                        cssClassIdentifier: 'content_editor_h4_style'
                    },
                    headingLevel5: {
                        displayLabel: localizedStrings.heading5,
                        executionMethod: 'applyHeadingStyle',
                        cssClassIdentifier: 'content_editor_h5_style'
                    }
                }
            },
            boldTextCommand: {
                displayLabel: localizedStrings.boldText,
                browserCommand: 'bold'
            },
            italicTextCommand: {
                displayLabel: localizedStrings.italicText,
                browserCommand: 'italic'
            },
strikethroughCommand: {
                displayLabel: localizedStrings.strikeThrough,
                browserCommand: 'strikethrough'
            },
            underlineTextCommand: {
                displayLabel: localizedStrings.underlineText,
                browserCommand: 'underline'
            },
            unorderedListCommand: {
                displayLabel: '• ' + localizedStrings.bulletList,
                browserCommand: 'insertunorderedlist'
            },
            orderedListCommand: {
                displayLabel: '1. ' + localizedStrings.numberList,
                browserCommand: 'insertorderedlist'
            },
            decreaseIndentCommand: {
                displayLabel: '< ' + localizedStrings.decreaseIndent,
                executionMethod: 'decreaseBlockIndent'
            },
            increaseIndentCommand: {
                displayLabel: '> ' + localizedStrings.increaseIndent,
                executionMethod: 'increaseBlockIndent'
            },
            insertImageButton: {
                displayLabel: localizedStrings.insertImage,
                executionMethod: 'showImageUploader'
            },
            insertVideoButton: {
                displayLabel: localizedStrings.insertVideo,
                executionMethod: 'showVideoEmbedder'
            },
            insertFileButton: {
                displayLabel: localizedStrings.attachFile,
                executionMethod: 'showFileUploader'
            },
            tableManagement: {
                displayLabel: localizedStrings.contentTable,
                executionMethod: 'showSubMenu',
                subMenuItems: {
                    createTable: {
                        displayLabel: localizedStrings.addTable,
                        executionMethod: 'showCreateTableDialog'
                    }
                }
            }
        };
    }

    getEditorContent() {
        return this.boundElement.value || this.boundElement.innerHTML;
    }

    setEditorContent(newContent) {
        if (this.boundElement.tagName === 'TEXTAREA') {
            this.boundElement.value = newContent;
        } else {
            this.boundElement.innerHTML = newContent;
        }
    }

    toggleSourceEditor() {
        this.isSourceCodeMode = !this.isSourceCodeMode;
        return this.isSourceCodeMode;
    }
}

const activeContentEditorInstances = new WeakMap();

function ManageContentEditor(targetElements, commandOrOptions, ...commandArguments) {
    let collectedResults = [];

    const elementsToProcess = (targetElements instanceof NodeList || Array.isArray(targetElements)) ? targetElements : [targetElements];

    for (const currentTargetElement of elementsToProcess) {
        if (typeof commandOrOptions === 'string') {
            const editorInstance = activeContentEditorInstances.get(currentTargetElement);
            if (editorInstance === undefined) {
                console.error(`ContentEditor: No instance found for element '${currentTargetElement.id || currentTargetElement.tagName}'. Cannot execute command '${commandOrOptions}'.`);
                continue;
            }

            const requestedCommand = commandOrOptions;
            if (typeof editorInstance[requestedCommand] === 'function') {
                const commandReturnValue = editorInstance[requestedCommand](...commandArguments);
                if (commandReturnValue !== undefined && commandReturnValue !== editorInstance) {
                    collectedResults.push(commandReturnValue);
                }
            } else {
                console.error(`ContentEditor: Command "${requestedCommand}" is not a valid method for instance on element '${currentTargetElement.id || currentTargetElement.tagName}'.`);
            }
        } else {
            if (!activeContentEditorInstances.has(currentTargetElement)) {
                const newEditorInstance = new ContentEditor(currentTargetElement, commandOrOptions);
                activeContentEditorInstances.set(currentTargetElement, newEditorInstance);
            }
        }
    }

    if (collectedResults.length === 0) {
        return targetElements;
    } else if (collectedResults.length === 1) {
        return collectedResults[0];
    } else {
        return collectedResults;
    }
}