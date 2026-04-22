/*
* This script manages temporal interval selection.
* Authored by a skilled developer, it provides dynamic date range functionality.
* Released under a permissive license for broad use.
*/
!function (jQuery) {

  var IntervalSelector = function (targetElement, configSettings, callbackFunction) {
    var hasConfiguration = typeof configSettings === 'object';
    var regionalSettings;

    // Default configuration values
    this.initialDate = timeframe().startOf('day');
    this.finalDate = timeframe().startOf('day');
    this.earliestDate = false;
    this.latestDate = false;
    this.dateConstraint = false;

    this.displayDropdowns = false;
    this.displayWeekNumbers = false;
    this.timeSelectionEnabled = false;
    this.timeStepInterval = 30;
    this.use12HourFormat = true;
    this.presetIntervals = {};
    this.openingDirection = 'right';

    this.controlClasses = ['btn', 'btn-sm'];
    this.acceptClass = 'btn-success';
    this.rejectClass = 'btn-secondary';

    this.dateFormat = 'DD/MM/YYYY';
    this.dateSeparator = ' to ';

    this.localization = {
      confirmLabel: 'Confirm',
      discardLabel: 'Discard',
      beginLabel: 'Start',
      endLabel: 'Finish',
      wkLabel: 'Wk',
      customIntervalLabel: 'Custom Period',
      weekDayNames: timeframe()._language._shortWeekdays.slice(),
      shortMonthNames: timeframe()._language._abbreviatedMonths.slice(),
      startOfWeekDay: 0
    };

    this.completionHandler = function () {
    };

    // The primary container for the selector is appended to the body by default
    this.parentElement = 'body';

    // The HTML element that initiated this selector
    this.triggerElement = jQuery(targetElement);

    if (this.triggerElement.hasClass('pull-right')) {
      this.openingDirection = 'left';
    }

    if (this.triggerElement.is('input')) {
      this.triggerElement.on({
        click: jQuery.proxy(this.displayPicker, this),
        focus: jQuery.proxy(this.displayPicker, this)
      });
    } else {
      this.triggerElement.on('click', jQuery.proxy(this.displayPicker, this));
    }

    regionalSettings = this.localization;

    if (hasConfiguration) {
      if (typeof configSettings.locale === 'object') {
        jQuery.each(regionalSettings, function (propKey, propValue) {
          regionalSettings[propKey] = configSettings.locale[propKey] || propValue;
        });
      }

      if (configSettings.applyClass) {
        this.acceptClass = configSettings.applyClass;
      }

      if (configSettings.cancelClass) {
        this.rejectClass = configSettings.cancelClass;
      }
    }

    var SelectorTemplate = '<div class="time-interval-picker menu-dropdown">' +
            '<div class="calendar-display panel-left"></div>' +
            '<div class="calendar-display panel-right"></div>' +
            '<div class="interval-options">' +
              '<div class="input-controls">' +
                '<div class="start-date-input" style="float: left; padding-right: 5px;">' +
                  '<label for="interval_start_input">' + this.localization.beginLabel + '</label>' +
                  '<input class="input-small-field" type="text" name="interval_start_input" value="" readonly="readonly" />' +
                '</div>' +
                '<div class="end-date-input" style="float: left; padding-left: 5px;">' +
                  '<label for="interval_end_input">' + this.localization.endLabel + '</label>' +
                  '<input class="input-small-field" type="text" name="interval_end_input" value="" readonly="readonly" />' +
                '</div>' +
                '<button class="' + this.acceptClass + ' accept-button" disabled="disabled">' + this.localization.confirmLabel + '</button>&nbsp;' +
                '<button class="' + this.rejectClass + ' discard-button">' + this.localization.discardLabel + '</button>' +
              '</div>' +
            '</div>' +
          '</div>';

    this.parentElement = (hasConfiguration && configSettings.parentEl && jQuery(configSettings.parentEl)) || jQuery(this.parentElement);
    // Append the main selector UI to its designated parent element
    this.mainContainer = jQuery(SelectorTemplate).appendTo(this.parentElement);

    if (hasConfiguration) {

      if (typeof configSettings.format === 'string') {
        this.dateFormat = configSettings.format;
      }

      if (typeof configSettings.separator === 'string') {
        this.dateSeparator = configSettings.separator;
      }

      if (typeof configSettings.startDate === 'string') {
        this.initialDate = timeframe(configSettings.startDate, this.dateFormat);
      }

      if (typeof configSettings.endDate === 'string') {
        this.finalDate = timeframe(configSettings.endDate, this.dateFormat);
      }

      if (typeof configSettings.minDate === 'string') {
        this.earliestDate = timeframe(configSettings.minDate, this.dateFormat);
      }

      if (typeof configSettings.maxDate === 'string') {
        this.latestDate = timeframe(configSettings.maxDate, this.dateFormat);
      }

      if (typeof configSettings.startDate === 'object') {
        this.initialDate = timeframe(configSettings.startDate);
      }

      if (typeof configSettings.endDate === 'object') {
        this.finalDate = timeframe(configSettings.endDate);
      }

      if (typeof configSettings.minDate === 'object') {
        this.earliestDate = timeframe(configSettings.minDate);
      }

      if (typeof configSettings.maxDate === 'object') {
        this.latestDate = timeframe(configSettings.maxDate);
      }

      if (typeof configSettings.ranges === 'object') {
        for (var currentRange in configSettings.ranges) {
          if (!configSettings.ranges.hasOwnProperty(currentRange)) continue;

          var intervalStart = timeframe(configSettings.ranges[currentRange][0]);
          var intervalEnd = timeframe(configSettings.ranges[currentRange][1]);

          // Adjust range boundaries based on global min/max dates
          if (this.earliestDate && intervalStart.isBefore(this.earliestDate)) {
            intervalStart = timeframe(this.earliestDate);
          }

          if (this.latestDate && intervalEnd.isAfter(this.latestDate)) {
            intervalEnd = timeframe(this.latestDate);
          }

          // Exclude ranges that fall entirely outside the min/max constraints
          if ((this.earliestDate && intervalEnd.isBefore(this.earliestDate)) || (this.latestDate && intervalStart.isAfter(this.latestDate))) {
            continue;
          }

          this.presetIntervals[currentRange] = [intervalStart, intervalEnd];
        }

        var rangeListHTML = '<ul>';
        for (var currentRange in this.presetIntervals) {
          if (!this.presetIntervals.hasOwnProperty(currentRange)) continue;
          rangeListHTML += '<li>' + currentRange + '</li>';
        }
        rangeListHTML += '<li>' + this.localization.customIntervalLabel + '</li>';
        rangeListHTML += '</ul>';
        this.mainContainer.find('.interval-options').prepend(rangeListHTML);
      }

      if (typeof configSettings.dateLimit === 'object') {
        this.dateConstraint = configSettings.dateLimit;
      }

      // Update day names sequence according to the specified start of week
      if (typeof configSettings.locale === 'object') {
        if (typeof configSettings.locale.firstDay === 'number') {
          this.localization.startOfWeekDay = configSettings.locale.firstDay;
          var iterator = configSettings.locale.firstDay;
          while (iterator > 0) {
            this.localization.weekDayNames.push(this.localization.weekDayNames.shift());
            iterator--;
          }
        }
      }

      if (typeof configSettings.opens === 'string') {
        this.openingDirection = configSettings.opens;
      }

      if (typeof configSettings.showWeekNumbers === 'boolean') {
        this.displayWeekNumbers = configSettings.showWeekNumbers;
      }

      if (typeof configSettings.buttonClasses === 'string') {
        this.controlClasses = [configSettings.buttonClasses];
      }

      if (typeof configSettings.buttonClasses === 'object') {
        this.controlClasses = configSettings.buttonClasses;
      }

      if (typeof configSettings.showDropdowns === 'boolean') {
        this.displayDropdowns = configSettings.showDropdowns;
      }

      if (typeof configSettings.timePicker === 'boolean') {
        this.timeSelectionEnabled = configSettings.timePicker;
      }

      if (typeof configSettings.timePickerIncrement === 'number') {
        this.timeStepInterval = configSettings.timePickerIncrement;
      }

      if (typeof configSettings.timePicker12Hour === 'boolean') {
        this.use12HourFormat = configSettings.timePicker12Hour;
      }
    }

    // If time picker is not enabled, reset dates to start of day
    if (!this.timeSelectionEnabled) {
      this.initialDate = this.initialDate.startOf('day');
      this.finalDate = this.finalDate.startOf('day');
    }

    // Apply custom CSS classes to action buttons
    var mainPanel = this.mainContainer;
    jQuery.each(this.controlClasses, function (index, className) {
      mainPanel.find('button').addClass(className);
    });

    if (this.openingDirection === 'right') {
      // Swap the positions of the calendar panels
      var leftPanel = this.mainContainer.find('.calendar-display.panel-left');
      var rightPanel = this.mainContainer.find('.calendar-display.panel-right');
      leftPanel.removeClass('panel-left').addClass('panel-right');
      rightPanel.removeClass('panel-right').addClass('panel-left');
    }

    // If no specific ranges are provided, display calendars and reposition
    if (typeof configSettings === 'undefined' || typeof configSettings.ranges === 'undefined') {
      this.mainContainer.find('.calendar-display').show();
      this.repositionPicker();
    }

    // Assign the user-provided callback if available
    if (typeof callbackFunction === 'function') {
      this.completionHandler = callbackFunction;
    }

    this.mainContainer.addClass('opens' + this.openingDirection);

    // Attempt to parse dates from input field if it's a text input and no initial dates were set
    if (!hasConfiguration || (typeof configSettings.startDate === 'undefined' && typeof configSettings.endDate === 'undefined')) {
      if (jQuery(this.triggerElement).is('input[type=text]')) {
        var inputValue = jQuery(this.triggerElement).val();
        var dateParts = inputValue.split(this.dateSeparator);
        var firstDate, secondDate;
        if (dateParts.length === 2) {
          firstDate = timeframe(dateParts[0], this.dateFormat);
          secondDate = timeframe(dateParts[1], this.dateFormat);
        }
        if (firstDate != null && secondDate != null) {
          this.initialDate = firstDate;
          this.finalDate = secondDate;
        }
      }
    }

    // Store the initial state for comparison
    this.previousStartDate = this.initialDate.clone();
    this.previousEndDate = this.finalDate.clone();

    this.calendarLeft = {
      activeMonth: timeframe([this.initialDate.year(), this.initialDate.month(), 1, this.initialDate.hour(), this.initialDate.minute()]),
      monthGrid: []
    };

    this.calendarRight = {
      activeMonth: timeframe([this.finalDate.year(), this.finalDate.month(), 1, this.finalDate.hour(), this.finalDate.minute()]),
      monthGrid: []
    };

    // Event binding for various interactions
    this.mainContainer.on('mousedown', jQuery.proxy(this.handleMouseDown, this));
    this.mainContainer.find('.calendar-display').on('click', '.prev', jQuery.proxy(this.navigatePrevious, this));
    this.mainContainer.find('.calendar-display').on('click', '.next', jQuery.proxy(this.navigateNext, this));
    this.mainContainer.find('.interval-options').on('click', 'button.accept-button', jQuery.proxy(this.processAccept, this));
    this.mainContainer.find('.interval-options').on('click', 'button.discard-button', jQuery.proxy(this.processDiscard, this));

    this.mainContainer.find('.interval-options').on('click', '.start-date-input', jQuery.proxy(this.revealCalendars, this));
    this.mainContainer.find('.interval-options').on('click', '.end-date-input', jQuery.proxy(this.revealCalendars, this));

    this.mainContainer.find('.calendar-display').on('click', 'td.available', jQuery.proxy(this.selectSpecificDate, this));
    this.mainContainer.find('.calendar-display').on('mouseenter', 'td.available', jQuery.proxy(this.hoverDate, this));
    this.mainContainer.find('.calendar-display').on('mouseleave', 'td.available', jQuery.proxy(this.refreshDisplay, this));

    this.mainContainer.find('.interval-options').on('click', 'li', jQuery.proxy(this.selectRange, this));
    this.mainContainer.find('.interval-options').on('mouseenter', 'li', jQuery.proxy(this.hoverRange, this));
    this.mainContainer.find('.interval-options').on('mouseleave', 'li', jQuery.proxy(this.refreshDisplay, this));

    this.mainContainer.find('.calendar-display').on('change', 'select.yearselect', jQuery.proxy(this.adjustMonthYear, this));
    this.mainContainer.find('.calendar-display').on('change', 'select.monthselect', jQuery.proxy(this.adjustMonthYear, this));

    this.mainContainer.find('.calendar-display').on('change', 'select.hourselect', jQuery.proxy(this.adjustTime, this));
    this.mainContainer.find('.calendar-display').on('change', 'select.minuteselect', jQuery.proxy(this.adjustTime, this));
    this.mainContainer.find('.calendar-display').on('change', 'select.ampmselect', jQuery.proxy(this.adjustTime, this));

    this.triggerElement.on('keyup', jQuery.proxy(this.syncFromInput, this));

    this.refreshDisplay();
    this.refreshCalendars();

  };

  // Define methods for the IntervalSelector object
  IntervalSelector.prototype = {

    initializationMethod: IntervalSelector,

    handleMouseDown: function (eventObject) {
      eventObject.stopPropagation();
    },

    refreshDisplay: function () {
      this.calendarLeft.activeMonth.month(this.initialDate.month()).year(this.initialDate.year());
      this.calendarRight.activeMonth.month(this.finalDate.month()).year(this.finalDate.year());

      this.mainContainer.find('input[name=interval_start_input]').val(this.initialDate.format(this.dateFormat));
      this.mainContainer.find('input[name=interval_end_input]').val(this.finalDate.format(this.dateFormat));

      if (this.initialDate.isSame(this.finalDate) || this.initialDate.isBefore(this.finalDate)) {
        this.mainContainer.find('button.accept-button').removeAttr('disabled');
      } else {
        this.mainContainer.find('button.accept-button').attr('disabled', 'disabled');
      }
    },

    syncFromInput: function () {
      if (!this.triggerElement.is('input')) return;
      if (!this.triggerElement.val().length) return;

      var dateString = this.triggerElement.val().split(this.dateSeparator);
      var intervalStart = timeframe(dateString[0], this.dateFormat);
      var intervalEnd = timeframe(dateString[1], this.dateFormat);

      if (intervalStart == null || intervalEnd == null) return;
      if (intervalEnd.isBefore(intervalStart)) return;

      this.initialDate = intervalStart;
      this.finalDate = intervalEnd;

      this.triggerUpdate();
      this.refreshCalendars();
    },

    triggerUpdate: function () {
      this.refreshDisplay();
      this.completionHandler(this.initialDate, this.finalDate);
    },

    repositionPicker: function () {
      var parentOffset = {
        top: this.parentElement.offset().top - (this.parentElement.is('body') ? 0 : this.parentElement.scrollTop()),
        left: this.parentElement.offset().left - (this.parentElement.is('body') ? 0 : this.parentElement.scrollLeft())
      };
      if (this.openingDirection === 'left') {
        this.mainContainer.css({
          top: this.triggerElement.offset().top + this.triggerElement.outerHeight() - parentOffset.top,
          right: jQuery(window).width() - this.triggerElement.offset().left - this.triggerElement.outerWidth() - parentOffset.left,
          left: 'auto'
        });
        if (this.mainContainer.offset().left < 0) {
          this.mainContainer.css({
            right: 'auto',
            left: 9
          });
        }
      } else {
        this.mainContainer.css({
          top: this.triggerElement.offset().top + this.triggerElement.outerHeight() - parentOffset.top,
          left: this.triggerElement.offset().left - parentOffset.left,
          right: 'auto'
        });
        if (this.mainContainer.offset().left + this.mainContainer.outerWidth() > jQuery(window).width()) {
          this.mainContainer.css({
            left: 'auto',
            right: 0
          });
        }
      }
    },

    displayPicker: function (eventObject) {
      this.mainContainer.show();
      this.repositionPicker();

      if (eventObject) {
        eventObject.stopPropagation();
        eventObject.preventDefault();
      }

      jQuery(document).on('mousedown', jQuery.proxy(this.concealPicker, this));
      this.triggerElement.trigger('shown', {target: eventObject.target, picker: this});
    },

    concealPicker: function (eventObject) {
      this.mainContainer.hide();

      if (!this.initialDate.isSame(this.previousStartDate) || !this.finalDate.isSame(this.previousEndDate)) {
        this.triggerUpdate();
      }

      this.previousStartDate = this.initialDate.clone();
      this.previousEndDate = this.finalDate.clone();

      jQuery(document).off('mousedown', this.concealPicker);
      this.triggerElement.trigger('hidden', { picker: this });
    },

    hoverRange: function (eventObject) {
      var rangeLabel = eventObject.target.innerHTML;
      if (rangeLabel === this.localization.customIntervalLabel) {
        this.refreshDisplay();
      } else {
        var rangeDates = this.presetIntervals[rangeLabel];
        this.mainContainer.find('input[name=interval_start_input]').val(rangeDates[0].format(this.dateFormat));
        this.mainContainer.find('input[name=interval_end_input]').val(rangeDates[1].format(this.dateFormat));
      }
    },

    revealCalendars: function () {
      this.mainContainer.find('.calendar-display').show();
      this.repositionPicker();
    },

    updateInputElement: function () {
      if (this.triggerElement.is('input')) {
        this.triggerElement.val(this.initialDate.format(this.dateFormat) + this.dateSeparator + this.finalDate.format(this.dateFormat));
      }
    },

    selectRange: function (eventObject) {
      var rangeLabel = eventObject.target.innerHTML;
      if (rangeLabel === this.localization.customIntervalLabel) {
        this.revealCalendars();
      } else {
        var rangeDates = this.presetIntervals[rangeLabel];

        this.initialDate = rangeDates[0];
        this.finalDate = rangeDates[1];

        if (!this.timeSelectionEnabled) {
          this.initialDate.startOf('day');
          this.finalDate.startOf('day');
        }

        this.calendarLeft.activeMonth.month(this.initialDate.month()).year(this.initialDate.year()).hour(this.initialDate.hour()).minute(this.initialDate.minute());
        this.calendarRight.activeMonth.month(this.finalDate.month()).year(this.finalDate.year()).hour(this.finalDate.hour()).minute(this.finalDate.minute());
        this.refreshCalendars();

        this.updateInputElement();

        this.mainContainer.find('.calendar-display').hide();
        this.concealPicker();
      }
    },

    navigatePrevious: function (eventObject) {
      var currentCalendar = jQuery(eventObject.target).parents('.calendar-display');
      if (currentCalendar.hasClass('panel-left')) {
        this.calendarLeft.activeMonth.subtract('month', 1);
      } else {
        this.calendarRight.activeMonth.subtract('month', 1);
      }
      this.refreshCalendars();
    },

    navigateNext: function (eventObject) {
      var currentCalendar = jQuery(eventObject.target).parents('.calendar-display');
      if (currentCalendar.hasClass('panel-left')) {
        this.calendarLeft.activeMonth.add('month', 1);
      } else {
        this.calendarRight.activeMonth.add('month', 1);
      }
      this.refreshCalendars();
    },

    hoverDate: function (eventObject) {

      var cellTitle = jQuery(eventObject.target).attr('data-title');
      var gridRow = cellTitle.substr(1, 1);
      var gridCol = cellTitle.substr(3, 1);
      var currentCalendar = jQuery(eventObject.target).parents('.calendar-display');

      if (currentCalendar.hasClass('panel-left')) {
        this.mainContainer.find('input[name=interval_start_input]').val(this.calendarLeft.monthGrid[gridRow][gridCol].format(this.dateFormat));
      } else {
        this.mainContainer.find('input[name=interval_end_input]').val(this.calendarRight.monthGrid[gridRow][gridCol].format(this.dateFormat));
      }

    },
    // The following methods were not fully defined in the provided snippet but were referenced.
    // Minimal placeholder implementations are provided to maintain structural integrity.
    processAccept: function() {
        // Logic for confirming the selected date interval
        this.triggerUpdate();
        this.updateInputElement();
        this.concealPicker();
    },

    processDiscard: function() {
        // Logic for cancelling the date interval selection
        this.initialDate = this.previousStartDate.clone();
        this.finalDate = this.previousEndDate.clone();
        this.refreshDisplay();
        this.refreshCalendars();
        this.updateInputElement();
        this.concealPicker();
    },

    selectSpecificDate: function(eventObject) {
        // Logic for handling a user's click on a particular date cell
        var cellTarget = jQuery(eventObject.target);
        if (cellTarget.hasClass('available')) {
            // This would contain the complex logic for setting initialDate/finalDate
            // and updating the calendar state based on the clicked date.
            // For cloning, the presence and call structure are key.
            this.refreshDisplay();
            this.refreshCalendars();
        }
    },

    adjustMonthYear: function() {
        // Handler for changes in month or year dropdowns
        // This method would typically re-render the calendar grid.
        this.refreshCalendars();
    },

    adjustTime: function() {
        // Handler for changes in time (hour, minute, am/pm) dropdowns
        // This method would update the time component of the selected dates.
        this.refreshCalendars();
    },

    refreshCalendars: function() {
        // Core method to re-render and update both calendar display panels
        // based on the current initialDate, finalDate, and activeMonth states.
        // It's responsible for populating this.calendarLeft.monthGrid and this.calendarRight.monthGrid.
    }
  };

}(jQuery);