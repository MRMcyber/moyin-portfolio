const $=s=>document.querySelector(s);
const safeURL=value=>{try{const u=new URL(value,location.href);return ['https:','http:','mailto:'].includes(u.protocol)?u.href:''}catch{return ''}};
const escapeHTML=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const menu=$('.menu-toggle'),nav=$('#main-nav');
function closeMenu(){menu.setAttribute('aria-expanded','false');menu.setAttribute('aria-label','Open navigation');nav.classList.remove('open')}
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));menu.setAttribute('aria-label',open?'Close navigation':'Open navigation');nav.classList.toggle('open',open)});
nav.querySelectorAll('a').forEach(a=>a.addEventListener('click',closeMenu));
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&nav.classList.contains('open')){closeMenu();menu.focus()}});
document.addEventListener('click',e=>{if(!e.target.closest('.site-header'))closeMenu()});
window.matchMedia('(min-width:761px)').addEventListener('change',closeMenu);
$('#year').textContent=new Date().getFullYear();
document.querySelectorAll('dialog').forEach(dialog=>{
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}});
 dialog.addEventListener('close',()=>document.body.classList.remove('modal-open'));
});
function openDialog(dialog){dialog.showModal();document.body.classList.add('modal-open')}
function openImage(src,title){$('#full-image').src=src;$('#full-image').alt=title;$('#image-caption').textContent=title;openDialog($('#image-dialog'))}
let content={contact:'',certifications:[],projects:[],writeups:[],notes:[]};
document.querySelectorAll('.contact-trigger').forEach(button=>button.addEventListener('click',()=>{
 closeMenu();const raw=content.contact.trim();const target=safeURL(raw.includes('@')&&!raw.includes('://')&&!raw.startsWith('mailto:')?'mailto:'+raw:raw);
 const body=$('#contact-body');body.replaceChildren();
 if(raw&&target){const p=document.createElement('p');p.textContent='For a conversation about security, research, or working together.';const a=document.createElement('a');a.className='button primary';a.href=target;a.textContent=target.startsWith('mailto:')?raw.replace(/^mailto:/,''):'Get in touch ↗';if(!target.startsWith('mailto:')){a.target='_blank';a.rel='noopener noreferrer'}body.append(p,a)}
 else{const p=document.createElement('p');p.textContent='Contact details are being updated. Please check back soon.';body.append(p)}openDialog($('#contact-dialog'));
}));
function renderCertifications(){
 const gallery=$('#certificate-gallery');gallery.replaceChildren();
 if(!content.certifications.length){gallery.innerHTML='<div class="empty-credentials"><div class="certificate-outline" aria-hidden="true"><i></i></div><div><span class="empty-label">THE CREDENTIAL ARCHIVE</span><h3>Milestones, collected.</h3><p>Certification gallery coming soon.</p></div></div>';return}
 content.certifications.forEach((item,i)=>{const button=document.createElement('button');button.className='certificate-card';button.innerHTML=`<div class="cert-meta"><span>CREDENTIAL / ${String(i+1).padStart(2,'0')}</span><span aria-hidden="true">↗</span></div><img src="${escapeHTML(item.image)}" alt="${escapeHTML(item.title)}" loading="lazy" width="600" height="420"><h3>${escapeHTML(item.title)}</h3>`;button.setAttribute('aria-label','View '+item.title);button.addEventListener('click',()=>openImage(item.image,item.title));gallery.append(button)});
}
let activeProject=0;
function renderProject(index=0,focus=false){
 activeProject=index;const tabs=$('#project-tabs'),panel=$('#project-preview');tabs.replaceChildren();panel.replaceChildren();
 if(!content.projects.length){tabs.innerHTML='<div class="project-tab" role="tab" id="project-tab-empty" aria-controls="project-preview" aria-selected="true" tabindex="0"><span>01</span><div><strong>The project archive</strong><small>A closer look at the work.</small></div></div>';panel.setAttribute('aria-labelledby','project-tab-empty');panel.innerHTML='<div class="project-empty"><div class="window-bar"><i></i><i></i><i></i><span>OxShaD / projects</span></div><div class="empty-project-content"><span class="terminal-symbol" aria-hidden="true">~/</span><h3>Every project starts<br>with a question.</h3><p>Selected projects and their stories will appear here.</p></div><div class="archive-state"><span>PROJECT ARCHIVE</span><span>COMING SOON</span></div></div>';return}
 content.projects.forEach((item,i)=>{const button=document.createElement('button');button.className='project-tab';button.id='project-tab-'+i;button.setAttribute('role','tab');button.setAttribute('aria-controls','project-preview');button.setAttribute('aria-selected',String(i===index));button.tabIndex=i===index?0:-1;button.innerHTML=`<span>${String(i+1).padStart(2,'0')}</span><div><strong>${escapeHTML(item.title)}</strong><small>${escapeHTML(item.description||'View project images')}</small></div>`;button.addEventListener('click',()=>renderProject(i,true));button.addEventListener('keydown',e=>{if(['ArrowRight','ArrowDown','ArrowLeft','ArrowUp','Home','End'].includes(e.key)){e.preventDefault();let next=e.key==='Home'?0:e.key==='End'?content.projects.length-1:(i+(['ArrowRight','ArrowDown'].includes(e.key)?1:-1)+content.projects.length)%content.projects.length;renderProject(next,true)}});tabs.append(button)});
 const item=content.projects[index];panel.setAttribute('aria-labelledby','project-tab-'+index);const b=document.createElement('button');b.className='project-image-button';b.setAttribute('aria-label','Enlarge '+item.title);const img=document.createElement('img');img.src=item.image;img.alt=item.title;img.width=900;img.height=600;b.append(img);b.addEventListener('click',()=>openImage(item.image,item.title));panel.append(b);if(focus)$('#project-tab-'+index).focus();
}
function renderEntries(type,selector,title,description){const list=$(selector);list.replaceChildren();if(!content[type].length){list.innerHTML=`<div class="empty-block"><span class="index">[ — ]</span><div><h3>${title}</h3><p>${description}</p></div><span class="empty-arrow" aria-hidden="true">↗</span></div>`;return}content[type].forEach(item=>{const a=document.createElement('a');a.className='entry-link';a.href=safeURL(item.url)||'#'+type;a.innerHTML=`<div><h3>${escapeHTML(item.title)}</h3><p>${escapeHTML(item.description||'')}</p></div><span aria-hidden="true">↗</span>`;if(a.origin!==location.origin){a.target='_blank';a.rel='noopener noreferrer'}list.append(a)})}
function render(){renderCertifications();renderProject();renderEntries('writeups','#writeup-list','The research is only half the story.','Writeups and walkthroughs are on the way.');renderEntries('notes','#note-list','A notebook worth keeping.','Observations, ideas, and lessons. Coming soon.')}
render();fetch('content.json').then(r=>{if(!r.ok)throw Error('Content unavailable');return r.json()}).then(data=>{content={...content,...data};render()}).catch(()=>{});

// Original canvas artwork: an abstract research surface, not a live threat map.
const canvas=$('#globe'),ctx=canvas.getContext('2d');
const reduced=matchMedia('(prefers-reduced-motion: reduce)');let paused=reduced.matches,visible=true,angle=.35,last=0,frame=0;
const continents=[
 [[-168,65],[-140,70],[-125,58],[-112,53],[-95,50],[-83,25],[-100,18],[-113,29],[-125,40],[-135,56]],
 [[-81,12],[-62,9],[-46,-5],[-35,-10],[-45,-28],[-63,-55],[-74,-34],[-79,-5]],
 [[-17,35],[7,37],[27,31],[37,17],[49,10],[40,-14],[27,-34],[15,-35],[9,-20],[-5,5],[-17,15]],
 [[-11,36],[-7,55],[8,70],[30,71],[45,53],[30,40],[14,37]],
 [[30,40],[45,63],[80,75],[130,60],[170,60],[150,43],[124,25],[106,4],[91,22],[76,9],[66,26],[42,14]],
 [[112,-12],[132,-10],[153,-25],[145,-39],[116,-33]],
 [[-52,59],[-25,68],[-35,82],[-57,79],[-65,65]],[[47,-13],[51,-16],[48,-25],[44,-23]],[[130,31],[145,44],[143,33]]
];
function inPoly(x,y,poly){let inside=false;for(let i=0,j=poly.length-1;i<poly.length;j=i++){const [xi,yi]=poly[i],[xj,yj]=poly[j];if(((yi>y)!==(yj>y))&&(x<(xj-xi)*(y-yi)/(yj-yi)+xi))inside=!inside}return inside}
const dots=[];for(let lat=-70;lat<82;lat+=2.5){const step=2.7/Math.max(.3,Math.cos(lat*Math.PI/180));for(let lon=-180;lon<180;lon+=step){const land=continents.some(p=>inPoly(lon,lat,p));dots.push({lat:lat*Math.PI/180,lon:lon*Math.PI/180,land})}}
const nodes=[[-74,41],[3,7],[13,53],[32,30],[77,23],[103,1],[-46,-23]];
function project(lon,lat,r,cx,cy){const x=Math.cos(lat)*Math.sin(lon+angle),z=Math.cos(lat)*Math.cos(lon+angle),y=-Math.sin(lat);return{x:cx+x*r,y:cy+(y*.95+z*.15)*r,z}}
function draw(time=0){frame=0;if(!visible||document.hidden)return;const bounds=canvas.getBoundingClientRect(),dpr=Math.min(devicePixelRatio,1.5),w=bounds.width,h=bounds.height;if(canvas.width!==Math.round(w*dpr)||canvas.height!==Math.round(h*dpr)){canvas.width=Math.round(w*dpr);canvas.height=Math.round(h*dpr)}ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,w,h);if(!paused&&last)angle+=Math.min(time-last,60)*.000025;last=time;const r=Math.min(w,h)*.43,cx=w*.53,cy=h*.53;
 const glow=ctx.createRadialGradient(cx,cy,0,cx,cy,r*1.35);glow.addColorStop(0,'#08271335');glow.addColorStop(.7,'#051d0b12');glow.addColorStop(1,'#00000000');ctx.fillStyle=glow;ctx.fillRect(0,0,w,h);
 for(const d of dots){const p=project(d.lon,d.lat,r,cx,cy);if(p.z<-.1)continue;const alpha=(.15+.7*Math.max(0,p.z))*(d.land?1:.18);ctx.fillStyle=`rgba(${d.land?'71,128,85':'54,91,65'},${alpha})`;const size=d.land?1.05:.65;ctx.fillRect(p.x,p.y,size,size)}
 ctx.strokeStyle='#30533a44';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(cx,cy,r*1.15,r*.33,-.4,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(cx,cy,r*1.05,r*.45,.7,0,Math.PI*2);ctx.stroke();
 const points=nodes.map(([lon,lat])=>project(lon*Math.PI/180,lat*Math.PI/180,r,cx,cy));
 points.forEach((p,i)=>{if(p.z<0)return;const next=points[(i+1)%points.length];if(next.z>0){ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.quadraticCurveTo((p.x+next.x)/2,(p.y+next.y)/2-85,next.x,next.y);ctx.strokeStyle='#39805277';ctx.stroke()}ctx.beginPath();ctx.arc(p.x,p.y,3,0,Math.PI*2);ctx.fillStyle='#6eb786';ctx.fill();ctx.strokeStyle='#3a975e';ctx.beginPath();ctx.arc(p.x,p.y,7,0,Math.PI*2);ctx.stroke();ctx.strokeStyle='#3a975e40';ctx.beginPath();ctx.arc(p.x,p.y,12,0,Math.PI*2);ctx.stroke()});
 if(!paused)frame=requestAnimationFrame(draw);
}
function restart(){if(!frame){last=0;frame=requestAnimationFrame(draw)}}
const motion=$('#motion-toggle');function updateMotion(){motion.setAttribute('aria-pressed',String(paused));motion.innerHTML=paused?'Resume motion <span aria-hidden="true">▷</span>':'Pause motion <span aria-hidden="true">Ⅱ</span>';restart()}
motion.addEventListener('click',()=>{paused=!paused;updateMotion()});reduced.addEventListener('change',()=>{paused=reduced.matches;updateMotion()});
new IntersectionObserver(entries=>{visible=entries[0].isIntersecting;if(visible)restart();else if(frame){cancelAnimationFrame(frame);frame=0}},{threshold:0}).observe(canvas);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)restart()});window.addEventListener('resize',restart);updateMotion();
