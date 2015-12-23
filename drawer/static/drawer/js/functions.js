var x = [], y = [], s = [], t = [], mx, my, isDrag = false, mi, cv = [], ce = [], cf = "#ffffff", selectVar = false, sx = -1, sy = -1, tx = -1, ty = -1, all = [], off_x = [], off_y = [], off_sx = 0, off_tx = 0, off_sy = 0, off_ty = 0, success = true, tcnt = 0;

$(document).ready(function() {
	setCanvasDimension();
	$("#draw").click(function() {
		var canvas = $("#canvas")[0];
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		drawEdges();
		drawVertex();
		$(this).blur();
	});
	$("#random").click(function() {
		var canvas = $("#canvas")[0];
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		x = [], y = [], s = [], t = [];
		getRandomGraph(canvas.width, canvas.height);
	});
	$("#random-upload").click(function() {
		$("#exampleInputFile2").trigger("click");
	});
	$("#random-input").click(function() {
		getRandomInput();
	});
	$("#ul-gml").click(function() {
		$("#exampleInputFile").trigger("click");
	});
	$(function() {
		$("#inputFile").submit(getParsedGML);
	});
	$(function() {
		$("#inputFile2").submit(setRandomUpload);
	});
	$("#exampleInputFile").change(function() {
		$("#inputFile").submit();
	});
	$("#exampleInputFile2").change(function() {
		$("#inputFile2").submit();
	});
	$("#energy-button").click(function() {
		getEnergyValue();
	});
	$("#min-energy-button").click(function() {
		getMinEnergyValue();
	});
	$("#cancel-button").click(function() {
		cancelAjax();
	});
	$("#dl-gml").click(function() {
		downloadGML();
	});
	$("#PNG-button").click(function() {
		downloadPNG();
	});
	$("#SVG-button").click(function() {
		downloadSVG();
	});
	$(".radio").change(function() {
		if($("#delete").is(":checked") || $("#delete-e").is(":checked")) {
			$("#canvas").css("cursor","not-allowed");
		}
		else {
			$("#canvas").css("cursor","default");
		}
	});
});

function setCanvasDimension() {
	var w = Math.floor($(window).width() * 0.715);
	var h = Math.floor($(window).height() * 0.825);
	$("#canvas").attr("width", w);
	$("#canvas").attr("height", h);
	var canvas = $("#canvas")[0];
	canvas.onmousedown = myDown;
	canvas.onmouseup = myUp;
	$("#canvas").css("cursor","default");
}

function myDown(e) {
	if(!success) {
		return;
	}
	getMouse(e);
	var canvas = $("#canvas")[0];
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	drawEdges();
	drawVertex();
	if($("#delete-e").is(":checked")) {
		for(i = 0; i < s.length; ++i) {
			if(pointToSegmentDistance(x[s[i]], y[s[i]], x[t[i]], y[t[i]], mx, my) <= 10) {
				s.remove(i);
				t.remove(i);
				break;
			}
		}
		var canvas = $("#canvas")[0];
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		drawEdges();
		drawVertex();
		return;
	}
	if($("#change-color-e").is(":checked")) {
		for(i = 0; i < s.length; ++i) {
			if(pointToSegmentDistance(x[s[i]], y[s[i]], x[t[i]], y[t[i]], mx, my) <= 10) {
				var c = $("#color-picker-e").val();
				ce[i] = c;
				break;
			}
		}
		var canvas = $("#canvas")[0];
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		drawEdges();
		drawVertex();
		return;
	}
	if($("#add").is(":checked")) {
		var canvas = $("#canvas")[0];
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	  x.push(mx);
	  y.push(my);
	  var c = $("#color-picker").val();
	  cv.push(c);
	  drawEdges();
	  drawVertex();
	  return;
	}
	for(i = 0; i < x.length; ++i) {
		if(Math.abs(mx - x[i]) <= r && Math.abs(my - y[i]) <= r) {
			if($("#select").is(":checked")) {
				mi = i;
				isDrag = true;
				canvas.onmousemove = myMove;
				var ctx = canvas.getContext("2d");
				if(all.length == 0) {
					ctx.beginPath();
					ctx.font = "25px Arial";
					ctx.fillStyle = "black";
					ctx.fillText("ID = " + (mi + 1), canvas.width - 150, 25);
					ctx.closePath();
				}
				$("#canvas").css("cursor","move");
				var isIn = false;
				for(j = 0; j < all.length; ++j) {
					if(all[j] == mi) {
						isIn = true;
						break;
					}
				}
				if(isIn) {
					for(j = 0; j < all.length; ++j) {
						var idx = all[j];
						off_x.push(x[idx] - x[mi]);
						off_y.push(y[idx] - y[mi]);
					}
					off_sx = mx - sx;
					off_tx = mx - tx;
					off_sy = my - sy;
					off_ty = my - ty;
				}
				break;
			}
			if($("#delete").is(":checked")) {
				x.remove(i);
				y.remove(i);
				for(j = 0; j < s.length; ++j) {
					if(s[j] == i || t[j] == i) {
						s.remove(j);
						t.remove(j);
					}
					if(s[j] > i) {
						s[j]--;
					}
					if(t[j] > i) {
						t[j]--;
					}
				}
				var canvas = $("#canvas")[0];
				canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
				drawEdges();
				drawVertex();
				break;
			}
			if($("#add-e").is(":checked")) {
				mi = i;
				isDrag = true;
				canvas.onmousemove = myMove;
				break;
			}
			if($("#change-color").is(":checked")) {
				var c = $("#color-picker").val();
				cv[i] = c;
				var canvas = $("#canvas")[0];
				canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
				drawEdges();
				drawVertex();
				break;
			}
		}
	}
	if($("#select").is(":checked") && !isDrag) {
		canvas.onmousemove = myMove;
		selectVar = true;
		sx = mx; sy = my;
		tx = -1; ty = -1;
		all = []; off_x = []; off_y = []; off_sx = 0; off_tx = 0; off_sy = 0; off_ty = 0;
	}
}

function myMove(e) {
	getMouse(e);
	var canvas = $("#canvas")[0];
	canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
	if($("#select").is(":checked") && !selectVar) {
		if(all.length != 0) {
			for(i = 0; i < all.length; ++i) {
				var idx = all[i];
				x[idx] = mx + off_x[i];
				y[idx] = my + off_y[i];
			}
			sx = mx - off_sx; tx = mx - off_tx;
			sy = my - off_sy; ty = my - off_ty;
		}
		else {
			x[mi] = mx;
			y[mi] = my;
		}
		drawEdges();
		drawVertex();
		var ctx = canvas.getContext("2d");
		if(all.length == 0) {
			ctx.beginPath();
			ctx.font = "25px Arial";
			ctx.fillStyle = "black";
			ctx.fillText("ID = " + (mi + 1), canvas.width - 150, 25);
			ctx.closePath();
		}
	}
	if($("#select").is(":checked") && selectVar) {
		drawEdges();
		drawVertex();
		var ctx = canvas.getContext("2d");
		if(mx >= sx && my >= sy) {
			ctx.beginPath();
			ctx.strokeStyle = "black";
			ctx.strokeRect(sx, sy, mx - sx, my - sy);
			ctx.closePath();
		}
	}
	if($("#add-e").is(":checked")) {
		drawEdges();
		var ctx = $("#canvas")[0].getContext("2d");
		var c = $("#color-picker-e").val();
		if($("#full").is(":checked")) {
			drawFullLine(ctx, x[mi], y[mi], mx, my, c);
		}
		if($("#dot").is(":checked")) { 
			if(t[i] < s[i]) {
				var tmp  = t[i];
				t[i] = s[i];
				s[i] = tmp;
			}
			drawDotLine(ctx, x[mi], y[mi], mx, my), c;
		}
		drawVertex();
	}
}

function myUp(e) {
	getMouse(e);
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	var canvas = $("#canvas")[0];
	if($("#select").is(":checked") && !selectVar) {
		$("#canvas").css("cursor","default");
		off_x = []; off_y = []; off_s = 0; off_t = 0; off_sy = 0; off_ty = 0;
	}
	if($("#select").is(":checked") && selectVar) { 
		selectVar = false;
		var redraw = true;
		tx = -1; ty = -1;
		for(i = 0; i < x.length; ++i) {
			if(x[i] >= sx && x[i] <= mx && y[i] >= sy && y[i] <= my) {
				redraw = false;
				all.push(i);
			}
		}
		if(redraw) {
			canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
			drawEdges();
			drawVertex();
			sx = -1; sy = -1;
		}
		else {
			tx = mx; ty = my;
		}
	}
	if($("#add-e").is(":checked")) {
		var c = $("#color-picker-e").val();
		for(i = 0; i < x.length; ++i) {
			if(Math.abs(mx - x[i]) <= r && Math.abs(my - y[i]) <= r) {
				s.push(mi);
				t.push(i);
				ce.push(c);
				break;
			}
		}
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		drawEdges();
		drawVertex();
	}
	isDrag = false;
  canvas.onmousemove = null;
}

function getRandomGraph(wval, hval) {
	var nval = $("#random-n").val();
	var mval = $("#random-m").val();
	var dval = $("#random-d").val();
	if(isNaN(nval) || nval === '' || nval < 1) {
		nval = 10;
	}
	if(isNaN(mval) || mval === '' || mval < 0) {
		mval = 10;
	}
	if(isNaN(dval) || dval === '' || dval < 0) {
		dval = 10;
	}
	$.getJSON("random/", { n: nval, m: mval, w: wval, h: hval, d: dval })
	.done(function(data) {
		fillArray(data);
		$("#random").blur();
	})
	.fail(function(xhr, textStatus, errorThrown) {
			alert("Error " + xhr.status + ": " + errorThrown);
	});
}

function getRandomInput() {
	var nval = $("#random-n").val();
	var mval = $("#random-m").val();
	var dval = $("#random-d").val();
	if(isNaN(nval) || nval === '' || nval < 1) {
		nval = 10;
	}
	if(isNaN(mval) || mval === '' || mval < 0) {
		mval = 10;
	}
	if(isNaN(dval) || dval === '' || dval < 0) {
		dval = 1000000;
	}
	$.ajax({
		method: "GET",
		url: "randominput/",
		data: { n: nval, m: mval, d: dval },
	})
	.done(function() {
		$("#downloadInput").get(0).click();
		$("#random-input").blur();
	});
}

function getParsedGML(event) {
	var canvas = $("#canvas")[0];
	event.preventDefault();
	var fd = new FormData($("#inputFile"));
	var fr = new FileReader();
	fr.onload = function(e) {
		$.ajax({
			dataType: "json",
			method: "POST",
			url: "gml/",
			headers: { "X-CSRFToken": getCookie("csrftoken") },
			data: { text: fr.result, w: canvas.width, h: canvas.height }, 
		})
		.done(function(data) {
			var canvas = $("#canvas")[0];
			canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
			x = [], y = [], s = [], t = [];
			fillArray(data);
			$("#ul-gml").blur();
		})
		.fail(function(xhr, textStatus, errorThrown) {
			alert("Error " + xhr.status + ": " + errorThrown);
		});
	}
	fr.readAsText($("#exampleInputFile")[0].files[0]);
	return false;
}

function setRandomUpload(event) {
	event.preventDefault();
	var fd = new FormData($("#inputFile2"));
	var fr = new FileReader();
	fr.onload = function(e) {
		$.ajax({
			dataType: "json",
			method: "POST",
			url: "randomupload/",
			headers: { "X-CSRFToken": getCookie("csrftoken") },
			data: { text: fr.result, w: canvas.width, h: canvas.height }, 
		})
		.done(function(data) {
			var canvas = $("#canvas")[0];
			canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
			x = [], y = [], s = [], t = [];
			fillArray(data);
			$("#random-upload").blur();
		})
		.fail(function(xhr, textStatus, errorThrown) {
			alert("Error " + xhr.status + ": " + errorThrown);
		});
	}
	fr.readAsText($("#exampleInputFile2")[0].files[0]);
	return false;
}

function getEnergyValue() {
	var cross = $("#cross").val();
	var area = $("#area").val();
	var symmetry = $("#symmetry").val();
	var angle = $("#angle").val();
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	if(isNaN(cross) || cross === '' || cross < 0 || cross > 1) {
		cross = 1;
	}
	if(isNaN(area) || area === '' || area < 0 || area > 1) {
		area = 1;
	}
	if(isNaN(symmetry) || symmetry === '' || symmetry < 0 || symmetry > 1) {
		symmetry = 1;
	}
	if(isNaN(angle) || angle === '' || angle < 0 || angle > 1) {
		angle = 1;
	}
	$.ajax({
		method: "POST",
		url: "energyval/",
		headers: { "X-CSRFToken": getCookie("csrftoken") },
		data: { 'xpos[]': x, 'ypos[]': y, 'source[]': s, 'target[]': t, 'cross': cross, 'area': area, 'symmetry': symmetry, 'angle': angle, 'radius': r }, 
	})
	.done(function(data) {
		console.log(data);
		$("#energy-button").blur();
		$("#energy-val").attr("value", "f(x) = " + data);
	})
	.fail(function(xhr, textStatus, errorThrown) {
		alert("Error " + xhr.status + ": " + errorThrown);
	});
}

function getMinEnergyValue() {
	var cross = $("#cross").val();
	var area = $("#area").val();
	var symmetry = $("#symmetry").val();
	var angle = $("#angle").val();
	var ind = $("#individual").val();
	var gen = $("#generation").val();
	var p_cross = $("#cross-p").val();
	var p_mut = $("#mut-p").val();
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	if(isNaN(cross) || cross === '' || cross < 0 || cross > 1) {
		cross = 1;
	}
	if(isNaN(area) || area === '' || area < 0 || area > 1) {
		area = 1;
	}
	if(isNaN(symmetry) || symmetry === '' || symmetry < 0 || symmetry > 1) {
		symmetry = 1;
	}
	if(isNaN(angle) || angle === '' || angle < 0 || angle > 1) {
		angle = 1;
	}
	if(isNaN(ind) || ind === '' || ind < 2) {
		ind = 2;
	}
	if(isNaN(gen) || gen === '' || gen < 1) {
		gen = 1;
	}
	if(isNaN(p_cross) || p_cross === '' || p_cross < 0 || p_cross > 1) {
		p_cross = 0.8;
	}
	if(isNaN(p_mut) || p_mut === '' || p_mut < 0 || p_mut > 1) {
		p_mut = 0.1;
	}
	success = false; tcnt = 0;
	var ctx = $("canvas")[0].getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = cf;
	ctx.fillRect(canvas.width - 200, 0, 200, 50);
	ctx.font = "25px Arial";
	ctx.fillStyle = "black";
	ctx.fillText("Calculating 0%", canvas.width - 200, 25);
	ctx.closePath();
	$("#cancel-button").css("visibility", "visible");
	$.ajax({
		dataType: "json",
		method: "POST",
		url: "minenergyval/",
		headers: { "X-CSRFToken": getCookie("csrftoken") },
		data: { 'n': x.length, 'source[]': s, 'target[]': t, 'cross': cross, 'area': area, 'symmetry': symmetry, 'angle': angle, 'individual': ind, 'generation': gen, 'cross-p': p_cross, 'mut-p': p_mut, 'radius': r }, 
	})
	.done(function(data) {
		var canvas = $("#canvas")[0];
		canvas.getContext("2d").clearRect(0, 0, canvas.width, canvas.height);
		x = [], y = [], s = [], t = [];
		fillArray(data);
		$("#min-energy-button").blur();
		$("#min-energy-val").attr("value", "f(x) = " + data[0].f);
		success = true;
		$("#cancel-button").css("visibility", "hidden");
	})
	.fail(function(xhr, textStatus, errorThrown) {
		alert("Error " + xhr.status + ": " + errorThrown);
	});
	waitAjax();
}

function doTests() {
	var cross = $("#cross").val();
	var area = $("#area").val();
	var symmetry = $("#symmetry").val();
	var angle = $("#angle").val();
	var ind = $("#individual").val();
	var gen = $("#generation").val();
	var p_cross = $("#cross-p").val();
	var p_mut = $("#mut-p").val();
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	if(isNaN(cross) || cross === '' || cross < 0 || cross > 1) {
		cross = 1;
	}
	if(isNaN(area) || area === '' || area < 0 || area > 1) {
		area = 1;
	}
	if(isNaN(symmetry) || symmetry === '' || symmetry < 0 || symmetry > 1) {
		symmetry = 1;
	}
	if(isNaN(angle) || angle === '' || angle < 0 || angle > 1) {
		angle = 1;
	}
	if(isNaN(ind) || ind === '' || ind < 2) {
		ind = 2;
	}
	if(isNaN(gen) || gen === '' || gen < 1) {
		gen = 1;
	}
	if(isNaN(p_cross) || p_cross === '' || p_cross < 0 || p_cross > 1) {
		p_cross = 0.8;
	}
	if(isNaN(p_mut) || p_mut === '' || p_mut < 0 || p_mut > 1) {
		p_mut = 0.1;
	}
	$.ajax({
		dataType: "json",
		method: "POST",
		url: "tests/",
		headers: { "X-CSRFToken": getCookie("csrftoken") },
		data: { 'n': x.length, 'source[]': s, 'target[]': t, 'cross': cross, 'area': area, 'symmetry': symmetry, 'angle': angle, 'individual': ind, 'generation': gen, 'cross-p': p_cross, 'mut-p': p_mut, 'radius': r }, 
	})
	.done(function(data) {
		
	})
	.fail(function(xhr, textStatus, errorThrown) {
		alert("Error " + xhr.status + ": " + errorThrown);
	});
}

function waitAjax() {
	setTimeout(function() {
		if(!success) {
			tcnt++;
			var gen = $("#generation").val();
			if(isNaN(gen) || gen === '' || gen < 1) {
				gen = 1;
			}
			$.ajax({
				dataType: "json",
				method: "GET",
				url: "minstatus/",
			})
			.done(function(data) {
				var p = (100 * data[0].g / gen);
				var time = Math.round(((200 * tcnt) / p - (2 * tcnt)));
				var min = Math.round(time / 60 - 0.5);
				var seg = time % 60;
				if(seg < 10) {
					seg = "0" + seg;
				}
				if(min < 10) {
					min = "0" + min;
				}
				var ctx = $("canvas")[0].getContext("2d");
				ctx.beginPath();
				ctx.fillStyle = cf;
				ctx.fillRect(canvas.width - 200, 0, 200, 100);
				ctx.font = "25px Arial";
				ctx.fillStyle = "black";
				ctx.fillText("Calculating " + Math.round(p) + "%",canvas.width - 200, 25);
				ctx.fillText("f(x) = " + (data[0].f), canvas.width - 200, 50);
				if(!isNaN(seg) && !isNaN(time)) {
					ctx.fillText("ETA " + min + ":" + seg, canvas.width - 200, 75);
				}
				ctx.closePath();
				waitAjax();
			});		
		}
	}, 2000);
}

function cancelAjax() {
	if(success) {
		$("#cancel-button").blur();
		return;
	}
	$.ajax({
		method: "GET",
		url: "cancelgenetic/",
	})
	.done(function() {
		$("#cancel-button").css("visibility", "hidden");
		success = true;
	});
}

function downloadGML() {
	$.ajax({
		method: "POST",
		url: "getgml/",
		headers: { "X-CSRFToken": getCookie("csrftoken") },
		data: { 'xpos[]': x, 'ypos[]': y, 'source[]': s, 'target[]': t }, 

	})
	.done(function(data) {
		$("#downloadGML").get(0).click();
		$("#dl-gml").blur();
	})
	.fail(function(xhr, textStatus, errorThrown) {
		alert("Error " + xhr.status + ": " + errorThrown);
	});
}

function downloadPNG() {
	var canvas = $("#canvas")[0];
	var image = canvas.toDataURL("image/png").replace("image/png", "image/octet-stream"); 
	$("#downloadPNG").attr("href", image);
	$("#downloadPNG").get(0).click();
	$("#PNG-button").blur();
}

function downloadSVG() {
	var canvas = $("#canvas")[0];
	var ctx = new C2S(canvas.width, canvas.height);
	drawEdgesSVG(ctx);
	drawVertexSVG(ctx);
	var svg = ctx.getSerializedSvg();
	var b64 = Base64.encode(svg);
	var image = "data:image/svg+xml;base64,\n" + b64;
	$("#downloadSVG").attr("href", image);
	$("#downloadSVG").get(0).click();
	$("#SVG-button").blur();
}

function fillArray(data) {
	var n = data[0].n;
	var m = data[0].m;
	var c = $("#color-picker").val();
	for(i = 1; i <= n; ++i) {
		x.push(data[i].x);
		y.push(data[i].y);
		cv.push(c);
	}
	c = $("#color-picker-e").val();
	for(i = n + 1; i < data.length; ++i) {
		s.push(data[i].source - 1);
		t.push(data[i].target - 1);
		ce.push(c);
	}
	drawEdges();
	drawVertex();
}

function drawVertex() {
	var ctx = $("#canvas")[0].getContext("2d");
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	for(i = 0; i < x.length; i++) {
		if($("#fillc").is(":checked")) {
				drawCircleFill(ctx, x[i], y[i], r, cv[i]);
		}
		if($("#strokec").is(":checked")) {
				drawCircleStroke(ctx, x[i], y[i], r, cv[i]);
		}
		if($("#fillr").is(":checked")) {
			drawRectangleFill(ctx, x[i] - r, y[i] - r, 2 * r, cv[i]);
		}
		if($("#stroker").is(":checked")) {
			drawRectangleStroke(ctx, x[i] - r, y[i] - r, 2 * r, cv[i]);
		}
	}
	if(tx != -1) {
		ctx.beginPath();
		ctx.strokeStyle = "black";
		ctx.strokeRect(sx, sy, tx - sx, ty - sy);
		ctx.closePath();
	}
}

function drawVertexSVG(ctx) {
	var r = $("#radius").val();
	if(isNaN(r) || r === '' || r < 1) {
		r = 10;
	}
	for(i = 0; i < x.length; i++) {
		if($("#fillc").is(":checked")) {
				drawCircleFill(ctx, x[i], y[i], r, cv[i]);
		}
		if($("#strokec").is(":checked")) {
				drawCircleStroke(ctx, x[i], y[i], r, cv[i]);
		}
		if($("#fillr").is(":checked")) {
			drawRectangleFill(ctx, x[i] - r, y[i] - r, 2 * r, cv[i]);
		}
		if($("#stroker").is(":checked")) {
			drawRectangleStroke(ctx, x[i] - r, y[i] - r, 2 * r, cv[i]);
		}
	}
}

function drawCircleFill(ctx, x, y, r, c) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = c;
	ctx.fill();
	ctx.closePath();
}

function drawCircleStroke(ctx, x, y, r, c) {
	ctx.beginPath();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.fillStyle = cf;
	ctx.fill();
	ctx.arc(x, y, r, 0, 2 * Math.PI);
	ctx.strokeStyle = c;
	ctx.stroke();
	ctx.closePath();
}

function drawRectangleFill(ctx, x1, y1, d, c) {
	ctx.beginPath();
	ctx.fillStyle = c;
	ctx.fillRect(x1, y1, d, d);
	ctx.closePath();
}

function drawRectangleStroke(ctx, x1, y1, d, c) {
	ctx.beginPath();
	ctx.fillStyle = cf;
	ctx.fillRect(x1, y1, d, d);
	ctx.strokeStyle = c;
	ctx.strokeRect(x1, y1, d, d);
	ctx.closePath();
}

function drawEdges() {
	var canvas = $("#canvas")[0];
	var ctx = canvas.getContext("2d");
	ctx.beginPath();
	ctx.fillStyle = cf;
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ctx.closePath();
	for(i = 0; i < s.length; i++) {
		if($("#full").is(":checked")) {
			drawFullLine(ctx, x[s[i]], y[s[i]], x[t[i]], y[t[i]], ce[i]);
		}
		if($("#dot").is(":checked")) { 
			if(t[i] < s[i]) {
				var tmp  = t[i];
				t[i] = s[i];
				s[i] = tmp;
			}
			drawDotLine(ctx, x[s[i]], y[s[i]], x[t[i]], y[t[i]], ce[i]);
		}
	}
}

function drawEdgesSVG(ctx) {
	var canvas = $("#canvas")[0];
	ctx.beginPath();
	ctx.fillStyle = cf;
	ctx.fillRect(0, 0, canvas.width, canvas.height);

	for(i = 0; i < s.length; i++) {
		if($("#full").is(":checked")) {
			drawFullLine(ctx, x[s[i]], y[s[i]], x[t[i]], y[t[i]], ce[i]);
		}
		if($("#dot").is(":checked")) { 
			if(t[i] < s[i]) {
				var tmp  = t[i];
				t[i] = s[i];
				s[i] = tmp;
			}
			drawDotLine(ctx, x[s[i]], y[s[i]], x[t[i]], y[t[i]], ce[i]);
		}
	}
}

function drawFullLine(ctx, x1, y1, x2, y2, c) {
	ctx.beginPath();
	ctx.moveTo(x1, y1);
	ctx.lineTo(x2, y2);
	ctx.strokeStyle = c;
	ctx.stroke();
	ctx.closePath();
}

function drawDotLine(ctx, x1, y1, x2, y2, c) {
	var dx = x2 - x1;
	var dy = y2 - y1;
	var draw = true;
	for(l = 0; l < 1; l += 0.01) {
		if(draw) {
			draw = false;
			var px1 = x1 + l * dx;
			var px2 = x1 + (l + 0.01) * dx;
			var py1 = y1 + l * dy;
			var py2 = y1 + (l + 0.01) * dy;
			ctx.beginPath();
			ctx.moveTo(px1, py1);
			ctx.lineTo(px2, py2);
			ctx.strokeStyle = c;
			ctx.stroke();
			ctx.closePath();
		}
		else {
			draw = true;
		}
	}
}


function pointToSegmentDistance(x1, y1, x2, y2, xc, yc) {
	var dx = x2 - x1;
	var dy =  y2 - y1;
	var dx1 = xc - x1;
	var dy1 = yc - y1;
	var dx2 = xc - x2;
	var dy2 = yc - y2;
	var dot1 = dx * dx1 + dy * dy1;
	var dot2 = -dx * dx2 - dy * dy2;
	if(dot1 < 0) {
		return (dx1 * dx1 + dy1 * dy1);
	}
	if(dot2 < 0) {
		return (dx2 * dx2 + dy2 * dy2);
	}
	var dist2 = dx * dx + dy * dy;
	var rx = x1 + (dx * dot1) / dist2;
	var ry = y1 + (dy * dot1) / dist2;
	var drx = rx - xc;
	var dry = ry - yc;
	return (drx * drx + dry * dry);
}

function getCookie(c_name) {
  if (document.cookie.length > 0)
  {
      c_start = document.cookie.indexOf(c_name + "=");
      if (c_start != -1)
      {
          c_start = c_start + c_name.length + 1;
          c_end = document.cookie.indexOf(";", c_start);
          if (c_end == -1) c_end = document.cookie.length;
          return unescape(document.cookie.substring(c_start,c_end));
      }
  }
  return "";
}


function getMouse(e) {
  var element = $("#canvas")[0], offsetX = 0, offsetY = 0;

  if (element.offsetParent) {
    do {
      offsetX += element.offsetLeft;
      offsetY += element.offsetTop;
    } while ((element = element.offsetParent));
  }

  mx = e.pageX - offsetX;
  my = e.pageY - offsetY
}

// Array Remove - By John Resig (MIT Licensed)
Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};