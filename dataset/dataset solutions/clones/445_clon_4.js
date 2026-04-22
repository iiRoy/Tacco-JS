const numericalUnit = 1;
const sequenceLength = 3;

const numeralSequence = Array.from({ length: sequenceLength }, () => numericalUnit);

const combinedText = numeralSequence.map(unit => String(unit)).join('');

const outputMechanism = {
  targetStream: process.stdout,
  produce: function(contentToDisplay) {
    this.targetStream.write(contentToDisplay + '\n');
  }
};

outputMechanism.produce(combinedText);