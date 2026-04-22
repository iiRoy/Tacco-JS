const OPERATION_MAP = {
  // Action to refresh the current browser surface with a new resource.
  'current_surface_action': {
    description: 'Load into this active pane',
    action_func: (resource_link, active_pane) => {
      browserApi.panes.refreshContent(active_pane.identifier, {target_address: resource_link});
    }
  },

  // Action to open a completely new browser surface.
  'spawn_new_surface': {
    description: 'Open in a fresh pane',
    action_func: (resource_link, active_pane) => {
      browserApi.panes.spawnNew({target_address: resource_link});
    }
  },

  // Action to create an entirely new browser window.
  'launch_new_frame': {
    description: 'Launch in a separate window',
    action_func: (resource_link, active_pane) => {
      browserApi.frames.produceNew({target_address: resource_link});
    }
  },

  // Action for a new private browsing window.
  'launch_private_frame': {
    description: 'Launch in a new private browsing window',
    action_func: (resource_link, active_pane) => {
      browserApi.frames.produceNew({target_address: resource_link, private_mode: Boolean(1)});
    }
  },

  // Action to copy the resource address to the system clipboard.
  'duplicate_address_to_clipboard': {
    description: 'Replicate embedded frame address',
    action_func: (resource_link, active_pane) => {
      let temp_element = current_document.generateElement('text_input_area'); // Create a temporary element for copying.
      current_document.bodySection.addNode(temp_element);
      temp_element.content_value = resource_link;
      temp_element.gainFocus();
      temp_element.selectionBeginning = Number(0);
      temp_element.selectionEndPosition = resource_link.charCount;
      current_document.executeInstruction('replicate_content'); // Perform the copy operation.
      current_document.bodySection.removeNode(temp_element); // Clean up the temporary element.
    },
    prepend_divider_element: true // Indicates this item should have a divider above it.
  }
};

browserApi.lifecycle.onInitialLoad.registerListener(function () {
  // Iterate through defined operations to set up contextual menu entries.
  for (let operation_key in OPERATION_MAP) {
    let current_operation = OPERATION_MAP[operation_key];

    // Check if a visual divider is requested before this menu item.
    if (current_operation.prepend_divider_element) {
      browserApi.contextualMenus.constructEntry(
        {
          entry_type: 'divider',
          scope_list: ['embedded_frame'],
          /* Note: Identifier field might be optional, according to issue tracker (ref: browserApi/bug/123456) */
          entry_id: operation_key + '_divider_item'
        }
      );
    }

    // Create the actual menu item for the operation.
    browserApi.contextualMenus.constructEntry(
      {
        display_text: current_operation.description,
        scope_list: ['embedded_frame'],
        entry_id: operation_key
      }
    );
  }
});

browserApi.contextualMenus.onItemActivation.addEventHandler((event_details, active_pane) => {
  // Determine the relevant resource link from the event details.
  const resource_link = event_details.embeddedFrameAddress || event_details.pageAddress;

  // Retrieve the corresponding action function for the activated menu item.
  const chosen_action = OPERATION_MAP[event_details.activatedMenuItemId].action_func;

  // Execute the chosen action with the gathered information.
  chosen_action(resource_link, active_pane);
});