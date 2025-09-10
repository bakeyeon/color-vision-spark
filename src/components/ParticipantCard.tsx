
import React from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

import { type QuestionnaireData } from "./Questionnaire";
import { type TrialResult } from "./ExperimentPanel";

interface StoredData {
  questionnaire: QuestionnaireData | null;
  experiment: TrialResult[] | null;
  colorVocabulary?: any | null;
  colorEmotion?: any | null;
  submitted_at: string;
  page_url: string;
}

interface Props {
  entry: StoredData;
  index: number;
  onDelete: () => void;
}

const ParticipantCard: React.FC<Props> = ({ entry, index, onDelete }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>Participant {index + 1}</CardTitle>
      <Button size="sm" variant="destructive" onClick={onDelete}>
        <Trash2 className="mr-1" size={16} />
        Delete
      </Button>
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

//      {entry.colorVocabulary && (
//        <div className="mb-4">
//          <h3 className="font-semibold mb-2">Color Vocabulary Data:</h3>
//          <div className="grid grid-cols-1 gap-2 text-sm">
//            <div><strong>First Color:</strong> {entry.colorVocabulary.startPoint || 'Not provided'}</div>
//            <div><strong>Second Color:</strong> {entry.colorVocabulary.middlePoint || 'Not provided'}</div>
//            <div><strong>Third Color:</strong> {entry.colorVocabulary.endPoint || 'Not provided'}</div>
//            <div><strong>Category:</strong> {entry.colorVocabulary.category || 'Not provided'}</div>
//          </div>
//        </div>
//      )}

      {entry.colorEmotion && (
        <div className="mb-4">
          <h3 className="font-semibold mb-2">Color Emotion Data:</h3>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div><strong>Blue Emotion:</strong> {entry.colorEmotion.blueEmotion || 'Not provided'}</div>
            <div><strong>Green Emotion:</strong> {entry.colorEmotion.greenEmotion || 'Not provided'}</div>
            <div><strong>Teal Emotion:</strong> {entry.colorEmotion.tealEmotion || 'Not provided'}</div>
            {entry.colorEmotion.selectedImages && (
              <div className="mt-2">
                <strong>Selected Images:</strong>
                <div className="flex gap-2 mt-1">
                  {entry.colorEmotion.selectedImages.blue && (
                    <img src={entry.colorEmotion.selectedImages.blue} alt="Blue" className="w-12 h-12 object-cover rounded border" />
                  )}
                  {entry.colorEmotion.selectedImages.green && (
                    <img src={entry.colorEmotion.selectedImages.green} alt="Green" className="w-12 h-12 object-cover rounded border" />
                  )}
                  {entry.colorEmotion.selectedImages.teal && (
                    <img src={entry.colorEmotion.selectedImages.teal} alt="Teal" className="w-12 h-12 object-cover rounded border" />
                  )}
                </div>
              </div>
            )}
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
);

export default ParticipantCard;
