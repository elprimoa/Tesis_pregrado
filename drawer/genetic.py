from drawer.energy import *
from random import *
from drawer.models import *
import simplejson
from math import *

def f(arr, s, t, a, b, c, d, r): 
	x, y = [], []
	mask = (1 << 9) - 1
	for i in range(len(arr)):
		num = arr[i]
		x.append(num & mask)
		y.append(num >> 9)
	return a * cross(x, y, s, t, r) + b * area(x, y) + c * symmetry(x, y) + d * angle(x, y, s, t)

def genetic(n, s, t, a, b, c, d, ind, gen, p_cross, p_mut, r, sid, seedval, elit, sel):
	if(seedval != -1):
		seed(seedval)
	single = []
	params = {'s': s, 't': t, 'a': a, 'b': b, 'c': c, 'd': d, 'r': r}
	for i in range(ind):
		arr = []
		for j in range(n):
			arr.append(randint(1, (1 << 18) - 1))
		single.append((arr,params))
	single = sorted(single, key = lambda x: f(x[0], **x[1]))
	return doGenetic(n, params, ind, single, gen, p_cross, p_mut, sid, elit, sel)

def doGenetic(n, params, m, single, gen, p_cross, p_mut, sid, elit, sel):
	fi = open("best_individual_per_generation.csv", "w")
	for t in range(gen - 1):
		fi.write(str(t + 1) + ";")
	fi.write(str(gen) + "\n")
	for t in range(gen):
		g = Genetic.objects.get(sid = sid)
		g.minf = f(single[0][0], **single[0][1])
		if(g.cancel):
			break;
		g.gencount = t
		g.save()
		next_gen = []
		if(not sel):
			sums = []
			maxf = f(single[m - 1][0], **single[m - 1][1]) + 1
			for l in range(m):
				if(len(sums) == 0):
					sums.append(maxf - f(single[l][0], **single[l][1]))
				else:
					sums.append(sums[l - 1] + maxf - f(single[l][0], **single[l][1]))
		while len(next_gen) < m:
			if(sel):
				i = randint(0, m - 1)
				j = randint(0, m - 1)
				while i == j:
					j = randint(0, m - 1)
			else:
				aux = random() * sums[m - 1]
				i = mbsearch(0, m - 1, sums, aux)
				aux = random() * sums[m - 1]
				j = mbsearch(0, m - 1, sums, aux)
				eqcnt = 0
				while i == j:
					eqcnt = eqcnt + 1
					if(eqcnt > 10):
						j = randint(0, m - 1)
					else:
						aux = random() * sums[m - 1]
						j = mbsearch(0, m - 1, sums, aux)
			pa, pb = single[i][0], single[j][0]
			inda, indb = [], []
			if(random() < p_cross):
				idx = randint(0, n - 1)
				for k in range(idx):
					inda.append(pa[k])
					indb.append(pb[k])
				mida = pa[idx]
				midb = pb[idx]
				bit = randint(1, 18)
				cut = (1 << bit) - 1
				mask = ((1 << 18) - 1) ^ cut
				cuta, cutb = mida & cut, midb & cut
				mida = (mida & mask) | cutb
				midb = (midb & mask) | cuta
				inda.append(mida)
				indb.append(midb)
				for k in range(idx + 1, n):
					inda.append(pb[k])
					indb.append(pa[k])
			else:
				inda, indb = pa, pb
			if(random() < p_mut):
				idx = randint(0, n - 1)
				bit = 1 << randint(0, 17)
				inda[idx] = inda[idx] ^ bit
			if(random() < p_mut):
				idx = randint(0, n - 1)
				bit = 1 << randint(0, 17)
				indb[idx] = indb[idx] ^ bit
			next_gen.append((inda, params))
			next_gen.append((indb, params))
		for k in range(min(m, elit)):
			next_gen.append(single[k])
		next_gen = sorted(next_gen, key = lambda x: f(x[0], **x[1]))
		for k in range(min(m, elit)):
			next_gen.pop()
		single = next_gen
		fi.write(str(f(single[0][0], **single[0][1])))
		if(t == gen - 1):
			fi.write("\n")
		else:
			fi.write(";")
	fi.close()
	#return f(single[0][0], **single[0][1])
	#return makeData(single, m)
	return makeJson(n, single[0][0], params.get('s'), params.get('t'), f(single[0][0], **single[0][1]))

def makeJson(n, arr, s, t, f):
	to_json = []
	g_dict = {}
	g_dict['n'] = n
	g_dict['m'] = len(s)
	g_dict['f'] = f
	to_json.append(g_dict)
	mask = (1 << 9) - 1
	for i in range(n):
		num = arr[i]
		g_dict = {}
		g_dict['x'] = num & mask
		g_dict['y'] = num >> 9
		to_json.append(g_dict)
	for i in range(len(s)):
		g_dict = {}
		g_dict['source'] = s[i] + 1
		g_dict['target'] = t[i] + 1
		to_json.append(g_dict)
	return simplejson.dumps(to_json)

def mbsearch(lo, hi, arr, x):
	while hi - lo > 1:
		mid = (hi + lo) >> 1
		if(arr[mid] > x):
			hi = mid - 1
		else:
			lo = mid
	return (hi + lo) >> 1

def makeData(single, m):
	data = {}
	data['best'] = f(single[0][0], **single[0][1])
	avg = 0
	for i in range(m):
		avg = avg + f(single[i][0], **single[i][1])
	avg = avg / m
	data['avg'] = avg
	var = 0
	for i in range(m):
		var = var + (f(single[i][0], **single[i][1]) - avg) * (f(single[i][0], **single[i][1]) - avg)
	var = var / (m - 1)
	data['dev'] = sqrt(var) 
	return data