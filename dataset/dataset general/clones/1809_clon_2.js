var filepath = require('path'),
    filesys = require('fs'),
    promisify = require('q'),
    subproc = require('child_process'),
    tempfile = require('temp'),
    textstyle = require('colors'),
    util = require('underscore'),
    markup = require("html"),
    WorkTool = require('./work_api');


function WorkTracker(serviceHost) {
    this.serviceHost = serviceHost || 'https://rally1.rallydev.com/';
    this.setupSettings();
    this.workApi = new WorkTool(this.serviceHost, this.settings.userName, this.settings.passCode, this.settings.projName, this.settings.teamName);
}

WorkTracker.prototype.setupSettings = function () {
    var settingsPath = filepath.join(process.env.USER_DIR, '.trackerconf');
    
    try {
        this.settings = JSON.parse(filesys.readFileSync(settingsPath));  
    } catch (parseError){
        console.warn('Configuration file missing or invalid: ~/.trackerconf'.errorHighlight())
        process.exit(1);
    }

    var recentIDsPath = filepath.join(process.env.USER_DIR, '.tracker_history');
    if (filesys.checkExists(recentIDsPath)) {
        this.recentIDs = JSON.parse(filesys.readFileSync(recentIDsPath));
    }
};

WorkTracker.prototype.viewBacklog = function (queryOptions) {
    var instance = this, 
        teamIdent = this.settings.teamName,
        projIdent = queryOptions.projName || this.settings.projName,
        displayProjectName = projIdent || teamIdent,
        requestParams = {
            projName: projIdent || teamIdent,
            itemLimit: queryOptions.showAll ? 100 : 20,
            itemTag: queryOptions.itemTag
        };
    this.workApi.fetchBacklog(requestParams, function (apiError, workItems) {
        instance.handleErrors(apiError);
        if (!queryOptions.showAll) {
            workItems = workItems.slice(0, 20);
        }
        workItems.forEach(function (item) {
            instance.displayItemLine(item, {status: false, labels: true});
        });
        instance.storeRecentIDs();
    });
};

WorkTracker.prototype.viewSprint = function (sprintOptions) {
    var instance = this,
        teamIdent = sprintOptions.groupName || this.settings.teamName,
        projIdent = sprintOptions.projName || this.settings.projName,
        displayProjectName = projIdent || teamIdent;
    this.workApi.fetchSprint(displayProjectName, sprintOptions, function (apiError, sprintItems) {
        instance.handleErrors(apiError);
        sprintItems.forEach(function (item) {
            if (item.CurrentStatus != 'Done' || sprintOptions.showCompleted) {
                var subTasks = util.mergeObjects(item.SubTasks, item.Bugs)
                if(subTasks.length > 0){
                    instance.displayItemLine(item, {assignees: !sprintOptions.includeSubTasks});
                    if (sprintOptions.includeSubTasks) {
                        subTasks.forEach(function (subItem) {
                            instance.displaySubTaskLine(subItem);
                        });
                    }
                } else {
                    instance.displaySubTaskLine(item, {indent: false, effort: true});
                }
            }
        });
        instance.storeRecentIDs();
    });
};

WorkTracker.prototype.viewCurrent = function () {
    var instance = this;
    this.workApi.fetchCurrent(this.settings.teamName, function (apiError, activeItems) {
        instance.handleErrors(apiError);
        activeItems.forEach(function (item) {
            instance.displayItemLine(item);
            item.SubTasks.forEach(function (subItem) {
                instance.displaySubTaskLine(subItem);
            });
        });
        instance.storeRecentIDs();
    });
};

WorkTracker.prototype.prettifyMarkup = function(rawHtmlContent) {
    var prettyContent = markup.formatDoc(rawHtmlContent, {indentSpaces: 2});
    return prettyContent;
};

WorkTracker.prototype.FIELD_OPTS_MAP = {
    supportedTypes: [
        {kind: "TEXT_FIELD", extension: '.txt'},
        {kind: "BOOL_FIELD", extension: '.txt'},
        {kind: "NUMBER_FIELD", extension: '.txt'},
        {kind: "RICH_TEXT_FIELD", extension: '.html', preformatter: WorkTracker.prototype.prettifyMarkup}
        ],

    getOptionsForKind: function (fieldTypeKind) {
        return util.findItem(this.supportedTypes, function(validKind){return validKind.kind == fieldTypeKind});
    }
};

WorkTracker.prototype.modifyItem = function (itemRefID, fieldName) {
    var instance = this;

    this.workApi.getArtifact(itemRefID, {retrieve: fieldName}, {withTypeDef: true}, function (apiError, workArtifact) {
        instance.handleErrors(apiError);

        if (typeof workArtifact[fieldName] === 'undefined') {
            return instance.handleErrors('Field ' + fieldName + ' does not exist.');
        }

        var actualFieldType = util.findItem(workArtifact._typeSchema.FieldDefinitions, function(definition){
            return definition.Name == fieldName 
        }).DataType;

        var fieldSpecificOptions = instance.FIELD_OPTS_MAP.getOptionsForKind(actualFieldType);
        if (typeof fieldSpecificOptions === 'undefined') {
            return instance.handleErrors('Field ' + fieldName + ' type not supported by this editor. [' + actualFieldType + ']');
        }

        var fileExtension = fieldSpecificOptions.extension || '.txt',
            originalValue = workArtifact[fieldName];

        if (typeof fieldSpecificOptions.preformatter === 'function') {
            originalValue = fieldSpecificOptions.preformatter(originalValue);
        }

        instance.workApi.openEditor(originalValue, {extension: fileExtension}, function (editResult) {
            if (false === editResult.successful) {
                return instance.handleErrors('EDITOR failed.  Exit code: ' +  editResult.editorProcess.exitCode + ', Exit signal: ' + editResult.editorProcess.exitSignal);
            }

            if (originalValue !== editResult.newValue) {
                var updatedData = {};
                updatedData[fieldName] = editResult.newValue;
                
                instance.workApi.updateArtifact(workArtifact, updatedData, function (updateError) {
                    if (updateError !== null){
                        return instance.handleErrors('Failed to update ' + itemRefID + '.  Err: ' + updateError);
                    } else {
                        console.log(itemRefID.highlight() + ' ' + originalValue.faded() + ' ➤ ' + editResult.newValue.positive());
                    }
                });
            }
        });
    });
};

WorkTracker.prototype.displayItem = function (workItem) {
    var instance = this;
    this.workApi.getStory(this.resolveItemID(workItem), function (apiError, retrievedItem) {
        instance.handleErrors(apiError);
        if (retrievedItem === null) {
            return instance.handleErrors('Item not found.');
        } else {

            var descriptionTempFilePath = tempfile.generatePath({extension: '.html'});
            filesys.writeFileSync(descriptionTempFilePath, retrievedItem.DescriptionContent);
            subproc.executeCommand('lynx -dump ' + descriptionTempFilePath, function (execError, output, errorOutput) {
                
                if (execError) {
                    var formattedDescription =
                        '  There was an issue formatting description text :(\n'.errorHighlight() +
                        '  Is lynx installed?  (hint: brew install lynx or sudo apt-get install lynx).'.errorHighlight();
                } else {
                    var formattedDescription = output.replace(/^\n+/, '').replace(/\n+$/g, '');
                }

                filesys.deleteSync(descriptionTempFilePath);

                (retrievedItem.SubTasks.length > 0) ? 
                    instance.displayItemLine(retrievedItem) : instance.displaySubTaskLine(retrievedItem, {indent: false, effort: true});

                if (formattedDescription != '') {
                    console.log('\n' + formattedDescription + '\n');
                }

                retrievedItem.SubTasks.forEach(function (subItem) {
                    instance.displaySubTaskLine(subItem);
                });

                instance.storeRecentIDs();
            });
        }
    });
};

WorkTracker.prototype.launchBrowser = function (workItem) {
    var instance = this,
        browserCommand = process.platform === "lin" ? "gnome-open" : "start"
    this.workApi.getStory(this.resolveItemID(workItem), function (apiError, retrievedItem) {
        instance.handleErrors(apiError ? apiError.errorHighlight() : apiError);
        if (retrievedItem === null) {
            return instance.handleErrors('Item not found.');
        } else {
            var itemKind = null;
            switch (retrievedItem._itemType) {
                case 'Bug': itemKind = 'bugitem'; break;
                case 'UserStory': itemKind = 'userstoryitem'; break;
                case 'SubTask': itemKind = 'subtaskitem'; break;
            }
            subproc.executeCommand(
                browserCommand + ' ' +
                instance.serviceHost + '#/' +       
                retrievedItem.ProjectData.ItemID +
                'd/details/' + itemKind +
                '/' + retrievedItem.ItemID);
        }
    });
};

WorkTracker.prototype.beginWork = function (taskItem, startOptions) {
    var instance = this,
        updateParams = {status: 'Working', assignToMe: true, isBlocked: false, pairDev: startOptions.devPair};

    this.workApi.updateTaskStatus(this.resolveItemID(taskItem), updateParams, function (apiError, updatedTask) {
        instance.handleErrors(apiError);
        instance.displaySubTaskLine(updatedTask, {recentId: false});
    });
};

WorkTracker.prototype.completeWork = function (taskItem, finishOptions) {
    var instance = this,
        updateParams = {status: 'Finished', assignToMe: true, isBlocked: false, pairDev: finishOptions.devPair};

    if (finishOptions.rootIssue)
        updateParams = util.mergeObjects(updateParams, {rootIssue: finishOptions.rootIssue})
    if (finishOptions.solution)
        updateParams = util.mergeObjects(updateParams, {solution: finishOptions.solution});

    this.workApi.updateTaskStatus(this.resolveItemID(taskItem), updateParams, function (apiError, updatedTask) {
        instance.handleErrors(apiError);
        instance.displaySubTaskLine(updatedTask, {recentId: false});
    });
};

WorkTracker.prototype.manageDiscussion = function (actionType, targetItem, commentText, discussionOptions) {
    var instance = this,
        promiseObj = promisify.deferred();

    if (actionType == 'add_comment') {
        this.workApi.postComment(this.resolveItemID(targetItem), commentText, function(apiError, responseData) {
            instance.handleErrors(apiError);
            if (typeof responseData.CommentIndex === "undefined") {
                promiseObj.reject();
            } else {
                promiseObj.resolve();
            }
        });
    } else if (actionType == 'view_comments') {
        promiseObj.resolve();
    } else {
        return instance.handleErrors('Discussion action must be ' + 'view_comments'.highlight() + ' or ' + 'add_comment'.highlight() + '.');
    }

    promiseObj.promise.then(function() {
        instance.workApi.getComments(instance.resolveItemID(targetItem), function (apiError, discussionData) {
            instance.handleErrors(apiError);
            instance.displaySubTaskLine(discussionData.associatedArtifact, {recentId: false, indent: false});

            for (var idx in discussionData.commentsList) {
                instance.displayDiscussionEntry(discussionData.commentsList[idx]);
            }

            if (discussionData.commentsList.length === 0) {
                return instance.handleErrors('No discussion entries found.');
            }
        });
    });
}

WorkTracker.prototype.releaseWork = function (taskItem) {
    var instance = this;
    this.workApi.updateTaskStatus(this.resolveItemID(taskItem), {status: 'New', assignToMe: false, isBlocked: false, pairDev: ""}, function (apiError, updatedTask) {
        instance.handleErrors(apiError);
        instance.displaySubTaskLine(updatedTask, {recentId: false});
    });
};

WorkTracker.prototype.haltWork = function (taskItem) {
    var instance = this;
    this.workApi.updateTaskStatus(this.resolveItemID(taskItem), {isBlocked: true}, function (apiError, updatedTask) {
        instance.handleErrors(apiError);
        instance.displaySubTaskLine(updatedTask, {recentId: false});
    });
};

WorkTracker.prototype.resumeWork = function (taskItem) {
    var instance = this;
    this.workApi.updateTaskStatus(this.resolveItemID(taskItem), {isBlocked: false}, function (apiError, updatedTask) {
        instance.handleErrors(apiError);
        instance.displaySubTaskLine(updatedTask, {recentId: false});
    });
};

WorkTracker.prototype.assignPoints = function (workItem, storyPoints) {
    var instance = this;
    this.workApi.setPoints(this.resolveItemID(workItem), storyPoints, function (apiError, updatedStory) {
        instance.handleErrors(apiError);
        instance.displayItemLine(updatedStory, {recentId: false});
    });
};

WorkTracker.prototype.logTime = function (taskItem, timeInHours) {
    var instance = this;
    this.workApi.recordTime(this.resolveItemID(taskItem), timeInHours, function(apiError, timeData) {
        instance.handleErrors(apiError);
        if (timeData.TotalHours) {
          console.log("Task " + taskItem.highlight() + " time recorded: " + timeData.TotalHours.toString().highlight() + " hours.");
        } else {
          console.log(timeData);
        }
    });
}

WorkTracker.prototype.manageTask = function (actionType, parentStory, taskOptions) {
    var instance = this,
        teamIdent = instance.settings.teamName,
        projIdent = taskOptions.projName || instance.settings.projName,
        displayProjectName = projIdent || teamIdent,
        tagList = taskOptions.itemTags ? taskOptions.itemTags.split(',') : [];

    this.workApi.processTask(actionType, displayProjectName, this.resolveItemID(parentStory), taskOptions.taskName, tagList, function (apiError, actionTypeResponse, updatedStory, taskNameResponse) {
        instance.handleErrors(apiError);
        instance.displayItemLine(updatedStory, {recentId: false});
    });
};

WorkTracker.prototype.handleErrors = function (issue) {
    if (issue !== null) {
        issue = typeof issue === "object" ? issue.errorMessage : issue
        console.error(issue.errorHighlight());
        process.terminate(1);
    }
};

WorkTracker.prototype.isCurrentlyWorking = function(workObject){
    return (workObject.CurrentState == "Working" || workObject.ScheduleStatus === "Working");
};

WorkTracker.prototype.displayItemLine = function (workItem, displayOptions) {
    var defaultSettings = {status: true, assignees: false, labels: true, recentId: true};
    displayOptions = util.mergeObjects({}, defaultSettings, displayOptions || {});
    var outputFields = [];
    if (displayOptions.recentId) {
        outputFields.push(this.getRecentID(workItem));
    }
    outputFields.push(workItem.FormattedRefID.highlight());
    outputFields.push((workItem.PlannedEffort || '-').toString().infoColor());
    if (displayOptions.status) {
        var statusText = ITEM_STATUS_MAP[workItem.ScheduleStatus];
        if (typeof statusText === "string") {
            outputFields.push(workItem.IsBlocked ? statusText.errorHighlight() : statusText.successHighlight());
        }
    }
    outputFields.push(workItem.DisplayName);
    if (displayOptions.assignees) {
        var assignedUsers = [], trackerInstance = this;
        workItem.SubTasks.forEach(function (subItem) {
            if (trackerInstance.isCurrentlyWorking(subItem) && subItem.OwnerInfo !== null) {
                assignedUsers.push(subItem.OwnerInfo.refName);
            }
        });
        outputFields.push(util.filterNulls(assignedUsers).join(', ').infoColor());
    }
    
    if (displayOptions.labels) {
        var itemTags = util.mapArray(util.filterNulls(workItem.Labels), function (lbl) { return lbl.LabelName }).join(', ');
        outputFields.push(this.isCurrentlyWorking(workItem) ? itemTags.accentColor() : itemTags.faded());
    }

    console.log(outputFields.join(' '));
};

WorkTracker.prototype.displaySubTaskLine = function (subTask, displayOptions) {
    var defaultSettings = {recentId: true, indent: true, labels: true, effort: false};
    displayOptions = util.mergeObjects({}, defaultSettings, displayOptions || {});
    
    var currentTaskStatus = SUBTASK_STATUS_MAP[subTask.ScheduleStatus || subTask.CurrentState] || '.',
        taskOwner = subTask.OwnerInfo !== null ? "❙ " + subTask.OwnerInfo.refName : '',
        outputFields = [],
        pairProgrammer = (subTask.PairDev && subTask.PairDev !== "" && subTask.PairDev !== "true" && subTask.PairDev !== null) ? "& " + subTask.PairDev : null;

    if (displayOptions.recentId)
        outputFields.push(this.getRecentID(subTask));
    
    if (displayOptions.indent)
        outputFields.push(' ');

    outputFields.push(subTask.FormattedRefID.highlight());
    if (displayOptions.effort)
        outputFields.push((subTask.PlannedEffort || '-').toString().infoColor());

    outputFields.push(subTask.IsBlocked ? currentTaskStatus.errorHighlight() : currentTaskStatus.successHighlight());
    outputFields.push(subTask.DisplayName);
    
    outputFields.push(this.isCurrentlyWorking(subTask) ? taskOwner.infoColor() : taskOwner);  
    
    if (pairProgrammer) {
        outputFields.push(this.isCurrentlyWorking(subTask) ? pairProgrammer.infoColor() : pairProgrammer);
    }

    if (displayOptions.labels) {
        var taskLabels = util.mapArray(util.filterNulls(subTask.Labels), function (lbl) { return lbl.LabelName }).join(', ');
        outputFields.push(this.isCurrentlyWorking(subTask) ? taskLabels.accentColor() : taskLabels.faded());
    }

    console.log(outputFields.join(' '));
};

WorkTracker.prototype.displayDiscussionEntry = function (discussionEntry, displayOptions) {
    var defaultSettings = {entryNum: true, indent: true};
    displayOptions = util.mergeObjects({}, defaultSettings, displayOptions || {});

    var commentAuthor = discussionEntry.AuthorInfo !== null ? discussionEntry.AuthorInfo.refName + " ❙" : '',
        entryNumberStr = '' + (discussionEntry.EntryIndex + 1),
        outputFields = [];

    if (displayOptions.indent)
        outputFields.push(' ');

    if (displayOptions.entryNum)
        outputFields.push(entryNumberStr.highlight());

    outputFields.push(commentAuthor.infoColor());
    outputFields.push(discussionEntry.CommentContent);

    console.log(outputFields.join(' '));
};

WorkTracker.prototype.getRecentID = function (itemEntity) {
    if (this.entity_ids === void 0) {
        this.entity_ids = [];
    }
    this.entity_ids.push(itemEntity.FormattedRefID);
    return this.padRight(this.entity_ids.length, 3);
};

WorkTracker.prototype.padRight = function (inputNum, totalCols) {
    var paddedString = inputNum.toString();
    while (paddedString.length < totalCols) {
        paddedString = ' ' + paddedString;
    }
    return paddedString;
};

WorkTracker.prototype.storeRecentIDs = function () {
    if(this.entity_ids !== void 0) {
        filesys.writeFileSync(
            filepath.combine(process.env.USER_DIR, '.tracker_history'),
            JSON.stringify(this.entity_ids)
        );
    }
};

WorkTracker.prototype.resolveItemID = function (inputIdentifier) {
    if (inputIdentifier.match(/^\d+$/)) {
        var recentIndex = Number.parseInt(inputIdentifier, 10);
        if (this.recentIDs !== void 0 && recentIndex <= this.recentIDs.length) {
            return this.recentIDs[recentIndex - 1];
        }
        else {
            console.error(('No recent ID ' + inputIdentifier + ' found').errorHighlight());
            process.terminate(1);
        }
    }
    return inputIdentifier;
}

var ITEM_STATUS_MAP = {
  "Proposed": "?",
  "New": "·",
  "Submitted": "·",
  "Working": "▸",
  "Done": "✔",
  "Resolved": "✔",
  "Closed": "✔",
  "Approved": "✩",
  "Deployed": "✮",
  "Refining": "⌚"
};

var SUBTASK_STATUS_MAP = util.mergeObjects(ITEM_STATUS_MAP, {
  "Submitted": "·",
  "New": "·",
  "Open": "·",
  "Working": "▸",
  "Done": "✔",
  "Resolved": "✔",
});