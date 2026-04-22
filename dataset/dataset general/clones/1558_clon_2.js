var InteractionPanel = function (controlConfig) {

    // Internal utility function to compute appropriate visual dimensions
    var determineElementDimensions = function() {
        var screenWidthValue = screen.width;

        if (screenWidthValue >= 640) {
            return 72;
        }
        else if (screenWidthValue >= 470) {
            return 48;
        }
        else {
            return 36;
        }
    };

    var elementDimension = determineElementDimensions();
    var controlPanelContainer = document.createElement("div");
    controlPanelContainer.setAttribute("id", controlConfig.id);
    controlPanelContainer.setAttribute("style", "display:none;position:fixed;bottom:0;width:100%");

    var controlPanelGrid = document.createElement("table");
    controlPanelGrid.setAttribute("style", "width:100%;");
    controlPanelGrid.setAttribute("cellpadding", "0");
    controlPanelGrid.setAttribute("cellspacing", "0");

    for (var outerIndex in controlConfig.items) {
        var gridRowElement = controlPanelGrid.appendChild(document.createElement("tr"));
        var gridCellElement = gridRowElement.appendChild(document.createElement("td"));

        var innerGrid = document.createElement("table");
        innerGrid.setAttribute("style", "width:100%;");
        innerGrid.setAttribute("cellpadding", "0");
        innerGrid.setAttribute("cellspacing", "0");

        var innerGridRow = innerGrid.appendChild(document.createElement("tr"));
        var columnWidthPercentage = Math.ceil(100 / controlConfig.items[outerIndex].length) + "%";

        for (var innerIndex in controlConfig.items[outerIndex]) {
            var currentControl = controlConfig.items[outerIndex][innerIndex];
            var controlCell = document.createElement("td");

            controlCell.setAttribute("align", "center");
            controlCell.setAttribute("width", columnWidthPercentage);
            controlCell.setAttribute("style", "color:white;font-weight:bold;border-top:1px solid grey;border-right:1px solid grey;background-color:black");

            controlCell.addEventListener("click", currentControl.action, false);
            controlCell.addEventListener("click", function() {
                // Anonymous callback to hide the panel
                document.getElementById(controlConfig.id).style.display = 'none';
            }, false);

            if (currentControl.image) {
                var controlImage = document.createElement("img");
                controlImage.setAttribute("src", currentControl.image);
                controlImage.setAttribute("width", elementDimension);
                controlImage.setAttribute("height", elementDimension);
                controlCell.appendChild(controlImage);
            }
            controlCell.appendChild(document.createElement("br"));
            controlCell.appendChild(document.createTextNode(currentControl.label));
            innerGridRow.appendChild(controlCell);
        }
        gridCellElement.appendChild(innerGrid);
    }
    controlPanelContainer.appendChild(controlPanelGrid);
    document.body.appendChild(controlPanelContainer);

    // Register a global event handler for the panel activator
    document.addEventListener("menubutton", function() {
        if (controlPanelContainer.style.display == 'none') {
            controlPanelContainer.style.display = 'block'; // Make the panel visible
        }
        else {
            controlPanelContainer.style.display = 'none';  // Conceal the panel
        }
    }, false);
};