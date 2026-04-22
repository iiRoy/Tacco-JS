// Define a shared utility function that converts a Date object into a comparable integer format (YYYYMMDD).
// This helper enhances modularity and readability, demonstrating a new fragment.
function numericDateConverter(dateInstance) {
    // Perform robust validation for the input.
    if (!(dateInstance instanceof Date) || isNaN(dateInstance.getTime())) {
        console.error("Invalid Date object provided to numericDateConverter.");
        return NaN; // Return Not-a-Number for invalid date instances.
    }

    const yearValue = dateInstance.getFullYear();
    const monthValue = dateInstance.getMonth() + 1; // JavaScript months are 0-indexed.
    const dayValue = dateInstance.getDate();

    // Pad month and day with leading zeros if necessary to ensure YYYYMMDD format.
    const formattedMonth = String(monthValue).padStart(2, '0');
    const formattedDay = String(dayValue).padStart(2, '0');

    // Combine into a single integer for efficient comparison.
    return Number(`${yearValue}${formattedMonth}${formattedDay}`);
}

// Assuming an Angular module named 'myApplicationFilters' is available globally,
// or we create a new one for these utility filters.
// This acts as a container for all the filtering capabilities.
const applicationFiltersModule = angular.module('myApplicationFilters', []);

// This filter processes a collection of data objects, retaining only those
// whose associated date falls within a specified chronological interval.
// Parameters:
//   - dataCollection: An array of objects, each expected to have a 'date' property (string "YYYY-MM-DD").
//   - dateBoundaryCriteria: An object containing 'periodStart' and 'periodEnd' properties,
//     which are expected to be Date objects.
applicationFiltersModule.filter('datePeriodFilter', function() {
    return function(dataCollection, dateBoundaryCriteria) {
        // Initialize an empty array for items that satisfy the date range.
        let qualifiedItems = [];

        // Guard clause: If the input collection is not an array or is empty,
        // no filtering can occur, so return an empty array immediately.
        if (!Array.isArray(dataCollection) || dataCollection.length === 0) {
            return qualifiedItems;
        }

        let minimumDateValue = NaN;
        let maximumDateValue = NaN;
        let filteringRequired = false; // Flag to indicate if date filtering conditions are met.

        // Validate the date boundary criteria object and its properties.
        const hasValidDateRange = dateBoundaryCriteria &&
                                  dateBoundaryCriteria.periodStart instanceof Date &&
                                  dateBoundaryCriteria.periodEnd instanceof Date;

        if (hasValidDateRange) {
            // Convert the start and end Date objects into their integer representations using the helper.
            minimumDateValue = numericDateConverter(dateBoundaryCriteria.periodStart);
            maximumDateValue = numericDateConverter(dateBoundaryCriteria.periodEnd);

            // If both converted values are valid numbers, then filtering is required.
            if (!isNaN(minimumDateValue) && !isNaN(maximumDateValue)) {
                filteringRequired = true;

                // Ensure the minimum value is not greater than the maximum value.
                // If they are inverted, swap them for a logical range.
                if (minimumDateValue > maximumDateValue) {
                    [minimumDateValue, maximumDateValue] = [maximumDateValue, minimumDateValue];
                }
            } else {
                console.warn("One or both date boundary values are unparseable. Skipping date range filtering.");
            }
        }

        // If no valid date range was provided or parsed, return the original collection without modification.
        if (!filteringRequired) {
            return dataCollection;
        }

        // Iterate over each item in the provided collection.
        for (let itemIdx = 0; itemIdx < dataCollection.length; itemIdx++) {
            const currentDataItem = dataCollection[itemIdx];

            // Ensure the current item exists and has a 'date' property which is a string.
            if (currentDataItem && typeof currentDataItem.date === 'string') {
                // Convert the item's date string (e.g., "YYYY-MM-DD") to an integer (YYYYMMDD).
                // Remove all non-digit characters and then convert to a number.
                const itemNumericDate = Number(currentDataItem.date.replace(/\D/g, ''));

                // Verify the item's date was successfully converted to a number.
                if (!isNaN(itemNumericDate)) {
                    // Check if the item's date falls within or on the inclusive boundaries.
                    if (itemNumericDate >= minimumDateValue && itemNumericDate <= maximumDateValue) {
                        qualifiedItems.push(currentDataItem); // Add item if it meets the criteria.
                    }
                } else {
                    console.error(`Item at index ${itemIdx} has an invalid date string: '${currentDataItem.date}'. It will be excluded.`);
                }
            } else {
                console.warn(`Item at index ${itemIdx} is missing a 'date' property or it's not a string. It will be excluded.`);
            }
        }
        return qualifiedItems; // Return the new array containing only the filtered items.
    };
});


// This filter processes a list of products, retaining only those whose price
// falls within a specified financial range.
// Parameters:
//   - productInventory: An array of product objects, each with a 'price' property.
//   - financialConstraints: An object containing 'minAllowed' and 'maxAllowed' properties,
//     representing the lower and upper bounds of the price range.
applicationFiltersModule.filter('financialRangeFilter', function() {
    return function(productInventory, financialConstraints) {
        let matchingProducts = []; // Array to collect products within the price range.

        // Guard clause: If the input inventory is not an array or is empty, return an empty array.
        if (!Array.isArray(productInventory) || productInventory.length === 0) {
            return matchingProducts;
        }

        let lowerPriceLimit = -Infinity; // Default to no lower bound for flexibility.
        let upperPriceLimit = Infinity;  // Default to no upper bound.
        let shouldApplyFilter = false;   // Flag to determine if active filtering is necessary.

        // Parse and validate the financial constraints.
        if (financialConstraints) {
            const parsedMin = Number(financialConstraints.minAllowed);
            const parsedMax = Number(financialConstraints.maxAllowed);

            // If a valid minimum price is provided, set the lower limit and activate filtering.
            if (!isNaN(parsedMin)) {
                lowerPriceLimit = parsedMin;
                shouldApplyFilter = true;
            }
            // If a valid maximum price is provided, set the upper limit and activate filtering.
            if (!isNaN(parsedMax)) {
                upperPriceLimit = parsedMax;
                shouldApplyFilter = true;
            }

            // If the parsed minimum is greater than the maximum, swap them to form a valid range.
            if (lowerPriceLimit > upperPriceLimit) {
                [lowerPriceLimit, upperPriceLimit] = [upperPriceLimit, lowerPriceLimit];
            }
        }

        // If no valid financial constraints were provided, or they result in an unbounded range,
        // return the original inventory without applying any filter.
        if (!shouldApplyFilter) {
            return productInventory;
        }

        // Iterate through each product in the inventory.
        for (let productIdx = 0; productIdx < productInventory.length; productIdx++) {
            const currentProduct = productInventory[productIdx];

            // Ensure the product object exists and has a 'price' property that can be converted to a number.
            if (currentProduct && (typeof currentProduct.price === 'string' || typeof currentProduct.price === 'number')) {
                const productPrice = Number(currentProduct.price); // Convert product's price to a number.

                // Check if the converted price is a valid number and falls within the defined limits.
                if (!isNaN(productPrice) &&
                    productPrice >= lowerPriceLimit &&
                    productPrice <= upperPriceLimit) {
                    matchingProducts.push(currentProduct); // Add product if its price is within range.
                }
            } else {
                console.warn(`Product at index ${productIdx} is missing a 'price' property or it's not a valid numeric type. It will be excluded.`);
            }
        }
        return matchingProducts; // Return the filtered list of products.
    };
});


// Implements a text highlighting feature, marking occurrences of a search term
// within a given string, and handling content truncation for long texts.
// Adapted from ui-utils highlighting logic.
applicationFiltersModule.filter('contentHighlighter', function () {
    const HIGHLY_VISIBLE_CLASS = 'search-match-marker'; // Custom CSS class for highlighted segments.
    const MAXIMUM_DISPLAY_LENGTH = 120;             // Max characters before content is truncated.
    const TRUNCATION_SYMBOL = '...';                // Indicator for truncated text.

    return function (sourceString, queryTerm) {
        // Guard clause: Return original string if it's not a valid string or is empty.
        if (typeof sourceString !== 'string' || sourceString === null || sourceString.length === 0) {
            return sourceString;
        }

        let outputContent = sourceString;
        const stringLength = sourceString.length;

        // If no valid query term is provided, handle simple truncation if needed.
        if (!queryTerm || queryTerm.trim() === '') {
            if (stringLength > MAXIMUM_DISPLAY_LENGTH) {
                outputContent = sourceString.slice(0, MAXIMUM_DISPLAY_LENGTH) + TRUNCATION_SYMBOL;
            }
            return outputContent;
        }

        // Create a regular expression for the query term, ensuring global,
        // case-insensitive, and Unicode-aware matching.
        const highlightingPattern = new RegExp(queryTerm, 'gui');
        let totalMatchesFound = 0; // Counter for occurrences of the query term.

        // Case 1: The source string is short enough to be displayed in full.
        if (stringLength <= MAXIMUM_DISPLAY_LENGTH) {
            outputContent = sourceString.replace(highlightingPattern, function(matchedSegment) {
                totalMatchesFound++;
                return `<span class="${HIGHLY_VISIBLE_CLASS}">${matchedSegment}</span>`;
            });
        }
        // Case 2: The source string is longer and requires truncation.
        else {
            const initialSegment = sourceString.slice(0, MAXIMUM_DISPLAY_LENGTH);
            let processedInitialSegment = initialSegment.replace(highlightingPattern, function(matchedSegment) {
                totalMatchesFound++;
                return `<span class="${HIGHLY_VISIBLE_CLASS}">${matchedSegment}</span>`;
            });

            outputContent = processedInitialSegment;

            // Determine if further handling for ellipsis and additional matches is required.
            const queryTermFoundAfterTruncationPoint = sourceString.indexOf(queryTerm, MAXIMUM_DISPLAY_LENGTH) !== -1;

            if (totalMatchesFound > 0 || queryTermFoundAfterTruncationPoint) {
                // Add ellipsis to signify content was omitted.
                outputContent += TRUNCATION_SYMBOL;

                // If the query term exists *only* beyond the initial segment,
                // explicitly append it highlighted to indicate its presence.
                if (totalMatchesFound === 0 && queryTermFoundAfterTruncationPoint) {
                    outputContent += `<span class="${HIGHLY_VISIBLE_CLASS}">${queryTerm}</span>` + TRUNCATION_SYMBOL;
                }
            } else {
                // If no matches were found and the content is long, just truncate with ellipsis.
                outputContent += TRUNCATION_SYMBOL;
            }
        }
        return outputContent;
    };
});


// This filter segments an array, returning a portion starting from a specified index.
// Commonly used for pagination to display elements for a single page.
// Parameters:
//   - originalArray: The array of items to be paginated.
//   - offsetIndex: The zero-based index from which to start the slice.
applicationFiltersModule.filter('arrayOffsetSlice', function() {
    return function(originalArray, offsetIndex) {
        // Guard clause: If the input is not an array, return an empty array to prevent errors.
        if (!Array.isArray(originalArray)) {
            console.error("arrayOffsetSlice filter received non-array input. Returning an empty array.");
            return [];
        }

        // Convert the offsetIndex to a number and ensure it's non-negative.
        // Default to 0 if the input is invalid or less than zero.
        const effectiveStartingPoint = Math.max(0, Number(offsetIndex) || 0);

        // If the calculated starting point is beyond the array's length,
        // it means there are no elements to display, so return an empty array.
        if (effectiveStartingPoint >= originalArray.length) {
            return [];
        }

        // Return a new array slice containing elements from the effective starting point to the end.
        return originalArray.slice(effectiveStartingPoint);
    };
});