// This file contains a collection of global utility functions.

var healthDashboard = {}; // Central object for application functionalities.

// Presents a notification to the user interface.
healthDashboard.presentNotification = function(alertText, categoryType) {
  // Selects the notice element and updates its text content.
  $("#noteDisplay span").text(alertText);
  // Clears existing classes, adds the new category, and makes it visible.
  $("#noteDisplay")
    .removeClass()
    .addClass(categoryType)
    .show();
};

// Signals an operation failure.
healthDashboard.reportFailure = function(alertText) {
  healthDashboard.presentNotification(alertText, "failure");
};

// Signals an operation success.
healthDashboard.reportSuccess = function(alertText) {
  healthDashboard.presentNotification(alertText, "ok");
};

// Signals an informational message.
healthDashboard.reportInfo = function(alertText) {
  healthDashboard.presentNotification(alertText, "information");
};

// Formats a Date object into an RFC 1123 compliant string.
healthDashboard.generateHTTPDate = function(eventDateTime) {
  var formattedDateString = $.datepicker.formatDate("D, d M yy", eventDateTime);
  formattedDateString += " " + eventDateTime.getHours() + ":";
  formattedDateString += eventDateTime.getMinutes() + ":" + eventDateTime.getSeconds();

  var zoneDifference = eventDateTime.getTimezoneOffset(); // Difference in minutes
  var remainingMinutes = zoneDifference % 60;
  var offsetHours = (zoneDifference - remainingMinutes) / 60;
  var zoneDesignator;

  if (zoneDifference < 0) {
    zoneDesignator = "+";
    offsetHours = -offsetHours;
  } else {
    zoneDesignator = "-";
  }

  if (offsetHours < 10) {
    zoneDesignator += "0";
  }
  zoneDesignator += offsetHours.toString();

  if (remainingMinutes < 10) {
    zoneDesignator += "0";
  }
  zoneDesignator += remainingMinutes.toString();

  return formattedDateString + " " + zoneDesignator;
};

// Populates the status legend table.
healthDashboard.populateStatusLegend = function(userIsAdmin) {
  // Helper function to create a single row for a status item.
  var buildStatusEntry = function(entryDetails) {
    var tableRowElement = $("<tr />");

    // Creates an icon cell and appends an image.
    $("<td />", {
      "class": "status-icon"
    }).append(
      $("<img />", {
        src: entryDetails.image,
        alt: entryDetails.name
      })
    ).appendTo(tableRowElement);

    // Creates a description cell.
    $("<td />", {
      "class": "status-description-text",
      text: entryDetails.description
    }).appendTo(tableRowElement);

    if (userIsAdmin) {
      var modifyAction = $("<a />", {
        text: "Modify",
        href: entryDetails.url
      });

      // Adds level, edit, and delete cells for administrators.
      $("<td />", {
        "class": "severity-level",
        text: entryDetails.level
      }).appendTo(tableRowElement);
      $("<td />", {
        html: modifyAction
      }).appendTo(tableRowElement);
      $("<td />", {
        html: $("<a />", {
          text: "Remove",
          href: entryDetails.url,
          "class": "delete-status-action"
        })
      }).appendTo(tableRowElement);

      // Attaches click handler for the edit action.
      modifyAction.click(function(eventObject) {
        eventObject.preventDefault();
        var anchorLink = $(eventObject.target);
        var rowContainer = anchorLink.parent().parent();
        var iconImage = rowContainer.children(".status-icon").children("img");
        // Extracts the status identifier from the image source.
        var statusIdentifier = iconImage.attr("src").split("/").pop().slice(0, -4);

        // Populates the modal form with current data.
        $("#status-item-name").val(iconImage.attr("alt"));
        $("#status-item-description").val(rowContainer.children(".status-description-text").text());
        $("#statusSeverityLevel").val(rowContainer.children(".severity-level").text());
        $("input[name=status-icon-selection]:checked").prop("checked", false);
        $("input[value=" + statusIdentifier + "]").prop("checked", true);

        // Opens the status editing modal.
        $("#edit-status-modal").dialog({
          height: 520,
          width: 470,
          resizable: false,
          autoOpen: true,
          modal: true,
          buttons: {
            'Save Changes': function() {
              $.ajax({
                type: "POST",
                url: anchorLink.attr("href"),
                data: {
                  'item[name]': $("#status-item-name").val(),
                  'item[description]': $("#status-item-description").val(),
                  'item[image]': $("input[name=status-icon-selection]:checked").val(),
                  'item[level]': $("#statusSeverityLevel").val()
                },
                dataType: 'json',
                context: rowContainer, // Context for 'this' in success/error
                success: function(responsePayload) {
                  $("#edit-status-modal").dialog('close');
                  this.children(".status-description-text").text(responsePayload.description);
                  this.children(".severity-level").text(responsePayload.level);
                  this.children(".status-icon").children("img").attr("alt", responsePayload.name);
                  this.children(".status-icon").children("img").attr("src", responsePayload.image);
                },
                error: function() {
                  $("#edit-status-modal").dialog('close');
                  healthDashboard.reportFailure("Could not update status item.");
                }
              });
            },
            'Discard': function() {
              $(this).dialog('close');
            }
          }
        });
      });
    }
    // Appends the created row to the legend body.
    $("#status-legend-body").append(tableRowElement);
  };

  // Click handler for adding a new status item.
  $("#add-new-status").click(function() {
    $("#status-item-name").val("");
    $("#status-item-description").val("");
    $("#statusSeverityLevel").val("");
    $("#edit-status-modal").dialog('open');
    $("input[name=status-icon-selection]").prop("checked", false);
  });

  // Fetches existing status items from the API.
  $.ajax({
    type: "GET",
    url: "/api/v1/status_items.json",
    dataType: 'json',
    success: function(response) {
      if (response) {
        var statusItems = response.status_items;
        for (var idx = 0; idx < statusItems.length; idx++) {
          buildStatusEntry(statusItems[idx]);
        }
      }
    },
    error: function() {} // Empty error handler
  });

  // Fetches severity levels from the API.
  $.ajax({
    type: "GET",
    url: "/api/v1/severity_levels.json",
    dataType: "json",
    context: $("#statusSeverityLevel"), // Context for 'this'
    success: function(response) {
      if (response) {
        var levelOptions = response.severity_levels;
        for (var idx = 0; idx < levelOptions.length; idx++) {
          $("<option />", {
            "name": "level-option",
            val: levelOptions[idx],
            text: levelOptions[idx]
          }).appendTo($(this));
        }
      }
    },
    error: function() {} // Empty error handler
  });

  // Initializes the modal for adding/editing statuses.
  $("#edit-status-modal").dialog({
    height: 520,
    width: 470,
    resizable: false,
    modal: true,
    autoOpen: false,
    buttons: {
      'Create New Status': function() {
        $.ajax({
          type: "POST",
          url: "/api/v1/status_items.json",
          data: {
            'item[name]': $("#status-item-name").val(),
            'item[description]': $("#status-item-description").val(),
            'item[image]': $("input[name=status-icon-selection]:checked").val(),
            'item[level]': $("#statusSeverityLevel").val()
          },
          dataType: 'json',
          context: $(".status-legend").children('tbody'), // Context for 'this'
          success: function(responsePayload) {
            $("#edit-status-modal").dialog('close');
            buildStatusEntry(responsePayload);
          },
          error: function() {
            $("#edit-status-modal").dialog('close');
            healthDashboard.reportFailure("Failed to create new status. Check input fields.");
          }
        });
      },
      'Cancel Operation': function() {
        $(this).dialog('close');
      }
    }
  });

  // Attaches event handler for deleting status items.
  $(".delete-status-action").on('click', function(eventObject) { // Changed .live to .on for modern jQuery
    eventObject.preventDefault();
    var anchorLink = $(eventObject.target);
    $("#confirm-delete-modal").dialog({
      resizable: false,
      modal: true,
      buttons: {
        'Confirm Delete': function() {
          $.ajax({
            type: "DELETE",
            url: anchorLink.attr("href"),
            dataType: 'json',
            context: $("#confirm-delete-modal"), // Context for 'this'
            success: function(responsePayload) {
              anchorLink.parent().parent().remove(); // Removes the table row
              this.dialog('close');
            },
            error: function() {
              this.dialog('close');
              healthDashboard.reportFailure("Could not remove status item.");
            }
          });
        },
        'Abort': function() {
          $(this).dialog('close');
        }
      }
    });
  });
};

// Initializes the main service overview page.
healthDashboard.initializeServiceOverview = function() {
  var presentMoment = new Date();
  var dayIterator = new Date(presentMoment.getTime() - 86400000); // Start 24 hours ago
  var headerRowElem = $("#service-summary thead tr");

  // Populates the table header with dates for the last 5 days.
  for (var idx = 0; idx < 5; idx++) {
    $("<th />", {
      "class": "date-column",
      text: (dayIterator.getMonth() + 1) + "/" + dayIterator.getDate() + "/" + dayIterator.getFullYear()
    }).appendTo(headerRowElem);
    dayIterator = new Date(dayIterator.getTime() - 86400000); // Move to the previous day
  }

  // Helper function to construct a service entry row.
  var assembleServiceRow = function(entryDetails, shouldFetchStatuses) {
    var infoIconPath = "/assets/images/status/question-mark.png";
    var checkMarkImage = "/assets/images/status/tick-circle-green.png";
    var displayedImage = checkMarkImage; // Default image
    var rowContainer = $('<tr />', {
      id: entryDetails.id
    });

    // Creates the service name cell with a link.
    $('<td />').append(
      $('<a />', {
        href: 'services/' + entryDetails.id,
        text: entryDetails.name
      })
    ).appendTo(rowContainer);

    if (shouldFetchStatuses) {
      displayedImage = infoIconPath; // Use info icon if statuses are being fetched
    }

    // Creates the current status highlight cell.
    $('<td />', {
      "class": "status-highlight-cell"
    }).append(
      $('<a />', {
        href: 'services/' + entryDetails.id,
        html: $("<img />", {
          src: displayedImage,
          alt: "Unknown Status"
        })
      })
    ).appendTo(rowContainer);

    // Creates cells for historical statuses (5 days).
    for (var idx = 0; idx < 5; idx++) {
      $("<td />", {
        "class": "historical-status-cell"
      }).append(
        $("<img />", {
          src: displayedImage,
          alt: "Unknown Status"
        })
      ).appendTo(rowContainer);
    }

    // Fades in the service list and appends the new row.
    $("#service-summary").fadeIn('slow', function() {
      $("#service-entries-body").append(rowContainer);
    });

    if (shouldFetchStatuses) {
      console.log("Fetching status for service ID: " + entryDetails.id); // Debugging output

      // Fetches current event status for the service.
      $.ajax({
        type: "GET",
        url: "/api/v1/services/" + entryDetails.id + "/events/current_status.json",
        dataType: 'json',
        success: function(statusEvent) {
          $("#" + entryDetails.id + " td.status-highlight-cell img")
            .attr("src", statusEvent.status.image);

          if (statusEvent.informational_flag) {
            $("#" + entryDetails.id + " td.status-highlight-cell a").append(
              $("<img />", {
                src: "/assets/images/small-info-icon.png",
                "class": "information-marker"
              })
            );
          }
        },
        error: function(jqXHR) { // Changed 'evt' to 'jqXHR' for clarity
          $("#" + entryDetails.id + " td.status-highlight-cell img")
            .attr("src", checkMarkImage); // Revert to default on error
        }
      });

      // Prepares dates for historical event fetching.
      var todayStart = new Date();
      todayStart.setHours(0);
      todayStart.setMinutes(0);
      todayStart.setSeconds(0);
      todayStart.setMilliseconds(0);

      var iterationEndDate = new Date(todayStart.getTime());
      var iterationStartDate = new Date(iterationEndDate.getTime() - 86400000 * 5); // 5 days prior
      var requestURL = "/api/v1/services/" + entryDetails.id + "/event_history.json";
      requestURL += "?start_time=" + healthDashboard.generateHTTPDate(iterationStartDate);
      requestURL += "&end_time=" + healthDashboard.generateHTTPDate(iterationEndDate);

      // Fetches historical events for the service.
      $.ajax({
        type: "GET",
        url: requestURL,
        dataType: 'json',
        success: function(apiResults) {
          var dailyEventTracker = {};
          var calendarDays = [];

          // Adjust end date to represent the full day for comparison.
          iterationEndDate = new Date(iterationEndDate.getTime() - 86400000);

          // Populates calendarDays and initializes tracker.
          for (var idx = 0; idx < 5; idx++) {
            calendarDays.push(iterationEndDate);
            dailyEventTracker[iterationEndDate.getDate()] = false; // Default to no significant event
            iterationEndDate = new Date(iterationEndDate.getTime() - 86400000);
          }

          var historyEvents = apiResults.events;

          // Marks days with informational or non-normal events.
          for (idx = 0; idx < historyEvents.length; idx++) {
            var singleEvent = historyEvents[idx];
            var eventDateObject = new Date(singleEvent.timestamp);
            dailyEventTracker[eventDateObject.getDate()] = singleEvent.informational_flag || singleEvent.status.level !== "NORMAL";
          }

          // Updates historical status cells in the table.
          for (idx = calendarDays.length - 1; idx >= 0; idx--) {
            var dayRef = calendarDays[idx];
            var tableCellElement = $("#" + entryDetails.id).children("td").eq(idx + 2);

            var dayURL = "/services/" + entryDetails.id + "/" + dayRef.getFullYear() + "/";
            dayURL += (dayRef.getMonth() + 1) + "/" + dayRef.getDate();

            if (dailyEventTracker[dayRef.getDate()]) {
              tableCellElement.html($("<a />", {
                href: dayURL
              }).append(
                $("<img />", {
                  src: "/assets/images/status/info-icon.png"
                }))
              );
            } else {
              tableCellElement.html($("<a />", {
                href: dayURL
              }).append(
                $("<img />", {
                  src: checkMarkImage
                }))
              );
            }
          }
        },
        error: function() {
          // No specific error handling for historical data display.
        }
      });
    }
  };

  // Fetches all services from the API.
  $.ajax({
    type: "GET",
    url: "/api/v1/all_services.json",
    dataType: 'json',
    success: function(response) {
      var serviceItems = response.services;

      for (var idx = 0; idx < serviceItems.length; idx++) {
        assembleServiceRow(serviceItems[idx], true); // Fetch statuses for all services
      }
    },
    error: function() {} // Silent error.
  });

  // Toggle enablement of status input field based on checkbox.
  $("#statusCheckbox").click(function() {
    if ($(this).is(":checked")) {
      $("#submit-form .status-field").removeAttr('disabled');
    } else {
      $("#submit-form .status-field").attr('disabled', 'disabled');
    }
  });

  // Toggle enablement of message input field based on checkbox.
  $("#messageCheckbox").click(function() {
    if ($(this).is(":checked")) {
      $("#submit-form .message-field").removeAttr('disabled');
    } else {
      $("#submit-form .message-field").attr('disabled', 'disabled');
    }
  });

  // Opens the modal for adding a new service.
  $("#add-new-service").click(function() {
    $("#add-service-dialog").dialog('open');
  });

  // Initializes the add service modal dialog.
  $("#add-service-dialog").dialog({
    height: 320,
    width: 470,
    resizable: false,
    modal: true,
    autoOpen: false,
    buttons: {
      'Create New Service': function() {
        $.ajax({
          type: "POST",
          url: "/api/v1/all_services.json",
          data: {
            'service_entry[name]': $("#service_entry_name").val(),
            'service_entry[description]': $("#service_entry_description").val()
          },
          dataType: 'json',
          context: $("#service-summary"), // Context for 'this'
          success: function(responsePayload) {
            $("#add-service-dialog").dialog('close');
            assembleServiceRow(responsePayload, false); // Don't fetch statuses immediately for new service
          },
          error: function(jqXHR) {
            $("#add-service-dialog").dialog('close');
            healthDashboard.reportFailure("Failed to create service. Name and Description are required.");
          }
        });
      },
      'Close Dialog': function() {
        $(this).dialog('close');
      }
    }
  });
};

// Renders detailed information for a specific service.
healthDashboard.renderServicePage = function(svcIdentifier, userIsAdmin, beginDate, finalDate) {
  var constructEntryRow = function(entryDetails) {
    var eventDate = new Date(entryDetails.timestamp);
    var displayTime = $.datepicker.formatDate("MMM d, ", eventDate);
    var displayHour;
    var ampmPeriod;

    // Determines AM/PM and converts hour to 12-hour format.
    if (eventDate.getHours() < 12) {
      if (eventDate.getHours() === 0) {
        displayHour = 12;
      } else {
        displayHour = eventDate.getHours();
      }
      ampmPeriod = "AM";
    } else if (eventDate.getHours() == 12) {
      displayHour = eventDate.getHours();
      ampmPeriod = "PM";
    } else {
      displayHour = eventDate.getHours() - 12;
      ampmPeriod = "PM";
    }

    // Formats minutes with leading zero if necessary.
    if (eventDate.getMinutes() < 10) {
      displayTime += displayHour + ":0" + eventDate.getMinutes() + ampmPeriod;
    } else {
      displayTime += displayHour + ":" + eventDate.getMinutes() + ampmPeriod;
    }

    var rowContainer = $('<tr />');

    // Adds the formatted time to the first cell.
    $('<td />', {
      text: displayTime
    }).appendTo(rowContainer);

    var statusImageSrc;
    // Determines the image source based on informational flag.
    if (entryDetails.informational_flag) {
      statusImageSrc = "/assets/images/status/info-icon-small.png";
    } else {
      statusImageSrc = entryDetails.status.image;
    }

    // Creates the status icon cell.
    $('<td />', {
      "class": "event-status-icon"
    }).append(