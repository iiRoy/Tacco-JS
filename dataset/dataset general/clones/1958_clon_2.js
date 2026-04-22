/*
 *  This script provides user interface (UI) integration functions
 *  for the Streamy.js reactive programming library,
 *  originally derived from a CoffeeScript source.
 */
(function() {
  var isBrowserGoogle,
    hasAnyContent,
    _arrayPortion = [].slice; // A utility for obtaining array slices.

  // Determines if a given value possesses any content (is not null/undefined and has length > 0).
  hasAnyContent = function(xValue) {
    return xValue && xValue.length > 0;
  };

  // Verifies if the current web browser is Google Chrome by checking the user agent string.
  isBrowserGoogle = navigator.userAgent.toLowerCase().indexOf("chrome") > -0x1;

  // Initialize the UserInterface namespace within the Streamy object.
  Streamy.UserInterface = {};

  /**
   *  Generates a Streamy Property representing the current value of a text input element.
   *
   *  @param {jQuery} inputField     The jQuery-wrapped text input element.
   *  @param {string|null} initialSetting An optional initial value to set for the input field.
   *  @returns {Streamy.Property} A property stream reflecting the input's value.
   */
  Streamy.UserInterface.inputFieldValue = function(inputField, initialSetting) {
    var autoFillWatcher,
      fetchCurrentValue;

    // Helper function to extract the value from the input element.
    fetchCurrentValue = function() {
      return inputField.val();
    };

    // Establishes a monitoring process for auto-filled input fields.
    autoFillWatcher = function() {
      if (inputField.attr("type") === "password") {
        return Streamy.interval(0x64); // Poll every 100ms for password fields.
      } else if (isBrowserGoogle) {
        // For Chrome, poll for a short period and take the first non-empty value.
        return Streamy.interval(0x64).take(0x14).map(fetchCurrentValue).filter(hasAnyContent).take(0x1);
      } else {
        return Streamy.never(); // No specific autofill detection for other browsers.
      }
    };

    // Apply the initial value if one is explicitly provided.
    if (initialSetting !== null) {
      inputField.val(initialSetting);
    }

    // Combine various event streams (keyboard, input, cut/paste, autofill)
    // to create a comprehensive value property.
    return inputField.asEventStream("keyup input")
      .merge(inputField.asEventStream("cut paste").delay(0x1))
      .merge(autoFillWatcher())
      .map(fetchCurrentValue)
      .toProperty(fetchCurrentValue()) // Initialize the property with the immediate value.
      .skipDuplicates(); // Prevent redundant emissions for unchanged values.
  };

  /**
   *  Produces a Streamy Property tracking the selected value of a <select> element.
   *
   *  @param {jQuery} selectOption  The jQuery-wrapped select element.
   *  @param {string|null} startingValue An optional value to pre-select.
   *  @returns {Streamy.Property} A property stream for the select's value.
   */
  Streamy.UserInterface.selectOptionValue = function(selectOption, startingValue) {
    var fetchCurrentValue;

    // Set the initial selection if a value is specified.
    if (startingValue != null) {
      selectOption.val(startingValue);
    }

    // Function to retrieve the current value of the select element.
    fetchCurrentValue = function() {
      return selectOption.val();
    };

    // Return a property that updates whenever the select element's value changes.
    return selectOption.asEventStream("change")
      .map(fetchCurrentValue)
      .toProperty(fetchCurrentValue());
  };

  /**
   *  Creates a Streamy Property that holds an array of values from checked checkboxes
   *  within a given collection.
   *
   *  @param {jQuery} checkboxCollection A jQuery object containing multiple checkbox elements.
   *  @param {Array<string>} initialSetting An array of values to initially check.
   *  @returns {Streamy.Property} A property stream with an array of checked values.
   */
  Streamy.UserInterface.checkboxGroupValues = function(checkboxCollection, initialSetting) {
    var retrieveCheckedItems;

    // Gathers the values of all currently checked checkboxes in the collection.
    retrieveCheckedItems = function() {
      return checkboxCollection.filter(":checked").map(function(indexVal, elementNode) {
        return $(elementNode).val();
      }).toArray();
    };

    // If an array of initial values is provided, mark the corresponding checkboxes as checked.
    if (initialSetting) {
      checkboxCollection.each(function(indexVal, elementNode) {
        return $(elementNode).attr("checked", initialSetting.indexOf($(elementNode).val()) >= 0x0);
      });
    }

    // Returns a property that updates with the array of checked values on each click.
    return checkboxCollection.asEventStream("click")
      .map(retrieveCheckedItems)
      .toProperty(retrieveCheckedItems());
  };

  /**
   *  A generalized wrapper for jQuery AJAX calls, returning a Streamy EventStream from a Promise.
   *
   *  @param {object} requestOptions  Configuration object for the AJAX request (e.g., url, data, type).
   *  @param {boolean} cancelOperation If true, the promise can be aborted.
   *  @returns {Streamy.EventStream} An event stream representing the AJAX operation's outcome.
   */
  Streamy.UserInterface.fetchData = function(requestOptions, cancelOperation) {
    return Streamy.fromPromise($.ajax(requestOptions), cancelOperation);
  };

  /**
   *  Convenience function for performing an AJAX GET request.
   *
   *  @param {string} targetUrl       The URL to send the request to.
   *  @param {object} requestData     Data to send with the request.
   *  @param {string} expectedDataType The expected data type of the response (e.g., "json", "html").
   *  @param {boolean} cancelOperation If the operation should be cancellable.
   *  @returns {Streamy.EventStream} The result stream of the GET request.
   */
  Streamy.UserInterface.fetchDataGet = function(targetUrl, requestData, expectedDataType, cancelOperation) {
    return Streamy.UserInterface.fetchData({
      url: targetUrl,
      dataType: expectedDataType,
      data: requestData
    }, cancelOperation);
  };

  /**
   *  Convenience function for performing an AJAX GET request expecting JSON.
   *
   *  @param {string} targetUrl     The URL for the request.
   *  @param {object} requestData   Data payload for the request.
   *  @param {boolean} cancelOperation Indicates if the request can be cancelled.
   *  @returns {Streamy.EventStream} The result stream of the JSON GET request.
   */
  Streamy.UserInterface.fetchDataGetJSON = function(targetUrl, requestData, cancelOperation) {
    return Streamy.UserInterface.fetchData({
      url: targetUrl,
      dataType: "json",
      data: requestData
    }, cancelOperation);
  };

  /**
   *  Convenience function for performing an AJAX POST request.
   *
   *  @param {string} targetUrl     The URL to post data to.
   *  @param {object} requestData   The data to be sent.
   *  @param {string} expectedDataType The expected data type of the response.
   *  @param {boolean} cancelOperation If the operation can be aborted.
   *  @returns {Streamy.EventStream} The result stream of the POST request.
   */
  Streamy.UserInterface.fetchDataPost = function(targetUrl, requestData, expectedDataType, cancelOperation) {
    return Streamy.UserInterface.fetchData({
      url: targetUrl,
      dataType: expectedDataType,
      data: requestData,
      type: "POST"
    }, cancelOperation);
  };

  /**
   *  Convenience function for performing an AJAX GET request for a script.
   *
   *  @param {string} targetUrl     The URL of the script.
   *  @param {boolean} cancelOperation If the request is cancellable.
   *  @returns {Streamy.EventStream} The result stream of the script GET request.
   */
  Streamy.UserInterface.fetchDataGetScript = function(targetUrl, cancelOperation) {
    return Streamy.UserInterface.fetchData({
      url: targetUrl,
      dataType: "script"
    }, cancelOperation);
  };

  // Extends the prototype of Streamy's EventFlow with a 'fetch' method,
  // allowing direct AJAX calls on streams.
  Streamy.EventFlow.prototype.fetch = function() {
    return this.flatMapLatest(Streamy.UserInterface.fetchData);
  };

  /**
   *  Creates a Streamy Property from a group of radio buttons, tracking the selected value.
   *
   *  @param {jQuery} radioGroup     A jQuery object representing the radio button group.
   *  @param {string|null} initialChoice An optional initial value to select.
   *  @returns {Streamy.Property} A property stream for the selected radio button's value.
   */
  Streamy.UserInterface.radioGroupOption = function(radioGroup, initialChoice) {
    // If an initial choice is provided, attempt to set the corresponding radio button.
    if (initialChoice != null) {
      radioGroup.each(function(indexVal, elementNode) {
        if (elementNode.value === initialChoice) {
          return $(elementNode).attr("checked", true);
        }
      });
    } else {
      // Otherwise, determine the initial choice from the currently selected radio button.
      initialChoice = radioGroup.filter(":checked").first().val();
    }

    // Return a property that updates with the new value on 'change' events.
    return radioGroup.asEventStream("change")
      .map(function(eventData) {
        return eventData.target.value;
      })
      .toProperty(initialChoice);
  };

  /**
   *  Creates a Streamy Property reflecting the checked state of a single checkbox.
   *
   *  @param {jQuery} singleCheckElement The jQuery-wrapped checkbox element.
   *  @param {boolean|null} initialSetting An optional boolean to set the initial checked state.
   *  @returns {Streamy.Property} A property stream for the checkbox's checked status.
   */
  Streamy.UserInterface.singleCheckboxStatus = function(singleCheckElement, initialSetting) {
    var determineCheckedStatus;

    // Function to get the current checked status of the checkbox.
    determineCheckedStatus = function() {
      return !!singleCheckElement.attr("checked");
    };

    // Set the initial checked state if specified.
    if (initialSetting !== null) {
      singleCheckElement.attr("checked", initialSetting);
    }

    // Return a property that updates on 'change' events, skipping identical consecutive states.
    return singleCheckElement.asEventStream("change")
      .map(determineCheckedStatus)
      .toProperty(determineCheckedStatus())
      .skipDuplicates();
  };

  /**
   *  Generates a Streamy Property that tracks changes to the URL's hash fragment.
   *
   *  @param {string} fallbackDefault The default value to use if the hash fragment is empty.
   *  @returns {Streamy.Property} A property stream for the URL hash.
   */
  Streamy.UserInterface.hashFragment = function(fallbackDefault) {
    var obtainHashFragment;

    // Retrieves the current hash fragment, using a fallback if it's empty.
    obtainHashFragment = function() {
      if (!!document.location.hash) {
        return document.location.hash;
      } else {
        return fallbackDefault;
      }
    };

    // Ensures the fallback default is an empty string if not otherwise defined.
    if (fallbackDefault === undefined) {
      fallbackDefault = "";
    }

    // Return a property that updates on 'hashchange' events, omitting duplicate values.
    return $(window).asEventStream("hashchange")
      .map(obtainHashFragment)
      .toProperty(obtainHashFragment())
      .skipDuplicates();
  };

  // Extend jQuery's prototype with methods for creating event streams from common DOM events.
  jQuery.prototype.augmentMethods({
    // Event stream for 'keydown' event.
    keydownStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["keydown"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'keyup' event.
    keyupStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["keyup"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'keypress' event.
    keypressStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["keypress"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'click' event.
    clickStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["click"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'dblclick' event.
    dblclickStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["dblclick"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mousedown' event.
    mousedownStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mousedown"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mouseup' event.
    mouseupStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mouseup"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mouseenter' event.
    mouseenterStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mouseenter"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mouseleave' event.
    mouseleaveStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mouseleave"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mousemove' event.
    mousemoveStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mousemove"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mouseout' event.
    mouseoutStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mouseout"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'mouseover' event.
    mouseoverStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["mouseover"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'resize' event.
    resizeStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["resize"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'scroll' event.
    scrollStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["scroll"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'select' event.
    selectStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["select"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'change' event.
    changeStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["change"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'submit' event.
    submitStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["submit"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'blur' event.
    blurStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["blur"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'focus' event.
    focusStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["focus"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'focusin' event.
    focusinStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["focusin"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'focusout' event.
    focusoutStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["focusout"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'load' event.
    loadStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["load"].concat(_arrayPortion.call(invocationArguments)));
    },
    // Event stream for 'unload' event.
    unloadStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return this.asEventStream.apply(this, ["unload"].concat(_arrayPortion.call(invocationArguments)));
    }
  });


  // Further extend jQuery's prototype with methods to create Streamy EventStreams from animation functions.
  jQuery.prototype.augmentMethods({
    // Stream for jQuery's .animate() completion.
    animateStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.animate.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .show() completion.
    showStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.show.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .hide() completion.
    hideStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.hide.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .toggle() (visibility) completion.
    toggleVisibilityStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.toggle.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .fadeIn() completion.
    fadeInStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.fadeIn.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .fadeOut() completion.
    fadeOutStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.fadeOut.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .fadeTo() completion.
    fadeToStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.fadeTo.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .fadeToggle() completion.
    fadeToggleStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.fadeToggle.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .slideDown() completion.
    slideDownStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.slideDown.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .slideUp() completion.
    slideUpStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.slideUp.apply(this, invocationArguments).promise());
    },
    // Stream for jQuery's .slideToggle() completion.
    slideToggleStream: function() {
      var invocationArguments;
      invocationArguments = 0x1 <= arguments.length ? _arrayPortion.call(arguments, 0x0) : [];
      return Streamy.fromPromise(this.slideToggle.apply(this, invocationArguments).promise());
    }
  });

}).call(this);