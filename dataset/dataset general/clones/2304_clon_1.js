/*
 * This file serves as a comprehensive suite of unit tests for the Version Manager module.
 * It leverages the 'should' assertion library for fluent assertions
 * and the Mocha test framework for structuring the tests.
 */
var should   =   require (   "should"   ) ; // Import the 'should' assertion library.
var vm       =   require (   "../lib/versionmanager"   ) ; // Load the Version Manager module under test.


// Begin the main test suite for the 'Version manager' capabilities.
describe (   'Version manager'   ,   function (   )   {

    // This block runs once before all tests in this suite.
    before (   function (   done   )   {
        // Initialize the version manager. The first argument 'false' might
        // indicate a specific configuration or mode for testing.
        // The 'done' callback is crucial for asynchronous setup.
        vm.initialize (   false   ,   done   ) ;
    }   ) ;


    // --- Sub-suite: Tests for the 'upgradeDependencyDeclaration' method ---
    describe (   'upgradeDependencyDeclaration'   ,   function (   )   {

        // Test case focusing on various numeric version upgrade scenarios.
        it (   'numeric upgrades'   ,   function (   )   {
            // Simple major version upgrade from 0 to 1.
            vm.upgradeDependencyDeclaration (   "0"   ,   "1"   ) . should . equal (   "1"   ) ;
            // Major version upgrade from 1 to 10.
            vm.upgradeDependencyDeclaration (   "1"   ,   "10"   ) . should . equal (   "10"   ) ;
            // Test a downgrade scenario: 10 to 1. The method should pick the lower version if it's new.
            vm.upgradeDependencyDeclaration (   "10"   ,   "1"   ) . should . equal (   "1"   ) ;

            // Two-part version upgrades.
            vm.upgradeDependencyDeclaration (   "0.1"   ,   "1.0"   ) . should . equal (   "1.0"   ) ;
            vm.upgradeDependencyDeclaration (   "1.0"   ,   "1.1"   ) . should . equal (   "1.1"   ) ;
            // Two-part version downgrade test.
            vm.upgradeDependencyDeclaration (   "2.0"   ,   "1.1"   ) . should . equal (   "1.1"   ) ;

            // Three-part (semantic) version upgrades.
            vm.upgradeDependencyDeclaration (   "1.0.0"   ,   "1.0.1"   ) . should . equal (   "1.0.1"   ) ;
            vm.upgradeDependencyDeclaration (   "1.0.1"   ,   "1.1.0"   ) . should . equal (   "1.1.0"   ) ;
            vm.upgradeDependencyDeclaration (   "2.0.1"   ,   "2.0.11"   ) . should . equal (   "2.0.11"   ) ;
            // Three-part version downgrade test.
            vm.upgradeDependencyDeclaration (   "2.0.0"   ,   "1.0.0"   ) . should . equal (   "1.0.0"   ) ;

            // Mixed-part version upgrades (e.g., 3-part to 2-part, or 3-part to 1-part).
            vm.upgradeDependencyDeclaration (   "1.0.0"   ,   "1.1"   ) . should . equal (   "1.1"   ) ;
            vm.upgradeDependencyDeclaration (   "1.0.0"   ,   "2"   ) . should . equal (   "2"   ) ;
            // Mixed-part version downgrade test.
            vm.upgradeDependencyDeclaration (   "22.0.1"   ,   "22"   ) . should . equal (   "22"   ) ;
        }   ) ;


        // Test case for handling wildcard version declarations (e.g., '1.x', '*').
        it (   'wildcard upgrades'   ,   function (   )   {
            // If the existing declaration has a wildcard and the new version is compatible,
            // the wildcard part might be updated or kept.
            vm.upgradeDependencyDeclaration (   "1.x"   ,   "1.1"   ) . should . equal (   "1.x"   ) ;
            vm.upgradeDependencyDeclaration (   "1.x.1"   ,   "1.1.2"   ) . should . equal (   "1.x.2"   ) ;
            vm.upgradeDependencyDeclaration (   "1.0.x"   ,   "1.1.1"   ) . should . equal (   "1.1.x"   ) ;
            vm.upgradeDependencyDeclaration (   "1.0.x"   ,   "1.1"   ) . should . equal (   "1.1"   ) ;
            vm.upgradeDependencyDeclaration (   "1.0.x"   ,   "2"   ) . should . equal (   "2"   ) ;
            // Wildcard downgrade test.
            vm.upgradeDependencyDeclaration (   "2.0.x"   ,   "1.0.0"   ) . should . equal (   "1.0.x"   ) ;

            // Global wildcard '*' should typically remain unchanged unless a specific version is forced.
            vm.upgradeDependencyDeclaration (   "*"   ,   "1"   ) . should . equal (   "*"   ) ;
            vm.upgradeDependencyDeclaration (   "*"   ,   "1.1"   ) . should . equal (   "*"   ) ;
            // Specific wildcard pattern with downgrade.
            vm.upgradeDependencyDeclaration (   "*.1"   ,   "2.0.1"   ) . should . equal (   "*.0"   ) ;
        }   ) ;


        // Test case for upgrading versions that include constraints (e.g., '<', '>=', '^').
        it (   'constrained numeric upgrades'   ,   function (   )   {
            // Upgrade with a 'less than' constraint.
            vm.upgradeDependencyDeclaration (   "<1.0"   ,   "1.1"   ) . should . equal (   "<1.1"   ) ;
            vm.upgradeDependencyDeclaration (   "<1.0"   ,   "1.1.1"   ) . should . equal (   "<1.1"   ) ;
            // Upgrade with a 'greater than or equal to' constraint.
            vm.upgradeDependencyDeclaration (   ">=1.0"   ,   "2.0"   ) . should . equal (   ">=2.0"   ) ;
            // Test with extra whitespace in the constraint.
            vm.upgradeDependencyDeclaration (   ">= 1.0"   ,   "2.0"   ) . should . equal (   ">= 2.0"   ) ;
            // Upgrade with a caret (^) constraint.
            vm.upgradeDependencyDeclaration (   "^1.2.3"   ,   "1.2.4"   ) . should . equal (   "^1.2.4"   ) ;
        }   ) ;


        // Test case for more complex scenarios involving combined constraints and ranges.
        it (   'combined constraints and ranges'   ,   function (   )   {
            // Upgrade a declaration with multiple constraints.
            vm.upgradeDependencyDeclaration (   "^1.0.0 < 1.2.0"   ,   "3.1.0"   ) . should . equal (   "^3.1.0"   ) ;
            vm.upgradeDependencyDeclaration (   "~1.0 < 1.2.0"   ,   "3.1.0"   ) . should . equal (   "~3.0"   ) ;
            vm.upgradeDependencyDeclaration (   "1.x < 1.2.0"   ,   "3.1.0"   ) . should . equal (   "3.x"   ) ;
            vm.upgradeDependencyDeclaration (   "1.2.0 < 1.x"   ,   "3.1.0"   ) . should . equal (   "3.x"   ) ;
        }   ) ;


        // Test case to ensure that "unclean" semantic versions (e.g., with 'v' or '=') retain their prefixes.
        it (   'maintain "unclean" semantic versions'   ,   function (   )   {
            // Version prefixed with 'v'.
            vm.upgradeDependencyDeclaration (   "v1.0"   ,   "1.1"   ) . should . equal (   "v1.1"   ) ;
            // Version prefixed with '='.
            vm.upgradeDependencyDeclaration (   "=v1.0"   ,   "1.1"   ) . should . equal (   "=v1.1"   ) ;
            // Version prefixed with ' =' (with space).
            vm.upgradeDependencyDeclaration (   " =v1.0"   ,   "1.1"   ) . should . equal (   " =v1.1"   ) ;
        }   ) ;


        // This is a duplicate test case from the original code.
        // It is kept as-is to preserve the exact structure for Type I cloning.
        it (   'maintain "unclean" semantic versions'   ,   function (   )   {
            vm.upgradeDependencyDeclaration (   "v1.0"   ,   "1.1"   ) . should . equal (   "v1.1"   ) ;
            vm.upgradeDependencyDeclaration (   "=v1.0"   ,   "1.1"   ) . should . equal (   "=v1.1"   ) ;
            vm.upgradeDependencyDeclaration (   " =v1.0"   ,   "1.1"   ) . should . equal (   " =v1.1"   ) ;
        }   ) ;


        // Test case for scenarios where the new version provided is unknown or invalid.
        it (   'maintain existing version if new version is unknown'   ,   function (   )   {
            // If the new version is an empty string, the existing version should be returned.
            vm.upgradeDependencyDeclaration (   "1.0"   ,   ""   ) . should . equal (   "1.0"   ) ;
            // If the new version is null, the existing version should be returned.
            vm.upgradeDependencyDeclaration (   "1.0"   ,   null   ) . should . equal (   "1.0"   ) ;
        }   ) ;
    }   ) ;


    // --- Sub-suite: Tests for the 'upgradeDependencies' method ---
    describe (   'upgradeDependencies'   ,   function (   )   {
        // Test case: Verifying that the method returns an object with upgraded dependencies.
        it (   'return upgraded dependencies object'   ,   function (   )   {
            // Given an existing dependency object and a new version for 'mongodb',
            // expect the 'mongodb' dependency to be upgraded in the returned object.
            vm.upgradeDependencies (   { mongodb : '^1.4.29' }   ,   { mongodb : '1.4.30' }   ) . should . eql (   { mongodb : '^1.4.30' }   ) ;
        }   ) ;

        // Test case: Ensuring that the method does not downgrade dependencies.
        it (   'do not downgrade'   ,   function (   )   {
            // If the existing dependency is '^2.0.7' and the new version is '1.4.30' (lower),
            // the dependency should not be included in the upgraded object, effectively preventing a downgrade.
            vm.upgradeDependencies (   { mongodb : '^2.0.7' }   ,   { mongodb : '1.4.30' }   ) . should . eql (   { }   ) ;
        }   ) ;
    }   ) ;


    // --- Sub-suite: Tests for the 'getLatestPackageVersion' method ---
    describe (   'getLatestPackageVersion'   ,   function (   )   {
        // Test case: Retrieving the latest version for a valid package.
        it (   'valid package info'   ,   function (   done   )   {
            // Asynchronously fetch the latest version of the 'async' package.
            vm.getLatestPackageVersion (   "async"   ,   function (   error   ,   version   )   {
                should.exist (   version   ) ; // Assert that a version string was returned.
                version.should.be.type (   'string'   ) ; // Assert that the returned version is a string.
                done (   ) ; // Signal the completion of this asynchronous test.
            }   ) ;
        }   ) ;
    }   ) ;


    // --- Sub-suite: Tests for the 'getGreatestPackageVersion' method ---
    describe (   'getGreatestPackageVersion'   ,   function (   )   {
        // Test case: Retrieving the greatest version (including pre-releases, etc.) for a valid package.
        it (   'valid package info'   ,   function (   done   )   {
            // Asynchronously fetch the greatest version of the 'async' package.
            vm.getGreatestPackageVersion (   "async"   ,   function (   error   ,   version   )   {
                should.exist (   version   ) ; // Assert that a version string was returned.
                version.should.be.type (   'string'   ) ; // Assert that the returned version is a string.
                done (   ) ; // Signal the completion of this asynchronous test.
            }   ) ;
        }   ) ;
    }   ) ;


    // --- Sub-suite: Tests for the 'getLatestVersions' method ---
    describe (   'getLatestVersions'   ,   function (   )   {
        // Test case: Fetching the latest version for a single package.
        it (   'valid single package'   ,   function (   done   )   {
            // Request the latest version for 'async'.
            vm.getLatestVersions (   [ "async" ]   ,   function (   error   ,   latestVersions   )   {
                should.exist (   latestVersions.async   ) ; // Expect 'async' to have an entry in the result.
                done (   ) ;
            }   ) ;
        }   ) ;

        // Test case: Fetching the latest versions for multiple packages simultaneously.
        it (   'valid packages'   ,   function (   done   )   {
            // Request latest versions for both 'async' and 'npm'.
            vm.getLatestVersions (   [ "async"   ,   "npm" ]   ,   function (   error   ,   latestVersions   )   {
                should.exist (   latestVersions.async   ) ; // Expect 'async' version.
                should.exist (   latestVersions[ "npm" ]   ) ; // Expect 'npm' version.
                done (   ) ;
            }   ) ;
        }   ) ;

        // Test case: Ensuring that requesting unavailable packages does not cause an error or crash.
        it (   'unavailable packages should not blow up'   ,   function (   done   )   {
            // Request a package that is highly unlikely to exist.
            vm.getLatestVersions (   [ "sudoMakeMeASandwitch" ]   ,   function (   error   ,   latestVersions   )   {
                // The test passes if the callback is invoked without an unhandled exception.
                // No specific assertions on `latestVersions` are made, as the package won't exist.
                done (   ) ;
            }   ) ;
        }   ) ;

        // Test case: Verifying functionality when an optional options object is provided.
        it (   'optional options object'   ,   function (   done   )   {
            // Call with an empty options object, which should behave like no options.
            vm.getLatestVersions (   [ "async" ]   ,   { }   ,   function (   error   ,   latestVersions   )   {
                should.exist (   latestVersions.async   ) ;
                done (   ) ;
            }   ) ;
        }   ) ;

        // Test case: Explicitly setting the 'versionTarget' option to 'latest'.
        it (   'set the versionTarget explicitly to latest'   ,   function (   done   )   {
            // Ensure that explicitly requesting 'latest' works as expected.
            vm.getLatestVersions (   [ "async" ]   ,   { versionTarget : 'latest' }   ,   function (   error   ,   latestVersions   )   {
                should.exist (   latestVersions.async   ) ;
                done (   ) ;
            }   ) ;
        }   ) ;

        // Test case: Explicitly setting the 'versionTarget' option to 'greatest'.
        it (   'set the versionTarget to greatest'   ,   function (   done   )   {
            // Ensure that explicitly requesting 'greatest' works as expected.
            vm.getLatestVersions (   [ "async" ]   ,   { versionTarget : 'greatest' }   ,   function (   error   ,   latestVersions   )   {
                should.exist (   latestVersions.async   ) ;
                done (   ) ;
            }   ) ;
        }   ) ;

        // Test case: Handling an unsupported value for the 'versionTarget' option.
        it (   'should return an error for an unsupported versionTarget'   ,   function (   done   )   {
            // Providing an unknown 'versionTarget' like 'foo' should result in an error.
            vm.getLatestVersions (   [ "async" ]   ,   { versionTarget : 'foo' }   ,   function (   error   ,   latestVersions   )   {
                should.exist (   error   ) ; // An error object should be present.
                error.should.match (   /unsupported/i   ) ; // The error message should contain "unsupported".
                done (   ) ;
            }   ) ;
        }   ) ;

    }   ) ;


    // --- Sub-suite: Tests for the 'isUpgradeable' method ---
    describe (   "isUpgradeable"   ,   function (   )   {

        // Test case: Identifying when an existing version declaration is upgradeable to a new target version.
        it (   "should upgrade versions that do not satisfy latest versions"   ,   function (   )   {
            // "0.1.x" does not satisfy "0.5.1", so an upgrade is possible.
            vm.isUpgradeable (   "0.1.x"   ,   "0.5.1"   ) . should . equal (   true   ) ;
        }   ) ;

        // Test case: Ensuring that invalid version strings (e.g., URLs) are not considered upgradeable.
        it (   "should not upgrade invalid versions"   ,   function (   )   {
            // A GitHub URL is not a valid semantic version string, hence not upgradeable.
            vm.isUpgradeable (   "https://github.com/strongloop/express"   ,   "4.11.2"   ) . should . equal (   false   ) ;
        }   ) ;

        // Test case: Confirming that a version is not considered upgradeable if the current version is already greater than the target.
        it (   "should not upgrade versions beyond the latest"   ,   function (   )   {
            // "5.0.0" is already newer than "4.11.2", so no upgrade is needed or possible to the specified target.
            vm.isUpgradeable (   "5.0.0"   ,   "4.11.2"   ) . should . equal (   false   ) ;
        }   ) ;

    }   ) ;

}   ) ;