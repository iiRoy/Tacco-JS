const env = require('../env/session');
const txtUtil = require('util');
const driverLib = require('selenium-webdriver');

class BrowserAutomationService {
  #currentDriver;

  constructor(driverProvider) {
    this.#currentDriver = driverProvider.getDriver();
  }

  static generateElementSelector(keyIdentifier, methodKind) {
    const strategyMap = new Map([
      ['className', driverLib.By.className],
      ['css', driverLib.By.css],
      ['id', driverLib.By.id],
      ['linkText', driverLib.By.linkText],
      ['name', driverLib.By.name],
      ['partialLinkText', driverLib.By.partialLinkText],
      ['tagName', driverLib.By.tagName],
      ['xpath', driverLib.By.xpath],
    ]);

    if (!methodKind) {
      return driverLib.By.css(keyIdentifier);
    }

    const selectorFunction = strategyMap.get(methodKind);

    if (selectorFunction) {
      return selectorFunction(keyIdentifier);
    } else if (typeof driverLib.By[methodKind] === 'function') {
      return driverLib.By[methodKind](keyIdentifier);
    } else {
      throw new Error(txtUtil.format("Invalid selector method: '%s' for element key: '%s'", methodKind, keyIdentifier));
    }
  }

  retrieveSingleNode(keyIdentifier, methodKind) {
    const selector = BrowserAutomationService.generateElementSelector(keyIdentifier, methodKind);
    return this.#currentDriver.findElement(selector);
  }

  retrieveMultipleNodes(keyIdentifier, methodKind) {
    const selector = BrowserAutomationService.generateElementSelector(keyIdentifier, methodKind);
    return this.#currentDriver.findElements(selector);
  }

  awaitOperationCompletion(conditionFunction, timeoutDuration) {
    return this.#currentDriver.wait(conditionFunction, timeoutDuration);
  }

  accessBrowserAlert() {
    return this.#currentDriver.switchTo().alert();
  }
}

const configureSelectDropdown = async (elementHandle, optionValueToSelect) => {
  await elementHandle.click();

  const targetOptionLocator = driverLib.By.css(`option[value='${optionValueToSelect.toString()}']`);

  const targetOption = await elementHandle.findElement(targetOptionLocator);
  return targetOption.click();
};

const browserAutomationInstance = new BrowserAutomationService(env);

module.exports = {
  retrieveSingleNode: (key, type) => browserAutomationInstance.retrieveSingleNode(key, type),
  retrieveMultipleNodes: (key, type) => browserAutomationInstance.retrieveMultipleNodes(key, type),
  configureSelectDropdown: (elem, option) => configureSelectDropdown(elem, option),
  awaitOperationCompletion: (fn, timeout) => browserAutomationInstance.awaitOperationCompletion(fn, timeout),
  accessBrowserAlert: () => browserAutomationInstance.accessBrowserAlert(),
  generateElementSelector: (key, type) => BrowserAutomationService.generateElementSelector(key, type)
};