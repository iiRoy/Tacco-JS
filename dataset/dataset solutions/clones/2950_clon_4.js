'use strict'

const processInput = initialData => {
    const dataLines = initialData.trim().split('\n')
    const targetPosition = parseInt(dataLines[0].split(' ')[1], 10)
    const sourceString = dataLines[1]

    const characterList = Array.from(sourceString)
    
    if (targetPosition > 0 && targetPosition <= characterList.length) {
        characterList[targetPosition - 1] = characterList[targetPosition - 1].toLowerCase()
    }

    const modifiedString = characterList.join('')
    console.log(modifiedString)
}

processInput(require('fs').readFileSync('/dev/stdin', 'utf8'))
