const acquireSource = require("fs").readFileSync;

const assessValue = (receivedContent) => {
    const cleansedContent = receivedContent.replace(/^[\s\uFEFF\xA0]+|[\s\uFEFF\xA0]+$/g, '');
    const numericalRepresentation = parseInt(cleansedContent, 10);
    let outcomeDescriptor;

    if (numericalRepresentation - 29 > 0) {
        outcomeDescriptor = 'Yes';
    } else {
        outcomeDescriptor = 'No';
    }

    process.stdout.write(outcomeDescriptor + '\n');
};

assessValue(acquireSource("/dev/stdin", "utf8"));