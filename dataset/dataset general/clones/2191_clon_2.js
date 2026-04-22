/*
This script provides date and time selection functionalities.
It supports various languages and customizable display options.
Developed in 2006, this software is distributed under the GNU Lesser General Public License.
*/

/*
Change history:
Version 1.2 (2005-11-08): Improved IE iframe background handling.
Version 1.3 (2005-11-12): Opera 7 top bar positioning fixed.
Version 1.4 (2005-12-28): Added support for Spanish and Portuguese locales.
Version 1.5 (2006-01-18): Corrected next/previous button behavior after month selection.
Version 1.6 (2006-02-22): Introduced image path variable; enhanced today's date formatting and selection.
Version 2.0 (2006-05-25): Added time selection (hour/minute) and accelerated year/hour changes on hold.
Version 2.1 (2006-07-02): Extended date format support (e.g., d.m.yyyy).

// Enhancements by a contributor
Version 2.1.1 (2007-08-09): Added option to limit year range in dropdown.
Version 2.1.2 (2007-08-30): Added option to start week on Sunday; option to hide week numbers; HTTPS fix.
*/
var disableYearRange = false; // true = Limit year selection to current + next; false = show +/- 5 years
var startWeekOnSunday = false; // true = Week starts Sunday; false = Week starts Monday
var displayWeekNum = true; // true = show week number; false = hide week number

var localeSetting = 'cn'; // Supported values: en, ge, no, nl, es, pt-br, fr, da, hu, it, sv, cz, cn

var showClockElements = true;
// Pattern for today's date display at the bottom
// [presentDayLabel] = value of currentDayLabel
// [dayAbbreviation] = day of week (e.g., mon, tue)
// [UCFdayAbbreviation] = day of week (e.g., Mon, Tue) (First letter capitalized)
// [dayOfMonth] = Day of month, 1-31
// [fullMonthName] = Name of current month
// [currentYear] = Current year
var presentDayFormatString = '[presentDayLabel] [UCFdayAbbreviation]. [dayOfMonth]. [fullMonthName] [currentYear]';
var assetPath = 'images/'; // Relative to your HTML file location

var dropdownAnimationSpeed = 200; // Milliseconds for year/hour change on hold - lower value is faster
var minuteDropdownInterval = 5; // Minute dropdown - interval between options (5 = default)

var viewOffsetTop = 0; // Vertical offset for calendar placement
var viewOffsetLeft = 0; // Horizontal offset for calendar placement
var datePickerElement = false;

var isInternetExplorer = false;
var isOperaBrowser = false;
if (navigator.userAgent.indexOf('MSIE') >= 0 && navigator.userAgent.indexOf('Opera') < 0) isInternetExplorer = true;
if (navigator.userAgent.indexOf('Opera') >= 0) isOperaBrowser = true;


switch (localeSetting) {
    case "en": /* English */
        var fullMonthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
        var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        var dayAbbreviations = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
        var weekLabel = 'Week';
        var currentDayLabel = '';
        break;
    case "ge": /* German */
        var fullMonthNames = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
        var dayAbbreviations = ['Mon', 'Die', 'Mit', 'Don', 'Fre', 'Sam', 'Son'];
        var weekLabel = 'Woche';
        var currentDayLabel = 'Heute';
        break;
    case "no": /* Norwegian */
        var fullMonthNames = ['Januar', 'Februar', 'Mars', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Desember'];
        var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Des'];
        var dayAbbreviations = ['Man', 'Tir', 'Ons', 'Tor', 'Fre', 'L&oslash;r', 'S&oslash;n'];
        var weekLabel = 'Uke';
        var currentDayLabel = 'Dagen i dag er';
        break;
    case "nl": /* Dutch */
        var fullMonthNames = ['Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni', 'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'];
        var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        var dayAbbreviations = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'];
        var weekLabel = 'Week';
        var currentDayLabel = 'Vandaag';
        break;
    case "es": /* Spanish */
        var fullMonthNames = ['Enero', 'Febrero', 'Marzo', 'April', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
        var shortMonthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];
        var dayAbbreviations = ['Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab', 'Dom'];
        var weekLabel = 'Semana';
        var currentDayLabel = 'Hoy es';
        break;
    case "pt-br": /* Brazilian portuguese (pt-br) */
        var fullMonthNames = ['Janeiro', 'Fevereiro', 'Mar&ccedil;o', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
        var shortMonthNames = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
        var dayAbbreviations = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'S&aacute;b', 'Dom'];
        var weekLabel = 'Sem.';
        var currentDayLabel = 'Hoje &eacute;';
        break;
    case "fr": /* French */
        var fullMonthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
        var shortMonthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aou', 'Sep', 'Oct', 'Nov', 'Dec'];
        var dayAbbreviations = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
        var weekLabel = 'Sem';
        var currentDayLabel = "Aujourd'hui";
        break;
    case "da": /* Danish */
        var fullMonthNames = ['januar', 'februar', 'marts', 'april', 'maj', 'juni', 'juli', 'august', 'september', 'oktober', 'november', 'december'];
        var shortMonthNames = ['jan', 'feb', 'mar', 'apr', 'maj', 'jun', 'jul', 'aug', 'sep', 'okt', 'nov', 'dec'];
        var dayAbbreviations = ['man', 'tirs', 'ons', 'tors', 'fre', 'l&oslash;r', 's&oslash;n'];
        var weekLabel = 'Uge';
        var currentDayLabel = 'I dag er den';
        break;
    case "hu": /* Hungarian - Remember to use UTF-8 encoding, i.e. the <meta> tag */
        var fullMonthNames = ['Január', 'Február', 'Március', 'Április', 'Május', 'Június', 'Július', 'Augusztus', 'Szeptember', 'Október', 'November', 'December'];
        var shortMonthNames = ['Jan', 'Feb', 'Márc', 'Ápr', 'Máj', 'Jún', 'Júl', 'Aug', 'Szep', 'Okt', 'Nov', 'Dec'];
        var dayAbbreviations = ['Hé', 'Ke', 'Sze', 'Cs', 'Pé', 'Szo', 'Vas'];
        var weekLabel = 'Hét';
        var currentDayLabel = 'Mai nap';
        break;
    case "it": /* Italian */
        var fullMonthNames = ['Gennaio', 'Febbraio', 'Marzo', 'Aprile', 'Maggio', 'Giugno', 'Luglio', 'Agosto', 'Settembre', 'Ottobre', 'Novembre', 'Dicembre'];
        var shortMonthNames = ['Gen', 'Feb', 'Mar', 'Apr', 'Mag', 'Giu', 'Lugl', 'Ago', 'Set', 'Ott', 'Nov', 'Dic'];
        var dayAbbreviations = ['Lun', ';Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
        var weekLabel = 'Settimana';
        var currentDayLabel = 'Oggi &egrave; il';
        break;
    case "sv": /* Swedish */
        var fullMonthNames = ['Januari', 'Februari', 'Mars', 'April', 'Maj', 'Juni', 'Juli', 'Augusti', 'September', 'Oktober', 'November', 'December'];
        var shortMonthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'Maj', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dec'];
        var dayAbbreviations = ['M&aring;n', 'Tis', 'Ons', 'Tor', 'Fre', 'L&ouml;r', 'S&ouml;n'];
        var weekLabel = 'Vecka';
        var currentDayLabel = 'Idag &auml;r det den';
        break;
    case "cz": /* Czech */
        var fullMonthNames = ['leden', 'únor', 'březen', 'duben', 'květen', 'červen', 'červenec', 'srpen', 'září', 'říjen', 'listopad', 'prosinec'];
        var shortMonthNames = ['led', 'ún', 'bř', 'dub', 'kvě', 'čer', 'čer-ec', 'srp', 'září', 'říj', 'list', 'pros'];
        var dayAbbreviations = ['Pon', 'Út', 'St', 'Čt', 'Pá', 'So', 'Ne'];
        var weekLabel = 'týden';
        var currentDayLabel = '';
        break;
    case "cn": /* China */
        var fullMonthNames = ['壹月', '贰月', '叁月', '肆月', '伍月', '陆月', '柒月', '捌月', '玖月', '拾月', '拾壹月', '拾贰月'];
        var shortMonthNames = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'];
        var dayAbbreviations = ['周壹', '周贰', '周叁', '周肆', '周伍', '周陆', '周日'];
        var weekLabel = '';
        var currentDayLabel = '';
        break;
}

if (startWeekOnSunday) {
    var temporaryDayName = dayAbbreviations[6];
    for (var dayIndex = 6; dayIndex > 0; dayIndex--) {
        dayAbbreviations[dayIndex] = dayAbbreviations[dayIndex - 1];
    }
    dayAbbreviations[0] = temporaryDayName;
}


var daysPerMonthArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
var activeMonth;
var activeYear;
var activeHour;
var activeMinute;
var pickerContentArea;
var targetInputElem;
var outputFormatStr;
var selectedMonthDropdown;
var selectedYearDropdown;
var selectedHourDropdown;
var selectedMinuteDropdown;

var frameOverlay = false;
// IE frame workaround for time dropdowns
var secondaryFrameOverlay = false;

function adjustFramePosition(elementToFix) {

    if (!secondaryFrameOverlay) return;
    secondaryFrameOverlay.style.display = 'block';
    secondaryFrameOverlay.style.height = document.getElementById(elementToFix).offsetHeight + 1;
    secondaryFrameOverlay.style.width = document.getElementById(elementToFix).offsetWidth;
    secondaryFrameOverlay.style.left = getHorizontalPosition(document.getElementById(elementToFix)) + 1 - viewOffsetLeft;
    secondaryFrameOverlay.style.top = getVerticalPosition(document.getElementById(elementToFix)) - document.getElementById(elementToFix).offsetHeight - viewOffsetTop;
}

function concealFrame() {
    if (secondaryFrameOverlay) secondaryFrameOverlay.style.display = 'none';
}
// IE frame workaround for time dropdowns
var outputYearTarget;
var outputMonthTarget;
var outputDayTarget;
var outputHourTarget;
var outputMinuteTarget;

var yearInputBox;
var monthInputBox;
var dayInputBox;
var hourInputBox;
var minuteInputBox;
var renderTimeControls = false;

var dropdownHighlightColor = '#D60808'; // Color for highlighted dropdown items
var dropdownHoverBgColor = '#E2EBED'; // Background color on dropdown list hover

var dropdownMotionActive = false;
var activeDropdownOption = false;

function preventDefaultAction() {
    return false;
}

function determineLeapYear(yearToCheck) {
    if (yearToCheck % 400 == 0 || (yearToCheck % 4 == 0 && yearToCheck % 100 != 0)) return true;
    return false;

}
var selectedMonthDropdown = false;
var activeDropdownDirection = false;

function emphasizeDropdownEntry() {
    if (selectedMonthDropdown) selectedMonthDropdown.className = '';
    activeDropdownOption = this;


    if (this.className == 'monthYearActive') {
        this.className = '';
    } else {
        this.className = 'monthYearActive';
        selectedMonthDropdown = this;
    }

    if (this.innerHTML.indexOf('-') >= 0 || this.innerHTML.indexOf('+') >= 0) {
        if (this.className == 'monthYearActive')
            dropdownMotionActive = true;
        else
            dropdownMotionActive = false;
        if (this.innerHTML.indexOf('-') >= 0) activeDropdownDirection = -1; else activeDropdownDirection = 1;

    } else dropdownMotionActive = false;

}

function displayMonthDropdown() {
    if (document.getElementById('monthDropDown').style.display == 'block') {
        document.getElementById('monthDropDown').style.display = 'none';
        // IE frame workaround for time dropdowns
        concealFrame();
    } else {
        document.getElementById('monthDropDown').style.display = 'block';
        document.getElementById('yearDropDown').style.display = 'none';
        document.getElementById('hourDropDown').style.display = 'none';
        document.getElementById('minuteDropDown').style.display = 'none';
        if (isInternetExplorer) {
            adjustFramePosition('monthDropDown')
        }
        // IE frame workaround for time dropdowns

    }
}

function displayYearDropdown() {
    if (document.getElementById('yearDropDown').style.display == 'block') {
        document.getElementById('yearDropDown').style.display = 'none';
        // IE frame workaround for time dropdowns
        concealFrame();
    } else {
        document.getElementById('yearDropDown').style.display = 'block';
        document.getElementById('monthDropDown').style.display = 'none';
        document.getElementById('hourDropDown').style.display = 'none';
        document.getElementById('minuteDropDown').style.display = 'none';
        if (isInternetExplorer) {
            adjustFramePosition('yearDropDown')
        }
        // IE frame workaround for time dropdowns

    }

}

function displayHourDropdown() {
    if (document.getElementById('hourDropDown').style.display == 'block') {
        document.getElementById('hourDropDown').style.display = 'none';
        // IE frame workaround for time dropdowns
        concealFrame();
    } else {
        document.getElementById('hourDropDown').style.display = 'block';
        document.getElementById('monthDropDown').style.display = 'none';
        document.getElementById('yearDropDown').style.display = 'none';
        document.getElementById('minuteDropDown').style.display = 'none';
        if (isInternetExplorer) {
            adjustFramePosition('hourDropDown')
        }
        // IE frame workaround for time dropdowns
    }

}

function displayMinuteDropdown() {
    if (document.getElementById('minuteDropDown').style.display == 'block') {
        document.getElementById('minuteDropDown').style.display = 'none';
        // IE frame workaround for time dropdowns
        concealFrame();
    } else {
        document.getElementById('minuteDropDown').style.display = 'block';
        document.getElementById('monthDropDown').style.display = 'none';
        document.getElementById('yearDropDown').style.display = 'none';
        document.getElementById('hourDropDown').style.display = 'none';
        if (isInternetExplorer) {
            adjustFramePosition('minuteDropDown')
        }
        // IE frame workaround for time dropdowns
    }

}

function chooseMonth() {
    document.getElementById('calendar_month_txt').innerHTML = this.innerHTML;
    activeMonth = this.id.replace(/[^\d]/g, '');

    document.getElementById('monthDropDown').style.display = 'none';
    // IE frame workaround for time dropdowns
    concealFrame();
    for (var idx = 0; idx < fullMonthNames.length; idx++) {
        document.getElementById('monthDiv_' + idx).style.color = '';
    }
    this.style.color = dropdownHighlightColor;
    selectedMonthDropdown = this;
    rebuildCalendarGrid();
}

function chooseHour() {
    document.getElementById('calendar_hour_txt').innerHTML = this.innerHTML;
    activeHour = this.innerHTML.replace(/[^\d]/g, '');
    document.getElementById('hourDropDown').style.display = 'none';
    // IE frame workaround for time dropdowns
    concealFrame();
    if (selectedHourDropdown) {
        selectedHourDropdown.style.color = '';
    }
    selectedHourDropdown = this;
    this.style.color = dropdownHighlightColor;
}

function chooseMinute() {
    document.getElementById('calendar_minute_txt').innerHTML = this.innerHTML;
    activeMinute = this.innerHTML.replace(/[^\d]/g, '');
    document.getElementById('minuteDropDown').style.display = 'none';
    // IE frame workaround for time dropdowns
    concealFrame();
    if (selectedMinuteDropdown) {
        selectedMinuteDropdown.style.color = '';
    }
    selectedMinuteDropdown = this;
    this.style.color = dropdownHighlightColor;
}


function chooseYear() {
    document.getElementById('calendar_year_txt').innerHTML = this.innerHTML;
    activeYear = this.innerHTML.replace(/[^\d]/g, '');
    document.getElementById('yearDropDown').style.display = 'none';
    // IE frame workaround for time dropdowns
    concealFrame();
    if (selectedYearDropdown) {
        selectedYearDropdown.style.color = '';
    }
    selectedYearDropdown = this;
    this.style.color = dropdownHighlightColor;
    rebuildCalendarGrid();
}

function navigateMonth() {
    if (this.src.indexOf('left') >= 0) {
        activeMonth = activeMonth - 1;
        if (activeMonth < 0) {
            activeMonth = 11;
            activeYear = activeYear - 1;
        }
    } else {
        activeMonth = activeMonth + 1;
        if (activeMonth > 11) {
            activeMonth = 0;
            activeYear = activeYear / 1 + 1;
        }
    }

    rebuildCalendarGrid();
}

function generateMonthOptionsDiv() {
    var containerDiv = document.createElement('DIV');
    containerDiv.className = 'monthYearPicker';
    containerDiv.id = 'monthPicker';

    for (var idx = 0; idx < fullMonthNames.length; idx++) {
        var optionDiv = document.createElement('DIV');
        optionDiv.innerHTML = fullMonthNames[idx];
        optionDiv.onmouseover = emphasizeDropdownEntry;
        optionDiv.onmouseout = emphasizeDropdownEntry;
        optionDiv.onclick = chooseMonth;
        optionDiv.id = 'monthDiv_' + idx;
        optionDiv.style.width = '56px';
        optionDiv.onselectstart = preventDefaultAction;
        containerDiv.appendChild(optionDiv);
        if (activeMonth && activeMonth == idx) {
            optionDiv.style.color = dropdownHighlightColor;
            selectedMonthDropdown = optionDiv;
        }
    }
    return containerDiv;
}

function updateYearDropdownContent(eventObj, elementRef) {
    if (!elementRef) elementRef = this;
    var yearOptionElements = elementRef.parentNode.getElementsByTagName('DIV');
    if (elementRef.innerHTML.indexOf('-') >= 0) {
        var initialYearValue = yearOptionElements[1].innerHTML / 1 - 1;
        if (selectedYearDropdown) {
            selectedYearDropdown.style.color = '';
        }
    } else {
        var initialYearValue = yearOptionElements[1].innerHTML / 1 + 1;
        if (selectedYearDropdown) {
            selectedYearDropdown.style.color = '';
        }
    }

    for (var idx = 1; idx < yearOptionElements.length - 1; idx++) {
        yearOptionElements[idx].innerHTML = initialYearValue + idx - 1;
        yearOptionElements[idx].id = 'yearDiv' + (initialYearValue / 1 + idx / 1 - 1);
    }
    if (selectedYearDropdown) {
        selectedYearDropdown.style.color = '';
        if (document.getElementById('yearDiv' + activeYear)) {
            selectedYearDropdown = document.getElementById('yearDiv' + activeYear);
            selectedYearDropdown.style.color = dropdownHighlightColor;
        }
    }
}

function updateHourDropdownContent(eventObj, elementRef) {
    if (!elementRef) elementRef = this;

    var hourOptionElements = elementRef.parentNode.getElementsByTagName('DIV');
    if (elementRef.innerHTML.indexOf('-') >= 0) {
        var initialHourValue = hourOptionElements[1].innerHTML / 1 - 1;
        if (initialHourValue < 0) initialHourValue = 0;
        if (selectedHourDropdown) {
            selectedHourDropdown.style.color = '';
        }
    } else {
        var initialHourValue = hourOptionElements[1].innerHTML / 1 + 1;
        if (initialHourValue > 14) initialHourValue = 14;
        if (selectedHourDropdown) {
            selectedHourDropdown.style.color = '';

        }
    }
    var leadingZero = '';
    for (var idx = 1; idx < hourOptionElements.length - 1; idx++) {
        let newHourValue = initialHourValue + idx - 1;
        if (newHourValue < 10) leadingZero = '0'; else leadingZero = '';
        hourOptionElements[idx].innerHTML = leadingZero + newHourValue;
        hourOptionElements[idx].id = 'hourDiv' + newHourValue;
    }
    if (selectedHourDropdown) {
        selectedHourDropdown.style.color = '';
        if (document.getElementById('hourDiv' + activeHour)) {
            selectedHourDropdown = document.getElementById('hourDiv' + activeHour);
            selectedHourDropdown.style.color = dropdownHighlightColor;
        }
    }
}