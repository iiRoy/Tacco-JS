class ProtocolBasis {
  obtainMethod(payloadContent) {
    const primaryLine = payloadContent.split('\r\n')[0];
    return primaryLine.split(' ')[0];
  }

  obtainFields(payloadContent) {
    const contentLines = payloadContent.split('\r\n');
    const gatheredFields = {};
    for (let currentIdx = 1; currentIdx < contentLines.length; currentIdx++) {
      const currentLine = contentLines[currentIdx];
      const colonPosition = currentLine.indexOf(':');
      if (colonPosition > 0) {
        const fieldKey = currentLine.substring(0, colonPosition).trim().toUpperCase();
        const fieldValue = currentLine.substring(colonPosition + 1).trim();
        gatheredFields[fieldKey] = fieldValue;
      }
    }
    return gatheredFields;
  }
}

const verifyEquality = (actualVal, expectedVal, failureMsg) => {
  if (actualVal !== expectedVal) {
    throw new Error(`Mismatch: ${failureMsg} - Expected: '${expectedVal}', Received: '${actualVal}'`);
  }
};

const verifyCollectionSize = (collectionEntity, anticipatedSize, failureMsg) => {
  if (Object.keys(collectionEntity).length !== anticipatedSize) {
    throw new Error(`Size Mismatch: ${failureMsg} - Expected size: ${anticipatedSize}, Received size: ${Object.keys(collectionEntity).length}`);
  }
};

let totalRuns = 0;
let successRuns = 0;

const executeTest = (testLabel, testOperation) => {
  totalRuns++;
  try {
    testOperation();
    successRuns++;
    console.log(`SUCCESS: ${testLabel}`);
  } catch (issue) {
    console.error(`FAILURE: ${testLabel}`);
    console.error(`  Reason: ${issue.message}`);
  }
};

const organizeTests = (categoryLabel, categoryOperation) => {
  console.log(`\n=== ${categoryLabel} ===`);
  categoryOperation();
};

const initiateTesting = (suiteLabel, suiteOperation) => {
  console.log(`\n### ${suiteLabel} ###`);
  suiteOperation();
  console.log(`\n--- Testing Report ---`);
  console.log(`Total checks: ${totalRuns}`);
  console.log(`Passed checks: ${successRuns}`);
  console.log(`Failed checks: ${totalRuns - successRuns}`);
};

initiateTesting('Core Protocol Handling Analysis', () => {
  organizeTests('Operation Identifier Extraction System', () => {
    executeTest('correctly identifies primary operation from data stream', () => {
      const protocolHandler = new ProtocolBasis();

      const inboundDataStream = [
        'INITIATE device/1.0',
        'X-Device-Type: Sensor',
        'Content-Length: 128',
        'irrelevant line here'
      ].join('\r\n');

      const identifiedOperation = protocolHandler.obtainMethod(inboundDataStream);

      verifyEquality(identifiedOperation, 'INITIATE', 'Primary operation identification');
    });
  });

  organizeTests('Metadata Field Parser', () => {
    executeTest('accurately parses and retrieves relevant metadata fields', () => {
      const protocolHandler = new ProtocolBasis();

      const inboundDataStream = [
        'RESPONSE 200 OK',
        'CACHE-CONTROL: max-age=1800',
        'SERVER_INFO: custom_server/1.0',
        'this is ignored because it lacks a colon'
      ].join('\r\n');

      const parsedFields = protocolHandler.obtainFields(inboundDataStream);

      verifyCollectionSize(parsedFields, 2, 'Count of parsed metadata fields');

      verifyEquality(parsedFields['CACHE-CONTROL'], 'max-age=1800', 'Value for CACHE-CONTROL');
      verifyEquality(parsedFields.SERVER_INFO, 'custom_server/1.0', 'Value for SERVER_INFO');
    });
  });
});