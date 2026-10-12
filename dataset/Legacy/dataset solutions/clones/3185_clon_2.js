function ProcessInputData(rawData) {
  // Split the entire input string into an array of lines.
  rawData = rawData.split("\n");

  // Extract the first line which contains N (number of customers) and M (number of dishes).
  let firstLineParts = rawData[0].split(" ");
  let numCustomers = parseInt(firstLineParts[0], 10); // N
  let numDishes = parseInt(firstLineParts[1], 10);    // M

  // Initialize counters for the process.
  let currentDishId = 1; // Represents the dish being evaluated, starting from 1.
  let customerCount = 0; // Counts how many customers like the current dish.
  let satisfiedDishes = 0; // Counts dishes liked by all customers.

  // Iterate through each possible dish from 1 to M.
  for (currentDishId = 1; currentDishId <= numDishes; currentDishId++) {
    // For each dish, check every customer's preferences.
    for (let customerIdx = 1; customerIdx <= numCustomers; customerIdx++) {
      // Get the preferences for the current customer (line customerIdx in input).
      let customerPrefParts = rawData[customerIdx].split(" ");
      let numPreferences = parseInt(customerPrefParts[0], 10); // K, number of preferences for this customer.

      // Loop through the current customer's stated preferences.
      for (let prefIdx = 1; prefIdx <= numPreferences; prefIdx++) {
        let preferredDishId = parseInt(customerPrefParts[prefIdx], 10); // A preferred dish ID.

        // If the customer's preferred dish matches the dish currently being evaluated, increment the count.
        if (preferredDishId === currentDishId) {
          customerCount++;
        }
      }
    }

    // After checking all customers for the current dish,
    // if all customers liked it (customerCount equals N), increment the total.
    if (customerCount === numCustomers) {
      satisfiedDishes++;
    }

    // Reset the customer count for the next dish evaluation.
    customerCount = 0;
  }

  // Output the final count of dishes liked by all customers.
  console.log(satisfiedDishes);
}

// This part handles reading input from standard input and calling the main processing function.
// It should not be modified.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
