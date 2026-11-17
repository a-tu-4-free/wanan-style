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
  }

  TitleEngine.prototype.findIssue = function (text) {
    var low = text.toLowerCase();
    for (var i = 0; i < this.match.length; i++) if (low.indexOf(this.match[i].k) >= 0) return this.match[i].it;
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
    var fill = function (s) { return s.replace(/\{issue\}/g, issueWord).replace(/\{title\}/g, title); };

    // 工作內容：議題專屬梗 2 則 + 通用梗 1 則
    var own = issue && issue.jobs ? pickN(issue.jobs, 2) : [];
    var ownText = own.join('');
    var generic = this.d.fallback_jobs.filter(function (j) {
      var q = j.match(/「(.+?)」/);
      return !q || ownText.indexOf(q[1].replace('{issue}', '')) < 0;
    });
    var jobs = own.concat(pickN(generic, 3 - own.length));

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
