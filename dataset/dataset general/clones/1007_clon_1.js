/*
 *******************************************************************
 * DATEDROPPER - A jQuery Plugin for beautiful date inputs.        *
 * Version: 1.2                                                    *
 * Last Updated: 2015-03-27                                        *
 *                                                                 *
 * Developed with <3 by Felice Gattuso.                            *
 *                                                                 *
 * This code is provided for educational purposes as a Type I clone.*
 * It maintains exact functionality and identifiers, varying only  *
 * in whitespace and comments.                                     *
 *******************************************************************
*/

( function ( $ ) {

    // Extend jQuery's prototype with the dateDropper function
    $.fn.dateDropper = function( options ) {

        // Iterate over each selected element
        return $( this ).each( function() {

            // Check if the current element is an input of type 'text'
            // This ensures the plugin only initializes on appropriate elements
            if ( $( this ).is( 'input' ) && $( this ).attr( 'type' ) == "text" ) {

                // --- DECLARE INITIAL DATE VARIABLES ---
                // These variables capture the current year, day, and month.
                var
                dd_y_current    =   new Date().getFullYear(),   // Get the full year from the current date
                dd_d_current    =   new Date().getDate(),       // Get the day of the month (1-31)
                dd_m_current    =   new Date().getMonth(),      // Get the month (0-11)

                // --- PLUGIN SETTINGS CONFIGURATION ---
                // Merge default settings with user-provided options.
                settings = $.extend( {

                    animate_current     : true,                 // Flag to animate the current date
                    animation           : "fadein",             // Type of animation for showing/hiding
                    format              : "m/d/Y",              // Default date format
                    lang                : "en",                 // Default language for month/day names
                    lock                : false,                // Flag to lock the date picker
                    maxYear             : dd_y_current,         // Maximum selectable year (defaults to current year)
                    minYear             : 1970,                 // Minimum selectable year
                    placeholder         : false,                // Flag for placeholder functionality
                    years_multiple      : 10,                   // Step for year selection in dropdowns

                    // --- STYLE SETTINGS ---
                    color               : "#f87a54",            // Primary accent color
                    textColor           : "#000000",            // Default text color
                    bgColor             : "#FFFFFF",            // Background color of the date picker
                    borderColor         : "#000000",            // Border color
                    borderRadius        : 8,                    // Border radius in pixels
                    boxShadow           : "0 0px 0px 6px rgba(0,0,0,0.05)", // Box shadow style

                }, options ), // User options override defaults

                // --- ADDITIONAL VARIABLE DECLARATIONS ---
                // Variables used throughout the plugin's logic.
                dd_input        = $( this ),                                // The jQuery object for the input field
                drop_length     = $( '.dd_wrap' ).length + 1,               // Determines a unique ID for the date picker wrapper
                bissextile      = function( yr ) {                          // Function to check for a leap year
                                    return !( ( yr % 4 ) || ( !( yr % 100 ) && ( yr % 400 ) ) );
                                  },
                range           = 100,                                      // A general range variable, possibly for years
                isHex           = /^#[0-9A-F]{6}$/i.test( settings.color ), // Validates if the color is a 6-digit hex code
                ymultiselect    = 0;                                        // Variable for year multi-selection logic

                // --- SETTINGS VALIDATION AND ADJUSTMENTS ---
                // Ensure color is valid and maxYear doesn't exceed current year if not specified.
                if ( !isHex ) {
                    settings.color = '#f87a54'; // Fallback to default color if invalid hex
                }

                if ( settings.maxYear < dd_y_current ) {
                    dd_y_current = settings.maxYear; // Adjust current year if maxYear is less than actual current year
                }

                // --- YEAR RANGER FUNCTION ---
                // Helper function to determine the start of a year range based on `years_multiple`.
                var
                yranger     = function( yr ) {
                    for ( var yy = settings.minYear; yy <= settings.maxYear ; yy++ ) {

                        var remainder = yy % settings.years_multiple;
                        if ( remainder == 0 )
                        if ( yr >= yy && yr < ( yy + settings.years_multiple ) || yr < yy ) {
                            ymultiselect = yy;
                            return yy;
                        }

                    }
                };

                // --- LANGUAGE SWITCH ---
                // Defines month and day names based on the 'lang' setting.
                switch ( settings.lang ) {

                    // Arabic language settings
                    case 'ar':
                        var monthNames = [
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
                        var dayNames = [
                            'الأحد',
                            'الإثنين',
                            'الثلثاء',
                            'الأربعاء',
                            'الخميس',
                            'الجمعة',
                            'السبت'
                        ];
                        break;

                    // Italian language settings
                    case 'it':
                        var monthNames = [
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
                        var dayNames = [
                            'Domenica',
                            'Lunedì',
                            'Martedì',
                            'Mercoledì',
                            'Giovedì',
                            'Venerdì',
                            'Sabato'
                        ];
                        break;

                    // Hungarian language settings
                    case 'hu':
                        var monthNames = [
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
                        var dayNames = [
                            'vasárnap',
                            'hétfő',
                            'kedd',
                            'szerda',
                            'csütörtök',
                            'péntek',
                            'szombat'
                        ];
                        break;

                    // Greek language settings
                    case 'gr':
                        var monthNames = [
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
                        var dayNames = [
                            'Κυριακή',
                            'Δευτέρα',
                            'Τρίτη',
                            'Τετάρτη',
                            'Πέμπτη',
                            'Παρασκευή',
                            'Σάββατο'
                        ];
                        break;

                    // Spanish language settings
                    case 'es':
                        var monthNames = [
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
                        var dayNames = [
                            'Domingo',
                            'Lunes',
                            'Martes',
                            'Miércoles',
                            'Jueves',
                            'Viernes',
                            'Sábado'
                        ];
                        break;

                    // Danish language settings
                    case 'da':
                        var monthNames = [
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
                        var dayNames = [
                            'søndag',
                            'mandag',
                            'tirsdag',
                            'onsdag',
                            'torsdag',
                            'fredag',
                            'lørdag'
                        ];
                        break;

                    // German language settings
                    case 'de':
                        var monthNames = [
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
                        var dayNames = [
                            'Sonntag',
                            'Montag',
                            'Dienstag',
                            'Mittwoch',
                            'Donnerstag',
                            'Freitag',
                            'Samstag'
                        ];
                        break;

                    // Dutch language settings
                    case 'nl':
                        var monthNames = [
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
                        var dayNames = [
                            'zondag',
                            'maandag',
                            'dinsdag',
                            'woensdag',
                            'donderdag',
                            'vrijdag',
                            'zaterdag'
                        ];
                        break;

                    // French language settings
                    case 'fr':
                        var monthNames = [
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
                        var dayNames = [
                            'Dimanche',
                            'Lundi',
                            'Mardi',
                            'Mercredi',
                            'Jeudi',
                            'Vendredi',
                            'Samedi'
                        ];
                        break;

                    // Polish language settings
                    case 'pl':
                        var monthNames = [
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
                        var dayNames = [
                            'niedziela',
                            'poniedziałek',
                            'wtorek',
                            'środa',
                            'czwartek',
                            'piątek',
                            'sobota'
                        ];
                        break;

                    // Portuguese language settings
                    case 'pt':
                        var monthNames = [
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
                        var dayNames = [
                            "Domingo",
                            "Segunda",
                            "Terça",
                            "Quarta",
                            "Quinta",
                            "Sexta",
                            "Sábado"
                        ];
                        break;

                    // Slovenian language settings
                    case 'si':
                        var monthNames = [
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
                        var dayNames = [
                            'nedelja',
                            'ponedeljek',
                            'torek',
                            'sreda',
                            'četrtek',
                            'petek',
                            'sobota'
                        ];
                        break;

                    // Ukrainian language settings
                    case 'uk':
                        var monthNames = [
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
                        var dayNames = [
                            'неділя',
                            'понеділок',
                            'вівторок',
                            'середа',
                            'четвер',
                            'п\'ятниця',
                            'субота'
                        ];
                        break;

                    // Russian language settings
                    case 'ru':
                        var monthNames = [
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
                        var dayNames = [
                            'воскресенье',
                            'понедельник',
                            'вторник',
                            'среда',
                            'четверг',
                            'пятница',
                            'суббота'
                        ];
                        break;

                    // Turkish language settings
                    case 'tr':
                        var monthNames = [
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
                        var dayNames = [
                            'Pazar',
                            'Pazartesi',
                            'Sali',
                            'Çarşamba',
                            'Perşembe',
                            'Cuma',
                            'Cumartesi'
                        ];
                        break;

                    // Default English language settings
                    default:
                        var monthNames = [
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
                        var dayNames = [
                            'Sunday',
                            'Monday',
                            'Tuesday',
                            'Wednesday',
                            'Thursday',
                            'Friday',
                            'Saturday'
                        ];
                        break;

                } // End of language switch statement

                // --- CREATE WRAPPER ELEMENT ---
                // Placeholder for the next logical block of code.
                // This comment indicates where the date picker's DOM structure
                // would typically be created or manipulated.