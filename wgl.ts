import { With, Uniform, parse, defaults } from './util'

export class WGL extends With<WebGL2RenderingContext> {
	context: WebGL2RenderingContext

	constructor(target: HTMLCanvasElement, options: WebGLContextAttributes = {}) {
		const context = target.getContext('webgl2', {
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
			...options
		})!

		super(context)
		this.context = context
	}

	programs = (source: Ϟ): ꝛ<Program> => {
		const
			programs = parse(source),
			{ header, vertexes: { normalized } } = defaults

		return map(programs, ({ fragment, vertex = normalized }) =>
			new Program(this.context, header + fragment, header + vertex))
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
}

export class Program extends With<WebGL2RenderingContext> {
	size: ԗ = [50, 50]

	program: WebGLProgram
	locations: ꝛ<WebGLUniformLocation> = {}

	_buffer: WebGLFramebuffer
	set buffer(fbo: WebGLFramebuffer) {
		useProgram(this.program)

		this._buffer = fbo
		bindFramebuffer(FRAMEBUFFER, fbo)
	}

	readonly uniforms = Proxy.writer.call(this,
		(name, uniform) => this.flush(name as Ϟ, uniform))

	constructor(context: WebGL2RenderingContext, fragment: Ϟ, vertex?: Ϟ) {
		super(context)
		this.init(fragment, vertex)
	}

	init(fragment: Ϟ, vertex?: Ϟ) {
		this.program = createProgram()

		const
			fs = this.compile(FRAGMENT_SHADER, fragment),
			vs = this.compile(VERTEX_SHADER, vertex)

		if (vs && fs)
			linkProgram(this.program)
	}

	compile(type: GLenum, source: Ϟ) {
		let shader = createShader(type)
		shaderSource(shader, source)
		compileShader(shader)

		if (getShaderParameter(shader, COMPILE_STATUS)) {
			attachShader(this.program, shader)
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

		throw error
	}

	flush(name: Ϟ, value: Uniform) {
		const location = this.locate(name)
		if (!location) return false

		useProgram(this.program)
		switch (typeof value) {
			case 'boolean':
			case 'number':
				uniform1f(location, +value)
				break
			case 'string':
				uniform1i(location, +value)
				break
			case 'object':
				if (Array.isArray(value)) {
					value.length == 2
						&& uniform2fv(location, value)
					value.length == 3
						&& uniform3fv(location, value)
					value.length == 4
						&& uniform4fv(location, value)
					break
				}
			default:
				console.error('can\'t use uniform value', value)
				return false
		}

		return true
	}

	locate(name: Ϟ) {
		this.locations[name] ||=
			getUniformLocation(this.program, name)

		if (!this.locations[name]) {
			console.error('uniform name not found', name)
			return false
		}

		return this.locations[name]
	}

	draw() {
		useProgram(this.program)
		bindFramebuffer(FRAMEBUFFER, this.buffer)

		viewport(0, 0, canvas.width, canvas.height)

		drawArrays(TRIANGLE_STRIP, 0, 4)
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