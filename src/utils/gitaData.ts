/**
 * Bhagavad Gita Quotes & Teachings Database for Hindu Mode
 * Includes Sanskrit Devanagari, Transliteration, English translation,
 * Hindi meaning, and practical daily life application.
 */

export interface GitaVerse {
  id: string;
  chapter: number;
  verse: number;
  citation: string;
  sanskrit: string;
  transliteration: string;
  meaningEn: string;
  meaningHi: string;
  practicalLesson: string;
  theme: 'Duty' | 'Devotion' | 'Peace' | 'Strength' | 'Wisdom' | 'Focus';
}

export const GITA_VERSES: GitaVerse[] = [
  {
    id: 'gita-2-47',
    chapter: 2,
    verse: 47,
    citation: 'Bhagavad Gita 2.47',
    sanskrit: 'कर्मण्येवाधिकारस्ते मा फलेषु कदाचन।\nमा कर्मफलहेतुर्भूर्मा ते सङ्गोऽस्त्वकर्मणि॥',
    transliteration: 'karmaṇy-evādhikāras te mā phaleṣhu kadāchana\nmā karma-phala-hetur bhūr mā te saṅgo ’stvakarmaṇi',
    meaningEn: 'You have a right to perform your prescribed duty, but never to the fruits of action. Never consider yourself the cause of the results, and never be attached to inaction.',
    meaningHi: 'तुम्हारा अधिकार केवल कर्म करने में है, उसके फलों में कभी नहीं। इसलिए कर्म के फल की इच्छा मत करो और अकर्मण्यता (काम न करने) में भी तुम्हारी आसक्ति न हो।',
    practicalLesson: 'Focus 100% of your energy on your effort and process today without anxiety over future outcomes.',
    theme: 'Duty',
  },
  {
    id: 'gita-4-7',
    chapter: 4,
    verse: 7,
    citation: 'Bhagavad Gita 4.7',
    sanskrit: 'यदा यदा हि धर्मस्य ग्लानिर्भवति भारत।\nअभ्युत्थानमधर्मस्य तदात्मानं सृजाम्यहम्॥',
    transliteration: 'yadā yadā hi dharmasya glānir bhavati bhārata\nabhyutthānam adharmasya tadātmānaṁ sṛijāmyaham',
    meaningEn: 'Whenever righteousness declines and unrighteousness rises in the world, O descendant of Bharata, at that time I manifest Myself on earth.',
    meaningHi: 'हे भारत! जब-जब धर्म की हानि होती है और अधर्म का बोलबाला होता है, तब-तब मैं धर्म की रक्षा और स्थापना के लिए स्वयं प्रकट होता हूँ।',
    practicalLesson: 'Stand firmly for truth, justice, and compassion in every small decision today; good always prevails.',
    theme: 'Strength',
  },
  {
    id: 'gita-2-48',
    chapter: 2,
    verse: 48,
    citation: 'Bhagavad Gita 2.48',
    sanskrit: 'योगस्थः कुरु कर्माणि सङ्गं त्यक्त्वा धनञ्जय।\nसिद्ध्यसिद्ध्योः समो भूत्वा समत्वं योग उच्यते॥',
    transliteration: 'yoga-sthaḥ kuru karmāṇi saṅgaṁ tyaktvā dhanañjaya\nsiddhy-asiddhyoḥ samo bhūtvā samatvaṁ yoga uchyate',
    meaningEn: 'Perform your duties established in Yoga, abandoning attachment, and remaining even-minded in success and failure. This equanimity of mind is known as Yoga.',
    meaningHi: 'हे धनंजय! आसक्ति को त्यागकर तथा सिद्धि और असिद्धि (सफलता और विफलता) में समभाव रखकर कर्म करो। यह समत्व भाव ही योग कहलाता है।',
    practicalLesson: 'Cultivate inner peace by accepting both wins and setbacks with grace and calm resilience.',
    theme: 'Peace',
  },
  {
    id: 'gita-6-5',
    chapter: 6,
    verse: 5,
    citation: 'Bhagavad Gita 6.5',
    sanskrit: 'उद्धरेदात्मनात्मानं नात्मानमवसादयेत्।\nआत्मैव ह्यात्मनो बन्धुरात्मैव रिपुरात्मनः॥',
    transliteration: 'uddhared ātmanātmānaṁ nātmānam avasādayet\nātmaiva hyātmano bandhur ātmaiva ripur ātmanaḥ',
    meaningEn: 'Elevate yourself through the power of your own mind, and do not degrade yourself. For the mind can be the greatest friend, and the mind can also be the worst enemy.',
    meaningHi: 'मनुष्य को चाहिए कि वह अपने मन द्वारा अपना उद्धार करे, अपने आपको नीचे न गिराए। क्योंकि मन ही मनुष्य का सबसे बड़ा मित्र है और मन ही सबसे बड़ा शत्रु।',
    practicalLesson: 'Tame your thoughts through positive self-discipline and meditation; your mind creates your reality.',
    theme: 'Wisdom',
  },
  {
    id: 'gita-9-22',
    chapter: 9,
    verse: 22,
    citation: 'Bhagavad Gita 9.22',
    sanskrit: 'अनन्याश्चिन्तयन्तो मां ये जनाः पर्युपासते।\nतेषां नित्याभियुक्तानां योगक्षेमं वहाम्यहम्॥',
    transliteration: 'ananyāśh chintayanto māṁ ye janāḥ paryupāsate\nteṣhāṁ nityābhiyuktānāṁ yoga-kṣhemaṁ vahāmyaham',
    meaningEn: 'To those who are constantly devoted to Me and worship Me with single-minded love, I carry what they lack and preserve what they have.',
    meaningHi: 'जो अनन्य भक्त केवल मेरा ही चिंतन करते हुए निष्काम भाव से उपासना करते हैं, उन निरंतर युक्त भक्तों के योग-क्षेम (आवश्यकताओं की पूर्ति व सुरक्षा) का वहन मैं स्वयं करता हूँ।',
    practicalLesson: 'Surrender fear and worry to the Divine. Trust that sincere devotion brings protection and peace.',
    theme: 'Devotion',
  },
  {
    id: 'gita-18-66',
    chapter: 18,
    verse: 66,
    citation: 'Bhagavad Gita 18.66',
    sanskrit: 'सर्वधर्मान्परित्यज्य मामेकं शरणं व्रज।\nअहं त्वां सर्वपापेभ्यो मोक्षयिष्यामि मा शुचः॥',
    transliteration: 'sarva-dharmān parityajya mām ekaṁ śharaṇaṁ vraja\nahaṁ tvāṁ sarva-pāpebhyo mokṣhayiṣhyāmi mā śhuchaḥ',
    meaningEn: 'Abandon all varieties of worldly dogma and surrender unto Me alone. I shall deliver you from all sinful reactions. Do not grieve.',
    meaningHi: 'सब चिंताओं और बंधनों को त्यागकर केवल मेरी शरण में आ जाओ। मैं तुम्हें समस्त दुःखों और पापों से मुक्त कर दूँगा, शोक मत करो।',
    practicalLesson: 'Let go of guilt and anxiety. Take refuge in the highest spiritual consciousness and move forward with courage.',
    theme: 'Devotion',
  },
  {
    id: 'gita-6-19',
    chapter: 6,
    verse: 19,
    citation: 'Bhagavad Gita 6.19',
    sanskrit: 'यथा दीपो निवातस्थो नेङ्गते सोपमा स्मृता।\nयोगिनो यतचित्तस्य युञ्जतो योगमात्मनः॥',
    transliteration: 'yathā dīpo nivāta-stho neṅgate sopamā smṛitā\nyogino yata-chittasya yuñjato yogam ātmanaḥ',
    meaningEn: 'As a lamp placed in a windless spot does not flicker, such is the metaphor for a yogi of disciplined mind who practices meditation on the Self.',
    meaningHi: 'जिस प्रकार वायुरहित स्थान में रखा दीपक हिलता-डुलता नहीं, ठीक उसी प्रकार आत्म-साधना में लीन योगी का एकाग्र चित्त स्थिर रहता है।',
    practicalLesson: 'Shield your mind today from distracting worldly winds through steady breathing and focused single-tasking.',
    theme: 'Focus',
  },
];

/**
 * Returns the Gita verse for any day.
 */
export function getDailyGitaVerse(date: Date): GitaVerse {
  const dayOfYear = Math.floor(
    (date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000
  );
  const index = Math.abs(dayOfYear % GITA_VERSES.length);
  return GITA_VERSES[index];
}
