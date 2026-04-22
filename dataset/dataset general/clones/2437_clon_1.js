/*
 * This file defines the core functionality for a "pull-to-reload"
 * feature, mimicking native mobile app behavior.
 *
 * It's structured as a self-contained JavaScript object to prevent
 * global namespace pollution.
 */
var pullToReload = {

  // -- Configuration and State Variables ----------------------------------

  // Flag indicating if the scroll event is currently active and capable.
  eventCapable: true,
  // Flag indicating if the user has pulled far enough to enable a refresh.
  refreshCapable: false,

  // Timestamp when the user started pulling *up* (towards reload).
  timeStarted: null,
  // Timestamp when the user started scrolling *up* (towards the top of the page).
  scrollUpTime: null,


  // -- Initialization Method ----------------------------------------------

  /*
   * Initializes the pull-to-reload mechanism.
   * This involves injecting necessary HTML elements and binding event listeners.
   */
  init: function() {

    // Dynamically inject the required HTML elements into the document body.
    // This includes the reloading indicator and the pull-to-refresh bar itself.
    $('body')
      .prepend('<div id="pullToRefreshReloading">' +
               '<span class="icon"></span>' +
               '<span class="text">Reloading...</span>' +
               '</div>' +
               '<div id="pullToRefresh">' +
               '<div class="wrap">' +
               '<span class="icon">&nbsp;</span>' +
               '<div id="pullyText">Pull to refresh</div>' +
               '</div>' +
               '</div>'
              );

    // Attach the 'monitorScroll' function to the window's scroll event.
    // This function will be triggered every time the user scrolls.
    $( window ) . bind ( 'scroll', pullToReload.monitorScroll ) ;
  } ,


  // -- Event Monitoring Logic ---------------------------------------------

  /*
   * Monitors the scroll position of the window to detect pull-to-refresh gestures.
   * This is the primary scroll event handler.
   */
  monitorScroll: function ()
  {
    // If the user has scrolled down the page, disable pull-to-refresh temporarily.
    if (window.scrollY > 0)
    {
      // Reset the scroll-up timer, as we are no longer at the top.
      pullToReload.scrollUpTime = null;
      // Mark event as incapable until user returns to the top.
      pullToReload.eventCapable = false;
    }

    // If the user is at the very top of the page (scrollY is zero).
    if (window.scrollY === 0)
    {
      // Start a timer if one isn't already running.
      if (pullToReload.scrollUpTime === null)
      {
        pullToReload.scrollUpTime = new Date();
      }
    }

    // Check if the scroll-up timer has been initiated (meaning user is at or near top).
    if (pullToReload.scrollUpTime !== null)
    {
      // Get current time and calculate the difference from when scrolling up started.
      var nowTime = new Date(),
          diff = nowTime.getTime() - pullToReload.scrollUpTime.getTime();

      // If enough time has passed (e.g., 0.5 seconds), run the scroll commands.
      if (diff > 500)
      {
        pullToReload.runScrollCommands();
      }
    }
    else // If scrollUpTime is null, it implies user is not at the top or just moved away.
    {
      pullToReload.runScrollCommands();
    }
  }, // End of monitorScroll function.


  // -- Command Execution Based on Scroll State ----------------------------

  /*
   * Executes visual and state changes based on the current scroll position
   * and pull-to-refresh flags.
   */
  runScrollCommands: function ()
  {

    // Scenario 1: User is pulling up, but not yet past the reload threshold.
    // This means scrollY is negative (pulled up) but not too far.
    if (window.scrollY < 0 && window.scrollY > -40)
    {
      // Update the text in the pull-to-refresh bar.
      $("#pullToRefresh #pullyText").html("Pull to refresh");

      // Ensure the icon is not in its "flipped" state.
      if ($("#pullToRefresh .icon").hasClass("flippedArrow"))
      {
        $("#pullToRefresh .icon").removeClass("flippedArrow");
      }

      // Adjust the position of the pull-down bar based on how much is pulled.
      // It follows the scroll, staying just above the content.
      $("#pullToRefresh").css({ top: Math.abs(window.scrollY) - 40 });

      // If refresh is capable (user pulled sufficiently at some point)
      // and the timeStarted isn't set, record the current time.
      if (pullToReload.refreshCapable === true && pullToReload.timeStarted === null)
      {
        // This timestamp helps determine if a quick "release" occurred.
        pullToReload.timeStarted = new Date();
      }
    }

    // Scenario 2: Reload threshold has been reached or exceeded.
    // User has pulled far enough up (scrollY is -40px or less).
    if (window.scrollY <= -40)
    {
      // Change the text to prompt the user to release.
      $("#pullToRefresh #pullyText").html("Release to refresh");

      // Flip the arrow icon to indicate readiness for refresh.
      if ( ! $( "#pullToRefresh .icon" ) . hasClass( "flippedArrow" ) )
      {
        $("#pullToRefresh .icon").addClass("flippedArrow");
      }

      // Pin the pull-to-refresh bar at the top of the viewport.
      $("#pullToRefresh").css({ top: 0 });

      // Mark the system as capable of refreshing.
      pullToReload.refreshCapable = true;

      // Clear the 'timeStarted' as the user is actively holding past the threshold.
      pullToReload.timeStarted = null;
    }

    // Scenario 3: User has released the pull-to-refresh bar.
    // This happens when scrollY returns to non-negative values *after* a pull.
    if (window.scrollY >= 0 && pullToReload.refreshCapable === true)
    {
      // If 'timeStarted' has a value, it means the user pulled up slightly and then released quickly.
      if (pullToReload.timeStarted !== null)
      {
        // Check how quickly the release occurred.
        var nowTime = new Date(),
            diff = nowTime.getTime() - pullToReload.timeStarted.getTime();

        // If the release was very quick (e.g., less than half a second), trigger reload.
        if (diff < 500)
        {
          pullToReload.reloadTheWeePageMate();
        }
      }
      else // If timeStarted is null, it means user released after crossing the -40px threshold.
      {
        // In this case, always reload, as it's a definite "release to refresh" action.
        pullToReload.reloadTheWeePageMate();
      }

      // Reset state variables after a potential reload trigger.
      pullToReload.timeStarted = null;
      pullToReload.refreshCapable = false;
    }

    // Always ensure the pull-to-refresh bar is hidden when not actively pulling.
    if (window.scrollY >= 0)
    {
      // Move the bar completely out of view.
      $("#pullToRefresh").css({ top: -40 });
    }

  }, // End of runScrollCommands.


  // -- Page Reload Function -----------------------------------------------

  /*
   * Initiates the visual reloading animation and then performs a page refresh.
   */
  reloadTheWeePageMate: function ()
  {
    // Fade in the "Reloading..." indicator.
    $("#pullToRefreshReloading").fadeIn(300);

    // Pause briefly to allow the user to see the reloading animation.
    setTimeout(function() {
      // Execute the actual page reload.
      window.location.reload();
    }, 750); // Wait for 750 milliseconds before reloading.
  }

}; // End of pullToReload object definition.


// On document ready, initialize the pull-to-reload functionality.
// This ensures the DOM is fully loaded before attempting to inject HTML or bind events.
$(document).ready(pullToReload.init);