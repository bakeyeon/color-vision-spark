import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "@/hooks/use-toast";
import { LogOut, Download } from "lucide-react";
import { type TrialResult } from "./ExperimentPanel";
import { type QuestionnaireData } from "./Questionnaire";
import PasswordChangeDialog from "./PasswordChangeDialog";

interface StoredData {
  questionnaire: QuestionnaireData | null;
  experiment: TrialResult[] | null;
  submitted_at: string;
  page_url: string;
}

interface Props {
  onLogout: () => void;
}

const AdminPanel: React.FC<Props> = ({ onLogout }) => {
  const [data, setData] = useState<StoredData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Check for data in localStorage
    const experimentResults = localStorage.getItem("experimentResults");
    const questionnaireData = localStorage.getItem("questionnaireData");
    
    const storedData: StoredData[] = [];
    
    if (experimentResults || questionnaireData) {
      storedData.push({
        questionnaire: questionnaireData ? JSON.parse(questionnaireData) : null,
        experiment: experimentResults ? JSON.parse(experimentResults) : null,
        submitted_at: new Date().toISOString(),
        page_url: window.location.href
      });
    }

    setData(storedData);
    
    if (storedData.length === 0) {
      toast({
        title: "No Data Found",
        description: "No experiment data found in browser storage.",
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminLoggedIn");
    onLogout();
  };

  const downloadData = () => {
    if (data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No data available to download.",
      });
      return;
    }

    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `experiment-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "Download Started",
      description: "Data has been downloaded as JSON file.",
    });
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel - Experiment Data</h1>
        <div className="flex gap-2">
          <PasswordChangeDialog />
          <Button onClick={downloadData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download Data
          </Button>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Logout
          </Button>
        </div>
      </div>

      {data.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500">
              No experiment data found. Data will appear here when users complete the experiment on this device/browser.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {data.map((entry, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle>Participant {index + 1}</CardTitle>
              </CardHeader>
              <CardContent>
                {entry.questionnaire && (
                  <div className="mb-4">
                    <h3 className="font-semibold mb-2">Questionnaire Data:</h3>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>Age Group:</strong> {entry.questionnaire.ageGroup}</div>
                      <div><strong>Country:</strong> {entry.questionnaire.country}</div>
                      <div><strong>Years in Country:</strong> {entry.questionnaire.yearsInCountry}</div>
                      <div><strong>Language:</strong> {entry.questionnaire.language}</div>
                      <div><strong>Media Type:</strong> {entry.questionnaire.mediaType}</div>
                      <div><strong>Media Kind:</strong> {entry.questionnaire.mediaKind}</div>
                      <div><strong>Media Hours:</strong> {entry.questionnaire.mediaHours}</div>
                    </div>
                  </div>
                )}

                {entry.experiment && (
                  <div>
                    <h3 className="font-semibold mb-2">Experiment Results ({entry.experiment.length} trials):</h3>
                    <div className="overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Trial</TableHead>
                            <TableHead>Estimate</TableHead>
                            <TableHead>Actual</TableHead>
                            <TableHead>Duration (s)</TableHead>
                            <TableHead>Level</TableHead>
                            <TableHead>Subtle</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {entry.experiment.map((trial, i) => (
                            <TableRow key={i}>
                              <TableCell>{i + 1}</TableCell>
                              <TableCell>{trial.estimate}</TableCell>
                              <TableCell>{trial.numBlocks}</TableCell>
                              <TableCell>{trial.duration.toFixed(1)}</TableCell>
                              <TableCell>{trial.level}</TableCell>
                              <TableCell>{trial.subtle ? "Yes" : "No"}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
