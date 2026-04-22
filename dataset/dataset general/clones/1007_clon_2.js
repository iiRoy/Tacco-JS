/*
 ********************************************
 * DATE SELECTION WIDGET Version 1.2        *
 * Last Updated: March 27, 2015             *
 *                                          *
 * Developed with care by                   *
 * Felice Gattuso                           *
 ********************************************
*/

(function ( jQueryRef ) {
    jQueryRef.fn.calendarWidget = function( configParams ) {
        return jQueryRef(this).each(function() {

            /* Check if the current element is a text input field */
            if ( jQueryRef(this).is('input') && jQueryRef(this).attr('type') === "text" ) {

                /* Initialize current date values */
                const
                currentYearValue    =   new Date().getFullYear(),
                currentDayValue     =   new Date().getDate(),
                currentMonthValue   =   new Date().getMonth();

                /* Establish default and user-provided configurations */
                const
                defaultOptions = {
                    animateHighlight    : true,
                    entryAnimation      : "fadein",
                    dateFormat          : "m/d/Y",
                    localeCode          : "en",
                    preventModification : false,
                    maximumYear         : currentYearValue,
                    minimumYear         : 1970,
                    showPlaceholder     : false,
                    yearGroupSize       : 10,

                    /* Visual styling parameters */
                    accentColor         : "#f87a54",
                    fontColor           : "#000000",
                    backgroundColor     : "#FFFFFF",
                    frameColor          : "#000000",
                    cornerRounding      : 8,
                    shadowEffect        : "0 0px 0px 6px rgba(0,0,0,0.05)",
                };

                let
                configuration       = jQueryRef.extend({}, defaultOptions, configParams),

                /* Acquire reference to the target input element */
                targetElement       = jQueryRef(this),
                /* Determine a unique identifier for the new widget instance */
                widgetCount         = jQueryRef('.calendar_container').length + 1,
                /* Function to check if a year is a leap year */
                isLeapYear          = function(yearToCheck) { return !((yearToCheck % 4) || (!(yearToCheck % 100) && (yearToCheck % 400))); },
                /* Default year range for selection, not directly used in logic but defined */
                yearSelectionSpan   = 100,
                /* Validate hex color format for accentColor */
                isValidHex          = /^#[0-9A-F]{6}$/i.test(configuration.accentColor),
                /* Variable to store the starting year of the currently selected year group */
                selectedYearGroupStart = 0;

                /* Apply default accent color if provided one is invalid */
                if (!isValidHex) {
                    configuration.accentColor = '#f87a54';
                }
                /* Adjust current year if it exceeds the maximum allowed year */
                if (configuration.maximumYear < currentYearValue) {
                    currentYearValue = configuration.maximumYear;
                }

                /* Helper function to find the year group for a given year */
                const
                determineYearGroup = function(inputYear) {
                    for ( let currentIterYear = configuration.minimumYear; currentIterYear <= configuration.maximumYear; currentIterYear++ ) {
                        let groupRemainder = currentIterYear % configuration.yearGroupSize;
                        if (groupRemainder === 0) {
                            if (inputYear >= currentIterYear && inputYear < (currentIterYear + configuration.yearGroupSize) || inputYear < currentIterYear) {
                                selectedYearGroupStart = currentIterYear;
                                return currentIterYear;
                            }
                        }
                    }
                };

                /* Localize month and day names based on the specified locale */
                let localizedMonths;
                let localizedDays;

                switch(configuration.localeCode) {
                    /* Arabic localization */
                    case 'ar':
                        localizedMonths = [
                            "جانفي",
                            "فيفري",
                            "مارس",
                            "أفريل",
                            "ماي",
                            "جوان",
                            "جويلية",
                            "أوت",
                            "سبتمبر",
                            "أكتوبر",
                            "نوفمبر",
                            "ديسمبر"
                        ];
                        localizedDays = [
                            'الأحد',
                            'الإثنين',
                            'الثلثاء',
                            'الأربعاء',
                            'الخميس',
                            'الجمعة',
                            'السبت'
                        ];
                        break;
                    /* Italian localization */
                    case 'it':
                        localizedMonths = [
                            "Gennaio",
                            "Febbraio",
                            "Marzo",
                            "Aprile",
                            "Maggio",
                            "Giugno",
                            "Luglio",
                            "Agosto",
                            "Settembre",
                            "Ottobre",
                            "Novembre",
                            "Dicembre"
                        ];
                        localizedDays = [
                            'Domenica',
                            'Lunedì',
                            'Martedì',
                            'Mercoledì',
                            'Giovedì',
                            'Venerdì',
                            'Sabato'
                        ];
                        break;
                    /* Hungarian localization */
                    case 'hu':
                        localizedMonths = [
                            "január",
                            "február",
                            "március",
                            "április",
                            "május",
                            "június",
                            "július",
                            "augusztus",
                            "szeptember",
                            "október",
                            "november",
                            "december"
                        ];
                        localizedDays = [
                            'vasárnap',
                            'hétfő',
                            'kedd',
                            'szerda',
                            'csütörtök',
                            'péntek',
                            'szombat'
                        ];
                        break;
                    /* Greek localization */
                    case 'gr':
                        localizedMonths = [
                            "Ιανουάριος",
                            "Φεβρουάριος",
                            "Μάρτιος",
                            "Απρίλιος",
                            "Μάιος",
                            "Ιούνιος",
                            "Ιούλιος",
                            "Αύγουστος",
                            "Σεπτέμβριος",
                            "Οκτώβριος",
                            "Νοέμβριος",
                            "Δεκέμβριος"
                        ];
                        localizedDays = [
                            'Κυριακή',
                            'Δευτέρα',
                            'Τρίτη',
                            'Τετάρτη',
                            'Πέμπτη',
                            'Παρασκευή',
                            'Σάββατο'
                        ];
                        break;
                    /* Spanish localization */
                    case 'es':
                        localizedMonths = [
                            "Enero",
                            "Febrero",
                            "Marzo",
                            "Abril",
                            "Mayo",
                            "Junio",
                            "Julio",
                            "Agosto",
                            "Septiembre",
                            "Octubre",
                            "Noviembre",
                            "Diciembre"
                        ];
                        localizedDays = [
                            'Domingo',
                            'Lunes',
                            'Martes',
                            'Miércoles',
                            'Jueves',
                            'Viernes',
                            'Sábado'
                        ];
                        break;
                    /* Danish localization */
                    case 'da':
                        localizedMonths = [
                            "januar",
                            "februar",
                            "marts",
                            "april",
                            "maj",
                            "juni",
                            "juli",
                            "august",
                            "september",
                            "oktober",
                            "november",
                            "december"
                        ];
                        localizedDays = [
                            'søndag',
                            'mandag',
                            'tirsdag',
                            'onsdag',
                            'torsdag',
                            'fredag',
                            'lørdag'
                        ];
                        break;
                    /* German localization */
                    case 'de':
                        localizedMonths = [
                            "Januar",
                            "Februar",
                            "Marz",
                            "April",
                            "Mai",
                            "Juni",
                            "Juli",
                            "August",
                            "September",
                            "Oktober",
                            "November",
                            "Dezember"
                        ];
                        localizedDays = [
                            'Sonntag',
                            'Montag',
                            'Dienstag',
                            'Mittwoch',
                            'Donnerstag',
                            'Freitag',
                            'Samstag'
                        ];
                        break;
                    /* Dutch localization */
                    case 'nl':
                        localizedMonths = [
                            "januari",
                            "februari",
                            "maart",
                            "april",
                            "mei",
                            "juni",
                            "juli",
                            "augustus",
                            "september",
                            "oktober",
                            "november",
                            "december"
                        ];
                        localizedDays = [
                            'zondag',
                            'maandag',
                            'dinsdag',
                            'woensdag',
                            'donderdag',
                            'vrijdag',
                            'zaterdag'
                        ];
                        break;
                    /* French localization */
                    case 'fr':
                        localizedMonths = [
                            "Janvier",
                            "Février",
                            "Mars",
                            "Avril",
                            "Mai",
                            "Juin",
                            "Juillet",
                            "Août",
                            "Septembre",
                            "Octobre",
                            "Novembre",
                            "Décembre"
                        ];
                        localizedDays = [
                            'Dimanche',
                            'Lundi',
                            'Mardi',
                            'Mercredi',
                            'Jeudi',
                            'Vendredi',
                            'Samedi'
                        ];
                        break;
                    /* Polish localization */
                    case 'pl':
                        localizedMonths = [
                            "styczeń",
                            "luty",
                            "marzec",
                            "kwiecień",
                            "maj",
                            "czerwiec",
                            "lipiec",
                            "sierpień",
                            "wrzesień",
                            "październik",
                            "listopad",
                            "grudzień"
                        ];
                        localizedDays = [
                            'niedziela',
                            'poniedziałek',
                            'wtorek',
                            'środa',
                            'czwartek',
                            'piątek',
                            'sobota'
                        ];
                        break;
                    /* Portuguese localization */
                    case 'pt':
                        localizedMonths = [
                            "Janeiro",
                            "Fevereiro",
                            "Março",
                            "Abril",
                            "Maio",
                            "Junho",
                            "Julho",
                            "Agosto",
                            "Setembro",
                            "Outubro",
                            "Novembro",
                            "Dezembro"
                        ];
                        localizedDays = [
                            "Domingo",
                            "Segunda",
                            "Terça",
                            "Quarta",
                            "Quinta",
                            "Sexta",
                            "Sábado"
                        ];
                        break;
                    /* Slovenian localization */
                    case 'si':
                        localizedMonths = [
                            "januar",
                            "februar",
                            "marec",
                            "april",
                            "maj",
                            "junij",
                            "julij",
                            "avgust",
                            "september",
                            "oktober",
                            "november",
                            "december"
                        ];
                        localizedDays = [
                            'nedelja',
                            'ponedeljek',
                            'torek',
                            'sreda',
                            'četrtek',
                            'petek',
                            'sobota'
                        ];
                        break;
                    /* Ukrainian localization */
                    case 'uk':
                        localizedMonths = [
                            "січень",
                            "лютий",
                            "березень",
                            "квітень",
                            "травень",
                            "червень",
                            "липень",
                            "серпень",
                            "вересень",
                            "жовтень",
                            "листопад",
                            "грудень"
                        ];
                        localizedDays = [
                            'неділя',
                            'понеділок',
                            'вівторок',
                            'середа',
                            'четвер',
                            'п\'ятниця',
                            'субота'
                        ];
                        break;
                    /* Russian localization */
                    case 'ru':
                        localizedMonths = [
                            "январь",
                            "февраль",
                            "март",
                            "апрель",
                            "май",
                            "июнь",
                            "июль",
                            "август",
                            "сентябрь",
                            "октябрь",
                            "ноябрь",
                            "декабрь"
                        ];
                        localizedDays = [
                            'воскресенье',
                            'понедельник',
                            'вторник',
                            'среда',
                            'четверг',
                            'пятница',
                            'суббота'
                        ];
                        break;
                    /* Turkish localization */
                    case 'tr':
                        localizedMonths = [
                            "Ocak",
                            "Şubat",
                            "Mart",
                            "Nisan",
                            "Mayıs",
                            "Haziran",
                            "Temmuz",
                            "Ağustos",
                            "Eylül",
                            "Ekim",
                            "Kasım",
                            "Aralık"
                        ];
                        localizedDays = [
                            'Pazar',
                            'Pazartesi',
                            'Sali',
                            'Çarşamba',
                            'Perşembe',
                            'Cuma',
                            'Cumartesi'
                        ];
                        break;
                    /* Default English localization */
                    default:
                        localizedMonths = [
                            "January",
                            "February",
                            "March",
                            "April",
                            "May",
                            "June",
                            "July",
                            "August",
                            "September",
                            "October",
                            "November",
                            "December"
                        ];
                        localizedDays = [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ];
                        break;
                };

                /* Placeholder for widget creation logic */

            } /* End of input type check */
        }); /* End of each element iteration */
    }; /* End of plugin definition */
})( window.jQuery ); /* Pass jQuery object to the immediately invoked function */