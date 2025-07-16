import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { getRandomKoreanBlueCategory, getGradientColors } from "@/lib/gradient-utils";

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
  
  // Generate a random gradient category and 3 random colors for this test
  const [category] = useState(() => getRandomKoreanBlueCategory());
  const [colors] = useState(() => {
    // Generate 3 random colors from different positions in the gradient
    const gradientColors = getGradientColors(20, undefined, category);
    return [
      gradientColors[0], // start
      gradientColors[Math.floor(gradientColors.length / 2)], // middle
      gradientColors[gradientColors.length - 1] // end
    ];
  });

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
            Describe the colors you see using your own words
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Color Display */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-foreground">
              Colors
            </h3>
            <div className="flex justify-center gap-8">
              {colors.map((color, index) => (
                <div key={index} className="flex flex-col items-center space-y-2">
                  <div 
                    className="w-24 h-24 rounded-lg border-2 border-border shadow-md"
                    style={{ backgroundColor: color }}
                  />
                  <span className="text-sm text-muted-foreground">
                    {index === 0 ? 'First Color' : index === 1 ? 'Second Color' : 'Third Color'}
                  </span>
                </div>
              ))}
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
                First Color
              </Label>
              <Textarea
                id="startPoint"
                placeholder="Describe the first color..."
                value={startPoint}
                onChange={(e) => setStartPoint(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="middlePoint" className="text-foreground font-medium">
                Second Color
              </Label>
              <Textarea
                id="middlePoint"
                placeholder="Describe the second color..."
                value={middlePoint}
                onChange={(e) => setMiddlePoint(e.target.value)}
                className="min-h-[100px] resize-none"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="endPoint" className="text-foreground font-medium">
                Third Color
              </Label>
              <Textarea
                id="endPoint"
                placeholder="Describe the third color..."
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