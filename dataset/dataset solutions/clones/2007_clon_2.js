const globalScope = global;

const moduleLoader = globalScope.require;

const customLogger = {
  printMessage: function(...messages) {
    globalScope.console.log(...messages);
  }
};

const findSmallest = globalScope.Math.min;
const computeAbsolute = globalScope.Math.abs;

const systemIO = {
  readDataSynchronously: function(filePath, encodingFormat) {
    return moduleLoader("fs").readFileSync(filePath, encodingFormat);
  }
};

const numericTransformer = globalScope.Number;

Object.defineProperty(String.prototype, 'segmentByDelimiter', {
  value: ''.constructor.prototype.split,
  writable: true,
  configurable: true
});

Object.defineProperty(Array.prototype, 'transformElements', {
  value: [].constructor.prototype.map,
  writable: true,
  configurable: true
});

// Retrieve the raw textual content from the designated input stream.
const   initialContent   =   systemIO.readDataSynchronously (   "/dev/stdin"   ,   "utf8"   )   ;

// Break down the raw content into an array of individual textual rows.
const   textRows   =   initialContent.segmentByDelimiter (   '\n'   )   ;

// Extract and convert two numerical parameters from the first processed row.
// These parameters are separated by a space character.
const   [   firstValue   ,   secondValue   ]   =   textRows[0]
  .segmentByDelimiter (   ' '   )
  .transformElements (   numericTransformer   )   ;

// Display the parsed numerical values to the output stream for verification.
customLogger.printMessage (   firstValue   ,   secondValue   )   ;

// Calculate the primary remainder of the division operation.
let   computedRemainder   =   firstValue   %   secondValue   ;

// Adjust the remainder: determine the minimum between the current remainder
// and the absolute difference of the remainder and the second value.
computedRemainder   =   findSmallest (   computedRemainder   ,   computeAbsolute (   computedRemainder   -   secondValue   )   )   ;

// Output the final, adjusted remainder value.
customLogger.printMessage (   computedRemainder   )   ;