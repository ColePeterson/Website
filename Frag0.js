
precision mediump float;	
uniform vec2 resolution;
uniform sampler2D ut;
uniform float time;
uniform vec2 mouse;
	
void main () 
{
	vec3 andsheyeet23 = vec3(0);
	gl_FragColor = texture2D (ut, gl_FragCoord.xy/resolution) ;
}
 
