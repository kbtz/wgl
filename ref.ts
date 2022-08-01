
/*
	launched = Date.now() / 1000
	keyPixel = new Uint8Array(4)
	resized = false

	textures: Texture[] = []
	programs: 𝝷<Program> = {}
	canvas

	get uniforms() {
		return this.uniform
	}

	set uniforms(value: 𝝷) {
		this.uniform = value
	}

	constructor(canvas: HTMLCanvasElement, options: WebGLContextAttributes) {
		const context = canvas.getContext('webgl2', {
			premultipliedAlpha: false,
			preserveDrawingBuffer: true,
			...options
		})

		super(context)
		this.canvas = canvas

		const uniform = Proxy.writer((k, v, o) => {
			this.programs[𝝼].each(p => p.uniforms[k] = v)
			o[k] = v
			return true
		})

		this[𝞀].uniform = () => uniform
		this[𝞃].uniform = (values) => values[𝞈] = uniform
	}

	compile(input: 𝞁): 𝝷<Program> {
		const source = this.parse(input)
			, programs = {}

		for (let { name, fragment, vertex } of source[𝝼]) {
			let program = programs[name] = this.program(name)
			attachShader(program, this.shader(VERTEX_SHADER, vertex))
			attachShader(program, this.shader(FRAGMENT_SHADER, fragment))

			if (false) {
				console.groupCollapsed(program.name)
				console.info('vert', vertex)
				console.info('frag', fragment)
				console.groupEnd()
			}
		}

		return programs[𝞈] = this.programs
	}

	program(name: 𝞁): Program {
		const
			program = createProgram(),
			uniforms = Proxy.writer((k, v, o) => {
				this.flush(program, k, v)
				o[k] = v
				return true
			}),
			locations = Proxy.reader((name, cache) =>
				cache[name] ||= getUniformLocation(program, name))

		program[𝞀].uniforms = () => uniforms
		program[𝞃].uniforms = values => values[𝞈] = uniforms

		program.locations = locations
		program.name = name

		return program
	}

	shader(type, source) {
		let shader = createShader(type)
		shaderSource(shader, source)
		compileShader(shader)

		if (!getShaderParameter(shader, COMPILE_STATUS)) {
			const
				err = getShaderInfoLog(shader) as 𝞁,
				line = +(err.match(/0:(\d+)/)?.at([1]))

			if (line) console.debug(
				source.split('\n').slice(line - 4, line + 4).join('\n'))

			throw err
		}

		return shader
	}

	quad() {
		const
			B = createBuffer(),
			D = new Uint8Array([0, 0, 0, 1, 1, 0, 1, 1])

		bindBuffer(ARRAY_BUFFER, B)
		bufferData(ARRAY_BUFFER, D, STATIC_DRAW)
		enableVertexAttribArray(0)
		vertexAttribPointer(0, 2, UNSIGNED_BYTE, false, 0, 0)
		bindBuffer(ARRAY_BUFFER, null)
	}

	framebuffer(): Framebuffer {
		const fbo = createFramebuffer()
		fbo.texture = tex => {
			bindFramebuffer(FRAMEBUFFER, fbo)
			framebufferTexture2D(
				FRAMEBUFFER, COLOR_ATTACHMENT0, TEXTURE_2D,
				tex, 0)
		}

		return fbo
	}

	texture(): Texture {
		const tex = createTexture()
		bindTexture(TEXTURE_2D, tex)
		texImage2D(TEXTURE_2D, 0, RGBA, 1, 1, 0, RGBA, UNSIGNED_BYTE, null)
		texParameteri(TEXTURE_2D, TEXTURE_MIN_FILTER, NEAREST)
		texParameteri(TEXTURE_2D, TEXTURE_MAG_FILTER, NEAREST)
		texParameteri(TEXTURE_2D, TEXTURE_WRAP_S, CLAMP_TO_EDGE)
		texParameteri(TEXTURE_2D, TEXTURE_WRAP_T, CLAMP_TO_EDGE)

		tex.bind = index => {
			tex.index = index
			activeTexture(TEXTURE0 + index)
			bindTexture(TEXTURE_2D, tex)
		}

		tex.update = (size, data = null) => {
			tex[𝞏] = { size, data }
			tex.bind(tex.index)
			texImage2D(TEXTURE_2D, 0, RGBA, ...size, 0, RGBA, UNSIGNED_BYTE, data)
		}

		return tex
	}

	link() {
		this.programs[𝝼].each(linkProgram.bind(ctx))
		this.textures.each((t, i) => t.bind(i))
		this.uniforms = { T: 0, F: 0, M: [-.5, -.5], C: [0, 0, -10] }
	}

	tick() {
		this.uniforms.T = Date.now() / 1000 - this.launched
		return ++this.uniforms.F
	}

	read() {
		readPixels(0, 0, 1, 1, RGBA, UNSIGNED_BYTE, this.keyPixel)
		return this.keyPixel
	}

	draw(...programs) {
		for (const program of programs) {
			useProgram(program)
			bindFramebuffer(FRAMEBUFFER, program.fbo ?? null)

			if (this.resized)
				viewport(0, 0, ...program.size)

			drawArrays(TRIANGLE_STRIP, 0, 4)
		}

		this.resized = false
	}

	parse(input) {
		const sections = input
			.split('///')
			.filter(s => s)

		let common = '', programs = {}
		for (let source of sections) {
			const [type, name] =
				source.match(/^\/\/ ([a-z ]+)\b/)[1].split(' ')

			if (type == 'common') {
				common = source
				continue
			}

			source = common + source

			if (!name) programs[𝝼].each(p => p[type] = source)
			else {
				programs[name] ||= { name }
				programs[name][type] = source
			}
		}

		return programs
	}
}

export interface Program {
	name: 𝞁
	uniforms: 𝝷
	locations: 𝝷
	size: Point
	fbo?: Framebuffer
}

export interface Texture {
	index: 𝝶
	bind: (index: 𝝶) => void
	update: (size: Point, data?: 𝞌) => void
}

export interface Framebuffer {
	texture: (tex: Texture) => void
}
*/