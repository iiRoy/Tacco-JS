function ProcessInput(inputString) {
  let firstLineContent, secondLineContent;
  [firstLineContent, secondLineContent] = inputString.split("\n");

  const totalElements = parseInt(firstLineContent);
  const elementConnections = secondLineContent.split(" ").map(Number);

  const identifiedSymmetricPairs = Array.from({ length: totalElements }, (_, currentElementIndex) => currentElementIndex + 1)
    .reduce((pairRegistry, currentElementIdentifier) => {
      const connectedElementIdentifier = elementConnections[currentElementIdentifier - 1];

      if (elementConnections[connectedElementIdentifier - 1] === currentElementIdentifier) {
        const smallerIdentifier = Math.min(currentElementIdentifier, connectedElementIdentifier);
        const largerIdentifier = Math.max(currentElementIdentifier, connectedElementIdentifier);
        pairRegistry.add(`${smallerIdentifier}-${largerIdentifier}`);
      }
      return pairRegistry;
    }, new Set());

  console.log(identifiedSymmetricPairs.size);
}

ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
