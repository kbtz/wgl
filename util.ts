import 'hax/type'
import 'hax/maps'
import 'hax/merge'
import 'hax/proxies'

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

export function parse(source: Ϟ) {
	const
		types = { V: 'vertex', F: 'fragment' },
		programs: ꝛ<{ vertex?: Ϟ, fragment?: Ϟ }> = {},
		sections = ('\n' + source)
			.split(/\n(?=\/{3}[CVF]\/[a-z]+)/)
			.slice(1)

	let common = ''

	for (let section of sections) {
		const [type, name] = section
			.match(/^\/{3}([CVF]\/.+)/)![1]
			.split('/')

		if (type == 'C') {
			common = section
			continue
		}

		section = common + section

		programs[name] ||= {}
		programs[name][types[type]] = section
	}

	return programs
}