import React from 'react';
import { Link } from 'react-router-dom';
import { Building2, Star, Calendar, ArrowRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const HomePage: React.FC = () => {
  const features = [
    {
      title: 'Správa Nemovitostí',
      description: 'Kompletní přehled všech nemovitostí s možností přidávání, editace a sledování stavu.',
      icon: Building2,
      link: '/properties',
      color: 'text-blue-500',
    },
    {
      title: 'Recenze a Hodnocení',
      description: 'Sledujte hodnocení nemovitostí a zpětnou vazbu od klientů.',
      icon: Star,
      link: '/reviews',
      color: 'text-yellow-500',
    },
    {
      title: 'Plánování Schůzek',
      description: 'Organizujte prohlídky nemovitostí a konzultace s klienty.',
      icon: Calendar,
      link: '/appointments',
      color: 'text-green-500',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <section className="text-center space-y-4 py-12">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Vítejte v <span className="text-red-600">RE/MAX</span>
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Realitní kancelář - správa nemovitostí, hodnocení makléřů a plánování schůzek
        </p>
      </section>

      {/* Features Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Card key={feature.title} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Icon className={`h-6 w-6 ${feature.color}`} />
                  <CardTitle>{feature.title}</CardTitle>
                </div>
                <CardDescription>{feature.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <Link to={feature.link}>
                  <Button variant="outline" className="w-full group">
                    Přejít
                    <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </section>

      {/* Stats Section */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6 py-12">
        <div className="text-center space-y-2">
          <p className="text-4xl font-bold text-primary">250+</p>
          <p className="text-sm text-muted-foreground">Aktivních nemovitostí</p>
        </div>
        <div className="text-center space-y-2">
          <p className="text-4xl font-bold text-primary">500+</p>
          <p className="text-sm text-muted-foreground">Spokojených klientů</p>
        </div>
        <div className="text-center space-y-2">
          <p className="text-4xl font-bold text-primary">1000+</p>
          <p className="text-sm text-muted-foreground">Úspěšných transakcí</p>
        </div>
      </section>
    </div>
  );
};

export default HomePage;
