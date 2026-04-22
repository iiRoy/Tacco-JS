jQuery(document).ready(function () {

    // Array to hold all processed data records
    var entityPayloads = [];

    // Array to store selected data attributes
    var propertyChoices = [];

    // Application configuration settings
    var appConfigurations = {
        schemaVariant: "mySqlFormat", // Type of schema/output format
        dataLookupEnabled: false     // Flag for database lookup feature
    };

    // MySQL column definitions for primary table
    var databaseColumnSpecs = {
        'countryCode': "char(2) NOT NULL DEFAULT ''",
        'countryName': "varchar(45) NOT NULL DEFAULT ''",
        'currencyCode': "char(3) DEFAULT NULL",
        'population': "varchar(20) DEFAULT NULL",
        'fipsCode': "char(2) DEFAULT NULL",
        'isoNumeric': "char(4) DEFAULT NULL",
        'north': "varchar(30) DEFAULT NULL",
        'south': "varchar(30) DEFAULT NULL",
        'east': "varchar(30) DEFAULT NULL",
        'west': "varchar(30) DEFAULT NULL",
        'capital': "varchar(30) DEFAULT NULL",
        'continentName': "varchar(15) DEFAULT NULL",
        'continent': "char(2) DEFAULT NULL",
        'areaInSqKm': "varchar(20) DEFAULT NULL",
        'languages': "varchar(100) DEFAULT NULL",
        'isoAlpha3': "char(3) DEFAULT NULL",
        'geonameId': "int(10) DEFAULT NULL"
    };

    // Firebird column definitions for main table
    var fbColumnDefinitions = {
        'countryCode': "char(3) NOT NULL",
        'countryName': "varchar(45) NOT NULL",
        'currencyCode': "char(3) DEFAULT NULL",
        'population': "varchar(20) DEFAULT NULL",
        'fipsCode': "char(2) DEFAULT NULL",
        'isoNumeric': "char(4) DEFAULT NULL",
        'north': "varchar(30) DEFAULT NULL",
        'south': "varchar(30) DEFAULT NULL",
        'east': "varchar(30) DEFAULT NULL",
        'west': "varchar(30) DEFAULT NULL",
        'capital': "varchar(30) DEFAULT NULL",
        'continentName': "varchar(15) DEFAULT NULL",
        'continent': "char(2) DEFAULT NULL",
        'areaInSqKm': "varchar(20) DEFAULT NULL",
        'languages': "varchar(100) DEFAULT NULL",
        'isoAlpha3': "char(3) DEFAULT NULL",
        'geonameId': "integer DEFAULT NULL"
    };

    // Firebird column definitions for lookup table
    var lookupFbColumnDefs = {
        'countryCode': "char(3) NOT NULL",
        'countryName': "varchar(45) NOT NULL",
        'currencyCode': "char(3) DEFAULT NULL",
        'population': "varchar(20) DEFAULT NULL",
        'fipsCode': "char(2) DEFAULT NULL",
        'isoNumeric': "char(4) DEFAULT NULL",
        'north': "varchar(30) DEFAULT NULL",
        'south': "varchar(30) DEFAULT NULL",
        'east': "varchar(30) DEFAULT NULL",
        'west': "varchar(30) DEFAULT NULL",
        'capital': "varchar(30) DEFAULT NULL",
        'continentName': "varchar(15) DEFAULT NULL",
        'continent': "char(2) DEFAULT NULL",
        'areaInSqKm': "varchar(20) DEFAULT NULL",
        'isoAlpha3': "char(3) DEFAULT NULL",
        'geonameId': "integer DEFAULT NULL"
    };

    // Schema for the language lookup table
    var langLinkDefinitions = {
        'countryCode': "char(3) NOT NULL",
        'languages': "varchar(10) NOT NULL",
    };


    // Event listener for showing/hiding the code example
    $('#displayCodeSnippetBtn').on('click', function (eventObj) {
        eventObj.preventDefault(); // Prevent default link behavior
        $('#codeDisplayArea').toggle();
    });


    // Ensure at least one option is always selected
    $('.dataSelectionOptions').change(function () {
        if ($('.dataSelectionOptions:checked').length < 1) {
            $(this).prop('checked', true); // Re-check the current checkbox
        }
    });


    // Handle the data lookup toggle
    $('#dataLookupToggle').on('click', function (clickEvent) {
        if ($('#dataLookupToggle').is(':checked')) {
            // If data lookup is enabled, 'languages' option must be selected
            $('.dataSelectionOptions[value=languages]').prop('checked', true);
        }
    });


    // Main function to generate code based on selections
    $('#generateOutputBtn').on('click', function () {

        entityPayloads = []; // Clear previous data
        propertyChoices = []; // Clear previous choices

        // Collect all selected data attributes
        $('.dataSelectionOptions').each(function () {
            var $currentElement = $(this);
            if ($currentElement.is(':checked')) {
                propertyChoices.push($currentElement.val());
            }
        });

        // If data lookup is active and languages wasn't chosen, add it
        if ($('#dataLookupToggle').is(':checked')) {
            if (!$('.dataSelectionOptions[value=languages]').is(':checked')) {
                propertyChoices.push('languages');
            }
        }

        // Determine the output schema type
        $('.outputFormatSelection').each(function () {
            var $currentElement = $(this);
            if ($currentElement.is(':checked'))
                appConfigurations.schemaVariant = $currentElement.val();
        });

        // Set the data lookup configuration
        $('.lookupConfiguration').each(function () {
            var $currentElement = $(this);
            appConfigurations.dataLookupEnabled = $currentElement.is(':checked');
        });

        // Fetch country information and then generate the script
        retrieveCountryInformation();
    });


    // Auto-select text in the generated code area on focus
    $("#outputResultArea").focus(function () {
        var $focusedElement = $(this);
        $focusedElement.select(); // Select all text

        $focusedElement.one("mouseup", function () { // Unbind mouseup after one execution
            return false; // Prevent re-selection on mouseup
        });
    });


    // Fetches country data from a remote API
    var retrieveCountryInformation = function () {
        $.getJSON("http://api.geonames.org/countryInfoJSON?username=dperic", function (responseData) {
            for (var idx = 0; idx < responseData.geonames.length; idx++) {
                var numChoices = propertyChoices.length;
                var currentRecord = {};

                for (var attrIdx = 0; attrIdx < numChoices; attrIdx++) {
                    var currentAttribute = propertyChoices[attrIdx];
                    currentRecord[currentAttribute] = responseData.geonames[idx][currentAttribute];
                }
                entityPayloads.push(currentRecord);
            }
            constructDataScripts(); // Proceed to script generation
        });
    };


    // Helper function to get unique values from an array
    var getUniqueValues = function (inputArray) {
        return inputArray.reduce(function (accumulator, currentItem) {
            if (accumulator.indexOf(currentItem) < 0) accumulator.push(currentItem);
            return accumulator;
        }, []);
    };


    // Generates SQL statements for language lookup table
    var buildLookupInsertions = function (recordIndex) {
        /*
         * This function iterates through language values for a single country
         * and constructs INSERT statements for the geo_language_link table.
         */
        var tempSqlSnippet = '';
        var languageValues = getUniqueValues(entityPayloads[recordIndex]['languages'].split(","));

        for (var langKey in languageValues) { // Iterate for each distinct language
            if (languageValues[langKey] === '') {
                continue; // Skip empty language entries
            }

            tempSqlSnippet += "INSERT INTO geo_language_link (";

            for (var fieldIdentifier in langLinkDefinitions) {
                if (appConfigurations.schemaVariant === "mySqlFormat") {
                    tempSqlSnippet += " `" + fieldIdentifier + "`, ";
                } else {
                    tempSqlSnippet += " " + fieldIdentifier + ", ";
                }
            }
            tempSqlSnippet = tempSqlSnippet.slice(0, tempSqlSnippet.length - 2); // Remove trailing comma and space
            tempSqlSnippet += ") VALUES";
            tempSqlSnippet += " (";

            for (var fieldIdentifier in langLinkDefinitions) {
                var currentFieldValue;
                if (fieldIdentifier === 'languages') {
                    currentFieldValue = languageValues[langKey];
                } else {
                    currentFieldValue = entityPayloads[recordIndex][fieldIdentifier];
                }

                if (typeof currentFieldValue === "string")
                    tempSqlSnippet += "'" + currentFieldValue + "', ";
                else if (typeof currentFieldValue === "number")
                    tempSqlSnippet += "" + currentFieldValue + ", ";
            }
            tempSqlSnippet = tempSqlSnippet.slice(0, tempSqlSnippet.length - 2); // Remove trailing comma and space
            tempSqlSnippet += "); \n";
        } // End of language value iteration
        return tempSqlSnippet;
    };


    // Orchestrates the generation of the final output script
    var constructDataScripts = function () {
        var numOptions = propertyChoices.length;
        var numRecords = entityPayloads.length;
        var finalSqlScript = "";
        var xmlOutputString = "";
        var jsonOutputString = "";
        var csvOutputString = "";

        if (appConfigurations.schemaVariant === "mySqlFormat") {
            // Generate MySQL CREATE TABLE statement
            finalSqlScript = "CREATE TABLE IF NOT EXISTS `geographical_entities` (" +
                "\n\t`entity_id` BIGINT(10) NOT NULL AUTO_INCREMENT,"; // Changed data type and name

            if (!appConfigurations.dataLookupEnabled) {
                for (var index = 0; index < numOptions; index++) {
                    var currentField = propertyChoices[index];
                    finalSqlScript += "\n\t`" + propertyChoices[index] + "` " + databaseColumnSpecs[propertyChoices[index]] + ",";
                }
                finalSqlScript += "\n\tPRIMARY KEY (`entity_id`)";
                finalSqlScript += "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1000;\n\n"; // Changed engine, charset, and auto_increment start
            } else {
                for (var index = 0; index < numOptions; index++) {
                    var currentField = propertyChoices[index];
                    if (currentField !== 'languages') {
                        finalSqlScript += "\n\t`" + propertyChoices[index] + "` " + lookupFbColumnDefs[propertyChoices[index]] + ",";
                    }
                }
                finalSqlScript += "\n\tPRIMARY KEY (`entity_id`)";
                finalSqlScript += "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 AUTO_INCREMENT=1000;\n\n";

                // Create table for language links
                finalSqlScript += "CREATE TABLE IF NOT EXISTS `geo_language_link` (";
                for (var index = 0; index < numOptions; index++) {
                    if (langLinkDefinitions[propertyChoices[index]] !== undefined) {
                        finalSqlScript += "\n\t`" + propertyChoices[index] + "` " + langLinkDefinitions[propertyChoices[index]] + ",";
                    }
                }
                finalSqlScript += "\n\tPRIMARY KEY (`countryCode`,`languages`)";
                finalSqlScript += "\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;\n\n";
            }

            // Generate MySQL INSERT INTO statements
            finalSqlScript += "INSERT INTO `geographical_entities` (";
            for (var index = 0; index < numOptions; index++) {
                if (appConfigurations.dataLookupEnabled && (propertyChoices[index] === 'languages')) {
                    continue;
                }
                finalSqlScript += "`" + propertyChoices[index] + "`, ";
            }
            finalSqlScript = finalSqlScript.slice(0, finalSqlScript.length - 2); // Remove trailing comma and space
            finalSqlScript += ") VALUES";

            for (var index = 0; index < numRecords; index++) {
                finalSqlScript += "\n(";
                for (var j_idx = 0; j_idx < numOptions; j_idx++) {
                    if (appConfigurations.dataLookupEnabled && (propertyChoices[j_idx] === 'languages')) {
                        continue;
                    }
                    var currentDataValue = entityPayloads[index][propertyChoices[j_idx]];
                    if (typeof currentDataValue === "string")
                        finalSqlScript += "'" + currentDataValue.replaceAll("'", "''") + "', "; // Changed escape sequence
                    else if (typeof currentDataValue === "number")
                        finalSqlScript += "" + currentDataValue + ", ";
                }
                finalSqlScript = finalSqlScript.slice(0, finalSqlScript.length - 2); // Remove trailing comma and space
                finalSqlScript += "),";
            }
            finalSqlScript = finalSqlScript.slice(0, finalSqlScript.length - 1); // Remove trailing comma

            if (appConfigurations.dataLookupEnabled) {
                finalSqlScript += ";\n";
                for (var index = 0; index < numRecords; index++) {
                    finalSqlScript += buildLookupInsertions(index);
                }
            }

            // Display the generated SQL code
            $('#outputResultArea').text(finalSqlScript);

        } else if (appConfigurations.schemaVariant === "xmlFormat") {
            xmlOutputString += "<geoentities>"; // Changed root element name
            for (var index = 0; index < numRecords; index++) {
                xmlOutputString += "\n\t<entity"; // Changed element name
                for (var j_idx = 0; j_idx < numOptions; j_idx++) {
                    var currentOptionName = propertyChoices[j_idx];
                    var currentOptionValue = entityPayloads[index][propertyChoices[j_idx]];
                    xmlOutputString += " " + currentOptionName + "=\"" + currentOptionValue + "\"";
                }
                xmlOutputString += " />";
            }
            xmlOutputString += "\n</geoentities>";

            // Display the generated XML
            $('#outputResultArea').text(xmlOutputString);

        } else if (appConfigurations.schemaVariant === "jsonFormat") {
            jsonOutputString += "{";
            jsonOutputString += "\n\t\"geoEntities\": {"; // Changed property name
            jsonOutputString += "\n\t\t\"entity\": ["; // Changed property name
            for (var index = 0; index < numRecords; index++) {
                jsonOutputString += "\n\t\t\t{";
                for (var j_idx = 0; j_idx < numOptions; j_idx++) {
                    var currentOptionName = propertyChoices[j_idx];
                    var currentOptionValue = entityPayloads[index][propertyChoices[j_idx]];

                    if (j_idx === (numOptions - 1)) {
                        jsonOutputString += "\n\t\t\t\t\"" + currentOptionName + "\": \"" + currentOptionValue + "\"";
                    } else {
                        jsonOutputString += "\n\t\t\t\t\"" + currentOptionName + "\": \"" + currentOptionValue + "\",";
                    }
                }
                if (index === (numRecords - 1)) {
                    jsonOutputString += "\n\t\t\t}";
                } else {
                    jsonOutputString += "\n\t\t\t},";
                }
            }
            jsonOutputString += "\n\t\t]";
            jsonOutputString += "\n\t}";
            jsonOutputString += "\n}";

            // Display the generated JSON
            $('#outputResultArea').text(jsonOutputString);

        } else if (appConfigurations.schemaVariant === "firebirdFormat") {
            // Generate Firebird CREATE TABLE statement
            finalSqlScript = "CREATE TABLE geo_entities ("; // Changed table name
            if (!appConfigurations.dataLookupEnabled) {
                for (var index = 0; index < numOptions; index++) {
                    var currentField = propertyChoices[index];
                    finalSqlScript += "\n\t " + propertyChoices[index] + " " + fbColumnDefinitions[propertyChoices[index]] + ",";
                }
                finalSqlScript += "\n\tPRIMARY KEY (countryCode)";
                finalSqlScript += "\n);\n\n";
            } else {
                for (var index = 0; index < numOptions; index++) {
                    var currentField = propertyChoices[index];
                    if (currentField !== 'languages') {
                        finalSqlScript += "\n\t " + propertyChoices[index] + " " + lookupFbColumnDefs[propertyChoices[index]] + ",";
                    }
                }
                finalSqlScript += "\n\tPRIMARY KEY (countryCode)";
                finalSqlScript += "\n);\n\n";

                finalSqlScript += "CREATE TABLE geo_language_link ("; // Changed table name
                for (var index = 0; index < numOptions; index++) {
                    if (langLinkDefinitions[propertyChoices[index]] !== undefined) {
                        finalSqlScript += "\n\t " + propertyChoices[index] + " " + langLinkDefinitions[propertyChoices[index]] + ",";
                    }
                }
                finalSqlScript += "\n\tPRIMARY KEY (countryCode,languages)";
                finalSqlScript += "\n);\n\n";
            }

            for (var index = 0; index < numRecords; index++) {
                // Generate Firebird INSERT INTO statements
                finalSqlScript += "INSERT INTO geo_entities ("; // Changed table name
                for (var it_idx = 0; it_idx < numOptions; it_idx++) {
                    if (appConfigurations.dataLookupEnabled && (propertyChoices[it_idx] === 'languages')) {
                        continue;
                    }
                    finalSqlScript += " " + propertyChoices[it_idx] + ", ";
                }
                finalSqlScript = finalSqlScript.slice(0, finalSqlScript.length - 2); // Remove trailing comma and space
                finalSqlScript += ") VALUES";

                finalSqlScript += " (";
                for (var j_idx = 0; j_idx < numOptions; j_idx++) {
                    var currentDataValue = entityPayloads[index][propertyChoices[j_idx]];
                    if (appConfigurations.dataLookupEnabled && (propertyChoices[j_idx] === 'languages')) {
                        continue;
                    }

                    if (typeof currentDataValue === "string")
                        finalSqlScript += "'" + currentDataValue.replace(/'/g, "''") + "', "; // Changed escape method
                    else if (typeof currentDataValue === "number")
                        finalSqlScript += "" + currentDataValue + ", ";
                }
                finalSqlScript = finalSqlScript.slice(0, finalSqlScript.length - 2); // Remove trailing comma and space
                finalSqlScript += "); \n";
                if (appConfigurations.dataLookupEnabled) {
                    finalSqlScript += buildLookupInsertions(index);
                }
            }
            finalSqlScript = finalSqlScript.slice(0, finalSqlScript.length - 1); // Remove trailing newline

            // Display the generated Firebird SQL
            $('#outputResultArea').text(finalSqlScript);

        } else if (appConfigurations.schemaVariant === "csvFormat") {
            csvOutputString = "";
            // Add CSV header row
            for (var j_idx = 0; j_idx < numOptions; j_idx++) {
                var currentOptionName = propertyChoices[j_idx];
                csvOutputString += "\"" + currentOptionName + "\",";
            }
            csvOutputString = csvOutputString.slice(0, csvOutputString.length - 1); // Remove trailing comma
            csvOutputString += "\n";

            // Add CSV data rows
            for (var index = 0; index < numRecords; index++) {
                for (var j_idx = 0; j_idx < numOptions; j_idx++) {
                    var currentDataValue = entityPayloads[index][propertyChoices[j_idx]];
                    csvOutputString += "\"" + currentDataValue + "\",";
                }
                csvOutputString = csvOutputString.slice(0, csvOutputString.length - 1); // Remove trailing comma
                csvOutputString += "\n";
            }

            // Display the generated CSV
            $('#outputResultArea').text(csvOutputString);
        }
    };
});