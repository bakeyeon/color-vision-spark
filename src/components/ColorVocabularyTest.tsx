import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import GradientBar from "@/components/GradientBar";
import { getRandomKoreanBlueCategory } from "@/lib/gradient-utils";

export interface ColorVocabularyData {
  startPoint: string;
  middlePoint: string;
  endPoint: string;
  category: string;
}

interface ColorVocabularyTestProps {
  onComplete: (data: ColorVocabularyData) => void;
  onSkip: () => void;
}

const ColorVocabularyTest: React.FC<ColorVocabularyTestProps> = ({
  onComplete,
  onSkip,
}) => {
  const [startPoint, setStartPoint] = useState("");
  const [middlePoint, setMiddlePoint] = useState("");
  const [endPoint, setEndPoint] = useState("");
  
  // Generate a random gradient category for this test
  const [category] = useState(() => getRandomKoreanBlueCategory());

  const exampleWords = [
    "azure", "navy", "cobalt", "sky blue", "royal blue", 
    "powder blue", "steel blue", "midnight blue", "cornflower blue", 
    "cerulean", "periwinkle", "teal", "cyan", "indigo", "sapphire",
    "turquoise", "aqua", "slate blue", "cadet blue", "dodger blue"
  ];

  const handleSubmit = () => {
    // Check if at least one field is filled
    if (!startPoint.trim() && !middlePoint.trim() && !endPoint.trim()) {
      return; // Don't submit if all fields are empty
    }

    onComplete({
      startPoint: startPoint.trim(),
      middlePoint: middlePoint.trim(),
      endPoint: endPoint.trim(),
      category,
    });
  };

  const isSubmitDisabled = !startPoint.trim() && !middlePoint.trim() && !endPoint.trim();

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card className="shadow-lg border-primary/20">
        <CardHeader className="text-center bg-gradient-to-r from-primary/5 to-primary/10">
          <CardTitle className="text-2xl font-semibold text-primary">
            Color Vocabulary Test
          </CardTitle>
          <p className="text-muted-foreground mt-2">
            Describe the colors you see in this gradient using your own words
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Gradient Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Color Gradient
            </h3>
            <div className="flex justify-center">
              <GradientBar 
                numBlocks={12} 
                totalWidth={600} 
                category={category}
                className="mx-auto"
              />
            </div>
            <div className="flex justify-between text-sm text-muted-foreground px-4">
              <span>Start</span>
              <span>Middle</span>
              <span>End</span>
            </div>
          </div>

          {/* Reference Box */}
          <div className="bg-accent/50 rounded-lg p-4 border border-border">
            <h4 className="font-medium text-foreground mb-3">
              Example Color Words (for reference)
            </h4>
            <div className="flex flex-wrap gap-2">
              {exampleWords.map((word, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-background rounded text-sm text-muted-foreground border border-border"
                >
                  {word}
                </span>
              ))}
            </div>
          </div>

          {/* Text Areas */}
          <div className="grid gap-6 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="startPoint" className="text-foreground font-medium">
                Start Point Color
              </Label>
              <Textarea
                id="startPoint"
                placeholder="Describe the leftmost color..."
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middlePoint" className="text-foreground font-medium">
                Middle Point Color
              </Label>
              <Textarea
                id="middlePoint"
                placeholder="Describe the middle color..."
                value={middlePoint}
                onChange={(e) => setMiddlePoint(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endPoint" className="text-foreground font-medium">
                End Point Color
              </Label>
              <Textarea
                id="endPoint"
                placeholder="Describe the rightmost color..."
                value={endPoint}
                onChange={(e) => setEndPoint(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Fill in at least one description to continue, or skip this test.
          </p>
        </CardContent>

        <CardFooter className="flex justify-between gap-4 bg-accent/20">
          <Button 
            variant="outline" 
            onClick={onSkip}
            className="min-w-[120px]"
          >
            Skip Test
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={isSubmitDisabled}
            className="min-w-[120px]"
          >
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default ColorVocabularyTest;