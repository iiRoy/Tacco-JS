const fileOperations = require('fs');
const pathUtilities = require('path');

function integrateDependencyLinks() {
    const mainHtmlFile = pathUtilities.resolve(__dirname, 'src', 'doc', 'index.html');
    const componentRoot = pathUtilities.resolve(__dirname, 'bower_components');
    const projectDefinitionFile = pathUtilities.resolve(__dirname, 'bower.json');
    const shouldIncludeDevelopment = true;

    try {
        if (!fileOperations.existsSync(projectDefinitionFile)) {
            return;
        }
        const projectDefinitionContent = fileOperations.readFileSync(projectDefinitionFile, 'utf8');
        const projectConfig = JSON.parse(projectDefinitionContent);

        let activeDependencies = {};
        Object.assign(activeDependencies, projectConfig.dependencies || {});
        if (shouldIncludeDevelopment) {
            Object.assign(activeDependencies, projectConfig.devDependencies || {});
        }

        let scriptMarkup = [];
        let styleMarkup = [];

        for (const depKey in activeDependencies) {
            const depDirectory = pathUtilities.join(componentRoot, depKey);
            const depManifestPath = pathUtilities.join(depDirectory, 'bower.json');

            if (!fileOperations.existsSync(depManifestPath)) {
                continue;
            }

            const depManifestContent = fileOperations.readFileSync(depManifestPath, 'utf8');
            const depConfig = JSON.parse(depManifestContent);

            let primaryFiles = depConfig.main || [];
            if (typeof primaryFiles === 'string') {
                primaryFiles = [primaryFiles];
            }

            for (const fileItem of primaryFiles) {
                const absolutePathToFile = pathUtilities.join(depDirectory, fileItem);
                const relativePathFromHtml = pathUtilities.relative(pathUtilities.dirname(mainHtmlFile), absolutePathToFile);

                if (fileItem.endsWith('.js')) {
                    scriptMarkup.push(`<script src="${relativePathFromHtml}"></script>`);
                } else if (fileItem.endsWith('.css')) {
                    styleMarkup.push(`<link rel="stylesheet" href="${relativePathFromHtml}">`);
                }
            }
        }

        if (!fileOperations.existsSync(mainHtmlFile)) {
            return;
        }
        let currentHtmlContent = fileOperations.readFileSync(mainHtmlFile, 'utf8');

        const jsBlockStart = '<!-- bower:js -->';
        const jsBlockEnd = '<!-- endinject -->';
        const cssBlockStart = '<!-- bower:css -->';
        const cssBlockEnd = '<!-- endinject -->';

        const updateContentBlock = (originalContent, beginMarker, endMarker, newItems) => {
            const startPos = originalContent.indexOf(beginMarker);
            const endPos = originalContent.indexOf(endMarker);

            if (startPos !== -1 && endPos !== -1 && startPos < endPos) {
                const prefix = originalContent.substring(0, startPos + beginMarker.length);
                const suffix = originalContent.substring(endPos);
                const injectedBlock = newItems.map(line => '    ' + line).join('\n') + '\n    ';
                return prefix + '\n' + injectedBlock + suffix;
            }
            return originalContent;
        };

        currentHtmlContent = updateContentBlock(currentHtmlContent, jsBlockStart, jsBlockEnd, scriptMarkup);
        currentHtmlContent = updateContentBlock(currentHtmlContent, cssBlockStart, cssBlockEnd, styleMarkup);

        fileOperations.writeFileSync(mainHtmlFile, currentHtmlContent, 'utf8');

    } catch (e) {
        // Error handling omitted for raw output, but would be present in a real application.
    }
}

integrateDependencyLinks();