"use strict"
processInput(require("fs").readFileSync("/dev/stdin", "utf8") .replace(/\r?\n$/, "") .split(/\r?\n/))

function processInput(inputData) {

  function Cube(faceValues) {
    this.top    = faceValues[0]
    this.south  = faceValues[1]
    this.east   = faceValues[2]
    this.west   = faceValues[3]
    this.north  = faceValues[4]
    this.bottom = faceValues[5]
  }

  Cube.prototype.rotate = function(direction) {
    let temporaryValue

    if (direction === "N") {
      temporaryValue = this.top
      this.top    = this.south
      this.south  = this.bottom
      this.bottom = this.north
      this.north  = temporaryValue
    }
    else if (direction === "S") {
      temporaryValue = this.top
      this.top    = this.north
      this.north  = this.bottom
      this.bottom = this.south
      this.south  = temporaryValue
    }
    else if (direction === "W") {
      temporaryValue = this.top
      this.top    = this.east
      this.east   = this.bottom
      this.bottom = this.west
      this.west   = temporaryValue
    }
    else if (direction === "E") {
      temporaryValue = this.top
      this.top    = this.west
      this.west   = this.bottom
      this.bottom = this.east
      this.east   = temporaryValue
    }
  }

  Cube.prototype.compareIdentical = function(anotherCube) {
    const currentCube = new Cube([this.top, this.south, this.east, this.west, this.north, this.bottom])
    const targetCube  = new Cube([anotherCube.top, anotherCube.south, anotherCube.east, anotherCube.west, anotherCube.north, anotherCube.bottom])

    const rotationSequence = "EEEENEEEENEEEENEEENEEEENNEEEE"

    for (let movementChar of rotationSequence) {
      if (currentCube.top    === targetCube.top &&
          currentCube.south  === targetCube.south &&
          currentCube.east   === targetCube.east &&
          currentCube.west   === targetCube.west &&
          currentCube.north  === targetCube.north &&
          currentCube.bottom === targetCube.bottom)
      {
        return true
      }
      targetCube.rotate(movementChar)
    }
    return false
  }

  const firstCubeInstance  = new Cube(inputData[0].split(" "))
  const secondCubeInstance = new Cube(inputData[1].split(" "))

  console.log(firstCubeInstance.compareIdentical(secondCubeInstance) ? "Yes" : "No")

}