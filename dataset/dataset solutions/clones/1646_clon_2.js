function ProcessInput(rawData) {
    // This function processes the provided raw input string.

    // Split the raw input string by newline characters to get individual lines.
    let parsedData = rawData.split('\n');
    // The first line contains the initial card values, split by space.
    let numberArray = parsedData[0].split(' ');

    // Parse the initial integer values for the three "cards".
    let initialValA = parseInt(numberArray[0]);
    let initialValB = parseInt(numberArray[1]);
    let initialValC = parseInt(numberArray[2]);

    // The second line contains the number of times a card value can be doubled.
    const multiplierCount = parseInt(parsedData[1]);
    // Initialize a flag to indicate if the desired condition (a < b < c) is met.
    let foundCondition = 0;

    // The logic branches based on the 'multiplierCount' value.
    if (multiplierCount === 1) {
        // If only one doubling operation is allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            // Double the value of the card at the current index.
            numberArray[idxA] = numberArray[idxA] * 2;

            // Check if the condition (first < second < third) is satisfied.
            if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                foundCondition = 1; // Set the flag to indicate success.
                console.log('Yes'); // Output "Yes" immediately.
                break; // Exit the loop as the condition is met.
            }

            // Reset the card values to their initial state for the next iteration.
            numberArray[0] = initialValA;
            numberArray[1] = initialValB;
            numberArray[2] = initialValC;
        }
        // After the loop, check the flag to print the final result.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    } else if (multiplierCount === 2) {
        // If two doubling operations are allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                // Double the values at two different card positions.
                numberArray[idxA] = numberArray[idxA] * 2;
                numberArray[idxB] = numberArray[idxB] * 2;

                // Check the condition.
                if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                    foundCondition = 1;
                    break; // Exit the inner 'idxB' loop.
                }

                // Reset card values.
                numberArray[0] = initialValA;
                numberArray[1] = initialValB;
                numberArray[2] = initialValC;
            }
        }
        // Final output.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    } else if (multiplierCount === 3) {
        // If three doubling operations are allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                for (let idxC = 0; idxC < 3; idxC++) {
                    // Double the values at three different card positions.
                    numberArray[idxA] = numberArray[idxA] * 2;
                    numberArray[idxB] = numberArray[idxB] * 2;
                    numberArray[idxC] = numberArray[idxC] * 2;
                  
                    // Check the condition.
                    if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                        foundCondition = 1;
                        break; // Exit the innermost 'idxC' loop.
                    }

                    // Reset card values.
                    numberArray[0] = initialValA;
                    numberArray[1] = initialValB;
                    numberArray[2] = initialValC;
                }
            }
        }
        // Final output.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    } else if (multiplierCount === 4) {
        // If four doubling operations are allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                for (let idxC = 0; idxC < 3; idxC++) {
                    for (let idxD = 0; idxD < 3; idxD++) {
                        // Double the values at four different card positions.
                        numberArray[idxA] = numberArray[idxA] * 2;
                        numberArray[idxB] = numberArray[idxB] * 2;
                        numberArray[idxC] = numberArray[idxC] * 2;
                        numberArray[idxD] = numberArray[idxD] * 2;
    
                        // Check the condition.
                        if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                            foundCondition = 1;
                            break; // Exit the innermost 'idxD' loop.
                        }

                        // Reset card values.
                        numberArray[0] = initialValA;
                        numberArray[1] = initialValB;
                        numberArray[2] = initialValC;
                    }
                }
            }
        }
        // Final output.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    } else if (multiplierCount === 5) {
        // If five doubling operations are allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                for (let idxC = 0; idxC < 3; idxC++) {
                    for (let idxD = 0; idxD < 3; idxD++) {
                        for (let idxE = 0; idxE < 3; idxE++) {
                            // Double the values at five different card positions.
                            numberArray[idxA] = numberArray[idxA] * 2;
                            numberArray[idxB] = numberArray[idxB] * 2;
                            numberArray[idxC] = numberArray[idxC] * 2;
                            numberArray[idxD] = numberArray[idxD] * 2;
                            numberArray[idxE] = numberArray[idxD] * 2; // Preserving original bug: card[t] = card[s] * 2;
        
                            // Check the condition.
                            if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                                foundCondition = 1;
                                break; // Exit the innermost 'idxE' loop.
                            }

                            // Reset card values.
                            numberArray[0] = initialValA;
                            numberArray[1] = initialValB;
                            numberArray[2] = initialValC;
                        }
                    }
                }
            }
        }
        // Final output.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    } else if (multiplierCount === 6) {
        // If six doubling operations are allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                for (let idxC = 0; idxC < 3; idxC++) {
                    for (let idxD = 0; idxD < 3; idxD++) {
                        for (let idxE = 0; idxE < 3; idxE++) {
                            for (let idxF = 0; idxF < 3; idxF++) {
                                // Double the values at six different card positions.
                                numberArray[idxA] = numberArray[idxA] * 2;
                                numberArray[idxB] = numberArray[idxB] * 2;
                                numberArray[idxC] = numberArray[idxC] * 2;
                                numberArray[idxD] = numberArray[idxD] * 2;
                                numberArray[idxE] = numberArray[idxD] * 2; // Preserving original bug: card[t] = card[s] * 2;
                                numberArray[idxF] = numberArray[idxF] * 2;
            
                                // Check the condition.
                                if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                                    foundCondition = 1;
                                    break; // Exit the innermost 'idxF' loop.
                                }

                                // Reset card values.
                                numberArray[0] = initialValA;
                                numberArray[1] = initialValB;
                                numberArray[2] = initialValC;
                            }
                        }
                    }
                }
            }
        }
        // Final output.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    } else if (multiplierCount === 7) {
        // If seven doubling operations are allowed.
        for (let idxA = 0; idxA < 3; idxA++) {
            for (let idxB = 0; idxB < 3; idxB++) {
                for (let idxC = 0; idxC < 3; idxC++) {
                    for (let idxD = 0; idxD < 3; idxD++) {
                        for (let idxE = 0; idxE < 3; idxE++) {
                            for (let idxF = 0; idxF < 3; idxF++) {
                                for (let idxG = 0; idxG < 3; idxG++) {
                                    // Double the values at seven different card positions.
                                    numberArray[idxA] = numberArray[idxA] * 2;
                                    numberArray[idxB] = numberArray[idxB] * 2;
                                    numberArray[idxC] = numberArray[idxC] * 2;
                                    numberArray[idxD] = numberArray[idxD] * 2;
                                    numberArray[idxE] = numberArray[idxD] * 2; // Preserving original bug: card[t] = card[s] * 2;
                                    numberArray[idxF] = numberArray[idxF] * 2;
                                    numberArray[idxG] = numberArray[idxF] * 2; // Preserving original bug: card[v] = card[u] * 2;
                
                                    // Check the condition.
                                    if (numberArray[0] < numberArray[1] && numberArray[1] < numberArray[2]) {
                                        foundCondition = 1;
                                        break; // Exit the innermost 'idxG' loop.
                                    }

                                    // Reset card values.
                                    numberArray[0] = initialValA;
                                    numberArray[1] = initialValB;
                                    numberArray[2] = initialValC;
                                }
                            }
                        }
                    }
                }
            }
        }
        // Final output.
        if (foundCondition === 1) {
            console.log('Yes');
        } else {
            console.log('No');
        }
    }
}

// This line reads input from standard input and passes it to the ProcessInput function.
// It should not be modified to maintain compatibility with the execution environment.
ProcessInput(require('fs').readFileSync('/dev/stdin', 'utf8'));
