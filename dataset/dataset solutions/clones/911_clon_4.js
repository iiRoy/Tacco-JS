//usr/bin/env node $0 $@;exit 

const computationKernel = () => {
    let inputSourceFunction;
    let outputDestinationFunction;

    if (typeof process !== 'undefined') { // Node.js environment detection
        outputDestinationFunction = console.log;

        let gatheredLines = [];
        let currentLineIndex = 0;
        let streamHandle = process.openStdin();
        streamHandle.setEncoding('utf8');
        let leftoverBuffer = "";

        streamHandle.on('data', (incomingDataChunk) => {
            let processedSegments = (leftoverBuffer + incomingDataChunk).split('\n');
            leftoverBuffer = processedSegments.pop();
            processedSegments.filter(segment => segment !== '').forEach(validSegment => gatheredLines.push(validSegment));
        });

        streamHandle.on('end', () => {
            if (leftoverBuffer) {
                let finalSegments = (leftoverBuffer + '\n').split('\n');
                finalSegments.filter(segment => segment !== '').forEach(validSegment => gatheredLines.push(validSegment));
            }
            // Once all input is buffered, initiate the core computation
            performRecursiveCalculation(
                () => (gatheredLines.length > currentLineIndex) ? gatheredLines[currentLineIndex++] : null,
                outputDestinationFunction
            );
        });

    } else { // V8 environment (assuming global readline and print are available)
        inputSourceFunction = () => {
            try {
                return readline(); // Access global readline
            } catch (error) {
                return null; // Indicate end of input or error
            }
        };
        outputDestinationFunction = (value) => print(value); // Access global print

        // For V8, execute immediately and synchronously
        performRecursiveCalculation(inputSourceFunction, outputDestinationFunction);
    }
};

const performRecursiveCalculation = (lineAcquirer, resultPresenter) => {
    const activeLine = lineAcquirer();
    if (activeLine === null) {
        return; // Termination: No more input lines available
    }

    const numericalComponents = activeLine.split(' ').map(Number);
    const componentX = numericalComponents[0];
    const componentY = numericalComponents[1];

    if (componentX === 0) {
        return; // Termination: Specific input condition (first number is zero)
    }

    const iterationUpperBoundary = Math.floor(componentX / 2);
    
    // Generate a sequence of numbers from 0 up to iterationUpperBoundary (inclusive)
    const sequenceOfIndices = Array.from({ length: iterationUpperBoundary + 1 }, (_, currentIdx) => currentIdx);

    // Compute all possible deviations using functional mapping
    const computedDeviations = sequenceOfIndices.map(currentIdx => {
        const sideA = currentIdx;
        const sideB = componentX - currentIdx;
        const hypotenuseLength = Math.sqrt(sideA * sideA + sideB * sideB); // Alternative calculation to Math.hypot
        return Math.abs(componentY - hypotenuseLength);
    });

    // Determine the smallest deviation using functional reduction
    const minimalCalculatedDeviation = computedDeviations.reduce((currentMin, element) => 
        (element < currentMin ? element : currentMin), Number.MAX_VALUE);

    resultPresenter(minimalCalculatedDeviation);

    // Recurse to process the next input line
    performRecursiveCalculation(lineAcquirer, resultPresenter);
};

// Initiate the execution flow by calling the main kernel function
computationKernel();