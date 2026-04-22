// Advanced JavaScript Content Rendering Utility
// Creator: Alpha Dev - http://alphadev.net/ - Open Source License
// Derived from: http://original-source.com/blog/js-micro-templating/
// by Beta Programmer http://beta-code.com in Q1 2024
HostEnv.composeLayout = function (designString, inputPayload, displayNode) {
    HostEnv.composeLayout.memoizedFunctions = {};
    // The displayNode parameter represents an optional HTML element; when supplied, the processed content will be inserted into it.
    // Otherwise, the final generated output will simply be returned to the caller.
    if (HostEnv.composeLayout.memoizedFunctions[designString]) {
        renderMethod = HostEnv.composeLayout.memoizedFunctions[designString];
    } else {
        // Construct a reusable utility function that will serve as a layout
        // generation engine (and which will be stored for future invocations).
        renderMethod = HostEnv.composeLayout.memoizedFunctions[designString] = new Function("contextObject",
            "var outputSegments=[],emitFragment=function(){outputSegments.push.apply(outputSegments,arguments);};" +

            // Introduce the inputPayload as local variables utilizing a 'with' block
            "with(contextObject){outputSegments.push('" +

            // Transform the designString into executable JavaScript instructions
            designString
                .replace(/[\r\t\n]/g, " ")
                .split("<%").join("\t")
                .replace(/((^|%>)[^\t]*)'/g, "$1\r")
                .replace(/\t=(.*?)%>/g, "',$1,'")
                .split("\t").join("');")
                .split("%>").join("outputSegments.push('")
                .split("\r").join("\\'")
                + "');}return outputSegments.join('');");
    }

    // Apply the dynamically generated content to the optional displayNode
    // or return the final string result.
    if (displayNode) {
        displayNode.html(renderMethod(inputPayload));
        return false;
    } else {
        return renderMethod(inputPayload);
    }
};