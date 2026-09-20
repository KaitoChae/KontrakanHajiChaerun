(function(){
  document.documentElement.className += ' js-ready';

  var selector = document.getElementById('language-selector');
  var mapImage = document.getElementById('location-map');
  var metaDescription = document.getElementById('meta-description');
  var currentLang = 'id';

  function storageGet(key){
    try { return window.localStorage ? localStorage.getItem(key) : null; } catch(e){ return null; }
  }
  function storageSet(key, value){
    try { if (window.localStorage) localStorage.setItem(key, value); } catch(e){}
  }

  function formatDate(lang, date){
    var d = date.getDate();
    var m = date.getMonth();
    var y = date.getFullYear();
    var monthsId = ['Januari','Februari','Maret','April','Mei','Juni','Juli','Agustus','September','Oktober','November','Desember'];
    var monthsEn = ['January','February','March','April','May','June','July','August','September','October','November','December'];
    if (lang === 'id') return d + ' ' + monthsId[m] + ' ' + y;
    if (lang === 'en') return monthsEn[m] + ' ' + d + ', ' + y;
    if (lang === 'cn' || lang === 'tw') return y + '年' + (m+1) + '月' + d + '日';
    if (lang === 'jp') return y + '年' + (m+1) + '月' + d + '日';
    return d + ' ' + monthsId[m] + ' ' + y;
  }

  function setTextByAttr(attr, dict, htmlMode){
    var nodes = document.querySelectorAll('[' + attr + ']');
    for (var i=0; i<nodes.length; i++){
      var key = nodes[i].getAttribute(attr);
      if (dict[key] !== undefined){
        if (htmlMode) nodes[i].innerHTML = dict[key];
        else nodes[i].textContent = dict[key];
      }
    }
  }

  function applyLanguage(lang){
    var all = window.I18N || {};
    if (!all[lang]) lang = 'id';
    currentLang = lang;
    var t = all[lang];

    document.documentElement.lang = (lang === 'id' ? 'id' : lang === 'en' ? 'en' : lang === 'cn' ? 'zh-CN' : lang === 'tw' ? 'zh-TW' : 'ja');
    document.body.setAttribute('data-lang', lang);
    document.title = t.title || document.title;
    if (metaDescription && t.meta) metaDescription.setAttribute('content', t.meta);

    setTextByAttr('data-i18n', t, false);
    setTextByAttr('data-i18n-html', t, true);

    var altNodes = document.querySelectorAll('[data-i18n-alt]');
    for (var i=0; i<altNodes.length; i++){
      var key = altNodes[i].getAttribute('data-i18n-alt');
      if (t[key] !== undefined) altNodes[i].setAttribute('alt', t[key]);
    }

    if (mapImage){
      mapImage.setAttribute('src', 'assets/location-map-' + lang + '.svg?v=11');
      if (t.map_alt) mapImage.setAttribute('alt', t.map_alt);
    }

    var cfg = window.PROPERTY_CONFIG || {};
    var whatsappNumber = String(cfg.contact || '082216945656').replace(/\D/g, '');
    if (whatsappNumber.indexOf('0') === 0) whatsappNumber = '62' + whatsappNumber.substring(1);
    var whatsappUrl = 'https://wa.me/' + whatsappNumber;
    if (t.whatsapp_message) whatsappUrl += '?text=' + encodeURIComponent(t.whatsapp_message);
    var whatsappLinks = document.querySelectorAll('.whatsapp-link');
    for (var w=0; w<whatsappLinks.length; w++){
      whatsappLinks[w].setAttribute('href', whatsappUrl);
      whatsappLinks[w].setAttribute('target', '_blank');
      whatsappLinks[w].setAttribute('rel', 'noopener');
    }

    var today = formatDate(lang, new Date());
    var heroDate = document.getElementById('hero-date');
    var statusDate = document.getElementById('status-date');
    if (heroDate) heroDate.textContent = (t.updated_prefix || '') + today;
    if (statusDate) statusDate.textContent = today;

    if (cfg.available === true){
      var footerStatus = document.getElementById('footer-status');
      if (footerStatus){
        var availableText = lang === 'id' ? 'Status kamar: Tersedia' :
          lang === 'en' ? 'Room status: Available' :
          lang === 'cn' ? '房源状态：有空房' :
          lang === 'tw' ? '房源狀態：有空房' :
          '空室状況：空室あり';
        footerStatus.textContent = availableText;
      }
    }

    if (selector) selector.value = lang;
    storageSet('kontrakan-language', lang);
  }

  if (selector){
    selector.addEventListener('change', function(){ applyLanguage(selector.value); });
  }

  var saved = storageGet('kontrakan-language');
  applyLanguage(saved || 'id');

  var menu = document.querySelector('.menu');
  var nav = document.getElementById('main-nav');
  if (menu && nav){
    menu.addEventListener('click', function(){
      var open = nav.classList.contains('open');
      if (open){
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
      } else {
        nav.classList.add('open');
        menu.setAttribute('aria-expanded','true');
      }
    });
    var links = nav.getElementsByTagName('a');
    for (var i=0; i<links.length; i++){
      links[i].addEventListener('click', function(){
        nav.classList.remove('open');
        menu.setAttribute('aria-expanded','false');
      });
    }
  }

  var items = document.querySelectorAll('.reveal');
  function revealNow(el){ el.classList.add('is-visible'); }
  if ('IntersectionObserver' in window){
    var observer = new IntersectionObserver(function(entries){
      for (var i=0; i<entries.length; i++){
        if (entries[i].isIntersecting){
          revealNow(entries[i].target);
          observer.unobserve(entries[i].target);
        }
      }
    }, {threshold:0.04, rootMargin:'0px 0px -3% 0px'});
    for (var j=0; j<items.length; j++) observer.observe(items[j]);
  } else {
    for (var k=0; k<items.length; k++) revealNow(items[k]);
  }

  window.setTimeout(function(){
    for (var i=0; i<items.length; i++){
      if (items[i].getBoundingClientRect().top < window.innerHeight * 1.6) revealNow(items[i]);
    }
  }, 350);
})();