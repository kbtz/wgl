export default {
	header: `precision mediump float;
`,
	vertex: `attribute vec3 pos;
	
void main() {
	gl_Position = vec4(pos * 2. - 1., 1);
}
`
}