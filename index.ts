import { With } from '@kbtz/hax/with'
import '@kbtz/hax/record'

import defaults from './defaults'

type Context = WebGL2RenderingContext
type Location = WebGLUniformLocation
type Uniform = Ϟ | ꙕ | ꭖ | [ꭖ, ꭖ] | [ꭖ, ꭖ, ꭖ] | [ꭖ, ꭖ, ꭖ, ꭖ]

const loc: unique symbol = Symbol('locations')

export class WGL extends With<Context> {
	context: Context

	constructor(target: HTMLCanvasElement, options: WebGLContextAttributes = {}) {
		const context = target.getContext('webgl2', {
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
			...options
		})

		super(context)
		this.context = context
	}

	quad() {
		const
			buffer = createBuffer(),
			data = new Uint8Array([0, 0, 0, 1, 1, 0, 1, 1])

		bindBuffer(ARRAY_BUFFER, buffer)
		bufferData(ARRAY_BUFFER, data, STATIC_DRAW)
		enableVertexAttribArray(0)
		vertexAttribPointer(0, 2, UNSIGNED_BYTE, false, 0, 0)
		bindBuffer(ARRAY_BUFFER, null)
	}

	parse(source: Ϟ): ꝛ<Ϟ, Program> {
		const
			types = { V: 'vertex', F: 'fragment' },
			programs: ꝛ<Ϟ, { vertex?: Ϟ, fragment?: Ϟ }> = {},
			sections = ('\n' + source)
				.split('\n(?=\/\/[CVF]/[a-z]+)')
				.filter(s => s)

		let common = ''

		for (let section of sections) {
			const [type, name] =
				section.match(/^\/\/(.+)/)[1].split('/')

			if (type == 'C') {
				common = section
				continue
			}

			section = common + section

			programs[name] ||= {}
			programs[name][types[type]] = section
		}

		return programs.map(({ vertex, fragment }) =>
			new Program(this.context, fragment, vertex))
	}
}

export class Program extends With<Context> {
	static current: Program

	size: ԗ
	fbo?: Framebuffer
	instance: WebGLProgram

	readonly uniforms = new Proxy(
		{ [loc]: {} } as ꝛ<Ϟ, Uniform> & { [loc]: ꝛ<Ϟ, Location> },
		{
			set(U, name: Ϟ, value: Uniform) {
				U[loc][name] ||=
					getUniformLocation(this.instance, name)

				if (!U[loc][name]) {
					console.error('uniform name not found', name)
					return false
				}

				return this.flush(U[loc][name], value)
			}
		})

	constructor(context: Context, fragment: Ϟ, vertex?: Ϟ) {
		super(context)
		this.instance = createProgram()

		vertex ||= defaults.header + defaults.vertex
		fragment = defaults.header + fragment

		const
			fs = this.compile(FRAGMENT_SHADER, fragment),
			vs = this.compile(VERTEX_SHADER, vertex)

		if (vs && fs)
			linkProgram(this.instance)
	}

	compile(type: GLenum, source: Ϟ) {
		let shader = createShader(type)
		shaderSource(shader, source)
		compileShader(shader)

		if (getShaderParameter(shader, COMPILE_STATUS)) {
			attachShader(this.instance, shader)
			return shader
		}

		const
			error = getShaderInfoLog(shader),
			line = +(error.match(/0:(\d+)/)?.at(1))

		if (line) {
			const lines = source
				.split('\n')
				.slice(line - 4, line + 4)
				.join('\n')

			console.debug(lines)
		}

		console.error(error)
	}

	use() {
		if (Program.current != this) {
			Program.current = this
			useProgram(this.instance)
		}
	}

	flush(location: Location, uniform: Uniform) {
		this.use()

		switch (typeof uniform) {
			case 'boolean':
			case 'number':
				uniform1f(location, +uniform)
				break
			case 'string':
				uniform1i(location, +uniform)
				break
			case 'object':
				if (Array.isArray(uniform)) {
					uniform.length == 2
						&& uniform2fv(location, uniform)
					uniform.length == 3
						&& uniform3fv(location, uniform)
					uniform.length == 4
						&& uniform4fv(location, uniform)
					break
				}
			default:
				console.error('can\'t use uniform value', uniform)
				return false
		}

		return true
	}
}

export class Texture {
	index: ꭖ
	size: ԗ
	bind: (index: ꭖ) => void
	update: (size: ԗ, data?: Ɐ) => void
}

export class Framebuffer {
	texture: (tex: Texture) => void
}