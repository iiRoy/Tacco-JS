'use strict'

const processInput = (rawData) => {
  const allInputLines = rawData.split('\n')
  const expectedWordCount = Number(allInputLines[0])
  const wordList = allInputLines.slice(1) // Exclude the first line which contains N

  // Check for uniqueness of words
  // Original: let tmp = input.filter((x, i, self) => self.indexOf(x) === i)
  // Original: if (tmp.length != N) { ... }
  const distinctWords = new Set(wordList)
  if (distinctWords.size !== expectedWordCount) {
    console.log('No')
    return
  }

  // Check if words form a valid chain
  // Original: for (let i = 1; i < input.length; i++) {
  // Original:   if (input[i - 1].slice(-1) != input[i].slice(0, 1)) { ... }
  let chainIntegrityMaintained = true
  for (let currentWordIdx = 1; currentWordIdx < wordList.length; currentWordIdx++) {
    const precedingWord = wordList[currentWordIdx - 1]
    const currentWord = wordList[currentWordIdx]

    const lastCharOfPreceding = precedingWord.slice(-1)
    const firstCharOfCurrent = currentWord.slice(0, 1)

    if (lastCharOfPreceding !== firstCharOfCurrent) {
      chainIntegrityMaintained = false
      break // No need to check further if a break in chain is found
    }
  }

  if (!chainIntegrityMaintained) {
    console.log('No')
    return
  }

  // If all conditions are met
  console.log('Yes')
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
