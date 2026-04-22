function LinkCell(itemPayload, nextLink) {
    this.itemPayload = itemPayload;
    this.nextLink = nextLink;
}

function ValueCollection() {
    this.topElement = null;
}

ValueCollection.prototype.addEntry = function(newValue) {
    this.topElement = new LinkCell(newValue, this.topElement);
};

ValueCollection.prototype.removeEntry = function() {
    if (this.topElement === null) {
        return undefined;
    }
    const extractedValue = this.topElement.itemPayload;
    this.topElement = this.topElement.nextLink;
    return extractedValue;
};

function* numberSequenceProducer(fullTextContent) {
    const rawSegments = fullTextContent.trim().split(/\s+/);
    for (const segment of rawSegments) {
        yield Number(segment);
    }
}

function displayOutput(valueToDisplay) {
    console.log(valueToDisplay);
}

function orchestrateProcessing() {
    const dataStack = new ValueCollection();
    const numberIterator = numberSequenceProducer(streamBuffer);

    for (const currentNumericValue of numberIterator) {
        if (Number.isNaN(currentNumericValue)) {
            break;
        } else if (currentNumericValue === 0) {
            displayOutput(dataStack.removeEntry());
        } else {
            dataStack.addEntry(currentNumericValue);
        }
    }
}

process.stdin.resume();
process.stdin.setEncoding('utf8');

var streamBuffer = '';

process.stdin.on('data', function(incomingChunk) {
    streamBuffer += incomingChunk;
});

process.stdin.on('end', function() {
    orchestrateProcessing();
});