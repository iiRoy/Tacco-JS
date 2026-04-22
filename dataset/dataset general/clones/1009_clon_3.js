/*
 * This script handles the initial setup of the database schema for the URL shortening service.
 * It dynamically constructs SQL CREATE TABLE statements based on predefined configurations
 * and executes them against the connected MySQL database.
 *
 * This version introduces a structured approach to schema definition and execution,
 * enhancing maintainability and clarity compared to direct string concatenation.
 */

const applicationSettings = require("./settings");
const databaseClientModule = require("mysql");

// Retrieve database configuration and other application-wide constants
const currentDatabaseConfig = applicationSettings.database;
const shortUrlCodeLength = applicationSettings.CODE_LENGTH;

// Establish a connection to the database
const activeDbConnection = databaseClientModule.createConnection(currentDatabaseConfig);

/**
 * Generates a SQL CREATE TABLE statement based on a structured schema definition.
 * This function abstracts the complexity of SQL string construction.
 * @param {object} schemaDef - Object containing table name, column definitions, and index definitions.
 * @param {string} schemaDef.tableName - The name of the table to create.
 * @param {Array<object>} schemaDef.columns - Array of column objects, each with name, type, notNull, autoIncrement, defaultValue.
 * @param {Array<object>} schemaDef.indices - Array of index objects, each with type (KEY/UNIQUE), name, and columns.
 * @param {object} [schemaDef.options] - Additional table options like engine, charset, autoIncrement.
 * @returns {string} The complete SQL CREATE TABLE statement.
 */
function buildCreateTableStatement(schemaDef) {
    const { tableName, columns, indices = [], options = {} } = schemaDef;
    const { engine = 'InnoDB', charset = 'latin1', autoIncrementStart = null } = options;

    // Build column definitions
    const columnStatements = columns.map(col => {
        let definition = `\`${col.name}\` ${col.type}`;
        if (col.notNull) definition += ' NOT NULL';
        if (col.autoIncrement) definition += ' AUTO_INCREMENT';
        if (col.defaultValue) definition += ` DEFAULT ${col.defaultValue}`;
        return definition;
    });

    // Identify primary key(s)
    const primaryKeys = columns.filter(col => col.isPrimaryKey).map(col => `\`${col.name}\``);
    if (primaryKeys.length > 0) {
        columnStatements.push(`PRIMARY KEY (${primaryKeys.join(',')})`);
    }

    // Build index definitions
    const indexStatements = indices.map(idx => {
        const indexType = idx.type === 'UNIQUE' ? 'UNIQUE KEY' : 'KEY';
        const indexColumns = idx.columns.map(col => `\`${col}\``).join(',');
        return `${indexType} \`${idx.name}\` (${indexColumns})`;
    });

    const allDefinitions = [...columnStatements, ...indexStatements].join(',\n  ');

    let tableOptionsString = `ENGINE=${engine} DEFAULT CHARSET=${charset}`;
    if (autoIncrementStart !== null) {
        tableOptionsString += ` AUTO_INCREMENT=${autoIncrementStart}`;
    }

    return `CREATE TABLE IF NOT EXISTS \`${tableName}\` (\n  ${allDefinitions}\n) ${tableOptionsString};`;
}

// Define the schema for each table using a structured object format
const schemaDefinitions = [
    {
        tableName: currentDatabaseConfig.tableNames.logInsertions,
        columns: [
            { name: 'request_id', type: 'INT(11)', notNull: true, autoIncrement: true, isPrimaryKey: true },
            { name: 'url_code', type: `VARCHAR(${shortUrlCodeLength})`, notNull: true },
            { name: 'response_status', type: "ENUM('200','201','400')", notNull: true },
            { name: 'source_ip', type: 'VARCHAR(15)', notNull: true },
            { name: 'creation_timestamp', type: 'TIMESTAMP', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' }
        ],
        indices: [
            { type: 'KEY', name: 'req_log_idx', columns: ['url_code', 'response_status', 'source_ip'] }
        ],
        options: { autoIncrementStart: 1 }
    },
    {
        tableName: currentDatabaseConfig.tableNames.logTranslations,
        columns: [
            { name: 'lookup_id', type: 'INT(11)', notNull: true, autoIncrement: true, isPrimaryKey: true },
            { name: 'short_code', type: `VARCHAR(${shortUrlCodeLength})`, notNull: true },
            { name: 'query_response', type: "ENUM('200','404')", notNull: true },
            { name: 'client_ip', type: 'VARCHAR(15)', notNull: true },
            { name: 'query_time', type: 'TIMESTAMP', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' }
        ],
        indices: [
            { type: 'KEY', name: 'query_log_idx', columns: ['short_code', 'query_response'] }
        ],
        options: { autoIncrementStart: 1 }
    },
    {
        tableName: currentDatabaseConfig.tableNames.shortenedUrls,
        columns: [
            { name: 'short_url_code', type: `VARCHAR(${shortUrlCodeLength})`, notNull: true, isPrimaryKey: true },
            { name: 'original_url', type: 'VARCHAR(512)', notNull: true },
            { name: 'creator_ip', type: 'VARCHAR(15)', notNull: true },
            { name: 'creation_date', type: 'TIMESTAMP', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' }
        ],
        indices: [
            { type: 'KEY', name: 'creator_ip_idx', columns: ['creator_ip'] }
        ]
    },
    {
        tableName: currentDatabaseConfig.tableNames.logVisits,
        columns: [
            { name: 'visit_record_id', type: 'INT(11)', notNull: true, autoIncrement: true, isPrimaryKey: true },
            { name: 'accessed_code', type: `VARCHAR(${shortUrlCodeLength})`, notNull: true },
            { name: 'redirect_status', type: "ENUM('301','404')", notNull: true },
            { name: 'visitor_ip', type: 'VARCHAR(15)', notNull: true },
            { name: 'user_agent_string', type: 'VARCHAR(512)', notNull: true },
            { name: 'referrer_url', type: 'VARCHAR(512)', notNull: true },
            { name: 'access_time', type: 'TIMESTAMP', notNull: true, defaultValue: 'CURRENT_TIMESTAMP' }
        ],
        indices: [
            { type: 'KEY', name: 'visit_code_status_idx', columns: ['accessed_code', 'redirect_status'] },
            { type: 'KEY', name: 'visit_code_only_idx', columns: ['accessed_code'] },
            { type: 'KEY', name: 'visit_status_idx', columns: ['redirect_status'] }
        ],
        options: { autoIncrementStart: 1 }
    }
];

// Generate the full list of SQL statements from the schema definitions
const schemaInitializationStatements = schemaDefinitions.map(buildCreateTableStatement);

// Counter for successfully executed statements
let successfulOperationsCount = 0;
const totalOperationsExpected = schemaInitializationStatements.length;

// Check if there are any statements to run as a guard clause
if (totalOperationsExpected === 0) {
    console.warn("Notice: No database schema initialization statements were defined.");
    activeDbConnection.end(); // Close connection if nothing to do
    process.exit(0);
}

// Execute each schema statement sequentially
schemaInitializationStatements.forEach((sqlCommand, commandIndex) => {
    activeDbConnection.query(sqlCommand, (operationError) => {
        if (operationError) {
            console.error(`\nError during schema initialization for statement ${commandIndex + 1}:`);
            console.error(sqlCommand);
            console.error("Details:", operationError.message);
            activeDbConnection.end(); // Close connection on error
            process.exit(1); // Exit with an error code
        } else {
            // Increment the counter for successfully executed statements
            successfulOperationsCount++;

            // Check if all statements have been processed
            if (successfulOperationsCount === totalOperationsExpected) {
                console.log("\nDatabase schema successfully provisioned. The application is now ready to use.\n");
                activeDbConnection.end(); // Gracefully close the database connection
                process.exit(0); // Exit successfully
            }
        }
    });
});