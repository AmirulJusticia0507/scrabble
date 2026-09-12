const page = document.body.dataset.game;
const games = {scrabble:['01','Scrabble','Susun huruf. Temukan kata. Pecahkan rekormu.'],carrom:['02','Karambol','Bidik dengan tenang. Satu tembakan, banyak kemungkinan.'],pachinko:['03','Pachinko','Jatuhkan bola dan biarkan keberuntungan bekerja.']};
const [number,title,description]=games[page];
document.getElementById('header').innerHTML=`<header class="topbar"><a class="brand" href="index.html"><b class="brand-mark">a</b> little<span>arcade.</span></a><nav aria-label="Pilih permainan"><a href="index.html" ${page==='scrabble'?'aria-current="page"':''}>Scrabble</a><a href="index2.html" ${page==='carrom'?'aria-current="page"':''}>Karambol</a><a href="index3.html" ${page==='pachinko'?'aria-current="page"':''}>Pachinko</a></nav><span class="tag online">Saatnya bermain</span></header><section class="intro"><div><span class="eyebrow">THE LITTLE ARCADE / GAME ${number}</span><h1>${title}<span style="color:var(--accent)">.</span></h1><p>${description}</p></div><span class="pill">✧ Santai sejenak, main sebentar</span></section>`;
document.getElementById('footer').innerHTML='<span>little arcade. &nbsp; Ruang kecil untuk bermain.</span><span>TAKE A BREAK. MAKE A PLAY.</span>';
const $=id=>document.getElementById(id);
const say=text=>{$('notice').textContent=text;};
const readBest=key=>{try{return Number(localStorage.getItem(key))||0}catch{return 0}};
const saveBest=(key,value)=>{try{localStorage.setItem(key,value)}catch{}};
