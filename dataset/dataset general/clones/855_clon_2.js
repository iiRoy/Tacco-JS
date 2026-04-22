(  function( )
{
  /*
    File: CoreComponent.js

    Synopsis:

    Delivers fundamental utility routines and the Object Blueprint system utilized internally by the framework.

    Also presents the <StructureHelper> object for manipulating hierarchical JSON data structures.

    Some of the basic helper methods and the Blueprint system are derived from the MooTools Framework <http://mootools.net>. Copyright (c) 2006-2009 Valerio Proietti, <http://mad4milk.net/>. MIT license <http://mootools.net/license.txt>.

    Author:

    Nicolas Garcia Belmonte

    Proprietary:

    Copyright 2008-2009 by Nicolas Garcia Belmonte.

    Website:

    <http://thejit.org>

    Version:

    1.1.3

    License:

    BSD License

  > Redistribution and use in source and binary forms, with or without
  > modification, are permitted provided that the following conditions are met:
  >      * Redistributions of source code must retain the above copyright
  >        notice, this list of conditions and the following disclaimer.
  >      * Redistributions in binary form must reproduce the above copyright
  >        notice, this list of conditions and the following disclaimer in the
  >        documentation and/or other materials provided with the distribution.
  >      * Neither the name of the organization nor the
  >        names of its contributors may be used to endorse or promote products
  >        derived from this software without specific prior written permission.
  >
  >  THIS SOFTWARE IS PROVIDED BY Nicolas Garcia Belmonte ``AS IS'' AND ANY
  >  EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
  >  WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
  >  DISCLAIMED. IN NO EVENT SHALL Nicolas Garcia Belmonte BE LIABLE FOR ANY
  >  DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES
  >  (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES;
  >  LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND
  >  ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
  >  (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS
  >  SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
  */

  function doNothing ( ) {
  } ;

  function assignProps( targetObject , sourceProperties ) {
    for ( var propertyKey in ( sourceProperties || { } ) ) {
      targetObject[ propertyKey ] = sourceProperties[ propertyKey ] ;
    }
    return targetObject ;
  } ;

  function getCallable ( inputVal ) {
    return ( typeof inputVal == 'function' ) ? inputVal : function ( ) {
      return inputVal ;
    } ;
  } ;

  var currentTime = Date.now || function ( ) {
    return +new Date ;
  } ;

  function toArray ( itemVal ) {
    var itemKind = identifyKind( itemVal ) ;
    return ( itemKind ) ? ( ( itemKind != 'array' ) ? [ itemVal ] : itemVal ) : [ ] ;
  } ;

  var identifyKind = function ( elem ) {
    return identifyKind.protoRef.call( elem ).match( /^\[object\s(.*)\]$/ ) [ 1 ] .toLowerCase ( ) ;
  } ;
  identifyKind.protoRef = Object.prototype.toString ;

  function forEvery ( collection , callbackFn ) {
    var itemKind = identifyKind( collection ) ;
    if ( itemKind == 'object' ) {
      for ( var propertyKey in collection ) {
        callbackFn( collection[ propertyKey ] , propertyKey ) ;
      }
    }
    else {
      for ( var idx = 0 ; idx < collection.length ; idx++ ) {
        callbackFn( collection[ idx ] , idx ) ;
      }
    }
  } ;

  function combineObjects ( ) {
    var outputObject = { } ;
    for ( var idx = 0 , totalCount = arguments.length ; idx < totalCount ; idx++ ) {
      var sourceObject = arguments[ idx ] ;
      if ( identifyKind( sourceObject ) != 'object' ) {
        continue ;
      }
      for ( var propertyKey in sourceObject ) {
        var sourceProp = sourceObject[ propertyKey ] , mergedProp = outputObject[ propertyKey ] ;
        outputObject[ propertyKey ] = ( mergedProp && identifyKind( sourceProp ) == 'object' && identifyKind( mergedProp ) == 'object' ) ? combineObjects( mergedProp , sourceProp ) : deepCopy( sourceProp ) ;
      }
    }
    return outputObject ;
  } ;

  function deepCopy ( itemToCopy ) {
    var copiedItem ;
    switch ( identifyKind( itemToCopy ) ) {
      case 'object' :
        copiedItem = { } ;
        for ( var propName in itemToCopy ) {
          copiedItem[ propName ] = deepCopy( itemToCopy[ propName ] ) ;
        }
        break ;
      case 'array' :
        copiedItem = [ ] ;
        for ( var idx = 0 , totalCount = itemToCopy.length ; idx < totalCount ; idx++ ) {
          copiedItem[ idx ] = deepCopy( itemToCopy[ idx ] ) ;
        }
        break ;
      default :
        return itemToCopy ;
    }
    return copiedItem ;
  } ;

  function convertRgbToHex ( colorComponents , asArray ) {
    if ( colorComponents.length < 3 ) {
      return null ;
    }
    if ( colorComponents.length == 4 && colorComponents[ 3 ] == 0 && !asArray ) {
      return 'transparent' ;
    }
    var hexValues = [ ] ;
    for ( var idx = 0 ; idx < 3 ; idx++ ) {
      var colorPart = ( colorComponents[ idx ] - 0 ) .toString( 16 ) ;
      hexValues.push( ( colorPart.length == 1 ) ? '0' + colorPart : colorPart ) ;
    }
    return ( asArray ) ? hexValues : '#' + hexValues.join( '' ) ;
  } ;

  function removeElement ( domElement ) {
    clearChildren( domElement ) ;
    if ( domElement.parentNode ) {
      domElement.parentNode.removeChild( domElement ) ;
    }
    if ( domElement.clearAttributes ) {
      domElement.clearAttributes ( ) ;
    }
  } ;

  function clearChildren ( domElement ) {
    for ( var descendants = domElement.childNodes , idx = 0 ; idx < descendants.length ; idx++ ) {
      removeElement( descendants[ idx ] ) ;
    }
  } ;

  function attachHandler ( domElement , eventType , handlerFn ) {
    if ( domElement.addEventListener ) {
      domElement.addEventListener( eventType , handlerFn , false ) ;
    }
    else {
      domElement.attachEvent( 'on' + eventType , handlerFn ) ;
    }
  } ;

  function hasStyleClass ( domElement , cssClass ) {
    return ( ' ' + domElement.className + ' ' ) .indexOf( ' ' + cssClass + ' ' ) > -1 ;
  } ;

  function addStyleClass ( domElement , cssClass ) {
    if ( !hasStyleClass( domElement , cssClass ) ) {
      domElement.className = ( domElement.className + " " + cssClass ) ;
    }
  } ;

  function removeStyleClass ( domElement , cssClass ) {
    domElement.className = domElement.className.replace( new RegExp( '(^|\\s)' + cssClass + '(?:\\s|$)' ) , '$1' ) ;
  } ;

  function fetchElementById ( uniqueId ) {
    return document.getElementById( uniqueId ) ;
  } ;

  var Blueprint = function ( props ) {
    props = props || { } ;
    var constructorFunc = function ( ) {
      // No attributes defined directly in Blueprint properties.
      // for ( var propertyKey in this ) {
      //   if ( typeof this[ propertyKey ] != 'function' ) this[ propertyKey ] = deepCopy( this[ propertyKey ] ) ;
      // }
      this.constructor = constructorFunc ;
      if ( Blueprint.protoBuilding ) {
        return this ;
      }
      var newlyCreated = ( this.initialize ) ? this.initialize.apply( this , arguments ) : this ;
      return newlyCreated ;
    } ;

    for ( var modifierKey in Blueprint.Modifiers ) {
      if ( !props[ modifierKey ] ) {
        continue ;
      }
      props = Blueprint.Modifiers[ modifierKey ] ( props , props[ modifierKey ] ) ;
      delete props[ modifierKey ] ;
    }

    assignProps( constructorFunc , this ) ;
    constructorFunc.constructor = Blueprint ;
    constructorFunc.prototype = props ;
    return constructorFunc ;
  } ;

  Blueprint.Modifiers = {

    InheritFrom : function ( currentObj , baseClass ) {
      Blueprint.protoBuilding = baseClass.prototype ;
      var derivedInstance = new baseClass ;
      delete derivedInstance.parent ;
      derivedInstance = Blueprint.mixIn( derivedInstance , currentObj ) ;
      delete Blueprint.protoBuilding ;
      return derivedInstance ;
    } ,

    AdoptTraits : function ( currentObj , traitClasses ) {
      forEvery( toArray( traitClasses ) , function ( traitClass ) {
        Blueprint.protoBuilding = traitClass ;
        assignProps( currentObj , ( identifyKind( traitClass ) == 'function' ) ? new traitClass : traitClass ) ;
        delete Blueprint.protoBuilding ;
      } ) ;
      return currentObj ;
    }

  } ;

  assignProps( Blueprint , {

    mixIn : function ( targetObj , sourceProps ) {
      var callingMethod = arguments.callee.caller ;
      for ( var propertyKey in sourceProps ) {
        var newOverride = sourceProps[ propertyKey ] ;
        var existingValue = targetObj[ propertyKey ] ;
        var itemKind = identifyKind( newOverride ) ;
        if ( existingValue && itemKind == 'function' ) {
          if ( newOverride != existingValue ) {
            if ( callingMethod ) {
              newOverride.__parent = existingValue ;
              targetObj[ propertyKey ] = newOverride ;
            }
            else {
              Blueprint.replaceMethod( targetObj , propertyKey , newOverride ) ;
            }
          }
        }
        else if ( itemKind == 'object' ) {
          targetObj[ propertyKey ] = combineObjects( existingValue , newOverride ) ;
        }
        else {
          targetObj[ propertyKey ] = newOverride ;
        }
      }

      if ( callingMethod ) {
        targetObj.parent = function ( ) {
          return arguments.callee.caller.__parent.apply( this , arguments ) ;
        } ;
      }

      return targetObj ;
    } ,

    replaceMethod : function ( targetObj , methodName , newMethod ) {
      var superProto = Blueprint.protoBuilding ;
      if ( superProto && targetObj[ methodName ] != superProto[ methodName ] ) {
        superProto = null ;
      }
      var methodWrapper = function ( ) {
        var priorParent = this.parent ;
        this.parent = superProto ? superProto[ methodName ] : targetObj[ methodName ] ;
        var returnVal = newMethod.apply( this , arguments ) ;
        this.parent = priorParent ;
        return returnVal ;
      } ;
      targetObj[ methodName ] = methodWrapper ;
    }

  } ) ;

  Blueprint.prototype.implement = function ( ) {
    var prototypeRef = this.prototype ;
    forEvery( Array.prototype.slice.call( arguments || [ ] ) , function ( traitProperties ) {
      Blueprint.mixIn( prototypeRef , traitProperties ) ;
    } ) ;
    return this ;
  } ;

  /*
     Object: StructureHelper

     Various common JSON tree manipulation methods.
  */
  this.StructureHelper = {

    /*
       Method: prune

       Removes all tree nodes whose depth exceeds a specified maximum level.

       Parameters:

          dataStructure - A JSON tree object. For more details, refer to <Loader.loadJSON>.
          depthLimit - An integer indicating the maximum allowed level for this tree. All nodes beyond this depth will be discarded.

    */
    prune : function ( dataStructure , depthLimit ) {
      this.each( dataStructure , function ( nodeItem , idx ) {
        if ( idx == depthLimit && nodeItem.children ) {
          delete nodeItem.children ;
          nodeItem.children = [ ] ;
        }
      } ) ;
    } ,

    /*
       Method: getParentNode

       Retrieves the parent node of the node identified by the given `uniqueId`.

       Parameters:

          dataStructure - A JSON tree object. See also <Loader.loadJSON>.
          uniqueId - The identifier of the child node whose parent is to be found.

      Returns:

          A tree JSON node if found, otherwise `false`.

    */
    getParentNode : function ( dataStructure , uniqueId ) {
      if ( dataStructure.id == uniqueId ) {
        return false ;
      }
      var descendants = dataStructure.children ;
      if ( descendants && descendants.length > 0 ) {
        for ( var idx = 0 ; idx < descendants.length ; idx++ ) {
          if ( descendants[ idx ].id == uniqueId ) {
            return dataStructure ;
          }
          else {
            var resultNode = this.getParentNode( descendants[ idx ] , uniqueId ) ;
            if ( resultNode ) {
              return resultNode ;
            }
          }
        }
      }
      return false ;
    } ,

    /*
       Method: getSubBranch

       Returns the subtree that matches the specified `uniqueId`.

       Parameters:

          dataStructure - A JSON tree object. See also <Loader.loadJSON>.
          uniqueId - A node's *unique* identifier.

       Returns:

          A subtree with a root node matching the given `uniqueId`. Returns `null` if no matching subtree is found.

    */
    getSubBranch : function ( dataStructure , uniqueId ) {
      if ( dataStructure.id == uniqueId ) {
        return dataStructure ;
      }
      for ( var idx = 0 , descendants = dataStructure.children ; idx < descendants.length ; idx++ ) {
        var foundBranch = this.getSubBranch( descendants[ idx ] , uniqueId ) ;
        if ( foundBranch != null ) {
          return foundBranch ;
        }
      }
      return null ;
    } ,

    /*
       Method: getTerminalNodes

        Provides the leaf nodes of the tree.

       Parameters:

          currentBranch - A JSON tree node. See also <Loader.loadJSON>.
          depthLimit - _optional_ The maximum level for the subtree.

       Returns:

       An array containing objects, each with two properties.

        - The _currentBranch_ property holds the leaf node.
        - The _level_ property specifies the depth of the node.

    */
    getTerminalNodes : function ( currentBranch , depthLimit ) {
      var terminalNodes = [ ] , displayLevels = depthLimit || Number.MAX_VALUE ;
      this.each( currentBranch , function ( nodeItem , idx ) {
        if ( idx < displayLevels &&
          ( !nodeItem.children || nodeItem.children.length == 0 ) ) {
          terminalNodes.push( {
            'node' : nodeItem ,
            'level' : displayLevels - idx
          } ) ;
        }
      } ) ;
      return terminalNodes ;
    } ,


    /*
       Method: processByLevel

        Iterates over tree nodes with a relative depth less than or equal to a specified level.

       Parameters:

          dataStructure - A JSON tree or subtree. See also <Loader.loadJSON>.
          initialLevel - An integer indicating the starting relative level. Typically zero.
          targetLevel - An integer specifying an upper level. This method will only process nodes with a depth less than or equal to this number.
          actionFn - A function that receives a node and an integer specifying the node's actual level.

      Example:
     (start code js)
       StructureHelper.processByLevel(myTree, 0, 3, function(node, currentDepth) {
          console.log(node.name + ' at depth ' + currentDepth);
       });
     (end code)
    */
    processByLevel : function ( dataStructure , initialLevel , targetLevel , actionFn ) {
      if ( initialLevel <= targetLevel ) {
        actionFn( dataStructure , initialLevel ) ;
        for ( var idx = 0 , descendants = dataStructure.children ; idx < descendants.length ; idx++ ) {
          this.processByLevel( descendants[ idx ] , initialLevel + 1 , targetLevel , actionFn ) ;
        }
      }
    } ,

    /*
       Method: each

        A tree iterator.

       Parameters:

          dataStructure - A JSON tree or subtree. See also <Loader.loadJSON>.
          actionFn - A function that receives a node.

      Example:
      (start code js)
        StructureHelper.each(myTree, function(node) {
          console.log(node.name);
        });
      (end code)

    */
    each : function ( dataStructure , actionFn ) {
      this.processByLevel( dataStructure , 0 , Number.MAX_VALUE , actionFn ) ;
    } ,

    /*
       Method: retrieveSubtrees

        Attaches subtrees to leaf nodes by requesting new subtrees
        using the `request` method.

       Parameters:

          dataStructure - A JSON tree node. <Loader.loadJSON>.
          manager - An object that implements a `request` method.

       Example:
        (start code js)
          StructureHelper.retrieveSubtrees(leafNode, {
            request: function(nodeIdentifier, currentLevel, onCompletion) {
              // Pseudocode for an AJAX request for a new subtree
              // rooted at `nodeIdentifier` with depth `currentLevel`...
              AjaxRequest.send({
                'url': 'http://subtreeapi.example.com/',

                onSuccess: function(jsonResponse) {
                  onCompletion.onCompletion(nodeIdentifier, jsonResponse);
                }
              });
            }
          });
        (end code)
    */
    retrieveSubtrees : function ( dataStructure , manager ) {
      var depthLimit = manager.request && manager.levelsToShow ;
      var terminalNodes = this.getTerminalNodes( dataStructure , depthLimit ) ,
        totalCount = terminalNodes.length ,
        identifiedNode = { } ;
      if ( totalCount == 0 ) {
        manager.onComplete ( ) ;
      }
      for ( var idx = 0 , processedCount = 0 ; idx < totalCount ; idx++ ) {
        var currentLeaf = terminalNodes[ idx ] , uniqueId = currentLeaf.node.id ;
        identifiedNode[ uniqueId ] = currentLeaf.node ;
        manager.request( uniqueId , currentLeaf.level , {
          onCompletion : function ( nodeIdentifier , subTreeData ) {
            var newChildren = subTreeData.children ;
            identifiedNode[ nodeIdentifier ].children = newChildren ;
            if ( ++processedCount == totalCount ) {
              manager.onComplete ( ) ;
            }
          }
        } ) ;
      }
    }
  } ;


  /*
   * File: CanvasUtility.js
   *
   * A cross-browser Canvas drawing component.
   *
   * Utilized By:
   *
   * <STGraph>, <HyperVisualization>, <RadialGraph>
   */
  /*
   Blueprint: DrawingSurface

    A versatile Canvas implementation. This Blueprint can be used with the ExCanvas library to deliver
  */
  // No further code in the original for this section, just a comment.
} ) ( ) ;