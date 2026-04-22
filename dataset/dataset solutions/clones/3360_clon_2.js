"use strict"

const primaryProcessor = inputDataString => {
  let firstComponent = parseInt(inputDataString.split(" ")[0])
  let secondQuantity = parseInt(inputDataString.split(" ")[1])
  let thirdParameter = parseInt(inputDataString.split(" ")[2])

  let calculatedOutcome = 0
  
  if (secondQuantity >= thirdParameter) {
    calculatedOutcome += thirdParameter + secondQuantity
    thirdParameter = 0
  }
  else {
    calculatedOutcome += secondQuantity * 2
    thirdParameter -= secondQuantity, secondQuantity = 0
  }
  
  if (thirdParameter > 0) {
    let intermediateValue = Math.min(thirdParameter, firstComponent)
    thirdParameter -= intermediateValue
    calculatedOutcome += intermediateValue
  }

  if (thirdParameter > 0)
    calculatedOutcome++
  
  console.log(calculatedOutcome)
}

primaryProcessor(require('fs').readFileSync('/dev/stdin', 'utf8'))