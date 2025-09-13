import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

// Define types for the orphaned code
interface QuestionnaireData {
  [key: string]: any;
}

interface TrialResult {
  [key: string]: any;
}
// Keep EmotionData alias for backward compatibility with older code snippets
// It is defined after ColorEmotionData below.

// Images imported as ES6 modules
import blue1 from "/public/images/blue/blue1.png";
import blue2 from "/public/images/blue/blue2.png";
import blue3 from "/public/images/blue/blue3.png";
import green1 from "/public/images/green/green1.png";
import green2 from "/public/images/green/green2.png";
import green3 from "/public/images/green/green3.png";
import teal1 from "/public/images/teal/teal1.png";
import teal2 from "/public/images/teal/teal2.png";
import teal3 from "/public/images/teal/teal3.png";
// Google Apps Script URL (kept for legacy code paths)
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyVgRCzvDu0kcNcnEYyjCVytVQDifjj41LinJ3IrojQU9UI-Q1GcUJryXO8z-GZlZcI/exec";

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

// Define EmotionData alias after interface is declared
export type EmotionData = ColorEmotionData;
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

  
  const sendToGoogleSheets = async (data: QuestionnaireData) => {
    const storedResults = localStorage.getItem("experimentResults");
    const experimentResults: TrialResult[] | null = storedResults ? JSON.parse(storedResults) : null;
    
    const storedColorVocab = localStorage.getItem("colorVocabularyData");
    const colorVocabularyResults = storedColorVocab ? JSON.parse(storedColorVocab) : null;

    try {
      const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        mode: "no-cors", // Google Apps Script requires no-cors
        body: JSON.stringify({
          questionnaire: data,
          experiment: experimentResults,
          colorVocabulary: colorVocabularyResults,
          submitted_at: new Date().toISOString(),
          page_url: window.location.href
        })
      });

      console.log("Data successfully sent to Google Sheets");
      toast({
        title: "Survey Submitted!",
        description: "Your responses were sent to Google Sheets successfully.",
      });
    } catch (err) {
      console.error("Error sending to Google Sheets:", err);
      toast({
        variant: "destructive",
        title: "Failed to send data to Google Sheets.",
        description: "Please check your internet connection and try again.",
      });
      throw err;
    }
  };

  
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

  // Function to save dataset and send to Google Sheets (kept from earlier code)
  const saveDataToSheets = async (dataToSave: any, form: EmotionData) => {
    // Load the existing dataset array (or create a new one)
    const datasetRaw = localStorage.getItem("experimentDataset");
    let dataset: any[] = [];
    if (datasetRaw) {
      try {
        dataset = JSON.parse(datasetRaw);
        if (!Array.isArray(dataset)) dataset = [];
      } catch {
        dataset = [];
      }
    }
    dataset.push(dataToSave);
    localStorage.setItem("experimentDataset", JSON.stringify(dataset));

    try {
      // Try to send data to Google Sheets
      await sendToGoogleSheets(form as any);

      setTimeout(() => {
        // Clean up individual keys for future compatibility? (Optional: keep for now)
        onComplete(form);
      }, 400);
    } catch (error) {
      toast({
        title: "Data Saved Locally",
        description: "Your responses are saved and can be accessed by the researcher.",
      });
      
      setTimeout(() => {
        onComplete(form);
      }, 400);
    }
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
