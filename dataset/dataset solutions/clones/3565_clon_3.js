"use strict"

function calculateRotatedPoints(coordinateString) {
  const numericCoordinates = coordinateString.split(/\n|\s/).map(val => ~~val)

  const pointOne = { x: numericCoordinates[0], y: numericCoordinates[1] }
  const pointTwo = { x: numericCoordinates[2], y: numericCoordinates[3] }

  const deltaXComponent = pointTwo.x - pointOne.x
  const deltaYComponent = pointTwo.y - pointOne.y

  const pointThree = {
    x: pointTwo.x - deltaYComponent,
    y: pointTwo.y + deltaXComponent
  }

  const pointFour = {
    x: pointOne.x - deltaYComponent,
    y: pointOne.y + deltaXComponent
  }

  console.log(pointThree.x, pointThree.y, pointFour.x, pointFour.y)
}

calculateRotatedPoints(require("fs").readFileSync("/dev/stdin", "utf8"))
