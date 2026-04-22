const nodePathUtil = require('path');
const fileSystemOps = require('fs').promises;
const processExecutor = require('child_process').promises;
const temporaryFileHandler = require('temp');
const markupFormatter = require('html');
const RallyServiceConnector = require('./ralio');

// Custom ANSI color functions for console output
const cS = {
  red: (txt) => `\x1b[31m${txt}\x1b[0m`,
  green: (txt) => `\x1b[32m${txt}\x1b[0m`,
  yellow: (txt) => `\x1b[33m${txt}\x1b[0m`,
  blue: (txt) => `\x1b[34m${txt}\x1b[0m`,
  magenta: (txt) => `\x1b[35m${txt}\x1b[0m`,
  grey: (txt) => `\x1b[90m${txt}\x1b[0m`,
  reset: (txt) => `\x1b[0m${txt}\x1b[0m`
};

// Global-like storage for generated and loaded quick references
let sequentialReferenceList = [];
let storedRecentIdentifiers = [];

// Display symbols for various states, using a Map for lookup
const StatusSymbols = new Map([
  ["Suggestion", "?"],
  ["Defined", "·"],
  ["Submitted", "·"],
  ["In-Progress", "▸"],
  ["Completed", "✔"],
  ["Fixed", "✔"],
  ["Closed", "✔"],
  ["Accepted", "✩"],
  ["Released", "✮"],
  ["Grooming", "⌚"]
]);

// Task-specific status indicators, extending the general status symbols
const TaskStatusIndicators = new Map([
  ...StatusSymbols.entries(),
  ["Open", "·"]
]);

// Factory function to create an interaction engine instance
async function createInteractionEngine(serviceEndpoint) {
  const engine = {};

  engine.serviceEndpoint = serviceEndpoint || 'https://rally1.rallydev.com/';
  engine.settingsBundle = {};
  engine.rallyService = null;

  // Function to display an error message and terminate the process
  engine.reportIssueAndExit = (problemDescription) => {
    if (problemDescription !== null) {
      const displayMessage = typeof problemDescription === "object" ? problemDescription.message : problemDescription;
      console.error(cS.red(displayMessage));
      process.exit(1);
    }
  };

  // Utility to pretty-print HTML content
  engine.prettifyMarkupContent = (markupInput) => {
    return markupFormatter.prettyPrint(markupInput, { indent_size: 2 });
  };

  // Configuration for handling different field types during edit operations
  engine.FieldPropertyMap = {
    supported: [
      { fieldType: "STRING", fileSuffix: '.txt' },
      { fieldType: "BOOLEAN", fileSuffix: '.txt' },
      { fieldType: "INTEGER", fileSuffix: '.txt' },
      { fieldType: "TEXT", fileSuffix: '.html', preformatter: engine.prettifyMarkupContent }
    ],
    retrievePropertiesForType: function (type) {
      return this.supported.find(prop => prop.fieldType === type);
    }
  };

  // Determines if an artifact is currently in an active (in-progress) state
  engine.isCurrentlyActive = (item) => {
    return (item.State === "In-Progress" || item.ScheduleState === "In-Progress");
  };

  // Pads a number with leading spaces to a specified column width
  engine.padLeftWithSpaces = (number, columnCount) => {
    let resultString = String(number);
    while (resultString.length < columnCount) {
      resultString = ' ' + resultString;
    }
    return resultString;
  };

  // Generates and stores a new local quick reference for an artifact
  engine.generateLocalReference = (artifact) => {
    sequentialReferenceList.push(artifact.FormattedID);
    return engine.padLeftWithSpaces(sequentialReferenceList.length, 3);
  };

  // Persists the list of recently generated quick references to a file
  engine.storeRecentReferences = async () => {
    if (sequentialReferenceList.length > 0) {
      const recentPath = nodePathUtil.join(process.env.HOME, '.recent_rally_ids');
      try {
        await fileSystemOps.writeFile(recentPath, sequentialReferenceList.join('\n'));
      } catch (err) {
        console.warn(cS.yellow(`Warning: Could not save recent IDs: ${err.message}`));
      }
    }
  };

  // Resolves an input identifier, converting quick IDs to their full FormattedID
  engine.resolveIdentifier = (inputIdentifier) => {
    if (/^\d+$/.test(inputIdentifier)) {
      const numericIndex = parseInt(inputIdentifier, 10);
      if (storedRecentIdentifiers.length > 0 && numericIndex <= storedRecentIdentifiers.length) {
        return storedRecentIdentifiers[numericIndex - 1];
      } else {
        engine.reportIssueAndExit(cS.red(`No quick identifier ${inputIdentifier} found.`));
      }
    }
    return inputIdentifier;
  };

  // Renders a formatted summary line for a story artifact
  engine.renderStorySummary = (storyItem, displayOptions = {}) => {
    const defaultOptions = { showState: true, showOwners: false, showTags: true, showQuickId: true };
    const effectiveOptions = { ...defaultOptions, ...displayOptions };

    const outputFields = [];
    if (effectiveOptions.showQuickId) {
      outputFields.push(engine.generateLocalReference(storyItem));
    }
    outputFields.push(cS.yellow(storyItem.FormattedID));
    outputFields.push(cS.blue((storyItem.PlanEstimate || '-').toString()));

    if (effectiveOptions.showState) {
      const stateSymbol = StatusSymbols.get(storyItem.ScheduleState);
      if (typeof stateSymbol === "string") {
        outputFields.push(storyItem.Blocked ? cS.red(stateSymbol) : cS.green(stateSymbol));
      }
    }
    outputFields.push(storyItem.Name);

    if (effectiveOptions.showOwners) {
      const activeOwners = (storyItem.Tasks || [])
        .filter(task => engine.isCurrentlyActive(task) && task.Owner !== null)
        .map(task => task.Owner._refObjectName);
      outputFields.push(cS.blue(activeOwners.filter(Boolean).join(', ')));
    }

    if (effectiveOptions.showTags) {
      const tagNames = (storyItem.Tags || []).filter(Boolean).map(t => t.Name).join(', ');
      outputFields.push(engine.isCurrentlyActive(storyItem) ? cS.magenta(tagNames) : cS.grey(tagNames));
    }

    console.log(outputFields.join(' '));
  };

  // Renders a formatted summary line for a task artifact
  engine.renderTaskSummary = (taskItem, displayOptions = {}) => {
    const defaultOptions = { showQuickId: true, useTabIndent: true, showTags: true, showPoints: false };
    const effectiveOptions = { ...defaultOptions, ...displayOptions };

    const taskStatusChar = TaskStatusIndicators.get(taskItem.ScheduleState || taskItem.State) || '.';
    const ownerInfo = taskItem.Owner !== null ? `❙ ${taskItem.Owner._refObjectName}` : '';
    const outputFields = [];
    const pairInfo = (taskItem.Pair && taskItem.Pair !== "" && taskItem.Pair !== "true" && taskItem.Pair !== null) ? `& ${taskItem.Pair}` : null;

    if (effectiveOptions.showQuickId) {
      outputFields.push(engine.generateLocalReference(taskItem));
    }

    if (effectiveOptions.useTabIndent) {
      outputFields.push(' ');
    }

    outputFields.push(cS.yellow(taskItem.FormattedID));
    if (effectiveOptions.showPoints) {
      outputFields.push(cS.blue((taskItem.PlanEstimate || '-').toString()));
    }

    outputFields.push(taskItem.Blocked ? cS.red(taskStatusChar) : cS.green(taskStatusChar));
    outputFields.push(taskItem.Name);

    outputFields.push(engine.isCurrentlyActive(taskItem) ? cS.blue(ownerInfo) : ownerInfo);

    if (pairInfo) {
      outputFields.push(engine.isCurrentlyActive(taskItem) ? cS.blue(pairInfo) : pairInfo);
    }

    if (effectiveOptions.showTags) {
      const tagNames = (taskItem.Tags || []).filter(Boolean).map(t => t.Name).join(', ');
      outputFields.push(engine.isCurrentlyActive(taskItem) ? cS.magenta(tagNames) : cS.grey(tagNames));
    }

    console.log(outputFields.join(' '));
  };

  // Renders a formatted line for a discussion comment
  engine.renderCommentEntry = (commentEntry, displayOptions = {}) => {
    const defaultOptions = { showNumber: true, useTabIndent: true };
    const effectiveOptions = { ...defaultOptions, ...displayOptions };

    const commentAuthor = commentEntry.User !== null ? `${commentEntry.User._refObjectName} ❙` : '';
    const postSequence = String(commentEntry.PostNumber + 1);
    const outputFields = [];

    if (effectiveOptions.useTabIndent) {
      outputFields.push(' ');
    }

    if (effectiveOptions.showNumber) {
      outputFields.push(cS.yellow(postSequence));
    }

    outputFields.push(cS.blue(commentAuthor));
    outputFields.push(commentEntry.Text);

    console.log(outputFields.join(' '));
  };

  // Initializes the engine's settings and Rally service connection
  engine.initializeSettings = async () => {
    // Divergence: Configuration is read from environment variables
    engine.settingsBundle = {
      username: process.env.RALLY_USERNAME,
      password: process.env.RALLY_PASSWORD,
      project: process.env.RALLY_PROJECT,
      team: process.env.RALLY_TEAM
    };

    if (!engine.settingsBundle.username || !engine.settingsBundle.password || !engine.settingsBundle.project || !engine.settingsBundle.team) {
      engine.reportIssueAndExit(cS.red('Missing Rally configuration in environment variables (RALLY_USERNAME, RALLY_PASSWORD, RALLY_PROJECT, RALLY_TEAM).'));
    }

    engine.rallyService = new RallyServiceConnector(
      engine.serviceEndpoint,
      engine.settingsBundle.username,
      engine.settingsBundle.password,
      engine.settingsBundle.project,
      engine.settingsBundle.team
    );

    // Load recent identifiers from a different file name and format
    const recentPath = nodePathUtil.join(process.env.HOME, '.recent_rally_ids');
    try {
      const fileContent = await fileSystemOps.readFile(recentPath, 'utf8');
      storedRecentIdentifiers = fileContent.split('\n').filter(Boolean);
    } catch (e) {
      storedRecentIdentifiers = []; // File might not exist, which is fine
    }
  };

  // Execute initialization upon engine creation
  await engine.initializeSettings();

  // Command handlers, using async/await for asynchronous operations

  engine.viewBacklogItems = async (operationOptions) => {
    const teamName = engine.settingsBundle.team;
    const projectSelection = operationOptions.project || engine.settingsBundle.project;
    const queryParameters = {
      projectName: projectSelection || teamName,
      pagesize: operationOptions.all ? 100 : 20,
      tag: operationOptions.tag
    };

    try {
      let retrievedItems = await new Promise((resolve, reject) => {
        engine.rallyService.backlog(queryParameters, (err, items) => {
          if (err) reject(err); else resolve(items);
        });
      });

      if (!operationOptions.all) {
        retrievedItems = retrievedItems.slice(0, 20);
      }

      retrievedItems.forEach(item => {
        engine.renderStorySummary(item, { showState: false, showTags: true });
      });
      await engine.storeRecentReferences();
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.examineCurrentSprint = async (operationOptions) => {
    const groupName = operationOptions.group || engine.settingsBundle.team;
    const projectScope = operationOptions.project || engine.settingsBundle.project;
    const projectIdentifier = projectScope || groupName;

    try {
      const sprintItems = await new Promise((resolve, reject) => {
        engine.rallyService.sprint(projectIdentifier, operationOptions, (err, items) => {
          if (err) reject(err); else resolve(items);
        });
      });

      sprintItems.forEach(item => {
        if (item.ScheduleState !== 'Accepted' || operationOptions.accepted) {
          const combinedTasks = [...(item.Tasks || []), ...(item.Defects || [])];
          if (combinedTasks.length > 0) {
            engine.renderStorySummary(item, { showOwners: !operationOptions.tasks });
            if (operationOptions.tasks) {
              combinedTasks.forEach(task => {
                engine.renderTaskSummary(task);
              });
            }
          } else {
            engine.renderTaskSummary(item, { useTabIndent: false, showPoints: true });
          }
        }
      });
      await engine.storeRecentReferences();
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.displayActiveWork = async () => {
    try {
      const currentItems = await new Promise((resolve, reject) => {
        engine.rallyService.current(engine.settingsBundle.team, (err, items) => {
          if (err) reject(err); else resolve(items);
        });
      });

      currentItems.forEach(item => {
        engine.renderStorySummary(item);
        (item.Tasks || []).forEach(task => {
          engine.renderTaskSummary(task);
        });
      });
      await engine.storeRecentReferences();
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.modifyArtifactField = async (formattedReference, targetField) => {
    try {
      const artifactDetails = await new Promise((resolve, reject) => {
        engine.rallyService.artifact(formattedReference, { fetch: targetField }, { typeDefinition: true }, (err, artifact) => {
          if (err) reject(err); else resolve(artifact);
        });
      });

      if (typeof artifactDetails[targetField] === 'undefined') {
        return engine.reportIssueAndExit(`Field ${targetField} not found.`);
      }

      const fieldTypeDefinition = artifactDetails._typeDefinition.Attributes.find(attr => attr.ElementName === targetField);
      if (!fieldTypeDefinition) {
        return engine.reportIssueAndExit(`Type definition for field ${targetField} not found.`);
      }

      const fieldOptions = engine.FieldPropertyMap.retrievePropertiesForType(fieldTypeDefinition.AttributeType);
      if (typeof fieldOptions === 'undefined') {
        return engine.reportIssueAndExit(`Field ${targetField} is not a type supported by this tool. [${fieldTypeDefinition.AttributeType}]`);
      }

      const fileExtension = fieldOptions.fileSuffix || '.txt';
      let originalValue = artifactDetails[targetField];

      if (typeof fieldOptions.preformatter === 'function') {
        originalValue = fieldOptions.preformatter(originalValue);
      }

      const editorResult = await new Promise((resolve) => {
        engine.rallyService.editor(originalValue, { suffix: fileExtension }, (res) => resolve(res));
      });

      if (editorResult.success === false) {
        return engine.reportIssueAndExit(`EDITOR returned error. Exit code: ${editorResult.editor.exit_code}, Exit signal: ${editorResult.editor.exit_signal}`);
      }

      if (originalValue !== editorResult.value) {
        const updates = { [targetField]: editorResult.value };

        await new Promise((resolve, reject) => {
          engine.rallyService.updateArtifact(artifactDetails, updates, (err) => {
            if (err) reject(err); else resolve();
          });
        });
        console.log(`${cS.yellow(formattedReference)} ${cS.grey(originalValue)} ▶ ${cS.green(editorResult.value)}`);
      }
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.presentItemDetails = async (itemReference) => {
    try {
      const storyDetails = await new Promise((resolve, reject) => {
        engine.rallyService.story(engine.resolveIdentifier(itemReference), (err, story) => {
          if (err) reject(err); else resolve(story);
        });
      });

      if (storyDetails === null) {
        return engine.reportIssueAndExit('No story found :(');
      }

      const tempFileDescriptor = temporaryFileHandler.openSync({ suffix: '.markup' });
      await fileSystemOps.writeFile(tempFileDescriptor.path, storyDetails.Description || '');
      let formattedDescription = '';

      try {
        const { stdout } = await processExecutor.exec(`elinks -dump ${tempFileDescriptor.path}`);
        formattedDescription = stdout.replace(/^\n+/, '').replace(/\n+$/g, '');
      } catch (err) {
        formattedDescription =
          cS.red('  There was an error formatting the description text :(\n') +
          cS.red('  Is elinks installed? (hint: brew install elinks or sudo apt-get install elinks).');
      } finally {
        await fileSystemOps.unlink(tempFileDescriptor.path);
      }

      (storyDetails.Tasks && storyDetails.Tasks.length > 0) ?
        engine.renderStorySummary(storyDetails) : engine.renderTaskSummary(storyDetails, { useTabIndent: false, showPoints: true });

      if (formattedDescription !== '') {
        console.log(`\n${formattedDescription}\n`);
      }

      (storyDetails.Tasks || []).forEach(task => {
        engine.renderTaskSummary(task);
      });

      await engine.storeRecentReferences();
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.launchWebLink = async (itemReference) => {
    try {
      const storyDetails = await new Promise((resolve, reject) => {
        engine.rallyService.story(engine.resolveIdentifier(itemReference), (err, story) => {
          if (err) reject(err); else resolve(story);
        });
      });

      if (storyDetails === null) {
        return engine.reportIssueAndExit('No story found :(');
      }

      let itemTypeFragment = null;
      switch (storyDetails._type) {
        case 'Defect': itemTypeFragment = 'defect'; break;
        case 'HierarchicalRequirement': itemTypeFragment = 'userstory'; break;
        case 'Task': itemTypeFragment = 'task'; break;
        default: itemTypeFragment = 'artifact';
      }

      const browserCommand = process.platform === "linux" ? "xdg-open" : "open";
      const targetUrl =
        `${engine.serviceEndpoint}#/${storyDetails.Project.ObjectID}d/detail/${itemTypeFragment}/${storyDetails.ObjectID}`;

      await processExecutor.exec(`${browserCommand} ${targetUrl}`);
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  // Generic helper for updating task states
  const updateTaskStateGeneric = async (itemReference, stateUpdates) => {
    try {
      const updatedTask = await new Promise((resolve, reject) => {
        engine.rallyService.setTaskState(engine.resolveIdentifier(itemReference), stateUpdates, (err, task) => {
          if (err) reject(err); else resolve(task);
        });
      });
      engine.renderTaskSummary(updatedTask, { showQuickId: false });
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.commenceWork = async (itemReference, workOptions) => {
    await updateTaskStateGeneric(itemReference, { state: 'In-Progress', own: true, blocked: false, pair: workOptions.pair });
  };

  engine.completeWork = async (itemReference, workOptions) => {
    let finalUpdates = { state: 'Completed', own: true, blocked: false, pair: workOptions.pair };
    if (workOptions.rootcause) {
      finalUpdates = { ...finalUpdates, rootcause: workOptions.rootcause };
    }
    if (workOptions.resolution) {
      finalUpdates = { ...finalUpdates, resolution: workOptions.resolution };
    }
    await updateTaskStateGeneric(itemReference, finalUpdates);
  };

  engine.manageConversations = async (actionType, artifactItem, messageContent, conversationOptions) => {
    const resolvedArtifactId = engine.resolveIdentifier(artifactItem);
    let conversationPromise;

    if (actionType === 'add') {
      conversationPromise = new Promise((resolve, reject) => {
        engine.rallyService.addComment(resolvedArtifactId, messageContent, (err, data) => {
          if (err) reject(err);
          else if (typeof data.PostNumber === "undefined") reject(new Error("Comment post failed."));
          else resolve();
        });
      });
    } else if (actionType === 'show') {
      conversationPromise = Promise.resolve();
    } else {
      return engine.reportIssueAndExit('Option to discuss command must be one of: show, add.');
    }

    try {
      await conversationPromise;

      const commentData = await new Promise((resolve, reject) => {
        engine.rallyService.comments(resolvedArtifactId, (err, comments) => {
          if (err) reject(err); else resolve(comments);
        });
      });

      engine.renderTaskSummary(commentData.artifact, { showQuickId: false, useTabIndent: false });

      if (commentData.comments.length === 0) {
        return engine.reportIssueAndExit('There is no discussion going on here :-)');
      }

      commentData.comments.forEach(comment => {
        engine.renderCommentEntry(comment);
      });
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.haltProgress = async (itemReference) => {
    await updateTaskStateGeneric(itemReference, { state: 'Defined', own: false, blocked: false, pair: "" });
  };

  engine.setBlockedStatus = async (itemReference) => {
    await updateTaskStateGeneric(itemReference, { blocked: true });
  };

  engine.clearBlockedStatus = async (itemReference) => {
    await updateTaskStateGeneric(itemReference, { blocked: false });
  };

  engine.assignEffortPoints = async (storyReference, pointsValue) => {
    try {
      const updatedStory = await new Promise((resolve, reject) => {
        engine.rallyService.point(engine.resolveIdentifier(storyReference), pointsValue, (err, story) => {
          if (err) reject(err); else resolve(story);
        });
      });
      engine.renderStorySummary(updatedStory, { showQuickId: false });
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.logTimeEntry = async (itemReference, hoursValue) => {
    try {
      const timeData = await new Promise((resolve, reject) => {
        engine.rallyService.time(engine.resolveIdentifier(itemReference), hoursValue, (err, data) => {
          if (err) reject(err); else resolve(data);
        });
      });
      if (timeData.Hours) {
        console.log(`Item ${cS.yellow(itemReference)} timesheet entry is now ${cS.yellow(String(timeData.Hours))} hours.`);
      } else {
        console.log(timeData);
      }
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  engine.handleTaskOperations = async (operationType, storyReference, taskOptions) => {
    const teamContext = engine.settingsBundle.team;
    const projectContext = taskOptions.project || engine.settingsBundle.project;
    const projectLabel = projectContext || teamContext;
    const taskTags = taskOptions.tags ? taskOptions.tags.split(',') : [];

    try {
      const result = await new Promise((resolve, reject) => {
        engine.rallyService.task(operationType, projectLabel, engine.resolveIdentifier(storyReference), taskOptions.name, taskTags, (err, op, story, taskName) => {
          if (err) reject(err); else resolve({ op, story, taskName });
        });
      });
      engine.renderStorySummary(result.story, { showQuickId: false });
    } catch (err) {
      engine.reportIssueAndExit(err);
    }
  };

  return engine;
}