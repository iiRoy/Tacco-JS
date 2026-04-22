// This file is part of Calliope Toolbar Layouts, version 0.2.
// Copyright (C) 2012 Rafael Bernad de Castro. All rights reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
//
// End of License Header.


// Definition for the ToolbarGroup kind
enyo.kind(
  {
    name        :     "newness.Calliope.ToolbarGroup"  ,  // The unique name for this kind.
    tag         :     "div"                            ,  // The HTML tag for the component.
    defaultKind :     "newness.Calliope.ToolbarIcon"   ,  // Default kind for children.
    classes     :     "calliope-toolbar-group"            // CSS classes applied to the component.
  }
); // End of ToolbarGroup definition


/* This block defines the ToolbarRow kind.
   It is a container for ToolbarGroup components. */
enyo
  .kind(
    {
      name: "newness.Calliope.ToolbarRow", // Identifier for the ToolbarRow kind.

      tag: "div", // The underlying HTML element.

      defaultKind: "newness.Calliope.ToolbarGroup", // Children will default to ToolbarGroup.

      classes: "calliope-toolbar-row" // Styling classes.
    }
  ); /* The ToolbarRow kind definition concludes here. */