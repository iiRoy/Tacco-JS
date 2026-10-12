function processInput(inputString) {
    const inputParts = inputString.trim().split(" ");
    const monthLimit = parseInt(inputParts[0], 10);
    const dayLimit = parseInt(inputParts[1], 10);

    let validCount = 0;

    // Implement an explicit guard clause for the day limit.
    // If the maximum day is less than 22, no valid combinations are possible
    // because the inner loop starts from 22. The original code would
    // print 0 and then proceed through loops that yield 0, so this
    // early return preserves observable behavior.
    if (dayLimit < 22) {
        console.log(0);
        return;
    }

    // Introduce a small helper function to encapsulate the logic
    // of extracting digits and calculating their product.
    const calculateDayDigitProduct = (dayNumber) => {
        const dayString = dayNumber.toString();
        // Assuming dayNumber will always be a two-digit number based on loop range (22-D)
        const digitTens = parseInt(dayString[0], 10);
        const digitUnits = parseInt(dayString[1], 10);
        return digitTens * digitUnits;
    };

    for (let currentMonth = 4; currentMonth <= monthLimit; currentMonth++) {
        for (let currentDay = 22; currentDay <= dayLimit; currentDay++) {
            const productOfDigits = calculateDayDigitProduct(currentDay);
            if (currentMonth === productOfDigits) {
                validCount++;
            }
        }
    }
    
    console.log(validCount);
}

processInput(require("fs").readFileSync("/dev/stdin", "utf8"));
