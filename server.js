const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const {createRoom,addPlayer,nextRound,select,advance,snapshot}=require('./game-core');
const PORT=Number(process.env.PORT||3000);
const rooms=new Map(), sessions=new Map();
const MAX_BODY=4096;
function send(res,status,obj){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Access-Control-Allow-Origin':'same-origin'});res.end(JSON.stringify(obj));}
function fail(res,status,message){send(res,status,{error:message});}
function code(){let c;do{c=String(crypto.randomInt(100000,1000000));}while(rooms.has(c));return c;}
function auth(req){const value=req.headers.authorization||'';const token=value.startsWith('Bearer ')?value.slice(7):'';const s=sessions.get(token);if(!s)throw Object.assign(Error('다시 입장해 주세요.'),{status:401});const room=rooms.get(s.code);if(!room||!room.players.some(p=>p.id===s.id))throw Object.assign(Error('방을 찾을 수 없어요.'),{status:401});return {room,id:s.id,token};}
function restart(room){const fresh=createRoom(room.code);room.phase='lobby';room.round=0;room.questions=fresh.questions;room.doubleRounds=fresh.doubleRounds;room.deadline=0;room.history=[];room.result=null;room.players.forEach(p=>Object.assign(p,{score:0,choice:null,gain:0,wins:0,solo:0}));room.touched=Date.now();}
function cleanup(){const now=Date.now();for(const [code,room] of rooms){advance(room,now);if(now-room.touched>12*3600*1000){rooms.delete(code);for(const [token,s] of sessions)if(s.code===code)sessions.delete(token);}}}
setInterval(cleanup,30000).unref();
const server=http.createServer(async(req,res)=>{
 try{
  const url=new URL(req.url,'http://localhost');
  if(req.method==='GET'&&(url.pathname==='/'||url.pathname==='/index.html')){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'});fs.createReadStream(path.join(__dirname,'index.html')).pipe(res);return;}
  if(req.method==='GET'&&url.pathname==='/health'){send(res,200,{ok:true});return;}
  if(!url.pathname.startsWith('/api/')){fail(res,404,'페이지를 찾을 수 없어요.');return;}
  const action=url.pathname.slice(5);
  if(req.method!=='POST'&&!(req.method==='GET'&&action==='state')){fail(res,405,'허용되지 않은 요청입니다.');return;}
  let body={};
  if(req.method==='POST'){
   let raw='';for await(const chunk of req){raw+=chunk;if(raw.length>MAX_BODY)throw Object.assign(Error('요청이 너무 큽니다.'),{status:413});}
   try{body=raw?JSON.parse(raw):{};}catch{throw Object.assign(Error('요청 형식이 올바르지 않아요.'),{status:400});}
  }
  if(action==='create'||action==='join'){
   const id=crypto.randomUUID(),token=crypto.randomBytes(32).toString('hex');
   let room;
   if(action==='create'){room=createRoom(code());rooms.set(room.code,room);}
   else {room=rooms.get(String(body.code||''));if(!room)throw Error('방 코드를 다시 확인해 주세요.');}
   try{addPlayer(room,body.name,id);}catch(e){if(action==='create')rooms.delete(room.code);throw e;}
   sessions.set(token,{code:room.code,id});send(res,200,{token,state:snapshot(room,id)});return;
  }
  if(!['state','next','choose','restart','leave'].includes(action)){fail(res,404,'요청을 찾을 수 없어요.');return;}
  const {room,id,token}=auth(req),now=Date.now();
  advance(room,now);
  const player=room.players.find(p=>p.id===id);player.lastSeen=now;
  if(action==='next'){if(room.host!==id)throw Error('방장만 시작할 수 있어요.');nextRound(room,now);}
  if(action==='choose')select(room,id,body.choice,body.round,now);
  if(action==='restart'){if(room.host!==id||room.phase!=='finished')throw Error('방장만 종료된 게임을 다시 시작할 수 있어요.');restart(room);}
  if(action==='leave'){
   if(room.phase!=='lobby'&&room.phase!=='finished')throw Error('게임 중에는 나갈 수 없어요.');
   room.players=room.players.filter(p=>p.id!==id);sessions.delete(token);
   if(room.host===id)room.host=room.players[0]?.id||null;
   if(!room.players.length)rooms.delete(room.code);
   send(res,200,{ok:true});return;
  }
  room.touched=now;send(res,200,snapshot(room,id,now));
 }catch(e){fail(res,e.status||400,e.message||'요청을 처리할 수 없어요.');}
});
if(require.main===module)server.listen(PORT,'0.0.0.0',()=>console.log(`MINORITY CLUB listening on ${PORT}`));
module.exports={server,rooms,sessions};
