import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low text-on-surface font-body-md text-[16px] leading-[24px] w-full pt-20 pb-10">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-[24px] px-[40px] max-w-[1280px] mx-auto">
        <div className="md:col-span-4 mb-10 md:mb-0">
          <Link to="/" className="font-display-lg text-[48px] leading-[56px] font-bold text-primary block mb-6">LUXE</Link>
          <p className="text-on-surface-variant max-w-sm mb-6">
            Redéfinissez votre style avec notre sélection de pièces intemporelles et durables, pensées pour le quotidien moderne.
          </p>
          <div className="flex space-x-4">
            <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">photo_camera</span>
            </a>
            <a href="#" className="text-on-surface-variant hover:text-secondary transition-colors">
              <span className="material-symbols-outlined">share</span>
            </a>
          </div>
        </div>

        <div className="md:col-span-8 flex flex-wrap md:justify-end gap-12">
          <div className="flex flex-col space-y-4">
            <h4 className="font-label-md text-[14px] leading-[20px] text-primary font-bold uppercase tracking-wider mb-2">Assistance</h4>
            <a href="#" className="text-on-surface-variant hover:text-secondary underline transition-all duration-200">Shipping & Returns</a>
            <a href="#" className="text-on-surface-variant hover:text-secondary underline transition-all duration-200">Contact Us</a>
            <a href="#" className="text-on-surface-variant hover:text-secondary underline transition-all duration-200">Size Guide</a>
          </div>
          <div className="flex flex-col space-y-4">
            <h4 className="font-label-md text-[14px] leading-[20px] text-primary font-bold uppercase tracking-wider mb-2">Légal</h4>
            <a href="#" className="text-on-surface-variant hover:text-secondary underline transition-all duration-200">Privacy Policy</a>
            <a href="#" className="text-on-surface-variant hover:text-secondary underline transition-all duration-200">Terms of Service</a>
          </div>
        </div>

        <div className="md:col-span-12 mt-16 pt-8 border-t border-outline-variant/30 flex flex-col md:flex-row justify-between items-center text-sm">
          <p className="text-on-surface-variant">&copy; {new Date().getFullYear()} LUXE. All rights reserved.</p>
          <div className="flex items-center space-x-4 mt-4 md:mt-0">
            <span className="text-on-surface-variant">France (EUR &euro;)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
