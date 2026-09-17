import { useEffect, useState } from 'react';
import {
  ArrowRight, Sparkles, WifiOff, Accessibility, Brain, Languages,
  GraduationCap,
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

  // Carousel Auto-Slide Effect
  useEffect(() => {
    const slideInterval = setInterval(() => {
      setCurrentSlide((prev) => (prev === 1 ? 0 : 1));
    }, 4000);
    return () => clearInterval(slideInterval);
  }, []);

  // Grade Specific 3D Images mapping
  const getGradeImage = (gradeName: string) => {
    if (gradeName.includes('5')) return '/images/grade-5.webp';
    if (gradeName.includes('6')) return '/images/grade-6.webp';
    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section — Fullscreen Background Carousel */}
      <section className="relative overflow-hidden min-h-[550px] sm:min-h-[620px] flex items-center justify-center bg-ink-900">
        
        {/* Absolute Background Image Carousel */}
        <div className="absolute inset-0 z-0">
          {heroImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${dict.home.heroTitle} - Background Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}

          {/* Dark Overlay for Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink-950/85 via-ink-950/70 to-ink-950/40 sm:from-ink-950/90 sm:via-ink-950/75 sm:to-ink-950/30" />
        </div>

        {/* Foreground Content */}
        <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-24 w-full">
          <div className="max-w-2xl text-center lg:text-left">
            <span className="inline-flex items-center gap-1.5 bg-primary-500/20 text-primary-200 border border-primary-400/30 backdrop-blur-md px-3.5 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-primary-300" />
              {dict.home.badge}
            </span>
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-white leading-[1.15] mb-6 text-balance drop-shadow-sm">
              {dict.home.heroTitle}
            </h1>
            <p className="text-lg text-ink-100 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0 drop-shadow">
              {dict.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" onClick={() => navigate({ name: 'home' })} rightIcon={<ArrowRight className="w-5 h-5" />}>
                {dict.home.heroCta}
              </Button>
              <Button size="lg" variant="outline" className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-md" onClick={() => navigate({ name: 'dashboard' })}>
                {dict.home.heroCta2}
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-3 gap-4 mt-10 max-w-md mx-auto lg:mx-0 pt-6 border-t border-white/15">
              {[
                { value: '2,400+', label: dict.home.studentsCount },
                { value: '6+', label: dict.home.lessonsCount },
                { value: '100%', label: dict.home.offlineLabel },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-extrabold text-white">{s.value}</p>
                  <p className="text-xs text-ink-200 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Carousel Indicators (Dots) */}
        <div className="absolute bottom-5 left-0 right-0 flex justify-center gap-2 z-10">
          {heroImages.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentSlide(index)}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                index === currentSlide ? 'w-8 bg-white' : 'w-2.5 bg-white/40 hover:bg-white/70'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </section>

      {/* Grade Selection — Phase 1 & 2 Polish */}
      <section className="bg-slate-50/80 border-y border-slate-200/60 py-16 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-extrabold text-ink-900 mb-2">{dict.home.chooseGrade}</h2>
            <p className="text-ink-500">{dict.home.chooseGradeHint}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
              {grades.map((g) => {
                const name = tr(g.name, lang);
                const imgPath = getGradeImage(name);

                return (
                  <Card
                    key={g.id}
                    hoverable
                    onClick={() => navigate({ name: 'grade', id: g.id })}
                    className="p-8 flex flex-col items-center text-center gap-4 group transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:border-primary-300 border border-slate-200/80 bg-white rounded-3xl cursor-pointer"
                  >
                    {/* 3D Image Display or Fallback Icon */}
                    <div className="w-28 h-28 flex items-center justify-center group-hover:scale-110 transition-transform duration-300 ease-out">
                      {imgPath ? (
                        <img
                          src={imgPath}
                          alt={name}
                          className="w-full h-full object-contain drop-shadow-md"
                          onError={(e) => {
                            // If .webp fails, fallback to .png or default icon
                            const target = e.currentTarget;
                            if (target.src.endsWith('.webp')) {
                              target.src = target.src.replace('.webp', '.png');
                            }
                          }}
                        />
                      ) : (
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-soft">
                          <GraduationCap className="w-8 h-8 text-white" />
                        </div>
                      )}
                    </div>

                    <div className="space-y-1">
                      <h3 className="text-2xl font-black text-ink-900 group-hover:text-primary-600 transition-colors">
                        {name}
                      </h3>
                      <p className="text-sm font-medium text-ink-500">
                        {subjects.length} Subjects • Interactive Practice
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-sm font-bold mt-2 group-hover:bg-primary-600 group-hover:text-white transition-all duration-200">
                      {dict.common.start}
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
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