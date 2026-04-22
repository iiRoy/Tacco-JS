class DateTimePicker {
    constructor(inputField, userPreferences) {
        if (!(inputField instanceof Element)) {
            throw new Error("Initialization target must be a valid DOM element.");
        }

        if (inputField.tagName !== 'INPUT' || inputField.type !== 'text') {
            throw new Error("DateTimePicker can only be applied to input elements of type 'text'.");
        }

        this.associatedInput = inputField;

        const currentMoment = new Date();
        this.currentCalendarYear = currentMoment.getFullYear();
        this.currentCalendarDay = currentMoment.getDate();
        this.currentCalendarMonth = currentMoment.getMonth(); // 0-indexed

        const defaultSettings = {
            animationEnabled: true,
            displayTransition: "fadein",
            outputStringFormat: "m/d/Y",
            localeCode: "en",
            selectionLocked: false,
            maximumAllowedYear: this.currentCalendarYear,
            minimumAllowedYear: 1970,
            inputPlaceholderText: false,
            yearBlockSize: 10,

            // Visual attributes
            highlightColor: "#f87a54",
            primaryTextColor: "#000000",
            componentBgColor: "#FFFFFF",
            componentBorderColor: "#000000",
            borderCornerRadius: 8,
            shadowStyle: "0 0px 0px 6px rgba(0,0,0,0.05)",
        };

        const mergeObjects = (base, overrides) => {
            const result = {};
            for (const key in base) {
                result[key] = base[key];
            }
            for (const key in overrides) {
                if (overrides[key] !== undefined) {
                    result[key] = overrides[key];
                }
            }
            return result;
        };

        this.configuration = mergeObjects(defaultSettings, userPreferences);

        this.checkIfLeapYear = (yearValue) => {
            return (new Date(yearValue, 1, 29).getMonth() === 1);
        };

        this.determineYearBlockStart = (desiredYear) => {
            for (let testYear = this.configuration.minimumAllowedYear; testYear <= this.configuration.maximumAllowedYear; testYear++) {
                if (testYear % this.configuration.yearBlockSize === 0) {
                    if (desiredYear >= testYear && desiredYear < (testYear + this.configuration.yearBlockSize)) {
                        return testYear;
                    }
                    if (desiredYear < testYear) {
                        return testYear;
                    }
                }
            }
            // Fallback for edge cases outside the explicit loop range but still within logical bounds
            return Math.floor(this.configuration.maximumAllowedYear / this.configuration.yearBlockSize) * this.configuration.yearBlockSize;
        };

        this.validateHexFormat = (colorString) => {
            return /^#[0-9A-F]{6}$/i.test(colorString);
        };

        if (!this.validateHexFormat(this.configuration.highlightColor)) {
            this.configuration.highlightColor = '#f87a54';
        }

        if (this.configuration.maximumAllowedYear < this.currentCalendarYear) {
            this.currentCalendarYear = this.configuration.maximumAllowedYear;
        }

        const localizationRepository = {
            'ar': {
                months: ["جانفي", "فيفري", "مارس", "أفريل", "ماي", "جوان", "جويلية", "أوت", "سبتمبر", "أكتوبر", "نوفمبر", "ديسمبر"],
                days: ['الأحد', 'الإثنين', 'الثلثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت']
            },
            'it': {
                months: ["Gennaio", "Febbraio", "Marzo", "Aprile", "Maggio", "Giugno", "Luglio", "Agosto", "Settembre", "Ottobre", "Novembre", "Dicembre"],
                days: ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato']
            },
            'hu': {
                months: ["január", "február", "március", "április", "május", "június", "július", "augusztus", "szeptember", "október", "november", "december"],
                days: ['vasárnap', 'hétfő', 'kedd', 'szerda', 'csütörtök', 'péntek', 'szombat']
            },
            'gr': {
                months: ["Ιανουάριος", "Φεβρουάριος", "Μάρτιος", "Απρίλιος", "Μάιος", "Ιούνιος", "Ιούλιος", "Αύγουστος", "Σεπτέμβριος", "Οκτώβριος", "Νοέμβριος", "Δεκέμβριος"],
                days: ['Κυριακή', 'Δευτέρα', 'Τρίτη', 'Τετάρτη', 'Πέμπτη', 'Παρασκευή', 'Σάββατο']
            },
            'es': {
                months: ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"],
                days: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado']
            },
            'da': {
                months: ["januar", "februar", "marts", "april", "maj", "juni", "juli", "august", "september", "oktober", "november", "december"],
                days: ['søndag', 'mandag', 'tirsdag', 'onsdag', 'torsdag', 'fredag', 'lørdag']
            },
            'de': {
                months: ["Januar", "Februar", "Marz", "April", "Mai", "Juni", "Juli", "August", "September", "Oktober", "November", "Dezember"],
                days: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag']
            },
            'nl': {
                months: ["januari", "februari", "maart", "april", "mei", "juni", "juli", "augustus", "september", "oktober", "november", "december"],
                days: ['zondag', 'maandag', 'dinsdag', 'woensdag', 'donderdag', 'vrijdag', 'zaterdag']
            },
            'fr': {
                months: ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"],
                days: ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi']
            },
            'pl': {
                months: ["styczeń", "luty", "marzec", "kwiecień", "maj", "czerwiec", "lipiec", "sierpień", "wrzesień", "październik", "listopad", "grudzień"],
                days: ['niedziela', 'poniedziałek', 'wtorek', 'środa', 'czwartek', 'piątek', 'sobota']
            },
            'pt': {
                months: ["Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho", "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"],
                days: ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"]
            },
            'si': {
                months: ["januar", "februar", "marec", "april", "maj", "junij", "julij", "avgust", "september", "oktober", "november", "december"],
                days: ['nedelja', 'ponedeljek', 'torek', 'sreda', 'četrtek', 'petek', 'sobota']
            },
            'uk': {
                months: ["січень", "лютий", "березень", "квітень", "травень", "червень", "липень", "серпень", "вересень", "жовтень", "листопад", "грудень"],
                days: ['неділя', 'понеділок', 'вівторок', 'середа', 'четвер', 'п\'ятниця', 'субота']
            },
            'ru': {
                months: ["январь", "февраль", "март", "апрель", "май", "июнь", "июль", "август", "сентябрь", "октябрь", "ноябрь", "декабрь"],
                days: ['воскресенье', 'понедельник', 'вторник', 'среда', 'четверг', 'пятница', 'суббота']
            },
            'tr': {
                months: ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"],
                days: ['Pazar', 'Pazartesi', 'Sali', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi']
            },
            'en': {
                months: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
                days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
            }
        };

        this.activeLanguageStrings = localizationRepository[this.configuration.localeCode] || localizationRepository['en'];
        this.componentInstanceId = document.querySelectorAll('.date-time-picker-container').length + 1;
        this.currentSelectedYearBlock = this.determineYearBlockStart(this.currentCalendarYear);
    }

    static attachToElements(selector, opts = {}) {
        const elements = document.querySelectorAll(selector);
        const activeInstances = [];
        elements.forEach(el => {
            try {
                const instance = new DateTimePicker(el, opts);
                activeInstances.push(instance);
            } catch (error) {
                console.warn(`Failed to initialize DateTimePicker for element:`, el, `Error:`, error.message);
            }
        });
        return activeInstances;
    }
}