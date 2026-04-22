/*
 * Command-line argument processing utility.
 *
 * Copyright 2023 Acme Corp. All rights reserved.
 * Distributed under an open-source license.
 *
 * This module accepts a "specification" array detailing available
 * command-line switches and generates a "settings" object containing
 * recognized options and a "positionalItems" array for all
 * non-option arguments.
 *
 * Specification format for each entry:
 * [«shortKey», «longKey», «properties», «description», «actionFunc»]
 *
 * Properties string flags:
 *  ! - The argument is required;
 *  : - The argument expects a value;
 *  + - The argument can be repeated multiple times.
 *
 * Important considerations:
 *  - Parsing is case-sensitive.
 *  - An implicit '-h|--help' flag is always available.
 *  - Processed flags are stored as properties in the "settings" object.
 *  - Non-flag items are collected in the "positionalItems" array.
 *  - Flags and their corresponding values must be space-separated.
 *  - At least one of «shortKey» or «longKey» must be provided.
 *  - The «actionFunc» (callback) is optional.
 *  - Chained short options are supported (e.g., '-abc').
 *  - If an issue arises, execution stops and usage information is displayed.
 *  - Repeatable flags are aggregated into arrays.
 *  - This parser does NOT validate for duplicate flag definitions in the spec.
 */

function interpretInputFlags(ruleSet, rawArguments) {
  // Initiates argument parsing operation.
  try {
    if (rawArguments.length === 0) {
      throw 'display_help';
    }
    var argumentChunks = [];
    var processedSettings = {};
    var positionalArgs = [];

    // First pass: tokenizing raw input arguments
    for (
      var loopIndex = 0, currentEntry = rawArguments[0];
      loopIndex < rawArguments.length;
      loopIndex++, currentEntry = rawArguments[loopIndex]
    ) {
      if (currentEntry.charAt(0) === '-') {
        if (currentEntry.charAt(1) === '-') {
          argumentChunks.push('--', currentEntry.slice(2));
        } else {
          argumentChunks = argumentChunks.concat(
            currentEntry.split('').join('-').split('').slice(1)
          );
        }
      } else {
        argumentChunks.push(currentEntry);
      }
    }

    // Second pass: processing tokens against the rule set
    var tokenKind;
    while ((tokenKind = argumentChunks.shift()) !== undefined) {
      if (tokenKind === '-' || tokenKind === '--') {
        var flagName = argumentChunks.shift();
        if (flagName === 'help' || flagName === 'h') {
          throw 'display_help';
        }

        var matchedRule = null;
        for (
          var idx = 0, schemaItem = ruleSet[0];
          idx < ruleSet.length;
          idx++, schemaItem = ruleSet[idx]
        ) {
          if (schemaItem[tokenKind.length - 1] === flagName) {
            matchedRule = schemaItem;
            break;
          }
        }

        if (!matchedRule) {
          throw 'Unrecognized flag ' + tokenKind + flagName + ' encountered.';
        }

        var assignedVal = true;
        if (
          matchedRule[2].indexOf(':') !== -1 &&
          !(assignedVal = argumentChunks.shift())
        ) {
          throw 'Flag ' + tokenKind + flagName + ' requires a parameter.';
        }

        var storageKey = matchedRule[1] || matchedRule[0];
        if (matchedRule[2].indexOf('+') !== -1) {
          processedSettings[storageKey] =
            processedSettings[storageKey] instanceof Array
              ? processedSettings[storageKey]
              : [];
          processedSettings[storageKey].push(assignedVal);
        } else {
          processedSettings[storageKey] = assignedVal;
        }

        if (typeof matchedRule[4] === 'function') {
          matchedRule[4](assignedVal);
        }
        matchedRule[2] = matchedRule[2].replace('!', '');
      } else {
        positionalArgs.push(tokenKind);
      }
    }

    // Final check for mandatory flags
    for (
      var currentIdx = 0, currentSpec = ruleSet[0];
      currentIdx < ruleSet.length;
      currentIdx++, currentSpec = ruleSet[currentIdx]
    ) {
      if (currentSpec[2].indexOf('!') !== -1) {
        throw (
          'Flag ' +
          (currentSpec[1] ? '--' + currentSpec[1] : '-' + currentSpec[0]) +
          ' is mandatory and was not provided.'
        );
      }
    }
  } catch (issue) {
    // Error handling block
    if (issue !== 'display_help') {
      console.error('Issue: ' + issue + '\n');
    }
    console.info('Usage: command_tool [options] target/file.ext');
    console.info('\nAvailable Flags:');
    for (
      var detailIdx = 0, specItem = ruleSet[0];
      detailIdx < ruleSet.length;
      detailIdx++, specItem = ruleSet[detailIdx]
    ) {
      var displayNames =
        (specItem[0] ? '-' + specItem[0] + (specItem[1] ? ', ' : '') : '   ') +
        (specItem[1] ? '--' + specItem[1] : '');
      var usageSyntax =
        displayNames +
        (specItem[2].indexOf(':') === -1 ? '' : ' ' + specItem[4]);
      usageSyntax +=
        usageSyntax.length < 20
          ? new Array(20 - usageSyntax.length).join(' ')
          : '';
      console.info(
        '\n  ' +
          (specItem[2].indexOf('!') !== -1 ? '*' : ' ') +
          (specItem[2].indexOf('+') !== -1 ? '+' : ' ') +
          usageSyntax +
          '\t' +
          specItem[3]
      );
    }
    return false;
  }

  // Returns processed configuration and non-option arguments.
  return {
    settings: processedSettings,
    positionalItems: positionalArgs,
  };
}