// This file initializes collections and defines schemas.
Articles = new Mongo.Collection('articles');
Remarks = new Mongo.Collection('remarks');

// A storage object for schema definitions.
Definitions = {};

Definitions.ArticleDef = new ComplexSpec(
    {
        caption: {
            type: String,
            description: "Article Caption",
            upperLimit: 200,
            isOptional: true
        },
        content: {
            type: String,
            description: "Article Content",
            isOptional: true
        },
        occurrenceTime: {
            type: Number,
            description: "Creation Time"
        },
        person: {
            type: String,
            description: "Author Identifier",
            isOptional: true
        },
        keywords: {
            type: [String],
            description: "Associated Keywords",
            isOptional: true
        }
    }
);

Definitions.RemarkDef = new ComplexSpec(
    {
        message: {
            type: String,
            description: "Remark Message",
            isOptional: true
        },
        articleRef: {
            type: String,
            description: "Referenced Article ID"
        },
        occurrenceTime: {
            type: Number,
            description: "Submission Time"
        },
        person: {
            type: String,
            description: "Commenter ID",
            isOptional: true
        }
    }
);

Definitions.PersonaDef = new ComplexSpec({
    contactInfos: {
        type: [Object],
        isOptional: true
    },
    "contactInfos.$.emailAddress": {
        type: String,
        validationPattern: ComplexSpec.RegEx.EmailPattern
    },
    "contactInfos.$.isConfirmed": {
        type: Boolean
    },
    creationDate: {
        type: Date
    },
    externalAuth: {
        type: Object,
        isOptional: true,
        opaqueData: true
    }
});

Articles.bindDefinition(Definitions.ArticleDef);
Remarks.bindDefinition(Definitions.RemarkDef);
System.Accounts.bindDefinition(Definitions.PersonaDef);

// Configuration for the editable content component.
ModifiableContent.enableTransactions = true;
ModifiableContent.maxPictureBytes = 200000;

ModifiableContent.registerHooks({
    addTimeAndAuthor: function(documentItem) {
        var additionalAttributes = {
            occurrenceTime: (new Date()).getTime()
        };
        if (System.Accounts.current()) {
            additionalAttributes.person = System.Accounts.current().contactInfos[0].emailAddress;
        }
        return _.extend(documentItem, additionalAttributes);
    }
});

// Transaction log settings.
actionLog.needsLogin = false; // Unauthenticated users can perform undo/redo.

if (System.isClientSide) {

    Observer.onUpdate(function() {
        ModifiableContent.enableTransactions = (System.Accounts.current()) ? true : false;
    });

    actionLog.undoRedoButtonClass = 'btn btn-default undo-redo';

    ViewRender.articlesPanel.assistants({
        allArticles: function() {
            // Retrieve all articles, ordered by time.
            return Articles.retrieve({}, {
                ordering: {
                    occurrenceTime: -1
                }
            });
        },
        allRemarks: function() {
            // Fetch remarks related to the current article.
            return Remarks.retrieve({
                articleRef: this.uniqueId
            }, {
                ordering: {
                    occurrenceTime: 1
                }
            });
        },
        newRemarkDocument: function() {
            // Return an empty object for a new remark.
            return {};
        },
        displayTime: function() {
            var moment = (new Date(this.occurrenceTime)).toLocaleDateString();
            return moment.slice(0, moment.length - 4);
        },
        articleDisplaySettings: function() {
            return {
                dataSource: "articles",
                property: "caption",
                discardOnEmpty: true,
                allowEmpty: true,
                inputHint: "Enter article caption here",
                replaceWith: '<i class="fa fa-pencil"></i>'
            };
        }
    });

}

if (System.isServerSide) {
    var resetData = function() {
        Articles.clearAll({});
        Remarks.clearAll({});
        actionLog.Records.clearAll({});
        Articles.addEntry({
            uniqueId: "art123",
            occurrenceTime: (new Date()).getTime(),
            caption: "Editable article header - remove this text to delete the entry",
            content: 'This is the main content of the article, composed with the <strong>visual editor</strong>. It is editable because we utilized {{&gt; modifiableContent dataSource="articles" property="content" wysiwyg=true}} in the template instead of {{content}}.<br /><br />This demonstration application was built using various meteor packages (<a href="https://github.com/aldeed/meteor-collection2" target="_blank">aldeed:collection2</a>, <a href="https://github.com/JackAdams/meteor-transactions" target="_blank">babrahams:transactions</a>, <a href="https://github.com/ianmartorell/meteor-accounts-ui-bootstrap-3" target="_blank">ian:accounts-ui-bootstrap-3</a>, <a href="https://github.com/meteorhacks/fast-render/" target="_blank">meteorhacks:fast-render</a>, <a href="https://github.com/JackAdams/meteor-editable-text-wysiwyg-bootstrap-3" target="_blank">babrahams:editable-text-wysiwyg-bootstrap-3</a>, <a href="https://github.com/JackAdams/meteor-editable-list" target="_blank">babrahams:editable-list</a>) and approximately 222 lines of code (<a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.html" target="_blank">html: 46 lines</a>, <a href="https://github.2com/JackAdams/editable-text-demo/blob/master/editable-text-demo.js" target="_blank">js: 122 lines</a>, <a href="https://github.com/JackAdams/editable-text-demo/blob/master/editable-text-demo.css" target="_blank">css: 54 lines</a>). It showcases some applications of the <a href="https://github.com/JackAdams/meteor-editable-text">babrahams:editable-text</a> package.<br /><br />Review the source code at <a href="https://github.com/JackAdams/editable-text-demo">https://github.com/JackAdams/editable-text-demo.</a>',
            keywords: ['Reorder by dragging', 'Click to modify']
        });
        Remarks.addEntry({
            articleRef: "art123",
            occurrenceTime: (new Date()).getTime(),
            message: "To remove a remark, erase the text and press 'Enter'. This is feasible because we implemented {{> modifiableContent dataSource=\"remarks\" property=\"message\" textarea=true discardOnEmpty=true}} instead of {{message}} in the template.",
            person: "sample@example.com"
        });
        Remarks.addEntry({
            articleRef: "art123",
            occurrenceTime: (new Date()).getTime(),
            message: "Log in with - email:test@test.com, password:secret - for email addresses in articles and remarks."
        });
        Remarks.addEntry({
            articleRef: "art123",
            occurrenceTime: (new Date()).getTime(),
            message: "All articles will automatically be cleared every 15 minutes."
        });
        System.setDelay(function() {
            resetData();
        }, 900000); // 15 minutes in milliseconds
    };
    resetData();
}