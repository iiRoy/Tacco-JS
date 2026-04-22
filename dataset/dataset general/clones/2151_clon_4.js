const globalEditorSettings = {
    baseModulePath: '/texteditor/',
    minimumRenderHeight: 200,
    minimumRenderWidth: 750
};

const escapeMarkup = (contentVal) => {
    if (typeof contentVal !== "string") {
        contentVal = String(contentVal);
    }
    return contentVal.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
};

const checkBrowserCompliance = (() => {
    const userAgentId = navigator.userAgent.toLowerCase();
    const predicateList = [
        () => /*@cc_on!@*/false && userAgentId.indexOf("mac") === -1 && parseFloat(navigator.appVersion.match(/MSIE (.\..)/)?.[1] || 0) >= 5.5,
        () => navigator.product === "Gecko" && navigator.productSub >= 20030210 && !(typeof(opera) === 'object' && opera.postError),
        () => window.opera && window.opera.version && parseFloat(window.opera.version()) >= 9.5,
        () => userAgentId.indexOf(' adobeair/') !== -1 && (userAgentId.match(/ adobeair\/(\d+)/)?.[1] || 0) >= 1,
        () => userAgentId.indexOf(' applewebkit/') !== -1 && (userAgentId.match(/ applewebkit\/(\d+)/)?.[1] || 0) >= 522
    ];
    return () => predicateList.some(testFunc => testFunc());
})();

const reportErrorCondition = (contextObject, issueCode, issueDescription) => {
    contextObject.lastErrorCode = issueCode;
    contextObject.lastErrorDescription = issueDescription;

    if (contextObject.showIssues) {
        document.write(`<div style="color: #ff0000;">[ Content Editor Issue ${issueCode}: ${issueDescription} ]</div>`);
    }

    if (typeof contextObject.onIssueEncountered === 'function') {
        contextObject.onIssueEncountered(contextObject, issueCode, issueDescription);
    }
};

const createRichContentEditor = (configOptions) => {
    const internalState = {
        elementLabel: configOptions.label,
        spanWidth: configOptions.spanWidth || '100%',
        spanHeight: configOptions.spanHeight || '200',
        styleVariant: configOptions.styleVariant || 'Default',
        initialContent: configOptions.initialContent || '',
        modulePath: globalEditorSettings.baseModulePath,
        verifyBrowser: true,
        showIssues: true,
        extraSettings: new Map(),
        onIssueEncountered: null,
        tabIndex: configOptions.tabIndex,
        moduleVersion: '2.6.4',
        buildIdentifier: '21629'
    };

    const generateConfigurationPayload = () => {
        let configString = '';
        internalState.extraSettings.forEach((value, key) => {
            if (configString.length > 0) configString += '&amp;';
            configString += encodeURIComponent(key) + '=' + encodeURIComponent(value);
        });
        return `<input type="hidden" id="${internalState.elementLabel}___Config" value="${configString}" style="display:none" />`;
    };

    const constructFrameMarkup = () => {
        let moduleFile = 'texteditor.html';
        try {
            if ((/fcksource=true/i).test(window.top.location.search)) {
                moduleFile = 'texteditor.original.html';
            }
        } catch (e) { /* Ignore cross-origin frame access errors. */ }

        let frameSource = `${internalState.modulePath}module/${moduleFile}?label=${encodeURIComponent(internalState.elementLabel)}`;
        if (internalState.styleVariant) {
            frameSource += `&amp;variant=${internalState.styleVariant}`;
        }

        let htmlFragment = `<iframe id="${internalState.elementLabel}___Frame" src="${frameSource}" width="${internalState.spanWidth}" height="${internalState.spanHeight}`;
        if (internalState.tabIndex) {
            htmlFragment += `" tabindex="${internalState.tabIndex}`;
        }
        htmlFragment += `" frameborder="0" scrolling="no"></iframe>`;
        return htmlFragment;
    };

    const coreInstance = {
        get label() { return internalState.elementLabel; },
        set label(val) { internalState.elementLabel = val; },
        get width() { return internalState.spanWidth; },
        set width(val) { internalState.spanWidth = val; },
        get height() { return internalState.spanHeight; },
        set height(val) { internalState.spanHeight = val; },
        get variant() { return internalState.styleVariant; },
        set variant(val) { internalState.styleVariant = val; },
        get content() { return internalState.initialContent; },
        set content(val) { internalState.initialContent = val; },
        get moduleBase() { return internalState.modulePath; },
        set moduleBase(val) { internalState.modulePath = val; },
        get verify() { return internalState.verifyBrowser; },
        set verify(val) { internalState.verifyBrowser = val; },
        get displayIssues() { return internalState.showIssues; },
        set displayIssues(val) { internalState.showIssues = val; },
        get customConfig() { return internalState.extraSettings; },
        get onIssue() { return internalState.onIssueEncountered; },
        set onIssue(val) { internalState.onIssueEncountered = val; },
        get tabOrder() { return internalState.tabIndex; },
        set tabOrder(val) { internalState.tabIndex = val; },

        renderIntoDocument: () => {
            document.write(coreInstance.generateHtmlString());
        },

        generateHtmlString: () => {
            if (!internalState.elementLabel || internalState.elementLabel.length === 0) {
                reportErrorCondition(internalState, 701, 'A unique identifier must be provided.');
                return '';
            }

            let outputHtml = '';
            if (!internalState.verifyBrowser || checkBrowserCompliance()) {
                outputHtml += `<input type="hidden" id="${internalState.elementLabel}" name="${internalState.elementLabel}" value="${escapeMarkup(internalState.initialContent)}" style="display:none" />`;
                outputHtml += generateConfigurationPayload();
                outputHtml += constructFrameMarkup();
            } else {
                const effectiveWidth = internalState.spanWidth.toString().includes('%') ? internalState.spanWidth : `${internalState.spanWidth}px`;
                const effectiveHeight = internalState.spanHeight.toString().includes('%') ? internalState.spanHeight : `${internalState.spanHeight}px`;

                outputHtml += `<textarea name="${internalState.elementLabel}" rows="4" cols="40" style="width:${effectiveWidth};height:${effectiveHeight}`;
                if (internalState.tabIndex) {
                    outputHtml += `" tabindex="${internalState.tabIndex}`;
                }
                outputHtml += `">${escapeMarkup(internalState.initialContent)}</textarea>`;
            }
            return outputHtml;
        },

        swapWithElement: () => {
            if (document.getElementById(`${internalState.elementLabel}___Frame`)) {
                return;
            }

            if (!internalState.verifyBrowser || checkBrowserCompliance()) {
                let targetElement = document.getElementById(internalState.elementLabel) ||
                                    document.querySelector(`textarea[name="${internalState.elementLabel}"]`);

                if (!targetElement || targetElement.tagName.toLowerCase() !== 'textarea') {
                    const elementsByName = document.getElementsByName(internalState.elementLabel);
                    for (let i = 0; i < elementsByName.length; i++) {
                        if (elementsByName[i].tagName.toLowerCase() === 'textarea') {
                            targetElement = elementsByName[i];
                            break;
                        }
                    }
                }

                if (!targetElement) {
                    alert(`Issue: The TEXTAREA with id or name "${internalState.elementLabel}" was not located.`);
                    return;
                }

                targetElement.style.display = 'none';
                if (targetElement.tabIndex) {
                    internalState.tabIndex = targetElement.tabIndex;
                }

                const configInput = document.createElement('input');
                configInput.type = 'hidden';
                configInput.id = `${internalState.elementLabel}___Config`;
                configInput.value = (() => {
                    let configString = '';
                    internalState.extraSettings.forEach((value, key) => {
                        if (configString.length > 0) configString += '&';
                        configString += encodeURIComponent(key) + '=' + encodeURIComponent(value);
                    });
                    return configString;
                })();
                configInput.style.display = 'none';

                const frameElement = document.createElement('iframe');
                frameElement.id = `${internalState.elementLabel}___Frame`;
                frameElement.src = (() => {
                    let moduleFile = 'texteditor.html';
                    try {
                        if ((/fcksource=true/i).test(window.top.location.search)) {
                            moduleFile = 'texteditor.original.html';
                        }
                    } catch (e) { /* Ignore cross-origin frame access errors. */ }
                    let frameSource = `${internalState.modulePath}module/${moduleFile}?label=${encodeURIComponent(internalState.elementLabel)}`;
                    if (internalState.styleVariant) {
                        frameSource += `&variant=${internalState.styleVariant}`;
                    }
                    return frameSource;
                })();
                frameElement.width = internalState.spanWidth;
                frameElement.height = internalState.spanHeight;
                frameElement.frameBorder = '0';
                frameElement.scrolling = 'no';
                if (internalState.tabIndex) {
                    frameElement.tabIndex = internalState.tabIndex;
                }
                
                targetElement.before(configInput);
                targetElement.before(frameElement);
            }
        }
    };
    return coreInstance;
};

const replaceHtmlWidgets = (filterConfig = {}) => {
    Array.from(document.querySelectorAll('textarea'))
        .filter(textareaElement => {
            const elementName = textareaElement.name;
            if (!elementName || elementName.length === 0) return false;

            if (filterConfig.classNameFilter) {
                const classRegex = new RegExp(`(?:^| )${filterConfig.classNameFilter}(?:$| )`);
                if (!classRegex.test(textareaElement.className)) return false;
            }

            if (typeof filterConfig.customPredicate === 'function') {
                const tempWidget = createRichContentEditor({
                    label: elementName,
                    spanWidth: Math.max(textareaElement.offsetWidth, globalEditorSettings.minimumRenderWidth),
                    spanHeight: Math.max(textareaElement.offsetHeight, globalEditorSettings.minimumRenderHeight),
                    initialContent: textareaElement.value
                });
                if (filterConfig.customPredicate(textareaElement, tempWidget) === false) return false;
            }
            return true;
        })
        .forEach(textareaElement => {
            const widgetInstance = createRichContentEditor({
                label: textareaElement.name,
                spanWidth: Math.max(textareaElement.offsetWidth, globalEditorSettings.minimumRenderWidth),
                spanHeight: Math.max(textareaElement.offsetHeight, globalEditorSettings.minimumRenderHeight),
                initialContent: textareaElement.value
            });
            widgetInstance.swapWithElement();
        });
};

window.checkBrowserCompliance = checkBrowserCompliance;
window.createRichContentEditor = createRichContentEditor;
window.replaceHtmlWidgets = replaceHtmlWidgets;