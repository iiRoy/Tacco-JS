class TieredNavigatorComponent {
    #hostElement;
    #currentConfiguration;
    #itemActionHandlers;
    #itemIconMap;
    #displayZone;

    static #initialSettings = {
        itemFetcher: (identifier) => {
            console.error("Data retrieval function 'itemFetcher' is not defined. Please provide one.");
            return Promise.resolve([]);
        },
        emptyPanelMessage: "No content available.",
        filterPrompt: "Filter entries...",
        isFilterEnabled: false,
        customIcons: {},
        customActions: {}
    };

    static #standardActions = {
        group: (navigatorInstance, activatedElement, entryDetails) => {
            navigatorInstance.#currentConfiguration.itemFetcher(entryDetails.id)
                .then(childEntries => {
                    navigatorInstance.#populatePanelWithEntries(childEntries);
                })
                .catch(problem => {
                    console.error("Problem fetching group data:", problem);
                });
        },
        link: (navigatorInstance, activatedElement, entryDetails) => {
            window.open(entryDetails.url, '_blank');
        }
    };

    static #standardIcons = {
        group: "icon-arrow-right",
        link: "icon-external-link"
    };

    constructor(containerElement, componentOptions = {}) {
        if (!(containerElement instanceof HTMLElement)) {
            throw new Error("Target element must be an HTMLElement.");
        }

        this.#hostElement = containerElement;

        this.#currentConfiguration = {
            ...TieredNavigatorComponent.#initialSettings,
            ...componentOptions
        };
        this.#itemActionHandlers = {
            ...TieredNavigatorComponent.#standardActions,
            ...this.#currentConfiguration.customActions
        };
        this.#itemIconMap = {
            ...TieredNavigatorComponent.#standardIcons,
            ...this.#currentConfiguration.customIcons
        };

        this.#prepareComponentStructure();
    }

    #prepareComponentStructure() {
        this.#hostElement.setAttribute("data-tiered-nav-initialized", "true");
        this.#hostElement.classList.add("tiered-view-wrapper");

        this.#displayZone = document.createElement("div");
        this.#displayZone.classList.add("tiered-view-display");
        this.#hostElement.appendChild(this.#displayZone);

        this.#displayZone.addEventListener("click", this.#activatePanelItem.bind(this));

        this.#currentConfiguration.itemFetcher(null)
            .then(rootEntries => {
                this.#populatePanelWithEntries(rootEntries);
            })
            .catch(problem => {
                console.error("Initial data load problem:", problem);
            });
    }

    #activatePanelItem(event) {
        const clickedEntry = event.target.closest(".tier-entry");
        if (!clickedEntry || clickedEntry.classList.contains('filter-input-container')) {
            return;
        }

        const containingPanel = clickedEntry.closest(".item-panel");
        if (!containingPanel) return;

        const allPanels = Array.from(this.#displayZone.children);
        const clickedPanelIndex = allPanels.indexOf(containingPanel);

        for (let i = allPanels.length - 1; i > clickedPanelIndex; i--) {
            this.#displayZone.removeChild(allPanels[i]);
        }

        containingPanel.querySelectorAll(".tier-entry.selected-item").forEach(item => {
            item.classList.remove("selected-item");
        });
        clickedEntry.classList.add("selected-item");

        const entryType = clickedEntry.dataset.entryType;
        const entryData = JSON.parse(clickedEntry.dataset.entryData);

        if (this.#itemActionHandlers[entryType]) {
            this.#itemActionHandlers[entryType](this, clickedEntry, entryData);
        } else {
            console.warn(`No action defined for entry type: ${entryType}`);
        }
    }

    #populatePanelWithEntries(entriesCollection) {
        const entryList = document.createElement("ul");
        entryList.classList.add("entry-list-segment");

        if (entriesCollection.length === 0) {
            const noContentParagraph = document.createElement("p");
            noContentParagraph.textContent = this.#currentConfiguration.emptyPanelMessage;
            noContentParagraph.classList.add("empty-message-label");
            return this.#renderNewPanel(noContentParagraph);
        }

        if (this.#currentConfiguration.isFilterEnabled) {
            this.#insertSearchFilter(entryList);
        }

        entriesCollection.forEach(entry => {
            const listItem = document.createElement("li");
            listItem.classList.add("tier-entry");
            listItem.dataset.entryId = entry.id;
            listItem.dataset.entryType = entry.type;
            listItem.dataset.entryData = JSON.stringify(entry);
            listItem.title = entry.label;

            const iconElement = document.createElement("i");
            iconElement.classList.add("entry-icon", this.#itemIconMap[entry.type] || "icon-placeholder");

            listItem.appendChild(document.createTextNode(entry.label));
            listItem.appendChild(iconElement);

            entryList.appendChild(listItem);
        });

        return this.#renderNewPanel(entryList);
    }

    #insertSearchFilter(parentListElement) {
        const filterListItem = document.createElement("li");
        filterListItem.classList.add("filter-input-container");

        const filterInput = document.createElement("input");
        filterInput.type = "text";
        filterInput.placeholder = this.#currentConfiguration.filterPrompt;
        filterInput.classList.add("panel-filter-input");

        filterInput.addEventListener("keyup", (interactionEvent) => {
            const queryText = interactionEvent.target.value.toLowerCase();
            const itemsToExamine = Array.from(parentListElement.children).filter(childNode =>
                !childNode.classList.contains("filter-input-container")
            );

            if (queryText.length >= 2) {
                itemsToExamine.forEach(itemNode => {
                    const itemLabel = itemNode.dataset.entryData ? JSON.parse(itemNode.dataset.entryData).label.toLowerCase() : '';
                    if (itemLabel.includes(queryText)) {
                        itemNode.style.display = "";
                    } else {
                        itemNode.style.display = "none";
                    }
                });
            } else {
                itemsToExamine.forEach(itemNode => {
                    itemNode.style.display = "";
                });
            }
        });

        filterListItem.appendChild(filterInput);
        parentListElement.prepend(filterListItem);
    }

    #renderNewPanel(panelContentElement) {
        const newPanelContainer = document.createElement("div");
        newPanelContainer.classList.add("item-panel");
        newPanelContainer.appendChild(panelContentElement);
        this.#displayZone.appendChild(newPanelContainer);

        this.#hostElement.scrollLeft = this.#displayZone.scrollWidth;
    }
}

const tieredNavigator = (targetSelector, operationOptions) => {
    const identifiedElements = document.querySelectorAll(targetSelector);
    identifiedElements.forEach(element => {
        if (!window.__tieredNavInstances) {
            window.__tieredNavInstances = new WeakMap();
        }

        let instance = window.__tieredNavInstances.get(element);

        if (typeof operationOptions === 'object' || !operationOptions) {
            if (!instance && !element.hasAttribute("data-tiered-nav-initialized")) {
                instance = new TieredNavigatorComponent(element, operationOptions);
                window.__tieredNavInstances.set(element, instance);
            }
        } else {
            console.error('Invalid parameters for tieredNavigator function. Only initialization with an object is supported.');
        }
    });
};