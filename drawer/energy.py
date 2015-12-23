from math import *

def angle(x, y, s, t):
	n = len(x)
	edges = []
	for i in range(n):
		edges.append([])
	for i in range(len(s)):
		xi = x[t[i]] - x[s[i]]
		yi = y[t[i]] - y[s[i]]
		e = {}
		e['x'] = xi
		e['y'] = yi
		edges[s[i]].append(e)
		edges[t[i]].append(e)
	tita = 2 * pi
	for e in edges:
		for i in range(len(e)):
			for j in range(i + 1, len(e)):
				x1, y1 = e[i].get('x'), e[i].get('y')
				x2, y2 = e[j].get('x'), e[j].get('y')
				pij = x1 * x2 + y1 * y2
				ni = sqrt(x1 * x1 + y1 * y1)
				nj = sqrt(x2 * x2 + y2 * y2)
				if ni * nj == 0:
					costita = cos(2 * pi)
				else:
					costita = pij / (ni * nj)
				if(costita < -1):
					costita = -1
				elif(costita > 1):
					costita = 1
				tita = min(tita, acos(costita))
	return 180 - tita * 180 / pi

def symmetry(x, y):
	minx, miny = 5000, 5000
	maxx, maxy = 0, 0
	for i in range(len(x)):
		minx = min(minx, x[i])
		miny = min(miny, y[i])
		maxx = max(maxx, x[i])
		maxy = max(maxy, y[i])
	if(minx == 5000):
		minx, miny = 0, 0
	midx = (minx + maxx) >> 1
	midy = (miny + maxy) >> 1
	cntx, cnty = 0, 0
	for i in range(len(x)):
		if(x[i] <= midx):
			cntx = cntx - 1
		else:
			cntx = cntx + 1
		if(y[i] <= midy):
			cnty = cnty - 1
		else:
			cnty = cnty + 1
	cntx = abs(cntx)
	cnty = abs(cnty)
	return cntx

def cross(x, y, s, t, r):
	cnt = 0
	for i in range(len(s)):
		for j in range(i + 1, len(s)):
			x1, y1 = x[s[i]], y[s[i]]
			x2, y2 = x[t[i]], y[t[i]]
			x3, y3 = x[s[j]], y[s[j]]
			x4, y4 = x[t[j]], y[t[j]]
			if(intersectSegmentSegment(x1, y1, x2, y2, x3, y3, x4, y4)):
				cnt = cnt + 1
		for j in range(len(x)):
			x1, y1 = x[s[i]], y[s[i]]
			x2, y2 = x[t[i]], y[t[i]]
			xc, yc = x[j], y[j]
			if(x1 == xc and y1 == yc):
				continue
			if(x2 == xc and y2 == yc):
				continue
			if(intersectCircleSegment(x1, y1, x2, y2, xc, yc, r)):
				cnt = cnt + 1
	for i in range(len(x)):
		for j in range(i + 1, len(x)):
			if(intersectCircleCircle(x[i], y[i], x[j], y[j], r)):
				cnt = cnt + 1
	return cnt

def area(x, y):
	minx, miny = 5000, 5000
	maxx, maxy = 0, 0
	for i in range(len(x)):
		minx = min(minx, x[i])
		miny = min(miny, y[i])
		maxx = max(maxx, x[i])
		maxy = max(maxy, y[i])
	if(minx == 5000):
		minx, miny = 0, 0
	return (maxx - minx) * (maxy - miny)

def ccw(x1, y1, x2, y2, x3, y3, patch):
	dx1, dy1 = x2 - x1, y2 - y1
	dx2, dy2 = x3 - x1, y3 - y1
	if patch:
		if(dx1 * dx2 < 0 or dy1 * dy2 < 0):
			return 1
		if(dx1 * dx1 + dy1 + dy1 > dx2 * dx2 + dy2 * dy2):
			return -1
	if(dy1 * dx2 < dx1 * dy2):
		return 1
	if(dy1 * dx2 > dx1 * dy2):
		return -1
	return 0

def pointToSegmentDistance(x1, y1, x2, y2, xc, yc):
	dx, dy = x2 - x1, y2 - y1
	dx1, dy1 = xc - x1, yc - y1
	dx2, dy2 = xc - x2, yc - y2
	dot1, dot2 = dx * dx1 + dy * dy1, -dx * dx2 - dy * dy2
	if(dot1 < 0):
		return dx1 * dx1 + dy1 * dy1
	if(dot2 < 0):
		return dx2 * dx2 + dy2 * dy2
	dist2 = dx * dx + dy * dy
	if(dist2 == 0):
		dist2 = 1e-16
	rx = x1 + (dx * dot1) / dist2
	ry = y1 + (dy * dot1) / dist2
	drx, dry = rx - xc, ry - yc
	return drx * drx + dry * dry

def intersectSegmentSegment(x1, y1, x2, y2, x3, y3, x4, y4):
	ccw1 = ccw(x3, y3, x1, y1, x4, y4, False)
	ccw2 = ccw(x3, y3, x2, y2, x4, y4, False)
	ccw3 = ccw(x1, y1, x3, y3, x2, y2, False)
	ccw4 = ccw(x1, y1, x4, y4, x2, y2, False)
	if(ccw1 != 0 or ccw2 != 0 or ccw3 != 0 or ccw4 != 0):
		return ccw1 * ccw2 < 0 and ccw3 * ccw4 < 0
	ccw1 = ccw(x3, y3, x1, y1, x4, y4, True)
	ccw2 = ccw(x3, y3, x2, y2, x4, y4, True)
	ccw3 = ccw(x1, y1, x3, y3, x2, y2, True)
	ccw4 = ccw(x1, y1, x4, y4, x2, y2, True)
	return ccw1 * ccw2 < 0 and ccw3 * ccw4 < 0

def intersectCircleSegment(x1, y1, x2, y2, xc, yc, r):
	dist = pointToSegmentDistance(x1, y1, x2, y2, xc, yc)
	return dist < r * r + r / 2


def intersectCircleCircle(x1, y1, x2, y2, r):
	dx = (x2 - x1) * (x2 - x1)
	dy = (y2 - y1) * (y2 - y1)
	if(sqrt(dx + dy) <= 2 * r + r / 2):
		return True
	return False