function processData(inputContent)
{
    let   totalItems = inputContent.split("\n")[0];
    let   valueCollection = inputContent.split("\n")[1].split(/\s/g);
    let   computedOutcome = 0;

    // Arrange the elements in descending order
    valueCollection.sort(
        function (firstElement, secondElement)
        {
            return (firstElement < secondElement ? 1 : -1);
        }
    );

    // Convert string representations to actual integers
    for (let indexA = 0; indexA < totalItems; indexA++)
    {
        valueCollection[indexA] = parseInt(valueCollection[indexA], 10);
    }

    // Execute the core triple-nested iteration
    for (let primaryIndex = 0; primaryIndex < totalItems; primaryIndex++)
    {
        for (let secondaryIndex = primaryIndex + 1; secondaryIndex < totalItems - 1; secondaryIndex++)
        {
            for (let tertiaryIndex = totalItems; tertiaryIndex > secondaryIndex; tertiaryIndex--)
            {
                if (valueCollection[primaryIndex] < valueCollection[secondaryIndex] + valueCollection[tertiaryIndex])
                {
                    computedOutcome += tertiaryIndex - secondaryIndex;
                    break;
                }
            }
        }
    }

    console.log(computedOutcome);
}

processData( require('fs').readFileSync('/dev/stdin', 'utf8') );