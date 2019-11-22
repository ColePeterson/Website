
precision mediump float;	
uniform vec2 resolution;
uniform sampler2D ut;
uniform float time;
uniform vec2 mouse;
	
void main () 
{
	gl_FragColor = texture2D (ut, gl_FragCoord.xy/resolution) ;
}
 
