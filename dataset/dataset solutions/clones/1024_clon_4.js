const rawContent = require('fs').readFileSync('/dev/stdin', 'utf8');

const contentLines = rawContent.trim().split('\n');
const topLine = contentLines.shift().split(' ');
const totalEntities = parseInt(topLine[0], 10);
const timeSlice = parseInt(topLine[1], 10);

function createUnit(label, duration) {
  return {
    designation: label,
    remainingDuration: duration
  };
}

function makeLink(itemValue, nextLink = null, prevLink = null) {
  return {
    item: itemValue,
    next: nextLink,
    previous: prevLink
  };
}

function createSequenceManager() {
  let headNode = null;
  let tailNode = null;
  let currentSize = 0;

  return {
    appendElement: (value) => {
      const freshLink = makeLink(value, null, tailNode);
      if (tailNode) {
        tailNode.next = freshLink;
      }
      tailNode = freshLink;
      if (!headNode) {
        headNode = freshLink;
      }
      currentSize++;
    },

    extractLastElement: () => {
      if (!tailNode) {
        return undefined;
      }
      const extractedValue = tailNode.item;
      tailNode = tailNode.previous;
      if (tailNode) {
        tailNode.next = null;
      } else {
        headNode = null;
      }
      currentSize--;
      return extractedValue;
    },

    prependElement: (value) => {
      const freshLink = makeLink(value, headNode, null);
      if (headNode) {
        headNode.previous = freshLink;
      }
      headNode = freshLink;
      if (!tailNode) {
        tailNode = freshLink;
      }
      currentSize++;
    },

    isEmpty: () => currentSize === 0
  };
}

const operationalUnits = createSequenceManager();
contentLines.forEach(line => {
  const [unitLabel, unitTime] = line.split(' ');
  operationalUnits.appendElement(createUnit(unitLabel, parseInt(unitTime, 10)));
});

let cumulativeElapsed = 0;

function executeCycle(currentUnits) {
  if (currentUnits.isEmpty()) {
    return;
  }

  const activeUnit = currentUnits.extractLastElement();
  const allottedSpan = Math.min(activeUnit.remainingDuration, timeSlice);

  cumulativeElapsed += allottedSpan;
  activeUnit.remainingDuration -= allottedSpan;

  if (activeUnit.remainingDuration > 0) {
    currentUnits.prependElement(activeUnit);
  } else {
    console.log(`${activeUnit.designation} ${cumulativeElapsed}`);
  }

  executeCycle(currentUnits);
}

executeCycle(operationalUnits);