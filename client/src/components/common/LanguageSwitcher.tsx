import { useTranslation } from 'react-i18next';
import { Globe } from 'lucide-react';

export default function LanguageSwitcher() {
    const { i18n } = useTranslation();

    const toggleLanguage = () => {
        const newLang = i18n.language === 'tr' ? 'en' : 'tr';
        i18n.changeLanguage(newLang);
    };

    return (
        <button
            onClick={toggleLanguage}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-gray-400 hover:bg-dark-200 hover:text-white transition-all duration-200"
            title={i18n.language === 'tr' ? 'Switch to English' : 'Türkçe\'ye geç'}
        >
            <Globe className="w-5 h-5" />
            <span className="text-sm font-medium uppercase">{i18n.language}</span>
        </button>
    );
}
