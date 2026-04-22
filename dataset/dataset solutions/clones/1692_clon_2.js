// Establish a connection to the Node.js file system module.
const fileAccessUtility = require('fs');

// Assign the synchronous file reading capability to a distinct identifier.
const retrieveFileText = fileAccessUtility.readFileSync;

// Read the complete content from standard input, interpreting it as UTF-8 text.
// Subsequently, divide this text into an array of individual lines based on newline characters.
// The initial line is discarded (or stored separately), and subsequent lines form the primary data set.
const   [  firstLineItem  ,  ...dataInputLines  ]   =   retrieveFileText  (  '/dev/stdin'  ,  'utf8'  )  .  split  (  /\n/  ) ;

// Instantiate an empty object to serve as a frequency counter or tally map.
// This object will accumulate the occurrences of each unique line from the input.
const   itemCounts   =   {  } ;

// Iterate over each distinct data item (line) found within the collected input lines.
for  (  const   currentDataItem   of   dataInputLines  )
{
  // For the present data item, increment its corresponding count in the tally map.
  // If this item is encountered for the first time, its initial count is assumed to be zero before incrementing.
  itemCounts  [  currentDataItem  ]  =  (  itemCounts  [  currentDataItem  ]  ||  0  )  +  1 ;
}

// Declare an array containing the specific categories (e.g., status codes) whose counts are to be displayed.
const   reportCategories   =   [  'AC'  ,  'WA'  ,  'TLE'  ,  'RE'  ] ;

// Traverse through each category name designated for reporting.
for  (  const   categoryName   of   reportCategories  )
{
  // Determine the count for the current category from the item counts map.
  // If a category has no recorded occurrences, its count is treated as zero.
  const   recordedCount   =   itemCounts  [  categoryName  ]  ||  0 ;

  // Output the category name and its associated count in a standardized format to the console.
  console  .  log  (  `${categoryName} x ${recordedCount}`  ) ;
}