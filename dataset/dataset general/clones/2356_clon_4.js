(function () {
    const assetPanelFactory = (editorContext, panelVariant) => {

        const assetModelConstants = Object.freeze({
            VISUAL_ASSET: Symbol('VISUAL_ASSET'),
            HYPERLINK_ELEMENT: Symbol('HYPERLINK_ELEMENT'),
            PREVIEW_DISPLAY: Symbol('PREVIEW_DISPLAY'),
            CLEANUP_PROCESS: Symbol('CLEANUP_PROCESS')
        });

        const sizeValueRegex = /^\s*(\d+(\.\d+)?)\s*(px|%)?\s*$/i;

        let currentOperationEpoch = 0; // Replaces 'incommit' to prevent recursion

        // --- Core Utility Functions (replacing CKEDITOR.tools, CKEDITOR.document, etc.) ---
        const obtainNextIdentifier = (segment) => editorContext.generateSequentialId(segment);
        const retrieveDOMProxy = (id) => editorContext.getDOMObjectById(id);
        const processStringNormalization = (input) => input ? String(input).trim() : '';
        const requestUserConfirmation = (message) => editorContext.confirm(message);
        const deferExecution = (func, delayMilliseconds, executionContext) => setTimeout(() => func.call(executionContext), delayMilliseconds);

        // --- Panel State Management ---
        const panelState = {
            primaryVisualComponent: null, // this.imageElement
            associatedHyperlink: null, // this.linkElement
            isPrimaryVisualPresent: false, // this.imageEditMode
            isHyperlinkPresent: false, // this.linkEditMode
            dimensionsLinked: true, // this.lockRatio
            preventDimensionReset: false, // this.dontResetSize
            initialLoadNotCompleted: true, // this.firstLoad
            shouldAddHyperlink: false, // this.addLink
            originalVisualReference: null, // this.originalElement
            visualAidElement: null, // this.preview
            temporaryVisualComponent: null, // this.cleanImageElement

            // Input values mapped to CKEditor dialog fields
            visualAssetSourceURL: '', // txtUrl
            visualAssetWidth: '', // txtWidth
            visualAssetHeight: '', // txtHeight
            inlineStyleText: '', // txtdlgGenStyle
            // Additional properties for other fields (e.g., alt text, border, hspace, vspace)
        };

        // --- Component Identifiers (replacing numbering function) ---
        const dimensionLinkControlId = obtainNextIdentifier('dimLink');
        const dimensionResetControlId = obtainNextIdentifier('dimReset');
        const assetLoadIndicatorId = obtainNextIdentifier('loadIndicator');
        const assetPreviewBoxId = obtainNextIdentifier('previewBox');
        const linkPreviewId = obtainNextIdentifier('linkPreview');
        const assetPreviewImageId = obtainNextIdentifier('assetPreview');

        // --- Dimension Parsing and Calculation ---
        const parseDimensionString = (inputString) => {
            if (!inputString) return { numericValue: null, unitType: 'px' };
            const match = String(inputString).match(sizeValueRegex);
            if (match) {
                return { numericValue: parseFloat(match[1]), unitType: match[3] || 'px' };
            }
            return { numericValue: null, unitType: 'px' };
        };

        const updateDimensionLinkState = (evaluationStatus) => {
            const ratioToggleButton = retrieveDOMProxy(dimensionLinkControlId);
            const originalVisual = panelState.originalVisualReference;

            if (!originalVisual) return; // Panel might have been dismissed

            if (evaluationStatus === 'evaluate') {
                const currentWidth = parseDimensionString(panelState.visualAssetWidth).numericValue;
                const currentHeight = parseDimensionString(panelState.visualAssetHeight).numericValue;

                panelState.dimensionsLinked = false; // Default: unlock

                if (!currentWidth && !currentHeight) {
                    panelState.dimensionsLinked = true;
                } else if (originalVisual.width > 0 && originalVisual.height > 0 && !isNaN(currentWidth) && !isNaN(currentHeight)) {
                    const originalRatio = Math.round(originalVisual.width * 1000 / originalVisual.height);
                    const currentRatio = Math.round(currentWidth * 1000 / currentHeight);
                    if (originalRatio === currentRatio) {
                        panelState.dimensionsLinked = true;
                    }
                }
            } else if (evaluationStatus !== undefined) {
                panelState.dimensionsLinked = !!evaluationStatus;
            } else {
                panelState.dimensionsLinked = !panelState.dimensionsLinked; // Toggle state
            }

            if (panelState.dimensionsLinked) {
                ratioToggleButton.removeClass('unlinked_dimensions_css');
            } else {
                ratioToggleButton.addClass('unlinked_dimensions_css');
            }

            const statusLabel = editorContext._lang.asset[panelState.dimensionsLinked ? 'unlockRatio' : 'lockRatio'];
            ratioToggleButton.setAttribute('title', statusLabel);
            ratioToggleButton.getFirst().setText(statusLabel);
        };

        const adjustOppositeDimension = (changedDimensionKey, changedValue) => {
            // Update the state for the changed input
            if (changedDimensionKey === 'widthFieldInput') {
                panelState.visualAssetWidth = changedValue;
            } else {
                panelState.visualAssetHeight = changedValue;
            }

            const currentWidthParsed = parseDimensionString(panelState.visualAssetWidth);
            const currentHeightParsed = parseDimensionString(panelState.visualAssetHeight);

            // If a percentage unit is used, automatically unlock ratio
            if (currentWidthParsed.unitType === '%' || currentHeightParsed.unitType === '%') {
                updateDimensionLinkState(false);
            }

            // Only if ratio is linked AND original dimensions are ready
            if (panelState.dimensionsLinked && panelState.originalVisualReference && panelState.originalVisualReference.getCustomProperty('isReady') === 'true') {
                const originalWidth = panelState.originalVisualReference.width;
                const originalHeight = panelState.originalVisualReference.height;

                if (originalWidth === 0 || originalHeight === 0) {
                    updateDimensionLinkState(false); // Cannot calculate, force unlock
                    return;
                }

                if (changedDimensionKey === 'widthFieldInput' && currentWidthParsed.numericValue !== null && !isNaN(currentWidthParsed.numericValue)) {
                    const newHeight = Math.round(originalHeight * (currentWidthParsed.numericValue / originalWidth));
                    panelState.visualAssetHeight = `${newHeight}${currentWidthParsed.unitType}`;
                } else if (changedDimensionKey === 'heightFieldInput' && currentHeightParsed.numericValue !== null && !isNaN(currentHeightParsed.numericValue)) {
                    const newWidth = Math.round(originalWidth * (currentHeightParsed.numericValue / originalHeight));
                    panelState.visualAssetWidth = `${newWidth}${currentHeightParsed.unitType}`;
                }
            }
            refreshVisualPreview();
        };

        const restoreInitialAssetDimensions = () => {
            const originalVisual = panelState.originalVisualReference;
            if (originalVisual && originalVisual.getCustomProperty('isReady') === 'true') {
                panelState.visualAssetWidth = `${originalVisual.width}px`;
                panelState.visualAssetHeight = `${originalVisual.height}px`;
            }
            refreshVisualPreview();
        };

        const setupDimensionInputs = (contentType, targetElement) => {
            if (contentType !== assetModelConstants.VISUAL_ASSET) return;

            const dimensionKey = (contentType === 'widthFieldInput') ? 'width' : 'height';
            let finalValue = '';

            const attributeValue = targetElement.getAttribute(dimensionKey);
            if (attributeValue) {
                const parsed = parseDimensionString(attributeValue);
                if (parsed.numericValue !== null) {
                    finalValue = `${parsed.numericValue}${parsed.unitType}`;
                    if (parsed.unitType === '%') {
                        updateDimensionLinkState(false); // Unlock if percentage
                    }
                }
            }

            const styleValue = targetElement.getStyle(dimensionKey);
            if (styleValue) {
                const parsed = parseDimensionString(styleValue);
                if (parsed.numericValue !== null) {
                    finalValue = `${parsed.numericValue}${parsed.unitType}`;
                    if (parsed.unitType === '%') {
                        updateDimensionLinkState(false);
                    }
                }
            }
            // Update the panel state for the specific field
            if (contentType === 'widthFieldInput') {
                panelState.visualAssetWidth = finalValue;
            } else {
                panelState.visualAssetHeight = finalValue;
            }
        };

        // --- Preview Handling ---
        const refreshVisualPreview = () => {
            // Don't update if essential elements are not ready
            if (!panelState.originalVisualReference || !panelState.visualAidElement) return;

            // This simulates applying content to the preview stage
            // We apply the current state values to the mock visualAidElement
            panelState.visualAidElement.setAttribute('src', panelState.visualAssetSourceURL);
            panelState.visualAidElement.setAttribute('width', panelState.visualAssetWidth);
            panelState.visualAidElement.setAttribute('height', panelState.visualAssetHeight);
        };

        const handleAssetLoadSuccess = function () { // `this` is bound to panelState
            const original = this.originalVisualReference;
            original.setCustomProperty('isReady', 'true');
            original.removePropertyListeners('load', handleAssetLoadSuccess);
            original.removePropertyListeners('error', handleAssetLoadFailure);
            original.removePropertyListeners('abort', handleAssetLoadFailure);

            retrieveDOMProxy(assetLoadIndicatorId).setStyle('display', 'none');

            if (!this.preventDimensionReset) {
                restoreInitialAssetDimensions();
            }

            if (this.initialLoadNotCompleted) {
                deferExecution(() => updateDimensionLinkState('evaluate'), 0, this);
            }

            this.initialLoadNotCompleted = false;
            this.preventDimensionReset = false;
        };

        const handleAssetLoadFailure = function () { // `this` is bound to panelState
            const original = this.originalVisualReference;
            original.removePropertyListeners('load', handleAssetLoadSuccess);
            original.removePropertyListeners('error', handleAssetLoadFailure);
            original.removePropertyListeners('abort', handleAssetLoadFailure);

            const noAssetPlaceholder = editorContext.getURLforAsset(editorContext.skinPath + 'images/noimage.png');
            if (this.visualAidElement) {
                this.visualAidElement.setAttribute('src', noAssetPlaceholder);
            }

            retrieveDOMProxy(assetLoadIndicatorId).setStyle('display', 'none');
            updateDimensionLinkState(false); // Unlock on error
        };

        // --- Content Application & Propagation Logic ---
        const applyPanelStateToElements = (targetStage, ...elements) => {
            // This generalizes the dialog's commitContent logic
            // It maps panelState values to the properties of the provided elements.

            const targetElement = elements[0]; // Assuming the primary element is the first argument

            // Handle inline style text specifically
            if (panelState.inlineStyleText && targetStage === assetModelConstants.VISUAL_ASSET) {
                if (targetElement && typeof targetElement.setStyle === 'function') {
                    targetElement.setAttribute('style', panelState.inlineStyleText);
                }
            }

            if (targetStage === assetModelConstants.VISUAL_ASSET) {
                if (targetElement) {
                    targetElement.setAttribute('src', panelState.visualAssetSourceURL);
                    targetElement.setAttribute('width', panelState.visualAssetWidth);
                    targetElement.setAttribute('height', panelState.visualAssetHeight);
                    // Other visual attributes (alt, border, hspace, vspace) would be applied here
                }
            } else if (targetStage === assetModelConstants.HYPERLINK_ELEMENT) {
                if (targetElement) {
                    // Apply hyperlink attributes (e.g., href, target) from panelState
                }
            } else if (targetStage === assetModelConstants.PREVIEW_DISPLAY) {
                if (targetElement) {
                    targetElement.setAttribute('src', panelState.visualAssetSourceURL);
                    targetElement.setAttribute('width', panelState.visualAssetWidth);
                    targetElement.setAttribute('height', panelState.visualAssetHeight);
                }
            } else if (targetStage === assetModelConstants.CLEANUP_PROCESS) {
                if (targetElement) {
                    targetElement.removeAttribute('src');
                    targetElement.setStyle('display', 'none');
                }
            }
        };

        const propagateInternalChanges = (impactedFields) => {
            if (currentOperationEpoch > 0) return;

            currentOperationEpoch++;

            const currentVisual = panelState.primaryVisualComponent;
            if (currentVisual) {
                // Commit changes from the field that triggered propagation to the visual component
                // (e.g., a 'border' field change would update the style attribute)
                applyPanelStateToElements(assetModelConstants.VISUAL_ASSET, currentVisual);

                // Simulate 'setup' for other impacted fields, reading back from the element
                impactedFields.forEach(fieldPath => {
                    // In a real system, this would retrieve a field object and call its setup method.
                    // For this clone, we assume the `applyPanelStateToElements` handles the commit.
                    // The 'setup' part (reading from element back to dialog) is mostly done on panel display.
                });
            }
            currentOperationEpoch = 0;
        };

        // --- Panel Lifecycle Methods ---
        const preparePanelForDisplay = () => {
            // Reset panel state to defaults
            Object.assign(panelState, {
                primaryVisualComponent: null,
                associatedHyperlink: null,
                isPrimaryVisualPresent: false,
                isHyperlinkPresent: false,
                dimensionsLinked: true,
                preventDimensionReset: false,
                initialLoadNotCompleted: true,
                shouldAddHyperlink: false,
                originalVisualReference: null,
                visualAidElement: null,
                temporaryVisualComponent: null,
                visualAssetSourceURL: '',
                visualAssetWidth: '',
                visualAssetHeight: '',
                inlineStyleText: ''
            });

            // Hide loader element
            retrieveDOMProxy(assetLoadIndicatorId).setStyle('display', 'none');

            // Initialize mock preview element
            const assetPreloader = editorContext.createDocumentElement('img'); // Corresponds to previewPreloader
            panelState.visualAidElement = retrieveDOMProxy(assetPreviewImageId);

            // Create a buffer for the original visual element
            panelState.originalVisualReference = editorContext.createDocumentElement('img');
            panelState.originalVisualReference.setAttribute('alt', '');
            panelState.originalVisualReference.setCustomProperty('isReady', 'false'); // Not loaded initially

            const currentSelection = editorContext.acquireSelection().retrieveSelectedVisual();
            let parentLinkProxy = null;

            // Simulate detection of existing link/image based on selection
            if (currentSelection && currentSelection.getName() === 'img') {
                // Mock: assume an image is selected, and it might be wrapped in a link.
                // In a real editor, this would involve DOM traversal.
                const mockLinkWrapper = {
                    _name: 'a',
                    _children: [currentSelection],
                    getName: () => 'a',
                    getAttribute: (attr) => (attr === 'href' ? 'mock_destination.html' : null),
                    getChildren: () => ({ count: () => 1, getItem: () => currentSelection })
                };
                parentLinkProxy = mockLinkWrapper;
            }

            if (parentLinkProxy) {
                panelState.associatedHyperlink = parentLinkProxy;
                panelState.isHyperlinkPresent = true;

                const linkChildren = parentLinkProxy.getChildren();
                if (linkChildren.count() === 1) {
                    const childElement = linkChildren.getItem(0);
                    const childName = childElement.getName();
                    if (childName === 'img' || (childName === 'input' && childElement.getAttribute('type') === 'image')) {
                        panelState.primaryVisualComponent = childElement;
                        panelState.isPrimaryVisualPresent = childName; // Store 'img' or 'input'
                    }
                }
                if (panelVariant === 'image') {
                    // Simulate setup for hyperlink fields
                    // e.g., panelState.linkURL = panelState.associatedHyperlink.getAttribute('href');
                }
            }

            if (currentSelection && (
                (currentSelection.getName() === 'img' && !currentSelection.getAttribute('_cke_realelement')) ||
                (currentSelection.getName() === 'input' && currentSelection.getAttribute('type') === 'image')
            )) {
                panelState.isPrimaryVisualPresent = currentSelection.getName();
                panelState.primaryVisualComponent = currentSelection;
            }

            if (panelState.isPrimaryVisualPresent) {
                // Clone the existing element for temporary modifications
                panelState.temporaryVisualComponent = panelState.primaryVisualComponent.clone();
                panelState.primaryVisualComponent = panelState.temporaryVisualComponent;

                // Simulate setupContent for VISUAL_ASSET
                panelState.visualAssetSourceURL = panelState.primaryVisualComponent.getAttribute('src') || '';
                panelState.visualAssetWidth = panelState.primaryVisualComponent.getAttribute('width') || panelState.primaryVisualComponent.getStyle('width') || '';
                panelState.visualAssetHeight = panelState.primaryVisualComponent.getAttribute('height') || panelState.primaryVisualComponent.getStyle('height') || '';
                // Setup other fields from panelState.primaryVisualComponent

                updateDimensionLinkState(true); // Check and set initial lock ratio
            } else {
                panelState.primaryVisualComponent = editorContext.createDocumentElement('img');
            }

            // Hide preview if no initial URL
            if (!processStringNormalization(panelState.visualAssetSourceURL)) {
                panelState.visualAidElement.removeAttribute('src');
                panelState.visualAidElement.setStyle('display', 'none');
            }

            // Attach listeners to the original visual reference for loading status
            panelState.originalVisualReference.addPropertyListener('load', handleAssetLoadSuccess.bind(panelState));
            panelState.originalVisualReference.addPropertyListener('error', handleAssetLoadFailure.bind(panelState));
            panelState.originalVisualReference.addPropertyListener('abort', handleAssetLoadFailure.bind(panelState));
            // Simulate initial load for the original image to get its true dimensions
            // For a clone, we might hardcode or mock these for initial state.
            panelState.originalVisualReference.width = 200;
            panelState.originalVisualReference.height = 150;
            panelState.originalVisualReference.setCustomProperty('isReady', 'true'); // Assume loaded for initial state
        };

        const finalizePanelModifications = () => {
            let finalVisualElement = panelState.primaryVisualComponent;

            // Handle switching between 'img' and 'input type=image'
            if (panelState.isPrimaryVisualPresent) {
                const currentElementType = panelState.isPrimaryVisualPresent;
                if (panelVariant === 'image' && currentElementType === 'input' && requestUserConfirmation(editorContext._lang.asset.buttonToImageConfirm)) {
                    finalVisualElement = editorContext.createDocumentElement('img');
                    finalVisualElement.setAttribute('alt', '');
                    editorContext.insertComponent(finalVisualElement); // Replace existing in editor
                } else if (panelVariant !== 'image' && currentElementType === 'img' && requestUserConfirmation(editorContext._lang.asset.imageToButtonConfirm)) {
                    finalVisualElement = editorContext.createDocumentElement('input');
                    finalVisualElement.setAttributes({ type: 'image', alt: '' });
                    editorContext.insertComponent(finalVisualElement); // Replace existing in editor
                } else {
                    finalVisualElement = panelState.temporaryVisualComponent; // Restore original for final commit
                    panelState.temporaryVisualComponent = null; // Clear temp reference
                }
            } else { // Creating a new visual component
                if (panelVariant === 'image') {
                    finalVisualElement = editorContext.createDocumentElement('img');
                } else {
                    finalVisualElement = editorContext.createDocumentElement('input');
                    finalVisualElement.setAttribute('type', 'image');
                }
                finalVisualElement.setAttribute('alt', '');
            }

            // Handle hyperlink creation/modification
            let finalHyperlink = panelState.associatedHyperlink;
            if (!panelState.isHyperlinkPresent) {
                finalHyperlink = editorContext.createDocumentElement('a');
            }

            // Apply all current panelState values to the final elements
            applyPanelStateToElements(assetModelConstants.VISUAL_ASSET, finalVisualElement);
            applyPanelStateToElements(assetModelConstants.HYPERLINK_ELEMENT, finalHyperlink);

            // Remove empty style attribute (simplified)
            if (!finalVisualElement.getAttribute('style')) {
                finalVisualElement.removeAttribute('style');
            }

            // Insertion/replacement logic into the editor
            if (!panelState.isPrimaryVisualPresent) { // New visual component
                if (panelState.shouldAddHyperlink) {
                    if (!panelState.isHyperlinkPresent) {
                        editorContext.insertComponent(finalHyperlink);
                        finalHyperlink.append(finalVisualElement, false);
                    } else {
                        // Link exists, but image is new and goes inside it.
                        // This implies editorContext.insertComponent handles insertion into selection/parent.
                        editorContext.insertComponent(finalVisualElement);
                    }
                } else {
                    editorContext.insertComponent(finalVisualElement);
                }
            } else { // Existing visual component
                if (!panelState.isHyperlinkPresent && panelState.shouldAddHyperlink) {
                    editorContext.insertComponent(finalHyperlink);
                    finalVisualElement.appendTo(finalHyperlink);
                } else if (panelState.isHyperlinkPresent && !panelState.shouldAddHyperlink) {
                    editorContext.acquireSelection().selectComponent(finalHyperlink); // Select link for replacement
                    editorContext.insertComponent(finalVisualElement); // Replace link with image
                }
            }
        };

        const setupPanelComponents = () => {
            if (panelVariant !== 'image') {
                // Simulate hiding 'Link' tab
                // console.log("Simulating: Hiding 'Link' tab");
            }
            // Simulate adding focusable elements (no-op for a pure JS clone)
        };

        const releasePanelResources = () => {
            if (panelState.visualAidElement) {
                applyPanelStateToElements(assetModelConstants.CLEANUP_PROCESS, panelState.visualAidElement);
            }

            if (panelState.originalVisualReference) {
                panelState.originalVisualReference.removePropertyListeners('load', handleAssetLoadSuccess);
                panelState.originalVisualReference.removePropertyListeners('error', handleAssetLoadFailure);
                panelState.originalVisualReference.removePropertyListeners('abort', handleAssetLoadFailure);
                // Simulate removal from DOM
                panelState.originalVisualReference = null;
            }
            panelState.primaryVisualComponent = null; // Clear reference
        };

        // --- Public Panel Definition (mimicking CKEditor dialog structure) ---
        return {
            displayTitle: (panelVariant === 'image') ? editorContext._lang.asset.titleImage : editorContext._lang.asset.titleButton,
            minimumWidth: 420,
            minimumHeight: 310,
            onPanelDisplay: preparePanelForDisplay,
            onPanelConfirm: finalizePanelModifications,
            onPanelLoad: setupPanelComponents,
            onPanelDismiss: releasePanelResources,

            // Simulated dialog tabs and elements
            panelTabs: [
                {
                    tabIdentifier: 'visualInfo',
                    tabLabel: editorContext._lang.asset.infoTab,
                    accessKey: 'I',
                    tabElements: [
                        {
                            elementType: 'verticalBox',
                            padding: 0,
                            children: [
                                {
                                    elementType: 'horizontalBox',
                                    widths: ['280px', '110px'],
                                    alignment: 'right',
                                    children: [
                                        {
                                            fieldId: 'visualAssetSourceURL',
                                            elementType: 'textInput',
                                            label: editorContext._lang.general.source,
                                            isRequired: true,
                                            onValueChange: (newValue) => {
                                                panelState.visualAssetSourceURL = newValue;
                                                refreshVisualPreview();
                                                // Trigger original asset load logic for mock object
                                                if (panelState.originalVisualReference) {
                                                    panelState.originalVisualReference.setAttribute('src', newValue);
                                                    if (newValue) {
                                                        retrieveDOMProxy(assetLoadIndicatorId).setStyle('display', 'block');
                                                        // For Type IV, assume immediate load success for simplicity
                                                        panelState.originalVisualReference.width = 250; // Mock dimensions
                                                        panelState.originalVisualReference.height = 180;
                                                        handleAssetLoadSuccess.call(panelState);
                                                    } else {
                                                        handleAssetLoadFailure.call(panelState);
                                                    }
                                                }
                                            },
                                            getCurrentValue: () => panelState.visualAssetSourceURL
                                        },
                                        {
                                            fieldId: 'widthFieldInput',
                                            elementType: 'textInput',
                                            label: 'Total Width',
                                            onValueChange: (newValue) => adjustOppositeDimension('widthFieldInput', newValue),
                                            getCurrentValue: () => panelState.visualAssetWidth
                                        },
                                        {
                                            fieldId: 'heightFieldInput',
                                            elementType: 'textInput',
                                            label: 'Total Height',
                                            onValueChange: (newValue) => adjustOppositeDimension('heightFieldInput', newValue),
                                            getCurrentValue: () => panelState.visualAssetHeight
                                        },
                                        {
                                            fieldId: 'dimensionLinkControl',
                                            elementType: 'buttonControl',
                                            label: 'Toggle Link',
                                            onClick: () => updateDimensionLinkState()
                                        },
                                        {
                                            fieldId: 'dimensionResetControl',
                                            elementType: 'buttonControl',
                                            label: 'Reset Dimensions',
                                            onClick: restoreInitialAssetDimensions
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                }
                // Other tabs like 'Link' and 'Advanced' would be defined here
            ]
        };
    };

    // Mock CKEditor-like objects for the clone to operate on,
    // reflecting the external environment the original code expects.
    const mockEditorContext = {
        _lang: {
            asset: {
                titleImage: 'Visual Asset Properties',
                titleButton: 'Interactive Button Properties',
                lockRatio: 'Enable Aspect Link',
                unlockRatio: 'Disable Aspect Link',
                buttonToImageConfirm: 'Convert interactive button to a static visual?',
                imageToButtonConfirm: 'Convert static visual to an interactive button?',
                infoTab: 'Asset Information'
            },
            general: {
                source: 'Source Location'
            }
        },
        acquireSelection: () => ({
            retrieveSelectedVisual: () => {
                // Mock: Simulate no selection for new image, or a basic image for editing.
                // For a more comprehensive clone, this would mimic various selection states.
                return null; // For simulating new image creation
            },
            selectComponent: (comp) => { /* console.log('Mock Editor: Component selected:', comp); */ }
        }),
        insertComponent: (component) => { /* console.log('Mock Editor: Component inserted:', component); */ },
        skinPath: 'mock/path/to/skin/',
        createDocumentElement: (tag) => {
            return {
                _name: tag,
                _attributes: {},
                _styles: {},
                setAttribute: function (attr, val) { this._attributes[attr] = val; },
                getAttribute: function (attr) { return this._attributes[attr]; },
                setAttributes: function (attrs) { Object.assign(this._attributes, attrs); },
                getStyle: function (style) { return this._styles[style]; },
                setStyle: function (style, val) { this._styles[style] = val; },
                appendTo: function (parent) { parent._children = parent._children || []; parent._children.push(this); },
                append: function (child, front) { this._children = this._children || []; if (front) this._children.unshift(child); else this._children.push(child); },
                getName: function () { return this._name; },
                _customData: {},
                setCustomProperty: function (key, val) { this._customData[key] = val; },
                getCustomProperty: function (key) { return this._customData[key]; },
                removePropertyListeners: (event, handler) => { /* console.log(`Mock Element: Removed listener for ${event} on ${this._name}`); */ },
                addPropertyListener: (event, handler) => { /* console.log(`Mock Element: Added listener for ${event} on ${this._name}`); */ },
                removeAttribute: function(attr) { delete this._attributes[attr]; }
            };
        },
        getURLforAsset: (path) => `mock_base_url/${path}`,
        confirm: (msg) => true, // Always confirm for cloning purposes
        getDOMObjectById: (id) => ({
            _id: id,
            _styles: {},
            setAttribute: function (attr, val) { /* console.log(`Mock DOM Element (${this._id}): Set attribute '${attr}' to '${val}'`); */ },
            setStyle: function (style, val) { this._styles[style] = val; /* console.log(`Mock DOM Element (${this._id}): Set style '${style}' to '${val}'`); */ },
            addClass: function (cls) { /* console.log(`Mock DOM Element (${this._id}): Added class '${cls}'`); */ },
            removeClass: function (cls) { /* console.log(`Mock DOM Element (${this._id}): Removed class '${cls}'`); */ },
            getFirst: function () { return { setText: (txt) => { /* console.log(`Mock DOM Element (${this._id}): First child set text to '${txt}'`); */ } }; }
        }),
        _nextIdCounter: 0,
        generateSequentialId: (prefix) => `${prefix}_${mockEditorContext._nextIdCounter++}`
    };

    // This line simulates the registration of the dialog definition
    // with a hypothetical dialog management system, similar to CKEDITOR.dialog.add.
    // For a Type IV clone, we just need the definition object to be generated.
    const assetPropertiesPanelDefinition = assetPanelFactory(mockEditorContext, 'image');

    // The original code uses an IIFE to encapsulate its definition.
    // The generated code maintains this structure.
})();