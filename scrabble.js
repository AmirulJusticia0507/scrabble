const points={A:1,B:3,C:3,D:2,E:1,F:4,G:2,H:4,I:1,J:8,K:5,L:1,M:3,N:1,O:1,P:3,Q:10,R:1,S:1,T:1,U:1,V:4,W:4,X:8,Y:4,Z:10};
const bag='AAAAAAAABCDEEEEEEEEEFGHIIIIIIJKLMNNOOOOOPRRRRSSSSTTTTTUUUVWY';
let rack=[],cells=Array(100).fill(null),pending=new Map(),selected=null,total=0,wordCount=0,busy=false,best=readBest('little-scrabble-best');
$('best').textContent=best;
function refill(){while(rack.length<7)rack.push(bag[Math.floor(Math.random()*bag.length)]);}
function render(){
 $('rackCount').textContent=rack.length;
 $('visibleScore').textContent=`Total: ${total} poin`;
 $('check').textContent=busy?'Memeriksa kamus…':'Cek kata →';
 $('board').innerHTML='';
 cells.forEach((letter,i)=>{const tile=pending.get(i)||letter;const b=document.createElement('button');b.className='cell'+(tile?' filled':'')+(pending.has(i)?' pending':'');b.innerHTML=tile?`${tile}<small>${points[tile]}</small>`:(i===44?'✦':'');b.setAttribute('aria-label',`Baris ${Math.floor(i/10)+1}, kolom ${i%10+1}${tile?', '+tile:''}`);b.disabled=busy;b.onclick=()=>place(i);b.ondragover=e=>e.preventDefault();b.ondrop=e=>{e.preventDefault();const value=e.dataTransfer.getData('text/plain');if(value!==''&&/^\d+$/.test(value)){selected=Number(value);place(i)}};$('board').append(b)});
 $('rack').innerHTML='';rack.forEach((letter,i)=>{const b=document.createElement('button');b.className='tile'+(selected===i?' selected':'');b.innerHTML=`${letter}<small>${points[letter]}</small>`;b.setAttribute('aria-label',`${letter}, ${points[letter]} poin`);b.setAttribute('aria-pressed',selected===i);b.disabled=busy;b.draggable=!busy;b.onclick=()=>{selected=selected===i?null:i;render()};b.ondragstart=e=>{selected=i;e.dataTransfer.setData('text/plain',String(i))};$('rack').append(b)});
 for(const id of ['check','shuffle','undo','new','restart'])$(id).disabled=busy;
 $('score').textContent=total;$('words').textContent=wordCount;$('best').textContent=best;
}
function place(i){if(busy)return;if(pending.has(i)){rack.push(pending.get(i));pending.delete(i);selected=null}else if(!cells[i]&&selected!==null&&rack[selected]){pending.set(i,rack.splice(selected,1)[0]);selected=null}render()}
function undo(){for(const letter of pending.values())rack.push(letter);pending.clear();selected=null;}
$('undo').onclick=()=>{undo();render();say('Huruf dikembalikan ke rak.')};
$('shuffle').onclick=()=>{for(let i=rack.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[rack[i],rack[j]]=[rack[j],rack[i]]}selected=null;render()};
$('new').onclick=()=>{undo();rack=[];refill();render();say('Huruf baru, kemungkinan baru.')};
$('restart').onclick=()=>{cells=Array(100).fill(null);pending.clear();rack=[];selected=null;total=0;wordCount=0;$('wordHistory').replaceChildren();$('wordEmpty').hidden=false;result('Susun kata, lalu tekan Cek kata.');refill();render();say('Papan baru siap dimainkan. Rekormu tetap tersimpan.')};
function result(message,state=''){
 $('wordResult').className='word-result '+state;
 $('wordResult').firstElementChild.textContent=message;
}
$('check').onclick=async()=>{
 if(busy)return;const positions=[...pending.keys()].sort((a,b)=>a-b);
 if(positions.length<2){say('Letakkan minimal 2 huruf baru untuk membentuk kata.');result('Letakkan minimal 2 huruf baru.','error');return}
 const row=Math.floor(positions[0]/10),col=positions[0]%10;
 const horizontal=positions.every(i=>Math.floor(i/10)===row),vertical=positions.every(i=>i%10===col);
 if(!horizontal&&!vertical){say('Susun huruf dalam satu baris atau satu kolom.');result('Susun kata dalam satu baris atau kolom.','error');return}
 const step=horizontal?1:10;
 if(positions.some((v,i)=>i&&v-positions[i-1]!==step)){say('Kata tidak boleh memiliki celah. Susun huruf baru berdampingan.');result('Masih ada celah di antara huruf.','error');return}
 const word=positions.map(i=>pending.get(i)).join('');busy=true;render();say(`Memeriksa “${word}” di kamus…`);
 const controller=new AbortController();const timer=setTimeout(()=>controller.abort(),10000);
 result(`Memeriksa “${word}” di kamus bahasa Inggris…`);
 try{const response=await fetch(`https://api.dictionaryapi.dev/api/v2/entries/en/${word.toLowerCase()}`,{signal:controller.signal});
 if(response.status===404){say(`“${word}” belum ditemukan di kamus. Coba susunan lain.`);result(`“${word}” tidak ditemukan. Skor tidak berubah.`,'error');return}
 if(!response.ok)throw new Error('dictionary');const data=await response.json();if(!Array.isArray(data)||!data.length)throw new Error('dictionary');
 const entry=data.find(entry=>typeof entry.word==='string'&&entry.word.toLowerCase()===word.toLowerCase()&&entry.meanings?.some(m=>m.definitions?.some(d=>typeof d.definition==='string')));
 if(!entry)throw new Error('No matching dictionary entry');
 const definition=entry.meanings.flatMap(m=>m.definitions||[]).find(d=>typeof d.definition==='string').definition;
 const gained=[...pending.values()].reduce((n,l)=>n+points[l],0),added=7-rack.length;
 for(const [i,l]of pending)cells[i]=l;pending.clear();total+=gained;wordCount++;best=Math.max(best,total);saveBest('little-scrabble-best',best);refill();
 result(`${word} benar! +${gained} poin · ${added} huruf baru ditambahkan.`,'success');
 const item=document.createElement('li'),detail=document.createElement('div'),label=document.createElement('b'),meaning=document.createElement('p'),score=document.createElement('strong');
 label.textContent=word;meaning.textContent=definition;meaning.lang='en';score.textContent=`+${gained}`;detail.append(label,meaning);item.append(detail,score);$('wordHistory').prepend(item);$('wordEmpty').hidden=true;
 say(`“${word}” ada di kamus bahasa Inggris. +${gained} poin; rak kembali berisi 7 huruf.`);
 }catch{say('Kamus tidak dapat dihubungi. Periksa koneksi lalu coba lagi; hurufmu tetap di papan.');result('Kamus belum bisa dihubungi. Coba lagi; skor dan huruf tetap aman.','error')}finally{clearTimeout(timer);busy=false;render()}
};
refill();render();
