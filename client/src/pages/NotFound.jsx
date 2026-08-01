import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="px-[16px] md:px-[40px] max-w-[1280px] mx-auto py-24 text-center">
      <h1 className="font-headline-lg text-[48px] leading-[56px] text-primary mb-4">404</h1>
      <p className="text-on-surface-variant mb-8">La page que vous recherchez n&apos;existe pas.</p>
      <Link
        to="/"
        className="bg-primary text-on-primary font-label-md text-[14px] leading-[20px] px-8 py-3 rounded-lg hover:bg-primary-container hover:text-on-primary-container transition-colors shadow-sm"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
