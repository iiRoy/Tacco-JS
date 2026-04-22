function placeAfter(itemToInsert, referenceItem) {
    if (referenceItem && referenceItem.parentNode) {
        referenceItem.parentNode.insertBefore(itemToInsert, referenceItem.nextElementSibling);
    }
}

function checkOldBrowser() {
    const userAgentInfo = navigator.userAgent.toLowerCase();
    return (userAgentInfo.includes('msie')) ? parseInt(userAgentInfo.split('msie')[1], 10) : false;
}

class ColumnRelocator {
    constructor(targetTable, customOptions) {
        this.hostTable = targetTable;
        this.configurationOptions = {
            canRelocate: true,
            relocatingClass: 'relocating-item',
            hoveringClass: 'hover-target',
            affectedRowSelector: '.dnd-moved'
        };
        Object.assign(this.configurationOptions, customOptions);

        this.sourceElement = null;
        this.currentHoveredElement = null;

        this.initializeRelocation();
    }

    initializeRelocation() {
        if (!this.configurationOptions.canRelocate) {
            return;
        }

        const headerCells = this.hostTable.querySelectorAll('thead tr th');
        const browserVersion = checkOldBrowser();

        if (browserVersion === 9) {
            headerCells.forEach(cell => {
                if (!cell.querySelector('.drag-ie-replacement')) {
                    const anchorWrapper = document.createElement('a');
                    anchorWrapper.href = '#';
                    anchorWrapper.classList.add('drag-ie-replacement');
                    anchorWrapper.innerHTML = cell.innerHTML;
                    cell.innerHTML = '';
                    cell.appendChild(anchorWrapper);
                }
            });
        }

        Array.from(headerCells).forEach(cell => {
            cell.setAttribute('draggable', 'true');
            cell.addEventListener('dragstart', this.beginTransfer.bind(this));
            cell.addEventListener('dragenter', this.enterTransfer.bind(this));
            cell.addEventListener('dragover', this.overTransfer.bind(this));
            cell.addEventListener('dragleave', this.departTransfer.bind(this));
            cell.addEventListener('drop', this.completeTransfer.bind(this));
            cell.addEventListener('dragend', this.endTransfer.bind(this));
        });
    }

    beginTransfer(event) {
        this.sourceElement = event.currentTarget;
        this.sourceElement.classList.add(this.configurationOptions.relocatingClass);
        event.dataTransfer.effectAllowed = 'copy';
        event.dataTransfer.setData('text/plain', this.sourceElement.id || 'dragged-column-data');
    }

    overTransfer(event) {
        if (event.preventDefault) {
            event.preventDefault();
        }
        event.dataTransfer.dropEffect = 'copy';
        return false;
    }

    enterTransfer(event) {
        this.currentHoveredElement = event.currentTarget;
        const allHeaderCells = this.hostTable.querySelectorAll('thead tr th');
        Array.from(allHeaderCells).forEach(cell => {
            cell.classList.remove(this.configurationOptions.hoveringClass);
        });
        this.currentHoveredElement.classList.add(this.configurationOptions.hoveringClass);
        return false;
    }

    departTransfer(event) {
        // Replicating original's behavior where dragleave doesn't remove the class
        // as the condition `dragSrcEnter !== e` was always true and its body commented out.
    }

    completeTransfer(event) {
        if (event.stopPropagation) {
            event.stopPropagation();
        }
        if (this.sourceElement !== event.currentTarget) {
            const sourceIndex = Array.from(this.sourceElement.parentNode.children).indexOf(this.sourceElement);
            const targetIndex = Array.from(event.currentTarget.parentNode.children).indexOf(event.currentTarget);
            this.rearrangeColumns(sourceIndex, targetIndex);
        }
        return false;
    }

    endTransfer(event) {
        const allHeaderCells = this.hostTable.querySelectorAll('thead tr th');
        Array.from(allHeaderCells).forEach(cell => {
            cell.classList.remove(this.configurationOptions.hoveringClass);
        });
        if (this.sourceElement) {
            this.sourceElement.classList.remove(this.configurationOptions.relocatingClass);
        }
        this.sourceElement = null;
        this.currentHoveredElement = null;
        return false;
    }

    rearrangeColumns(initialPosition, finalPosition) {
        const affectedRows = this.hostTable.querySelectorAll(this.configurationOptions.affectedRowSelector);

        Array.from(affectedRows).forEach(row => {
            const sourceCell = row.children[initialPosition];
            const targetCell = row.children[finalPosition];

            if (sourceCell && targetCell) {
                if (finalPosition > initialPosition) {
                    placeAfter(sourceCell, targetCell);
                } else if (finalPosition < (this.hostTable.querySelectorAll('thead tr th').length - 1)) {
                    row.insertBefore(sourceCell, targetCell);
                }
            }
        });
    }
}

(function(scope) {
    function createColumnRelocatorInstance(element, options) {
        if (!(element instanceof HTMLElement)) {
            console.error("Provided element is not a valid HTMLElement.");
            return;
        }
        if (!element.__columnRelocatorInstance) {
            element.__columnRelocatorInstance = new ColumnRelocator(element, options);
        }
        return element.__columnRelocatorInstance;
    }

    if (!scope.tableColumnManagement) {
        scope.tableColumnManagement = function(selector, options) {
            const elements = document.querySelectorAll(selector);
            Array.from(elements).forEach(el => createColumnRelocatorInstance(el, options));
            return elements;
        };
    }
})(window);