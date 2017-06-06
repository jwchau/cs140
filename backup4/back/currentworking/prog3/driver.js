// HelloTriangle_LINE_STRIP.js (c) 2012 matsuda
// Vertex shader program
//'  gl_Position = u_ProjMatrix * u_ModelViewMatrix * a_Position;\n' +
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'attribute vec4 a_Color;\n' +
  'uniform mat4 u_ModelViewMatrix;\n' +
  'uniform mat4 u_ProjMatrix;\n' +
  'uniform bool u_Clicked;\n' + // Mouse is pressed
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_Position = u_ProjMatrix * u_ModelViewMatrix * a_Position;\n' +
  '  if (u_Clicked) {\n' +
  '		v_Color = vec4(0.5, 0.5, 0.5, 1.0);\n' +
  '  } else {\n' +
  '  	v_Color = a_Color;\n' +
  '	 }\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  '#ifdef GL_ES\n' +
  'precision mediump float;\n' +
  '#endif\n' +
  'varying vec4 v_Color;\n' +
  'void main() {\n' +
  '  gl_FragColor = v_Color;\n' +
  '}\n';

  ///GLOBALS
var dirLight = false, pointLight = false, click_temp;
var rArray;
var x, y, nx, ny, n=0;
var flag = true;
var points = new Array();

function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  setupIOSOR("fileinput");
  
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }
   
	canvas.addEventListener('mousedown', mDown);
	canvas.addEventListener('mouseup', mUp);
	canvas.addEventListener('click', pickObj);
	canvas.addEventListener('mousemove', mMove);
	canvas.addEventListener('contextmenu', contextstop);
  

  
  
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Write the positions of vertices to a vertex shader
  var n = initVertexBuffers(gl);
  if (n < 0) {
    console.log('Failed to set the positions of the vertices');
    return;
  }
  
  var u_ModelViewMatrix = gl.getUniformLocation(gl.program, 'u_ModelViewMatrix');
  var u_ProjMatrix = gl.getUniformLocation(gl.program, 'u_ProjMatrix');
	if(!u_ModelViewMatrix || !u_ProjMatrix) { 
		console.log('u_ModelViewMatrixã®æ ¼ç´å ´æ‰€ã®å–å¾—ã«å¤±æ•—');
    return;
  }
  var u_Clicked = gl.getUniformLocation(gl.program, 'u_Clicked');
  click_temp = u_Clicked;
  if (!u_Clicked) {
	  console.log("uclicked failed");
	  return;
  }
  
  gl.uniform1i(u_Clicked, 0); // Pass false to u_Clicked
  
  var orthotag = document.getElementById("orthoToggle");
  var perstag = document.getElementById("persToggle");
  
  var viewMatrix = new Matrix4();
  var modelMatrix = new Matrix4();
  var projMatrix = new Matrix4();
  
 
  
  
  if (orthotag.checked || true) {
	viewMatrix.setOrtho(-500,500,-500,500,-500,500);
	modelMatrix.setRotate(0, 1, 0, 0);
  }
  // else if (perstag.checked){
	  // viewMatrix.setLookAt(0.0, 0, 5, 0, 0, -1, 0, 1, 0);
	  // modelMatrix.setRotate(15, 1, 0, 0);  
	  // projMatrix.setPerspective(30, canvas.width/canvas.height, 1, 100);
  // } else {
	// viewMatrix.setOrtho(-1, 1, -1, 1, -1, 1);
	// viewMatrix.setLookAt(0, -0.1, 0.1, 0, 0, 0, 0, 1, 0);
	// modelMatrix.setRotate(25, 1, 0, 0);
  // }
  
  var tag = document.getElementById("yaxis");
  modelMatrix.rotate(tag.value, 0, 1, 0);
  var modelViewMatrix = viewMatrix.multiply(modelMatrix);
  gl.uniformMatrix4fv(u_ModelViewMatrix, false, modelViewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjMatrix, false, projMatrix.elements);

  
  // Specify the color for clearing <canvas>
  gl.clearColor(255, 255, 255, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.enable(gl.DEPTH_TEST);
  
  
  
  // MAIN DRAW
  if (n > 0 && flag) {
	  gl.drawArrays(gl.LINE_STRIP, 0, n);
  } else if (!flag) {
	bindColor(gl);
	n = bindSOR(gl);
	gl.drawElements(gl.TRIANGLE_STRIP, n, gl.UNSIGNED_SHORT, 0);
	
	// Line_Color(gl);
	// n = LineBind(gl); 						///line and box not needed for current assignment
	// gl.drawArrays(gl.LINE_STRIP, 0, n);
	
	Box_Color(gl);
	n = BoxBind(gl);								///line and box not needed for current assignment
	gl.drawArrays(gl.TRIANGLE_STRIP, 0, n);
    }
  
  if (n > 0 && flag ) {
	buff(gl);
	gl.drawArrays(gl.LINE_STRIP,0,2);
  }
  
}

function constructSOR(ver, ind, index){
	this.vertices = ver;
	this.indicies = ind;
	this.index = index;
}

var bounds = false;
var picked = false;
function pickObj(e){
	var orthotag = document.getElementById("orthoToggle");
	if (!flag) {
		var x = e.layerX;
			x = ((x/1001)*2-1);
		var y = e.layerY;
		    y = (-(y/1001)*2+1)
		if (orthotag.checked){
			x *= 500;
			y *= 500;
		}
		bounds = false;
		//from vertices array, get the maxx, minx, maxy, miny
		if (!bounds) {
			bounds = true;
			var xMax=0, xMin=0, yMax=0, yMin=0;
			for (var i = 0; i < vertices.length-3; i+=3){
				
				xMax = Math.max(xMax, vertices[i]);
				xMin = Math.min(xMin, vertices[i]);
				yMax = Math.max(yMax, vertices[i+1]);
				yMin = Math.min(yMin, vertices[i+1]);
			}
		}
		
		if (x<xMax && x>xMin && y<yMax && y>yMin){
			picked = true;
		} else picked = false;
	}
}


//jumpflag1flagjump1
var xdisplace = 0, ydisplace = 0;
var m2xd = 0, m2yd = 0;
function mUp(e){
	
	if (doubleflag && e.button == 2){
		m2xd = e.layerX - m2holdx;
		m2yd = m2holdy - e.layerY;
		
		xdisplace = 0;
		ydisplace = 0;
	}
	
	else if (doubleflag && e.button == 0){
		xdisplace = e.layerX - holdx;
		ydisplace = holdy - e.layerY;
	}
	
	if (picked) translated = true;
	else translated = false;
}

/////////////Matrix4.prototype.setRotate = function(angle, x, y, z)
function rotateVerts(v){
	var rMatrix = new Matrix4();
	
	//need to find center of sor then rotate.
	var cSOR = getCenter(v);
	rMatrix.setTranslate(cSOR.elements[0],cSOR.elements[1],cSOR.elements[2]); 
	var cSORi = rMatrix.invert(); //dis inverse matrix of center translated matrix;
								  //rmatrix is centered
	
	
	
	console.log(m2yd,m2xd);
	rMatrix.setRotate(0, 1, 0, 0);
	var yRot = Math.abs(m2yd) - Math.abs(m2xd);
	rMatrix.rotate(10, 0, 1, 0);
	

	var tempVertices = new Array();
	for (var i = 0; i < v.length; i+=3){
		var rVector = new Vector3([
						v[i],
						v[i+1],
						v[i+2]
						]);
		
		rVector = rMatrix.multiplyVector3(rVector);
		tempVertices.push(rVector.elements[0], rVector.elements[1], rVector.elements[2]);
	}

	flatVertices = tempVertices;
	revA = tempVertices;
	return Float32Array.from(tempVertices);
}

function getCenter(v){
	var ax=0,ay=0,az=0;
	var total = v.length-3;
	for (var x = 0; x < v.length-3; x+=3){
		ax= (ax + v[x]);
		ay= (ay + v[x+1]);
		az= (az + v[x+2]);
	}
	ax /= total/3;
	ay /= total/3;
	az /= total/3;
	return new Vector3([ax,ay,az]);
}

function scaleVerts(v){
	var sMatrix = new Matrix4();
	
	var cSOR = getCenter(v);
	sMatrix.setTranslate(cSOR.elements[0],cSOR.elements[1],cSOR.elements[2]); 
	var cSORi = sMatrix.invert(); //dis inverse matrix of center translated matrix;
								  //rmatrix is centered
	
	var scaler = document.getElementById("scaleSlider");
	sMatrix.setScale(scaler.value,scaler.value,scaler.value);

	var tempVertices = new Array();
	for (var i = 0; i < v.length; i+=3){
		var sVector = new Vector3([
						v[i],
						v[i+1],
						v[i+2]
						]);
		
		sVector = sMatrix.multiplyVector3(sVector);
		tempVertices.push(sVector.elements[0], sVector.elements[1], sVector.elements[2]);
	}
	
	flatVertices = tempVertices;
	revA = tempVertices;
	return Float32Array.from(tempVertices);
}


var translated = false;
function translateVerts(v, xd, yd){
	var tMatrix = new Matrix4();
	
	var cSOR = getCenter(v);
	tMatrix.setTranslate(cSOR.elements[0],cSOR.elements[1],cSOR.elements[2]); 
	var cSORi = tMatrix.invert(); //dis inverse matrix of center translated matrix;
								  //rmatrix is centered
	
	tMatrix.setTranslate(xd, yd, 0);

	var tempVertices = new Array();
	for (var i = 0; i < v.length; i+=3){
		var tVector = new Vector3([
						v[i],
						v[i+1],
						v[i+2]
						]);
		
		tVector = tMatrix.multiplyVector3(tVector);
		tempVertices.push(tVector.elements[0], tVector.elements[1], tVector.elements[2]);
	}
	
	
	flatVertices = tempVertices;
	revA = tempVertices;
	
	return Float32Array.from(tempVertices);
}
var doubleflag = false;
var holdx=0, holdy=0;
var m2holdx=0, m2holdy=0;
function mDown(e){
	var canvas = document.getElementById("webgl");
	var bottombound = 85; var leftbound = 465; var rightbound = 540;

	x = e.layerX;
	y = e.layerY;
	
	holdx = x;
	holdy = y;

	
	if (!flag && e.button == 2) {
		m2holdx = x;
		m2holdy = y;
		doubleflag = true;
	}
	

	if (x > leftbound && x < rightbound && y > 0.0 && y < bottombound) {
		pointLight = (!pointLight);
		console.log("Pointlight on? : " + pointLight);
	}
	
	// translate to webgl
	var orthotag = document.getElementById("orthoToggle");
	if (orthotag.checked) {
		x = 500*((x/canvas.width)*2-1);  //position / canvas.window * 2 - 1 formula for x
		y = 500*(-(y/canvas.height)*2+1); //-position / canvas.window * 2 + 1 formula for y
	} else {
		x = (x/canvas.width)*2-1;
		y = -(y/canvas.height)*2+1;
	}
	if (e.button == 2 && flag) {
		printArray();
		flag = false;
		rArray = ArrayRevolution();
		
		}
		
	if (flag) {
		console.log("("+x+","+y+")");
		points.push(x);
		points.push(y);
		n++;
	}
}
  
  

  
function mMove(e){
	var canvas = document.getElementById("webgl");
	var w = canvas.width; var h = canvas.height;
	nx = e.layerX;
	ny = e.layerY;
	// console.log(x + "_" +y);
	var orthotag = document.getElementById("orthoToggle");
	if (orthotag.checked) {
		nx = 500*((nx/w)*2-1);
		ny = 500*(-(ny/h)*2+1);
	} else {
		nx = (nx/w)*2-1;
		ny = -(ny/h)*2+1;
	}
}  

function saveCurrentSOR(){
	var output = new SOR('output', vertices, indices)
	saveFile(output);
}

var sorObject, sorV, sorI, extracted = false;
function updateScreen(){
	sorObject = readFile();
	sorV = sorObject.vertices;
	sorI = sorObject.indexes;
	extracted = true;
	flag = false;
	n = sorV.length;
	main();
}

function vertex(x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}



//CALCULATE ALL THE POINTS IN SOR
var rx = 0.0, rz = 0.0;
function ArrayRevolution(){
	var newPoints = new Array();
	for (var angle = 0; angle < 360; angle+=10){
		var fakeMatrix = new Matrix4();
		fakeMatrix.setRotate(angle, rx, 1, rz);
		var vertexes = new Array();
		for (var i = 0; i < points.length; i+=2){
			var fakeVector = new Vector3([points[i],points[i+1],0]);
			fakeVector = fakeMatrix.multiplyVector3(fakeVector);
			vertexes.push(fakeVector.elements[0]);
			vertexes.push(fakeVector.elements[1]);
			vertexes.push(fakeVector.elements[2]);
		}
		newPoints.push(vertexes);
	}
	return newPoints;
}
//


function contextstop(e){
	if(e.button == 2){
		e.preventDefault();
		return false;
	}
}

function printArray(){
	console.log("End of polyline");
	console.log("points:");
	for (var i = 0; i < points.length-1; i+=2){
		console.log("(" + points[i] + ", "+points[i+1]+")");
	}
}

//BUFFERS RUBBERBAND LINES
function buff(gl){
	var vertexBuffer2 = gl.createBuffer();
	var vertices = new Float32Array([x,y,nx,ny]);
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer2);
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) {
		console.log('Failed to get the storage location of a_Position');
		return -1;
	}
	// Assign the buffer object to a_Position variable
	gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);

	// Enable the assignment to a_Position variable
	gl.enableVertexAttribArray(a_Position);
}

//GLOBALS
var vertices = new Array();
var indices = new Array();
var normals = new Array();
var normalColor = new Array();
var colors = new Array();
var revA, revI;


function initVertexBuffers(gl) {	
	if (flag) {
		var vertices = new Float32Array(points);
		var vertexBuffer = gl.createBuffer();
		if (!vertexBuffer) {
			console.log('Failed to create the buffer object');
			return -1;
		}	
		gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
		var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
		if (a_Position < 0) {
			console.log('Failed to get the storage location of a_Position');
			return -1;
		}
		gl.vertexAttribPointer(a_Position, 2, gl.FLOAT, false, 0, 0);
		gl.enableVertexAttribArray(a_Position);
	return n;
	} else {
		if (extracted) {
			revA = Float32Array.from(sorV);
			revI = Uint16Array.from(sorI);
		} else {
			revA = flatten(rArray);
			flatVertices = createFlatVersion(revA);
		}
		
		
		var flat = document.getElementById("flatshade");
		var grayscaleArray = new Array();
		for (var k = 0; k < flatVertices.length; k+=3) grayscaleArray.push(0.5,0.5,0.5);
		
		if (!flat.checked) {
			if (!picked) colors = colorAlgorithm2(); 
			else colors = grayscaleArray;
			
			normies = normalAlgorithm();
			normies = Float32Array.from(normies);
		}else {
			normies = normalAlgorithmFlat(flatVertices);
			normies = Float32Array.from(normies);
			if (!picked || true) {
				// normies = normalAlgorithmFlat(vertices);
				normies = Float32Array.from(normies);
				colors = colorAlgorithm(); //jumpflag3 fix fix fix
				
			}
			else colors = grayscaleArray;
		}
		
		colors = Float32Array.from(colors);
		
	}
}
var flatVertices = new Array();
var flatIndices = new Array();
function createFlatVersion(ray){
	var temp = new Array();
	var temp2 = new Array();
	var offset = 108;
	for (var i = 0; i < ray.length - offset; i+=3){	
			temp.push(ray[i],ray[i+1],ray[i+2]);
			temp.push(ray[i+offset],ray[i+offset+1],ray[i+offset+2]);
			temp.push(ray[i+3],ray[i+4],ray[i+5]);
			temp.push(ray[i+offset+3],ray[i+offset+4],ray[i+offset+5]);
	}

	
	var k = 0;
	for (; k < (temp.length/3); k+=4){	
		if (k != 0 && (k+4) % 144 == 0){
			temp2.push(k,k-140,k+1,k-140,k-139,k+1);
		} else {
			temp2.push(k,k+2,k+1,k+2,k+3,k+1);
		}
	}

	flatIndices = temp2;
	return temp;
}

function bindNormalColor(gl){
  var colorBuffer = gl.createBuffer();   // Create a buffer object
  if (!colorBuffer) {
    console.log('Failed to create the colorBuffer object');
    return false;
  }
  var temp = new Array();
  var temp2 = new Array();
  //(((revA.length/108)-1)*72) number of normals to display, 72 per row, per two clicks
  for (var i = 0; i < normies.length; i++) {
	temp.push(1,0,0);
  }

  normalColor = Float32Array.from(temp);
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, normalColor, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_color < 0) {
    console.log('Failed to get the storage location of a_color');
    return false;
  }
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_color);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  return true;
}

function bindColor(gl){
  var colorBuffer = gl.createBuffer();   // Create a buffer object
  if (!colorBuffer) {
    console.log('Failed to create the colorBuffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, colors, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_color < 0) {
    console.log('Failed to get the storage location of a_color');
    return false;
  }
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_color);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  return true;
}

var skip = false;
var masterMatrix = new Matrix4();
function bindSOR(gl){
	//jumpflag2flagjump2
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	var flat = document.getElementById("flatshade");
	if (translated) {
			skip = true;
			vertices = translateVerts(vertices, xdisplace, ydisplace);
			vertices = scaleVerts(vertices);
			vertices = rotateVerts(vertices);
			
			var grayscaleArray = new Array();
			for (var k = 0; k < vertices.length; k+=3) grayscaleArray.push(0.5,0.5,0.5);
			colors = grayscaleArray;
			
			translated = false;
	}
	else if (!skip) {
			if (flat.checked) {
				vertices = Float32Array.from(flatVertices);
				indices = Uint16Array.from(flatIndices);
			} else {
				indices = indexAlgorithm();
				vertices = Float32Array.from(revA);
				indices = Uint16Array.from(indices);
			}
	}

		
	var vertexBuffer = gl.createBuffer();
	var indexBuffer = gl.createBuffer();
	
	gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer); 
	gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW); 
	
	var FSIZE = vertices.BYTES_PER_ELEMENT;
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	if (a_Position < 0) return -1;
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, FSIZE * 3, 0);
	gl.enableVertexAttribArray(a_Position);
	
	gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
	gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
	
	return indices.length;
}

function bindNormal(gl){
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	var normalBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, normalBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, normies, gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	return (normies.length/216)*72;
}


function Line_Color(gl){
  var line_color = Float32Array.from([
  
	1,0,0.01, 	1,0,0.01,
	
  ]);
	
  var colorBuffer = gl.createBuffer();   // Create a buffer object
  if (!colorBuffer) {
    console.log('Failed to create the colorBuffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, line_color, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_color < 0) {
    console.log('Failed to get the storage location of a_color');
    return false;
  }
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_color);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  return true;
}

function Box_Color(gl){
  var box_color = Float32Array.from([
  
	1,1,0, 	1,1,0,
	1,1,0,	1,1,0,
	1,1,0,	1,1,0,
	
  ]);
	
  var colorBuffer = gl.createBuffer();   // Create a buffer object
  if (!colorBuffer) {
    console.log('Failed to create the colorBuffer object');
    return false;
  }
  // Write date into the buffer object
  gl.bindBuffer(gl.ARRAY_BUFFER, colorBuffer);
  gl.bufferData(gl.ARRAY_BUFFER, box_color, gl.STATIC_DRAW);
  // Assign the buffer object to the attribute variable
  var a_color = gl.getAttribLocation(gl.program, 'a_Color');
  if (a_color < 0) {
    console.log('Failed to get the storage location of a_color');
    return false;
  }
  gl.vertexAttribPointer(a_color, 3, gl.FLOAT, false, 0, 0);
  // Enable the assignment of the buffer object to the attribute variable
  gl.enableVertexAttribArray(a_color);
  gl.bindBuffer(gl.ARRAY_BUFFER, null);
  
  return true;
}

var boxVertices = new Array();
var lineVertices = new Array();
function BoxBind(gl){
	boxVertices = Float32Array.from([
		-0.1,	1.1,	0, 		//0
		 0.1,	1.5,	0,		//2
		-0.1,	1.5,	0,		//1
		
		-0.1,	1.1,	0, 		//0
		 0.1,	1.5,	0,		//2
		 0.1,	1.1,	0		//3

	]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	var boxBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, boxBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, boxVertices, gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	return 6;
}

function LineBind(gl){
	lineVertices = Float32Array.from([
	
		999, 999, 0,	///top right corner of webgl
		0, 0, 0		//center
		
	]);
	
	gl.bindBuffer(gl.ARRAY_BUFFER, null);
	var lineBuffer = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, lineBuffer);
	gl.bufferData(gl.ARRAY_BUFFER, lineVertices, gl.STATIC_DRAW);
	var a_Position = gl.getAttribLocation(gl.program, 'a_Position');
	gl.vertexAttribPointer(a_Position, 3, gl.FLOAT, false, 0, 0);
	gl.enableVertexAttribArray(a_Position);
	return 2;
}



var Ia = new Vector3([0,0,0.2]);
var eyeDirection = new Vector3([0,0,1]);
	eyeDirection.normalize();

function colorAlgorithm2(){
	var temp = new Array();
	var totalClicks = revA.length/108;
	
	var tag2 = document.getElementById('gloss').value;
	glossiness = tag2;

	var lightDir = document.getElementById("lightDir");
	
	var lightVector = new Vector3([500, 500, 500]);
	lightVector.normalize();
	var lightVector2 = new Vector3([0,500,0]);
	lightVector2.normalize();
		for (var j = 3; j < normies.length; j+=6){
			var nVector = new Vector3([normies[j],normies[j+1],normies[j+2]]);
			nVector.normalize();
			var reflect = calcR(nVector,lightVector); //two times dot times normal minus lightdirection
			var dot = (
					normies[j] * lightVector.elements[0] +
					normies[j+1] * lightVector.elements[1] +
					normies[j+2] * lightVector.elements[2]
					);
					dot = dot/256; //////color hack
					
			if (pointLight&&lightDir.checked){
				
				
				var L = new Vector3([
					lightVector2.elements[0] - normies[j],
					lightVector2.elements[0] - normies[j+1],
					lightVector2.elements[0] - normies[j+2]
				]);
				var dot2 = (
					normies[j] * lightVector2.elements[0] +
					normies[j+1] * lightVector2.elements[1] +
					normies[j+2] * lightVector2.elements[2]
					);
				var Is = calcIs(eyeDirection,reflect,glossiness);
				var specTag = document.getElementById("specToggle");
				if (specTag.checked){
						 //////color//DL////////AL//////////SL
					var r = (1*dot2) + (1 * dot) + Ia.elements[0] + Is.elements[0];
					var g = (0*dot2) + (0 * dot) + Ia.elements[1] + Is.elements[1];
					var b = (0*dot2) + (0 * dot) + Ia.elements[2] + Is.elements[2];
					
					temp.push(r,g,b);
				}else{
					var r = (1*dot2) + (1 * dot) + Ia.elements[0];
					var g = (0*dot2) + (0 * dot) + Ia.elements[1];
					var b = (0*dot2) + (0 * dot) + Ia.elements[2];
					
					temp.push(r,g,b);	
				}
			} else if (pointLight){
				
				var L = new Vector3([
					lightVector2.elements[0] - normies[j],
					lightVector2.elements[0] - normies[j+1],
					lightVector2.elements[0] - normies[j+2]
				]);
				var dot2 = (
					normies[j] * lightVector2.elements[0] +
					normies[j+1] * lightVector2.elements[1] +
					normies[j+2] * lightVector2.elements[2]
					);
				var Is = calcIs(eyeDirection,reflect,glossiness);
				var specTag = document.getElementById("specToggle");
				if (specTag.checked){
						 //////color//DL////////AL//////////SL
					var r = (1*dot2) + Ia.elements[0] + Is.elements[0];
					var g = (0*dot2) + Ia.elements[1] + Is.elements[1];
					var b = (0*dot2) + Ia.elements[2] + Is.elements[2];
					
					temp.push(r,g,b);
				}else{
					
					var r = (1*dot2) + Ia.elements[0];
					var g = (0*dot2) + Ia.elements[1];
					var b = (0*dot2) + Ia.elements[2];
					
					temp.push(r,g,b);	
				}
					
			} else if (lightDir.checked) {
				var Is = calcIs(eyeDirection,reflect,glossiness);
				var specTag = document.getElementById("specToggle");
				if (specTag.checked){
						 //////color//DL////////AL//////////SL
					var r = (1 * dot) + Ia.elements[0] + Is.elements[0];
					var g = (0 * dot) + Ia.elements[1] + Is.elements[1];
					var b = (0 * dot) + Ia.elements[2] + Is.elements[2];
					
					temp.push(r,g,b);
				}else{
					var r = (1 * dot) + Ia.elements[0];
					var g = (0 * dot) + Ia.elements[1];
					var b = (0 * dot) + Ia.elements[2];
					
					temp.push(r,g,b);
				}
			} else {
				for (var k = 0; k < 20; k++) temp.push(0.5,0.5,0.5);
				}
			}
	for (var k = 0; k < 400; k++) temp.push(0,0,0.2);
	return temp;
}


//normal vector and light direction
function calcR(nv, ld){
	var temp = new Array();
	
	var r0 = dotProduct(nv, ld);
	r0 = Math.max(0, r0);
	r0 = 2 * r0;
	
	nv.elements[0] = nv.elements[0] * r0;
	nv.elements[1] = nv.elements[1] * r0;
	nv.elements[2] = nv.elements[2] * r0;
	
	temp.push(nv.elements[0] - ld.elements[0]);
	temp.push(nv.elements[1] - ld.elements[1]);
	temp.push(nv.elements[2] - ld.elements[2]);

	var r = new Vector3(temp);
	return r;
}

function calcIs(eye, rv, co){
	var temp = new Array();
	
		var cosAlpha = Math.max(0, dotProduct(eye, rv));
		temp.push(0 * 1 * Math.pow(cosAlpha,co));
		temp.push(1 * 1 * Math.pow(cosAlpha,co));
		temp.push(0 * 1 * Math.pow(cosAlpha,co));
		
	return new Vector3(temp);
}

function dotProduct(vec1, vec2){
	var scalar = vec1.elements[0]*vec2.elements[0] +
				 vec1.elements[1]*vec2.elements[1] +
				 vec1.elements[2]*vec2.elements[2];
		 
		return scalar;
	}

//CALCULATION FOR COLOR, USES NORMALS
function colorAlgorithm(){
	var temp = new Array();
	
	var tag2 = document.getElementById('gloss').value;
	glossiness = tag2;
	
	var lightVector = new Vector3([500, 500, 500]);
	lightVector.normalize();
	var lightVector2 = new Vector3([0,500,0]);
	lightVector2.normalize();
		for (var j = 3; j < normies.length; j+=6){
			var nVector = new Vector3([normies[j],normies[j+1],normies[j+2]]);
			nVector.normalize();
			var reflect = calcR(nVector,lightVector); //two times dot times normal minus lightdirection
			var dot = (
				normies[j] * lightVector.elements[0] +
				normies[j+1] * lightVector.elements[1] +
				normies[j+2] * lightVector.elements[2]
				);
				dot = dot/256;  //////color hack

			if (pointLight&&lightDir.checked){				
				var L = new Vector3([
					lightVector2.elements[0] - normies[j],
					lightVector2.elements[0] - normies[j+1],
					lightVector2.elements[0] - normies[j+2]
				]);
				var dot2 = (
					normies[j] * lightVector2.elements[0] +
					normies[j+1] * lightVector2.elements[1] +
					normies[j+2] * lightVector2.elements[2]
					);
				
			var Is = calcIs(eyeDirection,reflect,glossiness);
			var specTag = document.getElementById("specToggle");
				if (specTag.checked){
					var r = (1*dot2) + (1*dot) + Ia.elements[0] + Is.elements[0];
					var g = (0*dot2) + (0*dot) + Ia.elements[1] + Is.elements[1];
					var b = (0*dot2) + (0*dot) + Ia.elements[2] + Is.elements[2];
					
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					
				}else{
					var r = (1*dot2) + (1*dot) + Ia.elements[0];
					var g = (0*dot2) + (0*dot) + Ia.elements[1];
					var b = (0*dot2) + (0*dot) + Ia.elements[2];
					
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);	
				}		
			} else if (pointLight&&!lightDir.checked){
				
				var L = new Vector3([
					lightVector2.elements[0] - normies[j],
					lightVector2.elements[0] - normies[j+1],
					lightVector2.elements[0] - normies[j+2]
				]);
				var dot2 = (
					normies[j] * lightVector2.elements[0] +
					normies[j+1] * lightVector2.elements[1] +
					normies[j+2] * lightVector2.elements[2]
					);
				
			var Is = calcIs(eyeDirection,reflect,glossiness);
			var specTag = document.getElementById("specToggle");
				if (specTag.checked){
					var r = (1*dot2) + Ia.elements[0] + Is.elements[0];
					var g = (0*dot2) + Ia.elements[1] + Is.elements[1];
					var b = (0*dot2) + Ia.elements[2] + Is.elements[2];
					
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					
				}else{
					var r = (1*dot2) + Ia.elements[0];
					var g = (0*dot2) + Ia.elements[1];
					var b = (0*dot2) + Ia.elements[2];
					
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);	
				}
			} else if (lightDir.checked){
				var Is = calcIs(eyeDirection,reflect,glossiness);
				var specTag = document.getElementById("specToggle");
				if (specTag.checked){
					var r = (1 * dot) + Ia.elements[0] + Is.elements[0];
					var g = (0 * dot) + Ia.elements[1] + Is.elements[1];
					var b = (0 * dot) + Ia.elements[2] + Is.elements[2];
					
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					
				}else{
					var r = (1 * dot) + Ia.elements[0];
					var g = (0 * dot) + Ia.elements[1];
					var b = (0 * dot) + Ia.elements[2];
					
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
					temp.push(r,g,b);
				}
			}
			else for (var k = 0; k < 20; k++) temp.push(0.5,0.5,0.5);
		}
	 return temp;
}

Number.prototype.clamp = function(min, max) {
  return Math.min(Math.max(this, min), max);
};

//calculate normals from rodger global linquist <-- MATSUDA/LEA BOOK
function calcNormal(p0, p1, p2) {
  // v0: a vector from p1 to p0, v1; a vector from p1 to p2
  var v0 = new Float32Array(3);
  var v1 = new Float32Array(3);
  for (var i = 0; i < 3; i++){
    v0[i] = p0[i] - p1[i];
    v1[i] = p2[i] - p1[i];
  }

  // The cross product of v0 and v1
  var c = new Float32Array(3);
  c[0] = v0[1] * v1[2] - v0[2] * v1[1];
  c[1] = v0[2] * v1[0] - v0[0] * v1[2];
  c[2] = v0[0] * v1[1] - v0[1] * v1[0];

  // Normalize the result
  var v = new Vector3(c);
  v.normalize();
  return v.elements;
}

//CALCULATION FOR NORMAL LINES
function normalAlgorithm(){
	var temp = new Array();
	var normColor = new Array();
	var offset = 108;
	var totalPoints = (revA.length);
	var i=0;
	//console.log(totalPoints); //108 xyz values per click. 36 points per click
	for (i = 0; i < totalPoints-108; i+=3) {
		///
		var v0 = [revA[i],revA[i+1],revA[i+2]];
		var v1 = [revA[i+3],revA[i+4],revA[i+5]];
		var v2 = [revA[i+offset],revA[i+offset+1],revA[i+offset+2]];

		var src = new Vector3(v0);
		temp.push(src);
		var norm = new Vector3(calcNormal(v0,v1,v2));
		var endp = new Vector3([
			src.elements[0]+norm.elements[0]*0.2,
			src.elements[1]+norm.elements[1]*0.2,
			src.elements[2]+norm.elements[2]*0.2
		]);
		temp.push(endp);
		normColor.push(1,0,0);
		normColor.push(1,0,0);
	}
	/////
	temp = flattenVector3(temp);
	return temp;
}

function normalAlgorithmFlat(ray){
	var normColor = new Array();
	var temp = new Array();
	var totalPoints = ray.length;
	var i=0;
	// console.log(totalPoints); // 432/3 = 144
	for (; i < totalPoints; i+=12) {
		//
		var v0 = [ray[i],ray[i+1],ray[i+2]];
		var v1 = [ray[i+3],ray[i+4],ray[i+5]];
		var v2 = [ray[i+6],ray[i+7],ray[i+8]];

		var src = new Vector3(v0);
		
		temp.push(src);
		
		if ( v1[1] > v0[1]){
			var norm = new Vector3(calcNormal(v0,v1,v2));
		} else {
			var norm = new Vector3(calcNormal(v0,v2,v1));
		}
		
		var endp = new Vector3([
			src.elements[0]+norm.elements[0]*0.2,
			src.elements[1]+norm.elements[1]*0.2,
			src.elements[2]+norm.elements[2]*0.2
		]);
		temp.push(endp);
		normColor.push(1,0,0);
		normColor.push(1,0,0);
	}
	temp = flattenVector3(temp);
	return temp;
}

//INDEX ORDER FOR DRAWING TRIANGLE
function indexAlgorithm(){
	var temp = [];
	var offset = 36;
	var totalPoints = (revA.length/3);
	var i = 0;
	for (i = 0; i < totalPoints-offset; i++){
		if (i != 0 && (i+1) % 36 == 0) {
			temp.push(i);
			temp.push(i-35);
			temp.push(i+offset);
			
			temp.push(i-35);
			temp.push(i+offset);
			temp.push(i-35+offset);
		} else {
			temp.push(i);
			temp.push(i+1);
			temp.push(i+offset);
			
			temp.push(i+1);
			temp.push(i+1+offset);
			temp.push(i+offset);
		}
	}
	temp.push(i-offset);
	return temp;
}

//2D ARRAY OF VECTORS -> 1D ARRAY OF FLOATS
function flattenVector3(ray){
	var temp = [];
	for (var j = 0; j < ray.length; j++){
		for (var i = 0; i < 3; i++){
			temp.push(ray[j].elements[i]);
		}
	}
	return temp;
}

//2D ARRAY OF FLOATS -> 1D ARRAY OF FLOATS
function flatten(ray){
	var temp = [];
	for (var j = 0; j < ray[0].length; j+=3){
		for (var i = 0; i < ray.length; i++){
			temp.push(ray[i][j]);
			temp.push(ray[i][j+1]);
			temp.push(ray[i][j+2]);
		}
	}
	return temp;
}

var normies;
var superLoop = setInterval(main, 10);