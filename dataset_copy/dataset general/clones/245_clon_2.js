let afflictionCategories = [
  "battleInjuries",
  "otherMortalities",
  "illnessFatalities"
];

let historicalCasualtyData = [
  { recordPeriod: "4/1854", battleInjuries: 0, otherMortalities: 110, illnessFatalities: 110 },
  { recordPeriod: "5/1854", battleInjuries: 0, otherMortalities: 95, illnessFatalities: 105 },
  { recordPeriod: "6/1854", battleInjuries: 0, otherMortalities: 40, illnessFatalities: 95 },
  { recordPeriod: "7/1854", battleInjuries: 0, otherMortalities: 140, illnessFatalities: 520 },
  { recordPeriod: "8/1854", battleInjuries: 20, otherMortalities: 150, illnessFatalities: 800 },
  { recordPeriod: "9/1854", battleInjuries: 220, otherMortalities: 230, illnessFatalities: 740 },
  { recordPeriod: "10/1854", battleInjuries: 305, otherMortalities: 310, illnessFatalities: 600 },
  { recordPeriod: "11/1854", battleInjuries: 480, otherMortalities: 290, illnessFatalities: 820 },
  { recordPeriod: "12/1854", battleInjuries: 295, otherMortalities: 310, illnessFatalities: 1100 },
  { recordPeriod: "1/1855", battleInjuries: 230, otherMortalities: 460, illnessFatalities: 1440 },
  { recordPeriod: "2/1855", battleInjuries: 180, otherMortalities: 520, illnessFatalities: 1270 },
  { recordPeriod: "3/1855", battleInjuries: 155, otherMortalities: 350, illnessFatalities: 935 },
  { recordPeriod: "4/1855", battleInjuries: 195, otherMortalities: 195, illnessFatalities: 560 },
  { recordPeriod: "5/1855", battleInjuries: 180, otherMortalities: 155, illnessFatalities: 550 },
  { recordPeriod: "6/1855", battleInjuries: 330, otherMortalities: 130, illnessFatalities: 650 },
  { recordPeriod: "7/1855", battleInjuries: 260, otherMortalities: 130, illnessFatalities: 430 },
  { recordPeriod: "8/1855", battleInjuries: 290, otherMortalities: 110, illnessFatalities: 490 },
  { recordPeriod: "9/1855", battleInjuries: 355, otherMortalities: 100, illnessFatalities: 290 },
  { recordPeriod: "10/1855", battleInjuries: 135, otherMortalities: 95, illnessFatalities: 245 },
  { recordPeriod: "11/1855", battleInjuries: 100, otherMortalities: 140, illnessFatalities: 325 },
  { recordPeriod: "12/1855", battleInjuries: 40, otherMortalities: 120, illnessFatalities: 215 },
  { recordPeriod: "1/1856", battleInjuries: 0, otherMortalities: 160, illnessFatalities: 160 },
  { recordPeriod: "2/1856", battleInjuries: 0, otherMortalities: 100, illnessFatalities: 100 },
  { recordPeriod: "3/1856", battleInjuries: 0, otherMortalities: 125, illnessFatalities: 90 }
];

/*
 * This immediately invoked function expression (IIFE)
 * is responsible for preprocessing the date strings
 * within the historical casualty data.
 */
(
  function()
  {
    // Declares a parsing function using d3-time-format to convert MM/YY strings into Date objects.
    // This replaces the original Protovis (pv) date formatting utility.
    const periodParser = d3.timeParse("%m/%y");

    // Iterates over each object in the historicalCasualtyData array.
    historicalCasualtyData
      .forEach(
        function(dataEntry)
        {
          // Transforms the 'recordPeriod' string property of each entry
          // into a JavaScript Date object using the defined parser.
          dataEntry.recordPeriod = periodParser(dataEntry.recordPeriod);
        }
      );
  }
)();