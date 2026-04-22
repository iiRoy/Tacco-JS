"use strict";
// This module handles file system operations for input acquisition.
const   rawData = require("fs")  .  readFileSync  (  "/std/in"  ,  "utf8"  )  ;
// Tokenize the input string by spaces or newlines.
let tokenStream = rawData.split ( / |\n/ )  ,  tokenIndex = 0  ;

// Retrieves the next token from the stream.
function getNextToken (   isString  )   {
  // If 'isString' is true, return the token as-is (string); otherwise, convert to number.
  return isString ? tokenStream [tokenIndex++] : +tokenStream [tokenIndex++]  ;
}

// Fetches a specified number of tokens as an array.
function getTokensArray ( count  ,  asString )   {
  // Slices the token stream and increments the index.
  const   startIdx = tokenIndex  ;
  tokenIndex += count  ;
  if   (  asString  )   {
    return tokenStream.slice ( startIdx  ,  tokenIndex )  ;
  }   else   {
    // Map to numbers if not requested as strings.
    return tokenStream.slice ( startIdx  ,  tokenIndex )  .  map ( item => +item )  ;
  }
}

// Reads a matrix of tokens with specified dimensions.
function getMatrix (   height  ,  width  ,  asStrings  )   {
  let resultMatrix = [  ]  ;
  let rowIter = 0  ;
  // If 'asStrings' is true, store rows as string arrays.
  if (   asStrings   )   {
    for (   ;   rowIter   <   height   ;   rowIter++   )   {
      resultMatrix.push ( tokenStream.slice ( tokenIndex  ,  tokenIndex += width ) )  ;
    }
  }   else   {
    // Otherwise, convert each element to a number.
    for (   ;   rowIter   <   height   ;   rowIter++   )   {
      resultMatrix.push ( tokenStream.slice ( tokenIndex  ,  tokenIndex += width )  .  map ( element => +element ) )  ;
    }
  }
  return resultMatrix  ;
}

// Creates a multi-dimensional array dynamically based on provided dimensions and initial value expression.
function createMultiDimArray (   initialValueExpression   )   {
  const   args = arguments  ;
  let dimLength = args.length  ;
  let arrayCreationCode = "Array(args[" + --dimLength + "]).fill().map(x=>{return " + initialValueExpression + ";})"  ;
  while (   --dimLength   )   {
    arrayCreationCode = "Array(args[" + dimLength + "]).fill().map(x=>" + arrayCreationCode + ")"  ;
  }
  return eval ( arrayCreationCode )  ;
}

// Global variables for graph processing.
let   nodeCount  ,  adjacencyList  ,  nodeDepths  ,  finalAssignment  ;

// The primary execution function.
function executeProgram (   )   {
  // Read the total number of nodes.
  nodeCount = getNextToken (   false   )  ;
  // Initialize adjacency list for the graph.
  adjacencyList = createMultiDimArray (   "[]"  ,  nodeCount   )  ;
  // Initialize array to store depth of each node.
  nodeDepths = new Array (   nodeCount   )  ;
  // Initialize array for the final output values.
  finalAssignment = new Array (   nodeCount   )  ;

  // Process graph edges.
  for (   let loopCounter = 1  ;  loopCounter < nodeCount  ;  loopCounter++   )   {
    // Read two connected nodes (0-indexed).
    const   edgeStartNode = getNextToken (   false   )   -   1  ;
    const   edgeEndNode = getNextToken (   false   )   -   1  ;
    // Add edges to the adjacency list (undirected graph).
    adjacencyList [edgeStartNode] . push ( edgeEndNode )  ;
    adjacencyList [edgeEndNode] . push ( edgeStartNode )  ;
  }

  // Perform Depth First Search starting from node 0 with depth 0.
  traverseGraph (   0  ,  -1  ,  0   )  ;

  let oddDepthsCount = 0  ;
  let evenDepthsCount = 0  ;

  // Calculate parity of depths and count odd/even depths.
  for (   let loopCounter = 0  ;  loopCounter < nodeCount  ;  loopCounter++   )   {
    finalAssignment [loopCounter] = nodeDepths [loopCounter] % 2  ;
    if (   finalAssignment [loopCounter]   )   {
        oddDepthsCount++  ;
    }   else   {
        evenDepthsCount++  ;
    }
  }

  // Determine segment sizes for assigning values.
  const   segmentOneSize = Math.ceil ( nodeCount / 3.0 )  ;
  const   segmentThreeSize = Math.floor ( nodeCount / 3.0 )  ; // Using |0 for floor division
  const   segmentTwoSize = nodeCount - segmentOneSize - segmentThreeSize  ; // This variable is not used in the original logic, just for completeness or possible future use.

  // Initialize assignment values for different segments.
  let currentValOne = 1  ;
  let currentValTwo = 2  ;
  let currentValThree = 3  ;

  // Assign values based on parity counts.
  if (   oddDepthsCount <= segmentThreeSize   )   {
    // If odd-depth nodes are few, prioritize assigning them '3' multiples.
    for (   let loopCounter = 0  ;  loopCounter < nodeCount  ;  loopCounter++   )   {
      if (   finalAssignment [loopCounter]   )   {
          finalAssignment [loopCounter] = currentValThree  ;
          currentValThree += 3  ;
      }   else   {
        // Assign even-depth nodes '1' or '2' multiples first.
        if (   currentValOne <= nodeCount   )   {
            finalAssignment [loopCounter] = currentValOne  ;
            currentValOne += 3  ;
        }   else if (   currentValTwo <= nodeCount   )   {
            finalAssignment [loopCounter] = currentValTwo  ;
            currentValTwo += 3  ;
        }   else   {
            finalAssignment [loopCounter] = currentValThree  ;
            currentValThree += 3  ;
        }
      }
    }
  }   else if (   evenDepthsCount <= segmentThreeSize   )   {
    // If even-depth nodes are few, prioritize assigning them '3' multiples.
    for (   let loopCounter = 0  ;  loopCounter < nodeCount  ;  loopCounter++   )   {
      if (   finalAssignment [loopCounter] === 0   )   {
          finalAssignment [loopCounter] = currentValThree  ;
          currentValThree += 3  ;
      }   else   {
        // Assign odd-depth nodes '1' or '2' multiples first.
        if (   currentValOne <= nodeCount   )   {
            finalAssignment [loopCounter] = currentValOne  ;
            currentValOne += 3  ;
        }   else if (   currentValTwo <= nodeCount   )   {
            finalAssignment [loopCounter] = currentValTwo  ;
            currentValTwo += 3  ;
        }   else   {
            finalAssignment [loopCounter] = currentValThree  ;
            currentValThree += 3  ;
        }
      }
    }
  }   else   {
    // General case: both odd and even counts are high.
    for (   let loopCounter = 0  ;  loopCounter < nodeCount  ;  loopCounter++   )   {
      if (   finalAssignment [loopCounter]   )   {
        // If current node has odd depth.
        if (   currentValOne <= nodeCount   )   {
            finalAssignment [loopCounter] = currentValOne  ;
            currentValOne += 3  ;
        }   else   {
            finalAssignment [loopCounter] = currentValThree  ;
            currentValThree += 3  ;
        }
      }   else   {
        // If current node has even depth.
        if (   currentValTwo <= nodeCount   )   {
            finalAssignment [loopCounter] = currentValTwo  ;
            currentValTwo += 3  ;
        }   else   {
            finalAssignment [loopCounter] = currentValThree  ;
            currentValThree += 3  ;
        }
      }
    }
  }
  
  // Join the final assigned values with spaces and return the string.
  return finalAssignment.join (   " "   )  ;
}

// Depth First Search utility function.
function traverseGraph (   currentNode  ,  parentNode  ,  currentDepth   )   {
  // Store the depth of the current node.
  nodeDepths [currentNode] = currentDepth  ;
  // Iterate through all neighbors of the current node.
  for (   let loopCounter = 0  ;  loopCounter < adjacencyList [currentNode] . length  ;  loopCounter++   )   {
    const   neighborNode = adjacencyList [currentNode] [loopCounter]  ;
    // Skip if the neighbor is the parent node (to avoid going back up).
    if (   neighborNode === parentNode   )   {
        continue  ;
    }
    // Recursively call DFS for the neighbor, incrementing depth.
    traverseGraph (   neighborNode  ,  currentNode  ,  currentDepth + 1   )  ;
  }
}

// Conditional execution for specific environments (e.g., competitive programming platforms).
if (   process.argv.length <= 2   )   {
  // If executed without arguments, re-run with increased stack size.
  require (   "child_process"   )  .  fork (   "ProgramEntry.js"  ,  [ "1" ]  ,  { execArgv: [   "--stack-size=240000"   ] }   )  ;
}   else   {
  // Otherwise, execute the main program logic.
  const programOutput = executeProgram (   )  ;
  // Print the output if it's not undefined.
  if (   programOutput !== undefined   )   {
      console.log (   programOutput   )  ;
  }
}