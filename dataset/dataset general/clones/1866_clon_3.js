(function ($) {
    // This script dynamically generates various code formats (SQL, XML, JSON, CSV)
    // based on user selections and data fetched from a public API.
    // It processes country information and allows for different database schemas.

    // Core data storage for fetched country details
    let extractedDataEntries = [];

    // User-selected attributes (e.g., countryCode, population)
    let selectedAttributes = [];

    // Global operational configuration
    const generationConfig = {
        outputFormat: "mysqltype", // Default format
        enableDatabaseLookup: false // Default to no lookup table generation
    };

    // SQL schema definitions for various database types and tables
    const mysqlSchemaDefinitions = {
        'countryCode': "CHAR(2) NOT NULL DEFAULT ''",
        'countryName': "VARCHAR(45) NOT NULL DEFAULT ''",
        'currencyCode': "CHAR(3) DEFAULT NULL",
        'population': "VARCHAR(20) DEFAULT NULL",
        'fipsCode': "CHAR(2) DEFAULT NULL",
        'isoNumeric': "CHAR(4) DEFAULT NULL",
        'north': "VARCHAR(30) DEFAULT NULL",
        'south': "VARCHAR(30) DEFAULT NULL",
        'east': "VARCHAR(30) DEFAULT NULL",
        'west': "VARCHAR(30) DEFAULT NULL",
        'capital': "VARCHAR(30) DEFAULT NULL",
        'continentName': "VARCHAR(15) DEFAULT NULL",
        'continent': "CHAR(2) DEFAULT NULL",
        'areaInSqKm': "VARCHAR(20) DEFAULT NULL",
        'languages': "VARCHAR(100) DEFAULT NULL",
        'isoAlpha3': "CHAR(3) DEFAULT NULL",
        'geonameId': "INT(10) DEFAULT NULL"
    };

    const firebirdSchemaDefinitions = {
        'countryCode': "CHAR(3) NOT NULL",
        'countryName': "VARCHAR(45) NOT NULL",
        'currencyCode': "CHAR(3) DEFAULT NULL",
        'population': "VARCHAR(20) DEFAULT NULL",
        'fipsCode': "CHAR(2) DEFAULT NULL",
        'isoNumeric': "CHAR(4) DEFAULT NULL",
        'north': "VARCHAR(30) DEFAULT NULL",
        'south': "VARCHAR(30) DEFAULT NULL",
        'east': "VARCHAR(30) DEFAULT NULL",
        'west': "VARCHAR(30) DEFAULT NULL",
        'capital': "VARCHAR(30) DEFAULT NULL",
        'continentName': "VARCHAR(15) DEFAULT NULL",
        'continent': "CHAR(2) DEFAULT NULL",
        'areaInSqKm': "VARCHAR(20) DEFAULT NULL",
        'languages': "VARCHAR(100) DEFAULT NULL",
        'isoAlpha3': "CHAR(3) DEFAULT NULL",
        'geonameId': "INTEGER DEFAULT NULL"
    };

    // Schema for main country table when database lookup is enabled
    const firebirdLookupMainSchema = {
        'countryCode': "CHAR(3) NOT NULL",
        'countryName': "VARCHAR(45) NOT NULL",
        'currencyCode': "CHAR(3) DEFAULT NULL",
        'population': "VARCHAR(20) DEFAULT NULL",
        'fipsCode': "CHAR(2) DEFAULT NULL",
        'isoNumeric': "CHAR(4) DEFAULT NULL",
        'north': "VARCHAR(30) DEFAULT NULL",
        'south': "VARCHAR(30) DEFAULT NULL",
        'east': "VARCHAR(30) DEFAULT NULL",
        'west': "VARCHAR(30) DEFAULT NULL",
        'capital': "VARCHAR(30) DEFAULT NULL",
        'continentName': "VARCHAR(15) DEFAULT NULL",
        'continent': "CHAR(2) DEFAULT NULL",
        'areaInSqKm': "VARCHAR(20) DEFAULT NULL",
        'isoAlpha3': "CHAR(3) DEFAULT NULL",
        'geonameId': "INTEGER DEFAULT NULL"
    };

    // Schema for the country-language link table
    const languageLinkSchema = {
        'countryCode': "CHAR(3) NOT NULL",
        'languages': "VARCHAR(10) NOT NULL",
    };

    /**
     * Toggles the visibility of the example code block.
     * @param {Event} evt - The click event object.
     */
    $('#exampleCodeToggle').on('click', function (evt) {
        evt.preventDefault();
        const codeDisplay = $('#codeDisplayArea');
        if (codeDisplay.is(':visible')) {
            codeDisplay.slideUp(200); // Smoothly hide
        } else {
            codeDisplay.slideDown(200); // Smoothly show
        }
        console.info('Example code visibility toggled.');
    });

    /**
     * Ensures at least one data option is always selected.
     * If all options would be deselected, it re-selects the current one.
     */
    $('.dataOptionSelector').on('change', function () {
        const checkedOptions = $('.dataOptionSelector:checked').length;
        if (checkedOptions < 1) {
            $(this).prop('checked', true); // Re-check the current option
            console.warn('At least one data attribute must remain selected.');
        }
    });

    /**
     * Automatically selects the 'languages' option if database lookup is enabled.
     */
    $('#enableDbLookup').on('click', function () {
        const isDbLookupEnabled = $(this).is(':checked');
        if (isDbLookupEnabled) {
            $('.dataOptionSelector[value="languages"]').prop('checked', true);
            console.log('Database lookup enabled, "languages" attribute automatically selected.');
        }
    });

    /**
     * Handles the generation button click event.
     * Gathers user selections, fetches data, and initiates code generation.
     */
    $('#generateOutputBtn').on('click', function () {
        console.log('Generate button clicked. Processing user selections...');
        extractedDataEntries = []; // Clear previous data
        selectedAttributes = []; // Clear previous options

        // Collect selected data attributes
        $('.dataOptionSelector:checked').each(function () {
            selectedAttributes.push($(this).val());
        });

        // Ensure 'languages' is included if DB lookup is active, regardless of explicit selection
        if ($('#enableDbLookup').is(':checked') && !selectedAttributes.includes('languages')) {
            selectedAttributes.push('languages');
            console.info('"languages" attribute added due to database lookup being active.');
        }

        // Determine the output format
        $('.outputFormatSelector:checked').each(function () {
            generationConfig.outputFormat = $(this).val();
        });

        // Set the database lookup flag
        generationConfig.enableDatabaseLookup = $('#dbLookupToggle').is(':checked');

        // Basic validation: ensure at least one attribute is selected
        if (selectedAttributes.length === 0) {
            alert('Please select at least one data attribute to generate code.');
            console.error('No attributes selected for code generation.');
            return;
        }

        console.log('Configuration:', generationConfig);
        console.log('Selected Attributes:', selectedAttributes);

        // Initiate data retrieval
        retrieveCountryData();
    });

    /**
     * Automatically selects the content of the generated code area on focus.
     */
    $("#resultCodeOutput").on('focus', function () {
        const $outputArea = $(this);
        $outputArea.select(); // Select all text

        // Prevent deselection on mouseup within the element
        $outputArea.one('mouseup', function (e) {
            e.preventDefault();
        });
        console.debug('Code output area focused and content selected.');
    });

    /**
     * Fetches country data from the GeoNames API.
     * Populates `extractedDataEntries` upon successful retrieval.
     */
    const retrieveCountryData = function () {
        console.log('Fetching country data from GeoNames API...');
        const apiEndpoint = "https://api.geonames.org/countryInfoJSON?username=dperic";

        $.getJSON(apiEndpoint)
            .done(function (apiResponse) {
                if (!apiResponse || !apiResponse.geonames || apiResponse.geonames.length === 0) {
                    console.warn('API returned no country data.');
                    alert('Could not retrieve country data. Please check the API status or your internet connection.');
                    return;
                }

                extractedDataEntries = apiResponse.geonames.map(countryEntry => {
                    const mappedValue = {};
                    selectedAttributes.forEach(attributeKey => {
                        mappedValue[attributeKey] = countryEntry[attributeKey];
                    });
                    return mappedValue;
                });
                console.log(`Successfully fetched ${extractedDataEntries.length} country entries.`);
                constructOutputCode(); // Proceed to code generation
            })
            .fail(function (jqXHR, textStatus, errorThrown) {
                console.error('Failed to fetch country data:', textStatus, errorThrown, jqXHR);
                alert('Error fetching country data. Please try again later.');
            });
    };

    /**
     * Removes duplicate values from an array.
     * @param {Array<any>} sourceArray - The array to deduplicate.
     * @returns {Array<any>} A new array with unique elements.
     */
    const deduplicateArrayItems = function (sourceArray) {
        if (!Array.isArray(sourceArray) || sourceArray.length === 0) {
            return [];
        }
        return Array.from(new Set(sourceArray));
    };

    /**
     * Escapes a string for safe use in SQL queries.
     * Handles both single quotes and null values.
     * @param {string|number|null|undefined} inputVal - The value to escape.
     * @param {string} dbType - Type of database ('mysql' or 'firebird') for specific escaping rules.
     * @returns {string} The escaped string, wrapped in single quotes if string, or 'NULL'.
     */
    const safeQuoteSQL = function (inputVal, dbType = 'mysql') {
        if (inputVal === null || inputVal === undefined) {
            return 'NULL';
        }
        if (typeof inputVal === 'number') {
            return String(inputVal);
        }
        let escapedVal = String(inputVal);
        if (dbType === 'mysql') {
            escapedVal = escapedVal.replace(/'/g, "\\'"); // Escape single quotes for MySQL
        } else if (dbType === 'firebird') {
            escapedVal = escapedVal.replace(/'/g, "''"); // Escape single quotes for Firebird
        }
        return `'${escapedVal}'`;
    };

    /**
     * Generates SQL INSERT statements for the country-language link table.
     * @param {number} countryIndex - The index of the country entry in `extractedDataEntries`.
     * @param {string} dbEngineType - The type of database engine (e.g., 'mysql', 'firebird').
     * @returns {string} SQL INSERT statements for languages.
     */
    const produceLanguageLinkSQL = function (countryIndex, dbEngineType) {
        let languageSqlOutput = '';
        const currentCountryData = extractedDataEntries[countryIndex];

        if (!currentCountryData || !currentCountryData.languages) {
            console.warn(`No language data found for country at index ${countryIndex}.`);
            return '';
        }

        // Split languages, trim whitespace, filter out empty strings, and deduplicate
        const distinctLanguages = deduplicateArrayItems(
            currentCountryData.languages.split(',').map(lang => lang.trim()).filter(lang => lang !== '')
        );

        if (distinctLanguages.length === 0) {
            return '';
        }

        const linkTableColumns = Object.keys(languageLinkSchema);
        const columnNamesQuoted = linkTableColumns.map(col => dbEngineType === 'mysql' ? `\`${col}\`` : col).join(', ');

        distinctLanguages.forEach(langValue => {
            let valuesPart = [];
            linkTableColumns.forEach(columnKey => {
                if (columnKey === 'languages') {
                    valuesPart.push(safeQuoteSQL(langValue, dbEngineType));
                } else {
                    valuesPart.push(safeQuoteSQL(currentCountryData[columnKey], dbEngineType));
                }
            });
            languageSqlOutput += `INSERT INTO country_lang_lnk (${columnNamesQuoted}) VALUES (${valuesPart.join(', ')}); \n`;
        });

        return languageSqlOutput;
    };

    /**
     * Main function to construct the final output code based on selected format.
     */
    const constructOutputCode = function () {
        console.log('Constructing output code...');
        let finalCode = "";

        if (extractedDataEntries.length === 0) {
            finalCode = "// No country data available to generate code.";
            $('#resultCodeOutput').text(finalCode);
            console.warn('No data to generate code from.');
            return;
        }

        const attributeCount = selectedAttributes.length;
        const entryCount = extractedDataEntries.length;

        // Helper for common SQL column definition generation
        const buildSqlColumnDefs = (schemaDef, prefix = '`', suffix = '`') => {
            return selectedAttributes.map(attr => {
                const schemaEntry = schemaDef[attr];
                if (schemaEntry) {
                    return `\t${prefix}${attr}${suffix} ${schemaEntry}`;
                }
                return null; // Skip attributes not in schema
            }).filter(Boolean).join(',\n');
        };

        // Helper for common SQL insert column names
        const buildSqlInsertColumns = (excludeLanguages = false, prefix = '`', suffix = '`') => {
            return selectedAttributes
                .filter(attr => !(excludeLanguages && attr === 'languages'))
                .map(attr => `${prefix}${attr}${suffix}`)
                .join(', ');
        };

        // Helper for common SQL insert values for a single entry
        const buildSqlInsertValues = (countryData, dbEngineType, excludeLanguages = false) => {
            return selectedAttributes
                .filter(attr => !(excludeLanguages && attr === 'languages'))
                .map(attr => safeQuoteSQL(countryData[attr], dbEngineType))
                .join(', ');
        };

        switch (generationConfig.outputFormat) {
            case "mysqltype":
                {
                    console.log('Generating MySQL code...');
                    let mysqlSql = "";
                    const mainTableName = "`countries`";
                    const linkTableName = "`country_lang_lnk`";

                    // --- CREATE TABLE for main countries table ---
                    mysqlSql += `CREATE TABLE IF NOT EXISTS ${mainTableName} (\n\t\`idCountry\` INT(5) NOT NULL AUTO_INCREMENT,\n`;
                    if (!generationConfig.enableDatabaseLookup) {
                        mysqlSql += buildSqlColumnDefs(mysqlSchemaDefinitions, '`', '`');
                    } else {
                        mysqlSql += buildSqlColumnDefs(firebirdLookupMainSchema, '`', '`');
                    }
                    mysqlSql += `,\n\tPRIMARY KEY (\`idCountry\`)\n) ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=0;\n\n`;

                    // --- CREATE TABLE for country_lang_lnk if dblookup is enabled ---
                    if (generationConfig.enableDatabaseLookup) {
                        const langLinkColumns = Object.keys(languageLinkSchema);
                        const langLinkColumnDefs = langLinkColumns.map(col => `\t\`${col}\` ${languageLinkSchema[col]}`).join(',\n');
                        mysqlSql += `CREATE TABLE IF NOT EXISTS ${linkTableName} (\n${langLinkColumnDefs},\n\tPRIMARY KEY (\`countryCode\`,\`languages\`)\n) ENGINE=MyISAM DEFAULT CHARSET=utf8;\n\n`;
                    }

                    // --- INSERT INTO for main countries table ---
                    const insertColumns = buildSqlInsertColumns(generationConfig.enableDatabaseLookup, '`', '`');
                    mysqlSql += `INSERT INTO ${mainTableName} (${insertColumns}) VALUES\n`;
                    const insertValueRows = extractedDataEntries.map(entry => {
                        return `(${buildSqlInsertValues(entry, 'mysql', generationConfig.enableDatabaseLookup)})`;
                    });
                    mysqlSql += insertValueRows.join(',\n');
                    mysqlSql += ';\n';

                    // --- INSERT INTO for country_lang_lnk if dblookup is enabled ---
                    if (generationConfig.enableDatabaseLookup) {
                        mysqlSql += "\n";
                        extractedDataEntries.forEach((entry, index) => {
                            mysqlSql += produceLanguageLinkSQL(index, 'mysql');
                        });
                    }
                    finalCode = mysqlSql;
                    break;
                }
            case "xmltype":
                {
                    console.log('Generating XML code...');
                    let xmlOutput = "<countries>\n";
                    extractedDataEntries.forEach(countryEntry => {
                        let attributes = selectedAttributes
                            .map(attr => `${attr}="${countryEntry[attr] || ''}"`)
                            .join(' ');
                        xmlOutput += `\t<country ${attributes} />\n`;
                    });
                    xmlOutput += "</countries>";
                    finalCode = xmlOutput;
                    break;
                }
            case "jsontype":
                {
                    console.log('Generating JSON code...');
                    // Using JSON.stringify for robust JSON generation
                    const jsonObject = {
                        countries: {
                            country: extractedDataEntries.map(entry => {
                                const countryObj = {};
                                selectedAttributes.forEach(attr => {
                                    countryObj[attr] = entry[attr];
                                });
                                return countryObj;
                            })
                        }
                    };
                    finalCode = JSON.stringify(jsonObject, null, 4); // Pretty print with 4 spaces
                    break;
                }
            case "firebirdtype":
                {
                    console.log('Generating Firebird SQL code...');
                    let firebirdSql = "";
                    const mainTableName = "countries";
                    const linkTableName = "country_lang_lnk";

                    // --- CREATE TABLE for main countries table ---
                    firebirdSql += `CREATE TABLE ${mainTableName} (\n`;
                    if (!generationConfig.enableDatabaseLookup) {
                        firebirdSql += buildSqlColumnDefs(firebirdSchemaDefinitions, '', '');
                    } else {
                        firebirdSql += buildSqlColumnDefs(firebirdLookupMainSchema, '', '');
                    }
                    firebirdSql += `,\n\tPRIMARY KEY (countryCode)\n);\n\n`;

                    // --- CREATE TABLE for country_lang_lnk if dblookup is enabled ---
                    if (generationConfig.enableDatabaseLookup) {
                        const langLinkColumns = Object.keys(languageLinkSchema);
                        const langLinkColumnDefs = langLinkColumns.map(col => `\t${col} ${languageLinkSchema[col]}`).join(',\n');
                        firebirdSql += `CREATE TABLE ${linkTableName} (\n${langLinkColumnDefs},\n\tPRIMARY KEY (countryCode,languages)\n);\n\n`;
                    }

                    // --- INSERT INTO for main countries table (row by row for Firebird) ---
                    extractedDataEntries.forEach((entry, index) => {
                        const insertColumns = buildSqlInsertColumns(generationConfig.enableDatabaseLookup, '', '');
                        const insertValues = buildSqlInsertValues(entry, 'firebird', generationConfig.enableDatabaseLookup);
                        firebirdSql += `INSERT INTO ${mainTableName} (${insertColumns}) VALUES (${insertValues});\n`;

                        // --- INSERT INTO for country_lang_lnk if dblookup is enabled ---
                        if (generationConfig.enableDatabaseLookup) {
                            firebirdSql += produceLanguageLinkSQL(index, 'firebird');
                        }
                    });

                    finalCode = firebirdSql;
                    break;
                }
            case "csvtype":
                {
                    console.log('Generating CSV code...');
                    let csvOutput = "";

                    // CSV Header Row
                    csvOutput += selectedAttributes.map(attr => `"${String(attr).replace(/"/g, '""')}"`).join(',');
                    csvOutput += "\n";

                    // CSV Data Rows
                    extractedDataEntries.forEach(countryEntry => {
                        const rowValues = selectedAttributes.map(attr => {
                            const value = countryEntry[attr];
                            // Handle null/undefined, escape quotes, and ensure string type
                            let formattedValue = (value === null || value === undefined) ? '' : String(value);
                            formattedValue = formattedValue.replace(/"/g, '""'); // Escape double quotes
                            return `"${formattedValue}"`;
                        });
                        csvOutput += rowValues.join(',');
                        csvOutput += "\n";
                    });
                    finalCode = csvOutput;
                    break;
                }
            default:
                console.error(`Unknown output format: ${generationConfig.outputFormat}`);
                finalCode = `// Error: Unknown output format "${generationConfig.outputFormat}" selected.`;
                break;
        }

        $('#resultCodeOutput').text(finalCode.trim()); // Trim any leading/trailing whitespace
        console.log('Code generation complete.');
    };

})(jQuery); // Pass jQuery as an argument to the immediately invoked function expression (IIFE)