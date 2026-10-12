function ProcessInput(rawData) {
  // Split the raw input string into an array of lines.
  rawData = rawData.split('\n');

  // Check if the last line is empty and remove it if so.
  if (rawData[rawData.length - 1] === '') {
    rawData.pop();
  }

  // Parse the required health value from the first line.
  const requiredHealth = rawData[0].split(' ')[0] - 0;

  // Parse the number of attacks (though not used in the logic, it's part of the input structure).
  const numAttacks = rawData[0].split(' ')[1] - 0;

  // Parse the attack damage values from the second line and convert them to numbers.
  const attackDamages = rawData[1].split(' ').map(currentDamageString => {
    return Number(currentDamageString);
  });

  // Calculate the total damage from all attacks and compare it with the required health.
  // Output 'Yes' if total damage is sufficient, otherwise 'No'.
  console.log(attackDamages.reduce((accumulatorDamage, currentDamageValue) => {
    return accumulatorDamage + currentDamageValue;
  }) >= requiredHealth ? 'Yes' : 'No');
}

// This part handles reading from standard input and invoking the main processing function.
ProcessInput(require("fs").readFileSync("/dev/stdin", "utf8"));
