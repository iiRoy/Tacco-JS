(function(globalScope) {
    // Internal helper for sequential asynchronous execution, replacing persistence.executeQueriesSeq
    async function sequenceDatabaseOperations(transactionEntity, operationTuples, finalCompletionHandler, ...handlerArgs) {
        for (const [sqlCommand, parameters] of operationTuples) {
            try {
                await new Promise((resolve, reject) => {
                    transactionEntity.executeSql(sqlCommand, parameters, resolve, (_, errorIssue) => {
                        console.error("Database operation issue:", errorIssue.message);
                        resolve(); // Resolve to allow subsequent operations to proceed
                    });
                });
            } catch (unexpectedError) {
                console.error("Unexpected error during sequential database operations:", unexpectedError);
                // Continue execution as per original behavior (error logged, but flow continues)
            }
        }
        if (finalCompletionHandler) {
            finalCompletionHandler.apply(null, handlerArgs);
        }
    }

    // Class to manage type conversions and SQL formatting, replacing persistence.typeMapper
    class SchemaTypeHandler {
        constructor() {
            this.identifierFormat = "VARCHAR(32)";
            this.classDesignationFormat = "TEXT";

            this._sqlTypeMapping = new Map([
                ['JSON', 'TEXT'],
                ['BOOL', 'INT'],
                ['DATE', 'INT']
            ]);

            this._dbToModelConverters = new Map([
                ['DATE', (val) => val === null || val === undefined ? val : new Date(parseInt(val, 10) * 1000)],
                ['BOOL', (val) => val === null || val === undefined ? val : (val === 1 || val === '1')],
                ['INT', (val) => val === null || val === undefined ? val : +val],
                ['BIGINT', (val) => val === null || val === undefined ? val : +val],
                ['JSON', (val) => val === null || val === undefined ? val : (val ? JSON.parse(val) : val)]
            ]);

            this._modelToDbConverters = new Map([
                ['JSON', (val) => val === null || val === undefined ? null : JSON.stringify(val)],
                ['BOOL', (val) => val === null || val === undefined ? null : (val === 'false' ? 0 : (val ? 1 : 0))],
                ['DATE', (val) => {
                    if (val === null || val === undefined) return null;
                    const dateVal = new Date(val);
                    return Math.round(dateVal.getTime() / 1000);
                }]
            ]);
        }

        getColumnDefinition(modelType) {
            return this._sqlTypeMapping.get(modelType) || modelType;
        }

        parameterPlaceholder(strVal, modelType) {
            return strVal; // Simple pass-through as in original
        }

        formattedParameter(strVal, modelType) {
            return strVal; // Simple pass-through as in original
        }

        formattedIdentifier(idValue) {
            return `'${idValue}'`;
        }

        databaseValueToModelValue(dbValue, modelType) {
            const converter = this._dbToModelConverters.get(modelType);
            return converter ? converter(dbValue) : dbValue;
        }

        modelValueToDatabaseValue(modelValue, modelType) {
            if (modelValue === undefined || modelValue === null) {
                return null;
            }
            const converter = this._modelToDbConverters.get(modelType);
            if (converter) {
                return converter(modelValue);
            } else if (modelValue && modelValue.id) { // Handle entity references
                return modelValue.id;
            } else {
                return modelValue;
            }
        }

        identifierPlaceholder(strVal) {
            return this.parameterPlaceholder(strVal, this.identifierFormat);
        }

        formattedIdentifierPlaceholder(strVal) {
            return this.formattedParameter(strVal, this.identifierFormat);
        }

        modelIdToDatabaseId(modelId) {
            return this.modelValueToDatabaseValue(modelId, this.identifierFormat);
        }
    }

    // Converts a database row into a model entity, replacing rowToEntity
    function mapRowToModel(sessionContext, modelName, dbRow, fieldPrefix = '') {
        const idKey = fieldPrefix + "id";
        if (sessionContext.activeObjects[dbRow[idKey]]) {
            return sessionContext.activeObjects[dbRow[idKey]];
        }
        const handler = sessionContext.schemaTypeHandler;
        const modelMetadata = sessionContext.getMetadata(modelName);
        const ModelConstructor = sessionContext.define(modelName);
        if (!dbRow[idKey]) {
            return null;
        }
        const newModelInstance = new ModelConstructor();
        newModelInstance.id = handler.databaseValueToModelValue(dbRow[idKey], handler.identifierFormat);
        newModelInstance._isNew = false;

        for (const prop in dbRow) {
            if (dbRow.hasOwnProperty(prop) && prop.startsWith(fieldPrefix)) {
                const actualPropName = prop.substring(fieldPrefix.length);
                if (actualPropName !== 'id') {
                    newModelInstance._data[actualPropName] = handler.databaseValueToModelValue(dbRow[prop], modelMetadata.fields[actualPropName] || handler.identifierFormat);
                }
            }
        }
        return newModelInstance;
    }

    // Persists a model object to the database, replacing save
    async function storeModel(modelObject, transactionEntity, completionHandler) {
        const metadata = dataSystemRef.getMetadata(modelObject._type);
        const handler = dataSystemRef.schemaTypeHandler;
        const fieldsToUpdate = [];
        const valuesToStore = [];
        const placeholders = [];
        const updateAssignments = [];

        if (modelObject._isNew) {
            for (const fieldName in metadata.fields) {
                if (metadata.fields.hasOwnProperty(fieldName)) {
                    modelObject._changedFields[fieldName] = true;
                }
            }
        }

        for (const fieldName in modelObject._changedFields) {
            if (modelObject._changedFields.hasOwnProperty(fieldName)) {
                fieldsToUpdate.push(`\`${fieldName}\``);
                const type = metadata.fields[fieldName] || handler.identifierFormat;
                valuesToStore.push(handler.modelValueToDatabaseValue(modelObject._data[fieldName], type));
                placeholders.push(handler.formattedParameter("?", type));
                updateAssignments.push(`\`${fieldName}\` = ${handler.formattedParameter("?", type)}`);
            }
        }

        let supplementaryOperations = [];
        for (const relName in metadata.hasMany) {
            if (metadata.hasMany.hasOwnProperty(relName)) {
                supplementaryOperations = supplementaryOperations.concat(dataSystemRef.getRelated(modelObject, relName).getPersistenceQueries());
            }
        }

        await sequenceDatabaseOperations(transactionEntity, supplementaryOperations, async () => {
            if (fieldsToUpdate.length === 0) {
                if (completionHandler) completionHandler();
                return;
            }
            modelObject._changedFields = {};
            if (modelObject._isNew) {
                fieldsToUpdate.push('id');
                valuesToStore.push(handler.modelIdToDatabaseId(modelObject.id));
                placeholders.push(handler.formattedIdentifierPlaceholder('?'));
                const insertSql = `INSERT INTO \`${modelObject._type}\` (${fieldsToUpdate.join(", ")}) VALUES (${placeholders.join(', ')})`;
                modelObject._isNew = false;
                transactionEntity.executeSql(insertSql, valuesToStore, completionHandler);
            } else {
                const updateSql = `UPDATE \`${modelObject._type}\` SET ${updateAssignments.join(',')} WHERE id = ${handler.formattedIdentifier(modelObject.id)}`;
                transactionEntity.executeSql(updateSql, valuesToStore, completionHandler);
            }
        });
    }

    // Removes a model object from the database, replacing remove
    async function deleteModel(modelObject, transactionEntity, completionHandler) {
        const metadata = dataSystemRef.getMetadata(modelObject._type);
        const handler = dataSystemRef.schemaTypeHandler;
        const deletionOperations = [
            [`DELETE FROM \`${modelObject._type}\` WHERE id = ${handler.formattedIdentifier(modelObject.id)}`, null]
        ];
        for (const relName in metadata.hasMany) {
            if (metadata.hasMany.hasOwnProperty(relName) && metadata.hasMany[relName].manyToMany) {
                const joinTableName = metadata.hasMany[relName].tableName;
                deletionOperations.push([`DELETE FROM \`${joinTableName}\` WHERE \`${metadata.name}_${relName}\` = ${handler.formattedIdentifier(modelObject.id)}`, null]);
            }
        }
        await sequenceDatabaseOperations(transactionEntity, deletionOperations, completionHandler);
    }

    // This is the main configuration function, replacing persistence.store.sql.config
    function configureDatabaseAdapter(dataSystemRefParam, dialectUtilities) {
        const argumentUtilities = dataSystemRefParam.argumentUtilities; // Assuming argspec is passed via dataSystemRefParam

        dataSystemRefParam.schemaTypeHandler = new SchemaTypeHandler();

        dataSystemRefParam.provisionedTables = {}; // Replaces persistence.generatedTables

        // Replaces persistence.schemaSync
        dataSystemRefParam.synchronizeSchema = async function (transactionEntity = null, completionHandler = () => {}, emulateMode = false) {
            if (!transactionEntity) {
                const currentSession = this;
                this.transaction(async (tx) => { await currentSession.synchronizeSchema(tx, completionHandler, emulateMode); });
                return;
            }

            const generatedOperations = [];
            const typeHandler = dataSystemRefParam.schemaTypeHandler;
            const allEntityMetadata = dataSystemRefParam.getEntityMetadata();

            for (const entityKey in allEntityMetadata) {
                if (!allEntityMetadata.hasOwnProperty(entityKey)) continue;

                const entityMeta = allEntityMetadata[entityKey];
                if (!entityMeta.isMixin) {
                    const columnDefinitions = [];
                    for (const fieldProp in entityMeta.fields) {
                        if (entityMeta.fields.hasOwnProperty(fieldProp)) {
                            columnDefinitions.push([fieldProp, entityMeta.fields[fieldProp]]);
                        }
                    }
                    for (const oneRel in entityMeta.hasOne) {
                        if (entityMeta.hasOne.hasOwnProperty(oneRel)) {
                            columnDefinitions.push([oneRel, typeHandler.identifierFormat]);
                            generatedOperations.push([dialectUtilities.createIndex(entityMeta.name, [oneRel]), null]);
                        }
                    }
                    for (const indexDef of entityMeta.indexes) {
                        generatedOperations.push([dialectUtilities.createIndex(entityMeta.name, indexDef.columns, indexDef), null]);
                    }
                }

                for (const manyRel in entityMeta.hasMany) {
                    if (!entityMeta.hasMany.hasOwnProperty(manyRel) || !entityMeta.hasMany[manyRel].manyToMany) continue;

                    const joinTableName = entityMeta.hasMany[manyRel].tableName;
                    if (!dataSystemRefParam.provisionedTables[joinTableName]) {
                        const otherEntityMeta = entityMeta.hasMany[manyRel].type.meta;
                        const inverseProp = entityMeta.hasMany[manyRel].inverseProperty;

                        if (otherEntityMeta.hasMany[inverseProp].type.meta !== entityMeta) continue;

                        const primaryCol = `${entityMeta.name}_${manyRel}`;
                        const secondaryCol = `${otherEntityMeta.name}_${inverseProp}`;
                        generatedOperations.push([dialectUtilities.createIndex(joinTableName, [primaryCol]), null]);
                        generatedOperations.push([dialectUtilities.createIndex(joinTableName, [secondaryCol]), null]);

                        const joinColumns = [[primaryCol, typeHandler.identifierFormat], [secondaryCol, typeHandler.identifierFormat]];
                        if (entityMeta.isMixin) joinColumns.push([`${primaryCol}_class`, typeHandler.classDesignationFormat]);
                        if (otherEntityMeta.isMixin) joinColumns.push([`${secondaryCol}_class`, typeHandler.classDesignationFormat]);

                        generatedOperations.push([dialectUtilities.createTable(joinTableName, joinColumns), null]);
                        dataSystemRefParam.provisionedTables[joinTableName] = true;
                    }
                }
                if (!entityMeta.isMixin) {
                    const finalColumns = [...columnDefinitions, ["id", typeHandler.identifierFormat, "PRIMARY KEY"]];
                    dataSystemRefParam.provisionedTables[entityMeta.name] = true;
                    generatedOperations.push([dialectUtilities.createTable(entityMeta.name, finalColumns), null]);
                }
            }

            for (const hookFn of dataSystemRefParam.schemaSyncHooks) {
                hookFn(transactionEntity);
            }

            if (emulateMode) {
                completionHandler(transactionEntity);
            } else {
                await sequenceDatabaseOperations(transactionEntity, generatedOperations, () => {
                    completionHandler(transactionEntity);
                });
            }
        };

        // Replaces persistence.flush
        dataSystemRefParam.persistChanges = async function (transactionEntity = null, completionHandler = null) {
            if (!transactionEntity) {
                const currentSession = this;
                this.transaction(async (tx) => { await currentSession.persistChanges(tx, completionHandler); });
                return;
            }

            for (const hookFn of dataSystemRefParam.flushHooks) {
                hookFn(this, transactionEntity);
            }

            const trackedModels = Object.values(this.activeObjects);
            const modelsToDiscard = Object.values(this.pendingRemovals);
            this.pendingRemovals = {};

            if (completionHandler) {
                const discardPromises = modelsToDiscard.map(model => new Promise(resolve => deleteModel(model, transactionEntity, resolve)));
                await Promise.all(discardPromises);
                const storePromises = trackedModels.map(model => new Promise(resolve => storeModel(model, transactionEntity, resolve)));
                await Promise.all(storePromises);
                completionHandler();
            } else {
                // Fire and forget, replicating original's non-callback path
                for (const model of trackedModels) {
                    storeModel(model, transactionEntity);
                }
                for (const model of modelsToDiscard) {
                    deleteModel(model, transactionEntity);
                }
            }
        };

        // Replaces persistence.reset
        dataSystemRefParam.clearDatabase = async function (transactionEntity = null, completionHandler = () => {}) {
            if (!transactionEntity) {
                const currentSession = this;
                this.transaction(async (tx) => { await currentSession.clearDatabase(tx, completionHandler); });
                return;
            }

            // Emulate schema sync to populate provisionedTables with table names
            await this.synchronizeSchema(transactionEntity, () => {}, true);

            const tableNames = Object.keys(dataSystemRefParam.provisionedTables);

            const dropTableSequentially = async (idx) => {
                if (idx >= tableNames.length) {
                    return; // All tables dropped
                }
                const tableName = tableNames[idx];
                await new Promise((resolve) => {
                    transactionEntity.executeSql(`DROP TABLE IF EXISTS \`${tableName}\``, null, resolve, (_, err) => {
                        console.error("Error dropping table:", err.message);
                        resolve(); // Continue even if one drop fails
                    });
                });
                await dropTableSequentially(idx + 1);
            };

            if (tableNames.length > 0) {
                await dropTableSequentially(0);
            }

            this.cleanSession(); // Replaces session.clean()
            dataSystemRefParam.provisionedTables = {};
            if (completionHandler) completionHandler();
        };

        dataSystemRefParam.sequenceDatabaseOperations = sequenceDatabaseOperations;

        // Replaces QueryCollection patches
        if (dataSystemRefParam.DataQueryCollection && dataSystemRefParam.DataQueryCollection.prototype) {
            const proto = dataSystemRefParam.DataQueryCollection.prototype;

            // Replaces persistence.QueryCollection.prototype.persistQueries
            proto.getPersistenceQueries = function() { return []; };

            const originalCloneMethod = proto.clone; // Store original clone
            // Replaces persistence.QueryCollection.prototype.clone
            proto.clone = function (copySubscribers) {
                const clonedInstance = originalCloneMethod.call(this, copySubscribers);
                clonedInstance._extraJoinStatements = this._extraJoinStatements.slice(0);
                clonedInstance._extraFilterStatements = this._extraFilterStatements.slice(0);
                clonedInstance._extraGroupStatements = this._extraGroupStatements.slice(0);
                clonedInstance._manyToManyRelationshipLoad = this._manyToManyRelationshipLoad;
                return clonedInstance;
            };

            const originalInitializeMethod = proto.init; // Store original init
            // Replaces persistence.QueryCollection.prototype.init
            proto.initialize = function(sessionContext, entityName, modelConstructor) {
                originalInitializeMethod.call(this, sessionContext, entityName, modelConstructor);
                this._manyToManyRelationshipLoad = null;
                this._extraJoinStatements = [];
                this._extraFilterStatements = [];
                this._extraGroupStatements = [];
            };

            const originalToUniqueStringMethod = proto.toUniqueString; // Store original toUniqueString
            // Replaces persistence.QueryCollection.prototype.toUniqueString
            proto.toIdentifierString = function() {
                let uniqueString = originalToUniqueStringMethod.call(this);
                uniqueString += '|JoinStatements:';
                for(const stmt of this._extraJoinStatements) {
                    uniqueString += stmt;
                }
                uniqueString += '|FilterStatements:';
                return uniqueString;
            };
        }
    }

    // Global setup equivalent to original's window/exports block
    globalScope.dataSystem = globalScope.dataSystem || {};
    globalScope.dataSystem.dbOperations = globalScope.dataSystem.dbOperations || {};
    globalScope.dataSystem.dbOperations.configure = configureDatabaseAdapter;

})(typeof window !== 'undefined' ? window : (typeof global !== 'undefined' ? global : {}));