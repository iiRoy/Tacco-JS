class WeatherReporter {
    constructor(displayTarget, configuration) {
        if (!(displayTarget instanceof HTMLElement)) {
            console.error("WeatherReporter: Initial element must be a valid HTMLElement.");
            return;
        }

        this.primaryDisplay = displayTarget;

        const baseConfiguration = {
            descriptionElementSelector: null,
            maximumTemperatureElementSelector: null,
            minimumTemperatureElementSelector: null,
            windInformationElementSelector: null,
            humidityInformationElementSelector: null,
            dawnTimeElementSelector: null,
            duskTimeElementSelector: null,
            locationDisplayElementSelector: null,
            visualIconElementSelector: null,
            customIconRootUrl: null,
            temperatureMeasurementUnit: 'c', // 'c' for Celsius, 'f' for Fahrenheit
            geographicalLocationName: null,
            latitudeCoordinate: null,
            longitudeCoordinate: null,
            apiAuthenticationKey: null,
            displayLanguageCode: 'en',
            onDataReceived: () => {},
            onFailureOccurred: (issue) => { console.error("WeatherReporter Issue:", issue); }
        };

        this.effectiveConfiguration = Object.assign({}, baseConfiguration, configuration);

        this.remoteServiceAddress = 'https://api.openweathermap.org/data/2.5/weather?lang=' + this.effectiveConfiguration.displayLanguageCode;

        if (this.effectiveConfiguration.geographicalLocationName) {
            this.remoteServiceAddress += '&q=' + this.effectiveConfiguration.geographicalLocationName.replace(' ', '');
        } else if (this.effectiveConfiguration.latitudeCoordinate !== null && this.effectiveConfiguration.longitudeCoordinate !== null) {
            this.remoteServiceAddress += '&lat=' + this.effectiveConfiguration.latitudeCoordinate + '&lon=' + this.effectiveConfiguration.longitudeCoordinate;
        } else {
            this.effectiveConfiguration.onFailureOccurred('Location (city or lat/lon) specification missing.');
            return;
        }

        if (this.effectiveConfiguration.apiAuthenticationKey) {
            this.remoteServiceAddress += '&APPID=' + this.effectiveConfiguration.apiAuthenticationKey;
        } else {
            this.effectiveConfiguration.onFailureOccurred('API Key specification missing.');
            return;
        }

        this.retrieveInformation();
    }

    static transformTemperature(kelvinValue, targetUnit) {
        if (targetUnit === 'f') {
            return Math.round(((kelvinValue - 273.15) * 1.8) + 32) + '°F';
        } else {
            return Math.round(kelvinValue - 273.15) + '°C';
        }
    }

    static processTimeValue(unixMoment) {
        const momentInstance = new Date(unixMoment * 1000);
        let hourComponent = momentInstance.getHours();
        const minuteComponent = String(momentInstance.getMinutes()).padStart(2, '0');
        
        if (hourComponent > 12) {
            const remainderHours = 24 - hourComponent;
            hourComponent = 12 - remainderHours;
        }
        
        if (hourComponent === 0) hourComponent = 12; // Midnight (00:xx) becomes 12:xx

        return `${hourComponent}:${minuteComponent}`;
    }

    static determineVisualIcon(codeString, customBase) {
        if (!codeString) return null;

        if (customBase) {
            const timePeriod = codeString.endsWith('d') ? 'day' : 'night';
            let visualIdentifier;

            const iconMapping = new Map([
                [['01d', '01n'], 'clear'],
                [['02d', '02n', '03d', '03n', '04d', '04n'], 'clouds'],
                [['09d', '09n', '10d', '10n'], 'rain'],
                [['11d', '11n'], 'storm'],
                [['13d', '13n'], 'snow'],
                [['50d', '50n'], 'mist']
            ]);

            for (const [codes, name] of iconMapping.entries()) {
                if (codes.includes(codeString)) {
                    visualIdentifier = name;
                    break;
                }
            }

            if (visualIdentifier) {
                return `${customBase}${timePeriod}/${visualIdentifier}.png`;
            }
        }
        return `https://openweathermap.org/img/w/${codeString}.png`;
    }

    async retrieveInformation() {
        try {
            const responseOutcome = await fetch(this.remoteServiceAddress);
            if (!responseOutcome.ok) {
                throw new Error(`Network problem: ${responseOutcome.statusText}`);
            }
            const receivedData = await responseOutcome.json();

            if (receivedData.cod && receivedData.cod !== 200) {
                throw new Error(`Service Error: ${receivedData.message}`);
            }

            this.updateInterface(receivedData);
            this.effectiveConfiguration.onDataReceived(receivedData);

        } catch (requestProblem) {
            this.effectiveConfiguration.onFailureOccurred(requestProblem.message);
        }
    }

    updateInterface(receivedData) {
        const currentAmbientTemperature = WeatherReporter.transformTemperature(receivedData.main.temp, this.effectiveConfiguration.temperatureMeasurementUnit);
        this.primaryDisplay.innerHTML = currentAmbientTemperature;

        const lowestDailyTemperature = WeatherReporter.transformTemperature(receivedData.main.temp_min, this.effectiveConfiguration.temperatureMeasurementUnit);
        const highestDailyTemperature = WeatherReporter.transformTemperature(receivedData.main.temp_max, this.effectiveConfiguration.temperatureMeasurementUnit);

        this.setElementContent(this.effectiveConfiguration.minimumTemperatureElementSelector, lowestDailyTemperature);
        this.setElementContent(this.effectiveConfiguration.maximumTemperatureElementSelector, highestDailyTemperature);
        this.setElementContent(this.effectiveConfiguration.descriptionElementSelector, receivedData.weather[0].description);
        this.setElementContent(this.effectiveConfiguration.locationDisplayElementSelector, `${receivedData.name}, ${receivedData.sys.country}`);
        this.setElementContent(this.effectiveConfiguration.windInformationElementSelector, `${Math.round(receivedData.wind.speed)} Mps`);
        this.setElementContent(this.effectiveConfiguration.humidityInformationElementSelector, `${receivedData.main.humidity}%`);

        const dawnMoment = WeatherReporter.processTimeValue(receivedData.sys.sunrise);
        const duskMoment = WeatherReporter.processTimeValue(receivedData.sys.sunset);
        this.setElementContent(this.effectiveConfiguration.dawnTimeElementSelector, `${dawnMoment} AM`);
        this.setElementContent(this.effectiveConfiguration.duskTimeElementSelector, `${duskMoment} PM`);

        if (this.effectiveConfiguration.visualIconElementSelector && receivedData.weather[0].icon) {
            const visualAssetReference = WeatherReporter.determineVisualIcon(receivedData.weather[0].icon, this.effectiveConfiguration.customIconRootUrl);
            const iconElement = document.querySelector(this.effectiveConfiguration.visualIconElementSelector);
            if (iconElement) {
                iconElement.setAttribute('src', visualAssetReference);
            }
        }
    }

    setElementContent(selectorReference, contentValue) {
        if (selectorReference) {
            const targetDomElement = document.querySelector(selectorReference);
            if (targetDomElement) {
                targetDomElement.textContent = contentValue;
            }
        }
    }
}