function processLayout() {
    const mainContainerElement = document.querySelector('.isotope');
    if (!mainContainerElement) {
        return;
    }

    const containerWidthValue = mainContainerElement.offsetWidth;

    const columnConfiguration = [
        { widthBoundary: 1040, columnCount: 6 },
        { widthBoundary: 850, columnCount: 5 },
        { widthBoundary: 768, columnCount: 4 },
        { widthBoundary: 480, columnCount: 3 },
        { widthBoundary: 300, columnCount: 2 }
    ];

    const determineGridDivision = (width) => {
        for (const config of columnConfiguration) {
            if (width > config.widthBoundary) {
                return config.columnCount;
            }
        }
        return 1;
    };

    const gridDivisionCount = determineGridDivision(containerWidthValue);
    const baseUnitDimension = Math.floor(containerWidthValue / gridDivisionCount);

    const allItemNodes = mainContainerElement.querySelectorAll('.item');

    allItemNodes.forEach(itemNode => {
        let itemCalculatedWidth = baseUnitDimension;
        let itemCalculatedHeight = baseUnitDimension;

        const isDoubleWidth = itemNode.classList.contains('width2');
        const isDoubleHeight = itemNode.classList.contains('height2');

        if (isDoubleWidth) {
            itemCalculatedWidth *= 2;
        }
        if (isDoubleHeight) {
            itemCalculatedHeight *= 2;
        }

        itemNode.style.width = `${itemCalculatedWidth}px`;
        itemNode.style.height = `${itemCalculatedHeight}px`;
    });

    if (typeof Isotope !== 'undefined') {
        let layoutManager = Isotope.data(mainContainerElement);
        const layoutOptions = {
            resizable: true,
            itemSelector: '.item',
            masonry: {
                columnWidth: baseUnitDimension,
                gutter: 10
            }
        };

        if (layoutManager) {
            layoutManager.arrange(layoutOptions);
        } else {
            new Isotope(mainContainerElement, layoutOptions);
        }
    }

    const controlPanelButtons = document.querySelectorAll('.isotope-filters button');
    controlPanelButtons.forEach(controlButton => {
        controlButton.addEventListener('click', function() {
            const currentFilterCriterion = this.dataset.filter;
            const layoutManager = Isotope.data(mainContainerElement);
            if (layoutManager) {
                layoutManager.arrange({ filter: currentFilterCriterion });
            }
        });
    });

    const filterGroupContainers = document.querySelectorAll('.isotope-filters');
    filterGroupContainers.forEach(controlGroupElement => {
        controlGroupElement.addEventListener('click', function(event) {
            if (event.target.tagName === 'BUTTON') {
                controlGroupElement.querySelectorAll('button').forEach(btn => {
                    btn.classList.remove('active');
                });
                event.target.classList.add('active');
            }
        });
    });
}

window.addEventListener('load', processLayout);
window.addEventListener('resize', processLayout);