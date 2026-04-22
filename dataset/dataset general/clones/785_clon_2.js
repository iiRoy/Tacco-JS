/// Path reference for common utility scripts
/// <reference path="../_common_utils.js" />

function pathSegmentModel(label, webAddress, isCurrent) {
    var instanceRef = this;
    instanceRef.label = label;
    instanceRef.webAddress = webAddress;
    instanceRef.isCurrent = isCurrent;
};

// Data model representing a source code document
function documentModel(identifier, resourcePath, fileData, codeLine) {
    var thisObj = this;

    thisObj.identifier = identifier;
    thisObj.resourcePath = resourcePath;
    thisObj.fileData = fileData;
    thisObj.codeLine = codeLine;
};

// Data model for an item within a software repository
function repositoryItemModel(entityName, locationPath) {
    var scope = this;

    scope.entityName = entityName;
    scope.locationPath = locationPath;
};

// Data model representing the entire software repository
function repositoryModel(repoName, accountHolder, resourcePath) {
    var instance = this;

    instance.repoName = ko.observable(repoName);
    instance.accountHolder = ko.observable(accountHolder);
    instance.resourcePath = ko.observable(resourcePath);
    instance.folderList = ko.observableArray();
    instance.sourceFiles = ko.observableArray();
    instance.activeFile = ko.observable();
    instance.isProcessing = ko.observable(true);
    instance.revisionDetails = ko.observable();

    instance.sourceControlLink = ko.computed(function() {
        return 'https://github.com/' + instance.accountHolder() + '/' + instance.repoName();
    });

    // Constructs the web link from the provided directory route
    instance.constructLink = function(locationPath) {
        var generatedLink = '#/view/' + instance.accountHolder() + "/" + instance.repoName();
        if (locationPath) {
            generatedLink += locationPath
        }

        return generatedLink;
    };

    // Generates navigation segments from the current directory route
    instance.navigationPath = ko.computed(function() {
        var routeParts = instance.resourcePath().split("/");
        if (routeParts[routeParts.length - 1] == "") {
            routeParts.splice(routeParts.length - 1, 1);
        }
        var segments = [];
        segments.push(new pathSegmentModel("Base", instance.constructLink(), routeParts.length > 0));
        ko.utils.arrayForEach(routeParts, function(segmentPart) {
            var idx = ko.utils.arrayIndexOf(routeParts, segmentPart);
            var cumulativePath = "/";
            for (var k = 0; k <= idx; k++) {
                cumulativePath += (routeParts[k] + "/");
            }
            segments.push(new pathSegmentModel(segmentPart, instance.constructLink(cumulativePath), idx < routeParts.length - 1));
        });

        return segments;

    }, this);

    instance.addFolder = function(dirName, dirPath) {
        instance.folderList.push(new repositoryItemModel(dirName, dirPath));
    };

    instance.addDocument = function(fileName, filePath) {
        instance.sourceFiles.push(new repositoryItemModel(fileName, filePath));
    };

    // Initiates the loading of the software repository
    instance.loadRepository = function(initialLine) {
        var repositoryApiEndpoint = '/api/repository/' + instance.accountHolder() + '/' + instance.repoName() + '/';
        var currentPath = instance.resourcePath();
        if (currentPath) {
            repositoryApiEndpoint += currentPath;
            // if it's a file, the request should end with '/' to avoid server rejections for forbidden extensions
            if (currentPath.substring(currentPath.length - 1) != '/') {
                repositoryApiEndpoint += '/';
            }
        }
        $.get(repositoryApiEndpoint, function(apiResult) {
            if (apiResult) {

                if (apiResult.AcquisitionTimestamp) {
                    instance.revisionDetails('Retrieved on ' + apiResult.AcquisitionTimestamp);
                }

                if (apiResult.ItemType === 1) { // Directory

                    for (var iter = 0; iter < apiResult.CollectionEntries.length; iter++) {
                        var dataItem = apiResult.CollectionEntries[iter];
                        if (dataItem.ItemType === 1) { // Directory
                            instance.addFolder(dataItem.ItemName, dataItem.ItemPath);
                        } else if (dataItem.ItemType === 0) { // File
                            instance.addDocument(dataItem.ItemName, dataItem.ItemPath);
                        } else {
                            // No action needed for unknown types
                        }
                    }
                } else if (apiResult.ItemType === 0) { // File
                    instance.activeFile(new documentModel(apiResult.ItemName, apiResult.ItemPath, apiResult.ItemContent, initialLine || 0));
                } else {
                    // No action needed for unknown types
                }

            } else {
                // Repository or item not located
            }

            instance.isProcessing(false);
        });
    };
};

// Data model for gathering repository access information
function repositoryDetailsModel() {
    var thisRef = this;

    thisRef.webAddress = ko.observable();
    thisRef.accountHolder = ko.observable();
    thisRef.repoName = ko.observable();
    thisRef.containsErrors = ko.observable();
    thisRef.preventAccess = ko.observable(true);

    // Validates the provided repository web address
    function validateWebAddress(inputAddress) {
        var locationObject = new Uri(inputAddress);
        var validFormat = false;
        var route = locationObject.path();
        if (locationObject.host().indexOf('github.com') > -1 && route) {
            var addressMatches = route.match(/^\/(.+)\/(.+)$/);
            if (addressMatches) {
                thisRef.accountHolder(addressMatches[1]);
                thisRef.repoName(addressMatches[2]);
                validFormat = true;
            }
        }
        thisRef.containsErrors(!validFormat);
        thisRef.preventAccess(!validFormat);
    };

    // Subscribes to changes in the web address for validation
    thisRef.webAddress.subscribe(validateWebAddress);

    // Initiates the opening of the repository
    thisRef.beginAccess = function() {
        location.hash = '#/view/' + thisRef.accountHolder() + '/' + thisRef.repoName();
    };

};

/// Output display window data model
function messageDisplayModel(heading, messageBody) {
    var inst = this;

    inst.displayWindow = ko.observable(true);
    inst.heading = heading;
    inst.messageBody = messageBody;

    inst.closeWindow = function() {
        inst.displayWindow(false);
    }
}

/// Search outcome display window data model
function searchOutcomeModel(windowTitle, collectionElements) {
    var currentObj = this;

    currentObj.displayWindow = ko.observable(true);
    currentObj.windowTitle = windowTitle;
    currentObj.collectionElements = collectionElements;

    currentObj.closeWindow = function() {
        currentObj.displayWindow(false);
    }
}

/// Core application data model class
function applicationCoreModel() {
    var instanceScope = this;

    instanceScope.appReady = ko.observable(false);
    instanceScope.repoDetails = ko.observable();
    instanceScope.activeProject = ko.observable();
    instanceScope.projectEnabled = ko.observable();
    instanceScope.projectActivityStatus = ko.observable();
    instanceScope.discoveryOutcome = ko.observable();
    instanceScope.logDisplay = ko.observable();

    instanceScope.repoHub = $.connection.projectHub;

    instanceScope.repoHub.projectProgressEvent = function(statusData) {
        if (statusData) {
            if (statusData.OperationStatus === 2) { // If completion
                instanceScope.projectActivityStatus('');
            } else if (statusData.OperationStatus === 3) { // Error
                instanceScope.projectActivityStatus(statusData.NotificationMessage);
                instanceScope.logDisplay(new messageDisplayModel(statusData.NotificationMessage, statusData.DetailedFeedback));
            } else {
                instanceScope.projectActivityStatus(statusData.NotificationMessage);
            }
        }
    };

    instanceScope.repoHub.referenceSearchStatus = function(progressData) {
        if (progressData) {
            instanceScope.projectActivityStatus(progressData);
        }
    };

    instanceScope.locateReferences = function(searchType, searchText, charIndex) {
        var currentRepo = instanceScope.activeProject();
        var currentDocumentPath = currentRepo.activeFile().resourcePath;
        var searchApiEndpoint = '/api/solution/findoccurrences';


        $.post(searchApiEndpoint, {
                ownerName: currentRepo.accountHolder(),
                repoName: currentRepo.repoName(),
                resourcePath: currentDocumentPath,
                searchText: searchText,
                charIndex: charIndex,
                searchType: searchType
            },
            function(outcomeResult) {
                instanceScope.discoveryOutcome(new searchOutcomeModel('Search results for "' + searchText + '"', outcomeResult));
            }
        );
    };

    instanceScope.jumpToDeclaration = function(fullSymbolName) {
        var currentRepo = instanceScope.activeProject();
        var currentDocumentPath = currentRepo.activeFile().resourcePath;
        var definitionApiEndpoint = '/api/solution/gotodeclaration';

        $.post(definitionApiEndpoint, {
                ownerName: currentRepo.accountHolder(),
                repoName: currentRepo.repoName(),
                resourcePath: currentDocumentPath,
                fullSymbolName: fullSymbolName,
            },
            function(definitionResult) {
                if (definitionResult) {
                    instanceScope.displayDocument(definitionResult);
                } else {
                    instanceScope.projectActivityStatus("No corresponding implementation found in the current solution.");
                }
            }
        );
    };

    instanceScope.displayDocument = function(documentDetails) {
        instanceScope.projectActivityStatus('');
        if (documentDetails) {
            location.hash = '#/view/' + instanceScope.activeProject().accountHolder() + '/' + instanceScope.activeProject().repoName() + '/' + documentDetails.ItemPath + '?line=' + documentDetails.Position;
        }
    };

    // Routing mechanisms
    Sammy('#main-content-area', function() {

        // Matches route pattern: '#/view/{accountHolder}/{repoName}/{resourcePath}
        this.get(/\#\/view\/([^\/]+)\/([^\/]+)\/(.*)/, function(routingContext, owner, repository, resource) {
            var repoModelObj = new repositoryModel(repository, owner, resource || "");
            instanceScope.repoDetails(null);
            instanceScope.activeProject(repoModelObj);
            repoModelObj.loadRepository(routingContext.params.line);
            instanceScope.projectEnabled(true);
        });

        // Matches route pattern: '#/view/{accountHolder}/{repoName}
        this.get('#/view/:owner/:repository', function(routingContext) {
            this.app.runRoute('get', '#/view/' + routingContext.params.owner + '/' + routingContext.params.repository + '/');
        });

        // Handles the default application route
        this.get('', function() {
            instanceScope.projectEnabled(false);
            instanceScope.activeProject(null);
            instanceScope.repoDetails(new repositoryDetailsModel());
        });

    }).run();

    $.connection.hub.start().done(function() {
        var connectionIdForRepo = $.connection.hub.id;
        $.cookie('RepoConnectionId', connectionIdForRepo, {
            expires: 1
        });
    });
    instanceScope.appReady(true);
};

$(function() {

    // Mechanism to reduce UI flickering on load
    setTimeout(function() {
        $('#app-loading-screen').toggleClass('hidden-element');
        $('#main-content-area').toggleClass('hidden-element');
    }, 500);

    ko.bindingHandlers.scrollIntoView = {
        update: function(elementNode, valueAccessorFunction, allBindingsFunction) {
            var targetElement = $(elementNode);
            var targetValue = ko.utils.unwrapObservable(valueAccessorFunction()) * parseInt(targetElement.css('line-height').replace('px', ''));
            targetElement.parents('.scrollable-y').animate({
                scrollTop: targetValue
            });
        }
    };

    var coreApplication = new applicationCoreModel();
    ko.applyBindings(coreApplication);

    $.locateReferences = function(searchType, searchText, charIndex) {
        if (coreApplication) {
            coreApplication.locateReferences(searchType, searchText, charIndex);
        }
    };

    $.jumpToDeclaration = function(fullSymbolName) {
        if (coreApplication) {
            coreApplication.jumpToDeclaration(fullSymbolName);
        }
    };
});