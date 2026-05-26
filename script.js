"use strict";

;(function() {

  function loop(){
    document.querySelectorAll('embed-portal:not([content-loaded])').forEach(function(embed){
      if(embed.hasAttribute('content-loaded')){return;}
      embed.setAttribute('content-loaded', '');

      const src = embed.getAttribute('src');
      if(!src.startsWith('/') || src.startsWith(window.location.origin)){
        const err = new Error('Embed Portal only supports same-origin requests.');

        src = src.replace(/[^\x20-\x7E]/g, '');
        console.error("Failed to fetch HTML page '"+src+"':", err);
        const errElm = document.createElement('error-msg');
        errElm.textContent = "Failed to fetch HTML page '"+src+"': "+err;
        embed.appendChild(errElm);

        // trigger error event
        const errorEvent = new CustomEvent('error', {
          bubbles: false,
          cancelable: false,
          detail: {message: err.message},
        });
        embed.dispatchEvent(errorEvent);

        return;
      }

      fetch(src, {
        method: 'GET',
        headers: {
          'X-Fetch-Dest': 'embed-portal',
        }
      }).then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! Status: ${res.status}`);
        }
        return res.text();
      }).then(html => {
        const shadow = embed.attachShadow({ mode: 'open' });
        let head = html.replace(/^.*?<head(?: [^>]*?|)>(.*?)<\/head>.*?$/s, '$1');

        let links = '';
        head.replace(/<link\b([^>]*?|)\/?>/gs, function(str, atts){
          if(/\brel=(["'])stylesheet\1/.test(atts)){
            links += str;
          }
        });

        head.replace(/<style\b(?:[^>]*?|)>.*?<\/style>/gs, function(str){
          links += str;
        });

        if(!embed.hasAttribute('noscript')){
          head.replace(/<script\b([^>]*?|)>(.*?)<\/script>/gs, function(_, atts, js){
            const script = document.createElement('script');
            atts.replace(/\bsrc="(.*?)"/, (_, src) => {
              script.src = src;
            });
            if(/\basync\b/.test(atts)){
              script.async = true;
            }
            if(/\bdefer\b/.test(atts)){
              script.defer = true;
            }
            if(js.trim().length > 0){
              script.textContent = js;
            }
            document.head.appendChild(script);
          });
        }

        /* html = html.replace(/^.*?<body(?: [^>]*?|)>(.*?)<\/body>.*?$/s, '$1');
        html = html.replace(/^.*?<main(?: [^>]*?|)>(.*?)<\/main>.*?$/s, '$1');
        shadow.innerHTML = links+html; */

        shadow.innerHTML = '<head>'+links+'</head>'+html.replace(/^.*?(<body(?: [^>]*?|)>.*?<\/body>).*?$/s, '$1');

        // trigger onload event
        setTimeout(function(){
          const loadEvent = new CustomEvent('load', {
            detail: {
              root: shadow,
            },
            bubbles: false,
            cancelable: false,
          });
          embed.dispatchEvent(loadEvent);
  
          if(embed.hasAttribute('onload')){
            try {
              new Function(embed.getAttribute('onload')).call(embed);
            } catch (err) {
              console.error("Error executing inline onload:", err);
            }
          }
        }, 100);
      }).catch(err => {
        src = src.replace(/[^\x20-\x7E]/g, '');
        console.error("Failed to fetch HTML page '"+src+"':", err);
        const errElm = document.createElement('error-msg');
        errElm.textContent = "Failed to fetch HTML page '"+src+"': "+err;
        embed.appendChild(errElm);

        // trigger error event
        const errorEvent = new CustomEvent('error', {
          bubbles: false,
          cancelable: false,
          detail: {message: err.message},
        });
        embed.dispatchEvent(errorEvent);
      });
    });
  }
  loop();
  setInterval(loop, 250);

})();
