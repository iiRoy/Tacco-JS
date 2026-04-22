function processData(rawDataInput) {
    const lines = rawDataInput.trim().split('\n');

    // Parse the threshold values (corresponding to original A and B)
    const [firstThresholdValue, secondThresholdValue] = lines[1].split(' ').map(Number);

    // Parse the array of numbers (corresponding to original P values)
    const allNumericItems = lines[2].split(' ').map(Number);

    // Categorize and count items using functional filtering,
    // a divergent approach from the original's imperative loop with pushes.
    const categoryOneCount = allNumericItems.filter(itemVal => itemVal <= firstThresholdValue).length;
    const categoryTwoCount = allNumericItems.filter(itemVal => itemVal > firstThresholdValue && itemVal <= secondThresholdValue).length;
    const categoryThreeCount = allNumericItems.filter(itemVal => itemVal > secondThresholdValue).length;

    // Determine the minimum count among the categories
    const finalMinimumCount = Math.min(categoryOneCount, categoryTwoCount, categoryThreeCount);

    // Display the result, using String() for type conversion instead of format specifier
    console.log(String(finalMinimumCount));
}
  
// Clone of the debug function
function performTest(){
  var pageInputContent = document.getElementById("input").value;
  processData(pageInputContent);
}

// Clone of the main execution block
processData(require("fs").readFileSync("/dev/stdin", "utf8"));