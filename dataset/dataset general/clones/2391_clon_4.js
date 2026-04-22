import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';

// --- Utility Functions ---
const obtainCategorization = (entity) => {
    if (entity === null) return 'Null';
    if (Array.isArray(entity)) return 'Array';
    const typeOf = typeof entity;
    if (typeOf === 'object') return 'Object';
    if (typeOf === 'string') return 'String';
    if (typeOf === 'number') return 'Number';
    if (typeOf === 'boolean') return 'Boolean';
    return 'Other'; // Fallback for undefined or other types not explicitly handled
};

// --- Custom Hooks ---
const usePreventPropagation = () => {
    return useCallback((e) => {
        e.stopPropagation();
    }, []);
};

const useExpandableNodeLogic = (initialExpansionState, dataSource) => {
    const [isExpanded, setExpanded] = useState(initialExpansionState);
    const childCollectionCache = useRef(null); // Cache for rendered children
    const itemSummaryCache = useRef(null); // Cache for "n Items" string

    const toggleExpansion = useCallback((event) => {
        event.stopPropagation();
        setExpanded(prev => !prev);
    }, []);

    // Reset caches when data source changes (equivalent to componentWillReceiveProps)
    // Using dataSource as a dependency assumes a new reference means new data.
    useEffect(() => {
        childCollectionCache.current = null;
        itemSummaryCache.current = null;
    }, [dataSource]);

    return { isExpanded, toggleExpansion, childCollectionCache, itemSummaryCache };
};

// --- Leaf Node Components ---
const StringDisplayComponent = ({ entryKey, entryValue }) => {
    const stopPropagation = usePreventPropagation();
    return (
        <li className="value-string child-node" onClick={stopPropagation}>
            <label>{entryKey}:</label>
            <span>{entryValue}</span>
        </li>
    );
};

const NumericDisplayComponent = ({ entryKey, entryValue }) => {
    const stopPropagation = usePreventPropagation();
    return (
        <li className="value-number child-node" onClick={stopPropagation}>
            <label>{entryKey}:</label>
            <span>{entryValue}</span>
        </li>
    );
};

const BooleanDisplayComponent = ({ entryKey, entryValue }) => {
    const stopPropagation = usePreventPropagation();
    const displayValue = entryValue ? 'true' : 'false';
    return (
        <li className={`value-boolean child-node ${displayValue}`} onClick={stopPropagation}>
            <label>{entryKey}:</label>
            <span>{displayValue}</span>
        </li>
    );
};

const NullDisplayComponent = ({ entryKey }) => { // entryValue is always null, so not needed
    const stopPropagation = usePreventPropagation();
    return (
        <li className="value-null child-node" onClick={stopPropagation}>
            <label>{entryKey}:</label>
            <span>null</span>
        </li>
    );
};

// --- Recursive Node Dispatcher Component ---
const DataNodeRenderer = ({ entryKey, entryValue, currentPath = '' }) => {
    // React's key prop needs to be stable and unique among siblings.
    // Combining the path and entryKey creates a stable, unique key for React.
    const reactKeyIdentifier = currentPath ? `${currentPath}.${entryKey}` : String(entryKey);
    
    const categorization = obtainCategorization(entryValue);

    switch (categorization) {
        case 'Object':
            return <ObjectDisplayComponent key={reactKeyIdentifier} entryKey={entryKey} entryValue={entryValue} currentPath={reactKeyIdentifier} />;
        case 'Array':
            return <ArrayDisplayComponent key={reactKeyIdentifier} entryKey={entryKey} entryValue={entryValue} currentPath={reactKeyIdentifier} />;
        case 'String':
            return <StringDisplayComponent key={reactKeyIdentifier} entryKey={entryKey} entryValue={entryValue} />;
        case 'Number':
            return <NumericDisplayComponent key={reactKeyIdentifier} entryKey={entryKey} entryValue={entryValue} />;
        case 'Boolean':
            return <BooleanDisplayComponent key={reactKeyIdentifier} entryKey={entryKey} entryValue={entryValue} />;
        case 'Null':
            return <NullDisplayComponent key={reactKeyIdentifier} entryKey={entryKey} />;
        default:
            // Matches the original's error handling for unexpected types.
            console.error("Unrecognized data categorization, cannot render:", categorization, entryValue);
            return <li key={reactKeyIdentifier} className="error-node">Error: Unrenderable Data Type</li>;
    }
};

// --- Complex Node Components (Object and Array) ---
const ArrayDisplayComponent = ({ entryKey, entryValue, initialExpansion = false, currentPath }) => {
    const { isExpanded, toggleExpansion, childCollectionCache, itemSummaryCache } = useExpandableNodeLogic(initialExpansion, entryValue);

    const getSummaryText = useCallback(() => {
        if (!itemSummaryCache.current) {
            const count = entryValue.length;
            itemSummaryCache.current = `${count} ${count === 1 ? 'Element' : 'Elements'}`;
        }
        return itemSummaryCache.current;
    }, [entryValue, itemSummaryCache]);

    const renderedChildren = useMemo(() => {
        if (!isExpanded) return [];
        if (childCollectionCache.current) return childCollectionCache.current; // Return cached if available

        const children = entryValue.map((item, idx) => (
            <DataNodeRenderer key={`${currentPath}[${idx}]`} entryKey={idx.toString()} entryValue={item} currentPath={`${currentPath}[${idx}]`} />
        ));
        childCollectionCache.current = children; // Cache the generated children
        return children;
    }, [isExpanded, entryValue, currentPath, childCollectionCache]);

    const containerClass = `collection-array primary-node ${isExpanded ? 'expanded' : ''}`;
    const childListStyle = {
        display: isExpanded ? 'block' : 'none'
    };

    return (
        <li className={containerClass} onClick={toggleExpansion}>
            <label>{entryKey}:</label>
            <span>{getSummaryText()}</span>
            <ol style={childListStyle}>
                {renderedChildren}
            </ol>
        </li>
    );
};

const ObjectDisplayComponent = ({ entryKey, entryValue, initialExpansion = false, currentPath }) => {
    const { isExpanded, toggleExpansion, childCollectionCache, itemSummaryCache } = useExpandableNodeLogic(initialExpansion, entryValue);

    const getSummaryText = useCallback(() => {
        if (!itemSummaryCache.current) {
            const keys = Object.keys(entryValue);
            const count = keys.length;
            itemSummaryCache.current = `${count} ${count === 1 ? 'Property' : 'Properties'}`;
        }
        return itemSummaryCache.current;
    }, [entryValue, itemSummaryCache]);

    const renderedChildren = useMemo(() => {
        if (!isExpanded) return [];
        if (childCollectionCache.current) return childCollectionCache.current;

        const children = Object.entries(entryValue).map(([key, val]) => (
            <DataNodeRenderer key={`${currentPath}.${key}`} entryKey={key} entryValue={val} currentPath={`${currentPath}.${key}`} />
        ));
        childCollectionCache.current = children;
        return children;
    }, [isExpanded, entryValue, currentPath, childCollectionCache]);

    const containerClass = `collection-object primary-node ${isExpanded ? 'expanded' : ''}`;
    const childListStyle = {
        display: isExpanded ? 'block' : 'none'
    };

    return (
        <li className={containerClass} onClick={toggleExpansion}>
            <label>{entryKey}:</label>
            <span>{getSummaryText()}</span>
            <ul style={childListStyle}>
                {renderedChildren}
            </ul>
        </li>
    );
};

// --- Root Component ---
const DataExplorer = ({ sourcePath = null, initialDataPayload = null }) => {
    const [displayedContent, setDisplayedContent] = useState(initialDataPayload);
    const [isLoading, setLoading] = useState(sourcePath ? true : false);

    const retrieveExternalData = useCallback(async (urlPath) => {
        setLoading(true);
        try {
            const response = await fetch(urlPath);
            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.status}`);
            }
            const dataContent = await response.json();
            setDisplayedContent(dataContent);
        } catch (err) {
            console.error("Failed to retrieve data from URL:", err);
            setDisplayedContent({ error: `Could not load data from ${urlPath}` }); // Provide a visual error message
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        if (sourcePath) {
            retrieveExternalData(sourcePath);
        } else {
            setDisplayedContent(initialDataPayload);
            setLoading(false);
        }
    }, [sourcePath, initialDataPayload, retrieveExternalData]);

    if (isLoading) {
        return <div className="data-explorer-container">Loading content...</div>;
    }

    if (displayedContent === null || typeof displayedContent === 'undefined') {
        return <div className="data-explorer-container">No content to display.</div>;
    }

    const contentCategory = obtainCategorization(displayedContent);
    let rootVisualElement;

    // Matching original behavior: console.error for non-array/object root.
    if (contentCategory === 'Object') {
        rootVisualElement = <ObjectDisplayComponent entryKey="(root)" entryValue={displayedContent} initialExpansion={true} currentPath="root" />;
    } else if (contentCategory === 'Array') {
        rootVisualElement = <ArrayDisplayComponent entryKey="(root)" entryValue={displayedContent} initialExpansion={true} currentPath="root" />;
    } else {
        console.error("Root data must be an Object or Array for structured display.");
        rootVisualElement = <li className="error-display">Error: Root data must be an Object or Array.</li>;
    }

    return (
        <ul className="display-panel">
            {rootVisualElement}
        </ul>
    );
};