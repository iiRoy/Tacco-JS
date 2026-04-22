/*
 *  This utility enables management of organization groups and their associated resources.
 *  To integrate, include require('../logic/group_management.js')(cliExecutor) in your
 *  commander.js setup before calling cliExecutor.parse().
 */
'use strict';

let httpAgent = require("superagent");
let fileSystem = require('fs');
let pathModule = require('path');
let interactionPrompt = require("inquirer");
let FuzzyMatcher = require("sifter");


module.exports = function(cliExecutor) {

  // This function attempts to find a close match for a given string within a collection.
  const suggestAlternative = function(inputStr, itemSet, completionHandler) {
    let itemMatcher = new FuzzyMatcher(itemSet);
    let searchResult = itemMatcher.search(inputStr, {
      fields: ['name'],
      limit: 1
    });
    let foundItem = itemSet[searchResult.items[0].id];
    if (foundItem.name !== inputStr) {
      let queryPrompts = [{
        type: "confirm",
        name: "confirmSuggestion",
        message: "Did you intend to refer to " + foundItem.name + " ?",
        default: false
      }];
      interactionPrompt.prompt(queryPrompts, function(responseObj) {
        if (responseObj.confirmSuggestion === true) {
          if (completionHandler !== undefined && completionHandler !== null) {
            completionHandler.apply(this, [foundItem]);
          }
        } else {
          console.log("No exact match found and suggestion declined.");
        }
      });
    } else {
      if (completionHandler !== undefined && completionHandler !== null) {
        completionHandler.apply(this, [foundItem]);
      }
    }
  };

  // Retrieves the identifier for a group based on its name and organization.
  let retrieveGroupId = function getGroupId(groupLabel, organizationLabel, onCompletion) {
    httpAgent
      .get("https://api.github.com/orgs/" + organizationLabel + "/teams")
      .query({access_token: cliExecutor.config.github.token})
      .query({per_page: 100})
      .set('Content-Type', 'application/json')
      .end(function(responsePayload) {
        if(responsePayload.ok) {
          console.log("...retrieved first 100 groups");
          // NOTE: This implementation currently handles only the initial page of results (up to 100 entries).
          // Future enhancements should include full pagination support.
          suggestAlternative(groupLabel, responsePayload.body, function(foundItem){onCompletion.apply(this, [foundItem.id])})
        } else {
          console.log(responsePayload.body);
        }
      });
  }

  // Adds a specified user as a member to a given group.
  const assignGroupMember = function addGroupMember(groupIdentifier, memberIdentifier, doneHandler, extraArguments){
    httpAgent
      .put("https://api.github.com/teams/" + groupIdentifier + "/members/" + memberIdentifier)
      .query({access_token: cliExecutor.config.github.token})
      .set('Content-Type', 'application/json')
      .end(function(responsePayload) {
        if(responsePayload.ok) {
          console.log("user: " + memberIdentifier + " has been successfully added to group: " + groupIdentifier);
          if(doneHandler !== undefined && doneHandler !== null) {
            doneHandler.apply(this, extraArguments);
          }
        } else {
          console.log(responsePayload.body);
        }
      });
  }

  // Associates a repository with a specific group.
  let linkGroupRepository = function attachGroupRepository(groupIdentifier, organizationLabel, repositoryLabel, doneHandler, extraArguments){
    httpAgent
      .put("https://api.github.com/teams/" + groupIdentifier + "/repos/" + organizationLabel + "/" + repositoryLabel)
      .query({access_token: cliExecutor.config.github.token})
      .set('Content-Type', 'application/json')
      .end(function(responsePayload) {
        if(responsePayload.ok) {
          console.log("Group " + groupIdentifier + " granted access to repository.");
          if(doneHandler !== undefined && doneHandler !== null) {
            doneHandler.apply(this, extraArguments);
          }
        } else {
          console.log(responsePayload.body);
        }
      });
  }

  // Sample Usage: cliTool gma -p "enterprise" -g "Dev Team" -m "developerUser"
  cliExecutor
    .command('gma')
    .description('Group Member Add: Assigns a GitHub user to an existing organization group.')
    .option('-p, --parent <parentName>', 'GitHub Organization Identifier')
    .option('-g, --group <groupName>', 'GitHub Group Identifier')
    .option('-m, --member <memberName>', 'GitHub User Account Name')
    .action(function(opts){
      retrieveGroupId(opts.group, opts.parent, function(groupIdentifier){
        assignGroupMember(groupIdentifier, opts.member)
      });
    });

  // Sample Usage: cliTool gra -p "enterprise" -g "Dev Team" -r "project-repo"
  cliExecutor
    .command('gra')
    .description('Group Repository Add: Links a GitHub repository to an existing organization group.')
    .option('-p, --parent <parentName>', 'GitHub Organization Identifier')
    .option('-g, --group <groupName>', 'GitHub Group Identifier')
    .option('-r, --repository <repoName>', 'GitHub Repository Name')
    .action(function(opts){
      retrieveGroupId(opts.group, opts.parent, function(groupIdentifier){
        linkGroupRepository(groupIdentifier, opts.parent, opts.repository)
      });
    });

};