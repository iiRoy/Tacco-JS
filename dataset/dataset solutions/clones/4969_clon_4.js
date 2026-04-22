'use strict'

const obtainInputData = () => {
    return require('fs').readFileSync('/dev/stdin', 'utf-8').toString()
}

const organizeGameElements = (rawData) => {
    const lines = rawData.split('\n')
    const playerIdentifierMap = {
        'a': 'alpha',
        'b': 'beta',
        'c': 'gamma'
    }

    const elementStorage = {
        [playerIdentifierMap['a']]: lines[0],
        [playerIdentifierMap['b']]: lines[1],
        [playerIdentifierMap['c']]: lines[2],
    }
    return { elementStorage, playerIdentifierMap }
}

const processGameRound = (currentParticipantKey, currentCollections, participantMapping) => {
    const activeCollection = currentCollections[currentParticipantKey]

    if (activeCollection.length === 0) {
        return currentParticipantKey
    }

    const nextCharacterValue = activeCollection.charAt(0)
    const remainingPart = activeCollection.substring(1)

    const updatedCollections = { ...currentCollections }
    updatedCollections[currentParticipantKey] = remainingPart

    const nextParticipantKey = participantMapping[nextCharacterValue]

    return processGameRound(nextParticipantKey, updatedCollections, participantMapping)
}

const initiateGameSequence = () => {
    const rawDataStream = obtainInputData()
    const { elementStorage: initialCollections, playerIdentifierMap: charToKeyMap } = organizeGameElements(rawDataStream)

    const winnerKey = processGameRound(charToKeyMap['a'], initialCollections, charToKeyMap)

    const keyToCharMap = {
        'alpha': 'A',
        'beta': 'B',
        'gamma': 'C'
    }

    console.log(keyToCharMap[winnerKey])
}

initiateGameSequence()