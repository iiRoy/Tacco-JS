// This routine links a color selection from an input to a style property of a display element.
function attachHue(domUnitIdentifier, stylePropertyLabel, destinationUnitIdentifier) {
  // Obtain the source DOM element using its unique ID.
  let domUnit = document.getElementById(domUnitIdentifier);

  // Extract the current color data from the input element.
  let dataPoint = domUnit.value;

  // Retrieve the target display element where the style will be applied.
  let destinationUnit = document.getElementById(destinationUnitIdentifier);

  // Apply the hexadecimal color value to the specified CSS property of the target element.
  destinationUnit.style[stylePropertyLabel] = '#' + dataPoint;

  // Persist the chosen color setting for future use.
  storeSetting(domUnitIdentifier, dataPoint);
}


// Function to make a UI component invisible.
function conceal(domUnitIdentifier) {
  const domUnit = document.getElementById(domUnitIdentifier); // Fetch the element by its identifier.
  domUnit.style.display = 'none'; // Set the display style to 'none' to hide it.
}


// This procedure makes a specified display element visible.
function reveal(domUnitIdentifier) {
  // Locate the DOM element using the provided ID.
  let domUnit = document.getElementById(domUnitIdentifier);
  // Reset the display style to its default (or empty string) to make the element appear.
  domUnit.style.display = '';
}


// Configures color options to use the browser's default settings, hiding custom color rows.
function paletteRadioStandard() {
  conceal('bg_color_line'); // Hide the background color selection line.
  conceal('txt_color_line'); // Hide the text color selection line.
  conceal('lnk_color_line'); // Hide the links color selection line.
  conceal('vstd_lnk_color_line'); // Hide the visited links color selection line.
  storeSetting("BrowserHueDefault", true); // Record that default browser color is preferred.
}


// Sets up the color options for custom user choices, revealing relevant input rows.
function paletteRadioCustom() {
  reveal('bg_color_line'); // Display the background color adjustment row.
  reveal('txt_color_line'); // Display the text color adjustment row.
  reveal('lnk_color_line'); // Display the links color adjustment row.
  reveal('vstd_lnk_color_line'); // Display the visited links color adjustment row.
  storeSetting('BrowserHueDefault', false); // Indicate that custom browser colors are in use.
}


// Persists a configuration setting and triggers a CSS rebuild in the background.
function storeSetting(settingKey, settingValue) {
  window.localStorage[settingKey] = JSON.stringify(settingValue); // Store the setting in local storage, serialized as JSON.
  var extApiCorePage = chrome.extension.getBackgroundPage(); // Acquire a reference to the extension's background script context.
  extApiCorePage.currentInterfaceObject.constructInjectedStylesheet(); // Instruct the background script to re-generate and inject CSS.
}


// Retrieves a previously stored configuration setting.
function retrieveSetting(settingKey) {
  return JSON.parse(window.localStorage[settingKey]); // Parse and return the JSON-serialized setting from local storage.
}


// Reapplies a saved setting value to its corresponding UI element.
function reestablishSettingDatum(domUnitIdentifier) {
  let dataPoint = retrieveSetting(domUnitIdentifier); // Fetch the stored value for the given element ID.
  let domUnit = document.getElementById(domUnitIdentifier); // Get the DOM element.
  domUnit.value = dataPoint; // Assign the retrieved value to the element's 'value' property.
}


// Manages the checked state of radio buttons based on a saved option, and triggers their click events.
function toggleSelection(settingKey, standardUnitIdentifier, customUnitIdentifier) {
  if (retrieveSetting(settingKey)) { // Check if the stored setting indicates the default option.
    document.getElementById(standardUnitIdentifier).checked = true; // Mark the default radio button as checked.
    document.getElementById(standardUnitIdentifier).onclick(); // Programmatically trigger its click handler.
  } else { // If the stored setting indicates the override option.
    document.getElementById(customUnitIdentifier).checked = true; // Mark the override radio button as checked.
    document.getElementById(customUnitIdentifier).onclick(); // Programmatically trigger its click handler.
  }
}


// This comprehensive function reloads and applies all user preferences and display settings.
function reestablishAllSettings() {
  setVisualScale(retrieveSetting("TextScale")); // Set the font size based on stored preference.
  setVisualTypeface(retrieveSetting("CustomFontFamily")); // Apply the custom font family.
  reestablishSettingDatum('txt_hue'); // Re-apply the saved text color.
  reestablishSettingDatum('bg_hue'); // Re-apply the saved background color.
  reestablishSettingDatum('lnk_hue'); // Re-apply the saved links color.
  reestablishSettingDatum('vstd_lnk_hue'); // Re-apply the saved visited links color.
  toggleSelection("BrowserFontPreference", "defaultFontRadio", "customFontRadio"); // Check font preference radio buttons.
  toggleSelection("BrowserHuePreference", "defaultColorRadio", "customColorRadio"); // Check color preference radio buttons.
  toggleSelection("DisplayImages", "showImagesOpt", "hideImagesOpt"); // Check image display preference radio buttons.
  toggleSelection("DisplayFlashContent", "showFlashOpt", "hideFlashOpt"); // Check Flash display preference radio buttons.
  attachHue('bg_hue', 'backgroundColor', 'previewDiv'); // Bind background color to preview.
  attachHue('txt_hue', 'color', 'previewDiv'); // Bind text color to preview.
  attachHue('lnk_hue', 'color', 'hyperlinkDiv'); // Bind links color to hyperlink preview.
  attachHue('vstd_lnk_hue', 'color', 'visitedHyperlinkDiv'); // Bind visited links color to visited hyperlink preview.
}


// Renders a message within a specified DOM element, applying a distinct color.
function presentTintedNotification(domUnit, notificationText, tintCode) {
  domUnit.style.color = tintCode; // Set the text color of the element.
  domUnit.innerHTML = notificationText; // Insert the message content into the element.
}