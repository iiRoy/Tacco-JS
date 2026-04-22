(function() {
    const styleElement = document.createElement('style');
    styleElement.textContent = `
        .datecraft-panel {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: #fff;
            border: 1px solid #ccc;
            box-shadow: 0 4px 8px rgba(0,0,0,0.2);
            padding: 15px;
            z-index: 10000;
            display: flex;
            flex-direction: column;
            border-radius: 8px;
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #333;
            max-width: 320px;
            min-width: 150px;
            box-sizing: border-box;
        }

        .datecraft-header {
            text-align: center;
            margin-bottom: 15px;
            font-size: 1.2em;
            font-weight: bold;
            color: #007bff;
            padding-bottom: 5px;
            border-bottom: 1px solid #eee;
        }

        .datecraft-groups {
            display: flex;
            justify-content: space-around;
            margin-bottom: 15px;
            flex-wrap: nowrap;
            gap: 10px;
        }

        .datecraft-group {
            display: flex;
            flex-direction: column;
            align-items: center;
            flex: 1;
            min-width: 60px;
        }

        .datecraft-adjust-button {
            background-color: #007bff;
            color: white;
            border: none;
            padding: 6px 10px;
            border-radius: 4px;
            cursor: pointer;
            font-size: 0.9em;
            margin: 2px 0;
            width: 100%;
            box-sizing: border-box;
            transition: background-color 0.2s ease;
        }

        .datecraft-adjust-button:hover {
            background-color: #0056b3;
        }

        .datecraft-display-input {
            width: 100%;
            text-align: center;
            padding: 6px;
            margin: 5px 0;
            border: 1px solid #ddd;
            border-radius: 4px;
            font-size: 1em;
            background-color: #f8f8f8;
            cursor: default;
            box-sizing: border-box;
        }

        .datecraft-actions {
            display: flex;
            justify-content: space-around;
            margin-top: 10px;
            border-top: 1px solid #eee;
            padding-top: 10px;
            gap: 10px;
        }

        .datecraft-action-button {
            background-color: #28a745;
            color: white;
            border: none;
            padding: 8px 15px;
            border-radius: 5px;
            cursor: pointer;
            font-size: 0.9em;
            flex: 1;
            transition: background-color 0.2s ease;
        }

        .datecraft-action-button.datecraft-cancel {
            background-color: #dc3545;
        }

        .datecraft-action-button:hover {
            opacity: 0.9;
        }
    `;
    document.head.appendChild(styleElement);
})();

class CalendarDate {
    constructor(initialValue) {
        if (initialValue instanceof Date) {
            this.baseDate = new Date(initialValue.getFullYear(), initialValue.getMonth(), initialValue.getDate());
        } else if (typeof initialValue === 'string') {
            const parsed = new Date(initialValue);
            if (isNaN(parsed.getTime())) {
                this.baseDate = new Date();
            } else {
                this.baseDate = new Date(parsed.getFullYear(), parsed.getMonth(), parsed.getDate());
            }
        } else if (typeof initialValue === 'object' && initialValue !== null && initialValue.baseDate instanceof Date) {
            this.baseDate = new Date(initialValue.baseDate.getFullYear(), initialValue.baseDate.getMonth(), initialValue.baseDate.getDate());
        } else {
            this.baseDate = new Date();
            this.baseDate.setHours(0, 0, 0, 0);
        }
    }

    getYear() { return this.baseDate.getFullYear(); }
    getMonth() { return this.baseDate.getMonth(); }
    getDay() { return this.baseDate.getDate(); }
    toNativeDate() { return new Date(this.baseDate); }

    addYears(count) {
        const newDate = new Date(this.baseDate);
        newDate.setFullYear(newDate.getFullYear() + count);
        return new CalendarDate(newDate);
    }

    addMonths(count) {
        const newDate = new Date(this.baseDate);
        newDate.setMonth(newDate.getMonth() + count);
        return new CalendarDate(newDate);
    }

    addDays(count) {
        const newDate = new Date(this.baseDate);
        newDate.setDate(newDate.getDate() + count);
        return new CalendarDate(newDate);
    }

    format(pattern, localeIdentifier = 'en') {
        const year = this.getYear();
        const month = this.getMonth();
        const day = this.getDay();

        const languageData = CalendarDate.locales[localeIdentifier] || CalendarDate.locales['en'];

        let formattedString = pattern;
        formattedString = formattedString.replace(/yyyy/g, year.toString());
        formattedString = formattedString.replace(/MMMM/g, languageData.longMonths[month]);
        formattedString = formattedString.replace(/MMM/g, languageData.shortMonths[month]);
        formattedString = formattedString.replace(/MM/g, (month + 1).toString().padStart(2, '0'));
        formattedString = formattedString.replace(/dd/g, day.toString().padStart(2, '0'));
        formattedString = formattedString.replace(/d/g, day.toString());
        return formattedString;
    }

    differenceInDays(anotherCalendarDate) {
        if (!(anotherCalendarDate instanceof CalendarDate)) {
            return NaN;
        }
        const msPerDay = 24 * 60 * 60 * 1000;
        const thisMs = this.baseDate.getTime();
        const otherMs = anotherCalendarDate.baseDate.getTime();
        return Math.round((thisMs - otherMs) / msPerDay);
    }

    isBefore(other) {
        if (!(other instanceof CalendarDate)) return false;
        return this.baseDate.getTime() < other.baseDate.getTime();
    }

    isAfter(other) {
        if (!(other instanceof CalendarDate)) return false;
        return this.baseDate.getTime() > other.baseDate.getTime();
    }

    isEqual(other) {
        if (!(other instanceof CalendarDate)) return false;
        return this.baseDate.getTime() === other.baseDate.getTime();
    }

    static locales = {
        en: {
            shortMonths: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
            longMonths: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            confirmText: "Select",
            cancelText: "Dismiss",
            displayFormat: "yyyy-MM-dd",
            displayMonthFormat: "yyyy-MMM",
            displayYearFormat: "yyyy"
        }
    };
}

class DateCraft {
    constructor(inputElement, initialSettings = {}) {
        this.inputTarget = inputElement;
        this.controlPanel = null;
        this.currentSettings = {
            currentChosenDate: null,
            formatPattern: "yyyy-MM-dd",
            formatMonthPattern: "yyyy-MM",
            formatYearPattern: "yyyy",
            entryOrder: ["d", "m", "y"],
            selectedLanguage: "en",
            standardDateOutput: true,
            minLimit: null,
            maxLimit: null,
            accuracyLevel: "day",
            onConfirm: null,
        };

        this.originalChosenDate = null;

        this.initializeSettingsFromInput();
        this.configure(initialSettings);

        this.setupComponent();
    }

    initializeSettingsFromInput() {
        const inputValue = this.inputTarget.value;
        const minAttr = this.inputTarget.getAttribute("min");
        const maxAttr = this.inputTarget.getAttribute("max");

        if (inputValue) {
            this.currentSettings.currentChosenDate = new CalendarDate(inputValue);
        }
        if (minAttr) {
            this.currentSettings.minLimit = new CalendarDate(minAttr);
        }
        if (maxAttr) {
            this.currentSettings.maxLimit = new CalendarDate(maxAttr);
        }
    }

    configure(newSettings) {
        for (const key in newSettings) {
            if (newSettings.hasOwnProperty(key)) {
                if (key === 'currentChosenDate' || key === 'minLimit' || key === 'maxLimit') {
                    if (newSettings[key] !== null) {
                        this.currentSettings[key] = new CalendarDate(newSettings[key]);
                    } else {
                        this.currentSettings[key] = null;
                    }
                } else if (key === 'entryOrder' && typeof newSettings[key] === 'string') {
                    this.currentSettings.entryOrder = newSettings[key].split(' ');
                } else if (key === 'standardDateOutput') {
                    this.currentSettings.standardDateOutput = !!newSettings[key];
                } else {
                    this.currentSettings[key] = newSettings[key];
                }
            }
        }

        if (!CalendarDate.locales[this.currentSettings.selectedLanguage]) {
            this.currentSettings.selectedLanguage = "en";
        }

        if (this.currentSettings.minLimit && this.currentSettings.maxLimit &&
            this.currentSettings.minLimit.isAfter(this.currentSettings.maxLimit)) {
            [this.currentSettings.minLimit, this.currentSettings.maxLimit] =
                [this.currentSettings.maxLimit, this.currentSettings.minLimit];
        }

        if (this.currentSettings.currentChosenDate) {
            this.currentSettings.currentChosenDate = this.constrainDate(this.currentSettings.currentChosenDate);
        }
    }

    setupComponent() {
        this.inputTarget.setAttribute("readonly", "readonly");
        this.inputTarget.addEventListener("click", this.openSelector.bind(this));
        this.inputTarget.addEventListener("focus", this.openSelector.bind(this));

        if (!this.currentSettings.currentChosenDate) {
            this.currentSettings.currentChosenDate = new CalendarDate(new Date());
        }

        this.updateOutput();
        this.buildInterface();
    }

    buildInterface() {
        this.controlPanel = document.createElement("div");
        this.controlPanel.className = "datecraft-panel";
        this.controlPanel.style.display = "none";

        const headerSection = document.createElement("div");
        headerSection.className = "datecraft-header";
        const formattedDisplay = document.createElement("span");
        formattedDisplay.className = "datecraft-formatted-display";
        headerSection.appendChild(formattedDisplay);
        this.controlPanel.appendChild(headerSection);

        const groupContainer = document.createElement("div");
        groupContainer.className = "datecraft-groups";

        const partMap = {
            'd': { className: "datecraft-day", handler: this.changeDay.bind(this) },
            'm': { className: "datecraft-month", handler: this.changeMonth.bind(this) },
            'y': { className: "datecraft-year", handler: this.changeYear.bind(this) }
        };

        this.currentSettings.entryOrder.forEach(partKey => {
            const partInfo = partMap[partKey];
            if (!partInfo) return;

            const group = document.createElement("div");
            group.className = `datecraft-group ${partInfo.className}-group`;

            const decrementButton = document.createElement("button");
            decrementButton.className = "datecraft-adjust-button datecraft-decrement";
            decrementButton.textContent = "-";
            decrementButton.addEventListener("click", () => partInfo.handler(-1));
            group.appendChild(decrementButton);

            const displayInput = document.createElement("input");
            displayInput.type = "text";
            displayInput.setAttribute("readonly", "readonly");
            displayInput.className = "datecraft-display-input " + partInfo.className;
            group.appendChild(displayInput);

            const incrementButton = document.createElement("button");
            incrementButton.className = "datecraft-adjust-button datecraft-increment";
            incrementButton.textContent = "+";
            incrementButton.addEventListener("click", () => partInfo.handler(1));
            group.appendChild(incrementButton);

            groupContainer.appendChild(group);
        });
        this.controlPanel.appendChild(groupContainer);

        const actionButtonsSection = document.createElement("div");
        actionButtonsSection.className = "datecraft-actions";

        const confirmButton = document.createElement("button");
        confirmButton.className = "datecraft-action-button datecraft-confirm";
        confirmButton.addEventListener("click", this.commitSelection.bind(this));
        actionButtonsSection.appendChild(confirmButton);

        const cancelButton = document.createElement("button");
        cancelButton.className = "datecraft-action-button datecraft-cancel";
        cancelButton.addEventListener("click", this.discardSelection.bind(this));
        actionButtonsSection.appendChild(cancelButton);

        this.controlPanel.appendChild(actionButtonsSection);
        document.body.appendChild(this.controlPanel);

        document.addEventListener("keydown", this.handleEscapeKey.bind(this));
    }

    updateInterface() {
        if (!this.currentSettings.currentChosenDate) {
            return;
        }

        const currentLocaleData = CalendarDate.locales[this.currentSettings.selectedLanguage] || CalendarDate.locales['en'];
        const displayDate = this.currentSettings.currentChosenDate;

        let headerFormat = currentLocaleData.displayFormat;
        if (this.currentSettings.accuracyLevel === "month") {
            headerFormat = currentLocaleData.displayMonthFormat;
        } else if (this.currentSettings.accuracyLevel === "year") {
            headerFormat = currentLocaleData.displayYearFormat;
        }
        this.controlPanel.querySelector(".datecraft-formatted-display").textContent =
            displayDate.format(headerFormat, this.currentSettings.selectedLanguage);

        const dayInput = this.controlPanel.querySelector(".datecraft-day");
        if (dayInput) dayInput.value = displayDate.format("dd");
        const monthInput = this.controlPanel.querySelector(".datecraft-month");
        if (monthInput) monthInput.value = displayDate.format("MMM", this.currentSettings.selectedLanguage);
        const yearInput = this.controlPanel.querySelector(".datecraft-year");
        if (yearInput) yearInput.value = displayDate.format("yyyy");

        this.controlPanel.querySelector(".datecraft-confirm").textContent = currentLocaleData.confirmText;
        this.controlPanel.querySelector(".datecraft-cancel").textContent = currentLocaleData.cancelText;

        const groups = this.controlPanel.querySelectorAll(".datecraft-group");
        groups.forEach(group => group.style.display = 'flex');
        this.controlPanel.style.maxWidth = '320px';

        if (this.currentSettings.accuracyLevel === "month") {
            const dayGroup = this.controlPanel.querySelector(".datecraft-day-group");
            if (dayGroup) dayGroup.style.display = 'none';
            this.controlPanel.style.maxWidth = '220px';
        } else if (this.currentSettings.accuracyLevel === "year") {
            const dayGroup = this.controlPanel.querySelector(".datecraft-day-group");
            const monthGroup = this.controlPanel.querySelector(".datecraft-month-group");
            if (dayGroup) dayGroup.style.display = 'none';
            if (monthGroup) monthGroup.style.display = 'none';
            this.controlPanel.style.maxWidth = '150px';
        }

        const visibleGroups = Array.from(groups).filter(group => group.style.display !== 'none');
        if (visibleGroups.length > 0) {
            const groupWidth = (100 / visibleGroups.length) - 2;
            visibleGroups.forEach(group => group.style.width = `${groupWidth}%`);
        }
    }

    openSelector(event) {
        event.stopPropagation();
        event.preventDefault();

        this.originalChosenDate = new CalendarDate(this.currentSettings.currentChosenDate || new Date());
        this.currentSettings.currentChosenDate = this.constrainDate(new CalendarDate(this.originalChosenDate));

        this.controlPanel.style.display = "flex";
        this.controlPanel.focus();

        this.updateInterface();
    }

    closeSelector() {
        this.controlPanel.style.display = "none";
        this.inputTarget.focus();
    }

    handleEscapeKey(event) {
        if (event.key === "Escape" && this.controlPanel.style.display !== "none") {
            this.discardSelection();
        }
    }

    changeDay(step) {
        this.currentSettings.currentChosenDate = this.constrainDate(this.currentSettings.currentChosenDate.addDays(step));
        this.updateInterface();
    }

    changeMonth(step) {
        this.currentSettings.currentChosenDate = this.constrainDate(this.currentSettings.currentChosenDate.addMonths(step));
        this.updateInterface();
    }

    changeYear(step) {
        this.currentSettings.currentChosenDate = this.constrainDate(this.currentSettings.currentChosenDate.addYears(step));
        this.updateInterface();
    }

    constrainDate(potentialDate) {
        if (!(potentialDate instanceof CalendarDate)) return null;

        if (this.currentSettings.maxLimit && potentialDate.isAfter(this.currentSettings.maxLimit)) {
            return new CalendarDate(this.currentSettings.maxLimit);
        }
        if (this.currentSettings.minLimit && potentialDate.isBefore(this.currentSettings.minLimit)) {
            return new CalendarDate(this.currentSettings.minLimit);
        }
        return new CalendarDate(potentialDate);
    }

    commitSelection() {
        const dateChanged = !this.currentSettings.currentChosenDate.isEqual(this.originalChosenDate);
        let proceed = true;

        if (typeof this.currentSettings.onConfirm === "function") {
            proceed = this.currentSettings.onConfirm.call(null, this.currentSettings.currentChosenDate.toNativeDate()) !== false;
        }

        if (proceed && dateChanged) {
            this.updateOutput();
            this.inputTarget.dispatchEvent(new Event("change", { bubbles: true }));
        } else {
            this.currentSettings.currentChosenDate = new CalendarDate(this.originalChosenDate);
        }
        this.closeSelector();
    }

    discardSelection() {
        this.currentSettings.currentChosenDate = new CalendarDate(this.originalChosenDate);
        this.closeSelector();
    }

    updateOutput() {
        const localeData = CalendarDate.locales[this.currentSettings.selectedLanguage];
        let outputFormat = this.currentSettings.formatPattern;

        if (this.currentSettings.accuracyLevel === "month") {
            outputFormat = this.currentSettings.formatMonthPattern;
        } else if (this.currentSettings.accuracyLevel === "year") {
            outputFormat = this.currentSettings.formatYearPattern;
        }

        this.inputTarget.value = this.currentSettings.standardDateOutput ?
            this.currentSettings.currentChosenDate.format(outputFormat) :
            this.currentSettings.currentChosenDate.format(localeData.displayFormat, this.currentSettings.selectedLanguage);
    }

    destroy() {
        this.inputTarget.removeEventListener("click", this.openSelector.bind(this));
        this.inputTarget.removeEventListener("focus", this.openSelector.bind(this));
        document.removeEventListener("keydown", this.handleEscapeKey.bind(this));
        if (this.controlPanel && this.controlPanel.parentNode) {
            this.controlPanel.parentNode.removeChild(this.controlPanel);
        }
        this.inputTarget.removeAttribute("readonly");
    }
}