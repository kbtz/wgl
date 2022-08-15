#!/bin/gawk -f
@load "filefuncs"

BEGIN {
	wg = "WebGL"; rc = "RenderingContext"
	"npm root -g" | getline modules

	stat(modules "/typescript", tsdir)
	if(tsdir["type"] != "directory") {
		print "Typescript must be installed globally"
		exit -1
	}

	ARGV[ARGC++] = modules "/typescript/lib/lib.dom.d.ts"
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
	lines = asorti(uniq)
	print "export default " wg 2 rc "\n"
	print "declare global {"
	for(i = 1; i <= lines; i++)
		print "\t" uniq[i]
	print "}"
}
