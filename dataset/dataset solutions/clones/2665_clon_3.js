/**
 * Parses raw input data to calculate the maximum cumulative earnings
 * by intelligently scheduling job offers over a period.
 * This implementation uses a max-heap to prioritize job profits.
 * @param {string} rawInputData - The raw string input containing job details.
 */
function processFinancialData(rawInputData) {
    // Sanitize and split the input into individual lines.
    const dataLines = String(rawInputData)
        .split('\n')
        .map(line => line.trim()) // Ensure each line is trimmed
        .filter(line => line.length > 0); // Remove any empty lines

    // Early exit if no valid data is provided.
    if (dataLines.length === 0) {
        console.log(0);
        return;
    }

    // Parse the initial configuration parameters from the first line.
    // N: (Not explicitly used in this specific problem logic, but represents total items or similar)
    // D: Total duration in days for scheduling.
    const [numTotalItems, totalSchedulingDays] = dataLines[0].split(' ').map(Number);

    // Validate main parameters.
    if (isNaN(totalSchedulingDays) || totalSchedulingDays <= 0) {
        console.error("Invalid or non-positive total scheduling days provided.");
        console.log(0); // Default to 0 earnings for invalid input
        return;
    }

    // Helper function to parse a single job offer line.
    const parseJobOffer = (offerString) => {
        const [dayToComplete, potentialProfit] = offerString.split(' ').map(Number);
        if (isNaN(dayToComplete) || isNaN(potentialProfit) || dayToComplete <= 0 || potentialProfit < 0) {
             // Basic validation for job data integrity.
             console.warn(`Skipping invalid job offer: ${offerString}`);
             return null; // Return null for invalid entries
        }
        return { completionDay: dayToComplete, profit: potentialProfit };
    };

    // Process all job offer entries, skipping the first line (parameters).
    // Filter out any null entries resulting from invalid parsing.
    const availableJobOffers = dataLines
        .slice(1)
        .map(parseJobOffer)
        .filter(offer => offer !== null);

    // Sort the job offers primarily by their completion day in ascending order.
    // A secondary sort by profit (descending) could be added but isn't strictly necessary for correctness here.
    availableJobOffers.sort((offerA, offerB) => {
        // If completion days are the same, prioritize higher profit (optional, but good for stability)
        if (offerA.completionDay === offerB.completionDay) {
            return offerB.profit - offerA.profit;
        }
        return offerA.completionDay - offerB.completionDay;
    });

    // Initialize a max-heap to store profits of available jobs for the current day.
    const profitMaximizer = new MaxBenefitHeap();
    let accumulatedEarnings = 0; // Total profit accumulated over the scheduling period.
    let currentJobPointer = 0; // Index to track the next job offer to consider.

    // Iterate through each day of the scheduling period.
    for (let dayIterator = 1; dayIterator <= totalSchedulingDays; dayIterator++) {
        // Add all jobs whose completion day is equal to the current day to the max-heap.
        // These are jobs that become available to be considered on this specific day.
        while (currentJobPointer < availableJobOffers.length &&
               availableJobOffers[currentJobPointer].completionDay === dayIterator) {
            profitMaximizer.addBenefit(availableJobOffers[currentJobPointer].profit);
            currentJobPointer++; // Move to the next job offer.
        }

        // If there are no jobs available in the heap for the current day, skip to the next day.
        if (profitMaximizer.isEmpty()) {
            continue;
        }

        // Extract the job with the highest profit from the heap and add it to accumulated earnings.
        // This simulates taking the most profitable job that is available up to this day.
        accumulatedEarnings += profitMaximizer.extractMax();
    }

    // Output the final calculated maximum earnings.
    console.log(accumulatedEarnings);
}

/**
 * Implements a Max-Heap data structure.
 * Elements are added and the maximum element can be extracted.
 */
class MaxBenefitHeap {
    constructor() {
        this.elements = []; // The array representing the heap.
    }

    /**
     * Inserts a new value into the heap, maintaining the max-heap property.
     * @param {number} value - The numerical value to insert.
     */
    addBenefit(value) {
        this.elements.push(value);
        this._heapifyUp(); // Restore heap property by moving the new element up.
    }

    /**
     * Removes and returns the maximum value from the heap.
     * The max value is always at the root (index 0).
     * @returns {number | undefined} The maximum value, or undefined if the heap is empty.
     */
    extractMax() {
        if (this.isEmpty()) {
            return undefined; // Or throw an error, depending on desired behavior.
        }
        if (this.size() === 1) {
            return this.elements.pop(); // If only one element, just remove and return it.
        }

        const maxValue = this.elements[0]; // Store the max value to return.
        this.elements[0] = this.elements.pop(); // Move the last element to the root.
        this._heapifyDown(); // Restore heap property by moving the new root down.
        return maxValue;
    }

    /**
     * Returns the maximum value in the heap without removing it.
     * @returns {number | undefined} The maximum value, or undefined if the heap is empty.
     */
    peekMax() {
        return this.isEmpty() ? undefined : this.elements[0];
    }

    /**
     * Returns the current number of elements in the heap.
     * @returns {number} The size of the heap.
     */
    size() {
        return this.elements.length;
    }

    /**
     * Checks if the heap is empty.
     * @returns {boolean} True if the heap contains no elements, false otherwise.
     */
    isEmpty() {
        return this.elements.length === 0;
    }

    /**
     * Private method to restore the max-heap property by bubbling up an element.
     * Starts from the last element (which was just added).
     */
    _heapifyUp() {
        let currentIndex = this.elements.length - 1;
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (this.elements[currentIndex] > this.elements[parentIndex]) {
                // If child is greater than parent, swap them.
                this._swap(currentIndex, parentIndex);
                currentIndex = parentIndex; // Move up to the parent's position.
            } else {
                break; // Max-heap property is satisfied.
            }
        }
    }

    /**
     * Private method to restore the max-heap property by sinking down an element.
     * Starts from the root (index 0).
     */
    _heapifyDown() {
        let currentIndex = 0;
        const totalElements = this.elements.length;

        while (true) {
            const leftChildIndex = 2 * currentIndex + 1;
            const rightChildIndex = 2 * currentIndex + 2;
            let largestChildIndex = currentIndex;

            // Find the largest among current, left child, and right child.
            if (leftChildIndex < totalElements && this.elements[leftChildIndex] > this.elements[largestChildIndex]) {
                largestChildIndex = leftChildIndex;
            }
            if (rightChildIndex < totalElements && this.elements[rightChildIndex] > this.elements[largestChildIndex]) {
                largestChildIndex = rightChildIndex;
            }

            if (largestChildIndex !== currentIndex) {
                // If the largest is not the current element, swap and continue sinking down.
                this._swap(currentIndex, largestChildIndex);
                currentIndex = largestChildIndex;
            } else {
                break; // Max-heap property is satisfied.
            }
        }
    }

    /**
     * Private helper method to swap two elements in the heap array.
     * @param {number} idx1 - Index of the first element.
     * @param {number} idx2 - Index of the second element.
     */
    _swap(idx1, idx2) {
        [this.elements[idx1], this.elements[idx2]] = [this.elements[idx2], this.elements[idx1]];
    }
}

// Entry point for execution, reading from standard input.
processFinancialData(require("fs").readFileSync("/dev/stdin", "utf8"));