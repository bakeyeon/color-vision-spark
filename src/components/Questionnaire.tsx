import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "@/hooks/use-toast";

export interface QuestionnaireData {
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

const Questionnaire: React.FC<Props> = ({ onComplete }) => {
  const [form, setForm] = useState<Partial<QuestionnaireData>>({});
  const [submitting, setSubmitting] = useState(false);

  const isText = form.mediaType === "Text";
  const isVideo = form.mediaType === "Video";

  const handleChange = (key: keyof QuestionnaireData, value: string) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (
      !(form.ageGroup && form.country && form.yearsInCountry && 
        form.language && form.mediaType && form.mediaKind && form.mediaHours)
    ) {
      toast({ 
        variant: "destructive", 
        title: "Please fill out all fields." 
      });
      return;
    }

    setSubmitting(true);
    
    // Small delay to show loading state
    setTimeout(() => {
      onComplete(form as QuestionnaireData);
      setSubmitting(false);
    }, 500);
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
            <label className="font-semibold block mb-2">Age group</label>
            <Select 
              value={form.ageGroup || ""} 
              onValueChange={val => handleChange("ageGroup", val)}
            >
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
            <label className="font-semibold block mb-2">Country of current residence</label>
            <Input
              value={form.country || ""}
              onChange={e => handleChange("country", e.target.value)}
              autoComplete="country"
              placeholder="Enter your country"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">How many years have you lived in this country?</label>
            <Select 
              value={form.yearsInCountry || ""} 
              onValueChange={val => handleChange("yearsInCountry", val)}
            >
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
            <label className="font-semibold block mb-2">Primary language used in daily life</label>
            <Input
              value={form.language || ""}
              onChange={e => handleChange("language", e.target.value)}
              autoComplete="language"
              placeholder="Enter your primary language"
              required
            />
          </div>

          <div>
            <label className="font-semibold block mb-2">Which media type do you consume most?</label>
            <Select 
              value={form.mediaType || ""} 
              onValueChange={v => handleChange("mediaType", v)}
            >
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
                <label className="font-semibold block mb-2">What kind? (books, news, forums, etc.)</label>
                <Input
                  value={form.mediaKind || ""}
                  onChange={e => handleChange("mediaKind", e.target.value)}
                  placeholder="e.g., books, news articles, forums"
                  required={isText}
                />
              </div>
              <div>
                <label className="font-semibold block mb-2">Weekly reading time (hours)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.mediaHours || ""}
                  onChange={e => handleChange("mediaHours", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Hours per week"
                  required={isText}
                />
              </div>
            </>
          )}

          {isVideo && (
            <>
              <div>
                <label className="font-semibold block mb-2">What kind? (TV, long YouTube, Shorts, TikTok, etc.)</label>
                <Input
                  value={form.mediaKind || ""}
                  onChange={e => handleChange("mediaKind", e.target.value)}
                  placeholder="e.g., TV shows, YouTube, TikTok"
                  required={isVideo}
                />
              </div>
              <div>
                <label className="font-semibold block mb-2">Weekly viewing time (hours)</label>
                <Input
                  type="number"
                  min={0}
                  max={100}
                  value={form.mediaHours || ""}
                  onChange={e => handleChange("mediaHours", e.target.value.replace(/[^\d]/g, ""))}
                  placeholder="Hours per week"
                  required={isVideo}
                />
              </div>
            </>
          )}
        </form>
      </CardContent>
      <CardFooter>
        <Button 
          type="submit" 
          onClick={handleSubmit}
          className="w-full" 
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Complete Experiment"}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default Questionnaire;
