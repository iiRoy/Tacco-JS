const fileSystemUtility = require('fs')
let rawTextualData = fileSystemUtility.readFileSync('/dev/stdin', 'utf8')

let dataUnits = rawTextualData.split(/ |\n/)
let currentUnitIndex = 0

const fetchNextDataUnit = () => dataUnits[currentUnitIndex++]
const extractNumericValues = (quantity) => {
  const segment = dataUnits.slice(currentUnitIndex, currentUnitIndex += quantity)
  return segment.map(item => parseInt(item))
}

const [firstSide, secondSide, currentHour, currentMinute] = extractNumericValues(4)

const minuteIndicatorDegrees = currentMinute * 6.0
const hourIndicatorDegrees = (currentHour + currentMinute / 60.0) * 30.0
let absoluteAngularSeparation = Math.abs(minuteIndicatorDegrees - hourIndicatorDegrees)

// Debug: Display minute hand angle, hour hand angle, and their difference
// Debugging output: Current angular positions and separation
// console.log(minuteIndicatorDegrees, hourIndicatorDegrees, absoluteAngularSeparation)

const DEGREES_TO_RADIANS_FACTOR = Math.PI / 180.0
const finalComputedLength = Math.sqrt(firstSide ** 2 + secondSide ** 2 - 2 * firstSide * secondSide * Math.cos(absoluteAngularSeparation * DEGREES_TO_RADIANS_FACTOR))
console.log(finalComputedLength)