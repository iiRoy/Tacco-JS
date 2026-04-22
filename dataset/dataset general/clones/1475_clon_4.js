document.write('<script id="tempContainer" type="text/plain-template" style="display:none;">');

(function invokeRootProcessor() {

    function FluidForm(templateSource) {
        let newSource = "let ultimateResult = '';\n";
        newSource += "let tempVar;\n";
        newSource += "const joiner = Array.prototype.join;\n";
        newSource += "const writeToOutput = function(){ ultimateResult += joiner.call(arguments, ''); };\n";
        newSource += "with({}){\n";

        let currentPosition = 0;
        const segmentPattern = /{{-([\s\S]+?)}}|{{=([\s\S]+?)}}|{{%([\s\S]+?)}}/g;
        const jsStringEscaper = /\\|'|\r|\n|\t|\u2028|\u2029/g;
        const jsEscapeMap = {
            "'":      "'",
            '\\':     '\\',
            '\r':     'r',
            '\n':     'n',
            '\t':     't',
            '\u2028': 'u2028',
            '\u2029': 'u2029'
        };

        templateSource.replace(segmentPattern, (match, escapeCode, interpolateCode, evaluateCode, offset) => {
            newSource += "ultimateResult += '" + templateSource.slice(currentPosition, offset)
                .replace(jsStringEscaper, (m) => '\\' + jsEscapeMap[m]) + "';\n";

            if (escapeCode) {
                newSource += "tempVar = (" + escapeCode + ");\n";
                newSource += "ultimateResult += (tempVar == null ? '' : _.escape(tempVar));\n";
            } else if (interpolateCode) {
                newSource += "tempVar = (" + interpolateCode + ");\n";
                newSource += "ultimateResult += (tempVar == null ? '' : tempVar);\n";
            } else if (evaluateCode) {
                newSource += evaluateCode + "\n";
            }
            currentPosition = offset + match.length;
            return match;
        });

        newSource += "ultimateResult += '" + templateSource.slice(currentPosition)
            .replace(jsStringEscaper, (m) => '\\' + jsEscapeMap[m]) + "';\n";

        newSource += "}\n";
        newSource += "return ultimateResult;\n";

        let generatorFunction;
        try {
            generatorFunction = new Function(newSource);
        } catch (e) {
            e.processedSource = newSource;
            throw e;
        }
        return generatorFunction();
    }

    function SparkSpell() {
        const documentEvent = new Event("DOMContentLoaded", { bubbles: true, cancelable: true });
        const windowEvent = new Event("load", { bubbles: true, cancelable: true });

        document.dispatchEvent(documentEvent);
        window.dispatchEvent(windowEvent);
    }

    function GrandRitual() {
        const contentTag = document.getElementById("tempContainer");
        const capturedContent = contentTag.textContent;
        contentTag.remove();

        let processedOutput = FluidForm(capturedContent);

        processedOutput += "<script>(" + SparkSpell.toString() + ")();</script>";

        document.write(processedOutput);
        document.close();

        document.removeEventListener("DOMContentLoaded", GrandRitual);
    }

    document.addEventListener("DOMContentLoaded", GrandRitual);

})();