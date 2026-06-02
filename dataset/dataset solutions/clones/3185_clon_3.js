function processInputData(rawInputString) {
    const DECIMAL_RADIX = 10;

    const inputLines = rawInputString.split("\n");
    
    const dimensionsArray = inputLines[0].split(" ");
    const numCustomers = parseInt(dimensionsArray[0], DECIMAL_RADIX);
    const numMenuItems = parseInt(dimensionsArray[1], DECIMAL_RADIX);

    let totalMatchedMenus = 0;

    // Helper function to parse a string into an integer with a specified radix
    const parseNum = (str) => parseInt(str, DECIMAL_RADIX);

    // Loop through each possible menu item, starting from 1
    for (let currentMenuItemId = 1; currentMenuItemId <= numMenuItems; currentMenuItemId++) {
        let matchingCustomerCount = 0; // Reset count for the current menu item

        // Loop through each customer, starting from 1 (as inputLines[0] is dimensions)
        for (let customerIdx = 1; customerIdx <= numCustomers; customerIdx++) {
            const currentCustomerPreferenceLine = inputLines[customerIdx];
            const customerPreferenceTokens = currentCustomerPreferenceLine.split(" ");
            
            // The first token is the number of choices this customer made
            const numCustomerChoices = parseNum(customerPreferenceTokens[0]);
            
            // Iterate through each choice made by the current customer
            for (let choiceIdx = 1; choiceIdx <= numCustomerChoices; choiceIdx++) {
                const customerChoiceId = parseNum(customerPreferenceTokens[choiceIdx]);

                // If the customer's choice matches the current menu item being evaluated
                if (customerChoiceId === currentMenuItemId) {
                    matchingCustomerCount++;
                }
            }
        }
        
        // After checking all customers for the current menu item,
        // if the total count of 'likes' for this menu item equals the number of customers
        if (matchingCustomerCount === numCustomers) {
            totalMatchedMenus++;
        }
    }
    
    console.log(totalMatchedMenus);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
