/* 中华美食 · 各地风味档案 — 纪录片式交互 */
(function () {
  var D = window.FOOD_DATA || {};
  var CUISINES = D.CUISINES || [], DISHES = D.DISHES || [], VIDEOS = D.VIDEOS || [], HERO = D.HERO || [];
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var NS = "http://www.w3.org/2000/svg";
  var COLOR = { cuisine: "#c8402e", dish: "#c9a35c", ingredient: "#8f9d7a", region: "#6f8fa8", technique: "#a88f6f" };

  /* ---------- 主题 ---------- */
  var root = document.documentElement;
  try { if (localStorage.getItem("food-theme") === "light") root.classList.add("light"); } catch (e) {}
  var tb = $(".theme-toggle");
  if (tb) tb.addEventListener("click", function () {
    root.classList.toggle("light");
    try { localStorage.setItem("food-theme", root.classList.contains("light") ? "light" : "dark"); } catch (e) {}
  });

  /* ---------- 顶栏 / 回顶 ---------- */
  var topBar = $("#topBar"), backtop = $("#backtop");
  function onScroll() {
    if (topBar) topBar.classList.toggle("scrolled", window.scrollY > 40);
    if (backtop) backtop.classList.toggle("show", window.scrollY > 700);
  }
  if (backtop) backtop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
  window.addEventListener("scroll", onScroll, { passive: true });

  /* ---------- HERO ---------- */
  var hs = $("#heroSlides"), hd = $("#heroDots"), hc = $("#heroCap");
  var nameByImg = {};
  DISHES.forEach(function (d) { nameByImg[d.img] = d.name; });
  if (hs && HERO.length) {
    HERO.forEach(function (src, i) {
      var s = document.createElement("div");
      s.className = "hero-slide" + (i === 0 ? " on" : "");
      s.style.backgroundImage = "url('" + src + "')";
      hs.appendChild(s);
      var dot = document.createElement("i");
      if (i === 0) dot.className = "on";
      dot.addEventListener("click", function () { go(i); });
      hd && hd.appendChild(dot);
    });
    var idx = 0, timer = null;
    function go(i) {
      idx = (i + HERO.length) % HERO.length;
      $$(".hero-slide", hs).forEach(function (el, k) { el.classList.toggle("on", k === idx); });
      hd && $$("i", hd).forEach(function (el, k) { el.classList.toggle("on", k === idx); });
      if (hc) hc.textContent = nameByImg[HERO[idx]] || "";
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () { go(idx + 1); }, 5600);
    }
    go(0);
  }

  /* ---------- 菜系章节 ---------- */
  var chapterList = $("#chapterList");
  if (chapterList) {
    var cn = ["壹", "贰", "叁", "肆"];
    CUISINES.forEach(function (c, i) {
      var list = DISHES.filter(function (d) { return d.cuisine === c.name; });
      var cover = (list[0] || {}).img || HERO[i] || "";
      var panel = document.createElement("article");
      panel.className = "chapter-panel";
      panel.style.setProperty("--c", c.color);
      panel.innerHTML =
        '<div class="chapter-bg" style="background-image:url(\'' + cover + '\')"></div>' +
        '<div class="chapter-shade"></div>' +
        '<div class="chapter-inner">' +
        '<span class="chapter-no">' + cn[i] + "</span>" +
        '<h2 class="chapter-name">' + c.name + "</h2>" +
        '<p class="chapter-en">' + c.en + " · " + list.length + " DISHES</p>" +
        '<p class="chapter-intro">' + c.intro + "</p>" +
        '<div class="chapter-tags">' + c.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") + "</div>" +
        '<a class="chapter-go" href="#dishes" data-cuisine="' + c.name + '">查看这 ' + list.length + ' 道菜 →</a>' +
        "</div>";
      chapterList.appendChild(panel);
    });
    chapterList.addEventListener("click", function (e) {
      var a = e.target.closest && e.target.closest(".chapter-go");
      if (a) { setFilter(a.dataset.cuisine); }
    });
  }

  /* ---------- 菜品墙 ---------- */
  var wall = $("#dishWall"), filters = $("#dishFilters");
  function tile(d) {
    var el = document.createElement("article");
    el.className = "dish-tile";
    el.dataset.cuisine = d.cuisine;
    el.innerHTML =
      '<img src="' + d.img + '" alt="' + d.name + '" loading="lazy" />' +
      '<div class="tile-shade"></div>' +
      '<div class="tile-info"><h3>' + d.name + "</h3><p>" + d.cuisine + " · " + d.flavor + "</p></div>";
    return el;
  }
  DISHES.forEach(function (d) { wall && wall.appendChild(tile(d)); });
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
    if (wall) $$(".dish-tile", wall).forEach(function (t) { t.classList.toggle("hide", name !== "全部" && t.dataset.cuisine !== name); });
  }

  /* ---------- 技法 ---------- */
  var skills = [["炒","旺火快翻"],["爆","极短锁脆"],["熘","勾芡裹汁"],["炸","外酥里嫩"],["烹","先煎后汁"],["煎","两面金黄"],["烧","先煸后焖"],["焖","加盖慢煨"],["炖","小火长时"],["蒸","以汽存味"],["烤","明火焦香"],["拌","冷调生香"]];
  var sr = $("#skillRow");
  if (sr) skills.forEach(function (s) {
    var el = document.createElement("span"); el.innerHTML = s[0] + "<small>" + s[1] + "</small>"; sr.appendChild(el);
  });

  /* ---------- 影像 ---------- */
  var stage = $("#filmStage"), frame = $("#filmFrame"), poster = $("#filmPosterImg"),
      fTitle = $("#filmTitle"), fSub = $("#filmSub"), fList = $("#filmList"), playBtn = $("#filmPlayBtn");
  var current = 0;
  function posterFor(v) {
    var list = DISHES.filter(function (d) { return d.cuisine === v.cuisine; });
    return (list[0] || {}).img || HERO[0] || "";
  }
  function selectFilm(i) {
    current = i;
    var v = VIDEOS[i]; if (!v) return;
    if (poster) poster.src = posterFor(v);
    if (fTitle) fTitle.textContent = v.title;
    if (fSub) fSub.textContent = v.cuisine + " · " + v.up + " · " + v.note;
    if (fList) $$(".fl-item", fList).forEach(function (b, k) { b.classList.toggle("on", k === i); });
    if (stage) {
      stage.classList.remove("playing");
      if (frame) frame.innerHTML = "";
    }
  }
  function playFilm() {
    var v = VIDEOS[current]; if (!v || !frame || !stage) return;
    frame.innerHTML = '<iframe src="https://player.bilibili.com/player.html?isOutside=true&bvid=' + v.bv +
      '&autoplay=1&danmaku=0&high_quality=1" title="' + v.title +
      '" allow="autoplay; fullscreen; encrypted-media; picture-in-picture" allowfullscreen></iframe>';
    stage.classList.add("playing");
  }
  if (fList) VIDEOS.forEach(function (v, i) {
    var b = document.createElement("button");
    b.type = "button"; b.className = "fl-item" + (i === 0 ? " on" : "");
    b.textContent = v.cuisine + " · " + v.title;
    b.addEventListener("click", function () { selectFilm(i); });
    fList.appendChild(b);
  });
  if (playBtn) playBtn.addEventListener("click", playFilm);
  if (stage) selectFilm(0);

  /* ---------- 弹窗 ---------- */
  var modal = $("#dishModal");
  function openDish(d) {
    if (!modal) return;
    $("#dmImg").src = d.img; $("#dmImg").alt = d.name;
    $("#dmCuisine").textContent = d.cuisine;
    $("#dmName").textContent = d.name;
    $("#dmFlavor").textContent = "味型：" + d.flavor;
    $("#dmIng").textContent = d.ingredients;
    $("#dmStory").textContent = d.story;
    $("#dmAlias").textContent = d.alias ? "又名：" + d.alias : "";
    modal.classList.add("on"); modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDish() {
    if (!modal) return;
    modal.classList.remove("on"); modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.addEventListener("click", function (e) {
    var t = e.target.closest && e.target.closest(".dish-tile");
    if (t && wall) {
      var idx = $$(".dish-tile", wall).indexOf(t);
      var d = DISHES.filter(function (x) { return !t.classList.contains("hide") ? true : false; })[idx];
      // 直接按 data 匹配，避免过滤后错位
      var name = t.querySelector("h3") && t.querySelector("h3").textContent;
      var match = DISHES.filter(function (x) { return x.name === name; })[0];
      if (match) openDish(match);
    }
    if (modal && e.target === modal) closeDish();
  });
  var dmClose = $("#dmClose"); if (dmClose) dmClose.addEventListener("click", closeDish);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDish(); });

  /* ---------- 关系图谱 ---------- */
  var svg = $("#foodGraph");
  if (!svg) return;
  var panel = $("#graphPanel");
  var W = 1000, H = 620;
  svg.setAttribute("viewBox", "0 0 " + W + " " + H);
  var gLines = document.createElementNS(NS, "g");
  var gNodes = document.createElementNS(NS, "g");
  svg.appendChild(gLines); svg.appendChild(gNodes);

  var nodes = [], links = [], nodeMap = {};
  function addNode(id, label, type, extra) {
    if (nodeMap[id]) return nodeMap[id];
    var n = { id: id, label: label, type: type, x: W / 2 + (Math.random() - .5) * 300, y: H / 2 + (Math.random() - .5) * 240, vx: 0, vy: 0 };
    if (extra) for (var k in extra) n[k] = extra[k];
    nodes.push(n); nodeMap[id] = n; return n;
  }
  function addLink(s, t, rel) { links.push({ s: nodeMap[s], t: nodeMap[t], rel: rel }); }

  var REGION = { "川菜": "四川", "粤菜": "广东", "苏菜": "江苏", "鲁菜": "山东" };
  var TECH = { "川菜": ["炒", "烧", "爆"], "粤菜": ["蒸", "煲", "灼"], "苏菜": ["炖", "煨", "蒸"], "鲁菜": ["爆", "炒", "烧"] };
  CUISINES.forEach(function (c) {
    addNode("cu:" + c.name, c.name, "cuisine", { color: c.color });
    addNode("rg:" + REGION[c.name], REGION[c.name], "region");
    addLink("cu:" + c.name, "rg:" + REGION[c.name], "发源");
    (TECH[c.name] || []).forEach(function (t) {
      var tid = "tc:" + t;
      addNode(tid, t, "technique");
      addLink("cu:" + c.name, tid, "常用技法");
    });
  });
  DISHES.forEach(function (d, i) {
    var did = "dish:" + i;
    addNode(did, d.name, "dish", { img: d.img, flavor: d.flavor, cuisine: d.cuisine });
    addLink("cu:" + d.cuisine, did, "归属");
    String(d.ingredients || "").split(/[、，,;；\/]/).map(function (x) { return x.trim(); }).filter(function (x) { return x && x.length > 1; }).forEach(function (ing) {
      var iid = "ig:" + ing;
      addNode(iid, ing, "ingredient");
      addLink(did, iid, "主料");
    });
  });

  // 简单力导向
  var alpha = 1;
  function tick() {
    var k = 0.02, rep = 2600, spring = 0.02, center = 0.012;
    for (var i = 0; i < nodes.length; i++) {
      var a = nodes[i];
      for (var j = i + 1; j < nodes.length; j++) {
        var b = nodes[j], dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy + 1;
        if (d2 < 240000) {
          var f = rep / d2;
          a.vx += dx * f; a.vy += dy * f; b.vx -= dx * f; b.vy -= dy * f;
        }
      }
      a.vx += (W / 2 - a.x) * center; a.vy += (H / 2 - a.y) * center;
      a.vx *= 0.86; a.vy *= 0.86;
    }
    links.forEach(function (l) {
      var dx = l.t.x - l.s.x, dy = l.t.y - l.s.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
      var f = (d - 90) * spring;
      l.s.vx += dx / d * f; l.s.vy += dy / d * f;
      l.t.vx -= dx / d * f; l.t.vy -= dy / d * f;
    });
    nodes.forEach(function (n) {
      n.x += n.vx * alpha; n.y += n.vy * alpha;
      n.x = Math.max(30, Math.min(W - 30, n.x)); n.y = Math.max(24, Math.min(H - 24, n.y));
    });
    alpha *= 0.992;
  }

  var nodeEls = {}, lineEls = [];
  function build() {
    gLines.innerHTML = ""; gNodes.innerHTML = "";
    lineEls = links.map(function (l) {
      var ln = document.createElementNS(NS, "line");
      ln.setAttribute("stroke", "rgba(242,234,217,.14)");
      ln.setAttribute("stroke-width", "1");
      gLines.appendChild(ln); return { el: ln, l: l };
    });
    nodes.forEach(function (n) {
      var g = document.createElementNS(NS, "g");
      g.style.cursor = "pointer";
      var c = document.createElementNS(NS, "circle");
      var r = n.type === "cuisine" ? 15 : n.type === "dish" ? 8 : n.type === "region" ? 11 : 5;
      c.setAttribute("r", r);
      c.setAttribute("fill", n.color || COLOR[n.type] || "#888");
      c.setAttribute("stroke", "rgba(242,234,217,.35)");
      c.setAttribute("stroke-width", n.type === "cuisine" ? 2 : 1);
      g.appendChild(c);
      var t = document.createElementNS(NS, "text");
      t.textContent = n.label;
      t.setAttribute("x", 0); t.setAttribute("y", -r - 5);
      t.setAttribute("text-anchor", "middle");
      t.setAttribute("font-size", n.type === "cuisine" ? 14 : n.type === "dish" ? 11 : 9);
      t.setAttribute("fill", n.type === "cuisine" || n.type === "dish" || n.type === "region" ? "#f2ead9" : "rgba(242,234,217,.65)");
      t.setAttribute("class", "rg-label");
      if (n.type === "ingredient" || n.type === "technique") t.setAttribute("opacity", "0");
      g.appendChild(t); g.appendChild(c);
      g.addEventListener("click", function (e) { e.stopPropagation(); showPanel(n); });
      gNodes.appendChild(g);
      nodeEls[n.id] = { g: g, c: c, t: t, n: n };
      enableDrag(g, n);
    });
  }

  function enableDrag(g, n) {
    var dragging = false, sx = 0, sy = 0, ox = 0, oy = 0;
    g.addEventListener("pointerdown", function (e) {
      dragging = true; svg.classList.add("dragging");
      var pt = toLocal(e); sx = pt.x; sy = pt.y; ox = n.x; oy = n.y;
      g.setPointerCapture && g.setPointerCapture(e.pointerId);
    });
    g.addEventListener("pointermove", function (e) {
      if (!dragging) return;
      var pt = toLocal(e); n.x = ox + (pt.x - sx); n.y = oy + (pt.y - sy);
      n.vx = 0; n.vy = 0; alpha = Math.max(alpha, .35); render();
    });
    g.addEventListener("pointerup", function () { dragging = false; svg.classList.remove("dragging"); });
    g.addEventListener("pointerleave", function () { dragging = false; svg.classList.remove("dragging"); });
  }
  function toLocal(e) {
    var r = svg.getBoundingClientRect();
    return { x: (e.clientX - r.left) / r.width * W, y: (e.clientY - r.top) / r.height * H };
  }

  function render() {
    lineEls.forEach(function (o) {
      o.el.setAttribute("x1", o.l.s.x); o.el.setAttribute("y1", o.l.s.y);
      o.el.setAttribute("x2", o.l.t.x); o.el.setAttribute("y2", o.l.t.y);
    });
    nodes.forEach(function (n) {
      var e = nodeEls[n.id]; if (!e) return;
      e.g.setAttribute("transform", "translate(" + n.x + "," + n.y + ")");
    });
  }

  var filterType = "all";
  function dim() {
    nodes.forEach(function (n) {
      var e = nodeEls[n.id]; if (!e) return;
      var on = filterType === "all" || n.type === filterType;
      e.c.setAttribute("opacity", on ? 1 : .14);
      e.t.setAttribute("opacity", on && (filterType !== "all" || n.type === "cuisine" || n.type === "dish" || n.type === "region") ? 1 : (on ? .85 : 0));
      if (filterType !== "all") e.t.setAttribute("opacity", on ? 1 : 0);
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
    var items = rel.slice(0, 12).map(function (l) {
      var other = l.s === n ? l.t : l.s;
      return "<li>" + (l.s === n ? "→ " : "← ") + other.label + " <span style=\"color:#8a7f6b\">（" + l.rel + "）</span></li>";
    }).join("");
    panel.innerHTML = "<h4>" + n.label + "</h4><div class=\"gp-type\">" + n.type.toUpperCase() + (n.flavor ? " · " + n.flavor : "") + "</div>" +
      "<ul>" + (items || "<li>暂无关联</li>") + "</ul>";
    panel.classList.add("on");
  }
  svg.addEventListener("click", function () { panel && panel.classList.remove("on"); });

  build();
  var raf = null;
  function loop() {
    tick(); render();
    if (alpha > 0.02) raf = requestAnimationFrame(loop);
    else raf = null;
  }
  loop();
  onScroll();
})();
