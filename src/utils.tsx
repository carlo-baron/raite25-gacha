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
];
