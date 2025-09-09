import { useTranslation } from 'react-i18next';
import { useState, useEffect } from 'react';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleLanguage = () => {
    const newLang = i18n.language === 'ar' ? 'en' : 'ar';
    i18n.changeLanguage(newLang);
    localStorage.setItem('language', newLang);
    document.dir = newLang === 'ar' ? 'rtl' : 'ltr';
  };

  if (!mounted) return null;

  return (
    <button
      onClick={toggleLanguage}
      className="group relative flex items-center justify-center p-2 rounded-xl hover:bg-gray-100 transition-all duration-300"
      title={i18n.language === 'ar' ? 'Switch to English' : 'التبديل إلى العربية'}
    >
      <div className="relative w-16 h-8">
        {/* Background with gradient */}
        <div className={`
          absolute inset-0 rounded-full shadow-inner
          ${i18n.language === 'ar' 
            ? 'bg-gradient-to-r from-emerald-500 to-teal-500' 
            : 'bg-gradient-to-r from-blue-500 to-indigo-500'}
          transition-colors duration-500
        `} />

        {/* Toggle circle */}
        <div className={`
          absolute top-1 w-6 h-6 rounded-full bg-white shadow-lg transform transition-transform duration-500 ease-spring
          flex items-center justify-center text-xs font-semibold
          ${i18n.language === 'ar' ? 'right-1' : 'left-1'}
          ${i18n.language === 'ar' ? 'text-emerald-600' : 'text-blue-600'}
        `}>
          {i18n.language.toUpperCase()}
        </div>

        {/* Language icons */}
        <div className="absolute inset-0 flex items-center justify-between px-2">
          <span className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-white/50' : 'text-white'}`}>EN</span>
          <span className={`text-xs font-medium ${i18n.language === 'ar' ? 'text-white' : 'text-white/50'}`}>عر</span>
        </div>
      </div>

      {/* Hover effect */}
      <div className={`
        absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100
        transition-opacity duration-300
        ${i18n.language === 'ar'
          ? 'bg-gradient-to-r from-emerald-500/10 to-teal-500/10'
          : 'bg-gradient-to-r from-blue-500/10 to-indigo-500/10'}
      `} />
    </button>
  );
}