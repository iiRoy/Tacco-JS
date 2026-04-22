const queryElement = (selector, context = document) => context.querySelector(selector);
const createElementWithContent = (tag, content) => {
    const el = document.createElement(tag);
    el.innerHTML = content;
    return el;
};

const kitchenSink = {
    async sendRequest(method, endpoint, payload = null) {
        const config = {
            method: method,
            headers: {
                'Content-Type': 'application/json',
            },
        };
        if (payload) {
            config.body = JSON.stringify(payload);
        }

        const response = await fetch(endpoint, config);
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({ message: response.statusText }));
            throw new Error(errorData.message || 'Network response was not ok.');
        }
        return response.json().catch(() => ({}));
    },
    post: (endpoint, payload) => kitchenSink.sendRequest('POST', endpoint, payload),
    get: (endpoint) => kitchenSink.sendRequest('GET', endpoint),
    delete: (endpoint, payload) => kitchenSink.sendRequest('DELETE', endpoint, payload),
    put: (endpoint, payload) => kitchenSink.sendRequest('PUT', endpoint, payload),
};

const displayFeedbackAlert = (isFailure, contentText) => {
    const banner = createElementWithContent('div', contentText);
    banner.id = 'feedbackBanner';
    banner.style.cssText = `
        position: fixed;
        width: 100%;
        text-align: center;
        padding: 10px 0;
        box-sizing: border-box;
        z-index: 1000;
        opacity: 0;
        transition: opacity 0.5s ease-in-out, transform 0.5s ease-in-out;
        transform: translateY(-100%);
        color: white;
        font-family: sans-serif;
    `;

    if (isFailure) {
        banner.style.backgroundColor = '#dc3545';
    } else {
        banner.style.backgroundColor = '#28a745';
    }

    const headerElement = queryElement('header.main');
    const headerHeight = headerElement ? headerElement.offsetHeight : 0;
    banner.style.top = `${headerHeight}px`;

    document.body.appendChild(banner);

    requestAnimationFrame(() => {
        banner.style.opacity = '1';
        banner.style.transform = 'translateY(0)';
    });

    const duration = isFailure ? 6000 : 3000;

    setTimeout(() => {
        banner.style.opacity = '0';
        banner.style.transform = 'translateY(-100%)';
        setTimeout(() => {
            banner.remove();
        }, 500);
    }, duration + 500);
};

const farmRegistry = {
    obtainAll: () => Promise.resolve([]), // Mock implementation
    obtainOne: (identifier) => Promise.resolve(null), // Mock implementation
};

const produceCatalog = {
    retrieveAvailableProducts: () => Promise.resolve([]), // Mock implementation
    retrieveProductDetails: (productKey) => Promise.resolve(null), // Mock implementation
    obtainProductVisual: (productKey) => '/img/default.png' // Mock implementation
};

const customerProfile = {
    fetchProvisioningItems: () => Promise.resolve([]), // Mock implementation
    addProvisioningItem: async (boothId, itemRef) => Promise.resolve({ success: true }), // Mock implementation
    removeProvisioningItem: async (boothId, itemRef) => Promise.resolve({ success: true }), // Mock implementation
    clearAllProvisioningItems: async () => Promise.resolve({ success: true }) // Mock implementation
};

const createItemAdditionHandler = (httpClient) => {
    return async (locationIdentifier, articleName) => {
        const dataPayload = { id: locationIdentifier, item: articleName };
        try {
            await httpClient.post('/api/~user_shopping_list_item', dataPayload);
            const successMessage = `You successfully added ${articleName} to your provisioning list.`;
            displayFeedbackAlert(false, successMessage);
        } catch (err) {
            const failureMessage = `An issue arose while adding ${articleName} to your provisioning list. Kindly refresh the page and attempt again.`;
            displayFeedbackAlert(true, failureMessage);
        }
    };
};

const locateAgriculturalUnits = (stateContainer, farmProvider) => {
    stateContainer.farmCollection = farmProvider.obtainAll();
};

const agriculturalUnitDetails = (stateContainer, routeParameters, farmProvider, httpClient) => {
    stateContainer.currentAgriculturalUnit = farmProvider.obtainOne(routeParameters.unitIdentifier);
    stateContainer.addToProvisioningList = createItemAdditionHandler(httpClient);

    stateContainer.geographicCenter = { latitude: 0, longitude: 0 };
    stateContainer.zoomLevel = 9;

    stateContainer.currentAgriculturalUnit.then(unitData => {
        if (unitData && typeof unitData.latitude !== 'undefined' && typeof unitData.longitude !== 'undefined') {
            const centralMarketCoord = { latitude: 43.074703, longitude: -76.167891 };
            const unitCoord = { latitude: unitData.latitude, longitude: unitData.longitude };
            Object.assign(stateContainer, {
                geographicCenter: centralMarketCoord,
                mapMarkers: [unitCoord],
            });
        }
    });
};

const cultivationOverview = (stateContainer, productProvider) => {
    stateContainer.availableCultivations = productProvider.retrieveAvailableProducts();
};

const cultivationSpecifics = (stateContainer, routeParameters, productProvider, httpClient) => {
    const specificProductName = routeParameters.itemLabel;
    stateContainer.cultivationImage = productProvider.obtainProductVisual(specificProductName);

    stateContainer.detailedCultivation = productProvider.retrieveProductDetails(specificProductName).then(itemDetails => {
        if (itemDetails && itemDetails.booths) {
            itemDetails.booths = itemDetails.booths.map(booth => {
                const filteredSellSheet = booth.sellSheet.filter(entry => specificProductName === entry.item);
                return {
                    ...booth,
                    sellSheet: filteredSellSheet,
                    hasDifferentVarieties: false
                };
            });
        }
        return itemDetails;
    });

    stateContainer.addToProvisioningList = createItemAdditionHandler(httpClient);
};

const groupCollectionByProperty = (collection, propertyAccessor) => {
    return collection.reduce((accumulator, currentItem) => {
        const key = typeof propertyAccessor === 'function' ? propertyAccessor(currentItem) : currentItem[propertyAccessor];
        if (!accumulator[key]) {
            accumulator[key] = [];
        }
        accumulator[key].push(currentItem);
        return accumulator;
    }, {});
};

const provisioningLogistics = (stateContainer, customerDataSource, httpClient) => {
    stateContainer.provisioningList = customerDataSource.fetchProvisioningItems();

    stateContainer.organizedSheds = stateContainer.provisioningList.then(items => {
        return groupCollectionByProperty(items, item => item.shed);
    });

    stateContainer.isProvisioningListEmpty = stateContainer.provisioningList.then(items => {
        return items.length === 0;
    });

    stateContainer.removeItemFromProvisioningList = async (locationId, itemName, successCallback) => {
        const payload = { id: locationId, item: itemName };
        try {
            await httpClient.delete('/api/~user_shopping_list_item', payload);
            successCallback();
        } catch (err) {
            const failureMessage = `An issue occurred removing ${itemName} from your provisioning list. Kindly refresh the page and attempt again.`;
            displayFeedbackAlert(true, failureMessage);
        }
    };

    stateContainer.clearAllItems = async () => {
        try {
            await httpClient.delete('/api/~user_shopping_list');
            stateContainer.isProvisioningListEmpty = Promise.resolve(true);
            stateContainer.organizedSheds = Promise.resolve({});
        } catch (err) {
            const failureMessage = 'An issue occurred clearing your provisioning list. Kindly try again.';
            displayFeedbackAlert(true, failureMessage);
        }
    };
};