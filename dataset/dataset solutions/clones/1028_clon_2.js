// Ensure the standard input stream is kept active to receive data.
process.stdin.resume();

// Configure the character encoding for the incoming data stream to UTF-8.
process.stdin.setEncoding("utf8");

// Initialize a new interface for reading input line by line and writing output.
const inputSource = require("readline").createInterface({
    input:  process.stdin, // Specify the input stream as standard input.
    output: process.stdout, // Specify the output stream as standard output.
});


// A dynamic array to store each line of input received from the user.
const inputRecords = [];


// Attach an event handler to process each line of input as it arrives.
inputSource.on("line", (recordString) => {
    // Add the current line string to our collection of input records.
    inputRecords.push(recordString);
});


// Define a sentinel node for a circular doubly linked list structure.
// This node serves as a placeholder for both the head and tail, simplifying list operations.
const boundaryNode = {};
boundaryNode.nextElement = boundaryNode; // Initially, the list is empty, so 'next' points to itself.
boundaryNode.prevElement = boundaryNode; // Similarly, 'previous' also points to itself.


// Attach an event handler for when the input stream has finished and is closed.
inputSource.on("close", () => {

    // The first line of input contains the total count of operations to be performed.
    // Convert this string to a numerical type.
    const totalOperations = Number(inputRecords[0]);

    // Loop through the input records, starting from the second line, to execute each operation.
    for (let operationIndex = 1; operationIndex <= totalOperations; operationIndex++) {
        // Split the current input line into an action type and its corresponding argument.
        let [actionType, actionArgument] = inputRecords[operationIndex].split(" ");

        // Use a switch statement to determine and execute the appropriate list manipulation action.
        switch (actionType) {
            case "place": // Corresponds to the 'insert' command.
                // Construct a new node object with the provided data and initial links.
                const newNode = {
                    dataContent:  actionArgument,          // The actual data value for this node.
                    prevElement:  boundaryNode,            // New node's previous points to the sentinel.
                    nextElement:  boundaryNode.nextElement, // New node's next points to the current first element.
                };
                // Update the pointers of the elements around the new node to insert it at the front.
                boundaryNode.nextElement.prevElement = newNode; // The element that was first now has newNode as its previous.
                boundaryNode.nextElement              = newNode; // The sentinel's next now points to the new node.
                break;

            case "remove": // Corresponds to the 'delete' command, removing a specific value.
                // Traverse the linked list starting from the first actual element (after the sentinel).
                for (let currentElement = boundaryNode.nextElement; boundaryNode !== currentElement; currentElement = currentElement.nextElement) {
                    // If the data content of the current element matches the action argument, remove it.
                    if (currentElement.dataContent === actionArgument) {
                        // Adjust the 'next' pointer of the previous element to bypass the current element.
                        currentElement.prevElement.nextElement = currentElement.nextElement;
                        // Adjust the 'previous' pointer of the next element to bypass the current element.
                        currentElement.nextElement.prevElement = currentElement.prevElement;
                        break; // Stop after removing the first occurrence found.
                    }
                }
                break;

            case "removeHead": // Corresponds to the 'deleteFirst' command.
                // Move the sentinel's 'next' pointer to the element after the current first element.
                boundaryNode.nextElement = boundaryNode.nextElement.nextElement;
                // Update the new first element's 'previous' pointer to point back to the sentinel.
                boundaryNode.nextElement.prevElement = boundaryNode;
                break;

            case "removeTail": // Corresponds to the 'deleteLast' command.
                // Move the sentinel's 'previous' pointer to the element before the current last element.
                boundaryNode.prevElement = boundaryNode.prevElement.prevElement;
                // Update the new last element's 'next' pointer to point back to the sentinel.
                boundaryNode.prevElement.nextElement = boundaryNode;
                break;
        }
    }

    // A flag to manage spacing during output, ensuring no leading space.
    let isFirstItem = true;

    // Iterate through the modified linked list, from the first element to the last.
    for (let currentElement = boundaryNode.nextElement; boundaryNode !== currentElement; currentElement = currentElement.nextElement) {
        // If it's not the first item being printed, output a space for separation.
        if (!isFirstItem) {
            process.stdout.write(" ");
        }
        // Print the data content of the current list element.
        process.stdout.write(currentElement.dataContent);
        // After printing the first item, set the flag to false for subsequent items.
        isFirstItem = false;
    }
    // After printing all elements, output a newline character to complete the line.
    console.log("");
});