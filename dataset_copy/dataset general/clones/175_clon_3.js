class BeverageProcessor {

  // Internal collection of regular expression patterns for efficient matching of order modifiers.
  static #orderRegexPatterns = {
    baseKopi: /^kopi/,
    kopiEvaporatedMilk: /^kopi\s(c|see|si)\b/,
    kopiNoMilk: /^kopi\so?h?\b/,
    icedVariant: /\b(peng|bing)\b/,
    tepidVariant: /\bpua\s?sio\b/,
    sugarFree: /\bkosong\b/,
    extraSweetened: /\b(ga|ka)h?\s?(d|t)ai\b/,
    reducedSweetness: /\b(siu|siew|xiu)\s?(t|d)ai\b/,
    diluted: /\bpoh?\b/,
    strong: /\b(g|k)a(u|o)\b/,
    concentrated: /\bdi\slo\b/,
    pureWater: /^water$/
  };

  /**
   * Analyzes a customer's textual beverage request and translates it into a detailed
   * ingredient breakdown and serving parameters. This method handles normalization,
   * default settings, and modifier-based adjustments.
   *
   * @param {string} rawOrderInput - The original string provided by the customer, e.g., "Kopi C Peng".
   * @returns {object} An object containing the calculated volumes of ingredients and serving state.
   * @throws {Error} When an illogical combination of modifiers is encountered.
   */
  static interpretBeverageRequest(rawOrderInput) {
    // Standardize input for case-insensitive and whitespace-robust pattern matching.
    const processedInput = rawOrderInput.trim().toLowerCase();

    // Initialize ingredient volumes and state variables with their default values.
    // All volumes are proportions, intended to sum up to 1 for the main liquid components.
    let coffeeVolume = 0.0;
    let sweetenedMilkVolume = 0.0; // Represents condensed milk
    let unsweetenedMilkVolume = 0.0; // Represents evaporated milk
    let granulatedSugarAmount = 0.0; // Separately added sugar
    let liquidWaterVolume = 0.0;
    let servingState = 'warm'; // Default serving temperature
    let hasIceAdded = false; // Flag for explicitly iced drinks

    const isCoffeeDrink = BeverageProcessor.#orderRegexPatterns.baseKopi.test(processedInput);

    if (isCoffeeDrink) {
      // Coffee-based drinks typically include a standard amount of sugar by default.
      granulatedSugarAmount = 1.0;

      // Determine the fundamental coffee variant based on early modifiers.
      if (BeverageProcessor.#orderRegexPatterns.kopiEvaporatedMilk.test(processedInput)) {
        unsweetenedMilkVolume = 0.2;
        liquidWaterVolume = 0.4;
        coffeeVolume = 0.4;
      } else if (BeverageProcessor.#orderRegexPatterns.kopiNoMilk.test(processedInput)) {
        liquidWaterVolume = 0.5;
        coffeeVolume = 0.5;
      } else {
        // If no specific milk type (C or O) is specified, assume standard sweetened condensed milk.
        sweetenedMilkVolume = 0.2;
        liquidWaterVolume = 0.4;
        coffeeVolume = 0.4;
      }

      // Evaluate temperature-related modifiers.
      if (BeverageProcessor.#orderRegexPatterns.icedVariant.test(processedInput)) {
        servingState = 'chilled';
        hasIceAdded = true;
      } else if (BeverageProcessor.#orderRegexPatterns.tepidVariant.test(processedInput)) {
        servingState = 'tepid';
      }

      // Helper function to apply specific, complex modifiers to ingredient volumes.
      const applySpecificAdjustment = (modifierType) => {
        switch (modifierType) {
          case 'sugarFree':
            // "Kosong" (no sugar) is incompatible with sweetened condensed milk.
            if (sweetenedMilkVolume > 0.01) { // Using a small epsilon for float comparison
              throw new Error('Order conflict: "Kosong" requested with sweetened condensed milk, which contains sugar.');
            }
            granulatedSugarAmount = 0.0;
            break;
          case 'extraSweetened':
            granulatedSugarAmount = 1.5; // Custom sugar level for "Gah Dai"
            // Adjust liquid proportions for milk-based drinks to reflect added sweetness.
            if (sweetenedMilkVolume > 0.01) {
              sweetenedMilkVolume += 0.1;
              liquidWaterVolume -= 0.05;
              coffeeVolume -= 0.05;
            } else if (unsweetenedMilkVolume > 0.01) {
              unsweetenedMilkVolume += 0.1;
              liquidWaterVolume -= 0.05;
              coffeeVolume -= 0.05;
            }
            break;
          case 'reducedSweetness':
            granulatedSugarAmount = 0.5; // "Siew Dai" implies half the standard sugar.
            break;
          case 'diluted':
            liquidWaterVolume += 0.1;
            coffeeVolume -= 0.1;
            // Ensure volumes do not become negative due to adjustments.
            coffeeVolume = Math.max(0, coffeeVolume);
            break;
          case 'strong':
            liquidWaterVolume -= 0.1;
            coffeeVolume += 0.1;
            // Ensure volumes do not become negative.
            liquidWaterVolume = Math.max(0, liquidWaterVolume);
            break;
          case 'concentrated':
            coffeeVolume += liquidWaterVolume; // Combine all water into coffee volume.
            liquidWaterVolume = 0.0; // Eliminate water component.
            break;
          default:
            // No action for unrecognized modifiers.
            break;
        }
      };

      // Apply sweetness modifiers. Order matters here (e.g., Kosong overrides Gah Dai).
      if (BeverageProcessor.#orderRegexPatterns.sugarFree.test(processedInput)) {
        applySpecificAdjustment('sugarFree');
      } else if (BeverageProcessor.#orderRegexPatterns.extraSweetened.test(processedInput)) {
        applySpecificAdjustment('extraSweetened');
      } else if (BeverageProcessor.#orderRegexPatterns.reducedSweetness.test(processedInput)) {
        applySpecificAdjustment('reducedSweetness');
      }

      // Apply coffee/water ratio modifiers.
      if (BeverageProcessor.#orderRegexPatterns.diluted.test(processedInput)) {
        applySpecificAdjustment('diluted');
      } else if (BeverageProcessor.#orderRegexPatterns.strong.test(processedInput)) {
        applySpecificAdjustment('strong');
      } else if (BeverageProcessor.#orderRegexPatterns.concentrated.test(processedInput)) {
        applySpecificAdjustment('concentrated');
      }

    } else if (BeverageProcessor.#orderRegexPatterns.pureWater.test(processedInput)) {
      // Special handling for a plain water order.
      liquidWaterVolume = 1.0;
      // Ensure all other ingredient volumes are zeroed out for pure water.
      coffeeVolume = 0.0;
      sweetenedMilkVolume = 0.0;
      unsweetenedMilkVolume = 0.0;
      granulatedSugarAmount = 0.0;
      servingState = 'ambient'; // Water is typically ambient by default.
    }

    // Return the final, calculated composition of the beverage, formatted to two decimal places.
    return {
      coffeeContent: parseFloat(coffeeVolume.toFixed(2)),
      waterContent: parseFloat(liquidWaterVolume.toFixed(2)),
      addedSugarContent: parseFloat(granulatedSugarAmount.toFixed(2)),
      sweetenedCondensedMilkContent: parseFloat(sweetenedMilkVolume.toFixed(2)),
      unsweetenedEvaporatedMilkContent: parseFloat(unsweetenedMilkVolume.toFixed(2)),
      servingTemperature: servingState,
      includesIce: hasIceAdded
    };
  }

  /**
   * Constructs a standard Kopi order phrase from a structured set of beverage components.
   * This method reverses the parsing process, generating a descriptive string that reflects
   * the ingredient ratios and serving preferences.
   *
   * @param {object} [beverageDetails={}] - An object containing ingredient volumes and temperature.
   * @param {number} [beverageDetails.sweetenedCondensedMilkContent=0] - Volume of sweetened condensed milk.
   * @param {number} [beverageDetails.unsweetenedEvaporatedMilkContent=0] - Volume of unsweetened evaporated milk.
   * @param {string} [beverageDetails.servingTemperature='warm'] - Serving temperature ('warm', 'chilled', 'tepid', 'ambient').
   * @param {number} [beverageDetails.addedSugarContent=0] - Amount of added granulated sugar.
   * @param {number} [beverageDetails.coffeeContent=0] - Volume of coffee.
   * @param {number} [beverageDetails.waterContent=0] - Volume of water.
   * @returns {string} A phrase describing the beverage (e.g., "Kopi C Peng Gah Dai").
   */
  static formatOrderDetails(beverageDetails = {}) {
    const {
      sweetenedCondensedMilkContent: swtMlk = 0,
      unsweetenedEvaporatedMilkContent: unswtMlk = 0,
      servingTemperature: tempState = 'warm',
      addedSugarContent: addedSugar = 0,
      coffeeContent: cVol = 0,
      waterContent: wVol = 0
    } = beverageDetails;

    let coffeeStrengthDescriptor = '';
    let temperatureMod = '';
    let milkDescriptor = '';
    let sugarLevelMod = '';
    const baseBeverageName = 'Kopi'; // All coffee orders start with this base.

    // Determine the milk type descriptor for the order string.
    const MILK_THRESHOLD = 0.01; // Small value to account for floating point inaccuracies.
    if (unswtMlk > MILK_THRESHOLD) {
      milkDescriptor = ' C'; // Kopi C (evaporated milk)
    } else if (swtMlk <= MILK_THRESHOLD && cVol > MILK_THRESHOLD) {
      milkDescriptor = ' O'; // Kopi O (no milk)
    } else if (swtMlk > MILK_THRESHOLD) {
      milkDescriptor = ''; // Standard Kopi (condensed milk) has no specific milk descriptor.
    }

    // Determine the temperature modifier.
    switch (tempState) {
      case 'chilled':
        temperatureMod = ' Peng';
        break;
      case 'tepid':
        temperatureMod = ' Pua Sio';
        break;
      // 'warm' and 'ambient' are default states and don't require an explicit modifier.
    }

    // Determine coffee strength/dilution modifier.
    if (cVol > MILK_THRESHOLD) { // Only apply if it's a coffee-based drink.
      const totalLiquid = cVol + wVol;
      const coffeeRatio = totalLiquid > 0 ? cVol / totalLiquid : 0;
      const waterRatio = totalLiquid > 0 ? wVol / totalLiquid : 0;

      if (wVol < MILK_THRESHOLD) { // Very low or no water implies "Di Lo".
        coffeeStrengthDescriptor = ' Di Lo';
      } else if (coffeeRatio > 0.6) { // More than 60% coffee, indicates "Gao" (strong).
        coffeeStrengthDescriptor = ' Gao';
      } else if (waterRatio > 0.6) { // More than 60% water, indicates "Po" (diluted).
        coffeeStrengthDescriptor = ' Po';
      }
    }

    // Determine the sweetness level modifier.
    const STANDARD_SUGAR = 1.0;
    if (addedSugar < MILK_THRESHOLD && swtMlk < MILK_THRESHOLD) { // No added sugar and no sweetened milk.
      sugarLevelMod = ' Kosong';
    } else if (addedSugar > STANDARD_SUGAR + 0.25) { // Significantly more than standard sugar.
      sugarLevelMod = ' Gah Dai';
    } else if (addedSugar > MILK_THRESHOLD && addedSugar < STANDARD_SUGAR - 0.1) { // Less than standard, but not zero.
      sugarLevelMod = ' Siew Dai';
    }

    // Handle the special case of pure water.
    if (wVol === 1.0 && cVol === 0 && swtMlk === 0 && unswtMlk === 0 && addedSugar === 0) {
      return 'Water';
    }

    // Assemble the final order string using template literals for clarity.
    return `${baseBeverageName}${milkDescriptor}${temperatureMod}${coffeeStrengthDescriptor}${sugarLevelMod}`;
  }
}

// Export the BeverageProcessor class as the default export of this module.
export default BeverageProcessor;