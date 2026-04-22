const coreUtilities = Object.freeze({
    filesystem: require('node:fs'),
    outputStream: process.stdout
});

const processingConfiguration = Object.freeze({
    prefixSegment: Buffer.from([0x41, 0x42, 0x43]).toString('utf8'),
    inputSource: '/dev/stdin',
    textEncoding: 'utf8',
    lineTerminator: '\n'
});

const acquireSourcePayload = (pathIdentifier, textScheme) => {
    try {
        const rawBuffer = coreUtilities.filesystem.readFileSync(pathIdentifier);
        return rawBuffer.toString(textScheme).trimEnd();
    } catch (err) {
        throw new Error(`Failed to retrieve payload from ${pathIdentifier}: ${err.message}`);
    }
};

const modifyPayload = (initialSegment, payloadContent) => {
    return [initialSegment, payloadContent].join('');
};

const transmitOutput = (finalRenderedContent, terminationCharacter) => {
    coreUtilities.outputStream.write(finalRenderedContent + terminationCharacter);
};

(() => {
    try {
        const initialContent = acquireSourcePayload(
            processingConfiguration.inputSource,
            processingConfiguration.textEncoding
        );

        const finalContent = modifyPayload(
            processingConfiguration.prefixSegment,
            initialContent
        );

        transmitOutput(
            finalContent,
            processingConfiguration.lineTerminator
        );
    } catch (e) {
        coreUtilities.outputStream.write(`Operation Failure: ${e.message}\n`);
        process.exit(1);
    }
})();