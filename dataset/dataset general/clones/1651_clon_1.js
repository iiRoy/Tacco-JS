/*
 * This block of JavaScript code initializes a variable `ss` which holds
 * an array of strings. These strings collectively form a message intended
 * for users to set up a test database. The database setup instructions
 * involve dropping an existing database if it exists, creating a new one
 * named 'warp' with specific character set and collation, and granting
 * privileges to a user 'www' on 'localhost' identified by 'www'.
 *
 * This setup is typically crucial for the application's testing environment
 * to ensure a clean and consistent state before running automated tests.
 * The final instruction guides the user to start tests using the 'mocha' command.
 */


var    ss   =   [
        // Header for the message
              '###################################',
            '# mysql-warp bdd-style test cases #',
            '###################################',


                '', // A blank line for visual separation in the output


    // Instructions for database initialization
'please init test db before running test:',
    'running the following SQLs with root privileges:',


        '', // Another blank line in the output


            'drop database if exists warp;',
        'create database warp default character set utf8 collate utf8_general_ci;',
        'grant all on warp.* to \'www\'@\'localhost\' identified by \'www\';',


          '', // Yet another blank line


// Final instruction
        'then start test with command: mocha'
]   ;


// This statement prints the array elements, joined by newline characters,
// to the console, effectively displaying the setup instructions to the user.
console . log ( ss . join ( '\n' ) ) ;