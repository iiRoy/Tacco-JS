var assertionUtil = require('chai').expect;
var fileSystemOps = require('fs');
var cloudServiceEmulator = require('mock-aws-s3'); // Utility for simulating cloud resource traversal

describe('CloudStorageModule', function testSuiteCallback() {

    it('validates simulated resource path traversals', function verificationRoutine(completionSignal) {

        var initialSet = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/alpha');
        var alternateSet = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/beta');
        var modifiedItems = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/alpha/wildlife/recent');
        var archiveCopy = cloudServiceEmulator.traversePaths(__dirname + '/local_downloads/archives/full_backup');
        var tertiaryGroup = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/gamma');
        var quadContainer = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/delta');
        var quadDownload = cloudServiceEmulator.traversePaths(__dirname + '/local_downloads/archives/delta_part');
        var quintDownload = cloudServiceEmulator.traversePaths(__dirname + '/local_downloads/archives/epsilon_part');
        var quintContainer = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/epsilon');
        var replicatedItems = cloudServiceEmulator.traversePaths(__dirname + '/local_data/storage_area/replicas');

        assertionUtil(initialSet.length).is.equalTo(1473);
        assertionUtil(alternateSet.length).is.equalTo(1472);
        assertionUtil(modifiedItems.length).is.equalTo(0);
        assertionUtil(archiveCopy.length).is.equalTo(2945);
        assertionUtil(tertiaryGroup.length).is.equalTo(912);
        assertionUtil(quadContainer.length).is.equalTo(2945);
        assertionUtil(quadDownload.length).is.equalTo(1472);
        assertionUtil(quintDownload.length).is.equalTo(560);
        assertionUtil(quintContainer.length).is.equalTo(2);
        assertionUtil(replicatedItems.length).is.equalTo(1473);

        completionSignal();
    });
});