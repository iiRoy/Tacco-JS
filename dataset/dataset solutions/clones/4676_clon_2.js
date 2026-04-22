function ProcessInputData(rawData)
{
  let tokenizedParts = rawData.split(" ");
  let primaryFlag = tokenizedParts[0];
  let secondaryFlag = tokenizedParts[1];
  let finalResult;

  if (primaryFlag != "H")
  {
    if (secondaryFlag == "H")
    {
      finalResult = "D";
    }
    else
    {
      finalResult = "H";
    }
  }
  else
  {
    if (secondaryFlag == "H")
    {
      finalResult = "H";
    }
    else
    {
      finalResult = "D";
    }
  }

  console.log('%s', finalResult);
}

// This function is included for simulating browser-based input during development.
function PerformTestRun()
{
  let testInputString = document.getElementById("dataEntryField").value;
  ProcessInputData(testInputString);
}

// Execute the primary data handling routine, reading from standard input.
ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));