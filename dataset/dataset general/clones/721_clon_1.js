/* This section declares global variables used throughout the application. */
$app_object =
  null; /* Stores the currently selected application object. Initialized to null. */
$curr_class = null; /* Holds the name of the currently selected class. */
$selected_objects = []; /* An array to keep track of objects selected by the user. */
$curr_page = 0; /* Tracks the current page number for pagination. */
$page_length = 10; // This value must match the server-side pagination limit.


/* Event handler for the 'file upload' button. */
$("#btn-file-upload").click(function() {
  if ($app_object == null) {
    // If no application is selected, alert the user.
    alert("Please select an app first");
    return false;
  }
});


/* Event handler for the 'file download' button. */
$("#btn-file-download").click(
  function() {
    // Check if an application is selected.
    if ($app_object == null) {
      alert("Please select an app first");
      return false; // Prevent further execution.
    }
    // Check if a class is selected.
    if ($curr_class == null) {
      alert("Please select a class first");
      return false; // Prevent further execution.
    }
  }
);


/* Initialize the main Angular module for the class browser application. */
var classBrowserApp =
  angular.module('classBrowserApp', ["xeditable"]);


/* Controller definition for managing the list of classes and their objects. */
classBrowserApp.controller('classListCtrl', function classListCtrl($scope) {

  // Initialize selected app display.
  if ($curr_app == null) {
    $scope.selectedApp = "Select an App";
  } else {
    $scope.selectedApp = $curr_app;
  }


  /* Initialize scope variables. */
  $scope.currAppObject = null; // Current application object.
  $scope.id_field = null; // Field used as the ID for objects.
  $scope.selectedClass = ""; // Name of the currently selected class.
  $scope.classes = []; // Array to hold available classes.
  $scope.object_fields = null; // Fields/columns of objects in the selected class.
  $scope.obj_list = []; // List of objects for the selected class.
  $scope.prev_page = $scope.next_page = null; // Pagination links.
  $scope.apps = []; // Array to hold available applications.


  // Call a function to populate the list of applications.
  update_apps_list($scope);


  /* Function to handle selection of an application. */
  $scope.selectApp = function(app) {

    $scope.id_field = ""; // Reset ID field when a new app is selected.

    // $store.set("session_app", app); // This line is commented out, possibly for future use.

    /* Disable the class delete button when a new app is chosen. */
    var del_btn = $('#delete-class')[0];
    var is_disabled = del_btn.className.indexOf("disabled");
    if (is_disabled == -1) {
      del_btn.className += " disabled";
    }

    /* Disable the objects delete button for the new app. */
    var del_btn = $('#delete-objects')[0];
    var is_disabled = del_btn.className.indexOf("disabled");
    if (is_disabled == -1) {
      del_btn.className += " disabled";
    }


    $scope.selectedClass = ""; // Clear selected class.
    $selected_objects = []; // Clear selected objects.


    $scope.object_fields = null; // Clear object fields.
    $scope.selectedApp = app; // Set the new selected app.
    $scope.classes = []; // Clear classes list.
    $scope.obj_list = []; // Clear object list.
    myspinner.spin($("#spinner")[0]); // Show loading spinner.

    var apps = $scope.apps; // Get the list of applications from scope.

    // Find the selected app object from the list.
    for (index in apps) {
      var cur_app = apps[index];
      if (cur_app.name == app) {
        $app_object = cur_app; // Assign the found app object to the global variable.
        break;
      }
    }

    $scope.currAppObject = $app_object; // Update scope with the current app object.

    // Make an AJAX call to fetch classes for the selected app.
    $.ajax({
      url: "/api/v2/classes/",
      type: "GET",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('AppId', $app_object.key);
      },
      success: function(data) {
        myspinner.stop(); // Stop spinner on success.
        classlist = data["results"]; // Extract class list from response.
        $scope.$apply(function() {
          console.log(classlist); // Log the class list.
          $scope.classes = classlist; // Update scope with classes.
          if ($klass != null) { // Check if a specific class ($klass) needs to be pre-selected.
            $scope.selectClass($klass, 0); // Select the class.
          }
        });

      },

      error: function(xhr, status, err) { // Error handling for AJAX call.

        myspinner.stop(); // Stop spinner on error.
        alert("Unable to complete operation. Server Error!"); // Alert user about the error.
      }
    });


  };


  /* Function to handle selection of a class. */
  $scope.selectClass = function(cls, index) {
    $scope.selectedClass = cls; // Set the selected class name.
    $curr_class = cls; // Update global current class.
    cls.selected = true; // Mark the class as selected (this might be a property of the class object itself).
    $scope.obj_list = []; // Clear current object list.
    $selected_objects = []; // Clear selected objects.


    myspinner.spin($("#spinner")[0]); // Show loading spinner.


    /* Get Class Schema via AJAX. */
    $.ajax({
      url: "/api/v2/classes/schema/" + cls + "/",
      type: "GET",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('AppId', $scope.currAppObject.key);
      },
      success: function(data) {

        $scope.$apply(function() {
          $scope.schema = data; // Update scope with class schema.
        });
      }

    });

    /* Enable the class delete button. */
    var del_btn = $('#delete-class')[0];
    del_btn.className = del_btn.className.replace("disabled", "");

    /* Disable the objects delete button. */
    var del_btn = $('#delete-objects')[0];
    var is_disabled = del_btn.className.indexOf("disabled");
    if (is_disabled == -1) {
      del_btn.className += " disabled";
    }


    /* Remove 'checked' class from all class table rows. */
    all_rows = $('#classes-table').find('tr');
    for (i = 0; i < all_rows.length; i++) {
      row = all_rows[i];
      row.className = row.className.replace("checked", "");
    }

    /* Add 'checked' class to the newly selected class row. */
    row = all_rows[index + 1];
    if (row != undefined) {
      if (row.className.indexOf("checked") == -1) {
        row.className += " checked";
      } else {
        row.className = row.className.replace("checked", "");
      }
    }


    // Make AJAX call to fetch objects for the selected class.
    $.ajax({
      url: "/api/v2/classes/" + cls + "/",
      type: "GET",
      beforeSend: function(xhr) {
        xhr.setRequestHeader('AppId', $scope.currAppObject.key);
      },
      success: function(data) {
        obj_list = data["results"]; // Extract object list.
        $scope.count = data["count"]; // Get total count of objects.

        myspinner.stop(); // Stop spinner.

        ///////////////
        $scope.object_fields = []
        var fields = {}
        for (index in obj_list) {
          obj = obj_list[index]
          for (f in obj) {
            fields[f] = 1; // Collect all unique fields present in objects.
          }
        }

        $scope.id_field = "_id"; // Set default ID field.
        $scope.$apply(function() {

          delete fields["_id"]; // Remove _id from the list of displayable fields.

          for (var field in fields) {
            $scope.object_fields.push(field); // Populate object_fields for display.
          }
          $scope.obj_list = obj_list; // Update object list in scope.
          $scope.prev_page = data["previous"]; // Set previous page link.
          $scope.next_page = data["next"]; // Set next page link.

        });

        $("#btn-paginator").show(); // Show pagination buttons.

        $scope.show_page_message(); // Display pagination message.

      },
      error: function(xhr, status, err) { // Error handling for AJAX call.

        myspinner.stop(); // Stop spinner on error.
        alert("Unable to complete operation. Server Error!"); // Alert user.
      }
    });

  }


  /* Function to display the current page information. */
  $scope.show_page_message = function() {

    var $start = $end = 0; // Initialize start and end indices.
    if ($scope.prev_page == null) { // If on the first page.
      $start = 1;
      $end = $scope.obj_list.length;
    } else { // If on a subsequent page.
      var match = $scope.prev_page.match(/\d+/); // Extract page number from prev_page URL.
      var prev = match[0];
      $start = eval(prev) * $page_length + 1; // Calculate start index.
      $end = $start + $scope.obj_list.length - 1; // Calculate end index.
    }

    var msg = "Showing result " + $start.toString() + " to " + $end.toString() + " of " + $scope.count; // Construct message.
    $("#page-info").text(msg); // Update the page info display.

  }


  /* Function to navigate to the previous page of objects. */
  $scope.previousPage = function() {

    if ($scope.prev_page != null) { // Only proceed if a previous page exists.

      myspinner.spin($("#spinner")[0]); // Show loading spinner.

      $.ajax({
        url: "/api/v2/classes/" + $scope.selectedClass + "/" + $scope.prev_page, // URL for previous page.
        type: "GET",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('AppId', $scope.currAppObject.key);
        },
        success: function(data) {
          obj_list = data["results"]; // Get object list.
          myspinner.stop(); // Stop spinner.

          ///////////////
          $scope.object_fields = []
          var fields = {}
          for (index in obj_list) {
            obj = obj_list[index]
            for (f in obj) {
              fields[f] = 1; // Collect unique fields.
            }
          }

          $scope.id_field = "_id"; // Set ID field.
          $scope.$apply(function() {

            delete fields["_id"]; // Remove _id from display fields.

            for (var field in fields) {
              $scope.object_fields.push(field); // Populate object_fields.
            }
            $scope.obj_list = obj_list; // Update object list.
            $scope.prev_page = data["previous"]; // Update previous page link.
            $scope.next_page = data["next"]; // Update next page link.
            $scope.count = data["count"]; // Update total count.


          });

          $scope.show_page_message(); // Display page message.

          /* Disable objects delete button after page change. */
          var del_btn = $('#delete-objects')[0];
          var is_disabled = del_btn.className.indexOf("disabled");
          if (is_disabled == -1) {
            del_btn.className += " disabled";
          }
        },
        error: function(xhr, status, err) { // Error handling.

          myspinner.stop(); // Stop spinner.
          alert("Unable to complete operation. Server Error!"); // Alert user.
        }
      });

    } else {
      return false; // No previous page, do nothing.
    }

  }


  /* Function to navigate to the next page of objects. */
  $scope.nextPage = function() {

    if ($scope.next_page != null) { // Only proceed if a next page exists.

      myspinner.spin($("#spinner")[0]); // Show loading spinner.

      $.ajax({
        url: "/api/v2/classes/" + $scope.selectedClass + "/" + $scope.next_page, // URL for next page.
        type: "GET",
        beforeSend: function(xhr) {
          xhr.setRequestHeader('AppId', $scope.currAppObject.key);
        },
        success: function(data) {
          obj_list = data["results"]; // Get object list.
          myspinner.stop(); // Stop spinner.

          ///////////////
          $scope.object_fields = []
          var fields = {}
          for (index in obj_list) {
            obj = obj_list[index]
            for (f in obj) {
              fields[f] = 1; // Collect unique fields.
            }
          }

          $scope.id_field = "_id"; // Set ID field.
          $scope.$apply(function() {

            delete fields["_id"]; // Remove _id from display fields.

            for (var field in fields) {
              $scope.object_fields.push(field); // Populate object_fields.
            }
            $scope.obj_list = obj_list; // Update object list.
            $scope.prev_page = data["previous"]; // Update previous page link.
            $scope.next_page = data["next"]; // Update next page link.
            $scope.count = data["count"]; // Update total count.

          });

          $scope.show_page_message(); // Display page message.

          /* Disable objects delete button after page change. */
          var del_btn = $('#delete-objects')[0];
          var is_disabled = del_btn.className.indexOf("disabled");
          if (is_disabled == -1) {
            del_btn.className += " disabled";
          }

        },
        error: function(xhr, status, err) { // Error handling.

          myspinner.stop(); // Stop spinner.
          alert("Unable to complete operation. Server Error!"); // Alert user.
        }
      });

    } else {
      return false; // No next page, do nothing.
    }

  }

  /* Function to handle selection/deselection of an individual object. */
  $scope.selectObject = function(objid, index) {

    row = $('#obj-table').find('tr')[index + 1]; // Get the table row for the object.
    if (row.className.indexOf("checked") == -1) { // If object is not currently checked.
      row.className += " checked" // Add 'checked' class.
      $selected_objects.push(objid); // Add object ID to selected list.
    } else { // If object is already checked.
      row.className = row.className.replace("checked", ""); // Remove 'checked' class.
      var removeIndex = $selected_objects.indexOf(objid); // Find index of object ID.
      if (removeIndex > -1) {
        $selected_objects.splice(removeIndex, 1); // Remove object ID from selected list.
      }
    }

    var del_btn = $('#delete-objects')[0]; // Get the delete objects button.
    /* Enable or disable the objects delete button based on selection count. */
    if ($selected_objects.length > 0) {

      del_btn.className = del_btn.className.replace("disabled", ""); // Enable button.
    } else {
      del_btn.className += " disabled"; // Disable button.
    }


  }


  /* Function to handle deletion of the currently selected class. */
  $scope.deleteClass = function() {

    var del = confirm("Warning: All objects of this class will be deleted.\n" +
      "Are you sure you want to delete this class?"); // Confirmation dialog.
    if (del == true && $curr_class != null) { // Proceed if confirmed and a class is selected.

      myspinner.spin($("#spinner")[0]); // Show loading spinner.

      $.ajax({
        url: "/api/v2/classes/" + $curr_class + "/", // API endpoint for class deletion.
        type: "DELETE",
        beforeSend: function(xhr, settings) {
          if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
            // Send the token to same-origin, relative URLs only.
            // Send the token only if the method warrants CSRF protection
            // Using the CSRFToken value acquired earlier
            var csrftoken = $.cookie('csrftoken');
            xhr.setRequestHeader("X-CSRFToken", csrftoken);
          }
          xhr.setRequestHeader('AppId', $scope.currAppObject.key); // Set AppId header.

        },
        success: function(data) {
          myspinner.stop(); // Stop spinner.

          $scope.$apply(function() {
            var index = $scope.classes.indexOf($scope.selectedClass); // Find index of deleted class.
            if (index > -1) {
              $scope.classes.splice(index, 1); // Remove class from list.

            }
            $scope.object_fields = []; // Clear object fields.
            $scope.obj_list = []; // Clear object list.
            $scope.selectedClass = ""; // Clear selected class.
            $curr_class = ""; // Clear global current class.
            $scope.id_field = null; // Clear ID field.
            $scope.prev_page = $scope.next_page = null; // Clear pagination links.

          });


          /* Disable delete buttons after class deletion. */
          var del_btn = $('#delete-class')[0];
          var is_disabled = del_btn.className.indexOf("disabled");
          if (is_disabled == -1) {
            del_btn.className += " disabled";
          }

          del_btn = $('#delete-objects')[0];
          var is_disabled = del_btn.className.indexOf("disabled");
          if (is_disabled == -1) {
            del_btn.className += " disabled";
          }

          $("#page-info").text(""); // Clear page info message.
          $("#btn-paginator").hide(); // Hide pagination buttons.

        },
        error: function(xhr, status, err) { // Error handling.

          myspinner.stop(); // Stop spinner.
          alert("Unable to complete operation. Server Error!"); // Alert user.
        }

      });

    } else {
      return false; // If not confirmed or no class selected, do nothing.
    }

  }

  /* Function to handle deletion of selected objects. */
  $scope.deleteObjects = function() {

    var del = confirm("Warning: All selected objects will be deleted.\n" +
      "Are you sure you want to delete these objects?"); // Confirmation dialog.

    if (del == true && $curr_class != null) { // Proceed if confirmed and a class is selected.

      myspinner.spin($("#spinner")[0]); // Show loading spinner.
      for (i = 0; i < $selected_objects.length; i++) { // Iterate through selected objects.
        var successCount = 0; // Initialize success counter (this variable is reset in each iteration, might be a bug or intended for individual callbacks).
        $.ajax({
          url: "/api/v2/classes/" + $curr_class + "/" + $selected_objects[i] + "/", // API endpoint for object deletion.
          type: "DELETE",
          context: successCount, // Context for the AJAX callback.
          beforeSend: function(xhr, settings) {
            if (!csrfSafeMethod(settings.type) && sameOrigin(settings.url)) {
              // Send the token to same-origin, relative URLs only.
              // Send the token only if the method warrants CSRF protection
              // Using the CSRFToken value acquired earlier
              var csrftoken = $.cookie('csrftoken');
              xhr.setRequestHeader("X-CSRFToken", csrftoken);
            }