let globalStorage = new Uint8Array(0x1000000); // Represents the global 'aspace'
let diagnosticConsole = null; // Replaces _log0, _log
let binaryConverter = null; // Replaces _dview

// Replaces Int(u)
const signExtendValue = (inputVal) => {
    // JavaScript bitwise operations treat numbers as 32-bit signed.
    // So, `val | 0` effectively casts to signed 32-bit.
    // The original `if` logic is equivalent to `val | 0` for 32-bit unsigned.
    return inputVal | 0;
};

// Replaces init_memory(start_addr)
const createMemoryRegionManager = (initialOffset) => {
    let currentOffset = initialOffset;
    return (requiredSize) => {
        const allocatedStart = currentOffset;
        currentOffset += requiredSize;
        return allocatedStart;
    };
};

// Helper for get_base_from_offsets, assumes globalStorage is the memory
// This function reads bytes and returns a hex string, matching original's assumed get_bytes usage.
const fetchHexWord = (location, octetCount) => {
    let hexResult = '';
    for (let currentByte = 0; currentByte < octetCount; currentByte++) {
        const byteValue = globalStorage[location + currentByte];
        hexResult += byteValue.toString(16).padStart(2, '0');
    }
    return hexResult;
};

// Replaces myprintf(addr)
const displayStringAtLocation = (startAddress) => {
    const extractAndLog = (currentAddress, accumulator) => {
        const charCode = globalStorage[currentAddress];
        if (charCode === 0) {
            recordEventLog(accumulator);
            return;
        }
        extractAndLog(currentAddress + 1, accumulator + String.fromCharCode(charCode));
    };
    extractAndLog(startAddress, "");
};

// Replaces mymemcpy(addr, data, len)
const writeStringSegment = (destinationAddress, sourceData, segmentLength) => {
    Array.from({ length: segmentLength }, (_, idx) => {
        globalStorage[destinationAddress + idx] = sourceData.charCodeAt(idx);
    });
};

// Replaces mymemset(addr, b, len)
const fillMemoryBlock = (targetAddress, byteValue, blockLength) => {
    // Using Array.fill-like logic for Uint8Array
    for (let k = 0; k < blockLength; k++) {
        globalStorage[targetAddress + k] = byteValue;
    }
};

// Replaces imm_movx(ins)
const decodeInstructionImmediate = (instructionWord) => {
    const lowerBits = instructionWord & 0xFFF; // imm12
    const upperBits = (instructionWord >> 16) & 0xF; // imm4 is bits 19:16, so shifting 16 and masking F
    return ((upperBits << 12) | lowerBits) & 0xFFFF; // recombine
};

// Replaces swap32(val)
const reverseByteOrder32 = (value) => {
    // A different way to express the byte swapping
    // Using DataView for endianness conversion is a genuinely different strategy
    if (!binaryConverter) {
        binaryConverter = new DataView(new ArrayBuffer(4));
    }
    binaryConverter.setUint32(0, value, false); // Write as Big-Endian
    return binaryConverter.getUint32(0, true); // Read as Little-Endian
};

// Replaces get_base_from_offsets(landmark, entry_off, base_off)
const resolveModuleBase = (referencePoint, entryOffset, baseOffset) => {
    const entryLocation = referencePoint + entryOffset;

    const rawEntry = parseInt(fetchHexWord(entryLocation, 4), 16);
    const swappedEntry = reverseByteOrder32(rawEntry);
    const movwInstruction = parseInt(fetchHexWord(swappedEntry, 4), 16);
    const swappedMovw = reverseByteOrder32(movwInstruction);
    const immediateMovw = decodeInstructionImmediate(swappedMovw);

    const movtInstruction = parseInt(fetchHexWord(swappedEntry + 4, 4), 16);
    const swappedMovt = reverseByteOrder32(movtInstruction);
    const immediateMovt = decodeInstructionImmediate(swappedMovt);

    const fullPointer = ((immediateMovt << 16) | immediateMovw) >>> 0;
    return fullPointer - baseOffset;
};

// Replaces inet_addr(str)
const ipStringToInteger = (ipString) => {
    const octets = ipString.split('.').map(Number);
    // Process in reverse to match the original's calculation (a1 << 24 | a2 << 16 | ...)
    // If the original processed `ip_list[0]` (which was `a4`) as MSB, it would be `a4 << 24`.
    // But it explicitly used `ip_list.reverse()` then `ip_list[0]` as `a1`, meaning `a1` is the *last* octet from the original string.
    // So, `ip_list = ["1", "2", "168", "192"]` for "192.168.2.1"
    // `a1 = 1`, `a2 = 2`, `a3 = 168`, `a4 = 192`
    // `(1 << 24) | (2 << 16) | (168 << 8) | 192`
    // This is Big-Endian.

    // Let's use reduce for functional approach.
    // ipString.split(".") gives ["192", "168", "2", "1"]
    // octets[0] = 192, octets[1] = 168, octets[2] = 2, octets[3] = 1
    return octets.reduce((acc, currentOctet, index) => {
        return acc | (currentOctet << (8 * (3 - index)));
    }, 0) >>> 0;
};

// Replaces getcmd()
const retrieveServerCommand = () => {
    let commandResult = '';
    try {
        const requestHandle = new XMLHttpRequest();
        requestHandle.open('GET', '/Command', false); // Synchronous request
        requestHandle.send(null);

        if (requestHandle.status === 200) {
            commandResult = requestHandle.responseText;
        } else {
            throw new Error(`HTTP Error: ${requestHandle.status}`);
        }
    } catch (err) {
        recordEventLog(`CommandFetchFailure: ${err.message}`);
        commandResult = 'FAILURE';
    }
    return commandResult;
};

// Replaces sendcmsg(type, addr, txt, extra)
const dispatchDataPayload = (dataType, destinationAddr, textContent, additionalInfo) => {
    try {
        const payloadData = JSON.stringify({
            kind: dataType,
            address: destinationAddr,
            content: textContent,
            auxiliary: additionalInfo
        });
        const requestHandle = new XMLHttpRequest();
        requestHandle.open('POST', '/Data', false); // Synchronous request
        requestHandle.setRequestHeader('Content-Type', 'application/json');
        requestHandle.send(payloadData);
    } catch (err) {
        recordEventLog(`PayloadDispatchError: ${err.message}`);
    }
};

// Replaces sendmsg(txt)
const transmitDiagnosticMessage = (messageContent) => {
    try {
        const encodedMessage = encodeURIComponent(messageContent);
        const requestHandle = new XMLHttpRequest();
        requestHandle.open('GET', `/Debug?diag=${encodedMessage}`, false); // Synchronous request
        requestHandle.send(null);
    } catch (err) {
        // Error handling for diagnostic messages can be minimal
    }
};

// Replaces logdbg(txt)
const recordEventLog = (message) => {
    transmitDiagnosticMessage(message);
};

// Replaces logAdd(txt)
const appendToConsoleDisplay = (displayContent) => {
    alert(displayContent); // Original code had alert(text), assuming alert(txt) was intended

    if (!diagnosticConsole) {
        diagnosticConsole = document.getElementById("logEntryView"); // New ID
        if (!diagnosticConsole) return;
    }

    const newLogItem = document.createElement("div");
    newLogItem.className = "log-item"; // Add a class for styling
    newLogItem.innerHTML = displayContent;

    // Insert at the beginning, or append if empty, similar to original
    if (diagnosticConsole.firstChild) {
        diagnosticConsole.insertBefore(newLogItem, diagnosticConsole.firstChild);
    } else {
        diagnosticConsole.appendChild(newLogItem);
    }
};

// Replaces ArrayToString(arr, offs, len)
const formatArraySegment = (sourceArray, startIndex, segmentLength) => {
    const endIndex = startIndex + segmentLength;
    const itemsToFormat = sourceArray.slice(startIndex, endIndex);

    const formattedItems = itemsToFormat.map((item) => {
        // Original logic: (arr[i] > 9 && arr[i] <= 0xffffffff) ? "0x" + arr[i].toString(16) : arr[i]
        // This means small numbers (0-9) are decimal, others hex.
        if (typeof item === 'number' && item > 9 && item <= 0xFFFFFFFF) {
            return `0x${item.toString(16)}`;
        }
        return item;
    });

    return `[${formattedItems.join(', ')}]`;
};

// Replaces u2d(low,hi)
const composeDoubleFromParts = (lower32, higher32) => {
    // Create a new DataView each time to avoid global state and potential conflicts
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setUint32(0, higher32, false); // Big-endian for hi (byte 0-3)
    view.setUint32(4, lower32, false);  // Big-endian for low (byte 4-7)
    return view.getFloat64(0, false); // Read as Big-endian double
};

// Replaces d2u(d)
const decomposeDoubleToParts = (doubleValue) => {
    // Create a new DataView each time
    const buffer = new ArrayBuffer(8);
    const view = new DataView(buffer);
    view.setFloat64(0, doubleValue, false); // Write as Big-endian double
    return {
        lowerPart: view.getUint32(4, false), // Read lower 32 bits (bytes 4-7)
        higherPart: view.getUint32(0, false) // Read higher 32 bits (bytes 0-3)
    };
};