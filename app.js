/* 一饭一山河 · 六集美食纪录片 */
(function () {
  var D = window.FOOD_DATA || {};
  var STORIES = D.STORIES || [], CUISINES = D.CUISINES || [], DISHES = D.DISHES || [], VIDEOS = D.VIDEOS || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  var COLOR = { cuisine: "#c8402e", dish: "#c9a25c", ingredient: "#8f9d7a", region: "#6f8fa8", technique: "#a88f6f", flavor: "#d07a4a" };

  /* ---------- BGM ---------- */
  var bgm = $("#bgm"), bgmBtn = $("#bgmToggle");
  var bgmOn = false;
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
        fadeTo(0.28, 1800);
        if (bgmBtn) { bgmBtn.classList.add("playing"); bgmBtn.querySelector(".bgm-text").textContent = "音乐中"; }
      }).catch(function () { bgmOn = false; });
    } else {
      fadeTo(0, 500);
      setTimeout(function () { if (!bgmOn) bgm.pause(); }, 560);
      if (bgmBtn) { bgmBtn.classList.remove("playing"); bgmBtn.querySelector(".bgm-text").textContent = "音乐"; }
    }
  }
  if (bgmBtn) bgmBtn.addEventListener("click", function () { setBgm(!bgmOn); });
  document.addEventListener("pointerdown", function once(e) {
    document.removeEventListener("pointerdown", once);
    if (bgmOn) return;
    if (e.target.closest && e.target.closest("#bgmToggle")) return;
    setBgm(true);
  }, { once: true });

  /* ---------- 顶栏 ---------- */
  var topBar = $("#topBar");
  var backtop = $("#backtop");
  window.addEventListener("scroll", function () {
    if (topBar) topBar.classList.toggle("scrolled", window.scrollY > 30);
    if (backtop) backtop.classList.toggle("show", window.scrollY > window.innerHeight * 1.2);
  }, { passive: true });
  if (backtop) backtop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  /* ---------- 影片 ---------- */
  var film = $("#film"), now = $("#nowPlaying");
  var progress = document.createElement("div");
  progress.className = "progress";
  document.body.appendChild(progress);
  var cards = [];
  if (film) {
    var op = document.createElement("section");
    op.className = "opening";
    op.id = "opening";
    op.innerHTML =
      '<span class="op-seal"><span class="seal">食</span></span>' +
      '<p class="op-eyebrow">A DOCUMENTARY IN SIX PARTS</p>' +
      '<h1 class="op-title">一饭一山河</h1>' +
      '<p class="op-sub">六段关于中国人的食事</p>' +
      '<p class="op-meta">八大菜系 · 五十道菜 · 二十四组镜头</p>' +
      '<button class="op-play" id="opPlay" type="button">▶ 开始放映</button>' +
      '<p class="op-note">建议开启声音 · 原创配乐 · 真人旁白录制中</p>';
    film.appendChild(op);

    STORIES.forEach(function (s) {
      var card = document.createElement("section");
      card.className = "card";
      card.id = "ep-" + s.ep;
      card.dataset.ep = s.ep;
      card.innerHTML =
        '<p class="card-no">第 ' + s.ep + ' 集 · EPISODE ' + s.ep + "</p>" +
        '<p class="card-num">' + s.ep + "</p>" +
        '<h1 class="card-title">' + s.title + "</h1>" +
        '<p class="card-quote">“' + s.quote + '”</p>' +
        '<p class="card-en">' + s.kicker + "</p>";
      film.appendChild(card);
      cards.push(card);

      (s.shots || []).forEach(function (sh, idx) {
        var shot = document.createElement("section");
        shot.className = "shot";
        shot.dataset.ep = s.ep;
        shot.innerHTML =
          '<div class="shot-bg" style="background-image:url(\'' + sh.img + '\')"></div>' +
          '<div class="shot-shade"></div>' +
          '<span class="tc">' + sh.time + "</span>" +
          '<span class="shot-count">' + String(idx + 1).padStart(2, "0") + " / " + String(s.shots.length).padStart(2, "0") + "</span>" +
          '<span class="place">' + sh.place + "</span>" +
          '<p class="subtitle">' + sh.line + "</p>" +
          '<span class="shot-hint">SCROLL</span>';
        film.appendChild(shot);
      });
    });

    var credits = document.createElement("section");
    credits.className = "credits";
    credits.innerHTML =
      "<h2>一饭一山河</h2>" +
      "<p>撰稿 / 编辑 · 本站</p>" +
      "<p>摄影 · 公开资料整理</p>" +
      "<p>配乐 · 原创合成</p>" +
      "<p>旁白 · 真人录制中</p>" +
      "<p>出品 · 非官方美食文化档案</p>" +
      '<p class="end">一饭一山河</p>';
    film.appendChild(credits);

    // 进度点
    STORIES.forEach(function (s) {
      var i = document.createElement("i");
      i.dataset.ep = s.ep;
      i.title = "第 " + s.ep + " 集";
      i.addEventListener("click", function () {
        var el = document.getElementById("ep-" + s.ep);
        if (el) el.scrollIntoView({ behavior: "smooth" });
      });
      progress.appendChild(i);
    });

    var playBtn = $("#opPlay");
    if (playBtn) playBtn.addEventListener("click", function () {
      setBgm(true);
      var first = document.getElementById("ep-" + STORIES[0].ep);
      if (first) first.scrollIntoView({ behavior: "smooth" });
    });

    // 当前集
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (!en.isIntersecting) return;
        var ep = en.target.dataset.ep;
        if (!ep) return;
        var s = STORIES.filter(function (x) { return x.ep === ep; })[0];
        if (s && now) now.textContent = "第 " + s.ep + " 集 · " + s.title;
        $$("i", progress).forEach(function (i) { i.classList.toggle("on", i.dataset.ep === ep); });
      });
    }, { threshold: 0.35 });
    STORIES.forEach(function (s) {
      var c = document.getElementById("ep-" + s.ep);
      if (c) io.observe(c);
      $$('.shot[data-ep="' + s.ep + '"]').forEach(function (el) { io.observe(el); });
    });
  }

  /* ---------- 菜系 ---------- */
  var strip = $("#cuisineStrip");
  if (strip) CUISINES.forEach(function (c) {
    var n = DISHES.filter(function (d) { return d.cuisine === c.name; }).length;
    var el = document.createElement("article");
    el.className = "cz-card"; el.style.setProperty("--c", c.color);
    el.innerHTML = "<h3>" + c.name + "</h3><span class=\"en\">" + c.en + " · " + n + " 道</span><p>" + c.intro + "</p>";
    el.addEventListener("click", function () { setFilter(c.name); var x = $("#dishIndex"); if (x) x.scrollIntoView({ behavior: "smooth" }); });
    strip.appendChild(el);
  });

  /* ---------- 菜品索引 ---------- */
  var indexWrap = $("#dishIndex"), filters = $("#dishFilters");
  function tile(d) {
    var el = document.createElement("article");
    el.className = "dish-tile"; el.dataset.cuisine = d.cuisine; el.dataset.name = d.name;
    el.innerHTML = '<img src="' + d.img + '" alt="' + d.name + '" loading="lazy" /><div class="tile-shade"></div>' +
      '<div class="tile-info"><h3>' + d.name + "</h3><p>" + d.cuisine + " · " + d.flavor + "</p></div>";
    return el;
  }
  if (indexWrap) DISHES.forEach(function (d) { indexWrap.appendChild(tile(d)); });
  if (filters) ["全部"].concat(CUISINES.map(function (c) { return c.name; })).forEach(function (name, i) {
    var b = document.createElement("button");
    b.className = "df-chip" + (i === 0 ? " active" : ""); b.type = "button"; b.textContent = name; b.dataset.filter = name;
    b.addEventListener("click", function () { setFilter(name); });
    filters.appendChild(b);
  });
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

  /* ---------- 官方影像 ---------- */
  var stage = $("#filmStage"), frame = $("#filmFrame"), poster = $("#filmPosterImg"),
      fTitle = $("#filmTitle"), fSub = $("#filmSub"), fList = $("#filmList"), playBtn2 = $("#filmPlayBtn");
  var current = 0;
  function posterFor(v) {
    var list = DISHES.filter(function (d) { return d.cuisine === v.cuisine; });
    return (list[0] || {}).img || "";
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
  if (playBtn2) playBtn2.addEventListener("click", function () {
    var v = VIDEOS[current]; if (!v || !frame || !stage) return;
    frame.innerHTML = '<iframe src="https://player.bilibili.com/player.html?isOutside=true&bvid=' + v.bv +
      '&autoplay=1&danmaku=0&high_quality=1" title="' + v.title + '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    stage.classList.add("playing");
  });
  if (stage) selectFilm(0);

  /* ---------- 菜品弹窗 ---------- */
  var modal = $("#dishModal");
  function openDish(d) {
    if (!modal) return;
    $("#dmImg").src = d.img; $("#dmImg").alt = d.name;
    $("#dmCuisine").textContent = (d.region ? d.region + " · " : "") + d.cuisine;
    $("#dmName").textContent = d.name;
    $("#dmFlavor").textContent = "味型：" + d.flavor;
    $("#dmNarration").textContent = d.narration || d.story;
    $("#dmIng").textContent = d.ingredients;
    var vid = $("#dmVideo"); if (vid) { vid.classList.remove("on"); vid.innerHTML = ""; }
    modal.classList.add("on"); modal.setAttribute("aria-hidden", "false"); document.body.style.overflow = "hidden";
  }
  function closeDish() { if (modal) { modal.classList.remove("on"); modal.setAttribute("aria-hidden", "true"); document.body.style.overflow = ""; } }
  var dmClose = $("#dmClose"); if (dmClose) dmClose.addEventListener("click", closeDish);
  var dmClose2 = $("#dmClose2"); if (dmClose2) dmClose2.addEventListener("click", closeDish);
  if (modal) modal.addEventListener("click", function (e) { if (e.target === modal) closeDish(); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDish(); });
  var dmVideoBtn = $("#dmVideoBtn");
  if (dmVideoBtn) dmVideoBtn.addEventListener("click", function () {
    var name = $("#dmName").textContent;
    var d = DISHES.filter(function (x) { return x.name === name; })[0];
    if (!d || !d.bv) return;
    var host = $("#dmVideo");
    host.innerHTML = '<iframe src="https://player.bilibili.com/player.html?isOutside=true&bvid=' + d.bv + '&autoplay=1&danmaku=0&high_quality=1" title="' + d.name + ' 做法" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    host.classList.add("on");
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
  var fmap = {};
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
      if (!fmap[f]) { fmap[f] = 1; addNode("fl:" + f, f, "flavor", null, CX + (Math.random() - .5) * 640, CY + (Math.random() - .5) * 430); }
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
      p.setAttribute("fill", "none"); p.setAttribute("stroke", "rgba(244,236,219,.13)"); p.setAttribute("stroke-width", "1");
      gLines.appendChild(p); return { el: p, l: l };
    });
    nodes.forEach(function (n) {
      var g = document.createElementNS(NS, "g");
      var r = n.type === "cuisine" ? 17 : n.type === "dish" ? 8.5 : n.type === "region" ? 12 : n.type === "flavor" ? 7.5 : 4.5;
      var c = document.createElementNS(NS, "circle");
      c.setAttribute("r", r); c.setAttribute("fill", n.color || COLOR[n.type] || "#888");
      c.setAttribute("stroke", n.type === "cuisine" ? "rgba(255,246,232,.85)" : "rgba(244,236,219,.3)");
      c.setAttribute("stroke-width", n.type === "cuisine" ? 2.2 : 1); g.appendChild(c);
      var t = document.createElementNS(NS, "text");
      t.textContent = n.label; t.setAttribute("y", -r - 5); t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", n.type === "cuisine" ? 15 : n.type === "dish" ? 10.5 : n.type === "region" ? 11 : 9);
      t.setAttribute("fill", (n.type === "cuisine" || n.type === "dish" || n.type === "region") ? "#f4ecdb" : "rgba(244,236,219,.7)");
      t.setAttribute("class", "rg-label");
      if (n.type === "ingredient" || n.type === "technique") t.setAttribute("opacity", "0");
      g.appendChild(t);
      g.addEventListener("click", function (e) { e.stopPropagation(); showPanel(n); });
      gNodes.appendChild(g); nodeEls[n.id] = { g: g, c: c, t: t, n: n }; enableDrag(g, n);
    });
  }
  function enableDrag(g, n) {
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    g.addEventListener("pointerdown", function (e) { dragging = true; svg.classList.add("dragging"); var pt = toLocal(e); sx = pt.x; sy = pt.y; ox = n.x; oy = n.y; alpha = Math.max(alpha, .4); g.setPointerCapture && g.setPointerCapture(e.pointerId); });
    g.addEventListener("pointermove", function (e) { if (!dragging) return; var pt = toLocal(e); n.x = ox + (pt.x - sx); n.y = oy + (pt.y - sy); n.vx = 0; n.vy = 0; render(); });
    g.addEventListener("pointerup", function () { dragging = false; svg.classList.remove("dragging"); });
    g.addEventListener("pointerleave", function () { dragging = false; svg.classList.remove("dragging"); });
  }
  function toLocal(e) { var r = svg.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H }; }
  function render() {
    linkEls.forEach(function (o) {
      var a = o.l.s, b = o.l.t, dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, cx = mx - dy / d * 16, cy = my + dx / d * 16;
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
    b.addEventListener("click", function () { filterType = b.dataset.g; $$(".gt-chip").forEach(function (x) { x.classList.toggle("active", x === b); }); dim(); });
  });
  function showPanel(n) {
    if (!panel) return;
    var rel = links.filter(function (l) { return l.s === n || l.t === n; });
    var items = rel.slice(0, 14).map(function (l) { var other = l.s === n ? l.t : l.s; return "<li>" + (l.s === n ? "→ " : "← ") + other.label + " <span style=\"color:#8a7f6b\">（" + l.rel + "）</span></li>"; }).join("");
    panel.innerHTML = "<h4>" + n.label + "</h4><div class=\"gp-type\">" + n.type.toUpperCase() + (n.flavor ? " · " + n.flavor : "") + "</div><ul>" + (items || "<li>暂无关联</li>") + "</ul>";
    panel.classList.add("on");
  }
  svg.addEventListener("click", function () { if (panel) panel.classList.remove("on"); });
  build(); dim();
  (function loop() { tick(); render(); alpha = Math.max(alpha * 0.997, 0.006); requestAnimationFrame(loop); })();
})();
