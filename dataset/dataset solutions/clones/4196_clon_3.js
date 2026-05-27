(function() {
    'use strict';

    const inputLines = [];
    require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    }).on('line', function(currentLine) {
      inputLines.push(currentLine);
    });

    process.stdin.on('end', function() {
      const numStores = parseInt(inputLines[0]);
      const storeAvailability = new Array(numStores + 1);
      const profitTable = new Array(numStores + 1);

      for (let storeIndex = 1; storeIndex <= numStores; storeIndex++) {
          const availabilityData = inputLines[storeIndex].split(" ");
          storeAvailability[storeIndex] = availabilityData;
      }

      const profitDataOffset = numStores;
      for (let storeIndex = 1; storeIndex <= numStores; storeIndex++) {
          const profitData = inputLines[storeIndex + profitDataOffset].split(" ");
          profitTable[storeIndex] = profitData;
      }

      let maxTotalProfit = Number.MIN_SAFE_INTEGER;
      const totalPossibleConfigurations = Math.pow(2, 10); // 2^10 = 1024

      for (let configIteration = 1; configIteration < totalPossibleConfigurations; configIteration++) {
          const currentConfigBinaryString = convertToBinaryString(configIteration);
          let currentConfigProfit = 0;

          for (let storeIndex = 1; storeIndex <= numStores; storeIndex++) {
            const storeOperatingHours = storeAvailability[storeIndex];
            const matchingHoursCount = countMatchingOperatingHours(currentConfigBinaryString, storeOperatingHours);
            const storeProfitForConfig = parseInt(profitTable[storeIndex][matchingHoursCount]);
            currentConfigProfit += storeProfitForConfig;
          }

          if (currentConfigProfit > maxTotalProfit) {
              maxTotalProfit = currentConfigProfit;
          }
      }

      console.log(maxTotalProfit);
    });
})();

function convertToBinaryString(decimalNumber) {
    const targetBinaryLength = 10;
    let binaryRepresentation = decimalNumber.toString(2);
    const paddingNeeded = targetBinaryLength - binaryRepresentation.length;
    const zeroPadding = '0'.repeat(paddingNeeded > 0 ? paddingNeeded : 0);
    return zeroPadding + binaryRepresentation;
}

function countMatchingOperatingHours(configString, storeHoursArray) {
    const requiredBinaryLength = 10;
    let matchingCount = 0;

    for (let charIndex = 0; charIndex < requiredBinaryLength; charIndex++) {
        const configBitValue = configString[charIndex];
        const storeBitValue = storeHoursArray[charIndex];

        const isConfigBitSet = (configBitValue === '1');
        const isStoreBitSet = (storeBitValue === '1');

        if (isConfigBitSet && isStoreBitSet) {
            matchingCount++;
        }
    }
    return matchingCount;
}
