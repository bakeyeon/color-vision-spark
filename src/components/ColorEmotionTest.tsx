import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

// Images imported as ES6 modules
import blue1 from "/public/lovable-uploads/0caba236-82e1-45e5-a081-24f26810215c.png";
import blue2 from "/public/lovable-uploads/23c0dc77-72e1-4330-a98a-18e6c0840a0f.png";
import blue3 from "/public/lovable-uploads/42080f31-1dc3-46d3-83e8-de77bd06332e.png";
import green1 from "/public/lovable-uploads/536357f8-45d2-42fa-a4af-2f196fe6502c.png";
import green2 from "/public/lovable-uploads/75d9f402-7c5d-4783-b206-fc671a76ab44.png";
import green3 from "/public/lovable-uploads/8910f02a-ea52-4f93-880a-6bba100b2626.png";
import teal1 from "/public/lovable-uploads/b1500335-6f2d-4627-b324-094a8502085e.png";
import teal2 from "/public/lovable-uploads/c03250c9-2e13-4365-b424-ebdb218f9817.png";
import teal3 from "/public/lovable-uploads/e44668cb-4181-4428-b872-8a64de8c91e1.png";
export interface ColorEmotionData {
  blueEmotion: string;
  greenEmotion: string;
  tealEmotion: string;
  selectedImages: {
    blue: string;
    green: string;
    teal: string;
  };
}
interface ColorEmotionTestProps {
  onComplete: (data: ColorEmotionData) => void;
  onSkip: () => void;
}
const ColorEmotionTest: React.FC<ColorEmotionTestProps> = ({
  onComplete,
  onSkip
}) => {
  const [blueEmotion, setBlueEmotion] = useState("");
  const [greenEmotion, setGreenEmotion] = useState("");
  const [tealEmotion, setTealEmotion] = useState("");

  // Arrays of images for each color category
  const blueImages = [blue1, blue2, blue3];
  const greenImages = [green1, green2, green3];
  const tealImages = [teal1, teal2, teal3];

  // Randomly select one image from each category
  const [selectedImages] = useState(() => {
    const randomBlue = blueImages[Math.floor(Math.random() * blueImages.length)];
    const randomGreen = greenImages[Math.floor(Math.random() * greenImages.length)];
    const randomTeal = tealImages[Math.floor(Math.random() * tealImages.length)];
    return {
      blue: randomBlue,
      green: randomGreen,
      teal: randomTeal
    };
  });
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if at least one emotion is provided
    if (!blueEmotion.trim() && !greenEmotion.trim() && !tealEmotion.trim()) {
      alert("Please describe your emotions for at least one image.");
      return;
    }
    const data: ColorEmotionData = {
      blueEmotion: blueEmotion.trim(),
      greenEmotion: greenEmotion.trim(),
      tealEmotion: tealEmotion.trim(),
      selectedImages
    };
    onComplete(data);
  };
  const isSubmitDisabled = !blueEmotion.trim() && !greenEmotion.trim() && !tealEmotion.trim();
  return <div className="min-h-screen bg-gradient-to-br from-blue-50 to-teal-50 dark:from-blue-950 dark:to-teal-950 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold mb-4">Color Emotion Test</CardTitle>
          <p className="text-muted-foreground">
            Please describe how you feel when you look at the given pictures.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Example words: cool, cold, frigid, clean, messy, dangerous, safe, warm, peaceful, energetic, etc.
          </p>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Blue Image */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={selectedImages.blue} alt="Blue color image" className="w-64 h-64 object-cover rounded-lg border-2 border-border shadow-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="blue-emotion" className="text-lg font-medium">How does this image make you feel?</Label>
                <Input id="blue-emotion" type="text" value={blueEmotion} onChange={e => setBlueEmotion(e.target.value)} placeholder="Enter emotional keywords..." className="text-center text-lg" />
              </div>
            </div>

            {/* Green Image */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={selectedImages.green} alt="Green color image" className="w-64 h-64 object-cover rounded-lg border-2 border-border shadow-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="green-emotion" className="text-lg font-medium">How does this image make you feel?</Label>
                <Input id="green-emotion" type="text" value={greenEmotion} onChange={e => setGreenEmotion(e.target.value)} placeholder="Enter emotional keywords..." className="text-center text-lg" />
              </div>
            </div>

            {/* Teal Image */}
            <div className="space-y-4">
              <div className="flex justify-center">
                <img src={selectedImages.teal} alt="Teal color image" className="w-64 h-64 object-cover rounded-lg border-2 border-border shadow-md" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="teal-emotion" className="text-lg font-medium">How does this image make you feel?</Label>
                <Input id="teal-emotion" type="text" value={tealEmotion} onChange={e => setTealEmotion(e.target.value)} placeholder="Enter emotional keywords..." className="text-center text-lg" />
              </div>
            </div>
          </form>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button type="button" variant="outline" onClick={onSkip}>
            Skip Test
          </Button>
          <Button type="submit" onClick={handleSubmit} disabled={isSubmitDisabled}>
            Continue
          </Button>
        </CardFooter>
      </Card>
    </div>;
};
export default ColorEmotionTest;