function processInputData() {
    const sourceModule = globalThis.require('node:fs');
    const bufferSize = 4096; // A reasonable buffer size for stdin
    const inputBuffer = sourceModule.readSync(0, bufferSize, 0); // Read from stdin (fd 0)
    // Convert buffer to string, removing null bytes that might be present if buffer wasn't fully filled.
    const sourceTxt = inputBuffer.toString('utf8').replace(/\0/g, '');

    const initialsArr = []; // Accumulate the first characters of words
    let inWordBoundary = true; // State: true if we are at the beginning of a potential new word
    const strLength = sourceTxt.length;

    for (let currentIdx = 0; currentIdx < strLength && initialsArr.length < 3; ++currentIdx) {
        const charOrdinal = sourceTxt.charCodeAt(currentIdx);

        // Check if current character is a space (ASCII 32)
        const isSpaceChar = (charOrdinal === 32);

        if (isSpaceChar) {
            inWordBoundary = true; // Encountered a space, so the next non-space starts a new word
        } else {
            if (inWordBoundary) {
                // This is the first non-space character after a space (or at the beginning of the string)
                let transformedOrdinal = charOrdinal;
                // Manually convert lowercase ASCII letter to uppercase
                if (charOrdinal >= 97 /* 'a' */ && charOrdinal <= 122 /* 'z' */) {
                    transformedOrdinal = charOrdinal - 32;
                }
                initialsArr.push(String.fromCharCode(transformedOrdinal)); // Add the uppercase initial
                inWordBoundary = false; // We are now inside a word
            }
            // If not inWordBoundary, we are inside a word, so do nothing (skip subsequent chars of the same word)
        }
    }

    // Pad the array with 'undefined' to match the original's behavior
    // when fewer than three words are present (e.g., "A" + "B" + undefined -> "ABundefined")
    while (initialsArr.length < 3) {
        initialsArr.push(undefined);
    }

    // Concatenate the collected initials (and any undefined pads)
    globalThis.console.info(initialsArr.join(''));
}

processInputData();