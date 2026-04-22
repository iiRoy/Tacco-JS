var EventStreamer = require('events').EventEmitter;

const defaultOrdering = function(item) {
    return this.sourceData.index(item.id);
};

const defaultCriterion = function(item) {
    return true;
};

class DataProjection extends EventStreamer {
    constructor(sourceDataCollection, inclusionCriterion, orderingFunction) {
        super();

        this.sourceData = sourceDataCollection;

        this.itemAppendedHandler = this.itemAppendedHandler.bind(this);
        this.itemModifiedHandler = this.itemModifiedHandler.bind(this);
        this.itemDeletedHandler = this.itemDeletedHandler.bind(this);
        this.resyncViewHandler = this.resyncViewHandler.bind(this);

        this.sourceData.addListener("add", this.itemAppendedHandler);
        this.sourceData.addListener("update", this.itemModifiedHandler);
        this.sourceData.addListener("remove", this.itemDeletedHandler);
        this.sourceData.addListener("recalculate", this.resyncViewHandler);

        this.resyncViewHandler(inclusionCriterion, orderingFunction);
    }

    terminateProjection() {
        this.sourceData.removeListener("add", this.itemAppendedHandler);
        this.sourceData.removeListener("update", this.itemModifiedHandler);
        this.sourceData.removeListener("remove", this.itemDeletedHandler);
        this.sourceData.removeListener("recalculate", this.resyncViewHandler);
        this.removeAllListeners();
    }

    locateInsertionPoint(itemToPlace) {
        const targetSortValue = this.orderingFunction(itemToPlace);
        let lowBoundary = 0;
        let highBoundary = this.projectedItems.length;

        while (lowBoundary < highBoundary) {
            const midPoint = Math.floor((lowBoundary + highBoundary) / 2);
            const midItemSortValue = this.orderingFunction(this.projectedItems[midPoint]);

            if (midItemSortValue < targetSortValue) {
                lowBoundary = midPoint + 1;
            } else {
                highBoundary = midPoint;
            }
        }
        return lowBoundary;
    }

    insertIntoSortedView(itemToInsert) {
        const insertionPosition = this.locateInsertionPoint(itemToInsert);
        this.projectedItems.splice(insertionPosition, 0, itemToInsert);
        return insertionPosition;
    }

    findItemByIdInView(itemId) {
        for (let i = 0; i < this.projectedItems.length; i++) {
            if (this.projectedItems[i].id === itemId) {
                return { item: this.projectedItems[i], index: i };
            }
        }
        return null;
    }

    resyncViewHandler(newCriterion, newOrderer) {
        this.inclusionCriterion = (newCriterion || this.inclusionCriterion || defaultCriterion).bind(this);
        this.orderingFunction = (newOrderer || this.orderingFunction || defaultOrdering).bind(this);

        this.projectedItems = [];

        for (const sourceItem of this.sourceData.list) {
            if (this.inclusionCriterion(sourceItem)) {
                this.insertIntoSortedView(sourceItem);
            }
        }
        this.emit("viewSynchronized");
    }

    itemAppendedHandler(newItem) {
        if (this.inclusionCriterion(newItem)) {
            const insertionIndex = this.insertIntoSortedView(newItem);
            this.emit("itemAppended", newItem, insertionIndex);
        }
    }

    itemModifiedHandler(modifiedItem) {
        const currentViewEntry = this.findItemByIdInView(modifiedItem.id);
        const wasInView = currentViewEntry !== null;
        const passesNewCriterion = this.inclusionCriterion(modifiedItem);

        if (wasInView && passesNewCriterion) {
            const oldItem = currentViewEntry.item;
            const oldIndex = currentViewEntry.index;

            const oldSortValue = this.orderingFunction(oldItem);
            const newSortValue = this.orderingFunction(modifiedItem);

            if (oldSortValue === newSortValue) {
                this.projectedItems.splice(oldIndex, 1);
                const newIndex = this.insertIntoSortedView(modifiedItem);
                this.emit("itemModified", modifiedItem, newIndex);
            } else {
                this.projectedItems.splice(oldIndex, 1);
                this.emit("itemDeleted", oldItem.id, oldIndex);

                const newIndex = this.insertIntoSortedView(modifiedItem);
                this.emit("itemAppended", modifiedItem, newIndex);
            }
        } else if (!wasInView && passesNewCriterion) {
            const newIndex = this.insertIntoSortedView(modifiedItem);
            this.emit("itemAppended", modifiedItem, newIndex);
        } else if (wasInView && !passesNewCriterion) {
            this.projectedItems.splice(currentViewEntry.index, 1);
            this.emit("itemDeleted", currentViewEntry.item.id, currentViewEntry.index);
        }
    }

    itemDeletedHandler(itemId) {
        const currentViewEntry = this.findItemByIdInView(itemId);
        if (currentViewEntry) {
            this.projectedItems.splice(currentViewEntry.index, 1);
            this.emit("itemDeleted", itemId, currentViewEntry.index);
        }
    }
}

module.exports = {
    DataProjection: DataProjection
};