// HelloTriangle_LINE_STRIP.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE =
  'attribute vec4 a_Position;\n' +
  'void main() {\n' +
  '  gl_Position = a_Position;\n' +
  '}\n';

// Fragment shader program
var FSHADER_SOURCE =
  'void main() {\n' +
  '  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);\n' +
  '}\n';

var x, y, nx, ny, n=0;
var flag = true;
var points = new Array();
  
function main() {
  // Retrieve <canvas> element
  var canvas = document.getElementById('webgl');
  
  // Get the rendering context for WebGL
  var gl = getWebGLContext(canvas);
  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  canvas.addEventListener('mousedown', mDown);
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

  // Specify the color for clearing <canvas>
  gl.clearColor(255, 255, 255, 1);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);
  
  // Draw the rectangle
  if (n > 0) {
	  gl.drawArrays(gl.LINE_STRIP, 0, n);
  }
  
  if (n>0 && flag) {
	buff(gl);
	gl.drawArrays(gl.LINE_STRIP,0,2);
  }
}

function mMove(e){
	nx = e.layerX;
	ny = e.layerY;
	nx = (nx/800)*2-1;
	ny = -(ny/600)*2+1;
}

function mDown(e){
	x = e.layerX;
	y = e.layerY;
	//translate to webgl
	x = (x/800)*2-1;  //position / canvas.window * 2 - 1 formula for x
	y = -(y/600)*2+1; //-position / canvas.window * 2 + 1 formula for y
	if (e.button == 2 && flag) {
		console.log("("+x+","+y+")");
		printArray();
		var temp = ArrayRevolution();
		flag = false;
	}
	if (flag) {
		console.log("("+x+","+y+")");
		points.push(x);
		points.push(y);
		n++;
	}
}

function ArrayRevolution(){
	var temp = new Array();
	//start here!
	return temp;
}

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

function initVertexBuffers(gl) {
  // Create a buffer object
  var vertices = new Float32Array(points); 
  
  var vertexBuffer = gl.createBuffer();
  if (!vertexBuffer) {
    console.log('Failed to create the buffer object');
    return -1;
  }

  // Bind the buffer object to target
  gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
  // Write data into the buffer object
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

  return n;
}


setInterval(main, 10);