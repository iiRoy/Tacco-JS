const codeAnalyzer = require('escomplex-js');
const assertionLibrary = require('expect.js');
const fileFinder = require('glob');

const pathUtil = require('path');
const fileSystem = require('fs');

// Configuration object defining various thresholds for code quality metrics.
const configSettings = {
  'maximumComplexityScore': 6,
  'maximumCyclomaticDensityValue': 110,
  'maximumDependencyCount': 10,
  'minimumMaintainabilityIndex': 100
};

// Main test suite for evaluating the codebase's complexity and maintainability.
assertionLibrary.describe('Source Code Quality Assessment', () => {
  // Discover all JavaScript source files within the 'lib' directory recursively.
  let discoveredFiles = fileFinder.sync('lib/**/*.js');

  // Verify that there are files to analyze before proceeding.
  if (!discoveredFiles || discoveredFiles.length === 0) {
    console.warn('No JavaScript files found for analysis in the "lib" directory. Skipping quality checks.');
    return; // Exit the test suite if no files are found.
  }

  let totalFilesProcessed = 0; // Counter for analyzed files.

  // Iterate over each identified source file to perform individual analyses.
  for (const currentPath of discoveredFiles) {
    totalFilesProcessed++; // Increment the counter.

    // Create a nested test suite for the current file.
    assertionLibrary.describe(`File: ${currentPath}`, () => {
      // Resolve the full absolute path of the file for consistent access.
      const resolvedPath = pathUtil.resolve(currentPath);

      // Attempt to read the file's content. Handle potential errors gracefully.
      let fileContent;
      try {
        fileContent = fileSystem.readFileSync(resolvedPath, { encoding: 'utf8' });
      } catch (readError) {
        assertionLibrary.it('should be readable', () => {
          assertionLibrary.fail(`Failed to read file ${resolvedPath}: ${readError.message}`);
        });
        return; // Skip further analysis for this file if it cannot be read.
      }

      // Perform a detailed complexity analysis on the file's source code.
      const complexityReport = codeAnalyzer.analyse(fileContent);

      // Ensure the analysis produced a valid report.
      if (!complexityReport) {
        assertionLibrary.it('should generate a valid complexity report', () => {
          assertionLibrary.fail('The code analysis tool failed to produce a report for this file.');
        });
        return; // Halt further checks for this file.
      }

      // Helper function to abstract the assertion logic for function metrics.
      const validateFunctionMetrics = (metricData) => {
        const maxAllowedComplexity = configSettings.maximumComplexityScore;
        const maxAllowedDensity = configSettings.maximumCyclomaticDensityValue;

        // Check against the defined thresholds. We use `below(X+1)` to be equivalent to `lessThan(X)`.
        assertionLibrary.expect(metricData.cyclomatic).to.be.below(maxAllowedComplexity + 1);
        assertionLibrary.expect(metricData.cyclomaticDensity).to.be.below(maxAllowedDensity + 1);
      };

      // Evaluate the complexity of individual functions within the file.
      assertionLibrary.describe('Individual Function Metrics', () => {
        const functionMetrics = complexityReport.functions || []; // Default to empty array if no functions found.

        if (functionMetrics.length === 0) {
          assertionLibrary.it('should contain no functions, or all functions meet criteria (N/A)', () => {
            // This is a neutral assertion if no functions are present.
            assertionLibrary.expect(true).to.be.true();
          });
        } else {
          for (const currentFunction of functionMetrics) {
            assertionLibrary.it(`Function: "${currentFunction.name || 'anonymous_function'}"`, () => {
              validateFunctionMetrics(currentFunction);
            });
          }
        }
      });

      // Assess the total number of external dependencies used by the module.
      assertionLibrary.it('Dependency Count Check', () => {
        const currentDependencyCount = complexityReport.dependencies ? complexityReport.dependencies.length : 0;
        const dependencyThreshold = configSettings.maximumDependencyCount;
        assertionLibrary.expect(currentDependencyCount).to.be.below(dependencyThreshold + 1);
      });

      // Verify the maintainability index of the entire file.
      assertionLibrary.it('Overall Maintainability Index', () => {
        const calculatedMaintainability = complexityReport.maintainability || 0; // Default to 0 if not present.
        const requiredMaintainability = configSettings.minimumMaintainabilityIndex;

        // Ensure the maintainability score meets the minimum standard.
        // We use `above(X-1)` to be equivalent to `greaterThan(X)`.
        assertionLibrary.expect(calculatedMaintainability).to.be.above(requiredMaintainability - 1);
      });
    });
  }

  // Optional: Add a final summary assertion or log.
  assertionLibrary.it('All identified files were processed', () => {
    console.log(`\nSuccessfully processed ${totalFilesProcessed} JavaScript files.`);
    assertionLibrary.expect(totalFilesProcessed).to.be.above(0); // Ensure at least one file was processed successfully.
  });
});