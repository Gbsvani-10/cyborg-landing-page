import { useState, type FormEvent } from 'react';
import { AlertCircle, ArrowRight, CheckCircle2, Mail } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface NewsletterSectionProps {
  onConfirm?: () => void;
}

export function NewsletterSection({ onConfirm }: NewsletterSectionProps) {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [subscribedEmail, setSubscribedEmail] = useState<string | null>(null);

  const validateEmail = (value: string): string | null => {
    const trimmed = value.trim();
    if (!trimmed) {
      return 'Please enter your email address.';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
    if (!emailPattern.test(trimmed)) {
      return 'Please enter a valid email address (e.g. name@domain.com).';
    }
    return null;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationError = validateEmail(email);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError(null);
    setSubscribedEmail(email.trim());
    setEmail('');
    onConfirm?.();
  };

  return (
    <section
      aria-labelledby="newsletter-heading"
      className="relative z-10 border-t border-slate-200/80 py-14 sm:py-16 lg:py-20 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 'some' }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="glass-surface glow-ring-hover relative overflow-hidden rounded-2xl border border-slate-200 p-5 sm:p-10 lg:p-12 dark:border-slate-800/90"
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-24 -right-24 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(56,189,248,0.14),rgba(139,92,246,0.08)_50%,transparent_72%)] blur-2xl"
          />

          <div className="relative z-10 grid grid-cols-1 gap-6 sm:gap-8 lg:grid-cols-12 lg:items-center lg:gap-12">
            <div className="lg:col-span-6">
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-blue-600 uppercase dark:text-cyan-300">
                Dispatches
              </p>
              <h2
                id="newsletter-heading"
                className="mt-2 font-display text-2xl font-semibold tracking-tight text-slate-900 sm:mt-2.5 sm:text-3xl dark:text-white"
                style={{ textWrap: 'balance' }}
              >
                Join the Evolution
              </h2>
              <p className="mt-2.5 max-w-lg text-sm leading-relaxed text-slate-600 sm:mt-3 sm:text-base dark:text-slate-300">
                Receive occasional design dispatches on neural coupling, bio-inspired robotics, and human-centered cybernetic concepts.
              </p>
            </div>

            <div className="lg:col-span-6">
              <AnimatePresence mode="wait">
                {subscribedEmail ? (
                  <motion.div
                    key="newsletter-confirmed"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    className="flex flex-col gap-4 rounded-xl border border-blue-500/30 bg-white/85 p-5 sm:flex-row sm:items-center sm:justify-between dark:border-cyan-400/35 dark:bg-[#060B18]/80"
                    role="status"
                  >
                    <div className="flex items-start gap-3">
                      <CheckCircle2
                        className="mt-0.5 h-5 w-5 shrink-0 text-blue-600 dark:text-cyan-300"
                        aria-hidden="true"
                      />
                      <div>
                        <p className="font-display text-sm font-semibold text-slate-900 dark:text-white">
                          You are on the list
                        </p>
                        <p className="mt-0.5 text-xs break-all text-slate-600 dark:text-slate-300">
                          Confirmed for{' '}
                          <span className="font-medium text-blue-700 dark:text-cyan-200">
                            {subscribedEmail}
                          </span>
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSubscribedEmail(null)}
                      className="min-h-[44px] w-full rounded-lg border border-slate-300 bg-white px-4 py-2 text-xs font-medium text-slate-700 whitespace-nowrap shrink-0 transition-colors hover:border-blue-500/50 hover:text-slate-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-auto dark:border-slate-700/90 dark:bg-slate-900/70 dark:text-slate-200 dark:hover:border-cyan-400/50 dark:hover:text-white cursor-pointer"
                    >
                      Use another email
                    </button>
                  </motion.div>
                ) : (
                  <motion.form
                    key="newsletter-form"
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                    onSubmit={handleSubmit}
                    noValidate
                    className="space-y-3"
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-stretch">
                      <div className="relative flex-1">
                        <label htmlFor="newsletter-email" className="sr-only">
                          Email address
                        </label>
                        <Mail
                          className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                          aria-hidden="true"
                        />
                        <input
                          id="newsletter-email"
                          name="email"
                          type="email"
                          autoComplete="email"
                          value={email}
                          onChange={(e) => {
                            const nextVal = e.target.value;
                            setEmail(nextVal);
                            if (error) {
                              setError(validateEmail(nextVal));
                            }
                          }}
                          aria-invalid={Boolean(error)}
                          aria-describedby={error ? 'newsletter-error' : 'newsletter-hint'}
                          placeholder="Enter your email address"
                          className={`min-h-[48px] w-full rounded-lg border bg-white py-3 pr-4 pl-10 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:outline-none focus:ring-1 dark:bg-[#050812]/90 dark:text-white dark:placeholder-slate-500 ${
                            error
                              ? 'border-rose-500/80 focus:border-rose-500 focus:ring-rose-500 dark:border-rose-400/80 dark:focus:border-rose-400 dark:focus:ring-rose-400'
                              : 'border-slate-300 focus:border-blue-500 focus:ring-blue-500 dark:border-slate-700/90 dark:focus:border-cyan-400 dark:focus:ring-cyan-400'
                          }`}
                        />
                      </div>

                      <button
                        type="submit"
                        className="group inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase whitespace-nowrap shrink-0 shadow-[0_0_24px_-6px_rgba(56,189,248,0.55)] transition-all duration-200 hover:scale-[1.015] hover:shadow-[0_0_32px_-4px_rgba(34,211,238,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:w-auto cursor-pointer"
                      >
                        <span>Subscribe</span>
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
                          aria-hidden="true"
                        />
                      </button>
                    </div>

                    <div className="min-h-[20px]">
                      {error ? (
                        <p
                          id="newsletter-error"
                          role="alert"
                          className="flex items-center gap-1.5 text-xs text-rose-600 dark:text-rose-400"
                        >
                          <AlertCircle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                          <span>{error}</span>
                        </p>
                      ) : (
                        <p id="newsletter-hint" className="text-xs text-slate-500">
                          Minimal updates only. Unsubscribe at any time.
                        </p>
                      )}
                    </div>
                  </motion.form>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
