export default {

  analyzeBeverage(beverageName) {
    // Normalize the input string by removing leading/trailing spaces and converting to lowercase for consistent parsing.
    beverageName = beverageName.trim().toLowerCase();

    // Initialize all beverage components with their default zero or 'warm' values.
    let javaContent = 0.0;
    let sweetenedDairy = 0.0; // Represents condensed milk, which is inherently sweet.
    let unsweetenedDairy = 0.0; // Represents evaporated milk, which is unsweetened.
    let sweetenerAmount = 0.0;
    let aquaVolume = 0.0;
    let temperatureCondition = 'warm'; // Default serving temperature.

    // Check if the beverage name corresponds to a 'kopi' type.
    if (
      /^kopi/.test(beverageName)
    ) {

      // --- Section 1: Determine the base type of 'kopi' and initial ingredient ratios ---

      // All 'kopi' variants generally start with a base level of sweetness.
      sweetenerAmount = 1.0;

      // Identify specific 'kopi' preparations based on keywords.
      // 'Kopi C' (with evaporated milk)
      if (
        /^kopi\s(c|si|see)\b/.test(beverageName)
      ) {
        unsweetenedDairy = 0.20;
        aquaVolume = 0.40;
        javaContent = 0.40;
      }
      // 'Kopi O' (black coffee, no milk)
      else if (
        /^kopi\soh?\b/.test(beverageName)
      ) {
        aquaVolume = 0.50;
        javaContent = 0.50;
      }
      // Default 'Kopi' (with condensed milk)
      else {
        sweetenedDairy = 0.20;
        aquaVolume = 0.40;
        javaContent = 0.40;
      }

      // --- Section 2: Adjust for desired serving temperature ---

      // Check for terms indicating iced or lukewarm preparation.
      if (/\b(peng|bing)\b/.test(beverageName)) {
        temperatureCondition = 'iced';
      } else if (
        /\bpua sio\b/.test(beverageName)
      ) {
        temperatureCondition = 'lukewarm';
      }

      // --- Section 3: Fine-tune ingredients based on specific taste modifiers ---

      // 'kosong' implies no added sugar.
      if (/\bkosong\b/.test(beverageName)) {
        if (sweetenedDairy > 0.0) {
          // Throw an error if 'kosong' is requested with sweetened dairy, as it's a contradiction.
          throw new Error('Preparation Error. Sweetened dairy already includes sugar, cannot be "kosong".');
        }
        sweetenerAmount = 0.0; // Explicitly set sugar to zero.
      }
      // 'gah dai' for extra sweetness.
      else if (
        /\b(ga|ka)h?\s(d|t)ai\b/.test(beverageName)
      ) {
        if (sweetenedDairy > 0.0) {
          sweetenedDairy += 0.10; // Increase sweetened dairy amount.
          aquaVolume -= 0.05; // Reduce water slightly to maintain balance.
          javaContent -= 0.05; // Reduce coffee slightly.
        } else if (unsweetenedDairy > 0.0) {
          unsweetenedDairy += 0.10; // Increase unsweetened dairy amount.
          aquaVolume -= 0.05; // Adjust water.
          javaContent -= 0.05; // Adjust coffee.
        }
        sweetenerAmount = 1.5; // Set a higher sugar level.
      }
      // 'siu dai' for reduced sweetness.
      else if (
        /\b(siu|siew|xiu)\s(t|d)ai\b/.test(beverageName)
      ) {
        sweetenerAmount = 0.50; // Set a lower sugar level.
      }
      // 'po' for a weaker brew (more water, less coffee).
      else if (/\bpoh?\b/.test(beverageName)) {
        aquaVolume += 0.10;
        javaContent -= 0.10;
      }
      // 'gau' for a stronger brew (less water, more coffee).
      else if (
        /\b(g|k)a(u|o)\b/.test(beverageName)
      ) {
        aquaVolume -= 0.10;
        javaContent += 0.10;
      }
      // 'di lo' for concentrated coffee (no water, maximum coffee).
      else if (/\bdi\slo\b/.test(beverageName)) {
        javaContent += aquaVolume; // Add all water content to coffee.
        aquaVolume = 0.0; // Remove all water.
      }

    } else if (/^water$/.test(beverageName)) { // Handle the simple case of plain water.
      aquaVolume = 1.0;
    }

    // Return an object containing the final calculated ingredient profile.
    return {
      aquaVolume,
      javaContent,
      sweetenerAmount,
      sweetenedDairy,
      unsweetenedDairy,
      temperatureCondition,
    };
  },


  describeBeverage(beverageComponents = {}) {
    // Destructure the input object to extract individual component values.
    const {
      sweetenedDairy,
      unsweetenedDairy,
      temperatureCondition,
      sweetenerAmount,
      javaContent,
      aquaVolume
    } = beverageComponents;

    // Initialize descriptor strings for each characteristic.
    let javaDescriptor = '';
    let tempDescriptor = '';
    let dairyDescriptor = '';
    let sweetnessDescriptor = '';

    // Determine the dairy descriptor based on milk type.
    if (unsweetenedDairy > 0.0) {
      dairyDescriptor = ' C'; // Indicates evaporated milk.
    } else if (sweetenedDairy <= 0.0) { // If no sweetened dairy is present.
      dairyDescriptor = ' O'; // Indicates no milk or unsweetened coffee.
    }

    // Determine the temperature descriptor.
    if (temperatureCondition === 'iced') {
      tempDescriptor = ' Peng';
    } else if (temperatureCondition === 'lukewarm') {
      tempDescriptor = ' Pua Sio';
    }

    // Determine the coffee strength descriptor.
    if (javaContent > aquaVolume) {
      if (aquaVolume === 0.0) {
        javaDescriptor = ' Di Lo'; // Very strong, no water.
      } else if (sweetenedDairy > aquaVolume) {
        // Special case: if sweetened dairy exceeds water, it implies 'Gah Dai'.
        sweetnessDescriptor = ' Gah Dai';
      } else {
        javaDescriptor = ' Gao'; // Strong coffee.
      }
    } else if (javaContent < aquaVolume) {
      javaDescriptor = ' Po'; // Weak coffee.
    }

    // Determine the overall sweetness descriptor.
    if (sweetenerAmount === 0.0 && sweetenedDairy <= 0.0) {
      sweetnessDescriptor = ' Kosong'; // No sugar, no sweetened milk.
    } else if (sweetenerAmount < 1.0) {
      sweetnessDescriptor = ' Siew Dai'; // Less sweet.
    } else if (sweetenerAmount > 1.0) {
      sweetnessDescriptor = ' Gah Dai'; // More sweet.
    }

    // Construct the final string representation of the beverage.
    return `Kopi${dairyDescriptor}${tempDescriptor}${javaDescriptor}${sweetnessDescriptor}`;
  }

};