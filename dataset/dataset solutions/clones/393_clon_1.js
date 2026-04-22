/*
 * This is a simulation function for a seating arrangement problem.
 * It calculates wait times for groups arriving at a venue with limited seating.
 */
function main()
{

    // Initialize the seating array. Each element represents a seat,
    // and its value indicates how many minutes it will be occupied.
    var seats = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];

    // Define the number of members in each group that arrives.
    // Groups cycle through these sizes.
    var groupMembers = [2, 5, 2, 2, 2];

    // Define the duration (in minutes) each group will occupy their seats.
    // This also cycles based on group arrival order.
    var eatTimes = [19, 39, 25, 36, 22, 42];


    // Initialize variables for tracking the simulation state.
    var headGroup = -1;      // Represents the index of the next group to arrive/be seated. -1 means no group is waiting.
    var pastMinutes = 0;     // Current time in minutes since the simulation started.
    var waitTime = [];       // Array to store the calculated wait time for each group.


    // The main simulation loop continues until 100 groups have had their wait time recorded.
    while (waitTime.length < 100)
    {
        // --- Phase 1: Update seat occupancy (groups finish eating) ---
        // Iterate through all seats and decrement their occupancy timer.
        // If a seat's timer reaches 0, it becomes free.
        for (var i = 0; i < seats.length; i++)
        {
            seats[i] = seats[i] == 0 ? 0 : seats[i] - 1; /* Decrement timer if seat is occupied */
        }


        // --- Phase 2: Group arrival ---
        // A new group arrives every 5 minutes, starting from minute 0.
        // headGroup is set to the index of the newly arrived group.
        // If headGroup is not -1, it means a group is already waiting or being processed.
        if (headGroup == -1 && pastMinutes % 5 == 0)
        {
            headGroup = pastMinutes / 5; /* Calculate the group index based on arrival time */
        }


        // --- Phase 3: Seating attempt ---
        // Keep trying to seat the current 'headGroup' until it's seated or no sequential seats are available.
        while (headGroup != -1)
        {
            // Determine the number of seats required by the current group.
            var needsSequencialSeats = groupMembers[headGroup % 5];
            var sequencialSeats = 0; // Counter for consecutive empty seats.
            var startIndex = -1;     // Stores the starting index of the found block of seats.

            // Scan through all seats to find a contiguous block.
            for (var i = 0; i < seats.length; i++)
            {
                // If the current seat is empty, increment the sequential counter; otherwise, reset it.
                sequencialSeats = seats[i] == 0 ? sequencialSeats + 1 : 0;

                // Check if we found enough sequential seats.
                if (sequencialSeats == needsSequencialSeats)
                {
                    // Calculate the actual starting index of the block.
                    startIndex = i - (needsSequencialSeats - 1);
                    break; // Found seats, exit the inner loop.
                }
            }

            // --- Seating outcome ---
            if (startIndex != -1)
            {
                // Group was successfully seated!
                // Record their wait time. Wait time is current time minus their arrival time.
                waitTime[headGroup] = pastMinutes - (headGroup * 5);

                // Occupy the found seats for the group's eating duration.
                for (var i = startIndex; i < (needsSequencialSeats + startIndex); i++)
                {
                    seats[i] = eatTimes[headGroup % 6]; /* Set occupancy timer for each seat */
                }

                // Move to the next group, or reset headGroup if no new group has arrived yet.
                // This checks if the *next* potential group (headGroup + 1) would have already arrived.
                headGroup = (((headGroup + 1) * 5) <= pastMinutes) ? headGroup + 1 : -1;
            }
            else
            {
                // Group could not be seated due to lack of sequential seats.
                // They will wait until the next minute (next iteration of the main loop).
                break;
            }

        } // End of seating attempt while loop


        // Advance the simulation by one minute.
        pastMinutes++;

    } // End of main simulation while loop


    // --- Output Results ---
    // After the simulation, process the input to display specific wait times.
    // input.length - 1 is used because the last line might be empty.
    for (var i = 0; i < (input.length - 1); i++)
    {
        // Parse the input group index and print its corresponding wait time.
        console.log(waitTime[parseInt(input[i], 10)]);
    }

} // End of main function


// --- Input Processing Setup ---
// Global variable to store input data.
var input = '';

// Resume standard input to listen for data.
process.stdin.resume();

// Set encoding for input data.
process.stdin.setEncoding('utf8');

// Event listener for incoming data chunks.
process.stdin.on('data', function (chunk)
{
    input += chunk; // Append chunk to input string.
});

// Event listener for the end of input stream.
process.stdin.on('end', function ()
{
    input = input.split('\n'); // Split input string into an array of lines.
    main();                     // Call the main simulation function.
});