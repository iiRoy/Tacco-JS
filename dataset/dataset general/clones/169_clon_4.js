const nodeIO = require('node:fs');
const contentBuilder = require('../lib/utils/generator');
const proofChecker = require('../lib/utils/validator');
const resourceSearcher = require('../lib/utils/finder');
const dataAccessor = require('../lib/utils/getter');

const challengeLimits = {
  lowerBound: '000',
  upperBound: '267'
};

const answerBounds = {
  minVal: '000',
  maxVal: '405'
};

describe('ContentBuilder Module', () => {

  const challengeSpace = './dev_challenges';

  beforeEach(() => {
    nodeIO.mkdirSync(challengeSpace);
    process.chdir(challengeSpace);
  });

  afterEach(() => {
    const currentEntries = nodeIO.readdirSync('.');
    for (const entryPath of currentEntries) {
      nodeIO.unlinkSync(entryPath);
    }
    process.chdir('..');
    nodeIO.rmdirSync(challengeSpace);
  });

  describe('Preview Generation Operations', () => {

    test('confirms preview output for an existing prompt ID', (doneCallback) => {
      let returnedContent;
      const expectedText = 
        'Problem 1\n' +
        '=========\n' +
        '\n' +
        'If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        'we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '\n' +
        'Find the sum of all the multiples of 3 or 5 below 1000.';

      contentBuilder.preview(
        (content) => {
          returnedContent = content;
          expect(returnedContent).toEqual(expectedText);
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        },
        '001'
      );
    });

    test('invokes error handler for IDs below minimum range', (doneCallback) => {
      let checkFlag = true;

      contentBuilder.preview(
        () => {
          checkFlag = false;
          doneCallback();
        },
        () => {
          checkFlag = true;
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        challengeLimits.lowerBound
      );
    });

    test('triggers error path for IDs exceeding maximum range', (doneCallback) => {
      let checkFlag = true;

      contentBuilder.preview(
        () => {
          checkFlag = false;
          doneCallback();
        },
        () => {
          checkFlag = true;
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        '405'
      );
    });
  });

  describe('File Template Creation Routines', () => {

    test('creates a JavaScript template for an available challenge ID', (doneCallback) => {
      let outcome;
      const expectedOutcome = 
        '// Problem 1\n' +
        '// =========\n' +
        '// \n' +
        '// If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        '// we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '// \n' +
        '// Find the sum of all the multiples of 3 or 5 below 1000.\n\n\n\n' +
        '// TODO: return your answer for this prompt.\n' +
        'return /* solution */;\n';

      contentBuilder.file(
        (content) => {
          outcome = content;
          expect(outcome).toEqual(expectedOutcome);
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        },
        'js',
        '001'
      );
    });

    test('produces a CoffeeScript template for an available challenge ID', (doneCallback) => {
      let outcome;
      const expectedOutcome = 
        '# Problem 1\n' +
        '# =========\n' +
        '# \n' +
        '# If we list all the natural numbers below 10 that are multiples of 3 or 5,\n' +
        '# we get 3, 5, 6 and 9. The sum of these multiples is 23.\n' +
        '# \n' +
        '# Find the sum of all the multiples of 3 or 5 below 1000.\n\n\n\n' +
        '# TODO: return your answer for this prompt.\n' +
        'return # solution\n';

      contentBuilder.file(
        (content) => {
          outcome = content;
          expect(outcome).toEqual(expectedOutcome);
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        },
        'coffee',
        '001'
      );
    });

    test('fails gracefully for template requests below minimum ID', (doneCallback) => {
      let checkFlag = true;

      contentBuilder.file(
        () => {
          checkFlag = false;
          doneCallback();
        },
        () => {
          checkFlag = true;
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        'coffee',
        challengeLimits.lowerBound
      );
    });
  
    test('fails gracefully for template requests above maximum ID', (doneCallback) => {
      let checkFlag = true;

      contentBuilder.file(
        () => {
          checkFlag = false;
          doneCallback();
        },
        () => {
          checkFlag = true;
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        'coffee',
        challengeLimits.upperBound
      );
    });
  });
});

describe('ProofChecker Module', () => {

  const challengeSpace = './dev_challenges';

  afterEach(() => {
    const currentEntries = nodeIO.readdirSync('.');
    for (const entryPath of currentEntries) {
      nodeIO.unlinkSync(entryPath);
    }
    process.chdir('..');
    nodeIO.rmdirSync(challengeSpace);
  });

  describe('Single Solution Validation Checks', () => {

    beforeEach(() => {
      nodeIO.mkdirSync(challengeSpace);
      process.chdir(challengeSpace);
  
      const noOp = function() {};
      
      contentBuilder.file(noOp, noOp, 'js', '001');
      contentBuilder.file(noOp, noOp, 'coffee', '001');
    });

    test('verifies a JavaScript response against its expected outcome', (doneCallback) => {
      let checkFlag = true;

      proofChecker.one(
        (responseVal, expectedResult, challengeId, duration) => {
          checkFlag = checkFlag &&
                      (responseVal === 'undefined') && 
                      (expectedResult === '233168') && 
                      (challengeId === '001');
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        () => {
          checkFlag = false;
          expect(checkFlag).toBeFalsy();
          doneCallback();
        },
        'js',
        '001'
      );
    });

    test('validates a CoffeeScript response against its correct outcome', (doneCallback) => {
      let checkFlag = true;

      proofChecker.one(
        (responseVal, expectedResult, challengeId) => {
          checkFlag = checkFlag &&
                      (responseVal === 'undefined') && 
                      (expectedResult === '233168') && 
                      (challengeId === '001');
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        () => {
          checkFlag = false;
          expect(checkFlag).toBeFalsy();
          doneCallback();
        },
        'coffee',
        '001'
      );
    });

    test('activates error callback if no matching solution is found', (doneCallback) => {
      let checkFlag = true;

      proofChecker.one(
        () => {
          checkFlag = false;
          expect(checkFlag).toBeFalsy();
          doneCallback();
        },
        () => {
          checkFlag = true;
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        'coffee',
        answerBounds.maxVal
      );
    });

    test('engages error callback when the target file is absent', (doneCallback) => {
      let checkFlag = true;

      nodeIO.unlinkSync('euler_001.coffee');

      proofChecker.one(
        () => {
          checkFlag = false;
          expect(checkFlag).toBeFalsy();
          doneCallback();
        },
        () => {
          checkFlag = true;
          expect(checkFlag).toBeTruthy();
          doneCallback();
        },
        'coffee',
        '001'
      );
    });
  });

  describe('Comprehensive Solution Validation', () => {

    beforeEach(() => {
      jest.setTimeout(30000);
      nodeIO.mkdirSync(challengeSpace);
      process.chdir(challengeSpace);
  
      const noOp = function() {};
      const numPad = '000';
      
      for (let k = 1; k <= 266; k++) {
        contentBuilder.file(noOp, noOp, 'js', (numPad + k).slice(-numPad.length));
        contentBuilder.file(noOp, noOp, 'coffee', (numPad + k).slice(-numPad.length));
      }
    });

    test('performs bulk validation for all JavaScript responses', async () => {
      const validationResults = await new Promise((resolve, reject) => {
        proofChecker.all(
          (res) => resolve(res),
          () => reject(new Error('JS bulk validation failed')),
          'js'
        );
      });

      expect(validationResults).toBeDefined();
      const checkPromises = [];
      const zeroPadding = '000';

      for (let iterationIndex = 0; iterationIndex < validationResults.length; iterationIndex++) {
        const formattedId = (zeroPadding + iterationIndex).slice(-zeroPadding.length);
        const currentValidationEntry = validationResults[formattedId];
        expect(currentValidationEntry[0]).toBe('undefined');

        checkPromises.push(new Promise((resolveInner, rejectInner) => {
          dataAccessor.solution(
            (correctAnswer) => {
              expect(currentValidationEntry[1]).toBe(correctAnswer);
              resolveInner();
            },
            () => rejectInner(new Error(`Failed to retrieve JS solution for ${formattedId}`)),
            formattedId
          );
        }));
      }
      await Promise.all(checkPromises);
    });

    test('performs bulk validation for all CoffeeScript responses', async () => {
      const validationResults = await new Promise((resolve, reject) => {
        proofChecker.all(
          (res) => resolve(res),
          () => reject(new Error('CoffeeScript bulk validation failed')),
          'coffee'
        );
      });

      expect(validationResults).toBeDefined();
      const checkPromises = [];
      const zeroPadding = '000';

      for (let iterationIndex = 0; iterationIndex < validationResults.length; iterationIndex++) {
        const formattedId = (zeroPadding + iterationIndex).slice(-zeroPadding.length);
        const currentValidationEntry = validationResults[formattedId];
        expect(currentValidationEntry[0]).toBe('undefined');

        checkPromises.push(new Promise((resolveInner, rejectInner) => {
          dataAccessor.solution(
            (correctAnswer) => {
              expect(currentValidationEntry[1]).toBe(correctAnswer);
              resolveInner();
            },
            () => rejectInner(new Error(`Failed to retrieve CoffeeScript solution for ${formattedId}`)),
            formattedId
          );
        }));
      }
      await Promise.all(checkPromises);
    });

    test('executes complete validation for all available responses', async () => {
      const validationResults = await new Promise((resolve, reject) => {
        proofChecker.all(
          (res) => resolve(res),
          () => reject(new Error('All bulk validation failed'))
        );
      });

      expect(validationResults).toBeDefined();
      const checkPromises = [];
      const zeroPadding = '000';

      for (let iterationIndex = 0; iterationIndex < validationResults.length; iterationIndex++) {
        const formattedId = (zeroPadding + iterationIndex).slice(-zeroPadding.length);
        const currentValidationEntry = validationResults[formattedId];
        expect(currentValidationEntry[0]).toBe('undefined');

        checkPromises.push(new Promise((resolveInner, rejectInner) => {
          dataAccessor.solution(
            (correctAnswer) => {
              expect(currentValidationEntry[1]).toBe(correctAnswer);
              resolveInner();
            },
            () => rejectInner(new Error(`Failed to retrieve solution for ${formattedId}`)),
            formattedId
          );
        }));
      }
      await Promise.all(checkPromises);
    });
  });
});

describe('ResourceSearcher Module', () => {

  const challengeSpace = './dev_challenges';

  afterEach(() => {
    const currentEntries = nodeIO.readdirSync('.');
    for (const entryPath of currentEntries) {
      nodeIO.unlinkSync(entryPath);
    }
    process.chdir('..');
    nodeIO.rmdirSync(challengeSpace);
  });

  describe('Highest Problem Number Discovery', () => {

    beforeEach(() => {
      nodeIO.mkdirSync(challengeSpace);
      process.chdir(challengeSpace);
    
      const noOp = function() {};
      
      contentBuilder.file(noOp, noOp, 'js', '115');
      contentBuilder.file(noOp, noOp, 'coffee', '266');
    });

    test('identifies the highest numbered solution file', (doneCallback) => {
      let foundNumber;

      resourceSearcher.highest(
        (num) => {
          foundNumber = num;
          expect(foundNumber).toEqual('266');
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        }
      );
    });

    test('locates the highest numbered CoffeeScript solution file', (doneCallback) => {
      let foundNumber;

      resourceSearcher.highest(
        (num) => {
          foundNumber = num;
          expect(foundNumber).toEqual('266');
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        },
        'coffee'
      );
    });

    test('determines the highest numbered JavaScript solution file', (doneCallback) => {
      let foundNumber;

      resourceSearcher.highest(
        (num) => {
          foundNumber = num;
          expect(foundNumber).toEqual('115');
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        },
        'js'
      );
    });

    test('yields \'000\' if no solution files are present', (doneCallback) => {
      const cleanupEntries = nodeIO.readdirSync('.');
      for (const entryPath of cleanupEntries) {
        nodeIO.unlinkSync(entryPath);
      }

      let foundNumber;
      resourceSearcher.highest(
        (num) => {
          foundNumber = num;
          expect(foundNumber).toEqual('000');
          doneCallback();
        },
        () => {
          expect(true).toBeFalsy();
          doneCallback();
        }
      );
    });
  });

  describe('All Resource Listing Procedures', () => {

    beforeEach(() => {
      jest.setTimeout(30000);
      nodeIO.mkdirSync(challengeSpace);
      process.chdir(challengeSpace);
  
      const noOp = function() {};
      const numPad = '000';
      
      for (let k = 1; k <= 266; k++) {
        contentBuilder.file(noOp, noOp, 'js', (numPad + k).slice(-numPad.length));
        contentBuilder.file(noOp, noOp, 'coffee', (numPad + k).slice(-numPad.length));
      }
    });

    test('delivers a collection of all JavaScript solution files', () => {
      const fileListing = resourceSearcher.all('js');
      expect(fileListing).toHaveLength(266);
    });

    test('delivers a collection of all CoffeeScript solution files', () => {
      const fileListing = resourceSearcher.all('coffee');
      expect(fileListing).toHaveLength(266);
    });

    test('provides a collection of all solution files', () => {
      const fileListing = resourceSearcher.all();
      expect(fileListing).toHaveLength(266 * 2);
    });

    test('returns a specific set of solution files for a given ID', () => {
      const fileListing = resourceSearcher.all(undefined, '001');
      expect(fileListing).toHaveLength(2);
    });

    test('produces an array with only a designated JavaScript file', () => {
      const fileListing = resourceSearcher.all('js', '001');
      expect(fileListing[0]).toEqual('euler_001.js');
      expect(fileListing).toHaveLength(1);
    });

    test('produces an array with only a designated CoffeeScript file', () => {
      const fileListing = resourceSearcher.all('coffee', '001');
      expect(fileListing[0]).toEqual('euler_001.coffee');
      expect(fileListing).toHaveLength(1);
    });

    test('provides an empty collection when no solution files are found', () => {
      const cleanupEntries = nodeIO.readdirSync('.');
      for (const entryPath of cleanupEntries) {
        nodeIO.unlinkSync(entryPath);
      }

      const fileListing = resourceSearcher.all();
      expect(fileListing).toHaveLength(0);
    });
  });
});

describe('dataAccessor Module', () => {
});