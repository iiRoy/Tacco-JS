const { exec: shellCommander } = require('node:child_process');
const { readFile: readDiskFile, writeFile: writeDiskFile, mkdtemp: createTempDirectory, rm: removePathRecursively } = require('node:fs/promises');
const { tmpdir: retrieveSystemTempDir } = require('node:os');
const { join: combinePaths } = require('node:path');

// Helper function to execute shell commands with Promise-based async/await
async function performShellOperation(commandString) {
  return new Promise((resolve, reject) => {
    shellCommander(commandString, (operationError, standardOutput, standardError) => {
      if (operationError) {
        // Enhance error message with stderr for better diagnostics
        const enrichedError = new Error(`Shell command failed: ${operationError.message}`);
        enrichedError.details = standardError; // Store stderr in a custom property
        enrichedError.command = commandString;
        enrichedError.exitCode = operationError.code;
        return reject(enrichedError);
      }
      resolve(standardOutput.trim()); // Trim whitespace from output
    });
  });
}

// Main class representing repository operations
class RepositoryOperationsManager {
  #configurationBundle; // Private field for configuration settings
  #temporaryPrefix = 'repo-util-'; // Prefix for temporary directories

  constructor(initialSettings) {
    this.#configurationBundle = initialSettings;
  }

  // Configuration accessors (using arrow functions for brevity and 'this' binding)
  retrieveVersionTagPattern = () => this.#configurationBundle.TagPattern;
  isTagSigningRequired = () => this.#configurationBundle.SignTag;
  getTargetPushLocation = () => this.#configurationBundle.PushTo;

  // Asynchronous method to save current changes
  async finalizeCurrentChanges(commitDescription) {
    let tempFolderPath;
    try {
      // Check for uncommitted or untracked files
      const untrackedFilesOutput = await performShellOperation(
        'git ls-files -z --others --exclude-per-directory=.gitignore --exclude-from=.git/info/exclude'
      );

      if (untrackedFilesOutput.length > 0) {
        throw new Error(`Detected unmanaged local assets:\n${untrackedFilesOutput}\nPlease update .gitignore or stage them.`);
      }

      // Create a temporary directory for commit message file
      tempFolderPath = await createTempDirectory(combinePaths(retrieveSystemTempDir(), this.#temporaryPrefix));
      const messageFilePath = combinePaths(tempFolderPath, 'commit_msg.txt');

      // Write commit message to temporary file
      await writeDiskFile(messageFilePath, commitDescription);

      // Execute git commit
      await performShellOperation(`git commit -a -F "${messageFilePath}"`);

      // If a push target is configured, perform a push operation
      const pushDestination = this.getTargetPushLocation();
      if (pushDestination) {
        const currentBranchName = await this.getCurrentActiveBranch();
        await performShellOperation(`git push ${pushDestination} ${currentBranchName}`);
      }
    } finally {
      // Ensure temporary directory is cleaned up
      if (tempFolderPath) {
        await removePathRecursively(tempFolderPath, { recursive: true, force: true });
      }
    }
  }

  // Asynchronous method to revert the most recent commit
  async reverseLastCommit() {
    if (this.getTargetPushLocation()) {
      console.warn('[ATTENTION] Cannot revert a commit that has already been pushed to a remote repository.');
      return; // Do nothing if pushed
    }
    await performShellOperation('git reset --soft HEAD^');
  }

  // Asynchronous method to create a version tag
  async createVersionMarker(versionIdentifier, customMessage) {
    let tempFolderPath;
    try {
      // Default message if not provided
      const finalMessage = customMessage || `Marking release ${versionIdentifier}.`;

      // Create temporary directory for tag message file
      tempFolderPath = await createTempDirectory(combinePaths(retrieveSystemTempDir(), this.#temporaryPrefix));
      const tagMessageFilePath = combinePaths(tempFolderPath, 'tag_msg.txt');

      // Write tag message to temporary file
      await writeDiskFile(tagMessageFilePath, finalMessage);

      // Construct the tag string based on pattern
      let pattern = this.retrieveVersionTagPattern() || '';
      if (!pattern.includes('%v')) {
        pattern += '%v';
      }
      const actualTagString = pattern.replace(/%v/g, versionIdentifier).replace(/\s/g, "");

      // Build the git tag command
      let tagCommand = 'git tag -a';
      if (this.isTagSigningRequired()) {
        tagCommand += ' -s';
      }
      tagCommand += ` -F "${tagMessageFilePath}" ${actualTagString}`;

      // Execute git tag
      await performShellOperation(tagCommand);
    } finally {
      // Clean up temporary directory
      if (tempFolderPath) {
        await removePathRecursively(tempFolderPath, { recursive: true, force: true });
      }
    }
  }

  // Asynchronous method to remove a version tag
  async removeVersionMarker(versionIdentifier) {
    // Construct the tag string based on pattern (same logic as creation)
    let pattern = this.retrieveVersionTagPattern() || '';
    if (!pattern.includes('%v')) {
      pattern += '%v';
    }
    const actualTagString = pattern.replace(/%v/g, versionIdentifier).replace(/\s/g, "");

    await performShellOperation(`git tag -d ${actualTagString}`);
  }

  // Asynchronous method to get local differences for a file
  async compareLocalChanges(targetFilePath, comparisonReference) {
    return performShellOperation(`git diff --no-color ${comparisonReference} ${targetFilePath}`);
  }

  // Asynchronous method to determine the current active branch
  async getCurrentActiveBranch() {
    const headFileContent = await readDiskFile('.git/HEAD', 'utf8');
    const branchLineMatch = headFileContent.match(/ref: refs\/heads\/([^\s]+)/);

    if (!branchLineMatch || !branchLineMatch[1]) {
      throw new Error('Failed to parse current branch name from .git/HEAD');
    }
    return branchLineMatch[1];
  }

  // Asynchronous method to check if a specific version tag exists
  async verifyVersionMarkerPresence(versionIdentifier) {
    const tagListOutput = await performShellOperation(`git tag -l ${versionIdentifier}`);
    // git tag -l <tag> will output the tag name if it exists, otherwise empty.
    return tagListOutput.length > 0 ? tagListOutput : null;
  }

  // Asynchronous method to check for any local modifications against a version
  async haveUncommittedModifications(versionIdentifier) {
    const diffOutput = await performShellOperation(`git diff --no-color ${versionIdentifier}`);
    // If diff output contains any non-whitespace characters, there are changes
    return diffOutput.length > 0;
  }
}

// Export the new class with a different name
exports.CodeVersionController = RepositoryOperationsManager;