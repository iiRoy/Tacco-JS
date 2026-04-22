class AdaptiveLayoutHandler {
    constructor(rootContainerSelector = 'body') {
        this.rootContainer = document.querySelector(rootContainerSelector);
        this.activeLayoutMode = 'tabs'; // 'tabs' or 'accordions'
        this.displayBreakpointClasses = { hide: '', show: '' };
        this.layoutItemRegistry = []; // Stores structured data for each responsive tab group
        this.panelGroupPrefix = 'adapt-group-';
        this.panelItemPrefix = 'adapt-item-';
        this.tabContentPrefix = 'tab-content-';

        this.onWindowResizeEvent = this.onWindowResizeEvent.bind(this);
    }

    initializeAdaptiveBehavior(breakpointTriggers = ['xs', 'sm']) {
        if (!Array.isArray(breakpointTriggers)) {
            breakpointTriggers = ['xs', 'sm'];
        }

        this.displayBreakpointClasses.hide = breakpointTriggers.map(bp => `hidden-${bp}`).join(' ');
        this.displayBreakpointClasses.show = breakpointTriggers.map(bp => `visible-${bp}`).join(' ');

        this.scanAndPrepareDOM();
        this.registerGlobalEvents();
        this.determineInitialLayout();
    }

    scanAndPrepareDOM() {
        const primaryTabSections = this.rootContainer.querySelectorAll('.nav-tabs.responsive');
        this.layoutItemRegistry = Array.from(primaryTabSections).map((tabSectionElement, groupIndex) => {
            const sectionIdentifier = tabSectionElement.id || `responsive-tabs-${groupIndex}`;
            tabSectionElement.id = sectionIdentifier;

            const tabNavigationLinks = Array.from(tabSectionElement.querySelectorAll('li a'));
            const associatedTabContentContainer = tabSectionElement.nextElementSibling;

            if (!associatedTabContentContainer || !associatedTabContentContainer.classList.contains('tab-content')) {
                return null;
            }
            associatedTabContentContainer.id = associatedTabContentContainer.id || `${this.tabContentPrefix}${sectionIdentifier}`;

            let initiallyActiveContentId = null;
            const itemData = tabNavigationLinks.map((linkElement, itemIndex) => {
                const originalHref = linkElement.getAttribute('href');
                const contentPaneId = originalHref ? originalHref.replace(/^#/, '') : `tab-pane-${sectionIdentifier}-${itemIndex}`;
                
                let contentPaneElement = associatedTabContentContainer.querySelector(originalHref);

                const parentListItem = linkElement.parentElement;
                const isItemActive = parentListItem.classList.contains('active');
                if (isItemActive) {
                    initiallyActiveContentId = contentPaneId;
                }

                return {
                    originalLink: linkElement,
                    originalPane: contentPaneElement,
                    linkHtml: linkElement.innerHTML,
                    linkClasses: linkElement.className,
                    parentClasses: parentListItem.className,
                    paneId: contentPaneId,
                    isActiveAtInit: isItemActive
                };
            });

            const accordionStructure = this.generateAccordionStructure(sectionIdentifier, itemData);
            tabSectionElement.nextElementSibling.insertAdjacentElement('afterend', accordionStructure);

            tabSectionElement.classList.add(this.displayBreakpointClasses.hide);
            if (associatedTabContentContainer) {
                associatedTabContentContainer.classList.add(this.displayBreakpointClasses.hide);
            }
            accordionStructure.classList.add(this.displayBreakpointClasses.show);

            return {
                groupId: sectionIdentifier,
                tabNavElement: tabSectionElement,
                tabContentElement: associatedTabContentContainer,
                accordionElement: accordionStructure,
                items: itemData,
                initialActiveContentId: initiallyActiveContentId
            };
        }).filter(Boolean);

        this.setComponentEventListeners();
    }

    generateAccordionStructure(groupId, itemDetails) {
        const accordionContainer = document.createElement('div');
        accordionContainer.className = `panel-group responsive ${this.displayBreakpointClasses.show}`;
        accordionContainer.id = `${this.panelGroupPrefix}${groupId}`;

        itemDetails.forEach(item => {
            const panelWrapper = document.createElement('div');
            let panelParentClasses = item.parentClasses.replace(/\bactive\b/g, '').trim();
            panelParentClasses = `panel panel-default ${panelParentClasses}`.replace(/\s{2,}/g, ' ').trim();
            panelWrapper.className = panelParentClasses;

            const panelHeader = document.createElement('div');
            panelHeader.className = 'panel-heading';

            const panelTitle = document.createElement('h4');
            panelTitle.className = 'panel-title';

            const panelToggleLink = document.createElement('a');
            let panelLinkClasses = `accordion-toggle ${item.linkClasses}`.trim();
            panelToggleLink.className = panelLinkClasses;
            panelToggleLink.setAttribute('data-toggle', 'collapse');
            panelToggleLink.setAttribute('data-parent', `#${accordionContainer.id}`);
            panelToggleLink.href = `#${this.panelItemPrefix}${item.paneId}`;
            panelToggleLink.innerHTML = item.linkHtml;

            panelTitle.appendChild(panelToggleLink);
            panelHeader.appendChild(panelTitle);
            panelWrapper.appendChild(panelHeader);

            const panelCollapseTarget = document.createElement('div');
            panelCollapseTarget.id = `${this.panelItemPrefix}${item.paneId}`;
            panelCollapseTarget.className = 'panel-collapse collapse';
            panelWrapper.appendChild(panelCollapseTarget);

            accordionContainer.appendChild(panelWrapper);
        });
        return accordionContainer;
    }

    transferContentToPanels() {
        this.layoutItemRegistry.forEach(group => {
            group.items.forEach(item => {
                if (item.originalPane) {
                    const panelCollapse = group.accordionElement.querySelector(`#${this.panelItemPrefix}${item.paneId}`);
                    if (panelCollapse && !panelCollapse.querySelector('.panel-body')) {
                        const panelBody = document.createElement('div');
                        panelBody.className = 'panel-body';
                        while (item.originalPane.firstChild) {
                            panelBody.appendChild(item.originalPane.firstChild);
                        }
                        panelCollapse.appendChild(panelBody);
                    }
                }
            });
        });
    }

    transferContentToTabs() {
        this.layoutItemRegistry.forEach(group => {
            group.items.forEach(item => {
                if (item.originalPane) {
                    const panelCollapse = group.accordionElement.querySelector(`#${this.panelItemPrefix}${item.paneId}`);
                    const panelBody = panelCollapse ? panelCollapse.querySelector('.panel-body') : null;
                    if (panelBody) {
                        while (panelBody.firstChild) {
                            item.originalPane.appendChild(panelBody.firstChild);
                        }
                        panelBody.remove();
                    }
                }
            });
        });
    }

    activateAccordionLayout() {
        if (this.activeLayoutMode === 'accordions') return;

        this.layoutItemRegistry.forEach(group => {
            group.tabNavElement.classList.add(this.displayBreakpointClasses.hide);
            if (group.tabContentElement) {
                group.tabContentElement.classList.add(this.displayBreakpointClasses.hide);
            }
            group.accordionElement.classList.remove(this.displayBreakpointClasses.hide);

            this.transferContentToPanels();

            const activeItem = group.items.find(item => item.isActiveAtInit);
            if (activeItem) {
                const targetPanelId = `#${this.panelItemPrefix}${activeItem.paneId}`;
                const targetPanelElement = document.querySelector(targetPanelId);
                if (targetPanelElement) {
                    $(targetPanelElement).collapse('show');
                }
            }
        });
        this.activeLayoutMode = 'accordions';
    }

    activateTabLayout() {
        if (this.activeLayoutMode === 'tabs') return;

        this.layoutItemRegistry.forEach(group => {
            group.tabNavElement.classList.remove(this.displayBreakpointClasses.hide);
            if (group.tabContentElement) {
                group.tabContentElement.classList.remove(this.displayBreakpointClasses.hide);
            }
            group.accordionElement.classList.add(this.displayBreakpointClasses.hide);

            this.transferContentToTabs();

            const activeItem = group.items.find(item => item.isActiveAtInit);
            if (activeItem) {
                const targetTabLink = activeItem.originalLink;
                if (targetTabLink) {
                    $(targetTabLink).tab('show');
                }
            }
        });
        this.activeLayoutMode = 'tabs';
    }

    determineInitialLayout() {
        const samplePanelGroup = this.rootContainer.querySelector('.panel-group.responsive');
        const isPanelVisible = samplePanelGroup ? window.getComputedStyle(samplePanelGroup).display !== 'none' : false;

        if (isPanelVisible) {
            this.activateAccordionLayout();
        } else {
            this.activateTabLayout();
        }
    }

    onWindowResizeEvent() {
        const samplePanelGroup = this.rootContainer.querySelector('.panel-group.responsive');
        const isPanelVisible = samplePanelGroup ? window.getComputedStyle(samplePanelGroup).display !== 'none' : false;

        if (isPanelVisible && this.activeLayoutMode === 'tabs') {
            this.activateAccordionLayout();
        } else if (!isPanelVisible && this.activeLayoutMode === 'accordions') {
            this.activateTabLayout();
        }
    }

    registerGlobalEvents() {
        window.addEventListener('resize', this.onWindowResizeEvent);
    }

    setComponentEventListeners() {
        this.layoutItemRegistry.forEach(group => {
            group.items.forEach(item => {
                if (item.originalLink) {
                    $(item.originalLink).on('shown.bs.tab', (e) => {
                        const currentTargetHash = e.currentTarget.hash;
                        const panelIdToShow = `#${this.panelItemPrefix}${currentTargetHash.replace(/^#/, '')}`;
                        const panelElementToShow = document.querySelector(panelIdToShow);

                        if (panelElementToShow) {
                            $(panelElementToShow).collapse('show');
                        }

                        if (e.relatedTarget) {
                            const previousTargetHash = e.relatedTarget.hash;
                            const panelIdToHide = `#${this.panelItemPrefix}${previousTargetHash.replace(/^#/, '')}`;
                            const panelElementToHide = document.querySelector(panelIdToHide);
                            if (panelElementToHide) {
                                $(panelElementToHide).collapse('hide');
                            }
                        }
                    });
                }
            });

            const panelCollapseElements = group.accordionElement.querySelectorAll('.panel-collapse');
            Array.from(panelCollapseElements).forEach(collapseElement => {
                $(collapseElement).on('shown.bs.collapse', (e) => {
                    const currentCollapseId = e.target.id;
                    const originalTabContentId = currentCollapseId.replace(this.panelItemPrefix, '');
                    const originalTabLinkSelector = `a[href="#${originalTabContentId}"]`;
                    const originalTabLink = document.querySelector(originalTabLinkSelector);

                    if (originalTabLink) {
                        $(originalTabLink).tab('show');
                    }

                    const parentPanelGroup = e.currentTarget.closest('.panel-group.responsive');
                    if (parentPanelGroup) {
                        Array.from(parentPanelGroup.querySelectorAll('.panel-body')).forEach(pb => pb.classList.remove('active'));
                        const currentPanelBody = e.currentTarget.querySelector('.panel-body');
                        if (currentPanelBody) {
                            currentPanelBody.classList.add('active');
                        }
                    }
                });
            });
        });
    }
}

const adaptiveManagerInstance = new AdaptiveLayoutHandler();

var responsiveSectionUtil = window.responsiveSectionUtil || {};
responsiveSectionUtil.setupSections = function(displayBreakpoints) {
    adaptiveManagerInstance.initializeAdaptiveBehavior(displayBreakpoints);
};