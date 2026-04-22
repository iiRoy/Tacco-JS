function calculatePrice(dataLines)
{
  let targetAmount = Number(dataLines[0]);
  let resultValue = "NO_MATCH";

  for (let currentCheck = 1; currentCheck < targetAmount; currentCheck++)
  {
    if (parseInt(currentCheck * 1.08) === targetAmount) {
      resultValue = currentCheck;
    }
  }

  console.log(resultValue);
}

calculatePrice(
  require('fs')
    .readFileSync('/dev/stdin', 'utf8')
    .split('\n')
);