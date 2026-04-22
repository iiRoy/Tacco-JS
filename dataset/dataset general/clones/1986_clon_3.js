let userProfileData = {};
let currentGithubLogin;
const trackingIdentifier = 'UA-21222559-1';

(function initializeQueryParams() {
    const plusReplacementRegex = /\+/g;
    const parameterCaptureRegex = /([^&=]+)=?([^&]*)/g;
    const decodeAndSanitize = (segment) => decodeURIComponent(segment.replace(plusReplacementRegex, ' '));
    const urlQueryString = window.location.search.substring(1);

    if (!urlQueryString) {
        return;
    }

    let extractedParameters = {};
    let currentMatch;
    while ((currentMatch = parameterCaptureRegex.exec(urlQueryString)) !== null) {
        let paramKey = decodeAndSanitize(currentMatch[1]);
        let paramValue = decodeAndSanitize(currentMatch[2]);
        extractedParameters[paramKey] = paramValue;
    }

    if (extractedParameters.login) {
        userProfileData.userLogin = extractedParameters.login;
    } else if (extractedParameters.user) {
        userProfileData.userLogin = extractedParameters.user;
    } else {
        const firstParameterKey = Object.keys(extractedParameters)[0];
        if (firstParameterKey) {
            userProfileData.userLogin = extractedParameters[firstParameterKey];
        }
    }
})();

const retrieveAndDisplayContent = function (pageFileName, dataContext = null) {
    const contentContainerSelector = '#resume';
    const contentFilePath = `views/${pageFileName}.html`;

    $.ajax({
        url: contentFilePath,
        dataType: 'html',
        success: function (fetchedHtml) {
            let processedHtml = fetchedHtml;
            if (dataContext && typeof Mustache !== 'undefined') {
                processedHtml = Mustache.to_html(fetchedHtml, dataContext);
            }
            $(contentContainerSelector).html(processedHtml);
        },
        error: function (xhr, status, error) {
            console.error(`Failed to load content from ${contentFilePath}: ${status}, ${error}`);
            $(contentContainerSelector).html('<p class="error-message">Content could not be loaded. Please check your connection or try again.</p>');
        }
    });
};

$(document).ready(() => {
    try {
        if (userProfileData.userLogin) {
            currentGithubLogin = userProfileData.userLogin;
            initializeGithubProfileView();
        } else {
            retrieveAndDisplayContent('index');
        }
    } catch (startupError) {
        console.error('An error occurred during application startup:', startupError);
        retrieveAndDisplayContent('error');
    }
});

const fetchGithubUserAccount = (loginName, callbackFunction) => {
    if (!loginName) {
        console.warn('Cannot fetch GitHub user account: login name is missing.');
        return;
    }
    $.getJSON(`https://api.github.com/users/${loginName}?callback=?`, callbackFunction);
};

const fetchGithubUserRepositoriesPaginated = (loginName, callbackFunction, currentPage = 1, accumulatedRepoList = []) => {
    if (!loginName) {
        console.warn('Cannot fetch GitHub user repositories: login name is missing.');
        callbackFunction([]);
        return;
    }

    let requestUrl = `https://api.github.com/users/${loginName}/repos?callback=?`;
    if (currentPage > 1) {
        requestUrl += `&page=${currentPage}`;
    }

    $.getJSON(requestUrl, (apiResponse) => {
        const pageData = apiResponse.data || [];
        const combinedData = accumulatedRepoList.concat(pageData);

        if (pageData.length > 0) {
            fetchGithubUserRepositoriesPaginated(loginName, callbackFunction, currentPage + 1, combinedData);
        } else {
            callbackFunction(combinedData);
        }
    }).fail((xhr, status, error) => {
        console.error(`Error fetching repositories for ${loginName}, page ${currentPage}: ${status}, ${error}`);
        callbackFunction(accumulatedRepoList);
    });
};

const fetchGithubUserOrganizations = (loginName, callbackFunction) => {
    if (!loginName) {
        console.warn('Cannot fetch GitHub user organizations: login name is missing.');
        return;
    }
    $.getJSON(`https://api.github.com/users/${loginName}/orgs?callback=?`, callbackFunction);
};

const checkResumeRepoStarStatus = (loginName, page = 1) => {
    if (!loginName) {
        console.warn('Cannot check starred repository status: login name is missing.');
        return false;
    }

    let foundStar = false;
    let currentStarredRepos = [];
    const starredApiEndpoint = `https://api.github.com/users/${loginName}/starred?page=${page}`;

    $.ajax({
        url: starredApiEndpoint,
        async: false,
        dataType: 'json',
        success: (data) => {
            currentStarredRepos = data;
        },
        error: (xhr, status, error) => {
            console.error(`Error checking starred status for ${loginName}, page ${page}: ${status}, ${error}`);
            currentStarredRepos = [];
        }
    });

    for (const repoDetail of currentStarredRepos) {
        if (repoDetail && repoDetail.full_name === "resume/resume.github.com") {
            foundStar = true;
            break;
        }
    }

    if (foundStar) {
        return true;
    }

    if (currentStarredRepos.length > 0) {
        foundStar = checkResumeRepoStarStatus(loginName, page + 1);
    }

    return foundStar;
};

const initializeGithubProfileView = () => {
    const maxVisibleRepos = 5;
    const maxVisibleLanguages = 9;

    if (!checkResumeRepoStarStatus(currentGithubLogin)) {
        retrieveAndDisplayContent('opt_out');
        return;
    }

    fetchGithubUserAccount(currentGithubLogin, (apiResponse) => {
        const accountData = apiResponse.data;
        if (!accountData) {
            console.error('Failed to retrieve GitHub account data.');
            retrieveAndDisplayContent('error');
            return;
        }

        const accountCreationDate = new Date(accountData.created_at);
        const accountCreationYear = accountCreationDate.getFullYear();
        const accountCreationMonth = accountCreationDate.getMonth();
        const currentYear = new Date().getFullYear();

        let formattedCreationYear = String(accountCreationYear);
        if (accountCreationYear === currentYear - 1) {
            formattedCreationYear = 'last year';
        } else if (accountCreationYear === currentYear) {
            formattedCreationYear = 'this year';
        }

        let blogUrlPrefix = '';
        if (accountData.blog && !accountData.blog.startsWith('http')) {
            blogUrlPrefix = 'http://';
        }

        const displayUserName = accountData.name || currentGithubLogin;

        let profileImageUrl = '';
        if (accountData.type === 'Organization') {
            const gravatarExtraction = accountData.avatar_url.match(/https:\/\/secure.gravatar.com\/avatar\/([0-9a-z]+)/);
            profileImageUrl = gravatarExtraction ? `${gravatarExtraction[0]}?s=140&amp;d=https://github.com/images/gravatars/gravatar-140.png` : accountData.avatar_url;
        } else {
            profileImageUrl = accountData.avatar_url;
        }

        const viewContext = {
            displayName: displayUserName,
            accountType: accountData.type,
            userEmail: accountData.email,
            creationTimestamp: accountData.created_at,
            isEarlyAdopter: 0,
            userLocation: accountData.location,
            gravatarId: accountData.gravatar_id,
            profilePicture: profileImageUrl,
            publicRepoCount: accountData.public_repos,
            reposLabel: accountData.public_repos !== 1 ? 'repositories' : 'repository',
            followerCount: accountData.followers,
            followersLabel: accountData.followers !== 1 ? 'followers' : 'follower',
            githubLogin: currentGithubLogin,
            userStatusTier: 'GitHub user',
            joinedDateText: formattedCreationYear,
            currentResumeUrl: window.location.href
        };

        if ((accountCreationYear === 2008 && accountCreationMonth <= 5) || accountCreationYear < 2008) {
            viewContext.isEarlyAdopter = 1;
        }

        const calculateUserEngagementTier = () => {
            const REPO_FACTOR = 2.0;
            const GIST_FACTOR = 0.25;
            const FOLLOWER_FACTOR = 0.5;
            const FOLLOWING_FACTOR = 0.25;

            const TIERS = [
                { threshold: 0, label: 'Inactive GitHub user' },
                { threshold: 5, label: 'Newbie GitHub user' },
                { threshold: 20, label: 'Regular GitHub user' },
                { threshold: 50, label: 'Advanced GitHub user' },
                { threshold: 150, label: 'Enthusiastic GitHub user' },
                { threshold: Infinity, label: 'Passionate GitHub user' }
            ];
            const PROFILE_COMPLETION_BONUS = 1.0;

            let engagementScore = (accountData.public_repos * REPO_FACTOR) +
                                (accountData.public_gists * GIST_FACTOR) +
                                (accountData.followers * FOLLOWER_FACTOR) +
                                (accountData.following * FOLLOWING_FACTOR);

            if (viewContext.isEarlyAdopter === 1) {
                engagementScore += PROFILE_COMPLETION_BONUS;
            }
            if (viewContext.userLocation && viewContext.userLocation.trim() !== '' &&
                viewContext.userEmail && viewContext.userEmail.trim() !== '' &&
                accountData.blog && accountData.blog.trim() !== '') {
                engagementScore += PROFILE_COMPLETION_BONUS;
            }

            for (const tier of TIERS) {
                if (engagementScore <= tier.threshold) {
                    return tier.label;
                }
            }
            return TIERS[TIERS.length - 1].label;
        };

        viewContext.userStatusTier = calculateUserEngagementTier();

        if (accountData.blog && accountData.blog.trim() !== '') {
            viewContext.personalWebsite = blogUrlPrefix + accountData.blog;
        }

        const templateToLoad = (accountData.type === 'User' ? 'resume' : 'resumeOrgs');
        retrieveAndDisplayContent(templateToLoad, viewContext);

        $('#resume').on('click', '#actions #print', function (event) {
            event.preventDefault();
            window.print();
            return false;
        });

        document.title = `${viewContext.displayName}'s GitHub Résumé`;
    });

    fetchGithubUserRepositoriesPaginated(currentGithubLogin, (allRepositories) => {
        let filteredAndScoredRepos = [];
        let programmingLanguageCounts = {};

        for (const repo of allRepositories) {
            if (repo.fork === false) {
                filteredAndScoredRepos.push({
                    originalOrder: filteredAndScoredRepos.length,
                    score: repo.stargazers_count + repo.forks_count, // Using stargazers_count for popularity
                    details: repo
                });

                if (repo.language) {
                    programmingLanguageCounts[repo.language] = (programmingLanguageCounts[repo.language] || 0) + 1;
                }
            }
        }

        filteredAndScoredRepos.sort((a, b) => b.score - a.score);

        const prepareLanguagesForDisplay = (languageData, displayLimit = null) => {
            let organizedLanguages = [];
            let totalLanguageOccurrences = 0;

            for (const langKey in languageData) {
                if (Object.prototype.hasOwnProperty.call(languageData, langKey)) {
                    totalLanguageOccurrences += languageData[langKey];
                    organizedLanguages.push({
                        languageName: langKey,
                        occurrenceCount: languageData[langKey]
                    });
                }
            }

            organizedLanguages.sort((a, b) => b.occurrenceCount - a.occurrenceCount);

            if (displayLimit !== null && organizedLanguages.length > displayLimit) {
                organizedLanguages = organizedLanguages.slice(0, displayLimit);
            }

            return organizedLanguages.map(item => ({
                ...item,
                toHtmlLink: () => `<a href="https://github.com/languages/${item.languageName}" target="_blank" rel="noopener noreferrer">${item.languageName}</a>`,
                overallTotal: totalLanguageOccurrences
            }));
        };

        $.ajax({
            url: 'views/job.html',
            dataType: 'html',
            success: (jobTemplate) => {
                const languagesToRender = prepareLanguagesForDisplay(programmingLanguageCounts, maxVisibleLanguages);
                const languagesDisplayArea = $('#content-languages');
                languagesDisplayArea.empty();

                if (languagesToRender.length > 0) {
                    let currentLanguageRow = $('<ul class="talent"></ul>');
                    let itemsInCurrentRow = 0;

                    languagesToRender.forEach((langItem, idx) => {
                        const percentage = ((langItem.occurrenceCount / langItem.overallTotal) * 100).toFixed(0);
                        const listItem = $(`<li>${langItem.toHtmlLink()} (${percentage}%)</li>`);

                        currentLanguageRow.append(listItem);
                        itemsInCurrentRow++;

                        if (itemsInCurrentRow % 3 === 0 || idx === languagesToRender.length - 1) {
                            languagesDisplayArea.append(currentLanguageRow);
                            currentLanguageRow = $('<ul class="talent"></ul>');
                            itemsInCurrentRow = 0;
                        }
                    });
                } else {
                    $('#mylanguages').hide();
                }

                const projectsContainer = $('#jobs');
                projectsContainer.empty();

                if (filteredAndScoredRepos.length > 0) {
                    let displayedProjectCount = 0;
                    for (const projectEntry of filteredAndScoredRepos) {
                        if (displayedProjectCount >= maxVisibleRepos) {
                            break;
                        }

                        const project = projectEntry.details;
                        const created = new Date(project.created_at);
                        const updated = new Date(project.pushed_at);
                        const createdYear = created.getFullYear();
                        const updatedYear = updated.getFullYear();

                        const dateRange = (createdYear === updatedYear) ? String(createdYear) : `${createdYear} - ${updatedYear}`;

                        const projectContext = {
                            projectName: project.name,
                            dateSpan: dateRange,
                            primaryLanguage: project.language,
                            projectDescription: project.description,
                            associatedLogin: currentGithubLogin,
                            starCount: project.stargazers_count,
                            forkCount: project.forks_count,
                            starLabel: project.stargazers_count !== 1 ? 'stars' : 'star',
                            forkLabel: project.forks_count !== 1 ? 'forks' : 'fork'
                        };

                        if (displayedProjectCount === filteredAndScoredRepos.length - 1 || displayedProjectCount === maxVisibleRepos - 1) {
                            projectContext.isLastEntry = 'last';
                        }

                        const renderedProjectHtml = Mustache.to_html(jobTemplate, projectContext);
                        projectsContainer.append($(renderedProjectHtml));
                        displayedProjectCount++;
                    }
                } else {
                    if (allRepositories.length > 0) {
                        projectsContainer.html('<p class="enlarge">This user\'s public repositories appear to be all forks. No original projects to display.</p>');
                    } else {
                        projectsContainer.html('<p class="enlarge">This user has no <strong>public</strong> repositories.</p>');
                    }
                }
            },
            error: (xhr, status, error) => {
                console.error(`Error loading job.html template: ${status}, ${error}`);
                $('#jobs').html('<p class="error-message">Failed to load project display template.</p>');
            }
        });
    });

    fetchGithubUserOrganizations(currentGithubLogin, (orgsResponse) => {
        const rawOrganizationData = orgsResponse.data || [];
        let processedOrganizationList = [];

        for (const orgEntry of rawOrganizationData) {
            if (orgEntry && orgEntry.login) {
                processedOrganizationList.push({
                    orgLoginName: orgEntry.login,
                    orgDisplayName: orgEntry.name || orgEntry.login,
                    orgDetails: orgEntry
                });
            }
        }

        $.ajax({
            url: 'views/org.html',
            dataType: 'html',
            success: (orgTemplate) => {
                const currentYear = new Date().getFullYear();
                const organizationsDisplayArea = $('#orgs');
                organizationsDisplayArea.empty();

                if (processedOrganizationList.length > 0) {
                    let displayedOrgCount = 0;
                    for (const orgItem of processedOrganizationList) {
                        if (displayedOrgCount >= maxVisibleRepos) { // Reusing project max for organizations
                            break;
                        }

                        const orgContext = {
                            organizationName: orgItem.orgDisplayName,
                            currentYear: currentYear,
                            organizationLogin: orgItem.orgLoginName
                        };

                        if (displayedOrgCount === processedOrganizationList.length - 1 || displayedOrgCount === maxVisibleRepos - 1) {
                            orgContext.isLastEntry = 'last';
                        }

                        const renderedOrgHtml = Mustache.to_html(orgTemplate, orgContext);
                        organizationsDisplayArea.append($(renderedOrgHtml));
                        displayedOrgCount++;
                    }
                } else {
                    $('#organizations').hide();
                }
            },
            error: (xhr, status, error) => {
                console.error(`Error loading org.html template: ${status}, ${error}`);
                $('#organizations').html('<p class="error-message">Failed to load organization display template.</p>');
            }
        });
    });
};

if (trackingIdentifier) {
    let analyticsQueue = analyticsQueue || [];
    analyticsQueue.push(['_setAccount', trackingIdentifier]);
    analyticsQueue.push(['_trackPageview']);

    (function loadAnalyticsScript() {
        const gaScriptElement = document.createElement('script');
        gaScriptElement.type = 'text/javascript';
        gaScriptElement.async = true;
        gaScriptElement.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        const firstScriptInDocument = document.getElementsByTagName('script')[0];
        firstScriptInDocument.parentNode.insertBefore(gaScriptElement, firstScriptInDocument);
    })();
}

const handleApplicationErrors = function (event) {
    console.error('An unhandled JavaScript error occurred:', event);
    retrieveAndDisplayContent('error');
};

$(window).bind('error', handleApplicationErrors);