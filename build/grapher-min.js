// Ayasdi Inc. Copyright 2014
// Grapher.js may be freely distributed under the Apache 2.0 license.

(function outer(modules,cache,entries){var global=function(){return this}();function require(name,jumped){if(cache[name])return cache[name].exports;if(modules[name])return call(name,require);throw new Error('cannot find module "'+name+'"')}function call(id,require){var m=cache[id]={exports:{}};var mod=modules[id];var name=mod[2];var fn=mod[0];fn.call(m.exports,function(req){var dep=modules[id][1][req];return require(dep?dep:req)},m,m.exports,outer,modules,cache,entries);if(name)cache[name]=cache[id];return cache[id].exports}for(var id in entries){if(entries[id]){global[entries[id]]=require(id)}else{require(id)}}require.duo=true;require.cache=cache;require.modules=modules;return require})({1:[function(require,module,exports){var Grapher=require("./modules/grapher.js");if(module&&module.exports)module.exports=Grapher;if(typeof Ayasdi==="undefined")Ayasdi={};Ayasdi.Grapher=Grapher},{"./modules/grapher.js":2}],2:[function(require,module,exports){(function(){var Renderer=require("./gl/renderer.js"),Color=require("./color.js"),Link=require("./link.js"),Node=require("./node.js"),u=require("./utilities.js");function Grapher(){this.initialize.apply(this,arguments);return this}Grapher.prototype={};Grapher.prototype.initialize=function(o){this.props=u.extend({color:2236962,scale:1,translate:[0,0],resolution:window.devicePixelRatio||1},o);if(!o.canvas)this.props.canvas=document.createElement("canvas");if(!o.width)this.props.width=this.props.canvas.clientWidth;if(!o.height)this.props.height=this.props.canvas.clientHeight;this.renderer=new Renderer(this.props);this.canvas=this.props.canvas;this.resize(this.props.width,this.props.height);this.hasModifiedTransform=false;this.links=[];this.nodes=[];this.renderer.setLinks(this.links);this.renderer.setNodes(this.nodes);this.willUpdate={};this.updateAll={};this._clearUpdateQueue();this._updateLink=u.bind(this._updateLink,this);this._updateNode=u.bind(this._updateNode,this);this._updateLinkByIndex=u.bind(this._updateLinkByIndex,this);this._updateNodeByIndex=u.bind(this._updateNodeByIndex,this);this.animate=u.bind(this.animate,this);this.handlers={};u.eachKey(o,this.set,this)};Grapher.prototype.set=function(val,key){var setter=this[key];if(setter&&u.isFunction(setter))return setter.call(this,val)};Grapher.prototype.on=function(event,fn){this.handlers[event]=this.handlers[event]||[];this.handlers[event].push(fn);this.canvas.addEventListener(event,fn,false);return this};Grapher.prototype.off=function(event,fn){var i=u.indexOf(this.handlers[event],fn);if(i>-1)this.handlers[event].splice(i,1);this.canvas.removeEventListener(event,fn,false);return this};Grapher.prototype.palette=function(name){if(u.isUndefined(name))return this.props.palette;this.props.palette=Grapher.getPalette(name);this.update();return this};Grapher.prototype.data=function(data){if(u.isUndefined(data))return this.props.data;this.props.data=data;this.exit();this.enter();this.update();if(!this.hasModifiedTransform)this.center();return this};Grapher.prototype.enter=function(){var data=this.data();if(this.links.length<data.links.length){var links=data.links.slice(this.links.length,data.links.length-this.links.length);u.eachPop(links,u.bind(function(){this.links.push(new Link)},this))}if(this.nodes.length<data.nodes.length){var nodes=data.nodes.slice(this.nodes.length,data.nodes.length-this.nodes.length);u.eachPop(nodes,u.bind(function(){this.nodes.push(new Node)},this))}return this};Grapher.prototype.exit=function(){var data=this.data(),exiting=[];if(data.links.length<this.links.length){this.links.splice(data.links.length,this.links.length-data.links.length)}if(data.nodes.length<this.nodes.length){this.nodes.splice(data.nodes.length,this.nodes.length-data.nodes.length)}return this};Grapher.prototype.update=function(type,start,end){var indices;if(u.isArray(start))indices=start;else if(u.isNumber(start)&&u.isNumber(end))indices=u.range(start,end);if(u.isArray(indices)){this._addToUpdateQueue(type,indices);if(type===NODES)this._addToUpdateQueue(LINKS,this._findLinks(indices))}else{if(type!==NODES)this.updateAll.links=true;if(type!==LINKS)this.updateAll.nodes=true}return this};Grapher.prototype.updateNode=function(index,willUpdateLinks){this._addToUpdateQueue(NODES,[index]);if(willUpdateLinks)this._addToUpdateQueue(LINKS,this._findLinks([index]));return this};Grapher.prototype.updateLink=function(index){this._addToUpdateQueue(LINKS,[index]);return this};Grapher.prototype.render=function(){this._update();this.renderer.render();return this};Grapher.prototype.animate=function(time){this.render();this.currentFrame=requestAnimationFrame(this.animate)};Grapher.prototype.play=function(){this.currentFrame=requestAnimationFrame(this.animate);return this};Grapher.prototype.pause=function(){if(this.currentFrame)cancelAnimationFrame(this.currentFrame);return this};Grapher.prototype.stop=function(){this.pause();this.currentFrame=undefined;return this};Grapher.prototype.resize=function(width,height){this.props.width=width;this.props.height=height;this.renderer.resize(width,height);return this};Grapher.prototype.center=function(){var x=0,y=0,scale=1,nodes=this.data()?this.data().nodes:null,numNodes=nodes?nodes.length:0;if(numNodes){var minX=Infinity,maxX=-Infinity,minY=Infinity,maxY=-Infinity,width=this.canvas.width/this.props.resolution,height=this.canvas.height/this.props.resolution,pad=1.1,i;for(i=0;i<numNodes;i++){if(nodes[i].x<minX)minX=nodes[i].x;if(nodes[i].x>maxX)maxX=nodes[i].x;if(nodes[i].y<minY)minY=nodes[i].y;if(nodes[i].y>maxY)maxY=nodes[i].y}var dX=maxX-minX,dY=maxY-minY;scale=Math.min(width/dX,height/dY,2)/pad;x=(width-dX*scale)/2-minX*scale;y=(height-dY*scale)/2-minY*scale}return this.scale(scale).translate([x,y])};Grapher.prototype.transform=function(transform){if(u.isUndefined(transform))return{scale:this.props.scale,translate:this.props.translate};this.scale(transform.scale);this.translate(transform.translate);return this};Grapher.prototype.scale=function(scale){if(u.isUndefined(scale))return this.props.scale;if(u.isNumber(scale))this.props.scale=scale;this.updateTransform=true;this.hasModifiedTransform=true;return this};Grapher.prototype.translate=function(translate){if(u.isUndefined(translate))return this.props.translate;if(u.isArray(translate))this.props.translate=translate;this.updateTransform=true;this.hasModifiedTransform=true;return this};Grapher.prototype.color=function(color){if(u.isUndefined(color))return this.props.color;this.props.color=Color.parse(color);return this};Grapher.prototype.getDataPosition=function(x,y){x=this.renderer.untransformX(x);y=this.renderer.untransformY(y);return{x:x,y:y}};Grapher.prototype.getDisplayPosition=function(x,y){x=this.renderer.transformX(x);y=this.renderer.transformY(y);return{x:x,y:y}};Grapher.prototype._addToUpdateQueue=function(type,indices){var willUpdate=type===NODES?this.willUpdate.nodes:this.willUpdate.links,updateAll=type===NODES?this.updateAll.nodes:this.updateAll.links,spriteSet=type===NODES?this.nodes:this.links;var insert=function(n){u.uniqueInsert(willUpdate,n)};if(!updateAll&&u.isArray(indices))u.each(indices,insert,this);updateAll=updateAll||willUpdate.length>=spriteSet.length;if(type===NODES)this.updateAll.nodes=updateAll;else this.updateAll.links=updateAll};Grapher.prototype._clearUpdateQueue=function(){this.willUpdate.links=[];this.willUpdate.nodes=[];this.updateAll.links=false;this.updateAll.nodes=false;this.updateTransform=false};Grapher.prototype._update=function(){var updatingLinks=this.willUpdate.links,updatingNodes=this.willUpdate.nodes,i;if(this.updateAll.links)u.each(this.links,this._updateLink);else if(updatingLinks&&updatingLinks.length)u.eachPop(updatingLinks,this._updateLinkByIndex);if(this.updateAll.nodes)u.each(this.nodes,this._updateNode);else if(updatingNodes&&updatingNodes.length)u.eachPop(updatingNodes,this._updateNodeByIndex);if(this.updateTransform){this.renderer.setScale(this.props.scale);this.renderer.setTranslate(this.props.translate)}this._clearUpdateQueue()};Grapher.prototype._updateLink=function(link,i){var data=this.data(),l=data.links[i],from=data.nodes[l.from],to=data.nodes[l.to];var color=!u.isUndefined(l.color)?this._findColor(l.color):Color.interpolate(this._findColor(from.color),this._findColor(to.color));link.update(from.x,from.y,to.x,to.y,color)};Grapher.prototype._updateNode=function(node,i){var n=this.data().nodes[i];node.update(n.x,n.y,n.r,this._findColor(n.color))};Grapher.prototype._updateNodeByIndex=function(i){this._updateNode(this.nodes[i],i)};Grapher.prototype._updateLinkByIndex=function(i){this._updateLink(this.links[i],i)};var isLinked=function(indices,l){var i,len=indices.length,flag=false;for(i=0;i<len;i++){if(l.to==indices[i]||l.from==indices[i]){flag=true;break}}return flag};Grapher.prototype._findLinks=function(indices){var links=this.data().links,i,numLinks=links.length,updatingLinks=[];for(i=0;i<numLinks;i++){if(isLinked(indices,links[i]))updatingLinks.push(i)}return updatingLinks};Grapher.prototype._findColor=function(c){var color=NaN,palette=this.palette();if(palette&&palette[c])color=palette[c];else color=Color.parse(c);if(u.isNaN(color))color=this.color();return color};var NODES=Grapher.NODES="nodes";var LINKS=Grapher.LINKS="links";Grapher.palettes={};Grapher.getPalette=function(name){return this.palettes[name]};Grapher.setPalette=function(name,swatches){var palette=this.palettes[name]={};swatches=u.map(swatches,Color.parse);u.each(swatches,function(swatch,i){palette[i]=swatch;for(var j=0;j<i;j++){var color=Color.interpolate(swatches[j],swatch,.5);palette[j+"-"+i]=color}},this);return this};if(module&&module.exports)module.exports=Grapher})()},{"./gl/renderer.js":3,"./color.js":4,"./link.js":5,"./node.js":6,"./utilities.js":7}],3:[function(require,module,exports){(function(){var LinkVertexShaderSource=require("./shaders/link.vert"),LinkFragmentShaderSource=require("./shaders/link.frag"),NodeVertexShaderSource=require("./shaders/node.vert"),NodeFragmentShaderSource=require("./shaders/node.frag");var Renderer=function(){this.initialize.apply(this,arguments);return this};Renderer.prototype={};Renderer.prototype.initialize=function(o){this.canvas=o.canvas;this.width=o.width;this.height=o.height;this.lineWidth=o.lineWidth||2;this.resolution=o.resolution||1;this.nodeObjects=[];this.linkObjects=[];this.nodes=[];this.links=[];this.gl=null;this.scale=o.scale;this.translate=o.translate;this.NODE_ATTRIBUTES=6;this.LINKS_ATTRIBUTES=3;this.linksProgram=null;this.nodesProgram=null;this.initGL()};Renderer.prototype.initGL=function(){if(!this.gl)this.gl=this.canvas.getContext("experimental-webgl",{antialias:true});if(!this.gl)return;this.gl.viewport(0,0,this.canvas.width,this.canvas.height);this.linksProgram=this.initShaders(LinkVertexShaderSource,LinkFragmentShaderSource);this.nodesProgram=this.initShaders(NodeVertexShaderSource,NodeFragmentShaderSource);this.gl.blendFunc(this.gl.SRC_ALPHA,this.gl.ONE_MINUS_SRC_ALPHA);this.gl.enable(this.gl.BLEND)};Renderer.prototype.initShaders=function(vertexShaderSource,fragmentShaderSource){var vertexShader=this.getShaders(this.gl.VERTEX_SHADER,vertexShaderSource);var fragmentShader=this.getShaders(this.gl.FRAGMENT_SHADER,fragmentShaderSource);var shaderProgram=this.gl.createProgram();this.gl.attachShader(shaderProgram,vertexShader);this.gl.attachShader(shaderProgram,fragmentShader);return shaderProgram};Renderer.prototype.getShaders=function(type,source){var shader=this.gl.createShader(type);this.gl.shaderSource(shader,source);this.gl.compileShader(shader);return shader};Renderer.prototype.setNodes=function(nodes){this.nodeObjects=nodes};Renderer.prototype.setLinks=function(links){this.linkObjects=links};Renderer.prototype.setScale=function(scale){this.scale=scale};Renderer.prototype.setTranslate=function(translate){this.translate=translate};Renderer.prototype.updateNodesBuffer=function(){var j=0;this.nodes=[];for(var i=0;i<this.nodeObjects.length;i++){var node=this.nodeObjects[i];var cx=this.transformX(node.x)*this.resolution;var cy=this.transformY(node.y)*this.resolution;var r=node.r*Math.abs(this.scale*this.resolution);var color=node.color;this.nodes[j++]=cx-r;this.nodes[j++]=cy-r;this.nodes[j++]=color;this.nodes[j++]=cx;this.nodes[j++]=cy;this.nodes[j++]=r;this.nodes[j++]=cx+(1+Math.sqrt(2))*r;this.nodes[j++]=cy-r;this.nodes[j++]=color;this.nodes[j++]=cx;this.nodes[j++]=cy;this.nodes[j++]=r;this.nodes[j++]=cx-r;this.nodes[j++]=cy+(1+Math.sqrt(2))*r;this.nodes[j++]=color;this.nodes[j++]=cx;this.nodes[j++]=cy;this.nodes[j++]=r}};Renderer.prototype.updateLinksBuffer=function(){var j=0;this.links=[];for(var i=0;i<this.linkObjects.length;i++){var link=this.linkObjects[i];var x1=this.transformX(link.x1)*this.resolution;var y1=this.transformY(link.y1)*this.resolution;var x2=this.transformX(link.x2)*this.resolution;var y2=this.transformY(link.y2)*this.resolution;var color=link.color;this.links[j++]=x1;this.links[j++]=y1;this.links[j++]=color;this.links[j++]=x2;this.links[j++]=y2;this.links[j++]=color}};Renderer.prototype.transformX=function(x){return x*this.scale+this.translate[0]};Renderer.prototype.transformY=function(y){return y*this.scale+this.translate[1]};Renderer.prototype.untransformX=function(x){return(x-this.translate[0])/this.scale};Renderer.prototype.untransformY=function(y){return(y-this.translate[1])/this.scale};Renderer.prototype.resize=function(width,height){var displayWidth=width*this.resolution;var displayHeight=height*this.resolution;this.canvas.width=displayWidth;this.canvas.height=displayHeight;if(!this.gl)return;this.gl.viewport(0,0,this.canvas.width,this.canvas.height)};Renderer.prototype.render=function(){if(!this.gl)return;this.updateNodesBuffer();this.updateLinksBuffer();this.renderLinks();this.renderNodes()};Renderer.prototype.renderLinks=function(){var program=this.linksProgram;this.gl.linkProgram(program);this.gl.useProgram(program);var linksBuffer=new Float32Array(this.links);var buffer=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,buffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,linksBuffer,this.gl.STATIC_DRAW);var resolutionLocation=this.gl.getUniformLocation(program,"u_resolution");this.gl.uniform2f(resolutionLocation,this.canvas.width,this.canvas.height);var positionLocation=this.gl.getAttribLocation(program,"a_position");var colorLocation=this.gl.getAttribLocation(program,"a_color");this.gl.enableVertexAttribArray(positionLocation);this.gl.enableVertexAttribArray(colorLocation);this.gl.vertexAttribPointer(positionLocation,2,this.gl.FLOAT,false,this.LINKS_ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0);this.gl.vertexAttribPointer(colorLocation,1,this.gl.FLOAT,false,this.LINKS_ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8);this.gl.lineWidth(this.lineWidth*Math.abs(this.scale*this.resolution));this.gl.drawArrays(this.gl.LINES,0,this.links.length/this.LINKS_ATTRIBUTES)};Renderer.prototype.renderNodes=function(){var program=this.nodesProgram;this.gl.linkProgram(program);this.gl.useProgram(program);var nodesBuffer=new Float32Array(this.nodes);var buffer=this.gl.createBuffer();this.gl.bindBuffer(this.gl.ARRAY_BUFFER,buffer);this.gl.bufferData(this.gl.ARRAY_BUFFER,nodesBuffer,this.gl.STATIC_DRAW);var resolutionLocation=this.gl.getUniformLocation(program,"u_resolution");this.gl.uniform2f(resolutionLocation,this.canvas.width,this.canvas.height);var positionLocation=this.gl.getAttribLocation(program,"a_position");var colorLocation=this.gl.getAttribLocation(program,"a_color");var centerLocation=this.gl.getAttribLocation(program,"a_center");var radiusLocation=this.gl.getAttribLocation(program,"a_radius");this.gl.enableVertexAttribArray(positionLocation);this.gl.enableVertexAttribArray(colorLocation);this.gl.enableVertexAttribArray(centerLocation);this.gl.enableVertexAttribArray(radiusLocation);this.gl.vertexAttribPointer(positionLocation,2,this.gl.FLOAT,false,this.NODE_ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,0);this.gl.vertexAttribPointer(colorLocation,1,this.gl.FLOAT,false,this.NODE_ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,8);this.gl.vertexAttribPointer(centerLocation,2,this.gl.FLOAT,false,this.NODE_ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,12);this.gl.vertexAttribPointer(radiusLocation,1,this.gl.FLOAT,false,this.NODE_ATTRIBUTES*Float32Array.BYTES_PER_ELEMENT,20);this.gl.drawArrays(this.gl.TRIANGLES,0,this.nodes.length/this.NODE_ATTRIBUTES)};if(module&&module.exports)module.exports=Renderer})()},{"./shaders/link.vert":8,"./shaders/link.frag":9,"./shaders/node.vert":10,"./shaders/node.frag":11}],8:[function(require,module,exports){module.exports="uniform vec2 u_resolution;\nattribute vec2 a_position;\nattribute float a_color;\nvarying vec4 color;\nvarying vec2 position;\nvarying vec2 resolution;\nvoid main() {\n  vec2 clipspace = a_position / u_resolution * 2.0 - 1.0;\n  gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);\n  float c = a_color;\n  color.b = mod(c, 256.0); c = floor(c / 256.0);\n  color.g = mod(c, 256.0); c = floor(c / 256.0);\n  color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;\n  color.a = 1.0;\n}\n"},{}],9:[function(require,module,exports){module.exports="precision mediump float;\nvarying vec4 color;\nvoid main() {\n  gl_FragColor = color;\n}\n"},{}],10:[function(require,module,exports){module.exports="uniform vec2 u_resolution;\nattribute vec2 a_position;\nattribute float a_color;\nattribute vec2 a_center;\nattribute float a_radius;\nvarying vec4 color;\nvarying vec2 center;\nvarying vec2 resolution;\nvarying float radius;\nvoid main() {\n  vec2 clipspace = a_position / u_resolution * 2.0 - 1.0;\n  gl_Position = vec4(clipspace * vec2(1, -1), 0, 1);\n  float c = a_color;\n  color.b = mod(c, 256.0); c = floor(c / 256.0);\n  color.g = mod(c, 256.0); c = floor(c / 256.0);\n  color.r = mod(c, 256.0); c = floor(c / 256.0); color /= 255.0;\n  color.a = 1.0;\n  radius = a_radius;\n  center = a_center;\n  resolution = u_resolution;\n}\n"},{}],11:[function(require,module,exports){module.exports="precision mediump float;\nvarying vec4 color;\nvarying vec2 center;\nvarying vec2 resolution;\nvarying float radius;\nvoid main() {\n  vec4 color0 = vec4(0.0, 0.0, 0.0, 0.0);\n  float x = gl_FragCoord.x;\n  float y = resolution[1] - gl_FragCoord.y;\n  float dx = center[0] - x;\n  float dy = center[1] - y;\n  float distance = sqrt(dx*dx + dy*dy);\n  if ( distance < radius )\n    gl_FragColor = color;\n  else \n    gl_FragColor = color0;\n}\n"},{}],4:[function(require,module,exports){var Color=module.exports={hexToRgb:hexToRgb,rgbToHex:rgbToHex,interpolate:interpolate,parse:parse};function hexToRgb(hex){return{r:hex>>16&255,g:hex>>8&255,b:hex&255}}function rgbToHex(r,g,b){return r<<16|g<<8|b}function interpolate(a,b,amt){amt=amt===undefined?.5:amt;var colorA=hexToRgb(a),colorB=hexToRgb(b),interpolated={r:colorA.r+(colorB.r-colorA.r)*amt,g:colorA.g+(colorB.g-colorA.g)*amt,b:colorA.b+(colorB.b-colorA.b)*amt};return rgbToHex(interpolated.r,interpolated.g,interpolated.b)}function parse(c){var color=parseInt(c);if(typeof c==="string"){if(c.split("#").length>1){color=parseInt(c.replace("#",""),16)}else if(c.split("rgb(").length>1){var rgb=c.substring(4,c.length-1).replace(/ /g,"").split(",");color=rgbToHex(rgb[0],rgb[1],rgb[2])}}return color}},{}],5:[function(require,module,exports){(function(){function Link(){this.x1=0;this.y1=0;this.x2=0;this.y2=0;this.color=0;return this}Link.prototype.update=function(x1,y1,x2,y2,color){this.x1=x1;this.y1=y1;this.x2=x2;this.y2=y2;this.color=color;return this};if(module&&module.exports)module.exports=Link})()},{}],6:[function(require,module,exports){(function(){function Node(){this.x=0;this.y=0;this.r=10;this.color=0;return this}Node.prototype.update=function(x,y,r,color){this.x=x;this.y=y;this.r=r;this.color=color;return this};if(module&&module.exports)module.exports=Node})()},{}],7:[function(require,module,exports){var Utilities=module.exports={each:each,eachPop:eachPop,eachKey:eachKey,map:map,clean:clean,range:range,sortedIndex:sortedIndex,indexOf:indexOf,uniqueInsert:uniqueInsert,extend:extend,bind:bind,noop:noop,isUndefined:isUndefined,isFunction:isFunction,isObject:isObject,isArray:Array.isArray,isNumber:isNumber,isNaN:isNaN};function noop(){}function each(arr,fn,ctx){fn=bind(fn,ctx);var i=arr.length;while(--i>-1){fn(arr[i],i)}return arr}function eachPop(arr,fn,ctx){fn=bind(fn,ctx);while(arr.length){fn(arr.pop())}return arr}function eachKey(obj,fn,ctx){fn=bind(fn,ctx);if(isObject(obj)){var keys=Object.keys(obj);while(keys.length){var key=keys.pop();fn(obj[key],key)}}return obj}function map(arr,fn,ctx){fn=bind(fn,ctx);var i=arr.length,mapped=new Array(i);while(--i>-1){mapped[i]=fn(arr[i],i)}return mapped}function clean(arr){eachPop(arr,noop);return arr}function range(start,end,step){step=isNumber(step)?step:1;if(isUndefined(end)){end=start;start=0}var i=Math.max(Math.ceil((end-start)/step),0),result=new Array(i);while(--i>-1){result[i]=start+step*i}return result}function sortedIndex(arr,n){var min=0,max=arr.length;while(min<max){var mid=min+max>>>1;if(n<mid)max=mid;else min=mid+1}return min}function indexOf(arr,n){var i=arr.length;while(--i>-1){if(arr[i]===n)return i}return i}function uniqueInsert(arr,n){if(indexOf(arr,n)===-1)arr.push(n);return arr}function extend(obj,source){if(isObject(obj)&&isObject(source)){var props=Object.getOwnPropertyNames(source),i=props.length;while(--i>-1){var prop=props[i];obj[prop]=source[prop]}}return obj}function bind(fn,ctx){if(!ctx)return fn;return function(){return fn.apply(ctx,arguments)}}function isUndefined(o){return typeof o==="undefined"}function isFunction(o){return typeof o==="function"}function isObject(o){return typeof o==="object"&&!!o}function isNumber(o){return typeof o==="number"}function isNaN(o){return isNumber(o)&&o!==+o}},{}]},{},{1:""});