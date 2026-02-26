import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { MapPin, Sun, DollarSign, Compass, Star, ArrowRight, Globe, Map, Stamp, UserCircle, Plane, Camera, Heart } from "lucide-react";
import { useTranslation } from "@/hooks/useTranslation";

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const features = [
  { icon: Sun, key: "weather", gradient: "from-amber-500 to-orange-500" },
  { icon: DollarSign, key: "cost", gradient: "from-emerald-500 to-teal-500" },
  { icon: MapPin, key: "poi", gradient: "from-rose-500 to-pink-500" },
  { icon: Star, key: "recommend", gradient: "from-violet-500 to-indigo-500" },
];

const showcaseSteps = [
  {
    icon: Map,
    key: "map",
    gradient: "from-blue-500 to-cyan-500",
    link: "/map",
  },
  {
    icon: Stamp,
    key: "passport",
    gradient: "from-amber-500 to-orange-500",
    link: "/profile",
  },
  {
    icon: UserCircle,
    key: "profile",
    gradient: "from-violet-500 to-purple-500",
    link: "/profile",
  },
];

export default function Home() {
  const { t } = useTranslation();

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      {/* Nav */}
      <motion.nav
        className="fixed top-0 inset-x-0 z-50 glass-panel border-b border-border/50"
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-6xl mx-auto flex items-center justify-between px-6 py-3">
          <div className="flex items-center gap-2">
            <Globe className="w-5 h-5 text-primary" />
            <span className="font-bold text-lg tracking-tight">Wanderlust Maps</span>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/map"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {t("home.nav.explore")}
            </Link>
            <Link
              to="/auth"
              className="text-sm font-semibold px-4 py-2 rounded-full bg-primary text-primary-foreground hover:opacity-90 transition-opacity"
            >
              {t("home.nav.login")}
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero */}
      <section className="relative flex flex-col items-center justify-center min-h-[90vh] px-6 pt-24 pb-16 text-center">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-primary/10 blur-[120px]" />
          <div className="absolute bottom-0 left-1/4 w-[400px] h-[400px] rounded-full bg-accent/20 blur-[100px]" />
        </div>

        <motion.div
          className="relative z-10 max-w-3xl"
          initial="hidden"
          animate="visible"
        >
          <motion.div
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 text-primary text-xs font-semibold mb-8 border border-primary/20"
          >
            <Compass className="w-3.5 h-3.5" />
            Travel Smarter
          </motion.div>

          <motion.h1
            custom={1}
            variants={fadeUp}
            className="text-5xl sm:text-7xl font-bold tracking-tight leading-[1.1] mb-6"
          >
            {t("home.hero.title")}
          </motion.h1>

          <motion.p
            custom={2}
            variants={fadeUp}
            className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-4"
          >
            {t("home.hero.subtitle")}
          </motion.p>

          <motion.p
            custom={3}
            variants={fadeUp}
            className="text-sm text-muted-foreground/70 max-w-xl mx-auto mb-10"
          >
            {t("home.hero.description")}
          </motion.p>

          <motion.div custom={4} variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/map"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
            >
              {t("home.hero.cta")}
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/auth"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-foreground font-bold text-base hover:bg-accent transition-all duration-300"
            >
              {t("home.nav.login")}
            </Link>
          </motion.div>
        </motion.div>

        <motion.div
          className="absolute bottom-8 right-8 sm:right-16 opacity-10 pointer-events-none"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <Globe className="w-48 h-48 sm:w-64 sm:h-64" />
        </motion.div>
      </section>

      {/* How It Works — End-to-End Showcase */}
      <section className="relative py-24 px-6 bg-card/50">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("home.showcase.title")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("home.showcase.subtitle")}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {showcaseSteps.map((step, i) => (
              <motion.div
                key={step.key}
                className="relative group"
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.6 }}
              >
                <Link to={step.link} className="block">
                  <div className="rounded-3xl p-8 bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden group-hover:-translate-y-2">
                    {/* Step number */}
                    <div className="absolute top-4 right-4 w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-bold text-muted-foreground">
                      {i + 1}
                    </div>

                    <div className={`inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-br ${step.gradient} text-white mb-6 shadow-lg`}>
                      <step.icon className="w-7 h-7" />
                    </div>

                    <h3 className="text-xl font-bold mb-3">
                      {t(`home.showcase.${step.key}.title`)}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                      {t(`home.showcase.${step.key}.desc`)}
                    </p>

                    <ul className="space-y-2">
                      {[1, 2, 3].map((n) => (
                        <li key={n} className="flex items-start gap-2 text-xs text-muted-foreground">
                          <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0" />
                          {t(`home.showcase.${step.key}.bullet${n}`)}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-6 flex items-center gap-1.5 text-sm font-semibold text-primary group-hover:gap-3 transition-all">
                      {t(`home.showcase.${step.key}.cta`)}
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  </div>
                </Link>

                {/* Connector line between cards (desktop) */}
                {i < showcaseSteps.length - 1 && (
                  <div className="hidden md:block absolute top-1/2 -right-4 w-8 border-t-2 border-dashed border-border" />
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="relative py-24 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-center mb-16 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {t("home.features.title")}
          </motion.h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.key}
                className="group relative rounded-3xl p-8 bg-card border border-border/50 hover:border-primary/30 transition-all duration-300 overflow-hidden"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.5 }}
                whileHover={{ y: -4 }}
              >
                <div className={`absolute top-0 left-0 w-full h-1 bg-gradient-to-r ${f.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />

                <div className={`inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-br ${f.gradient} text-white mb-5`}>
                  <f.icon className="w-6 h-6" />
                </div>

                <h3 className="text-xl font-bold mb-3">
                  {t(`home.feature.${f.key}.title`)}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t(`home.feature.${f.key}.desc`)}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats / Social Proof */}
      <section className="py-20 px-6 bg-card/50">
        <div className="max-w-4xl mx-auto">
          <motion.div
            className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            {[
              { icon: Globe, value: "50+", labelKey: "home.stats.regions" },
              { icon: MapPin, value: "200+", labelKey: "home.stats.pois" },
              { icon: Plane, value: "12", labelKey: "home.stats.months" },
              { icon: Heart, value: "∞", labelKey: "home.stats.memories" },
            ].map((stat, i) => (
              <motion.div
                key={stat.labelKey}
                className="flex flex-col items-center gap-2"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
              >
                <stat.icon className="w-6 h-6 text-primary mb-1" />
                <span className="text-3xl sm:text-4xl font-bold text-foreground">{stat.value}</span>
                <span className="text-xs text-muted-foreground font-medium">{t(stat.labelKey)}</span>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* CTA */}
      <section className="relative py-24 px-6">
        <div className="max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            <Camera className="w-10 h-10 text-primary mx-auto mb-6" />
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight mb-4">
              {t("home.cta.title")}
            </h2>
            <p className="text-muted-foreground mb-8 max-w-xl mx-auto">
              {t("home.cta.subtitle")}
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                to="/map"
                className="group inline-flex items-center gap-2 px-8 py-4 rounded-2xl bg-primary text-primary-foreground font-bold text-base shadow-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-300"
              >
                {t("home.hero.cta")}
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                to="/profile"
                className="inline-flex items-center gap-2 px-8 py-4 rounded-2xl border border-border text-foreground font-bold text-base hover:bg-accent transition-all duration-300"
              >
                {t("home.cta.passport")}
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-border/50">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm">
            <Globe className="w-4 h-4 text-primary" />
            <span>{t("home.footer.made")}</span>
          </div>
          <Link
            to="/map"
            className="text-sm font-medium text-primary hover:underline"
          >
            {t("home.hero.cta")} →
          </Link>
        </div>
      </footer>
    </div>
  );
}
