process.stdin.resume();

process.stdin.setEncoding('utf8'); // Configure input encoding

process.stdin.on('data', function (dataBlock) {
    // Split the incoming data string by spaces to get individual parts
    const inputParts = dataBlock.toString().split(' ');
    
    // Extract the three numerical values from the parsed parts
    const valA = inputParts[0]; // The initial value
    const valB = inputParts[1]; // The middle value
    const valC = inputParts[2]; // The final value
    
    // Calculate the difference between the first two values
    const diffAB = valB - valA;
    // Calculate the difference between the last two values
    const diffBC = valC - valB;
    
    // Determine if the calculated differences are identical
    if (diffAB === diffBC) {
        // If the differences match, output "YES"
        console.log("YES");
    } else {
        // Otherwise, output "NO"
        console.log("NO");
    }
    
    // This is a placeholder comment, similar to the original's commented-out line.
    // No actual logging here.
});
