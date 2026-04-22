// Initialize a buffer for incoming system input
let rawData = '';

// Activate the standard input stream
process.stdin.resume();

// Configure the input stream to decode data as UTF-8 text
process.stdin.setEncoding('utf8');

// Attach an event listener for incoming data segments
process.stdin.on('data', (inputSegment) => {
    // Append the received segment to our raw data buffer
    rawData += inputSegment;
});

// Attach an event listener for when the input stream ends
process.stdin.on('end', () => {

    // Process the accumulated input data
    const [
        [, timeSlice],
        ...processQueue
    ] = rawData
        .trim() // Remove leading/trailing whitespace from the entire input
        .split('\n') // Break the input into individual lines
        .map( (dataRow) => { // Transform each line
            const [itemLabel, durationString] = dataRow.split(' '); // Split line by space to get label and duration
            return [itemLabel, +durationString]; // Convert duration string to a number and return as an array
        });

    // Initialize a counter for the total elapsed execution time
    let elapsedTime = 0;

    // Continue processing as long as there are items in the queue
    while (processQueue.length > 0) {

        // Retrieve the next item from the front of the queue
        const currentItem = processQueue.shift();

        // Calculate the actual time this item will execute in this slice
        // It's the minimum of the item's remaining duration and the global time slice
        const sliceDuration = Math.min(currentItem[1], timeSlice);

        // Advance the total elapsed time
        elapsedTime += sliceDuration;

        // Reduce the remaining duration of the current item
        currentItem[1] -= sliceDuration;

        // Check if the current item has more work remaining
        if (currentItem[1] > 0) {
            // If so, add it back to the end of the queue for future processing
            processQueue.push(currentItem);
        } else {
            // If the item is completed, log its label and its finish time
            console.log(currentItem[0], elapsedTime);
        }
    }
});