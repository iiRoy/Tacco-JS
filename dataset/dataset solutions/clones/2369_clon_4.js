const retrieveNumericalInput = () => Number(obj.next());
const presentFinalOutput = (value) => console.log(value);

const executeCoreLogic = () => {
  const primaryNumber = retrieveNumericalInput();
  const outcome = primaryNumber < 100
    ? 0
    : (primaryNumber % 100 === 0
      ? 1
      : (((primaryNumber / 100) | 0) * 5 >= (primaryNumber % 100) + ((5 - ((primaryNumber % 100) % 5)) % 5) ? 1 : 0)
    );
  presentFinalOutput(outcome);
};

// This function (executeCoreLogic) would be called by the boilerplate's 'close' event handler.
// For example: read.on('close', function(){ ... executeCoreLogic(); ... });