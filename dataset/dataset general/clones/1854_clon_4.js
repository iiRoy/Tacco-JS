(function(applicationGlobalReference) {
    // Internal state management for the content manager
    let moduleData = {
        cachedContent: null,
        lastInitiatedRequest: null,
        latestErrorState: null,
        displayItemsPerPage: 10,
        groupDisplayElement: null,
        currentQueryString: '',
        previousQueryString: '',
        customScheduleDate: null,
        activeTimers: {
            queryTimer: null,
            refreshCycleTimer: null,
            resizingTimer: null,
            contentRefreshTimer: null
        },
        displayEditState: [0, 0], // Replicating original's truthy [0,0] for 'not editing'
        activePageNumber: null,
        activeGroupIdentity: null,
        activeDisplayMode: null,
        queryPageNumber: 1 // Corresponds to search_page
    };

    // Helper for creating DOM elements without jQuery
    const createVisualElement = (tagName, classNames, attributesMap, textContentValue) => {
        const element = document.createElement(tagName);
        if (classNames) {
            element.className = Array.isArray(classNames) ? classNames.join(' ') : classNames;
        }
        if (attributesMap) {
            for (const key in attributesMap) {
                element.setAttribute(key, attributesMap[key]);
            }
        }
        if (textContentValue) {
            element.textContent = textContentValue;
        }
        return element;
    };

    // Helper for selecting DOM elements without jQuery
    const selectVisualElement = (selector, parentElement) => (parentElement || document).querySelector(selector);
    const selectAllVisualElements = (selector, parentElement) => Array.from((parentElement || document).querySelectorAll(selector));

    // Abstractions for the external application global object
    const appConfig = applicationGlobalReference.constants;
    const dataAccessLayer = applicationGlobalReference.data;
    const urlProcessorModule = applicationGlobalReference.url_handler;
    const itemModificationModule = applicationGlobalReference.row_handler;
    const notificationSystem = applicationGlobalReference.notif_handler;

    // --- Core Module Functions ---

    function setupDisplayConfiguration(page, group, displayMode) {
        moduleData.activePageNumber = page;
        moduleData.activeGroupIdentity = group;
        moduleData.activeDisplayMode = displayMode;
    }

    function clearScheduledActivities() {
        if (moduleData.activeTimers.contentRefreshTimer) {
            clearTimeout(moduleData.activeTimers.contentRefreshTimer);
            clearTimeout(moduleData.activeTimers.refreshCycleTimer);
        }
    }

    function startActivityMonitoring() {
        clearScheduledActivities();
        moduleData.activeTimers.contentRefreshTimer = setTimeout(() => {
            contentDisplayManager.fetchAndRenderContent();
        }, appConfig.timeouts.changed);
        moduleData.activeTimers.refreshCycleTimer = setInterval(contentDisplayManager.triggerFullRefresh,
            appConfig.timeouts.refresh);
    }

    function triggerFullRefresh() {
        contentDisplayManager.fetchAndRenderContent();
    }

    function showProgressIndicator() {
        // Replicating original behavior: `if ([0,0])` is truthy, so it always returns false if editing is [0,0]
        if (moduleData.displayEditState) {
            return false;
        }
        selectVisualElement('.loading', appConfig.list).style.display = 'block';
        return true;
    }

    function hideProgressIndicator() {
        selectVisualElement('.loading', appConfig.list).style.display = 'none';
    }

    function assignCustomSchedule(value) {
        moduleData.customScheduleDate = value;
    }

    function fetchAndRenderContent() {
        moduleData.cachedContent = {
            tasks: dataAccessLayer.get_tasks(),
            groups: dataAccessLayer.get_folders(),
            counts: [2, 0, 4, 12],
            pager: '<div class="page-controls">Page 1 of 5 <a href="#p=2">Next Page</a></div>'
        };

        buildVisualElements();
        hideProgressIndicator();
        highlightCurrentViewTab();
    }

    function highlightCurrentViewTab() {
        selectAllVisualElements('.tabs .icon', appConfig.list).forEach((tabIcon, index) => {
            if (index === moduleData.activeDisplayMode) {
                tabIcon.classList.add('active');
            } else {
                tabIcon.classList.remove('active');
            }
        });
    }

    function buildVisualElements() {
        updateGroupNavigation();

        selectAllVisualElements('.notasks', appConfig.list).forEach(el => el.remove());
        const taskTableSurface = selectVisualElement('.table', appConfig.list);
        taskTableSurface.innerHTML = '';

        Object.values(moduleData.cachedContent.tasks).forEach(taskData => {
            const taskRowNode = constructTaskRow(taskData);
            taskTableSurface.appendChild(taskRowNode);

            if (moduleData.activeDisplayMode === 1 && taskData.group) {
                const textSection = selectVisualElement('.text', taskRowNode);
                const editableSection = selectVisualElement('.editable', textSection);
                const groupSection = selectVisualElement('.g', textSection);

                if (groupSection) {
                    editableSection.style.width = `${textSection.offsetWidth - groupSection.offsetWidth - appConfig.ASSIGNMENT_EDITABLE_WIDTH_ADJUSTMENT}px`;
                    editableSection.style.textIndent = `${groupSection.offsetWidth + appConfig.pixels.assignmentindent}px`;
                }
            }
        });

        const existingPager = selectVisualElement('.pager', appConfig.list);
        if (existingPager) {
            existingPager.remove();
        }
        const newPagerContainer = createVisualElement('div', 'pager');
        newPagerContainer.innerHTML = moduleData.cachedContent.pager;
        appConfig.list.appendChild(newPagerContainer);
        selectAllVisualElements('a', newPagerContainer).forEach(link => {
            link.addEventListener('click', onPagerLinkActivated);
        });

        moduleData.cachedContent.counts.forEach((count, k) => {
            const countElement = selectVisualElement(`.tabs .c:nth-child(${k + 1})`, appConfig.list);
            if (countElement) {
                countElement.textContent = count;
            }
        });
    }

    function constructTaskRow(taskData) {
        const rowTemplateClone = appConfig.templates.mainrow.cloneNode(true);

        const completionCheckbox = selectVisualElement('.s input', rowTemplateClone);
        if (taskData.is_done) {
            completionCheckbox.checked = true;
            if (moduleData.activeDisplayMode !== 3) {
                rowTemplateClone.classList.add('done');
            }
        }
        completionCheckbox.addEventListener('click', onCompletionToggle);

        const priorityControl = selectVisualElement('.p', rowTemplateClone);
        priorityControl.classList.add(`pri_${taskData.priority}`);
        priorityControl.addEventListener('click', onPriorityChange);

        const textWrapper = selectVisualElement('.text', rowTemplateClone);
        const editableTextRegion = selectVisualElement('.editable', textWrapper);

        if (taskData.group) {
            const groupIdentifierLink = createVisualElement('a', 'g', {
                href: `#g=${taskData.group.id}`
            }, taskData.group.name);
            groupIdentifierLink.addEventListener('click', onTextElementInteraction);

            if (moduleData.activeDisplayMode === 1) {
                groupIdentifierLink.textContent += ': ';
                textWrapper.prepend(groupIdentifierLink);
                textWrapper.classList.add('nogroup');
            } else {
                editableTextRegion.prepend(groupIdentifierLink);
                taskData.text = ': ' + taskData.text;
            }
        }
        editableTextRegion.append(taskData.text);
        editableTextRegion.addEventListener('click', (e) => itemModificationModule.replace_html(e.currentTarget));

        selectAllVisualElements('a', textWrapper).forEach(link => {
            link.addEventListener('click', onTextElementInteraction);
        });

        const dueEditableRegion = selectVisualElement('.due .editable', rowTemplateClone);
        dueEditableRegion.textContent = taskData.due_out;
        dueEditableRegion.addEventListener('click', (e) => itemModificationModule.replace_html(e.currentTarget));

        const followerContainer = selectVisualElement('.followers', rowTemplateClone);
        const followerTemplateClone = appConfig.templates.followers.cloneNode(true);
        taskData.followers.forEach(follower => {
            const followerInput = selectVisualElement(`.u${follower.id}`, followerTemplateClone);
            if (followerInput) {
                followerInput.checked = true;
            }
        });
        followerContainer.appendChild(followerTemplateClone);
        selectAllVisualElements('input', followerTemplateClone).forEach(input => {
            input.addEventListener('click', onFollowerAction);
        });

        const deletionSection = selectVisualElement('.del', rowTemplateClone);
        selectVisualElement('input[name="task_id"]', deletionSection).value = taskData.id;
        selectVisualElement('input[name="user_id"]', deletionSection).value = taskData.user_id;
        selectVisualElement('a', deletionSection).addEventListener('click', onDeletionInitiated);

        return rowTemplateClone;
    }

    function onFollowerAction(event) {
        // Placeholder for follower action logic
        console.log('Follower interaction:', event.target.checked, event.target.name);
    }

    function executeContentSearch() {
        if (!moduleData.currentQueryString || moduleData.currentQueryString.length <= 0) {
            return;
        }

        const searchEndpoint = `${appConfig.paths.list}?p=${moduleData.queryPageNumber}&s=${moduleData.currentQueryString}`;

        showProgressIndicator();
        selectVisualElement('.search-s', appConfig.list).style.display = 'block';

        fetch(searchEndpoint)
            .then(response => {
                if (!response.ok) {
                    if (response.status === 404) {
                        const taskTableSurface = selectVisualElement('.table', appConfig.list);
                        taskTableSurface.innerHTML = '';
                        taskTableSurface.appendChild(appConfig.templates.notasks.cloneNode(true));
                        throw new Error('No items found (404)');
                    }
                    throw new Error(`Network response error: ${response.status}`);
                }
                return response.json();
            })
            .then(data => {
                moduleData.previousQueryString = moduleData.currentQueryString;
                hideProgressIndicator();
                selectVisualElement('.search-s', appConfig.list).style.display = 'none';

                selectVisualElement('.table', appConfig.list).innerHTML = '';

                moduleData.cachedContent = data;
                moduleData.lastInitiatedRequest = null;
                buildVisualElements();

                const groupUrl = `#t=${moduleData.activeGroupIdentity}`;
                const titleForSearch = appConfig.titles_plain[4];
                selectVisualElement('.title', appConfig.list).innerHTML = `<a href="${groupUrl}">${titleForSearch}</a>`;
            })
            .catch(error => {
                moduleData.previousQueryString = moduleData.currentQueryString;
                hideProgressIndicator();
                selectVisualElement('.search-s', appConfig.list).style.display = 'none';

                if (error.message !== 'No items found (404)') {
                    notificationSystem.add(2, 'Search operation failed: ' + error.message);
                }
            });
    }

    function computeVisibleItemsCount() {
        moduleData.displayItemsPerPage = Math.floor(((appConfig.list.offsetHeight -
            appConfig.pixels.mainminus) / appConfig.pixels.rowheight));
    }

    function handleWindowResizing() {
        let reloadRequired = false;

        computeVisibleItemsCount();

        selectAllVisualElements('.loading').forEach(loader => {
            loader.style.height = `${loader.parentElement.offsetHeight}px`;
        });

        const taskTableSurface = selectVisualElement('.table', appConfig.list);
        const desiredHeight = moduleData.displayItemsPerPage * appConfig.pixels.rowheight;
        if (taskTableSurface.offsetHeight !== desiredHeight) {
            taskTableSurface.style.height = `${desiredHeight}px`;
            reloadRequired = true;
        }

        if (!urlProcessorModule.hash_last) {
            reloadRequired = true;
        }

        if (reloadRequired) {
            contentDisplayManager.fetchAndRenderContent();
        }
    }

    function updateGroupNavigation(groupsData = moduleData.cachedContent.groups) {
        if (!moduleData.activeGroupIdentity) {
            selectVisualElement('.title', selectVisualElement('#main')).innerHTML = appConfig.titles_html[moduleData.activeDisplayMode];
        }

        if (moduleData.groupDisplayElement) {
            moduleData.groupDisplayElement.remove();
        }

        if (!groupsData || groupsData.length <= 0) {
            return;
        }

        moduleData.groupDisplayElement = appConfig.templates.groups.cloneNode(true);

        groupsData.forEach(groupItem => {
            let groupLinkDestination = `#g=${groupItem.id}`;
            let groupLabel = `${groupItem.name} (${groupItem.num_tasks})`;

            if (moduleData.activeGroupIdentity && moduleData.activeGroupIdentity === groupItem.id) {
                groupLinkDestination = `#t=${moduleData.activeGroupIdentity}`;
                selectVisualElement('.title', selectVisualElement('#main')).innerHTML = `<a href="${groupLinkDestination}">${groupLabel}</a>`;
                groupLabel = appConfig.titles_plain[moduleData.activeDisplayMode];
            }

            const groupEntry = appConfig.templates.group.cloneNode(true);
            const entryLink = selectVisualElement('a', groupEntry);
            entryLink.setAttribute('href', groupLinkDestination);
            entryLink.textContent = groupLabel;
            moduleData.groupDisplayElement.appendChild(groupEntry);
        });

        selectVisualElement('.groups', appConfig.list).appendChild(moduleData.groupDisplayElement);
        selectAllVisualElements('.groups a', appConfig.list).forEach(link => {
            link.addEventListener('click', onGroupNavigationInteraction);
        });
    }

    // --- Event Handling Functions ---

    function onSearchInputChanged(event) {
        moduleData.queryPageNumber = 1;
        clearTimeout(moduleData.activeTimers.queryTimer);
        const inputContent = event.target.value;

        if (inputContent.length < appConfig.counts.searchmin) {
            if (inputContent.length <= 0) {
                if (moduleData.previousQueryString.length > 0) {
                    contentDisplayManager.fetchAndRenderContent();
                }
                moduleData.previousQueryString = '';
            }
            return true;
        }
        if (moduleData.previousQueryString === inputContent) {
            return true;
        }
        clearScheduledActivities();

        moduleData.activeTimers.queryTimer = setTimeout(() => {
            moduleData.currentQueryString = inputContent;
            contentDisplayManager.executeContentSearch();
        }, appConfig.timeouts.search);
    }

    function onPagerLinkActivated(event) {
        event.preventDefault();
        const linkTarget = event.currentTarget.getAttribute('href');
        const pageNum = parseInt(urlProcessorModule.get_url_param(appConfig.params.mainpage, linkTarget), 10);

        if (moduleData.previousQueryString.length > 0) {
            moduleData.queryPageNumber = pageNum;
            moduleData.previousQueryString = moduleData.currentQueryString;
            contentDisplayManager.executeContentSearch();
        } else {
            urlProcessorModule.url_update_hash(appConfig.params.mainpage, pageNum);
        }
        return false;
    }

    function onPriorityChange(event) {
        event.preventDefault();
        itemModificationModule.update_row('priority', event.currentTarget);
        return false;
    }

    function onCompletionToggle(event) {
        itemModificationModule.update_row('is_done', event.currentTarget);
    }

    function onDeletionInitiated(event) {
        event.preventDefault();
        itemModificationModule.update_row('delete', event.currentTarget);
        return false;
    }

    function onRestoreInitiated(event) {
        event.preventDefault();
        itemModificationModule.update_row('undelete', event.currentTarget);
        return false;
    }

    function onTextElementInteraction(event) {
        if (event.currentTarget.classList.contains('g')) {
            const elementId = event.currentTarget.getAttribute('href').substr(3);
            urlProcessorModule.url_update_hash(appConfig.params.group, elementId, true);
            return false;
        } else if (!event.ctrlKey) {
            window.location.href = event.currentTarget.getAttribute('href');
            return false;
        }
    }

    function onGroupNavigationInteraction(event) {
        event.preventDefault();
        const linkHref = event.currentTarget.getAttribute('href');
        if (linkHref.startsWith('#g=')) {
            const groupId = linkHref.substr(3);
            urlProcessorModule.url_update_hash(appConfig.params.group, groupId, true);
        } else if (linkHref.startsWith('#t=')) {
            const typeValue = linkHref.substr(3);
            urlProcessorModule.url_update_hash(appConfig.params.type, typeValue, true);
        }
        return false;
    }

    // Public interface for the module
    const contentDisplayManager = {
        configureDisplayParameters: setupDisplayConfiguration,
        resetActivityTimers: clearScheduledActivities,
        initiateActivityMonitoring: startActivityMonitoring,
        triggerFullRefresh: triggerFullRefresh,
        displayLoadIndicator: showProgressIndicator,
        hideLoadIndicator: hideProgressIndicator,
        setCustomSchedule: assignCustomSchedule,
        fetchAndRenderContent: fetchAndRenderContent,
        highlightCurrentTab: highlightCurrentViewTab,
        assembleDisplayElements: buildVisualElements,
        constructTaskRow: constructTaskRow,
        executeContentSearch: executeContentSearch,
        calculateVisibleItemsCount: computeVisibleItemsCount,
        handleWindowResizing: handleWindowResizing,
        refreshGroupNavigation: updateGroupNavigation,

        // Expose event handlers for external binding if needed
        onSearchInputChanged: onSearchInputChanged,
        onPagerLinkActivated: onPagerLinkActivated,
        onPriorityChange: onPriorityChange,
        onCompletionToggle: onCompletionToggle,
        onDeletionInitiated: onDeletionInitiated,
        onRestoreInitiated: onRestoreInitiated,
        onTextElementInteraction: onTextElementInteraction,
        onGroupNavigationInteraction: onGroupNavigationInteraction,
        onFollowerAction: onFollowerAction,

        // For debugging/testing, allow access to internal state
        get currentModuleState() { return moduleData; }
    };

    // Integrate this module into the global application reference, replacing the original handler
    applicationGlobalReference.list_handler = contentDisplayManager;

})(FASTASK); // Assuming FASTASK is the global object passed as applicationGlobalReference