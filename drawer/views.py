from django.shortcuts import render
from django.http import HttpResponseRedirect, HttpResponse, Http404
import simplejson
import time
from random import *
import networkx
from drawer.energy import *
from drawer.genetic import *
from drawer.models import *

# Create your views here.

def home(request):
	if "id" not in request.session:
		c = Counter.objects.get(id = 1)
		request.session['id'] = c.cnt
		c.cnt = c.cnt + 1
		c.save()
	context = { 'id': request.session['id'] }
	return render(request, 'drawer/home.html', context)

def randomGraph(request):
	n = int(request.GET['n'])
	m = int(request.GET['m'])
	w = int(request.GET['w'])
	h = int(request.GET['h'])
	d = int(request.GET['d'])
	m = min(m, (n * (n - 1)) // 2)
	m = min(m, (n * d) // 2)
	to_json = []
	g_dict = {}
	g_dict['n'] = n
	g_dict['m'] = m
	edges = []
	to_json.append(g_dict)
	for i in range(n):
		g_dict = {}
		g_dict['x'] = randint(1, w)
		g_dict['y'] = randint(1, h)
		to_json.append(g_dict)
		edges.append(set([]))
	for i in range(m):
		g_dict = {}
		a, b = randint(1, n), randint(1, n)
		while a == b or (b - 1) in edges[a - 1] or len(edges[a - 1]) == d or len(edges[b - 1]) == d:
			a, b = randint(1, n), randint(1, n)
		edges[a - 1].add(b - 1)
		edges[b - 1].add(a - 1)
		g_dict['source'] = a
		g_dict['target'] = b
		to_json.append(g_dict)
	response_data = simplejson.dumps(to_json)
	return HttpResponse(response_data)

def randomInput(request):
	n = int(request.GET['n'])
	m = int(request.GET['m'])
	d = int(request.GET['d'])
	m = min(m, (n * (n - 1)) // 2)
	m = min(m, (n * d) // 2)
	f = open("drawer/static/drawer/in/graph" + str(request.session['id']) + ".in", "w")
	f.write(str(n) + " " + str(m) + "\n")
	edges = []
	for i in range(n):
		edges.append(set([]))
	for i in range(m):
		a, b = randint(1, n), randint(1, n)
		while a == b or (b - 1) in edges[a - 1] or len(edges[a - 1]) == d or len(edges[b - 1]) == d:
			a, b = randint(1, n), randint(1, n)
		edges[a - 1].add(b - 1)
		edges[b - 1].add(a - 1)
		f.write(str(a - 1) + " " + str(b - 1) + "\n")
	f.close()
	return HttpResponse()

def randomUpload(request):
	w = int(request.POST['w'])
	h = int(request.POST['h'])
	sp = request.POST['text'].split("\n")
	tmp = sp[0].split(" ")
	n, m = int(tmp[0]), int(tmp[1])
	to_json = []
	g_dict = {}
	g_dict['n'] = n
	g_dict['m'] = m
	to_json.append(g_dict)
	for i in range(n):
		g_dict = {}
		g_dict['x'] = randint(1, w)
		g_dict['y'] = randint(1, h)
		to_json.append(g_dict)
	for i in range(m):
		tmp = sp[i + 1].split(" ")
		g_dict = {}
		g_dict['source'] = int(tmp[0]) + 1
		g_dict['target'] = int(tmp[1]) + 1
		to_json.append(g_dict)
	response_data = simplejson.dumps(to_json)
	return HttpResponse(response_data)

def parseGML(request):
	w = int(request.POST['w'])
	h = int(request.POST['h'])
	G = networkx.parse_gml(request.POST['text'])
	n, m = len(G.node), 0
	for i in range(len(G.edge)):
		m = m + len(G.edge.get(str(i + 1)).keys())
	m = m // 2
	to_json = []
	g_dict = {}
	g_dict['n'] = n
	g_dict['m'] = m
	to_json.append(g_dict)
	for i in range(len(G.node)):
		g_dict = {}
		if(G.node.get(str(i + 1)).get('graphics')):
			g_dict['x'] = G.node.get(str(i + 1)).get('graphics').get('center').get('x')
			g_dict['y'] = G.node.get(str(i + 1)).get('graphics').get('center').get('y')
		else:
			g_dict['x'] = randint(1, w)
			g_dict['y'] = randint(1, h)
		to_json.append(g_dict)
	for i in range(len(G.edge)):
		for k in G.edge.get(str(i + 1)).keys():
			if(int(k) > (i + 1)):
				g_dict = {}
				g_dict['source'] = i + 1
				g_dict['target'] = int(k)
				to_json.append(g_dict)
	response_data = simplejson.dumps(to_json)
	return HttpResponse(response_data)

def calculateEnergy(request):
	x = request.POST.getlist('xpos[]')
	y = request.POST.getlist('ypos[]')
	s = request.POST.getlist('source[]')
	t = request.POST.getlist('target[]')
	a = float(request.POST['cross'])
	b = float(request.POST['area'])
	c = float(request.POST['symmetry'])
	d = float(request.POST['angle'])
	r = int(request.POST['radius'])
	for i  in range(len(x)):
		x[i] = int(x[i])
		y[i] = int(y[i])
	for i in range(len(s)):
		s[i] = int(s[i])
		t[i] = int(t[i])
	response_data = a * cross(x, y, s, t, r) + b * area(x, y) + c * symmetry(x, y) + d * angle(x, y, s, t)
	return HttpResponse(response_data)

def calculateMinEnergy(request):
	n = int(request.POST['n'])
	s = request.POST.getlist('source[]')
	t = request.POST.getlist('target[]')
	a = float(request.POST['cross'])
	b = float(request.POST['area'])
	c = float(request.POST['symmetry'])
	d = float(request.POST['angle'])
	ind = int(request.POST['individual'])
	gen = int(request.POST['generation'])
	p_cross = float(request.POST['cross-p'])
	p_mut = float(request.POST['mut-p'])
	r = int(request.POST['radius'])
	for i in range(len(s)):
		s[i] = int(s[i])
		t[i] = int(t[i])
	sid = request.session['id']
	if(Genetic.objects.filter(sid = sid).count() == 0):
		g = Genetic()
		g.sid = sid
	else:
		g = Genetic.objects.get(sid = sid)
	g.gencount = 0
	g.cancel = False
	g.save()
	response_data = genetic(n, s, t, a, b, c, d, ind, gen, p_cross, p_mut, r, sid, -1, ind // 10, True)
	return HttpResponse(response_data)

def getGML(request):
	x = request.POST.getlist('xpos[]')
	y = request.POST.getlist('ypos[]')
	s = request.POST.getlist('source[]')
	t = request.POST.getlist('target[]')
	f = open("drawer/static/drawer/gml/graph" + str(request.session['id']) + ".gml", "w")
	f.write("graph [\n")
	for i in range(len(x)):
		f.write("\tnode [\n")
		f.write("\t\tid " + str(i + 1) + "\n")
		f.write("\t\tlabel \"" + str(i + 1) + "\"\n")
		f.write("\t\tgraphics [\n")
		f.write("\t\t\tcenter [ x "+ x[i] + " y " + y[i] + " ]\n")
		f.write("\t\t]\n\t]\n")
	for i in range(len(s)):
		f.write("\tedge [\n")
		f.write("\t\tsource " + str(int(s[i]) + 1) + "\n")
		f.write("\t\ttarget " + str(int(t[i]) + 1) + "\n")
		f.write("\t]\n")
	f.write("]\n")
	f.close()
	return HttpResponse()

def minStatus(request):
	sid = request.session['id']
	g = Genetic.objects.get(sid = sid)
	to_json = []
	g_dict = {}
	g_dict['g'] = g.gencount
	g_dict['f'] = round(g.minf, 3)
	to_json.append(g_dict)
	response_data = simplejson.dumps(to_json)
	return HttpResponse(response_data)

def cancelGenetic(request):
	sid = request.session['id']
	g = Genetic.objects.get(sid = sid)
	g.cancel = True
	g.save()
	return HttpResponse()

def tests(request):
	n = int(request.POST['n'])
	s = request.POST.getlist('source[]')
	t = request.POST.getlist('target[]')
	a = float(1)
	b = float(0)
	c = float(1)
	d = float(0.1)
	ind = int(100)
	gen = int(50)
	r = int(request.POST['radius'])
	for i in range(len(s)):
		s[i] = int(s[i])
		t[i] = int(t[i])
	sid = request.session['id']
	if(Genetic.objects.filter(sid = sid).count() == 0):
		g = Genetic()
		g.sid = sid
	else:
		g = Genetic.objects.get(sid = sid)
	g.gencount = 0
	g.cancel = False
	g.save()
	seeds = [8929, 10099, 10343, 11059, 11443, 11777, 12011, 22039, 22123, 22307, 32029, 32909, 34147, 35083, 36161, 47599, 48589, 48889, 88997, 1e9+7]
	pms, pcs = [0.1, 0.125, 0.15, 0.175, 0.2], [0.6, 0.65, 0.7, 0.75, 0.8]
	elit = [1, 10]
	selec = [True, False]
	for el in range(2):
		for sel in range(2):
			sdir = str(el) + str(sel) + "/"
			bestf = open(sdir + "test_results_bf.csv", "w")
			avgf = open(sdir + "test_results_af.csv", "w")
			devf = open(sdir + "test_results_df.csv", "w")
			bestf.write("mut/cross;0,6;0,65;0,7;0,75;0,8\n")
			avgf.write("mut/cross;0,6;0,65;0,7;0,75;0,8\n")
			devf.write("mut/cross;0,6;0,65;0,7;0,75;0,8\n")
			for pm in pms:
				bestf.write(str(pm).replace(".", ","))
				avgf.write(str(pm).replace(".", ","))
				devf.write(str(pm).replace(".", ","))
				for pc in pcs:
					bf, af, df = 0, 0, 0
					print(str(pm) + " " + str(pc))
					for se in seeds:
						data = genetic(n, s, t, a, b, c, d, ind, gen, pc, pm, r, sid, se, elit[el], selec[sel])
						#print(data)
						bf = bf + data.get('best')
						af = af + data.get('avg')
						df = df + data.get('dev')
						#print(str(bf) + " " + str(bt))
					bf, af, df = bf / len(seeds), af / len(seeds), df / len(seeds)
					bf = ceil(bf * 1e7) / 1e7
					af = ceil(af * 1e7) / 1e7
					df = ceil(df * 1e7) / 1e7
					bestf.write(";" + str(bf).replace(".", ","))
					avgf.write(";" + str(af).replace(".", ","))
					devf.write(";" + str(df).replace(".", ","))
				bestf.write("\n")
				avgf.write("\n")
				devf.write("\n")
			bestf.close()
			avgf.close()
			devf.close()
	return HttpResponse()
