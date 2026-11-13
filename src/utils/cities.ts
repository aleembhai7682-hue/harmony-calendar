/**
 * Global & All-India Cities Geographic Coordinates Database
 * Verified latitude, longitude, elevation, country, and IANA timezones
 * for Sunrise, Sunset, Rahu Kaal, Abhijit Muhurat, and Prayer Time calculations.
 *
 * Strictly avoids silently assuming Mumbai or any other hardcoded default city.
 */

import tzlookup from 'tz-lookup';
import { isValidIanaTimezone } from './istTime';

export interface CityLocation {
  id: string;
  nameEn: string;
  nameHi: string;
  nameUr: string;
  country: string;
  countryCode: string;
  stateCode: string;
  stateOrRegion: string;
  latitude: number;
  longitude: number;
  elevationM: number;
  timezone: string;
}

export const INDIAN_CITIES: CityLocation[] = [
  // Uttar Pradesh
  {
    id: 'kanpur',
    nameEn: 'Kanpur',
    nameHi: 'कानपुर',
    nameUr: 'کانپور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'UP',
    stateOrRegion: 'Uttar Pradesh',
    latitude: 26.4499,
    longitude: 80.3319,
    elevationM: 126,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'lucknow',
    nameEn: 'Lucknow',
    nameHi: 'लखनऊ',
    nameUr: 'لکھنؤ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'UP',
    stateOrRegion: 'Uttar Pradesh',
    latitude: 26.8467,
    longitude: 80.9462,
    elevationM: 123,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'varanasi',
    nameEn: 'Varanasi (Kashi)',
    nameHi: 'वाराणसी (काशी)',
    nameUr: 'وارانسی (بنارس)',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'UP',
    stateOrRegion: 'Uttar Pradesh',
    latitude: 25.3176,
    longitude: 82.9739,
    elevationM: 81,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'agra',
    nameEn: 'Agra',
    nameHi: 'आगरा',
    nameUr: 'آگرہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'UP',
    stateOrRegion: 'Uttar Pradesh',
    latitude: 27.1767,
    longitude: 78.0081,
    elevationM: 171,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'prayagraj',
    nameEn: 'Prayagraj (Allahabad)',
    nameHi: 'प्रयागराज',
    nameUr: 'پریاگ راج',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'UP',
    stateOrRegion: 'Uttar Pradesh',
    latitude: 25.4358,
    longitude: 81.8463,
    elevationM: 98,
    timezone: 'Asia/Kolkata',
  },
  // Delhi NCR
  {
    id: 'delhi',
    nameEn: 'New Delhi / NCR',
    nameHi: 'नई दिल्ली',
    nameUr: 'نئی دہلی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'DL',
    stateOrRegion: 'Delhi NCR',
    latitude: 28.6139,
    longitude: 77.2090,
    elevationM: 216,
    timezone: 'Asia/Kolkata',
  },
  // Maharashtra
  {
    id: 'mumbai',
    nameEn: 'Mumbai',
    nameHi: 'मुंबई',
    nameUr: 'ممبئی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MH',
    stateOrRegion: 'Maharashtra',
    latitude: 19.0760,
    longitude: 72.8777,
    elevationM: 14,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'pune',
    nameEn: 'Pune',
    nameHi: 'पुणे',
    nameUr: 'پونے',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MH',
    stateOrRegion: 'Maharashtra',
    latitude: 18.5204,
    longitude: 73.8567,
    elevationM: 560,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'nagpur',
    nameEn: 'Nagpur',
    nameHi: 'नागपुर',
    nameUr: 'ناگپور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MH',
    stateOrRegion: 'Maharashtra',
    latitude: 21.1458,
    longitude: 79.0882,
    elevationM: 310,
    timezone: 'Asia/Kolkata',
  },
  // Karnataka
  {
    id: 'bengaluru',
    nameEn: 'Bengaluru',
    nameHi: 'बेंगलुरु',
    nameUr: 'بنگلور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'KA',
    stateOrRegion: 'Karnataka',
    latitude: 12.9716,
    longitude: 77.5946,
    elevationM: 920,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'mysuru',
    nameEn: 'Mysuru',
    nameHi: 'मैसूरु',
    nameUr: 'میسور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'KA',
    stateOrRegion: 'Karnataka',
    latitude: 12.2958,
    longitude: 76.6394,
    elevationM: 763,
    timezone: 'Asia/Kolkata',
  },
  // Telangana & Andhra Pradesh
  {
    id: 'hyderabad',
    nameEn: 'Hyderabad',
    nameHi: 'हैदराबाद',
    nameUr: 'حیدرآباد',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'TS',
    stateOrRegion: 'Telangana',
    latitude: 17.3850,
    longitude: 78.4867,
    elevationM: 505,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'visakhapatnam',
    nameEn: 'Visakhapatnam',
    nameHi: 'विशाखापत्तनम',
    nameUr: 'وشاکھاپٹنم',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'AP',
    stateOrRegion: 'Andhra Pradesh',
    latitude: 17.6868,
    longitude: 83.2185,
    elevationM: 45,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'vijayawada',
    nameEn: 'Vijayawada',
    nameHi: 'विजयवाड़ा',
    nameUr: 'وجئے واڑہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'AP',
    stateOrRegion: 'Andhra Pradesh',
    latitude: 16.5062,
    longitude: 80.6480,
    elevationM: 23,
    timezone: 'Asia/Kolkata',
  },
  // West Bengal
  {
    id: 'kolkata',
    nameEn: 'Kolkata',
    nameHi: 'कोलकाता',
    nameUr: 'کولکتہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'WB',
    stateOrRegion: 'West Bengal',
    latitude: 22.5726,
    longitude: 88.3639,
    elevationM: 9,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'siliguri',
    nameEn: 'Siliguri',
    nameHi: 'सिलीगुड़ी',
    nameUr: 'سلی گوڑی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'WB',
    stateOrRegion: 'West Bengal',
    latitude: 26.7271,
    longitude: 88.3953,
    elevationM: 122,
    timezone: 'Asia/Kolkata',
  },
  // Tamil Nadu & Puducherry
  {
    id: 'chennai',
    nameEn: 'Chennai',
    nameHi: 'चेन्नई',
    nameUr: 'چنئی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'TN',
    stateOrRegion: 'Tamil Nadu',
    latitude: 13.0827,
    longitude: 80.2707,
    elevationM: 6,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'coimbatore',
    nameEn: 'Coimbatore',
    nameHi: 'कोयंबटूर',
    nameUr: 'کوئمبتور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'TN',
    stateOrRegion: 'Tamil Nadu',
    latitude: 11.0168,
    longitude: 76.9558,
    elevationM: 411,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'puducherry',
    nameEn: 'Puducherry',
    nameHi: 'पुदुचेरी',
    nameUr: 'پڈوچیری',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'PY',
    stateOrRegion: 'Puducherry',
    latitude: 11.9416,
    longitude: 79.8083,
    elevationM: 3,
    timezone: 'Asia/Kolkata',
  },
  // Gujarat
  {
    id: 'ahmedabad',
    nameEn: 'Ahmedabad',
    nameHi: 'अहमदाबाद',
    nameUr: 'احمد آباد',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'GJ',
    stateOrRegion: 'Gujarat',
    latitude: 23.0225,
    longitude: 72.5714,
    elevationM: 53,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'surat',
    nameEn: 'Surat',
    nameHi: 'सूरत',
    nameUr: 'سورت',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'GJ',
    stateOrRegion: 'Gujarat',
    latitude: 21.1702,
    longitude: 72.8311,
    elevationM: 13,
    timezone: 'Asia/Kolkata',
  },
  // Rajasthan
  {
    id: 'jaipur',
    nameEn: 'Jaipur',
    nameHi: 'जयपुर',
    nameUr: 'جے پور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'RJ',
    stateOrRegion: 'Rajasthan',
    latitude: 26.9124,
    longitude: 75.7873,
    elevationM: 431,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'jodhpur',
    nameEn: 'Jodhpur',
    nameHi: 'जोधपुर',
    nameUr: 'جودھ پور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'RJ',
    stateOrRegion: 'Rajasthan',
    latitude: 26.2389,
    longitude: 73.0243,
    elevationM: 231,
    timezone: 'Asia/Kolkata',
  },
  // Bihar & Jharkhand
  {
    id: 'patna',
    nameEn: 'Patna',
    nameHi: 'पटना',
    nameUr: 'پٹنہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'BR',
    stateOrRegion: 'Bihar',
    latitude: 25.5941,
    longitude: 85.1376,
    elevationM: 53,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'ranchi',
    nameEn: 'Ranchi',
    nameHi: 'रांची',
    nameUr: 'رانچی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'JH',
    stateOrRegion: 'Jharkhand',
    latitude: 23.3441,
    longitude: 85.3096,
    elevationM: 651,
    timezone: 'Asia/Kolkata',
  },
  // Madhya Pradesh & Chhattisgarh
  {
    id: 'bhopal',
    nameEn: 'Bhopal',
    nameHi: 'भोपाल',
    nameUr: 'بھوپال',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MP',
    stateOrRegion: 'Madhya Pradesh',
    latitude: 23.2599,
    longitude: 77.4126,
    elevationM: 500,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'indore',
    nameEn: 'Indore',
    nameHi: 'इंदौर',
    nameUr: 'اندور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MP',
    stateOrRegion: 'Madhya Pradesh',
    latitude: 22.7196,
    longitude: 75.8577,
    elevationM: 553,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'raipur',
    nameEn: 'Raipur',
    nameHi: 'रायपुर',
    nameUr: 'رائے پور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'CG',
    stateOrRegion: 'Chhattisgarh',
    latitude: 21.2514,
    longitude: 81.6296,
    elevationM: 298,
    timezone: 'Asia/Kolkata',
  },
  // Odisha & Goa
  {
    id: 'bhubaneswar',
    nameEn: 'Bhubaneswar',
    nameHi: 'भुवनेश्वर',
    nameUr: 'بھونیشور',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'OD',
    stateOrRegion: 'Odisha',
    latitude: 20.2961,
    longitude: 85.8245,
    elevationM: 45,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'panaji',
    nameEn: 'Panaji',
    nameHi: 'पणजी',
    nameUr: 'پنجی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'GA',
    stateOrRegion: 'Goa',
    latitude: 15.4909,
    longitude: 73.8278,
    elevationM: 7,
    timezone: 'Asia/Kolkata',
  },
  // Kerala
  {
    id: 'thiruvananthapuram',
    nameEn: 'Thiruvananthapuram',
    nameHi: 'तिरुवनंतपुरम',
    nameUr: 'ترواننت پورم',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'KL',
    stateOrRegion: 'Kerala',
    latitude: 8.5241,
    longitude: 76.9366,
    elevationM: 10,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'kochi',
    nameEn: 'Kochi',
    nameHi: 'कोच्चि',
    nameUr: 'کوچی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'KL',
    stateOrRegion: 'Kerala',
    latitude: 9.9312,
    longitude: 76.2673,
    elevationM: 4,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'calicut',
    nameEn: 'Kozhikode (Calicut)',
    nameHi: 'कोझिकोड',
    nameUr: 'کالی کٹ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'KL',
    stateOrRegion: 'Kerala',
    latitude: 11.2588,
    longitude: 75.7804,
    elevationM: 1,
    timezone: 'Asia/Kolkata',
  },
  // Punjab, Haryana, Chandigarh, Himachal, Uttarakhand, J&K, Ladakh
  {
    id: 'chandigarh',
    nameEn: 'Chandigarh',
    nameHi: 'चंडीगढ़',
    nameUr: 'چندی گڑھ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'CH',
    stateOrRegion: 'Chandigarh / Punjab / Haryana',
    latitude: 30.7333,
    longitude: 76.7794,
    elevationM: 321,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'amritsar',
    nameEn: 'Amritsar',
    nameHi: 'अमृतसर',
    nameUr: 'امرتسر',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'PB',
    stateOrRegion: 'Punjab',
    latitude: 31.6340,
    longitude: 74.8723,
    elevationM: 234,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'gurugram',
    nameEn: 'Gurugram',
    nameHi: 'गुरुग्राम',
    nameUr: 'گروگرام',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'HR',
    stateOrRegion: 'Haryana',
    latitude: 28.4595,
    longitude: 77.0266,
    elevationM: 217,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'dehradun',
    nameEn: 'Dehradun',
    nameHi: 'देहरादून',
    nameUr: 'دہرادون',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'UK',
    stateOrRegion: 'Uttarakhand',
    latitude: 30.3165,
    longitude: 78.0322,
    elevationM: 640,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'shimla',
    nameEn: 'Shimla',
    nameHi: 'शिमला',
    nameUr: 'شملہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'HP',
    stateOrRegion: 'Himachal Pradesh',
    latitude: 31.1048,
    longitude: 77.1734,
    elevationM: 2276,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'srinagar',
    nameEn: 'Srinagar',
    nameHi: 'श्रीनगर',
    nameUr: 'سری نگر',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'JK',
    stateOrRegion: 'Jammu & Kashmir',
    latitude: 34.0837,
    longitude: 74.7973,
    elevationM: 1585,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'jammu',
    nameEn: 'Jammu',
    nameHi: 'जम्मू',
    nameUr: 'جموں',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'JK',
    stateOrRegion: 'Jammu & Kashmir',
    latitude: 32.7266,
    longitude: 74.8570,
    elevationM: 327,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'leh',
    nameEn: 'Leh',
    nameHi: 'लेह',
    nameUr: 'لیہہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'LA',
    stateOrRegion: 'Ladakh',
    latitude: 34.1526,
    longitude: 77.5771,
    elevationM: 3500,
    timezone: 'Asia/Kolkata',
  },
  // Northeast India & Andaman
  {
    id: 'guwahati',
    nameEn: 'Guwahati',
    nameHi: 'गुवाहाटी',
    nameUr: 'گواہاٹی',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'AS',
    stateOrRegion: 'Assam',
    latitude: 26.1445,
    longitude: 91.7362,
    elevationM: 55,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'shillong',
    nameEn: 'Shillong',
    nameHi: 'शिलांग',
    nameUr: 'شیلانگ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'ML',
    stateOrRegion: 'Meghalaya',
    latitude: 25.5788,
    longitude: 91.8933,
    elevationM: 1496,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'imphal',
    nameEn: 'Imphal',
    nameHi: 'इंफाल',
    nameUr: 'امپھال',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MN',
    stateOrRegion: 'Manipur',
    latitude: 24.8170,
    longitude: 93.9368,
    elevationM: 786,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'agartala',
    nameEn: 'Agartala',
    nameHi: 'अगरतला',
    nameUr: 'اگرتلہ',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'TR',
    stateOrRegion: 'Tripura',
    latitude: 23.8315,
    longitude: 91.2868,
    elevationM: 13,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'aizawl',
    nameEn: 'Aizawl',
    nameHi: 'आइजोल',
    nameUr: 'ایزول',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'MZ',
    stateOrRegion: 'Mizoram',
    latitude: 23.7271,
    longitude: 92.7176,
    elevationM: 1132,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'kohima',
    nameEn: 'Kohima',
    nameHi: 'कोहिमा',
    nameUr: 'کوہیما',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'NL',
    stateOrRegion: 'Nagaland',
    latitude: 25.6751,
    longitude: 94.1086,
    elevationM: 1444,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'itanagar',
    nameEn: 'Itanagar',
    nameHi: 'ईटानगर',
    nameUr: 'ایٹانگر',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'AR',
    stateOrRegion: 'Arunachal Pradesh',
    latitude: 27.0844,
    longitude: 93.6053,
    elevationM: 440,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'gangtok',
    nameEn: 'Gangtok',
    nameHi: 'गंगटोक',
    nameUr: 'گنگٹوک',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'SK',
    stateOrRegion: 'Sikkim',
    latitude: 27.3314,
    longitude: 88.6138,
    elevationM: 1650,
    timezone: 'Asia/Kolkata',
  },
  {
    id: 'port_blair',
    nameEn: 'Sri Vijaya Puram (Port Blair)',
    nameHi: 'पोर्ट ब्लेयर',
    nameUr: 'پورٹ بلیئر',
    country: 'India',
    countryCode: 'IN',
    stateCode: 'AN',
    stateOrRegion: 'Andaman & Nicobar Islands',
    latitude: 11.6234,
    longitude: 92.7265,
    elevationM: 16,
    timezone: 'Asia/Kolkata',
  },
];

export const INTERNATIONAL_CITIES: CityLocation[] = [
  {
    id: 'london',
    nameEn: 'London',
    nameHi: 'लंदन',
    nameUr: 'لندن',
    country: 'United Kingdom',
    countryCode: 'GB',
    stateCode: 'ENG',
    stateOrRegion: 'England',
    latitude: 51.5074,
    longitude: -0.1278,
    elevationM: 25,
    timezone: 'Europe/London',
  },
  {
    id: 'birmingham',
    nameEn: 'Birmingham',
    nameHi: 'बर्मिंघम',
    nameUr: 'برمنگھم',
    country: 'United Kingdom',
    countryCode: 'GB',
    stateCode: 'ENG',
    stateOrRegion: 'England',
    latitude: 52.4862,
    longitude: -1.8904,
    elevationM: 140,
    timezone: 'Europe/London',
  },
  {
    id: 'manchester',
    nameEn: 'Manchester',
    nameHi: 'मैनचेस्टर',
    nameUr: 'مانچسٹر',
    country: 'United Kingdom',
    countryCode: 'GB',
    stateCode: 'ENG',
    stateOrRegion: 'England',
    latitude: 53.4808,
    longitude: -2.2426,
    elevationM: 38,
    timezone: 'Europe/London',
  },
  {
    id: 'dubai',
    nameEn: 'Dubai',
    nameHi: 'दुबई',
    nameUr: 'دبئی',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    stateCode: 'DU',
    stateOrRegion: 'Dubai',
    latitude: 25.2048,
    longitude: 55.2708,
    elevationM: 5,
    timezone: 'Asia/Dubai',
  },
  {
    id: 'abu_dhabi',
    nameEn: 'Abu Dhabi',
    nameHi: 'अबू धाबी',
    nameUr: 'ابوظہبی',
    country: 'United Arab Emirates',
    countryCode: 'AE',
    stateCode: 'AZ',
    stateOrRegion: 'Abu Dhabi',
    latitude: 24.4539,
    longitude: 54.3773,
    elevationM: 10,
    timezone: 'Asia/Dubai',
  },
  {
    id: 'new_york',
    nameEn: 'New York',
    nameHi: 'न्यूयॉर्क',
    nameUr: 'نیویارک',
    country: 'United States',
    countryCode: 'US',
    stateCode: 'NY',
    stateOrRegion: 'New York',
    latitude: 40.7128,
    longitude: -74.0060,
    elevationM: 10,
    timezone: 'America/New_York',
  },
  {
    id: 'los_angeles',
    nameEn: 'Los Angeles',
    nameHi: 'लॉस एंजिल्स',
    nameUr: 'لاس اینجلس',
    country: 'United States',
    countryCode: 'US',
    stateCode: 'CA',
    stateOrRegion: 'California',
    latitude: 34.0522,
    longitude: -118.2437,
    elevationM: 71,
    timezone: 'America/Los_Angeles',
  },
  {
    id: 'chicago',
    nameEn: 'Chicago',
    nameHi: 'शिकागो',
    nameUr: 'شکاگو',
    country: 'United States',
    countryCode: 'US',
    stateCode: 'IL',
    stateOrRegion: 'Illinois',
    latitude: 41.8781,
    longitude: -87.6298,
    elevationM: 181,
    timezone: 'America/Chicago',
  },
  {
    id: 'houston',
    nameEn: 'Houston',
    nameHi: 'ह्यूस्टन',
    nameUr: 'ہیوسٹن',
    country: 'United States',
    countryCode: 'US',
    stateCode: 'TX',
    stateOrRegion: 'Texas',
    latitude: 29.7604,
    longitude: -95.3698,
    elevationM: 15,
    timezone: 'America/Chicago',
  },
  {
    id: 'toronto',
    nameEn: 'Toronto',
    nameHi: 'टोरंटो',
    nameUr: 'ٹورنٹو',
    country: 'Canada',
    countryCode: 'CA',
    stateCode: 'ON',
    stateOrRegion: 'Ontario',
    latitude: 43.6532,
    longitude: -79.3832,
    elevationM: 76,
    timezone: 'America/Toronto',
  },
  {
    id: 'vancouver',
    nameEn: 'Vancouver',
    nameHi: 'वैंकूवर',
    nameUr: 'وینکوور',
    country: 'Canada',
    countryCode: 'CA',
    stateCode: 'BC',
    stateOrRegion: 'British Columbia',
    latitude: 49.2827,
    longitude: -123.1207,
    elevationM: 2,
    timezone: 'America/Vancouver',
  },
  {
    id: 'mecca',
    nameEn: 'Mecca (Makkah)',
    nameHi: 'मक्का',
    nameUr: 'مکہ مکرمہ',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    stateCode: 'MK',
    stateOrRegion: 'Makkah Region',
    latitude: 21.4225,
    longitude: 39.8262,
    elevationM: 277,
    timezone: 'Asia/Riyadh',
  },
  {
    id: 'medina',
    nameEn: 'Medina (Madinah)',
    nameHi: 'मदीना',
    nameUr: 'مدینہ منورہ',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    stateCode: 'MD',
    stateOrRegion: 'Madinah Region',
    latitude: 24.4672,
    longitude: 39.6111,
    elevationM: 608,
    timezone: 'Asia/Riyadh',
  },
  {
    id: 'riyadh',
    nameEn: 'Riyadh',
    nameHi: 'रियाद',
    nameUr: 'ریاض',
    country: 'Saudi Arabia',
    countryCode: 'SA',
    stateCode: 'RD',
    stateOrRegion: 'Riyadh Region',
    latitude: 24.7136,
    longitude: 46.6753,
    elevationM: 612,
    timezone: 'Asia/Riyadh',
  },
  {
    id: 'doha',
    nameEn: 'Doha',
    nameHi: 'दोहा',
    nameUr: 'دوحہ',
    country: 'Qatar',
    countryCode: 'QA',
    stateCode: 'DA',
    stateOrRegion: 'Doha',
    latitude: 25.2854,
    longitude: 51.5310,
    elevationM: 10,
    timezone: 'Asia/Qatar',
  },
  {
    id: 'kuwait_city',
    nameEn: 'Kuwait City',
    nameHi: 'कुवैत सिटी',
    nameUr: 'کویت سٹی',
    country: 'Kuwait',
    countryCode: 'KW',
    stateCode: 'KU',
    stateOrRegion: 'Al Asimah',
    latitude: 29.3759,
    longitude: 47.9774,
    elevationM: 16,
    timezone: 'Asia/Kuwait',
  },
  {
    id: 'muscat',
    nameEn: 'Muscat',
    nameHi: 'मस्कट',
    nameUr: 'مسقط',
    country: 'Oman',
    countryCode: 'OM',
    stateCode: 'MA',
    stateOrRegion: 'Muscat',
    latitude: 23.5880,
    longitude: 58.3829,
    elevationM: 69,
    timezone: 'Asia/Muscat',
  },
  {
    id: 'singapore',
    nameEn: 'Singapore',
    nameHi: 'सिंगापुर',
    nameUr: 'سنگاپور',
    country: 'Singapore',
    countryCode: 'SG',
    stateCode: 'SG',
    stateOrRegion: 'Singapore',
    latitude: 1.3521,
    longitude: 103.8198,
    elevationM: 15,
    timezone: 'Asia/Singapore',
  },
  {
    id: 'kuala_lumpur',
    nameEn: 'Kuala Lumpur',
    nameHi: 'कुआलालंपुर',
    nameUr: 'کوالالمپور',
    country: 'Malaysia',
    countryCode: 'MY',
    stateCode: 'KL',
    stateOrRegion: 'Federal Territory',
    latitude: 3.1390,
    longitude: 101.6869,
    elevationM: 50,
    timezone: 'Asia/Kuala_Lumpur',
  },
  {
    id: 'jakarta',
    nameEn: 'Jakarta',
    nameHi: 'जकार्ता',
    nameUr: 'جکارتہ',
    country: 'Indonesia',
    countryCode: 'ID',
    stateCode: 'JK',
    stateOrRegion: 'Java',
    latitude: -6.2088,
    longitude: 106.8456,
    elevationM: 8,
    timezone: 'Asia/Jakarta',
  },
  {
    id: 'karachi',
    nameEn: 'Karachi',
    nameHi: 'कराची',
    nameUr: 'کراچی',
    country: 'Pakistan',
    countryCode: 'PK',
    stateCode: 'SD',
    stateOrRegion: 'Sindh',
    latitude: 24.8607,
    longitude: 67.0011,
    elevationM: 8,
    timezone: 'Asia/Karachi',
  },
  {
    id: 'lahore',
    nameEn: 'Lahore',
    nameHi: 'लाहौर',
    nameUr: 'لاہور',
    country: 'Pakistan',
    countryCode: 'PK',
    stateCode: 'PB',
    stateOrRegion: 'Punjab',
    latitude: 31.5204,
    longitude: 74.3587,
    elevationM: 217,
    timezone: 'Asia/Karachi',
  },
  {
    id: 'dhaka',
    nameEn: 'Dhaka',
    nameHi: 'ढाका',
    nameUr: 'ڈھاکہ',
    country: 'Bangladesh',
    countryCode: 'BD',
    stateCode: 'DA',
    stateOrRegion: 'Dhaka Division',
    latitude: 23.8103,
    longitude: 90.4125,
    elevationM: 4,
    timezone: 'Asia/Dhaka',
  },
  {
    id: 'kathmandu',
    nameEn: 'Kathmandu',
    nameHi: 'काठमांडू',
    nameUr: 'کھٹمنڈو',
    country: 'Nepal',
    countryCode: 'NP',
    stateCode: 'BA',
    stateOrRegion: 'Bagmati',
    latitude: 27.7172,
    longitude: 85.3240,
    elevationM: 1400,
    timezone: 'Asia/Kathmandu',
  },
  {
    id: 'colombo',
    nameEn: 'Colombo',
    nameHi: 'कोलंबो',
    nameUr: 'کولمبو',
    country: 'Sri Lanka',
    countryCode: 'LK',
    stateCode: 'WP',
    stateOrRegion: 'Western Province',
    latitude: 6.9271,
    longitude: 79.8612,
    elevationM: 7,
    timezone: 'Asia/Colombo',
  },
  {
    id: 'sydney',
    nameEn: 'Sydney',
    nameHi: 'सिडनी',
    nameUr: 'سڈنی',
    country: 'Australia',
    countryCode: 'AU',
    stateCode: 'NSW',
    stateOrRegion: 'New South Wales',
    latitude: -33.8688,
    longitude: 151.2093,
    elevationM: 19,
    timezone: 'Australia/Sydney',
  },
  {
    id: 'melbourne',
    nameEn: 'Melbourne',
    nameHi: 'मेलबर्न',
    nameUr: 'ملبورن',
    country: 'Australia',
    countryCode: 'AU',
    stateCode: 'VIC',
    stateOrRegion: 'Victoria',
    latitude: -37.8136,
    longitude: 144.9631,
    elevationM: 31,
    timezone: 'Australia/Melbourne',
  },
  {
    id: 'adelaide',
    nameEn: 'Adelaide',
    nameHi: 'एडिलेड',
    nameUr: 'ایڈیلیڈ',
    country: 'Australia',
    countryCode: 'AU',
    stateCode: 'SA',
    stateOrRegion: 'South Australia',
    latitude: -34.9285,
    longitude: 138.6007,
    elevationM: 50,
    timezone: 'Australia/Adelaide',
  },
  {
    id: 'st_johns',
    nameEn: "St. John's",
    nameHi: 'सेंट जॉन्स',
    nameUr: 'سینٹ جانز',
    country: 'Canada',
    countryCode: 'CA',
    stateCode: 'NL',
    stateOrRegion: 'Newfoundland and Labrador',
    latitude: 47.5615,
    longitude: -52.7126,
    elevationM: 140,
    timezone: 'America/St_Johns',
  },
  {
    id: 'berlin',
    nameEn: 'Berlin',
    nameHi: 'बर्लिन',
    nameUr: 'برلن',
    country: 'Germany',
    countryCode: 'DE',
    stateCode: 'BE',
    stateOrRegion: 'Berlin',
    latitude: 52.5200,
    longitude: 13.4050,
    elevationM: 34,
    timezone: 'Europe/Berlin',
  },
  {
    id: 'paris',
    nameEn: 'Paris',
    nameHi: 'पेरिस',
    nameUr: 'پیرس',
    country: 'France',
    countryCode: 'FR',
    stateCode: 'IDF',
    stateOrRegion: 'Île-de-France',
    latitude: 48.8566,
    longitude: 2.3522,
    elevationM: 35,
    timezone: 'Europe/Paris',
  },
  {
    id: 'istanbul',
    nameEn: 'Istanbul',
    nameHi: 'इस्तांबुल',
    nameUr: 'استنبول',
    country: 'Turkey',
    countryCode: 'TR',
    stateCode: '34',
    stateOrRegion: 'Marmara',
    latitude: 41.0082,
    longitude: 28.9784,
    elevationM: 40,
    timezone: 'Europe/Istanbul',
  },
  {
    id: 'cairo',
    nameEn: 'Cairo',
    nameHi: 'काहिरा',
    nameUr: 'قاہرہ',
    country: 'Egypt',
    countryCode: 'EG',
    stateCode: 'C',
    stateOrRegion: 'Cairo',
    latitude: 30.0444,
    longitude: 31.2357,
    elevationM: 23,
    timezone: 'Africa/Cairo',
  },
  {
    id: 'tokyo',
    nameEn: 'Tokyo',
    nameHi: 'टोक्यो',
    nameUr: 'ٹوکیو',
    country: 'Japan',
    countryCode: 'JP',
    stateCode: '13',
    stateOrRegion: 'Kanto',
    latitude: 35.6762,
    longitude: 139.6503,
    elevationM: 40,
    timezone: 'Asia/Tokyo',
  },
  {
    id: 'johannesburg',
    nameEn: 'Johannesburg',
    nameHi: 'जोहान्सबर्ग',
    nameUr: 'جوہانسبرگ',
    country: 'South Africa',
    countryCode: 'ZA',
    stateCode: 'GP',
    stateOrRegion: 'Gauteng',
    latitude: -26.2041,
    longitude: 28.0473,
    elevationM: 1753,
    timezone: 'Africa/Johannesburg',
  },
];

export const ALL_CITIES: CityLocation[] = [...INDIAN_CITIES, ...INTERNATIONAL_CITIES];

export function isValidCoordinatePair(lat?: number, lon?: number): boolean {
  return (
    typeof lat === 'number' &&
    typeof lon === 'number' &&
    Number.isFinite(lat) &&
    Number.isFinite(lon) &&
    lat >= -90 &&
    lat <= 90 &&
    lon >= -180 &&
    lon <= 180
  );
}

/**
 * Checks whether the user has explicitly selected a city or provided valid custom/GPS coordinates.
 */
export function hasExplicitLocation(
  cityId?: string,
  customLat?: number,
  customLon?: number
): boolean {
  if (isValidCoordinatePair(customLat, customLon)) {
    return true;
  }
  if (
    cityId &&
    cityId.trim() &&
    cityId !== 'auto' &&
    cityId !== 'custom' &&
    cityId !== 'local_device' &&
    cityId !== 'unset'
  ) {
    return ALL_CITIES.some((c) => c.id.toLowerCase() === cityId.trim().toLowerCase());
  }
  return false;
}

/**
 * Returns the neutral unset location state without assuming Mumbai or any other city.
 */
export function getUnsetLocation(): CityLocation {
  return {
    id: 'unset',
    nameEn: 'Location not set',
    nameHi: 'स्थान चयनित नहीं',
    nameUr: 'مقام منتخب نہیں',
    country: '',
    countryCode: '',
    stateCode: '',
    stateOrRegion: '',
    latitude: NaN,
    longitude: NaN,
    elevationM: 0,
    timezone: '',
  };
}

/**
 * Checks whether a geographical location timezone string is present and a valid IANA zone.
 */
export function isValidLocationTimezone(timeZone?: string | null): boolean {
  return Boolean(timeZone && timeZone.trim() && isValidIanaTimezone(timeZone.trim()));
}

/**
 * Resolves any geographic (latitude, longitude) pair to its real IANA timezone ID
 * (e.g. 'Europe/London', 'America/New_York', 'Asia/Kolkata', 'Asia/Dubai').
 * Returns null if coordinates are invalid or resolution fails — never silently
 * falls back to the device timezone.
 */
export function resolveTimezoneFromCoordinates(lat: number, lon: number): string | null {
  if (!isValidCoordinatePair(lat, lon)) {
    return null;
  }
  try {
    const resolved = tzlookup(lat, lon);
    if (resolved && isValidIanaTimezone(resolved)) {
      return resolved;
    }
  } catch {}
  return null;
}

/**
 * Returns city location for the given cityId or custom coordinates.
 * Never silently assumes Mumbai or any fallback city when unset,
 * and never silently falls back to device timezone if coordinate resolution fails.
 */
export function getCityLocation(
  cityId?: string,
  customLat?: number,
  customLon?: number,
  customName?: string,
  customCountry?: string,
  customTimezone?: string
): CityLocation {
  // 1. Named city in curated database (preserves verified coordinates, country & IANA timezone)
  if (
    cityId &&
    cityId.trim() &&
    cityId !== 'auto' &&
    cityId !== 'custom' &&
    cityId !== 'local_device' &&
    cityId !== 'unset'
  ) {
    const found = ALL_CITIES.find((c) => c.id.toLowerCase() === cityId.trim().toLowerCase());
    if (found) return found;
  }

  // 2. Explicit custom / GPS / geocoded coordinates
  if (isValidCoordinatePair(customLat, customLon) && customLat !== undefined && customLon !== undefined) {
    const latStr = `${Math.abs(customLat).toFixed(2)}°${customLat >= 0 ? 'N' : 'S'}`;
    const lonStr = `${Math.abs(customLon).toFixed(2)}°${customLon >= 0 ? 'E' : 'W'}`;
    const displayName = customName?.trim() || `Custom Location (${latStr}, ${lonStr})`;
    const explicitTz = isValidLocationTimezone(customTimezone) ? customTimezone!.trim() : null;
    const resolvedTz = explicitTz ?? resolveTimezoneFromCoordinates(customLat, customLon) ?? '';
    return {
      id: 'custom',
      nameEn: displayName,
      nameHi: customName?.trim() || `कस्टम स्थान (${latStr}, ${lonStr})`,
      nameUr: customName?.trim() || `مخصوص مقام (${latStr}, ${lonStr})`,
      country: customCountry?.trim() || '',
      countryCode: '',
      stateCode: 'CUSTOM',
      stateOrRegion: customCountry?.trim() || 'Custom Coordinates',
      latitude: customLat,
      longitude: customLon,
      elevationM: 0,
      timezone: resolvedTz,
    };
  }

  // 3. Neutral unset state (never fall back silently to Mumbai or any guessed city)
  return getUnsetLocation();
}

/**
 * Formats "City, Country" clearly for display.
 */
export function formatCityCountryLabel(city: CityLocation): string {
  if (city.id === 'unset') return city.nameEn;
  if (city.country && !city.nameEn.toLowerCase().includes(city.country.toLowerCase())) {
    return `${city.nameEn}, ${city.country}`;
  }
  return city.nameEn;
}

/**
 * Returns sorted list of unique countries available in the verified local directory.
 */
export function getSupportedCountries(): { code: string; name: string }[] {
  const map = new Map<string, string>();
  for (const c of ALL_CITIES) {
    if (c.countryCode && c.country && !map.has(c.countryCode)) {
      map.set(c.countryCode, c.country);
    }
  }
  return Array.from(map.entries())
    .map(([code, name]) => ({ code, name }))
    .sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Filters the local verified database by city name, state/region, country, and optional countryCode.
 */
export function searchLocalCities(query: string, countryCode?: string): CityLocation[] {
  const q = query.trim().toLowerCase();
  const code = countryCode?.trim().toUpperCase();
  return ALL_CITIES.filter((c) => {
    if (code && code !== 'ALL' && c.countryCode.toUpperCase() !== code) {
      return false;
    }
    if (!q) return true;
    return (
      c.nameEn.toLowerCase().includes(q) ||
      c.nameHi.toLowerCase().includes(q) ||
      c.nameUr.toLowerCase().includes(q) ||
      c.country.toLowerCase().includes(q) ||
      c.stateOrRegion.toLowerCase().includes(q) ||
      c.stateCode.toLowerCase().includes(q)
    );
  });
}

/**
 * Queries the free, keyless Open-Meteo GeoNames Geocoding API for cities/towns worldwide.
 * Never fabricates coordinates; returns empty array if offline or no results found.
 */
export async function searchGlobalCitiesOnline(query: string): Promise<CityLocation[]> {
  const trimmed = query.trim();
  if (trimmed.length < 2 || typeof fetch === 'undefined') {
    return [];
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      trimmed
    )}&count=8&language=en&format=json`;
    const res = await fetch(url);
    if (!res.ok) return [];
    const data = await res.json();
    if (!data || !Array.isArray(data.results)) return [];

    return data.results
      .filter(
        (r: any) =>
          typeof r?.name === 'string' &&
          isValidCoordinatePair(Number(r?.latitude), Number(r?.longitude)) &&
          typeof r?.timezone === 'string'
      )
      .map((r: any) => ({
        id: `geocoded:${r.id ?? `${r.latitude},${r.longitude}`}`,
        nameEn: r.admin1 && r.admin1 !== r.name ? `${r.name} (${r.admin1})` : r.name,
        nameHi: r.name,
        nameUr: r.name,
        country: r.country || '',
        countryCode: r.country_code || '',
        stateCode: '',
        stateOrRegion: r.admin1 || r.country || '',
        latitude: Number(Number(r.latitude).toFixed(4)),
        longitude: Number(Number(r.longitude).toFixed(4)),
        elevationM: typeof r.elevation === 'number' ? Math.round(r.elevation) : 0,
        timezone: r.timezone,
      }));
  } catch {
    return [];
  }
}
