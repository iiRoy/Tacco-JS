console.log(
  (
    (inputData) => {
      // Parse the input string.
      // The first line provides the number of elements (numElements).
      // The second line contains the array of integers (dataArray).
      const [
        [numElements], // Represents N from the original code
        dataArray      // Represents A from the original code
      ] = inputData
        .trim() // Remove leading/trailing whitespace
        .split`\n` // Split into lines
        .map(
          (rowString) => rowString.split` `.map(
            (valueString) => valueString | 0 // Convert string to integer using bitwise OR 0
          )
        );

      // Sort the array of numbers in ascending order.
      dataArray.sort((firstVal, secondVal) => firstVal - secondVal);

      // Find the maximum value present in the sorted array.
      const maxValue = dataArray[numElements - 1];

      // Create a boolean array to keep track of numbers that are multiples of other numbers in the input.
      // Initialize all entries to 'false'. The size is maxValue + 1 to cover indices from 0 to maxValue.
      const isMarked = Array(maxValue + 1).fill(false);

      // Initialize a counter for numbers that are not multiples of any other number in the input array
      // and are the last occurrence of their value in the sorted array.
      let uniqueDivisorCount = 0;

      // Iterate through each element of the sorted data array.
      for (let currentIdx = 0; currentIdx < numElements; currentIdx++) {
        // If the current number has already been marked as a multiple of a smaller number,
        // it cannot be a unique divisor itself, so skip to the next number.
        if (isMarked[dataArray[currentIdx]]) {
          continue;
        }

        // If the current number is not marked, it means it's not a multiple of any preceding number.
        // Mark all its multiples up to the maximum value in the array.
        // These marked numbers cannot be unique divisors themselves.
        for (let multipleValue = dataArray[currentIdx]; multipleValue <= maxValue; multipleValue += dataArray[currentIdx]) {
          isMarked[multipleValue] = true;
        }

        // After marking its multiples, check if the current number is different from the next number in the array.
        // This condition ensures that if there are duplicate numbers (e.g., [2, 2, 3]),
        // only the last occurrence of a unique divisor (if it hasn't been marked) will increment the count.
        // If dataArray[currentIdx] is the last element, dataArray[currentIdx + 1] will be undefined,
        // making the condition true and allowing the last element to be counted if not marked.
        if (dataArray[currentIdx] !== dataArray[currentIdx + 1]) {
          uniqueDivisorCount++;
        }
      }

      // Return the final count as a string.
      return `${uniqueDivisorCount}`;
    }
  )(
    // Read the input data from standard input using Node.js 'fs' module.
    require('fs').readFileSync('/dev/stdin', 'utf8')
  )
);
