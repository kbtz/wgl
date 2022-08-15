import 'hax/maps'
import 'hax/merge'
import 'hax/proxies'
import 'hax/type'

export { With } from 'hax/with'
export type Uniform = Ϟ | ꙕ | ꭖ | [ꭖ, ꭖ] | [ꭖ, ꭖ, ꭖ] | [ꭖ, ꭖ, ꭖ, ꭖ]
export const defaults = {
	header: `
precision mediump float;
`,
	vertexes: {
		normalized: `
attribute vec3 pos;

void main() {
gl_Position = vec4(pos * 2. - 1., 1);
}
`,
	}
}
