(function(gridHostElement){
    // New global-like manager to store configurations and state for various grid modules
    const universalGridModuleRegistry = new Map();

    // Reimplementation of jqGrid search functionality as a Type IV clone
    function establishGridSearchFunctionality(targetGridComponent, searchModuleSettings) {
        const activeGridInstance = targetGridComponent;
        if (!activeGridInstance || !activeGridInstance.grid) { return; } // Ensure a valid grid instance

        // Define comprehensive default settings, distinct from original `p`
        const defaultSearchModuleConfiguration = {
            rebuildInterface: false,
            allowWindowDragging: true,
            targetFieldName: 'searchField',
            targetValueName: 'searchString',
            targetOperationName: 'searchOper',
            targetFilterDataName: 'filters',
            loadInitialFilterState: true,
            beforeSearchWindowDisplay: null,
            afterSearchWindowDisplay: null,
            onSearchModuleInitialization: null,
            afterFilterStructureRedraw: null,
            autoCloseOnSearch: false,
            autoCloseOnReset: false,
            enableEscapeToClose: false,
            allowMultipleCriteria: false,
            allowGroupedCriteria: false,
            initialWindowTop: 0,
            initialWindowLeft: 0,
            useJQueryModalEmulation: true,
            isTrulyBlocking: false,
            enableWindowResizing: true,
            windowWidth: 450,
            windowHeight: 'auto',
            contentDataHeight: 'auto',
            showGeneratedQueryString: false,
            performInputValidation: true,
            supportedOperators: null, // Mapped from sopt
            outputFiltersAsString: undefined,
            onWindowClose: null,
            onSearchTriggered: null,
            onFilterStateCleared: null,
            bringWindowToFront: true,
            modalOverlayOpacity: 30,
            selectableColumns: [], // Mapped from columns
            templateOptionLabels: null,
            templateFilterObjects: null,
            templateSelectionLabel: ' Template: ',
            displayOnLoad: false,
            attachToLayer: null,
            // Custom translation strings, distinct from jqGrid.search
            searchActionText: 'Search',
            resetActionText: 'Reset',
            queryViewText: 'Query',
            logicalAndText: 'AND',
            logicalOrText: 'OR',
            ruleEntryText: 'Rule',
            groupEntryText: 'Group',
            addRuleButtonText: 'Add Rule',
            addGroupButtonText: 'Add Group',
            deleteRuleButtonText: 'Delete Rule',
            deleteGroupButtonText: 'Delete Group',
            operatorDefinitions: [ // Comprehensive operator list
                { op: 'eq', text: 'equals' }, { op: 'ne', text: 'not equals' },
                { op: 'lt', text: 'less than' }, { op: 'le', text: 'less or equal' },
                { op: 'gt', text: 'greater than' }, { op: 'ge', text: 'greater or equal' },
                { op: 'bw', text: 'begins with' }, { op: 'bn', text: 'does not begin with' },
                { op: 'in', text: 'is in' }, { op: 'ni', text: 'is not in' },
                { op: 'ew', text: 'ends with' }, { op: 'en', text: 'does not end with' },
                { op: 'cn', text: 'contains' }, { op: 'nc', text: 'does not contain' }
            ]
        };

        const currentSettings = { ...defaultSearchModuleConfiguration, ...(activeGridInstance.p.search || {}), ...searchModuleSettings };

        const modalSuffix = `searchModal_${activeGridInstance.p.id}`;
        const modalDomIds = {
            mainDialog: `dialogContainer_${modalSuffix}`,
            dialogHeader: `dialogTitle_${modalSuffix}`,
            dialogContent: `dialogBody_${modalSuffix}`,
            scrollableContent: `scrollArea_${modalSuffix}`
        };

        let currentFilterPayload = activeGridInstance.p.postData[currentSettings.targetFilterDataName];
        if (typeof currentFilterPayload === "string") {
            try {
                currentFilterPayload = JSON.parse(currentFilterPayload);
            } catch (e) {
                currentFilterPayload = null;
            }
        }

        if (currentSettings.rebuildInterface) {
            document.getElementById(modalDomIds.mainDialog)?.remove();
        }

        // Generic modal utility for Type IV clone
        function displayModal(modalId, opts) {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) return;

            let backdrop = document.getElementById('modalBackdrop');
            if (!backdrop) {
                backdrop = document.createElement('div');
                backdrop.id = 'modalBackdrop';
                Object.assign(backdrop.style, {
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: `rgba(0,0,0,${opts.modalOverlayOpacity / 100})`,
                    zIndex: 1000, display: 'none'
                });
                document.body.appendChild(backdrop);
            }
            backdrop.style.display = 'block';

            modalElement.style.display = 'block';
            modalElement.style.zIndex = 1001;
            modalElement.style.position = 'fixed';
            modalElement.style.left = '50%';
            modalElement.style.top = '50%';
            modalElement.style.transform = 'translate(-50%, -50%)';
            modalElement.style.width = `${opts.windowWidth}px`;
            modalElement.style.height = opts.windowHeight;
            modalElement.style.overflow = 'auto';
            modalElement.style.backgroundColor = '#fff';
            modalElement.style.border = '1px solid #ccc';
            modalElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';

            if (opts.bringWindowToFront) { /* Further z-index management if multiple modals */ }
        }

        function concealModal(modalId, opts) {
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                modalElement.style.display = 'none';
            }
            const backdrop = document.getElementById('modalBackdrop');
            if (backdrop) {
                backdrop.style.display = 'none';
            }
            if (opts.onWindowClose && typeof opts.onWindowClose === 'function') {
                opts.onWindowClose();
            }
        }

        function showSearchWindow() {
            let proceedWithDisplay = true;
            const searchUIElement = document.getElementById(modalSuffix);
            if (currentSettings.beforeSearchWindowDisplay && typeof currentSettings.beforeSearchWindowDisplay === 'function') {
                proceedWithDisplay = currentSettings.beforeSearchWindowDisplay(searchUIElement);
                if (typeof proceedWithDisplay === "undefined") {
                    proceedWithDisplay = true;
                }
            }
            if (proceedWithDisplay) {
                displayModal(modalDomIds.mainDialog, currentSettings);
                if (currentSettings.afterSearchWindowDisplay && typeof currentSettings.afterSearchWindowDisplay === 'function') {
                    currentSettings.afterSearchWindowDisplay(searchUIElement);
                }
            }
        }

        // --- Core Filter Builder Logic (Type IV jqFilter replacement) ---
        class FilterCriterion {
            constructor(field, op, value, availableColumns, availableOperators) {
                this.field = field;
                this.op = op;
                this.value = value;
                this.columnOptions = availableColumns;
                this.operatorOptions = availableOperators;
                this.domElement = this.createCriterionElement();
            }

            createCriterionElement() {
                const criterionDiv = document.createElement('div');
                criterionDiv.className = 'filter-criterion-entry';
                Object.assign(criterionDiv.style, { display: 'flex', alignItems: 'center', marginBottom: '5px' });

                const fieldSelector = document.createElement('select');
                fieldSelector.className = 'criterion-field-selector';
                this.columnOptions.forEach(col => {
                    if (col.searchable) {
                        const opt = document.createElement('option');
                        opt.value = col.name;
                        opt.textContent = col.label;
                        fieldSelector.appendChild(opt);
                    }
                });
                fieldSelector.value = this.field;
                fieldSelector.addEventListener('change', (e) => this.field = e.target.value);

                const operatorSelector = document.createElement('select');
                operatorSelector.className = 'criterion-operator-selector';
                this.operatorOptions.forEach(opDef => {
                    const opt = document.createElement('option');
                    opt.value = opDef.op;
                    opt.textContent = opDef.text;
                    operatorSelector.appendChild(opt);
                });
                operatorSelector.value = this.op;
                operatorSelector.addEventListener('change', (e) => this.op = e.target.value);

                const valueInput = document.createElement('input');
                valueInput.type = 'text';
                valueInput.className = 'criterion-value-input';
                valueInput.value = this.value;
                valueInput.addEventListener('input', (e) => this.value = e.target.value);

                const deleteButton = document.createElement('button');
                deleteButton.textContent = currentSettings.deleteRuleButtonText;
                deleteButton.className = 'delete-criterion-button';

                criterionDiv.appendChild(fieldSelector);
                criterionDiv.appendChild(operatorSelector);
                criterionDiv.appendChild(valueInput);
                criterionDiv.appendChild(deleteButton);

                return criterionDiv;
            }

            getCriterionData() {
                return { field: this.field, op: this.op, data: this.value };
            }
        }

        class FilterGrouping {
            constructor(logicalOperator, criteria, subGroups, columns, operators, moduleConfig) {
                this.logicalOperator = logicalOperator; // 'AND' or 'OR'
                this.criteria = criteria || []; // Array of FilterCriterion instances
                this.subGroups = subGroups || []; // Array of FilterGrouping instances
                this.columnOptions = columns;
                this.operatorOptions = operators;
                this.moduleConfig = moduleConfig;
                this.domElement = this.createGroupingElement();
            }

            createGroupingElement() {
                const groupDiv = document.createElement('div');
                groupDiv.className = 'filter-grouping-section';
                Object.assign(groupDiv.style, { border: '1px solid #eee', margin: '8px', padding: '8px', borderRadius: '4px' });

                const operatorSelect = document.createElement('select');
                operatorSelect.className = 'grouping-operator-selector';
                const andOpt = document.createElement('option');
                andOpt.value = 'AND';
                andOpt.textContent = this.moduleConfig.logicalAndText;
                const orOpt = document.createElement('option');
                orOpt.value = 'OR';
                orOpt.textContent = this.moduleConfig.logicalOrText;
                operatorSelect.appendChild(andOpt);
                operatorSelect.appendChild(orOpt);
                operatorSelect.value = this.logicalOperator;
                operatorSelect.addEventListener('change', (e) => this.logicalOperator = e.target.value);

                const addCriterionBtn = document.createElement('button');
                addCriterionBtn.textContent = this.moduleConfig.addRuleButtonText;
                addCriterionBtn.addEventListener('click', () => this.addCriterion());

                const addSubGroupBtn = document.createElement('button');
                addSubGroupBtn.textContent = this.moduleConfig.addGroupButtonText;
                addSubGroupBtn.style.display = this.moduleConfig.allowGroupedCriteria ? 'inline-block' : 'none';
                addSubGroupBtn.addEventListener('click', () => this.addSubGrouping());

                const deleteGroupBtn = document.createElement('button');
                deleteGroupBtn.textContent = this.moduleConfig.deleteGroupButtonText;
                deleteGroupBtn.className = 'delete-grouping-button';

                const groupControls = document.createElement('div');
                Object.assign(groupControls.style, { marginBottom: '10px' });
                groupControls.appendChild(operatorSelect);
                groupControls.appendChild(addCriterionBtn);
                groupControls.appendChild(addSubGroupBtn);
                groupControls.appendChild(deleteGroupBtn);
                groupDiv.appendChild(groupControls);

                this.criteriaContainer = document.createElement('div');
                this.criteriaContainer.className = 'criteria-list-container';
                groupDiv.appendChild(this.criteriaContainer);

                this.subGroupsContainer = document.createElement('div');
                this.subGroupsContainer.className = 'subgroups-list-container';
                groupDiv.appendChild(this.subGroupsContainer);

                this.criteria.forEach(criterion => this.addCriterionElement(criterion));
                this.subGroups.forEach(subGroup => this.addSubGroupingElement(subGroup));

                return groupDiv;
            }

            addCriterion(initialCriterion = null) {
                const defaultField = this.columnOptions.find(c => c.searchable)?.name || '';
                const defaultOp = this.moduleConfig.operatorDefinitions[0]?.op || 'eq';
                const newCriterion = new FilterCriterion(
                    initialCriterion ? initialCriterion.field : defaultField,
                    initialCriterion ? initialCriterion.op : defaultOp,
                    initialCriterion ? initialCriterion.data : '',
                    this.columnOptions,
                    this.operatorOptions
                );
                this.criteria.push(newCriterion);
                this.addCriterionElement(newCriterion);
            }

            addCriterionElement(criterionInstance) {
                this.criteriaContainer.appendChild(criterionInstance.domElement);
                criterionInstance.domElement.querySelector('.delete-criterion-button').addEventListener('click', () => {
                    this.removeCriterion(criterionInstance);
                });
            }

            removeCriterion(criterionInstance) {
                this.criteria = this.criteria.filter(c => c !== criterionInstance);
                criterionInstance.domElement.remove();
            }

            addSubGrouping(initialGroup = null) {
                const newGroup = new FilterGrouping(
                    initialGroup ? initialGroup.groupOp : 'AND',
                    initialGroup ? initialGroup.rules : [],
                    initialGroup ? initialGroup.groups : [],
                    this.columnOptions,
                    this.operatorOptions,
                    this.moduleConfig
                );
                this.subGroups.push(newGroup);
                this.addSubGroupingElement(newGroup);
            }

            addSubGroupingElement(groupInstance) {
                this.subGroupsContainer.appendChild(groupInstance.domElement);
                groupInstance.domElement.querySelector('.delete-grouping-button').addEventListener('click', () => {
                    this.removeSubGrouping(groupInstance);
                });
            }

            removeSubGrouping(groupInstance) {
                this.subGroups = this.subGroups.filter(g => g !== groupInstance);
                groupInstance.domElement.remove();
            }

            getGroupingData() {
                return {
                    groupOp: this.logicalOperator,
                    rules: this.criteria.map(c => c.getCriterionData()),
                    groups: this.subGroups.map(g => g.getGroupingData())
                };
            }

            resetToDefaultState() {
                this.criteria = [];
                this.subGroups = [];
                this.criteriaContainer.innerHTML = '';
                this.subGroupsContainer.innerHTML = '';
                this.logicalOperator = 'AND';
                this.addCriterion();
            }

            populateFromFilterObject(filterObject) {
                this.criteria = [];
                this.subGroups = [];
                this.criteriaContainer.innerHTML = '';
                this.subGroupsContainer.innerHTML = '';
                this.logicalOperator = filterObject.groupOp || 'AND';
                if (filterObject.rules && filterObject.rules.length) {
                    filterObject.rules.forEach(rule => this.addCriterion(rule));
                }
                if (filterObject.groups && filterObject.groups.length && this.moduleConfig.allowGroupedCriteria) {
                    filterObject.groups.forEach(group => this.addSubGrouping(group));
                }
                if (!filterObject.rules?.length && !filterObject.groups?.length) {
                    this.addCriterion();
                }
            }
        }

        // --- Main Search UI Construction ---
        if (document.getElementById(modalDomIds.mainDialog)) {
            showSearchWindow();
        } else {
            const searchPanelWrapper = document.createElement('div');
            searchPanelWrapper.id = modalDomIds.mainDialog;
            searchPanelWrapper.className = 'grid-search-panel';
            Object.assign(searchPanelWrapper.style, { display: 'none', padding: '10px', borderRadius: '4px' });

            const filterContentArea = document.createElement('div');
            filterContentArea.id = modalSuffix;
            filterContentArea.className = 'searchCriteriaBuilder';
            Object.assign(filterContentArea.style, { overflow: 'auto', maxHeight: 'calc(100% - 60px)' });

            if (currentSettings.onSearchModuleInitialization && typeof currentSettings.onSearchModuleInitialization === 'function') {
                currentSettings.onSearchModuleInitialization(filterContentArea);
            }

            const processedColumns = activeGridInstance.p.colModel.map((col, idx) => ({
                name: col.name,
                label: col.label || activeGridInstance.p.colNames[idx],
                searchable: (typeof col.search === 'undefined') ? true : col.search,
                hidden: col.hidden === true,
                searchoptions: col.searchoptions || {}
            }));

            let defaultColumnName, defaultColumnIdx = -1;
            let foundDefault = false;
            if (!currentSettings.selectableColumns.length) {
                processedColumns.forEach((col, idx) => {
                    if (!foundDefault) {
                        const isSearchable = col.searchable;
                        const isHidden = col.hidden;
                        const ignoreHidden = (col.searchoptions && col.searchoptions.searchhidden === true);
                        if ((ignoreHidden && isSearchable) || (isSearchable && !isHidden)) {
                            foundDefault = true;
                            defaultColumnName = col.name;
                            defaultColumnIdx = idx;
                        }
                    }
                });
            } else {
                const namesFromConfig = new Set(currentSettings.selectableColumns.map(c => c.name));
                processedColumns = processedColumns.filter(col => namesFromConfig.has(col.name));
            }

            let initialFilterStructure = null;
            if (currentSettings.loadInitialFilterState && currentFilterPayload) {
                initialFilterStructure = currentFilterPayload;
            } else if (!currentFilterPayload && defaultColumnName && !currentSettings.allowMultipleCriteria) {
                const defaultOp = (defaultColumnIdx >= 0 && processedColumns[defaultColumnIdx].searchoptions && processedColumns[defaultColumnIdx].searchoptions.sopt)
                                ? processedColumns[defaultColumnIdx].searchoptions.sopt[0]
                                : (currentSettings.supportedOperators && currentSettings.supportedOperators.length ? currentSettings.supportedOperators[0] : 'eq');
                initialFilterStructure = { "groupOp": "AND", "rules": [{ "field": defaultColumnName, "op": defaultOp, "data": "" }] };
            } else if (currentSettings.allowMultipleCriteria) {
                initialFilterStructure = { "groupOp": "AND", "rules": [] };
            }

            const rootFilterGrouping = new FilterGrouping(
                initialFilterStructure?.groupOp || 'AND',
                initialFilterStructure?.rules || [],
                initialFilterStructure?.groups || [],
                processedColumns,
                currentSettings.operatorDefinitions,
                currentSettings
            );
            filterContentArea.appendChild(rootFilterGrouping.domElement);
            if (!initialFilterStructure?.rules?.length && !initialFilterStructure?.groups?.length) {
                rootFilterGrouping.addCriterion();
            }

            const controlButtonsArea = document.createElement('div');
            controlButtonsArea.className = 'dialog-control-buttons';
            Object.assign(controlButtonsArea.style, {
                marginTop: '10px',
                borderTop: '1px solid #ccc',
                paddingTop: '5px',
                display: 'flex',
                justifyContent: activeGridInstance.p.direction === "rtl" ? 'flex-end' : 'flex-start'
            });

            const leftControlSection = document.createElement('div');
            leftControlSection.style.textAlign = activeGridInstance.p.direction === "rtl" ? 'right' : 'left';
            controlButtonsArea.appendChild(leftControlSection);

            const rightControlSection = document.createElement('div');
            rightControlSection.style.marginLeft = 'auto';
            controlButtonsArea.appendChild(rightControlSection);

            const clearFilterButton = document.createElement('button');
            clearFilterButton.id = `${modalSuffix}_clearBtn`;
            clearFilterButton.textContent = currentSettings.resetActionText;
            leftControlSection.appendChild(clearFilterButton);

            let templateDropdown = null;
            if (currentSettings.templateOptionLabels && currentSettings.templateOptionLabels.length) {
                const templateLabelSpan = document.createElement('span');
                templateLabelSpan.textContent = currentSettings.templateSelectionLabel;
                templateLabelSpan.style.marginRight = '5px';
                leftControlSection.appendChild(templateLabelSpan);

                templateDropdown = document.createElement('select');
                templateDropdown.className = 'template-choice-dropdown';
                const defaultTemplateOpt = document.createElement('option');
                defaultTemplateOpt.value = 'default';
                defaultTemplateOpt.textContent = 'Default';
                templateDropdown.appendChild(defaultTemplateOpt);

                currentSettings.templateOptionLabels.forEach((name, idx) => {
                    const opt = document.createElement('option');
                    opt.value = idx.toString();
                    opt.textContent = name;
                    templateDropdown.appendChild(opt);
                });
                leftControlSection.appendChild(templateDropdown);

                templateDropdown.addEventListener('change', (e) => {
                    const selectedIdx = e.target.value;
                    if (selectedIdx === 'default') {
                        rootFilterGrouping.populateFromFilterObject(initialFilterStructure || { groupOp: "AND", rules: [] });
                    } else {
                        const templateData = currentSettings.templateFilterObjects[parseInt(selectedIdx, 10)];
                        if (templateData) {
                            rootFilterGrouping.populateFromFilterObject(templateData);
                        }
                    }
                });
            }

            let queryResultDisplay = null;
            if (currentSettings.showGeneratedQueryString) {
                const queryToggleBtn = document.createElement('button');
                queryToggleBtn.id = `${modalSuffix}_queryToggleBtn`;
                queryToggleBtn.textContent = currentSettings.queryViewText;
                rightControlSection.appendChild(queryToggleBtn);

                queryResultDisplay = document.createElement('pre');
                queryResultDisplay.className = 'query-output-panel';
                Object.assign(queryResultDisplay.style, { display: 'none', border: '1px solid #ddd', padding: '5px', marginTop: '5px', whiteSpace: 'pre-wrap', wordBreak: 'break-all' });
                filterContentArea.appendChild(queryResultDisplay);

                queryToggleBtn.addEventListener('click', () => {
                    queryResultDisplay.style.display = queryResultDisplay.style.display === 'none' ? 'block' : 'none';
                    queryResultDisplay.textContent = JSON.stringify(rootFilterGrouping.getGroupingData(), null, 2);
                });
            }

            const triggerSearchButton = document.createElement('button');
            triggerSearchButton.id = `${modalSuffix}_searchBtn`;
            triggerSearchButton.textContent = currentSettings.searchActionText;
            rightControlSection.appendChild(triggerSearchButton);

            searchPanelWrapper.appendChild(filterContentArea);
            searchPanelWrapper.appendChild(controlButtonsArea);
            document.body.appendChild(searchPanelWrapper);

            triggerSearchButton.addEventListener('click', () => {
                const currentFilterState = rootFilterGrouping.getGroupingData();
                let outputSearchData = {};
                let filterJsonString = null;

                if (currentSettings.performInputValidation) { /* Simplified, original jqFilter has detailed error checking */ }

                if (currentSettings.outputFiltersAsString === true || (currentSettings.outputFiltersAsString === undefined && currentSettings.allowMultipleCriteria)) {
                    filterJsonString = JSON.stringify(currentFilterState);
                    outputSearchData[currentSettings.targetFilterDataName] = filterJsonString;
                    outputSearchData[currentSettings.targetFieldName] = "";
                    outputSearchData[currentSettings.targetValueName] = "";
                    outputSearchData[currentSettings.targetOperationName] = "";
                } else {
                    if (currentFilterState.rules && currentFilterState.rules.length > 0) {
                        const primaryRule = currentFilterState.rules[0];
                        outputSearchData[currentSettings.targetFieldName] = primaryRule.field;
                        outputSearchData[currentSettings.targetValueName] = primaryRule.data;
                        outputSearchData[currentSettings.targetOperationName] = primaryRule.op;
                        outputSearchData[currentSettings.targetFilterDataName] = "";
                    } else {
                        outputSearchData[currentSettings.targetFieldName] = "";
                        outputSearchData[currentSettings.targetValueName] = "";
                        outputSearchData[currentSettings.targetOperationName] = "";
                        outputSearchData[currentSettings.targetFilterDataName] = "";
                    }
                }

                activeGridInstance.p.search = true;
                Object.assign(activeGridInstance.p.postData, outputSearchData);

                if (currentSettings.onSearchTriggered && typeof currentSettings.onSearchTriggered === 'function') {
                    currentSettings.onSearchTriggered();
                }
                activeGridInstance.trigger("reloadGrid", [{ page: 1 }]);

                if (currentSettings.autoCloseOnSearch) {
                    concealModal(modalDomIds.mainDialog, { onWindowClose: currentSettings.onWindowClose });
                }
            });

            clearFilterButton.addEventListener('click', () => {
                let resetSearchData = {};
                activeGridInstance.p.search = false;

                if (currentSettings.allowMultipleCriteria === false) {
                    resetSearchData[currentSettings.targetFieldName] = resetSearchData[currentSettings.targetValueName] = resetSearchData[currentSettings.targetOperationName] = "";
                } else {
                    resetSearchData[currentSettings.targetFilterDataName] = "";
                }
                Object.assign(activeGridInstance.p.postData, resetSearchData);

                rootFilterGrouping.resetToDefaultState();
                if (templateDropdown) {
                    templateDropdown.value = "default";
                }

                if (currentSettings.onFilterStateCleared && typeof currentSettings.onFilterStateCleared === 'function') {
                    currentSettings.onFilterStateCleared();
                }
                activeGridInstance.trigger("reloadGrid", [{ page: 1 }]);
                if (currentSettings.autoCloseOnReset) {
                    concealModal(modalDomIds.mainDialog, { onWindowClose: currentSettings.onWindowClose });
                }
            });

            if (currentSettings.displayOnLoad) {
                showSearchWindow();
            }
        }
    }

    // Reimplementation of jqGrid editGridRow functionality as a Type IV clone
    function manageGridRowEditorModule(targetGridComponent, editorModuleConfiguration) {
        const currentGridInstance = targetGridComponent;
        const gridUniqueId = currentGridInstance.p.id;
        let moduleState = universalGridModuleRegistry.get(gridUniqueId) || {};
        moduleState.rowEditorOptions = {
            dialogInitialTop: 0,
            dialogInitialLeft: 0,
            dialogWidth: 300,
            dialogHeight: 'auto',
            formContentHeight: 'auto',
            isTrulyBlocking: false,
            modalOverlayOpacity: 30,
            allowDialogDragging: true,
            enableDialogResizing: true,
            submissionEndpoint: null,
            submissionMethod: "POST",
            clearFormOnAddSuccess: true,
            closeDialogOnEditSuccess: false,
            reloadGridOnSubmission: true,
            onFormInterfaceSetup: null,
            onRowDataPreparation: null,
    
            onFormDisplayPreHook: null,
            onFormDisplayPostHook: null,
            beforeDataSubmission: null,
            afterDataSubmission: null,
            onClickSubmissionButton: null,
            onAjaxRequestComplete: null,
            onClickNavigationButtons: null,
            afterNavigationButtonsClick: null,
            additionalSubmissionData: {},
            regenerateFormOnOpen: false,
            useJQueryModalEmulation: true,
            enableEscapeKeyClose: false,
            newRowInsertionPosition: "first",
            topStatusBarMessage: '',
            bottomStatusBarMessage: '',
            saveButtonIcons: [],
            closeButtonIcons: [],
            saveKeyboardShortcut: [false, 13],
            navigationKeyboardShortcuts: [false, 38, 40],
            detectChangesOnSubmission: false,
            detectChangesOnUpdate: false,
            _persistedFormValues: {}, // Internal state for change detection
            isSubmissionInProgress: false,
            onDialogClose: null,
            customAjaxSettings: {},
            dataSerializationFunction: null,
            showPagerControls: true,
            addRecordCaption: 'Add New Record',
            editRecordCaption: 'Edit Record',
            cancelButtonCaption: 'Cancel',
            saveButtonCaption: 'Save',
            nextButtonCaption: 'Next',
            previousButtonCaption: 'Previous'
        };
        Object.assign(moduleState.rowEditorOptions, currentGridInstance.p.edit || {}, editorModuleConfiguration);
        universalGridModuleRegistry.set(gridUniqueId, moduleState);

        // This function will be returned and called for specific row actions
        return function(recordIdentifierToEdit) {
            if (!currentGridInstance.grid || !recordIdentifierToEdit) { return; }

            const moduleConfig = moduleState.rowEditorOptions;
            const formDialogBaseId = `recordEditor_${gridUniqueId}`;
            const formTableBaseId = `editorFormTable_${gridUniqueId}`;
            const modalElementIdentifiers = {
                mainDialog: `dialogContainer_${formDialogBaseId}`,
                dialogHeader: `dialogTitle_${formDialogBaseId}`,
                dialogContent: `dialogBody_${formDialogBaseId}`,
                scrollableContent: formDialogBaseId
            };

            let isNewEntryOperation = (recordIdentifierToEdit === "new");
            let activeRecordId = isNewEntryOperation ? "_empty" : recordIdentifierToEdit;
            moduleConfig.currentDialogCaption = isNewEntryOperation ? moduleConfig.addRecordCaption : moduleConfig.editRecordCaption;

            if (moduleConfig.regenerateFormOnOpen && document.getElementById(modalElementIdentifiers.mainDialog)) {
                document.getElementById(modalElementIdentifiers.mainDialog).remove();
            }

            // Reusing/adapting modal display from search module (or define locally for independence)
            function showEditorModal(modalId, opts) {
                const modalElement = document.getElementById(modalId);
                if (!modalElement) return;

                let backdrop = document.getElementById('editorModalBackdrop');
                if (!backdrop) {
                    backdrop = document.createElement('div');
                    backdrop.id = 'editorModalBackdrop';
                    Object.assign(backdrop.style, {
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        backgroundColor: `rgba(0,0,0,${opts.modalOverlayOpacity / 100})`,
                        zIndex: 1000, display: 'none'
                    });
                    document.body.appendChild(backdrop);
                }
                backdrop.style.display = 'block';

                modalElement.style.display = 'block';
                modalElement.style.zIndex = 1001;
                modalElement.style.position = 'fixed';
                modalElement.style.left = '50%';
                modalElement.style.top = '50%';
                modalElement.style.transform = 'translate(-50%, -50%)';
                modalElement.style.width = `${opts.dialogWidth}px`;
                modalElement.style.height = opts.dialogHeight;
                modalElement.style.overflow = 'auto';
                modalElement.style.backgroundColor = '#fff';
                modalElement.style.border = '1px solid #ccc';
                modalElement.style.boxShadow = '0 4px 8px rgba(0,0,0,0.2)';
            }

            function hideEditorModal(modalId, opts) {
                const modalElement = document.getElementById(modalId);
                if (modalElement) {
                    modalElement.style.display = 'none';
                }
                const backdrop = document.getElementById('editorModalBackdrop');
                if (backdrop) {
                    backdrop.style.display = 'none';
                }
                if (opts.onDialogClose && typeof opts.onDialogClose === 'function') {
                    opts.onDialogClose();
                }
            }

            // HTML encoding/decoding utilities (simplified, distinct from $.jgrid.htmlEncode)
            function escapeHTMLContent(unsafeText) {
                const mapping = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
                return unsafeText.replace(/[&<>"']/g, function(char) { return mapping[char]; });
            }
            function unescapeHTMLContent(safeText) {
                const mapping = { '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&#039;': "'" };
                return safeText.replace(/&amp;|&lt;|&gt;|&quot;|&#039;/g, function(entity) { return mapping[entity]; });
            }

            // Function to retrieve form field data (equivalent to getFormData)
            function extractEditorFormFields() {
                const collectedData = {};
                const inputElements = document.querySelectorAll(`#${formTableBaseId} .form-input-control`);

                inputElements.forEach(inputEl => {
                    const fieldName = inputEl.name;
                    const columnDefinition = currentGridInstance.p.colModel.find(col => col.name === fieldName);

                    if (columnDefinition && columnDefinition.editoptions && typeof columnDefinition.editoptions.custom_value === 'function') {
                        try {
                            const customValue = columnDefinition.editoptions.custom_value(inputEl, 'get');
                            if (customValue === undefined) { throw new Error("Custom value accessor returned undefined."); }
                            collectedData[fieldName] = customValue;
                        } catch (e) {
                            console.error(`Custom value retrieval error for ${fieldName}:`, e);
                        }
                        return;
                    }

                    switch (inputEl.type) {
                        case "checkbox":
                            collectedData[fieldName] = inputEl.checked ? inputEl.value : inputEl.getAttribute("data-unchecked-value") || "";
                            break;
                        case "select-one":
                            collectedData[fieldName] = inputEl.value;
                            break;
                        case "select-multiple":
                            collectedData[fieldName] = Array.from(inputEl.selectedOptions).map(opt => opt.value).join(",");
                            break;
                        default: // text, textarea, password
                            collectedData[fieldName] = inputEl.value;
                            break;
                    }
                    if (currentGridInstance.p.autoencode) {
                        collectedData[fieldName] = escapeHTMLContent(collectedData[fieldName]);
                    }
                });
                collectedData[`${currentGridInstance.p.id}_id`] = activeRecordId;
                return collectedData;
            }

            // Function to generate form HTML (equivalent to createData)
            function constructEditorFormHTML(recordIdForContent) {
                let generatedRowsMarkup = '';
                let formFieldCount = 0;
                let currentRecordData = null;
                if (recordIdForContent !== '_empty') {
                    const recordIdx = currentGridInstance.getInd(recordIdForContent);
                    if (recordIdx !== false) {
                        currentRecordData = currentGridInstance.getRowData(recordIdForContent);
                    }
                }

                const editableColumns = currentGridInstance.p.colModel.filter(col => col.name !== 'cb' && col.name !== 'subgrid' && col.editable === true && col.name !== 'rn');

                editableColumns.sort((a, b) => {
                    const aFormOpts = a.formoptions || {};
                    const bFormOpts = b.formoptions || {};
                    const aRowPosition = parseInt(aFormOpts.rowpos, 10) || (formFieldCount + 1);
                    const bRowPosition = parseInt(bFormOpts.rowpos, 10) || (formFieldCount + 1);
                    if (aRowPosition !== bRowPosition) {
                        return aRowPosition - bRowPosition;
                    }
                    const aColPosition = parseInt(aFormOpts.colpos, 10) || 1;
                    const bColPosition = parseInt(bFormOpts.colpos, 10) || 1;
                    return aColPosition - bColPosition;
                });

                editableColumns.forEach((colDef, i) => {
                    const colName = colDef.name;
                    const isFieldHidden = (colDef.editrules && colDef.editrules.edithidden === true) ? false : (colDef.hidden === true);
                    const rowDisplay = isFieldHidden ? "display:none;" : "";

                    const fieldEditOptions = { ...colDef.editoptions };
                    fieldEditOptions.id = colName;
                    fieldEditOptions.name = colName;

                    const fieldFormOptions = { elmprefix: '', elmsuffix: '', rowabove: false, rowcontent: '', ...(colDef.formoptions || {}) };
                    const fieldLabel = fieldFormOptions.label || currentGridInstance.p.colNames[currentGridInstance.p.colModel.indexOf(colDef)];

                    let fieldCurrentValue = '';
                    if (recordIdForContent === '_empty') {
                        fieldCurrentValue = typeof fieldEditOptions.defaultValue === 'function' ? fieldEditOptions.defaultValue() : fieldEditOptions.defaultValue || '';
                    } else if (currentRecordData && currentRecordData[colName] !== undefined) {
                        fieldCurrentValue = currentRecordData[colName];
                        if (currentGridInstance.p.autoencode) {
                            fieldCurrentValue = unescapeHTMLContent(fieldCurrentValue);
                        }
                    }

                    const inputType = colDef.edittype || "text";
                    let inputMarkup = '';

                    switch (inputType) {
                        case "textarea":
                            inputMarkup = `<textarea class="form-input-control ui-widget-content ui-corner-all" id="${colName}" name="${colName}">${fieldCurrentValue}</textarea>`;
                            break;
                        case "select":
                            let optionsMarkup = '';
                            if (fieldEditOptions.value) {
                                const values = typeof fieldEditOptions.value === 'string' ? fieldEditOptions.value.split(';') : Object.entries(fieldEditOptions.value);
                                values.forEach(option => {
                                    let val, text;
                                    if (Array.isArray(option)) { [val, text] = option; } else { [val, text] = option.split(':'); }
                                    const selectedAttr = (String(val) === String(fieldCurrentValue)) ? 'selected' : '';
                                    optionsMarkup += `<option value="${val}" ${selectedAttr}>${text}</option>`;
                                });
                            }
                            const multipleSelectAttr = fieldEditOptions.multiple ? 'multiple' : '';
                            inputMarkup = `<select class="form-input-control ui-widget-content ui-corner-all" id="${colName}" name="${colName}" ${multipleSelectAttr}>${optionsMarkup}</select>`;
                            break;
                        case "checkbox":
                            const isChecked = (String(fieldCurrentValue).toLowerCase() === String(fieldEditOptions.value || '1').toLowerCase() || (String(fieldCurrentValue).toLowerCase().search(/(false|0|no|off|undefined)/i) < 0 && String(fieldCurrentValue) !== ""));
                            const checkedAttr = isChecked ? 'checked' : '';
                            const uncheckedVal = fieldEditOptions.offval || '';
                            inputMarkup = `<input type="checkbox" class="form-input-control" id="${colName}" name="${colName}" value="${fieldEditOptions.value || '1'}" data-unchecked-value="${uncheckedVal}" ${checkedAttr}/>`;
                            break;
                        case "radio":
                            if (fieldEditOptions.value) {
                                const values = typeof fieldEditOptions.value === 'string' ? fieldEditOptions.value.split(';') : Object.entries(fieldEditOptions.value);
                                values.forEach(option => {
                                    let val, text;
                                    if (Array.isArray(option)) { [val, text] = option; } else { [val, text] = option.split(':'); }
                                    const radioChecked = (String(val) === String(fieldCurrentValue)) ? 'checked' : '';
                                    inputMarkup += `<input type="radio" class="form-input-control" name="${colName}" value="${val}" ${radioChecked}/> ${text}`;
                                });
                            }
                            break;
                        default: // text, password
                            inputMarkup = `<input type="${inputType}" class="form-input-control ui-widget-content ui-corner-all" id="${colName}" name="${colName}" value="${fieldCurrentValue}"/>`;
                            break;
                    }

                    if (fieldFormOptions.rowabove) {
                        generatedRowsMarkup += `<tr class="info-message-row"><td class="content-info-cell" colspan="2">${fieldFormOptions.rowcontent}</td></tr>`;
                    }

                    generatedRowsMarkup += `
                        <tr class="form-data-entry-row" style="${rowDisplay}" id="row_${colName}">
                            <td class="caption-label-cell">${fieldLabel}</td>
                            <td class="data-input-cell">
                                ${fieldFormOptions.elmprefix}
                                ${inputMarkup}
                                ${fieldFormOptions.elmsuffix}
                            </td>
                        </tr>`;

                    if (moduleConfig.detectChangesOnSubmission || moduleConfig.detectChangesOnUpdate) {
                        moduleConfig._persistedFormValues[colName] = fieldCurrentValue;
                    }
                    formFieldCount++;
                });

                generatedRowsMarkup += `
                    <tr class="form-data-entry-row" style="display:none">
                        <td class="caption-label-cell"></td>
                        <td class="data-input-cell">
                            <input class="form-input-control" id="grid_record_id_hidden" type="text" name="${currentGridInstance.p.id}_id" value="${recordIdForContent}"/>
                        </td>
                    </tr>`;
                if (moduleConfig.detectChangesOnSubmission || moduleConfig.detectChangesOnUpdate) {
                    moduleConfig._persistedFormValues[`${currentGridInstance.p.id}_id`] = recordIdForContent;
                }

                return generatedRowsMarkup;
            }

            let editorDialog = document.getElementById(modalElementIdentifiers.mainDialog);
            if (!editorDialog) {
                editorDialog = document.createElement('div');
                editorDialog.id = modalElementIdentifiers.mainDialog;
                editorDialog.className = 'grid-record-editor-dialog';
                Object.assign(editorDialog.style, { display: 'none', padding: '10px', borderRadius: '4px' });

                const dialogHeading = document.createElement('h3');
                dialogHeading.id = modalElementIdentifiers.dialogHeader;
                dialogHeading.textContent = moduleConfig.currentDialogCaption;
                editorDialog.appendChild(dialogHeading);

                const dialogContentArea = document.createElement('div');
                dialogContentArea.id = modalElementIdentifiers.dialogContent;
                editorDialog.appendChild(dialogContentArea);

                const editorFormTable = document.createElement('table');
                editorFormTable.id = formTableBaseId;
                editorFormTable.className = 'record-editor-form-table';
                Object.assign(editorFormTable.style, { width: '100%', borderCollapse: 'collapse' });
                dialogContentArea.appendChild(editorFormTable);

                const editorFormTableBody = document.createElement('tbody');
                editorFormTable.appendChild(editorFormTableBody);

                document.body.appendChild(editorDialog);
            }

            if (moduleConfig.onRowDataPreparation && typeof moduleConfig.onRowDataPreparation === 'function') {
                moduleConfig.onRowDataPreparation(modalElementIdentifiers.mainDialog);
            }

            const editorTableBody = document.querySelector(`#${formTableBaseId} tbody`);
            if (editorTableBody) {
                editorTableBody.innerHTML = constructEditorFormHTML(activeRecordId);
            }

            if (moduleConfig.onFormInterfaceSetup && typeof moduleConfig.onFormInterfaceSetup === 'function') {
                moduleConfig.onFormInterfaceSetup(modalElementIdentifiers.mainDialog);
            }

            const actionButtonsContainer = document.createElement('div');
            actionButtonsContainer.className = 'editor-action-buttons';
            Object.assign(actionButtonsContainer.style, {
                marginTop: '10px',
                borderTop: '1px solid #ccc',
                paddingTop: '5px',
                textAlign: 'right'
            });

            const submitButton = document.createElement('button');
            submitButton.textContent = moduleConfig.saveButtonCaption;
            submitButton.className = 'editor-submit-button';
            actionButtonsContainer.appendChild(submitButton);

            const dismissButton = document.createElement('button');
            dismissButton.textContent = moduleConfig.cancelButtonCaption;
            dismissButton.className = 'editor-dismiss-button';
            actionButtonsContainer.appendChild(dismissButton);

            const existingActionButtons = editorDialog.querySelector('.editor-action-buttons');
            if (existingActionButtons) existingActionButtons.remove();
            editorDialog.appendChild(actionButtonsContainer);

            submitButton.addEventListener('click', async () => {
                if (moduleConfig.isSubmissionInProgress) return;
                moduleConfig.isSubmissionInProgress = true;

                let formCollectedData = extractEditorFormFields();
                let dataToSend = { ...formCollectedData };

                if (moduleConfig.detectChangesOnSubmission || moduleConfig.detectChangesOnUpdate) {
                    const hasChanges = Object.keys(moduleConfig._persistedFormValues).some(key =>
                        String(moduleConfig._persistedFormValues[key]) !== String(dataToSend[key])
                    );
                    if (!hasChanges && recordIdentifierToEdit !== "new") {
                        hideEditorModal(modalElementIdentifiers.mainDialog, { onDialogClose: moduleConfig.onDialogClose });
                        moduleConfig.isSubmissionInProgress = false;
                        return;
                    }
                }

                if (moduleConfig.beforeDataSubmission && typeof moduleConfig.beforeDataSubmission === 'function') {
                    const hookOutcome = moduleConfig.beforeDataSubmission(dataToSend, recordIdentifierToEdit);
                    if (hookOutcome === false) {
                        moduleConfig.isSubmissionInProgress = false;
                        return;
                    }
                    if (hookOutcome && typeof hookOutcome === 'object') {
                        dataToSend = hookOutcome;
                    }
                }

                if (moduleConfig.dataSerializationFunction && typeof moduleConfig.dataSerializationFunction === 'function') {
                    dataToSend = moduleConfig.dataSerializationFunction(dataToSend);
                }

                try {
                    const requestConfig = {
                        method: moduleConfig.submissionMethod,
                        headers: {
                            'Content-Type': 'application/x-www-form-urlencoded'
                        },
                        body: new URLSearchParams(dataToSend).toString(),
                        ...moduleConfig.customAjaxSettings
                    };

                    const response = await fetch(moduleConfig.submissionEndpoint || currentGridInstance.p.url, requestConfig);
                    const responsePayload = await response.json();

                    if (!response.ok) {
                        throw new Error(responsePayload.message || `Network response was not ok, status: ${response.status}`);
                    }

                    if (moduleConfig.afterDataSubmission && typeof moduleConfig.afterDataSubmission === 'function') {
                        moduleConfig.afterDataSubmission(responsePayload, dataToSend, recordIdentifierToEdit);
                    }

                    if (moduleConfig.reloadGridOnSubmission) {
                        currentGridInstance.trigger("reloadGrid", [{ page: 1 }]);
                    }

                    if (moduleConfig.closeDialogOnEditSuccess || (isNewEntryOperation && moduleConfig.clearFormOnAddSuccess)) {
                        hideEditorModal(modalElementIdentifiers.mainDialog, { onDialogClose: moduleConfig.onDialogClose });
                    }

                } catch (error) {
                    console.error("Error during record submission:", error);
                } finally {
                    moduleConfig.isSubmissionInProgress = false;
                }
            });

            dismissButton.addEventListener('click', () => {
                hideEditorModal(modalElementIdentifiers.mainDialog, { onDialogClose: moduleConfig.onDialogClose });
            });

            let allowDialogPresentation = true;
            if (moduleConfig.onFormDisplayPreHook && typeof moduleConfig.onFormDisplayPreHook === 'function') {
                allowDialogPresentation = moduleConfig.onFormDisplayPreHook(modalElementIdentifiers.mainDialog);
                if (typeof allowDialogPresentation === "undefined") allowDialogPresentation = true;
            }

            if (allowDialogPresentation) {
                showEditorModal(modalElementIdentifiers.mainDialog, moduleConfig);
                if (moduleConfig.onFormDisplayPostHook && typeof moduleConfig.onFormDisplayPostHook === 'function') {
                    moduleConfig.onFormDisplayPostHook(modalElementIdentifiers.mainDialog);
                }
            }
        };
    }

    // Attach these new functionalities to the global gridHostElement (which is jQuery in the original context)
    // This part emulates the $.jgrid.extend pattern, but uses distinct function names
    gridHostElement.jgrid = gridHostElement.jgrid || {};
    gridHostElement.jgrid.extend = function(obj) {
        Object.assign(gridHostElement.fn, obj);
    };

    gridHostElement.jgrid.extend({
        gridSearchModule: function(config) {
            return this.each(function() {
                establishGridSearchFunctionality(this, config);
            });
        },
        gridRowEditorModule: function(recordId, config) {
            return this.each(function() {
                const editorFunction = manageGridRowEditorModule(this, config);
                editorFunction(recordId);
            });
        }
    });

    // Provide simplified stubs for jqGrid specific functions if not present
    // This is to make the clone runnable without a full jqGrid environment for testing.
    // In a real Type IV clone, these would be assumed to be provided by the original system.
    gridHostElement.jgrid.parse = gridHostElement.jgrid.parse || JSON.parse;
    gridHostElement.jgrid.viewModal = gridHostElement.jgrid.viewModal || function(){}; // Placeholder
    gridHostElement.jgrid.hideModal = gridHostElement.jgrid.hideModal || function(){}; // Placeholder
    gridHostElement.jgrid.createModal = gridHostElement.jgrid.createModal || function(){}; // Placeholder
    gridHostElement.jgrid.search = gridHostElement.jgrid.search || {}; // Placeholder for default search options
    gridHostElement.jgrid.edit = gridHostElement.jgrid.edit || {}; // Placeholder for default edit options
    gridHostElement.jgrid.jqID = gridHostElement.jgrid.jqID || function(id){ return id.replace(/[!"#$%&'()*+,./:;<=>?@[\]^`{|}~]/g, "\\$&"); }; // Basic escaping
    gridHostElement.jgrid.htmlEncode = gridHostElement.jgrid.htmlEncode || function(val){ return escapeHTMLContent(val); };
    // gridHostElement.jgrid.htmlDecode is not strictly used in the provided snippet for postData
    // gridHostElement.jgrid.createEl, $.unformat, xmlJsonClass are not directly cloned but replaced by vanilla JS
    // $.jgrid.info_dialog is also not directly cloned, just console.error

    // This is a minimal shim for the jqGrid context properties and methods used by the clone
    // For a full clone, the `this` context for `each` would be the actual jqGrid DOM element
    // and its `p` property would be the jqGrid parameters.
    if (!gridHostElement.fn.each) {
         gridHostElement.fn.each = function(callback) {
             callback.call(this[0]); // Simulate `each` for a single element
             return this;
         };
    }
    if (!gridHostElement.fn.jgrid) {
        gridHostElement.fn.jgrid = {};
    }

    // Simulate basic jQuery element selection for internal use if not jQuery
    if (typeof gridHostElement !== 'function' || !gridHostElement.fn || !gridHostElement.fn.jquery) {
        // Simple shim if jQuery is not the host element, for internal compatibility
        window.$ = window.$ || function(selector, context) {
            if (selector && typeof selector.jquery === 'string') return selector; // Already a jQuery object
            if (typeof selector === 'string') {
                const elements = (context || document).querySelectorAll(selector);
                return Object.assign(elements, {
                    jquery: '1.0.0', // Indicate it's a jQuery-like object
                    get: function(index) { return this[index]; },
                    val: function(value) {
                        if (value === undefined) return this[0] ? this[0].value : undefined;
                        if (this[0]) this[0].value = value;
                        return this;
                    },
                    attr: function(name, value) {
                        if (value === undefined) return this[0] ? this[0].getAttribute(name) : undefined;
                        if (this[0]) this[0].setAttribute(name, value);
                        return this;
                    },
                    is: function(s) {
                        if (this[0]) return this[0].matches(s);
                        return false;
                    },
                    append: function(el) {
                        if (this[0]) this[0].appendChild(el);
                        return this;
                    },
                    html: function(content) {
                        if (content === undefined) return this[0] ? this[0].innerHTML : undefined;
                        if (this[0]) this[0].innerHTML = content;
                        return this;
                    },
                    remove: function() {
                        this.forEach(e => e.remove());
                        return this;
                    },
                    each: function(cb) {
                        Array.prototype.forEach.call(this, cb);
                        return this;
                    },
                    on: function(event, handler) {
                        this.forEach(e => e.addEventListener(event, handler));
                        return this;
                    },
                    off: function(event, handler) {
                         this.forEach(e => e.removeEventListener(event, handler));
                         return this;
                    },
                    addClass: function(cls) {
                         this.forEach(e => e.classList.add(cls));
                         return this;
                    },
                    removeClass: function(cls) {
                         this.forEach(e => e.classList.remove(cls));
                         return this;
                    },
                    hover: function(onEnter, onLeave) {
                        this.forEach(e => {
                            e.addEventListener('mouseenter', onEnter);
                            e.addEventListener('mouseleave', onLeave);
                        });
                        return this;
                    },
                    find: function(sel) {
                        const newElements = [];
                        this.forEach(e => {
                            e.querySelectorAll(sel).forEach(found => newElements.push(found));
                        });
                        return $(newElements); // Recursively create a new jQuery-like object
                    },
                    toggle: function() {
                        this.forEach(e => {
                            e.style.display = e.style.display === 'none' ? '' : 'none';
                        });
                        return this;
                    },
                    bind: function(event, handler) { return this.on(event, handler); }
                });
            } else if (selector instanceof HTMLElement || selector instanceof DocumentFragment || selector instanceof Window || selector instanceof HTMLCollection || selector instanceof NodeList || Array.isArray(selector)) {
                // If it's a DOM element, wrap it
                const arr = Array.isArray(selector) ? selector : (selector instanceof NodeList || selector instanceof HTMLCollection) ? Array.from(selector) : [selector];
                 return Object.assign(arr, {
                    jquery: '1.0.0',
                    get: function(index) { return this[index]; },
                    append: function(el) { if (this[0]) this[0].appendChild(el); return this; },
                    html: function(content) { if (content === undefined) return this[0] ? this[0].innerHTML : undefined; if (this[0]) this[0].innerHTML = content; return this; },
                    remove: function() { this.forEach(e => e.remove()); return this; },
                    each: function(cb) { Array.prototype.forEach.call(this, cb); return this; },
                    val: function(value) { if (value === undefined) return this[0] ? this[0].value : undefined; if (this[0]) this[0].value = value; return this; },
                    attr: function(name, value) { if (value === undefined) return this[0] ? this[0].getAttribute(name) : undefined; if (this[0]) this[0].setAttribute(name, value); return this; },
                    on: function(event, handler) { this.forEach(e => e.addEventListener(event, handler)); return this; },
                    find: function(sel) {
                        const newElements = [];
                        this.forEach(e => {
                            if (e.querySelectorAll) e.querySelectorAll(sel).forEach(found => newElements.push(found));
                        });
                        return $(newElements);
                    },
                    toggle: function() { this.forEach(e => { e.style.display = e.style.display === 'none' ? '' : 'none'; }); return this; },
                    addClass: function(cls) { this.forEach(e => e.classList.add(cls)); return this; },
                    removeClass: function(cls) { this.forEach(e => e.classList.remove(cls)); return this; },
                    hover: function(onEnter, onLeave) { this.forEach(e => { e.addEventListener('mouseenter', onEnter); e.addEventListener('mouseleave', onLeave); }); return this; },
                    bind: function(event, handler) { return this.on(event, handler); }
                 });
            }
            return Object.assign([], {jquery: '1.0.0'}); // Empty jQuery-like object
        };
        window.$.jgrid = window.$.jgrid || {}; // Ensure jgrid namespace exists on shimmed $
        window.$.extend = window.$.extend || Object.assign; // Basic extend shim
        window.$.isFunction = window.$.isFunction || function(fn) { return typeof fn === 'function'; };
    }

})(jQuery); // Assuming jQuery is available as `jQuery` or `$` globally