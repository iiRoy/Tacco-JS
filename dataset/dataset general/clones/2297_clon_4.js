const GLOBAL_CAL_CONSTANTS = {
    DAY_MILLISECONDS: 24 * 60 * 60 * 1000,
    WEEKDAY_NAMES: ["S", "M", "T", "W", "T", "F", "S"],
    INITIAL_WEEK_DAY: 0,
    MONTH_FULL_NAMES: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
    EMPTY_VALUE: null,
    LOCALIZED_TEXTS: {
        "Okay": "OK",
        "Present": "Now",
        "TodayMark": "Today",
        "ClearField": "Clear"
    }
};

const UtilityHelpers = {
    formatTwoDigits: function(num) {
        return num < 10 ? "0" + num : "" + num;
    },

    getStartOfDay: function(dateObj) {
        return new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate());
    },

    calculateDayDifference: function(dateA, dateB) {
        const startA = UtilityHelpers.getStartOfDay(dateA).getTime();
        const startB = UtilityHelpers.getStartOfDay(dateB).getTime();
        return Math.round((startB - startA) / GLOBAL_CAL_CONSTANTS.DAY_MILLISECONDS);
    },

    getHour12Format: function(dateObj) {
        let h = dateObj.getHours();
        return (h === 0) ? 12 : (h > 12 ? h - 12 : h);
    },

    getAmPmDesignator: function(dateObj) {
        return (dateObj.getHours() < 12) ? "AM" : "PM";
    },

    getPaddedMinuteValue: function(dateObj) {
        return UtilityHelpers.formatTwoDigits(dateObj.getMinutes());
    },

    formatDateToString: function(dateObj, includeTime) {
        let outputStr = GLOBAL_CAL_CONSTANTS.MONTH_FULL_NAMES[dateObj.getMonth()] + " " + dateObj.getDate() + ", " + dateObj.getFullYear();
        if (includeTime) {
            outputStr += " " + UtilityHelpers.getHour12Format(dateObj) + ":" + UtilityHelpers.getPaddedMinuteValue(dateObj) + " " + UtilityHelpers.getAmPmDesignator(dateObj);
        }
        return outputStr;
    },

    parseStringToDate: function(dateString) {
        return new Date(dateString);
    },

    snapToInterval: function(number, interval) {
        return Math.floor(number / interval) * interval;
    },

    getViewportHeight: function() {
        return window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight || 0;
    },

    getScrollPositionTop: function() {
        return window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;
    },

    clearChildren: function(element) {
        while (element.firstChild) {
            element.removeChild(element.firstChild);
        }
    },

    createAndAppendElement: function(parent, type, attributes = {}, styles = {}) {
        const newElement = document.createElement(type);
        for (const key in attributes) {
            if (Object.prototype.hasOwnProperty.call(attributes, key)) {
                if (key === 'className') {
                    newElement.className = attributes[key];
                } else if (key === 'innerHTML') {
                    newElement.innerHTML = attributes[key];
                } else if (key === 'onclick' && typeof attributes[key] === 'function') {
                    newElement.addEventListener('click', attributes[key]);
                } else if (key === 'dataset' && typeof attributes[key] === 'object') {
                    Object.assign(newElement.dataset, attributes[key]);
                } else {
                    newElement[key] = attributes[key];
                }
            }
        }
        for (const styleKey in styles) {
            if (Object.prototype.hasOwnProperty.call(styles, styleKey)) {
                newElement.style[styleKey] = styles[styleKey];
            }
        }
        if (parent) {
            parent.appendChild(newElement);
        }
        return newElement;
    },

    getDomElement: function(idOrElement) {
        if (typeof idOrElement === 'string') {
            return document.getElementById(idOrElement);
        }
        return idOrElement;
    },

    getElementValue: function(element) {
        const el = UtilityHelpers.getDomElement(element);
        return el ? el.value : '';
    },

    addEvent: function(target, eventType, handler, useCapture = false) {
        target.addEventListener(eventType, handler, useCapture);
    },

    removeEvent: function(target, eventType, handler, useCapture = false) {
        target.removeEventListener(eventType, handler, useCapture);
    },

    bindEventHandler: function(func, context) {
        return func.bind(context);
    },

    getElementMetrics: function(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            height: rect.height,
            width: rect.width
        };
    },

    isDescendantOf: function(child, parent) {
        let node = child.parentNode;
        while (node !== null) {
            if (node === parent) {
                return true;
            }
            node = node.parentNode;
        }
        return false;
    },

    createRange: function(start, end) {
        const arr = [];
        for (let i = start; i <= end; i++) {
            arr.push(i);
        }
        return arr;
    }
};

class DropdownControl {
    constructor(parentContainer, optionValues, elementAttributes = {}, styleSettings = {}) {
        this.elementReference = UtilityHelpers.createAndAppendElement(parentContainer, "select", elementAttributes, styleSettings);
        this.populateOptions(optionValues);
    }

    populateOptions(valuesArray) {
        UtilityHelpers.clearChildren(this.elementReference);
        valuesArray.forEach(pair => {
            if (typeof(pair) !== "object" || !Array.isArray(pair)) {
                pair = [pair, pair];
            }
            UtilityHelpers.createAndAppendElement(this.elementReference, "option", { value: pair[1], innerHTML: pair[0] });
        });
    }

    setSelectionValue(valueToMatch) {
        const dropdown = this.elementReference;
        let foundMatch = false;
        for (let i = 0; i < dropdown.options.length; i++) {
            if (dropdown.options[i].value === String(valueToMatch)) {
                dropdown.selectedIndex = i;
                foundMatch = true;
                break;
            }
        }
        return foundMatch;
    }

    getSelectionValue() {
        return UtilityHelpers.getElementValue(this.elementReference);
    }
}

class DateInputWidget {
    constructor(inputElementId, customOptions) {
        this.inputElement = UtilityHelpers.getDomElement(inputElementId);
        if (!this.inputElement) {
            console.error("Target input " + inputElementId + " not found!");
            return;
        }
        if (this.inputElement.tagName !== "INPUT") {
            this.inputElement = this.inputElement.querySelector("INPUT");
            if (!this.inputElement) {
                console.error("No INPUT element found within " + inputElementId);
                return;
            }
        }
        
        this.inputElement.datePickerInstance = this;
        this.lastInteractionTime = 0;

        this.configuration = Object.assign({
            embeddedMode: false,
            popupMode: GLOBAL_CAL_CONSTANTS.EMPTY_VALUE,
            showTimeControls: false,
            displayButtons: true,
            enableClearButton: true,
            yearRangeSize: 10,
            closeOnSelection: GLOBAL_CAL_CONSTANTS.EMPTY_VALUE,
            minuteStepInterval: 5,
            popupAnchor: this.inputElement,
            monthYearDisplay: "dropdowns",
            onValueChange: (inputRef) => {
                return () => {
                    const event = new Event('change', { bubbles: true, cancelable: true });
                    inputRef.dispatchEvent(event);
                };
            },
            isValidDateCheck: GLOBAL_CAL_CONSTANTS.EMPTY_VALUE
        }, customOptions || {});

        this.usingTime = this.configuration.showTimeControls;
        this.processInputDate();
        this.triggerCallback("before_show");

        this.setupCalendarStructure();
        if (!this.configuration.embeddedMode) {
            this.positionCalendarWidget();
            UtilityHelpers.addEvent(document, "mousedown", this.handleOutsideClick = UtilityHelpers.bindEventHandler(this.closeIfClickedOutside, this));
            UtilityHelpers.addEvent(document, "keydown", this.handleKeyPress = UtilityHelpers.bindEventHandler(this.processKeyPress, this));
        }
        this.triggerCallback("after_show");
    }

    positionCalendarWidget() {
        let positionAbove = false;
        const mainMetrics = UtilityHelpers.getElementMetrics(this.mainContainer);
        const scrollY = UtilityHelpers.getScrollPositionTop();
        const viewportHeight = UtilityHelpers.getViewportHeight();

        const anchorElement = UtilityHelpers.getDomElement(this.configuration.popupAnchor);
        const anchorMetrics = UtilityHelpers.getElementMetrics(anchorElement);
        const anchorBottom = anchorMetrics.top + anchorMetrics.height;

        if (((anchorBottom + mainMetrics.height) > (scrollY + viewportHeight)) && (anchorBottom - mainMetrics.height > scrollY)) {
            positionAbove = true;
        }

        const leftCoord = anchorMetrics.left;
        const topCoord = (positionAbove ? (anchorMetrics.top - mainMetrics.height) : (anchorMetrics.top + anchorMetrics.height));

        this.mainContainer.style.left = leftCoord + "px";
        this.mainContainer.style.top = topCoord + "px";
        this.mainContainer.style.visibility = "";

        if (navigator.appName === "Microsoft Internet Explorer") {
            this.iframeBlocker = UtilityHelpers.createAndAppendElement(document.body, "iframe", {
                src: "javascript:false",
                className: "ie6-shim-frame"
            }, {
                left: leftCoord + "px",
                top: topCoord + "px",
                height: mainMetrics.height + "px",
                width: mainMetrics.width + "px",
                border: "0px",
                position: "absolute",
                zIndex: "-1"
            });
        }
    }

    setupCalendarStructure() {
        let parentForContainer;
        let containerStyles = {};
        if (this.configuration.embeddedMode) {
            parentForContainer = this.inputElement.parentNode;
            containerStyles = {};
        } else {
            parentForContainer = document.body;
            containerStyles = { position: "absolute", visibility: "hidden", left: "0", top: "0" };
        }
        this.mainContainer = UtilityHelpers.createAndAppendElement(parentForContainer, 'div', { className: "date-picker-widget" }, containerStyles);

        const sectionNames = ["wrapper-top", "header-section", "body-content", "action-buttons", "status-footer", "wrapper-bottom"];
        sectionNames.forEach(name => {
            const propName = name.replace(/-/g, '');
            this[propName] = UtilityHelpers.createAndAppendElement(this.mainContainer, 'div', { className: `widget-${name}` }, { clear: 'left' });
        });

        this.initializeHeaderPanel();
        this.initializeActionButtons();
        this.initializeCalendarGrid();
        this.updateStatusFooter("&#160;");

        this.refreshCalendarView();
        this.setUseTimeControls(this.usingTime);
    }

    initializeHeaderPanel() {
        const headerPanel = this.headersection;
        this.closeWidgetButton = UtilityHelpers.createAndAppendElement(headerPanel, "a", {
            innerHTML: "x",
            href: "#",
            onclick: UtilityHelpers.bindEventHandler(function(event) {
                event.preventDefault();
                this.closeWidget();
            }, this),
            className: "close-control"
        });
        this.nextMonthButton = UtilityHelpers.createAndAppendElement(headerPanel, "a", {
            innerHTML: "&gt;",
            href: "#",
            onclick: UtilityHelpers.bindEventHandler(function(event) {
                event.preventDefault();
                this.navigateMonth(this.currentDisplayDate.getMonth() + 1);
            }, this),
            className: "next-month"
        });
        this.prevMonthButton = UtilityHelpers.createAndAppendElement(headerPanel, "a", {
            innerHTML: "&lt;",
            href: "#",
            onclick: UtilityHelpers.bindEventHandler(function(event) {
                event.preventDefault();
                this.navigateMonth(this.currentDisplayDate.getMonth() - 1);
            }, this),
            className: "prev-month"
        });

        if (this.configuration.monthYearDisplay === "dropdowns") {
            this.monthDropdown = new DropdownControl(headerPanel,
                UtilityHelpers.createRange(0, 11).map(m => [GLOBAL_CAL_CONSTANTS.MONTH_FULL_NAMES[m], m]),
                {
                    className: "month-selector",
                    onchange: UtilityHelpers.bindEventHandler(function() {
                        this.navigateMonth(this.monthDropdown.getSelectionValue());
                    }, this)
                }
            );
            this.yearDropdown = new DropdownControl(headerPanel, [], {
                className: "year-selector",
                onchange: UtilityHelpers.bindEventHandler(function() {
                    this.navigateYear(this.yearDropdown.getSelectionValue());
                }, this)
            });
            this.populateYearDropdownRange();
        } else {
            this.monthYearDisplayLabel = UtilityHelpers.createAndAppendElement(headerPanel, "span", { className: "month-year-label" });
        }
    }

    initializeCalendarGrid() {
        const bodyContent = this.bodycontent;
        this.dayGridCells = [];
        const daysTable = UtilityHelpers.createAndAppendElement(bodyContent, "table", { cellPadding: "0px", cellSpacing: "0px", width: "100%" });

        const weekdaysHead = UtilityHelpers.createAndAppendElement(daysTable, "thead");
        const weekdaysRow = UtilityHelpers.createAndAppendElement(weekdaysHead, "tr");
        GLOBAL_CAL_CONSTANTS.WEEKDAY_NAMES.forEach(weekdayName => {
            UtilityHelpers.createAndAppendElement(weekdaysRow, "th", { innerHTML: weekdayName });
        });

        const daysBody = UtilityHelpers.createAndAppendElement(daysTable, "tbody");
        let currentRow;
        for (let cellIndex = 0; cellIndex < 42; cellIndex++) {
            const currentWeekday = (cellIndex + GLOBAL_CAL_CONSTANTS.INITIAL_WEEK_DAY) % 7;
            if (cellIndex % 7 === 0) {
                currentRow = UtilityHelpers.createAndAppendElement(daysBody, "tr", { className: `row-${Math.floor(cellIndex / 7)}` });
            }
            const dayCell = UtilityHelpers.createAndAppendElement(currentRow, "td", {
                className: (currentWeekday === 0 || currentWeekday === 6) ? "weekend-day" : "",
                dataset: { cellIndex: cellIndex }
            }, { cursor: "pointer" });
            UtilityHelpers.addEvent(dayCell, "mouseover", UtilityHelpers.bindEventHandler(this.handleDayHover, this));
            UtilityHelpers.addEvent(dayCell, "mouseout", UtilityHelpers.bindEventHandler(this.handleDayHoverOut, this));
            UtilityHelpers.addEvent(dayCell, "click", UtilityHelpers.bindEventHandler(function(event) {
                this.updateSelectedMoment(event.currentTarget.dataset, true);
            }, this));
            UtilityHelpers.createAndAppendElement(dayCell, "div");
            this.dayGridCells[cellIndex] = dayCell;
        }
    }

    initializeActionButtons() {
        const buttonsPanel = this.actionbuttons;

        if (this.configuration.showTimeControls) {
            const emptyTimeOption = (this.configuration.showTimeControls === "mixed" ? [
                [" - ", ""]
            ] : []);
            UtilityHelpers.createAndAppendElement(buttonsPanel, "span", { innerHTML: "@", className: "time-separator-at" });

            const tempDate = new Date();
            this.hourDropdown = new DropdownControl(buttonsPanel,
                emptyTimeOption.concat(UtilityHelpers.createRange(0, 23).map(h => {
                    tempDate.setHours(h);
                    return [UtilityHelpers.getHour12Format(tempDate) + " " + UtilityHelpers.getAmPmDesignator(tempDate), h];
                })), {
                    className: "hour-selector",
                    onchange: UtilityHelpers.bindEventHandler(function() {
                        this.updateSelectedMoment({ hour: this.hourDropdown.getSelectionValue() });
                    }, this)
                }
            );
            UtilityHelpers.createAndAppendElement(buttonsPanel, "span", { innerHTML: ":", className: "time-separator-colon" });

            this.minuteDropdown = new DropdownControl(buttonsPanel,
                emptyTimeOption.concat(UtilityHelpers.createRange(0, 59).filter(m => (m % this.configuration.minuteStepInterval === 0)).map(m => {
                    return [UtilityHelpers.formatTwoDigits(m), m];
                })), {
                    className: "minute-selector",
                    onchange: UtilityHelpers.bindEventHandler(function() {
                        this.updateSelectedMoment({ minute: this.minuteDropdown.getSelectionValue() });
                    }, this)
                }
            );
        } else if (!this.configuration.displayButtons) {
            buttonsPanel.remove();
            return;
        }

        if (this.configuration.displayButtons) {
            UtilityHelpers.createAndAppendElement(buttonsPanel, "span", { innerHTML: "&#160;" });

            if (this.configuration.showTimeControls === "mixed" || !this.configuration.showTimeControls) {
                UtilityHelpers.createAndAppendElement(buttonsPanel, "a", {
                    innerHTML: GLOBAL_CAL_CONSTANTS.LOCALIZED_TEXTS["TodayMark"],
                    href: "#",
                    onclick: UtilityHelpers.bindEventHandler(function(event) {
                        event.preventDefault();
                        this.selectToday(false);
                    }, this)
                });
            }

            if (this.configuration.showTimeControls === "mixed") {
                UtilityHelpers.createAndAppendElement(buttonsPanel, "span", { innerHTML: "&#160;|&#160;", className: "button-separator" });
            }

            if (this.configuration.showTimeControls) {
                UtilityHelpers.createAndAppendElement(buttonsPanel, "a", {
                    innerHTML: GLOBAL_CAL_CONSTANTS.LOCALIZED_TEXTS["Present"],
                    href: "#",
                    onclick: UtilityHelpers.bindEventHandler(function(event) {
                        event.preventDefault();
                        this.selectToday(true);
                    }, this)
                });
            }

            if (!this.configuration.embeddedMode && !this.shouldCloseOnClick()) {
                UtilityHelpers.createAndAppendElement(buttonsPanel, "span", { innerHTML: "&#160;|&#160;", className: "button-separator" });
                UtilityHelpers.createAndAppendElement(buttonsPanel, "a", {
                    innerHTML: GLOBAL_CAL_CONSTANTS.LOCALIZED_TEXTS["Okay"],
                    href: "#",
                    onclick: UtilityHelpers.bindEventHandler(function(event) {
                        event.preventDefault();
                        this.closeWidget();
                    }, this)
                });
            }
            if (this.configuration.enableClearButton) {
                UtilityHelpers.createAndAppendElement(buttonsPanel, "span", { innerHTML: "&#160;|&#160;", className: "button-separator" });
                UtilityHelpers.createAndAppendElement(buttonsPanel, "a", {
                    innerHTML: GLOBAL_CAL_CONSTANTS.LOCALIZED_TEXTS["ClearField"],
                    href: "#",
                    onclick: UtilityHelpers.bindEventHandler(function(event) {
                        event.preventDefault();
                        this.clearSelectedDate();
                        if (!this.configuration.embeddedMode) this.closeWidget();
                    }, this)
                });
            }
        }
    }

    refreshCalendarView() {
        this.updateMonthYearDisplay();
        this.updateCalendarGrid();
        this.applySelectedClass();
        this.updateStatusFooter();
    }

    updateCalendarGrid() {
        this.firstDayOfView = UtilityHelpers.getStartOfDay(new Date(this.currentDisplayDate));
        this.firstDayOfView.setDate(1);
        this.firstDayOfView.setHours(12);

        let daysBeforeMonth = this.firstDayOfView.getDay();
        if (daysBeforeMonth < 3) daysBeforeMonth += 7;

        this.firstDayOfView.setDate(1 - daysBeforeMonth + GLOBAL_CAL_CONSTANTS.INITIAL_WEEK_DAY);

        const dayIterator = new Date(this.firstDayOfView);
        const todayMoment = UtilityHelpers.getStartOfDay(new Date());
        const currentMonthIndex = this.currentDisplayDate.getMonth();
        const validateDateFunc = this.configuration.isValidDateCheck;

        for (let i = 0; i < 42; i++) {
            const dayNum = dayIterator.getDate();
            const monthNum = dayIterator.getMonth();
            const cellElement = this.dayGridCells[i];
            const innerDiv = cellElement.firstElementChild;

            innerDiv.innerHTML = dayNum;

            if (monthNum !== currentMonthIndex) {
                innerDiv.classList.add("other-month-day");
            } else {
                innerDiv.classList.remove("other-month-day");
            }

            cellElement.dataset.day = dayNum;
            cellElement.dataset.month = monthNum;
            cellElement.dataset.year = dayIterator.getFullYear();

            if (validateDateFunc) {
                if (validateDateFunc(UtilityHelpers.getStartOfDay(dayIterator))) {
                    cellElement.classList.remove("disabled-day");
                } else {
                    cellElement.classList.add("disabled-day");
                }
            }

            dayIterator.setDate(dayNum + 1);
        }

        if (this.highlightedTodayCell) {
            this.highlightedTodayCell.classList.remove("current-day");
        }

        const daysUntilToday = UtilityHelpers.calculateDayDifference(this.firstDayOfView, todayMoment);
        if (daysUntilToday >= 0 && daysUntilToday < 42) {
            this.highlightedTodayCell = this.dayGridCells[daysUntilToday];
            this.highlightedTodayCell.classList.add("current-day");
        }
    }

    updateMonthYearDisplay() {
        const month = this.currentDisplayDate.getMonth();
        const year = this.currentDisplayDate.getFullYear();

        if (this.configuration.monthYearDisplay === "dropdowns") {
            this.monthDropdown.setSelectionValue(month, false);

            const yearDropdownElement = this.yearDropdown.elementReference;
            if (this.isYearRangeFlexible() && (!(this.yearDropdown.setSelectionValue(year, false)) || yearDropdownElement.selectedIndex <= 1 || yearDropdownElement.selectedIndex >= yearDropdownElement.options.length - 2)) {
                this.populateYearDropdownRange();
            }
            this.yearDropdown.setSelectionValue(year);
        } else {
            this.monthYearDisplayLabel.textContent = GLOBAL_CAL_CONSTANTS.MONTH_FULL_NAMES[month] + " " + year;
        }
    }

    populateYearDropdownRange() {
        this.yearDropdown.populateOptions(this.getYearRange().map(y => [y, y]));
    }

    getYearRange() {
        if (!this.isYearRangeFlexible()) {
            const rangeArr = this.configuration.yearRangeSize;
            return UtilityHelpers.createRange(rangeArr[0], rangeArr[1]);
        }
        const currentYear = this.currentDisplayDate.getFullYear();
        const range = this.configuration.yearRangeSize;
        return UtilityHelpers.createRange(currentYear - range, currentYear + range);
    }

    isYearRangeFlexible() {
        return (typeof(this.configuration.yearRangeSize) === "number");
    }

    isValidYear(year) {
        if (this.isYearRangeFlexible()) {
            return true;
        } else {
            const yearRange = this.getYearRange();
            return year >= yearRange[0] && year <= yearRange[yearRange.length - 1];
        }
    }

    handleDayHover(event) {
        const cellData = event.currentTarget.dataset;
        const hoverDate = new Date(this.chosenMoment);
        hoverDate.setFullYear(Number(cellData.year), Number(cellData.month), Number(cellData.day));
        this.updateStatusFooter(UtilityHelpers.formatDateToString(hoverDate, this.usingTime));
    }

    handleDayHoverOut() {
        this.updateStatusFooter();
    }

    clearPreviouslySelectedClass() {
        if (this.selectedGridCell) {
            this.selectedGridCell.classList.remove("selected-day");
        }
    }

    applySelectedClass() {
        if (!this.selectionMade) return;
        this.clearPreviouslySelectedClass();

        const daysUntilSelected = UtilityHelpers.calculateDayDifference(this.firstDayOfView, UtilityHelpers.getStartOfDay(this.chosenMoment));
        if (daysUntilSelected >= 0 && daysUntilSelected < 42) {
            this.selectedGridCell = this.dayGridCells[daysUntilSelected];
            this.selectedGridCell.classList.add("selected-day");
        }
    }

    reprocessDateAndRefresh() {
        this.processInputDate();
        this.refreshCalendarView();
    }

    getFormattedDateString() {
        return (this.selectionMade) ? UtilityHelpers.formatDateToString(this.chosenMoment, this.usingTime) : "&#160;";
    }

    processInputDate() {
        const inputValue = UtilityHelpers.getElementValue(this.inputElement).trim();
        const defaultTimeOption = this.configuration.defaultTime;

        this.selectionMade = (inputValue !== "" || defaultTimeOption);
        this.currentDisplayDate = isNaN(new Date(inputValue)) ? undefined : UtilityHelpers.parseStringToDate(this.configuration.date || inputValue);

        if (isNaN(this.currentDisplayDate) && !defaultTimeOption) {
            this.currentDisplayDate = new Date();
        } else if (isNaN(this.currentDisplayDate) && defaultTimeOption) {
            this.currentDisplayDate = (typeof defaultTimeOption === 'function') ? defaultTimeOption() : defaultTimeOption;
        }

        if (!this.isValidYear(this.currentDisplayDate.getFullYear())) {
            const yearRange = this.getYearRange();
            const newYear = (this.currentDisplayDate.getFullYear() < yearRange[0]) ? yearRange[0] : yearRange[yearRange.length - 1];
            this.currentDisplayDate.setFullYear(newYear);
        }
        this.chosenMoment = new Date(this.currentDisplayDate);

        this.usingTime = /[0-9]:[0-9]{2}/.test(inputValue) ? true : false;
        this.currentDisplayDate.setDate(1);
    }

    updateStatusFooter(displayText) {
        if (!displayText) displayText = this.getFormattedDateString();
        UtilityHelpers.clearChildren(this.statusfooter);
        UtilityHelpers.createAndAppendElement(this.statusfooter, "span", { innerHTML: displayText });
    }

    clearSelectedDate() {
        if ((this.inputElement.disabled || this.inputElement.readOnly) && this.configuration.popupMode !== "force") {
            return false;
        }
        const previousValue = this.inputElement.value;
        this.inputElement.value = "";
        this.clearPreviouslySelectedClass();
        this.updateStatusFooter('&#160;');
        if (previousValue !== this.inputElement.value) {
            this.triggerCallback("onValueChange");
        }
    }

    updateSelectedMoment(partsOrElementData, isClickInteraction) {
        const updateParts = partsOrElementData;

        if ((this.inputElement.disabled || this.inputElement.readOnly) && this.configuration.popupMode !== "force") {
            return false;
        }

        if (updateParts.day !== undefined) {
            const tempSelectedDate = new Date(this.chosenMoment);
            tempSelectedDate.setFullYear(Number(updateParts.year), Number(updateParts.month), Number(updateParts.day));

            const validateDateFunc = this.configuration.isValidDateCheck;
            if (validateDateFunc && !validateDateFunc(UtilityHelpers.getStartOfDay(tempSelectedDate))) {
                return false;
            }
            this.chosenMoment = tempSelectedDate;
            this.selectionMade = true;
        }

        if (updateParts.hour !== undefined && updateParts.hour !== "") {
            this.chosenMoment.setHours(Number(updateParts.hour));
        }
        if (updateParts.minute !== undefined && updateParts.minute !== "") {
            this.chosenMoment.setMinutes(UtilityHelpers.snapToInterval(Number(updateParts.minute), this.configuration.minuteStepInterval));
        }

        if (updateParts.hour === "" || updateParts.minute === "") {
            this.setUseTimeControls(false);
        } else if (updateParts.hour !== undefined || updateParts.minute !== undefined) {
            this.setUseTimeControls(true);
        }

        this.updateStatusFooter();
        this.applySelectedClass();

        if (this.selectionMade) {
            this.updateInputValue();
        }

        if (this.shouldCloseOnClick()) {
            this.closeWidget();
        }
        if (isClickInteraction && !this.configuration.embeddedMode) {
            if ((new Date().getTime() - this.lastInteractionTime) < 333) {
                this.closeWidget();
            }
            this.lastInteractionTime = new Date().getTime();
        }
    }

    shouldCloseOnClick() {
        if (this.configuration.embeddedMode) return false;
        if (this.configuration.closeOnSelection === GLOBAL_CAL_CONSTANTS.EMPTY_VALUE) {
            return !this.configuration.showTimeControls;
        } else {
            return this.configuration.closeOnSelection;
        }
    }

    navigateMonth(monthIndex) {
        const targetDate = new Date(this.currentDisplayDate);
        targetDate.setMonth(monthIndex);
        return this.navigateToDate(targetDate);
    }

    navigateYear(yearValue) {
        const targetDate = new Date(this.currentDisplayDate);
        targetDate.setFullYear(yearValue);
        return this.navigateToDate(targetDate);
    }

    navigateToDate(dateObject) {
        if (!this.isValidYear(dateObject.getFullYear())) return false;
        this.currentDisplayDate = dateObject;
        this.currentDisplayDate.setDate(1);
        this.refreshCalendarView();
        this.triggerCallback("after_navigate", this.currentDisplayDate);
        return true;
    }

    setUseTimeControls(enableTime) {
        this.usingTime = this.configuration.showTimeControls && (this.configuration.showTimeControls === "mixed" ? enableTime : true);

        if (this.usingTime && this.chosenMoment) {
            const minuteVal = UtilityHelpers.snapToInterval(this.chosenMoment.getMinutes(), this.configuration.minuteStepInterval);
            const hourVal = this.chosenMoment.getHours();

            this.hourDropdown.setSelectionValue(hourVal);
            this.minuteDropdown.setSelectionValue(minuteVal);
        } else if (this.configuration.showTimeControls === "mixed") {
            this.hourDropdown.setSelectionValue("");
            this.minuteDropdown.setSelectionValue("");
        }
    }

    updateInputValue() {
        const previousValue = this.inputElement.value;
        this.inputElement.value = this.getFormattedDateString();
        if (previousValue !== this.inputElement.value) {
            this.triggerCallback("onValueChange");
        }
    }

    selectToday(includeCurrentTime) {
        const now = new Date();
        this.currentDisplayDate = new Date(now);
        const selectedParts = {
            day: now.getDate(),
            month: now.getMonth(),
            year: now.getFullYear(),
            hour: now.getHours(),
            minute: now.getMinutes()
        };
        if (!includeCurrentTime) {
            selectedParts.hour = "";
            selectedParts.minute = "";
        }
        this.updateSelectedMoment(selectedParts, true);
        this.refreshCalendarView();
    }

    closeWidget() {
        if (this.isClosed) return false;
        this.triggerCallback("before_close");
        this.inputElement.datePickerInstance = GLOBAL_CAL_CONSTANTS.EMPTY_VALUE;
        UtilityHelpers.removeEvent(document, "mousedown", this.handleOutsideClick);
        UtilityHelpers.removeEvent(document, "keydown", this.handleKeyPress);
        this.mainContainer.remove();
        this.isClosed = true;
        if (this.iframeBlocker) this.iframeBlocker.remove();
        if (this.inputElement.type !== "hidden" && !this.inputElement.disabled) {
            this.inputElement.focus();
        }
        this.triggerCallback("after_close");
    }

    closeIfClickedOutside(event) {
        if (!UtilityHelpers.isDescendantOf(event.target, this.mainContainer) && event.target !== this.inputElement) {
            this.closeWidget();
        }
    }

    processKeyPress(event) {
        if (event.key === "Escape" || event.keyCode === 27) {
            this.closeWidget();
        }
    }

    triggerCallback(callbackName, parameter) {
        const callbackFunc = this.configuration[callbackName];
        if (callbackFunc) {
            callbackFunc.bind(this.inputElement)(parameter);
        }
    }
}

window.initDatePicker = function(elementId, options) {
    return new DateInputWidget(elementId, options);
};