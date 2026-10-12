function parseInteger(textValue) {
    return parseInt(textValue, 10);
}

function* instructionStream(inputLines) {
    let currentLineIndex = 0;
    let isFirstBlock = true;

    while (currentLineIndex < inputLines.length) {
        const currentSegment = inputLines[currentLineIndex];

        if (isNaN(currentSegment)) {
            if (currentSegment === '-') {
                if (!isFirstBlock) {
                    yield { operation: 'show_final_state' };
                }
                yield { operation: 'terminate_program' };
                return;
            } else {
                if (!isFirstBlock) {
                    yield { operation: 'show_final_state' };
                }
                yield { operation: 'initialize_cards', content: currentSegment };
                isFirstBlock = false;
                currentLineIndex += 2;
            }
        } else {
            yield { operation: 'perform_shuffle', amount: parseInteger(currentSegment) };
            currentLineIndex++;
        }
    }
}

function processInputData(rawData) {
    const lineSegments = rawData.split('\n');
    let activeString = '';

    const operationHandlers = {
        initialize_cards: (instruction) => {
            activeString = instruction.content;
        },
        perform_shuffle: (instruction) => {
            const shiftValue = instruction.amount;
            activeString = activeString.slice(shiftValue) + activeString.slice(0, shiftValue);
        },
        show_final_state: () => {
            output(activeString);
        },
        terminate_program: () => {
            throw new Error('TERMINATE_PROCESSING');
        }
    };

    try {
        for (const instruction of instructionStream(lineSegments)) {
            const handler = operationHandlers[instruction.operation];
            if (handler) {
                handler(instruction);
            }
        }
    } catch (error) {
        if (error.message !== 'TERMINATE_PROCESSING') {
            throw error;
        }
    }
}

function output(str){
	if(_Isdebug){
		document.getElementById("Console").value+=(str+"\n");
	}
	console.log(str);
}

var _Isdebug = false;

function debug(){
	_Isdebug = true;
	var input = document.getElementById("Console").value;
	document.getElementById("Console").value+="\n";
	processInputData(input);
}

processInputData(require("fs").readFileSync("/dev/stdin", "utf8"));
