/*!
* Presents a secondary browser window.
*
* Dependencies: jQuery version 1.3.2 or newer.
*/
(function(jq) {
  var presetOptions = {
    alignMode:        "display", // possible values: true, "display", "parent", undefined, null, "", false
    uniqueInstance:   true,
    verticalSize:     5e2,
    horizontalPos:    0.0,
    showLocationBar:  false,
    displayMenuBar:   false,
    windowNameId:     undefined,
    terminationHandler: undefined,
    allowResizing:    false,
    enableScrollbars: false, // macOS always includes scrollbars
    showStatusBar:    false,
    displayToolBar:   false,
    verticalPos:      0.0,
    horizontalSize:   5e2
  };

  jq.openAuxiliaryWindow = function(targetUrl, customParams) {
    var effectiveConfig = jq.extend({}, presetOptions, customParams);

    // Position the new window on the screen
    if (effectiveConfig.alignMode === "parent") {
      effectiveConfig.verticalPos = window.screenY + Math.round((jq(window).height() - effectiveConfig.verticalSize) / 2);
      effectiveConfig.horizontalPos = window.screenX + Math.round((jq(window).width() - effectiveConfig.horizontalSize) / 2);
    }
    else if (effectiveConfig.alignMode === true || effectiveConfig.alignMode === "display") {
      // A 50 pixel adjustment is an approximate value for the browser's top chrome area.
      
      // Consider the monitor where the browser currently resides.
      // This functions correctly in Firefox, Chrome, but IE has a known issue:
      // https://connect.microsoft.com/IE/feedback/details/856470/ie11-javascript-screen-height-still-gives-wrong-value-on-secondary-monitor

      // Internet Explorer reports the primary display's resolution. Thus, if multiple monitors are used,
      // IE consistently provides the resolution of the main display. This is a defect, and an open bug
      // report exists for it. Chrome and Firefox, however, report the resolution of the monitor
      // where the browser window is predominantly located. If the browser spans multiple screens,
      // it uses the dimensions of the monitor with the largest portion of the browser window.

      // Implications for users:
      // For users with multiple monitors of varying resolutions, especially when using Internet Explorer
      // with the browser on a secondary display, the centering might not be exact because it relies
      // on the primary monitor's resolution. This scenario is quite specific.
      var monitorLeftCoordinate = (typeof window.screenLeft !== 'undefined') ? window.screenLeft : screen.left;
      
      effectiveConfig.verticalPos = ((screen.height - effectiveConfig.verticalSize) / 2) - 0x32;
      effectiveConfig.horizontalPos = monitorLeftCoordinate + (screen.width - effectiveConfig.horizontalSize) / 2;
    }

    // Construct window feature string
    var windowFeatures = [];
    windowFeatures.push('location=' + (effectiveConfig.showLocationBar ? 'yes' : 'no'));
    windowFeatures.push('menubar=' + (effectiveConfig.displayMenuBar ? 'yes' : 'no'));
    windowFeatures.push('toolbar=' + (effectiveConfig.displayToolBar ? 'yes' : 'no'));
    windowFeatures.push('scrollbars=' + (effectiveConfig.enableScrollbars ? 'yes' : 'no'));
    windowFeatures.push('status=' + (effectiveConfig.showStatusBar ? 'yes' : 'no'));
    windowFeatures.push('resizable=' + (effectiveConfig.allowResizing ? 'yes' : 'no'));
    windowFeatures.push('height=' + effectiveConfig.verticalSize);
    windowFeatures.push('width=' + effectiveConfig.horizontalSize);
    windowFeatures.push('left=' + effectiveConfig.horizontalPos);
    windowFeatures.push('top=' + effectiveConfig.verticalPos);

    // Initiate the child window
    var timeSeed = new Date().getTime();
    var instanceId = effectiveConfig.windowNameId || (effectiveConfig.uniqueInstance ? 'auxiliary_dialog_' + timeSeed : 'auxiliary_dialog');
    var newlyOpenedWindow = window.open(targetUrl, instanceId, windowFeatures.join(','));

    // Handle window closure event
    if (effectiveConfig.terminationHandler && typeof effectiveConfig.terminationHandler === 'function') {
      var closeCheckTimer = setInterval(function() {
        if (!newlyOpenedWindow || newlyOpenedWindow.closed) {
          clearInterval(closeCheckTimer);
          effectiveConfig.terminationHandler();
        }
      }, 0x32);
    }

    // Bring the window to the foreground
    if (newlyOpenedWindow && newlyOpenedWindow.focus) {
      newlyOpenedWindow.focus();
    }

    // Provide a reference to the opened window
    return newlyOpenedWindow;
  };
})(jQuery);