#!/bin/gawk -f
@load "filefuncs"

BEGIN {
	wg = "WebGL"; rc = "RenderingContext"
	nl = "\n"; ts = "\t"
	"npm root -g" | getline modules
	"dirname $(realpath $_)" | getline cwd

	stat(modules "/typescript", tsdir)
	if(tsdir["type"] != "directory") {
		print "Typescript must be installed globally"
		exit -1
	}

	input = modules "/typescript/lib/lib.dom.d.ts"
	output = cwd "/gl-globals.d.ts"

	ARGV[ARGC++] = input
}

$0 ~ "^declare var " wg 2 rc ": {" ||
$0 ~ "^interface " wg rc "Base {" ||
$0 ~ "^interface " wg 2 rc "(Base|Overloads) {" { 
	inside = 1
	next
}

inside && /^};?$/ {
	inside = 0
}

inside && $1 ~ "(new\\()|prototype):" {
	next 
}

inside && $1 == "readonly" {
	$1 = "const"
	uniq[$0]++
}

inside && $1 ~ "[[:alnum:]]+\\(" {
	$1 = "function " $1
	uniq[$0]++
}

END {
	out = "export { }" nl "declare global {" nl

	# NOTE skipping index zero, since it
	# is an empty line for some reason
	lines = asorti(uniq)
	for(i = 1; i <= lines; i++)
		out = out ts gensub(/;$/, "", 1, uniq[i]) nl

	out = out "}" nl
	print out > output
}
