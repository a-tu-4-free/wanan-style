/*!
 * 萬安體製造所 — 截圖卡片與分享
 * 用 Canvas 直接繪製（不依賴 html2canvas），固定加上「戲仿創作」浮水印。
 */
(function (root) {
  'use strict';

  var FONT = '"PingFang TC","Noto Sans TC","Microsoft JhengHei","Heiti TC",sans-serif';
  var NO_START = '，。、；：！？」』）》〉…—,.;:!?)';
  var C = { bg: '#f6f5f1', ink: '#1d1d1b', muted: '#8a877f', line: '#e4e1d8', red: '#c8102e', redSoft: '#fbeaec', user: '#24282f' };

  function siteUrl() {
    if (location.protocol === 'file:') return 'wanan-style';
    return (location.host + location.pathname).replace(/index\.html$/, '').replace(/\/$/, '');
  }

  function rr(ctx, x, y, w, h, r) {
    var tl, tr, br, bl;
    if (typeof r === 'number') { tl = tr = br = bl = r; } else { tl = r[0]; tr = r[1]; br = r[2]; bl = r[3]; }
    ctx.beginPath();
    ctx.moveTo(x + tl, y);
    ctx.lineTo(x + w - tr, y); ctx.quadraticCurveTo(x + w, y, x + w, y + tr);
    ctx.lineTo(x + w, y + h - br); ctx.quadraticCurveTo(x + w, y + h, x + w - br, y + h);
    ctx.lineTo(x + bl, y + h); ctx.quadraticCurveTo(x, y + h, x, y + h - bl);
    ctx.lineTo(x, y + tl); ctx.quadraticCurveTo(x, y, x + tl, y);
    ctx.closePath();
  }

  // 中文逐字換行，英數詞不拆，標點不放行首（懸掛）
  function wrap(ctx, text, maxW) {
    var tokens = String(text).match(/[A-Za-z0-9.%+\-]+|\n|./gu) || [];
    var lines = [], line = '';
    tokens.forEach(function (tok) {
      if (tok === '\n') { lines.push(line); line = ''; return; }
      if (line && ctx.measureText(line + tok).width > maxW && NO_START.indexOf(tok) < 0) {
        lines.push(line); line = tok.replace(/^\s+/, '');
      } else { line += tok; }
    });
    if (line) lines.push(line);
    return lines;
  }

  function seal(ctx, x, y, size) {
    ctx.fillStyle = C.red;
    rr(ctx, x, y, size, size, size * 0.2); ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.font = '700 ' + Math.round(size * 0.56) + 'px ' + FONT;
    ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
    ctx.fillText('萬', x + size / 2, y + size / 2 + size * 0.03);
    ctx.textAlign = 'left'; ctx.textBaseline = 'alphabetic';
  }

  function drawCard(opt) {
    var q = opt.question, a = opt.answer, tag = opt.tag || '';
    var W = 1080, P = 64;
    var c = document.createElement('canvas');
    var ctx = c.getContext('2d');

    // 量測
    var qFont = '500 36px ' + FONT, aFont = '400 38px ' + FONT;
    var qPad = 28, qLH = 54, qMax = 680;
    ctx.font = qFont;
    var qLines = wrap(ctx, q, qMax);
    var qW = Math.min(qMax, Math.max.apply(null, qLines.map(function (l) { return ctx.measureText(l).width; })));
    var qH = qLines.length * qLH + qPad * 2 - 6;

    var av = 76, gap = 22, bx = P + av + gap, bw = W - P - bx, aPad = 36, aLH = 66;
    ctx.font = aFont;
    var aLines = wrap(ctx, a, bw - aPad * 2);
    var tagH = tag ? 58 : 0;
    var aH = aPad + tagH + aLines.length * aLH + aPad - 10;

    var headH = 84, footH = 104;
    var H = P + headH + 56 + qH + 44 + aH + 56 + footH;
    c.width = W; c.height = H;

    // 背景
    ctx.fillStyle = C.bg; ctx.fillRect(0, 0, W, H);

    // 標頭
    seal(ctx, P, P, 76);
    ctx.fillStyle = C.ink; ctx.font = '700 40px ' + FONT;
    ctx.fillText('萬安體製造所', P + 96, P + 38);
    ctx.fillStyle = C.muted; ctx.font = '400 24px ' + FONT;
    ctx.fillText('Wanan Style Generator', P + 96, P + 72);

    // 使用者提問
    var y = P + headH + 56;
    var ubw = qW + qPad * 2, ubx = W - P - ubw;
    ctx.fillStyle = C.user; rr(ctx, ubx, y, ubw, qH, [30, 30, 8, 30]); ctx.fill();
    ctx.fillStyle = '#fff'; ctx.font = qFont;
    qLines.forEach(function (l, i) { ctx.fillText(l, ubx + qPad, y + qPad + 38 + i * qLH); });
    y += qH + 44;

    // 回答
    seal(ctx, P, y, av);
    ctx.fillStyle = '#fff'; rr(ctx, bx, y, bw, aH, [8, 30, 30, 30]); ctx.fill();
    ctx.strokeStyle = C.line; ctx.lineWidth = 2; ctx.stroke();
    var ty = y + aPad;
    if (tag) {
      ctx.font = '600 24px ' + FONT;
      var tw = ctx.measureText(tag).width + 32;
      ctx.fillStyle = C.redSoft; rr(ctx, bx + aPad, ty, tw, 42, 21); ctx.fill();
      ctx.fillStyle = C.red; ctx.fillText(tag, bx + aPad + 16, ty + 30);
      ty += tagH;
    }
    ctx.fillStyle = C.ink; ctx.font = aFont;
    aLines.forEach(function (l, i) { ctx.fillText(l, bx + aPad, ty + 44 + i * aLH); });
    y += aH + 56;

    // 頁尾浮水印
    ctx.strokeStyle = C.line; ctx.lineWidth = 2;
    ctx.beginPath(); ctx.moveTo(P, y); ctx.lineTo(W - P, y); ctx.stroke();
    ctx.fillStyle = C.red; ctx.font = '700 28px ' + FONT;
    ctx.fillText('⚠ 戲仿創作・非本人發言', P, y + 58);
    ctx.fillStyle = C.muted; ctx.font = '400 24px ' + FONT;
    ctx.textAlign = 'right'; ctx.fillText(siteUrl(), W - P, y + 57); ctx.textAlign = 'left';

    return c;
  }

  function toBlob(canvas) {
    return new Promise(function (res) { canvas.toBlob(res, 'image/png'); });
  }

  function isTouch() {
    return root.matchMedia && root.matchMedia('(pointer: coarse)').matches;
  }

  function canCopyImage() {
    return !!(navigator.clipboard && navigator.clipboard.write && root.ClipboardItem && root.isSecureContext);
  }

  // 必須在使用者點擊的同一個事件中呼叫（Safari 限制），所以直接傳 Promise 給 ClipboardItem
  function copyImage(canvas) {
    var item = new ClipboardItem({ 'image/png': toBlob(canvas) });
    return navigator.clipboard.write([item]);
  }

  function fileName() {
    var d = new Date(), p = function (n) { return String(n).padStart(2, '0'); };
    return 'wanan-' + d.getFullYear() + p(d.getMonth() + 1) + p(d.getDate()) + '-' + p(d.getHours()) + p(d.getMinutes()) + p(d.getSeconds()) + '.png';
  }

  function download(canvas) {
    var a = document.createElement('a');
    a.download = fileName();
    a.href = canvas.toDataURL('image/png');
    document.body.appendChild(a); a.click(); a.remove();
  }

  function shareFile(canvas) {
    return toBlob(canvas).then(function (blob) {
      var file = new File([blob], fileName(), { type: 'image/png' });
      return navigator.share({ files: [file], title: '萬安體製造所', text: '萬安體製造所（戲仿創作）' });
    });
  }

  function canShareFile() {
    try {
      var f = new File([new Blob([''], { type: 'image/png' })], 'x.png', { type: 'image/png' });
      return !!(navigator.canShare && navigator.canShare({ files: [f] }));
    } catch (e) { return false; }
  }

  function copyText(text) {
    if (navigator.clipboard && root.isSecureContext) return navigator.clipboard.writeText(text);
    return new Promise(function (res, rej) {
      var ta = document.createElement('textarea');
      ta.value = text; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { }
      ta.remove(); ok ? res() : rej(new Error('copy failed'));
    });
  }

  root.WananShare = {
    drawCard: drawCard, copyImage: copyImage, canCopyImage: canCopyImage,
    download: download, shareFile: shareFile, canShareFile: canShareFile,
    copyText: copyText, isTouch: isTouch, siteUrl: siteUrl
  };
})(window);
