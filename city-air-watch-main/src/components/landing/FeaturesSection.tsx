import { motion } from "framer-motion";
import { Navigation, Gift, Camera, Shield, Bell, BarChart3 } from "lucide-react";

const features = [
  {
    icon: Navigation,
    title: "Clean Route Navigation",
    description: "Find the healthiest path to your destination avoiding polluted zones",
    color: "bg-success/10 text-success",
  },
  {
    icon: Gift,
    title: "Earn Green Credits",
    description: "Report pollution, earn credits, and redeem exciting rewards",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: Camera,
    title: "AI-Powered Reporting",
    description: "Snap a photo and let AI detect pollution sources instantly",
    color: "bg-warning/10 text-warning",
  },
  {
    icon: Shield,
    title: "Government Action",
    description: "Officials receive real-time alerts and deploy resources quickly",
    color: "bg-destructive/10 text-destructive",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description: "Get notified about air quality changes in your area",
    color: "bg-primary/10 text-primary",
  },
  {
    icon: BarChart3,
    title: "Analytics Dashboard",
    description: "Track pollution trends and measure the impact of actions",
    color: "bg-success/10 text-success",
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

export function FeaturesSection() {
  return (
    <section className="py-20 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
            How It Works
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive platform connecting citizens and government for cleaner air
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {features.map((feature) => (
            <motion.div
              key={feature.title}
              variants={itemVariants}
              className="group bg-card rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300 border border-border/50"
            >
              <div className={`w-14 h-14 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <feature.icon className="w-7 h-7" />
              </div>
              <h3 className="font-display text-xl font-semibold text-foreground mb-2">
                {feature.title}
              </h3>
              <p className="text-muted-foreground text-sm">
                {feature.description}
              </p>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
