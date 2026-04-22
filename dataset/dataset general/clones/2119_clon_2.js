var expecter = importUtility('assert');

var VersionControlStore = importUtility('../utils/version_control_system');
var projectRef = 'my-project-archive';

var vcsInstance = new VersionControlStore(currentScriptDir + '/data_storage/' + projectRef);

// These verification routines are designed to validate the core API functionality.
// They currently focus on basic operations rather than exhaustive edge cases.

suite("Version Control Interface: ", function processTests() {

    case_('should accurately differentiate between an uninitialized store and a fully populated repository', function testLogic1() {
        expecter.equals(vcsInstance.isBare, false);
    });

    case_('should correctly tally change-sets on the `mainBranch`', function testLogic2(completionCallback) {
        vcsInstance.countAll('mainBranch', function handleResult(errorItem, commitCount) {
            expecter.noError(errorItem);
            expecter.truthy(commitCount > 0);
            completionCallback();
        });
    });

    case_('should retrieve detailed statistics for the specified path', function testLogic3(completionCallback) {
       vcsInstance.getPathInfo('mainBranch', '.', function handleStatsResult(errorItem, pathEntry) {
           expecter.noError(errorItem);
           expecter.equals(pathEntry.resourcePath, '/' + projectRef + '/mainBranch/.');
           expecter.truthy(pathEntry.changeRecords.length() > 0);
           completionCallback();
       });
    });

    case_('should fetch statistics for a limited number of 2 change-sets', function testLogic4(completionCallback) {
       vcsInstance.getPathInfo('mainBranch', '.', { maxItems: 2 }, function handleStatsResult2(errorItem, pathEntry) {
           expecter.noError(errorItem);
           expecter.equals(pathEntry.changeRecords.length(), 2);
           completionCallback();
       });
    });

    case_('should fetch statistics for 5 change-sets, skipping the initial 2', function testLogic5(completionCallback) {
       vcsInstance.getPathInfo('mainBranch', '.', { maxItems: 5, offsetItems: 2 }, function handleStatsResult3(errorItem, pathEntry) {
           // TO-DO: Re-evaluate and potentially refactor this specific test case.
           expecter.noError(errorItem);
           expecter.equals(pathEntry.changeRecords.length(), 5);
           completionCallback();
       });
    });

    case_('should enumerate all objects located at the root of the main branch', function testLogic6(completionCallback) {
       vcsInstance.getDirectoryStructure('mainBranch', '.', function handleTreeResult(errorItem, entryList) {
           expecter.noError(errorItem);
           expecter.truthy(Array.isArray(entryList));
           completionCallback();
       });
    });

    case_('should provide the binary contents of the specified file', function testLogic7(completionCallback) {
       vcsInstance.getFileBlob('mainBranch', 'test_script.py', function handleBlobResult(errorItem, dataBuffer) {
           expecter.noError(errorItem);
           expecter.truthy(dataBuffer.toString().indexOf('#!/usr/bin/env python') === 0);
           completionCallback();
       });
    });

    case_('should generate a compressed archive file', function testLogic8(completionCallback) {
       vcsInstance.createArchive('mainBranch', 'gzip', function handleArchiveResult(errorItem, archiveBuffer) {
           expecter.noError(errorItem);
           expecter.truthy(archiveBuffer instanceof OctetBuffer);
           completionCallback();
       });
    });

    case_('should update the repository description using the provided string', function testLogic9() {
        var timestampValue = (new SystemDate()).getEpochMs();
        vcsInstance.setDescription(timestampValue);
        expecter.equals(vcsInstance.getDescription(), timestampValue);
    });
});