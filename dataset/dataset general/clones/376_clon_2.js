/*!
 * calendar-widget-js library
 * Creator: @devmontero
 * Released under the MIT License
 *
 * jQuery mini-plugin scaffolding
 * Original Author: @appiano
 * Additional modifications, notes: @addysmith
 * Released under the MIT License
 */


// The semicolon at the beginning of the function call is a defensive measure
// against improperly terminated scripts or other plugin files
// that might be concatenated.
;(function ( $, currentWindow, activeDocument, undefinedEntity ) {

    // The 'undefinedEntity' parameter is used here because 'undefined'
    // in ECMAScript 3 was mutable (could be reassigned). By passing it in,
    // we ensure its true undefined value. In ES5 and later, 'undefined'
    // is no longer modifiable.

    // 'currentWindow' and 'activeDocument' are passed as local variables
    // instead of global access. This slightly improves lookup speed and
    // can lead to more efficient minification, especially if they are
    // frequently referenced within the component.

    // Establish the default configuration settings once
    var componentId = 'DateWidget',

        baseSettings = {
            startOfWeekIndex: 1,
            dayAbbreviations: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
            monthNames: ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"],
            todayMessage: 'Today',
            eventHeaderMsg: 'Daily Appointments',
            eventData: null
        },

        markupStructure =  ''+
                        '<h1 class="year-display"></h1>'+
                        '<h3 class="month-display"></h3>'+
                        '<table class="date-grid" id="dateGrid">'+
                            '<thead class="grid-header"></thead>'+
                            '<tbody class="grid-body"></tbody>'+
                            '<tfoot>'+
                                '<th colspan="2" class="selection-control" id="previousNav"><div class="direction-arrow"><i class="icon-arrow-left"></i></div></th>'+
                                '<th colspan="3" class="selection-control" id="currentNav">%todayMessage%</th>'+
                                '<th colspan="2" class="selection-control" id="nextNav"><div class="direction-arrow"><i class="icon-arrow-right"></i></div></th>'+
                            '</tfoot>'+
                        '</table>'+
                    '',

        daysPerMonthArr = [31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31],

        currentDateMarker = new Date();

    // The actual component's construction function
    function ComponentHandler( targetElement, configOptions ) {
        this.targetElement = $(targetElement);

        // jQuery offers an `extend` method to merge properties from multiple
        // objects into the first one. We typically use an empty object as
        // the first argument to avoid modifying the base settings for
        // subsequent instances of this component.
        this.configOptions = $.extend( {}, baseSettings, configOptions) ;

        this._baseSettings = baseSettings;
        this._componentId = componentId;

        this.initialize();
    }

    ComponentHandler.prototype.initialize = function () {
        // Place all setup and initial logic here.
        // The DOM target and configuration options are already accessible
        // via the instance, e.g., this.targetElement and this.configOptions.
        this.startOfWeekIndex = this.configOptions.startOfWeekIndex || 1;
        this.dayAbbreviations = this.configOptions.dayAbbreviations;
        this.monthNames = this.configOptions.monthNames;
        this.todayMessage = this.configOptions.todayMessage;        
        this.eventHeaderMsg = this.configOptions.eventHeaderMsg;
        this.eventData = this.configOptions.eventData;

        this.displayWidget = $(markupStructure.replace("%todayMessage%",this.todayMessage)).appendTo(this.targetElement).on({
                                click: $.proxy(this.handleInteraction, this)
                        });

        this.activeDateRef = new Date();

        var moment = new Date();
        this.currentMonthIdx = moment.getMonth();
        this.currentYearVal = moment.getFullYear();

        var firstOfMonth = new Date(this.currentYearVal, this.currentMonthIdx, 1);
        this.prevYearVal = firstOfMonth.getFullYear();
        this.nextYearVal = firstOfMonth.getFullYear();


        if (this.triggerElement){
            this.triggerElement.on('click', $.proxy(this.revealWidget, this));
        } else {
            this.targetElement.on('click', $.proxy(this.revealWidget, this));
        }

        this.displayCalendarGrid(moment);
    };

    ComponentHandler.prototype.displayOccurrences = function (occurrenceList, targetDisplay) {
        var activeDateRef = this.activeDateRef;
        var eventHeaderMsg = this.eventHeaderMsg;
        for(var i=1; i<=daysPerMonthArr[activeDateRef.getMonth()]; i++){
            $.each(occurrenceList.singleEvent, function(){
                var currentYear = 1900 + activeDateRef.getYear();
                var currentMonth = activeDateRef.getMonth();

                var displayDate = new Date(currentYear, currentMonth, i, 0,0,0,0);
                var itemDate = new Date(this.date);

                if( itemDate.getDate() == displayDate.getDate()
                    && itemDate.getMonth() == displayDate.getMonth()
                    && itemDate.getFullYear() == displayDate.getFullYear()

                ){
                    targetDisplay.parent('div:first').find('#dayCell_' + i)
                    .removeClass("daily-cell")
                    .addClass('holiday-event')
                    .empty()
                    .append('<span class="weekday-label">' +i+ '</span>')
                    .popover({
                        'title': eventHeaderMsg,
                        'content': 'You have ' +this.description+ ' items',
                        'delay': { 'show': 250, 'hide': 250 }
                    });
                }
            });
        }
    };

    ComponentHandler.prototype.fetchOccurrences = function () {
        if(!(this.eventData === null)){
            if(typeof this.eventData == 'function'){
                this.displayOccurrences(this.eventData.apply(this, []), this.displayWidget);
            }
        }
    };

    ComponentHandler.prototype.displayCalendarGrid = function (viewDate) {
        var firstOfMonth = new Date(this.currentYearVal, this.currentMonthIdx, 1);

        this.targetElement.parent('div:first').find('.year-display').empty();
        this.targetElement.parent('div:first').find('.month-display').empty();

        this.targetElement.parent('div:first').find('.year-display').append(firstOfMonth.getFullYear());
        this.targetElement.parent('div:first').find('.month-display').append(this.monthNames[firstOfMonth.getMonth()]);

        if(this.checkLeapYear(viewDate.getYear())){
            daysPerMonthArr[1] = 29;
        }else{
            daysPerMonthArr[1] = 28;
        }

        this.displayWidget.find('.grid-header').empty();
        this.displayWidget.find('.grid-body').empty();

        // Render Day of Week labels
        this.drawDayHeaders();

        var firstDayOfMonthIndex = firstOfMonth.getDay(); // Index of the first day of the month

        // Render individual day cells
        var dayCounter = 0;
        var dayIterator = 0;
        var lastDayMarker = 0;
        for(var i=0; i>=lastDayMarker; i++){

            var rowHtmlString = "";

            for(var j=this.startOfWeekIndex; j<this.dayAbbreviations.length + this.startOfWeekIndex; j++){

                var cssClass = "";
                var statusMsg = "";
                var cellId = "";

                // Determine if we have reached the first day of the current month
                if(dayIterator >= daysPerMonthArr[firstOfMonth.getMonth()]){
                    dayCounter = 0;
                }else if(((dayCounter%7)>0 && (dayIterator%7)>0) || ((j%7)==(firstDayOfMonthIndex%7))){
                    dayCounter++;
                    dayIterator++;
                }

                // Identify the last day of the month
                if(dayCounter==daysPerMonthArr[firstOfMonth.getMonth()]){
                    lastDayMarker = daysPerMonthArr[firstOfMonth.getMonth()];
                }

                // Assign appropriate CSS class
                if(cssClass.length == 0){
                    if(
                        currentDateMarker.getDate() == viewDate.getDate()
                        && dayCounter == viewDate.getDate()
                        && currentDateMarker.getMonth() == viewDate.getMonth()
                        && currentDateMarker.getFullYear() == viewDate.getFullYear()

                    ){
                        cssClass = "today-highlight";
                    }else if(j%7 == 0 || j%7 == 6){
                        cssClass = "daily-cell weekend-cell";
                    }else{
                        cssClass = "daily-cell";
                    }
                }

                // Set unique identifier for the cell
                cellId = "dayCell_" + dayCounter;

                var adjustedMonth = viewDate.getMonth() + 1;
                var currentYear = viewDate.getFullYear();

                // Construct cell HTML
                if(dayCounter == 0){
                    rowHtmlString += '<td>&nbsp;</td>';
                }else if(statusMsg.length > 0){
                    rowHtmlString += '<td class="' +cssClass+ '" id="'+cellId+'" year-attr="' + currentYear + '" month-attr="' + adjustedMonth + '" day-attr="' + dayCounter + '"><span class="weekday-label">' +dayCounter+ '</span></td>';
                }else{
                    rowHtmlString += '<td class="' +cssClass+ '" id="'+cellId+'" year-attr="' + currentYear + '" month-attr="' + adjustedMonth + '" day-attr="' + dayCounter + '">' +dayCounter+ '</td>';
                }

            }
            rowHtmlString = "<tr>" +rowHtmlString+ "</tr>";
            this.displayWidget.find('.grid-body').append(rowHtmlString);
        }
        this.fetchOccurrences();
    };

    ComponentHandler.prototype.drawDayHeaders = function () {
        var headerHtml = '';
        for(var j=this.startOfWeekIndex; j<this.startOfWeekIndex + 7; j++){
            headerHtml += "<th>" +this.dayAbbreviations[j%7]+ "</th>";
        }

        var headerRowContent = "<tr>" +headerHtml+ "</tr>";
        this.displayWidget.find('.grid-header').append(headerRowContent);
    };

    ComponentHandler.prototype.handleInteraction = function (eventObject) {
        eventObject.stopPropagation();
            eventObject.preventDefault();
            var clickedTarget = $(eventObject.target).closest('td, th');

            if (clickedTarget.length == 1) {
                var eventDay, eventMonth, eventYear;
                switch(clickedTarget[0].nodeName.toLowerCase()) {
                    case 'td':
                        if (clickedTarget.is('.daily-cell')){
                            eventDay = parseInt(clickedTarget.attr('day-attr'), 10)||1;
                            eventMonth = parseInt(clickedTarget.attr('month-attr'), 10)||1;
                            eventYear = parseInt(clickedTarget.attr('year-attr'), 10)||1;

                            this.targetElement.trigger({
                                type: 'dateSelection',
                                day: eventDay,
                                month: eventMonth,
                                year: eventYear
                            });
                        }else if(clickedTarget.is('.holiday-event')){
                            eventDay = parseInt(clickedTarget.attr('day-attr'), 10)||1;
                            eventMonth = parseInt(clickedTarget.attr('month-attr'), 10)||1;
                            eventYear = parseInt(clickedTarget.attr('year-attr'), 10)||1;

                            this.targetElement.trigger({
                                type: 'eventTriggered',
                                day: eventDay,
                                month: eventMonth,
                                year: eventYear
                            });
                        }else if(clickedTarget.is('.today-highlight')){
                            eventDay = parseInt(clickedTarget.attr('day-attr'), 10)||1;
                            eventMonth = parseInt(clickedTarget.attr('month-attr'), 10)||1;
                            eventYear = parseInt(clickedTarget.attr('year-attr'), 10)||1;

                            this.targetElement.trigger({
                                type: 'dateSelection',
                                day: eventDay,
                                month: eventMonth,
                                year: eventYear
                            });
            }
                        break;
                    case 'th':
                        if (clickedTarget.is('.selection-control')){
                            switch(clickedTarget.attr("id")){
                                case 'previousNav':
                                    this.adjustDisplayDate('previous');
                                    var previousMonthDate = new Date(this.prevYearVal, this.currentMonthIdx, 1);
                                    this.activeDateRef = previousMonthDate;
                                    this.displayCalendarGrid(previousMonthDate, this.eventData);
                                    this.targetElement.trigger({
                                        type: 'previousMonthNav'
                                    });
                                    break;
                                case 'currentNav':
                                    this.adjustDisplayDate('present');
                                    var presentMoment = new Date();
                                    this.activeDateRef = presentMoment;
                                    this.displayCalendarGrid(presentMoment, this.eventData);
                                    this.targetElement.trigger({
                                        type: 'currentMonthNav'
                                    });
                                    break;
                                case 'nextNav':
                                    this.adjustDisplayDate('next');
                                    var nextMonthDate = new Date(this.nextYearVal, this.currentMonthIdx, 1);
                                    this.activeDateRef = nextMonthDate;
                                    this.displayCalendarGrid(nextMonthDate, this.eventData);
                                    this.targetElement.trigger({
                                        type: 'nextMonthNav'
                                    });
                                    break;
                                default:
                                    break;
                            }
                        }
                        break;
                    break;
                default:
                        break;
                }
            }
    };

    ComponentHandler.prototype.adjustDisplayDate = function (navAction) {
        var currentMoment = new Date();

        switch(navAction){
            case 'previous':
                currentMoment = new Date(this.currentYearVal, this.currentMonthIdx-1, 1);
                break;
            case 'next':
                currentMoment = new Date(this.currentYearVal, this.currentMonthIdx+1, 1);
                break;
            case 'present':
                break;
            default:
                break;
        }

        this.currentMonthIdx = currentMoment.getMonth();
        this.currentYearVal = currentMoment.getFullYear();

        var firstOfMonth = new Date(this.currentYearVal, this.currentMonthIdx, 1);
        this.prevYearVal = firstOfMonth.getFullYear();
        this.nextYearVal = firstOfMonth.getFullYear();
    };

    ComponentHandler.prototype.checkLeapYear = function (testYear) {
        return (((testYear % 4 === 0) && (testYear % 100 !== 0)) || (testYear % 400 === 0))
    };

    // A lightweight wrapper for the constructor, preventing multiple
    // instantiations of the same component on a single element.
    $.fn[componentId] = function ( settings ) {
        return this.each(function () {
            if (!$.data(this, 'widget_' + componentId)) {
                $.data(this, 'widget_' + componentId,
                new ComponentHandler( this, settings ));
            }
        });
    }

})( jQuery, window, document, undefined );