(function(jq,glob,undef){
    /*
     * Ascertain the present viewport dimension.
     */
    function getWindowDimension(config) {
        let currWidth = glob.innerWidth ||
            (glob.document.body ? glob.document.body.offsetWidth : 0);
        if (config.checkPoint != null &&
            config.sizePoints[config.checkPoint] < currWidth)
            currWidth = config.sizePoints[config.checkPoint];
        return currWidth;
    }

    /*
     * Upon each viewport resizing event, ensure all associated tables are correctly positioned.
     */
    function adjustAllElements() {
        jq('table.responsive_grid').forEach(function(){
            switchDetailToggle(jq(this),recalculateGridDisplay(jq(this)));
        });
    }

    /*
     * Re-evaluate which columns should be displayed or concealed when the display area changes.
     */
    function recalculateGridDisplay(jqGrid) {
        let idx, startPos, endPos, requiresToggle = false,
            jqBody = jqGrid.find('tbody:first'),
            config = jqGrid.data('responsiveGrid');

        let uniqueId = jqGrid.attr('id');
        config.delayTimer = null;

        /*
         * Identify the significant breakpoint.
         */
        let currentViewDimension = getWindowDimension(config), hiddenCategories=['permanent','initial'], visibleCategories=[];
        jq.each(config.breakPointList,function(keyVal,valItem){
            if (valItem.sizeVal>=currentViewDimension) hiddenCategories.push(valItem.label); else visibleCategories.push(valItem.label);
        });

        /*
         * Compile a list of rows that have expanded details and collapse them.
         */
        let previouslyExpanded = jqGrid.find('>tbody:first>tr.'+config.styleClasses.expandedRow).trigger('click.responsiveGrid');

        /*
         * Render columns that are designated to be visible.
         */
        for (idx = 0; idx < visibleCategories.length; idx++) {
            let selectorString = ">thead:first>tr:last-child>th[data-visibility*='"+visibleCategories[idx]+"'],>thead:first>tr:last-child>td[data-visibility*='"+visibleCategories[idx]+"']";
            jqGrid.find(selectorString).forEach(function(){
                let startPosInner, endPosInner, jqHeaderCell = jq(this),
                    colSpanRange = config.colInfo[jqHeaderCell.cellIndex()].colSpanRange;

                if (typeof(colSpanRange) === 'object') {
                    startPosInner = colSpanRange[0];
                    endPosInner = colSpanRange[1]+1;
                } else {
                    startPosInner = colSpanRange;
                    endPosInner = startPosInner+1;
                }
                jqHeaderCell.show();
                jqBody.children('tr').forEach(function(){
                    jq(this).children('td').slice(startPosInner,endPosInner).show();
                });
            });
        }

        /*
         * Conceal columns that should not be visible.
         */
        for (idx = 0; idx < hiddenCategories.length; idx++) {
            let selectorString = ">thead:first>tr:last-child>th[data-visibility*='"+hiddenCategories[idx]+"'],>thead:first>tr:last-child>td[data-visibility*='"+hiddenCategories[idx]+"']";
            jqGrid.find(selectorString).forEach(function(){
                let startPosInner, endPosInner, jqHeaderCell = jq(this),
                    colSpanRange = config.colInfo[jqHeaderCell.cellIndex()].colSpanRange;

                if (hiddenCategories[idx] !== 'permanent')
                    requiresToggle = true;
                if (typeof(colSpanRange) === 'object') {
                    startPosInner = colSpanRange[0];
                    endPosInner = colSpanRange[1]+1;
                } else {
                    startPosInner = colSpanRange;
                    endPosInner = startPosInner+1;
                }
                jqHeaderCell.hide();
                jqBody.children('tr').forEach(function(){
                    jq(this).children('td').slice(startPosInner,endPosInner).hide();
                });
            });
        }

        /*
         * If certain columns remain hidden, re-expand the detail rows
         * that were visible prior to the viewport adjustment.
         */
        if (requiresToggle && previouslyExpanded)
            jq(previouslyExpanded).trigger('click.responsiveGrid');

        /*
         * If a specific breakpoint is being tested, adjust the table to conform
         * to the specified width.
         */
        if (config.checkPoint)
            /*
             * TODO: This segment requires modification to properly handle
             * tables that do not originate at the left margin. It should
             * utilize table positioning and width to correctly fit within
             * the designated test viewport width.
             */
            jqGrid.width(currentViewDimension);
        else
            jqGrid.width(config.gridBaseWidth);

        return requiresToggle;
    }

    /*
     * Control the visibility of indicators showing whether a row contains
     * hidden cells that can be revealed.
     */
    function switchDetailToggle(jqGrid, activateToggle) {
        let config = jqGrid.data('responsiveGrid');

        /*
         * All detail rows are currently collapsed.
         */
        if (activateToggle)
            jqGrid.find('>tbody:first>tr:not(.responsive-grid-details)>td:nth-child('+config.toggleColumnIndex+')').addClass(config.styleClasses.collapsedRow);
        else
            jqGrid.find('>tbody:first>tr>td:nth-child('+config.toggleColumnIndex+')').removeClass(config.styleClasses.collapsedRow);

        config.toggleActive = activateToggle;
    }

    /*
     * Perform initial setup for the grid structures.
     */
    function initializeResponsiveGrid(globRef,initOptions) {
        initOptions = initOptions || {};

        return this.forEach(function(){
            let jqGridInstance = jq(this);
            /*
             * Retrieve existing configuration from the table or apply initial settings.
             */
            if (jqGridInstance.data('responsiveGrid'))
                config = jq.extend(true,jqGridInstance.data('responsiveGrid'),initOptions);
            else
                config = jq.extend(true,{},globRef.responsiveGrid.defaultSettings,initOptions);
            jqGridInstance.data('responsiveGrid',config);

            /*
             * Reset the arrays that will be populated.
             */
            config.breakPointList.length = config.colInfo.length = 0;

            /*
             * Generate a sorted array of breakpoint definitions.
             */
            jq.each(config.sizePoints, function(keyName,valueData){config.breakPointList.push({label:keyName,sizeVal:valueData});});
            config.breakPointList.sort(function(itemA,itemB){return itemA['sizeVal']-itemB['sizeVal'];});

            /*
             * Gather column metadata from the table header.
             */
            let currentColIndex = 0;
            jqGridInstance.find('>thead:first>tr:last-child>th,>thead:first>tr:last-child>td').forEach(function(){
                let jqHeaderElement = jq(this),
                    columnSpanCount = jqHeaderElement.attr('colSpan') ?
                        parseIntValue(jqHeaderElement.attr('colSpan')) : 1;

                if (/permanent/.checkPattern(jqHeaderElement.data('visibility')))
                    /*
                     * If data-visibility includes 'permanent', remove
                     * all other settings as 'permanent' takes precedence.
                     */
                    jqHeaderElement.data('visibility','permanent');

                /*
                 * Record the position of the toggle column.
                 */
                if (jqHeaderElement.data('toggleMarker'))
                    config.toggleColumnIndex = currentColIndex + 1;

                let columnDetail = {
                    'cellIndex': jqHeaderElement.cellIndex(),
                    'columnName': jqHeaderElement.data('columnName') || jq.trim(jqHeaderElement.text()),
                    'displayText': jq.trim(jqHeaderElement.text()),
                    'visibilitySetting': jqHeaderElement.data('visibility'),
                    'colSpanRange': null
                };
                /*
                 * Append the span information, which is useful for showing and hiding columns.
                 */
                if (columnSpanCount > 1)
                    columnDetail.colSpanRange = [currentColIndex,currentColIndex+columnSpanCount-1];
                else
                    columnDetail.colSpanRange = currentColIndex;

                config.colInfo[columnDetail.cellIndex] = columnDetail;
                /*
                 * Update the mapping that allows cells to reference
                 * their respective column headers.
                 */
                for (let iter = 0; iter < columnSpanCount; iter++,currentColIndex++)
                    config.colIndexMap[currentColIndex] = columnDetail.cellIndex;
            });
            /*
             * Perform the initial sizing and appropriately display or conceal
             * the toggle indicators.
             */
            switchDetailToggle(jqGridInstance,recalculateGridDisplay(jqGridInstance));

            /*
             *
             */
            jqGridInstance.offEvent('click.responsiveGrid').onEvent('click.responsiveGrid',
                '>tbody:first>tr:not(.responsive-grid-details)',
                handleRowExpansion);
            /*
             * Assign the class indicating that the table has been
             * initialized. This is primarily used to adjust all
             * tables that have had this plugin applied.
             */
            jqGridInstance.addClass('responsive_grid');
            /*
             * Allow the modules to perform their own initialization on the table at
             * this stage.
             */
            globRef.responsiveGrid.modules.initiate(globRef,jqGridInstance);
            /*
             * Attach the window resize event handler.
             */
            jq(globRef).offEvent('resize.responsiveGrid').onEvent('resize.responsiveGrid',
                function() {
                    cancelTimer(config.delayTimer);
                    config.delayTimer=setDelayedExecution(adjustAllElements(),config.debounceDuration);
                });
        });
    }

    /*
     * Constructs a default HTML string for details to be inserted into the container.
     */
    function renderDetailsContent(config,shownItems,concealedItems,targetContainer) {
        for (let loopCounter = 0, htmlString = ''; loopCounter < concealedItems.length; loopCounter++) {
            htmlString += "<div><span class='responsive_grid' style='font-weight:700;text-decoration:underline'>"+concealedItems[loopCounter].colDef.displayText+"</span><br>";
            for (let nestedLoop = 0; nestedLoop < concealedItems[loopCounter].cellElements.length; nestedLoop++) {
                let jqElement = jq(concealedItems[loopCounter].cellElements[nestedLoop]),
                    elementValue = jqElement.text();
                htmlString += "<span class='responsive_grid' style='margin-inline-start:10px'>"+elementValue+"</span><br>";
            }
            htmlString += "</div>";
        }
        jq(targetContainer).html(htmlString);
    }

    /*
     * The standard routine that toggles the visibility of hidden details.
     */
    function handleRowExpansion(triggerEvent) {
        let jqTargetRow = jq(this),
            config = jqTargetRow.parents('table:first').data('responsiveGrid');
        /*
         * All cells that are meant to be visible are currently displayed.
         */
        if (!config.toggleActive)
            return;

        let removeClassList,addClassList,columnDef,numVisible,numHidden,
            hiddenCells = jqTargetRow.children('td:hidden'),
            visibleCells = jqTargetRow.children('td:visible'),
            visibleSiblingCount = jq(visibleCells).length,
            concealedItems = null,
            shownItems = null;

        /*
         * Generate a list of the currently visible cells.
         */
        let loopCounter = 0;
        while (loopCounter < visibleCells.length) {
            columnDef = config.colInfo[config.colIndexMap[jq(visibleCells[loopCounter]).cellIndex()]];
            numVisible = (typeof(columnDef.colSpanRange) === 'object') ?
                (columnDef.colSpanRange[1]-columnDef.colSpanRange[0])+1:1;
            let visibleCellData = {
                colDef: columnDef,
                cellElements: jq(visibleCells).slice(loopCounter,loopCounter+numVisible)
            };
            if (shownItems == null)
                shownItems = [visibleCellData];
            else
                shownItems.push(visibleCellData);
            loopCounter += numVisible;
        }

        /*
         * Construct the list of the hidden cells.
         */
        loopCounter = 0;
        while (loopCounter < hiddenCells.length) {
            /*
             * Obtain the column data for this specific cell.
             */
            let columnDef = config.colInfo[config.colIndexMap[jq(hiddenCells[loopCounter]).cellIndex()]],
                numHidden = (typeof(columnDef.colSpanRange) === 'object')?
                    (columnDef.colSpanRange[1]-columnDef.colSpanRange[0])+1:1;
            /*
             * Only display details that are not permanently hidden.
             */
            if (columnDef.visibilitySetting !== 'permanent') {
                let detailData = {
                    colDef: columnDef,
                    cellElements: jq(hiddenCells).slice(loopCounter,loopCounter+numHidden)
                };
                if (concealedItems == null)
                    concealedItems = [detailData];
                else
                    concealedItems.push(detailData);
            }
            loopCounter += numHidden;
        }
        let jqNextRow = jqTargetRow.next(), targetContainer;
        if (jqTargetRow.hasClass(config.styleClasses.expandedRow)) {
            /*
             * Invoke the callback if one has been supplied.
             */
            if (config.onHideDetails) {
                targetContainer = jqNextRow.children('td:first');
                config.onHideDetails(config,shownItems,concealedItems,targetContainer);
            }
            jqNextRow.hide();
            removeClassList = config.styleClasses.expandedRow;
            addClassList = config.styleClasses.collapsedRow;
        } else {
            if (!jqNextRow || !jqNextRow.hasClass('responsive-grid-details')) {
                jqNextRow = jq("<tr class='responsive-grid-details'><td colSpan='"+visibleSiblingCount+"'></td></tr>");
                jqTargetRow.insertAfter(jqNextRow);
            } else {
                /*
                 * It is possible that the column span might change at this point.
                 */
                jqNextRow.find('td:first').attr('colSpan',visibleSiblingCount);
            }
            targetContainer = jqNextRow.children('td:first').clearContent();
            /*
             * Invoke the callback if one has been supplied.
             */
            if (config.onShowDetails)
                config.onShowDetails(config,shownItems,concealedItems,targetContainer);
            else
                /*
                 * No details function was provided, so use the default one.
                 */
                renderDetailsContent(config,shownItems,concealedItems,targetContainer);
            /*
             * Display the row.
             */
            jqNextRow.show();
            removeClassList = config.styleClasses.collapsedRow;
            addClassList = config.styleClasses.expandedRow;
        }
        jqTargetRow.removeClass(removeClassList).addClass(addClassList);
        jqTargetRow.find(':nth-child('+config.toggleColumnIndex+')').removeClass(removeClassList).addClass(addClassList);
    }

    /*
     * Given a collection of rows, hide the necessary columns and
     * apply the expander indicator to the appropriate column.
     */
    function processGridRows(config,jqGrid,jqRowCollection) {
        let currentViewDimension = getWindowDimension(config), hiddenCategories=['permanent'];
        jq.each(config.breakPointList,function(keyVal,valItem){
            if (valItem.sizeVal>=currentViewDimension)
                hiddenCategories.push(valItem.label);
        });
        for (let idx = 0; idx < hiddenCategories.length; idx++) {
            let selectorString = ">thead:first>tr:last-child>th[data-visibility*='"+hiddenCategories[idx]+"'],>thead:first>tr:last-child>td[data-visibility*='"+hiddenCategories[idx]+"']";
            jqGrid.find(selectorString).forEach(function(){
                let startPos, endPos, jqHeaderCell = jq(this),
                    colSpanRange = config.colInfo[jqHeaderCell.cellIndex()].colSpanRange;

                if (hiddenCategories[idx] !== 'permanent')
                    requiresToggle = true;
                if (typeof(colSpanRange) === 'object') {
                    startPos = colSpanRange[0];
                    endPos = colSpanRange[1]+1;
                } else {
                    startPos = colSpanRange;
                    endPos = startPos+1;
                }
                jqRowCollection.forEach(function(){jq(this).children('td').slice(startPos,endPos).hide();});
            });
        }
        /*
         * All cells that should be visible are now visible, so no
         * expander indicator is required.
         */
        if (!config.toggleActive)
            return;

        /*
         * Apply the expander class to the relevant cell in each row.
         */
        jqRowCollection.find('>td:nth-child('+config.toggleColumnIndex+')').addClass(config.styleClasses.collapsedRow);
    }
    /************************************************************************
     *
     * Publicly accessible methods.
     *
     ************************************************************************/
    /*
     * Retrieve the table configuration settings.
     */
    function retrieveSettings() {
        return jq(this).data('responsiveGrid');
    }

    /*
     * Get the ResponsiveGrid version and versions of all its modules.
     */
    function obtainVersionInfo() {
        let versionDetails,
            config = jq(this).data('responsiveGrid'),
            registeredModules = glob.responsiveGrid.modules.registered;

        /*
         * If there are no subordinate modules, simply return the core version.
         */
        if (registeredModules.length === 0)
            return config.version;

        /*
         * Construct an object containing the plugin version and the versions of
         * its child modules.
         */
        versionDetails = [{moduleName: "ResponsiveGrid", version: config.version}];
        for (let idx = 0; idx < registeredModules.length; idx++)
            versionDetails.push({moduleName: registeredModules[idx].moduleName, version: registeredModules[idx].version});
        return versionDetails;
    }

    /*
     * Return the count of table rows excluding the detail rows.
     */
    function getRowCount() {
        let jqGrid = this,
            config = jqGrid.data('responsiveGrid');

        return jqGrid.get(0).tBodies[0].rows.length -
            jqGrid.find('tr.responsive-grid-details').length;
    }

    /*
     * Replace the designated rows.
     */
    /*
     * updateGridRows(newRowElements)
     *   Replace all table rows with a new set of rows. If newRowElements is null,
     *   all rows are simply deleted.
     */
    /*
     * updateGridRows(insertionPoint,newRowElements)
     *   Insert new rows *before* the insertionPoint. If newRowElements is null,
     *   nothing occurs.
     */
    /*
     * updateGridRows(fromIndex,toIndex,newRowElements)
     *   Delete the rows between fromIndex and toIndex-1 and insert the new rows.
     *   If newRowElements is null, then this operation is a simple deletion.
     */
    /*
     * newRowElements can be an HTML string or a collection of DOM row elements.
     */
    function updateGridRows() {
        let newRowElements = null,
            startIndex = -1,
            endIndex = -1,
            jqGrid = jq(this),
            config = jqGrid.data('responsiveGrid');

        if (arguments.length > 0) {
            let rowObj = arguments[arguments.length-1];
            newRowElements = (typeof(rowObj) === 'object') ? rowObj : jq(rowObj);
        }
        if (arguments.length < 2) {
            /*
             * Conceal all detail rows that are currently displayed.
             */
            if (config.onHideDetails)
                jqGrid.find('>tbody:first>tr.'+config.styleClasses.expandedRow).trigger('click.responsiveGrid');
            /*
             * Remove all existing rows.
             */
            jqGrid.find('>tbody:first>tr').delete();
            /*
             * Insert the new rows.
             */
            if (newRowElements) {
                processGridRows(config,jqGrid,newRowElements);
                jqGrid.find('>tbody:first').addContent(newRowElements);
            }
            jqGrid.trigger('responsiveGrid.rows.changed');
            return;
        }
    }
})(jQuery,window,undefined);