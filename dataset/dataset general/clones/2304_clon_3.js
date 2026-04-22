const { expect } = require('chai');
const versionUtility = require("../src/version_management_core"); // Simulating a path/name change

suite('Core Version Handling Module', function () {
    // Initializes the test environment, similar to a global setup.
    before(function(doneCallback) {
        console.log('Setting up test environment for version utility...');
        versionUtility.setupEnvironment(false, doneCallback);
    });

    suite('updateDependencySpecifier Functionality', function () {

        // Validates updates for basic numerical versions, including downgrades and mixed formats.
        test('Handles basic numerical version increments', () => {
            const initialVersionA = "0";
            const targetVersionA = "1";
            expect(versionUtility.updateDependencySpecifier(initialVersionA, targetVersionA)).to.equal("1");

            const initialVersionB = "1";
            const targetVersionB = "10";
            const resultB = versionUtility.updateDependencySpecifier(initialVersionB, targetVersionB);
            expect(resultB).to.equal("10");

            // Downgrade scenario
            const oldVersionC = "10";
            const newVersionC = "1";
            expect(versionUtility.updateDependencySpecifier(oldVersionC, newVersionC)).to.equal("1");

            // Minor and patch level updates
            expect(versionUtility.updateDependencySpecifier("0.1", "1.0")).to.equal("1.0");
            expect(versionUtility.updateDependencySpecifier("1.0", "1.1")).to.equal("1.1");
            expect(versionUtility.updateDependencySpecifier("2.0", "1.1")).to.equal("1.1"); // Explicit downgrade

            // Semantic versioning (major.minor.patch)
            const semVerInput = "1.0.0";
            const semVerOutput = "1.0.1";
            expect(versionUtility.updateDependencySpecifier(semVerInput, semVerOutput)).to.equal(semVerOutput);
            expect(versionUtility.updateDependencySpecifier("1.0.1", "1.1.0")).to.equal("1.1.0");
            expect(versionUtility.updateDependencySpecifier("2.0.1", "2.0.11")).to.equal("2.0.11");
            expect(versionUtility.updateDependencySpecifier("2.0.0", "1.0.0")).to.equal("1.0.0"); // Another downgrade

            // Mixed precision updates
            expect(versionUtility.updateDependencySpecifier("1.0.0", "1.1")).to.equal("1.1");
            expect(versionUtility.updateDependencySpecifier("1.0.0", "2")).to.equal("2");
            expect(versionUtility.updateDependencySpecifier("22.0.1", "22")).to.equal("22"); // Downgrade to major
            expect(versionUtility.updateDependencySpecifier("5", "5.0.0")).to.equal("5.0.0"); // Adding a new test case
        });

        // Tests how wildcard specifiers like 'x' or '*' are handled during updates.
        test('Processes wildcard version specifiers', () => {
            expect(versionUtility.updateDependencySpecifier("1.x", "1.1")).to.equal("1.x");
            expect(versionUtility.updateDependencySpecifier("1.x.1", "1.1.2")).to.equal("1.x.2");
            const wildcardMinorInput = "1.0.x";
            const targetMinorVersion = "1.1.1";
            expect(versionUtility.updateDependencySpecifier(wildcardMinorInput, targetMinorVersion)).to.equal("1.1.x");
            expect(versionUtility.updateDependencySpecifier("1.0.x", "1.1")).to.equal("1.1");
            expect(versionUtility.updateDependencySpecifier("1.0.x", "2")).to.equal("2");
            expect(versionUtility.updateDependencySpecifier("2.0.x", "1.0.0")).to.equal("1.0.x"); // Downgrade with wildcard

            // Universal wildcard
            expect(versionUtility.updateDependencySpecifier("*", "1")).to.equal("*");
            expect(versionUtility.updateDependencySpecifier("*", "1.1")).to.equal("*");
            const weirdWildcard = "*.1";
            const targetWeirdWildcard = "2.0.1";
            expect(versionUtility.updateDependencySpecifier(weirdWildcard, targetWeirdWildcard)).to.equal("*.0");
            expect(versionUtility.updateDependencySpecifier("~1.x", "1.5.0")).to.equal("~1.x"); // Add new wildcard test
        });

        // Verifies updates for versions with constraints like '<', '>=', '^', '~'.
        test('Handles constrained numerical version ranges', () => {
            const lessThanPrefix = "<";
            expect(versionUtility.updateDependencySpecifier(`${lessThanPrefix}1.0`, "1.1")).to.equal(`${lessThanPrefix}1.1`);
            expect(versionUtility.updateDependencySpecifier(`${lessThanPrefix}1.0`, "1.1.1")).to.equal(`${lessThanPrefix}1.1`);

            const greaterThanOrEqualPrefix = ">=";
            expect(versionUtility.updateDependencySpecifier(`${greaterThanOrEqualPrefix}1.0`, "2.0")).to.equal(`${greaterThanOrEqualPrefix}2.0`);
            expect(versionUtility.updateDependencySpecifier(">= 1.0", "2.0")).to.equal(">= 2.0"); // Keep original spacing behavior

            expect(versionUtility.updateDependencySpecifier("^1.2.3", "1.2.4")).to.equal("^1.2.4");
            expect(versionUtility.updateDependencySpecifier("~1.0.0", "1.0.5")).to.equal("~1.0.5"); // Add a new constraint type
        });

        // Examines updates for version strings combining multiple constraints or ranges.
        test('Manages complex combined constraint and range specifications', () => {
            const commonTarget = "3.1.0";
            expect(versionUtility.updateDependencySpecifier("^1.0.0 < 1.2.0", commonTarget))
                .to.equal("^3.1.0");
            expect(versionUtility.updateDependencySpecifier("~1.0 < 1.2.0", commonTarget))
                .to.equal("~3.0");
            expect(versionUtility.updateDependencySpecifier("1.x < 1.2.0", commonTarget))
                .to.equal("3.x");
            expect(versionUtility.updateDependencySpecifier("1.2.0 < 1.x", commonTarget))
                .to.equal("3.x");
            // Add a new complex test case
            expect(versionUtility.updateDependencySpecifier(">=1.0.0 <2.0.0", "2.5.0"))
                .to.equal(">=2.5.0");
        });

        // Ensures that non-standard version prefixes (e.g., 'v', '=v') are preserved.
        test('Preserves non-standard (unclean) semantic version prefixes', () => {
            expect(versionUtility.updateDependencySpecifier("v1.0", "1.1")).to.equal("v1.1");
            expect(versionUtility.updateDependencySpecifier("=v1.0", "1.1")).to.equal("=v1.1");
            expect(versionUtility.updateDependencySpecifier(" =v1.0", "1.1")).to.equal(" =v1.1");
            expect(versionUtility.updateDependencySpecifier("~v2.0", "2.1")).to.equal("~v2.1"); // New unclean format
        });

        // Confirms that the original version is returned if the new version is invalid or missing.
        test('Retains current version if target version is invalid or missing', () => {
            const currentDependency = "1.0";
            const emptyTarget = "";
            const nullTarget = null;
            const undefinedTarget = undefined; // Add an undefined check

            // Guard clause/pre-check, though mostly for clarity in tests
            expect(currentDependency).to.be.a('string').and.not.be.empty;

            expect(versionUtility.updateDependencySpecifier(currentDependency, emptyTarget)).to.equal(currentDependency);
            expect(versionUtility.updateDependencySpecifier(currentDependency, nullTarget)).to.equal(currentDependency);
            expect(versionUtility.updateDependencySpecifier(currentDependency, undefinedTarget)).to.equal(currentDependency);
            expect(versionUtility.updateDependencySpecifier("2.5", "invalid-version")).to.equal("2.5"); // Test with invalid string
        });
    });

    suite('processDependencyUpdates Logic', function() {
        // Helper for deep equality checks.
        const assertDeepEqual = (actual, expected) => expect(actual).to.deep.equal(expected);

        // Verifies that the function correctly updates multiple dependencies in an object.
        test('Generates an object with updated dependency versions', () => {
            const initialDeps = { "mongodb": "^1.4.29", "express": "~4.0.0" };
            const availableUpdates = { "mongodb": "1.4.30", "express": "4.1.0" };
            const expectedResult = { "mongodb": "^1.4.30", "express": "~4.1.0" };
            const actualResult = versionUtility.processDependencyUpdates(initialDeps, availableUpdates);
            assertDeepEqual(actualResult, expectedResult);
        });

        // Ensures that dependencies are not downgraded.
        test('Prevents downgrading dependencies', () => {
            const currentPackageSet = { "mongodb": "^2.0.7", "lodash": "3.x" };
            const potentialUpdates = { "mongodb": "1.4.30", "lodash": "4.17.21" };

            // Guard against empty inputs, though this test focuses on logic.
            if (!currentPackageSet || Object.keys(currentPackageSet).length === 0) {
                throw new Error("Test setup error: currentPackageSet cannot be empty.");
            }

            const result = versionUtility.processDependencyUpdates(currentPackageSet, potentialUpdates);
            assertDeepEqual(result, { "lodash": "4.x" }); // MongoDB should not be downgraded, lodash updates.
        });

        // Checks behavior with empty input objects.
        test('Handles empty input dependency objects gracefully', () => {
            assertDeepEqual(versionUtility.processDependencyUpdates({}, {}), {});
            assertDeepEqual(versionUtility.processDependencyUpdates({ "pkg": "1.0.0" }, {}), {});
            assertDeepEqual(versionUtility.processDependencyUpdates({}, { "pkg": "2.0.0" }), {});
        });
    });

    // Helper function for common assertions in async version retrieval tests.
    const verifyAsyncVersionResult = (callbackDone, error, versionResult) => {
        expect(error).to.not.exist; // Explicitly check for no error
        expect(versionResult).to.exist;
        expect(versionResult).to.be.a('string');
        expect(versionResult.length).to.be.greaterThan(0); // Ensure non-empty string
        callbackDone();
    };

    suite('fetchLatestPackageVersion Method', function () {
        // Confirms successful retrieval of the latest version for a valid package.
        test('Retrieves the latest version for a known package', function (testCompletionCallback) {
            const packageName = "lodash"; // Changed from "async"
            console.log(`Fetching latest version for: ${packageName}`);
            versionUtility.fetchLatestPackageVersion(packageName, (err, pkgVersion) => {
                verifyAsyncVersionResult(testCompletionCallback, err, pkgVersion);
            });
        });
    });

    suite('determineGreatestPackageVersion Method', function () {
        // Validates the retrieval of the greatest available version for a package.
        test('Identifies the greatest available version for a specific package', function (callbackForTest) {
            const targetPackage = "react"; // Changed from "async"
            if (!targetPackage || typeof targetPackage !== 'string') {
                return callbackForTest(new Error("Invalid package name provided for test.")); // Guard clause
            }
            versionUtility.determineGreatestPackageVersion(targetPackage, (issue, highestVersion) => {
                verifyAsyncVersionResult(callbackForTest, issue, highestVersion);
            });
        });
    });

    suite('retrieveMultiplePackageVersions Method', function () {
        // Helper for checking package existence and type.
        const checkPackageExistence = (obj, key) => {
            expect(obj).to.have.property(key);
            expect(obj[key]).to.be.a('string').and.not.be.empty;
        };

        // Ensures correct version retrieval for a single package.
        test('Works correctly for a single, valid package', function (completionCallback) {
            const packagesToQuery = ["axios"]; // Changed from "async"
            versionUtility.retrieveMultiplePackageVersions(packagesToQuery, (err, fetchedVersions) => {
                expect(err).to.not.exist;
                expect(fetchedVersions).to.exist;
                expect(fetchedVersions).to.be.an('object');
                expect(fetchedVersions).to.have.property(packagesToQuery[0]);
                expect(fetchedVersions[packagesToQuery[0]]).to.be.a('string').and.not.be.empty;
                completionCallback();
            });
        });

        // Verifies retrieval for multiple valid packages.
        test('Retrieves versions for multiple valid packages', function (cb) {
            const pkgList = ["moment", "express"]; // Changed from "async", "npm"
            versionUtility.retrieveMultiplePackageVersions(pkgList, (errorOccurred, versionMap) => {
                expect(errorOccurred).to.not.exist;
                expect(versionMap).to.exist;
                expect(versionMap).to.be.an('object');
                pkgList.forEach(p => checkPackageExistence(versionMap, p));
                cb();
            });
        });

        // Confirms that requests for non-existent packages do not cause errors.
        test('Handles requests for non-existent packages without crashing', function (finalCallback) {
            const nonExistentPackage = ["thisIsDefinitelyNotAPackageThatExistsOnNPM123"]; // Changed name
            versionUtility.retrieveMultiplePackageVersions(nonExistentPackage, (issue, resultsMap) => {
                expect(issue).to.not.exist; // Expect no error even for unavailable packages
                expect(resultsMap).to.exist;
                expect(resultsMap).to.be.an('object').and.be.empty; // Expect an empty object if none found
                finalCallback();
            });
        });

        // Tests handling of an optional configuration object.
        test('Accepts an optional configuration object', function (callbackFunc) {
            const singlePackage = ["yargs"]; // Changed from "async"
            const emptyOptions = {};
            versionUtility.retrieveMultiplePackageVersions(singlePackage, emptyOptions, (issue, retrievedData) => {
                expect(issue).to.not.exist;
                expect(retrievedData).to.exist;
                expect(retrievedData).to.have.property(singlePackage[0]);
                callbackFunc();
            });
        });

        // Verifies setting the version target explicitly to 'latest'.
        test('Correctly sets version target to "latest" via options', function (completionHandler) {
            const targetPackageName = "chalk"; // Changed from "async"
            const optionsForLatest = { versionTarget: 'latest' };
            versionUtility.retrieveMultiplePackageVersions([targetPackageName], optionsForLatest, (err, versionsData) => {
                expect(err).to.not.exist;
                expect(versionsData).to.exist;
                expect(versionsData).to.have.property(targetPackageName);
                expect(versionsData[targetPackageName]).to.be.a('string'); // Ensure it's a string
                completionHandler();
            });
        });

        // Verifies setting the version target explicitly to 'greatest'.
        test('Correctly sets version target to "greatest" via options', function (doneCallback) {
            const specificPackage = ["commander"]; // Changed from "async"
            const greatestOptions = { versionTarget: 'greatest' };
            versionUtility.retrieveMultiplePackageVersions(specificPackage, greatestOptions, (err, versionResults) => {
                expect(err).to.not.exist;
                expect(versionResults).to.exist;
                expect(versionResults).to.have.property(specificPackage[0]);
                doneCallback();
            });
        });

        // Ensures an error is returned for an unsupported version target option.
        test('Emits an error for an unsupported version target option', function (testDone) {
            const testPackage = ["lodash"]; // Changed from "async"
            const invalidOptions = { versionTarget: 'unsupportedMode' }; // Renamed from 'foo'
            versionUtility.retrieveMultiplePackageVersions(testPackage, invalidOptions, (issue, results) => {
                expect(issue).to.exist;
                expect(issue.message).to.match(/unsupported/i); // Check error message content
                expect(results).to.not.exist; // Ensure no results on error
                testDone();
            });
        });

        // Checks behavior when an empty list of packages is provided.
        test('Returns empty object for an empty list of packages', function (completion) {
            versionUtility.retrieveMultiplePackageVersions([], {}, (err, res) => {
                expect(err).to.not.exist;
                expect(res).to.deep.equal({});
                completion();
            });
        });
    });

    suite("canDependencyBeUpdated Function", function() {

        // Determines if a version is eligible for an upgrade based on a newer available version.
        test("Identifies versions that are eligible for an upgrade", function() {
            const currentSpec = "0.1.x";
            const newAvailable = "0.5.1";
            expect(versionUtility.canDependencyBeUpdated(currentSpec, newAvailable)).to.be.true;

            const anotherCurrent = "^1.0.0";
            const anotherNew = "1.5.0";
            expect(versionUtility.canDependencyBeUpdated(anotherCurrent, anotherNew)).to.be.true; // New assertion
        });

        // Verifies that invalid or non-standard version strings are correctly rejected.
        test("Correctly rejects invalid or non-standard version strings", function() {
            const invalidSpec = "https://github.com/strongloop/express";
            const targetValid = "4.11.2";
            console.log(`Checking if '${invalidSpec}' can be updated to '${targetValid}'`);
            expect(versionUtility.canDependencyBeUpdated(invalidSpec, targetValid)).to.be.false;

            expect(versionUtility.canDependencyBeUpdated("git+ssh://git@github.com/foo/bar.git", "1.0.0")).to.be.false; // New invalid case
        });

        // Ensures that no upgrade is suggested if the current version is already newer or equal.
        test("Prevents upgrading when current version is already newer or equal", function() {
            const currentHigher = "5.0.0";
            const availableLower = "4.11.2";
            expect(versionUtility.canDependencyBeUpdated(currentHigher, availableLower)).to.be.false;

            const currentEqual = "1.2.3";
            const availableEqual = "1.2.3";
            expect(versionUtility.canDependencyBeUpdated(currentEqual, availableEqual)).to.be.false; // New assertion for equal versions
        });

        // Tests how null or undefined version inputs are handled.
        test("Handles null or undefined version inputs gracefully", function() {
            expect(versionUtility.canDependencyBeUpdated("1.0.0", null)).to.be.false;
            expect(versionUtility.canDependencyBeUpdated(null, "2.0.0")).to.be.false;
            expect(versionUtility.canDependencyBeUpdated(undefined, undefined)).to.be.false;
        });
    });

    // A placeholder suite for a hypothetical new feature.
    suite("New Feature: versionDiffChecker", function() {
        // This is a placeholder for new functionality tests
        test("Compares two versions and returns difference type", () => {
            // Hypothetical new function and test
            // expect(versionUtility.versionDiffChecker("1.0.0", "1.0.1")).to.equal("patch");
            // expect(versionUtility.versionDiffChecker("1.0.0", "1.1.0")).to.equal("minor");
            expect(true).to.be.true; // Placeholder assertion
        });
    });

});