const STATUS_OPERATIONAL_MESSAGE = "Service is fully operational.";
const STATUS_PENDING_MESSAGE = "Attempting to establish connection...";
const STATUS_FAILURE_MESSAGE = "No browser support or API unavailable.";
const STATUS_IDLE_MESSAGE = "Click to initiate connection.";

class ServiceConnectivityMonitor {

    static #bitcoinChainDisplay = null;
    static #mtgoxTradeDisplay = null;

    static #craftStatusMarkup(serviceLabel, contentMessage, visualColor) {
        return `${serviceLabel}: <span style="color: ${visualColor};">${contentMessage}</span>`;
    }

    static #updateTargetElement(targetElement, serviceLabel, message, color) {
        if (targetElement && typeof targetElement.html === 'function') {
            targetElement.html(ServiceConnectivityMonitor.#craftStatusMarkup(serviceLabel, message, color));
        } else {
            console.error(`Error: Attempted to update a non-existent or invalid DOM element for ${serviceLabel}.`);
        }
    }

    static configureAndStart(isDebuggingEnabled) {
        if (typeof $ === 'undefined') {
            console.error("jQuery library not found. ServiceConnectivityMonitor cannot initialize.");
            return;
        }

        ServiceConnectivityMonitor.#bitcoinChainDisplay = $("#blockchainDisplayArea");
        ServiceConnectivityMonitor.#mtgoxTradeDisplay = $("#mtgoxDisplayArea");

        if (isDebuggingEnabled) {
            ServiceConnectivityMonitor.#mtgoxTradeDisplay.html("Debugging mode active for connectivity tracking.");
        }

        const btcServiceToggle = $("#btcStatusCheckbox");
        const goxServiceToggle = $("#goxStatusCheckbox");

        if (!btcServiceToggle.length || !goxServiceToggle.length) {
            console.warn("One or more service toggle checkboxes are missing. Initial states might be incorrect.");
        }

        const applyInitialState = (toggleElement, serviceIdentifier) => {
            if (toggleElement.is(":checked")) {
                ServiceConnectivityMonitor.setServiceToPending(serviceIdentifier);
            } else {
                ServiceConnectivityMonitor.setServiceToDisconnected(serviceIdentifier);
            }
        };

        applyInitialState(btcServiceToggle, "bitcoin");
        applyInitialState(goxServiceToggle, "mtgox");
    }

    static setServiceToOperational(serviceIdentifier) {
        const activeColor = "darkgreen";
        let labelPrefix = "";
        let displayTarget = null;

        if (!["bitcoin", "mtgox"].includes(serviceIdentifier)) {
            console.error(`Invalid service identifier provided: '${serviceIdentifier}'. Must be 'bitcoin' or 'mtgox'.`);
            return;
        }

        switch (serviceIdentifier) {
            case "bitcoin":
                labelPrefix = 'Blockchain.info Transactions';
                displayTarget = ServiceConnectivityMonitor.#bitcoinChainDisplay;
                break;
            case "mtgox":
                labelPrefix = 'Mt.Gox Exchange Trades';
                displayTarget = ServiceConnectivityMonitor.#mtgoxTradeDisplay;
                break;
        }
        ServiceConnectivityMonitor.#updateTargetElement(displayTarget, labelPrefix, STATUS_OPERATIONAL_MESSAGE, activeColor);
    }

    static setServiceToPending(serviceIdentifier) {
        const pendingColor = "gold";
        let labelPrefix = "";
        let displayTarget = null;

        if (!["bitcoin", "mtgox"].includes(serviceIdentifier)) {
            console.error(`Invalid service identifier provided: '${serviceIdentifier}'. Must be 'bitcoin' or 'mtgox'.`);
            return;
        }

        switch (serviceIdentifier) {
            case "bitcoin":
                labelPrefix = 'Blockchain.info Transactions';
                displayTarget = ServiceConnectivityMonitor.#bitcoinChainDisplay;
                break;
            case "mtgox":
                labelPrefix = 'Mt.Gox Exchange Trades';
                displayTarget = ServiceConnectivityMonitor.#mtgoxTradeDisplay;
                break;
        }
        ServiceConnectivityMonitor.#updateTargetElement(displayTarget, labelPrefix, STATUS_PENDING_MESSAGE, pendingColor);
    }

    static setServiceToUnavailable(serviceIdentifier) {
        const unavailableColor = "firebrick";
        let labelPrefix = "";
        let displayTarget = null;

        if (!["bitcoin", "mtgox"].includes(serviceIdentifier)) {
            console.error(`Invalid service identifier provided: '${serviceIdentifier}'. Must be 'bitcoin' or 'mtgox'.`);
            return;
        }

        switch (serviceIdentifier) {
            case "bitcoin":
                labelPrefix = 'Blockchain.info Transactions';
                displayTarget = ServiceConnectivityMonitor.#bitcoinChainDisplay;
                break;
            case "mtgox":
                labelPrefix = 'Mt.Gox Exchange Trades';
                displayTarget = ServiceConnectivityMonitor.#mtgoxTradeDisplay;
                break;
        }
        ServiceConnectivityMonitor.#updateTargetElement(displayTarget, labelPrefix, STATUS_FAILURE_MESSAGE, unavailableColor);
    }

    static setServiceToDisconnected(serviceIdentifier) {
        const inactiveColor = "silver";
        let labelPrefix = "";
        let displayTarget = null;

        if (!["bitcoin", "mtgox"].includes(serviceIdentifier)) {
            console.error(`Invalid service identifier provided: '${serviceIdentifier}'. Must be 'bitcoin' or 'mtgox'.`);
            return;
        }

        switch (serviceIdentifier) {
            case "bitcoin":
                labelPrefix = 'Blockchain.info Transactions';
                displayTarget = ServiceConnectivityMonitor.#bitcoinChainDisplay;
                break;
            case "mtgox":
                labelPrefix = 'Mt.Gox Exchange Trades';
                displayTarget = ServiceConnectivityMonitor.#mtgoxTradeDisplay;
                break;
        }
        ServiceConnectivityMonitor.#updateTargetElement(displayTarget, labelPrefix, STATUS_IDLE_MESSAGE, inactiveColor);
    }
}