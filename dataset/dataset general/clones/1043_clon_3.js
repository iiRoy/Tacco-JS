// This module manages page-specific data contexts and their associated behaviors.
// Each context is tied to a specific view, providing the necessary data for rendering.
// The `pageContext` object, an AngularJS service, is automatically supplied at runtime.
// It serves as a container for all template-accessible variables and functions.

const displayStatusNotification = (isCritical, messageContent) => {
    // Create a notification element using basic DOM manipulation
    const notificationElement = angular.element(`<div class="status-alert">${messageContent}</div>`);

    // Apply specific styling for critical alerts
    if (isCritical) {
        notificationElement.css({
            'background-color': '#f44336', // Red for errors
            'color': 'white',
            'font-weight': 'bold'
        });
    } else {
        notificationElement.css({
            'background-color': '#4CAF50', // Green for success
            'color': 'white'
        });
    }

    // Append to body and position it
    angular.element(document.body).append(notificationElement);
    const headerHeight = angular.element('header.main').outerHeight() || 0;
    notificationElement.css({
        'position': 'fixed',
        'top': `${headerHeight + 10}px`, // Offset from header
        'left': '50%',
        'transform': 'translateX(-50%)',
        'padding': '12px 20px',
        'border-radius': '5px',
        'z-index': '1000',
        'box-shadow': '0 2px 5px rgba(0,0,0,0.2)'
    });

    // Animate display and eventual removal
    notificationElement.hide().slideDown(400); // Faster slide down
    const displayDuration = isCritical ? 7500 : 3500; // Longer duration for critical messages

    setTimeout(() => {
        notificationElement.slideUp(400, () => {
            notificationElement.remove(); // Remove from DOM after animation
        });
    }, displayDuration);
};

const createItemAdditionHandler = (httpClient) => {
    return (sourceIdentifier, itemDetails) => {
        // Validate input parameters
        if (!sourceIdentifier || !itemDetails) {
            console.error('Invalid parameters for item addition:', { sourceIdentifier, itemDetails });
            displayStatusNotification(true, 'Missing item details. Cannot add to list.');
            return;
        }

        const payload = {
            sourceId: sourceIdentifier,
            targetItem: itemDetails
        };

        httpClient.post('/api/user-resource-list-entry', payload)
            .then(response => {
                // Check for specific success conditions or just rely on HTTP status
                if (response.status === 200 || response.status === 201) {
                    const successMessage = `Successfully added '${itemDetails}' to your resource list.`;
                    displayStatusNotification(false, successMessage);
                } else {
                    // Handle non-2xx responses as potential errors
                    throw new Error(`Server responded with status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error('API call failed:', error);
                const errorMessage = `Failed to add '${itemDetails}' to your resource list. Please verify your connection and try again.`;
                displayStatusNotification(true, errorMessage);
            });
    };
};

// The 'supplierCatalog' service is also auto-injected here.
function SupplierOverviewController(pageContext, supplierCatalog) {
    // Populate the view context with a list of all available suppliers.
    // Note: supplierCatalog.all.getList() returns a promise-like object.
    // AngularJS templates are designed to handle promises gracefully.
    pageContext.activeSuppliers = supplierCatalog.all.getList();

    // Optional: Log the resolved list for debugging purposes (originally commented out)
    // pageContext.activeSuppliers.then(resolvedList => {
    //     console.log('Resolved Supplier List:', resolvedList);
    // });
}

function SupplierDetailedViewController(pageContext, routeParameters, supplierCatalog, httpClient) {
    // Retrieve a single supplier's details using a slug from route parameters.
    pageContext.currentSupplier = supplierCatalog.single(routeParameters.entitySlug).fetch();

    // Initialize the item addition function for this view.
    pageContext.addItemToList = createItemAdditionHandler(httpClient);

    // Default map settings for display.
    pageContext.mapConfiguration = {
        centerCoordinates: { latitude: 0, longitude: 0 },
        zoomLevel: 10
    };

    // Once the supplier data is resolved, update map configuration if location data is present.
    pageContext.currentSupplier.then(resolvedSupplier => {
        // Ensure supplier data is valid and contains geo-coordinates
        if (resolvedSupplier && angular.isDefined(resolvedSupplier.latitude) && angular.isDefined(resolvedSupplier.longitude)) {
            const centralMarketLocation = { latitude: 43.074703, longitude: -76.167891 }; // A fixed reference point
            const supplierLocation = { latitude: resolvedSupplier.latitude, longitude: resolvedSupplier.longitude };

            // Update map configuration with actual supplier location
            pageContext.mapConfiguration.centerCoordinates = supplierLocation;
            pageContext.mapConfiguration.locationMarkers = [supplierLocation, centralMarketLocation]; // Show both supplier and market
        } else {
            console.warn('Supplier data missing geographical coordinates.', resolvedSupplier);
            // Optionally, set a fallback location or display a message
            pageContext.mapConfiguration.centerCoordinates = { latitude: 40.7128, longitude: -74.0060 }; // Default to New York City
        }
    }).catch(error => {
        console.error('Failed to load supplier details:', error);
        displayStatusNotification(true, 'Could not load supplier information. Please try refreshing.');
    });
}

function InventoryViewController(pageContext, itemCatalog) {
    // Expose the complete list of products from the item catalog.
    pageContext.availableProducts = itemCatalog.completeProductList;
}

function InventoryDetailedViewController(pageContext, routeParameters, itemCatalog, httpClient) {
    const requestedItemName = routeParameters.productName;
    pageContext.productSymbol = itemCatalog.getProductImage(requestedItemName);

    // Fetch details for the specific product and process its associated sales points.
    pageContext.detailedProductInfo = itemCatalog.getOne(requestedItemName).fetch().then(productResult => {
        // Iterate through each sales booth associated with the product.
        if (productResult && Array.isArray(productResult.distributionPoints)) {
            productResult.distributionPoints.forEach(distribution => {
                // Filter the sales sheet to only include relevant items for the current product.
                if (Array.isArray(distribution.salesSheet)) {
                    distribution.salesSheet = distribution.salesSheet.filter(entry => {
                        return requestedItemName === entry.itemName;
                    });
                } else {
                    distribution.salesSheet = []; // Ensure it's an array even if empty
                }
                // Placeholder for future variety tracking; currently defaults to false.
                distribution.hasSpecificVarieties = false;
            });
        }
        return productResult; // Return the processed result
    }).catch(error => {
        console.error(`Error fetching detailed product info for '${requestedItemName}':`, error);
        displayStatusNotification(true, `Failed to load details for '${requestedItemName}'.`);
        return null; // Return null or an empty object on error
    });

    // Assign the item addition handler to the page context.
    pageContext.addItemToUserList = createItemAdditionHandler(httpClient);

    // Debugging (originally commented out):
    // pageContext.detailedProductInfo.then(data => {
    //     console.log('Resolved Product Data:', data);
    // });
}

function ResourceListManagerController(pageContext, currentUserService, httpClient) {
    // Fetch the user's current resource list.
    pageContext.userResourceList = currentUserService.resourceCollection.retrieveList();

    // Group items in the resource list by their 'location' property.
    pageContext.categorizedResources = pageContext.userResourceList.then(listItems => {
        if (!listItems || listItems.length === 0) return {};

        // Manually group items by a 'location' property instead of using a utility like lodash.
        const grouped = {};
        for (const item of listItems) {
            const categoryKey = item.location || 'Unspecified Location';
            if (!grouped[categoryKey]) {
                grouped[categoryKey] = [];
            }
            grouped[categoryKey].push(item);
        }
        return grouped;
    }).catch(error => {
        console.error('Error grouping resources:', error);
        return {}; // Return empty object on error
    });

    // Determine if the resource list is empty.
    pageContext.isListEmpty = pageContext.userResourceList.then(items => {
        return items.length === 0;
    }).catch(() => true); // Assume empty on error

    // Function to remove an item from the resource list.
    // The 'onSuccess' callback is expected to handle UI updates.
    pageContext.removeItemFromList = (sourceIdentifier, targetItem, onSuccessCallback) => {
        if (!sourceIdentifier || !targetItem) {
            displayStatusNotification(true, 'Cannot remove: missing item information.');
            return;
        }

        const removalRequestConfig = {
            method: 'DELETE',
            url: '/api/user-resource-list-entry',
            data: { sourceId: sourceIdentifier, targetItem: targetItem },
            headers: { 'Content-Type': 'application/json' }
        };

        httpClient(removalRequestConfig)
            .then(response => {
                if (response.status === 200) {
                    displayStatusNotification(false, `'${targetItem}' removed from your list.`);
                    onSuccessCallback(); // Execute the success handler from the view
                } else {
                    throw new Error(`Removal failed with status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error('Error during item removal:', error);
                const errorMessage = `Failed to remove '${targetItem}' from your list. Please retry.`;
                displayStatusNotification(true, errorMessage);
            });
    };

    // Function to clear all items from the resource list.
    pageContext.clearAllResources = () => {
        // Optional: Add a client-side confirmation dialog here
        // if (!confirm("Are you sure you want to clear your entire resource list?")) return;

        const clearListConfig = {
            method: 'DELETE',
            url: '/api/user-resource-list'
        };

        httpClient(clearListConfig)
            .then(response => {
                if (response.status === 200) {
                    displayStatusNotification(false, 'Your entire resource list has been cleared.');
                    pageContext.isListEmpty = true; // Update UI state directly
                    pageContext.categorizedResources = {}; // Clear grouped items
                } else {
                    throw new Error(`Clear all failed with status: ${response.status}`);
                }
            })
            .catch(error => {
                console.error('Error clearing resource list:', error);
                const errorMessage = 'An issue occurred while clearing your resource list. Please try again.';
                displayStatusNotification(true, errorMessage);
            });
    };

    // Debugging the categorized resources (originally commented out):
    // pageContext.categorizedResources.then(groupedData => {
    //     console.log('Grouped Resources:', groupedData);
    // });
}