const VIEW_NAMES = ['start', 'create', 'running'];

$(document).ready(function () {
  // Initialize on document load
  let urlFragment = window.location.hash;

  if (urlFragment === '#create') {
    switchView('create'); // Navigate to the creation panel
  }
  if (urlFragment === '#running') {
    switchView('running'); // Direct to the active schedules section
  }

  $('#submit-btn').on('click', handleSaveAction); // Attach handler for save button
  $('.remove-all-tasks-btn').on('click', clearAllTasks); // Bind event for clearing all tasks
});

function clearAllTasks(evt) {
  // Function to remove all scheduled tasks
  $.ajax({
    url: "lib/purgeall.php"
  }).done(function (responseData) {
    // Send request to server
    window.location.reload(); // Refresh the current page
  });
}

function removeSingleTask(taskIdentifier) {
  // Deletes a specific task by its ID
  $.post("lib/purgeone.php", {
      "task_id": taskIdentifier
    }, // Post request to delete a task
    function (responseData) { // Callback after task deletion
      window.location.reload(); // Reload the browser window
    }
  );
}

function handleSaveAction(evt) {
  // Manages the saving of a new schedule
  let minSetting = $('.input-minute-val').val(); // Get minute value
  let hrSetting = $('.input-hour-val').val(); // Retrieve hour input
  let dayOfWeekSetting = $('.input-dayweek-val').val(); // Get day of week
  let dayOfMonthSetting = $('.input-daymonth-val').val(); // Get day of month
  let monthSetting = $('.input-month-val').val(); // Obtain month selection
  let taskName = $('.input-name-val').val(); // Fetch task identifier
  let taskCommand = $('.input-command-val').val(); // Get the command string

  $.post("lib/register.php", {
      "min": minSetting,
      "hr": hrSetting,
      "day_wk": dayOfWeekSetting,
      "day_mo": dayOfMonthSetting,
      "mon": monthSetting,
      "title": taskName,
      "cmd": taskCommand
    }, // Submit new schedule data
    function (responseData) { // Process server response
      console.log(responseData); // Log response to console
      switchView('running'); // Navigate to the running tasks view
    }
  );
}

function switchView(targetView) {
  // Controls the display of different UI sections
  retrieveLiveSchedules(); // Update the list of active tasks

  // Conceal all existing view panels
  for (let idx = 0; idx < VIEW_NAMES.length; idx++) { // Iterate through all defined views
    $('#' + VIEW_NAMES[idx]).hide(); // Hide each view panel
  }
  $('.navigation-menu li').removeClass('current-selection'); // Remove active class from navigation items

  // Display the requested view panel.
  $('#' + targetView).show(); // Make the selected view visible
  $('.navigation-menu-' + targetView).addClass('current-selection'); // Highlight the corresponding navigation item
}

function retrieveLiveSchedules() {
  // Fetches and displays currently active cron jobs
  $.getJSON('lib/live_schedules.php', function (responseData) { // Asynchronously get schedule data
    let htmlContent = ''; // Initialize string to build HTML for display

    $.each(responseData, function (index, itemValue) { // Iterate over received schedule entries
      let parts = itemValue.split(' '); // Split the schedule string into components

      htmlContent += '<tr>'; // Start a new table row

      $.each(parts, function (subIndex, partValue) { // Process each component of the schedule entry
        htmlContent += '<td>' + partValue + '</td>'; // Add a table data cell
      });
      htmlContent += '<td><a class="btn btn-danger unregister_' + index + '" onclick="removeSingleTask(' + index + ')">Delete</a></td>'; // Add delete button with task ID
      htmlContent += '</tr>'; // Close the table row
    });

    $('.running-task-display').html(htmlContent); // Update the display area with generated HTML
  });
}