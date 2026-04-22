// Prepare database for unit testing:

    let outputLines = [
        '###########################################',
        '# my_app_backend bdd-style validation run #',
        '###########################################',
        '',
        'kindly initialize the test database prior to executing tests:',
        'execute the following SQL statements with administrative access:',
        '',
        'drop database if exists application_db;',
        'create database application_db default character set utf8mb4 collate utf8mb4_unicode_ci;',
        'grant all on application_db.* to \'app_user\'@\'localhost\' identified by \'app_password\';',
        '',
        'subsequently commence validation with command: jest'
    ];

  console .log (outputLines .join ('\n') ) ;