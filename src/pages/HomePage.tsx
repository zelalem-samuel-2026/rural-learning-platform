import { useEffect, useState } from 'react';
import {
  ArrowRight, ChevronLeft, ChevronRight, Sparkles, WifiOff, Accessibility, Brain, Languages,
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

const heroImages = [
  '/images/image 1.jpg',
  '/images/image 2.jpg',
  '/images/image 3.jpg',
  '/images/image 4.jpg',
  '/images/image 5.jpg',
  '/images/image 6.jpg',
  '/images/image 7.jpg',
  '/images/image 8.jpg',
  '/images/image 9.jpg',
  '/images/image 10.jpg',
  '/images/image 11.jpg',
  '/images/image 12.jpg',
  '/images/image 13.jpg',
  '/images/image 15.jpg',
  '/images/image 16.jpg',
  '/images/image 17.jpg',
  '/images/image 18.png',
];

export function HomePage({ navigate }: HomePageProps) {
  const { lang } = useStore();
  const dict = t(lang);

  // States for data
  const [grades, setGrades] = useState<Grade[]>([]);
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [loading, setLoading] = useState(true);

  // States for Hero Carousel
  const [currentSlide, setCurrentSlide] = useState(0);

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
      setCurrentSlide((prev) => (prev + 1) % heroImages.length);
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

  const getGradeCardStyles = (gradeName: string) => {
    if (gradeName.includes('5')) {
      return {
        card: 'bg-gradient-to-br from-[#E8F8F3] to-[#CFF1E7] border-[#159B83]/30 hover:border-[#159B83]/60 shadow-[0_10px_26px_-16px_rgba(21,155,131,0.32)] hover:shadow-[0_16px_34px_-14px_rgba(21,155,131,0.36)]',
        glow: 'before:bg-[radial-gradient(circle,#CFF1E7_0%,transparent_72%)]',
        title: 'group-hover:text-[#159B83]',
        details: 'bg-white/60 text-[#52756D]',
        button: 'bg-[#CFF1E7] text-[#0F6F5D] group-hover:bg-[#BCEBDD] group-hover:shadow-[0_4px_12px_-4px_rgba(21,155,131,0.3)]',
      };
    }
    if (gradeName.includes('6')) {
      return {
        card: 'bg-gradient-to-br from-[#F1EAFE] to-[#E4D7FA] border-[#8055CE]/30 hover:border-[#8055CE]/60 shadow-[0_10px_26px_-16px_rgba(128,85,206,0.30)] hover:shadow-[0_16px_34px_-14px_rgba(128,85,206,0.34)]',
        glow: 'before:bg-[radial-gradient(circle,#E4D7FA_0%,transparent_72%)]',
        title: 'group-hover:text-[#8055CE]',
        details: 'bg-white/60 text-[#695A84]',
        button: 'bg-[#E4D7FA] text-[#60409B] group-hover:bg-[#D8C6F2] group-hover:shadow-[0_4px_12px_-4px_rgba(128,85,206,0.28)]',
      };
    }
    if (gradeName.includes('7')) {
      return {
        card: 'bg-gradient-to-br from-[#EAF4FF] to-[#D5E9FF] border-[#2879C8]/30 hover:border-[#2879C8]/60 shadow-[0_10px_26px_-16px_rgba(40,121,200,0.30)] hover:shadow-[0_16px_34px_-14px_rgba(40,121,200,0.34)]',
        glow: 'before:bg-[radial-gradient(circle,#D5E9FF_0%,transparent_72%)]',
        title: 'group-hover:text-[#2879C8]',
        details: 'bg-white/60 text-[#526C87]',
        button: 'bg-[#D5E9FF] text-[#205D9A] group-hover:bg-[#C3DFFF] group-hover:shadow-[0_4px_12px_-4px_rgba(40,121,200,0.28)]',
      };
    }
    if (gradeName.includes('8')) {
      return {
        card: 'bg-gradient-to-br from-[#F1F7E5] to-[#E0EDC8] border-[#557D2D]/30 hover:border-[#557D2D]/60 shadow-[0_10px_26px_-16px_rgba(85,125,45,0.30)] hover:shadow-[0_16px_34px_-14px_rgba(85,125,45,0.34)]',
        glow: 'before:bg-[radial-gradient(circle,#E0EDC8_0%,transparent_72%)]',
        title: 'group-hover:text-[#557D2D]',
        details: 'bg-white/60 text-[#64734F]',
        button: 'bg-[#E0EDC8] text-[#45651F] group-hover:bg-[#D3E5B5] group-hover:shadow-[0_4px_12px_-4px_rgba(85,125,45,0.28)]',
      };
    }
    return {
      card: 'bg-white border-ink-200/50 hover:border-primary-300 shadow-md hover:shadow-2xl',
      glow: '',
      title: 'group-hover:text-primary-600',
      details: 'bg-ink-50 text-ink-500',
      button: 'bg-primary-50 text-primary-600 group-hover:bg-primary-600 group-hover:text-white group-hover:shadow-primary-500/30',
    };
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
      {/* Hero Image Carousel */}
      <section className="relative overflow-hidden min-h-[85vh] sm:min-h-[680px] sm:h-[680px] flex items-center justify-center bg-ink-900">
        
        {/* Carousel Images */}
        <div className="absolute inset-0 z-0 min-h-[85vh] sm:min-h-[680px] sm:h-[680px]">
          {heroImages.map((src, index) => (
            <img
              key={src}
              src={src}
              alt={`Welcome to Lerna Learning Platform - Slide ${index + 1}`}
              className={`absolute inset-0 w-full h-full object-cover bg-cover bg-center transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
              loading={index === 0 ? "eager" : "lazy"}
            />
          ))}
        </div>

        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev - 1 + heroImages.length) % heroImages.length)}
          className="absolute left-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white/70 drop-shadow-sm transition-colors hover:bg-white/10 hover:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="h-5 w-5" aria-hidden="true" />
        </button>
        <button
          type="button"
          onClick={() => setCurrentSlide((prev) => (prev + 1) % heroImages.length)}
          className="absolute right-4 top-1/2 z-10 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-transparent text-white/70 drop-shadow-sm transition-colors hover:bg-white/10 hover:text-white/90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-white"
          aria-label="Next slide"
        >
          <ChevronRight className="h-5 w-5" aria-hidden="true" />
        </button>
      </section>

      <section className="bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <div className="max-w-2xl text-center lg:text-left">
            <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold text-ink-900 leading-[1.15] mb-6 text-balance">
              Welcome to Lerna Learning Platform
            </h1>
            <span className="inline-flex items-center gap-1.5 bg-primary-50 text-primary-700 border border-primary-200 px-3.5 py-1.5 rounded-full text-sm font-semibold mb-6">
              <Sparkles className="w-4 h-4 text-primary-600" />
              {dict.home.badge}
            </span>
            <p className="text-lg text-ink-700 leading-relaxed mb-8 max-w-xl mx-auto lg:mx-0">
              {dict.home.heroSubtitle}
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center lg:justify-start">
              <Button size="lg" onClick={() => navigate({ name: 'home' })} rightIcon={<ArrowRight className="w-5 h-5" />}>
                {dict.home.heroCta}
              </Button>
              <Button size="lg" variant="outline" className="bg-white text-ink-900 border-ink-300 hover:bg-ink-50" onClick={() => navigate({ name: 'dashboard' })}>
                {dict.home.heroCta2}
              </Button>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10 max-w-2xl mx-auto lg:mx-0 pt-6 border-t border-ink-200">
              {[
                { value: '2,400+', label: dict.home.studentsCount },
                { value: '885+', label: dict.home.lessonsCount },
                { value: '14,125+', label: dict.home.quizQuestionsCount },
                { value: '100%', label: dict.home.offlineLabel },
              ].map((s) => (
                <div key={s.label} className="text-center lg:text-left">
                  <p className="text-2xl sm:text-3xl font-extrabold text-ink-900">{s.value}</p>
                  <p className="text-xs text-ink-500 mt-0.5">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
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
                const gradeStyles = getGradeCardStyles(name);

                return (
                  <Card
                    key={g.id}
                    hoverable
                    onClick={() => navigate({ name: 'grade', id: g.id })}
                    className={`p-6 flex flex-col items-center text-center gap-4 group transition-all duration-300 hover:-translate-y-1 border rounded-3xl cursor-pointer motion-reduce:transition-none motion-reduce:transform-none motion-reduce:hover:translate-y-0 ${gradeStyles.card}`}
                  >
                    {/* 3D Image Display or Fallback Icon */}
                    <div className={`relative isolate w-28 h-28 flex items-center justify-center motion-safe:group-hover:scale-110 transition-transform duration-500 ease-out mb-1 motion-reduce:transition-none before:pointer-events-none before:absolute before:left-1/2 before:top-1/2 before:-z-10 before:h-24 before:w-24 before:-translate-x-1/2 before:-translate-y-1/2 before:rounded-full before:blur-xl before:opacity-80 before:content-[''] ${gradeStyles.glow}`}>
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
                      <h3 className={`text-2xl font-black text-ink-900 ${gradeStyles.title} transition-colors`}>
                        {name}
                      </h3>
                      <p className={`text-xs font-medium px-2.5 py-1 rounded-full inline-block ${gradeStyles.details}`}>
                        {subjects.length} Subjects • Practice
                      </p>
                    </div>

                    <span className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold mt-2 transition-all duration-300 shadow-sm ${gradeStyles.button}`}>
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
                  className="relative bg-primary-600 text-white hover:bg-primary-700 px-8 py-6 rounded-full text-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold"
                  onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
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