(function (jq) {
    jq(document).whenReady(function () {
        WebApp = Ember.Application.create();

        /* Utility Functions for Layout */
        WebApp.setPanelVisualHeight = function () {
            var heightOffset = jq('div.summary textarea:visible').length > 0 ? 410 : 360;
            jq('div.questionnaire-sections').css('height', jq(window).height() - heightOffset);
        }

        /* Data Structures */
        WebApp.Questionnaire = Ember.Object.extend({
            Identifier: '',
            Title: '',
            Summary: '',
            Permalink: '',
            Queries: [],

            generatePageLink: function () {
                var linkSegment = this.get('Permalink');
                if (!linkSegment) {
                    return null;
                }

                return baseAddress + "/" + linkSegment;
            }.property('Permalink'),

            generateSummaryLink: function () {
                var linkSegment = this.get('Permalink');
                if (!linkSegment) {
                    return null;
                }

                return baseAddress + "/overview/" + linkSegment;
            }.property('Permalink'),

            orderKey: function () {
                return this.get('Title');
            }.property('Title')
        });

        WebApp.QueryVariations = ['Input', 'YesNo', 'Rating'];

        /* Management Logic */
        WebApp.questionnairesManager = Ember.ArrayController.create({
            dataset: [],

            includeItem: function (qna) {
                var count = this.get('length'), position;

                position = this.findInsertPosition(qna.get('orderKey'), 0, count);
                this.insertAt(position, qna);
            },

            findInsertPosition: function (searchVal, startIdx, endIdx) {
                var middleIdx, middleVal;

                if (startIdx === endIdx) {
                    return startIdx;
                }

                middleIdx = startIdx + Math.floor((endIdx - startIdx) / 2);
                middleVal = this.objectAt(middleIdx).get('orderKey');

                if (searchVal > middleVal) {
                    return this.findInsertPosition(searchVal, middleIdx + 1, endIdx);
                } else if (searchVal < middleVal) {
                    return this.findInsertPosition(searchVal, startIdx, middleIdx);
                }

                return middleIdx;
            },

            deleteItem: function (qnaToRemove) {
                this.removeObject(qnaToRemove);
            },
           
            createNewQuestionnaire: function () {
                var newQnaData = {
                    Identifier: '',
                    Title: 'Your Fresh Questionnaire',
                    Permalink: '',
                    Summary: '',
                    Queries: []
                };

                this.includeItem(WebApp.Questionnaire.create(newQnaData));
            },

            removeQuestionnaire: function () {
                var targetQna = WebApp.currentSelectionManager.dataset;

                if (targetQna && confirm('Are you certain you wish to remove \'' + targetQna.Title + '\' from the system?')) {

                    this.deleteItem(targetQna);
                    WebApp.currentSelectionManager.set('dataset', null);

                    if (targetQna.Identifier) {
                        jq.ajax({
                            url: '/api/questionnaires/' + targetQna.Identifier,
                            type: 'DELETE',
                            onSuccess: function (serverRes) { /* Data removed successfully */ },
                            onError: function (xhrObj, statusMsg, errorVal) {
                                alert('An unforeseen issue occurred: ' + xhrObj.statusText);
                            }
                        });
                    }
                }
            },

            fetchQuestionnaires: function () {
                var _this = this;

                jq.ajax({
                    url: '/api/questionnaires',
                    onSuccess: function (receivedData) {
                        var questionnaires = receivedData;
                        questionnaires = questionnaires.map(function (record) {
                            return _this.buildQnaFromJSON(record);
                        });
                    },

                    onError: function (xhrObj, statusMsg, errorVal) {
                        alert('An unforeseen issue occurred: ' + xhrObj.statusText);
                    }
                });
            },

            buildQnaFromJSON: function (jsonData) {
                jsonData.Queries = jsonData.Queries.map(function (query, idx) {
                    return {
                        uniqueId: query.Id,
                        details: query.Description,
                        kind: WebApp.QueryVariations[query.Type],
                        position: query.Index
                    };
                });

                var newQna = WebApp.Questionnaire.create(jsonData);
                this.includeItem(newQna);

                return newQna;
            },

            persistQuestionnaire: function (qnaToSave) {
                if (!qnaToSave) {
                    qnaToSave = WebApp.currentSelectionManager.get('dataset');
                }

                if (!qnaToSave.Title || 0 === qnaToSave.Title.length) {
                    alert('Questionnaire title cannot be blank. Please provide a title to save changes.');
                } else {
                    var payload = { Identifier: qnaToSave.Identifier, Title: qnaToSave.Title, Summary: qnaToSave.Summary, Queries: qnaToSave.Queries }

                    jq.ajax({
                        url: '/api/questionnaires/' + qnaToSave.Identifier,
                        type: qnaToSave.Identifier ? 'PUT' : 'POST',
                        data: payload,
                        onSuccess: function (serverRes) {
                            if (!qnaToSave.Identifier) {
                                qnaToSave.set('Identifier', serverRes.Id);
                            }

                            qnaToSave.set('Permalink', serverRes.Slug);                            

                            var receivedQueries = serverRes.Questions.map(function (query, idx) {
                                return {
                                    uniqueId: query.Id,
                                    details: query.Description,
                                    kind: WebApp.QueryVariations[query.Type],
                                    position: query.Index
                                };
                            });

                            qnaToSave.set('Queries', receivedQueries);
                        },
                        onError: function (xhrObj, statusMsg, errorVal) {
                            alert('An unforeseen issue occurred: ' + xhrObj.statusText);
                        }
                    });
                }
            }
        });

        WebApp.questionnairesManager.fetchQuestionnaires();

        WebApp.currentSelectionManager = Ember.Object.create({
            dataset: null
        });

        WebApp.RemoveQueryComponent = Ember.View.extend({
            componentStyles: ['remove-query-component'],
    
            handleActivation: function () {
                if (confirm('Confirm deletion of this query?')) {
                    var itemToDelete = this.get('dataset');
                    var parentQna = this.getPath('itemView.dataset');
                    parentQna.get('Queries').removeObject(itemToDelete);

                    WebApp.questionnairesManager.persistQuestionnaire(parentQna);
                }
            },

            onTapFinish: function () {
                this.handleActivation();
            }
        });

        WebApp.EditableInput = Ember.View.extend({
            elementTag: 'div',
            layoutName: this.layoutName ? this.layoutName : 'input-field-edit',
            isMultiLine: false,
            isMandatory: true,
            initialValue: "",

            isInputValid: function () {
                return (!this.isMandatory || (this.currentValue && this.currentValue.length > 0));
            },

            onDoubleClick: function () {
                this.initialValue = this.currentValue;
                this.set('isModifying', true);
                WebApp.setPanelVisualHeight();
                return false;
            },

            onTapComplete: function () {
                // Double tap support
                var tapTimestamp = new Date();

                if (this._lastTapTime && tapTimestamp - this._lastTapTime < 250) {
                    this.onDoubleClick();
                    this._lastTapTime = null;
                } else {
                    this._lastTapTime = tapTimestamp;
                }

                // Prevent zooming
                return false;
            },

            onFocusLost: function () {
                if (!this.isInputValid()) {
                    this.set('currentValue', this.initialValue);
                } else {
                    WebApp.questionnairesManager.persistQuestionnaire();
                }

                this.set('isModifying', false);
            },

            onKeyRelease: function (eventObj) {
                if (this.isInputValid()) {
                    this.jq('input:first').removeClass('validation-failure-style');
                }

                switch (eventObj.keyCode) {
                    case 13: // Enter key
                        if (!this.isInputValid()) {
                            this.jq('input:first').addClass('validation-failure-style').focus();
                        }
                        else {
                            this.set('isModifying', false);
                            WebApp.questionnairesManager.persistQuestionnaire();
                        }

                        break;
                    case 27: // Escape key
                        this.set('currentValue', this.initialValue);                        
                        this.set('isModifying', false);
                        break;
                }
            }
        });

        WebApp.DropdownInput = Ember.Select.extend({
            onElementRendered: function () {
                this.jq().focus();
            }
        });

        WebApp.TextInput = Ember.TextField.extend({
            onElementRendered: function () {
                this.jq().focus();
            }
        });

        WebApp.MultiLineInput = Ember.TextArea.extend({
            onElementRendered: function () {
                WebApp.setPanelVisualHeight();
                this.jq().focus();
            }
        });

        Ember.Handlebars.registerHelper('editableControl', function (dataKey, helperOptions) {
            helperOptions.hash.boundValue = dataKey;
            return Ember.Handlebars.helpers.view.call(this, WebApp.EditableInput, helperOptions);
        });

        Ember.Handlebars.registerHelper('actionButton', function (controlOptions) {
            var optionHash = controlOptions.hash;

            if (!optionHash.target) {
                optionHash.target = "WebApp.questionnairesManager";
            }

            return Ember.Handlebars.helpers.view.call(this, Ember.Button, controlOptions);
        });

        WebApp.QuestionnaireListing = Ember.View.extend({
            styleBindings: ['isActive'],

            handleTap: function (eventItem) {
                var itemData = this.get('dataset');
                jq('.options').hide();
                jq('li.options', eventItem.currentTarget).show();
                WebApp.currentSelectionManager.set('dataset', itemData);
            },

            onTapComplete: function () {
                this.handleTap();
            },

            isActive: function () {
                var chosenEntry = WebApp.currentSelectionManager.get('dataset'),
                    thisEntry = this.get('dataset');

                if (thisEntry === chosenEntry) { return true; }
            }.property('WebApp.currentSelectionManager.dataset')
        });

        WebApp.QuestionnaireDetailsDisplay = Ember.View.extend({
            dataBinding: 'WebApp.currentSelectionManager.dataset',
            displayClasses: ['qnaInformation'],

            addNewQuery: function () {
                var queryList = this.getPath('dataset.Queries');
                queryList.pushObject({ uniqueId: '', details: 'Your New Query', kind: WebApp.QueryVariations[0], position: queryList.length + 1 });
            },

            onElementRendered: function () {
                WebApp.setPanelVisualHeight();
            },

            reorderQueryPositions: function (sourceObj, propName, queriesToFix) {
                if (queriesToFix) {
                    queriesToFix.sort(function (a, b) {
                        return a.position - b.position;
                    });

                    jq.each(queriesToFix, function (idx) {
                        this.position = idx + 1;
                    });
                }
            }.observes('dataset.Queries')
        });

        Ember.Hyperlink = Ember.View.extend({
            styleClasses: ['ember-hyperlink'],
            htmlTag: 'a',
            linkRef: '#',
            linkTarget: 'parentView',
            displayValue: '',
            boundAttributes: ['linkRef', 'linkTarget', 'displayValue']
        });

        jq(window).onWindowResize(function (resizeEvent) {
            WebApp.setPanelVisualHeight();
        });
    });
})(window.jQuery)