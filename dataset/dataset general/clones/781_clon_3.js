let globalComponentIndex = 0; // Renamed from numLayers, tracking overall component count

/**
 * A dummy external function to simulate the original 'addLayer'.
 * In a real application, this would contain the actual logic for visual integration.
 * @param {File} descriptor - The original file object descriptor.
 * @param {object} payload - The parsed JSON data payload.
 * @param {number} index - The unique identifier for this component.
 */
function integrateVisualComponent(descriptor, payload, index) {
  // This is a placeholder for the original 'addLayer' functionality.
  // We can add some console output to show it's being called and demonstrate Type III additions.
  console.log(`[Integration Service] Component '${descriptor.name || 'Unnamed'}' (Index: ${index}) received for visual integration.`);
  if (payload && typeof payload === 'object') {
    // Add a new fragment: conditional logging based on payload content
    console.log(`[Integration Service] Payload sample: ${JSON.stringify(payload).substring(0, 50)}...`);
    if ('type' in payload && payload.type === 'complex_chart') {
      console.log('[Integration Service] Performing complex rendering logic for chart component...');
    }
  } else {
    console.warn('[Integration Service] Received invalid payload for integration.');
  }
}

/**
 * Orchestrates the processing of a collection of document sources.
 * This function initiates the ingestion and parsing for each source in the provided array.
 * @param {File[]} sourceCollection - An array of File objects to be processed.
 */
function processDocumentSources(sourceCollection) {
  // Guard clause: Ensure a valid collection is provided before proceeding.
  if (!Array.isArray(sourceCollection) || sourceCollection.length === 0) {
    console.warn("Input source collection is empty or invalid. No documents to process at this time.");
    return; // Early exit to prevent errors
  }

  // Introduce a helper variable for tracking the batch processing.
  const processingBatchIdentifier = Date.now();
  console.log(`[Batch ${processingBatchIdentifier}] Initiating processing for ${sourceCollection.length} document sources.`);

  // Rewrite loop: Using a modern for...of loop for iterating over the collection.
  for (const currentInputItem of sourceCollection) {
    // Add an intermediate variable for better logging context.
    const originalItemName = currentInputItem ? (currentInputItem.name || 'Unnamed Source') : 'Invalid Source Item';
    console.log(`[Batch ${processingBatchIdentifier}] Attempting to ingest data from: ${originalItemName}`);

    // Call the renamed and refactored function for single unit processing.
    ingestAndProcessDataUnit(currentInputItem);
  }

  // Add a new logging fragment to indicate completion of the queuing process.
  console.log(`[Batch ${processingBatchIdentifier}] Finished queuing all document sources for ingestion.`);
}

/**
 * Handles the ingestion, parsing, and integration of a single data unit (e.g., a File object).
 * This function reads the file content, parses it as JSON, and then passes it for integration.
 * @param {File} dataUnitDescriptor - The individual File object to be processed.
 */
function ingestAndProcessDataUnit(dataUnitDescriptor) {
  // Guard clause: Validate the incoming data unit descriptor.
  if (!dataUnitDescriptor || typeof dataUnitDescriptor.type === 'undefined' || typeof dataUnitDescriptor.size === 'undefined') {
    console.error("Invalid data unit descriptor provided. Skipping ingestion for this item.");
    return;
  }

  // Introduce a new constant for the text encoding standard.
  const textEncodingStandard = 'UTF-8';

  // Instantiate a new file content decoder (renamed from 'reader').
  const fileContentDecoder = new FileReader();

  // Add robust error handling for the file reader operation.
  fileContentDecoder.onerror = (errorEvent) => {
    console.error(`Error encountered while decoding '${dataUnitDescriptor.name || 'unknown'}'`, errorEvent);
    // New fragment: Optionally, trigger a UI notification or a fallback mechanism.
    // displayUserMessage(`Failed to read file: ${dataUnitDescriptor.name}. Please try again.`, 'error');
  };

  // Define the behavior once the file content has been loaded.
  fileContentDecoder.onload = function(loadEvent) {
    let rawTextContent = null;
    let parsedDataObject = null;

    try {
      // Access the raw result from the event target, not directly from the reader instance for clarity.
      rawTextContent = loadEvent.target.result;

      // Add a validation: Check if the file content is substantial before attempting JSON parsing.
      if (!rawTextContent || rawTextContent.trim().length === 0) {
          console.warn(`File '${dataUnitDescriptor.name || 'unknown'}' was empty or contained only whitespace. Skipping JSON parsing.`);
          return; // Early exit if no content to parse
      }

      // Update: Wrap JSON parsing in a try...catch block for robust error management.
      parsedDataObject = JSON.parse(rawTextContent);

      // Add another validation: Check if the parsed object has expected properties.
      // This is a new fragment for data integrity check.
      if (typeof parsedDataObject !== 'object' || parsedDataObject === null || !('id' in parsedDataObject) || !('data' in parsedDataObject)) {
          console.warn(`Parsed data from '${dataUnitDescriptor.name || 'unknown'}' is not a valid object or missing required 'id'/'data' properties. Skipping integration.`);
          // New fragment: Log the problematic data for debugging.
          // console.debug("Problematic parsed data:", parsedDataObject);
          return;
      }

      // Update: Pre-increment the global counter before passing it to the integration function.
      // This ensures the index passed is the *next* available unique identifier.
      const currentComponentIdentifier = ++globalComponentIndex;

      // Call the external integration function with the parsed data.
      integrateVisualComponent(dataUnitDescriptor, parsedDataObject, currentComponentIdentifier);

      console.log(`Successfully integrated component '${dataUnitDescriptor.name || 'unknown'}' with ID: ${currentComponentIdentifier}.`);

    } catch (parseError) {
      console.error(`Failed to parse JSON content from '${dataUnitDescriptor.name || 'unknown'}':`, parseError.message);
      // New fragment: Provide more context for parsing failures.
      // console.debug("Raw content that failed to parse (first 200 chars):", rawTextContent ? rawTextContent.substring(0, 200) : '[Empty/Null]');
    }
  };

  // Initiate reading the data unit as text using the specified encoding.
  fileContentDecoder.readAsText(dataUnitDescriptor, textEncodingStandard);
}