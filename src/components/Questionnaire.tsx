import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";
import { type TrialResult } from "./ExperimentPanel";

interface QuestionnaireData {
  ageGroup: string;
  country: string;
  yearsInCountry: string;
  language: string;
  mediaType: string;
  mediaKind: string;
  mediaHours: string;
}

interface Props {
  onComplete(data: QuestionnaireData): void;
}

const ageGroups = [
  "under 18",
  "18–24",
  "25–34",
  "35–44",
  "45+"
];
const yearsOpts = [
  "less than 5 years",
  "5–10",
  "11–20",
  "more than 20"
];

// Google Apps Script 웹앱 URL
const GOOGLE_APPS_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyVgRCzvDu0kcNcnEYyjCVytVQDifjj41LinJ3IrojQU9UI-Q1GcUJryXO8z-GZlZcI/exec";

const Questionnaire: React.FC<Props> = ({ onComplete }) => {
  const [form, setForm] = useState<Partial<QuestionnaireData>>({});
  const [submitting, setSubmitting] = useState(false);

  const isText = form.mediaType === "Text";
  const isVideo = form.mediaType === "Video";

  const handleChange = (key: keyof QuestionnaireData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !(form.ageGroup && form.country && form.yearsInCountry && form.language && form.mediaType && form.mediaKind && form.mediaHours)
    ) {
      toast({ variant: "destructive", title: "Please fill out all fields." });
      return;
    }
    setSubmitting(true);

    // Combine questionnaire with experiment data and color vocabulary, accumulate in array
    const storedResults = localStorage.getItem("experimentResults");
    const experimentResults: TrialResult[] | null = storedResults ? JSON.parse(storedResults) : null;
    
    const storedColorVocab = localStorage.getItem("colorVocabularyData");
    const colorVocabularyResults = storedColorVocab ? JSON.parse(storedColorVocab) : null;

    const dataToSave = {
      questionnaire: form,
      experiment: experimentResults,
      colorVocabulary: colorVocabularyResults,
      submitted_at: new Date().toISOString(),
      page_url: window.location.href
    };

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
      await sendToGoogleSheets(form as QuestionnaireData);

      setTimeout(() => {
        setSubmitting(false);

        // Clean up individual keys for future compatibility? (Optional: keep for now)
        onComplete(form as QuestionnaireData);
      }, 400);
    } catch (error) {
      toast({
        title: "Data Saved Locally",
        description: "Your responses are saved and can be accessed by the researcher.",
      });
      
      setTimeout(() => {
        setSubmitting(false);
        onComplete(form as QuestionnaireData);
      }, 400);
    }
  };

  return (
    <Card className="max-w-lg w-full mx-auto my-10 shadow-lg">
      <CardHeader>
        <CardTitle>
          <span className="text-primary text-lg font-bold">Final questions (for research)</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="font-semibold">Age group</label>
            <Select value={form.ageGroup} onValueChange={val => handleChange("ageGroup", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                {ageGroups.map(g => (
                  <SelectItem key={g} value={g}>{g}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-semibold">Country of current residence</label>
            <Input
              value={form.country ?? ""}
              onChange={e => handleChange("country", e.target.value)}
              autoComplete="country"
              required
            />
          </div>
          <div>
            <label className="font-semibold">How many years have you lived in this country?</label>
            <Select value={form.yearsInCountry} onValueChange={val => handleChange("yearsInCountry", val)}>
              <SelectTrigger>
                <SelectValue placeholder="Select one" />
              </SelectTrigger>
              <SelectContent>
                {yearsOpts.map(opt => (
                  <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="font-semibold">Primary language used in daily life</label>
            <Input
              value={form.language ?? ""}
              onChange={e => handleChange("language", e.target.value)}
              autoComplete="language"
              required
            />
          </div>
          <div>
            <label className="font-semibold">Which media type do you consume most?</label>
            <Select value={form.mediaType} onValueChange={v => handleChange("mediaType", v)}>
              <SelectTrigger>
                <SelectValue placeholder="Text or Video?" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Text">Text</SelectItem>
                <SelectItem value="Video">Video</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {isText && (
            <>
              <div>
                <label className="font-semibold">What kind? (books, news, forums, etc.)</label>
                <Input
                  value={form.mediaKind ?? ""}
                  onChange={e => handleChange("mediaKind", e.target.value)}
                  required={isText}
                />
              </div>
              <div>
                <label className="font-semibold">Weekly reading time (hours)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.mediaHours ?? ""}
                  onChange={e => handleChange("mediaHours", e.target.value.replace(/[^\d]/g, ""))}
                  required={isText}
                />
              </div>
            </>
          )}
          {isVideo && (
            <>
              <div>
                <label className="font-semibold">What kind? (TV, long YouTube, Shorts, TikTok, etc.)</label>
                <Input
                  value={form.mediaKind ?? ""}
                  onChange={e => handleChange("mediaKind", e.target.value)}
                  required={isVideo}
                />
              </div>
              <div>
                <label className="font-semibold">Weekly viewing time (hours)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.mediaHours ?? ""}
                  onChange={e => handleChange("mediaHours", e.target.value.replace(/[^\d]/g, ""))}
                  required={isVideo}
                />
              </div>
            </>
          )}

          <Button type="submit" className="self-end" disabled={submitting}>
            Submit
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export type { QuestionnaireData };
export default Questionnaire;
