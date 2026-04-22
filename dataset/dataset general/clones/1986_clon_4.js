let paramStore = {};
let githubHandle;
const analyticIdentifier = 'UA-21222559-1';

// Custom lightweight templating function (mimics basic Mustache `{{key}}` replacement)
function customTemplateRender(templateString, dataObject) {
    let rendered = templateString;
    for (const key in dataObject) {
        if (Object.prototype.hasOwnProperty.call(dataObject, key)) {
            const placeholder = new RegExp(`\\{\\{\\s*${key}\\s*\\}\\}`, 'g');
            rendered = rendered.replace(placeholder, dataObject[key]);
        }
    }
    return rendered;
}

// Mimics the original's URL parameter parsing (gets the first key)
(function () {
    const queryFragment = window.location.search.substring(1);
    if (queryFragment) {
        const firstSegment = queryFragment.split('&')[0];
        const parts = firstSegment.split('=');
        if (parts.length > 0) {
            const decodedKey = decodeURIComponent(parts[0].replace(/\+/g, " "));
            paramStore[0] = decodedKey;
        }
    }
})();

async function displayErrorPage() {
    try {
        const response = await fetch('views/error.html');
        const markup = await response.text();
        document.getElementById('resume').innerHTML = markup;
    } catch (err) {
        if (window.console && typeof window.console.error === 'function') {
            console.error('Failed to load error page:', err);
        }
    }
}

async function displayHomeContent() {
    try {
        const response = await fetch('views/index.html');
        const markup = await response.text();
        document.getElementById('resume').innerHTML = markup;
    } catch (err) {
        if (window.console && typeof window.console.error === 'function') {
            console.error('Failed to load home content:', err);
        }
    }
}

async function requestGithubUser(handle) {
    const response = await fetch(`https://api.github.com/users/${handle}`);
    const data = await response.json();
    return { data: data }; // Mimic jQuery's JSONP wrapper structure { data: actual_data }
}

async function requestUserRepositories(handle, pageNum = 1, currentData = []) {
    const url = `https://api.github.com/users/${handle}/repos?page=${pageNum}`;
    const response = await fetch(url);
    const data = await response.json();

    const combinedData = currentData.concat(data);

    if (data.length > 0) {
        return requestUserRepositories(handle, pageNum + 1, combinedData);
    } else {
        return combinedData;
    }
}

async function requestUserOrganizations(handle) {
    const response = await fetch(`https://api.github.com/users/${handle}/orgs`);
    const data = await response.json();
    return { data: data }; // Mimic jQuery's JSONP wrapper structure { data: actual_data }
}

// Iterative approach to replace recursive synchronous AJAX call
async function checkUserStarredResume(handle) {
    let hasStarred = false;
    let currentPage = 1;

    while (!hasStarred) {
        const url = `https://api.github.com/users/${handle}/starred?page=${currentPage}`;
        const response = await fetch(url);
        const data = await response.json();

        if (data.length === 0) {
            break; // No more repos, stop
        }

        for (const repo of data) {
            if (repo.full_name === "resume/resume.github.com") {
                hasStarred = true;
                break;
            }
        }
        currentPage++;
    }
    return hasStarred;
}

// Function to determine user status based on metrics
function determineUserStanding(userMetrics, adopterFlag) {
    const scoreFactors = new Map([
        ['repos', 2], ['gists', 0.25], ['followers', 0.5], ['following', 0.25]
    ]);
    const extraPointValue = 1;

    let scoreValue =
        userMetrics.public_repos * scoreFactors.get('repos') +
        userMetrics.public_gists * scoreFactors.get('gists') +
        userMetrics.followers * scoreFactors.get('followers') +
        userMetrics.following * scoreFactors.get('following');

    if (adopterFlag === 1) {
        scoreValue += extraPointValue;
    }
    if (userMetrics.location && userMetrics.location.trim() !== '' &&
        userMetrics.email && userMetrics.email.trim() !== '' &&
        userMetrics.blog && userMetrics.blog.trim() !== '') {
        scoreValue += extraPointValue;
    }

    const statusThresholds = [
        { upper: 0, label: 'Inactive GitHub user' },
        { upper: 5, label: 'Newbie GitHub user' },
        { upper: 20, label: 'Regular GitHub user' },
        { upper: 50, label: 'Advanced GitHub user' },
        { upper: 150, label: 'Enthusiastic GitHub user' }
    ];

    for (const threshold of statusThresholds) {
        if (scoreValue <= threshold.upper) {
            return threshold.label;
        }
    }
    return 'Passionate GitHub user'; // If scoreValue > 150
}

async function displayOptOutContent() {
    try {
        const response = await fetch('views/opt_out.html');
        const markup = await response.text();
        document.getElementById('resume').innerHTML = markup;
    } catch (err) {
        if (window.console && typeof window.console.error === 'function') {
            console.error('Failed to load opt-out page:', err);
        }
    }
}

// Sorting function for popularity
function rankByPopularity(itemA, itemB) {
    return itemB.popularity - itemA.popularity;
}

// Function to process and sort languages
function organizeLanguages(languageCounts, limitCount) {
    const languageList = [];
    let totalLanguageScore = 0;

    for (const langKey in languageCounts) {
        if (Object.prototype.hasOwnProperty.call(languageCounts, langKey)) {
            languageList.push({
                name: langKey,
                popularity: languageCounts[langKey],
                display: function() {
                    return `<a href="https://github.com/languages/${this.name}">${this.name}</a>`;
                }
            });
            totalLanguageScore += languageCounts[langKey];
        }
    }

    languageList.sort(rankByPopularity);

    const limitedList = limitCount ? languageList.slice(0, limitCount) : languageList;

    return {
        sorted: limitedList,
        total: totalLanguageScore
    };
}

// Main operation logic (replaces 'run')
async function commenceOperation() {
    const maxDisplayItems = 5;
    const maxDisplayLanguages = 9;
    let currentItemCounter = 0;

    if (!await checkUserStarredResume(githubHandle)) {
        await displayOptOutContent();
        return;
    }

    // Initiate all fetches concurrently
    const userFetchPromise = requestGithubUser(githubHandle);
    const reposFetchPromise = requestUserRepositories(githubHandle);
    const orgsFetchPromise = requestUserOrganizations(githubHandle);

    // Process user data and render resume template
    const userDataResponse = await userFetchPromise;
    const userData = userDataResponse.data;

    const creationDate = new Date(userData.created_at);
    const creationYear = creationDate.getFullYear();
    const creationMonth = creationDate.getMonth();
    const currentYear = (new Date()).getFullYear();

    let yearDisplay = creationYear.toString();
    switch (creationYear) {
        case currentYear - 1:
            yearDisplay = 'last year';
            break;
        case currentYear:
            yearDisplay = 'this year';
            break;
    }

    let blogPrefix = '';
    if (userData.blog && userData.blog.indexOf('http') < 0) {
        blogPrefix = 'http://';
    }

    let displayName = githubHandle;
    if (userData.name !== null && userData.name !== undefined && userData.name.length) {
        displayName = userData.name;
    }

    let profileAvatar = '';
    if (userData.type === 'Organization') {
        const avatarMatch = userData.avatar_url.match(/https:\/\/secure.gravatar.com\/avatar\/[0-9a-z]+/);
        if (avatarMatch) {
            profileAvatar = avatarMatch[0];
            profileAvatar += '?s=140&amp;d=https://github.com/images/gravatars/gravatar-140.png';
        }
    }

    const templateData = {
        name: displayName,
        type: userData.type,
        email: userData.email,
        created_at: userData.created_at,
        earlyAdopter: 0,
        location: userData.location,
        gravatar_id: userData.gravatar_id,
        avatar_url: profileAvatar,
        repos: userData.public_repos,
        reposLabel: userData.public_repos > 1 ? 'repositories' : 'repository',
        followers: userData.followers,
        followersLabel: userData.followers > 1 ? 'followers' : 'follower',
        username: githubHandle,
        userStatus: 'GitHub user',
        since: yearDisplay,
        resume_url: window.location
    };

    // Check for early adopter status
    if ((creationYear === 2008 && creationMonth <= 5) || creationYear <= 2007) {
        templateData.earlyAdopter = 1;
    }

    templateData.userStatus = determineUserStanding(userData, templateData.earlyAdopter);

    if (userData.blog !== undefined && userData.blog !== null && userData.blog !== '') {
        templateData.website = blogPrefix + userData.blog;
    }

    const resumeTemplatePath = (userData.type === 'User' ? 'views/resume.html' : 'views/resumeOrgs.html');
    const resumeResponse = await fetch(resumeTemplatePath);
    const resumeMarkup = await resumeResponse.text();
    const renderedResume = customTemplateRender(resumeMarkup, templateData);
    document.getElementById('resume').innerHTML = renderedResume;
    document.title = displayName + "'s Résumé";
    document.getElementById('actions').querySelector('#print').addEventListener('click', function(event) {
        event.preventDefault();
        window.print();
    });

    // Process repository data and render job/language sections
    const repoData = await reposFetchPromise;
    let repoSortingList = [];
    let languageTally = {};

    for (const repo of repoData) {
        if (repo.fork !== false) {
            continue;
        }

        if (repo.language) {
            languageTally[repo.language] = (languageTally[repo.language] || 0) + 1;
        }

        const repoPopularity = repo.watchers + repo.forks;
        repoSortingList.push({ popularity: repoPopularity, details: repo });
    }

    repoSortingList.sort(rankByPopularity);

    const jobTemplateResponse = await fetch('views/job.html');
    const jobTemplateMarkup = await jobTemplateResponse.text();

    const organizedLanguages = organizeLanguages(languageTally, maxDisplayLanguages);
    if (organizedLanguages.sorted.length > 0) {
        let ulElement = document.createElement('ul');
        ulElement.className = 'talent';
        const contentLanguages = document.getElementById('content-languages');
        contentLanguages.innerHTML = ''; // Clear existing content

        organizedLanguages.sorted.forEach((lang, i) => {
            const percentage = parseInt((lang.popularity / organizedLanguages.total) * 100);
            const liElement = document.createElement('li');
            liElement.innerHTML = `${lang.display()} (${percentage}%)`;

            if ((i + 1) % 3 === 0 || (organizedLanguages.sorted.length < 3 && i === organizedLanguages.sorted.length - 1)) {
                liElement.classList.add('last');
                ulElement.appendChild(liElement);
                contentLanguages.appendChild(ulElement);
                ulElement = document.createElement('ul'); // Start a new ul
                ulElement.className = 'talent';
            } else {
                ulElement.appendChild(liElement);
                contentLanguages.appendChild(ulElement); // Append ul on each iteration, but it's the same ul reference
            }
        });
        // Handle case where last ul might not be appended if it's not a multiple of 3
        if (ulElement.children.length > 0) {
            contentLanguages.appendChild(ulElement);
        }
    } else {
        document.getElementById('mylanguages').style.display = 'none';
    }

    const jobsContainer = document.getElementById('jobs');
    jobsContainer.innerHTML = ''; // Clear existing content
    currentItemCounter = 0;

    if (repoSortingList.length > 0) {
        for (const repoItem of repoSortingList) {
            if (currentItemCounter >= maxDisplayItems) {
                break;
            }

            const repoDetails = repoItem.details;
            const createdYear = new Date(repoDetails.created_at).getFullYear();
            const pushedYear = new Date(repoDetails.pushed_at).getFullYear();
            const dateRange = createdYear === pushedYear ? createdYear : `${createdYear} - ${pushedYear}`;

            const repoViewData = {
                name: repoDetails.name,
                date: dateRange,
                language: repoDetails.language,
                description: repoDetails.description,
                username: githubHandle,
                watchers: repoDetails.watchers,
                forks: repoDetails.forks,
                watchersLabel: repoDetails.watchers === 0 || repoDetails.watchers > 1 ? 'watchers' : 'watcher',
                forksLabel: repoDetails.forks === 0 || repoDetails.forks > 1 ? 'forks' : 'fork',
            };

            if (currentItemCounter === repoSortingList.length - 1 || currentItemCounter === maxDisplayItems - 1) {
                repoViewData.last = 'last';
            }

            const renderedJob = customTemplateRender(jobTemplateMarkup, repoViewData);
            jobsContainer.insertAdjacentHTML('beforeend', renderedJob);
            currentItemCounter++;
        }
    } else {
        if (repoData.length > 0) {
            jobsContainer.innerHTML = '<p class="enlarge">All of this user\'s repositories seem to be forks. Sorry.</p>';
        } else {
            jobsContainer.innerHTML = '<p class="enlarge">Unfortunately, this user does not seem to have any <strong>public</strong> repositories.</p>';
        }
    }

    // Process organization data and render org section
    const orgDataResponse = await orgsFetchPromise;
    const orgData = orgDataResponse.data;
    let sortedOrgs = [];

    for (const org of orgData) {
        if (org.login === undefined) {
            continue;
        }
        sortedOrgs.push({ details: org });
    }

    const orgTemplateResponse = await fetch('views/org.html');
    const orgTemplateMarkup = await orgTemplateResponse.text();
    const currentYearNum = new Date().getFullYear();

    if (sortedOrgs.length > 0) {
        const orgsContainer = document.getElementById('orgs');
        orgsContainer.innerHTML = ''; // Clear existing content
        currentItemCounter = 0; // Reset counter for organizations

        for (const orgItem of sortedOrgs) {
            if (currentItemCounter >= maxDisplayItems) {
                break;
            }
            const orgName = (orgItem.details.name || orgItem.details.login);
            const orgViewData = {
                name: orgName,
                now: currentYearNum
            };

            if (currentItemCounter === sortedOrgs.length - 1 || currentItemCounter === maxDisplayItems - 1) {
                orgViewData.last = 'last';
            }
            const renderedOrg = customTemplateRender(orgTemplateMarkup, orgViewData);
            orgsContainer.insertAdjacentHTML('beforeend', renderedOrg);
            currentItemCounter++;
        }
    } else {
        const organizationsSection = document.getElementById('organizations');
        if (organizationsSection) {
            organizationsSection.remove();
        }
    }
}

// Entry point for DOMContentLoaded
document.addEventListener('DOMContentLoaded', async function () {
    try {
        if (paramStore[0] !== undefined) {
            githubHandle = paramStore[0];
            await commenceOperation();
        } else {
            await displayHomeContent();
        }
    } catch (operationError) {
        try {
            if (window.console && typeof window.console.log === 'function') {
                console.log(operationError);
            }
        } catch (loggingError) {
            /* fail silently as per original */
        }
    }
});

// Google Analytics Integration
if (analyticIdentifier) {
    window._trackingQueue = window._trackingQueue || [];
    window._trackingQueue.push(['_setAccount', analyticIdentifier]);
    window._trackingQueue.push(['_trackPageview']);

    (function () {
        const gaScript = document.createElement('script');
        gaScript.type = 'text/javascript';
        gaScript.async = true;
        gaScript.src = ('https:' === document.location.protocol ? 'https://ssl' : 'http://www') + '.google-analytics.com/ga.js';
        const firstScript = document.getElementsByTagName('script')[0];
        if (firstScript && firstScript.parentNode) {
            firstScript.parentNode.insertBefore(gaScript, firstScript);
        } else {
             document.head.appendChild(gaScript); // Fallback if no script tag found
        }
    })();
}

// Global error handler
window.addEventListener('error', displayErrorPage);