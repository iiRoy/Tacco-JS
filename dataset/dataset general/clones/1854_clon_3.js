/**
 * Manages the presentation and interaction logic for various task collections.
 * Leverages a global application context, `APP_GLOBAL_CONTEXT`, which must expose
 * `itemManager` for self-reference (critical for global event handlers where `this` is remapped).
 * Also depends on `urlRouter`, `rowManipulator`, and `notifier` from the same global context.
 *
 * @dependency jQuery (tested with versions 1.4.x)
 * @dependency url-router.js
 * @dependency row-manipulator.js
 * @dependency notification-system.js
 */
function ItemManager() {
    // Stores the outcomes of asynchronous data operations.
    this.operationResult = {
        payload: null, // Data received from the server
        requestInfo: null, // Details about the HTTP request
        lastError: null // Any error encountered during the operation
    };

    // Configuration for how many items are displayed on the main page.
    this.itemsPerPageCount = 10;

    // Reference to the rendered list of task categories/groups.
    this.groupingsContainer = null;

    // Current value entered into the search input field.
    this.searchCriterion = '';
    // The last successfully executed search query, used for comparison and reset logic.
    this.previousSearchTerm = '';

    // Stores a custom date selected for task planning.
    this.scheduledCustomDate = false;

    // Handles for various asynchronous timers to control UI updates and data fetching.
    this.searchDelayTimer = null;
    this.refreshIntervalHandle = null;
    this.resizeThrottleTimer = null;
    this.contentUpdateDelay = null;

    // Tracks if an item is currently being edited to prevent concurrent actions.
    this.activeEditSession = {
        isBlocked: false,
        elementId: null
    };

    // Current navigation parameters derived from the URL hash.
    this.currentPageIndex = null;
    this.selectedCategoryIdentifier = null;
    this.activeViewType = null;

    /**
     * Updates the internal navigation parameters based on provided values.
     *
     * @param {number|string} pageIndex - The index for the primary list view.
     * @param {number|string} categoryId - The identifier for the currently active category.
     * @param {number|string} viewMode - An integer indicating the active tab/view type.
     * @returns {void}
     */
    this.configureViewParameters = function (pageIndex, categoryId, viewMode) {
        if (typeof pageIndex === 'undefined' || typeof categoryId === 'undefined' || typeof viewMode === 'undefined') {
            console.warn("ItemManager: Attempted to set incomplete view parameters.");
            return;
        }
        this.currentPageIndex = parseInt(pageIndex, 10) || 1; // Ensure it's a number, default to 1
        this.selectedCategoryIdentifier = categoryId;
        this.activeViewType = parseInt(viewMode, 10) || 0; // Ensure it's a number, default to 0
    };

    // --- Utility functions for timer management ---

    /**
     * Halts any currently active content update or refresh timers.
     * Ensures no stale or overlapping operations.
     * @returns {void}
     */
    this.resetActivityTimers = function () {
        if (this.contentUpdateDelay) {
            clearTimeout(this.contentUpdateDelay);
            this.contentUpdateDelay = null;
        }
        if (this.refreshIntervalHandle) {
            clearInterval(this.refreshIntervalHandle);
            this.refreshIntervalHandle = null;
        }
    };

    /**
     * Establishes new timers for periodic content updates and full refreshes.
     * Clears any existing timers before setting new ones.
     * @returns {void}
     */
    this.initiatePeriodicUpdates = function () {
        this.resetActivityTimers(); // Clear old timers first

        // Set a delayed content fetch after a short period.
        this.contentUpdateDelay = setTimeout(() => {
            // Use APP_GLOBAL_CONTEXT to correctly reference the manager in a global context.
            APP_GLOBAL_CONTEXT.itemManager.retrieveContentItems();
        }, APP_GLOBAL_CONTEXT.config.timeouts.changed);

        // Set a recurring interval for full content refreshes.
        this.refreshIntervalHandle = setInterval(this.triggerFullContentRefresh,
            APP_GLOBAL_CONTEXT.config.timeouts.refresh);
    };

    /**
     * Forces an immediate full refresh of the displayed task list.
     * @returns {void}
     */
    this.triggerFullContentRefresh = function () {
        // This function is often called in a global context; ensure proper 'this' binding.
        APP_GLOBAL_CONTEXT.itemManager.retrieveContentItems();
    };
    // --- End timer utilities ---

    // --- Task loading visual feedback utilities ---

    /**
     * Activates a visual loading indicator if no editing session is active.
     *
     * @returns {boolean} True if the loading state was successfully set, false if blocked by editing.
     */
    this.indicateLoadingState = function () {
        if (this.activeEditSession.isBlocked) {
            console.log("ItemManager: Loading blocked due to active editing session.");
            return false;
        }

        APP_GLOBAL_CONTEXT.config.listArea.children('.progress-overlay').show();
        return true;
    };

    /**
     * Deactivates the visual loading indicator.
     * @returns {void}
     */
    this.hideLoadingIndicator = function () {
        APP_GLOBAL_CONTEXT.config.listArea.children('.progress-overlay').hide();
    };
    // --- End task loading utilities ---

    /**
     * Assigns a custom planning date.
     *
     * @param {string} dateValue - A string representing the desired task due date.
     * @returns {void}
     */
    this.setSpecificPlanDate = function (dateValue) {
        this.scheduledCustomDate = dateValue;
    };

    /**
     * Initiates the process of fetching the latest task and group data.
     * This method simulates an API call and then triggers the UI rendering.
     * @returns {void}
     */
    this.retrieveContentItems = function () {
        const managerRef = APP_GLOBAL_CONTEXT.itemManager; // Cache reference for clarity

        // Simulate fetching data from a data source or API.
        managerRef.operationResult.payload = {
            taskData: APP_GLOBAL_CONTEXT.dataSource.get_tasks(),
            categoryData: APP_GLOBAL_CONTEXT.dataSource.get_folders(),
            itemCounts: [2, 0, 4, 12], // Example counts for tabs
            pagerHtml: '<div class="pagination-controls"><a href="#p=1">1</a> <a href="#p=2">2</a></div>'
        };

        // If data retrieval was successful, proceed to render.
        if (managerRef.operationResult.payload && managerRef.operationResult.payload.taskData) {
            managerRef.renderContentStructure();
        } else {
            console.error("ItemManager: Failed to retrieve content data.");
            APP_GLOBAL_CONTEXT.notifier.add(3, 'Failed to load content.');
        }

        // Hide any active loading indicators.
        managerRef.hideLoadingIndicator();

        // Update the visual state of the navigation tabs.
        managerRef.highlightCurrentNavigationView();
    };

    /**
     * Updates the visual styling of the navigation tabs to reflect the currently active view.
     * @returns {void}
     */
    this.highlightCurrentNavigationView = function () {
        $('.navigation-tabs .view-icon', APP_GLOBAL_CONTEXT.config.listArea)
            .removeClass('active-view')
            .eq(this.activeViewType)
            .addClass('active-view');
    };

    /**
     * Constructs and displays the task list and related UI elements
     * based on the data stored in `this.operationResult.payload`.
     * @returns {void}
     */
    this.renderContentStructure = function () {
        const payload = this.operationResult.payload;
        if (!payload || !payload.taskData) {
            console.warn("ItemManager: No payload data available for rendering.");
            return;
        }

        // Update group dropdowns before rendering tasks
        this.refreshCategoryDropdown(payload.categoryData);

        // Clear existing messages and task grid content
        $('.empty-state-message', APP_GLOBAL_CONTEXT.config.listArea).remove();
        $('.data-grid', APP_GLOBAL_CONTEXT.config.listArea)
            .empty(); // Remove all children and then empty HTML

        // Use a document fragment for efficient DOM manipulation
        const fragment = document.createDocumentFragment();

        // Iterate through task data and build each row
        payload.taskData.forEach((taskItem, index) => {
            const taskElement = this.constructContentRowElement(taskItem, index);
            if (taskElement) {
                fragment.appendChild(taskElement[0]); // Append the raw DOM element from jQuery object
            }
        });
        $('.data-grid', APP_GLOBAL_CONTEXT.config.listArea).append(fragment);

        // Update pagination controls
        const pagerContainer = $('.pagination-controls', APP_GLOBAL_CONTEXT.config.listArea);
        if (pagerContainer.length) {
            pagerContainer.remove(); // Remove existing pager
        }
        const newPager = $(payload.pagerHtml).appendTo(APP_GLOBAL_CONTEXT.config.listArea);
        newPager.children('a').on('click', onPaginationLinkClicked);

        // Update numerical counts on tabs
        payload.itemCounts.forEach((count, idx) => {
            $('.navigation-tabs .count-bubble', APP_GLOBAL_CONTEXT.config.listArea)
                .eq(idx)
                .html(count);
        });
    };

    /**
     * Generates a single HTML row element for a given task object.
     *
     * @param {object} taskItem - The JSON object representing a single task.
     * @param {number} rowIndex - The index of the task within the current list.
     * @returns {jQuery} A jQuery object representing the constructed task row.
     */
    this.constructContentRowElement = function (taskItem, rowIndex) {
        const rowTemplate = APP_GLOBAL_CONTEXT.config.templates.mainRow.clone();
        const descriptionField = rowTemplate.children('.item-description');
        const statusCheckbox = rowTemplate.children('.status-checkbox').children('input');
        const priorityControl = rowTemplate.children('.priority-indicator');
        const dueDateField = rowTemplate.children('.due-date-display').children('.editable-field');
        const participantList = rowTemplate.children('.participant-list');
        const deleteControl = rowTemplate.children('.delete-action');

        // Handle task completion status
        if (taskItem.is_done) {
            statusCheckbox.prop('checked', true);
            if (this.activeViewType !== 3) { // Assuming 3 is "Completed" view
                rowTemplate.addClass('task-completed');
            }
        }
        statusCheckbox.on('click', onCompletionStatusToggled);

        // Set task priority class and click handler
        priorityControl
            .addClass(`priority-${taskItem.priority}`)
            .on('click', onPriorityControlEngaged);

        // Handle task group display
        if (taskItem.group) {
            const groupTag = APP_GLOBAL_CONTEXT.config.templates.rowGroup.clone()
                .attr('href', `#g=${taskItem.group.id}`)
                .html(taskItem.group.name);

            if (this.activeViewType === 1) { // Special handling for "Assignments" view
                groupTag.html(groupTag.html() + ': ').prependTo(descriptionField);
                descriptionField.addClass('no-group-editing');
            } else {
                groupTag.prependTo(descriptionField.children('.editable-field'));
                taskItem.text = `: ${taskItem.text}`; // Prepend colon to task text
            }
        }

        // Populate task description and set up editable behavior
        descriptionField.children('.editable-field')
            .append(taskItem.text)
            .on('click', APP_GLOBAL_CONTEXT.rowManipulator.replaceHtml);
        descriptionField.find('a').on('click', onInteractiveElementClicked);

        // Populate due date and set up editable behavior
        dueDateField
            .html(taskItem.due_out)
            .on('click', APP_GLOBAL_CONTEXT.rowManipulator.replaceHtml);

        // Populate followers/participants
        const followersElement = APP_GLOBAL_CONTEXT.config.templates.followers.clone();
        if (Array.isArray(taskItem.followers)) {
            taskItem.followers.forEach(follower => {
                followersElement.find(`.user-select-checkbox.u${follower.id}`).prop('checked', true);
            });
        }
        followersElement.appendTo(participantList).find('input').on('click', onFollowActionEngaged);

        // Configure delete control
        deleteControl
            .children('input[name="task_id"]').val(taskItem.id).end()
            .children('input[name="user_id"]').val(taskItem.user_id).end()
            .children('button.delete-btn').on('click', onDeletionRequestInitiated);

        return rowTemplate;
    };

    /**
     * Executes a search operation based on the current `searchCriterion`.
     * This function includes validation, loading indicators, and error handling.
     * @returns {void}
     */
    this.executeSearchOperation = function () {
        const currentSearchTerm = this.searchCriterion.trim();

        // Guard clauses for search validity
        if (currentSearchTerm.length <= APP_GLOBAL_CONTEXT.config.counts.searchMinLength) {
            console.log("ItemManager: Search term too short or empty.");
            return;
        }
        if (this.previousSearchTerm === currentSearchTerm) {
            console.log("ItemManager: Search term unchanged, skipping search.");
            return;
        }

        const managerInstance = this; // Capture 'this' for use in callbacks

        $.ajax({
            type: 'GET',
            url: `${APP_GLOBAL_CONTEXT.config.paths.list}?page=${managerInstance.searchPageIndex}&query=${encodeURIComponent(currentSearchTerm)}`,
            dataType: 'json',
            beforeSend: function () {
                $('.search-spinner', APP_GLOBAL_CONTEXT.config.listArea).show();
                managerInstance.indicateLoadingState();
            },
            error: function (xhr, textStatus, errorThrown) {
                managerInstance.operationResult.lastError = { xhr, textStatus, errorThrown };
                managerInstance.previousSearchTerm = currentSearchTerm; // Remember the failed search attempt
                managerInstance.hideLoadingIndicator();
                $('.search-spinner', APP_GLOBAL_CONTEXT.config.listArea).hide();

                if (xhr.status === 404) {
                    $('.data-grid', APP_GLOBAL_CONTEXT.config.listArea).empty();
                    APP_GLOBAL_CONTEXT.config.templates.noTasksMessage.insertBefore($('.data-grid',
                        APP_GLOBAL_CONTEXT.config.listArea));
                    APP_GLOBAL_CONTEXT.notifier.add(1, 'No results found for your search.');
                } else {
                    APP_GLOBAL_CONTEXT.notifier.add(2, `Error during search: ${errorThrown}`);
                }
            },
            success: function (response, textStatus, request) {
                managerInstance.previousSearchTerm = currentSearchTerm; // Remember successful search
                $('.search-spinner', APP_GLOBAL_CONTEXT.config.listArea).hide();
                managerInstance.hideLoadingIndicator();

                // Clear previous list content
                $('.data-grid', APP_GLOBAL_CONTEXT.config.listArea).empty();

                // Store and process the new search results
                managerInstance.operationResult.payload = {
                    taskData: response.tasks,
                    categoryData: response.groups, // Assuming groups might also be returned with search
                    itemCounts: response.counts,
                    pagerHtml: response.pager
                };
                managerInstance.operationResult.requestInfo = request;
                managerInstance.renderContentStructure(); // Re-render with search results

                // Update the title to reflect search results
                const currentCategoryUrl = `#t=${managerInstance.activeViewType}`;
                const searchTitle = APP_GLOBAL_CONTEXT.config.titlesPlain[4]; // Assuming index 4 is 'Search Results'
                $('.list-title', APP_GLOBAL_CONTEXT.config.listArea)
                    .html(`<a href="${currentCategoryUrl}">${searchTitle}</a>`);
            }
        });
    };

    /**
     * Dynamically calculates the optimal number of tasks to display per page
     * based on the available screen height.
     * @returns {void}
     */
    this.calculateItemsPerPage = function () {
        const listAreaHeight = APP_GLOBAL_CONTEXT.config.listArea.height();
        const headerFooterOffset = APP_GLOBAL_CONTEXT.config.pixels.mainMinusHeight;
        const rowHeight = APP_GLOBAL_CONTEXT.config.pixels.rowHeight;

        if (listAreaHeight <= headerFooterOffset) {
            this.itemsPerPageCount = 1; // Minimum one item if space is very limited
            return;
        }

        this.itemsPerPageCount = Math.max(1,
            Math.floor((listAreaHeight - headerFooterOffset) / rowHeight)
        );
    };

    /**
     * Responds to window resize events by recalculating items per page
     * and potentially triggering a content reload if display parameters change.
     * Uses debouncing to prevent excessive re-renders.
     * @returns {void}
     */
    this.handleWindowResizing = function () {
        clearTimeout(this.resizeThrottleTimer);
        this.resizeThrottleTimer = setTimeout(() => {
            this.calculateItemsPerPage();

            // Adjust loading overlay sizes to match their parent containers
            $('.progress-overlay').each(function () {
                $(this).height($(this).parent().height() + 'px');
            });

            let needsReload = false;
            const currentGridHeight = $('.data-grid', APP_GLOBAL_CONTEXT.config.listArea).height();
            const expectedGridHeight = this.itemsPerPageCount * APP_GLOBAL_CONTEXT.config.pixels.rowHeight;

            // Check if the number of visible rows has effectively changed
            if (currentGridHeight !== expectedGridHeight) {
                $('.data-grid', APP_GLOBAL_CONTEXT.config.listArea).height(expectedGridHeight);
                needsReload = true;
            }

            // If URL hash hasn't been processed yet, also consider it a reload trigger.
            if (!APP_GLOBAL_CONTEXT.urlRouter.hashProcessed) {
                needsReload = true;
            }

            if (needsReload) {
                APP_GLOBAL_CONTEXT.itemManager.retrieveContentItems();
            }
        }, 200); // Debounce for 200ms
    };

    /**
     * Updates the list of groups displayed in the main dropdown menu.
     *
     * @param {Array<object>} [groupsData] - An optional array of group objects. If not provided,
     *                                       `this.operationResult.payload.categoryData` is used.
     * @returns {void}
     */
    this.refreshCategoryDropdown = function (groupsData) {
        const activeGroups = groupsData || this.operationResult.payload.categoryData;

        // Clean up existing dropdown if present
        if (this.groupingsContainer) {
            this.groupingsContainer.remove();
            this.groupingsContainer = null;
        }

        // If no groups data or empty, return early.
        if (!Array.isArray(activeGroups) || activeGroups.length === 0) {
            $('.list-title', $('#main')).html(APP_GLOBAL_CONTEXT.config.titlesHtml[this.activeViewType]);
            return;
        }

        // Clone the template for the groups dropdown
        const newGroupListElement = APP_GLOBAL_CONTEXT.config.templates.groupsDropdown.clone();

        activeGroups.forEach(group => {
            let groupLinkHref = `#g=${group.id}`;
            let groupDisplayTitle = `${group.name} (${group.num_tasks})`;

            // Special handling if this group is currently selected
            if (this.selectedCategoryIdentifier && parseInt(this.selectedCategoryIdentifier, 10) === group.id) {
                groupLinkHref = `#t=${this.activeViewType}`; // Link back to the main view type
                $('.list-title', $('#main'))
                    .html(`<a href="${groupLinkHref}">${groupDisplayTitle}</a>`);
                groupDisplayTitle = APP_GLOBAL_CONTEXT.config.titlesPlain[this.activeViewType]; // Use generic title for the tab
            }

            const groupItem = APP_GLOBAL_CONTEXT.config.templates.groupItem.clone();
            groupItem.children('a')
                .attr('href', groupLinkHref)
                .html(groupDisplayTitle);
            newGroupListElement.append(groupItem);
        });

        // Append the new dropdown to the UI and attach event listeners
        newGroupListElement.appendTo($('.group-selection-area', APP_GLOBAL_CONTEXT.config.listArea));
        $('.group-selection-area a').on('click', onCategoryChangeRequested);

        this.groupingsContainer = newGroupListElement;
    };

    /************************************************************************/
    /**
     * Event Handlers for UI Interactions
     * These functions are typically invoked by jQuery event listeners.
     */
    /************************************************************************/

    /**
     * Callback triggered when the search input field content changes.
     * Manages search initiation, debouncing, and result display.
     * @param {Event} e - The DOM event object.
     * @returns {void}
     */
    const onSearchInputChanged = (e) => {
        const inputElement = $(e.target);
        const currentSearchValue = inputElement.val().trim();
        const managerRef = APP_GLOBAL_CONTEXT.itemManager;

        managerRef.searchPageIndex = 1; // Reset page for new search

        // Clear any pending search operations
        clearTimeout(managerRef.searchDelayTimer);

        // If search value is too short, decide whether to clear search results
        if (currentSearchValue.length < APP_GLOBAL_CONTEXT.config.counts.searchMinLength) {
            if (currentSearchValue.length === 0 && managerRef.previousSearchTerm.length > 0) {
                // If search box is cleared after a previous search, reload full list
                managerRef.retrieveContentItems();
                managerRef.previousSearchTerm = ''; // Clear previous search state
            }
            return; // Don't proceed with search if too short
        }

        // If search term hasn't changed, do nothing
        if (managerRef.previousSearchTerm === currentSearchValue) {
            return;
        }

        // Clear other ongoing timers to prioritize search
        managerRef.resetActivityTimers();

        // Debounce the search execution
        managerRef.searchDelayTimer = setTimeout(() => {
            managerRef.searchCriterion = currentSearchValue;
            managerRef.executeSearchOperation();
        }, APP_GLOBAL_CONTEXT.config.timeouts.searchDelay);
    };

    /**
     * Callback for clicks on pagination links.
     * Updates the URL hash or triggers a new search if a search is active.
     * @param {Event} e - The DOM event object.
     * @returns {boolean} False to prevent default link behavior.
     */
    const onPaginationLinkClicked = (e) => {
        e.preventDefault(); // Stop default navigation
        const clickedLink = $(e.target);
        const managerRef = APP_GLOBAL_CONTEXT.itemManager;

        const newPage = parseInt(APP_GLOBAL_CONTEXT.urlRouter.extractParamFromUrl(
            APP_GLOBAL_CONTEXT.config.params.mainPage, clickedLink.attr('href')
        ), 10);

        if (managerRef.previousSearchTerm.length > 0) {
            // If currently in search mode, update search page and re-execute search
            managerRef.searchPageIndex = newPage;
            managerRef.searchCriterion = managerRef.previousSearchTerm; // Re-use the existing search term
            managerRef.executeSearchOperation();
        } else {
            // Otherwise, update the URL hash for the main page
            APP_GLOBAL_CONTEXT.urlRouter.updateUrlHash(APP_GLOBAL_CONTEXT.config.params.mainPage, newPage);
        }
        return false; // Redundant with e.preventDefault(), but good practice.
    };

    /**
     * Callback for priority control clicks, delegates to row manipulator.
     * @param {Event} e - The DOM event object.
     * @returns {boolean} False to prevent default behavior.
     */
    const onPriorityControlEngaged = (e) => {
        APP_GLOBAL_CONTEXT.rowManipulator.updateTaskField('priority', $(e.target));
        return false;
    };

    /**
     * Callback for task completion checkbox changes, delegates to row manipulator.
     * @param {Event} e - The DOM event object.
     * @returns {void}
     */
    const onCompletionStatusToggled = (e) => {
        APP_GLOBAL_CONTEXT.rowManipulator.updateTaskField('is_done', $(e.target));
    };

    /**
     * Callback for task deletion button clicks, delegates to row manipulator.
     * @param {Event} e - The DOM event object.
     * @returns {boolean} False to prevent default behavior.
     */
    const onDeletionRequestInitiated = (e) => {
        APP_GLOBAL_CONTEXT.rowManipulator.updateTaskField('delete', $(e.target));
        return false;
    };

    /**
     * Callback for task undelete (restore) button clicks, delegates to row manipulator.
     * @param {Event} e - The DOM event object.
     * @returns {boolean} False to prevent default behavior.
     */
    const onRestoreRequestInitiated = (e) => {
        APP_GLOBAL_CONTEXT.rowManipulator.updateTaskField('undelete', $(e.target));
        return false;
    };

    /**
     * Callback for clicks on interactive elements within task descriptions.
     * Handles group links or external URLs.
     * @param {Event} e - The DOM event object.
     * @returns {boolean|void} False to prevent default link behavior if handled, or void otherwise.
     */
    const onInteractiveElementClicked = (e) => {
        const clickedElement = $(e.target);
        const href = clickedElement.attr('href');

        if (clickedElement.hasClass('group-tag')) {
            // If it's a group tag, update the URL hash to filter by group.
            const groupId = href.substring(3); // e.g., '#g=123' -> '123'
            APP_GLOBAL_CONTEXT.urlRouter.updateUrlHash(APP_GLOBAL_CONTEXT.config.params.group, groupId, true);
            return false;
        } else if (!e.ctrlKey) {
            // If it's another link and not a Ctrl+Click (which typically opens in a new tab),
            // navigate within the current window.
            window.location.href = href;
            return false;
        }
        // For Ctrl+Click or other links, let the browser handle default behavior.
    };

    /**
     * Callback for clicks on follower selection checkboxes.
     * @param {Event} e - The DOM event object.
     * @returns {void}
     */
    const onFollowActionEngaged = (e) => {
        APP_GLOBAL_CONTEXT.rowManipulator.updateTaskField('follow', $(e.target));
    };

    /**
     * Callback for clicks on group links in the dropdown.
     * Updates the URL hash to filter tasks by the selected group.
     * @param {Event} e - The DOM event object.
     * @returns {boolean} False to prevent default link behavior.
     */
    const onCategoryChangeRequested = (e) => {
        e.preventDefault();
        const clickedLink = $(e.target);
        const href = clickedLink.attr('href');
        const groupId = APP_GLOBAL_CONTEXT.urlRouter.extractParamFromUrl(
            APP_GLOBAL_CONTEXT.config.params.group, href
        );
        APP_GLOBAL_CONTEXT.urlRouter.updateUrlHash(APP_GLOBAL_CONTEXT.config.params.group, groupId, true);
        return false;
    };
}