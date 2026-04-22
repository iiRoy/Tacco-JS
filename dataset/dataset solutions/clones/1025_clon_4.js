const sourceText = require('node:fs').readFileSync('/dev/stdin', 'utf8');
const lineSegments = sourceText.trim().split('\n');

lineSegments.shift(); // Discard the first line

function NodeObject(payloadValue) {
    this.payload = payloadValue;
    this.earlierLink = null;
    this.laterLink = null;
}

function ChainCollection() {
    this.firstLink = null;
    this.lastLink = null;
    this.linkCount = 0;

    this.appendFront = function(valueParam) {
        const newNode = new NodeObject(valueParam);
        if (!this.firstLink) {
            this.firstLink = newNode;
            this.lastLink = newNode;
        } else {
            newNode.laterLink = this.firstLink;
            this.firstLink.earlierLink = newNode;
            this.firstLink = newNode;
        }
        this.linkCount++;
    };

    this.takeSpecific = function(valueParam) {
        if (!this.firstLink) return;

        let current = this.firstLink;
        let found = false;
        while (current) {
            if (current.payload === valueParam) {
                if (current.earlierLink) {
                    current.earlierLink.laterLink = current.laterLink;
                } else {
                    this.firstLink = current.laterLink;
                }
                if (current.laterLink) {
                    current.laterLink.earlierLink = current.earlierLink;
                } else {
                    this.lastLink = current.earlierLink;
                }
                this.linkCount--;
                found = true;
                break;
            }
            current = current.laterLink;
        }
        if (!found) {
            this.takeBack(); // Mimic Array.splice(Array.indexOf(nonExistent), 1)
        }
    };

    this.takeFront = function() {
        if (!this.firstLink) return;

        const removedNode = this.firstLink;
        this.firstLink = removedNode.laterLink;
        if (this.firstLink) {
            this.firstLink.earlierLink = null;
        } else {
            this.lastLink = null;
        }
        this.linkCount--;
        return removedNode.payload;
    };

    this.takeBack = function() {
        if (!this.lastLink) return;

        const removedNode = this.lastLink;
        this.lastLink = removedNode.earlierLink;
        if (this.lastLink) {
            this.lastLink.laterLink = null;
        } else {
            this.firstLink = null;
        }
        this.linkCount--;
        return removedNode.payload;
    };

    this.toSequence = function() {
        const result = [];
        let current = this.firstLink;
        while (current) {
            result.push(current.payload);
            current = current.laterLink;
        }
        return result;
    };
}

const finalSequence = lineSegments.reduce((currentChain, currentSegment) => {
    const parts = currentSegment.split(' ');
    const actionType = parts[0];
    const valueParam = parseInt(parts[1], 10);

    switch (actionType) {
        case 'insert':
            currentChain.appendFront(valueParam);
            break;
        case 'delete':
            currentChain.takeSpecific(valueParam);
            break;
        case 'deleteFirst':
            currentChain.takeFront();
            break;
        case 'deleteLast':
            currentChain.takeBack();
            break;
    }
    return currentChain;
}, new ChainCollection());

console.log(finalSequence.toSequence().join(' '));