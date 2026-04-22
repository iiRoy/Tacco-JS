function createProductDataCustodian() {
    let primaryProductSet = [];
    let activeQueryText = "";
    let presentPageIndex = 0;
    let elementsPerPage = 10;
    let sortingSpecification = {
        sortField: "identifier",
        isDescending: false
    };

    let updateListeners = [];

    function signalUpdates() {
        updateListeners.forEach(fn => fn());
    }

    function fetchCurrentState() {
        return {
            primaryProductSet,
            activeQueryText,
            presentPageIndex,
            elementsPerPage,
            sortingSpecification
        };
    }

    function ingestProductData(itemsArray) {
        primaryProductSet = itemsArray;
        signalUpdates();
    }

    function calculateViewableItems() {
        let workingSet = [...primaryProductSet];

        if (activeQueryText) {
            const queryLower = activeQueryText.toLowerCase();
            workingSet = workingSet.filter(item => {
                return Object.values(item).some(val =>
                    typeof val === "string" && val.toLowerCase().includes(queryLower)
                );
            });
        }

        if (sortingSpecification.sortField) {
            const field = sortingSpecification.sortField;
            const descendingFactor = sortingSpecification.isDescending ? -1 : 1;
            workingSet.sort((a, b) => {
                const valueA = a[field];
                const valueB = b[field];
                if (valueA < valueB) return -1 * descendingFactor;
                if (valueA > valueB) return 1 * descendingFactor;
                return 0;
            });
        }

        const startSlice = presentPageIndex * elementsPerPage;
        const endSlice = startSlice + elementsPerPage;
        workingSet = workingSet.slice(startSlice, endSlice);

        return workingSet;
    }

    function countPaginatedItems() {
        return calculateViewableItems().length;
    }

    function modifySearchTerm(termValue) {
        if (activeQueryText !== termValue) {
            activeQueryText = termValue;
            presentPageIndex = 0;
            signalUpdates();
        }
    }

    function alterPageIndex(newPage) {
        if (presentPageIndex !== newPage) {
            presentPageIndex = newPage;
            signalUpdates();
        }
    }

    function computeTotalPages() {
        let filteredSet = [...primaryProductSet];
        if (activeQueryText) {
            const queryLower = activeQueryText.toLowerCase();
            filteredSet = filteredSet.filter(item =>
                Object.values(item).some(val =>
                    typeof val === "string" && val.toLowerCase().includes(queryLower)
                )
            );
        }
        const totalFilteredItems = filteredSet.length;
        const pageCount = Math.ceil(totalFilteredItems / elementsPerPage);
        return isNaN(pageCount) ? 0 : pageCount;
    }

    function producePaginationArray(itemCount) {
        const num = isNaN(itemCount) ? 0 : itemCount;
        return Array.from({ length: Math.ceil(num) });
    }

    function attachChangeListener(callbackFunction) {
        updateListeners.push(callbackFunction);
    }

    function detachChangeListener(callbackFunction) {
        updateListeners = updateListeners.filter(listener => listener !== callbackFunction);
    }

    return {
        ingestProductData,
        fetchCurrentState,
        calculateViewableItems,
        countPaginatedItems,
        modifySearchTerm,
        alterPageIndex,
        computeTotalPages,
        producePaginationArray,
        attachChangeListener,
        detachChangeListener
    };
}

function createItemInteractionHandler(dataSource) {
    const dataRepository = dataSource;
    let presentViewConfiguration = dataRepository.fetchCurrentState();

    function reconcileDisplay() {
        presentViewConfiguration = dataRepository.fetchCurrentState();
    }

    dataRepository.attachChangeListener(reconcileDisplay);

    function retrieveVisibleItemQuantity() {
        return dataRepository.countPaginatedItems();
    }

    function processNewSearchInput(term) {
        dataRepository.modifySearchTerm(term);
    }

    function managePageNavigation(eventObject, targetPage) {
        if (eventObject && typeof eventObject.preventDefault === 'function') {
            eventObject.preventDefault();
        }
        dataRepository.alterPageIndex(targetPage);
    }

    function obtainTotalPageCount() {
        return dataRepository.computeTotalPages();
    }

    function createPageIndicators(num) {
        return dataRepository.producePaginationArray(num);
    }

    function decommissionHandler() {
        dataRepository.detachChangeListener(reconcileDisplay);
    }

    return {
        initializeDataSet: (data) => dataRepository.ingestProductData(data),
        setSearchParameter: processNewSearchInput,
        changeActivePageIndex: managePageNavigation,
        getCurrentConfiguration: () => dataRepository.fetchCurrentState(),
        getTransformedItems: () => dataRepository.calculateViewableItems(),
        getVisibleItemQuantity: retrieveVisibleItemQuantity,
        getOverallPageCountValue: obtainTotalPageCount,
        getPageIndicatorCollection: createPageIndicators,
        decommissionHandler
    };
}