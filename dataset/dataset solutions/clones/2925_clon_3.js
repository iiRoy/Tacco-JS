'use strict'

const processInputData = rawInputString => {
	const inputLine = rawInputString.split('\n')[0]
	const splitArguments = inputLine.split(' ')

	const firstNumericValue = parseInt(splitArguments[0], 10)
	const secondNumericValue = parseInt(splitArguments[1], 10)

	const SENIOR_AGE_THRESHOLD = 13
	const JUNIOR_AGE_THRESHOLD = 6
	const NO_DISCOUNT_VALUE = 0
	const HALF_DISCOUNT_FACTOR = 2.0 // Use float to match original division behavior

	let resultToLog

	if (firstNumericValue >= SENIOR_AGE_THRESHOLD) {
		resultToLog = secondNumericValue
	} else if (firstNumericValue >= JUNIOR_AGE_THRESHOLD) {
		resultToLog = secondNumericValue / HALF_DISCOUNT_FACTOR
	} else {
		resultToLog = NO_DISCOUNT_VALUE
	}

	console.log(resultToLog)
}

const standardInputContent = require('fs').readFileSync('/dev/stdin', 'utf8')
processInputData(standardInputContent)
