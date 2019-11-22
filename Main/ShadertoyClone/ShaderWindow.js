

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

var mouse = { down:false, x:0, y:0};



function clear () {
	ctx.clearRect(0,0,canvas.width,canvas.height);
}

function Draw(){
    ctx.fillStyle = "rgb(255, 0, 0)";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}



function main () {
    clear();
    Draw();
}
setInterval(main,17);

// User Input
function getMousePos(e) {
    var rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
}
canvas.onmousedown = function (e) {
    mouse.down = true;
    getMousePos(e);
}
canvas.onmouseup = canvas.onmouseout = function (e) {
    mouse.down = false;
}
canvas.onmousemove = function (e) {
    getMousePos(e);
}