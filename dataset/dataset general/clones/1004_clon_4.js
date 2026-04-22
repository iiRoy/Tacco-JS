class TemporalUnit {
    #internalMoment;

    constructor(initialMoment) {
        if (initialMoment instanceof Date) {
            this.#internalMoment = new Date(initialMoment.getTime());
        } else if (typeof initialMoment === 'string') {
            this.#internalMoment = TemporalUnit.fromText(initialMoment).retrieveNativeMoment();
        } else if (typeof initialMoment === 'number') {
            this.#internalMoment = new Date(initialMoment);
        } else {
            this.#internalMoment = new Date();
        }
    }

    static #dayTitles = new Map();
    static #shortDayTitles = new Map();
    static #monthTitles = new Map();
    static #shortMonthTitles = new Map();

    static #primaryLocaleStart = 1;
    static #displayPattern = 'dd/mm/yyyy';
    static #centuryPrefix = '20';

    retrieveNativeMoment() {
        return new Date(this.#internalMoment.getTime());
    }

    checkYearForLeap() {
        const currentYear = this.#internalMoment.getFullYear();
        return (currentYear % 4 === 0 && currentYear % 100 !== 0) || currentYear % 400 === 0;
    }

    isDayOff() {
        const currentDay = this.#internalMoment.getDay();
        return currentDay === 0 || currentDay === 6;
    }

    isWorkDay() {
        return !this.isDayOff();
    }

    retrieveMonthDuration() {
        const currentMonth = this.#internalMoment.getMonth();
        if (currentMonth === 1) {
            return this.checkYearForLeap() ? 29 : 28;
        } else if ([3, 5, 8, 10].includes(currentMonth)) {
            return 30;
        }
        return 31;
    }

    fetchDayLabel(isConcise) {
        const dayIndex = this.#internalMoment.getDay();
        return isConcise ? TemporalUnit.#shortDayTitles.get(dayIndex) : TemporalUnit.#dayTitles.get(dayIndex);
    }

    fetchMonthLabel(isConcise) {
        const monthIndex = this.#internalMoment.getMonth();
        return isConcise ? TemporalUnit.#shortMonthTitles.get(monthIndex) : TemporalUnit.#monthTitles.get(monthIndex);
    }

    calculateOrdinalDay() {
        const startOfYear = new Date(this.#internalMoment.getFullYear(), 0, 1);
        const timeDifference = this.#internalMoment.getTime() - startOfYear.getTime();
        return Math.floor(timeDifference / (1000 * 60 * 60 * 24));
    }

    determineWeekNumber() {
        return Math.ceil((this.calculateOrdinalDay() + 1) / 7);
    }

    setOrdinalDay(dayNumber) {
        const currentYear = this.#internalMoment.getFullYear();
        const newMoment = new Date(currentYear, 0, 1);
        newMoment.setDate(newMoment.getDate() + dayNumber);
        this.#internalMoment = newMoment;
        return this;
    }

    advanceYears(count) {
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setFullYear(newMoment.getFullYear() + count);
        this.#internalMoment = newMoment;
        return this;
    }

    advanceMonths(count) {
        const dayOfMonth = this.#internalMoment.getDate();
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setMonth(newMoment.getMonth() + count);

        if (dayOfMonth > newMoment.getDate()) {
            newMoment.setDate(0);
        }
        this.#internalMoment = newMoment;
        return this;
    }

    advanceDays(count) {
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setDate(newMoment.getDate() + count);
        this.#internalMoment = newMoment;
        return this;
    }

    advanceHours(count) {
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setHours(newMoment.getHours() + count);
        this.#internalMoment = newMoment;
        return this;
    }

    advanceMinutes(count) {
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setMinutes(newMoment.getMinutes() + count);
        this.#internalMoment = newMoment;
        return this;
    }

    advanceSeconds(count) {
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setSeconds(newMoment.getSeconds() + count);
        this.#internalMoment = newMoment;
        return this;
    }

    resetTimeComponents() {
        const newMoment = new Date(this.#internalMoment.getTime());
        newMoment.setMilliseconds(0);
        newMoment.setSeconds(0);
        newMoment.setMinutes(0);
        newMoment.setHours(0);
        this.#internalMoment = newMoment;
        return this;
    }

    formatAsText(pattern) {
        const currentPattern = pattern || TemporalUnit.#displayPattern;
        const padWithZero = (value) => value < 10 ? '0' + value : '' + value;

        let formattedOutput = currentPattern;

        formattedOutput = formattedOutput.replace(/mmmm/g, this.fetchMonthLabel(false));
        formattedOutput = formattedOutput.replace(/mmm/g, this.fetchMonthLabel(true));
        formattedOutput = formattedOutput.replace(/mm/g, padWithZero(this.#internalMoment.getMonth() + 1));
        formattedOutput = formattedOutput.replace(/m/g, this.#internalMoment.getMonth() + 1);

        formattedOutput = formattedOutput.replace(/yyyy/g, this.#internalMoment.getFullYear());
        formattedOutput = formattedOutput.replace(/yy/g, ('' + this.#internalMoment.getFullYear()).substring(2));
        formattedOutput = formattedOutput.replace(/dd/g, padWithZero(this.#internalMoment.getDate()));
        formattedOutput = formattedOutput.replace(/d/g, this.#internalMoment.getDate());
        
        return formattedOutput;
    }

    static fromText(inputString, pattern) {
        const currentPattern = pattern || TemporalUnit.#displayPattern;
        const baseMoment = new Date(0);
        baseMoment.setUTCFullYear(1970);

        const lowerInput = inputString.toLowerCase();
        let formatSequence = new Map();
        let regexConstruction = [];
        let sequenceIndex = 0;

        const formatTokenParser = /(dd?d?|mm?m?|yy?yy?)+([^(m|d|y)])?/g;
        let tokenMatch;

        while ((tokenMatch = formatTokenParser.exec(currentPattern)) !== null) {
            const token = tokenMatch[1];
            const separator = tokenMatch[2] || '';

            switch (token) {
                case 'd':
                case 'dd':
                    regexConstruction.push('(\\d{1,2})');
                    formatSequence.set(sequenceIndex++, 'dayNum');
                    break;
                case 'm':
                case 'mm':
                    regexConstruction.push('(\\d{1,2})');
                    formatSequence.set(sequenceIndex++, 'monNum');
                    break;
                case 'mmm':
                case 'mmmm':
                    regexConstruction.push('([a-z]{3,})');
                    formatSequence.set(sequenceIndex++, 'monName');
                    break;
                case 'yy':
                    regexConstruction.push('(\\d{2})');
                    formatSequence.set(sequenceIndex++, 'shortYear');
                    break;
                case 'yyyy':
                    regexConstruction.push('(\\d{4})');
                    formatSequence.set(sequenceIndex++, 'fullYear');
                    break;
            }
            if (separator) {
                regexConstruction.push(escapeRegExp(separator));
            }
        }

        const compiledRegex = new RegExp(regexConstruction.join(''));
        const parsedInput = lowerInput.match(compiledRegex);

        if (!parsedInput) {
            return new TemporalUnit(new Date('Invalid Date'));
        }

        let yearComponent = 1970;
        let monthComponent = 0;
        let dayComponent = 1;

        for (let i = 0; i < formatSequence.size; i++) {
            const componentType = formatSequence.get(i);
            const componentValue = parsedInput[i + 1];

            switch (componentType) {
                case 'dayNum':
                    dayComponent = parseInt(componentValue, 10);
                    break;
                case 'monNum':
                    monthComponent = parseInt(componentValue, 10) - 1;
                    break;
                case 'monName':
                    let nameMonthIndex = -1;
                    for (let j = 0; j < 12; j++) {
                        if (TemporalUnit.#shortMonthTitles.get(j).toLowerCase() === componentValue || TemporalUnit.#monthTitles.get(j).toLowerCase() === componentValue) {
                            nameMonthIndex = j;
                            break;
                        }
                    }
                    if (nameMonthIndex !== -1) {
                        monthComponent = nameMonthIndex;
                    }
                    break;
                case 'shortYear':
                    yearComponent = parseInt(TemporalUnit.#centuryPrefix + componentValue, 10);
                    break;
                case 'fullYear':
                    yearComponent = parseInt(componentValue, 10);
                    break;
            }
        }

        baseMoment.setFullYear(yearComponent, monthComponent, dayComponent);
        return new TemporalUnit(baseMoment);
    }

    static setDayLabels(labels) { TemporalUnit.#dayTitles = new Map(labels.map((l, i) => [i, l])); }
    static setAbbreviatedDayLabels(labels) { TemporalUnit.#shortDayTitles = new Map(labels.map((l, i) => [i, l])); }
    static setMonthLabels(labels) { TemporalUnit.#monthTitles = new Map(labels.map((l, i) => [i, l])); }
    static setAbbreviatedMonthLabels(labels) { TemporalUnit.#shortMonthTitles = new Map(labels.map((l, i) => [i, l])); }
    static setLocaleStartDay(dayIndex) { TemporalUnit.#primaryLocaleStart = dayIndex; }
    static setDefaultDisplayPattern(pattern) { TemporalUnit.#displayPattern = pattern; }
    static setTwoDigitYearPrefix(prefix) { TemporalUnit.#centuryPrefix = prefix; }
}

function escapeRegExp(str) {
    return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

TemporalUnit.setDayLabels(['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']);
TemporalUnit.setAbbreviatedDayLabels(['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']);
TemporalUnit.setMonthLabels(['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']);
TemporalUnit.setAbbreviatedMonthLabels(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']);
TemporalUnit.setLocaleStartDay(1);
TemporalUnit.setDefaultDisplayPattern('dd/mm/yyyy');
TemporalUnit.setTwoDigitYearPrefix('20');