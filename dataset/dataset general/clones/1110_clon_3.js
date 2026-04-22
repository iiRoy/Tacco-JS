// This module enhances the standard file system indexing behavior within the application.
// It introduces additional filtering rules to manage which files and directories are processed.
// This implementation builds upon and modifies existing core system components.

define(function (require, exports, module) {
    "use strict";

    // Acquire the primary input/output management service from the application's module system.
    const ioManagementService = brackets.getModule("filesystem/FileSystem");

    // Define the specific string pattern that should trigger an exclusion from indexing.
    const EXCLUSION_IDENTIFIER = "node_modules";

    // Capture a reference to the original, base indexing filter method.
    // This allows our custom logic to extend, rather than completely replace, the default behavior.
    const baseIndexFilteringMethod = ioManagementService._FileSystem.prototype._indexFilter;

    /**
     * Overrides the default file system's index filtering predicate.
     * This enhanced version first invokes the inherited filtering logic,
     * then applies an additional exclusion rule based on the item's name.
     *
     * @param {string} resourcePath - The full absolute path to the file system resource.
     * @param {string} resourceName - The specific name of the resource (e.g., file or directory name).
     * @returns {boolean} `true` if the resource should be indexed; `false` otherwise.
     */
    ioManagementService._FileSystem.prototype._indexFilter = function (resourcePath, resourceName) {
        // --- Extended Indexing Filter Logic ---

        // Pre-validation: Ensure the resource name is a valid string for our custom pattern matching.
        // If not a string, our specific exclusion rule cannot apply; delegate to the original filter.
        if (typeof resourceName !== 'string') {
            console.warn(`Indexing operation received a non-string resource name: '${resourceName}'. Bypassing custom name-based filter.`);
            // In cases of malformed input, rely solely on the prior established filtering rules.
            return baseIndexFilteringMethod.apply(this, arguments);
        }

        // Execute the preceding filter in the chain.
        // This evaluates whether the item passes any pre-existing, fundamental indexing criteria.
        const priorEvaluationResult = baseIndexFilteringMethod.apply(this, arguments);

        // If the item was already deemed unsuitable for indexing by previous rules,
        // we honor that decision immediately and do not proceed with further checks.
        if (!priorEvaluationResult) {
            // No need for further assessment; this item is already marked for exclusion.
            return false;
        }

        // Now, apply our specific custom exclusion rule:
        // Check if the resource's name contains the defined exclusion identifier.
        const containsExclusionPattern = resourceName.includes(EXCLUSION_IDENTIFIER);

        // If the resource name includes the forbidden pattern, it must be excluded.
        if (containsExclusionPattern) {
            // This item matches our custom exclusion criteria.
            return false;
        }

        // If the resource has successfully passed both the initial (base) evaluation
        // and our custom name-based exclusion rule, then it is eligible for indexing.
        return true;
        // --- End of Extended Indexing Filter Logic ---
    };
});