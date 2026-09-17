import { useEffect, useState } from 'react';
import {
  ArrowRight, Sparkles, WifiOff, Accessibility, Brain, Languages,
  CheckCircle2, GraduationCap, BookOpen, Laptop, Calculator, Clock,
} from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import { tr, fetchGrades, fetchSubjects } from '@/lib/helpers';
import type { Route, Grade, Subject } from '@/lib/types';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { SubjectIcon } from '@/components/SubjectIcon';
import { Spinner } from '@/components/ui/Spinner';

interface HomePageProps {
  navigate: (r: Route) => void;
}

export function HomePage({ navigate }: HomePageProps) {
  const { lang } = useStore();
  const dict = t(lang);

  // States for data
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Hero Carousel
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroImages = ['/images/hero-1.webp', '/images/hero-2.webp'];

  // Fetch Data Effect
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const [g, s] = await Promise.all([fetchGrades(), fetchSubjects()]);
        if (active) { setGrades(g); setSubjects(s); }
      } catch {
        // silent fail — show empty states
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => { active = false; };
  }, []);

  // Carousel Auto-Slide Effect (በየ 4 ሰከንዱ እንዲቀየር)
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 1 ? 0 : 1));
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  return (
    <div className="animate-fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 right-10 w-72 h-72 bg-primary-100/40 rounded-full blur-3xl" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent-100/30 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-12 pb-16 sm:pt-20 sm:pb-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Text */}
            <div className="text-center lg:text-left">
              <span className="inline-flex items-center gap-1.5 bg-primary-100 text-primary-700 px-3 py-1.5 rounded-full text-sm font-semibold mb-5">
                <Sparkles className="w-4 h-4" />
                {dict.home.badge}
              </span>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-ink-900 leading-[1.1] mb-5 text-balance">
                {dict.home.heroTitle}
              </h1>
              <p className="text-lg text-ink-600 leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                {dict.home.heroSubtitle}
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
                <Button size="lg" onClick={() => navigate({ name: 'home' })} rightIcon={<ArrowRight className="w-5 h-5" />}>
                  {dict.home.heroCta}
                </Button>
                <Button size="lg" variant="outline" onClick={() => navigate({ name: 'dashboard' })}>
                  {dict.home.heroCta2}
                </Button>
              </div>

              <div className="grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto lg:mx-0">
                {[
                  { value: '2,400+', label: dict.home.studentsCount },
                  { value: '6+', label: dict.home.lessonsCount },
                  { value: '100%', label: dict.home.offlineLabel },
                ].map((s) => (
                  <div key={s.label} className="text-center lg:text-left">
                    <p className="text-2xl font-extrabold text-primary-700">{s.value}</p>
                    <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Hero Carousel Image (Mobile & Desktop Responsive) */}
            <div className="relative mt-8 lg:mt-0">
              <div className="relative rounded-3xl overflow-hidden shadow-lift w-full h-[260px] sm:h-[360px] lg:h-[460px] bg-ink-100">
                {/* Images */}
                {heroImages.map((src, index) => (
                  <img
                    key={src}
                    src={src}
                    alt={`${dict.home.heroTitle} - Slide ${index + 1}`}
                    className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                      index === currentSlide ? 'opacity-100' : 'opacity-0'
                    }`}
                    loading={index === 0 ? "eager" : "lazy"}
                  />
                ))}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-ink-900/50 via-ink-900/10 to-transparent" />

                {/* Carousel Indicators (Dots) */}
                <div className="absolute bottom-4 sm:bottom-6 left-0 right-0 flex justify-center gap-2 z-10">
                  {heroImages.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentSlide(index)}
                      className={`h-2.5 rounded-full transition-all duration-300 ${
                        index === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Go to slide ${index + 1}`}
                    />
                  ))}
                </div>
              </div>

              {/* Floating Stat Card */}
              <div className="absolute -bottom-3 left-3 sm:-bottom-5 sm:-left-5 bg-white/95 backdrop-blur rounded-2xl shadow-lift p-3 sm:p-4 w-44 sm:w-52 animate-slide-up z-20">
                <div className="flex items-center gap-2 mb-2 sm:mb-3">
                  <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-success-100 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4 text-success-600" />
                  </div>
                  <span className="text-xs sm:text-sm font-bold text-ink-800">{dict.dashboard.overallProgress}</span>
                </div>
                <div className="h-2 w-full bg-ink-100 rounded-full overflow-hidden">
                  <div className="h-full bg-success-500 rounded-full" style={{ width: '72%' }} />
                </div>
                <p className="text-[10px] sm:text-xs text-ink-500 mt-1.5">72% — {tr({ en: 'Mathematics', am: 'ሒሳብ' }, lang)}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Grade selection */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-ink-900 mb-2">{dict.home.chooseGrade}</h2>
          <p className="text-ink-500">{dict.home.chooseGradeHint}</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Spinner size="lg" /></div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5 max-w-2xl mx-auto">
            {grades.map((g) => (
              <Card
                key={g.id}
                hoverable
                onClick={() => navigate({ name: 'grade', id: g.id })}
                className="p-8 flex flex-col items-center text-center gap-3 group"
              >
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft group-hover:scale-105 transition-transform">
                  <GraduationCap className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-xl font-extrabold text-ink-900">{tr(g.name, lang)}</h3>
                <p className="text-sm text-ink-500">{subjects.length} {dict.home.subjectsTitle.toLowerCase()}</p>
                <span className="inline-flex items-center gap-1 text-primary-600 text-sm font-semibold mt-1">
                  {dict.common.start}
                  <ArrowRight className="w-4 h-4" />
                </span>
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Subjects */}
      <section className="bg-ink-50 py-16">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-ink-900 mb-2">{dict.home.subjectsTitle}</h2>
            <p className="text-ink-500">{dict.home.subjectsSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-3 gap-5 max-w-3xl mx-auto">
            {subjects.length > 0 ? subjects.map((s) => (
              <Card key={s.id} className="p-6 flex flex-col items-center text-center gap-3">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-soft`}>
                  <SubjectIcon name={s.icon} className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-bold text-ink-900">{tr(s.name, lang)}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{tr(s.description, lang)}</p>
              </Card>
            )) : (
              <div className="col-span-3 flex justify-center py-8"><Spinner /></div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-ink-900 mb-2">{dict.home.whyTitle}</h2>
          <p className="text-ink-500">{dict.home.whySubtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { icon: WifiOff, color: 'bg-success-100 text-success-600', title: dict.home.feature1Title, desc: dict.home.feature1Desc },
            { icon: Accessibility, color: 'bg-primary-100 text-primary-600', title: dict.home.feature2Title, desc: dict.home.feature2Desc },
            { icon: Brain, color: 'bg-accent-100 text-accent-600', title: dict.home.feature3Title, desc: dict.home.feature3Desc },
            { icon: Languages, color: 'bg-warning-100 text-warning-600', title: dict.home.feature4Title, desc: dict.home.feature4Desc },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <Card key={b.title} className="p-6 flex flex-col gap-3">
                <div className={`w-12 h-12 rounded-xl ${b.color} flex items-center justify-center`}>
                  <Icon className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-ink-900">{b.title}</h3>
                <p className="text-sm text-ink-500 leading-relaxed">{b.desc}</p>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative bg-gradient-to-br from-primary-500 to-primary-700 rounded-3xl p-8 sm:p-12 text-center overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-2xl" />
          <div className="absolute bottom-0 left-0 w-56 h-56 bg-white/10 rounded-full blur-3xl" />
          <div className="relative">
            <h2 className="text-3xl font-extrabold text-white mb-2">{dict.home.ctaTitle}</h2>
            <p className="text-primary-50 mb-6 max-w-lg mx-auto">{dict.home.ctaSubtitle}</p>
            <Button
              size="lg"
              className="bg-white text-primary-700 hover:bg-primary-50"
              onClick={() => navigate({ name: 'home' })}
              rightIcon={<ArrowRight className="w-5 h-5" />}
            >
              {dict.home.ctaButton}
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}