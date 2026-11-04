const $=(s,r=document)=>r.querySelector(s);
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const mxn=n=>Number(n).toLocaleString('es-MX',{style:'currency',currency:'MXN'});
const load=(k,d)=>{try{const v=localStorage.getItem(k);return v?JSON.parse(v):d}catch{return d}};
const save=(k,v)=>{try{localStorage.setItem(k,JSON.stringify(v));return true}catch{return false}};
/* CONFIGURA AQUÍ: whatsapp = número con lada de país y sin signos (ej. 5213221234567). endpoint = envío automático por correo ('' para apagarlo). */
const AGENCIA={whatsapp:'523221513582',correo:'vipaventours@gmail.com',endpoint:'https://formsubmit.co/ajax/vipaventours@gmail.com'};
const HASH='4bc9ec770736e9bddc06258327e1c59d71b935ce3be36e7ef2ce660edefe0854';
const DEF=[
{nombre:'Aquaventuras',unidad:'boleto',img:'imagenes/aquaventuras.jpg',desc:'Parque acuático en Nuevo Vallarta con toboganes, piscinas, circuito de cuerdas, tirolesa y presentaciones con animales marinos. Se vende por boleto: elige tu paquete.',paquetes:[
 {nombre:'Entrada general',desc:'Acceso al parque acuático y a sus toboganes.',precio:0,grupo:0},
 {nombre:'Entrada + encuentro con delfines',desc:'Acceso al parque y programa de encuentro con delfines.',precio:0,grupo:0},
 {nombre:'Entrada + nado con delfines',desc:'Acceso al parque y programa de nado con delfines.',precio:0,grupo:0}]},
{nombre:'Arcos, Madagascar y Ánimas',unidad:'persona',img:'imagenes/arcos-madagascar-animas.jpg',desc:'Sales a las 12:00 desde Puerto Mágico y regresas a las 18:00. Recorres la bahía y paras en Los Arcos, enormes rocas dentro del mar, para tomar fotos. En la playa Madagascar haces snorkel, kayak y paddle. Después hay fruta y barra libre con tequila, ron, vodka, cerveza y bebidas mezcladas. Terminas en la playa Las Ánimas, de agua muy cristalina, entre dos horas y media y tres horas, con alimentos incluidos.',paquetes:[
 {nombre:'Estándar',desc:'Recorrido completo con alimentos y barra libre incluidos.',precio:0,grupo:0}]},
{nombre:'Arcos, Ánimas y Quimixto',unidad:'persona',img:'imagenes/arcos-animas-quimixto.jpg',desc:'Recorrido por Los Arcos y las playas Las Ánimas y Quimixto, con snorkel, kayak y paddleboard, peces de colores y aves marinas.',paquetes:[
 {nombre:'Estándar',desc:'Recorrido por Los Arcos, Las Ánimas y Quimixto.',precio:500,grupo:400}]},
{nombre:'Yelapa y Majahuitas',unidad:'persona',img:'imagenes/yelapa-majahuitas.jpeg',desc:'Naturaleza, playa y aventura en Cabo Corrientes. Incluye equipo de snorkel, kayaks y paddleboard, barra libre a bordo, comida (filete de pescado, pollo, alambre, hamburguesas, papas, fruta y bebidas) y transporte en lancha. Salidas todos los días.',paquetes:[
 {nombre:'Estándar',desc:'Snorkel, kayaks, paddleboard, barra libre, comida y lancha.',precio:500,grupo:400}]},
{nombre:'ATV y RZR',unidad:'persona',img:'imagenes/atv-rzr.jpeg',desc:'Aventura sin límites en ATV, RZR y UTV por rutas emocionantes y seguras, entre ríos y naturaleza. Incluye guías expertos y equipo de seguridad. Hay opciones para principiantes y avanzados.',paquetes:[
 {nombre:'Estándar',desc:'Recorrido con guías expertos y equipo de seguridad.',precio:500,grupo:400}]}];
const pedidos=()=>load('vip_pedidos',[]);
/* Cuentas de cliente: se guardan en este navegador. La contraseña se guarda solo como huella (hash con sal). */
const clientes=()=>load('vip_clientes',[]);
const sesion=()=>{const e=load('vip_sesion',null);return e?clientes().find(c=>c.correo===e)||null:null};
const huella=async(sal,pw)=>{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(sal+':'+pw));return[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('')};
const volverOk=v=>/^[a-z]+\.html(\?[\w=&.%-]*)?$/i.test(v||'');
const itemsTxt=r=>r.items?r.items.map(i=>`${i.servicio} (${i.paquete}) x${i.personas}`).join(' + '):r.servicio+(r.paquete?' ('+r.paquete+')':'');
const fechasTxt=r=>r.items?[...new Set(r.items.map(i=>i.fecha))].join(', '):r.fechaTour;
const totTxt=r=>r.cotizar?'Por cotizar':mxn(r.total)+(r.items&&r.items.some(i=>i.cotizar)?' + por cotizar':'');
const itemsHtml=r=>r.items?r.items.map(i=>`${esc(i.servicio)}<br><small>${esc(i.paquete)} · ${i.personas} ${i.unidad==='boleto'?'boleto(s)':'persona(s)'} · ${esc(i.fecha)}</small>`).join('<br>'):esc(r.servicio)+(r.paquete?'<br><small>Paquete: '+esc(r.paquete)+'</small>':'')+'<br><small>Tour: '+esc(r.fechaTour)+'</small>';
const pd=(k,n)=>n>=5&&k.grupo>0?k.grupo:k.precio;
const unit=s=>s.unidad==='boleto'?'boleto':'persona';
const pl=s=>unit(s)==='boleto'?'boletos':'personas';
const cap=t=>t[0].toUpperCase()+t.slice(1);
const verImg=(src,alt)=>{let d=$('#lb');if(!d){d=document.createElement('dialog');d.id='lb';d.innerHTML='<img alt=""><button class="btn sec" type="button">Cerrar</button>';d.onclick=e=>{if(e.target!==d.querySelector('img'))d.close()};document.body.append(d)}const i=d.querySelector('img');i.src=src;i.alt=alt;d.showModal()};
const servicios=()=>{const s=load('vip_servicios3',null);return s?s.map((x,i)=>({...x,img:(DEF[i]||x).img})):DEF};
const P=document.body.dataset.page;
const LINKS=[['index','Inicio'],['servicios','Servicios'],['comprar','Comprar'],['contacto','Contacto'],['registro','Registro'],['historial','Historial'],['acceso','Administración']];
$('.top .wrap').innerHTML='<a class="logo" href="index.html"><img src="imagenes/logo.png" alt="" width="44" height="44" onerror="this.remove()"><span>VIP Adventour</span></a><button class="menu" type="button" aria-expanded="false" aria-controls="nav">Menú</button><nav id="nav" aria-label="Principal">'+LINKS.filter(([p])=>p!=='historial'||sesion()).map(([p,t])=>`<a href="${p}.html"${p===P||(P==='paneladmin'&&p==='acceso')?' aria-current="page"':''}>${p==='registro'&&sesion()?'Mi cuenta':t}</a>`).join('')+'</nav>';

$('.menu').onclick=e=>{const o=$('#nav').classList.toggle('open');e.currentTarget.setAttribute('aria-expanded',o)};
const toast=t=>{let el=$('#toast');if(!el){el=document.createElement('div');el.id='toast';el.setAttribute('role','status');document.body.append(el)}el.textContent=t;el.classList.add('on');clearTimeout(el._t);el._t=setTimeout(()=>el.classList.remove('on'),3200)};
(()=>{const a=document.createElement('a');a.className='wa';a.target='_blank';a.rel='noopener';a.textContent='WhatsApp';a.setAttribute('aria-label','Escríbenos por WhatsApp');a.href=`https://wa.me/${AGENCIA.whatsapp}?text=${encodeURIComponent('Hola, quiero información sobre sus tours.')}`;document.body.append(a);const w=$('#wa-link');if(w){w.href=a.href;w.target='_blank';w.rel='noopener'}})();
const enviarRegistro=async c=>{if(!AGENCIA.endpoint)return false;try{const x=await fetch(AGENCIA.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:'Nuevo cliente registrado',_template:'table',_captcha:'false',Nombre:c.nombre,Documento:c.documento,Correo:c.correo,Telefono:c.telefono||'-'})});return x.ok}catch{return false}};
const enviar=async r=>{try{const x=await fetch(AGENCIA.endpoint,{method:'POST',headers:{'Content-Type':'application/json',Accept:'application/json'},body:JSON.stringify({_subject:'Nuevo pedido '+r.folio,_template:'table',_captcha:'false',Folio:r.folio,Cliente:r.cliente.nombre,Correo:r.cliente.correo,Telefono:r.cliente.telefono,Boletos:itemsTxt(r),Fechas_del_tour:fechasTxt(r),Personas:r.personas,Total:totTxt(r),Pago:r.pago,Notas:r.notas||'-'})});return x.ok}catch{return false}};
{const ft=$('.foot');if(ft)ft.innerHTML='<img class="foot-logo" src="imagenes/logo.png" alt="" width="28" height="28" onerror="this.remove()">'+ft.innerHTML}
const calma=matchMedia('(prefers-reduced-motion:reduce)').matches;
const reveal=()=>{const els=document.querySelectorAll('.rv:not(.in)');if(!('IntersectionObserver' in window)||calma){els.forEach(e=>e.classList.add('in'));return}
 const io=new IntersectionObserver(es=>es.forEach(x=>{if(x.isIntersecting){x.target.classList.add('in');io.unobserve(x.target)}}),{threshold:.12});els.forEach(e=>io.observe(e))};

const ANUNCIOS=()=>{const g=servicios().flatMap(s=>s.paquetes).filter(k=>k.grupo>0).map(k=>k.grupo);
 return[
 {t:'Aventura sin límites',d:'Recorre la naturaleza en ATV, RZR y UTV con guías expertos y equipo de seguridad incluido.',c:'Ver ATV y RZR',h:'servicios.html',i:'imagenes/atv-rzr.jpeg'},
 {t:'Viaja en grupo y paga menos',d:g.length?`Desde 5 personas, paga desde ${mxn(Math.min(...g))} por persona en tours seleccionados.`:'Pregunta por el precio de grupo para 5 personas o más.',c:'Ver tours',h:'servicios.html',i:'imagenes/arcos-animas-quimixto.jpg'},
 {t:'Yelapa y Majahuitas, todo incluido',d:'Snorkel, kayaks, paddleboard, barra libre, comida y lancha. Salidas todos los días.',c:'Ver paquete',h:'servicios.html',i:'imagenes/yelapa-majahuitas.jpeg'},
 {t:'Arcos, Madagascar y Ánimas',d:'Sales a las 12:00 desde Puerto Mágico y regresas a las 18:00, con snorkel, kayak, paddle, barra libre y alimentos.',c:'Reservar',h:'comprar.html?tour=1',i:'imagenes/arcos-madagascar-animas.jpg'},
 {t:'Aquaventuras: elige tu paquete',d:'Toboganes, tirolesa y presentaciones con animales marinos. Los boletos se venden por paquete.',c:'Ver paquetes',h:'servicios.html',i:'imagenes/aquaventuras.jpg'},
 {t:'Compra en línea en minutos',d:'Elige tour, paquete y fecha, y recibe tu comprobante con folio al instante.',c:'Comprar ahora',h:'comprar.html',i:'imagenes/logo.png'},
 {t:'Encuéntranos en Puerto Mágico',d:'Mira el mapa y llega fácil a nuestro punto de encuentro, o escríbenos por WhatsApp.',c:'Cómo llegar',h:'contacto.html',i:'imagenes/logo.png'}]};
if(!['index','comprar','acceso','paneladmin','qr'].includes(P)&&!sessionStorage.getItem('vip_anuncio_off')){
 const L=ANUNCIOS();let k=0,t;
 const b=document.createElement('div');b.className='anuncio';b.setAttribute('role','region');b.setAttribute('aria-label','Anuncios');
 b.innerHTML='<button type="button" id="an-p" aria-label="Anuncio anterior">&lt;</button><p><strong></strong> <span></span> <a></a></p><button type="button" id="an-s" aria-label="Anuncio siguiente">&gt;</button><button type="button" id="an-x" aria-label="Cerrar anuncios">×</button>';
 $('.top').after(b);
 const show=()=>{const x=L[k],p=$('p',b);$('strong',p).textContent=x.t;$('span',p).textContent=x.d;const a=$('a',p);a.textContent=x.c;a.href=x.h};
 const auto=()=>{clearInterval(t);if(!calma)t=setInterval(()=>{k=(k+1)%L.length;show()},6000)};
 $('#an-p').onclick=()=>{k=(k-1+L.length)%L.length;show();auto()};
 $('#an-s').onclick=()=>{k=(k+1)%L.length;show();auto()};
 $('#an-x').onclick=()=>{sessionStorage.setItem('vip_anuncio_off','1');clearInterval(t);b.remove()};
 b.onmouseenter=b.onfocusin=()=>clearInterval(t);b.onmouseleave=b.onfocusout=auto;
 show();auto();
}
if(P==='servicios'){
 const box=$('#lista'),tipo=s=>/ATV/i.test(s.nombre)?'tierra':'mar';
 let filtro='todos',q='';
 const sel=i=>{const s=servicios()[i];return s.paquetes[+$(`input[name=pk${i}]:checked`).value]};
 const calc=i=>{const s=servicios()[i],k=sel(i),n=+$('#q'+i).textContent,p=pd(k,n),b=$('#b'+i);
  if(k.precio>0){b.textContent='Comprar';$('#c'+i).innerHTML=`Total: <strong>${mxn(n*p)}</strong>`+(n>=5&&k.grupo>0?' <span class="tag">Precio de grupo aplicado</span>':k.grupo>0?` Con 5 ${pl(s)} pagas ${mxn(k.grupo)} cada uno.`:'')}
  else{b.textContent='Solicitar cotización';$('#c'+i).textContent='Precio por confirmar.'}};
 const draw=()=>{const l=servicios().map((s,i)=>({s,i})).filter(({s})=>(filtro==='todos'||tipo(s)===filtro)&&(s.nombre+' '+s.desc+' '+s.paquetes.map(k=>k.nombre+' '+k.desc).join(' ')).toLowerCase().includes(q));
  box.innerHTML=l.length?l.map(({s,i})=>`<article class="tour rv"><figure><img src="${esc(s.img)}" alt="${esc(s.nombre)}" loading="lazy" onerror="this.outerHTML='<span class=nofoto>Foto no disponible</span>'"></figure><div><h2>${esc(s.nombre)}</h2><p>${esc(s.desc)}</p><fieldset class="pks"><legend>Elige tu paquete (precio por ${unit(s)})</legend>${s.paquetes.map((k,j)=>`<label class="pk"><input type="radio" name="pk${i}" value="${j}"${j===0?' checked':''}><span><strong>${esc(k.nombre)}</strong>${k.desc?`<small>${esc(k.desc)}</small>`:''}</span><em>${k.precio>0?mxn(k.precio):'Por confirmar'}</em></label>`).join('')}</fieldset><div class="step" role="group" aria-label="${cap(pl(s))}"><button type="button" data-d="-1" data-i="${i}" aria-label="Menos">−</button><output id="q${i}">1</output><button type="button" data-d="1" data-i="${i}" aria-label="Más">+</button><span>${pl(s)}</span></div><p class="calc" id="c${i}"></p><p><button class="btn" id="b${i}" data-r="${i}">Comprar</button></p></div></article>`).join(''):'<p>No hay tours con esa búsqueda. Prueba con otra palabra o con "Todos".</p>';
  l.forEach(({i})=>calc(i));reveal()};
 box.addEventListener('change',e=>{const r=e.target.closest('input[type=radio]');if(r)calc(r.name.slice(2))});
 box.addEventListener('click',e=>{
  const im=e.target.closest('figure img');if(im){verImg(im.src,im.alt);return}
  const d=e.target.closest('[data-d]');
  if(d){const o=$('#q'+d.dataset.i);o.textContent=Math.min(50,Math.max(1,+o.textContent+ +d.dataset.d));calc(d.dataset.i);return}
  const b=e.target.closest('[data-r]');if(!b)return;const i=b.dataset.r;
  location.href=`comprar.html?tour=${i}&p=${$(`input[name=pk${i}]:checked`).value}&n=${$('#q'+i).textContent}`});
 $('#chips').addEventListener('click',e=>{const c=e.target.closest('[data-f]');if(!c)return;filtro=c.dataset.f;
  document.querySelectorAll('#chips [data-f]').forEach(x=>x.setAttribute('aria-pressed',x===c));draw()});
 $('#buscar').addEventListener('input',e=>{q=e.target.value.trim().toLowerCase();draw()});
 draw();
}
if(P==='registro'){
 const f=$('#registroForm'),l=$('#loginForm'),m=$('#mensaje'),m2=$('#mensaje2'),volver=new URLSearchParams(location.search).get('volver');
 const vista=()=>{const c=sesion();$('#sinSesion').hidden=!!c;$('#conSesion').hidden=!c;
  if(c)$('#cliente').innerHTML=`<h2>${esc(c.nombre)}</h2><p>${esc(c.correo)}${c.telefono?'. Tel: '+esc(c.telefono):''}<br><small>Documento: ${esc(c.documento)}</small></p>`};
 const tab=v=>{f.hidden=v!=='nueva';l.hidden=v!=='entrar';document.querySelectorAll('#tabs [data-t]').forEach(x=>x.setAttribute('aria-pressed',x.dataset.t===v))};
 $('#tabs').addEventListener('click',e=>{const b=e.target.closest('[data-t]');if(b)tab(b.dataset.t)});
 if(volver)tab('entrar');
 const ir=d=>{location.href=volverOk(volver)?volver:d};
 f.addEventListener('submit',async e=>{e.preventDefault();m.className='msg err';
  const d=Object.fromEntries(new FormData(f));d.correo=d.correo.trim().toLowerCase();d.nombre=d.nombre.trim();d.documento=d.documento.trim();
  if(d.clave.length<6){m.textContent='La contraseña debe tener al menos 6 caracteres.';return}
  if(clientes().some(c=>c.correo===d.correo)){m.textContent='Ya existe una cuenta con ese correo. Usa "Ya tengo cuenta".';return}
  try{const sal=crypto.getRandomValues(new Uint32Array(4)).join('-'),c={nombre:d.nombre,documento:d.documento,correo:d.correo,telefono:(d.telefono||'').trim(),sal,clave:await huella(sal,d.clave),creado:new Date().toLocaleString('es-MX')};
   const L=clientes();L.push(c);if(!save('vip_clientes',L)||!save('vip_sesion',c.correo)){m.textContent='No se pudo guardar la cuenta en este navegador.';return}
   enviarRegistro(c);ir('servicios.html')}
  catch{m.textContent='Este navegador no puede proteger la contraseña aquí. Abre el sitio con https o localhost.'}});
 l.addEventListener('submit',async e=>{e.preventDefault();m2.className='msg err';
  const correo=l.correo.value.trim().toLowerCase(),c=clientes().find(x=>x.correo===correo);
  try{if(!c||await huella(c.sal,l.clave.value)!==c.clave){m2.textContent='Correo o contraseña incorrectos.';return}
   save('vip_sesion',c.correo);ir('historial.html')}
  catch{m2.textContent='Este navegador no puede validar la contraseña aquí. Abre el sitio con https o localhost.'}});
 $('#salir').onclick=()=>{try{localStorage.removeItem('vip_sesion')}catch{}location.href='index.html'};
 vista();
}
if(P==='historial'){
 const c=sesion();
 if(!c)location.replace('registro.html?volver=historial.html');
 const h=c?pedidos().filter(r=>(r.cliente.correo||'').toLowerCase()===c.correo):[];
 $('#cliente').innerHTML=c?`<h2>${esc(c.nombre)}</h2><p>${esc(c.correo)}${c.telefono?'. Tel: '+esc(c.telefono):''}</p><p class="nota">Solo tú puedes ver estas compras con tu cuenta.</p>`:'';
 $('#filas').innerHTML=h.length?h.slice().reverse().map(r=>`<tr><td>${esc(r.folio)}</td><td>${esc(r.creado.split(',')[0])}</td><td>${itemsHtml(r)}</td><td>${r.personas}</td><td>${totTxt(r)}</td><td>${esc(r.estado)}</td></tr>`).join(''):'<tr><td colspan="6">Todavía no hay compras. Elige un tour en <a href="servicios.html">Servicios</a>.</td></tr>';
 const t=h.filter(r=>r.estado!=='Cancelado'&&!r.cotizar).reduce((a,r)=>a+r.total,0);if(t)$('#total').textContent='Total: '+mxn(t);
 $('#borrar').onclick=()=>{if(h.length&&confirm('¿Borrar tus compras de este historial?')){save('vip_pedidos',pedidos().filter(r=>!h.some(x=>x.folio===r.folio)));location.reload()}};
}
if(P==='acceso'){
 $('#loginForm').addEventListener('submit',async e=>{e.preventDefault();const m=$('#mensaje');
  try{const b=await crypto.subtle.digest('SHA-256',new TextEncoder().encode($('#clave').value));
   const h=[...new Uint8Array(b)].map(x=>x.toString(16).padStart(2,'0')).join('');
   if(h===HASH){sessionStorage.setItem('vip_admin','1');location.href='paneladmin.html'}
   else{m.className='msg err';m.textContent='Contraseña incorrecta.'}}
  catch{m.className='msg err';m.textContent='Este navegador no puede validar la contraseña aquí. Abre el sitio con https o localhost.'}});
}
if(P==='paneladmin'){
 if(sessionStorage.getItem('vip_admin')!=='1')location.replace('acceso.html');
 const m=$('#mensaje'),ES=['Pendiente','Confirmado','Pagado','Cancelado'],cl=o=>JSON.parse(JSON.stringify(o));
 let S=cl(servicios());
 const cel=v=>{v=String(v??'');if(/^[=+\-@]/.test(v))v="'"+v;return '"'+v.replace(/"/g,'""')+'"'};
 const csv=l=>'\ufeff'+[['Folio','Compra','Nombre','Correo','Teléfono','Boletos','Líneas','Fecha(s) del tour','Personas','Total','Pago','Estado','Notas'],...l.map(r=>[r.folio,r.creado,r.cliente.nombre,r.cliente.correo,r.cliente.telefono,itemsTxt(r),r.items?r.items.length:1,fechasTxt(r),r.personas,totTxt(r),r.pago,r.estado,r.notas])].map(a=>a.map(cel).join(',')).join('\r\n');
 const drawP=()=>{const l=pedidos(),v=l.filter(r=>/^(Confirmado|Pagado)$/.test(r.estado)&&!r.cotizar).reduce((a,r)=>a+r.total,0);
  $('#resumen').textContent=`Pedidos: ${l.length}. Pendientes: ${l.filter(r=>r.estado==='Pendiente').length}. Ventas confirmadas o pagadas: ${mxn(v)}.`;
  $('#pedidos').innerHTML=l.length?l.map((r,i)=>[r,i]).reverse().map(([r,i])=>`<tr><td><strong>${esc(r.folio)}</strong><br><small>${esc(r.creado)}${r.enviado?'<br>Enviado a la agencia':''}</small></td><td>${esc(r.cliente.nombre)}<br><small>${esc(r.cliente.correo)}<br>${esc(r.cliente.telefono)}</small></td><td>${itemsHtml(r)}${r.notas?'<br><small>Notas: '+esc(r.notas)+'</small>':''}</td><td>${r.personas}</td><td>${totTxt(r)}</td><td>${esc(r.pago)}</td><td><select data-e="${i}" aria-label="Estado de ${esc(r.folio)}">${ES.map(x=>`<option${x===r.estado?' selected':''}>${x}</option>`).join('')}</select></td><td><button class="btn sec" type="button" data-x="${i}" aria-label="Borrar ${esc(r.folio)}">Borrar</button></td></tr>`).join(''):'<tr><td colspan="8">Aún no hay compras.</td></tr>'};
const drawC=()=>{const C=clientes(),P2=pedidos();
  $('#resumenClientes').textContent=`Clientes registrados: ${C.length}.`;
  $('#clientes').innerHTML=C.length?C.slice().reverse().map(c=>{const o=P2.filter(r=>(r.cliente.correo||'').toLowerCase()===c.correo),t=o.filter(r=>r.estado!=='Cancelado'&&!r.cotizar).reduce((a,r)=>a+r.total,0);
   return `<tr><td><strong>${esc(c.nombre)}</strong><br><small>Registro: ${esc(c.creado||'')}</small></td><td>${esc(c.documento)}</td><td>${esc(c.correo)}<br><small>${esc(c.telefono||'Sin teléfono')}</small></td><td>${o.length?`<details><summary>${o.length} pedido(s)</summary>${o.slice().reverse().map(r=>`<p><strong>${esc(r.folio)}</strong> · ${esc(r.estado)}<br>${itemsHtml(r)}<br><small>${totTxt(r)}</small></p>`).join('')}</details>`:'Sin compras'}</td><td>${mxn(t)}</td></tr>`}).join(''):'<tr><td colspan="5">Aún no hay clientes registrados en este navegador.</td></tr>'};
 $('#pedidos').addEventListener('change',e=>{const s=e.target.closest('[data-e]');if(!s)return;const l=pedidos();l[s.dataset.e].estado=s.value;save('vip_pedidos',l);drawP()});
 $('#pedidos').addEventListener('click',e=>{const b=e.target.closest('[data-x]');if(!b||!confirm('¿Borrar este pedido?'))return;const l=pedidos();l.splice(b.dataset.x,1);save('vip_pedidos',l);drawP()});
 $('#csv').onclick=()=>{const l=pedidos();if(!l.length){toast('Todavía no hay pedidos para descargar.');return}const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([csv(l)],{type:'text/csv;charset=utf-8'}));a.download='pedidos-vip-adventour.csv';a.click()};
 const draw=()=>{$('#editor').innerHTML=S.map((s,i)=>`<fieldset><legend>${esc(s.nombre)}</legend><label>Nombre<input data-i="${i}" data-f="nombre" value="${esc(s.nombre)}"></label><label>Descripción<textarea rows="4" data-i="${i}" data-f="desc">${esc(s.desc)}</textarea></label><label>Se vende por<select data-i="${i}" data-f="unidad"><option value="persona"${s.unidad!=='boleto'?' selected':''}>persona</option><option value="boleto"${s.unidad==='boleto'?' selected':''}>boleto</option></select></label><h3>Paquetes</h3>${s.paquetes.map((k,j)=>`<div class="pkedit"><label>Nombre del paquete<input data-i="${i}" data-j="${j}" data-f="nombre" value="${esc(k.nombre)}"></label><label>Qué incluye<textarea rows="2" data-i="${i}" data-j="${j}" data-f="desc">${esc(k.desc)}</textarea></label><label>Precio en MXN (0 si por confirmar)<input type="number" min="0" data-i="${i}" data-j="${j}" data-f="precio" value="${k.precio}"></label><label>Precio desde 5 (0 si no hay)<input type="number" min="0" data-i="${i}" data-j="${j}" data-f="grupo" value="${k.grupo}"></label><button class="btn sec" type="button" data-q="${i},${j}">Quitar paquete</button></div>`).join('')}<button class="btn sec" type="button" data-a="${i}">Agregar paquete</button></fieldset>`).join('')};
 $('#editor').addEventListener('input',e=>{const el=e.target;if(!el.dataset.f)return;const o=el.dataset.j!==undefined?S[el.dataset.i].paquetes[el.dataset.j]:S[el.dataset.i];o[el.dataset.f]=el.type==='number'?Math.max(0,+el.value||0):el.value});
 $('#editor').addEventListener('click',e=>{const a=e.target.closest('[data-a]'),q=e.target.closest('[data-q]');
  if(a){S[a.dataset.a].paquetes.push({nombre:'Nuevo paquete',desc:'',precio:0,grupo:0});draw()}
  if(q){const[i,j]=q.dataset.q.split(',');if(S[i].paquetes.length<2){toast('Cada servicio necesita al menos un paquete.');return}S[i].paquetes.splice(j,1);draw()}});
 drawP();drawC();draw();
 $('#guardar').onclick=()=>{save('vip_servicios3',S);m.className='msg ok';m.textContent='Cambios guardados. Ya se ven en Servicios.'};
 $('#restaurar').onclick=()=>{if(confirm('¿Restaurar los servicios y paquetes originales?')){S=cl(DEF);save('vip_servicios3',S);draw();m.className='msg ok';m.textContent='Servicios restaurados.'}};
 $('#salir').onclick=()=>{sessionStorage.removeItem('vip_admin');location.href='index.html'};
}
if(P==='comprar'){
 const c=sesion(),L=servicios(),prm=new URLSearchParams(location.search);
 if(!c){$('#compraBox').hidden=true;const b=$('#listo');b.hidden=false;
  b.innerHTML='<div class="boleto"><h2>Primero entra a tu cuenta</h2><p>Para comprar y ver tu historial necesitas una cuenta. Tus compras son privadas: solo tú las ves.</p><div class="acciones"><a class="btn" href="registro.html?volver='+encodeURIComponent('comprar.html'+location.search)+'">Crear cuenta o iniciar sesión</a></div></div>'}
 else{
 const f=$('#compraForm'),hoy=new Date(Date.now()-new Date().getTimezoneOffset()*6e4).toISOString().slice(0,10);
 const larga=v=>new Date(v+'T12:00').toLocaleDateString('es-MX',{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 f.nombre.value=c.nombre||'';f.correo.value=c.correo;f.correo.readOnly=true;f.telefono.value=c.telefono||'';
 const mk=(t,p,n,fe)=>({tour:String(t),paq:String(p),n,fecha:fe||''});
 const t0=L[prm.get('tour')]?+prm.get('tour'):0;
 let lines=[mk(t0,L[t0].paquetes[prm.get('p')]?+prm.get('p'):0,Math.min(50,Math.max(1,+prm.get('n')||1)))];
 const lineasHtml=()=>{$('#lineas').innerHTML=lines.map((ln,i)=>{const s=L[ln.tour];return `<div class="linea" data-i="${i}"><div class="lhead"><strong>Boleto ${i+1}</strong>${lines.length>1?`<button class="btn sec" type="button" data-x="${i}">Quitar</button>`:''}</div>
  <label>Tour<select data-f="tour">${L.map((x,j)=>`<option value="${j}"${j==ln.tour?' selected':''}>${esc(x.nombre)}</option>`).join('')}</select></label>
  <label>Paquete<select data-f="paq">${s.paquetes.map((k,x)=>`<option value="${x}"${x==ln.paq?' selected':''}>${esc(k.nombre)} (${k.precio>0?mxn(k.precio):'precio por confirmar'})</option>`).join('')}</select></label>
  <label>Fecha del tour<input type="date" data-f="fecha" min="${hoy}" value="${esc(ln.fecha)}"></label>
  <div><span class="lbl">${cap(pl(s))}</span><div class="step"><button type="button" data-d="-1" aria-label="Menos">−</button><output>${ln.n}</output><button type="button" data-d="1" aria-label="Más">+</button></div></div></div>`}).join('')};
 const calc=()=>lines.map(ln=>{const s=L[ln.tour],k=s.paquetes[ln.paq]||s.paquetes[0],p=pd(k,ln.n);return{s,k,p,n:ln.n,fecha:ln.fecha,cot:!(k.precio>0),sub:k.precio>0?ln.n*p:0}});
 const draw=()=>{const a=calc(),tot=a.reduce((x,y)=>x+y.sub,0),cot=a.some(y=>y.cot);
  $('#res').innerHTML=a.map((y,i)=>`<div class="rl"><strong>${i+1}. ${esc(y.s.nombre)}</strong><span class="nota">${esc(y.k.nombre)} · ${y.fecha?esc(larga(y.fecha)):'fecha por elegir'}</span><span>${y.n} × ${y.cot?'por confirmar':mxn(y.p)}${!y.cot&&y.n>=5&&y.k.grupo>0?' <span class="tag">grupo</span>':''}</span><b>${y.cot?'Por cotizar':mxn(y.sub)}</b></div>`).join('')
   +`<p class="total">${cot&&!tot?'Por cotizar':'Total: '+mxn(tot)}</p>`+(cot?'<p class="nota">'+(tot?'Más los boletos por cotizar. ':'')+'Te confirmamos el precio antes de cobrar.</p>':'')};
 lineasHtml();draw();
 $('#lineas').addEventListener('change',e=>{const el=e.target,ln=lines[el.closest('.linea').dataset.i];if(!el.dataset.f)return;ln[el.dataset.f]=el.value;if(el.dataset.f==='tour'){ln.paq='0';lineasHtml()}draw()});
 $('#lineas').addEventListener('click',e=>{const x=e.target.closest('[data-x]'),d=e.target.closest('[data-d]');
  if(x){lines.splice(+x.dataset.x,1);lineasHtml();draw();return}
  if(d){const ln=lines[d.closest('.linea').dataset.i];ln.n=Math.min(50,Math.max(1,ln.n+ +d.dataset.d));d.parentElement.querySelector('output').textContent=ln.n;draw()}});
 $('#agregar').onclick=()=>{if(lines.length>=12){toast('Máximo 12 boletos por pedido.');return}const u=lines[lines.length-1];lines.push(mk(u.tour,0,1,u.fecha));lineasHtml();draw();const l=document.querySelectorAll('.linea');l[l.length-1].scrollIntoView({block:'center',behavior:calma?'auto':'smooth'})};
 f.addEventListener('input',draw);
 const confeti=()=>{if(calma)return;const w=document.createElement('div');w.className='confeti';w.setAttribute('aria-hidden','true');
  for(let i=0;i<46;i++){const s=document.createElement('i');s.style.cssText=`left:${Math.random()*100}%;background:${['#ffc857','#2bb3a8','#eaf6f4','#ff9a90'][i%4]};animation-delay:${Math.random()*.6}s;animation-duration:${1.8+Math.random()*1.5}s`;w.append(s)}
  document.body.append(w);setTimeout(()=>w.remove(),4000)};
 f.addEventListener('submit',e=>{e.preventDefault();const m=$('#mensaje');m.className='msg err';
  if(!f.nombre.value.trim()||!f.telefono.value.trim()){m.textContent='Revisa tu nombre y teléfono.';return}
  const bad=lines.findIndex(l=>!l.fecha||l.fecha<hoy);if(bad>=0){m.textContent=`Elige una fecha de hoy en adelante para el boleto ${bad+1}.`;return}
  if(!f.acepto.checked){m.textContent='Debes confirmar que tus datos son correctos.';return}
  const a=calc(),d=new Date(),tot=a.reduce((x,y)=>x+y.sub,0),cli={nombre:f.nombre.value.trim(),correo:c.correo,telefono:f.telefono.value.trim()};
  const items=a.map(y=>({servicio:y.s.nombre,paquete:y.k.nombre,unidad:unit(y.s),personas:y.n,precio:y.p,total:y.sub,cotizar:y.cot,fecha:y.fecha}));
  const r={folio:'VIP-'+d.toISOString().slice(2,10).replace(/-/g,'')+'-'+Math.random().toString(36).slice(2,6).toUpperCase(),creado:d.toLocaleString('es-MX'),items,servicio:itemsTxt({items}),paquete:'',fechaTour:items[0].fecha,personas:items.reduce((x,y)=>x+y.personas,0),total:tot,cotizar:items.every(y=>y.cotizar),pago:f.pago.value,notas:f.notas.value.trim(),estado:'Pendiente',cliente:cli};
  const l=pedidos();l.push(r);
  if(!save('vip_pedidos',l)){m.textContent='No se pudo guardar tu pedido en este navegador.';return}
  const L2=clientes(),ix=L2.findIndex(x=>x.correo===c.correo);if(ix>=0){L2[ix].nombre=cli.nombre;L2[ix].telefono=cli.telefono;save('vip_clientes',L2)}
  const txt=`Pedido ${r.folio}\n`+items.map((y,i)=>`${i+1}. ${y.servicio} (${y.paquete}) x${y.personas}, ${larga(y.fecha)}${y.cotizar?' - por cotizar':' - '+mxn(y.total)}`).join('\n')+`\nTotal: ${totTxt(r)}\nPago: ${r.pago}\nNombre: ${cli.nombre}\nTeléfono: ${cli.telefono}`;
  $('#compraBox').hidden=true;const b=$('#listo');b.hidden=false;
  b.innerHTML=`<div class="boleto"><span class="tag">Pedido registrado</span><h2>¡Listo, ${esc(cli.nombre.split(' ')[0])}!</h2><p class="folio">${esc(r.folio)}</p><dl>${items.map((y,i)=>`<dt>Boleto ${i+1}</dt><dd>${esc(y.servicio)}<br><small>${esc(y.paquete)} · ${y.personas} ${y.unidad==='boleto'?'boleto(s)':'persona(s)'} · ${esc(larga(y.fecha))}<br>${y.cotizar?'Por cotizar':mxn(y.total)}</small></dd>`).join('')}<dt>Pago</dt><dd>${esc(r.pago)}</dd><dt>Total</dt><dd>${totTxt(r)}</dd><dt>Estado</dt><dd>Pendiente de confirmación</dd></dl><p>Guarda tu folio y compártelo con la agencia para confirmar tu lugar.</p><div class="acciones"><button class="btn" id="imp" type="button">Imprimir comprobante</button><a class="btn sec" target="_blank" rel="noopener" href="https://wa.me/${AGENCIA.whatsapp}?text=${encodeURIComponent(txt)}">Enviar por WhatsApp</a><a class="btn sec" href="mailto:vipaventours@gmail.com?subject=${encodeURIComponent('Pedido '+r.folio)}&body=${encodeURIComponent(txt)}">Enviar por correo</a><a class="btn sec" href="historial.html">Ver mi historial</a></div><p id="envio" class="nota" aria-live="polite"></p></div>`;
  $('#imp').onclick=()=>print();scrollTo({top:0,behavior:calma?'auto':'smooth'});confeti();
  if(AGENCIA.endpoint){const ev=$('#envio');ev.textContent='Enviando tu pedido a la agencia...';
   enviar(r).then(ok=>{ev.textContent=ok?'Pedido enviado a la agencia por correo.':'No pudimos enviarlo automáticamente. Usa el botón de WhatsApp o el de correo.';
    if(ok){const q=pedidos(),k2=q.findIndex(x=>x.folio===r.folio);if(k2>=0){q[k2].enviado=true;save('vip_pedidos',q)}}})}
 });
 }
}
if(P==='qr'){
 const u=$('#url'),box=$('#qrbox'),m=$('#mensaje');
 u.value=/^https?:/.test(location.protocol)?new URL('enlaces.html',location.href).href:'';
 const hacer=()=>{m.className='msg err';box.innerHTML='';$('#qrcard').hidden=true;$('#qracc').hidden=true;
  let url;try{url=new URL(u.value.trim());if(!/^https?:$/.test(url.protocol))throw 0}catch{m.textContent='Escribe una dirección completa, por ejemplo https://tudominio.com/enlaces.html';return}
  if(typeof QRCode==='undefined'){m.textContent='No se pudo cargar el generador. Revisa tu conexión a internet.';return}
  new QRCode(box,{text:url.href,width:320,height:320,correctLevel:QRCode.CorrectLevel.M});
  $('#qrcard').hidden=false;$('#qracc').hidden=false;m.className='msg ok';m.textContent='Listo. Escanéalo con tu celular para probarlo antes de imprimirlo.'};
 $('#qrForm').addEventListener('submit',e=>{e.preventDefault();hacer()});
 $('#descargar').onclick=()=>{const c=box.querySelector('canvas');if(!c)return;const s=document.createElement('canvas');s.width=s.height=c.width+80;const x=s.getContext('2d');x.fillStyle='#fff';x.fillRect(0,0,s.width,s.height);x.drawImage(c,40,40);
  const a=document.createElement('a');a.href=s.toDataURL('image/png');a.download='qr-vip-adventour.png';a.click()};
 $('#imprimir').onclick=()=>print();
 addEventListener('load',()=>{if(u.value)hacer()});
}
reveal();
