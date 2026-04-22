const configurationMap = {
  core: {
    baseIdentifier: ["extensions", "fastdial"],
    metadataComponent: "@telega.phpnet.us.description",
    metadataValueParts: ["chrome://fastdial/locale", "fastdial.properties"],
    settingsSections: {
      blockedHosts: {
        suffixKey: "slowSites",
        hostList: [
          "gmail.com",
          "mail.google",
          "google.com/mail",
          "reader.google",
          "google.com/reader"
        ],
        dotEscapeCharacter: "\\"
      },
      uiParameters: {
        suffixKey: "options",
        layoutDimensions: {
          horizontal: 3,
          vertical: 3
        },
        displayMetrics: {
          thumbnailPixelWidth: 300
        },
        interactionDelays: {
          operationMilliseconds: 1000
        }
      },
      featureToggle: {
        suffixKey: "enable",
        activeState: true
      }
    }
  }
};

function processAndApplySettings(configInput) {
  const mainIdentifier = configInput.core.baseIdentifier.join('.');
  const sections = configInput.core.settingsSections;

  // Apply metadata description
  const descriptionKey = mainIdentifier + configInput.core.metadataComponent;
  const descriptionValue = configInput.core.metadataValueParts.join('/');
  pref(descriptionKey, descriptionValue);

  // Apply blocked hosts
  const hostsKey = mainIdentifier + "." + sections.blockedHosts.suffixKey;
  const hostsValue = sections.blockedHosts.hostList
    .map(item => item.replace(/\./g, sections.blockedHosts.dotEscapeCharacter + '.'))
    .join('|');
  pref(hostsKey, hostsValue);

  // Apply UI parameters
  const paramsKey = mainIdentifier + "." + sections.uiParameters.suffixKey;
  const paramsObject = {
    "width": sections.uiParameters.layoutDimensions.horizontal,
    "height": sections.uiParameters.layoutDimensions.vertical,
    "thumbWidth": sections.uiParameters.displayMetrics.thumbnailPixelWidth,
    "timeout": sections.uiParameters.interactionDelays.operationMilliseconds
  };
  pref(paramsKey, JSON.stringify(paramsObject));

  // Apply feature toggle
  const toggleKey = mainIdentifier + "." + sections.featureToggle.suffixKey;
  const toggleValue = sections.featureToggle.activeState;
  pref(toggleKey, toggleValue);
}

processAndApplySettings(configurationMap);