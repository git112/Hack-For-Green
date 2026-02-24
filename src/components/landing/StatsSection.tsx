import { motion } from "framer-motion";
import { Users, FileText, MapPin, TrendingDown } from "lucide-react";

const stats = [
  { icon: Users, value: "50,000+", label: "Active Citizens" },
  { icon: FileText, value: "12,500", label: "Reports Resolved" },
  { icon: MapPin, value: "150", label: "Wards Covered" },
  { icon: TrendingDown, value: "23%", label: "AQI Improvement" },
];

export function StatsSection() {
  return (
    <section className="py-16 bg-foreground text-background">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="grid grid-cols-2 md:grid-cols-4 gap-8"
        >
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="text-center"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary/20 mb-4">
                <stat.icon className="w-6 h-6 text-primary" />
              </div>
              <div className="font-display text-3xl md:text-4xl font-bold text-background mb-1">
                {stat.value}
              </div>
              <div className="text-background/60 text-sm">{stat.label}</div>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
