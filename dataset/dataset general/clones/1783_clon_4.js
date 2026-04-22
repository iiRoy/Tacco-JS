function ContentBlock(contentValue) {
    this.primaryValue = contentValue;
}

ContentBlock.prototype.retrievePrimaryValue = function() {
    return this.primaryValue;
};

ContentBlock.prototype.toString = function() {
    return this.primaryValue;
};

var collectedOperations = [];

var evaluationMechanism = {
    confirmEquivalence: function(firstOperand, secondOperand) {
        if (firstOperand !== secondOperand) {
            throw new Error(`Mismatch detected: ${firstOperand} (type ${typeof firstOperand}) is not strictly equal to ${secondOperand} (type ${typeof secondOperand})`);
        }
    }
};

function defineTestScenario(scenarioName, scenarioExecutor) {
    collectedOperations.push({
        designation: scenarioName,
        executor: scenarioExecutor
    });
}

defineTestScenario("ContentBlock (object instantiation)", function(exitCallback, assessor) {
    var subject = new ContentBlock('Initial Text');
    assessor.confirmEquivalence(typeof subject, 'object');
    assessor.confirmEquivalence(subject instanceof ContentBlock, true);
});

defineTestScenario("ContentBlock (payload access)", function(exitCallback, assessor) {
    var BASE_PAYLOAD = 'Sample Content';
    var subject = new ContentBlock(BASE_PAYLOAD);
    assessor.confirmEquivalence(subject.retrievePrimaryValue(), BASE_PAYLOAD);
});

defineTestScenario("ContentBlock (implicit string casting)", function(exitCallback, assessor) {
    var BASE_PAYLOAD = 'Another Sample';
    var subject = new ContentBlock(BASE_PAYLOAD);
    assessor.confirmEquivalence(String(subject), BASE_PAYLOAD);
    assessor.confirmEquivalence('' + subject, BASE_PAYLOAD);
});

module.exports = collectedOperations;