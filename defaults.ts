const
	header = `
precision mediump float;
`,
	vertexes = {
		normalized: `
attribute vec3 pos;

void main() {
	gl_Position = vec4(pos * 2. - 1., 1);
}
`,
	}
export { header, vertexes }