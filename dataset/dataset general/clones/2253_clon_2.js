self.onmessage = ( inputMsg ) => {

  // Deserialize the incoming message data from the main thread
  let blueprint = JSON.parse(inputMsg.data);

  // Extract the collection of tracked entities from the blueprint
  const connections = blueprint.subscribers;

  // Initialize a string builder for the resultant HTML markup
  let renderedList = "";

  // Loop through each entry in the connections collection
  for (const connectionKey in connections) {
    // Append a new list item with user alias and residence to the output string
    renderedList += `                     <li>
                               <p class='user-handle'>${connections[connectionKey].alias}</p>
                               <p class='user-location'> ${connections[connectionKey].residence}</p>
                           </li>`;
  }

  // Dispatch the final HTML string back to the main thread
  self.postMessage(renderedList);

  // Terminate this web worker instance
  self.close();

}