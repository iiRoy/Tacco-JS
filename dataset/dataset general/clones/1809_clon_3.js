const osPath = require('path');
const fileSystem = require('fs');
const promiseLib = require('q'); // Renamed 'q' to 'promiseLib'
const systemExec = require('child_process');
const tempFiles = require('temp'); // Renamed 'temp' to 'tempFiles'
const textColors = require('colors');
const lodashLike = require('underscore'); // Renamed '_' to 'lodashLike'
const htmlFormatter = require("html");
const RallyGateway = require('./ralio'); // Renamed 'Ralio' to 'RallyGateway'

// Constants for various work item states and their symbolic representations
const WorkItemStateMap = {
  "Suggestion": "?",
  "Defined": "·",
  "Submitted": "·",
  "In-Progress": "▸",
  "Completed": "✔",
  "Fixed": "✔",
  "Closed": "✔",
  "Accepted": "✩",
  "Released": "✮",
  "Grooming": "⌚",
  "Blocked": "⛔" // Added a new state symbol
};

const TaskProgressIndicators = lodashLike.extend({}, WorkItemStateMap, {
  "Open": "·",
  // No specific changes for 'Submitted', 'Defined', 'In-Progress', 'Completed', 'Fixed' here as they are inherited
});

/**
 * A client utility for interacting with a work management system via command line.
 * @param {string} entryPointUrl - The base URL for the Rally API.
 * @constructor
 */
function WorkItemCommander(entryPointUrl) {
  // Establish the service endpoint, defaulting if none provided
  this.serviceEndpoint = entryPointUrl || 'https://rally1.rallydev.com/';
  // Perform initial setup of the tool's configuration
  this.setupToolConfiguration();
  // Initialize the API client with credentials from the configuration
  this.apiConnector = new RallyGateway(
    this.serviceEndpoint,
    this.toolConfig.username,
    this.toolConfig.password,
    this.toolConfig.project,
    this.toolConfig.team
  );
  // Initialize a list to keep track of recently viewed item IDs for quick access
  this.localReferenceCache = [];
}

/**
 * Helper function to safely parse JSON from a file.
 * @param {string} filePath - The path to the JSON file.
 * @returns {object|null} Parsed JSON object or null if an error occurs.
 */
const safeParseJsonFile = (filePath) => {
  try {
    const fileContent = fileSystem.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContent);
  } catch (error) {
    // Log the error but don't terminate the process immediately,
    // allowing higher-level error handling to decide.
    console.error(`Error reading or parsing config file ${filePath}: ${error.message}`.red);
    return null;
  }
};

/**
 * Sets up the tool's configuration from local files.
 * Reads the main configuration and a list of recently accessed items.
 */
WorkItemCommander.prototype.setupToolConfiguration = function () {
  const userHomeDir = process.env.HOME;
  const mainConfigPath = osPath.join(userHomeDir, '.rallycli_config'); // Renamed config file
  const recentItemsStorePath = osPath.join(userHomeDir, '.rallycli_recent_refs'); // Renamed quickIDs file

  // Attempt to load the main configuration
  this.toolConfig = safeParseJsonFile(mainConfigPath);
  if (!this.toolConfig) {
    console.log('~/.rallycli_config not found or invalid! Please create it.'.red);
    // Exit the process if core configuration is missing or malformed
    process.exit(1);
  }

  // Load recently accessed item references if the file exists
  if (fileSystem.existsSync(recentItemsStorePath)) {
    this.cachedItemRefs = safeParseJsonFile(recentItemsStorePath);
    if (!this.cachedItemRefs) {
      // If parsing fails for recent items, initialize an empty array
      this.cachedItemRefs = [];
    }
  } else {
    this.cachedItemRefs = []; // Initialize empty if file doesn't exist
  }
};

/**
 * Displays a summary of backlog items.
 * @param {object} displayOptions - Options for filtering and display.
 */
WorkItemCommander.prototype.viewBacklog = function (displayOptions) {
  const currentInstance = this;
  const targetTeam = this.toolConfig.team;
  const targetProject = displayOptions.project || this.toolConfig.project;
  const effectiveProjectName = targetProject || targetTeam;

  // Prepare query parameters for the API call
  const queryParams = {
    projectName: effectiveProjectName,
    pageSize: displayOptions.all ? 100 : 20, // Fetch all or a limited number
    itemTag: displayOptions.tag || null // Filter by tag if provided
  };

  this.apiConnector.fetchBacklogItems(queryParams, (err, workItems) => {
    currentInstance.processApiError(err); // Handle any API errors

    if (!workItems || workItems.length === 0) {
      console.log('No backlog items found for the specified criteria.'.yellow);
      return;
    }

    let itemsToDisplay = workItems;
    if (!displayOptions.all && workItems.length > 20) {
      itemsToDisplay = workItems.slice(0, 20); // Limit to 20 if not showing all
    }

    // Iterate and print each work item summary
    itemsToDisplay.forEach(item => {
      currentInstance.renderStorySummary(item, { showStatus: false, showTags: true });
    });

    currentInstance.saveLocalReferenceCache(); // Persist quick IDs
  });
};

/**
 * Displays items for a specific sprint or iteration.
 * @param {object} options - Options for filtering and display.
 */
WorkItemCommander.prototype.displayIterationItems = function (options) {
  const currentInstance = this;
  const targetTeam = options.group || this.toolConfig.team;
  const targetProject = options.project || this.toolConfig.project;
  const effectiveProjectName = targetProject || targetTeam;

  this.apiConnector.getIterationItems(effectiveProjectName, options, (err, items) => {
    currentInstance.processApiError(err);

    if (!items || items.length === 0) {
      console.log('No iteration items found for the specified criteria.'.yellow);
      return;
    }

    items.forEach(item => {
      // Only display items that are not 'Accepted' unless explicitly requested
      const shouldDisplay = item.ScheduleState !== 'Accepted' || options.accepted;

      if (shouldDisplay) {
        const associatedTasks = [...(item.Tasks || []), ...(item.Defects || [])]; // Combine tasks and defects
        const hasAssociatedTasks = associatedTasks.length > 0;

        if (hasAssociatedTasks) {
          currentInstance.renderStorySummary(item, { showOwners: !options.tasks });
          if (options.tasks) {
            associatedTasks.forEach(taskEntry => {
              currentInstance.renderTaskSummary(taskEntry);
            });
          }
        } else {
          // If no specific tasks/defects, print the story as a task line
          currentInstance.renderTaskSummary(item, { indented: false, showPoints: true });
        }
      }
    });
    currentInstance.saveLocalReferenceCache();
  });
};

/**
 * Shows the currently active work items for the configured team.
 */
WorkItemCommander.prototype.showActiveWorkItems = function () {
  const currentInstance = this;
  this.apiConnector.fetchCurrentWork(this.toolConfig.team, (err, activeItems) => {
    currentInstance.processApiError(err);

    if (!activeItems || activeItems.length === 0) {
      console.log('No active work items found for the current team.'.yellow);
      return;
    }

    activeItems.forEach(item => {
      currentInstance.renderStorySummary(item);
      (item.Tasks || []).forEach(taskEntry => {
        currentInstance.renderTaskSummary(taskEntry);
      });
    });
    currentInstance.saveLocalReferenceCache();
  });
};

/**
 * Pre-formats HTML content for better display.
 * @param {string} rawHtml - The HTML string to format.
 * @returns {string} The formatted HTML string.
 */
WorkItemCommander.prototype.formatHtmlContent = function (rawHtml) {
  return htmlFormatter.prettyPrint(rawHtml, { indent_size: 2 });
};

/**
 * Defines rules for processing different types of fields.
 * This object is a property of WorkItemCommander, making 'this' accessible.
 */
WorkItemCommander.prototype.FieldProcessingRules = {
  // Supported field types and their associated processing details
  supportedFieldTypes: [
    { typeName: "STRING", fileExtension: '.txt' },
    { typeName: "BOOLEAN", fileExtension: '.txt' },
    { typeName: "INTEGER", fileExtension: '.txt' },
    { typeName: "TEXT", fileExtension: '.html', preprocessor: WorkItemCommander.prototype.formatHtmlContent }
  ],

  /**
   * Retrieves the processing rules for a given field type.
   * @param {string} typeKey - The identifier for the field type (e.g., "STRING", "TEXT").
   * @returns {object|undefined} The rules object or undefined if not found.
   */
  getRulesForType: function (typeKey) {
    return this.supportedFieldTypes.find(rule => rule.typeName === typeKey);
  }
};

/**
 * Allows editing a specific field of an artifact using an external editor.
 * @param {string} formattedArtifactId - The ID of the artifact to edit (e.g., US1234).
 * @param {string} fieldToModify - The name of the field to open for editing.
 */
WorkItemCommander.prototype.modifyArtifactField = function (formattedArtifactId, fieldToModify) {
  const currentInstance = this;

  // Fetch the artifact and its type definition
  this.apiConnector.getArtifactDetails(formattedArtifactId, { fetchFields: fieldToModify }, { includeTypeDefinition: true }, (err, artifactDetails) => {
    currentInstance.processApiError(err);

    // Validate that the field exists on the artifact
    if (!artifactDetails || !artifactDetails.hasOwnProperty(fieldToModify)) {
      return currentInstance.processApiError(`Field '${fieldToModify}' not found on artifact '${formattedArtifactId}'.`);
    }

    // Determine the field's data type from its type definition
    const fieldTypeDefinition = (artifactDetails._typeDefinition.Attributes || []).find(
      attr => attr.ElementName === fieldToModify
    );

    if (!fieldTypeDefinition) {
      return currentInstance.processApiError(`Could not find type definition for field '${fieldToModify}'.`);
    }

    const fieldDataType = fieldTypeDefinition.AttributeType;
    const fieldProcessingOpts = currentInstance.FieldProcessingRules.getRulesForType(fieldDataType);

    // Check if the field type is supported for editing
    if (!fieldProcessingOpts) {
      return currentInstance.processApiError(`Field '${fieldToModify}' of type '${fieldDataType}' is not supported for editing by this tool.`);
    }

    const fileSuffix = fieldProcessingOpts.fileExtension || '.txt';
    let originalFieldValue = artifactDetails[fieldToModify];

    // Apply pre-formatting if a preprocessor is defined
    if (typeof fieldProcessingOpts.preprocessor === 'function') {
      originalFieldValue = fieldProcessingOpts.preprocessor(originalFieldValue);
    }

    // Open the content in an external editor
    currentInstance.apiConnector.invokeEditor(originalFieldValue, { fileSuffix }, (editResult) => {
      if (editResult.success === false) {
        return currentInstance.processApiError(
          `Editor operation failed. Exit code: ${editResult.editor.exit_code}, Signal: ${editResult.editor.exit_signal}`
        );
      }

      // If the content was modified, update the artifact
      if (originalFieldValue !== editResult.value) {
        const changesToApply = {};
        changesToApply[fieldToModify] = editResult.value;

        currentInstance.apiConnector.updateArtifact(artifactDetails, changesToApply, (updateErr) => {
          if (updateErr) {
            return currentInstance.processApiError(`Error updating ${formattedArtifactId}: ${updateErr}`);
          } else {
            console.log(
              `${formattedArtifactId.yellow} field '${fieldToModify}': ` +
              `${(originalFieldValue || 'EMPTY').grey} -> ${(editResult.value || 'EMPTY').green}`
            );
          }
        });
      } else {
        console.log(`No changes detected for ${formattedArtifactId.yellow} field '${fieldToModify}'.`.grey);
      }
    });
  });
};

/**
 * Displays detailed information about a specific work item.
 * @param {string} itemReference - The ID or quick reference of the work item.
 */
WorkItemCommander.prototype.displayItemDetails = function (itemReference) {
  const currentInstance = this;
  this.apiConnector.getStoryDetails(this.resolveIdentifier(itemReference), (err, itemDetails) => {
    currentInstance.processApiError(err);

    if (!itemDetails) {
      return currentInstance.processApiError('No work item found with the provided reference.');
    }

    // Handle description formatting using elinks
    const descriptionTempFilePath = tempFiles.path({ suffix: '.html' });
    fileSystem.writeFileSync(descriptionTempFilePath, itemDetails.Description || 'No description provided.');

    systemExec.exec(`elinks -dump ${descriptionTempFilePath}`, (execErr, standardOutput, standardError) => {
      let formattedDescription;

      if (execErr) {
        formattedDescription =
          '  Failed to format description text. Is elinks installed?'.red +
          '  (Hint: brew install elinks or sudo apt-get install elinks)'.red;
        // Optionally log stderr for debugging, but not to user directly
        // console.error(standardError);
      } else {
        formattedDescription = standardOutput.replace(/^\n+/, '').replace(/\n+$/g, '');
      }

      // Clean up the temporary file
      fileSystem.unlinkSync(descriptionTempFilePath);

      // Print main item line, choosing between story or task format
      if ((itemDetails.Tasks || []).length > 0) {
        currentInstance.renderStorySummary(itemDetails);
      } else {
        currentInstance.renderTaskSummary(itemDetails, { indented: false, showPoints: true });
      }

      // Print formatted description if available
      if (formattedDescription && formattedDescription.trim() !== '') {
        console.log('\n' + formattedDescription + '\n');
      }

      // Print associated tasks
      (itemDetails.Tasks || []).forEach(taskEntry => {
        currentInstance.renderTaskSummary(taskEntry);
      });

      currentInstance.saveLocalReferenceCache();
    });
  });
};

/**
 * Opens the web interface for a specific work item in the browser.
 * @param {string} itemReference - The ID or quick reference of the work item.
 */
WorkItemCommander.prototype.browseItem = function (itemReference) {
  const currentInstance = this;
  // Determine the appropriate 'open' command based on the OS
  const openBrowserCommand = process.platform === "linux" ? "xdg-open" : "open";

  this.apiConnector.getStoryDetails(this.resolveIdentifier(itemReference), (err, itemDetails) => {
    currentInstance.processApiError(err ? err.red : err); // Colorize error if present

    if (!itemDetails) {
      return currentInstance.processApiError('No work item found to open.');
    }

    // Map Rally internal type names to URL-friendly types
    const itemTypeMapping = {
      'Defect': 'defect',
      'HierarchicalRequirement': 'userstory',
      'Task': 'task',
      // Add other types as needed
    };
    const urlItemType = itemTypeMapping[itemDetails._type] || 'artifact'; // Default to 'artifact'

    // Construct the full URL using template literals
    const itemUrl =
      `${currentInstance.serviceEndpoint}#/${itemDetails.Project.ObjectID}d/detail/` +
      `${urlItemType}/${itemDetails.ObjectID}`;

    // Execute the command to open the URL
    systemExec.exec(`${openBrowserCommand} ${itemUrl}`, (execErr) => {
      if (execErr) {
        console.error(`Failed to open browser: ${execErr.message}`.red);
      }
    });
  });
};

/**
 * Marks a task as "In-Progress".
 * @param {string} taskReference - The ID or quick reference of the task.
 * @param {object} actionOptions - Additional options like pair programming.
 */
WorkItemCommander.prototype.beginWork = function (taskReference, actionOptions) {
  const currentInstance = this;
  const updatePayload = {
    state: 'In-Progress',
    isOwned: true,
    isBlocked: false,
    pairProgrammer: actionOptions.pair || null
  };

  this.apiConnector.updateTaskState(this.resolveIdentifier(taskReference), updatePayload, (err, updatedTask) => {
    currentInstance.processApiError(err);
    currentInstance.renderTaskSummary(updatedTask, { showQuickId: false });
  });
};

/**
 * Marks a task as "Completed".
 * @param {string} taskReference - The ID or quick reference of the task.
 * @param {object} actionOptions - Options including root cause and resolution.
 */
WorkItemCommander.prototype.completeWork = function (taskReference, actionOptions) {
  const currentInstance = this;
  let updatePayload = {
    state: 'Completed',
    isOwned: true,
    isBlocked: false,
    pairProgrammer: actionOptions.pair || null
  };

  // Conditionally add root cause and resolution if provided
  if (actionOptions.rootcause) {
    updatePayload = { ...updatePayload, rootCause: actionOptions.rootcause };
  }
  if (actionOptions.resolution) {
    updatePayload = { ...updatePayload, resolutionDetails: actionOptions.resolution };
  }

  this.apiConnector.updateTaskState(this.resolveIdentifier(taskReference), updatePayload, (err, updatedTask) => {
    currentInstance.processApiError(err);
    currentInstance.renderTaskSummary(updatedTask, { showQuickId: false });
  });
};

/**
 * Manages discussion comments for a work item (add or show).
 * @param {string} operationType - 'add' to add a comment, 'show' to display comments.
 * @param {string} itemReference - The ID or quick reference of the item.
 * @param {string} commentText - The message to add (only for 'add' operation).
 */
WorkItemCommander.prototype.manageDiscussion = function (operationType, itemReference, commentText) {
  const currentInstance = this;
  const deferredAction = promiseLib.defer(); // Using the promise library

  const resolvedItemId = this.resolveIdentifier(itemReference);

  if (operationType === 'add') {
    this.apiConnector.addCommentToArtifact(resolvedItemId, commentText, (err, responseData) => {
      currentInstance.processApiError(err);
      if (responseData && typeof responseData.PostNumber !== "undefined") {
        deferredAction.resolve();
      } else {
        deferredAction.reject(new Error('Failed to add comment.'));
      }
    });
  } else if (operationType === 'show') {
    deferredAction.resolve(); // No upfront action needed, just proceed to show
  } else {
    return currentInstance.processApiError('Discussion command must be "show" or "add".');
  }

  deferredAction.promise.then(() => {
    currentInstance.apiConnector.fetchComments(resolvedItemId, (err, commentsData) => {
      currentInstance.processApiError(err);

      if (!commentsData || !commentsData.artifact) {
        return currentInstance.processApiError('Could not retrieve discussion details.');
      }

      currentInstance.renderTaskSummary(commentsData.artifact, { showQuickId: false, indented: false });

      if ((commentsData.comments || []).length === 0) {
        return console.log('  No discussion entries for this item yet. Be the first!'.yellow);
      }

      (commentsData.comments || []).forEach(discussionEntry => {
        currentInstance.renderCommentEntry(discussionEntry);
      });
    });
  }).catch(error => {
    currentInstance.processApiError(error);
  });
};

/**
 * Abandons a task, setting its state to 'Defined' and unassigning it.
 * @param {string} taskReference - The ID or quick reference of the task.
 */
WorkItemCommander.prototype.releaseTask = function (taskReference) {
  const currentInstance = this;
  const updatePayload = { state: 'Defined', isOwned: false, isBlocked: false, pairProgrammer: "" };

  this.apiConnector.updateTaskState(this.resolveIdentifier(taskReference), updatePayload, (err, updatedTask) => {
    currentInstance.processApiError(err);
    currentInstance.renderTaskSummary(updatedTask, { showQuickId: false });
  });
};

/**
 * Marks a task as blocked.
 * @param {string} taskReference - The ID or quick reference of the task.
 */
WorkItemCommander.prototype.markBlocked = function (taskReference) {
  const currentInstance = this;
  const updatePayload = { isBlocked: true };

  this.apiConnector.updateTaskState(this.resolveIdentifier(taskReference), updatePayload, (err, updatedTask) => {
    currentInstance.processApiError(err);
    currentInstance.renderTaskSummary(updatedTask, { showQuickId: false });
  });
};

/**
 * Unmarks a task as blocked.
 * @param {string} taskReference - The ID or quick reference of the task.
 */
WorkItemCommander.prototype.markUnblocked = function (taskReference) {
  const currentInstance = this;
  const updatePayload = { isBlocked: false };

  this.apiConnector.updateTaskState(this.resolveIdentifier(taskReference), updatePayload, (err, updatedTask) => {
    currentInstance.processApiError(err);
    currentInstance.renderTaskSummary(updatedTask, { showQuickId: false });
  });
};

/**
 * Assigns story points to a story.
 * @param {string} storyReference - The ID or quick reference of the story.
 * @param {number} pointsValue - The number of points to assign.
 */
WorkItemCommander.prototype.assignPoints = function (storyReference, pointsValue) {
  const currentInstance = this;
  this.apiConnector.setStoryPoints(this.resolveIdentifier(storyReference), pointsValue, (err, updatedStory) => {
    currentInstance.processApiError(err);
    currentInstance.renderStorySummary(updatedStory, { showQuickId: false });
  });
};

/**
 * Logs time spent on a task.
 * @param {string} taskReference - The ID or quick reference of the task.
 * @param {number} hoursSpent - The number of hours to log.
 */
WorkItemCommander.prototype.logTimeEntry = function (taskReference, hoursSpent) {
  const currentInstance = this;
  this.apiConnector.recordTime(this.resolveIdentifier(taskReference), hoursSpent, (err, responseData) => {
    currentInstance.processApiError(err);
    if (responseData && responseData.Hours) {
      console.log(`Task ${taskReference.yellow} total timesheet entry is now ${responseData.Hours.toString().yellow} hours.`);
    } else {
      console.log(responseData); // Log raw response if expected data is missing
    }
  });
};

/**
 * Handles various task operations: create, delete, etc.
 * @param {string} operation - The type of task operation (e.g., 'add').
 * @param {string} parentStoryRef - The ID or quick reference of the parent story.
 * @param {object} operationOpts - Options for the task operation (name, tags, project).
 */
WorkItemCommander.prototype.handleTaskOperation = function (operation, parentStoryRef, operationOpts) {
  const currentInstance = this;
  const targetTeam = currentInstance.toolConfig.team;
  const targetProject = operationOpts.project || currentInstance.toolConfig.project;
  const effectiveProjectName = targetProject || targetTeam;
  const taskTags = operationOpts.tags ? operationOpts.tags.split(',').map(t => t.trim()) : []; // Split and trim tags

  this.apiConnector.performTaskAction(
    operation,
    effectiveProjectName,
    this.resolveIdentifier(parentStoryRef),
    operationOpts.name,
    taskTags,
    (err, actionType, parentStory, taskName) => {
      currentInstance.processApiError(err);
      if (parentStory) {
        currentInstance.renderStorySummary(parentStory, { showQuickId: false });
      } else {
        console.log(`${operation.yellow} operation for task '${taskName}' completed.`);
      }
    }
  );
};

/**
 * Centralized error reporting and process termination.
 * @param {Error|string|null} issue - The error object or message.
 */
WorkItemCommander.prototype.processApiError = function (issue) {
  if (issue !== null) {
    const errorMessage = (typeof issue === "object" && issue.message) ? issue.message : String(issue);
    console.error(`Application Error: ${errorMessage.red}`);
    console.error('Operation aborted due to an unrecoverable error.'.red);
    process.exit(1);
  }
};

/**
 * Checks if a given artifact is currently in an "In-Progress" state.
 * @param {object} artifactItem - The artifact object to check.
 * @returns {boolean} True if the artifact is in progress, false otherwise.
 */
WorkItemCommander.prototype.isActivelyWorkedOn = function (artifactItem) {
  return artifactItem && (artifactItem.State === "In-Progress" || artifactItem.ScheduleState === "In-Progress");
};

/**
 * Renders a formatted summary line for a story or hierarchical requirement.
 * @param {object} storyItem - The story object to display.
 * @param {object} [displayOptions] - Options to customize display.
 */
WorkItemCommander.prototype.renderStorySummary = function (storyItem, displayOptions) {
  const defaultOpts = { showStatus: true, showOwners: false, showTags: true, showQuickId: true };
  const mergedOpts = lodashLike.extend({}, defaultOpts, displayOptions || {});

  const outputFields = [];

  if (mergedOpts.showQuickId) {
    outputFields.push(this.generateLocalRef(storyItem));
  }
  outputFields.push(storyItem.FormattedID.yellow);
  outputFields.push((storyItem.PlanEstimate || '-').toString().blue);

  if (mergedOpts.showStatus) {
    const itemStatus = WorkItemStateMap[storyItem.ScheduleState];
    if (typeof itemStatus === "string") {
      outputFields.push(storyItem.Blocked ? itemStatus.red : itemStatus.green);
    }
  }

  outputFields.push(storyItem.Name);

  if (mergedOpts.showOwners) {
    const activeTaskOwners = (storyItem.Tasks || [])
      .filter(task => this.isActivelyWorkedOn(task) && task.Owner !== null)
      .map(task => task.Owner._refObjectName);
    const ownerList = activeTaskOwners.filter(Boolean).join(', ');
    if (ownerList) {
      outputFields.push(ownerList.blue);
    }
  }

  if (mergedOpts.showTags) {
    const itemTags = (storyItem.Tags || [])
      .filter(Boolean) // Filter out null/undefined tags
      .map(tag => tag.Name)
      .join(', ');
    if (itemTags) {
      outputFields.push(this.isActivelyWorkedOn(storyItem) ? itemTags.magenta : itemTags.grey);
    }
  }

  console.log(outputFields.join(' '));
};

/**
 * Renders a formatted summary line for a task.
 * @param {object} taskItem - The task object to display.
 * @param {object} [displayOptions] - Options to customize display.
 */
WorkItemCommander.prototype.renderTaskSummary = function (taskItem, displayOptions) {
  const defaultOpts = { showQuickId: true, indented: true, showTags: true, showPoints: false };
  const mergedOpts = lodashLike.extend({}, defaultOpts, displayOptions || {});

  const taskCurrentStateSymbol = TaskProgressIndicators[taskItem.ScheduleState || taskItem.State] || '.';
  const taskOwnerInfo = taskItem.Owner ? `❙ ${taskItem.Owner._refObjectName}` : '';
  const outputFields = [];

  const pairInfo = (taskItem.Pair && taskItem.Pair !== "" && taskItem.Pair !== "true" && taskItem.Pair !== null)
    ? `& ${taskItem.Pair}`
    : null;

  if (mergedOpts.showQuickId) {
    outputFields.push(this.generateLocalRef(taskItem));
  }

  if (mergedOpts.indented) {
    outputFields.push(' '); // Add a leading space for indentation
  }

  outputFields.push(taskItem.FormattedID.yellow);

  if (mergedOpts.showPoints && taskItem.PlanEstimate) {
    outputFields.push(taskItem.PlanEstimate.toString().blue);
  }

  outputFields.push(taskItem.Blocked ? taskCurrentStateSymbol.red : taskCurrentStateSymbol.green);
  outputFields.push(taskItem.Name);

  if (taskOwnerInfo) {
    outputFields.push(this.isActivelyWorkedOn(taskItem) ? taskOwnerInfo.blue : taskOwnerInfo);
  }

  if (pairInfo) {
    outputFields.push(this.isActivelyWorkedOn(taskItem) ? pairInfo.blue : pairInfo);
  }

  if (mergedOpts.showTags) {
    const taskTags = (taskItem.Tags || [])
      .filter(Boolean)
      .map(tag => tag.Name)
      .join(', ');
    if (taskTags) {
      outputFields.push(this.isActivelyWorkedOn(taskItem) ? taskTags.magenta : taskTags.grey);
    }
  }

  console.log(outputFields.join(' '));
};

/**
 * Renders a formatted line for a discussion comment.
 * @param {object} discussionComment - The comment object to display.
 * @param {object} [displayOptions] - Options to customize display.
 */
WorkItemCommander.prototype.renderCommentEntry = function (discussionComment, displayOptions) {
  const defaultOpts = { showNumber: true, indented: true };
  const mergedOpts = lodashLike.extend({}, defaultOpts, displayOptions || {});

  const commenterName = discussionComment.User ? `${discussionComment.User._refObjectName} ❙` : '';
  const commentPostNumber = String(discussionComment.PostNumber + 1); // Display as 1-based index
  const outputFields = [];

  if (mergedOpts.indented) {
    outputFields.push(' ');
  }

  if (mergedOpts.showNumber) {
    outputFields.push(commentPostNumber.yellow);
  }

  if (commenterName) {
    outputFields.push(commenterName.blue);
  }
  outputFields.push(discussionComment.Text);

  console.log(outputFields.join(' '));
};

/**
 * Generates and stores a local quick reference ID for a work item.
 * @param {object} workItem - The work item object (story or task).
 * @returns {string} The formatted local reference ID.
 */
WorkItemCommander.prototype.generateLocalRef = function (workItem) {
  // Ensure the cache is initialized
  if (!this.localReferenceCache) {
    this.localReferenceCache = [];
  }
  this.localReferenceCache.push(workItem.FormattedID);
  return this.padLeftWithSpaces(this.localReferenceCache.length, 3);
};

/**
 * Pads a number with leading spaces to a specified column width.
 * @param {number} value - The number to pad.
 * @param {number} totalWidth - The desired total width of the padded string.
 * @returns {string} The left-padded string.
 */
WorkItemCommander.prototype.padLeftWithSpaces = function (value, totalWidth) {
  let resultString = String(value);
  while (resultString.length < totalWidth) {
    resultString = ' ' + resultString;
  }
  return resultString;
};

/**
 * Persists the current list of cached local reference IDs to a file.
 */
WorkItemCommander.prototype.saveLocalReferenceCache = function () {
  if (this.localReferenceCache && this.localReferenceCache.length > 0) {
    const cacheFilePath = osPath.join(process.env.HOME, '.rallycli_recent_refs');
    fileSystem.writeFileSync(cacheFilePath, JSON.stringify(this.localReferenceCache), 'utf8');
  }
};

/**
 * Resolves an input identifier (either a quick ID or a formatted ID) to a Rally FormattedID.
 * @param {string} inputId - The ID provided by the user.
 * @returns {string} The resolved Rally FormattedID.
 */
WorkItemCommander.prototype.resolveIdentifier = function (inputId) {
  const numericId = parseInt(inputId, 10);

  // Check if the input is a numeric quick ID
  if (!isNaN(numericId) && String(numericId) === inputId) { // Ensures it's purely numeric
    if (this.cachedItemRefs && numericId > 0 && numericId <= this.cachedItemRefs.length) {
      return this.cachedItemRefs[numericId - 1]; // Quick IDs are 1-based
    } else {
      console.error(('No quick reference ID ' + inputId + ' found in cache.').red);
      process.exit(1); // Terminate if quick ID is invalid
    }
  }
  return inputId; // If not a quick ID, assume it's a direct FormattedID
};