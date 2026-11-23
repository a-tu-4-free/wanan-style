/*!
 * 萬安體製造所 — 萬安式專業職稱生成器
 * 議題辨識 → 短職稱 → 惡搞工作內容 → 記者會說明
 * 共用 WananEngine 的分類。所有職稱皆為虛構戲仿。
 */
(function (root) {
  'use strict';

  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function shuffle(a) { a = a.slice(); for (var i = a.length - 1; i > 0; i--) { var j = Math.floor(Math.random() * (i + 1)); var t = a[i]; a[i] = a[j]; a[j] = t; } return a; }
  function pickN(a, n) { return shuffle(a).slice(0, n); }

  function TitleEngine(engine, data) {
    this.engine = engine;
    this.d = data;
    var m = [];
    data.issues.forEach(function (it) { it.match.forEach(function (k) { m.push({ k: k.toLowerCase(), it: it }); }); });
    m.sort(function (a, b) { return b.k.length - a.k.length; });
    this.match = m;
    this.lastStem = {};
    var self = this;
    engine.titleMaker = function (q) { return self.quickTitle(q); };
    // 職稱反查：輸入「鼠類偵防師」→ 對應議題「鼠患」
    engine.titleResolver = function (q) {
      // 以職稱結尾（師、專員、督導…）時，用議題關鍵字反查
      if (/(師|專員|督導|組長|顧問|專家|執行長)$/.test(q)) {
        var hit = self.findIssue(q);
        if (hit) return hit.match[0].toLowerCase();
      }
      for (var i = 0; i < data.issues.length; i++) {
        var it = data.issues[i];
        for (var k = 0; k < it.stems.length; k++) if (q.indexOf(it.stems[k].toLowerCase()) >= 0) return it.match[0].toLowerCase();
      }
      return null;
    };
  }

  TitleEngine.prototype.findIssue = function (text) {
    var low = text.toLowerCase();
    for (var i = 0; i < this.match.length; i++) if (low.indexOf(this.match[i].k) >= 0) { this.lastKey = this.match[i].k; return this.match[i].it; }
    this.lastKey = '';
    return null;
  };

  TitleEngine.prototype.makeTitle = function (stem, tier) {
    var t = this.d.tiers[tier - 1];
    return t.format.replace('{stem}', stem).replace('{suffix}', rand(t.suffixes));
  };

  // 未收錄的詞：取前 4 個字當主幹，避免職稱過長
  TitleEngine.prototype.fallbackStem = function (word) {
    var w = Array.from(word).slice(0, 4).join('');
    return w + rand(this.d.fallback_functions);
  };

  // 「背熟○○的英文翻譯」：依議題挑一個最會被外媒追問的名詞
  TitleEngine.prototype.pickEng = function (word) {
    var w = String(word).toLowerCase();
    var hit = (this.d.eng_terms || []).filter(function (e) {
      return e.match.some(function (k) { return w.indexOf(k.toLowerCase()) >= 0; });
    })[0];
    return rand(hit ? hit.terms : (this.d.eng_default || ['跨局處']));
  };

  TitleEngine.prototype.generate = function (input, opts) {
    opts = opts || {};
    var cls = this.engine.classify(input);
    if (!cls.display) return null;
    var issueWord = cls.input;
    var issue = this.findIssue(cls.input);

    var stem = opts.stem;
    if (!stem) {
      if (issue) {
        var last = this.lastStem[issueWord];
        var pool = issue.stems.filter(function (s) { return s !== last; });
        stem = rand(pool.length ? pool : issue.stems);
      } else {
        stem = this.fallbackStem(issueWord);
      }
      this.lastStem[issueWord] = stem;
    }

    var tier = opts.tier || (Math.random() < 0.6 ? 1 : 2);
    var title = this.makeTitle(stem, tier);
    var eng = this.pickEng(issueWord);
    var fill = function (s) { return s.replace(/\{issue\}/g, issueWord).replace(/\{title\}/g, title).replace(/\{eng\}/g, eng); };

    // 工作內容：議題專屬梗 2 則 + 通用梗 1 則
    // 只命中部分字（如「垃圾車音樂」只對到「垃圾車」）時，專屬梗只用 1 則，避免答非所問得太離譜
    var partial = issue && Array.from(issueWord).length - Array.from(this.lastKey || '').length >= 2;
    var own = issue && issue.jobs ? pickN(issue.jobs, partial ? 1 : 2) : [];
    // 輸入的是其他縣市的事件（垃圾山、前鎮漁港…）時，加一則「這是別的縣市的事」
    var other = this.engine.findOther ? this.engine.findOther(issueWord) : null;
    if (other && own.length < 2) own.push('被問到' + issueWord + '時，負責說明這是' + other.city + '的事，但我們都有掌握。');
    var ownText = own.join('');
    var generic = this.d.fallback_jobs.filter(function (j) {
      var q = j.match(/「(.+?)」/);
      return !q || ownText.indexOf(q[1].replace('{issue}', '')) < 0;
    });
    // 通用梗避開最近用過的，避免連續幾次都抽到同一則
    var rec = this.engine.recent;
    var fresh = generic.filter(function (j) { return !rec.has('j', j); });
    var jobs = own.concat(pickN(fresh.length >= 3 - own.length ? fresh : generic, 3 - own.length));
    jobs.forEach(function (j) { rec.push('j', j, 8); });
    rec.save();

    var lines = [];
    lines.push('【職稱】' + title);
    lines.push('');
    lines.push('▍工作內容');
    jobs.forEach(function (s, i) { lines.push((i + 1) + '. ' + fill(s)); });
    lines.push('');
    lines.push('▍記者會說明');
    lines.push('「' + fill(rand(this.d.press)) + '」');

    return {
      mode: 'title',
      question: cls.input,
      topic: issueWord,
      style: '萬安式專業職稱・' + this.d.tiers[tier - 1].name,
      styleId: 'title',
      tier: tier,
      stem: stem,
      title: title,
      text: lines.join('\n')
    };
  };

  // 給萬安體句型用的短職稱
  TitleEngine.prototype.quickTitle = function (input) {
    var q = this.engine.constructor.normalize(input);
    if (!q) return '';
    var issue = this.findIssue(q);
    return this.makeTitle(issue ? rand(issue.stems) : this.fallbackStem(q), 1);
  };

  TitleEngine.prototype.randomIssues = function (n) {
    return pickN(this.d.issues, n).map(function (it) { return it.match[0]; });
  };

  root.WananTitleEngine = TitleEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = TitleEngine;
})(typeof window !== 'undefined' ? window : globalThis);
