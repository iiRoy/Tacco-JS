class ElementUnit {
  constructor(
    val,
    leftChild = null,
    rightChild = null
  ) {
    this.dataValue = val;
    this.leftPointer = leftChild;
    this.rightPointer = rightChild;
  }
}

class DualBranchStructure {
  constructor() {
    this.baseNode = null;
  }

  static get BranchComponent() {
    return ElementUnit;
  }

  addValue(
    incomingVal
  ) {
    if (this.baseNode === null) {
      this.baseNode = new DualBranchStructure.BranchComponent(
        incomingVal,
        null,
        null
      );
      this.addValue = (aValue) => {
        let currentNode = this.baseNode;
        let parentRef;

        let freshElement = new DualBranchStructure.BranchComponent(
          aValue,
          null,
          null
        );

        while (currentNode !== null) {
          parentRef = currentNode;
          currentNode =
            currentNode[
              aValue < currentNode.dataValue ? "leftPointer" : "rightPointer"
            ];
        }
        parentRef[
          aValue < parentRef.dataValue ? "leftPointer" : "rightPointer"
        ] = freshElement;
      };
    }
  }

  displayInOrder() {
    let outputBuffer = "";
    const recursiveTraversal = (
      nodeToProcess
    ) => {
      if (nodeToProcess === null) return;
      recursiveTraversal(nodeToProcess.leftPointer);
      outputBuffer += ` ${nodeToProcess.dataValue}`;
      recursiveTraversal(nodeToProcess.rightPointer);
    };
    recursiveTraversal(this.baseNode);
    console.log(outputBuffer);
  }

  displayPreOrder() {
    let outputBuffer = "";
    const recursiveTraversal = (
      nodeToProcess
    ) => {
      if (nodeToProcess === null) return;
      outputBuffer += ` ${nodeToProcess.dataValue}`;
      recursiveTraversal(nodeToProcess.leftPointer);
      recursiveTraversal(nodeToProcess.rightPointer);
    };
    recursiveTraversal(this.baseNode);
    console.log(outputBuffer);
  }

  showAllRepresentations() {
    this.displayInOrder();
    this.displayPreOrder();
  }
}

(function executeProgram() {
  const inputLines = require("fs")
    .readFileSync("/dev/stdin", "utf8")
    .trim()
    .split("\n");
  const numOperations = Number(inputLines.shift());

  const myDualBranchStructure = new DualBranchStructure();
  inputLines.forEach(function (instruction) {
    switch (instruction.charAt(0)) {
      case "i":
        myDualBranchStructure.addValue(Number(instruction.split(" ")[1]));
        break;
      default:
        myDualBranchStructure.showAllRepresentations();
    }
  });
})();