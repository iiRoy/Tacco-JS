function ProcessInputData(inputStringData) {

    // Split the incoming data into individual lines
    let parsedLines = inputStringData.split("\n");
    // Extract the first line, which contains space-separated numeric values
    let currentValues = parsedLines[0].split(" ");
	
    // Store the original numerical values for resetting
    const initialValueA = Number(currentValues[0]);
    const initialValueB = Number(currentValues[1]);
    const initialValueC = Number(currentValues[2]);

    // Determine the maximum number of doubling operations allowed
    const maxDoublingSteps = Number(parsedLines[1]);
    // A flag to indicate if a sorted sequence has been achieved
    let successFlag = 0;

    // Evaluate based on the allowed number of doubling steps
    if (maxDoublingSteps === 1) {
        // Iterate through each of the three value positions
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            // Apply doubling to the selected position
            currentValues[loopIndexA] = currentValues[loopIndexA] * 2;

            // Check if the sequence is now strictly increasing
            if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                successFlag = 1; // Mark as found
                console.log("Yes"); // Output the positive result
                break; // Exit the loop
            }

            // Reset the values to their initial state for the next iteration
            currentValues[0] = initialValueA;
            currentValues[1] = initialValueB;
            currentValues[2] = initialValueC;
        }

        // Final output based on the success flag
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (maxDoublingSteps === 2) {
        // Nested loops for two doubling operations
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            for (let loopIndexB = 0; loopIndexB < 3; loopIndexB++) {
                // Apply doubling to two selected positions
                currentValues[loopIndexA] = currentValues[loopIndexA] * 2;
                currentValues[loopIndexB] = currentValues[loopIndexB] * 2;

                // Check for strictly increasing order
                if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                    successFlag = 1;
                    break; // Exit inner loop
                }

                // Reset values for the next combination
                currentValues[0] = initialValueA;
                currentValues[1] = initialValueB;
                currentValues[2] = initialValueC;
            }
        }
        // Final output
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }

    } else if (maxDoublingSteps === 3) {
        // Triple nested loops for three doubling operations
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            for (let loopIndexB = 0; loopIndexB < 3; loopIndexB++) {
                for (let loopIndexC = 0; loopIndexC < 3; loopIndexC++) {
                    // Double three selected positions
                    currentValues[loopIndexA] = currentValues[loopIndexA] * 2;
                    currentValues[loopIndexB] = currentValues[loopIndexB] * 2;
                    currentValues[loopIndexC] = currentValues[loopIndexC] * 2;
                  
                    // Check for sorted condition
                    if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                        successFlag = 1;
                        break; // Exit innermost loop
                    }

                    // Reset for next combination
                    currentValues[0] = initialValueA;
                    currentValues[1] = initialValueB;
                    currentValues[2] = initialValueC;
                }
            }
        }
        // Final output
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (maxDoublingSteps === 4) {
        // Quadruple nested loops
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            for (let loopIndexB = 0; loopIndexB < 3; loopIndexB++) {
                for (let loopIndexC = 0; loopIndexC < 3; loopIndexC++) {
                    for (let loopIndexD = 0; loopIndexD < 3; loopIndexD++) {
                        // Double four selected positions
                        currentValues[loopIndexA] = currentValues[loopIndexA] * 2;
                        currentValues[loopIndexB] = currentValues[loopIndexB] * 2;
                        currentValues[loopIndexC] = currentValues[loopIndexC] * 2;
                        currentValues[loopIndexD] = currentValues[loopIndexD] * 2;
    
                        // Check for sorted condition
                        if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                            successFlag = 1;
                            break; // Exit innermost loop
                        }

                        // Reset for next combination
                        currentValues[0] = initialValueA;
                        currentValues[1] = initialValueB;
                        currentValues[2] = initialValueC;
                    }
                }
            }
        }
        // Final output
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (maxDoublingSteps === 5) {
        // Quintuple nested loops
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            for (let loopIndexB = 0; loopIndexB < 3; loopIndexB++) {
                for (let loopIndexC = 0; loopIndexC < 3; loopIndexC++) {
                    for (let loopIndexD = 0; loopIndexD < 3; loopIndexD++) {
                        for (let loopIndexE = 0; loopIndexE < 3; loopIndexE++) {
                            // Double five selected positions (Note: potential bug from original code, idxE uses idxD)
                            currentValues[loopIndexA] = currentValues[loopIndexA] * 2;
                            currentValues[loopIndexB] = currentValues[loopIndexB] * 2;
                            currentValues[loopIndexC] = currentValues[loopIndexC] * 2;
                            currentValues[loopIndexD] = currentValues[loopIndexD] * 2;
                            currentValues[loopIndexE] = currentValues[loopIndexD] * 2; 
        
                            // Check for sorted condition
                            if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                                successFlag = 1;
                                break; // Exit innermost loop
                            }

                            // Reset for next combination
                            currentValues[0] = initialValueA;
                            currentValues[1] = initialValueB;
                            currentValues[2] = initialValueC;
                        }
                    }
                }
            }
        }
        // Final output
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (maxDoublingSteps === 6) {
        // Sextuple nested loops
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            for (let loopIndexB = 0; loopIndexB < 3; loopIndexB++) {
                for (let loopIndexC = 0; loopIndexC < 3; loopIndexC++) {
                    for (let loopIndexD = 0; loopIndexD < 3; loopIndexD++) {
                        for (let loopIndexE = 0; loopIndexE < 3; loopIndexE++) {
                            for (let loopIndexF = 0; loopIndexF < 3; loopIndexF++) {
                                // Double six selected positions (Note: potential bug from original code, idxE uses idxD)
                                currentValues[loopIndexA] = currentValues[loopIndexA] * 2;
                                currentValues[loopIndexB] = currentValues[loopIndexB] * 2;
                                currentValues[loopIndexC] = currentValues[loopIndexC] * 2;
                                currentValues[loopIndexD] = currentValues[loopIndexD] * 2;
                                currentValues[loopIndexE] = currentValues[loopIndexD] * 2;
                                currentValues[loopIndexF] = currentValues[loopIndexF] * 2;
            
                                // Check for sorted condition
                                if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                                    successFlag = 1;
                                    break; // Exit innermost loop
                                }

                                // Reset for next combination
                                currentValues[0] = initialValueA;
                                currentValues[1] = initialValueB;
                                currentValues[2] = initialValueC;
                            }
                        }
                    }
                }
            }
        }
        // Final output
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    } else if (maxDoublingSteps === 7) {
        // Septuple nested loops
        for (let loopIndexA = 0; loopIndexA < 3; loopIndexA++) {
            for (let loopIndexB = 0; loopIndexB < 3; loopIndexB++) {
                for (let loopIndexC = 0; loopIndexC < 3; loopIndexC++) {
                    for (let loopIndexD = 0; loopIndexD < 3; loopIndexD++) {
                        for (let loopIndexE = 0; loopIndexE < 3; loopIndexE++) {
                            for (let loopIndexF = 0; loopIndexF < 3; loopIndexF++) {
                                for (let loopIndexG = 0; loopIndexG < 3; loopIndexG++) {

                                    // Double seven selected positions (Note: potential bugs from original code, idxE uses idxD, idxG uses idxF)
                                    currentValues[loopIndexA] = currentValues[loopIndexA] * 2;
                                    currentValues[loopIndexB] = currentValues[loopIndexB] * 2;
                                    currentValues[loopIndexC] = currentValues[loopIndexC] * 2;
                                    currentValues[loopIndexD] = currentValues[loopIndexD] * 2;
                                    currentValues[loopIndexE] = currentValues[loopIndexD] * 2;
                                    currentValues[loopIndexF] = currentValues[loopIndexF] * 2;
                                    currentValues[loopIndexG] = currentValues[loopIndexF] * 2;
                
                                    // Check for sorted condition
                                    if (Number(currentValues[0]) < Number(currentValues[1]) && Number(currentValues[1]) < Number(currentValues[2])) {
                                        successFlag = 1;
                                        break; // Exit innermost loop
                                    }

                                    // Reset for next combination
                                    currentValues[0] = initialValueA;
                                    currentValues[1] = initialValueB;
                                    currentValues[2] = initialValueC;
                                }
                            }
                        }
                    }
                }
            }
        }
        // Final output
        if (successFlag === 1) {
            console.log("Yes");
        } else {
            console.log("No");
        }
    }
}
// The following line is for standard input/output handling and should not be altered.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));