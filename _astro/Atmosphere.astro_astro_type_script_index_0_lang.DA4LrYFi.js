function e(e){return new Worker(`/portfolio-preview/_astro/noise.worker-CHoIrZod.js`,{name:e?.name})}function t(){document.body.append(document.querySelector(`.atmosphere-controls`));let t=document.querySelector(`#cloud-volume`),n=document.querySelector(`.hero`),r=document.querySelector(`#cloud-status`),i=matchMedia(`(prefers-reduced-motion:reduce)`),a=matchMedia(`(max-width:900px)`),o=matchMedia(`(forced-colors:active)`),s=window.atmosphereMetrics={mode:`static`,frames:0,startupMs:0,cpuMs:[],gpuMs:[],intervalMs:[],quality:.5,canvas:[]},c={density:1.2,speed:1,light:1,depth:1},l=document.querySelector(`#cloud-pause`),u=null,d=null,f=null,p=null,m=null,h=!0,g=!1,_=!1,v=!1,y=0,b=0,x=0,S=0,C=0,w=null,T={},E=null,D=(e,t)=>{e.push(t),e.length>600&&e.shift()},O=()=>document.documentElement.dataset.preference===`dark`||document.documentElement.dataset.preference!==`light`&&matchMedia(`(prefers-color-scheme:dark)`).matches,k=()=>!i.matches&&!a.matches&&!o.matches&&!v;function A(){if(!u)return;let e=t.getBoundingClientRect(),n=Math.min(s.quality,Math.sqrt(35e4/Math.max(1,e.width*e.height)));t.width=Math.max(1,Math.round(e.width*n)),t.height=Math.max(1,Math.round(e.height*n)),s.canvas=[t.width,t.height],u.viewport(0,0,t.width,t.height)}function j(){cancelAnimationFrame(y),y=0,x=S=0}function M(e){v=!0,_=!1,j(),f?.terminate(),f=null,document.body.classList.remove(`volume-ready`),s.mode=`fallback`,s.error=e,r.textContent=`Static fallback: `+e}function N(e,t){let n=u.createShader(e);if(u.shaderSource(n,t),u.compileShader(n),!u.getShaderParameter(n,u.COMPILE_STATUS))throw Error(u.getShaderInfoLog(n)||`Shader compilation failed`);return n}function P(){if(!u||!d||!_)return;let e=performance.now();u.useProgram(d),u.bindVertexArray(m),u.activeTexture(u.TEXTURE0),u.bindTexture(u.TEXTURE_3D,p),w&&u.getQueryParameter(w,u.QUERY_RESULT_AVAILABLE)&&(u.getParameter(E.GPU_DISJOINT_EXT)||D(s.gpuMs,u.getQueryParameter(w,u.QUERY_RESULT)/1e6),u.deleteQuery(w),w=null);let n=!1;E&&!w&&(w=u.createQuery(),u.beginQuery(E.TIME_ELAPSED_EXT,w),n=!0),u.uniform1i(T.uNoise,0),u.uniform2f(T.uResolution,t.width,t.height),u.uniform1f(T.uTime,b),u.uniform1f(T.uDark,+!!O()),u.uniform1f(T.uDensity,c.density),u.uniform1f(T.uLight,c.light),u.uniform1f(T.uDepth,c.depth),u.uniform1i(T.uSteps,s.quality<.4?24:36),u.drawArrays(u.TRIANGLES,0,3),n&&u.endQuery(E.TIME_ELAPSED_EXT),s.frames++,D(s.cpuMs,performance.now()-e)}function F(e){if(y=0,!_||!k()||!h||document.hidden||g)return;x||=e;let t=Math.min((e-x)/1e3,.1);if(x=e,b+=t*c.speed,(!S||e-S>=32)&&(S&&D(s.intervalMs,e-S),S=e,P(),s.frames%90==0)){let e=s.gpuMs.slice(-30),t=e.length?e.reduce((e,t)=>e+t)/e.length:0,n=s.intervalMs.slice(-30).filter(e=>e>55).length>10;(t>14||n)&&s.quality>.26&&(s.quality=Math.max(.25,s.quality-.1),A())}y=requestAnimationFrame(F)}function I(){j(),k()?!u&&!f&&!v?L():_&&(document.body.classList.add(`volume-ready`),P(),s.mode=g?`paused`:!h||document.hidden?`suspended`:`animated`,r.textContent=s.mode===`animated`?`Live volumetric mist · adaptive quality · maximum 30 fps`:s.mode===`paused`?`Atmosphere paused.`:document.hidden?`Rendering suspended — browser tab is hidden.`:`Rendering suspended — Hero is outside the viewport. Scroll back to the Hero to resume.`,s.mode===`animated`&&(y=requestAnimationFrame(F))):(document.body.classList.remove(`volume-ready`),s.mode=v?`fallback`:`static`,r.textContent=v?`Static fallback: `+s.error:i.matches?`Static fallback — your reduced-motion preference is enabled.`:a.matches?`Static fallback — viewport is 900px or narrower. Animation runs on wider desktop viewports.`:`Static fallback — forced-colors accessibility mode is enabled.`)}function L(){C=performance.now(),r.textContent=`Preparing volume; original mountain fallback remains visible.`;try{if(u=t.getContext(`webgl2`,{alpha:!0,premultipliedAlpha:!0,antialias:!1,depth:!1,powerPreference:`low-power`}),!u)throw Error(`WebGL2 unavailable`);let n=N(u.VERTEX_SHADER,`#version 300 es
void main(){vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));gl_Position=vec4(p*2.-1.,0.,1.);}`),r=N(u.FRAGMENT_SHADER,`#version 300 es
// Adapted from leoawen/volumetric-clouds (MIT, Leonardo Soares Gonçalves, 2025).
// Retains dual-lobe scattering, box intersection and front-to-back absorption.
// New: orthographic mist bank, procedural density, transparent DOM composition.
precision highp float;
precision highp sampler3D;
uniform sampler3D uNoise;
uniform vec2 uResolution;
uniform float uTime,uDensity,uLight,uDepth,uDark;
uniform int uSteps;
out vec4 color;
const float PI=3.14159265359;
float HenyeyGreenstein(float g,float mu){float gg=g*g;return (1.0/(4.0*PI))*((1.0-gg)/pow(1.0+gg-2.0*g*mu,1.5));}
float PhaseFunction(float g,float costh){return mix(HenyeyGreenstein(-g,costh),HenyeyGreenstein(g,costh),0.8);}
vec2 hitBox(vec3 orig,vec3 dir){vec3 inv=1.0/dir;vec3 a=(-vec3(.5)-orig)*inv,b=(vec3(.5)-orig)*inv;vec3 lo=min(a,b),hi=max(a,b);return vec2(max(lo.x,max(lo.y,lo.z)),min(hi.x,min(hi.y,hi.z)));}
float densityAt(vec3 p){
 // Coherent horizontal advection: retain wisps through the ray depth rather
 // than averaging many unrelated noise cells into an almost static haze.
 vec3 drift=vec3(uTime*.018,0.,uTime*.002);
 vec3 q=vec3(p.x*1.65,p.y*2.3,p.z*.28)+drift;
 float large=texture(uNoise,q*.8).r;
 float detail=texture(uNoise,q*2.8+vec3(0.,uTime*.003,0.)).r;
 float n=large*.78+detail*.22;
 float band=exp(-pow((p.y+.16+sin(p.x*5.+p.z*3.)*.045)/(.06*uDepth+.025),2.));
 float edges=smoothstep(-.5,-.34,p.x)*(1.-smoothstep(.25,.5,p.x));
 return smoothstep(.35,.67,n)*band*edges*uDensity*10.;
}
void main(){
 vec2 uv=gl_FragCoord.xy/uResolution;
 vec3 origin=vec3(uv.x-.5,(uv.y-.5)*.8,1.4),dir=normalize(vec3(.001,.001,-1.));
 vec2 bounds=hitBox(origin,dir);if(bounds.x>=bounds.y){color=vec4(0.);return;}
 float ds=(bounds.y-bounds.x)/float(uSteps);
 float jitter=fract(sin(dot(gl_FragCoord.xy,vec2(12.9898,78.233)))*43758.5453);
 vec3 p=origin+(bounds.x+jitter*ds)*dir;
 float trans=1.;vec3 accumulated=vec3(0.);
 vec3 lightDir=normalize(vec3(-.5,.65,.6));
 vec3 ambient=mix(vec3(.66,.75,.70),vec3(.30,.48,.52),uDark);
 vec3 sunlight=mix(vec3(.99,.96,.82),vec3(.67,.83,.88),uDark);
 float phase=PhaseFunction(.3,dot(dir,-lightDir));
 for(int i=0;i<48;i++){
  if(i>=uSteps||trans<.015)break;
  float d=densityAt(p);
  if(d>.005){
   float shadow=exp(-(densityAt(p+lightDir*.08)+densityAt(p+lightDir*.17))*.09);
   vec3 illumination=ambient*.45+sunlight*shadow*(.45+phase*1.5)*uLight;
   float stepTrans=exp(-d*ds*1.6);
   accumulated+=trans*(1.-stepTrans)*illumination;
   trans*=stepTrans;
  }
  p+=dir*ds;
 }
 float fade=smoothstep(0.,.14,uv.y)*(1.-smoothstep(.77,1.,uv.y));
 // Premultiplied alpha: retain mountains through the gaps in the volume.
 color=vec4(accumulated*fade,(1.-trans)*fade);
}
`);if(d=u.createProgram(),u.attachShader(d,n),u.attachShader(d,r),u.linkProgram(d),u.deleteShader(n),u.deleteShader(r),!u.getProgramParameter(d,u.LINK_STATUS))throw Error(u.getProgramInfoLog(d)||`Shader link failed`);for(let e of[`uNoise`,`uResolution`,`uTime`,`uDensity`,`uLight`,`uDepth`,`uDark`,`uSteps`])T[e]=u.getUniformLocation(d,e);E=u.getExtension(`EXT_disjoint_timer_query_webgl2`),m=u.createVertexArray(),u.bindVertexArray(m),A(),f=new e,f.onerror=()=>M(`Noise worker could not initialize`),f.onmessage=({data:e})=>{if(u&&!v){p=u.createTexture(),u.bindTexture(u.TEXTURE_3D,p),u.texImage3D(u.TEXTURE_3D,0,u.R8,e.size,e.size,e.size,0,u.RED,u.UNSIGNED_BYTE,e.data);for(let e of[u.TEXTURE_WRAP_S,u.TEXTURE_WRAP_T,u.TEXTURE_WRAP_R])u.texParameteri(u.TEXTURE_3D,e,u.REPEAT);u.texParameteri(u.TEXTURE_3D,u.TEXTURE_MIN_FILTER,u.LINEAR),u.texParameteri(u.TEXTURE_3D,u.TEXTURE_MAG_FILTER,u.LINEAR),f?.terminate(),f=null,_=!0,s.startupMs=performance.now()-C,I()}}}catch(e){M(String(e))}}for(let e of[`density`,`speed`,`light`,`depth`]){let t=document.querySelector(`#cloud-`+e);t.addEventListener(`input`,()=>{c[e]=Number(t.value),t.nextElementSibling.textContent=t.value,g&&P()})}l.addEventListener(`click`,()=>{g=!g,l.setAttribute(`aria-pressed`,String(g)),l.textContent=g?`Resume atmosphere`:`Pause atmosphere`,I()}),document.querySelector(`#cloud-reset`).addEventListener(`click`,()=>{for(let e of[`density`,`speed`,`light`,`depth`]){c[e]=e===`density`?1.2:1;let t=document.querySelector(`#cloud-`+e);t.value=String(c[e]),t.nextElementSibling.textContent=t.value}P()});let R=new IntersectionObserver(([e])=>{h=e.isIntersecting,I()});R.observe(n);let z=new ResizeObserver(()=>{A(),_&&P()});z.observe(t),new MutationObserver(()=>{_&&P()}).observe(document.documentElement,{attributes:!0,attributeFilter:[`data-preference`]});for(let e of[i,a,o])e.addEventListener(`change`,I);matchMedia(`(prefers-color-scheme:dark)`).addEventListener(`change`,()=>{_&&P()}),document.addEventListener(`visibilitychange`,I),t.addEventListener(`webglcontextlost`,e=>{e.preventDefault(),M(`Graphics context lost; reload to retry.`)}),window.addEventListener(`pagehide`,()=>{j(),f?.terminate(),R.disconnect(),z.disconnect(),u&&(w&&u.deleteQuery(w),u.deleteTexture(p),u.deleteProgram(d),u.deleteVertexArray(m))},{once:!0}),I()}async function n(){let e=matchMedia(`(prefers-reduced-motion:reduce)`);if(e.matches)return;await Promise.race([document.fonts.ready,new Promise(e=>setTimeout(e,700))]);let t=document.querySelector(`#hero-title`);if(!t||scrollY>100)return;let n=t.getBoundingClientRect(),r=document.createTreeWalker(t,NodeFilter.SHOW_TEXT),i=[],a;for(;a=r.nextNode();){let e=document.createRange();e.selectNodeContents(a);for(let t of e.getClientRects())t.width>2&&!i.some(e=>Math.abs(e-t.bottom)<8)&&i.push(t.bottom)}i.sort((e,t)=>e-t);let o=[{clipPath:`inset(0 0 100% 0)`,offset:0}];i.forEach((e,t)=>o.push({clipPath:`inset(0 0 ${Math.max(0,100-(e-n.top+8)/n.height*100)}% 0)`,offset:(t+1)/i.length})),o[o.length-1].clipPath=`inset(0 0 0 0)`;let s=[t.animate(o,{duration:Math.min(1100,i.length*250),easing:`ease-out`})];for(let[e,t]of[...document.querySelectorAll(`.hero-bottom>p,.hero-actions`)].entries())s.push(t.animate([{opacity:0,transform:`translateY(6px)`},{opacity:1,transform:`none`}],{duration:450,delay:650+e*140,fill:`backwards`,easing:`ease-out`}));let c=()=>s.forEach(e=>e.cancel());window.addEventListener(`resize`,c,{once:!0}),document.addEventListener(`focusin`,c,{once:!0}),e.addEventListener(`change`,c,{once:!0})}n(),t();