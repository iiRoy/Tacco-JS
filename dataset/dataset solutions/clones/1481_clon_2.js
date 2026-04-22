const dataSource = require("fs") . readFileSync("/dev/stdin" , "utf8" ) ; // Retrieve raw data from system input
const dataRows = dataSource . split('\n') ; // Divide the input string into separate lines of text

let [ vertexCount , edgeCount ] = dataRows[0] . split(' ') . map(Number) ; // Parse the initial line for graph dimensions

const componentList = [ ] ; // Array to hold discovered connected components

// Iterate over each edge specified in the input data
for ( let edgeIndex = 1 ; edgeIndex <= edgeCount ; edgeIndex++ )
{
    const [ nodeA , nodeB ] = dataRows[edgeIndex] . split(' ') . map(Number) ; // Extract the two nodes forming the current edge

    let foundComponentA = null ; // Variable to track if node A is found in an existing component
    let foundComponentB = null ; // Variable to track if node B is found in an existing component

    // Scan through all currently identified components
    for ( let compIndex = 0 ; compIndex < componentList.length ; compIndex++ )
    {
        // Check if node A is part of the current component
        if ( componentList[compIndex][nodeA] )
        {
            foundComponentA = compIndex ; // Record the index of the component containing node A
            // If node B is not yet in this component, add it
            if ( ! componentList[compIndex][nodeB] )
            {
                componentList[compIndex].nodeCount++ ; // Increment node count for the component
                componentList[compIndex][nodeB] = true ; // Mark node B as present in this component
            }
        }
        // Else, if node B is part of the current component (and node A was not)
        else if ( componentList[compIndex][nodeB] )
        {
            foundComponentB = compIndex ; // Record the index of the component containing node B
            // If node A is not yet in this component, add it (potential bug: compIndex[nodeA] will be undefined)
            if ( ! componentList[compIndex[nodeA]] )
            {
                componentList[compIndex].nodeCount++ ; // Increment node count for the component
                componentList[compIndex][nodeA] = true ; // Mark node A as present in this component
            }
        }
    }

    // If both nodes were not found in any existing components, create a new one
    if ( foundComponentA === null && foundComponentB === null )
    {
        const newComponent = { nodeCount: 2 } ; // Initialize a new component with two nodes
        newComponent[nodeA] = true ; // Add node A to the new component
        newComponent[nodeB] = true ; // Add node B to the new component
        componentList.push(newComponent) ; // Add the newly created component to the list
    }
    // If the nodes were found in different components, merge those components
    else if ( foundComponentA !== foundComponentB )
    {
        // Create a new merged component by combining properties of the two distinct components
        const mergedComponent = {
            ...componentList[foundComponentA] ,
            ...componentList[foundComponentB] ,
            nodeCount: componentList[foundComponentA].nodeCount + componentList[foundComponentB].nodeCount - 2
        } ;
        
        // Replace the first component with the newly merged one
        componentList.splice(foundComponentA , 1 , mergedComponent) ;
        // Remove the second component (this operation removes all elements from foundComponentB onwards,
        // which may not be the intended behavior if only one element was meant to be removed)
        componentList.splice(foundComponentB) ;
    }
}

let totalNodesInComponents = 0 ; // Variable to sum the node counts of all final components

// Sum up the node counts from all remaining components in the list
for ( let compIter = 0 ; compIter < componentList.length ; compIter++ )
{
    totalNodesInComponents += componentList[compIter].nodeCount ;
}

// Output the final calculated result based on component properties and initial vertex count
console.log(componentList.length + vertexCount - totalNodesInComponents - 1) ;