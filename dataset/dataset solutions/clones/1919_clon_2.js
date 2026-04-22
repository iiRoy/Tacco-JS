function performCalculation(inputCollection)
{
  var   desiredThreshold = parseInt(inputCollection[0]);
  var currentHolding = 100;
  var periodCounter = 0;
  while( currentHolding < desiredThreshold )
  {
    currentHolding *= 1.01;
    currentHolding = Math.floor(currentHolding);
    periodCounter++;
  }
  console.log( periodCounter );
}

performCalculation (  require("fs").readFileSync("/dev/stdin", "utf8").trim().split("\n") );