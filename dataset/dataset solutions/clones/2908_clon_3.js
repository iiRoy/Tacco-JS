const parseRestaurantRow = (restaurantRowString, indexInProcessedList) => {
    const rowParts = restaurantRowString.split(' ');
    // The original code uses (index + 1) for the first element of the array,
    // where 'index' is the 0-based index within the filtered list of restaurant rows.
    return [indexInProcessedList + 1].concat(rowParts);
};

const ProcessInput = (rawData) => {
  const lineData = rawData.split('\n');
  const recordCountString = lineData[0];
  // Although 'recordCountString' is not directly used in the subsequent logic
  // to control iteration, parsing it can be considered an intermediate step
  // or a temporary constant addition for Type III.
  const totalRestaurantsExpected = parseInt(recordCountString, 10);

  // Structural edit: Use slice to skip the header line instead of filter.
  const initialRestaurantLines = lineData.slice(1);

  const restaurantRecords = initialRestaurantLines
    .map((currentRestaurantLine, relativeIndex) => {
        // Utilize a small helper function for processing each row.
        return parseRestaurantRow(currentRestaurantLine, relativeIndex);
    });

  const orderedRestaurants = restaurantRecords.sort(restaurantComparator);

  // Introduce a temporary constant for the output condition.
  const MIN_RESTAURANT_NAME_LENGTH = 1; // Equivalent to checking if string is not empty.

  orderedRestaurants.forEach((restaurantEntry) => {
    const restaurantName = restaurantEntry[1];
    // Rewrite the condition using the helper constant and string length.
    if (restaurantName.length >= MIN_RESTAURANT_NAME_LENGTH) {
      console.log(restaurantEntry[0]);
    }
  });
};

const restaurantComparator = (firstRestaurant, secondRestaurant) => {
    const firstName = firstRestaurant[1];
    const secondName = secondRestaurant[1];

    let comparisonResult;
    // Structural edit: Rewrite ternary operator to if/else if/else block.
    if (firstName === secondName) {
        comparisonResult = scoreComparator(firstRestaurant, secondRestaurant);
    } else if (firstName < secondName) {
        comparisonResult = -1;
    } else {
        comparisonResult = 1;
    }
    return comparisonResult;
};

const scoreComparator = (resA, resB) => {
    const scoreA = parseInt(resA[2], 10);
    const scoreB = parseInt(resB[2], 10);

    let scoreComparisonResult;
    // Structural edit: Rewrite ternary operator to if/else if/else block.
    if (scoreA === scoreB) {
        scoreComparisonResult = 0;
    } else if (scoreA < scoreB) {
        scoreComparisonResult = 1; // Descending order for score
    } else {
        scoreComparisonResult = -1; // Descending order for score
    }
    return scoreComparisonResult;
};

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
