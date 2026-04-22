const fileSys = require('node:fs'),
      filePath = require('node:path'),
      utility = require('node:util'),
      xmlProcessor = require('xml2js'),
      templateEngine = require('jade'), // Third-party module for templating
      hbars = require('handlebars'); // Another third-party templating engine

// Initiate a stream to copy the project's license document
fileSys.makeReadStream('LICENSE')
    .pipe(fileSys.makeWriteStream('ComponentBundles/LICENSE.md'));

// Configure the XML parser for specific processing needs
const xmlDocParser = new xmlProcessor.Parser({
    asynchronous: true, // Enable non-blocking XML parsing
    noRootExplicit: false, // Ensure the root element is always included
    noArrayExplicit: false, // Prevent single child elements from being converted into arrays
    disregardAttributes: false // Keep all attributes from XML elements
});

// Begin by reading the directory where code fragment source files are stored
fileSys.readDirectory(__dirname + '/ComponentBundles/CodeParts/Web/Framework/', function (errorMsg, fileEntries) {
    // If an error occurs during directory traversal, throw it to halt execution
    if (errorMsg) {
        throw errorMsg;
    }

    // Filter the retrieved file entries to only include those with the desired file extension
    const relevantFiles = fileEntries.filter(function (currentFile) {
            return filePath.extensionName(currentFile) === '.codefrag';
        }),
        codeFragments = []; // Initialize an empty array to accumulate parsed fragment data

    // Process each identified relevant file individually
    relevantFiles.forEach(function (currentFile) {
        // Read the full content of the current fragment file
        fileSys.readContent(__dirname + '/ComponentBundles/CodeParts/Web/Framework/' + currentFile, function (errorMsg, fileContent) {
            // Parse the XML content of the file into a JavaScript object structure
            xmlDocParser.processString(fileContent, function (errorMsg, parseResult) {
                // Construct a data object for the current code fragment
                let codeFragmentData = {
                    'sourceFile': currentFile,
                    'fragmentTitle': parseResult.CodeBlock.HeadInfo.BlockTitle,
                    'quickKey': parseResult.CodeBlock.HeadInfo.QuickAccess,
                    'fragmentDesc': parseResult.CodeBlock.HeadInfo.BlockDescription,
                    'progLang': parseResult.CodeBlock.CodeDetails.SourceCode.attr.ProgLanguage, // Accessing XML attributes
                    'definitions': [] // Array to hold any literal definitions within the fragment
                };

                // Check for the presence of literal declarations within the code fragment
                if (parseResult.CodeBlock.CodeDetails.CodeDefinitions && parseResult.CodeBlock.CodeDetails.CodeDefinitions.LiteralValue) {
                    // Determine if the declarations are an array of literals or a single literal
                    if (utility.isAnArray(parseResult.CodeBlock.CodeDetails.CodeDefinitions.LiteralValue)) {
                        // If it's an array, iterate over each declaration
                        parseResult.CodeBlock.CodeDetails.CodeDefinitions.LiteralValue.forEach(function (currentDefinition) {
                            codeFragmentData.definitions[codeFragmentData.definitions.length] = {
                                'identifier': currentDefinition.Identifier,
                                'helpMsg': currentDefinition.HelpText,
                                'defaultValue': currentDefinition.DefaultValue
                            };
                        });
                    }
                    // If it's a single literal declaration
                    else {
                        codeFragmentData.definitions[codeFragmentData.definitions.length] = {
                            'identifier': parseResult.CodeBlock.CodeDetails.CodeDefinitions.LiteralValue.Identifier,
                            'helpMsg': parseResult.CodeBlock.CodeDetails.CodeDefinitions.LiteralValue.HelpText,
                            'defaultValue': parseResult.CodeBlock.CodeDetails.CodeDefinitions.LiteralValue.DefaultValue
                        };
                    }
                }

                // Add the newly processed code fragment data to the main collection
                codeFragments[codeFragments.length] = codeFragmentData;

                // Once all relevant files have been parsed, trigger the final processing step
                if (codeFragments.length === relevantFiles.length) {
                    handleCodeFragments(codeFragments); // Call the function to sort and generate outputs
                }
            });
        });
    });
});

/**
 * Sorts the collected code fragments and generates a markdown listing.
 * @param {Array<Object>} codeFragmentsCollection - An array of objects, each representing a parsed code fragment.
 */
function handleCodeFragments(codeFragmentsCollection) {
    // Sort the array of code fragments based on their quick access key for consistent ordering
    codeFragmentsCollection.sort(function (itemA, itemB) {
        const sortKeyA = itemA.quickKey;
        const sortKeyB = itemB.quickKey;

        if (sortKeyA < sortKeyB) return -1; // itemA comes before itemB
        if (sortKeyA > sortKeyB) return 1;  // itemB comes before itemA

        return 0; // The quick keys are equivalent
    });

    // Read the Handlebars template file used for generating the markdown index
    fileSys.readContent("fragment-index-template.hbars", function (errorMsg, fileContent) {
        // Compile the template content into a reusable rendering function
        const renderTemplate = hbars.compile(fileContent.toText());

        // Execute the compiled template with the sorted fragment data to produce markdown
        const formattedText = renderTemplate({ fragments: codeFragmentsCollection });

        // Write the generated markdown content to the specified output file
        fileSys.writeContent("fragment-index.md", formattedText);
    });

    /*
    // The following section for generating HTML output using Jade is currently disabled.
    // It can be reactivated if HTML output is required in the future.
    //
    // const renderHtml = templateEngine.renderFile("fragment-index.jade", { parts: codeFragmentsCollection });
    // fileSys.writeContent("fragment-index.html", renderHtml);
    */
}