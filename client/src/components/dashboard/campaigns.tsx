import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Mail, 
  MessageSquare, 
  FileText, 
  Brain, 
  Target, 
  Users, 
  RotateCcw,
  Zap,
  TrendingUp,
  Sparkles
} from "lucide-react";

interface CampaignTool {
  id: string;
  title: string;
  description: string;
  icon: JSX.Element;
  category: 'existing' | 'new';
  actionText: string;
  comingSoon: boolean;
  tooltip: string;
}

export default function Campaigns() {
  const { toast } = useToast();

  const campaignTools: CampaignTool[] = [
    {
      id: 'upsell-receipts',
      title: 'Upsell Email Receipts',
      description: 'Auto-generate branded email receipts that include personalized upsell offers and recommendations',
      icon: <Mail className="w-8 h-8" style={{ color: '#00D4FF' }} />,
      category: 'existing',
      actionText: 'Configure Receipts',
      comingSoon: false,
      tooltip: 'Automatically add upsell recommendations to every purchase confirmation email'
    },
    {
      id: 'abandoned-cart-sms',
      title: 'Abandoned Cart SMS',
      description: 'AI-crafted SMS messages to recover abandoned carts with personalized incentives',
      icon: <MessageSquare className="w-8 h-8" style={{ color: '#FF0080' }} />,
      category: 'existing',
      actionText: 'Setup SMS Recovery',
      comingSoon: false,
      tooltip: 'Send targeted SMS campaigns to recover lost sales from abandoned shopping carts'
    },
    {
      id: 'custom-templates',
      title: 'Custom Templates',
      description: 'Create and edit email & SMS workflow templates with drag-and-drop builder',
      icon: <FileText className="w-8 h-8" style={{ color: '#00FF88' }} />,
      category: 'existing',
      actionText: 'Edit Templates',
      comingSoon: false,
      tooltip: 'Design custom email and SMS templates for all your marketing workflows'
    },
    {
      id: 'behavioral-triggers',
      title: 'Behavioral Triggers',
      description: 'AI decides optimal timing & channel - email for active users, SMS for inactive ones',
      icon: <Brain className="w-8 h-8" style={{ color: '#8B5CF6' }} />,
      category: 'new',
      actionText: 'Setup Triggers',
      comingSoon: true,
      tooltip: 'Let AI automatically choose the best communication channel and timing for each customer'
    },
    {
      id: 'ai-upsell-suggestions',
      title: 'AI Upsell Suggestions',
      description: 'Auto-pick the most relevant products to recommend from your entire catalog',
      icon: <Sparkles className="w-8 h-8" style={{ color: '#FFD700' }} />,
      category: 'new',
      actionText: 'Enable AI Upsells',
      comingSoon: true,
      tooltip: 'AI analyzes purchase history and product relationships to suggest perfect upsells'
    },
    {
      id: 'dynamic-segmentation',
      title: 'Dynamic Segmentation',
      description: 'Auto-segment customers into groups: first-timers, loyal buyers, discount seekers',
      icon: <Users className="w-8 h-8" style={{ color: '#00D4FF' }} />,
      category: 'new',
      actionText: 'View Segments',
      comingSoon: true,
      tooltip: 'Automatically group customers based on behavior patterns for targeted messaging'
    },
    {
      id: 'multi-channel-repurposing',
      title: 'Multi-Channel Repurposing',
      description: 'Convert one product copy into multiple formats: ad copy → social → email → SMS',
      icon: <RotateCcw className="w-8 h-8" style={{ color: '#FF0080' }} />,
      category: 'new',
      actionText: 'Generate Variants',
      comingSoon: true,
      tooltip: 'Transform one piece of content into optimized versions for all marketing channels'
    }
  ];

  // Mock mutation for campaign actions
  const campaignMutation = useMutation({
    mutationFn: async (data: { toolId: string; action: string }) => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const mockResponses = {
        'upsell-receipts': {
          message: `Configured upsell receipts for ${Math.floor(Math.random() * 500) + 200} products. Expected 15-25% revenue increase.`
        },
        'abandoned-cart-sms': {
          message: `SMS recovery campaigns activated. Targeting ${Math.floor(Math.random() * 150) + 50} abandoned carts in the last 24 hours.`
        },
        'custom-templates': {
          message: `Template editor opened. ${Math.floor(Math.random() * 20) + 10} existing templates available for customization.`
        }
      };

      return mockResponses[data.toolId as keyof typeof mockResponses] || { message: 'Campaign action completed successfully.' };
    },
    onSuccess: (data) => {
      toast({
        title: "Campaign Updated!",
        description: data.message,
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update campaign. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleToolAction = (toolId: string) => {
    const tool = campaignTools.find(t => t.id === toolId);
    
    if (tool?.comingSoon) {
      toast({
        title: "Coming Soon!",
        description: `${tool.title} will be available in a future update. Join our newsletter for launch notifications.`,
      });
      return;
    }

    campaignMutation.mutate({ 
      toolId,
      action: tool?.actionText || 'execute'
    });
  };

  return (
    <div className="p-6 space-y-6" style={{ backgroundColor: '#0D0D1F', minHeight: '100vh' }}>
      {/* Header */}
      <div className="space-y-3 mb-8">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
            <Mail className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold text-white tracking-tight">
              AI Email & SMS Growth Engine
            </h1>
            <p className="text-cyan-300 text-lg">
              Automate your customer communications with intelligent campaigns and behavioral triggers
            </p>
          </div>
        </div>
      </div>

      {/* Campaign Tools Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {campaignTools.map((tool) => (
          <Card 
            key={tool.id} 
            className="relative bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 rounded-xl shadow-2xl hover:shadow-cyan-500/25 transition-all duration-500 hover:scale-105 hover:border-cyan-400/40 backdrop-blur-sm"
            style={{ backgroundColor: 'rgba(13, 13, 31, 0.95)' }}
            data-testid={`card-campaign-${tool.id}`}
          >
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 rounded-xl opacity-0 hover:opacity-100 transition-opacity duration-500" />
            
            <CardHeader className="pb-4 relative z-10">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-slate-800/50 border border-cyan-500/30">
                    {tool.icon}
                  </div>
                  <CardTitle className="text-white font-bold text-lg leading-tight" data-testid={`text-title-${tool.id}`}>
                    {tool.title}
                  </CardTitle>
                </div>
                {tool.comingSoon && (
                  <Badge 
                    variant="secondary" 
                    className="bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xs px-3 py-1 rounded-full border-0 shadow-lg"
                    data-testid={`badge-coming-soon-${tool.id}`}
                  >
                    Coming Soon
                  </Badge>
                )}
              </div>
              <CardDescription className="text-cyan-100 mt-3 leading-relaxed" data-testid={`text-description-${tool.id}`}>
                {tool.description}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-0 relative z-10">
              <Button
                onClick={() => handleToolAction(tool.id)}
                disabled={tool.comingSoon || campaignMutation.isPending}
                className={`w-full font-semibold transition-all duration-300 ${
                  tool.comingSoon
                    ? "bg-slate-700 hover:bg-slate-600 text-slate-300 border border-slate-600"
                    : "bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white shadow-lg hover:shadow-cyan-500/50 border-0"
                } rounded-lg py-3`}
                data-testid={`button-action-${tool.id}`}
                title={tool.tooltip}
              >
                {campaignMutation.isPending ? (
                  <span className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Processing...</span>
                  </span>
                ) : (
                  tool.actionText
                )}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Stats Overview */}
      <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-cyan-500/20 rounded-xl p-6" style={{ backgroundColor: 'rgba(13, 13, 31, 0.95)' }}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-cyan-500 to-blue-600">
              <TrendingUp className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">245%</h3>
              <p className="text-cyan-300 text-sm">Avg. Revenue Increase</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-purple-500/20 rounded-xl p-6" style={{ backgroundColor: 'rgba(13, 13, 31, 0.95)' }}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-purple-500 to-pink-600">
              <Target className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">89%</h3>
              <p className="text-purple-300 text-sm">Cart Recovery Rate</p>
            </div>
          </div>
        </Card>
        
        <Card className="bg-gradient-to-br from-slate-900/90 to-slate-800/90 border border-green-500/20 rounded-xl p-6" style={{ backgroundColor: 'rgba(13, 13, 31, 0.95)' }}>
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-gradient-to-r from-green-500 to-emerald-600">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-white font-bold text-xl">12.3x</h3>
              <p className="text-green-300 text-sm">Email Engagement</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Pro Features Notice */}
      <div className="mt-8 p-6 bg-gradient-to-r from-purple-900/30 to-pink-900/30 rounded-xl border border-purple-500/30 backdrop-blur-sm">
        <div className="flex items-start space-x-4">
          <Sparkles className="w-8 h-8 text-purple-400 mt-1 flex-shrink-0" />
          <div>
            <h3 className="text-white font-bold text-lg mb-2">AI-Powered Campaign Intelligence</h3>
            <p className="text-purple-200 text-sm leading-relaxed">
              Our advanced AI analyzes customer behavior, purchase patterns, and engagement history to automatically 
              optimize your email and SMS campaigns. From behavioral triggers to dynamic segmentation, 
              every message is personalized for maximum conversion.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}