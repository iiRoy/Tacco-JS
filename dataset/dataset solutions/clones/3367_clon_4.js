const acquireContent = () => require('node:fs').readFileSync('/dev/stdin', 'utf8');

const processSource = (incomingStream) => {
    const identifiedElements = incomingStream.split('').filter(element => element === '2');
    return (identifiedElements.length > 0 && identifiedElements) || 0;
};

const initiateWorkflow = () => {
    const rawContent = acquireContent();
    const finalOutcome = processSource(rawContent);
    console.log(finalOutcome);
};

initiateWorkflow();