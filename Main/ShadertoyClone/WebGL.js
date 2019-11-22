


var VS =
"attribute vec2 av;" +
"uniform sampler2D ut;" +
"attribute vec2 a_texCoord;" +
"varying vec2 v_texCoord;" +
"void main ()" + 
"{" +
    "gl_Position = vec4(av*2.-1.,0,1);" +
    "v_texCoord = a_texCoord;" +
"}"


var FS1 = 
    "precision mediump float;" +
    "uniform vec2 resolution;" +
    "uniform sampler2D ut;" +
    "uniform sampler2D u_image;" +
    "varying vec2 v_texCoord;" +
    "varying vec4 Channel0;" +
    "uniform float time;" +
    "uniform vec2 mouse;" +
    "void main ()" + 
    "{" +
        "gl_FragColor = texture2D (ut, gl_FragCoord.xy/resolution);" +
    "}"

var CHAN0 = 
    "precision mediump float;" +
    "uniform vec2 resolution;" +
    "uniform sampler2D u_image;" +
    "varying vec2 v_texCoord;" +
    "varying vec4 Channel0;" +
    "void main ()" + 
    "{" +
        "Channel0 = texture2D(u_image, v_texCoord);" +
        "gl_FragColor = texture2D(u_image, v_texCoord);" +
    "}"


//"gl_FragColor = texture2D (ut, gl_FragCoord.xy/resolution) ;" +

function Framebuffer (gl, n, type, w, h=w) 
{
	this.gl = gl;
	this.type = type;
	this.n = n;
	this.w = w;
	this.h = h;
	this.width = w;
	this.height = h;
	this.fbo = gl.createFramebuffer();
	this.renderbuffer = gl.createRenderbuffer();
	this.texture = gl.createTexture();
	gl.activeTexture(gl['TEXTURE' + this.n]);
	gl.bindFramebuffer(gl.FRAMEBUFFER, this.fbo);
	gl.bindTexture(gl.TEXTURE_2D, this.texture);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, this.type, null);
	gl.bindRenderbuffer(gl.RENDERBUFFER, this.renderbuffer);
	gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, w, h);
	gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this.texture, 0);
	gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this.renderbuffer);
	this.write = function (typedArray) {
		var gl = this.gl;
		gl.activeTexture(gl["TEXTURE" + this.n]);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, this.type, typedArray);}
	this.source = function (element) {
		var gl = this.gl;
		gl.activeTexture(gl["TEXTURE" + this.n]);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, element);
		gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);}
    this.route = function () {
        gl.activeTexture(gl["TEXTURE"+this.n]);
        gl.bindTexture(gl.TEXTURE_2D, this.texture);
        gl.bindFramebuffer(gl.FRAMEBUFFER,  this.fbo);
        gl.viewport(0,0,this.w,this.h);}}
        
        
function createProgram (gl, vstr, fstr) 
{
    if (vstr.length < 50) vstr = document.getElementById(vstr).textContent;
    if (fstr.length < 50) fstr = document.getElementById(fstr).textContent;
	var program = gl.createProgram(),
		vshader = createShader(gl, vstr, gl.VERTEX_SHADER),
		fshader = createShader(gl, fstr, gl.FRAGMENT_SHADER);
	gl.attachShader(program, vshader);
	gl.attachShader(program, fshader);
	gl.linkProgram(program);
	if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
		throw gl.getProgramInfoLog(program);
	}
	return program;
}

function createShader (gl, str, type) 
{
	var shader = gl.createShader(type);
	gl.shaderSource(shader, str);
    gl.compileShader(shader);
    
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) 
	{
		alert(gl.getShaderInfoLog(shader)+str);
		throw gl.getShaderInfoLog(shader);
	}
	return shader;
}
	
	
function initAttrib (gl, program) 
{
    gl.useProgram(program);
    var attrib = gl.getAttribLocation(program, 'av');
    var texcoordLocation = gl.getAttribLocation(program, "a_texCoord");

    // position
    gl.enableVertexAttribArray(attrib);
    gl.vertexAttribPointer(attrib, 2, gl.FLOAT, gl.FALSE, 0, 0);

    // texture
    gl.enableVertexAttribArray(texcoordLocation);
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, gl.FALSE, 0, 0);

    return initAttrib;
}
	
	
function setUni (gl, program, name, args, int = false) 
{
    gl.useProgram(program);
    if (!program[name]) program[name] = gl.getUniformLocation (program, name);
    
    if (int || typeof(args) == "boolean") 
    {
        gl.uniform1i(program[name], args);
    }
    else if (args.constructor == Array) 
    {
        console.log(args);
        gl["uniform" + args.length + "fv"](program[name], args);
    }
    else if (typeof(args) == "number") 
    {
        gl.uniform1f(program[name], args);
    }
	else if (args.constructor == Framebuffer)
	{
	    gl.uniform1i(program[name], args.n);
	}
	else
	{
        //gl.uniform1i(program[name], 7);
	    console.log("its nothing");
	    
	}
    return setUni;
	
}
	
	
function draw (gl, program, dest=false, type=gl.TRIANGLES, a=0, b=6, clear = true) 
{
        gl.useProgram (program);
        if (dest) dest.route(); else 
		{
            gl.bindFramebuffer(gl.FRAMEBUFFER, null);
            gl.viewport(0, 0, canvas.width, canvas.height);
        }
        if (clear) gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawArrays(type,a,b);

}

function initVerts (gl, w=0, h=w) 
{
    var arr = new Float32Array(w*h*2+12),sqr = [0,0,1,0,0,1, 1,1,1,0,0,1], i = 0;
	for (j = 0; j < 12; j++) arr[i++] = sqr[j];
	for (var y = 0; y < h; y ++) 
	{
		for (var x = 0; x < w; x ++) 
		{
			arr[i++] = x/w;
			arr[i++] = y/h;
		}
	}
    var buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, arr, gl.STATIC_DRAW);
	return arr;
} 

  

var recmpl = false;
var gfb1 = true;
var gfb2 = false;


function fb1()
{
    gfb1 = true;
    gfb2 = false;
}
function fb2()
{
    gfb1 = false;
    gfb2 = true;
}

function Recompile(){
    recmpl = true;
}





window.onload = function () 
{
        var image = new Image();
        image.src = "tex0.jpg";
        

        var shdrsrc0 = document.getElementById("fsSource0").value;
        var shdrsrc1 = document.getElementById("fsSource1").value;

        var canvas = document.getElementById("canvas"),
		gl = canvas.getContext("webgl"),
        verts = initVerts (gl),
        
		program = createProgram (gl, VS, shdrsrc0),
        program1 = createProgram (gl, VS, FS1),
        program2 = createProgram (gl, VS, shdrsrc1),
        //program3 = createProgram (gl, VS, CHAN0),
        
		ext = gl.getExtension('OES_texture_float'),
		lin = gl.getExtension('OES_texture_float_linear'),
        fbo = new Framebuffer (gl, 0, gl.FLOAT, canvas.width, canvas.height),
        fbo2 = new Framebuffer (gl, 0, gl.FLOAT, canvas.width, canvas.height);
        
        var texture = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, texture);
  
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
  
        image.onload = function(){
            //gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        }

        

	initAttrib (gl, program);
    
    

	setUni (gl, program, "resolution", [canvas.width, canvas.height]);
	setUni (gl, program1, "resolution", [canvas.width, canvas.height]);
    setUni (gl, program2, "resolution", [canvas.width, canvas.height]);
    
	var t = 0;
    
    
   
	function animate () 
	{
        requestAnimationFrame (animate);
        
        setUni (gl, program, "time", t+=0.015);
        if(gfb1)
            draw (gl, program, fbo);
        
		//setUni (gl, program1, "ut", fbo);
        draw (gl, program1);
        
        setUni (gl, program2, "time", t+=0.015);
        if(gfb2)
            draw (gl, program2, fbo2);

        if(recmpl)
        {
            var newscrc0 = document.getElementById("fsSource0").value;
            var newscrc1 = document.getElementById("fsSource1").value;

            program = createProgram (gl, VS, newscrc0);
            setUni (gl, program, "resolution", [canvas.width, canvas.height]);

            program2 = createProgram (gl, VS, newscrc1);
            setUni (gl, program2, "resolution", [canvas.width, canvas.height]);

            recmpl = false;
        }
		
	}
	animate ();
	
}
