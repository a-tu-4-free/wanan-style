/*!
 * 萬安體製造所 — 萬安式專業職稱生成器
 * 議題辨識 → 職稱生成 → 職務說明 → 行政包裝 → 記者會回答
 * 共用 WananEngine 的分類與語意延伸。所有職稱皆為虛構戲仿。
 */
(function (root) {
  'use strict';

  function rand(a) { return a[Math.floor(Math.random() * a.length)]; }
  function rint(a, b) { return a + Math.floor(Math.random() * (b - a + 1)); }
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
  }

  TitleEngine.prototype.findIssue = function (text) {
    var low = text.toLowerCase();
    for (var i = 0; i < this.match.length; i++) if (low.indexOf(this.match[i].k) >= 0) return this.match[i].it;
    return null;
  };

  TitleEngine.prototype.makeTitle = function (issueWord, stem, tier, cat) {
    var t = this.d.tiers[tier - 1];
    var big = rand(this.d.big_words[cat] || this.d.big_words.general);
    var prefix = t.prefixes ? rand(t.prefixes) : '';
    var suffix = rand(t.suffixes);
    if (prefix === '城市' && big.indexOf('城市') === 0) prefix = tier === 4 ? '大臺北' : '全市';
    if (tier === 4) return prefix + issueWord + '暨' + big + suffix;
    if (tier === 3) {
      if (/^(城市|全市)/.test(stem)) prefix = '';
      return prefix + stem + '暨' + big + suffix;
    }
    // 主幹已含職能詞時，初階用簡短後綴（如「鼠類偵防師」）
    if (tier === 1 && /(管理|監測|偵防|評估|協調|整合|防治|掌握|優化|控管|配置|規劃|調解|安撫|守護|推動)$/.test(stem)) suffix = rand(['師', '師', '專員', '管理師']);
    // 避免「管理管理師」
    var tail = stem.slice(-2);
    if (suffix.indexOf(tail) === 0) suffix = '師';
    if (prefix && stem.indexOf(prefix) === 0) prefix = '';
    return prefix + stem + suffix;
  };

  TitleEngine.prototype.generate = function (input, opts) {
    opts = opts || {};
    var eng = this.engine;
    var cls = eng.classify(input);
    if (!cls.display) return null;
    var issueWord = cls.display;
    var cat = (cls.hits[0] || {}).category || 'general';
    var issue = this.findIssue(cls.input);

    // 職稱主幹：同一題避免連續使用相同主幹
    var stem = opts.stem;
    if (!stem) {
      var stems = issue ? issue.stems : this.d.fallback_functions.map(function (f) { return issueWord + f; });
      var last = this.lastStem[issueWord];
      var pool = stems.filter(function (s) { return s !== last; });
      stem = rand(pool.length ? pool : stems);
      this.lastStem[issueWord] = stem;
    }

    var tier = opts.tier || (function () { var r = Math.random(); return r < 0.4 ? 1 : r < 0.75 ? 2 : r < 0.93 ? 3 : 4; })();
    var title = this.makeTitle(issueWord, stem, tier, cat);

    var ctx = eng.buildContext(cls, false);
    var take = function (k) { return eng.take(ctx, k, 1)[0]; };
    var fill = function (s) {
      return s.replace(/\{(\w+)\}/g, function (m, k) {
        switch (k) {
          case 'issue': return issueWord;
          case 'title': return title;
          case 'd1': case 'd2': return take('details') || '相關細節';
          case 'org': return take('organizations') || '相關局處';
          case 'n1': return rint(12, 48);
          case 'n2': return rint(2, 6);
          case 'n3': return rint(3, 9);
          case 'n4': return rint(24, 120);
          case 'pct': return rint(15, 300);
          default: return m;
        }
      });
    };

    var duties = pickN(this.d.duties, 3).concat(pickN(this.d.fun_duties, Math.random() < 0.5 ? 1 : 2));
    var skills = pickN(this.d.skills, 2).concat(pickN(this.d.fun_skills, Math.random() < 0.6 ? 1 : 2));
    var kpis = [pickN(this.d.kpis.slice(0, 4), 1)[0]].concat(pickN(this.d.kpis.slice(4), 2));
    var orgs = eng.take(ctx, 'organizations', 3);

    var lines = [];
    lines.push('【職稱】' + title);
    lines.push('職級：' + this.d.tiers[tier - 1].name + '｜' + fill(rand(this.d.extras)));
    lines.push('');
    lines.push('▍職務定位');
    lines.push(fill(rand(this.d.positions)));
    lines.push('');
    lines.push('▍工作職掌');
    duties.forEach(function (s, i) { lines.push((i + 1) + '. ' + fill(s)); });
    lines.push('');
    lines.push('▍專業能力');
    skills.forEach(function (s) { lines.push('・' + fill(s)); });
    lines.push('');
    lines.push('▍合作單位');
    lines.push(orgs.join('、') + '，以及跨局處會議');
    lines.push('');
    lines.push('▍考核指標');
    kpis.forEach(function (s) { lines.push('・' + fill(s)); });
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

  TitleEngine.prototype.randomIssues = function (n) {
    return pickN(this.d.issues, n).map(function (it) { return it.match[0]; });
  };

  root.WananTitleEngine = TitleEngine;
  if (typeof module !== 'undefined' && module.exports) module.exports = TitleEngine;
})(typeof window !== 'undefined' ? window : globalThis);
