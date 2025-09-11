import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Zap, Star, TrendingUp, ShoppingCart, Mail, Search, BarChart3, Cog, ArrowRight, Play, Check } from "lucide-react";

export default function Landing() {
  const features = [
    {
      icon: <Zap className="w-6 h-6" />,
      title: "AI Product Descriptions",
      description: "Generate compelling product descriptions in Sales, SEO, and Casual styles with one click."
    },
    {
      icon: <Search className="w-6 h-6" />,
      title: "SEO Optimization", 
      description: "Auto-generate SEO titles, meta descriptions, and keyword-rich tags for better rankings."
    },
    {
      icon: <ShoppingCart className="w-6 h-6" />,
      title: "Cart Recovery",
      description: "AI-powered SMS and email campaigns to recover abandoned carts automatically."
    },
    {
      icon: <Mail className="w-6 h-6" />,
      title: "Upsell Emails",
      description: "Branded receipt emails with intelligent product recommendations and upsells."
    },
    {
      icon: <BarChart3 className="w-6 h-6" />,
      title: "Analytics Dashboard",
      description: "Track performance, conversions, and ROI with detailed analytics and insights."
    },
    {
      icon: <Cog className="w-6 h-6" />,
      title: "Bulk Optimization",
      description: "Optimize hundreds of products at once with CSV import/export and batch processing."
    }
  ];

  const plans = [
    {
      name: "Free Trial",
      price: "$0",
      period: "7 days",
      features: ["Full access", "All features", "No credit card"],
      popular: false
    },
    {
      name: "Starter",
      price: "$15",
      period: "per month",
      features: ["100 products", "500 emails", "Basic analytics"],
      popular: false
    },
    {
      name: "Pro",
      price: "$25", 
      period: "per month",
      features: ["Unlimited products", "2000 emails", "500 SMS", "Advanced analytics"],
      popular: true
    },
    {
      name: "Growth",
      price: "$49",
      period: "per month", 
      features: ["Everything unlimited", "A/B testing", "Premium templates", "Priority support"],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-border">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
                <Zap className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-foreground">Zyra</span>
            </div>

            <div className="hidden md:flex items-center space-x-8">
              <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">Features</a>
              <a href="#pricing" className="text-muted-foreground hover:text-foreground transition-colors">Pricing</a>
              <Link href="/auth/login" className="text-muted-foreground hover:text-foreground transition-colors">Login</Link>
              <Link href="/auth/register">
                <Button className="gradient-button" data-testid="button-get-started">Get Started</Button>
              </Link>
            </div>

            <button className="md:hidden text-foreground" data-testid="button-mobile-menu">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-24 pb-16 px-6">
        <div className="container mx-auto text-center max-w-4xl">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-accent to-primary bg-clip-text text-transparent" data-testid="text-hero-title">
            Smarter Sales, Faster Growth
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mb-8 leading-relaxed" data-testid="text-hero-subtitle">
            AI-powered Shopify optimization that boosts sales, recovers carts, and automates your growth with intelligent product descriptions and SEO.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
            <Link href="/auth/register">
              <Button className="gradient-button px-8 py-4 text-lg font-semibold" data-testid="button-start-trial">
                Start 7-Day Free Trial
              </Button>
            </Link>
            <Button variant="outline" className="px-8 py-4 text-lg font-semibold" data-testid="button-watch-demo">
              <Play className="w-4 h-4 mr-2" />
              Watch Demo
            </Button>
          </div>

          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-stat-sales">300%</div>
              <div className="text-sm text-muted-foreground">Sales Increase</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-stat-recovery">85%</div>
              <div className="text-sm text-muted-foreground">Cart Recovery</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-primary" data-testid="text-stat-setup">10min</div>
              <div className="text-sm text-muted-foreground">Setup Time</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-features-title">Powerful AI Features</h2>
            <p className="text-xl text-muted-foreground">Everything you need to optimize your Shopify store</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="gradient-card border-0" data-testid={`card-feature-${index}`}>
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mb-4 text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3" data-testid={`text-feature-title-${index}`}>{feature.title}</h3>
                  <p className="text-muted-foreground" data-testid={`text-feature-description-${index}`}>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-16 px-6">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4" data-testid="text-pricing-title">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground">Start with a 7-day free trial, upgrade anytime</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {plans.map((plan, index) => (
              <Card 
                key={index} 
                className={`pricing-card border-0 relative ${plan.popular ? 'border-primary/50' : ''}`}
                data-testid={`card-plan-${index}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground">Popular</Badge>
                  </div>
                )}
                <CardContent className="p-6">
                  <div className="text-center mb-6">
                    <h3 className="text-xl font-semibold mb-2" data-testid={`text-plan-name-${index}`}>{plan.name}</h3>
                    <div className="text-3xl font-bold" data-testid={`text-plan-price-${index}`}>{plan.price}</div>
                    <div className="text-sm text-muted-foreground" data-testid={`text-plan-period-${index}`}>{plan.period}</div>
                  </div>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center" data-testid={`text-plan-feature-${index}-${featureIndex}`}>
                        <Check className="w-4 h-4 text-primary mr-2" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                  <Link href="/auth/register">
                    <Button 
                      className={`w-full ${plan.popular ? 'gradient-button' : 'border border-border hover:bg-muted'}`}
                      variant={plan.popular ? "default" : "outline"}
                      data-testid={`button-choose-plan-${index}`}
                    >
                      {index === 0 ? "Start Trial" : "Choose Plan"}
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-6 bg-gradient-to-r from-primary/10 to-accent/10">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-cta-title">Ready to Transform Your Shopify Store?</h2>
          <p className="text-xl text-muted-foreground mb-8">Join thousands of merchants already using Zyra to boost their sales</p>
          <Link href="/auth/register">
            <Button className="gradient-button px-8 py-4 text-lg font-semibold" data-testid="button-cta-start">
              Start Your Free Trial Today
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-6 border-t border-border">
        <div className="container mx-auto text-center">
          <div className="flex items-center justify-center space-x-3 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-xl font-bold">Zyra</span>
          </div>
          <p className="text-muted-foreground text-sm">© 2024 Zyra. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
