(function($) {
  /*
   * jQuery reference
   *
   * @see    http://jquery.com/
   * @name   jQuery
   * @class  jQuery Core Library
   */

  /*
   * jQuery 'fn' reference point for all public extension methods.
   *
   * @see         http://jquery.com/
   * @name        fn
   * @class       jQuery Library public method anchor
   * @memberOf    jQuery
   */

  /*
   *  Global namespace for all properties and functions related to the time picker.
   *
   *  @namespace   clockPicker
   *  @memberOf    jQuery
   */
  jQuery.clockPicker = {};

  jQuery.clockPicker.rev = "__BUILD_VERSION_NUMBER__";

  /*
   * The default settings for all calls to clockPicker. These can be
   * overridden for each individual call to {@link jQuery.fn.clockPicker}
   *
   * @type {Object} settings
   * @memberOf jQuery.clockPicker
   * @see jQuery.fn.clockPicker
   */
  jQuery.clockPicker.settings = {
    wrapperStyle: undefined,
    wrapperExtent: '22em',
    hourPrompt: 'Hour',
    minutePrompt: 'Minutes',
    applyButtonText: 'Select Time',
    triggerGraphic: undefined,
    showOnFocus: true,
    layerDepth: 10,
    beforePopupDisplay: undefined,
    afterPopupClose: undefined
  };

  /*
   * Internal function. Invoked when the document is ready to append the time
   * selection interface elements to the DOM.
   *
   * @private
   * @memberOf jQuery.clockPicker
   * @return {undefined}
   */
  jQuery.clockPicker._initializeClockUI = function() {
    jQuery(document).ready(
      function() {
        // If the HTML for the time picker is not yet present, add it now.
        if (!jQuery('#clockPickerPanel').length) {
          jQuery("body").append(
            '<div id="clockPickerPanel" class="clockPickerPanel">' +
            '        <div class="app-component app-content-box rounded-corners">' +
            '        <div class="app-header-bar rounded-corners">' +
            '            <div id="clockPanelCloseWrap" style="float: right;">' +
            '                <a href="javascript: void(0);" onclick="jQuery.clockPicker.hideClockPanel();" ' +
            '                        onmouseover="jQuery(this).removeClass(\'normal-state\').addClass(\'hover-state\');" ' +
            '                        onmouseout="jQuery(this).removeClass(\'hover-state\').addClass(\'normal-state\');"' +
            '                        class="rounded-corners normal-state">' +
            '                    <span class="app-icon app-icon-close">X</span>' +
            '                </a>' +
            '            </div>' +
            '            <div id="clockPanelUserTime" style="float: left;">' +
            '                <span id="clockPanelUserHour">1</span> : ' +
            '                <span id="clockPanelUserMinute">00</span> ' +
            '                <span id="clockPanelUserMeridiem">AM</span>' +
            '            </div>' +
            '            <br style="clear: both;" /><div></div>' +
            '        </div>' +
            '        <div class="app-content-box rounded-corners">' +
            '            <div>' +
            '                 <div class="clockHourMeridiemWrap">' +
            '                    <a class="clockHourButton normal-state" href="javascript: void(0);" ' +
            '                    >AM</a>' +
            '                    <a class="clockHourButton normal-state" href="javascript: void(0);" ' +
            '                    >PM</a>' +
            '                     <br style="clear: left;" /><div></div>' +
            '                 </div>' +
            '                 <div>' +
            '                    <div class="clockTimeColumn clockTimeColumnLeft">' +
            '					  	  <div class="clockTimeLabelsWrap">' +
            '                    		  <div class="clockLeftPane" style="text-align: center;" class="">Hour</div>' +
            '                		  </div>' +
            '                        <div class="app-content-box clockLeftPane">' +
            '                            <div class="clockHourButtonWrap">' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">1</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">2</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">3</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">4</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">5</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">6</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">7</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">8</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">9</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">10</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">11</a>' +
            '                                <a class="clockHourButton normal-state" href="javascript: void(0);">12</a>' +
            '                                <br style="clear: left;" /><div></div>' +
            '                            </div>' +
            '                        </div>' +
            '                    </div>' +
            '                    <div class="clockTimeColumn clockTimeColumnRight">' +
            '                        <div class="clockTimeLabelsWrap">' +
            '                            <div class="clockRightPane" style="text-align: center;">Minutes</div>' +
            '                        </div>' +
            '                        <div class="app-content-box clockRightPane">' +
            '                            <div class="clockMinuteButtonWrap">' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">00</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">05</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">10</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">15</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">20</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">25</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">30</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">35</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">40</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">45</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">50</a>' +
            '                                <a class="clockMinuteButton normal-state" href="javascript: void(0);">55</a>' +
            '                                <br style="clear: left;" /><div></div>' +
            '                            </div>' +
            '                        </div>' +
            '                    </div>' +
            '                </div>' +
            '            </div>' +
            '            <div style="clear: left;"></div>' +
            '        </div>' +
            '        <div id="clockSetButtonArea">' +
            '            <a href="javascript: void(0);" onclick="jQuery.clockPicker.applySelectedTime()"' +
            '                    onmouseover="jQuery(this).removeClass(\'normal-state\').addClass(\'hover-state\');" ' +
            '                        onmouseout="jQuery(this).removeClass(\'hover-state\').addClass(\'normal-state\');"' +
            '                        class="rounded-corners normal-state">' +
            '                SELECT' +
            '            </a>' +
            '            <br style="clear: both;" /><div></div>' +
            '        </div>' +
            '        <!--[if lte IE 6.5]>' +
            '            <iframe style="display:block; position:absolute;top: 0;left:0;z-index:-1;' +
            '                filter:Alpha(Opacity=\'0\');width:3000px;height:3000px"></iframe>' +
            '        <![endif]-->' +
            '    </div></div>'
          );

          var panelElement = jQuery('#clockPickerPanel');

          // Attach event handlers to the buttons within the panel
          panelElement.find('.clockMinuteButton')
            .on("click", function() {
              jQuery.clockPicker.setMinuteValue(jQuery(this).text());
            });

          panelElement.find('.clockHourButton')
            .on("click", function() {
              jQuery.clockPicker.setHourValue(jQuery(this).text());
            });

          jQuery(document).on('mousedown', jQuery.clockPicker._checkExternalClick);
        } //end if
      }
    );
  }(); // jQuery.clockPicker._initializeClockUI()


  /*
   * Updates the hour value displayed on the time picker popup.
   *
   * @private
   * @param  {String}   newHour   -   String indicating the hour. This can be a numeric hour
   *                                  or the string "AM" or "PM".
   * @return {undefined}
   *
   */
  jQuery.clockPicker.setHourValue = function(newHour) {
    if (newHour.toLowerCase() === "am" || newHour.toLowerCase() === "pm") {
      jQuery('#clockPanelUserMeridiem').empty().append(newHour);
    } else {
      jQuery('#clockPanelUserHour').empty().append(newHour);
    }
  }; // END setHourValue() function

  /*
   * Updates the minute value displayed on the time picker popup.
   *
   * @private
   * @param {String}    newMinute   - String indicating the minutes. This
   *                                  value corresponds to the text on the minute buttons.
   * @return {undefined}
   */
  jQuery.clockPicker.setMinuteValue = function(newMinute) {
    jQuery('#clockPanelUserMinute').empty().append(newMinute);
  }; // END setMinuteValue() function

  /*
   * Takes the time selected by the user and sets it as the value of the
   * input element that triggered the popup.
   *
   * @private
   * @return {undefined}
   */
  jQuery.clockPicker.applySelectedTime = function() {
    var timeValue = jQuery('#clockPanelUserHour').text() +
      ":" +
      jQuery('#clockPanelUserMinute').text() +
      " " +
      jQuery('#clockPanelUserMeridiem').text();

    var targetElement = jQuery(".isActiveClockInput");
    var originalTime = targetElement.val();
    targetElement.val(timeValue);
    if (timeValue !== originalTime) {
      targetElement.trigger('change');
    }
    this.hideClockPanel();

  }; // END applySelectedTime() function

  /*
   * Displays the time selection panel on the page, positioned directly
   * below the associated input field. It also applies custom styling
   * based on the input element's options.
   *
   * @private
   * @param {HTMLElement} inputField - The DOM element (input) for which the panel will
   *                                   be displayed.
   * @return {undefined}
   *
   */

  jQuery.clockPicker.displayClockPanel = function(inputField) {
    jQuery.clockPicker.hideClockPanel();
    jQuery(".isActiveClockInput").removeClass("isActiveClockInput");
    var panelDiv = jQuery("#clockPickerPanel");
    var currentInput = jQuery(inputField).eq(0).addClass("isActiveClockInput");
    var fieldOptions = currentInput.data("clockSettings");
    var panelPosition = currentInput.offset();
    panelPosition['z-index'] = fieldOptions.layerDepth;
    panelPosition.top = (panelPosition.top + currentInput.outerHeight());
    if (fieldOptions.wrapperExtent) {
      panelPosition.width = fieldOptions.wrapperExtent;
    }
    if (fieldOptions.wrapperStyle) {
      panelDiv.addClass(fieldOptions.wrapperStyle);
    }
    panelDiv.css(panelPosition);

    var currentHour = 1;
    var currentMinute = '00';
    var currentMeridiem = 'AM';
    if (currentInput.val()) {
      var timeRegex = /([0-9]{1,2}).*:.*([0-9]{2}).*(PM|AM)/i;
      var regexMatch = timeRegex.exec(currentInput.val());
      if (regexMatch) {
        currentHour = regexMatch[1] || 1;
        currentMinute = regexMatch[2] || '00';
        currentMeridiem = regexMatch[3] || 'AM';
      }
    }
    panelDiv.find("#clockPanelUserHour").empty().append(currentHour);
    panelDiv.find("#clockPanelUserMinute").empty().append(currentMinute);
    panelDiv.find("#clockPanelUserMeridiem").empty().append(currentMeridiem);
    panelDiv.find(".clockTimeLabelsWrap .clockLeftPane")
      .empty().append(fieldOptions.hourPrompt);
    panelDiv.find(".clockTimeLabelsWrap .clockRightPane")
      .empty().append(fieldOptions.minutePrompt);
    panelDiv.find("#clockSetButtonArea a").empty().append(fieldOptions.applyButtonText);
    if (fieldOptions.beforePopupDisplay) {
      fieldOptions.beforePopupDisplay(currentInput, panelDiv);
    }
    panelDiv.slideDown("fast");

  }; // END displayClockPanel()

  /*
   * Hides the time picker popup container.
   * @private
   * @param {Object} currentInputElement    -   Optional. The input field for which the
   *                                            container is being closed.
   * @return {undefined}
   */
  jQuery.clockPicker.hideClockPanel = function(currentInputElement) {
    var panelElement = jQuery("#clockPickerPanel");
    if (panelElement.is(":visible") === true) {

      // Special check for older IE versions to ensure visibility is actual
      if (jQuery.support.tbody === false) {
        if (!(panelElement[0].offsetWidth > 0) && !(panelElement[0].offsetHeight > 0)) {
          return;
        }
      }

      jQuery('#clockPickerPanel')
        .css("display", "none")
        .removeClass()
        .css("width", "");
      if (!currentInputElement) {
        currentInputElement = jQuery(".isActiveClockInput");
      }
      if (currentInputElement) {
        var fieldOptions = currentInputElement.removeClass("isActiveClockInput")
          .data("clockSettings");
        if (fieldOptions && fieldOptions.afterPopupClose) {
          fieldOptions.afterPopupClose(currentInputElement);
        }
      }
    }
    return;
  }; //end hideClockPanel()

  /*
   * Closes the time picker popup if the user clicks outside of the
   * input field or the time picker itself.
   *
   * @private
   * @param {jQueryEvent} eventObject -    Event passed in by jQuery
   * @return {undefined}
   */
  jQuery.clockPicker._checkExternalClick = function(eventObject) {
    if (!jQuery("#clockPickerPanel:visible").length) {
      return;
    }
    if (!jQuery(eventObject.target).closest("#clockPickerPanel").length &&
      jQuery(eventObject.target).not("input.isActiveClockInput").length) {
      jQuery.clockPicker.hideClockPanel();
    }

  }; // jQuery.clockPicker._checkExternalClick

  /*
   * FUNCTION: $().clockPicker()
   * Attaches a clockPicker widget to each matched element. Matched
   * elements must be input fields that accept a value.
   * Each element, when focused, will display a time selection
   * popoup where the user can define a time.
   *
   * @memberOf jQuery
   *
   * PARAMS:
   *
   * @param {Object}      [configuration] - An object containing the options for the time selection widget.
   *
   * @param {String}      [configuration.wrapperStyle=""] - A CSS class to be applied to the popup wrapper.
   *
   * @param {String}      [configuration.wrapperExtent=""] - CSS width for the container.
   *
   * @param {String}      [configuration.hourPrompt="Hours"] - Label text for the Hours section.
   *
   * @param {String}      [configuration.minutePrompt="Minutes"] - Label text for the Minutes container.
   *
   * @param {String}      [configuration.applyButtonText="Select Time"] - Label text for the Set button.
   *
   * @param {String}      [configuration.triggerGraphic=""] - The HTML element (e.g., img or text) to be appended next to each
   *      input field, which will display the time select widget upon
   *      click.
   *
   * @param {Integer}     [configuration.layerDepth=10] - Integer value for the popup widget's z-index.
   *
   * @param {Function}    [configuration.beforePopupDisplay=undefined] - Function to be called before the widget is made visible to the
   *      user. This function receives 2 arguments: 1) the input field as a
   *      jQuery object and 2) the popup widget as a jQuery object.
   *
   * @param {Function}    [configuration.afterPopupClose=undefined] - Function to be called after closing the popup widget. This function
   *      receives 1 argument: the input field as a jQuery object.
   *
   * @param {Boolean}     [configuration.showOnFocus=true] - True or False indicating if the popup is automatically displayed upon focus
   *      of the input field.
   *
   *
   * RETURN:
   * @return {jQuery} selection
   *
   *
   *
   * EXAMPLE:
   * @example
   *  $('#myTimeInput').clockPicker();
   *
   */
  jQuery.fn.clockPicker = function(configuration) {
    return this.each(function() {
      if (this.nodeName.toLowerCase() !== 'input') return;
      var currentField = jQuery(this);
      if (currentField.hasClass('hasClockPicker')) {
        return this;
      }
      var mergedSettings = {};
      mergedSettings = jQuery.extend(mergedSettings, jQuery.clockPicker.settings, configuration);
      currentField.addClass('hasClockPicker').data("clockSettings", mergedSettings);

      // Wrap the input field in a <div> element with
      // a unique id for later referencing.
      if (mergedSettings.triggerGraphic || !mergedSettings.showOnFocus) {
        var triggerLink = jQuery('<span>&nbsp;</span><a href="javascript:" onclick="' +
            'jQuery.clockPicker.displayClockPanel(jQuery(this).data(\'linkedElement\'));">' +
            mergedSettings.triggerGraphic + '</a>'
          )
          .data("linkedElement", currentField);
        currentField.after(triggerLink);
      }
      if (mergedSettings.showOnFocus) {
        currentField.focus(function() {
          jQuery.clockPicker.displayClockPanel(this);
        });
      }
      // Prevent mobile virtual keyboard from appearing.
      jQuery(this).on('focus click tap vclick', function(event) {
        event.stopImmediatePropagation();
        event.preventDefault();

        jQuery(this).blur();
      });
      jQuery(document).keypress(function(keyEvent) {
        var returnKeyCode = 13;
        if (keyEvent.which === returnKeyCode) {
          jQuery.clockPicker.applySelectedTime();
        }
      });
      return this;
    });
  }; // End of jQuery.fn.clockPicker

})(jQuery);