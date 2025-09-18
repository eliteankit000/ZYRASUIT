import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  ShoppingBag,
  Mail,
  MessageSquare,
  Search,
  TrendingUp,
  DollarSign,
  BarChart3,
  Zap
} from "lucide-react";

interface AnalyticsCard {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  value: string;
  change: string;
  trend: 'up' | 'down' | 'neutral';
  actionText: string;
  category: 'metric' | 'performance' | 'growth';
}

export default function GrowthDashboard() {
  const { toast } = useToast();

  const analyticsCards: AnalyticsCard[] = [
    {
      id: 'optimized-products',
      title: 'Optimized Products',
      description: 'Products enhanced by Zyra AI with improved descriptions and SEO',
      icon: <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '247',
      change: '+23 this week',
      trend: 'up',
      actionText: 'View Products',
      category: 'metric'
    },
    {
      id: 'email-performance',
      title: 'Email Performance',
      description: 'Email open rates and click-through performance analytics',
      icon: <Mail className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '34.2%',
      change: '+5.7% CTR',
      trend: 'up',
      actionText: 'View Analytics',
      category: 'performance'
    },
    {
      id: 'sms-conversion',
      title: 'SMS Conversion',
      description: 'SMS recovery campaigns and sales conversion tracking',
      icon: <MessageSquare className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '28.9%',
      change: '+12.3% conversion',
      trend: 'up',
      actionText: 'View Campaigns',
      category: 'performance'
    },
    {
      id: 'seo-keyword-density',
      title: 'SEO Keyword Density',
      description: 'Keyword optimization and search ranking improvements',
      icon: <Search className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '92%',
      change: '+15% this month',
      trend: 'up',
      actionText: 'View Keywords',
      category: 'growth'
    },
    {
      id: 'content-roi',
      title: 'Content ROI Tracking',
      description: 'AI-generated content performance and sales impact measurement',
      icon: <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '145%',
      change: '+34% ROI increase',
      trend: 'up',
      actionText: 'View Reports',
      category: 'growth'
    },
    {
      id: 'revenue-impact',
      title: 'Revenue Impact',
      description: 'Total revenue boost from Zyra AI optimizations this month',
      icon: <DollarSign className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '$12,847',
      change: '+$3,200 this month',
      trend: 'up',
      actionText: 'View Breakdown',
      category: 'growth'
    },
    {
      id: 'seo-ranking-tracker',
      title: 'SEO Ranking Tracker',
      description: 'Track keyword positions and search visibility over time',
      icon: <BarChart3 className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: 'Rank #3',
      change: '+7 positions',
      trend: 'up',
      actionText: 'Track Rankings',
      category: 'growth'
    },
    {
      id: 'ab-test-results',
      title: 'A/B Test Results',
      description: 'Performance comparison of different content versions and optimization tests',
      icon: <Zap className="w-4 h-4 sm:w-5 sm:h-5 stroke-2" style={{ color: '#C1E8FF' }} />,
      value: '67%',
      change: '+23% win rate',
      trend: 'up',
      actionText: 'View Tests',
      category: 'performance'
    }
  ];

  // Mock mutation for analytics actions
  const analyticsMutation = useMutation({
    mutationFn: async (data: { cardId: string; action: string }) => {
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockResponses = {
        'optimized-products': {
          message: `Viewing 247 optimized products. Top performer: "Premium Wireless Headphones" with 89% CTR boost.`
        },
        'email-performance': {
          message: `Email analytics loaded. Open rate: 34.2% (industry avg: 21.3%). Top campaign: "Summer Sale 2024"`
        },
        'sms-conversion': {
          message: `SMS campaign analytics loaded. Recovery rate: 28.9%. Last 7 days: 156 abandoned carts recovered.`
        },
        'seo-keyword-density': {
          message: `SEO dashboard loaded. 92% keyword optimization score. Top keywords: "wireless earbuds", "premium audio"`
        },
        'content-roi': {
          message: `Content ROI tracking loaded. AI descriptions generated $12,847 additional revenue this month.`
        },
        'revenue-impact': {
          message: `Revenue breakdown loaded. Biggest impact: Product descriptions (+$8,200), Email campaigns (+$4,647)`
        },
        'seo-ranking-tracker': {
          message: `SEO rankings loaded. Average position: #3 (up from #10). Tracking 45 target keywords.`
        },
        'ab-test-results': {
          message: `A/B test results loaded. 12 active tests, 67% win rate. Best performer: "Emotional vs Technical" descriptions`
        }
      };

      return mockResponses[data.cardId as keyof typeof mockResponses] || { message: 'Analytics data loaded successfully.' };
    },
    onSuccess: (data: any) => {
      toast({
        title: "Analytics Loaded",
        description: data.message,
        duration: 4000,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Loading Failed",
        description: error.message || "Failed to load analytics data",
        variant: "destructive",
        duration: 3000,
      });
    }
  });

  const handleAnalyticsAction = (cardId: string) => {
    const card = analyticsCards.find(c => c.id === cardId);
    if (!card) return;

    analyticsMutation.mutate({
      cardId,
      action: card.actionText.toLowerCase().replace(/\s+/g, '_')
    });
  };

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      {/* Header */}
      <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
        <div className="flex items-center space-x-3">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-white tracking-tight">
              Growth Analytics Dashboard
            </h1>
            <p className="text-slate-300 text-sm sm:text-base lg:text-lg">
              Track your store's performance, optimization impact, and revenue growth powered by Zyra AI
            </p>
          </div>
        </div>
      </div>
      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch auto-rows-fr">
        {analyticsCards.map((card) => (
          <Card 
            key={card.id} 
            className="relative bg-gradient-to-br from-[#021024] to-[#052659] rounded-2xl transition-all duration-300 hover:scale-105 border-slate-700/50 hover:shadow-cyan-500/30 flex flex-col h-full"
            data-testid={`card-analytics-${card.id}`}
          >
            <CardHeader className="pb-4 min-h-[120px]">
              {/* Card Header with Consistent Flex Layout */}
              <div className="flex items-center justify-between mb-3 min-h-[48px]">
                <div className="flex items-center gap-3">
                  <div className="flex items-center justify-center w-8 h-8 transition-all duration-300">
                    {card.icon}
                  </div>
                  <CardTitle className="text-white font-bold text-sm sm:text-base lg:text-lg flex items-center whitespace-nowrap truncate" data-testid={`text-title-${card.id}`}>
                    {card.title}
                  </CardTitle>
                </div>
                <div className="text-right flex flex-col items-end gap-2 mt-[-13px] mb-[-13px] pt-[-10px] pb-[-10px] ml-[-15px] mr-[-15px] pl-[0px] pr-[0px] text-[12px]">
                  <div className="sm:text-xl lg:text-2xl font-bold text-white text-[14px]" data-testid={`text-value-${card.id}`}>
                    {card.value}
                  </div>
                  <Badge 
                    variant="secondary" 
                    className="transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 hover:bg-secondary/80 inline-flex items-center justify-center whitespace-nowrap rounded-full px-3 py-1 text-xs font-semibold bg-green-500/20 text-green-400 border border-transparent min-w-[80px] mt-[-13px] mb-[-13px] ml-[-3px] mr-[-3px] pl-[-12px] pr-[-12px] pt-[1px] pb-[1px]"
                    data-testid={`badge-trend-${card.id}`}
                  >
                    {card.change}
                  </Badge>
                </div>
              </div>
              <CardDescription className="text-slate-300 text-xs sm:text-sm leading-relaxed ml-7 sm:ml-11 min-h-[40px]" data-testid={`text-description-${card.id}`}>
                {card.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 pb-6 px-6 mt-auto">
              <Button
                onClick={() => handleAnalyticsAction(card.id)}
                disabled={analyticsMutation.isPending}
                className="h-10 w-full font-medium transition-all duration-300 bg-[#C1E8FF] hover:bg-[#C1E8FF] text-indigo-900 hover:scale-105"
                data-testid={`button-action-${card.id}`}
              >
                {analyticsMutation.isPending ? "Loading..." : card.actionText}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
      {/* Growth Summary */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-[#021024] to-[#052659] rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-slate-800/50 transition-all duration-300">
              <TrendingUp className="w-6 h-6 stroke-2" style={{ color: '#C1E8FF' }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">+89%</h3>
              <p className="text-slate-300 text-sm">Overall Growth</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#021024] to-[#052659] rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-slate-800/50 transition-all duration-300">
              <DollarSign className="w-6 h-6 stroke-2" style={{ color: '#C1E8FF' }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">$45,623</h3>
              <p className="text-slate-300 text-sm">Total AI Impact</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-[#021024] to-[#052659] rounded-2xl p-6">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-slate-800/50 transition-all duration-300">
              <Zap className="w-6 h-6 stroke-2" style={{ color: '#C1E8FF' }} />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">247</h3>
              <p className="text-slate-300 text-sm">Products Optimized</p>
            </div>
          </div>
        </Card>
      </div>
      {/* AI Performance Notice */}
      <div className="mt-8 p-6 bg-gradient-to-br from-[#021024] to-[#052659] rounded-2xl">
        <div className="flex items-start space-x-4">
          <div className="transition-all duration-300">
            <Zap className="w-6 h-6 stroke-2" style={{ color: '#C1E8FF' }} />
          </div>
          <div>
            <h3 className="text-white font-bold text-lg mb-2">AI-Powered Growth Intelligence</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              Your Zyra AI is continuously analyzing customer behavior, optimizing product descriptions, and improving 
              conversion rates. The dashboard shows real-time performance metrics across all optimization channels 
              including email campaigns, SMS recovery, SEO improvements, and content ROI tracking.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}