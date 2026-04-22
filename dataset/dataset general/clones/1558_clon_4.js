const LayoutComposer = (configurationData) => {

    const graphicalUnitMeasure = (() => {
        const currentViewWidth = window.innerWidth;
        const dimensionRules = [
            { threshold: 640, value: 72 },
            { threshold: 470, value: 48 },
            { threshold: 0, value: 36 }
        ];
        const applicableRule = dimensionRules
            .find(rule => currentViewWidth >= rule.threshold);
        return applicableRule ? applicableRule.value : 36;
    })();

    const createNode = (tag, attributes = {}, styles = {}, children = []) => {
        const elem = document.createElement(tag);
        Object.entries(attributes).forEach(([key, value]) => elem.setAttribute(key, value));
        Object.entries(styles).forEach(([key, value]) => {
            elem.style[key] = value;
        });
        children.forEach(child => {
            if (typeof child === 'string') {
                elem.appendChild(document.createTextNode(child));
            } else if (child instanceof Node) {
                elem.appendChild(child);
            }
        });
        return elem;
    };

    const addInteractHandler = (element, eventType, handler, useCapture = false) => {
        element.addEventListener(eventType, handler, useCapture);
    };

    const mainPanel = createNode(
        'div',
        { id: configurationData.id },
        {
            display: 'none',
            position: 'fixed',
            bottom: '0',
            width: '100%'
        }
    );

    const mainGrid = createNode(
        'table',
        { width: '100%', cellpadding: '0', cellspacing: '0' }
    );

    configurationData.items.forEach(rowItems => {
        const rowWrapper = createNode('tr');
        const cellForInnerGrid = createNode('td');
        const innerGrid = createNode(
            'table',
            { width: '100%', cellpadding: '0', cellspacing: '0' }
        );
        const innerGridRow = createNode('tr');

        const segmentWidth = Math.ceil(100 / rowItems.length) + '%';

        rowItems.forEach(segmentData => {
            const segmentCell = createNode(
                'td',
                { align: 'center', width: segmentWidth },
                {
                    color: 'white',
                    fontWeight: 'bold',
                    borderTop: '1px solid grey',
                    borderRight: '1px solid grey',
                    backgroundColor: 'black'
                }
            );

            addInteractHandler(segmentCell, 'click', segmentData.action);
            addInteractHandler(segmentCell, 'click', () => {
                mainPanel.style.display = 'none';
            });

            if (segmentData.image) {
                const graphicAsset = createNode(
                    'img',
                    { src: segmentData.image, width: graphicalUnitMeasure, height: graphicalUnitMeasure }
                );
                segmentCell.appendChild(graphicAsset);
            }

            segmentCell.appendChild(createNode('br'));
            segmentCell.appendChild(document.createTextNode(segmentData.label));
            innerGridRow.appendChild(segmentCell);
        });

        innerGrid.appendChild(innerGridRow);
        cellForInnerGrid.appendChild(innerGrid);
        rowWrapper.appendChild(cellForInnerGrid);
        mainGrid.appendChild(rowWrapper);
    });

    mainPanel.appendChild(mainGrid);
    document.body.appendChild(mainPanel);

    addInteractHandler(document, 'menubutton', () => {
        mainPanel.style.display = (mainPanel.style.display === 'none') ? 'block' : 'none';
    });
};