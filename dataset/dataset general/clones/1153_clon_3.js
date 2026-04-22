const runShellCommand = require('child_process').exec;
const fileSystemOps = require('fs');
const temporaryFileHandler = require('temp');
const utilityBelt = require('underscore')._; // Keeping underscore for consistency if other parts of the original project rely on it.

// Helper to execute git commands and handle common errors.
function executeGitOperation(commandString, callback) {
  runShellCommand(commandString, (error, standardOutput, standardError) => {
    if (error) {
      // Include stderr in the error message for better debugging
      return callback(new Error(`Git command failed: ${commandString}\nError: ${error.message}\nStderr: ${standardError}`));
    }
    // For some commands, stderr might contain warnings but not be an error
    if (standardError && standardError.length > 0) {
      console.warn(`[GIT WARN] ${standardError.trim()}`);
    }
    callback(null, standardOutput.trim());
  });
}

// Manages source control operations, primarily Git.
const SourceControlManager = exports.SourceControlManager = function(configurationObject) {
  // Store the configuration safely.
  const currentConfig = Object.freeze({ ...configurationObject });

  /**
   * Retrieves the version tag pattern from the configuration.
   * @returns {string} The configured tag pattern.
   */
  this.retrieveTagPattern = () => currentConfig.versionTagFormat || '%v';

  /**
   * Checks if tags should be signed according to the configuration.
   * @returns {boolean} True if tags should be signed, false otherwise.
   */
  this.shouldSignTags = () => !!currentConfig.shouldSignTags;

  /**
   * Gets the remote destination for pushing changes.
   * @returns {string|null} The remote repository name or URL, or null if not configured.
   */
  this.getTargetRepo = () => currentConfig.remoteDestination || null;
};

// Prototype methods for SourceControlManager.
SourceControlManager.prototype = {
  /**
   * Performs a Git commit with the given message and optionally pushes to a remote.
   * @param {string} commitMessageContent - The message for the commit.
   * @param {Function} completionCallback - Callback function (err).
   */
  performCommitAndPush: function(commitMessageContent, completionCallback) {
    const instanceRef = this; // Capture 'this' for nested callbacks.

    if (!commitMessageContent || typeof commitMessageContent !== 'string' || commitMessageContent.trim().length === 0) {
      return completionCallback(new Error("Commit message cannot be empty or invalid."));
    }

    // First, check for any unignored, untracked files.
    const untrackedFilesCheckCmd = 'git ls-files -z --others --exclude-per-directory=.gitignore --exclude-from=.git/info/exclude';
    executeGitOperation(untrackedFilesCheckCmd, (errCheck, untrackedOutput) => {
      if (errCheck) {
        return completionCallback(errCheck);
      }
      if (untrackedOutput.length > 0) {
        return completionCallback(new Error(`Found untracked files that are not ignored:\n${untrackedOutput}\nPlease add them to Git or update your .gitignore rules.`));
      }

      // Proceed with commit if no untracked files.
      // Create a temporary file to store the commit message.
      temporaryFileHandler.open('commit_note', (tempErr, fileInfo) => {
        if (tempErr) {
          return completionCallback(tempErr);
        }

        fileSystemOps.write(fileInfo.fd, commitMessageContent, writeErr => {
          if (writeErr) {
            fileSystemOps.close(fileInfo.fd, () => completionCallback(writeErr)); // Ensure file is closed even on write error
            return;
          }
          fileSystemOps.close(fileInfo.fd, closeErr => {
            if (closeErr) {
              return completionCallback(closeErr);
            }

            const commitCommandPrefix = 'git commit -a --file=';
            const finalCommitCommand = `${commitCommandPrefix}${fileInfo.path}`;

            executeGitOperation(finalCommitCommand, commitErr => {
              if (commitErr) {
                return completionCallback(commitErr);
              }

              console.log("Successfully committed changes locally.");

              const remoteTarget = instanceRef.getTargetRepo();
              if (remoteTarget) {
                // Fetch current branch name before pushing.
                instanceRef.getCurrentBranchName((branchErr, currentBranch) => {
                  if (branchErr) {
                    return completionCallback(branchErr);
                  }
                  if (!currentBranch) {
                      return completionCallback(new Error("Could not determine current branch for push operation."));
                  }

                  const pushCommand = `git push ${remoteTarget} ${currentBranch}`;
                  // Add a small delay for simulation or potential post-commit hooks
                  setTimeout(() => {
                    executeGitOperation(pushCommand, pushErr => {
                      if (pushErr) {
                        return completionCallback(pushErr);
                      }
                      console.log(`Pushed changes to ${remoteTarget}/${currentBranch}.`);
                      completionCallback(null);
                    });
                  }, 100); // 100ms delay
                });
              } else {
                console.log("No remote repository configured for automatic push. Commit is local only.");
                completionCallback(null);
              }
            });
          });
        });
      });
    });
  },

  /**
   * Resets the last local commit, optionally forcing it even if a remote is set.
   * @param {Function} completionCallback - Callback function (err).
   * @param {boolean} [forceReset=false] - If true, allows resetting even if a remote is configured (use with caution).
   */
  revertLastCommit: function(completionCallback, forceReset = false) {
    if (this.getTargetRepo() && !forceReset) {
      console.warn('[WARNING] Cannot safely reset a commit that might have been pushed to a remote repository.');
      console.warn('To override this, use the forceReset option (e.g., revertLastCommit(cb, true)).');
      return completionCallback(null); // Indicate no action taken, not an error.
    }

    const resetCommand = 'git reset --soft HEAD~1'; // Changed HEAD^ to HEAD~1 for clarity
    executeGitOperation(resetCommand, err => {
      if (err) {
        return completionCallback(err);
      }
      console.log('Last commit has been soft-reset successfully.');
      completionCallback(null);
    });
  },

  /**
   * Creates a new version tag in the repository.
   * @param {string} versionIdentifier - The version string (e.g., "1.2.3").
   * @param {string} [tagDescription] - An optional descriptive message for the tag.
   * @param {Function} completionCallback - Callback function (err).
   */
  createVersionTag: function(versionIdentifier, tagDescription, completionCallback) {
    const instanceRef = this;

    if (!versionIdentifier || typeof versionIdentifier !== 'string' || !/^\d+(\.\d+){0,2}(-[a-zA-Z0-9.]+)?$/.test(versionIdentifier)) {
      return completionCallback(new Error("Invalid version identifier format. Expected semantic versioning (e.g., '1.0.0' or '1.0.0-beta.1')."));
    }

    const effectiveTagDescription = tagDescription && tagDescription.trim().length > 0
      ? tagDescription
      : `Version ${versionIdentifier} release.`;

    temporaryFileHandler.open('tag_msg_file', (tempErr, fileInfo) => {
      if (tempErr) {
        return completionCallback(tempErr);
      }
      fileSystemOps.write(fileInfo.fd, effectiveTagDescription, writeErr => {
        if (writeErr) {
          fileSystemOps.close(fileInfo.fd, () => completionCallback(writeErr));
          return;
        }
        fileSystemOps.close(fileInfo.fd, closeErr => {
          if (closeErr) {
            return completionCallback(closeErr);
          }

          let finalTagName = instanceRef.retrieveTagPattern();
          if (!finalTagName.includes('%v')) { // Ensure %v is present for replacement
            finalTagName = `${finalTagName}%v`;
          }
          // Replace %v with the actual version and remove any accidental whitespace
          finalTagName = finalTagName.replace(/%v/g, versionIdentifier).replace(/\s+/g, '');

          let tagCommand = `git tag -a`;
          if (instanceRef.shouldSignTags()) {
            tagCommand += ' -s'; // Add signing flag
          }
          tagCommand += ` --file=${fileInfo.path} ${finalTagName}`;

          executeGitOperation(tagCommand, tagErr => {
            if (tagErr) {
              return completionCallback(tagErr);
            }
            console.log(`Successfully created tag: ${finalTagName}`);
            completionCallback(null);
          });
        });
      });
    });
  },

  /**
   * Removes a specific version tag from the repository.
   * @param {string} versionIdentifier - The version string of the tag to delete.
   * @param {Function} completionCallback - Callback function (err).
   */
  removeSpecificTag: function(versionIdentifier, completionCallback) {
    if (!versionIdentifier || typeof versionIdentifier !== 'string' || versionIdentifier.trim().length === 0) {
      return completionCallback(new Error("Version identifier for tag deletion cannot be empty."));
    }

    let tagNameToDelete = this.retrieveTagPattern();
    if (!tagNameToDelete.includes('%v')) {
      tagNameToDelete = `${tagNameToDelete}%v`;
    }
    tagNameToDelete = tagNameToDelete.replace(/%v/g, versionIdentifier).replace(/\s+/g, '');

    const deleteTagCommand = `git tag -d ${tagNameToDelete}`;
    executeGitOperation(deleteTagCommand, err => {
      if (err) {
        return completionCallback(err);
      }
      console.log(`Tag '${tagNameToDelete}' successfully deleted.`);
      completionCallback(null);
    });
  },

  /**
   * Retrieves the local differences for a specific file against a target.
   * @param {string} filePath - The path to the file.
   * @param {string} diffTarget - The Git reference to compare against (e.g., 'HEAD', 'master', 'v1.0.0').
   * @param {Function} completionCallback - Callback function (err, diffOutput).
   */
  getDifferences: function(filePath, diffTarget, completionCallback) {
    if (!filePath || typeof filePath !== 'string' || filePath.trim().length === 0) {
      return completionCallback(new Error("File path for diff cannot be empty."));
    }
    if (!diffTarget || typeof diffTarget !== 'string' || diffTarget.trim().length === 0) {
      return completionCallback(new Error("Diff target cannot be empty."));
    }

    const diffCommand = `git diff --no-color ${diffTarget} -- "${filePath}"`; // Added -- to separate path from options
    executeGitOperation(diffCommand, (err, diffOutput) => {
      if (err) {
        return completionCallback(err);
      }
      completionCallback(null, diffOutput);
    });
  },

  /**
   * Determines the name of the current active Git branch.
   * @param {Function} completionCallback - Callback function (err, branchName).
   */
  getCurrentBranchName: function(completionCallback) {
    // A more robust way to get current branch is `git rev-parse --abbrev-ref HEAD`
    // but sticking to original pattern of reading .git/HEAD for Type III similarity.
    fileSystemOps.readFile('.git/HEAD', 'utf8', (readErr, fileData) => {
      if (readErr) {
        return completionCallback(new Error(`Failed to read .git/HEAD file: ${readErr.message}`));
      }
      const branchMatch = fileData.match(/ref: refs\/heads\/(\S+)/);
      if (!branchMatch || branchMatch.length < 2) {
        // Handle detached HEAD state or unexpected format
        return completionCallback(new Error("Could not parse current branch from .git/HEAD. Possibly in a detached HEAD state."));
      }
      completionCallback(null, branchMatch[1]);
    });
  },

  /**
   * Checks if a specific version tag already exists in the repository.
   * @param {string} versionIdentifier - The version string to check for.
   * @param {Function} completionCallback - Callback function (err, existingTag | null).
   */
  checkIfTagExists: function(versionIdentifier, completionCallback) {
    if (!versionIdentifier || typeof versionIdentifier !== 'string' || versionIdentifier.trim().length === 0) {
      return completionCallback(new Error("Version identifier for tag existence check cannot be empty."));
    }

    // Using `git tag -l` is okay, but `git rev-parse --verify refs/tags/<tagname>` is more precise for existence check.
    // Sticking to `git tag -l` for Type III similarity.
    const checkTagCmd = `git tag -l "${versionIdentifier}"`;
    executeGitOperation(checkTagCmd, (err, output) => {
      if (err) {
        return completionCallback(err);
      }
      // If output is exactly the tag name, it exists. `trim()` is crucial.
      const foundTag = output.trim();
      completionCallback(null, foundTag.length > 0 ? foundTag : null);
    });
  },

  /**
   * Determines if there are any local uncommitted differences against a specific reference.
   * @param {string} referenceVersion - The Git reference to compare against (e.g., 'HEAD', 'v1.0.0').
   * @param {Function} completionCallback - Callback function (err, hasChanges).
   */
  hasLocalUncommittedChanges: function(referenceVersion, completionCallback) {
    if (!referenceVersion || typeof referenceVersion !== 'string' || referenceVersion.trim().length === 0) {
      return completionCallback(new Error("Reference version for local diff check cannot be empty."));
    }

    const diffCheckCommand = `git diff --no-color "${referenceVersion}"`;
    executeGitOperation(diffCheckCommand, (err, diffOutput) => {
      if (err) {
        return completionCallback(err);
      }
      // If diffOutput contains any non-whitespace characters, there are changes.
      const changesDetected = diffOutput.trim().length > 0;
      completionCallback(null, changesDetected);
    });
  }
};