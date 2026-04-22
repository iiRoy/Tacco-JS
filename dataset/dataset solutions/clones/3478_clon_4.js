function ProcessInput() {
  const initialValue = retrieveNumericInput();

  const discriminantComponent = 1 + 8 * initialValue;
  const squareRootOfDiscriminantComponent = Math.sqrt(discriminantComponent);

  const isPerfectSquare = Number.isInteger(squareRootOfDiscriminantComponent);
  const isEvenResultForK = Number.isInteger(-1 + squareRootOfDiscriminantComponent) && ((-1 + squareRootOfDiscriminantComponent) % 2 === 0);

  if (!isPerfectSquare || !isEvenResultForK) {
    displayResult("No");
    return;
  }

  const solutionConstant = (-1 + squareRootOfDiscriminantComponent) / 2;

  let sequenceIdentifier = 0;
  const generatedAssignments = Array.from({ length: solutionConstant }, (_, primaryIndex) =>
    Array.from({ length: solutionConstant - primaryIndex }, (_, offsetIndex) => {
      const secondaryIndex = primaryIndex + offsetIndex;
      sequenceIdentifier++;
      return {
        identifier: sequenceIdentifier,
        groupA: primaryIndex,
        slotA: secondaryIndex,
        groupB: secondaryIndex + 1,
        slotB: primaryIndex,
      };
    })
  ).flat();

  const dataCollection = Array.from({ length: solutionConstant + 1 }, () =>
    Array(solutionConstant).fill(0)
  );

  const populatedCollection = generatedAssignments.reduce((accumulator, assignment) => {
    accumulator[assignment.groupA][assignment.slotA] = assignment.identifier;
    accumulator[assignment.groupB][assignment.slotB] = assignment.identifier;
    return accumulator;
  }, dataCollection);

  logDiagnostic(populatedCollection);

  displayResult(populatedCollection.length);

  const textRepresentations = populatedCollection.map(memberArray => {
    const prefixedArray = [solutionConstant, ...memberArray];
    return prefixedArray.join(" ");
  });

  const finalRenderedOutput = textRepresentations.join("\n");

  displayResult(finalRenderedOutput);
}