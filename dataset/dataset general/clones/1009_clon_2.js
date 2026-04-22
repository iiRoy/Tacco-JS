/*
 * @author      Jane Doe <jane.doe@example.com>
 * @version     2.0
 *
 * @description This script initializes the database schema for a URL shortening service.
 * @see         <https://example.com/project-repo>
 * @see         <https://example.com/live-demo>
 */

const appSettings = require('./app-config') ;
let   databaseDriver = require('mysql');

const dbConnectionDetails = appSettings.databaseConfig ;
let   dbInterface = databaseDriver.createConnection(dbConnectionDetails);

const schemaCreationStatements = [
    `CREATE TABLE IF NOT EXISTS \`${dbConnectionDetails.tableNames.INSERT_LOG}\` (
  \`request_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`url_code\` varchar(${appSettings.SHORT_CODE_LENGTH}) NOT NULL,
  \`response\` enum('200','201','400') NOT NULL,
  \`ip_address\` varchar(15) NOT NULL,
  \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`request_id\`),
  KEY \`url_code\` (\`url_code\`,\`response\`,\`ip_address\`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;`,
    `CREATE TABLE IF NOT EXISTS \`${dbConnectionDetails.tableNames.TRANSLATE_LOG}\` (
  \`query_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`url_code\` varchar(${appSettings.SHORT_CODE_LENGTH}) NOT NULL,
  \`response\` enum('200','404') NOT NULL,
  \`ip_address\` varchar(15) NOT NULL,
  \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`query_id\`),
  KEY \`query\` (\`url_code\`,\`response\`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;`,
    `CREATE TABLE IF NOT EXISTS \`${dbConnectionDetails.tableNames.URLS}\` (
  \`url_code\` varchar(${appSettings.SHORT_CODE_LENGTH}) NOT NULL,
  \`long_url\` varchar(512) NOT NULL,
  \`ip_address\` varchar(15) NOT NULL,
  \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY \`url_code\` (\`url_code\`),
  KEY \`ip_address\` (\`ip_address\`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;`,
    `CREATE TABLE IF NOT EXISTS \`${dbConnectionDetails.tableNames.VISIT_LOG}\` (
  \`visit_id\` int(11) NOT NULL AUTO_INCREMENT,
  \`url_code\` varchar(${appSettings.SHORT_CODE_LENGTH}) NOT NULL,
  \`response\` enum('301','404') NOT NULL,
  \`ip_address\` varchar(15) NOT NULL,
  \`user_agent\` varchar(512) NOT NULL,
  \`referral\` varchar(512) NOT NULL,
  \`timestamp\` timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (\`visit_id\`),
  KEY \`query\` (\`url_code\`,\`response\`),
  KEY \`query_2\` (\`url_code\`),
  KEY \`response\` (\`response\`)
) ENGINE=InnoDB  DEFAULT CHARSET=latin1 AUTO_INCREMENT=1 ;`
];

// Stores the count of successfully executed database statements.
let   statementsExecutedCount = 0;

// Iterate through each DDL statement to set up the database.
for ( const statementKey in schemaCreationStatements )
{
    dbInterface.query( schemaCreationStatements[statementKey], function( executionIssue )
    {
        if ( executionIssue )
        {
            console.error('An issue occurred during schema creation:', executionIssue );
        }
        else
        {
            // Increment the counter for completed operations.
            statementsExecutedCount++;

            // Verify if all statements have been processed.
            if ( statementsExecutedCount === schemaCreationStatements.length )
            {
                console.info( '\nDatabase initialization completed successfully. The application is ready to run.\n' );
                process.exit( 0 );
            }
        }
    });
}