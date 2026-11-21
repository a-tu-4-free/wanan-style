/*!
 * 萬安體製造所 — 介面控制
 */
(function () {
  'use strict';

  // 更新詞庫或程式後請同步修改此版本號（index.html 的 ?v= 也要一起改），避免使用者讀到舊快取
  var VERSION = '20261121-6';

  var DATA = {
    patterns: 'data/patterns.json',
    phrases: 'data/phrases.json',
    categories: 'data/categories.json',
    titles: 'data/titles.json',
    deflect: 'data/deflect.json',
    topics: [
      'data/topics_food.json',
      'data/topics_city.json',
      'data/topics_transport.json',
      'data/topics_politics.json',
      'data/topics_life.json',
      'data/topics_technology.json'
    ]
  };

  var $ = function (s) { return document.querySelector(s); };
  var chat = $('#chat'), messages = $('#messages'), welcome = $('#welcome');
  var form = $('#form'), input = $('#input'), sendBtn = $('#btn-send');
  var engine = null, titleEngine = null, busy = false, mode = 'speech';
  var PLACEHOLDER = {
    speech: '輸入詞彙，例如：披薩、路燈、外星人',
    angry: '輸入要強硬處理的事，例如：漏水、塞車',
    title: '輸入市政問題，例如：鼠患、停車、失戀'
  };
  var reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function sleep(ms) { return new Promise(function (r) { setTimeout(r, ms); }); }

  function loadJSON(url) {
    return fetch(url + '?v=' + VERSION, { cache: 'no-cache' }).then(function (r) {
      if (!r.ok) throw new Error(url + ' ' + r.status);
      return r.json();
    });
  }

  function loadData() {
    if (window.__WANAN_DATA__) return Promise.resolve(window.__WANAN_DATA__); // 單檔預覽版用
    return Promise.all([
      loadJSON(DATA.patterns), loadJSON(DATA.phrases), loadJSON(DATA.categories),
      loadJSON(DATA.titles), loadJSON(DATA.deflect), Promise.all(DATA.topics.map(loadJSON))
    ]).then(function (r) {
      return {
        patterns: r[0], phrases: r[1], categories: r[2], titles: r[3], deflect: r[4],
        topics: r[5].reduce(function (all, f) { return all.concat(f.topics || []); }, [])
      };
    });
  }

  /* ---------- 提示 ---------- */
  var toastTimer;
  function toast(msg) {
    var t = $('#toast');
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2200);
  }

  function showError(msg) {
    var box = document.createElement('div');
    box.className = 'error-box';
    box.textContent = msg;
    welcome.appendChild(box);
  }

  /* ---------- 範例詞 ---------- */
  function renderExamples() {
    var wrap = $('#examples');
    wrap.innerHTML = '';
    randomPrompts(8).forEach(function (name) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'chip'; b.textContent = name;
      b.addEventListener('click', function () { ask(name); });
      wrap.appendChild(b);
    });
  }

  function randomPrompts(n) {
    if (mode === 'title') return titleEngine.randomIssues(n);
    return engine.randomTopics(n, mode === 'angry');
  }

  function setMode(m) {
    mode = m;
    document.querySelectorAll('.mode').forEach(function (b) {
      var on = b.getAttribute('data-mode') === m;
      b.classList.toggle('active', on);
      b.setAttribute('aria-selected', on ? 'true' : 'false');
    });
    input.placeholder = PLACEHOLDER[m];
    if (engine && !welcome.hidden) renderExamples();
  }

  function isSensitive(q) {
    var s = engine.phrases.sensitive;
    return s && s.words.some(function (w) { return q.indexOf(w) >= 0; });
  }

  /* ---------- 訊息 ---------- */
  function scrollBottom() { chat.scrollTop = chat.scrollHeight; }

  function addUser(q) {
    var m = document.createElement('div');
    m.className = 'msg user';
    var b = document.createElement('div');
    b.className = 'bubble'; b.textContent = q;
    m.appendChild(b);
    messages.appendChild(m);
    scrollBottom();
  }

  function addBotShell() {
    var m = document.createElement('div');
    m.className = 'msg bot typing';
    m.innerHTML = '<span class="seal" aria-hidden="true">萬</span>' +
      '<div class="bot-col"><div class="bubble"><span class="tag"></span><p class="text"></p></div>' +
      '<div class="actions" hidden></div></div>';
    messages.appendChild(m);
    scrollBottom();
    return { el: m, tag: m.querySelector('.tag'), text: m.querySelector('.text'), actions: m.querySelector('.actions') };
  }

  function typeText(el, text) {
    if (reduceMotion) { el.textContent = text; return Promise.resolve(); }
    var chars = Array.from(text), i = 0;
    return new Promise(function (done) {
      (function step() {
        i = Math.min(chars.length, i + 3);
        el.textContent = chars.slice(0, i).join('');
        if (i % 30 < 3) scrollBottom();
        if (i < chars.length) requestAnimationFrame(step); else { scrollBottom(); done(); }
      })();
    });
  }

  function actionBtn(label, cls, fn) {
    var b = document.createElement('button');
    b.type = 'button'; b.textContent = label;
    if (cls) b.className = cls;
    b.addEventListener('click', fn);
    return b;
  }

  function setBusy(v) {
    busy = v;
    sendBtn.disabled = v;
  }

  /* ---------- 生成 ---------- */
  function ask(raw) {
    if (!engine || busy) return;
    var q = WananEngine.normalize(raw);
    if (!q) { input.focus(); return; }
    input.value = '';
    welcome.hidden = true;
    $('#btn-clear').hidden = false;
    addUser(q);
    if (isSensitive(q)) { replyPlain(engine.phrases.sensitive.reply); return; }
    engine.markTopic(q);
    answer(q, { mode: mode });
  }

  function replyPlain(text) {
    var ui = addBotShell();
    ui.el.classList.remove('typing');
    ui.text.textContent = text;
    scrollBottom();
  }

  function generate(q, opts) {
    if (opts.mode === 'title') return titleEngine.generate(q, { tier: opts.tier, stem: opts.stem });
    return engine.generate(q, { avoidStyle: opts.avoidStyle, mode: opts.mode });
  }

  function answer(q, opts) {
    setBusy(true);
    var res = generate(q, opts);
    var ui = addBotShell();
    if (res.mode === 'angry') ui.el.classList.add('angry');
    return sleep(reduceMotion ? 0 : 450 + Math.random() * 400).then(function () {
      ui.el.classList.remove('typing');
      ui.tag.textContent = res.style;
      return typeText(ui.text, res.text);
    }).then(function () {
      ui.actions.appendChild(actionBtn('📋 複製文字', '', function () { onCopyText(res); }));
      ui.actions.appendChild(actionBtn('📸 截圖分享', 'primary', function () { onShot(res); }));
      if (res.mode === 'title') {
        ui.actions.appendChild(actionBtn('⬆ 職務升級', '', function () {
          if (busy) return;
          if (res.tier >= 4) { toast('已是最高職級，更高職級的設置持續研議中'); return; }
          answer(res.question, { mode: 'title', tier: res.tier + 1, stem: res.stem });
        }));
      }
      ui.actions.appendChild(actionBtn('🔄 再來一版', '', function () {
        if (!busy) answer(res.question, { mode: res.mode, avoidStyle: res.styleId });
      }));
      ui.actions.hidden = false;
      scrollBottom();
      setBusy(false);
      if (!window.matchMedia('(pointer: coarse)').matches) input.focus();
    });
  }

  /* ---------- 複製與分享 ---------- */
  function onCopyText(res) {
    var text = '問：' + res.question + '\n\n' + res.text +
      '\n\n—— 萬安體製造所（戲仿創作，非本人發言）\n' + location.href.split('#')[0];
    WananShare.copyText(text).then(function () { toast('已複製文字'); }, function () { toast('複製失敗，請手動選取文字'); });
  }

  var currentCanvas = null;

  function onShot(res) {
    var canvas = WananShare.drawCard({ question: res.question, answer: res.text, tag: res.style });
    // 桌機：直接複製到剪貼簿；手機或不支援：開預覽視窗
    if (!WananShare.isTouch() && WananShare.canCopyImage()) {
      try {
        WananShare.copyImage(canvas).then(function () {
          toast('圖片已複製，可直接貼到社群');
        }, function () { openModal(canvas); });
        return;
      } catch (e) { /* 改用預覽視窗 */ }
    }
    openModal(canvas);
  }

  function openModal(canvas) {
    currentCanvas = canvas;
    $('#modal-img').src = canvas.toDataURL('image/png');
    $('#m-share').hidden = !WananShare.canShareFile();
    $('#m-copy').hidden = !WananShare.canCopyImage();
    $('#modal').hidden = false;
  }

  function closeModal() { $('#modal').hidden = true; currentCanvas = null; }

  $('#m-close').addEventListener('click', closeModal);
  $('#modal').addEventListener('click', function (e) { if (e.target.id === 'modal') closeModal(); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
  $('#m-download').addEventListener('click', function () {
    if (currentCanvas) { WananShare.download(currentCanvas); toast('已下載圖片'); }
  });
  $('#m-copy').addEventListener('click', function () {
    if (!currentCanvas) return;
    WananShare.copyImage(currentCanvas).then(function () { toast('圖片已複製'); }, function () { toast('此瀏覽器無法複製圖片，請改用下載'); });
  });
  $('#m-share').addEventListener('click', function () {
    if (!currentCanvas) return;
    WananShare.shareFile(currentCanvas).catch(function (e) {
      if (e && e.name !== 'AbortError') toast('分享失敗，請改用下載');
    });
  });

  /* ---------- 事件 ---------- */
  form.addEventListener('submit', function (e) { e.preventDefault(); ask(input.value); });

  $('#btn-random').addEventListener('click', function () {
    if (!engine || busy) return;
    ask(randomPrompts(1)[0]);
  });

  document.querySelectorAll('.mode').forEach(function (b) {
    b.addEventListener('click', function () { setMode(b.getAttribute('data-mode')); input.focus(); });
  });

  $('#btn-clear').addEventListener('click', function () {
    if (busy) return;
    messages.innerHTML = '';
    welcome.hidden = false;
    $('#btn-clear').hidden = true;
    renderExamples();
  });

  /* ---------- 啟動 ---------- */
  loadData().then(function (data) {
    engine = new WananEngine(data);
    titleEngine = new WananTitleEngine(engine, data.titles);
    renderExamples();
    var hash = decodeURIComponent((location.hash || '').slice(1));
    if (hash) ask(hash); // 支援 #披薩 直接生成
  }).catch(function (err) {
    console.error(err);
    showError(location.protocol === 'file:'
      ? '直接雙擊檔案無法讀取詞庫，請在專案資料夾執行「python -m http.server」後，用 http://localhost:8000 開啟。'
      : '詞庫載入失敗，請重新整理頁面。');
  });
})();
