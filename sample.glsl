///C/
precision mediump float;

#define P gl_FragCoord.xy
#define A vec2 (1.,.5)
#define O(x) mod(x, 2.) == 1.
#define E(x) mod(x, 2.) == 0.
#define Q(x) N21(gl_FragCoord.xy*x)
#define N(x) max(0.,min(1.,x))
#define SS(l,r,x) smoothstep(l,r,x)

uniform float S;
uniform float T;
uniform float F;
uniform vec2 R;
uniform vec2 G;
uniform vec2 M;
uniform vec3 C;

highp float N21(vec2 i) {
	float r = dot(i.xy, vec2(12.9898, 78.233));
	return fract(sin(mod(r, 3.14)) * 43758.5453);
}

///F/grid
uniform sampler2D self;
uniform sampler2D icon;

uniform float Wc;
uniform float Wt;

vec2 fit(vec2 p) {
	float x = G.x, y = G.y / 2., a = min(x, y) / max(x, y), l = (1. - a) / 2.;

	if(x > y)
		p.x = N((p.x - l) / a);
	else
		p.y = N((p.y - l) / a);
	return p;
}

bool inside(vec2 p) {
	return texture2D(icon, fit(p)).r > .2;
}

float ripple() {
	float t = (T - C.z) / .4;
	if(t > 1.)
		return 1.;
	float m = length((P - C.xy * G) * A) / min(G.x, G.y);
	return (abs(t - m) < .05 && N21(P * T) > .8) ? 1. - m : 1.;
}

const float cT = 1., cE = 4., cSr = 64., cGr = 256.;
float curtain(vec2 p, float a) {
	float t = (T - Wt) / cT;
	if(t > 2.)
		return a;

	t = min(1., t);
	t = pow(2., -10. * t);
	if(O(Wc))
		t = 1. - t;

	float cid = ceil(Wc / 2.), pid = Q(cid), cO = (R.x - cSr * 2.) / R.x, o = cO * t, g = cGr / R.x, y = O(cid) ? 1. - p.y : p.y, s = (y * 2. - 1.) * ((1. - cO) / 3.) * t, l = (1. - o) / 2. + s, r = l + o, d = SS(l + g, l, p.x) + SS(r - g, r, p.x);

	if(pid >= d)
		a -= .2;
	else {
		if(d < 1. && O(Wc))
			a = max(a - .5, d);
		else
			a += .05;
	}

	return a;
}

vec4 tick() {
	vec2 p = P / G;

	vec4 t = texture2D(self, p), l = texture2D(icon, fit(p));

	float bstep = t.g * 2. - 1., mouse = length((P - M * G) * A), around = max(0., 1. - mouse / 10.);

	// grid tile darken/lighten
	t.b += bstep / 200.;
	t.b += sign(bstep) * around / 100.;
	t.b += sign(bstep) * (l.r / 400.);

	// initial fade in
	if(T < 4.) {
		if(t.g < T / 3.)
			t.a += .02;
	} else
		t.a = curtain(p, t.a);

	// icon fade in/out
	bool hover = inside(M);
	float base = .3;
	if(T > 2.5 && l.r > .2) {
		if(t.r < base || hover)
			t.r += .004;
		if(t.r > base && !hover)
			t.r -= 0.01;
	}

	// grid tile step flip
	if(t.b < 0. || t.b > 1.)
		t.g = .5 + ((t.g - .5) * -1.);

	if(P.x < 1. && P.y < 1.)
		t.r = hover ? 1. : 0.;

	// hide logo when open
	if(O(Wc))
		t.r -= .05;
	return t;
}

vec4 seed() {
	bool fadeIn = T < 2.;
	return vec4(0., Q(F), Q(T), fadeIn ? 0. : 1.);
}

void main() {
	gl_FragColor = F == 1. ? seed() : tick();
}

///F/main
uniform sampler2D ping;
uniform sampler2D pong;

vec4 texel(vec2 p) {
	if(fract(p.x / (S * 2.)) > .5)
		p.y += S / 2.;
	vec2 t = p / S, g = fract(t);
	t.y *= 2.;
	g.x /= 2.;
	if(g.y <= .5 && g.y > g.x || g.y > 1. - g.x)
		t.y += 1.;
	t /= G;

	return O(F) ? texture2D(ping, t) : texture2D(pong, t);
}

float darken(float c, float t) {
	if(c > t)
		c += c - t;
	else
		c -= t - c;
	return c;
}

bool inside() {
	float key = texture2D(ping, vec2(0., 0.)).r;
	return key > .5;
}

float icon(float c, float l) {
	if(P.x < S * 2.)
		return c;
	c -= l * .7;
	return c;
}

void main() {
	bool hover = inside();
	vec4 t = texel(P);
	float i = icon(t.b, t.r), c = darken(i, .8), d = sin((P.x - P.y) * 30.) / 2., n = N21(P), a = 1. - t.a, g = n / 3. +
		c * t.a / 3. +
		d * i / 3. +
		d * a;

	gl_FragColor = vec4(vec3(g), max(.1, t.a));

	if(P.x < 1. && P.y < 1.)
		gl_FragColor.rgb = vec3(hover ? .1 : .0);
}