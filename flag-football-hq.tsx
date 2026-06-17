import { useState, useEffect } from "react";

// ════════════════════════════════════════════════════════════════════════════
// STORAGE
// ════════════════════════════════════════════════════════════════════════════
const store = {
  async get(key) {
    try { const r = await window.storage.get(key); return r ? JSON.parse(r.value) : null; }
    catch { return null; }
  },
  async set(key, val) { try { await window.storage.set(key, JSON.stringify(val)); } catch {} }
};

// ════════════════════════════════════════════════════════════════════════════
// COLOURS
// ════════════════════════════════════════════════════════════════════════════
const C = {
  bg:"#1a3a2a", card:"#1f4434", darker:"#152e20",
  chalk:"#f0ede6", muted:"#b8cfc7", border:"rgba(240,237,230,0.1)",
  gold:"#e8b84b", green:"#6bbfa0", sky:"#7eb8c9", red:"#e8705f", purple:"#b084cc",
  a1:"#e8b84b", a2:"#6bbfa0",
};
const phaseColor = p => p===1?C.sky:p===2?C.gold:C.red;
const phaseBg = p => p===1?"rgba(126,184,201,0.1)":p===2?"rgba(232,184,75,0.1)":"rgba(232,112,95,0.1)";

// ════════════════════════════════════════════════════════════════════════════
// SHARED UI
// ════════════════════════════════════════════════════════════════════════════
const Card = ({children, style={}}) => (
  <div style={{background:C.card, border:`1px solid ${C.border}`, borderRadius:8, overflow:"hidden", ...style}}>{children}</div>
);
const CardHead = ({children, accent=C.gold, style={}}) => (
  <div style={{background:"rgba(0,0,0,0.22)", borderBottom:`1px solid ${C.border}`, padding:"10px 16px", display:"flex", alignItems:"center", gap:8, ...style}}>{children}</div>
);
const Label = ({children, color=C.muted}) => (
  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.14em", textTransform:"uppercase", color}}>{children}</span>
);
const Btn = ({children, onClick, active=false, color=C.gold, style={}}) => (
  <button onClick={onClick} style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, letterSpacing:"0.1em", textTransform:"uppercase", padding:"5px 14px", borderRadius:4, border:`1px solid ${color}55`, background:active?`${color}22`:"transparent", color:active?color:C.muted, cursor:"pointer", ...style}}>{children}</button>
);
const Input = ({value, onChange, type="text", style={}, placeholder=""}) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} style={{background:"rgba(0,0,0,0.25)", border:`1px solid ${C.border}`, borderRadius:4, padding:"6px 10px", color:C.chalk, fontSize:13, fontFamily:"'Barlow',sans-serif", outline:"none", width:"100%", ...style}}/>
);
const Pill = ({label, color}) => (
  <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, fontWeight:700, letterSpacing:"0.1em", textTransform:"uppercase", padding:"2px 8px", borderRadius:3, background:`${color}20`, color, border:`1px solid ${color}44`}}>{label}</span>
);

// ════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ════════════════════════════════════════════════════════════════════════════
const ATHLETES = ["Athlete 1", "Athlete 2"];
const WEEKS = [1,2,3,4,5,6];
const METRICS = [
  { key:"dash40", label:"40-Yard Dash", unit:"sec", lower:true, desc:"Lower is better." },
  { key:"shuttle", label:"5-10-5 Shuttle", unit:"sec", lower:true, desc:"Lateral quickness. Lower is better." },
  { key:"broad", label:"Broad Jump", unit:"cm", lower:false, desc:"Higher is better." },
];
const SORENESS = ["None","Mild","Moderate","High","Very High"];
const ENERGY = ["Exhausted","Low","Normal","Good","Great"];

// Schedule data (condensed — drill + cues per session block)
const SCHEDULE = [
  { week:1, phase:1, title:"Movement Foundation", sessions:[
    { day:"Day 1", focus:"Speed Mechanics + Route Intro", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Dynamic warmup: leg swings, hip circles, high knees, A-skip, B-skip, carioca — 2×20 yds"]},
      { label:"Speed Mechanics", time:"10–25 min", items:["Wall drive hold — 3×10 sec each leg (knee up, ankle dorsiflexed)","Acceleration starts — 3×10 yds from 3-point stance","Falling starts — 3×15 yds (lean until forced to step)"]},
      { label:"Route Running", time:"25–50 min", items:["5-yd out — sharp plant, snap head, 10 reps each side","5-yd curl — sell vertical, snap back, 10 reps each side","Slant from LOS — quick release, catch at speed, 10 reps"]},
      { label:"Cooldown", time:"50–60 min", items:["Static stretch: hip flexor, quad, hamstring — 60 sec each"]},
    ]},
    { day:"Day 2", focus:"Agility + Flag Pull", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Lateral shuffle, backpedal, break-on-ball. Banded clamshells + lateral walks"]},
      { label:"Agility", time:"10–28 min", items:["Ladder: 2-in, ickey shuffle, lateral in/out — 3 sets each","5-10-5 shuttle — 4 reps, low hips at turns","Cone T-drill — 3 reps, first-step quickness"]},
      { label:"Flag Pull", time:"28–50 min", items:["Stationary flag pull — low angle, hands below belt, 10 reps each","Flag pull on jogging carrier — 10 reps","Breakdown drill — controlled decel into pull, 8 reps"]},
      { label:"Cooldown", time:"50–60 min", items:["Foam roll: IT band, quads, calves — 60 sec per area"]},
    ]},
    { day:"Day 3", focus:"Catching + Hands (Gym)", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Shoulder circles, band pull-aparts, wrist mobility, warm-up catches"]},
      { label:"Hands", time:"10–30 min", items:["High/low ball adjustment — 10 reps each zone","Tennis ball drops — reaction + soft hands","Over-the-shoulder catch — 10 reps each side","One-handed drills — alternate hands"]},
      { label:"Strength", time:"30–52 min", items:["Band hip drive walks — 3×12 each direction","Single-leg RDL — 3×8 each leg","Lateral box step-up — 3×10 each side","Dead bug 3×10 + plank 3×30 sec"]},
    ]},
  ]},
  { week:2, phase:1, title:"Mechanical Refinement", sessions:[
    { day:"Day 1", focus:"Releases + Route Tree", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Full dynamic warmup + resistance band hip activation"]},
      { label:"Releases off LOS", time:"10–28 min", items:["Inside release — shoulder dip, flatten, accelerate, 8 reps","Outside release — speed turn, push off jam, 8 reps","Swim move — 6 reps each arm","Rip move — low, violent, 6 reps each arm"]},
      { label:"Route Tree", time:"28–52 min", items:["Dig route (8 yds) — sharp inside break","Corner route — break to back pylon","Post route — eyes find middle of field","No-huddle: slant + out back-to-back"]},
    ]},
    { day:"Day 2", focus:"DB Coverage Mechanics", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Backpedal technique + hip flip drill: pedal, trigger, open, run"]},
      { label:"Coverage Footwork", time:"10–30 min", items:["Pedal to break on comeback — 8 reps","Pedal and weave — mirror cone pattern","Zone drop — read QB eyes, drive on throw","Man shadow drill — read hips not shoulders"]},
      { label:"Flag Pull Under Pressure", time:"30–52 min", items:["Flag pull after 5-yd pursuit — 8 reps","Two-on-one flag defense — communicate, 6 reps","Contest catch + pull — 8 reps"]},
    ]},
    { day:"Day 3", focus:"Speed + Power (Gym)", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Jump rope 3 min + dynamic lunge matrix"]},
      { label:"Plyometrics", time:"10–28 min", items:["Broad jumps — 3×5, land soft","Lateral hurdle hops — 3×6 each side","Box jump to decel — 3×5, stick 2 sec","Sprint to decel — 4×15 yds"]},
      { label:"Strength", time:"28–52 min", items:["Goblet squat — 3×10, knees out, full depth","Hip thrust w/ band — 3×12, full extension","Half-kneeling cable chop — 3×10 each side","Pallof press — 3×12 each side"]},
    ]},
  ]},
  { week:3, phase:2, title:"Intensity Ramp", sessions:[
    { day:"Day 1", focus:"Competitive Routes + 1-on-1s", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Dynamic warmup + 3×30 yd stride build-ups (70/85/95%)"]},
      { label:"Routes vs. Air", time:"10–25 min", items:["Full route tree at 85% — execution first","No-huddle routes — QB calls verbally","Timing routes — thrown on time not sight"]},
      { label:"1-on-1 WR vs. DB", time:"25–52 min", items:["Sisters compete live — 4 routes per set, switch roles","Fade vs. press — both compete for ball","Debrief each rep: release, leverage, flag technique"]},
    ]},
    { day:"Day 2", focus:"RB Skills + Broken Field", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Hip mobility series + band activations"]},
      { label:"Ball Carrier", time:"10–28 min", items:["Flag protection posture — low hips, arms out","Juke move through cone gate — 10 reps each","Jump cut — plant hard, cut inside, 8 reps each","Spin technique — last resort, practice exit angle"]},
      { label:"Broken Field", time:"28–52 min", items:["Box drill — 5×5, one defender, 10 sec to survive","Alley run — cone gauntlet, flag defenders at exit","Screen + run after catch — one cut and go"]},
    ]},
    { day:"Day 3", focus:"Power + COD (Gym)", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Med ball slam series + 2 min jump rope"]},
      { label:"Reactive Agility", time:"10–28 min", items:["Mirror drill — partner-driven, 5 sec ×6","Reactive cone — break on coach's point, 8 reps","Resisted sprint — band, release and finish"]},
      { label:"Strength", time:"28–52 min", items:["Bulgarian split squat — 3×8 each","Romanian deadlift — 3×8, hinge","Med ball lateral throw — 3×8 each side","Band sprint arm drive — 3×15 sec"]},
    ]},
  ]},
  { week:4, phase:2, title:"Full Speed Execution", sessions:[
    { day:"Day 1", focus:"Route Combos + Stack Concepts", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Dynamic warmup + 4×20 yd accelerations to 95%"]},
      { label:"Route Combos", time:"10–30 min", items:["Hi-lo: deep post + shallow cross","Stack release — different directions on snap","Motion into route — reset, run on snap","Mesh — both cross at 4 yds opposite"]},
      { label:"Live vs. DB", time:"30–52 min", items:["Combos at full speed — QB hits open WR","Scoring: 3 catches WR wins / 3 flags DB wins"]},
    ]},
    { day:"Day 2", focus:"Speed + Sprint Mechanics", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Sprint prep: leg swings, skips, build-ups 60/80/90%"]},
      { label:"Speed Development", time:"10–35 min", items:["Flying 10s — 5 reps","Wicket runs — 8 hurdles, maintain frequency","Resisted + assisted sprint — 3+3","10-yd dash from 3 stances — 3 reps each"]},
      { label:"Flag-Speed Combo", time:"35–52 min", items:["40-yd route full speed — catch + protect flags","DB pursuit — WR 3-yd head start, close and pull","Open-field 1-on-1 — 30 yds, live flag"]},
    ]},
    { day:"Day 3", focus:"Strength Peak + Hands (Gym)", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Med ball overhead + rotational throw, band activation"]},
      { label:"Strength — Peak Load", time:"10–35 min", items:["Trap bar deadlift — 3×6 (peak week)","Jump squat — 3×5 light, max intent","Single-leg bounding — 3×6 each","Cable pull-through — 3×12"]},
      { label:"Concentration Catches", time:"35–52 min", items:["Back-shoulder catch — reach back, secure","Contested catch — secure through contact","Sideline awareness — feet in bounds"]},
    ]},
  ]},
  { week:5, phase:3, title:"Game Simulation", sessions:[
    { day:"Day 1", focus:"Red Zone Scenarios", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Dynamic warmup + walk through 3 red zone alignments"]},
      { label:"Red Zone Routes", time:"10–30 min", items:["Back-corner fade — win outside vs. press","Quick slant — tight window, secure fast","Back-of-end-zone comeback — sit at back line","Speed out at goal line — turn and score"]},
      { label:"Live Red Zone 1-on-1", time:"30–52 min", items:["From 10-yd line — 4 routes live","Role rotation — full set each as WR then DB"]},
    ]},
    { day:"Day 2", focus:"Pressure + Special Plays", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Full warmup + 3 competitive 20-yd sprints"]},
      { label:"High-Pressure Reps", time:"10–30 min", items:["2-minute drill — 4 plays, clock running","4th down — one shot, both know it's coming","Pick play — legal rub, exact timing"]},
      { label:"Special Situations", time:"30–52 min", items:["Lateral after catch — DB pursues","Deep shot underthrown — adjust back to ball","Scramble drill — break off route, find space"]},
    ]},
    { day:"Day 3", focus:"Speed Maintenance + Recovery (Gym)", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Light activation — band walks, leg swings"]},
      { label:"Speed Maintenance", time:"10–28 min", items:["Flying 20s — 3 reps, maintain top speed","Ladder — 10 min coordination","Mirror drill light — 4×5 sec"]},
      { label:"Reduced Strength", time:"28–48 min", items:["Hip thrust — 2×10 maintain pattern","Step-up to balance — 2×8 each","Band lateral walks — 2×15 each"]},
      { label:"Recovery", time:"48–60 min", items:["Full stretch 10 min + visualization"]},
    ]},
  ]},
  { week:6, phase:3, title:"Competition-Ready", sessions:[
    { day:"Day 1", focus:"Full Route Tree at Game Speed", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Competition-level warmup, build to 90%"]},
      { label:"Route Tree Review", time:"10–30 min", items:["All 9 routes game speed — 2 each, one per side","QB reads: hot route, look-off, second read"]},
      { label:"Culminating 1-on-1", time:"30–52 min", items:["Best-of-10 — winner calls next route","Track score: catches vs. flags — season benchmark"]},
      { label:"Cooldown", time:"52–60 min", items:["Stretch + written self-assessment"]},
    ]},
    { day:"Day 2", focus:"Situational Mastery", blocks:[
      { label:"Warmup", time:"0–10 min", items:["Dynamic warmup + visualization between sets"]},
      { label:"Situational Football", time:"10–35 min", items:["1st and long — YAC routes","3rd and short — quick game","Protect the lead (DB) — attack cushion","Must-score drive — pick concept, win vs. press"]},
      { label:"Live Scenario", time:"35–52 min", items:["Coach calls down-and-distance — pick the route","Flag pull under fatigue — close and pull","Final rep: open-field 1-on-1, just compete"]},
    ]},
    { day:"Day 3", focus:"Final Eval + Recovery (Gym)", blocks:[
      { label:"Assessment", time:"0–20 min", items:["40-yard dash — timed vs. Week 1","5-10-5 shuttle — timed","Broad jump — vs. Week 2 baseline"]},
      { label:"Light Strength", time:"20–40 min", items:["Goblet squat — 2×10 light","Band hip thrust — 2×15","Core circuit: dead bug, bird dog, plank ×2"]},
      { label:"Recovery + Goals", time:"40–60 min", items:["15-min full body stretch","Set 3 goals for the competitive season"]},
    ]},
  ]},
];

const RECOVERY = {
  weekly:[
    ["Mon","Training","Massage gun quads/hams 5 min, foam roll IT band + calves, 10-min stretch",C.sky],
    ["Tue","Active Recovery","Easy walk/bike 10-15 min. Foam roll full lower body. Hip + glute holds 60s",C.green],
    ["Wed","Training","Massage gun on sore spots, 10-min full stretch protocol",C.sky],
    ["Thu","Active Recovery","Optional yoga/mobility 20 min. Foam roll t-spine, hips, calves. Sleep emphasis",C.green],
    ["Fri","Training","Full routine: massage gun, foam roll, stretch. Hydration focus",C.sky],
    ["Sat","Physio / Recovery","Ideal physio day. Else: full foam roll, 20-min stretch, massage gun problem areas",C.purple],
    ["Sun","Full Rest","No structured activity. Sleep, low stress, mental rest",C.muted],
  ],
  foam:[
    ["IT band","60 sec each side","Flag athletes cut hard laterally — IT band takes constant loading"],
    ["Quad + hip flexor","45 sec each","Sprint mechanics pull hard on hip flexors — most important area"],
    ["Calves + Achilles","30 sec each","Route breaks + acceleration load posterior chain to ankle"],
    ["Thoracic spine","30 sec","Decompress after overhead/rotational gym work"],
  ],
  stretch:[
    ["Hip flexor kneeling","60 sec each","HIGHEST — most important for young sprinters/route runners"],
    ["Pigeon / figure-4","60 sec each","HIGH — essential for lateral cut mechanics"],
    ["Standing hamstring","45 sec each","HIGH — loaded by all sprinting + hinge movement"],
    ["Cross-body shoulder","30 sec each","MEDIUM — after catching/upper body work"],
    ["Supine spinal rotation","30 sec each","MEDIUM — decompress after loaded gym work"],
    ["Deep squat hold","60 sec","MEDIUM — ankle + hip mobility"],
  ],
  physio:[
    ["Week 1","Baseline Assessment","Screen hip mobility, hamstring flexibility, ankle dorsiflexion, asymmetries"],
    ["Weeks 2–3","Maintenance Check","Flag new tightness — knee pain on stairs, shin tightness, hip flexor"],
    ["Week 4","Mid-Block Check","Phase 2 intensity peaks — confirm no overuse in knees/ankles/hips"],
    ["Week 6","End / Clearance","Address accumulated issues, get take-home exercises for season"],
  ],
  sleep:[
    ["Target","9–10 hrs","Growth hormone releases during deep sleep — when adaptation happens"],
    ["Consistency","Same bedtime nightly","More effective than weekend catch-up"],
    ["Screens","Off 30 min before bed","Blue light disrupts melatonin + recovery"],
    ["Warning sign","Fatigue after 2+ good nights","Check training volume or nutrition gaps"],
  ],
};

const NUTRITION = {
  timing:[
    ["Pre-Session Meal","90–120 min before","Carbs + moderate protein, low fat/fibre","Rice + chicken, oatmeal + eggs, banana + PB toast"],
    ["Pre-Session Snack","30–45 min before","Simple carbs + small protein","Banana + yogurt, apple + cheese, granola bar"],
    ["During Session","Every 15–20 min","Water 150–250 mL","Electrolyte drink if >75 min or high heat"],
    ["Post-Session","Within 30 min","Protein + fast carbs","Chocolate milk + banana, protein shake + fruit"],
    ["Recovery Meal","1.5–2 hrs after","Protein + complex carbs + veg","Salmon + rice + broccoli, chicken stir-fry"],
  ],
  trainDay:[
    ["7:00 AM","Breakfast","2-3 eggs, oats w/ banana + honey, milk or OJ"],
    ["10:30 AM","Pre-Session Snack","Apple + Greek yogurt or granola bar + water"],
    ["12:30 PM","Post-Session Snack","Chocolate milk + banana within 30 min"],
    ["2:00 PM","Lunch","Chicken rice bowl + veg, or pasta + turkey + salad"],
    ["4:30 PM","Afternoon Snack","Cheese + crackers, hummus + veggies, trail mix"],
    ["6:30 PM","Dinner","Salmon/chicken + sweet potato + greens"],
  ],
  recoveryDay:[
    ["Breakfast","Omelet + toast, or protein smoothie w/ spinach + berries"],
    ["Snack","Blueberries/cherries + almonds. Tart cherry juice."],
    ["Lunch","Tuna/salmon wrap + avocado, or lentil soup + salad"],
    ["Snack","Fruit + yogurt, or rice cake + nut butter (carb-load if training tomorrow)"],
    ["Dinner","Pasta + lean protein + tomato sauce, or rice bowl + beef + veg"],
  ],
  keyFoods:[
    ["Protein","1.4–1.7 g/kg/day","Eggs, chicken, beef, salmon, tuna, Greek yogurt, milk, legumes"],
    ["Complex Carbs","Half the plate","Rice, oats, sweet potato, pasta, whole grain, quinoa"],
    ["Anti-Inflammatory","Daily","Blueberries, tart cherry, salmon, walnuts, leafy greens"],
    ["Calcium + Vit D","Growth phase","Dairy, fortified milks, leafy greens, salmon"],
    ["Iron","Higher for females","Red meat, spinach, lentils, fortified cereals"],
    ["Hydration","2-2.5 L + 500-750 mL/hr training","Water first; electrolytes for long/hot sessions"],
  ],
  supplements:[
    ["Vitamin D3","YES — Canada",C.green,"Most Canadians deficient. Confirm dose with doctor."],
    ["Iron","Only if bloodwork confirms",C.red,"Persistent unexplained fatigue = test first."],
    ["Protein powder","Convenience only",C.gold,"Chocolate milk does the same job, cheaper."],
  ],
};

const GROCERY = [
  { cat:"Protein", color:C.a1, items:[
    ["Chicken breast","1.5 kg","Meal prep Sunday"],["Salmon fillets","500 g","2× per week"],
    ["Ground beef/turkey","500 g","Pasta sauce, stir-fry"],["Eggs","2 dozen","Breakfast + snack"],
    ["Greek yogurt","2 tubs","Post-session recovery"],["Cottage cheese","500 g","High-protein snack"],
    ["Tuna (canned)","4 cans","Easy lunch protein"],["Milk (2%)","2 L","Chocolate milk base"],
    ["Chocolate milk","1 L","Best post-session drink"],
  ]},
  { cat:"Carbohydrates", color:C.sky, items:[
    ["White rice","2 kg","Primary carb"],["Rolled oats","1 kg","Breakfast"],
    ["Whole grain bread","1 loaf","Snacks + breakfast"],["Sweet potatoes","6–8","Recovery meals"],
    ["Pasta","1 kg","Pre/post training"],["Quinoa","500 g","Recovery combo"],
    ["Bananas","2 bunches","Pre + post snack"],["Granola bars","1 box","Quick snack"],
    ["Rice cakes","1 pack","Light snack"],
  ]},
  { cat:"Fruits & Vegetables", color:C.green, items:[
    ["Blueberries","2 pints","Anti-inflammatory daily"],["Frozen berries","1 bag","Smoothies"],
    ["Spinach/greens","2 bags","Salads, smoothies"],["Broccoli","2 heads","Recovery meals"],
    ["Apples","6–8","Snack w/ nut butter"],["Avocados","4","Healthy fat"],
    ["Lemons/limes","4","Electrolyte water"],["Cherry tomatoes","1 pint","Snacks, salads"],
    ["Tart cherry juice","1 bottle","Muscle recovery"],
  ]},
  { cat:"Fats & Extras", color:C.purple, items:[
    ["Nut butter","1 jar","Snacks, smoothies"],["Walnuts/almonds","500 g","Anti-inflammatory"],
    ["Olive oil","1 bottle","Cooking"],["Cheese","250 g","Snack protein"],
    ["Hummus","1–2","Snack w/ veggies"],["Honey","1 jar","Oats, energy"],
  ]},
  { cat:"Hydration & Supplements", color:C.red, items:[
    ["Electrolyte mix","1 tube","Hot weather sessions"],["Vitamin D3 (1000 IU)","1 bottle","Confirm w/ doctor"],
    ["Protein powder","1 tub","Optional — food first"],
  ]},
];

// ════════════════════════════════════════════════════════════════════════════
// REFERENCE TABS
// ════════════════════════════════════════════════════════════════════════════
function ScheduleTab() {
  const [openWeek, setOpenWeek] = useState(1);
  const [openSession, setOpenSession] = useState(null);
  return (
    <div>
      <div style={{display:"flex", margin:"0 0 16px", borderRadius:6, overflow:"hidden", border:`1px solid ${C.border}`}}>
        {[[1,"Wks 1-2","Foundation"],[2,"Wks 3-4","Development"],[3,"Wks 5-6","Competition"]].map(([p,w,t])=>(
          <div key={p} style={{flex:1, padding:"10px 12px", background:phaseBg(p), borderRight:p<3?`1px solid ${C.border}`:"none"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:9, letterSpacing:"0.12em", textTransform:"uppercase", color:phaseColor(p)}}>Phase {p}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:13, color:C.chalk}}>{w}</div>
            <div style={{fontSize:10.5, color:C.muted}}>{t}</div>
          </div>
        ))}
      </div>
      {SCHEDULE.map(w=>{
        const col=phaseColor(w.phase), open=openWeek===w.week;
        return (
          <div key={w.week} style={{marginBottom:12}}>
            <button onClick={()=>setOpenWeek(open?null:w.week)} style={{width:"100%", display:"flex", alignItems:"center", gap:10, padding:"12px 16px", background:phaseBg(w.phase), border:`1px solid ${col}33`, borderRadius:8, cursor:"pointer", textAlign:"left"}}>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.12em", textTransform:"uppercase", color:C.muted}}>Week {w.week}</span>
              <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:17, textTransform:"uppercase", color:col}}>{w.title}</span>
              <div style={{flex:1}}/>
              <span style={{fontSize:18, color:col}}>{open?"−":"+"}</span>
            </button>
            {open && <div style={{padding:"12px 0 0"}}>
              {w.sessions.map((s,si)=>{
                const sk=`${w.week}-${si}`, so=openSession===sk;
                return (
                  <Card key={si} style={{marginBottom:8}}>
                    <button onClick={()=>setOpenSession(so?null:sk)} style={{width:"100%", display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 14px", background:"rgba(0,0,0,0.2)", border:"none", cursor:"pointer", borderBottom:so?`1px solid ${C.border}`:"none"}}>
                      <div style={{display:"flex", alignItems:"center", gap:8, textAlign:"left"}}>
                        <span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14, letterSpacing:"0.06em", textTransform:"uppercase", color:C.chalk}}>{s.day}</span>
                        <span style={{fontSize:12, color:C.muted}}>{s.focus}</span>
                      </div>
                      <span style={{fontSize:16, color:col}}>{so?"−":"+"}</span>
                    </button>
                    {so && <div style={{padding:"12px 14px"}}>
                      {s.blocks.map((b,bi)=>(
                        <div key={bi} style={{marginBottom:12}}>
                          <div style={{display:"flex", alignItems:"center", gap:8, marginBottom:6}}>
                            <Label>{b.label}</Label>
                            <span style={{fontSize:10, color:col, fontWeight:600}}>{b.time}</span>
                            <div style={{flex:1, height:1, background:C.border}}/>
                          </div>
                          {b.items.map((it,ii)=>(
                            <div key={ii} style={{fontSize:13, color:C.chalk, padding:"3px 0 3px 14px", position:"relative", lineHeight:1.45}}>
                              <span style={{position:"absolute", left:0, color:C.muted}}>—</span>{it}
                            </div>
                          ))}
                        </div>
                      ))}
                    </div>}
                  </Card>
                );
              })}
            </div>}
          </div>
        );
      })}
    </div>
  );
}

const RefTable = ({headers, rows, accent=C.gold}) => (
  <Card style={{marginBottom:14}}>
    <div style={{overflowX:"auto"}}>
      <table style={{width:"100%", borderCollapse:"collapse", minWidth:Math.max(360, headers.length*120)}}>
        <thead><tr>
          {headers.map((h,i)=><th key={i} style={{padding:"8px 12px", textAlign:"left", background:"rgba(0,0,0,0.2)", borderBottom:`1px solid ${C.border}`, fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:accent}}>{h}</th>)}
        </tr></thead>
        <tbody>
          {rows.map((r,ri)=>(
            <tr key={ri} style={{background:ri%2?"transparent":"rgba(255,255,255,0.02)"}}>
              {r.map((cell,ci)=><td key={ci} style={{padding:"9px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12.5, color:ci===0?C.chalk:C.muted, fontWeight:ci===0?600:400, lineHeight:1.4, verticalAlign:"top"}}>{cell}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </Card>
);

function RecoveryTab() {
  return (
    <div>
      <div style={{marginBottom:8}}><Label color={C.green}>Weekly Recovery Structure</Label></div>
      <RefTable accent={C.green} headers={["Day","Type","Recovery Priority"]} rows={RECOVERY.weekly.map(([d,t,p,c])=>[d,<span style={{color:c, fontWeight:700}}>{t}</span>,p])}/>
      <div style={{marginBottom:8}}><Label color={C.green}>Foam Roller Protocol</Label></div>
      <RefTable accent={C.green} headers={["Area","Duration","Why It Matters"]} rows={RECOVERY.foam}/>
      <div style={{marginBottom:8}}><Label color={C.green}>Daily Stretch Protocol (10 min)</Label></div>
      <RefTable accent={C.green} headers={["Stretch","Duration","Priority"]} rows={RECOVERY.stretch}/>
      <div style={{marginBottom:8}}><Label color={C.purple}>Sleep — Non-Negotiable</Label></div>
      <RefTable accent={C.purple} headers={["Factor","Target","Detail"]} rows={RECOVERY.sleep}/>
      <div style={{marginBottom:8}}><Label color={C.purple}>Physio Schedule</Label></div>
      <RefTable accent={C.purple} headers={["Week","Type","Focus"]} rows={RECOVERY.physio}/>
    </div>
  );
}

function NutritionTab() {
  return (
    <div>
      <div style={{marginBottom:8}}><Label color={C.gold}>Nutrition Timing — Training Days</Label></div>
      <RefTable headers={["Window","Timing","What","Examples"]} rows={NUTRITION.timing}/>
      <div style={{marginBottom:8}}><Label color={C.gold}>Sample Training Day</Label></div>
      <RefTable headers={["Time","Meal","What to Eat"]} rows={NUTRITION.trainDay}/>
      <div style={{marginBottom:8}}><Label color={C.green}>Sample Recovery Day</Label></div>
      <RefTable accent={C.green} headers={["Meal","What to Eat"]} rows={NUTRITION.recoveryDay}/>
      <div style={{marginBottom:8}}><Label color={C.gold}>Key Foods to Prioritize</Label></div>
      <RefTable headers={["Category","Target","Best Sources"]} rows={NUTRITION.keyFoods}/>
      <div style={{marginBottom:8}}><Label color={C.red}>Supplements — Food First</Label></div>
      <RefTable accent={C.red} headers={["Supplement","Worth It?","Context"]} rows={NUTRITION.supplements.map(([s,w,c,ctx])=>[s,<span style={{color:c, fontWeight:700}}>{w}</span>,ctx])}/>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// TRACKING TABS
// ════════════════════════════════════════════════════════════════════════════
function PerformanceTab() {
  const [data, setData] = useState({});
  const [athlete, setAthlete] = useState(0);
  const [week, setWeek] = useState(1);
  const key = (a,w,m)=>`perf_${a}_w${w}_${m}`;
  useEffect(()=>{(async()=>{
    const vals={}; for(const a of [0,1])for(const w of WEEKS)for(const m of METRICS){const v=await store.get(key(a,w,m.key)); if(v!==null)vals[`${a}_${w}_${m.key}`]=v;} setData(vals);
  })();},[]);
  const val=(a,w,m)=>data[`${a}_${w}_${m}`]??"";
  const setVal=async(a,w,m,v)=>{const nk=`${a}_${w}_${m}`; setData({...data,[nk]:v}); await store.set(key(a,w,m),v);};
  const delta=(a,m)=>{const w1=parseFloat(val(a,1,m.key)),w6=parseFloat(val(a,6,m.key)); if(isNaN(w1)||isNaN(w6))return null; const d=w6-w1; return {diff:Math.abs(d).toFixed(2), improved:m.lower?d<0:d>0, sign:d>0?"+":""};};
  const aCol = athlete===0?C.a1:C.a2;
  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:14}}>{ATHLETES.map((a,i)=><Btn key={i} active={athlete===i} color={i===0?C.a1:C.a2} onClick={()=>setAthlete(i)}>{a}</Btn>)}</div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:16, alignItems:"center"}}><Label>Week:</Label>{WEEKS.map(w=><Btn key={w} active={week===w} color={aCol} onClick={()=>setWeek(w)} style={{padding:"4px 10px"}}>W{w}</Btn>)}</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(200px,1fr))", gap:12, marginBottom:20}}>
        {METRICS.map(m=>(
          <Card key={m.key}>
            <CardHead><Label color={aCol}>{m.label}</Label><span style={{fontSize:11, color:C.muted, marginLeft:"auto"}}>{m.unit}</span></CardHead>
            <div style={{padding:"12px 14px"}}>
              <div style={{fontSize:11.5, color:C.muted, marginBottom:8}}>{m.desc}</div>
              <Input type="number" placeholder={`Enter ${m.unit}`} value={val(athlete,week,m.key)} onChange={e=>setVal(athlete,week,m.key,e.target.value)}/>
            </div>
          </Card>
        ))}
      </div>
      <Card>
        <CardHead><Label color={C.gold}>6-Week Progress Summary</Label></CardHead>
        <div style={{overflowX:"auto"}}>
          <table style={{width:"100%", borderCollapse:"collapse", minWidth:480}}>
            <thead>
              <tr><th style={{padding:"8px 14px", textAlign:"left", background:"rgba(0,0,0,0.15)", borderBottom:`1px solid ${C.border}`}}><Label>Metric</Label></th>
                {ATHLETES.map((a,i)=><th key={i} colSpan={3} style={{padding:"8px", textAlign:"center", background:"rgba(0,0,0,0.15)", borderBottom:`1px solid ${C.border}`, borderLeft:`1px solid ${C.border}`}}><Label color={i===0?C.a1:C.a2}>{a}</Label></th>)}
              </tr>
              <tr><th style={{background:"rgba(0,0,0,0.1)", borderBottom:`1px solid ${C.border}`}}/>
                {ATHLETES.map((_,i)=>["W1","W6","Δ"].map((h,j)=><th key={`${i}${j}`} style={{padding:"5px 8px", textAlign:"center", background:"rgba(0,0,0,0.1)", borderBottom:`1px solid ${C.border}`, borderLeft:j===0?`1px solid ${C.border}`:"none", fontSize:10, color:C.muted, fontFamily:"'Barlow Condensed',sans-serif"}}>{h}</th>))}
              </tr>
            </thead>
            <tbody>
              {METRICS.map(m=>(
                <tr key={m.key}>
                  <td style={{padding:"10px 14px", borderBottom:`1px solid ${C.border}`, fontSize:13, color:C.chalk}}>{m.label}</td>
                  {ATHLETES.map((_,i)=>{const d=delta(i,m); return ["w1","w6","d"].map((col,j)=>{let v,color=C.chalk; if(col==="w1")v=val(i,1,m.key)||"—"; else if(col==="w6")v=val(i,6,m.key)||"—"; else if(!d){v="—";color=C.muted;}else{v=`${d.sign}${d.diff}`;color=d.improved?C.green:C.red;} return <td key={`${i}${j}`} style={{padding:"10px 8px", borderBottom:`1px solid ${C.border}`, borderLeft:j===0?`1px solid ${C.border}`:"none", textAlign:"center", fontSize:13, color, fontWeight:col==="d"?700:400}}>{v}</td>;});})}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function ScorecardTab() {
  const [scores, setScores] = useState([]);
  const [week, setWeek] = useState(1);
  const [winner, setWinner] = useState(null);
  const [route, setRoute] = useState("");
  const [note, setNote] = useState("");
  useEffect(()=>{(async()=>{setScores(await store.get("scores_all")||[]);})();},[]);
  const weekScores = scores.filter(s=>s.week===week);
  const tally=i=>weekScores.filter(s=>s.winner===i).length;
  const allTime=ATHLETES.map((_,i)=>scores.filter(s=>s.winner===i).length);
  const addRep=async()=>{if(winner===null||!route)return; const u=[...scores,{week,winner,route,note,date:new Date().toISOString().slice(0,10)}]; setScores(u); await store.set("scores_all",u); setWinner(null);setRoute("");setNote("");};
  const clearWeek=async()=>{const u=scores.filter(s=>s.week!==week); setScores(u); await store.set("scores_all",u);};
  const ROUTES=["Slant","Out","Curl","Dig","Post","Corner","Fade","Go","Comeback"];
  return (
    <div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:16}}>
        {ATHLETES.map((a,i)=>(
          <Card key={i}><div style={{padding:"14px", textAlign:"center"}}>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, letterSpacing:"0.14em", textTransform:"uppercase", color:i===0?C.a1:C.a2}}>{a}</div>
            <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:40, color:i===0?C.a1:C.a2, lineHeight:1}}>{allTime[i]}</div>
            <div style={{fontSize:11, color:C.muted}}>total wins</div>
          </div></Card>
        ))}
      </div>
      <div style={{display:"flex", gap:6, flexWrap:"wrap", marginBottom:14, alignItems:"center"}}><Label>Week:</Label>{WEEKS.map(w=>{const has=scores.some(s=>s.week===w); return <Btn key={w} active={week===w} onClick={()=>setWeek(w)} style={{padding:"4px 10px"}}>W{w}{has?" ●":""}</Btn>;})}</div>
      <div style={{display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:14}}>
        {ATHLETES.map((a,i)=><Card key={i} style={{borderColor:`${i===0?C.a1:C.a2}44`}}><div style={{padding:"10px", textAlign:"center"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:i===0?C.a1:C.a2}}>W{week} — {a}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:32, color:i===0?C.a1:C.a2}}>{tally(i)}</div></div></Card>)}
      </div>
      <Card style={{marginBottom:14}}>
        <CardHead><Label color={C.red}>Log a Rep</Label></CardHead>
        <div style={{padding:"14px"}}>
          <Label>Route</Label>
          <div style={{display:"flex", flexWrap:"wrap", gap:6, margin:"6px 0 12px"}}>{ROUTES.map(r=><button key={r} onClick={()=>setRoute(r)} style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:12, padding:"3px 10px", borderRadius:3, cursor:"pointer", border:`1px solid ${route===r?C.gold:C.border}`, background:route===r?`${C.gold}22`:"transparent", color:route===r?C.gold:C.muted}}>{r}</button>)}</div>
          <Label>Winner</Label>
          <div style={{display:"flex", gap:8, margin:"6px 0 12px"}}>{ATHLETES.map((a,i)=><button key={i} onClick={()=>setWinner(i)} style={{flex:1, fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, textTransform:"uppercase", padding:"8px", borderRadius:4, cursor:"pointer", border:`1px solid ${winner===i?(i===0?C.a1:C.a2):C.border}`, background:winner===i?`${i===0?C.a1:C.a2}22`:"transparent", color:winner===i?(i===0?C.a1:C.a2):C.muted}}>{a}</button>)}</div>
          <Input value={note} onChange={e=>setNote(e.target.value)} placeholder="Notes (optional)" style={{marginBottom:12}}/>
          <button onClick={addRep} style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, letterSpacing:"0.1em", textTransform:"uppercase", padding:"8px 20px", borderRadius:4, cursor:"pointer", background:winner!==null&&route?C.green:"rgba(0,0,0,0.2)", border:"none", color:winner!==null&&route?"#0e2419":C.muted, fontWeight:700}}>Log Rep</button>
        </div>
      </Card>
      {weekScores.length>0 && <Card>
        <CardHead><Label color={C.sky}>Week {week} Log</Label><button onClick={clearWeek} style={{marginLeft:"auto", fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", background:"transparent", border:`1px solid ${C.red}44`, color:C.red, padding:"2px 8px", borderRadius:3, cursor:"pointer"}}>Clear</button></CardHead>
        <div style={{padding:"10px 14px"}}>{weekScores.map((s,i)=><div key={i} style={{display:"flex", alignItems:"center", gap:10, padding:"7px 0", borderBottom:i<weekScores.length-1?`1px solid ${C.border}`:"none"}}><span style={{fontSize:11, color:C.muted, minWidth:18}}>#{i+1}</span><span style={{fontSize:13, color:C.chalk, flex:1}}>{s.route}</span><Pill label={ATHLETES[s.winner]} color={s.winner===0?C.a1:C.a2}/>{s.note&&<span style={{fontSize:11, color:C.muted, maxWidth:140, textAlign:"right"}}>{s.note}</span>}</div>)}</div>
      </Card>}
    </div>
  );
}

function ReadinessTab() {
  const [readiness, setReadiness] = useState([]);
  const [athlete, setAthlete] = useState(0);
  const [date, setDate] = useState(new Date().toISOString().slice(0,10));
  const [form, setForm] = useState({sleep:"", soreness:0, energy:3, notes:""});
  const [saved, setSaved] = useState(false);
  useEffect(()=>{(async()=>{setReadiness(await store.get("readiness_all")||[]);})();},[]);
  useEffect(()=>{const e=readiness.find(r=>r.athlete===athlete&&r.date===date); if(e)setForm({sleep:e.sleep,soreness:e.soreness,energy:e.energy,notes:e.notes||""}); else setForm({sleep:"",soreness:0,energy:3,notes:""}); setSaved(false);},[athlete,date,readiness]);
  const save=async()=>{const entry={athlete,date,...form,sleep:parseFloat(form.sleep)||0}; const u=[...readiness.filter(r=>!(r.athlete===athlete&&r.date===date)),entry]; setReadiness(u); await store.set("readiness_all",u); setSaved(true);};
  const recent=readiness.filter(r=>r.athlete===athlete).sort((a,b)=>b.date.localeCompare(a.date)).slice(0,14);
  const avgSleep=recent.length?(recent.reduce((s,r)=>s+r.sleep,0)/recent.length).toFixed(1):"—";
  const aCol=athlete===0?C.a1:C.a2;
  const Slider=({label,value,onChange,labels,color})=>(
    <div style={{marginBottom:14}}>
      <div style={{display:"flex", justifyContent:"space-between", marginBottom:6}}><Label>{label}</Label><span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:14, color}}>{labels[value]}</span></div>
      <input type="range" min={0} max={labels.length-1} value={value} onChange={e=>onChange(parseInt(e.target.value))} style={{width:"100%", accentColor:color}}/>
    </div>
  );
  return (
    <div>
      <div style={{display:"flex", gap:8, marginBottom:14}}>{ATHLETES.map((a,i)=><Btn key={i} active={athlete===i} color={i===0?C.a1:C.a2} onClick={()=>setAthlete(i)}>{a}</Btn>)}</div>
      <div style={{display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(130px,1fr))", gap:10, marginBottom:16}}>
        {[["Avg Sleep (14d)",`${avgSleep} hrs`,C.sky],["Entries",`${recent.length}`,C.green]].map(([l,v,c])=><Card key={l}><div style={{padding:"12px", textAlign:"center"}}><div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", color:c}}>{l}</div><div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:26, color:c}}>{v}</div></div></Card>)}
      </div>
      <Card style={{marginBottom:14}}>
        <CardHead><Label color={aCol}>Check-In</Label><input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{marginLeft:"auto", background:"rgba(0,0,0,0.3)", border:`1px solid ${C.border}`, borderRadius:4, padding:"3px 8px", color:C.chalk, fontSize:12, fontFamily:"'Barlow',sans-serif"}}/></CardHead>
        <div style={{padding:"14px"}}>
          <div style={{marginBottom:14}}><Label>Hours Slept</Label><Input type="number" value={form.sleep} onChange={e=>setForm({...form,sleep:e.target.value})} placeholder="e.g. 8.5" style={{marginTop:6, width:120}}/></div>
          <Slider label="Soreness" value={form.soreness} onChange={v=>setForm({...form,soreness:v})} labels={SORENESS} color={[C.green,C.green,C.gold,C.gold,C.red][form.soreness]}/>
          <Slider label="Energy" value={form.energy} onChange={v=>setForm({...form,energy:v})} labels={ENERGY} color={[C.red,C.red,C.gold,C.green,C.green][form.energy]}/>
          <div style={{marginBottom:14}}><Label>Notes</Label><textarea value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})} placeholder="Soreness location, how the session felt..." style={{marginTop:6, width:"100%", background:"rgba(0,0,0,0.25)", border:`1px solid ${C.border}`, borderRadius:4, padding:"8px 10px", color:C.chalk, fontSize:13, fontFamily:"'Barlow',sans-serif", resize:"vertical", minHeight:50, outline:"none"}}/></div>
          <button onClick={save} style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:13, letterSpacing:"0.1em", textTransform:"uppercase", padding:"8px 20px", borderRadius:4, cursor:"pointer", background:saved?C.green:aCol, border:"none", color:"#0e2419", fontWeight:700}}>{saved?"Saved ✓":"Save Check-In"}</button>
        </div>
      </Card>
      {recent.length>0 && <Card>
        <CardHead><Label color={C.sky}>Recent — {ATHLETES[athlete]}</Label></CardHead>
        <div style={{overflowX:"auto"}}><table style={{width:"100%", borderCollapse:"collapse", minWidth:380}}>
          <thead><tr>{["Date","Sleep","Soreness","Energy","Notes"].map(h=><th key={h} style={{padding:"7px 12px", textAlign:"left", background:"rgba(0,0,0,0.15)", borderBottom:`1px solid ${C.border}`}}><Label>{h}</Label></th>)}</tr></thead>
          <tbody>{recent.map((r,i)=><tr key={i}>
            <td style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12, color:C.muted, fontFamily:"'Barlow Condensed',sans-serif"}}>{new Date(r.date+"T12:00:00").toLocaleDateString("en-CA",{month:"short",day:"numeric"})}</td>
            <td style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontSize:13, color:r.sleep>=9?C.green:r.sleep>=7?C.gold:C.red, fontWeight:600}}>{r.sleep||"—"}h</td>
            <td style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12, color:[C.green,C.green,C.gold,C.gold,C.red][r.soreness]}}>{SORENESS[r.soreness]}</td>
            <td style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12, color:[C.red,C.red,C.gold,C.green,C.green][r.energy]}}>{ENERGY[r.energy]}</td>
            <td style={{padding:"8px 12px", borderBottom:`1px solid ${C.border}`, fontSize:12, color:C.muted, maxWidth:160}}>{r.notes||"—"}</td>
          </tr>)}</tbody>
        </table></div>
      </Card>}
    </div>
  );
}

function GroceryTab() {
  const [checked, setChecked] = useState({});
  useEffect(()=>{(async()=>{setChecked(await store.get("grocery_checked")||{});})();},[]);
  const toggle=async(c,i)=>{const k=`${c}__${i}`; const u={...checked,[k]:!checked[k]}; setChecked(u); await store.set("grocery_checked",u);};
  const reset=async()=>{setChecked({}); await store.set("grocery_checked",{});};
  const total=GROCERY.reduce((s,c)=>s+c.items.length,0);
  const done=Object.values(checked).filter(Boolean).length;
  return (
    <div>
      <Card style={{marginBottom:14}}><div style={{padding:"14px"}}>
        <div style={{display:"flex", justifyContent:"space-between", marginBottom:8}}><Label color={C.green}>Shopping Progress</Label><span style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:700, fontSize:15, color:C.green}}>{done}/{total}</span></div>
        <div style={{background:"rgba(0,0,0,0.3)", borderRadius:4, height:8, overflow:"hidden"}}><div style={{background:C.green, width:`${(done/total)*100}%`, height:"100%", transition:"width 0.3s"}}/></div>
        <div style={{display:"flex", justifyContent:"flex-end", marginTop:8}}><button onClick={reset} style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.1em", textTransform:"uppercase", background:"transparent", border:`1px solid ${C.border}`, color:C.muted, padding:"2px 8px", borderRadius:3, cursor:"pointer"}}>Reset All</button></div>
      </div></Card>
      {GROCERY.map(cat=>{
        const cd=cat.items.filter(([n])=>checked[`${cat.cat}__${n}`]).length;
        return (
          <Card key={cat.cat} style={{marginBottom:12}}>
            <CardHead><Label color={cat.color}>{cat.cat}</Label><span style={{marginLeft:"auto", fontFamily:"'Barlow Condensed',sans-serif", fontSize:11, color:cd===cat.items.length?C.green:C.muted}}>{cd}/{cat.items.length}</span></CardHead>
            <div style={{padding:"8px 14px"}}>
              {cat.items.map(([n,q,note],i)=>{const t=!!checked[`${cat.cat}__${n}`]; return (
                <div key={i} onClick={()=>toggle(cat.cat,n)} style={{display:"flex", alignItems:"flex-start", gap:10, padding:"8px 0", borderBottom:i<cat.items.length-1?`1px solid ${C.border}`:"none", cursor:"pointer", opacity:t?0.5:1}}>
                  <div style={{width:18, height:18, minWidth:18, borderRadius:3, marginTop:1, background:t?C.green:"transparent", border:`2px solid ${t?C.green:C.border}`, display:"flex", alignItems:"center", justifyContent:"center"}}>{t&&<span style={{color:"#0e2419", fontSize:12, fontWeight:900}}>✓</span>}</div>
                  <div style={{flex:1}}><div style={{fontSize:13.5, color:t?C.muted:C.chalk, textDecoration:t?"line-through":"none"}}>{n}</div><div style={{display:"flex", gap:10, marginTop:2}}><span style={{fontSize:11, color:C.gold, fontFamily:"'Barlow Condensed',sans-serif"}}>{q}</span><span style={{fontSize:11, color:C.muted}}>{note}</span></div></div>
                </div>
              );})}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// APP SHELL
// ════════════════════════════════════════════════════════════════════════════
const GROUPS = [
  { name:"Program", tabs:[
    { id:"schedule", label:"Schedule", icon:"🏈", color:C.gold },
    { id:"recovery", label:"Recovery", icon:"🛌", color:C.green },
    { id:"nutrition", label:"Nutrition", icon:"🥗", color:C.gold },
  ]},
  { name:"Tracking", tabs:[
    { id:"perf", label:"Performance", icon:"📈", color:C.sky },
    { id:"score", label:"1-on-1", icon:"⚔️", color:C.red },
    { id:"ready", label:"Readiness", icon:"🛌", color:C.green },
    { id:"grocery", label:"Grocery", icon:"🛒", color:C.gold },
  ]},
];

export default function App() {
  const [tab, setTab] = useState("schedule");
  const allTabs = GROUPS.flatMap(g=>g.tabs);
  return (
    <div style={{background:C.bg, minHeight:"100vh", color:C.chalk, fontFamily:"'Barlow',sans-serif"}}>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@400;600;700;900&family=Barlow:wght@400;500;600&display=swap'); * { box-sizing:border-box; } input[type=range]{height:4px;} ::-webkit-scrollbar{height:6px;width:6px;} ::-webkit-scrollbar-thumb{background:rgba(240,237,230,0.2);border-radius:3px;}`}</style>

      <div style={{background:"linear-gradient(160deg,#0e2419 0%,#1a3a2a 70%)", borderBottom:`2px solid ${C.gold}`, padding:"24px 20px 14px"}}>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontSize:10, letterSpacing:"0.18em", textTransform:"uppercase", color:C.gold, marginBottom:4}}>Provincial / Elite · WR · DB · RB</div>
        <div style={{fontFamily:"'Barlow Condensed',sans-serif", fontWeight:900, fontSize:"clamp(26px,6vw,42px)", lineHeight:1, textTransform:"uppercase"}}>Flag Football <span style={{color:C.gold}}>HQ</span></div>
        <div style={{fontSize:12.5, color:C.muted, marginTop:6}}>6-week program, recovery, nutrition, and tracking — all in one place.</div>
      </div>

      <div style={{position:"sticky", top:0, zIndex:10, background:C.darker, borderBottom:`1px solid ${C.border}`}}>
        <div style={{display:"flex", overflowX:"auto", maxWidth:900, margin:"0 auto"}}>
          {GROUPS.map((g,gi)=>(
            <div key={g.name} style={{display:"flex", borderLeft:gi>0?`1px solid ${C.border}`:"none"}}>
              {g.tabs.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} style={{padding:"11px 12px", fontFamily:"'Barlow Condensed',sans-serif", fontSize:12.5, letterSpacing:"0.08em", textTransform:"uppercase", border:"none", borderBottom:tab===t.id?`2px solid ${t.color}`:"2px solid transparent", background:"transparent", color:tab===t.id?t.color:C.muted, cursor:"pointer", whiteSpace:"nowrap"}}>
                  <span style={{marginRight:4}}>{t.icon}</span>{t.label}
                </button>
              ))}
            </div>
          ))}
        </div>
      </div>

      <div style={{padding:"20px 16px 60px", maxWidth:900, margin:"0 auto"}}>
        {tab==="schedule" && <ScheduleTab/>}
        {tab==="recovery" && <RecoveryTab/>}
        {tab==="nutrition" && <NutritionTab/>}
        {tab==="perf" && <PerformanceTab/>}
        {tab==="score" && <ScorecardTab/>}
        {tab==="ready" && <ReadinessTab/>}
        {tab==="grocery" && <GroceryTab/>}
      </div>
    </div>
  );
}
