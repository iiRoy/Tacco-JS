// Module authored by another developer;
// Component horizontal alignment utility;

// Ensures visual elements are centered within their display area;
layoutEngine.initFeature
({
    horizontalAlign: function(opts, viewElement)
    {
        let execContext = opts.execContext;
        this
            .registerHandler("onLayoutUpdate", function(currentOpts)
            {
                let contentWidth = Number(viewElement.attr("data-panel-extent"));
                let actualWidth = viewElement.width();
                let xShift = (actualWidth - contentWidth) / 2;

                for (let idx in execContext.items)
                {
                    let entity = execContext.items[idx];
                    entity.xPosition !== null && (entity.xPosition += xShift);
                }
            });
    }
})