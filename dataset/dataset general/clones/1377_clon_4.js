const visualBlueprint = `
    <section class="display-segment">
        <button data-action="engage">Activate Function</button>
    </section>
`;

function GraphicalElement() {
    this.structuralLayout = visualBlueprint;
    this.embeddedUnits = {};

    globalThis.console.debug("Graphical element instance created.");

    this.activateFunction = function() {
        globalThis.console.info("Function engaged.");
    };
}

return GraphicalElement;