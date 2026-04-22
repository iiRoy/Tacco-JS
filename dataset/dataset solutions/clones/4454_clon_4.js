const initialAcquisition = () => require('fs').readFileSync('/dev/stdin', 'utf8');

const isolateFirstSegment = (completeText) => {
    const breakerPos = completeText.indexOf('\n');
    return (breakerPos !== -1) ? completeText.substring(0, breakerPos) : completeText;
};

const transformToNumeric = (textualSegment) => {
    return Number(textualSegment);
};

const composeFinalMessage = (numericComponent) => {
    return `ABC${numericComponent}`;
};

const transmitResult = (messageContent) => {
    process.stdout.write(messageContent + '\n');
};

transmitResult(
    composeFinalMessage(
        transformToNumeric(
            isolateFirstSegment(
                initialAcquisition()
            )
        )
    )
);