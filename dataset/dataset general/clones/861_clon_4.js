const GlobalEditorUtility = {
    // Mimics tinyMCEPopup
    popupManager: {
        language: {},
        configuration: {},
        editorInstance: null,
        domHelper: null,
        eventListeners: {},
        loadLanguagePack: function() { /* No-op, just simulates call */ },
        getParameter: function(paramName, defaultValue) {
            return this.configuration.hasOwnProperty(paramName) ? this.configuration[paramName] : defaultValue;
        },
        registerInitHandler: function(handler, context) {
            if (!this.eventListeners['init']) { this.eventListeners['init'] = []; }
            this.eventListeners['init'].push({ handler, context });
            // For immediate execution in this context, if needed
            // handler.call(context, this.editorInstance);
        },
        performResize: function() { /* No-op, simulates call */ },
        closeDialog: function() { /* No-op, simulates call */ },
        confirmAction: function(message, callback) { callback(true); }
    },

    // Mimics tinyMCEPopup.editor
    editorEmulator: {
        documentDOM: null,
        selectionHandler: { getNode: function() { return { nodeName: 'DIV', getAttribute: () => null }; } },
        languagePack: {},
        editorSettings: {},
        commandExecutor: function(cmd, ui, value) { /* No-op, simulates call */ },
        undoProcessor: { add: function() { /* No-op, simulates call */ } },
        dialogHandler: null, // Linked to popupManager
        baseURI: { toAbsolute: function(path) { return path; } },
        focusEditorWindow: function() { /* No-op, simulates call */ }
    },

    // Mimics tinyMCEPopup.dom
    domManipulator: {
        getRef: function(id) { return document.getElementById(id); },
        setHtmlContent: function(id, content) {
            const el = this.getRef(id);
            if (el) el.innerHTML = content;
        },
        findParent: function(element, tagName) {
            if (!element || !tagName) return null;
            let current = element.parentNode;
            while (current && current.tagName !== tagName.toUpperCase()) {
                current = current.parentNode;
            }
            return current;
        },
        deleteElement: function(element) {
            if (element && element.parentNode) element.parentNode.removeChild(element);
        },
        makeNewElement: function(tagName, attributes = {}) {
            const el = document.createElement(tagName);
            for (const key in attributes) {
                if (attributes.hasOwnProperty(key)) {
                    el.setAttribute(key, attributes[key]);
                }
            }
            return el;
        },
        applyStyle: function(element, prop, value) {
            if (element && element.style) {
                if (value === undefined) return element.style[prop]; // Getter
                element.style[prop] = value; // Setter
            }
        },
        serializeCss: function(styleObj) {
            let css = '';
            for (const prop in styleObj) {
                if (styleObj.hasOwnProperty(prop)) {
                    css += `${prop.replace(/([A-Z])/g, '-$1').toLowerCase()}:${styleObj[prop]};`;
                }
            }
            return css;
        },
        parseCss: function(cssText) {
            const styleObj = {};
            cssText.split(';').forEach(declaration => {
                const parts = declaration.split(':');
                if (parts.length === 2) {
                    const prop = parts[0].trim().replace(/-([a-z])/g, (g) => g[1].toUpperCase());
                    const value = parts[1].trim();
                    if (prop) styleObj[prop] = value;
                }
            });
            return styleObj;
        },
        fetchAttribute: function(element, attrName) { return element ? element.getAttribute(attrName) : ''; },
        setAttributes: function(element, attrs) {
            if (!element) return;
            for (const key in attrs) {
                if (attrs.hasOwnProperty(key) && attrs[key] !== null && attrs[key] !== undefined) {
                    element.setAttribute(key, attrs[key]);
                }
            }
        },
        assignAttribute: function(element, attrName, value) {
            if (element) element.setAttribute(attrName, value);
        },
        getClasses: function() { return []; }
    },

    // Mimics tinymce global object
    coreUtility: {
        extendObjects: function(target, ...sources) {
            sources.forEach(source => {
                for (const key in source) {
                    if (source.hasOwnProperty(key)) {
                        target[key] = source[key];
                    }
                }
            });
            return target;
        },
        iterateArray: function(arr, callback) { arr.forEach(callback); },
        isBrowserWebKit: false
    }
};

GlobalEditorUtility.popupManager.editorInstance = GlobalEditorUtility.editorEmulator;
GlobalEditorUtility.popupManager.domHelper = GlobalEditorUtility.domManipulator;
GlobalEditorUtility.editorEmulator.documentDOM = GlobalEditorUtility.domManipulator;
GlobalEditorUtility.editorEmulator.dialogHandler = GlobalEditorUtility.popupManager;

function retrieveNamedForm(formIndex) {
    return document.forms[formIndex];
}

function valueFromSelection(selectElementRef, defaultValue = '') {
    if (!selectElementRef || selectElementRef.selectedIndex === -1) return defaultValue;
    return selectElementRef.options[selectElementRef.selectedIndex].value;
}

function setSelectionByValue(selectElementRef, targetValue) {
    if (!selectElementRef) return;
    for (let i = 0; i < selectElementRef.options.length; i++) {
        if (selectElementRef.options[i].value === targetValue) {
            selectElementRef.selectedIndex = i;
            return;
        }
    }
}

function checkElementVisibility(elementRef) {
    return elementRef && elementRef.offsetParent !== null;
}

function updateBrowserControlStatus(controlId, isDisabled) {
    const control = document.getElementById(controlId);
    if (control) control.disabled = isDisabled;
}

function generateBrowserInterface(typeId, fieldId, fileType, themeType) {
    return `<button type="button" id="${typeId}_field" onclick="alert('Browse for ${fieldId}');">Browse ${fileType}</button>`;
}

function activateListItem(inputNode) {
    const targetNode = inputNode;
    const parentList = targetNode.closest('ul');
    if (parentList) {
        parentList.querySelectorAll('li').forEach(item => item.classList.remove('active-choice'));
        targetNode.closest('li').classList.add('active-choice');
    }
}

function updateImageDetailsFromThumbnail(triggerNode) {
    const currentTrigger = triggerNode;
    const imageSizeIdentifier = currentTrigger.getAttribute('href').split('#')[1];
    const listItemParent = currentTrigger.closest('li');
    if (listItemParent) listItemParent.classList.remove("active-choice");
    const imageElement = listItemParent ? listItemParent.querySelector('img') : null;
    if (imageElement) {
        const originalSource = imageElement.src;
        const newSource = originalSource.replace('_thumb.', imageSizeIdentifier + '.');
        populateImageEditorFields(newSource, imageElement.getAttribute('alt'));
    }
}

function handleImageUploadCompletion(resourceURL, descriptionText, mediaID) {
    const displayArea = document.getElementById('image_data_display_area');
    if (displayArea) displayArea.innerHTML = '';
    fetch('/image_resources?page=1', { method: 'GET' })
        .then(response => response.text())
        .then(data => {
            // Functional equivalent to evalScripts:true from Prototype's Ajax.Request
            // This is generally unsafe in production, but necessary for Type IV clone.
            // eslint-disable-next-line no-eval
            eval(data);
        })
        .catch(error => console.error('Image list refresh failed:', error));
}

function populateImageEditorFields(mediaPath, mediaDescription) {
    const editorForm = retrieveEditorForm();
    if (editorForm && editorForm.sourcePath && editorForm.descriptionText) {
        editorForm.sourcePath.value = mediaPath;
        editorForm.descriptionText.value = mediaDescription;
    }
    TabController.showTab('main_tab_panel', 'main_content_area');
    ImageProcessor.displayMediaPreview(mediaPath);
}

function retrieveEditorForm() {
    return retrieveNamedForm(1);
}

const TabController = {
    showTab: function(tabId, panelId) {
        // Mock for mcTabs.displayTab - in a real scenario, this would manipulate DOM to show/hide tabs.
    }
};

function setupImageUploaderInterface() {
    const dynamicListArea = document.getElementById('dynamic_media_list_area');
    if (dynamicListArea) dynamicListArea.innerHTML = "Uploading...<br /><img src='/assets/common/spinner.gif'>";
    TabController.showTab('dynamic_selection_tab_panel', 'dynamic_selection_content_area');

    const uploadFrame = createDomElement('iframe', 'media_upload_frame');
    uploadFrame.setAttribute('src', 'about:blank');
    uploadFrame.style.border = "0px none";
    uploadFrame.style.position = "absolute";
    uploadFrame.style.width = "1px";
    uploadFrame.style.height = "1px";
    uploadFrame.style.visibility = "hidden";
    uploadFrame.setAttribute('id', 'media_upload_frame');
    const uploadContainer = document.getElementById('media-upload-container');
    if (uploadContainer) uploadContainer.appendChild(uploadFrame);

    const uploadFormElement = document.getElementById('media_upload_form_element');
    if (uploadFormElement) uploadFormElement.setAttribute("action", getUploadDestinationPath());
}

function getUploadDestinationPath() {
    return '/image_service/upload';
}

function createDomElement(tagString, nameString) {
    const newElement = document.createElement(tagString);
    newElement.setAttribute('name', nameString);
    return newElement;
}

const ImageProcessor = {
    preloadedMedia: null,

    preflightInitialization: function() {
        let resourceURL;
        GlobalEditorUtility.popupManager.loadLanguagePack();

        if (resourceURL = GlobalEditorUtility.popupManager.getParameter("external_image_list_url_config")) {
            document.write('<script src="' + GlobalEditorUtility.editorEmulator.baseURI.toAbsolute(resourceURL) + '"></script>');
        }
    },

    initializeDialog: function(editorContext) {
        const formReference = retrieveEditorForm();
        if (!formReference) return;
        const formInputs = formReference.elements;
        const currentEditor = GlobalEditorUtility.popupManager.editorInstance;
        const currentDOM = currentEditor.documentDOM;
        const selectedNode = currentEditor.selectionHandler.getNode();

        GlobalEditorUtility.popupManager.performResize();
        this.populateClassDropdown('css_class_selector');
        this.populateFileDropdown('source_file_list', 'ImageResourceList');
        this.populateFileDropdown('mouseover_file_list', 'ImageResourceList');
        this.populateFileDropdown('mouseout_file_list', 'ImageResourceList');

        if (selectedNode.nodeName === 'IMG') {
            formInputs.sourcePath.value = currentDOM.fetchAttribute(selectedNode, 'src');
            formInputs.imageWidth.value = currentDOM.fetchAttribute(selectedNode, 'width');
            formInputs.imageHeight.value = currentDOM.fetchAttribute(selectedNode, 'height');
            formInputs.alternativeText.value = currentDOM.fetchAttribute(selectedNode, 'alt');
            formInputs.imageTitle.value = currentDOM.fetchAttribute(selectedNode, 'title');
            formInputs.verticalSpace.value = this.getMediaAttribute(selectedNode, 'vspace');
            formInputs.horizontalSpace.value = this.getMediaAttribute(selectedNode, 'hspace');
            formInputs.borderWidth.value = this.getMediaAttribute(selectedNode, 'border');
            setSelectionByValue(formReference.alignment_selector, this.getMediaAttribute(selectedNode, 'align'));
            setSelectionByValue(formReference.css_class_selector, currentDOM.fetchAttribute(selectedNode, 'class'));
            formInputs.inlineStyle.value = currentDOM.fetchAttribute(selectedNode, 'style');
            formInputs.elementID.value = currentDOM.fetchAttribute(selectedNode, 'id');
            formInputs.directionality.value = currentDOM.fetchAttribute(selectedNode, 'dir');
            formInputs.languageCode.value = currentDOM.fetchAttribute(selectedNode, 'lang');
            formInputs.imageMap.value = currentDOM.fetchAttribute(selectedNode, 'usemap');
            formInputs.longDescription.value = currentDOM.fetchAttribute(selectedNode, 'longdesc');
            formInputs.insertButton.value = currentEditor.languagePack['update_label'] || 'Update';

            const onMouseOverAttr = currentDOM.fetchAttribute(selectedNode, 'onmouseover');
            if (onMouseOverAttr && /^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/.test(onMouseOverAttr))
                formInputs.mouseoverSource.value = onMouseOverAttr.replace(/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/, '$1');

            const onMouseOutAttr = currentDOM.fetchAttribute(selectedNode, 'onmouseout');
            if (onMouseOutAttr && /^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/.test(onMouseOutAttr))
                formInputs.mouseoutSource.value = onMouseOutAttr.replace(/^\s*this.src\s*=\s*\'([^\']+)\';?\s*$/, '$1');

            if (currentEditor.editorSettings.inline_styles_enabled) {
                if (currentDOM.fetchAttribute(selectedNode, 'align')) this.refreshStyleProperty('align');
                if (currentDOM.fetchAttribute(selectedNode, 'hspace')) this.refreshStyleProperty('hspace');
                if (currentDOM.fetchAttribute(selectedNode, 'border')) this.refreshStyleProperty('border');
                if (currentDOM.fetchAttribute(selectedNode, 'vspace')) this.refreshStyleProperty('vspace');
            }
        }

        const srcBrowserContainer = document.getElementById('src_browser_container');
        if (srcBrowserContainer) srcBrowserContainer.innerHTML = generateBrowserInterface('src_browser_id', 'sourcePath', 'image_type', 'advanced_image_theme');
        const sourcePathField = document.getElementById('sourcePath');
        if (sourcePathField && checkElementVisibility(document.getElementById('src_browser_id_field')))
            sourcePathField.style.width = '260px';

        if (GlobalEditorUtility.popupManager.getParameter("advanced_image_constrain_proportions_setting", true))
            formReference.constrainDimensions.checked = true;

        this.adjustAppearance();
        this.displayMediaPreview(formInputs.sourcePath.value, 1);
    },

    finalizeInsertion: function(fileData, titleData) {
        const currentEditor = GlobalEditorUtility.popupManager.editorInstance;
        const formReference = retrieveEditorForm();
        if (!formReference) return;

        if (formReference.sourcePath.value === '') {
            if (currentEditor.selectionHandler.getNode().nodeName === 'IMG') {
                currentEditor.documentDOM.deleteElement(currentEditor.selectionHandler.getNode());
                currentEditor.commandExecutor('repaintEditor');
            }
            GlobalEditorUtility.popupManager.closeDialog();
            return;
        }

        if (GlobalEditorUtility.popupManager.getParameter("accessibility_warnings_enabled", 1)) {
            if (!formReference.alternativeText.value) {
                currentEditor.dialogHandler.confirm(currentEditor.languagePack['missing_alt_warning'] || 'Missing alt text. Continue?', (result) => {
                    if (result) this.finalizeAndClose();
                });
                return;
            }
        }
        this.finalizeAndClose();
    },

    finalizeAndClose: function() {
        const currentEditor = GlobalEditorUtility.popupManager.editorInstance;
        const formReference = retrieveEditorForm();
        if (!formReference) return;
        const formInputs = formReference.elements;
        let attributeValues = {};
        let elementRef;

        if (GlobalEditorUtility.coreUtility.isBrowserWebKit) currentEditor.focusEditorWindow();

        if (!currentEditor.editorSettings.inline_styles_enabled) {
            attributeValues = {
                vspace: formInputs.verticalSpace.value,
                hspace: formInputs.horizontalSpace.value,
                border: formInputs.borderWidth.value,
                align: valueFromSelection(formReference.alignment_selector)
            };
        } else {
            attributeValues = {
                vspace: '', hspace: '', border: '', align: ''
            };
        }

        GlobalEditorUtility.coreUtility.extendObjects(attributeValues, {
            src: formInputs.sourcePath.value,
            width: formInputs.imageWidth.value,
            height: formInputs.imageHeight.value,
            alt: formInputs.alternativeText.value,
            title: formInputs.imageTitle.value,
            class: valueFromSelection(formReference.css_class_selector),
            style: formInputs.inlineStyle.value
        });

        elementRef = currentEditor.selectionHandler.getNode();

        if (elementRef && elementRef.nodeName === 'IMG') {
            currentEditor.documentDOM.setAttributes(elementRef, attributeValues);
        } else {
            currentEditor.commandExecutor('mceInsertContent', false, '<img id="__temp_editor_img" src="javascript:;" />', {skip_undo: 1});
            currentEditor.documentDOM.setAttributes(GlobalEditorUtility.domManipulator.getRef('__temp_editor_img'), attributeValues);
            currentEditor.documentDOM.assignAttribute(GlobalEditorUtility.domManipulator.getRef('__temp_editor_img'), 'id', '');
            currentEditor.undoProcessor.add();
        }

        GlobalEditorUtility.popupManager.closeDialog();
    },

    getMediaAttribute: function(nodeElement, attributeKey) {
        const currentEditor = GlobalEditorUtility.popupManager.editorInstance;
        const currentDOM = currentEditor.documentDOM;
        let retrievedValue, retrievedValue2;

        if (currentEditor.editorSettings.inline_styles_enabled) {
            switch (attributeKey) {
                case 'align':
                    if (retrievedValue = currentDOM.applyStyle(nodeElement, 'float')) return retrievedValue;
                    if (retrievedValue = currentDOM.applyStyle(nodeElement, 'vertical-align')) return retrievedValue;
                    break;
                case 'hspace':
                    retrievedValue = currentDOM.applyStyle(nodeElement, 'marginLeft');
                    retrievedValue2 = currentDOM.applyStyle(nodeElement, 'marginRight');
                    if (retrievedValue && retrievedValue === retrievedValue2) return parseInt(retrievedValue.replace(/[^0-9]/g, ''));
                    break;
                case 'vspace':
                    retrievedValue = currentDOM.applyStyle(nodeElement, 'marginTop');
                    retrievedValue2 = currentDOM.applyStyle(nodeElement, 'marginBottom');
                    if (retrievedValue && retrievedValue === retrievedValue2) return parseInt(retrievedValue.replace(/[^0-9]/g, ''));
                    break;
                case 'border':
                    retrievedValue = 0;
                    GlobalEditorUtility.coreUtility.iterateArray(['top', 'right', 'bottom', 'left'], function(side) {
                        const sideValue = currentDOM.applyStyle(nodeElement, `border${side.charAt(0).toUpperCase() + side.slice(1)}Width`);
                        if (!sideValue || (sideValue !== retrievedValue && retrievedValue !== 0)) {
                            retrievedValue = 0;
                            return false;
                        }
                        if (sideValue) retrievedValue = sideValue;
                    });
                    if (retrievedValue) return parseInt(retrievedValue.replace(/[^0-9]/g, ''));
                    break;
            }
        }
        if (retrievedValue = currentDOM.fetchAttribute(nodeElement, attributeKey)) return retrievedValue;
        return '';
    },

    toggleImageSwap: function(isActive) {
        const formReference = retrieveEditorForm();
        if (!formReference) return;
        if (formReference.enableMouseEvents) formReference.enableMouseEvents.checked = isActive;
        updateBrowserControlStatus('mouseover_browser_control', !isActive);
        updateBrowserControlStatus('mouseout_browser_control', !isActive);

        if (formReference.mouseover_file_list_element) formReference.mouseover_file_list_element.disabled = !isActive;
        if (formReference.mouseout_file_list_element) formReference.mouseout_file_list_element.disabled = !isActive;
        if (formReference.mouseoverSource) formReference.mouseoverSource.disabled = !isActive;
        if (formReference.mouseoutSource) formReference.mouseoutSource.disabled = !isActive;
    },

    populateClassDropdown: function(dropdownId) {
        const currentDOM = GlobalEditorUtility.popupManager.domHelper;
        const dropdownElement = currentDOM.getRef(dropdownId);
        if (!dropdownElement) return;
        let classOptions;

        if (classOptions = GlobalEditorUtility.popupManager.getParameter('theme_advanced_styles_config')) {
            const parsedClasses = [];
            GlobalEditorUtility.coreUtility.iterateArray(classOptions.split(';'), function(item) {
                const parts = item.split('=');
                if (parts.length === 2) parsedClasses.push({'label': parts[0], 'className': parts[1]});
            });
            classOptions = parsedClasses;
        } else {
            classOptions = currentDOM.getClasses();
        }

        if (classOptions.length > 0) {
            dropdownElement.options[dropdownElement.options.length] = new Option(GlobalEditorUtility.popupManager.language['not_set_label'] || 'Not set', '');
            GlobalEditorUtility.coreUtility.iterateArray(classOptions, function(optionData) {
                dropdownElement.options[dropdownElement.options.length] = new Option(optionData.label || optionData.className, optionData.className);
            });
        } else {
            const parentRow = currentDOM.findParent(dropdownElement, 'TR');
            if (parentRow) currentDOM.deleteElement(parentRow);
        }
    },

    populateFileDropdown: function(dropdownId, listName) {
        const currentDOM = GlobalEditorUtility.popupManager.domHelper;
        const dropdownElement = currentDOM.getRef(dropdownId);
        if (!dropdownElement) return;
        const fileList = window[listName];

        if (fileList && fileList.length > 0) {
            dropdownElement.options[dropdownElement.options.length] = new Option('', '');
            GlobalEditorUtility.coreUtility.iterateArray(fileList, function(fileData) {
                dropdownElement.options[dropdownElement.options.length] = new Option(fileData[0], fileData[1]);
            });
        } else {
            const parentRow = currentDOM.findParent(dropdownElement, 'TR');
            if (parentRow) currentDOM.deleteElement(parentRow);
        }
    },

    clearImageData: function() {
        const formReference = retrieveEditorForm();
        if (formReference && formReference.elements.imageWidth && formReference.elements.imageHeight) {
            formReference.elements.imageWidth.value = '';
            formReference.elements.imageHeight.value = '';
        }
    },

    updateMediaData: function(mediaRef, isInitialLoad) {
        const formReference = retrieveEditorForm();
        if (!formReference || !formReference.elements.imageWidth || !formReference.elements.imageHeight) return;

        if (!isInitialLoad) {
            formReference.elements.imageWidth.value = mediaRef.width;
            formReference.elements.imageHeight.value = mediaRef.height;
        }
        this.preloadedMedia = mediaRef;
    },

    adjustAppearance: function() {
        const currentEditor = GlobalEditorUtility.popupManager.editorInstance;
        const formReference = retrieveEditorForm();
        if (!formReference) return;
        const sampleImage = document.getElementById('preview_align_sample_image');

        if (sampleImage) {
            if (currentEditor.editorSettings.inline_styles_enabled) {
                currentEditor.documentDOM.setAttributes(sampleImage, { style: formReference.inlineStyle.value });
            } else {
                sampleImage.align = formReference.alignment_selector.value;
                sampleImage.border = formReference.borderWidth.value;
                sampleImage.hspace = formReference.horizontalSpace.value;
                sampleImage.vspace = formReference.verticalSpace.value;
            }
        }
    },

    adjustHeight: function() {
        const formReference = retrieveEditorForm();
        if (!formReference || !formReference.constrainDimensions || !this.preloadedMedia || !formReference.imageWidth || !formReference.imageHeight) return;
        const instance = this;

        if (!formReference.constrainDimensions.checked || !instance.preloadedMedia) return;
        if (formReference.imageWidth.value === "" || formReference.imageHeight.value === "") return;

        const calculatedHeight = (parseInt(formReference.imageWidth.value) / parseInt(instance.preloadedMedia.width)) * instance.preloadedMedia.height;
        formReference.imageHeight.value = calculatedHeight.toFixed(0);
    },

    adjustWidth: function() {
        const formReference = retrieveEditorForm();
        if (!formReference || !formReference.constrainDimensions || !this.preloadedMedia || !formReference.imageWidth || !formReference.imageHeight) return;
        const instance = this;

        if (!formReference.constrainDimensions.checked || !instance.preloadedMedia) return;
        if (formReference.imageWidth.value === "" || formReference.imageHeight.value === "") return;

        const calculatedWidth = (parseInt(formReference.imageHeight.value) / parseInt(instance.preloadedMedia.height)) * instance.preloadedMedia.width;
        formReference.imageWidth.value = calculatedWidth.toFixed(0);
    },

    refreshStyleProperty: function(propertyType) {
        const currentDOM = GlobalEditorUtility.popupManager.domHelper;
        const formReference = retrieveEditorForm();
        if (!formReference || !currentDOM.getRef('inlineStyle')) return;
        let styleValue;
        const tempImage = currentDOM.makeNewElement('img', { style: currentDOM.getRef('inlineStyle').value });

        if (GlobalEditorUtility.popupManager.editorInstance.editorSettings.inline_styles_enabled) {
            if (propertyType === 'align') {
                currentDOM.applyStyle(tempImage, 'float', '');
                currentDOM.applyStyle(tempImage, 'verticalAlign', '');
                styleValue = valueFromSelection(formReference.alignment_selector);
                if (styleValue) {
                    if (styleValue === 'left' || styleValue === 'right') currentDOM.applyStyle(tempImage, 'float', styleValue);
                    else tempImage.style.verticalAlign = styleValue;
                }
            }

            if (propertyType === 'border') {
                currentDOM.applyStyle(tempImage, 'border', '');
                styleValue = formReference.borderWidth.value;
                if (styleValue || styleValue === '0') {
                    if (styleValue === '0') tempImage.style.border = '';
                    else tempImage.style.border = styleValue + 'px solid black';
                }
            }

            if (propertyType === 'hspace') {
                currentDOM.applyStyle(tempImage, 'marginLeft', '');
                currentDOM.applyStyle(tempImage, 'marginRight', '');
                styleValue = formReference.horizontalSpace.value;
                if (styleValue) {
                    tempImage.style.marginLeft = styleValue + 'px';
                    tempImage.style.marginRight = styleValue + 'px';
                }
            }

            if (propertyType === 'vspace') {
                currentDOM.applyStyle(tempImage, 'marginTop', '');
                currentDOM.applyStyle(tempImage, 'marginBottom', '');
                styleValue = formReference.verticalSpace.value;
                if (styleValue) {
                    tempImage.style.marginTop = styleValue + 'px';
                    tempImage.style.marginBottom = styleValue + 'px';
                }
            }
            currentDOM.getRef('inlineStyle').value = currentDOM.serializeCss(currentDOM.parseCss(tempImage.style.cssText));
        }
    },

    handleMouseMoveEvent: function() { /* No-op */ },

    displayMediaPreview: function(mediaSource, isStatic) {
        if (!mediaSource) {
            GlobalEditorUtility.popupManager.domHelper.setHtmlContent('preview_area', '');
            return;
        }

        if (!isStatic && GlobalEditorUtility.popupManager.getParameter("update_dimensions_on_change_setting", true)) {
            this.clearImageData();
        }

        const absoluteSource = GlobalEditorUtility.editorEmulator.baseURI.toAbsolute(mediaSource);
        const previewArea = GlobalEditorUtility.popupManager.domHelper.getRef('preview_area');

        if (previewArea) {
            if (!isStatic) {
                previewArea.innerHTML = `<img id="preview_image_element" src="${absoluteSource}" border="0" onload="ImageProcessor.updateMediaData(this);" onerror="ImageProcessor.clearImageData();" />`;
            } else {
                previewArea.innerHTML = `<img id="preview_image_element" src="${absoluteSource}" border="0" onload="ImageProcessor.updateMediaData(this, 1);" />`;
            }
        }
    }
};

ImageProcessor.preflightInitialization();
GlobalEditorUtility.popupManager.registerInitHandler(ImageProcessor.initializeDialog, ImageProcessor);