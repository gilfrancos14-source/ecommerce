import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';

export default function SearchModal({ open, onClose }) {
  const [query, setQuery] = useState('');
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setQuery('');
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, onClose]);

  if (!open) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = query.trim();
    if (trimmed) {
      navigate(`/products?nom=${encodeURIComponent(trimmed)}`);
    } else {
      navigate('/products');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[100px]" onClick={onClose}>
      <div className="absolute inset-0 bg-primary/40 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-lg mx-4 bg-surface-container-lowest rounded-xl shadow-xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <form onSubmit={handleSubmit} className="flex items-center gap-3">
          <span className="material-symbols-outlined text-on-surface-variant">search</span>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher un produit..."
            className="flex-1 bg-transparent font-body-md text-on-surface focus:outline-none placeholder-on-surface-variant/50"
          />
          <button type="button" onClick={onClose} className="text-on-surface-variant hover:text-on-surface transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </form>
      </div>
    </div>
  );
}
