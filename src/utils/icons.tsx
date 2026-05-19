import {
  Award, Calculator, DollarSign, FileCheck, HeartHandshake, Headphones,
  Home, Lightbulb, Lock, MapPin, RotateCcw, Shield, Target, TrendingUp, Users,
  type LucideIcon
} from "lucide-react";

const map: Record<string, LucideIcon> = {
  Award, Calculator, DollarSign, FileCheck, HeartHandshake, Headphones,
  Home, Lightbulb, Lock, MapPin, RotateCcw, Shield, Target, TrendingUp, Users,
};

export function getIcon(name: string): LucideIcon {
  return map[name] || Shield;
}
