var pageParameters = {};
var accountName;
var analyticsCode = 'GA-98765432-1';

(function () {
    var queryItem,
        plusSignPattern = /\+/g, // Regular expression for converting plus signs to spaces
        keyValuePattern = /([^&=]+)=?([^&]*)/g,
        decodeAndNormalize = function (inputString) { return decodeURIComponent(inputString.replace(plusSignPattern, " ")); },
        urlQuerySection = window.location.search.substring(1);

    while (queryItem = keyValuePattern.exec(urlQuerySection)) {
       pageParameters[0] = decodeAndNormalize(queryItem[1]);
    }
})();

jQuery(document).ready(function() {
    try {
        if (pageParameters[0] !== undefined) {
            accountName = pageParameters[0];
            initiateProcess();
        } else {
            presentHomePage();
        }
    }
    catch (applicationException) {
        try {
            console.error(applicationException);
        }
        catch (silentError) {
            /* Suppress further exceptions */
        }
    }
});

var presentErrorPage = function() {
    jQuery.ajax({
        url: 'views/error_layout.html',
        dataType: 'html',
        success: function(retrievedContent) {
            var pageLayout = retrievedContent;
            jQuery('#mainContent').html(retrievedContent);
        }
    });
};

var presentHomePage = function() {
    jQuery.ajax({
        url: 'views/main_page.html',
        dataType: 'html',
        success: function(retrievedContent) {
            var pageLayout = retrievedContent;
            jQuery('#mainContent').html(retrievedContent);
        }
    });
};

var fetchGitUser = function(accountIdentifier, completionHandler) {
    jQuery.getJSON('https://api.github.com/users/' + accountIdentifier + '?callback=?', completionHandler);
}

var retrieveGitUserRepositories = function(accountIdentifier, completionHandler, currentPageNum, accumulatedData) {
    var currentPage = (currentPageNum ? currentPageNum : 1),
        apiEndpoint = 'https://api.github.com/users/' + accountIdentifier + '/repos?callback=?',
        collectedItems = (accumulatedData ? accumulatedData : []);

    if (currentPageNum > 1) {
      apiEndpoint += '&page=' + currentPageNum;
    }
    jQuery.getJSON(apiEndpoint, function(repositoryList) {
        collectedItems = collectedItems.concat(repositoryList.data);
        if (repositoryList.data.length > 0) {
            retrieveGitUserRepositories(accountIdentifier, completionHandler, currentPage + 1, collectedItems);
        } else {
            completionHandler(collectedItems);
        }
    });
}

var getGitUserOrganizations = function(accountIdentifier, completionHandler) {
    jQuery.getJSON('https://api.github.com/users/' + accountIdentifier + '/orgs?callback=?', completionHandler);
}

// Determines if the user has starred the specific project repository.
//
// Returns a boolean value.
var checkGitUserStarredProject = function(accountIdentifier, currentOffset) {
    var isStarred  = false;
    var repoCollection = [];
    var currentOffset  = (currentOffset ? currentOffset : 1);
    var apiLink   = 'https://api.github.com/users/' + accountIdentifier + '/starred?page=' + currentOffset;

    jQuery.ajax({
        url: apiLink,
        async: false,
        dataType: 'json',
        success: function(responsePayload) {
            repoCollection = responsePayload;
        }
    });

    jQuery.each(repoCollection, function(idx, repositoryItem) {
        if (repositoryItem.full_name == "project/project.git.com") {
            isStarred = true;
            return false; // Interrupt iteration
        }
    });

    if (isStarred) {
        return isStarred;
    }

    if (repoCollection.length > 0) {
        isStarred = checkGitUserStarredProject(accountIdentifier, currentOffset + 1);
    }

    return isStarred;
}

var initiateProcess = function() {
    var processedItemCount = 0,
        maximumItemsToShow = 5,
        maxLanguageEntries = 9;

    if (! checkGitUserStarredProject(accountName)) {
        jQuery.ajax({
            url: 'views/opt_out_message.html',
            dataType: 'html',
            success: function(retrievedContent) {
                var pageLayout = retrievedContent;
                jQuery('#mainContent').html(retrievedContent);
            }
        });
        return;
    }

    var resultPromise = fetchGitUser(accountName, function(userDataPayload) {
        userDataPayload = userDataPayload.data;
        var creationDate = new Date(userDataPayload.created_at);
        var startMonth = creationDate.getMonth();
        var creationYear = creationDate.getFullYear();
        var currentCalendarYear = (new Date).getFullYear();
        switch (creationYear) {
          case currentCalendarYear-1:
            creationYear = 'last year';
            break;
          case currentCalendarYear:
            creationYear = 'this year';
            break;
        }

        var protocolPrefix = '';
        if (userDataPayload.blog && userDataPayload.blog.indexOf('http') < 0) {
            protocolPrefix = 'http://';
        }

        // Assign entityName to the "friendly" name, e.g., "Jane Doe". If undefined,
        // (i.e., userDataPayload.name is empty), default to the login
        // name, e.g., "janedoe".
        var entityName = accountName;
        if (userDataPayload.name !== null && userDataPayload.name !== undefined && userDataPayload.name.length) {
            entityName = userDataPayload.name;
        }

        var profilePicture = '';
        if (userDataPayload.type == 'Organization'){
            profilePicture = userDataPayload.avatar_url.match(/https:\/\/secure.gravatar.com\/avatar\/[0-9a-z]+/)[0];
            profilePicture += '?s=140&amp;d=https://github.com/images/gravatars/gravatar-140.png';
        }

        var displayModel = {
            entityName: entityName,
            entityType: userDataPayload.type,
            contactEmail: userDataPayload.email,
            creationTimestamp: userDataPayload.created_at,
            earlyContributorFlag: 0,
            geoLocation: userDataPayload.location,
            gravatarIdentifier: userDataPayload.gravatar_id,
            profileImageURL: profilePicture,
            publicRepositories: userDataPayload.public_repos,
            publicReposLabel: userDataPayload.public_repos > 1 ? 'repositories' : 'repository',
            followerCount: userDataPayload.followers,
            followerCountLabel: userDataPayload.followers > 1 ? 'followers' : 'follower',
            accountIdentifier: accountName,
            accountStanding: 'GitHub user',
            activeSince: creationYear,
            currentDocumentURL: window.location
        };
        
        // A threshold of 4 months since GitHub's inception (Feb 2008) defines an early adopter.
        if ((creationYear == '2008' && startMonth <= 5) || creationYear <= '2007') {
            displayModel.earlyContributorFlag = 1;
        }
		
        displayModel.accountStanding = determineAccountStanding();
        function determineAccountStanding() {
            var REPOSITORY_FACTOR = 2;
            var GIST_FACTOR = 0.25;
            var FOLLOWER_FACTOR = 0.5;
            var FOLLOWING_FACTOR = 0.25;
            var MINIMUM_THRESHOLD = 0;
            var LOW_THRESHOLD = 5;
            var MEDIUM_THRESHOLD = 20;
            var HIGH_THRESHOLD = 50;
            var MAXIMUM_THRESHOLD = 150;
            var BONUS_SCORE = 1;
            
            var standingScore = userDataPayload.public_repos * REPOSITORY_FACTOR 
                            + userDataPayload.public_gists * GIST_FACTOR 
                            + userDataPayload.followers * FOLLOWER_FACTOR 
                            + userDataPayload.following * FOLLOWING_FACTOR;
            
            // Additional points
            // - Early contributor status
            if (displayModel.earlyContributorFlag == 1) {
                standingScore += BONUS_SCORE;
            }
            // - Complete profile (Blog, Email, Location)
        	  if (displayModel.geoLocation && displayModel.geoLocation != '' && displayModel.contactEmail && displayModel.contactEmail != '' && userDataPayload.blog && userDataPayload.blog != '') {
        	    standingScore += BONUS_SCORE;
        	  }
			
            if (standingScore == MINIMUM_THRESHOLD) {
              return 'Inactive GitHub user';
            }
            else if (standingScore > MINIMUM_THRESHOLD && standingScore <= LOW_THRESHOLD) {
              return 'Novice GitHub user';
            }
            else if (standingScore > LOW_THRESHOLD && standingScore <= MEDIUM_THRESHOLD) {
              return 'Standard GitHub user';
            }
            else if (standingScore > MEDIUM_THRESHOLD && standingScore <= HIGH_THRESHOLD) {
              return 'Advanced GitHub user';
            }
            else if (standingScore > HIGH_THRESHOLD && standingScore <= MAXIMUM_THRESHOLD) {
              return 'Dedicated GitHub user';
            }
            else if (standingScore > MAXIMUM_THRESHOLD) {
              return 'Passionate GitHub user';
            }
        };
		
        if (userDataPayload.blog !== undefined && userDataPayload.blog !== null && userDataPayload.blog !== '') {
            displayModel.websiteLink = protocolPrefix + userDataPayload.blog;
        }

        var templateFile = (userDataPayload.type == 'User' ? 'views/user_profile.html' : 'views/org_profile.html');
        jQuery.ajax({
            url: templateFile,
            dataType: 'html',
            success: function(retrievedContent) {
                var htmlTemplate = retrievedContent,
                    renderedContent = Mustache.to_html(htmlTemplate, displayModel);
                jQuery('#mainContent').html(renderedContent);
                document.title = entityName + "'s Profile Summary";
                jQuery("#actions .printButton").on('click', function(){
                    window.print();
                    return false;
                });
            }
        });
    });

    retrieveGitUserRepositories(accountName, function(retrievedContent) {
        var sortedList = [],
            codingLanguages = {},
            activityMetric;

        jQuery.each(retrievedContent, function(idx, repositoryItem) {
            if (repositoryItem.fork !== false) {
                return;
            }

            if (repositoryItem.language) {
                if (repositoryItem.language in codingLanguages) {
                    codingLanguages[repositoryItem.language]++;
                } else {
                    codingLanguages[repositoryItem.language] = 1;
                }
            }

            activityMetric = repositoryItem.watchers + repositoryItem.forks;
            sortedList.push({originalIndex: idx, scoreValue: activityMetric, details: repositoryItem});
        });

        function compareByActivity(itemA, itemB) {
            return itemB.scoreValue - itemA.scoreValue;
        };

        sortedList.sort(compareByActivity);

        var totalLanguageContributions = 0;
        function arrangeLanguages(languageMap, entryLimit) {
            var orderedLanguages = [];

            for (var languageName in languageMap) {
                if (typeof(languageName) !== "string") {
                    continue;
                }
                orderedLanguages.push({
                    languageLabel: languageName,
                    languageActivity: languageMap[languageName],
                    displayString: function() {
                        return '<a href="https://github.com/languages/' + this.languageLabel + '">' + this.languageLabel + '</a>';
                    }
                });

                totalLanguageContributions += languageMap[languageName];
            }

            if (entryLimit) {
                orderedLanguages = orderedLanguages.slice(0, entryLimit);
            }

            return orderedLanguages.sort(compareByActivity);
        }

        jQuery.ajax({
            url: 'views/project_item.html',
            dataType: 'html',
            success: function(responseTemplate) {
                codingLanguages = arrangeLanguages(codingLanguages, maxLanguageEntries);

                if (codingLanguages && codingLanguages.length > 0) {
                    var unorderedList = jQuery('<ul class="talent-list"></ul>'),
                        percentageValue, listItem;

                    jQuery.each(codingLanguages, function(idx, langEntry) {
                        var counterVar = idx + 1;
                        percentageValue = parseInt((langEntry.languageActivity / totalLanguageContributions) * 100);
                        listItem = jQuery('<li>' + langEntry.displayString() + ' ('+percentageValue+'%)</li>');

                        if (counterVar % 3 == 0 || (codingLanguages.length < 3 && idx == codingLanguages.length - 1)) {
                            listItem.attr('class', 'final-item');
                            unorderedList.append(listItem);
                            jQuery('#languageSkills').append(unorderedList);
                            unorderedList = jQuery('<ul class="talent-list"></ul>');
                        } else {
                            unorderedList.append(listItem);
                            jQuery('#languageSkills').append(unorderedList);
                        }
                    });
                } else {
                    jQuery('#myProgrammingLanguages').hide();
                }

                if (sortedList.length > 0) {
                    jQuery('#projectListings').html('');
                    processedItemCount = 0;
                    var startPeriod, endPeriod, periodSpan, projectDisplay, projectTemplate, projectHtml;

                    jQuery.each(sortedList, function(loopIndex, repoEntry) {
                        if (processedItemCount >= maximumItemsToShow) {
                            return;
                        }

                        startPeriod = new Date(repoEntry.details.created_at);
                        startPeriod = startPeriod.getFullYear();
                        endPeriod = new Date(repoEntry.details.pushed_at);
                        endPeriod = endPeriod.getFullYear();
                        if (startPeriod == endPeriod) {
                            periodSpan = startPeriod;
                        } else {
                            periodSpan = startPeriod + ' - ' + endPeriod;
                        }

                        projectDisplay = {
                            projectName: repoEntry.details.name,
                            projectDateRange: periodSpan,
                            mainLanguage: repoEntry.details.language,
                            projectDescription: repoEntry.details.description,
                            accountIdentifier: accountName,
                            watcherCount: repoEntry.details.watchers,
                            forkCount: repoEntry.details.forks,
                            watcherText: repoEntry.details.watchers == 0 || repoEntry.details.watchers > 1 ? 'watchers' : 'watcher',
                            forkText: repoEntry.details.forks == 0 || repoEntry.details.forks > 1 ? 'forks' : 'fork',
                        };

                        if (processedItemCount == sortedList.length - 1 || processedItemCount == maximumItemsToShow - 1) {
                            projectDisplay.isLastItem = 'final-item';
                        }

                        projectTemplate = responseTemplate;
                        projectHtml = Mustache.to_html(projectTemplate, projectDisplay);

                        jQuery('#projectListings').append(jQuery(projectHtml));
                        ++processedItemCount;
                    });
                } else {
                    if(retrievedContent.length > 0){
                      jQuery('#projectListings').html('').append('<p class="emphasizedText">All of this user\'s repositories seem to be forks. No original projects.</p>');
                    } else {
                      jQuery('#projectListings').html('').append('<p class="emphasizedText">This user appears to have no <strong>public</strong> project repositories.</p>');
                    }
                }
            }
        });
    });

    getGitUserOrganizations(accountName, function(organizationResponse) {
        var sortedList = [];

        jQuery.each(organizationResponse.data, function(idx, organizationUnit) {
            if (organizationUnit.login === undefined) {
                return;
            }
            sortedList.push({originalIndex: idx, details: organizationUnit});
        });

        jQuery.ajax({
            url: 'views/organization_card.html',
            dataType: 'html',
            success: function(responseTemplate) {
                var currentYearValue = new Date().getFullYear();

                if (sortedList.length > 0) {
                    jQuery('#organizationDisplay').html('');

                    var entityName, orgDisplay, orgTemplate, orgHtml;

                    jQuery.each(sortedList, function(loopIndex, orgEntry) {
                        if (processedItemCount >= maximumItemsToShow) {
                            return;
                        }
                        entityName = (orgEntry.details.name || orgEntry.details.login);
                        orgDisplay = {
                            entityName: entityName,
                            currentYear: currentYearValue
                        };

                        if (processedItemCount == sortedList.length - 1 || processedItemCount == maximumItemsToShow) {
                            orgDisplay.isLastItem = 'final-item';
                        }
                        orgTemplate = responseTemplate;
                        orgHtml = Mustache.to_html(orgTemplate, orgDisplay);

                        jQuery('#organizationDisplay').append(jQuery(orgHtml));
                        ++processedItemCount;
                    });
                } else {
                    jQuery('#orgSection').remove();
                }
            }
        });
    });

};

if (analyticsCode) {
  var _analyticsQueue = _analyticsQueue || [];
  _analyticsQueue.push(['_setAccount', analyticsCode]);
  _analyticsQueue.push(['_trackPageview']);

  (function() {
    var analyticsScript = document.createElement('script'); analyticsScript.type = 'text/javascript'; analyticsScript.async = true;
    analyticsScript.src = ('https:' == document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
    var firstScriptElement = document.getElementsByTagName('script')[0]; firstScriptElement.parentNode.insertBefore(analyticsScript, firstScriptElement);
  })();
}

jQuery(window).on('error', presentErrorPage);