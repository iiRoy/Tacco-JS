jQuery(document).ready(function() {

  // A module to handle various UI component demonstrations.
  const uiModuleLoader = (function() {

    // Internal helper for extracting the component key from an element's ID.
    const extractComponentKey = (elementId) => {
      // Assuming IDs are in the format 'component-name-xyz' or 'demo-name'.
      // We aim to get 'name' from 'demo-name'.
      const idParts = elementId.split('-');
      if (idParts.length > 1 && idParts[0] === 'demo') {
        return idParts.slice(1).join('-'); // Rejoin if it was 'demo-multi-part-name'
      }
      return elementId; // Fallback if format is unexpected
    };

    // Base path for loading content fragments.
    const contentBasePath = 'sections/';

    /**
     * Initializes a specific UI demonstration based on a given identifier.
     * @param {string} moduleIdentifier - The ID of the demo section (e.g., 'demo-autocomplete').
     */
    const activateDemoSection = (moduleIdentifier) => {
      if (!moduleIdentifier || typeof moduleIdentifier !== 'string') {
        console.warn('Demo activation failed: Invalid module identifier provided.', moduleIdentifier);
        return; // Exit if identifier is not valid
      }

      // Using a map for dispatch instead of a traditional switch statement
      const demoDispatchMap = {
        'autocomplete': () => {
          // A list of geographical entities for the autocomplete feature.
          const globalNations = [
            "Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda",
            "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain",
            "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan",
            "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria",
            "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde",
            "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros",
            "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire",
            "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica",
            "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea",
            "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia",
            "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea",
            "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland",
            "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan",
            "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait",
            "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein",
            "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives",
            "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia",
            "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal",
            "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman",
            "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland",
            "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome",
            "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone",
            "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain",
            "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan",
            "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia",
            "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom",
            "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen",
            "Zambia", "Zimbabwe"
          ];

          const countryInput = jQuery("#countries");
          if (countryInput.length) {
            countryInput.autocomplete({
              source: globalNations
            });
          } else {
            console.warn("Autocomplete target element #countries not found.");
          }
        },
        'accordion': () => {
          const accordionElement = jQuery(".accordion");
          if (accordionElement.length) {
            accordionElement.accordion({
              header: "h3"
            });
          } else {
            console.warn("Accordion target element .accordion not found.");
          }
        },
        'sliders': () => {
          // Configuration for the horizontal range slider.
          const horizontalSliderConfig = {
            range: true,
            values: [17, 67]
          };

          const horizSlider = jQuery('#horizSlider');
          if (horizSlider.length) {
            horizSlider.slider(horizontalSliderConfig).width(500);
          } else {
            console.warn("Horizontal slider target #horizSlider not found.");
          }

          // Setup for multiple vertical sliders.
          const verticalSliderElements = jQuery("#eq > span");
          if (verticalSliderElements.length) {
            verticalSliderElements.each(function() {
              const currentSpan = jQuery(this);
              const initialValue = parseInt(currentSpan.text(), 10);
              if (!isNaN(initialValue)) {
                currentSpan.empty().slider({
                  value: initialValue,
                  range: "min",
                  animate: true,
                  orientation: "vertical"
                });
              } else {
                console.warn("Skipping vertical slider due to invalid initial value:", currentSpan.text());
              }
            });
          } else {
            console.warn("Vertical slider target #eq > span not found.");
          }
        },
        'tabs': () => {
          const tabContainer = jQuery('#tabs');
          if (tabContainer.length) {
            tabContainer.tabs();
          } else {
            console.warn("Tabs target element #tabs not found.");
          }
        },
        'dialog': () => {
          const dialogElement = jQuery('#dialog');
          const dialogTrigger = jQuery('#dialog_link');

          if (dialogElement.length && dialogTrigger.length) {
            const closeDialogAction = function() {
              jQuery(this).dialog("close");
            };

            dialogElement.dialog({
              autoOpen: false,
              width: 600,
              buttons: {
                "Confirm": closeDialogAction,
                "Dismiss": closeDialogAction
              },
              modal: true
            });

            dialogTrigger.button().on('click', function(evt) {
              evt.preventDefault(); // Prevent default link behavior
              dialogElement.dialog('open');
            });
          } else {
            console.warn("Dialog elements #dialog or #dialog_link not found.");
          }
        },
        'datepicker': () => {
          const defaultDatePickerOptions = {
            showButtonPanel: true
          };

          const datepicker1 = jQuery('#datepicker');
          if (datepicker1.length) {
            datepicker1.datepicker(defaultDatePickerOptions).children().show();
          } else {
            console.warn("Datepicker target #datepicker not found.");
          }

          const datepicker2 = jQuery('#datepicker2');
          if (datepicker2.length) {
            datepicker2.datepicker({
              ...defaultDatePickerOptions, // Merge with default options
              numberOfMonths: 3
            }).children().show();
          } else {
            console.warn("Datepicker target #datepicker2 not found.");
          }
        },
        'icons': () => {
          const hoverTargets = jQuery('#dialog_link, ul#icons li');
          if (hoverTargets.length) {
            // Re-factored hover state management using on()
            hoverTargets.on('mouseenter', function() {
              jQuery(this).addClass('ui-state-hover');
            }).on('mouseleave', function() {
              jQuery(this).removeClass('ui-state-hover');
            });
          } else {
            console.warn("Icon hover targets not found.");
          }
        },
        'buttons': () => {
          // Standard button initialization
          jQuery("#divButton, #linkButton, #submitButton, #inputButton").button();

          // Button with primary icon
          jQuery("#leftIconButton").button({
            icons: {
              primary: 'ui-icon-wrench'
            }
          });

          // Button with both primary and secondary icons
          jQuery("#bothIconButton").button({
            icons: {
              primary: 'ui-icon-wrench',
              secondary: 'ui-icon-triangle-1-s'
            }
          });

          // Style-specific buttons
          jQuery("#dangerButton, #safeButton").button();

          // Button set for radio group
          const radioSet = jQuery("#radio1");
          if (radioSet.length) {
            radioSet.buttonset();
          } else {
            console.warn("Radio button set #radio1 not found.");
          }


          // Button within a modal context
          jQuery("#buttonInModal").button({
            icons: {
              primary: 'ui-icon-wrench'
            }
          });
        },
        'progressbar': () => {
          const progressIndicator = jQuery("#progressbar");
          if (progressIndicator.length) {
            progressIndicator.progressbar({
              value: 37
            }).width(500);

            const animateTrigger = jQuery("#animateProgress");
            if (animateTrigger.length) {
              animateTrigger.on('click', function(eventDetails) {
                eventDetails.preventDefault(); // Stop default action
                const randomProgressValue = Math.floor(Math.random() * 91); // 0 to 90
                // Animate the internal div representing the progress.
                progressIndicator.children('div').animate({
                  width: randomProgressValue + "%"
                }, 800); // Animation duration
              });
            } else {
              console.warn("Progress animation trigger #animateProgress not found.");
            }
          } else {
            console.warn("Progressbar target #progressbar not found.");
          }
        },
        'combinations': () => {
          const tabSet2 = jQuery('#tabs2');
          if (tabSet2.length) {
            tabSet2.tabs();
          } else {
            console.warn("Combination tabs #tabs2 not found.");
          }

          const accordionSet2 = jQuery("#accordion2");
          if (accordionSet2.length) {
            accordionSet2.accordion({
              header: "h4"
            });
          } else {
            console.warn("Combination accordion #accordion2 not found.");
          }

          // Apply button styling and prevent default clicks for nested buttons.
          jQuery("#nestedButtonTest_1, #nestedButtonTest_2, #buttonInModal")
            .button()
            .on('click', function(clickEvent) {
              clickEvent.preventDefault();
            });
        },
        'form': () => {
          const formButtons = jQuery('.format-ui-button');
          if (formButtons.length) {
            formButtons.button();
          } else {
            console.warn("Form buttons .format-ui-button not found.");
          }
        }
      };

      // Get the specific key for dispatching.
      const componentKey = extractComponentKey(moduleIdentifier);
      const handler = demoDispatchMap[componentKey];

      if (handler && typeof handler === 'function') {
        handler(); // Execute the appropriate handler
      } else {
        console.info(`No specific handler found for demo module: '${moduleIdentifier}'.`);
        // Optionally, add a default behavior or error logging here.
      }
    };

    // Public API for the module loader.
    return {
      /**
       * Scans for demo sections and loads their content and initializes them.
       */
      initAllDemos: function() {
        // Find all elements designated as demo containers.
        jQuery('div[data-demo-section]').each(function() {
          const demoContainer = jQuery(this);
          const sectionId = demoContainer.attr('id');

          if (!sectionId) {
            console.error("Demo container found without an ID attribute. Skipping.", demoContainer);
            return; // Skip this element if it lacks an ID
          }

          const componentSuffix = extractComponentKey(sectionId);
          const contentUrl = `${contentBasePath}${componentSuffix}.html`;

          // Load the HTML content asynchronously into the container.
          demoContainer.load(contentUrl, function(responseText, textStatus, xhr) {
            if (textStatus === "error") {
              console.error(`Failed to load content for section '${sectionId}': ${xhr.status} ${xhr.statusText}`);
              return;
            }
            // Once content is loaded, initialize the specific demo functionality.
            activateDemoSection(sectionId);
          });
        });
      }
    };
  })(); // End of uiModuleLoader IIFE

  // Initialize all demo sections on page load.
  uiModuleLoader.initAllDemos();


  // --- Theme Switching Mechanism ---
  const themeSwitchHandler = (function() {
    const themeToggleContainer = jQuery('#theme-switcher');
    const displayElement = jQuery('h2#current-theme-display span');
    const themeLinkIdentifier = 'theme-stylesheet'; // Unique ID for the theme LINK tag

    // Helper to update the displayed theme summary with a fade effect.
    const updateThemeDisplay = (displayContent) => {
      if (displayElement.length) {
        displayElement
          .fadeOut('slow', function() {
            jQuery(this)
              .html(displayContent)
              .fadeIn('slow');
          });
      } else {
        console.warn("Theme display element not found for updates.");
      }
    };

    // Check if the theme switcher exists before attaching handlers.
    if (themeToggleContainer.length) {
      // Attach click event listener to anchor tags within the theme switcher.
      themeToggleContainer.on('click', 'a', function(event) {
        event.preventDefault(); // Prevent default link navigation

        const currentAnchor = jQuery(this);
        const selectedThemeName = currentAnchor.text();
        const themeDescription = currentAnchor.attr('data-description');
        const themeHref = currentAnchor.attr('data-stylesheet-url'); // Use a custom attribute for href

        if (!themeHref) {
            console.error("Theme switch anchor is missing 'data-stylesheet-url' attribute.");
            return;
        }

        // Construct the full summary for display.
        const fullSummaryText = `${selectedThemeName}<br><span class="theme-summary-text">${themeDescription}</span>`;

        // Update the stylesheet link's href attribute.
        // Using `prop` for attribute manipulation, and adding a cache-buster.
        const themeLink = jQuery(`link[id="${themeLinkIdentifier}"]`);
        if (themeLink.length) {
            themeLink.prop('href', `${themeHref}?_t=${performance.now()}`);
        } else {
            console.error(`Theme stylesheet link with ID "${themeLinkIdentifier}" not found.`);
        }


        // Update the visible theme summary.
        updateThemeDisplay(fullSummaryText);
      });

      // Automatically trigger a click on the first theme option found.
      const initialThemeLink = themeToggleContainer.find('a:first');
      if (initialThemeLink.length) {
        initialThemeLink.trigger('click');
      } else {
        console.warn("No initial theme link found in the theme switcher.");
      }
    } else {
        console.info("Theme switcher container #theme-switcher not found. Skipping theme functionality.");
    }
  })(); // End of themeSwitchHandler IIFE

});