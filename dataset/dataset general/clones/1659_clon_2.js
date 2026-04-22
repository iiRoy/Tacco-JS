!function(jq){
    // Core component for managing pagination display and logic
    var PageNavigator = function(targetElement, configuration){
        this.$container = jq(targetElement);
        this.settings = configuration;
    };

    PageNavigator.prototype = {
        /**
         * Initializes the visual structure and elements of the pagination widget.
         * @private
         */
        _setupVisuals: function(){
            var selfRef = this;
            var $mainElement = this.$container;
            var componentConfig = this.settings;

            $mainElement.addClass("page-navigator-widget");
            var htmlFragments = [
                '<div class="overall-count-display"></div>',
                '<ul class="page-number-list"></ul>',
                '<div class="page-size-selector"><select></select></div>'
            ];
            $mainElement.append(jq(htmlFragments.join('')));

            this.$recordCountSpan = $mainElement.find('.overall-count-display');
            this.$paginationItems = $mainElement.find('.page-number-list');
            this.$itemsPerPageDropdown = $mainElement.find('.page-size-selector select');

            var $sizeDropdown = this.$itemsPerPageDropdown;
            jq.each(componentConfig.availablePageSizes, function(){
                var $choiceElement = jq('<option></option>')
                    .prop('value',this)
                    .text(selfRef.templateFormatter(componentConfig.pageSizeLabelTemplate,[this]));
                $sizeDropdown.append($choiceElement);
            });

            $sizeDropdown.on('change', function(){
                $mainElement.data('currentPage', 1);
                selfRef.$linkedGrid.refreshData();
            });

        },

        /**
         * Renders the standard pagination controls (previous, page numbers, next).
         * @private
         * @param {number} activePage The current page number to display.
         * @param {number} overallCount The total number of items across all pages.
         * @param {number} recordsPerPage The number of items shown on each page.
         */
        _drawBasicControls: function(activePage, overallCount, recordsPerPage){
            var selfRef = this;
            var $mainElement = this.$container;
            var $pageNumberList = this.$paginationItems;

            var totalPages = overallCount % recordsPerPage === 0 ? parseInt(overallCount/recordsPerPage) : parseInt(overallCount/recordsPerPage) + 1;
            totalPages = totalPages ? totalPages : 0;
            if(totalPages === 0){
                activePage = 1;
            }else if(activePage > totalPages){
                activePage = totalPages;
            }else if(activePage < 1 && totalPages !== 0){
                activePage = 1;
            }
            // Generate the 'Previous' button
            var $previousButton = jq('<li class="previous-page-link"><a>«</a></li>');
            if(activePage <= 1){
                $previousButton.addClass('disabled-link');
            }else{
                $previousButton.find('a').on('click', function(){
                    $mainElement.data('currentPage', activePage - 1);
                    selfRef.$linkedGrid.refreshData();
                });
            }
            $pageNumberList.append($previousButton);
            // End of previous button

            // Construct the list of page numbers to display
            var displayPages = [1];
            if(activePage > 4 ){
                displayPages.push('...');
            }
            for(var idx = 0; idx < 5; idx++){
                var pageIndex = activePage - 2 + idx;
                if(pageIndex > 1 && pageIndex <= totalPages - 1){
                    displayPages.push(pageIndex);
                }
            }
            if(activePage + 1 < totalPages - 1){
                displayPages.push('...');
            }
            if(totalPages > 1){
                displayPages.push(totalPages);
            }
            jq.each(displayPages, function(arrayIndex, pageValue){
                var $listItem = jq('<li><a></a></li>');
                if(pageValue === '...'){
                    $listItem.addClass('ellipsis-separator').html('...');
                }else if(pageValue === activePage){
                    $listItem.addClass('active-page').find('a').text(pageValue);
                }else{
                    $listItem.find('a').text(pageValue).prop('title','Go to page '+ pageValue).on('click', function(evt){
                        $mainElement.data('currentPage', pageValue);
                        selfRef.$linkedGrid.refreshData();
                    });
                }
                $pageNumberList.append($listItem);
            });
            // End of page number list

            // Generate the 'Next' button
            var $nextButton = jq('<li class="next-page-link"><a title="Next Page">»</a></li>');
            if(activePage >= totalPages){
                $nextButton.addClass('disabled-link');
            }else{
                $nextButton.find('a').on('click', function(){
                    $mainElement.data('currentPage', activePage + 1);
                    selfRef.$linkedGrid.refreshData();
                });
            }
            $pageNumberList.append($nextButton);
        },

        /**
         * Reserved for future search-specific pagination logic.
         * @private
         * @param {number} activePage Current page number.
         * @param {number} overallCount Total items.
         * @param {number} recordsPerPage Items per page.
         */
        _processSearchPaging: function(activePage, overallCount, recordsPerPage){

        },

        /**
         * Refreshes the pagination display based on provided data.
         * @param {object} queryArguments An object potentially containing page, total count, and limit.
         */
        updatePagination: function(queryArguments){
            var $mainElement = this.$container;
            var $sizeDropdown = this.$itemsPerPageDropdown;
            var componentConfig = this.settings;

            if(!queryArguments){
                queryArguments = {};
            }

            var currentPage = queryArguments[componentConfig.pageNumberKey];
            if(currentPage === undefined || currentPage === null){
                currentPage = $mainElement.data('currentPage');
            }
            $mainElement.data('currentPage', currentPage);

            var overallCount = queryArguments[componentConfig.totalRecordsKey];
            if(overallCount === undefined){
                overallCount = 0;
            }
            $mainElement.data('totalRecords', overallCount);

            var recordsPerPage = queryArguments[componentConfig.pageSizeKey];
            if(!recordsPerPage){
                recordsPerPage = $sizeDropdown.val();
            }
            this.$itemsPerPageDropdown.val(recordsPerPage);

            this.$recordCountSpan.html(this.templateFormatter(componentConfig.totalRecordsLabelTemplate,[overallCount]));
            this.$paginationItems.empty();

            this._drawBasicControls(currentPage, overallCount, this.$itemsPerPageDropdown.val());
        },

        /**
         * Formats a string by replacing numbered placeholders with arguments.
         * @param {string} messageString The template string (e.g., "Hello {0}").
         * @param {Array} replacements An array of values to insert.
         * @returns {string} The formatted string.
         */
        templateFormatter: function(messageString, replacements){
            return messageString.replace(/{(\d+)}/g, function(fullMatch, captureGroupIndex) {
                return typeof replacements[captureGroupIndex] != 'undefined'
                    ? replacements[captureGroupIndex]
                    : fullMatch
                    ;
            });
        },

        /**
         * Gathers the current pagination parameters for data fetching.
         * @returns {object} An object with current page number and page size.
         */
        retrieveParameters: function(){
            var componentConfig = this.settings;
            var $mainElement = this.$container;
            var $sizeDropdown = this.$itemsPerPageDropdown;

            var queryArguments = {};
            queryArguments[componentConfig.pageNumberKey] = $mainElement.data('currentPage');
            queryArguments[componentConfig.pageSizeKey] = $sizeDropdown.val();
            return queryArguments;
        },

        /**
         * Initializes the pagination component, setting up layout and linking to a grid.
         * @param {jQuery} $associatedGrid The jQuery object representing the data grid.
         */
        initializePlugin: function($associatedGrid){
            var selfRef = this;
            var componentConfig = selfRef.settings;
            this.$linkedGrid = $associatedGrid;
            this._setupVisuals();
            this.$linkedGrid.on('dataLoadedSuccess', function(evt, payload){
                selfRef.updatePagination(payload);
            });

            var initialArguments = {};
            initialArguments[componentConfig.totalRecordsKey] = 0;
            initialArguments[componentConfig.pageNumberKey] = componentConfig.initialPageNumber;
            initialArguments[componentConfig.pageSizeKey] = componentConfig.defaultPageSize;
            this.updatePagination(initialArguments);

            // If the linked grid has an index column, update its rendering logic.
            if($associatedGrid.settings.indexColumnEnabled){
                var rowNumberColumn = $associatedGrid.settings.columns[0];
                rowNumberColumn.renderer = function(cellValue, rowData, rowPosition){
                    var currentParams = selfRef.retrieveParameters();
                    return '<label class="row-index-label">' +
                        (rowPosition + 1 + ((currentParams[componentConfig.pageNumberKey]-1) * currentParams[componentConfig.pageSizeKey])) +
                        '</label>';
                };
            }

        }

    };

    // jQuery plugin wrapper for PageNavigator
    jq.fn.pageNavigator = function(){

        if(arguments.length === 0 || typeof arguments[0] === 'object'){
            var pluginSetup = arguments[0]
                , instanceData = this.data('pageNavigator')
                , finalConfig = jq.extend(true, {}, jq.fn.pageNavigator.defaultConfiguration, pluginSetup);
            if (!instanceData) {
                instanceData = new PageNavigator(this[0], finalConfig);
                this.data('pageNavigator', instanceData);
            }
            return jq.extend(true, this, instanceData);
        }
        if(typeof arguments[0] === 'string'){
            var instanceData = this.data('pageNavigator');
            var pluginMethod = instanceData[arguments[0]];
            if(pluginMethod){
                var callArguments = Array.prototype.slice.call(arguments);
                return pluginMethod.apply(instanceData,callArguments.slice(1));
            }
        }
    };

    // Default configuration settings for the pageNavigator plugin
    jq.fn.pageNavigator.defaultConfiguration = {
         displayStyle: 'plain'
        , totalRecordsKey: 'totalRecords'
        , initialPageNumber: 1
        , pageNumberKey: 'pageNumber'
        , pageSizeKey: 'pageSize'
        , pageSizeLabelTemplate: 'Show {0} items'
        , totalRecordsLabelTemplate: 'Total <span>{0}</span> entries'
        , defaultPageSize: undefined
        , availablePageSizes: [15, 25, 35, 45]
    };

    // Expose the constructor for direct access if needed
    jq.fn.pageNavigator.Constructor = PageNavigator;

}(window.jQuery);