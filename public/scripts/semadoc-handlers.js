/**
 * semadoc-handlers.js — Shared UI handlers for SemaDoc Viewer & ModelDocPage
 *
 * Usage:
 *   initSemadocHandlers({
 *     labels: { ... },                       // Localized UI strings
 *     onMermaidRendered: function(el) {},     // Optional callback after each mermaid render
 *     getTitleForExport: function() { ... }   // Returns the document title for HTML export
 *   });
 *
 * After calling initSemadocHandlers, the following functions are available as window globals:
 *   initMermaid, initSvgEmbeds, initScrollIndicators, registerCustomLanguages,
 *   addCopyButtons, initSortableTables, reinitMermaid,
 *   mmdZoom, mmdFullscreen, mmdFsZoom, mmdFsZoomAtCursor, mmdFsClose, mmdToggleEmbed,
 *   svgZoom, svgZoomAtCursor, svgToggleAnimation, svgFullscreen
 */
function initSemadocHandlers(options) {
  var labels = options.labels || {};
  var onMermaidRendered = options.onMermaidRendered || null;
  var getTitleForExport = options.getTitleForExport || function() { return 'SemaDoc-Export'; };

  /* ── Mobile / touch detection ── */
  /** Portrait touch device — matches the CSS media query for control positioning */
  function isMobilePortrait() {
    if (window.matchMedia('(pointer: coarse) and (orientation: portrait)').matches) return true;
    var touchHw = navigator.maxTouchPoints > 0;
    var shortEdge = Math.min(window.screen.width, window.screen.height);
    return touchHw && shortEdge <= 600;
  }
  /** Touch device in any orientation — for features useful on all smartphones */
  function isTouchDevice() {
    if (window.matchMedia('(pointer: coarse)').matches) return true;
    return navigator.maxTouchPoints > 0 && Math.min(window.screen.width, window.screen.height) <= 600;
  }

  /* ── hljs custom languages ── */
  var languagesRegistered = false;
  function registerCustomLanguages() {
    if (languagesRegistered || typeof hljs === 'undefined') return;
    languagesRegistered = true;

    hljs.registerLanguage('dax', function(hljs) {
      return {
        name: 'DAX',
        case_insensitive: true,
        keywords: {
          keyword: 'DEFINE EVALUATE ORDER BY ASC DESC RETURN VAR COLUMN MEASURE TABLE',
          built_in: 'CALCULATE CALCULATETABLE FILTER ALL ALLEXCEPT ALLSELECTED VALUES DISTINCT RELATED RELATEDTABLE ' +
            'SUMX AVERAGEX COUNTX MAXX MINX RANKX ADDCOLUMNS SELECTCOLUMNS SUMMARIZE SUMMARIZECOLUMNS ' +
            'TOPN GENERATE GENERATEALL CROSSJOIN UNION INTERSECT EXCEPT NATURALINNERJOIN NATURALLEFTOUTERJOIN ' +
            'SUM AVERAGE COUNT COUNTA COUNTBLANK COUNTROWS MIN MAX DIVIDE BLANK ERROR ' +
            'IF SWITCH AND OR NOT IN TRUE FALSE ' +
            'DATE YEAR MONTH DAY HOUR MINUTE SECOND NOW TODAY DATEDIFF DATEADD ' +
            'CALENDAR CALENDARAUTO EDATE EOMONTH FORMAT ' +
            'TOTALYTD TOTALQTD TOTALMTD DATESYTD DATESQTD DATESMTD ' +
            'SAMEPERIODLASTYEAR PREVIOUSYEAR PREVIOUSQUARTER PREVIOUSMONTH PREVIOUSDAY ' +
            'NEXTYEAR NEXTQUARTER NEXTMONTH NEXTDAY ' +
            'FIRSTDATE LASTDATE FIRSTNONBLANK LASTNONBLANK FIRSTNONBLANKVALUE LASTNONBLANKVALUE ' +
            'OPENINGBALANCEYEAR OPENINGBALANCEQUARTER OPENINGBALANCEMONTH ' +
            'CLOSINGBALANCEYEAR CLOSINGBALANCEQUARTER CLOSINGBALANCEMONTH ' +
            'DATESBETWEEN DATESINPERIOD PARALLELPERIOD ' +
            'REMOVEFILTERS KEEPFILTERS USERELATIONSHIP CROSSFILTER TREATAS ' +
            'ISBLANK ISERROR ISEMPTY ISFILTERED ISCROSSFILTERED HASONEVALUE HASONEFILTER SELECTEDVALUE ' +
            'CONCATENATE CONCATENATEX LEFT RIGHT MID LEN UPPER LOWER TRIM SUBSTITUTE REPLACE REPT EXACT SEARCH FIND ' +
            'FIXED FORMAT COMBINEVALUES UNICHAR UNICODE ' +
            'ROUND ROUNDUP ROUNDDOWN INT TRUNC MOD ABS SIGN SQRT POWER LOG LOG10 LN EXP PI RAND RANDBETWEEN ' +
            'EVEN ODD FLOOR CEILING FACT GCD LCM QUOTIENT ' +
            'CONVERT CURRENCY SELECTEDMEASURE SELECTEDMEASURENAME ' +
            'COALESCE ISINSCOPE LOOKUPVALUE USERPRINCIPALNAME USERNAME CUSTOMDATA PATHCONTAINS PATHLENGTH',
          literal: 'BLANK TRUE FALSE'
        },
        contains: [
          hljs.QUOTE_STRING_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.NUMBER_MODE,
          { className: 'string', begin: '"', end: '"', contains: [{ begin: '""' }] },
          { className: 'symbol', begin: "'", end: "'" },
          { className: 'symbol', begin: /\[/, end: /\]/ }
        ]
      };
    });

    hljs.registerLanguage('powerquery', function(hljs) {
      return {
        name: 'Power Query M',
        case_insensitive: false,
        keywords: {
          keyword: 'let in if then else try otherwise each as is type not and or meta error section shared',
          built_in: 'Table.FromRows Table.FromColumns Table.FromRecords Table.FromList Table.TransformColumnTypes ' +
            'Table.AddColumn Table.RemoveColumns Table.RenameColumns Table.SelectColumns Table.ReorderColumns ' +
            'Table.SelectRows Table.Sort Table.Group Table.Join Table.NestedJoin Table.Pivot Table.Unpivot ' +
            'Table.ExpandRecordColumn Table.ExpandTableColumn Table.ExpandListColumn ' +
            'Table.FillDown Table.FillUp Table.Distinct Table.Skip Table.FirstN Table.LastN ' +
            'Table.Combine Table.ColumnNames Table.RowCount Table.Range Table.Buffer ' +
            'List.Sum List.Average List.Min List.Max List.Count List.Distinct List.Transform List.Select ' +
            'List.Dates List.Numbers List.Generate List.Accumulate List.Sort List.Contains List.First List.Last ' +
            'Record.Field Record.FieldValues Record.FieldNames Record.FromList Record.FromTable ' +
            'Text.From Text.Combine Text.Split Text.Contains Text.Start Text.End Text.Replace Text.Length ' +
            'Text.Lower Text.Upper Text.Trim Text.Range Text.Remove Text.Select ' +
            'Number.From Number.ToText Number.Round Number.RoundDown Number.RoundUp Number.Mod Number.Power ' +
            'Date.From Date.Year Date.Month Date.Day Date.DayOfWeek Date.DayOfYear Date.WeekOfYear ' +
            'Date.QuarterOfYear Date.DaysInMonth Date.ToText Date.DayOfWeekName Date.AddDays Date.AddMonths ' +
            'DateTime.From DateTime.LocalNow DateTime.Date Duration.Days Duration.From ' +
            'Binary.FromText Binary.Decompress Json.Document Csv.Document ' +
            'Splitter.SplitByNothing Splitter.SplitTextByDelimiter ' +
            'Sql.Database Sql.Databases OData.Feed Web.Contents Excel.Workbook ' +
            'Comparer.OrdinalIgnoreCase',
          literal: 'true false null'
        },
        contains: [
          hljs.QUOTE_STRING_MODE,
          hljs.C_LINE_COMMENT_MODE,
          hljs.C_BLOCK_COMMENT_MODE,
          hljs.NUMBER_MODE,
          { className: 'string', begin: '"', end: '"', contains: [{ begin: '""' }] }
        ]
      };
    });
  }

  /* ── Scroll indicator logic ── */
  function initScrollIndicators() {
    document.querySelectorAll('.table-scroll-wrapper').forEach(function(wrapper) {
      if (wrapper.scrollWidth > wrapper.clientWidth) {
        wrapper.classList.add('has-overflow');
      } else {
        wrapper.classList.remove('has-overflow');
      }
      wrapper.classList.remove('scrolled-end');
      if (!wrapper.hasAttribute('data-scroll-listener')) {
        wrapper.setAttribute('data-scroll-listener', 'true');
        wrapper.addEventListener('scroll', function() {
          if (wrapper.scrollLeft + wrapper.clientWidth >= wrapper.scrollWidth - 2) {
            wrapper.classList.add('scrolled-end');
          } else {
            wrapper.classList.remove('scrolled-end');
          }
        });
      }
    });
  }
  if (typeof ResizeObserver !== 'undefined') {
    new ResizeObserver(function() {
      initScrollIndicators();
      initColumnToggle();
    }).observe(document.documentElement);
  }

  /* ── Mermaid ── */
  var mermaidIdCounter = 0;

  /** On mobile portrait swap flowchart direction: TD/TB ↔ LR */
  function swapMermaidDirection(src) {
    if (!isMobilePortrait()) return src;
    return src.replace(/^(\s*(?:graph|flowchart)\s+)(TD|TB|LR)\b/m, function(_m, prefix, dir) {
      return prefix + ((dir === 'LR') ? 'TD' : 'LR');
    });
  }

  async function initMermaid() {
    if (typeof mermaid === 'undefined') return;
    var sources = document.querySelectorAll('.doc-panel:not(.hidden) .mermaid-source, #help-modal:not(.hidden) .mermaid-source');
    if (sources.length === 0) return;
    for (var i = 0; i < sources.length; i++) {
      var el = sources[i];
      if (!el.getAttribute('data-mmd-src')) el.setAttribute('data-mmd-src', el.textContent);
      el.textContent = swapMermaidDirection(el.getAttribute('data-mmd-src'));
      el.classList.remove('mermaid-source');
      el.classList.add('mermaid');
      try {
        await mermaid.run({ nodes: [el] });
        wrapMermaidDiagram(el);
        if (onMermaidRendered) onMermaidRendered(el);
      } catch (err) {
        console.warn('Mermaid rendering error:', err);
        el.classList.add('mermaid-error');
        el.innerHTML = '<div class="text-sm text-neutral-400 italic py-4">' + (labels.mermaid_error || 'Diagram could not be rendered') + '</div>';
      }
    }
  }

  /* ── Mermaid zoom & fullscreen ── */
  function wrapMermaidDiagram(el) {
    if (el.parentElement && el.parentElement.classList.contains('mermaid-viewport')) return;
    var id = 'mmd-' + (mermaidIdCounter++);

    var wrapper = document.createElement('div');
    wrapper.className = 'mermaid-wrapper';
    wrapper.setAttribute('data-mmd-id', id);
    wrapper.setAttribute('data-zoom', '1');

    var controls = document.createElement('div');
    controls.className = 'mermaid-controls';
    var isGlobalEmbed = document.documentElement.classList.contains('embed-diagrams');
    var embedTitle = isGlobalEmbed ? (labels.unembed_diagram || 'Zoom mode') : (labels.embed_diagram || 'Embed diagram');
    controls.innerHTML =
      '<button type="button" class="mermaid-embed-btn' + (isGlobalEmbed ? ' active' : '') + '" title="' + embedTitle + '" data-embed-btn="' + id + '" onclick="mmdToggleEmbed(\'' + id + '\')">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M5 12h14"/><rect x="3" y="3" width="18" height="18" rx="2"/></svg>' +
      '</button>' +
      '<button type="button" title="' + (labels.zoom_out || 'Zoom out') + '" onclick="mmdZoom(\'' + id + '\', -1)">−</button>' +
      '<button type="button" class="mermaid-zoom-label" data-zoom-label="' + id + '">100%</button>' +
      '<button type="button" title="' + (labels.zoom_in || 'Zoom in') + '" onclick="mmdZoom(\'' + id + '\', 1)">+</button>' +
      '<button type="button" title="' + (labels.fullscreen || 'Fullscreen') + '" onclick="mmdFullscreen(\'' + id + '\')">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>' +
      '</button>';

    var viewport = document.createElement('div');
    viewport.className = 'mermaid-viewport';

    el.parentNode.insertBefore(wrapper, el);
    viewport.appendChild(el);
    wrapper.appendChild(controls);
    wrapper.appendChild(viewport);

    viewport.addEventListener('wheel', function(e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      mmdZoomAtCursor(id, e.deltaY < 0 ? 1 : -1, e, viewport);
    }, { passive: false });

    // Drag / pan
    (function(vp) {
      var startX, startY, scrollL, scrollT, dragging = false;
      vp.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        scrollL = vp.scrollLeft; scrollT = vp.scrollTop;
        vp.classList.add('dragging');
      });
      window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        vp.scrollLeft = scrollL - (e.clientX - startX);
        vp.scrollTop = scrollT - (e.clientY - startY);
      });
      window.addEventListener('mouseup', function() {
        if (!dragging) return;
        dragging = false;
        vp.classList.remove('dragging');
      });
    })(viewport);
  }

  function mmdZoomAtCursor(id, direction, e, viewport) {
    var wrapper = document.querySelector('[data-mmd-id="' + id + '"]');
    if (!wrapper) return;
    var oldZoom = parseFloat(wrapper.getAttribute('data-zoom')) || 1;
    var newZoom = direction > 0 ? Math.min(oldZoom + 0.25, 5) : Math.max(oldZoom - 0.25, 0.25);
    if (newZoom === oldZoom) return;

    var rect = viewport.getBoundingClientRect();
    var cursorX = e.clientX - rect.left + viewport.scrollLeft;
    var cursorY = e.clientY - rect.top + viewport.scrollTop;

    var ratio = newZoom / oldZoom;
    wrapper.setAttribute('data-zoom', newZoom.toString());
    var pre = wrapper.querySelector('pre.mermaid');
    if (pre) pre.style.transform = 'scale(' + newZoom + ')';

    viewport.scrollLeft = cursorX * ratio - (e.clientX - rect.left);
    viewport.scrollTop = cursorY * ratio - (e.clientY - rect.top);

    var label = wrapper.querySelector('[data-zoom-label="' + id + '"]');
    if (label) label.textContent = Math.round(newZoom * 100) + '%';
  }

  function mmdZoom(id, direction) {
    var wrapper = document.querySelector('[data-mmd-id="' + id + '"]');
    if (!wrapper) return;
    var zoom = parseFloat(wrapper.getAttribute('data-zoom')) || 1;
    zoom = direction > 0 ? Math.min(zoom + 0.25, 5) : Math.max(zoom - 0.25, 0.25);
    wrapper.setAttribute('data-zoom', zoom.toString());
    var pre = wrapper.querySelector('pre.mermaid');
    if (pre) pre.style.transform = 'scale(' + zoom + ')';
    var label = wrapper.querySelector('[data-zoom-label="' + id + '"]');
    if (label) label.textContent = Math.round(zoom * 100) + '%';
  }

  /* ── Fullscreen ── */
  var fsOverlay = null;
  var fsZoom = 1;
  var fsSourceId = null;

  function getOrCreateOverlay() {
    if (fsOverlay) return fsOverlay;
    var div = document.createElement('div');
    div.className = 'mermaid-fullscreen-overlay';
    div.innerHTML =
      '<div class="mermaid-fullscreen-header">' +
        '<button type="button" title="' + (labels.zoom_out || 'Zoom out') + '" onclick="mmdFsZoom(-1)">−</button>' +
        '<button type="button" class="fs-zoom-label" id="fs-zoom-label">100%</button>' +
        '<button type="button" title="' + (labels.zoom_in || 'Zoom in') + '" onclick="mmdFsZoom(1)">+</button>' +
        '<button type="button" title="' + (labels.close_esc || 'Close (Esc)') + '" onclick="mmdFsClose()">' +
          '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>' +
        '</button>' +
      '</div>' +
      '<div class="mermaid-fullscreen-body" id="fs-body"></div>';
    document.body.appendChild(div);

    var fsBody = div.querySelector('.mermaid-fullscreen-body');
    fsBody.addEventListener('wheel', function(e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      mmdFsZoomAtCursor(e.deltaY < 0 ? 1 : -1, e);
    }, { passive: false });

    // Drag / pan in fullscreen
    (function(body) {
      var startX, startY, scrollL, scrollT, dragging = false;
      body.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        scrollL = body.scrollLeft; scrollT = body.scrollTop;
        body.classList.add('dragging');
      });
      window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        body.scrollLeft = scrollL - (e.clientX - startX);
        body.scrollTop = scrollT - (e.clientY - startY);
      });
      window.addEventListener('mouseup', function() {
        if (!dragging) return;
        dragging = false;
        body.classList.remove('dragging');
      });
    })(fsBody);

    fsOverlay = div;
    return div;
  }

  function mmdFullscreen(id) {
    var wrapper = document.querySelector('[data-mmd-id="' + id + '"]');
    if (!wrapper) return;
    var svg = wrapper.querySelector('.mermaid-viewport svg');
    if (!svg) return;

    var overlay = getOrCreateOverlay();
    var body = overlay.querySelector('#fs-body');
    body.innerHTML = '';

    var container = document.createElement('div');
    container.className = 'fs-svg-container';
    var clone = svg.cloneNode(true);
    clone.removeAttribute('style');
    var vb = svg.getAttribute('viewBox');
    if (vb) { var p = vb.split(/[\s,]+/); clone.setAttribute('width', p[2]); clone.setAttribute('height', p[3]); }
    else { var r = svg.getBoundingClientRect(); clone.setAttribute('width', r.width); clone.setAttribute('height', r.height); }
    container.appendChild(clone);
    body.appendChild(container);

    fsZoom = 1;
    fsSourceId = id;
    container.style.transform = 'scale(1)';
    overlay.querySelector('#fs-zoom-label').textContent = '100%';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function mmdFsZoom(direction) {
    fsZoom = direction > 0 ? Math.min(fsZoom + 0.25, 5) : Math.max(fsZoom - 0.25, 0.25);
    if (!fsOverlay) return;
    var container = fsOverlay.querySelector('#fs-body .fs-svg-container');
    if (container) container.style.transform = 'scale(' + fsZoom + ')';
    fsOverlay.querySelector('#fs-zoom-label').textContent = Math.round(fsZoom * 100) + '%';
  }

  function mmdFsZoomAtCursor(direction, e) {
    if (!fsOverlay) return;
    var body = fsOverlay.querySelector('#fs-body');
    var container = body.querySelector('.fs-svg-container');
    if (!container) return;

    var oldZoom = fsZoom;
    fsZoom = direction > 0 ? Math.min(fsZoom + 0.25, 5) : Math.max(fsZoom - 0.25, 0.25);
    if (fsZoom === oldZoom) return;

    var rect = body.getBoundingClientRect();
    var cursorX = e.clientX - rect.left + body.scrollLeft;
    var cursorY = e.clientY - rect.top + body.scrollTop;
    var ratio = fsZoom / oldZoom;

    container.style.transform = 'scale(' + fsZoom + ')';
    body.scrollLeft = cursorX * ratio - (e.clientX - rect.left);
    body.scrollTop = cursorY * ratio - (e.clientY - rect.top);

    fsOverlay.querySelector('#fs-zoom-label').textContent = Math.round(fsZoom * 100) + '%';
  }

  function mmdFsClose() {
    if (fsOverlay) {
      fsOverlay.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') mmdFsClose();
  });

  /* ── Embed toggle (global) ── */
  function updateEmbedToggleIcon() {
    var isEmbed = document.documentElement.classList.contains('embed-diagrams');
    var iconExpand = document.querySelector('#embed-toggle .embed-icon-expand');
    var iconCollapse = document.querySelector('#embed-toggle .embed-icon-collapse');
    if (iconExpand) iconExpand.style.display = isEmbed ? 'none' : '';
    if (iconCollapse) iconCollapse.style.display = isEmbed ? '' : 'none';
  }

  /* ── Per-visual embed toggle ── */
  function updateAllEmbedBtnIcons() {
    document.querySelectorAll('.mermaid-embed-btn').forEach(function(btn) {
      var id = btn.getAttribute('data-embed-btn');
      var wrapper = document.querySelector('[data-mmd-id="' + id + '"]');
      if (!wrapper) return;
      var vp = wrapper.querySelector('.mermaid-viewport');
      var override = vp ? vp.getAttribute('data-embed-override') : null;
      var isGlobal = document.documentElement.classList.contains('embed-diagrams');
      var isEmbedded = override === 'embed' || (isGlobal && override !== 'zoom');
      btn.classList.toggle('active', isEmbedded);
      btn.title = isEmbedded ? (labels.unembed_diagram || 'Zoom mode') : (labels.embed_diagram || 'Embed diagram');
    });
  }

  function mmdToggleEmbed(id) {
    var wrapper = document.querySelector('[data-mmd-id="' + id + '"]');
    if (!wrapper) return;
    var vp = wrapper.querySelector('.mermaid-viewport');
    if (!vp) return;
    var current = vp.getAttribute('data-embed-override');
    var isGlobal = document.documentElement.classList.contains('embed-diagrams');

    if (current === 'embed') {
      vp.removeAttribute('data-embed-override');
    } else if (current === 'zoom') {
      vp.removeAttribute('data-embed-override');
    } else {
      vp.setAttribute('data-embed-override', isGlobal ? 'zoom' : 'embed');
    }
    updateAllEmbedBtnIcons();
  }

  /* ── SVG Embeds ── */
  var svgIdCounter = 0;

  function initSvgEmbeds() {
    var sources = document.querySelectorAll('.doc-panel:not(.hidden) .svg-source, #help-modal:not(.hidden) .svg-source');
    for (var i = 0; i < sources.length; i++) {
      wrapSvgEmbed(sources[i]);
    }
  }

  function wrapSvgEmbed(el) {
    if (el.parentElement && el.parentElement.classList.contains('svg-embed-viewport')) return;
    var id = 'svg-' + (svgIdCounter++);
    var animated = el.getAttribute('data-animated') === 'true';

    var wrapper = document.createElement('div');
    wrapper.className = 'svg-embed-wrapper';
    wrapper.setAttribute('data-svg-id', id);
    wrapper.setAttribute('data-zoom', '1');

    var controls = document.createElement('div');
    controls.className = 'svg-embed-controls';
    var html = '';
    if (animated) {
      html += '<button type="button" class="svg-pause-btn" title="' + (labels.pause_animation || 'Pause animation') + '" data-svg-pause="' + id + '" onclick="svgToggleAnimation(\'' + id + '\')">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>' +
        '</button>';
    }
    html +=
      '<button type="button" title="' + (labels.zoom_out || 'Zoom out') + '" onclick="svgZoom(\'' + id + '\', -1)">\u2212</button>' +
      '<button type="button" class="svg-embed-zoom-label" data-svg-zoom-label="' + id + '">100%</button>' +
      '<button type="button" title="' + (labels.zoom_in || 'Zoom in') + '" onclick="svgZoom(\'' + id + '\', 1)">+</button>' +
      '<button type="button" title="' + (labels.fullscreen || 'Fullscreen') + '" onclick="svgFullscreen(\'' + id + '\')">' +
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H5a2 2 0 00-2 2v3m18 0V5a2 2 0 00-2-2h-3m0 18h3a2 2 0 002-2v-3M3 16v3a2 2 0 002 2h3"/></svg>' +
      '</button>';
    controls.innerHTML = html;

    var viewport = document.createElement('div');
    viewport.className = 'svg-embed-viewport';

    var inner = document.createElement('div');
    inner.className = 'svg-embed-inner';
    inner.innerHTML = el.innerHTML;

    el.parentNode.insertBefore(wrapper, el);
    viewport.appendChild(inner);
    wrapper.appendChild(controls);
    wrapper.appendChild(viewport);
    el.remove();

    viewport.addEventListener('wheel', function(e) {
      if (e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      svgZoomAtCursor(id, e.deltaY < 0 ? 1 : -1, e, viewport);
    }, { passive: false });

    (function(vp) {
      var startX, startY, scrollL, scrollT, dragging = false;
      vp.addEventListener('mousedown', function(e) {
        if (e.button !== 0) return;
        dragging = true;
        startX = e.clientX; startY = e.clientY;
        scrollL = vp.scrollLeft; scrollT = vp.scrollTop;
        vp.classList.add('dragging');
      });
      window.addEventListener('mousemove', function(e) {
        if (!dragging) return;
        vp.scrollLeft = scrollL - (e.clientX - startX);
        vp.scrollTop = scrollT - (e.clientY - startY);
      });
      window.addEventListener('mouseup', function() {
        if (!dragging) return;
        dragging = false;
        vp.classList.remove('dragging');
      });
    })(viewport);
  }

  function svgZoom(id, direction) {
    var wrapper = document.querySelector('[data-svg-id="' + id + '"]');
    if (!wrapper) return;
    var zoom = parseFloat(wrapper.getAttribute('data-zoom')) || 1;
    zoom = direction > 0 ? Math.min(zoom + 0.25, 5) : Math.max(zoom - 0.25, 0.25);
    wrapper.setAttribute('data-zoom', zoom.toString());
    var inner = wrapper.querySelector('.svg-embed-inner');
    if (inner) inner.style.transform = 'scale(' + zoom + ')';
    var label = wrapper.querySelector('[data-svg-zoom-label="' + id + '"]');
    if (label) label.textContent = Math.round(zoom * 100) + '%';
  }

  function svgZoomAtCursor(id, direction, e, viewport) {
    var wrapper = document.querySelector('[data-svg-id="' + id + '"]');
    if (!wrapper) return;
    var oldZoom = parseFloat(wrapper.getAttribute('data-zoom')) || 1;
    var newZoom = direction > 0 ? Math.min(oldZoom + 0.25, 5) : Math.max(oldZoom - 0.25, 0.25);
    if (newZoom === oldZoom) return;
    var rect = viewport.getBoundingClientRect();
    var cursorX = e.clientX - rect.left + viewport.scrollLeft;
    var cursorY = e.clientY - rect.top + viewport.scrollTop;
    var ratio = newZoom / oldZoom;
    wrapper.setAttribute('data-zoom', newZoom.toString());
    var inner = wrapper.querySelector('.svg-embed-inner');
    if (inner) inner.style.transform = 'scale(' + newZoom + ')';
    viewport.scrollLeft = cursorX * ratio - (e.clientX - rect.left);
    viewport.scrollTop = cursorY * ratio - (e.clientY - rect.top);
    var label = wrapper.querySelector('[data-svg-zoom-label="' + id + '"]');
    if (label) label.textContent = Math.round(newZoom * 100) + '%';
  }

  function svgToggleAnimation(id) {
    var wrapper = document.querySelector('[data-svg-id="' + id + '"]');
    if (!wrapper) return;
    var btn = wrapper.querySelector('[data-svg-pause="' + id + '"]');
    var svgEl = wrapper.querySelector('.svg-embed-inner svg');
    if (!svgEl) return;
    var paused = wrapper.getAttribute('data-paused') === 'true';
    if (paused) {
      wrapper.setAttribute('data-paused', 'false');
      var pauseStyle = svgEl.querySelector('style[data-pause-style]');
      if (pauseStyle) pauseStyle.remove();
      if (typeof svgEl.unpauseAnimations === 'function') svgEl.unpauseAnimations();
      if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>';
      if (btn) btn.title = labels.pause_animation || 'Pause animation';
    } else {
      wrapper.setAttribute('data-paused', 'true');
      var style = document.createElementNS('http://www.w3.org/2000/svg', 'style');
      style.setAttribute('data-pause-style', 'true');
      style.textContent = '* { animation-play-state: paused !important; }';
      svgEl.insertBefore(style, svgEl.firstChild);
      if (typeof svgEl.pauseAnimations === 'function') svgEl.pauseAnimations();
      if (btn) btn.innerHTML = '<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><polygon points="6,4 20,12 6,20"/></svg>';
      if (btn) btn.title = labels.resume_animation || 'Resume animation';
    }
  }

  function svgFullscreen(id) {
    var wrapper = document.querySelector('[data-svg-id="' + id + '"]');
    if (!wrapper) return;
    var svg = wrapper.querySelector('.svg-embed-inner svg');
    if (!svg) return;
    var overlay = getOrCreateOverlay();
    var body = overlay.querySelector('#fs-body');
    body.innerHTML = '';
    var container = document.createElement('div');
    container.className = 'fs-svg-container';
    var clone = svg.cloneNode(true);
    clone.removeAttribute('style');
    var vb = svg.getAttribute('viewBox');
    if (vb) { var p = vb.split(/[\s,]+/); clone.setAttribute('width', p[2]); clone.setAttribute('height', p[3]); }
    else { var r = svg.getBoundingClientRect(); clone.setAttribute('width', r.width); clone.setAttribute('height', r.height); }
    container.appendChild(clone);
    body.appendChild(container);
    fsZoom = 1;
    fsSourceId = id;
    container.style.transform = 'scale(1)';
    overlay.querySelector('#fs-zoom-label').textContent = '100%';
    overlay.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  /* ── Dark mode ── */
  function updateHljsTheme() {
    var isDark = document.documentElement.classList.contains('dark');
    var light = document.getElementById('hljs-theme-light');
    var dark = document.getElementById('hljs-theme-dark');
    if (light) light.disabled = isDark;
    if (dark) dark.disabled = !isDark;
  }

  async function reinitMermaid() {
    if (typeof mermaid === 'undefined') return;
    var isDark = document.documentElement.classList.contains('dark');
    mermaid.initialize({ startOnLoad: false, theme: isDark ? 'dark' : 'default', securityLevel: 'loose', flowchart: { useMaxWidth: true }, er: { useMaxWidth: true } });
    document.querySelectorAll('.mermaid-wrapper').forEach(function(w) {
      var pre = w.querySelector('pre.mermaid');
      if (pre && pre.getAttribute('data-mmd-src')) {
        var newPre = document.createElement('pre');
        newPre.className = 'mermaid-source';
        newPre.textContent = pre.getAttribute('data-mmd-src');
        w.parentNode.insertBefore(newPre, w);
        w.remove();
      }
    });
    document.querySelectorAll('pre.mermaid:not(.mermaid-source)').forEach(function(el) {
      if (el.getAttribute('data-mmd-src')) {
        var newPre = document.createElement('pre');
        newPre.className = 'mermaid-source';
        newPre.textContent = el.getAttribute('data-mmd-src');
        el.parentNode.insertBefore(newPre, el);
        el.remove();
      }
    });
    await initMermaid();
  }

  /* ── Copy-to-clipboard for code blocks ── */
  var copySvgClipboard = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg>';
  var copySvgCheck = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';

  function addCopyButtons() {
    document.querySelectorAll('.prose pre:not(.mermaid):not(.mermaid-source)').forEach(function(pre) {
      if (pre.querySelector('.copy-code-btn')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'copy-code-btn';
      btn.title = 'Copy';
      btn.innerHTML = copySvgClipboard;
      btn.addEventListener('click', function() {
        var code = pre.querySelector('code');
        var text = code ? code.textContent : pre.textContent;
        navigator.clipboard.writeText(text).then(function() {
          btn.innerHTML = copySvgCheck;
          btn.classList.add('copied');
          setTimeout(function() {
            btn.innerHTML = copySvgClipboard;
            btn.classList.remove('copied');
          }, 2000);
        });
      });
      pre.appendChild(btn);
    });
  }

  /* ── Sortable tables ── */
  function makeSortable(table) {
    if (table.getAttribute('data-sortable')) return;
    table.setAttribute('data-sortable', 'true');
    var headers = table.querySelectorAll('th');
    if (!headers.length) return;
    headers.forEach(function(th, colIndex) {
      th.setAttribute('data-sort-dir', '');
      var indicator = document.createElement('span');
      indicator.className = 'sort-indicator';
      indicator.textContent = '\u21C5';
      th.appendChild(indicator);
      th.addEventListener('click', function() {
        var dir = th.getAttribute('data-sort-dir');
        var newDir = dir === 'asc' ? 'desc' : 'asc';
        headers.forEach(function(h) {
          h.setAttribute('data-sort-dir', '');
          var ind = h.querySelector('.sort-indicator');
          if (ind) { ind.textContent = '\u21C5'; ind.classList.remove('active'); }
        });
        th.setAttribute('data-sort-dir', newDir);
        indicator.textContent = newDir === 'asc' ? '\u2191' : '\u2193';
        indicator.classList.add('active');
        sortTable(table, colIndex, newDir);
      });
    });
  }

  function sortTable(table, colIndex, dir) {
    var tbody = table.querySelector('tbody') || table;
    var rows = Array.from(tbody.querySelectorAll('tr'));
    var headerRow = null;
    if (!table.querySelector('thead') && rows.length > 0 && rows[0].querySelector('th')) {
      headerRow = rows.shift();
    }
    rows.sort(function(a, b) {
      var cellA = a.children[colIndex];
      var cellB = b.children[colIndex];
      if (!cellA || !cellB) return 0;
      var valA = (cellA.textContent || '').trim();
      var valB = (cellB.textContent || '').trim();
      var numA = parseFloat(valA.replace(/[^0-9.\-]/g, ''));
      var numB = parseFloat(valB.replace(/[^0-9.\-]/g, ''));
      if (!isNaN(numA) && !isNaN(numB)) {
        return dir === 'asc' ? numA - numB : numB - numA;
      }
      var cmp = valA.localeCompare(valB, undefined, { numeric: true, sensitivity: 'base' });
      return dir === 'asc' ? cmp : -cmp;
    });
    rows.forEach(function(row) { tbody.appendChild(row); });
  }

  function initSortableTables() {
    document.querySelectorAll('.prose table').forEach(makeSortable);
  }

  /* ── Column-Toggle ── */
  function getColumnToggleKey(wrapper) {
    // Build a storage key from the closest tab panel id
    var panel = wrapper.closest('.doc-panel');
    var panelId = panel ? panel.id : 'default';
    // Use table index within panel to disambiguate multiple tables
    var tables = panel ? panel.querySelectorAll('.table-scroll-wrapper') : document.querySelectorAll('.table-scroll-wrapper');
    var idx = Array.from(tables).indexOf(wrapper);
    return 'semadoc-coltoggle-' + panelId + '-' + idx;
  }

  function initColumnToggle() {
    document.querySelectorAll('.table-scroll-wrapper').forEach(function(wrapper) {
      // Skip if already initialized
      if (wrapper.getAttribute('data-coltoggle-init')) return;

      var table = wrapper.querySelector('table');
      if (!table) return;
      var headers = table.querySelectorAll('th');
      if (headers.length < 3) return; // No point toggling on tiny tables

      var hasOverflow = wrapper.scrollWidth > wrapper.clientWidth;

      wrapper.setAttribute('data-coltoggle-init', 'true');

      // Create toolbar
      var toolbar = document.createElement('div');
      // On desktop without overflow: hidden by default, shown via CSS on touch devices.
      // On any device with overflow: always visible.
      toolbar.className = 'column-toggle-toolbar' + (hasOverflow ? '' : ' column-toggle-touch-only');

      var toolbarLabel = document.createElement('span');
      toolbarLabel.className = 'column-toggle-label';
      toolbarLabel.textContent = labels.columns_label || 'Columns:';
      toolbar.appendChild(toolbarLabel);

      var chipsContainer = document.createElement('div');
      chipsContainer.className = 'column-toggle-chips';

      // Restore saved state
      var storageKey = getColumnToggleKey(wrapper);
      var savedState = null;
      try {
        var raw = sessionStorage.getItem(storageKey);
        if (raw) savedState = JSON.parse(raw);
      } catch(e) { /* ignore */ }

      headers.forEach(function(th, colIndex) {
        var headerText = th.textContent.replace(/[\u21C5\u2191\u2193]/g, '').trim();
        if (!headerText) return;

        var chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'column-toggle-chip active';
        chip.setAttribute('data-col-index', colIndex);
        chip.textContent = headerText;

        // Apply saved state
        var isVisible = savedState ? savedState[colIndex] !== false : true;
        if (!isVisible) {
          chip.classList.remove('active');
          toggleColumn(table, colIndex, false);
        }

        chip.addEventListener('click', function() {
          var isActive = chip.classList.contains('active');
          // Prevent hiding the last visible column
          if (isActive) {
            var activeChips = chipsContainer.querySelectorAll('.column-toggle-chip.active');
            if (activeChips.length <= 1) return;
          }
          chip.classList.toggle('active');
          toggleColumn(table, colIndex, !isActive);
          saveColumnState(wrapper, chipsContainer);
          // Re-check overflow after toggling
          initScrollIndicators();
        });

        chipsContainer.appendChild(chip);
      });

      toolbar.appendChild(chipsContainer);
      wrapper.parentNode.insertBefore(toolbar, wrapper);
    });
  }

  function toggleColumn(table, colIndex, visible) {
    var display = visible ? '' : 'none';
    table.querySelectorAll('tr').forEach(function(row) {
      var cell = row.children[colIndex];
      if (cell) cell.style.display = display;
    });
  }

  function saveColumnState(wrapper, chipsContainer) {
    var storageKey = getColumnToggleKey(wrapper);
    var state = {};
    chipsContainer.querySelectorAll('.column-toggle-chip').forEach(function(chip) {
      var idx = parseInt(chip.getAttribute('data-col-index'), 10);
      state[idx] = chip.classList.contains('active');
    });
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch(e) { /* ignore */ }
  }

  /* ── Toolbar event listeners ── */

  // Print button
  var printBtn = document.getElementById('print-btn');
  if (printBtn) {
    printBtn.addEventListener('click', function() { window.print(); });
  }

  // HTML Export button
  var exportBtn = document.getElementById('export-html-btn');
  if (exportBtn) {
    exportBtn.addEventListener('click', function() {
      var activePanel = document.querySelector('.doc-panel:not(.hidden)');
      if (!activePanel) return;

      var clone = activePanel.cloneNode(true);

      var removeSelectors = [
        '.mermaid-controls', '.svg-embed-controls', '.copy-code-btn',
        '.mermaid-fullscreen-overlay', '.sort-indicator', '.column-toggle-toolbar'
      ];
      removeSelectors.forEach(function(sel) {
        clone.querySelectorAll(sel).forEach(function(el) { el.remove(); });
      });
      // Restore any hidden columns in the export clone
      clone.querySelectorAll('td[style*="display: none"], th[style*="display: none"]').forEach(function(cell) {
        cell.style.display = '';
      });

      clone.querySelectorAll('.mermaid-viewport, .svg-embed-viewport').forEach(function(vp) {
        vp.style.maxHeight = 'none';
        vp.style.overflow = 'visible';
        vp.style.cursor = 'default';
      });
      clone.querySelectorAll('.mermaid-viewport > pre.mermaid, .svg-embed-inner').forEach(function(el) {
        el.style.transform = 'none';
      });
      clone.querySelectorAll('.mermaid-viewport svg, .svg-embed-inner svg').forEach(function(svg) {
        svg.style.maxWidth = '100%';
        svg.style.height = 'auto';
      });
      clone.querySelectorAll('.table-scroll-wrapper').forEach(function(tw) {
        tw.style.overflowX = 'visible';
      });

      var cssText = '';
      Array.from(document.styleSheets).forEach(function(sheet) {
        try {
          var rules = sheet.cssRules || sheet.rules;
          if (rules) {
            Array.from(rules).forEach(function(rule) {
              cssText += rule.cssText + '\n';
            });
          }
        } catch(e) { /* Cross-origin sheet */ }
      });

      var isDark = document.documentElement.classList.contains('dark');
      var hljsLink = document.getElementById(isDark ? 'hljs-theme-dark' : 'hljs-theme-light');
      var fetchPromise = hljsLink && hljsLink.href
        ? fetch(hljsLink.href).then(function(r) { return r.text(); }).catch(function() { return ''; })
        : Promise.resolve('');

      var images = clone.querySelectorAll('img[src]');
      var imgPromises = Array.from(images).map(function(img) {
        if (img.src.startsWith('data:')) return Promise.resolve();
        return fetch(img.src)
          .then(function(r) { return r.blob(); })
          .then(function(blob) {
            return new Promise(function(resolve) {
              var reader = new FileReader();
              reader.onloadend = function() {
                img.setAttribute('src', reader.result);
                resolve();
              };
              reader.readAsDataURL(blob);
            });
          })
          .catch(function() { /* Image not loadable — src stays */ });
      });

      Promise.all([fetchPromise, Promise.all(imgPromises)]).then(function(results) {
        var hljsCss = results[0];
        var darkClass = isDark ? ' class="dark"' : '';
        var title = getTitleForExport();
        var safeTitle = title.replace(/[\/\\:*?"<>|]/g, '_').trim() || 'SemaDoc-Export';

        var html = '<!DOCTYPE html>\n<html lang="de"' + darkClass + '>\n<head>\n'
          + '<meta charset="utf-8">\n'
          + '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
          + '<title>' + safeTitle + '</title>\n'
          + '<style>\n' + cssText + '\n' + hljsCss + '\n</style>\n'
          + '</head>\n<body style="margin:2rem;' + (isDark ? 'background:#0f172a;color:#e2e8f0;' : 'background:white;color:#1a1a1a;') + '">\n'
          + clone.innerHTML + '\n'
          + '</body>\n</html>';

        var blob = new Blob([html], { type: 'text/html;charset=utf-8' });
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = safeTitle + '.html';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      });
    });
  }

  // Dark mode toggle
  var darkToggle = document.getElementById('dark-toggle');
  if (darkToggle) {
    darkToggle.addEventListener('click', function() {
      document.documentElement.classList.toggle('dark');
      var isDark = document.documentElement.classList.contains('dark');
      localStorage.setItem('semadoc-theme', isDark ? 'dark' : 'light');
      updateHljsTheme();
      reinitMermaid();
    });
  }

  // Embed toggle (global)
  var embedToggle = document.getElementById('embed-toggle');
  if (embedToggle) {
    updateEmbedToggleIcon();
    embedToggle.addEventListener('click', function() {
      document.documentElement.classList.toggle('embed-diagrams');
      var isEmbed = document.documentElement.classList.contains('embed-diagrams');
      localStorage.setItem('semadoc-embed', isEmbed ? 'true' : 'false');
      updateEmbedToggleIcon();
      updateAllEmbedBtnIcons();
    });
  }

  /* ── Expose functions as window globals ── */
  window.registerCustomLanguages = registerCustomLanguages;
  window.initMermaid = initMermaid;
  window.initSvgEmbeds = initSvgEmbeds;
  window.initScrollIndicators = initScrollIndicators;
  window.addCopyButtons = addCopyButtons;
  window.initSortableTables = initSortableTables;
  window.initColumnToggle = initColumnToggle;
  window.reinitMermaid = reinitMermaid;
  window.updateEmbedToggleIcon = updateEmbedToggleIcon;
  window.updateAllEmbedBtnIcons = updateAllEmbedBtnIcons;
  window.mmdZoom = mmdZoom;
  window.mmdFullscreen = mmdFullscreen;
  window.mmdFsZoom = mmdFsZoom;
  window.mmdFsZoomAtCursor = mmdFsZoomAtCursor;
  window.mmdFsClose = mmdFsClose;
  window.mmdToggleEmbed = mmdToggleEmbed;
  window.svgZoom = svgZoom;
  window.svgZoomAtCursor = svgZoomAtCursor;
  window.svgToggleAnimation = svgToggleAnimation;
  window.svgFullscreen = svgFullscreen;
}
