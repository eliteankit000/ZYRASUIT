import { useState } from "react";
import { useForm } from "react-hook-form";
import { useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Zap, Copy, TrendingUp, Search, Heart, Upload } from "lucide-react";

interface GenerateForm {
  productName: string;
  category: string;
  features: string;
  audience: string;
}

interface GeneratedResult {
  sales?: string;
  seo?: string;
  casual?: string;
}

export default function AIGenerator() {
  const { toast } = useToast();
  const [brandVoice, setBrandVoice] = useState("sales");
  const [generatedResults, setGeneratedResults] = useState<GeneratedResult>({});

  const form = useForm<GenerateForm>({
    defaultValues: {
      productName: "",
      category: "Electronics",
      features: "",
      audience: "General consumers",
    },
  });

  const generateMutation = useMutation({
    mutationFn: async (data: GenerateForm & { brandVoice: string }) => {
      const response = await apiRequest("POST", "/api/generate-description", data);
      return response.json();
    },
    onSuccess: (result, variables) => {
      setGeneratedResults(prev => ({
        ...prev,
        [variables.brandVoice]: result.description,
      }));
      toast({
        title: "Description generated!",
        description: `${variables.brandVoice} style description has been created.`,
      });
    },
    onError: (error: any) => {
      toast({
        title: "Generation failed",
        description: error.message || "Failed to generate description",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: GenerateForm) => {
    generateMutation.mutate({ ...data, brandVoice });
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} description copied to clipboard.`,
      });
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const voiceButtons = [
    { id: "sales", label: "Sales", icon: <TrendingUp className="w-4 h-4" /> },
    { id: "seo", label: "SEO", icon: <Search className="w-4 h-4" /> },
    { id: "casual", label: "Casual", icon: <Heart className="w-4 h-4" /> },
  ];

  return (
    <div className="max-w-4xl mx-auto">
      <Card className="gradient-card border-0 mb-8">
        <CardContent className="p-8">
          <h2 className="text-3xl font-bold mb-4" data-testid="text-ai-generator-title">AI Product Description Generator</h2>
          <p className="text-muted-foreground mb-8">Generate compelling product descriptions in multiple styles using advanced AI</p>

          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-6">
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div>
                  <Label htmlFor="productName">Product Name *</Label>
                  <Input
                    id="productName"
                    className="form-input mt-2"
                    placeholder="e.g., Wireless Bluetooth Headphones"
                    {...form.register("productName", { required: true })}
                    data-testid="input-product-name"
                  />
                </div>

                <div>
                  <Label htmlFor="category">Product Category</Label>
                  <Select 
                    value={form.watch("category")} 
                    onValueChange={(value) => form.setValue("category", value)}
                  >
                    <SelectTrigger className="form-input mt-2" data-testid="select-category">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Electronics">Electronics</SelectItem>
                      <SelectItem value="Clothing & Accessories">Clothing & Accessories</SelectItem>
                      <SelectItem value="Home & Garden">Home & Garden</SelectItem>
                      <SelectItem value="Sports & Outdoors">Sports & Outdoors</SelectItem>
                      <SelectItem value="Beauty & Health">Beauty & Health</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="features">Key Features (comma-separated)</Label>
                  <Textarea
                    id="features"
                    className="form-input mt-2 h-24 resize-none"
                    placeholder="e.g., Noise cancelling, 30-hour battery, wireless charging"
                    {...form.register("features")}
                    data-testid="textarea-features"
                  />
                </div>

                <div>
                  <Label htmlFor="audience">Target Audience</Label>
                  <Select 
                    value={form.watch("audience")} 
                    onValueChange={(value) => form.setValue("audience", value)}
                  >
                    <SelectTrigger className="form-input mt-2" data-testid="select-audience">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="General consumers">General consumers</SelectItem>
                      <SelectItem value="Tech enthusiasts">Tech enthusiasts</SelectItem>
                      <SelectItem value="Business professionals">Business professionals</SelectItem>
                      <SelectItem value="Athletes & fitness enthusiasts">Athletes & fitness enthusiasts</SelectItem>
                      <SelectItem value="Students">Students</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Brand Voice</Label>
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {voiceButtons.map((voice) => (
                      <Button
                        key={voice.id}
                        type="button"
                        onClick={() => setBrandVoice(voice.id)}
                        className={`${
                          brandVoice === voice.id
                            ? "active-tab"
                            : "border border-border hover:bg-muted"
                        }`}
                        variant={brandVoice === voice.id ? "default" : "outline"}
                        data-testid={`button-voice-${voice.id}`}
                      >
                        {voice.icon}
                        <span className="ml-2">{voice.label}</span>
                      </Button>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="gradient-button w-full"
                  disabled={generateMutation.isPending}
                  data-testid="button-generate"
                >
                  {generateMutation.isPending ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Zap className="w-4 h-4 mr-2" />
                      Generate Descriptions
                    </>
                  )}
                </Button>
              </form>
            </div>

            {/* Product Image Upload */}
            <div>
              <Label>Product Image (Optional)</Label>
              <div 
                className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-primary/50 transition-colors cursor-pointer mt-2"
                data-testid="upload-area"
              >
                <Upload className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-2">Drag & drop your image here</p>
                <p className="text-sm text-muted-foreground">or click to browse</p>
                <input type="file" accept="image/*" className="hidden" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Generated Results */}
      {Object.keys(generatedResults).length > 0 && (
        <div className="space-y-6">
          {generatedResults.sales && (
            <Card className="gradient-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <TrendingUp className="w-5 h-5 text-primary mr-2" />
                    Sales Style
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(generatedResults.sales!, "Sales")}
                      data-testid="button-copy-sales"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button className="gradient-button" data-testid="button-use-sales">
                      Use This
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-foreground leading-relaxed" data-testid="text-sales-result">
                    {generatedResults.sales}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedResults.seo && (
            <Card className="gradient-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Search className="w-5 h-5 text-chart-2 mr-2" />
                    SEO Style
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(generatedResults.seo!, "SEO")}
                      data-testid="button-copy-seo"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button className="gradient-button" data-testid="button-use-seo">
                      Use This
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-foreground leading-relaxed" data-testid="text-seo-result">
                    {generatedResults.seo}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {generatedResults.casual && (
            <Card className="gradient-card border-0">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-semibold flex items-center">
                    <Heart className="w-5 h-5 text-chart-3 mr-2" />
                    Casual Style
                  </h3>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => copyToClipboard(generatedResults.casual!, "Casual")}
                      data-testid="button-copy-casual"
                    >
                      <Copy className="w-4 h-4" />
                    </Button>
                    <Button className="gradient-button" data-testid="button-use-casual">
                      Use This
                    </Button>
                  </div>
                </div>
                <div className="bg-muted/30 p-4 rounded-lg">
                  <p className="text-foreground leading-relaxed" data-testid="text-casual-result">
                    {generatedResults.casual}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
