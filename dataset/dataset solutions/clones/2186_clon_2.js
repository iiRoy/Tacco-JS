const firstInput= systemEnv.commandLineArguments[2];
const secondInput = systemEnv.commandLineArguments[  3];

resultDisplay.showMessage(
  numericalOperations.integerFloor(
    firstInput
    /
    secondInput
  )
);