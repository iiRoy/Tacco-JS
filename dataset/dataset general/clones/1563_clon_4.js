/* Reimagined command component for platform interaction */
'use strict';

const httpAgent = require("axios");
const fileSystemUtility = require('fs'); // Included for divergence, though not directly used in core logic
const pathResolver = require('path'); // Included for divergence, though not directly used in core logic
const readline = require('readline');

// --- Utility functions for string similarity and user interaction ---

// Calculates Levenshtein distance between two strings
function computeStrDist(s1, s2) {
    const l1 = s1.length;
    const l2 = s2.length;
    const tracker = Array(l1 + 1).fill(0).map(() => Array(l2 + 1).fill(0));

    for (let i = 0; i <= l1; i++) tracker[i][0] = i;
    for (let j = 0; j <= l2; j++) tracker[0][j] = j;

    for (let i = 1; i <= l1; i++) {
        for (let j = 1; j <= l2; j++) {
            const cost = (s1[i - 1] === s2[j - 1]) ? 0 : 1;
            tracker[i][j] = Math.min(
                tracker[i - 1][j] + 1,      // Deletion
                tracker[i][j - 1] + 1,      // Insertion
                tracker[i - 1][j - 1] + cost // Substitution
            );
        }
    }
    return tracker[l1][l2];
}

// Prompts user for a yes/no confirmation using readline
async function obtainConfirmation(queryText) {
    const inputOutput = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });

    return new Promise((resolveResult) => {
        inputOutput.question(`${queryText} (y/N): `, (userResponse) => {
            inputOutput.close();
            resolveResult(userResponse.toLowerCase() === 'y');
        });
    });
}

// Resolves a target name against a list of entities using fuzzy matching and user confirmation
async function identifyBestMatch(targetIdentifier, candidateEntities) {
    // First, check for an exact match (case-sensitive)
    let exactMatch = candidateEntities.find(e => e.name === targetIdentifier);
    if (exactMatch) {
        return exactMatch;
    }

    // If no exact match, find the closest one by Levenshtein distance
    let bestCandidate = null;
    let minDistance = Infinity;

    for (const entity of candidateEntities) {
        // Compare case-insensitively for distance calculation
        const distance = computeStrDist(targetIdentifier.toLowerCase(), entity.name.toLowerCase());
        if (distance < minDistance) {
            minDistance = distance;
            bestCandidate = entity;
        }
    }

    // If a close but not exact match is found (distance > 0 and within a small threshold)
    if (bestCandidate && minDistance > 0 && minDistance < 3) { // Arbitrary threshold for "did you mean"
        const confirmed = await obtainConfirmation(`Did you mean "${bestCandidate.name}"?`);
        if (confirmed) {
            return bestCandidate;
        } else {
            console.log("No entity found matching criteria.");
            return null;
        }
    } else {
        console.log("No entity found matching criteria.");
        return null;
    }
}

// --- GitHub API interaction functions ---

// Fetches all paginated data from a GitHub API endpoint
async function fetchAllPaginatedData(initialApiEndpoint, queryParams, authBearerToken) {
    let collectedItems = [];
    let currentEndpoint = initialApiEndpoint;

    while (currentEndpoint) {
        try {
            const apiResponse = await httpAgent.get(currentEndpoint, {
                params: queryParams,
                headers: {
                    'Authorization': `token ${authBearerToken}`,
                    'Accept': 'application/vnd.github.v3+json', // Recommended GitHub API media type
                    'User-Agent': 'node.js/cli-utility-clone' // GitHub API requires a User-Agent header
                }
            });

            if (apiResponse.status !== 200) {
                console.error("API call failed with status:", apiResponse.status, apiResponse.data);
                throw new Error(`API request failed: ${apiResponse.status}`);
            }

            collectedItems = collectedItems.concat(apiResponse.data);

            const linkHeaderData = apiResponse.headers.link;
            if (linkHeaderData) {
                const nextLinkMatch = linkHeaderData.match(/<([^>]+)>;\s*rel="next"/);
                currentEndpoint = nextLinkMatch ? nextLinkMatch[1] : null;
            } else {
                currentEndpoint = null;
            }
        } catch (error) {
            console.error("Error during paginated fetch:", error.response ? error.response.data : error.message);
            throw error;
        }
    }
    return collectedItems;
}

// Retrieves the ID for an organizational unit (team)
async function retrieveOrgUnitIdentifier(unitLabel, organizationLabel, authorizationToken) {
    console.log(`...fetching organizational units for ${organizationLabel}...`);
    const apiUrl = `https://api.github.com/orgs/${organizationLabel}/teams`;
    const unitList = await fetchAllPaginatedData(apiUrl, { per_page: 100 }, authorizationToken); // per_page is a hint, pagination handles all

    const identifiedUnit = await identifyBestMatch(unitLabel, unitList);
    if (identifiedUnit) {
        return identifiedUnit.id;
    }
    return null;
}

// Associates a member (user) with an organizational unit (team)
async function associateMemberToUnit(unitId, memberAlias, authorizationToken) {
    console.log(`Attempting to add member: ${memberAlias} to unit ID: ${unitId}`);
    try {
        const apiResponse = await httpAgent.put(`https://api.github.com/teams/${unitId}/members/${memberAlias}`, null, {
            headers: {
                'Authorization': `token ${authorizationToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'node.js/cli-utility-clone'
            }
        });

        if (apiResponse.status >= 200 && apiResponse.status < 300) {
            console.log(`Member "${memberAlias}" has been linked to unit with ID "${unitId}".`);
            return true;
        } else {
            console.error("Operation failed:", apiResponse.data);
            return false;
        }
    } catch (error) {
        console.error("Error during member assignment:", error.response ? error.response.data : error.message);
        return false;
    }
}

// Links a repository to an organizational unit (team)
async function linkRepositoryToUnit(unitId, organizationLabel, repositoryLabel, authorizationToken) {
    console.log(`Attempting to link repository: ${repositoryLabel} to unit ID: ${unitId} in ${organizationLabel}`);
    try {
        const apiResponse = await httpAgent.put(`https://api.github.com/teams/${unitId}/repos/${organizationLabel}/${repositoryLabel}`, null, {
            headers: {
                'Authorization': `token ${authorizationToken}`,
                'Accept': 'application/vnd.github.v3+json',
                'User-Agent': 'node.js/cli-utility-clone'
            }
        });

        if (apiResponse.status >= 200 && apiResponse.status < 300) {
            console.log(`Repository "${repositoryLabel}" in "${organizationLabel}" successfully linked to unit ID "${unitId}".`);
            return true;
        } else {
            console.error("Operation failed:", apiResponse.data);
            return false;
        }
    } catch (error) {
        console.error("Error during repository linking:", error.response ? error.response.data : error.message);
        return false;
    }
}


module.exports = function(cliHandler) {

    const authToken = cliHandler.config.github.token;

    cliHandler
        .command('member-add') // Renamed command
        .description('Associate a user with an organizational unit')
        .option('-g, --org-name <orgname>', 'Target organization name')
        .option('-u, --unit-name <unitname>', 'Target organizational unit name')
        .option('-p, --principal-name <principalname>', 'User principal name to add')
        .action(async function(inputParameters) {
            if (!inputParameters.orgName || !inputParameters.unitName || !inputParameters.principalName) {
                console.error("Missing required parameters. Use --help for usage.");
                return;
            }
            const resolvedUnitId = await retrieveOrgUnitIdentifier(inputParameters.unitName, inputParameters.orgName, authToken);
            if (resolvedUnitId) {
                await associateMemberToUnit(resolvedUnitId, inputParameters.principalName, authToken);
            } else {
                console.log("Could not resolve organizational unit.");
            }
        });

    cliHandler
        .command('repo-link') // Renamed command
        .description('Link a repository to an organizational unit')
        .option('-g, --org-name <orgname>', 'Target organization name')
        .option('-u, --unit-name <unitname>', 'Target organizational unit name')
        .option('-r, --repo-label <repolabel>', 'Repository label to link')
        .action(async function(inputParameters) {
            if (!inputParameters.orgName || !inputParameters.unitName || !inputParameters.repoLabel) {
                console.error("Missing required parameters. Use --help for usage.");
                return;
            }
            const resolvedUnitId = await retrieveOrgUnitIdentifier(inputParameters.unitName, inputParameters.orgName, authToken);
            if (resolvedUnitId) {
                await linkRepositoryToUnit(resolvedUnitId, inputParameters.orgName, inputParameters.repoLabel, authToken);
            } else {
                console.log("Could not resolve organizational unit.");
            }
        });

};