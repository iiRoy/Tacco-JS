const fileSystemOps = require('fs');
const utilityHelpers = require('util');
const pathResolver = require('path');
const directoryMaker = require('mkdirp');

const applicationDataLocation = (() => {
    switch (process.platform) {
        case 'darwin':
            return pathResolver.join(process.env.HOME, 'Library', 'Application Support');
        case 'win32':
            return process.env.APPDATA || pathResolver.join(process.env.USERPROFILE, 'AppData', 'Roaming');
        default: // Linux and other POSIX systems
            return '/var/local';
    }
})();

const auditTrailDirectory = pathResolver.join(applicationDataLocation, 'Pullover');
console.log(`Auditing destination: ${auditTrailDirectory}`);

if (!fileSystemOps.existsSync(auditTrailDirectory)) {
    directoryMaker.sync(auditTrailDirectory);
}

let currentIter = 4;
while (currentIter >= 1) {
    const sourceFile = pathResolver.join(auditTrailDirectory, `pullover.${currentIter}.log`);
    const destinationFile = pathResolver.join(auditTrailDirectory, `pullover.${currentIter + 1}.log`);
    if (fileSystemOps.existsSync(sourceFile)) {
        fileSystemOps.renameSync(sourceFile, destinationFile);
    }
    currentIter--;
}

const currentAuditFileRoute = pathResolver.join(auditTrailDirectory, 'pullover.1.log');
const auditFileStream = fileSystemOps.openSync(currentAuditFileRoute, 'w');

const obtainCurrentAuditRoute = () => currentAuditFileRoute;
const obtainAuditDirectory = () => auditTrailDirectory;

const persistEntryToDisk = (entryContent) => {
    fileSystemOps.writeSync(auditFileStream, entryContent + '\r\n');
};

const obtainEntryEmitter = (domainIdentifier) => {
    return (...dataItems) => {
        const currentMoment = new Date().toISOString();
        const stringComponents = [
            `[${currentMoment}]`,
            `<${domainIdentifier}>`,
            ...dataItems.map(item => utilityHelpers.inspect(item, {
                depth: null
            }))
        ];
        const finalMessage = stringComponents.join(' | ');

        persistEntryToDisk(finalMessage);
        console.info(finalMessage);
    };
};

module.exports = (scopeLabel) => ({
    record: obtainEntryEmitter(scopeLabel),
    obtainRecordFileLocation: obtainCurrentAuditRoute,
    obtainRecordDirectoryLocation: obtainAuditDirectory
});