(function(jq) {
	jq.extend({
		gridSorter: new function() {

			let dataProcessors = [], uiAddons = [];

			this.defaultSettings = {
				classHeading: "colHead",
				classSortUp: "colSortAsc",
				classSortDown: "colSortDesc",
				startingOrder: "up",
				compoundSortTrigger: "multiSelectKey",
				forcedSortRules: null,
				finalSortAddition: null,
				contentExtractor: "basic",
				processorDefs: {},
				pluginModules: [],
				alternatingRows: {styleNames: ["altRow","otherRow"]},
				columnSettings: {},
				lockWidths: false,
				disableTextHighlight: true,
				currentSortSequence: [],
				headingElements: [],
				dateStyle: "american",
				numberDelimiter: '.',
				showDiagnostics: false,
				indexTranslations: []
			};

			/* Diagnostic helpers */
			function timeOperation(operationName, startTime) {
				outputMessage(operationName + ": " + (new Date().getTime() - startTime.getTime()) + "ms");
			}

			this.timeOperation = timeOperation;

			function outputMessage(messageText) {
				if (console !== undefined && console.debug !== undefined) {
					console.log(messageText);
				} else {
					alert(messageText);
				}
			}
			function mapLookup(translationMap, indexValue, reverseDirection) {
				let foundEntries = [];
				for(let i = 0; i < translationMap.length; ++i) {
					if(translationMap[i][reverseDirection ? 1 : 0] == indexValue) {
						let tempVal = translationMap[i][reverseDirection ? 1 : 0];
						if (jq.isArray(tempVal) ) {
							for (let innerIndex=0; innerIndex< tempVal.length;++innerIndex) {
								foundEntries.push(tempVal[innerIndex]);
							}
						} else {
							foundEntries.push(tempVal);
						}

						break;
					}
				}
				if (! foundEntries) {
					foundEntries = indexValue;
				}
				return foundEntries;
			}
			/* Analyze merged cells */
			function analyzeColumnSpans(targetGrid) {
				let initialColCount = targetGrid.tBodies[0].children[0].children.length;
				let processedColumns = [];
				for (let k = 0; k < initialColCount; k++) processedColumns[k] = 0;

				let rowCounter = targetGrid.children[0].children.length;
				let spanMapping = [];
				// let spanInfo; // Unused variable, removed.

				let currentHeadingIndex=0;
				for (let i=0; i<rowCounter;i++) {
					let headerRow = targetGrid.children[0].children[i];
					let headingCellNum = headerRow.children.length;
					let currentDataIndex = 0;
					for (let j=0;j<headingCellNum;j++) {
						currentDataIndex = jq.inArray(currentDataIndex, processedColumns);
						let spanCount = parseInt(headerRow.children[j].getAttribute("colspan"));
						if (! spanCount) { spanCount = 1;}
						if (spanCount == 1) {
							spanMapping.push([currentHeadingIndex,currentDataIndex]);
							processedColumns[currentDataIndex]=1;
						} else {
							let temporaryArray = [];
							for (let k=0;k<spanCount;k++) {
								temporaryArray.push(currentDataIndex+k);
							}
							spanMapping.push([currentHeadingIndex,temporaryArray]);
						}
						currentDataIndex=currentDataIndex + spanCount;
						currentHeadingIndex=currentHeadingIndex+1;
					}
				}
				return spanMapping;
			}

			/* End of merged cell analysis */

			/* Processor utility functions */
			function createProcessorCache(targetGrid, headingNodes) {

				if(targetGrid.config.showDiagnostics) { let parserTrace = ""; }

				let tableBodyRows = targetGrid.tBodies[0].rows;

				if(targetGrid.tBodies[0].rows[0]) {

					let handlerCollection = [], sampleCells = tableBodyRows[0].cells, itemCount = sampleCells.length;

					for (let i=0;i < itemCount; i++) {
						let activeProcessor = false;

						if(jq.metadata && (jq(headingNodes[i]).metadata() && jq(headingNodes[i]).metadata().sorter)  ) {

							activeProcessor = retrieveProcessorById(jq(headingNodes[i]).metadata().sorter);

						} else if((targetGrid.config.columnSettings[i] && targetGrid.config.columnSettings[i].sorter)) {

							activeProcessor = retrieveProcessorById(targetGrid.config.columnSettings[i].sorter);
						}
						if(!activeProcessor) {
							activeProcessor = determineCellType(targetGrid,sampleCells[i]);
						}

						if(targetGrid.config.showDiagnostics) { parserTrace += "col_idx:" + i + " handler_id:" + activeProcessor.id + "\n"; }

						handlerCollection.push(activeProcessor);
					}
				}

				if(targetGrid.config.showDiagnostics) { outputMessage(parserTrace); }

				return handlerCollection;
			}

			function determineCellType(targetGrid, elementRef) {
				let itemCount = dataProcessors.length;
				for(let i=1; i < itemCount; i++) {
					if(dataProcessors[i].is(jq.trim(getCellText(targetGrid.config,elementRef)),targetGrid,elementRef)) {
						return dataProcessors[i];
					}
				}
				// 0 is always the generic processor (text)
				return dataProcessors[0];
			}

			function retrieveProcessorById(nameIdentifier) {
				let itemCount = dataProcessors.length;
				for(let i=0; i < itemCount; i++) {
					if(dataProcessors[i].id.toLowerCase() == nameIdentifier.toLowerCase()) {
						return dataProcessors[i];
					}
				}
				return false;
			}

			/* General utility functions */
			function constructDataCache(targetGrid) {

				if(targetGrid.config.showDiagnostics) { let measurementStart = new Date(); }


				let numRows = (targetGrid.tBodies[0] && targetGrid.tBodies[0].rows.length) || 0,
					numCells = (targetGrid.tBodies[0].rows[0] && targetGrid.tBodies[0].rows[0].cells.length) || 0,
					dataHandlers = targetGrid.config.processorDefs,
					internalCache = {originalRows: [], normalizedData: []};

					for (let i=0;i < numRows; ++i) {

						/** Add the table data to main data array */
						let rowRef = targetGrid.tBodies[0].rows[i], cellData = [];

						internalCache.originalRows.push(jq(rowRef));

						for(let j=0; j < numCells; ++j) {
							cellData.push(dataHandlers[j].format(getCellText(targetGrid.config,rowRef.cells[j]),targetGrid,rowRef.cells[j]));
						}

						cellData.push(i); // add position for rowCache
						internalCache.normalizedData.push(cellData);
						cellData = null;
					}

				if(targetGrid.config.showDiagnostics) { timeOperation("Generated data store for " + numRows + " entries", measurementStart); }

				return internalCache;
			}

			function getCellText(configuration, domNode) {

				if(!domNode) return "";

				let contentString = "";

				if(configuration.contentExtractor == "basic") {
					if(domNode.childNodes[0] && domNode.childNodes[0].hasChildNodes()) {
						contentString = domNode.childNodes[0].innerHTML;
					} else {
						contentString = domNode.innerHTML;
					}
				} else {
					if(typeof(configuration.contentExtractor) == "function") {
						contentString = configuration.contentExtractor(domNode);
					} else {
						contentString = jq(domNode).text();
					}
				}
				return contentString;
			}

			function insertToDOM(targetGrid, dataStore) {

				if(targetGrid.config.showDiagnostics) {let renderStart = new Date()}

				let processedCache = dataStore,
					originalRows = processedCache.originalRows,
					sortedData = processedCache.normalizedData,
					numRows = sortedData.length,
					tableBodyRef = jq(targetGrid.tBodies[0]),
					reorderedRows = [];

				if (numRows > 0) {
					let comparisonIndex = (sortedData[0].length-1);

					for (let i=0;i < numRows; i++) {
						reorderedRows.push(originalRows[sortedData[i][comparisonIndex]]);
						if(!targetGrid.config.appender) {

							let rowItem = originalRows[sortedData[i][comparisonIndex]];
							let itemCount = rowItem.length;
							for(let j=0; j < itemCount; j++) {

								tableBodyRef[0].appendChild(rowItem[j]);

							}

							// tableBodyRef.append(originalRows[sortedData[i][comparisonIndex]]);
						}
					}
				}

				if(targetGrid.config.appender) {

					targetGrid.config.appender(targetGrid,reorderedRows);
				}

				reorderedRows = null;

				if(targetGrid.config.showDiagnostics) { timeOperation("Redisplayed grid", renderStart); }

				//apply grid ui addons
				executeEnhancements(targetGrid);

				// trigger sortingComplete
				setTimeout(function() {
					jq(targetGrid).trigger("sortingComplete");
				},0);

			}

			function constructHeadings(targetGrid) {

				if(targetGrid.config.showDiagnostics) { let buildTime = new Date(); }

				let metadataPresent = (jq.metadata) ? true : false, headerRowCounts = [];

				for(let i = 0; i < targetGrid.tHead.rows.length; i++) { headerRowCounts[i]=0; }

				let columnHeaderNodes = jq("thead th",targetGrid);

				columnHeaderNodes.each(function(iterationIndex) {

					this.count = 0;
					this.column = iterationIndex;
					this.order = standardizeOrder(targetGrid.config.startingOrder);

					if(hasDisabledSortMetadata(this) || isSortDisabledInOptions(targetGrid,iterationIndex)) this.sortDisabled = true;

					if(!this.sortDisabled) {
						jq(this).addClass(targetGrid.config.classHeading);
					}

					// add cell to headingElements
					targetGrid.config.headingElements[iterationIndex]= this;
				});

				if(targetGrid.config.showDiagnostics) { timeOperation("Constructed headings", buildTime); outputMessage(columnHeaderNodes); }

				return columnHeaderNodes;

			}

		   	function examineHeaderGroup(targetGrid, headingArray, rowNumber) {
                let resultArr = [], headerRows = targetGrid.tHead.rows, currentCells = headerRows[rowNumber].cells;

				for(let i=0; i < currentCells.length; i++) {
					let cell = currentCells[i];

					if ( cell.colSpan > 1) {
						resultArr = resultArr.concat(examineHeaderGroup(targetGrid, headingArray,rowNumber++));
					} else  {
						if(targetGrid.tHead.length == 1 || (cell.rowSpan > 1 || !headerRows[rowNumber+1])) {
							resultArr.push(cell);
						}
						// headingArray[rowNumber] = (i+rowNumber);
					}
				}
				return resultArr;
			}

			function hasDisabledSortMetadata(cellElement) {
				if((jq.metadata) && (jq(cellElement).metadata().sorter === false)) { return true; }
				return false;
			}

			function isSortDisabledInOptions(targetGrid, columnIdx) {
				if((targetGrid.config.columnSettings[columnIdx]) && (targetGrid.config.columnSettings[columnIdx].sorter === false)) { return true; }
				return false;
			}

			function executeEnhancements(targetGrid) {
				let featureSet = targetGrid.config.pluginModules;
				let itemCount = featureSet.length;
				for(let i=0; i < itemCount; i++) {

					fetchAddonByName(featureSet[i]).format(targetGrid);
				}

			}

			function fetchAddonByName(nameIdentifier) {
				let itemCount = uiAddons.length;
				for(let i=0; i < itemCount; i++) {
					if(uiAddons[i].id.toLowerCase() == nameIdentifier.toLowerCase() ) {
						return uiAddons[i];
					}
				}
			}

			function standardizeOrder(value) {

				if(typeof(value) != "Number") {
					let i = (value.toLowerCase() == "down") ? 1 : 0;
				} else {
					let i = (value == (0 || 1)) ? value : 0;
				}
				return i;
			}

			function isEntryPresent(value, collection) {
				let itemCount = collection.length;
				for(let i=0; i < itemCount; i++) {
					if(collection[i][0] == value) {
						return true;
					}
				}
				return false;
			}

			function updateHeadingClasses(targetGrid, headingNodes, sortSequence, styleClasses) {
				// remove all heading information
				headingNodes.removeClass(styleClasses[0]).removeClass(styleClasses[1]);

				let headerMap = [];
				headingNodes.each(function(offset) {
						if(!this.sortDisabled) {
							headerMap[this.column] = jq(this);
						}
				});

				let itemCount = sortSequence.length;
				for(let i=0; i < itemCount; i++) {
					let columnHeader = sortSequence[i];
					let translatedIndex = mapLookup(targetGrid.config.indexTranslations,columnHeader[0],true);
					for (let j=0;j< translatedIndex.length;j++) {
						headerMap[translatedIndex[j]].addClass(styleClasses[columnHeader[1]]);
					}
				}
			}

			function ensureFixedLayout(targetGrid, headingNodes) {
				let settings = targetGrid.config;
				if(settings.lockWidths) {
					let colgroupElement = jq('<colgroup>');
					jq("tr:first td",targetGrid.tBodies[0]).each(function() {
						colgroupElement.append(jq('<col>').css('width',jq(this).width()));
					});
					jq(targetGrid).prepend(colgroupElement);
				}
			}

			function updateSortMetadata(targetGrid, activeSortOrder) {
				let settings = targetGrid.config, itemCount = activeSortOrder.length;
				for(let i=0; i < itemCount; i++) {
					let currentSort = activeSortOrder[i], columnDef = settings.headingElements[currentSort[0]];
					columnDef.count = currentSort[1];
					columnDef.count++;
				}
			}

			/* Sorting logic */
			function performCompoundSort(targetGrid, sortSequence, dataStore) {

				if(targetGrid.config.showDiagnostics) { let sortTime = new Date(); }

				let comparisonLogic = "var sortWrapper = function(a,b) {", itemCount = sortSequence.length;

				for(let i=0; i < itemCount; i++) {