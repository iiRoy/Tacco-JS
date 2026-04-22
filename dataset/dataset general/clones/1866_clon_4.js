const globalConfigurationCatalog = {
    standardFieldDefinitions: {
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
    },
    firebirdFieldDefinitions: {
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
    },  
    mainTableLookupDefinitions: { // Corresponds to columnsAttrLookupFB
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
    },  
    languageLinkDefinitions: { // Corresponds to columnsAttrLookupLang
        'countryCode': "char(3) NOT NULL", 
        'languages': "varchar(10) NOT NULL",
    }       
};

const applicationState = {
    gatheredGeographicEntities: [],
    chosenDataFields: [],
    generationParameters: {
        resultFormat: "mysqltype",
        enableLanguageLinking: false
    }
};

const textProcessor = {
    getDistinctElements: (collection) => [...new Set(collection)],
    escapeSQLIdentifier: (identifier, dbType) => dbType === "mysql" ? `\`${identifier}\`` : identifier,
    escapeSQLValue: (value, dbType) => {
        if (value === null || value === undefined) return "NULL";
        if (typeof value === "string") {
            let escaped = value;
            if (dbType === "firebird") {
                escaped = escaped.replace(/'/g, "x27x27"); // Mimic original's Firebird escaping
            } else { // mysql
                escaped = escaped.replace(/'/g, "\\'");
            }
            return `'${escaped}'`;
        }
        return String(value);
    },
    escapeXMLAttributeValue: (value) => {
        return String(value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&apos;');
    },
    escapeCSVCell: (value) => {
        const val = String(value);
        return `"${val.replace(/"/g, '""')}"`; // Always quotes, escapes internal quotes
    }
};

const remoteDataService = {
    fetchEntityData: async () => {
        const sourceURL = "http://api.geonames.org/countryInfoJSON?username=dperic";
        try {
            const response = await fetch(sourceURL);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const data = await response.json();
            applicationState.gatheredGeographicEntities = data.geonames.map(entity => {
                const filteredEntity = {};
                applicationState.chosenDataFields.forEach(field => {
                    filteredEntity[field] = entity[field];
                });
                return filteredEntity;
            });
            outputProducer.createOutput();
        } catch (error) {
            console.error("Error fetching geographic data:", error);
            document.getElementById('displayOutputArea').textContent = `Data fetch failed: ${error.message}`;
        }
    }
};

const outputProducer = {
    createOutput: () => {
        const currentFormat = applicationState.generationParameters.resultFormat;
        const generationMap = {
            "mysqltype": outputProducer.generateMySQLStatements,
            "xmltype": outputProducer.generateXMLStructure,
            "jsontype": outputProducer.generateJSONStructure,
            "firebirdtype": outputProducer.generateFirebirdStatements,
            "csvtype": outputProducer.generateCSVData
        };

        const producedText = generationMap[currentFormat]();
        document.getElementById('displayOutputArea').textContent = producedText;
    },

    generateMySQLStatements: () => {
        const entities = applicationState.gatheredGeographicEntities;
        const fields = applicationState.chosenDataFields;
        const enableLangLinking = applicationState.generationParameters.enableLanguageLinking;
        const stdDefs = globalConfigurationCatalog.standardFieldDefinitions;
        const mainLookupDefs = globalConfigurationCatalog.mainTableLookupDefinitions;
        const langLinkDefs = globalConfigurationCatalog.languageLinkDefinitions;

        let outputLines = [];

        // Main countries table creation
        outputLines.push("CREATE TABLE IF NOT EXISTS `countries` (");
        outputLines.push("\t`idCountry` int(5) NOT NULL AUTO_INCREMENT,");

        const mainTableFields = enableLangLinking
            ? fields.filter(f => f !== 'languages')
            : fields;

        const columnDefinitions = mainTableFields.map(field => {
            const definition = enableLangLinking && mainLookupDefs[field]
                ? mainLookupDefs[field]
                : stdDefs[field];
            return `\t\`${field}\` ${definition}`;
        });
        outputLines.push(...columnDefinitions);
        outputLines.push("\tPRIMARY KEY (`idCountry`)");
        outputLines.push(") ENGINE=MyISAM DEFAULT CHARSET=utf8 AUTO_INCREMENT=0;\n");

        // Language link table creation if enabled
        if (enableLangLinking) {
            outputLines.push("CREATE TABLE IF NOT EXISTS `country_lang_lnk` (");
            const langLinkColumnDefs = Object.keys(langLinkDefs).map(field =>
                `\t\`${field}\` ${langLinkDefs[field]}`
            );
            outputLines.push(...langLinkColumnDefs);
            outputLines.push("\tPRIMARY KEY (`countryCode`,`languages`)");
            outputLines.push(");\n");
        }

        // Main countries table inserts
        const insertColumns = mainTableFields.map(field => textProcessor.escapeSQLIdentifier(field, "mysql")).join(', ');
        outputLines.push(`INSERT INTO \`countries\` (${insertColumns}) VALUES`);

        const valueRows = entities.map(entity => {
            const values = mainTableFields.map(field =>
                textProcessor.escapeSQLValue(entity[field], "mysql")
            );
            return `(${values.join(', ')})`;
        });
        outputLines.push(valueRows.join(',\n'));
        outputLines.push(";\n");

        // Language link table inserts if enabled
        if (enableLangLinking) {
            entities.forEach(entity => {
                outputLines.push(outputProducer.generateLanguageLinkInserts(entity, "mysql"));
            });
        }

        return outputLines.join('\n');
    },

    generateFirebirdStatements: () => {
        const entities = applicationState.gatheredGeographicEntities;
        const fields = applicationState.chosenDataFields;
        const enableLangLinking = applicationState.generationParameters.enableLanguageLinking;
        const fbDefs = globalConfigurationCatalog.firebirdFieldDefinitions;
        const mainLookupDefs = globalConfigurationCatalog.mainTableLookupDefinitions;
        const langLinkDefs = globalConfigurationCatalog.languageLinkDefinitions;

        let outputLines = [];

        // Main countries table creation
        outputLines.push("CREATE TABLE countries (");

        const mainTableFields = enableLangLinking
            ? fields.filter(f => f !== 'languages')
            : fields;

        const columnDefinitions = mainTableFields.map(field => {
            const definition = enableLangLinking && mainLookupDefs[field]
                ? mainLookupDefs[field]
                : fbDefs[field];
            return `\t${field} ${definition}`;
        });
        outputLines.push(...columnDefinitions);
        outputLines.push("\tPRIMARY KEY (countryCode)");
        outputLines.push(");\n");

        // Language link table creation if enabled
        if (enableLangLinking) {
            outputLines.push("CREATE TABLE country_lang_lnk (");
            const langLinkColumnDefs = Object.keys(langLinkDefs).map(field =>
                `\t${field} ${langLinkDefs[field]}`
            );
            outputLines.push(...langLinkColumnDefs);
            outputLines.push("\tPRIMARY KEY (countryCode,languages)");
            outputLines.push(");\n");
        }

        // Inserts for countries and optionally language links
        entities.forEach(entity => {
            const insertColumns = mainTableFields.map(field => textProcessor.escapeSQLIdentifier(field, "firebird")).join(', ');
            const values = mainTableFields.map(field =>
                textProcessor.escapeSQLValue(entity[field], "firebird")
            );
            outputLines.push(`INSERT INTO countries (${insertColumns}) VALUES (${values.join(', ')});\n`);

            if (enableLangLinking) {
                outputLines.push(outputProducer.generateLanguageLinkInserts(entity, "firebird"));
            }
        });

        return outputLines.join('\n');
    },

    generateLanguageLinkInserts: (entity, dbType) => {
        const langLinkDefs = globalConfigurationCatalog.languageLinkDefinitions;
        const countryCode = entity.countryCode;
        const rawLanguages = entity.languages;

        if (!rawLanguages) return '';

        const uniqueLanguages = textProcessor.getDistinctElements(rawLanguages.split(',')).filter(l => l.trim() !== '');
        let linkStatements = [];

        uniqueLanguages.forEach(lang => {
            const columns = Object.keys(langLinkDefs);
            const quotedCountryCode = textProcessor.escapeSQLValue(countryCode, dbType);
            const quotedLanguage = textProcessor.escapeSQLValue(lang.trim(), dbType);

            const columnNames = columns.map(c => textProcessor.escapeSQLIdentifier(c, dbType)).join(', ');
            const columnValues = columns.map(c => {
                if (c === 'countryCode') return quotedCountryCode;
                if (c === 'languages') return quotedLanguage;
                return 'NULL'; // Fallback, though schema implies these two are always present
            }).join(', ');

            linkStatements.push(`INSERT INTO ${textProcessor.escapeSQLIdentifier('country_lang_lnk', dbType)} (${columnNames}) VALUES (${columnValues});`);
        });
        return linkStatements.join('\n');
    },

    generateXMLStructure: () => {
        const entities = applicationState.gatheredGeographicEntities;
        const fields = applicationState.chosenDataFields;
        let xmlSegments = ['<geographicEntities>'];

        entities.forEach(entity => {
            let attributes = fields.map(field =>
                `${field}="${textProcessor.escapeXMLAttributeValue(entity[field])}"`
            ).join(' ');
            xmlSegments.push(`\t<entity ${attributes} />`);
        });

        xmlSegments.push('</geographicEntities>');
        return xmlSegments.join('\n');
    },

    generateJSONStructure: () => {
        const entities = applicationState.gatheredGeographicEntities;
        const fields = applicationState.chosenDataFields;

        let jsonParts = [];
        jsonParts.push('{');
        jsonParts.push('\t"countries": {'); // Renamed to match original output
        jsonParts.push('\t\t"country": ['); // Renamed to match original output

        entities.forEach((entity, index) => {
            jsonParts.push('\t\t\t{');
            fields.forEach((field, fieldIndex) => {
                const value = String(entity[field]).replace(/"/g, '\\"'); // Basic JSON string value escaping
                const line = `\t\t\t\t"${field}": "${value}"`;
                jsonParts.push(line + (fieldIndex === fields.length - 1 ? '' : ','));
            });
            jsonParts.push('\t\t\t}' + (index === entities.length - 1 ? '' : ','));
        });

        jsonParts.push('\t\t]');
        jsonParts.push('\t}');
        jsonParts.push('}');
        return jsonParts.join('\n');
    },

    generateCSVData: () => {
        const entities = applicationState.gatheredGeographicEntities;
        const fields = applicationState.chosenDataFields;
        let csvRows = [];

        // Header row
        csvRows.push(fields.map(textProcessor.escapeCSVCell).join(','));

        // Data rows
        entities.forEach(entity => {
            csvRows.push(fields.map(field =>
                textProcessor.escapeCSVCell(entity[field])
            ).join(','));
        });

        return csvRows.join('\n');
    }
};

const userInterfaceHandler = {
    initializeDOMListeners: () => {
        document.getElementById('toggleCodeDisplay').addEventListener('click', userInterfaceHandler.toggleCodeVisibility);
        document.querySelectorAll('.dataFieldOption').forEach(checkbox => {
            checkbox.addEventListener('change', userInterfaceHandler.handleFieldOptionChange);
        });
        document.getElementById('languageLinkToggle').addEventListener('click', userInterfaceHandler.handleLanguageLinkToggle);
        document.getElementById('initiateGeneration').addEventListener('click', userInterfaceHandler.processGenerationRequest);
        document.getElementById('displayOutputArea').addEventListener('focus', userInterfaceHandler.selectOutputContent);

        document.querySelectorAll('.outputFormatOption').forEach(radio => {
            if (radio.checked) {
                applicationState.generationParameters.resultFormat = radio.value;
            }
            radio.addEventListener('change', (e) => {
                applicationState.generationParameters.resultFormat = e.target.value;
            });
        });
    },

    toggleCodeVisibility: (e) => {
        e.preventDefault();
        const codeSection = document.getElementById('codeExampleSection');
        codeSection.style.display = codeSection.style.display === 'none' ? '' : 'none';
    },

    handleFieldOptionChange: (e) => {
        const checkedOptions = document.querySelectorAll('.dataFieldOption:checked');
        if (checkedOptions.length < 1) {
            e.target.checked = true; // Ensure at least one is always checked
        }
    },

    handleLanguageLinkToggle: () => {
        const langLinkCheckbox = document.getElementById('languageLinkToggle');
        if (langLinkCheckbox.checked) {
            document.querySelector('.dataFieldOption[value="languages"]').checked = true;
        }
    },

    processGenerationRequest: () => {
        applicationState.chosenDataFields = [];
        document.querySelectorAll('.dataFieldOption:checked').forEach(checkbox => {
            applicationState.chosenDataFields.push(checkbox.value);
        });

        const langLinkCheckbox = document.getElementById('languageLinkToggle');
        applicationState.generationParameters.enableLanguageLinking = langLinkCheckbox.checked;

        if (applicationState.generationParameters.enableLanguageLinking && !applicationState.chosenDataFields.includes('languages')) {
            applicationState.chosenDataFields.push('languages');
        }

        const selectedFormatRadio = document.querySelector('.outputFormatOption:checked');
        if (selectedFormatRadio) {
            applicationState.generationParameters.resultFormat = selectedFormatRadio.value;
        }

        remoteDataService.fetchEntityData();
    },

    selectOutputContent: (e) => {
        const targetElement = e.target;
        targetElement.select();
        const preventDeselect = (event) => {
            targetElement.removeEventListener('mouseup', preventDeselect);
            event.preventDefault();
        };
        targetElement.addEventListener('mouseup', preventDeselect);
    }
};

document.addEventListener('DOMContentLoaded', userInterfaceHandler.initializeDOMListeners);