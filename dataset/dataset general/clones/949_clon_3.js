const fileSystemManager = require('fs').promises;
const pathUtilities = require('path');
const utilityHelpers = require('util');
const markupProcessor = require('xml2js');
const textRenderer = require('handlebars');
const { createReadStream, createWriteStream } = require('fs'); // For stream operations

// --- Section 1: Initial Setup and License Transfer ---

// Define source and destination paths for the license file.
const sourceLicensePath = 'LICENSE';
const destinationLicensePath = 'BootstrapSnippets/LICENSE.txt';

// Log the initiation of the license file copy.
console.log(`Initiating license file transfer from '${sourceLicensePath}' to '${destinationLicensePath}'...`);

// Perform the license file copy using streams.
createReadStream(sourceLicensePath)
    .pipe(createWriteStream(destinationLicensePath))
    .on('finish', () => console.log('License file copied successfully to target location.'))
    .on('error', (issue) => console.error('Error encountered during license file transfer:', issue));

// --- Section 2: XML Parser Configuration ---

// Define configuration options for the XML parser.
const xmlParserOptions = {
    async: true,            // Enable asynchronous parsing.
    explicitRoot: false,    // Do not create a separate root element.
    explicitArray: false,   // Always treat child nodes as single objects if possible.
    ignoreAttrs: false      // Keep XML attributes in the parsed output.
};

// Instantiate the XML parser with the defined options.
const xmlContentParser = new markupProcessor.Parser(xmlParserOptions);

// --- Section 3: Core Snippet Processing Logic (Async/Await) ---

// Define the base directory where snippet files are located.
const baseSnippetDirectory = pathUtilities.join(__dirname, 'BootstrapSnippets', 'Snippets', 'HTML', 'Bootstrap');
const snippetFileExtension = '.snippet'; // The expected file extension for snippet definitions.

/**
 * Filters an array of file names to include only those with the specified snippet extension.
 * @param {string[]} allFiles - An array of all file names in a directory.
 * @returns {string[]} An array containing only the relevant snippet file names.
 */
const identifySnippetFiles = (allFiles) => allFiles.filter(item => pathUtilities.extname(item) === snippetFileExtension);

/**
 * Processes a single XML snippet file, extracts relevant data, and returns a structured object.
 * Handles potential parsing errors and missing data gracefully.
 * @param {string} fullFilePath - The complete path to the snippet file.
 * @param {string} currentFileName - The name of the snippet file.
 * @returns {Promise<object|null>} A promise that resolves to a structured snippet object or null if processing fails.
 */
const processSingleSnippet = async (fullFilePath, currentFileName) => {
    try {
        // Read the raw XML content from the file.
        const rawXmlContent = await fileSystemManager.readFile(fullFilePath, 'utf8');

        // Parse the XML content into a JavaScript object.
        const parsedFragmentData = await xmlContentParser.parseStringPromise(rawXmlContent);

        // --- Data Validation and Extraction ---
        // Basic validation for the expected structure of the parsed XML.
        if (!parsedFragmentData || !parsedFragmentData.CodeSnippet || !parsedFragmentData.CodeSnippet.Header || !parsedFragmentData.CodeSnippet.Snippet) {
            console.warn(`Skipping malformed or incomplete snippet file: ${currentFileName}.`);
            return null; // Return null for invalid structures.
        }

        // Construct the core fragment object, providing default values for missing fields.
        const currentFragment = {
            sourceFile: currentFileName,
            displayTitle: parsedFragmentData.CodeSnippet.Header.Title || 'Untitled Snippet',
            triggerKey: parsedFragmentData.CodeSnippet.Header.Shortcut || 'N/A',
            briefDescription: parsedFragmentData.CodeSnippet.Header.Description || 'No description available for this snippet.',
            codeLanguage: parsedFragmentData.CodeSnippet.Snippet.Code?.['$']?.Language || 'plaintext',
            parameterDefinitions: [] // Initialize array for declarations.
        };

        // Access the literal declarations section of the snippet.
        const literalDeclarations = parsedFragmentData.CodeSnippet.Snippet.Declarations?.Literal;

        // Process declarations if they exist.
        if (literalDeclarations) {
            /**
             * Transforms a raw declaration object into a simplified parameter definition.
             * @param {object} decl - The raw declaration object from XML parsing.
             * @returns {object} A simplified parameter definition object.
             */
            const transformLiteralDeclaration = (decl) => ({
                identifier: decl.ID || 'unknown_id',
                hint: decl.ToolTip || 'No tooltip',
                defaultValue: decl.Default || ''
            });

            // Check if declarations are an array or a single object.
            if (utilityHelpers.isArray(literalDeclarations)) {
                // If an array, map each declaration to the simplified format.
                currentFragment.parameterDefinitions = literalDeclarations.map(transformLiteralDeclaration);
            } else {
                // If a single object, push it to the array after transformation.
                currentFragment.parameterDefinitions.push(transformLiteralDeclaration(literalDeclarations));
            }
        }
        return currentFragment; // Return the successfully processed fragment.

    } catch (issue) {
        // Log any errors encountered during file reading or XML parsing.
        console.error(`Failed to process snippet file '${currentFileName}':`, issue.message);
        return null; // Indicate failure by returning null.
    }
};

/**
 * Orchestrates the entire snippet processing workflow.
 * Reads directory, filters files, processes each snippet, and finalizes the data.
 */
async function executeSnippetProcessingWorkflow() {
    console.log(`Scanning for snippet definition files in: ${baseSnippetDirectory}`);
    try {
        // Read all items (files and directories) within the base snippet directory.
        const allDirectoryItems = await fileSystemManager.readdir(baseSnippetDirectory);

        // Filter the items to get only the relevant snippet files.
        const targetSnippetFiles = identifySnippetFiles(allDirectoryItems);

        // --- Guard Clause: No Snippet Files Found ---
        if (targetSnippetFiles.length === 0) {
            console.warn('No .snippet files were found in the specified directory. Workflow halted.');
            return;
        }

        console.log(`Identified ${targetSnippetFiles.length} relevant snippet files for processing.`);

        // Create an array of promises, each processing a single snippet file concurrently.
        const processingPromises = targetSnippetFiles.map(async (fileName) => {
            const fullPath = pathUtilities.join(baseSnippetDirectory, fileName);
            return await processSingleSnippet(fullPath, fileName);
        });

        // Wait for all snippet processing promises to resolve, then filter out any failed attempts (nulls).
        const processedFragmentCollection = (await Promise.all(processingPromises)).filter(Boolean); // `Boolean` acts as a filter for truthy values.

        // --- Post-Processing Actions ---
        if (processedFragmentCollection.length > 0) {
            console.log(`Successfully processed ${processedFragmentCollection.length} valid snippet definitions.`);
            await finalizeFragmentData(processedFragmentCollection); // Proceed to finalize the data.
        } else {
            console.warn('No valid snippet definitions were successfully processed. Skipping finalization step.');
        }

    } catch (issueObj) {
        // Catch and log any errors that occur during directory reading or the overall workflow.
        console.error('A critical error occurred during snippet directory scanning or processing:', issueObj);
        process.exit(1); // Exit the process with an error code.
    }
}

// Initiate the main workflow.
executeSnippetProcessingWorkflow();

// --- Section 4: Finalization and Output Generation ---

/**
 * Sorts the processed snippet definitions and generates output files (e.g., Markdown).
 * @param {object[]} componentDefinitions - An array of structured snippet definition objects.
 */
async function finalizeFragmentData(componentDefinitions) {
    // --- Guard Clause: Empty Input ---
    if (!Array.isArray(componentDefinitions) || componentDefinitions.length === 0) {
        console.warn('No component definitions provided for finalization. Aborting output generation.');
        return;
    }

    console.log('Sorting component definitions based on their trigger key for consistent ordering...');
    // Sort the definitions alphabetically by their 'triggerKey'.
    componentDefinitions.sort((defA, defB) => {
        const keyOne = defA.triggerKey || ''; // Ensure keys are strings for comparison.
        const keyTwo = defB.triggerKey || '';
        return keyOne.localeCompare(keyTwo); // Use localeCompare for robust string comparison.
    });

    // Define paths for the Handlebars template and the output Markdown file.
    const markdownTemplatePath = "snippet-listing-markdown.handlebars";
    const outputMarkdownPath = "snippet-listing.md";

    try {
        console.log(`Attempting to read the Handlebars template from: ${markdownTemplatePath}`);
        // Read the Handlebars template file content.
        const templateBuffer = await fileSystemManager.readFile(markdownTemplatePath, 'utf8');

        // Compile the template using Handlebars.
        const templateCompiler = textRenderer.compile(templateBuffer);

        // Render the template with the sorted component definitions.
        const renderedMarkdownContent = templateCompiler({ fragmentList: componentDefinitions }); // Pass data under a new key.

        console.log(`Writing the generated markdown output to: ${outputMarkdownPath}`);
        // Write the rendered markdown content to the output file.
        await fileSystemManager.writeFile(outputMarkdownPath, renderedMarkdownContent);
        console.log('Markdown listing successfully generated and saved.');
    } catch (issue) {
        // Log any errors encountered during template reading, compilation, or file writing.
        console.error('An error occurred during markdown generation process:', issue);
        // Depending on criticality, might re-throw or exit here.
    }

    // --- Commented-out HTML generation section (original code also had this commented) ---
    // This section is intentionally left commented as per the original code's state.
    // const htmlOutputFileName = "snippet-listing.html";
    // try {
    //     console.log(`Attempting to render HTML using a hypothetical template engine for ${htmlOutputFileName}...`);
    //     // const generatedHtml = htmlTemplateEngine.renderFile("snippet-listing.jade", { componentDefs: componentDefinitions });
    //     // await fileSystemManager.writeFile(htmlOutputFileName, generatedHtml);
    //     console.log('HTML listing generation logic is currently disabled.');
    // } catch (renderError) {
    //     console.warn('Skipping HTML generation due to an issue (e.g., template engine not configured or template missing):', renderError.message);
    // }
}