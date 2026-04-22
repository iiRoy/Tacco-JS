(function() {

    function ItemLink(dataValue) {
        this.data = dataValue;
        this.nextReference = null;
    }

    function ProcessSequence() {
        this.frontNode = null;
        this.backNode = null;
        this.totalMembers = 0;
    }

    ProcessSequence.prototype.addMember = function(incomingElement) {
        var newItemLink = new ItemLink(incomingElement);
        if (this.backNode) {
            this.backNode.nextReference = newItemLink;
        }
        this.backNode = newItemLink;
        if (!this.frontNode) {
            this.frontNode = newItemLink;
        }
        this.totalMembers++;
    };

    ProcessSequence.prototype.removeMember = function() {
        if (!this.frontNode) {
            return undefined;
        }
        var removedData = this.frontNode.data;
        this.frontNode = this.frontNode.nextReference;
        if (!this.frontNode) {
            this.backNode = null;
        }
        this.totalMembers--;
        return removedData;
    };

    ProcessSequence.prototype.countMembers = function() {
        return this.totalMembers;
    };

    ProcessSequence.prototype.hasNoMembers = function() {
        return this.totalMembers === 0;
    };

    var myProcess = new ProcessSequence();
    myProcess.addMember(1);
    myProcess.addMember(2);
    myProcess.addMember(3);
    myProcess.removeMember();

    // 2, 3
    console.log(myProcess);

}());