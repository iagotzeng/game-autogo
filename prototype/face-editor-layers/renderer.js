const f=n=>(Math.round(n*10)/10).toString();
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function hex2rgb(h){h=h.replace('#','');const n=parseInt(h,16);return [(n>>16)&255,(n>>8)&255,n&255];}
function rgb2hex(r,g,b){return '#'+[r,g,b].map(v=>clamp(Math.round(v),0,255).toString(16).padStart(2,'0')).join('');}
function mix(a,b,t){const A=hex2rgb(a),B=hex2rgb(b);return rgb2hex(A[0]+(B[0]-A[0])*t,A[1]+(B[1]-A[1])*t,A[2]+(B[2]-A[2])*t);}
const shade=(h,t)=>mix(h,'#2a2530',t), tint=(h,t)=>mix(h,'#ffffff',t);
function luma(h){const [r,g,b]=hex2rgb(h);return (0.299*r+0.587*g+0.114*b)/255;}

const SKINS=['#f6e8dc','#f2dcc9','#ecd0b6','#dcb693','#c4966e','#94664a'];
const HAIRS=['#f1f3f6','#c9ced6','#8a8f99','#3a2c26','#1f1c22','#6b3f2a','#a8743a','#5b7fc2','#8e5aa8','#b8302b'];
const IRISES=['#6fc3e6','#3d6fb8','#5a8a4a','#4a3c32','#c43a3a','#e0a030','#8e5aa8','#7c8a99'];
const ROBES=[['青雲宗','#f7f9fb','#5b7fc2','#c9d6ee'],['神農谷','#e8f0e4','#3f7a4e','#b9d6bf'],['大雷音寺','#f4dfb0','#b8862b','#e7c26a'],['血河宗','#2b2530','#a3262b','#5a2f39'],['萬妖山','#cfae82','#6b4a2b','#a8743a'],['逍遙居','#dcdfe5','#4a4e8a','#a9adc6']];
const AURAS=[['金','#e8d27a'],['木','#8fd39a'],['水','#7fb8f5'],['火','#f59a7f'],['土','#d4b58a'],['雷','#c9a6ff'],['冰','#7fd4f5'],['風','#b8e8d8']];
const FACES=['瓜子臉','鵝蛋臉','圓臉','方臉','長臉','菱形臉'];
const BROWS=['劍眉','柳葉眉','平眉','粗眉','英氣眉','八字眉'];
const EYES=['鳳眼','桃花眼','杏眼','狹長眼','下垂眼','狐狸眼','圓眼','半闔眼'];
const NOSES=['挺鼻','小巧鼻','鷹鉤鼻','圓鼻','高山根'];
const MOUTHS=['冷峻','微笑','抿唇','薄唇','厚唇','淺笑露齒'];
const BANGS=['中分','斜瀏海','齊瀏海','露額','碎髮','三七分','垂髮遮眼','無（光頭）'];
const BACKS=['道髻長髮','高馬尾','披髮','短髮','半束髮','光頭'];
const PINS=['無','銀簪','玉簪','金冠','髮帶'];
const MARKS=['無','冰晶花鈿','朱砂','金印','眉心道紋','雙頰道紋','左眼疤'];
const EXTRA=['無','山羊鬍','八字鬍','絡腮鬍','面靨','雀斑'];
function sc(pts){const n=pts.length;let d=`M${f(pts[0][0])} ${f(pts[0][1])}`;for(let i=0;i<n;i++){const p0=pts[(i-1+n)%n],p1=pts[i],p2=pts[(i+1)%n],p3=pts[(i+2)%n];d+=` C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`;}return d+'Z';}
function so(pts){const n=pts.length;let d=`M${f(pts[0][0])} ${f(pts[0][1])}`;for(let i=0;i<n-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n-1,i+2)];d+=` C${f(p1[0]+(p2[0]-p0[0])/6)} ${f(p1[1]+(p2[1]-p0[1])/6)} ${f(p2[0]-(p3[0]-p1[0])/6)} ${f(p2[1]-(p3[1]-p1[1])/6)} ${f(p2[0])} ${f(p2[1])}`;}return d;}
const cub=(p0,p1,p2,p3,t)=>{const u=1-t;return [u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1]];};
// tapered stroke along a cubic: width profile w(t)
function taperCubic(p0,p1,p2,p3,wfn,N){N=N||18;const up=[],dn=[];for(let i=0;i<=N;i++){const t=i/N;const p=cub(p0,p1,p2,p3,t);const q=cub(p0,p1,p2,p3,Math.min(1,t+0.01)),r=cub(p0,p1,p2,p3,Math.max(0,t-0.01));let dx=q[0]-r[0],dy=q[1]-r[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;const w=wfn(t);up.push([p[0]-dy*w/2,p[1]+dx*w/2]);dn.push([p[0]+dy*w/2,p[1]-dx*w/2]);}return 'M'+up.concat(dn.reverse()).map(p=>f(p[0])+' '+f(p[1])).join(' L ')+'Z';}
const MIR='transform="matrix(-1 0 0 1 600 0)"';

const CX=300;
function renderLayers(P,LS){
  const thumb=false;const u='m';const want=k=>LS.has(k);
  const skin=P.skin,skinSh=mix(skin,'#b07a70',0.32),skinSh2=mix(skin,'#b07a70',0.16),skinHi=tint(skin,0.5);
  const hair=P.hair,hairDk=luma(hair)>0.6?mix(hair,'#7f93ad',0.5):shade(hair,0.42),hairLt=luma(hair)>0.6?'#ffffff':tint(hair,0.42),hairMid=luma(hair)>0.6?mix(hair,'#a9b8c9',0.22):shade(hair,0.15);
  const INK='#2b2733',INKF='#3a3340';
  const robe=ROBES[P.robe],aura=AURAS[P.aura][1];
  const out=[];const a=s=>out.push(s);
  const lip=mix(skin,'#c25a66',0.55),lipLt=mix(skin,'#c25a66',0.3);
  a(`<defs>
    <radialGradient id="paper${u}" cx="0.5" cy="0.42" r="0.75"><stop offset="0" stop-color="#fbfcfe"/><stop offset="0.6" stop-color="#e9eef4"/><stop offset="1" stop-color="#cfd9e4"/></radialGradient>
    <radialGradient id="sun${u}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="#fff6dc" stop-opacity="1"/><stop offset="0.6" stop-color="#fff2cc" stop-opacity="0.5"/><stop offset="1" stop-color="#fff2cc" stop-opacity="0"/></radialGradient>
    <radialGradient id="aura${u}" cx="0.5" cy="0.5" r="0.5"><stop offset="0" stop-color="${aura}" stop-opacity="0.5"/><stop offset="0.6" stop-color="${aura}" stop-opacity="0.15"/><stop offset="1" stop-color="${aura}" stop-opacity="0"/></radialGradient>
    <linearGradient id="skinG${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${skinHi}"/><stop offset="0.45" stop-color="${skin}"/><stop offset="1" stop-color="${skinSh2}"/></linearGradient>
    <linearGradient id="robeG${u}" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${tint(robe[1],0.2)}"/><stop offset="1" stop-color="${shade(robe[1],0.1)}"/></linearGradient>
    <linearGradient id="hairG${u}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${hairLt}"/><stop offset="0.35" stop-color="${hair}"/><stop offset="1" stop-color="${hairMid}"/></linearGradient>
    <radialGradient id="irisG${u}" cx="0.5" cy="0.3" r="0.7"><stop offset="0" stop-color="${tint(P.iris,0.5)}"/><stop offset="0.55" stop-color="${P.iris}"/><stop offset="1" stop-color="${shade(P.iris,0.6)}"/></radialGradient>
    <filter id="soft${u}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="9"/></filter>
    <filter id="soft2${u}" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
    <clipPath id="faceClip${u}"><path id="faceClipP${u}"/></clipPath>
  </defs>`);
  const FL=thumb?'':`filter="url(#soft${u})"`, FL2=thumb?'':`filter="url(#soft2${u})"`;
  /* background */
  if(want('bg')){
  a(`<rect width="600" height="760" fill="url(#paper${u})"/>`);
  if(!thumb){a(`<path d="M0 620 L70 585 L140 610 L210 570 L290 615 L370 580 L450 605 L530 565 L600 600 L600 760 L0 760Z" fill="#8fa0b4" opacity="0.25"/><path d="M0 690 L90 660 L170 680 L260 650 L350 690 L440 660 L530 680 L600 655 L600 760 L0 760Z" fill="#6d7f96" opacity="0.3"/>`);
    a(`<circle cx="300" cy="330" r="300" fill="url(#sun${u})"/>`);
    const sw=[[70,110,-25],[535,105,25],[38,320,-40],[562,330,40],[105,520,-55],[500,530,55],[300,52,0],[190,70,-12],[410,70,12],[130,200,-30],[470,200,30]];
    sw.forEach(([x,y,r])=>a(`<g transform="translate(${x} ${y}) rotate(${r})" opacity="0.3"><path d="M0 -36 L4 -22 L4 16 L10 19 L10 23 L4 23 L3 33 L-3 33 L-4 23 L-10 23 L-10 19 L-4 16 L-4 -22Z" fill="${aura}" stroke="#ffffff" stroke-width="0.8"/></g>`));}
  a(`<ellipse cx="300" cy="520" rx="290" ry="330" fill="url(#aura${u})"/>`);
  if(P.halo===1){a(`<circle cx="300" cy="360" r="222" fill="none" stroke="#d9b45a" stroke-width="3" opacity="0.55"/><circle cx="300" cy="360" r="238" fill="none" stroke="#e8cd85" stroke-width="1.2" opacity="0.5" stroke-dasharray="5 9"/><circle cx="300" cy="360" r="208" fill="none" stroke="#f1dc9c" stroke-width="1" opacity="0.6"/>`);}
  }
  const ink=w=>`stroke="${INK}" stroke-width="${w}" stroke-linejoin="round" stroke-linecap="round"`;

  /* ---- hair back ---- */
  const bk=P.back, bald=bk===5;
  const hairFill=`fill="url(#hairG${u})"`;
  function strandLines(list,col,w){return list.map(d=>`<path d="${d}" fill="none" stroke="${col}" stroke-width="${w||2}" stroke-linecap="round"/>`).join('');}
  if(want('hairBack')&&!bald){
    if(bk===0){ // 道髻長髮: long mass + flowing strands to the right
      a(`<path d="${sc([[300,168],[380,182],[418,235],[428,320],[440,420],[452,520],[470,600],[500,690],[480,760],[120,760],[100,690],[130,600],[150,520],[160,420],[172,320],[182,235],[220,182]])}" ${hairFill} ${ink(3)}/>`);
      // flowing strands
      [[[380,290],[450,282],[525,296],[596,328]],[[386,330],[462,338],[540,372],[598,418]],[[392,376],[470,398],[538,446],[586,512]],[[396,420],[470,462],[525,528],[556,600]],[[398,470],[455,520],[495,590],[512,660]]].forEach((pts,i)=>{
        const d=so(pts);a(`<path d="${taperCubicFromPoly(pts,30-i*3,2)}" ${hairFill} ${ink(1.8)}/>`);a(`<path d="${d}" fill="none" stroke="${hairLt}" stroke-width="2.2" opacity="0.7"/>`);});
      a(strandLines(["M395 240 C 420 320, 430 430, 432 560","M205 240 C 180 320, 168 430, 170 560","M410 300 C 440 360, 450 460, 455 600","M190 300 C 160 360, 150 460, 150 600"],hairDk,2));
      a(`<path d="M232 236 C 260 300, 262 380, 250 430" fill="none" stroke="${hairLt}" stroke-width="5" opacity="0.6"/><path d="M372 236 C 350 300, 350 380, 360 430" fill="none" stroke="${hairLt}" stroke-width="5" opacity="0.6"/>`);
    }else if(bk===1){ // 高馬尾
      a(`<path d="${sc([[300,168],[380,182],[420,240],[428,330],[410,420],[190,420],[172,330],[180,240],[220,182]])}" ${hairFill} ${ink(3)}/>`);
      const pts=[[330,190],[430,170],[520,210],[560,300],[550,420],[520,520]];a(`<path d="${taperCubicFromPoly(pts,52,8)}" ${hairFill} ${ink(3)}/>`);a(strandLines(["M420 180 C 500 220, 540 300, 535 420","M440 200 C 505 250, 530 330, 520 460"],hairDk,2));
      a(`<path d="M328 176 L 352 168 L 356 186 L 334 194Z" fill="${robe[2]}" ${ink(1.6)}/>`);
    }else if(bk===2||bk===4){ // 披髮 / 半束髮
      a(`<path d="${sc([[300,168],[380,182],[420,235],[432,320],[438,430],[440,540],[450,650],[455,760],[145,760],[150,650],[160,540],[162,430],[168,320],[180,235],[220,182]])}" ${hairFill} ${ink(3)}/>`);
      a(strandLines(["M400 250 C 425 350, 428 480, 432 640","M200 250 C 175 350, 172 480, 168 640","M415 320 C 432 420, 436 560, 442 700","M185 320 C 168 420, 164 560, 158 700"],hairDk,2));
      a(`<path d="M236 240 C 262 310, 262 400, 252 470" fill="none" stroke="${hairLt}" stroke-width="5" opacity="0.6"/><path d="M366 240 C 342 310, 342 400, 352 470" fill="none" stroke="${hairLt}" stroke-width="5" opacity="0.6"/>`);
    }else if(bk===3){ // 短髮
      a(`<path d="${sc([[300,166],[372,178],[412,222],[424,290],[416,360],[396,395],[372,382],[350,400],[250,400],[228,382],[204,395],[184,360],[176,290],[188,222],[228,178]])}" ${hairFill} ${ink(3)}/>`);
      a(strandLines(["M402 250 C 415 300, 410 350, 395 385","M198 250 C 185 300, 190 350, 205 385"],hairDk,2));
    }
  }
  if(want('body')){
  /* ---- body ---- */
  const shY=515;
  a(`<path d="M232 470 L 226 528 L 374 528 L 368 470 Z" fill="${skinSh2}" ${ink(2)}/>`);
  a(`<path d="M234 472 C 260 500, 340 500, 366 472 L 366 500 C 340 522, 260 522, 234 500 Z" fill="${skinSh}" opacity="0.6"/>`);
  a(`<path d="M20 760 C 40 640, 110 540, 232 522 L 368 522 C 490 540, 560 640, 580 760 Z" fill="url(#robeG${u})" ${ink(3)}/>`);
  // shoulder folds
  a(`<path d="M120 640 C 140 600, 170 570, 215 545 M480 640 C 460 600, 430 570, 385 545" fill="none" stroke="${shade(robe[1],0.25)}" stroke-width="2" opacity="0.7"/>`);
  // cross collar: right lapel under, left over
  function lapel(sd,over){const s=sd;const inner=`M${f(300+s*78)} 514 C ${f(300+s*40)} 548, ${f(300+s*8)} 596, ${f(300-s*6+(over?s*10:0))} ${over?646:640}`;
    const shape=`${inner} L ${f(300+s*34)} 668 C ${f(300+s*44)} 620, ${f(300+s*80)} 560, ${f(300+s*118)} 526 Z`;
    return `<path d="${shape}" fill="url(#robeG${u})" ${ink(2.6)}/><path d="${inner}" fill="none" stroke="${robe[2]}" stroke-width="13"/><path d="${inner}" fill="none" stroke="${robe[3]}" stroke-width="2.2"/><path d="${inner}" fill="none" stroke="${INK}" stroke-width="1.5" transform="translate(${f(6*s)} 0)" opacity="0.85"/>`;}
  a(`<path d="M246 512 L 300 588 L 354 512 Z" fill="${tint(robe[1],0.55)}" ${ink(2)}/>`);
  a(lapel(1,false));a(lapel(-1,true));
  const cloud=(x,y,s)=>`<path d="M${x} ${y} c-9 -8 -4 -22 9 -19 c4 -12 22 -10 25 2 c12 -3 19 10 10 18z" transform="translate(${x} ${y}) scale(${s}) translate(${-x} ${-y})" fill="none" stroke="${robe[3]}" stroke-width="2"/>`;
  a(cloud(150,600,1));a(cloud(450,600,1));a(cloud(100,690,0.8));a(cloud(500,690,0.8));a(cloud(230,720,0.7));a(cloud(370,720,0.7));

  }
  /* ---- face ---- */
  const FACE_PTS=[
    [[300,172],[392,215],[406,300],[398,395],[372,455],[332,486],[300,494],[268,486],[228,455],[202,395],[194,300],[208,215]], // 瓜子
    [[300,172],[392,215],[408,300],[404,395],[382,458],[338,490],[300,496],[262,490],[218,458],[196,395],[192,300],[208,215]], // 鵝蛋
    [[300,176],[396,218],[416,300],[412,392],[386,452],[340,482],[300,486],[260,482],[214,452],[188,392],[184,300],[204,218]], // 圓
    [[300,172],[394,214],[410,300],[406,398],[392,462],[344,484],[300,486],[256,484],[208,462],[194,398],[190,300],[206,214]], // 方
    [[300,168],[386,212],[402,300],[398,400],[374,468],[334,500],[300,508],[266,500],[226,468],[202,400],[198,300],[214,212]], // 長
    [[300,172],[386,214],[412,305],[396,400],[366,458],[326,488],[300,494],[274,488],[234,458],[204,400],[188,305],[214,214]]  // 菱形
  ][P.face];
  const faceD=sc(FACE_PTS);
  if(want('face')){
  // ears
  a(`<ellipse cx="197" cy="352" rx="10" ry="17" fill="${skin}" ${ink(2)}/><path d="M199 342 C 205 348, 204 360, 197 364" fill="none" stroke="${skinSh}" stroke-width="1.6"/>`);
  a(`<ellipse cx="403" cy="352" rx="10" ry="17" fill="${skin}" ${ink(2)}/><path d="M401 342 C 395 348, 396 360, 403 364" fill="none" stroke="${skinSh}" stroke-width="1.6"/>`);
  a(`<path d="${faceD}" fill="url(#skinG${u})" stroke="${INKF}" stroke-width="2.2" stroke-linejoin="round"/>`);
  a(`<g clip-path="url(#faceClip${u})">`);
  a(`<ellipse cx="300" cy="470" rx="90" ry="40" fill="${skinSh}" opacity="0.32" ${FL}/>`);
  a(`<ellipse cx="236" cy="396" rx="34" ry="18" fill="#e8909a" opacity="0.13" ${FL}/><ellipse cx="364" cy="396" rx="34" ry="18" fill="#e8909a" opacity="0.13" ${FL}/>`);
  a(`<ellipse cx="300" cy="262" rx="70" ry="30" fill="#ffffff" opacity="0.28" ${FL}/>`);
  a(`<path d="M196 300 C 206 340, 208 380, 224 420" fill="none" stroke="${skinSh}" stroke-width="10" opacity="0.28" ${FL2}/><path d="M404 300 C 394 340, 392 380, 376 420" fill="none" stroke="${skinSh}" stroke-width="10" opacity="0.28" ${FL2}/>`);
  if(P.extra===5){a(`<g fill="${shade(skin,0.4)}" opacity="0.6">${[[228,388],[240,395],[252,388],[236,404],[224,398],[248,402],[372,388],[360,395],[348,388],[364,404],[376,398],[352,402],[290,412],[310,412]].map((p,i)=>`<circle cx="${p[0]}" cy="${p[1]}" r="${1.6+(i%3)*0.5}"/>`).join('')}</g>`);}
  a(`</g>`);

  }
  if(want('eyes')){
  /* ---- eyes ---- */
  const EYE_SPECS=[
    {w:24,h:12,tilt:8,lid:4.2,ir:11,lash:2,lower:0.45,crease:1,flick:1},     // 鳳眼
    {w:24,h:14,tilt:5,lid:3.6,ir:12.5,lash:3,lower:0.55,crease:1,flick:1.2}, // 桃花眼
    {w:23,h:16,tilt:0,lid:3.4,ir:14,lash:2,lower:0.6,crease:1,flick:0.6},    // 杏眼
    {w:26,h:9,tilt:7,lid:3.8,ir:9.5,lash:1,lower:0.35,crease:0,flick:1.1},   // 狹長
    {w:24,h:13,tilt:-7,lid:3.4,ir:12,lash:2,lower:0.5,crease:1,flick:0.4},   // 下垂
    {w:25,h:11,tilt:12,lid:4.4,ir:10.5,lash:2,lower:0.4,crease:1,flick:1.5}, // 狐狸
    {w:22,h:18,tilt:0,lid:3.2,ir:15,lash:3,lower:0.7,crease:0,flick:0.4},    // 圓
    {w:25,h:8,tilt:2,lid:4.0,ir:11,lash:1,lower:0.3,crease:1,flick:0.8,half:1} // 半闔
  ];
  const es=EYE_SPECS[P.eye];
  function eyeSvg(){ // left eye (viewer's left), centre (245,338); mirrored for the right
    const ex=245,ey=338,w=es.w,h=es.h,t=es.tilt;
    const inner=[ex+w,ey+t*0.35],outer=[ex-w,ey-t*0.65];
    const c1=[ex+w*0.55,ey-h*0.95],c2=[ex-w*0.5,ey-h*1.05-t*0.25];
    const l1=[ex-w*0.55,ey+h*es.lower],l2=[ex+w*0.45,ey+h*es.lower*1.05];
    const full=`M${f(inner[0])} ${f(inner[1])} C${f(c1[0])} ${f(c1[1])} ${f(c2[0])} ${f(c2[1])} ${f(outer[0])} ${f(outer[1])} C${f(l1[0])} ${f(l1[1])} ${f(l2[0])} ${f(l2[1])} ${f(inner[0])} ${f(inner[1])}Z`;
    let s='';
    s+=`<ellipse cx="${ex}" cy="${ey-4}" rx="${w*1.25}" ry="${h*1.4}" fill="${skinSh}" opacity="0.22" ${FL2}/>`;
    s+=`<path d="${full}" fill="#ffffff" stroke="${INKF}" stroke-width="1.2"/>`;
    const ir=es.ir,icx=ex-w*0.04,icy=ey+h*0.08;
    s+=`<clipPath id="ec${u}"><path d="${full}"/></clipPath><g clip-path="url(#ec${u})">`;
    s+=`<ellipse cx="${f(icx)}" cy="${f(icy)}" rx="${ir}" ry="${f(ir*1.18)}" fill="url(#irisG${u})" stroke="${shade(P.iris,0.62)}" stroke-width="1.4"/>`;
    s+=`<ellipse cx="${f(icx)}" cy="${f(icy-ir*0.05)}" rx="${f(ir*0.42)}" ry="${f(ir*0.55)}" fill="#141a22"/>`;
    s+=`<path d="M${f(icx-ir)} ${f(icy+ir*0.35)} A ${ir} ${f(ir*1.18)} 0 0 0 ${f(icx+ir)} ${f(icy+ir*0.35)} L ${f(icx+ir)} ${f(icy+ir*1.3)} L ${f(icx-ir)} ${f(icy+ir*1.3)}Z" fill="${tint(P.iris,0.35)}" opacity="0.55"/>`;
    s+=`<rect x="${ex-w-2}" y="${ey-h*1.6}" width="${w*2+4}" height="${h*1.15}" fill="${INK}" opacity="0.18"/>`;
    s+=`<circle cx="${f(icx-ir*0.38)}" cy="${f(icy-ir*0.45)}" r="${f(ir*0.3)}" fill="#ffffff"/><circle cx="${f(icx+ir*0.4)}" cy="${f(icy+ir*0.5)}" r="${f(ir*0.13)}" fill="#ffffff" opacity="0.9"/>`;
    s+=`</g>`;
    if(es.half){s+=`<path d="M${f(inner[0])} ${f(inner[1])} C${f(c1[0])} ${f(c1[1]+h*0.55)} ${f(c2[0])} ${f(c2[1]+h*0.6)} ${f(outer[0])} ${f(outer[1])} C${f(c2[0])} ${f(c2[1]-h*0.2)} ${f(c1[0])} ${f(c1[1]-h*0.2)} ${f(inner[0])} ${f(inner[1])}Z" fill="${skin}"/>`;}
    // upper lid tapered ink
    s+=`<path d="${taperCubic(inner,c1,c2,outer,tt=>es.lid*(0.35+0.65*Math.sin(Math.PI*Math.min(1,tt*1.1)))*(tt>0.85?1.35:1))}" fill="${INK}"/>`;
    // flick + lashes at the outer corner
    s+=`<path d="M${f(outer[0]+2)} ${f(outer[1]-1)} C ${f(outer[0]-5*es.flick)} ${f(outer[1]-5*es.flick)} ${f(outer[0]-8*es.flick)} ${f(outer[1]-7*es.flick)} ${f(outer[0]-12*es.flick)} ${f(outer[1]-9*es.flick)} L ${f(outer[0]-8*es.flick)} ${f(outer[1]-4*es.flick)} Z" fill="${INK}"/>`;
    for(let i=0;i<es.lash;i++){const tt=0.62+i*0.14;const p=cub(inner,c1,c2,outer,tt);const q=cub(inner,c1,c2,outer,tt+0.02);const dx=q[0]-p[0],dy=q[1]-p[1];const l=Math.hypot(dx,dy)||1;const nx=dy/l,ny=-dx/l;s+=`<path d="M${f(p[0])} ${f(p[1])} L${f(p[0]+nx*7-dx/l*3)} ${f(p[1]+ny*7-dy/l*3)}" stroke="${INK}" stroke-width="1.8" stroke-linecap="round"/>`;}
    // lower lid line (outer part) and crease
    s+=`<path d="M${f(outer[0]+4)} ${f(outer[1]+h*0.45)} C${f(ex-w*0.4)} ${f(ey+h*es.lower+2)} ${f(ex)} ${f(ey+h*es.lower+2.5)} ${f(ex+w*0.5)} ${f(ey+h*es.lower*0.9)}" fill="none" stroke="${INK}" stroke-width="1.4" opacity="0.75"/>`;
    if(es.crease)s+=`<path d="M${f(ex+w*0.6)} ${f(ey-h*1.35)} C${f(ex)} ${f(ey-h*1.75)} ${f(ex-w*0.5)} ${f(ey-h*1.7-t*0.3)} ${f(ex-w*0.95)} ${f(ey-h*1.15-t*0.5)}" fill="none" stroke="${skinSh}" stroke-width="1.6" opacity="0.9"/>`;
    s+=`<path d="M${f(ex+w*0.9)} ${f(ey+h*es.lower+4)} C${f(ex+w*0.3)} ${f(ey+h*es.lower+8)} ${f(ex-w*0.3)} ${f(ey+h*es.lower+8)} ${f(ex-w*0.8)} ${f(ey+h*es.lower+3)}" fill="none" stroke="${skinSh}" stroke-width="1.4" opacity="0.5"/>`;
    return s;
  }
  const eyeOne=eyeSvg();
  a(`<g>${eyeOne}</g><g ${MIR}>${eyeOne.replace(`id="ec${u}"`,`id="ec${u}r"`).replace(`url(#ec${u})`,`url(#ec${u}r)`)}</g>`);

  }
  if(want('brows')){
  /* ---- brows ---- */
  const BROW_SPECS=[
    {iy:300,oy:286,arch:6,w:5.6,end:0.3,sf:0.8},   // 劍眉
    {iy:302,oy:296,arch:11,w:3.4,end:0.25,sf:0.5}, // 柳葉
    {iy:300,oy:298,arch:2,w:5.4,end:0.75,sf:0.8},  // 平眉
    {iy:301,oy:294,arch:5,w:8.5,end:0.7,sf:0.85},  // 粗眉
    {iy:299,oy:282,arch:4,w:6.2,end:0.35,sf:0.9},  // 英氣
    {iy:296,oy:306,arch:2,w:4.6,end:0.4,sf:0.6}    // 八字
  ];
  const bs=BROW_SPECS[P.brow];
  const browCol=luma(hair)>0.6?'#454c5c':shade(hair,0.25);
  function browOne(){const ix=272,ox=213,iy=bs.iy,oy=bs.oy;const px=ix+(ox-ix)*0.6,py=Math.min(iy,oy)-bs.arch;
    const N=16,up=[],dn=[];for(let i=0;i<=N;i++){const t=i/N,uu=1-t;const x=uu*uu*ix+2*uu*t*px+t*t*ox,y=uu*uu*iy+2*uu*t*py+t*t*oy;const dx=2*uu*(px-ix)+2*t*(ox-px),dy=2*uu*(py-iy)+2*t*(oy-py);const l=Math.hypot(dx,dy)||1;const nx=-dy/l,ny=dx/l;const th=bs.w*(bs.sf+(1-bs.sf)*Math.sin(Math.PI*Math.min(1,t*1.15)))*(1-(1-bs.end)*t);up.push([x+nx*th/2,y+ny*th/2]);dn.push([x-nx*th/2,y-ny*th/2]);}
    return `<path d="M${up.concat(dn.reverse()).map(p=>f(p[0])+' '+f(p[1])).join(' L ')}Z" fill="${browCol}"/>`;}
  const b1=browOne();a(`<g>${b1}</g><g ${MIR}>${b1}</g>`);

  }
  if(want('nose')){
  /* ---- nose ---- */
  const nc=`stroke="${skinSh}" fill="none" stroke-linecap="round"`;
  const NOSE=[
    `<path d="M296 352 C 293 372, 290 386, 288 396 C 290 402, 300 403, 306 400" stroke-width="2.4" ${nc}/><path d="M311 392 C 316 396, 314 401, 308 402" stroke-width="2" ${nc} opacity="0.8"/><path d="M296 356 C 294 372, 292 384, 290 392" stroke="${skinSh}" stroke-width="6" opacity="0.14" ${FL2} fill="none"/>`,
    `<path d="M290 394 C 292 401, 308 401, 310 394" stroke-width="2.4" ${nc}/><path d="M297 366 C 295 378, 292 386, 291 392" stroke-width="1.8" ${nc} opacity="0.6"/>`,
    `<path d="M296 350 C 288 366, 286 384, 289 396 C 292 403, 302 404, 308 401" stroke-width="2.4" ${nc}/><path d="M312 391 C 318 396, 316 402, 309 403" stroke-width="2" ${nc} opacity="0.8"/><path d="M294 354 C 290 368, 289 384, 290 392" stroke="${skinSh}" stroke-width="7" opacity="0.14" ${FL2} fill="none"/>`,
    `<path d="M295 358 C 292 374, 288 388, 286 396 C 289 405, 311 405, 314 396" stroke-width="2.4" ${nc}/><path d="M284 396 C 280 392, 282 388, 286 388 M316 396 C 320 392, 318 388, 314 388" stroke-width="1.8" ${nc} opacity="0.7"/>`,
    `<path d="M297 340 C 293 360, 290 380, 288 396 C 290 402, 300 403, 306 400" stroke-width="2.4" ${nc}/><path d="M303 342 C 301 360, 299 372, 298 382" stroke="#ffffff" stroke-width="3" opacity="0.5" fill="none" stroke-linecap="round"/><path d="M311 392 C 316 396, 314 401, 308 402" stroke-width="2" ${nc} opacity="0.8"/>`
  ];
  a(NOSE[P.nose]);

  }
  if(want('mouth')){
  /* ---- mouth ---- */
  const lipInk=shade(lip,0.45);
  const MOUTH=[
    `<path d="M281 436 Q 300 433 319 436" fill="none" stroke="${lipInk}" stroke-width="2.2" stroke-linecap="round"/><path d="M283 436 Q 300 446 317 436" fill="${lipLt}" opacity="0.75"/><path d="M287 434 Q 300 429 313 434" fill="${lip}" opacity="0.4"/>`,
    `<path d="M279 433 Q 300 447 321 433" fill="none" stroke="${lipInk}" stroke-width="2.2" stroke-linecap="round"/><path d="M281 434 Q 300 449 319 434" fill="${lipLt}" opacity="0.8"/><path d="M276 428 q -3 6 1 11 M324 428 q 3 6 -1 11" fill="none" stroke="${skinSh}" stroke-width="1.6" stroke-linecap="round"/>`,
    `<path d="M283 437 L 317 437" fill="none" stroke="${lipInk}" stroke-width="2.6" stroke-linecap="round"/><path d="M285 437 Q 300 444 315 437" fill="${lipLt}" opacity="0.6"/><path d="M290 436 Q 300 433 310 436" fill="${lipLt}" opacity="0.5"/>`,
    `<path d="M284 436 Q 300 434 316 436" fill="none" stroke="${lipInk}" stroke-width="1.8" stroke-linecap="round"/><path d="M286 436 Q 300 441 314 436" fill="${lipLt}" opacity="0.6"/>`,
    `<path d="M280 434 C 288 428, 296 428, 300 431 C 304 428, 312 428, 320 434 C 314 446, 286 446, 280 434Z" fill="${lip}" opacity="0.9"/><path d="M280 434 Q 300 438 320 434" fill="none" stroke="${lipInk}" stroke-width="2" stroke-linecap="round"/><path d="M290 440 Q 300 443 310 440" fill="none" stroke="#ffffff" stroke-width="1.6" opacity="0.7"/>`,
    `<path d="M279 432 Q 300 450 321 432 Q 300 438 279 432Z" fill="#ffffff" stroke="${lipInk}" stroke-width="1.8" stroke-linejoin="round"/><path d="M281 433 Q 300 452 319 433" fill="none" stroke="${lipInk}" stroke-width="2.2" stroke-linecap="round"/><path d="M276 427 q -3 6 1 11 M324 427 q 3 6 -1 11" fill="none" stroke="${skinSh}" stroke-width="1.6" stroke-linecap="round"/>`
  ];
  a(MOUTH[P.mouth]);
  a(`<ellipse cx="300" cy="452" rx="12" ry="4" fill="${skinSh}" opacity="0.25" ${FL2}/>`);

  }
  if(want('extra')){
  /* ---- beard / extras ---- */
  const bc=luma(hair)>0.6?'#9aa5b3':shade(hair,0.15);
  if(P.extra===1){a(`<path d="M284 466 C 288 482, 294 494, 300 500 C 306 494, 312 482, 316 466 Z" fill="${bc}" ${ink(1.6)}/>`);}
  else if(P.extra===2){a(`<path d="M297 424 C 288 420, 278 424, 270 438 M303 424 C 312 420, 322 424, 330 438" fill="none" stroke="${bc}" stroke-width="4.5" stroke-linecap="round"/>`);}
  else if(P.extra===3){a(`<path d="${sc([[206,380],[210,430],[236,478],[300,496],[364,478],[390,430],[394,380],[372,395],[330,462],[300,468],[270,462],[228,395]])}" fill="${bc}" ${ink(1.6)} opacity="0.95"/>`);}
  else if(P.extra===4){a(`<circle cx="270" cy="440" r="2.6" fill="#b8302b" opacity="0.85"/><circle cx="330" cy="440" r="2.6" fill="#b8302b" opacity="0.85"/>`);}

  }
  if(want('mark')){
  /* ---- marks ---- */
  if(P.mark===1){a(`<g transform="translate(300 268)"><path d="M0 -13 L5 -4 L14 -2 L6 4 L8 13 L0 8 L-8 13 L-6 4 L-14 -2 L-5 -4Z" fill="#bfefff" stroke="#4aa8d0" stroke-width="1.2"/><path d="M0 -6 L2 0 L0 6 L-2 0Z" fill="#ffffff"/></g>`);}
  else if(P.mark===2){a(`<circle cx="300" cy="270" r="5" fill="#b8302b"/>`);}
  else if(P.mark===3){a(`<g transform="translate(300 270)"><path d="M0 -11 L9 0 L0 11 L-9 0Z" fill="none" stroke="#c9a24a" stroke-width="2.2"/><circle r="3" fill="#c9a24a"/></g>`);}
  else if(P.mark===4){a(`<path d="M300 276 L300 302 M295 284 L305 284" fill="none" stroke="#4f77c4" stroke-width="2" stroke-linecap="round" opacity="0.85"/>`);}
  else if(P.mark===5){a(`<path d="M222 372 q6 10 0 22 M232 376 q5 8 0 17 M378 372 q-6 10 0 22 M368 376 q-5 8 0 17" fill="none" stroke="#4f77c4" stroke-width="2" stroke-linecap="round" opacity="0.85"/>`);}
  else if(P.mark===6){a(`<path d="M236 304 L 258 372" stroke="#b56a6a" stroke-width="2.4" stroke-linecap="round"/><path d="M238 316 l8 2 M252 356 l8 2" stroke="#b56a6a" stroke-width="1.6" stroke-linecap="round"/>`);}

  }
  /* ---- hair front ---- */
  const bg=P.bangs;const HF=want('hairFront'),PN=want('pin');const aH=s=>{if(HF)out.push(s);},aP=s=>{if(PN)out.push(s);};
  if(!bald&&bg!==7){
    // skull cap (always) with hairline
    aH(`<path d="${sc([[300,166],[368,178],[404,216],[412,262],[398,256],[366,236],[334,232],[300,250],[266,232],[234,236],[202,256],[188,262],[196,216],[232,178]])}" ${hairFill}/>`);aH(`<path d="M188 262 C 184 214, 226 172, 300 166 C 374 172, 416 214, 412 262" fill="none" ${ink(2.6)}/>`);
    const lock=(pts,w0,w1)=>`<path d="${taperCubicFromPoly(pts,w0,w1)}" ${hairFill} ${ink(2.2)}/>`;
    if(bg===0){ // 中分
      aH(lock([[300,226],[266,250],[228,300],[212,362]],40,8));aH(lock([[300,226],[334,250],[372,300],[388,362]],40,8));
      aH(lock([[298,230],[252,262],[214,318],[204,356]],16,4));aH(lock([[302,230],[348,262],[386,318],[396,356]],16,4));
      aH(lock([[300,236],[297,266],[296,296]],9,2));
      aH(strandLines(["M280 246 C 256 268, 236 300, 226 336","M320 246 C 344 268, 364 300, 374 336"],hairDk,1.6));
    }else if(bg===1){ // 斜瀏海
      aH(lock([[356,232],[300,246],[248,278],[210,336]],48,8));aH(lock([[362,236],[326,262],[300,300],[286,330]],18,4));aH(lock([[372,238],[382,270],[392,320]],22,6));
      aH(strandLines(["M340 240 C 290 262, 250 300, 228 330","M352 246 C 316 268, 290 300, 276 322"],hairDk,1.6));
    }else if(bg===2){ // 齊瀏海
      aH(`<path d="${sc([[194,248],[300,232],[406,248],[404,300],[382,318],[356,306],[330,320],[300,308],[270,320],[244,306],[218,318],[196,300]])}" ${hairFill} ${ink(2.4)}/>`);
      aH(strandLines(["M240 250 C 238 280, 240 300, 242 312","M300 246 C 298 276, 298 296, 300 306","M360 250 C 362 280, 360 300, 358 312"],hairDk,1.6));
    }else if(bg===3){ // 露額
      aH(strandLines(["M244 240 C 262 226, 296 220, 318 224","M226 250 C 250 232, 300 224, 350 230","M358 244 C 372 240, 384 246, 392 256"],hairDk,1.8));
    }else if(bg===4){ // 碎髮
      [[[268,236],[250,262],[236,296]],[[288,236],[280,266],[276,300]],[[306,236],[306,270],[310,304]],[[326,236],[336,266],[346,296]],[[346,238],[360,262],[372,290]],[[254,238],[232,258],[214,284]]].forEach(p=>aH(lock(p,20,3)));
    }else if(bg===5){ // 三七分
      aH(lock([[274,236],[240,262],[214,316],[206,360]],30,6));aH(lock([[280,236],[318,258],[366,300],[392,350]],48,10));aH(lock([[284,238],[330,268],[362,316]],16,4));
      aH(strandLines(["M300 244 C 336 266, 360 300, 376 334","M262 244 C 244 268, 228 300, 220 330"],hairDk,1.6));
    }else if(bg===6){ // 垂髮遮眼
      aH(lock([[296,236],[262,262],[236,316],[230,380]],34,8));aH(lock([[304,236],[334,266],[358,336],[366,400]],42,10));aH(lock([[308,240],[326,300],[338,360]],14,3));
      aH(strandLines(["M318 248 C 340 290, 352 340, 356 380"],hairDk,1.6));
    }
    // side locks in front of ears for long styles
    if(bk===0||bk===2||bk===4){aH(lock([[214,250],[196,330],[196,430],[212,540]],34,6));aH(lock([[386,250],[404,330],[404,430],[388,540]],34,6));aH(lock([[222,262],[210,340],[214,440]],12,3));aH(lock([[378,262],[390,340],[386,440]],12,3));aH(strandLines(["M206 300 C 198 360, 200 440, 208 510","M394 300 C 402 360, 400 440, 392 510"],hairDk,1.4));}
    // highlight band
    aH(`<path d="M232 210 C 262 194, 336 194, 368 210" fill="none" stroke="${hairLt}" stroke-width="7" opacity="0.75" stroke-linecap="round"/><path d="M246 222 C 270 210, 330 210, 354 222" fill="none" stroke="${hairLt}" stroke-width="3" opacity="0.6" stroke-linecap="round"/>`);
    // topknot / half-knot
    if(bk===0||bk===4){const kr=bk===0?30:22,ky=bk===0?146:156;
      aH(`<path d="M${f(300-kr*0.6)} ${f(ky+kr*0.5)} C ${f(300-kr*0.3)} ${f(ky+kr*1.05)}, ${f(300+kr*0.3)} ${f(ky+kr*1.05)}, ${f(300+kr*0.6)} ${f(ky+kr*0.5)} Z" ${hairFill} ${ink(2)}/>`);
      aH(`<ellipse cx="300" cy="${ky}" rx="${kr}" ry="${f(kr*0.78)}" ${hairFill} ${ink(2.6)}/><path d="M${f(300-kr*0.55)} ${f(ky-kr*0.15)} C ${f(300-kr*0.15)} ${f(ky-kr*0.55)}, ${f(300+kr*0.3)} ${f(ky-kr*0.5)}, ${f(300+kr*0.6)} ${f(ky-kr*0.1)}" fill="none" stroke="${hairLt}" stroke-width="2.2"/><path d="M${f(300-kr*0.7)} ${f(ky+kr*0.3)} C ${f(300-kr*0.2)} ${f(ky+kr*0.55)}, ${f(300+kr*0.3)} ${f(ky+kr*0.5)}, ${f(300+kr*0.7)} ${f(ky+kr*0.2)}" fill="none" stroke="${hairDk}" stroke-width="1.6"/>`);
      if(P.pin===1||P.pin===2){const pc=P.pin===1?'#d6e0ea':'#8fd6b0',pc2=P.pin===1?'#7f8fa3':'#3f8a63';aP(`<path d="M232 ${ky+8} L 372 ${ky-12}" stroke="${pc2}" stroke-width="5.5" stroke-linecap="round"/><path d="M232 ${ky+8} L 372 ${ky-12}" stroke="${pc}" stroke-width="3.2" stroke-linecap="round"/><path d="M372 ${ky-12} l-7 -11 l12 4z" fill="${pc}" stroke="${pc2}" stroke-width="1"/><circle cx="378" cy="${ky-16}" r="4" fill="${P.pin===1?'#7fd4f5':'#3f8a63'}" stroke="${pc2}" stroke-width="1"/>`);}
      if(P.pin===3){aP(`<path d="M${f(300-kr-6)} ${f(ky+4)} L ${f(300-kr-2)} ${f(ky-kr*0.7)} L ${f(300-kr*0.4)} ${f(ky-kr*1.05)} L 300 ${f(ky-kr*0.8)} L ${f(300+kr*0.4)} ${f(ky-kr*1.05)} L ${f(300+kr+2)} ${f(ky-kr*0.7)} L ${f(300+kr+6)} ${f(ky+4)} Z" fill="#d9b45a" ${ink(1.8)}/><circle cx="300" cy="${f(ky-kr*0.55)}" r="4" fill="#7fd4f5" stroke="${INK}" stroke-width="1"/>`);}
    }
    if(P.pin===4){aP(`<path d="M186 262 C 240 250, 360 250, 414 262" fill="none" stroke="${robe[2]}" stroke-width="9"/><path d="M186 262 C 240 250, 360 250, 414 262" fill="none" stroke="${robe[3]}" stroke-width="2"/><path d="M414 262 C 430 300, 428 350, 420 400 M414 262 C 440 290, 446 330, 442 380" fill="none" stroke="${robe[2]}" stroke-width="6" stroke-linecap="round"/>`);}
    if(P.pin===3&&!(bk===0||bk===4)){aP(`<path d="M262 190 L 268 160 L 288 176 L 300 150 L 312 176 L 332 160 L 338 190 Z" fill="#d9b45a" ${ink(1.8)}/><circle cx="300" cy="176" r="4" fill="#7fd4f5" stroke="${INK}" stroke-width="1"/>`);}
  }else{
    aH(`<ellipse cx="272" cy="215" rx="34" ry="14" fill="#ffffff" opacity="0.35" ${FL}/>`);
  }

  if(want('fx')){
  // aura wisps
  a(`<path d="M80 700 C 120 640, 100 570, 140 500" fill="none" stroke="${aura}" stroke-width="7" opacity="0.35" stroke-linecap="round" ${FL}/><path d="M520 700 C 480 640, 500 570, 460 500" fill="none" stroke="${aura}" stroke-width="7" opacity="0.35" stroke-linecap="round" ${FL}/>`);
  if(!thumb){a(`<rect x="536" y="700" width="46" height="46" fill="#b8302b" opacity="0.85" rx="2"/><text x="559" y="720" font-size="16" fill="#ffffff" text-anchor="middle" font-family="Noto Serif TC,serif" font-weight="700">問道</text><text x="559" y="740" font-size="16" fill="#ffffff" text-anchor="middle" font-family="Noto Serif TC,serif" font-weight="700">棋局</text>`);}

  }
  let svg=out.join('');svg=svg.replace(`<path id="faceClipP${u}"/>`,`<path d="${faceD}"/>`);return svg;
}
// tapered strand from a polyline (Catmull-Rom sampled)
function taperCubicFromPoly(pts,w0,w1){const n=pts.length;const samples=[];const N=6;for(let i=0;i<n-1;i++){const p0=pts[Math.max(0,i-1)],p1=pts[i],p2=pts[i+1],p3=pts[Math.min(n-1,i+2)];const c1=[p1[0]+(p2[0]-p0[0])/6,p1[1]+(p2[1]-p0[1])/6],c2=[p2[0]-(p3[0]-p1[0])/6,p2[1]-(p3[1]-p1[1])/6];for(let k=(i?1:0);k<=N;k++)samples.push(cub(p1,c1,c2,p2,k/N));}
  const M=samples.length;const up=[],dn=[];for(let i=0;i<M;i++){const t=i/(M-1);const p=samples[i];const q=samples[Math.min(M-1,i+1)],r=samples[Math.max(0,i-1)];let dx=q[0]-r[0],dy=q[1]-r[1];const l=Math.hypot(dx,dy)||1;dx/=l;dy/=l;let w=w0+(w1-w0)*t;if(t>0.82)w*=Math.max(0.08,(1-t)/0.18);if(t<0.08)w*=0.6+0.4*t/0.08;up.push([p[0]-dy*w/2,p[1]+dx*w/2]);dn.push([p[0]+dy*w/2,p[1]-dx*w/2]);}
  return 'M'+up.concat(dn.reverse()).map(p=>f(p[0])+' '+f(p[1])).join(' L ')+'Z';}

