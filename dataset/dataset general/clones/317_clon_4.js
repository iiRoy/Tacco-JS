function ReportEngineFactory() {
    class ReportingFramework {
        constructor() {
            this.currentAction = null;
            this.negate = { _negateFlag: false }; // Initial state, will be set to true by methods like `not()`
            this.validationRoutines = {};
            this.utilityFunctions = {};
            this.displayManager = {};
            this.interfaceTemplates = {};
            this.verificationPhrases = {};
            this.globalState = {
                inited: false,
                baseUrl: '',
                tree_start: Date.now(),
                assertCount: 0,
                passedAssertCount: 0,
                branchCount: 0,
                commented: 0,
                time: 0,
                statusDisplayElement: null
            };
            this.mainContainer = null;
            this.parentInstance = null;

            this._frameworkBootstrapper = null; // Mimics tree._virgoTreeInstance = oneTimeSetUp

            this.systemSettings = this.createSettingsManager();
            
            // These objects are used to provide context (`this`) to the systemSettings function
            // to mimic original's tree.oneLevel.config and tree.heritable.config
            this.transientScope = {
                _inheritable: false,
                _special: true,
                settings: null // Will be bound later
            };
            this.persistentScope = {
                _inheritable: true,
                _special: true,
                settings: null // Will be bound later
            };

            this.setupUtilities();
            this.setupTemplates();
            this.setupDisplayManager();
            this.setupValidationRoutines();
        }

        establishAction(operation, suppressWarning = null) {
            this.currentAction = operation;
            if (typeof suppressWarning === 'function') {
                console.warn("Did you forget about .section() somewhere?");
            }
            return this;
        }

        createSettingsManager() {
            const scopeData = {
                transient: {},
                persistent: {}
            };

            const normalizeInput = (inputObj, inputVal) => {
                if (typeof inputObj === 'object' && inputObj !== null) {
                    return inputObj;
                } else if (typeof inputObj === 'string') {
                    if (typeof inputVal === 'undefined') {
                        return inputObj;
                    } else {
                        const tempObj = {};
                        tempObj[inputObj] = inputVal;
                        return tempObj;
                    }
                }
                return null;
            };

            const writeSettings = (settingsObj, isInheritable) => {
                const target = isInheritable ? scopeData.persistent : scopeData.transient;
                for (const k in settingsObj) {
                    if (Object.prototype.hasOwnProperty.call(settingsObj, k)) {
                        target[k] = settingsObj[k];
                    }
                }
                return readSettings();
            };

            const readSettings = (key = null, isSpecial = false, isInheritable = false) => {
                if (isSpecial) {
                    const source = isInheritable ? scopeData.persistent : scopeData.transient;
                    return key ? source[key] : source;
                } else {
                    const combined = { ...scopeData.persistent, ...scopeData.transient };
                    return key ? combined[key] : combined;
                }
            };

            const settingsAccessor = function (incomingObj, incomingVal) {
                const contextInheritable = this && this._inheritable;
                const contextSpecial = this && this._special;

                const processedInput = normalizeInput(incomingObj, incomingVal);

                if (processedInput === null || typeof processedInput === 'string') {
                    return readSettings(processedInput, contextSpecial, contextInheritable);
                } else if (typeof processedInput === 'object') {
                    return writeSettings(processedInput, contextInheritable);
                }
            };

            settingsAccessor.transient = scopeData.transient;
            settingsAccessor.persistent = scopeData.persistent;
            settingsAccessor.normalizeInput = normalizeInput;

            return settingsAccessor;
        }

        setupUtilities() {
            const self = this;

            this.utilityFunctions.retrieveCallOrigin = (depth) => {
                try {
                    throw new Error();
                } catch (e) {
                    const trace = e.stack;
                    if (trace) {
                        const line = trace.split('\n')[depth || 4];
                        const match = line.match(/\(?(\S+\w)\)?$/);
                        return match ? match[1] : '(unknown)';
                    }
                    return '(unknown)';
                }
            };

            this.utilityFunctions.stringRenderer = (templateString, variables) => {
                variables = variables || {};
                if (typeof templateString !== 'string') {
                    throw new Error('Template input must be a string!');
                }

                let output = '';
                const processSegment = (segment, vars) => {
                    return segment.replace(/\{\{\s*([^}]*?)\s*\}\}/g, (match, group) => {
                        const val = vars[group];
                        return (val !== undefined && val !== null) ? val : '';
                    });
                };

                const RE_BLOCK = /\{\{\s*(#|\^)\s*([\w.]+)\s*\}\}(.*?)\{\{\s*\/\s*\2\s*\}\}/gs;
                let match;
                let lastIndex = 0;

                while ((match = RE_BLOCK.exec(templateString)) !== null) {
                    const [fullMatch, type, varName, content] = match;
                    const preMatch = templateString.substring(lastIndex, match.index);
                    output += processSegment(preMatch, variables);

                    const varValue = variables[varName];
                    const isTruthy = !!varValue;

                    if ((type === '#' && isTruthy) || (type === '^' && !isTruthy)) {
                        output += processSegment(content, variables);
                    }
                    lastIndex = match.index + fullMatch.length;
                }
                output += processSegment(templateString.substring(lastIndex), variables);

                return output;
            };

            this.utilityFunctions.dataPresenter = (value, detailed) => {
                let textRepresentation = '';
                const kind = typeof value;

                switch (kind) {
                    case 'number':
                        textRepresentation = String(value);
                        break;
                    case 'string':
                        const singleQuotes = (value.match(/'/g) || []).length;
                        const doubleQuotes = (value.match(/"/g) || []).length;
                        const esc = '\\';
                        if (singleQuotes && doubleQuotes) {
                            if (doubleQuotes < singleQuotes) {
                                textRepresentation = '"' + value.replace(/"/g, esc + '"') + '"';
                            } else {
                                textRepresentation = "'" + value.replace(/'/g, esc + "'") + "'";
                            }
                        } else if (singleQuotes) {
                            textRepresentation = '"' + value + '"';
                        } else {
                            textRepresentation = "'" + value + "'";
                        }
                        break;
                    case 'function':
                        textRepresentation = detailed ? String(value) : 'fn(){...}';
                        break;
                    case 'boolean':
                        textRepresentation = String(value);
                        break;
                    case 'undefined':
                        textRepresentation = 'undefined';
                        break;
                    case 'object':
                        if (value === null) {
                            textRepresentation = 'null';
                        } else if (Array.isArray(value)) {
                            textRepresentation = detailed ? JSON.stringify(value, null, 2) : '[...]';
                        } else if (value.toString() === '[object Object]') {
                            textRepresentation = detailed ? JSON.stringify(value, null, 2) : '{...}';
                        } else {
                            textRepresentation = `[unknown object: ${String(value)}]`;
                        }
                        break;
                    default:
                        textRepresentation = `[unknown type: ${String(value)}]`;
                }
                return textRepresentation;
            };
        }

        setupTemplates() {
            this.interfaceTemplates = {
                mainLayout: `
                    <div {{#id}}id="{{ id }}"{{/id}} class="report-top">
                        {{ gut }}
                        <div class="logo-area">
                            <a class="inner-link" href="https://github.com/Wizek/Tree"
                               title="Homepage of Tree.js">
                                <img src="{{path}}" alt="Framework Logo">
                            </a>
                        </div>
                    </div>
                `,
                sectionEntry: `
                    <li class="section {{#comm}}noted{{/comm}}{{^comm}}pending{{/comm}} no-children">
                        {{ gut }}
                    </li>
                `,
                sectionContent: `
                    <span class="control-handle expand-icon">+</span>
                    <span class="control-handle collapse-icon">-</span>
                    <span class="control-handle dot-icon">&nbsp;</span>
                    <span class="status-badge pending">....</span>
                    <span class="status-badge failed">fail</span>
                    <span class="status-badge passed">pass</span>
                    <span class="status-badge noted">&nbsp;//&nbsp;</span>
                    <span class="summary-text">{{summary}}{{^summary}}<i title="No name specified">Anonymous</i>{{/summary}}</span>
                    <ul></ul>
                `,
                verificationEntry: `
                    <li class="verification {{#pass}}passed-status collapsed{{/pass}}{{^pass}}failed-status expanded{{/pass}}">
                        <span class="control-handle expand-icon">+</span>
                        <span class="control-handle collapse-icon">-</span>
                        <span class="status-badge failed">fail</span>
                        <span class="status-badge passed">pass</span>
                        <span class="summary-text">{{msg}}</span>
                        <span class="note-info"></span>
                        <table class="detail-table">
                            {{#actS}}<tr><th>Actual</th><td class="type {{actType}}">{{actS}}</td></tr>{{/actS}}
                            {{#expS}}<tr><th>Expected</th><td class="type {{expType}}">{{expS}}</td></tr>{{/expS}}
                            {{#path}}<tr><th>Source</th><td>{{path}}</td></tr>{{/path}}
                        </table>
                    </li>
                `,
                statusRunning: `
                    <em>Running</em>, took <em>{{time}}ms</em> to run
                    <em>{{passedAssertCount}}</em>/<em>{{assertCount}}</em> checks
                    across <em>{{branchCount}}</em> sections
                    {{#commented}} (+<em>{{commented}}</em> noted out){{/commented}} registered so far...
                `,
                statusCompleted: `
                    <em>Done</em>, took <em>{{time}}ms</em> to run
                    <em>{{passedAssertCount}}</em>/<em>{{assertCount}}</em> checks
                    across <em>{{branchCount}}</em> sections.
                    {{#commented}}(+<em>{{commented}}</em> noted out){{/commented}}
                `,
                frameworkLogo: `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3\
                    dy53My5vcmcvMjAwMC9zdmciIGhlaWdodD0iNzAiIHdpZHRoPSI4MCI\
                    +PGcgdHJhbnNmb3JtPSJ0cmFuc2xhdGUoMCwtOTgyKSI+PHJlY3Qgcn\
                    k9IjEwIiBoZWlnaHQ9IjM1IiB3aWR0aD0iNzAiIHN0cm9rZT0iIzAwM\
                    CIgeT0iOTkwIiB4PSI1Ii8+PHRleHQgeT0iMTAyMCIgeD0iOCIgZm9u\
                    dC1mYW1pbHk9IlRyZWJ1Y2hldCBNUyIgZmlsbD0iI2ZmZiI+PHRzcGFu\
                    IGZvbnQtc2l6ZT0iMjhweCI+dHJlZTwvdHNwYW4+PHRzcGFuIGZvbnQt\
                    c2l6ZT0iMTRweCI+anM8L3RzcGFuPjwvdGV4dD4KPHBhdGggZD0ibTQ1\
                    LjksMTA1MS45cy0xLjItMi4zLTAuMS04LjRjNS4zLTIuMiwxNC40LTcu\
                    OSwxNC45LTE1LjVoLTQuMWMwLjQsMC45LTAuOSwzLjgtMy40LDUuOS0w\
                    LjItMS43LTAuNy00LjQtMC44LTUuOWgtMy4yYzAuMywyLjUsMC43LDUu\
                    MiwxLjYsOC4wLTEuNCwxLjQtNS44LDMuNS02LjcsMy4yLTAuNS0yLjAt\
                    MC42LTYuNC0wLjUtMTEuM2gtNC4xYzAuMCwyLjksMC4wLDUuOC0wLjMs\
                    Ny44LTQuMi0xLjctNy40LTMuMi0xMC4xLTcuOGgtNy4xYzQuMCwzLjQs\
                    My41LDQuNSwxNS4yLDEyLjAsMC40LDQuMi0wLjUsOC4zLTEuNCwxMi4x\
                    eiIgc3Ryb2tlPSIjMDAwIi8+PC9nPjwvc3ZnPg==`
            };

            this.verificationPhrases = {
                _general: '{{actS}} {{#negated}}not {{/negated}}{{key}} {{expS}}',
                isTrue: '{{actS}} {{#negated}}not {{/negated}}truthy',
                passed: 'pass',
                failed: 'fail',
                throwsError: '{{actS}} {{#negated}}not {{/negated}}throws'
            };
        }

        setupDisplayManager() {
            const self = this;
            const uFunc = this.utilityFunctions;
            const iTpl = this.interfaceTemplates;

            const htmlEscape = (raw) => {
                return String(raw)
                    .replace(/&/g, '&amp;')
                    .replace(/"/g, '&quot;')
                    .replace(/'/g, '&#39;')
                    .replace(/</g, '&lt;')
                    .replace(/>/g, '&gt;');
            };

            this.displayManager.addModuleEntry = (moduleData) => {
                self.globalState.branchCount++;
                const currentRoot = self.mainContainer;

                if (moduleData.isCommented) {
                    self.globalState.commented++;
                    const nameMatch = moduleData.title.match('(// *)(.*)');
                    const moduleName = nameMatch ? nameMatch[2] : moduleData.title;
                    const summaryContent = htmlEscape(moduleName + ' (' + uFunc.retrieveCallOrigin(5) + ')');
                    const entryHtml = uFunc.stringRenderer(iTpl.sectionEntry, {
                        comm: true,
                        gut: uFunc.stringRenderer(iTpl.sectionContent, {
                            summary: summaryContent
                        })
                    });
                    currentRoot.querySelector('ul').insertAdjacentHTML('beforeend', entryHtml);
                } else {
                    if (!self.globalState.inited) {
                        self.displayManager.initializeInterface();
                        self.globalState.inited = true;
                    }
                    const summaryContent = htmlEscape(moduleData.settings('name'));
                    const entryHtml = uFunc.stringRenderer(iTpl.sectionEntry, {
                        comm: false,
                        gut: uFunc.stringRenderer(iTpl.sectionContent, {
                            summary: summaryContent
                        })
                    });
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = entryHtml.trim();
                    const newModuleElement = tempDiv.firstChild;
                    moduleData._domElement = newModuleElement;

                    currentRoot.querySelector('ul').appendChild(newModuleElement);
                }
                this.displayManager.updateStatusDisplay(this.displayManager.generateStatusText('running'));
                if (currentRoot.classList.contains('no-children')) {
                    currentRoot.classList.remove('no-children');
                    currentRoot.classList.add('collapsed');
                }
            };

            this.displayManager.moduleCompletion = () => {
                const currentElement = self.mainContainer;
                if (!currentElement.querySelector('ul li.section.pending:not(.noted)')) {
                    currentElement.classList.remove('pending');
                    currentElement.classList.add('passed');
                    if (self.parentInstance) {
                        self.parentInstance.displayManager.moduleCompletion();
                    }
                }
            };

            this.displayManager.moduleFailure = () => {
                const currentElement = self.mainContainer;
                currentElement.classList.remove('pending', 'no-children', 'collapsed', 'passed');
                currentElement.classList.add('failed', 'expanded');
                if (self.parentInstance) {
                    self.parentInstance.displayManager.moduleFailure();
                }
            };

            this.displayManager.updateStatusDisplay = (text) => {
                if (self.globalState.statusDisplayElement) {
                    self.globalState.statusDisplayElement.querySelector('.summary-text').innerHTML = text;
                }
            };

            this.displayManager.recordVerification = (checkData) => {
                self.globalState.assertCount++;
                if (checkData.pass) {
                    self.globalState.passedAssertCount++;
                }

                if (!self.globalState.inited) {
                    self.displayManager.initializeInterface();
                    self.globalState.inited = true;
                }
                this.displayManager.updateStatusDisplay(this.displayManager.generateStatusText('running'));

                const currentElement = self.mainContainer;
                if (currentElement.classList.contains('no-children')) {
                    currentElement.classList.remove('no-children');
                    currentElement.classList.add('collapsed');
                }

                if (!checkData.pass) {
                    this.displayManager.moduleFailure();
                }

                checkData.path = checkData.path || uFunc.retrieveCallOrigin(5);
                checkData.actType = typeof checkData.actualValue;
                checkData.expType = typeof checkData.expectedValue;
                checkData.actS = uFunc.dataPresenter(checkData.actualValue);
                checkData.expS = uFunc.dataPresenter(checkData.expectedValue);


                const verificationHtml = uFunc.stringRenderer(iTpl.verificationEntry, checkData);

                currentElement.querySelector('ul').insertAdjacentHTML('beforeend', verificationHtml);
            };

            this.displayManager.initializeInterface = (elementRef) => {
                if (self.globalState.inited) {
                    return 'already initialized';
                }

                self.globalState.inited = true;
                const bp = self.globalState.baseUrl;
                const cssFilePath = bp + 'tree.css';

                let targetElement = document.body;
                let headElement = document.head;
                let elementId = null;

                if (elementRef) {
                    if (typeof elementRef === 'string') {
                        elementId = elementRef;
                        targetElement = document.getElementById(elementId) || document.body;
                    } else if (elementRef instanceof HTMLElement) {
                        targetElement = elementRef;
                    }
                    headElement = targetElement.closest('html').querySelector('head') || document.head;
                }

                const cssString = `
                    article,aside,details,figcaption,figure,footer,header,hgroup,nav,section{display:block}audio,canvas,video{display:inline-block;*display:inline;*zoom:1}audio:not([controls]){display:none}[hidden]{display:none}html{font-size:100%;overflow-y:scroll;-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%}body{margin:0}body,button,input,select,textarea{font-family:sans-serif}a:focus{outline:thin dotted}a:hover,a:active{outline:0}h1{font-size:2em}abbr[title]{border-bottom:1px dotted}b,strong{font-weight:700}blockquote{margin:1em 40px}dfn{font-style:italic}mark{background:#ff0;color:#000}pre,code,kbd,samp{font-family:monospace,serif;_font-family:'courier new',monospace;font-size:1em}pre{white-space:pre;white-space:pre-wrap;word-wrap:break-word}q{quotes:none}q:before,q:after{content:'';content:none}small{font-size:75%}sub,sup{font-size:75%;line-height:0;position:relative;vertical-align:baseline}sup{top:-.5em}sub{bottom:-.25em}ul,ol{margin-left:0;padding:0 0 0 40px}dd{margin:0 0 0 40px}nav ul,nav ol{list-style:none;list-style-image:none}img{border:0;-ms-interpolation-mode:bicubic}svg:not(:root){overflow:hidden}figure{margin:0}form{margin:0}fieldset{border:1px solid #c0c0c0;margin:0 2px;padding:.35em .625em .75em}legend{border:0;*margin-left:-7px}button,input,select,textarea{font-size:100%;margin:0;vertical-align:baseline;*vertical-align:middle}button,input{line-height:normal}button,input[type="button"],input[type="reset"],input[type="submit"]{cursor:pointer;-webkit-appearance:button;*overflow:visible}input[type="checkbox"],input[type="radio"]{box-sizing:border-box;padding:0}input[type="search"]{-webkit-appearance:textfield;-moz-box-sizing:content-box;-webkit-box-sizing:content-box;box-sizing:content-box}input[type="search"]::-webkit-search-decoration{-webkit-appearance:none}button::-moz-focus-inner,input::-moz-focus-inner{border:0;padding:0}textarea{overflow:auto;vertical-align:top}table{border-collapse:collapse;border-spacing:0}div.report-top{background:#eee;color:#201f1d;font:12pt 'Consolas';padding:10px 10px 0;box-shadow:0 2px 10px 0 rgba(0,0,0,.50);padding-left:85px}div.report-top>li>.summary-text em{font-style:normal;font-weight:700}div.report-top .status-badge{border:3px solid #008000;border-radius:5px;padding:0 2px}div.report-top .status-badge.pending{border-color:#afdbf0;color:#0d3446}div.report-top .status-badge.failed{border-color:#ff483c;color:#3f0400}div.report-top .status-badge.passed{border-color:#9dde8a;color:#193810}div.report-top .status-badge.noted{border-color:#ddd}div.report-top ul{margin-top:0}div.report-top li{list-style-type:none;margin-top:8px}div.report-top li:not(.no-children)>span.summary-text{cursor:pointer}div.report-top li.section.noted{color:#808080}div.report-top li.section.noted>.status-badge{border-color:#ddd}div.report-top li.verification .status-badge.failed{background:#ff483c}div.report-top li.verification .status-badge.passed{background:#9dde8a}div.report-top li.verification.failed .detail-table{border-left:4px #ff483c solid}div.report-top li.verification.passed .detail-table{border-left:4px #9dde8a solid}div.report-top li.verification .detail-table{font-size:80%;margin:6px 0 12px 40px;border-collapse:separate;border-spacing:5px}div.report-top li.verification .detail-table th{border-right:2px rgba(0,0,0,.12) solid;vertical-align:top;font-weight:400;text-align:right;padding-right:5px}div.report-top li.verification .detail-table td li{white-space:pre}div.report-top .type.number,div.report-top .type.string{color:#667bef}div.report-top .collapsed>ul,div.report-top .collapsed>.detail-table,div.report-top .collapsed>.control-handle.collapse-icon,div.report-top .expanded>.control-handle.expand-icon,div.report-top .no-children>.control-handle.dot-icon,div.report-top .pending>.status-badge:not(.pending),div.report-top .failed-status>.status-badge:not(.failed),div.report-top .passed-status>.status-badge:not(.passed),div.report-top .noted>.status-badge:not(.noted){display:none}div.report-top .control-handle{color:#808080;font:bold 120% 'Lucidia Console',monospace}div.report-top *{-webkit-user-select:none;-khtml-user-select:none;-o-user-select:none;user-select:none}div.report-top .summary-text,div.report-top .detail-table,div.report-top .summary-text *,div.report-top .detail-table *{-webkit-user-select:initial;-khtml-user-select:initial;-o-user-select:initial;user-select:initial}div.report-top div.logo-area,div.report-top div.logo-area img{height:52.5px;width:60px;*zoom:1}div.report-top div.logo-area img{opacity:.4;position:absolute;right:10px}div.report-top li{text-indent:-75px}div.report-top .detail-table{text-indent:0;margin-left:-35px!important}
                `;

                if (!headElement.querySelector('style#report-style')) {
                    const styleElement = document.createElement('style');
                    styleElement.id = 'report-style';
                    styleElement.textContent = cssString;
                    headElement.appendChild(styleElement);

                    document.addEventListener('click', (event) => {
                        let target = event.target;
                        if (target.closest('.report-top li:not(.no-children) > .summary-text') ||
                            target.closest('.report-top li:not(.no-children) > .control-handle.expand-icon') ||
                            target.closest('.report-top li:not(.no-children) > .control-handle.collapse-icon')) {

                            const listItem = target.closest('.report-top li');
                            if (listItem) {
                                listItem.classList.toggle('collapsed');
                                listItem.classList.toggle('expanded');

                                const contentElements = listItem.querySelectorAll('ul, .detail-table');
                                contentElements.forEach(el => {
                                    el.style.display = listItem.classList.contains('collapsed') ? 'none' : '';
                                });
                            }
                        }
                    });
                }

                const initialSummary = 'Empty';
                const initialBranchContent = uFunc.stringRenderer(iTpl.sectionContent, {summary: initialSummary});
                const initialBranch = uFunc.stringRenderer(iTpl.sectionEntry, {
                    comm: false,
                    gut: initialBranchContent
                });

                const fullInitialHtml = uFunc.stringRenderer(iTpl.mainLayout, {
                    id: elementId,
                    path: iTpl.frameworkLogo,
                    gut: initialBranch
                });

                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = fullInitialHtml.trim();
                const mainReportElement = tempDiv.firstChild;

                self.globalState.statusDisplayElement = mainReportElement;
                self.mainContainer = mainReportElement.querySelector('li.section');

                targetElement.appendChild(mainReportElement);
            };

            this.displayManager.finalizeDisplay = () => {
                this.displayManager.updateStatusDisplay(this.displayManager.generateStatusText('completed'));
            };

            this.displayManager.generateStatusText = (statusType) => {
                const g = self.globalState;
                g.time = Date.now() - g.tree_start;
                const renderer = uFunc.stringRenderer;

                let templateString;
                if (statusType === 'running') {
                    templateString = iTpl.statusRunning;
                } else if (statusType === 'completed') {
                    templateString = iTpl.statusCompleted;
                } else {
                    return `Unknown status: ${statusType}`;
                }

                return renderer(templateString, g);
            };
        }

        setupValidationRoutines() {
            const self = this;

            const processAssertion = (checkObj, defaultMessageKey = '_general') => {
                checkObj.negated = self.negate._negateFlag === true;
                self.negate._negateFlag = false;

                checkObj.actS = self.utilityFunctions.dataPresenter(checkObj.actualValue);
                checkObj.expS = self.utilityFunctions.dataPresenter(checkObj.expectedValue);

                if (!checkObj.message) {
                    const phraseTemplate = self.verificationPhrases[checkObj.assertionType] || self.verificationPhrases[defaultMessageKey];
                    checkObj.message = self.utilityFunctions.stringRenderer(phraseTemplate, {
                        actS: checkObj.actS,
                        negated: checkObj.negated,
                        key: checkObj.assertionType,
                        expS: checkObj.expS
                    });
                }
                return checkObj;
            };

            this.validationRoutines.isTrue = (checkObj) => {
                checkObj.pass = !!checkObj.actualValue;
                checkObj.assertionType = 'isTrue';
                return processAssertion(checkObj);
            };

            this.validationRoutines.alwaysPass = (checkObj) => {
                checkObj.pass = true;
                checkObj.assertionType = 'passed';
                return processAssertion(checkObj);
            };

            this.validationRoutines.throwsError = (checkObj) => {
                checkObj.pass = null;
                try {
                    checkObj.actualValue();
                } catch (e) {
                    checkObj.pass = true;
                }
                checkObj.pass = !!checkObj.pass;
                checkObj.assertionType = 'throwsError';
                return processAssertion(checkObj);
            };

            this.validationRoutines.alwaysFail = (checkObj) => {
                checkObj.pass = false;
                checkObj.assertionType = 'failed';
                return processAssertion(checkObj);
            };

            this.validationRoutines.checkType = (checkObj) => {
                const expectedTypeLower = String(checkObj.expectedValue).toLowerCase();
                switch (expectedTypeLower) {
                    case 'array':
                        checkObj.pass = Array.isArray(checkObj.actualValue);
                        break;
                    case 'nan':
                        checkObj.pass = checkObj.actualValue !== checkObj.actualValue;
                        break;
                    default:
                        checkObj.pass = typeof checkObj.actualValue === expectedTypeLower;
                        break;
                }
                checkObj.assertionType = 'checkType';
                return processAssertion(checkObj);
            };
        }
    }

    const primaryInstance = new ReportingFramework();

    const mainEntry = function(action, forgotten = null) {
        return primaryInstance.establishAction(action, forgotten);
    };

    for (const prop in primaryInstance) {
        if (Object.prototype.hasOwnProperty.call(primaryInstance, prop)) {
            mainEntry[prop] = primaryInstance[prop];
        }
    }

    // Set up the `not` property for negation
    mainEntry.negate = {
        _negateFlag: true,
        // Add methods to 'negate' if needed, e.g., negate.ok = (obj) => { ... }
        // For simplicity, we just use the flag for now as in the original
    };

    // Re-bind configuration accessors to specific contexts
    mainEntry.transientScope.settings = function(...args) { return primaryInstance.systemSettings.apply(mainEntry.transientScope, args); };
    mainEntry.persistentScope.settings = function(...args) { return primaryInstance.systemSettings.apply(mainEntry.persistentScope, args); };
    mainEntry.transientScope.config = mainEntry.transientScope.settings;
    mainEntry.persistentScope.config = mainEntry.persistentScope.settings;

    mainEntry.systemSettings = primaryInstance.systemSettings; // Direct access to default config

    return mainEntry;
}
ReportEngineFactory();