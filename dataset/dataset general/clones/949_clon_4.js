import * as filesys from 'node:fs/promises';
import * as filepath from 'node:path';
import { Parser as XmlProcessor } from 'xml2js';
import * as templateEngine from 'handlebars';

const currentModulePath = filepath.dirname(import.meta.url).replace('file://', '');
const snippetRepositoryPath = filepath.join(currentModulePath, 'BootstrapSnippets', 'Snippets', 'HTML', 'Bootstrap');
const licenseInputFile = 'LICENSE';
const licenseOutputFile = filepath.join('BootstrapSnippets', 'LICENSE.txt');
const markdownTemplateFile = 'snippet-listing-markdown.handlebars';
const finalMarkdownOutput = 'snippet-listing.md';
const snippetFileExtension = '.snippet';

const xmlParsingOptions = {
    async: true,
    explicitRoot: false,
    explicitArray: false,
    ignoreAttrs: false
};
const xmlParserInstance = new XmlProcessor(xmlParsingOptions);

const xmlToJsObject = (xmlContent) => new Promise((resolve, reject) => {
    xmlParserInstance.parseString(xmlContent, (err, result) => {
        if (err) reject(err);
        else resolve(result);
    });
});

async function orchestrateSnippetProcessing() {
    try {
        await filesys.copyFile(licenseInputFile, licenseOutputFile);

        const allDirectoryEntries = await filesys.readdir(snippetRepositoryPath);

        const qualifyingSnippetFiles = allDirectoryEntries.filter(
            (entry) => filepath.extname(entry) === snippetFileExtension
        );

        const extractedSnippetMetadata = await Promise.all(
            qualifyingSnippetFiles.map(async (fileName) => {
                const fullFilePath = filepath.join(snippetRepositoryPath, fileName);
                const fileTextContent = await filesys.readFile(fullFilePath, 'utf8');
                const parsedXmlStructure = await xmlToJsObject(fileTextContent);

                const headerDetails = parsedXmlStructure.CodeSnippet.Header;
                const codeSection = parsedXmlStructure.CodeSnippet.Snippet;

                const currentExtractedData = {
                    sourceFileName: fileName,
                    displayTitle: headerDetails.Title,
                    activationKey: headerDetails.Shortcut,
                    briefDescription: headerDetails.Description,
                    programmingLanguage: codeSection.Code.$.Language,
                    inputPlaceholders: []
                };

                const declarationGroup = codeSection.Declarations;
                if (declarationGroup && declarationGroup.Literal) {
                    const literalItems = Array.isArray(declarationGroup.Literal)
                        ? declarationGroup.Literal
                        : [declarationGroup.Literal];

                    currentExtractedData.inputPlaceholders = literalItems.map((decl) => ({
                        variableId: decl.ID,
                        hoverText: decl.ToolTip,
                        initialValue: decl.Default
                    }));
                }
                return currentExtractedData;
            })
        );

        extractedSnippetMetadata.sort((firstItem, secondItem) =>
            firstItem.activationKey.localeCompare(secondItem.activationKey)
        );

        await generateFinalListing(extractedSnippetMetadata);

    } catch (operationError) {
        console.error("An error occurred during snippet processing:", operationError);
        throw operationError;
    }
}

async function generateFinalListing(collectionOfSnippets) {
    const templateContent = await filesys.readFile(markdownTemplateFile, 'utf8');
    const templateCompiler = templateEngine.compile(templateContent);

    const generatedMarkdown = templateCompiler({ snippets: collectionOfSnippets });

    await filesys.writeFile(finalMarkdownOutput, generatedMarkdown);
}

orchestrateSnippetProcessing();