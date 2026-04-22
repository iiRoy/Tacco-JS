function (systemIO) {
    const moduleDefinitionsContainer = {
        'entryPoint': (exportedContent, moduleAcquirerReference, externalIO) => {
            const fileService = moduleAcquirerReference('filesystemUtilities');
            const calculationProcessor = moduleAcquirerReference('dataProcessingUnit');

            calculationProcessor.performCalculation(
                fileService.retrieveData("/dev/stdin", "UTF-8").split('\n')
            );
        },
        'dataProcessingUnit': (exportedContent, moduleAcquirerReference, externalIO) => {
            exportedContent.performCalculation = (receivedLines) => {
                const numberOfItems = parseInt(receivedLines[0], 10);
                const initialNumbers = receivedLines[1].split(' ').map(str => +str);

                const adjustedNumbers = initialNumbers.map((valueItem, positionIndex) => {
                    return valueItem - positionIndex - 1;
                });

                const recursiveMergeSort = (listForSorting) => {
                    if (listForSorting.length <= 1) {
                        return listForSorting;
                    }
                    const midPoint = Math.floor(listForSorting.length / 2);
                    const leftSegment = listForSorting.slice(0, midPoint);
                    const rightSegment = listForSorting.slice(midPoint);

                    const sortedLeftSegment = recursiveMergeSort(leftSegment);
                    const sortedRightSegment = recursiveMergeSort(rightSegment);

                    let mergeResult = [];
                    let leftIterator = 0;
                    let rightIterator = 0;

                    while (leftIterator < sortedLeftSegment.length && rightIterator < sortedRightSegment.length) {
                        if (sortedLeftSegment[leftIterator] < sortedRightSegment[rightIterator]) {
                            mergeResult.push(sortedLeftSegment[leftIterator]);
                            leftIterator++;
                        } else {
                            mergeResult.push(sortedRightSegment[rightIterator]);
                            rightIterator++;
                        }
                    }
                    return mergeResult.concat(sortedLeftSegment.slice(leftIterator)).concat(sortedRightSegment.slice(rightIterator));
                };

                const sortedAdjustedNumbers = recursiveMergeSort([...adjustedNumbers]);

                let centralReferenceValue;
                if (numberOfItems % 2 === 0) {
                    const lowerMiddlePos = numberOfItems / 2 - 1;
                    const upperMiddlePos = numberOfItems / 2;
                    centralReferenceValue = sortedAdjustedNumbers[lowerMiddlePos] + sortedAdjustedNumbers[upperMiddlePos];
                } else {
                    const middlePos = Math.floor(numberOfItems / 2);
                    centralReferenceValue = sortedAdjustedNumbers[middlePos];
                }

                const totalAbsoluteDifference = sortedAdjustedNumbers.reduce((currentSum, numberEntry) => {
                    return currentSum + Math.abs(numberEntry - centralReferenceValue);
                }, 0);

                console.log(totalAbsoluteDifference);
            };
        },
        'filesystemUtilities': (exportedContent, moduleAcquirerReference, externalIO) => {
            exportedContent.retrieveData = (resourcePath, textEncoding) => {
                return externalIO.accessFile(resourcePath, textEncoding);
            };
        }
    };

    const loadedModuleRecords = {};

    const moduleResolver = (moduleAlias) => {
        if (loadedModuleRecords[moduleAlias]) {
            return loadedModuleRecords[moduleAlias].contentPayload;
        }

        const currentModuleRecord = {
            designationKey: moduleAlias,
            isReady: false,
            contentPayload: {},
        };
        loadedModuleRecords[moduleAlias] = currentModuleRecord;

        const moduleFactoryFunction = moduleDefinitionsContainer[moduleAlias];
        moduleFactoryFunction(currentModuleRecord.contentPayload, moduleResolver, systemIO);

        currentModuleRecord.isReady = true;
        return currentModuleRecord.contentPayload;
    };

    moduleResolver('entryPoint');
}