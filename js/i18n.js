// English / Tamil. Same idea as Round 1: English text is the key, Tamil is looked up.
// Anything missing from TA just shows in English, so a gap never breaks a screen.

const t = s => (S && S.lang === 'ta' && TA[s]) || s;
const tf = (s, vars) => t(s).replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? vars[k] : ''));

const ta = () => S && S.lang === 'ta';
const plural = (n, one, many) => n + ' ' + t(n === 1 ? one : many);
const itemName = l => esc(ta() ? (l.ta || l.name) : l.name);
const itemOther = l => esc(ta() ? l.name : (l.ta || ''));
const shopName = v => esc(ta() ? (v.shopTa || v.shop) : v.shop);
const catLabel = c => (CATS[c] ? (ta() ? CATS[c].ta : CATS[c].en) : c);
const unitLabel = u => (UNITS[u] ? (ta() ? UNITS[u].ta : UNITS[u].en) : u);
const unitShort = u => (u === 'piece' && !ta() ? 'pc' : unitLabel(u));
const placeLabel = k => (ta() ? PLACES[k].ta : PLACES[k].en);

const FRAC = { 0.25: '¼', 0.5: '½', 0.75: '¾' };
function qtyLabel(q, unit) {
  q = Math.round(q * 100) / 100;
  if (unit === 'kg' || unit === 'litre') {
    const whole = Math.floor(q), frac = Math.round((q - whole) * 100) / 100;
    const n = FRAC[frac] ? (whole ? whole : '') + FRAC[frac] : String(q);
    return n + ' ' + unitLabel(unit);
  }
  if (unit === 'g100') {
    const g = Math.round(q * 100);
    return g >= 1000 ? (g / 1000) + (ta() ? ' கிலோ' : ' kg') : g + (ta() ? ' கி' : ' g');
  }
  if (ta()) return q + ' ' + unitLabel(unit);
  const plural = { piece: 'pcs', bunch: 'bunches', packet: 'packets', cup: 'cups' };
  return q + ' ' + (q === 1 ? unitLabel(unit) : plural[unit] || unitLabel(unit));
}

function statusLabel(s, mode) {
  return t({ placed: 'Placed', accepted: 'Accepted', preparing: 'Packing', ready: 'Ready for pickup', out: 'On the way',
    completed: 'Completed', rejected: 'Declined', cancelled: 'Cancelled' }[s] || s);
}

const TA = {
  // navigation and common
  'Home': 'முகப்பு', 'Search': 'தேடு', 'Nearby': 'அருகில்', 'Orders': 'ஆர்டர்கள்', 'Cart': 'கூடை', 'Today': 'இன்று',
  'My items': 'என் பொருட்கள்', 'My shop': 'என் கடை', 'Back': 'பின்செல்', 'Close': 'மூடு', 'Main': 'முதன்மை',
  'Customer': 'வாடிக்கையாளர்', 'Vendor': 'வியாபாரி', 'Vendors': 'வியாபாரிகள்', 'Customer app': 'வாடிக்கையாளர் செயலி', 'Vendor app': 'வியாபாரி செயலி',
  'Customer app · {name}': 'வாடிக்கையாளர் செயலி · {name}', 'Vendor app · {shop}': 'வியாபாரி செயலி · {shop}',
  'Switch app': 'செயலியை மாற்று', 'Side by side': 'அருகருகே', 'Change language': 'மொழியை மாற்று', 'Reset': 'மீட்டமை',
  'Demo · sample data': 'டெமோ · மாதிரித் தரவு', 'Something went wrong': 'ஏதோ தவறு நடந்தது', 'This screen could not load.': 'இந்தத் திரை திறக்கவில்லை.',
  'Go back, or reset the demo from the top bar.': 'பின்செல்லுங்கள், அல்லது மேலே உள்ள பட்டியில் டெமோவை மீட்டமையுங்கள்.',
  'Reset the demo?': 'டெமோவை மீட்டமைக்கவா?', 'Cancel': 'ரத்து', 'Demo reset to the starting data': 'டெமோ தொடக்கத் தரவுக்குத் திரும்பியது',
  'Orders, cart and any vendors or items you added go back to the starting sample data.': 'ஆர்டர்கள், கூடை, நீங்கள் சேர்த்த வியாபாரிகள், பொருட்கள் எல்லாம் தொடக்க மாதிரித் தரவுக்குத் திரும்பும்.',
  'Less': 'குறை', 'More': 'கூட்டு', 'Add': 'சேர்', 'Edit': 'மாற்று', 'Save': 'சேமி', 'Saved': 'சேமிக்கப்பட்டது', 'Remove': 'நீக்கு',
  'Switch': 'மாறு', 'Track': 'பார்', 'Done': 'முடிந்தது', 'All': 'அனைத்தும்', 'None': 'எதுவும் இல்லை', 'Off': 'அணைந்துள்ளது',
  'Free': 'இலவசம்', 'free': 'இலவசம்', 'New': 'புதியது', 'You': 'நீங்கள்', 'Map': 'வரைபடம்', 'List': 'பட்டியல்', 'Call': 'அழை',
  'just now': 'இப்போதுதான்', '{n} min ago': '{n} நிமிடம் முன்', '{n} h ago': '{n} மணி நேரம் முன்', 'yesterday': 'நேற்று',
  'Not found': 'கிடைக்கவில்லை', 'Order': 'ஆர்டர்', 'Order {id}': 'ஆர்டர் {id}', 'Order not found.': 'ஆர்டர் கிடைக்கவில்லை.',

  // landing
  'For the carts and stalls on your street': 'உங்கள் தெருவில் உள்ள தள்ளுவண்டிகளுக்கும் கடைகளுக்கும்',
  'See what the vendor at the corner has today, and at what price.': 'முனைக் கடையில் இன்று என்ன இருக்கிறது, என்ன விலை என்று பாருங்கள்.',
  'LocalKart puts street vendors on your phone. Compare the same tomato across nearby carts, order, and pick it up on your way. Vendors run it from a simple app, in Tamil or English.':
    'லோக்கல்கார்ட் தெருவோர வியாபாரிகளை உங்கள் போனுக்குக் கொண்டுவருகிறது. அருகிலுள்ள வண்டிகளில் தக்காளி விலையை ஒப்பிட்டு, ஆர்டர் செய்து, போகும் வழியில் வாங்கிக்கொள்ளுங்கள். வியாபாரிகள் தமிழிலோ ஆங்கிலத்திலோ எளிய செயலியில் நடத்தலாம்.',
  'I’m shopping': 'நான் வாங்க வந்தேன்', 'I sell on the street': 'நான் தெருவில் விற்கிறேன்',
  'New vendor? Register in two minutes': 'புதிய வியாபாரியா? இரண்டு நிமிடத்தில் பதிவு செய்யுங்கள்',
  'See both apps side by side': 'இரண்டு செயலிகளையும் அருகருகே பாருங்கள்',
  'Today’s rate at every cart': 'ஒவ்வொரு வண்டியிலும் இன்றைய விலை',
  'Search “thakkali” and see every vendor nearby who has it, with price, distance and stock.': '“தக்காளி” என்று தேடுங்கள். அது இருக்கும் அருகிலுள்ள எல்லா வியாபாரிகளையும் விலை, தூரம், இருப்புடன் பாருங்கள்.',
  'Best value, not just cheapest': 'மலிவானது மட்டுமல்ல, சிறந்த தேர்வு',
  '₹2 cheaper but 3 km away isn’t a deal. We weigh price, distance, rating and stock, and say why.': '₹2 மலிவு, ஆனால் 3 கி.மீ தூரம் என்றால் லாபமில்லை. விலை, தூரம், மதிப்பீடு, இருப்பு எல்லாவற்றையும் பார்த்து, ஏன் என்றும் சொல்கிறோம்.',
  'Two taps to change a price': 'இரண்டு தட்டலில் விலை மாற்றம்',
  'Vendors get big buttons, +/- for price and stock, and tips from their own sales. No laptop, no shop.': 'வியாபாரிகளுக்குப் பெரிய பொத்தான்கள், விலைக்கும் இருப்புக்கும் +/-, அவர்கள் விற்பனையிலிருந்தே யோசனைகள். லேப்டாப்போ கடையோ தேவையில்லை.',
  'Demo build: ten sample vendors in Mylapore, Chennai. No real payments or deliveries. Everything is saved only in this browser.': 'டெமோ பதிப்பு: சென்னை மயிலாப்பூரில் பத்து மாதிரி வியாபாரிகள். உண்மையான பணப் பரிமாற்றமோ டெலிவரியோ இல்லை. எல்லாம் இந்த பிரவுசரில் மட்டுமே சேமிக்கப்படும்.',

  // customer home
  'Good morning': 'காலை வணக்கம்', 'Good afternoon': 'மதிய வணக்கம்', 'Good evening': 'மாலை வணக்கம்', 'Updates': 'அறிவிப்புகள்',
  'Search tomato, malli, ilaneer…': 'தக்காளி, மல்லி, இளநீர் தேடுங்கள்…', 'Search by voice': 'குரலில் தேடு', 'Popular today': 'இன்று அதிகம் வாங்கியது',
  'What do you need?': 'என்ன வேண்டும்?', 'Vendors near you': 'அருகிலுள்ள வியாபாரிகள்', 'See map': 'வரைபடம்',
  'Buy again': 'மீண்டும் வாங்க', 'Repeat last order': 'கடைசி ஆர்டரை மீண்டும்', 'Fair prices today': 'இன்றைய நியாய விலை',
  'The cheapest cart within 2 km for things several vendors sell.': 'பலர் விற்கும் பொருட்களுக்கு, 2 கி.மீக்குள் மிகக் குறைந்த விலை வண்டி.',
  '₹{n} less than others': 'மற்றவர்களை விட ₹{n} குறைவு', 'Fresh this morning': 'இன்று காலை புதியது',
  'Prices are set by each vendor and change every day.': 'விலையை ஒவ்வொரு வியாபாரியும் தானே நிர்ணயிக்கிறார்; தினமும் மாறும்.',
  'Order from {shop}': '{shop} ஆர்டர்', 'Open now': 'இப்போது திறந்துள்ளது', 'Closed now': 'இப்போது மூடியுள்ளது',
  'In stock': 'இருப்பு உள்ளது', 'Out today': 'இன்று இல்லை', 'Only {q} left': '{q} மட்டுமே உள்ளது', 'Delivers': 'டெலிவரி உண்டு',

  // search
  'Tomato, thakkali, தக்காளி…': 'தக்காளி, thakkali, tomato…', 'Best value': 'சிறந்த தேர்வு', 'Nearest': 'அருகில்', 'Cheapest': 'குறைந்த விலை',
  'In stock only': 'இருப்பு உள்ளவை மட்டும்', 'Within 1 km': '1 கி.மீக்குள்', 'Within 2 km': '2 கி.மீக்குள்', 'Under ₹50': '₹50க்குள்', 'Under ₹100': '₹100க்குள்',
  'Try searching for': 'இவற்றைத் தேடிப் பாருங்கள்',
  'You can type in English, Tamil, or the way you say it — "thakkali", "vengayam", "malli".': 'ஆங்கிலம், தமிழ், அல்லது நீங்கள் சொல்வது போலவே — "thakkali", "vengayam", "malli" — தட்டச்சு செய்யலாம்.',
  '{n} have it · from {p}': '{n} பேரிடம் உள்ளது · {p} முதல்', 'Nobody has it right now': 'இப்போது யாரிடமும் இல்லை',
  'No vendor matches these filters.': 'இந்த வடிகட்டிகளுக்குப் பொருந்தும் வியாபாரி இல்லை.', 'Compare all {n} vendors': '{n} வியாபாரிகளையும் ஒப்பிடு',
  'No one nearby sells “{q}” yet': 'அருகில் யாரும் “{q}” இன்னும் விற்கவில்லை', 'Check the spelling, or try the Tamil name.': 'எழுத்துப்பிழையைப் பாருங்கள், அல்லது தமிழ்ப் பெயரில் தேடுங்கள்.',
  'Listening… say an item, like “tomato”': 'கேட்கிறது… “தக்காளி” போல ஒரு பொருளைச் சொல்லுங்கள்', 'Listening… say the item in Tamil': 'கேட்கிறது… பொருளின் பெயரைத் தமிழில் சொல்லுங்கள்',
  'Voice search needs Chrome or Edge. You can type instead.': 'குரல் தேடலுக்கு Chrome அல்லது Edge தேவை. தட்டச்சு செய்யலாம்.',
  'Microphone is blocked here. Open the app in its own browser tab to use voice.': 'இங்கே மைக் தடுக்கப்பட்டுள்ளது. குரல் தேடலுக்கு செயலியைத் தனி டேபில் திறங்கள்.',
  'Didn’t catch that. Try again, or type.': 'சரியாகக் கேட்கவில்லை. மீண்டும் சொல்லுங்கள், அல்லது தட்டச்சு செய்யுங்கள்.',
  'Voice search isn’t available here. You can type instead.': 'இங்கே குரல் தேடல் இல்லை. தட்டச்சு செய்யலாம்.',

  // product + best value
  'Add to cart': 'கூடையில் சேர்', 'View cart': 'கூடையைப் பார்', '{q} in your cart': 'கூடையில் {q}', 'Ready in about {n} min': 'சுமார் {n} நிமிடத்தில் தயார்',
  'delivers within {k} km': '{k} கி.மீக்குள் டெலிவரி', 'pickup only': 'நேரில் மட்டும்', 'Compare {n} vendors': '{n} வியாபாரிகளை ஒப்பிடு',
  'How we pick the best value': 'சிறந்த தேர்வை எப்படிச் செய்கிறோம்', 'Price': 'விலை', 'Distance': 'தூரம்', 'Rating': 'மதிப்பீடு', 'Enough stock': 'போதுமான இருப்பு',
  'Closed vendors and sold-out items are left out. The cheapest cart is not always the best pick if it is far away. No vendor can pay to be shown higher.':
    'மூடிய கடைகளும் தீர்ந்த பொருட்களும் கணக்கில் இல்லை. மலிவான வண்டி தூரத்தில் இருந்தால் அது எப்போதும் சிறந்ததல்ல. பணம் கொடுத்து யாரும் மேலே வர முடியாது.',
  '{shop} is out of {item} today.': '{shop}-இல் இன்று {item} இல்லை.', '{shop} is closed right now.': '{shop} இப்போது மூடியுள்ளது.',
  'Same item, other vendors nearby:': 'இதே பொருள், அருகிலுள்ள மற்ற வியாபாரிகளிடம்:', 'Nobody nearby has it right now. Similar things in stock:': 'இப்போது அருகில் யாரிடமும் இல்லை. இதைப் போன்றவை:',
  'Nobody nearby has {item} right now': 'இப்போது அருகில் யாரிடமும் {item} இல்லை', 'Here are similar things in stock:': 'இதைப் போன்ற பொருட்கள்:',
  'This item is no longer listed.': 'இந்தப் பொருள் இப்போது பட்டியலில் இல்லை.',
  'Only vendor near you with this in stock right now.': 'இப்போது அருகில் இது இருக்கும் ஒரே வியாபாரி.', 'Cheapest and closest to you.': 'மிகக் குறைந்த விலை, மிக அருகிலும்.',
  'Lowest price nearby, {km} km away.': 'அருகில் குறைந்த விலை, {km} கி.மீ தூரம்.', '₹{d}/{u} more than {shop}, but {k} km closer.': '{shop}-ஐ விட ₹{d}/{u} கூடுதல், ஆனால் {k} கி.மீ அருகில்.',
  'Good balance of price, distance and rating.': 'விலை, தூரம், மதிப்பீடு மூன்றும் சரியாக உள்ளன.', '{shop} is cheaper but nearly sold out.': '{shop} மலிவு, ஆனால் கிட்டத்தட்ட தீர்ந்துவிட்டது.',
  'Best rated too ({r}★).': 'மதிப்பீட்டிலும் முதலிடம் ({r}★).',
  'Added {q} {item} from {shop}': '{shop}-இலிருந்து {q} {item} சேர்க்கப்பட்டது', 'Added {q} {item}': '{q} {item} சேர்க்கப்பட்டது',

  // nearby + vendor profile
  '{n} street vendors around {place}': '{place} அருகே {n} தெருவோர வியாபாரிகள்',
  'Tap a pin to see the vendor. The map is a simple drawing of Mylapore, not to scale.': 'வியாபாரியைப் பார்க்க ஒரு குறியைத் தட்டுங்கள். இது மயிலாப்பூரின் எளிய வரைபடம், அளவுப்படி அல்ல.',
  'No vendors in this category yet.': 'இந்த வகையில் இன்னும் வியாபாரிகள் இல்லை.', 'Map of vendors near you': 'அருகிலுள்ள வியாபாரிகளின் வரைபடம்', 'Temple tank': 'கோயில் குளம்',
  'Favourite': 'பிடித்தவை', 'on this street since {y}': '{y} முதல் இந்தத் தெருவில்', 'Pickup, or delivery within {k} km for {f}': 'நேரில் வாங்கலாம், அல்லது {k} கி.மீக்குள் {f}க்கு டெலிவரி',
  'Pickup only': 'நேரில் வாங்க மட்டும்', "Today's items": 'இன்றைய பொருட்கள்', 'This vendor has not added items yet.': 'இந்த வியாபாரி இன்னும் பொருட்களைச் சேர்க்கவில்லை.',
  'What people say': 'மக்கள் சொல்வது', 'Sample reviews for the demo.': 'டெமோவுக்கான மாதிரி மதிப்புரைகள்.', 'This vendor is no longer listed.': 'இந்த வியாபாரி இப்போது பட்டியலில் இல்லை.',

  // cart
  'Your cart is empty': 'உங்கள் கூடை காலியாக உள்ளது', 'Search for something, or see which vendors are near you.': 'ஏதாவது தேடுங்கள், அல்லது அருகிலுள்ள வியாபாரிகளைப் பாருங்கள்.',
  'Find something': 'ஏதாவது தேடு', '{n} vendors, so {n} separate orders': '{n} வியாபாரிகள், அதனால் {n} தனி ஆர்டர்கள்', '{i} of {n}': '{n}-இல் {i}',
  'How will you pay?': 'எப்படிப் பணம் செலுத்துவீர்கள்?', 'At the stall': 'கடையில் நேரில்', 'Cash or the vendor’s own UPI QR, when you collect.': 'வாங்கும்போது ரொக்கமாகவோ வியாபாரியின் UPI QR மூலமாகவோ.',
  'UPI now (demo)': 'இப்போதே UPI (டெமோ)', 'Shown for the demo only. No money moves and no UPI app opens.': 'டெமோவுக்காக மட்டும். பணம் எதுவும் போகாது, UPI செயலி திறக்காது.',
  'Your details': 'உங்கள் விவரங்கள்', 'Name': 'பெயர்', 'Mobile number': 'கைபேசி எண்', 'To pay': 'செலுத்த வேண்டியது',
  'Place order': 'ஆர்டர் செய்', 'Place {n} orders': '{n} ஆர்டர்கள் செய்', 'Each vendor gets their own order and confirms it themselves.': 'ஒவ்வொரு வியாபாரிக்கும் தனி ஆர்டர்; அவரே உறுதி செய்வார்.',
  'Sort out the items marked in red first, or that vendor’s order will be left out.': 'சிவப்பில் குறித்த பொருட்களை முதலில் சரிசெய்யுங்கள், இல்லையெனில் அந்த ஆர்டர் விடுபடும்.',
  'Pickup': 'நேரில்', 'Delivery': 'டெலிவரி', 'Items': 'பொருட்கள்', 'Ready in about {n} min at {spot}.': 'சுமார் {n} நிமிடத்தில் {spot}-இல் தயார்.',
  '{shop} brings it to you. Delivery fee {f}.': '{shop} உங்களிடம் கொண்டுவருவார். டெலிவரி கட்டணம் {f}.', "This vendor doesn't deliver.": 'இந்த வியாபாரி டெலிவரி செய்வதில்லை.',
  'Delivers within {k} km; you are {d} km away.': '{k} கி.மீக்குள் மட்டும் டெலிவரி; நீங்கள் {d} கி.மீ தூரத்தில்.',
  '{shop} has closed for now.': '{shop} இப்போது மூடிவிட்டது.', 'Sold out since you added it.': 'நீங்கள் சேர்த்த பிறகு தீர்ந்துவிட்டது.', 'Only {q} left.': '{q} மட்டுமே உள்ளது.',
  'Switch to {shop} · {p}': '{shop}-க்கு மாறு · {p}', 'Take {q}': '{q} எடு', 'Switched vendor': 'வியாபாரி மாற்றப்பட்டார்',
  'Please enter your name so the vendor knows whose order it is.': 'யாருடைய ஆர்டர் என்று வியாபாரிக்குத் தெரிய உங்கள் பெயரைக் கொடுங்கள்.',
  'Mobile number should be 10 digits, starting with 6, 7, 8 or 9.': 'கைபேசி எண் 6, 7, 8 அல்லது 9-இல் தொடங்கும் 10 இலக்கமாக இருக்க வேண்டும்.',
  'Nothing could be ordered. Check the items marked in red.': 'எதையும் ஆர்டர் செய்ய முடியவில்லை. சிவப்பில் குறித்தவற்றைப் பாருங்கள்.',
  'Same items are in your cart': 'அதே பொருட்கள் கூடையில் உள்ளன', '{a} added, {s} from another vendor, {m} not available today': '{a} சேர்க்கப்பட்டது, {s} வேறு வியாபாரியிடமிருந்து, {m} இன்று இல்லை',

  // orders
  'Order sent': 'ஆர்டர் அனுப்பப்பட்டது', '{n} orders sent': '{n} ஆர்டர்கள் அனுப்பப்பட்டன', 'The vendor will confirm in a few minutes. You can follow it here.': 'சில நிமிடங்களில் வியாபாரி உறுதி செய்வார். இங்கே பார்த்துக்கொள்ளலாம்.',
  'It has already reached the vendor’s phone on the right.': 'வலதுபுறம் உள்ள வியாபாரியின் போனுக்கு ஏற்கனவே போய்விட்டது.', 'Demo: switch to “Vendor” at the top to accept this order.': 'டெமோ: இந்த ஆர்டரை ஏற்க மேலே “வியாபாரி”க்கு மாறுங்கள்.',
  'Back to home': 'முகப்புக்குத் திரும்பு', '1 item': '1 பொருள்', '{n} items': '{n} பொருட்கள்', 'Order again': 'மீண்டும் ஆர்டர்', 'Your orders': 'உங்கள் ஆர்டர்கள்',
  'No orders yet': 'இன்னும் ஆர்டர்கள் இல்லை', 'Your orders and their progress will show here.': 'உங்கள் ஆர்டர்களும் அவற்றின் நிலையும் இங்கே தெரியும்.', 'In progress': 'நடந்துகொண்டிருக்கிறது', 'Earlier': 'முன்பு',
  'Collect from {spot}. Show order number {id}.': '{spot}-இல் வாங்கிக்கொள்ளுங்கள். ஆர்டர் எண் {id} காட்டுங்கள்.', '{shop} is on the way with your order.': '{shop} உங்கள் ஆர்டருடன் வந்துகொண்டிருக்கிறார்.',
  'Sorry, they couldn’t take this one.': 'மன்னிக்கவும், இந்த ஆர்டரை அவர்களால் எடுக்க முடியவில்லை.', 'Nothing was charged. Other vendors nearby may have it.': 'பணம் எதுவும் எடுக்கப்படவில்லை. அருகிலுள்ள மற்றவர்களிடம் இருக்கலாம்.',
  'Find another vendor': 'வேறு வியாபாரியைத் தேடு', 'Total': 'மொத்தம்', 'UPI (demo, nothing charged)': 'UPI (டெமோ, பணம் எடுக்கப்படவில்லை)', 'Pay at the stall': 'கடையில் பணம்',
  'Cancel order': 'ஆர்டரை ரத்து செய்', 'You rated this {n} out of 5.': 'நீங்கள் 5-க்கு {n} கொடுத்தீர்கள்.', 'How was {shop}?': '{shop} எப்படி இருந்தது?', 'Order the same again': 'அதையே மீண்டும் ஆர்டர் செய்',
  'Order cancelled': 'ஆர்டர் ரத்து செய்யப்பட்டது', 'Thanks! Your rating helps other shoppers.': 'நன்றி! உங்கள் மதிப்பீடு மற்றவர்களுக்கு உதவும்.',
  'No updates yet': 'இன்னும் அறிவிப்புகள் இல்லை', 'When a vendor accepts or packs your order, you will see it here.': 'வியாபாரி உங்கள் ஆர்டரை ஏற்கும்போதோ கட்டும்போதோ இங்கே தெரியும்.',
  "The vendor couldn't take this order.": 'இந்த ஆர்டரை வியாபாரியால் எடுக்க முடியவில்லை.', 'You cancelled this order.': 'இந்த ஆர்டரை நீங்கள் ரத்து செய்தீர்கள்.',
  'Placed': 'அனுப்பப்பட்டது', 'Accepted': 'ஏற்கப்பட்டது', 'Packing': 'கட்டப்படுகிறது', 'Ready for pickup': 'வாங்கத் தயார்', 'On the way': 'வழியில்',
  'Completed': 'முடிந்தது', 'Declined': 'மறுக்கப்பட்டது', 'Cancelled': 'ரத்து',
  '{shop} accepted your order': '{shop} உங்கள் ஆர்டரை ஏற்றார்', '{shop} is packing your order': '{shop} உங்கள் ஆர்டரைக் கட்டுகிறார்', 'Your order is ready at {shop}': '{shop}-இல் உங்கள் ஆர்டர் தயார்',
  'Your order from {shop} is on the way': '{shop} ஆர்டர் வழியில் உள்ளது', 'Order from {shop} completed': '{shop} ஆர்டர் முடிந்தது', "{shop} couldn't take your order": '{shop} உங்கள் ஆர்டரை எடுக்க முடியவில்லை',
  'Where are you shopping from?': 'எங்கிருந்து வாங்குகிறீர்கள்?', 'Distances are worked out from here.': 'தூரம் இங்கிருந்து கணக்கிடப்படும்.', 'Handy when you shop on the way back from work.': 'வேலையிலிருந்து திரும்பும்போது வாங்க வசதி.',
  'Demo: two saved places. Live GPS is not used.': 'டெமோ: சேமித்த இரண்டு இடங்கள். நேரடி GPS பயன்படுத்தப்படவில்லை.', 'Showing vendors near {place}': '{place} அருகிலுள்ள வியாபாரிகள்',

  // vendor
  'Vanakkam': 'வணக்கம்', 'Open — customers can order': 'திறந்துள்ளது — ஆர்டர் வரலாம்', 'Closed — customers can’t order': 'மூடியுள்ளது — ஆர்டர் வராது',
  'You are open. Customers can order now.': 'கடை திறந்துவிட்டது. இப்போது ஆர்டர் வரலாம்.', 'Closed. Customers can still see you but can’t order.': 'மூடிவிட்டது. வாடிக்கையாளர்கள் பார்க்கலாம், ஆனால் ஆர்டர் செய்ய முடியாது.',
  '1 new order': '1 புதிய ஆர்டர்', '{n} new orders': '{n} புதிய ஆர்டர்கள்', 'Tap to see and accept': 'பார்த்து ஏற்கத் தட்டுங்கள்',
  "Today's earnings": 'இன்றைய வருமானம்', 'from {n} completed orders': '{n} முடிந்த ஆர்டர்களிலிருந்து', '+ {m} in open orders': '+ நடப்பு ஆர்டர்களில் {m}',
  'Orders today': 'இன்றைய ஆர்டர்கள்', '{d} done · {o} open': '{d} முடிந்தது · {o} நடப்பில்', 'Yesterday you earned {m}': 'நேற்று வருமானம் {m}',
  'Change prices and stock': 'விலை, இருப்பை மாற்று', 'Tips from your sales': 'உங்கள் விற்பனையிலிருந்து யோசனைகள்', 'Update stock': 'இருப்பை மாற்று',
  'Worked out from your own orders on LocalKart (demo data).': 'லோக்கல்கார்ட்டில் உங்கள் சொந்த ஆர்டர்களிலிருந்து கணக்கிட்டது (டெமோ தரவு).',
  'Selling best today': 'இன்று அதிகம் விற்றவை', 'Running low': 'தீரப்போகிறது', 'Latest orders': 'சமீபத்திய ஆர்டர்கள்', 'All orders': 'எல்லா ஆர்டர்களும்', '{q} left': '{q} உள்ளது',
  '{item} sold the most today — {q} so far.': 'இன்று {item} அதிகம் விற்றது — இதுவரை {q}.',
  '{n} orders today, {d} more than yesterday by this time.': 'இன்று {n} ஆர்டர்கள், நேற்று இதே நேரத்தை விட {d} அதிகம்.',
  '{n} orders today, {d} fewer than yesterday by this time.': 'இன்று {n} ஆர்டர்கள், நேற்று இதே நேரத்தை விட {d} குறைவு.',
  '{n} orders today, same as yesterday by this time.': 'இன்று {n} ஆர்டர்கள், நேற்று இதே நேரம் போலவே.',
  '{item} is almost out ({q} left). Restock before the evening rush?': '{item} கிட்டத்தட்ட தீர்ந்துவிட்டது ({q} உள்ளது). மாலைக் கூட்டத்துக்கு முன் நிரப்பலாமா?',
  '{item} is sold out. Customers searching for it are being sent to other vendors.': '{item} தீர்ந்துவிட்டது. தேடும் வாடிக்கையாளர்கள் மற்ற வியாபாரிகளிடம் போகிறார்கள்.',
  'People who buy {a} usually buy {b} too ({n} of {m} orders). Keep them side by side.': '{a} வாங்குபவர்கள் பெரும்பாலும் {b}-உம் வாங்குகிறார்கள் ({m}-இல் {n} ஆர்டர்கள்). இரண்டையும் அருகருகே வையுங்கள்.',
  'Your {item} is ₹{p}; others nearby average ₹{a}. Shoppers comparing may pick them.': 'உங்கள் {item} ₹{p}; அருகில் சராசரி ₹{a}. ஒப்பிடுபவர்கள் அவர்களைத் தேர்வு செய்யலாம்.',
  'Your {item} is ₹{p}, below the ₹{a} average nearby. Good one to keep in stock.': 'உங்கள் {item} ₹{p}, அருகிலுள்ள சராசரி ₹{a}-ஐ விடக் குறைவு. இதை இருப்பில் வைத்திருங்கள்.',
  'New ({n})': 'புதியவை ({n})', 'In progress ({n})': 'நடப்பில் ({n})', 'No new orders right now': 'இப்போது புதிய ஆர்டர்கள் இல்லை', 'Nothing here': 'இங்கே எதுவும் இல்லை',
  'New orders pop up here and on the Today screen.': 'புதிய ஆர்டர்கள் இங்கேயும் "இன்று" திரையிலும் தெரியும்.',
  'Say no to this order? The customer is told and the stock goes back.': 'இந்த ஆர்டரை மறுக்கவா? வாடிக்கையாளருக்குத் தெரிவிக்கப்படும், இருப்பு திரும்பும்.',
  'Keep it': 'வேண்டாம்', 'Yes, say no': 'ஆம், மறு', 'Can’t take': 'முடியாது', 'Accept': 'ஏற்கிறேன்',
  'Start packing': 'கட்டத் தொடங்கு', 'Out for delivery': 'டெலிவரிக்குக் கிளம்பியது', 'Handed over and paid': 'கொடுத்தாச்சு, பணம் வந்தது', 'Delivered and paid': 'டெலிவரி ஆனது, பணம் வந்தது',
  'Accepted. The customer can see it.': 'ஏற்கப்பட்டது. வாடிக்கையாளருக்குத் தெரியும்.', 'Customer told it’s ready': 'தயார் என்று வாடிக்கையாளருக்குத் தெரிவிக்கப்பட்டது',
  'Customer told it’s on the way': 'வழியில் என்று வாடிக்கையாளருக்குத் தெரிவிக்கப்பட்டது', 'Done. Added to today’s earnings.': 'முடிந்தது. இன்றைய வருமானத்தில் சேர்ந்தது.',
  'Order declined. Stock is back.': 'ஆர்டர் மறுக்கப்பட்டது. இருப்பு திரும்பியது.', 'Pays at the stall': 'கடையில் பணம் தருவார்',
  'What happened': 'நடந்தவை', 'Copy bill for WhatsApp': 'வாட்ஸ்அப்புக்கு பில் நகலெடு', 'Bill copied. Paste it in WhatsApp.': 'பில் நகலெடுக்கப்பட்டது. வாட்ஸ்அப்பில் ஒட்டுங்கள்.',
  'Bill': 'பில்', 'Copying is blocked here. Select the text and copy it yourself.': 'இங்கே நகலெடுக்க முடியவில்லை. உரையைத் தேர்ந்தெடுத்து நீங்களே நகலெடுங்கள்.',
  'Add item': 'பொருள் சேர்', 'Change today’s price with − and +': 'இன்றைய விலையை − + மூலம் மாற்றுங்கள்', 'per {u}': 'ஒரு {u}க்கு',
  'Stock': 'இருப்பு', 'Lower price': 'விலை குறை', 'Raise price': 'விலை கூட்டு', 'Selling today': 'இன்று விற்கிறேன்', 'Not selling today': 'இன்று இல்லை',
  'Sold out. Customers see “Out today” and are shown other vendors.': 'தீர்ந்துவிட்டது. வாடிக்கையாளர்களுக்கு “இன்று இல்லை” என்று தெரியும், மற்ற வியாபாரிகள் காட்டப்படுவார்கள்.',
  'What are you selling today?': 'இன்று என்ன விற்கிறீர்கள்?', 'Tap an item to add it. You can change the price any time.': 'சேர்க்க ஒரு பொருளைத் தட்டுங்கள். விலையை எப்போது வேண்டுமானாலும் மாற்றலாம்.',
  'Pick what you are adding. Your usual items come first.': 'என்ன சேர்க்கிறீர்கள் என்று தேர்வு செய்யுங்கள். உங்கள் வழக்கமான பொருட்கள் முதலில்.',
  'Something else': 'வேறு ஏதாவது', 'Edit item': 'பொருளை மாற்று', 'Add a photo': 'படம் சேர்', 'Change photo': 'படத்தை மாற்று', 'Use drawing': 'ஓவியத்தையே வை',
  'Item name': 'பொருளின் பெயர்', 'e.g. Raw banana': 'எ.கா. Raw banana', 'Name in Tamil (optional)': 'தமிழ்ப் பெயர் (விருப்பம்)', 'Type': 'வகை',
  'Pick a different item': 'வேறு பொருளைத் தேர்வு செய்', 'Price per {u}': 'ஒரு {u} விலை', 'Others nearby charge about ₹{a}': 'அருகில் மற்றவர்கள் சுமார் ₹{a}',
  'Sold by': 'எப்படி விற்பனை', 'How much do you have?': 'எவ்வளவு உள்ளது?', 'Freshness note (optional)': 'புதுமைக் குறிப்பு (விருப்பம்)',
  'Remove item': 'பொருளை நீக்கு', 'Remove this item from your shop? Customers will not see it any more.': 'இந்தப் பொருளை நீக்கவா? வாடிக்கையாளர்களுக்கு இனி தெரியாது.',
  'Yes, remove': 'ஆம், நீக்கு', 'Item removed': 'பொருள் நீக்கப்பட்டது', 'Please give the item a name.': 'பொருளுக்கு ஒரு பெயர் கொடுங்கள்.',
  'Price should be between ₹1 and ₹5,000.': 'விலை ₹1 முதல் ₹5,000 வரை இருக்க வேண்டும்.', '{item} added. Customers can see it now.': '{item} சேர்க்கப்பட்டது. வாடிக்கையாளர்கள் இப்போது பார்க்கலாம்.',
  'Customers see this phone number so they can call you.': 'வாடிக்கையாளர்கள் உங்களை அழைக்க இந்த எண் தெரியும்.', 'Easy mode': 'எளிய முறை',
  'On — bigger buttons and text': 'இயக்கத்தில் — பெரிய பொத்தான்கள், பெரிய எழுத்து', 'Bigger text, bigger buttons, fewer things on each screen.': 'பெரிய எழுத்து, பெரிய பொத்தான்கள், ஒவ்வொரு திரையிலும் குறைவான விஷயங்கள்.',
  'Language': 'மொழி', 'Timings': 'நேரம்', 'I deliver nearby': 'அருகில் டெலிவரி செய்வேன்', 'Delivery fee': 'டெலிவரி கட்டணம்', 'How far': 'எவ்வளவு தூரம்',
  'Demo accounts': 'டெமோ கணக்குகள்', 'Switch between sample vendors to see their dashboards.': 'மாதிரி வியாபாரிகளுக்கு மாறி அவர்களின் திரையைப் பாருங்கள்.',
  'Register a new vendor': 'புதிய வியாபாரியைப் பதிவு செய்', 'Join LocalKart': 'லோக்கல்கார்ட்டில் சேருங்கள்', 'Takes about two minutes. Free for street vendors.': 'சுமார் இரண்டு நிமிடம். தெருவோர வியாபாரிகளுக்கு இலவசம்.',
  'Your name': 'உங்கள் பெயர்', 'Shop or cart name': 'கடை அல்லது வண்டியின் பெயர்', 'e.g. Ravi Vegetables': 'எ.கா. ரவி காய்கறி', 'What do you sell?': 'என்ன விற்கிறீர்கள்?',
  'Where do you usually stand? Tap the map.': 'வழக்கமாக எங்கே நிற்கிறீர்கள்? வரைபடத்தில் தட்டுங்கள்.', 'Landmark, e.g. near the bus stop': 'அடையாளம், எ.கா. பஸ் நிறுத்தம் அருகில்', 'Landmark': 'அடையாளம்',
  'Can you deliver nearby?': 'அருகில் டெலிவரி செய்ய முடியுமா?', 'No, pickup only': 'இல்லை, நேரில் மட்டும்', 'Yes, within 1 km': 'ஆம், 1 கி.மீக்குள்',
  'Photo of your cart (optional)': 'உங்கள் வண்டியின் படம் (விருப்பம்)', 'Create my shop': 'என் கடையை உருவாக்கு',
  'Demo: your shop is saved in this browser only. No documents or KYC are asked for.': 'டெமோ: உங்கள் கடை இந்த பிரவுசரில் மட்டும் சேமிக்கப்படும். ஆவணங்களோ KYC-யோ கேட்கப்படாது.',
  'your name': 'உங்கள் பெயர்', 'a shop name': 'கடையின் பெயர்', 'a 10-digit mobile number': '10 இலக்கக் கைபேசி எண்', 'your spot on the map': 'வரைபடத்தில் உங்கள் இடம்',
  'Please add {list}.': 'தயவுசெய்து {list} சேர்க்கவும்.', 'Near the marked spot': 'குறித்த இடத்தின் அருகில்', 'Your shop is ready. Add what you are selling today.': 'உங்கள் கடை தயார். இன்று என்ன விற்கிறீர்கள் என்று சேருங்கள்.',

  // combined version: market list, walk-in bills, clearance, trip planner, picks
  'Market': 'சந்தை', 'Tomorrow at the market': 'நாளை சந்தையில்', 'Tomorrow’s market list': 'நாளைய சந்தைப் பட்டியல்',
  'Worked out from your last 7 days of sales': 'கடந்த 7 நாள் விற்பனையிலிருந்து கணக்கிட்டது', 'You have enough stock for tomorrow': 'நாளைக்குத் தேவையான இருப்பு உள்ளது',
  'Cash to carry': 'கொண்டு செல்ல வேண்டிய பணம்', 'If it all sells': 'எல்லாம் விற்றால்', 'over what you pay': 'கொள்முதல் விலைக்கு மேல்',
  '{a} from {b}': '{b}-இடமிருந்து {a}', '{a} from {b} · carry {m}': '{b}-இடமிருந்து {a} · {m} கொண்டு செல்லுங்கள்',
  'item': 'பொருள்', 'items': 'பொருட்கள்', 'trader': 'வியாபாரி', 'traders': 'மொத்த வியாபாரிகள்', 'vendor': 'வியாபாரி', 'vendors': 'வியாபாரிகள்',
  'stop': 'நிறுத்தம்', 'stops': 'நிறுத்தங்கள்', 'total': 'மொத்தம்', 'walk, there and back': 'போய் வர நடை',
  'Going only by the lowest price per kg would cost {m} more. Lot size matters.': 'கிலோ விலை மட்டும் பார்த்து வாங்கினால் {m} கூடுதல் ஆகும். எவ்வளவு அளவில் விற்கிறார்கள் என்பதும் முக்கியம்.',
  'Nothing to buy for tomorrow. You have enough stock.': 'நாளைக்கு எதுவும் வாங்க வேண்டாம். இருப்பு போதும்.',
  'Festival tomorrow: flowers, fruit and coconut × 1.5': 'நாளை பண்டிகை: பூ, பழம், தேங்காய் × 1.5',
  'Festival tomorrow? Turn on to buy more flowers and fruit': 'நாளை பண்டிகையா? பூ, பழம் கூடுதலாக வாங்க இயக்குங்கள்',
  'Sells about {d} a day · {left} left at closing': 'நாளுக்குச் சுமார் {d} விற்கிறது · மூடும்போது {left} இருக்கும்',
  '₹{w}/{u} wholesale · you sell at ₹{s} · {m}% margin': 'மொத்த விலை ₹{w}/{u} · நீங்கள் ₹{s}க்கு விற்கிறீர்கள் · {m}% லாபம்',
  'Bought: add to my stock': 'வாங்கியாச்சு: இருப்பில் சேர்', 'Bought today': 'இன்று வாங்கியவை', 'Stock updated. Spent {m}.': 'இருப்பு மாற்றப்பட்டது. செலவு {m}.',
  'Not on the list ({n})': 'பட்டியலில் இல்லாதவை ({n})', 'made at your stall': 'உங்கள் கடையில் செய்வது', 'no wholesale quote yet': 'மொத்த விலை இன்னும் இல்லை',
  'no sales in the last 7 days': 'கடந்த 7 நாளில் விற்பனை இல்லை', 'enough stock ({q} left at closing)': 'இருப்பு போதும் (மூடும்போது {q} இருக்கும்)',
  'How this list is worked out': 'இந்தப் பட்டியல் எப்படிக் கணக்கிடப்படுகிறது',
  'Daily sales = what you sold in the last 7 days (online orders and walk-in bills) ÷ 7. Fresh items are bought for 1 day, hardy vegetables for 3 days, packets for 7, plus 20% extra.':
    'நாள் விற்பனை = கடந்த 7 நாளில் விற்றது (ஆன்லைன் ஆர்டர்கள், நேரடி பில்கள்) ÷ 7. புதிய பொருட்கள் 1 நாளுக்கு, கடினமான காய்கள் 3 நாளுக்கு, பாக்கெட்டுகள் 7 நாளுக்கு, கூடுதலாக 20%.',
  'Traders sell in lots, so each amount is rounded up to their lot. A big crate is cheaper per kg, but for fresh items we count what would probably be thrown away as a cost. The trader with the lowest real cost is picked.':
    'மொத்த வியாபாரிகள் குறிப்பிட்ட அளவில்தான் விற்பார்கள், அதனால் அளவு மேல்நோக்கி முழுமையாக்கப்படும். பெரிய கூடை கிலோவுக்கு மலிவு, ஆனால் புதிய பொருட்களில் வீணாகக்கூடியதையும் செலவாகக் கணக்கிடுகிறோம். உண்மையான செலவு குறைந்த வியாபாரி தேர்வு செய்யப்படுவார்.',
  'Wholesale prices here are sample figures for the demo.': 'இங்குள்ள மொத்த விலைகள் டெமோவுக்கான மாதிரி எண்கள்.',
  'Copy list for WhatsApp': 'வாட்ஸ்அப்புக்கு பட்டியலை நகலெடு', 'List copied. Paste it in WhatsApp for the trader.': 'பட்டியல் நகலெடுக்கப்பட்டது. வியாபாரிக்கு வாட்ஸ்அப்பில் அனுப்புங்கள்.',
  '{tr} is ₹{d}/{u} cheaper but sells {lot} at a time — about {w} would likely be thrown away.': '{tr} ₹{d}/{u} மலிவு, ஆனால் ஒரே தடவையில் {lot} விற்பார் — சுமார் {w} வீணாகலாம்.',
  'Bigger lot, but cheaper overall: {a} instead of {b}.': 'பெரிய அளவு, ஆனால் மொத்தத்தில் மலிவு: {b}க்குப் பதில் {a}.',
  'Lowest price per {u}, and the lot size fits what you sell.': 'ஒரு {u}க்கு குறைந்த விலை, அளவும் உங்கள் விற்பனைக்குப் பொருந்துகிறது.',
  'Smaller lot means less left over: {a} instead of {b}.': 'சிறிய அளவு, மீதி குறைவு: {b}க்குப் பதில் {a}.',
  'Wholesale about ₹{w} · your margin {m}%': 'மொத்த விலை சுமார் ₹{w} · உங்கள் லாபம் {m}%',
  'Sold something at the cart?': 'வண்டியில் நேரடியாக விற்றீர்களா?', 'What did you sell?': 'என்ன விற்றீர்கள்?', 'Say it': 'சொல்லுங்கள்',
  'e.g. 2 kg thakkali, 1 kattu malli': 'எ.கா. 2 கிலோ தக்காளி, 1 கட்டு மல்லி',
  'Type what you sold. It counts towards your stock, earnings and tomorrow’s market list.': 'விற்றதைத் தட்டச்சு செய்யுங்கள். இருப்பு, வருமானம், நாளைய சந்தைப் பட்டியல் எல்லாவற்றிலும் சேரும்.',
  'Not in your items: {list}': 'உங்கள் பொருட்களில் இல்லை: {list}', 'Add cash sale · {m}': 'ரொக்க விற்பனை சேர் · {m}', 'Cash sale of {m} added': '{m} ரொக்க விற்பனை சேர்க்கப்பட்டது',
  'Walk-in sale': 'நேரடி விற்பனை', 'Walk-in sale, paid in cash at the cart': 'நேரடி விற்பனை, வண்டியில் ரொக்கமாகச் செலுத்தப்பட்டது', 'Cash': 'ரொக்கம்',
  'incl. {n} walk-in sales': 'அதில் {n} நேரடி விற்பனை', 'Spent at market': 'சந்தையில் செலவு', 'Sold in clearance, not wasted': 'வீணாகாமல் தள்ளுபடியில் விற்றது',
  'Evening clearance': 'மாலைத் தள்ளுபடி', 'Start 20% clearance': '20% தள்ளுபடி தொடங்கு', 'Clearance off': 'தள்ளுபடி நிறுத்தப்பட்டது',
  'Clearance on: fresh items {p}% off': 'தள்ளுபடி தொடங்கியது: புதிய பொருட்கள் {p}% குறைவு',
  'Fresh items are {p}% off right now. Shoppers nearby see it on their home screen.': 'புதிய பொருட்கள் இப்போது {p}% குறைவு. அருகிலுள்ளவர்கள் முகப்புத் திரையில் பார்ப்பார்கள்.',
  'Mark fresh items down in the evening so they sell today instead of being thrown away.': 'மாலையில் புதிய பொருட்களின் விலையைக் குறைத்தால் வீணாகாமல் இன்றே விற்கும்.',
  'It’s evening and you still have {q} of {item}. A 20% clearance now could sell it before it spoils.': 'மாலை ஆகிவிட்டது, இன்னும் {item} {q} உள்ளது. இப்போது 20% தள்ளுபடி கொடுத்தால் கெடும் முன் விற்கலாம்.',
  'Evening clearance near you': 'அருகில் மாலைத் தள்ளுபடி', 'Fresh items vendors are marking down so nothing goes to waste tonight.': 'இன்றிரவு வீணாகாமல் இருக்க வியாபாரிகள் விலை குறைத்த புதிய பொருட்கள்.',
  '−{p}% evening': 'மாலை −{p}%', '−{p}% evening · was ₹{w}': 'மாலை −{p}% · முன்பு ₹{w}',
  'UPI ID (optional)': 'UPI ஐடி (விருப்பம்)', 'e.g. ravi.veg@okbank': 'எ.கா. ravi.veg@okbank', 'a UPI ID like name@bank, or leave it empty': 'name@bank போன்ற UPI ஐடி, அல்லது காலியாக விடுங்கள்',
  'Shown to customers who pay at your cart. LocalKart never takes money in this demo.': 'வண்டியில் பணம் செலுத்தும் வாடிக்கையாளர்களுக்குக் காட்டப்படும். இந்த டெமோவில் லோக்கல்கார்ட் பணம் எதுவும் எடுப்பதில்லை.',
  'UPI at the stall: {id}': 'கடையில் UPI: {id}', 'Pay cash or UPI to {id}.': 'ரொக்கமாகவோ {id}-க்கு UPI மூலமாகவோ செலுத்தலாம்.',
  'Picked for you': 'உங்களுக்காக', 'Because you buy {item}': 'நீங்கள் {item} வாங்குவதால்', 'Good for the morning': 'காலைக்கு ஏற்றது',
  'Popular this evening': 'இன்று மாலை பிரபலம்', 'Popular nearby today': 'இன்று அருகில் பிரபலம்',
  'Often bought with {item}': '{item}-உடன் அடிக்கடி வாங்குவது', 'Often bought with {item}:': '{item}-உடன் அடிக்கடி வாங்குவது:', 'Also at {shop}, no extra stop': '{shop}-இலேயே உள்ளது, வேறு இடம் போக வேண்டாம்',
  'Got a shopping list?': 'வாங்க வேண்டிய பட்டியல் இருக்கிறதா?', 'Type it once. We plan the fewest stops or the lowest total.': 'ஒரு முறை தட்டச்சு செய்யுங்கள். குறைந்த நிறுத்தங்கள் அல்லது குறைந்த மொத்த விலைக்குத் திட்டமிடுகிறோம்.',
  'Plan my shopping': 'என் கொள்முதலைத் திட்டமிடு', 'Type your list the way you would say it.': 'நீங்கள் சொல்வது போலவே பட்டியலைத் தட்டச்சு செய்யுங்கள்.', 'Your list': 'உங்கள் பட்டியல்',
  'e.g. 1 kg thakkali, arai kilo vengayam, malli, 2 muzham jasmine': 'எ.கா. 1 கிலோ தக்காளி, அரை கிலோ வெங்காயம், மல்லி, 2 முழம் மல்லிகை',
  'Plan my trip': 'பயணத்தைத் திட்டமிடு', 'Try a sample list': 'மாதிரிப் பட்டியல்',
  'We read quantities like “1 kg”, “arai kilo”, “2 kattu” and names in English, Tamil or Tanglish. Then we compare two ways to buy it all.': '“1 கிலோ”, “அரை கிலோ”, “2 கட்டு” போன்ற அளவுகளையும் ஆங்கிலம், தமிழ், தங்கிலீஷ் பெயர்களையும் புரிந்துகொள்கிறோம். பிறகு இரண்டு வழிகளை ஒப்பிடுகிறோம்.',
  'We couldn’t find any items in that list.': 'அந்தப் பட்டியலில் எந்தப் பொருளும் கிடைக்கவில்லை.', 'Try names like tomato, thakkali, vengayam or jasmine, separated by commas.': 'tomato, thakkali, vengayam, jasmine போன்ற பெயர்களைக் காற்புள்ளியால் பிரித்து எழுதுங்கள்.',
  'Couldn’t match: {list}': 'பொருந்தவில்லை: {list}', 'Nobody within 3 km has enough {list} right now.': '3 கி.மீக்குள் யாரிடமும் போதுமான {list} இப்போது இல்லை.',
  'The lowest-price plan saves {m} but adds {n} and {k} km of walking.': 'குறைந்த விலைத் திட்டம் {m} மிச்சப்படுத்தும், ஆனால் கூடுதலாக {n}, {k} கி.மீ நடை.',
  'Cheapest and fewest stops': 'குறைந்த விலையும் குறைந்த நிறுத்தங்களும்', 'Fewest stops': 'குறைந்த நிறுத்தங்கள்', 'Lowest total': 'குறைந்த மொத்தம்', 'Suggested': 'பரிந்துரை',
  'Add these to cart': 'இவற்றைக் கூடையில் சேர்', 'Added from {v}': '{v}-இடமிருந்து சேர்க்கப்பட்டது',

  // freshness notes vendors pick from
  'Picked this morning': 'இன்று காலை பறித்தது', 'From Koyambedu this morning': 'இன்று காலை கோயம்பேட்டிலிருந்து', 'Cut this morning': 'இன்று காலை அறுத்தது',
  'Strung this morning': 'இன்று காலை கட்டியது', 'Home-made today': 'இன்று வீட்டில் செய்தது', 'Sweet ones, from Krishnagiri': 'இனிப்பானவை, கிருஷ்ணகிரியிலிருந்து',
  'Poovan, from Theni': 'பூவன், தேனியிலிருந்து'
};

// Round 3: sorting, filters, reviews, invoices, legal links. Tamil here is a first draft; a native speaker should check it.
Object.assign(TA, {
  'Sort': 'வரிசை', 'Price: low to high': 'விலை: குறைவிலிருந்து அதிகம்', 'Price: high to low': 'விலை: அதிகத்திலிருந்து குறைவு',
  'Customer rating': 'வாடிக்கையாளர் மதிப்பீடு', 'Nearest first': 'அருகிலுள்ளவை முதலில்', '4 and up': '4 அல்லது அதற்கு மேல்',
  'In stock': 'இருப்பு உள்ளது', 'Clear all': 'எல்லாவற்றையும் நீக்கு', '{n} offers from {v} vendors': '{v} வியாபாரிகள் · {n} சலுகைகள்',
  'No offers match these filters': 'இந்த வடிகட்டிகளுக்குப் பொருந்தும் சலுகைகள் இல்லை', 'Add {q} from {shop}': '{shop}-இலிருந்து {q} சேர்',
  'Ratings and reviews': 'மதிப்பீடுகளும் மதிப்புரைகளும்', '{n} ratings': '{n} மதிப்பீடுகள்', 'No ratings yet': 'இன்னும் மதிப்பீடுகள் இல்லை',
  'Be the first to review this.': 'இதற்கு முதலில் மதிப்புரை எழுதுங்கள்.', 'Write a review': 'மதிப்புரை எழுது', 'Rate this shop': 'இந்தக் கடைக்கு மதிப்பிடு',
  'Your review of {item}': '{item} பற்றிய உங்கள் மதிப்புரை', 'Your rating for {shop}': '{shop}-க்கான உங்கள் மதிப்பீடு', 'Your rating': 'உங்கள் மதிப்பீடு',
  'Review (optional)': 'மதிப்புரை (விருப்பம்)', 'Quality, weight, freshness…': 'தரம், எடை, புதுமை…', 'Post review': 'மதிப்புரையைப் பதிவிடு',
  'Tap a star to rate it.': 'மதிப்பிட ஒரு நட்சத்திரத்தைத் தட்டவும்.', 'Thanks! Your review is posted.': 'நன்றி! உங்கள் மதிப்புரை பதிவாகியுள்ளது.',
  'Rate the shop after you have bought from them. It helps other shoppers choose.': 'அவர்களிடம் வாங்கிய பிறகு கடையை மதிப்பிடுங்கள். மற்றவர்களுக்கு உதவும்.',
  'Some reviews are samples for the demo.': 'சில மதிப்புரைகள் டெமோவுக்கான மாதிரிகள்.',
  'Invoice': 'ரசீது', 'Copy invoice text': 'ரசீது உரையை நகலெடு', 'Invoice copied': 'ரசீது நகலெடுக்கப்பட்டது',
  'Demo invoice. Not a valid GST bill. Prices include any tax.': 'டெமோ ரசீது. இது செல்லுபடியாகும் GST பில் அல்ல. விலைகளில் வரி சேர்க்கப்பட்டுள்ளது.',
  'About': 'பற்றி', 'Privacy': 'தனியுரிமை', 'Terms': 'விதிமுறைகள்',
  'rating': 'மதிப்பீடு', 'ratings': 'மதிப்பீடுகள்', 'No reviews yet for this item': 'இந்தப் பொருளுக்கு இன்னும் மதிப்புரைகள் இல்லை'
});

// Round 4: daily needs, ready-in times and the daily basket. First drafts; a native speaker should check them.
Object.assign(TA, {
  'Fastest to get': 'விரைவில் கிடைப்பது',
  'Get it in {n} min': '{n} நிமிடத்தில் கிடைக்கும்',
  'Next door': 'பக்கத்துக் கடை',
  'Within 500 m': '500 மீட்டருக்குள்',
  'Daily needs in about 15 minutes': 'அன்றாடத் தேவைகள், சுமார் 15 நிமிடத்தில்',
  'Shops within a short walk, soonest first. Pick it up on your way.': 'சிறிது நடையில் உள்ள கடைகள், விரைவில் கிடைப்பவை முதலில். வரும் வழியில் வாங்கிக்கொள்ளலாம்.',
  'My daily basket': 'என் அன்றாடக் கூடை',
  'About {p} from {s}': '{s} இலிருந்து சுமார் {p}',
  'The things you buy every day. We pick the best-value shop nearby for each.': 'ஒவ்வொரு நாளும் வாங்கும் பொருட்கள். ஒவ்வொன்றுக்கும் அருகில் உள்ள சிறந்த மதிப்புக் கடையைத் தேர்ந்தெடுக்கிறோம்.',
  'Remove {item}': '{item} நீக்கு',
  'Add all to cart': 'எல்லாவற்றையும் கூடையில் சேர்',
  'Your basket is empty. Tap an item below to start it.': 'உங்கள் கூடை காலியாக உள்ளது. கீழே உள்ள பொருளைத் தட்டித் தொடங்குங்கள்.',
  '{items} from {shops} are in your cart': '{shops} இலிருந்து {items} உங்கள் கூடையில் உள்ளன',
  'Some items are not available in that amount right now.': 'சில பொருட்கள் இந்த அளவுக்கு இப்போது கிடைக்கவில்லை.',
  'Not enough in stock for this amount': 'இந்த அளவுக்குக் கையிருப்பு இல்லை',
  'Nothing in your basket is in stock right now.': 'உங்கள் கூடையில் உள்ள எதுவும் இப்போது கையிருப்பில் இல்லை.',
  'items': 'பொருட்கள்',
  'shop': 'கடை',
  'shops': 'கடைகள்',
  'offer': 'சலுகை',
  'offers': 'சலுகைகள்',
  '{n} min': '{n} நிமிடம்'
});

// Final round: purchase orders to traders, regular traders, basket stepper, yesterday tip. First drafts.
Object.assign(TA, {
  'Less {item}': '{item} குறை', 'More {item}': '{item} கூட்டு',
  '{n} orders today so far. Yesterday you had {y} in the whole day.': 'இன்று இதுவரை {n} ஆர்டர்கள். நேற்று முழு நாளில் {y}.',
  'Your regular trader. Only {m} more than {tr}.': 'உங்கள் வழக்கமான வியாபாரி. {tr}-ஐ விட {m} மட்டுமே அதிகம்.',
  'on order ({q} coming)': 'ஆர்டர் செய்யப்பட்டது ({q} வருகிறது)',
  'sent {t}': 'அனுப்பியது {t}',
  'Copy order {id} for WhatsApp': 'ஆர்டர் {id}-ஐ வாட்ஸ்அப்புக்கு நகலெடு',
  'Received: add to stock': 'வந்தது: இருப்பில் சேர்',
  'Copy': 'நகலெடு',
  'Nothing more to buy. Your orders to traders cover tomorrow.': 'இனி வாங்க எதுவும் இல்லை. வியாபாரிகளுக்கான ஆர்டர்கள் நாளைக்குப் போதும்.',
  'Orders to traders': 'வியாபாரிகளுக்கான ஆர்டர்கள்',
  'Collect these at the market, then tap Received. Items on order are not bought twice.': 'சந்தையில் இவற்றை வாங்கியதும் “வந்தது” என்பதைத் தட்டுங்கள். ஆர்டரில் உள்ளவை இருமுறை வாங்கப்படாது.',
  'My regular trader': 'என் வழக்கமான வியாபாரி',
  'Mark as my regular trader': 'வழக்கமான வியாபாரியாகக் குறி',
  'Send order': 'ஆர்டர் அனுப்பு',
  'Order {id} saved for {tr}. Copy it to send on WhatsApp.': '{tr}-க்கான ஆர்டர் {id} சேமிக்கப்பட்டது. வாட்ஸ்அப்பில் அனுப்ப நகலெடுங்கள்.',
  'Stock updated from {id}. Spent {m}.': '{id} மூலம் இருப்பு புதுப்பிக்கப்பட்டது. செலவு {m}.',
  'Order {id} cancelled': 'ஆர்டர் {id} ரத்து செய்யப்பட்டது',
  'Order copied. Paste it in WhatsApp for the trader.': 'ஆர்டர் நகலெடுக்கப்பட்டது. வியாபாரிக்கு வாட்ஸ்அப்பில் ஒட்டுங்கள்.',
  '{tr} is now your regular trader': '{tr} இப்போது உங்கள் வழக்கமான வியாபாரி',
  '{tr} removed from your regular traders': '{tr} வழக்கமான வியாபாரிகளிலிருந்து நீக்கப்பட்டார்',
  'order to collect': 'வாங்க வேண்டிய ஆர்டர்', 'orders to collect': 'வாங்க வேண்டிய ஆர்டர்கள்'
});
