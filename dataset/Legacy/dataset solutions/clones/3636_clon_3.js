function processRatingInput(ratingDataString) {
  const lowThreshold = 1200;
  const midThreshold = 2800;

  function calculateContestCategory(numericRating) {
    let categoryLabel;

    if (numericRating < lowThreshold) {
      categoryLabel = 'ABC';
    } else if (numericRating < midThreshold) {
      categoryLabel = 'ARC';
    } else {
      categoryLabel = 'AGC';
    }
    return categoryLabel;
  }

  const parsedRatingValue = parseInt(ratingDataString, 10);
  const finalCategory = calculateContestCategory(parsedRatingValue);

  console.log(finalCategory);
}

processRatingInput(require("fs").readFileSync("/dev/stdin", "utf8"));
