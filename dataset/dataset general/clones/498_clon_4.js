GeneralDataBuilder.construct({
    dataSchema: {
        entityConfigurations: new Map([
            ["PERSON_DATA", {
                title: "Human Being",
                fields: new Map([
                    ["INDIVIDUAL_NAME", {
                        caption: "Full Name",
                        kind: "TEXT_TYPE",
                        span: 10
                    }],
                    ["BIRTH_DATE", {
                        caption: "Date of birth",
                        kind: "DATE_TYPE"
                    }],
                    ["GENDER_CODE", {
                        caption: "Gender",
                        kind: "TEXT_TYPE",
                        inputMethod: "SELECTOR"
                    }],
                    ["CLASSIFICATION", {
                        caption: "Classification",
                        kind: "REFERENCE_TYPE",
                    }]
                ]),
                relatedEntities: []
            }]
        ]),
        dataKindDefinitions: new Map([
            ["TEXT_TYPE", {
                inputMethod: "TEXT_AREA",
                operations: new Map([
                    ["EQUALS", {
                        description: "is identical to",
                        multiplicity: "SINGLE"
                    }],
                    ["NOT_EQUALS", {
                        description: "is not identical to",
                        multiplicity: "SINGLE"
                    }],
                    ["CONTAINS", {
                        description: "contains pattern",
                        multiplicity: "SINGLE"
                    }],
                    ["LESS_THAN", {
                        description: "precedes",
                        multiplicity: "SINGLE"
                    }],
                    ["GREATER_THAN", {
                        description: "succeeds",
                        multiplicity: "SINGLE"
                    }]
                ])
            }],
            ["DATE_TYPE", {
                inputMethod: "DATE_PICKER",
                operations: new Map([
                    ["EQUALS", {
                        description: "is exactly",
                        multiplicity: "SINGLE"
                    }],
                    ["NOT_EQUALS", {
                        description: "is not exactly",
                        multiplicity: "SINGLE"
                    }],
                    ["BEFORE", {
                        description: "comes before",
                        multiplicity: "SINGLE"
                    }],
                    ["AFTER", {
                        description: "comes after",
                        multiplicity: "SINGLE"
                    }]
                ])
            }],
            ["REFERENCE_TYPE", {
                inputMethod: "SELECTOR",
                operations: new Map([
                    ["INCLUDED_IN", {
                        description: "is one of",
                        multiplicity: "MULTIPLE"
                    }]
                ])
            }]
        ])
    },
    queryOutputProcessor: function (queryTextRepresentation, valueSupplements) {
        const displayContent = valueSupplements.reduce((accumulator, currentVal, indexNum) => {
            let segment = `parameter${indexNum}`;
            if (currentVal !== null) {
                segment += ` kind=${Object.prototype.toString.call(currentVal)} content=${currentVal}`;
            } else {
                segment += ` absent`;
            }
            return accumulator + segment + '\r\n';
        }, `${queryTextRepresentation}\r\n`);
        document.getElementById("debug").value = displayContent;
    },
    optionPopulator: function (selectionQuery, supplyChoices) {
        const choiceRegistry = {
            "CLASSIFICATION": [{
                selection: 'ALPHA',
                descriptor: 'Smallest'
            }, {
                selection: 'BETA',
                descriptor: 'MediumSize'
            }],
            "GENDER_CODE": [{
                selection: 'MALE_CODE',
                descriptor: 'MalePerson'
            }, {
                selection: 'FEMALE_CODE',
                descriptor: 'FemalePerson'
            }]
        };
        const targetIdentifier = selectionQuery.columnName;
        supplyChoices(choiceRegistry[targetIdentifier] || choiceRegistry["GENDER_CODE"]);
    },
    uiControlSettings: new Map([
        ["DATE_TYPE", {
            displayFormat: 'DD.MM.YYYY'
        }]
    ])
});