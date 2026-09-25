import { GraduationCap } from 'lucide-react';
import { useStore } from '@/lib/store';
import { t } from '@/lib/i18n';
import type { Route } from '@/lib/types';

interface FooterProps {
  navigate: (r: Route) => void;
}

export function Footer({ navigate }: FooterProps) {
  const { lang } = useStore();
  const dict = t(lang);
  const scrollToTop = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const linkGroups = [
    {
      title: 'Resources',
      links: ['Bilingual Lessons', 'Past Ministry Exams (Gr 6 & 8)', 'YouTube Videos', 'Mock Practice Exams', 'Study Guides', 'FAQ'],
    },
    {
      title: 'Company',
      links: ['About Us', 'Our Team', 'Careers', 'Contact'],
    },
    {
      title: 'Legal',
      links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'],
    },
  ];

  return (
    <footer className="bg-ink-900 text-ink-300 mt-auto">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-extrabold text-white">{dict.brand}</span>
            </div>
            <p className="text-sm leading-relaxed max-w-md">{dict.footer.mission}</p>
          </div>

          {linkGroups.map((group) => (
            <div key={group.title}>
              <h4 className="text-white font-bold mb-4 text-xs uppercase tracking-wide">{group.title}</h4>
              <div className="flex flex-col items-start gap-2.5">
                {group.links.map((link) => (
                  <a
                    key={link}
                    href="#"
                    onClick={scrollToTop}
                    className="text-sm text-ink-300 hover:text-primary-400 transition-colors"
                  >
                    {link}
                  </a>
                ))}
              </div>
            </div>
          ))}
        </div>

        <hr className="mt-10 border-0 border-t border-ink-800" />
        <div className="pt-6 text-center">
          <p className="text-sm text-ink-400">© 2026 Lerna. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
}
