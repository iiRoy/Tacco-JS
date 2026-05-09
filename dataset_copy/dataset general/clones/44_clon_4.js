(function () {
    const API_ENDPOINT = '/api/surveys';
    const QUESTION_ENUMS = {
        0: 'Text',
        1: 'Boolean',
        2: 'Scale'
    };
    const VALID_QUESTION_TYPES = ['Text', 'Boolean', 'Scale'];
    const DEFAULT_SURVEY_TITLE = 'Your New Survey';
    const DEFAULT_QUESTION_CONTENT = 'Your New Question';
    const MIN_TEXT_FIELD_LENGTH = 1;

    function requestJson(url, options = {}) {
        return fetch(url, options)
            .then(response => {
                if (!response.ok) {
                    return response.json().then(error => { throw new Error(error.message || `Network problem: ${response.status}`); });
                }
                return response.json();
            });
    }

    function showUserAlert(message) {
        window.alert('Operation Error: ' + message);
    }

    function askUserConfirmation(message) {
        return window.confirm(message);
    }

    function debounce(func, delay) {
        let timeout;
        return function (...args) {
            const context = this;
            clearTimeout(timeout);
            timeout = setTimeout(() => func.apply(context, args), delay);
        };
    }

    function createElementWithClass(tag, className = '', content = '') {
        const element = document.createElement(tag);
        if (className) element.className = className;
        if (content) element.innerHTML = content;
        return element;
    }

    function createInteractiveButton(text, className = '', handler = null) {
        const btn = document.createElement('button');
        btn.textContent = text;
        if (className) btn.className = className;
        if (handler) btn.addEventListener('click', handler);
        return btn;
    }

    function createFormInput(type, value, className = '', placeholder = '') {
        const input = document.createElement('input');
        input.type = type;
        input.value = value;
        if (className) input.className = className;
        if (placeholder) input.placeholder = placeholder;
        return input;
    }

    function createFormTextArea(value, className = '', placeholder = '') {
        const textarea = document.createElement('textarea');
        textarea.value = value;
        if (className) textarea.className = className;
        if (placeholder) textarea.placeholder = placeholder;
        return textarea;
    }

    function createFormSelect(options, selectedValue, className = '') {
        const select = document.createElement('select');
        if (className) select.className = className;
        options.forEach(optionText => {
            const option = document.createElement('option');
            option.value = optionText;
            option.textContent = optionText;
            if (optionText === selectedValue) {
                option.selected = true;
            }
            select.appendChild(option);
        });
        return select;
    }

    class SurveyEntry {
        constructor(initialData) {
            this.idValue = initialData.Id || '';
            this.title = initialData.Name || '';
            this.descriptionText = initialData.Description || '';
            this.urlIdentifier = initialData.Slug || '';
            this.questionObjects = (initialData.Questions || []).map((q, idx) => new QuestionEntry(q, idx));
        }

        get publicUrl() {
            return this.urlIdentifier ? (baseUrl + "/" + this.urlIdentifier) : null;
        }

        get analyticsUrl() {
            return this.urlIdentifier ? (baseUrl + "/summary/" + this.urlIdentifier) : null;
        }

        get sortKey() {
            return this.title;
        }

        toApiPayload() {
            return {
                Id: this.idValue,
                Name: this.title,
                Description: this.descriptionText,
                Slug: this.urlIdentifier,
                Questions: this.questionObjects.map(q => q.toApiPayload())
            };
        }

        refreshData(responsePayload) {
            this.idValue = responsePayload.Id;
            this.urlIdentifier = responsePayload.Slug;
            this.questionObjects = responsePayload.Questions.map((q, idx) => new QuestionEntry(q, idx));
        }
    }

    class QuestionEntry {
        constructor(data, orderIndex) {
            this.qid = data.id || data.Id || '';
            this.content = data.description || data.Description || '';
            this.kind = typeof data.Type === 'number' ? QUESTION_ENUMS[data.Type] : (data.type || data.Type || VALID_QUESTION_TYPES[0]);
            this.displayOrder = (data.index !== undefined ? data.index : orderIndex + 1);
        }

        toApiPayload() {
            const kindValue = Object.keys(QUESTION_ENUMS).find(key => QUESTION_ENUMS[key] === this.kind) || this.kind;
            return {
                Id: this.qid,
                Description: this.content,
                Type: kindValue,
                Index: this.displayOrder
            };
        }
    }

    class SurveyDataStore extends EventTarget {
        constructor() {
            super();
            this.collection = [];
            this.currentSelection = null;
        }

        locateInsertionPoint(itemSortKey) {
            let start = 0;
            let end = this.collection.length;
            while (start < end) {
                const mid = Math.floor((start + end) / 2);
                const midItemSortKey = this.collection[mid].sortKey;
                if (itemSortKey > midItemSortKey) {
                    start = mid + 1;
                } else if (itemSortKey < midItemSortKey) {
                    end = mid;
                } else {
                    return mid;
                }
            }
            return start;
        }

        addSurveyItem(surveyEntity) {
            const insertionPoint = this.locateInsertionPoint(surveyEntity.sortKey);
            this.collection.splice(insertionPoint, 0, surveyEntity);
            this.dispatchEvent(new CustomEvent('collectionUpdated'));
        }

        removeSurveyItem(surveyEntity) {
            this.collection = this.collection.filter(s => s !== surveyEntity);
            this.dispatchEvent(new CustomEvent('collectionUpdated'));
        }

        getAllSurveys() {
            return [...this.collection];
        }

        get selectedEntity() {
            return this.currentSelection;
        }

        set selectedEntity(surveyEntity) {
            if (this.currentSelection !== surveyEntity) {
                this.currentSelection = surveyEntity;
                this.dispatchEvent(new CustomEvent('selectionChanged', { detail: surveyEntity }));
            }
        }

        async retrieveAllEntities() {
            try {
                const rawEntities = await requestJson(API_ENDPOINT);
                this.collection = [];
                rawEntities.forEach(item => {
                    const newEntity = new SurveyEntry(item);
                    newEntity.questionObjects = item.Questions.map((q, idx) => new QuestionEntry(q, idx));
                    this.addSurveyItem(newEntity);
                });
                this.dispatchEvent(new CustomEvent('collectionLoaded'));
            } catch (error) {
                showUserAlert(error.message);
            }
        }

        createDraftSurvey() {
            const draft = new SurveyEntry({
                Name: DEFAULT_SURVEY_TITLE,
                Questions: []
            });
            this.addSurveyItem(draft);
            this.selectedEntity = draft;
        }

        async deleteSelectedEntity(surveyEntity) {
            if (!surveyEntity) return;

            if (askUserConfirmation(`'${surveyEntity.title}'\n\r\n\rConfirm deletion of this survey?`)) {
                this.removeSurveyItem(surveyEntity);
                if (this.selectedEntity === surveyEntity) {
                    this.selectedEntity = null;
                }

                if (surveyEntity.idValue) {
                    try {
                        await requestJson(`${API_ENDPOINT}/${surveyEntity.idValue}`, { method: 'DELETE' });
                    } catch (error) {
                        showUserAlert(error.message);
                        this.addSurveyItem(surveyEntity);
                        if (!this.selectedEntity) {
                            this.selectedEntity = surveyEntity;
                        }
                    }
                }
            }
        }

        async saveEntityChanges(surveyEntity = this.currentSelection) {
            if (!surveyEntity) return;

            if (!surveyEntity.title || surveyEntity.title.length < MIN_TEXT_FIELD_LENGTH) {
                window.alert('Survey title cannot be empty. Changes will not be saved.');
                return;
            }

            surveyEntity.questionObjects.forEach((q, idx) => q.displayOrder = idx + 1);

            const payload = surveyEntity.toApiPayload();
            const httpMethod = surveyEntity.idValue ? 'PUT' : 'POST';
            const requestUrl = surveyEntity.idValue ? `${API_ENDPOINT}/${surveyEntity.idValue}` : API_ENDPOINT;

            try {
                const responseData = await requestJson(requestUrl, {
                    method: httpMethod,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                surveyEntity.refreshData(responseData);
                this.dispatchEvent(new CustomEvent('entitySaved', { detail: surveyEntity }));
                this.dispatchEvent(new CustomEvent('collectionUpdated'));
            } catch (error) {
                showUserAlert(error.message);
            }
        }
    }

    class DisplayManager {
        constructor(dataSource) {
            this.dataSource = dataSource;
            this.surveyListDisplay = document.getElementById('survey-list-panel');
            this.detailsDisplayPanel = document.getElementById('survey-details-panel');
            this.questionDisplayContainer = null;

            this.initGlobalEvents();
            this.subscribeToDataEvents();
        }

        initGlobalEvents() {
            window.addEventListener('resize', debounce(() => this.adjustInterfaceLayout(), 100));
            document.body.addEventListener('click', (event) => {
                const target = event.target;
                if (target.matches('.add-new-record-btn')) {
                    this.dataSource.createDraftSurvey();
                } else if (target.matches('.remove-selected-record-btn')) {
                    this.dataSource.deleteSelectedEntity(this.dataSource.selectedEntity);
                }
            });
        }

        subscribeToDataEvents() {
            this.dataSource.addEventListener('collectionUpdated', () => this.updateSurveyList());
            this.dataSource.addEventListener('selectionChanged', (event) => this.showDetailsPanel(event.detail));
            this.dataSource.addEventListener('entitySaved', (event) => this.showDetailsPanel(event.detail));
            this.dataSource.addEventListener('collectionLoaded', () => {
                this.updateSurveyList();
                if (this.dataSource.getAllSurveys().length > 0) {
                    this.dataSource.selectedEntity = this.dataSource.getAllSurveys()[0];
                } else {
                    this.dataSource.selectedEntity = null;
                }
            });
        }

        adjustInterfaceLayout() {
            const dynamicOffset = document.querySelector('div.description-area textarea:visible') ? 420 : 350;
            const questionnaireArea = document.querySelector('div.survey-questions-area');
            if (questionnaireArea) {
                questionnaireArea.style.height = `${window.innerHeight - dynamicOffset}px`;
            }
        }

        updateSurveyList() {
            this.surveyListDisplay.innerHTML = '';
            this.dataSource.getAllSurveys().forEach(survey => {
                const listItem = this.createSurveyListEntry(survey);
                this.surveyListDisplay.appendChild(listItem);
            });
        }

        createSurveyListEntry(survey) {
            const listItem = document.createElement('li');
            listItem.className = 'survey-list-entry';
            if (this.dataSource.selectedEntity === survey) {
                listItem.classList.add('is-focused');
            }

            const titleSpan = createElementWithClass('span', 'entry-title', survey.title);
            const moreOptionsDiv = createElementWithClass('div', 'extra-controls', '<a href="#">...</a>');

            listItem.appendChild(titleSpan);
            listItem.appendChild(moreOptionsDiv);

            listItem.addEventListener('click', () => {
                const previouslyFocused = this.surveyListDisplay.querySelector('.is-focused');
                if (previouslyFocused) {
                    previouslyFocused.classList.remove('is-focused');
                }
                listItem.classList.add('is-focused');
                this.dataSource.selectedEntity = survey;
            });
            return listItem;
        }

        showDetailsPanel(selectedEntity) {
            this.detailsDisplayPanel.innerHTML = '';
            this.questionDisplayContainer = null;

            if (!selectedEntity) {
                this.detailsDisplayPanel.innerHTML = '<p class="no-item-selected-msg">No item selected.</p>';
                this.adjustInterfaceLayout();
                return;
            }

            const panelWrapper = createElementWithClass('div', 'detail-view-wrapper');

            const headerSection = createElementWithClass('div', 'detail-header-section');
            headerSection.appendChild(this.createInteractiveField(selectedEntity, 'title', 'text', 'Survey Title', 'h2'));
            headerSection.appendChild(createInteractiveButton('Remove Survey', 'remove-selected-record-btn'));
            panelWrapper.appendChild(headerSection);

            const descriptionSection = createElementWithClass('div', 'description-area');
            descriptionSection.appendChild(createElementWithClass('span', '', 'Description:'));
            descriptionSection.appendChild(this.createInteractiveField(selectedEntity, 'descriptionText', 'textarea', 'Survey Description', 'p', true));
            panelWrapper.appendChild(descriptionSection);

            const questionnaireSection = createElementWithClass('div', 'survey-questions-area');
            questionnaireSection.appendChild(createElementWithClass('span', '', 'Questions:'));
            this.questionDisplayContainer = createElementWithClass('div', 'question-list-area');
            questionnaireSection.appendChild(this.questionDisplayContainer);
            questionnaireSection.appendChild(createInteractiveButton('Add New Question', 'add-question-btn', () => this.addQuestionToSelectedSurvey(selectedEntity)));
            panelWrapper.appendChild(questionnaireSection);

            this.detailsDisplayPanel.appendChild(panelWrapper);
            this.renderQuestionList(selectedEntity);
            this.adjustInterfaceLayout();
        }

        renderQuestionList(survey) {
            if (!this.questionDisplayContainer) return;
            this.questionDisplayContainer.innerHTML = '';

            survey.questionObjects.sort((a, b) => a.displayOrder - b.displayOrder);

            survey.questionObjects.forEach((question, index) => {
                question.displayOrder = index + 1;
                this.questionDisplayContainer.appendChild(this.createQuestionItemElement(question, survey));
            });
            this.dataSource.saveEntityChanges(survey);
        }

        createQuestionItemElement(question, survey) {
            const questionWrapper = createElementWithClass('div', 'question-item-wrapper');
            questionWrapper.setAttribute('data-question-identifier', question.qid);

            const contentEditor = this.createInteractiveField(question, 'content', 'text', 'Question Content', 'span');
            questionWrapper.appendChild(contentEditor);

            const typeEditor = this.createInteractiveField(question, 'kind', 'select', '', 'span');
            questionWrapper.appendChild(typeEditor);

            const deleteButton = createInteractiveButton('X', 'delete-question-item-btn', () => this.removeQuestionFromSurvey(question, survey));
            questionWrapper.appendChild(deleteButton);

            return questionWrapper;
        }

        addQuestionToSelectedSurvey(survey) {
            if (!survey) return;
            const newQuestion = new QuestionEntry({
                description: DEFAULT_QUESTION_CONTENT,
                type: VALID_QUESTION_TYPES[0],
                index: survey.questionObjects.length + 1
            });
            survey.questionObjects.push(newQuestion);
            this.renderQuestionList(survey);
            this.dataSource.saveEntityChanges(survey);
        }

        removeQuestionFromSurvey(question, survey) {
            if (!survey || !question) return;

            if (askUserConfirmation('Confirm deletion of this question?')) {
                survey.questionObjects = survey.questionObjects.filter(q => q !== question);
                this.renderQuestionList(survey);
                this.dataSource.saveEntityChanges(survey);
            }
        }

        createInteractiveField(dataModel, propertyKey, inputType, placeholderText, displayTag = 'span', isTextMultiLine = false) {
            const fieldContainer = createElementWithClass('div', 'interactive-field-container');
            let currentDisplayElement;
            let currentInputElement;
            let storedPreviousValue = dataModel[propertyKey];
            let isInEditMode = false;

            const updateFieldDisplay = () => {
                if (displayTag === 'h2') {
                    currentDisplayElement = document.createElement('h2');
                } else if (displayTag === 'p') {
                    currentDisplayElement = document.createElement('p');
                } else {
                    currentDisplayElement = document.createElement('span');
                }
                currentDisplayElement.className = 'display-view';
                currentDisplayElement.textContent = dataModel[propertyKey] || placeholderText;
                fieldContainer.innerHTML = '';
                fieldContainer.appendChild(currentDisplayElement);
            };

            const activateEditMode = () => {
                if (isInEditMode) return;
                isInEditMode = true;
                storedPreviousValue = dataModel[propertyKey];

                if (inputType === 'textarea' || isTextMultiLine) {
                    currentInputElement = createFormTextArea(dataModel[propertyKey], 'edit-input-mode', placeholderText);
                } else if (inputType === 'select') {
                    currentInputElement = createFormSelect(VALID_QUESTION_TYPES, dataModel[propertyKey], 'edit-input-mode');
                } else {
                    currentInputElement = createFormInput(inputType, dataModel[propertyKey], 'edit-input-mode', placeholderText);
                }

                fieldContainer.innerHTML = '';
                fieldContainer.appendChild(currentInputElement);
                currentInputElement.focus();
                this.adjustInterfaceLayout();
            };

            const deactivateEditMode = (shouldSave = true) => {
                if (!isInEditMode) return;
                isInEditMode = false;
                if (shouldSave) {
                    const newValue = currentInputElement.value.trim();
                    if (propertyKey === 'title' && newValue.length < MIN_TEXT_FIELD_LENGTH) {
                        window.alert('Field cannot be empty!');
                        dataModel[propertyKey] = storedPreviousValue;
                        currentInputElement.classList.add('validation-error');
                        currentInputElement.focus();
                        isInEditMode = true;
                        return;
                    }
                    dataModel[propertyKey] = newValue;
                    this.dataSource.saveEntityChanges(this.dataSource.selectedEntity);
                } else {
                    dataModel[propertyKey] = storedPreviousValue;
                }
                updateFieldDisplay();
                this.adjustInterfaceLayout();
            };

            updateFieldDisplay();

            let lastTouchMoment = 0;
            fieldContainer.addEventListener('dblclick', activateEditMode);
            fieldContainer.addEventListener('touchend', (e) => {
                const now = new Date().getTime();
                if (now - lastTouchMoment < 300 && now - lastTouchMoment > 0) {
                    activateEditMode();
                    lastTouchMoment = 0;
                } else {
                    lastTouchMoment = now;
                }
                e.preventDefault();
            });

            fieldContainer.addEventListener('focusout', (e) => {
                if (isInEditMode && e.target === currentInputElement) {
                    deactivateEditMode(true);
                }
            });

            fieldContainer.addEventListener('keyup', (e) => {
                if (e.target !== currentInputElement || !isInEditMode) return;

                if (propertyKey === 'title' && e.target.value.trim().length < MIN_TEXT_FIELD_LENGTH) {
                    e.target.classList.add('validation-error');
                } else {
                    e.target.classList.remove('validation-error');
                }

                switch (e.key) {
                    case 'Enter':
                        if (inputType !== 'textarea') {
                            e.preventDefault();
                            if (e.target.value.trim().length >= MIN_TEXT_FIELD_LENGTH || propertyKey !== 'title') {
                                deactivateEditMode(true);
                            } else {
                                e.target.classList.add('validation-error');
                            }
                        }
                        break;
                    case 'Escape':
                        deactivateEditMode(false);
                        break;
                }
            });

            return fieldContainer;
        }
    }

    document.addEventListener('DOMContentLoaded', () => {
        if (!document.getElementById('survey-list-panel')) {
            document.body.appendChild(createElementWithClass('div', 'survey-list-area')).id = 'survey-list-panel';
        }
        if (!document.getElementById('survey-details-panel')) {
            document.body.appendChild(createElementWithClass('div', 'survey-details-area')).id = 'survey-details-panel';
        }
        if (!document.querySelector('.add-new-record-btn')) {
            const controlsBar = createElementWithClass('div', 'application-controls-bar');
            controlsBar.appendChild(createInteractiveButton('Create New Survey', 'add-new-record-btn'));
            document.body.prepend(controlsBar);
        }

        const dataService = new SurveyDataStore();
        const displayService = new DisplayManager(dataService);

        dataService.retrieveAllEntities();
    });

})();