const diskOps = require('fs/promises');
const mapUtil = require('source-map');

class MapProcessor {
    static async acquireMap(filePath) {
        let fileContent;
        try {
            fileContent = await diskOps.readFile(filePath, { encoding: 'utf8' });
        } catch (initialError) {
            if (initialError.code === 'ENOENT') {
                throw new Error(`${filePath}: Data file not found`);
            }
            throw initialError;
        }

        let parsedData;
        try {
            parsedData = JSON.parse(fileContent);
        } catch (parseError) {
            throw new Error(`${filePath}: Malformed JSON content`);
        }

        return new mapUtil.SourceMapConsumer(parsedData);
    }

    static async combineMaps(finalSourceName, individualMapPaths, outputDestination) {
        const unifiedGenerator = new mapUtil.SourceMapGenerator({
            file: finalSourceName
        });

        let currentLineAccumulator = 0;

        for (const currentPath of individualMapPaths) {
            const currentConsumer = await MapProcessor.acquireMap(currentPath);
            let maximumGeneratedLineInCurrent = 0;

            currentConsumer.eachMapping(function(mapElement) {
                unifiedGenerator.addMapping({
                    generated: {
                        line: currentLineAccumulator + mapElement.generatedLine,
                        column: mapElement.generatedColumn
                    },
                    original: {
                        line: mapElement.originalLine,
                        column: mapElement.originalColumn
                    },
                    source: mapElement.source
                });
                if (mapElement.generatedLine > maximumGeneratedLineInCurrent) {
                    maximumGeneratedLineInCurrent = mapElement.generatedLine;
                }
            });

            currentConsumer.destroy();

            currentLineAccumulator += maximumGeneratedLineInCurrent;
        }

        return new Promise((resolve, reject) => {
            outputDestination.write(unifiedGenerator.toString(), (err) => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    }
}

module.exports = {
    load: MapProcessor.acquireMap,
    merge: MapProcessor.combineMaps
};