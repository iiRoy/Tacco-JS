const runtimeEnvIdentifier = (function() {
  if (typeof chrome !== 'undefined' && chrome.extension) {
    return 'browserExtension';
  } else if (typeof require === 'function' && typeof process === 'object' && typeof process.versions === 'object' && process.versions.nw) {
    return 'nodeWebkitApp';
  } else {
    return 'unknownEnvironment';
  }
})();

const weatherDisplayModule = (function() {
  const internalModuleState = {};

  const authorizedLicenseHashes = []; // This array would typically be populated with valid hashes.

  const logApplicationActivity = (msg, level = 'info') => {
    if (typeof console !== 'undefined') {
      if (level === 'error' && console.error) console.error(msg);
      else if (level === 'warn' && console.warn) console.warn(msg);
      else if (console.log) console.log(msg);
    }
  };

  const checkUserAuthorizationStatus = () => {
    if (runtimeEnvIdentifier === 'browserExtension') {
      const storedLicenseKey = localStorage.getItem('app_user_license_key_value');
      if (storedLicenseKey && typeof CryptoJS !== 'undefined' && CryptoJS.SHA256) {
        const hashedKey = CryptoJS.SHA256(storedLicenseKey).toString();
        return authorizedLicenseHashes.includes(hashedKey);
      }
    }
    return true; // Assume pro for Node-Webkit or if no license check mechanism
  };

  const adjustDisplayPanelSizes = (widthParam, heightParam) => {
    const mainBackgroundLayer = document.getElementById('mainAppBackgroundLayer');
    const centralViewPanes = document.querySelectorAll('.contentPane');
    if (mainBackgroundLayer) {
      mainBackgroundLayer.style.width = `${widthParam}px`;
      mainBackgroundLayer.style.height = `${heightParam}px`;
    }
    centralViewPanes.forEach(area => {
      area.style.width = `${widthParam}px`;
      area.style.height = `${heightParam}px`;
    });
  };

  const applyDynamicTextScaling = () => {
    if (typeof fitText === 'function') {
      fitText(document.querySelector('.cityDisplayLabel'), 0.29);
      fitText(document.querySelector('.leftNavigationArrow'), 0.17);
      fitText(document.querySelector('.rightNavigationArrow'), 0.5);
      fitText(document.querySelectorAll('.dailyForecastSection .dayLabel'), 0.17);
      fitText(document.querySelectorAll('.dailyForecastSection .temperatureValue'), 0.15);
    } else {
      logApplicationActivity("Text scaling utility (fitText) not found.", "warn");
    }
  };

  const retrieveSystemWallpaperColor = () => {
    if (runtimeEnvIdentifier === 'nodeWebkitApp' && typeof require === 'function') {
      try {
        const osProcess = require('child_process');
        osProcess.exec("xprop -root | grep _GNOME_BACKGROUND_REPRESENTATIVE_COLORS", (errorInfo, outputData) => {
          const mainApplicationContainer = document.getElementById('mainApplicationContainer');
          if (errorInfo === null && mainApplicationContainer) {
            mainApplicationContainer.style.backgroundColor = outputData.substring(51, outputData.length - 2);
          } else if (mainApplicationContainer) {
            mainApplicationContainer.style.backgroundColor = '#444444';
          }
        });
      } catch (e) {
        logApplicationActivity(`Failed to retrieve system wallpaper color: ${e.message}`, 'error');
        const mainApplicationContainer = document.getElementById('mainApplicationContainer');
        if (mainApplicationContainer) mainApplicationContainer.style.backgroundColor = '#444444';
      }
    } else {
      logApplicationActivity("System wallpaper color feature is specific to Node-Webkit.", "info");
    }
  };

  const updateMainBackgroundStyle = () => {
    const colorSchemePreference = localStorage.getItem('app_background_color_scheme_key');
    const mainApplicationContainer = document.getElementById('mainApplicationContainer');

    if (!mainApplicationContainer) return;

    if (colorSchemePreference === 'dynamicGradientScheme' || colorSchemePreference === 'weatherDrivenScheme') {
      const activeContentPane = document.querySelector('.currentDisplayElement .contentPane');
      if (activeContentPane) {
        mainApplicationContainer.style.backgroundColor = activeContentPane.getAttribute('data-background-color');
      }
    } else if (colorSchemePreference === 'desktopWallpaperScheme') {
      retrieveSystemWallpaperColor();
    } else {
      mainApplicationContainer.style.backgroundColor = colorSchemePreference;
    }
  };

  const refreshApplicationDisplay = (fullContentRebuild = false) => {
    const weatherPanelTemplate = Handlebars.templates['weatherPanelTemplate'];
    let cachedWeatherDataContent;
    try {
      cachedWeatherDataContent = JSON.parse(localStorage.getItem('app_weather_cache_data'));
    } catch (e) {
      logApplicationActivity("Weather cache parsing failed, possibly empty or corrupt.", "error");
      cachedWeatherDataContent = [];
    }

    const weatherPanelListElement = document.getElementById('weatherPanelsList');

    if (!weatherPanelListElement) {
        logApplicationActivity("Weather panels list element not found.", "error");
        return;
    }

    if (fullContentRebuild) {
      weatherPanelListElement.innerHTML = '';
      cachedWeatherDataContent.forEach(dataItem => {
        const listItem = document.createElement('li');
        const contentDiv = document.createElement('div');
        listItem.appendChild(contentDiv);
        weatherPanelListElement.appendChild(listItem);
        contentDiv.innerHTML = weatherPanelTemplate(dataItem);
      });
      const firstMiddleElement = weatherPanelListElement.querySelector('.contentPane');
      if (firstMiddleElement) {
        firstMiddleElement.closest('li').classList.add('currentDisplayElement');
      }
    } else {
      try {
        const existingContentDivs = weatherPanelListElement.querySelectorAll('li > div');
        cachedWeatherDataContent.forEach((dataItem, index) => {
          if (existingContentDivs[index]) {
            existingContentDivs[index].innerHTML = weatherPanelTemplate(dataItem);
          }
        });
      } catch (err) {
        logApplicationActivity("Soft display refresh encountered an error, performing full rebuild.", "error");
        refreshApplicationDisplay(true);
      }
    }

    if (runtimeEnvIdentifier === 'nodeWebkitApp') {
      adjustDisplayPanelSizes(300, 500);
    }

    applyDynamicTextScaling();
    updateMainBackgroundStyle();
    const dataSyncButton = document.querySelector('.dataSynchronizationButton');
    if (dataSyncButton) dataSyncButton.classList.remove('pulsatingEffect');
  };

  const constructSettingsViewMarkup = () => {
    const settingsConfiguration = {};

    const createToggleSwitchHtml = (storageKey, options, defaultValue) => {
      const storedValue = localStorage.getItem(storageKey) || defaultValue;
      return `<div class="toggleControlSection" data-storage-key="${storageKey}">${options.map(opt => {
        const selectionClass = opt.type === storedValue ? 'selectedToggleOption' : '';
        return `<span data-type="${opt.type}" class="${selectionClass}">${opt.content}</span>`;
      }).join('')}</div>`;
    };

    settingsConfiguration.temperatureUnitControl = createToggleSwitchHtml(
      'app_temp_unit_setting',
      [
        { type: 'celsius', content: "<img src='img/climacons/Degrees-Celcius.svg'>" },
        { type: 'fahrenheit', content: "<img src='img/climacons/Degrees-Fahrenheit.svg'>" },
        { type: 'kelvin', content: "K" }
      ],
      'celsius'
    );
    settingsConfiguration.windSpeedUnitControl = createToggleSwitchHtml(
      'app_wind_speed_unit_setting',
      [
        { type: 'miles_per_hour', content: "mph" },
        { type: 'kilometers_per_hour', content: "kph" },
        { type: 'meters_per_second', content: "m/s" }
      ],
      'miles_per_hour'
    );

    const currentColorScheme = localStorage.getItem('app_background_color_scheme_key') || 'dynamicGradientScheme';
    const dynamicColorOptions = [
      { type: 'dynamicGradientScheme', content: "Temperature" },
      { type: 'weatherDrivenScheme', content: "Weather" }
    ];
    settingsConfiguration.dynamicColorOptionsHtml = dynamicColorOptions.map(opt => {
      const selectionClass = opt.type === currentColorScheme ? 'selectedToggleOption' : '';
      return `<span data-type="${opt.type}" data-color="${opt.type}" class="${selectionClass}">${opt.content}</span>`;
    }).join('');

    settingsConfiguration.locationListArray = JSON.parse(localStorage.getItem('app_saved_locations_data') || '[]');
    settingsConfiguration.useDesktopBackground = (localStorage.getItem('app_background_color_scheme_key') === 'desktopWallpaperScheme');
    settingsConfiguration.showLauncherTemperature = (localStorage.getItem('app_show_launcher_temp_flag') === 'true');
    settingsConfiguration.useAverageTemperature = (localStorage.getItem('app_use_average_temp_flag') === 'true');

    settingsConfiguration.displayProUpgradeButton = false;
    if (runtimeEnvIdentifier === 'browserExtension' && !checkUserAuthorizationStatus()) {
      settingsConfiguration.displayProUpgradeButton = true;
    }

    settingsConfiguration.locationsText = typeof $.i18n !== 'undefined' ? $.i18n._("Locations") : "Locations";
    settingsConfiguration.appearanceText = typeof $.i18n !== 'undefined' ? $.i18n._("Appearance") : "Appearance";
    settingsConfiguration.otherOptionsText = typeof $.i18n !== 'undefined' ? $.i18n._("Other") : "Other";
    settingsConfiguration.addLocationText = typeof $.i18n !== 'undefined' ? $.i18n._("Add Location") : "Add Location";
    settingsConfiguration.chameleonicBackgroundText = typeof $.i18n !== 'undefined' ? $.i18n._("Use Chameleonic Background") : "Use Chameleonic Background";
    settingsConfiguration.launcherTempText = typeof $.i18n !== 'undefined' ? $.i18n._("Show Temperature in Launcher") : "Show Temperature in Launcher";
    settingsConfiguration.averageTempText = typeof $.i18n !== 'undefined' ? $.i18n._("Use Average Temperature") : "Use Average Temperature";
    settingsConfiguration.websiteSupportText = typeof $.i18n !== 'undefined' ? $.i18n._("Support") : "Support";
    settingsConfiguration.creditsLinkText = typeof $.i18n !== 'undefined' ? $.i18n._("Credits") : "Credits";
    settingsConfiguration.goProText = typeof $.i18n !== 'undefined' ? $.i18n._("Go Pro") : "Go Pro";

    return `<div id='applicationConfigurationPanel'>${Handlebars.templates['settingsLayoutTemplate'](settingsConfiguration)}</div>`;
  };

  const invokeBackendWeatherService = (locationData, responseCallback) => {
    if (runtimeEnvIdentifier === 'browserExtension') {
      if (chrome.extension && chrome.extension.getBackgroundPage() && chrome.extension.getBackgroundPage().appBackendService) {
        chrome.extension.getBackgroundPage().appBackendService.executeWeatherRequest(locationData, responseCallback);
      } else {
        logApplicationActivity("Chrome background service is unavailable.", "error");
        responseCallback();
      }
    } else if (runtimeEnvIdentifier === 'nodeWebkitApp') {
      if (typeof appBackendService !== 'undefined') {
        appBackendService.executeWeatherRequest(locationData, responseCallback);
      } else {
        logApplicationActivity("Node-Webkit backend service is unavailable.", "error");
        responseCallback();
      }
    } else {
      logApplicationActivity("Unsupported environment for backend service invocation.", "warn");
      responseCallback();
    }
  };

  const invokeBackendGeocodingService = (queryInput, responseCallback) => {
    if (runtimeEnvIdentifier === 'browserExtension') {
      if (chrome.extension && chrome.extension.getBackgroundPage() && chrome.extension.getBackgroundPage().appBackendService) {
        chrome.extension.getBackgroundPage().appBackendService.locationDataFetcher.getPostalCodeInformation(queryInput, responseCallback);
      } else {
        logApplicationActivity("Chrome geocoding service is unavailable.", "error");
        responseCallback();
      }
    } else if (runtimeEnvIdentifier === 'nodeWebkitApp') {
      if (typeof appBackendService !== 'undefined') {
        appBackendService.locationDataFetcher.getPostalCodeInformation(queryInput, responseCallback);
      } else {
        logApplicationActivity("Node-Webkit geocoding service is unavailable.", "error");
        responseCallback();
      }
    } else {
      logApplicationActivity("Unsupported environment for geocoding service invocation.", "warn");
      responseCallback();
    }
  };

  const triggerDataRefreshProcess = (refreshMode = 'soft') => {
    const currentSavedLocations = JSON.parse(localStorage.getItem('app_saved_locations_data') || '[]');
    invokeBackendWeatherService(currentSavedLocations, () => {
      if (refreshMode === 'hard') {
        refreshApplicationDisplay(true);
      } else {
        refreshApplicationDisplay(false);
      }
    });
  };

  let eventListenersAttached = false;
  const initializeApplicationEventHandlers = () => {
    if (eventListenersAttached) return;
    eventListenersAttached = true;

    document.body.addEventListener('click', (event) => {
      const clickedElement = event.target;

      const toggleSwitchOption = clickedElement.closest('.toggleControlSection span');
      if (toggleSwitchOption) {
        const parentContainer = toggleSwitchOption.parentElement;
        if (parentContainer.classList.contains('colorSchemePreference')) {
          if (!checkUserAuthorizationStatus()) {
            return;
          }
        }
        Array.from(parentContainer.children).forEach(child => child.classList.remove('selectedToggleOption'));
        toggleSwitchOption.classList.add('selectedToggleOption');
        const storageKey = parentContainer.getAttribute('data-storage-key');
        localStorage.setItem(storageKey, toggleSwitchOption.getAttribute('data-type'));
        triggerDataRefreshProcess('hard');
        return;
      }

      const colorPaletteBox = clickedElement.closest('.colorSelectionGrid span');
      if (colorPaletteBox) {
        if (!checkUserAuthorizationStatus()) {
          return;
        }
        localStorage.setItem('app_background_color_scheme_key', colorPaletteBox.getAttribute('data-color'));
        const dynamicColorToggleDiv = document.querySelector('.toggleControlSection.colorSchemePreference');
        if (dynamicColorToggleDiv) {
          Array.from(dynamicColorToggleDiv.children).forEach(child => child.classList.remove('selectedToggleOption'));
          if (colorPaletteBox.getAttribute('data-color') === 'dynamicGradientScheme') {
             document.getElementById('mainAppBackgroundLayer').style.cssText = '';
             dynamicColorToggleDiv.querySelector('[data-color="dynamicGradientScheme"]').classList.add('selectedToggleOption');
          } else {
             document.getElementById('mainApplicationContainer').style.backgroundColor = localStorage.getItem('app_background_color_scheme_key');
          }
        }
        triggerDataRefreshProcess('soft');
        return;
      }

      if (clickedElement.matches('#desktopBackgroundToggleSwitch')) {
        if (clickedElement.checked) {
          localStorage.setItem('app_background_color_scheme_key', 'desktopWallpaperScheme');
        } else {
          localStorage.setItem('app_background_color_scheme_key', 'dynamicGradientScheme');
        }
        updateMainBackgroundStyle();
        return;
      }

      if (clickedElement.matches('#launcherTemperatureToggle')) {
        localStorage.setItem('app_show_launcher_temp_flag', clickedElement.checked ? 'true' : 'false');
        triggerDataRefreshProcess('hard');
        return;
      }

      if (clickedElement.matches('#averageTemperatureToggle')) {
        localStorage.setItem('app_use_average_temp_flag', clickedElement.checked ? 'true' : 'false');
        triggerDataRefreshProcess('hard');
        return;
      }

      const locationEntryStatusIcon = clickedElement.closest('.locationEntrySection .statusFeedbackIcon');
      if (locationEntryStatusIcon && locationEntryStatusIcon.classList.contains('validationSuccess')) {
        locationEntryStatusIcon.classList.remove('validationSuccess');
        const locationEntryList = document.querySelector('.locationSettingsListing ul');
        const inputLocationListItem = locationEntryList.querySelector('.locationEntrySection');
        const newItem = document.createElement('li');
        newItem.setAttribute('data-postal-code', locationEntryStatusIcon.getAttribute('data-code-identifier'));
        newItem.innerHTML = `<span class="locationDisplayLabel">${locationEntryStatusIcon.getAttribute('data-place-label')}</span><span class="deleteLocationButton">&#10005;</span>`;
        locationEntryList.insertBefore(newItem, inputLocationListItem);
        locationEntryList.querySelector('.locationEntrySection input').value = "";

        saveCurrentLocationOrder();
        configureSortableLocationList();
        triggerDataRefreshProcess('hard');
        adjustAccordionPanelSize(document.querySelector('.locationSettingsListing').closest('.accordionSection'));
        return;
      }

      const removeLocationItemButton = clickedElement.closest('.locationSettingsListing ul li .deleteLocationButton');
      if (removeLocationItemButton) {
        const parentListItem = removeLocationItemButton.closest('li');
        const locationList = parentListItem.closest('ul');
        if (locationList.children.length > 2) {
          parentListItem.classList.add('fadeAndRemove');
          setTimeout(() => {
            parentListItem.remove();
            saveCurrentLocationOrder();
            triggerDataRefreshProcess('hard');
            adjustAccordionPanelSize(document.querySelector('.locationSettingsListing').closest('.accordionSection'));
          }, 600);
        }
        return;
      }

      if (clickedElement.matches('a.showCreditsModal')) {
        document.getElementById('creditsInformationModal').classList.add('modalVisible', 'animatedTransition');
        event.preventDefault();
        return;
      }
      if (clickedElement.matches('a.showProFeaturesModal')) {
        document.getElementById('proFeaturesModal').classList.add('modalVisible', 'animatedTransition');
        event.preventDefault();
        return;
      }
      if (clickedElement.closest('#creditsInformationModal img') || clickedElement.closest('#proFeaturesModal img')) {
        document.getElementById('creditsInformationModal').classList.remove('modalVisible');
        document.getElementById('proFeaturesModal').classList.remove('modalVisible');
        return;
      }

      if (clickedElement.matches('.topControlBar .settingsCogIcon')) {
        const settingsPanel = document.getElementById('applicationConfigurationPanel');
        if (settingsPanel.style.display === 'none' || settingsPanel.style.display === '') {
          settingsPanel.style.display = 'block';
          settingsPanel.style.opacity = '0';
          setTimeout(() => settingsPanel.style.opacity = '1', 10);
          if (document.querySelector('.accordionContainer .accordionSection:nth-child(2)[aria-hidden="true"]')) {
            document.querySelector('.accordionContainer .accordionSection:first-child .accordionHeader').click();
          }
        } else {
          settingsPanel.style.opacity = '0';
          setTimeout(() => settingsPanel.style.display = 'none', 200);
        }
        return;
      } else if (document.getElementById('applicationConfigurationPanel') && document.getElementById('applicationConfigurationPanel').style.display !== 'none' && !clickedElement.closest('#applicationConfigurationPanel')) {
        const settingsPanel = document.getElementById('applicationConfigurationPanel');
        settingsPanel.style.opacity = '0';
        setTimeout(() => settingsPanel.style.display = 'none', 200);
        return;
      }

      const navigationArrowImage = clickedElement.closest('.topControlBar .panelNavigationArrows img');
      if (navigationArrowImage) {
        const panelListing = document.getElementById('weatherPanelsList');
        if (!panelListing) return;

        panelListing.classList.add('opacityFade');
        const transitionCompletionHandler = () => {
          if (navigationArrowImage.classList.contains('leftArrow')) {
            const currentDisplayItem = panelListing.querySelector('.currentDisplayElement');
            if (currentDisplayItem && currentDisplayItem.previousElementSibling && !currentDisplayItem.previousElementSibling.classList.contains('locationEntrySection')) {
              currentDisplayItem.classList.remove('currentDisplayElement');
              currentDisplayItem.previousElementSibling.classList.add('currentDisplayElement');
            }
          } else {
            const currentDisplayItem = panelListing.querySelector('.currentDisplayElement');
            if (currentDisplayItem && currentDisplayItem.nextElementSibling) {
              currentDisplayItem.classList.remove('currentDisplayElement');
              currentDisplayItem.nextElementSibling.classList.add('currentDisplayElement');
            } else if (currentDisplayItem) {
              currentDisplayItem.classList.remove('currentDisplayElement');
              panelListing.firstElementChild.classList.add('currentDisplayElement');
            }
          }
          panelListing.removeEventListener('transitionend', transitionCompletionHandler);
          panelListing.classList.remove('opacityFade');
          updateMainBackgroundStyle();
        };
        panelListing.addEventListener('transitionend', transitionCompletionHandler);
        return;
      }

      if (clickedElement.matches('.topControlBar .dataSynchronizationButton')) {
        clickedElement.classList.add('pulsatingEffect');
        triggerDataRefreshProcess('soft');
        return;
      }

      if (runtimeEnvIdentifier === 'nodeWebkitApp') {
        if (clickedElement.matches('.applicationWindowControls .closeAppButton')) {
          if (typeof require !== 'undefined') {
            require('nw.gui').Window.get().close();
          }
        } else if (clickedElement.matches('.applicationWindowControls .minimizeAppButton')) {
          if (typeof require !== 'undefined') {
            require('nw.gui').Window.get().minimize();
          }
        } else if (clickedElement.matches('a[href]:not([href="#"])')) {
          event.preventDefault();
          if (typeof require !== 'undefined') {
            require('nw.gui').Shell.openExternal(clickedElement.getAttribute('href'));
          }
        }
      }
    });

    document.body.addEventListener('change', (event) => {
        const changedElement = event.target;
        if (changedElement.matches('#fontSelectionDropdown')) {
            if (checkUserAuthorizationStatus()) {
                document.body.classList.remove(localStorage.getItem('app_preferred_font_name'));
                document.body.classList.add(changedElement.value);
                localStorage.setItem('app_preferred_font_name', changedElement.value);
            } else {
                changedElement.value = "ubuntu";
            }
        }
    });

    document.body.addEventListener('keyup', (event) => {
        const keyUpElement = event.target;
        if (keyUpElement.matches('#proFeaturesModal textarea')) {
            clearTimeout(internalModuleState.licenseKeyInputTimer);
            internalModuleState.licenseKeyInputTimer = setTimeout(() => {
                localStorage.setItem('app_user_license_key_value', keyUpElement.value);
                if (checkUserAuthorizationStatus()) {
                    keyUpElement.disabled = true;
                    document.querySelector('#proFeaturesModal .activationConfirmationMessage').style.display = 'block';
                }
            }, 10);
        }

        if (keyUpElement.matches('.locationEntrySection input')) {
            clearTimeout(internalModuleState.locationInputDebounceTimer);
            internalModuleState.locationInputDebounceTimer = setTimeout(() => processLocationQuery(keyUpElement), 1500);
        }
    });

    document.body.addEventListener('keydown', (event) => {
        const keyDownElement = event.target;
        if (keyDownElement.matches('.locationEntrySection input')) {
            clearTimeout(internalModuleState.locationInputDebounceTimer);
        }

        if (event.keyCode === 37) {
            document.querySelector('.topControlBar .panelNavigationArrows .leftArrow').click();
        } else if (event.keyCode === 39) {
            document.querySelector('.topControlBar .panelNavigationArrows .rightArrow').click();
        }
    });

    document.body.addEventListener('mouseover', (event) => {
        const hoveredElement = event.target;
        const nonDraggableElements = '.applicationWindowControls .closeAppButton, .applicationWindowControls .minimizeAppButton, .dataSynchronizationButton, .panelNavigationArrows, #applicationConfigurationPanel, #creditsInformationModal a, #creditsInformationModal img, .cityDisplayLabel span';
        if (hoveredElement.matches(nonDraggableElements) || hoveredElement.closest(nonDraggableElements)) {
            document.body.classList.remove('windowDraggable');
        }
    });
    document.body.addEventListener('mouseout', (event) => {
        const exitedElement = event.target;
        const nonDraggableElements = '.applicationWindowControls .closeAppButton, .applicationWindowControls .minimizeAppButton, .dataSynchronizationButton, .panelNavigationArrows, #applicationConfigurationPanel, #creditsInformationModal a, #creditsInformationModal img, .cityDisplayLabel span';
        if (exitedElement.matches(nonDraggableElements) || exitedElement.closest(nonDraggableElements)) {
            document.body.classList.add('windowDraggable');
        }
    });

    document.body.addEventListener('focusin', (event) => {
        const focusedElement = event.target;
        if (focusedElement.matches('.locationEntrySection input')) {
            const currentLocations = JSON.parse(localStorage.getItem('app_saved_locations_data') || '[]');
            if (currentLocations.length >= 2 && !checkUserAuthorizationStatus()) {
                focusedElement.blur();
            }
        }
    });

    const setupAccordionComponent = () => {
        const accordionComponent = document.getElementById('settingsAccordionComponent');
        if (!accordionComponent) return;

        accordionComponent.addEventListener('click', (event) => {
            const headerElement = event.target.closest('.accordionHeader');
            if (headerElement) {
                const panelElement = headerElement.closest('.accordionSection');
                const contentElement = panelElement.querySelector('.accordionContent');

                if (panelElement.classList.contains('activePanel')) {
                    contentElement.style.height = '0px';
                    panelElement.classList.remove('activePanel');
                    panelElement.setAttribute('aria-hidden', 'true');
                } else {
                    Array.from(accordionComponent.querySelectorAll('.accordionSection.activePanel')).forEach(activePanel => {
                        activePanel.querySelector('.accordionContent').style.height = '0px';
                        activePanel.classList.remove('activePanel');
                        activePanel.setAttribute('aria-hidden', 'true');
                    });
                    contentElement.style.height = `${contentElement.scrollHeight}px`;
                    panelElement.classList.add('activePanel');
                    panelElement.setAttribute('aria-hidden', 'false');
                }
            }
        });
    };
    setupAccordionComponent();

    let currentlyDraggedItem = null;
    let dragContainerReference = null;

    const saveCurrentLocationOrder = () => {
      const locationList = document.querySelector('.locationSettingsListing ul');
      const orderedLocations = Array.from(locationList.children)
          .filter(li => !li.classList.contains('locationEntrySection'))
          .map(li => ({
              zip: li.getAttribute('data-postal-code'),
              place: li.querySelector('.locationDisplayLabel').textContent
          }));
      localStorage.setItem('app_saved_locations_data', JSON.stringify(orderedLocations));
    };

    const configureSortableLocationList = () => {
      const locationList = document.querySelector('.locationSettingsListing ul');
      if (!locationList) return;

      locationList.removeEventListener('dragstart', handleItemDragStart);
      locationList.removeEventListener('dragover', handleItemDragOver);
      locationList.removeEventListener('drop', handleItemDrop);
      locationList.removeEventListener('dragend', handleItemDragEnd);

      locationList.addEventListener('dragstart', handleItemDragStart);
      locationList.addEventListener('dragover', handleItemDragOver);
      locationList.addEventListener('drop', handleItemDrop);
      locationList.addEventListener('dragend', handleItemDragEnd);

      Array.from(locationList.children).forEach(li => {
        if (!li.classList.contains('locationEntrySection')) {
          li.setAttribute('draggable', 'true');
        } else {
          li.removeAttribute('draggable');
        }
      });
    };

    const handleItemDragStart = (e) => {
      currentlyDraggedItem = e.target.closest('li');
      if (currentlyDraggedItem && !currentlyDraggedItem.classList.contains('locationEntrySection')) {
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/html', currentlyDraggedItem.innerHTML);
        currentlyDraggedItem.classList.add('isDragging');
        dragContainerReference = currentlyDraggedItem.parentNode;
        setTimeout(() => currentlyDraggedItem.style.display = 'none', 0);
      } else {
        e.preventDefault();
      }
    };

    const handleItemDragOver = (e) => {
      e.preventDefault();
      if (currentlyDraggedItem && e.target.closest('li') !== currentlyDraggedItem && !e.target.closest('li.locationEntrySection')) {
        const targetListItem = e.target.closest('li');
        if (targetListItem && targetListItem.parentNode === dragContainerReference) {
          const boundingBox = targetListItem.getBoundingClientRect();
          const verticalOffset = boundingBox.y + (boundingBox.height / 2);
          if (e.clientY > verticalOffset) {
            dragContainerReference.insertBefore(currentlyDraggedItem, targetListItem.nextSibling);
          } else {
            dragContainerReference.insertBefore(currentlyDraggedItem, targetListItem);
          }
        }
      }
    };

    const handleItemDrop = (e) => {
      e.preventDefault();
      if (currentlyDraggedItem) {
        currentlyDraggedItem.style.display = 'block';
        currentlyDraggedItem.classList.remove('isDragging');
        saveCurrentLocationOrder();
        triggerDataRefreshProcess('hard');
      }
    };

    const handleItemDragEnd = (e) => {
      if (currentlyDraggedItem) {
        currentlyDraggedItem.classList.remove('isDragging');
        currentlyDraggedItem.style.display = 'block';
        currentlyDraggedItem = null;
      }
    };

    configureSortableLocationList();

    const processLocationQuery = (inputField) => {
      const feedbackIconElement = inputField.nextElementSibling;
      if (!feedbackIconElement) return;

      feedbackIconElement.className = 'statusFeedbackIcon processingQuery';

      const geocodeResponseHandler = (data) => {
        if (data === undefined || data === null) {
          feedbackIconElement.className = 'statusFeedbackIcon queryError';
        } else {
          feedbackIconElement.className = 'statusFeedbackIcon validationSuccess';
          feedbackIconElement.setAttribute('data-code-identifier', data.zip);
          feedbackIconElement.setAttribute('data-place-label', data.place);
        }
      };
      invokeBackendGeocodingService(inputField.value, geocodeResponseHandler);
    };

    const adjustAccordionPanelSize = (panelElement) => {
        if (panelElement && panelElement.classList.contains('activePanel')) {
            const content = panelElement.querySelector('.accordionContent');
            if (content) {
                content.style.height = `${content.scrollHeight}px`;
            }
        }
    };
  };

  return {
    initializeApplicationCoreComponent: () => {
      document.body.classList.add(runtimeEnvIdentifier);
      const storedFontPreference = localStorage.getItem('app_preferred_font_name');
      if (storedFontPreference) {
        document.body.classList.add(storedFontPreference);
      } else {
        document.body.classList.add('default-app-font');
      }

      const settingsMarkup = constructSettingsViewMarkup();
      document.body.insertAdjacentHTML('beforeend', settingsMarkup);

      const creditsContentArea = document.getElementById('creditsInformationModalContent');
      if (creditsContentArea) creditsContentArea.innerHTML = Handlebars.templates['creditsLayoutTemplate']();
      const proContentArea = document.getElementById('proFeaturesModalContent');
      if (proContentArea) proContentArea.innerHTML = Handlebars.templates['proLayoutTemplate']();

      const proLicenseTextArea = document.querySelector('#proFeaturesModal textarea');
      if (proLicenseTextArea && checkUserAuthorizationStatus()) {
        proLicenseTextArea.disabled = true;
        document.querySelector('#proFeaturesModal .activationConfirmationMessage').style.display = 'block';
      }

      refreshApplicationDisplay(true);

      Array.from(document.querySelectorAll('span[data-color]:not([data-color="dynamicGradientScheme"])')).forEach(span => {
        span.style.backgroundColor = `#${span.getAttribute('data-color')}`;
      });

      initializeApplicationEventHandlers();

      if (runtimeEnvIdentifier === 'nodeWebkitApp') {
        logApplicationActivity("Application running in Node-Webkit environment.");
        if (typeof require !== 'undefined') {
          const nwGui = require('nw.gui');
          const currentWindow = nwGui.Window.get();
          currentWindow.show();
          currentWindow.showDevTools();
        }

        setTimeout(() => {
          document.querySelector('.topControlBar .dataSynchronizationButton').click();
        }, 5000);
      } else if (runtimeEnvIdentifier === 'browserExtension') {
        document.body.classList.remove('windowDraggable');
        logApplicationActivity("Application running as Chrome Extension.");
      }

      setInterval(() => {
        triggerDataRefreshProcess('soft');
      }, 1000000);
    }
  };
})();

document.addEventListener('DOMContentLoaded', () => {
  weatherDisplayModule.initializeApplicationCoreComponent();
});