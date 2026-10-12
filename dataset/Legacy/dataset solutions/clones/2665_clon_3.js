const calculateMaxEarnings = (rawInputString) => {
    const inputLines = rawInputString.trim().split("\n");

    const firstLineData = inputLines[0].split(" ").map(Number);
    const totalJobCount = firstLineData[0]; // N
    const availableDays = firstLineData[1]; // M

    const jobOpportunities = inputLines.slice(1).map(line => {
        return line.split(" ").map(Number);
    });

    // Sort job opportunities by their start day (a[0]) in ascending order
    jobOpportunities.sort((jobA, jobB) => jobA[0] - jobB[0]);

    const availableJobsHeap = new MinPriorityQueue();
    let maxPossibleEarnings = 0;
    let jobOpportunityIndex = 0;

    // Iterate through each day from 1 to M
    for (let currentDay = 1; currentDay <= availableDays; currentDay++) {
        // Add all jobs whose start day is 'currentDay' to the priority queue
        while (jobOpportunityIndex < jobOpportunities.length && jobOpportunities[jobOpportunityIndex][0] === currentDay) {
            const currentJobReward = jobOpportunities[jobOpportunityIndex][1];
            // Store negative rewards to simulate a max-heap using a min-heap
            availableJobsHeap.insert(-currentJobReward);
            jobOpportunityIndex++;
        }

        // If there are jobs available for the current day, take the one with the highest reward
        if (availableJobsHeap.getSize() > 0) {
            const bestJobRewardNegative = availableJobsHeap.extractMin();
            maxPossibleEarnings += -bestJobRewardNegative; // Convert back to positive reward
        }
    }

    console.log(maxPossibleEarnings);
};

class MinPriorityQueue {
    constructor() {
        this.heapElements = [];
    }

    insert(itemToProcess) {
        const heap = this.heapElements;
        heap.push(itemToProcess); // Add the new item to the end of the heap
        let currentIndex = heap.length - 1; // Index of the newly added item

        // Bubble up the new item to maintain the min-heap property
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            // If the parent is less than or equal to the current item, it's in the correct position
            if (heap[parentIndex] <= heap[currentIndex]) {
                break;
            }
            // Otherwise, swap the current item with its parent
            [heap[currentIndex], heap[parentIndex]] = [heap[parentIndex], heap[currentIndex]];
            currentIndex = parentIndex; // Move up to the parent's position
        }
    }

    extractMin() {
        const heap = this.heapElements;
        if (heap.length === 0) {
            return undefined; // Return undefined if the heap is empty
        }
        if (heap.length === 1) {
            return heap.pop(); // If only one element, just remove and return it
        }

        const extractedValue = heap[0]; // The minimum element is at the root
        const lastElement = heap.pop(); // Remove the last element
        heap[0] = lastElement; // Place the last element at the root

        let currentIndex = 0;
        const halfHeapLength = Math.floor(heap.length / 2); // Optimization for loop condition

        // Bubble down the new root to maintain the min-heap property
        while (currentIndex < halfHeapLength) {
            let leftChildIndex = (currentIndex * 2) + 1;
            let rightChildIndex = (currentIndex * 2) + 2;
            let smallestChildIndex = leftChildIndex; // Assume left child is smallest initially

            // Check if right child exists and is smaller than the left child
            if (rightChildIndex < heap.length && heap[rightChildIndex] < heap[leftChildIndex]) {
                smallestChildIndex = rightChildIndex;
            }

            // If the current element is less than or equal to its smallest child, it's in the correct position
            if (heap[currentIndex] <= heap[smallestChildIndex]) {
                break;
            }

            // Otherwise, swap the current element with its smallest child
            [heap[currentIndex], heap[smallestChildIndex]] = [heap[smallestChildIndex], heap[currentIndex]];
            currentIndex = smallestChildIndex; // Move down to the child's position
        }
        return extractedValue;
    }

    getSize() {
        return this.heapElements.length;
    }

    peek() {
        return this.heapElements.length > 0 ? this.heapElements[0] : undefined;
    }
}

calculateMaxEarnings(require("fs").readFileSync("/dev/stdin", "utf8"));
