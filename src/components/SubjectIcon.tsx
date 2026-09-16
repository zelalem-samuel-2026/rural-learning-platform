import { Calculator, BookOpen, Laptop, type LucideIcon } from 'lucide-react';

const iconMap: Record<string, LucideIcon> = {
  Calculator,
  BookOpen,
  Laptop,
};

export function SubjectIcon({ name, className }: { name: string; className?: string }) {
  const Icon = iconMap[name] ?? BookOpen;
  return <Icon className={className} />;
}
