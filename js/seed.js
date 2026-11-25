// Demo data for LocalKart. Vendors, phone numbers, ratings and reviews are made up
// for the demo. The neighbourhood is Mylapore, Chennai; map positions are approximate.

const CATS = {
  veg:     { en: 'Vegetables',       ta: 'காய்கறி' },
  fruit:   { en: 'Fruits',           ta: 'பழங்கள்' },
  flower:  { en: 'Flowers',          ta: 'பூக்கள்' },
  snack:   { en: 'Snacks',           ta: 'தின்பண்டம்' },
  grocery: { en: 'Groceries',        ta: 'மளிகை' },
  daily:   { en: 'Daily essentials', ta: 'அன்றாடத் தேவை' }
};

// step = how much one tap of + adds. kg goes in quarter kilos, like at the cart.
const UNITS = {
  kg:     { en: 'kg',     ta: 'கிலோ',    step: 0.25, low: 3 },
  g100:   { en: '100 g',  ta: '100 கி',  step: 1,    low: 5 },
  piece:  { en: 'piece',  ta: 'எண்',     step: 1,    low: 6 },
  bunch:  { en: 'bunch',  ta: 'கட்டு',   step: 1,    low: 5 },
  dozen:  { en: 'dozen',  ta: 'டஜன்',    step: 1,    low: 3 },
  muzham: { en: 'muzham', ta: 'முழம்',   step: 1,    low: 5 },
  packet: { en: 'packet', ta: 'பாக்கெட்', step: 1,    low: 5 },
  litre:  { en: 'litre',  ta: 'லிட்டர்', step: 0.5,  low: 3 },
  cup:    { en: 'cup',    ta: 'கப்',     step: 1,    low: 5 }
};

// Things street vendors here commonly sell. "alias" is what people actually type.
const CATALOG = {
  tomato:      { en: 'Tomato', ta: 'தக்காளி', cat: 'veg', unit: 'kg', alias: 'thakkali takkali tamatar tomatoes' },
  onion:       { en: 'Onion', ta: 'பெரிய வெங்காயம்', cat: 'veg', unit: 'kg', alias: 'vengayam venkayam periya pyaz onions' },
  shallot:     { en: 'Small onion', ta: 'சின்ன வெங்காயம்', cat: 'veg', unit: 'kg', alias: 'chinna vengayam sambar onion shallots' },
  potato:      { en: 'Potato', ta: 'உருளைக்கிழங்கு', cat: 'veg', unit: 'kg', alias: 'urulai urulaikizhangu aloo potatoes' },
  brinjal:     { en: 'Brinjal', ta: 'கத்தரிக்காய்', cat: 'veg', unit: 'kg', alias: 'kathirikai kathrikai eggplant baingan' },
  okra:        { en: "Ladies' finger", ta: 'வெண்டைக்காய்', cat: 'veg', unit: 'kg', alias: 'vendakkai vendaikai okra bhindi ladies finger' },
  drumstick:   { en: 'Drumstick', ta: 'முருங்கைக்காய்', cat: 'veg', unit: 'piece', alias: 'murungakkai murungai moringa' },
  carrot:      { en: 'Carrot', ta: 'கேரட்', cat: 'veg', unit: 'kg', alias: 'gajar carrots' },
  beans:       { en: 'Beans', ta: 'பீன்ஸ்', cat: 'veg', unit: 'kg', alias: 'beans avarai' },
  cabbage:     { en: 'Cabbage', ta: 'முட்டைக்கோஸ்', cat: 'veg', unit: 'kg', alias: 'muttaikose kose' },
  chilli:      { en: 'Green chilli', ta: 'பச்சை மிளகாய்', cat: 'veg', unit: 'g100', alias: 'pachai milagai milagai mirchi chillies' },
  ginger:      { en: 'Ginger', ta: 'இஞ்சி', cat: 'veg', unit: 'g100', alias: 'inji adrak' },
  garlic:      { en: 'Garlic', ta: 'பூண்டு', cat: 'veg', unit: 'g100', alias: 'poondu lahsun' },
  coriander:   { en: 'Coriander', ta: 'கொத்தமல்லி', cat: 'veg', unit: 'bunch', alias: 'kothamalli malli dhania cilantro' },
  curry:       { en: 'Curry leaves', ta: 'கறிவேப்பிலை', cat: 'veg', unit: 'bunch', alias: 'karuveppilai kariveppilai curry leaf' },
  mint:        { en: 'Mint', ta: 'புதினா', cat: 'veg', unit: 'bunch', alias: 'pudina pudhina' },
  keerai:      { en: 'Arai keerai', ta: 'அரைக்கீரை', cat: 'veg', unit: 'bunch', alias: 'keerai spinach palak greens' },
  murungai:    { en: 'Drumstick leaves', ta: 'முருங்கைக் கீரை', cat: 'veg', unit: 'bunch', alias: 'murungai keerai moringa leaves' },
  lemon:       { en: 'Lemon', ta: 'எலுமிச்சை', cat: 'veg', unit: 'piece', alias: 'elumichai nimbu lime' },
  banana:      { en: 'Banana (poovan)', ta: 'பூவன் பழம்', cat: 'fruit', unit: 'dozen', alias: 'vazhaipazham vazhai poovan bananas' },
  guava:       { en: 'Guava', ta: 'கொய்யா', cat: 'fruit', unit: 'kg', alias: 'koyya koyyapazham amrood' },
  pomegranate: { en: 'Pomegranate', ta: 'மாதுளை', cat: 'fruit', unit: 'kg', alias: 'mathulai anar' },
  papaya:      { en: 'Papaya', ta: 'பப்பாளி', cat: 'fruit', unit: 'piece', alias: 'pappali papita' },
  sapota:      { en: 'Sapota', ta: 'சப்போட்டா', cat: 'fruit', unit: 'kg', alias: 'chikoo sapota' },
  orange:      { en: 'Orange', ta: 'ஆரஞ்சு', cat: 'fruit', unit: 'kg', alias: 'oranges kamala' },
  apple:       { en: 'Apple', ta: 'ஆப்பிள்', cat: 'fruit', unit: 'kg', alias: 'apples seb' },
  ilaneer:     { en: 'Tender coconut', ta: 'இளநீர்', cat: 'fruit', unit: 'piece', alias: 'ilaneer elaneer nariyal pani' },
  coconut:     { en: 'Coconut', ta: 'தேங்காய்', cat: 'grocery', unit: 'piece', alias: 'thengai thenga nariyal' },
  jaggery:     { en: 'Jaggery', ta: 'வெல்லம்', cat: 'grocery', unit: 'kg', alias: 'vellam gud' },
  tamarind:    { en: 'Tamarind', ta: 'புளி', cat: 'grocery', unit: 'kg', alias: 'puli imli' },
  jasmine:     { en: 'Jasmine (malli)', ta: 'மல்லிகைப் பூ', cat: 'flower', unit: 'muzham', alias: 'malli mallipoo mallikai jasmine gajra' },
  kanakambaram:{ en: 'Kanakambaram', ta: 'கனகாம்பரம்', cat: 'flower', unit: 'muzham', alias: 'kanakambaram crossandra' },
  marigold:    { en: 'Marigold', ta: 'சாமந்திப் பூ', cat: 'flower', unit: 'g100', alias: 'samanthi marigold genda' },
  rose:        { en: 'Rose', ta: 'ரோஜா', cat: 'flower', unit: 'piece', alias: 'roja roses gulab' },
  garland:     { en: 'Flower garland', ta: 'பூ மாலை', cat: 'flower', unit: 'piece', alias: 'maalai malai garland haar' },
  lotus:       { en: 'Lotus', ta: 'தாமரை', cat: 'flower', unit: 'piece', alias: 'thamarai kamal' },
  sundal:      { en: 'Sundal', ta: 'சுண்டல்', cat: 'snack', unit: 'cup', alias: 'sundal chana chickpea' },
  bajji:       { en: 'Bajji', ta: 'பஜ்ஜி', cat: 'snack', unit: 'piece', alias: 'bajji bhaji pakoda' },
  murukku:     { en: 'Murukku', ta: 'முறுக்கு', cat: 'snack', unit: 'packet', alias: 'murukku chakli' },
  peanuts:     { en: 'Roasted peanuts', ta: 'வறுத்த கடலை', cat: 'snack', unit: 'packet', alias: 'kadalai verkadalai groundnut peanut' },
  milk:        { en: 'Milk, 500 ml', ta: 'பால் பாக்கெட்', cat: 'daily', unit: 'packet', alias: 'paal milk' },
  curd:        { en: 'Curd, 500 g', ta: 'தயிர்', cat: 'daily', unit: 'packet', alias: 'thayir dahi curd yogurt' },
  eggs:        { en: 'Eggs', ta: 'முட்டை', cat: 'daily', unit: 'piece', alias: 'muttai egg anda' },
  bread:       { en: 'Bread', ta: 'ரொட்டி', cat: 'daily', unit: 'packet', alias: 'bread rotti' },
  agarbathi:   { en: 'Agarbathi', ta: 'ஊதுபத்தி', cat: 'daily', unit: 'packet', alias: 'oodhubathi agarbatti incense' },
  camphor:     { en: 'Camphor', ta: 'கற்பூரம்', cat: 'daily', unit: 'packet', alias: 'karpooram kapoor' },
  // Kitchen and home staples: what a household runs out of in the week.
  rice:        { en: 'Rice (ponni)', ta: 'பொன்னி அரிசி', cat: 'daily', unit: 'kg', alias: 'arisi ponni rice chawal' },
  toordal:     { en: 'Toor dal', ta: 'துவரம் பருப்பு', cat: 'daily', unit: 'kg', alias: 'thuvaram paruppu paruppu toor dal arhar dal' },
  atta:        { en: 'Wheat flour (atta)', ta: 'கோதுமை மாவு', cat: 'daily', unit: 'kg', alias: 'kothumai maavu gothumai atta wheat flour' },
  oil:         { en: 'Groundnut oil', ta: 'கடலெண்ணெய்', cat: 'daily', unit: 'litre', alias: 'kadalai ennai kadalennai cooking oil groundnut oil' },
  sugar:       { en: 'Sugar', ta: 'சர்க்கரை', cat: 'daily', unit: 'kg', alias: 'sakkarai chini sugar' },
  salt:        { en: 'Salt', ta: 'உப்பு', cat: 'daily', unit: 'kg', alias: 'uppu namak salt' },
  tea:         { en: 'Tea powder', ta: 'தேயிலைத் தூள்', cat: 'daily', unit: 'packet', alias: 'tea theyilai thool chai' },
  coffee:      { en: 'Filter coffee powder', ta: 'காபித் தூள்', cat: 'daily', unit: 'packet', alias: 'kaapi kapi coffee filter kaapi thool' },
  soap:        { en: 'Bath soap', ta: 'குளியல் சோப்பு', cat: 'daily', unit: 'piece', alias: 'soap sabun bath soap' },
  detergent:   { en: 'Detergent powder', ta: 'சலவைத் தூள்', cat: 'daily', unit: 'packet', alias: 'thuni sopu washing powder detergent surf' },
  toothpaste:  { en: 'Toothpaste', ta: 'பற்பசை', cat: 'daily', unit: 'piece', alias: 'pal podi paste toothpaste' }
};

// Rough street price for each catalogue item (₹ per its unit). Used as a vendor's
// starting price and as the base for wholesale quotes.
const REF = { tomato: 40, onion: 42, shallot: 68, potato: 37, brinjal: 45, okra: 48, drumstick: 8, carrot: 58, beans: 70, cabbage: 30,
  chilli: 7, ginger: 16, garlic: 30, coriander: 9, curry: 5, mint: 10, keerai: 15, murungai: 20, lemon: 5, banana: 60, guava: 80,
  pomegranate: 180, papaya: 50, sapota: 90, orange: 100, apple: 200, ilaneer: 50, coconut: 34, jaggery: 70, tamarind: 180, jasmine: 30,
  kanakambaram: 25, marigold: 20, rose: 10, garland: 120, lotus: 15, sundal: 20, bajji: 10, murukku: 38, peanuts: 20, milk: 27,
  curd: 30, eggs: 7, bread: 45, agarbathi: 30, camphor: 20,
  rice: 62, toordal: 165, atta: 48, oil: 180, sugar: 46, salt: 20, tea: 125, coffee: 105, soap: 36, detergent: 62, toothpaste: 78 };

// Won't keep till tomorrow: bought fresh every morning, and what evening clearance applies to.
const PERISHABLE = new Set(['tomato', 'okra', 'beans', 'coriander', 'curry', 'mint', 'keerai', 'murungai', 'banana', 'guava', 'papaya',
  'sapota', 'jasmine', 'kanakambaram', 'marigold', 'rose', 'garland', 'lotus', 'sundal', 'bajji', 'bread', 'curd', 'milk']);
const MADE_AT_STALL = new Set(['sundal', 'bajji']);   // cooked by the vendor, not bought wholesale
const FESTIVE = new Set(['jasmine', 'kanakambaram', 'marigold', 'rose', 'garland', 'lotus', 'banana', 'coconut', 'ilaneer']);

// Wholesale traders where street vendors buy. "factor" = their price as a share of the street price.
// Small-lot traders charge a bit more; big-lot traders are cheaper per kg but sell only by the crate or bag.
const VEG = ['tomato', 'onion', 'shallot', 'potato', 'brinjal', 'okra', 'drumstick', 'carrot', 'beans', 'cabbage', 'chilli', 'ginger', 'garlic', 'lemon'];
const TRADERS = [
  { id: 'kannan', name: 'Kannan Traders', area: 'Koyambedu market, A block', hours: '3–9 am', factor: 0.72, lots: 'small', types: [...VEG, 'coriander'] },
  { id: 'velu', name: 'Sri Velu & Sons', area: 'Koyambedu market, B block', hours: '2–8 am', factor: 0.62, lots: 'big', types: VEG },
  { id: 'pasumai', name: 'Pasumai Greens', area: 'Mylapore market, near the tank', hours: '4–9 am', factor: 0.6, lots: 'small', types: ['keerai', 'murungai', 'coriander', 'curry', 'mint', 'lemon', 'chilli'] },
  { id: 'saravana', name: 'Saravana Flower Mandi', area: 'Koyambedu flower market', hours: '3–8 am', factor: 0.55, lots: 'small', types: ['jasmine', 'kanakambaram', 'marigold', 'rose', 'garland', 'lotus'] },
  { id: 'rahim', name: 'Rahim Fruit Commission', area: 'Koyambedu fruit market', hours: '4–10 am', factor: 0.6, lots: 'big', types: ['banana', 'guava', 'pomegranate', 'papaya', 'sapota', 'orange', 'apple', 'ilaneer', 'coconut'] },
  { id: 'anand', name: 'Anand Fruit Stores', area: 'Mylapore, Bazaar Road', hours: '6 am – 8 pm', factor: 0.7, lots: 'small', types: ['banana', 'guava', 'papaya', 'sapota', 'orange', 'apple', 'coconut'] },
  { id: 'ganapathy', name: 'Ganapathy Wholesale', area: 'Parrys, Godown Street', hours: '9 am – 7 pm', factor: 0.76, lots: 'big', types: ['jaggery', 'tamarind', 'agarbathi', 'camphor', 'murukku', 'peanuts', 'rice', 'toordal', 'atta', 'oil', 'sugar', 'salt', 'tea', 'coffee', 'soap', 'detergent', 'toothpaste'] },
  { id: 'sakthi', name: 'Sakthi Milk Agency', area: 'Mylapore depot', hours: '4–7 am', factor: 0.85, lots: 'small', types: ['milk', 'curd', 'eggs', 'bread'] }
];
// Smallest amount each kind of trader sells, in the vendor's own unit.
const LOTS = { kg: [5, 15], g100: [10, 30], piece: [10, 50], bunch: [10, 25], dozen: [2, 5], muzham: [20, 60], packet: [6, 24], litre: [5, 20], cup: [10, 10] };
const BIG_BAG = { onion: 25, potato: 25 };

const PLACES = {
  home:   { en: 'Home · Kutchery Road', ta: 'வீடு · கச்சேரி சாலை', x: 180, y: 220 },
  office: { en: 'Office · Luz Corner',  ta: 'அலுவலகம் · லஸ் கார்னர்', x: 250, y: 140 }
};

function seedVendors() {
  // [type, price, stock, freshness note]
  const v = (o, items) => Object.assign({ open: true, delivery: null, photo: null, reviews: [], since: 2015, clear: 0, upi: o.id + '.cart@upi', traders: [] }, o, {
    items: items.map(([type, price, stock, fresh]) => ({ type, price, stock, fresh: fresh || '' }))
  });
  return [
    v({ id: 'selvi', owner: 'Selvi Murugan', shop: 'Selvi Vegetables', shopTa: 'செல்வி காய்கறி', cat: 'veg',
        spot: 'Kutchery Road, opposite the bus stop', x: 198, y: 252, phone: '90000 10101',
        rating: 4.6, nrating: 128, hours: '6–11 am, 4–9 pm', delivery: { fee: 10, km: 1 }, prep: 10, since: 2011, traders: ['kannan'],
        reviews: [['Meena', 5, 'Always keeps aside a kilo of tomatoes if I call in the morning.'],
                  ['Arun', 4, 'Good prices. Gets crowded after 6 pm.']] },
      [['tomato', 40, 14, 'From Koyambedu this morning'], ['onion', 45, 2.5], ['potato', 38, 12], ['brinjal', 48, 6, 'Picked this morning'],
       ['okra', 50, 5], ['drumstick', 8, 30], ['carrot', 60, 4], ['chilli', 8, 20], ['coriander', 10, 15], ['shallot', 72, 4]]),
    v({ id: 'anbu', owner: 'Anbazhagan', shop: 'Anbu Vegetables', shopTa: 'அன்பு காய்கறி', cat: 'veg',
        spot: 'Mandaveli market, inside gate 2', x: 390, y: 330, phone: '90000 10202',
        rating: 4.2, nrating: 64, hours: '5 am – 1 pm', prep: 15, since: 2008,
        reviews: [['Suresh', 4, 'Cheapest in the area, but a bit of a walk.']] },
      [['tomato', 38, 40], ['onion', 42, 30], ['potato', 35, 25], ['cabbage', 30, 10], ['beans', 70, 6], ['carrot', 55, 8]]),
    v({ id: 'murugan', owner: 'Murugan K', shop: 'Murugan Onion Stall', shopTa: 'முருகன் வெங்காயக் கடை', cat: 'veg',
        spot: 'Luz Church Road, next to the medical shop', x: 120, y: 165, phone: '90000 10303',
        rating: 4.4, nrating: 92, hours: '7 am – 9 pm', delivery: { fee: 15, km: 1.5 }, prep: 10, since: 2016,
        reviews: [['Divya', 5, 'Small onions are always good quality here.']] },
      [['tomato', 44, 2], ['onion', 40, 25], ['shallot', 65, 10], ['potato', 40, 15], ['garlic', 30, 20], ['ginger', 16, 15]]),
    v({ id: 'ganesh', owner: 'Ganesh R', shop: 'Ganesh Vegetables', shopTa: 'கணேஷ் காய்கறி', cat: 'veg',
        spot: 'R K Mutt Road, corner of 4th Street', x: 280, y: 320, phone: '90000 10404',
        rating: 4.3, nrating: 51, hours: '6 am – 12 pm, 5 – 9 pm', prep: 10, since: 2019 },
      [['tomato', 42, 0], ['brinjal', 40, 8], ['okra', 46, 6], ['drumstick', 7, 25], ['beans', 68, 5], ['lemon', 5, 40]]),
    v({ id: 'lakshmi', owner: 'Lakshmi Ammal', shop: 'Lakshmi Flowers', shopTa: 'லட்சுமி பூக்கடை', cat: 'flower',
        spot: 'East Mada Street, by the temple gate', x: 235, y: 128, phone: '90000 10505',
        rating: 4.8, nrating: 210, hours: '5 am – 9 pm', prep: 5, since: 1998,
        reviews: [['Revathi', 5, 'Strings the jasmine tight. Lasts till night.'], ['Lalitha', 5, 'Makes garlands to order if you tell her a day before.']] },
      [['jasmine', 30, 40, 'Strung this morning'], ['kanakambaram', 25, 20], ['marigold', 20, 30], ['rose', 10, 50], ['garland', 120, 6], ['lotus', 15, 12]]),
    v({ id: 'abdul', owner: 'Abdul Rahim', shop: "Abdul's Fruit Cart", shopTa: 'அப்துல் பழ வண்டி', cat: 'fruit',
        spot: 'Kutchery Road, near the post office', x: 160, y: 300, phone: '90000 10606',
        rating: 4.5, nrating: 77, hours: '8 am – 9 pm', delivery: { fee: 10, km: 1 }, prep: 10, since: 2013 },
      [['banana', 60, 12], ['guava', 80, 6, 'Sweet ones, from Krishnagiri'], ['pomegranate', 180, 5], ['papaya', 50, 8],
       ['sapota', 90, 4], ['orange', 100, 7], ['apple', 200, 5]]),
    v({ id: 'kumar', owner: 'Kumar S', shop: 'Kumar Ilaneer', shopTa: 'குமார் இளநீர்', cat: 'fruit',
        spot: 'Royapettah High Road, under the gulmohar tree', x: 100, y: 262, phone: '90000 10707',
        rating: 4.7, nrating: 143, hours: '9 am – 7 pm', prep: 5, since: 2010 },
      [['ilaneer', 50, 35], ['coconut', 35, 30]]),
    v({ id: 'devi', owner: 'Devi P', shop: 'Devi Keerai Kadai', shopTa: 'தேவி கீரைக் கடை', cat: 'veg',
        spot: 'Kutchery Road, near the ration shop', x: 200, y: 205, phone: '90000 10808',
        rating: 4.6, nrating: 88, hours: '6 – 11 am', prep: 5, since: 2017, clear: 20 },
      [['keerai', 15, 20, 'Cut this morning'], ['murungai', 20, 10, 'Cut this morning'], ['coriander', 8, 25], ['curry', 5, 30],
       ['mint', 10, 15], ['lemon', 4, 50], ['chilli', 6, 15]]),
    v({ id: 'raju', owner: 'Raju M', shop: 'Raju Sundal Kadai', shopTa: 'ராஜு சுண்டல் கடை', cat: 'snack',
        spot: 'Santhome beach road, evenings only', x: 395, y: 205, phone: '90000 10909', open: false,
        rating: 4.4, nrating: 60, hours: '4 – 9 pm', prep: 5, since: 2012 },
      [['sundal', 20, 40], ['bajji', 10, 60], ['murukku', 40, 10], ['peanuts', 20, 30]]),
    v({ id: 'fathima', owner: 'Fathima Begum', shop: 'Fathima Daily Needs', shopTa: 'பாத்திமா அன்றாடக் கடை', cat: 'daily',
        spot: 'Kutchery Road, 2nd lane corner', x: 170, y: 195, phone: '90000 11010',
        rating: 4.5, nrating: 101, hours: '5:30 am – 10 pm', delivery: { fee: 0, km: 0.5 }, prep: 5, since: 2009 },
      [['milk', 27, 30], ['curd', 30, 12], ['eggs', 7, 60], ['bread', 45, 8], ['murukku', 35, 12], ['agarbathi', 30, 15],
       ['camphor', 20, 20], ['jaggery', 70, 5], ['tamarind', 180, 4], ['coconut', 32, 15],
       ['rice', 62, 20], ['tea', 125, 12], ['oil', 185, 8], ['sugar', 48, 15], ['soap', 36, 25], ['toothpaste', 78, 10]]),
    v({ id: 'kamakshi', owner: 'Kamakshi S', shop: 'Kamakshi Flower Stall', shopTa: 'காமாட்சி பூக்கடை', cat: 'flower',
        spot: 'West Mada Street, past the Luz junction', x: 150, y: 128, phone: '90000 11111',
        rating: 4.5, nrating: 74, hours: '5:30 am – 8 pm', prep: 5, since: 2018,
        reviews: [['Nisha', 5, 'Fresh marigold every morning, and the garlands are neat.']] },
      [['jasmine', 32, 25, 'Strung at 5 am'], ['marigold', 22, 40], ['rose', 12, 30], ['kanakambaram', 28, 8], ['garland', 110, 4]]),
    v({ id: 'shanthi', owner: 'Shanthi Kumar', shop: 'Shanthi Provisions', shopTa: 'சாந்தி மளிகைக் கடை', cat: 'daily',
        spot: 'Bazaar Road, opposite the tank steps', x: 330, y: 255, phone: '90000 11212',
        rating: 4.3, nrating: 58, hours: '7 am – 9:30 pm', delivery: { fee: 15, km: 1 }, prep: 5, since: 2014 },
      [['jaggery', 68, 8], ['tamarind', 176, 6], ['peanuts', 22, 20], ['coconut', 36, 12], ['agarbathi', 28, 25], ['camphor', 19, 18], ['eggs', 7, 40],
       ['toordal', 168, 10], ['atta', 50, 12], ['coffee', 108, 10], ['detergent', 64, 14], ['salt', 22, 20], ['rice', 60, 20], ['oil', 178, 6]]),
    v({ id: 'kamala', owner: 'Kamala Vijay', shop: 'Kamala Sundal & Bajji', shopTa: 'கமலா சுண்டல் பஜ்ஜி', cat: 'snack',
        spot: 'Kapaleeshwarar tank, north steps', x: 290, y: 240, phone: '90000 11313',
        rating: 4.6, nrating: 96, hours: '4 – 9 pm', prep: 5, since: 2005,
        reviews: [['Bhavani', 5, 'Sundal is still warm at 6 pm. Ask for extra lemon.']] },
      [['sundal', 18, 35, 'Cooked at 3 pm'], ['bajji', 10, 50, 'Fried fresh'], ['murukku', 40, 14], ['peanuts', 20, 25]]),
    v({ id: 'muthu', owner: 'Muthuvelan', shop: 'Muthu Fruit Stall', shopTa: 'முத்து பழக் கடை', cat: 'fruit',
        spot: 'Santhome High Road, by the signal', x: 130, y: 335, phone: '90000 11414',
        rating: 4.4, nrating: 39, hours: '7 am – 8 pm', prep: 10, since: 2019 },
      [['banana', 58, 15, 'Poovan, from Theni'], ['papaya', 45, 6], ['orange', 95, 9], ['guava', 75, 8], ['sapota', 85, 3]])
  ];
}

// Small deterministic random so every reset gives the same history.
function rng(seed) { return () => (seed = (seed * 16807) % 2147483647) / 2147483647; }

const SHOPPERS = ['Karthik', 'Meena', 'Arun', 'Divya', 'Suresh', 'Revathi', 'Lalitha', 'Vignesh', 'Bhavani', 'Rahul', 'Kavya', 'Sundar', 'Nandhini', 'Hari'];

// Sample review texts by category. They're in English for the demo, like the vendor reviews.
const REVIEW_TEXT = {
  veg: ['Fresh and firm, good for the week.', 'Fair price for the weight.', 'Sorted through before weighing. Honest seller.',
    'A few were soft, the rest were good.', 'Good size, hardly any waste.'],
  fruit: ['Sweet and ripe, as promised.', 'Good value for the quantity.', 'A couple were bruised, the rest were fine.',
    'Ripened nicely by the next day.'],
  flower: ['Still fresh by evening.', 'Strung neatly and fragrant.', 'Lasted the whole function.', 'Good price for a big bunch.'],
  snack: ['Still crisp and warm.', 'Enough for two people.', 'Just the right amount of spice.', 'Packed quickly, good value.'],
  daily: ['Sealed and fresh.', 'Same price as the shop, and it saves a trip.', 'Cold when I picked it up.', 'Always in stock when I need it.'],
  grocery: ['Good quality, not too hard.', 'Clean packet, good weight.', 'Fair price for the size.']
};

// Star counts for one product, [1-star … 5-star], and the average from them.
// Better-rated vendors get more 5s. About one product in eight is new, with no reviews yet.
// Uses its own random stream so ratings don't change the order history.
function itemRatings(v, r, cat) {
  if (r() < 0.12) return { rating: 0, nrating: 0, dist: [0, 0, 0, 0, 0], reviews: [] };
  const n = Math.max(4, Math.round(v.nrating * (0.15 + r() * 0.25)));
  const q = Math.min(0.2, Math.max(0, (v.rating - 4.2) * 0.4)) * (0.5 + r() * 0.5);
  const w = [0.04, 0.06, 0.1, 0.3, 0.5 + q];
  const tot = w.reduce((a, b) => a + b, 0);
  const dist = w.map(x => Math.floor((x / tot) * n));
  dist[4] += n - dist.reduce((a, b) => a + b, 0);
  const rating = Math.round((dist.reduce((a, c, i) => a + c * (i + 1), 0) / n) * 10) / 10;
  const texts = REVIEW_TEXT[cat] || REVIEW_TEXT.veg;
  const first = Math.floor(r() * texts.length);
  const reviews = [0, 1].map(k => ({
    name: SHOPPERS[Math.floor(r() * SHOPPERS.length)],
    stars: Math.min(5, Math.max(2, Math.round(rating + (r() - 0.5) * 1.5))),
    text: texts[(first + k) % texts.length]
  }));
  return { rating, nrating: n, dist, reviews };
}

function seed() {
  const now = Date.now();
  const day0 = new Date(); day0.setHours(0, 0, 0, 0);
  const vendors = seedVendors();
  const listings = [];
  let lid = 1;
  const rv = rng(7);   // ratings get their own random stream, so the order history below doesn't change
  vendors.forEach(v => {
    v.items.forEach(it => {
      const c = CATALOG[it.type];
      const rated = itemRatings(v, rv, c.cat);
      listings.push({ id: 'l' + (lid++), vendor: v.id, type: it.type, name: c.en, ta: c.ta, cat: c.cat, unit: c.unit,
        price: it.price, stock: it.stock, available: true, fresh: it.fresh, photo: null, ...rated });
    });
    delete v.items;
    v.reviews = v.reviews.map(([name, stars, text]) => ({ name, stars, text }));
  });

  const orders = [];
  let oid = 2001;
  const r = rng(42);
  const pick = a => a[Math.floor(r() * a.length)];
  const qtyFor = unit => unit === 'kg' ? [0.5, 1, 1, 1.5, 2][Math.floor(r() * 5)] : unit === 'g100' ? 1 + Math.floor(r() * 2) : 1 + Math.floor(r() * 3);

  // How many orders each vendor got per day; index 0 = today so far.
  const volume = { selvi: [9, 11, 8, 10, 9, 12, 7], devi: [5, 6, 5, 7, 4, 6, 5], lakshmi: [7, 9, 8, 10, 8, 11, 9],
                   fathima: [6, 8, 7, 7, 6, 9, 8], abdul: [3, 4, 5, 3, 4, 6, 4], murugan: [4, 5, 4, 6, 5, 4, 5],
                   kamakshi: [6, 7, 6, 8, 6, 9, 7], shanthi: [5, 6, 5, 6, 5, 7, 6], kamala: [4, 5, 4, 5, 4, 6, 5], muthu: [3, 4, 3, 4, 3, 5, 4] };
  Object.entries(volume).forEach(([vid, perDay]) => {
    const mine = listings.filter(l => l.vendor === vid);
    const weightOf = l => ({ tomato: 8, onion: 4, potato: 3, jasmine: 6, milk: 5, keerai: 4, coriander: 2, banana: 3 }[l.type] || 1);
    const bag = mine.flatMap(l => Array(weightOf(l)).fill(l));
    perDay.forEach((n, d) => {
      const start = day0.getTime() - d * 864e5;
      for (let i = 0; i < n; i++) {
        let t;
        if (d === 0) {
          const from = Math.min(start + 6.5 * 36e5, now - 3 * 36e5);
          t = from + ((i + r() * 0.6) / n) * Math.max(6e5, now - 15 * 6e4 - from);
        } else {
          t = start + (6.5 + r() * 14.5) * 36e5;
        }
        const chosen = new Set([pick(bag)]);
        if (r() < 0.6) chosen.add(pick(bag));
        const pot = mine.find(l => l.type === 'potato'), oni = mine.find(l => l.type === 'onion');
        if (pot && oni && [...chosen].includes(pot) && r() < 0.8) chosen.add(oni);
        const items = [...chosen].map(l => ({ lid: l.id, name: l.name, ta: l.ta, unit: l.unit, qty: qtyFor(l.unit), price: l.price }));
        const done = d > 0 || i < n - 1;
        const status = done ? (r() < 0.04 ? 'rejected' : 'completed') : 'preparing';
        orders.push(makeOrder('LK' + (oid++), vid, { name: pick(SHOPPERS), phone: '9000 0' + String(10000 + Math.floor(r() * 89999)) },
          items, r() < 0.2 && vendors.find(v => v.id === vid).delivery ? 'delivery' : 'pickup', status, t));
      }
      // Cash sales at the cart, logged with the quick bill. Most of a street vendor's sales are still walk-ins.
      const walk = Math.round(n * 1.3);
      for (let i = 0; i < walk; i++) {
        const t = d === 0 ? Math.min(now - 5 * 6e4, Math.max(start + 6 * 36e5, now - 12 * 36e5) + ((i + r()) / walk) * Math.max(6e5, Math.min(12 * 36e5, now - start - 6 * 36e5)))
          : start + (6 + r() * 15) * 36e5;
        const chosen = new Set([pick(bag)]);
        if (r() < 0.5) chosen.add(pick(bag));
        const items = [...chosen].map(l => ({ lid: l.id, name: l.name, ta: l.ta, unit: l.unit, qty: qtyFor(l.unit), price: l.price }));
        const o = makeOrder('LK' + (oid++), vid, { name: 'Walk-in' }, items, 'walkin', 'completed', t);
        o.pay = 'cash';
        orders.push(o);
      }
    });
  });

  // Priya's own past orders, so "Buy again" has something in it.
  const L = (vid, type) => listings.find(l => l.vendor === vid && l.type === type);
  const mine = [
    ['selvi', [['tomato', 1], ['onion', 1], ['coriander', 1]], 3],
    ['fathima', [['milk', 2], ['bread', 1]], 2],
    ['lakshmi', [['jasmine', 2]], 1]
  ];
  mine.forEach(([vid, its, daysAgo]) => {
    const items = its.map(([type, qty]) => { const l = L(vid, type); return { lid: l.id, name: l.name, ta: l.ta, unit: l.unit, qty, price: l.price }; });
    orders.push(makeOrder('LK' + (oid++), vid, { ...ME, me: true }, items, 'pickup', 'completed', day0.getTime() - daysAgo * 864e5 + 18.2 * 36e5));
  });

  orders.sort((a, b) => a.at - b.at);
  return {
    v: 7, seedDay: dayKey(now), vendors, listings, orders, nextOrder: oid,
    cart: [], cartMode: {}, pos: [], nextPo: 100, pay: 'stall', place: 'home', favs: ['selvi', 'lakshmi'], purchases: [], festival: false, list: '',
    // The daily basket: what Priya buys every day. Quantities are in each item's own unit.
    basket: [{ type: 'milk', qty: 2 }, { type: 'curd', qty: 1 }, { type: 'bread', qty: 1 }, { type: 'eggs', qty: 6 }, { type: 'tea', qty: 1 }, { type: 'sugar', qty: 1 }],
    notes: [], lang: 'en', easy: false, me: { ...ME }, vendorId: 'selvi', nextListing: lid
  };
}

const ME = { name: 'Priya Raman', phone: '90031 22334' };

function makeOrder(id, vendor, cust, items, mode, status, at) {
  const flow = mode === 'walkin' ? ['completed'] : mode === 'delivery' ? ['placed', 'accepted', 'preparing', 'out', 'completed'] : ['placed', 'accepted', 'preparing', 'ready', 'completed'];
  let hist;
  if (status === 'rejected') hist = [{ s: 'placed', t: at }, { s: 'rejected', t: at + 3e5 }];
  else {
    const upto = flow.indexOf(status);
    hist = flow.slice(0, upto + 1).map((s, i) => ({ s, t: at + i * 4e5 }));
  }
  return { id, vendor, cust, items, mode, fee: 0, pay: 'stall', status, history: hist, at, rated: false };
}

function dayKey(t) { const d = new Date(t); return d.getFullYear() + '-' + (d.getMonth() + 1) + '-' + d.getDate(); }
