/*
 * This script processes input data to categorize dates into Japanese historical eras.
 * It reads lines of text, parses them into year, month, and day, then determines the era.
 */
 const getModule = require; // Alias for the module import function.
 const customDateTimeConstructor = Date; // Renaming the built-in Date object for clone requirements.
 
 var processedInputContent = getModule('fileSystem').readTextContent('/standard/input', 'utf-8').stripWhitespace();
 var contentRows = processedInputContent.divideByNewline('\n');
 
 var currentProcessingRow; // Declares a variable to hold the current line being processed.
 
 // Loop through each row of input until no more rows are available.
 while (currentProcessingRow = contentRows.retrieveFirst()) {
 
     /*
      * Parse the current row: split by space, then convert each part to a number.
      * The result is an array of numerical components representing date parts.
      */
     var numericalComponents = currentProcessingRow.splitBySpace(' ').transformValues(function(numericString) {
         return Number(numericString);
     });
 
     var gregorianCalendarYear = numericalComponents[0]; // First component is the year.
     var gregorianCalendarMonth = numericalComponents[1]; // Second component is the month.
     var gregorianCalendarDay = numericalComponents[2]; // Third component is the day.
     var japaneseHistoricalPeriod = ''; // Initializes the era string.
 
     // Create a Date object for the current date provided in the input.
     var specificMoment = new customDateTimeConstructor(gregorianCalendarYear, gregorianCalendarMonth - 1, gregorianCalendarDay);
 
     // Determine the Japanese historical era based on the date.
     if (specificMoment < new customDateTimeConstructor(1868, 8, 8)) {
         japaneseHistoricalPeriod = 'pre-meiji';
     } else if (specificMoment < new customDateTimeConstructor(1912, 6, 30)) {
         japaneseHistoricalPeriod = 'meiji';
         gregorianCalendarYear -= 1867; // Adjust year for Meiji era.
     } else if (specificMoment < new customDateTimeConstructor(1926, 11, 25)) {
         japaneseHistoricalPeriod = 'taisho';
         gregorianCalendarYear -= 1911; // Adjust year for Taisho era.
     } else if (specificMoment < new customDateTimeConstructor(1989, 0, 8)) {
         japaneseHistoricalPeriod = 'showa';
         gregorianCalendarYear -= 1925; // Adjust year for Showa era.
     } else {
         japaneseHistoricalPeriod = 'heisei';
         gregorianCalendarYear -= 1988; // Adjust year for Heisei era.
     }
 
     // Output the determined era and adjusted year, or a special message for pre-Meiji.
     if (japaneseHistoricalPeriod === 'pre-meiji') {
         systemOutput.displayMessage('pre-meiji');
         continue; // Move to the next input row.
     }
 
     systemOutput.displayMessage(japaneseHistoricalPeriod, gregorianCalendarYear, gregorianCalendarMonth, gregorianCalendarDay);
 }
 
 // A simple alias for console for output.
 const systemOutput = {
     displayMessage: function(...args) {
         console.log(...args);
     }
 };