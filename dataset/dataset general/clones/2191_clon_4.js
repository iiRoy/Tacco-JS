const applicationSettings = {
    disableYearRange: false,
    startWeekSunday: false,
    showWeekNumColumn: true,
    activeLocaleCode: 'zh',
    timeDisplayEnabled: true,
    currentDateFormat: '[todayPrompt] [upperCaseDayNameShort]. [dayNum]. [monthName] [yearNum]',
    assetPath: 'resources/',
    selectionSlideSpeed: 200,
    minuteIncrement: 5,
    verticalOffset: 0,
    horizontalOffset: 0,
    calendarContainer: null,
    isLegacyInternetExplorer: false,
    isOperaBrowser: false,
    highlightColor: '#D60808',
    rolloverBackgroundColor: '#E2EBED',
    isOptionMovementActive: false,
    activeOptionElement: null,
    activeMonthOption: null,
    activeYearOption: null,
    activeHourOption: null,
    activeMinuteOption: null,
    dropdownIframeOverlay: null,
    activeOptionDirection: 0,
};

if (navigator.userAgent.includes('MSIE') && !navigator.userAgent.includes('Opera')) {
    applicationSettings.isLegacyInternetExplorer = true;
}
if (navigator.userAgent.includes('Opera')) {
    applicationSettings.isOperaBrowser = true;
}

const localeRegistry = {
    'en': {
        fullMonths: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
        shortDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        weekLabel: 'Week',
        todayLabel: '',
    },
    'de': {
        fullMonths: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'],
        shortDays: ['Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam', 'Son'],
        weekLabel: 'Woche',
        todayLabel: 'Heute',
    },
    'no': {
        fullMonths: ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'],
        shortDays: ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'L&oslash;r', 'S&oslash;n'],
        weekLabel: 'Uke',
        todayLabel: 'Dagen i dag er',
    },
    'nl': {
        fullMonths: ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
        shortDays: ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'],
        weekLabel: 'Week',
        todayLabel: 'Vandaag',
    },
    'es': {
        fullMonths: ['Enero', 'Febrero', 'Marzo', 'April', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
        shortMonths: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'],
        shortDays: ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'],
        weekLabel: 'Semana',
        todayLabel: 'Hoy es',
    },
    'pt-br': {
        fullMonths: ['Janeiro', 'Fevereiro', 'Mar&ccedil;o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'],
        shortMonths: ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'],
        shortDays: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&aacute;b', 'Dom'],
        weekLabel: 'Sem.',
        todayLabel: 'Hoje &eacute;',
    },
    'fr': {
        fullMonths: ['Janvier', 'F&eacute;vrier', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Ao&ucirc;t', 'Septembre', 'Octobre', 'Novembre', 'D&eacute;cembre'],
        shortMonths: ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'],
        shortDays: ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'],
        weekLabel: 'Sem',
        todayLabel: "Aujourd'hui",
    },
    'da': {
        fullMonths: ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'],
        shortMonths: ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'],
        shortDays: ['man', 'tirs', 'ons', 'tors', 'fre', 'l&oslash;r', 's&oslash;n'],
        weekLabel: 'Uge',
        todayLabel: 'I dag er den',
    },
    'hu': {
        fullMonths: ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'],
        shortMonths: ['Jan', 'Feb', 'Márc', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'],
        shortDays: ['Hé', 'Ke', 'Sze', 'Cs', 'Pé', 'Szo', 'Vas'],
        weekLabel: 'Hét',
        todayLabel: 'Mai nap',
    },
    'it': {
        fullMonths: ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'],
        shortMonths: ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lugl', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'],
        shortDays: ['Lun', ';Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'],
        weekLabel: 'Settimana',
        todayLabel: 'Oggi &egrave; il',
    },
    'sv': {
        fullMonths: ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'],
        shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'],
        shortDays: ['M&aring;n', 'Tis', 'Ons', 'Tor', 'Fre', 'L&ouml;r', 'S&ouml;n'],
        weekLabel: 'Vecka',
        todayLabel: 'Idag &auml;r det den',
    },
    'cz': {
        fullMonths: ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'],
        shortMonths: ['led', 'ún', 'bř', 'dub', 'kvě', 'čer', 'čer-ec', 'srp', 'zář', 'říj', 'list', 'pros'],
        shortDays: ['Pon', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'],
        weekLabel: 'týden',
        todayLabel: '',
    },
    'zh': {
        fullMonths: ['壹月', '贰月', '叁月', '肆月', '伍月', '陆月', '柒月', '捌月', '玖月', '拾月', '拾壹月', '拾贰月'],
        shortMonths: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'],
        shortDays: ['周壹', '周贰', '周叁', '周肆', '周伍', '周陆', '周日'],
        weekLabel: '',
        todayLabel: '',
    },
};

let currentLocaleData = localeRegistry[applicationSettings.activeLocaleCode];
if (applicationSettings.startWeekSunday) {
    const lastDay = currentLocaleData.shortDays.pop();
    currentLocaleData.shortDays.unshift(lastDay);
}

const dateContext = {
    currentSelectedMonth: null,
    currentSelectedYear: null,
    currentSelectedHour: null,
    currentSelectedMinute: null,
    targetInputReference: null,
    outputFormatSpecifier: null,
    targetYearInput: null,
    targetMonthInput: null,
    targetDayInput: null,
    targetHourInput: null,
    targetMinuteInput: null,
    initialYearValue: null,
    initialMonthValue: null,
    initialDayValue: null,
    initialHourValue: null,
    initialMinuteValue: null,
    displayTimeOption: false,
};

const monthDayCounts = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];

const domUtil = {
    queryById: (id) => document.getElementById(id),

    getOffset: (element) => {
        let currentLeft = 0;
        let currentTop = 0;
        let currentElement = element;
        if (currentElement && currentElement.offsetParent) {
            do {
                currentLeft += currentElement.offsetLeft;
                currentTop += currentElement.offsetTop;
                currentElement = currentElement.offsetParent;
            } while (currentElement && currentElement.offsetParent);
        }
        return { left: currentLeft, top: currentTop };
    },

    adjustIframeOverlay: (targetId) => {
        if (!applicationSettings.dropdownIframeOverlay) {
            applicationSettings.dropdownIframeOverlay = domUtil.queryById('calendar_iframe_fix_overlay'); // Assuming an ID for the iframe
            if (!applicationSettings.dropdownIframeOverlay) return;
        }
        const targetElement = domUtil.queryById(targetId);
        if (!targetElement) return;

        applicationSettings.dropdownIframeOverlay.style.display = 'block';
        applicationSettings.dropdownIframeOverlay.style.height = targetElement.offsetHeight + 1 + 'px';
        applicationSettings.dropdownIframeOverlay.style.width = targetElement.offsetWidth + 'px';
        const targetOffset = domUtil.getOffset(targetElement);
        applicationSettings.dropdownIframeOverlay.style.left = (targetOffset.left + 1 - applicationSettings.horizontalOffset) + 'px';
        applicationSettings.dropdownIframeOverlay.style.top = (targetOffset.top - targetElement.offsetHeight - applicationSettings.verticalOffset) + 'px';
    },

    hideIframeOverlay: () => {
        if (applicationSettings.dropdownIframeOverlay) {
            applicationSettings.dropdownIframeOverlay.style.display = 'none';
        }
    },

    toggleDisplay: (elementId) => {
        const element = domUtil.queryById(elementId);
        if (element) {
            element.style.display = (element.style.display === 'block') ? 'none' : 'block';
        }
    },

    applyStyle: (element, styleProp, value) => {
        if (element) element.style[styleProp] = value;
    },
    removeStyle: (element, styleProp) => {
        if (element) element.style[styleProp] = '';
    },
};

const dateCalc = {
    isYearBissextile: (yearCandidate) => {
        return (yearCandidate % 400 === 0) || (yearCandidate % 4 === 0 && yearCandidate % 100 !== 0);
    },

    getDaysInMonth: (monthIndex, yearValue) => {
        if (monthIndex === 1 && dateCalc.isYearBissextile(yearValue)) {
            return 29;
        }
        return monthDayCounts[monthIndex];
    },
};

const eventHandlers = {
    blockDefaultAction: (evt) => {
        if (evt && evt.preventDefault) evt.preventDefault();
        return false;
    },

    handleOptionHighlight: function() {
        if (applicationSettings.activeOptionElement) {
            domUtil.removeStyle(applicationSettings.activeOptionElement, 'backgroundColor');
            domUtil.removeStyle(applicationSettings.activeOptionElement, 'color');
        }

        applicationSettings.activeOptionElement = this;

        if (this.className === 'selectionActive') {
            this.className = '';
        } else {
            this.className = 'selectionActive';
        }

        domUtil.applyStyle(this, 'backgroundColor', applicationSettings.rolloverBackgroundColor);

        if (this.textContent.includes('-') || this.textContent.includes('+')) {
            applicationSettings.isOptionMovementActive = (this.className === 'selectionActive');
            applicationSettings.activeOptionDirection = this.textContent.includes('-') ? -1 : 1;
        } else {
            applicationSettings.isOptionMovementActive = false;
        }
    },

    handleOptionUnhighlight: function() {
        if (this.className === 'selectionActive') {
            domUtil.applyStyle(this, 'backgroundColor', applicationSettings.rolloverBackgroundColor);
        } else {
            domUtil.removeStyle(this, 'backgroundColor');
        }
    },

    processMonthSelection: function() {
        domUtil.queryById('cal_month_display').innerHTML = this.innerHTML;
        dateContext.currentSelectedMonth = parseInt(this.id.replace(/\D/g, ''));
        domUtil.toggleDisplay('month_options_panel');
        domUtil.hideIframeOverlay();

        if (applicationSettings.activeMonthOption) {
            domUtil.removeStyle(applicationSettings.activeMonthOption, 'color');
        }
        applicationSettings.activeMonthOption = this;
        domUtil.applyStyle(this, 'color', applicationSettings.highlightColor);
        // updateCalendarGrid(); // Implied call
    },

    processHourSelection: function() {
        domUtil.queryById('cal_hour_display').innerHTML = this.innerHTML;
        dateContext.currentSelectedHour = parseInt(this.innerHTML.replace(/\D/g, ''));
        domUtil.toggleDisplay('hour_options_panel');
        domUtil.hideIframeOverlay();

        if (applicationSettings.activeHourOption) {
            domUtil.removeStyle(applicationSettings.activeHourOption, 'color');
        }
        applicationSettings.activeHourOption = this;
        domUtil.applyStyle(this, 'color', applicationSettings.highlightColor);
    },

    processMinuteSelection: function() {
        domUtil.queryById('cal_minute_display').innerHTML = this.innerHTML;
        dateContext.currentSelectedMinute = parseInt(this.innerHTML.replace(/\D/g, ''));
        domUtil.toggleDisplay('minute_options_panel');
        domUtil.hideIframeOverlay();

        if (applicationSettings.activeMinuteOption) {
            domUtil.removeStyle(applicationSettings.activeMinuteOption, 'color');
        }
        applicationSettings.activeMinuteOption = this;
        domUtil.applyStyle(this, 'color', applicationSettings.highlightColor);
    },

    processYearSelection: function() {
        domUtil.queryById('cal_year_display').innerHTML = this.innerHTML;
        dateContext.currentSelectedYear = parseInt(this.innerHTML.replace(/\D/g, ''));
        domUtil.toggleDisplay('year_options_panel');
        domUtil.hideIframeOverlay();

        if (applicationSettings.activeYearOption) {
            domUtil.removeStyle(applicationSettings.activeYearOption, 'color');
        }
        applicationSettings.activeYearOption = this;
        domUtil.applyStyle(this, 'color', applicationSettings.highlightColor);
        // updateCalendarGrid(); // Implied call
    },

    navigateMonth: function(direction) {
        dateContext.currentSelectedMonth += direction;
        if (dateContext.currentSelectedMonth < 0) {
            dateContext.currentSelectedMonth = 11;
            dateContext.currentSelectedYear--;
        } else if (dateContext.currentSelectedMonth > 11) {
            dateContext.currentSelectedMonth = 0;
            dateContext.currentSelectedYear++;
        }
        // updateCalendarGrid(); // Implied call
    },

    toggleDropdownPanel: (panelId, currentElementId) => {
        const panel = domUtil.queryById(panelId);
        if (panel && panel.style.display === 'block') {
            domUtil.toggleDisplay(panelId);
            domUtil.hideIframeOverlay();
        } else {
            ['month_options_panel', 'year_options_panel', 'hour_options_panel', 'minute_options_panel'].forEach(id => {
                if (id !== panelId) domUtil.applyStyle(domUtil.queryById(id), 'display', 'none');
            });
            domUtil.toggleDisplay(panelId);
            if (applicationSettings.isLegacyInternetExplorer) {
                domUtil.adjustIframeOverlay(currentElementId);
            }
        }
    },
};

const contentBuilders = {
    generateMonthOptions: () => {
        const panelDiv = document.createElement('DIV');
        panelDiv.className = 'optionPanel';
        panelDiv.id = 'month_options_panel';

        currentLocaleData.fullMonths.forEach((monthName, index) => {
            const optionDiv = document.createElement('DIV');
            optionDiv.innerHTML = monthName;
            optionDiv.addEventListener('mouseover', eventHandlers.handleOptionHighlight);
            optionDiv.addEventListener('mouseout', eventHandlers.handleOptionUnhighlight);
            optionDiv.addEventListener('click', eventHandlers.processMonthSelection);
            optionDiv.id = 'month_option_' + index;
            domUtil.applyStyle(optionDiv, 'width', '56px');
            optionDiv.addEventListener('selectstart', eventHandlers.blockDefaultAction);
            panelDiv.appendChild(optionDiv);

            if (dateContext.currentSelectedMonth !== null && dateContext.currentSelectedMonth === index) {
                domUtil.applyStyle(optionDiv, 'color', applicationSettings.highlightColor);
                applicationSettings.activeMonthOption = optionDiv;
            }
        });
        return panelDiv;
    },

    refreshYearOptions: (event, triggeringElement) => {
        const element = triggeringElement || event.currentTarget;
        const yearOptionsContainer = element.parentNode;
        const yearOptionElements = Array.from(yearOptionsContainer.children).filter(child => child.tagName === 'DIV');

        const isDecrement = element.textContent.includes('-');
        let initialYear;

        const firstYearOption = yearOptionElements.find(el => el.id && el.id.startsWith('year_option_'));
        if (!firstYearOption) return;

        if (isDecrement) {
            initialYear = parseInt(firstYearOption.textContent) - 1;
            if (applicationSettings.activeYearOption) {
                domUtil.removeStyle(applicationSettings.activeYearOption, 'color');
            }
        } else {
            initialYear = parseInt(firstYearOption.textContent) + 1;
            if (applicationSettings.activeYearOption) {
                domUtil.removeStyle(applicationSettings.activeYearOption, 'color');
            }
        }

        let optionIndex = 0;
        for (let i = 0; i < yearOptionElements.length; i++) {
            const currentOption = yearOptionElements[i];
            // Only update elements that are actual year options (not control buttons)
            if (currentOption.id && currentOption.id.startsWith('year_option_')) {
                currentOption.innerHTML = initialYear + optionIndex;
                currentOption.id = 'year_option_' + (initialYear + optionIndex);
                optionIndex++;
            }
        }

        if (applicationSettings.activeYearOption) {
            domUtil.removeStyle(applicationSettings.activeYearOption, 'color');
            const newActiveYearElement = domUtil.queryById('year_option_' + dateContext.currentSelectedYear);
            if (newActiveYearElement) {
                applicationSettings.activeYearOption = newActiveYearElement;
                domUtil.applyStyle(applicationSettings.activeYearOption, 'color', applicationSettings.highlightColor);
            }
        }
    },

    refreshHourOptions: (event, triggeringElement) => {
        const element = triggeringElement || event.currentTarget;
        const hourOptionsContainer = element.parentNode;
        const hourOptionElements = Array.from(hourOptionsContainer.children).filter(child => child.tagName === 'DIV');

        const isDecrement = element.textContent.includes('-');
        let initialHour;

        const firstHourOption = hourOptionElements.find(el => el.id && el.id.startsWith('hour_option_'));
        if (!firstHourOption) return;

        if (isDecrement) {
            initialHour = parseInt(firstHourOption.textContent) - 1;
            if (initialHour < 0) initialHour = 0;
            if (applicationSettings.activeHourOption) {
                domUtil.removeStyle(applicationSettings.activeHourOption, 'color');
            }
        } else {
            initialHour = parseInt(firstHourOption.textContent) + 1;
            if (initialHour > 14) initialHour = 14;
            if (applicationSettings.activeHourOption) {
                domUtil.removeStyle(applicationSettings.activeHourOption, 'color');
            }
        }

        let optionIndex = 0;
        for (let i = 0; i < hourOptionElements.length; i++) {
            const currentOption = hourOptionElements[i];
            if (currentOption.id && currentOption.id.startsWith('hour_option_')) {
                const hourValue = initialHour + optionIndex;
                currentOption.innerHTML = (hourValue < 10 ? '0' : '') + hourValue;
                currentOption.id = 'hour_option_' + hourValue;
                optionIndex++;
            }
        }

        if (applicationSettings.activeHourOption) {
            domUtil.removeStyle(applicationSettings.activeHourOption, 'color');
            const newActiveHourElement = domUtil.queryById('hour_option_' + dateContext.currentSelectedHour);
            if (newActiveHourElement) {
                applicationSettings.activeHourOption = newActiveHourElement;
                domUtil.applyStyle(applicationSettings.activeHourOption, 'color', applicationSettings.highlightColor);
            }
        }
    }
};