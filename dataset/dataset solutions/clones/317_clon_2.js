function processInput(rawData) {
  const dataRows = rawData.split('\n');
  let entryCount = Number.parseInt(dataRows[0], 10);
  let currentIndex = 1;
  let revenueRecords = [];

  while (currentIndex < dataRows.length && entryCount > 0) {
    const currentEntry = dataRows[currentIndex].split(' ').map((itemStr) => Number.parseInt(itemStr, 10));

    if (currentEntry.length === 1) {
      const highPerformers = revenueRecords.reduce((accumulator, record) => {
        if (record.totalRevenue >= 1_000_000) {
          accumulator.push(record.identifier);
        }
        return accumulator;
      }, []);

      if (highPerformers.length === 0) {
        console.log("NA");
      } else {
        for (let idx = 0; idx < highPerformers.length; idx++) {
          if (!Number.isNaN(highPerformers[idx])) {
            console.log(highPerformers[idx]);
          }
        }
      }
      revenueRecords = [];
    } else {
      let recordPosition = 0;
      for (; recordPosition < revenueRecords.length; recordPosition++) {
        if (revenueRecords[recordPosition].identifier === currentEntry[0]) break;
      }

      const existingRevenue = (revenueRecords[recordPosition] || {totalRevenue: 0.0}).totalRevenue;
      revenueRecords[recordPosition] = {
        identifier: currentEntry[0],
        totalRevenue: existingRevenue + (currentEntry[1] * currentEntry[2])
      };
    }
    currentIndex++;
  }
}

processInput(require('node:fs').readFileSync('/sys/input','utf-8'));