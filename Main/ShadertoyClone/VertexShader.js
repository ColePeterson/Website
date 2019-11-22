
attribute vec2 av;
	
void main () 
{
	gl_Position = vec4(av*2.-1.,0,1);
}

