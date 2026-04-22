const ProcessInput = (rawData) => {
  // Parse the incoming raw string data into individual textual rows
  const textRows = rawData.split('\n');

  // Extract primary labels from each row, skipping the first and the last two
  // The original uses `splice` to extract a segment; `slice` achieves the same logical extraction
  const sectionHeaders = textRows.slice(1, textRows.length - 2).map(rowEntry => rowEntry.split(' ')[0]);

  // Determine the reference position by finding the marker in the extracted headers
  const markerPosition = sectionHeaders.indexOf(textRows[textRows.length - 2]);

  // Initialize a counter for accumulated numeric values
  let totalValue = 0;

  // Iterate through relevant data rows to aggregate numerical data
  // The loop starts two positions after the marker and ends before the last two rows
  for (let currentIdx = markerPosition + 2; currentIdx < textRows.length - 2; currentIdx += 1) {
    // Extract the second element from the current row, convert it to an integer, and add to the total
    totalValue += parseInt(textRows[currentIdx].split(' ')[1], 10); // Parse as integer
  }

  // Output the final aggregated numeric result to standard output
  process.stdout.write(String(totalValue) + '\n');
};

// Invoke the primary processing routine using standard input stream
ProcessInput(require('node:fs').readFileSync(0, 'utf8')); // Read from stdin file descriptor 0