export const TIERS = [
  {
    name: "EX",
    weight: 0.003,
    pokemon: [
      "mewtwo", "mew", "lugia", "ho-oh", "rayquaza",
      "groudon", "kyogre", "dialga", "palkia", "giratina-altered",
      "giratina-origin", "arceus", "darkrai", "deoxys-normal",
      "deoxys-attack", "deoxys-defense", "deoxys-speed",
      "regigigas", "reshiram", "zekrom", "kyurem", "kyurem-black",
      "kyurem-white", "meloetta-aria", "meloetta-pirouette",
      "genesect", "shaymin-land", "shaymin-sky", "celebi",
      "manaphy", "phione", "victini", "cresselia", "latias", "latios",
      "jirachi", "heatran", "tornadus-therian", "thundurus-therian",
      "landorus-therian", "tornadus-incarnate", "thundurus-incarnate",
      "landorus-incarnate", "regirock", "regice", "registeel",
      "suicune", "entei", "raikou"
    ],
  },
  {
    name: "Ultra-Rare",
    weight: 0.02,
    pokemon: [
      "dragonite", "tyranitar", "metagross", "garchomp", "salamence",
      "infernape", "blaziken", "empoleon", "sceptile", "swampert",
      "charizard", "venusaur", "blastoise", "lucario", "gallade",
      "togekiss", "gardevoir", "snorlax", "scizor", "heracross",
      "gengar", "alakazam", "machamp", "arcanine", "gyarados",
      "electivire", "magmortar", "rhyperior", "mamoswine",
      "tangrowth", "weavile", "abomasnow", "sylveon",
      "glaceon", "leafeon", "flareon", "vaporeon", "jolteon", "espeon", "umbreon"
    ],
  },
  {
    name: "Rare",
    weight: 0.06,
    pokemon: [
      "lapras", "kingdra", "milotic", "ninetales", "rapidash",
      "starmie", "exeggutor", "aerodactyl", "porygon-z",
      "porygon2", "rhydon", "magneton", "magnezone",
      "nidoqueen", "nidoking", "slowbro", "slowking",
      "steelix", "gliscor", "yanmega", "camerupt",
      "flygon", "altaria", "walrein", "torkoal", "manectric",
      "houndoom", "cacturne", "swellow", "exploud", "hariyama",
      "cradily", "armaldo", "ludicolo", "shiftry", "claydol",
      "golem", "weezing", "victreebel", "vileplume", "tangela",
      "politoed", "electabuzz", "magmar", "pinsir", "tauros"
    ],
  },
  {
    name: "Uncommon",
    weight: 0.1887,
    pokemon: [
      "charmeleon", "wartortle", "ivysaur", "haunter", "machoke",
      "kadabra", "poliwhirl", "graveler", "nidorina", "nidorino",
      "slowpoke", "weepinbell", "gloom", "persian", "primeape",
      "golbat", "magneton", "dugtrio", "seadra", "dodrio",
      "arbok", "raichu", "marowak", "tentacruel", "sandslash",
      "parasect", "venomoth", "rapidash", "muk", "cloyster",
      "hypno", "starmie", "kingler", "electrode", "lickitung",
      "hitmonlee", "hitmonchan", "chansey", "mr-mime", "lapras",
      "ditto", "eevee", "porygon", "kabutops", "omastar", "scyther"
    ],
  },
  {
    name: "Common",
    weight: 0.7283,
    pokemon: [
      "rattata", "raticate", "pidgey", "pidgeotto", "pidgeot",
      "spearow", "fearow", "caterpie", "metapod", "butterfree",
      "weedle", "kakuna", "beedrill", "zubat", "golbat",
      "oddish", "bellsprout", "tentacool", "geodude",
      "onix", "venonat", "paras", "diglett", "meowth",
      "krabby", "horsea", "seel", "gastly", "drowzee",
      "cubone", "magnemite", "grimer", "shellder",
      "voltorb", "exeggcute", "goldeen", "staryu",
      "magikarp", "ponyta", "doduo", "sandshrew",
      "ekans", "nidoran-f", "nidoran-m", "vulpix"
    ],
  },
] as const;

export const TIER_POOLS = TIERS.reduce((acc, tier) => {
  acc[tier.name] = tier.pokemon;
  return acc;
}, {} as Record<string, readonly string[]>);

// --- Type Definitions ---

export type PokemonStat = {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
};

export type PokemonTypeSlot = {
  slot: number;
  type: {
    name: string;
    url: string;
  };
};

export interface RawPokemonResponse {
  id: number;
  name: string;
  cries: { latest: string };
  sprites: {
    front_default: string;
    back_default: string;
    other?: {
      ['official-artwork']: { front_default: string };
    };
     versions: {
          'generation-v': {
            'black-white': {
              animated: {
                front_default: string;
                back_default: string;
              };
            };
          };
        };
  };
  stats: PokemonStat[];
  types: PokemonTypeSlot[];
}

// --- Fetch Function ---
export interface Move {
  name: string;
  class: string;
  pp: number;
  power: number;
  type: string;
}

interface RawMove{
  move: {
    name: string;
    url: string;
  }
}

export const maxBaseStats: Record<string, number> = {
  hp: 255,
  attack: 190,
  defense: 230,
  "special-attack": 194,
  "special-defense": 230,
  speed: 200
}as const;

export interface PokemonType {
  uid: string;
  acquiredAt: number;
  name: string;
  speciesId: number;
  sprite: string;
  animations: {
    front: string;
    back: string;
  }
  moves: Move[];
  types: string[];
  cry: string;
  stats: Record<string, number>;
  rarity: Rarity;
  cryptoWorth: number;
  history: { ts: number; event: string; deltaWorth: number }[];
  tokenId?: number;
  traderName?: string;
}

export async function getDamageMoves(mon: string | number): Promise<Move[]> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${mon}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon: ${mon}`);


  const data = await res.json();

  const movePromises = data.moves.map(async (item: RawMove) => {
    const moveRes = await fetch(item.move.url);
    if (!moveRes.ok) return null;

    const moveData = await moveRes.json();

    if (moveData.damage_class.name !== 'status' && moveData.power > 0) {
      return {
        name: item.move.name,
        class: moveData.damage_class.name,
        pp: moveData.pp,
        power: moveData.power,
        type: moveData.type.name,
      } as Move;
    }

    return null;
  });

  const allMoves = await Promise.all(movePromises);
  const damageMoves = allMoves.filter((move): move is Move => move !== null);

  if (damageMoves.length === 0) return [];

  const monMove: Move[] = [];
  const maxMoves = Math.min(4, damageMoves.length);
  while (monMove.length < maxMoves) {
    const randomMove = damageMoves[Math.floor(Math.random() * damageMoves.length)];
    if (!monMove.includes(randomMove)) {
      monMove.push(randomMove);
    }
  }

  return monMove;
}

function getRarityMultiplier(rarity: Rarity) {
  switch (rarity) {
    case "EX": return 10;
    case "Ultra-Rare": return 5;
    case "Rare": return 2.5;
    case "Uncommon": return 1.5;
    default: return 1;
  }
}

const cumulative = (function buildCumulative() {
  const total = TIERS.reduce((s, t) => s + t.weight, 0);
  let sum = 0;
  return TIERS.map((t) => {
    sum += t.weight / total;
    return { ...t, cum: Math.min(1, sum) };
  });
})();

function weightedPickTier(rand = Math.random()) {
  for (const t of cumulative) {
    if (rand <= t.cum) return t;
  }
  return cumulative[cumulative.length - 1];
}

export async function fetchPokemonData(nameOrId?: string): Promise<PokemonType> {
  const random = Math.random();
  const tier = weightedPickTier(random);
  const list = tier.pokemon;
  const pick = list[Math.floor(Math.random() * list.length)];

  const name = nameOrId ?? String(pick).toLowerCase();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

  if (!res.ok) throw new Error("Pokemon not found");

  const data: RawPokemonResponse = await res.json();

  const stats = Object.fromEntries(
    data.stats.map((s) => {
      if(s.stat.name === 'hp') return [s.stat.name, s.base_stat + 60];
      return[s.stat.name, s.base_stat + 5]
    })
  );

  const moves = await getDamageMoves(name);
  const types = data.types.map(t => t.type.name);

  const sumStats = (Object.values(stats) as number[]).reduce((a, b) => a + b, 0);
  const multiplier = getRarityMultiplier(tier.name);
  const cryptoWorth = Math.max(1, Math.round((sumStats / 10) * multiplier));
  
  return {
    uid: Date.now() + "-" + Math.floor(Math.random() * 10000),
    speciesId: data.id,
    acquiredAt: Date.now(),
    name: data.name,
    sprite:
      data.sprites.other?.["official-artwork"]?.front_default ??
      data.sprites.front_default,
    animations: {
      front: data.sprites.versions['generation-v']['black-white'].animated.front_default 
        || data.sprites.front_default,
      back: data.sprites.versions['generation-v']['black-white'].animated.back_default 
        || data.sprites.back_default,
    },
    moves,
    rarity: tier.name,
    stats,
    types,
    cry: data.cries.latest,
    cryptoWorth,
    history: [
      { ts: Date.now(), event: `Pulled (${tier.name})`, deltaWorth: cryptoWorth }
    ],
  };
}
// --- Game Logic Types ---

export const PULL_COST = 55 as const;

export type Rarity = 'Common' | 'Uncommon' | 'Rare' | 'Ultra-Rare' | 'EX';
export const rarityBadges = [
  {text: 'Common', color: '#fff'},
  {text: 'Uncommon', color: '#22c55e'},
  {text: 'Rare', color: '#f87316'},
  {text: 'Ultra-Rare', color: '#ec4899'},
  {text: 'EX', color: '#ef4444'},
] as const;


//localstorage n shih

//monsters 
const STORAGE_KEY_MONSTERS = "cmc_monsters_v1";
const STORAGE_KEY_WALLET = "cmc_wallet_v1";
type Address = `0x${string}`;

export function loadMonstersFromStorage(user: Address): PokemonType[]{
  try {
    const itemKey = `${user}-${STORAGE_KEY_MONSTERS}`
    const raw = localStorage.getItem(itemKey);
    if (!raw) return [];
    const parsedData: PokemonType[] = JSON.parse(raw);
    const filtered = parsedData.filter(item => item.tokenId != null);
    
    return filtered;
  } catch (err) {
    console.error("loadMonstersFromStorage", err);
    return [];
  }
}

export function saveMonstersToStorage(user: Address, monsters: PokemonType[]) {
  try {
    const itemKey = `${user}-${STORAGE_KEY_MONSTERS}`
    localStorage.setItem(itemKey, JSON.stringify(monsters));
  } catch (err) {
    console.error("saveMonstersToStorage", err);
  }
}

//wallet part

export const INITIAL_TOKENS = 5000;

interface WalletHistory {
  ts: number;
  type: "credit" | "debit";
  amount: number;
  note: string;
}

export interface WalletType {
  balance: number;
  history: WalletHistory[];
}

export function loadWalletFromStorage(user: Address) {
  try {
    const walletKey = `${user}-${STORAGE_KEY_WALLET}`
    const raw = localStorage.getItem(walletKey);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("loadWalletFromStorage", err);
    return null;
  }
}

export function saveWalletToStorage(user: Address, wallet: WalletType) {
  try {
    const walletKey = `${user}-${STORAGE_KEY_WALLET}`
    localStorage.setItem(walletKey, JSON.stringify(wallet));
  } catch (err) {
    console.error("saveWalletToStorage", err);
  }
}

// --- PVP ---
