document.addEventListener('DOMContentLoaded', function() {

  // A registry of functions to initialize various interface components
  const componentInitializers = {
    'demo-autocomplete': function(parentContainer) {
      const globalNationNames = ["Afghanistan", "Albania", "Algeria", "Andorra", "Angola", "Antarctica", "Antigua and Barbuda", "Argentina", "Armenia", "Australia", "Austria", "Azerbaijan", "Bahamas", "Bahrain", "Bangladesh", "Barbados", "Belarus", "Belgium", "Belize", "Benin", "Bermuda", "Bhutan", "Bolivia", "Bosnia and Herzegovina", "Botswana", "Brazil", "Brunei", "Bulgaria", "Burkina Faso", "Burma", "Burundi", "Cambodia", "Cameroon", "Canada", "Cape Verde", "Central African Republic", "Chad", "Chile", "China", "Colombia", "Comoros", "Congo, Democratic Republic", "Congo, Republic of the", "Costa Rica", "Cote d'Ivoire", "Croatia", "Cuba", "Cyprus", "Czech Republic", "Denmark", "Djibouti", "Dominica", "Dominican Republic", "East Timor", "Ecuador", "Egypt", "El Salvador", "Equatorial Guinea", "Eritrea", "Estonia", "Ethiopia", "Fiji", "Finland", "France", "Gabon", "Gambia", "Georgia", "Germany", "Ghana", "Greece", "Greenland", "Grenada", "Guatemala", "Guinea", "Guinea-Bissau", "Guyana", "Haiti", "Honduras", "Hong Kong", "Hungary", "Iceland", "India", "Indonesia", "Iran", "Iraq", "Ireland", "Israel", "Italy", "Jamaica", "Japan", "Jordan", "Kazakhstan", "Kenya", "Kiribati", "Korea, North", "Korea, South", "Kuwait", "Kyrgyzstan", "Laos", "Latvia", "Lebanon", "Lesotho", "Liberia", "Libya", "Liechtenstein", "Lithuania", "Luxembourg", "Macedonia", "Madagascar", "Malawi", "Malaysia", "Maldives", "Mali", "Malta", "Marshall Islands", "Mauritania", "Mauritius", "Mexico", "Micronesia", "Moldova", "Mongolia", "Morocco", "Monaco", "Mozambique", "Namibia", "Nauru", "Nepal", "Netherlands", "New Zealand", "Nicaragua", "Niger", "Nigeria", "Norway", "Oman", "Pakistan", "Panama", "Papua New Guinea", "Paraguay", "Peru", "Philippines", "Poland", "Portugal", "Qatar", "Romania", "Russia", "Rwanda", "Samoa", "San Marino", " Sao Tome", "Saudi Arabia", "Senegal", "Serbia and Montenegro", "Seychelles", "Sierra Leone", "Singapore", "Slovakia", "Slovenia", "Solomon Islands", "Somalia", "South Africa", "Spain", "Sri Lanka", "Sudan", "Suriname", "Swaziland", "Sweden", "Switzerland", "Syria", "Taiwan", "Tajikistan", "Tanzania", "Thailand", "Togo", "Tonga", "Trinidad and Tobago", "Tunisia", "Turkey", "Turkmenistan", "Uganda", "Ukraine", "United Arab Emirates", "United Kingdom", "United States", "Uruguay", "Uzbekistan", "Vanuatu", "Venezuela", "Vietnam", "Yemen", "Zambia", "Zimbabwe"];
      const nationInput = parentContainer.querySelector("#countries");
      if (nationInput && typeof $.fn.autocomplete === 'function') {
        $(nationInput).autocomplete({ source: globalNationNames });
      }
    },
    'demo-accordion': function(parentContainer) {
      const accordionPanel = parentContainer.querySelector(".accordion");
      if (accordionPanel && typeof $.fn.accordion === 'function') {
        $(accordionPanel).accordion({ header: "h3" });
      }
    },
    'demo-sliders': function(parentContainer) {
      const horizontalRange = parentContainer.querySelector('#horizSlider');
      if (horizontalRange && typeof $.fn.slider === 'function') {
        $(horizontalRange).slider({
          range: true,
          values: [17, 67]
        }).width(500);
      }

      const verticalBars = parentContainer.querySelectorAll("#eq > span");
      if (verticalBars.length > 0 && typeof $.fn.slider === 'function') {
        verticalBars.forEach(function(barElement) {
          const numericValue = parseInt(barElement.textContent);
          barElement.textContent = ''; // Clear content before initialization
          $(barElement).slider({
            value: numericValue,
            range: "min",
            animate: true,
            orientation: "vertical"
          });
        });
      }
    },
    'demo-tabs': function(parentContainer) {
      const tabbedView = parentContainer.querySelector('#tabs');
      if (tabbedView && typeof $.fn.tabs === 'function') {
        $(tabbedView).tabs();
      }
    },
    'demo-dialog': function(parentContainer) {
      const modalDialogue = parentContainer.querySelector('#dialog');
      const triggerButton = parentContainer.querySelector('#dialog_link');

      if (modalDialogue && typeof $.fn.dialog === 'function') {
        $(modalDialogue).dialog({
          autoOpen: false,
          width: 600,
          buttons: {
            "Ok": function() {
              $(this).dialog("close");
            },
            "Cancel": function() {
              $(this).dialog("close");
            }
          },
          modal: true
        });
      }
      
      if (triggerButton && typeof $.fn.button === 'function') {
        $(triggerButton).button();
        triggerButton.addEventListener('click', function(evt) {
          evt.preventDefault();
          $(modalDialogue).dialog('open');
        });
      }
    },
    'demo-datepicker': function(parentContainer) {
      const primaryCalendarInput = parentContainer.querySelector('#datepicker');
      const secondaryCalendarInput = parentContainer.querySelector('#datepicker2');

      if (primaryCalendarInput && typeof $.fn.datepicker === 'function') {
        $(primaryCalendarInput).datepicker({
          showButtonPanel: true
        }).children().show();
      }
      if (secondaryCalendarInput && typeof $.fn.datepicker === 'function') {
        $(secondaryCalendarInput).datepicker({
          numberOfMonths: 3,
          showButtonPanel: true
        }).children().show();
      }
    },
    'demo-icons': function(parentContainer) {
      const dialogueLinkElement = parentContainer.querySelector('#dialog_link');
      const iconDisplayItems = parentContainer.querySelectorAll('ul#icons li');

      const applyInteractiveStyle = function(domElement) {
        domElement.addEventListener('mouseenter', function() { this.classList.add('ui-state-hover'); });
        domElement.addEventListener('mouseleave', function() { this.classList.remove('ui-state-hover'); });
      };

      if (dialogueLinkElement) applyInteractiveStyle(dialogueLinkElement);
      iconDisplayItems.forEach(applyInteractiveStyle);
    },
    'demo-buttons': function(parentContainer) {
      const standardActionButtons = parentContainer.querySelectorAll("#divButton, #linkButton, #submitButton, #inputButton");
      if (typeof $.fn.button === 'function') {
        standardActionButtons.forEach(btn => $(btn).button());
      }

      const leftIconActionButton = parentContainer.querySelector("#leftIconButton");
      if (leftIconActionButton && typeof $.fn.button === 'function') {
        $(leftIconActionButton).button({ icons: { primary: 'ui-icon-wrench' } });
      }

      const dualIconActionButton = parentContainer.querySelector("#bothIconButton");
      if (dualIconActionButton && typeof $.fn.button === 'function') {
        $(dualIconActionButton).button({ icons: { primary: 'ui-icon-wrench', secondary: 'ui-icon-triangle-1-s' } });
      }

      const themedActionButtons = parentContainer.querySelectorAll("#dangerButton, #safeButton");
      if (typeof $.fn.button === 'function') {
        themedActionButtons.forEach(btn => $(btn).button());
      }

      const radioControlGroup = parentContainer.querySelector("#radio1");
      if (radioControlGroup && typeof $.fn.buttonset === 'function') {
        $(radioControlGroup).buttonset();
      }

      const modalActionButton = parentContainer.querySelector("#buttonInModal");
      if (modalActionButton && typeof $.fn.button === 'function') {
        $(modalActionButton).button({ icons: { primary: 'ui-icon-wrench' } });
      }
    },
    'demo-progressbar': function(parentContainer) {
      const progressIndicator = parentContainer.querySelector("#progressbar");
      const animationActivator = parentContainer.querySelector("#animateProgress");

      if (progressIndicator && typeof $.fn.progressbar === 'function') {
        $(progressIndicator).progressbar({ value: 37 }).width(500);
      }

      if (animationActivator) {
        animationActivator.addEventListener('click', function(evt) {
          evt.preventDefault();
          const randomPercentage = Math.random() * 90;
          const innerProgressDiv = progressIndicator.querySelector('div');
          if (innerProgressDiv) {
            $(innerProgressDiv).animate({ width: randomPercentage + "%" });
          }
        });
      }
    },
    'demo-combinations': function(parentContainer) {
      const combinedTabs = parentContainer.querySelector('#tabs2');
      if (combinedTabs && typeof $.fn.tabs === 'function') {
        $(combinedTabs).tabs();
      }
      
      const combinedAccordion = parentContainer.querySelector("#accordion2");
      if (combinedAccordion && typeof $.fn.accordion === 'function') {
        $(combinedAccordion).accordion({ header: "h4" });
      }

      const nestedInterfaceButtons = parentContainer.querySelectorAll("#nestedButtonTest_1, #nestedButtonTest_2, #buttonInModal");
      if (typeof $.fn.button === 'function') {
        nestedInterfaceButtons.forEach(btn => {
          $(btn).button();
          btn.addEventListener('click', function(evt) {
            evt.preventDefault();
          });
        });
      }
    },
    'demo-form': function(parentContainer) {
      const formStylingButtons = parentContainer.querySelectorAll('.format-ui-button');
      if (typeof $.fn.button === 'function') {
        formStylingButtons.forEach(btn => $(btn).button());
      }
    }
  };

  // Orchestrates the initialization of components within a given section
  function initSectionComponents(componentId, sectionHostElement) {
    const componentSetupFunction = componentInitializers[componentId];
    if (componentSetupFunction) {
      componentSetupFunction(sectionHostElement);
    }
  }

  // --- Dynamic Content Retrieval and Component Setup ---
  const dynamicContentContainers = document.querySelectorAll('div[id^="demo-"]');
  dynamicContentContainers.forEach(function(currentHostElement) {
    const hostElementId = currentHostElement.id;
    const identifierSuffix = hostElementId.substring(5); // Remove 'demo-' prefix
    const contentSourcePath = 'sections/' + identifierSuffix + '.html';

    fetch(contentSourcePath)
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to retrieve content for: ' + contentSourcePath);
        }
        return response.text();
      })
      .then(htmlBlock => {
        currentHostElement.innerHTML = htmlBlock;
        // Activate specific components after content is placed in the DOM
        initSectionComponents(hostElementId, currentHostElement);
      })
      .catch(error => {
        console.error('Error loading dynamic section:', error);
      });
  });

  // --- Visual Theme Management ---
  const themeSelectionControls = document.querySelectorAll('#toggle-css a');
  const styleLinkReference = document.getElementById('theme');
  const activeThemeDisplay = document.querySelector('h2#showing span');

  // Utility to apply a fade effect to an element's content
  function transitionContentDisplay(targetElement, newHtmlContent) {
    targetElement.style.transition = 'opacity 0.3s ease-out';
    targetElement.style.opacity = '0';

    setTimeout(() => {
      targetElement.innerHTML = newHtmlContent;
      targetElement.style.opacity = '1';
    }, 300);
  }

  themeSelectionControls.forEach(function(themeLink) {
    themeLink.addEventListener('click', function(evt) {
      evt.preventDefault();

      const themeLabel = this.textContent;
      const themeDescription = this.getAttribute('data-summary');
      const completeDescription = themeLabel + '<br><span class="summary">' + themeDescription + '</span>';
      const stylesheetPath = this.getAttribute('rel');

      if (styleLinkReference) {
        styleLinkReference.setAttribute('href', stylesheetPath + '?' + new Date().getTime());
      }

      if (activeThemeDisplay) {
        transitionContentDisplay(activeThemeDisplay, completeDescription);
      }
    });
  });

  // Programmatically trigger the first theme choice upon page load
  const initialThemeActivator = document.querySelector('#toggle-css a:first-child');
  if (initialThemeActivator) {
    initialThemeActivator.click();
  }

});