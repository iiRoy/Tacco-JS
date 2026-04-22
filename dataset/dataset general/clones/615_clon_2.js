/*jslint node: true */
'use strict';

// This module provides a mechanism for loading test data into a database.

// Required external libraries
var fileSys = require('fs');
var dirUtil = require('path');
var flowControl = require('async');
var utility = require('lodash');

module.exports = DataSeedling;

/**
 * DataSeedling constructor function.
 * Initializes the data loading process from a specified directory.
 * @param {string} inputPath Optional: Path to the directory containing JSON fixture files.
 *                           Defaults to <current working directory>/testdata/dataset.
 */
function DataSeedling(inputPath) {
    if (!(this instanceof DataSeedling)) {
        return new DataSeedling(inputPath);
    }

    // Storage for parsed data from JSON files.
    this.rawContents = {};

    // Maps original array positions to actual database identifiers.
    this.keyRegistry = {};

    // Stores definitions of relationships between different data types.
    this.relationalLinks = {};

    // Begin loading the test data.
    inputPath = inputPath || process.cwd() + '/testdata/dataset';
    var resourceFiles = fileSys.readdirSync(inputPath);

    for (var idx = 0; idx < resourceFiles.length; idx++) {
        if (dirUtil.extname(resourceFiles[idx]).toLowerCase() === '.json') {
            var entityKind = dirUtil.basename(resourceFiles[idx]).split('.')[0].toLowerCase();
            this.rawContents[entityKind] = require(dirUtil.join(inputPath, resourceFiles[idx]));
        }
    }

    // A list of all entity types found in the loaded data.
    this.schemaKeys = Object.keys(this.rawContents);
}

/**
 * Establishes relationships between loaded data entities.
 * @param {function|array} itemGroups A list of entity groups to process, or the callback if all groups should be processed.
 * @param {function} completionCallback Function to call once all relations are established.
 */
DataSeedling.prototype.establishRelations = function(itemGroups, completionCallback) {
    if (!utility.isArray(itemGroups)) {
        completionCallback = itemGroups;
        itemGroups = this.schemaKeys;
    }
    var currentInstance = this;

    // Iterate through each entity group to set up its relations.
    flowControl.each(itemGroups, function(entityKind, continueEntity) {
        var SchemaUnit = sails.models[entityKind];
        if (SchemaUnit) {
            var initialItems = utility.cloneDeep(currentInstance.rawContents[entityKind]);
            flowControl.each(initialItems, function(record, proceedRecord) {
                // Determine the original position of this record in the source file.
                var recordPosition = initialItems.indexOf(record);

                // Find the existing database record and apply relations.
                SchemaUnit.findOne(currentInstance.keyRegistry[entityKind][recordPosition]).exec(function(issue, persistedEntity) {
                    if (issue) {
                        return proceedRecord(issue);
                    }

                    // Filter the record to only include relational properties.
                    record = utility.pick(record, Object.keys(currentInstance.relationalLinks[entityKind]));
                    flowControl.each(Object.keys(record), function(attributeKey, advanceAttribute) {
                        var relationDef = currentInstance.relationalLinks[entityKind][attributeKey];
                        var linkedKind = relationDef[relationDef.type];

                        if (!utility.isArray(record[attributeKey])) {
                            persistedEntity[attributeKey] = currentInstance.keyRegistry[linkedKind][record[attributeKey]-1];
                        } else {
                            for (var subIdx = 0; subIdx < record[attributeKey].length; subIdx++) {
                                persistedEntity[attributeKey].add(currentInstance.keyRegistry[linkedKind][record[attributeKey][subIdx]-1]);
                            }
                        }

                        persistedEntity.save(function(issue) {
                            if (issue) {
                                return advanceAttribute(issue);
                            }

                            advanceAttribute();
                        });
                    }, proceedRecord);
                });
            }, continueEntity);
        } else {
            continueEntity(); // Move to the next entity group if SchemaUnit is not found.
        }
    }, completionCallback);
};

/**
 * Populates the database with loaded data, excluding associations initially.
 * @param {array|function} dataSets A list of specific entity sets to load, or the callback if all sets should be loaded.
 * @param {function|boolean} completionCallback Function to call when population is complete, or a boolean for automatic relations.
 * @param {boolean} automaticRelations If true, relations will be automatically established after population based on fixture order.
 *                                     Defaults to true.
 */
DataSeedling.prototype.loadEntities = function(dataSets, completionCallback, automaticRelations) {
    if (!utility.isArray(dataSets)) {
        automaticRelations = completionCallback;
        completionCallback = dataSets;
        dataSets = this.schemaKeys;
    }
    else {
        utility.each(dataSets, function(groupName) {
            groupName = groupName.toLowerCase();
        });
    }
    automaticRelations = !(automaticRelations === false);
    var currentInstance = this;

    // Process each table/collection for population.
    flowControl.each(dataSets, function(entityKind, continueEntity) {
        var SchemaUnit = sails.models[entityKind];
        if (SchemaUnit) {
            // Remove any existing data in the current table/collection.
            SchemaUnit.destroy().exec(function(issue) {
                if (issue) {
                    return continueEntity(issue);
                }

                // Store association definitions for this model.
                currentInstance.relationalLinks[entityKind] = {};
                for (var idx = 0; idx < SchemaUnit.associations.length; idx++) {
                    currentInstance.relationalLinks[entityKind][SchemaUnit.associations[idx].alias] = SchemaUnit.associations[idx];
                }

                // Insert all the individual data records.
                currentInstance.keyRegistry[entityKind] = [];
                var initialItems = utility.cloneDeep(currentInstance.rawContents[entityKind]);
                flowControl.each(initialItems, function(record, proceedRecord) {
                    // Get the original index of the record.
                    var recordPosition = initialItems.indexOf(record);

                    // Remove any relational data before insertion if auto-relations are enabled.
                    if (automaticRelations) {
                        record = utility.omit(record, Object.keys(currentInstance.relationalLinks[entityKind]));
                    }

                    // Create the new record in the database.
                    SchemaUnit.create(record).exec(function(issue, persistedEntity) {
                        if (issue) {
                            return proceedRecord(issue);
                        }

                        // Map the original position to the new database primary key.
                        currentInstance.keyRegistry[entityKind][recordPosition] = persistedEntity[SchemaUnit.primaryKey];

                        proceedRecord();
                    });
                }, continueEntity);
            });
        } else {
            continueEntity(); // Skip if the model is not defined.
        }
    }, function(issue) {
        if (issue) {
            return completionCallback(issue);
        }

        // If automatic relations are requested, establish them now.
        if (automaticRelations) {
            return currentInstance.establishRelations(dataSets, completionCallback);
        }

        completionCallback();
    });
};