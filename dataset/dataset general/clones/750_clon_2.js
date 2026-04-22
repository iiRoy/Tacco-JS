/* jshint asi: true */
/* global appBackend, renderEngine, browserApi, console, require, cryptoUtility */

// Determine the execution environment
if (typeof browserApi !== 'undefined') {
  window.envType = "browser"
} else {
  window.envType = "desktop"
}


var weatherApp = {}

jQuery(document).ready(function() {

  // Desktop Application Specific Settings
  if (window.envType === "desktop") {

    // Load native UI library for desktop
    var uiLib = require('nw.gui')
    var appWin = uiLib.Window.get()
    appWin.show()
    appWin.showDevTools()

    // Attach Event Handlers for Window Controls
    jQuery(".headerBar .shutDown").on("click", function() {
      appWin.close()
    })

    jQuery(".headerBar .shrink").on("click", function() {
      appWin.minimize()
    })

    // Configure external link opening behavior
    jQuery("body").on("click", "a", function(eventObj) {
      eventObj.preventDefault()
      if (jQuery(this).attr("urlLink") !== "#") {
        uiLib.Shell.openExternal(jQuery(eventObj.currentTarget).attr("urlLink"))
      }
    })

    jQuery(document).on("keydown", function(keyEvent) {
      if (keyEvent.keyCode === 37) {
        jQuery(".carouselNav .prev").trigger("activation")
      } else if (keyEvent.keyCode === 39) {
        jQuery(".carouselNav .next").trigger("activation")
      }
    });

    // Disable window dragging for specific UI elements
    jQuery("body").on("mouseenter", ".shutDown, .shrink, .synchronize, .carouselNav, #configPanel, #acknowledgments a, #acknowledgments img, .placeName div span", function() {
      jQuery("body").removeClass('draggable')
    }).on("mouseleave", ".shutDown, .shrink, .synchronize, .carouselNav, #configPanel, #acknowledgments a, #acknowledgments img, .placeName div span", function() {
      jQuery("body").addClass('draggable')
    })

  } else if (window.envType === "browser") {
    // Remove draggable class for browser environment
    jQuery("body").removeClass('draggable')
    console.info("Operating within Browser Environment")
  }


  // Initialize body classes and load settings
  jQuery("body").addClass(window.envType).addClass(localStorage.weatherApp_fontFamily).append(weatherApp.loadConfiguration())
  weatherApp.refreshDisplay()

  // Apply background colors based on data attributes
  jQuery("span[data-color-val]:not([data-color-val=blended])").each(function() {
    jQuery(this).css('background-color', '#' + jQuery(this).attr("data-color-val"))
  })

  // Enable sortable functionality for location list
  jQuery(".placeConfig ul").sortable({
    items: ':not(.inputLocation)'
  })

  // Set initial font selection in settings
  jQuery("#configPanel .fontSelect").val(localStorage.weatherApp_fontFamily)

  // Configure collapsible sections
  jQuery("#collapsibleMenu").collapse({
    accordion: true,
    persist: false,
    open: function() {
      this.addClass("expanded")
      this.css({ height: this.children().outerHeight() })
    },
    close: function() {
      this.css({ height: "0px" })
      this.removeClass("expanded")
    }
   })

  // Populate credits and premium section using templates
  document.querySelector('#acknowledgments').innerHTML = renderEngine.templates['acknowledgments.layout']()
  document.querySelector('#premiumFeature').innerHTML = renderEngine.templates['premiumFeature.layout']()

  // Handle license key input changes
  jQuery("#premiumFeature textArea").on("keyup cut paste change", function() {
    // Small delay to ensure value is updated
    setTimeout(function() {
      localStorage.weatherApp_licenseKey = jQuery("#premiumFeature textArea").val()
      if (weatherApp.isPremiumUser()) {
        jQuery("#premiumFeature textArea").prop("readOnly", true)
        jQuery("#premiumFeature .enabled").show()
      }
    }, 10)
  })

  // Attach various UI event handlers
  jQuery("body").on("click", "a.acknowledgmentsLink", function() {
    jQuery("#acknowledgments").addClass("visible animated")
  })
  jQuery("body").on("click", "a.premiumLink", function() {
    jQuery("#premiumFeature").addClass("visible animated")
  })
  jQuery("#acknowledgments img, #premiumFeature img").on("click", function() {
    jQuery("#acknowledgments, #premiumFeature").removeClass("visible")
  })

  // Handle carousel navigation clicks
  jQuery(".headerBar .carouselNav img").on("click", function() {
    var selfRef = this;
    jQuery("#mainDisplay ul").addClass("fadeEffect").on("transitionend", function() {
      if (jQuery(selfRef).hasClass("prev")) {
        if (!jQuery(".activeItem").is(":first-child")) {
          jQuery(".activeItem").removeClass("activeItem").prev().addClass('activeItem')
        }
      } else {
        if (jQuery(".activeItem").is(":last-child")) {
          jQuery(".activeItem").removeClass("activeItem")
          jQuery("#mainDisplay li:first").addClass('activeItem')
        } else {
          jQuery(".activeItem").removeClass("activeItem").next().addClass('activeItem')
        }
      }
      jQuery("#mainDisplay ul").off("transitionend").removeClass("fadeEffect")
      weatherApp.updatePosition()
    })
  })

  // Handle data synchronization button click
  jQuery(".headerBar .synchronize").on("click", function() {
    jQuery(this).addClass("pulsate")
    if (window.envType === "browser") {
      browserApi.extension.getBackgroundPage().appBackend.renderData(JSON.parse(localStorage.weatherApp_locations), function() {
        weatherApp.partialRefresh()
      })
    } else {
      appBackend.renderData(JSON.parse(localStorage.weatherApp_locations), function() {
        weatherApp.partialRefresh()
      })
    }
  })

  // Trigger initial sync for desktop app after a delay
  if (window.envType === "desktop") {
    setTimeout(function() {
      jQuery(".headerBar .synchronize").trigger("activation")
    }, 5 * 1000) // 5 seconds delay
  }


  // Handle clicks on the header bar for settings panel
  jQuery(".headerBar").on("click", function(clickEvent) {
    if (jQuery(clickEvent.target).hasClass("configIcon")) {
      jQuery("#configPanel").fadeToggle(200)
      if (jQuery("#configPanel").is(":visible") && jQuery(jQuery("#collapsibleMenu").children()[1]).prop("hiddenAttribute") === true) {
        jQuery("#collapsibleMenu").children().first().find("a").trigger("activation")
      }
    } else {
      if (jQuery("#configPanel").is(":visible")) {
        jQuery("#configPanel").fadeOut(200)
      }
    }
  })

  // Set up periodic data refresh
  setInterval(function() {
    weatherApp.partialRefresh()
  }, 1000 * 1000) // Every 1 million milliseconds (1000 seconds)
})

// Function to perform a full data refresh and re-render
weatherApp.refreshDisplay = function() {

  var displayTemplate = renderEngine.templates['viewPane.layout'],
    forecastData = JSON.parse(localStorage.weatherApp_cache)

  jQuery('#mainDisplay ul').html("")

  for (var idx in forecastData) {
    jQuery("#mainDisplay ul").append("<li><div></div></li>")
    jQuery("#mainDisplay li > div")[idx].innerHTML = displayTemplate(forecastData[idx])
  }

  jQuery('.centerElement').first().parent().parent().addClass("activeItem")

  // Apply hardcoded dimensions for desktop environment
  if (window.envType === "desktop") {
    weatherApp.setDimensions(300, 500)
  }

  weatherApp.fixTextSizes()
  weatherApp.updatePosition()
}

// Function to perform a partial data refresh (update existing elements)
weatherApp.partialRefresh = function() {
  var displayTemplate = renderEngine.templates['viewPane.layout'],
      forecastData = JSON.parse(localStorage.weatherApp_cache)

  // Annoyed by the number of try-catch blocks needed
  try {
    for (var idx in forecastData) {
      jQuery("#mainDisplay li > div")[idx].innerHTML = displayTemplate(forecastData[idx])
    }
  } catch (operationError) {
    console.warn("Using temporary cached information. Initiating full data refresh.")
    weatherApp.refreshDisplay()
  }

  // This might be redundant but needed for bug fixes
  if (window.envType === "desktop") {
    weatherApp.setDimensions(300, 500)
  }

  weatherApp.fixTextSizes()
  weatherApp.updatePosition()
  jQuery(".headerBar .synchronize").removeClass("pulsate")
}

// Adjust background color based on current active item or settings
weatherApp.updatePosition = function() {
  if (localStorage.weatherApp_backgroundColor === "blended" || localStorage.weatherApp_backgroundColor === "weather") {
    jQuery('#mainDisplay').css('background-color', jQuery(".activeItem .centerElement").attr("data-bg-color"))
  } else if (localStorage.weatherApp_backgroundColor === "desktop") {
    jQuery('#mainDisplay').css('background-color', weatherApp.getDesktopThemeColor())
  } else {
    jQuery('#mainDisplay').css('background-color', localStorage.weatherApp_backgroundColor)
  }
}

// Loads and renders the settings panel
weatherApp.loadConfiguration = function() {

  var configObject = {}

  // Sets measurement units for speed and temperature
  configObject.unitMeasure = jQuery("<div><span data-option-type='c'><img src='img/climacons/Degrees-Celcius.svg'></span><span data-option-type='f'><img src='img/climacons/Degrees-Fahrenheit.svg'></span><span data-option-type='k'>K</span></div>").children().filter("[data-option-type=" + localStorage.weatherApp_units +"]").addClass("activeChoice").parent().html()
  configObject.windSpeedUnit = jQuery("<div><span data-option-type='mph'>mph</span><span data-option-type='kph'>kph</span><span data-option-type='ms'>m/s</span></div>").children().filter("[data-option-type=" + localStorage.weatherApp_windUnits +"]").addClass("activeChoice").parent().html()

  // This section needs refactoring for better practice.
  configObject.colorBlend = jQuery("<div><span data-option-type='blended' data-color-val='blended'>Temperature</span><span data-option-type='weather' data-color-val='weather'>Weather</span></div>").children().filter("[data-option-type=" + localStorage.weatherApp_backgroundColor +"]").addClass("activeChoice").parent().html()
  if (configObject.colorBlend === undefined) {
    configObject.colorBlend = "<span data-option-type='blended' data-color-val='blended'>Temperature</span><span data-option-type='weather' data-color-val='weather'>Weather</span>"
  }

  configObject.savedPlaces = JSON.parse(localStorage.weatherApp_locations)
  if (localStorage.weatherApp_backgroundColor === 'desktop') {
    configObject.desktopSync = true
  } else {
    configObject.desktopSync = false
  }
  if (localStorage.weatherApp_showLauncherTemp === 'true') {
    configObject.showCount = true
  } else {
    configObject.showCount = false
  }
  if (localStorage.weatherApp_averageTemp === 'true') {
    configObject.useAverage = true
  } else {
    configObject.useAverage = false
  }

  configObject.premiumButton = false
  if (window.envType === "browser" && weatherApp.licenseHashes.indexOf(cryptoUtility.SHA256(localStorage.weatherApp_licenseKey).toString()) === -1) {
    configObject.premiumButton = true
  }

  // Translation strings for settings
  configObject.placesLabel = jQuery.i18n._("Locations")
  configObject.appearanceLabel = jQuery.i18n._("Appearance")
  configObject.otherOptionsLabel = jQuery.i18n._("Other")
  configObject.addLocationLabel = jQuery.i18n._("Add Location")
  configObject.chameleonBgLabel = jQuery.i18n._("Use Chameleonic Background")
  configObject.showLauncherTempLabel = jQuery.i18n._("Show Temperature in Launcher")
  configObject.averageTempLabel = jQuery.i18n._("Use Average Temperature")
  configObject.supportLinkText = jQuery.i18n._("Support")
  configObject.acknowledgmentsLinkText = jQuery.i18n._("Credits")
  configObject.goPremiumText = jQuery.i18n._("Go Pro")

  // Set up event handlers for settings if not already done
  if (!weatherApp.configHandlersSet) {
    weatherApp.configHandlersSet = true;

    // Helper function to trigger data refresh
    var triggerRefresh = function(refreshType) {

      if (window.envType === "browser") {
        browserApi.extension.getBackgroundPage().appBackend.renderData(JSON.parse(localStorage.weatherApp_locations),
          function() {
            if (refreshType === "full") {
              weatherApp.refreshDisplay()
            } else {
              weatherApp.partialRefresh()
            }
          })
      } else {
        appBackend.renderData(JSON.parse(localStorage.weatherApp_locations),
          function() {
            if (refreshType === "full") {
              weatherApp.refreshDisplay()
            } else {
              weatherApp.partialRefresh()
            }
          })
      }
    }

    // Handle toggle switch clicks
    jQuery("body").on('click', '.toggleSwitch span', function() {
      if (jQuery(this).parent().hasClass("colorOption")) {
        // Check for premium feature access
        if (!weatherApp.isPremiumUser()) {
          return
        }
      }
      jQuery(this).parent().children().removeClass('activeChoice')
      console.log(jQuery(this).parent().attr("class"))
      localStorage.setItem("weatherApp_" + jQuery(this).parent().attr("class").replace("toggleSwitch ", ""), jQuery(this).addClass('activeChoice').attr("data-option-type"))

      triggerRefresh("full")
    })

    // Handle font selection changes
    jQuery("body").on('change', '.fontSelect', function() {
        if (weatherApp.isPremiumUser()) {
          jQuery("body").removeClass(localStorage.weatherApp_fontFamily).addClass(jQuery(this).val())
          localStorage.weatherApp_fontFamily = jQuery(this).val()
        } else {
          jQuery(this).val("systemFont")
        }
    })

    // Handle color box selection
    jQuery("body").on('click', '.colorOptions.swatches span', function() {
      if (weatherApp.isPremiumUser()) {
        localStorage.weatherApp_backgroundColor = "#" + jQuery(this).attr("data-color-val")
        jQuery(".toggleSwitch.colorOption").children().removeClass("activeChoice")
        if (jQuery(this).attr("data-color-val") === "blended") {
          jQuery("#mainBackground").attr("style", "")
          localStorage.weatherApp_backgroundColor = 'blended'
          jQuery(".toggleSwitch.colorOption [data-color-val=blended]").addClass("activeChoice")
        } else {
          jQuery("#mainDisplay").css('background-color', localStorage.weatherApp_backgroundColor)
        }
        triggerRefresh("soft")
      }
    })

    // TODO: This logic should be refactored.
    // Handle desktop background synchronization toggle
    jQuery("body").on('click', '#desktopColorToggle', function() {
      if (jQuery(this).is(':checked')) {
        localStorage.weatherApp_backgroundColor = 'desktop'
      } else {
        localStorage.weatherApp_backgroundColor = 'blended'
      }
    })

    // Handle launcher temperature count toggle
    jQuery("body").on('click', '#launcherCountToggle', function() {
      if (jQuery(this).is(':checked')) {
        localStorage.weatherApp_showLauncherTemp = 'true'
      } else {
        localStorage.weatherApp_showLauncherTemp = 'false'
      }
      triggerRefresh("full")
    })

    // Handle average temperature toggle
    jQuery("body").on('click', '#averageTempToggle', function() {
      if (jQuery(this).is(':checked')) {
        localStorage.weatherApp_averageTemp = 'true'
      } else {
        localStorage.weatherApp_averageTemp = 'false'
      }
      triggerRefresh("full")
    })

    var placeInputSelector = '.placeConfig ul li.inputLocation input',
      inputDelayMs = 1500,
      inputTimerId = '',
      inputStatusElement = '.placeConfig ul li.inputLocation .stateIndicator'

    // On keyup, start a countdown for input processing
    jQuery("body").on('keyup', placeInputSelector, function(){
      inputTimerId = setTimeout(processInputDone, inputDelayMs)
    }).on('keydown', placeInputSelector, function(){
    // On keydown, clear any existing countdown
      clearTimeout(inputTimerId)
    })

    var processInputDone = function() {
      jQuery(inputStatusElement).attr('class', 'processing state')

      var responseCallback = function(fetchedData) {
        if (fetchedData === undefined) {
          jQuery(inputStatusElement).attr('class', 'error state')
        } else {
          jQuery(inputStatusElement).attr({'class': 'success state', 'data-zip-code': fetchedData.zipCode, 'data-location-name': fetchedData.locationName})
        }
      }

      if (window.envType === "browser") {
        browserApi.extension.getBackgroundPage().appBackend.dataFetch.getZipCode(jQuery(placeInputSelector).val(), function(fetchedData) {
          responseCallback(fetchedData)
        })
      } else {
        appBackend.dataFetch.getZipCode(jQuery(placeInputSelector).val(), function(fetchedData) {
          responseCallback(fetchedData)
        })
      }

    }
    // Prevent adding more than two locations for non-premium users
    jQuery("body").on('focus', '.placeConfig ul li.inputLocation input', function() {
      if (JSON.parse(generateLocationList()).length > 1 && !weatherApp.isPremiumUser()) {
        jQuery(this).trigger("blur")
      }
    })

    // Handle click on the input status indicator (e.g., checkmark)
    jQuery("body").on('click', inputStatusElement, function() {
      if (jQuery(this).hasClass('success')) {
        jQuery(this).removeClass('success')
        jQuery('.placeConfig ul li.inputLocation').before('<li data-zip-code="' + jQuery(this).attr('data-zip-code') + '"><span class="placeName">' + jQuery(this).attr('data-location-name') + '</span><span class="removeEntry">&#10005;</span></li>')
        jQuery('.placeConfig ul li.inputLocation input').val("")

        // Save updated location list to local storage
        localStorage.weatherApp_locations = generateLocationList()

        // Re-initialize sortable for the updated list
        jQuery(".placeConfig ul").sortable("destroy")
        jQuery(".placeConfig ul").sortable({
          items: ':not(.inputLocation)'
        })

        triggerRefresh("full")

        // Adjust parent container height
        jQuery(".placeConfig").parent().parent().height(jQuery(".placeConfig").parent().outerHeight())
      }
    })

    // Handle sort order updates
    jQuery("body").on("sortupdate", ".placeConfig ul", function() {
      // Save new order and refresh display
      localStorage.weatherApp_locations = generateLocationList()
      triggerRefresh("full")
    })

    // Handle removal of a location entry
    jQuery("body").on('click', '.placeConfig ul li .removeEntry', function() {
      if (jQuery('.placeConfig ul li').length !== 2) { // Ensure at least one input field remains
        jQuery(this).parent().addClass("removing")
        var elementToRemove = jQuery(this).parent()
        setTimeout(function() {
          elementToRemove.remove()
          localStorage.weatherApp_locations = generateLocationList()

          triggerRefresh("full")

          jQuery(".placeConfig").parent().parent().height(jQuery(".placeConfig").parent().outerHeight())
        }, 600)
      }
    })
  }

  // Helper function to create a JSON string of current locations
  var generateLocationList = function() {
    var locationArray = []
    jQuery('.placeConfig ul li:not(:last-child)').each(function() {
      locationArray.push({zipCode: jQuery(this).attr("data-zip-code"), locationName: jQuery(this).find('.placeName').text()})
    })
    return JSON.stringify(locationArray)
  }
  return "<div id='configPanel'>" + renderEngine.templates['configLayout.layout'](configObject) + "</div>"
}

// Sets the dimensions of the main display elements
weatherApp.setDimensions = function(viewWidth, viewHeight) {
  jQuery("#mainBackground, .centerElement").width(viewWidth).height(viewHeight)
}

// Adjusts font sizes dynamically using fitText plugin
weatherApp.fixTextSizes = function() {
  jQuery(".cityName").adjustText(0.29)
  jQuery(".leftTemp").adjustText(0.17)
  jQuery(".rightTemp").adjustText(0.5)
  jQuery(".weatherForecast span.dayName").adjustText(0.17)
  jQuery(".weatherForecast span.tempValue").adjustText(0.15)
}

// Retrieves the desktop background color for Unity (Linux specific)
weatherApp.getDesktopThemeColor = function() {
  // Using direct DOM manipulation to avoid async issues with Node.js
  try {
    var executeCommand = require('child_process').exec;
    executeCommand("xprop -root | grep _GNOME_BACKGROUND_REPRESENTATIVE_COLORS", function(cmdError, outputStr) {
      if (cmdError === null) {
        jQuery("#mainDisplay").css("background-color", outputStr.substring(51, outputStr.length - 2))
      } else {
        jQuery("#mainDisplay").css("background-color", "#333333") // Default fallback color
      }
    })
  } catch (initializationError) {
    // Handle errors during process initialization, if any
  }
}

// Placeholder for premium feature check logic
weatherApp.isPremiumUser = function() {
  // This function would contain the actual logic to verify premium status
  // For demonstration, let's assume it's always true for now
  return true;
}

// Placeholder for license hashes (actual hashes would be here)
weatherApp.licenseHashes = []; // Example empty array for structure