(function() {
    /**
     * Initializes a pagination system for a given set of DOM elements.
     * This function acts as the entry point, mimicking a jQuery plugin's behavior
     * by processing multiple elements if a selector is provided.
     *
     * @param {string|HTMLElement|NodeList|Array<HTMLElement>} targetElements - The elements to paginate.
     * @param {object} [userSettings] - Custom configuration options.
     * @returns {HTMLElement|NodeList|Array<HTMLElement>|null} The processed elements, for chaining.
     */
    window.activateContentPaginator = function(targetElements, userSettings) {
        // Internal keys for storing state on elements (mimicking jQuery.data)
        const currentActivePageIdentifier = 'paginatorCurrentPage';
        const displayedItemsPerPageIdentifier = 'paginatorItemsPerPage';

        // Default configuration settings (renamed from original)
        const defaultConfiguration = {
            contentSourceSelector: '.content', // item_container_id
            displayedItemsPerSheet: 10,       // items_per_page
            navigationControlsSelector: '.page_navigation', // nav_panel_id
            statusInformationSelector: '.info_text',        // nav_info_id
            maximumVisiblePageLinks: 20,    // num_page_links_to_display
            initialPageIndex: 0,            // start_page
            enableCircularNavigation: false, // wrap_around
            firstLinkText: 'First',         // nav_label_first
            previousLinkText: 'Prev',       // nav_label_prev
            nextLinkText: 'Next',           // nav_label_next
            lastLinkText: 'Last',           // nav_label_last
            controlSequence: ["first", "prev", "num", "next", "last"], // nav_order
            informationDisplayPattern: 'Showing {0}-{1} of {2} results', // nav_label_info
            showBoundaryControls: true,     // show_first_last
            ignoreSmallCollections: false,  // abort_on_small_lists
            useExternalUiStyling: false,    // jquery_ui
            uiActiveClass: "ui-state-highlight", // jquery_ui_active
            uiDefaultClass: "ui-state-default",  // jquery_ui_default
            uiDisabledClass: "ui-state-disabled" // jquery_ui_disabled
        };

        const mergedSettings = { ...defaultConfiguration, ...userSettings };

        // Determine the elements to process
        let elementsToProcess = [];
        if (typeof targetElements === 'string') {
            elementsToProcess = Array.from(document.querySelectorAll(targetElements));
        } else if (targetElements instanceof HTMLElement) {
            elementsToProcess = [targetElements];
        } else if (targetElements instanceof NodeList || Array.isArray(targetElements)) {
            elementsToProcess = Array.from(targetElements);
        } else {
            console.error("Invalid target for content paginator activation.");
            return null;
        }

        elementsToProcess.forEach(element => initializeSinglePaginator(element, mergedSettings));

        return targetElements; // Return the original input for chaining-like behavior


        // Private WeakMap to store data associated with each paginator host element
        const elementStateRegistry = new WeakMap();

        function storeElementData(element, key, value) {
            if (!elementStateRegistry.has(element)) {
                elementStateRegistry.set(element, {});
            }
            elementStateRegistry.get(element)[key] = value;
        }

        function retrieveElementData(element, key) {
            return elementStateRegistry.has(element) ? elementStateRegistry.get(element)[key] : undefined;
        }

        /**
         * Initializes the paginator for a single host element.
         * @param {HTMLElement} hostElement - The main element to apply pagination to.
         * @param {object} settings - The final configuration settings.
         */
        function initializeSinglePaginator(hostElement, settings) {
            const mainHostElement = hostElement;
            const itemContainerElement = mainHostElement.querySelector(settings.contentSourceSelector);
            const allContentItems = Array.from(itemContainerElement.children);

            if (settings.ignoreSmallCollections && settings.displayedItemsPerSheet >= allContentItems.length) {
                return; // Exit if list is too small to paginate
            }

            // Store initial state
            storeElementData(mainHostElement, currentActivePageIdentifier, 0);
            storeElementData(mainHostElement, displayedItemsPerPageIdentifier, settings.displayedItemsPerSheet);

            const totalContentCount = allContentItems.length;
            const calculatedPageCount = Math.ceil(totalContentCount / settings.displayedItemsPerSheet);

            const defaultUiClass = settings.useExternalUiStyling ? settings.uiDefaultClass : '';
            const activeUiClass = settings.useExternalUiStyling ? settings.uiActiveClass : '';
            const disabledUiClass = settings.useExternalUiStyling ? settings.uiDisabledClass : '';

            // Construct navigation HTML string
            let navigationHtmlContent = "";
            const ellipseMore = '<span class="pagination-marker marker-more">...</span>';
            const ellipseLess = '<span class="pagination-marker marker-less">...</span>';
            const firstControlMarkup = !settings.showBoundaryControls ? '' : `<a class="pagination-link link-first ${defaultUiClass}" href="#">${settings.firstLinkText}</a>`;
            const lastControlMarkup = !settings.showBoundaryControls ? '' : `<a class="pagination-link link-last ${defaultUiClass}" href="#">${settings.lastLinkText}</a>`;

            settings.controlSequence.forEach(segment => {
                switch (segment) {
                    case "first":
                        navigationHtmlContent += firstControlMarkup;
                        break;
                    case "last":
                        navigationHtmlContent += lastControlMarkup;
                        break;
                    case "next":
                        navigationHtmlContent += `<a class="pagination-link link-next ${defaultUiClass}" href="#">${settings.nextLinkText}</a>`;
                        break;
                    case "prev":
                        navigationHtmlContent += `<a class="pagination-link link-previous ${defaultUiClass}" href="#">${settings.previousLinkText}</a>`;
                        break;
                    case "num":
                        navigationHtmlContent += ellipseLess;
                        for (let i = 0; i < calculatedPageCount; i++) {
                            navigationHtmlContent += `<a class="pagination-link link-page ${defaultUiClass}" href="#" data-page-index="${i}">${i + 1}</a>`;
                        }
                        navigationHtmlContent += ellipseMore;
                        break;
                    default:
                        break;
                }
            });

            const navigationControlContainers = Array.from(mainHostElement.querySelectorAll(settings.navigationControlsSelector));
            navigationControlContainers.forEach(panel => {
                panel.innerHTML = navigationHtmlContent;
                const pageNumberLinks = panel.querySelectorAll('.link-page');
                if (pageNumberLinks.length > 0) {
                    pageNumberLinks[0].classList.add('first-page-in-panel');
                    pageNumberLinks[pageNumberLinks.length - 1].classList.add('last-page-in-panel');
                }
            });

            // Hide ellipses initially
            navigationControlContainers.forEach(panel => {
                Array.from(panel.querySelectorAll('.pagination-marker')).forEach(el => el.style.display = 'none');
            });

            // Set initial active page link styling
            navigationControlContainers.forEach(panel => {
                const firstPageLinkElement = panel.querySelector('.link-page');
                if (firstPageLinkElement) {
                    firstPageLinkElement.classList.add('active-page-state', activeUiClass);
                }
            });

            // Hide all content items
            allContentItems.forEach(item => item.style.display = 'none');
            // Show items for the first page
            allContentItems.slice(0, retrieveElementData(mainHostElement, displayedItemsPerPageIdentifier)).forEach(item => item.style.display = '');

            // Determine total number of page links generated
            const totalGeneratedPageLinks = navigationControlContainers.length > 0 ? navigationControlContainers[0].querySelectorAll('.link-page').length : 0;
            settings.maximumVisiblePageLinks = Math.min(settings.maximumVisiblePageLinks, totalGeneratedPageLinks);

            // Hide all page links initially, then show the visible range
            navigationControlContainers.forEach(panel => {
                Array.from(panel.querySelectorAll('.link-page')).forEach(link => link.style.display = 'none');
                Array.from(panel.querySelectorAll('.link-page')).slice(0, settings.maximumVisiblePageLinks).forEach(link => link.style.display = '');
            });

            // Attach event listeners
            mainHostElement.querySelectorAll('.link-first').forEach(link => link.addEventListener('click', (e) => handleFirstControlInteraction(e, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass)));
            mainHostElement.querySelectorAll('.link-last').forEach(link => link.addEventListener('click', (e) => handleLastControlInteraction(e, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass)));
            mainHostElement.querySelectorAll('.link-previous').forEach(link => link.addEventListener('click', (e) => handlePreviousControlInteraction(e, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass)));
            mainHostElement.querySelectorAll('.link-next').forEach(link => link.addEventListener('click', (e) => handleNextControlInteraction(e, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass)));
            mainHostElement.querySelectorAll('.link-page').forEach(link => link.addEventListener('click', (e) => handlePageLinkInteraction(e, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass)));

            // Navigate to the initial page
            performPageNavigation(parseInt(settings.initialPageIndex, 10), mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
            updateEllipseIndicators(mainHostElement, navigationControlContainers);
            if (!settings.enableCircularNavigation) updateBoundaryLinkStates(mainHostElement, navigationControlContainers, disabledUiClass);
        }

        // --- Event handler functions (pass all necessary context) ---

        function handleFirstControlInteraction(evt, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            evt.preventDefault();
            shiftPageNumberDisplayRight(evt.currentTarget, 0, mainHostElement, settings, navigationControlContainers);
            performPageNavigation(0, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
        }

        function handleLastControlInteraction(evt, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            evt.preventDefault();
            const ultimatePageIndex = totalGeneratedPageLinks - 1;
            shiftPageNumberDisplayLeft(evt.currentTarget, ultimatePageIndex, mainHostElement, settings, navigationControlContainers);
            performPageNavigation(ultimatePageIndex, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
        }

        function handlePreviousControlInteraction(evt, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            evt.preventDefault();
            displayPreviousContentPage(evt.currentTarget, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
        }

        function handleNextControlInteraction(evt, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            evt.preventDefault();
            displayNextContentPage(evt.currentTarget, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
        }

        function handlePageLinkInteraction(evt, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            evt.preventDefault();
            performPageNavigation(parseInt(evt.currentTarget.dataset.pageIndex, 10), mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
        }


        // --- Core pagination logic functions (renamed) ---

        function displayPreviousContentPage(triggerElement, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            let desiredPageIndex = retrieveElementData(mainHostElement, currentActivePageIdentifier) - 1;

            // Find the active page link within the trigger element's parent (the navigation panel)
            const currentActiveLink = Array.from(triggerElement.parentNode.children).find(el => el.classList.contains('active-page-state'));
            const priorPageLink = currentActiveLink ? currentActiveLink.previousElementSibling : null;

            if (priorPageLink && priorPageLink.classList.contains('link-page')) { // Check if it's a page link, not an ellipse or control
                shiftPageNumberDisplayRight(triggerElement, desiredPageIndex, mainHostElement, settings, navigationControlContainers);
                performPageNavigation(desiredPageIndex, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
            } else if (settings.enableCircularNavigation) {
                performPageNavigation(totalGeneratedPageLinks - 1, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
            }
        }

        function displayNextContentPage(triggerElement, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            let desiredPageIndex = retrieveElementData(mainHostElement, currentActivePageIdentifier) + 1;

            // Find the active page link within the trigger element's parent (the navigation panel)
            const currentActiveLink = Array.from(triggerElement.parentNode.children).find(el => el.classList.contains('active-page-state'));
            const subsequentPageLink = currentActiveLink ? currentActiveLink.nextElementSibling : null;

            if (subsequentPageLink && subsequentPageLink.classList.contains('link-page')) { // Check if it's a page link, not an ellipse or control
                shiftPageNumberDisplayLeft(triggerElement, desiredPageIndex, mainHostElement, settings, navigationControlContainers);
                performPageNavigation(desiredPageIndex, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
            } else if (settings.enableCircularNavigation) {
                performPageNavigation(0, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass);
            }
        }

        function performPageNavigation(targetPageIndex, mainHostElement, settings, allContentItems, navigationControlContainers, totalGeneratedPageLinks, defaultUiClass, activeUiClass, disabledUiClass) {
            targetPageIndex = parseInt(targetPageIndex, 10);

            const itemsPerSheet = parseInt(retrieveElementData(mainHostElement, displayedItemsPerPageIdentifier), 10);

            const startItemIndex = targetPageIndex * itemsPerSheet;
            const endItemIndex = startItemIndex + itemsPerSheet;

            allContentItems.forEach(item => item.style.display = 'none');
            const itemsCurrentlyVisible = allContentItems.slice(startItemIndex, endItemIndex);
            itemsCurrentlyVisible.forEach(item => item.style.display = '');

            navigationControlContainers.forEach(panel => {
                Array.from(panel.querySelectorAll('.link-page')).forEach(link => {
                    link.classList.remove('active-page-state', activeUiClass);
                });
                const targetPageLink = panel.querySelector(`.link-page[data-page-index="${targetPageIndex}"]`);
                if (targetPageLink) {
                    targetPageLink.classList.add('active-page-state', activeUiClass);
                }
            });

            storeElementData(mainHostElement, currentActivePageIdentifier, targetPageIndex);

            const currentPageNumber = retrieveElementData(mainHostElement, currentActivePageIdentifier) + 1;
            const totalContentItemsCount = allContentItems.length;
            const totalCalculatedPages = Math.ceil(totalContentItemsCount / settings.displayedItemsPerSheet);

            const infoDisplayElement = mainHostElement.querySelector(settings.statusInformationSelector);
            if (infoDisplayElement) {
                infoDisplayElement.textContent = settings.informationDisplayPattern
                    .replace("{0}", startItemIndex + 1)
                    .replace("{1}", startItemIndex + itemsCurrentlyVisible.length)
                    .replace("{2}", totalContentItemsCount)
                    .replace("{3}", currentPageNumber)
                    .replace("{4}", totalCalculatedPages);
            }

            updateEllipseIndicators(mainHostElement, navigationControlContainers);
            updateBoundaryLinkStates(mainHostElement, navigationControlContainers, disabledUiClass);

            if (typeof settings.onPageDisplayed === "function") {
                settings.onPageDisplayed.call(mainHostElement, targetPageIndex + 1);
            }
        }

        // --- Page number visibility management ---

        function shiftPageNumberDisplayLeft(triggerElement, newPageIndex, mainHostElement, settings, navigationControlContainers) {
            const currentActiveLink = Array.from(triggerElement.parentNode.children).find(el => el.classList.contains('active-page-state'));
            if (!currentActiveLink) return;

            const targetPageLinkElement = currentActiveLink.parentNode.querySelector(`.link-page[data-page-index="${newPageIndex}"]`);
            if (targetPageLinkElement && targetPageLinkElement.style.display === 'none') {
                navigationControlContainers.forEach(panel => {
                    const allPanelPageLinks = Array.from(panel.querySelectorAll('.link-page'));
                    allPanelPageLinks.forEach(link => link.style.display = 'none');

                    const startSliceIndex = Math.max(0, newPageIndex - settings.maximumVisiblePageLinks + 1);
                    allPanelPageLinks.slice(startSliceIndex, newPageIndex + 1).forEach(link => link.style.display = '');
                });
            }
        }

        function shiftPageNumberDisplayRight(triggerElement, newPageIndex, mainHostElement, settings, navigationControlContainers) {
            const currentActiveLink = Array.from(triggerElement.parentNode.children).find(el => el.classList.contains('active-page-state'));
            if (!currentActiveLink) return;

            const targetPageLinkElement = currentActiveLink.parentNode.querySelector(`.link-page[data-page-index="${newPageIndex}"]`);
            if (targetPageLinkElement && targetPageLinkElement.style.display === 'none') {
                navigationControlContainers.forEach(panel => {
                    const allPanelPageLinks = Array.from(panel.querySelectorAll('.link-page'));
                    allPanelPageLinks.forEach(link => link.style.display = 'none');

                    const endSliceIndex = Math.min(allPanelPageLinks.length, newPageIndex + settings.maximumVisiblePageLinks);
                    allPanelPageLinks.slice(newPageIndex, endSliceIndex).forEach(link => link.style.display = '');
                });
            }
        }

        // --- Ellipsis and boundary control updates ---

        function updateEllipseIndicators(mainHostElement, navigationControlContainers) {
            navigationControlContainers.forEach(panel => {
                const currentlyVisiblePageLinks = Array.from(panel.querySelectorAll('.link-page')).filter(link => link.style.display !== 'none');

                const moreIndicator = panel.querySelector('.marker-more');
                const lessIndicator = panel.querySelector('.marker-less');

                if (moreIndicator) {
                    if (currentlyVisiblePageLinks.length > 0 && !currentlyVisiblePageLinks[currentlyVisiblePageLinks.length - 1].classList.contains('last-page-in-panel')) {
                        moreIndicator.style.display = '';
                    } else {
                        moreIndicator.style.display = 'none';
                    }
                }

                if (lessIndicator) {
                    if (currentlyVisiblePageLinks.length > 0 && !currentlyVisiblePageLinks[0].classList.contains('first-page-in-panel')) {
                        lessIndicator.style.display = '';
                    } else {
                        lessIndicator.style.display = 'none';
                    }
                }
            });
        }

        function updateBoundaryLinkStates(mainHostElement, navigationControlContainers, disabledUiClass) {
            navigationControlContainers.forEach(panel => {
                const currentActivePageLink = panel.querySelector('.active-page-state');
                if (!currentActivePageLink) return;

                const nextAndLastControls = Array.from(panel.querySelectorAll('.link-next, .link-last'));
                const previousAndFirstControls = Array.from(panel.querySelectorAll('.link-previous, .link-first'));

                if (currentActivePageLink.classList.contains('last-page-in-panel')) {
                    nextAndLastControls.forEach(ctrl => ctrl.classList.add('no-further-pages', disabledUiClass));
                } else {
                    nextAndLastControls.forEach(ctrl => ctrl.classList.remove('no-further-pages', disabledUiClass));
                }

                if (currentActivePageLink.classList.contains('first-page-in-panel')) {
                    previousAndFirstControls.forEach(ctrl => ctrl.classList.add('no-further-pages', disabledUiClass));
                } else {
                    previousAndFirstControls.forEach(ctrl => ctrl.classList.remove('no-further-pages', disabledUiClass));
                }
            });
        }
    };
})();