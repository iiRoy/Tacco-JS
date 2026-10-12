class ElementNode {
    constructor(val) {
        this.val = val;
        this.prev = null;
        this.next = null;
    }
}

class ManagedDeque {
    constructor() {
        this.head = null;
        this.tail = null;
        this.count = 0;
    }

    addFront(value) {
        const freshNode = new ElementNode(value);
        if (!this.head) {
            this.head = freshNode;
            this.tail = freshNode;
        } else {
            freshNode.next = this.head;
            this.head.prev = freshNode;
            this.head = freshNode;
        }
        this.count++;
    }

    removeSpecific(value) {
        let currentPointer = this.head;
        while (currentPointer) {
            if (currentPointer.val === value) {
                if (currentPointer.prev) {
                    currentPointer.prev.next = currentPointer.next;
                } else {
                    this.head = currentPointer.next;
                }

                if (currentPointer.next) {
                    currentPointer.next.prev = currentPointer.prev;
                } else {
                    this.tail = currentPointer.prev;
                }
                this.count--;
                return true;
            }
            currentPointer = currentPointer.next;
        }
        return false;
    }

    removeHead() {
        if (!this.head) return undefined;
        const removedValue = this.head.val;
        this.head = this.head.next;
        if (this.head) {
            this.head.prev = null;
        } else {
            this.tail = null;
        }
        this.count--;
        return removedValue;
    }

    removeTail() {
        if (!this.tail) return undefined;
        const removedValue = this.tail.val;
        this.tail = this.tail.prev;
        if (this.tail) {
            this.tail.next = null;
        } else {
            this.head = null;
        }
        this.count--;
        return removedValue;
    }

    retrieveAllValues() {
        const collection = [];
        let current = this.head;
        while (current) {
            collection.push(current.val);
            current = current.next;
        }
        return collection;
    }
}

var fileSystem = require('fs');
var rawInput = fileSystem.readFileSync('/dev/stdin', 'utf8');
var instructionLines = rawInput.split('\n');

instructionLines.shift();

var activeDeque = new ManagedDeque();

instructionLines.forEach(function(currentInstruction) {
    var instructionParts = currentInstruction.split(' ');

    if (instructionParts[0] === 'insert') {
        activeDeque.addFront(instructionParts[1]);
    } else if (instructionParts[0] === 'delete') {
        activeDeque.removeSpecific(instructionParts[1]);
    } else if (instructionParts[0] === 'deleteFirst') {
        activeDeque.removeHead();
    } else if (instructionParts[0] === 'deleteLast') {
        activeDeque.removeTail();
    }
});

console.log(activeDeque.retrieveAllValues().join(' '));
