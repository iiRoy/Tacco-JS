var ApplicationCore = window.ApplicationCore || {};

class ScrollControl {
    static adjustScrollPosition(targetElement, scrollAmount) {
        if (targetElement) {
            targetElement.scrollTop = scrollAmount;
        }
    }
    static enableUserInteraction() {
        document.body.style.pointerEvents = '';
    }
    static disableUserInteraction() {
        document.body.style.pointerEvents = 'none';
    }
}

const DOMHelper = {
    setVisibility: (element, isVisible) => {
        if (element) {
            element.style.display = isVisible ? '' : 'none';
            element.setAttribute('aria-hidden', !isVisible);
        }
    },
    updateElementClasses: (element, classesToAdd, classesToRemove) => {
        if (element) {
            Array.isArray(classesToAdd) && classesToAdd.forEach(cls => element.classList.add(cls));
            Array.isArray(classesToRemove) && classesToRemove.forEach(cls => element.classList.remove(cls));
        }
    },
    generateSelector: (baseName, prefix = 'app-') => `.${prefix}${baseName}`,
    generateClassName: (baseName, prefix = 'app-') => `${prefix}${baseName}`
};

ApplicationCore.PanelManager = (function (initialElement, initialConfiguration) {

    const moduleState = {
        activeFetchOperation: null, 
        rootContainer: null, 
        layoutViewComponent: null, 
        bottomNavigationComponent: null, 
        primaryHeaderComponent: null, 
        contentDisplayArea: null, 
        headerIndexMap: new Map(), 
        activeTabClass: DOMHelper.generateClassName('tab-selection'), 
        contentObscuredClass: DOMHelper.generateClassName('content-obscured'), 
        headerConcealedClass: DOMHelper.generateClassName('header-concealed'), 
        segmentActiveClass: DOMHelper.generateClassName('segment-status-active'), 
        segmentHiddenClass: DOMHelper.generateClassName('segment-status-hidden') 
    };

    const recalibrateDisplayLayout = () => {
        const mainPanel = moduleState.layoutViewComponent;
        const lowerBar = moduleState.bottomNavigationComponent;
        if (!mainPanel) return;

        const currentWindowHeight = window.innerHeight;
        const lowerBarHeight = lowerBar ? lowerBar.offsetHeight : 0;
        const availableSpaceForMain = currentWindowHeight - lowerBarHeight;
        const mainPanelTopOffset = mainPanel.getBoundingClientRect().top;
        
        mainPanel.style.height = `${availableSpaceForMain - mainPanelTopOffset}px`;
        
        if (lowerBar) {
            lowerBar.style.top = `${availableSpaceForMain}px`;
        }
    };

    const manageHeaderVisibility = (prospectiveHeader, relevantSectionIndex) => {
        const headerParent = moduleState.primaryHeaderComponent.parentNode; 
        
        let targetHeaderElement = prospectiveHeader;
        if (prospectiveHeader && !moduleState.headerIndexMap.has(relevantSectionIndex)) {
            prospectiveHeader.setAttribute("data-view-section-id", relevantSectionIndex);
            headerParent.appendChild(prospectiveHeader);
            moduleState.headerIndexMap.set(relevantSectionIndex, prospectiveHeader);
        } else if (moduleState.headerIndexMap.has(relevantSectionIndex)) {
            targetHeaderElement = moduleState.headerIndexMap.get(relevantSectionIndex);
        } else {
            targetHeaderElement = headerParent.querySelector(`header[data-view-section-id='${relevantSectionIndex}']`);
            if (targetHeaderElement) {
                 moduleState.headerIndexMap.set(relevantSectionIndex, targetHeaderElement);
            }
        }

        Array.from(headerParent.querySelectorAll("header")).forEach(headElement => {
            DOMHelper.updateElementClasses(headElement, [moduleState.headerConcealedClass], []);
        });

        if (targetHeaderElement) {
            DOMHelper.updateElementClasses(targetHeaderElement, [], [moduleState.headerConcealedClass]);
        }
    };

    const retrieveAndDisplayContent = async (contentSource, contentIndex) => {
        if (moduleState.activeFetchOperation) {
            moduleState.activeFetchOperation.abort();
            moduleState.activeFetchOperation = null;
        }

        const contentPane = moduleState.contentDisplayArea;

        const processLocalContent = (selector) => {
            const activeContentPanel = contentPane.querySelector(selector);
            if (activeContentPanel) {
                const newContentHeader = activeContentPanel.querySelector("header");
                manageHeaderVisibility(newContentHeader, contentIndex);

                Array.from(activeContentPanel.parentNode.querySelectorAll(DOMHelper.generateSelector("tab-view-content"))).forEach(panelChild => {
                    DOMHelper.updateElementClasses(panelChild, [moduleState.contentObscuredClass], []);
                });
                DOMHelper.updateElementClasses(activeContentPanel, [], [moduleState.contentObscuredClass]);
            }
            ScrollControl.adjustScrollPosition(contentPane, 0);
            ScrollControl.enableUserInteraction();
        };

        const processRemoteContent = async (url) => {
            try {
                const fetchController = new AbortController();
                moduleState.activeFetchOperation = fetchController;
                const networkResponse = await fetch(url, { signal: fetchController.signal });
                
                if (!networkResponse.ok) {
                    throw new Error(`HTTP status not OK: ${networkResponse.status}`);
                }
                const responseHtml = await networkResponse.text();

                contentPane.replaceChildren();

                const temporaryParserDiv = document.createElement("div");
                temporaryParserDiv.innerHTML = responseHtml;

                const newContentHeader = temporaryParserDiv.querySelector("header");
                manageHeaderVisibility(newContentHeader, contentIndex);

                while (temporaryParserDiv.firstChild) {
                    contentPane.appendChild(temporaryParserDiv.firstChild);
                }
                ScrollControl.adjustScrollPosition(contentPane, 0);

            } catch (error) {
                if (error.name === 'AbortError') {
                    console.info('Content retrieval cancelled.');
                } else {
                    console.error('Failed to retrieve content:', error);
                }
            } finally {
                ScrollControl.enableUserInteraction();
                moduleState.activeFetchOperation = null;
            }
        };

        if (contentSource.startsWith("#")) {
            processLocalContent(contentSource);
        } else {
            await processRemoteContent(contentSource);
        }
    };

    const activateSegmentedPanel = (hostElement, panelSelector) => {
        const activeSegmentPanel = hostElement.querySelector(panelSelector);
        if (activeSegmentPanel) {
            Array.from(activeSegmentPanel.parentNode.querySelectorAll(DOMHelper.generateSelector("segmented-control-content"))).forEach(segmentChild => {
                DOMHelper.updateElementClasses(segmentChild, [moduleState.segmentHiddenClass], []);
            });
            DOMHelper.updateElementClasses(activeSegmentPanel, [], [moduleState.segmentHiddenClass]);
        }
        ScrollControl.adjustScrollPosition(hostElement, 0);
        ScrollControl.enableUserInteraction();
    };

    const setupSegmentInteraction = (contentHolder, sectionPanelHeader) => {
        const segmentControllerElement = sectionPanelHeader.parentNode.querySelector(DOMHelper.generateSelector("segmented-control"));
        if (!segmentControllerElement) return;

        segmentControllerElement.addEventListener("click", (eventObject) => {
            eventObject.stopPropagation();
            const clickedLinkElement = eventObject.target.closest("a");
            if (!clickedLinkElement) return;

            const listItemContainer = clickedLinkElement.parentNode;
            Array.from(segmentControllerElement.querySelectorAll("li")).forEach(itemInList => {
                DOMHelper.updateElementClasses(itemInList, [moduleState.segmentActiveClass], []);
            });
            DOMHelper.updateElementClasses(listItemContainer, [], [moduleState.segmentActiveClass]);
            
            activateSegmentedPanel(contentHolder, clickedLinkElement.getAttribute("rel"));
        }, false);

        const initialActiveSegmentLink = segmentControllerElement.querySelector(DOMHelper.generateSelector("segmented-control-active") + " a");
        if (initialActiveSegmentLink) {
            activateSegmentedPanel(contentHolder, initialActiveSegmentLink.getAttribute("rel"));
        }
    };

    const initializeChildViews = (rootNode) => {
        if (!rootNode) return; 
        Array.from(rootNode.querySelectorAll("view")).forEach(targetView => {
            class ViewportManagement {
                constructor(element) {
                    this.managedElement = element;
                    this.managedElement.setAttribute('data-viewport-status', 'initialized');
                }
            }
            new ViewportManagement(targetView);
        });
    };

    const attachAllEventHandlers = (rootNode) => {
        if (!rootNode) return; 
        moduleState.rootContainer = rootNode;
        moduleState.layoutViewComponent = rootNode.querySelector("view > section");
        moduleState.contentDisplayArea = moduleState.layoutViewComponent.querySelector(DOMHelper.generateSelector("rivet-wrapper"));
        moduleState.primaryHeaderComponent = rootNode.querySelector("view > viewport header");
        moduleState.bottomNavigationComponent = rootNode.querySelector("footer");

        const navigationActionLinks = Array.from(moduleState.bottomNavigationComponent.querySelectorAll("li a"));
        const initialActiveNavigationLink = moduleState.bottomNavigationComponent.querySelector(DOMHelper.generateSelector("tab-active") + " a");

        navigationActionLinks.forEach((actionLink, indexValue) => {
            actionLink.setAttribute("data-view-index", indexValue);
            actionLink.addEventListener("click", (eventObject) => {
                eventObject.preventDefault();
                const containingParentItem = actionLink.parentNode;
                const linkDestinationPath = actionLink.getAttribute("rel");
                const currentViewIndex = actionLink.getAttribute("data-view-index");

                if (!containingParentItem.classList.contains(moduleState.activeTabClass)) {
                    navigationActionLinks.forEach(linkInList => {
                        DOMHelper.updateElementClasses(linkInList.parentNode, [moduleState.activeTabClass], []);
                    });

                    ScrollControl.disableUserInteraction();
                    DOMHelper.updateElementClasses(containingParentItem, [], [moduleState.activeTabClass]);
                    retrieveAndDisplayContent(linkDestinationPath, currentViewIndex);
                }
            }, false);
        });

        if (initialActiveNavigationLink) {
            retrieveAndDisplayContent(initialActiveNavigationLink.getAttribute("rel"), initialActiveNavigationLink.getAttribute("data-view-index"));
        }
        
        window.addEventListener("resize", recalibrateDisplayLayout, false);
        window.addEventListener("orientationchange", recalibrateDisplayLayout, false);

        recalibrateDisplayLayout(); 
        setupSegmentInteraction(moduleState.contentDisplayArea, moduleState.primaryHeaderComponent);
    };

    const orchestrateApplicationStartup = () => {
        initializeChildViews(initialElement); 
        attachAllEventHandlers(initialElement); 
        
        if (initialConfiguration) { 
            Object.entries(initialConfiguration).forEach(([keyProp, valueProp]) => {
                if (keyProp.startsWith('data-')) {
                    initialElement.setAttribute(keyProp, valueProp);
                } else {
                    console.debug(`Configuration setting '${keyProp}' was not automatically applied to the root element.`);
                }
            });
        }
    };

    orchestrateApplicationStartup();

})();