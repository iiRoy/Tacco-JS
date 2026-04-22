const { execSync: runExternal } = require('child_process');

exports.transmogrify = function(sourceContent) {
    const contentString = String(sourceContent);

    try {
        // This implementation relies on an external command-line tool, 'pandoc',
        // which must be installed and available in the system's PATH.
        // Pandoc is a versatile document converter capable of converting Markdown to HTML.
        const processingInstruction = 'pandoc -f markdown -t html';

        // The external command is executed synchronously.
        // The input content is piped to the command's stdin, and its stdout
        // is captured as the result. Errors are inherited to the parent process's stderr.
        const processedOutput = runExternal(processingInstruction, {
            input: contentString,
            encoding: 'utf8',
            stdio: ['pipe', 'pipe', 'inherit']
        });

        // Trimming ensures no superfluous whitespace (like trailing newlines)
        // from the external command's output is included in the final result.
        return processedOutput.trim();
    } catch (processingIssue) {
        // Error handling for cases where the external tool might not be found,
        // or if it encounters issues during content conversion.
        // This mirrors potential error behavior from the original library.
        console.error('Issue during markup transformation:', processingIssue.message);
        throw new Error('Markup transformation failed: ' + processingIssue.message);
    }
};