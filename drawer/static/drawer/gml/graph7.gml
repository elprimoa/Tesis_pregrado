graph [
	node [
		id 1
		label "1"
		graphics [
			center [ x 65 y 185 ]
		]
	]
	node [
		id 2
		label "2"
		graphics [
			center [ x 90 y 218 ]
		]
	]
	node [
		id 3
		label "3"
		graphics [
			center [ x 86 y 139 ]
		]
	]
	node [
		id 4
		label "4"
		graphics [
			center [ x 196 y 199 ]
		]
	]
	node [
		id 5
		label "5"
		graphics [
			center [ x 229 y 131 ]
		]
	]
	node [
		id 6
		label "6"
		graphics [
			center [ x 85 y 58 ]
		]
	]
	edge [
		source 1
		target 2
	]
	edge [
		source 1
		target 5
	]
	edge [
		source 2
		target 3
	]
	edge [
		source 2
		target 5
	]
	edge [
		source 3
		target 4
	]
	edge [
		source 4
		target 6
	]
	edge [
		source 4
		target 5
	]
]
