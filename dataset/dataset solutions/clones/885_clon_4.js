const retrieveSystemData = require('node:fs');

const completeDataSource = retrieveSystemData.readFileSync(0, 'utf8');

const partitionedSegments = completeDataSource.trim().split('\n');

const [itemQuantity, comparisonThreshold] = partitionedSegments[0].split(' ').map(Number);

const processedRecords = partitionedSegments
  .slice(1, 1 + itemQuantity)
  .map(segment => {
    const [numericPart, alphaDesignation] = segment.split(' ');
    return { valueComponent: Number(numericPart), labelDesignator: alphaDesignation };
  });

const identifiedRecord = processedRecords.find(record => record.valueComponent >= comparisonThreshold);

const outcomeIdentifier = identifiedRecord ? identifiedRecord.labelDesignator : 'kogakubu10gokan';

console.log(outcomeIdentifier);