const fileSystemUtility = require('fs');
const locationResolver = require('path');

const operationalParameters = {
    sourceGlobExpression: "public/ng/templates/**/*.html",
    outputDirectoryBase: "app/assets/javascripts/compiled_templates",
    angularModuleCreator: "angular.module", // String literal for module creation
    templateCacheKeyPrefix: "/ng/templates/" // Prefix for the template cache key
};

// Function to recursively find files ending with '.html'
function discoverHtmlAssets(searchRoot, pathEvaluationFn) {
    let discoveredPaths = [];
    const directoryEntries = fileSystemUtility.readdirSync(searchRoot, { withFileTypes: true });

    for (const entry of directoryEntries) {
        const absoluteEntryPath = locationResolver.join(searchRoot, entry.name);
        if (entry.isDirectory()) {
            discoveredPaths = discoveredPaths.concat(discoverHtmlAssets(absoluteEntryPath, pathEvaluationFn));
        } else if (entry.isFile() && pathEvaluationFn(absoluteEntryPath)) {
            discoveredPaths.push(absoluteEntryPath);
        }
    }
    return discoveredPaths;
}

// Function to escape HTML content for safe embedding within a JavaScript double-quoted string literal
function prepareContentForJsEmbedding(htmlPayload) {
    // First, escape backslashes to ensure they are treated literally within the JS string
    let intermediateContent = htmlPayload.replace(/\\/g, '\\\\');
    // Then, escape double quotes, as the target JS string will be double-quoted
    intermediateContent = intermediateContent.replace(/"/g, '\\"');
    // Finally, replace newlines with an escaped newline and string concatenation for multi-line JS strings.
    // This matches the original's exact output format for newlines.
    intermediateContent = intermediateContent.replace(/\r?\n/g, '" +\n    "');
    return intermediateContent;
}

// Orchestrates the HTML to JavaScript template compilation process
function executeCompilationProcess() {
    // Determine the root directory for HTML assets based on the glob expression
    const baseInputPath = operationalParameters.sourceGlobExpression.split('**')[0].replace(/\/$/, '');
    
    // Ensure the target output directory structure exists recursively
    fileSystemUtility.mkdirSync(operationalParameters.outputDirectoryBase, { recursive: true });

    // Define a predicate function to filter for HTML files
    const htmlFilePredicate = (filePath) => filePath.endsWith(".html");
    // Discover all relevant HTML files starting from the base input path
    const allSourceHtmlFiles = discoverHtmlAssets(baseInputPath, htmlFilePredicate);

    // Iterate over each discovered HTML file to process it
    for (const inputFileAbsolutePath of allSourceHtmlFiles) {
        // The original implementation uses the full input file path as the Angular module name.
        const angularModuleName = inputFileAbsolutePath; 

        // The original derives the template cache key from a fixed prefix and the file's base name.
        const templateCacheEntryKey = operationalParameters.templateCacheKeyPrefix + locationResolver.basename(inputFileAbsolutePath);

        // Read the raw content of the HTML file as a UTF-8 string
        const rawHtmlContentString = fileSystemUtility.readFileSync(inputFileAbsolutePath, 'utf8');
        
        // Process the HTML content to be safely embedded within a JavaScript string literal
        const embeddedHtmlString = prepareContentForJsEmbedding(rawHtmlContentString);

        // Assemble the final JavaScript module string using a template literal.
        // Note: embeddedHtmlString itself contains the necessary quotes and concatenations,
        // so it's inserted directly without outer quotes here to match original output.
        const resultantScriptCode =
`${operationalParameters.angularModuleCreator}('${angularModuleName}', []).run(function(templateService) {
  templateService.put('${templateCacheEntryKey}',
    ${embeddedHtmlString});
});
`;
        // Determine the relative path from the base input path to maintain the directory structure in the output.
        const relativeOutputPathSegment = locationResolver.relative(baseInputPath, inputFileAbsolutePath);
        // Construct the full path for the output JavaScript file
        const finalOutputJsFilePath = locationResolver.join(operationalParameters.outputDirectoryBase, relativeOutputPathSegment + ".js");

        // Ensure the subdirectory for the specific output file exists
        fileSystemUtility.mkdirSync(locationResolver.dirname(finalOutputJsFilePath), { recursive: true });
        
        // Write the generated JavaScript content to the specified output file
        fileSystemUtility.writeFileSync(finalOutputJsFilePath, resultantScriptCode, 'utf8');
    }
}

// Initiate the entire compilation process when the script is executed
executeCompilationProcess();