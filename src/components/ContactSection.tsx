import { useState, type FormEvent } from 'react';
import { CheckCircle2, Send } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

interface ContactSectionProps {
  onInteract?: () => void;
  onConfirm?: () => void;
}

const INTEREST_TOPICS = [
  'Artificial Intelligence',
  'Neural Interfaces',
  'Robotic Engineering',
  'Human Augmentation',
] as const;

interface FormErrors {
  name?: string;
  email?: string;
  message?: string;
}

export function ContactSection({ onInteract, onConfirm }: ContactSectionProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState<string>(INTEREST_TOPICS[0]);
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState<FormErrors>({});
  const [submitted, setSubmitted] = useState(false);

  const validate = (): FormErrors => {
    const nextErrors: FormErrors = {};
    if (name.trim().length < 2) {
      nextErrors.name = 'Please enter your name (at least 2 characters).';
    }
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (message.trim().length < 10) {
      nextErrors.message = 'Please share a brief note (at least 10 characters).';
    }
    return nextErrors;
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setErrors({});
    setSubmitted(true);
    onConfirm?.();
  };

  const handleReset = () => {
    setName('');
    setEmail('');
    setTopic(INTEREST_TOPICS[0]);
    setMessage('');
    setErrors({});
    setSubmitted(false);
    onInteract?.();
  };

  return (
    <section
      id="contact"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-32 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 sm:gap-12 lg:grid-cols-12 lg:items-start">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.55, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-5"
          >
            <p className="font-mono text-xs font-medium tracking-[0.18em] text-violet-700 uppercase dark:text-violet-300">
              Contact & Collaboration
            </p>
            <h2
              className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl dark:text-white"
              style={{ textWrap: 'balance' }}
            >
              Shape the next dialogue between mind and machine.
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-slate-600 sm:mt-5 sm:text-base dark:text-slate-300">
              Interested in design research, futuristic prototyping, or conceptual engineering around CYBERNEX? Send a message to connect with the project team.
            </p>

            <div className="mt-7 grid grid-cols-1 gap-4 border-t border-slate-200 pt-5 text-sm text-slate-500 sm:mt-10 sm:grid-cols-2 sm:pt-6 lg:grid-cols-1 dark:border-slate-800/80 dark:text-slate-400">
              <div>
                <span className="block font-mono text-xs text-slate-500 uppercase">
                  Direct Inquiries
                </span>
                <a
                  href="mailto:hello@cybernex-concept.io"
                  className="mt-1 inline-block text-slate-800 transition-colors hover:text-blue-600 dark:text-slate-200 dark:hover:text-cyan-300"
                >
                  hello@cybernex-concept.io
                </a>
              </div>
              <div>
                <span className="block font-mono text-xs text-slate-500 uppercase">
                  Research Scope
                </span>
                <p className="mt-1 text-slate-700 dark:text-slate-300">
                  AI Systems · Neural Coupling · Precision Robotics · Augmentation
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="glass-surface rounded-2xl border border-slate-200 p-5 sm:p-8 lg:col-span-7 dark:border-slate-800/90"
          >
            <AnimatePresence mode="wait">
              {submitted ? (
                <motion.div
                  key="contact-submitted"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col items-start py-6"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-blue-500/30 bg-blue-50 text-blue-600 dark:border-cyan-400/40 dark:bg-cyan-400/15 dark:text-cyan-300">
                    <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <h3 className="mt-5 font-display text-2xl font-semibold text-slate-900 dark:text-white">
                    Inquiry Received
                  </h3>
                  <p className="mt-2 max-w-md text-sm leading-relaxed text-slate-600 sm:text-base dark:text-slate-300">
                    Thank you, <span className="font-medium text-slate-900 dark:text-white">{name}</span>. Your note regarding{' '}
                    <span className="text-blue-600 dark:text-cyan-300">{topic}</span> has been recorded for review.
                  </p>
                  <button
                    type="button"
                    onClick={handleReset}
                    className="mt-7 inline-flex min-h-[44px] w-full items-center justify-center rounded-lg border border-slate-300 bg-white px-5 py-2.5 text-xs font-semibold tracking-wider text-slate-800 uppercase transition-colors hover:border-blue-500/60 hover:text-blue-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:w-auto dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:border-cyan-400/60 dark:hover:text-cyan-200 cursor-pointer"
                  >
                    Send Another Message
                  </button>
                </motion.div>
              ) : (
                <motion.form
                  key="contact-form"
                  initial={{ opacity: 0, scale: 0.985 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.985 }}
                  transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
                  onSubmit={handleSubmit}
                  noValidate
                  className="space-y-5 sm:space-y-6"
                >
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5">
                    <div>
                      <label
                        htmlFor="contact-name"
                        className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                      >
                        Full Name
                      </label>
                      <input
                        id="contact-name"
                        name="name"
                        type="text"
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                          if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                        }}
                        aria-invalid={Boolean(errors.name)}
                        placeholder="Alex Mercer"
                        className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-[#050812]/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                      />
                      {errors.name && (
                        <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                          {errors.name}
                        </p>
                      )}
                    </div>

                    <div>
                      <label
                        htmlFor="contact-email"
                        className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                      >
                        Email Address
                      </label>
                      <input
                        id="contact-email"
                        name="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
                        }}
                        aria-invalid={Boolean(errors.email)}
                        placeholder="alex@domain.com"
                        className="mt-2 min-h-[46px] w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-[#050812]/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                      />
                      {errors.email && (
                        <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                          {errors.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300">
                      Area of Focus
                    </span>
                    <div className="mt-2.5 flex flex-wrap gap-2 sm:grid sm:grid-cols-2 lg:grid-cols-4">
                      {INTEREST_TOPICS.map((item) => {
                        const active = topic === item;
                        return (
                          <button
                            key={item}
                            type="button"
                            onClick={() => {
                              setTopic(item);
                              onInteract?.();
                            }}
                            aria-pressed={active}
                            className={`min-h-[44px] grow rounded-lg border px-3.5 py-2 text-xs font-medium whitespace-nowrap transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-400 sm:grow-0 sm:px-2.5 sm:truncate cursor-pointer ${
                              active
                                ? 'border-blue-600 bg-blue-600/10 text-blue-800 dark:border-cyan-400/60 dark:bg-blue-600/25 dark:text-cyan-100'
                                : 'border-slate-200 bg-white/70 text-slate-600 hover:border-slate-300 hover:text-slate-900 dark:border-slate-800 dark:bg-[#050812]/70 dark:text-slate-400 dark:hover:border-slate-700 dark:hover:text-slate-200'
                            }`}
                          >
                            {item}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="contact-message"
                      className="block text-xs font-medium tracking-wide text-slate-700 uppercase dark:text-slate-300"
                    >
                      Message
                    </label>
                    <textarea
                      id="contact-message"
                      name="message"
                      rows={4}
                      value={message}
                      onChange={(e) => {
                        setMessage(e.target.value);
                        if (errors.message) setErrors((prev) => ({ ...prev, message: undefined }));
                      }}
                      aria-invalid={Boolean(errors.message)}
                      placeholder="Share your thoughts, feedback, or collaboration idea..."
                      className="mt-2 w-full rounded-lg border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 placeholder-slate-400 transition-colors focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 dark:border-slate-800 dark:bg-[#050812]/90 dark:text-white dark:placeholder-slate-500 dark:focus:border-cyan-400 dark:focus:ring-cyan-400"
                    />
                    {errors.message && (
                      <p role="alert" className="mt-1.5 text-xs text-rose-600 dark:text-rose-400">
                        {errors.message}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center justify-end">
                    <button
                      type="submit"
                      className="inline-flex min-h-[48px] w-full items-center justify-center gap-2.5 rounded-lg bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 px-6 py-3 text-xs font-semibold tracking-wider text-white uppercase whitespace-nowrap shrink-0 shadow-[0_0_28px_-6px_rgba(56,189,248,0.6)] transition-all duration-200 hover:scale-[1.01] hover:shadow-[0_0_36px_-4px_rgba(34,211,238,0.8)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 sm:w-auto cursor-pointer"
                    >
                      <span>Send Message</span>
                      <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    </button>
                  </div>
                </motion.form>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
