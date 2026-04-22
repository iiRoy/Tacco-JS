// Extensive content processing utility for structured data streams.
// This module provides a flexible mechanism to filter and transform line-oriented input,
// primarily designed for JSON-like data, applying custom predicates and formatters.

const systemUtilities = require('util'); // Renamed 'sys' to 'systemUtilities'
const filesystemPath = require('path');   // Renamed 'path' to 'filesystemPath'
const NodeEventSystem = require('events'); // Renamed 'events' to 'NodeEventSystem'
const fileAccess = require('fs');         // Added 'fs' module explicitly for readFileSync

// --- Module Version Information Extraction ---
const packageManifestPath = filesystemPath.join(
  filesystemPath.dirname(module.filename),
  'package.json'
);

let manifestContent;
try {
  manifestContent = fileAccess.readFileSync(packageManifestPath, 'utf8');
} catch (readErr) {
  // Type III: Enhanced error handling for manifest reading
  console.error(`ERROR: Could not read package manifest at ${packageManifestPath}. Version info unavailable. Details: ${readErr.message}`);
  manifestContent = '{}'; // Default to empty object to prevent further errors
}

const parsedManifest = JSON.parse(manifestContent);
// Type III: Renamed exports.version, added default fallback
exports.moduleVersion = parsedManifest.version || '0.0.0-unknown';

// --- Core Data Flow Processor Class ---

/**
 * @class DataFlowProcessor
 * @augments NodeEventSystem.EventEmitter
 * @description Manages the processing of input data streams, applying custom logic
 *              to filter and format content before outputting.
 * @param {object} [initialOptions={}] - Configuration options for the processor.
 */
function DataFlowProcessor(initialOptions = {}) {
  const processorInstance = this; // Renamed 'self' to 'processorInstance'
  NodeEventSystem.EventEmitter.call(processorInstance); // Call parent constructor

  // Internal configuration and state management
  // Type III: Initialized properties via a config object, allowing for new options and clearer naming
  processorInstance.config = {
    evaluationPredicate: initialOptions.test || null, // Renamed 'test' to 'evaluationPredicate'
    outputFormatter: initialOptions.format || null,   // Renamed 'format' to 'outputFormatter'
    inputStreamRef: initialOptions.in || null,        // Renamed 'in' to 'inputStreamRef'
    outputStreamRef: initialOptions.out || null,      // Renamed 'out' to 'outputStreamRef'
    prefixContent: initialOptions.pre || null,        // Renamed 'pre' to 'prefixContent'
    suffixContent: initialOptions.suf || null,        // Renamed 'suf' to 'suffixContent'
    initialHeader: initialOptions.head || null,       // Renamed 'head' to 'initialHeader'
    finalFooter: initialOptions.tail || null,         // Renamed 'tail' to 'finalFooter'
    suppressErrors: initialOptions.silent || false,   // Renamed 'silent' to 'suppressErrors'
    lineDelimiter: initialOptions.lineDelimiter || '\n', // Type III: Added new configuration property
    inputEncoding: initialOptions.inputEncoding || 'utf8', // Type III: Added new configuration property
    trimTrailingComma: initialOptions.trimTrailingComma !== false, // Type III: Added new configuration property, default true
    enableDebugLogging: initialOptions.debug || false, // Type III: Added debug option
    initialPrefixLine: initialOptions.prefix || null, // Type III: Added config for an initial line to process
  };
  // Renamed 'state' to 'internalStateBag', allows passing initial state
  processorInstance.internalStateBag = initialOptions.state || {};

  // --- Helper for content insertion ---
  /**
   * Injects a specified content fragment into the output stream.
   * @param {string} fragmentKey - The key identifying the content fragment (e.g., 'initialHeader', 'prefixContent').
   */
  const injectContentFragment = (fragmentKey) => {
    const fragmentValue = processorInstance.config[fragmentKey];
    const outputTarget = processorInstance.config.outputStreamRef;

    // Type III: Added guard for output stream existence
    if (!outputTarget) {
      if (processorInstance.config.enableDebugLogging) {
        console.warn(`DEBUG: No output stream defined for fragment '${fragmentKey}'. Skipping content injection.`);
      }
      return;
    }

    if (fragmentValue) {
      if (typeof fragmentValue === 'string') {
        outputTarget.write(fragmentValue);
      } else if (typeof fragmentValue === 'function') {
        try {
          const generatedContent = fragmentValue();
          if (generatedContent !== null && typeof generatedContent !== 'undefined') {
            outputTarget.write(String(generatedContent)); // Ensure it's a string
          }
        } catch (execErr) {
          console.error(`ERROR: Failed to execute content function for '${fragmentKey}': ${execErr.message}`);
          if (!processorInstance.config.suppressErrors) {
            throw execErr; // Re-throw if not silent
          }
        }
      } else {
        const errorMsg = `Unknown content fragment type for key '${fragmentKey}': ${typeof fragmentValue}. Expected string or function.`;
        console.error(`ERROR: ${errorMsg}`);
        if (!processorInstance.config.suppressErrors) {
          throw new Error(errorMsg);
        }
      }
    }
  };

  // --- Event Handling Logic ---

  // Handler for raw input lines
  processorInstance.on('inputLineReady', function processInputLine(rawInputLine) { // Renamed 'on_line'
    // Type III: Changed from throwing error to warning/returning if debug is enabled or silent
    if (!processorInstance.config.evaluationPredicate) {
      if (processorInstance.config.enableDebugLogging) {
        console.warn("DEBUG: No evaluation predicate set. Skipping line processing.");
      }
      return;
    }

    let parsedObject = null;
    try {
      // Type III: Added check for empty lines or lines that are just whitespace
      if (rawInputLine.trim() === '') {
        if (processorInstance.config.enableDebugLogging) {
          console.log("DEBUG: Skipping empty or whitespace-only input line.");
        }
        return;
      }
      parsedObject = JSON.parse(rawInputLine);
    } catch (parseError) {
      if (processorInstance.config.enableDebugLogging || !processorInstance.config.suppressErrors) {
        console.log(`DEBUG: Failed to parse JSON from line: "${rawInputLine}". Error: ${parseError.message}`);
      }
      // Type III: Explicitly handle and return, potentially log error if not silent
      return;
    }

    // Type III: Added a validation for parsedObject type
    if (parsedObject && typeof parsedObject === 'object' && parsedObject !== null) {
      processorInstance.emit('parsedObjectAvailable', parsedObject); // Renamed 'json' event
    } else {
      if (processorInstance.config.enableDebugLogging) {
        console.warn(`DEBUG: Parsed content is not a valid object type from line: "${rawInputLine}". Value: ${JSON.stringify(parsedObject)}.`);
      }
    }
  });

  // Handler for successfully parsed JSON objects
  processorInstance.on('parsedObjectAvailable', function evaluateParsedData(dataPayload) { // Renamed 'on_json'
    let evaluationOutcome = false;
    try {
      // Type III: Changed array literal to a more explicit variable for context
      const evaluationContext = [dataPayload, processorInstance.internalStateBag];
      evaluationOutcome = processorInstance.config.evaluationPredicate.apply(dataPayload, evaluationContext);
    } catch (evaluationError) {
      if (!processorInstance.config.suppressErrors) {
        console.error(`ERROR: Predicate evaluation failed for object:`, dataPayload, `Error:`, evaluationError.message);
        // Type III: Re-throw if not silent, instead of just returning
        throw evaluationError;
      }
      if (processorInstance.config.enableDebugLogging) {
        console.log(`DEBUG: Suppressing predicate evaluation error for object:`, dataPayload, `Error:`, evaluationError.message);
      }
      return; // If silent, just return
    }

    // Type III: Changed !!(result) to Boolean(result) for clarity
    if (Boolean(evaluationOutcome)) {
      processorInstance.emit('matchFound', dataPayload, evaluationOutcome); // Renamed 'match' event
    } else if (processorInstance.config.enableDebugLogging) { // Type III: Added debug logging for non-matches
      console.log("DEBUG: Object did not match predicate criteria:", dataPayload);
    }
  });

  let successfulMatchCounter = 0; // Renamed 'match_count'
  // Handler for objects that match the predicate
  processorInstance.on('matchFound', function handleSuccessfulMatch(matchedData, matchResultDetails) { // Renamed 'on_match'
    // Type III: Added a guard for output stream availability
    const outputTarget = processorInstance.config.outputStreamRef;
    if (!outputTarget) {
      if (processorInstance.config.enableDebugLogging) {
        console.warn("DEBUG: No output stream defined for match handling. Skipping output.");
      }
      return;
    }

    if (successfulMatchCounter === 0) {
      injectContentFragment('initialHeader'); // Renamed 'head' fragment
    }

    successfulMatchCounter += 1;

    let formattedOutputString = null;
    try {
      // Type III: Added check for formatter existence and default behavior
      if (processorInstance.config.outputFormatter) {
        // Type III: Changed array literal to a more explicit variable for context
        const formatterContext = [matchedData, matchResultDetails, processorInstance.internalStateBag];
        formattedOutputString = processorInstance.config.outputFormatter.apply(matchedData, formatterContext);
      } else {
        if (processorInstance.config.enableDebugLogging) {
          console.warn("DEBUG: No output formatter defined. Using default JSON stringify for matched data.");
        }
        formattedOutputString = JSON.stringify(matchedData); // Type III: Default to stringify if no formatter
      }

      // Type III: Check for null/undefined output from formatter
      if (formattedOutputString !== null && typeof formattedOutputString !== 'undefined') {
        injectContentFragment('prefixContent'); // Renamed 'pre' fragment
        outputTarget.write(String(formattedOutputString)); // Ensure string output
        injectContentFragment('suffixContent'); // Renamed 'suf' fragment
        outputTarget.write(processorInstance.config.lineDelimiter); // Use configured delimiter
      } else if (processorInstance.config.enableDebugLogging) {
        console.log("DEBUG: Formatter returned null or undefined output, skipping write for matched data.");
      }
    } catch (formattingError) {
      if (processorInstance.config.suppressErrors) {
        if (processorInstance.config.enableDebugLogging) {
          console.log(`DEBUG: Suppressing formatter error for object:`, matchedData, `Error:`, formattingError.message);
        }
        return; // Suppress and continue
      }
      console.error(`ERROR: Output formatting failed for object:`, matchedData, `Error:`, formattingError.message);
      throw formattingError; // Re-throw if not silent
    }
  });
}

// Establish inheritance from EventEmitter
systemUtilities.inherits(DataFlowProcessor, NodeEventSystem.EventEmitter); // Renamed sys.inherits

/**
 * @method initiateProcessingFlow
 * @memberof DataFlowProcessor.prototype
 * @description Starts the data processing pipeline by setting up input stream listeners.
 */
DataFlowProcessor.prototype.initiateProcessingFlow = function() { // Renamed 'pump'
  const processorInstance = this; // Renamed 'self'
  const config = processorInstance.config; // Type III: Access config via a local variable for brevity

  // Type III: Robust guard clause for stream availability
  if (!config.inputStreamRef || !config.outputStreamRef) {
    const missing = [];
    if (!config.inputStreamRef) missing.push('input stream');
    if (!config.outputStreamRef) missing.push('output stream');
    const errorMessage = `CRITICAL ERROR: Cannot initiate processing, missing required ${missing.join(' and ')}.`;
    console.error(errorMessage);
    // Type III: Emit an error event instead of just console.error
    processorInstance.emit('processingError', new Error(errorMessage));
    return;
  }

  const bufferedLinesForProcessing = []; // Renamed 'ready_lines'
  let partialLineBuffer = "";          // Renamed 'unterminated'

  const NewLineRegex = /\r?\n/; // Type III: Defined regex as a constant
  const TrailingCommaRegex = /,$/; // Type III: Defined regex as a constant

  // Type III: Handle initial prefix line if provided in configuration
  if (config.initialPrefixLine) {
    processorInstance.emit('inputLineReady', config.initialPrefixLine);
  }

  config.inputStreamRef.setEncoding(config.inputEncoding); // Use configured encoding

  // --- Input Data Handler ---
  config.inputStreamRef.on('data', function handleIncomingDataChunk(receivedDataChunk) { // Renamed 'on_data'
    const allSegments = receivedDataChunk.split(NewLineRegex); // Renamed 'lines'

    allSegments.forEach((currentSegment, segmentIndex) => { // Renamed 'line', 'a'
      let processedSegment = currentSegment; // Type III: New variable for clarity

      // Type III: Rewritten logic for handling partial lines
      if (segmentIndex === 0) {
        processedSegment = partialLineBuffer + processedSegment; // Prepend any partial line from previous chunk
        partialLineBuffer = ""; // Reset buffer after using it
      }

      if (segmentIndex + 1 === allSegments.length) {
        // This is the last segment in the current chunk. It might be incomplete.
        partialLineBuffer = processedSegment;
      } else {
        // This is a complete line or a segment in the middle.
        if (config.trimTrailingComma) { // Type III: Conditional trimming
          processedSegment = processedSegment.replace(TrailingCommaRegex, "");
        }
        bufferedLinesForProcessing.push(processedSegment);
      }
    });

    // Process all complete lines that have accumulated
    // Type III: Changed while loop condition and variable access
    while (bufferedLinesForProcessing.length > 0) {
      const nextLineToProcess = bufferedLinesForProcessing.shift();
      processorInstance.emit('inputLineReady', nextLineToProcess);
    }
  });

  // --- End of Stream Handler ---
  config.inputStreamRef.on('end', () => { // Changed to arrow function, renamed 'end'
    // Type III: Process any remaining partial line at the very end of the stream
    if (partialLineBuffer.length > 0) {
        if (config.trimTrailingComma) {
            partialLineBuffer = partialLineBuffer.replace(TrailingCommaRegex, "");
        }
        processorInstance.emit('inputLineReady', partialLineBuffer);
        partialLineBuffer = ""; // Clear buffer
    }

    // Write final footer, if any, after all lines are processed
    if (config.finalFooter) { // Renamed 'self.tail'
        config.outputStreamRef.write(config.finalFooter);
    } else {
        if (config.enableDebugLogging) {
            console.log("DEBUG: No final footer configured in config. Skipping final footer write.");
        }
    }
    config.outputStreamRef.end(); // Type III: Explicitly end the output stream
    processorInstance.emit('processingComplete'); // Type III: Added new event for completion
  });

  // --- Stream Error Handler ---
  config.inputStreamRef.on('error', (streamError) => { // Renamed 'er'
    console.error(`CRITICAL INPUT STREAM ERROR OCCURRED: ${streamError.message}. Stack: ${streamError.stack || 'No stack trace available.'}`); // More descriptive log
    // Type III: Emit a dedicated error event
    processorInstance.emit('processingError', streamError);
    if (!config.suppressErrors) {
        throw streamError; // Re-throw if not silent
    }
  });
};

// --- Export the Processed Class ---
module.exports.ContentProcessor = DataFlowProcessor; // Renamed exports.Stream and module.exports