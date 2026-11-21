/*!
 * 萬安體製造所 — 生成引擎
 * 流程：標準化 → 關鍵詞辨識 → 主題分類 → 語意延伸 → 句型選擇 → 組合 → 防重複
 * 純前端、無外部依賴。所有輸出均為戲仿創作。
 */
(function (root) {
  'use strict';

  /* ---------- 簡轉繁（只處理常見字，供關鍵詞比對） ---------- */
  var S2T = {
    '这':'這','么':'麼','个':'個','们':'們','时':'時','间':'間','问':'問','题':'題','发':'發','会':'會','机':'機','场':'場',
    '电':'電','脑':'腦','车':'車','铁':'鐵','饭':'飯','汤':'湯','鸡':'雞','猫':'貓','结':'結','觉':'覺','买':'買','宠':'寵',
    '网':'網','络':'絡','资':'資','讯':'訊','选':'選','举':'舉','议':'議','党':'黨','预':'預','树':'樹','灯':'燈','沟':'溝',
    '区':'區','园':'園','厕':'廁','积':'積','马':'馬','桥':'橋','线':'線','运':'運','飞':'飛','戏':'戲','乐':'樂','卖':'賣',
    '过':'過','红':'紅','礼':'禮','饮':'飲','萨':'薩','汉':'漢','寿':'壽','烧':'燒','猪':'豬','鱼':'魚','虾':'蝦','热':'熱',
    '学':'學','习':'習','读':'讀','书':'書','试':'試','动':'動','长':'長','开':'開','关':'關','门':'門','医':'醫','药':'藥',
    '钱':'錢','银':'銀','业':'業','产':'產','团':'團','队':'隊','图':'圖','馆':'館','国':'國','体':'體','头':'頭','后':'後',
    '东':'東','义':'義','脸':'臉','视':'視','频':'頻','声':'聲','应':'應','对':'對','话':'話','说':'說','点':'點','赛':'賽',
    '篮':'籃','员':'員','厂':'廠','级':'級','厅':'廳','饺':'餃','蛋':'蛋','炉':'爐','锅':'鍋','烟':'煙','吸':'吸','垃':'垃',
    '圾':'圾','爱':'愛','怀':'懷','约':'約','龙':'龍','灾':'災','风':'風','台':'台','湾':'灣','亚':'亞','韩':'韓','罢':'罷',
    '众':'眾','领':'領','导':'導','纸':'紙','贵':'貴','质':'質','设':'設','备':'備','计':'計','划':'劃','环':'環','标':'標',
    '游':'遊','双':'雙','巨':'巨','军':'軍','农':'農','养':'養','脚':'腳','踏':'踏','递':'遞','邮':'郵','岁':'歲','节':'節'
  };

  var STYLES = [
    { id: 'standard',  name: '標準萬安體',     w: 3,   seq: ['open', 'core', 'support?', 'close'] },
    { id: 'open',      name: '開放態度型',     w: 2.2, seq: ['open:open', 'core:open', 'core?', 'close'] },
    { id: 'immediate', name: '即刻處理型',     w: 2,   seq: ['open:immediate', 'core:immediate', 'support', 'close'], bonus: 1 },
    { id: 'crossdept', name: '跨局處協調型',   w: 2,   seq: ['open', 'core:crossdept', 'core?', 'support', 'close'] },
    { id: 'long',      name: '長篇完整說明型', w: 1.4, seq: ['open', 'core', 'support', 'core', 'support', 'close'], bonus: 1 },
    { id: 'rebut',     name: '反擊質疑型',     w: 1.5, seq: ['open:rebut', 'core', 'support:rebut', 'close'] },
    { id: 'absurd',    name: '荒謬延伸型',     w: 0.8, seq: ['open', 'core', 'core:absurd', 'close'], absurd: true },
    { id: 'vision',    name: '願景收尾型',     w: 1.3, seq: ['open', 'core', 'support?', 'close:vision'] },
    { id: 'stack',     name: '官腔疊加型',     w: 1.6, seq: ['open:stack', 'core:stack', 'support:loop', 'close'] },
    { id: 'loop',      name: '無限循環型',     w: 1.4, seq: ['open', 'core', 'support:loop', 'close:loop'] },
    { id: 'inspect',   name: '過度精密行政型', w: 1.6, seq: ['open', 'core:inspect', 'support?', 'close'] },
    { id: 'full',      name: '完整萬安體',     w: 1.8, seq: ['open:emergency', 'core:personal', 'core:visit', 'support:system', 'core:data?', 'close:grand'], bonus: 1 },
    { id: 'debate',    name: '議會答詢型',     w: 1.4, seq: ['open', 'core:data', 'core:rebut2', 'support?', 'close:grand'] },
    { id: 'duty',      name: '責任承擔型',     w: 1.2, seq: ['open', 'core:duty', 'support:system', 'close:duty'] },
    { id: 'deflect',   name: '問A答B型',       w: 8, seq: ['open:cut', 'core:deflect', 'support:blame', 'close:deflect'] },
    { id: 'other',     name: '別縣市議題型', w: 2, seq: ['open:other', 'core:other', 'core:deflect?', 'support:otherS', 'close:other'], needOther: true },
    { id: 'h_other',   name: '強硬模式・別縣市型', w: 2, seq: ['open:hother', 'core:hother', 'close:hrebut'], mode: 'angry', needOther: true },
    { id: 'escape',    name: '逃跑型',         w: 3,   seq: ['open:escape', 'core:escape', 'support:escape?', 'close:escape'] },
    { id: 'law',       name: '亂套法律型',     w: 2.5, seq: ['open', 'core:law', 'support:law?', 'close'] },
    { id: 'result',    name: '成果包裝型',     w: 2,   seq: ['open', 'core:result', 'support:result', 'close:result'] },
    { id: 'combo',     name: '逃跑×亂套型',    w: 2.5, seq: ['open:combo', 'core:law', 'core:result?', 'support:escape', 'close:escape'] },
    { id: 'cut',       name: '事件切割型',     w: 3,   seq: ['open:cut', 'core', 'support:blame', 'close'] },
    { id: 'news',      name: '新聞標題型',     w: 1.6, seq: ['open', 'core', 'core?', 'support', 'close'], patternMode: 'news', headline: true },
    // 動怒模式
    // 強硬模式（內部代號 angry）：六種語氣 + 綜合型
    { id: 'h_command', name: '強硬模式・命令型',     w: 2,   seq: ['open:command', 'core:command', 'support:command?', 'close:command'], mode: 'angry' },
    { id: 'h_fed',     name: '強硬模式・凍未條型',   w: 2,   seq: ['open:fed', 'core:fed', 'support:fed?', 'close:fed'], mode: 'angry' },
    { id: 'h_rebut',   name: '強硬模式・反擊型',     w: 1.6, seq: ['open:hrebut', 'core:hrebut', 'support:hrebut?', 'close:hrebut'], mode: 'angry' },
    { id: 'h_dignity', name: '強硬模式・身分尊嚴型', w: 1.2, seq: ['open:dignity', 'core:dignity', 'support:dignity?', 'close:dignity'], mode: 'angry' },
    { id: 'h_accuse',  name: '強硬模式・連續質問型', w: 1.5, seq: ['open:accuse', 'core:accuse', 'support:accuse?', 'close:accuse'], mode: 'angry' },
    { id: 'h_declare', name: '強硬模式・強硬宣示型', w: 1.2, seq: ['open:declare', 'core:declare', 'support:declare?', 'close:declare'], mode: 'angry' },
    { id: 'h_deflect', name: '強硬模式・怎麼不問型', w: 2,   seq: ['open:hdeflect', 'core:hdeflect', 'support:hrebut?', 'close:hrebut'], mode: 'angry' },
    { id: 'angry',     name: '強硬模式・綜合型',     w: 1.5, seq: ['open', 'core', 'support', 'close'], mode: 'angry' },
    { id: 'angry2',    name: '強硬模式・震怒',       w: 1,   seq: ['open', 'core', 'support', 'core', 'support', 'close'], mode: 'angry', bonus: 1 }
  ];

  // 同一段文字中的詞彙上限（D10 互斥規則）
  var LIMITS = [
    { re: /即刻|立即|第一時間|隨即|當下/g, max: 2 },
    { re: /持續/g, max: 2 },
    { re: /第一時間/g, max: 1, fixed: true },
    { re: /如果/g, max: 1, fixed: true },
    { re: /掌握/g, max: 2 },
    { re: /跨局處/g, max: 2 },
    { re: /開放/g, max: 1, fixed: true },
    { re: /只有更好/g, max: 1, fixed: true },
    { re: /協調/g, max: 2 },
    { re: /專案/g, max: 2 },
    { re: /滾動檢討/g, max: 1 },
    { re: /包括/g, max: 2 },
    { re: /最重要的/g, max: 1 },
    { re: /完整的?說明/g, max: 1 },
    { re: /共識/g, max: 1 },
    { re: /專業/g, max: 2 },
    { re: /相關單位/g, max: 1 },
    { re: /程序/g, max: 1 },
    { re: /溝通/g, max: 2 },
    { re: /推動/g, max: 2 },
    { re: /克服/g, max: 1 },
    { re: /盤點/g, max: 1 },
    { re: /研議/g, max: 1 },
    { re: /現在/g, max: 3 },
    { re: /不要給我發生/g, max: 1, fixed: true },
    { re: /萬全準備/g, max: 1, fixed: true },
    { re: /有沒有問題/g, max: 1 },
    { re: /不要等到/g, max: 1, fixed: true },
    { re: /親自/g, max: 2, fixed: true },
    { re: /關鍵/g, max: 3, fixed: true },
    { re: /我很好奇|匪夷所思/g, max: 1, fixed: true },
    { re: /相關團隊/g, max: 1, fixed: true },
    { re: /即刻召集/g, max: 1, fixed: true },
    { re: /已有相關討論/g, max: 1, fixed: true },
    { re: /當然/g, max: 2, fixed: true },
    { re: /從制度面/g, max: 1, fixed: true },
    { re: /我們已召開/g, max: 1, fixed: true },
    { re: /我要看到/g, max: 1, fixed: true },
    { re: /現在就提出來/g, max: 1, fixed: true },
    { re: /都有掌握/g, max: 1, fixed: true },
    { re: /跨局處協調/g, max: 1, fixed: true },
    { re: /符合市民期待/g, max: 1, fixed: true },
    { re: /高雄|台南|屏東/g, max: 3, fixed: true },
    { re: /清楚說明/g, max: 1, fixed: true },
    { re: /怎麼不問|怎麼花的/g, max: 1, fixed: true },
    { re: /局部問題|單一個案/g, max: 1, fixed: true },
    { re: /整體城市治理/g, max: 1, fixed: true },
    { re: /謝謝喔/g, max: 1, fixed: true },
    { re: /《/g, max: 1, fixed: true },
    { re: /凍未條/g, max: 2, fixed: true },
    { re: /受夠了/g, max: 3, fixed: true },
    { re: /說了算/g, max: 3, fixed: true },
    { re: /依法認定/g, max: 1, fixed: true },
    { re: /要不要負責|不用負責/g, max: 1, fixed: true },
    { re: /決策者/g, max: 2, fixed: true },
    { re: /不要給我/g, max: 2, fixed: true },
    { re: /強硬/g, max: 3, fixed: true },
    { re: /尊重/g, max: 1, fixed: true },
    { re: /不要再跟我說|不要跟我說/g, max: 1, fixed: true },
    { re: /現在有沒有問題/g, max: 1, fixed: true },
    { re: /身為市長/g, max: 1, fixed: true },
    { re: /我現在要求/g, max: 1, fixed: true },
    { re: /站出來|心裡有數|散會/g, max: 1, fixed: true }
  ];

  var CONN_START = /^(所以|其實|當然|也就是說|換句話說|更重要的是|最重要的是|包括|首先|另外|同時|事實上|因此|另一方面|在這個部分|至於|如果|我要強調|我必須說|必須要說|就相關問題|這當中|總而言之|最後|我想|我必須|我要|我認為|我相信|該|好，)/;

  var STORE_KEY = 'wanan_recent_v1';

  // 只在指定時使用的標籤：absurd 荒謬混搭、civic 非市政題目的「市政化」開場
  var EXCLUSIVE = ['absurd', 'civic', 'escape'];
  var CIVIC_CATS = ['city', 'transport', 'politics'];

  /* ---------- 工具 ---------- */
  function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  function wpick(items, wfn) {
    var ws = [], tot = 0, i;
    for (i = 0; i < items.length; i++) { var w = Math.max(0, wfn(items[i])); ws.push(w); tot += w; }
    if (!tot) return items[Math.floor(Math.random() * items.length)];
    var r = Math.random() * tot;
    for (i = 0; i < items.length; i++) { r -= ws[i]; if (r <= 0) return items[i]; }
    return items[items.length - 1];
  }

  function escRe(s) { return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); }

  // 英數關鍵詞需要完整詞比對，避免 "ai" 命中 "taipei"
  function kwMatch(text, k) {
    if (/^[a-z0-9 .+\-]+$/.test(k)) {
      return new RegExp('(^|[^a-z0-9])' + escRe(k) + '([^a-z0-9]|$)').test(text);
    }
    return text.indexOf(k) >= 0;
  }

  function countAll(text, re) { var m = text.match(re); return m ? m.length : 0; }

  function normalize(s) {
    s = String(s == null ? '' : s)
      .replace(/[！-～]/g, function (c) { return String.fromCharCode(c.charCodeAt(0) - 0xFEE0); })
      .replace(/　/g, ' ')
      .replace(/[\u0000-\u001f\u007f]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
    s = Array.from(s).map(function (c) { return S2T[c] || c; }).join('');
    s = s.replace(/^[「『"'“‘《(（\[]+/, '').replace(/[」』"'”’》)）\]。！？!?.，,]+$/, '').trim();
    return Array.from(s).slice(0, 30).join('');
  }

  function joinList(arr) {
    arr = arr.filter(Boolean);
    if (arr.length <= 1) return arr[0] || '';
    if (arr.length === 2) return arr[0] + rand(['與', '和', '及']) + arr[1];
    return arr.slice(0, -1).join('、') + rand(['與', '及', '，以及']) + arr[arr.length - 1];
  }

  /* ---------- 近期使用紀錄（跨次生成防重複） ---------- */
  function Recent() {
    this.d = { p: [], d: [], s: [], t: [] };
    try {
      var raw = root.localStorage && root.localStorage.getItem(STORE_KEY);
      if (raw) { var o = JSON.parse(raw); if (o && o.p) this.d = o; }
    } catch (e) { /* 無痕或停用 storage */ }
  }
  Recent.prototype.has = function (k, v) { return (this.d[k] || []).indexOf(v) >= 0; };
  Recent.prototype.push = function (k, v, max) {
    var a = this.d[k] || (this.d[k] = []);
    var i = a.indexOf(v); if (i >= 0) a.splice(i, 1);
    a.push(v); while (a.length > max) a.shift();
  };
  Recent.prototype.save = function () {
    try { root.localStorage && root.localStorage.setItem(STORE_KEY, JSON.stringify(this.d)); } catch (e) { }
  };

  /* ---------- 引擎 ---------- */
  function WananEngine(data) {
    this.patterns = data.patterns.patterns;
    this.phrases = data.phrases;
    this.cats = data.categories.categories;
    this.general = this.cats.general;
    this.topics = data.topics;
    this.deflect = (data.deflect && data.deflect.items) || [];
    this.recent = new Recent();

    var kw = [];
    this.topics.forEach(function (t) {
      [t.name].concat(t.keywords || [], t.synonyms || []).forEach(function (k) {
        if (k) kw.push({ k: String(k).toLowerCase(), t: t });
      });
    });
    kw.sort(function (a, b) { return b.k.length - a.k.length; });
    this.kw = kw;

    var ct = [], cats = this.cats;
    Object.keys(cats).forEach(function (c) {
      (cats[c].match || []).forEach(function (m) { ct.push({ k: m.toLowerCase(), c: c }); });
    });
    ct.sort(function (a, b) { return b.k.length - a.k.length; });
    this.catTerms = ct;
  }

  WananEngine.normalize = normalize;
  WananEngine.STYLES = STYLES;

  WananEngine.prototype.classify = function (input) {
    var norm = normalize(input);
    var tokens = norm.split(/[\s,，、;；/｜|＋+&]+/).filter(Boolean).slice(0, 4);
    var self = this;
    var hits = tokens.map(function (tok) {
      var low = tok.toLowerCase(), t = null, i, viaTitle = false;
      for (i = 0; i < self.kw.length; i++) if (self.kw[i].k === low) { t = self.kw[i].t; break; }
      if (!t) for (i = 0; i < self.kw.length; i++) {
        var k = self.kw[i].k;
        if (k.length >= 2 && kwMatch(low, k)) { t = self.kw[i].t; break; }
      }
      // 輸入是關鍵詞的一部分（如「奶茶」→「珍珠奶茶」），長度差需在 2 字內
      var len = Array.from(low).length;
      if (!t && len >= 2) for (i = 0; i < self.kw.length; i++) {
        var kk = self.kw[i].k;
        if (kk.indexOf(low) >= 0 && Array.from(kk).length - len <= 2) { t = self.kw[i].t; break; }
      }
      if (!t && self.titleResolver) {
        var rk = self.titleResolver(low);
        if (rk) for (i = 0; i < self.kw.length; i++) if (self.kw[i].k === rk) { t = self.kw[i].t; viaTitle = true; break; }
      }
      var cat = t ? t.category : 'general';
      if (!t) for (i = 0; i < self.catTerms.length; i++) {
        if (kwMatch(low, self.catTerms[i].k)) { cat = self.catTerms[i].c; break; }
      }
      return { token: tok, topic: t, category: cat, viaTitle: viaTitle };
    });
    // 輸入的是職稱（如「鼠類偵防師」）時，改稱「鼠類偵防師業務」
    hits.forEach(function (h, k) { if (h.viaTitle) tokens[k] += '業務'; });
    // 主題可設定 display_suffix，例如「法新社」→「法新社報導」、「輝達」→「輝達總部案」
    if (hits.length === 1 && hits[0].topic && hits[0].topic.display_suffix) {
      var sf = hits[0].topic.display_suffix;
      if (tokens[0].indexOf(sf.slice(0, 2)) < 0) tokens[0] += sf;
    }
    var display = tokens.length > 1
      ? tokens.slice(0, -1).join('、') + '與' + tokens[tokens.length - 1]
      : (tokens[0] || '');
    return { input: norm, display: display, hits: hits, negative: this.isNegative(norm), other: this.findOther(norm) };
  };

  // 負面議題（漏水、塞車、鼠患…）：不套用「讓○○更好」這類正面句型
  WananEngine.prototype.isNegative = function (text) {
    var t = String(text || '').toLowerCase();
    var self = this;
    return (this.phrases.negative_words || []).some(function (w) { return t.indexOf(w) >= 0; }) ||
      this.topics.some(function (tp) { return tp.negative && self.classifyName(tp, t); });
  };
  WananEngine.prototype.classifyName = function (tp, t) {
    return [tp.name].concat(tp.keywords || []).some(function (k) { return String(k).toLowerCase() === t; });
  };

  WananEngine.prototype.buildContext = function (cls, absurd) {
    var self = this;
    var ctx = { topic: cls.display, verbs: [], pools: {}, used: {}, foreign: [], absurd: !!absurd, negative: !!cls.negative };
    var keys = ['objects', 'details', 'problems', 'actions', 'organizations', 'outcomes'];
    function add(key, arr, w) {
      if (!arr) return;
      var p = ctx.pools[key] || (ctx.pools[key] = {});
      arr.forEach(function (v) { if (v && (!(v in p) || p[v] < w)) p[v] = w; });
    }
    var cats = {}, hasTopic = false, noPos = false;
    cls.hits.forEach(function (h) {
      cats[h.category] = 1;
      if (!h.topic) return;
      hasTopic = true;
      if (h.topic.no_positive) noPos = true;
      var r = h.topic.relations || {};
      add('details', [].concat(r.components || [], r.materials || [], r.equipment || [], r.processes || [], r.details || [], r.time || [], r.costs || []), 5);
      add('problems', [].concat(r.problems || [], r.risks || []), 5);
      add('objects', r.objects, 4);
      add('organizations', r.organizations, 4);
      add('outcomes', r.outcomes, 4);
      add('actions', r.actions, 3);
      ctx.verbs = ctx.verbs.concat(h.topic.verbs || []);
      if (h.topic.metrics) ctx.metrics = (ctx.metrics || []).concat(h.topic.metrics);
      if (h.topic.slogans) ctx.slogans = (ctx.slogans || []).concat(h.topic.slogans);
    });
    Object.keys(cats).forEach(function (c) {
      var cd = self.cats[c] || self.general;
      if (c !== 'general' && !(cls.other && !hasTopic)) keys.forEach(function (k) { add(k, cd.relations[k], hasTopic ? 0.2 : 2.5); });
      if (!hasTopic && cls.hits.length === 1) ctx.verbs = ctx.verbs.concat(cd.verbs || []);
    });
    // 問的是其他縣市的事件、又沒有收錄主題時，用「預算、經費」這類質疑用語
    if (cls.other && !hasTopic) {
      add('details', ['預算執行', '工程經費', '經費運用', '施工期程', '審計意見', '計畫效益'], 6);
      add('organizations', ['審計單位', '中央主管機關', '議會'], 6);
      add('problems', ['經費爭議', '執行效益', '預算浮編'], 6);
    }
    keys.forEach(function (k) { add(k, self.general.relations[k], hasTopic ? 0.08 : 1); });

    if (absurd) {
      var myCats = Object.keys(cats);
      var others = this.topics.filter(function (t) {
        return myCats.indexOf(t.category) < 0 && t.relations && (t.relations.details || []).length;
      });
      if (others.length) {
        var ft = rand(others);
        ctx.foreignName = ft.name;
        ctx.foreign = ft.relations.details.slice().sort(function () { return Math.random() - 0.5; });
      }
    }
    ctx.verb = ctx.verbs.length ? rand(ctx.verbs) : '';
    ctx.cats = Object.keys(cats);
    ctx.other = cls.other || null;
    // 亂套法律：主題指定的法律優先，否則隨機
    var lawList = this.phrases.laws || [];
    var named = [];
    cls.hits.forEach(function (h) { if (h.topic && h.topic.laws) named = named.concat(h.topic.laws); });
    var namedLaws = lawList.filter(function (l) { return named.indexOf(l.name) >= 0; });
    ctx.law = lawList.length ? wpick(namedLaws.length && Math.random() < 0.7 ? namedLaws : lawList,
      function (l) { return self.recent.has('l', l.name) ? 0.2 : 1; }) : null;
    ctx.deflect = this.pickDeflect(cls, ctx.cats);
    ctx.topicIds = cls.hits.filter(function (h) { return h.topic; }).map(function (h) { return h.topic.id; });
    // 不知道是什麼的詞（未收錄）、負面議題、真實機構：不使用「讓○○更好、成為驕傲」這類正面句
    ctx.noPositive = ctx.negative || noPos || !hasTopic;
    ctx.serious = noPos;
    ctx.viaTitle = cls.hits.some(function (h) { return h.viaTitle; });
    ctx.central = cls.hits.some(function (h) { return h.topic && h.topic.central; });
    ctx.personal = cls.hits.every(function (h) { return ['life', 'food', 'drink', 'entertainment'].indexOf(h.category) >= 0; });
    ctx.jobtitle = this.titleMaker ? this.titleMaker(cls.input) : '';
    return ctx;
  };

  // 使用者直接問其他縣市的事件（垃圾山、前鎮漁港…）
  WananEngine.prototype.findOther = function (text) {
    var t = String(text || '').toLowerCase();
    for (var i = 0; i < this.deflect.length; i++) {
      var al = this.deflect[i].aliases || [];
      for (var k = 0; k < al.length; k++) if (t.indexOf(al[k].toLowerCase()) >= 0) return this.deflect[i];
    }
    return null;
  };

  // 問A答B：挑一筆其他縣市的素材。優先挑跟題目相關的，否則挑金額大的（越偏題越好笑）
  WananEngine.prototype.pickDeflect = function (cls, cats) {
    if (!this.deflect.length) return null;
    var self = this;
    var words = [cls.input.toLowerCase()];
    cls.hits.forEach(function (h) { if (h.topic) words = words.concat([h.topic.name], h.topic.keywords || []); });
    var text = words.join('|').toLowerCase();
    var related = this.deflect.filter(function (it) {
      return it.match.some(function (k) { return text.indexOf(k) >= 0; }) ||
        (it.cats || []).some(function (c) { return cats.indexOf(c) >= 0; });
    });
    var big = this.deflect.filter(function (it) { return it.big; });
    // 問的就是其他縣市的事時，轉移到「另一個」縣市
    if (cls.other) {
      related = related.filter(function (it) { return it.city !== cls.other.city; });
      big = big.filter(function (it) { return it.city !== cls.other.city; });
    }
    var pool = related.length && Math.random() < 0.7 ? related : (big.length ? big : this.deflect);
    return wpick(pool, function (it) { return self.recent.has('x', it.id) ? 0.2 : 1; });
  };

  WananEngine.prototype.take = function (ctx, key, n) {
    var p = ctx.pools[key] || {}, self = this;
    // 已用過的詞不再抽，也排除互相包含的詞（煮製時間／時間）
    var usedList = Object.keys(ctx.used);
    var items = Object.keys(p).filter(function (v) {
      return !ctx.used[v] && !usedList.some(function (u) { return u.indexOf(v) >= 0 || v.indexOf(u) >= 0; });
    });
    if (!items.length) items = Object.keys(p);
    var out = [];
    for (var i = 0; i < n && items.length; i++) {
      var v = wpick(items, function (x) { return p[x] * (self.recent.has('d', x) ? 0.2 : 1); });
      out.push(v); ctx.used[v] = 1;
      // 避免「交流期程及期程」這種包含關係的重複
      items = items.filter(function (x) { return x !== v && x.indexOf(v) < 0 && v.indexOf(x) < 0; });
    }
    return out;
  };

  WananEngine.prototype.fill = function (tpl, ctx) {
    var self = this;
    // 測量項目與儀器成對使用（鹹度→鹽度計），同一句共用一組
    var metric = null;
    var getMetric = function () {
      if (!metric) {
        var m = self.phrases.metrics || {};
        // 市政、政治類題目沒有專屬測量項目時，改用通用（滿意度、幸福濃度），避免「用溫度計測量違建涼爽程度」
        var c0 = (ctx.cats || [])[0];
        var catM = (c0 === 'city' || c0 === 'politics') ? null : m[c0];
        metric = rand(ctx.metrics || catM || m.general || [['日常數值', '精密儀器']]);
      }
      return metric;
    };
    return tpl.replace(/\{(\w+)\}/g, function (m, k) {
      switch (k) {
        case 'topic': return ctx.topic;
        case 'verb': return ctx.verb;
        case 'jobtitle': return ctx.jobtitle;
        case 'tool': return tpl.indexOf('{metric}') >= 0 ? getMetric()[1] : rand(self.phrases.instruments || ['精密儀器']);
        case 'metric': return getMetric()[0];
        case 'friend': return rand(self.phrases.friends || ['多年好友']);
        case 'slogan':
          // 口號要跟題目同類：主題指定 > 分類 > 通用（避免「做家事」配「安全校園」）
          var sl = self.phrases.slogans || {};
          return rand(ctx.slogans || (Array.isArray(sl) ? sl : (sl[(ctx.cats || [])[0]] || sl.general || ['幸福城市'])));
        case 'd': return joinList(self.take(ctx, 'details', Math.random() < 0.6 ? 3 : 2));
        case 'd1': case 'd2': return self.take(ctx, 'details', 1)[0] || '相關細節';
        case 'obj': return self.take(ctx, 'objects', 1)[0] || '相關單位';
        case 'org': return self.take(ctx, 'organizations', 1)[0] || '相關局處';
        case 'prob': return self.take(ctx, 'problems', 1)[0] || '相關問題';
        case 'probs': return joinList(self.take(ctx, 'problems', 2)) || '相關問題';
        case 'act': return self.take(ctx, 'actions', 1)[0] || '處理';
        case 'out': case 'out2': return self.take(ctx, 'outcomes', 1)[0] || '品質提升';
        case 'ocity': return ctx.other ? ctx.other.city : '';
        case 'ofig': return ctx.other ? ctx.other.city + ctx.other.name + ctx.other.figure : '';
        case 'oline': return ctx.other ? ctx.other.line : '';
        case 'law': return ctx.law ? ctx.law.name : '相關法律';
        case 'lawline': return ctx.law ? ctx.law.line.replace(/\{topic\}/g, ctx.topic) : '確保市民權益';
        case 'dcity': return ctx.deflect ? ctx.deflect.city : '';
        case 'dname': return ctx.deflect ? ctx.deflect.name : '';
        case 'dfig': return ctx.deflect ? ctx.deflect.figure : '';
        case 'dline': return ctx.deflect ? ctx.deflect.line : '';
        case 'xtopic': return ctx.foreignName || '其他議題';
        case 'xd':
          var xs = ctx.foreign.splice(0, Math.random() < 0.5 ? 2 : 1);
          xs.forEach(function (x) { ctx.used[x] = 1; });
          return joinList(xs) || joinList(self.take(ctx, 'details', 2));
        default: return m;
      }
    });
  };

  // 只擋「新增後超過上限」的句子；前文因重複梗（limitFree）已超量時，不會連帶擋掉後面不含該詞的句子
  WananEngine.prototype.withinLimits = function (text, state) {
    var prev = state.text || '';
    for (var i = 0; i < LIMITS.length; i++) {
      var n = countAll(text, LIMITS[i].re);
      if (n > LIMITS[i].max + (LIMITS[i].fixed ? 0 : state.bonus) && n > countAll(prev, LIMITS[i].re)) return false;
    }
    // 問A答B 的素材名稱，同一段只點名一次
    if (state.dname) {
      var dn = text.split(state.dname).length - 1;
      if (dn > 1 && dn > prev.split(state.dname).length - 1) return false;
    }
    var tc = text.split(state.topic).length - 1;
    return tc <= 2 + state.bonus || tc <= prev.split(state.topic).length - 1;
  };

  WananEngine.prototype.eligible = function (p, ctx) {
    if (p.text.indexOf('{verb}') >= 0 && !ctx.verb) return false;
    if ((p.text.indexOf('{xd}') >= 0 || p.text.indexOf('{xtopic}') >= 0) && !ctx.absurd) return false;
    if (p.positive && ctx.noPositive) return false;
    if (p.policy && ctx.negative) return false;
    if (p.light && ctx.serious) return false;
    if (p.eventTopic && ctx.viaTitle) return false;
    // 「中央不做地方來做」這類：題目真的牽涉中央，或是明顯荒謬的生活題才用
    if (p.needCentral && !ctx.central && !ctx.personal) return false;
    if (p.control && ctx.noPositive) return false;
    if (p.topics && !ctx.topicIds.some(function (id) { return p.topics.indexOf(id) >= 0; })) return false;
    if (p.cats && !ctx.cats.some(function (c) { return p.cats.indexOf(c) >= 0; })) return false;
    if (p.text.indexOf('{jobtitle}') >= 0 && !ctx.jobtitle) return false;
    if ((p.needOther || p.text.indexOf('{ocity}') >= 0) && !ctx.other) return false;
    // 問其他縣市事件：萬安常拿來反問的（前鎮漁港等）借題發揮；其他的尊重地方自治
    if (p.otherAttitude && ctx.other && p.otherAttitude !== (ctx.other.attitude || 'avoid')) return false;
    if (p.needOfig && !(ctx.other && ctx.other.figure)) return false;
    // 問A答B 素材條件
    if (/\{d(city|name|fig|line)\}/.test(p.text)) {
      var dx = ctx.deflect;
      if (!dx) return false;
      if (p.text.indexOf('{dfig}') >= 0 && !dx.figure) return false;
      if (p.needMoney && !dx.money) return false;
      if (p.needDneg && dx.kind !== 'negative') return false;
      if (p.needSpin && !dx.spin) return false;
    }
    if (p.negOnly && !ctx.negative) return false;
    return true;
  };

  WananEngine.prototype.pickSentence = function (ctx, role, tag, state) {
    var self = this;
    var base = this.patterns.filter(function (p) {
      return p.role === role && (p.mode || 'speech') === state.mode && !state.ids[p.id] && self.eligible(p, ctx) &&
        !(p.group && state.groups[p.group]) &&
        !(p.needMention && !(ctx.deflect && state.text.indexOf(ctx.deflect.city) >= 0)) &&
        !(p.needPrior && state.text.indexOf(p.needPrior) < 0) &&
        EXCLUSIVE.every(function (x) { return tag === x || (p.tags || []).indexOf(x) < 0; });
    });
    var lists = [];
    if (tag) lists.push(base.filter(function (p) { return (p.tags || []).indexOf(tag) >= 0; }));
    lists.push(base);

    for (var li = 0; li < lists.length; li++) {
      var cands = lists[li].slice();
      for (var tries = 0; tries < 14 && cands.length; tries++) {
        var p = wpick(cands, function (x) {
          var w = (x.weight || 1) * (self.recent.has('p', x.id) ? 0.1 : 1);
          (x.tags || []).forEach(function (t) { if (state.tags[t]) w *= 0.4; });
          return w;
        });
        var snapshot = Object.assign({}, ctx.used), fSnap = ctx.foreign.slice();
        var text = this.fill(p.text, ctx);
        // limitFree：本身就是重複梗（如無限循環），只檢查前文，不把自己算進上限
        if (this.withinLimits(p.limitFree ? state.text : state.text + text, state)) return { p: p, text: text };
        ctx.used = snapshot; ctx.foreign = fSnap;
        cands.splice(cands.indexOf(p), 1);
      }
    }
    return null;
  };

  WananEngine.prototype.pickStyle = function (avoid, mode, noAbsurd, boost, other) {
    var self = this;
    mode = mode || 'speech';
    return wpick(STYLES, function (s) {
      if ((s.mode || 'speech') !== mode) return 0;
      if (s.absurd && noAbsurd) return 0;
      if (s.needOther && !other) return 0;
      if (other && s.needOther) return s.w * 14;
      if (boost && (s.id === 'deflect' || s.id === 'cut' || s.id === 'h_deflect')) return s.w * 7;
      if (s.id === avoid) return 0;
      return s.w * (self.recent.has('s', s.id) ? 0.35 : 1);
    });
  };

  WananEngine.prototype.generate = function (input, opts) {
    opts = opts || {};
    var cls = this.classify(input);
    if (!cls.display) return null;
    var style = opts.styleId ? STYLES.filter(function (s) { return s.id === opts.styleId; })[0] : null;
    // 真實公共議題（市政、交通、政治、真實機構）不做荒謬混搭，保持基本邏輯
    var serious = cls.hits.some(function (h) {
      return CIVIC_CATS.indexOf(h.category) >= 0 || (h.topic && h.topic.no_positive);
    });
    // 主題設定 deflect_boost（如遮陽傘）時，大幅提高問A答B出現機率
    var boost = cls.hits.some(function (h) { return h.topic && h.topic.deflect_boost; });
    // 問的是其他縣市的事件：大多直接用「別縣市議題」句型，避免講得像台北自己的工程
    if (!style && cls.other && Math.random() < 0.85) {
      var m0 = opts.mode || 'speech';
      style = STYLES.filter(function (s) { return s.needOther && (s.mode || 'speech') === m0; })[0] || null;
    }
    style = style || this.pickStyle(opts.avoidStyle, opts.mode, serious, boost, !!cls.other);
    var mode = style.mode || 'speech';

    var ctx = this.buildContext(cls, style.absurd);
    var state = { text: '', ids: {}, tags: {}, parts: [], conns: {}, bonus: style.bonus || 0, topic: ctx.topic, mode: style.patternMode || mode, groups: {}, dname: ctx.deflect ? ctx.deflect.name : '' };
    var ph = this.phrases, self = this;
    var nonCivic = { yes: mode === 'speech' && !style.patternMode && cls.hits.every(function (h) { return CIVIC_CATS.indexOf(h.category) < 0; }), done: false };

    style.seq.forEach(function (step) {
      var optional = step.slice(-1) === '?';
      var sp = step.replace('?', '').split(':');
      var role = sp[0], tag = sp[1] || null;
      // 非市政題目：開場有機會先「市政化」
      if (role === 'open' && !tag && !nonCivic.done && nonCivic.yes && Math.random() < 0.45) tag = 'civic';
      if (role === 'open') nonCivic.done = true;
      if (optional && Math.random() < 0.5) return;
      var r = self.pickSentence(ctx, role, tag, state);
      if (!r) return;
      var s = r.text;
      if (state.parts.length > 0 && state.mode !== 'news' && !CONN_START.test(s)) {
        var pool = mode === 'angry' ? ph.angry_connectors : role === 'close' ? ph.close_prefix : ph.connectors;
        var prob = role === 'close' ? 0.25 : 0.35;
        if (pool && Math.random() < prob) {
          var free = pool.filter(function (c) { var w = c.replace('，', ''); return !state.conns[c] && s.indexOf(w) < 0 && state.text.indexOf(w) < 0 && s.slice(0, 6).indexOf(w.slice(-3)) < 0; });
          if (free.length) {
            var c = rand(free);
            if (self.withinLimits(state.text + c + s, state)) { s = c + s; state.conns[c] = 1; }
          }
        }
      }
      state.parts.push(s);
      state.text += s;
      state.ids[r.p.id] = 1;
      if (r.p.group) state.groups[r.p.group] = 1;
      (r.p.tags || []).forEach(function (t) { state.tags[t] = 1; });
    });

    // 低機率彩蛋
    // 彩蛋：已經說「謝謝」離場的回答不再補一句
    if (state.mode === 'speech' && ph.easter_eggs && !/謝謝/.test(state.text) && Math.random() < 0.07) {
      var egg = rand(ph.easter_eggs);
      if (state.text.indexOf(egg.slice(0, 4)) < 0 && this.withinLimits(state.text + egg, state)) state.parts.push(egg);
    }

    var text = style.headline && state.parts.length > 1
      ? state.parts[0] + '\n\n' + state.parts.slice(1).join('')
      : state.parts.join('');
    Object.keys(state.ids).forEach(function (id) { self.recent.push('p', id, 45); });
    Object.keys(ctx.used).forEach(function (v) { self.recent.push('d', v, 90); });
    if (ctx.deflect && /高雄|台南|屏東/.test(text)) this.recent.push('x', ctx.deflect.id, 6);
    if (ctx.law && text.indexOf(ctx.law.name) >= 0) this.recent.push('l', ctx.law.name, 8);
    this.recent.push('s', style.id, 2);
    this.recent.save();

    return {
      question: cls.input,
      topic: cls.display,
      style: style.name,
      styleId: style.id,
      mode: mode,
      text: text,
      category: (cls.hits[0] || {}).category,
      known: cls.hits.some(function (h) { return !!h.topic; }),
      used: Object.keys(ctx.used)
    };
  };

  WananEngine.prototype.randomTopics = function (n, onlyNegative) {
    var self = this;
    var all = onlyNegative ? this.topics.filter(function (t) { return self.isNegative(t.name); }) : this.topics;
    var pool = all.filter(function (t) { return !self.recent.has('t', t.name); });
    if (pool.length < n) pool = all.slice();
    var out = [];
    while (out.length < n && pool.length) {
      var t = pool.splice(Math.floor(Math.random() * pool.length), 1)[0];
      out.push(t.name);
    }
    return out;
  };

  WananEngine.prototype.markTopic = function (name) { this.recent.push('t', name, 40); this.recent.save(); };

  root.WananEngine = WananEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = WananEngine;
})(typeof window !== 'undefined' ? window : globalThis);
