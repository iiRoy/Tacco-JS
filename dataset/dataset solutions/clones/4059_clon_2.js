// Function to handle the primary data processing task.
function  ProcessRelationships (  rawContent )
{
  // A map to store the calculated positions or values of each entity.
  var   entityMap  =  {};

  // Flag to track the overall consistency of relationships. Initially true.
  var   overallStatus  =  true;

  // Array of input lines, excluding the header (first) line.
  var   unprocessedEntries  =  rawContent . split (/\n/) . slice (1);

  // Temporary storage for lines that cannot be resolved in the current pass.
  var   subsequentBatch  =  [];

  // Loop as long as there are pending entries to process.
  while (unprocessedEntries.length !== 0)
  {
    // Iterate through each entry in the current batch.
    unprocessedEntries.forEach((currentSegment, positionInBatch) =>
    {
      // Parse the current line: split by whitespace and convert parts to numbers.
      var   numericTuple  =  currentSegment . split (/\s/) . map (  valuePart  =>  {
        return  Number(valuePart);
      });

      // Check if both entities in the relationship are already known.
      if (entityMap[numericTuple[0]] !== undefined && entityMap[numericTuple[1]] !== undefined)
      {
        // If both are known, verify consistency: (pos2 - pos1) should equal the given difference.
        overallStatus = (entityMap[numericTuple[1]] - entityMap[numericTuple[0]]) === numericTuple[2];
      }
      // If only the first entity's position is known.
      else if (entityMap[numericTuple[0]] !== undefined)
      {
        // Calculate the second entity's position based on the first and the difference.
        entityMap[numericTuple[1]] = entityMap[numericTuple[0]] + numericTuple[2];
      }
      // If only the second entity's position is known.
      else if (entityMap[numericTuple[1]] !== undefined)
      {
        // Calculate the first entity's position based on the second and the difference.
        entityMap[numericTuple[0]] = entityMap[numericTuple[1]] - numericTuple[2];
      }
      // If neither entity's position is known, and this is the first entry in the current batch.
      else if (positionInBatch === 0)
      {
        // Find an available base value (e.g., 0, 1, 2...) for the first unknown entity.
        let   initialOffset  =  0;
        while (entityMap[initialOffset] !== undefined)
        {
          initialOffset++;
        }
        // Assign the found base value to the first entity.
        entityMap[numericTuple[0]] = initialOffset;
        // Calculate the second entity's position using the newly assigned first entity's position.
        entityMap[numericTuple[1]] = entityMap[numericTuple[0]] + numericTuple[2];
      }
      // If neither entity is known and it's not the first entry in the batch, defer processing.
      else
      {
        subsequentBatch.push(currentSegment);
      }
    });
    // The unprocessed entries for the next iteration become the deferred items from this pass.
    unprocessedEntries = subsequentBatch;
    // Clear the temporary storage for the next pass.
    subsequentBatch = [];
  }
  // Output the final consistency status.
  console.log(overallStatus ? 'Yes' : 'No');
}

// Helper function to read file content, simulating the original fs.readFileSync.
function getFileContent(filePath) {
    // This part directly uses the Node.js 'require' and 'fs' modules.
    // The variable names around it are changed to meet Type II requirements.
    const fileSystemModule = require('fs');
    return fileSystemModule.readFileSync(filePath, 'utf8');
}

// Invoke the main processing function with data from standard input.
ProcessRelationships(getFileContent('/dev/stdin'));