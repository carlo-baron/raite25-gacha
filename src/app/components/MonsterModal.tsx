"use client";

import {
  motion
} from 'motion/react';
import{
  Paper,
  Box,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Chip,
} from '@mui/material';
import{
  PokemonType,
  maxBaseStats,
  fetchPokemonData
} from '@/utils';
import ShuffleStatGame from './ShuffleStatGame';
import ElementalTossGame from './ElementalTossGame';
import {
  useState,
  useEffect,
  useRef,
} from 'react';

const TIER_POOLS = {
  "Common": [
    "pikachu","pidgeot","gengar","alakazam",
    // Gen4 (20)
    "turtwig","grotle","torterra","chimchar","monferno","infernape","piplup","prinplup","empoleon","starly",
    "staravia","staraptor","bidoof","bibarel","kricketot","kricketune","shinx","luxio","luxray","budew",
    // Gen6 (15)
    "chespin","quilladin","chesnaught","fennekin","braixen","delphox","froakie","frogadier","greninja","fletchling",
    "fletchinder","talonflame","scatterbug","spewpa","vivillon",
    // Gen3 (10)
    "treecko","grovyle","sceptile","torchic","combusken","blaziken","mudkip","marshtomp","swampert","breloom"
  ],
  "Uncommon": ["lapras","ninetales","goodra","kommo-o"],
  "Rare": [
    "zapdos","dragonite",
    "raikou","entei","suicune","lugia","ho-oh","celebi",
    "regirock","regice","registeel","latias","latios","kyogre","groudon","rayquaza","jirachi","deoxys"
  ],
  "Ultra-Rare": [
    "dialga","palkia","giratina","uxie","mesprit","azelf","heatran","regigigas","cresselia","phione","manaphy","darkrai","shaymin","arceus",
    "victini","cobalion","terrakion","virizion","tornadus","thundurus","landorus","reshiram","zekrom","kyurem","keldeo","meloetta","genesect"
  ],
  "EX": ["mew"]
};

const NATO = ["Alpha","Bravo","Charlie","Delta","Echo","Foxtrot","Golf","Hotel","India","Juliett","Kilo","Lima","Mike","November","Oscar","Papa","Quebec","Romeo","Sierra","Tango","Uniform","Victor","Whiskey","Xray","Yankee","Zulu"];

function applyResultToLocal(local: PokemonType, result: ShuffleResult | TossResult) {
  const now = Date.now();
  const newStats = { ...local.stats };
  const delta = result.delta || 0;
  if (result.statKey) {
    if (typeof newStats[result.statKey] === "undefined") newStats[result.statKey] = 0;
    newStats[result.statKey] = Math.max(0, newStats[result.statKey] + delta);
  }

  const newWorth = Math.max(0, Math.round((local.cryptoWorth || 0) + (result.deltaWorth || 0)));

  const newHistory = [
    ...local.history,
    { ts: now, event: `${result.source}: ${result.message}`, deltaWorth: result.deltaWorth || 0 },
  ];

  return { ...local, stats: newStats, cryptoWorth: newWorth, history: newHistory };
}

interface ShuffleResult {
  statKey: string;
  delta: number;
  deltaWorth: number;
  success: boolean;
  message: string;
  source: string;
}

interface TossResult {
  zone: string;
  zoneId: string;
  statKey: string;
  delta: number;
  deltaWorth: number;
  matched: boolean;
  message: string;
  source: string;
}

interface MonsterModalProps{
  open: boolean;
  onClose: () => void;
  monster: PokemonType;
  onDelete: (uid: string) => void;
  onSave: (monster: PokemonType) => void;
  onSell: (uid: string) => void;
  addMonster: (monster: PokemonType) => void;
  creditTokens: (amt: number, note: string) => void;
}

export default function MonsterModal({
  open,
  onClose,
  monster,
  onDelete,
  onSave,
  onSell,
  addMonster,
  creditTokens
}: MonsterModalProps){
  const [local, setLocal] = useState<PokemonType>({...monster});
  const [lastActionMsg, setLastActionMsg] = useState<string | null>(null);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState<boolean>(false);
  const popupRef = useRef<Window | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      try {
        if (e.origin !== window.location.origin) return;
      } catch (err) {
        // ignore origin check in some local setups
      }
      const data = e.data || {};
      if (!data || !data.type) return;


      if (data.type === "trade-accept") {
        const offer = data.offer;
        if (onDelete) onDelete(local.uid);
        if (addMonster) addMonster(offer);
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
        onClose();
        window.alert(`Trade accepted — you received ${offer.name.toUpperCase()} from ${offer.__traderName}`);
      } else if (data.type === "trade-decline") {
        if (popupRef.current && !popupRef.current.closed) popupRef.current.close();
        window.alert("Trade declined.");
      }
    }

    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [local, onDelete, addMonster, onClose]);

  function handleMiniGameResult(result: ShuffleResult | TossResult) {
    const updated = applyResultToLocal(local, result);
    setLocal(updated);
    setLastActionMsg(result.message);
  }

  function saveChanges() {
    onSave(local);
    onClose();
  }

  function handleSell() {
    const confirm = window.confirm(`Sell ${local.name.toUpperCase()} for ₿${Math.round(local.cryptoWorth)}? This will remove the Pokémon from your collection.`);
    if (!confirm) return;
    if (onSell) {
      onSell(local.uid);
    } else {
      if (onDelete) onDelete(local.uid);
      if (creditTokens) creditTokens(Math.round(local.cryptoWorth), `Sold ${local.name}`);
    }
    onClose();
  }

  async function generateTradeOfferPopup() {
    setIsGeneratingOffer(true);

    const pool = TIER_POOLS[local.rarity] || [];
    const options = pool.filter((s) => s.toLowerCase() !== local.name.toLowerCase());
    const candidates = options.length > 0 ? options : pool.slice();
    const pick = candidates[Math.floor(Math.random() * candidates.length)];

    try {
      const poke = await fetchPokemonData(pick);
      const sumStats = Object.values(poke.stats).reduce((a,b) => a + b, 0);
      let multiplier = 1;
      switch (local.rarity) {
        case "EX": multiplier = 10; break;
        case "Ultra-Rare": multiplier = 5; break;
        case "Rare": multiplier = 2.5; break;
        case "Uncommon": multiplier = 1.5; break;
        default: multiplier = 1; break;
      }
      const cryptoWorth = Math.max(1, Math.round((sumStats / 10) * multiplier));

      const phon = NATO[Math.floor(Math.random() * NATO.length)];
      const idnum = Math.floor(Math.random() * 9000) + 100;
      const traderName = `${phon}-${idnum}`;

      const offered = {
        uid: `offer-${Date.now()}-${Math.floor(Math.random()*10000)}`,
        acquiredAt: Date.now(),
        name: poke.name,
        speciesId: poke.id,
        sprite: poke.sprite,
        types: poke.types,
        baseStats: poke.stats,
        stats: { ...poke.stats },
        rarity: local.rarity,
        cryptoWorth,
        history: [{ ts: Date.now(), event: `Offered by ${traderName}`, deltaWorth: 0 }],
        __traderName: traderName,
      };

      const w = 520;
      const h = 720;
      const left = Math.round((window.screen.width - w) / 2);
      const top = Math.round((window.screen.height - h) / 2);
      const features = `width=${w},height=${h},left=${left},top=${top},resizable=yes,scrollbars=yes`;
      const popup = window.open("", `trade-offer-${Date.now()}`, features);

      if (!popup) {
        window.alert("Popup blocked. Please allow popups for this site to use Trade.");
        setIsGeneratingOffer(false);
        return;
      }

      popupRef.current = popup;

      const escapedSprite = offered.sprite;
      const html = `
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8" />
            <title>Trade Offer — ${offered.name}</title>
            <style>
              body { margin:0; font-family: Inter, Arial, sans-serif; background: linear-gradient(180deg,#071026,#04101a); color:#eaf6ff; display:flex; flex-direction:column; align-items:center; padding:18px; }
              .card { width: 440px; border-radius:12px; padding:14px; background: linear-gradient(180deg, rgba(255,255,255,0.02), rgba(255,255,255,0.008)); box-shadow: 0 18px 40px rgba(0,0,0,0.6); margin-top:12px; }
              img { width: 220px; height:220px; object-fit:contain; display:block; margin: 0 auto; filter: drop-shadow(0 18px 40px rgba(0,0,0,0.6)); }
              .title { text-align:center; font-weight:800; margin-top:8px; }
              .sub { text-align:center; color:#9fb2c6; margin-top:6px; font-size:13px; }
              .row { display:flex; justify-content:space-between; gap:12px; margin-top:12px; align-items:center; }
              .field { font-size:13px; color:#bfeaf0; font-weight:700; }
              .buttons { display:flex; gap:10px; justify-content:flex-end; margin-top:14px; }
              button { padding:10px 14px; border-radius:8px; border:none; cursor:pointer; font-weight:800; }
              button.primary { background: linear-gradient(90deg,#06b6d4,#7c3aed); color:#fff; }
              button.secondary { background: rgba(255,255,255,0.03); color:#dbeffd; }
              .small { font-size:12px; color:#9fb2c6; margin-top:8px; text-align:center; }
            </style>
          </head>
          <body>
            <h2 style="margin:6px 0 0 0;">Trade Offer</h2>
            <div class="small">From: <strong>${offered.__traderName}</strong></div>

            <div class="card">
              <img src="${escapedSprite}" alt="${offered.name}" />
              <div class="title">${offered.name.toUpperCase()}</div>
              <div class="sub">${offered.rarity} • ₿ ${Math.round(offered.cryptoWorth)}</div>

              <div class="row">
                <div class="field">Types: ${offered.types.join(", ")}</div>
                <div class="field">ID: ${offered.speciesId}</div>
              </div>

              <div class="row" style="margin-top:10px;">
                <div class="field">Offered to receive: <strong>${local.name.toUpperCase()}</strong></div>
              </div>

              <div class="buttons">
                <button class="secondary" id="decline">Decline</button>
                <button class="primary" id="accept">Accept Trade</button>
              </div>
            </div>

            <script>
              const offer = ${JSON.stringify(offered)};
              const origin = window.opener ? window.opener.location.origin : "*";
              document.getElementById("accept").addEventListener("click", () => {
                try {
                  window.opener.postMessage({ type: "trade-accept", offer: offer }, origin);
                } catch (err) {
                  window.opener.postMessage({ type: "trade-accept", offer: offer }, "*");
                }
                window.close();
              });
              document.getElementById("decline").addEventListener("click", () => {
                try {
                  window.opener.postMessage({ type: "trade-decline" }, origin);
                } catch (err) {
                  window.opener.postMessage({ type: "trade-decline" }, "*");
                }
                window.close();
              });
            </script>
          </body>
        </html>
      `;

      popup.document.open();
      popup.document.write(html);
      popup.document.close();
      popup.focus();

    } catch (err) {
      console.error("Failed to generate trade offer", err);
      window.alert("Failed to generate trade offer. Try again.");
    } finally {
      setIsGeneratingOffer(false);
    }
  }

  return(
    <Dialog
    open={open}
    onClose={onClose}
    slotProps={{
      paper: {
        className:'h-full w-full' 
      }
    }}
    >
    <DialogTitle
    className='p-0j flex justify-between'
    >
      <Box
      className='text-sm/tight info'
      >
        <Typography
        variant='h6'
        fontWeight={600}
        >
          {monster.name.toUpperCase()}
        </Typography>
        <Typography
        variant='caption'
        color='textSecondary'
        >
          {monster.rarity} • #{monster.speciesId}
        </Typography>
      </Box>
      <Box
      className='gap-1 flex flex-col action'
      >
        <Button
        variant='contained'
        className='grow w-4 h-4'
        onClick={generateTradeOfferPopup}
        >
          Trade
        </Button>
        <Button
        variant='contained'
        color='secondary'
        className='grow w-4 h-4'
        onClick={handleSell}
        >
          Sell
        </Button>
      </Box>
    </DialogTitle>
    <DialogContent
    className='overflow-y-scroll gap-2 flex flex-col'
    >
      <MonsterInfoCard 
      monster={monster}
      />
      <MonsterStatCard 
      monster={monster}
      />
      <Paper 
      elevation={3}
      className="flex flex-col gap-4 p-2"
      >
        <Typography variant="h6">Care Interactions</Typography>
        <ShuffleStatGame
        monster={monster}
        onResult={handleMiniGameResult}
        />
        <ElementalTossGame 
        monster={monster}
        onResult={handleMiniGameResult}
      />
      </Paper>
    </DialogContent>
    <DialogActions>
      <Button
      size='small'
      onClick={onClose}
      >
      Cancel
      </Button>
      <Button
      size='small'
      onClick={saveChanges}
      >
      Save Changes
      </Button>
    </DialogActions>
    </Dialog>
  );
}

function MonsterStatCard({monster}:{monster: PokemonType}){
  const mappedStats = Object.entries(monster.stats).map(([name, value]) => (
    <Box 
    key={name}
    className="flex h-4 gap-2"
    >
      <Typography
      className='min-w-[120px] capitalize self-center'
      >
        {name}
      </Typography>
      <Paper 
      className="grow"
      sx={{ borderRadius: '99999px' }}
      >
        <Box
        component={motion.div}
        className='rounded-full bg-green-500 h-full'
        initial={{width: 0}}
        whileInView={{
          width: `${(value/maxBaseStats[name]) * 100}%`
        }}
        transition={{duration: 1, ease: 'easeOut'}}
        />
      </Paper>
      <Typography
      className='min-w-[30px] text-center self-center'
      >
        {value}
      </Typography>
    </Box>
  ));

  return(
    <Paper
    elevation={3}
    className='flex flex-col gap-4 p-2'
    >
      <Typography
      variant='h6'
      fontWeight={400}
      >
        Stats
      </Typography>
      <Box
      className='flex flex-col gap-4'
      >
        {mappedStats}
        <Typography
        className='text-end'
        >
        Total: {
          Object.values(monster.stats).reduce((sum, value) => sum + value, 0)
        }
        </Typography> 
      </Box>
    </Paper>
  );
}

function MonsterInfoCard({
  monster,
}: { monster: PokemonType; }){

  const mappedTypes = monster.types.map((type, index) => {
    return (
      <Chip 
      key={index}
      className='capitalize'
      label={type}
      size='small'
      sx={{
        fontSize: '10px',
        fontWeight: 700,
      }}
      />
    );
  });

  return(
    <Paper
    elevation={3}
    className='p-2 grid grid-cols-2 gap-2'
    >
      <Paper
      elevation={5}
      >
        <motion.img 
        src={monster.sprite}
        alt={monster.name}
        whileHover={{
          scale: 1.2
        }}
        />
      </Paper>
      <Box
      className='flex flex-col justify-between gap-2'
      >
        <Paper
        elevation={10}
        className='p-2 grow flex flex-col '
        >
          <Typography
          variant='body1'
          >
            Worth: 
          </Typography>
          <Typography
          className='h-full flex  items-center justify-center'
          variant='h5'
          fontWeight={600}
          >
            Ξ{monster.cryptoWorth} 
          </Typography>
        </Paper>
        <Paper
        elevation={10}
        className='p-2'
        >
          <Box
          className='flex gap-1 justify-center'
          >
            {
              mappedTypes
            }
          </Box>
        </Paper>
      </Box>
    </Paper>
  );
}
