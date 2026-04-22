const configurationData = require("./configuration");
const databaseConnector = require("mysql");

const outputInfo = (message) => process.stdout.write(message);
const outputError = (message) => process.stderr.write(message + '\n');

const connectionParameters = configurationData.database;
const databaseConnection = databaseConnector.createConnection(connectionParameters);

const schemaDefinitions = [
    {
        tag: 'INSERT_LOG',
        cols: [
            { id: 'request_id', kind: 'int(11)', constraints: 'NOT NULL AUTO_INCREMENT' },
            { id: 'url_code', kind: null, constraints: 'NOT NULL' },
            { id: 'response', kind: "enum('200','201','400')", constraints: 'NOT NULL' },
            { id: 'ip_address', kind: 'varchar(15)', constraints: 'NOT NULL' },
            { id: 'timestamp', kind: 'timestamp', constraints: 'NOT NULL DEFAULT CURRENT_TIMESTAMP' }
        ],
        pk: 'request_id',
        indices: [
            { nm: 'url_code', members: ['url_code', 'response', 'ip_address'] }
        ],
        storage: 'InnoDB',
        encoding: 'latin1',
        startIncrement: 1
    },
    {
        tag: 'TRANSLATE_LOG',
        cols: [
            { id: 'query_id', kind: 'int(11)', constraints: 'NOT NULL AUTO_INCREMENT' },
            { id: 'url_code', kind: null, constraints: 'NOT NULL' },
            { id: 'response', kind: "enum('200','404')", constraints: 'NOT NULL' },
            { id: 'ip_address', kind: 'varchar(15)', constraints: 'NOT NULL' },
            { id: 'timestamp', kind: 'timestamp', constraints: 'NOT NULL DEFAULT CURRENT_TIMESTAMP' }
        ],
        pk: 'query_id',
        indices: [
            { nm: 'query', members: ['url_code', 'response'] }
        ],
        storage: 'InnoDB',
        encoding: 'latin1',
        startIncrement: 1
    },
    {
        tag: 'URLS',
        cols: [
            { id: 'url_code', kind: null, constraints: 'NOT NULL' },
            { id: 'long_url', kind: 'varchar(512)', constraints: 'NOT NULL' },
            { id: 'ip_address', kind: 'varchar(15)', constraints: 'NOT NULL' },
            { id: 'timestamp', kind: 'timestamp', constraints: 'NOT NULL DEFAULT CURRENT_TIMESTAMP' }
        ],
        pk: null,
        indices: [
            { type: 'UNIQUE', nm: 'url_code', members: ['url_code'] },
            { nm: 'ip_address', members: ['ip_address'] }
        ],
        storage: 'InnoDB',
        encoding: 'latin1',
        startIncrement: null
    },
    {
        tag: 'VISIT_LOG',
        cols: [
            { id: 'visit_id', kind: 'int(11)', constraints: 'NOT NULL AUTO_INCREMENT' },
            { id: 'url_code', kind: null, constraints: 'NOT NULL' },
            { id: 'response', kind: "enum('301','404')", constraints: 'NOT NULL' },
            { id: 'ip_address', kind: 'varchar(15)', constraints: 'NOT NULL' },
            { id: 'user_agent', kind: 'varchar(512)', constraints: 'NOT NULL' },
            { id: 'referral', kind: 'varchar(512)', constraints: 'NOT NULL' },
            { id: 'timestamp', kind: 'timestamp', constraints: 'NOT NULL DEFAULT CURRENT_TIMESTAMP' }
        ],
        pk: 'visit_id',
        indices: [
            { nm: 'query', members: ['url_code', 'response'] },
            { nm: 'query_2', members: ['url_code'] },
            { nm: 'response', members: ['response'] }
        ],
        storage: 'InnoDB',
        encoding: 'latin1',
        startIncrement: 1
    }
];

const generateSchemaStatement = (schemaObj, tableAliasMap, codeIdentifierLength) => {
    const actualTableName = tableAliasMap[schemaObj.tag];
    
    const columnDefinitions = schemaObj.cols.map(column => {
        const columnType = column.id === 'url_code' && column.kind === null ? 
                           `varchar(${codeIdentifierLength})` : 
                           column.kind;
        return `\`${column.id}\` ${columnType} ${column.constraints}`;
    }).join(',\n  ');

    const primaryKeyClause = schemaObj.pk ? `PRIMARY KEY (\`${schemaObj.pk}\`)` : '';
    
    const indexClauses = schemaObj.indices.map(idx => {
        const indexType = idx.type === 'UNIQUE' ? 'UNIQUE ' : '';
        return `${indexType}KEY \`${idx.nm}\` (\`${idx.members.join('`,`')}\`)`;
    }).join(',\n  ');

    const allConstraints = [primaryKeyClause, indexClauses].filter(Boolean).join(',\n  ');

    const autoIncrementPart = schemaObj.startIncrement ? ` AUTO_INCREMENT=${schemaObj.startIncrement}` : '';

    return `CREATE TABLE IF NOT EXISTS \`${actualTableName}\` (\n  ${columnDefinitions},\n  ${allConstraints}\n) ENGINE=${schemaObj.storage} DEFAULT CHARSET=${schemaObj.encoding}${autoIncrementPart};`;
};

const commandsForSchemaCreation = schemaDefinitions.map(def => 
    generateSchemaStatement(def, connectionParameters.tables, configurationData.CODE_LENGTH)
);

const executeDatabaseInitialization = async (connectionHandle, statementList) => {
    try {
        const operationPromises = statementList.map(sqlStatement => {
            return new Promise((resolve, reject) => {
                connectionHandle.query(sqlStatement, (issue) => {
                    if (issue) {
                        reject(issue);
                    } else {
                        resolve();
                    }
                });
            });
        });

        await Promise.all(operationPromises);
        outputInfo("\nData store setup completed successfully. Application ready.\n");
        process.exit(0);

    } catch (e) {
        outputError("Error during data store initialization: " + e.message);
        process.exit(1);
    }
};

executeDatabaseInitialization(databaseConnection, commandsForSchemaCreation);