const _commandRegistry_ = {
    'performExpansion': 'expand_abbreviation',
    'encloseWithSnippet': 'wrap_with_abbreviation',
    'flipCommentStatus': 'toggle_comment',
    'destroyCurrentTag': 'remove_tag',
    'coalesceAdjacentLines': 'merge_lines'
};

class EmmetToolkit {
    constructor(commandProcessor, activeContext) {
        this._processor_ = commandProcessor;
        this._context_ = activeContext;
    }

    _executeInternalCommand_(key, ...parameters) {
        const operationIdentifier = _commandRegistry_[key];
        if (!operationIdentifier) {
            throw new Error(`Unknown Emmet operation key: ${key}`);
        }
        return this._processor_.run(operationIdentifier, this._context_, ...parameters);
    }

    // Corresponds to actionExpandAbbreviation
    performExpansion() {
        return this._executeInternalCommand_('performExpansion');
    }

    // Corresponds to actionWrapWithAbbreviation
    encloseWithSnippet(fragment) {
        return this._executeInternalCommand_('encloseWithSnippet', fragment);
    }

    // Corresponds to actionToggleComment
    flipCommentStatus() {
        return this._executeInternalCommand_('flipCommentStatus');
    }

    // Corresponds to actionRemoveTag
    destroyCurrentTag() {
        return this._executeInternalCommand_('destroyCurrentTag');
    }

    // Corresponds to actionMergeLines
    coalesceAdjacentLines() {
        return this._executeInternalCommand_('coalesceAdjacentLines');
    }

    // Corresponds to createRange
    defineSpan(initialIndex, finalIndex) {
        const rangeModule = this._processor_.require('assets/range');
        const segmentLength = finalIndex - initialIndex;
        return rangeModule.create(initialIndex, segmentLength);
    }
}

// Assuming 'emmet' and 'editorProxy' are globally available as dependencies.
// To use this, you would instantiate it:
// const globalEmmetTools = new EmmetToolkit(emmet, editorProxy);