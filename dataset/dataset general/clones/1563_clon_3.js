/*
 * This module facilitates interaction with GitHub teams via the command line.
 * It should be initialized by passing a Commander.js program instance to it.
 * Usage: require('./path/to/this/file.js')(yourCommanderProgram);
 */
'use strict';

// Core utilities for network requests, file operations, and user interaction
const httpClient = require("superagent"); // For making HTTP requests to GitHub API
const fileSystem = require('fs');         // Not directly used in primary logic but good to have
const pathUtils = require('path');        // Path manipulation utilities, also not directly used
const userPrompt = require("inquirer");   // For interactive command-line prompts
const fuzzySearchEngine = require("sifter"); // For fuzzy searching in collections

/**
 * Exports a function to initialize the CLI commands.
 * @param {object} cliApp - The Commander.js program instance.
 */
module.exports = function(cliApp) {

  // --- Internal Helper Functions ---

  /**
   * Provides a "did you mean" functionality for user input against a collection.
   * @param {string} inputQuery - The string provided by the user.
   * @param {Array<object>} dataCollection - The array of objects to search within (each should have a 'name' property).
   * @param {function} resolveAction - Callback function to execute if a match is found or confirmed.
   */
  const suggestCorrection = (inputQuery, dataCollection, resolveAction) => {
    if (!inputQuery || !dataCollection || dataCollection.length === 0) {
      console.error("Error: Invalid input for suggestion engine.");
      return;
    }

    const searchProcessor = new fuzzySearchEngine(dataCollection);
    const searchResult = searchProcessor.search(inputQuery, {
      fields: ['name'], // Only search against the 'name' field
      limit: 1          // Only interested in the top match
    });

    const topMatchItem = searchResult.items[0];

    // No close match found or the match is not sufficiently confident
    if (!topMatchItem || topMatchItem.score < 0.3) { // Introducing a score threshold
        console.log(`No strong match found for "${inputQuery}".`);
        return;
    }

    const bestCandidate = dataCollection[topMatchItem.id];

    // If the exact input was found, proceed directly
    if (bestCandidate.name === inputQuery) {
      if (typeof resolveAction === 'function') {
        resolveAction(bestCandidate);
      }
    } else {
      // Suggest the closest match to the user
      const confirmationPrompts = [{
        type: "confirm",
        name: "userAcceptedSuggestion",
        message: `Did you intend to refer to "${bestCandidate.name}"?`,
        default: true // Default to 'yes' for convenience
      }];

      userPrompt.prompt(confirmationPrompts).then(userResponse => {
        if (userResponse.userAcceptedSuggestion === true) {
          if (typeof resolveAction === 'function') {
            resolveAction(bestCandidate);
          }
        } else {
          console.log(`No action taken. "${inputQuery}" was not found.`);
        }
      }).catch(err => {
          console.error("Error during prompt interaction:", err.message);
      });
    }
  };

  /**
   * Fetches the unique identifier for a GitHub team within a specified organization.
   * @param {string} desiredTeamName - The name of the team to find.
   * @param {string} organizationHandle - The GitHub organization's handle.
   * @param {function} successCallback - Callback to execute with the team ID if found.
   */
  const retrieveTeamIdentifier = (desiredTeamName, organizationHandle, successCallback) => {
    const githubAccessToken = cliApp.config.github.token;
    if (!githubAccessToken) {
      console.error("GitHub access token is missing in configuration.");
      return;
    }
    if (!organizationHandle || !desiredTeamName) {
      console.error("Organization handle and team name are required to retrieve team ID.");
      return;
    }

    const apiEndpoint = `https://api.github.com/orgs/${organizationHandle}/teams`;
    console.log(`Fetching teams for organization: ${organizationHandle}...`);

    httpClient
      .get(apiEndpoint)
      .query({
        access_token: githubAccessToken,
        per_page: 100 // Note: This only retrieves the first 100 results. Pagination not fully implemented.
      })
      .set('Accept', 'application/vnd.github.v3+json') // Use specific GitHub API version header
      .end((error, apiResponse) => {
        if (error || !apiResponse.ok) {
          console.error(`Failed to fetch teams: ${error ? error.message : apiResponse.body ? JSON.stringify(apiResponse.body) : 'Unknown error.'}`);
          return;
        }
        console.log(`Successfully retrieved ${apiResponse.body.length} teams.`);

        suggestCorrection(desiredTeamName, apiResponse.body, matchedTeam => {
          if (matchedTeam && typeof successCallback === 'function') {
            successCallback(matchedTeam.id); // Pass only the team ID to the callback
          } else {
            console.log(`Could not resolve team ID for "${desiredTeamName}".`);
          }
        });
      });
  };

  /**
   * Adds a specified GitHub user to a team.
   * @param {number} targetTeamId - The numeric ID of the team.
   * @param {string} gitHubUsername - The username of the user to add.
   * @param {function} completionHandler - Optional callback to run after the operation.
   * @param {Array<any>} handlerArgs - Arguments for the completionHandler.
   */
  const assignUserToTeam = (targetTeamId, gitHubUsername, completionHandler, handlerArgs = []) => {
    if (!targetTeamId || !gitHubUsername) {
      console.error("Team ID and username are essential for assigning a user.");
      return;
    }
    const authToken = cliApp.config.github.token;
    if (!authToken) {
      console.error("Authentication token is required for this operation.");
      return;
    }

    const requestUrl = `https://api.github.com/teams/${targetTeamId}/memberships/${gitHubUsername}`; // Changed endpoint to memberships
    console.log(`Attempting to add user "${gitHubUsername}" to team ID "${targetTeamId}"...`);

    httpClient
      .put(requestUrl)
      .query({ access_token: authToken })
      .set('Accept', 'application/vnd.github.v3+json')
      .send({ role: 'member' }) // Explicitly set role, default is 'member' but good practice
      .end((error, apiResponse) => {
        if (error || !apiResponse.ok) {
          console.error(`Failed to add user "${gitHubUsername}" to team ID "${targetTeamId}".`);
          console.error(`Error details: ${error ? error.message : JSON.stringify(apiResponse.body)}`);
          return;
        }
        console.log(`User "${gitHubUsername}" successfully added/invited to team ID "${targetTeamId}".`);
        if (typeof completionHandler === 'function') {
          completionHandler(...handlerArgs); // Spread operator for arguments
        }
      });
  };

  /**
   * Links a GitHub repository to a team, granting access.
   * @param {number} targetTeamId - The numeric ID of the team.
   * @param {string} organizationHandle - The GitHub organization's handle.
   * @param {string} repositoryName - The name of the repository to link.
   * @param {function} completionHandler - Optional callback to run after the operation.
   * @param {Array<any>} handlerArgs - Arguments for the completionHandler.
   */
  const linkRepositoryToTeam = (targetTeamId, organizationHandle, repositoryName, completionHandler, handlerArgs = []) => {
    if (!targetTeamId || !organizationHandle || !repositoryName) {
      console.error("Team ID, organization handle, and repository name are all required.");
      return;
    }
    const authToken = cliApp.config.github.token;
    if (!authToken) {
      console.error("Authentication token is required for this operation.");
      return;
    }

    const requestUrl = `https://api.github.com/teams/${targetTeamId}/repos/${organizationHandle}/${repositoryName}`;
    console.log(`Attempting to grant team ID "${targetTeamId}" access to repository "${organizationHandle}/${repositoryName}"...`);

    httpClient
      .put(requestUrl)
      .query({ access_token: authToken })
      .set('Accept', 'application/vnd.github.v3+json')
      .send({ permission: 'push' }) // Default permission, can be 'pull', 'push', 'admin'
      .end((error, apiResponse) => {
        if (error || !apiResponse.ok) {
          console.error(`Failed to link repository "${repositoryName}" to team ID "${targetTeamId}".`);
          console.error(`Error details: ${error ? error.message : JSON.stringify(apiResponse.body)}`);
          return;
        }
        console.log(`Team ID "${targetTeamId}" now has access to repository "${repositoryName}".`);
        if (typeof completionHandler === 'function') {
          completionHandler(...handlerArgs);
        }
      });
  };

  // --- Command Line Interface Definitions ---

  // Command to add a GitHub user to an existing team
  cliApp
    .command('assign-user') // Renamed command
    .description('Assign a GitHub user to an existing organization team.')
    .option('-o, --org-handle <value>', 'Specify the GitHub Organization handle (e.g., "my-company").', cliApp.config.github.organization) // Added default from config
    .option('-t, --team-label <value>', 'Define the target GitHub Team name (e.g., "Developers").')
    .option('-u, --user-account <value>', 'Provide the GitHub UserName to be added (e.g., "octocat").')
    .action(async (cmdOptions) => { // Using async/await pattern for actions for modern JS feel
      // Basic validation for essential options
      if (!cmdOptions.orgHandle) {
        console.error("Error: Organization handle is required. Use -o or --org-handle.");
        cliApp.help(); // Show help message
        return;
      }
      if (!cmdOptions.teamLabel) {
        console.error("Error: Team name is required. Use -t or --team-label.");
        cliApp.help();
        return;
      }
      if (!cmdOptions.userAccount) {
        console.error("Error: User account is required. Use -u or --user-account.");
        cliApp.help();
        return;
      }

      try {
        // Wrap the callback style in a Promise for async/await
        const teamId = await new Promise((resolve, reject) => {
          retrieveTeamIdentifier(cmdOptions.teamLabel, cmdOptions.orgHandle, (resolvedId) => {
            if (resolvedId) {
              resolve(resolvedId);
            } else {
              reject(new Error(`Failed to determine ID for team "${cmdOptions.teamLabel}".`));
            }
          });
        });

        await new Promise((resolve, reject) => {
          assignUserToTeam(teamId, cmdOptions.userAccount, () => {
            console.log(`Operation complete: User "${cmdOptions.userAccount}" processed for team ID ${teamId}.`);
            resolve();
          }, [teamId, cmdOptions.userAccount]); // Pass args to completionHandler if needed
        });

      } catch (err) {
        console.error(`An error occurred during user assignment: ${err.message}`);
        process.exit(1); // Exit with error code
      }
    });

  // Command to link a GitHub repository to an existing team
  cliApp
    .command('assign-repo') // Renamed command
    .description('Grant a GitHub team access to a repository.')
    .option('-o, --org-handle <value>', 'Specify the GitHub Organization handle.', cliApp.config.github.organization) // Added default from config
    .option('-t, --team-label <value>', 'Define the target GitHub Team name.')
    .option('-r, --repo-name <value>', 'Provide the GitHub Repository name.')
    .action(async (cmdOptions) => { // Using async/await pattern
      // Basic validation
      if (!cmdOptions.orgHandle || !cmdOptions.teamLabel || !cmdOptions.repoName) {
        console.error("Error: All options (-o, -t, -r) are required.");
        cliApp.help();
        return;
      }

      try {
        const teamId = await new Promise((resolve, reject) => {
          retrieveTeamIdentifier(cmdOptions.teamLabel, cmdOptions.orgHandle, (resolvedId) => {
            if (resolvedId) {
              resolve(resolvedId);
            } else {
              reject(new Error(`Could not find ID for team "${cmdOptions.teamLabel}".`));
            }
          });
        });

        await new Promise((resolve, reject) => {
          linkRepositoryToTeam(teamId, cmdOptions.orgHandle, cmdOptions.repoName, () => {
            console.log(`Operation complete: Repository "${cmdOptions.repoName}" linked to team ID ${teamId}.`);
            resolve();
          }, [teamId, cmdOptions.orgHandle, cmdOptions.repoName]);
        });

      } catch (err) {
        console.error(`An error occurred during repository linking: ${err.message}`);
        process.exit(1);
      }
    });

};