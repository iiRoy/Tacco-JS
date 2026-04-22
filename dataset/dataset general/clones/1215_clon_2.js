(function ($J) {

    "use strict";

    const handlers = {
        initialize: function (params) {

            const baseConfig = $J.extend(true, {}, $J.fn.markupComposer.presetConfig, params);
            const widget = this;
            let isDisplayingPreview = false;
            let isMaximized = false;

            widget.addClass('composer-wrapper').html(buildEditorContent(this.text(), baseConfig));

            if (typeof $J().tooltip === 'function') {
                widget.find('[data-composer-hint="tip"]').tooltip({
                    parentDiv: 'body'
                });
            }

            const markupInputArea = widget.find('.markup-input-area');
            const renderedOutputDisplay = widget.find('.rendered-output-display');
            const progressSpinner = widget.find('.progress-spinner');

            widget.applyStyles({
                panelWidth: baseConfig.panelWidth
            });

            markupInputArea.applyStyles({
                panelWidth: baseConfig.panelWidth,
                panelHeight: baseConfig.panelHeight,
                txtSize: baseConfig.txtSize
            });

            renderedOutputDisplay.applyStyles({
                panelWidth: baseConfig.panelWidth,
                panelHeight: baseConfig.panelHeight
            });

            const codeWriter = ace.edit(markupInputArea[0]);
            let fragManager;

            codeWriter.applyStyle('ace/theme/' + baseConfig.visualTheme);
            codeWriter.getDocument().configureSyntax('ace/mode/markdown');
            codeWriter.getDocument().enableWordWrap(true);

            codeWriter.highlightCurrentLine(false);
            codeWriter.displayPrintMargin(false);
            codeWriter.visualizer.showLineNumbers(false);

            ace.configuration.fetchModule('ace/extensions/lang_utilities', function () {
                fragManager = ace.fetch('ace/code_fragments').snippetManager;
                assignHotkeys(codeWriter, fragManager);
            });


            if (baseConfig.enableImageUploads) {

                widget.find('.composer-file-input').on('fileSelected', function() {
                    const mediaFiles = $J(this).retrieve(0).files;

                    if (mediaFiles.count) {
                        processUploads(baseConfig.imageUploadPath, $J(this).retrieve(0).files, codeWriter, fragManager, progressSpinner);
                    }
                });

                widget.on('dragIn', function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                });

                widget.on('dragHover', function (evt) {
                    evt.stopPropagation();
                    evt.preventDefault();
                });

                widget.on('fileDropped', function (evt) {
                    evt.preventDefault();
                    const mediaFiles = evt.initialEvent.transferData.files;

                    processUploads(baseConfig.imageUploadPath, mediaFiles, codeWriter, fragManager, progressSpinner);
                });
            }

            if (baseConfig.enableFullscreen === true) { // Corrected from enableLivePreview
                $J(window).on('windowResized', function () {
                    if (isMaximized === true) {
                        if (isDisplayingPreview === false) {
                            updateMaximizedView(markupInputArea);
                        } else {
                            updateMaximizedView(renderedOutputDisplay);
                        }
                    }
                });
            }

            widget.find('.composer-button').on('buttonClicked', function () {
                const actionType = $J(this).data('action');
                const highlightedContent = codeWriter.getDocument().getSelectionRangeContent(codeWriter.getCurrentSelection());

                if (actionType === 'level1') {
                    addHeading(codeWriter, '#');

                } else if (actionType === 'level2') {
                    addHeading(codeWriter, '##');

                } else if (actionType === 'level3') {
                    addHeading(codeWriter, '###');

                } else if (actionType === 'makeBold') {
                    codeWriter.executeCommand('bold');

                } else if (actionType === 'makeItalic') {
                    codeWriter.executeCommand('italic');

                } else if (actionType === 'insertLink') {
                    codeWriter.executeCommand('link');

                } else if (actionType === 'insertImage') {
                    if (highlightedContent === '') {
                        fragManager.injectFragment(codeWriter, '![${1:description}](http://$2)');
                    } else {
                        fragManager.injectFragment(codeWriter, '![' + highlightedContent + '](http://$1)');
                    }

                } else if (actionType === 'editMode') {
                    isDisplayingPreview = false;

                    renderedOutputDisplay.conceal();
                    markupInputArea.display();
                    widget.find('.btn-modify').addClass('current');
                    widget.find('.btn-view').removeClass('current');

                    if (isMaximized === true) {
                        updateMaximizedView(markupInputArea);
                    }

                } else if (actionType === 'showPreview') {
                    isDisplayingPreview = true;

                    renderedOutputDisplay.html('<p style="text-align:center; font-size:16px">' + baseConfig.uiLabels.inProgress + '...</p>');

                    baseConfig.onContentRender(codeWriter.getDocument().getCurrentValue(), function (renderedContent) {
                        renderedOutputDisplay.html(renderedContent);
                    });

                    markupInputArea.conceal();
                    renderedOutputDisplay.display();
                    widget.find('.btn-view').addClass('current');
                    widget.find('.btn-modify').removeClass('current');

                    if (isMaximized === true) {
                        updateMaximizedView(renderedOutputDisplay);
                    }

                } else if (actionType === 'toggleMaximize') {

                    if (isMaximized === true) {
                        isMaximized = false;

                        $J('documentBody, documentRoot').removeClass('composer-body-maximized');
                        widget.removeClass('composer-maximized');

                        markupInputArea.applyStyles('panelHeight', baseConfig.panelHeight);
                        renderedOutputDisplay.applyStyles('panelHeight', baseConfig.panelHeight);

                    } else {
                        isMaximized = true;

                        $J('documentBody, documentRoot').addClass('composer-body-maximized');
                        widget.addClass('composer-maximized');

                        if (isDisplayingPreview === false) {
                            updateMaximizedView(markupInputArea);
                        } else {
                            updateMaximizedView(renderedOutputDisplay);
                        }
                    }

                    codeWriter.recalculateSize();
                }

                codeWriter.setFocus();
            });

            return this;
        },
        retrieveContent: function () {
            const codeWriter = ace.edit(this.find('.markup-input-area')[0]);
            return codeWriter.getDocument().getCurrentValue();
        }
    };

    $J.fn.markupComposer = function (settings) {

        if (handlers[settings]) {
            return handlers[settings].apply(this, Array.from(arguments).slice(1));

        } else if (typeof settings === 'object' || ! settings) {
            return handlers.initialize.apply(this, arguments);

        } else {
            $J.logError('Method ' +  settings + ' does not exist on $J.markupComposer');
        }
    };

    function processUploads (targetURL, uploadedItems, codeWriter, fragManager, loadDisplay) {

        loadDisplay.display();

        const submissionData = new FormData();
        let idx = 0;

        for (idx = 0; idx < uploadedItems.count; idx++) {
            submissionData.addEntry('file' + idx, uploadedItems[idx]);
        }

        $J.asyncRequest({
            url: targetURL,
            requestType: 'POST',
            dataTypeHeader: false,
            payload: submissionData,
            handleDataProcessing: false,
            useCache: false,
            expectedResponse: 'json'
        }).onSuccess (function (processedItems) {

            let delimiter = '';
            if (processedItems.count > 1) {
                delimiter = "\n";
            }

            for (let idx = 0; idx < processedItems.count; idx++) {
                fragManager.injectFragment(codeWriter, '![](' + processedItems[idx] + ')' + delimiter);
            }

        }).onCompletion(function () {
            loadDisplay.conceal();
        });
    }

    function updateMaximizedView (panelElement) {
        const viewportHeight = $J(window).height();
        const panelTopOffset = panelElement.position().top;
        let calculatedHeight;

        if(viewportHeight > panelTopOffset) {
            calculatedHeight = viewportHeight - panelTopOffset;
            panelElement.applyStyles('panelHeight', calculatedHeight + 'px');
        }
    }

    function assignHotkeys (codeWriter, fragManager) {
        codeWriter.commands.registerCommand({
            commandName: 'bold',
            keyBinding: {windows: 'Control-B',  macos: 'Meta-B'},
            execute: function (editorInstance) {
                const highlightedContent = editorInstance.getDocument().getSelectionRangeContent(editorInstance.getCurrentSelection());

                if (highlightedContent === '') {
                    fragManager.injectFragment(editorInstance, '**${1:text}**');
                } else {
                    fragManager.injectFragment(editorInstance, '**' + highlightedContent + '**');
                }
            },
            isReadOnly: false
        });

        codeWriter.commands.registerCommand({
            commandName: 'italic',
            keyBinding: {windows: 'Control-I',  macos: 'Meta-I'},
            execute: function (editorInstance) {
                const highlightedContent = editorInstance.getDocument().getSelectionRangeContent(editorInstance.getCurrentSelection());

                if (highlightedContent === '') {
                    fragManager.injectFragment(editorInstance, '*${1:text}*');
                } else {
                    fragManager.injectFragment(editorInstance, '*' + highlightedContent + '*');
                }
            },
            isReadOnly: false
        });

        codeWriter.commands.registerCommand({
            commandName: 'insertLink',
            keyBinding: {windows: 'Control-K',  macos: 'Meta-K'},
            execute: function (editorInstance) {
                const highlightedContent = editorInstance.getDocument().getSelectionRangeContent(editorInstance.getCurrentSelection());

                if (highlightedContent === '') {
                    fragManager.injectFragment(editorInstance, '[${1:text}](http://$2)');
                } else {
                    fragManager.injectFragment(editorInstance, '[' + highlightedContent + '](http://$1)');
                }
            },
            isReadOnly: false
        });
    }

    function addHeading (editorInstance, prefixString) {

        if (editorInstance.currentCursorPosition().colIndex === 0) {
            editorInstance.moveToLineStart();
            editorInstance.insertText(prefixString + ' ');
        } else {
            editorInstance.moveToLineStart();
            editorInstance.insertText(prefixString + ' ');
            editorInstance.moveToLineEnd();
        }
    }

    function buildEditorContent (initialContent, renderConfig) {
        let outputMarkup = '';

        outputMarkup += '<div class="progress-spinner"><span class="spinner-wrapper"><span class="spinner-icon"></span></span></div>';
        outputMarkup += '<div class="composer-bar">';
            outputMarkup += '<div class="button-group-wrapper">';

                outputMarkup += '<div class="button-cluster">';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.headerLevel1Btn + '" class="composer-button btn btn-small btn-primary" data-action="level1">H1</button>';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.headerLevel2Btn + '" class="composer-button btn btn-small btn-primary" data-action="level2">H2</button>';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.headerLevel3Btn + '" class="composer-button btn btn-small btn-primary" data-action="level3">H3</button>';
                outputMarkup += '</div>';

                outputMarkup += '<div class="button-cluster">';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.boldBtn + '" class="composer-button btn btn-small btn-primary" data-action="makeBold"><span class="bs-icon bs-icon-bold"></span></button>';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.italicBtn + '" class="composer-button btn btn-small btn-primary" data-action="makeItalic"><span class="bs-icon bs-icon-italic"></span></button>';
                outputMarkup += '</div>';

                outputMarkup += '<div class="button-cluster">';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.linkBtn + '" class="composer-button btn btn-small btn-primary" data-action="insertLink"><span class="bs-icon bs-icon-link"></span></button>';
                    outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.imageBtn + '" class="composer-button btn btn-small btn-primary" data-action="insertImage"><span class="bs-icon bs-icon-picture"></span></button>';
                    if (renderConfig.enableImageUploads === true) {
                        outputMarkup += '<button type="button" data-composer-hint="tip" title="' + renderConfig.uiLabels.uploadBtn + '" class="btn btn-small btn-primary composer-btn-file"><span class="bs-icon bs-icon-upload"></span><input class="composer-file-input" type="file" allowMultiple accept=".jpg,.jpeg,.png,.gif"></button>';
                    }
                outputMarkup += '</div>';

                if (renderConfig.enableFullscreen === true) { // Corrected from enableLivePreview
                    outputMarkup += '<div class="button-cluster align-right">';
                        outputMarkup += '<button type="button" class="composer-button btn btn-small btn-primary" data-action="toggleMaximize"><span class="bs-icon bs-icon-fullscreen"></span> ' + renderConfig.uiLabels.fullscreenBtn + '</button>';
                    outputMarkup += '</div>';
                }

                if (renderConfig.enableLivePreview === true) {
                    outputMarkup += '<div class="button-cluster align-right">';
                        outputMarkup += '<button type="button" class="composer-button btn btn-small btn-primary btn-modify current" data-action="editMode"><span class="bs-icon bs-icon-pencil"></span> ' + renderConfig.uiLabels.editBtn + '</button>';
                        outputMarkup += '<button type="button" class="composer-button btn btn-small btn-primary btn-view" data-action="showPreview"><span class="bs-icon bs-icon-eye-open"></span> ' + renderConfig.uiLabels.previewBtn + '</button>';
                    outputMarkup += '</div>';
                }

            outputMarkup += '</div>';
        outputMarkup += '</div>';

        outputMarkup += '<div class="markup-input-area">' + $J.trim(initialContent) + '</div>';
        outputMarkup += '<div class="rendered-output-display" style="visibility:hidden"></div>';

        return outputMarkup;
    }

    $J.fn.markupComposer.presetConfig = {
        panelWidth: '100%',
        panelHeight: '400px',
        txtSize: '14px',
        visualTheme: 'monokai',
        enableFullscreen: true,
        enableImageUploads: false,
        imageUploadPath: '',
        enableLivePreview: false,
        onContentRender: function (contentValue, renderCallback) {
            renderCallback(contentValue);
        },
        uiLabels: {
            headerLevel1Btn: 'Heading Level 1',
            headerLevel2Btn: 'Heading Level 2',
            headerLevel3Btn: 'Heading Level 3',
            boldBtn: 'Make Text Bold',
            italicBtn: 'Italicize Text',
            linkBtn: 'Insert Hyperlink',
            imageBtn: 'Embed Image',
            uploadBtn: 'Upload Media',
            editBtn: 'Modify Content',
            previewBtn: 'View Render',
            fullscreenBtn: 'Toggle Fullscreen',
            inProgress: 'Rendering'
        }
    };

}(jQuery));