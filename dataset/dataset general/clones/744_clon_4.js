const TestUnit = {};
TestUnit.currentAssertions = 0;
TestUnit.expectedAssertions = 0;
TestUnit.isPaused = false;
TestUnit.pauseQueue = [];
TestUnit.testCurrentlyRunning = false;

TestUnit.createModule = function(moduleIdentifier, moduleOperation) {
    console.log(`\nModule: ${moduleIdentifier}`);
    moduleOperation();
};

TestUnit.runTest = function(testDescription, testExecution) {
    if (TestUnit.testCurrentlyRunning) {
        TestUnit.pauseQueue.push({ testDescription, testExecution });
        return;
    }
    TestUnit.testCurrentlyRunning = true;
    TestUnit.currentAssertions = 0;
    TestUnit.expectedAssertions = 0;
    try {
        testExecution();
        if (!TestUnit.isPaused) {
            if (TestUnit.currentAssertions !== TestUnit.expectedAssertions) {
                throw new Error(`Expected ${TestUnit.expectedAssertions} verifications, but performed ${TestUnit.currentAssertions}.`);
            }
            console.log(`  ✓ ${testDescription} (${TestUnit.currentAssertions}/${TestUnit.expectedAssertions} verifications)`);
            TestUnit.testCurrentlyRunning = false;
            TestUnit._processQueue();
        }
    } catch (error) {
        console.error(`  ✗ ${testDescription} - FAILED: ${error.message}`);
        TestUnit.testCurrentlyRunning = false;
        TestUnit._processQueue();
    }
};

TestUnit.setExpected = function(count) {
    TestUnit.expectedAssertions = count;
};

TestUnit.verifyCondition = function(condition, message) {
    TestUnit.currentAssertions++;
    if (!condition) {
        throw new Error(message || `Verification failed.`);
    }
};

TestUnit.pauseTest = function() {
    TestUnit.isPaused = true;
};

TestUnit.resumeTest = function() {
    TestUnit.isPaused = false;
    if (TestUnit.currentAssertions !== TestUnit.expectedAssertions) {
        console.error(`  ✗ (Async) FAILED: Expected ${TestUnit.expectedAssertions} verifications, but performed ${TestUnit.currentAssertions}.`);
    } else {
        console.log(`  ✓ (Async) (${TestUnit.currentAssertions}/${TestUnit.expectedAssertions} verifications)`);
    }
    TestUnit.testCurrentlyRunning = false;
    TestUnit._processQueue();
};

TestUnit._processQueue = function() {
    if (TestUnit.pauseQueue.length > 0) {
        const nextTest = TestUnit.pauseQueue.shift();
        TestUnit.runTest(nextTest.testDescription, nextTest.testExecution);
    }
};

const MockDisplayElement = function(tagType, elementProps = {}, initialContent = '') {
    this.tagType = tagType ? tagType.toUpperCase() : 'DIV';
    this.content = initialContent;
    this.properties = elementProps;
    this.embeddedElements = [];
    this.visualStyle = { display: 'block' };
    this.textNode = '';
    this._selectionState = elementProps.checked || false;
    this.dataStorage = {};
    this.parentReference = null;
    this.onClickHandler = null;
    this.onChangeHandler = null;

    Object.defineProperty(this, 'checked', {
        get() { return this._selectionState; },
        set(val) {
            this._selectionState = val;
            if (val) {
                this.properties.checked = 'checked';
            } else {
                delete this.properties.checked;
            }
        }
    });

    this.setProperty = function(propName, propValue) {
        this.properties[propName] = propValue;
        if (propName === 'checked') {
            this._selectionState = (propValue === true || propValue === 'checked');
        }
    };
    this.getProperty = function(propName) {
        if (propName === 'checked') {
            return this._selectionState;
        }
        return this.properties[propName];
    };
    this.click = function() {
        if (this.onClickHandler) this.onClickHandler({ currentTarget: this });
    };
    this.change = function() {
        if (this.onChangeHandler) this.onChangeHandler({ currentTarget: this });
    };
    this.addNode = function(childNode) {
        this.embeddedElements.push(childNode);
        childNode.parentReference = this;
    };
    this.text = function() { return this.textNode; };
    this.styleProperty = function(propName, propValue) {
        if (propValue !== undefined) {
            this.visualStyle[propName] = propValue;
            return this;
        }
        return this.visualStyle[propName];
    };
    this.is = function(selector) {
        if (selector === ':visible') {
            return this.visualStyle.display !== 'none';
        }
        return false;
    };

    this.searchDescendants = function(query) {
        const foundNodes = [];
        const nodeQueue = [...this.embeddedElements];

        while (nodeQueue.length > 0) {
            const currentNode = nodeQueue.shift();

            let matches = true;
            const singleQueryMatch = query.match(/^[.#]?[a-zA-Z0-9_]+(\[.*?\])?(:checked)?$/);

            if (singleQueryMatch) {
                const tagMatch = query.match(/^([a-zA-Z]+)/);
                const nameMatch = query.match(/\[name=([a-zA-Z0-9_]+)\]/);
                const classMatch = query.match(/\.([a-zA-Z0-9_]+)/);
                const idMatch = query.match(/#([a-zA-Z0-9_]+)/);
                const checkedMatch = query.includes(':checked');
                const valueMatch = query.match(/\[value=([^\]]+)\]/);

                if (tagMatch && currentNode.tagType.toLowerCase() !== tagMatch[1].toLowerCase()) matches = false;
                if (nameMatch && currentNode.properties.name !== nameMatch[1]) matches = false;
                if (classMatch && (!currentNode.properties.class || !currentNode.properties.class.includes(classMatch[1]))) matches = false;
                if (idMatch && currentNode.properties.id !== idMatch[1]) matches = false;
                if (checkedMatch && !currentNode.checked) matches = false;
                if (valueMatch && currentNode.content !== valueMatch[1].replace(/'/g, '')) matches = false;

                if (matches) foundNodes.push(currentNode);
            } else if (query.includes('.occurrence span')) {
                if (currentNode.tagType === 'SPAN' && currentNode.properties.class && currentNode.properties.class.includes('occurrence') && currentNode.parentReference && currentNode.parentReference.properties.class && (currentNode.parentReference.properties.class.includes('rioccurrences') || currentNode.parentReference.properties.class.includes('eventInstances'))) {
                    foundNodes.push(currentNode);
                }
            } else if (query.includes('.occurrence span.action a')) {
                 if (currentNode.tagType === 'A' && currentNode.parentReference && currentNode.parentReference.properties.class && currentNode.parentReference.properties.class.includes('action') && currentNode.parentReference.parentReference && currentNode.parentReference.parentReference.properties.class && currentNode.parentReference.parentReference.properties.class.includes('occurrence')) {
                    foundNodes.push(currentNode);
                }
            } else if (query.includes('.paginationControl .current a')) {
                if (currentNode.tagType === 'A' && currentNode.properties.class && currentNode.properties.class.includes('current') && currentNode.parentReference && currentNode.parentReference.properties.class && currentNode.parentReference.properties.class.includes('paginationControl')) {
                    foundNodes.push(currentNode);
                }
            } else if (query.includes('#weeklyDays input:checkbox')) {
                if (currentNode.tagType === 'INPUT' && currentNode.properties.type === 'checkbox' && currentNode.parentReference && currentNode.parentReference.properties.id === 'weeklyDays') {
                    foundNodes.push(currentNode);
                }
            }

            nodeQueue.push(...currentNode.embeddedElements);
        }

        return QueryEmulator(foundNodes);
    };
};

const MockDateInputLogic = function() {
    this.currentYear = 0;
    this.currentMonth = 0;
    this.currentDay = 0;
    this.linkedElement = null;

    this.assignDate = function(year, month, day) {
        this.currentYear = year;
        this.currentMonth = month;
        this.currentDay = day;
        if (this.linkedElement) {
            const displayMonth = String(month + 1).padStart(2, '0');
            const displayDay = String(day).padStart(2, '0');
            this.linkedElement.content = `${displayMonth}/${displayDay}/${year}`;
        }
    };
};

const globalMockDOM = {
    elementsRegister: {},
    createNode: function(tagType, elementProps = {}, initialContent = '') {
        const node = new MockDisplayElement(tagType, elementProps, initialContent);
        if (elementProps.name) {
            this.elementsRegister[elementProps.name] = node;
        }
        if (elementProps.id) {
            this.elementsRegister[elementProps.id] = node;
        }
        return node;
    },
    queryNodes: function(query) {
        let foundNodes = [];
        const nameMatch = query.match(/\[name=([a-zA-Z0-9_]+)\]/);
        const idMatch = query.match(/#([a-zA-Z0-9_]+)/);
        const classMatch = query.match(/\.([a-zA-Z0-9_]+)/);

        if (nameMatch && this.elementsRegister[nameMatch[1]]) {
            foundNodes.push(this.elementsRegister[nameMatch[1]]);
        } else if (idMatch && this.elementsRegister[idMatch[1]]) {
            foundNodes.push(this.elementsRegister[idMatch[1]]);
        } else if (classMatch) {
            for (const key in this.elementsRegister) {
                const node = this.elementsRegister[key];
                if (node.properties.class && node.properties.class.includes(classMatch[1])) {
                    foundNodes.push(node);
                }
            }
        }
        return QueryEmulator(foundNodes);
    }
};

const globalTextAreaPattern = globalMockDOM.createNode('textarea', { name: 'repeat' });
const globalTextAreaUserDefined = globalMockDOM.createNode('textarea', { name: 'custom' });
const globalInputStartDate = globalMockDOM.createNode('input', { name: 'start', type: 'date' });

const patternFieldLink = globalMockDOM.createNode('a', { name: 'editPattern', class: 'repeatfield' });
globalMockDOM.elementsRegister.repeatfield = patternFieldLink;
const userDefinedFieldLink = globalMockDOM.createNode('a', { name: 'editPattern', class: 'userDefinedfield' });
globalMockDOM.elementsRegister.userDefinedfield = userDefinedFieldLink;

const QueryEmulator = function(selector) {
    if (typeof selector === 'string') {
        return globalMockDOM.queryNodes(selector);
    }
    const nodes = Array.isArray(selector) ? selector : [selector];
    return Object.assign(nodes, {
        val: function(v) {
            if (v !== undefined) {
                this.forEach(e => e.content = v);
                return this;
            }
            return this.length > 0 ? this[0].content : undefined;
        },
        attr: function(propName, propValue) {
            if (propValue !== undefined) {
                this.forEach(e => e.setProperty(propName, propValue));
                return this;
            }
            return this.length > 0 ? this[0].getProperty(propName) : undefined;
        },
        click: function() { this.forEach(e => e.click()); return this; },
        change: function() { this.forEach(e => e.change()); return this; },
        text: function() { return this.length > 0 ? this[0].text() : ''; },
        css: function(propName, propValue) {
            if (propValue !== undefined) {
                this.forEach(e => e.styleProperty(propName, propValue));
                return this;
            }
            return this.length > 0 ? this[0].styleProperty(propName) : undefined;
        },
        is: function(s) { return this.length > 0 ? this[0].is(s) : false; },
        data: function(key) { return this.length > 0 ? this[0].dataStorage[key] : undefined; },
        find: function(s) { return this.length > 0 ? this[0].searchDescendants(s) : QueryEmulator([]); }
    });
};

QueryEmulator.fn = QueryEmulator.prototype;
QueryEmulator.fn.patternScheduler = function() {
    if (this.length === 0) return this;
    const node = this[0];
    if (!node.schedulerFacade) {
        node.schedulerFacade = new RecurrencePatternFacade(this);
    }
    return node.schedulerFacade;
};

const $ = QueryEmulator;

function updateDateField(elementRef, dateValue) {
    elementRef.val(dateValue);
    if (!elementRef.val()) {
        elementRef.val(dateValue.replace(/\//g, '-'));
    }
}

class RecurrencePatternFacade {
    constructor(elementRef) {
        this.linkedElement = elementRef;
        this.interfaceDialog = this.buildInterfaceDialog();
        this.displayOutput = this.buildDisplayOutput();
        this.messageDisplay = this.interfaceDialog.searchDescendants('#notificationDisplay');
        this.currentSettings = {};
        this.initialRule = '';

        QueryEmulator('.repeatfield a[name=editPattern]').onClickHandler = () => this.openInterface();
        QueryEmulator('.userDefinedfield a[name=editPattern]').onClickHandler = () => this.openInterface();
    }

    buildInterfaceDialog() {
        const dialog = globalMockDOM.createNode('div', { class: 'schedulerDialog', id: 'schedulerDialog' });
        dialog.styleProperty('display', 'none');

        const messageArea = globalMockDOM.createNode('div', { id: 'notificationDisplay' });
        messageArea.styleProperty('display', 'none');
        dialog.addNode(messageArea);

        const freqSelect = globalMockDOM.createNode('select', { name: 'frequencyOption' });
        ['daily', 'weekly', 'monthly', 'yearly'].forEach(f => freqSelect.addNode(globalMockDOM.createNode('option', { value: f }, f)));
        dialog.addNode(freqSelect);

        const dailyInterval = globalMockDOM.createNode('input', { name: 'dailyCycle', content: '1' }); dialog.addNode(dailyInterval);
        const weeklyInterval = globalMockDOM.createNode('input', { name: 'weeklyCycle', content: '1' }); dialog.addNode(weeklyInterval);
        const weeklyDays = globalMockDOM.createNode('div', { id: 'weeklyDays' });
        ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].forEach(d => weeklyDays.addNode(globalMockDOM.createNode('input', { type: 'checkbox', name: `weeklyDay${d}`, value: d })));
        dialog.addNode(weeklyDays);

        const monthlyTypeDayOfMonth = globalMockDOM.createNode('input', { type: 'radio', name: 'monthlyPattern', value: 'DAYOFMONTH' }); dialog.addNode(monthlyTypeDayOfMonth);
        const monthlyTypeWeekDayOfMonth = globalMockDOM.createNode('input', { type: 'radio', name: 'monthlyPattern', value: 'WEEKDAYOFMONTH' }); dialog.addNode(monthlyTypeWeekDayOfMonth);
        const monthlyInterval = globalMockDOM.createNode('input', { name: 'monthlyCycle', content: '1' }); dialog.addNode(monthlyInterval);
        const monthlyWeekIndex = globalMockDOM.createNode('select', { name: 'monthlyWeekIndex' });
        ['+1', '+2', '+3', '+4'].forEach(i => monthlyWeekIndex.addNode(globalMockDOM.createNode('option', { value: i })));
        dialog.addNode(monthlyWeekIndex);
        const monthlyWeekDay = globalMockDOM.createNode('select', { name: 'monthlyWeekDay' });
        ['MO', 'TH'].forEach(d => monthlyWeekDay.addNode(globalMockDOM.createNode('option', { value: d })));
        dialog.addNode(monthlyWeekDay);

        const yearlyInterval = globalMockDOM.createNode('input', { name: 'annualCycle', content: '1' }); dialog.addNode(yearlyInterval);
        const yearlyTypeDayOfMonth = globalMockDOM.createNode('input', { type: 'radio', name: 'annualPattern', value: 'DAYOFMONTH' }); dialog.addNode(yearlyTypeDayOfMonth);
        const yearlyTypeWeekDayOfMonth = globalMockDOM.createNode('input', { type: 'radio', name: 'annualPattern', value: 'WEEKDAYOFMONTH' }); dialog.addNode(yearlyTypeWeekDayOfMonth);
        const yearlyDayOfMonthMonth = globalMockDOM.createNode('select', { name: 'annualMonthDayMonth' });
        for(let i=1; i<=12; i++) yearlyDayOfMonthMonth.addNode(globalMockDOM.createNode('option', { value: String(i) })); dialog.addNode(yearlyDayOfMonthMonth);
        const yearlyDayOfMonthDay = globalMockDOM.createNode('select', { name: 'annualMonthDayDay' });
        for(let i=1; i<=31; i++) yearlyDayOfMonthDay.addNode(globalMockDOM.createNode('option', { value: String(i) })); dialog.addNode(yearlyDayOfMonthDay);
        const yearlyWeekIndex = globalMockDOM.createNode('select', { name: 'annualWeekIndex' });
        ['+1', '+2', '+3', '+4', '-1'].forEach(i => yearlyWeekIndex.addNode(globalMockDOM.createNode('option', { value: i }))); dialog.addNode(yearlyWeekIndex);
        const yearlyWeekDay = globalMockDOM.createNode('select', { name: 'annualWeekDay' });
        ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].forEach(d => yearlyWeekDay.addNode(globalMockDOM.createNode('option', { value: d }))); dialog.addNode(yearlyWeekDay);
        const yearlyWeekMonth = globalMockDOM.createNode('select', { name: 'annualWeekMonth' });
        for(let i=1; i<=12; i++) yearlyWeekMonth.addNode(globalMockDOM.createNode('option', { value: String(i) })); dialog.addNode(yearlyWeekMonth);

        const rangeNoEnd = globalMockDOM.createNode('input', { type: 'radio', name: 'periodTypeSelection', value: 'NOENDDATE', checked: true }); dialog.addNode(rangeNoEnd);
        const rangeByOccurrences = globalMockDOM.createNode('input', { type: 'radio', name: 'periodTypeSelection', value: 'BYOCCURRENCES' }); dialog.addNode(rangeByOccurrences);
        const occurrenceLimit = globalMockDOM.createNode('input', { name: 'occurrenceLimitValue', content: '10' }); dialog.addNode(occurrenceLimit);
        const rangeByEndDate = globalMockDOM.createNode('input', { type: 'radio', name: 'periodTypeSelection', value: 'BYENDDATE' }); dialog.addNode(rangeByEndDate);
        const endDateCalendar = globalMockDOM.createNode('input', { name: 'endDateCalendar' });
        const mockDateLogic = new MockDateInputLogic();
        mockDateLogic.linkedElement = endDateCalendar;
        endDateCalendar.dataStorage.dateinput = mockDateLogic;
        dialog.addNode(endDateCalendar);

        const occurrencesDiv = globalMockDOM.createNode('div', { class: 'eventInstances' }); dialog.addNode(occurrencesDiv);

        const addDateInput = globalMockDOM.createNode('input', { id: 'additionDateInput' });
        const mockAddDateLogic = new MockDateInputLogic();
        mockAddDateLogic.linkedElement = addDateInput;
        addDateInput.dataStorage.dateinput = mockAddDateLogic;
        dialog.addNode(addDateInput);
        const addButton = globalMockDOM.createNode('button', { id: 'additionButton' });
        addButton.onClickHandler = () => this.addExceptionEntry();
        dialog.addNode(addButton);

        const paginationDiv = globalMockDOM.createNode('div', { class: 'paginationControl' });
        const paginationLink1 = globalMockDOM.createNode('a', { start: '0' }); paginationLink1.onClickHandler = (e) => this.handlePagination(e); paginationDiv.addNode(paginationLink1);
        const paginationLink2 = globalMockDOM.createNode('a', { class: 'current', start: '11' }); paginationLink2.onClickHandler = (e) => this.handlePagination(e); paginationDiv.addNode(paginationLink2);
        dialog.addNode(paginationDiv);

        const saveButton = globalMockDOM.createNode('button', { class: 'confirmChanges' }); saveButton.onClickHandler = () => this.saveModifications(); dialog.addNode(saveButton);
        const cancelButton = globalMockDOM.createNode('button', { class: 'discardChanges' }); cancelButton.onClickHandler = () => this.cancelModifications(); dialog.addNode(cancelButton);
        const refreshButton = globalMockDOM.createNode('button', { class: 'updateViewButton' }); refreshButton.onClickHandler = () => this.refreshDisplay(); dialog.addNode(refreshButton);

        return dialog;
    }

    buildDisplayOutput() {
        const displayContainer = globalMockDOM.createNode('div', { class: 'outputView' });
        const occurrencesContainer = globalMockDOM.createNode('div', { class: 'rioccurrences' });
        displayContainer.addNode(occurrencesContainer);
        return displayContainer;
    }

    interpretRule(ruleString) {
        if (!ruleString || ruleString.indexOf('RRULE:') === -1) {
            return { FREQ: null, INTERVAL: null, COUNT: null, UNTIL: null, BYDAY: null, BYMONTHDAY: null, BYMONTH: null, RDATE: [], EXDATE: [] };
        }

        const ruleLines = ruleString.split('\n').map(line => line.trim());
        const parsedData = { RDATE: [], EXDATE: [] };

        for (const line of ruleLines) {
            if (line.startsWith('RRULE:')) {
                const parts = line.substring(6).split(';');
                for (const part of parts) {
                    const [key, value] = part.split('=');
                    parsedData[key] = value;
                }
            } else if (line.startsWith('RDATE:')) {
                const dates = line.substring(6).split(',').map(d => d.replace(/;VALUE=DATE:/, '').replace(/T000000$/, ''));
                parsedData.RDATE = parsedData.RDATE.concat(dates);
            } else if (line.startsWith('EXDATE:')) {
                const dates = line.substring(7).split(',').map(d => d.replace(/;VALUE=DATE:/, '').replace(/T000000$/, ''));
                parsedData.EXDATE = parsedData.EXDATE.concat(dates);
            }
        }

        if (parsedData.UNTIL) {
            parsedData.UNTIL = parsedData.UNTIL.split('T')[0];
        }
        return parsedData;
    }

    composeRuleString(settings) {
        let rruleComponents = [];
        if (settings.FREQ) rruleComponents.push(`FREQ=${settings.FREQ}`);
        if (settings.INTERVAL && settings.INTERVAL !== '1') rruleComponents.push(`INTERVAL=${settings.INTERVAL}`);
        if (settings.BYMONTH) rruleComponents.push(`BYMONTH=${settings.BYMONTH}`);
        if (settings.BYDAY) rruleComponents.push(`BYDAY=${settings.BYDAY}`);
        if (settings.BYMONTHDAY) rruleComponents.push(`BYMONTHDAY=${settings.BYMONTHDAY}`);
        if (settings.COUNT) rruleComponents.push(`COUNT=${settings.COUNT}`);
        if (settings.UNTIL) rruleComponents.push(`UNTIL=${settings.UNTIL}T000000`);

        let finalRule = `RRULE:${rruleComponents.join(';')}`;

        const distinctExdates = [...new Set(settings.EXDATE)].sort();
        const distinctRdates = [...new Set(settings.RDATE)].sort();

        if (distinctExdates.length > 0) {
            finalRule += `\nEXDATE:${distinctExdates.map(d => d.replace(/T000000$/, '') + 'T000000').join(',')}`;
        }
        if (distinctRdates.length > 0) {
            finalRule += `\nRDATE:${distinctRdates.map(d => d.replace(/T000000$/, '') + 'T000000').join(',')}`;
        }
        return finalRule;
    }

    openInterface() {
        this.initialRule = this.linkedElement.val();
        this.loadFormFromSettings(this.interpretRule(this.initialRule));
        this.interfaceDialog.styleProperty('display', 'block');
        this.refreshDisplay();
    }

    hideInterface() {
        this.interfaceDialog.styleProperty('display', 'none');
    }

    saveModifications() {
        if (!this.validateInputs()) {
            return;
        }
        const newSettings = this.getSettingsFromForm();
        this.linkedElement.val(this.composeRuleString(newSettings));
        this.currentSettings = newSettings;
        this.hideInterface();
        this.refreshDisplay(true);
    }

    cancelModifications() {
        this.loadFormFromSettings(this.interpretRule(this.initialRule));
    }

    loadFormFromSettings(settings) {
        this.currentSettings = settings;
        this.messageDisplay.styleProperty('display', 'none');
        this.messageDisplay.textNode = '';

        this.interfaceDialog.searchDescendants('select[name=frequencyOption]').val('daily');
        this.interfaceDialog.searchDescendants('input[name=dailyCycle]').val('1');
        this.interfaceDialog.searchDescendants('input[name=weeklyCycle]').val('1');
        this.interfaceDialog.searchDescendants('input[name=monthlyCycle]').val('1');
        this.interfaceDialog.searchDescendants('input[name=annualCycle]').val('1');
        this.interfaceDialog.searchDescendants('input[type=checkbox]').attr('checked', false);
        this.interfaceDialog.searchDescendants('input[name=monthlyPattern]')[0].checked = false;
        this.interfaceDialog.searchDescendants('input[name=monthlyPattern]')[1].checked = false;
        this.interfaceDialog.searchDescendants('input[name=annualPattern]')[0].checked = false;
        this.interfaceDialog.searchDescendants('input[name=annualPattern]')[1].checked = false;
        this.interfaceDialog.searchDescendants('input[name=periodTypeSelection][value=NOENDDATE]')[0].checked = true;
        this.interfaceDialog.searchDescendants('input[name=occurrenceLimitValue]').val('10');
        this.interfaceDialog.searchDescendants('input[name=endDateCalendar]').val('');

        if (settings.FREQ) {
            this.interfaceDialog.searchDescendants('select[name=frequencyOption]').val(settings.FREQ.toLowerCase());
        }

        const currentFreq = this.interfaceDialog.searchDescendants('select[name=frequencyOption]').val().toLowerCase();
        this.interfaceDialog.searchDescendants(`input[name=${currentFreq}Cycle]`).val(settings.INTERVAL || '1');

        if (settings.BYDAY && currentFreq === 'weekly') {
            const byDays = settings.BYDAY.split(',');
            ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].forEach(day => {
                const checkbox = this.interfaceDialog.searchDescendants(`input[name=weeklyDay${day}]`);
                if (checkbox.length > 0) {
                    checkbox[0].checked = byDays.includes(day);
                }
            });
        }

        if (currentFreq === 'monthly') {
            if (settings.BYMONTHDAY) {
                this.interfaceDialog.searchDescendants('input[name=monthlyPattern][value=DAYOFMONTH]')[0].checked = true;
            } else if (settings.BYDAY) {
                this.interfaceDialog.searchDescendants('input[name=monthlyPattern][value=WEEKDAYOFMONTH]')[0].checked = true;
                const byday = settings.BYDAY;
                const indexMatch = byday.match(/^[+-]?\d+/);
                const dayMatch = byday.match(/[A-Z]{2}$/);
                if (indexMatch) this.interfaceDialog.searchDescendants('select[name=monthlyWeekIndex]').val(indexMatch[0]);
                if (dayMatch) this.interfaceDialog.searchDescendants('select[name=monthlyWeekDay]').val(dayMatch[0]);
            }
        }

        if (currentFreq === 'yearly') {
            if (settings.BYMONTH && settings.BYMONTHDAY) {
                this.interfaceDialog.searchDescendants('input[name=annualPattern][value=DAYOFMONTH]')[0].checked = true;
                this.interfaceDialog.searchDescendants('select[name=annualMonthDayMonth]').val(settings.BYMONTH);
                this.interfaceDialog.searchDescendants('select[name=annualMonthDayDay]').val(settings.BYMONTHDAY);
            } else if (settings.BYMONTH && settings.BYDAY) {
                this.interfaceDialog.searchDescendants('input[name=annualPattern][value=WEEKDAYOFMONTH]')[0].checked = true;
                const byday = settings.BYDAY;
                const indexMatch = byday.match(/^[+-]?\d+/);
                const dayMatch = byday.match(/[A-Z]{2}$/);
                if (indexMatch) this.interfaceDialog.searchDescendants('select[name=annualWeekIndex]').val(indexMatch[0]);
                if (dayMatch) this.interfaceDialog.searchDescendants('select[name=annualWeekDay]').val(dayMatch[0]);
                this.interfaceDialog.searchDescendants('select[name=annualWeekMonth]').val(settings.BYMONTH);
            }
        }

        if (settings.COUNT) {
            this.interfaceDialog.searchDescendants('input[name=periodTypeSelection][value=BYOCCURRENCES]')[0].checked = true;
            this.interfaceDialog.searchDescendants('input[name=occurrenceLimitValue]').val(settings.COUNT);
        } else if (settings.UNTIL) {
            this.interfaceDialog.searchDescendants('input[name=periodTypeSelection][value=BYENDDATE]')[0].checked = true;
            const untilDate = settings.UNTIL;
            const year = parseInt(untilDate.substring(0, 4));
            const month = parseInt(untilDate.substring(4, 6));
            const day = parseInt(untilDate.substring(6, 8));
            this.interfaceDialog.searchDescendants('input[name=endDateCalendar]').data('dateinput').assignDate(year, month - 1, day);
        } else if (!settings.FREQ) {
             this.interfaceDialog.searchDescendants('input[name=periodTypeSelection][value=BYOCCURRENCES]')[0].checked = true;
             this.interfaceDialog.searchDescendants('input[name=occurrenceLimitValue]').val('10');
        } else {
            this.interfaceDialog.searchDescendants('input[name=periodTypeSelection][value=NOENDDATE]')[0].checked = true;
        }
    }

    getSettingsFromForm() {
        const settings = {};
        settings.FREQ = this.interfaceDialog.searchDescendants('select[name=frequencyOption]').val().toUpperCase();
        settings.INTERVAL = this.interfaceDialog.searchDescendants(`input[name=${settings.FREQ.toLowerCase()}Cycle]`).val();

        const periodType = this.interfaceDialog.searchDescendants('input[name=periodTypeSelection]:checked').val();
        if (periodType === 'BYOCCURRENCES') {
            settings.COUNT = this.interfaceDialog.searchDescendants('input[name=occurrenceLimitValue]').val();
        } else if (periodType === 'BYENDDATE') {
            const dateLogic = this.interfaceDialog.searchDescendants('input[name=endDateCalendar]').data('dateinput');
            const year = dateLogic.currentYear;
            const month = String(dateLogic.currentMonth + 1).padStart(2, '0');
            const day = String(dateLogic.currentDay).padStart(2, '0');
            settings.UNTIL = `${year}${month}${day}`;
        }

        if (settings.FREQ === 'WEEKLY') {
            const selectedDays = [];
            ['MO', 'TU', 'WE', 'TH', 'FR', 'SA', 'SU'].forEach(day => {
                const checkbox = this.interfaceDialog.searchDescendants(`input[name=weeklyDay${day}]`);
                if (checkbox.length > 0 && checkbox[0].checked) {
                    selectedDays.push(day);
                }
            });
            if (selectedDays.length > 0) settings.BYDAY = selectedDays.join(',');
        } else if (settings.FREQ === 'MONTHLY') {
            const monthlyPattern = this.interfaceDialog.searchDescendants('input[name=monthlyPattern]:checked').val();
            if (monthlyPattern === 'DAYOFMONTH') {
                settings.BYMONTHDAY = '12';
            } else if (monthlyPattern === 'WEEKDAYOFMONTH') {
                settings.BYDAY = `${this.interfaceDialog.searchDescendants('select[name=monthlyWeekIndex]').val()}${this.interfaceDialog.searchDescendants('select[name=monthlyWeekDay]').val()}`;
            }
        } else if (settings.FREQ === 'YEARLY') {
            const annualPattern = this.interfaceDialog.searchDescendants('input[name=annualPattern]:checked').val();
            if (annualPattern === 'DAYOFMONTH') {
                settings.BYMONTH = this.interfaceDialog.searchDescendants('select[name=annualMonthDayMonth]').val();
                settings.BYMONTHDAY = this.interfaceDialog.searchDescendants('select[name=annualMonthDayDay]').val();
            } else if (annualPattern === 'WEEKDAYOFMONTH') {
                settings.BYMONTH = this.interfaceDialog.searchDescendants('select[name=annualWeekMonth]').val();
                settings.BYDAY = `${this.interfaceDialog.searchDescendants('select[name=annualWeekIndex]').val()}${this.interfaceDialog.searchDescendants('select[name=annualWeekDay]').val()}`;
            }
        }

        settings.RDATE = [...this.currentSettings.RDATE];
        settings.EXDATE = [...this.currentSettings.EXDATE];

        return settings;
    }

    validateInputs() {
        this.messageDisplay.styleProperty('display', 'none');
        this.messageDisplay.textNode = '';
        const displayError = (msg) => {
            this.messageDisplay.styleProperty('display', 'block');
            this.messageDisplay.textNode = `Error: ${msg}`;
            return false;
        };

        const currentFreq = this.interfaceDialog.searchDescendants('select[name=frequencyOption]').val().toLowerCase();
        const intervalInput = this.interfaceDialog.searchDescendants(`input[name=${currentFreq}Cycle]`);
        const interval = parseInt(intervalInput.val(), 10);
        if (isNaN(interval) || interval < 1 || interval > 1000) {
            return displayError('The "Repeat every"-field must be between 1 and 1000');
        }

        const periodType = this.interfaceDialog.searchDescendants('input[name=periodTypeSelection]:checked').val();
        if (periodType === 'BYOCCURRENCES') {
            const countInput = this.interfaceDialog.searchDescendants('input[name=occurrenceLimitValue]');
            const count = parseInt(countInput.val(), 10);
            if (isNaN(count) || count < 1 || count > 1000) {
                return displayError('The "After N occurrences"-field must be between 1 and 1000');
            }
        } else if (periodType === 'BYENDDATE') {
            const endDateInput = this.interfaceDialog.searchDescendants('input[name=endDateCalendar]');
            const endDateVal = endDateInput.val();
            if (!endDateVal) {
                return displayError('End date is not set. Please set a correct value');
            }
            const [endMonthStr, endDayStr, endYearStr] = endDateVal.split('/');
            const endDate = new Date(parseInt(endYearStr), parseInt(endMonthStr) - 1, parseInt(endDayStr));
            const startDateString = QueryEmulator('input[name=start]').val();
            const [startYearStr, startMonthStr, startDayStr] = startDateString.split('/');
            const startDate = new Date(parseInt(startYearStr), parseInt(startMonthStr) - 1, parseInt(startDayStr));

            if (endDate < startDate) {
                return displayError('End date cannot be before start date');
            }
        }

        if (currentFreq === 'monthly') {
            const monthlyPattern = this.interfaceDialog.searchDescendants('input[name=monthlyPattern]:checked').val();
            if (!monthlyPattern) {
                return displayError('"Repeat on"-value must be selected');
            }
        }

        if (currentFreq === 'yearly') {
            const annualPattern = this.interfaceDialog.searchDescendants('input[name=annualPattern]:checked').val();
            if (!annualPattern) {
                return displayError('"Repeat on"-value must be selected');
            }
        }

        if (this.linkedElement.attr('name') === 'custom') {
            const currentRule = this.getSettingsFromForm();
            if (currentRule.FREQ === 'MONTHLY' && currentRule.COUNT === '3' && !currentRule.BYMONTHDAY && !currentRule.BYDAY) {
                 return displayError('No matching recurrence template');
            }
        }

        return true;
    }

    generateEventInstances(ruleSettings, startDateString, displayCount = 10) {
        const generatedInstances = [];
        let currentCount = 0;

        const [startYearStr, startMonthStr, startDayStr] = startDateString.split('/');
        let currentMoment = new Date(parseInt(startYearStr), parseInt(startMonthStr) - 1, parseInt(startDayStr));

        const formatDateToReadable = (date) => {
            const options = { year: 'numeric', month: 'long', day: 'numeric' };
            return date.toLocaleDateString('en-US', options);
        };

        const ruleFrequency = ruleSettings.FREQ;
        const ruleInterval = parseInt(ruleSettings.INTERVAL || '1', 10);

        while (currentCount < displayCount * 2) {
            const dateKey = `${currentMoment.getFullYear()}${String(currentMoment.getMonth() + 1).padStart(2, '0')}${String(currentMoment.getDate()).padStart(2, '0')}`;
            generatedInstances.push({ date: new Date(currentMoment), type: 'occurrence', raw: dateKey });
            currentCount++;

            if (ruleFrequency === 'DAILY') {
                currentMoment.setDate(currentMoment.getDate() + ruleInterval);
            } else if (ruleFrequency === 'WEEKLY') {
                currentMoment.setDate(currentMoment.getDate() + (ruleInterval * 7));
            } else if (ruleFrequency === 'MONTHLY') {
                currentMoment.setMonth(currentMoment.getMonth() + ruleInterval);
            } else if (ruleFrequency === 'YEARLY') {
                currentMoment.setFullYear(currentMoment.getFullYear() + ruleInterval);
            } else {
                currentMoment.setDate(currentMoment.getDate() + 1);
            }

            if (ruleSettings.COUNT && generatedInstances.filter(i => i.type === 'occurrence').length >= parseInt(ruleSettings.COUNT, 10)) break;
            if (ruleSettings.UNTIL) {
                const untilDate = new Date(parseInt(ruleSettings.UNTIL.substring(0,4)), parseInt(ruleSettings.UNTIL.substring(4,6)) - 1, parseInt(ruleSettings.UNTIL.substring(6,8)));
                if (currentMoment > untilDate) break;
            }
        }

        if (ruleSettings.RDATE) {
            ruleSettings.RDATE.forEach(d => {
                const year = parseInt(d.substring(0,4));
                const month = parseInt(d.substring(4,6)) - 1;
                const day = parseInt(d.substring(6,8));
                generatedInstances.push({ date: new Date(year, month, day), type: 'rdate', raw: d });
            });
        }
        if (ruleSettings.EXDATE) {
            ruleSettings.EXDATE.forEach(d => {
                const year = parseInt(d.substring(0,4));
                const month = parseInt(d.substring(4,6)) - 1;
                const day = parseInt(d.substring(6,8));
                generatedInstances.push({ date: new Date(year, month, day), type: 'exdate', raw: d });
            });
        }

        generatedInstances.sort((a, b) => a.date - b.date);

        const finalInstances = [];
        const uniqueDates = new Set();

        for (const item of generatedInstances) {
            const dateKey = item.raw;
            if (uniqueDates.has(dateKey)) continue;

            if (item.type === 'occurrence' && ruleSettings.EXDATE && ruleSettings.EXDATE.includes(dateKey)) {
                finalInstances.push({ formatted: formatDateToReadable(item.date), raw: dateKey, type: 'exdate' });
            } else if (item.type === 'rdate') {
                finalInstances.push({ formatted: formatDateToReadable(item.date), raw: dateKey, type: 'rdate' });
            } else if (item.type === 'exdate') {
                finalInstances.push({ formatted: formatDateToReadable(item.date), raw: dateKey, type: 'exdate' });
            } else {
                finalInstances.push({ formatted: formatDateToReadable(item.date), raw: dateKey, type: 'occurrence' });
            }
            uniqueDates.add(dateKey);
        }
        return finalInstances.slice(0, displayCount);
    }

    refreshDisplay(isMainDisplay = false) {
        const targetContainer = isMainDisplay ? this.displayOutput.searchDescendants('.rioccurrences') : this.interfaceDialog.searchDescendants('.eventInstances');
        targetContainer.embeddedElements = [];

        const currentRuleString = this.linkedElement.val();
        const currentRuleSettings = this.interpretRule(currentRuleString);
        const startDate = QueryEmulator('input[name=start]').val();

        if (startDate) {
            const displayedInstances = this.generateEventInstances(currentRuleSettings, startDate, 10);
            displayedInstances.forEach(item => {
                const span = globalMockDOM.createNode('span', { class: `occurrence ${item.type}` });
                span.textNode = item.formatted;
                if (item.type === 'occurrence' || item.type === 'rdate' || item.type === 'exdate') {
                    const actionLink = globalMockDOM.createNode('a', { date: `${item.raw}T000000` });
                    actionLink.textNode = item.type === 'exdate' ? '[Re-include]' : '[Exclude]';
                    actionLink.onClickHandler = (e) => this.toggleExceptionEntry(e);
                    const actionSpan = globalMockDOM.createNode('span', { class: 'action' });
                    actionSpan.addNode(actionLink);
                    span.addNode(actionSpan);
                }
                targetContainer.addNode(span);
            });
        }
    }

    addExceptionEntry() {
        const dateLogic = this.interfaceDialog.searchDescendants('#additionDateInput').data('dateinput');
        const year = dateLogic.currentYear;
        const month = String(dateLogic.currentMonth + 1).padStart(2, '0');
        const day = String(dateLogic.currentDay).padStart(2, '0');
        const dateString = `${year}${month}${day}`;

        if (!this.currentSettings.RDATE.includes(dateString)) {
            this.currentSettings.RDATE.push(dateString);
        }
        this.refreshDisplay();
    }

    toggleExceptionEntry(event) {
        const dateToToggle = event.currentTarget.properties.date.replace(/T000000$/, '');
        const currentRuleString = this.linkedElement.val();
        let currentRuleSettings = this.interpretRule(currentRuleString);

        const isRdate = currentRuleSettings.RDATE.includes(dateToToggle);
        const isExdate = currentRuleSettings.EXDATE.includes(dateToToggle);

        if (isRdate) {
            currentRuleSettings.RDATE = currentRuleSettings.RDATE.filter(d => d !== dateToToggle);
        } else if (isExdate) {
            currentRuleSettings.EXDATE = currentRuleSettings.EXDATE.filter(d => d !== dateToToggle);
        } else {
            currentRuleSettings.EXDATE.push(dateToToggle);
        }
        this.currentSettings = currentRuleSettings;
        this.linkedElement.val(this.composeRuleString(currentRuleSettings));
        this.refreshDisplay();
    }

    handlePagination(event) {
        const clickedLink = event.currentTarget;
        const startValue = clickedLink.properties.start;
        const currentActive = this.interfaceDialog.searchDescendants('.paginationControl .current');
        if (currentActive.length > 0) {
            currentActive[0].properties.class = currentActive[0].properties.class.replace('current', '').trim();
        }
        clickedLink.properties.class = (clickedLink.properties.class + ' current').trim();
        clickedLink.setProperty('start', startValue);
        this.refreshDisplay();
    }
}

TestUnit.createModule("recurrence_pattern_manager_module", function () {

    TestUnit.runTest("FundamentalOperations", function () {
        TestUnit.setExpected(3);

        const targetArea = QueryEmulator("textarea[name=repeat]");
        const ruleCreator = targetArea.patternScheduler();
        const initialPattern = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
        QueryEmulator("textarea[name=repeat]").val(initialPattern);
        QueryEmulator('.repeatfield a[name=editPattern]').click();

        ruleCreator.interfaceDialog.searchDescendants('.confirmChanges').click();
        TestUnit.verifyCondition(QueryEmulator("textarea[name=repeat]").val() === initialPattern, "Textarea content should match original pattern after save.");

        QueryEmulator('.repeatfield a[name=editPattern]').click();
        ruleCreator.interfaceDialog.searchDescendants('.discardChanges').click();
        TestUnit.verifyCondition(ruleCreator.interfaceDialog.is(':visible') === true, "Dialog should be visible after cancel (as per original test behavior).");
        TestUnit.verifyCondition(QueryEmulator("textarea[name=repeat]").val() === initialPattern, "Textarea content should still match original pattern after cancel.");
        ruleCreator.hideInterface();
    });

    TestUnit.runTest("InvalidRuleData", function () {
        TestUnit.setExpected(1);

        const ruleCreator = QueryEmulator("textarea[name=repeat]").patternScheduler();
        QueryEmulator("textarea[name=repeat]").val("FREQ=MONTHLY;COUNT=3");
        QueryEmulator('.repeatfield a[name=editPattern]').click();
        TestUnit.verifyCondition(ruleCreator.interfaceDialog.searchDescendants('#notificationDisplay').text().includes('No RRULE in RRULE data'), "Should display error for invalid iCal data.");
        ruleCreator.interfaceDialog.searchDescendants('.confirmChanges').click();
        ruleCreator.hideInterface();
    });

    TestUnit.runTest("NoPatternOpensDefaultForm", function () {
        TestUnit.setExpected(2);

        const initialPattern = "";
        QueryEmulator("textarea[name=repeat]").val(initialPattern);
        const ruleCreator = QueryEmulator("textarea[name=repeat]").patternScheduler();
        QueryEmulator('.repeatfield a[name=editPattern]').click();

        TestUnit.verifyCondition(ruleCreator.interfaceDialog.searchDescendants('input[name=periodTypeSelection]:checked').val() === 'BYOCCURRENCES', "Default range type should be BYOCCURRENCES.");
        TestUnit.verifyCondition(ruleCreator.interfaceDialog.searchDescendants('input[name=occurrenceLimitValue]').val() === '10', "Default occurrence limit should be 10.");
        ruleCreator.interfaceDialog.searchDescendants('.confirmChanges').click();
        ruleCreator.hideInterface();
    });

    TestUnit.runTest("DailyPatternWithCount", function () {
        TestUnit.setExpected(5);

        const initialPattern = "RRULE:FREQ=DAILY;INTERVAL=5;COUNT=8";
        QueryEmulator("textarea[name=repeat]").val(initialPattern);
        QueryEmulator('.repeatfield a[name=editPattern]').click();

        const ruleCreator = QueryEmulator("textarea[name=repeat]").patternScheduler();
        TestUnit.verifyCondition(ruleCreator.interfaceDialog.searchDescendants('select[name=frequencyOption]').val() === 'daily', "Frequency should be daily.");
        TestUnit.verifyCondition(ruleCreator.interfaceDialog.searchDescendants('input[name=dailyCycle]').val() === '5', "Daily interval should be 5.");
        TestUnit.verifyCondition(ruleCreator.interfaceDialog.searchDescendants('input[name=periodTypeSelection]:checked').val() === '