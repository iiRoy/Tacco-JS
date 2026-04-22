/* eslint-disable no-unused-vars */
/* eslint-disable no-undef */
/* jshint asi: true */
/* globals templateEngine, webPlatform, console, require, hashGen */

// Determine the execution environment: browser extension vs. desktop application
const Env = {
  BROWSER_EXTENSION: "browser_extension",
  DESKTOP_APP: "desktop_app",
  UNKNOWN: "unknown_environment"
};

let currentEnv = Env.UNKNOWN;
if (typeof webPlatform !== 'undefined' && webPlatform && typeof webPlatform.extension !== 'undefined') {
  currentEnv = Env.BROWSER_EXTENSION;
} else if (typeof process !== 'undefined' && process.versions && process.versions['nw']) {
  currentEnv = Env.DESKTOP_APP;
}

// Global application object
const auraCast = {};

// Cache commonly used DOM elements
const DOM = {
  body: null,
  panel: null,
  container: null,
  settingsPanel: null,
  accordion: null,
  creditsSection: null,
  proSection: null,
  locationList: null,
  sliderControls: null
};

// Initialize the application after the DOM is fully loaded
jQuery(document).ready(function() {
  // Store references to key DOM elements
  DOM.body = jQuery("body");
  DOM.panel = jQuery("#panel");
  DOM.container = jQuery("#container");
  DOM.settingsPanel = jQuery("#settings");
  DOM.accordion = jQuery("#accordion");
  DOM.creditsSection = jQuery("#credits");
  DOM.proSection = jQuery("#pro");
  DOM.locationList = jQuery(".locationSettings ul");
  DOM.sliderControls = jQuery("#panel .sliderControls");

  // Desktop App (NW.js) specific initializations
  if (currentEnv === Env.DESKTOP_APP) {
    // Load native UI library and configure the main window
    const desktopUI = require('nw.gui');
    const mainWindow = desktopUI.Window.get();

    // Show the window and open developer tools for debugging
    mainWindow.show();
    if (localStorage.getItem('auraDebugMode') === 'true') {
      mainWindow.showDevTools();
    }

    // Bind window control handlers
    DOM.panel.find(".close").on('click', () => mainWindow.close());
    DOM.panel.find(".minimize").on('click', () => mainWindow.minimize());

    // Handle external links: open them in the default browser
    DOM.body.on("click", "a[href]:not([href='#'])", function(eventObj) {
      eventObj.preventDefault();
      desktopUI.Shell.openExternal(jQuery(eventObj.currentTarget).attr("href"));
    });

    // Keyboard navigation for weather panes
    jQuery(document).on('keydown', (eventObj) => {
      if (eventObj.key === "ArrowLeft" || eventObj.keyCode === 37) { // Left arrow
        DOM.sliderControls.find(".left").trigger("click");
      } else if (eventObj.key === "ArrowRight" || eventObj.keyCode === 39) { // Right arrow
        DOM.sliderControls.find(".right").trigger("click");
      }
    });

    // Disable window dragging for specific interactive elements
    const noDragSelectors = ".close, .minimize, .sync-trigger, .sliderControls, #settings, #credits a, #credits img, .city div span";
    DOM.body.on("mouseover", noDragSelectors, () => DOM.body.removeClass('draggable-window'))
           .on("mouseout", noDragSelectors, () => DOM.body.addClass('draggable-window'));

  } else if (currentEnv === Env.BROWSER_EXTENSION) {
    DOM.body.removeClass('draggable-window'); // No dragging in browser extensions
    console.info("Running as a Browser Extension.");
  } else {
    console.warn("Unknown environment detected.");
  }

  // Apply environment-specific and font-specific CSS classes
  DOM.body.addClass(currentEnv).addClass(localStorage.getItem('auraFontPref') || 'ubuntu');

  // Load and inject application settings into the DOM
  DOM.body.append(auraCast.initializeSettingsPanel());
  auraCast.refreshWeatherDataDisplay(); // Initial data refresh

  // Apply background colors to elements based on data-color attribute
  jQuery("span[data-color]:not([data-color=gradient])").each(function() {
    jQuery(this).css('background-color', '#' + jQuery(this).attr("data-color"));
  });

  // Enable sortable functionality for location list (excluding the input field)
  DOM.locationList.sortable({
    items: ':not(.placeInput)'
  });

  // Set the default font selection in settings
  DOM.settingsPanel.find(".font-selector").val(localStorage.getItem('auraFontPref'));

  // Initialize the accordion component for settings sections
  DOM.accordion.collapse({
    accordion: true,
    persist: false,
    open: function() {
      jQuery(this).addClass("is-open");
      jQuery(this).css({ height: jQuery(this).children().first().outerHeight() });
    },
    close: function() {
      jQuery(this).css({ height: "0px" });
      jQuery(this).removeClass("is-open");
    }
  });

  // Populate credits and pro sections using templates
  document.getElementById('credits').innerHTML = templateEngine.templates['credits.template']();
  document.getElementById('pro').innerHTML = templateEngine.templates['pro.template']();

  // Handle license key input in the Pro section
  DOM.proSection.find("textarea").on("keyup cut paste change", function() {
    // Small delay to ensure the value is updated before processing
    setTimeout(() => {
      localStorage.setItem('auraLicenseKey', jQuery(this).val());
      if (auraCast.verifyProLicense()) {
        jQuery(this).prop("disabled", true);
        DOM.proSection.find(".activated-message").show();
      }
    }, 50); // Increased delay slightly
  });

  // Event delegation for opening and closing credits/pro modal dialogs
  DOM.body.on("click", "a.show-credits", () => DOM.creditsSection.addClass("show-modal animate-in"));
  DOM.body.on("click", "a.show-pro", () => DOM.proSection.addClass("show-modal animate-in"));
  DOM.creditsSection.find("img, .close-button").on('click', () => DOM.creditsSection.removeClass("show-modal"));
  DOM.proSection.find("img, .close-button").on('click', () => DOM.proSection.removeClass("show-modal"));


  // Slider controls for navigating weather panes
  DOM.sliderControls.find("img").on('click', function() {
    const currentElement = jQuery(this);
    DOM.container.find("ul").addClass("transitioning").one("transitionend webkitTransitionEnd", function() {
      let currentPane = DOM.container.find(".current-pane");
      let targetPane;

      if (currentElement.hasClass("left")) { // Navigate left
        targetPane = currentPane.prev("li");
        if (!targetPane.length) { // Loop to last if at first
          targetPane = DOM.container.find("li").last();
        }
      } else { // Navigate right
        targetPane = currentPane.next("li");
        if (!targetPane.length) { // Loop to first if at last
          targetPane = DOM.container.find("li").first();
        }
      }

      currentPane.removeClass('current-pane');
      targetPane.addClass('current-pane');

      jQuery(this).off("transitionend webkitTransitionEnd").removeClass("transitioning");
      auraCast.updateBackgroundColor(); // Update background based on new pane
    });
  });

  // Sync button functionality: trigger data refresh
  DOM.panel.find(".sync-trigger").on('click', function() {
    jQuery(this).addClass("pulse-animation"); // Visual feedback
    auraCast.requestDataRefresh(true); // Request a data update and soft reload
  });

  // Automatic data refresh for desktop app after initial load
  if (currentEnv === Env.DESKTOP_APP) {
    // Delay initial sync to allow for potential upgrades or background processes
    setTimeout(() => DOM.panel.find(".sync-trigger").trigger("click"), 5000);
  }

  // Handle clicks on the panel for showing/hiding settings
  DOM.panel.on('click', function(eventObj) {
    if (jQuery(eventObj.target).hasClass("settings-icon")) {
      DOM.settingsPanel.fadeToggle(200);
      // If settings are visible and the first accordion section is closed, open it
      if (DOM.settingsPanel.is(":visible") && DOM.accordion.children().first().prop("aria-hidden") === true) {
        DOM.accordion.children().first().find("a").trigger("click");
      }
    } else {
      // If settings are visible and click is outside settings icon, hide settings
      if (DOM.settingsPanel.is(":visible") && !jQuery(eventObj.target).closest("#settings").length) {
        DOM.settingsPanel.fadeOut(200);
      }
    }
  });

  // Schedule periodic soft reloads to keep data somewhat fresh
  // Using setTimeout recursively for better control than setInterval
  const scheduleNextSoftReload = () => {
    // This interval is quite long, assuming background updates handle most freshness
    const reloadIntervalMs = 1000 * 60 * 60 * 24; // 24 hours, could be dynamic
    setTimeout(() => {
      auraCast.softRefreshDataDisplay();
      scheduleNextSoftReload(); // Schedule the next reload
    }, reloadIntervalMs);
  };
  scheduleNextSoftReload(); // Start the periodic reload cycle
});


/**
 * Performs a full refresh of weather data and re-renders all panes.
 */
auraCast.refreshWeatherDataDisplay = function() {
  const renderTemplate = templateEngine.templates['pane.template'];
  let cachedWeather = JSON.parse(localStorage.getItem('auraWeatherData') || '[]');

  DOM.container.find('ul').empty(); // Clear existing panes

  if (cachedWeather.length === 0) {
    // Handle case where there's no cached data (e.g., first run)
    DOM.container.find('ul').append("<li><div class='no-data-message'>No weather data available. Please add a location in settings and sync.</div></li>");
    console.warn("No weather data found in cache. Displaying placeholder.");
  } else {
    // Populate container with new weather panes
    cachedWeather.forEach((weatherItem, index) => {
      const listItem = jQuery("<li><div></div></li>");
      listItem.find("div").html(renderTemplate(weatherItem));
      DOM.container.find("ul").append(listItem);
    });

    // Set the first pane as current, or the middle one if available
    const middleIndex = Math.floor(cachedWeather.length / 2);
    DOM.container.find("li").eq(middleIndex).addClass("current-pane");
  }

  // Adjust dimensions for desktop app (if applicable)
  if (currentEnv === Env.DESKTOP_APP) {
    auraCast.adjustWindowDimensions(300, 500);
  }

  auraCast.resizeTextElements(); // Resize dynamic text
  auraCast.updateBackgroundColor(); // Update background based on current pane
};


/**
 * Performs a soft refresh, updating content of existing panes without re-creating them.
 * Useful for updating data without visual transitions.
 */
auraCast.softRefreshDataDisplay = function() {
  const renderTemplate = templateEngine.templates['pane.template'];
  const cachedWeather = JSON.parse(localStorage.getItem('auraWeatherData') || '[]');
  const weatherPanes = DOM.container.find("li > div");

  try {
    if (cachedWeather.length === 0 && weatherPanes.length > 0) {
      // If cache is empty but panes exist, clear them
      DOM.container.find('ul').empty();
      DOM.container.find('ul').append("<li><div class='no-data-message'>No weather data available. Please add a location in settings and sync.</div></li>");
      console.warn("Weather cache is empty, clearing existing panes.");
    } else if (cachedWeather.length > 0) {
      // Update content of existing panes
      cachedWeather.forEach((weatherItem, index) => {
        if (weatherPanes[index]) {
          jQuery(weatherPanes[index]).html(renderTemplate(weatherItem));
        } else {
          // If new data has more items than existing panes, trigger a hard reload
          console.log("New weather data count mismatch. Triggering full refresh.");
          auraCast.refreshWeatherDataDisplay();
          return; // Exit early after triggering hard reload
        }
      });
    }
  } catch (err) {
    console.error("Error during soft data refresh:", err);
    console.log("Running from temporary cache for now. Attempting a full refresh.");
    auraCast.refreshWeatherDataDisplay(); // Fallback to hard reload on error
  }

  // Re-apply desktop app dimensions if needed (idempotent)
  if (currentEnv === Env.DESKTOP_APP) {
    auraCast.adjustWindowDimensions(300, 500);
  }

  auraCast.resizeTextElements(); // Ensure text is resized
  auraCast.updateBackgroundColor(); // Update background
  DOM.panel.find(".sync-trigger").removeClass("pulse-animation"); // Remove sync animation
};

/**
 * Updates the background color of the main container based on the current weather pane
 * and user's color scheme preference.
 */
auraCast.updateBackgroundColor = function() {
  const colorScheme = localStorage.getItem('auraColorScheme');
  const currentPaneMiddle = DOM.container.find(".current-pane .middle");

  if (colorScheme === "gradient" || colorScheme === "weather-theme") {
    DOM.container.css('background-color', currentPaneMiddle.attr("data-background"));
  } else if (colorScheme === "desktop-sync") {
    // Attempt to sync with desktop background color for NW.js
    auraCast.getDesktopBackgroundColor().then(bgColor => {
      DOM.container.css('background-color', bgColor);
    }).catch(error => {
      console.warn("Could not get desktop background color:", error);
      DOM.container.css('background-color', "#444444"); // Fallback
    });
  } else if (colorScheme) {
    // Apply a static color if specified
    DOM.container.css('background-color', colorScheme);
  } else {
    // Default fallback color
    DOM.container.css('background-color', "#333333");
  }
};

/**
 * Generates the HTML for the settings panel and attaches event handlers.
 * @returns {string} The HTML string for the settings panel.
 */
auraCast.initializeSettingsPanel = function() {
  const settingsData = {};

  // Initialize measurement unit display
  const tempUnit = localStorage.getItem('auraTempUnit') || 'c';
  settingsData.measurementUnits = jQuery("<div><span data-type='c'><img src='img/climacons/Degrees-Celcius.svg'></span><span data-type='f'><img src='img/climacons/Degrees-Fahrenheit.svg'></span><span data-type='k'>K</span></div>")
    .children().filter(`[data-type=${tempUnit}]`).addClass("selected").parent().html();

  // Initialize speed unit display
  const windUnit = localStorage.getItem('auraWindUnit') || 'mph';
  settingsData.speedUnits = jQuery("<div><span data-type='mph'>mph</span><span data-type='kph'>kph</span><span data-type='ms'>m/s</span></div>")
    .children().filter(`[data-type=${windUnit}]`).addClass("selected").parent().html();

  // Initialize color scheme display
  const colorScheme = localStorage.getItem('auraColorScheme') || 'gradient';
  settingsData.colorOptions = jQuery("<div><span data-type='gradient' data-color='gradient'>Temperature</span><span data-type='weather-theme' data-color='weather'>Weather</span></div>")
    .children().filter(`[data-type=${colorScheme}]`).addClass("selected").parent().html();
  if (!settingsData.colorOptions) { // Fallback if no option matches
    settingsData.colorOptions = "<span data-type='gradient' data-color='gradient'>Temperature</span><span data-type='weather-theme' data-color='weather'>Weather</span>";
  }

  // Load stored locations
  settingsData.locationEntries = JSON.parse(localStorage.getItem('auraLocationList') || '[]');

  // Checkbox states
  settingsData.syncDesktopBg = (localStorage.getItem('auraColorScheme') === 'desktop-sync');
  settingsData.showLauncherCount = (localStorage.getItem('auraShowCount') === 'true');
  settingsData.useAverageTemp = (localStorage.getItem('auraAvgTemp') === 'true');

  // Pro button visibility
  settingsData.showProUpgrade = (currentEnv === Env.BROWSER_EXTENSION && !auraCast.verifyProLicense());

  // Translations (assuming $.i18n is available)
  settingsData.labels = {
    locations: jQuery.i18n._("Locations"),
    appearance: jQuery.i18n._("Appearance"),
    other: jQuery.i18n._("Other Settings"),
    addLocation: jQuery.i18n._("Add New Location"),
    chameleonBg: jQuery.i18n._("Use Chameleonic Background"),
    showCount: jQuery.i18n._("Show Temperature in Launcher"),
    averageTemp: jQuery.i18n._("Use Average Temperature"),
    supportLink: jQuery.i18n._("Support Website"),
    creditsLink: jQuery.i18n._("Credits & Attributions"),
    goPro: jQuery.i18n._("Go Pro for More Features")
  };

  // Only set up event handlers once
  if (!auraCast.settingsEventHandlersInitialized) {
    auraCast.settingsEventHandlersInitialized = true;

    // Helper function to trigger data refresh
    const triggerDataRefresh = (isHardReload = false) => {
      auraCast.requestDataRefresh(isHardReload);
    };

    // Toggle switch handlers for measurement, speed, and color schemes
    DOM.body.on('click', '.toggle-switch span', function() {
      const parentSwitch = jQuery(this).parent();
      if (parentSwitch.hasClass("color-scheme-toggle") && !auraCast.verifyProLicense()) {
        return; // Prevent changes if not pro
      }
      parentSwitch.children().removeClass('selected');
      const settingKey = parentSwitch.attr("data-setting-key");
      localStorage.setItem(`aura${settingKey}`, jQuery(this).addClass('selected').attr("data-type"));
      triggerDataRefresh(true); // Hard reload for unit/scheme changes
    });

    // Font selector handler
    DOM.body.on('change', '.font-selector', function() {
      if (auraCast.verifyProLicense()) {
        DOM.body.removeClass(localStorage.getItem('auraFontPref')).addClass(jQuery(this).val());
        localStorage.setItem('auraFontPref', jQuery(this).val());
      } else {
        jQuery(this).val("ubuntu"); // Revert if not pro
      }
    });

    // Color box selection handler
    DOM.body.on('click', '.color-boxes span', function() {
      if (!auraCast.verifyProLicense()) {
        return;
      }
      const selectedColor = jQuery(this).attr("data-color");
      if (selectedColor === "gradient") {
        localStorage.setItem('auraColorScheme', 'gradient');
        DOM.container.attr("style", ""); // Clear direct style
        jQuery(".toggle-switch.color-scheme-toggle [data-type='gradient']").addClass("selected");
      } else {
        localStorage.setItem('auraColorScheme', '#' + selectedColor);
        DOM.container.css('background-color', '#' + selectedColor);
        jQuery(".toggle-switch.color-scheme-toggle span").removeClass("selected"); // Deselect gradient/weather
      }
      triggerDataRefresh(false);
    });

    // Checkbox handlers
    DOM.body.on('change', '#desktop-sync-toggle', function() {
      localStorage.setItem('auraColorScheme', jQuery(this).is(':checked') ? 'desktop-sync' : 'gradient');
      triggerDataRefresh(false);
    });
    DOM.body.on('change', '#launcher-count-toggle', function() {
      localStorage.setItem('auraShowCount', jQuery(this).is(':checked') ? 'true' : 'false');
      triggerDataRefresh(true); // Hard reload to reflect launcher changes
    });
    DOM.body.on('change', '#average-temp-toggle', function() {
      localStorage.setItem('auraAvgTemp', jQuery(this).is(':checked') ? 'true' : 'false');
      triggerDataRefresh(true); // Hard reload
    });

    // Location input logic
    const locationInputSelector = '.locationSettings ul li.placeInput input';
    const statusIndicatorSelector = '.locationSettings ul li.placeInput .status-indicator';
    let typingTimer;
    const doneTypingInterval = 1500; // 1.5 seconds

    const handleLocationInput = () => {
      jQuery(statusIndicatorSelector).attr('class', 'status-indicator thinking');
      const inputValue = jQuery(locationInputSelector).val();

      const processLocationResponse = (responseData) => {
        if (!responseData || !responseData.zip || !responseData.place) {
          jQuery(statusIndicatorSelector).attr('class', 'status-indicator error');
        } else {
          jQuery(statusIndicatorSelector).attr({
            'class': 'status-indicator success',
            'data-zip-code': responseData.zip,
            'data-place-name': responseData.place
          });
        }
      };

      if (currentEnv === Env.BROWSER_EXTENSION) {
        webPlatform.extension.getBackgroundPage().skyCastCore.dataGet.zipcode(inputValue, processLocationResponse);
      } else if (currentEnv === Env.DESKTOP_APP) {
        skyCastCore.dataGet.zipcode(inputValue, processLocationResponse);
      } else {
        console.error("Cannot fetch location in unknown environment.");
        jQuery(statusIndicatorSelector).attr('class', 'status-indicator error');
      }
    };

    DOM.body.on('keyup', locationInputSelector, () => {
      clearTimeout(typingTimer);
      typingTimer = setTimeout(handleLocationInput, doneTypingInterval);
    }).on('keydown', locationInputSelector, () => {
      clearTimeout(typingTimer);
    });

    // Prevent adding more than 2 locations if not pro
    DOM.body.on('focus', '.locationSettings ul li.placeInput input', function() {
      if (auraCast.getLocationArray().length >= 2 && !auraCast.verifyProLicense()) {
        jQuery(this).blur(); // Remove focus
        // Optionally, show a message to the user
        console.warn("Pro version required for more than 2 locations.");
      }
    });

    // Click handler for the success checkmark to add a location
    DOM.body.on('click', statusIndicatorSelector, function() {
      const statusElem = jQuery(this);
      if (statusElem.hasClass('success')) {
        statusElem.removeClass('success');
        const zipCode = statusElem.attr('data-zip-code');
        const placeName = statusElem.attr('data-place-name');
        const newLocationItem = `<li data-zip-code="${zipCode}"><span class="location-name">${placeName}</span><span class="delete-location">✕</span></li>`;
        DOM.locationList.find('.placeInput').before(newLocationItem);
        jQuery(locationInputSelector).val(""); // Clear input

        localStorage.setItem('auraLocationList', auraCast.getLocationArrayJson());
        DOM.locationList.sortable("destroy").sortable({ items: ':not(.placeInput)' }); // Re-init sortable

        triggerDataRefresh(true);
        // Adjust settings panel height
        DOM.locationList.closest(".settings-section").css({ height: DOM.locationList.closest(".settings-section").children().first().outerHeight() });
      }
    });

    // Handle location sorting updates
    DOM.locationList.on("sortupdate", () => {
      localStorage.setItem('auraLocationList', auraCast.getLocationArrayJson());
      triggerDataRefresh(true);
    });

    // Handle location deletion
    DOM.body.on('click', '.locationSettings ul li .delete-location', function() {
      // Ensure at least one location remains unless it's the only one
      if (DOM.locationList.find('li:not(.placeInput)').length <= 1) {
        console.warn("Cannot delete the last location.");
        return; // Prevent deleting the last location
      }

      const elemToRemove = jQuery(this).parent();
      elemToRemove.addClass("deleting-animation");
      setTimeout(() => {
        elemToRemove.remove();
        localStorage.setItem('auraLocationList', auraCast.getLocationArrayJson());
        triggerDataRefresh(true);
        // Adjust settings panel height
        DOM.locationList.closest(".settings-section").css({ height: DOM.locationList.closest(".settings-section").children().first().outerHeight() });
      }, 600); // Match animation duration
    });
  }

  // Helper function to build the location array from DOM
  auraCast.getLocationArrayJson = () => {
    const locationDataArray = DOM.locationList.find('li:not(.placeInput)').map(function() {
      return {
        zip: jQuery(this).attr("data-zip-code"),
        place: jQuery(this).find('.location-name').text()
      };
    }).get(); // .get() converts jQuery object to a plain array
    return JSON.stringify(locationDataArray);
  };

  // Render the settings template
  return `<div id='settings' class='settings-panel'>${templateEngine.templates['settings.template'](settingsData)}</div>`;
};

/**
 * Requests a data refresh from the core service.
 * @param {boolean} isHardReload - True for a full data fetch and re-render, false for soft update.
 */
auraCast.requestDataRefresh = function(isHardReload) {
  const currentLocations = JSON.parse(localStorage.getItem('auraLocationList') || '[]');
  const callback = () => {
    if (isHardReload) {
      auraCast.refreshWeatherDataDisplay();
    } else {
      auraCast.softRefreshDataDisplay();
    }
  };

  if (currentEnv === Env.BROWSER_EXTENSION) {
    webPlatform.extension.getBackgroundPage().skyCastCore.render(currentLocations, callback);
  } else if (currentEnv === Env.DESKTOP_APP) {
    skyCastCore.render(currentLocations, callback);
  } else {
    console.error("Cannot request data refresh in unknown environment.");
    callback(); // Still call callback to clear loading state
  }
};


/**
 * Adjusts the dimensions of the main application window (for desktop app).
 * @param {number} width - The target width.
 * @param {number} height - The target height.
 */
auraCast.adjustWindowDimensions = function(width, height) {
  DOM.container.find("#background, .middle").width(width).height(height);
};

/**
 * Resizes specific text elements to fit their containers using the fitText plugin.
 */
auraCast.resizeTextElements = function() {
  jQuery(".city").fitText(0.29);
  jQuery(".left-temp").fitText(0.17); // Renamed from .left
  jQuery(".right-temp").fitText(0.5); // Renamed from .right
  jQuery(".forecast-day span.day-name").fitText(0.17); // Renamed from .forecast span.day
  jQuery(".forecast-day span.day-temp").fitText(0.15); // Renamed from .forecast span.temp
};

/**
 * Retrieves the desktop background color for NW.js applications.
 * @returns {Promise<string>} A promise that resolves with the hex color string.
 */
auraCast.getDesktopBackgroundColor = function() {
  return new Promise((resolve, reject) => {
    if (currentEnv !== Env.DESKTOP_APP) {
      return reject("Desktop background color sync is only available in the desktop application environment.");
    }
    try {
      const { exec } = require('child_process');
      exec("xprop -root | grep _GNOME_BACKGROUND_REPRESENTATIVE_COLORS", (error, stdout) => {
        if (error === null && stdout) {
          // Extract hex color from the xprop output
          const match = stdout.match(/#([0-9a-fA-F]{6})/);
          if (match && match[0]) {
            resolve(match[0]);
          } else {
            reject("Could not parse desktop background color from xprop output.");
          }
        } else {
          reject(error || "No output from xprop command.");
        }
      });
    } catch (err) {
      reject("Failed to execute xprop command: " + err.message);
    }
  }).catch(error => {
    console.error("Error getting desktop background color:", error);
    return "#444444"; // Default fallback color on error
  });
};

/**
 * Verifies if the Pro license is active.
 * @returns {boolean} True if the license is valid, false otherwise.
 */
auraCast.verifyProLicense = function() {
  const storedLicense = localStorage.getItem('auraLicenseKey') || '';
  // Hardcoded known valid hashes (replace with actual secure validation in a real app)
  const validHashes = [
    "e27643b46900f074d2215684787d5402a3922617f69e6b47c0b05b3e64d2716a", // Example hash 1
    "d29d494294d1f2e1e07d727b102b1f83c16260a9505a415712f275e7a9121a2c"  // Example hash 2
    // In a real app, this would involve server-side validation or more complex local checks.
  ];

  // Use a hashing utility (e.g., CryptoJS.SHA256) to check the license key
  const hashedLicense = hashGen.SHA256(storedLicense).toString();
  return validHashes.includes(hashedLicense);
};