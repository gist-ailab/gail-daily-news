(function () {
  'use strict';

  var SITE_ROOT = 'https://gist-ailab.github.io/gail-daily-news/';
  var REPOSITORY_URL = 'https://github.com/gist-ailab/gail-daily-news';
  var ARCHIVE_LIST_URL = REPOSITORY_URL + '/tree/main/docs/archive';
  var ISSUES_URL = REPOSITORY_URL + '/issues/new/choose';

  function pageDate() {
    var pathMatch = window.location.pathname.match(/research_(\d{4}-\d{2}-\d{2})\.html$/);
    if (pathMatch) return pathMatch[1];
    var titleMatch = document.title.match(/\d{4}-\d{2}-\d{2}/);
    return titleMatch ? titleMatch[0] : '';
  }

  function installStyles() {
    if (document.getElementById('gail-common-ui-styles')) return;
    var style = document.createElement('style');
    style.id = 'gail-common-ui-styles';
    style.textContent = [
      '.gail-page-actions{display:grid;grid-template-columns:minmax(0,1.35fr) minmax(240px,.65fr);gap:1rem;margin-bottom:2rem}',
      '.gail-action-card{min-width:0;padding:1.1rem 1.2rem;border-radius:var(--radius-md,16px);background:var(--surface-card,#e7e5e4);box-shadow:var(--shadow-raised-sm,3px 3px 6px rgba(0,0,0,.15),-3px -3px 6px rgba(255,255,255,.7))}',
      '.gail-action-card h2{margin:0 0 .3rem;color:var(--text,#1e2938);font-family:"Noto Sans KR",sans-serif;font-size:.9rem}',
      '.gail-action-card p{margin:0;color:var(--text-secondary,#4a5568);font-family:"Noto Sans KR",sans-serif;font-size:.74rem;line-height:1.6}',
      '.gail-archive-controls{display:flex;align-items:center;gap:.55rem;margin-top:.85rem}',
      '.gail-archive-date{min-width:0;flex:1;height:38px;padding:0 .75rem;border:0;border-radius:10px;outline:none;background:var(--surface,#e7e5e4);box-shadow:var(--shadow-inset,inset 3px 3px 6px rgba(0,0,0,.15));color:var(--text,#1e2938);color-scheme:light dark;font-family:"JetBrains Mono",monospace;font-size:.72rem}',
      '.gail-archive-date:focus-visible{box-shadow:var(--shadow-inset),0 0 0 2px var(--primary,#006666)}',
      '.gail-action-button,.gail-text-link{display:inline-flex;align-items:center;justify-content:center;border:0;text-decoration:none;cursor:pointer;font-family:"Noto Sans KR",sans-serif;font-weight:700;transition:transform .2s,box-shadow .2s,background .2s}',
      '.gail-action-button{min-height:38px;padding:.55rem .9rem;border-radius:10px;background:var(--primary,#006666);color:var(--header-text,#f1f2f5);font-size:.74rem;white-space:nowrap;box-shadow:var(--shadow-raised-sm)}',
      '.gail-action-button:hover,.gail-text-link:hover{transform:translateY(-1px);box-shadow:var(--shadow-hover)}',
      '.gail-secondary-links{display:flex;flex-wrap:wrap;gap:.45rem .9rem;margin-top:.7rem}',
      '.gail-text-link{color:var(--primary,#006666);font-size:.7rem}',
      '.gail-github-card{display:flex;flex-direction:column;justify-content:space-between;background:var(--surface-highlight,#ede9e3)}',
      '.gail-github-actions{display:grid;gap:.55rem;margin-top:.85rem}',
      '.gail-github-button{width:100%;background:#24292f;color:#fff}',
      '.gail-github-button:hover{background:#32383f}',
      '.gail-feedback-button{width:100%;background:var(--primary,#006666);color:var(--header-text,#f1f2f5)}',
      '.gail-visually-hidden{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}',
      '.gail-lang-toggle{position:fixed;bottom:24px;right:78px;height:44px;padding:0 .9rem;border:0;border-radius:999px;cursor:pointer;z-index:60;background:var(--surface-card,#e7e5e4);color:var(--text,#1e2938);box-shadow:var(--shadow-raised-sm,3px 3px 6px rgba(0,0,0,.15),-3px -3px 6px rgba(255,255,255,.7));font-family:"JetBrains Mono",monospace;font-size:.72rem;font-weight:700;letter-spacing:.04em;transition:transform .2s,box-shadow .2s}',
      '.gail-lang-toggle:hover{transform:translateY(-1px);box-shadow:var(--shadow-hover)}',
      '.gail-lang-toggle .gail-lang-on{color:var(--primary,#006666)}',
      '.gail-lang-toggle .gail-lang-off{opacity:.45}',
      '@media(max-width:640px){.gail-lang-toggle{right:72px;height:40px;padding:0 .7rem;font-size:.68rem}}',
      '@media(max-width:640px){.gail-page-actions{grid-template-columns:1fr;gap:.8rem}.gail-action-card{padding:1rem}.gail-archive-controls{align-items:stretch}.gail-archive-date{width:100%}}'
    ].join('');
    document.head.appendChild(style);
  }


  var LANG_KEY = 'gail-lang';
  var LANGS = ['ko', 'en'];

  function preferredLang() {
    // A stored choice always wins. Otherwise fall back to what the browser
    // asks for, and only then to Korean, which is this digest's default.
    try {
      var saved = window.localStorage.getItem(LANG_KEY);
      if (LANGS.indexOf(saved) !== -1) return saved;
    } catch (error) { /* private mode or blocked storage */ }
    var candidates = navigator.languages || [navigator.language || ''];
    for (var i = 0; i < candidates.length; i++) {
      var tag = String(candidates[i]).toLowerCase();
      if (tag.indexOf('ko') === 0) return 'ko';
      if (tag.indexOf('en') === 0) return 'en';
    }
    return 'ko';
  }

  function applyLang(lang) {
    var nodes = document.querySelectorAll('.i18n');
    for (var i = 0; i < nodes.length; i++) {
      var text = nodes[i].getAttribute('data-' + lang);
      if (text !== null) nodes[i].textContent = text;
    }
    document.documentElement.setAttribute('lang', lang);
    var button = document.getElementById('gail-lang-toggle');
    if (button) {
      button.innerHTML =
        '<span class="gail-lang-' + (lang === 'ko' ? 'on' : 'off') + '">KOR</span>' +
        '<span class="gail-lang-off"> / </span>' +
        '<span class="gail-lang-' + (lang === 'en' ? 'on' : 'off') + '">ENG</span>';
      button.setAttribute('aria-label', lang === 'ko' ? 'Switch to English' : '한국어로 전환');
    }
  }

  function installLanguageToggle() {
    if (document.getElementById('gail-lang-toggle')) return;
    var button = document.createElement('button');
    button.id = 'gail-lang-toggle';
    button.type = 'button';
    button.className = 'gail-lang-toggle';
    button.addEventListener('click', function () {
      var next = document.documentElement.getAttribute('lang') === 'ko' ? 'en' : 'ko';
      try { window.localStorage.setItem(LANG_KEY, next); } catch (error) { /* ignore */ }
      applyLang(next);
    });
    document.body.appendChild(button);
    applyLang(preferredLang());
  }


  function BI(ko, en) {
    return '<span class="i18n" data-ko="' + ko.replace(/"/g, '&quot;') +
      '" data-en="' + en.replace(/"/g, '&quot;') + '">' + ko + '</span>';
  }

  function latestDigestDate() {
    // Today in KST, which is the newest digest the site can have. Read from an
    // archive page the document's own date would be its archive date, so the
    // picker would refuse to move forward -- hence the clock rather than the
    // page. Digests publish around 09:00 KST.
    var now = new Date(Date.now() + 9 * 3600 * 1000);
    return now.toISOString().slice(0, 10);
  }

  function installActions() {
    var container = document.querySelector('.container');
    if (!container || document.getElementById('gail-common-ui')) return;

    var legacyActions = container.querySelector('.page-actions');
    if (legacyActions) legacyActions.remove();
    var legacyQuickNav = document.getElementById('archive-quick-nav');
    if (legacyQuickNav) legacyQuickNav.remove();

    var currentDate = pageDate();
    var latestDate = latestDigestDate();
    var isArchive = /\/archive\//.test(window.location.pathname);
    var section = document.createElement('section');
    section.id = 'gail-common-ui';
    section.className = 'gail-page-actions';
    // The digest itself is bilingual, so this shared block has to be too:
    // it is built here rather than in the template, so it carried no data-en.
    section.setAttribute('aria-label', '지난 기록과 GitHub');
    section.innerHTML =
      '<div class="gail-action-card">' +
        '<h2>📚 ' + BI('지난 뉴스 보기', 'Past digests') + '</h2>' +
        '<p>' + BI('날짜를 선택해 그날의 AI &amp; Robotics Research Daily Digest를 확인하세요.',
                   'Pick a date to open that day\'s AI &amp; Robotics Research Daily Digest.') + '</p>' +
        '<form class="gail-archive-controls" id="gail-archive-form">' +
          '<label class="gail-visually-hidden" for="gail-archive-date">' +
            BI('날짜 선택', 'Choose a date') + '</label>' +
          // The picker opens on the newest digest and refuses future dates,
          // which have no archive page.
          '<input class="gail-archive-date" id="gail-archive-date" type="date"' +
            ' min="2026-04-07" max="' + latestDate + '"' +
            ' value="' + (currentDate || latestDate) + '" required>' +
          '<button class="gail-action-button" type="submit">' +
            BI('기록 열기', 'Open') + ' ↗</button>' +
        '</form>' +
        '<div class="gail-secondary-links">' +
          (isArchive ? '<a class="gail-text-link" href="' + SITE_ROOT + 'research_latest.html">' +
            BI('최신 기록 보기', 'Latest digest') + ' →</a>' : '') +
          '<a class="gail-text-link" href="' + ARCHIVE_LIST_URL + '" target="_blank" rel="noopener">' +
            BI('전체 아카이브 목록', 'All archives') + ' →</a>' +
        '</div>' +
      '</div>' +
      '<aside class="gail-action-card gail-github-card">' +
        '<div><h2>⭐ ' + BI('함께 개선해 주세요', 'Help improve this') + '</h2>' +
        '<p>' + BI('유용했다면 Star를 남겨주세요. 의견이나 불편한 점은 Issue로 알려주시면 더 좋은 큐레이션으로 개선하는 데 큰 도움이 됩니다.',
                   'If this is useful, leave a Star. Opening an issue with feedback or problems genuinely helps improve the curation.') + '</p></div>' +
        '<div class="gail-github-actions">' +
          '<a class="gail-action-button gail-github-button" href="' + REPOSITORY_URL + '" target="_blank" rel="noopener">' +
            BI('GitHub에서 Star 남기기', 'Star on GitHub') + ' ↗</a>' +
          '<a class="gail-action-button gail-feedback-button" href="' + ISSUES_URL + '" target="_blank" rel="noopener">' +
            BI('피드백 Issue 남기기', 'Open a feedback issue') + ' ↗</a>' +
        '</div>' +
      '</aside>';

    container.insertBefore(section, container.firstChild);
    document.getElementById('gail-archive-form').addEventListener('submit', function (event) {
      event.preventDefault();
      var selectedDate = document.getElementById('gail-archive-date').value;
      if (selectedDate) {
        window.location.href = SITE_ROOT + 'archive/research_' + encodeURIComponent(selectedDate) + '.html';
      }
    });
  }

  installStyles();
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      installActions();
      installLanguageToggle();
    });
  } else {
    installActions();
    installLanguageToggle();
  }
})();
