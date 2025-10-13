export const TIERS = [
  { name: "EX", weight: 0.003, pokemon: ["mew"] },

  {
    name: "Ultra-Rare",
    weight: 0.02,
    pokemon: [
      // Gen4
      "dialga","palkia","giratina","uxie","mesprit","azelf","heatran","regigigas","cresselia","phione","manaphy","darkrai","shaymin","arceus",
      // Gen5
      "victini","cobalion","terrakion","virizion","tornadus","thundurus","landorus","reshiram","zekrom","kyurem","keldeo","meloetta","genesect"
    ],
  },

  {
    name: "Rare",
    weight: 0.06,
    pokemon: [
      "zapdos","dragonite",
      // Gen2 legendaries
      "raikou","entei","suicune","lugia","ho-oh","celebi",
      // Gen3 legendaries (Hoenn)
      "regirock","regice","registeel","latias","latios","kyogre","groudon","rayquaza","jirachi","deoxys"
    ],
  },

  {
    name: "Uncommon",
    weight: 0.1887,
    pokemon: [
      "lapras","ninetales",
      // Gen6 & Gen7 pseudo-legendary entries (kept as previously requested)
      "goodra","kommo-o"
    ],
  },

  // Expanded Common pool with the requested selections (no megas, non-legends, no pseudo-legendaries)
  {
    name: "Common",
    weight: 0.7283, // adjusted so total ≈ 1 (weights normalized later)
    pokemon: [
      // original commons
      "pikachu","pidgeot","gengar","alakazam",
      // 20 Gen 4 picks (Sinnoh) - non-legendary, non-pseudo
      "turtwig","grotle","torterra","chimchar","monferno","infernape","piplup","prinplup","empoleon","starly",
      "staravia","staraptor","bidoof","bibarel","kricketot","kricketune","shinx","luxio","luxray","budew",
      // 15 Gen 6 picks (Kalos) - non-legendary, non-pseudo
      "chespin","quilladin","chesnaught","fennekin","braixen","delphox","froakie","frogadier","greninja","fletchling",
      "fletchinder","talonflame","scatterbug","spewpa","vivillon",
      // 10 Gen 3 picks (Hoenn) - non-legendary, non-pseudo
      "treecko","grovyle","sceptile","torchic","combusken","blaziken","mudkip","marshtomp","swampert","breloom"
    ],
  },
] as const;

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
    other?: {
      ['official-artwork']: { front_default: string };
    };
  };
  stats: PokemonStat[];
  types: PokemonTypeSlot[];
}

// --- Fetch Function ---

export async function fetchPokemonData(nameOrId: string | number) {
  const name = String(nameOrId).toLowerCase();
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);

  if (!res.ok) throw new Error("Pokemon not found");

  const data: RawPokemonResponse = await res.json();

  const stats = Object.fromEntries(
    data.stats.map((s,i) => {
      if(i === 0) return [s.stat.name, s.base_stat + 60];
      return[s.stat.name, s.base_stat + 5]
    })
  );

  const types = data.types.map(t => t.type.name);

  return {
    id: data.id,
    name: data.name,
    sprite:
      data.sprites.other?.["official-artwork"]?.front_default ??
      data.sprites.front_default,
    stats,
    types,
    cry: data.cries.latest,
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

export interface PokemonType {
  uid: string;
  acquiredAt: number;
  name: string;
  speciesId: number;
  sprite: string;
  types: string[];
  cry: string;
  baseStats: Record<string, number>;
  stats: Record<string, number>;
  rarity: Rarity;
  cryptoWorth: number;
  history: { ts: number; event: string; deltaWorth: number }[];
}

export const maxBaseStats: Record<string, number> = {
  hp: 255,
  attack: 190,
  defense: 230,
  "special-attack": 194,
  "special-defense": 230,
  speed: 200
}as const;

//localstorage n shih

//monsters 
const STORAGE_KEY_MONSTERS = "cmc_monsters_v1";
const STORAGE_KEY_WALLET = "cmc_wallet_v1";

export function loadMonstersFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MONSTERS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("loadMonstersFromStorage", err);
    return [];
  }
}

export function saveMonstersToStorage(monsters: PokemonType[]) {
  try {
    localStorage.setItem(STORAGE_KEY_MONSTERS, JSON.stringify(monsters));
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

export interface Wallet {
  balance: number;
  history: WalletHistory[];
}

export function loadWalletFromStorage() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_WALLET);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (err) {
    console.error("loadWalletFromStorage", err);
    return null;
  }
}

export function saveWalletToStorage(wallet: Wallet) {
  try {
    localStorage.setItem(STORAGE_KEY_WALLET, JSON.stringify(wallet));
  } catch (err) {
    console.error("saveWalletToStorage", err);
  }
}

// --- PVP ---
export interface Move {
  name: string;
  class: string;
  pp: number;
  power: number;
  type: string;
}

export interface BattleMonType {
  name: string;
  cry: string;
  types: string[];
  moves: Move[];
  sprites: {
    front: string;
    back: string;
  };
  stats: Record<string, number>;
}

export async function getDamageMoves(mon: string | number): Promise<Move[]> {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${mon}`);
  if (!res.ok) throw new Error(`Failed to fetch Pokémon: ${mon}`);

  const data = await res.json();

  const movePromises = data.moves.map(async (item: any) => {
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
  while (monMove.length < 4) {
    const randomMove = damageMoves[Math.floor(Math.random() * damageMoves.length)];
    if (!monMove.includes(randomMove)) {
      monMove.push(randomMove);
    }
  }

  return monMove;
}

export async function fetchBattleMon(name: string): Promise<BattleMonType | undefined> {
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${name}`);
    if (!res.ok) throw new Error(`Failed to fetch Pokémon: ${name}`);
    const data = await res.json();

    const moves = await getDamageMoves(name);
    const types = data.types.map(t => t.type.name);

    return {
      name: data.name,
      cry: data.cries.latest,
      types,
      moves,
      sprites: {
        front: data.sprites.versions['generation-v']['black-white'].animated.front_default || data.sprites.front_default,
        back: data.sprites.versions['generation-v']['black-white'].animated.back_default || data.sprites.back_default,
      },
      stats: data.stats.reduce((acc: Record<string, number>, stat: any, index: number) => {
        const base = stat.base_stat;
        acc[stat.stat.name] = index === 0 ? base + 60 : base + 5;
        return acc;
      }, {}),
    };
  } catch (err) {
    console.error("Error while fetching Pokémon:", err);
    return undefined;
  }
}

