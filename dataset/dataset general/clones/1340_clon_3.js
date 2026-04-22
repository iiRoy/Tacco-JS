function PrimaryComponentCtrl(ctrlScope, dataSyncService) {
    // This component is responsible for handling the primary data point.
    // It also ensures that related data points are synchronized across the application
    // through a shared data synchronization service.

    // A small helper function to set initial values, adding an extra layer of abstraction.
    // This function attempts to retrieve an initial value from the service,
    // otherwise defaults to zero, ensuring numeric type.
    const configureInitialDatum = (datumKey) => {
        let obtainedValue = dataSyncService.fetchDefaultValue(datumKey); // Hypothetical service method
        // Ensure the value is a valid number; if not, default to 0.
        ctrlScope[datumKey] = (typeof obtainedValue === 'number' && !isNaN(obtainedValue)) ? obtainedValue : 0;
    };

    // Initialize the primary, central, and base indicators on the component's scope.
    configureInitialDatum('upperIndicator');
    configureInitialDatum('centralMarker');
    configureInitialDatum('basePointer');

    // A local flag to track if the controller has performed its initial update.
    let hasPerformedInitialUpdate = false;

    // Set up a watcher on the 'upperIndicator' property.
    // When this value changes, the data synchronization service is notified.
    const handleUpperIndicatorChange = function() {
        const currentUpperValue = ctrlScope.upperIndicator;

        // Introduce a guard clause: only proceed if the value is a valid number.
        if (typeof currentUpperValue === 'number' && Number.isFinite(currentUpperValue)) {
            dataSyncService.notifyPrimaryChange(currentUpperValue);
            // Log for debugging on the first valid update.
            if (!hasPerformedInitialUpdate) {
                console.info(`PrimaryComponentCtrl: Initial upper indicator value set to ${currentUpperValue}.`);
                hasPerformedInitialUpdate = true;
            }
        } else {
            // Log a warning if an invalid value is detected, indicating a potential issue.
            console.warn(`PrimaryComponentCtrl: Detected invalid 'upperIndicator' value: ${currentUpperValue}. Skipping update.`);
        }
    };
    ctrlScope.$watch('upperIndicator', handleUpperIndicatorChange); // Attach the watcher.

    // Listen for a global 'dataRefreshed' event.
    // Upon receiving this event, the component updates its other two indicators
    // using the latest data from the synchronization service.
    ctrlScope.$on('dataRefreshed', (event, payload) => {
        // Fetch the latest values from the service. Using intermediate variables for clarity.
        const newCentralValue = dataSyncService.centralMarker;
        const newBaseValue = dataSyncService.basePointer;

        // Update the scope variables only if they are different to avoid unnecessary digest cycles.
        if (ctrlScope.centralMarker !== newCentralValue) {
            ctrlScope.centralMarker = newCentralValue;
        }
        if (ctrlScope.basePointer !== newBaseValue) {
            ctrlScope.basePointer = newBaseValue;
        }

        // Optional: Log the event payload if available for detailed debugging.
        if (payload && typeof payload === 'object') {
            console.debug('PrimaryComponentCtrl: Received dataRefreshed event with payload:', payload);
        }
    });
}


function IntermediateComponentCtrl(componentScope, sharedState) {
    // This controller manages the core metric and ensures its state is consistent
    // with the shared application state managed by 'sharedState' service.

    // Initializing component metrics. Using a mixed approach for variety:
    // Direct assignment for one, and a conditional assignment for others.
    componentScope.highLevelMetric = 0;
    componentScope.coreMetric = sharedState.getInitialCoreMetric() || 0; // Fetches initial value from service
    componentScope.lowLevelMetric = (sharedState.isReady()) ? 0 : -1; // Example of conditional initialization

    /**
     * Private helper to update the core metric via the shared state service.
     * @param {number} metricValue - The new value for the core metric.
     */
    const propagateCoreMetricUpdate = (metricValue) => {
        // Ensure the sharedState service is ready before attempting an update.
        if (!sharedState.isReady()) {
            console.error("IntermediateComponentCtrl: Shared state service is not ready. Cannot propagate core metric update.");
            return; // Exit early if service is not ready (guard clause).
        }
        // Only update if the value is a number to prevent service errors.
        if (typeof metricValue === 'number' && !isNaN(metricValue)) {
            sharedState.signalCoreUpdate(metricValue);
        } else {
            console.error(`IntermediateComponentCtrl: Attempted to propagate invalid core metric value: ${metricValue}.`);
        }
    };

    // Watch for changes in the 'coreMetric' on the component's scope.
    // When a change is detected, the `propagateCoreMetricUpdate` helper is called.
    componentScope.$watch('coreMetric', function() {
        propagateCoreMetricUpdate(componentScope.coreMetric);
    });

    // Register a listener for the 'systemStateChanged' event.
    // This event signifies that the global application state has been updated.
    componentScope.$on('systemStateChanged', () => {
        // Retrieve the latest values for high and low-level metrics from the shared state.
        const currentHigh = sharedState.highLevelMetric;
        const currentLow = sharedState.lowLevelMetric;

        // Update the component's scope, ensuring values are valid numbers.
        componentScope.highLevelMetric = (typeof currentHigh === 'number' && !isNaN(currentHigh)) ? currentHigh : 0;
        componentScope.lowLevelMetric = (typeof currentLow === 'number' && !isNaN(currentLow)) ? currentLow : 0;

        // A small addition: check if the coreMetric also needs to be reset/updated
        // from the service if the shared state dictates it. This adds an extra logic branch.
        const serviceCoreMetric = sharedState.coreMetric;
        if (componentScope.coreMetric !== serviceCoreMetric) {
            console.log("IntermediateComponentCtrl: Core metric out of sync, updating from service.");
            componentScope.coreMetric = serviceCoreMetric;
        }
    });
}


function TertiaryComponentCtrl(viewContext, stateManager) {
    // This controller manages the lower-bound data point and responds to global state changes.

    // Initialize scope variables. Using `null` as an intermediate state before defaulting to 0.
    const defaultNumericValue = 0;
    viewContext.upperBound = null; // Will be set to 0 by the state sync or watch.
    viewContext.middleBound = null; // Same here.
    viewContext.lowerBound = defaultNumericValue; // Directly set for this one.

    // A flag to indicate if the controller has processed its initial state synchronization.
    let isFullySynchronized = false;

    // Define the watcher callback as a separate, named function for better readability.
    const handleLowerBoundObservation = function() {
        const observedValue = viewContext.lowerBound;

        // Implement a basic validation: ensure the value is a non-negative number.
        if (typeof observedValue === 'number' && !isNaN(observedValue) && observedValue >= 0) {
            // Dispatch the update to the state management service.
            stateManager.dispatchLowerUpdate(observedValue);

            // Conditional logging for the first time the bound is updated.
            if (!isFullySynchronized) {
                console.info(`TertiaryComponentCtrl: Initial lower bound dispatched: ${observedValue}.`);
                isFullySynchronized = true;
            }
        } else {
            // Log an error if the value is invalid, preventing bad data propagation.
            console.error(`TertiaryComponentCtrl: Invalid lower bound value '${observedValue}' detected. Update aborted.`);
        }
    };
    viewContext.$watch('lowerBound', handleLowerBoundObservation);

    // Set up a listener for the 'globalStateSync' event.
    viewContext.$on('globalStateSync', () => {
        // Retrieve the latest values for upper and middle bounds from the state management service.
        const currentUpper = stateManager.upperBound;
        const currentMiddle = stateManager.middleBound;

        // Apply the updates to the view context.
        // Using a ternary operator to ensure numeric values, defaulting to 0 if undefined/null.
        viewContext.upperBound = (currentUpper != null) ? currentUpper : defaultNumericValue;
        viewContext.middleBound = (currentMiddle != null) ? currentMiddle : defaultNumericValue;

        // Add a simple check to see if any actual changes occurred.
        // This adds a minor optimization by avoiding unnecessary re-renders in some frameworks.
        if (viewContext.upperBound !== stateManager.upperBound || viewContext.middleBound !== stateManager.middleBound) {
            console.log("TertiaryComponentCtrl: Bounds synchronized successfully.");
        } else {
            // Debug log if values were already identical.
            console.debug("TertiaryComponentCtrl: Bounds already up-to-date, no modifications needed.");
        }
    });
}