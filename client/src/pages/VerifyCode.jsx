import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../utils/api';

export default function VerifyCode() {
  const navigate = useNavigate();
  const location = useLocation();
  const resetId = location.state?.resetId;
  const email = location.state?.email;

  const [code, setCode] = useState(['', '', '', '', '', '']);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const inputRefs = useRef([]);

  useEffect(() => {
    if (!resetId) {
      navigate('/forgot-password');
      return;
    }
    inputRefs.current[0]?.focus();
  }, [resetId, navigate]);

  if (!resetId) return null;

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return;

    const newCode = [...code];
    newCode[index] = value.slice(-1);
    setCode(newCode);

    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pasted) {
      const newCode = pasted.split('').concat(Array(6 - pasted.length).fill(''));
      setCode(newCode);
      const nextEmpty = newCode.findIndex((c) => !c);
      inputRefs.current[nextEmpty === -1 ? 5 : nextEmpty]?.focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    const fullCode = code.join('');
    if (fullCode.length !== 6) {
      setError('Veuillez saisir le code complet à 6 chiffres');
      return;
    }

    setLoading(true);
    try {
      const { data } = await api.post('/auth/verify-reset-code', { resetId, code: fullCode });
      navigate('/reset-password', { state: { resetToken: data.resetToken } });
    } catch (err) {
      setError(err.response?.data?.message || 'Code incorrect');
      setCode(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="px-[16px] md:px-[40px] max-w-md mx-auto py-24">
      <h1 className="font-headline-lg text-[32px] leading-[40px] text-primary mb-4 text-center">Vérification du code</h1>
      <p className="font-body-md text-on-surface-variant text-center mb-2">
        Saisissez le code à 6 chiffres envoyé à
      </p>
      {email && <p className="font-label-md text-on-surface text-center mb-8">{email}</p>}

      {error && (
        <div className="mb-6 px-4 py-3 rounded-lg bg-error-container text-on-error-container font-body-md text-[14px]">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-3">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputRefs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={i === 0 ? handlePaste : undefined}
              className="w-12 h-14 text-center text-xl font-headline-md bg-surface-container rounded-lg border border-outline/20 text-on-surface focus:outline-none focus:ring-2 focus:ring-secondary focus:border-transparent transition-colors"
            />
          ))}
        </div>

        <button
          type="submit"
          disabled={loading || code.some((d) => !d)}
          className="w-full bg-secondary text-on-secondary font-label-md text-[14px] leading-[20px] px-8 py-3 rounded-lg hover:bg-secondary-container hover:text-on-secondary-container transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Vérification...' : 'Vérifier le code'}
        </button>
      </form>

      <p className="mt-8 text-center font-body-md text-[14px] leading-[20px] text-on-surface-variant">
        <Link to="/forgot-password" className="text-secondary hover:underline">Renvoyer un code</Link>
      </p>
    </div>
  );
}
