/* 中华美食 · 各地风味档案 — 交互 */
(function () {
  var D = window.FOOD_DATA || {};
  var CUISINES = D.CUISINES || [];
  var DISHES = D.DISHES || [];
  var VIDEOS = D.VIDEOS || [];
  var HERO = D.HERO || [];

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------- 主题 ---------- */
  var theme = "day";
  try { theme = localStorage.getItem("food-theme") || "day"; } catch (e) {}
  document.documentElement.setAttribute("data-theme", theme);
  var themeBtn = $(".theme-toggle");
  if (themeBtn) themeBtn.addEventListener("click", function () {
    theme = theme === "day" ? "night" : "day";
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("food-theme", theme); } catch (e) {}
  });

  /* ---------- header ---------- */
  var header = $("#siteHeader");
  function onScroll() {
    if (header) header.classList.toggle("scrolled", window.scrollY > 10);
    if (backtop) backtop.classList.toggle("show", window.scrollY > 600);
  }

  /* ---------- hero ---------- */
  var slidesWrap = $("#heroSlides");
  var dotsWrap = $("#heroDots");
  var caption = $("#heroCaption");
  var heroIdx = 0, heroTimer = null;
  var heroNames = {};
  DISHES.forEach(function (d) { heroNames[d.img] = d.name; });
  if (slidesWrap && HERO.length) {
    HERO.forEach(function (src, i) {
      var div = document.createElement("div");
      div.className = "hero-slide" + (i === 0 ? " on" : "");
      div.style.backgroundImage = "url('" + src + "')";
      slidesWrap.appendChild(div);
      var dot = document.createElement("i");
      dot.addEventListener("click", function () { goHero(i); });
      if (dotsWrap) dotsWrap.appendChild(dot);
    });
    function goHero(i) {
      heroIdx = (i + HERO.length) % HERO.length;
      $$(".hero-slide", slidesWrap).forEach(function (el, k) { el.classList.toggle("on", k === heroIdx); });
      $$("i", dotsWrap).forEach(function (el, k) { el.classList.toggle("on", k === heroIdx); });
      if (caption) caption.textContent = heroNames[HERO[heroIdx]] || "";
      if (heroTimer) clearTimeout(heroTimer);
      heroTimer = setTimeout(function () { goHero(heroIdx + 1); }, 5200);
    }
    goHero(0);
  }
  var tagsWrap = $("#heroTags");
  if (tagsWrap) {
    CUISINES.forEach(function (c, i) {
      if (i) { var sep = document.createElement("i"); tagsWrap.appendChild(sep); }
      var s = document.createElement("span"); s.textContent = c.name; tagsWrap.appendChild(s);
    });
  }

  /* ---------- marquee ---------- */
  var mt = $("#marqueeTrack");
  if (mt) {
    var items = ["川菜 · 麻辣鲜香", "粤菜 · 清鲜本味", "苏菜 · 刀工汤火", "鲁菜 · 咸鲜高汤", "一地一风味", "一菜一山河"];
    var html = items.map(function (t) { return "<span>" + t + "</span>"; }).join("");
    mt.innerHTML = html + html;
  }

  /* ---------- flavor cards ---------- */
  var flavorGrid = $("#flavorGrid");
  if (flavorGrid) {
    CUISINES.forEach(function (c) {
      var card = document.createElement("article");
      card.className = "flavor-card reveal";
      card.style.setProperty("--c", c.color);
      card.innerHTML =
        "<h3>" + c.name + "</h3><span class=\"en\">" + c.en + "</span>" +
        "<p>" + c.intro + "</p>" +
        "<div class=\"tags\">" + c.tags.map(function (t) { return "<span>" + t + "</span>"; }).join("") + "</div>" +
        "<a class=\"go\" href=\"#cuisine-" + c.key + "\">查看菜系 →</a>";
      flavorGrid.appendChild(card);
    });
  }

  /* ---------- cuisine blocks ---------- */
  var blocks = $("#cuisineBlocks");
  var dishIndex = 0;
  function dishCard(d) {
    var color = (CUISINES.filter(function (c) { return c.name === d.cuisine; })[0] || {}).color || "var(--red)";
    var card = document.createElement("article");
    card.className = "dish-card reveal";
    card.style.setProperty("--c", color);
    card.dataset.idx = String(dishIndex++);
    card.innerHTML =
      "<img src=\"" + d.img + "\" alt=\"" + d.name + " · " + d.cuisine + "\" loading=\"lazy\" />" +
      "<div class=\"dish-body\"><h4>" + d.name + "</h4>" +
      "<p class=\"dish-flavor\">" + d.cuisine + " · " + d.flavor + "</p>" +
      "<p class=\"dish-ing\">" + d.ingredients + "</p></div>";
    return card;
  }
  if (blocks) {
    CUISINES.forEach(function (c) {
      var list = DISHES.filter(function (d) { return d.cuisine === c.name; });
      var block = document.createElement("section");
      block.className = "cuisine-block";
      block.id = "cuisine-" + c.key;
      block.style.setProperty("--c", c.color);
      block.innerHTML =
        "<div class=\"cuisine-head\"><span class=\"seal\" aria-hidden=\"true\">" + c.name.charAt(0) + "</span>" +
        "<h3>" + c.name + "</h3><span class=\"en\">" + c.en + " · " + list.length + " 道</span></div>" +
        "<p class=\"cuisine-intro\">" + c.intro + "</p>";
      var grid = document.createElement("div");
      grid.className = "dish-grid";
      list.forEach(function (d) { grid.appendChild(dishCard(d)); });
      block.appendChild(grid);
      blocks.appendChild(block);
    });
  }

  /* ---------- modal ---------- */
  var modal = $("#dishModal");
  function openDish(d) {
    if (!modal) return;
    $("#dmImg").src = d.img;
    $("#dmImg").alt = d.name;
    $("#dmCuisine").textContent = d.cuisine;
    $("#dmName").textContent = d.name;
    $("#dmFlavor").textContent = "味型：" + d.flavor;
    $("#dmIng").textContent = d.ingredients;
    $("#dmStory").textContent = d.story;
    $("#dmAlias").textContent = d.alias ? "又名：" + d.alias : "";
    modal.classList.add("on");
    modal.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }
  function closeDish() {
    if (!modal) return;
    modal.classList.remove("on");
    modal.setAttribute("aria-hidden", "true");
    document.body.style.overflow = "";
  }
  document.addEventListener("click", function (e) {
    var card = e.target.closest && e.target.closest(".dish-card");
    if (card) {
      var d = DISHES[Number(card.dataset.idx)];
      if (d) openDish(d);
    }
    if (modal && e.target === modal) closeDish();
  });
  var dmClose = $("#dmClose");
  if (dmClose) dmClose.addEventListener("click", closeDish);
  document.addEventListener("keydown", function (e) { if (e.key === "Escape") closeDish(); });

  /* ---------- films (single player) ---------- */
  var filmGrid = $("#filmGrid");
  var activeFilm = null;
  function stopFilm() {
    if (activeFilm && activeFilm.__cover !== undefined) {
      activeFilm.innerHTML = activeFilm.__cover;
      activeFilm.classList.remove("playing");
      activeFilm = null;
    }
  }
  if (filmGrid) {
    VIDEOS.forEach(function (v, i) {
      var color = (CUISINES.filter(function (c) { return c.name === v.cuisine; })[0] || {}).color || "#a8342a";
      var card = document.createElement("article");
      card.className = "film-card reveal";
      card.style.setProperty("--c", color);
      card.innerHTML =
        "<div class=\"film-cover\"><b>" + v.cuisine + "</b>" +
        "<div class=\"film-play\"><i>▶</i></div></div>" +
        "<div class=\"film-body\"><h4>" + v.title + "</h4><p>" + v.up + " · " + v.note + "</p></div>";
      var cover = card.querySelector(".film-cover");
      cover.__cover = cover.innerHTML;
      function play() {
        stopFilm();
        var host = card.querySelector(".film-cover");
        host.innerHTML = "<div class=\"film-frame\"><iframe src=\"https://player.bilibili.com/player.html?isOutside=true&bvid=" +
          v.bv + "&autoplay=1&danmaku=0&high_quality=1\" title=\"" + v.title +
          "\" allow=\"autoplay; fullscreen; encrypted-media; picture-in-picture\" allowfullscreen></iframe></div>";
        host.classList.add("playing");
        activeFilm = host;
      }
      cover.addEventListener("click", play);
      filmGrid.appendChild(card);
    });
  }

  /* ---------- reveal ---------- */
  var io = null;
  if ("IntersectionObserver" in window) {
    io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add("in"); io.unobserve(en.target); } });
    }, { threshold: 0.08, rootMargin: "0px 0px -6% 0px" });
    $$(".reveal").forEach(function (el) { io.observe(el); });
  } else {
    $$(".reveal").forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- backtop ---------- */
  var backtop = $("#backtop");
  if (backtop) backtop.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });

  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
})();
