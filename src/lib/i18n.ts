import { Language } from './database';

export interface Translations {
  [key: string]: {
    en: string;
    sw: string; // Swahili
    ki: string; // Kikuyu
  };
}

export const translations: Translations = {
  // App Name & Branding
  'app.name': {
    en: 'AflaGuard',
    sw: 'AflaGuard',
    ki: 'AflaGuard'
  },
  'app.tagline': {
    en: 'Protecting Your Harvest',
    sw: 'Kulinda Mazao Yako',
    ki: 'Kũgitĩra Magetha Maku'
  },

  // Language Selection
  'language.select': {
    en: 'Select Your Language',
    sw: 'Chagua Lugha Yako',
    ki: 'Thuura Rũrĩmĩ Rwaku'
  },
  'language.english': {
    en: 'English',
    sw: 'Kiingereza',
    ki: 'Gĩthungũ'
  },
  'language.swahili': {
    en: 'Swahili',
    sw: 'Kiswahili',
    ki: 'Gĩthwairi'
  },
  'language.kikuyu': {
    en: 'Kikuyu',
    sw: 'Kikuyu',
    ki: 'Gĩkũyũ'
  },

  // Role Selection
  'role.select': {
    en: 'Choose Your Role',
    sw: 'Chagua Jukumu Lako',
    ki: 'Thuura Wĩra Waku'
  },
  'role.farmer': {
    en: 'Farmer',
    sw: 'Mkulima',
    ki: 'Mũrĩmi'
  },
  'role.buyer': {
    en: 'Buyer',
    sw: 'Mnunuzi',
    ki: 'Mũgũri'
  },
  'role.government': {
    en: 'Government',
    sw: 'Serikali',
    ki: 'Thirikari'
  },

  // Authentication
  'auth.phone': {
    en: 'Enter Phone Number',
    sw: 'Ingiza Nambari ya Simu',
    ki: 'Ĩkĩra Nambari ya Thimu'
  },
  'auth.otp': {
    en: 'Enter Verification Code',
    sw: 'Ingiza Msimbo wa Uthibitisho',
    ki: 'Ĩkĩra Kĩhumo kĩa Kũrũgamĩrĩra'
  },
  'auth.verify': {
    en: 'Verify',
    sw: 'Thibitisha',
    ki: 'Ma'
  },

  // Dashboard Navigation
  'dashboard.title': {
    en: 'Dashboard',
    sw: 'Dashibodi',
    ki: 'Kĩhumo kĩa Wĩra'
  },
  'dashboard.chat': {
    en: 'Chat with AI',
    sw: 'Ongea na AI',
    ki: 'Aria na AI'
  },
  'dashboard.scan': {
    en: 'New Scan',
    sw: 'Uchunguzi Mpya',
    ki: 'Gũthima Kwerũ'
  },
  'dashboard.community': {
    en: 'Community',
    sw: 'Jamii',
    ki: 'Kĩama'
  },
  'dashboard.upgrade': {
    en: 'Upgrade Plan',
    sw: 'Boresha Mpango',
    ki: 'Nengera Mũbango'
  },

  // Farmer Scan Wizard
  'scan.wizard.title': {
    en: 'Field Scan Analysis',
    sw: 'Uchambuzi wa Shamba',
    ki: 'Gũthima Mũgũnda'
  },
  'scan.wizard.step1': {
    en: 'Location & Weather Data',
    sw: 'Mahali na Hali ya Anga',
    ki: 'Handũ na Mbura'
  },
  'scan.wizard.step2': {
    en: 'Crop Characteristics',
    sw: 'Sifa za Mazao',
    ki: 'Ũhoro wa Irio'
  },
  'scan.wizard.step3': {
    en: 'Soil & Environment',
    sw: 'Udongo na Mazingira',
    ki: 'Tĩĩri na Gĩkeno'
  },

  // Crop Features
  'crop.genotype': {
    en: 'Crop Genotype',
    sw: 'Aina ya Mazao',
    ki: 'Mũthemba wa Irio'
  },
  'crop.fertilisation': {
    en: 'Fertilization Level',
    sw: 'Kiwango cha Mbolea',
    ki: 'Gĩtina kĩa Nduiko'
  },
  'crop.residue': {
    en: 'Crop Residue',
    sw: 'Mabaki ya Mazao',
    ki: 'Matigari ma Irio'
  },
  'crop.irrigation': {
    en: 'Irrigation Access',
    sw: 'Ufikiaji wa Umwagiliaji',
    ki: 'Gũkinyia Maaĩ'
  },
  'crop.insects': {
    en: 'Insect Pressure',
    sw: 'Msongo wa Wadudu',
    ki: 'Kũhinyĩrĩrĩo nĩ Ngi'
  },
  'crop.soil.ph': {
    en: 'Soil pH Level',
    sw: 'Kiwango cha pH ya Udongo',
    ki: 'Mũigana wa pH wa Tĩĩri'
  },

  // Risk Levels
  'risk.very.low': {
    en: 'Very Low Risk',
    sw: 'Hatari Ndogo Sana',
    ki: 'Ũgwati Mũnini Mũno'
  },
  'risk.low': {
    en: 'Low Risk',
    sw: 'Hatari Ndogo',
    ki: 'Ũgwati Mũnini'
  },
  'risk.medium': {
    en: 'Medium Risk',
    sw: 'Hatari ya Kati',
    ki: 'Ũgwati wa Gatagatĩ'
  },
  'risk.high': {
    en: 'High Risk',
    sw: 'Hatari Kubwa',
    ki: 'Ũgwati Mũnene'
  },
  'risk.very.high': {
    en: 'Very High Risk',
    sw: 'Hatari Kubwa Sana',
    ki: 'Ũgwati Mũnene Mũno'
  },

  // Recommendations
  'recommend.drainage': {
    en: 'Improve Drainage',
    sw: 'Boresha Mtiririko wa Maji',
    ki: 'Nengera Gũthereria Maaĩ'
  },
  'recommend.fungicide': {
    en: 'Apply Fungicide',
    sw: 'Tumia Dawa ya Kuvu',
    ki: 'Hũthĩra Ndawa ya Mĩcura'
  },
  'recommend.harvest': {
    en: 'Early Harvest',
    sw: 'Mavuno ya Mapema',
    ki: 'Gũgetha Mbere'
  },
  'recommend.drying': {
    en: 'Proper Drying (<14%)',
    sw: 'Ukauaji Sahihi (<14%)',
    ki: 'Gũũmithia Wega (<14%)'
  },
  'recommend.insects': {
    en: 'Monitor Insects',
    sw: 'Fuatilia Wadudu',
    ki: 'Rũgama Ngi'
  },
  'recommend.residue': {
    en: 'Remove Crop Residue',
    sw: 'Ondoa Mabaki ya Mazao',
    ki: 'Eheria Matigari ma Irio'
  },

  // Gamification
  'game.points': {
    en: 'Points',
    sw: 'Alama',
    ki: 'Kũraga'
  },
  'game.streak': {
    en: 'Day Streak',
    sw: 'Mfuatano wa Siku',
    ki: 'Mũhari wa Matukũ'
  },
  'game.badge.earned': {
    en: 'Badge Earned!',
    sw: 'Beji Imepokewa!',
    ki: 'Kĩhianĩro Gĩkenetio!'
  },
  'game.tier.upgrade': {
    en: 'Tier Upgraded!',
    sw: 'Ngazi Imepandishwa!',
    ki: 'Gĩtina Gĩkenetio!'
  },

  // Tier Names
  'tier.curious.scout': {
    en: 'Curious Scout',
    sw: 'Mpelelezi Mdadisi',
    ki: 'Mũthigari wa Gũtuĩria'
  },
  'tier.eager.tiller': {
    en: 'Eager Tiller',
    sw: 'Mlimaji Mchangamfu',
    ki: 'Mũrĩmi Mwĩhokeku'
  },
  'tier.keen.observer': {
    en: 'Keen Observer',
    sw: 'Mchunguzi Mkali',
    ki: 'Mũrori Mũũhĩ'
  },

  // Buyer Features
  'buyer.resell': {
    en: 'Resell Bad Corn',
    sw: 'Uza Mahindi Mabovu',
    ki: 'Endia Mbemba Njũru'
  },
  'buyer.transport': {
    en: 'Transport Conditions',
    sw: 'Hali za Usafirishaji',
    ki: 'Ũhoro wa Gũtwara'
  },
  'buyer.storage': {
    en: 'Storage Quality',
    sw: 'Ubora wa Uhifadhi',
    ki: 'Mwanzo wa Kũiga'
  },
  'buyer.environment': {
    en: 'Environmental Factors',
    sw: 'Mambo ya Mazingira',
    ki: 'Maũndũ ma Gĩkeno'
  },

  // Government Dashboard
  'gov.analytics': {
    en: 'Analytics Dashboard',
    sw: 'Dashibodi ya Uchanganuzi',
    ki: 'Kĩhumo kĩa Gũthima'
  },
  'gov.region': {
    en: 'Region',
    sw: 'Mkoa',
    ki: 'Bũrũri'
  },
  'gov.season': {
    en: 'Season',
    sw: 'Msimu',
    ki: 'Kĩmera'
  },
  'gov.contamination': {
    en: 'Contamination Level',
    sw: 'Kiwango cha Uchafuzi',
    ki: 'Mũigana wa Gũthaahia'
  },
  'gov.export': {
    en: 'Export Data',
    sw: 'Hamisha Data',
    ki: 'Ruta Ũhoro'
  },

  // Common Actions
  'action.continue': {
    en: 'Continue',
    sw: 'Endelea',
    ki: 'Thiĩ na Mbere'
  },
  'action.submit': {
    en: 'Submit',
    sw: 'Wasilisha',
    ki: 'Tũma'
  },
  'action.cancel': {
    en: 'Cancel',
    sw: 'Ghairi',
    ki: 'Tiga'
  },
  'action.save': {
    en: 'Save',
    sw: 'Hifadhi',
    ki: 'Iga'
  },
  'action.back': {
    en: 'Back',
    sw: 'Rudi',
    ki: 'Cooka'
  },

  // TTS & Voice
  'voice.listen': {
    en: 'Listen',
    sw: 'Sikiliza',
    ki: 'Thikĩrĩria'
  },
  'voice.speaking': {
    en: 'Speaking...',
    sw: 'Inaongea...',
    ki: 'Gũkwaria...'
  },

  // Upgrade Plan
  'upgrade.title': {
    en: 'Upgrade to Premium',
    sw: 'Boresha hadi Premium',
    ki: 'Ambatanĩrĩra Premium'
  },
  'upgrade.price': {
    en: '1000 KES',
    sw: '1000 KES',
    ki: '1000 KES'
  },
  'upgrade.benefits': {
    en: 'No Ads • Tutorials • Expert 1-on-1 • 20% IoT Discount • Priority Lab',
    sw: 'Hakuna Matangazo • Mafunzo • Mtaalamu 1-kwa-1 • Punguzo 20% IoT • Maabara ya Kipaumbele',
    ki: 'Gũtirĩ Matangazo • Mataaro • Mũmenyi 1-kwa-1 • Kũnyihia 20% IoT • Mũhũũri wa Mbere'
  },

  // Privacy & Security
  'privacy.title': {
    en: 'Privacy & Security',
    sw: 'Faragha na Usalama',
    ki: 'Hitho na Gĩtĩĩo'
  },
  'privacy.consent': {
    en: 'I consent to data collection for agricultural insights and app improvement.',
    sw: 'Ninakubali kukusanya data kwa maarifa ya kilimo na kuboresha programu.',
    ki: 'Nĩgwĩtĩkĩra gũcookanĩrĩrio kwa ũhoro nĩ ũndũ wa ũũgĩ wa ũrĩmi na gũtũma taarini ĩkĩre wega.'
  },

  // Error Messages
  'error.network': {
    en: 'Network error. Please check your connection.',
    sw: 'Hitilafu ya mtandao. Tafadhali angalia muunganisho wako.',
    ki: 'Ihĩtia rĩa kĩhingo. Ndagũthaitha rora kĩhingo gĩaku.'
  },
  'error.permission': {
    en: 'Permission denied. Please allow access.',
    sw: 'Idhini imekataliwa. Tafadhali ruhusu ufikiaji.',
    ki: 'Ũrũgamĩrĩro ũregirwo. Ndagũthaitha ĩtĩkĩra gũtoonya.'
  }
};

export class I18nService {
  private static currentLanguage: Language = 'en';

  static setLanguage(language: Language): void {
    this.currentLanguage = language;
    document.documentElement.lang = language;
  }

  static getCurrentLanguage(): Language {
    return this.currentLanguage;
  }

  static t(key: string, fallback?: string): string {
    const translation = translations[key];
    if (!translation) {
      console.warn(`Translation missing for key: ${key}`);
      return fallback || key;
    }
    return translation[this.currentLanguage] || translation.en || fallback || key;
  }

  static getLanguageVoice(language: Language): string {
    // Female voices for Web Speech API
    const voices = {
      en: 'Google UK English Female',
      sw: 'Google Swahili Female', 
      ki: 'Google Swahili Female' // Fallback for Kikuyu
    };
    return voices[language];
  }

  static getLanguageCode(language: Language): string {
    const codes = {
      en: 'en-GB',
      sw: 'sw-KE',
      ki: 'sw-KE' // Fallback for Kikuyu
    };
    return codes[language];
  }
}

// Export the translation function for easier use
export const t = I18nService.t.bind(I18nService);