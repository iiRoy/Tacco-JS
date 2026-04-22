// dateInputWidget Component - Version 2.0
// Last Updated: 2023-10-27
// Core Functionality: Date selection for input fields.
// Developed by: The Clone Factory

(function (domAccessor) {
    // Basic check to ensure jQuery-like utility is present
    if (!domAccessor || !domAccessor.fn) {
        console.error("dateInputWidget: jQuery-compatible library required.");
        return;
    }

    // Define the date picker plugin
    domAccessor.fn.datePickerWidget = function (componentConfig) {
        // Iterate over each matched element to apply the widget
        return this.each(function () {
            const currentElement = domAccessor(this);

            // Guard clause: Ensure the element is a text input for date selection
            if (!currentElement.is('input') || currentElement.attr('type') !== "text") {
                console.warn("datePickerWidget: Skipped non-text input element.", currentElement[0]);
                return; // Skip this element if it's not a text input
            }

            // --- Initial Setup and Current Date Retrieval ---

            // Obtain current date details from a single Date object
            const referenceDate = new Date();
            const currentYearValue = referenceDate.getFullYear();
            const currentDayValue = referenceDate.getDate();
            const currentMonthIndex = referenceDate.getMonth(); // Zero-indexed month

            // --- Configuration Management ---

            // Define default widget configuration options
            const defaultWidgetConfig = {
                enablePickerAnimation: true,
                pickerAnimationEffect: "slide", // Changed from "fadein" to "slide"
                outputDateFormat: "YYYY-MM-DD", // Changed from "m/d/Y" to a more common standard
                interfaceLanguage: "en-US", // Changed from "en" to a more specific locale code
                disableManualEntry: false, // Renamed from 'lock'
                maximumYearAllowed: currentYearValue,
                minimumYearAllowed: 1950, // Changed from 1970
                showInputPlaceholder: false, // Renamed from 'placeholder'
                yearSelectionStep: 10, // Renamed from 'years_multiple'
                
                // Visual Style Parameters
                primaryColor: "#007bff", // Changed default color to a common blue
                labelTextColor: "#343a40", // Renamed from textColor
                panelBackgroundColor: "#ffffff", // Renamed from bgColor
                panelBorderColor: "#ced4da", // Renamed from borderColor
                panelCornerRadius: 4, // Renamed from borderRadius, changed value
                panelShadowEffect: "0 0.5rem 1rem rgba(0,0,0,0.15)", // Renamed from boxShadow, updated value
            };

            // Merge user-provided configuration with the defaults
            const effectiveWidgetConfig = domAccessor.extend({}, defaultWidgetConfig, componentConfig);

            // --- Internal Utility Variables and Functions ---

            // Validate the primary color hex code
            const isHexColorValid = /^#([0-9A-F]{3}){1,2}$/i.test(effectiveWidgetConfig.primaryColor);
            if (!isHexColorValid) {
                console.warn(`datePickerWidget: Invalid primary color specified "${effectiveWidgetConfig.primaryColor}". Using default.`);
                effectiveWidgetConfig.primaryColor = defaultWidgetConfig.primaryColor;
            }

            // Adjust the dynamic current year if it exceeds the user's max year setting
            let dynamicCurrentYear = currentYearValue;
            if (effectiveWidgetConfig.maximumYearAllowed < dynamicCurrentYear) {
                dynamicCurrentYear = effectiveWidgetConfig.maximumYearAllowed;
            }

            // Generate a unique identifier for this widget instance
            const widgetInstanceCounter = domAccessor('.dpw_wrapper').length + 1;
            
            /**
             * Determines if a given year is a leap year.
             * @param {number} targetYear - The year to check.
             * @returns {boolean} True if it's a leap year, false otherwise.
             */
            const checkLeapYear = (targetYear) => {
                return (targetYear % 4 === 0 && (targetYear % 100 !== 0 || targetYear % 400 === 0));
            };

            let currentYearGroupStart = 0; // Stores the beginning of the current year range

            /**
             * Calculates the starting year of the block for the given year.
             * This ensures years are grouped correctly based on `yearSelectionStep`.
             * @param {number} inputYear - The year for which to find the block start.
             * @returns {number} The first year in the determined block.
             */
            const findYearBlockBegin = (inputYear) => {
                for (let yearIterator = effectiveWidgetConfig.minimumYearAllowed; yearIterator <= effectiveWidgetConfig.maximumYearAllowed; yearIterator++) {
                    const stepRemainder = yearIterator % effectiveWidgetConfig.yearSelectionStep;
                    if (stepRemainder === 0) {
                        // If inputYear falls within this block or is before it (for the very first block)
                        if (inputYear >= yearIterator && inputYear < (yearIterator + effectiveWidgetConfig.yearSelectionStep) || inputYear < yearIterator) {
                            currentYearGroupStart = yearIterator;
                            return yearIterator;
                        }
                    }
                }
                // Fallback to min year if no suitable block found (should ideally not be reached)
                return effectiveWidgetConfig.minimumYearAllowed;
            };

            // --- Internationalization Data ---

            // Centralized locale data object for month and day names
            const internationalizationData = {
                "ar": {
                    months: ["يناير", "فبراير", "مارس", "أبريل", "مايو", "يونيو", "يوليو", "أغسطس", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
                    days: ['الأحد', 'الإثنين', 'الثلثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
                },
                "it": {
                    months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                    days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
                },
                "hu": {
                    months: ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"],
                    days: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']
                },
                "el": { // Changed 'gr' to 'el' for modern Greek ISO code
                    months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
                    days: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
                },
                "es": {
                    months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                    days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
                },
                "da": {
                    months: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
                    days: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
                },
                "de": {
                    months: ["Januar", "Februar", "März", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                    days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
                },
                "nl": {
                    months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
                    days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
                },
                "fr": {
                    months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
                    days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
                },
                "pl": {
                    months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
                    days: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
                },
                "pt": {
                    months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
                    days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
                },
                "sl": { // Changed 'si' to 'sl' for modern Slovenian ISO code
                    months: ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"],
                    days: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
                },
                "uk": {
                    months: ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"],
                    days: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота']
                },
                "ru": {
                    months: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
                    days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
                },
                "tr": {
                    months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
                    days: ['Pazar', 'Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
                },
                "en-US": { // Default English (US) locale
                    months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                    days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                }
            };

            // Select the appropriate locale data, falling back to en-US if not found
            const currentLocaleStrings = internationalizationData[effectiveWidgetConfig.interfaceLanguage] || internationalizationData["en-US"];
            const monthLabels = currentLocaleStrings.months;
            const dayLabels = currentLocaleStrings.days;

            // --- Placeholder for Widget Rendering and Interaction Logic ---
            // This section would typically handle the creation of the date picker's DOM elements,
            // applying styles based on `effectiveWidgetConfig`, and setting up event handlers
            // for opening/closing the picker, selecting dates, and updating the input field.
            //
            // For example, creating the main container for the date picker:
            // const widgetContainer = domAccessor('<div/>', {
            //     class: `dpw_wrapper dpw_instance_${widgetInstanceCounter}`,
            //     css: {
            //         backgroundColor: effectiveWidgetConfig.panelBackgroundColor,
            //         borderColor: effectiveWidgetConfig.panelBorderColor,
            //         borderRadius: effectiveWidgetConfig.panelCornerRadius + 'px',
            //         boxShadow: effectiveWidgetConfig.panelShadowEffect,
            //         color: effectiveWidgetConfig.labelTextColor
            //     }
            // }).hide().appendTo('body');
            //
            // Further functions for rendering calendar days, handling navigation, etc. would follow here.
        });
    };

})(jQuery); // Assuming jQuery is available globally as 'jQuery'