const inputSource = require('fs').readFileSync('/dev/stdin', 'utf8');

class CustomQueue {
  constructor() {
    this.head = null;
    this.tail = null;
    this.count = 0;
  }

  addBack(val) {
    const freshNode = { val, next: null };
    if (!this.head) {
      this.head = freshNode;
      this.tail = freshNode;
    } else {
      this.tail.next = freshNode;
      this.tail = freshNode;
    }
    this.count++;
  }

  extractBack() {
    if (this.count === 0) return undefined;

    const extractedVal = this.tail.val;

    if (this.count === 1) {
      this.head = null;
      this.tail = null;
    } else {
      let currentPointer = this.head;
      while (currentPointer.next !== this.tail) {
        currentPointer = currentPointer.next;
      }
      currentPointer.next = null;
      this.tail = currentPointer;
    }
    this.count--;
    return extractedVal;
  }

  addFront(val) {
    const freshNode = { val, next: this.head };
    this.head = freshNode;
    if (!this.tail) {
      this.tail = freshNode;
    }
    this.count++;
  }

  emptyCheck() {
    return this.count === 0;
  }
}

const lineSegments = inputSource.trim().split('\n');

const [ initialNStr, quantumStr ] = lineSegments[0].split(' ');
const totalProcesses = Number(initialNStr);
const quantumDuration = Number(quantumStr);

const taskQueue = new CustomQueue();

lineSegments.slice(1).forEach(line => {
  const [ taskName, taskTimeStr ] = line.split(' ');
  taskQueue.addBack({ label: taskName, remainingTime: Number(taskTimeStr) });
});

let cumulativeTime = 0;

while (!taskQueue.emptyCheck()) {
  const currentTask = taskQueue.extractBack();
  const timeSlice = Math.min(currentTask.remainingTime, quantumDuration);
  cumulativeTime += timeSlice;
  currentTask.remainingTime -= timeSlice;

  if (currentTask.remainingTime > 0) {
    taskQueue.addFront(currentTask);
  } else {
    console.log(currentTask.label + ' ' + cumulativeTime);
  }
}
