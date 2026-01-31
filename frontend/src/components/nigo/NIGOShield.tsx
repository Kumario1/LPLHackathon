import { useState, useCallback } from 'react';
import { Upload, FileText, AlertCircle, CheckCircle, X, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MockService, NIGOIssue } from '@/services/mockData';
import { toast } from 'sonner';

interface UploadedFile {
    file: File;
    status: 'scanning' | 'ok' | 'nigo';
    issues?: NIGOIssue[];
}

export const NIGOShield = () => {
    const [dragActive, setDragActive] = useState(false);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);
    const [selectedIssue, setSelectedIssue] = useState<NIGOIssue | null>(null);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = e.dataTransfer.files;
        if (files && files[0]) {
            const file = files[0];
            setUploadedFile({ file, status: 'scanning' });
            setSelectedIssue(null);

            // Simulate OCR/AI processing
            const result = await MockService.analyzeDocument(file);

            if (result.status === 'NIGO') {
                setUploadedFile({ file, status: 'nigo', issues: result.issues });
                setSelectedIssue(result.issues[0] || null);
            } else {
                setUploadedFile({ file, status: 'ok' });
            }
        }
    }, []);

    const handleFileInput = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files;
        if (files && files[0]) {
            const file = files[0];
            setUploadedFile({ file, status: 'scanning' });
            setSelectedIssue(null);

            const result = await MockService.analyzeDocument(file);

            if (result.status === 'NIGO') {
                setUploadedFile({ file, status: 'nigo', issues: result.issues });
                setSelectedIssue(result.issues[0] || null);
            } else {
                setUploadedFile({ file, status: 'ok' });
            }
        }
    };

    const handleSendCorrectionRequest = () => {
        toast.success('Correction request sent to client!', {
            description: 'An email has been drafted and queued for delivery.',
        });
    };

    const clearUpload = () => {
        setUploadedFile(null);
        setSelectedIssue(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold flex items-center gap-2">
                        <Upload className="h-5 w-5 text-yellow-400" />
                        NIGO Shield
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">
                        AI-powered document validation to catch errors before submission
                    </p>
                </div>
                {uploadedFile && (
                    <Button variant="outline" size="sm" onClick={clearUpload}>
                        <X className="h-4 w-4 mr-2" /> Clear
                    </Button>
                )}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Left: Upload Zone or Preview */}
                <Card className="bg-[#18181b] border-white/15">
                    <CardHeader className="p-4 border-b border-white/10 bg-white/5">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Document Preview
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {!uploadedFile ? (
                            // Drop Zone
                            <div
                                onDragEnter={handleDrag}
                                onDragLeave={handleDrag}
                                onDragOver={handleDrag}
                                onDrop={handleDrop}
                                className={`
                  relative border-2 border-dashed rounded-lg h-[400px]
                  flex flex-col items-center justify-center gap-4 transition-all
                  ${dragActive
                                        ? 'border-primary bg-primary/10'
                                        : 'border-white/20 hover:border-white/40 hover:bg-white/5'
                                    }
                `}
                            >
                                <Upload className={`h-12 w-12 ${dragActive ? 'text-primary' : 'text-muted-foreground'}`} />
                                <div className="text-center">
                                    <p className="font-medium">Drag & drop document here</p>
                                    <p className="text-sm text-muted-foreground mt-1">or click to browse</p>
                                </div>
                                <input
                                    type="file"
                                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                                    onChange={handleFileInput}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                />
                            </div>
                        ) : uploadedFile.status === 'scanning' ? (
                            // Scanning Animation
                            <div className="border border-white/20 rounded-lg h-[400px] flex flex-col items-center justify-center gap-4 bg-white/5">
                                <Loader2 className="h-12 w-12 text-primary animate-spin" />
                                <div className="text-center">
                                    <p className="font-medium">Scanning Document...</p>
                                    <p className="text-sm text-muted-foreground mt-1">AI is analyzing for NIGO issues</p>
                                </div>
                                <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden">
                                    <div className="h-full bg-primary animate-pulse" style={{ width: '60%' }} />
                                </div>
                            </div>
                        ) : (
                            // Document Preview with Error Overlay
                            <div className="border border-white/20 rounded-lg h-[400px] relative overflow-hidden bg-white/5">
                                {/* Simulated PDF Preview */}
                                <div className="absolute inset-0 p-6 flex flex-col">
                                    <div className="bg-white/10 rounded p-4 flex-1 flex flex-col">
                                        <div className="text-xs text-muted-foreground mb-2">Page 3 of 5</div>
                                        <div className="h-4 bg-white/10 rounded w-3/4 mb-2" />
                                        <div className="h-4 bg-white/10 rounded w-1/2 mb-4" />
                                        <div className="h-3 bg-white/5 rounded w-full mb-1" />
                                        <div className="h-3 bg-white/5 rounded w-full mb-1" />
                                        <div className="h-3 bg-white/5 rounded w-4/5 mb-4" />

                                        {/* Signature Line Area */}
                                        <div className="mt-auto flex items-end gap-4">
                                            <div className="flex-1">
                                                <div className="text-xs text-muted-foreground mb-1">Client Signature:</div>
                                                <div className="h-px bg-white/30 w-full relative">
                                                    {/* Error Highlight Box */}
                                                    {uploadedFile.status === 'nigo' && selectedIssue && (
                                                        <div
                                                            className="absolute -top-2 -bottom-2 -left-2 -right-2 border-2 border-red-500 rounded bg-red-500/10 animate-pulse"
                                                            style={{ boxShadow: '0 0 20px rgba(239, 68, 68, 0.3)' }}
                                                        >
                                                            <div className="absolute -top-6 left-0 text-xs text-red-400 font-medium whitespace-nowrap">
                                                                ⚠️ Missing Signature
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                            <div className="w-24">
                                                <div className="text-xs text-muted-foreground mb-1">Date:</div>
                                                <div className="h-4 bg-white/10 rounded w-full" />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* File Info Overlay */}
                                <div className="absolute top-2 right-2">
                                    <Badge className={uploadedFile.status === 'ok' ? 'bg-green-500/15 text-green-500' : 'bg-red-500/15 text-red-500'}>
                                        {uploadedFile.status === 'ok' ? (
                                            <><CheckCircle className="h-3 w-3 mr-1" /> Valid</>
                                        ) : (
                                            <><AlertCircle className="h-3 w-3 mr-1" /> NIGO</>
                                        )}
                                    </Badge>
                                </div>
                            </div>
                        )}

                        {/* File Info */}
                        {uploadedFile && uploadedFile.status !== 'scanning' && (
                            <div className="mt-4 flex items-center gap-3 p-3 bg-white/5 rounded-lg">
                                <FileText className="h-8 w-8 text-muted-foreground" />
                                <div className="flex-1 min-w-0">
                                    <p className="font-medium truncate">{uploadedFile.file.name}</p>
                                    <p className="text-xs text-muted-foreground">
                                        {(uploadedFile.file.size / 1024).toFixed(1)} KB • {uploadedFile.file.type || 'Document'}
                                    </p>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Right: Error Details Sidebar */}
                <Card className="bg-[#18181b] border-white/15">
                    <CardHeader className="p-4 border-b border-white/10 bg-white/5">
                        <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
                            <AlertCircle className="h-4 w-4 text-yellow-400" />
                            Validation Results
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="p-4">
                        {!uploadedFile ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-muted-foreground text-center">
                                <FileText className="h-12 w-12 mb-4 opacity-30" />
                                <p>Upload a document to see validation results</p>
                                <p className="text-sm mt-2">The NIGO Shield will automatically detect:</p>
                                <ul className="text-xs mt-2 space-y-1 text-left">
                                    <li>• Missing signatures</li>
                                    <li>• Incorrect dates</li>
                                    <li>• Missing required fields</li>
                                    <li>• Wrong form versions</li>
                                </ul>
                            </div>
                        ) : uploadedFile.status === 'scanning' ? (
                            <div className="h-[400px] flex items-center justify-center">
                                <p className="text-muted-foreground">Analyzing document...</p>
                            </div>
                        ) : uploadedFile.status === 'ok' ? (
                            <div className="h-[400px] flex flex-col items-center justify-center text-center">
                                <div className="h-16 w-16 rounded-full bg-green-500/20 flex items-center justify-center mb-4">
                                    <CheckCircle className="h-8 w-8 text-green-500" />
                                </div>
                                <p className="font-medium text-green-400">Document Valid</p>
                                <p className="text-sm text-muted-foreground mt-2">No NIGO issues detected. Ready for submission.</p>
                            </div>
                        ) : (
                            <ScrollArea className="h-[400px]">
                                <div className="space-y-4">
                                    {/* Error Count Badge */}
                                    <div className="flex items-center justify-between p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                                        <span className="font-medium text-red-400">Issues Found</span>
                                        <Badge variant="destructive">{uploadedFile.issues?.length || 0}</Badge>
                                    </div>

                                    {/* Error List */}
                                    {uploadedFile.issues?.map((issue, index) => (
                                        <div
                                            key={issue.id}
                                            onClick={() => setSelectedIssue(issue)}
                                            className={`p-4 rounded-lg border cursor-pointer transition-all ${selectedIssue?.id === issue.id
                                                    ? 'bg-red-500/10 border-red-500/50'
                                                    : 'bg-white/5 border-white/10 hover:bg-white/10'
                                                }`}
                                        >
                                            <div className="flex items-start gap-3">
                                                <div className="h-6 w-6 rounded-full bg-red-500/20 flex items-center justify-center shrink-0 mt-0.5">
                                                    <span className="text-xs font-bold text-red-400">{index + 1}</span>
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-red-400">{issue.type.replace('_', ' ')}</p>
                                                    <p className="text-sm text-foreground mt-1">{issue.description}</p>
                                                    <p className="text-xs text-muted-foreground mt-2">Page {issue.page}</p>
                                                    <div className="mt-3 p-2 bg-white/5 rounded text-xs font-mono text-muted-foreground">
                                                        📋 {issue.complianceRule}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Action Button */}
                                    <Button
                                        className="w-full gap-2 mt-4"
                                        onClick={handleSendCorrectionRequest}
                                    >
                                        <Send className="h-4 w-4" />
                                        Send Client Correction Request
                                    </Button>
                                </div>
                            </ScrollArea>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
