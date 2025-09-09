import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

export default function NotFound() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col justify-center items-center px-4">
      <div className="max-w-md w-full text-center">
        <h1 className="text-9xl font-bold text-gray-900">404</h1>
        <h2 className="mt-4 text-3xl font-semibold text-gray-800">
          {t('error.pageNotFound')}
        </h2>
        <p className="mt-4 text-lg text-gray-600">
          {t('error.pageNotFoundDesc')}
        </p>
        <div className="mt-8">
          <Link to="/">
            <Button variant="primary" size="lg">
              {t('common.backToHome')}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
