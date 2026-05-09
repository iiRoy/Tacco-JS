const globalEnvironment = {
    isFrontend: typeof window !== 'undefined',
    isBackend: typeof window === 'undefined',
    currentActiveUser: null
};

const utilityFunctions = {
    mergeObjects: (target, source) => Object.assign(target, source),
    generateUniqueId: () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15),
    formatOccurrenceTime: (millis) => {
        const date = new Date(millis);
        const dateString = date.toDateString();
        return dateString.substring(0, dateString.length - 4);
    },
    setMockUser: (userObj) => {
        globalEnvironment.currentActiveUser = userObj;
        if (globalEnvironment.isFrontend && typeof globalSettings.interactiveElements.onUserChange === 'function') {
            globalSettings.interactiveElements.onUserChange();
        }
    },
    getActiveUser: () => globalEnvironment.currentActiveUser
};

const globalSettings = {
    interactiveElements: {
        allowTransactions: true,
        maxAssetSize: 200000,
        callbackRegistry: [],
        registerProcessor: (processorFn) => {
            globalSettings.interactiveElements.callbackRegistry.push(processorFn);
        },
        processDocument: (doc) => {
            let processedDoc = { ...doc
            };
            for (const processor of globalSettings.interactiveElements.callbackRegistry) {
                processedDoc = processor(processedDoc);
            }
            return processedDoc;
        },
        onUserChange: null
    },
    actionLog: {
        requiresLoggedInUser: false,
        uiButtonClass: 'action-control-btn default-style'
    }
};

const dataVaults = {};

function createDataVault(vaultName) {
    const records = [];
    let recordValidator = null;

    const vaultInstance = {
        name: vaultName,
        _data: records,
        insert: (document) => {
            if (recordValidator) {
                const validationErrors = recordValidator.validate(document);
                if (validationErrors.length > 0) {
                    console.error(`Validation failed for ${vaultName} document:`, validationErrors);
                    throw new Error(`Validation error in ${vaultName}`);
                }
            }
            const processedDoc = globalSettings.interactiveElements.processDocument(document);
            const newDoc = {
                _id: utilityFunctions.generateUniqueId(),
                ...processedDoc
            };
            if (document._id) { // Allow explicit _id from original
                newDoc._id = document._id;
            }
            records.push(newDoc);
            return newDoc._id;
        },
        find: (query = {}, options = {}) => {
            let results = records.filter(record => {
                for (const key in query) {
                    if (record[key] !== query[key]) {
                        return false;
                    }
                }
                return true;
            });

            if (options.sort) {
                const sortKey = Object.keys(options.sort)[0];
                const sortOrder = options.sort[sortKey];
                results.sort((a, b) => {
                    if (a[sortKey] < b[sortKey]) return -sortOrder;
                    if (a[sortKey] > b[sortKey]) return sortOrder;
                    return 0;
                });
            }
            return results;
        },
        remove: (query = {}) => {
            let removedCount = 0;
            for (let i = records.length - 1; i >= 0; i--) {
                let match = true;
                for (const key in query) {
                    if (records[i][key] !== query[key]) {
                        match = false;
                        break;
                    }
                }
                if (match) {
                    records.splice(i, 1);
                    removedCount++;
                }
            }
            return removedCount;
        },
        applyStructure: (validator) => {
            recordValidator = validator;
        }
    };
    dataVaults[vaultName] = vaultInstance;
    return vaultInstance;
}

const ContentItems = createDataVault('contentItems');
const FeedbackEntries = createDataVault('feedbackEntries');
const UserDirectory = createDataVault('userDirectory');
const ActionHistory = createDataVault('actionHistory');

const structureDefinitions = {};

const FieldValidationRules = {
    EmailPattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
};

function createFieldValidator(definitionObject) {
    const validate = (document) => {
        const errors = [];
        for (const fieldName in definitionObject) {
            const fieldDef = definitionObject[fieldName];
            const value = document[fieldName];

            if (fieldName.includes('.$')) {
                const [parentField, , subField] = fieldName.split('.');
                const parentValue = document[parentField];
                if (Array.isArray(parentValue)) {
                    parentValue.forEach((item, index) => {
                        const nestedValue = item[subField];
                        if ((nestedValue === undefined || nestedValue === null || (typeof nestedValue === 'string' && nestedValue.trim() === '')) && !fieldDef.optional) {
                            errors.push(`${fieldName} at index ${index} is required.`);
                        } else if (!(nestedValue === undefined || nestedValue === null || (typeof nestedValue === 'string' && nestedValue.trim() === ''))) {
                            if (fieldDef.type && typeof nestedValue !== fieldDef.type.name.toLowerCase()) {
                                errors.push(`${fieldName} at index ${index} must be of type ${fieldDef.type.name}.`);
                            }
                            if (fieldDef.regEx && !fieldDef.regEx.test(nestedValue)) {
                                errors.push(`${fieldName} at index ${index} does not match required pattern.`);
                            }
                        }
                    });
                }
                continue;
            }

            if ((value === undefined || value === null || (typeof value === 'string' && value.trim() === '')) && !fieldDef.optional) {
                errors.push(`${fieldName} is required.`);
                continue;
            }

            if (fieldDef.optional && (value === undefined || value === null || (typeof value === 'string' && value.trim() === ''))) {
                continue;
            }

            if (fieldDef.type) {
                if (fieldDef.type === Array) {
                    if (!Array.isArray(value)) {
                        errors.push(`${fieldName} must be an array.`);
                    } else if (fieldDef.type[0] && Array.isArray(value)) {
                        const itemType = fieldDef.type[0].name.toLowerCase();
                        if (!value.every(item => typeof item === itemType)) {
                            errors.push(`${fieldName} must contain only items of type ${itemType}.`);
                        }
                    }
                } else if (fieldDef.type === Object) {
                    if (typeof value !== 'object' || Array.isArray(value)) {
                        errors.push(`${fieldName} must be an object.`);
                    }
                } else if (typeof value !== fieldDef.type.name.toLowerCase()) {
                    errors.push(`${fieldName} must be of type ${fieldDef.type.name}.`);
                }
            }

            if (fieldDef.max && typeof value === 'string' && value.length > fieldDef.max) {
                errors.push(`${fieldName} cannot exceed ${fieldDef.max} characters.`);
            }

            if (fieldDef.regEx && typeof value === 'string' && !fieldDef.regEx.test(value)) {
                errors.push(`${fieldName} does not match required pattern.`);
            }
        }
        return errors;
    };

    return {
        validate,
        rules: FieldValidationRules
    };
}

structureDefinitions.ContentItem = createFieldValidator({
    headline: {
        type: String,
        label: "Headline",
        max: 200,
        optional: true
    },
    mainContent: {
        type: String,
        label: "Main Content",
        optional: true
    },
    occurredAt: {
        type: Number,
        label: "Occurrence Time"
    },
    contributor: {
        type: String,
        label: "Contributor",
        optional: true
    },
    categories: {
        type: Array,
        label: "Categories",
        optional: true
    }
});

structureDefinitions.FeedbackEntry = createFieldValidator({
    message: {
        type: String,
        label: "Message",
        optional: true
    },
    referencingId: {
        type: String,
        label: "Referencing ID"
    },
    occurredAt: {
        type: Number,
        label: "Occurrence Time"
    },
    contributor: {
        type: String,
        label: "Contributor",
        optional: true
    }
});

structureDefinitions.AccountProfile = createFieldValidator({
    contactInfo: {
        type: Array,
        optional: true
    },
    "contactInfo.$.address": {
        type: String,
        regEx: FieldValidationRules.EmailPattern
    },
    "contactInfo.$.verified": {
        type: Boolean
    },
    creationTime: {
        type: Date
    },
    externalIntegrations: {
        type: Object,
        optional: true,
    }
});

ContentItems.applyStructure(structureDefinitions.ContentItem);
FeedbackEntries.applyStructure(structureDefinitions.FeedbackEntry);
UserDirectory.applyStructure(structureDefinitions.AccountProfile);

globalSettings.interactiveElements.allowTransactions = true;
globalSettings.interactiveElements.maxAssetSize = 200000;

globalSettings.interactiveElements.registerProcessor((document) => {
    const additionalFields = {
        occurredAt: Date.now()
    };
    const activeUser = utilityFunctions.getActiveUser();
    if (activeUser && activeUser.contactInfo && activeUser.contactInfo.length > 0) {
        additionalFields.contributor = activeUser.contactInfo[0].address;
    }
    return utilityFunctions.mergeObjects(document, additionalFields);
});

globalSettings.actionLog.requiresLoggedInUser = false;
globalSettings.actionLog.uiButtonClass = 'action-control-btn default-style';

if (globalEnvironment.isFrontend) {
    globalSettings.interactiveElements.onUserChange = () => {
        globalSettings.interactiveElements.allowTransactions = !!utilityFunctions.getActiveUser();
    };
    globalSettings.interactiveElements.onUserChange();

    const PageRenderingUtilities = {
        retrieveContentItems: () => {
            return ContentItems.find({}, {
                sort: {
                    occurredAt: -1
                }
            });
        },
        retrieveFeedbackForContent: function(contentId) {
            return FeedbackEntries.find({
                referencingId: contentId
            }, {
                sort: {
                    occurredAt: 1
                }
            });
        },
        createBlankFeedbackDoc: () => {
            return {};
        },
        formatItemOccurrenceTime: function(doc) {
            if (doc && doc.occurredAt) {
                return utilityFunctions.formatOccurrenceTime(doc.occurredAt);
            }
            return '';
        },
        getContentItemConfiguration: () => {
            return {
                dataVault: "contentItems",
                fieldIdentifier: "headline",
                clearIfEmpty: true,
                allowEmpty: true,
                placeholderText: "Content headline",
                visualSubstitute: '<i class="fa fa-pencil"></i>'
            };
        }
    };
}

if (globalEnvironment.isBackend) {
    let cleanupTimer = null;

    const systemResetProcedure = () => {
        ContentItems.remove({});
        FeedbackEntries.remove({});
        ActionHistory.remove({});

        const initialContentId = ContentItems.insert({
            _id: "abc123",
            occurredAt: Date.now(),
            headline: "Interactive content headline - remove this to clear the item",
            mainContent: 'This is the main body of the content, composed with the <strong>rich text editor</strong>. It is editable because we configured {{&gt; interactiveElement dataVault="contentItems" fieldIdentifier="mainContent" richText=true}} in the template instead of {{mainContent}}.<br /><br />This demonstration application was constructed with various libraries (<a href="https://github.com/aldeed/meteor-collection2" target="_blank">data-schema-lib</a>, <a href="https://github.com/JackAdams/meteor-transactions" target="_blank">action-history-lib</a>, <a href="https://github.com/ianmartorell/meteor-accounts-ui-bootstrap-3" target="_blank">user-auth-ui-lib</a>, <a href="https://github.com/meteorhacks/fast-render/" target="_blank">fast-render-lib</a>, <a href="https://github.com/JackAdams/meteor-editable-text-wysiwyg-bootstrap-3" target="_blank">interactive-text-rich-editor</a>, <a href="https://github.com/JackAdams/meteor-editable-list" target="_blank">interactive-list-lib</a>) and 222 lines of code (<a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.html" target="_blank">html: 46 loc</a>, <a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.js" target="_blank">js: 122 loc</a>, <a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.css" target="_blank">css: 54 loc</a>). It showcases some capabilities of the <a href="https://github.com/JackAdams/meteor-editable-text">interactive-text</a> package.<br /><br />Review the source at <a href="https://github.com/JackAdams/editable-text-demo">https://github.com/JackAdams/editable-text-demo.</a>',
            categories: ['Drag to reorder', 'Click to modify']
        });

        FeedbackEntries.insert({
            referencingId: initialContentId,
            occurredAt: Date.now(),
            message: "To remove an entry, clear the text and press 'Enter'. This is possible because we wrote {{> interactiveElement dataVault=\"feedbackEntries\" fieldIdentifier=\"message\" multiline=true clearIfEmpty=true}} instead of {{message}} in the template.",
            contributor: "sample@domain.com"
        });
        FeedbackEntries.insert({
            referencingId: initialContentId,
            occurredAt: Date.now(),
            message: "Log in with - email:test@test.com, password:password - for contributor addresses in content and entries."
        });
        FeedbackEntries.insert({
            referencingId: initialContentId,
            occurredAt: Date.now(),
            message: "All content will be reset every 15 minutes."
        });

        if (cleanupTimer) {
            clearTimeout(cleanupTimer);
        }
        cleanupTimer = setTimeout(() => {
            systemResetProcedure();
        }, 15 * 60 * 1000);
    };

    systemResetProcedure();
}