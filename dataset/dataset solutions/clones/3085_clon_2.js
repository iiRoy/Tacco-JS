function ProcessInputData(rawInputData)
{
    let characterList = [ ];

    rawInputData = rawInputData
        .split('\n')
        .map((segmentValue, segmentIndex) => {
            if (segmentIndex === 0)
            {
                return segmentValue.split(' ').map(numericString => Number.parseInt(numericString, 10));
            }
            else if (segmentIndex === 1)
            {
                return segmentValue.split('').map(charSymbol => {
                    characterList.push(charSymbol);
                    return { [charSymbol]: true, entityQuantity: 1 };
                });
            }
            else
            {
                return segmentValue.split(' ');
            }
        });

    const numericParameters = rawInputData[0];
    const gridDimension = numericParameters[0];
    const queryOperations = numericParameters[1];
    let activeEntitiesCount = gridDimension;

    const entityStateMap = rawInputData[1];

    for (let operationIterator = 2; operationIterator < queryOperations + 2; operationIterator++)
    {
        const currentOperationDetails = rawInputData[operationIterator];
        const searchCharacter = currentOperationDetails[0];
        const moveDirection = currentOperationDetails[1];

        for (const entityIndex in characterList)
        {
            if (entityStateMap[entityIndex][searchCharacter])
            {
                entityStateMap[entityIndex][searchCharacter] = false;

                const targetLocation = Number.parseInt(entityIndex, 10) + (moveDirection === 'L' ? (-1) : 1);
                if (targetLocation < 0 || targetLocation >= gridDimension)
                {
                    activeEntitiesCount -= entityStateMap[entityIndex].entityQuantity;
                }
                else
                {
                    entityStateMap[targetLocation][characterList[targetLocation]] = true;
                    entityStateMap[targetLocation].entityQuantity += entityStateMap[entityIndex].entityQuantity;
                }
                entityStateMap[entityIndex].entityQuantity = 0;
            }
        }
    }
    console.log(activeEntitiesCount);
}

ProcessInputData(require("fs").readFileSync("/dev/stdin", "utf8"));