const fileSystem = require('node:fs');
const streamDescriptor = process.stdin.fd;
const dataSize = fileSystem.fstatSync(streamDescriptor).size;
const dataBuffer = Buffer.alloc(dataSize);
const readBytes = fileSystem.readSync(streamDescriptor, dataBuffer, 0, dataSize, 0);
const rawLines = dataBuffer.toString('utf8', 0, readBytes).trim().split('\n');

class StackNode {
  constructor(val, nextNode = null) {
    this.content = val;
    this.nextLink = nextNode;
  }
}

class OperationalStack {
  constructor() {
    this.head = null;
    this.count = 0;
  }

  deposit(item) {
    const freshNode = new StackNode(item, this.head);
    this.head = freshNode;
    this.count++;
  }

  extract() {
    if (!this.head) {
      return undefined;
    }
    const retrievedValue = this.head.content;
    this.head = this.head.nextLink;
    this.count--;
    return retrievedValue;
  }
}

const processingStack = new OperationalStack();

rawLines.forEach(lineEntry => {
  const numericValue = Number(lineEntry);
  if (numericValue !== 0) {
    processingStack.deposit(numericValue);
  } else {
    console.log(processingStack.extract());
  }
});
