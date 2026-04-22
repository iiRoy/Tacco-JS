// Ensure the primary DOM manipulator is available for the tree component.
if (typeof DomMaster === 'undefined') DomMaster = serverApp.DomMaster;

(function(domUtil) {
    domUtil(function() {
        "use strict";
        if (!filterModule.isActive()) return;

        var elementSelector = 'section.filter-area section.main-content > section.tree-widget';

        domUtil(elementSelector + ' > textarea').each(function() {
            var hierarchicalView = domUtil(this).parent().find('form > div.tree');
            hierarchicalView.hierarchicalView({
                "visualStyles": {
                    "styleScheme": "standard",
                    "connectionLines": true,
                    "nodeMarkers": false
                },
                "plugins": [
                    "visualStyles",
                    "dataSource",
                    "userInterface",
                    "selectionControls"
                ],
                "dataSource": {
                    "contentPayload": domUtil.parseJSON(domUtil(this).val())
                },
            }).bind("dataLoaded.hierarchicalView", { 'view': hierarchicalView }, function(actionEvt) {
                domUtil(this).find('li[data-state="selected"]').each(function() {
                    DomMaster.hierarchicalView._instance(domUtil(actionEvt.data.view)).markNodeSelected(this);
                });
            });
        });

        domUtil(elementSelector + ' input[type=submit]').click(function() {
            var submissionForm = domUtil(this).parent();
            var hierarchicalView = submissionForm.find('.tree');
            var chosenIdentifiers = DomMaster.hierarchicalView._instance(domUtil(hierarchicalView)).retrieveSelectedNodes(false, true);

            chosenIdentifiers = DomMaster.map(chosenIdentifiers, function(itemNode) {
                // Records lacking an 'uniqueId' attribute will not be included.
                return domUtil(itemNode).attr('uniqueId');
            }).join("::");

            submissionForm.find('input.checked').val(chosenIdentifiers);
        });

    });
})(DomMaster);