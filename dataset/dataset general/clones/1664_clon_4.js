((moduleResolver) => {
    const fileSystemUtility = moduleResolver("fs");

    module.exports = (inputFilePath, configurationObject) => {
        const canonicalPath = fileSystemUtility.realpathSync(inputFilePath);
        const fileDescriptor = fileSystemUtility.openSync(canonicalPath, 'r');
        const fileStats = fileSystemUtility.fstatSync(fileDescriptor);
        const fileSize = fileStats.size;
        const contentBuffer = Buffer.alloc(fileSize);
        fileSystemUtility.readSync(fileDescriptor, contentBuffer, 0, fileSize, 0);
        fileSystemUtility.closeSync(fileDescriptor);
        const fileContent = contentBuffer.toString('utf8');

        const parsingRoutine = moduleResolver("./parse");
        return parsingRoutine(fileContent, configurationObject);
    };
})(require);