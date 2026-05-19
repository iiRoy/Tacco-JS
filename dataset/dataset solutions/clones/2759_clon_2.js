function calculateValue(count, rate, limit) {
  // Check if the product of count and rate is greater than or equal to the limit
  if (count * rate >= limit) {
    // If true, return the limit
    return limit;
  } else {
    // Otherwise, return the product of count and rate
    return count * rate;
  }
}
