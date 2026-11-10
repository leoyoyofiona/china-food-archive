/* 一饭一山河 · 中华美食影像档案 */
(function () {
  var D = window.FOOD_DATA || {};
  var STORIES = D.STORIES || [], CUISINES = D.CUISINES || [], DISHES = D.DISHES || [], VIDEOS = D.VIDEOS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  var COLOR = { cuisine: "#c8402e", dish: "#c9a25c", ingredient: "#8f9d7a", region: "#6f8fa8", technique: "#a88f6f", flavor: "#d07a4a" };

  /* ---------- 主题 ---------- */
  var root = document.documentElement;
  try { if (localStorage.getItem("food-theme") === "light") root.classList.add("light"); } catch (e) {}
  var tb = $(".theme-toggle");
  if (tb) tb.addEventListener("click", function () {
    root.classList.toggle("light");
    try { localStorage.setItem("food-theme", root.classList.contains("light") ? "light" : "dark"); } catch (e) {}
  });

  /* ---------- BGM ---------- */
  var bgm = $("#bgm"), bgmBtn = $("#bgmToggle"), bgmStart = $("#bgmStart");
  var bgmOn = false, ducked = false;
  if (bgm) bgm.volume = 0;
  function fadeTo(target, ms) {
    if (!bgm) return;
    var start = bgm.volume, t0 = Date.now();
    if (bgm.__fade) clearInterval(bgm.__fade);
    bgm.__fade = setInterval(function () {
      var p = Math.min(1, (Date.now() - t0) / ms);
      bgm.volume = start + (target - start) * p;
      if (p >= 1) { clearInterval(bgm.__fade); bgm.__fade = null; }
    }, 40);
  }
  function setBgm(on) {
    if (!bgm) return;
    bgmOn = on;
    if (on) {
      bgm.play().then(function () {
        fadeTo(ducked ? 0.06 : 0.30, 1800);
        if (bgmBtn) { bgmBtn.classList.add("playing"); bgmBtn.querySelector(".bgm-text").textContent = "音乐中"; }
        try { localStorage.setItem("food-bgm", "1"); } catch (e) {}
      }).catch(function () { bgmOn = false; });
    } else {
      fadeTo(0, 600);
      setTimeout(function () { if (!bgmOn) bgm.pause(); }, 650);
      if (bgmBtn) { bgmBtn.classList.remove("playing"); bgmBtn.querySelector(".bgm-text").textContent = "音乐"; }
      try { localStorage.setItem("food-bgm", "0"); } catch (e) {}
    }
  }
  if (bgmBtn) bgmBtn.addEventListener("click", function () { setBgm(!bgmOn); });
  if (bgmStart) bgmStart.addEventListener("click", function () {
    setBgm(true);
    var eps = $("#episodes"); if (eps) eps.scrollIntoView({ behavior: "smooth" });
  });
  // 首次交互即淡入背景音乐（浏览器自动播放限制下的常见做法）
  document.addEventListener("pointerdown", function once(e) {
    document.removeEventListener("pointerdown", once);
    if (bgmOn) return;
    if (e.target.closest && e.target.closest("#bgmToggle,#bgmStart")) return;
    setBgm(true);
  }, { once: true });
  try { if (localStorage.getItem("food-bgm") === "1" && bgm) bgm.play().then(function () { bgmOn = true; fadeTo(0.30, 1200); if (bgmBtn) { bgmBtn.classList.add("playing"); bgmBtn.querySelector(".bgm-text").textContent = "音乐中"; } }).catch(function () {}); } catch (e) {}

  /* ---------- 顶栏 / 回顶 ---------- */
  var topBar = $("#topBar"), backtop = $("#backtop");
  function onScroll() {
    if (topBar) topBar.classList.toggle("scrolled", window.scrollY > 40);
    if (backtop) backtop.classList.toggle("show", window.scrollY > 800);
  }
  if (backtop) backtop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- 语音 ---------- */
  var speech = window.speechSynthesis || null;
  function stopSpeech() { if (speech) speech.cancel(); duckSpeech(false); }
  function duckSpeech(on) {
    ducked = on;
    if (bgm && bgmOn) fadeTo(on ? 0.06 : 0.30, 500);
  }
  function speak(text, btn) {
    if (!speech) { alert("当前浏览器不支持语音朗读"); return; }
    stopSpeech();
    var u = new SpeechSynthesisUtterance(text);
    u.lang = "zh-CN"; u.rate = 0.9; u.pitch = 0.92;
    var vs = speech.getVoices().filter(function (v) { return /zh|Chinese/i.test(v.lang); });
    if (vs.length) u.voice = vs[0];
    u.onstart = function () { duckSpeech(true); if (btn) btn.textContent = "❚❚ 旁白中"; };
    u.onend = function () { duckSpeech(false); if (btn) btn.textContent = "▶ 听旁白"; };
    u.onerror = function () { duckSpeech(false); if (btn) btn.textContent = "▶ 听旁白"; };
    speech.speak(u);
  }

  /* ---------- HERO ---------- */
  var hero = $(".hero"), heroBg = $(".hero-bg"), heroEp = $("#heroEp"), heroCap = $("#heroCap");
  if (heroBg && STORIES.length) heroBg.style.backgroundImage = "url('" + STORIES[0].image + "')";
  if (heroCap && STORIES.length) heroCap.textContent = "EP.01 · " + STORIES[0].title;
  if (heroEp) STORIES.forEach(function (s) {
    var a = document.createElement("a");
    a.href = "#ep-" + s.ep; a.innerHTML = "<b>" + s.ep + "</b>" + s.title;
    heroEp.appendChild(a);
  });

  /* ---------- EPISODES ---------- */
  var epWrap = $("#episodes");
  if (epWrap) STORIES.forEach(function (s, i) {
    var el = document.createElement("article");
    el.className = "ep" + (i % 2 ? " rev" : "");
    el.id = "ep-" + s.ep;
    var dishesHtml = (s.dishes || []).map(function (name) {
      var d = DISHES.filter(function (x) { return x.name === name; })[0];
      if (!d) return "";
      return '<span class="ep-dish" data-name="' + d.name + '"><img src="' + d.img + '" alt="" />' + d.name + "</span>";
    }).join("");
    el.innerHTML =
      '<div class="ep-visual" style="background-image:url(\'' + s.image + '\')">' +
        '<span class="ep-no">EP.' + s.ep + "</span>" +
        '<span class="ep-cap">' + s.kicker + "</span>" +
        (s.image2 ? '<div class="ep-inset" style="background-image:url(\'' + s.image2 + '\')"></div>' : "") +
      "</div>" +
      '<div class="ep-text">' +
        '<span class="ep-kicker">' + s.kicker + "</span>" +
        "<h2>" + s.title + "</h2>" +
        s.paragraphs.map(function (p) { return "<p>" + p + "</p>"; }).join("") +
        '<blockquote class="ep-quote">' + s.quote + "</blockquote>" +
        '<div class="ep-dishes">' + dishesHtml + "</div>" +
        '<div class="ep-actions"><button class="ep-btn primary" type="button">▶ 听旁白</button><button class="ep-btn" type="button">■ 停止</button></div>' +
      "</div>";
    epWrap.appendChild(el);
    var btn = el.querySelector(".ep-btn.primary"), stop = el.querySelectorAll(".ep-btn")[1];
    if (btn) btn.addEventListener("click", function () { speak(s.narration, btn); });
    if (stop) stop.addEventListener("click", stopSpeech);
    el.addEventListener("click", function (e) {
      var chip = e.target.closest && e.target.closest(".ep-dish");
      if (chip) {
        var d = DISHES.filter(function (x) { return x.name === chip.dataset.name; })[0];
        if (d) openDish(d);
      }
    });
  });

  /* ---------- 菜系 ---------- */
  var strip = $("#cuisineStrip");
  if (strip) CUISINES.forEach(function (c) {
    var n = DISHES.filter(function (d) { return d.cuisine === c.name; }).length;
    var el = document.createElement("article");
    el.className = "cz-card";
    el.style.setProperty("--c", c.color);
    el.innerHTML = "<h3>" + c.name + "</h3><span class=\"en\">" + c.en + " · " + n + " 道</span><p>" + c.intro + "</p>";
    el.addEventListener("click", function () {
      setFilter(c.name);
      $("#dishes") && $("#dishes").scrollIntoView({ behavior: "smooth" });
    });
    strip.appendChild(el);
  });

  /* ---------- 菜品索引 ---------- */
  var indexWrap = $("#dishIndex"), filters = $("#dishFilters");
  function tile(d) {
    var el = document.createElement("article");
    el.className = "dish-tile";
    el.dataset.cuisine = d.cuisine;
    el.dataset.name = d.name;
    el.innerHTML = '<img src="' + d.img + '" alt="' + d.name + '" loading="lazy" /><div class="tile-shade"></div>' +
      '<div class="tile-info"><h3>' + d.name + "</h3><p>" + d.cuisine + " · " + d.flavor + "</p></div>";
    return el;
  }
  if (indexWrap) DISHES.forEach(function (d) { indexWrap.appendChild(tile(d)); });
  if (filters) {
    ["全部"].concat(CUISINES.map(function (c) { return c.name; })).forEach(function (name, i) {
      var b = document.createElement("button");
      b.className = "df-chip" + (i === 0 ? " active" : "");
      b.type = "button"; b.textContent = name; b.dataset.filter = name;
      b.addEventListener("click", function () { setFilter(name); });
      filters.appendChild(b);
    });
  }
  function setFilter(name) {
    if (filters) $$(".df-chip", filters).forEach(function (b) { b.classList.toggle("active", b.dataset.filter === name); });
    if (indexWrap) $$(".dish-tile", indexWrap).forEach(function (t) { t.style.display = (name === "全部" || t.dataset.cuisine === name) ? "" : "none"; });
  }
  if (indexWrap) indexWrap.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".dish-tile");
    if (!t) return;
    var d = DISHES.filter(function (x) { return x.name === t.dataset.name; })[0];
    if (d) openDish(d);
  });

  /* ---------- 影像 ---------- */
  var stage = $("#filmStage"), frame = $("#filmFrame"), poster = $("#filmPosterImg"),
      fTitle = $("#filmTitle"), fSub = $("#filmSub"), fList = $("#filmList"), playBtn = $("#filmPlayBtn");
  var current = 0;
  function posterFor(v) {
    var list = DISHES.filter(function (d) { return d.cuisine === v.cuisine; });
    return (list[0] || {}).img || (STORIES[0] || {}).image || "";
  }
  function selectFilm(i) {
    current = i; var v = VIDEOS[i]; if (!v) return;
    if (poster) poster.src = posterFor(v);
    if (fTitle) fTitle.textContent = v.title;
    if (fSub) fSub.textContent = v.cuisine + " · " + v.up + " · " + v.note;
    if (fList) $$(".fl-item", fList).forEach(function (b, k) { b.classList.toggle("on", k === i); });
    if (stage) { stage.classList.remove("playing"); if (frame) frame.innerHTML = ""; }
  }
  if (fList) VIDEOS.forEach(function (v, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "fl-item" + (i === 0 ? " on" : ""); b.textContent = v.cuisine + " · " + v.title;
    b.addEventListener("click", function () { selectFilm(i); });
    fList.appendChild(b);
  });
  if (playBtn) playBtn.addEventListener("click", function () {
    var v = VIDEOS[current]; if (!v || !frame || !stage) return;
    frame.innerHTML = '<iframe src="https://player.bilibili.com/player.html?isOutside=true&bvid=' + v.bv +
      '&autoplay=1&danmaku=0&high_quality=1" title="' + v.title + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    stage.classList.add("playing"); stopSpeech();
  });
  if (stage) selectFilm(0);

  /* ---------- 菜品详情 ---------- */
  var modal = $("#dishModal");
  function openDish(d) {
    if (!modal) return;
    $("#dmImg").src = d.img; $("#dmImg").alt = d.name;
    $("#dmCuisine").textContent = (d.region ? d.region + " · " : "") + d.cuisine;
    $("#dmName").textContent = d.name;
    $("#dmFlavor").textContent = "味型：" + d.flavor;
    $("#dmNarration").textContent = d.narration || (d.story + " 它的味道是" + d.flavor + "。");
    $("#dmIng").textContent = d.ingredients;
    var vid = $("#dmVideo"); if (vid) { vid.classList.remove("on"); vid.innerHTML = ""; }
    modal.classList.add("on"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
    setTimeout(function () { speak($("#dmNarration").textContent, $("#dmSpeak")); }, 260);
  }
  function closeDish() {
    if (!modal) return;
    stopSpeech(); modal.classList.remove("on"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = "";
  }
  var dmClose = $("#dmClose"); if (dmClose) dmClose.addEventListener("click", closeDish);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDish(); });
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) closeDish(); });
  var dmSpeak = $("#dmSpeak"); if (dmSpeak) dmSpeak.addEventListener("click", function () { speak($("#dmNarration").textContent, dmSpeak); });
  var dmStop = $("#dmStop"); if (dmStop) dmStop.addEventListener("click", stopSpeech);
  var dmVideoBtn = $("#dmVideoBtn");
  if (dmVideoBtn) dmVideoBtn.addEventListener("click", function () {
    var name = $("#dmName").textContent;
    var d = DISHES.filter(function (x) { return x.name === name; })[0];
    if (!d || !d.bv) { alert("这道菜的做法视频还在补充中"); return; }
    var host = $("#dmVideo");
    host.innerHTML = '<iframe src="https://player.bilibili.com/player.html?isOutside=true&bvid=' + d.bv + '&autoplay=1&danmaku=0&high_quality=1" title="' + d.name + ' 做法" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    host.classList.add("on"); stopSpeech();
  });

  /* ---------- 关系图谱 ---------- */
  var svg = $("#foodGraph");
  if (!svg) return;
  var panel = $("#graphPanel");
  var W = 1200, H = 760, CX = W / 2, CY = H / 2;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  var gLines = document.createElementNS(NS, "g"), gNodes = document.createElementNS(NS, "g");
  svg.appendChild(gLines); svg.appendChild(gNodes);
  var nodes = [], links = [], nodeMap = {};
  function addNode(id, label, type, extra, x, y) {
    if (nodeMap[id]) return nodeMap[id];
    var n = { id: id, label: label, type: type, x: x != null ? x : CX + (Math.random() - .5) * 420, y: y != null ? y : CY + (Math.random() - .5) * 340, vx: 0, vy: 0 };
    if (extra) for (var k in extra) n[k] = extra[k];
    nodes.push(n); nodeMap[id] = n; return n;
  }
  function addLink(s, t, rel) { if (nodeMap[s] && nodeMap[t]) links.push({ s: nodeMap[s], t: nodeMap[t], rel: rel }); }
  var REGION = { "川菜": "四川", "粤菜": "广东", "苏菜": "江苏", "鲁菜": "山东", "浙菜": "浙江", "闽菜": "福建", "湘菜": "湖南", "徽菜": "安徽" };
  var TECH = { "川菜": ["炒", "烧", "爆"], "粤菜": ["蒸", "煲", "灼"], "苏菜": ["炖", "煨", "蒸"], "鲁菜": ["爆", "炒", "烧"], "浙菜": ["炒", "蒸", "烩"], "闽菜": ["煨", "蒸", "炒"], "湘菜": ["炒", "蒸", "腊"], "徽菜": ["烧", "炖", "熏"] };
  var FEATURES = ["麻辣", "香辣", "咸鲜", "清鲜", "酸甜", "咸甜", "咸香", "酸香", "鲜香", "茶香", "发酵香", "重火功"];
  var flavorNodes = {};
  CUISINES.forEach(function (c, i) {
    var ang = i / CUISINES.length * Math.PI * 2 - Math.PI / 2, R = 260;
    var x = CX + Math.cos(ang) * R, y = CY + Math.sin(ang) * R * 0.78;
    addNode("cu:" + c.name, c.name, "cuisine", { color: c.color }, x, y);
    addNode("rg:" + REGION[c.name], REGION[c.name], "region", null, x + Math.cos(ang) * 70, y + Math.sin(ang) * 50);
    addLink("cu:" + c.name, "rg:" + REGION[c.name], "发源");
    (TECH[c.name] || []).forEach(function (t) {
      addNode("tc:" + c.name + ":" + t, t, "technique", null, x + Math.cos(ang) * 125, y + Math.sin(ang) * 95);
      addLink("cu:" + c.name, "tc:" + c.name + ":" + t, "常用技法");
    });
  });
  DISHES.forEach(function (d, i) {
    var ci = CUISINES.map(function (c) { return c.name; }).indexOf(d.cuisine);
    var ang = ci / CUISINES.length * Math.PI * 2 - Math.PI / 2;
    var x = CX + Math.cos(ang) * 260 + (Math.random() - .5) * 150, y = CY + Math.sin(ang) * 200 + (Math.random() - .5) * 120;
    addNode("dish:" + i, d.name, "dish", { img: d.img, flavor: d.flavor, cuisine: d.cuisine }, x, y);
    addLink("cu:" + d.cuisine, "dish:" + i, "归属");
    String(d.ingredients || "").split(/[、，,;；\/]/).map(function (s) { return s.trim(); }).filter(function (s) { return s && s.length > 1; }).forEach(function (ing) {
      addNode("ig:" + ing, ing, "ingredient", null, CX + Math.cos(ang) * 390 + (Math.random() - .5) * 200, CY + Math.sin(ang) * 310 + (Math.random() - .5) * 160);
      addLink("dish:" + i, "ig:" + ing, "主料");
    });
    FEATURES.forEach(function (f) {
      if (d.flavor.indexOf(f) < 0) return;
      if (!flavorNodes[f]) { flavorNodes[f] = 1; addNode("fl:" + f, f, "flavor", null, CX + (Math.random() - .5) * 650, CY + (Math.random() - .5) * 440); }
      addLink("dish:" + i, "fl:" + f, "味型");
    });
  });
  var alpha = 1;
  function tick() {
    var rep = 2300, spring = 0.022;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 1;
        if (d2 < 300000) { var f = rep / d2; a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f; }
      }
      a.vx *= 0.87; a.vy *= 0.87;
    }
    links.forEach(function (l) {
      var dx = l.t.x - l.s.x, dy = l.t.y - l.s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var f = (d - 82) * spring;
      l.s.vx += dx / d * f; l.s.vy += dy / d * f; l.t.vx -= dx / d * f; l.t.vy -= dy / d * f;
    });
    nodes.forEach(function (n) { n.x += n.vx * alpha; n.y += n.vy * alpha; n.x = Math.max(34, Math.min(W - 34, n.x)); n.y = Math.max(26, Math.min(H - 26, n.y)); });
    alpha *= 0.996;
  }
  var nodeEls = {}, linkEls = [];
  function build() {
    gLines.innerHTML = ""; gNodes.innerHTML = "";
    linkEls = links.map(function (l) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("fill", "none"); p.setAttribute("stroke", "rgba(243,234,216,.13)"); p.setAttribute("stroke-width", "1");
      gLines.appendChild(p); return { el: p, l: l };
    });
    nodes.forEach(function (n) {
      var g = document.createElementNS(NS, "g");
      var r = n.type === "cuisine" ? 18 : n.type === "dish" ? 9 : n.type === "region" ? 13 : n.type === "flavor" ? 8 : 5;
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", r); c.setAttribute("fill", n.color || COLOR[n.type] || "#888");
      c.setAttribute("stroke", n.type === "cuisine" ? "rgba(255,246,232,.85)" : "rgba(243,234,216,.3)");
      c.setAttribute("stroke-width", n.type === "cuisine" ? 2.4 : 1);
      g.appendChild(c);
      var t = document.createElementNS(NS, "text");
      t.textContent = n.label; t.setAttribute("y", -r - 6); t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", n.type === "cuisine" ? 16 : n.type === "dish" ? 11.5 : n.type === "region" ? 12 : 9.5);
      t.setAttribute("fill", (n.type === "cuisine" || n.type === "dish" || n.type === "region") ? "#f3ead8" : "rgba(243,234,216,.7)");
      t.setAttribute("class", "rg-label");
      if (n.type === "ingredient" || n.type === "technique") t.setAttribute("opacity", "0");
      g.appendChild(t);
      g.addEventListener("click", function (e) { e.stopPropagation(); showPanel(n); });
      gNodes.appendChild(g);
      nodeEls[n.id] = { g: g, c: c, t: t, n: n };
      enableDrag(g, n);
    });
  }
  function enableDrag(g, n) {
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    g.addEventListener("pointerdown", function (e) {
      dragging = true; svg.classList.add("dragging"); var pt = toLocal(e); sx = pt.x; sy = pt.y; ox = n.x; oy = n.y; alpha = Math.max(alpha, .4);
      g.setPointerCapture && g.setPointerCapture(e.pointerId);
    });
    g.addEventListener("pointermove", function (e) {
      if (!dragging) return; var pt = toLocal(e); n.x = ox + (pt.x - sx); n.y = oy + (pt.y - sy); n.vx = 0; n.vy = 0; render();
    });
    g.addEventListener("pointerup", function () { dragging = false; svg.classList.remove("dragging"); });
    g.addEventListener("pointerleave", function () { dragging = false; svg.classList.remove("dragging"); });
  }
  function toLocal(e) { var r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  function render() {
    linkEls.forEach(function (o) {
      var a = o.l.s, b = o.l.t, dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, cx = mx - dy / d * 18, cy = my + dx / d * 18;
      o.el.setAttribute("d", "M" + a.x + "," + a.y + " Q" + cx + "," + cy + " " + b.x + "," + b.y);
    });
    nodes.forEach(function (n) { var e = nodeEls[n.id]; if (e) e.g.setAttribute("transform", "translate(" + n.x + "," + n.y + ")"); });
  }
  var filterType = "all";
  function dim() {
    nodes.forEach(function (n) {
      var e = nodeEls[n.id]; if (!e) return;
      var on = filterType === "all" || n.type === filterType;
      e.c.setAttribute("opacity", on ? 1 : .1);
      e.t.setAttribute("opacity", on && (filterType !== "all" || n.type === "cuisine" || n.type === "dish" || n.type === "region" || n.type === "flavor") ? 1 : (on ? .25 : 0));
    });
  }
  $$(".gt-chip").forEach(function (b) {
    b.addEventListener("click", function () {
      filterType = b.dataset.g;
      $$(".gt-chip").forEach(function (x) { x.classList.toggle("active", x === b); });
      dim();
    });
  });
  function showPanel(n) {
    if (!panel) return;
    var rel = links.filter(function (l) { return l.s === n || l.t === n; });
    var items = rel.slice(0, 14).map(function (l) {
      var other = l.s === n ? l.t : l.s;
      return "<li>" + (l.s === n ? "→ " : "← ") + other.label + " <span style=\"color:#8a7f6b\">（" + l.rel + "）</span></li>";
    }).join("");
    panel.innerHTML = "<h4>" + n.label + "</h4><div class=\"gp-type\">" + n.type.toUpperCase() + (n.flavor ? " · " + n.flavor : "") + "</div><ul>" + (items || "<li>暂无关联</li>") + "</ul>";
    panel.classList.add("on");
  }
  svg.addEventListener("click", function () { panel && panel.classList.remove("on"); });
  build(); dim();
  (function loop() { tick(); render(); alpha = Math.max(alpha * 0.997, 0.006); requestAnimationFrame(loop); })();
  onScroll();
})();
