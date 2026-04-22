const dataSource = require('fs').readFileSync('/dev/stdin', 'utf8');
const operationEntries = dataSource.split('\n');

operationEntries.shift();

class ItemLink {
    constructor(content) {
        this.content = content;
        this.nextItem = null;
        this.previousItem = null;
    }
}

class ManagedSequence {
    constructor() {
        this.firstItem = null;
        this.lastItem = null;
        this.count = 0;
    }

    addFront(payload) {
        const newItem = new ItemLink(payload);
        if (!this.firstItem) {
            this.firstItem = newItem;
            this.lastItem = newItem;
        } else {
            newItem.nextItem = this.firstItem;
            this.firstItem.previousItem = newItem;
            this.firstItem = newItem;
        }
        this.count++;
    }

    removeExact(payload) {
        if (!this.firstItem) return false;

        let currentPointer = this.firstItem;
        while (currentPointer) {
            if (currentPointer.content === payload) {
                if (currentPointer === this.firstItem) {
                    this.firstItem = currentPointer.nextItem;
                    if (this.firstItem) {
                        this.firstItem.previousItem = null;
                    } else {
                        this.lastItem = null;
                    }
                } else if (currentPointer === this.lastItem) {
                    this.lastItem = currentPointer.previousItem;
                    this.lastItem.nextItem = null;
                } else {
                    currentPointer.previousItem.nextItem = currentPointer.nextItem;
                    currentPointer.nextItem.previousItem = currentPointer.previousItem;
                }
                this.count--;
                return true;
            }
            currentPointer = currentPointer.nextItem;
        }
        return false;
    }

    extractFirst() {
        if (!this.firstItem) return null;
        const removedContent = this.firstItem.content;
        this.firstItem = this.firstItem.nextItem;
        if (this.firstItem) {
            this.firstItem.previousItem = null;
        } else {
            this.lastItem = null;
        }
        this.count--;
        return removedContent;
    }

    extractLast() {
        if (!this.lastItem) return null;
        const removedContent = this.lastItem.content;
        if (this.firstItem === this.lastItem) {
            this.firstItem = null;
            this.lastItem = null;
        } else {
            this.lastItem = this.lastItem.previousItem;
            this.lastItem.nextItem = null;
        }
        this.count--;
        return removedContent;
    }

    retrieveAllContents() {
        const elements = [];
        let currentPointer = this.firstItem;
        while (currentPointer) {
            elements.push(currentPointer.content);
            currentPointer = currentPointer.nextItem;
        }
        return elements;
    }
}

const managedCollection = new ManagedSequence();

for (const currentInstruction of operationEntries) {
    const instructionParts = currentInstruction.split(' ');
    const command = instructionParts[0];
    const operand = instructionParts[1];

    switch (command) {
        case 'insert':
            managedCollection.addFront(operand);
            break;
        case 'delete':
            managedCollection.removeExact(operand);
            break;
        case 'deleteFirst':
            managedCollection.extractFirst();
            break;
        case 'deleteLast':
            managedCollection.extractLast();
            break;
    }
}

console.log(managedCollection.retrieveAllContents().join(' '));