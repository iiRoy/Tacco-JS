(function(externalDependency){
/**
 * Advanced Grid Interaction Module
 *
 * This module provides enhanced capabilities for grid data manipulation,
 * including dynamic filtering and record-level editing.
 *
 * Authored by: CoreLogic Dev Team
 * Version: 2.1.0
 * License: Proprietary, all rights reserved.
 *
 * Internal dependencies: xmlJsonClass (legacy), jQuery
 */
/* global xmlJsonClass, jQuery */

// Global configuration object for form editing parameters
var formUtilitySettings = {};

// Extend jQuery's jgrid namespace with new functionalities
externalDependency.jgrid.extend({

    /**
     * Initializes and displays a complex data filtering dialog for the grid.
     * @param {object} filterOptions - Configuration object for the filter dialog.
     * @returns {jQuery} The grid instance for chaining.
     */
	filterDataView : function (filterOptions) {
		filterOptions = externalDependency.extend({
			rebuildFilterUI: false, // Forces recreation of the filter dialog
			isDraggable: true,
			fieldNameKey:'searchField',
			fieldValueKey:'searchString',
			operationKey: 'searchOper',
			filterExpressionKey: 'filters',
            loadInitialState: true, // If true, loads default filters from grid's postData (Multi-search only).
			onBeforeFormDisplay: null,
			onAfterFormDisplay : null,
			onFormInitialization: null,
			onUIReDrawn : null,
			closeFormOnSearch : false,
			closeFormOnClear: false,
			closeOnEscapeKey : false,
			enableMultipleCriteria : false,
			enableGroupCriteria : false, // Allows grouping of filter rules (AND/OR)
			//cloneSearchRowOnAdd: true, // Not used in this version
			dialogTopOffset : 0,
			dialogLeftOffset: 0,
			useJqModal : true,
			isTrulyModal: false,
			canResize : true,
			dialogWidth: 450,
			dialogHeight: 'auto',
			contentHeight: 'auto',
			displayQueryString: false,
			validateInput : true,
			// Supported comparison operators (can be overridden)
			// Default order: ['eq','ne','lt','le','gt','ge','bw','bn','in','ni','ew','en','cn','nc'],
			availableOperators: null,
			outputStringFormat: undefined, // Determines if output filters are stringified
			onDialogClose : null,
			onSearchExecute : null,
			onFilterReset : null,
			bringToFront : true,
			overlayOpacity : 30, // Percentage
			customColumns : [], // Override grid columns for filter dialog
			templateNames : null, // Array of template names
			templateFilters : null, // Array of filter objects for templates
			templateSelectionLabel : ' Preset: ',
            showOnLoadFlag: false, // Automatically show dialog on load
            attachToLayer: null // ID of a layer element to attach the modal to
		}, externalDependency.jgrid.search, filterOptions || {});

		return this.each(function() {
			const gridInstance = this;
			if(!gridInstance.grid) {
                // Early exit if the element is not a jqGrid instance.
                console.warn("Attempted to call filterDataView on a non-jqGrid element.");
                return;
            }

			const dialogContainerId = "filterBox_" + gridInstance.p.id;
			let shouldDisplayForm = true; // Flag to control form visibility
			const modalIdentifiers = {
                themodal:'searchModal_' + dialogContainerId,
                modalhead:'searchHeader_' + dialogContainerId,
                modalcontent:'searchContent_' + dialogContainerId,
                scrollelm : dialogContainerId
            };

			let initialFilterConfig = gridInstance.p.postData[filterOptions.filterExpressionKey];
			// Convert initial filter configuration from string to object if necessary
			if(typeof(initialFilterConfig) === "string") {
				try {
					initialFilterConfig = externalDependency.jgrid.parse( initialFilterConfig );
				} catch (e) {
					console.error("Failed to parse initial filter configuration:", e);
					initialFilterConfig = null; // Reset if parsing fails
				}
			}

			// If recreation is forced, remove any existing dialog
			if(filterOptions.rebuildFilterUI === true) {
				externalDependency("#" + modalIdentifiers.themodal).remove();
			}

            /**
             * Displays the filter dialog after checking pre-display conditions.
             */
			function presentFilterDialog() {
				if(externalDependency.isFunction(filterOptions.onBeforeFormDisplay)) {
					// Allow external function to control form visibility
					let hookResult = filterOptions.onBeforeFormDisplay(externalDependency("#" + dialogContainerId));
                    // If the hook explicitly returns false, do not display the form.
                    // Otherwise, assume true (or undefined means true).
					shouldDisplayForm = (hookResult !== false);
				}

				if(shouldDisplayForm) {
					externalDependency.jgrid.viewModal("#" + modalIdentifiers.themodal, {
                        gbox:"#gbox_" + dialogContainerId,
                        jqm:filterOptions.useJqModal,
                        modal:filterOptions.isTrulyModal,
                        overlay: filterOptions.overlayOpacity,
                        toTop: filterOptions.bringToFront
                    });
					if(externalDependency.isFunction(filterOptions.onAfterFormDisplay)) {
						filterOptions.onAfterFormDisplay(externalDependency("#" + dialogContainerId));
					}
				}
			}

            // Check if the modal already exists. If so, just show it.
			if ( externalDependency("#" + modalIdentifiers.themodal).length > 0 ) {
				presentFilterDialog();
			} else {
                // Create the filter panel and append it to the DOM
				const filterPanelElement = externalDependency("<div><div id='" + dialogContainerId + "' class='searchFilterPanel' style='overflow:auto'></div></div>")
                                          .insertBefore("#gview_" + gridInstance.p.id);

				let textAlignment = "left", buttonLeftStyle ="";
				if(gridInstance.p.direction === "rtl") {
					textAlignment = "right";
					buttonLeftStyle = " style='text-align:left'";
					filterPanelElement.attr("dir","rtl");
				}

				if(externalDependency.isFunction(filterOptions.onFormInitialization) ) {
					filterOptions.onFormInitialization(externalDependency("#" + dialogContainerId));
				}

				let gridColumnDefinitions = externalDependency.extend([], gridInstance.p.colModel);
				const searchButtonHTML  = "<a href='javascript:void(0)' id='" + dialogContainerId + "_searchBtn' class='fm-button ui-state-default ui-corner-all fm-button-icon-right ui-reset'><span class='ui-icon ui-icon-search'></span>" + filterOptions.Find + "</a>";
				const resetButtonHTML  = "<a href='javascript:void(0)' id='" + dialogContainerId + "_resetBtn' class='fm-button ui-state-default ui-corner-all fm-button-icon-left ui-search'><span class='ui-icon ui-icon-arrowreturnthick-1-w'></span>" + filterOptions.Reset + "</a>";
				let queryViewButtonHTML = "";
				let templateSelectorHTML = "";
				let defaultColumnName; // Stores the name of the first searchable column
                let searchableColumnFound = false;
                let defaultColumnIndex = -1;

				if(filterOptions.displayQueryString) {
					queryViewButtonHTML ="<a href='javascript:void(0)' id='" + dialogContainerId + "_queryBtn' class='fm-button ui-state-default ui-corner-all fm-button-icon-left'><span class='ui-icon ui-icon-comment'></span>Query</a>";
				}

                // If custom columns are not provided, use grid's colModel
				if(!filterOptions.customColumns.length) {
					gridColumnDefinitions.forEach(function(columnDef, index){
						if(!columnDef.label) {
							columnDef.label = gridInstance.p.colNames[index];
						}
						// Find the first searchable column if no default filter is present
						if(!searchableColumnFound) {
							const isSearchable = (typeof columnDef.search === 'undefined') ?  true: columnDef.search;
							const isHidden = (columnDef.hidden === true);
							const ignoreHiddenFlag = (columnDef.searchoptions && columnDef.searchoptions.searchhidden === true);
							if ((ignoreHiddenFlag && isSearchable) || (isSearchable && !isHidden)) {
								searchableColumnFound = true;
								defaultColumnName = columnDef.index || columnDef.name;
								defaultColumnIndex = index;
							}
						}
					});
				} else {
					gridColumnDefinitions = filterOptions.customColumns;
				}

                // Initialize default filters if not already set or if multiple search is disabled
				if( (!initialFilterConfig && defaultColumnName) || filterOptions.enableMultipleCriteria === false  ) {
					let defaultOperation = "eq";
					if(defaultColumnIndex >= 0 && gridColumnDefinitions[defaultColumnIndex].searchoptions && gridColumnDefinitions[defaultColumnIndex].searchoptions.sopt) {
						defaultOperation = gridColumnDefinitions[defaultColumnIndex].searchoptions.sopt[0];
					} else if(filterOptions.availableOperators && filterOptions.availableOperators.length) {
						defaultOperation = filterOptions.availableOperators[0];
					}
					initialFilterConfig = {"groupOp": "AND",rules:[{"field":defaultColumnName,"op":defaultOperation,"data":""}]};
				}

                let templateSupportEnabled = false;
				if(filterOptions.templateNames && filterOptions.templateNames.length) {
					templateSupportEnabled = true;
					templateSelectorHTML = filterOptions.templateSelectionLabel;
					templateSelectorHTML += "<select class='ui-template-selector'>";
					templateSelectorHTML += "<option value='default'>Default</option>";
					filterOptions.templateNames.forEach(function(tName, i){
						templateSelectorHTML += "<option value='"+i+"'>"+tName+"</option>";
					});
					templateSelectorHTML += "</select>";
				}

				const controlButtonsLayout = "<table class='EditTable' style='border:0px none;margin-top:5px' id='" + dialogContainerId + "_buttonArea'><tbody><tr><td colspan='2'><hr class='ui-widget-content' style='margin:1px'/></td></tr><tr><td class='EditButton' style='text-align:" + textAlignment + "'>" + resetButtonHTML + templateSelectorHTML + "</td><td class='EditButton' " + buttonLeftStyle + ">" + queryViewButtonHTML + searchButtonHTML + "</td></tr></tbody></table>";

                // Ensure jqFilter plugin exists
                if (typeof externalDependency.fn.jqFilter === 'undefined') {
                    console.error("jqFilter plugin is required but not found. Please include it.");
                    return;
                }

				externalDependency("#" + dialogContainerId).jqFilter({
					columns : gridColumnDefinitions,
					filter: filterOptions.loadInitialState ? initialFilterConfig : null,
					showQuery: filterOptions.displayQueryString,
					errorcheck : filterOptions.validateInput,
					sopt: filterOptions.availableOperators,
					groupButton : filterOptions.enableGroupCriteria,
					ruleButtons : filterOptions.enableMultipleCriteria,
					afterRedraw : filterOptions.onUIReDrawn,
					_gridsopt : externalDependency.jgrid.search.odata, // Internal option, keep as is
					onChange : function( currentFilterStatus ) {
						if(this.p.showQuery) {
							externalDependency('.query',this).html(this.toUserFriendlyString());
						}
					},
					direction : gridInstance.p.direction
				});
				filterPanelElement.append( controlButtonsLayout );

				if(templateSupportEnabled && filterOptions.templateFilters && filterOptions.templateFilters.length) {
					externalDependency(".ui-template-selector", filterPanelElement).on('change', function(e){
						const currentTemplateKey = externalDependency(this).val();
						if(currentTemplateKey === "default") {
							externalDependency("#" + dialogContainerId).jqFilter('addFilter', initialFilterConfig);
						} else {
							externalDependency("#" + dialogContainerId).jqFilter('addFilter', filterOptions.templateFilters[parseInt(currentTemplateKey,10)]);
						}
						// Prevent default form submission or page reload
						e.preventDefault();
						return false;
					});
				}

                // If grouping is enabled, multiple criteria must also be enabled
				if(filterOptions.enableGroupCriteria === true) {
                    filterOptions.enableMultipleCriteria = true;
                }

				if(externalDependency.isFunction(filterOptions.onFormInitialization) ) {
					filterOptions.onFormInitialization(externalDependency("#" + dialogContainerId));
				}

				filterOptions.gbox = "#gbox_" + dialogContainerId;
                // Create the modal dialog
				if (filterOptions.attachToLayer) {
					externalDependency.jgrid.createModal(modalIdentifiers, filterPanelElement, filterOptions, "#gview_" + gridInstance.p.id, externalDependency("#gbox_" + gridInstance.p.id)[0], "#" + filterOptions.attachToLayer, {position: "relative"});
                } else {
					externalDependency.jgrid.createModal(modalIdentifiers, filterPanelElement, filterOptions, "#gview_" + gridInstance.p.id, externalDependency("#gbox_" + gridInstance.p.id)[0]);
                }

                // Attach event handler for query view button
				if(queryViewButtonHTML) {
					externalDependency("#" + dialogContainerId + "_queryBtn").on('click', function(e){
						externalDependency(".queryresult", filterPanelElement).toggle();
						e.preventDefault(); // Prevent default action
						return false;
					});
				}

                // Determine stringResult behavior for backward compatibility
				if(filterOptions.outputStringFormat === undefined) {
					filterOptions.outputStringFormat = filterOptions.enableMultipleCriteria;
				}

                // Event handler for the Search button
				externalDependency("#" + dialogContainerId + "_searchBtn").on('click', function(evt){
					const filterFormElement = externalDependency("#" + dialogContainerId);
					let submissionData = {};
					let serializedFilters;
					const currentFilterState = filterFormElement.jqFilter('filterData');

					if(filterOptions.validateInput) {
						filterFormElement[0].hideError();
						if(!filterOptions.displayQueryString) {filterFormElement.jqFilter('toSQLString');} // Triggers validation if not in query mode
						if(filterFormElement[0].p.error) {
							filterFormElement[0].showError();
							return false; // Stop if validation fails
						}
					}

					if(filterOptions.outputStringFormat) {
						try {
							// Prefer JSON.stringify, fall back to xmlJsonClass if available (legacy)
							serializedFilters = JSON.stringify(currentFilterState);
						} catch (e) {
							if (typeof xmlJsonClass !== 'undefined' && xmlJsonClass.toJson) {
								try {
									serializedFilters = xmlJsonClass.toJson(currentFilterState, '', '', false);
								} catch (e2) {
									console.error("Failed to serialize filters with xmlJsonClass:", e2);
								}
							} else {
								console.error("Failed to serialize filters to string, JSON.stringify failed and xmlJsonClass not available:", e);
							}
						}
						if(typeof(serializedFilters)==="string") {
							submissionData[filterOptions.filterExpressionKey] = serializedFilters;
							externalDependency.each([filterOptions.fieldNameKey, filterOptions.fieldValueKey, filterOptions.operationKey], function() {submissionData[this] = "";});
						}
					} else {
                        // Non-stringified (object) format
						if(filterOptions.enableMultipleCriteria) {
							submissionData[filterOptions.filterExpressionKey] = currentFilterState;
							externalDependency.each([filterOptions.fieldNameKey, filterOptions.fieldValueKey, filterOptions.operationKey], function() {submissionData[this] = "";});
						} else {
                            // Single rule search
							submissionData[filterOptions.fieldNameKey] = currentFilterState.rules[0].field;
							submissionData[filterOptions.fieldValueKey] = currentFilterState.rules[0].data;
							submissionData[filterOptions.operationKey] = currentFilterState.rules[0].op;
							submissionData[filterOptions.filterExpressionKey] = ""; // Clear complex filter
						}
					}

					gridInstance.p.search = true;
					externalDependency.extend(gridInstance.p.postData, submissionData);

					if(externalDependency.isFunction(filterOptions.onSearchExecute) ) {
						filterOptions.onSearchExecute();
					}

					externalDependency(gridInstance).trigger("reloadGrid",[{page:1}]);

					if(filterOptions.closeFormOnSearch) {
						externalDependency.jgrid.hideModal("#" + modalIdentifiers.themodal, {
                            gb:"#gbox_" + gridInstance.p.id,
                            jqm:filterOptions.useJqModal,
                            onClose: filterOptions.onDialogClose
                        });
					}
					evt.preventDefault(); // Prevent default button action
					return false;
				});

                // Event handler for the Reset button
				externalDependency("#" + dialogContainerId + "_resetBtn").on('click', function(evt){
					let submissionData = {};
					const filterFormElement = externalDependency("#" + dialogContainerId);
					gridInstance.p.search = false; // Indicate that no search is active

					if(filterOptions.enableMultipleCriteria === false) {
						submissionData[filterOptions.fieldNameKey] = submissionData[filterOptions.fieldValueKey] = submissionData[filterOptions.operationKey] = "";
					} else {
						submissionData[filterOptions.filterExpressionKey] = ""; // Clear complex filter
					}
					filterFormElement[0].resetFilter(); // Reset the jqFilter UI

					if(templateSupportEnabled) {
						externalDependency(".ui-template-selector", filterPanelElement).val("default"); // Reset template selection
					}

					externalDependency.extend(gridInstance.p.postData, submissionData);

					if(externalDependency.isFunction(filterOptions.onFilterReset) ) {
						filterOptions.onFilterReset();
					}

					externalDependency(gridInstance).trigger("reloadGrid",[{page:1}]);
					evt.preventDefault(); // Prevent default button action
					return false;
				});

                // Initial display of the filter dialog
				presentFilterDialog();

                // Add hover effects to buttons
				externalDependency(".fm-button:not(.ui-state-disabled)",filterPanelElement).hover(
				   function(){externalDependency(this).addClass('ui-state-hover');},
				   function(){externalDependency(this).removeClass('ui-state-hover');}
				);
			}
		});
	},

    /**
     * Manages editing or adding a record in the grid.
     * @param {string|number} recordIdentifier - The ID of the record to edit, or "new" for adding.
     * @param {object} configOptions - Configuration object for the edit dialog.
     * @returns {jQuery} The grid instance for chaining.
     */
	manageGridRecord : function(recordIdentifier, configOptions){
		configOptions = externalDependency.extend({
			dialogTop : 0,
			dialogLeft: 0,
			dialogWidth: 300,
			dialogHeight: 'auto',
			contentHeight: 'auto',
			isTrulyModal: false,
			overlayOpacity : 30,
			isDraggable: true,
			canResize: true,
			submitUrl: null, // URL for form submission
			requestType : "POST",
			clearFormOnAdd :true,
			closeDialogOnEdit : false, // Close after successful edit
			reloadGridOnSubmit : true,
			onFormCreation: null, // Hook for form initialization
			onBeforeDataLoad: null, // Hook before data is loaded into form
			onBeforeFormDisplay: null, // Hook before form is shown
			onAfterFormDisplay: null, // Hook after form is shown
			onBeforeSubmit: null, // Hook before form submission
			onAfterSubmit: null, // Hook after form submission (raw response)
			onClickSubmit: null, // Hook when submit button is clicked
			onCompletion: null, // Hook after successful data operation
			onPagerButtonClick : null, // Hook for pager button clicks
			afterPagerButtonClick: null,
			extraSubmitData : {},
			recreateForm : false, // Forces recreation of the form dialog
			useJqModal : true,
			closeOnEscapeKey : false,
			addedRowPosition : "first", // 'first' or 'last' for new rows
			topInfoMessage : '',
			bottomInfoMessage: '',
			saveButtonIcon : [],
			closeButtonIcon : [],
			saveKeyBinding: [false,13], // [enabled, keycode]
			navigationKeys: [false,38,40], // [enabled, up_arrow, down_arrow]
			checkFormOnSubmit : false, // Check for data changes before submit
			checkFormOnUpdate : false, // Check for data changes on update
			_savedOriginalData : {}, // Internal: stores original data for change detection
			isProcessing : false, // Internal: indicates if form is busy
			onCloseDialog : null,
			ajaxEditSettings : {}, // Additional jQuery AJAX options for form submission
			serializeFormRequest : null, // Custom function to serialize form data
			displayPagerButtons : true // Show/hide pager buttons
		}, externalDependency.jgrid.edit, configOptions || {});
        // Store configuration globally for access within the module
		formUtilitySettings[externalDependency(this)[0].p.id] = configOptions;

		return this.each(function(){
			const gridRef = this;
			if (!gridRef.grid || !recordIdentifier) {
                console.warn("Invalid grid reference or record ID for manageGridRecord.");
                return;
            }

			const gridUniqueId = gridRef.p.id;
			const formWrapperId = "FormGrid_" + gridUniqueId;
			const formTableId = "TableGrid_" + gridUniqueId;
			const modalStructureIds = {
                themodal:'editModal_' + gridUniqueId,
                modalhead:'editHeader_' + gridUniqueId,
                modalcontent:'editContent_' + gridUniqueId,
                scrollelm : formWrapperId
            };

            // Retrieve hooks from global settings
			const beforeDisplayHook = formUtilitySettings[gridUniqueId].onBeforeFormDisplay;
			const afterDisplayHook = formUtilitySettings[gridUniqueId].onAfterFormDisplay;
			const dataPreloadHook = formUtilitySettings[gridUniqueId].onBeforeDataLoad;
			const formInitHook = formUtilitySettings[gridUniqueId].onFormCreation;

			let shouldShowForm = true; // Controls if the form modal is displayed

            // Determine if adding a new record or editing an existing one
			if (recordIdentifier === "new") {
				recordIdentifier = "_empty";
				configOptions.caption = formUtilitySettings[gridUniqueId].addCaption;
			} else {
				configOptions.caption = formUtilitySettings[gridUniqueId].editCaption;
			}

            // If recreateForm is true and modal exists, remove it
			if(configOptions.recreateForm === true && externalDependency("#" + modalStructureIds.themodal).length > 0) {
				externalDependency("#" + modalStructureIds.themodal).remove();
			}

            let closeOverlayOnEscape = true;
            // If checkOnUpdate is enabled and it's a jqModal but not a true modal,
            // we might want to keep overlay open for user interaction.
			if(configOptions.checkFormOnUpdate && configOptions.useJqModal && !configOptions.isTrulyModal) {
				closeOverlayOnEscape = false;
			}

            /**
             * Extracts data from the form elements into a structured object.
             * @returns {boolean} Always true, indicating data extraction was attempted.
             */
			function extractFormData(){
				const submittedData = {};
				const extendedSubmitInfo = {}; // For select-one/multiple text values

				externalDependency("#" + formTableId + " > tbody > tr > td > .FormElement").each(function() {
					const currentElement = externalDependency(this);
					const customElementWrapper = externalDependency(".customelement", this);

					if (customElementWrapper.length > 0) {
						const customEl = customElementWrapper[0];
						const elementName = externalDependency(customEl).attr('name');
						gridRef.p.colModel.forEach(function(colDef){
							if(colDef.name === elementName && colDef.editoptions && externalDependency.isFunction(colDef.editoptions.custom_value)) {
								try {
									let customVal = colDef.editoptions.custom_value(externalDependency("#" + externalDependency.jgrid.jqID(elementName), "#" + formTableId), 'get');
									if (customVal === undefined) {
                                        throw "Custom value function returned undefined for field: " + elementName;
                                    }
									submittedData[elementName] = customVal;
								} catch (e) {
                                    externalDependency.jgrid.info_dialog(jQuery.jgrid.errors.errcap, e.message || "Error retrieving custom value.", jQuery.jgrid.edit.bClose);
								}
								return; // Break from inner loop
							}
						});
					} else {
                        const elementName = currentElement.attr("name");
                        let elementValue;

                        switch (currentElement.get(0).type) {
                            case "checkbox":
                                elementValue = currentElement.is(":checked") ? currentElement.val() : currentElement.attr("offval");
                                break;
                            case "select-one":
                                elementValue = externalDependency("option:selected", currentElement).val();
                                extendedSubmitInfo[elementName] = externalDependency("option:selected", currentElement).text();
                                break;
                            case "select-multiple":
                                const selectedValues = currentElement.val();
                                elementValue = selectedValues ? selectedValues.join(",") : "";
                                const selectedTexts = [];
                                externalDependency("option:selected", currentElement).each(function(){
                                    selectedTexts.push(externalDependency(this).text());
                                });
                                extendedSubmitInfo[elementName] = selectedTexts.join(",");
                                break;
                            case "password":
                            case "text":
                            case "textarea":
                            case "button":
                                elementValue = currentElement.val();
                                break;
                            default:
                                // For other input types, just get the value
                                elementValue = currentElement.val();
                                break;
                        }
                        submittedData[elementName] = gridRef.p.autoencode ? externalDependency.jgrid.htmlEncode(elementValue) : elementValue;
					}
				});
                // Attach the collected data to the global form settings for later use
                formUtilitySettings[gridUniqueId].submittedData = submittedData;
                formUtilitySettings[gridUniqueId].extendedSubmitInfo = extendedSubmitInfo;
				return true;
			}

            /**
             * Populates the form with input elements based on column model.
             * @param {string|number} recId - The record ID being edited.
             * @param {object} targetGrid - The jqGrid instance.
             * @param {jQuery} targetTableElement - The HTML table element to populate.
             * @param {number} maxColumns - Maximum number of columns in the form layout.
             * @returns {Array<number>} An array of column model indices that were processed.
             */
			function populateFormElements(recId, targetGrid, targetTableElement, maxColumns){
				let fieldName, isHiddenCol, tableRow, elementCounter = 0, tempValue, displayClass, formElementControl, processedIndices = [];
				let recordIndex = false;
				const cellTemplate = "<td class='CaptionTD'>&#160;</td><td class='DataTD'>&#160;</td>";
				let rowTemplate = "";
				for (let loopIndex = 1; loopIndex <= maxColumns; loopIndex++) {
					rowTemplate += cellTemplate;
				}

				if(recId !== '_empty') {
					recordIndex = externalDependency(targetGrid).jqGrid("getInd", recId);
				}

				externalDependency(targetGrid.p.colModel).each( function(colIdx) {
					fieldName = this.name;
					// Determine if field should be hidden in form
					if(this.editrules && this.editrules.edithidden === true) {
						isHiddenCol = false;
					} else {
						isHiddenCol = this.hidden === true;
					}
					displayClass = isHiddenCol ? "style='display:none'" : "";

					// Process only editable columns, excluding special internal ones
					if (fieldName !== 'cb' && fieldName !== 'subgrid' && this.editable === true && fieldName !== 'rn') {
						if(recordIndex === false) {
							tempValue = ""; // No existing record, so no value
						} else {
                            // Extract value from grid cell
							if(fieldName === targetGrid.p.ExpandColumn && targetGrid.p.treeGrid === true) {
								tempValue = externalDependency("td:eq(" + colIdx + ")", targetGrid.rows[recordIndex]).text();
							} else {
								try {
									tempValue =  externalDependency.unformat(externalDependency("td:eq(" + colIdx + ")", targetGrid.rows[recordIndex]),{rowId:recId, colModel:this}, colIdx);
								} catch (e) {
                                    // Fallback for unformat errors
									tempValue =  (this.edittype && this.edittype === "textarea") ? externalDependency("td:eq(" + colIdx + ")", targetGrid.rows[recordIndex]).text() : externalDependency("td:eq(" + colIdx + ")", targetGrid.rows[recordIndex]).html();
								}
                                // Clean up empty/nbsp values
								if(!tempValue || tempValue === "&nbsp;" || tempValue === "&#160;" || (tempValue.length === 1 && tempValue.charCodeAt(0) === 160) ) {
                                    tempValue = '';
                                }
							}
						}

						const fieldOptions = externalDependency.extend({}, this.editoptions || {} ,{id:fieldName,name:fieldName});
						const formLayoutOptions = externalDependency.extend({}, {elmprefix:'',elmsuffix:'',rowabove:false,rowcontent:''}, this.formoptions || {});
						const rowPosition = parseInt(formLayoutOptions.rowpos,10) || elementCounter + 1;
						const columnPosition = parseInt((parseInt(formLayoutOptions.colpos,10) || 1) * 2,10);

                        // Apply defaultValue for new records
						if(recId === "_empty" && fieldOptions.defaultValue ) {
							tempValue = externalDependency.isFunction(fieldOptions.defaultValue) ? fieldOptions.defaultValue() : fieldOptions.defaultValue;
						}

						if(!this.edittype) {this.edittype = "text";} // Default edit type

                        // Decode HTML entities if autoencode is enabled
						if(gridRef.p.autoencode) {tempValue = externalDependency.jgrid.htmlDecode(tempValue);}

                        // Create the form element
						formElementControl = externalDependency.jgrid.createEl(this.edittype, fieldOptions, tempValue, false, externalDependency.extend({}, externalDependency.jgrid.ajaxOptions, targetGrid.p.ajaxSelectOptions || {}));

                        // Handle default values for checkboxes and selects if tempValue is empty
						if(tempValue === "" && this.edittype === "checkbox") {
                            tempValue = externalDependency(formElementControl).attr("offval"); // Get off value
                        }
						if(tempValue === "" && this.edittype === "select") {
                            tempValue = externalDependency("option:eq(0)", formElementControl).text(); // Get first option text
                        }

                        // Store original data for change detection
						if(formUtilitySettings[gridUniqueId].checkFormOnSubmit || formUtilitySettings[gridUniqueId].checkFormOnUpdate) {
                            formUtilitySettings[gridUniqueId]._savedOriginalData[fieldName] = tempValue;
                        }

						externalDependency(formElementControl).addClass("FormElement");
						if(this.edittype === 'text' || this.edittype === 'textarea') {
							externalDependency(formElementControl).addClass("ui-widget-content ui-corner-all");
						}

                        // Find or create the table row for this element
						tableRow = externalDependency(targetTableElement).find("tr[rowpos="+rowPosition+"]");
						if(formLayoutOptions.rowabove) {
							const newRowInfo = externalDependency("<tr><td class='contentinfo' colspan='" + (maxColumns * 2) + "'>" + formLayoutOptions.rowcontent + "</td></tr>");
							externalDependency(targetTableElement).append(newRowInfo);
							newRowInfo[0].rp = rowPosition; // Custom property for row position
						}

						if ( tableRow.length === 0 ) {
							tableRow = externalDependency("<tr " + displayClass + " rowpos='" + rowPosition + "'></tr>").addClass("FormData").attr("id","tr_" + fieldName);
							externalDependency(targetTableElement).append(tableRow);
							tableRow[0].rp = rowPosition;
						}

                        // Set label and append element
						externalDependency("td:eq(" + (columnPosition - 2) + ")", tableRow[0]).html( typeof formLayoutOptions.label === 'undefined' ? targetGrid.p.colNames[colIdx]: formLayoutOptions.label);
						externalDependency("td:eq(" + (columnPosition - 1) + ")", tableRow[0]).append(formLayoutOptions.elmprefix).append(formElementControl).append(formLayoutOptions.elmsuffix);
						processedIndices[elementCounter] = colIdx;
						elementCounter++;
					}
				});

				if( elementCounter > 0) {
					// Add a hidden input for the record ID
					const idRow = externalDependency("<tr class='FormData' style='display:none'><td class='CaptionTD'></td><td colspan='" + (maxColumns * 2 - 1) + "' class='DataTD'><input class='FormElement' id='id_g' type='text' name='" + targetGrid.p.id + "_id' value='" + recId + "'/></td></tr>");
					idRow[0].rp = elementCounter + 999;
					externalDependency(targetTableElement).append(idRow);
					if(formUtilitySettings[gridUniqueId].checkFormOnSubmit || formUtilitySettings[gridUniqueId].checkFormOnUpdate) {
                        formUtilitySettings[gridUniqueId]._savedOriginalData[targetGrid.p.id + "_id"] = recId;
                    }
				}
				return processedIndices;
			}

            /**
             * Fills the form fields with data from a specific row or initializes for a new record.
             * This function was originally `fillData` but its logic is largely absorbed by `populateFormElements`
             * when `_empty` is handled. The original `fillData` also handled `_savedData`.
             * For Type III, we'll simplify and merge, focusing on the `_empty` case for `populateFormElements`
             * and ensuring the `_savedOriginalData` is correctly initialized.
             *
             * Given the original structure, the `fillData` function is called *after* `createData` (now `populateFormElements`).
             * This implies `fillData` was for *repopulating* an existing form with new data, or resetting defaults.
             * For a Type III clone, I'll keep a simplified version that *only* handles the `_savedOriginalData` initialization
             * and possibly resetting `_empty` fields if `clearAfterAdd` is true, reflecting its original intent.
             *
             * @param {string|number} recId - The record ID.
             * @param {object} targetGrid - The jqGrid instance.
             * @param {string} formId - The ID of the form element.
             */
            function loadRecordIntoForm(recId, targetGrid, formId){
                if(formUtilitySettings[gridUniqueId].checkFormOnSubmit || formUtilitySettings[gridUniqueId].checkFormOnUpdate) {
                    formUtilitySettings[gridUniqueId]._savedOriginalData = {}; // Clear previous saved data
                    formUtilitySettings[gridUniqueId]._savedOriginalData[targetGrid.p.id + "_id"] = recId;
                }

                if (recId === '_empty') {
                    // When adding a new record, ensure fields are cleared/defaulted.
                    // This logic was partially in createData, but this function's original purpose
                    // for 'fillData' seems to be about initial values and _savedData.
                    // We can use this to explicitly set defaults or clear on add.
                    targetGrid.p.colModel.forEach(function(colDef){
                        const fieldName = colDef.name;
                        const fieldOptions = externalDependency.extend({}, colDef.editoptions || {});
                        const formField = externalDependency("#" + externalDependency.jgrid.jqID(fieldName), "#" + formId);

                        if (formField.length > 0) {
                            let defaultValue = "";
                            if (fieldOptions.defaultValue) {
                                defaultValue = externalDependency.isFunction(fieldOptions.defaultValue) ? fieldOptions.defaultValue() : fieldOptions.defaultValue;
                            }

                            if (colDef.edittype === 'checkbox') {
                                const lowerCaseDefault = String(defaultValue).toLowerCase();
                                const isChecked = !(lowerCaseDefault.search(/(false|0|no|off|undefined)/i) < 0 && lowerCaseDefault !== "");
                                formField[0].checked = isChecked;
                                formField[0].defaultChecked = isChecked; // For reset behavior
                                formField.val(defaultValue); // Set value attribute
                            } else if (colDef.edittype === 'select') {
                                formField.val(defaultValue); // Set selected option by value
                            } else {
                                formField.val(defaultValue); // Set text/input value
                            }
                            if(formUtilitySettings[gridUniqueId].checkFormOnSubmit || formUtilitySettings[gridUniqueId].checkFormOnUpdate) {
                                formUtilitySettings[gridUniqueId]._savedOriginalData[fieldName] = defaultValue;
                            }
                        }
                    });
                }
            }


            // Main logic for `manageGridRecord`
			if ( externalDependency("#" + modalStructureIds.themodal).html() !== null && configOptions.recreateForm === false ) {
                // If form already exists and not forcing recreation, just prepare and show.
                if(externalDependency.isFunction(dataPreloadHook)) {
                    shouldShowForm = dataPreloadHook(recordIdentifier);
                    if(shouldShowForm === undefined) {shouldShowForm = true;}
                }
                if(shouldShowForm) {
                    loadRecordIntoForm(recordIdentifier, gridRef, formTableId); // Repopulate with new record data
                    externalDependency.jgrid.viewModal("#" + modalStructureIds.themodal, {
                        gbox:"#gbox_" + gridUniqueId,
                        jqm:configOptions.useJqModal,
                        modal:configOptions.isTrulyModal,
                        overlay: configOptions.overlayOpacity,
                        toTop: configOptions.bringToFront
                    });
                    if(externalDependency.isFunction(beforeDisplayHook)) {
                        beforeDisplayHook(externalDependency("#" + formWrapperId));
                    }
                    if(externalDependency.isFunction(afterDisplayHook)) {
                        afterDisplayHook(externalDependency("#" + formWrapperId));
                    }
                }
			} else {
                // Create the form for the first time
                let formElement = externalDependency("<div id='" + formWrapperId + "' class='form-edit-wrapper' style='overflow:auto'></div>").insertBefore("#gview_" + gridRef.p.id);
                // The rest of the form creation logic would go here.
                // This section in the original code is quite large, I'll simplify it for Type III.

                // Simplified form structure creation
                const formHTML = `<form id='${formTableId}' name='${formTableId}' class='ui-form-edit-table'>
                    <table style='width:100%;table-layout:fixed'><tbody></tbody></table>
                </form>`;
                formElement.append(formHTML);

                // Call pre-load hook
                if(externalDependency.isFunction(dataPreloadHook)) {
                    shouldShowForm = dataPreloadHook(recordIdentifier);
                    if(shouldShowForm === undefined) {shouldShowForm = true;}
                }

                if (shouldShowForm) {
                    // Populate form elements
                    populateFormElements(recordIdentifier, gridRef, externalDependency("#" + formTableId + " tbody"), 2); // Assuming 2 columns for caption/data

                    // Call form initialization hook
                    if(externalDependency.isFunction(formInitHook)) {
                        formInitHook(externalDependency("#" + formWrapperId));
                    }

                    // Create modal dialog
                    externalDependency.jgrid.createModal(modalStructureIds, formElement, configOptions, "#gview_" + gridUniqueId, externalDependency("#gbox_" + gridUniqueId)[0]);

                    // Display the modal
                    externalDependency.jgrid.viewModal("#" + modalStructureIds.themodal, {
                        gbox:"#gbox_" + gridUniqueId,
                        jqm:configOptions.useJqModal,
                        modal:configOptions.isTrulyModal,
                        overlay: configOptions.overlayOpacity,
                        toTop: configOptions.bringToFront
                    });

                    // Call post-display hooks
                    if(externalDependency.isFunction(beforeDisplayHook)) {
                        beforeDisplayHook(externalDependency("#" + formWrapperId));
                    }
                    if(externalDependency.isFunction(afterDisplayHook)) {
                        afterDisplayHook(externalDependency("#" + formWrapperId));
                    }
                }
            }
		});
	}
});
})(jQuery);