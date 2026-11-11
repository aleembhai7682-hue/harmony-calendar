import { IndianFestival, FestivalCategory, HolidayType } from '../types/calendar';

/**
 * High-precision Indian Festival dataset for 2024 - 2028,
 * covering Hindu, Sikh, Christian, Jain, Buddhist, and National holidays.
 */
export const INDIAN_FESTIVALS_DATABASE: IndianFestival[] = [
  // ================= 2026 FESTIVALS =================
  // National Holidays 2026
  {
    id: 'nat-rep-2026',
    nameEn: 'Republic Day',
    nameHi: 'गणतंत्र दिवस',
    category: 'national',
    date: '2026-01-26',
    holidayType: 'gazetted',
    descriptionEn: 'Honors the date on which the Constitution of India came into effect in 1950, turning India into an independent republic.',
    descriptionHi: '1950 में भारत का संविधान लागू होने का राष्ट्रीय गौरव दिवस। नई दिल्ली के कर्तव्य पथ पर भव्य परेड और तिरंगा फहराया जाता है।',
    significance: 'Democracy, Constitutional rights, Unity in Diversity.',
    rituals: ['Flag hoisting', 'Grand parade at Kartavya Path', 'Singing National Anthem', 'Cultural tributes'],
  },
  {
    id: 'nat-ind-2026',
    nameEn: 'Independence Day',
    nameHi: 'स्वतंत्रता दिवस',
    category: 'national',
    date: '2026-08-15',
    holidayType: 'gazetted',
    descriptionEn: 'Commemorates India\'s freedom from British colonial rule on August 15, 1947.',
    descriptionHi: '15 अगस्त 1947 को ब्रिटिश हुकूमत से आज़ादी मिलने की याद में मनाया जाने वाला राष्ट्रीय महापर्व।',
    significance: 'Freedom, sovereignty, paying homage to freedom fighters.',
    rituals: ['Prime Minister\'s address from Red Fort', 'Kite flying', 'Patriotic song recitals', 'Tricolor decoration'],
  },
  {
    id: 'nat-gandhi-2026',
    nameEn: 'Mahatma Gandhi Jayanti',
    nameHi: 'गांधी जयंती',
    category: 'national',
    date: '2026-10-02',
    holidayType: 'gazetted',
    descriptionEn: 'Birth anniversary of Mohandas Karamchand Gandhi, Father of the Nation, also observed globally as International Day of Non-Violence.',
    descriptionHi: 'राष्ट्रपिता महात्मा गांधी की जयंती। इसे विश्वभर में अंतरराष्ट्रीय अहिंसा दिवस के रूप में भी मनाया जाता है।',
    significance: 'Ahimsa (Non-violence), Satyagraha, Truth and simplicity.',
    rituals: ['Prayers at Raj Ghat', 'Spinning Charkha', 'Swachhata cleanliness drives', 'Bhajan: Raghupati Raghav Raja Ram'],
  },
  {
    id: 'ambedkar-2026',
    nameEn: 'Dr. B.R. Ambedkar Jayanti',
    nameHi: 'डॉ. बी.आर. अंबेडकर जयंती',
    category: 'national',
    date: '2026-04-14',
    holidayType: 'gazetted',
    descriptionEn: 'Commemorates the birth of Dr. Bhimrao Ramji Ambedkar, principal architect of the Indian Constitution and social reformer.',
    descriptionHi: 'भारतीय संविधान के मुख्य निर्माता और समाज सुधारक बोधिसत्व डॉ. भीमराव रामजी अंबेडकर की पावन जयंती।',
    significance: 'Social justice, equality, eradication of caste discrimination.',
    rituals: ['Offering floral tributes to Babasaheb statues', 'Rallies and processions', 'Seminars on constitutional values'],
  },

  // Hindu Festivals 2026
  {
    id: 'makar-sankranti-2026',
    nameEn: 'Makar Sankranti / Pongal / Maghi',
    nameHi: 'मकर संक्रांति / पोंगल / माघी',
    category: 'hindu',
    date: '2026-01-14',
    holidayType: 'gazetted',
    descriptionEn: 'Solar festival celebrating the transit of the Sun into Capricorn (Makara rashi) and the onset of longer days, celebrated with kites and harvest foods.',
    descriptionHi: 'सूर्य का मकर राशि में प्रवेश। उत्तरायण का आरंभ, पतंगबाज़ी और तिल-गुड़ के सेवन का पावन पर्व।',
    significance: 'Solar transition, harvest thanksgiving, charity and renewed warmth.',
    rituals: ['Holy dip in Ganga/sacred rivers', 'Kite flying competitions', 'Til-gul laddus & Khichdi', 'Pongal pot boiling over (South India)'],
    applicableStates: ['MH', 'GJ', 'TN', 'UP', 'RJ', 'PB', 'KA', 'AP', 'TS'],
  },
  {
    id: 'vasant-panchami-2026',
    nameEn: 'Vasant Panchami (Saraswati Puja)',
    nameHi: 'बसंत पंचमी (सरस्वती पूजा)',
    category: 'hindu',
    date: '2026-01-23',
    holidayType: 'restricted',
    descriptionEn: 'Arrival of the spring season and celebration of Goddess Saraswati, deity of learning, arts, wisdom, and music.',
    descriptionHi: 'ऋतुराज बसंत का आगमन और विद्या, वाणी व संगीत की देवी मां सरस्वती की आराधना का शुभ दिन।',
    significance: 'Knowledge, creativity, yellow flowers, rebirth of nature.',
    rituals: ['Wearing yellow clothing', 'Saraswati Puja in schools & homes', 'Vidya Arambham (initiating children into letters)'],
  },
  {
    id: 'maha-shivratri-2026',
    nameEn: 'Maha Shivratri',
    nameHi: 'महाशिवरात्रि',
    category: 'hindu',
    date: '2026-02-15',
    holidayType: 'gazetted',
    descriptionEn: 'The Great Night of Lord Shiva, celebrating the cosmic dance of Nataraja and the sacred marriage of Shiva and Parvati.',
    descriptionHi: 'भगवान शिव और माता पार्वती के दिव्य विवाह व तांडव नृत्य की महान पावन रात्रि।',
    significance: 'Overcoming ignorance and darkness, awakening inner consciousness.',
    rituals: ['All-night vigil (Jagran)', 'Rudrabhishek with milk, honey, Bel leaves', 'Strict fasting (Vrat)', 'Chanting Om Namah Shivaya'],
  },
  {
    id: 'holika-dahan-2026',
    nameEn: 'Holika Dahan (Chhoti Holi)',
    nameHi: 'होलिका दहन (छोटी होली)',
    category: 'hindu',
    date: '2026-03-03',
    holidayType: 'restricted',
    descriptionEn: 'Bonfire lit on the eve of Holi, symbolizing the triumph of devotee Prahlad\'s piety over the demoness Holika.',
    descriptionHi: 'होली से पूर्व रात्रि में अग्नि प्रज्वलित कर बुराई पर अच्छाई और भक्त प्रह्लाद की रक्षा का उत्सव।',
    significance: 'Triumph of righteousness (Dharma) over ego and evil.',
    rituals: ['Lighting community bonfires', 'Circling the fire (Parikrama)', 'Offering roasting barley and coconut'],
  },
  {
    id: 'holi-2026',
    nameEn: 'Holi (Dhulandi - Festival of Colors)',
    nameHi: 'होली (धुलेंडी - रंगों का महापर्व)',
    category: 'hindu',
    date: '2026-03-04',
    holidayType: 'gazetted',
    descriptionEn: 'The world-famous spring festival of colors, joyous play, forgiveness, and renewal of friendships with Gulal, Pichkaris, and Gujiya.',
    descriptionHi: 'रंगों, गुलाल, पिचकारी और गुझिया का उल्लासपूर्ण वसंतोत्सव। गिले-शिकवे मिटाकर एक-दूसरे को गले लगाने का दिन।',
    significance: 'Joy of Radha-Krishna divine love, end of winter, playful harmony.',
    rituals: ['Smearing colored powder (Gulal)', 'Water splashes', 'Feasting on Gujiyas, Thandai, Mathri', 'Meeting neighbors and relatives'],
  },
  {
    id: 'chaitra-navratri-2026',
    nameEn: 'Chaitra Navratri / Gudi Padwa / Ugadi',
    nameHi: 'चैत्र नवरात्रि / गुड़ी पड़वा / उगादी',
    category: 'hindu',
    date: '2026-03-19',
    holidayType: 'gazetted',
    descriptionEn: 'Hindu Lunar New Year (Vikram Samvat) and the beginning of nine days dedicated to the nine divine forms of Goddess Durga (Navdurga).',
    descriptionHi: 'हिंदू नव संवत्सर का शुभारंभ, महाराष्ट्र में गुड़ी पड़वा, दक्षिण में उगादी तथा 9 दिनों तक मां दुर्गा की उपासना।',
    significance: 'Cosmic creation, feminine divine energy (Shakti), new resolutions.',
    rituals: ['Raising the Gudi flag', 'Eating Neem & Jaggery (Bevu Bella)', 'Kalash Sthapana & Durga Saptashati recitation', 'Nine days of fasting'],
    applicableStates: ['MH', 'KA', 'AP', 'TS', 'GJ', 'UP', 'DL'],
  },
  {
    id: 'ram-navami-2026',
    nameEn: 'Ram Navami',
    nameHi: 'राम नवमी',
    category: 'hindu',
    date: '2026-03-27',
    holidayType: 'gazetted',
    descriptionEn: 'Celebration of the birth of Maryada Purushottam Lord Rama, seventh avatar of Vishnu, at Ayodhya.',
    descriptionHi: 'मर्यादा पुरुषोत्तम प्रभु श्री राम का अयोध्या में प्राकट्य दिवस।',
    significance: 'Righteous conduct, moral integrity, establishment of Ram Rajya.',
    rituals: ['Akhand Ramayan path recitation', 'Kanya Pujan feast', 'Rath Yatras & temple darshan', 'Fasting until midday'],
  },
  {
    id: 'hanuman-jayanti-2026',
    nameEn: 'Hanuman Jayanti',
    nameHi: 'हनुमान जयंती',
    category: 'hindu',
    date: '2026-04-02',
    holidayType: 'restricted',
    descriptionEn: 'Birth of Lord Hanuman, the supreme embodiment of devotion, selfless service, courage, and strength.',
    descriptionHi: 'पवनपुत्र संकटमोचन हनुमान जी की जयंती। असीम भक्ति, शक्ति और निस्वार्थ सेवा का प्रतीक।',
    significance: 'Protection from fears, removing obstacles, unwavering Bhakti.',
    rituals: ['Hanuman Chalisa recitation 108 times', 'Sindoor and vermilion offering', 'Boondi laddus distribution', 'Temple processions'],
  },
  {
    id: 'raksha-bandhan-2026',
    nameEn: 'Raksha Bandhan (Rakhi)',
    nameHi: 'रक्षाबंधन (राखी)',
    category: 'hindu',
    date: '2026-08-28',
    holidayType: 'gazetted',
    descriptionEn: 'Cherished bond of mutual love, protection, and duty between brothers and sisters. Sisters tie sacred threads (Rakhi) and brothers offer blessings and gifts.',
    descriptionHi: 'भाई-बहन के अटूट स्नेह और रक्षा के संकल्प का पवित्र पर्व। बहनें कलाई पर रक्षासूत्र बांधती हैं।',
    significance: 'Protection, unconditional sibling bond, family solidarity.',
    rituals: ['Tying the sacred Rakhi thread', 'Aarti and sweet feeding', 'Giving return gifts and vows of safety'],
  },
  {
    id: 'janmashtami-2026',
    nameEn: 'Krishna Janmashtami',
    nameHi: 'श्री कृष्ण जन्माष्टमी',
    category: 'hindu',
    date: '2026-09-04',
    holidayType: 'gazetted',
    descriptionEn: 'Midnight celebration of the birth of Lord Krishna in Mathura, adorned with Dahi Handi pyramids, jhoolas (cradles), and midnight aarti.',
    descriptionHi: 'भगवान श्री कृष्ण का मध्यरात्रि प्राकट्य उत्सव। मटकी फोड़ (दही हांडी), झांकियां और माखन-मिश्री का भोग।',
    significance: 'Divine love, joy, teachings of the Bhagavad Gita.',
    rituals: ['Midnight Janmotsav aarti', 'Dahi Handi human pyramids in Mumbai/Maharashtra', 'Rocking the Bal Gopal cradle', 'Fasting until midnight'],
  },
  {
    id: 'ganesh-chaturthi-2026',
    nameEn: 'Ganesh Chaturthi (Vinayaka Chavithi)',
    nameHi: 'गणेश चतुर्थी (विनायक चतुर्थी)',
    category: 'hindu',
    date: '2026-09-14',
    holidayType: 'gazetted',
    descriptionEn: 'Spectacular 10-day festival welcoming Lord Ganesha, the remover of all obstacles and god of beginnings, into homes and public pandals.',
    descriptionHi: 'विघ्नहर्ता भगवान श्री गणेश के आगमन का 10 दिवसीय महापर्व। घर-घर में बप्पा की स्थापना और मोदक का भोग।',
    significance: 'Removal of hurdles, intellect, auspicious beginnings.',
    rituals: ['Pranapratishtha of eco-friendly Ganesha idols', 'Steaming Modaks', 'Daily morning & evening aarti', 'Grand Visarjan immersion on Anant Chaturdashi'],
    applicableStates: ['MH', 'KA', 'AP', 'TS', 'GJ', 'TN', 'GA'],
  },
  {
    id: 'onam-2026',
    nameEn: 'Onam (Thiruvonam)',
    nameHi: 'ओणम (थिरुवोनम)',
    category: 'hindu',
    date: '2026-08-26',
    holidayType: 'regional',
    descriptionEn: 'Harvest festival of Kerala commemorating the mythical homecoming of the benevolent King Mahabali.',
    descriptionHi: 'केरल का प्रसिद्ध फसल उत्सव, जो राजा महाबली के स्वागत और समृद्ध संस्कृति का उत्सव है।',
    significance: 'Equality, prosperity, traditional arts.',
    rituals: ['Pookkalam flower carpets', 'Onam Sadya 26-dish feast on banana leaf', 'Vallam Kali snake boat races', 'Pulikali tiger dance'],
    applicableStates: ['KL'],
  },
  {
    id: 'navratri-start-2026',
    nameEn: 'Sharad Navratri Begins (Ghatasthapana)',
    nameHi: 'शारदीय नवरात्रि प्रारंभ (घटस्थापना)',
    category: 'hindu',
    date: '2026-10-11',
    holidayType: 'restricted',
    descriptionEn: 'Beginning of the autumn 9 nights festival of Navratri, featuring Dandiya/Garba dances in Gujarat and devotional fasting across India.',
    descriptionHi: 'शारदीय नवरात्रि का पहला दिन। कलश स्थापना, गरबा और डांडिया रास का भव्य उल्लास।',
    significance: 'Invocation of Maa Shailputri, victory of light over dark.',
    rituals: ['Ghatasthapana ceremony', 'Garba & Dandiya nights in colorful Chaniya Cholis', 'Fasting on fruits and buckwheat (Kuttu)'],
  },
  {
    id: 'durga-ashtami-2026',
    nameEn: 'Durga Ashtami / Maha Navami (Durga Puja)',
    nameHi: 'दुर्गा अष्टमी / महानवमी (दुर्गा पूजा)',
    category: 'hindu',
    date: '2026-10-19',
    holidayType: 'gazetted',
    descriptionEn: 'The apex of Durga Puja celebrations, honoring the supreme Goddess slaying the demon Mahishasura.',
    descriptionHi: 'दुर्गा पूजा का चरम उत्सव। भव्य पंडाल, ढाक की धुन, धुनुची नृत्य और कुमारी पूजा।',
    significance: 'Triumph of Ma Durga, cultural peak in Bengal and nationwide.',
    rituals: ['Pushpanjali in the morning', 'Sandhi Puja with 108 lotus flowers & 108 lamps', 'Dhunuchi Naach to beats of Dhak', 'Kanya Pujan'],
    applicableStates: ['WB', 'AS', 'OR', 'JH', 'TR', 'UP', 'DL'],
  },
  {
    id: 'dussehra-2026',
    nameEn: 'Dussehra (Vijayadashami)',
    nameHi: 'दशहरा (विजयादशमी)',
    category: 'hindu',
    date: '2026-10-20',
    holidayType: 'gazetted',
    descriptionEn: 'Celebration of Lord Rama\'s victory over the ten-headed demon king Ravana, marked by burning giant effigies and Sindoor Khela.',
    descriptionHi: 'अधर्म पर धर्म और रावण पर भगवान राम की विजय का महान दिवस। रावण, कुंभकर्ण और मेघनाद के पुतलों का दहन।',
    significance: 'Victory of truth, destruction of arrogance, Shami puja.',
    rituals: ['Burning giant effigies of Ravana', 'Sindoor Khela in Durga pandals', 'Shastra Puja (blessing tools & vehicles)', 'Exchanging Apta tree leaves as gold'],
  },
  {
    id: 'karwa-chauth-2026',
    nameEn: 'Karwa Chauth',
    nameHi: 'करवा चौथ',
    category: 'hindu',
    date: '2026-10-29',
    holidayType: 'restricted',
    descriptionEn: 'Nirjala (waterless) day-long fast observed by married Hindu women for the longevity, prosperity, and health of their husbands.',
    descriptionHi: 'सुहागिन महिलाओं द्वारा पति की दीर्घायु और खुशहाली के लिए रखा जाने वाला निर्जला व्रत। चांद देखकर अर्घ्य देना।',
    significance: 'Marital devotion, love, cultural bond.',
    rituals: ['Sargi before sunrise', 'Evening Katha circle in red attire', 'Viewing the moon through a sieve (Chhalni)', 'Husband breaking wife\'s fast with water'],
    applicableStates: ['UP', 'DL', 'HR', 'PB', 'RJ', 'MP'],
  },
  {
    id: 'dhanteras-2026',
    nameEn: 'Dhanteras (Dhanatrayodashi)',
    nameHi: 'धनतेरस (धनत्रयोदशी)',
    category: 'hindu',
    date: '2026-11-06',
    holidayType: 'restricted',
    descriptionEn: 'First day of the 5-day Diwali festival. Auspicious day to purchase gold, silver, brass utensils, and new vehicles, honoring Lord Dhanvantari (god of health).',
    descriptionHi: 'दीपावली का पहला पावन दिन। आरोग्य के देवता भगवान धन्वंतरि की पूजा, सोना-चांदी, बर्तन व वाहन खरीदने का अत्यंत शुभ दिन।',
    significance: 'Wealth of health and material prosperity, light against premature death.',
    rituals: ['Purchasing new metallic items/jewelry', 'Lighting the Yamadeep lamp at the door facing south', 'Dhanvantari and Kuber Puja'],
  },
  {
    id: 'diwali-2026',
    nameEn: 'Diwali (Deepavali - Festival of Lights & Lakshmi Puja)',
    nameHi: 'दीपावली (दिवाली - रोशनी का महापर्व व लक्ष्मी पूजन)',
    category: 'hindu',
    date: '2026-11-08',
    holidayType: 'gazetted',
    descriptionEn: 'The supreme Festival of Lights across India, welcoming Lord Rama back to Ayodhya, and welcoming Goddess Lakshmi and Lord Ganesha into illuminated homes.',
    descriptionHi: 'भारत का सबसे बड़ा रोशनी का महापर्व। घर-घर में मिट्टी के दीप (दीये), रंगोली, लक्ष्मी-गणेश पूजन, मिठाईयां और खुशियों का आदान-प्रदान।',
    significance: 'Inner light over darkness, wisdom over ignorance, welcoming prosperity.',
    rituals: ['Grand evening Lakshmi-Ganesha Puja with silver coins & lotus', 'Illuminating clay diyas, candles, fairy lights', 'Drawing colorful floor Rangolis', 'Sharing Kaju Katli, Ladoos with family and friends'],
  },
  {
    id: 'govardhan-puja-2026',
    nameEn: 'Govardhan Puja / Annakut',
    nameHi: 'गोवर्धन पूजा / अन्नकूट',
    category: 'hindu',
    date: '2026-11-09',
    holidayType: 'restricted',
    descriptionEn: 'Celebrates Lord Krishna lifting the Govardhan mountain on his little finger to shield the villagers of Vrindavan from torrents of rain.',
    descriptionHi: 'श्री कृष्ण द्वारा इंद्र के अभिमान को तोड़ने और गोवर्धन पर्वत उठाने की याद में 56 भोग व अन्नकूट का पर्व।',
    significance: 'Gratitude towards nature, ecology, cows, and divine protection.',
    rituals: ['Making Govardhan structure of cow dung', 'Offering Annakut 56 Bhog vegetarian feast', 'Gau (cow) Puja and decoration'],
  },
  {
    id: 'bhai-dooj-2026',
    nameEn: 'Bhai Dooj (Yama Dwitiya / Bhau Beej)',
    nameHi: 'भाई दूज (यम द्वितीया / भाऊ बीज)',
    category: 'hindu',
    date: '2026-11-10',
    holidayType: 'restricted',
    descriptionEn: 'Concluding day of Diwali festivities celebrating the sacred bond between brother and sister, tracing to Yamraj visiting sister Yamuna.',
    descriptionHi: 'दीपावली का समापन पर्व। बहनें भाई को तिलक लगाकर लंबी उम्र की कामना करती हैं और भाई उपहार देते हैं।',
    significance: 'Siblings bond, blessing of eternal life and protection.',
    rituals: ['Applying Tilak on brother\'s forehead', 'Aarti with lighted lamp', 'Special lunch prepared with love', 'Exchange of gifts'],
  },
  {
    id: 'chhath-puja-2026',
    nameEn: 'Chhath Puja (Sandhya & Usha Arghya)',
    nameHi: 'छठ पूजा (संध्या व उषा अर्घ्य)',
    category: 'hindu',
    date: '2026-11-15',
    endDate: '2026-11-16',
    holidayType: 'gazetted',
    descriptionEn: 'Ancient solar thanksgiving festival of immense purity, offering Arghya to the setting and rising Sun God and Chhathi Maiya along riverbanks.',
    descriptionHi: 'सूर्यदेव और छठी मइया को समर्पित महाव्रत। 36 घंटे का निर्जला उपवास, डूबते और उगते सूर्य को पवित्र नदियों के तट पर अर्घ्य अर्पण।',
    significance: 'Absolute purity, health, life force energy, ecological harmony.',
    rituals: ['Nahay Khay & Kharna', 'Thekua prasad prepared on traditional clay chulha', 'Standing in waist-deep water at river ghats', 'Fasting for 36 hours non-stop'],
    applicableStates: ['BR', 'JH', 'UP', 'DL', 'WB', 'MP'],
  },

  // Sikh Festivals 2026
  {
    id: 'guru-gobind-singh-2026',
    nameEn: 'Guru Gobind Singh Jayanti',
    nameHi: 'गुरु गोबिंद सिंह जयंती (प्रकाश पर्व)',
    category: 'sikh',
    date: '2026-01-05',
    holidayType: 'restricted',
    descriptionEn: 'Prakash Utsav of the tenth Sikh Guru, warrior-poet, philosopher, and founder of the Khalsa Panth in 1699.',
    descriptionHi: 'सिखों के दसवें गुरु, खालसा पंथ के संस्थापक और महान संत-योद्धा गुरु गोबिंद सिंह जी का प्रकाश पर्व।',
    significance: 'Bravery, spiritual sovereignty, sacrifice for justice.',
    rituals: ['Akhand Path of Guru Granth Sahib', 'Nagar Kirtan processions', 'Gatka martial arts display', 'Community Langar'],
    applicableStates: ['PB', 'HR', 'DL', 'RJ', 'UP'],
  },
  {
    id: 'baisakhi-2026',
    nameEn: 'Baisakhi (Vaisakhi / Khalsa Sirjana Divas)',
    nameHi: 'बैसाखी (खालसा साजना दिवस)',
    category: 'sikh',
    date: '2026-04-14',
    holidayType: 'gazetted',
    descriptionEn: 'Commemorates the formation of the Khalsa Panth by Guru Gobind Singh in 1699, and the spring harvest celebration of Punjab.',
    descriptionHi: '1699 में गुरु गोबिंद सिंह जी द्वारा खालसा पंथ की स्थापना का पावन दिवस और पंजाब का प्रमुख फसल उत्सव।',
    significance: 'Khalsa identity, harvest joy, valor, equality.',
    rituals: ['Amrit Sanchar baptism ceremonies', 'Bhangra and Gidda folk dances', 'Nishan Sahib flag changing', 'Serving grand Langar meals'],
    applicableStates: ['PB', 'HR', 'DL', 'UP'],
  },
  {
    id: 'guru-nanak-jayanti-2026',
    nameEn: 'Guru Nanak Jayanti (Gurpurab)',
    nameHi: 'गुरु नानक जयंती (गुरुपर्व)',
    category: 'sikh',
    date: '2026-11-24',
    holidayType: 'gazetted',
    descriptionEn: 'Birth celebration of Guru Nanak Dev Ji, first of the ten Sikh Gurus and founder of Sikhism, who taught oneness of God (Ik Onkar) and selfless seva.',
    descriptionHi: 'सिख धर्म के प्रवर्तक और प्रथम गुरु, गुरु नानक देव जी का प्रकाश पर्व। "एक ओंकार", सत्य, सेवा और समानता का संदेश।',
    significance: 'Universal brotherhood, truthful living, selfless service (Seva).',
    rituals: ['Prabhat Pheris at dawn', '48-hour Akhand Path recitation', 'Nagar Kirtan with Panj Pyare', 'Langar distributed to millions irrespective of caste/creed'],
  },
  {
    id: 'guru-tegh-bahadur-2026',
    nameEn: 'Martyrdom Day of Guru Tegh Bahadur',
    nameHi: 'गुरु तेग बहादुर शहीदी दिवस',
    category: 'sikh',
    date: '2026-11-24',
    holidayType: 'restricted',
    descriptionEn: 'Honors the supreme sacrifice of the ninth Sikh Guru, \'Hind Di Chadar\', who laid down his life in Delhi to protect religious freedom.',
    descriptionHi: 'धार्मिक स्वतंत्रता और मानवाधिकारों की रक्षा के लिए शीश बलिदान करने वाले नौवें गुरु "हिंद दी चादर" का शहीदी दिवस।',
    significance: 'Religious freedom, defending the oppressed, unwavering courage.',
    rituals: ['Kirtan and Katha at Gurdwara Sis Ganj Sahib', 'Silent meditation', 'Serving pilgrims with Karah Parshad'],
  },

  // Christian Festivals 2026
  {
    id: 'good-friday-2026',
    nameEn: 'Good Friday',
    nameHi: 'गुड फ्राइडे (पवित्र शुक्रवार)',
    category: 'christian',
    date: '2026-04-03',
    holidayType: 'gazetted',
    descriptionEn: 'Commemorates the crucifixion of Jesus Christ at Calvary, his profound suffering and supreme sacrifice for the salvation of humanity.',
    descriptionHi: 'समस्त मानवजाति के उद्धार के लिए प्रभु यीशु मसीह के क्रूसारोपण और सर्वोच्च बलिदान का स्मरण दिवस।',
    significance: 'Atonement, divine love, sacrifice, and redemption.',
    rituals: ['Solemn church services at 3:00 PM', 'Stations of the Cross veneration', 'Fasting and prayerful silence', 'Hot cross buns'],
  },
  {
    id: 'easter-sunday-2026',
    nameEn: 'Easter Sunday',
    nameHi: 'ईस्टर संडे (पुनरुत्थान रविवार)',
    category: 'christian',
    date: '2026-04-05',
    holidayType: 'restricted',
    descriptionEn: 'Glorious celebration of the resurrection of Jesus Christ from the dead on the third day after his crucifixion.',
    descriptionHi: 'प्रभु यीशु के मृत्यु पर विजय पाकर तीसरे दिन पुनर्जीवित होने का पावन आनंदोत्सव।',
    significance: 'Resurrection, eternal life, triumph of hope over despair.',
    rituals: ['Sunrise Easter Vigil service', 'Decorating Easter eggs (symbol of rebirth)', 'Family feasts and choral hymns', 'Exchange of cakes'],
  },
  {
    id: 'christmas-2026',
    nameEn: 'Christmas Day',
    nameHi: 'क्रिसमस (बड़ा दिन)',
    category: 'christian',
    date: '2026-12-25',
    holidayType: 'gazetted',
    descriptionEn: 'Celebration of the birth of Jesus Christ in Bethlehem. Cities and churches across India sparkle with lights, cribs, carols, and cakes.',
    descriptionHi: 'प्रभु यीशु मसीह का जन्मोत्सव। गिरजाघरों में विशेष प्रार्थनाएं, क्रिसमस ट्री की सजावट, सांता क्लॉज़ और प्लम केक का उत्सव।',
    significance: 'Peace on Earth, good will toward all, generous giving.',
    rituals: ['Midnight Mass on Christmas Eve', 'Decorating pine trees with stars & bells', 'Singing traditional carols', 'Exchanging gifts and plum cakes'],
  },

  // Jain Festivals 2026
  {
    id: 'mahavir-jayanti-2026',
    nameEn: 'Mahavir Jayanti',
    nameHi: 'महावीर जयंती',
    category: 'jain',
    date: '2026-03-31',
    holidayType: 'gazetted',
    descriptionEn: 'Birth celebration of Lord Mahavira, 24th and last Tirthankara of Jainism, who propagated Ahimsa (non-violence), Satya, and compassion.',
    descriptionHi: 'जैन धर्म के 24वें तीर्थंकर भगवान महावीर स्वामी का जन्म कल्याणक। "जियो और जीने दो" तथा अहिंसा का सर्वोच्च संदेश।',
    significance: 'Ahimsa Paramo Dharma (Non-violence is the supreme virtue), truth, self-restraint.',
    rituals: ['Abhisheka of Lord Mahavira idol', 'Rath Yatra religious procession', 'Lectures on Jain philosophy & Ahimsa', 'Charitable donations and feeding poor'],
  },
  {
    id: 'paryushan-2026',
    nameEn: 'Paryushan Parva / Samvatsari (Kshamavani)',
    nameHi: 'पर्युषण पर्व / संवत्सरी (क्षमावाणी पर्व)',
    category: 'jain',
    date: '2026-09-17',
    holidayType: 'restricted',
    descriptionEn: 'The most sacred 8-10 days of Jain spiritual purification, self-introspection, and fasting, concluding with Samvatsari asking forgiveness from all beings (Micchami Dukkadam).',
    descriptionHi: 'जैन धर्म का महापर्व। आत्म-शुद्धि, तप और क्षमा का पर्व। "मिच्छामि दुक्कड़म्" कहकर सभी जीवों से मन, वचन, काया से क्षमा याचना।',
    significance: 'Universal forgiveness, liberation of soul, repentance, fasting.',
    rituals: ['Upvas fasting (Atthai/Varshitap)', 'Pratikraman introspection prayer', 'Recitation of Kalpasutra', 'Greeting all with: Micchami Dukkadam!'],
  },

  // Buddhist Festivals 2026
  {
    id: 'buddha-purnima-2026',
    nameEn: 'Buddha Purnima (Vesak)',
    nameHi: 'बुद्ध पूर्णिमा (वेसाक)',
    category: 'buddhist',
    date: '2026-05-31',
    holidayType: 'gazetted',
    descriptionEn: 'The holiest triple-blessed day for Buddhists, commemorating the Birth, Enlightenment (Nirvana at Bodh Gaya), and Mahaparinirvana of Gautama Buddha.',
    descriptionHi: 'तथागत गौतम बुद्ध के जन्म, बोधगया में संबोधि (ज्ञान प्राप्ति) और महापरिनिर्वाण का त्रिविध पावन पूर्णिमा दिवस।',
    significance: 'Compassion (Karuna), Mindfulness, the Middle Path (Madhyam Marga).',
    rituals: ['Meditation and chanting at Mahabodhi Temple, Bodh Gaya', 'Pouring scented water on Bodhi tree', 'Offering white flowers and candles', 'Serving sweet Kheer'],
  },

  // ================= 2025 FESTIVALS =================
  {
    id: 'nat-rep-2025',
    nameEn: 'Republic Day',
    nameHi: 'गणतंत्र दिवस',
    category: 'national',
    date: '2025-01-26',
    holidayType: 'gazetted',
    descriptionEn: '76th Republic Day of India celebrating the enactment of the Constitution.',
    descriptionHi: 'भारतीय संविधान लागू होने का गौरवशाली राष्ट्रीय दिवस।',
    significance: 'Constitutional values and national sovereignty.',
    rituals: ['Parade', 'Flag hoisting'],
  },
  {
    id: 'maha-shivratri-2025',
    nameEn: 'Maha Shivratri',
    nameHi: 'महाशिवरात्रि',
    category: 'hindu',
    date: '2025-02-26',
    holidayType: 'gazetted',
    descriptionEn: 'Great night of Lord Shiva, honored through fasting and Rudrabhishek.',
    descriptionHi: 'भगवान शिव की पावन आराधना और रात्रि जागरण।',
    significance: 'Spiritual awakening.',
    rituals: ['Abhisheka', 'All-night Jagran'],
  },
  {
    id: 'holi-2025',
    nameEn: 'Holi',
    nameHi: 'होली',
    category: 'hindu',
    date: '2025-03-14',
    holidayType: 'gazetted',
    descriptionEn: 'Festival of colors and joy.',
    descriptionHi: 'रंगों और उल्लास का पावन पर्व।',
    significance: 'Colors and brotherhood.',
    rituals: ['Colors', 'Sweets'],
  },
  {
    id: 'ram-navami-2025',
    nameEn: 'Ram Navami',
    nameHi: 'राम नवमी',
    category: 'hindu',
    date: '2025-04-06',
    holidayType: 'gazetted',
    descriptionEn: 'Birth celebration of Lord Rama.',
    descriptionHi: 'भगवान श्री राम का प्राकट्य उत्सव।',
    significance: 'Righteousness.',
    rituals: ['Puja', 'Ramayana recital'],
  },
  {
    id: 'good-friday-2025',
    nameEn: 'Good Friday',
    nameHi: 'गुड फ्राइडे',
    category: 'christian',
    date: '2025-04-18',
    holidayType: 'gazetted',
    descriptionEn: 'Crucifixion and sacrifice of Jesus Christ.',
    descriptionHi: 'प्रभु यीशु के सर्वोच्च बलिदान का स्मरण।',
    significance: 'Redemption.',
    rituals: ['Church service', 'Prayer'],
  },
  {
    id: 'nat-ind-2025',
    nameEn: 'Independence Day',
    nameHi: 'स्वतंत्रता दिवस',
    category: 'national',
    date: '2025-08-15',
    holidayType: 'gazetted',
    descriptionEn: '79th Independence Day of India.',
    descriptionHi: 'भारत का 79वां स्वतंत्रता दिवस।',
    significance: 'Freedom.',
    rituals: ['Flag hoisting', 'Red Fort ceremony'],
  },
  {
    id: 'janmashtami-2025',
    nameEn: 'Krishna Janmashtami',
    nameHi: 'श्री कृष्ण जन्माष्टमी',
    category: 'hindu',
    date: '2025-08-16',
    holidayType: 'gazetted',
    descriptionEn: 'Birth of Lord Krishna.',
    descriptionHi: 'भगवान श्री कृष्ण का जन्मोत्सव।',
    significance: 'Divine love.',
    rituals: ['Dahi Handi', 'Midnight Puja'],
  },
  {
    id: 'ganesh-chaturthi-2025',
    nameEn: 'Ganesh Chaturthi',
    nameHi: 'गणेश चतुर्थी',
    category: 'hindu',
    date: '2025-08-27',
    holidayType: 'gazetted',
    descriptionEn: 'Arrival of Lord Ganesha.',
    descriptionHi: 'विघ्नहर्ता भगवान गणेश का आगमन।',
    significance: 'New beginnings.',
    rituals: ['Modaks', 'Idol installation'],
    applicableStates: ['MH', 'KA', 'AP', 'TS', 'GJ', 'TN'],
  },
  {
    id: 'dussehra-2025',
    nameEn: 'Dussehra (Vijayadashami)',
    nameHi: 'दशहरा (विजयादशमी)',
    category: 'hindu',
    date: '2025-10-02',
    holidayType: 'gazetted',
    descriptionEn: 'Victory of good over evil.',
    descriptionHi: 'अधर्म पर धर्म की विजय।',
    significance: 'Triumph of light.',
    rituals: ['Ravana Dahan', 'Puja'],
  },
  {
    id: 'diwali-2025',
    nameEn: 'Diwali (Deepavali)',
    nameHi: 'दीपावली (दिवाली)',
    category: 'hindu',
    date: '2025-10-20',
    holidayType: 'gazetted',
    descriptionEn: 'Festival of Lights and Lakshmi Puja.',
    descriptionHi: 'रोशनी का महापर्व और लक्ष्मी पूजन।',
    significance: 'Prosperity and light.',
    rituals: ['Diyas', 'Lakshmi Puja', 'Sweets'],
  },
  {
    id: 'guru-nanak-2025',
    nameEn: 'Guru Nanak Jayanti',
    nameHi: 'गुरु नानक जयंती',
    category: 'sikh',
    date: '2025-11-05',
    holidayType: 'gazetted',
    descriptionEn: 'Prakash Utsav of Guru Nanak Dev Ji.',
    descriptionHi: 'गुरु नानक देव जी का प्रकाश पर्व।',
    significance: 'One God, selfless service.',
    rituals: ['Nagar Kirtan', 'Langar'],
  },
  {
    id: 'christmas-2025',
    nameEn: 'Christmas Day',
    nameHi: 'क्रिसमस',
    category: 'christian',
    date: '2025-12-25',
    holidayType: 'gazetted',
    descriptionEn: 'Birth of Jesus Christ.',
    descriptionHi: 'प्रभु यीशु मसीह का जन्मोत्सव।',
    significance: 'Peace and goodwill.',
    rituals: ['Midnight mass', 'Cakes', 'Gifts'],
  },

  // ================= 2027 FESTIVALS =================
  {
    id: 'nat-rep-2027',
    nameEn: 'Republic Day',
    nameHi: 'गणतंत्र दिवस',
    category: 'national',
    date: '2027-01-26',
    holidayType: 'gazetted',
    descriptionEn: '78th Republic Day of India.',
    descriptionHi: 'भारत का 78वां गणतंत्र दिवस।',
    significance: 'Sovereignty.',
    rituals: ['Parade', 'Flag hoisting'],
  },
  {
    id: 'holi-2027',
    nameEn: 'Holi',
    nameHi: 'होली',
    category: 'hindu',
    date: '2027-03-22',
    holidayType: 'gazetted',
    descriptionEn: 'Festival of colors and spring vibrancy.',
    descriptionHi: 'वसंतोत्सव एवं रंगों का त्यौहार।',
    significance: 'Colors and brotherhood.',
    rituals: ['Colors', 'Sweets'],
  },
  {
    id: 'good-friday-2027',
    nameEn: 'Good Friday',
    nameHi: 'गुड फ्राइडे',
    category: 'christian',
    date: '2027-03-26',
    holidayType: 'gazetted',
    descriptionEn: 'Solemn remembrance of the crucifixion of Jesus Christ.',
    descriptionHi: 'प्रभु यीशु के क्रूसारोपण का पवित्र दिन।',
    significance: 'Salvation.',
    rituals: ['Solemn services', 'Prayer'],
  },
  {
    id: 'nat-ind-2027',
    nameEn: 'Independence Day',
    nameHi: 'स्वतंत्रता दिवस',
    category: 'national',
    date: '2027-08-15',
    holidayType: 'gazetted',
    descriptionEn: 'Commemoration of Indian independence.',
    descriptionHi: 'भारत का स्वतंत्रता दिवस।',
    significance: 'Freedom.',
    rituals: ['Flag hoisting', 'Patriotic events'],
  },
  {
    id: 'dussehra-2027',
    nameEn: 'Dussehra (Vijayadashami)',
    nameHi: 'दशहरा',
    category: 'hindu',
    date: '2027-10-09',
    holidayType: 'gazetted',
    descriptionEn: 'Triumph of Lord Rama over Ravana.',
    descriptionHi: 'बुराई पर अच्छाई की विजय।',
    significance: 'Righteousness.',
    rituals: ['Ravana Dahan', 'Sweets'],
  },
  {
    id: 'diwali-2027',
    nameEn: 'Diwali (Deepavali)',
    nameHi: 'दीपावली',
    category: 'hindu',
    date: '2027-10-29',
    holidayType: 'gazetted',
    descriptionEn: 'Grand Festival of Lights & Lakshmi Puja.',
    descriptionHi: 'दीपों का महापर्व व लक्ष्मी पूजन।',
    significance: 'Prosperity and illumination.',
    rituals: ['Diyas', 'Puja', 'Sweets'],
  },
  {
    id: 'guru-nanak-2027',
    nameEn: 'Guru Nanak Jayanti',
    nameHi: 'गुरु नानक जयंती',
    category: 'sikh',
    date: '2027-11-13',
    holidayType: 'gazetted',
    descriptionEn: 'Prakash Utsav of Guru Nanak Dev Ji.',
    descriptionHi: 'गुरु नानक देव जी का प्रकाश पर्व।',
    significance: 'Equality and oneness.',
    rituals: ['Kirtan', 'Langar'],
  },
  {
    id: 'christmas-2027',
    nameEn: 'Christmas Day',
    nameHi: 'क्रिसमस',
    category: 'christian',
    date: '2027-12-25',
    holidayType: 'gazetted',
    descriptionEn: 'Birth of Jesus Christ.',
    descriptionHi: 'प्रभु यीशु मसीह का जन्मोत्सव।',
    significance: 'Joy and peace.',
    rituals: ['Midnight Mass', 'Plum Cake'],
  },
];

/**
 * Filter festivals for a specific date, accounting for category toggles and selected state.
 */
// Fixed-date recurring holidays across all years
const FIXED_ANNUAL_HOLIDAYS: Omit<IndianFestival, 'id' | 'date'>[] = [
  {
    nameEn: 'Republic Day',
    nameHi: 'गणतंत्र दिवस',
    category: 'national',
    holidayType: 'gazetted',
    descriptionEn: 'Honors the date on which the Constitution of India came into effect in 1950.',
    descriptionHi: '1950 में भारत का संविधान लागू होने का राष्ट्रीय गौरव दिवस।',
    significance: 'Democracy, Constitutional rights, Unity in Diversity.',
    rituals: ['Flag hoisting', 'Grand parade at Kartavya Path', 'Singing National Anthem'],
  },
  {
    nameEn: 'Dr. B.R. Ambedkar Jayanti',
    nameHi: 'डॉ. बी.आर. अंबेडकर जयंती',
    category: 'national',
    holidayType: 'gazetted',
    descriptionEn: 'Commemorates the birth of Dr. Bhimrao Ramji Ambedkar, principal architect of the Indian Constitution.',
    descriptionHi: 'भारतीय संविधान के मुख्य निर्माता डॉ. भीमराव रामजी अंबेडकर की पावन जयंती।',
    significance: 'Social justice, equality, constitutional values.',
    rituals: ['Offering floral tributes to Babasaheb', 'Seminars on constitutional equality'],
  },
  {
    nameEn: 'Independence Day',
    nameHi: 'स्वतंत्रता दिवस',
    category: 'national',
    holidayType: 'gazetted',
    descriptionEn: 'Commemorates India\'s freedom from British colonial rule on August 15, 1947.',
    descriptionHi: '15 अगस्त 1947 को ब्रिटिश हुकूमत से आज़ादी मिलने की याद में मनाया जाने वाला महापर्व।',
    significance: 'Freedom, sovereignty, paying homage to freedom fighters.',
    rituals: ['Prime Minister\'s address from Red Fort', 'Kite flying', 'National Flag hoisting'],
  },
  {
    nameEn: 'Mahatma Gandhi Jayanti',
    nameHi: 'गांधी जयंती',
    category: 'national',
    holidayType: 'gazetted',
    descriptionEn: 'Birth anniversary of Mohandas Karamchand Gandhi, Father of the Nation, and International Day of Non-Violence.',
    descriptionHi: 'राष्ट्रपिता महात्मा गांधी की जयंती एवं अंतरराष्ट्रीय अहिंसा दिवस।',
    significance: 'Ahimsa (Non-violence), Truth, Swachhata cleanliness.',
    rituals: ['Prayers at Raj Ghat', 'Spinning Charkha', 'Swachhata cleanliness drives'],
  },
  {
    nameEn: 'Makar Sankranti / Pongal',
    nameHi: 'मकर संक्रांति / पोंगल',
    category: 'hindu',
    holidayType: 'gazetted',
    descriptionEn: 'Solar festival celebrating the transit of the Sun into Capricorn and the onset of longer days.',
    descriptionHi: 'सूर्य का मकर राशि में प्रवेश। उत्तरायण का आरंभ, पतंगबाज़ी और तिल-गुड़ के सेवन का पावन पर्व।',
    significance: 'Solar transition, harvest thanksgiving, charity.',
    rituals: ['Holy dip in rivers', 'Kite flying', 'Til-gul laddus', 'Pongal cooking'],
    applicableStates: ['MH', 'GJ', 'TN', 'UP', 'RJ', 'PB', 'KA', 'AP', 'TS'],
  },
  {
    nameEn: 'Christmas Day',
    nameHi: 'क्रिसमस (बड़ा दिन)',
    category: 'christian',
    holidayType: 'gazetted',
    descriptionEn: 'Celebrates the Nativity of Jesus Christ, bringing peace, goodwill, and joy to humanity.',
    descriptionHi: 'प्रभु यीशु मसीह का पावन जन्मोत्सव। प्रेम, शांति और करुणा का पर्व।',
    significance: 'Love, divine light, charity and family goodwill.',
    rituals: ['Midnight Mass', 'Christmas tree decoration', 'Exchanging gifts and carols'],
  },
];

/**
 * Filter festivals for a specific date, accounting for category toggles, selected state,
 * and multi-year coverage without duplicates.
 */
export function getFestivalsForDate(
  dateStr: string,
  state: string = 'all',
  enabledCategories?: Record<FestivalCategory, boolean>,
  showGazettedOnly: boolean = false
): IndianFestival[] {
  const [yearStr, monthStr, dayStr] = dateStr.split('-');
  const mmdd = `${monthStr}-${dayStr}`;

  // Match against database
  const matchedList = INDIAN_FESTIVALS_DATABASE.filter((fest) => {
    if (fest.date !== dateStr && fest.endDate !== dateStr) {
      if (fest.endDate && fest.date <= dateStr && dateStr <= fest.endDate) {
        // spans across days
      } else {
        return false;
      }
    }
    return true;
  });

  // If a fixed solar/national holiday occurs on this mm-dd but is not in database for this year, generate it dynamically
  const fixedMap: Record<string, number> = {
    '01-26': 0, // Republic Day
    '04-14': 1, // Ambedkar Jayanti
    '08-15': 2, // Independence Day
    '10-02': 3, // Gandhi Jayanti
    '01-14': 4, // Makar Sankranti
    '12-25': 5, // Christmas
  };

  const fixedIdx = fixedMap[mmdd];
  if (fixedIdx !== undefined) {
    const template = FIXED_ANNUAL_HOLIDAYS[fixedIdx];
    const alreadyPresent = matchedList.some(
      (f) => f.category === template.category && f.nameEn.split(' ')[0] === template.nameEn.split(' ')[0]
    );
    if (!alreadyPresent) {
      matchedList.push({
        id: `fixed-${template.category}-${dateStr}`,
        ...template,
        date: dateStr,
      });
    }
  }

  // Filter by category, gazetted status, and state
  return matchedList.filter((fest) => {
    if (enabledCategories && !enabledCategories[fest.category]) {
      return false;
    }

    if (showGazettedOnly && fest.holidayType !== 'gazetted') {
      return false;
    }

    if (state !== 'all' && fest.applicableStates && fest.applicableStates.length > 0) {
      if (!fest.applicableStates.includes(state)) {
        return false;
      }
    }

    return true;
  });
}

/**
 * Get color styling for a festival category
 */
export function getCategoryBadgeStyle(category: FestivalCategory): {
  bg: string;
  text: string;
  border: string;
  dotColor: string;
} {
  switch (category) {
    case 'hindu':
      return {
        bg: 'bg-amber-100 dark:bg-amber-950/60',
        text: 'text-amber-800 dark:text-amber-300',
        border: 'border-amber-200 dark:border-amber-800',
        dotColor: '#d97706',
      };
    case 'islamic':
      return {
        bg: 'bg-emerald-100 dark:bg-emerald-950/60',
        text: 'text-emerald-800 dark:text-emerald-300',
        border: 'border-emerald-200 dark:border-emerald-800',
        dotColor: '#059669',
      };
    case 'sikh':
      return {
        bg: 'bg-orange-100 dark:bg-orange-950/60',
        text: 'text-orange-800 dark:text-orange-300',
        border: 'border-orange-200 dark:border-orange-800',
        dotColor: '#ea580c',
      };
    case 'christian':
      return {
        bg: 'bg-rose-100 dark:bg-rose-950/60',
        text: 'text-rose-800 dark:text-rose-300',
        border: 'border-rose-200 dark:border-rose-800',
        dotColor: '#e11d48',
      };
    case 'jain':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-950/60',
        text: 'text-yellow-800 dark:text-yellow-300',
        border: 'border-yellow-200 dark:border-yellow-800',
        dotColor: '#ca8a04',
      };
    case 'buddhist':
      return {
        bg: 'bg-indigo-100 dark:bg-indigo-950/60',
        text: 'text-indigo-800 dark:text-indigo-300',
        border: 'border-indigo-200 dark:border-indigo-800',
        dotColor: '#4f46e5',
      };
    case 'national':
    default:
      return {
        bg: 'bg-blue-100 dark:bg-blue-950/60',
        text: 'text-blue-800 dark:text-blue-300',
        border: 'border-blue-200 dark:border-blue-800',
        dotColor: '#2563eb',
      };
  }
}
