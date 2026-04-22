// This module provides various utility routines for system interaction,
// encompassing memory manipulation, data conversion, and server communication.

// Core system state variables
let _mainLogContainer = null; // Reference to the primary log display area DOM element
let _currentLogElement = null; // The current log entry container within the primary log
let _dataViewBuffer = null; // Shared DataView for converting between doubles and uints

/**
 * Converts an unsigned 32-bit integer to its signed 32-bit representation.
 * Handles the two's complement conversion for values exceeding the positive range.
 * @param {number} unsignedVal - The unsigned 32-bit integer.
 * @returns {number} The signed 32-bit integer.
 */
function signed32Bit(unsignedVal) {
    if (typeof unsignedVal !== 'number' || !Number.isInteger(unsignedVal)) {
        console.warn("Input to signed32Bit must be a valid integer.");
        return 0; // Default or error value
    }
    // Using bitwise OR with 0 truncates to 32 bits and correctly handles the sign
    // for values that would be negative in a signed 32-bit representation.
    return unsignedVal | 0;
}

/**
 * Creates a closure that acts as a simple memory allocator,
 * returning sequential memory addresses starting from an initial point.
 * @param {number} initialAddress - The starting address for allocations. Must be a non-negative integer.
 * @returns {Function(number): number} A function that takes a size and returns an allocated address.
 */
function createMemoryAllocator(initialAddress) {
    if (typeof initialAddress !== 'number' || !Number.isInteger(initialAddress) || initialAddress < 0) {
        console.error("Invalid initial address for memory allocator. Must be a non-negative integer.");
        return () => -1; // Return a function that always indicates failure
    }
    let currentAllocationPointer = initialAddress; // Renamed 'start_addr' for clarity

    return function(allocationSize) {
        if (typeof allocationSize !== 'number' || !Number.isInteger(allocationSize) || allocationSize <= 0) {
            systemLogger("Attempted to allocate an invalid or non-positive size:", allocationSize);
            return -1; // Indicate allocation failure
        }
        const allocatedSegmentStart = currentAllocationPointer;
        currentAllocationPointer += allocationSize; // Advance the pointer for the next allocation
        return allocatedSegmentStart;
    };
}

/**
 * Reads a null-terminated string from a specified memory address
 * and outputs it to the system log.
 * Assumes 'memorySpace' is a globally accessible array-like structure (e.g., Uint8Array).
 * @param {number} addressPointer - The starting memory address of the string.
 */
function printMemoryString(addressPointer) {
    if (typeof addressPointer !== 'number' || !Number.isInteger(addressPointer) || addressPointer < 0) {
        systemLogger("Invalid address provided for string printing. Must be a non-negative integer.");
        return;
    }
    let constructedString = "";
    let currentOffset = 0; // Use an offset to avoid modifying the original addressPointer directly
    const maxReadLength = 2048; // Guard against infinite loops or extremely long strings

    while (true) {
        const absoluteReadAddress = addressPointer + currentOffset;
        if (absoluteReadAddress >= memorySpace.length || currentOffset >= maxReadLength) {
            systemLogger("Warning: String read limit reached or out of memory bounds.");
            break; // Prevent reading past memory or excessive length
        }
        const charCode = memorySpace[absoluteReadAddress];
        if (charCode === 0 || charCode === undefined) { // Check for null terminator (0x00) or undefined (out of bounds)
            break;
        }
        constructedString += String.fromCharCode(charCode);
        currentOffset++;
    }
    systemLogger(constructedString); // Use the renamed log function
}

/**
 * Copies a string's character codes into a memory block starting at a destination address.
 * Assumes 'memorySpace' is a globally accessible array-like structure.
 * @param {number} destinationAddress - The starting memory address to write to.
 * @param {string} sourceData - The string whose characters will be copied.
 * @param {number} lengthBytes - The maximum number of characters (bytes) to copy.
 */
function copyMemoryBlock(destinationAddress, sourceData, lengthBytes) {
    if (typeof destinationAddress !== 'number' || !Number.isInteger(destinationAddress) || destinationAddress < 0 ||
        typeof sourceData !== 'string' ||
        typeof lengthBytes !== 'number' || !Number.isInteger(lengthBytes) || lengthBytes < 0) {
        systemLogger("Invalid arguments for memory block copy: check types and ranges.");
        return;
    }

    const dataLength = sourceData.length;
    let bytesToCopy = Math.min(lengthBytes, dataLength); // Ensure we don't read beyond sourceData length

    for (let currentByteIdx = 0; currentByteIdx < bytesToCopy; currentByteIdx++) {
        const targetMemoryPosition = destinationAddress + currentByteIdx;
        if (targetMemoryPosition >= memorySpace.length) {
            systemLogger("Warning: Attempted to write out of allocated memory bounds during copy at address " + targetMemoryPosition);
            break; // Stop if we hit the end of memorySpace
        }
        memorySpace[targetMemoryPosition] = sourceData.charCodeAt(currentByteIdx) & 0xFF; // Ensure it's a single byte
    }
}

/**
 * Fills a specified memory block with a given byte value.
 * Assumes 'memorySpace' is a globally accessible array-like structure.
 * @param {number} targetAddress - The starting memory address to fill.
 * @param {number} byteValue - The byte value to use for filling (0-255).
 * @param {number} byteCount - The number of bytes to fill.
 */
function fillMemoryBlock(targetAddress, byteValue, byteCount) {
    if (typeof targetAddress !== 'number' || !Number.isInteger(targetAddress) || targetAddress < 0 ||
        typeof byteValue !== 'number' || !Number.isInteger(byteValue) || byteValue < 0 || byteValue > 255 ||
        typeof byteCount !== 'number' || !Number.isInteger(byteCount) || byteCount < 0) {
        systemLogger("Invalid arguments for memory block fill: check types and ranges.");
        return;
    }

    const fillByte = byteValue & 0xFF; // Ensure byteValue is a single byte (0-255)

    for (let k = 0; k < byteCount; k++) {
        const currentTargetPos = targetAddress + k;
        if (currentTargetPos >= memorySpace.length) {
            systemLogger("Warning: Attempted to write out of allocated memory bounds during fill at address " + currentTargetPos);
            break; // Prevent writing past the end of memorySpace
        }
        memorySpace[currentTargetPos] = fillByte;
    }
}

/**
 * Computes the base address of a library using specific offsets and instruction parsing.
 * Assumes 'memorySpace' is a globally accessible array-like structure.
 * @param {number} referencePoint - A known landmark address.
 * @param {number} entryOffset - Offset from the landmark to an instruction entry point.
 * @param {number} baseOffset - Offset from the computed pointer to the actual library base.
 * @returns {number} The calculated library base address, or 0 if an error occurs.
 */
function calculateLibraryBase(referencePoint, entryOffset, baseOffset) {
    if ([referencePoint, entryOffset, baseOffset].some(arg => typeof arg !== 'number' || !Number.isInteger(arg))) {
        systemLogger("Error: Numeric integer arguments expected for calculateLibraryBase.");
        return 0; // Indicate failure
    }

    const instructionEntryPoint = referencePoint + entryOffset;
    
    // Helper function to read a 32-bit value, parse it as hex, swap endianness, and extract immediate
    const processDwordInstruction = (address) => {
        const hexInstructionString = get_bytes(memorySpace, address, 4); // Assuming get_bytes is an external helper
        if (hexInstructionString.length !== 8) { // Expect 4 bytes = 8 hex chars
             systemLogger(`Error: Failed to read 4 bytes for instruction at ${address}.`);
             return 0;
        }
        let parsedInstruction = parseInt(hexInstructionString, 16);
        let swappedInstruction = endianSwap32Bit(parsedInstruction); // Using renamed swap function
        return extractImmediateValue(swappedInstruction); // Using renamed imm_movx function
    };

    const movwImmediateValue = processDwordInstruction(instructionEntryPoint);
    const movtImmediateValue = processDwordInstruction(instructionEntryPoint + 4);

    // Combine the two 16-bit immediates into a single 32-bit pointer
    const combinedPointer = ((movtImmediateValue << 16) | movwImmediateValue) >>> 0; // Ensure unsigned 32-bit
    const libraryBase = combinedPointer - baseOffset;

    return libraryBase;
}

/**
 * Extracts the 16-bit immediate value from a MOVW or MOVT ARM instruction code.
 * @param {number} instructionCode - The 32-bit ARM instruction.
 * @returns {number} The 16-bit immediate value, or 0 if input is invalid.
 */
function extractImmediateValue(instructionCode) {
    if (typeof instructionCode !== 'number' || !Number.isInteger(instructionCode)) {
        systemLogger("Warning: Non-integer instruction code for immediate extraction. Input was: " + instructionCode);
        return 0;
    }
    const imm12 = instructionCode & 0xFFF; // Lower 12 bits
    const imm4 = (instructionCode >>> 16) & 0xF; // Bits 19:16 (shifted right by 16, then masked)
    
    // Reconstruct the 16-bit immediate value: imm4 are the MSBs, imm12 are the LSBs
    return ((imm4 << 12) | imm12) & 0xFFFF; // Ensure result is a 16-bit value
}

/**
 * Converts a dotted-decimal IP address string to its unsigned 32-bit integer representation.
 * Performs basic validation on the input string and its components.
 * @param {string} ipString - The IP address string (e.g., "192.168.1.1").
 * @returns {number} The unsigned 32-bit integer representation of the IP address, or 0 for invalid input.
 */
function convertIpStringToUint(ipString) {
    if (typeof ipString !== 'string') {
        systemLogger("Invalid input: IP string must be a string.");
        return 0;
    }
    const ipPattern = /^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/;
    const match = ipString.match(ipPattern);

    if (!match) {
        systemLogger("Invalid IP string format: " + ipString + ". Expected 'X.X.X.X'.");
        return 0;
    }

    // Extract and convert parts, reversing their order for big-endian assembly
    const ipParts = match.slice(1).map(Number).reverse();
    
    // Validate each part is within 0-255
    for (const part of ipParts) {
        if (isNaN(part) || part < 0 || part > 255) {
            systemLogger("IP address part out of valid range (0-255) in: " + ipString);
            return 0;
        }
    }

    // Combine parts into a single 32-bit unsigned integer (big-endian order)
    const ipAddressUint = (
        (ipParts[0] << 24) | // A1 (first part after reverse)
        (ipParts[1] << 16) | // A2
        (ipParts[2] << 8) |  // A3
        ipParts[3]           // A4 (last part after reverse)
    ) >>> 0; // Ensure unsigned 32-bit result

    return ipAddressUint;
}

/**
 * Fetches a command from a remote server endpoint synchronously.
 * Blocks execution until a response is received.
 * @returns {string} The command received from the server, or a specific failure string on error.
 */
function fetchRemoteCommand() {
    let receivedCommand = "FAIL_UNKNOWN"; // Renamed 'cmd' and more specific default
    const commandEndpoint = '/CommandProcessorEndpoint'; // Renamed URL

    const ajaxSuccessCallback = function(responseData, statusText) {
        if (statusText === 'success' && typeof responseData === 'string') {
            receivedCommand = responseData;
            // Optionally log success, but systemLogger itself sends to server, so avoid recursion
            // console.log("Successfully fetched command:", responseData);
        } else {
            systemLogger("Received non-string data or error status for command fetch.");
            receivedCommand = "FAIL_INVALID_DATA";
        }
    };

    const ajaxErrorCallback = function(jqXHR, textStatus, errorThrown) {
        systemLogger(`FetchRemoteCommandError: Status: ${textStatus}, Error: ${errorThrown}`);
        receivedCommand = "FAIL_NETWORK_ERROR"; // More specific failure reason
    };

    try {
        $.ajax({
            type: 'GET',
            url: commandEndpoint,
            success: ajaxSuccessCallback,
            error: ajaxErrorCallback, // Added explicit error handling
            async: false // Synchronous request as per original
        });
    } catch (e) {
        systemLogger("FetchRemoteCommand Exception: " + e.message);
        receivedCommand = "FAIL_JS_EXCEPTION";
    }
    return receivedCommand;
}

/**
 * Sends structured data (type, memory address, hex payload, additional info) to the server.
 * The hexPayload is expected to be a hex-encoded string.
 * This operation is synchronous.
 * @param {string} dataType - The category or type of data being sent.
 * @param {number} memoryAddress - The memory address relevant to the data.
 * @param {string} hexPayload - The hex-encoded data payload string.
 * @param {any} additionalInfo - Any extra, unstructured information to send.
 */
function transmitStructuredData(dataType, memoryAddress, hexPayload, additionalInfo) {
    if (typeof dataType !== 'string' || typeof memoryAddress !== 'number' || !Number.isInteger(memoryAddress) ||
        typeof hexPayload !== 'string') {
        systemLogger("Invalid arguments for transmitStructuredData: check types of dataType, memoryAddress, hexPayload.");
        return;
    }

    const requestBody = {
        typeIdentifier: dataType, // Renamed 'type'
        targetAddress: memoryAddress, // Renamed 'addr'
        payloadData: hexPayload, // Renamed 'data'
        supplementaryInfo: additionalInfo // Renamed 'extra'
    };

    const dataExchangeEndpoint = '/SystemDataExchange'; // Renamed URL

    const ajaxErrorCallback = function(jqXHR, textStatus, errorThrown) {
        systemLogger(`TransmitStructuredDataError: Status: ${textStatus}, Error: ${errorThrown}. Data: ${JSON.stringify(requestBody)}`);
    };

    try {
        $.ajax({
            type: 'POST',
            url: dataExchangeEndpoint,
            data: requestBody,
            error: ajaxErrorCallback, // Added explicit error handling
            async: false
        });
    } catch (e) {
        systemLogger("TransmitStructuredData Exception: " + e.message);
    }
}

/**
 * Dispatches a simple text message to a designated logging endpoint on the server.
 * This operation is synchronous.
 * @param {string} messageContent - The text content of the message to send.
 */
function dispatchSimpleMessage(messageContent) {
    // Ensure messageContent is a string for consistent logging
    if (typeof messageContent !== 'string') {
        messageContent = String(messageContent);
    }

    const messagePayload = {
        systemLogEntry: messageContent // Renamed 'dbg' to 'systemLogEntry'
    };

    const logEndpoint = '/RemoteSystemLog'; // Renamed URL

    const ajaxErrorCallback = function(jqXHR, textStatus, errorThrown) {
        console.error(`DispatchSimpleMessageError: Status: ${textStatus}, Error: ${errorThrown}. Message: "${messageContent}"`);
        // Fallback to console log if server communication fails
        console.log(`[FALLBACK_SERVER_LOG] ${messageContent}`);
    };

    try {
        $.ajax({
            type: 'GET', // Original used GET, sticking to it for functional equivalence. Could be POST.
            url: logEndpoint,
            data: messagePayload,
            error: ajaxErrorCallback,
            async: false
        });
    } catch (e) {
        console.error("DispatchSimpleMessage Exception: " + e.message);
        console.log(`[FALLBACK_SERVER_LOG_EXCEPTION] ${messageContent}`);
    }
}

/**
 * Centralized logging function for debug messages, sending them to the server.
 * This function acts as an alias to dispatchSimpleMessage for system debug output.
 * @param {string} debugText - The text message to log.
 */
function systemLogger(debugText) {
    // Basic type check and conversion for robustness before dispatching
    if (typeof debugText !== 'string') {
        debugText = String(debugText);
    }
    dispatchSimpleMessage(debugText);
}

/**
 * Swaps the endianness of a 32-bit unsigned integer.
 * Converts from little-endian to big-endian or vice-versa by reordering bytes.
 * @param {number} valueToSwap - The 32-bit unsigned integer to swap.
 * @returns {number} The 32-bit unsigned integer with swapped endianness, or 0 for invalid input.
 */
function endianSwap32Bit(valueToSwap) {
    if (typeof valueToSwap !== 'number' || !Number.isInteger(valueToSwap) || valueToSwap < 0) {
        systemLogger("Warning: Invalid or non-positive value for 32-bit endian swap. Input: " + valueToSwap);
        return 0;
    }
    // Extract each byte using right shifts and masks
    const byte0 = (valueToSwap >>> 0) & 0xFF;  // Least significant byte
    const byte1 = (valueToSwap >>> 8) & 0xFF;
    const byte2 = (valueToSwap >>> 16) & 0xFF;
    const byte3 = (valueToSwap >>> 24) & 0xFF; // Most significant byte

    // Reassemble the bytes in reversed order to swap endianness
    return (
        (byte0 << 24) | // Original byte 0 becomes byte 3
        (byte1 << 16) | // Original byte 1 becomes byte 2
        (byte2 << 8) |  // Original byte 2 becomes byte 1
        byte3           // Original byte 3 becomes byte 0
    ) >>> 0; // Ensure the final result is an unsigned 32-bit integer
}

/**
 * Appends a new log entry to a designated HTML container on the page.
 * Initializes the container elements if they don't exist.
 * @param {string} messageString - The text content of the log entry.
 */
function displayLogEntry(messageString) {
    // Guard against non-browser environments where 'document' might not exist
    if (typeof document === 'undefined' || !document.getElementById) {
        console.warn("displayLogEntry: Document object not available, logging to console as fallback.");
        console.log(`[UI_LOG_FALLBACK] ${messageString}`);
        return;
    }

    // Ensure the main log container exists and is cached
    if (!_mainLogContainer) {
        _mainLogContainer = document.getElementById("system-console-output"); // Renamed ID from "log"
        if (!_mainLogContainer) {
            console.error("displayLogEntry: Main log container DOM element not found (ID: system-console-output).");
            return;
        }
    }

    // Ensure the current log element (a wrapper for new entries) exists within the main container
    if (!_currentLogElement) {
        _currentLogElement = document.createElement("div");
        _currentLogElement.className = "log-section-wrapper"; // Added a CSS class for styling
        // Insert new log sections at the top, or append if it's the first one
        if (_mainLogContainer.firstChild) {
            _mainLogContainer.insertBefore(_currentLogElement, _mainLogContainer.firstChild);
        } else {
            _mainLogContainer.appendChild(_currentLogElement);
        }
    }

    // Create a new div element for the specific log message
    const logMessageDiv = document.createElement("div");
    logMessageDiv.className = "log-message-entry"; // Added a CSS class
    logMessageDiv.textContent = messageString; // Use textContent for security against XSS
    _currentLogElement.appendChild(logMessageDiv);

    // Optional: Automatically scroll the main log container to show the latest entry
    if (_mainLogContainer.scrollHeight > _mainLogContainer.clientHeight) {
        _mainLogContainer.scrollTop = _mainLogContainer.scrollHeight;
    }
}

/**
 * Formats a segment of an array into a human-readable string representation.
 * Numbers greater than 9 and within 32-bit range are displayed in hexadecimal.
 * @param {Array<number>} sourceArray - The array containing numeric elements.
 * @param {number} startIndex - The starting index (inclusive) of the segment.
 * @param {number} segmentLength - The number of elements to include in the segment.
 * @returns {string} The formatted string, e.g., "[0x1A, 20, 0xFF]". Returns "[]" for invalid inputs.
 */
function formatArraySegment(sourceArray, startIndex, segmentLength) {
    if (!Array.isArray(sourceArray) || typeof startIndex !== 'number' || !Number.isInteger(startIndex) || startIndex < 0 ||
        typeof segmentLength !== 'number' || !Number.isInteger(segmentLength) || segmentLength < 0) {
        systemLogger("Invalid arguments for formatArraySegment: check array type, start index, or segment length.");
        return "[]";
    }

    const resultParts = [];
    // Calculate the exclusive end index to simplify the loop condition
    const exclusiveEndIndex = startIndex + segmentLength;

    for (let currentIdx = startIndex; currentIdx < exclusiveEndIndex; currentIdx++) {
        if (currentIdx >= sourceArray.length) {
            // Stop if we attempt to read beyond the actual array's bounds
            systemLogger(`Warning: Reached end of array (index ${currentIdx}) before completing segment length in formatArraySegment.`);
            break;
        }
        const element = sourceArray[currentIdx];
        if (typeof element === 'number' && element > 9 && element <= 0xFFFFFFFF) {
            // Format as hexadecimal if it's a number, greater than 9, and fits in 32 bits
            resultParts.push("0x" + element.toString(16).toUpperCase()); // Convert to uppercase hex
        } else {
            // Otherwise, convert to string
            resultParts.push(String(element));
        }
    }
    return "[" + resultParts.join(", ") + "]";
}

/**
 * Combines two 32-bit unsigned integers into a 64-bit double-precision float.
 * The `upper32Bits` parameter represents the most significant part of the 64-bit value.
 * @param {number} lower32Bits - The lower 32 bits (least significant part) as an unsigned integer.
 * @param {number} upper32Bits - The upper 32 bits (most significant part) as an unsigned integer.
 * @returns {number} The resulting double-precision float, or 0.0 for invalid input.
 */
function combineUintToDouble(lower32Bits, upper32Bits) {
    if (typeof lower32Bits !== 'number' || !Number.isInteger(lower32Bits) || lower32Bits < 0 ||
        typeof upper32Bits !== 'number' || !Number.isInteger(upper32Bits) || upper32Bits < 0) {
        systemLogger("Invalid input for combineUintToDouble: two non-negative integers expected.");
        return 0.0;
    }
    // Initialize DataView buffer if not already done
    if (!_dataViewBuffer) {
        // A 16-byte buffer is sufficient for 64-bit operations, allowing alignment flexibility
        _dataViewBuffer = new DataView(new ArrayBuffer(16));
    }
    // The original code implies big-endian order (hi at offset 0, low at offset 4)
    // when reading getFloat64(0). So, setUint32 with `false` for big-endian.
    _dataViewBuffer.setUint32(0, upper32Bits, false); // MSB at offset 0
    _dataViewBuffer.setUint32(4, lower32Bits, false); // LSB at offset 4
    return _dataViewBuffer.getFloat64(0, false); // Read 64-bit float from offset 0, big-endian
}

/**
 * Splits a 64-bit double-precision float into its two constituent 32-bit unsigned integers.
 * @param {number} doubleValue - The double-precision float to split.
 * @returns {{low: number, high: number}} An object containing the lower (`low`) and upper (`high`) 32-bit unsigned integers, or {low:0, high:0} for invalid input.
 */
function splitDoubleToUint(doubleValue) {
    if (typeof doubleValue !== 'number') {
        systemLogger("Invalid input for splitDoubleToUint: a number is expected.");
        return { low: 0, high: 0 };
    }
    // Initialize DataView buffer if not already done
    if (!_dataViewBuffer) {
        _dataViewBuffer = new DataView(new ArrayBuffer(16));
    }
    // Set the double value into the buffer
    _dataViewBuffer.setFloat64(0, doubleValue, false); // Set at offset 0, big-endian

    // Retrieve the two 32-bit unsigned integers.
    // Based on original logic, getUint32(0) is high, getUint32(4) is low for big-endian.
    return {
        low: _dataViewBuffer.getUint32(4, false),  // Read LSB from offset 4, big-endian
        high: _dataViewBuffer.getUint32(0, false) // Read MSB from offset 0, big-endian
    };
}

// --- Global Context / Mocked Dependencies ---
// The following are added to provide a runnable context for the cloned code,
// as 'aspace', 'get_bytes', and '$' (jQuery) were implicitly global in the original.

// Placeholder for global memory space (e.g., a Uint8Array or regular Array).
// This is an ADDED fragment to make the clone more self-contained.
// A 64KB memory space initialized to zeros for demonstration.
const memorySpace = new Uint8Array(0x10000); 

// Placeholder for get_bytes function, implicitly available in the original context.
// This function reads a specified number of bytes from a memory array at a given address
// and returns them as a hexadecimal string.
function get_bytes(memArray, startAddr, count) {
    if (!Array.isArray(memArray) && !(memArray instanceof Uint8Array) ||
        typeof startAddr !== 'number' || !Number.isInteger(startAddr) || startAddr < 0 ||
        typeof count !== 'number' || !Number.isInteger(count) || count <= 0) {
        console.error("Invalid arguments for get_bytes: check array, start address, or count.");
        return "";
    }
    let hexResult = "";
    for (let i = 0; i < count; i++) {
        const currentReadAddress = startAddr + i;
        if (currentReadAddress >= memArray.length) {
            console.warn(`get_bytes: Attempted to read out of bounds at memory address ${currentReadAddress}.`);
            break;
        }
        const byteValue = memArray[currentReadAddress];
        hexResult += byteValue.toString(16).padStart(2, '0'); // Pad with leading zero if single digit
    }
    return hexResult;
}

// Placeholder for jQuery's $.ajax, as it's used extensively.
// In a real application, jQuery would be loaded, or these functions would use native fetch.
// This mock allows the code to run without an actual jQuery dependency.
const $ = $ || {
    ajax: function(options) {
        console.log("MOCK $.ajax call intercepted:", options);
        // Simulate asynchronous behavior with a timeout, if async is true.
        // For async: false, simulate immediate response.
        if (options.async === false) {
            if (options.url.includes("CommandProcessorEndpoint")) {
                console.log("Mocking immediate command response.");
                if (options.success) options.success("MOCK_COMMAND_RECEIVED", "success");
            } else if (options.url.includes("SystemDataExchange")) {
                console.log("Mocking immediate data transmission success.");
                if (options.success) options.success("MOCK_DATA_SENT_ACK", "success");
            } else if (options.url.includes("RemoteSystemLog")) {
                console.log("Mocking immediate log dispatch success.");
                if (options.success) options.success("MOCK_LOG_ACK", "success");
            } else {
                console.error("Mock $.ajax: Unknown URL for immediate response, simulating error.");
                if (options.error) options.error({}, "error", "Unknown Mock URL");
            }
        } else {
            // For async: true (if ever changed), simulate with a delay
            setTimeout(() => {
                if (options.url.includes("CommandProcessorEndpoint")) {
                    console.log("Mocking delayed command response.");
                    if (options.success) options.success("MOCK_ASYNC_COMMAND", "success");
                } else {
                    if (options.success) options.success("MOCK_ASYNC_SUCCESS", "success");
                }
            }, 50);
        }
    }
};