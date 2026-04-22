/*
 * Module for dynamic UI styling.
 * This script modifies CSS rules at runtime based on application settings.
 */

var visualSettings = (function() {
  'use strict';

  /**
   * Transforms an RGB color object into a hexadecimal string.
   */
  function convertColorToHex(rgbObject, adjustment) {

    function processChannel(channelVal, offsetFactor) {
      let adjustedChannel = !isNaN(offsetFactor) ? channelVal + offsetFactor : channelVal;
      if (adjustedChannel < 0) {
        adjustedChannel = 0;
      } else if (adjustedChannel > 255) {
        adjustedChannel = 255;
      }

      adjustedChannel = Math.floor(adjustedChannel);

      adjustedChannel = adjustedChannel.toString(16);
      return adjustedChannel.length === 1 ? "0" + adjustedChannel : adjustedChannel;
    }

    let hexString = "";
    if (rgbObject) {
      hexString = processChannel(rgbObject.red, adjustment) +
                  processChannel(rgbObject.green, adjustment) +
                  processChannel(rgbObject.blue, adjustment);
    }
    return hexString;
  }


  function getComplementaryColor(inputColorObj, offset) {
    return convertColorToHex({
        red: Math.abs(255 - inputColorObj.red),
        green: Math.abs(255 - inputColorObj.green),
        blue: Math.abs(255 - inputColorObj.blue)
      },
      offset
    );
  }


  function injectCSSRule(targetSheetID, elementSelector, styleDeclaration) {
    let styleContainer = document.getElementById(targetSheetID);

    if (styleContainer) {
      styleContainer = styleContainer.sheet;
      if (styleContainer.addRule) {
        styleContainer.addRule(elementSelector, styleDeclaration);
      } else if (styleContainer.insertRule) {
        styleContainer.insertRule(elementSelector + ' { ' + styleDeclaration + ' }', styleContainer.cssRules.length);
      }
    }
  }



  /**
   * Updates the user interface appearance using information from the host application.
   */
  function configureUIAppearance(uiSettings) {

    let mainPanelColor = uiSettings.panelBackgroundColor.color;
    let primaryBkgd = convertColorToHex(mainPanelColor);

    let darkenedBkgd = convertColorToHex(mainPanelColor, 20);

    let contentColor = "F0F0F0";
    if (mainPanelColor.red > 122) {
      contentColor = "000000";
    }
    let brightenedBkgd = convertColorToHex(mainPanelColor, -100);

    let cssSheetID = "customUIStylesheet";

    injectCSSRule(cssSheetID, ".uiElement", "background-color:" + "#" + primaryBkgd);
    injectCSSRule(cssSheetID, ".uiElement", "font-size:" + uiSettings.baseFontSize + "px;");
    injectCSSRule(cssSheetID, ".uiElement", "font-family:" + uiSettings.baseFontFamily);
    injectCSSRule(cssSheetID, ".uiElement", "color:" + "#" + contentColor);

    injectCSSRule(cssSheetID, ".uiBkgd", "background-color:" + "#" + primaryBkgd);
    injectCSSRule(cssSheetID, ".uiBkgdDark", "background-color: " + "#" + darkenedBkgd);
    injectCSSRule(cssSheetID, ".uiBkgdLight", "background-color: " + "#" + brightenedBkgd);
    injectCSSRule(cssSheetID, ".uiFontSize", "font-size:" + uiSettings.baseFontSize + "px;");
    injectCSSRule(cssSheetID, ".uiFontFamily", "font-family:" + uiSettings.baseFontFamily);
    injectCSSRule(cssSheetID, ".uiFontColor", "color:" + "#" + contentColor);

    injectCSSRule(cssSheetID, ".uiText", "font-size:" + uiSettings.baseFontSize + "px;");
    injectCSSRule(cssSheetID, ".uiText", "font-family:" + uiSettings.baseFontFamily);
    injectCSSRule(cssSheetID, ".uiText", "color:" + "#" + contentColor);

    injectCSSRule(cssSheetID, ".uiButton", "background-color:" + "#" + darkenedBkgd);
    injectCSSRule(cssSheetID, ".uiButton:hover", "background-color:" + "#" + primaryBkgd);
    injectCSSRule(cssSheetID, ".uiButton:active", "background-color:" + "#" + darkenedBkgd);
    injectCSSRule(cssSheetID, ".uiButton", "border-color: " + "#" + brightenedBkgd);

  }


  function handleThemeChange(changeEvent) {
    let themeDetails = JSON.parse(window.__adobe_cep__.getHostEnvironment()).appSkinInfo;
    configureUIAppearance(themeDetails);
  }


  function startupProcess() {

    let hostBridge = new CSInterface();

    configureUIAppearance(hostBridge.hostEnvironment.appSkinInfo);

    hostBridge.addEventListener(CSInterface.THEME_COLOR_CHANGED_EVENT, handleThemeChange);
  }

  return {
    start: startupProcess
  };

}());