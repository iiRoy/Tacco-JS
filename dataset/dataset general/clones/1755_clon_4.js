const systemCore = Object.create(null);

let currentDataSet = [];

systemCore.initialDataSupplier = {
    fetchInitialSet: function() {
        return [
            { identity: '1', order: 4 },
            { identity: '4', order: 3 },
            { identity: '5', order: 2 },
            { identity: '2', order: 1 },
            { identity: '3', order: 0 }
        ];
    }
};

systemCore.modelUpdater = {
    adjustElementOrdering: function(newOrderPositions) {
        currentDataSet.forEach(element => {
            const freshPosition = newOrderPositions[element.identity];
            if (freshPosition !== undefined) {
                element.order = freshPosition;
            }
        });
        systemCore.interfaceHandler.refreshDisplay();
    }
};

systemCore.interfaceHandler = {
    setupInteractiveView: function() {
        const visualContainer = $('#visual-sequence-holder');

        visualContainer.sortable({
            update: function(evt, uiElement) {
                const positionMapping = {};
                $(this).find('.visual-item').each(function(currentPosition) {
                    positionMapping[$(this).data('identity')] = currentPosition;
                });

                $(this).sortable('cancel');

                systemCore.modelUpdater.adjustElementOrdering(positionMapping);
            }
        });
        this.refreshDisplay();
    },

    refreshDisplay: function() {
        const visualContainer = $('#visual-sequence-holder');
        visualContainer.empty();

        const sortedDataForDisplay = [...currentDataSet].sort((a, b) => a.order - b.order);

        sortedDataForDisplay.forEach(itemEntry => {
            const displayItem = $('<div>')
                .addClass('visual-item')
                .attr('data-identity', itemEntry.identity)
                .text(`Entry ${itemEntry.identity} (Seq: ${itemEntry.order})`);
            visualContainer.append(displayItem);
        });
    }
};

$(document).ready(function() {
    currentDataSet = systemCore.initialDataSupplier.fetchInitialSet();
    systemCore.interfaceHandler.setupInteractiveView();
});