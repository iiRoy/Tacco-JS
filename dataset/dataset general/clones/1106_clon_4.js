(function( externalContext ) {

    let currentDragOriginator = null; // Stores the path of the element being dragged

    const logIssue = (message) => {
        if (window.console) { console.error(message); }
    };

    const queryDataAtRoute = (sourceStructure, routeSegments, fallbackValue) => {
        if (!routeSegments || routeSegments.length === 0) {
            return sourceStructure;
        }
        let currentFragment = sourceStructure;
        for (let k of routeSegments) {
            if (currentFragment === null || typeof currentFragment !== 'object' || !currentFragment.hasOwnProperty(k)) {
                return fallbackValue;
            }
            currentFragment = currentFragment[k];
        }
        return currentFragment;
    };

    const alterDataAtRoute = (sourceStructure, routeSegments, updatedValue) => {
        if (!routeSegments || routeSegments.length === 0) {
            return updatedValue;
        }

        let newStructure = JSON.parse(JSON.stringify(sourceStructure)); // Deep clone for immutability
        let fragmentRef = newStructure;
        const lastSegmentIndex = routeSegments.length - 1;

        for (let i = 0; i < lastSegmentIndex; i++) {
            const segment = routeSegments[i];
            if (!fragmentRef.hasOwnProperty(segment) || fragmentRef[segment] === null || typeof fragmentRef[segment] !== 'object') {
                fragmentRef[segment] = {};
            }
            fragmentRef = fragmentRef[segment];
        }

        const finalSegment = routeSegments[lastSegmentIndex];
        if (arguments.length === 2) { // Deletion operation
            if (Array.isArray(fragmentRef)) {
                fragmentRef.splice(parseInt(finalSegment, 10), 1);
            } else {
                delete fragmentRef[finalSegment];
            }
        } else { // Set operation
            fragmentRef[finalSegment] = updatedValue;
        }
        return newStructure;
    };

    const determineKind = (datum) => {
        if (datum === null) return 'nil';
        if (datum instanceof Date) return 'moment';
        if (Array.isArray(datum)) return 'sequence';
        if (typeof datum === 'object') return 'map';
        if (typeof datum === 'boolean') return 'logic';
        if (typeof datum === 'string') return 'text';
        if (typeof datum === 'number') return 'numeric';
        return 'unidentified';
    };

    const decodeText = (textInput) => {
        try { return JSON.parse(textInput); }
        catch (e) { logIssue('Text decoding failure: ' + e.message); return null; }
    };

    const encodeValue = (datum) => {
        try { return JSON.stringify(datum); }
        catch (e) { logIssue('Value encoding failure.'); return 'nil'; }
    };

    const createDomNode = (tag, properties = {}, progeny = []) => {
        const node = document.createElement(tag);
        for (const key in properties) {
            if (key.startsWith('data-')) {
                node.setAttribute(key, properties[key]);
            } else {
                node[key] = properties[key];
            }
        }
        progeny.forEach(child => {
            if (typeof child === 'string') {
                node.appendChild(document.createTextNode(child));
            } else {
                node.appendChild(child);
            }
        });
        return node;
    };

    class ObjectViewEditor {
        constructor(renderTarget, initialModel, editorOptions = {}) {
            this.canvas = renderTarget;
            this.config = {
                onModelModified: editorOptions.change || (() => {}),
                onPathSelected: editorOptions.propertyclick || (() => {}),
                originalInputModel: initialModel,
            };

            this.internalState = {
                currentModel: JSON.parse(JSON.stringify(initialModel)),
                dragOperation: {
                    sourcePath: null,
                    targetPath: null
                }
            };

            this.canvas.addEventListener('click', this.processUserActivity.bind(this));
            this.canvas.addEventListener('change', this.processUserActivity.bind(this));
            this.canvas.addEventListener('input', this.processUserActivity.bind(this));
            this.canvas.addEventListener('dragstart', this.handleDragCommence.bind(this));
            this.canvas.addEventListener('dragover', this.handleDragOverElement.bind(this));
            this.canvas.addEventListener('drop', this.handleDropElement.bind(this));
            this.canvas.addEventListener('dragenter', this.handleDragEnterElement.bind(this));
            this.canvas.addEventListener('dragleave', this.handleDragLeaveElement.bind(this));
            this.canvas.addEventListener('dragend', this.handleDragCompletion.bind(this));

            this.renderVisuals();
        }

        dispatchAction(actionIdentity, payload) {
            let nextState = { ...this.internalState };

            switch (actionIdentity) {
                case 'UPDATE_VALUE': {
                    const { route, val } = payload;
                    nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, route, val);
                    break;
                }
                case 'UPDATE_KEY': {
                    const { oldRoute, newKey, val } = payload;
                    let parentRoute = oldRoute.slice(0, -1);
                    nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, oldRoute);
                    nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, [...parentRoute, newKey], val);
                    break;
                }
                case 'ADD_ELEMENT': {
                    const { route } = payload;
                    let targetModel = queryDataAtRoute(this.internalState.currentModel, route);
                    if (determineKind(targetModel) === 'sequence') {
                        nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, route, [...targetModel, null]);
                    } else if (determineKind(targetModel) === 'map') {
                        let newMemberKey = 'newMember';
                        let counter = 1;
                        while (targetModel.hasOwnProperty(newMemberKey)) {
                            newMemberKey = `newMember${counter}`;
                            counter++;
                        }
                        nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, [...route, newMemberKey], null);
                    }
                    break;
                }
                case 'REMOVE_ELEMENT': {
                    const { route } = payload;
                    nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, route);
                    break;
                }
                case 'REARRANGE_SEQUENCE_ITEM': {
                    const { parentRoute, originalIndex, newPositionIndex } = payload;
                    let currentSequence = queryDataAtRoute(this.internalState.currentModel, parentRoute);
                    if (Array.isArray(currentSequence)) {
                        let temporaryArray = [...currentSequence];
                        const [movedItem] = temporaryArray.splice(originalIndex, 1);
                        temporaryArray.splice(newPositionIndex, 0, movedItem);
                        nextState.currentModel = alterDataAtRoute(this.internalState.currentModel, parentRoute, temporaryArray);
                    }
                    break;
                }
                case 'SET_DRAG_ORIGIN': {
                    nextState.dragOperation.sourcePath = payload.route;
                    break;
                }
                case 'CLEAR_DRAG_ORIGIN': {
                    nextState.dragOperation.sourcePath = null;
                    break;
                }
                case 'SET_DRAG_DESTINATION': {
                    nextState.dragOperation.targetPath = payload.route;
                    break;
                }
                case 'CLEAR_DRAG_DESTINATION': {
                    nextState.dragOperation.targetPath = null;
                    break;
                }
                default:
                    logIssue(`Unrecognized action: ${actionIdentity}`);
                    return;
            }

            this.internalState = nextState;
            this.renderVisuals();
            this.config.onModelModified(this.internalState.currentModel);
        }

        processUserActivity(evt) {
            const activatedElement = evt.target;
            const routeAttribute = activatedElement.closest('[data-element-route]')?.dataset.elementRoute;
            const currentRoute = routeAttribute ? routeAttribute.split('.') : [];
            const activityType = activatedElement.dataset.activity;
            const nodeKind = activatedElement.dataset.nodeKind;

            if (!activityType && !nodeKind && !activatedElement.classList.contains('input-value-field') && !activatedElement.classList.contains('input-key-field')) {
                return;
            }

            switch (activityType) {
                case 'toggle-expansion':
                    activatedElement.closest('[data-node-kind="map"], [data-node-kind="sequence"]').classList.toggle('expanded-state');
                    break;
                case 'add-item':
                    this.dispatchAction('ADD_ELEMENT', { route: currentRoute, kind: nodeKind });
                    break;
                case 'remove-item':
                    this.dispatchAction('REMOVE_ELEMENT', { route: currentRoute });
                    break;
                default:
                    if (activatedElement.classList.contains('input-key-field')) {
                        if (evt.type === 'change') {
                            const priorKey = activatedElement.dataset.storedKey;
                            const newKey = activatedElement.value;
                            if (newKey !== priorKey) {
                                const parentRoute = currentRoute.slice(0, -1);
                                const priorRoute = [...parentRoute, priorKey];
                                const currentItemValue = queryDataAtRoute(this.internalState.currentModel, priorRoute);
                                this.dispatchAction('UPDATE_KEY', { oldRoute: priorRoute, newKey, val: currentItemValue });
                            }
                            activatedElement.dataset.storedKey = newKey;
                        } else if (evt.type === 'click') {
                            const safePath = currentRoute.map(s => `'${s}'`).join('][');
                            this.config.onPathSelected(`[${safePath}]`);
                        }
                    } else if (activatedElement.classList.contains('input-value-field')) {
                        if (evt.type === 'change') {
                            const parentRoute = currentRoute.slice(0, -1);
                            const finalKey = currentRoute[currentRoute.length - 1];
                            const fullItemRoute = [...parentRoute, finalKey];
                            const extractedValue = this.extractInputNodeValue(activatedElement);
                            this.dispatchAction('UPDATE_VALUE', { route: fullItemRoute, val: extractedValue });
                        }
                    } else if (activatedElement.classList.contains('type-selector')) {
                        if (evt.type === 'change') {
                            const selectedRawValue = activatedElement.value;
                            let parsedSelectedValue = decodeText(selectedRawValue);
                            let newKind = determineKind(parsedSelectedValue);

                            if (newKind === 'text') {
                                const parseAttempt = Date.parse(parsedSelectedValue);
                                if (!isNaN(parseAttempt)) {
                                    newKind = 'moment';
                                    parsedSelectedValue = new Date(parseAttempt);
                                }
                            }
                            this.dispatchAction('UPDATE_VALUE', { route: currentRoute, val: parsedSelectedValue });
                        }
                    }
                    break;
            }
        }

        handleDragCommence(evt) {
            const dragTarget = evt.target.closest('.item-node[draggable="true"]');
            if (dragTarget) {
                const routeString = dragTarget.dataset.elementRoute;
                const routeArray = routeString ? routeString.split('.') : [];
                evt.dataTransfer.setData('text/plain', routeString);
                evt.dataTransfer.effectAllowed = 'move';
                this.dispatchAction('SET_DRAG_ORIGIN', { route: routeArray });
                dragTarget.classList.add('is-dragging');
            }
        }

        handleDragOverElement(evt) {
            evt.preventDefault();
            const dropTarget = evt.target.closest('.item-node');
            const dragOriginRoute = this.internalState.dragOperation.sourcePath;

            if (dropTarget && dragOriginRoute) {
                const targetRouteString = dropTarget.dataset.elementRoute;
                const targetRouteArray = targetRouteString ? targetRouteString.split('.') : [];

                if (dragOriginRoute.length === targetRouteArray.length &&
                    dragOriginRoute.slice(0, -1).join('.') === targetRouteArray.slice(0, -1).join('.')) {
                    evt.dataTransfer.dropEffect = 'move';
                    if (!this.internalState.dragOperation.targetPath || this.internalState.dragOperation.targetPath.join('.') !== targetRouteString) {
                        if (this.internalState.dragOperation.targetPath) {
                            const previousTargetElement = this.canvas.querySelector(`[data-element-route="${this.internalState.dragOperation.targetPath.join('.')}"]`);
                            previousTargetElement?.classList.remove('drag-hover');
                        }
                        dropTarget.classList.add('drag-hover');
                        this.dispatchAction('SET_DRAG_DESTINATION', { route: targetRouteArray });
                    }
                } else {
                    evt.dataTransfer.dropEffect = 'none';
                }
            } else {
                evt.dataTransfer.dropEffect = 'none';
            }
        }

        handleDragEnterElement(evt) {
            evt.preventDefault();
        }

        handleDragLeaveElement(evt) {
            const dropTarget = evt.target.closest('.item-node');
            if (dropTarget && dropTarget.classList.contains('drag-hover')) {
                dropTarget.classList.remove('drag-hover');
                this.dispatchAction('CLEAR_DRAG_DESTINATION');
            }
        }

        handleDropElement(evt) {
            evt.preventDefault();
            const sourcePathString = evt.dataTransfer.getData('text/plain');
            const sourceRoute = sourcePathString ? sourcePathString.split('.') : null;
            const dropTarget = evt.target.closest('.item-node');

            if (sourceRoute && dropTarget) {
                const targetPathString = dropTarget.dataset.elementRoute;
                const targetRoute = targetPathString ? targetPathString.split('.') : [];

                if (sourceRoute.length === targetRoute.length &&
                    sourceRoute.slice(0, -1).join('.') === targetRoute.slice(0, -1).join('.')) {

                    const parentRoute = sourceRoute.slice(0, -1);
                    const originalIndex = parseInt(sourceRoute[sourceRoute.length - 1], 10);
                    const newPositionIndex = parseInt(targetRoute[targetRoute.length - 1], 10);

                    if (!isNaN(originalIndex) && !isNaN(newPositionIndex) && originalIndex !== newPositionIndex) {
                        this.dispatchAction('REARRANGE_SEQUENCE_ITEM', { parentRoute, originalIndex, newPositionIndex });
                    }
                }
            }
            this.resetDragState();
        }

        handleDragCompletion(evt) {
            this.resetDragState();
        }

        resetDragState() {
            this.dispatchAction('CLEAR_DRAG_ORIGIN');
            this.dispatchAction('CLEAR_DRAG_DESTINATION');
            this.canvas.querySelectorAll('.is-dragging').forEach(el => el.classList.remove('is-dragging'));
            this.canvas.querySelectorAll('.drag-hover').forEach(el => el.classList.remove('drag-hover'));
        }

        extractInputNodeValue(inputElement) {
            const valueKind = inputElement.closest('[data-kind-identifier]').dataset.kindIdentifier;
            let extracted = null;

            switch (valueKind) {
                case 'text':
                    extracted = inputElement.value;
                    break;
                case 'moment':
                    const parsedTimestamp = Date.parse(inputElement.value);
                    if (isNaN(parsedTimestamp)) {
                        logIssue("Invalid date detected.");
                        inputElement.classList.add('invalid-input-format');
                        extracted = new Date(0);
                    } else {
                        inputElement.classList.remove('invalid-input-format');
                        extracted = new Date(parsedTimestamp);
                    }
                    break;
                case 'logic':
                    extracted = inputElement.checked;
                    break;
                case 'numeric':
                    const numParsed = parseFloat(inputElement.value);
                    extracted = isNaN(numParsed) ? 0 : numParsed;
                    break;
                case 'nil':
                    extracted = null;
                    break;
                default:
                    extracted = decodeText(inputElement.value || 'null');
                    break;
            }
            return extracted;
        }

        renderVisuals() {
            this.canvas.innerHTML = '';
            const editorWrapper = createDomNode('div', { className: 'model-editor-wrapper' });
            editorWrapper.appendChild(this.presentNode(this.internalState.currentModel, []));
            this.canvas.appendChild(editorWrapper);
        }

        presentNode(dataUnit, currentPath) {
            const kind = determineKind(dataUnit);
            const pathString = currentPath.join('.');

            if (currentPath.length === 0) {
                 return this.presentValueComponent(dataUnit, currentPath, kind);
            }

            const itemNode = createDomNode('div', {
                className: `item-node node-kind-${kind}`,
                'data-element-route': pathString,
                'data-kind-identifier': kind,
                draggable: kind === 'sequence' ? 'true' : 'false'
            });

            const keyComponent = createDomNode('div', { className: 'item-key-component' });
            const valueComponent = createDomNode('div', { className: 'item-value-component' });
            const controlButtons = createDomNode('div', { className: 'item-control-buttons' });

            if (kind === 'map' || kind === 'sequence') {
                keyComponent.appendChild(createDomNode('span', { className: 'expansion-toggle', 'data-activity': 'toggle-expansion' }));
            } else {
                const keyInput = createDomNode('input', {
                    type: 'text',
                    className: 'input-key-field',
                    value: currentPath[currentPath.length - 1],
                    'data-stored-key': currentPath[currentPath.length - 1],
                });
                keyComponent.appendChild(keyInput);
            }

            valueComponent.appendChild(this.presentValueComponent(dataUnit, currentPath, kind));

            const deleteButton = createDomNode('button', {
                className: 'action-button action-remove',
                'data-activity': 'remove-item',
                title: 'Delete this item'
            }, ['−']);
            controlButtons.appendChild(deleteButton);

            itemNode.appendChild(keyComponent);
            itemNode.appendChild(valueComponent);
            itemNode.appendChild(controlButtons);

            return itemNode;
        }

        presentValueComponent(dataUnit, currentPath, kind) {
            const pathString = currentPath.join('.');
            let valueDomElement;

            switch (kind) {
                case 'map':
                    valueDomElement = createDomNode('div', { className: 'map-component', 'data-element-route': pathString, 'data-node-kind': 'map' });
                    for (const key in dataUnit) {
                        if (dataUnit.hasOwnProperty(key)) {
                            valueDomElement.appendChild(this.presentNode(dataUnit[key], [...currentPath, key]));
                        }
                    }
                    valueDomElement.appendChild(this.presentAddButton(currentPath, 'map'));
                    break;
                case 'sequence':
                    valueDomElement = createDomNode('div', { className: 'sequence-component', 'data-element-route': pathString, 'data-node-kind': 'sequence' });
                    dataUnit.forEach((item, index) => {
                        valueDomElement.appendChild(this.presentNode(item, [...currentPath, index.toString()]));
                    });
                    valueDomElement.appendChild(this.presentAddButton(currentPath, 'sequence'));
                    break;
                case 'nil':
                    valueDomElement = this.presentTypeSelector(currentPath);
                    break;
                case 'logic':
                    valueDomElement = createDomNode('input', {
                        type: 'checkbox',
                        className: 'input-value-field boolean-toggle',
                        checked: dataUnit,
                        'data-element-route': pathString,
                        'data-kind-identifier': kind
                    });
                    break;
                case 'text':
                    const lineCount = dataUnit.split('\n').length;
                    const displayRows = (lineCount === 1 && dataUnit.length > 79) ? 2 : lineCount;
                    valueDomElement = createDomNode('textarea', {
                        className: 'input-value-field text-multiline',
                        value: dataUnit,
                        rows: displayRows,
                        'data-element-route': pathString,
                        'data-kind-identifier': kind
                    });
                    break;
                case 'moment':
                    valueDomElement = createDomNode('input', {
                        type: 'text',
                        className: 'input-value-field date-iso-input',
                        value: dataUnit.toISOString(),
                        title: dataUnit.toISOString(),
                        'data-element-route': pathString,
                        'data-kind-identifier': kind
                    });
                    break;
                case 'numeric':
                    valueDomElement = createDomNode('input', {
                        type: 'number',
                        className: 'input-value-field numeric-spinner',
                        value: dataUnit,
                        'data-element-route': pathString,
                        'data-kind-identifier': kind
                    });
                    break;
                default:
                    valueDomElement = createDomNode('span', { className: 'unsupported-data-type' }, [`Unidentified type: ${kind}`]);
                    break;
            }
            return valueDomElement;
        }

        presentAddButton(parentPath, parentKind) {
            const addButton = createDomNode('button', {
                className: 'action-button action-add',
                'data-activity': 'add-item',
                'data-element-route': parentPath.join('.'),
                'data-node-kind': parentKind,
                title: 'Insert new item'
            }, ['+']);
            return createDomNode('div', { className: 'add-item-wrapper' }, [addButton]);
        }

        presentTypeSelector(currentPath) {
            const availableTypes = [
                { val: null, text: 'Select Type' },
                { val: 'sample string', text: 'Text' },
                { val: 0, text: 'Numeric' },
                { val: false, text: 'Logic' },
                { val: new Date(), text: 'Moment' },
                { val: [], text: 'Sequence' },
                { val: {}, text: 'Map' }
            ];

            const selector = createDomNode('select', {
                className: 'input-value-field type-selector',
                'data-element-route': currentPath.join('.'),
                'data-kind-identifier': 'nil'
            });

            availableTypes.forEach(typeOpt => {
                selector.appendChild(createDomNode('option', {
                    value: encodeValue(typeOpt.val),
                    textContent: typeOpt.text
                }));
            });
            return selector;
        }
    }

    if (typeof externalContext.$ !== 'undefined' && typeof externalContext.$.fn !== 'undefined') {
        externalContext.$.fn.objectViewEditor = function(initialModel, options) {
            return this.each(function() {
                if (!externalContext.$.data(this, 'objectViewEditor')) {
                    const editorInstance = new ObjectViewEditor(this, initialModel, options);
                    externalContext.$.data(this, 'objectViewEditor', editorInstance);
                }
            });
        };
    } else {
        externalContext.ObjectViewEditor = ObjectViewEditor;
    }

})( typeof window !== 'undefined' ? window : this );