/*
 * This file contains common JavaScript utilities
 * for the Stashboard application.
 *
 * Author: Stashboard Team
 * Version: 1.0.1
 * Last Updated: 2023-10-27
 */

var  stashboard  =  {};  // Initialize the global stashboard object to hold all related functions and properties.

// Function to display a generic message to the user.
// It updates the text of a specific element and applies a CSS class for styling.
stashboard.displayMessage = function  (  message,  klass  )  {
  // Select the span within the #notice element and set its text content.
  $( "#notice span"  ).text(  message  );

  // Select the #notice element, remove all its existing classes,
  // add the specified 'klass', and then make it visible.
  $("#notice")
    .removeClass()
    .addClass( klass )
    .show();
};

// Helper function to display an error message.
// It internally calls displayMessage with the "error" class.
stashboard.error =  function  (  message  )  {

  // Delegate to the generic message displayer with the "error" style.
  stashboard.displayMessage(  message,  "error"  );
};

// Helper function to display a success message.
// It internally calls displayMessage with the "success" class.
stashboard.success =  function  (  message  )  {
  // Delegate to the generic message displayer with the "success" style.
  stashboard.displayMessage(  message,  "success"  );
};

// Helper function to display an informational message.
// It internally calls displayMessage with the "info" class.
stashboard.info =  function  (  message  )  {

  // Delegate to the generic message displayer with the "info" style.
  stashboard.displayMessage(  message,  "info"  );
};

/*
 * Converts a Date object into an RFC 1123 formatted string.
 * This format is commonly used in HTTP headers (e.g., for `Expires` or `Date`).
 * Example: "Thu, 27 Oct 2023 10:30:00 -0400"
 */
stashboard.rfc1123 = function  (  date  )  {
  // Format the date part using jQuery UI Datepicker's utility.
  var  rfc  =  $.datepicker.formatDate(  "D, d M yy",  date  );

  // Append hours, minutes, and seconds.
  rfc  =  rfc  +  " "  +  date.getHours()  +  ":";
  rfc  =  rfc  +  date.getMinutes()  +  ":"  +  date.getSeconds();

  // Calculate the timezone offset.
  var  offset  =  date.getTimezoneOffset(); // Offset in minutes from UTC.
  var  minutes  =  offset  %  60;
  var  hours  =  (  offset  -  minutes  )  /  60;
  var  off; // String to build the offset part.

  // Determine the sign of the offset.
  if  (  offset  <  0  )  {
    off  =  "+";
    hours  =  -hours;  // Make hours positive for display if offset is negative.
  }  else  {
    off  =  "-";
  }

  // Pad hours with a leading zero if less than 10.
  if  (  hours  <  10  )  {
    off  +=  "0";
  }
  off  +=  hours.toString(); // Append formatted hours.

  // Pad minutes with a leading zero if less than 10.
  if  (  minutes  <  10  )  {
    off  +=  "0";
  }
  off  +=  minutes.toString(); // Append formatted minutes.

  // Return the complete RFC 1123 formatted string.
  return  rfc  +  " "  +  off;
};

/**
 * Populates the status legend table based on available statuses.
 * Includes functionality for editing and deleting statuses if the user is an admin.
 * @param {boolean} isAdmin - True if the current user has admin privileges.
 */
stashboard.fillLegend = function  (  isAdmin  )  {
  // Inner helper function to create a single status row in the legend table.
  var  createStatusRow  =  function  (  data  )  {
    var  tr  =  $(  "<tr />"  );

    // Create the icon column (<td>) with an image.
    $( "<td />",  {  "class":  "icon"  }  ).append(
      $(  "<img />",  {
        src:  data.image,
        alt:  data.name
      }  )
    ).appendTo(  tr  );

    // Create the description column.
    $(  "<td />",  {  "class":  "description",  text:  data.description  }  ).appendTo(  tr  );

    // If the user is an administrator, add edit and delete options.
    if  (  isAdmin  )  {

      var  edit  =  $(  "<a />",  {  text:  "Edit",  href:  data.url  }  );

      // Add level column.
      $(  "<td />",  {  "class":  "level",  text:  data.level  }  ).appendTo(  tr  );
      // Add edit link column.
      $(  "<td />",  {  html:  edit  }  ).appendTo(  tr  );
      // Add delete link column.
      $(  "<td />",  {  html:
        $(  "<a />",  {  text:  "Delete",  href:  data.url,  "class":  "delete-status"  }  )
      }  ).appendTo(  tr  );

      // Attach click handler for the edit link.
      edit.click(  function  (  e  )  {
        e.preventDefault(); // Prevent default link behavior.
        var  a  =  $(  e.target  );
        var  tr  =  a.parent().parent(); // Get the parent row of the clicked link.
        var  img  =  tr.children(  ".icon"  ).children(  "img"  );

        // This is somewhat ugly, but it extracts the image name without extension.
        var  value  =  img.attr(  "src"  ).split(  "/"  ).pop().slice(  0,  -4  );

        // Populate the modal form fields with existing status data.
        $(  "#status-name"  ).val(  img.attr(  "alt"  )  );
        $(  "#status-description"  ).val(  tr.children(  ".description"  ).text()  );
        $(  "#statusLevel"  ).val(  tr.children(  ".level"  ).text()  );

        // Uncheck all status image radio buttons and then check the appropriate one.
        $(  "input[name=status-image]:checked"  ).attr(  "checked",  false  );
        $(  "input[value="  +  value  +  "]"  ).attr(  "checked",  true  );

        // Open the add/edit status modal dialog.
        $(  "#add-status-modal"  ).dialog(  {
          height:  515,
          width:  460,
          resizable:  false,
          autoOpen:  true,
          modal:  true,
          buttons:  {
            'Save':  function  (  )  {
              // AJAX call to save the updated status.
              $.ajax(  {
                type:  "POST",
                url:  a.attr(  "href"  ),
                data:  {
                  'status[name]':  $(  "#status-name"  ).val(),
                  'status[description]':  $(  "#status-description"  ).val(),
                  'status[image]':  $(  "input[name=status-image]:checked"  ).val(),
                  'status[level]':  $(  "#statusLevel"  ).val()
                },
                dataType:  'json',
                context:  tr, // Set context to the table row for easy access in success/error callbacks.
                success:  function  (  data  )  {
                  $(  "#add-status-modal"  ).dialog(  'close'  );
                  // Update the row with new data.
                  this.children(  ".description"  ).text(  data.description  );
                  this.children(  ".level"  ).text(  data.level  );
                  this.children(  ".icon"  ).children(  "img"  ).attr(  "alt",  data.name  );
                  this.children(  ".icon"  ).children(  "img"  ).attr(  "src",  data.image  );
                },
                error:  function  (  )  {
                  $(  "#add-status-modal"  ).dialog(  'close'  );
                  stashboard.error(  "Could not save status"  );
                }
              }  );
            },
            'Cancel':  function  (  )  {
              $(  this  ).dialog(  'close'  );
            }
          }
        }  );
      }  );
    } // End if (isAdmin)

    // Append the created row to the legend body.
    $(  "#legend-body"  ).append(  tr  );
  }; // End of createStatusRow function

  // Click handler for the "Add Status" button.
  $(  "#add-status"  ).click(  function  (  )  {
    // Clear previous values in the modal form.
    $(  "#status-name"  ).val(  ""  );
    $(  "#status-description"  ).val(  ""  );
    $(  "#statusLevel"  ).val(  ""  );
    $(  "#add-status-modal"  ).dialog(  'open'  );
    $(  "input[name=status-image]"  ).attr(  "checked",  false  );
  }  );

  // AJAX call to fetch all available statuses from the API.
  $.ajax(  {
    type:  "GET",
    url:  "/api/v1/statuses.json",
    dataType:  'json',
    success:  function  (  data  )  {
      if  (  data  )  {
        var  statuses  =  data.statuses;
        // Iterate through each status and create a row for it.
        for  (  var  i=0;  i  <  statuses.length;  i++  )  {
          createStatusRow(  statuses[i]  );
        }
      }
    },
    error:  function  (  )  {
      // Handle error if statuses cannot be fetched.
    }
  }  );

  // AJAX call to fetch available status levels for the dropdown.
  $.ajax(  {
    type:  "GET",
    url:  "/api/v1/levels.json",
    dataType:  "json",
    context:  $(  "#statusLevel"  ), // Set context to the select element.
    success:  function  (  data  )  {
      if  (  data  )  {
        var  levels  =  data.levels;
        // Populate the dropdown with level options.
        for  (  var  i=0;  i  <  levels.length;  i++  )  {
          $(  "<option />",  {
            "name":  "level",
            val:  levels[i],
            text:  levels[i]
          }  ).appendTo(  $(  this  )  ); // 'this' refers to #statusLevel due to context.
        }
      }
    },
    error:  function  (  )  {
      // Handle error if levels cannot be fetched.
    }
  }  );

  // Initialize the "Add/Edit Status" modal dialog.
  $(  "#add-status-modal"  ).dialog(  {
    height:  515,
    width:  460,
    resizable:  false,
    modal:  true,
    autoOpen:  false, // Dialog starts closed.
    buttons:  {
      'Create Status':  function  (  )  {
        // AJAX call to create a new status.
        $.ajax(  {
          type:  "POST",
          url:  "/api/v1/statuses.json",
          data:  {
            'status[name]':  $(  "#status-name"  ).val(),
            'status[description]':  $(  "#status-description"  ).val(),
            'status[image]':  $(  "input[name=status-image]:checked"  ).val(),
            'status[level]':  $(  "#statusLevel"  ).val()
          },
          dataType:  'json',
          context:  $(  ".legend"  ).children(  'tbody'  ), // Context for append.
          success:  function  (  data  )  {
            $(  "#add-status-modal"  ).dialog(  'close'  );
            createStatusRow(  data  ); // Add the newly created status to the legend.
          },
          error:  function  (  )  {
            $(  "#add-status-modal"  ).dialog(  'close'  );
            stashboard.error(  "Could not create new status due to missing information"  );
          }
        }  );
      },
      'Cancel':  function  (  )  {
        $(  this  ).dialog(  'close'  );
      }
    }
  }  );

  // Live click handler for delete status links (delegated event for dynamically added elements).
  $(  ".delete-status"  ).live(  'click',  function  (  e  )  {
    e.preventDefault();
    var  a  =  $(  e.target  ); // The clicked delete link.

    // Open the delete confirmation modal.
    $(  "#delete-status-modal"  ).dialog(  {
      resizable:  false,
      modal:  true,
      buttons:  {
        'Delete Status':  function  (  )  {
          // AJAX call to delete the status.
          $.ajax(  {
            type:  "DELETE",
            url:  a.attr(  "href"  ),
            dataType:  'json',
            context:  $(  "#delete-status-modal"  ), // Context for closing modal.
            success:  function  (  data  )  {
              a.parent().parent().remove(); // Remove the table row.
              this.dialog(  'close'  );
            },
            error:  function  (  )  {
              this.dialog(  'close'  );
              stashboard.error(  "Unable to delete status"  );
            }
          }  );
        },
        'Cancel':  function  (  )  {
          $(  this  ).dialog(  'close'  );
        }
      }
    }  );
  }  );
};

// Function to fill the main index page with service information.
stashboard.fillIndex = function  (  )  {
  var  currentNow  =  new  Date();
  // Calculate date for 5 days ago (86400000 ms in a day).
  var  d  =  new  Date(  currentNow.getTime()  -  86400000  );
  var  thead  =  $(  "#service-list thead tr"  );

  // Populate the table header with dates for the last 5 days.
  for  (  var  i=0;  i  <  5;  i++  )  {
    $(  "<th />",  {
      "class":  "date",
      text:  (  d.getMonth()  +  1  )  +  "/"  +  d.getDate()  +  "/"  +  d.getFullYear()
    }  ).appendTo(  thead  );
    d  =  new  Date(  d.getTime()  -  86400000  ); // Move to the previous day.
  }

  // Inner helper function to create a single service row in the index table.
  var  createServiceRow  =  function  (  data,  fetchStatuses  )  {
    var  informationImage  =  "/images/status/question-white.png";
    var  defaultImage  =  "/images/status/tick-circle.png";
    var  imageRow  =  defaultImage; // Default image for the row.
    var  tr  =  $(  '<tr />',  {  id:  data.id  }  );

    // First column: Service name (linked to its detail page).
    $(  '<td />'  ).append(
      $(  '<a />',  {
        href:  'services/'  +  data.id,
        text:  data.name
      }  )
    ).appendTo(  tr  );

    // If we need to fetch statuses, set the image to informational.
    if  (  fetchStatuses  )  {
      imageRow  =  informationImage;
    }

    // Second column: Current status (highlighted).
    $(  '<td />',  {  "class":  "status highlight"  }  ).append(
      $(  '<a />',  {
        href:  'services/'  +  data.id,
        html:  $(  "<img />",  {
          src:  imageRow,
          alt:  "Unknown Status"
        }  )
      }  )
    ).appendTo(  tr  );

    // Remaining columns: Statuses for the last 5 days (initially unknown).
    for  (  var  i=0;  i  <  5;  i++  )  {
      $(  "<td />",  {  "class":  "status"  }  ).append(
        $(  "<img />",  {
          src:  imageRow,
          alt:  "Unknown Status"
        }  )
      ).appendTo(  tr  );
    }

    // Append the row to the table body after a fade-in effect.
    $(  "#service-list"  ).fadeIn(  'fast',  function  (  )  {
      $(  "#services-body"  ).append(  tr  );
    }  );

    // If fetchStatuses is true, make AJAX calls to get actual status data.
    if  (  fetchStatuses  )  {
      console.log(  data.id  ); // Log the service ID for debugging.

      // AJAX call to get the current status for the service.
      $.ajax(  {
        type:  "GET",
        url:  "/api/v1/services/"  +  data.id  +  "/events/current.json",
        dataType:  'json',
        success:  function  (  evt  )  {
          // Update the highlighted current status image.
          $(  "#"  +  data.id  +  " td.highlight img"  )
            .attr(  "src",  evt.status.image  );

          // If the event is informational, add an extra info icon.
          if  (  evt.informational  )  {
            $(  "#"  +  data.id  +  " td.highlight a"  ).append(
              $(  "<img />",  {
                src:  "/images/small-information.png",
                "class":  "information"
              }  )
            );
          }
        },
        error:  function  (  evt  )  {
          // On error, set to default image.
          $(  "#"  +  data.id  +  " td.highlight img"  )
            .attr(  "src",  defaultImage  );
        }
      }  );

      // Prepare dates for fetching historical events.
      var  rightNow  =  new  Date();
      rightNow.setHours(  0  );
      rightNow.setMinutes(  0  );
      rightNow.setSeconds(  0  );
      rightNow.setMilliseconds(  0  );

      var  endDate  =  new  Date(  rightNow.getTime()  );
      var  startDate  =  new  Date(  endDate.getTime()  -  86400000  *  5  ); // 5 days prior.
      var  url  =  "/api/v1/services/"  +  data.id  +  "/events.json";
      url  +=  "?start="  +  stashboard.rfc1123(  startDate  );
      url  +=  "&end="  +  stashboard.rfc1123(  endDate  );

      // AJAX call to get historical events for the service.
      $.ajax(  {
        type:  "GET",
        url:  url,
        dataType:  'json',
        success:  function  (  results  )  {
          var  calendar  =  {}; // Map day of month to status (true for abnormal/informational).
          var  days  =  []; // Array to hold the Date objects for the last 5 days.

          // Make end date the correct date for iteration (adjust for display).
          endDate  =  new  Date(  endDate.getTime()  -  86400000  );

          // Populate days array and initialize calendar.
          for  (  var  i=0;  i  <  5;  i++  )  {
            days.push(  endDate  );
            calendar[endDate.getDate()]  =  false; // Assume normal initially.
            endDate  =  new  Date(  endDate.getTime()  -  86400000  );
          }

          var  events  =  results.events;

          // Process fetched events to update calendar.
          for  (  i=0;  i  <  events.length;  i++  )  {
            var  e  =  events[i];
            var  evtDate  =  new  Date(  e.timestamp  );
            // Mark day as abnormal/informational if an event exists for it.
            calendar[evtDate.getDate()]  =  e.informational  ||  e.status.level  !==  "NORMAL";
          }

          // Update the historical status columns in the table.
          for  (  i=  days.length-1;  i  >=  0;  i--  )  {
            var  d  =  days[i];
            var  td  =  $(  "#"  +  data.id  ).children(  "td"  ).eq(  i+2  ); // Skip service name and current status columns.

            url  =  "/services/"  +  data.id  +  "/"  +  d.getFullYear()  +  "/";
            url  +=  (  d.getMonth()  +  1  )  +  "/"  +  d.getDate();

            // Based on calendar, set appropriate image and link.
            if  (  calendar[d.getDate()]  )  {
              td.html(  $(  "<a />",  {  href:  url  }  ).append(
                $(  "<img />",{src:  "/images/status/information.png"}  )  )
              );
            }  else  {
              td.html(  $(  "<a />",  {  href:  url  }  ).append(
                $(  "<img />",{src:  defaultImage}  )  )
              );
            }
          }
        },
        error:  function  (  )  {
          // Handle error for historical events.
        }
      }  );
    } // End if (fetchStatuses)
  }; // End of createServiceRow function

  // Initial AJAX call to fetch all services.
  $.ajax(  {
    type:  "GET",
    url:  "/api/v1/services.json",
    dataType:  'json',
    success:  function  (  data  )  {

      var  services  =  data.services;

      // Create a row for each service.
      for  (  var  i=0;  i  <  services.length;  i++  )  {
        createServiceRow(  services[i],  true  );
      }
    },
    error:  function  (  )  {
      // Handle error if services cannot be fetched.
    }
  }  );

  // Event handler for the "statusBox" checkbox.
  // Enables/disables the status input field based on checkbox state.
  $(  "#statusBox"  ).click(  function  (  )  {
    if  (  $(  this  ).is(  ":checked"  )  )  {
      $(  "#submit .status"  ).removeAttr(  'disabled'  );
    }  else  {
      $(  "#submit .status"  ).attr(  'disabled',  'disabled'  );
    }
  }  );

  // Event handler for the "messageBox" checkbox.
  // Enables/disables the message input field based on checkbox state.
  $(  "#messageBox"  ).click(  function  (  )  {
    if  (  $(  this  ).is(  ":checked"  )  )  {
      $(  "#submit .message"  ).removeAttr(  'disabled'  );
    }  else  {
      $(  "#submit .message"  ).attr(  'disabled',  'disabled'  );
    }
  }  );

  // Click handler for the "Add Service" button.
  $(  "#add-service"  ).click(  function  (  )  {
    $(  "#add-service-modal"  ).dialog(  'open'  );
  }  );

  // Initialize the "Add Service" modal dialog.
  $(  "#add-service-modal"  ).dialog(  {
    height:  310,
    width:  460,
    resizable:  false,
    modal:  true,
    autoOpen:  false, // Dialog starts closed.
    buttons:  {
      'Create Service':  function  (  )  {
        // AJAX call to create a new service.
        $.ajax(  {
          type:  "POST",
          url:  "/api/v1/services.json",
          data:  {
            'service[name]':  $(  "#service_name"  ).val(),
            'service[description]':  $(  "#service_description"  ).val()
          },
          dataType:  'json',
          context:  $(  "#service-list"  ), // Context for adding new row.
          success:  function  (  data  )  {
            $(  "#add-service-modal"  ).dialog(  'close'  );
            createServiceRow(  data,  false  ); // Add the new service row.
          },
          error:  function  (  evt  )  {
            $(  "#add-service-modal"  ).dialog(  'close'  );
            stashboard.error(  "Could not create service. Make sure Name and Description are valid"  );
          }
        }  );
      },
      'Cancel':  function  (  )  {
        $(  this  ).dialog(  'close'  );
      }
    }
  }  );
};

/*
 * Fills the service detail page with information.
 * @param {string} serviceName - The name of the service.
 * @param {boolean} isAdmin - True if the current user has admin privileges.
 * @param {Date} start_date - The start date for filtering events.
 * @param {Date} end_date - The end date for filtering events.
 */
stashboard.fillService = function  (  serviceName,  isAdmin,  start_date,  end_date  )  {
  // Helper function to create a table row for a single event.
  var  createRow  =  function  (  data  )  {
    var  d  =  new  Date(  data.timestamp  );
    var  time  =  $.datepicker.formatDate(  "MM d, ",  d  );
    var  hour;
    var  period;

    // Convert 24-hour format to 12-hour AM/PM format.
    if  (  d.getHours()  <  12  )  {
      if  (  d.getHours()  ===  0  )  {
        hour  =  12;
      }  else  {
        hour  =  d.getHours();
      }
      period  =  "AM";
    }  else  if  (  d.getHours()  ==  12  )  {
      hour  =  d.getHours();
      period  =  "PM";
    }  else  {
      hour  =  d.getHours()  -  12;
      period  =  "PM";
    }

    // Format minutes with leading zero if necessary.
    if  (  d.getMinutes()  <  10  )  {
      time  +=  hour  +  ":0"  +  d.getMinutes()  +  period;
    }  else  {
      time  +=  hour  +  ":"  +  d.getMinutes()  +  period;
    }

    var  tr  =  $(  '<tr />'  );

    // First column: Timestamp.
    $(  '<td />',  {text:  time}  ).appendTo(  tr  );

    var  image; // Variable to hold the status image path.
    // Determine the image based on whether the event is informational.
    if  (  data.informational  )  {
      image  =  "/images/status/information.png";
    }  else  {
      image  =  data.status.image;
    }

    // Second column: Status image (highlighted).
    $(  '<td />',  {"class":  "status highlight"}  ).append(