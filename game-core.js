const QUESTIONS = [
 ['WORK LIFE','평생 하나를 포기해야 한다면?','실행 취소 없이 살기','복사·붙여넣기 없이 살기','↶','⌘'],
 ['OFFICE SURVIVAL','오늘의 업무를 고른다면?','회의 3시간','회의록 작성 3시간','◉','✎'],
 ['SOCIAL BATTERY','조금 더 버틸 만한 상황은?','팀장님과 단둘이 점심','팀 전체 앞에서 5분 발표','☕','♬'],
 ['DEADLINE','어떤 프로젝트를 맡겠어요?','완벽한 기획서 + 내일 마감','애매한 기획서 + 한 달 뒤 마감','⚡','☁'],
 ['LIFE BALANCE','한 달 동안 이렇게 살아야 한다면?','출근 1시간 빠르게, 퇴근도 빠르게','출근 1시간 늦게, 퇴근도 늦게','☀','☾'],
 ['SMALL HAPPINESS','딱 하나, 무제한 이용권!','평생 무료 커피','평생 무료 택시','☕','➜'],
 ['DESIGN DILEMMA','내 작업 화면에 생긴 문제는?','모든 폰트가 굴림체','모든 모서리가 둥근 모양','Aa','▢'],
 ['SUPER POWER','회사에서만 쓸 수 있는 초능력!','다른 사람의 속마음 읽기','내 일을 2배 빠르게 끝내기','◎','ϟ'],
 ['WEEKEND','이번 주말을 보낼 장소는?','완벽한 숙소에서 아무것도 안 하기','낯선 도시를 하루 종일 걷기','⌂','↗'],
 ['OFFICE SURVIVAL','하나를 매일 겪어야 한다면?','저장할 때마다 10초 기다리기','매일 비밀번호 바꾸기','▣','✳'],
 ['FOOD FIGHT','지금 당장 하나만 먹는다면?','바삭한 감자튀김','따끈한 떡볶이','♨','♥'],
 ['TIME MACHINE','시간을 움직일 수 있다면?','어제로 돌아가기','내일을 미리 보기','↶','↗'],
 ['DESIGN DILEMMA','피드백을 받는다면 어느 쪽?','구체적인 수정 요청 20개','“뭔가 아쉬운데요” 한마디','✎','…'],
 ['SOCIAL BATTERY','오늘 저녁의 선택은?','즉흥 약속에 나가기','집에서 혼자 충전하기','✦','☾'],
 ['WORK LIFE','업무 중 하나만 쓸 수 있다면?','키보드만 사용하기','마우스만 사용하기','⌘','↖'],
 ['MONEY TALKS','선물로 받고 싶은 건?','확실한 10만 원','50% 확률로 25만 원','₩','?'],
 ['SMALL HAPPINESS','출근길에 얻고 싶은 행운은?','모든 신호가 초록불','대중교통에 항상 빈자리','●','▤'],
 ['DIGITAL LIFE','휴대폰에 하나만 남긴다면?','카메라','음악 스트리밍','◎','♫'],
 ['WORK LIFE','사무실에 생겼으면 하는 공간은?','낮잠 잘 수 있는 방','무료 디저트 카페','☾','☕'],
 ['FOOD FIGHT','평생 한 가지 온도로 마신다면?','차가운 음료만','따뜻한 음료만','❄','♨'],
 ['SUPER POWER','딱 하나, 일상의 치트키!','절대 길을 잃지 않기','절대 물건을 잃지 않기','➜','◇'],
 ['WEEKEND','갑자기 생긴 하루 휴가!','계획 없이 바로 여행','알람 끄고 늦잠','↗','☾'],
 ['DESIGN DILEMMA','나의 작업 환경을 바꾼다면?','엄청 큰 모니터 하나','작은 모니터 세 개','▰','▥'],
 ['SOCIAL BATTERY','단체 게임에서 나의 전략은?','아무 말도 하지 않기','일부러 반대로 말하기','…','↔'],
 ['OFFICE SURVIVAL','더 감당할 만한 실수는?','화상회의에서 마이크 켜고 혼잣말','단체 채팅방에 엉뚱한 이모티콘','♫','☺'],
 ['LIFE BALANCE','일주일의 날씨를 고른다면?','매일 조금씩 비','하루만 엄청난 폭우','☂','ϟ'],
 ['SMALL HAPPINESS','공짜 티켓이 생겼어요!','좋아하는 가수 콘서트','최고급 호텔 숙박','♫','⌂'],
 ['TIME MACHINE','업무에서 가능한 마법은?','회의 시간을 절반으로','출퇴근 시간을 절반으로','◷','➜'],
 ['DIGITAL LIFE','평생 하나의 모드만 쓴다면?','라이트 모드','다크 모드','☀','☾'],
 ['FINAL CHOICE','이 문장을 본 사람들은 어디로 갈까?','왠지 여기가 소수일 것 같아','그렇게 생각할 줄 알았어','↙','↘']
];
function shuffledQuestions(random=Math.random){return QUESTIONS.map(q=>({q,r:random()})).sort((a,b)=>a.r-b.r).slice(0,10).map(x=>x.q);}
function scoreChoices(players,round,isDouble=false){
 const a=players.filter(p=>p.choice==='A').length,b=players.filter(p=>p.choice==='B').length;
 const winner=a>0&&b>0&&a!==b?(a<b?'A':'B'):null;
 const n=winner==='A'?a:b; const points=winner?(n===1?200:100)*(isDouble?2:1):0;
 return {a,b,winner,points,missing:players.length-a-b};
}
function createRoom(code,now=Date.now()){return {code,phase:'lobby',round:0,players:[],questions:shuffledQuestions(),deadline:0,created:now,touched:now,host:null,history:[],doubleRounds:[...new Set([10,2+Math.floor(Math.random()*3),5+Math.floor(Math.random()*4)])]};}
function addPlayer(room,name,id,now=Date.now()){
 if(room.phase!=='lobby')throw Error('이미 시작한 게임이에요. 다음 게임에 참여해 주세요.');
 if(room.players.length>=14)throw Error('14명이 모두 입장했어요.');
 name=String(name||'').trim().slice(0,12);
 if(!name)throw Error('닉네임을 입력해 주세요.');
 if(room.players.some(p=>p.name===name))throw Error('같은 닉네임이 있어요. 다른 이름을 골라 주세요.');
 const p={id,name,score:0,choice:null,gain:0,wins:0,solo:0,lastSeen:now};room.players.push(p);room.host??=id;room.touched=now;return p;
}
function nextRound(room,now=Date.now()){
 if(!['lobby','result'].includes(room.phase))throw Error('아직 라운드가 진행 중이에요.');
 if(room.players.length<2)throw Error('2명 이상 모이면 시작할 수 있어요.');
 if(room.round>=10)throw Error('게임이 끝났어요.');
 room.round++;room.phase='countdown';room.deadline=now+3000;room.players.forEach(p=>{p.choice=null;p.gain=0});room.touched=now;
}
function select(room,id,choice,round,now=Date.now()){
 advance(room,now);
 if(room.phase!=='choosing'||room.round!==round)throw Error('선택 시간이 끝났어요.');
 const p=room.players.find(p=>p.id===id);
 if(!p)throw Error('입장 정보를 찾을 수 없어요.');
 if(!['A','B'].includes(choice))throw Error('A 또는 B를 골라 주세요.');
 if(p.choice)throw Error('이미 선택했어요. 결과를 기다려 주세요.');
 p.choice=choice;room.touched=now;
}
function advance(room,now=Date.now()){
 if(room.phase==='countdown'&&now>=room.deadline){room.phase='choosing';room.deadline+=10000;}
 if(room.phase==='choosing'&&now>=room.deadline){
  const result=scoreChoices(room.players,room.round,room.doubleRounds.includes(room.round));room.result=result;
  room.players.forEach(p=>{p.gain=p.choice===result.winner?result.points:0;p.score+=p.gain;if(p.gain){p.wins++;if(result.points/(room.doubleRounds.includes(room.round)?2:1)===200)p.solo++;}});
  room.history.push({...result,round:room.round});room.phase='reveal';room.deadline+=2600;
 }
 if(room.phase==='reveal'&&now>=room.deadline){room.phase=room.round===10?'finished':'result';room.deadline=0;}
}
function snapshot(room,id,now=Date.now()){
 advance(room,now);const visible=['result','finished'].includes(room.phase);
 return {code:room.code,phase:room.phase,round:room.round,isDouble:room.doubleRounds.includes(room.round),deadline:room.deadline,serverNow:now,host:room.host===id,hostName:room.players.find(p=>p.id===room.host)?.name,question:room.round?room.questions[room.round-1]:null,answered:room.players.filter(p=>p.choice).length,result:visible?room.result:null,history:visible?room.history:[],players:room.players.map(p=>({id:p.id===id?'me':String(room.players.indexOf(p)),name:p.name,score:visible||room.phase==='lobby'?p.score:p.score-p.gain,choice:visible||p.id===id?p.choice:null,gain:visible?p.gain:0,wins:visible?p.wins:0,solo:visible?p.solo:0,online:now-p.lastSeen<15000,me:p.id===id}))};
}


module.exports={createRoom,addPlayer,nextRound,select,advance,snapshot};
