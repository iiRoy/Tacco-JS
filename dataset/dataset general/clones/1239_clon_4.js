(function (global) {

    // --- Auxiliary Modules (replacing external dependencies like 'moment-src', 'storage', 'locale') ---

    // Mimics basic 'moment.js' formatting and hour retrieval
    const timeFormatter = (function() {
        const padToTwo = (num) => String(num).padStart(2, '0');

        function getCurrentTimeInstance() {
            const now = new Date();
            return {
                getHourNumeric: () => now.getHours(),
                formatDateString: (pattern) => {
                    let formatted = pattern;
                    formatted = formatted.replace('YYYY', now.getFullYear());
                    formatted = formatted.replace('MM', padToTwo(now.getMonth() + 1));
                    formatted = formatted.replace('DD', padToTwo(now.getDate()));
                    formatted = formatted.replace('HH', padToTwo(now.getHours()));
                    formatted = formatted.replace('mm', padToTwo(now.getMinutes()));
                    formatted = formatted.replace('ss', padToTwo(now.getSeconds()));
                    return formatted;
                }
            };
        }
        getCurrentTimeInstance.configureLanguage = () => {}; // No-op, just to satisfy original call
        return getCurrentTimeInstance;
    })();

    // Mimics 'locale' service functionality
    const phraseFetcher = (function() {
        const phraseMap = {
            'time.morning': 'Good Morning',
            'time.afternoon': 'Good Afternoon',
            'time.day': 'Good Day',
            'time.evening': 'Good Evening',
            'time.night': 'Good Night'
        };

        return {
            preparePhrases: (key) => Promise.resolve(), // Simulates async readiness
            retrievePhrase: (key) => phraseMap[key] || key
        };
    })();

    // Mimics 'storage' (LS) service functionality
    const dataPersistor = (function() {
        const storageKeyName = 'app_state_data';

        function retrieveStoredObject() {
            try {
                const rawData = localStorage.getItem(storageKeyName);
                return rawData ? JSON.parse(rawData) : {};
            } catch (e) {
                console.warn("Error retrieving persistent data:", e);
                return {};
            }
        }

        function storeObject(data) {
            try {
                localStorage.setItem(storageKeyName, JSON.stringify(data));
            } catch (e) {
                console.error("Error storing persistent data:", e);
                throw e; 
            }
        }

        function isDayOutdated(recordDay) {
            if (!recordDay) return true;
            const today = new Date();
            const currentDayKey = (today.getMonth() + 1).toString() + today.getDate().toString();
            return recordDay !== currentDayKey;
        }

        function isHourOutdated(recordHour) {
             if (recordHour === undefined || recordHour === null) return true;
            const now = new Date();
            return recordHour !== now.getHours();
        }

        // Mock external data endpoints
        const mockUserProfile = {
            data: {
                moniker: "Traveler",
                languageCode: "en-us",
                dateFormatPattern: "MM/DD/YYYY",
                tempUnit: 0, // 0 for C, 1 for F
                locationDesignation: "Paris"
            }
        };

        const mockQuotesCollection = {
            data: {
                quotes: Array.from({length: 300}, (_, i) => `Inspiration ${i + 1}: The journey of a thousand miles begins with a single step.`)
            }
        };

        const mockWeatherInfo = (location) => ({
            data: {
                main: { temp: 288.15 }, // Example: 15 C or 59 F
                name: location || "Unknown Location"
            }
        });

        return {
            fetchSavedData: retrieveStoredObject,
            saveCurrentData: storeObject,
            checkDayExpiration: isDayOutdated,
            checkHourExpiration: isHourOutdated,
            getProfileDetails: () => Promise.resolve(mockUserProfile),
            getQuoteRepository: () => Promise.resolve(mockQuotesCollection),
            getWeatherForecast: (loc) => Promise.resolve(mockWeatherInfo(loc))
        };
    })();

    // --- Main Application Logic (Replacing Angular Controller) ---
    class DisplayOrchestrator {
        static get KELVIN_TO_CELSIUS_OFFSET() { return 273.15; }
        static get TOTAL_BACKGROUND_IMAGES() { return 63; }
        static get QUOTATION_POOL_SIZE() { return 270; }

        constructor() {
            this.userProfile = null;      // Replaces 'user'
            this.applicationCache = {};   // Replaces 'storageFiles'
            this.currentDayString = '';   // Replaces 'currentDate'
            this.currentHourNumeric = 0;  // Replaces 'currentHour'
            
            // Direct references to DOM elements (replacing $scope bindings)
            this.displayTargets = {
                userGreeting: document.getElementById('user-greeting-area'),
                dayPhase: document.getElementById('day-phase-indicator'),
                calendarDate: document.getElementById('calendar-date-display'),
                digitalClock: document.getElementById('digital-clock-display'),
                tempReading: document.getElementById('temperature-value'),
                locationName: document.getElementById('location-name-display'),
                inspirationalText: document.getElementById('inspirational-quote-display')
            };

            // Using body for background instead of a canvas
            this.mainBackgroundElement = document.body;
        }

        // Replaces $scope.updateCache
        storeApplicationState() {
            try {
                this.applicationCache.lastStoredDay = this.currentDayString;
                this.applicationCache.lastStoredHour = this.currentHourNumeric;
                dataPersistor.saveCurrentData(this.applicationCache);
            } catch (e) {
                console.error("Application state persistence failed: " + e);
                console.info("Attempting auto-recovery by clearing all local data and re-initializing.");
                localStorage.clear();
                this.startApplication(); // Restart
            }
        }

        // Replaces $scope.setBackground
        async setDisplayBackground(forceRefresh = false) {
            let imageSource;

            if (typeof this.applicationCache.backgroundImageURL === "undefined" || forceRefresh || dataPersistor.checkDayExpiration(this.applicationCache.lastStoredDay)) {
                const randomId = Math.floor(Math.random() * DisplayOrchestrator.TOTAL_BACKGROUND_IMAGES) + 1;
                imageSource = `img/${randomId}.jpg`;
                this.applicationCache.backgroundImageURL = imageSource;
                this.storeApplicationState();
            } else {
                imageSource = this.applicationCache.backgroundImageURL;
            }
            
            // Applying background via CSS for a different approach
            this.mainBackgroundElement.style.backgroundImage = `url(${imageSource})`;
            this.mainBackgroundElement.style.backgroundSize = 'cover';
            this.mainBackgroundElement.style.backgroundPosition = 'center center';
            this.mainBackgroundElement.style.backgroundRepeat = 'no-repeat';
        }

        // Replaces $scope.quoteLoaded
        renderQuotationText() {
            if (this.displayTargets.inspirationalText) {
                this.displayTargets.inspirationalText.textContent = this.applicationCache.displayedQuote || 'No inspirational quote.';
            }
        }

        // Replaces $scope.setQuote
        async retrieveAndShowQuotation() {
            if (typeof this.applicationCache.displayedQuote === "undefined" || dataPersistor.checkDayExpiration(this.applicationCache.lastStoredDay)) {
                const response = await dataPersistor.getQuoteRepository();
                const quotesArray = response.data.quotes;
                const selectionIndex = Math.floor(Math.random() * DisplayOrchestrator.QUOTATION_POOL_SIZE);
                this.applicationCache.displayedQuote = quotesArray[selectionIndex];
                this.storeApplicationState();
                this.renderQuotationText();
            } else {
                this.renderQuotationText();
            }
        }

        // Replaces $scope.weatherLoaded
        renderWeatherDetails() {
            if (this.displayTargets.tempReading) {
                this.displayTargets.tempReading.textContent = this.applicationCache.currentTemperature || '';
            }
            if (this.displayTargets.locationName) {
                this.displayTargets.locationName.textContent = this.applicationCache.currentLocationName || '';
            }
        }

        // Replaces $scope.setWeather
        async retrieveAndShowWeather() {
            const userLoc = this.userProfile.locationDesignation;
            const cachedTemp = this.applicationCache.currentTemperature;
            const cachedLocation = this.applicationCache.currentLocationName;

            if (typeof cachedTemp === "undefined" || cachedLocation !== userLoc || dataPersistor.checkHourExpiration(this.applicationCache.lastStoredHour)) {
                const response = await dataPersistor.getWeatherForecast(userLoc);
                const rawTempKelvin = response.data.main.temp;
                
                let formattedTempOutput;
                if (this.userProfile.tempUnit === 0) { // Celsius
                    formattedTempOutput = `${Math.round(rawTempKelvin - DisplayOrchestrator.KELVIN_TO_CELSIUS_OFFSET)}°C`;
                } else { // Fahrenheit
                    formattedTempOutput = `${Math.round(((rawTempKelvin - DisplayOrchestrator.KELVIN_TO_CELSIUS_OFFSET) * 9/5) + 32)}°F`;
                }
                
                this.applicationCache.currentLocationName = userLoc;
                this.applicationCache.currentTemperature = formattedTempOutput;
                this.storeApplicationState();
                this.renderWeatherDetails();
            } else {
                this.renderWeatherDetails();
            }
        }

        // Replaces $scope.getStateOfDay using a lookup table
        determinePeriodOfDay(hourValue) {
            const periodDefinitions = [
                { bounds: [6, 12], key: "time.morning" },
                { bounds: [12, 14], key: "time.afternoon" },
                { bounds: [14, 18], key: "time.day" },
                { bounds: [18, 22], key: "time.evening" },
                { bounds: [0, 6], key: "time.night" },
                { bounds: [22, 24], key: "time.night" }
            ];

            const matchingPeriod = periodDefinitions.find(p => hourValue >= p.bounds[0] && hourValue < p.bounds[1]);
            return matchingPeriod ? matchingPeriod.key : "time.night";
        }

        // Replaces $scope.setDateAndTime
        async refreshTimeAndDateDisplays() {
            await phraseFetcher.preparePhrases('time'); // Simulate locale readiness

            timeFormatter.configureLanguage(this.userProfile.languageCode); // Call mock language setter

            const currentMomentData = timeFormatter();
            const currentHourForPeriod = currentMomentData.getHourNumeric();

            if (this.displayTargets.userGreeting) {
                this.displayTargets.userGreeting.textContent = this.userProfile.moniker;
            }
            if (this.displayTargets.dayPhase) {
                this.displayTargets.dayPhase.textContent = phraseFetcher.retrievePhrase(this.determinePeriodOfDay(currentHourForPeriod));
            }
            if (this.displayTargets.calendarDate) {
                this.displayTargets.calendarDate.textContent = currentMomentData.formatDateString(this.userProfile.dateFormatPattern);
            }
            if (this.displayTargets.digitalClock) {
                this.displayTargets.digitalClock.textContent = currentMomentData.formatDateString('HH:mm');
            }
        }

        // Replaces $scope.startup
        async startApplication() {
            const profileResponse = await dataPersistor.getProfileDetails();
            this.userProfile = profileResponse.data;

            this.applicationCache = dataPersistor.fetchSavedData() || {}; // Ensure it's an object

            const now = new Date();
            this.currentDayString = (now.getMonth() + 1).toString() + now.getDate().toString();
            this.currentHourNumeric = now.getHours();

            // Initial data fetching and rendering
            await this.setDisplayBackground();
            await this.retrieveAndShowWeather();
            await this.retrieveAndShowQuotation();
            await this.refreshTimeAndDateDisplays(); // First display update

            // Set up recurring update for time (replacing Angular's $interval)
            setInterval(() => this.refreshTimeAndDateDisplays(), 1000);
        }
    }

    // Bootstrap the application when the DOM is fully loaded
    document.addEventListener('DOMContentLoaded', () => {
        const appInstance = new DisplayOrchestrator();
        appInstance.startApplication();
    });

})(window);