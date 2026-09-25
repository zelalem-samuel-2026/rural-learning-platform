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

  // Grade Specific 3D Images mapping for Grades 5, 6, 7, 8
  const getGradeImage = (gradeName: string) => {
    if (gradeName.includes('5')) return '/images/grade-5.webp';
    if (gradeName.includes('6')) return '/images/grade-6.webp';
    if (gradeName.includes('7')) return '/images/grade-7.webp';
    if (gradeName.includes('8')) return '/images/grade-8.webp';
    return null;
  };

  // Subject Specific 3D Images mapping
  const getSubjectImage = (subjectId: string, subjectName: string) => {
    const id = subjectId.toLowerCase();
    const name = subjectName.toLowerCase();

    if (id.includes('english') || name.includes('english') || name.includes('እንግሊዝኛ')) return '/images/subject-english.webp';
    if (id.includes('computer') || id.includes('cs') || name.includes('computer') || name.includes('ኮምፒውተር')) return '/images/subject-cs.webp';
    if (id.includes('math') || name.includes('math') || name.includes('ሒሳብ')) return '/images/subject-math.webp';
    if (id.includes('general') || id.includes('science') || name.includes('general science') || name.includes('አጠቃላይ') || name.includes('ሳይንስ')) return '/images/subject-science.webp';
    if (id.includes('social') || name.includes('social') || name.includes('ማህበራዊ')) return '/images/subject-social.webp';
    if (id.includes('citizen') || name.includes('citizen') || name.includes('ዜግነት')) return '/images/subject-citizenship.webp';

    return null;
  };

  return (
    <div className="animate-fade-in">
      {/* Hero Section — Fullscreen Background Carousel */}
      <section className="relative overflow-hidden min-h-[80vh] sm:min-h-[620px] sm:h-[620px] flex items-center justify-center bg-ink-900">
        
        {/* Absolute Background Image Carousel */}
        <div className="absolute inset-0 z-0 min-h-[80vh] sm:min-h-[620px] sm:h-[620px]">
          {heroImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`${dict.home.heroTitle} - Background Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
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

      {/* Grade Selection — Expanded for Grades 5, 6, 7 & 8 */}
      <section className="bg-ink-50 border-y border-ink-200/60 py-16 sm:py-20 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-ink-900 mb-3">{dict.home.chooseGrade}</h2>
            <p className="text-ink-600 max-w-lg mx-auto">{dict.home.chooseGradeHint}</p>
          </div>

          {loading ? (
            <div className="flex justify-center py-12"><Spinner size="lg" /></div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5 max-w-5xl mx-auto">
              {grades.map((g) => {
                const name = tr(g.name, lang);
                const imgPath = getGradeImage(name);

                return (
                  <Card
                    key={g.id}
                    hoverable
                    onClick={() => navigate({ name: 'grade', id: g.id })}
                    className="p-6 flex flex-col items-center text-center gap-4 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-300 border border-ink-200/50 bg-white rounded-3xl cursor-pointer shadow-md"
                  >
                    {/* 3D Image Display or Fallback Icon */}
                    <div className="w-28 h-28 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out mb-1">
                      {imgPath ? (
                        <img
                          src={imgPath}
                          alt={name}
                          className="w-full h-full object-contain drop-shadow-xl"
                          onError={(e) => {
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

                    <div className="space-y-1.5">
                      <h3 className="text-2xl font-black text-ink-900 group-hover:text-primary-600 transition-colors">
                        {name}
                      </h3>
                      <p className="text-xs font-medium text-ink-500 bg-ink-50 px-2.5 py-1 rounded-full inline-block">
                        {subjects.length} Subjects • Practice
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-600 px-4 py-2 rounded-full text-xs font-bold mt-2 group-hover:bg-primary-600 group-hover:text-white transition-all duration-300 shadow-sm group-hover:shadow-primary-500/30">
                      {dict.common.start}
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1.5 transition-transform" />
                    </span>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Subjects */}
      <section className="bg-ink-50/70 border-b border-ink-200/60 py-16 sm:py-20 transition-all duration-300">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-ink-900 mb-3">{dict.home.subjectsTitle}</h2>
            <p className="text-ink-600 max-w-lg mx-auto">{dict.home.subjectsSubtitle}</p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {subjects.length > 0 ? subjects.map((s) => {
              const name = tr(s.name, lang);
              const subImgPath = getSubjectImage(s.id, name);

              return (
                <Card 
                  key={s.id} 
                  hoverable
                  onClick={() => navigate({ name: 'home' })}
                  className="p-6 flex flex-col items-center text-center gap-4 group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:border-primary-300 border border-ink-200/50 bg-white rounded-3xl cursor-pointer shadow-md"
                >
                  <div className="w-28 h-28 flex items-center justify-center group-hover:scale-110 transition-transform duration-500 ease-out mb-1">
                    {subImgPath ? (
                      <img
                        src={subImgPath}
                        alt={name}
                        className="w-full h-full object-contain drop-shadow-xl"
                        onError={(e) => {
                          const target = e.currentTarget;
                          if (target.src.endsWith('.webp')) {
                            target.src = target.src.replace('.webp', '.png');
                          }
                        }}
                      />
                    ) : (
                      <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${s.color} flex items-center justify-center shadow-md`}>
                        <SubjectIcon name={s.icon} className="w-7 h-7 text-white" />
                      </div>
                    )}
                  </div>

                  <div>
                    <h3 className="font-extrabold text-ink-900 text-xl mb-1.5 group-hover:text-primary-600 transition-colors">
                      {name}
                    </h3>
                    <p className="text-sm text-ink-500 leading-relaxed">
                      {tr(s.description, lang)}
                    </p>
                  </div>
                </Card>
              );
            }) : (
              <div className="col-span-3 flex justify-center py-8"><Spinner /></div>
            )}
          </div>
        </div>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 py-16 sm:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-ink-900 mb-3">{dict.home.whyTitle}</h2>
          <p className="text-ink-600 max-w-lg mx-auto">{dict.home.whySubtitle}</p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: WifiOff,
              badgeBg: 'bg-emerald-500/30 text-emerald-200 border-emerald-400/30',
              title: dict.home.feature1Title,
              desc: dict.home.feature1Desc,
              bgImage: '/images/feature-offline.webp',
            },
            {
              icon: Accessibility,
              badgeBg: 'bg-blue-500/30 text-blue-200 border-blue-400/30',
              title: dict.home.feature2Title,
              desc: dict.home.feature2Desc,
              bgImage: '/images/feature-simple.webp',
            },
            {
              icon: Brain,
              badgeBg: 'bg-purple-500/30 text-purple-200 border-purple-400/30',
              title: dict.home.feature3Title,
              desc: dict.home.feature3Desc,
              bgImage: '/images/feature-feedback.webp',
            },
            {
              icon: Languages,
              badgeBg: 'bg-amber-500/30 text-amber-200 border-amber-400/30',
              title: dict.home.feature4Title,
              desc: dict.home.feature4Desc,
              bgImage: '/images/feature-bilingual.webp',
            },
          ].map((b) => {
            const Icon = b.icon;
            return (
              <Card
                key={b.title}
                className="relative overflow-hidden min-h-[260px] p-6 flex flex-col justify-between group transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl border border-ink-200/50 rounded-3xl cursor-pointer bg-ink-900"
              >
                <div className="absolute inset-0 z-0 overflow-hidden">
                  <img
                    src={b.bgImage}
                    alt={b.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                    onError={(e) => {
                      const target = e.currentTarget;
                      if (target.src.endsWith('.webp')) {
                        target.src = target.src.replace('.webp', '.png');
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-950/95 via-ink-950/70 to-ink-950/40 group-hover:from-ink-950/90 transition-colors duration-300" />
                </div>

                <div className="relative z-10">
                  <div className={`w-12 h-12 rounded-2xl ${b.badgeBg} border backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform`}>
                    <Icon className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="relative z-10 space-y-1.5 text-left pt-6">
                  <h3 className="font-extrabold text-white text-xl group-hover:text-primary-300 transition-colors">
                    {b.title}
                  </h3>
                  <p className="text-sm text-ink-100 leading-relaxed font-normal drop-shadow-sm">
                    {b.desc}
                  </p>
                </div>
              </Card>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="relative rounded-[2.5rem] overflow-hidden group cursor-pointer shadow-2xl border border-ink-200/20">
          <div className="absolute inset-0 z-0">
            <img
              src="/images/cta-bg.webp"
              alt="Start Learning"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000 ease-out"
              onError={(e) => {
                const target = e.currentTarget;
                if (target.src.endsWith('.webp')) {
                  target.src = target.src.replace('.webp', '.png');
                }
              }}
            />
            <div className="absolute inset-0 bg-ink-950/50 group-hover:bg-ink-950/40 transition-colors duration-500" />
          </div>

          <div className="relative z-10 flex flex-col items-center justify-center p-8 sm:p-16 min-h-[350px]">
            <div className="bg-white/10 backdrop-blur-lg border border-white/20 p-8 sm:p-12 rounded-3xl shadow-2xl max-w-2xl w-full text-center transform group-hover:-translate-y-2 transition-transform duration-500">
              <h2 className="text-3xl sm:text-4xl font-extrabold text-white mb-4 drop-shadow-lg">
                {dict.home.ctaTitle}
              </h2>
              <p className="text-lg text-primary-50 mb-8 max-w-lg mx-auto drop-shadow-md">
                {dict.home.ctaSubtitle}
              </p>
              
              <div className="inline-block relative">
                <div className="absolute inset-0 bg-primary-400 rounded-full blur-lg opacity-50 group-hover:opacity-100 transition-opacity duration-500 animate-pulse"></div>
                <Button
                  size="lg"
                  className="relative bg-white text-primary-700 hover:bg-primary-50 px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                  onClick={() => navigate({ name: 'home' })}
                  rightIcon={<ArrowRight className="w-6 h-6 group-hover:translate-x-1.5 transition-transform" />}
                >
                  {dict.home.ctaButton}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}