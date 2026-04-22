const remoteServerAddress = 'https://api.coinkite.com';

const getObjectKeys = (obj) => Object.keys(obj);
const sortArrayByProperty = (arr, propertyAccessor) => arr.slice().sort((a, b) => {
    const valA = propertyAccessor(a);
    const valB = propertyAccessor(b);
    if (valA < valB) return -1;
    if (valA > valB) return 1;
    return 0;
});
const filterArrayDifference = (primaryArr, ...excludeArrs) => {
    const allExcludes = new Set();
    excludeArrs.forEach(arr => arr.forEach(item => allExcludes.add(item)));
    return primaryArr.filter(item => !allExcludes.has(item));
};

const systemLogger = {
    trace: console.debug || console.log,
};

const requestObserver = (() => {
    const interceptRequest = (cfg) => {
        systemLogger.trace("Network Request", cfg.url, cfg);
        return cfg;
    };

    const interceptResponse = (res) => {
        systemLogger.trace("Network Response:", res);
        return res;
    };

    const interceptError = (err) => {
        systemLogger.trace("Network Response (Error):", err);
        if (!err.data) {
            err.data = `{"issue":"Network Error ${err.status}"}`;
        }
        return err;
    };

    return {
        onStart: interceptRequest,
        onSuccess: interceptResponse,
        onError: interceptError
    };
})();

const createNetworkClient = (observer) => {
    const makeRequest = async (url) => {
        let config = { url: url, method: 'GET' };

        if (observer && observer.onStart) {
            config = observer.onStart(config);
        }

        try {
            const response = await fetch(config.url, { method: config.method });
            let data = null;
            try {
                data = await response.json();
            } catch (e) {
                data = await response.text();
            }

            let processedResponse = {
                data: data,
                status: response.status,
                statusText: response.statusText,
                config: config,
                headers: () => response.headers
            };

            if (observer && observer.onSuccess) {
                processedResponse = observer.onSuccess(processedResponse);
            }
            return processedResponse;
        } catch (error) {
            let errorResponse = {
                data: null,
                status: 0,
                statusText: error.message,
                config: config,
            };

            if (error instanceof Response) {
                errorResponse.status = error.status;
                errorResponse.statusText = error.statusText;
                try {
                    errorResponse.data = await error.json();
                } catch (e) {
                    errorResponse.data = await error.text();
                }
            } else if (error instanceof TypeError && error.message === 'Failed to fetch') {
                errorResponse.status = -1;
                errorResponse.statusText = 'Network Error';
            }

            if (observer && observer.onError) {
                errorResponse = observer.onError(errorResponse);
            }
            throw errorResponse;
        }
    };

    return {
        fetchData: makeRequest
    };
};

const dataTransmitter = createNetworkClient(requestObserver);

class CurrencyDisplayManager {
    constructor(apiHost, dataSource) {
        this.activityIndicator = true;
        this.currencyRates = {};
        this.currencyDetails = {};
        this.allCurrencyCodes = [];
        this.digitalCurrencyCodes = [];
        this.fiatCurrencyCodes = [];

        this.apiEndpoint = apiHost;
        this.dataFetcher = dataSource;

        this.refreshData();
    }

    async refreshData() {
        this.currencyRates = {};
        this.activityIndicator = true;

        try {
            const response = await this.dataFetcher.fetchData(this.apiEndpoint + '/public/rates');
            const apiData = response.data;

            this.currencyRates = apiData.rates;
            this.currencyDetails = apiData.currencies;
            this.allCurrencyCodes = getObjectKeys(apiData.currencies);

            this.digitalCurrencyCodes = sortArrayByProperty(
                getObjectKeys(apiData.rates),
                (k) => this.currencyDetails[k].rank
            );

            this.fiatCurrencyCodes = sortArrayByProperty(
                filterArrayDifference(this.allCurrencyCodes, this.digitalCurrencyCodes, ['XTN']),
                (k) => this.currencyDetails[k].rank
            );

            this.activityIndicator = false;
        } catch (error) {
            systemLogger.trace("Failed to load currency data:", error);
            this.activityIndicator = false;
        }
    }
}

const currencyHandler = new CurrencyDisplayManager(remoteServerAddress, dataTransmitter);