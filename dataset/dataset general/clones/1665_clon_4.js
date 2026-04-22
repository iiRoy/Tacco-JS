var GLOBAL_TOOL_SETTINGS = {};

function combineOptionsDeep(target, source) {
    target = target || {};
    source = source || {};
    for (var key in source) {
        if (source.hasOwnProperty(key)) {
            if (typeof source[key] === 'object' && source[key] !== null && !Array.isArray(source[key]) && typeof target[key] === 'object' && target[key] !== null && !Array.isArray(target[key])) {
                target[key] = combineOptionsDeep(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        }
    }
    return target;
}

var ScriptLoader = function() {
    var scriptQueue = [];
    var busy = false;

    var processNext = function() {
        if (scriptQueue.length === 0 || busy) {
            return;
        }

        busy = true;
        var currentItem = scriptQueue.shift();
        var resource = currentItem.resource;
        var completionCallback = currentItem.callback;

        if (typeof resource === 'function') {
            resource.call(null);
            busy = false;
            processNext();
            return;
        }

        var headElement = document.getElementsByTagName("head")[0];
        var scriptElement = document.createElement("script");
        scriptElement.src = resource;

        var loadedFlag = false;
        scriptElement.onload = scriptElement.onreadystatechange = function() {
            if (!loadedFlag && (!this.readyState || this.readyState === "loaded" || this.readyState === "complete")) {
                loadedFlag = true;
                if (typeof completionCallback === 'function') {
                    completionCallback();
                }
                scriptElement.onload = scriptElement.onreadystatechange = null;
                busy = false;
                processNext();
            }
        };
        headElement.appendChild(scriptElement);
    };

    this.enqueueScript = function(url, callback) {
        scriptQueue.push({ resource: url, callback: callback });
        if (!busy) {
            processNext();
        }
    };

    this.enqueueSequence = function(resourceArray) {
        if (!Array.isArray(resourceArray) || resourceArray.length === 0) {
            return;
        }
        var self = this;
        var recursiveSequencer = function(arr) {
            if (arr.length === 0) {
                return;
            }
            var currentResource = arr.shift();
            if (typeof currentResource === 'function') {
                currentResource.call(null);
                recursiveSequencer(arr);
            } else {
                self.enqueueScript(currentResource, function() {
                    recursiveSequencer(arr);
                });
            }
        };
        recursiveSequencer(resourceArray.slice());
    };
};

var currentBrowserInfo = (function() {
    var agentString = navigator.userAgent.toLowerCase();
    return {
        isGecko: /firefox/.test(agentString),
        isTrident: /(msie|trident)/.test(agentString) && !/opera/.test(agentString),
        isWebkit: /webkit/.test(agentString) && !/edge/.test(agentString)
    };
})();

var SelectionManager = function(documentContext) {
    var doc = documentContext;

    function getNativeSelection() {
        if (doc.getSelection) {
            return doc.getSelection();
        } else if (doc.selection && doc.selection.type !== 'Control') {
            return doc.selection;
        }
        return null;
    }

    function getNativeRange() {
        var sel = getNativeSelection();
        if (sel && sel.rangeCount > 0) {
            return sel.getRangeAt(0);
        } else if (sel && sel.createRange) {
            return sel.createRange();
        }
        return null;
    }

    this.positionCaret = function(node, atStart) {
        var range = doc.createRange();
        var sel = getNativeSelection();

        if (node.nodeType === 3) {
            range.setStart(node, atStart ? 0 : node.length);
            range.collapse(true);
        } else {
            range.selectNodeContents(node);
            range.collapse(atStart);
        }

        sel.removeAllRanges();
        sel.addRange(range);
    };
    
    this.insertDomNodeAtCaret = function(node) {
        var range = getNativeRange();
        if (range) {
            range.deleteContents();
            range.insertNode(node);
            this.positionCaret(node, false);
        } else {
            var active = doc.activeElement;
            if (active && active.isContentEditable) {
                active.appendChild(node);
                this.positionCaret(node, false);
            } else {
                doc.body.appendChild(node);
                this.positionCaret(node, false);
            }
        }
    };

    this.getCommonAncestorNode = function() {
        var range = getNativeRange();
        if (range) {
            var node = range.commonAncestorContainer;
            return (node.nodeType === 1) ? node : node.parentNode;
        }
        return doc.body;
    };

    this.setSelectionFocus = function(node) {
        this.positionCaret(node, false);
    };
};

var createContentEditor = function(initialElement, customOptions) {
    var editorInstance = {
        domElements: {},
        configuration: {},
        iframeDocument: null,
        selectionUtility: null,
        isToolbarFixed: false,
        cachedHeight: '',
        cachedWidth: '',
        colorOptions: Array(
            '#ffffff', '#000000', '#eeece1', '#1f497d', '#4f81bd', '#c0504d', '#9bbb59', '#8064a2', '#4bacc6', '#f79646', '#ffff00',
            '#f2f2f2', '#7f7f7f', '#ddd9c3', '#c6d9f0', '#dbe5f1', '#f2dcdb', '#ebf1dd', '#e5e0ec', '#dbeef3', '#fdeada', '#fff2ca',
            '#d8d8d8', '#595959', '#c4bd97', '#8db3e2', '#b8cce4', '#e5b9b7', '#d7e3bc', '#ccc1d9', '#b7dde8', '#fac08f', '#ffe694',
            '#bfbfbf', '#3f3f3f', '#938953', '#548dd4', '#95b3d7', '#d99694', '#c3d69b', '#b2a2c7', '#b7dde8', '#fac08f', '#f2c314',
            '#a5a5a5', '#262626', '#494429', '#17365d', '#366092', '#953734', '#76923c', '#5f497a', '#92cddc', '#e36c09', '#c09100',
            '#7f7f7f', '#0c0c0c', '#1d1b10', '#0f243e', '#244061', '#632423', '#4f6128', '#3f3151', '#31859b', '#974806', '#7f6000'),
        defaultEmptyContent: '<p><br /></p>',
        geckoEmptyContent: '<p>&nbsp;</p>',
        activeDropdowns: []
    };

    editorInstance.domElements.sourceInput = $(initialElement);

    editorInstance.configuration = combineOptionsDeep({
        languageCode: 'en',
        toolbarName: 'default',
        deferredLoad: true,
        resourceBase: false,
        styleSheetName: 'style.css',
        initialFocus: true,
        allowResizing: true,
        autoAdjustHeight: false,
        stickyToolbar: false,
        autoParagraphs: true,
        cleanupPastedHtml: true,
        convertDivToParagraph: true,
        stripCssClasses: true,
        stripInlineStyles: false,
        autoLinkUrls: true,
        dataProcessorUrl: false,
        autoSaveUrl: false,
        saveFrequency: 60,
        imageGalleryJson: false,
        imageUploadUrl: false,
        fileLinkUploadUrl: false,
        generalFileUploadUrl: false,
        visualEditingMode: true,
        startMaximized: false,
        showModalOverlay: true
    }, customOptions);
    editorInstance.configuration = combineOptionsDeep(editorInstance.configuration, editorInstance.domElements.sourceInput.data());

    var editorMethods = {};

    editorMethods.resolveResourcePath = function() {
        if (editorInstance.configuration.resourceBase !== false) {
            return editorInstance.configuration.resourceBase;
        }

        var scriptTags = document.getElementsByTagName('script');
        for (var i = 0; i < scriptTags.length; i++) {
            var scriptSource = scriptTags[i].src;
            if (scriptSource) {
                var pathDetectionRegex = /\/(redactor|wysiwygforge)(\.min)?\.js(\?.*)?/;
                if (scriptSource.match(pathDetectionRegex)) {
                    editorInstance.configuration.resourceBase = scriptSource.replace(pathDetectionRegex, '');
                    return editorInstance.configuration.resourceBase;
                }
            }
        }
        return '';
    };

    editorMethods.constructEditorDom = function() {
        editorInstance.domElements.mainWrapper = $('<div>').addClass('wysiwyg_main_wrapper');
        editorInstance.domElements.contentIframe = $('<iframe>')
            .attr({ frameborder: '0', scrolling: 'auto' })
            .css({ height: editorInstance.cachedHeight })
            .addClass('wysiwyg_content_frame');

        editorInstance.domElements.sourceInput.css('width', '100%').hide();

        editorInstance.domElements.mainWrapper.insertAfter(editorInstance.domElements.sourceInput)
            .append(editorInstance.domElements.contentIframe)
            .append(editorInstance.domElements.sourceInput);
    };

    editorMethods.writeIframeContent = function(htmlString) {
        editorInstance.iframeDocument.open();
        editorInstance.iframeDocument.write(htmlString);
        editorInstance.iframeDocument.close();
    };

    editorMethods.getIframeDocument = function(iframeElement) {
        if (iframeElement.contentDocument) return iframeElement.contentDocument;
        if (iframeElement.contentWindow && iframeElement.contentWindow.document) return iframeElement.contentWindow.document;
        if (iframeElement.document) return iframeElement.document;
        return null;
    };

    editorMethods.buildIframeHtml = function(bodyHtml) {
        var frameContent = '<!DOCTYPE html>\n';
        frameContent += '<html><head><link media="all" type="text/css" href="' + editorInstance.configuration.resourceBase + '/css/' + editorInstance.configuration.styleSheetName + '" rel="stylesheet"></head>';
        frameContent += '<body><div id="editable_content_area" contenteditable="true">';
        frameContent += bodyHtml;
        frameContent += '</div></body></html>';
        return frameContent;
    };

    editorMethods.activateEditor = function(initialHtml) {
        editorInstance.iframeDocument = editorMethods.getIframeDocument(editorInstance.domElements.contentIframe.get(0));

        if (editorInstance.iframeDocument !== null) {
            editorMethods.writeIframeContent(editorMethods.buildIframeHtml(initialHtml));
            if (currentBrowserInfo.isGecko) {
                editorInstance.iframeDocument.execCommand("useCSS", false, true);
            }
            editorInstance.domElements.editableDiv = $(editorInstance.iframeDocument).find('#editable_content_area');
            editorInstance.selectionUtility = new SelectionManager(editorInstance.iframeDocument);
            return editorInstance.domElements.editableDiv;
        } else {
            return false;
        }
    };

    editorMethods.syncContentToSource = function() {
        var html = editorMethods.postFormatContent(editorInstance.domElements.editableDiv.html());
        editorInstance.domElements.sourceInput.val(html);
    };

    editorMethods.setEditorContent = function(htmlString) {
        htmlString = editorMethods.preFormatContent(htmlString);
        editorInstance.domElements.editableDiv.html(htmlString).focus();
        editorMethods.syncContentToSource();
    };

    editorMethods.getEditorContent = function() {
        var html = editorInstance.domElements.editableDiv ? editorInstance.domElements.editableDiv.html() : editorInstance.domElements.sourceInput.val();
        html = editorMethods.reFormatContent(html);
        return html;
    };

    editorMethods.insertHtmlSnippet = function(htmlSnippet) {
        editorMethods.executeEditorCommand('inserthtml', htmlSnippet);
    };

    editorMethods.destroyEditor = function() {
        var finalHtml = editorMethods.getEditorContent();
        editorInstance.domElements.mainWrapper.after(editorInstance.domElements.sourceInput);
        editorInstance.domElements.mainWrapper.remove();
        editorInstance.domElements.sourceInput.val(finalHtml).show();

        editorInstance.activeDropdowns.forEach(function(dd) {
            dd.remove();
        });
        editorInstance.activeDropdowns = [];
    };

    editorMethods.submitContentHandler = function() {
        if (!editorInstance.configuration.dataProcessorUrl) return;
        $.ajax({
            url: editorInstance.configuration.dataProcessorUrl,
            type: 'post',
            data: 'contentdata=' + escape(encodeURIComponent(editorMethods.getEditorContent())),
            success: function(data) {
                editorMethods.setEditorContent(data);
                editorMethods.syncContentToSource();
            }
        });
    };

    editorMethods.focusOnEditor = function() {
        editorInstance.domElements.editableDiv.focus();
    };

    editorMethods.executeEditorCommand = function(commandId, commandParameter) {
        if (editorInstance.configuration.visualEditingMode && editorInstance.iframeDocument) {
            try {
                if (currentBrowserInfo.isTrident) editorMethods.focusOnEditor();

                if (commandId === 'inserthtml' && currentBrowserInfo.isTrident) {
                    editorInstance.iframeDocument.selection.createRange().pasteHTML(commandParameter);
                } else if (commandId === 'formatblock' && currentBrowserInfo.isTrident) {
                    editorInstance.iframeDocument.execCommand(commandId, false, '<' + commandParameter + '>');
                } else {
                    editorInstance.iframeDocument.execCommand(commandId, false, commandParameter);
                }
                
                editorMethods.syncContentToSource();
                editorMethods.focusOnEditor();
            } catch (e) { /* Execution error */ }
        }
    };

    editorMethods.observeImageResizing = function() {
        if (currentBrowserInfo.isGecko) {
            editorInstance.iframeDocument.execCommand("enableObjectResizing", false, "false");
        }
        $(editorInstance.iframeDocument).find('img').attr('unselectable', 'on').each(function(i, img) {
            editorMethods.adjustImageDisplaySize(img);
        });
    };

    editorMethods.observeScrollForToolbar = function() {
        var currentScrollPosition = $(document).scrollTop();
        var wrapperOffsetTop = editorInstance.domElements.mainWrapper.offset().top;
    
        if (currentScrollPosition > wrapperOffsetTop) {
            if (!editorInstance.isToolbarFixed) {
                editorInstance.isToolbarFixed = true;
                editorInstance.domElements.toolbarElement.css({ position: 'fixed', width: '100%' });
            }
        } else {
            if (editorInstance.isToolbarFixed) {
                editorInstance.isToolbarFixed = false;
                editorInstance.domElements.toolbarElement.css({ position: 'relative', width: 'auto' });
            }
        }
    };

    editorMethods.setupAutoHeightObserver = function() {
        editorInstance.domElements.editableDiv.css({ 'min-height': editorInstance.domElements.sourceInput.height() + 'px' });
        editorInstance.domElements.contentIframe.css({ 'overflow-x': 'auto', 'overflow-y': 'hidden' });
        editorInstance.domElements.contentIframe.on('load', editorMethods.updateAutoIframeHeight);
        $(editorInstance.iframeDocument).on('keyup', editorMethods.updateAutoIframeHeight);
    };

    editorMethods.updateAutoIframeHeight = function() {
        editorInstance.domElements.contentIframe.height(editorInstance.domElements.editableDiv.outerHeight(true) + 30);
    };

    editorMethods.establishKeyboardShortcuts = function() {
        $(editorInstance.iframeDocument).on('keydown', function(e) {
            var keyVal = e.keyCode || e.which;

            if (e.ctrlKey) {
                if (keyVal === 90) {
                    editorMethods.triggerShortcutCommand(e, 'undo');
                    if (e.shiftKey) editorMethods.triggerShortcutCommand(e, 'redo');
                } else if (keyVal === 77) editorMethods.triggerShortcutCommand(e, 'removeFormat');
                else if (keyVal === 66) editorMethods.triggerShortcutCommand(e, 'bold');
                else if (keyVal === 73) editorMethods.triggerShortcutCommand(e, 'italic');
                else if (keyVal === 74) editorMethods.triggerShortcutCommand(e, 'insertunorderedlist');
                else if (keyVal === 75) editorMethods.triggerShortcutCommand(e, 'insertorderedlist');
                else if (keyVal === 76) editorMethods.triggerShortcutCommand(e, 'superscript');
            }

            if (!e.shiftKey && keyVal === 9) editorMethods.triggerShortcutCommand(e, 'indent');
            else if (e.shiftKey && keyVal === 9) editorMethods.triggerShortcutCommand(e, 'outdent');
        });
    };

    editorMethods.triggerShortcutCommand = function(eventObject, command) {
        if (eventObject.preventDefault) eventObject.preventDefault();
        editorMethods.executeEditorCommand(command, null);
    };

    editorMethods.handleParagraphOnNewline = function(eventObject) {
        var currentParent = editorInstance.selectionUtility.getCommonAncestorNode();
        if (currentParent.nodeName === 'DIV' && currentParent.id === 'editable_content_area') {
            if (eventObject.preventDefault) eventObject.preventDefault();
            
            var currentDomElement = $(editorInstance.selectionUtility.getCommonAncestorNode());
            if (currentDomElement.get(0).tagName === 'DIV' && (currentDomElement.html() === '' || currentDomElement.html() === '<br>')) {
                var newParagraphElement = $('<p>').append(currentDomElement.clone().get(0).childNodes);
                currentDomElement.replaceWith(newParagraphElement);
                newParagraphElement.html('<br />');
                editorInstance.selectionUtility.setSelectionFocus(newParagraphElement.get(0));
                editorMethods.syncContentToSource();
                return false;
            } else {
                editorMethods.syncContentToSource();
            }
        }
    };

    editorMethods.handleEmptyContent = function(eventObject) {
        var content = editorInstance.domElements.editableDiv.html().toLowerCase().trim();
        var defaultEmpty = editorInstance.defaultEmptyContent.toLowerCase().trim();
        var geckoEmpty = editorInstance.geckoEmptyContent.toLowerCase().trim();

        if (content === '' || content === '<br>' || content === defaultEmpty || content === geckoEmpty) {
            editorInstance.domElements.editableDiv.html(editorInstance.defaultEmptyContent);
            editorMethods.focusOnEditor();
            eventObject.preventDefault();
            return true;
        }
        return false;
    };

    editorMethods.preFormatContent = function(html) {
        return html;
    };

    editorMethods.autoParagraphText = function(html) {
        if (!html || html.trim() === '') {
            return editorInstance.defaultEmptyContent;
        }
        var lines = html.split(/\r?\n/).map(function(line) {
            line = line.trim();
            if (line === '') return '';
            return '<p>' + line + '</p>';
        }).join('');
        return lines || editorInstance.defaultEmptyContent;
    };

    editorMethods.postFormatContent = function(html) {
        return html;
    };

    editorMethods.reFormatContent = function(html) {
        return html;
    };

    editorMethods.buildToolbarUI = function() {
        editorInstance.domElements.toolbarElement = $('<div>').addClass('wysiwyg_toolbar_panel').insertBefore(editorInstance.domElements.contentIframe);
    };

    editorMethods.buildResizeHandle = function() {
        editorInstance.domElements.resizeHandle = $('<div>').addClass('wysiwyg_resize_handle').insertAfter(editorInstance.domElements.contentIframe);
    };

    editorMethods.adjustImageDisplaySize = function(imgElement) {
    };

    editorMethods.cleanPastedData = function() {
        var pasteMarker = $(editorInstance.iframeDocument).find('#pastemarkerend');
        if (pasteMarker.length) {
            pasteMarker.remove();
        }
        if (editorInstance.configuration.stripCssClasses) {
            editorInstance.domElements.editableDiv.find('*').removeAttr('class');
        }
        if (editorInstance.configuration.stripInlineStyles) {
            editorInstance.domElements.editableDiv.find('*').removeAttr('style');
        }
    };

    editorMethods.setupAutoSave = function() {
    };

    editorMethods.toggleFullscreen = function() {
        editorInstance.configuration.startMaximized = !editorInstance.configuration.startMaximized;
    };

    editorMethods.initializeEditorProcess = function() {
        editorMethods.resolveResourcePath();

        if (editorInstance.configuration.deferredLoad) {
            var loaderSequence = [];
            loaderSequence.push(editorInstance.configuration.resourceBase + '/langs/' + editorInstance.configuration.languageCode + '.js');
            if (editorInstance.configuration.toolbarName !== false) {
                loaderSequence.push(editorInstance.configuration.resourceBase + '/toolbars/' + editorInstance.configuration.toolbarName + '.js');
            }
            loaderSequence.push(function() { editorMethods.beginEditorStartup(); });
            new ScriptLoader().enqueueSequence(loaderSequence);
        } else {
            editorMethods.beginEditorStartup();
        }
    };

    editorMethods.beginEditorStartup = function() {
        editorInstance.cachedHeight = editorInstance.domElements.sourceInput.css('height');
        editorInstance.cachedWidth = editorInstance.domElements.sourceInput.css('width');

        editorMethods.constructEditorDom();

        var initialContent = editorInstance.domElements.sourceInput.val();

        initialContent = editorMethods.preFormatContent(initialContent);

        if (editorInstance.configuration.autoParagraphs) {
            initialContent = editorMethods.autoParagraphText(initialContent);
        }

        editorMethods.activateEditor(initialContent);

        $(editorInstance.iframeDocument).on('click', function(e) { editorMethods.focusOnEditor(); });

        $(editorInstance.iframeDocument).on('paste', function(e) {
            setTimeout(function() {
                var markerNode = $('<span id="pastemarkerend">&nbsp;</span>').get(0);
                editorInstance.selectionUtility.insertDomNodeAtCaret(markerNode);
                editorMethods.cleanPastedData();
            }, 200);
        });

        $(editorInstance.iframeDocument).on('keypress', function(e) {
            var keyVal = e.keyCode || e.which;
            if (currentBrowserInfo.isWebkit) {
                // Safari shift key + enter logic not provided in original snippet
            }
        });

        $(editorInstance.iframeDocument).on('keyup', function(e) {
            var keyVal = e.keyCode || e.which;
            
            if (editorInstance.configuration.autoParagraphs) {
                if (keyVal === 8 || keyVal === 46) {
                    if (editorMethods.handleEmptyContent(e)) return;
                }
                if (keyVal === 13 && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
                    if (editorMethods.handleParagraphOnNewline(e)) return;
                }
            }
            editorMethods.syncContentToSource();
        });
        
        editorMethods.buildToolbarUI();
        
        if (editorInstance.configuration.autoAdjustHeight === false) editorMethods.buildResizeHandle();
        else editorMethods.setupAutoHeightObserver();

        editorMethods.establishKeyboardShortcuts();
        editorMethods.setupAutoSave();
        editorMethods.observeImageResizing();

        if (editorInstance.configuration.startMaximized) {
            editorInstance.configuration.startMaximized = false;
            editorMethods.toggleFullscreen();
        }
                
        if (editorInstance.configuration.initialFocus) editorMethods.focusOnEditor();

        if (editorInstance.configuration.stickyToolbar) {
            editorMethods.observeScrollForToolbar();
            $(document).on('scroll', editorMethods.observeScrollForToolbar);
        }
    };

    editorMethods.initializeEditorProcess();

    return {
        updateContent: editorMethods.setEditorContent,
        retrieveContent: editorMethods.getEditorContent,
        injectHtmlFragment: editorMethods.insertHtmlSnippet,
        decommissionEditor: editorMethods.destroyEditor,
        processSubmission: editorMethods.submitContentHandler,
        executeCommand: editorMethods.executeEditorCommand
    };
};

jQuery.fn.wysiwygForge = function(option) {
    return this.each(function() {
        var $this = $(this);
        var instance = $this.data('wysiwygForge');
        if (!instance) {
            instance = createContentEditor(this, option);
            $this.data('wysiwygForge', instance);
        }
        if (typeof option === 'string' && instance && typeof instance[option] === 'function') {
            var methodArgs = Array.prototype.slice.call(arguments, 1);
            instance[option].apply(instance, methodArgs);
        }
    });
};