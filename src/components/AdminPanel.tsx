import React, { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "@/hooks/use-toast";
import { LogOut, Download, FileText, Users, TrendingUp, Fish } from "lucide-react";
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

const fishGroupNames: Record<number, string> = {
  1: "Blue Marlin",
  2: "Pufferfish",
  3: "Mandarinfish",
  4: "Loach",
  5: "Squid",
  6: "Flatfish",
  7: "Mola mola",
};

const fishGroupEmojis: Record<number, string> = {
  1: "🐟",
  2: "🐡",
  3: "🐠",
  4: "🦠",
  5: "🦑",
  6: "🦦",
  7: "🐡",
};

const AdminPanel: React.FC<Props> = ({ onLogout }) => {
  const [data, setData] = useState<StoredData[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    // Try to load new accumulated dataset
    const datasetRaw = localStorage.getItem("experimentDataset");
    let storedData: StoredData[] = [];
    if (datasetRaw) {
      try {
        const arr = JSON.parse(datasetRaw);
        if (Array.isArray(arr)) {
          // Defensive: ensure all required fields exist, fallback to empty objects
          storedData = arr.map((entry) => ({
            questionnaire: entry.questionnaire ?? null,
            experiment: entry.experiment ?? null,
            submitted_at: entry.submitted_at ?? "",
            page_url: entry.page_url ?? "",
          }));
        }
      } catch {
        storedData = [];
      }
    } else {
      // Backward compatibility: check for older keys, load as single
      const experimentResults = localStorage.getItem("experimentResults");
      const questionnaireData = localStorage.getItem("questionnaireData");
      if (experimentResults || questionnaireData) {
        storedData.push({
          questionnaire: questionnaireData ? JSON.parse(questionnaireData) : null,
          experiment: experimentResults ? JSON.parse(experimentResults) : null,
          submitted_at: new Date().toISOString(),
          page_url: window.location.href
        });
      }
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

  const downloadCSV = () => {
    if (data.length === 0) {
      toast({
        variant: "destructive",
        title: "No Data",
        description: "No data available to download.",
      });
      return;
    }

    const csvRows = [];
    
    // Create CSV Header with T1-T12 columns
    const header = [
      'Participant',
      'Age Group',
      'Country',
      'Years in Country',
      'Language',
      'Media Type',
      'Media Kind',
      'Media Hours'
    ];
    
    // Add T1-T12 Estimate columns
    for (let i = 1; i <= 12; i++) {
      header.push(`T${i} Estimate`);
    }
    
    // Add T1-T12 Actual columns
    for (let i = 1; i <= 12; i++) {
      header.push(`T${i} Actual`);
    }
    
    // Add T1-T12 Duration columns
    for (let i = 1; i <= 12; i++) {
      header.push(`T${i} Duration`);
    }
    
    // Add T1-T12 Level columns
    for (let i = 1; i <= 12; i++) {
      header.push(`T${i} Level`);
    }
    
    header.push('Submitted At');
    csvRows.push(header.join(','));

    // CSV Data - one row per participant
    data.forEach((entry, participantIndex) => {
      const participantNum = participantIndex + 1;
      const q = entry.questionnaire;
      
      const row = [
        participantNum,
        q?.ageGroup || '',
        q?.country || '',
        q?.yearsInCountry || '',
        q?.language || '',
        q?.mediaType || '',
        q?.mediaKind || '',
        q?.mediaHours || ''
      ];
      
      // Initialize arrays for trial data
      const estimates = new Array(12).fill('');
      const actuals = new Array(12).fill('');
      const durations = new Array(12).fill('');
      const levels = new Array(12).fill('');
      
      // Fill in trial data if available
      if (entry.experiment && entry.experiment.length > 0) {
        entry.experiment.forEach((trial, index) => {
          if (index < 12) {
            estimates[index] = trial.estimate;
            actuals[index] = trial.numBlocks;
            durations[index] = trial.duration.toFixed(1);
            levels[index] = trial.level;
          }
        });
      }
      
      // Add all trial data to row
      row.push(...estimates, ...actuals, ...durations, ...levels);
      row.push(entry.submitted_at);
      
      csvRows.push(row.map(field => `"${field}"`).join(','));
    });

    const csvContent = csvRows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `experiment-data-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast({
      title: "CSV Download Started",
      description: "Data has been downloaded as CSV file.",
    });
  };

  // Calculate overview statistics
  const getOverviewStats = () => {
    if (data.length === 0) {
      return {
        totalParticipants: 0,
        averageScore: 0,
        mostUsedMediaType: 'N/A',
        mostCommonFishType: 'N/A',
        mostCommonFishGroup: null as number | null,
      };
    }

    const totalParticipants = data.length;
    
    // Calculate average score (accuracy)
    let totalAccuracy = 0;
    let totalTrials = 0;
    
    data.forEach(entry => {
      if (entry.experiment && entry.experiment.length > 0) {
        entry.experiment.forEach(trial => {
          const accuracy = Math.abs(trial.estimate - trial.numBlocks) / trial.numBlocks;
          totalAccuracy += (1 - accuracy) * 100; // Convert to percentage accuracy
          totalTrials++;
        });
      }
    });
    
    const averageScore = totalTrials > 0 ? totalAccuracy / totalTrials : 0;
    
    // Find most used media type
    const mediaTypeCounts: { [key: string]: number } = {};
    data.forEach(entry => {
      if (entry.questionnaire?.mediaType) {
        mediaTypeCounts[entry.questionnaire.mediaType] = 
          (mediaTypeCounts[entry.questionnaire.mediaType] || 0) + 1;
      }
    });
    
    const mostUsedMediaType = Object.keys(mediaTypeCounts).length > 0 
      ? Object.keys(mediaTypeCounts).reduce((a, b) => 
          mediaTypeCounts[a] > mediaTypeCounts[b] ? a : b
        )
      : 'N/A';

    // Find most common fish type, grouping by 'group' property on experiment[0]
    const groupCounts: Record<number, number> = {};
    data.forEach(entry => {
      // Try to find group value; look for each experiment trial's 'group'
      if (entry.experiment && entry.experiment.length > 0) {
        // Try per trial
        entry.experiment.forEach(trial => {
          if ((trial as any).group) {
            const g = (trial as any).group;
            groupCounts[g] = (groupCounts[g] || 0) + 1;
          }
        });
        // Alternatively, use group on first trial if available
        if ((entry.experiment[0] as any).group) {
          const g = (entry.experiment[0] as any).group;
          groupCounts[g] = (groupCounts[g] || 0) + 1;
        }
      }
    });

    let mostCommonFishGroup: number | null = null;
    let mostCommonFishCount = 0;
    for (const [g, count] of Object.entries(groupCounts)) {
      if (count > mostCommonFishCount) {
        mostCommonFishCount = count;
        mostCommonFishGroup = Number(g);
      }
    }
    const mostCommonFishType =
      mostCommonFishGroup && fishGroupNames[mostCommonFishGroup]
        ? fishGroupNames[mostCommonFishGroup]
        : 'N/A';

    return {
      totalParticipants,
      averageScore: Math.round(averageScore * 10) / 10,
      mostUsedMediaType,
      mostCommonFishType,
      mostCommonFishGroup,
    };
  };

  const overviewStats = getOverviewStats();

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel - Experiment Data</h1>
        <div className="flex gap-2">
          <PasswordChangeDialog />
          <Button onClick={downloadCSV} variant="outline">
            <FileText className="w-4 h-4 mr-2" />
            Download CSV
          </Button>
          <Button onClick={downloadData} variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Download JSON
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
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="data">Data</TabsTrigger>
          </TabsList>
          
          <TabsContent value="overview">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Participants
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.totalParticipants}</div>
                  <p className="text-xs text-muted-foreground">
                    Users who completed the experiment
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Average Accuracy
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.averageScore}%</div>
                  <p className="text-xs text-muted-foreground">
                    Average estimation accuracy
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Used Media
                  </CardTitle>
                  <Fish className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{overviewStats.mostUsedMediaType}</div>
                  <p className="text-xs text-muted-foreground">
                    Most common media type
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Most Common Fish Type
                  </CardTitle>
                  <span className="h-4 w-4 text-lg">
                    {
                      overviewStats.mostCommonFishGroup
                        ? fishGroupEmojis[overviewStats.mostCommonFishGroup] || "🐟"
                        : "🐟"
                    }
                  </span>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {overviewStats.mostCommonFishType}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Most represented “persona group”
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="data">
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
          </TabsContent>
        </Tabs>
      )}
    </div>
  );
};

export default AdminPanel;
