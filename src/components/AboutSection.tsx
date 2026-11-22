import { motion } from 'motion/react';
import { ABOUT_IMAGE, ABOUT_PILLARS } from '../data/cybernexData';
import { SmartImage } from './SmartImage';

export function AboutSection() {
  return (
    <section
      id="about"
      className="relative z-10 border-t border-slate-200/80 py-16 sm:py-24 lg:py-32 dark:border-slate-900/90"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-8 sm:gap-10 lg:grid-cols-12 lg:gap-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="lg:col-span-6"
          >
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-[#05070D] sm:aspect-[16/10] lg:aspect-auto lg:h-full lg:min-h-[540px] dark:border-slate-800/90">
              <SmartImage
                src={ABOUT_IMAGE}
                alt="CYBERNEX futuristic cybernetic design atelier bathed in electric blue and violet light"
                fallbackTitle="CYBERNEX Design Atelier"
                aspectClassName="h-full w-full"
                className="h-full w-full object-cover object-center"
              />
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#05070D]/95 via-[#05070D]/20 to-transparent"
              />
              <div className="absolute right-0 bottom-0 left-0 p-5 sm:p-8">
                <p className="font-mono text-[11px] tracking-[0.16em] text-cyan-300 uppercase sm:text-xs">
                  Design Philosophy
                </p>
                <p className="mt-1 font-display text-base font-medium text-white sm:mt-1.5 sm:text-xl">
                  Built around human anatomy, cognition, and choice.
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 'some' }}
            transition={{ duration: 0.6, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col justify-between lg:col-span-6"
          >
            <div>
              <p className="font-mono text-xs font-medium tracking-[0.18em] text-violet-700 uppercase dark:text-violet-300">
                About CYBERNEX
              </p>
              <h2
                className="mt-2.5 font-display text-2xl leading-tight font-semibold tracking-tight text-slate-900 sm:mt-3 sm:text-4xl lg:text-[2.65rem] lg:leading-[1.12] dark:text-white"
                style={{ textWrap: 'balance' }}
              >
                Merging human intelligence with quiet technological precision.
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-slate-700 sm:mt-6 sm:text-base dark:text-slate-300">
                CYBERNEX explores the next chapter of human-machine coexistence—where adaptive software and cybernetic craft dissolve the friction between thought and physical capability.
              </p>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 sm:mt-4 sm:text-base dark:text-slate-400">
                Rather than replacing human intuition with opaque automation, our conceptual framework elevates perception, restores mobility, and protects individual autonomy at every layer of the stack.
              </p>
            </div>

            <div className="mt-8 divide-y divide-slate-200 border-t border-b border-slate-200 sm:mt-10 dark:divide-slate-800/80 dark:border-slate-800/80">
              {ABOUT_PILLARS.map((pillar) => (
                <div key={pillar.index} className="py-4 sm:py-5">
                  <div className="flex items-baseline gap-2.5 sm:gap-3">
                    <span className="font-mono text-xs font-medium text-blue-600 tabular-nums dark:text-cyan-300">
                      {pillar.index}
                    </span>
                    <h3 className="font-display text-base font-semibold text-slate-900 sm:text-lg dark:text-white">
                      {pillar.title}
                    </h3>
                  </div>
                  <p className="mt-1.5 pl-6 text-sm leading-relaxed text-slate-600 sm:pl-8 dark:text-slate-400">
                    {pillar.detail}
                  </p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
