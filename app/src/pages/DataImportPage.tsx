import { useState, useCallback, useRef } from 'react';
import { useData } from '@/contexts/DataContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import { 
  Upload, FileSpreadsheet, FileText, CheckCircle, AlertCircle, 
  Loader2, Download, Trash2, Database, TrendingUp 
} from 'lucide-react';
import type { Platform, ImportBatch, RevenueData } from '@/types';

const platforms: { value: Platform; label: string; icon: string }[] = [
  { value: 'facebook', label: 'Facebook', icon: '🔵' },
  { value: 'instagram', label: 'Instagram', icon: '📸' },
  { value: 'youtube', label: 'YouTube', icon: '🔴' },
  { value: 'tiktok', label: 'TikTok', icon: '🎵' },
  { value: 'adsense', label: 'AdSense', icon: '📊' },
];

interface ParsedRow {
  [key: string]: string | number | undefined;
}

interface ColumnMapping {
  csvColumn: string;
  field: string;
}

const revenueFields = [
  { value: 'date', label: 'Date', required: true },
  { value: 'revenue', label: 'Revenu', required: true },
  { value: 'impressions', label: 'Impressions', required: false },
  { value: 'clicks', label: 'Clics', required: false },
  { value: 'ctr', label: 'CTR (%)', required: false },
  { value: 'cpm', label: 'CPM', required: false },
  { value: 'estimated_earnings', label: 'Gains estimés', required: false },
];

export default function DataImportPage() {
  const { importBatches, addImportBatch, addRevenueData } = useData();
  const [selectedPlatform, setSelectedPlatform] = useState<Platform>('facebook');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [columns, setColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<ColumnMapping[]>([]);
  const [isParsing, setIsParsing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState<'upload' | 'mapping' | 'preview' | 'importing'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];
    
    if (!allowedTypes.includes(file.type) && !file.name.endsWith('.csv') && !file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      toast.error('Format de fichier non supporté. Veuillez utiliser CSV ou Excel.');
      return;
    }

    setSelectedFile(file);
    setIsParsing(true);
    setCurrentStep('upload');

    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        let parsed: ParsedRow[] = [];
        let cols: string[] = [];

        if (file.name.endsWith('.csv')) {
          const result = Papa.parse(data as string, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
          });
          parsed = result.data as ParsedRow[];
          cols = result.meta.fields || [];
        } else {
          const workbook = XLSX.read(data, { type: 'binary' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          parsed = XLSX.utils.sheet_to_json(firstSheet) as ParsedRow[];
          if (parsed.length > 0) {
            cols = Object.keys(parsed[0]);
          }
        }

        setParsedData(parsed);
        setColumns(cols);
        
        // Auto-map columns based on name similarity
        const autoMappings: ColumnMapping[] = [];
        cols.forEach(col => {
          const lowerCol = col.toLowerCase();
          const matchedField = revenueFields.find(field => 
            lowerCol.includes(field.value.toLowerCase()) ||
            lowerCol.includes(field.label.toLowerCase())
          );
          if (matchedField) {
            autoMappings.push({ csvColumn: col, field: matchedField.value });
          }
        });
        setColumnMappings(autoMappings);
        
        setCurrentStep('mapping');
        toast.success(`${parsed.length} lignes analysées avec succès`);
      } catch (error) {
        toast.error('Erreur lors de l\'analyse du fichier');
        console.error(error);
      } finally {
        setIsParsing(false);
      }
    };

    if (file.name.endsWith('.csv')) {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  }, []);

  const handleMappingChange = useCallback((csvColumn: string, field: string) => {
    setColumnMappings(prev => {
      const filtered = prev.filter(m => m.csvColumn !== csvColumn);
      if (field) {
        filtered.push({ csvColumn, field });
      }
      return filtered;
    });
  }, []);

  const handlePreview = useCallback(() => {
    const dateMapping = columnMappings.find(m => m.field === 'date');
    const revenueMapping = columnMappings.find(m => m.field === 'revenue');
    
    if (!dateMapping || !revenueMapping) {
      toast.error('Veuillez mapper au moins les champs Date et Revenu');
      return;
    }
    
    setCurrentStep('preview');
  }, [columnMappings]);

  const handleImport = useCallback(async () => {
    if (!selectedFile || parsedData.length === 0) return;

    setIsImporting(true);
    setCurrentStep('importing');
    setImportProgress(0);

    const batchId = `batch_${Date.now()}`;
    const batch: ImportBatch = {
      id: batchId,
      platform: selectedPlatform,
      fileName: selectedFile.name,
      fileType: selectedFile.name.endsWith('.csv') ? 'csv' : 'excel',
      rowCount: parsedData.length,
      importedCount: 0,
      status: 'processing',
      createdAt: new Date().toISOString(),
    };

    addImportBatch(batch);

    const revenueData: RevenueData[] = [];
    const errors: string[] = [];

    for (let i = 0; i < parsedData.length; i++) {
      const row = parsedData[i];
      
      try {
        const dateMapping = columnMappings.find(m => m.field === 'date');
        const revenueMapping = columnMappings.find(m => m.field === 'revenue');
        const impressionsMapping = columnMappings.find(m => m.field === 'impressions');
        const clicksMapping = columnMappings.find(m => m.field === 'clicks');
        const ctrMapping = columnMappings.find(m => m.field === 'ctr');
        const cpmMapping = columnMappings.find(m => m.field === 'cpm');
        const estimatedEarningsMapping = columnMappings.find(m => m.field === 'estimated_earnings');

        if (!dateMapping || !revenueMapping) continue;

        const dateValue = row[dateMapping.csvColumn];
        const revenueValue = row[revenueMapping.csvColumn];

        if (!dateValue || !revenueValue) {
          errors.push(`Ligne ${i + 1}: Date ou revenu manquant`);
          continue;
        }

        // Parse date
        let parsedDate: Date;
        if (typeof dateValue === 'string') {
          // Try different date formats
          parsedDate = new Date(dateValue);
          if (isNaN(parsedDate.getTime())) {
            // Try DD/MM/YYYY format
            const parts = dateValue.split(/[\/\-\.]/);
            if (parts.length === 3) {
              parsedDate = new Date(`${parts[2]}-${parts[1]}-${parts[0]}`);
            }
          }
        } else {
          parsedDate = new Date(dateValue);
        }

        if (isNaN(parsedDate.getTime())) {
          errors.push(`Ligne ${i + 1}: Format de date invalide (${dateValue})`);
          continue;
        }

        const revenue = typeof revenueValue === 'string' 
          ? parseFloat(revenueValue.replace(/[^0-9.,]/g, '').replace(',', '.'))
          : revenueValue;

        if (isNaN(revenue)) {
          errors.push(`Ligne ${i + 1}: Revenu invalide (${revenueValue})`);
          continue;
        }

        revenueData.push({
          id: Date.now() + i,
          platform: selectedPlatform,
          date: parsedDate.toISOString().split('T')[0],
          revenue,
          currency: 'EUR',
          impressions: impressionsMapping ? parseInt(String(row[impressionsMapping.csvColumn]) || '0') : undefined,
          clicks: clicksMapping ? parseInt(String(row[clicksMapping.csvColumn]) || '0') : undefined,
          ctr: ctrMapping ? parseFloat(String(row[ctrMapping.csvColumn]) || '0') : undefined,
          cpm: cpmMapping ? parseFloat(String(row[cpmMapping.csvColumn]) || '0') : undefined,
          estimated_earnings: estimatedEarningsMapping ? parseFloat(String(row[estimatedEarningsMapping.csvColumn]) || '0') : undefined,
          source: 'csv',
        });

        setImportProgress(Math.round(((i + 1) / parsedData.length) * 100));
        
        // Simulate processing delay for large datasets
        if (i % 100 === 0) {
          await new Promise(resolve => setTimeout(resolve, 10));
        }
      } catch (error) {
        errors.push(`Ligne ${i + 1}: ${error}`);
      }
    }

    if (revenueData.length > 0) {
      addRevenueData(revenueData);
    }

    const updatedBatch: ImportBatch = {
      ...batch,
      importedCount: revenueData.length,
      status: errors.length > 0 && revenueData.length === 0 ? 'error' : 'completed',
      completedAt: new Date().toISOString(),
      errors: errors.length > 0 ? errors : undefined,
    };

    addImportBatch(updatedBatch);

    setIsImporting(false);
    
    if (revenueData.length > 0) {
      toast.success(`${revenueData.length} revenus importés avec succès !`);
    }
    
    if (errors.length > 0) {
      toast.warning(`${errors.length} erreurs lors de l'import`);
    }

    // Reset form
    setSelectedFile(null);
    setParsedData([]);
    setColumns([]);
    setColumnMappings([]);
    setCurrentStep('upload');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [selectedFile, parsedData, columnMappings, selectedPlatform, addImportBatch, addRevenueData]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setParsedData([]);
    setColumns([]);
    setColumnMappings([]);
    setCurrentStep('upload');
    setImportProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, []);

  const downloadTemplate = useCallback(() => {
    const template = 'Date,Revenu,Impressions,Clics,CTR,CPM,Gains_Estimes\n' +
      '2024-01-01,125.50,15000,250,1.67,8.37,125.50\n' +
      '2024-01-02,98.30,12000,180,1.50,8.19,98.30\n' +
      '2024-01-03,156.80,18000,320,1.78,8.71,156.80\n';
    
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `template_${selectedPlatform}_revenus.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast.success('Template téléchargé');
  }, [selectedPlatform]);

  const getPreviewData = useCallback(() => {
    return parsedData.slice(0, 5).map(row => {
      const mapped: Record<string, unknown> = {};
      columnMappings.forEach(mapping => {
        const fieldLabel = revenueFields.find(f => f.value === mapping.field)?.label || mapping.field;
        mapped[fieldLabel] = row[mapping.csvColumn];
      });
      return mapped;
    });
  }, [parsedData, columnMappings]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Import de données</h1>
        <p className="text-muted-foreground">
          Importez vos données de revenus depuis les fichiers CSV/Excel de Facebook Business, YouTube Studio, etc.
        </p>
      </div>

      <Tabs defaultValue="import" className="space-y-6">
        <TabsList>
          <TabsTrigger value="import">Importer des données</TabsTrigger>
          <TabsTrigger value="history">Historique des imports</TabsTrigger>
        </TabsList>

        <TabsContent value="import" className="space-y-6">
          {/* Step 1: Platform Selection & File Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Upload className="h-5 w-5" />
                Étape 1: Sélection de la plateforme et du fichier
              </CardTitle>
              <CardDescription>
                Choisissez la plateforme et téléchargez votre fichier CSV ou Excel
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="platform">Plateforme</Label>
                  <Select value={selectedPlatform} onValueChange={(v) => setSelectedPlatform(v as Platform)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {platforms.map(p => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className="flex items-center gap-2">
                            <span>{p.icon}</span>
                            <span>{p.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="file">Fichier CSV/Excel</Label>
                  <Input
                    ref={fileInputRef}
                    id="file"
                    type="file"
                    accept=".csv,.xlsx,.xls"
                    onChange={handleFileSelect}
                    disabled={isParsing || isImporting}
                  />
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button variant="outline" onClick={downloadTemplate} className="gap-2">
                  <Download className="h-4 w-4" />
                  Télécharger le template
                </Button>
                
                {selectedFile && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    {selectedFile.name} ({parsedData.length} lignes)
                  </div>
                )}
              </div>

              {isParsing && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyse du fichier en cours...
                </div>
              )}
            </CardContent>
          </Card>

          {/* Step 2: Column Mapping */}
          {currentStep === 'mapping' && columns.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="h-5 w-5" />
                  Étape 2: Mapping des colonnes
                </CardTitle>
                <CardDescription>
                  Associez les colonnes de votre fichier aux champs correspondants
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {columns.map(column => (
                    <div key={column} className="space-y-2">
                      <Label className="text-sm font-medium">{column}</Label>
                      <Select
                        value={columnMappings.find(m => m.csvColumn === column)?.field || ''}
                        onValueChange={(value) => handleMappingChange(column, value)}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Sélectionner un champ..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="">Non mappé</SelectItem>
                          {revenueFields.map(field => (
                            <SelectItem key={field.value} value={field.value}>
                              {field.label} {field.required && <span className="text-red-500">*</span>}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  ))}
                </div>

                <div className="flex gap-2">
                  <Button onClick={handlePreview} className="gap-2">
                    <CheckCircle className="h-4 w-4" />
                    Voir l'aperçu
                  </Button>
                  <Button variant="outline" onClick={handleReset} className="gap-2">
                    <Trash2 className="h-4 w-4" />
                    Réinitialiser
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 3: Preview */}
          {currentStep === 'preview' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  Étape 3: Aperçu des données
                </CardTitle>
                <CardDescription>
                  Vérifiez les données avant l'importation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-md border overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        {columnMappings.map(mapping => (
                          <TableHead key={mapping.csvColumn}>
                            {revenueFields.find(f => f.value === mapping.field)?.label || mapping.field}
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {getPreviewData().map((row, index) => (
                        <TableRow key={index}>
                          {columnMappings.map(mapping => {
                            const fieldLabel = revenueFields.find(f => f.value === mapping.field)?.label || mapping.field;
                            return (
                              <TableCell key={mapping.csvColumn}>
                                {String(row[fieldLabel] || '-')}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>

                <div className="flex items-center gap-4">
                  <Button onClick={handleImport} disabled={isImporting} className="gap-2">
                    {isImporting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Import en cours...
                      </>
                    ) : (
                      <>
                        <TrendingUp className="h-4 w-4" />
                        Importer {parsedData.length} revenus
                      </>
                    )}
                  </Button>
                  <Button variant="outline" onClick={() => setCurrentStep('mapping')} disabled={isImporting}>
                    Retour au mapping
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Step 4: Importing Progress */}
          {currentStep === 'importing' && (
            <Card>
              <CardHeader>
                <CardTitle>Importation en cours</CardTitle>
                <CardDescription>
                  Veuillez patienter pendant l'importation des données...
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Progress value={importProgress} className="w-full" />
                <p className="text-center text-sm text-muted-foreground">
                  {importProgress}% complété
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des imports</CardTitle>
              <CardDescription>
                Consultez l'historique de tous vos imports de données
              </CardDescription>
            </CardHeader>
            <CardContent>
              {importBatches.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Aucun import effectué pour le moment</p>
                </div>
              ) : (
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Plateforme</TableHead>
                        <TableHead>Fichier</TableHead>
                        <TableHead>Lignes</TableHead>
                        <TableHead>Importés</TableHead>
                        <TableHead>Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {importBatches.map(batch => (
                        <TableRow key={batch.id}>
                          <TableCell>
                            {new Date(batch.createdAt).toLocaleDateString('fr-FR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {platforms.find(p => p.value === batch.platform)?.label || batch.platform}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{batch.fileName}</TableCell>
                          <TableCell>{batch.rowCount}</TableCell>
                          <TableCell>{batch.importedCount}</TableCell>
                          <TableCell>
                            {batch.status === 'completed' && (
                              <Badge className="bg-green-100 text-green-800 gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Terminé
                              </Badge>
                            )}
                            {batch.status === 'processing' && (
                              <Badge variant="secondary" className="gap-1">
                                <Loader2 className="h-3 w-3 animate-spin" />
                                En cours
                              </Badge>
                            )}
                            {batch.status === 'error' && (
                              <Badge variant="destructive" className="gap-1">
                                <AlertCircle className="h-3 w-3" />
                                Erreur
                              </Badge>
                            )}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
